"use client";

import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from "@/lib/theme/provider";
import { getStatusColors } from "@/components/charts/theme";
import { CheckCircleIcon } from "@/components/icons";

export interface ResponseQuality {
  total: number;
  valid: number;
  flagged: number;
  rejected: number;
  pending: number;
}

export function ResponseQualityCard({ quality }: { quality: ResponseQuality }) {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const status = getStatusColors(theme === "dark");
  const total = quality.total || 1;

  const segments = [
    { key: "valid", value: quality.valid, color: status.good, label: t("analyticsPage.qualityValid") },
    { key: "flagged", value: quality.flagged, color: status.warning, label: t("analyticsPage.qualityFlagged") },
    { key: "rejected", value: quality.rejected, color: status.critical, label: t("analyticsPage.qualityRejected") },
    { key: "pending", value: quality.pending, color: status.neutral, label: t("analyticsPage.qualityPending") },
  ].filter((s) => s.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <CheckCircleIcon className="h-4 w-4 text-brand-content" />
          {t("analyticsPage.responseQuality")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quality.total === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">{t("analyticsPage.noResponsesYet")}</p>
        ) : (
          <>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink-100" role="img" aria-label={t("analyticsPage.responseQuality")}>
              {segments.map((s) => (
                <div
                  key={s.key}
                  style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
                  className="h-full first:rounded-s-full last:rounded-e-full"
                />
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {segments.map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                  <dt className="text-ink-600">{s.label}</dt>
                  <dd className="ms-auto font-medium text-ink-900">
                    {formatNumber(s.value, locale)}
                    <span className="ms-1 text-xs font-normal text-ink-400">({Math.round((s.value / total) * 1000) / 10}%)</span>
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
