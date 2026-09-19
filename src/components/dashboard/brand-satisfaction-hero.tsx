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

  const scoredBranches = branches.filter((b) => b.score !== null);
  const displayName = (b: BrandHeroBranch) => (locale === "ar" && b.nameAr ? b.nameAr : b.name);

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:p-8">
        {/* ---- The score itself ---- */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-ink-900">{t.brandScoreTitle}</p>
          </div>

          {score === null ? (
            <div className="mt-5">
              <p className="text-lg font-semibold text-ink-900">{t.brandScoreEmpty}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t.brandScoreEmptyBody}</p>
            </div>
          ) : (
            <>
              <div className="mt-5 flex items-end gap-3">
                <span className={cn("text-6xl font-semibold leading-none tracking-tight", toneClass?.text)}>
                  {score}
                </span>
                <span className="pb-1.5 text-lg text-ink-400">/100</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {toneLabel && toneClass && (
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", toneClass.chip)}>
                    {toneLabel}
                  </span>
                )}
                {delta !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      delta >= 0 ? "text-mint-content" : "text-danger-content"
                    )}
                  >
                    <TrendingUpIcon className={cn("h-3.5 w-3.5", delta < 0 && "rotate-180")} />
                    {delta >= 0 ? "+" : ""}
                    {delta} {t.brandScoreVsPrevious}
                  </span>
                )}
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div className={cn("h-full rounded-full", toneClass?.bar)} style={{ width: `${score}%` }} />
              </div>

              <p className="mt-4 text-xs leading-relaxed text-ink-400">
                {formatNumber(answerCount, locale)} {t.brandScoreBasedOn} {formatNumber(responseCount, locale)}{" "}
                {t.brandScoreResponses}
                {branches.length > 0 && ` · ${t.brandScoreAcross} ${branches.length} ${t.brandScoreBranches}`}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{t.brandScoreHelp}</p>
            </>
          )}
        </div>

        {/* ---- Branch comparison ---- */}
        <div className="border-t border-ink-100 pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
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
            <div className="mt-6 flex flex-col items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-50 text-ink-400">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <p className="text-sm text-ink-500">{t.branchPerformanceEmpty}</p>
            </div>
          ) : (
            <ul className="mt-5 space-y-3.5">
              {scoredBranches.map((b) => {
                const bTone = scoreTone(b.score as number);
                const bClass = scoreToneClasses[bTone];
                return (
                  <li key={b.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-ink-800">{displayName(b)}</span>
                      <span className="flex shrink-0 items-baseline gap-2">
                        <span className="text-xs text-ink-400">
                          {formatNumber(b.totalResponses, locale)} {tb.responses.toLowerCase()}
                        </span>
                        <span className={cn("text-sm font-semibold tabular-nums", bClass.text)}>{b.score}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div className={cn("h-full rounded-full", bClass.bar)} style={{ width: `${b.score}%` }} />
                    </div>
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
