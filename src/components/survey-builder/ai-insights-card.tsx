"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { generateInsightsAction } from "@/lib/actions/insights";
import type { AIInsightPayload } from "@/lib/services/ai-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RobotIcon } from "@/components/icons";

export function AIInsightsCard({ surveyId, initial }: { surveyId: string; initial: AIInsightPayload | null }) {
  const { t, locale } = useI18n();
  const [pending, startTransition] = useTransition();
  const [payload, setPayload] = useState<AIInsightPayload | null>(initial);

  function generate() {
    startTransition(async () => {
      const result = await generateInsightsAction(locale, surveyId);
      setPayload(result);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <RobotIcon className="h-4 w-4 text-brand-content" /> {t("analyticsPage.aiSectionTitle")}
          </CardTitle>
          <CardDescription>{t("analyticsPage.aiSectionSubtitle")}</CardDescription>
        </div>
        <Button size="sm" variant="outline" loading={pending} onClick={generate}>
          {payload ? t("analyticsPage.regenerateSummary") : t("analyticsPage.generateSummary")}
        </Button>
      </CardHeader>
      <CardContent>
        {pending ? (
          <p className="py-6 text-center text-sm text-ink-400">{t("analyticsPage.generating")}</p>
        ) : !payload ? (
          <p className="py-6 text-center text-sm text-ink-400">{t("analyticsPage.notGeneratedYet")}</p>
        ) : !payload.hasData ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-ink-700">{t("analyticsPage.noDataTitle")}</p>
            <p className="mt-1 text-sm text-ink-400">{t("analyticsPage.noDataBody")}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {payload.isDemo && <Badge tone="warning">{t("analyticsPage.demoInsightLabel")}</Badge>}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{t("analyticsPage.keyInsights")}</p>
              <ol className="space-y-3">
                {payload.insights.map((ins, i) => (
                  <li key={i} className="rounded-xl bg-ink-50 p-4">
                    <p className="text-sm font-semibold text-ink-900">
                      {i + 1}. {locale === "ar" ? ins.titleAr : ins.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-600">{locale === "ar" ? ins.bodyAr : ins.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            {payload.recommendation && (
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                <p className="text-sm font-semibold text-brand-content">{t("analyticsPage.recommendation")}</p>
                <p className="mt-1 text-sm text-brand-content">{locale === "ar" ? payload.recommendation.bodyAr : payload.recommendation.body}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
