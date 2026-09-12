"use client";

import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { Select } from "@/components/ui/input";

interface DemoQuestion {
  id: string;
  text: string;
  textAr: string | null;
  options: { value: string; label: string; labelAr: string | null }[];
}

export function DemographicFilter({
  questions,
  activeQuestionId,
  activeValue,
}: {
  surveyId: string;
  questions: DemoQuestion[];
  activeQuestionId?: string;
  activeValue?: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) ?? questions[0];

  function go(questionId: string, value: string) {
    if (!value) {
      router.push(pathname);
      return;
    }
    router.push(`${pathname}?demo=${questionId}&value=${encodeURIComponent(value)}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        className="h-9 w-44 text-xs"
        value={activeQuestion?.id ?? ""}
        onChange={(e) => go(e.target.value, "")}
      >
        <option value="">{t("analyticsPage.filterByDemographic")}</option>
        {questions.map((q) => (
          <option key={q.id} value={q.id}>
            {locale === "ar" && q.textAr ? q.textAr : q.text}
          </option>
        ))}
      </Select>
      {activeQuestion && (
        <Select className="h-9 w-40 text-xs" value={activeValue ?? ""} onChange={(e) => go(activeQuestion.id, e.target.value)}>
          <option value="">{t("analyticsPage.allRespondents")}</option>
          {activeQuestion.options.map((o) => (
            <option key={o.value} value={o.value}>
              {locale === "ar" && o.labelAr ? o.labelAr : o.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
