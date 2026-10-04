"use client";

import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface RuntimeOption {
  id: string;
  label: string;
  labelAr?: string | null;
  value: string;
}

export interface RuntimeQuestion {
  id: string;
  type: string;
  text: string;
  textAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  required: boolean;
  options: RuntimeOption[];
  matrixRows: string[];
}

function optLabel(o: RuntimeOption, locale: Locale) {
  return locale === "ar" && o.labelAr ? o.labelAr : o.label;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  locale,
  index,
  error,
}: {
  question: RuntimeQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  locale: Locale;
  index: number;
  error?: string;
}) {
  const text = locale === "ar" && question.textAr ? question.textAr : question.text;
  const description = locale === "ar" && question.descriptionAr ? question.descriptionAr : question.description;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-content">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-base font-medium leading-relaxed text-ink-900">
            {text}
            {question.required && <span className="ms-1 text-red-500">*</span>}
          </p>
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}

          <div className="mt-4">
            <QuestionInput question={question} value={value} onChange={onChange} locale={locale} />
          </div>
          {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  locale,
}: {
  question: RuntimeQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  locale: Locale;
}) {
  switch (question.type) {
    case "single_choice":
    case "dropdown":
      return (
        <div className="space-y-2">
          {question.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors",
                value === o.value ? "border-brand-500 bg-brand-50 text-brand-content" : "border-ink-200 text-ink-700 hover:border-ink-300"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  value === o.value ? "border-brand-600" : "border-ink-300"
                )}
              >
                {value === o.value && <span className="h-2 w-2 rounded-full bg-brand-600" />}
              </span>
              {optLabel(o, locale)}
            </button>
          ))}
        </div>
      );

    case "multiple_choice": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {question.options.map((o) => {
            const checked = arr.includes(o.value);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onChange(checked ? arr.filter((v) => v !== o.value) : [...arr, o.value])}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors",
                  checked ? "border-brand-500 bg-brand-50 text-brand-content" : "border-ink-200 text-ink-700 hover:border-ink-300"
                )}
              >
                <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border-2", checked ? "border-brand-600 bg-brand-600" : "border-ink-300")}>
                  {checked && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {optLabel(o, locale)}
              </button>
            );
          })}
        </div>
      );
    }

    case "short_text":
      return (
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      );

    case "long_text":
      return (
        <textarea
          rows={4}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full max-w-xs rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      );

    case "yes_no":
      return (
        <div className="flex gap-3">
          {[
            { v: "yes", label: locale === "ar" ? "نعم" : "Yes" },
            { v: "no", label: locale === "ar" ? "لا" : "No" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                value === opt.v ? "border-brand-500 bg-brand-50 text-brand-content" : "border-ink-200 text-ink-700 hover:border-ink-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );

    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                Number(value) >= n ? "border-amber-400 bg-amber-50 text-amber-content" : "border-ink-200 text-ink-400 hover:border-ink-300"
              )}
            >
              ★
            </button>
          ))}
        </div>
      );

    case "nps":
      return (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }, (_, n) => n).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                value === n ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      );

    case "likert":
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {question.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-xl border px-3 py-3 text-center text-xs font-medium transition-colors",
                value === o.value ? "border-brand-500 bg-brand-50 text-brand-content" : "border-ink-200 text-ink-600 hover:border-ink-300"
              )}
            >
              {optLabel(o, locale)}
            </button>
          ))}
        </div>
      );

    case "ranking": {
      const order = Array.isArray(value) && value.length ? (value as string[]) : question.options.map((o) => o.value);
      function moveItem(i: number, dir: -1 | 1) {
        const next = [...order];
        const j = i + dir;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
      }
      return (
        <div className="space-y-2">
          {order.map((val, i) => {
            const o = question.options.find((opt) => opt.value === val);
            return (
              <div key={val} className="flex items-center gap-3 rounded-xl border border-ink-200 px-4 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">{i + 1}</span>
                <span className="flex-1 text-sm text-ink-700">{o ? optLabel(o, locale) : val}</span>
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => moveItem(i, -1)} className="rounded-md px-1.5 py-1 text-ink-400 hover:bg-ink-100 disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" disabled={i === order.length - 1} onClick={() => moveItem(i, 1)} className="rounded-md px-1.5 py-1 text-ink-400 hover:bg-ink-100 disabled:opacity-30">
                    ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "matrix": {
      const matrixValue = (value as Record<string, string>) ?? {};
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr>
                <th />
                {question.options.map((o) => (
                  <th key={o.id} className="px-2 pb-2 text-center text-xs font-medium text-ink-500">
                    {optLabel(o, locale)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.matrixRows.map((row) => (
                <tr key={row} className="border-t border-ink-100">
                  <td className="py-2.5 pe-3 text-ink-700">{row}</td>
                  {question.options.map((o) => (
                    <td key={o.id} className="text-center">
                      <button
                        type="button"
                        onClick={() => onChange({ ...matrixValue, [row]: o.value })}
                        className={cn(
                          "mx-auto flex h-5 w-5 items-center justify-center rounded-full border-2",
                          matrixValue[row] === o.value ? "border-brand-600" : "border-ink-300"
                        )}
                      >
                        {matrixValue[row] === o.value && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}
