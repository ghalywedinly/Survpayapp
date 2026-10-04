"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { BranchService } from "@/lib/services/branch-service";
import type { Locale } from "@/lib/i18n/config";

function revalidateBranchViews(locale: Locale) {
  revalidatePath(`/${locale}/branches`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function createBranchAction(
  locale: Locale,
  input: { name: string; nameAr?: string; city?: string; address?: string; code?: string }
) {
  const ctx = await requireOrgContext(locale);
  if (!input.name?.trim()) throw new Error("NAME_REQUIRED");

  const branch = await BranchService.create(ctx.organization.id, input);
  revalidateBranchViews(locale);
  return { id: branch.id, code: branch.code };
}

export async function updateBranchAction(
  locale: Locale,
  branchId: string,
  input: { name?: string; nameAr?: string; city?: string; address?: string }
) {
  const ctx = await requireOrgContext(locale);
  await BranchService.update(branchId, ctx.organization.id, input);
  revalidateBranchViews(locale);
}

/** Archiving keeps the branch's history (and its responses) but retires its QR code. */
export async function setBranchActiveAction(locale: Locale, branchId: string, active: boolean) {
  const ctx = await requireOrgContext(locale);
  await BranchService.update(branchId, ctx.organization.id, { active });
  revalidateBranchViews(locale);
}
