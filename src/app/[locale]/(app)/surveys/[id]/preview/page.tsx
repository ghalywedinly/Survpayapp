import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { PreviewShell } from "@/components/survey-builder/preview-shell";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";

export default async function SurveyPreviewPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  return (
    <div>
      <PageHeader title={dict.preview.title} subtitle={dict.preview.subtitle} />
      <SurveySubnav surveyId={survey.id} active="preview" />
      <div className="mt-5">
        <PreviewShell
          surveyId={survey.id}
          title={survey.title}
          titleAr={survey.titleAr}
          description={survey.description}
          descriptionAr={survey.descriptionAr}
          estimatedMinutes={survey.estimatedMinutes}
          questions={survey.questions.map((q) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            textAr: q.textAr,
            description: q.description,
            descriptionAr: q.descriptionAr,
            required: q.required,
            options: q.options,
            matrixRows: q.matrixRows ? JSON.parse(q.matrixRows) : [],
            conditionQuestionId: q.conditionQuestionId,
            conditionOperator: q.conditionOperator,
            conditionValue: q.conditionValue,
          }))}
        />
      </div>
    </div>
  );
}
