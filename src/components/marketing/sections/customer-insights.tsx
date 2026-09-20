"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { useInView } from "@/lib/hooks/use-in-view";
import type { Locale } from "@/lib/i18n/config";
import { useTheme } from "@/lib/theme/provider";
import { MiniAreaChart } from "@/components/charts/mini-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { getCategoricalPalette } from "@/components/charts/theme";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Logo, LogoMark } from "@/components/brand/logo";
import { BrandGradientBlobs } from "@/components/brand-blobs";
import { scoreTone, scoreToneClasses } from "@/lib/satisfaction-display";
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
  HomeIcon,
  ListIcon,
  BuildingIcon,
  SettingsIcon,
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

const questions = [{ pct: 92 }, { pct: 78 }, { pct: 88 }, { pct: 85 }];

// Same five branches (and scores) shown in the real dashboard screenshot in
// the Solution section above, so the two sections read as one consistent
// product rather than two different demo datasets.
const branchScores = [79.8, 76.4, 68.8, 63.5, 50.9];

// Eased count-up from 0 to target, gated by `active` so it only plays once
// the section is actually in view.
function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function Reveal({
  show,
  delay = 0,
  className,
  children,
}: {
  show: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
      style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function AnimatedStatCard({
  icon,
  label,
  target,
  suffix = "",
  delta,
  deltaTone,
  deltaLabel,
  inView,
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  suffix?: string;
  delta: string;
  deltaTone: "success" | "danger";
  deltaLabel: string;
  inView: boolean;
}) {
  const value = useCountUp(target, inView);
  const display = suffix === "%" ? `${Math.round(value)}%` : Math.round(value).toLocaleString();
  return <StatCard icon={icon} label={label} value={display} delta={delta} deltaTone={deltaTone} deltaLabel={deltaLabel} />;
}

function AnimatedBranchRow({ name, score, inView, delay = 0 }: { name: string; score: number; inView: boolean; delay?: number }) {
  const tone = scoreTone(score);
  const toneClass = scoreToneClasses[tone];
  const width = useCountUp(score, inView, 900 + delay);
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneClass.bar)} />
      <span className="min-w-0 flex-1 truncate text-sm text-ink-700">{name}</span>
      <span className="hidden h-1 w-14 shrink-0 overflow-hidden rounded-full bg-ink-100 sm:block">
        <span className={cn("block h-full rounded-full", toneClass.bar)} style={{ width: `${width}%` }} />
      </span>
      <span className={cn("w-8 shrink-0 text-end text-sm font-semibold tabular-nums", toneClass.text)}>{score}</span>
    </li>
  );
}

