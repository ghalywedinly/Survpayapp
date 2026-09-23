import { cn } from "@/lib/utils";

// Decorative, non-photographic brand texture: three softly blurred color
// fields in the three accent hues (brand/mint/amber), used behind sections
// that have no photography. Purely visual — aria-hidden, no layout impact.
const VARIANTS = {
  "bottom-start": "bottom-[-4rem] start-[-3rem]",
  "bottom-end": "bottom-[-4rem] end-[-3rem]",
  center: "top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
} as const;

export function BrandGradientBlobs({
  variant = "bottom-start",
  className,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  // No z-index here, deliberately: this component must be the first child
  // of a `position: relative` section, so plain DOM order (painted first,
  // then the foreground content on top) puts it behind. A negative
  // z-index would instead escape to the nearest ancestor that actually
  // establishes a stacking context — which these sections don't — landing
  // it behind that ancestor's other in-flow children (i.e. behind the
  // section's own opaque background) instead of behind just this section's
  // foreground content.
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute h-[26rem] w-[26rem]", VARIANTS[variant], className)}
    >
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.2] blur-3xl" />
      <div className="absolute left-[62%] top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint-500/[0.18] blur-3xl" />
      <div className="absolute left-[40%] top-[64%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.16] blur-3xl" />
    </div>
  );
}
