"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction, type ActionState } from "@/lib/auth/actions";
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

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT();
  const { locale } = useI18n();
  const [state, formAction] = useFormState<ActionState, FormData>(resetPasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger-content">{t(`auth.${state.error}`)}</p>}
      <div>
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <SubmitButton label={t("auth.setNewPassword")} />
    </form>
  );
}
