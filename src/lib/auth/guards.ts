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
