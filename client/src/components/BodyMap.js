"use client";
import { REGIONS } from "../lib/painData";

export default function BodyMap({ view, selected, onToggle }) {
  return (
    <svg viewBox="0 0 200 395" className="w-full max-w-xs mx-auto" role="group"
      aria-label={`Body map, ${view} view. Select the areas that hurt.`}>
      {REGIONS.map((r) => {
        const key = view === "back" ? `${r.id}-back` : r.id;
        const label = view === "back" && r.backLabel ? r.backLabel : r.label;
        const on = selected.includes(key);
        const common = {
          role: "button", tabIndex: 0, "aria-label": label, "aria-pressed": on,
          onClick: () => onToggle(key, label),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(key, label); }
          },
          fill: on ? "#dc2626" : "#e5e7eb",
          stroke: on ? "#7f1d1d" : "#6b7280",
          strokeWidth: 1.5,
          style: { cursor: "pointer" },
        };
        return r.shape === "ellipse" ? (
          <ellipse key={key} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} {...common}><title>{label}</title></ellipse>
        ) : (
          <rect key={key} x={r.x} y={r.y} width={r.w} height={r.h} rx="6" {...common}><title>{label}</title></rect>
        );
      })}
    </svg>
  );
}