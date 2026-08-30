"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { Logo } from "@/components/brand/logo";
import { SurveyRunner, type RuntimeQuestionWithLogic } from "@/components/survey-runtime/survey-runner";
import { cn } from "@/lib/utils";
import { CheckCircleIcon } from "@/components/icons";

export function PreviewShell({
  surveyId,
  title,
  titleAr,
  description,
  descriptionAr,
  estimatedMinutes,
  questions,
}: {
  surveyId: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  estimatedMinutes: number;
  questions: RuntimeQuestionWithLogic[];
}) {
  const { t, locale } = useI18n();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const displayTitle = locale === "ar" && titleAr ? titleAr : title;
  const displayDesc = locale === "ar" && descriptionAr ? descriptionAr : description;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-xl bg-ink-100 p-1">
          <button
            onClick={() => setDevice("desktop")}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", device === "desktop" ? "bg-surface shadow-soft" : "text-ink-500")}
          >
            {t("preview.desktopView")}
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", device === "mobile" ? "bg-surface shadow-soft" : "text-ink-500")}
          >
            {t("preview.mobileView")}
          </button>
        </div>
        <Link href={`/${locale}/surveys/${surveyId}`} className="text-sm font-medium text-ink-500 hover:text-ink-800">
          {t("preview.exitPreview")}
        </Link>
      </div>

      <div className="flex justify-center rounded-2xl bg-ink-100/60 p-6 sm:p-10">
        <div className={cn("w-full rounded-2xl border border-ink-200 bg-surface shadow-pop transition-all", device === "mobile" ? "max-w-sm" : "max-w-2xl")}>
          <div className="border-b border-ink-100 p-6">
            <Logo size={20} />
            <h1 className="mt-4 text-xl font-semibold text-ink-900">{displayTitle}</h1>
            {displayDesc && <p className="mt-2 text-sm text-ink-500">{displayDesc}</p>}
            <p className="mt-3 text-xs font-medium text-ink-400">
              {t("publicSurvey.estimatedTime")}: {estimatedMinutes} {t("common.minutes")}
            </p>
          </div>

          <div className="p-6">
            {done ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircleIcon className="h-10 w-10 text-mint-500" />
                <p className="mt-4 text-base font-semibold text-ink-900">{t("publicSurvey.thankYouTitle")}</p>
                <button onClick={() => { setDone(false); setStarted(false); }} className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700">
                  {t("preview.title")} ↻
                </button>
              </div>
            ) : !started ? (
              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {t("publicSurvey.startSurvey")}
              </button>
            ) : questions.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-400">{t("builder.emptyCanvasBody")}</p>
            ) : (
              <SurveyRunner
                questions={questions}
                locale={locale}
                labels={{
                  next: t("publicSurvey.next"),
                  back: t("publicSurvey.back"),
                  submit: t("publicSurvey.submit"),
                  submitting: t("publicSurvey.submitting"),
                  progressLabel: t("publicSurvey.progressLabel"),
                  requiredError: t("publicSurvey.requiredError"),
                }}
                onComplete={() => setDone(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
