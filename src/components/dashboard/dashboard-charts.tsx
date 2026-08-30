"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { categoricalPalette } from "@/components/charts/theme";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";

const channelKey: Record<string, string> = {
  share_link: "channelShareLink",
  email: "channelEmail",
  website: "channelWebsite",
  social_media: "channelSocialMedia",
};

export function ResponsesOverTimeCard({ data }: { data: { date: string; count: number }[] }) {
  const { t, locale } = useI18n();
  const chartData = data.map((d) => ({ label: formatDate(d.date, locale, { month: "short", day: "numeric" }), value: d.count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.responsesOverTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <MiniAreaChart data={chartData} height={260} />
      </CardContent>
    </Card>
  );
}

export function ResponsesByChannelCard({ data }: { data: { source: string; count: number }[] }) {
  const { t, locale } = useI18n();
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.responsesByChannel")}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <DonutChart data={data.map((d) => ({ label: t(`dashboard.${channelKey[d.source] ?? "channelShareLink"}`), value: d.count }))} size={140} />
        <ul className="flex-1 space-y-2.5">
          {data.map((d, i) => (
            <li key={d.source} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoricalPalette[i % categoricalPalette.length] }} />
                {t(`dashboard.${channelKey[d.source] ?? "channelShareLink"}`)}
              </span>
              <span className="font-medium text-ink-900">{formatPercent((d.count / total) * 100, locale)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
