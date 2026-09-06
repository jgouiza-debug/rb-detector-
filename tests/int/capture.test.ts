import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createProfile } from "@/lib/db/repo/profiles";
import { messagesForDate } from "@/lib/db/repo/messages";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";
import { installTestPorts } from "../helpers/ports";

let t: TestDb;

beforeAll(async () => {
  t = await makeTestDb();
  process.env.APP_MODE = "local";
  vi.doMock("@/lib/db/client", async () => {
    const actual = await vi.importActual<typeof import("@/lib/db/client")>("@/lib/db/client");
    return { ...actual, getDb: async () => t.db, withTx: async <T>(fn: (tx: unknown) => Promise<T>) => t.db.transaction(fn as never) };
  });
  await createProfile(t.db, UID_A, "America/New_York");
});
afterAll(async () => {
  await t.close();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("capture before AI", () => {
  it("saves the user message even when the AI throws, and is idempotent on clientId", async () => {
    const throwingAi = {
      reply: async function* () {
        throw new Error("model down");
      },
      async classifyRisk() {
        return { risk: "none" as const, confidence: 1, reason: "ok" };
      },
      async captionPhoto() {
        return null;
      },
      async synthesizeDay() {
        return null;
      },
    };
    installTestPorts({ db: t.db, ai: throwingAi });
    const { sendMessage } = await import("@/lib/chat/sendMessage");

    const events1: string[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "i had a fine day", clientId: "cap-1", mediaIds: [] })) events1.push(ev.type);
    expect(events1).toContain("saved");
    // A fallback bubble is produced when the model yields nothing.
    expect(events1).toContain("bubble");

    // The user message persisted.
    const msgs = await messagesForDate(t.db, UID_A, "2026-10-26");
    const userMsgs = msgs.filter((m) => m.sender === "user");
    expect(userMsgs).toHaveLength(1);
    expect(userMsgs[0].text).toBe("i had a fine day");

    // Retry with the same clientId does not duplicate the user row.
    for await (const _ of sendMessage({ userId: UID_A, text: "i had a fine day", clientId: "cap-1", mediaIds: [] })) void _;
    const after = (await messagesForDate(t.db, UID_A, "2026-10-26")).filter((m) => m.sender === "user");
    expect(after).toHaveLength(1);
  });
});
