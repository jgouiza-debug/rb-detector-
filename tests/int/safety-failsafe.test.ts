import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
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
  await createProfile(t.db, UID_A, "UTC");
});
afterAll(async () => {
  await t.close();
});

describe("safety pipeline", () => {
  it("tier-1 phrase yields the crisis card with 988 and no generative reply", async () => {
    installTestPorts({ db: t.db });
    const { sendMessage } = await import("@/lib/chat/sendMessage");
    const events: { type: string; card?: { resources: { detail: string }[] } }[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "i want to kill myself", clientId: "cr-1", mediaIds: [] })) events.push(ev as never);
    const crisis = events.find((e) => e.type === "crisis");
    expect(crisis).toBeTruthy();
    const text = JSON.stringify(crisis);
    expect(text).toContain("988");
    // The persisted messages are the templated crisis bubbles, marked crisis.
    const msgs = await messagesForDate(t.db, UID_A, "2026-10-26");
    const pip = msgs.filter((m) => m.sender === "pip");
    expect(pip.length).toBeGreaterThanOrEqual(3);
    expect(pip.every((m) => m.safetyLevel === "crisis")).toBe(true);
  });

  it("a rate-capped user in crisis still gets the crisis card, never the resting bubble", async () => {
    installTestPorts({ db: t.db });
    // Push daily usage far past the free reply cap so the cost cap would trip.
    const { bumpUsage } = await import("@/lib/db/repo/usage");
    await bumpUsage(t.db, UID_A, "2026-10-26", { replies: 1000 });
    const { sendMessage } = await import("@/lib/chat/sendMessage");
    const events: { type: string; text?: string }[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "i want to kill myself", clientId: "cr-cap-1", mediaIds: [] })) events.push(ev as never);
    const types = events.map((e) => e.type);
    // Safety must win over the cost cap: crisis card fires, no resting bubble.
    expect(types).toContain("crisis");
    const bubbleText = events.filter((e) => e.type === "bubble").map((e) => e.text ?? "").join(" ");
    expect(bubbleText).not.toContain("rest my voice");
  });

  it("classifier throw on a tier-2 message fails safe to crisis", async () => {
    const failing = {
      reply: async function* () {},
      async classifyRisk() {
        throw new Error("timeout");
      },
      async captionPhoto() {
        return null;
      },
      async synthesizeDay() {
        return null;
      },
    };
    installTestPorts({ db: t.db, ai: failing });
    const { sendMessage } = await import("@/lib/chat/sendMessage");
    const types: string[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "there's just no point", clientId: "cr-2", mediaIds: [] })) types.push(ev.type);
    expect(types).toContain("crisis");
  });
});
