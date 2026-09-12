import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { AIService } from "@/lib/services/ai-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatDuration, formatPercent, formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { StatCard } from "@/components/ui/stat-card";
import { QuestionAnalyticsCard } from "@/components/survey-builder/question-analytics-card";
import { AIInsightsCard } from "@/components/survey-builder/ai-insights-card";
import { DemographicFilter } from "@/components/survey-builder/demographic-filter";
import { ResponseQualityCard } from "@/components/survey-builder/response-quality-card";
import { BreakdownListCard } from "@/components/survey-builder/breakdown-list-card";
import { SurveyResponseTrendCard, DeviceBreakdownCard } from "@/components/survey-builder/survey-trend-charts";
import { InboxIcon, TrendingUpIcon, ClockIcon, WalletIcon, GlobeIcon } from "@/components/icons";

export default async function SurveyAnalyticsPage({
  params,
  searchParams,
}: {
  params: { locale: Locale; id: string };
  searchParams: { demo?: string; value?: string };
}) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const t = dict.analyticsPage;
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const filter = searchParams.demo && searchParams.value ? { questionId: searchParams.demo, value: searchParams.value } : undefined;

  const [overview, breakdown, latestInsight, quality, trend, surveyBreakdowns] = await Promise.all([
    AnalyticsService.getSurveyOverview(survey.id),
    AnalyticsService.getQuestionBreakdown(survey.id, filter),
    AIService.latest(survey.id),
    AnalyticsService.getResponseQuality(survey.id),
    AnalyticsService.responsesOverTimeForSurvey(survey.id),
    AnalyticsService.getSurveyBreakdowns(survey.id),
  ]);

  const demographicQuestions = survey.questions.filter((q) => q.isDemographic && q.options.length > 0);

  const sourceLabels: Record<string, string> = {
    share_link: dict.dashboard.channelShareLink,
    email: dict.dashboard.channelEmail,
    website: dict.dashboard.channelWebsite,
    social_media: dict.dashboard.channelSocialMedia,
  };

  return (
    <div>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <SurveySubnav surveyId={survey.id} active="analytics" />

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<InboxIcon className="h-[18px] w-[18px]" />} label={t.totalResponses} value={formatNumber(overview.totalResponses, params.locale)} />
        <StatCard icon={<TrendingUpIcon className="h-[18px] w-[18px]" />} label={t.completionRate} value={formatPercent(overview.completionRate, params.locale)} />
        <StatCard icon={<ClockIcon className="h-[18px] w-[18px]" />} label={t.avgTime} value={formatDuration(overview.avgCompletionSeconds, params.locale)} />
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={t.rewardSpend} value={formatCurrency(overview.rewardSpend, params.locale)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SurveyResponseTrendCard data={trend} />
        </div>
        <ResponseQualityCard quality={quality} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BreakdownListCard
          title={t.byCountry}
          icon={<GlobeIcon className="h-4 w-4 text-brand-content" />}
          rows={surveyBreakdowns.countries.map((r) => ({ key: r.key, label: r.key, count: r.count, pct: r.pct }))}
          emptyLabel={t.noResponsesYet}
        />
        <DeviceBreakdownCard rows={surveyBreakdowns.devices} />
        <BreakdownListCard
          title={t.bySource}
          rows={surveyBreakdowns.sources.map((r) => ({ key: r.key, label: sourceLabels[r.key] ?? r.key, count: r.count, pct: r.pct }))}
          emptyLabel={t.noResponsesYet}
        />
      </div>

      <div className="mt-6">
        <AIInsightsCard surveyId={survey.id} initial={latestInsight} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">{t.questionAnalytics}</h2>
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
