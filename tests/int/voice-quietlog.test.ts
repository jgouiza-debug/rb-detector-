import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createProfile } from "@/lib/db/repo/profiles";
import { messagesForDate } from "@/lib/db/repo/messages";
import { getDailyUsage } from "@/lib/db/repo/usage";
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

describe("voice quiet-log", () => {
  it("logs a benign voice note with no reply and no cap spend", async () => {
    installTestPorts({ db: t.db });
    const { sendMessage } = await import("@/lib/chat/sendMessage");
    const events: { type: string; localDate?: string; text?: string }[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "picked up oat milk on the way home", clientId: "v-1", mediaIds: [], kind: "voice" })) {
      events.push(ev as never);
    }
    const types = events.map((e) => e.type);
    // Saved, then done — nothing in between. No bubbles, no crisis, no typing reply.
    expect(types).toEqual(["saved", "done"]);

    const localDate = events.find((e) => e.type === "saved")!.localDate!;
    const msgs = await messagesForDate(t.db, UID_A, localDate);
    const voice = msgs.find((m) => m.kind === "voice");
    expect(voice).toBeTruthy();
    expect(voice!.sender).toBe("user");
    expect(voice!.text).toContain("oat milk");
    // Pip stayed silent.
    expect(msgs.some((m) => m.sender === "pip")).toBe(false);

    // A quiet note is not a reply — the reply cap is untouched.
    const usage = await getDailyUsage(t.db, UID_A, localDate);
    expect(usage.replies).toBe(0);
  });

  it("a spoken crisis still fires the full crisis card, quiet or not", async () => {
    installTestPorts({ db: t.db });
    const { sendMessage } = await import("@/lib/chat/sendMessage");
    const events: { type: string; card?: { resources: { detail: string }[] } }[] = [];
    for await (const ev of sendMessage({ userId: UID_A, text: "i want to kill myself", clientId: "v-crisis-1", mediaIds: [], kind: "voice" })) {
      events.push(ev as never);
    }
    const crisis = events.find((e) => e.type === "crisis");
    expect(crisis).toBeTruthy();
    expect(JSON.stringify(crisis)).toContain("988");
  });
});
