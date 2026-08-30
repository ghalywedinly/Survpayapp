"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { PaymentService } from "@/lib/services/payment-service";
import type { ClientQuestion } from "@/lib/question-types";
import type { Locale } from "@/lib/i18n/config";

export interface WizardPayload {
  locale: Locale;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  objective?: string;
  estimatedMinutes: number;
  questions: ClientQuestion[];
  reward: {
    enabled: boolean;
    amount: number;
    currency: string;
    rewardType: "cash" | "gift_card" | "coupon";
    maxResponses: number;
  };
  settings: {
    responseLimit?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    anonymousResponses: boolean;
    requireEmail: boolean;
    preventDuplicates: boolean;
    captchaEnabled: boolean;
    collectFutureConsent: boolean;
  };
  publish: boolean;
}

function questionsCreateInput(questions: ClientQuestion[]) {
  return questions.map((q, idx) => ({
    type: q.type,
    text: q.text || `Question ${idx + 1}`,
    textAr: q.textAr || null,
    description: q.description || null,
    descriptionAr: q.descriptionAr || null,
    required: q.required,
    order: idx,
    isAttentionCheck: q.isAttentionCheck,
    isDemographic: q.isDemographic,
    validation: q.isAttentionCheck && q.attentionExpected ? JSON.stringify({ expected: q.attentionExpected }) : null,
    matrixRows: q.matrixRows.length ? JSON.stringify(q.matrixRows) : null,
    conditionQuestionId: null as string | null, // resolved after insert (needs new ids)
    conditionOperator: q.conditionOperator ?? null,
    conditionValue: q.conditionValue ?? null,
    options: {
      create: q.options.map((o, oi) => ({ label: o.label, labelAr: o.labelAr || null, value: o.value, order: oi })),
    },
    _clientId: q.id,
    _conditionClientId: q.conditionQuestionId ?? null,
  }));
}

export async function createSurveyAction(locale: Locale, payload: WizardPayload) {
  const ctx = await requireOrgContext(locale);

  const code = await SurveyService.generateUniqueCode();
  const qData = questionsCreateInput(payload.questions);

  const survey = await db.survey.create({
    data: {
      organizationId: ctx.organization.id,
      code,
      title: payload.title || "Untitled survey",
      titleAr: payload.titleAr || null,
      description: payload.description || null,
      descriptionAr: payload.descriptionAr || null,
      objective: payload.objective || null,
      estimatedMinutes: payload.estimatedMinutes || 5,
      status: "draft",
      startDate: payload.settings.startDate ? new Date(payload.settings.startDate) : null,
      endDate: payload.settings.endDate ? new Date(payload.settings.endDate) : null,
      settings: {
        create: {
          responseLimit: payload.settings.responseLimit ?? null,
          anonymousResponses: payload.settings.anonymousResponses,
          requireEmail: payload.settings.requireEmail,
          preventDuplicates: payload.settings.preventDuplicates,
          captchaEnabled: payload.settings.captchaEnabled,
          collectFutureConsent: payload.settings.collectFutureConsent,
        },
      },
      rewardConfig: {
        create: {
          enabled: payload.reward.enabled,
          amount: payload.reward.amount,
          currency: payload.reward.currency || "SAR",
          rewardType: payload.reward.rewardType,
          maxResponses: payload.reward.maxResponses,
        },
      },
    },
  });

  // Insert questions, then wire up conditional logic references (client ids -> real ids).
  const idMap = new Map<string, string>();
  for (const q of qData) {
    const created = await db.question.create({
      data: {
        surveyId: survey.id,
        type: q.type,
        text: q.text,
        textAr: q.textAr,
        description: q.description,
        descriptionAr: q.descriptionAr,
        required: q.required,
        order: q.order,
        isAttentionCheck: q.isAttentionCheck,
        isDemographic: q.isDemographic,
        validation: q.validation,
        matrixRows: q.matrixRows,
        conditionOperator: q.conditionOperator,
        conditionValue: q.conditionValue,
        options: q.options,
      },
    });
    idMap.set(q._clientId, created.id);
  }
  for (const q of qData) {
    if (q._conditionClientId) {
      const realId = idMap.get(q._conditionClientId);
      const thisId = idMap.get(q._clientId);
      if (realId && thisId) {
        await db.question.update({ where: { id: thisId }, data: { conditionQuestionId: realId } });
      }
    }
  }

  if (payload.reward.enabled) {
    const required = PaymentService.calculateBudget(payload.reward.amount, payload.reward.maxResponses).total;
    await PaymentService.fundIncentiveBudget({
      organizationId: ctx.organization.id,
      surveyId: survey.id,
      amount: required,
    });
  }

  if (payload.publish) {
    await SurveyService.publish(survey.id, ctx.organization.id);
  }

  revalidatePath(`/${locale}/surveys`);
  return { id: survey.id };
}

