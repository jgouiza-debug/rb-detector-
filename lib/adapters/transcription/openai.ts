import "server-only";
import { getEnv } from "@/lib/env";
import type { TranscriptionInput, TranscriptionPort } from "@/lib/ports/transcription";

function ext(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "wav";
}

/**
 * OpenAI-compatible transcription (Whisper `/audio/transcriptions`). The base URL
 * and model are env-configurable, so any compatible endpoint works; the key is the
 * caller's own, passed per request and never persisted here.
 */
export function openaiTranscription(): TranscriptionPort {
  return {
    async transcribe({ audio, mimeType, apiKey, language }: TranscriptionInput) {
      const env = getEnv();
      const form = new FormData();
      form.append("file", new Blob([audio], { type: mimeType }), `audio.${ext(mimeType)}`);
      form.append("model", env.transcription.model);
      if (language) form.append("language", language);
      const res = await fetch(`${env.transcription.baseUrl}/audio/transcriptions`, {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!res.ok) return null;
      const data = (await res.json().catch(() => null)) as { text?: string } | null;
      return data?.text ? { text: data.text } : null;
    },
  };
}
