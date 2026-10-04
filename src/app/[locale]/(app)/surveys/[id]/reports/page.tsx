import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { ReportService } from "@/lib/services/report-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { ReportsClient } from "@/components/survey-builder/reports-client";

export default async function SurveyReportsPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const reports = await ReportService.listForSurvey(survey.id);

  return (
    <div>
      <PageHeader title={dict.reports.title} subtitle={dict.reports.subtitle} />
      <SurveySubnav surveyId={survey.id} active="reports" />
      <div className="mt-5">
        <ReportsClient surveyId={survey.id} reports={reports.map((r) => ({ id: r.id, title: r.title, createdAt: r.createdAt.toISOString() }))} />
      </div>
    </div>
  );
}
