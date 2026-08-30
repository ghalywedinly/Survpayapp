"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const toneMap: Record<string, "neutral" | "brand" | "success" | "warning" | "danger" | "info"> = {
  draft: "neutral",
  scheduled: "info",
  active: "success",
  paused: "warning",
  completed: "brand",
  closed: "neutral",
  archived: "neutral",
};

const labelKey: Record<string, string> = {
  draft: "statusDraft",
  scheduled: "statusScheduled",
  active: "statusActive",
  paused: "statusPaused",
  completed: "statusCompleted",
  closed: "statusClosed",
  archived: "statusArchived",
};

export function SurveyStatusBadge({ status }: { status: string }) {
  const t = useT();
  return (
    <Badge tone={toneMap[status] ?? "neutral"} dot>
      {t(`surveys.${labelKey[status] ?? "statusDraft"}`)}
    </Badge>
  );
}

export function surveyStatusLabel(status: string, locale: Locale) {
  const dict = getDictionary(locale);
  const key = (labelKey[status] ?? "statusDraft") as keyof typeof dict.surveys;
  return dict.surveys[key] as string;
}
