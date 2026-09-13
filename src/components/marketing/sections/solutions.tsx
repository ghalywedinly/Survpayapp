import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { CheckIcon, BuildingIcon, BarChartIcon, ArrowRightIcon } from "@/components/icons";

export function Solutions({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const cards = [
    {
      icon: BuildingIcon,
      badge: t.solutionsCxBadge,
      name: t.solutionsCxName,
      desc: t.solutionsCxDesc,
      list: [t.solutionsCxList1, t.solutionsCxList2, t.solutionsCxList3, t.solutionsCxList4],
      cta: t.solutionsCxCta,
    },
    {
      icon: BarChartIcon,
      badge: t.solutionsMarketBadge,
      name: t.solutionsMarketName,
      desc: t.solutionsMarketDesc,
      list: [t.solutionsMarketList1, t.solutionsMarketList2, t.solutionsMarketList3, t.solutionsMarketList4],
      cta: t.solutionsMarketCta,
    },
  ];

  return (
    <section id="solutions" className="border-t border-ink-100 bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.solutionsEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.solutionsTitle}</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {cards.map((c) => (
            <div key={c.name} className="flex flex-col rounded-2xl border border-ink-200/70 bg-surface p-8 shadow-soft">
              <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-content">
                {c.badge}
              </span>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-ink-900">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.desc}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {c.list.map((li) => (
                  <li key={li} className="flex items-center gap-2 text-sm text-ink-600">
                    <CheckIcon className="h-4 w-4 shrink-0 text-mint-500" />
                    {li}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/pricing`} className={buttonClasses({ variant: "outline", className: "mt-6 w-fit gap-1.5" })}>
                {c.cta}
                <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
