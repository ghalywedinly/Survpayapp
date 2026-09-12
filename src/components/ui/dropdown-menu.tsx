"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DropdownContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={ref}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactElement }) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  });
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuContent must be used within DropdownMenu");
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        "absolute z-40 mt-1.5 min-w-[180px] rounded-xl border border-ink-200 bg-surface p-1.5 shadow-pop animate-fade-in",
        align === "end" ? "end-0" : "start-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        ctx?.setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm text-ink-700 transition-colors hover:bg-ink-50",
        destructive && "text-danger-content hover:bg-danger-tint",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLinkItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  return (
    <Link
      href={href}
      onClick={() => ctx?.setOpen(false)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm text-ink-700 transition-colors hover:bg-ink-50",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-ink-100" />;
}
