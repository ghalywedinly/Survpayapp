import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { RewardService } from "@/lib/services/reward-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { BudgetClient } from "@/components/survey-builder/budget-client";
import { EmptyState } from "@/components/ui/empty-state";
import { WalletIcon } from "@/components/icons";

export default async function SurveyBudgetPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const summary = await RewardService.getBudgetSummary(survey.id);

  return (
    <div>
      <PageHeader title={dict.rewards.title} subtitle={dict.rewards.subtitle} />
      <SurveySubnav surveyId={survey.id} active="budget" />
      <div className="mt-5">
        {!summary ? (
          <EmptyState icon={<WalletIcon className="h-6 w-6" />} title={dict.empty.genericTitle} body="Rewards are not enabled for this survey." />
        ) : (
          <BudgetClient
            surveyId={survey.id}
            funded={summary.budget.fundedAmount}
            distributed={summary.budget.distributedAmount}
            rewardedCount={summary.rewardedCount}
            maxResponses={survey.rewardConfig?.maxResponses ?? 0}
            transactions={summary.budget.transactions.map((tx) => ({ ...tx, createdAt: tx.createdAt.toISOString() }))}
          />
        )}
      </div>
    </div>
  );
}
