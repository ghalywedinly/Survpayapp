import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { ResponseService } from "@/lib/services/response-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDuration } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { ResponsesClient } from "@/components/survey-builder/responses-client";
import { InboxIcon, CheckCircleIcon, FlagIcon, ClockIcon } from "@/components/icons";

export default async function SurveyResponsesPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const [stats, responses] = await Promise.all([
    ResponseService.getStats(survey.id),
    ResponseService.listForSurvey(survey.id),
  ]);

  return (
    <div>
      <PageHeader title={dict.responses.title} subtitle={dict.responses.subtitle} />
      <SurveySubnav surveyId={survey.id} active="responses" />

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<InboxIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricTotal} value={String(stats.total)} />
        <StatCard icon={<CheckCircleIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricValid} value={String(stats.valid)} />
        <StatCard icon={<FlagIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricFlagged} value={String(stats.flagged)} />
        <StatCard icon={<ClockIcon className="h-[18px] w-[18px]" />} label={dict.responses.metricAvgTime} value={formatDuration(stats.avgCompletionSeconds, params.locale)} />
      </div>

      <Card className="mt-6 p-5">
        <ResponsesClient
          surveyId={survey.id}
          responses={responses.map((r) => ({
            id: r.id,
            status: r.status,
            rewardStatus: r.rewardStatus,
            country: r.country,
            device: r.device,
            completionSeconds: r.completionSeconds,
            submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
            failedAttentionCheck: r.failedAttentionCheck,
            answers: r.answers.map((a) => ({ questionId: a.questionId, value: a.value })),
          }))}
          questions={survey.questions.map((q) => ({ id: q.id, text: q.text, textAr: q.textAr }))}
        />
      </Card>
    </div>
  );
}
