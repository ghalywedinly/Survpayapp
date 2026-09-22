import { db } from "@/lib/db";
import type { WalletPassData } from "./apple-pass";
import type { Locale } from "@/lib/i18n/config";

/**
 * Resolves a coupon code (shown to the respondent right after they
 * complete a survey) back to everything a wallet pass needs to render.
 * Public/unauthenticated by design — the code is the same bearer token
 * already shown on-screen and used to redeem the coupon in person, so
 * building a wallet pass for it discloses nothing new.
 */
export async function lookupCouponForWallet(code: string, locale: Locale): Promise<WalletPassData | null> {
  const tx = await db.rewardTransaction.findUnique({
    where: { code },
    include: {
      response: {
        include: {
          survey: { include: { organization: true, rewardConfig: true } },
          branch: true,
        },
      },
    },
  });

  if (!tx || tx.type !== "reward" || tx.status !== "completed" || !tx.response) return null;

  const { survey, branch } = tx.response;
  return {
    code,
    amount: tx.amount,
    currency: survey.rewardConfig?.currency ?? "SAR",
    organizationName: survey.organization.name,
    surveyTitle: locale === "ar" && survey.titleAr ? survey.titleAr : survey.title,
    branchName: branch ? (locale === "ar" && branch.nameAr ? branch.nameAr : branch.name) : null,
    redemptionNote: tx.note ?? code,
  };
}
