import type { Locale } from "./i18n/config";

// "ar-SA" alone defaults to two things this app doesn't want:
//   -u-ca-gregory — pins the calendar to Gregorian; plain "ar-SA" defaults to
//     Hijri (Umm al-Qura), so every date would otherwise render in the
//     Islamic calendar (survey/reward dates here are always Gregorian).
//   -u-nu-latn — pins the numbering system to Western/decimal digits
//     (0-9); plain "ar-SA" defaults to Eastern Arabic-Indic digits (٠-٩),
//     which this app doesn't use anywhere in its Arabic UI.
// Neither extension affects the other kind of formatting, so both are safe
// to apply across formatCurrency/formatNumber/formatPercent/formatDate.
const intlLocale: Record<Locale, string> = { en: "en-US", ar: "ar-SA-u-ca-gregory-nu-latn" };

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
