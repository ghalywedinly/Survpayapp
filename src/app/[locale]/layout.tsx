import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, localeMeta, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "SurvPay — Create surveys. Reward responses. Get insights.",
  description:
    "SurvPay is the bilingual survey and respondent-rewards platform for researchers, universities and product teams across Saudi Arabia and the GCC.",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
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
