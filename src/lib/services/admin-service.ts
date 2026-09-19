import { db } from "@/lib/db";

// Platform-owner queries — the only place in the codebase that deliberately
// reads across every organization at once. Every other service filters by
// organizationId as a hard rule; this file is the one, narrow exception,
// and it's reachable only through requirePlatformAdmin() (src/lib/auth/
// guards.ts), never from anything a researcher's session can hit.

export const AdminService = {
  async getOverview() {
    const since30d = new Date(Date.now() - 30 * 86400_000);
    const [
      totalOrganizations,
      totalUsers,
      totalSurveys,
      publishedSurveys,
      totalResponses,
      totalValidResponses,
      rewardAgg,
      subscriptionAgg,
      newOrgs30d,
      newUsers30d,
      planRows,
    ] = await Promise.all([
      db.organization.count(),
      db.user.count({ where: { role: { not: "platform_admin" } } }),
      db.survey.count(),
      db.survey.count({ where: { status: { in: ["active", "closed", "scheduled"] } } }),
      db.surveyResponse.count(),
      db.surveyResponse.count({ where: { status: "valid" } }),
      db.rewardTransaction.aggregate({ where: { type: "reward", status: "completed" }, _sum: { amount: true } }),
      db.paymentTransaction.aggregate({ where: { purpose: "subscription" }, _sum: { amount: true } }),
      db.organization.count({ where: { createdAt: { gte: since30d } } }),
      db.user.count({ where: { role: { not: "platform_admin" }, createdAt: { gte: since30d } } }),
      db.organization.groupBy({ by: ["plan"], _count: { _all: true } }),
    ]);

    const planBreakdown = Object.fromEntries(planRows.map((r) => [r.plan, r._count._all]));

    return {
      totalOrganizations,
      totalUsers,
      totalSurveys,
      publishedSurveys,
      totalResponses,
      totalValidResponses,
      totalRewardsDistributed: rewardAgg._sum.amount ?? 0,
      totalSubscriptionRevenue: subscriptionAgg._sum.amount ?? 0,
      newOrgs30d,
      newUsers30d,
      planBreakdown,
    };
  },

  async listOrganizations() {
    const [orgs, memberCounts, surveyCounts, rewardSpend, lastSurveyActivity] = await Promise.all([
      db.organization.findMany({ orderBy: { createdAt: "desc" } }),
      db.organizationMember.groupBy({ by: ["organizationId"], _count: { _all: true } }),
      db.survey.groupBy({ by: ["organizationId"], _count: { _all: true } }),
      db.rewardBudget.groupBy({ by: ["organizationId"], _sum: { distributedAmount: true, fundedAmount: true } }),
      db.survey.groupBy({ by: ["organizationId"], _max: { createdAt: true } }),
    ]);

    const memberMap = new Map(memberCounts.map((r) => [r.organizationId, r._count._all]));
    const surveyMap = new Map(surveyCounts.map((r) => [r.organizationId, r._count._all]));
    const spendMap = new Map(rewardSpend.map((r) => [r.organizationId, r._sum.distributedAmount ?? 0]));
    const fundedMap = new Map(rewardSpend.map((r) => [r.organizationId, r._sum.fundedAmount ?? 0]));
    const activityMap = new Map(lastSurveyActivity.map((r) => [r.organizationId, r._max.createdAt]));

    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      industry: org.industry,
      country: org.country,
      plan: org.plan,
      createdAt: org.createdAt,
      memberCount: memberMap.get(org.id) ?? 0,
      surveyCount: surveyMap.get(org.id) ?? 0,
      totalFunded: fundedMap.get(org.id) ?? 0,
      totalRewardSpend: spendMap.get(org.id) ?? 0,
      lastActivityAt: activityMap.get(org.id) ?? org.createdAt,
    }));
  },

  async listUsers() {
    const users = await db.user.findMany({
      where: { role: { not: "platform_admin" } },
      include: { memberships: { include: { organization: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      locale: u.locale,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      organization: u.memberships[0]?.organization ?? null,
      orgRole: u.memberships[0]?.role ?? null,
    }));
  },

  async getParticipantStats() {
    const [total, valid, flagged, rejected, byCountry, byDevice, bySource] = await Promise.all([
      db.surveyResponse.count(),
      db.surveyResponse.count({ where: { status: "valid" } }),
      db.surveyResponse.count({ where: { status: "flagged" } }),
      db.surveyResponse.count({ where: { status: "rejected" } }),
      db.surveyResponse.groupBy({ by: ["country"], where: { country: { not: null } }, _count: { _all: true } }),
      db.surveyResponse.groupBy({ by: ["device"], where: { device: { not: null } }, _count: { _all: true } }),
      db.surveyResponse.groupBy({ by: ["source"], where: { source: { not: null } }, _count: { _all: true } }),
    ]);

    function top<T extends { _count: { _all: number } }>(rows: T[], keyOf: (r: T) => string | null, n = 6) {
      return rows
        .map((r) => ({ label: keyOf(r) ?? "unknown", count: r._count._all }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
    }

    return {
      total,
      valid,
      flagged,
      rejected,
      topCountries: top(byCountry, (r) => r.country),
      topDevices: top(byDevice, (r) => r.device),
      topSources: top(bySource, (r) => r.source),
    };
  },

  async listRecentResponses(limit = 50) {
    const rows = await db.surveyResponse.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { survey: { select: { title: true, titleAr: true, organization: { select: { name: true } } } } },
    });
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      rewardStatus: r.rewardStatus,
      country: r.country,
      device: r.device,
      source: r.source,
      createdAt: r.createdAt,
      surveyTitle: r.survey.title,
      organizationName: r.survey.organization.name,
    }));
  },

  async listRecentActivity(limit = 20) {
    const [orgs, surveys, subs] = await Promise.all([
      db.organization.findMany({ orderBy: { createdAt: "desc" }, take: limit, select: { id: true, name: true, createdAt: true } }),
      db.survey.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: { id: true, title: true, publishedAt: true, organization: { select: { name: true } } },
      }),
      db.paymentTransaction.findMany({
        where: { purpose: "subscription" },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { organization: { select: { name: true } } },
      }),
    ]);

    type Event = { at: Date; kind: "signup" | "survey_published" | "subscription"; label: string; detail: string };
    const events: Event[] = [
      ...orgs.map((o) => ({ at: o.createdAt, kind: "signup" as const, label: o.name, detail: "Organization registered" })),
      ...surveys.map((s) => ({ at: s.publishedAt!, kind: "survey_published" as const, label: s.organization.name, detail: `Published "${s.title}"` })),
      ...subs.map((p) => ({ at: p.createdAt, kind: "subscription" as const, label: p.organization?.name ?? "—", detail: `Subscription payment · SAR ${p.amount.toFixed(2)}` })),
    ];

    return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
  },
};
