"use client";

import { useEffect, useRef, useState } from "react";

// Fires once, the first time the element scrolls into the viewport — not on
// mount — so a gated reveal/count-up animation actually plays as the visitor
// scrolls to it instead of having already finished before they get there.
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
