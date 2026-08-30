"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { onboardingAction, type ActionState } from "@/lib/auth/actions";
import { useT, useI18n } from "@/lib/i18n/provider";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roles = [
  { value: "researcher", key: "roleResearcher" },
  { value: "marketing", key: "roleMarketing" },
  { value: "product", key: "roleProduct" },
  { value: "academic", key: "roleAcademic" },
  { value: "consultant", key: "roleConsultant" },
  { value: "other", key: "roleOther" },
] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {label}
    </Button>
  );
}

export function OnboardingForm() {
  const t = useT();
  const { locale } = useI18n();
  const [role, setRole] = useState<string>("researcher");
  const [state, formAction] = useFormState<ActionState, FormData>(onboardingAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="role" value={role} />
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t(`auth.${state.error}`)}</p>}

      <div>
        <Label htmlFor="companyName">{t("onboarding.companyLabel")}</Label>
        <Input id="companyName" name="companyName" required placeholder={t("onboarding.companyPlaceholder")} />
      </div>

      <div>
        <Label>{t("onboarding.roleLabel")}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                role === r.value
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-600 hover:border-ink-300"
              )}
            >
              {t(`onboarding.${r.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="useCase">{t("onboarding.useCaseLabel")}</Label>
        <Textarea id="useCase" name="useCase" rows={3} placeholder={t("onboarding.useCasePlaceholder")} />
      </div>

      <SubmitButton label={t("onboarding.finishCta")} />
    </form>
  );
}
