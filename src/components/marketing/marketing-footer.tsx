import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export function MarketingFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  return (
    <footer className="border-t border-ink-100 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-3 max-w-[220px] text-sm text-ink-500">{t.footerTagline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.footerProduct}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li><Link href={`/${locale}/features`} className="hover:text-ink-900">{dict.nav.features}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="hover:text-ink-900">{dict.nav.howItWorks}</Link></li>
              <li><Link href={`/${locale}/pricing`} className="hover:text-ink-900">{dict.nav.pricing}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.footerCompany}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li><Link href={`/${locale}/resources`} className="hover:text-ink-900">{t.footerAbout}</Link></li>
              <li><Link href={`/${locale}/resources`} className="hover:text-ink-900">{t.footerContact}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.footerLegal}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li><Link href={`/${locale}/privacy`} className="hover:text-ink-900">{t.footerPrivacy}</Link></li>
              <li><Link href={`/${locale}/terms`} className="hover:text-ink-900">{t.footerTerms}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SurvPay. {t.footerRights}</p>
          <p>{dict.footer.madePhrase}</p>
        </div>
      </div>
    </footer>
  );
}
