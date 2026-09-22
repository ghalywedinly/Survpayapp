import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { lookupCouponForWallet } from "@/lib/services/wallet/lookup";
import { buildApplePass, isAppleWalletConfigured } from "@/lib/services/wallet/apple-pass";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export async function GET(req: NextRequest) {
  const limit = checkRateLimit(`wallet-apple:${getClientIp()}`, 20, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  if (!isAppleWalletConfigured()) {
    return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 501 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "MISSING_CODE" }, { status: 400 });

  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const data = await lookupCouponForWallet(code, locale);
  if (!data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const pkpass = await buildApplePass(data);
  return new NextResponse(pkpass, {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${data.code}.pkpass"`,
    },
  });
}
