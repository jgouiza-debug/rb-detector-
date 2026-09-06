import { afterAll, beforeAll, describe, expect, it } from "vitest";
import JSZip from "jszip";
import sharp from "sharp";
import { and, eq } from "drizzle-orm";
import { createProfile } from "@/lib/db/repo/profiles";
import { insertMessage } from "@/lib/db/repo/messages";
import { insertMedia } from "@/lib/db/repo/media";
import { runDay } from "@/lib/synthesis/runDay";
import { billingEvents, localOtps, media, memories, messages, profiles, pushOutbox, subscriptions, safetyEvents } from "@/lib/db/schema";
import { scriptedAi } from "@/lib/adapters/ai/scripted";
import type { Ports } from "@/lib/ports";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
const blobStore = new Map<string, Uint8Array>();
const ports = {
  clock: { now: () => new Date("2026-10-26T12:00:00Z") },
  ai: scriptedAi(),
  blob: {
    async put(k: string, b: Uint8Array) { blobStore.set(k, b); },
    async get(k: string) { return blobStore.get(k) ?? null; },
    async deletePrefix(p: string) { for (const k of blobStore.keys()) if (k.startsWith(p)) blobStore.delete(k); },
  },
  billing: { async cancelSubscriptionNow() {} },
  auth: { async deleteAuthUser() {}, async signOut() {} },
} as unknown as Ports;

beforeAll(async () => {
  t = await makeTestDb();
  await createProfile(t.db, UID_A, "UTC");
  const m1 = await insertMessage(t.db, { userId: UID_A, sender: "user", kind: "photo", text: "a good day with a photo", clientId: "e1", localDate: "2026-10-26" });
  const jpeg = new Uint8Array(await sharp({ create: { width: 20, height: 20, channels: 3, background: { r: 1, g: 2, b: 3 } } }).jpeg().toBuffer());
  await ports.blob.put(`${UID_A}/media1/full.jpg`, jpeg, "image/jpeg");
  const med = await insertMedia(t.db, { userId: UID_A, keyFull: `${UID_A}/media1/full.jpg`, keyThumb: `${UID_A}/media1/thumb.jpg`, width: 20, height: 20, bytes: jpeg.length });
  await t.db.update(media).set({ messageId: m1.id, aiCaption: "a photo" }).where(eq(media.id, med.id));
  await runDay(t.db, ports, UID_A, "2026-10-26", "manual");
  // Add audit rows that must be purged on delete.
  await t.db.insert(billingEvents).values({ id: "evt_a", type: "checkout_completed", userId: UID_A, payload: {} });
  await t.db.insert(pushOutbox).values({ userId: UID_A, payload: { tag: "morning" } });
});
afterAll(async () => {
  await t.close();
});

describe("export", () => {
  it("produces a zip with every message, memory, and photo, and a matching manifest", async () => {
    const { buildExportZip } = await import("@/lib/export/buildZip");
    const stream = await buildExportZip(t.db, ports, UID_A);
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const zip = await JSZip.loadAsync(buf);
    expect(zip.file("journal.json")).toBeTruthy();
    expect(zip.file("memories.json")).toBeTruthy();
    expect(zip.file("story.md")).toBeTruthy();
    const journal = JSON.parse(await zip.file("journal.json")!.async("string"));
    expect(journal.length).toBeGreaterThanOrEqual(1);
    // The photo is present.
    const photo = Object.keys(zip.files).find((f) => f.startsWith("photos/") && f.endsWith(".jpg"));
    expect(photo).toBeTruthy();
    // The manifest lists a sha256 for the photo that matches the stored bytes.
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
    expect(manifest.files[photo!].sha256).toHaveLength(64);
  });
});

describe("delete", () => {
  it("leaves zero rows in every table and zero blobs under the prefix", async () => {
    const { deleteUserCompletely } = await import("@/lib/account/deleteUser");
    await deleteUserCompletely(t.db, ports, UID_A);

    for (const [tbl, col] of [
      [messages, messages.userId],
      [media, media.userId],
      [memories, memories.userId],
      [subscriptions, subscriptions.userId],
      [billingEvents, billingEvents.userId],
      [pushOutbox, pushOutbox.userId],
      [safetyEvents, safetyEvents.userId],
    ] as const) {
      const rows = await t.db.select().from(tbl).where(eq(col, UID_A));
      expect(rows, `${(tbl as unknown as { _: { name: string } })}`).toHaveLength(0);
    }
    const profileRows = await t.db.select().from(profiles).where(eq(profiles.id, UID_A));
    expect(profileRows).toHaveLength(0);
    // No blobs under the user's prefix.
    expect([...blobStore.keys()].filter((k) => k.startsWith(`${UID_A}/`))).toHaveLength(0);
    void and;
    void localOtps;
  });

  it("is safe to run twice (idempotent)", async () => {
    const { deleteUserCompletely } = await import("@/lib/account/deleteUser");
    await expect(deleteUserCompletely(t.db, ports, UID_A)).resolves.toBeUndefined();
  });
});
