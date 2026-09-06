import { AdminService } from "@/lib/services/admin-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BuildingIcon, UsersIcon, ListIcon, WalletIcon, CreditCardIcon, PlayIcon } from "@/components/icons";

const planTone: Record<string, "neutral" | "brand" | "success"> = { free: "neutral", pro: "brand", business: "success" };
const activityIcon = { signup: BuildingIcon, survey_published: PlayIcon, subscription: CreditCardIcon };

export default async function AdminOverviewPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const t = dict.admin;
  const [overview, activity] = await Promise.all([AdminService.getOverview(), AdminService.listRecentActivity(12)]);

  return (
    <div>
      <PageHeader title={t.overviewTitle} subtitle={t.overviewSubtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<BuildingIcon className="h-[18px] w-[18px]" />}
          label={t.statOrganizations}
          value={formatNumber(overview.totalOrganizations, params.locale)}
          delta={overview.newOrgs30d > 0 ? String(overview.newOrgs30d) : undefined}
          deltaLabel={t.new30d}
        />
        <StatCard
          icon={<UsersIcon className="h-[18px] w-[18px]" />}
          label={t.statUsers}
          value={formatNumber(overview.totalUsers, params.locale)}
          delta={overview.newUsers30d > 0 ? String(overview.newUsers30d) : undefined}
          deltaLabel={t.new30d}
        />
        <StatCard
          icon={<ListIcon className="h-[18px] w-[18px]" />}
          label={t.statSurveys}
          value={formatNumber(overview.totalSurveys, params.locale)}
          delta={String(overview.publishedSurveys)}
          deltaLabel={t.statPublishedSurveys}
          deltaTone="success"
        />
        <StatCard
          icon={<UsersIcon className="h-[18px] w-[18px]" />}
          label={t.statResponses}
          value={formatNumber(overview.totalResponses, params.locale)}
          delta={String(overview.totalValidResponses)}
          deltaLabel={t.statValidResponses}
          deltaTone="success"
        />
        <StatCard
          icon={<WalletIcon className="h-[18px] w-[18px]" />}
          label={t.statRewardsDistributed}
          value={formatCurrency(overview.totalRewardsDistributed, params.locale)}
        />
        <StatCard
          icon={<CreditCardIcon className="h-[18px] w-[18px]" />}
          label={t.statSubscriptionRevenue}
          value={formatCurrency(overview.totalSubscriptionRevenue, params.locale)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t.planBreakdownTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(overview.planBreakdown).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <Badge tone={planTone[plan] ?? "neutral"} className="capitalize">
                  {plan}
                </Badge>
                <span className="text-sm font-semibold text-ink-900">{formatNumber(count, params.locale)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-ink-100 px-5 py-4">
            <p className="text-sm font-semibold text-ink-900">{t.recentActivityTitle}</p>
          </div>
          {activity.length === 0 ? (
            <EmptyState icon={<ListIcon className="h-6 w-6" />} title={t.recentActivityTitle} body={t.recentActivityEmpty} />
          ) : (
            <ul className="divide-y divide-ink-100">
              {activity.map((ev, i) => {
                const Icon = activityIcon[ev.kind];
                const kindLabel = ev.kind === "signup" ? t.activitySignup : ev.kind === "survey_published" ? t.activitySurveyPublished : t.activitySubscription;
                return (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-content">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{ev.label}</p>
                      <p className="truncate text-xs text-ink-500">
                        {kindLabel} · {ev.detail}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-ink-400">{formatDate(ev.at, params.locale)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
