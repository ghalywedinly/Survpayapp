import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserAndOrg } from "@/lib/auth/session";
import { buildReportExcel } from "@/lib/services/report-export";
import { isLocale } from "@/lib/i18n/config";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx?.organization) return new NextResponse("Unauthorized", { status: 401 });

  const survey = await db.survey.findFirst({ where: { id: params.id, organizationId: ctx.organization.id } });
  if (!survey) return new NextResponse("Not found", { status: 404 });

  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : "en";

  const buffer = await buildReportExcel(params.id, locale);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="survpay-report-${survey.code}-${locale}.xlsx"`,
    },
  });
}
