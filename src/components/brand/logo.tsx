import { cn } from "@/lib/utils";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="survpayGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="45%" stopColor="#A21CAF" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <path
        d="M30 6H20a7 7 0 0 0 0 14h0a7 7 0 0 1 0 14H10"
        stroke="url(#survpayGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, wordmarkClassName, size = 26 }: { className?: string; wordmarkClassName?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className={cn("text-[1.05rem] font-semibold tracking-tight text-ink-900", wordmarkClassName)}>SurvPay</span>
    </span>
  );
}
