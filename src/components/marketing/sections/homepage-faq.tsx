"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function HomepageFaq() {
  const { t } = useI18n();
  const keys = ["homepageFaq1", "homepageFaq2", "homepageFaq3", "homepageFaq4", "homepageFaq5", "homepageFaq6", "homepageFaq7", "homepageFaq8"];

  return (
    <section id="faq" className="bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {t("marketing.homepageFaqTitle")}
        </h2>
        <div className="mt-10 space-y-3">
          {keys.map((key) => (
            <FaqItem key={key} question={t(`marketing.${key}q`)} answer={t(`marketing.${key}a`)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-ink-200 bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-start text-sm font-medium text-ink-900"
      >
        {question}
        <ChevronDownIcon className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-ink-500">{answer}</p>}
    </div>
  );
}
