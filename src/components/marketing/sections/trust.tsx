import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { ShieldIcon, EyeIcon, CheckCircleIcon, GlobeIcon } from "@/components/icons";

export function Trust({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const items = [
    { icon: ShieldIcon, title: t.trust1Title, desc: t.trust1Desc },
    { icon: EyeIcon, title: t.trust2Title, desc: t.trust2Desc },
    { icon: CheckCircleIcon, title: t.trust3Title, desc: t.trust3Desc },
    { icon: GlobeIcon, title: t.trust4Title, desc: t.trust4Desc },
  ];

  return (
    <section className="relative overflow-hidden border-t border-ink-100 bg-[#0a0c12] py-20 text-white sm:py-28">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(50% 40% at 15% 10%, rgba(139,92,246,0.28), transparent)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">{t.trustEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.trustTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-white/60">{t.trustSubtitle}</p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
