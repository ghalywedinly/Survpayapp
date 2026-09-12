import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getCurrentUserAndOrg } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";

export default async function VerifyEmailPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) redirect(`/${params.locale}/login`);

  return (
    <AuthShell
      locale={params.locale}
      title={dict.auth.verifyEmailTitle}
      subtitle={`${dict.auth.verifyEmailSubtitle} ${ctx.user.email}`}
    >
      <VerifyEmailPanel
        email={ctx.user.email}
        verified={ctx.user.emailVerified}
        dashboardHref={`/${params.locale}/dashboard`}
      />
    </AuthShell>
  );
}
