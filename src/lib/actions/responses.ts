"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { ResponseService } from "@/lib/services/response-service";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";

export async function setResponseStatusAction(
  locale: Locale,
  surveyId: string,
  responseId: string,
  status: "valid" | "rejected" | "flagged"
) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({ where: { id: surveyId, organizationId: ctx.organization.id } });
  if (!survey) throw new Error("Survey not found");
  await ResponseService.setStatus(responseId, status);
  revalidatePath(`/${locale}/surveys/${surveyId}/responses`);
}

export async function exportResponsesCsvAction(locale: Locale, surveyId: string) {
  const ctx = await requireOrgContext(locale);
  const survey = await db.survey.findFirst({
    where: { id: surveyId, organizationId: ctx.organization.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!survey) throw new Error("Survey not found");
  const responses = await ResponseService.listForSurvey(surveyId);

  const header = ["Response ID", "Status", "Reward status", "Submitted at", "Completion time (s)", "Country", "Device", ...survey.questions.map((q) => q.text)];
  const rows = responses.map((r) => {
    const answerMap = new Map(r.answers.map((a) => [a.questionId, a.value]));
    return [
      r.id,
      r.status,
      r.rewardStatus,
      r.submittedAt?.toISOString() ?? "",
      String(r.completionSeconds ?? ""),
      r.country ?? "",
      r.device ?? "",
      ...survey.questions.map((q) => {
        const raw = answerMap.get(q.id);
        if (!raw) return "";
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed.join("; ") : String(parsed);
        } catch {
          return raw;
        }
      }),
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csv;
}
