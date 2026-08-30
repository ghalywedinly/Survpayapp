import type { Locale } from "./i18n/config";

const intlLocale: Record<Locale, string> = { en: "en-US", ar: "ar-SA" };

export function formatCurrency(amount: number, locale: Locale, currency = "SAR") {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}

export function formatPercent(value: number, locale: Locale, digits = 1) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(value / 100);
}

export function formatDate(date: Date | string, locale: Locale, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], opts ?? { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export function formatDuration(seconds: number, locale: Locale) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return locale === "ar" ? `${s} ثانية` : `${s}s`;
  return locale === "ar" ? `${m} د ${s} ث` : `${m}m ${s}s`;
}
