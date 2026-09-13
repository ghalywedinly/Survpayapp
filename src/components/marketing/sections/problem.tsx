import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { InboxIcon, ListIcon, EyeIcon } from "@/components/icons";

export function Problem({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const cards = [
    { icon: InboxIcon, title: t.problem1Title, desc: t.problem1Desc },
    { icon: ListIcon, title: t.problem2Title, desc: t.problem2Desc },
    { icon: EyeIcon, title: t.problem3Title, desc: t.problem3Desc },
  ];

  return (
    <section className="border-t border-ink-100 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.problemEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.problemTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.problemSubtitle}</p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-ink-200/70 bg-ink-50/40 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-content">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-lg font-medium text-ink-900">{t.problemClosing}</p>
      </div>
    </section>
  );
}
