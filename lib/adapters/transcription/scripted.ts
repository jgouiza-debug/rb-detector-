import "server-only";
import type { TranscriptionPort } from "@/lib/ports/transcription";

/**
 * Deterministic stub for local mode and tests: it returns a canned transcript and
 * never touches the network or the audio bytes, so the offline path stays offline.
 */
export function scriptedTranscription(): TranscriptionPort {
  return {
    async transcribe() {
      return { text: "this is a scripted transcription for local mode" };
    },
  };
}
