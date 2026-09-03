import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { getResourcesContent } from "@/lib/content/resources";
import type { Locale } from "@/lib/i18n/config";
import { ArrowRightIcon } from "@/components/icons";

export default function ResourcesPage({ params }: { params: { locale: Locale } }) {
  const content = getResourcesContent(params.locale);

  return (
    <>
      <MarketingNav />
      <main>
        <section className="border-b border-ink-100 bg-brand-wash py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900">{content.heading}</h1>
            <p className="mt-4 text-lg text-ink-500">{content.subheading}</p>
          </div>
        </section>

        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.guides.map((g) => (
              <Link
                key={g.title}
                href={`/${params.locale}${g.href}`}
                className="group flex flex-col rounded-2xl border border-ink-200/70 bg-surface p-6 shadow-soft transition-shadow hover:shadow-card"
              >
                <span className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-content">{g.tag}</span>
                <h3 className="mt-4 text-base font-semibold text-ink-900">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{g.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-content">
                  {g.linkLabel}
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter locale={params.locale} />
    </>
  );
}
