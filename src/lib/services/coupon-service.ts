import { db } from "@/lib/db";

// Coupon codes are stored on RewardTransaction.code (unique) — see
// RewardService.processReward, which sets it only for provider === "coupon".
// This service is the counter-side half: a staff member types or scans the
// code the respondent is showing them, and it's looked up scoped to their
// own organization (so one org can never see or redeem another org's
// codes) and marked redeemed exactly once.

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase();
}

async function findByCode(organizationId: string, rawCode: string) {
  const code = normalizeCode(rawCode);
  if (!code) return null;
  return db.rewardTransaction.findFirst({
    where: { code, budget: { organizationId } },
    include: {
      budget: { include: { survey: { select: { id: true, title: true, titleAr: true } } } },
    },
  });
}

export const CouponService = {
  async checkCode(organizationId: string, rawCode: string) {
    const tx = await findByCode(organizationId, rawCode);
    if (!tx) return { found: false as const };
    return {
      found: true as const,
      redeemed: tx.redeemedAt !== null,
      code: tx.code!,
      amount: tx.amount,
      issuedAt: tx.createdAt,
      redeemedAt: tx.redeemedAt,
      redeemedNote: tx.redeemedNote,
      survey: tx.budget.survey,
    };
  },

  async redeemCode(organizationId: string, rawCode: string, redeemedNote?: string) {
    const tx = await findByCode(organizationId, rawCode);
    if (!tx) return { ok: false as const, reason: "not_found" as const };
    if (tx.redeemedAt) return { ok: false as const, reason: "already_redeemed" as const, redeemedAt: tx.redeemedAt };

    // Atomic guard against a double-tap / concurrent redemption: only
    // succeeds if redeemedAt is still null at write time.
    const result = await db.rewardTransaction.updateMany({
      where: { id: tx.id, redeemedAt: null },
      data: { redeemedAt: new Date(), redeemedNote: redeemedNote?.trim() || null },
    });
    if (result.count === 0) return { ok: false as const, reason: "already_redeemed" as const, redeemedAt: new Date() };

    return {
      ok: true as const,
      code: tx.code!,
      amount: tx.amount,
      survey: tx.budget.survey,
    };
  },

  async listRecent(organizationId: string, limit = 20) {
    const rows = await db.rewardTransaction.findMany({
      where: { budget: { organizationId }, code: { not: null } },
      include: { budget: { include: { survey: { select: { id: true, title: true, titleAr: true } } } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((tx) => ({
      code: tx.code!,
      amount: tx.amount,
      issuedAt: tx.createdAt,
      redeemedAt: tx.redeemedAt,
      survey: tx.budget.survey,
    }));
  },
};
