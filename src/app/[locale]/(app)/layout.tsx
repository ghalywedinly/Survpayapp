import { requireOrgContext } from "@/lib/auth/guards";
import { NotificationService } from "@/lib/services/notification-service";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Locale } from "@/lib/i18n/config";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const ctx = await requireOrgContext(params.locale);
  const [notifications, unreadCount] = await Promise.all([
    NotificationService.listForOrg(ctx.organization.id, 15),
    NotificationService.unreadCount(ctx.organization.id),
  ]);

  return (
    <DashboardShell
      orgName={ctx.organization.name}
      plan={ctx.organization.plan}
      userName={ctx.user.name}
      userEmail={ctx.user.email}
      notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
