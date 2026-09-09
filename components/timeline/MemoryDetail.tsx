"use client";
import { useEffect, useState } from "react";
import { ChevronRight, Heart } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { BackLink } from "@/components/ui/BackLink";
import { moodIcon } from "@/lib/theme/moodIcons";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { PaywallCard } from "./PaywallCard";
import { moodTokens, type MoodTag } from "@/lib/theme/tokens";
import { formatLongDate } from "@/lib/time/local";

interface DetailData {
  date: string;
  memory: {
    title: string;
    reflection: string;
    mood: MoodTag;
    moodLabel: string;
    highlights: string[];
    status: string;
    resonated: boolean;
    entryCount: number;
  } | null;
  entries: {
    id: string;
    text: string;
    time: string;
    kind: string;
    media: { id: string; caption: string | null; sensitive: boolean }[];
  }[];
  photos: { id: string; caption: string | null; placeHint: string | null }[];
}

export function MemoryDetail({
  date,
  priceLabel,
  locked: initialLocked = false,
  lockedCount = 0,
  isToday = false,
}: {
  date: string;
  priceLabel: string;
  locked?: boolean;
  lockedCount?: number;
  /** Today's day arrives; the ones already in your story are simply there. */
  isToday?: boolean;
}) {
  const [data, setData] = useState<DetailData | null>(null);
  const [locked, setLocked] = useState(initialLocked);
  const [resonated, setResonated] = useState(false);

  useEffect(() => {
    if (initialLocked) return;
    fetch(`/api/memory/${date}`).then(async (r) => {
      if (r.status === 402) {
        setLocked(true);
        return;
      }
      if (!r.ok) return;
      const d = (await r.json()) as DetailData;
      setData(d);
      setResonated(d.memory?.resonated ?? false);
    });
  }, [date, initialLocked]);

  async function toggleResonate() {
    const next = !resonated;
    setResonated(next);
    await fetch(`/api/memory/${date}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resonated: next }),
    });
  }

  if (locked) {
    return (
      <main
        id="main"
        className="pb-safe relative mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-4 py-6"
      >
        <BackLink href="/timeline" className="mb-4">
          your story
        </BackLink>
        {/* This used to blur five hard-coded skeleton bars and describe them as
            "the length of what you wrote". The locked branch never fetches the
            day's content, so the bars could not have been its shape — they were
            the same five widths for every day anyone ever locked. Three separate
            advisors called it frost over nothing. The date is real and it is the
            only real thing here, so it is what the screen shows. */}
        <article className="rounded-card bg-surface p-6 shadow-1">
          <p className="text-xs font-semibold tracking-wide text-fg-soft">
            a day you wrote
          </p>
          <p className="mt-2 font-reading text-3xl leading-tight text-fg-soft">
            {formatLongDate(date, { year: true })}
          </p>
          <p className="mt-3 text-sm text-fg-soft">
            it&apos;s still here. it&apos;s just past the week the free version
            keeps.
          </p>
        </article>
        <div className="relative mt-auto pt-8">
          <PaywallCard
            lockedCount={lockedCount}
            priceLabel={priceLabel}
            headingLevel="h1"
          />
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <main id="main" className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  const mood = data.memory ? moodTokens[data.memory.mood] : null;

  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <BackLink href="/timeline">your story</BackLink>
        <button
          onClick={toggleResonate}
          aria-label="mark as resonated"
          aria-pressed={resonated}
          className="tap flex items-center justify-center rounded-pill text-fg-soft transition-transform duration-150 active:scale-90"
        >
          <Icon
            icon={Heart}
            size={22}
            className={resonated ? "fill-blush text-blush-ink" : ""}
          />
        </button>
      </div>

      <article
        className={`rounded-card bg-surface p-6 shadow-1 ${isToday ? "animate-keepsake-in" : "animate-fade-up"}`}
      >
        {mood && data.memory && (
          <Pill
            style={{ background: mood.bg, color: mood.fg }}
            className="mb-4"
          >
            <Icon icon={moodIcon[data.memory.mood]} size={13} />{" "}
            {(data.memory.moodLabel || mood.label).toLowerCase()}
          </Pill>
        )}
        {data.memory?.title ? (
          <>
            <h1 className="font-reading text-3xl leading-tight">
              {data.memory.title}
            </h1>
            <p className="mt-2 text-sm text-fg-soft">
              {formatLongDate(date, { year: true })}
            </p>
          </>
        ) : (
          <h1 className="font-reading text-3xl leading-tight">
            {formatLongDate(date, { year: true })}
          </h1>
        )}
        {data.memory ? (
          <p className="font-reading mt-4 text-lg leading-relaxed">
            {data.memory.reflection}
          </p>
        ) : (
          <p className="mt-4 italic text-fg-soft">
            this day is still being gathered.
          </p>
        )}
        {data.photos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            {data.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={`/api/media/${p.id}?v=full`}
                alt={p.caption ?? "a photo from this day"}
                className={`w-full rounded-card object-cover ${data.photos.length === 1 ? "col-span-2 max-h-72" : ""}`}
              />
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center gap-2 text-sm text-fg-soft">
          <PipAvatar size={20} /> kept by pip
        </div>
      </article>

      {data.entries.length > 0 && (
        <details className="mt-10">
          {/* Without a marker this reads as a section label, not a control — the
              most trustworthy thing in the app was also the least pressable. */}
          <summary className="tap group inline-flex cursor-pointer list-none items-center gap-2 rounded-pill px-2 text-xs font-semibold tracking-wide text-fg-soft transition-colors duration-150 hover:bg-surface active:bg-line/40">
            <Icon
              icon={ChevronRight}
              size={14}
              className="transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
            />
            what i actually wrote ({data.entries.length})
          </summary>
          <div className="mt-4 flex flex-col gap-2">
            {data.entries.map((e) => (
              <div key={e.id} className="rounded-card bg-surface p-4">
                <div className="mb-1 text-xs text-fg-soft">{e.time}</div>
                {e.text && <p className="text-base">{e.text}</p>}
                {e.media.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m.id}
                    src={`/api/media/${m.id}?v=thumb`}
                    alt={m.caption ?? "photo"}
                    className="mt-2 max-h-48 rounded-card object-cover"
                  />
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
