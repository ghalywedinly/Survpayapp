import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { QrIcon, ArrowRightIcon } from "@/components/icons";

export function QrFeedback({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const steps = [t.qrStep1, t.qrStep2, t.qrStep3];
  const descs = [t.qrStep1Desc, t.qrStep2Desc, t.qrStep3Desc];

  return (
    <section className="bg-ink-50/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t.qrEyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">{t.qrTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">{t.qrDesc}</p>
        </div>

        <div className="rounded-2xl border border-ink-200/70 bg-surface p-8 shadow-card">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3 sm:flex-col sm:text-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-content">
                  {i === 0 ? <QrIcon className="h-6 w-6" /> : <span className="text-lg font-semibold">{i + 1}</span>}
                </div>
                <div className="sm:mt-1">
                  <p className="text-sm font-semibold text-ink-900">{s}</p>
                  <p className="mt-0.5 max-w-[140px] text-xs text-ink-500">{descs[i]}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRightIcon className="hidden h-4 w-4 shrink-0 text-ink-300 rtl:rotate-180 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
