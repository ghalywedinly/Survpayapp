"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "all", key: "tabAll" },
  { value: "draft", key: "tabDraft" },
  { value: "active", key: "tabActive" },
  { value: "completed", key: "tabCompleted" },
  { value: "archived", key: "tabArchived" },
] as const;

export function SurveysTabs({ activeTab }: { activeTab: string }) {
  const { t, locale } = useI18n();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-ink-100 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`/${locale}/surveys${tab.value === "all" ? "" : `?tab=${tab.value}`}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.value ? "bg-surface text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-800"
          )}
        >
          {t(`surveys.${tab.key}`)}
        </Link>
      ))}
    </div>
  );
}
