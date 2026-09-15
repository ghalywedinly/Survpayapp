import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { SurveysTable } from "@/components/dashboard/surveys-table";
import { SurveysTabs } from "@/components/dashboard/surveys-tabs";
import { ListIcon, PlusIcon } from "@/components/icons";

export default async function SurveysPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { tab?: string };
}) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const tab = searchParams.tab ?? "all";
  const surveys = await SurveyService.listForOrg(ctx.organization.id, tab === "all" ? undefined : tab);

  return (
    <div>
      <PageHeader
        title={dict.surveys.title}
        subtitle={dict.surveys.subtitle}
        actions={
          <Link href={`/${params.locale}/surveys/new`} className={buttonClasses({ className: "gap-1.5" })}>
            <PlusIcon className="h-4 w-4" />
            {dict.surveys.newSurvey}
          </Link>
        }
      />

      <SurveysTabs activeTab={tab} />

      {surveys.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={<ListIcon className="h-6 w-6" />}
            title={dict.surveys.emptyTitle}
            body={dict.surveys.emptyBody}
            action={
              <Link href={`/${params.locale}/surveys/new`} className={buttonClasses()}>
                {dict.surveys.emptyCta}
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <SurveysTable
            surveys={surveys.map((s) => ({
              ...s,
              createdAt: s.createdAt.toISOString(),
              updatedAt: s.updatedAt.toISOString(),
            }))}
          />
        </Card>
      )}
    </div>
  );
}
