import { cn } from "@/lib/utils";

// Real brand assets, extracted from the official logo file (public/brand/) —
// see public/brand/logo-icon.svg (mark only, 80:96) and logo-full.svg
// (mark + "Survpay" wordmark, 428:96). Both render on a light background;
// there's no dark-background usage of <Logo> in the app today.
const ICON_ASPECT = 80 / 96;
const FULL_ASPECT = 428 / 96;

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

export function Logo({ className, size = 26 }: { className?: string; wordmarkClassName?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset, not a Next/Image-optimizable content image
    <img
      src="/brand/logo-full.svg"
      alt="Survpay"
      width={Math.round(size * FULL_ASPECT)}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}
