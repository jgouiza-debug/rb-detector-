import type { ReactNode } from "react";

/**
 * Onboarding step frame. When `step`/`total` are given it draws an endowed
 * progress bar (Goal-Gradient / Nunes-Drèze): the welcome screen counts as
 * already done, so the first real step lands past zero and the bar reaches full
 * on the final decision — momentum toward the reward instead of a cold start.
 */
export function StepShell({
  children,
  footer,
  step,
  total,
}: {
  children: ReactNode;
  footer?: ReactNode;
  step?: number;
  total?: number;
}) {
  const showProgress =
    typeof step === "number" && typeof total === "number" && total > 0;
  const pct = showProgress ? Math.round(((step + 1) / (total + 1)) * 100) : 0;

  return (
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8"
    >
      {showProgress && (
        <div
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuetext={`step ${step} of ${total}`}
          aria-label="onboarding progress"
          className="mb-8 h-1 w-full overflow-hidden rounded-pill bg-line/60"
        >
          <div
            className="h-full rounded-pill bg-cta transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {/* The question centres in whatever room is left, so the breathing space
          reads as calm rather than as a hole at one end. The action anchors to the
          bottom instead of riding the content's height: centring the pair together
          swung the button's centre 68px across the five steps, which is the hand
          re-learning where to reach on every screen of a 60-second flow. */}
      <div className="flex flex-1 flex-col justify-center gap-6 pb-10">
        {children}
      </div>
      {footer && <div className="flex flex-col gap-4">{footer}</div>}
    </main>
  );
}
