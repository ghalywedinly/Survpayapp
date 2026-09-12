import { requireOrgContext } from "@/lib/auth/guards";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  const [members, sessions, currentSession] = await Promise.all([
    db.organizationMember.findMany({
      where: { organizationId: ctx.organization.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.session.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: "desc" } }),
    getCurrentSession(),
  ]);

  let notificationPrefs: Record<string, boolean> = {};
  try {
    notificationPrefs = ctx.user.notificationPrefs ? JSON.parse(ctx.user.notificationPrefs) : {};
  } catch {
    notificationPrefs = {};
  }

  return (
    <div>
      <PageHeader title={dict.settings.title} />
      <SettingsClient
        profile={{ name: ctx.user.name, email: ctx.user.email, phone: ctx.user.phone ?? "", locale: (ctx.user.locale as Locale) ?? params.locale }}
        organization={{ name: ctx.organization.name, industry: ctx.organization.industry ?? "", logoUrl: ctx.organization.logoUrl }}
        members={members.map((m) => ({
          id: m.id,
          role: m.role,
          status: m.status,
          userName: m.user?.name ?? null,
          invitedEmail: m.invitedEmail,
        }))}
        notificationPrefs={notificationPrefs}
        sessions={sessions.map((s) => ({
          id: s.id,
          current: s.id === currentSession?.id,
          userAgent: s.userAgent,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
        }))}
      />
    </div>
  );
}
