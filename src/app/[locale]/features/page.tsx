import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Features } from "@/components/marketing/sections/features";
import { RewardShowcase } from "@/components/marketing/sections/reward-showcase";
import { AnalyticsShowcase } from "@/components/marketing/sections/analytics-showcase";
import { FinalCta } from "@/components/marketing/sections/final-cta";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import {
  LayersIcon,
  TargetIcon,
  FileTextIcon,
  ShieldIcon,
} from "@/components/icons";

const questionTypes = [
  "typeSingleChoice",
  "typeMultipleChoice",
  "typeDropdown",
  "typeShortText",
  "typeLongText",
  "typeRating",
  "typeLikert",
  "typeNumber",
  "typeDate",
  "typeYesNo",
  "typeNps",
  "typeMatrix",
  "typeRanking",
] as const;

export default function FeaturesPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);

  return (
    <>
      <MarketingNav />
      <main>
        <section className="border-b border-ink-100 bg-brand-wash py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900">{dict.featuresPage.title}</h1>
            <p className="mt-4 text-lg text-ink-500">{dict.featuresPage.subtitle}</p>
          </div>
        </section>

        <Features locale={params.locale} />

        <section className="border-t border-ink-100 bg-surface py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/70 p-8 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                  <LayersIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{dict.builder.questionType}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {questionTypes.map((k) => (
                    <span key={k} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600">
                      {dict.builder[k]}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-500">{dict.builder.conditionalLogicDesc}</p>
              </div>

              <div className="rounded-2xl border border-ink-200/70 p-8 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-50 text-mint-content">
                  <TargetIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{dict.marketing.feature5Title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-ink-600">
                  <li>• {dict.wizard.responseLimit}</li>
                  <li>• {dict.wizard.preventDuplicates}</li>
                  <li>• {dict.wizard.captchaEnabled}</li>
                  <li>• {dict.responses.attentionCheckFailed}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-ink-200/70 p-8 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-tint text-info-content">
                  <FileTextIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{dict.marketing.feature4Title}</h3>
                <p className="mt-3 text-sm text-ink-500">{dict.marketing.feature4Desc}</p>
              </div>

              <div className="rounded-2xl border border-ink-200/70 p-8 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-content">
                  <ShieldIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{dict.marketing.trust1Title}</h3>
                <p className="mt-3 text-sm text-ink-500">{dict.marketing.trust1Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <RewardShowcase />
        <AnalyticsShowcase locale={params.locale} />
        <FinalCta locale={params.locale} />
      </main>
      <MarketingFooter locale={params.locale} />
    </>
  );
}
