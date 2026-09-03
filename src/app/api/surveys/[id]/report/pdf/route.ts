import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserAndOrg } from "@/lib/auth/session";
import { buildReportPdf } from "@/lib/services/report-export";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx?.organization) return new NextResponse("Unauthorized", { status: 401 });

  const survey = await db.survey.findFirst({ where: { id: params.id, organizationId: ctx.organization.id } });
  if (!survey) return new NextResponse("Not found", { status: 404 });

  const bytes = await buildReportPdf(params.id);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="survpay-report-${survey.code}.pdf"`,
    },
  });
}
