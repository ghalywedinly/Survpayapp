"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentUserAndOrg } from "./session";
import { slugify } from "@/lib/utils";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export type ActionState = { error?: string; success?: boolean; devLink?: string } | undefined;

function loc(formData: FormData) {
  const l = formData.get("locale");
  return typeof l === "string" && isLocale(l) ? l : defaultLocale;
}

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = loc(formData);
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const tooShort = parsed.error.issues.some((i) => i.path[0] === "password");
    return { error: tooShort ? "errorWeakPassword" : "errorGeneric" };
  }
  const { name, email, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) return { error: "errorPasswordMismatch" };

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "errorEmailTaken" };

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, locale },
  });

  await createSession(user.id);
  redirect(`/${locale}/onboarding`);
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = loc(formData);
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "errorInvalidCredentials" };

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return { error: "errorInvalidCredentials" };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "errorInvalidCredentials" };

  await createSession(user.id);

  const membership = await db.organizationMember.findFirst({ where: { userId: user.id } });
  redirect(`/${locale}/${membership ? "dashboard" : "onboarding"}`);
}

export async function logoutAction(formData: FormData) {
  const locale = loc(formData);
  await destroySession();
  redirect(`/${locale}`);
}

const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = loc(formData);
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { success: true };

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return { success: true };

  const token = crypto.randomBytes(24).toString("hex");
  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  // No email provider is connected in this environment — surface the link
  // directly so the reset flow is testable end-to-end. A production
  // deployment sends this via a transactional email provider instead.
  return { success: true, devLink: `/${locale}/reset-password?token=${token}` };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = loc(formData);
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: "errorWeakPassword" };
  if (parsed.data.password !== parsed.data.confirmPassword) return { error: "errorPasswordMismatch" };

  const user = await db.user.findUnique({ where: { resetToken: parsed.data.token } });
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return { error: "errorGeneric" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });

  redirect(`/${locale}/login?reset=1`);
}

export async function verifyEmailAction() {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) return { error: "errorGeneric" } as ActionState;
  await db.user.update({
    where: { id: ctx.user.id },
    data: { emailVerified: true, emailVerifiedAt: new Date() },
  });
  return { success: true } as ActionState;
}

const onboardingSchema = z.object({
  companyName: z.string().min(2),
  role: z.string().min(1),
  useCase: z.string().optional(),
});

export async function onboardingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = loc(formData);
  const ctx = await getCurrentUserAndOrg();
  if (!ctx) return { error: "errorGeneric" };

  const parsed = onboardingSchema.safeParse({
    companyName: formData.get("companyName"),
    role: formData.get("role"),
    useCase: formData.get("useCase"),
  });
  if (!parsed.success) return { error: "errorGeneric" };

  const baseSlug = slugify(parsed.data.companyName) || "org";
  let slug = baseSlug;
  let attempt = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const org = await db.organization.create({
    data: { name: parsed.data.companyName, slug, country: "SA" },
  });

  await db.organizationMember.create({
    data: { organizationId: org.id, userId: ctx.user.id, role: "owner", status: "active" },
  });

  await db.user.update({ where: { id: ctx.user.id }, data: { role: parsed.data.role } });

  redirect(`/${locale}/dashboard`);
}
