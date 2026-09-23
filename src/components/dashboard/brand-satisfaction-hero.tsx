import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { scoreTone, scoreToneClasses } from "@/lib/satisfaction-display";
import { Card, CardContent } from "@/components/ui/card";
import { SparklesIcon, TrendingUpIcon, BuildingIcon, ArrowRightIcon } from "@/components/icons";

export interface BrandHeroBranch {
  id: string;
  name: string;
  nameAr: string | null;
  score: number | null;
  totalResponses: number;
}

function ScoreRing({ score, ringClass, size = 116 }: { score: number; ringClass: string; size?: number }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, score)) / 100);
  return (
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
        className={cn(ringClass, "transition-[stroke-dashoffset] duration-700 ease-out")}
        fill="none"
      />
    </svg>
  );
}

export function BrandSatisfactionHero({
  locale,
  score,
  delta,
  answerCount,
  responseCount,
  branches,
}: {
  locale: Locale;
  score: number | null;
  delta: number | null;
  answerCount: number;
  responseCount: number;
  branches: BrandHeroBranch[];
}) {
  const dict = getDictionary(locale);
  const t = dict.dashboard;
  const tb = dict.branches;

  const tone = score !== null ? scoreTone(score) : null;
  const toneClass = tone ? scoreToneClasses[tone] : null;
  const toneLabel = tone
    ? { excellent: tb.scoreExcellent, good: tb.scoreGood, fair: tb.scoreFair, poor: tb.scorePoor }[tone]
    : null;

  const scoredBranches = branches.filter((b) => b.score !== null).sort((a, b) => (b.score as number) - (a.score as number));
  const displayName = (b: BrandHeroBranch) => (locale === "ar" && b.nameAr ? b.nameAr : b.name);

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,300px)_1fr] lg:p-6">
        {/* ---- The score itself ---- */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-content">
              <SparklesIcon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-ink-900">{t.brandScoreTitle}</p>
          </div>

          {score === null || !tone || !toneClass ? (
            <div className="mt-4">
              <p className="text-base font-semibold text-ink-900">{t.brandScoreEmpty}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t.brandScoreEmptyBody}</p>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <div className="relative shrink-0">
                <ScoreRing score={score} ringClass={toneClass.ring} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-[1.7rem] font-bold leading-none tracking-tight", toneClass.text)}>{score}</span>
                  <span className="mt-0.5 text-[10px] font-medium text-ink-400">/100</span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", toneClass.chip)}>
                  {toneLabel}
                </span>
                {delta !== null && (
                  <span
                    className={cn(
                      "ms-2 inline-flex items-center gap-1 text-xs font-medium",
                      delta >= 0 ? "text-mint-content" : "text-danger-content"
                    )}
                  >
                    <TrendingUpIcon className={cn("h-3.5 w-3.5", delta < 0 && "rotate-180")} />
                    {delta >= 0 ? "+" : ""}
                    {delta}
                  </span>
                )}
                <p className="mt-2 text-xs leading-relaxed text-ink-400">
                  {formatNumber(answerCount, locale)} {t.brandScoreBasedOn} {formatNumber(responseCount, locale)} {t.brandScoreResponses}
                  {branches.length > 0 && ` · ${branches.length} ${t.brandScoreBranches}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---- Branch comparison ---- */}
        <div className="border-t border-ink-100 pt-5 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink-900">{t.branchPerformance}</p>
            <Link
              href={`/${locale}/branches`}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-content"
            >
              {t.manageBranches}
              <ArrowRightIcon className="h-3 w-3 rtl:rotate-180" />
            </Link>
          </div>

          {scoredBranches.length === 0 ? (
            <div className="mt-4 flex flex-col items-start gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 text-ink-400">
                <BuildingIcon className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink-500">{t.branchPerformanceEmpty}</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink-50">
              {scoredBranches.map((b) => {
                const bTone = scoreTone(b.score as number);
                const bClass = scoreToneClasses[bTone];
                return (
                  <li key={b.id} className="flex items-center gap-3 py-1.5">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", bClass.bar)} />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-700">{displayName(b)}</span>
                    <span className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-ink-100 sm:block">
                      <span className={cn("block h-full rounded-full", bClass.bar)} style={{ width: `${b.score}%` }} />
                    </span>
                    <span className={cn("w-7 shrink-0 text-end text-sm font-semibold tabular-nums", bClass.text)}>
                      {b.score}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
