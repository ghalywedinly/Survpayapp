"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n/provider";
import { buttonClasses } from "@/components/ui/button";
import { MenuIcon, XIcon } from "@/components/icons";

export function MarketingNav() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}/features`, label: t("nav.features") },
    { href: `/${locale}/how-it-works`, label: t("nav.howItWorks") },
    { href: `/${locale}/pricing`, label: t("nav.pricing") },
    { href: `/${locale}/resources`, label: t("nav.resources") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={`/${locale}`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-900">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href={`/${locale}/login`} className="text-sm font-medium text-ink-600 hover:text-ink-900">
            {t("nav.login")}
          </Link>
          <Link href={`/${locale}/signup`} className={buttonClasses({ size: "md" })}>
            {t("nav.signup")}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 lg:hidden"
          aria-label="Menu"
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-surface px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-1 text-sm font-medium text-ink-700">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/${locale}/login`} className="w-full rounded-lg border border-ink-200 py-2.5 text-center text-sm font-medium">
              {t("nav.login")}
            </Link>
            <Link href={`/${locale}/signup`} className="w-full rounded-lg bg-brand-600 py-2.5 text-center text-sm font-medium text-white">
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
