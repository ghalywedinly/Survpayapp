"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { PaymentService } from "@/lib/services/payment-service";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";

export async function fundBudgetAction(locale: Locale, surveyId: string, amount: number) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  await PaymentService.fundIncentiveBudget({ organizationId: ctx.organization.id, surveyId, amount });
  revalidatePath(`/${locale}/surveys/${surveyId}`);
  revalidatePath(`/${locale}/rewards`);
}

export async function refundBudgetAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  const result = await PaymentService.refundRemainingBudget(surveyId);
  revalidatePath(`/${locale}/surveys/${surveyId}`);
  revalidatePath(`/${locale}/rewards`);
  return result;
}
