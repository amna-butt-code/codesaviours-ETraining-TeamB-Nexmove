"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

/**
 * Scroll-triggered entrance. Same props as before, so every page that
 * already uses <Reveal> upgrades automatically.
 *
 * variant="rise"  -> soft fade + short upward move (default)
 * variant="mask"  -> wipes in from the top, good for images and panels
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Nothing animates when the visitor prefers reduced motion.
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const trigger = {
        trigger: element,
        start: "top 88%",
        once: true,
      };

      if (variant === "mask") {
        gsap.from(element, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          delay: delay / 1000,
          ease: "power3.inOut",
          scrollTrigger: trigger,
        });
      } else {
        gsap.from(element, {
          autoAlpha: 0,
          y: 22,
          duration: 0.85,
          delay: delay / 1000,
          ease: "power3.out",
          scrollTrigger: trigger,
        });
      }
    });

    return () => mm.revert();
  }, [delay, variant]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}