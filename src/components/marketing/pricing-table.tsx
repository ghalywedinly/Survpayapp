"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { plans } from "@/lib/pricing";
import { formatCurrency } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const planNameKey: Record<string, "planFreeName" | "planProName" | "planBusinessName"> = {
  free: "planFreeName",
  pro: "planProName",
  business: "planBusinessName",
};
const planFeaturesKey: Record<string, "planFreeFeatures" | "planProFeatures" | "planBusinessFeatures"> = {
  free: "planFreeFeatures",
  pro: "planProFeatures",
  business: "planBusinessFeatures",
};
const planCtaKey: Record<string, "ctaFree" | "ctaPro" | "ctaBusiness"> = {
  free: "ctaFree",
  pro: "ctaPro",
  business: "ctaBusiness",
};

export function PricingTable() {
  const { t, locale, dict } = useI18n();
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-ink-200 bg-surface p-1 shadow-soft">
          <button
            onClick={() => setYearly(false)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium", !yearly ? "bg-[#12151e] text-white" : "text-ink-500")}
          >
            {t("pricingPage.monthly")}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn("flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium", yearly ? "bg-[#12151e] text-white" : "text-ink-500")}
          >
            {t("pricingPage.yearly")}
            <span className="rounded-full bg-mint-100 px-1.5 py-0.5 text-[10px] font-semibold text-mint-700">
              {t("pricingPage.yearlyDiscount")}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const features = dict.pricingPage[planFeaturesKey[plan.id]] as unknown as string[];
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-soft",
                plan.highlighted ? "border-brand-300 bg-surface ring-2 ring-brand-500/20" : "border-ink-200/70 bg-surface"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 start-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  {t("pricingPage.mostPopular")}
                </span>
              )}
              <h3 className="text-lg font-semibold text-ink-900">{dict.pricingPage[planNameKey[plan.id]]}</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight text-ink-900">
                  {price === 0 ? formatCurrency(0, locale) : formatCurrency(price, locale)}
                </span>
                {price > 0 && (
                  <span className="text-sm text-ink-400">{yearly ? t("pricingPage.perYear") : t("pricingPage.perMonth")}</span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/signup`}
                className={buttonClasses({
                  variant: plan.highlighted ? "primary" : "outline",
                  size: "lg",
                  className: "mt-8 w-full",
                })}
              >
                {t(`pricingPage.${planCtaKey[plan.id]}`)}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-24 max-w-2xl">
        <h2 className="text-center text-2xl font-semibold text-ink-900">{t("pricingPage.faqTitle")}</h2>
        <div className="mt-8 space-y-3">
          {["faq1", "faq2", "faq3"].map((key) => (
            <FaqItem key={key} question={t(`pricingPage.${key}q`)} answer={t(`pricingPage.${key}a`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-ink-200 bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-start text-sm font-medium text-ink-900"
      >
        {question}
        <ChevronDownIcon className={cn("h-4 w-4 text-ink-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-ink-500">{answer}</p>}
    </div>
  );
}
