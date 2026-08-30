"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useI18n } from "@/lib/i18n/provider";
import { Card, CardContent } from "@/components/ui/card";
import { chartColors, categoricalPalette } from "@/components/charts/theme";

export interface QuestionBreakdownItem {
  question: { id: string; text: string; textAr: string | null; type: string };
  kind: "categorical" | "numeric" | "text";
  responseCount: number;
  distribution?: { label: string; labelAr: string; count: number; pct: number }[];
  average?: number;
  samples?: string[];
}

export function QuestionAnalyticsCard({ item }: { item: QuestionBreakdownItem }) {
  const { locale, t } = useI18n();
  const text = locale === "ar" && item.question.textAr ? item.question.textAr : item.question.text;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">{text}</h3>
          <span className="text-xs text-ink-400">
            {item.responseCount} {t("analyticsPage.responsesLabel")}
          </span>
        </div>

        {item.kind === "categorical" && item.distribution && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={Math.max(120, item.distribution.length * 42)}>
              <BarChart
                data={item.distribution.map((d) => ({ label: locale === "ar" ? d.labelAr : d.label, value: d.count, pct: d.pct }))}
                layout="vertical"
                margin={{ left: 0, right: 24 }}
              >
                <CartesianGrid horizontal={false} stroke={chartColors.grid} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12, fill: chartColors.ink }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e6ec", fontSize: 12 }} formatter={(v: number, _n, p) => [`${v} (${p.payload.pct}%)`, ""]} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={categoricalPalette[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {item.kind === "numeric" && (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-ink-900">{item.average}</span>
            <span className="text-sm text-ink-400">avg</span>
          </div>
        )}

        {item.kind === "text" && (
          <div className="mt-3 space-y-2">
            {(item.samples ?? []).length === 0 && <p className="text-sm text-ink-400">—</p>}
            {(item.samples ?? []).map((s, i) => (
              <p key={i} className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                “{s}”
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
