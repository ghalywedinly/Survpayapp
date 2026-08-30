import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/lib/services/response-service";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.answers) || typeof b.startedAt !== "number" || typeof b.respondentHash !== "string") {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  try {
    const result = await ResponseService.submit(params.code, {
      answers: b.answers as { questionId: string; value: unknown }[],
      startedAt: b.startedAt,
      respondentHash: b.respondentHash,
      respondentEmail: typeof b.respondentEmail === "string" ? b.respondentEmail : undefined,
      device: typeof b.device === "string" ? b.device : undefined,
      country: typeof b.country === "string" ? b.country : undefined,
      source: typeof b.source === "string" ? b.source : undefined,
      futureConsent: typeof b.futureConsent === "boolean" ? b.futureConsent : undefined,
    });

    return NextResponse.json({
      ok: true,
      responseId: result.response.id,
      reward: result.rewardResult
        ? {
            issued: result.rewardResult.issued,
            status: "status" in result.rewardResult ? result.rewardResult.status : undefined,
            redemptionNote: "redemptionNote" in result.rewardResult ? result.rewardResult.redemptionNote : undefined,
            rewardType: "rewardType" in result.rewardResult ? result.rewardResult.rewardType : undefined,
            amount: "amount" in result.rewardResult ? result.rewardResult.amount : undefined,
            currency: "currency" in result.rewardResult ? result.rewardResult.currency : undefined,
          }
        : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
