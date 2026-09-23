import { db } from "@/lib/db";
import { rewardProviders, generateCouponCode } from "./reward/providers";
import { Prisma } from "@prisma/client";

/**
 * RewardService only ever releases a reward for a response that has already
 * been validated (SurveyCompletion → RewardService, never the reverse), and
 * only while the survey's response cap (rewardConfig.maxResponses) has room
 * left. Rewards are always a percentage-discount coupon — never cash or a
 * fixed monetary amount — so there is no budget to fund, spend, or refund.
 */
export const RewardService = {
  async processReward(responseId: string) {
    const response = await db.surveyResponse.findUnique({
      where: { id: responseId },
      include: { survey: { include: { rewardConfig: true } } },
    });
    if (!response) throw new Error("Response not found");

    const { rewardConfig } = response.survey;
    if (!rewardConfig?.enabled) {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "not_applicable" } });
      return { issued: false, reason: "rewards_disabled" };
    }

    if (response.status !== "valid") {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "pending" } });
      return { issued: false, reason: "response_not_valid" };
    }

    const issuedCount = await db.rewardTransaction.count({
      where: { surveyId: response.surveyId, status: "completed" },
    });
    if (issuedCount >= rewardConfig.maxResponses) {
      await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "failed" } });
      return { issued: false, reason: "cap_reached" };
    }

    await db.surveyResponse.update({ where: { id: responseId }, data: { rewardStatus: "processing" } });

    const provider = rewardProviders[rewardConfig.rewardType] ?? rewardProviders.coupon;
    const result = await provider.issue({
      discountPercent: rewardConfig.discountPercent,
      respondentEmail: response.respondentEmail,
    });

    // Coupon codes are DB-unique (RewardTransaction.code) so the coupon-check
    // tool can look one up unambiguously. A collision against the ~1-in-a-
    // billion code space is astronomically unlikely, but since it's cheap to
    // guard against, regenerate and retry a couple of times rather than
    // fail the respondent's reward over it.
    let code = result.redemptionCode ?? null;
    let attempt = 0;
    for (;;) {
      try {
        await db.$transaction([
          db.rewardTransaction.create({
            data: {
              surveyId: response.surveyId,
              responseId: response.id,
              status: result.status,
              provider: provider.type,
              note: result.redemptionNote,
              code,
            },
          }),
          db.surveyResponse.update({
            where: { id: response.id },
            data: { rewardStatus: result.status === "completed" ? "completed" : result.status === "failed" ? "failed" : "processing" },
          }),
        ]);
        break;
      } catch (e) {
        const isCodeCollision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" && code;
        if (!isCodeCollision || attempt >= 3) throw e;
        attempt += 1;
        code = generateCouponCode();
      }
    }

    return {
      issued: result.status === "completed",
      status: result.status,
      redemptionNote: result.redemptionNote,
      redemptionCode: code,
      rewardType: rewardConfig.rewardType,
      discountPercent: rewardConfig.discountPercent,
    };
  },

  /** Read-only coupon activity for a survey — issuance/redemption counts and the transaction log, with no monetary figures. */
  async getCouponActivity(surveyId: string) {
    const [rewardConfig, transactions] = await Promise.all([
      db.rewardConfig.findUnique({ where: { surveyId } }),
      db.rewardTransaction.findMany({ where: { surveyId }, orderBy: { createdAt: "desc" } }),
    ]);
    if (!rewardConfig) return null;
    const issuedCount = transactions.filter((t) => t.status === "completed").length;
    const redeemedCount = transactions.filter((t) => t.redeemedAt !== null).length;
    return { rewardConfig, transactions, issuedCount, redeemedCount };
  },
};
