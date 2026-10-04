import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { lookupCouponForWallet } from "@/lib/services/wallet/lookup";
import { buildGoogleWalletSaveUrl, isGoogleWalletConfigured } from "@/lib/services/wallet/google-wallet";
import { isLocale, defaultLocale } from "@/lib/i18n/config";

export async function GET(req: NextRequest) {
  const limit = checkRateLimit(`wallet-google:${getClientIp()}`, 20, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  if (!isGoogleWalletConfigured()) {
    return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 501 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "MISSING_CODE" }, { status: 400 });

  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const data = await lookupCouponForWallet(code, locale);
  if (!data) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const url = buildGoogleWalletSaveUrl(data);
  return NextResponse.redirect(url);
}
