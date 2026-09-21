import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { moodTokens } from "@/lib/theme/tokens";
import { moodIcon } from "@/lib/theme/moodIcons";
import type { WeekFlowDot } from "@/lib/timeline/query";

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * The week as colour, not a chart. Its count lives in the page header, so the
 * strip itself is just seven dots. A complete week earns one quiet line — the
 * only milestone in the product, and it never appears for an incomplete week.
 */
export function WeekFlow({ dots, reflectionCount }: { dots: WeekFlowDot[]; reflectionCount: number }) {
  const fullWeek = dots.length > 0 && reflectionCount >= dots.length;
  return (
    <section className="px-2" aria-label="this week's flow">
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
                className="grid size-8 place-items-center rounded-pill text-xs"
                style={{ background: t ? t.bg : "var(--line-c)", color: t ? t.fg : "var(--fg-soft)" }}
              >
                {d.mood ? <Icon icon={moodIcon[d.mood]} size={15} /> : null}
              </span>
              <span className="text-xs text-fg-soft">{day}</span>
            </li>
          );
        })}
      </ol>
      {fullWeek && (
        <p className="animate-fade-up mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-fg">
          <PipAvatar size={20} expression="happy" /> a whole week, kept.
        </p>
      )}
    </section>
  );
}
