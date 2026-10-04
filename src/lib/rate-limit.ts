import { headers } from "next/headers";

// Best-effort, in-memory rate limiting. This resets on every cold start and
// is only shared across requests handled by the same warm serverless
// instance — it will not perfectly enforce a limit across many concurrent
// instances, but it stops the common cases (a script hammering the login
// form, a bot looping the public survey endpoint) at near-zero cost and no
// extra infrastructure. Swap for a shared store (e.g. Upstash Redis) if you
// need real distributed guarantees before launch.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Keep memory bounded on a long-lived warm instance.
const MAX_BUCKETS = 5000;

export function getClientIp(): string {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

/** Returns ok:false once `key` has been hit `limit` times within `windowMs`. */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) pruneExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
