import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";

export function FinalCta({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  return (
    <section className="border-t border-ink-100 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.finalCtaTitle}</h2>
        <p className="mt-4 text-lg text-ink-500">{t.finalCtaSubtitle}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}/signup`} className={buttonClasses({ size: "lg", className: "gap-2" })}>
            {t.finalCtaPrimary}
            <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
          </Link>
          <Link href={`/${locale}/resources`} className={buttonClasses({ variant: "outline", size: "lg" })}>
            {t.finalCtaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
