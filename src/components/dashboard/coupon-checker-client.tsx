"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency, formatDate } from "@/lib/format";
import { checkCouponAction, redeemCouponAction } from "@/lib/actions/coupons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { CheckCircleIcon, AlertIcon, TicketIcon } from "@/components/icons";

type SurveyRef = { id: string; title: string; titleAr: string | null };
type RecentRow = { code: string; amount: number; issuedAt: string; redeemedAt: string | null; survey: SurveyRef };

type CheckResult =
  | { kind: "not_found" }
  | { kind: "valid"; code: string; amount: number; issuedAt: string; survey: SurveyRef }
  | { kind: "redeemed"; code: string; amount: number; issuedAt: string; redeemedAt: string; survey: SurveyRef };

export function CouponCheckerClient({ initialRecent }: { initialRecent: RecentRow[] }) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [recent, setRecent] = useState(initialRecent);
  const [checking, startChecking] = useTransition();
  const [redeeming, startRedeeming] = useTransition();

  function surveyTitle(s: SurveyRef) {
    return locale === "ar" && s.titleAr ? s.titleAr : s.title;
  }

  function runCheck() {
    if (!code.trim()) return;
    startChecking(async () => {
      const res = await checkCouponAction(locale, code);
      if (!res.found) {
        setResult({ kind: "not_found" });
        return;
      }
      if (res.redeemed) {
        setResult({ kind: "redeemed", code: res.code, amount: res.amount, issuedAt: String(res.issuedAt), redeemedAt: String(res.redeemedAt), survey: res.survey });
      } else {
        setResult({ kind: "valid", code: res.code, amount: res.amount, issuedAt: String(res.issuedAt), survey: res.survey });
      }
    });
  }

  function runRedeem() {
    if (result?.kind !== "valid") return;
    startRedeeming(async () => {
      const res = await redeemCouponAction(locale, result.code, note);
      if (!res.ok) {
        toast.push({ title: t("coupons.resultRedeemedTitle"), tone: "error" });
        runCheck();
        return;
      }
      const redeemedAt = new Date().toISOString();
      setResult({ kind: "redeemed", code: res.code, amount: res.amount, issuedAt: result.issuedAt, redeemedAt, survey: res.survey });
      setRecent((cur) => [{ code: res.code, amount: res.amount, issuedAt: result.issuedAt, redeemedAt, survey: res.survey }, ...cur.filter((r) => r.code !== res.code)]);
      setNote("");
      toast.push({ title: t("coupons.redeemSuccess"), tone: "success" });
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("coupons.inputLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && runCheck()}
              placeholder={t("coupons.inputPlaceholder")}
              className="font-mono uppercase tracking-wider"
              autoFocus
            />
            <Button onClick={runCheck} disabled={checking || !code.trim()} className="w-full">
              {checking ? t("coupons.checking") : t("coupons.checkButton")}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card
            className={
              result.kind === "valid"
                ? "border-mint-200 bg-mint-50/60"
                : result.kind === "redeemed"
                  ? "border-amber-400 bg-amber-50/60"
                  : "border-danger-tint bg-danger-tint"
            }
          >
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-center gap-2">
                {result.kind === "valid" && <CheckCircleIcon className="h-5 w-5 text-mint-content" />}
                {result.kind === "redeemed" && <AlertIcon className="h-5 w-5 text-amber-content" />}
                {result.kind === "not_found" && <AlertIcon className="h-5 w-5 text-danger-content" />}
                <p className="text-sm font-semibold text-ink-900">
                  {result.kind === "not_found" && t("coupons.resultNotFoundTitle")}
                  {result.kind === "redeemed" && t("coupons.resultRedeemedTitle")}
                  {result.kind === "valid" && t("coupons.resultValidTitle")}
                </p>
              </div>

              {result.kind === "not_found" && <p className="text-sm text-ink-500">{t("coupons.resultNotFoundBody")}</p>}

              {(result.kind === "valid" || result.kind === "redeemed") && (
                <div className="space-y-1.5 text-sm">
                  <Row label={t("coupons.codeLabel")} value={result.code} mono />
                  <Row label={t("coupons.surveyLabel")} value={surveyTitle(result.survey)} />
                  <Row label={t("coupons.amountLabel")} value={formatCurrency(result.amount, locale)} />
                  <Row label={t("coupons.issuedLabel")} value={formatDate(result.issuedAt, locale)} />
                </div>
              )}

              {result.kind === "redeemed" && (
                <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-600">
                  {t("coupons.resultRedeemedBody", { date: formatDate(result.redeemedAt, locale) })}
                </p>
              )}

              {result.kind === "valid" && (
                <div className="space-y-2 border-t border-mint-200 pt-3">
                  <Label htmlFor="redeem-note">{t("coupons.noteLabel")}</Label>
                  <Input id="redeem-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("coupons.notePlaceholder")} />
                  <Button onClick={runRedeem} disabled={redeeming} variant="secondary" className="w-full">
                    {redeeming ? t("coupons.redeeming") : t("coupons.redeemButton")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="overflow-hidden lg:col-span-3">
        <div className="border-b border-ink-100 px-5 py-4">
          <p className="text-sm font-semibold text-ink-900">{t("coupons.recentTitle")}</p>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={<TicketIcon className="h-6 w-6" />} title={t("coupons.recentTitle")} body={t("coupons.recentEmpty")} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>{t("coupons.colCode")}</TH>
                <TH>{t("coupons.colSurvey")}</TH>
                <TH>{t("coupons.colAmount")}</TH>
                <TH>{t("coupons.colIssued")}</TH>
                <TH>{t("coupons.colStatus")}</TH>
              </TR>
            </THead>
            <TBody>
              {recent.map((r) => (
                <TR key={r.code}>
                  <TD className="font-mono text-xs">{r.code}</TD>
                  <TD>{surveyTitle(r.survey)}</TD>
                  <TD>{formatCurrency(r.amount, locale)}</TD>
                  <TD>{formatDate(r.issuedAt, locale)}</TD>
                  <TD>
                    <Badge tone={r.redeemedAt ? "neutral" : "success"}>{r.redeemedAt ? t("coupons.statusRedeemed") : t("coupons.statusUnredeemed")}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={mono ? "font-mono font-medium text-ink-900" : "font-medium text-ink-900"}>{value}</span>
    </div>
  );
}
