import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { InboxIcon, ListIcon, EyeIcon, MessageIcon, PhoneIcon } from "@/components/icons";

export function Problem({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const cards = [
    { icon: InboxIcon, title: t.problem1Title, desc: t.problem1Desc },
    { icon: ListIcon, title: t.problem2Title, desc: t.problem2Desc },
    { icon: EyeIcon, title: t.problem3Title, desc: t.problem3Desc },
  ];

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md pb-6 pt-4">
            <img
              src="/images/problem-review.webp"
              alt={t.problemImageAlt}
              className="aspect-[4/5] w-full rounded-2xl border border-ink-200/70 object-cover shadow-pop"
            />
            <div className="absolute -top-3 start-6 flex items-center gap-2 rounded-full border border-ink-200/70 bg-surface px-3 py-2 shadow-card">
              <InboxIcon className="h-4 w-4 text-amber-content" />
              <span className="text-xs font-medium text-ink-700">{t.problemBadge1}</span>
            </div>
            <div className="absolute top-1/3 -end-4 flex items-center gap-2 rounded-full border border-ink-200/70 bg-surface px-3 py-2 shadow-card">
              <MessageIcon className="h-4 w-4 text-mint-content" />
              <span className="text-xs font-medium text-ink-700">{t.problemBadge2}</span>
            </div>
            <div className="absolute bottom-2 start-10 flex items-center gap-2 rounded-full border border-ink-200/70 bg-surface px-3 py-2 shadow-card">
              <PhoneIcon className="h-4 w-4 text-info-content" />
              <span className="text-xs font-medium text-ink-700">{t.problemBadge3}</span>
            </div>
          </div>

          <div>
            <p className="text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.problemEyebrow}</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.problemTitle}</h2>
            <p className="mt-4 text-lg text-ink-500">{t.problemSubtitle}</p>

            <div className="mt-8 space-y-4">
              {cards.map((c) => (
                <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-ink-200/70 bg-ink-50/40 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-content">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink-900">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-lg font-medium text-ink-900">{t.problemClosing}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
