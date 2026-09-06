"use client";
import { useEffect, useState } from "react";
import { Check, Mic, RotateCcw, Square } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useDictation } from "@/hooks/useDictation";
import { useThread } from "@/lib/store/threadStore";
import { tidyTranscript } from "@/lib/voice/tidy";

const BARS = [0, 1, 2, 3, 4, 5, 6];

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

type Phase = "listening" | "review" | "type";

/**
 * Mounted only while open, so each session starts fresh — no reset-in-effect
 * dance. Dictates hands-free where the browser can, and falls back to a keyboard
 * field everywhere else (the same field the e2e drives, since headless Chromium
 * has no speech engine).
 */
export function VoiceSheet({ onClose, localDate }: { onClose: () => void; localDate: string }) {
  const { supported, finalText, interim, error, start, stop, reset } = useDictation();
  const sendVoice = useThread((s) => s.sendVoice);
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>(() => (supported ? "listening" : "type"));
  const [typed, setTyped] = useState("");

  // Start recognition on open; stop it on close. No direct setState here — the
  // hook owns its own state, so this only drives the external speech engine.
  useEffect(() => {
    if (supported) {
      start();
      buzz(8);
    }
    return () => stop();
  }, [supported, start, stop]);

  // A denied mic (or an engine that dies mid-session) quietly becomes the keyboard.
  const activePhase: Phase = phase === "listening" && error ? "type" : phase;
  const preview = tidyTranscript(activePhase === "type" ? typed : finalText);

  function done() {
    stop();
    buzz(8);
    setPhase("review");
  }

  function redo() {
    reset();
    setTyped("");
    if (supported) {
      setPhase("listening");
      start();
    } else {
      setPhase("type");
    }
  }

  async function save() {
    const text = tidyTranscript(activePhase === "type" ? typed : finalText);
    if (!text) {
      toast("didn't catch that — try again");
      return;
    }
    stop();
    buzz([6, 40, 10]);
    onClose();
    await sendVoice({ text, localDate });
    toast("logged quietly");
  }

  return (
    <Sheet open onClose={onClose} title="just speak" className="sm:max-w-md">
      <div className="flex flex-col items-center gap-5 pb-2 pt-1">
        {activePhase === "listening" ? (
          <>
            <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
              {BARS.map((b) => (
                <span key={b} className="animate-voicebar w-1.5 origin-bottom rounded-full bg-cta" style={{ height: 40, animationDelay: `${b * 90}ms` }} />
              ))}
            </div>
            <p className="min-h-[3.5rem] px-2 text-center text-lg leading-relaxed text-fg" aria-live="polite">
              {finalText}
              {interim && <span className="text-fg-soft"> {interim}</span>}
              {!finalText && !interim && <span className="text-fg-soft">listening… say whatever&apos;s on your mind</span>}
            </p>
            <Button variant="strong" full size="lg" onClick={done}>
              <Icon icon={Square} size={18} /> done
            </Button>
          </>
        ) : activePhase === "review" ? (
          <>
            <div className="grid size-14 place-items-center rounded-full bg-cta/15 text-amber-ink">
              <Icon icon={Mic} size={26} />
            </div>
            <p className="min-h-[3.5rem] px-2 text-center text-lg leading-relaxed text-fg">{preview || <span className="text-fg-soft">nothing caught — try again</span>}</p>
            <div className="flex w-full gap-2">
              <Button variant="soft" full size="lg" onClick={redo}>
                <Icon icon={RotateCcw} size={18} /> redo
              </Button>
              <Button variant="strong" full size="lg" onClick={save} disabled={!preview}>
                <Icon icon={Check} size={18} /> log it
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid size-14 place-items-center rounded-full bg-cta/15 text-amber-ink">
              <Icon icon={Mic} size={26} />
            </div>
            <p className="text-center text-sm text-fg-soft">{supported ? "type it instead — same quiet log." : "your browser can't dictate here, so jot the thought and it logs the same way."}</p>
            <textarea
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              rows={3}
              placeholder="a passing thought…"
              aria-label="what's on your mind"
              className="w-full resize-none rounded-field border border-line bg-surface px-4 py-3 text-[15px] text-fg outline-none focus-visible:outline-3 focus-visible:outline-ring"
            />
            <Button variant="strong" full size="lg" onClick={save} disabled={!tidyTranscript(typed)}>
              <Icon icon={Check} size={18} /> log it
            </Button>
          </>
        )}
        <p className="text-center text-xs text-fg-soft">pip keeps this in your day. no reply — just a quiet note to yourself.</p>
      </div>
    </Sheet>
  );
}
