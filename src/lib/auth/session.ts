import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = "survpay_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } }).catch(() => {});
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          memberships: { include: { organization: true } },
        },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

/** Returns the current user plus their primary (first) organization membership. Phase 1 treats one org per user; the schema already supports many. */
export async function getCurrentUserAndOrg() {
  const session = await getCurrentSession();
  if (!session) return null;
  const membership = session.user.memberships[0];
  return {
    user: session.user,
    organization: membership?.organization ?? null,
    role: membership?.role ?? null,
  };
}
