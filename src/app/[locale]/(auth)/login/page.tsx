import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return (
    <AuthShell locale={params.locale} title={dict.auth.loginTitle} subtitle={dict.auth.loginSubtitle}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
