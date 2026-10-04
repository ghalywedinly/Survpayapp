"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/provider";
import type { ClientQuestion } from "@/lib/question-types";
import { questionTypeList, newId } from "@/lib/question-types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CopyIcon, TrashIcon, PlusIcon, XIcon } from "@/components/icons";
import { QuestionSettingsPanel } from "./question-settings-panel";

const chevronUp = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const chevronDown = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function QuestionCanvasCard({
  index,
  question,
  selected,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  allQuestions,
  showInlineAdvanced = false,
}: {
  index: number;
  question: ClientQuestion;
  selected: boolean;
  onSelect: () => void;
  onChange: (q: ClientQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  allQuestions?: ClientQuestion[];
  showInlineAdvanced?: boolean;
}) {
  const t = useT();
  const meta = questionTypeList.find((q) => q.type === question.type)!;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function updateOption(id: string, patch: Partial<ClientQuestion["options"][number]>) {
    onChange({ ...question, options: question.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  }
  function addOption() {
    onChange({
      ...question,
      options: [...question.options, { id: newId("opt"), label: `Option ${question.options.length + 1}`, value: `option_${question.options.length + 1}` }],
    });
  }
  function removeOption(id: string) {
    onChange({ ...question, options: question.options.filter((o) => o.id !== id) });
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-xl border bg-surface p-4 transition-shadow",
        selected ? "border-brand-400 shadow-card ring-2 ring-brand-500/15" : "border-ink-200/70 hover:border-ink-300"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-500">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone="brand" className="shrink-0">
              {t(`builder.${meta.labelKey}`)}
            </Badge>
            {question.isAttentionCheck && <Badge tone="warning">{t("builder.attentionCheck")}</Badge>}
            {question.isDemographic && <Badge tone="info">{t("builder.demographic")}</Badge>}
          </div>
          <Input
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder={t("builder.questionText")}
            className="mt-2 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus:ring-0"
          />

          {meta.hasOptions && (
            <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
              {question.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                  <Input
                    value={o.label}
                    onChange={(e) => updateOption(o.id, { label: e.target.value, value: e.target.value })}
                    className="h-8 text-sm"
                  />
                  {question.options.length > 1 && (
                    <button onClick={() => removeOption(o.id)} className="text-ink-300 hover:text-red-500">
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption} className="flex items-center gap-1 text-xs font-medium text-brand-content hover:text-brand-content">
                <PlusIcon className="h-3.5 w-3.5" />
                {t("builder.addOption")}
              </button>
            </div>
          )}

          {question.type === "matrix" && (
            <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
              {question.matrixRows.map((row, i) => (
                <Input
                  key={i}
                  value={row}
                  onChange={(e) => {
                    const rows = [...question.matrixRows];
                    rows[i] = e.target.value;
                    onChange({ ...question, matrixRows: rows });
                  }}
                  className="h-8 text-sm"
                />
              ))}
              <button
                onClick={() => onChange({ ...question, matrixRows: [...question.matrixRows, `Row ${question.matrixRows.length + 1}`] })}
                className="flex items-center gap-1 text-xs font-medium text-brand-content hover:text-brand-content"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                {t("builder.addOption")}
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <Switch checked={question.required} onCheckedChange={(v) => onChange({ ...question, required: v })} />
              {t("builder.requiredToggle")}
            </label>
            <div className="flex items-center gap-1">
              {showInlineAdvanced && (
                <button
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className={cn(
                    "me-1 rounded-lg px-2 py-1 text-xs font-medium",
                    advancedOpen ? "bg-brand-50 text-brand-content" : "text-ink-400 hover:bg-ink-100"
                  )}
                >
                  {t("builder.questionSettings")}
                </button>
              )}
              {onMoveUp && (
                <button onClick={onMoveUp} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100">
                  {chevronUp}
                </button>
              )}
              {onMoveDown && (
                <button onClick={onMoveDown} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100">
                  {chevronDown}
                </button>
              )}
              <button onClick={onDuplicate} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100" title={t("builder.duplicateQuestion")}>
                <CopyIcon className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-danger-tint hover:text-red-500" title={t("builder.deleteQuestion")}>
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {showInlineAdvanced && advancedOpen && (
            <div className="mt-2 rounded-lg border border-ink-100 bg-ink-50/50" onClick={(e) => e.stopPropagation()}>
              <QuestionSettingsPanel question={question} allQuestions={allQuestions ?? []} onChange={onChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
