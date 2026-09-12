import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getCurrentUserAndOrg } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

export default async function OnboardingPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) redirect(`/${params.locale}/login`);
  if (ctx.organization) redirect(`/${params.locale}/dashboard`);

  return (
    <AuthShell locale={params.locale} title={dict.onboarding.title} subtitle={dict.onboarding.subtitle}>
      <OnboardingForm />
    </AuthShell>
  );
}
