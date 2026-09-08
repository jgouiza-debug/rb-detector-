import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { moodTokens } from "@/lib/theme/tokens";
import { moodIcon } from "@/lib/theme/moodIcons";
import { formatLongDate } from "@/lib/time/local";
import type { TimelineDay } from "@/lib/timeline/query";

export function MemoryCard({ day, label, fresh = false }: { day: TimelineDay; label: string; fresh?: boolean }) {
  const mood = moodTokens[day.mood];
  const pending = day.status === "pending";
  return (
    <article className={`overflow-hidden rounded-card bg-surface shadow-1 ${fresh ? "animate-keepsake-in" : "animate-fade-up"}`}>
      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-fg-soft">{label}</span>
          {!pending && (
            <Pill style={{ background: mood.bg, color: mood.fg }}>
              <Icon icon={moodIcon[day.mood]} size={13} /> {mood.label}
            </Pill>
          )}
        </div>
        {day.title ? (
          <>
            <h2 className="font-reading text-2xl leading-tight text-fg">{day.title}</h2>
            <p className="mt-1 text-sm text-fg-soft">{formatLongDate(day.date)}</p>
          </>
        ) : (
          <h2 className="font-reading text-2xl leading-tight text-fg">{formatLongDate(day.date)}</h2>
        )}
        {pending ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm italic text-fg-soft">pip is wrapping up {formatLongDate(day.date).split(",")[0].toLowerCase()}…</p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <p className="font-reading mt-4 text-lg leading-relaxed text-fg">{day.reflection}</p>
        )}
        {day.thumbs.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {day.thumbs.slice(0, 2).map((t) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={t.id} src={`/api/media/${t.id}?v=thumb`} alt={t.caption ?? "a photo from this day"} className={`h-32 w-full rounded-card object-cover ${day.thumbs.length === 1 ? "col-span-2" : ""}`} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line py-2 pl-6 pr-4">
        <span className="flex items-center gap-2 text-sm text-fg-soft">
          <PipAvatar size={20} /> {day.entryCount} moment{day.entryCount === 1 ? "" : "s"} kept
        </span>
        <Link href={`/memory/${day.date}`} className="tap inline-flex items-center gap-1 rounded-pill px-2 text-sm font-semibold text-fg transition-colors duration-150 hover:bg-surface-2 active:bg-line/40">
          open <Icon icon={ArrowRight} size={16} />
        </Link>
      </div>
    </article>
  );
}
