import { db } from "@/lib/db";

// Which question types carry a satisfaction signal. Everything else (free
// text, demographics, multi-select, dates) is deliberately ignored — a
// score is only meaningful when every contributing answer sits on an
// ordered scale that can be normalised the same way.
export const SATISFACTION_QUESTION_TYPES = ["rating", "nps", "likert"] as const;

const RATING_MIN = 1;
const RATING_MAX = 5;
const NPS_MAX = 10;

/**
 * Normalises one answer onto 0–100, or returns null when the answer can't
 * contribute (unparseable, out of range, or a single-option likert where
 * there is no scale to speak of).
 *
 * - rating: 1–5 stars            → (v − 1) / 4
 * - nps:    0–10                 → v / 10
 * - likert: position in the ordered option list → i / (n − 1). Option values
 *   are opaque ids (`opt_1`…), so the scale point is the option's order, not
 *   the value itself — which is also why options must stay lowest-to-highest.
 */
export function normalizeSatisfaction(
  questionType: string,
  rawValue: unknown,
  orderedOptionValues: string[] = []
): number | null {
  if (questionType === "rating") {
    const v = Number(rawValue);
    if (!Number.isFinite(v) || v < RATING_MIN || v > RATING_MAX) return null;
    return ((v - RATING_MIN) / (RATING_MAX - RATING_MIN)) * 100;
  }

  if (questionType === "nps") {
    const v = Number(rawValue);
    if (!Number.isFinite(v) || v < 0 || v > NPS_MAX) return null;
    return (v / NPS_MAX) * 100;
  }

  if (questionType === "likert") {
    if (orderedOptionValues.length < 2) return null;
    const index = orderedOptionValues.indexOf(String(rawValue));
    if (index < 0) return null;
    return (index / (orderedOptionValues.length - 1)) * 100;
  }

  return null;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export type SatisfactionBreakdown = {
  /** 0–100, or null when nothing has been answered yet. */
  score: number | null;
  /** How many individual scale answers the score averages over. */
  answerCount: number;
  /** How many distinct responses contributed at least one scale answer. */
  responseCount: number;
};

type ScoreRow = {
  value: string;
  responseId: string;
  question: { type: string; options: { value: string }[] };
  response: { branchId: string | null; submittedAt: Date | null };
};

async function loadScoreRows(organizationId: string): Promise<ScoreRow[]> {
  return db.responseAnswer.findMany({
    where: {
      question: { type: { in: [...SATISFACTION_QUESTION_TYPES] }, survey: { organizationId } },
      response: { status: "valid", submittedAt: { not: null } },
    },
    select: {
      value: true,
      responseId: true,
      question: { select: { type: true, options: { select: { value: true }, orderBy: { order: "asc" } } } },
      response: { select: { branchId: true, submittedAt: true } },
    },
  });
}

function summarise(rows: ScoreRow[]): SatisfactionBreakdown {
  let total = 0;
  let answerCount = 0;
  const responses = new Set<string>();

  for (const row of rows) {
    const normalised = normalizeSatisfaction(
      row.question.type,
      safeParse(row.value),
      row.question.options.map((o) => o.value)
    );
    if (normalised === null) continue;
    total += normalised;
    answerCount += 1;
    responses.add(row.responseId);
  }

  return {
    score: answerCount > 0 ? Math.round((total / answerCount) * 10) / 10 : null,
    answerCount,
    responseCount: responses.size,
  };
}

export type BrandSatisfaction = SatisfactionBreakdown & {
  /** Point change against the previous window of equal length, when both have data. */
  delta: number | null;
  branchCount: number;
};

/**
 * Brand-wide satisfaction: every scale answer from every survey, across every
 * branch, averaged into one number. `windowDays` also produces the change
 * against the preceding window of the same length.
 */
export const SatisfactionService = {
  async brandScore(organizationId: string, windowDays = 30): Promise<BrandSatisfaction> {
    const now = Date.now();
    const windowStart = new Date(now - windowDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now - windowDays * 2 * 24 * 60 * 60 * 1000);

    const [allRows, branchCount] = await Promise.all([
      loadScoreRows(organizationId),
      db.branch.count({ where: { organizationId, active: true } }),
    ]);

    const overall = summarise(allRows);

    const current = summarise(allRows.filter((r) => r.response.submittedAt && r.response.submittedAt >= windowStart));
    const previous = summarise(
      allRows.filter(
        (r) => r.response.submittedAt && r.response.submittedAt >= previousStart && r.response.submittedAt < windowStart
      )
    );

    const delta =
      current.score !== null && previous.score !== null ? Math.round((current.score - previous.score) * 10) / 10 : null;

    return { ...overall, delta, branchCount };
  },

  /** Per-branch satisfaction, ordered best first. Branches with no responses yet score null. */
  async branchScores(organizationId: string): Promise<(SatisfactionBreakdown & { branchId: string })[]> {
    const rows = await loadScoreRows(organizationId);
    const byBranch = new Map<string, ScoreRow[]>();

    for (const row of rows) {
      if (!row.response.branchId) continue;
      const list = byBranch.get(row.response.branchId);
      if (list) list.push(row);
      else byBranch.set(row.response.branchId, [row]);
    }

    return [...byBranch.entries()].map(([branchId, branchRows]) => ({
      branchId,
      ...summarise(branchRows),
    }));
  },
};
