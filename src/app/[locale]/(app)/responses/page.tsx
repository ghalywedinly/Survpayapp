import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { ResponseService } from "@/lib/services/response-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDuration } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { SurveyStatusBadge } from "@/components/dashboard/survey-status-badge";
import { InboxIcon, CheckCircleIcon, FlagIcon, ClockIcon } from "@/components/icons";

export default async function ResponsesOverviewPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  const [stats, surveys] = await Promise.all([
    ResponseService.orgStats(ctx.organization.id),
    SurveyService.listForOrg(ctx.organization.id),
  ]);

  return (
    <div>
      <PageHeader title={dict.responses.title} subtitle={dict.responses.subtitle} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<InboxIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricTotal} value={stats.total.toLocaleString()} />
        <StatCard icon={<CheckCircleIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricValid} value={stats.valid.toLocaleString()} />
        <StatCard icon={<FlagIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricFlagged} value={stats.flagged.toLocaleString()} />
        <StatCard icon={<ClockIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricAvgTime} value={formatDuration(stats.avgCompletionSeconds, params.locale)} />
      </div>

      <Card className="mt-6 overflow-hidden">
        {surveys.length === 0 ? (
          <EmptyState icon={<InboxIcon className="h-6 w-6" />} title={dict.responses.emptyTitle} body={dict.responses.emptyBody} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{dict.surveys.colName}</TH>
                <TH>{dict.surveys.colStatus}</TH>
                <TH>{dict.dashboard.tableColResponses}</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {surveys.map((s) => (
                <TR key={s.id}>
                  <TD className="font-medium text-ink-900">{params.locale === "ar" && s.titleAr ? s.titleAr : s.title}</TD>
                  <TD>
                    <SurveyStatusBadge status={s.status} />
                  </TD>
                  <TD>{s._count.responses.toLocaleString()}</TD>
                  <TD>
                    <Link href={`/${params.locale}/surveys/${s.id}/responses`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
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
