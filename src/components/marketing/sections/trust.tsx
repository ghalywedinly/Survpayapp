import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { SparklesIcon, EyeIcon, CheckCircleIcon, GlobeIcon } from "@/components/icons";
import { TrustBadgeIllustration } from "@/components/marketing/trust-badge-illustration";

export function Trust({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const items = [
    { icon: SparklesIcon, title: t.trust1Title, desc: t.trust1Desc },
    { icon: EyeIcon, title: t.trust2Title, desc: t.trust2Desc },
    { icon: CheckCircleIcon, title: t.trust3Title, desc: t.trust3Desc },
    { icon: GlobeIcon, title: t.trust4Title, desc: t.trust4Desc },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0c12] py-20 text-white sm:py-28">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(50% 40% at 15% 10%, rgba(139,92,246,0.28), transparent)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="text-base font-semibold uppercase tracking-wide text-brand-300 sm:text-lg">{t.trustEyebrow}</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">{t.trustTitle}</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/60">{t.trustSubtitle}</p>
          </div>
          <TrustBadgeIllustration className="hidden h-48 w-48 shrink-0 lg:block" />
        </div>

        <div className="mt-14 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-2 sm:divide-y-0 sm:border-y-0 sm:gap-x-10 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="flex items-start gap-4 py-6 sm:border-t sm:border-white/10 sm:py-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{it.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
