"use client";

import { useT } from "@/lib/i18n/provider";
import { questionTypeList, type ClientQuestion } from "@/lib/question-types";
import { Label, Textarea, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function QuestionSettingsPanel({
  question,
  allQuestions,
  onChange,
}: {
  question: ClientQuestion | null;
  allQuestions: ClientQuestion[];
  onChange: (q: ClientQuestion) => void;
}) {
  const t = useT();

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-400">
        {t("builder.selectQuestion")}
      </div>
    );
  }

  const priorQuestions = allQuestions.filter((q) => q.id !== question.id);
  const conditionSource = priorQuestions.find((q) => q.id === question.conditionQuestionId);

  return (
    <div className="space-y-6 p-4">
      <div>
        <Label>{t("builder.questionDescription")}</Label>
        <Textarea
          rows={2}
          value={question.description ?? ""}
          onChange={(e) => onChange({ ...question, description: e.target.value })}
        />
      </div>

      <div className="space-y-3 border-t border-ink-100 pt-4">
        <label className="flex items-center justify-between text-sm font-medium text-ink-700">
          {t("builder.attentionCheck")}
          <Switch checked={question.isAttentionCheck} onCheckedChange={(v) => onChange({ ...question, isAttentionCheck: v })} />
        </label>
        {question.isAttentionCheck && question.options.length > 0 && (
          <Select
            value={question.attentionExpected ?? ""}
            onChange={(e) => onChange({ ...question, attentionExpected: e.target.value })}
          >
            <option value="">—</option>
            {question.options.map((o) => (
              <option key={o.id} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}

        <label className="flex items-center justify-between text-sm font-medium text-ink-700">
          {t("builder.demographic")}
          <Switch checked={question.isDemographic} onCheckedChange={(v) => onChange({ ...question, isDemographic: v })} />
        </label>
      </div>

      <div className="space-y-3 border-t border-ink-100 pt-4">
        <p className="text-sm font-medium text-ink-700">{t("builder.conditionalLogic")}</p>
        <p className="text-xs text-ink-400">{t("builder.conditionalLogicDesc")}</p>
        <Select
          value={question.conditionQuestionId ?? ""}
          onChange={(e) =>
            onChange({
              ...question,
              conditionQuestionId: e.target.value || null,
              conditionOperator: e.target.value ? question.conditionOperator ?? "equals" : null,
              conditionValue: e.target.value ? question.conditionValue : null,
            })
          }
        >
          <option value="">{t("builder.noCondition")}</option>
          {priorQuestions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.text || t(`builder.${questionTypeList.find((qt) => qt.type === q.type)?.labelKey ?? "typeShortText"}`)}
            </option>
          ))}
        </Select>

        {question.conditionQuestionId && (
          <>
            <Select
              value={question.conditionOperator ?? "equals"}
              onChange={(e) => onChange({ ...question, conditionOperator: e.target.value as ClientQuestion["conditionOperator"] })}
            >
              <option value="equals">{t("builder.conditionEquals")}</option>
              <option value="not_equals">{t("builder.conditionNotEquals")}</option>
              <option value="any_of">{t("builder.conditionAnyOf")}</option>
            </Select>
            {conditionSource && conditionSource.options.length > 0 ? (
              <Select value={question.conditionValue ?? ""} onChange={(e) => onChange({ ...question, conditionValue: e.target.value })}>
                <option value="">—</option>
                {conditionSource.options.map((o) => (
                  <option key={o.id} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                value={question.conditionValue ?? ""}
                onChange={(e) => onChange({ ...question, conditionValue: e.target.value })}
                placeholder="yes / no"
                className="flex h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
