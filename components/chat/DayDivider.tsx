import { formatShortDate } from "@/lib/time/local";

export function DayDivider({ date }: { date: string }) {
  return (
    <div id={`day-${date}`} className="my-4 flex items-center gap-4 px-2 text-xs font-semibold text-fg-soft">
      <span className="h-px flex-1 bg-line" />
      {formatShortDate(date)}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
