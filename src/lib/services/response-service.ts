import { db } from "@/lib/db";
import { RewardService } from "./reward-service";
import { SurveyService } from "./survey-service";

// Very small in-memory rate limiter: keyed by respondent fingerprint, allows
// at most one submission every 5 seconds. Fine for a single-instance demo;
// architecture-ready for a real store (Redis) behind the same call shape.
const lastSubmissionAt = new Map<string, number>();

export type SubmitAnswer = { questionId: string; value: unknown };

export type SubmitResponseInput = {
  answers: SubmitAnswer[];
  startedAt: number; // client-supplied ms timestamp — completion-time tracking
  respondentEmail?: string;
  respondentHash: string; // client fingerprint (cookie-based), never raw PII alone
  device?: string;
  country?: string;
  source?: string;
  futureConsent?: boolean;
};

export const ResponseService = {
  async checkEligibility(surveyCode: string, respondentHash: string) {
    const survey = await db.survey.findUnique({
      where: { code: surveyCode },
      include: { settings: true, _count: { select: { responses: true } } },
    });
    if (!survey) return { ok: false as const, reason: "not_found" as const };
    if (survey.status === "closed" || survey.status === "archived") return { ok: false as const, reason: "closed" as const, survey };
    if (survey.status === "draft" || survey.status === "scheduled") return { ok: false as const, reason: "closed" as const, survey };
    if (survey.endDate && new Date() > survey.endDate) return { ok: false as const, reason: "closed" as const, survey };
    if (survey.settings?.responseLimit && survey._count.responses >= survey.settings.responseLimit) {
      return { ok: false as const, reason: "closed" as const, survey };
    }
    if (survey.settings?.preventDuplicates) {
      const existing = await db.surveyResponse.findFirst({
        where: { surveyId: survey.id, respondentHash, submittedAt: { not: null } },
      });
      if (existing) return { ok: false as const, reason: "duplicate" as const, survey };
    }
    return { ok: true as const, survey };
  },

  async submit(surveyCode: string, input: SubmitResponseInput) {
    const now = Date.now();
    const last = lastSubmissionAt.get(input.respondentHash);
    if (last && now - last < 5000) {
      throw new Error("RATE_LIMITED");
    }
    lastSubmissionAt.set(input.respondentHash, now);

    const eligibility = await this.checkEligibility(surveyCode, input.respondentHash);
    if (!eligibility.ok) throw new Error(eligibility.reason.toUpperCase());
    const survey = await db.survey.findUnique({
      where: { code: surveyCode },
      include: { questions: true, settings: true, rewardConfig: true },
    });
    if (!survey) throw new Error("NOT_FOUND");

    // Required-question validation
    for (const q of survey.questions) {
      if (!q.required) continue;
      const answer = input.answers.find((a) => a.questionId === q.id);
      const empty =
        answer === undefined ||
        answer.value === undefined ||
        answer.value === null ||
        answer.value === "" ||
        (Array.isArray(answer.value) && answer.value.length === 0);
      if (empty) throw new Error(`MISSING_REQUIRED:${q.id}`);
    }

    const completionSeconds = Math.max(1, Math.round((now - input.startedAt) / 1000));

    // Attention-check evaluation: validation JSON on the question stores
    // { expected: <value> } for a designated attention-check question.
    let failedAttentionCheck = false;
    for (const q of survey.questions) {
      if (!q.isAttentionCheck) continue;
      const answer = input.answers.find((a) => a.questionId === q.id);
      try {
        const rule = q.validation ? JSON.parse(q.validation) : null;
        if (rule?.expected !== undefined && JSON.stringify(answer?.value) !== JSON.stringify(rule.expected)) {
          failedAttentionCheck = true;
        }
      } catch {
        // no-op: malformed rule, skip
      }
    }

    // Suspicious-response heuristic: completed implausibly fast relative to
    // the survey's own time estimate.
    const minPlausibleSeconds = Math.max(5, survey.estimatedMinutes * 60 * 0.15);
    const tooFast = completionSeconds < minPlausibleSeconds;

    const status = failedAttentionCheck || tooFast ? "flagged" : "valid";

    const response = await db.surveyResponse.create({
      data: {
        surveyId: survey.id,
        status,
        rewardStatus: survey.rewardConfig?.enabled ? "pending" : "not_applicable",
        respondentEmail: input.respondentEmail,
        respondentHash: input.respondentHash,
        country: input.country,
        device: input.device,
        source: input.source ?? "share_link",
        completionSeconds,
        failedAttentionCheck,
        futureConsent: survey.settings?.collectFutureConsent ? input.futureConsent ?? false : null,
        submittedAt: new Date(),
        answers: {
          create: input.answers.map((a) => ({
            questionId: a.questionId,
            value: JSON.stringify(a.value),
          })),
        },
      },
    });

    let rewardResult: Awaited<ReturnType<typeof RewardService.processReward>> | null = null;
    if (survey.rewardConfig?.enabled && status === "valid") {
      rewardResult = await RewardService.processReward(response.id);
    }

    await SurveyService.maybeNotifyMilestone(survey.id);

    return { response, rewardResult };
  },

  async listForSurvey(surveyId: string, filter?: string) {
    return db.surveyResponse.findMany({
      where: { surveyId, ...(filter && filter !== "all" ? { status: filter } : {}) },
      orderBy: { createdAt: "desc" },
      include: { answers: true },
    });
  },

  async setStatus(responseId: string, status: "valid" | "rejected" | "flagged") {
    return db.surveyResponse.update({ where: { id: responseId }, data: { status } });
  },

  async orgStats(organizationId: string) {
    const [total, valid, rejected, flagged, agg] = await Promise.all([
      db.surveyResponse.count({ where: { survey: { organizationId } } }),
      db.surveyResponse.count({ where: { survey: { organizationId }, status: "valid" } }),
      db.surveyResponse.count({ where: { survey: { organizationId }, status: "rejected" } }),
      db.surveyResponse.count({ where: { survey: { organizationId }, status: "flagged" } }),
      db.surveyResponse.aggregate({ where: { survey: { organizationId }, completionSeconds: { not: null } }, _avg: { completionSeconds: true } }),
    ]);
    return { total, valid, rejected, flagged, avgCompletionSeconds: Math.round(agg._avg.completionSeconds ?? 0) };
  },

  async getStats(surveyId: string) {
    const [total, valid, rejected, flagged, agg] = await Promise.all([
      db.surveyResponse.count({ where: { surveyId } }),
      db.surveyResponse.count({ where: { surveyId, status: "valid" } }),
      db.surveyResponse.count({ where: { surveyId, status: "rejected" } }),
      db.surveyResponse.count({ where: { surveyId, status: "flagged" } }),
      db.surveyResponse.aggregate({ where: { surveyId, completionSeconds: { not: null } }, _avg: { completionSeconds: true } }),
    ]);
    return { total, valid, rejected, flagged, avgCompletionSeconds: Math.round(agg._avg.completionSeconds ?? 0) };
  },
};
