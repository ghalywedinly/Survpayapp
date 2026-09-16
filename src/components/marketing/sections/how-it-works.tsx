import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SparklesIcon, CheckIcon, ArrowRightIcon } from "@/components/icons";
import { CreateVisual, ShareVisual, CollectVisual, UnderstandVisual, ImproveVisual } from "./how-it-works-visuals";

const badgeTone = {
  brand: "bg-brand-600",
  info: "bg-info-content",
  mint: "bg-mint-500",
  amber: "bg-amber-500",
} as const;

export function HowItWorks({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const steps = [
    {
      n: "01",
      tone: "brand" as const,
      title: t.step1Title,
      desc: t.step1Desc,
      checks: [t.step1Check1, t.step1Check2, t.step1Check3],
      visual: <CreateVisual dict={dict} />,
    },
    {
      n: "02",
      tone: "info" as const,
      title: t.step2Title,
      desc: t.step2Desc,
      checks: [t.step2Check1, t.step2Check2, t.step2Check3],
      visual: <ShareVisual dict={dict} />,
    },
    {
      n: "03",
      tone: "mint" as const,
      title: t.step3Title,
      desc: t.step3Desc,
      checks: [t.step3Check1, t.step3Check2, t.step3Check3],
      visual: <CollectVisual dict={dict} />,
    },
    {
      n: "04",
      tone: "amber" as const,
      title: t.step4Title,
      desc: t.step4Desc,
      checks: [t.step4Check1, t.step4Check2, t.step4Check3],
      visual: <UnderstandVisual dict={dict} />,
    },
    {
      n: "05",
      tone: "brand" as const,
      title: t.step5Title,
      desc: t.step5Desc,
      checks: [t.step5Check1, t.step5Check2, t.step5Check3],
      visual: <ImproveVisual dict={dict} locale={locale} />,
    },
  ];

  return (
    <section id="how-it-works" className="bg-surface">
      <div className="mx-auto max-w-3xl px-6 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-content">
          <SparklesIcon className="h-3.5 w-3.5" />
          {t.howItWorksEyebrow}
        </span>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">{t.howItWorksTitle}</h2>
        <p className="mt-4 text-lg text-ink-500">{t.howItWorksSubtitle}</p>
      </div>

      {steps.map((s, i) => {
        const reversed = i % 2 === 1;
        const nextStep = steps[i + 1];
        const text = (
          <div key="text" className="min-w-0">
            <div className="flex items-center gap-3">
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-white", badgeTone[s.tone])}>
                {s.n}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{s.title}</h3>
            <p className="mt-3 max-w-md text-base leading-relaxed text-ink-500">{s.desc}</p>
            <ul className="mt-6 space-y-2.5">
              {s.checks.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-sm text-ink-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-50 text-mint-content">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              {nextStep ? (
                <a href={`#step-${nextStep.n}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-content">
                  {t.howItWorksNext}
                  <ArrowRightIcon className="h-3.5 w-3.5 rtl:rotate-180" />
                </a>
              ) : (
                <Link href={`/${locale}/signup`} className={buttonClasses({ size: "xl", className: "gap-2.5" })}>
                  {t.heroCtaPrimary}
                  <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
                </Link>
              )}
            </div>
          </div>
        );
        const visual = (
          <div key="visual" className="animate-fade-in">
            {s.visual}
          </div>
        );

        return (
          <div key={s.n} id={`step-${s.n}`} className={i % 2 === 0 ? "bg-surface" : "bg-ink-50/40"}>
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                {reversed ? [visual, text] : [text, visual]}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
