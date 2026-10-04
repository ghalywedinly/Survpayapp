import { db } from "@/lib/db";
import { SatisfactionService, type SatisfactionBreakdown } from "./satisfaction-service";

export type BranchWithStats = {
  id: string;
  name: string;
  nameAr: string | null;
  code: string;
  city: string | null;
  address: string | null;
  active: boolean;
  totalResponses: number;
} & SatisfactionBreakdown;

/**
 * Derives a URL-safe branch code from a name ("Al Olaya" → "ALOLAYA"),
 * falling back to a random suffix when the name has nothing usable (an
 * Arabic-only name, say) and disambiguating against codes already taken.
 */
export function deriveBranchCode(name: string, taken: string[] = []): string {
  const base =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || `BR${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  if (!taken.includes(base)) return base;
  for (let i = 2; i < 100; i += 1) {
    const candidate = `${base}${i}`;
    if (!taken.includes(candidate)) return candidate;
  }
  return `${base}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export const BranchService = {
  async list(organizationId: string, opts?: { includeInactive?: boolean }) {
    return db.branch.findMany({
      where: { organizationId, ...(opts?.includeInactive ? {} : { active: true }) },
      orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    });
  },

  async get(branchId: string, organizationId: string) {
    return db.branch.findFirst({ where: { id: branchId, organizationId } });
  },

  async create(
    organizationId: string,
    input: { name: string; nameAr?: string | null; city?: string | null; address?: string | null; code?: string | null }
  ) {
    const existing = await db.branch.findMany({ where: { organizationId }, select: { code: true } });
    const code = (input.code?.trim().toUpperCase() || deriveBranchCode(input.name, existing.map((b) => b.code)))
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 16);

    return db.branch.create({
      data: {
        organizationId,
        name: input.name.trim(),
        nameAr: input.nameAr?.trim() || null,
        city: input.city?.trim() || null,
        address: input.address?.trim() || null,
        code,
      },
    });
  },

  async update(
    branchId: string,
    organizationId: string,
    input: { name?: string; nameAr?: string | null; city?: string | null; address?: string | null; active?: boolean }
  ) {
    // Scope the write to the caller's organization so a branch id from
    // another tenant can't be edited by guessing it.
    const branch = await db.branch.findFirst({ where: { id: branchId, organizationId }, select: { id: true } });
    if (!branch) throw new Error("NOT_FOUND");

    return db.branch.update({
      where: { id: branchId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.nameAr !== undefined ? { nameAr: input.nameAr?.trim() || null } : {}),
        ...(input.city !== undefined ? { city: input.city?.trim() || null } : {}),
        ...(input.address !== undefined ? { address: input.address?.trim() || null } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  },

  /** Resolves the branch code carried by a QR/link to a branch of the survey's own organization. */
  async resolveCodeForSurvey(surveyId: string, branchCode: string) {
    const survey = await db.survey.findUnique({ where: { id: surveyId }, select: { organizationId: true } });
    if (!survey) return null;
    return db.branch.findFirst({
      where: { organizationId: survey.organizationId, code: branchCode.trim().toUpperCase(), active: true },
      select: { id: true },
    });
  },

  /** Branches with their satisfaction score and response volume, best score first. */
  async listWithStats(organizationId: string, opts?: { includeInactive?: boolean }): Promise<BranchWithStats[]> {
    const [branches, scores, counts] = await Promise.all([
      this.list(organizationId, opts),
      SatisfactionService.branchScores(organizationId),
      db.surveyResponse.groupBy({
        by: ["branchId"],
        where: { branchId: { not: null }, survey: { organizationId }, status: "valid" },
        _count: { _all: true },
      }),
    ]);

    const scoreByBranch = new Map(scores.map((s) => [s.branchId, s]));
    const countByBranch = new Map(counts.map((c) => [c.branchId, c._count._all]));

    return branches
      .map((b) => {
        const score = scoreByBranch.get(b.id);
        return {
          id: b.id,
          name: b.name,
          nameAr: b.nameAr,
          code: b.code,
          city: b.city,
          address: b.address,
          active: b.active,
          totalResponses: countByBranch.get(b.id) ?? 0,
          score: score?.score ?? null,
          answerCount: score?.answerCount ?? 0,
          responseCount: score?.responseCount ?? 0,
        };
      })
      .sort((a, b) => {
        // Scored branches first (best to worst), then the ones still waiting
        // on their first response.
        if (a.score === null && b.score === null) return a.name.localeCompare(b.name);
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
      });
  },
};
