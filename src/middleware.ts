import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales, localeCookieName } from "@/lib/i18n/config";

export const config = {
  matcher: ["/((?!_next|api|s/|favicon.ico|.*\\..*).*)"],
};

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = req.headers.get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("ar")) return "ar";

  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const pathnameHasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(localeCookieName, locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}
