import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PricingTable } from "@/components/marketing/pricing-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default function PricingPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return (
    <>
      <MarketingNav />
      <main className="bg-dot-grid">
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900">{dict.pricingPage.title}</h1>
            <p className="mt-4 text-lg text-ink-500">{dict.pricingPage.subtitle}</p>
          </div>
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-4">
            <PricingTable />
          </div>
        </section>
      </main>
      <MarketingFooter locale={params.locale} />
    </>
  );
}
