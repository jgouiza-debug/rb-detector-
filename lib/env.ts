import "server-only";
import { z } from "zod";

export type AppMode = "local" | "cloud";

const Providers = z.object({
  db: z.enum(["pglite", "postgres"]),
  auth: z.enum(["local", "supabase"]),
  blob: z.enum(["fs", "supabase"]),
  ai: z.enum(["scripted", "anthropic", "gemini"]),
  billing: z.enum(["mock", "stripe"]),
  push: z.enum(["outbox", "webpush"]),
  transcription: z.enum(["scripted", "openai"]),
});
export type Providers = z.infer<typeof Providers>;

export interface Env {
  mode: AppMode;
  isVercelProduction: boolean;
  providers: Providers;
  appUrl: string;
  buildId: string;
  db: { url: string | null; pgliteDir: string };
  auth: { supabaseUrl: string | null; supabaseAnonKey: string | null; supabaseServiceRoleKey: string | null; localSecret: string };
  blob: { bucket: string; dir: string };
  ai: { apiKey: string | null; model: string; vertexProject: string | null; vertexLocation: string; geminiModel: string; googleCredentialsJson: string | null };
  billing: { secretKey: string | null; webhookSecret: string | null; priceId: string | null; priceLabel: string };
  push: { publicKey: string | null; privateKey: string | null; subject: string };
  transcription: { baseUrl: string; model: string };
  cron: { secret: string };
  caps: { replyFree: number; replyPlus: number; caption: number; synthesis: number; globalReply: number; globalCaption: number; globalSynthesis: number };
  test: { fakeNow: string | null; scriptedRiskFail: boolean };
}

