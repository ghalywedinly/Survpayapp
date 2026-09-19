import { requirePlatformAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Locale } from "@/lib/i18n/config";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const ctx = await requirePlatformAdmin(params.locale);
  return <AdminShell adminName={ctx.user.name}>{children}</AdminShell>;
}
