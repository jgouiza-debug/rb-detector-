"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
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

export function TimelineView({ initial, today, priceLabel }: { initial: TimelineResult; today: string; priceLabel: string }) {
  const [data, setData] = useState(initial);
  const [q, setQ] = useState("");
  const [mood, setMood] = useState("");
  const [pending, setPending] = useState<string[]>(() => initial.days.filter((d) => d.status === "pending").map((d) => d.date));
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const timers = [3000, 8000, 15000].map((ms) => setTimeout(() => load(q, mood), ms));
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
  const full = data.days.filter((d) => d.date === today || labelFor(d.date, today) === "yesterday");
  const older = data.days.filter((d) => !full.includes(d));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-4">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl">your story</h1>
          <p className="text-sm text-fg-soft">the days you gave pip, kept.</p>
        </div>
        {isFree && <Pill dot="var(--amber-ink)" className="bg-pip-bubble text-amber-deep">last 7 days</Pill>}
      </header>

      <div className="mb-4">
        <WeekFlow dots={data.weekFlow} reflectionCount={data.weekFlow.filter((d) => d.mood).length} />
      </div>

      <label className="mb-4 flex items-center gap-2 min-h-12 rounded-pill bg-surface px-4 py-2">
        <Icon icon={Search} size={18} className="text-fg-soft" />
        <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="search your days…" aria-label="search memories" className="h-11 w-full bg-transparent text-base outline-none" />
      </label>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="filter by mood">
        {MOOD_FILTERS.map((f) => {
          const active = mood === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => onMood(f.key)}
              className={`tap inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-colors duration-150 ${active ? "bg-fg text-bg" : "bg-surface text-fg"}`}
            >
              {f.key ? <Icon icon={moodIcon[f.key as MoodTag]} size={15} /> : null}
              {f.label}
            </button>
          );
        })}
      </div>

      {data.days.length === 0 ? (
        <div className="rounded-card bg-surface p-8 text-center">
          <p className="font-reading text-lg text-fg">your first keepsake arrives tonight.</p>
          <p className="mt-1 text-sm text-fg-soft">keep talking to pip — i&apos;ll gather your day for you.</p>
          <form action="/api/synthesize" method="post" onSubmit={(e) => { e.preventDefault(); fetch("/api/synthesize", { method: "POST" }).then(() => load(q, mood)); }}>
            <Button className="mt-4" type="submit">wrap up my day</Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {full.length > 0 && (
            <div className="flex flex-col gap-4">
              {full.map((d) => (
                <MemoryCard key={d.date} day={d} label={labelFor(d.date, today) || d.date} />
              ))}
            </div>
          )}
          {older.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="px-2 text-xs font-bold uppercase tracking-wide text-fg-soft">earlier</h2>
              {older.map((d) => (
                <CompactCard key={d.date} day={d} />
              ))}
            </section>
          )}
          {isFree && <PaywallCard lockedCount={data.lockedCount} priceLabel={priceLabel} />}
        </div>
      )}
    </main>
  );
}