function resolveMode(): AppMode {
  const m = process.env.APP_MODE;
  if (m === "local" || m === "cloud") return m;
  return process.env.VERCEL_ENV ? "cloud" : "local";
}

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function str(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

let cached: Env | null = null;

/**
 * Lazily-validated environment. Never called at module import time so that
 * `next build` and static prerendering work without any env file.
 * Missing cloud secrets are reported as one readable table.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const mode = resolveMode();
  const isVercelProduction = process.env.VERCEL_ENV === "production";
  if (mode === "local" && isVercelProduction) {
    throw new Error("APP_MODE=local is refused when VERCEL_ENV=production. Set APP_MODE=cloud and the cloud secrets.");
  }
  const localDefaults: Providers = { db: "pglite", auth: "local", blob: "fs", ai: "scripted", billing: "mock", push: "outbox", transcription: "scripted" };
  const cloudDefaults: Providers = { db: "postgres", auth: "supabase", blob: "supabase", ai: "anthropic", billing: "stripe", push: "webpush", transcription: "openai" };
  const defaults = mode === "local" ? localDefaults : cloudDefaults;
  const providers = Providers.parse({
    db: process.env.DB_PROVIDER ?? defaults.db,
    auth: process.env.AUTH_PROVIDER ?? defaults.auth,
    blob: process.env.BLOB_PROVIDER ?? defaults.blob,
    ai: process.env.AI_PROVIDER ?? defaults.ai,
    billing: process.env.BILLING_PROVIDER ?? defaults.billing,
    push: process.env.PUSH_PROVIDER ?? defaults.push,
    transcription: process.env.TRANSCRIPTION_PROVIDER ?? defaults.transcription,
  });

  const env: Env = {
    mode,
    isVercelProduction,
    providers,
    appUrl: (str("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000").replace(/\/$/, ""),
    buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
    db: { url: str("DATABASE_URL"), pgliteDir: str("PGLITE_DATA_DIR") ?? ".data/pglite" },
    auth: {
      supabaseUrl: str("NEXT_PUBLIC_SUPABASE_URL"),
      supabaseAnonKey: str("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      supabaseServiceRoleKey: str("SUPABASE_SERVICE_ROLE_KEY"),
      localSecret: str("LOCAL_AUTH_SECRET") ?? "pip-local-dev-secret",
    },
    blob: { bucket: str("SUPABASE_STORAGE_BUCKET") ?? "media", dir: str("BLOB_DIR") ?? ".data/blobs" },
    ai: {
      apiKey: str("ANTHROPIC_API_KEY"),
      model: str("PIP_MODEL") ?? "claude-sonnet-5",
      vertexProject: str("VERTEX_PROJECT"),
      vertexLocation: str("VERTEX_LOCATION") ?? "us-central1",
      geminiModel: str("GEMINI_MODEL") ?? "gemini-2.5-flash",
      googleCredentialsJson: str("GOOGLE_APPLICATION_CREDENTIALS_JSON"),
    },
    billing: {
      secretKey: str("STRIPE_SECRET_KEY"),
      webhookSecret: str("STRIPE_WEBHOOK_SECRET"),
      priceId: str("STRIPE_PRICE_ID"),
      priceLabel: str("NEXT_PUBLIC_PLUS_PRICE_LABEL") ?? "$4.99/mo",
    },
    push: {
      publicKey: str("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
      privateKey: str("VAPID_PRIVATE_KEY"),
      subject: str("VAPID_SUBJECT") ?? "mailto:hello@example.com",
    },
    transcription: {
      baseUrl: (str("TRANSCRIPTION_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, ""),
      model: str("TRANSCRIPTION_MODEL") ?? "whisper-1",
    },
    cron: { secret: str("CRON_SECRET") ?? (mode === "local" ? "local" : "") },
    caps: {
      replyFree: num("DAILY_REPLY_CAP_FREE", 150),
      replyPlus: num("DAILY_REPLY_CAP_PLUS", 400),
      caption: num("DAILY_CAPTION_CAP", 40),
      synthesis: num("DAILY_SYNTHESIS_CAP", 3),
      globalReply: num("GLOBAL_DAILY_REPLY_CAP", 3000),
      globalCaption: num("GLOBAL_DAILY_CAPTION_CAP", 2000),
      globalSynthesis: num("GLOBAL_DAILY_SYNTHESIS_CAP", 800),
    },
    test: { fakeNow: mode === "local" ? str("PIP_FAKE_NOW") : null, scriptedRiskFail: mode === "local" && process.env.PIP_SCRIPTED_RISK_FAIL === "1" },
  };

  const missing: string[] = [];
  if (providers.db === "postgres" && !env.db.url) missing.push("DATABASE_URL");
  if (providers.auth === "supabase") {
    if (!env.auth.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!env.auth.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!env.auth.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (providers.blob === "supabase") {
    if (!env.auth.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!env.auth.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (providers.ai === "anthropic" && !env.ai.apiKey) missing.push("ANTHROPIC_API_KEY");
  if (providers.ai === "gemini") {
    if (!env.ai.vertexProject) missing.push("VERTEX_PROJECT");
    // GoogleAuth needs either an inline JSON blob or a credentials file path.
    if (!env.ai.googleCredentialsJson && !str("GOOGLE_APPLICATION_CREDENTIALS")) missing.push("GOOGLE_APPLICATION_CREDENTIALS (path) or GOOGLE_APPLICATION_CREDENTIALS_JSON (inline)");
  }
  if (providers.billing === "stripe") {
    if (!env.billing.secretKey) missing.push("STRIPE_SECRET_KEY");
    if (!env.billing.webhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
    if (!env.billing.priceId) missing.push("STRIPE_PRICE_ID");
  }
  if (providers.push === "webpush") {
    if (!env.push.publicKey) missing.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
    if (!env.push.privateKey) missing.push("VAPID_PRIVATE_KEY");
  }
  if (mode === "cloud" && !env.cron.secret) missing.push("CRON_SECRET");
  // The local auth adapter signs session tokens with this secret; the built-in
  // default is public, so it must never sign real sessions in the cloud.
  if (mode === "cloud" && providers.auth === "local" && env.auth.localSecret === "pip-local-dev-secret") {
    missing.push("LOCAL_AUTH_SECRET (a strong, non-default value is required for AUTH_PROVIDER=local in cloud)");
  }
  if (missing.length) {
    const unique = Array.from(new Set(missing));
    throw new Error(
      `pip: missing environment variables for APP_MODE=${mode} (${JSON.stringify(providers)}):\n  - ${unique.join("\n  - ")}\nSee .env.example and docs/SETUP.md.`,
    );
  }
  cached = env;
  return env;
}

/** Test helper: forget the cached env so a test can change process.env. */
export function resetEnvCache(): void {
  cached = null;
}

export function isLocalMode(): boolean {
  return getEnv().mode === "local";
}
