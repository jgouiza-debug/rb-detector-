"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { PipMascot } from "@/components/pip/PipMascot";
import { moodIcon } from "@/lib/theme/moodIcons";
import { moodTokens, type MoodTag } from "@/lib/theme/tokens";
import { formatLongDate } from "@/lib/time/local";

const key = (date: string) => `pip-revealed:${date}`;

/** Has today's keepsake already been revealed on this device? */
export function alreadyRevealed(date: string): boolean {
  try {
    return !!localStorage.getItem(key(date));
  } catch {
    // Private mode / blocked storage: treat as revealed so the overlay never
    // traps someone who can't dismiss-and-remember it.
    return true;
  }
}

/**
 * The daily keepsake, handed over once. When today's memory is opened for the
 * first time it arrives as a full-screen moment — Pip, the day, a single "keep
 * it" — instead of appearing as the top card in a scroll. Marked seen in
 * localStorage so it is a reveal, not a thing that re-happens every visit. It is
 * per-device on purpose: a new device replaying one day's gift is harmless, and
 * that costs no schema, no migration.
 */
export function KeepsakeReveal({
  date,
  title,
  reflection,
  mood,
  moodLabel,
  onKeep,
}: {
  date: string;
  title: string;
  reflection: string;
  mood: MoodTag;
  moodLabel: string;
  onKeep: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const m = moodTokens[mood];

  useEffect(() => {
    // Esc keeps it from being a trap for keyboard users.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") keep();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function keep() {
    try {
      localStorage.setItem(key(date), "1");
    } catch {
      /* storage blocked — the reveal simply won't be remembered */
    }
    setLeaving(true);
    // Let the fade play, then hand back to the normal detail.
    window.setTimeout(onKeep, 260);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="today's keepsake"
      className={`pt-safe pb-safe fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center transition-opacity duration-200 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <PipMascot expression="happy" size={96} />
      <p className="text-xs font-semibold text-fg-soft">your day, kept</p>
      <div className="animate-keepsake-in w-full max-w-md">
        {moodLabel && (
          <Pill style={{ background: m.bg, color: m.fg }} className="mb-4">
            <Icon icon={moodIcon[mood]} size={13} /> {moodLabel.toLowerCase()}
          </Pill>
        )}
        <h1 className="font-reading text-3xl leading-tight">
          {title || formatLongDate(date, { year: true })}
        </h1>
        {title && (
          <p className="mt-2 text-sm text-fg-soft">
            {formatLongDate(date, { year: true })}
          </p>
        )}
        <p className="font-reading mt-4 text-lg leading-relaxed">
          {reflection}
        </p>
      </div>
      <Button onClick={keep} className="mt-2">
        keep it
      </Button>
    </div>
  );
}
