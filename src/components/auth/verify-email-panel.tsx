"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyEmailAction } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function VerifyEmailPanel({ email, verified, dashboardHref }: { email: string; verified: boolean; dashboardHref: string }) {
  const t = useT();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  if (verified) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-mint-50 px-3 py-2.5 text-sm text-mint-content">✓ {email}</p>
        <Button size="lg" className="w-full" onClick={() => router.push(dashboardHref)}>
          {t("auth.continueToApp")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-3 text-xs text-ink-500">
        Demo mode — no email provider is connected in this environment. Use the button below to simulate confirming the
        verification link.
      </div>
      <Button
        size="lg"
        className="w-full"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            await verifyEmailAction();
            router.refresh();
          })
        }
      >
        {t("auth.verifyEmailCta")}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => push({ title: t("auth.resendEmail"), description: "Verification email simulated." })}
      >
        {t("auth.resendEmail")}
      </Button>
    </div>
  );
}
