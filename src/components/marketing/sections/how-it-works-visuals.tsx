"use client";

import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/charts/donut-chart";
import { getCategoricalPalette, getChartColors } from "@/components/charts/theme";
import { useTheme } from "@/lib/theme/provider";
import { buttonClasses } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ListIcon,
  LayersIcon,
  FileTextIcon,
  SettingsIcon,
  CheckIcon,
  LinkIcon,
  QrIcon,
  UsersIcon,
  AlertIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons";

type Dict = Dictionary;

// A hand-authored 9x9 pseudo-QR pattern — three real "finder" corner squares
// plus a scattered module field. Purely decorative (never meant to scan),
// but reads unmistakably as a QR code at a glance.
const QR_ROWS = [
  "111111101",
  "100000101",
  "101110101",
  "101110100",
  "101110111",
  "100000101",
  "111111100",
  "000010111",
  "010101001",
];

function PseudoQr({ size = 100 }: { size?: number }) {
  const cell = size / QR_ROWS.length;
  return (
    <div
      className="grid rounded-md bg-white p-2 dark:bg-white"
      style={{ gridTemplateColumns: `repeat(${QR_ROWS.length}, 1fr)`, width: size, height: size }}
    >
      {QR_ROWS.flatMap((row, r) =>
        row.split("").map((bit, c) => (
          <span
            key={`${r}-${c}`}
            style={{ width: cell - 2, height: cell - 2 }}
            className={bit === "1" ? "bg-[#12151e]" : "bg-transparent"}
          />
        ))
      )}
    </div>
  );
}

