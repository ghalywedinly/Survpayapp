import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default function SignupPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return (
    <AuthShell locale={params.locale} title={dict.auth.signupTitle} subtitle={dict.auth.signupSubtitle}>
      <SignupForm />
    </AuthShell>
  );
}
