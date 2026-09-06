import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { moodTokens } from "@/lib/theme/tokens";
import { formatShortDate } from "@/lib/time/local";
import type { TimelineDay } from "@/lib/timeline/query";

export function CompactCard({ day }: { day: TimelineDay }) {
  const mood = moodTokens[day.mood];
  return (
    <Link href={`/memory/${day.date}`} className="block rounded-card bg-surface p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-fg-soft">{formatShortDate(day.date)}</span>
        <Pill style={{ background: mood.bg, color: mood.fg }}>{mood.label}</Pill>
      </div>
      <h3 className="font-reading text-lg text-fg">{day.title || formatShortDate(day.date)}</h3>
      <p className="font-reading mt-1 line-clamp-2 text-[15px] text-fg-soft">{day.reflection}</p>
    </Link>
  );
}
