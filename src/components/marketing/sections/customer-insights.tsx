"use client";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { useTheme } from "@/lib/theme/provider";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { getCategoricalPalette } from "@/components/charts/theme";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import {
  CheckCircleIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertIcon,
  BarChartIcon,
  EyeIcon,
  InboxIcon,
  SparklesIcon,
  QrIcon,
  ArrowRightIcon,
  TargetIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

// Day-of-month labels rather than month names — locale-neutral, so the axis
// doesn't silently stay in English on the Arabic page (matches the pattern
// already used by the hero dashboard mockup).
const trend = [
  { label: "01", value: 180 },
  { label: "05", value: 230 },
  { label: "10", value: 260 },
  { label: "15", value: 320 },
  { label: "20", value: 360 },
  { label: "25", value: 420 },
];

// Illustrative counts that sum to the 1,248-response KPI shown above, so the
// donut's center total reads as a real breakdown of it rather than a
// disconnected percentage.
const quality = [
  { pct: 62, count: 774 },
  { pct: 20, count: 250 },
  { pct: 10, count: 125 },
  { pct: 8, count: 99 },
];

const questions = [
  { pct: 92 },
  { pct: 78 },
  { pct: 88 },
  { pct: 85 },
];

export function CustomerInsightsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getCategoricalPalette(isDark);

  const metrics = [
    { icon: <CheckCircleIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric1Label, value: "87%", delta: "12%", tone: "success" as const },
    { icon: <UsersIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric2Label, value: "1,248", delta: "32%", tone: "success" as const },
    { icon: <TrendingUpIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric3Label, value: "82%", delta: "10%", tone: "success" as const },
    { icon: <AlertIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric4Label, value: "11%", delta: "6%", tone: "danger" as const },
  ];

  const qualityLabels = [t.insightsQualityExcellent, t.insightsQualityGood, t.insightsQualityAverage, t.insightsQualityPoor];
  const questionLabels = [t.insightsQuestion1, t.insightsQuestion2, t.insightsQuestion3, t.insightsQuestion4];
  const comments = [
    { author: t.insightsComment1Author, text: t.insightsComment1Text, sentiment: t.analyticsBucketPositive, tone: "success" as const },
    { author: t.insightsComment2Author, text: t.insightsComment2Text, sentiment: t.analyticsBucketNeutral, tone: "warning" as const },
    { author: t.insightsComment3Author, text: t.insightsComment3Text, sentiment: t.analyticsBucketPositive, tone: "success" as const },
  ];

  const annotations = [
    { icon: BarChartIcon, title: t.insightsAnnotation1Title, desc: t.insightsAnnotation1Desc },
    { icon: TrendingUpIcon, title: t.insightsAnnotation2Title, desc: t.insightsAnnotation2Desc },
    { icon: TargetIcon, title: t.insightsAnnotation3Title, desc: t.insightsAnnotation3Desc },
    { icon: InboxIcon, title: t.insightsAnnotation4Title, desc: t.insightsAnnotation4Desc },
  ];

  const insightCards = [
    { icon: SparklesIcon, tone: "mint" as const, title: t.insightsCard1Title, desc: t.insightsCard1Desc },
    { icon: AlertIcon, tone: "amber" as const, title: t.insightsCard2Title, desc: t.insightsCard2Desc },
    { icon: TargetIcon, tone: "brand" as const, title: t.insightsCard3Title, desc: t.insightsCard3Desc },
    { icon: EyeIcon, tone: "dark" as const, title: t.insightsCard4Title, desc: t.insightsCard4Desc },
  ];

  const cardToneClasses: Record<string, string> = {
    mint: "bg-mint-50 text-mint-content",
    amber: "bg-amber-50 text-amber-content",
    brand: "bg-brand-50 text-brand-content",
  };

  return (
    <section className="relative overflow-hidden border-t border-ink-100 bg-surface py-20 sm:py-28 lg:py-32">
      {/* Decorative brand motif: a faint flowing "S" curve echoing the logo's
          geometry, plus a soft radial wash in the brand hues — purely
          ambient, never a literal redraw of the mark. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-x-0 top-0 h-[520px]"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(91,61,240,0.06), transparent)" }}
        />
        <svg className="absolute end-0 top-16 h-[420px] w-[420px] opacity-[0.12] rtl:scale-x-[-1]" viewBox="0 0 400 400" fill="none">
          <defs>
            <linearGradient id="insightsSGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5b3df0" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M300 60C180 60 120 130 180 190C240 250 300 260 260 320C220 380 120 380 80 320"
            stroke="url(#insightsSGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.insightsEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.insightsTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{t.insightsSubtitle}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-content">
            {t.insightsTagline}
          </span>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)_240px] lg:items-start lg:gap-6">
          {/* Left annotations — desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:gap-8 lg:pt-12">
            {annotations.map((a) => (
              <div key={a.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                  <a.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{a.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard — the hero of the section */}
          <div className="animate-slide-up rounded-3xl border border-ink-200/70 bg-surface p-4 shadow-pop sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
              <div className="flex items-center gap-3">
                <Logo size={20} />
                <span className="hidden text-sm font-medium text-ink-400 sm:inline">{t.insightsOverview}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-ink-100 bg-ink-50/60 px-3 py-1.5 text-[11px] font-medium text-ink-500">
                <QrIcon className="h-3.5 w-3.5 text-brand-content" />
                <span>{t.qrStep1}</span>
                <ArrowRightIcon className="h-3 w-3 text-ink-300 rtl:rotate-180" />
                <span>{t.insightsQrShare}</span>
                <ArrowRightIcon className="h-3 w-3 text-ink-300 rtl:rotate-180" />
                <span className="text-ink-900">{t.insightsQrResult}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {metrics.map((m) => (
                <StatCard
                  key={m.label}
                  icon={m.icon}
                  label={m.label}
                  value={m.value}
                  delta={m.delta}
                  deltaTone={m.tone}
                  deltaLabel={dict.dashboard.fromLastPeriod}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-ink-200/70 bg-ink-50/30 p-5 lg:col-span-2">
                <p className="text-sm font-semibold text-ink-900">{t.analyticsTrendLabel}</p>
                <MiniAreaChart data={trend} height={190} />
              </div>
              <div className="rounded-2xl border border-ink-200/70 bg-ink-50/30 p-5">
                <p className="text-sm font-semibold text-ink-900">{t.analyticsDistributionLabel}</p>
                <div className="mt-3 flex flex-col items-center gap-4">
                  <DonutChart data={quality.map((q, i) => ({ label: qualityLabels[i], value: q.count }))} size={128} />
                  <ul className="w-full space-y-1.5">
                    {quality.map((q, i) => (
                      <li key={qualityLabels[i]} className="flex items-center gap-2 text-xs text-ink-600">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: palette[i] }} />
                        <span className="flex-1 text-ink-500">{qualityLabels[i]}</span>
                        <span className="font-medium text-ink-900">{q.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/70 bg-ink-50/30 p-5">
                <p className="text-sm font-semibold text-ink-900">{t.analyticsQuestionLabel}</p>
                <ul className="mt-4 space-y-3.5">
                  {questionLabels.map((q, i) => (
                    <li key={q}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600">{q}</span>
                        <span className="font-medium text-ink-900">{questions[i].pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${questions[i].pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-ink-200/70 bg-ink-50/30 p-5">
                <p className="text-sm font-semibold text-ink-900">{t.analyticsCommentsLabel}</p>
                <ul className="mt-4 space-y-3">
                  {comments.map((c) => (
                    <li key={c.author} className="flex items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-content">
                        {c.author.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-ink-900">{c.author}</p>
                          <Badge tone={c.tone} className="shrink-0">{c.sentiment}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{c.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Floating insight cards — desktop. Staggered via animation-delay
              (not a scroll observer): safe by construction — every card
              ends at fully visible on its own, so there is no state where a
              misfired trigger could leave content stuck invisible. */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:pt-6">
            {insightCards.map((c, i) => (
              <div
                key={c.title}
                className={cn(
                  "motion-safe:animate-slide-up rounded-2xl p-4 shadow-card",
                  c.tone === "dark"
                    ? "border border-[#242a38] bg-[#12151e] text-white dark:border-[#dde1e8] dark:bg-white dark:text-[#12151e]"
                    : "border border-ink-200/70 bg-surface"
                )}
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    c.tone === "dark" ? "bg-white/10 text-[#a89dff] dark:bg-brand-50 dark:text-brand-content" : cardToneClasses[c.tone]
                  )}
                >
                  <c.icon className="h-4 w-4" />
                </div>
                <p className={cn("mt-3 text-sm font-semibold", c.tone === "dark" ? "text-white dark:text-[#12151e]" : "text-ink-900")}>
                  {c.title}
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-xs leading-relaxed",
                    c.tone === "dark" ? "text-[#9aa3b2] dark:text-[#717c8f]" : "text-ink-500"
                  )}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Insight cards — mobile/tablet: only the two most useful ones */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {insightCards.slice(0, 2).map((c) => (
              <div key={c.title} className="rounded-2xl border border-ink-200/70 bg-surface p-4 shadow-card">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cardToneClasses[c.tone] ?? cardToneClasses.brand)}>
                  <c.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-900">{c.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
