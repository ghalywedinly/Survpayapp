"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency } from "@/lib/format";
import { getRespondentHash, detectDevice } from "@/lib/respondent";
import { SurveyRunner, type RuntimeQuestionWithLogic } from "./survey-runner";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CheckCircleIcon, AlertIcon } from "@/components/icons";

type Phase = "intro" | "running" | "details" | "submitting" | "processing" | "done" | "closed" | "duplicate" | "error";

interface RewardConfigInfo {
  enabled: boolean;
  amount: number;
  currency: string;
  rewardType: "cash" | "gift_card" | "coupon";
}

export function PublicSurveyClient({
  code,
  title,
  titleAr,
  description,
  descriptionAr,
  logoUrl,
  estimatedMinutes,
  questions,
  requireEmail,
  collectFutureConsent,
  reward,
  initiallyClosed,
}: {
  code: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  logoUrl?: string | null;
  estimatedMinutes: number;
  questions: RuntimeQuestionWithLogic[];
  requireEmail: boolean;
  collectFutureConsent: boolean;
  reward: RewardConfigInfo;
  initiallyClosed: boolean;
}) {
  const { t, locale } = useI18n();
  const [phase, setPhase] = useState<Phase>(initiallyClosed ? "closed" : "intro");
  const [answers, setAnswers] = useState<Record<string, unknown> | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [rewardResult, setRewardResult] = useState<{ status?: string; redemptionNote?: string } | null>(null);

  const displayTitle = locale === "ar" && titleAr ? titleAr : title;
  const displayDesc = locale === "ar" && descriptionAr ? descriptionAr : description;
  const needsDetails = requireEmail || collectFutureConsent;

  async function submit(finalAnswers: Record<string, unknown>) {
    setPhase("submitting");
    try {
      const res = await fetch(`/api/public/surveys/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(finalAnswers).map(([questionId, value]) => ({ questionId, value })),
          startedAt,
          respondentHash: getRespondentHash(),
          respondentEmail: email || undefined,
          device: detectDevice(),
          source: typeof document !== "undefined" && document.referrer ? "website" : "share_link",
          futureConsent: collectFutureConsent ? consent : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "DUPLICATE") setPhase("duplicate");
        else if (data.error === "CLOSED") setPhase("closed");
        else setPhase("error");
        return;
      }
      setPhase("processing");
      setTimeout(() => {
        setRewardResult(data.reward);
        setPhase("done");
      }, 900);
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="min-h-screen bg-ink-50/60">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16 pt-4 sm:px-0">
        <div className="rounded-2xl border border-ink-200/70 bg-surface p-6 shadow-card sm:p-8">
          {phase === "closed" && (
            <StateScreen icon={<AlertIcon className="h-8 w-8 text-amber-500" />} title={t("publicSurvey.closedTitle")} body={t("publicSurvey.closedBody")} />
          )}
          {phase === "duplicate" && (
            <StateScreen icon={<AlertIcon className="h-8 w-8 text-amber-500" />} title={t("publicSurvey.duplicateTitle")} body={t("publicSurvey.duplicateBody")} />
          )}
          {phase === "error" && (
            <StateScreen icon={<AlertIcon className="h-8 w-8 text-red-500" />} title={t("publicSurvey.rewardFailedTitle")} body={t("publicSurvey.rewardFailedBody")} />
          )}

          {phase === "intro" && (
            <div>
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="mb-4 h-10 w-10 rounded-lg object-cover" />
              )}
              <h1 className="text-xl font-semibold text-ink-900">{displayTitle}</h1>
              {displayDesc && <p className="mt-2 text-sm leading-relaxed text-ink-500">{displayDesc}</p>}
              <p className="mt-4 text-xs font-medium text-ink-400">
                {t("publicSurvey.estimatedTime")}: {estimatedMinutes} {t("common.minutes")}
              </p>
              {reward.enabled && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint-50 px-3 py-1.5 text-xs font-semibold text-mint-700">
                  {formatCurrency(reward.amount, locale, reward.currency)} · {t("publicSurvey.yourReward")}
                </div>
              )}
              <Button size="lg" className="mt-6 w-full" onClick={() => setPhase(questions.length ? "running" : needsDetails ? "details" : "submitting")}>
                {t("publicSurvey.startSurvey")}
              </Button>
              <p className="mt-4 text-center text-xs text-ink-400">{t("publicSurvey.footerSecure")}</p>
            </div>
          )}

          {phase === "running" && (
            <SurveyRunner
              questions={questions}
              locale={locale}
              labels={{
                next: t("publicSurvey.next"),
                back: t("publicSurvey.back"),
                submit: needsDetails ? t("common.continue") : t("publicSurvey.submit"),
                submitting: t("publicSurvey.submitting"),
                progressLabel: t("publicSurvey.progressLabel"),
                requiredError: t("publicSurvey.requiredError"),
              }}
              onComplete={(a) => {
                setAnswers(a);
                if (needsDetails) setPhase("details");
                else submit(a);
              }}
            />
          )}

          {phase === "details" && (
            <div className="space-y-5">
              {requireEmail && (
                <div>
                  <Label>{t("publicSurvey.emailLabel")}</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <p className="mt-1.5 text-xs text-ink-400">{t("publicSurvey.emailRequiredNote")}</p>
                </div>
              )}
              {collectFutureConsent && (
                <label className="flex items-start gap-3 rounded-xl border border-ink-200 p-4 text-sm text-ink-700">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4" />
                  {t("publicSurvey.consentQuestion")}
                </label>
              )}
              <Button
                className="w-full"
                disabled={requireEmail && !email}
                onClick={() => submit(answers ?? {})}
              >
                {t("publicSurvey.submit")}
              </Button>
            </div>
          )}

          {(phase === "submitting" || phase === "processing") && (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm font-medium text-ink-700">{phase === "processing" ? t("publicSurvey.rewardProcessing") : t("publicSurvey.submitting")}</p>
            </div>
          )}

          {phase === "done" && (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircleIcon className="h-10 w-10 text-mint-500" />
              <p className="mt-4 text-base font-semibold text-ink-900">{t("publicSurvey.thankYouTitle")}</p>

              {reward.enabled && (
                <div className="mt-6 w-full rounded-xl border border-mint-200 bg-mint-50/60 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-mint-700">{t("publicSurvey.yourReward")}</p>
                  <p className="mt-1 text-2xl font-semibold text-mint-800">{formatCurrency(reward.amount, locale, reward.currency)}</p>
                  <p className="mt-3 text-sm font-medium text-mint-700">
                    {rewardResult?.status === "completed" ? t("publicSurvey.rewardReady") : t("publicSurvey.rewardPending")}
                  </p>
                  <p className="mt-1 text-xs text-mint-600">
                    {reward.rewardType === "cash" && t("publicSurvey.redemptionCash")}
                    {reward.rewardType === "gift_card" && t("publicSurvey.redemptionGiftCard")}
                    {reward.rewardType === "coupon" && t("publicSurvey.redemptionCoupon")}
                  </p>
                  {rewardResult?.redemptionNote && (
                    <p className="mt-2 rounded-lg bg-surface px-3 py-2 font-mono text-xs text-ink-600">{rewardResult.redemptionNote}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          {t("publicSurvey.poweredBy")} <span className="font-medium text-ink-600">SurvPay</span>
        </p>
      </main>
    </div>
  );
}

function StateScreen({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {icon}
      <p className="mt-4 text-base font-semibold text-ink-900">{title}</p>
      <p className="mt-1.5 text-sm text-ink-500">{body}</p>
    </div>
  );
}
