import { cn } from "@/lib/utils";

// The icon mark is the official artwork (public/brand/logo-icon.svg,
// extracted from the provided logo file) — its colors are fixed, not
// theme-reactive, since it's a flat, deliberately colorful mark. The
// wordmark next to it is real text, not the baked-in text from the
// original logo file, specifically so it can use the reactive ink-900
// token and turn white in dark mode like the rest of the UI's text does.
const ICON_ASPECT = 80 / 96;

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset, not a Next/Image-optimizable content image
    <img
      src="/brand/logo-icon.svg"
      alt=""
      width={Math.round(size * ICON_ASPECT)}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

export function Logo({ className, wordmarkClassName, size = 26 }: { className?: string; wordmarkClassName?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className={cn("text-[1.15rem] font-semibold tracking-tight text-ink-900", wordmarkClassName)}>Survpay</span>
    </span>
  );
}
