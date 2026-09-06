import type { PipExpression } from "./expressions";
import { cn } from "@/lib/util/cn";

/**
 * Pip: a small round warm-yellow companion with a sprout on top. Expressions live
 * in the eyes and body only (no talking mouth). Idle: breathe + blink, which the
 * reduced-motion media query (and `reduceMotion`) turn off.
 */
export function PipMascot({
  expression = "listening",
  size = 96,
  reduceMotion = false,
  idle = true,
  className,
  title,
}: {
  expression?: PipExpression;
  size?: number;
  reduceMotion?: boolean;
  idle?: boolean;
  className?: string;
  title?: string;
}) {
  const id = `pip-${expression}`;
  const tilt = expression === "listening" ? -4 : expression === "thinking" ? 3 : 0;
  const bob = expression === "happy" ? -2 : 0;
  const animate = idle && !reduceMotion;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? `pip, ${expression}`}
      className={cn("shrink-0 select-none", className)}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFE8A0" />
          <stop offset="60%" stopColor="#FFDE7A" />
          <stop offset="100%" stopColor="#F5B841" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFDE7A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFDE7A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="64" r="58" fill={`url(#${id}-glow)`} className={cn(animate && expression === "cozy" && "animate-glow")} />
      <g style={{ transformOrigin: "60px 70px" }} className={cn(animate && "animate-pip-breathe")}>
        <g transform={`rotate(${tilt} 60 70) translate(0 ${bob})`}>
          {/* sprout */}
          <path d="M60 30 C60 22 58 16 54 12" stroke="#4F6B47" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 12 C48 10 44 13 44 18 C49 19 53 17 54 12 Z" fill="#A9C6A1" />
          <path d="M58 18 C63 14 68 15 69 20 C65 22 60 21 58 18 Z" fill="#A9C6A1" />
          {/* body */}
          <ellipse cx="60" cy="70" rx="40" ry="38" fill={`url(#${id}-body)`} />
          {/* cheeks */}
          <ellipse cx="36" cy="80" rx="7" ry="4.5" fill="#F3B7A6" opacity="0.75" />
          <ellipse cx="84" cy="80" rx="7" ry="4.5" fill="#F3B7A6" opacity="0.75" />
          {/* eyes */}
          <Eyes expression={expression} animate={animate} />
          {/* thinking dots */}
          {expression === "thinking" && (
            <g fill="#2B2620" opacity="0.7">
              <circle cx="96" cy="40" r="2.2" />
              <circle cx="103" cy="33" r="3" />
              <circle cx="111" cy="24" r="3.8" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}

function Eyes({ expression, animate }: { expression: PipExpression; animate: boolean }) {
  const ink = "#2B2620";
  const blink = cn(animate && expression !== "cozy" && "animate-pip-blink");
  const style = { transformOrigin: "60px 68px" } as const;
  switch (expression) {
    case "happy":
      return (
        <g stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" style={style} className={blink}>
          <path d="M40 70 q7 -9 14 0" />
          <path d="M66 70 q7 -9 14 0" />
        </g>
      );
    case "cozy":
      return (
        <g stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M40 68 q7 6 14 0" />
          <path d="M66 68 q7 6 14 0" />
        </g>
      );
    case "concern":
      return (
        <g style={style} className={blink}>
          <ellipse cx="47" cy="69" rx="5.5" ry="6.5" fill={ink} />
          <ellipse cx="73" cy="69" rx="5.5" ry="6.5" fill={ink} />
          <circle cx="49" cy="66.5" r="1.8" fill="#FFF9ED" />
          <circle cx="75" cy="66.5" r="1.8" fill="#FFF9ED" />
          <path d="M39 58 q8 -3 15 1" stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M81 58 q-8 -3 -15 1" stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      );
    case "thinking":
      return (
        <g style={style} className={blink}>
          <ellipse cx="47" cy="66" rx="5.5" ry="6.5" fill={ink} />
          <ellipse cx="73" cy="66" rx="5.5" ry="6.5" fill={ink} />
          <circle cx="49.5" cy="62.5" r="1.9" fill="#FFF9ED" />
          <circle cx="75.5" cy="62.5" r="1.9" fill="#FFF9ED" />
        </g>
      );
    default:
      return (
        <g style={style} className={blink}>
          <ellipse cx="47" cy="68" rx="5.5" ry="7" fill={ink} />
          <ellipse cx="73" cy="68" rx="5.5" ry="7" fill={ink} />
          <circle cx="49" cy="65" r="2" fill="#FFF9ED" />
          <circle cx="75" cy="65" r="2" fill="#FFF9ED" />
        </g>
      );
  }
}