// A clean, axis-free trend line for compact mockup contexts. MiniAreaChart's
// tuned negative left-margin (meant for its usual wider containers) clips
// the leading digit off Y-axis tick labels once the column gets this
// narrow — dropping the axis entirely sidesteps that and reads better at
// thumbnail scale anyway.
function Sparkline({ data, color, height = 90 }: { data: { value: number }[]; color: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="howItWorksSparkline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#howItWorksSparkline)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MockChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-pop sm:p-6">
      <div className="flex items-center justify-between border-b border-ink-100 pb-3.5">
        <Logo size={20} />
        <div className="hidden items-center gap-1.5 sm:flex">
          <div className="h-2 w-2 rounded-full bg-red-300" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-mint-400" />
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Step 1 — Create: a compact survey-builder screenshot (nav + question
// editor + template gallery).
export function CreateVisual({ dict }: { dict: Dict }) {
  const t = dict.marketing;
  const navItems = [
    { icon: ListIcon, label: "Surveys", active: true },
    { icon: LayersIcon, label: "Templates" },
    { icon: FileTextIcon, label: "Questions" },
    { icon: SettingsIcon, label: "Settings" },
  ];
  const templates = [t.howItWorksTemplate1, t.howItWorksTemplate2, t.howItWorksTemplate3, t.howItWorksTemplate4, t.howItWorksTemplate5];
  const options = [
    { label: t.howItWorksBuilderOpt1, checked: false },
    { label: t.howItWorksBuilderOpt2, checked: true },
    { label: t.howItWorksBuilderOpt3, checked: true },
    { label: t.howItWorksBuilderOpt4, checked: false },
  ];

  return (
    <MockChrome>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[76px_1fr] lg:grid-cols-[76px_1fr_150px]">
        <div className="hidden flex-col gap-3 sm:flex">
          {navItems.map((n) => (
            <div
              key={n.label}
              className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[10px] font-medium ${
                n.active ? "bg-brand-50 text-brand-content" : "text-ink-400"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">{t.howItWorksBuilderLabel}</p>
          <p className="mt-3 text-sm text-ink-600">{t.howItWorksBuilderQ1}</p>
          <div className="mt-2.5 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  n === 4 ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm text-ink-600">{t.howItWorksBuilderQ2}</p>
          <div className="mt-2.5 space-y-2">
            {options.map((o) => (
              <div key={o.label} className="flex items-center gap-2 text-xs text-ink-600">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    o.checked ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                  }`}
                >
                  {o.checked && <CheckIcon className="h-3 w-3" />}
                </span>
                {o.label}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{t.howItWorksTemplatesLabel}</p>
          <div className="mt-2.5 space-y-2">
            {templates.map((tpl) => (
              <div key={tpl} className="flex items-center gap-1.5 rounded-lg bg-ink-50/70 px-2.5 py-2 text-[11px] text-ink-600">
                <LayersIcon className="h-3.5 w-3.5 shrink-0 text-brand-content" />
                <span className="truncate">{tpl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

// Step 2 — Share: a phone taking feedback next to a table QR stand.
export function ShareVisual({ dict }: { dict: Dict }) {
  const t = dict.marketing;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-surface to-info-tint p-9 shadow-pop">
      <div className="flex flex-wrap items-end justify-center gap-8">
        <div className="w-[170px] rounded-[1.75rem] border-[6px] border-[#12151e] bg-surface p-4 shadow-card">
          <p className="text-center text-xs font-semibold text-ink-900">Survpay</p>
          <p className="mt-3 text-center text-xs leading-snug text-ink-600">{t.howItWorksPhoneQuestion}</p>
          <div className="mt-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <SparklesIcon key={n} className={`h-3.5 w-3.5 ${n <= 4 ? "text-amber-500" : "text-ink-200"}`} />
            ))}
          </div>
          <div className="mt-3.5 rounded-full bg-brand-600 py-2 text-center text-[11px] font-medium text-white">
            {t.howItWorksPhoneSubmit}
          </div>
        </div>

        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-card">
          <LinkIcon className="h-[18px] w-[18px] text-brand-content" />
        </div>

        <div className="rounded-2xl bg-surface p-5 text-center shadow-card">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink-500">
            <QrIcon className="h-4 w-4 text-brand-content" />
            Survpay
          </div>
          <div className="mt-2.5 flex justify-center">
            <PseudoQr size={104} />
          </div>
          <p className="mt-2.5 max-w-[130px] text-[11px] leading-snug text-ink-500">{t.howItWorksScanPrompt}</p>
        </div>
      </div>
    </div>
  );
}

// Step 3 — Collect: a live responses feed plus category chips.
export function CollectVisual({ dict }: { dict: Dict }) {
  const t = dict.marketing;
  const comments = [
    { author: t.insightsComment1Author, text: t.insightsComment1Text, sentiment: t.analyticsBucketPositive, tone: "success" as const, rating: "5/5" },
    { author: t.insightsComment2Author, text: t.insightsComment2Text, sentiment: t.analyticsBucketNeutral, tone: "warning" as const, rating: "3/5" },
    { author: t.insightsComment3Author, text: t.insightsComment3Text, sentiment: t.analyticsBucketPositive, tone: "success" as const, rating: "5/5" },
  ];
  const categories = [
    { label: t.howItWorksCategory1, dot: "bg-brand-500" },
    { label: t.howItWorksCategory2, dot: "bg-info-content" },
    { label: t.howItWorksCategory3, dot: "bg-mint-500" },
    { label: t.howItWorksCategory4, dot: "bg-amber-500" },
  ];

  return (
    <MockChrome>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_140px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">{t.howItWorksResponsesLabel}</p>
            <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-content">
              <UsersIcon className="h-3.5 w-3.5" />
              1,248
            </span>
          </div>
          <ul className="mt-3.5 space-y-3">
            {comments.map((c) => (
              <li key={c.author} className="flex items-start gap-2.5 rounded-xl bg-ink-50/60 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-content">
                  {c.author.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-ink-900">{c.author}</p>
                    <span className="shrink-0 text-[11px] text-ink-400">{c.rating}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-500">{c.text}</p>
                </div>
                <Badge tone={c.tone} className="shrink-0 !px-2 !py-0.5 !text-[10px]">
                  {c.sentiment}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Categories</p>
          <div className="mt-2.5 space-y-2">
            {categories.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-lg bg-ink-50/60 px-2.5 py-2 text-[11px] text-ink-600">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

// Step 4 — Understand: a compact analytics dashboard (reuses the same chart
// components as the dedicated Customer Insights section, at a smaller scale
// — but large enough for the trend chart's Y-axis ticks and the donut
// legend to stay fully readable, unlike an earlier pass at a smaller size).
export function UnderstandVisual({ dict }: { dict: Dict }) {
  const t = dict.marketing;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getCategoricalPalette(isDark);
  const chartColors = getChartColors(isDark);
  const trend = [
    { label: "01", value: 180 },
    { label: "10", value: 260 },
    { label: "20", value: 360 },
    { label: "25", value: 420 },
  ];
  const quality = [
    { label: t.insightsQualityExcellent, count: 774 },
    { label: t.insightsQualityGood, count: 250 },
    { label: t.insightsQualityAverage, count: 125 },
    { label: t.insightsQualityPoor, count: 99 },
  ];
  const metrics = [
    { label: t.analyticsMetric1Label, value: "87%" },
    { label: t.analyticsMetric2Label, value: "1,248" },
    { label: t.analyticsMetric3Label, value: "82%" },
    { label: t.analyticsMetric4Label, value: "11%" },
  ];
  const questions = [
    { label: t.insightsQuestion1, pct: 92 },
    { label: t.insightsQuestion2, pct: 78 },
    { label: t.insightsQuestion3, pct: 88 },
  ];

  return (
    <MockChrome>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-ink-50/60 p-3">
            <p className="truncate text-[11px] text-ink-500">{m.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="rounded-xl bg-ink-50/60 p-4">
          <p className="text-xs font-semibold text-ink-900">{t.analyticsTrendLabel}</p>
          <Sparkline data={trend} color={chartColors.brand} height={150} />
        </div>
        <div className="rounded-xl bg-ink-50/60 p-4">
          <p className="text-xs font-semibold text-ink-900">{t.analyticsDistributionLabel}</p>
          <div className="mt-2 flex items-center gap-4">
            <DonutChart data={quality.map((q) => ({ label: q.label, value: q.count }))} size={96} />
            <ul className="space-y-1.5">
              {quality.map((q, i) => (
                <li key={q.label} className="flex items-center gap-1.5 text-[11px] text-ink-500">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: palette[i] }} />
                  {q.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl bg-ink-50/60 p-4">
        <p className="text-xs font-semibold text-ink-900">{t.analyticsQuestionLabel}</p>
        <ul className="mt-2.5 space-y-2.5">
          {questions.map((q) => (
            <li key={q.label}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate text-ink-600">{q.label}</span>
                <span className="shrink-0 font-medium text-ink-900">{q.pct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${q.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </MockChrome>
  );
}

// Step 5 — Improve: key insight cards plus a call-to-action panel.
export function ImproveVisual({ dict, locale }: { dict: Dict; locale: Locale }) {
  const t = dict.marketing;
  const insights = [
    { icon: SparklesIcon, tone: "mint" as const, title: t.insightsCard1Title, desc: t.insightsCard1Desc },
    { icon: AlertIcon, tone: "amber" as const, title: t.insightsCard2Title, desc: t.insightsCard2Desc },
  ];
  const toneClasses = { mint: "bg-mint-50 text-mint-content", amber: "bg-amber-50 text-amber-content" };

  return (
    <MockChrome>
      <p className="text-sm font-semibold text-ink-900">{t.howItWorksInsightsLabel}</p>
      <div className="mt-3.5 space-y-3">
        {insights.map((c) => (
          <div key={c.title} className="flex items-start gap-3 rounded-xl bg-ink-50/60 p-3.5">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[c.tone]}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-900">{c.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#242a38] bg-[#12151e] p-5 dark:border-[#dde1e8] dark:bg-white">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-[18px] w-[18px] shrink-0 text-[#a89dff] dark:text-brand-content" />
          <p className="text-xs font-medium text-white dark:text-[#12151e]">{t.howItWorksCtaTitle}</p>
        </div>
        <Link
          href={`/${locale}/signup`}
          className={buttonClasses({ size: "sm", className: "shrink-0 !px-4 !py-2 !text-xs gap-1.5" })}
        >
          {t.heroCtaPrimary}
          <ArrowRightIcon className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>
    </MockChrome>
  );
}
