import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { RewardService } from "@/lib/services/reward-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { SurveyOverviewClient } from "@/components/survey-builder/survey-overview-client";
import { SurveyStatusBadge } from "@/components/dashboard/survey-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function SurveyOverviewPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const [overview, budgetSummary] = await Promise.all([
    AnalyticsService.getSurveyOverview(survey.id),
    RewardService.getBudgetSummary(survey.id),
  ]);

  const title = params.locale === "ar" && survey.titleAr ? survey.titleAr : survey.title;

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        <SurveyStatusBadge status={survey.status} />
      </div>
      <p className="mb-5 font-mono text-xs text-ink-400">/s/{survey.code}</p>
      <SurveySubnav surveyId={survey.id} active="overview" />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SurveyOverviewClient
            surveyId={survey.id}
            status={survey.status}
            basics={{
              title: survey.title,
              titleAr: survey.titleAr ?? "",
              description: survey.description ?? "",
              descriptionAr: survey.descriptionAr ?? "",
              objective: survey.objective ?? "",
              estimatedMinutes: survey.estimatedMinutes,
            }}
            reward={{
              enabled: survey.rewardConfig?.enabled ?? false,
              amount: survey.rewardConfig?.amount ?? 10,
              currency: survey.rewardConfig?.currency ?? "SAR",
              rewardType: (survey.rewardConfig?.rewardType as "cash" | "gift_card" | "coupon") ?? "cash",
              maxResponses: survey.rewardConfig?.maxResponses ?? 100,
            }}
            settings={{
              responseLimit: survey.settings?.responseLimit ?? null,
              startDate: survey.startDate ? survey.startDate.toISOString().slice(0, 10) : null,
              endDate: survey.endDate ? survey.endDate.toISOString().slice(0, 10) : null,
              anonymousResponses: survey.settings?.anonymousResponses ?? true,
              requireEmail: survey.settings?.requireEmail ?? false,
              preventDuplicates: survey.settings?.preventDuplicates ?? true,
              captchaEnabled: survey.settings?.captchaEnabled ?? true,
              collectFutureConsent: survey.settings?.collectFutureConsent ?? false,
            }}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <Stat label={dict.responses.metricTotal} value={overview.totalResponses.toLocaleString()} />
              <Stat label={dict.analyticsPage.completionRate} value={formatPercent(overview.completionRate, params.locale)} />
              <Stat label={dict.analyticsPage.rewardSpend} value={formatCurrency(overview.rewardSpend, params.locale)} />
              <Stat label={dict.analyticsPage.costPerResponse} value={formatCurrency(overview.costPerResponse, params.locale)} />
            </CardContent>
          </Card>

          {budgetSummary && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{dict.rewards.overviewTitle}</p>
                <p className="mt-2 text-xl font-semibold text-ink-900">{formatCurrency(budgetSummary.remaining, params.locale)}</p>
                <p className="text-xs text-ink-400">{dict.rewards.remaining}</p>
                <Progress
                  value={budgetSummary.budget.fundedAmount > 0 ? (budgetSummary.budget.distributedAmount / budgetSummary.budget.fundedAmount) * 100 : 0}
                  className="mt-3"
                />
                <p className="mt-2 text-xs text-ink-400">
                  {formatCurrency(budgetSummary.budget.distributedAmount, params.locale)} / {formatCurrency(budgetSummary.budget.fundedAmount, params.locale)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}
