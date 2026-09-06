import "server-only";
import JSZip from "jszip";
import { Readable } from "node:stream";
import { createHash } from "node:crypto";
import type { Db } from "@/lib/db/client";
import { allMemories } from "@/lib/db/repo/memories";
import { getProfile } from "@/lib/db/repo/profiles";
import { pageMessages } from "@/lib/db/repo/messages";
import { mediaForMessages } from "@/lib/db/repo/media";
import type { Ports } from "@/lib/ports";
import type { Message } from "@/lib/db/schema";
import { buildStoryMarkdown } from "./storyMarkdown";

/** Complete, free-for-everyone export as a streamed zip. */
export async function buildExportZip(db: Db, ports: Ports, userId: string): Promise<ReadableStream<Uint8Array>> {
  const profile = await getProfile(db, userId);
  const memories = await allMemories(db, userId);
  // All messages (page in large chunks).
  const messages: Message[] = [];
  let before: Date | undefined;
  for (let i = 0; i < 200; i++) {
    const chunk = await pageMessages(db, userId, { before, limit: 500 });
    if (chunk.length === 0) break;
    messages.unshift(...chunk);
    before = chunk[0].createdAt;
    if (chunk.length < 500) break;
  }
  const photoIds = messages.filter((m) => m.kind === "photo").map((m) => m.id);
  const media = await mediaForMessages(db, userId, photoIds);

  const messagesByDate = new Map<string, Message[]>();
  for (const m of messages) {
    const arr = messagesByDate.get(m.localDate) ?? [];
    arr.push(m);
    messagesByDate.set(m.localDate, arr);
  }

  const zip = new JSZip();
  const manifest: Record<string, { sha256: string; bytes: number }> = {};
  const add = (name: string, content: string) => {
    zip.file(name, content);
    manifest[name] = { sha256: createHash("sha256").update(content).digest("hex"), bytes: Buffer.byteLength(content) };
  };

  add("journal.json", JSON.stringify(messages.map((m) => ({ id: m.id, sender: m.sender, kind: m.kind, text: m.text, localDate: m.localDate, createdAt: m.createdAt, media: media.filter((x) => x.messageId === m.id).map((x) => ({ id: x.id, caption: x.aiCaption, placeHint: x.placeHint })) })), null, 2));
  add("memories.json", JSON.stringify(memories.map((m) => ({ date: m.localDate, title: m.title, reflection: m.reflection, mood: m.mood, moodLabel: m.moodLabel, highlights: m.highlights })), null, 2));
  add("story.md", buildStoryMarkdown({ name: profile?.name ?? null, memories, messagesByDate }));
  add("profile.json", JSON.stringify({ name: profile?.name, email: profile?.email, timezone: profile?.timezone, focus: profile?.focus, createdAt: profile?.createdAt }, null, 2));

  for (const m of media) {
    const bytes = await ports.blob.get(m.keyFull);
    if (!bytes) continue;
    const msg = messages.find((x) => x.id === m.messageId);
    const name = `photos/${msg?.localDate ?? "undated"}/${m.id}.jpg`;
    zip.file(name, Buffer.from(bytes));
    manifest[name] = { sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.byteLength };
  }
  zip.file("manifest.json", JSON.stringify({ exportedAt: ports.clock.now().toISOString(), files: manifest }, null, 2));

  const nodeStream = zip.generateNodeStream({ type: "nodebuffer", streamFiles: true });
  return Readable.toWeb(nodeStream as unknown as Readable) as unknown as ReadableStream<Uint8Array>;
}
