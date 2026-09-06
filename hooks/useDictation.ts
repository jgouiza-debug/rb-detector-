"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// The DOM lib doesn't ship Web Speech typings everywhere, so declare the slice
// we use. Chrome/Safari expose it as `webkitSpeechRecognition`.
interface RecAlt {
  transcript: string;
}
interface RecResult {
  0: RecAlt;
  isFinal: boolean;
  length: number;
}
interface RecResultList {
  length: number;
  [i: number]: RecResult;
}
interface RecEvent {
  resultIndex: number;
  results: RecResultList;
}
interface RecErrorEvent {
  error: string;
}
interface RecInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: RecErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type RecCtor = new () => RecInstance;

function getCtor(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface Dictation {
  /** true when this browser can dictate on-device (or via its speech service). */
  supported: boolean;
  listening: boolean;
  /** Finalized words so far. */
  finalText: string;
  /** The in-flight guess for the current phrase. */
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Thin wrapper over the Web Speech API: feature-detected, streams interim and
 * final results, and cleans up on unmount. Everything stays on the client — no
 * audio ever leaves for the offline path. Callers must provide a keyboard
 * fallback for browsers where `supported` is false (iOS in-app webviews, etc.).
 */
export function useDictation(): Dictation {
  const [ctor] = useState<RecCtor | null>(() => getCtor());
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecInstance | null>(null);
  const finalRef = useRef("");

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    setError(null);
  }, []);

  const start = useCallback(() => {
    if (!ctor) {
      setError("unsupported");
      return;
    }
    setError(null);
    const rec = new ctor();
    rec.lang = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const piece = r[0]?.transcript ?? "";
        if (r.isFinal) finalRef.current = `${finalRef.current} ${piece}`.replace(/\s+/g, " ").trim();
        else live += piece;
      }
      setFinalText(finalRef.current);
      setInterim(live.trim());
    };
    rec.onerror = (ev) => {
      // "no-speech" and "aborted" are ordinary; only surface real failures.
      if (ev.error !== "no-speech" && ev.error !== "aborted") setError(ev.error);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("start-failed");
    }
  }, [ctor]);

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return { supported: !!ctor, listening, finalText, interim, error, start, stop, reset };
}
