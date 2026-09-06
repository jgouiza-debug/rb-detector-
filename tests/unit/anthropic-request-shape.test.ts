import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Capture the params passed to the SDK without any network.
const calls: { stream: unknown[]; parse: unknown[] } = { stream: [], parse: [] };

vi.mock("@anthropic-ai/sdk", () => {
  class FakeStream {
    constructor(public params: unknown) {}
    on() {}
    async *[Symbol.asyncIterator]() {
      yield { type: "content_block_delta", delta: { type: "text_delta", text: "hi there\n\nhow are you?" } };
    }
    async finalMessage() {
      return { usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 4, cache_creation_input_tokens: 0 } };
    }
  }
  class FakeAnthropic {
    messages = {
      stream: (params: unknown) => {
        calls.stream.push(params);
        return new FakeStream(params);
      },
      parse: (params: unknown) => {
        calls.parse.push(params);
        return Promise.resolve({ parsed_output: { risk: "none", confidence: 0.9, reason: "ok" } });
      },
    };
    static RateLimitError = class extends Error {};
    static InternalServerError = class extends Error {};
    static APIConnectionError = class extends Error {};
    static BadRequestError = class extends Error {};
    static APIError = class extends Error {};
    constructor(public opts: unknown) {}
  }
  return { default: FakeAnthropic };
});

vi.mock("@anthropic-ai/sdk/helpers/zod", () => ({ zodOutputFormat: (schema: unknown) => ({ __zod: true, schema }) }));

let anthropicAi: typeof import("@/lib/adapters/ai/anthropic").anthropicAi;

beforeEach(async () => {
  calls.stream = [];
  calls.parse = [];
  process.env.APP_MODE = "cloud";
  process.env.AI_PROVIDER = "anthropic";
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.DATABASE_URL = "postgres://x/y";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
  process.env.STRIPE_SECRET_KEY = "sk";
  process.env.STRIPE_WEBHOOK_SECRET = "wh";
  process.env.STRIPE_PRICE_ID = "price";
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "vp";
  process.env.VAPID_PRIVATE_KEY = "vpk";
  process.env.CRON_SECRET = "cron";
  const env = await import("@/lib/env");
  env.resetEnvCache();
  anthropicAi = (await import("@/lib/adapters/ai/anthropic")).anthropicAi;
});

afterEach(() => {
  vi.resetModules();
});

describe("anthropic request shape", () => {
  it("reply uses sonnet, adaptive thinking, effort low, and cache_control on system + last history", async () => {
    const ai = anthropicAi();
    const gen = ai.reply({
      userName: "Sam",
      focus: [],
      local: { weekday: "Monday", hhmm: "09:00", dayPart: "morning" },
      careMode: false,
      concern: false,
      todayEntryCount: 1,
      yesterdayMood: null,
      history: [
        { id: "1", role: "user", text: "hey" },
        { id: "2", role: "assistant", text: "hi" },
      ],
      userText: "how's it going",
      images: [],
    });
    for await (const _ of gen) void _;

    expect(calls.stream).toHaveLength(1);
    const p = calls.stream[0] as Record<string, unknown>;
    expect(p.model).toBe("claude-sonnet-5");
    expect(p.thinking).toEqual({ type: "adaptive" });
    expect(p.output_config).toMatchObject({ effort: "low" });
    expect(p.max_tokens).toBe(300);
    const system = p.system as { text: string; cache_control?: unknown }[];
    expect(system[0].cache_control).toEqual({ type: "ephemeral" });
    // No assistant prefill: the last message must be the user's, not an assistant turn.
    const messages = p.messages as { role: string; content: unknown }[];
    expect(messages[messages.length - 1].role).toBe("user");
    // Cache breakpoint on the last history turn.
    const lastHistory = messages[messages.length - 2] as { content: { cache_control?: unknown }[] };
    expect(lastHistory.content[0].cache_control).toEqual({ type: "ephemeral" });
  });

  it("classifyRisk uses parse with a zod output format and low effort", async () => {
    const ai = anthropicAi();
    await ai.classifyRisk({ text: "i feel hopeless", recent: [] }, { timeoutMs: 6000 });
    expect(calls.parse).toHaveLength(1);
    const p = calls.parse[0] as Record<string, unknown>;
    expect(p.model).toBe("claude-sonnet-5");
    expect((p.output_config as Record<string, unknown>).format).toMatchObject({ __zod: true });
    expect((p.output_config as Record<string, unknown>).effort).toBe("low");
    expect(p.thinking).toEqual({ type: "adaptive" });
    expect("stop_sequences" in p).toBe(false);
  });
});
