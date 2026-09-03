import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default function ForgotPasswordPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return (
    <AuthShell locale={params.locale} title={dict.auth.forgotPasswordTitle} subtitle={dict.auth.forgotPasswordSubtitle}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
