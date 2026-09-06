"use client";
import type { BreathPattern } from "@/lib/breath/patterns";

export function PatternToggle({ pattern, onToggle }: { pattern: BreathPattern; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pattern.key === "four78"}
      className="tap rounded-pill bg-surface/70 px-4 py-2 text-sm font-semibold text-fg"
    >
      {pattern.label} · tap to switch
    </button>
  );
}
