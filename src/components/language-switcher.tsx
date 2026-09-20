"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeCookieName, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const rest = pathname?.split("/").slice(2).join("/") ?? "";
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
    router.refresh();
  }

  if (compact) {
    const other = locales.find((l) => l !== locale) ?? locale;
    return (
      <button
        type="button"
        onClick={() => switchTo(other)}
        title={other === "en" ? "Switch to English" : "التبديل إلى العربية"}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900",
          className
        )}
      >
        {locale === "en" ? "EN" : "ع"}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-ink-200 bg-surface p-0.5 text-xs font-medium shadow-soft",
        className
      )}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            l === locale ? "bg-[#12151e] text-white" : "text-ink-500 hover:text-ink-900"
          )}
        >
          {l === "en" ? "EN" : "العربية"}
        </button>
      ))}
    </div>
  );
}
