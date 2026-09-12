import { requireOrgContext } from "@/lib/auth/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveyWizard } from "@/components/survey-builder/wizard/wizard";

export default async function NewSurveyPage({ params }: { params: { locale: Locale } }) {
  await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  return (
    <div>
      <PageHeader title={dict.wizard.title} />
      <SurveyWizard />
    </div>
  );
}
