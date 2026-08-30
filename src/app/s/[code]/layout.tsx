import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { localeMeta, localeCookieName, isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import "../../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

async function resolveLocale(code: string): Promise<Locale> {
  const survey = await db.survey.findUnique({ where: { code }, include: { settings: true } });
  if (survey?.settings?.language === "ar") return "ar";
  if (survey?.settings?.language === "en") return "en";

  const cookieLocale = cookies().get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = headers().get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("ar")) return "ar";
  return defaultLocale;
}

export default async function PublicSurveyLayout({ children, params }: { children: React.ReactNode; params: { code: string } }) {
  const locale = await resolveLocale(params.code);
  const dict = getDictionary(locale);
  const dir = localeMeta[locale].dir;

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${arabic.variable}`}>
      <body className={dir === "rtl" ? "font-arabic" : "font-sans"}>
        <I18nProvider locale={locale} dict={dict}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
