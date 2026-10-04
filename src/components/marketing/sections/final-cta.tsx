import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon, GlobeIcon, QrIcon, WalletIcon } from "@/components/icons";
import { BrandGradientBlobs } from "@/components/brand-blobs";

export function FinalCta({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const chips = [
    { icon: GlobeIcon, label: t.valueChipBilingual },
    { icon: QrIcon, label: t.valueChipQr },
    { icon: WalletIcon, label: t.valueChipPricing },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-wash py-20 sm:py-28">
      <BrandGradientBlobs variant="center" className="opacity-70" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.finalCtaClosing}</p>
        <h2 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.finalCtaTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-500">{t.finalCtaSubtitle}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}/signup`} className={buttonClasses({ size: "xl", className: "gap-2.5" })}>
            {t.finalCtaPrimary}
            <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
          </Link>
          <a href="mailto:sales@survpay.com?subject=Survpay%20sales%20inquiry" className={buttonClasses({ variant: "outline", size: "xl" })}>
            {t.finalCtaSecondary}
          </a>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2.5 border-t border-ink-200/60 pt-6">
          {chips.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <c.icon className="h-3.5 w-3.5 text-brand-content" />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
