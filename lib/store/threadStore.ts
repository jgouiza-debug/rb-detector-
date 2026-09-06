"use client";
import { create } from "zustand";
import type { MessageMeta } from "@/lib/db/schema";
import { readNdjson } from "@/lib/util/ndjsonClient";
import { dwellMs } from "@/lib/chat/grouping";

export interface UiMedia {
  id: string;
  captionStatus: "pending" | "done" | "failed";
  caption: string | null;
  sensitive: boolean;
  localUrl?: string;
}

export interface UiMessage {
  id: string;
  sender: "user" | "pip" | "system";
  kind: string;
  text: string;
  groupId: string | null;
  localDate: string;
  safetyLevel: "none" | "concern" | "crisis";
  meta: MessageMeta & { clientId?: string };
  createdAt: string;
  media: UiMedia[];
  status?: "pending" | "sent" | "failed";
  crisis?: CrisisCardData;
}

export interface CrisisCardData {
  bubbles: string[];
  resources: { region: string; name: string; detail: string; tel?: string; sms?: string; href?: string }[];
  footer: string;
  emergency: string;
}

interface ThreadState {
  messages: UiMessage[];
  typing: boolean;
  offerBreathe: boolean;
  setMessages: (m: UiMessage[]) => void;
  prepend: (m: UiMessage[]) => void;
  send: (input: { text: string; mediaIds: string[]; localMedia: UiMedia[]; localDate: string }) => Promise<void>;
  retry: (clientId: string) => Promise<void>;
  dismissBreathe: () => void;
  pollCaptions: () => Promise<void>;
}

let counter = 0;
function nextClientId(): string {
  counter += 1;
  return `c-${Date.now()}-${counter}`;
}

export const useThread = create<ThreadState>((set, get) => ({
  messages: [],
  typing: false,
  offerBreathe: false,
  setMessages: (m) => set({ messages: m }),
  prepend: (m) => set((s) => ({ messages: [...m, ...s.messages] })),
  dismissBreathe: () => set({ offerBreathe: false }),

  async send({ text, mediaIds, localMedia, localDate }) {
    const clientId = nextClientId();
    const optimistic: UiMessage = {
      id: clientId,
      sender: "user",
      kind: mediaIds.length ? "photo" : "text",
      text,
      groupId: null,
      localDate,
      safetyLevel: "none",
      meta: { clientId },
      createdAt: new Date().toISOString(),
      media: localMedia,
      status: "pending",
    };
    set((s) => ({ messages: [...s.messages, optimistic] }));
    await runSend(clientId, { text, mediaIds }, set, get);
  },

  async retry(clientId) {
    const msg = get().messages.find((m) => m.id === clientId || m.meta.clientId === clientId);
    if (!msg) return;
    const mediaIds = msg.media.map((m) => m.id);
    set((s) => ({ messages: s.messages.map((m) => (m === msg ? { ...m, status: "pending" } : m)) }));
    await runSend((msg.meta.clientId as string) ?? clientId, { text: msg.text, mediaIds }, set, get);
  },

  async pollCaptions() {
    const pending = get().messages.flatMap((m) => m.media.filter((x) => x.captionStatus === "pending").map((x) => x.id));
    for (const id of pending) {
      try {
        const res = await fetch(`/api/media/${id}?meta=1`);
        if (!res.ok) continue;
        const data = (await res.json()) as { captionStatus: UiMedia["captionStatus"]; caption: string | null; sensitive: boolean };
        if (data.captionStatus !== "pending") {
          set((s) => ({
            messages: s.messages.map((m) => ({ ...m, media: m.media.map((x) => (x.id === id ? { ...x, captionStatus: data.captionStatus, caption: data.caption, sensitive: data.sensitive } : x)) })),
          }));
        }
      } catch {
        /* ignore */
      }
    }
  },
}));

async function runSend(clientId: string, body: { text: string; mediaIds: string[] }, set: (fn: (s: ThreadState) => Partial<ThreadState>) => void, get: () => ThreadState) {
  try {
    const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId, ...body }) });
    if (!res.ok || !res.body) throw new Error("send failed");

    const queue: { id: string; text: string; groupId: string }[] = [];
    let sawSaved = false;

    for await (const ev of readNdjson<Record<string, unknown>>(res)) {
      const type = ev.type as string;
      if (type === "saved") {
        sawSaved = true;
        markSent(clientId, ev.messageId as string, ev.localDate as string, set);
        set(() => ({ typing: true }));
      } else if (type === "bubble") {
        queue.push({ id: ev.id as string, text: ev.text as string, groupId: ev.groupId as string });
      } else if (type === "action" && ev.action === "breathe") {
        set(() => ({ offerBreathe: true }));
      } else if (type === "crisis") {
        // Flush any queued bubbles first, then append the crisis card.
        await flushBubbles(queue, set, get);
        appendMessage(makeCrisisMessage(ev.card as CrisisCardData), set);
      } else if (type === "error") {
        // handled after loop
      }
    }
    await flushBubbles(queue, set, get);
    set(() => ({ typing: false }));
    if (!sawSaved) markFailed(clientId, set);
  } catch {
    markFailed(clientId, set);
    set(() => ({ typing: false }));
  }
}

async function flushBubbles(queue: { id: string; text: string; groupId: string }[], set: (fn: (s: ThreadState) => Partial<ThreadState>) => void, get: () => ThreadState) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  while (queue.length) {
    const b = queue.shift()!;
    if (!reduce) await new Promise((r) => setTimeout(r, dwellMs(b.text)));
    set(() => ({ typing: false }));
    appendPipBubble(b, set, get);
    if (queue.length && !reduce) set(() => ({ typing: true }));
  }
}

function appendPipBubble(b: { id: string; text: string; groupId: string }, set: (fn: (s: ThreadState) => Partial<ThreadState>) => void, get: () => ThreadState) {
  const now = new Date().toISOString();
  const last = get().messages[get().messages.length - 1];
  const localDate = last?.localDate ?? now.slice(0, 10);
  appendMessage({ id: b.id, sender: "pip", kind: "text", text: b.text, groupId: b.groupId, localDate, safetyLevel: "none", meta: {}, createdAt: now, media: [] }, set);
}

function appendMessage(m: UiMessage, set: (fn: (s: ThreadState) => Partial<ThreadState>) => void) {
  set((s) => ({ messages: [...s.messages, m] }));
}

function makeCrisisMessage(card: CrisisCardData): UiMessage {
  return { id: `crisis-${Date.now()}`, sender: "system", kind: "crisis", text: "", groupId: null, localDate: new Date().toISOString().slice(0, 10), safetyLevel: "crisis", meta: {}, createdAt: new Date().toISOString(), media: [], crisis: card };
}

function markSent(clientId: string, messageId: string, localDate: string, set: (fn: (s: ThreadState) => Partial<ThreadState>) => void) {
  set((s) => ({ messages: s.messages.map((m) => (m.id === clientId ? { ...m, id: messageId, localDate, status: "sent" } : m)) }));
}
function markFailed(clientId: string, set: (fn: (s: ThreadState) => Partial<ThreadState>) => void) {
  set((s) => ({ messages: s.messages.map((m) => (m.id === clientId || m.meta.clientId === clientId ? { ...m, status: "failed" } : m)) }));
}
