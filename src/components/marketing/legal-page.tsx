import type { LegalDoc } from "@/lib/content/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">{doc.title}</h1>
      <p className="mt-2 text-sm text-ink-400">{doc.updated}</p>
      <p className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50 p-4 text-sm leading-relaxed text-ink-600">
        {doc.intro}
      </p>
      <div className="mt-10 space-y-8">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-base font-semibold text-ink-900">{s.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
