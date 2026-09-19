import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserAndOrg } from "@/lib/auth/session";
import { buildReportPdf } from "@/lib/services/report-export";
import { isLocale } from "@/lib/i18n/config";

// The Arabic report launches headless Chromium (puppeteer-core), which
// needs the Node.js runtime — the Edge runtime can't spawn a browser.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx?.organization) return new NextResponse("Unauthorized", { status: 401 });

  const survey = await db.survey.findFirst({ where: { id: params.id, organizationId: ctx.organization.id } });
  if (!survey) return new NextResponse("Not found", { status: 404 });

  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";

  const bytes = await buildReportPdf(params.id, locale);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="survpay-report-${survey.code}-${locale}.pdf"`,
    },
  });
}
