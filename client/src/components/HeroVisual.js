"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

/**
 * Original hero artwork: a spine that starts out of line and settles
 * into a natural, aligned curve, with a motion arc drawn beside it.
 * It stands for recovery and movement without any stock photography.
 *
 * Positions are computed (and rounded) at module load so the server and
 * browser render identical markup.
 */

const COUNT = 13;
const TOP = 96;
const STEP = 38;

// Where each vertebra starts before it settles (px / degrees).
const OFFSET_X = [-64, 52, -40, 70, -58, 38, -72, 60, -44, 66, -52, 42, -60];
const OFFSET_R = [-22, 18, -14, 24, -20, 12, -26, 20, -12, 22, -18, 10, -24];

function curveX(t) {
  return 262 + 30 * Math.sin(t * Math.PI * 1.8 - 0.35);
}

function mixColor(t) {
  // pale mint -> brand secondary
  const a = [232, 244, 242];
  const b = [47, 184, 167];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t * 0.85));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const vertebrae = Array.from({ length: COUNT }, (_, i) => {
  const t = i / (COUNT - 1);
  const x = curveX(t);
  const y = TOP + i * STEP;
  const dx = curveX(Math.min(1, t + 0.01)) - curveX(Math.max(0, t - 0.01));
  const dy = (STEP * (COUNT - 1)) * 0.02;
  const angle = -(Math.atan2(dx, dy) * 180) / Math.PI;
  const width = 54 + 52 * t;

  return {
    id: i,
    x: x.toFixed(1),
    y: y.toFixed(1),
    angle: angle.toFixed(1),
    width: width.toFixed(1),
    fill: mixColor(t),
  };
});

export default function HeroVisual() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const mm = gsap.matchMedia(svg);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const arc = svg.querySelector("[data-arc]");
      const dot = svg.querySelector("[data-dot]");
      const length = arc.getTotalLength();

      gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(dot, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ delay: 0.9 });

      // 1. vertebrae start out of line, then settle top to bottom
      tl.from(
        "[data-vert]",
        {
          x: (i) => OFFSET_X[i],
          rotation: (i) => OFFSET_R[i],
          duration: 1.5,
          ease: "power4.out",
          stagger: 0.07,
        },
        0
      )
        // 2. the movement arc draws in
        .to(
          arc,
          { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
          0.7
        )
        .to(dot, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 2.1);
    });

    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className="nm-spine"
      viewBox="0 0 520 640"
      role="img"
      aria-label="Illustration of a spine settling into a natural, aligned curve"
    >
      {/* soft light behind the spine */}
      <circle cx="262" cy="330" r="190" fill="#16848e" opacity="0.28" />
      <circle cx="262" cy="330" r="128" fill="#16848e" opacity="0.22" />

      {/* movement arc */}
      <path
        data-arc
        d="M 70 590 C 90 400, 130 240, 290 130 C 335 100, 385 112, 396 172"
        fill="none"
        stroke="#8de0d2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle data-dot cx="396" cy="172" r="9" fill="#8de0d2" />

      {/* vertebrae: outer group = final position, inner group = animated */}
      {vertebrae.map((v) => (
        <g key={v.id} transform={`translate(${v.x} ${v.y}) rotate(${v.angle})`}>
          <g data-vert>
            <rect
              x={-v.width / 2}
              y="-13"
              width={v.width}
              height="26"
              rx="11"
              fill={v.fill}
            />
            <rect
              x={-v.width / 2 + 8}
              y="-4"
              width={v.width - 16}
              height="8"
              rx="4"
              fill="#0a2350"
              opacity="0.12"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}