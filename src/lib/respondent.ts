"use client";

const STORAGE_KEY = "survpay_respondent_id";

/** Persistent, non-identifying per-browser id used only for duplicate-response prevention. */
export function getRespondentHash(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private mode, blocked) — fall back to a
    // session-only id; duplicate prevention degrades gracefully.
    return crypto.randomUUID();
  }
}

export function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}
