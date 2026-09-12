"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CopyIcon, DownloadIcon, CodeIcon, QrIcon } from "@/components/icons";

export function DistributionClient({
  link,
  qrDataUrl,
  embedCode,
  responsesSoFar,
}: {
  link: string;
  qrDataUrl: string;
  embedCode: string;
  responsesSoFar: number;
}) {
  const { t } = useI18n();
  const { push } = useToast();
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  function copy(text: string, which: "link" | "embed") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      push({ title: t("common.copied"), tone: "success" });
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const encodedLink = encodeURIComponent(link);
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedLink}`,
    email: `mailto:?subject=${encodeURIComponent("SurvPay")}&body=${encodedLink}`,
    x: `https://x.com/intent/tweet?url=${encodedLink}`,
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("distribution.linkTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={link} className="font-mono text-sm" />
            <Button variant="outline" onClick={() => copy(link, "link")} className="shrink-0 gap-1.5">
              <CopyIcon className="h-4 w-4" />
              {copied === "link" ? t("common.copied") : t("common.copyLink")}
            </Button>
          </div>
          <p className="mt-3 text-sm text-ink-500">
            {t("distribution.respondentsSoFar")}: <span className="font-semibold text-ink-900">{responsesSoFar}</span>
          </p>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <p className="mb-2 text-sm font-medium text-ink-700">{t("distribution.shareTitle")}</p>
            <div className="flex flex-wrap gap-2">
              <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                {t("distribution.shareWhatsapp")}
              </a>
              <a href={shareLinks.email} className="rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                {t("distribution.shareEmail")}
              </a>
              <a href={shareLinks.x} target="_blank" rel="noreferrer" className="rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                {t("distribution.shareX")}
              </a>
            </div>
          </div>

          <div className="mt-6 border-t border-ink-100 pt-5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <CodeIcon className="h-4 w-4" /> {t("distribution.embedTitle")}
            </p>
            <p className="mb-2 text-xs text-ink-400">{t("distribution.embedDesc")}</p>
            <pre className="overflow-x-auto rounded-lg bg-[#12151e] p-3 text-xs text-mint-300">{embedCode}</pre>
            <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => copy(embedCode, "embed")}>
              <CopyIcon className="h-3.5 w-3.5" />
              {copied === "embed" ? t("common.copied") : t("distribution.copyEmbed")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <QrIcon className="h-4 w-4" /> {t("distribution.qrTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code" className="h-44 w-44 rounded-xl border border-ink-100" />
          <a
            href={qrDataUrl}
            download="survpay-qr.png"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <DownloadIcon className="h-4 w-4" />
            {t("distribution.downloadQr")}
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
