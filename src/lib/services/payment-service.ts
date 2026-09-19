import { db } from "@/lib/db";
import { paymentProvider } from "./payment/mock-payment-provider";
import { platformFeePct } from "@/lib/pricing";

// Researcher billing (subscriptions, invoices) and incentive funding both
// flow through PaymentService, but are recorded as distinct PaymentTransaction
// purposes ("subscription" vs "incentive_funding") so the two financial
// concepts never blur together in reporting.

export const PaymentService = {
  platformFeePct,

  calculateBudget(rewardAmount: number, maxResponses: number) {
    const incentiveBudget = round2(rewardAmount * maxResponses);
    const platformFee = round2(incentiveBudget * platformFeePct);
    const total = round2(incentiveBudget + platformFee);
    return { incentiveBudget, platformFee, total };
  },

  /** Fund a survey's incentive budget. Charges the org's payment method (mocked) and records both the funding transaction and the reward-budget ledger entry. */
  async fundIncentiveBudget(params: {
    organizationId: string;
    surveyId: string;
    amount: number;
    currency?: string;
  }) {
    const currency = params.currency ?? "SAR";
    const result = await paymentProvider.charge({
      organizationId: params.organizationId,
      amount: params.amount,
      currency,
      description: `Incentive budget funding for survey ${params.surveyId}`,
    });

    await db.paymentTransaction.create({
      data: {
        organizationId: params.organizationId,
        purpose: "incentive_funding",
        amount: params.amount,
        currency,
        status: result.status,
        provider: paymentProvider.name,
        providerRef: result.providerRef,
        relatedSurveyId: params.surveyId,
        description: `Incentive budget funding`,
      },
    });

    const budget = await db.rewardBudget.upsert({
      where: { surveyId: params.surveyId },
      update: { fundedAmount: { increment: params.amount } },
      create: {
        surveyId: params.surveyId,
        organizationId: params.organizationId,
        fundedAmount: params.amount,
        currency,
      },
    });

    await db.rewardTransaction.create({
      data: {
        budgetId: budget.id,
        type: "funding",
        amount: params.amount,
        status: "completed",
        provider: paymentProvider.name,
        note: "Incentive budget funded",
      },
    });

    return { result, budget };
  },

  async listInvoices(organizationId: string) {
    return db.invoice.findMany({ where: { organizationId }, orderBy: { issuedAt: "desc" } });
  },

  async listTransactions(organizationId: string, limit = 20) {
    return db.paymentTransaction.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: limit });
  },

  async refundRemainingBudget(surveyId: string) {
    const budget = await db.rewardBudget.findUnique({ where: { surveyId } });
    if (!budget) throw new Error("No budget found for survey");
    const remaining = round2(budget.fundedAmount - budget.distributedAmount);
    if (remaining <= 0) return { refunded: 0 };

    const result = await paymentProvider.refund({
      providerRef: `budget_${budget.id}`,
      amount: remaining,
      currency: budget.currency,
    });

    await db.paymentTransaction.create({
      data: {
        organizationId: budget.organizationId,
        purpose: "refund",
        amount: remaining,
        currency: budget.currency,
        status: result.status,
        provider: paymentProvider.name,
        providerRef: result.providerRef,
        relatedSurveyId: surveyId,
        description: "Refund of unused incentive budget",
      },
    });

    await db.rewardTransaction.create({
      data: {
        budgetId: budget.id,
        type: "refund",
        amount: remaining,
        status: "completed",
        provider: paymentProvider.name,
        note: "Remaining balance refunded",
      },
    });

    await db.rewardBudget.update({
      where: { id: budget.id },
      data: { fundedAmount: { decrement: remaining } },
    });

    return { refunded: remaining };
  },
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
