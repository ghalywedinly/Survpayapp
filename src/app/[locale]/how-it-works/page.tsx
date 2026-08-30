import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";

export default function HowItWorksPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const t = dict.howItWorksPage;

  const steps = [
    { title: t.detail1Title, desc: t.detail1Desc },
    { title: t.detail2Title, desc: t.detail2Desc },
    { title: t.detail3Title, desc: t.detail3Desc },
    { title: t.detail4Title, desc: t.detail4Desc },
    { title: t.detail5Title, desc: t.detail5Desc },
    { title: t.detail6Title, desc: t.detail6Desc },
  ];

  return (
    <>
      <MarketingNav />
      <main>
        <section className="border-b border-ink-100 bg-brand-wash py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900">{t.title}</h1>
            <p className="mt-4 text-lg text-ink-500">{t.subtitle}</p>
            <Link href={`/${params.locale}/signup`} className={buttonClasses({ size: "lg", className: "mt-8" })}>
              {dict.marketing.heroCtaPrimary}
            </Link>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <ol className="space-y-10 border-s-2 border-ink-100 ps-8">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -start-[41px] flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FinalCta locale={params.locale} />
      </main>
      <MarketingFooter locale={params.locale} />
    </>
  );
}
