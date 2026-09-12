import type { Locale } from "./i18n/config";

// "ar-SA" alone defaults to the Hijri (Umm al-Qura) calendar in ICU/CLDR —
// the "-u-ca-gregory" extension pins every date-related Intl call below to
// the Gregorian calendar (survey/reward dates throughout the app are always
// Gregorian). No effect on the number/currency/percent formatters, which
// don't use a calendar.
const intlLocale: Record<Locale, string> = { en: "en-US", ar: "ar-SA-u-ca-gregory" };

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
