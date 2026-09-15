import { requireOrgContext } from "@/lib/auth/guards";
import { RewardService } from "@/lib/services/reward-service";
import { PaymentService } from "@/lib/services/payment-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { PlanId } from "@/lib/pricing";
import { PageHeader } from "@/components/dashboard/page-header";
import { BillingClient } from "@/components/dashboard/billing-client";

export default async function BillingPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);

  const [totals, invoices, transactions] = await Promise.all([
    RewardService.orgTotals(ctx.organization.id),
    PaymentService.listInvoices(ctx.organization.id),
    PaymentService.listTransactions(ctx.organization.id),
  ]);

  return (
    <div>
      <PageHeader title={dict.billing.title} subtitle={dict.billing.subtitle} />
      <BillingClient
        currentPlan={ctx.organization.plan as PlanId}
        totals={totals}
        invoices={invoices.map((i) => ({
          id: i.id,
          number: i.number,
          amount: i.amount,
          status: i.status,
          periodStart: i.periodStart.toISOString(),
          periodEnd: i.periodEnd.toISOString(),
        }))}
        transactions={transactions.map((t) => ({
          id: t.id,
          purpose: t.purpose,
          amount: t.amount,
          status: t.status,
          description: t.description,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
