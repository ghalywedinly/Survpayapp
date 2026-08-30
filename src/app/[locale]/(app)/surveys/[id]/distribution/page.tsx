import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { requireOrgContext } from "@/lib/auth/guards";
import { SurveyService } from "@/lib/services/survey-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { SurveySubnav } from "@/components/survey-builder/survey-subnav";
import { DistributionClient } from "@/components/survey-builder/distribution-client";

export default async function DistributionPage({ params }: { params: { locale: Locale; id: string } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const survey = await SurveyService.getFull(params.id, ctx.organization.id);
  if (!survey) notFound();

  const headerList = headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const link = `${origin}/s/${survey.code}`;
  const qrDataUrl = await QRCode.toDataURL(link, { margin: 1, width: 320, color: { dark: "#12151e", light: "#ffffff" } });
  const embedCode = `<iframe src="${link}" width="100%" height="720" style="border:0;border-radius:12px;" title="SurvPay survey"></iframe>`;

  return (
    <div>
      <PageHeader title={dict.distribution.title} subtitle={dict.distribution.subtitle} />
      <SurveySubnav surveyId={survey.id} active="distribution" />
      <div className="mt-5">
        <DistributionClient link={link} qrDataUrl={qrDataUrl} embedCode={embedCode} responsesSoFar={survey._count.responses} />
      </div>
    </div>
  );
}
