"use client";
import { useRef, useState } from "react";
import { ArrowUp, ImagePlus, Mic, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { downscaleImage } from "@/lib/util/imageClient";
import { useThread, type UiMedia } from "@/lib/store/threadStore";
import { useToast } from "@/components/ui/Toast";
import { useOnline } from "@/hooks/useOnline";
import { VoiceSheet } from "./VoiceSheet";

interface Pending {
  localUrl: string;
  mediaId?: string;
  uploading: boolean;
  failed?: boolean;
}

export function Composer({ localDate }: { localDate: string }) {
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<Pending[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const send = useThread((s) => s.send);
  const { toast } = useToast();
  const online = useOnline();

  const busy = photos.some((p) => p.uploading);
  const canSend = (text.trim().length > 0 || photos.some((p) => p.mediaId)) && !busy;

  async function onPick(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files).slice(0, 6)) {
      const localUrl = URL.createObjectURL(file);
      const entry: Pending = { localUrl, uploading: true };
      setPhotos((p) => [...p, entry]);
      try {
        const blob = await downscaleImage(file);
        const fd = new FormData();
        fd.append("file", blob, "photo.jpg");
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) throw new Error("upload failed");
        const { mediaId } = (await res.json()) as { mediaId: string };
        setPhotos((p) => p.map((x) => (x === entry ? { ...x, mediaId, uploading: false } : x)));
      } catch {
        setPhotos((p) => p.map((x) => (x === entry ? { ...x, uploading: false, failed: true } : x)));
        toast("that photo didn't work — try a JPG or screenshot");
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (!canSend) return;
    const ready = photos.filter((p) => p.mediaId);
    const mediaIds = ready.map((p) => p.mediaId as string);
    const localMedia: UiMedia[] = ready.map((p) => ({ id: p.mediaId as string, captionStatus: "pending", caption: null, sensitive: false, localUrl: p.localUrl }));
    const body = { text: text.trim(), mediaIds, localMedia, localDate };
    setText("");
    setPhotos([]);
    if (taRef.current) taRef.current.style.height = "auto";
    await send(body);
  }

  return (
    <footer aria-label="write to pip" className="pb-safe px-safe sticky bottom-0 z-20 border-t border-line bg-bg">
      <div className="mx-auto w-full max-w-2xl px-4 py-2">
        {!online && <p className="mb-2 rounded-pill bg-surface-2 px-4 py-2 text-center text-xs text-fg-soft">you’re offline — your words will send when you’re back</p>}
        {photos.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {photos.map((p, i) => (
              <div key={i} className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.localUrl} alt="" className="size-full object-cover" />
                {p.uploading && <div className="absolute inset-0 grid place-items-center bg-ink/30 text-xs text-cream">…</div>}
                <button type="button" onClick={() => removePhoto(i)} aria-label="remove photo" className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-ink/70 text-cream">
                  <Icon icon={X} size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onPick(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="add photos" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={ImagePlus} size={22} />
          </button>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="tell pip anything…"
            aria-label="message pip"
            className="max-h-36 min-h-11 flex-1 resize-none rounded-3xl border border-line bg-surface px-4 py-2 text-base leading-6 text-fg outline-none focus-visible:outline-3 focus-visible:outline-ring"
          />
          {text.trim() === "" && photos.length === 0 ? (
            <button
              type="button"
              onClick={() => setVoiceOpen(true)}
              aria-label="speak a thought"
              className="tap flex items-center justify-center rounded-full bg-cta text-cta-fg transition-transform active:scale-95"
            >
              <Icon icon={Mic} size={22} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="send"
              className="tap flex items-center justify-center rounded-full bg-cta text-cta-fg transition-transform active:scale-95 disabled:opacity-40"
            >
              <Icon icon={ArrowUp} size={22} />
            </button>
          )}
        </div>
      </div>
      {voiceOpen && <VoiceSheet onClose={() => setVoiceOpen(false)} localDate={localDate} />}
    </footer>
  );
}
