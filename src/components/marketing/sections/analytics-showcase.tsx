"use client";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { chartColors } from "@/components/charts/theme";

const trend = [
  { label: "W1", value: 180 },
  { label: "W2", value: 260 },
  { label: "W3", value: 310 },
  { label: "W4", value: 420 },
  { label: "W5", value: 480 },
];

const nps = [
  { label: "0-6", value: 12 },
  { label: "7-8", value: 28 },
  { label: "9-10", value: 60 },
];

export function AnalyticsShowcase({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  return (
    <section className="border-t border-ink-100 bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t.analyticsEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.analyticsTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.analyticsSubtitle}</p>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft lg:col-span-2">
            <p className="text-sm font-semibold text-ink-900">{dict.dashboard.responsesOverTime}</p>
            <MiniAreaChart data={trend} height={220} />
          </div>
          <div className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-ink-900">NPS distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={nps} margin={{ top: 16, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e6ec", fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={chartColors.mint} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
