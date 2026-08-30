"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; tone?: "default" | "success" | "error" };
type ToastContextValue = { push: (t: Omit<Toast, "id">) => void };

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:end-4 sm:inset-x-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-xl border bg-white p-3.5 shadow-pop animate-slide-up",
              t.tone === "success" && "border-mint-200",
              t.tone === "error" && "border-red-200",
              (!t.tone || t.tone === "default") && "border-ink-200"
            )}
          >
            <p className="text-sm font-semibold text-ink-900">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-ink-500">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
