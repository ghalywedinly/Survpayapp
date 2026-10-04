import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { ReportService } from "@/lib/services/report-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FileTextIcon, DownloadIcon } from "@/components/icons";

export default async function ReportsOverviewPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const reports = await ReportService.listForOrg(ctx.organization.id);

  return (
    <div>
      <PageHeader title={dict.reports.allReportsTitle} subtitle={dict.reports.subtitle} />

      {reports.length === 0 ? (
        <EmptyState
          icon={<FileTextIcon className="h-6 w-6" />}
          title={dict.reports.noReportsTitle}
          body={dict.reports.noReportsBody}
          action={
            <Link href={`/${params.locale}/surveys`} className={buttonClasses()}>
              {dict.surveys.title}
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-400">
                    {params.locale === "ar" && r.survey.titleAr ? r.survey.titleAr : r.survey.title} · {dict.reports.generatedOn} {formatDate(r.createdAt, params.locale)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/api/surveys/${r.survey.id}/report/pdf`} className="inline-flex">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <DownloadIcon className="h-3.5 w-3.5" />
                      {dict.reports.exportPdf}
                    </Button>
                  </a>
                  <a href={`/api/surveys/${r.survey.id}/report/excel`} className="inline-flex">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <DownloadIcon className="h-3.5 w-3.5" />
                      {dict.reports.exportExcel}
                    </Button>
                  </a>
                  <Link href={`/${params.locale}/surveys/${r.survey.id}/reports`} className={buttonClasses({ variant: "ghost", size: "sm" })}>
                    {dict.common.viewDetails}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
