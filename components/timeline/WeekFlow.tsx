import { Icon } from "@/components/ui/Icon";
import { moodTokens } from "@/lib/theme/tokens";
import { moodIcon } from "@/lib/theme/moodIcons";
import type { WeekFlowDot } from "@/lib/timeline/query";

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeekFlow({ dots, reflectionCount }: { dots: WeekFlowDot[]; reflectionCount: number }) {
  return (
    <section className="px-2" aria-label="this week's flow">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-fg">this week&apos;s flow</span>
        <span className="text-fg-soft">{reflectionCount} reflections</span>
      </div>
      <ol className="flex items-center justify-between">
        {dots.map((d) => {
          const t = d.mood ? moodTokens[d.mood] : null;
          const day = Number(d.date.slice(-2));
          return (
            <li key={d.date} className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-fg-soft">{LABELS[d.dow]}</span>
              <span
                role="img"
                aria-label={d.mood ? `${d.date}: ${t?.label}` : `${d.date}: no entry`}
                className="grid size-8 place-items-center rounded-full text-xs"
                style={{ background: t ? t.bg : "var(--line-c)", color: t ? t.fg : "var(--fg-soft)" }}
              >
                {d.mood ? <Icon icon={moodIcon[d.mood]} size={15} /> : null}
              </span>
              <span className="text-xs text-fg-soft">{day}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
