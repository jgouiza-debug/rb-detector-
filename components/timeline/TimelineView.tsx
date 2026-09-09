"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { type MoodTag } from "@/lib/theme/tokens";
import { moodIcon } from "@/lib/theme/moodIcons";
import type { TimelineResult } from "@/lib/timeline/query";
import { WeekFlow } from "./WeekFlow";
import { MemoryCard } from "./MemoryCard";
import { CompactCard } from "./CompactCard";
import { PaywallCard } from "./PaywallCard";

const MOOD_FILTERS: { key: string; label: string }[] = [
  { key: "", label: "all days" },
  { key: "growing", label: "growing" },
  { key: "bright", label: "bright" },
  { key: "calm", label: "calm" },
  { key: "tender", label: "tender" },
  { key: "heavy", label: "heavy" },
];

function labelFor(date: string, today: string): string {
  if (date === today) return "today's keepsake";
  const y = new Date(`${today}T00:00:00Z`);
  y.setUTCDate(y.getUTCDate() - 1);
  if (date === y.toISOString().slice(0, 10)) return "yesterday";
  return "";
}

export function TimelineView({
  initial,
  today,
  priceLabel,
}: {
  initial: TimelineResult;
  today: string;
  priceLabel: string;
}) {
  const [data, setData] = useState(initial);
  const [q, setQ] = useState("");
  const [mood, setMood] = useState("");
  const [pending, setPending] = useState<string[]>(() =>
    initial.days.filter((d) => d.status === "pending").map((d) => d.date),
  );
  const [finding, setFinding] = useState(false);
  const [edges, setEdges] = useState("at-start");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  /** Fade only the edge the row can still scroll toward, so a half chip reads as "more". */
  function onFilterScroll() {
    const el = filterRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 1;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setEdges(`${atStart ? "at-start " : ""}${atEnd ? "at-end" : ""}`.trim());
  }

  const load = useCallback(async (query: string, moodKey: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (moodKey) params.set("mood", moodKey);
    const res = await fetch(`/api/timeline?${params.toString()}`);
    if (!res.ok) return;
    const json = (await res.json()) as TimelineResult & { pending: string[] };
    setData(json);
    setPending(json.pending ?? []);
  }, []);

  // Poll while any day is pending synthesis.
  useEffect(() => {
    if (pending.length === 0) return;
    const timers = [3000, 8000, 15000].map((ms) =>
      setTimeout(() => load(q, mood), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [pending, q, mood, load]);

  function onSearch(v: string) {
    setQ(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(v, mood), 300);
  }
  function onMood(key: string) {
    setMood(key);
    load(q, key);
  }

  const isFree = data.plan === "free";
  const full = data.days.filter(
    (d) => d.date === today || labelFor(d.date, today) === "yesterday",
  );
  const older = data.days.filter((d) => !full.includes(d));

  const reflectionCount = data.weekFlow.filter((d) => d.mood).length;

  return (
    <main id="main" className="pb-chrome mx-auto w-full max-w-2xl px-4 pt-4">
      {/* One status line, one affordance. Finding is a thing you ask for, not a
          toolbar you scroll past on the way to your own memories. */}
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">your story</h1>
          <p className="text-sm text-fg-soft">
            {reflectionCount} reflection{reflectionCount === 1 ? "" : "s"} kept
            {isFree ? " · last 7 days" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFinding((v) => !v)}
          aria-expanded={finding}
          aria-label={finding ? "close search" : "find a day"}
          className={`tap flex items-center justify-center rounded-pill transition-colors duration-150 ${finding ? "bg-fg text-bg active:brightness-110" : "text-fg-soft hover:bg-surface active:bg-line/40"}`}
        >
          <Icon icon={finding ? X : Search} size={20} />
        </button>
      </header>

      <div className="mb-4">
        <WeekFlow dots={data.weekFlow} reflectionCount={reflectionCount} />
      </div>

      {finding && (
        <div className="animate-fade-up mb-4 flex flex-col gap-2">
          <label className="flex min-h-12 items-center gap-2 rounded-pill bg-surface px-4 py-2">
            <Icon icon={Search} size={18} className="text-fg-soft" />
            <input
              autoFocus
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="search your days…"
              aria-label="search memories"
              className="h-11 w-full bg-transparent text-base outline-none"
            />
          </label>
          <div
            ref={filterRef}
            onScroll={onFilterScroll}
            className={`scroll-fade-x flex gap-2 overflow-x-auto pb-1 ${edges}`}
            role="radiogroup"
            aria-label="filter by mood"
          >
            {MOOD_FILTERS.map((f) => {
              const active = mood === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onMood(f.key)}
                  className={`tap inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-colors duration-150 ${active ? "bg-fg text-bg active:brightness-110" : "bg-surface text-fg active:bg-line/40"}`}
                >
                  {f.key ? (
                    <Icon icon={moodIcon[f.key as MoodTag]} size={15} />
                  ) : null}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {data.days.length === 0 ? (
        <div className="rounded-card bg-surface p-8 text-center">
          <p className="font-reading text-lg text-fg">
            your first keepsake arrives tonight.
          </p>
          <p className="mt-1 text-sm text-fg-soft">
            keep talking to pip — i&apos;ll gather your day for you.
          </p>
          <form
            action="/api/synthesize"
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              fetch("/api/synthesize", { method: "POST" }).then(() =>
                load(q, mood),
              );
            }}
          >
            <Button className="mt-4" type="submit">
              wrap up my day
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {full.length > 0 && (
            <div className="flex flex-col gap-4">
              {full.map((d, i) => (
                <MemoryCard
                  key={d.date}
                  day={d}
                  label={labelFor(d.date, today) || d.date}
                  fresh={i === 0 && d.date === today}
                />
              ))}
            </div>
          )}
          {older.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="px-2 text-xs font-semibold tracking-wide text-fg-soft">
                earlier
              </h2>
              {older.map((d) => (
                <CompactCard key={d.date} day={d} />
              ))}
            </section>
          )}
          {isFree && (
            <PaywallCard
              lockedCount={data.lockedCount}
              priceLabel={priceLabel}
            />
          )}
        </div>
      )}
    </main>
  );
}
