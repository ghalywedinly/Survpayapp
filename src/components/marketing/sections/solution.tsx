import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { LinkIcon, QrIcon, MessageIcon, InboxIcon, CheckIcon, ArrowRightIcon, SparklesIcon } from "@/components/icons";

export function Solution({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const cards = [
    { title: t.solutionCollectTitle, desc: t.solutionCollectDesc, visual: <CollectVisual /> },
    { title: t.solutionOrganizeTitle, desc: t.solutionOrganizeDesc, visual: <OrganizeVisual /> },
    { title: t.solutionUnderstandTitle, desc: t.solutionUnderstandDesc, visual: <UnderstandVisual stat={t.solutionStat} /> },
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

        <div className="mt-14 grid grid-cols-1 gap-6 text-start sm:grid-cols-3">
          {cards.map((c, i) => (
            <div key={c.title} className="relative">
              <div className="h-full rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                {c.visual}
                <h3 className="mt-6 text-lg font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.desc}</p>
              </div>
              {i < cards.length - 1 && (
                <div className="absolute top-1/2 -end-6 z-10 hidden -translate-y-1/2 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#150e33] text-white/50">
                    <ArrowRightIcon className="h-3.5 w-3.5 rtl:rotate-180" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlassChip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white/80 ${className}`}
    >
      {children}
    </div>
  );
}

function CollectVisual() {
  return (
    <div className="relative flex h-28 items-center justify-center">
      <GlassChip className="absolute start-1 top-0">
        <LinkIcon className="h-4 w-4" />
      </GlassChip>
      <GlassChip className="absolute end-0 top-6">
        <MessageIcon className="h-4 w-4" />
      </GlassChip>
      <GlassChip className="absolute bottom-0 start-8">
        <QrIcon className="h-4 w-4" />
      </GlassChip>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-[0_0_24px_rgba(125,67,255,0.45)]">
        <InboxIcon className="h-6 w-6" />
      </div>
    </div>
  );
}

function OrganizeVisual() {
  const rows = [0.9, 0.7, 1];
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-2">
      {rows.map((w, i) => (
        <div key={i} className="flex w-full max-w-[168px] items-center gap-2.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2">
          {i === rows.length - 1 ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint-400 text-[#150e33]">
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
          ) : (
            <span className="h-4 w-4 shrink-0 rounded-full bg-white/25" />
          )}
          <span className="h-1.5 rounded-full bg-white/25" style={{ width: `${w * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

function UnderstandVisual({ stat }: { stat: string }) {
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-3">
      <svg viewBox="0 0 140 48" className="w-full max-w-[168px]" fill="none">
        <defs>
          <linearGradient id="solutionSparkline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 34 L28 30 L56 22 L84 18 L112 8 L140 4 L140 48 L0 48 Z" fill="url(#solutionSparkline)" />
        <path d="M0 34 L28 30 L56 22 L84 18 L112 8 L140 4" stroke="#3ecf8e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-mint-400/30 bg-mint-400/15 px-3 py-1 text-xs font-semibold text-mint-300">
        <SparklesIcon className="h-3 w-3" />
        {stat}
      </span>
    </div>
  );
}
