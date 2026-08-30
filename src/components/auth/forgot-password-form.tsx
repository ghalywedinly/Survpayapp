"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction, type ActionState } from "@/lib/auth/actions";
import { useT, useI18n } from "@/lib/i18n/provider";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {label}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const t = useT();
  const { locale } = useI18n();
  const [state, formAction] = useFormState<ActionState, FormData>(forgotPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-mint-50 px-3 py-2.5 text-sm text-mint-700">{t("auth.resetLinkSent")}</p>
        {state.devLink && (
          <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-3 text-xs text-ink-500">
            <p className="font-medium text-ink-700">Demo mode</p>
            <p className="mt-1">No email provider is connected in this environment, so here is your reset link directly:</p>
            <Link href={state.devLink} className="mt-1.5 block break-all font-medium text-brand-600 hover:text-brand-700">
              {state.devLink}
            </Link>
          </div>
        )}
        <Link href={`/${locale}/login`} className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
          {t("auth.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </div>
      <SubmitButton label={t("auth.sendResetLink")} />
      <Link href={`/${locale}/login`} className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
        {t("auth.backToLogin")}
      </Link>
    </form>
  );
}
