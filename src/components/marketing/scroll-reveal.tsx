"use client";

import { useInView } from "@/lib/hooks/use-in-view";
import { cn } from "@/lib/utils";

// Self-contained scroll reveal — each instance owns its own observer, so a
// row of independent items (e.g. one per "how it works" step) animates in
// as the visitor scrolls to *that* item, rather than all firing together.
export function ScrollReveal({
  children,
  delay = 0,
  className,
  threshold = 0.25,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(threshold);
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
