"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate, formatDuration } from "@/lib/format";
import { setResponseStatusAction, exportResponsesCsvAction } from "@/lib/actions/responses";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { InboxIcon, MoreIcon, DownloadIcon } from "@/components/icons";

interface Answer {
  questionId: string;
  value: string;
}
interface ResponseRow {
  id: string;
  status: string;
  rewardStatus: string;
  country: string | null;
  device: string | null;
  completionSeconds: number | null;
  submittedAt: string | null;
  failedAttentionCheck: boolean;
  answers: Answer[];
}
interface QuestionMeta {
  id: string;
  text: string;
  textAr: string | null;
}

const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  valid: "success",
  flagged: "warning",
  rejected: "danger",
  pending: "neutral",
};
const rewardTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  completed: "success",
  processing: "warning",
  pending: "neutral",
  failed: "danger",
  not_applicable: "neutral",
};

export function ResponsesClient({ surveyId, responses, questions }: { surveyId: string; responses: ResponseRow[]; questions: QuestionMeta[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewing, setViewing] = useState<ResponseRow | null>(null);

  function setStatus(id: string, status: "valid" | "rejected" | "flagged") {
    startTransition(async () => {
      await setResponseStatusAction(locale, surveyId, id, status);
      router.refresh();
    });
  }

  async function exportCsv() {
    const csv = await exportResponsesCsvAction(locale, surveyId);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responses-${surveyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (responses.length === 0) {
    return <EmptyState icon={<InboxIcon className="h-6 w-6" />} title={t("responses.emptyTitle")} body={t("responses.emptyBody")} />;
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
          <DownloadIcon className="h-3.5 w-3.5" />
          {t("responses.exportCsv")}
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>{t("responses.colId")}</TH>
            <TH>{t("responses.colDate")}</TH>
            <TH>{t("responses.colCompletionTime")}</TH>
            <TH>{t("responses.colStatus")}</TH>
            <TH>{t("responses.colRewardStatus")}</TH>
            <TH>{t("responses.colCountry")}</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {responses.map((r) => (
            <TR key={r.id}>
              <TD className="font-mono text-xs">{r.id.slice(0, 10)}</TD>
              <TD>{r.submittedAt ? formatDate(r.submittedAt, locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</TD>
              <TD>{r.completionSeconds ? formatDuration(r.completionSeconds, locale) : "—"}</TD>
              <TD>
                <Badge tone={statusTone[r.status] ?? "neutral"} dot>
                  {t(`responses.status${cap(r.status)}`)}
                </Badge>
                {r.failedAttentionCheck && <span className="ms-1.5 text-[11px] text-amber-content">⚠</span>}
              </TD>
              <TD>
                <Badge tone={rewardTone[r.rewardStatus] ?? "neutral"}>{r.rewardStatus.replace("_", " ")}</Badge>
              </TD>
              <TD>{r.country ?? "—"}</TD>
              <TD>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700">
                      <MoreIcon className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setViewing(r)}>{t("responses.actionView")}</DropdownMenuItem>
                    {r.status !== "valid" && <DropdownMenuItem onClick={() => setStatus(r.id, "valid")}>{t("responses.actionApprove")}</DropdownMenuItem>}
                    {r.status !== "flagged" && <DropdownMenuItem onClick={() => setStatus(r.id, "flagged")}>{t("responses.actionFlag")}</DropdownMenuItem>}
                    {r.status !== "rejected" && (
                      <DropdownMenuItem destructive onClick={() => setStatus(r.id, "rejected")}>
                        {t("responses.actionReject")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogTitle>{t("responses.detailTitle")}</DialogTitle>
        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto">
          {viewing?.answers.map((a) => {
            const q = questions.find((qq) => qq.id === a.questionId);
            let display = a.value;
            try {
              const parsed = JSON.parse(a.value);
              display = Array.isArray(parsed) ? parsed.join(", ") : typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed);
            } catch {
              // keep raw
            }
            return (
              <div key={a.questionId}>
                <p className="text-xs font-medium text-ink-400">{(locale === "ar" ? q?.textAr : q?.text) ?? q?.text}</p>
                <p className="text-sm text-ink-800">{display}</p>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewing(null)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
