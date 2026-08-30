"use client";

import { useMemo, useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency } from "@/lib/format";
import { platformFeePct } from "@/lib/pricing";
import type { ClientQuestion } from "@/lib/question-types";
import { createBlankQuestion, newId } from "@/lib/question-types";
import { createSurveyAction, type WizardPayload } from "@/lib/actions/surveys";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { WizardStepper } from "./wizard-stepper";
import { QuestionCanvasCard } from "../question-canvas-card";
import { QuestionTypePicker } from "../question-type-picker";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ListIcon } from "@/components/icons";

type WizardState = Omit<WizardPayload, "locale" | "publish">;

const initialState: WizardState = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  objective: "",
  estimatedMinutes: 5,
  questions: [],
  reward: { enabled: true, amount: 10, currency: "SAR", rewardType: "cash", maxResponses: 200 },
  settings: {
    responseLimit: null,
    startDate: null,
    endDate: null,
    anonymousResponses: true,
    requireEmail: false,
    preventDuplicates: true,
    captchaEnabled: true,
    collectFutureConsent: false,
  },
};

export function SurveyWizard() {
  const { t, locale } = useI18n();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const steps = [t("wizard.step1Title"), t("wizard.step2Title"), t("wizard.step3Title"), t("wizard.step4Title"), t("wizard.step5Title")];

  const budget = useMemo(() => {
    const incentiveBudget = state.reward.amount * state.reward.maxResponses;
    const fee = Math.round(incentiveBudget * platformFeePct * 100) / 100;
    return { incentiveBudget, fee, total: incentiveBudget + fee };
  }, [state.reward]);

  function updateQuestion(q: ClientQuestion) {
    setState((s) => ({ ...s, questions: s.questions.map((x) => (x.id === q.id ? q : x)) }));
  }
  function addQuestion() {
    const q = createBlankQuestion("single_choice");
    setState((s) => ({ ...s, questions: [...s.questions, q] }));
    setSelectedQuestionId(q.id);
  }
  function removeQuestion(id: string) {
    setState((s) => ({ ...s, questions: s.questions.filter((q) => q.id !== id) }));
  }
  function duplicateQuestion(id: string) {
    setState((s) => {
      const idx = s.questions.findIndex((q) => q.id === id);
      if (idx === -1) return s;
      const copy: ClientQuestion = { ...s.questions[idx], id: newId(), options: s.questions[idx].options.map((o) => ({ ...o, id: newId("opt") })) };
      const next = [...s.questions];
      next.splice(idx + 1, 0, copy);
      return { ...s, questions: next };
    });
  }
  function move(id: string, dir: -1 | 1) {
    setState((s) => {
      const idx = s.questions.findIndex((q) => q.id === id);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= s.questions.length) return s;
      const next = [...s.questions];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return { ...s, questions: next };
    });
  }

  function submit(publish: boolean) {
    if (!state.title.trim()) {
      push({ title: t("auth.errorGeneric"), tone: "error" });
      setStep(0);
      return;
    }
    setPendingAction(publish ? "publish" : "draft");
    startTransition(async () => {
      try {
        const result = await createSurveyAction(locale, { ...state, locale, publish });
        // A full navigation here is deliberate: it guarantees a clean landing
        // on the new survey's page immediately after a multi-step mutation,
        // without relying on the router's transition state resolving.
        window.location.assign(`/${locale}/surveys/${result.id}`);
      } catch {
        setPendingAction(null);
        push({ title: t("auth.errorGeneric"), tone: "error" });
      }
    });
  }

  return (
    <div>
      <Card className="p-5">
        <WizardStepper steps={steps} current={step} />
      </Card>

      <Card className="mt-6 p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{t("wizard.step1Title")}</h2>
              <p className="mt-1 text-sm text-ink-500">{t("wizard.step1Subtitle")}</p>
            </div>
            <div>
              <Label htmlFor="title">{t("wizard.surveyTitle")}</Label>
              <Input id="title" value={state.title} onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))} placeholder={t("wizard.surveyTitlePlaceholder")} />
            </div>
            <div>
              <Label htmlFor="titleAr">{t("wizard.surveyTitle")} (العربية)</Label>
              <Input id="titleAr" dir="rtl" value={state.titleAr} onChange={(e) => setState((s) => ({ ...s, titleAr: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="description">{t("wizard.surveyDescription")}</Label>
              <Textarea id="description" rows={2} value={state.description} onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))} placeholder={t("wizard.surveyDescriptionPlaceholder")} />
            </div>
            <div>
              <Label htmlFor="objective">{t("wizard.objective")}</Label>
              <Textarea id="objective" rows={2} value={state.objective} onChange={(e) => setState((s) => ({ ...s, objective: e.target.value }))} placeholder={t("wizard.objectivePlaceholder")} />
            </div>
            <div className="max-w-xs">
              <Label htmlFor="estimatedMinutes">{t("wizard.estimatedTime")}</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min={1}
                value={state.estimatedMinutes}
                onChange={(e) => setState((s) => ({ ...s, estimatedMinutes: Number(e.target.value) }))}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">{t("wizard.step2Title")}</h2>
                <p className="mt-1 text-sm text-ink-500">{t("wizard.step2Subtitle")}</p>
              </div>
              <QuestionTypePicker onPick={(type) => { const q = createBlankQuestion(type); setState((s) => ({ ...s, questions: [...s.questions, q] })); setSelectedQuestionId(q.id); }} />
            </div>

            <div className="mt-5 space-y-3">
              {state.questions.length === 0 ? (
                <EmptyState icon={<ListIcon className="h-6 w-6" />} title={t("builder.emptyCanvasTitle")} body={t("builder.emptyCanvasBody")} />
              ) : (
                state.questions.map((q, i) => (
                  <QuestionCanvasCard
                    key={q.id}
                    index={i}
                    question={q}
                    selected={selectedQuestionId === q.id}
                    onSelect={() => setSelectedQuestionId(q.id)}
                    onChange={updateQuestion}
                    onDuplicate={() => duplicateQuestion(q.id)}
                    onDelete={() => removeQuestion(q.id)}
                    onMoveUp={i > 0 ? () => move(q.id, -1) : undefined}
                    onMoveDown={i < state.questions.length - 1 ? () => move(q.id, 1) : undefined}
                    allQuestions={state.questions}
                    showInlineAdvanced
                  />
                ))
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{t("wizard.step3Title")}</h2>
              <p className="mt-1 text-sm text-ink-500">{t("wizard.step3Subtitle")}</p>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
              <span className="text-sm font-medium text-ink-800">{t("wizard.rewardToggleLabel")}</span>
              <Switch checked={state.reward.enabled} onCheckedChange={(v) => setState((s) => ({ ...s, reward: { ...s.reward, enabled: v } }))} />
            </label>

            {state.reward.enabled && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="space-y-5 lg:col-span-3">
                  <div>
                    <Label>{t("wizard.rewardAmount")} (SAR)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={state.reward.amount}
                      onChange={(e) => setState((s) => ({ ...s, reward: { ...s.reward, amount: Number(e.target.value) } }))}
                    />
                  </div>
                  <div>
                    <Label>{t("wizard.rewardType")}</Label>
                    <Select
                      value={state.reward.rewardType}
                      onChange={(e) => setState((s) => ({ ...s, reward: { ...s.reward, rewardType: e.target.value as typeof s.reward.rewardType } }))}
                    >
                      <option value="cash">{t("wizard.rewardTypeCash")}</option>
                      <option value="gift_card">{t("wizard.rewardTypeGiftCard")}</option>
                      <option value="coupon">{t("wizard.rewardTypeCoupon")}</option>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("wizard.maxResponses")}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={state.reward.maxResponses}
                      onChange={(e) => setState((s) => ({ ...s, reward: { ...s.reward, maxResponses: Number(e.target.value) } }))}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-5 lg:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{t("wizard.maxBudget")}</p>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">{formatCurrency(budget.incentiveBudget, locale)}</p>
                  <div className="mt-4 space-y-2 border-t border-ink-200 pt-3 text-sm">
                    <div className="flex justify-between text-ink-500">
                      <span>{t("wizard.platformFee")}</span>
                      <span className="font-medium text-ink-700">{formatCurrency(budget.fee, locale)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-ink-900">
                      <span>{t("wizard.estimatedTotal")}</span>
                      <span>{formatCurrency(budget.total, locale)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{t("wizard.step4Title")}</h2>
              <p className="mt-1 text-sm text-ink-500">{t("wizard.step4Subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>{t("wizard.responseLimit")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={state.settings.responseLimit ?? ""}
                  onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, responseLimit: e.target.value ? Number(e.target.value) : null } }))}
                  placeholder={t("common.optional")}
                />
              </div>
              <div />
              <div>
                <Label>{t("wizard.startDate")}</Label>
                <Input type="date" value={state.settings.startDate ?? ""} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, startDate: e.target.value || null } }))} />
              </div>
              <div>
                <Label>{t("wizard.endDate")}</Label>
                <Input type="date" value={state.settings.endDate ?? ""} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, endDate: e.target.value || null } }))} />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-ink-200 p-4">
              {[
                { key: "anonymousResponses" as const, label: t("wizard.anonymousResponses") },
                { key: "requireEmail" as const, label: t("wizard.requireEmail") },
                { key: "preventDuplicates" as const, label: t("wizard.preventDuplicates") },
                { key: "captchaEnabled" as const, label: t("wizard.captchaEnabled") },
                { key: "collectFutureConsent" as const, label: t("wizard.collectFutureConsent") },
              ].map((row) => (
                <label key={row.key} className="flex items-center justify-between text-sm text-ink-700">
                  {row.label}
                  <Switch
                    checked={state.settings[row.key]}
                    onCheckedChange={(v) => setState((s) => ({ ...s, settings: { ...s.settings, [row.key]: v } }))}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{t("wizard.step5Title")}</h2>
              <p className="mt-1 text-sm text-ink-500">{t("wizard.step5Subtitle")}</p>
            </div>

            <div className="rounded-xl border border-ink-200 p-5">
              <h3 className="font-semibold text-ink-900">{state.title || t("wizard.surveyTitlePlaceholder")}</h3>
              {state.description && <p className="mt-1 text-sm text-ink-500">{state.description}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
                <Row label={t("wizard.summaryQuestions")} value={String(state.questions.length)} />
                <Row label={t("wizard.summaryDuration")} value={`${state.estimatedMinutes} ${t("common.minutes")}`} />
                <Row label={t("wizard.summaryTarget")} value={state.reward.enabled ? String(state.reward.maxResponses) : "—"} />
                <Row label={t("wizard.summaryReward")} value={state.reward.enabled ? formatCurrency(state.reward.amount, locale) : t("common.no")} />
                <Row label={t("wizard.summaryBudget")} value={state.reward.enabled ? formatCurrency(budget.incentiveBudget, locale) : "—"} />
                <Row label={t("wizard.summaryFee")} value={state.reward.enabled ? formatCurrency(budget.fee, locale) : "—"} />
              </dl>
              {state.reward.enabled && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3">
                  <span className="text-sm font-medium text-brand-800">{t("wizard.summaryTotalCost")}</span>
                  <span className="text-lg font-semibold text-brand-800">{formatCurrency(budget.total, locale)}</span>
                </div>
              )}
            </div>

            {state.reward.enabled && <p className="text-xs text-ink-400">{t("wizard.publishNote")}</p>}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          {t("common.back")}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" loading={pendingAction === "draft"} disabled={pending} onClick={() => submit(false)}>
            {t("common.saveDraft")}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>{t("common.next")}</Button>
          ) : (
            <Button loading={pendingAction === "publish"} disabled={pending} onClick={() => submit(true)}>
              {t("wizard.publishCta")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}
