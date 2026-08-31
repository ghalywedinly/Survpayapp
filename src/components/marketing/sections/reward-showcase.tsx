"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency } from "@/lib/format";
import { platformFeePct } from "@/lib/pricing";
import { WalletIcon } from "@/components/icons";

export function RewardShowcase() {
  const { t, locale } = useI18n();
  const [amount, setAmount] = useState(10);
  const [maxResponses, setMaxResponses] = useState(500);

  const { budget, fee, total } = useMemo(() => {
    const budget = amount * maxResponses;
    const fee = Math.round(budget * platformFeePct * 100) / 100;
    return { budget, fee, total: budget + fee };
  }, [amount, maxResponses]);

  return (
    <section className="border-t border-ink-100 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-content">{t("marketing.rewardEyebrow")}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {t("marketing.rewardTitle")}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t("marketing.rewardSubtitle")}</p>

        {/* This panel is a deliberate inversion, not the usual reactive
            surface: a dark card in light mode, a bright card in dark mode —
            so it pops as a standout "calculator" against the page either
            way, rather than blending in like an ordinary card. Every color
            inside is written as an explicit light-dark pair for that
            reason, instead of the reactive ink and content tokens used
            elsewhere (those move the same direction as the page; this
            panel deliberately moves the opposite direction). */}
        <div className="mt-12 grid grid-cols-1 gap-8 rounded-2xl border border-[#242a38] bg-[#12151e] p-8 shadow-card dark:border-[#dde1e8] dark:bg-white lg:grid-cols-5 lg:p-10">
          <div className="space-y-8 lg:col-span-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#c3c9d4] dark:text-[#3b4356]">{t("marketing.rewardLabelAmount")}</label>
                <span className="text-sm font-semibold text-white dark:text-[#12151e]">{formatCurrency(amount, locale)}</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-3 w-full accent-brand-400 dark:accent-brand-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#c3c9d4] dark:text-[#3b4356]">{t("marketing.rewardLabelMax")}</label>
                <span className="text-sm font-semibold text-white dark:text-[#12151e]">{maxResponses.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxResponses}
                onChange={(e) => setMaxResponses(Number(e.target.value))}
                className="mt-3 w-full accent-brand-400 dark:accent-brand-600"
              />
            </div>
            <p className="text-xs leading-relaxed text-[#9aa3b2] dark:text-[#717c8f]">{t("marketing.rewardFootnote")}</p>
          </div>

          <div className="rounded-xl border border-[#3b4356] bg-[#1c2029] p-6 shadow-soft dark:border-[#eef0f4] dark:bg-[#f7f8fa] lg:col-span-2">
            <div className="flex items-center gap-2 text-white dark:text-[#12151e]">
              <WalletIcon className="h-5 w-5 text-[#a89dff] dark:text-[#4c2fd6]" />
              <p className="text-sm font-semibold">{t("marketing.rewardLabelBudget")}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white dark:text-[#12151e]">{formatCurrency(budget, locale)}</p>
            <div className="mt-5 space-y-2 border-t border-[#3b4356] pt-4 text-sm dark:border-[#eef0f4]">
              <div className="flex items-center justify-between text-[#9aa3b2] dark:text-[#717c8f]">
                <span>{t("marketing.rewardLabelFee")}</span>
                <span className="font-medium text-[#c3c9d4] dark:text-[#3b4356]">{formatCurrency(fee, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-white dark:text-[#12151e]">
                <span className="font-medium">{t("marketing.rewardLabelTotal")}</span>
                <span className="font-semibold">{formatCurrency(total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
