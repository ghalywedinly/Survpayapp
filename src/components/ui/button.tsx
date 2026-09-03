import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-ink-200 disabled:text-ink-400",
  // Fixed near-black (not the reactive ink-900 token) — a solid dark pill
  // that reads correctly as a secondary action in both light and dark mode,
  // rather than inverting to near-white and losing its "solid button" look.
  secondary:
    "bg-[#12151e] text-white shadow-soft hover:bg-[#242a38] focus-visible:outline-[#12151e] disabled:bg-ink-200 disabled:text-ink-400",
  outline:
    "border border-ink-200 bg-surface text-ink-800 hover:bg-ink-50 focus-visible:outline-ink-400 disabled:text-ink-300",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900 disabled:text-ink-300",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-ink-200",
  success: "bg-mint-500 text-white hover:bg-mint-600 focus-visible:outline-mint-500 disabled:bg-ink-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export function buttonClasses(opts?: { variant?: Variant; size?: Size; className?: string }) {
  const variant = opts?.variant ?? "primary";
  const size = opts?.size ?? "md";
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    opts?.className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
