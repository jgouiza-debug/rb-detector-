export interface TranscriptionInput {
  /** Raw audio bytes from the client's MediaRecorder. */
  audio: ArrayBuffer;
  mimeType: string;
  /** The user's own API key (BYO). Passed per-call, never stored on the adapter, never logged. */
  apiKey: string;
  language?: string;
}

/**
 * Seam for server-side speech-to-text. The default offline path uses the browser's
 * own Web Speech API and never touches this. When a user brings their own
 * OpenAI-compatible key, `/api/transcribe` routes their audio through here.
 */
export interface TranscriptionPort {
  transcribe(input: TranscriptionInput): Promise<{ text: string } | null>;
}
