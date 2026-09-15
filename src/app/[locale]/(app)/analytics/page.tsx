import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { SurveyStatusBadge } from "@/components/dashboard/survey-status-badge";
import { ResponsesOverTimeCard } from "@/components/dashboard/dashboard-charts";
import { BarChartIcon, UsersIcon, WalletIcon, TrendingUpIcon } from "@/components/icons";

export default async function AnalyticsOverviewPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  const [metrics, trend, topSurveys] = await Promise.all([
    AnalyticsService.getDashboardMetrics(ctx.organization.id),
    AnalyticsService.responsesOverTime(ctx.organization.id, 30),
    AnalyticsService.topSurveys(ctx.organization.id, 10),
  ]);

  return (
    <div>
      <PageHeader title={dict.analyticsPage.title} subtitle={dict.analyticsPage.subtitle} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<UsersIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.totalResponses} value={metrics.totalResponses.toLocaleString()} />
        <StatCard icon={<TrendingUpIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.completionRate} value={formatPercent(metrics.avgCompletionRate, params.locale)} />
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={dict.analyticsPage.rewardSpend} value={formatCurrency(metrics.rewardsDistributed, params.locale)} />
        <StatCard icon={<BarChartIcon className="h-[18px] w-[18px]" />} label={dict.dashboard.metricActiveSurveys} value={String(metrics.activeSurveys)} />
      </div>

      <div className="mt-6">
        <ResponsesOverTimeCard data={trend} />
      </div>

      <Card className="mt-6 overflow-hidden">
        {topSurveys.length === 0 ? (
          <EmptyState icon={<BarChartIcon className="h-6 w-6" />} title={dict.surveys.emptyTitle} body={dict.surveys.emptyBody} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{dict.surveys.colName}</TH>
                <TH>{dict.surveys.colStatus}</TH>
                <TH>{dict.dashboard.tableColResponses}</TH>
                <TH>{dict.dashboard.tableColCompletion}</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {topSurveys.map((s) => (
                <TR key={s.id}>
                  <TD className="font-medium text-ink-900">{params.locale === "ar" && s.titleAr ? s.titleAr : s.title}</TD>
                  <TD>
                    <SurveyStatusBadge status={s.status} />
                  </TD>
                  <TD>{s._count.responses.toLocaleString()}</TD>
                  <TD>{s.completionRate.toFixed(1)}%</TD>
                  <TD>
                    <Link href={`/${params.locale}/surveys/${s.id}/analytics`} className="text-sm font-medium text-brand-content hover:text-brand-content">
                      {dict.common.viewDetails} →
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
