import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LayersIcon, QrIcon, BarChartIcon, FileTextIcon, BuildingIcon, TicketIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Features({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const questionTypes = [t.howItWorksBuilderOpt1, t.howItWorksBuilderOpt2, t.howItWorksBuilderOpt3];

  // Order matters: on the lg 3-col grid the span-2 hero tile plus this first
  // single tile exactly fill row 1 (2+1), the next three fill row 2 (1+1+1)
  // exactly, and the last tile trails alone on row 3 — a normal "shorter
  // last row" ending rather than a gap stranded mid-grid.
  const rest = [
    { icon: QrIcon, title: t.feature2Title, desc: t.feature2Desc },
    { icon: BarChartIcon, title: t.feature3Title, desc: t.feature3Desc },
    { icon: FileTextIcon, title: t.feature4Title, desc: t.feature4Desc },
    { icon: BuildingIcon, title: t.feature5Title, desc: t.feature5Desc },
    { icon: TicketIcon, title: t.feature6Title, desc: t.feature6Desc },
  ];

  return (
    <section id="features" className="bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.featuresEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.featuresTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.featuresSubtitle}</p>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* First tile is the hero feature: wider, with a small mock preview
              so the grid reads as a true bento rather than six identical
              boxes — the DESIGN_VARIANCE directive's anti-generic-grid rule. */}
          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-ink-200/70 bg-surface p-7 shadow-soft transition-shadow hover:shadow-card sm:col-span-2 sm:flex-row sm:items-center lg:col-span-2">
            <div className="max-w-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
                <LayersIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{t.feature1Title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.feature1Desc}</p>
            </div>
            <div className="w-full shrink-0 rounded-xl border border-ink-100 bg-ink-50/60 p-4 sm:w-56">
              <p className="text-xs font-medium text-ink-600">{t.howItWorksBuilderQ2}</p>
              <div className="mt-2.5 space-y-2">
                {questionTypes.map((opt, i) => (
                  <div key={opt} className="flex items-center gap-2 text-xs text-ink-600">
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        i !== 2 ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                      )}
                    >
                      {i !== 2 && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {rest.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-ink-200/70 bg-surface p-6 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
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
