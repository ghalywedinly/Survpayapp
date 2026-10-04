import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { fromServerQuestion } from "@/lib/question-types";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { BuilderClient } from "@/components/survey-builder/builder-client";

export default async function SurveyEditPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  return (
    <div>
      <PageHeader title={params.locale === "ar" && survey.titleAr ? survey.titleAr : survey.title} />
      <SurveySubnav surveyId={survey.id} active="edit" />
      <div className="mt-5">
        <BuilderClient surveyId={survey.id} status={survey.status} initialQuestions={survey.questions.map(fromServerQuestion)} />
      </div>
    </div>
  );
}
