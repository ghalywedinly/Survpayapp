import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { token?: string };
}) {
  const dict = getDictionary(params.locale);
  return (
    <AuthShell locale={params.locale} title={dict.auth.resetPasswordTitle} subtitle={dict.auth.resetPasswordSubtitle}>
      <ResetPasswordForm token={searchParams.token ?? ""} />
    </AuthShell>
  );
}
