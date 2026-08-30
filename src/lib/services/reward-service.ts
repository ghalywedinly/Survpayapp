import { db } from "@/lib/db";
import { rewardProviders } from "./reward/providers";

/**
 * RewardService only ever releases a reward for a response that has already
 * been validated (SurveyCompletion → RewardService, never the reverse), and
 * only while the survey's funded budget has room left.
 */
export const RewardService = {
  async processReward(responseId: string) {
    const response = await db.surveyResponse.findUnique({
      where: { id: responseId },
      include: { survey: { include: { rewardConfig: true, rewardBudget: true } } },
    });
    if (!response) throw new Error("Response not found");

    const { rewardConfig, rewardBudget } = response.survey;
    if (!rewardConfig?.enabled || !rewardBudget) {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "not_applicable" } });
      return { issued: false, reason: "rewards_disabled" };
    }

    if (response.status !== "valid") {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "pending" } });
      return { issued: false, reason: "response_not_valid" };
    }

    const remaining = rewardBudget.fundedAmount - rewardBudget.distributedAmount;
    if (remaining < rewardConfig.amount) {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "failed" } });
      return { issued: false, reason: "budget_exhausted" };
    }

    await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "processing" } });

    const provider = rewardProviders[rewardConfig.rewardType] ?? rewardProviders.cash;
    const result = await provider.issue({
      amount: rewardConfig.amount,
      currency: rewardConfig.currency,
      respondentEmail: response.respondentEmail,
    });

    await db.$transaction([
      db.rewardTransaction.create({
        data: {
          budgetId: rewardBudget.id,
          responseId: response.id,
          type: "reward",
          amount: rewardConfig.amount,
          respondents: 1,
          status: result.status,
          provider: provider.type,
          note: result.redemptionNote,
        },
      }),
      db.rewardBudget.update({
        where: { id: rewardBudget.id },
        data: { distributedAmount: { increment: rewardConfig.amount } },
      }),
      db.surveyResponse.update({
        where: { id: response.id },
        data: { rewardStatus: result.status === "completed" ? "completed" : result.status === "failed" ? "failed" : "processing" },
      }),
    ]);

    return { issued: result.status === "completed", status: result.status, redemptionNote: result.redemptionNote, rewardType: rewardConfig.rewardType, amount: rewardConfig.amount, currency: rewardConfig.currency };
  },

  async listBudgetsForOrg(organizationId: string) {
    return db.rewardBudget.findMany({
      where: { organizationId },
      include: { survey: { select: { id: true, title: true, titleAr: true, status: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async orgTotals(organizationId: string) {
    const agg = await db.rewardBudget.aggregate({
      where: { organizationId },
      _sum: { fundedAmount: true, distributedAmount: true },
    });
    const funded = agg._sum.fundedAmount ?? 0;
    const distributed = agg._sum.distributedAmount ?? 0;
    return { funded, distributed, remaining: funded - distributed };
  },

  async getBudgetSummary(surveyId: string) {
    const budget = await db.rewardBudget.findUnique({
      where: { surveyId },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });
    if (!budget) return null;
    const remaining = budget.fundedAmount - budget.distributedAmount;
    const rewardedCount = budget.transactions.filter((t) => t.type === "reward" && t.status === "completed").length;
    return { budget, remaining, rewardedCount };
  },
};
