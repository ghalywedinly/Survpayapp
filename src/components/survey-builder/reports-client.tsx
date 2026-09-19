"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { generateReportAction } from "@/lib/actions/insights";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { FileTextIcon, DownloadIcon, ChevronDownIcon } from "@/components/icons";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const sectionKeys = [
  "sectionExecSummary",
  "sectionMethodology",
  "sectionSample",
  "sectionFindings",
  "sectionQuestions",
  "sectionCharts",
  "sectionAiInsights",
  "sectionConclusion",
] as const;

interface ReportRow {
  id: string;
  title: string;
  createdAt: string;
}

export function ReportsClient({ surveyId, reports }: { surveyId: string; reports: ReportRow[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      await generateReportAction(locale, surveyId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-800">{t("reports.generateReport")}</p>
              <p className="mt-1 text-xs text-ink-400">
                {sectionKeys.map((k) => t(`reports.${k}`)).join(" · ")}
              </p>
            </div>
            <Button loading={pending} onClick={generate}>
              {t("reports.generateReport")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <EmptyState icon={<FileTextIcon className="h-6 w-6" />} title={t("reports.noReportsTitle")} body={t("reports.noReportsBody")} />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-400">
                    {t("reports.generatedOn")} {formatDate(r.createdAt, locale)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ExportMenu surveyId={surveyId} format="pdf" label={t("reports.exportPdf")} />
                  <ExportMenu surveyId={surveyId} format="excel" label={t("reports.exportExcel")} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => push({ title: t("reports.exportPptx"), description: t("common.comingSoon") })}
                  >
                    {t("reports.exportPptx")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ExportMenu({ surveyId, format, label }: { surveyId: string; format: "pdf" | "excel"; label: string }) {
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className={buttonClasses({ variant: "outline", size: "sm", className: "gap-1.5" })}>
          <DownloadIcon className="h-3.5 w-3.5" />
          {label}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => (window.location.href = `/api/surveys/${surveyId}/report/${format}?locale=en`)}>
          {t("reports.exportInEnglish")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => (window.location.href = `/api/surveys/${surveyId}/report/${format}?locale=ar`)}>
          {t("reports.exportInArabic")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
