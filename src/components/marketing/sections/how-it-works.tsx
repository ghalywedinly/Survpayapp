import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export function HowItWorks({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const steps = [
    { n: "01", title: t.step1Title, desc: t.step1Desc },
    { n: "02", title: t.step2Title, desc: t.step2Desc },
    { n: "03", title: t.step3Title, desc: t.step3Desc },
  ];

  return (
    <section className="border-t border-ink-100 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.howItWorksTitle}</h2>
          <p className="mt-4 text-lg text-ink-500">{t.howItWorksSubtitle}</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="absolute top-6 hidden h-px w-full bg-ink-100 sm:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12151e] text-sm font-semibold text-white">
                {s.n}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
