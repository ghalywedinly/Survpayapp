import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { SurveyService } from "@/lib/services/survey-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { ResponsesOverTimeCard, ResponsesByChannelCard } from "@/components/dashboard/dashboard-charts";
import { SurveyStatusBadge } from "@/components/dashboard/survey-status-badge";
import { BarChartIcon, UsersIcon, WalletIcon, TrendingUpIcon, PlusIcon, ListIcon } from "@/components/icons";

export default async function DashboardPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const orgId = ctx.organization.id;

  const [metrics, trend, channels, topSurveys, topCountries] = await Promise.all([
    AnalyticsService.getDashboardMetrics(orgId),
    AnalyticsService.responsesOverTime(orgId, 30),
    AnalyticsService.responsesByChannel(orgId),
    AnalyticsService.topSurveys(orgId, 5),
    AnalyticsService.topCountries(orgId, 5),
  ]);

  const hasSurveys = topSurveys.length > 0;

  return (
    <div>
      <PageHeader
        title={`${dict.dashboard.welcome}, ${ctx.organization.name.split(" ")[0]}`}
        subtitle={dict.dashboard.subtitle}
        actions={
          <>
            <Link href={`/${params.locale}/reports`} className={buttonClasses({ variant: "outline" })}>
              {dict.dashboard.viewReports}
            </Link>
            <Link href={`/${params.locale}/surveys/new`} className={buttonClasses({ className: "gap-1.5" })}>
              <PlusIcon className="h-4 w-4" />
              {dict.dashboard.newSurvey}
            </Link>
          </>
        }
      />

      {!hasSurveys ? (
        <EmptyState
          icon={<ListIcon className="h-6 w-6" />}
          title={dict.dashboard.emptyTitle}
          body={dict.dashboard.emptyBody}
          action={
            <Link href={`/${params.locale}/surveys/new`} className={buttonClasses()}>
              {dict.dashboard.emptyCta}
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={<ListIcon className="h-[18px] w-[18px]" />}
              label={dict.dashboard.metricActiveSurveys}
              value={String(metrics.activeSurveys)}
            />
            <StatCard
              icon={<UsersIcon className="h-[18px] w-[18px]" />}
              label={dict.dashboard.metricTotalResponses}
              value={metrics.totalResponses.toLocaleString(params.locale === "ar" ? "ar-SA" : "en-US")}
            />
            <StatCard
              icon={<WalletIcon className="h-[18px] w-[18px]" />}
              label={dict.dashboard.metricRewardsDistributed}
              value={formatCurrency(metrics.rewardsDistributed, params.locale)}
            />
            <StatCard
              icon={<BarChartIcon className="h-[18px] w-[18px]" />}
              label={dict.dashboard.metricResearchSpend}
              value={formatCurrency(metrics.researchSpend, params.locale)}
            />
            <StatCard
              icon={<TrendingUpIcon className="h-[18px] w-[18px]" />}
              label={dict.dashboard.metricCompletionRate}
              value={formatPercent(metrics.avgCompletionRate, params.locale)}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ResponsesOverTimeCard data={trend} />
            </div>
            <ResponsesByChannelCard data={channels} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{dict.dashboard.topSurveys}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <THead>
                    <TR>
                      <TH>{dict.dashboard.tableColSurvey}</TH>
                      <TH>{dict.common.status}</TH>
                      <TH>{dict.dashboard.tableColResponses}</TH>
                      <TH>{dict.dashboard.tableColCompletion}</TH>
                      <TH>{dict.dashboard.tableColCreated}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {topSurveys.map((s) => (
                      <TR key={s.id}>
                        <TD>
                          <Link href={`/${params.locale}/surveys/${s.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                            {params.locale === "ar" && s.titleAr ? s.titleAr : s.title}
                          </Link>
                        </TD>
                        <TD>
                          <SurveyStatusBadge status={s.status} />
                        </TD>
                        <TD>{s._count.responses.toLocaleString()}</TD>
                        <TD>{s.completionRate.toFixed(1)}%</TD>
                        <TD>{formatDate(s.createdAt, params.locale)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
              <div className="border-t border-ink-100 p-4 text-center">
                <Link href={`/${params.locale}/surveys`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  {dict.surveys.title} →
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{dict.dashboard.audienceOverview}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{dict.dashboard.topCountries}</p>
                <ul className="mt-3 space-y-3">
                  {topCountries.length === 0 && <p className="text-sm text-ink-400">—</p>}
                  {topCountries.map((c) => (
                    <li key={c.country}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-700">{c.country}</span>
                        <span className="font-medium text-ink-900">{c.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.pct}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${params.locale}/analytics`}
                  className="mt-5 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {dict.dashboard.viewFullAnalytics} →
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
