import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/guards";
import { RewardService } from "@/lib/services/reward-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { SurveyStatusBadge } from "@/components/dashboard/survey-status-badge";
import { WalletIcon } from "@/components/icons";

export default async function RewardsPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  const [budgets, totals] = await Promise.all([
    RewardService.listBudgetsForOrg(ctx.organization.id),
    RewardService.orgTotals(ctx.organization.id),
  ]);

  return (
    <div>
      <PageHeader title={dict.rewards.title} subtitle={dict.rewards.subtitle} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={dict.billing.totalFunded} value={formatCurrency(totals.funded, params.locale)} />
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={dict.billing.totalDistributed} value={formatCurrency(totals.distributed, params.locale)} />
        <StatCard icon={<WalletIcon className="h-[18px] w-[18px]" />} label={dict.billing.totalRemaining} value={formatCurrency(totals.remaining, params.locale)} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <p className="text-sm font-semibold text-ink-900">{dict.rewards.allSurveysTitle}</p>
        </div>
        {budgets.length === 0 ? (
          <EmptyState icon={<WalletIcon className="h-6 w-6" />} title={dict.surveys.emptyTitle} body={dict.surveys.emptyBody} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{dict.surveys.colName}</TH>
                <TH>{dict.surveys.colStatus}</TH>
                <TH>{dict.rewards.funded}</TH>
                <TH>{dict.rewards.distributed}</TH>
                <TH>{dict.rewards.remaining}</TH>
              </TR>
            </THead>
            <TBody>
              {budgets.map((b) => {
                const remaining = b.fundedAmount - b.distributedAmount;
                const pct = b.fundedAmount > 0 ? (b.distributedAmount / b.fundedAmount) * 100 : 0;
                const title = params.locale === "ar" && b.survey.titleAr ? b.survey.titleAr : b.survey.title;
                return (
                  <TR key={b.id}>
                    <TD>
                      <Link href={`/${params.locale}/surveys/${b.survey.id}/budget`} className="font-medium text-ink-900 hover:text-brand-600">
                        {title}
                      </Link>
                      <Progress value={pct} className="mt-1.5 h-1 w-32" />
                    </TD>
                    <TD>
                      <SurveyStatusBadge status={b.survey.status} />
                    </TD>
                    <TD>{formatCurrency(b.fundedAmount, params.locale)}</TD>
                    <TD>{formatCurrency(b.distributedAmount, params.locale)}</TD>
                    <TD className="font-medium text-mint-600">{formatCurrency(remaining, params.locale)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
