"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { moodIcon } from "@/lib/theme/moodIcons";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Skeleton";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { PaywallCard } from "./PaywallCard";
import { moodTokens, type MoodTag } from "@/lib/theme/tokens";
import { formatLongDate } from "@/lib/time/local";

interface DetailData {
  date: string;
  memory: { title: string; reflection: string; mood: MoodTag; moodLabel: string; highlights: string[]; status: string; resonated: boolean; entryCount: number } | null;
  entries: { id: string; text: string; time: string; kind: string; media: { id: string; caption: string | null; sensitive: boolean }[] }[];
  photos: { id: string; caption: string | null; placeHint: string | null }[];
}

export function MemoryDetail({ date, priceLabel }: { date: string; priceLabel: string }) {
  const [data, setData] = useState<DetailData | null>(null);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<"card" | "raw">("card");
  const [resonated, setResonated] = useState(false);

  useEffect(() => {
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
  }, [date]);

  async function toggleResonate() {
    const next = !resonated;
    setResonated(next);
    await fetch(`/api/memory/${date}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ resonated: next }) });
  }

  if (locked) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/timeline" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> your story</Link>
        <PaywallCard lockedCount={0} priceLabel={priceLabel} />
      </main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  const mood = data.memory ? moodTokens[data.memory.mood] : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <Link href="/timeline" className="inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> keepsake edition</Link>
        <button onClick={toggleResonate} aria-label="mark as resonated" aria-pressed={resonated} className="tap flex items-center justify-center rounded-full text-fg-soft">
          <Icon icon={Heart} size={22} className={resonated ? "fill-blush text-blush-ink" : ""} />
        </button>
      </div>

      <div className="mb-4 flex gap-2" role="tablist">
        <button role="tab" aria-selected={tab === "card"} onClick={() => setTab("card")} className={`tap inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold ${tab === "card" ? "bg-ink text-cream" : "bg-surface text-fg"}`}><Icon icon={Sparkles} size={15} /> Keepsake Card</button>
        <button role="tab" aria-selected={tab === "raw"} onClick={() => setTab("raw")} className={`tap rounded-pill px-4 py-2 text-sm font-semibold ${tab === "raw" ? "bg-ink text-cream" : "bg-surface text-fg"}`}>Raw Entries ({data.entries.length})</button>
      </div>

      {tab === "card" ? (
        <article className="rounded-card bg-surface p-6 shadow-1">
          {mood && data.memory && (
            <Pill style={{ background: mood.bg, color: mood.fg }} className="mb-3">
              <Icon icon={moodIcon[data.memory.mood]} size={13} /> {data.memory.moodLabel || mood.label}
            </Pill>
          )}
          <h1 className="font-reading text-3xl leading-tight">{formatLongDate(date, { year: true })}</h1>
          {data.memory ? (
            <p className="font-reading mt-4 text-lg leading-relaxed">{data.memory.reflection}</p>
          ) : (
            <p className="mt-4 italic text-fg-soft">this day is still being gathered.</p>
          )}
          {data.photos.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {data.photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={`/api/media/${p.id}?v=full`} alt={p.caption ?? "a photo from this day"} className="w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}
          <div className="mt-5 flex items-center gap-1.5 text-sm text-fg-soft">
            <PipAvatar size={20} /> synthesized by pip with care
          </div>
        </article>
      ) : (
        <div className="flex flex-col gap-3">
          {data.entries.map((e) => (
            <div key={e.id} className="rounded-card bg-surface p-4">
              <div className="mb-1 text-xs text-fg-soft">{e.time}</div>
              {e.text && <p className="text-[15px]">{e.text}</p>}
              {e.media.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={`/api/media/${m.id}?v=thumb`} alt={m.caption ?? "photo"} className="mt-2 max-h-48 rounded-xl object-cover" />
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
