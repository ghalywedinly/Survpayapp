"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import type { PlanId } from "@/lib/pricing";
import type { Locale } from "@/lib/i18n/config";

export async function changePlanAction(locale: Locale, planId: PlanId) {
  const ctx = await requireOrgContext(locale);
  await db.organization.update({ where: { id: ctx.organization.id }, data: { plan: planId } });
  revalidatePath(`/${locale}/billing`);
  revalidatePath(`/${locale}/dashboard`);
}
