import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LayersIcon, WalletIcon, BarChartIcon, FileTextIcon, TargetIcon, GlobeIcon } from "@/components/icons";

export function Features({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const features = [
    { icon: LayersIcon, title: t.feature1Title, desc: t.feature1Desc },
    { icon: WalletIcon, title: t.feature2Title, desc: t.feature2Desc },
    { icon: BarChartIcon, title: t.feature3Title, desc: t.feature3Desc },
    { icon: FileTextIcon, title: t.feature4Title, desc: t.feature4Desc },
    { icon: TargetIcon, title: t.feature5Title, desc: t.feature5Desc },
    { icon: GlobeIcon, title: t.feature6Title, desc: t.feature6Desc },
  ];

  return (
    <section className="border-t border-ink-100 bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t.featuresEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.featuresTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.featuresSubtitle}</p>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-soft transition-shadow hover:shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
