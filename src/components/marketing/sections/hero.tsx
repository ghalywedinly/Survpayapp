import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon } from "@/components/icons";

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
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">{t.heroSubtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/signup`} className={buttonClasses({ size: "xl", className: "gap-2.5" })}>
              {t.heroCtaPrimary}
              <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
            </Link>
            <Link href={`/${locale}#how-it-works`} className={buttonClasses({ variant: "outline", size: "xl" })}>
              {t.heroCtaSecondary}
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-400">{t.heroNote}</p>
        </div>

        <div className="relative animate-fade-in pb-8 lg:pb-0 lg:pl-6">
          <img
            src="/images/hero-cafe.webp"
            alt={t.heroImageAlt}
            className="aspect-[16/9] w-full rounded-2xl border border-ink-200/70 object-cover shadow-pop"
          />
          <div className="absolute -bottom-2 start-6 flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-surface px-4 py-3 shadow-card lg:-bottom-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-50 text-mint-content">
              <CheckCircleIcon className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none text-ink-900">87%</p>
              <p className="mt-1 text-xs text-ink-500">{t.analyticsMetric1Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
