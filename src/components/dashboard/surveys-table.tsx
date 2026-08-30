"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SurveyStatusBadge } from "./survey-status-badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLinkItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreIcon, EditIcon, EyeIcon, LinkIcon, CopyIcon, PauseIcon, PlayIcon, TrashIcon, BarChartIcon } from "@/components/icons";
import { duplicateSurveyAction, deleteSurveyAction, setSurveyStatusAction } from "@/lib/actions/surveys";
import { useToast } from "@/components/ui/toast";

interface SurveyRow {
  id: string;
  title: string;
  titleAr: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { responses: number };
  rewardConfig: { amount: number; currency: string; maxResponses: number; enabled: boolean } | null;
  rewardBudget: { fundedAmount: number; distributedAmount: number } | null;
}

export function SurveysTable({ surveys }: { surveys: SurveyRow[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<SurveyRow | null>(null);

  function run(action: () => Promise<unknown>, successMsg?: string) {
    startTransition(async () => {
      await action();
      if (successMsg) push({ title: successMsg, tone: "success" });
      router.refresh();
    });
  }

  return (
    <>
      <Table>
        <THead>
          <TR>
            <TH>{t("surveys.colName")}</TH>
            <TH>{t("surveys.colStatus")}</TH>
            <TH>{t("surveys.colResponses")}</TH>
            <TH>{t("surveys.colReward")}</TH>
            <TH>{t("surveys.colBudget")}</TH>
            <TH>{t("surveys.colCreated")}</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {surveys.map((s) => {
            const title = locale === "ar" && s.titleAr ? s.titleAr : s.title;
            const target = s.rewardConfig?.maxResponses ?? 0;
            const completion = target > 0 ? Math.min(100, (s._count.responses / target) * 100) : 0;
            const remaining = s.rewardBudget ? s.rewardBudget.fundedAmount - s.rewardBudget.distributedAmount : 0;

            return (
              <TR key={s.id}>
                <TD className="max-w-[240px]">
                  <Link href={`/${locale}/surveys/${s.id}`} className="block truncate font-medium text-ink-900 hover:text-brand-600">
                    {title}
                  </Link>
                  {target > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={completion} className="h-1 w-24" />
                      <span className="text-xs text-ink-400">
                        {s._count.responses}/{target}
                      </span>
                    </div>
                  )}
                </TD>
                <TD>
                  <SurveyStatusBadge status={s.status} />
                </TD>
                <TD>{s._count.responses.toLocaleString()}</TD>
                <TD>
                  {s.rewardConfig?.enabled ? formatCurrency(s.rewardConfig.amount, locale, s.rewardConfig.currency) : "—"}
                </TD>
                <TD>{s.rewardBudget ? formatCurrency(remaining, locale) : "—"}</TD>
                <TD>{formatDate(s.createdAt, locale)}</TD>
                <TD>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700">
                        <MoreIcon className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLinkItem href={`/${locale}/surveys/${s.id}/edit`}>
                        <EditIcon className="h-4 w-4" /> {t("surveys.actionEdit")}
                      </DropdownMenuLinkItem>
                      <DropdownMenuLinkItem href={`/${locale}/surveys/${s.id}/preview`}>
                        <EyeIcon className="h-4 w-4" /> {t("surveys.actionPreview")}
                      </DropdownMenuLinkItem>
                      <DropdownMenuLinkItem href={`/${locale}/surveys/${s.id}/distribution`}>
                        <LinkIcon className="h-4 w-4" /> {t("surveys.actionShare")}
                      </DropdownMenuLinkItem>
                      <DropdownMenuLinkItem href={`/${locale}/surveys/${s.id}/analytics`}>
                        <BarChartIcon className="h-4 w-4" /> {t("surveys.actionViewResults")}
                      </DropdownMenuLinkItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => run(() => duplicateSurveyAction(locale, s.id))}
                      >
                        <CopyIcon className="h-4 w-4" /> {t("surveys.actionDuplicate")}
                      </DropdownMenuItem>
                      {s.status === "active" && (
                        <DropdownMenuItem onClick={() => run(() => setSurveyStatusAction(locale, s.id, "paused"))}>
                          <PauseIcon className="h-4 w-4" /> {t("surveys.actionPause")}
                        </DropdownMenuItem>
                      )}
                      {s.status === "paused" && (
                        <DropdownMenuItem onClick={() => run(() => setSurveyStatusAction(locale, s.id, "active"))}>
                          <PlayIcon className="h-4 w-4" /> {t("surveys.actionResume")}
                        </DropdownMenuItem>
                      )}
                      {(s.status === "active" || s.status === "paused") && (
                        <DropdownMenuItem onClick={() => run(() => setSurveyStatusAction(locale, s.id, "closed"))}>
                          <PauseIcon className="h-4 w-4" /> {t("surveys.actionClose")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setConfirmDelete(s)}>
                        <TrashIcon className="h-4 w-4" /> {t("surveys.actionDelete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogTitle>{t("surveys.deleteConfirmTitle")}</DialogTitle>
        <DialogDescription>{t("surveys.deleteConfirmBody")}</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            loading={pending}
            onClick={() => {
              if (!confirmDelete) return;
              const id = confirmDelete.id;
              setConfirmDelete(null);
              run(() => deleteSurveyAction(locale, id));
            }}
          >
            {t("surveys.actionDelete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
