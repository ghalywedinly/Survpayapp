"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signupAction, type ActionState } from "@/lib/auth/actions";
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

export function SignupForm() {
  const t = useT();
  const { locale } = useI18n();
  const [state, formAction] = useFormState<ActionState, FormData>(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {state?.error && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger-content">{t(`auth.${state.error}`)}</p>}
      <div>
        <Label htmlFor="name">{t("auth.fullName")}</Label>
        <Input id="name" name="name" type="text" required autoComplete="name" placeholder="Sara Al-Otaibi" />
      </div>
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </div>
      <div>
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
      </div>
      <SubmitButton label={t("auth.signupCta")} />
      <p className="text-center text-xs text-ink-400">
        {t("auth.agreeTerms")}{" "}
        <Link href={`/${locale}/terms`} className="underline hover:text-ink-600">
          {t("auth.termsOfService")}
        </Link>{" "}
        {t("auth.and")}{" "}
        <Link href={`/${locale}/privacy`} className="underline hover:text-ink-600">
          {t("auth.privacyPolicy")}
        </Link>
        .
      </p>
      <p className="text-center text-sm text-ink-500">
        {t("auth.haveAccount")}{" "}
        <Link href={`/${locale}/login`} className="font-medium text-brand-content hover:text-brand-content">
          {t("auth.loginCta")}
        </Link>
      </p>
    </form>
  );
}
