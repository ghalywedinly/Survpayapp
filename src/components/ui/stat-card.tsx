import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaTone = "success",
  deltaLabel,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "danger";
  deltaLabel?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-content">
            {icon}
          </div>
        )}
        <p className="text-sm text-ink-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{value}</p>
      {delta && (
        <p className={cn("mt-1.5 text-xs font-medium", deltaTone === "success" ? "text-mint-content" : "text-danger-content")}>
          <span className="inline-flex items-center gap-1">
            {deltaTone === "success" ? "↑" : "↓"} {delta}
          </span>{" "}
          <span className="font-normal text-ink-400">{deltaLabel}</span>
        </p>
      )}
    </Card>
  );
}
