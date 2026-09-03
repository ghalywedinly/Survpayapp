import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { AIService } from "@/lib/services/ai-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatDuration, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { StatCard } from "@/components/ui/stat-card";
import { QuestionAnalyticsCard } from "@/components/survey-builder/question-analytics-card";
import { AIInsightsCard } from "@/components/survey-builder/ai-insights-card";
import { DemographicFilter } from "@/components/survey-builder/demographic-filter";
import { InboxIcon, TrendingUpIcon, ClockIcon, WalletIcon } from "@/components/icons";

export default async function SurveyAnalyticsPage({
  params,
  searchParams,
}: {
  params: { locale: Locale; id: string };
  searchParams: { demo?: string; value?: string };
}) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const filter = searchParams.demo && searchParams.value ? { questionId: searchParams.demo, value: searchParams.value } : undefined;

  const [overview, breakdown, latestInsight] = await Promise.all([
    AnalyticsService.getSurveyOverview(survey.id),
    AnalyticsService.getQuestionBreakdown(survey.id, filter),
    AIService.latest(survey.id),
  ]);

  const demographicQuestions = survey.questions.filter((q) => q.isDemographic && q.options.length > 0);

  return (
    <div>
      <PageHeader title={dict.analyticsPage.title} subtitle={dict.analyticsPage.subtitle} />
      <SurveySubnav surveyId={survey.id} active="analytics" />

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<InboxIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.totalResponses} value={overview.totalResponses.toLocaleString()} />
        <StatCard icon={<TrendingUpIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.completionRate} value={formatPercent(overview.completionRate, params.locale)} />
        <StatCard icon={<ClockIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.avgTime} value={formatDuration(overview.avgCompletionSeconds, params.locale)} />
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.rewardSpend} value={formatCurrency(overview.rewardSpend, params.locale)} />
      </div>

      <div className="mt-6">
        <AIInsightsCard surveyId={survey.id} initial={latestInsight} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">{dict.analyticsPage.questionAnalytics}</h2>
        {demographicQuestions.length > 0 && (
          <DemographicFilter
            surveyId={survey.id}
            questions={demographicQuestions.map((q) => ({
              id: q.id,
              text: q.text,
              textAr: q.textAr,
              options: q.options.map((o) => ({ value: o.value, label: o.label, labelAr: o.labelAr })),
            }))}
            activeQuestionId={searchParams.demo}
            activeValue={searchParams.value}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {breakdown.map((item) => (
          <QuestionAnalyticsCard key={item.question.id} item={item} />
        ))}
      </div>
    </div>
  );
}
