import type { BreathState } from "@/lib/breath/engine";

/** Progress ring. Track and progress differ in stroke width AND colour, and the
 * session progress is shown by arc length — never colour alone. */
export function BreathRing({ state, size = 220 }: { state: BreathState; size?: number }) {
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - state.sessionProgress);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--honey)" strokeOpacity="0.35" strokeWidth={2} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--amber-ink)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
