import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { getPlan } from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";

export function PricingHome({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;
  const cx = getPlan("customer_experience");
  const market = getPlan("market_research");

  const cards = [
    { plan: cx, name: dict.pricingPage.planCxName, desc: t.pricingHomeCxDesc, highlighted: true },
    { plan: market, name: dict.pricingPage.planMarketName, desc: t.pricingHomeMarketDesc, highlighted: false },
  ];

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.pricingHomeEyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">{t.pricingHomeTitle}</h2>
          <p className="mt-4 text-lg text-ink-500">{t.pricingHomeSubtitle}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.name}
              className={
                c.highlighted
                  ? "flex flex-col rounded-2xl border border-brand-300 bg-surface p-8 shadow-soft ring-2 ring-brand-500/20"
                  : "flex flex-col rounded-2xl border border-ink-200/70 bg-surface p-8 shadow-soft"
              }
            >
              <h3 className="text-lg font-semibold text-ink-900">{c.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-ink-900">
                  {formatCurrency(c.plan.monthlyPrice as number, locale)}
                </span>
                <span className="text-sm text-ink-400">{dict.pricingPage.perMonth}</span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-500">{c.desc}</p>
              <Link
                href={`/${locale}/pricing`}
                className={buttonClasses({ variant: c.highlighted ? "primary" : "outline", className: "mt-6 w-full" })}
              >
                {t.pricingHomeCta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
