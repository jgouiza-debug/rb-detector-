import "server-only";
import { getEnv } from "@/lib/env";
import * as A from "@/lib/adapters";
import type { AiPort } from "./ai";
import type { AuthPort } from "./auth";
import type { BillingPort } from "./billing";
import type { BlobPort } from "./blob";
import type { ClockPort } from "./clock";
import type { PushPort } from "./push";
import type { TranscriptionPort } from "./transcription";

export interface Ports {
  auth: AuthPort;
  blob: BlobPort;
  ai: AiPort;
  billing: BillingPort;
  push: PushPort;
  clock: ClockPort;
  transcription: TranscriptionPort;
}

type PortsCache = { ports?: Ports };
const g = globalThis as unknown as { __pipPorts?: PortsCache };

/**
 * Composition root. Adapters are chosen by lib/env.ts and memoized per process.
 * Cloud adapters are imported statically (server-only code) but construct their
 * SDK clients lazily, so a missing key fails at first use, not at import.
 */
export function getPorts(): Ports {
  if (!g.__pipPorts) g.__pipPorts = {};
  if (g.__pipPorts.ports) return g.__pipPorts.ports;
  const env = getEnv();
  const ports: Ports = {
    clock: env.mode === "local" ? A.testableClock() : A.systemClock(),
    auth: env.providers.auth === "supabase" ? A.supabaseAuth() : A.localAuth(),
    blob: env.providers.blob === "supabase" ? A.supabaseBlob() : A.fsBlob(),
    ai: env.providers.ai === "anthropic" ? A.anthropicAi() : env.providers.ai === "gemini" ? A.geminiAi() : A.scriptedAi(),
    billing: env.providers.billing === "stripe" ? A.stripeBilling() : A.mockBilling(),
    push: env.providers.push === "webpush" ? A.webPush() : A.outboxPush(),
    transcription: env.providers.transcription === "openai" ? A.openaiTranscription() : A.scriptedTranscription(),
  };
  g.__pipPorts.ports = ports;
  return ports;
}

/** Test helper. */
export function setPortsForTests(ports: Ports | null): void {
  if (!g.__pipPorts) g.__pipPorts = {};
  g.__pipPorts.ports = ports ?? undefined;
}

export class NotLocalModeError extends Error {
  constructor() {
    super("not found");
    this.name = "NotLocalModeError";
  }
}

/** Every /dev and /api/dev surface calls this first and returns 404 outside local mode. */
export function assertLocalMode(): void {
  if (getEnv().mode !== "local") throw new NotLocalModeError();
}

export type { AiPort, AuthPort, BillingPort, BlobPort, ClockPort, PushPort, TranscriptionPort };
