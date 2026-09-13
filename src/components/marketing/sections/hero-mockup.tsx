import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { Logo } from "@/components/brand/logo";
import { BarChartIcon, UsersIcon, CheckCircleIcon, TrendingUpIcon, QrIcon, ArrowRightIcon } from "@/components/icons";

const chartData = [
  { label: "20", value: 210 },
  { label: "23", value: 260 },
  { label: "26", value: 240 },
  { label: "29", value: 340 },
  { label: "01", value: 300 },
  { label: "04", value: 420 },
  { label: "07", value: 390 },
  { label: "10", value: 480 },
];

export function HeroMockup({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const tiles = [
    { icon: <BarChartIcon className="h-4 w-4" />, label: dict.dashboard.metricActiveSurveys, value: "6" },
    { icon: <UsersIcon className="h-4 w-4" />, label: dict.dashboard.metricTotalResponses, value: "4,152" },
    { icon: <CheckCircleIcon className="h-4 w-4" />, label: dict.marketing.analyticsMetric1Label, value: "87%" },
    { icon: <TrendingUpIcon className="h-4 w-4" />, label: dict.dashboard.metricCompletionRate, value: "78.4%" },
  ];

  return (
    <div className="relative rounded-2xl border border-ink-200/70 bg-surface p-4 shadow-pop sm:p-6">
      <div className="flex items-center justify-between border-b border-ink-100 pb-4">
        <Logo size={20} />
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-2 w-2 rounded-full bg-red-300" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-mint-400" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-[11px] font-medium text-ink-500">
        <span className="flex items-center gap-1.5">
          <QrIcon className="h-3.5 w-3.5 text-brand-content" />
          {dict.marketing.qrStep1}
        </span>
        <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-300 rtl:rotate-180" />
        <span>{dict.marketing.qrStep2}</span>
        <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-300 rtl:rotate-180" />
        <span>{dict.dashboard.metricTotalResponses}</span>
        <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-300 rtl:rotate-180" />
        <span className="text-ink-900">{dict.nav.dashboard}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-content">{tile.icon}</div>
            <p className="mt-2 text-[11px] text-ink-500">{tile.label}</p>
            <p className="text-sm font-semibold text-ink-900">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-ink-100 p-3">
        <p className="text-xs font-medium text-ink-500">{dict.dashboard.responsesOverTime}</p>
        <MiniAreaChart data={chartData} height={150} />
      </div>
    </div>
  );
}
