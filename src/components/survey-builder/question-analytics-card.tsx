"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { getChartColors, getCategoricalPalette, getTooltipStyle, getStatusColors } from "@/components/charts/theme";
import { useTheme } from "@/lib/theme/provider";

export interface QuestionBreakdownItem {
  question: { id: string; text: string; textAr: string | null; type: string };
  kind: "categorical" | "numeric" | "text";
  responseCount: number;
  distribution?: { label: string; labelAr: string; count: number; pct: number }[];
  average?: number;
  nps?: { score: number; promoterPct: number; passivePct: number; detractorPct: number };
  samples?: string[];
}

export function QuestionAnalyticsCard({ item }: { item: QuestionBreakdownItem }) {
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = getChartColors(isDark);
  const categoricalPalette = getCategoricalPalette(isDark);
  const status = getStatusColors(isDark);
  const text = locale === "ar" && item.question.textAr ? item.question.textAr : item.question.text;
  const topAnswer = item.kind === "categorical" ? item.distribution?.slice().sort((a, b) => b.count - a.count)[0] : undefined;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink-900">{text}</h3>
          <span className="shrink-0 whitespace-nowrap text-xs text-ink-400">
            {formatNumber(item.responseCount, locale)} {t("analyticsPage.responsesLabel")}
          </span>
        </div>

        {item.responseCount === 0 ? (
          <p className="mt-5 py-4 text-center text-sm text-ink-400">{t("analyticsPage.noResponsesYet")}</p>
        ) : (
          <>
            {item.kind === "categorical" && item.distribution && (
              <div className="mt-3">
                {topAnswer && (
                  <p className="mb-2 text-xs text-ink-500">
                    {t("analyticsPage.topAnswer")} <span className="font-medium text-ink-700">{locale === "ar" ? topAnswer.labelAr : topAnswer.label}</span>
                    <span className="text-ink-400"> · {topAnswer.pct}%</span>
                  </p>
                )}
                <ResponsiveContainer width="100%" height={Math.max(120, item.distribution.length * 38)}>
                  <BarChart
                    data={item.distribution.map((d) => ({ label: locale === "ar" ? d.labelAr : d.label, value: d.count, pct: d.pct }))}
                    layout="vertical"
                    margin={{ left: 0, right: 28 }}
                  >
                    <CartesianGrid horizontal={false} stroke={chartColors.grid} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12, fill: chartColors.ink }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={getTooltipStyle(isDark)} formatter={(v: number, _n, p) => [`${v} (${p.payload.pct}%)`, ""]} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={categoricalPalette[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {item.kind === "numeric" && item.question.type === "nps" && item.nps && (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums text-ink-900">
                    {item.nps.score > 0 ? "+" : ""}
                    {item.nps.score}
                  </span>
                  <span className="text-sm text-ink-400">{t("analyticsPage.npsScore")}</span>
                </div>
                <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full first:rounded-s-full" style={{ width: `${item.nps.detractorPct}%`, background: status.critical }} />
                  <div className="h-full" style={{ width: `${item.nps.passivePct}%`, background: status.neutral }} />
                  <div className="h-full last:rounded-e-full" style={{ width: `${item.nps.promoterPct}%`, background: status.good }} />
                </div>
                <div className="mt-2.5 flex justify-between text-xs text-ink-500">
                  <span>
                    {item.nps.detractorPct}% {t("analyticsPage.npsDetractors")}
                  </span>
                  <span>
                    {item.nps.passivePct}% {t("analyticsPage.npsPassives")}
                  </span>
                  <span>
                    {item.nps.promoterPct}% {t("analyticsPage.npsPromoters")}
                  </span>
                </div>
              </div>
            )}

            {item.kind === "numeric" && !(item.question.type === "nps" && item.nps) && (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums text-ink-900">{item.average}</span>
                  <span className="text-sm text-ink-400">{t("analyticsPage.average")}</span>
                </div>
                {item.distribution && item.distribution.length > 0 && (
                  <div className="mt-3">
                    <ResponsiveContainer width="100%" height={110}>
                      <BarChart data={item.distribution.map((d) => ({ label: d.label, value: d.count, pct: d.pct }))} margin={{ left: -20, right: 8 }}>
                        <CartesianGrid vertical={false} stroke={chartColors.grid} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={getTooltipStyle(isDark)} formatter={(v: number, _n, p) => [`${v} (${p.payload.pct}%)`, ""]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={categoricalPalette[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {item.kind === "text" && (
              <div className="mt-3 space-y-2">
                {(item.samples ?? []).length === 0 && <p className="text-sm text-ink-400">—</p>}
                {(item.samples ?? []).map((s, i) => (
                  <p key={i} className="line-clamp-3 rounded-lg bg-ink-50 px-3 py-2 text-sm italic text-ink-600">
                    “{s}”
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
