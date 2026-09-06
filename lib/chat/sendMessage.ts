import "server-only";
import { getDb, withTx } from "@/lib/db/client";
import { getEntitlement } from "@/lib/billing/entitlements";
import { attachMediaToMessage, countUserEntriesForDate, insertMessage, recentTurns } from "@/lib/db/repo/messages";
import { mediaForMessages } from "@/lib/db/repo/media";
import { getMedia } from "@/lib/db/repo/media";
import { getMemory } from "@/lib/db/repo/memories";
import { getProfile, updateProfile } from "@/lib/db/repo/profiles";
import { recordSafetyEvent } from "@/lib/db/repo/safety";
import { bumpUsage, getDailyUsage, getGlobalUsage } from "@/lib/db/repo/usage";
import { getEnv } from "@/lib/env";
import { buildHistory, type RawTurn } from "@/lib/ai/context";
import { getPorts } from "@/lib/ports";
import type { CompanionInput, MoodTag } from "@/lib/ports/ai";
import { evaluateSafety } from "@/lib/safety/gate";
import { CRISIS_BUBBLES, CRISIS_CARD_FOOTER } from "@/lib/safety/templates";
import { CRISIS_RESOURCES, EMERGENCY_NOTE } from "@/lib/safety/resources";
import { localParts } from "@/lib/time/local";
import { newId } from "@/lib/util/ids";

export type ChatEvent =
  | { type: "saved"; messageId: string; localDate: string }
  | { type: "bubble"; id: string; text: string; index: number; groupId: string }
  | { type: "action"; action: "breathe" }
  | { type: "crisis"; card: { bubbles: string[]; resources: typeof CRISIS_RESOURCES; footer: string; emergency: string } }
  | { type: "done" }
  | { type: "error"; code: string; message?: string };

export interface SendInput {
  userId: string;
  text: string;
  clientId: string;
  mediaIds: string[];
  signal?: AbortSignal;
}