export async function publishSurveyAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  try {
    await SurveyService.publish(surveyId, ctx.organization.id);
    revalidatePath(`/${locale}/surveys`);
    return { ok: true as const };
  } catch (e) {
    if (e instanceof Error && e.message === "BUDGET_NOT_FUNDED") return { ok: false as const, error: "BUDGET_NOT_FUNDED" };
    return { ok: false as const, error: "UNKNOWN" };
  }
}

export async function setSurveyStatusAction(locale: Locale, surveyId: string, status: "paused" | "active" | "closed" | "archived") {
  const ctx = await requireOrgContext(locale);
  await SurveyService.setStatus(surveyId, ctx.organization.id, status);
  revalidatePath(`/${locale}/surveys`);
}

export async function duplicateSurveyAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  const copy = await SurveyService.duplicate(surveyId, ctx.organization.id);
  revalidatePath(`/${locale}/surveys`);
  return { id: copy.id };
}

export async function deleteSurveyAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  await SurveyService.remove(surveyId, ctx.organization.id);
  revalidatePath(`/${locale}/surveys`);
}

export async function updateSurveyBasicsAction(
  locale: Locale,
  surveyId: string,
  data: { title: string; titleAr?: string; description?: string; descriptionAr?: string; objective?: string; estimatedMinutes: number }
) {
  const ctx = await requireOrgContext(locale);
  await db.survey.updateMany({
    where: { id: surveyId, organizationId: ctx.organization.id },
    data: {
      title: data.title,
      titleAr: data.titleAr || null,
      description: data.description || null,
      descriptionAr: data.descriptionAr || null,
      objective: data.objective || null,
      estimatedMinutes: data.estimatedMinutes,
    },
  });
  revalidatePath(`/${locale}/surveys/${surveyId}`);
}

export async function updateSurveyQuestionsAction(locale: Locale, surveyId: string, questions: ClientQuestion[]) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");

  const qData = questionsCreateInput(questions);

  await db.$transaction([db.question.deleteMany({ where: { surveyId } })]);

  const idMap = new Map<string, string>();
  for (const q of qData) {
    const created = await db.question.create({
      data: {
        surveyId,
        type: q.type,
        text: q.text,
        textAr: q.textAr,
        description: q.description,
        descriptionAr: q.descriptionAr,
        required: q.required,
        order: q.order,
        isAttentionCheck: q.isAttentionCheck,
        isDemographic: q.isDemographic,
        validation: q.validation,
        matrixRows: q.matrixRows,
        conditionOperator: q.conditionOperator,
        conditionValue: q.conditionValue,
        options: q.options,
      },
    });
    idMap.set(q._clientId, created.id);
  }
  for (const q of qData) {
    if (q._conditionClientId) {
      const realId = idMap.get(q._conditionClientId);
      const thisId = idMap.get(q._clientId);
      if (realId && thisId) {
        await db.question.update({ where: { id: thisId }, data: { conditionQuestionId: realId } });
      }
    }
  }

  revalidatePath(`/${locale}/surveys/${surveyId}`);
  return { ok: true };
}

export async function updateSurveyRewardAction(
  locale: Locale,
  surveyId: string,
  reward: { enabled: boolean; amount: number; currency: string; rewardType: "cash" | "gift_card" | "coupon"; maxResponses: number }
) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  await db.rewardConfig.upsert({
    where: { surveyId },
    update: reward,
    create: { surveyId, ...reward },
  });
  revalidatePath(`/${locale}/surveys/${surveyId}`);
}

export async function updateSurveySettingsAction(
  locale: Locale,
  surveyId: string,
  settings: {
    responseLimit?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    anonymousResponses: boolean;
    requireEmail: boolean;
    preventDuplicates: boolean;
    captchaEnabled: boolean;
    collectFutureConsent: boolean;
  }
) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  await db.surveySettings.upsert({
    where: { surveyId },
    update: {
      responseLimit: settings.responseLimit ?? null,
      anonymousResponses: settings.anonymousResponses,
      requireEmail: settings.requireEmail,
      preventDuplicates: settings.preventDuplicates,
      captchaEnabled: settings.captchaEnabled,
      collectFutureConsent: settings.collectFutureConsent,
    },
    create: {
      surveyId,
      responseLimit: settings.responseLimit ?? null,
      anonymousResponses: settings.anonymousResponses,
      requireEmail: settings.requireEmail,
      preventDuplicates: settings.preventDuplicates,
      captchaEnabled: settings.captchaEnabled,
      collectFutureConsent: settings.collectFutureConsent,
    },
  });
  await db.survey.update({
    where: { id: surveyId },
    data: {
      startDate: settings.startDate ? new Date(settings.startDate) : null,
      endDate: settings.endDate ? new Date(settings.endDate) : null,
    },
  });
  revalidatePath(`/${locale}/surveys/${surveyId}`);
}
