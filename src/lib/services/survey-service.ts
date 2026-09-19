import { db } from "@/lib/db";
import { randomCode } from "@/lib/utils";
import { PaymentService } from "./payment-service";
import { NotificationService } from "./notification-service";

export const SurveyService = {
  async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 8; i++) {
      const code = randomCode(6);
      const existing = await db.survey.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new Error("Could not generate a unique survey code");
  },

  async listForOrg(organizationId: string, status?: string) {
    return db.survey.findMany({
      where: {
        organizationId,
        ...(status && status !== "all" ? { status } : {}),
      },
      include: {
        _count: { select: { responses: true } },
        rewardConfig: true,
        rewardBudget: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getFull(surveyId: string, organizationId: string) {
    return db.survey.findFirst({
      where: { id: surveyId, organizationId },
      include: {
        questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        settings: true,
        rewardConfig: true,
        rewardBudget: true,
        _count: { select: { responses: true } },
      },
    });
  },

  async publish(surveyId: string, organizationId: string) {
    const survey = await db.survey.findFirst({
      where: { id: surveyId, organizationId },
      include: { rewardConfig: true, rewardBudget: true },
    });
    if (!survey) throw new Error("Survey not found");

    if (survey.rewardConfig?.enabled) {
      const required = PaymentService.calculateBudget(survey.rewardConfig.amount, survey.rewardConfig.maxResponses).total;
      const funded = survey.rewardBudget?.fundedAmount ?? 0;
      if (funded < required) {
        throw new Error("BUDGET_NOT_FUNDED");
      }
    }

    const updated = await db.survey.update({
      where: { id: surveyId },
      data: { status: "active", publishedAt: new Date() },
    });

    await db.surveyEvent.create({
      data: { surveyId, type: "published", message: "Survey published" },
    });

    return updated;
  },

  async setStatus(surveyId: string, organizationId: string, status: "paused" | "active" | "closed" | "archived") {
    const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId } });
    if (!survey) throw new Error("Survey not found");
    const updated = await db.survey.update({ where: { id: surveyId }, data: { status } });
    await db.surveyEvent.create({ data: { surveyId, type: status === "active" ? "resumed" : status, message: `Survey ${status}` } });
    return updated;
  },

  async duplicate(surveyId: string, organizationId: string) {
    const survey = await db.survey.findFirst({
      where: { id: surveyId, organizationId },
      include: { questions: { include: { options: true } }, settings: true, rewardConfig: true },
    });
    if (!survey) throw new Error("Survey not found");

    const code = await this.generateUniqueCode();
    const copy = await db.survey.create({
      data: {
        organizationId,
        code,
        title: `${survey.title} (copy)`,
        titleAr: survey.titleAr ? `${survey.titleAr} (نسخة)` : null,
        description: survey.description,
        descriptionAr: survey.descriptionAr,
        objective: survey.objective,
        estimatedMinutes: survey.estimatedMinutes,
        status: "draft",
        settings: survey.settings
          ? {
              create: {
                responseLimit: survey.settings.responseLimit,
                anonymousResponses: survey.settings.anonymousResponses,
                requireEmail: survey.settings.requireEmail,
                preventDuplicates: survey.settings.preventDuplicates,
                captchaEnabled: survey.settings.captchaEnabled,
                collectFutureConsent: survey.settings.collectFutureConsent,
                language: survey.settings.language,
              },
            }
          : undefined,
        rewardConfig: survey.rewardConfig
          ? {
              create: {
                enabled: survey.rewardConfig.enabled,
                amount: survey.rewardConfig.amount,
                currency: survey.rewardConfig.currency,
                rewardType: survey.rewardConfig.rewardType,
                maxResponses: survey.rewardConfig.maxResponses,
                platformFeePct: survey.rewardConfig.platformFeePct,
              },
            }
          : undefined,
      },
    });

    for (const q of survey.questions) {
      await db.question.create({
        data: {
          surveyId: copy.id,
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
          options: {
            create: q.options.map((o) => ({ label: o.label, labelAr: o.labelAr, value: o.value, order: o.order })),
          },
        },
      });
    }

    return copy;
  },

  async remove(surveyId: string, organizationId: string) {
    const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId } });
    if (!survey) throw new Error("Survey not found");
    await db.survey.delete({ where: { id: surveyId } });
  },

  async maybeNotifyMilestone(surveyId: string) {
    const survey = await db.survey.findUnique({ where: { id: surveyId }, include: { _count: { select: { responses: true } } } });
    if (!survey) return;
    const count = survey._count.responses;
    if (count > 0 && count % 100 === 0) {
      await db.surveyEvent.create({ data: { surveyId, type: "milestone_100", message: `Reached ${count} responses` } });
      await NotificationService.notify(survey.organizationId, {
        type: "survey_milestone",
        title: `${survey.title} reached ${count} responses`,
        titleAr: `وصل استبيان ${survey.titleAr ?? survey.title} إلى ${count} إجابة`,
        body: `Your survey "${survey.title}" has reached ${count} responses.`,
        bodyAr: `وصل استبيانك "${survey.titleAr ?? survey.title}" إلى ${count} إجابة.`,
      });
    }
  },
};