const RESTING_BUBBLE = "i'm going to rest my voice until tomorrow, but keep writing — i'm saving every word.";
const FALLBACK_BUBBLE = "give me a sec, i got a little tangled. say that again?";
const CARE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function* sendMessage(input: SendInput): AsyncIterable<ChatEvent> {
  const ports = getPorts();
  const env = getEnv();
  const db = await getDb();
  const now = ports.clock.now();

  const profile = await getProfile(db, input.userId);
  if (!profile) {
    yield { type: "error", code: "no_profile" };
    return;
  }
  const tz = profile.timezone || "UTC";
  const local = localParts(now, tz);
  const localDate = local.date;

  const text = input.text.slice(0, 4000);
  const mediaIds = input.mediaIds.slice(0, 6);

  // Validate media ownership before anything else.
  for (const id of mediaIds) {
    const m = await getMedia(db, input.userId, id);
    if (!m) {
      yield { type: "error", code: "bad_media" };
      return;
    }
  }

  // ── Capture BEFORE any AI call (idempotent on clientId) ──
  const userMessage = await withTx(async (tx) => {
    const msg = await insertMessage(tx, {
      userId: input.userId,
      sender: "user",
      kind: mediaIds.length ? "photo" : "text",
      text,
      clientId: input.clientId,
      localDate,
      meta: mediaIds.length ? { mediaIds } : {},
    });
    if (mediaIds.length) await attachMediaToMessage(tx, input.userId, msg.id, mediaIds);
    return msg;
  });
  yield { type: "saved", messageId: userMessage.id, localDate };

  // ── Safety gate FIRST: life-safety is never gated behind a usage cap ──
  const recent = (await recentTurns(db, input.userId, 6)).filter((m) => m.sender === "user").slice(-3).map((m) => m.text);
  const safety = await evaluateSafety(ports.ai, { text, recent });
  if (safety.verdict === "crisis") {
    // Surface the crisis bubbles + resources no matter what — a persistence
    // failure must never hide life-safety resources from the person.
    try {
      await withTx(async (tx) => {
        const gid = newId();
        let i = 0;
        for (const b of CRISIS_BUBBLES) {
          await insertMessage(tx, { userId: input.userId, sender: "pip", kind: "text", text: b, groupId: gid, localDate, safetyLevel: "crisis", meta: { bubbleIndex: i, bubbleCount: CRISIS_BUBBLES.length } });
          i++;
        }
        await insertMessage(tx, { userId: input.userId, sender: "system", kind: "crisis", text: "crisis resources", localDate, safetyLevel: "crisis" });
        await updateProfile(tx, input.userId, { careModeUntil: new Date(now.getTime() + CARE_WINDOW_MS) });
        await recordSafetyEvent(tx, { userId: input.userId, messageId: userMessage.id, tier: safety.tier, verdict: "crisis", source: safety.source });
      });
    } catch {
      /* Resources still surface below even if logging/care-mode persistence failed. */
    }
    let idx = 0;
    for (const b of CRISIS_BUBBLES) yield { type: "bubble", id: newId(), text: b, index: idx++, groupId: "crisis" };
    yield { type: "crisis", card: { bubbles: [...CRISIS_BUBBLES], resources: CRISIS_RESOURCES, footer: CRISIS_CARD_FOOTER, emergency: EMERGENCY_NOTE } };
    yield { type: "done" };
    return;
  }

  // ── Caps (only gate the generative reply; safety has already been handled) ──
  const ent = await getEntitlement(db, input.userId, now);
  const daily = await getDailyUsage(db, input.userId, localDate);
  const global = await getGlobalUsage(db, localDate);
  const perUserCap = ent.plan === "plus" ? env.caps.replyPlus : env.caps.replyFree;
  if (daily.replies >= perUserCap || global.replies >= env.caps.globalReply) {
    const gid = newId();
    await insertMessage(db, { userId: input.userId, sender: "pip", kind: "text", text: RESTING_BUBBLE, groupId: gid, localDate });
    yield { type: "bubble", id: newId(), text: RESTING_BUBBLE, index: 0, groupId: gid };
    yield { type: "done" };
    return;
  }

  // ── Normal / concern path ──
  const careMode = !!profile.careModeUntil && profile.careModeUntil.getTime() > now.getTime();
  const yMood = await getMemory(db, input.userId, prevDate(localDate));
  const rawTurns: RawTurn[] = (await recentTurns(db, input.userId, 40)).map((m) => ({ id: m.id, role: m.sender === "pip" ? "assistant" : "user", kind: m.kind, text: m.text }));
  // Attach captions for photo turns (best-effort).
  const photoIds = (await recentTurns(db, input.userId, 40)).filter((m) => m.kind === "photo").map((m) => m.id);
  const photoMedia = await mediaForMessages(db, input.userId, photoIds);
  for (const t of rawTurns) {
    if (t.kind === "photo") {
      const m = photoMedia.find((pm) => pm.messageId === t.id);
      t.caption = m?.aiCaption ?? null;
    }
  }
  const { history } = buildHistory(rawTurns);
  const todayCount = await countUserEntriesForDate(db, input.userId, localDate);

  const images: CompanionInput["images"] = [];
  for (const id of mediaIds.slice(0, 2)) {
    const m = await getMedia(db, input.userId, id);
    if (!m) continue;
    const bytes = await ports.blob.get(m.keyThumb);
    if (bytes) images.push({ bytes, mediaType: "image/jpeg" });
  }

  const companionInput: CompanionInput = {
    userName: profile.name ?? "",
    focus: profile.focus,
    local: { weekday: local.weekday, hhmm: local.hhmm, dayPart: local.dayPart },
    careMode,
    concern: safety.verdict === "concern",
    todayEntryCount: todayCount,
    yesterdayMood: (yMood?.mood as MoodTag | undefined) ?? null,
    history,
    userText: text,
    images,
  };

  const groupId = newId();
  const persisted: { text: string; index: number }[] = [];
  let index = 0;
  let sawError = false;
  let breatheOffered = false;

  try {
    for await (const ev of ports.ai.reply(companionInput, { signal: input.signal })) {
      if (ev.type === "bubble") {
        const bubbleText = ev.text.trim();
        if (!bubbleText) continue;
        // Persist each bubble as it completes so a dropped stream keeps what was produced.
        await insertMessage(db, { userId: input.userId, sender: "pip", kind: "text", text: bubbleText, groupId, localDate, meta: { bubbleIndex: index } });
        persisted.push({ text: bubbleText, index });
        yield { type: "bubble", id: newId(), text: bubbleText, index, groupId };
        index++;
      } else if (ev.type === "action" && ev.action === "breathe") {
        if (!careMode && !breatheOffered) {
          breatheOffered = true;
          await insertMessage(db, { userId: input.userId, sender: "pip", kind: "pause_offer", text: "want to slow down for a sec?", groupId, localDate, meta: { action: "breathe" } });
          yield { type: "action", action: "breathe" };
        }
      } else if (ev.type === "action" && ev.action === "crisis") {
        await withTx(async (tx) => {
          await insertMessage(tx, { userId: input.userId, sender: "system", kind: "crisis", text: "crisis resources", localDate, safetyLevel: "crisis" });
          await updateProfile(tx, input.userId, { careModeUntil: new Date(now.getTime() + CARE_WINDOW_MS) });
          await recordSafetyEvent(tx, { userId: input.userId, messageId: userMessage.id, tier: 3, verdict: "crisis", source: "model_marker" });
        });
        yield { type: "crisis", card: { bubbles: [...CRISIS_BUBBLES], resources: CRISIS_RESOURCES, footer: CRISIS_CARD_FOOTER, emergency: EMERGENCY_NOTE } };
      } else if (ev.type === "done") {
        await bumpUsage(db, input.userId, localDate, { replies: 1, tokensIn: ev.usage.inputTokens, tokensOut: ev.usage.outputTokens });
        console.log(`ai.reply user=${input.userId} in=${ev.usage.inputTokens} out=${ev.usage.outputTokens} cache_read=${ev.usage.cacheReadTokens}`);
      }
    }
  } catch {
    sawError = true;
  }

  if (persisted.length === 0) {
    const gid = newId();
    await insertMessage(db, { userId: input.userId, sender: "pip", kind: "text", text: FALLBACK_BUBBLE, groupId: gid, localDate });
    yield { type: "bubble", id: newId(), text: FALLBACK_BUBBLE, index: 0, groupId: gid };
    if (sawError) yield { type: "error", code: "ai_error" };
  }
  yield { type: "done" };
}

function prevDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d - 1));
  return dt.toISOString().slice(0, 10);
}
