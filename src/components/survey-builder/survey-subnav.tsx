"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Tab = "overview" | "edit" | "preview" | "distribution" | "responses" | "analytics" | "reports" | "budget";

export function SurveySubnav({ surveyId, active }: { surveyId: string; active: Tab }) {
  const { t, locale } = useI18n();
  const base = `/${locale}/surveys/${surveyId}`;

  const tabs: { key: Tab; href: string; label: string }[] = [
    { key: "overview", href: base, label: t("common.viewDetails") },
    { key: "edit", href: `${base}/edit`, label: t("surveys.actionEdit") },
    { key: "preview", href: `${base}/preview`, label: t("surveys.actionPreview") },
    { key: "distribution", href: `${base}/distribution`, label: t("distribution.title") },
    { key: "responses", href: `${base}/responses`, label: t("nav.responses") },
    { key: "analytics", href: `${base}/analytics`, label: t("nav.analytics") },
    { key: "reports", href: `${base}/reports`, label: t("nav.reports") },
    { key: "budget", href: `${base}/budget`, label: t("rewards.title") },
  ];

  return (
    <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b border-ink-100 px-1 pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active === tab.key ? "border-brand-600 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-800"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
