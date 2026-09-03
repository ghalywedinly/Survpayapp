"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { Locale } from "@/lib/i18n/config";
import type { ActionState } from "@/lib/auth/actions";

export async function updateProfileAction(locale: Locale, data: { name: string; phone: string; preferredLocale: Locale }) {
  const ctx = await requireOrgContext(locale);
  await db.user.update({
    where: { id: ctx.user.id },
    data: { name: data.name, phone: data.phone || null, locale: data.preferredLocale },
  });
  revalidatePath(`/${locale}/settings`);
}

export async function updateOrganizationAction(locale: Locale, data: { name: string; industry: string; logoUrl: string | null }) {
  const ctx = await requireOrgContext(locale);
  await db.organization.update({
    where: { id: ctx.organization.id },
    data: { name: data.name, industry: data.industry || null, logoUrl: data.logoUrl },
  });
  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/dashboard`);
}

export async function inviteMemberAction(locale: Locale, email: string, role: string) {
  const ctx = await requireOrgContext(locale);
  await db.organizationMember.create({
    data: { organizationId: ctx.organization.id, userId: ctx.user.id, role, invitedEmail: email, status: "invited" },
  });
  revalidatePath(`/${locale}/settings`);
}

export async function removeMemberAction(locale: Locale, memberId: string) {
  const ctx = await requireOrgContext(locale);
  await db.organizationMember.deleteMany({ where: { id: memberId, organizationId: ctx.organization.id } });
  revalidatePath(`/${locale}/settings`);
}

export async function updateNotificationPrefsAction(locale: Locale, prefs: Record<string, boolean>) {
  const ctx = await requireOrgContext(locale);
  await db.user.update({ where: { id: ctx.user.id }, data: { notificationPrefs: JSON.stringify(prefs) } });
  revalidatePath(`/${locale}/settings`);
}

export async function changePasswordAction(locale: Locale, currentPassword: string, newPassword: string): Promise<ActionState> {
  const ctx = await requireOrgContext(locale);
  const valid = await verifyPassword(currentPassword, ctx.user.passwordHash);
  if (!valid) return { error: "errorInvalidCredentials" };
  if (newPassword.length < 8) return { error: "errorWeakPassword" };
  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: ctx.user.id }, data: { passwordHash } });
  return { success: true };
}

export async function revokeSessionAction(locale: Locale, sessionId: string) {
  const ctx = await requireOrgContext(locale);
  await db.session.deleteMany({ where: { id: sessionId, userId: ctx.user.id } });
  revalidatePath(`/${locale}/settings`);
}
