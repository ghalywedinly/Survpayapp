import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Hero } from "@/components/marketing/sections/hero";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { Features } from "@/components/marketing/sections/features";
import { RewardShowcase } from "@/components/marketing/sections/reward-showcase";
import { AnalyticsShowcase } from "@/components/marketing/sections/analytics-showcase";
import { Trust } from "@/components/marketing/sections/trust";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import type { Locale } from "@/lib/i18n/config";

export default function LandingPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return (
    <>
      <MarketingNav />
      <main>
        <Hero locale={locale} />
        <HowItWorks locale={locale} />
        <Features locale={locale} />
        <RewardShowcase />
        <AnalyticsShowcase locale={locale} />
        <Trust locale={locale} />
        <FinalCta locale={locale} />
      </main>
      <MarketingFooter locale={locale} />
    </>
  );
}
