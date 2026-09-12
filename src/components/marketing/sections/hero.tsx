import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon, SparklesIcon } from "@/components/icons";
import { HeroMockup } from "./hero-mockup";

export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  return (
    <section className="relative overflow-hidden bg-brand-wash">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-brand-50/70 via-white to-white" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pb-28 lg:pt-24">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-content">
            <SparklesIcon className="h-3.5 w-3.5" />
            {t.heroBadge}
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">{t.heroSubtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/signup`} className={buttonClasses({ size: "lg", className: "gap-2" })}>
              {t.heroCtaPrimary}
              <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href={`/${locale}/how-it-works`} className={buttonClasses({ variant: "outline", size: "lg" })}>
              {t.heroCtaSecondary}
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-400">{t.heroNote}</p>
        </div>

        <div className="animate-fade-in lg:pl-6">
          <HeroMockup locale={locale} />
        </div>
      </div>
    </section>
  );
}
