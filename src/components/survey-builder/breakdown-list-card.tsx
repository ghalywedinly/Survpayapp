"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface BreakdownRow {
  key: string;
  count: number;
  pct: number;
}

export interface LabeledBreakdownRow extends BreakdownRow {
  /** Resolved on the server before this ever crosses into a Client Component — a
   * function prop (e.g. a `labelFor` callback) can't cross the server/client
   * boundary, so the caller resolves the display label up front instead. */
  label: string;
}

/** Small horizontal-bar "top list" — devices, sources, countries. */
export function BreakdownListCard({
  title,
  icon,
  rows,
  emptyLabel,
}: {
  title: string;
  icon?: ReactNode;
  rows: LabeledBreakdownRow[];
  emptyLabel: string;
}) {
  const { locale } = useI18n();
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title={emptyLabel} className="py-6" />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-700">{r.label}</span>
                  <span className="shrink-0 font-medium text-ink-900">
                    {formatNumber(r.count, locale)} <span className="text-ink-400">· {r.pct}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
