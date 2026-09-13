import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Hero } from "@/components/marketing/sections/hero";
import { Problem } from "@/components/marketing/sections/problem";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { Features } from "@/components/marketing/sections/features";
import { QrFeedback } from "@/components/marketing/sections/qr-feedback";
import { AnalyticsShowcase } from "@/components/marketing/sections/analytics-showcase";
import { MultiBranch } from "@/components/marketing/sections/multi-branch";
import { CouponShowcase } from "@/components/marketing/sections/coupon-showcase";
import { Solutions } from "@/components/marketing/sections/solutions";
import { Trust } from "@/components/marketing/sections/trust";
import { SaudiPositioning } from "@/components/marketing/sections/saudi-positioning";
import { PricingHome } from "@/components/marketing/sections/pricing-home";
import { HomepageFaq } from "@/components/marketing/sections/homepage-faq";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import type { Locale } from "@/lib/i18n/config";

export default function LandingPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return (
    <>
      <MarketingNav />
      <main>
        <Hero locale={locale} />
        <Problem locale={locale} />
        <HowItWorks locale={locale} />
        <Features locale={locale} />
        <QrFeedback locale={locale} />
        <AnalyticsShowcase locale={locale} />
        <MultiBranch locale={locale} />
        <CouponShowcase locale={locale} />
        <Solutions locale={locale} />
        <Trust locale={locale} />
        <SaudiPositioning locale={locale} />
        <PricingHome locale={locale} />
        <HomepageFaq />
        <FinalCta locale={locale} />
      </main>
      <MarketingFooter locale={locale} />
    </>
  );
}
