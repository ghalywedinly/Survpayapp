import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { GlobeIcon, QrIcon, CreditCardIcon } from "@/components/icons";

export function SaudiPositioning({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const points = [
    { emoji: "🇸🇦", title: t.saudiPoint1Title, desc: t.saudiPoint1Desc },
    { icon: GlobeIcon, title: t.saudiPoint2Title, desc: t.saudiPoint2Desc },
    { icon: QrIcon, title: t.saudiPoint3Title, desc: t.saudiPoint3Desc },
    { icon: CreditCardIcon, title: t.saudiPoint4Title, desc: t.saudiPoint4Desc },
  ];

  return (
    <section className="border-t border-ink-100 bg-brand-wash py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.saudiEyebrow}</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.saudiTitle}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-500">{t.saudiDesc}</p>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-ink-200/70 bg-surface p-6 text-start shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                {p.emoji ? <span className="text-lg">{p.emoji}</span> : p.icon && <p.icon className="h-5 w-5" />}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
