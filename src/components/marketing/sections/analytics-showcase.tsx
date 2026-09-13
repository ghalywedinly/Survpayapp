"use client";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { getChartColors, getTooltipStyle, getStatusColors } from "@/components/charts/theme";
import { useTheme } from "@/lib/theme/provider";
import { StatCard } from "@/components/ui/stat-card";
import { CheckCircleIcon, UsersIcon, TrendingUpIcon, AlertIcon } from "@/components/icons";

const trend = [
  { label: "W1", value: 180 },
  { label: "W2", value: 260 },
  { label: "W3", value: 310 },
  { label: "W4", value: 420 },
  { label: "W5", value: 480 },
];

export function AnalyticsShowcase({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;
  const { theme } = useTheme();
  const chartColors = getChartColors(theme === "dark");
  const status = getStatusColors(theme === "dark");

  const distribution = [
    { label: t.analyticsBucketNegative, value: 7, color: status.critical },
    { label: t.analyticsBucketNeutral, value: 11, color: status.neutral },
    { label: t.analyticsBucketPositive, value: 82, color: status.good },
  ];

  const metrics = [
    { icon: <CheckCircleIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric1Label, value: "87%" },
    { icon: <UsersIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric2Label, value: "1,248" },
    { icon: <TrendingUpIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric3Label, value: "82%" },
    { icon: <AlertIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric4Label, value: "11%" },
  ];

  return (
    <section className="border-t border-ink-100 bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.analyticsEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.analyticsTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.analyticsSubtitle}</p>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <StatCard key={m.label} icon={m.icon} label={m.label} value={m.value} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink-200/70 bg-surface p-6 shadow-soft lg:col-span-2">
            <p className="text-sm font-semibold text-ink-900">{t.analyticsTrendLabel}</p>
            <MiniAreaChart data={trend} height={220} />
          </div>
          <div className="rounded-2xl border border-ink-200/70 bg-surface p-6 shadow-soft">
            <p className="text-sm font-semibold text-ink-900">{t.analyticsDistributionLabel}</p>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distribution} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={getTooltipStyle(theme === "dark")} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {distribution.map((d) => (
                      <Cell key={d.label} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
