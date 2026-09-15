import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { BuildingIcon } from "@/components/icons";

export function MultiBranch({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const branches = [
    { name: t.branch1Name, pct: 91 },
    { name: t.branch2Name, pct: 87 },
    { name: t.branch3Name, pct: 84 },
    { name: t.branch4Name, pct: 79 },
  ];

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.branchEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{t.branchTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{t.branchDesc}</p>
        </div>

        <div className="rounded-2xl border border-ink-200/70 bg-ink-50/40 p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <BuildingIcon className="h-4 w-4 text-brand-content" />
            {t.branchAllLabel}
          </div>
          <ul className="mt-5 space-y-4">
            {branches.map((b) => (
              <li key={b.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-700">{b.name}</span>
                  <span className="font-medium text-ink-900">{b.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${b.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
