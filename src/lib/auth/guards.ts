import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUserAndOrg } from "./session";
import type { Locale } from "@/lib/i18n/config";

export async function requireOrgContext(locale: Locale) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) redirect(`/${locale}/login`);
  if (!ctx.organization) redirect(`/${locale}/onboarding`);
  return ctx as { user: NonNullable<typeof ctx>["user"]; organization: NonNullable<NonNullable<typeof ctx>["organization"]>; role: string };
}

export async function requireUser(locale: Locale) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) redirect(`/${locale}/login`);
  return ctx;
}

// Platform-owner access — deliberately separate from org membership.
// role === "platform_admin" is set on exactly one User row (see
// prisma/seed-logic.ts and README), never assignable through any UI a
// researcher can reach. An ordinary logged-in researcher hitting an /admin
// route is bounced to their own dashboard, not shown an error that would
// confirm the admin area exists.
export async function requirePlatformAdmin(locale: Locale) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) redirect(`/${locale}/login`);
  if (ctx.user.role !== "platform_admin") redirect(`/${locale}/dashboard`);
  return ctx;
}
