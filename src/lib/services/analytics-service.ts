import { db } from "@/lib/db";

export const AnalyticsService = {
  async getDashboardMetrics(organizationId: string) {
    const [activeSurveys, totalResponses, rewardAgg, spendAgg, surveys] = await Promise.all([
      db.survey.count({ where: { organizationId, status: "active" } }),
      db.surveyResponse.count({ where: { survey: { organizationId } } }),
      db.rewardTransaction.aggregate({
        where: { type: "reward", status: "completed", budget: { organizationId } },
        _sum: { amount: true },
      }),
      db.paymentTransaction.aggregate({
        where: { organizationId, purpose: "incentive_funding" },
        _sum: { amount: true },
      }),
      db.survey.findMany({ where: { organizationId }, include: { _count: { select: { responses: true } } } }),
    ]);

    const completionRates = await Promise.all(
      surveys.map(async (s) => {
        const [total, valid] = await Promise.all([
          db.surveyResponse.count({ where: { surveyId: s.id } }),
          db.surveyResponse.count({ where: { surveyId: s.id, status: "valid" } }),
        ]);
        return total > 0 ? valid / total : null;
      })
    );
    const validRates = completionRates.filter((r): r is number => r !== null);
    const avgCompletionRate = validRates.length ? validRates.reduce((a, b) => a + b, 0) / validRates.length : 0;

    return {
      activeSurveys,
      totalResponses,
      rewardsDistributed: rewardAgg._sum.amount ?? 0,
      researchSpend: spendAgg._sum.amount ?? 0,
      avgCompletionRate: avgCompletionRate * 100,
    };
  },

  async responsesOverTime(organizationId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const responses = await db.surveyResponse.findMany({
      where: { survey: { organizationId }, createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of responses) {
      const key = r.createdAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  },

  async responsesByChannel(organizationId: string) {
    const rows = await db.surveyResponse.groupBy({
      by: ["source"],
      where: { survey: { organizationId } },
      _count: { _all: true },
    });
    return rows.map((r) => ({ source: r.source ?? "share_link", count: r._count._all }));
  },

  async topCountries(organizationId: string, limit = 5) {
    const rows = await db.surveyResponse.groupBy({
      by: ["country"],
      where: { survey: { organizationId }, country: { not: null } },
      _count: { _all: true },
    });
    const total = rows.reduce((sum, r) => sum + r._count._all, 0) || 1;
    return rows
      .map((r) => ({ country: r.country as string, count: r._count._all, pct: Math.round((r._count._all / total) * 1000) / 10 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  async topSurveys(organizationId: string, limit = 5) {
    const surveys = await db.survey.findMany({
      where: { organizationId },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: "desc" },
    });
    const withRates = await Promise.all(
      surveys.map(async (s) => {
        const valid = await db.surveyResponse.count({ where: { surveyId: s.id, status: "valid" } });
        const total = s._count.responses;
        return { ...s, completionRate: total > 0 ? (valid / total) * 100 : 0 };
      })
    );
    return withRates.sort((a, b) => b._count.responses - a._count.responses).slice(0, limit);
  },

  async getSurveyOverview(surveyId: string) {
    const [total, valid, agg, rewardAgg, budget] = await Promise.all([
      db.surveyResponse.count({ where: { surveyId } }),
      db.surveyResponse.count({ where: { surveyId, status: "valid" } }),
      db.surveyResponse.aggregate({ where: { surveyId, completionSeconds: { not: null } }, _avg: { completionSeconds: true } }),
      db.rewardTransaction.aggregate({ where: { type: "reward", status: "completed", budget: { surveyId } }, _sum: { amount: true } }),
      db.rewardBudget.findUnique({ where: { surveyId } }),
    ]);
    const rewardSpend = rewardAgg._sum.amount ?? 0;
    return {
      totalResponses: total,
      completionRate: total > 0 ? (valid / total) * 100 : 0,
      avgCompletionSeconds: Math.round(agg._avg.completionSeconds ?? 0),
      rewardSpend,
      costPerResponse: total > 0 ? rewardSpend / total : 0,
      budget,
    };
  },

  async getQuestionBreakdown(surveyId: string, filter?: { questionId: string; value: string }) {
    let allowedResponseIds: Set<string> | null = null;
    if (filter) {
      const matches = await db.responseAnswer.findMany({
        where: { questionId: filter.questionId },
        select: { responseId: true, value: true },
      });
      allowedResponseIds = new Set(
        matches.filter((m) => safeParse(m.value) === filter.value).map((m) => m.responseId)
      );
    }

    const questions = await db.question.findMany({
      where: { surveyId },
      include: { options: { orderBy: { order: "asc" } }, answers: true },
      orderBy: { order: "asc" },
    });

    return questions.map((q) => {
      const scopedAnswers = allowedResponseIds ? q.answers.filter((a) => allowedResponseIds!.has(a.responseId)) : q.answers;
      const values = scopedAnswers.map((a) => safeParse(a.value));
      if (["single_choice", "dropdown", "yes_no", "multiple_choice"].includes(q.type)) {
        const counts = new Map<string, number>();
        for (const v of values) {
          const arr = Array.isArray(v) ? v : [v];
          for (const item of arr) {
            const key = String(item);
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
        }
        const totalAnswers = values.length || 1;
        const optionLabels = q.options.length
          ? q.options.map((o) => ({ value: o.value, label: o.label, labelAr: o.labelAr }))
          : Array.from(counts.keys()).map((k) => ({ value: k, label: k, labelAr: k }));
        const distribution = optionLabels.map((o) => ({
          label: o.label,
          labelAr: o.labelAr ?? o.label,
          count: counts.get(o.value) ?? 0,
          pct: Math.round(((counts.get(o.value) ?? 0) / totalAnswers) * 1000) / 10,
        }));
        return { question: q, kind: "categorical" as const, distribution, responseCount: values.length };
      }

      if (["rating", "nps", "number", "likert"].includes(q.type)) {
        const nums = values.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
        const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        const counts = new Map<number, number>();
        for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
        const distribution = Array.from(counts.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([value, count]) => ({ label: String(value), labelAr: String(value), count, pct: nums.length ? Math.round((count / nums.length) * 1000) / 10 : 0 }));
        return { question: q, kind: "numeric" as const, average: Math.round(avg * 100) / 100, distribution, responseCount: values.length };
      }

      // text types
      const samples = values.filter((v): v is string => typeof v === "string" && v.length > 0).slice(0, 8);
      return { question: q, kind: "text" as const, samples, responseCount: values.length };
    });
  },
};

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
