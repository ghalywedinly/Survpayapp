"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency, formatDate } from "@/lib/format";
import { fundBudgetAction, refundBudgetAction } from "@/lib/actions/rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { WalletIcon, DownloadIcon } from "@/components/icons";

interface Tx {
  id: string;
  type: string;
  amount: number;
  respondents: number;
  status: string;
  createdAt: string;
}

const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  processing: "warning",
  pending: "neutral",
  failed: "danger",
  expired: "neutral",
};

export function BudgetClient({
  surveyId,
  funded,
  distributed,
  rewardedCount,
  maxResponses,
  transactions,
}: {
  surveyId: string;
  funded: number;
  distributed: number;
  rewardedCount: number;
  maxResponses: number;
  transactions: Tx[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const remaining = funded - distributed;

  const typeLabel: Record<string, string> = {
    funding: t("rewards.txFunding"),
    reward: t("rewards.txReward"),
    refund: t("rewards.txRefund"),
  };
  const statusLabel: Record<string, string> = {
    completed: t("rewards.statusCompleted"),
    processing: t("rewards.statusProcessing"),
    pending: t("rewards.statusPending"),
    failed: t("rewards.statusFailed"),
    expired: t("rewards.statusExpired"),
  };

  function downloadCsv() {
    const header = ["Date", "Type", "Respondents", "Amount", "Status"];
    const rows = transactions.map((tx) => [formatDate(tx.createdAt, locale), tx.type, String(tx.respondents), String(tx.amount), tx.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-${surveyId}-transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <WalletIcon className="h-4 w-4" /> {t("rewards.overviewTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-ink-400">{t("rewards.funded")}</p>
              <p className="text-xl font-semibold text-ink-900">{formatCurrency(funded, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t("rewards.distributed")}</p>
              <p className="text-xl font-semibold text-ink-900">{formatCurrency(distributed, locale)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t("rewards.remaining")}</p>
              <p className="text-xl font-semibold text-mint-content">{formatCurrency(remaining, locale)}</p>
            </div>
          </div>
          <Progress value={funded > 0 ? (distributed / funded) * 100 : 0} className="mt-4" />
          <p className="mt-2 text-xs text-ink-400">
            {t("rewards.rewardedCount")}: {rewardedCount} / {maxResponses}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setAddOpen(true)}>
              {t("rewards.addFunds")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await refundBudgetAction(locale, surveyId);
                  push({ title: `${t("rewards.refund")}: ${formatCurrency(result.refunded, locale)}`, tone: "success" });
                  router.refresh();
                })
              }
            >
              {t("rewards.refund")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadCsv}>
              <DownloadIcon className="h-3.5 w-3.5" />
              {t("rewards.downloadTx")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("rewards.txHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>{t("rewards.colDate")}</TH>
                <TH>{t("rewards.colType")}</TH>
                <TH>{t("rewards.colRespondents")}</TH>
                <TH>{t("rewards.colAmount")}</TH>
                <TH>{t("rewards.colStatus")}</TH>
              </TR>
            </THead>
            <TBody>
              {transactions.map((tx) => (
                <TR key={tx.id}>
                  <TD>{formatDate(tx.createdAt, locale)}</TD>
                  <TD>{typeLabel[tx.type] ?? tx.type}</TD>
                  <TD>{tx.respondents}</TD>
                  <TD>{formatCurrency(tx.amount, locale)}</TD>
                  <TD>
                    <Badge tone={statusTone[tx.status] ?? "neutral"} dot>
                      {statusLabel[tx.status] ?? tx.status}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogTitle>{t("rewards.addFundsTitle")}</DialogTitle>
        <DialogDescription>{t("rewards.addFundsNote")}</DialogDescription>
        <div className="mt-4">
          <Label>{t("rewards.addFundsAmount")}</Label>
          <Input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                await fundBudgetAction(locale, surveyId, amount);
                setAddOpen(false);
                push({ title: t("settings.changesSaved"), tone: "success" });
                router.refresh();
              })
            }
          >
            {t("rewards.addFundsCta")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
