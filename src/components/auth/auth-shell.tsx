import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n/config";

export function AuthShell({
  locale,
  title,
  subtitle,
  children,
  footer,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="text-center text-xs text-ink-400">{footer}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-[#0a0c12] lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 20%, rgba(139,92,246,0.35), transparent), radial-gradient(45% 45% at 85% 75%, rgba(34,211,238,0.22), transparent)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,18,0)_0%,rgba(10,12,18,0.9)_100%)]" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <blockquote className="max-w-md text-xl font-medium leading-relaxed">
            “SurvPay cut the time between fielding a study and having a funded, rewarded, analyzable dataset from weeks to an afternoon.”
          </blockquote>
          <p className="mt-5 text-sm text-white/60">Research Director, GCC consumer insights firm</p>
        </div>
      </div>
    </div>
  );
}
