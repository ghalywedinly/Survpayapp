"use server";

import { requireOrgContext } from "@/lib/auth/guards";
import { CouponService } from "@/lib/services/coupon-service";
import type { Locale } from "@/lib/i18n/config";

export async function checkCouponAction(locale: Locale, code: string) {
  const ctx = await requireOrgContext(locale);
  return CouponService.checkCode(ctx.organization.id, code);
}

export async function redeemCouponAction(locale: Locale, code: string, note?: string) {
  const ctx = await requireOrgContext(locale);
  return CouponService.redeemCode(ctx.organization.id, code, note);
}

export async function listRecentCouponsAction(locale: Locale) {
  const ctx = await requireOrgContext(locale);
  return CouponService.listRecent(ctx.organization.id);
}
