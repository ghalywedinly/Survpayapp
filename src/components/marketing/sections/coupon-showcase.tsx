import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PlusIcon, TicketIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/icons";
import { BrandGradientBlobs } from "@/components/brand-blobs";

export function CouponShowcase({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.marketing;

  const capabilities = [
    { icon: PlusIcon, title: t.couponCapability1Title, desc: t.couponCapability1Desc },
    { icon: TicketIcon, title: t.couponCapability2Title, desc: t.couponCapability2Desc },
    { icon: CheckCircleIcon, title: t.couponCapability3Title, desc: t.couponCapability3Desc },
  ];

  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28">
      <BrandGradientBlobs variant="bottom-start" className="h-72 w-72 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6">
        <p className="text-base font-semibold uppercase tracking-wide text-brand-content sm:text-lg">{t.couponEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">{t.couponTitle}</h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t.couponSubtitle}</p>

        {/* This panel is a deliberate inversion, not the usual reactive
            surface: a dark card in light mode, a bright card in dark mode —
            so it pops as a standout showcase against the page either way,
            rather than blending in like an ordinary card. Every color inside
            is written as an explicit light-dark pair for that reason,
            instead of the reactive ink and content tokens used elsewhere. */}
        <div className="mt-12 grid grid-cols-1 gap-8 rounded-2xl border border-[#242a38] bg-[#12151e] p-8 shadow-card dark:border-[#dde1e8] dark:bg-white lg:grid-cols-5 lg:p-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-3">
            {capabilities.map((c) => (
              <div key={c.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#a89dff] dark:bg-brand-50 dark:text-brand-content">
                  <c.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white dark:text-[#12151e]">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#9aa3b2] dark:text-[#717c8f]">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#3b4356] bg-[#1c2029] p-6 shadow-soft dark:border-[#eef0f4] dark:bg-[#f7f8fa] lg:col-span-2">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#c3c9d4] dark:text-[#3b4356]">
              <span>{t.couponFlowFeedback}</span>
              <ArrowRightIcon className="h-3 w-3 text-[#5a6478] rtl:rotate-180" />
              <span>{t.couponFlowCoupon}</span>
              <ArrowRightIcon className="h-3 w-3 text-[#5a6478] rtl:rotate-180" />
              <span>{t.couponFlowVisit}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[#4c2fd6]/50 bg-[#4c2fd6]/10 px-4 py-3">
              <TicketIcon className="h-5 w-5 shrink-0 text-[#a89dff] dark:text-[#4c2fd6]" />
              <p className="text-sm font-semibold text-white dark:text-[#12151e]">{t.couponExample}</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#9aa3b2] dark:text-[#717c8f]">{t.couponFootnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
