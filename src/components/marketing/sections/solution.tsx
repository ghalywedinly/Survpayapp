import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LinkIcon, InboxIcon, SparklesIcon, CheckCircleIcon } from "@/components/icons";

export function Solution({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const points = [
    { icon: LinkIcon, title: t.solutionCollectTitle, desc: t.solutionCollectDesc },
    { icon: InboxIcon, title: t.solutionOrganizeTitle, desc: t.solutionOrganizeDesc },
    { icon: SparklesIcon, title: t.solutionUnderstandTitle, desc: t.solutionUnderstandDesc },
  ];

  return (
    <section id="the-solution" className="relative overflow-hidden bg-[#150e33] py-20 sm:py-28">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(55% 45% at 85% 0%, rgba(125,67,255,0.35), transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(40% 35% at 10% 100%, rgba(60,207,142,0.16), transparent)" }}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <p className="text-base font-semibold uppercase tracking-wide text-brand-300 sm:text-lg">{t.solutionEyebrow}</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl">
          {t.solutionTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">{t.solutionSubtitle}</p>

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div
            className="absolute -inset-6 -z-10 rounded-[2rem] opacity-80 blur-2xl sm:-inset-10"
            style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(125,67,255,0.35), transparent)" }}
          />

          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="mx-auto flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                app.survpay.com/dashboard
              </span>
            </div>
            <img
              src="/images/dashboard-home-screenshot.png"
              alt={t.solutionScreenshotAlt}
              className="aspect-[8/5] w-full bg-[#0e0a24] object-cover object-top"
            />
          </div>

          <div className="absolute -bottom-5 start-6 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#1b1440]/90 px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:-start-6 sm:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-400/15 text-mint-300">
              <CheckCircleIcon className="h-[18px] w-[18px]" />
            </div>
            <div className="text-start">
              <p className="text-lg font-semibold leading-none text-white">{t.solutionStat}</p>
              <p className="mt-1 text-xs text-white/50">{t.solutionWatchCaption}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 text-start sm:mt-20 sm:grid-cols-3 sm:gap-6">
          {points.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-brand-300">
                <p.icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
