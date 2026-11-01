"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

/**
 * Wraps the homepage hero and runs ONE orchestrated entrance:
 *   headline lines rise out of a mask -> supporting text fades in
 *   -> the spine panel wipes open -> (HeroVisual then realigns the spine).
 * Also adds a gentle parallax on desktop.
 *
 * Mark elements inside with:
 *   data-line      headline lines (each inside an overflow:hidden .nm-line)
 *   data-fade      supporting text, buttons, contact row
 *   data-panel     the spine panel
 *   data-parallax  the visual column that drifts slightly on scroll
 */
export default function HeroStage({ children, className = "" }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.1)
        .from(
          "[data-fade]",
          { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.09 },
          0.55
        )
        .from(
          "[data-panel]",
          { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" },
          0.2
        );
    });

    mm.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.to("[data-parallax]", {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className={className}>
      {children}
    </section>
  );
}