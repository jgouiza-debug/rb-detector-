"use client";
import { useEffect, useState } from "react";
import { Check, Mic, RotateCcw, Square } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { PipMascot } from "@/components/pip/PipMascot";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useDictation } from "@/hooks/useDictation";
import { useThread } from "@/lib/store/threadStore";
import { tidyTranscript } from "@/lib/voice/tidy";

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
export function VoiceSheet({
  onClose,
  localDate,
}: {
  onClose: () => void;
  localDate: string;
}) {
  const { supported, finalText, interim, error, start, stop, reset } =
    useDictation();
  const sendVoice = useThread((s) => s.sendVoice);
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>(() =>
    supported ? "listening" : "type",
  );
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
      <div className="flex flex-col items-center gap-6 pb-2 pt-1">
        {activePhase === "listening" ? (
          <>
            {/* Seven bars on a fixed 0.9s loop looked exactly like a level meter
                and moved identically whether you spoke or said nothing at all —
                useDictation has no AnalyserNode, so there was never a level to
                show. Pip listening is the honest version of the same signal: it
                says "I'm here and recording", which is all we actually know. */}
            <div
              className="flex h-16 items-center justify-center"
              aria-hidden="true"
            >
              <PipMascot expression="listening" size={64} />
            </div>
            {/* The visible caption updates on every recognition tick. Announcing
                that would talk over the person still speaking, so the live region
                is a separate node carrying only committed text. */}
            <p className="min-h-[3.5rem] px-2 text-center text-lg leading-relaxed text-fg">
              {finalText}
              {interim && <span className="text-fg-soft"> {interim}</span>}
              {!finalText && !interim && (
                <span className="text-fg-soft">
                  listening… say whatever&apos;s on your mind
                </span>
              )}
            </p>
            <span className="sr-only" aria-live="polite">
              {finalText}
            </span>
            <Button variant="strong" full size="lg" onClick={done}>
              <Icon icon={Square} size={18} /> done
            </Button>
          </>
        ) : activePhase === "review" ? (
          <>
            <div className="grid size-14 place-items-center rounded-full bg-cta/15 text-amber-ink">
              <Icon icon={Mic} size={26} />
            </div>
            <p className="min-h-[3.5rem] px-2 text-center text-lg leading-relaxed text-fg">
              {preview || (
                <span className="text-fg-soft">nothing caught — try again</span>
              )}
            </p>
            <div className="flex w-full gap-2">
              <Button variant="soft" full size="lg" onClick={redo}>
                <Icon icon={RotateCcw} size={18} /> redo
              </Button>
              <Button
                variant="strong"
                full
                size="lg"
                onClick={save}
                disabled={!preview}
              >
                <Icon icon={Check} size={18} /> log it
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid size-14 place-items-center rounded-full bg-cta/15 text-amber-ink">
              <Icon icon={Mic} size={26} />
            </div>
            <p className="text-center text-sm text-fg-soft">
              {supported
                ? "type it instead — same quiet log."
                : "your browser can't dictate here, so jot the thought and it logs the same way."}
            </p>
            <textarea
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              rows={3}
              placeholder="a passing thought…"
              aria-label="what's on your mind"
              className="w-full resize-none rounded-field border border-line bg-surface px-4 py-2 min-h-12 text-base text-fg outline-none focus-visible:outline-3 focus-visible:outline-ring"
            />
            <Button
              variant="strong"
              full
              size="lg"
              onClick={save}
              disabled={!tidyTranscript(typed)}
            >
              <Icon icon={Check} size={18} /> log it
            </Button>
          </>
        )}
        <p className="text-center text-xs text-fg-soft">
          pip keeps this in your day. no reply — just a quiet note to yourself.
        </p>
      </div>
    </Sheet>
  );
}
