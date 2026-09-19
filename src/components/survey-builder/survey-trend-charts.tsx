"use client";

import { useI18n } from "@/lib/i18n/provider";
import { formatDate, formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { categoricalPalette } from "@/components/charts/theme";
import { TrendingUpIcon } from "@/components/icons";
import type { BreakdownRow } from "./breakdown-list-card";

export function SurveyResponseTrendCard({ data }: { data: { date: string; count: number }[] }) {
  const { t, locale } = useI18n();
  const total = data.reduce((s, d) => s + d.count, 0);
  const chartData = data.map((d) => ({ label: formatDate(d.date, locale, { month: "short", day: "numeric" }), value: d.count }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <TrendingUpIcon className="h-4 w-4 text-brand-content" />
            {t("analyticsPage.responseTrend")}
          </CardTitle>
          <p className="mt-1 text-xs text-ink-400">{t("analyticsPage.responseTrendSubtitle")}</p>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState title={t("analyticsPage.noResponsesYet")} className="py-10" />
        ) : (
          <MiniAreaChart data={chartData} height={240} />
        )}
      </CardContent>
    </Card>
  );
}

const deviceLabelKey: Record<string, string> = {
  mobile: "deviceMobile",
  desktop: "deviceDesktop",
  tablet: "deviceTablet",
};

export function DeviceBreakdownCard({ rows }: { rows: BreakdownRow[] }) {
  const { t, locale } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("analyticsPage.byDevice")}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title={t("analyticsPage.noResponsesYet")} className="py-6" />
        ) : (
          <div className="flex items-center gap-6">
            <DonutChart data={rows.map((r) => ({ label: t(`analyticsPage.${deviceLabelKey[r.key] ?? "deviceUnknown"}`), value: r.count }))} size={120} />
            <ul className="flex-1 space-y-2.5">
              {rows.map((r, i) => (
                <li key={r.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-600">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: categoricalPalette[i % categoricalPalette.length] }} />
                    {t(`analyticsPage.${deviceLabelKey[r.key] ?? "deviceUnknown"}`)}
                  </span>
                  <span className="font-medium text-ink-900">
                    {formatNumber(r.count, locale)} <span className="text-ink-400">· {r.pct}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
