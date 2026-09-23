import { AdminService } from "@/lib/services/admin-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatNumber, formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon, CheckCircleIcon, AlertIcon, FlagIcon } from "@/components/icons";

const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  valid: "success",
  flagged: "warning",
  rejected: "danger",
  pending: "neutral",
};

const rewardTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  processing: "warning",
  failed: "danger",
  pending: "neutral",
  not_applicable: "neutral",
};

function TopList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize text-ink-700">{r.label}</span>
              <span className="font-medium text-ink-900">{r.count}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function AdminParticipantsPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const t = dict.admin;
  const [stats, recent] = await Promise.all([AdminService.getParticipantStats(), AdminService.listRecentResponses(50)]);

  return (
    <div>
      <PageHeader title={t.participantsTitle} subtitle={t.participantsSubtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<UsersIcon className="h-[18px] w-[18px]" />} label={t.statResponses} value={formatNumber(stats.total, params.locale)} />
        <StatCard icon={<CheckCircleIcon className="h-[18px] w-[18px]" />} label={t.statValidResponses} value={formatNumber(stats.valid, params.locale)} />
        <StatCard icon={<FlagIcon className="h-[18px] w-[18px]" />} label={t.statFlagged} value={formatNumber(stats.flagged, params.locale)} />
        <StatCard icon={<AlertIcon className="h-[18px] w-[18px]" />} label={t.statRejected} value={formatNumber(stats.rejected, params.locale)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopList title={t.topCountriesTitle} rows={stats.topCountries} />
        <TopList title={t.topDevicesTitle} rows={stats.topDevices} />
        <TopList title={t.topSourcesTitle} rows={stats.topSources} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <p className="text-sm font-semibold text-ink-900">{t.recentResponsesTitle}</p>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={<UsersIcon className="h-6 w-6" />} title={t.recentResponsesTitle} body={t.recentResponsesEmpty} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>{t.colSurvey}</TH>
                  <TH>{t.colOrganization}</TH>
                  <TH>{t.colCountry}</TH>
                  <TH>{t.colDevice}</TH>
                  <TH>{t.colStatus}</TH>
                  <TH>{t.colRewardStatus}</TH>
                  <TH>{t.colDate}</TH>
                </TR>
              </THead>
              <TBody>
                {recent.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-medium text-ink-900">{r.surveyTitle}</TD>
                    <TD className="text-ink-500">{r.organizationName}</TD>
                    <TD>{r.country ?? "—"}</TD>
                    <TD className="capitalize">{r.device ?? "—"}</TD>
                    <TD>
                      <Badge tone={statusTone[r.status] ?? "neutral"} className="capitalize">
                        {r.status}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone={rewardTone[r.rewardStatus] ?? "neutral"} className="capitalize">
                        {r.rewardStatus.replace("_", " ")}
                      </Badge>
                    </TD>
                    <TD className="text-ink-500">{formatDate(r.createdAt, params.locale)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
