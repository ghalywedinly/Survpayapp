export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookieName = "survpay_locale";

export const localeMeta: Record<Locale, { dir: "ltr" | "rtl"; label: string; nativeLabel: string }> = {
  en: { dir: "ltr", label: "English", nativeLabel: "English" },
  ar: { dir: "rtl", label: "Arabic", nativeLabel: "العربية" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
