import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { LegalPage } from "@/components/marketing/legal-page";
import { getTermsDoc } from "@/lib/content/legal";
import type { Locale } from "@/lib/i18n/config";

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  return (
    <>
      <MarketingNav />
      <main>
        <LegalPage doc={getTermsDoc(params.locale)} />
      </main>
      <MarketingFooter locale={params.locale} />
    </>
  );
}
