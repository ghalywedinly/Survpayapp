"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { AIService } from "@/lib/services/ai-service";
import { ReportService } from "@/lib/services/report-service";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";

export async function generateInsightsAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  const payload = await AIService.generateSurveyInsights(surveyId);
  await AIService.persist(surveyId, payload);
  revalidatePath(`/${locale}/surveys/${surveyId}/analytics`);
  return payload;
}

export async function generateReportAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  const report = await ReportService.generate(surveyId, survey.title);
  revalidatePath(`/${locale}/surveys/${surveyId}/reports`);
  revalidatePath(`/${locale}/reports`);
  return { id: report.id };
}
