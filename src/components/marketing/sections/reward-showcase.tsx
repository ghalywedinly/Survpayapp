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
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t("marketing.rewardEyebrow")}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {t("marketing.rewardTitle")}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t("marketing.rewardSubtitle")}</p>

        <div className="mt-12 grid grid-cols-1 gap-8 rounded-2xl border border-ink-200/70 bg-gradient-to-br from-white to-ink-50/60 p-8 shadow-card lg:grid-cols-5 lg:p-10">
          <div className="space-y-8 lg:col-span-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ink-700">{t("marketing.rewardLabelAmount")}</label>
                <span className="text-sm font-semibold text-ink-900">{formatCurrency(amount, locale)}</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-3 w-full accent-brand-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-ink-700">{t("marketing.rewardLabelMax")}</label>
                <span className="text-sm font-semibold text-ink-900">{maxResponses.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}</span>
              </div>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={maxResponses}
                onChange={(e) => setMaxResponses(Number(e.target.value))}
                className="mt-3 w-full accent-brand-600"
              />
            </div>
            <p className="text-xs leading-relaxed text-ink-400">{t("marketing.rewardFootnote")}</p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-surface p-6 shadow-soft lg:col-span-2">
            <div className="flex items-center gap-2 text-ink-900">
              <WalletIcon className="h-5 w-5 text-brand-600" />
              <p className="text-sm font-semibold">{t("marketing.rewardLabelBudget")}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{formatCurrency(budget, locale)}</p>
            <div className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex items-center justify-between text-ink-500">
                <span>{t("marketing.rewardLabelFee")}</span>
                <span className="font-medium text-ink-700">{formatCurrency(fee, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-900">
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
