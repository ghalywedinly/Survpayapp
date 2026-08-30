"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type ActionState } from "@/lib/auth/actions";
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

export function LoginForm() {
  const t = useT();
  const { locale } = useI18n();
  const params = useSearchParams();
  const [state, formAction] = useFormState<ActionState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {params.get("reset") === "1" && (
        <p className="rounded-lg bg-mint-50 px-3 py-2 text-sm text-mint-700">{t("auth.passwordUpdated")}</p>
      )}
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t(`auth.${state.error}`)}</p>}
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Link href={`/${locale}/forgot-password`} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            {t("auth.forgotPassword")}
          </Link>
        </div>
        <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      <SubmitButton label={t("auth.loginCta")} />
      <p className="text-center text-sm text-ink-500">
        {t("auth.noAccount")}{" "}
        <Link href={`/${locale}/signup`} className="font-medium text-brand-600 hover:text-brand-700">
          {t("auth.signUpFree")}
        </Link>
      </p>
    </form>
  );
}