function ScoreRing({ score, ringClass, inView, size = 108 }: { score: number; ringClass: string; inView: boolean; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(score, inView, 1100);
  const offset = c * (1 - Math.min(100, Math.max(0, animated)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-ink-100" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(ringClass, "transition-[stroke-dashoffset] duration-300 ease-out")}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[1.6rem] font-bold leading-none tracking-tight text-ink-900">{Math.round(animated)}</span>
        <span className="mt-0.5 text-[10px] font-medium text-ink-400">/100</span>
      </div>
    </div>
  );
}

export function CustomerInsightsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;
  const td = dict.dashboard;
  const tb = dict.branches;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getCategoricalPalette(isDark);
  const { ref, inView } = useInView<HTMLDivElement>();

  const metrics = [
    { icon: <CheckCircleIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric1Label, target: 87, suffix: "%", delta: "12%", tone: "success" as const },
    { icon: <UsersIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric2Label, target: 1248, delta: "32%", tone: "success" as const },
    { icon: <TrendingUpIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric3Label, target: 82, suffix: "%", delta: "10%", tone: "success" as const },
    { icon: <AlertIcon className="h-[18px] w-[18px]" />, label: t.analyticsMetric4Label, target: 11, suffix: "%", delta: "6%", tone: "danger" as const },
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

  const brandScore = 70.8;
  const brandTone = scoreTone(brandScore);
  const brandToneClass = scoreToneClasses[brandTone];
  const brandToneLabel = { excellent: tb.scoreExcellent, good: tb.scoreGood, fair: tb.scoreFair, poor: tb.scorePoor }[brandTone];

  const branches = [
    { name: t.insightsBranch1Name, score: branchScores[0] },
    { name: t.insightsBranch2Name, score: branchScores[1] },
    { name: t.insightsBranch3Name, score: branchScores[2] },
    { name: t.insightsBranch4Name, score: branchScores[3] },
    { name: t.insightsBranch5Name, score: branchScores[4] },
  ];

  const railNav = [
    { icon: HomeIcon, active: true },
    { icon: ListIcon, active: false },
    { icon: InboxIcon, active: false },
    { icon: BarChartIcon, active: false },
    { icon: BuildingIcon, active: false },
    { icon: SettingsIcon, active: false },
  ];

  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28 lg:py-32">
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
          <p className="text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.insightsEyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.insightsTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{t.insightsSubtitle}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-content">
            {t.insightsTagline}
          </span>
        </div>

        <div ref={ref} className="relative mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)_240px] lg:items-start lg:gap-6">
          {/* Left annotations — desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:gap-8 lg:pt-12">
            {annotations.map((a, i) => (
              <Reveal key={a.title} show={inView} delay={i * 90}>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{a.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">{a.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Dashboard — the hero of the section, styled after the real
              floating-sidebar / borderless-card / brand-wash dashboard. */}
          <Reveal show={inView} delay={60}>
            <div className="relative isolate flex overflow-hidden rounded-3xl bg-brand-wash shadow-pop">
              <BrandGradientBlobs variant="center" className="opacity-50" />

              {/* Collapsed sidebar rail — mirrors the real product's glassy,
                  icon-only sidebar so this mockup reads as the same app. */}
              <div className="relative hidden w-16 shrink-0 flex-col items-center gap-2 border-e border-white/40 bg-surface/70 py-4 backdrop-blur-xl sm:flex">
                <LogoMark size={20} />
                <div className="mt-3 flex flex-col gap-1.5">
                  {railNav.map((n, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        n.active ? "bg-brand-50 text-brand-content" : "text-ink-300"
                      )}
                    >
                      <n.icon className="h-[15px] w-[15px]" />
                    </span>
                  ))}
                </div>
                <span className="mt-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-content">
                  LA
                </span>
              </div>

              <div className="relative min-w-0 flex-1 p-4 sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  <div className="flex items-center gap-3 sm:hidden">
                    <Logo size={20} />
                  </div>
                  <span className="hidden text-sm font-medium text-ink-400 sm:inline">{t.insightsOverview}</span>
                  <div className="flex items-center gap-2 rounded-full border border-white/60 bg-surface/70 px-3 py-1.5 text-[11px] font-medium text-ink-500 backdrop-blur-sm">
                    <QrIcon className="h-3.5 w-3.5 text-brand-content" />
                    <span>{t.qrStep1}</span>
                    <ArrowRightIcon className="h-3 w-3 text-ink-300 rtl:rotate-180" />
                    <span>{t.insightsQrShare}</span>
                    <ArrowRightIcon className="h-3 w-3 text-ink-300 rtl:rotate-180" />
                    <span className="text-ink-900">{t.insightsQrResult}</span>
                  </div>
                </div>

                {/* Brand Satisfaction Score + Branch performance — the same
                    pairing shown in the real dashboard-home screenshot above. */}
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-surface p-4 shadow-card sm:p-5 lg:grid-cols-[auto_1fr]">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={brandScore} ringClass={brandToneClass.ring} inView={inView} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{td.brandScoreTitle}</p>
                      <span className={cn("mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", brandToneClass.chip)}>
                        {brandToneLabel}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-ink-100 pt-4 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{td.branchPerformance}</p>
                    <ul className="mt-2.5 divide-y divide-ink-50">
                      {branches.map((b, i) => (
                        <AnimatedBranchRow key={b.name} name={b.name} score={b.score} inView={inView} delay={i * 120} />
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {metrics.map((m) => (
                    <AnimatedStatCard
                      key={m.label}
                      icon={m.icon}
                      label={m.label}
                      target={m.target}
                      suffix={m.suffix}
                      delta={m.delta}
                      deltaTone={m.tone}
                      deltaLabel={dict.dashboard.fromLastPeriod}
                      inView={inView}
                    />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-surface p-5 shadow-soft lg:col-span-2">
                    <p className="text-sm font-semibold text-ink-900">{t.analyticsTrendLabel}</p>
                    <MiniAreaChart data={trend} height={190} />
                  </div>
                  <div className="rounded-2xl bg-surface p-5 shadow-soft">
                    <p className="text-sm font-semibold text-ink-900">{t.analyticsDistributionLabel}</p>
                    <div className="mt-3 flex flex-col items-center gap-4">
                      <DonutChart data={quality.map((q, i) => ({ label: qualityLabels[i], value: q.count }))} size={120} />
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

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-surface p-5 shadow-soft">
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

                  <div className="rounded-2xl bg-surface p-5 shadow-soft">
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
            </div>
          </Reveal>

          {/* Floating insight cards — desktop */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:pt-6">
            {insightCards.map((c, i) => (
              <Reveal key={c.title} show={inView} delay={200 + i * 120}>
                <div
                  className={cn(
                    "rounded-2xl p-4 shadow-card",
                    c.tone === "dark"
                      ? "border border-[#242a38] bg-[#12151e] text-white dark:border-[#dde1e8] dark:bg-white dark:text-[#12151e]"
                      : "bg-surface"
                  )}
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
                  <p className={cn("mt-1.5 text-xs leading-relaxed", c.tone === "dark" ? "text-[#9aa3b2] dark:text-[#717c8f]" : "text-ink-500")}>
                    {c.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Insight cards — mobile/tablet: only the two most useful ones */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {insightCards.slice(0, 2).map((c, i) => (
              <Reveal key={c.title} show={inView} delay={i * 120}>
                <div className="rounded-2xl bg-surface p-4 shadow-card">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cardToneClasses[c.tone] ?? cardToneClasses.brand)}>
                    <c.icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{c.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
