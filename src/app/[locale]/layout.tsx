import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, localeMeta, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider, ThemeScript } from "@/lib/theme/provider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const arabic = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const title =
    locale === "ar" ? "Survpay | منصة آراء العملاء والاستبيانات للشركات" : "Survpay | Customer Feedback & Survey Platform";
  const description =
    locale === "ar"
      ? "يساعد Survpay الشركات السعودية — المطاعم والمقاهي والمتاجر والعيادات — على جمع آراء العملاء عبر الاستبيانات ورموز QR، وفهم عملائها، والتحسين."
      : "Survpay helps Saudi businesses — restaurants, cafés, retail and clinics — collect customer feedback through surveys and QR codes, understand their customers, and improve.";
  return {
    title,
    description,
    icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  };
}

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
    <html lang={locale} dir={dir} className={`${inter.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body className={dir === "rtl" ? "font-arabic" : "font-sans"}>
        <ThemeScript />
        <ThemeProvider>
          <I18nProvider locale={locale} dict={dict}>
            <ToastProvider>{children}</ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
