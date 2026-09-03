"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { QuestionRenderer, type RuntimeQuestion } from "./question-renderer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface RuntimeQuestionWithLogic extends RuntimeQuestion {
  conditionQuestionId?: string | null;
  conditionOperator?: string | null;
  conditionValue?: string | null;
}

function isVisible(q: RuntimeQuestionWithLogic, answers: Record<string, unknown>) {
  if (!q.conditionQuestionId || !q.conditionOperator) return true;
  const answer = answers[q.conditionQuestionId];
  const target = q.conditionValue ?? "";
  const answerStr = Array.isArray(answer) ? answer.join(",") : String(answer ?? "");
  switch (q.conditionOperator) {
    case "equals":
      return answerStr === target;
    case "not_equals":
      return answerStr !== target;
    case "any_of":
      return target.split(",").includes(answerStr);
    default:
      return true;
  }
}

export function SurveyRunner({
  questions,
  locale,
  labels,
  onComplete,
  submitting,
}: {
  questions: RuntimeQuestionWithLogic[];
  locale: Locale;
  labels: { next: string; back: string; submit: string; submitting: string; progressLabel: string; requiredError: string };
  onComplete: (answers: Record<string, unknown>) => void;
  submitting?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const visibleQuestions = useMemo(() => questions.filter((q) => isVisible(q, answers)), [questions, answers]);
  const current = visibleQuestions[cursor];
  const isLast = cursor === visibleQuestions.length - 1;
  const progress = visibleQuestions.length ? ((cursor + 1) / visibleQuestions.length) * 100 : 0;

  function setAnswer(id: string, value: unknown) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  }

  function isEmpty(value: unknown) {
    return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  }

  function next() {
    if (current?.required && isEmpty(answers[current.id])) {
      setError(labels.requiredError);
      return;
    }
    if (isLast) {
      onComplete(answers);
      return;
    }
    setCursor((c) => c + 1);
  }

  function back() {
    setError(null);
    setCursor((c) => Math.max(0, c - 1));
  }

  if (!current) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="shrink-0 text-xs font-medium text-ink-400">
          {labels.progressLabel} {cursor + 1}/{visibleQuestions.length}
        </span>
      </div>

      <QuestionRenderer
        question={current}
        value={answers[current.id]}
        onChange={(v) => setAnswer(current.id, v)}
        locale={locale}
        index={cursor}
        error={error ?? undefined}
      />

      <div className={cn("mt-8 flex items-center", cursor > 0 ? "justify-between" : "justify-end")}>
        {cursor > 0 && (
          <Button variant="outline" onClick={back} disabled={submitting}>
            {labels.back}
          </Button>
        )}
        <Button onClick={next} loading={submitting}>
          {isLast ? (submitting ? labels.submitting : labels.submit) : labels.next}
        </Button>
      </div>
    </div>
  );
}
