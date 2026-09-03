"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency, formatDate } from "@/lib/format";
import { plans, type PlanId } from "@/lib/pricing";
import { changePlanAction } from "@/lib/actions/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dialog, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { CreditCardIcon, WalletIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const planNameKey: Record<PlanId, "planFreeName" | "planProName" | "planBusinessName"> = {
  free: "planFreeName",
  pro: "planProName",
  business: "planBusinessName",
};

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
}
interface Tx {
  id: string;
  purpose: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
}

export function BillingClient({
  currentPlan,
  totals,
  invoices,
  transactions,
}: {
  currentPlan: PlanId;
  totals: { funded: number; distributed: number; remaining: number };
  invoices: Invoice[];
  transactions: Tx[];
}) {
  const { t, locale, dict } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [planDialog, setPlanDialog] = useState(false);
  const [pending, startTransition] = useTransition();

  const plan = plans.find((p) => p.id === currentPlan) ?? plans[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.subscriptionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-400">{t("billing.currentPlan")}</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-ink-900">
                {dict.pricingPage[planNameKey[plan.id]]}
                {plan.id !== "free" && <Badge tone="brand">{formatCurrency(plan.monthlyPrice, locale)}/mo</Badge>}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {t("billing.nextBillingDate")}: {formatDate(nextMonth(), locale)}
              </p>
            </div>
            <Button variant="outline" onClick={() => setPlanDialog(true)}>
              {t("billing.changePlan")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <WalletIcon className="h-4 w-4" /> {t("billing.incentiveTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-500">{t("billing.incentiveDesc")}</p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-400">{t("billing.totalFunded")}</p>
              <p className="text-xl font-semibold text-ink-900">{formatCurrency(totals.funded, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t("billing.totalDistributed")}</p>
              <p className="text-xl font-semibold text-ink-900">{formatCurrency(totals.distributed, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t("billing.totalRemaining")}</p>
              <p className="text-xl font-semibold text-mint-content">{formatCurrency(totals.remaining, locale)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <CreditCardIcon className="h-4 w-4" /> {t("billing.paymentMethodsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-12 items-center justify-center rounded-md bg-[#12151e] text-[10px] font-bold text-white">VISA</div>
              <div>
                <p className="text-sm font-medium text-ink-800">•••• •••• •••• 4242</p>
                <p className="text-xs text-ink-400">Expires 08/29</p>
              </div>
            </div>
            <Badge tone="success">{t("common.demo")}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => push({ title: t("billing.addPaymentMethod"), description: "Demo mode — no real card data is collected or stored." })}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            {t("billing.addPaymentMethod")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.invoicesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <p className="p-5 text-sm text-ink-400">—</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("billing.colInvoice")}</TH>
                  <TH>{t("billing.colPeriod")}</TH>
                  <TH>{t("billing.colAmount")}</TH>
                  <TH>{t("billing.colStatus")}</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {invoices.map((inv) => (
                  <TR key={inv.id}>
                    <TD className="font-mono text-xs">{inv.number}</TD>
                    <TD>
                      {formatDate(inv.periodStart, locale)} – {formatDate(inv.periodEnd, locale)}
                    </TD>
                    <TD>{formatCurrency(inv.amount, locale)}</TD>
                    <TD>
                      <Badge tone={inv.status === "paid" ? "success" : "neutral"}>{inv.status}</Badge>
                    </TD>
                    <TD className="text-brand-content">{t("billing.download")}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.txHistoryTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="p-5 text-sm text-ink-400">—</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>{t("rewards.colDate")}</TH>
                  <TH>{t("common.status")}</TH>
                  <TH>{t("billing.colAmount")}</TH>
                </TR>
              </THead>
              <TBody>
                {transactions.map((tx) => (
                  <TR key={tx.id}>
                    <TD>
                      {formatDate(tx.createdAt, locale)}
                      <p className="text-xs text-ink-400">{tx.description ?? tx.purpose}</p>
                    </TD>
                    <TD>
                      <Badge tone={tx.status === "completed" ? "success" : "neutral"}>{tx.status}</Badge>
                    </TD>
                    <TD>{formatCurrency(tx.amount, locale)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogTitle>{t("billing.changePlan")}</DialogTitle>
        <div className="mt-4 space-y-2">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                startTransition(async () => {
                  await changePlanAction(locale, p.id);
                  setPlanDialog(false);
                  router.refresh();
                })
              }
              disabled={pending}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start",
                p.id === currentPlan ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300"
              )}
            >
              <span className="text-sm font-medium text-ink-900">{dict.pricingPage[planNameKey[p.id]]}</span>
              <span className="text-sm text-ink-500">{p.monthlyPrice === 0 ? t("pricingPage.ctaFree") : formatCurrency(p.monthlyPrice, locale) + "/mo"}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPlanDialog(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function nextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}
