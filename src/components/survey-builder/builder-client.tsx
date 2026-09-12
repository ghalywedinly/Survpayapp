"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import type { ClientQuestion } from "@/lib/question-types";
import { createBlankQuestion, newId } from "@/lib/question-types";
import { updateSurveyQuestionsAction, publishSurveyAction } from "@/lib/actions/surveys";
import { QuestionCanvasCard } from "./question-canvas-card";
import { QuestionSettingsPanel } from "./question-settings-panel";
import { QuestionTypePicker } from "./question-type-picker";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { ListIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function BuilderClient({ surveyId, initialQuestions, status }: { surveyId: string; initialQuestions: ClientQuestion[]; status: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [questions, setQuestions] = useState<ClientQuestion[]>(initialQuestions);
  const [selectedId, setSelectedId] = useState<string | null>(initialQuestions[0]?.id ?? null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  function update(q: ClientQuestion) {
    setQuestions((qs) => qs.map((x) => (x.id === q.id ? q : x)));
    setDirty(true);
  }

  function save(showToast = false) {
    startTransition(async () => {
      await updateSurveyQuestionsAction(locale, surveyId, questions);
      setDirty(false);
      if (showToast) push({ title: t("builder.autosaved"), tone: "success" });
    });
  }

  // Debounced autosave
  useEffect(() => {
    if (!dirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(false), 1800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  function addQuestion() {
    const q = createBlankQuestion("single_choice");
    setQuestions((qs) => [...qs, q]);
    setSelectedId(q.id);
    setDirty(true);
  }
  function duplicate(id: string) {
    setQuestions((qs) => {
      const idx = qs.findIndex((q) => q.id === id);
      if (idx === -1) return qs;
      const copy: ClientQuestion = { ...qs[idx], id: newId(), options: qs[idx].options.map((o) => ({ ...o, id: newId("opt") })) };
      const next = [...qs];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setDirty(true);
  }
  function remove(id: string) {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  }
  function move(id: string, dir: -1 | 1) {
    setQuestions((qs) => {
      const idx = qs.findIndex((q) => q.id === id);
      const j = idx + dir;
      if (idx === -1 || j < 0 || j >= qs.length) return qs;
      const next = [...qs];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    setDirty(true);
  }

  async function handlePublish() {
    const result = await publishSurveyAction(locale, surveyId);
    if (result.ok) {
      push({ title: t("wizard.publishSuccess"), tone: "success" });
      router.refresh();
    } else if (result.error === "BUDGET_NOT_FUNDED") {
      push({ title: t("wizard.publishNote"), tone: "error" });
    } else {
      push({ title: t("auth.errorGeneric"), tone: "error" });
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-ink-400">{pending ? t("builder.saving") : dirty ? "" : t("builder.autosaved")}</p>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/surveys/${surveyId}/preview`} className="inline-flex">
            <Button variant="outline" size="sm">
              {t("common.preview")}
            </Button>
          </Link>
          <Button variant="outline" size="sm" loading={pending} onClick={() => save(true)}>
            {t("common.save")}
          </Button>
          {status === "draft" && (
            <Button size="sm" onClick={handlePublish}>
              {t("common.publish")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_280px]">
        <div className="hidden rounded-2xl border border-ink-200/70 bg-surface p-3 lg:block">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t("builder.pages")}</p>
          </div>
          <div className="space-y-1">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                className={cn(
                  "flex w-full items-center gap-2 truncate rounded-lg px-2.5 py-1.5 text-start text-xs font-medium",
                  selectedId === q.id ? "bg-brand-50 text-brand-content" : "text-ink-500 hover:bg-ink-50"
                )}
              >
                <span className="shrink-0 text-ink-300">{i + 1}.</span>
                <span className="truncate">{q.text || "Untitled question"}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 px-1">
            <QuestionTypePicker onPick={(type) => { const q = createBlankQuestion(type); setQuestions((qs) => [...qs, q]); setSelectedId(q.id); setDirty(true); }} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-end lg:hidden">
            <QuestionTypePicker onPick={(type) => { const q = createBlankQuestion(type); setQuestions((qs) => [...qs, q]); setSelectedId(q.id); setDirty(true); }} />
          </div>
          {questions.length === 0 ? (
            <EmptyState icon={<ListIcon className="h-6 w-6" />} title={t("builder.emptyCanvasTitle")} body={t("builder.emptyCanvasBody")} action={<Button onClick={addQuestion}>{t("wizard.addQuestion")}</Button>} />
          ) : (
            questions.map((q, i) => (
              <QuestionCanvasCard
                key={q.id}
                index={i}
                question={q}
                selected={selectedId === q.id}
                onSelect={() => setSelectedId(q.id)}
                onChange={update}
                onDuplicate={() => duplicate(q.id)}
                onDelete={() => remove(q.id)}
                onMoveUp={i > 0 ? () => move(q.id, -1) : undefined}
                onMoveDown={i < questions.length - 1 ? () => move(q.id, 1) : undefined}
              />
            ))
          )}
        </div>

        <div className="hidden rounded-2xl border border-ink-200/70 bg-surface lg:block">
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t("builder.questionSettings")}</p>
          </div>
          <QuestionSettingsPanel question={selected} allQuestions={questions} onChange={update} />
        </div>
      </div>
    </div>
  );
}
