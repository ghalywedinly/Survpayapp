import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

export function FinalCta({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.finalCtaTitle}</h2>
        <p className="mt-4 text-lg text-ink-500">{t.finalCtaSubtitle}</p>
        <div className="mt-8 flex justify-center">
          <Link href={`/${locale}/signup`} className={buttonClasses({ size: "xl", className: "gap-2.5" })}>
            {t.finalCtaPrimary}
            <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </div>
        <p className="mt-8 text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.finalCtaClosing}</p>
      </div>
    </section>
  );
}
