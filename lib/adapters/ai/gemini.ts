import "server-only";
import { GoogleAuth } from "google-auth-library";
import { getEnv } from "@/lib/env";
import { BubbleParser } from "@/lib/ai/bubbles";
import { CAPTION_INSTRUCTION } from "@/lib/ai/prompts/caption";
import { PIP_SYSTEM, volatileContext } from "@/lib/ai/prompts/companion";
import { RISK_SYSTEM } from "@/lib/ai/prompts/risk";
import { synthesisSystem } from "@/lib/ai/prompts/synthesis";
import { CaptionSchema, DaySynthesisSchema, RiskSchema, clampCaption, clampSynthesis } from "@/lib/ai/schemas";
import type { AiPort, AiUsage, CompanionInput, DayInput, DaySynthesis, MoodTag, PhotoCaption, ReplyEvent, RiskVerdict } from "@/lib/ports/ai";

// Pip's brain on Gemini via Vertex. Everything provider-neutral (prompts, the
// bubble parser, the zod schemas) is reused verbatim; only the transport is here.
// Vertex's safety filters are set as permissive as allowed so Pip can hold heavy
// content — the deterministic gate in lib/safety/gate.ts stays the real guardrail.

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
interface GeminiChunk {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

const SAFETY = ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"].map((category) => ({ category, threshold: "BLOCK_NONE" }));

let auth: GoogleAuth | null = null;
function googleAuth(): GoogleAuth {
  if (auth) return auth;
  const inline = getEnv().ai.googleCredentialsJson;
  auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    // Inline JSON for Vercel; otherwise GoogleAuth reads GOOGLE_APPLICATION_CREDENTIALS (a file path).
    ...(inline ? { credentials: JSON.parse(inline) as Record<string, unknown> } : {}),
  });
  return auth;
}

async function accessToken(): Promise<string> {
  const token = await (await googleAuth().getClient()).getAccessToken();
  if (!token.token) throw new Error("vertex: could not mint an access token");
  return token.token;
}

function modelUrl(): string {
  const { vertexProject, vertexLocation, geminiModel } = getEnv().ai;
  return `https://${vertexLocation}-aiplatform.googleapis.com/v1/projects/${vertexProject}/locations/${vertexLocation}/publishers/google/models/${geminiModel}`;
}

function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function textOf(chunk: GeminiChunk): string {
  return (chunk.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
}

async function* sseData(res: Response): AsyncIterable<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line.startsWith("data:")) yield line.slice(5).trim();
    }
  }
  const tail = buf.trim();
  if (tail.startsWith("data:")) yield tail.slice(5).trim();
}

/** One-shot JSON generation for the structured calls (risk, caption, synthesis). */
async function generateJson(systemText: string | null, parts: Part[], timeoutMs?: number): Promise<unknown> {
  const token = await accessToken();
  const ac = new AbortController();
  const timer = timeoutMs ? setTimeout(() => ac.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${modelUrl()}:generateContent`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 700, temperature: 0.4 },
        safetySettings: SAFETY,
      }),
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`vertex generateContent ${res.status}`);
    return JSON.parse(textOf((await res.json()) as GeminiChunk));
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const FALLBACK_BUBBLE = "give me a sec, i got a little tangled. say that again?";

export function geminiAi(): AiPort {
  return {
    async *reply(input: CompanionInput, opts): AsyncIterable<ReplyEvent> {
      const ctx = volatileContext(input);
      const imageParts: Part[] = input.images.slice(0, 2).map((im) => ({ inlineData: { mimeType: im.mediaType, data: toB64(im.bytes) } }));
      // Gemini roles are user|model and must alternate; if history ends on a user
      // turn, fold the new message into it instead of stacking two user turns.
      const contents: { role: "user" | "model"; parts: Part[] }[] = input.history.map((h) => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] }));
      const tailParts: Part[] = [...imageParts, { text: `${ctx}\n\n${input.userText}` }];
      const last = contents[contents.length - 1];
      if (last && last.role === "user") last.parts.push(...tailParts);
      else contents.push({ role: "user", parts: tailParts });

      const parser = new BubbleParser();
      let usage: AiUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
      let produced = 0;
      try {
        const token = await accessToken();
        const res = await fetch(`${modelUrl()}:streamGenerateContent?alt=sse`, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: PIP_SYSTEM }] },
            contents,
            generationConfig: { maxOutputTokens: 400, temperature: 0.9 },
            safetySettings: SAFETY,
          }),
          signal: opts?.signal,
        });
        if (!res.ok || !res.body) throw new Error(`vertex streamGenerateContent ${res.status}`);
        for await (const data of sseData(res)) {
          if (!data || data === "[DONE]") continue;
          let chunk: GeminiChunk;
          try {
            chunk = JSON.parse(data) as GeminiChunk;
          } catch {
            continue;
          }
          const text = textOf(chunk);
          if (text) for (const out of parser.push(text)) { if (out.type === "bubble") produced++; yield out; }
          if (chunk.usageMetadata) usage = { inputTokens: chunk.usageMetadata.promptTokenCount ?? 0, outputTokens: chunk.usageMetadata.candidatesTokenCount ?? 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
        }
        for (const out of parser.end()) { if (out.type === "bubble") produced++; yield out; }
      } catch {
        if (produced === 0) yield { type: "bubble", text: FALLBACK_BUBBLE };
      }
      yield { type: "done", usage };
    },

    async classifyRisk({ text, recent }, opts): Promise<RiskVerdict> {
      const raw = await generateJson(RISK_SYSTEM, [{ text: `recent context:\n${recent.join("\n")}\n\nlatest message:\n${text}` }], opts.timeoutMs);
      const parsed = RiskSchema.safeParse(raw);
      if (!parsed.success) throw new Error("risk classifier returned no structured output");
      const out = parsed.data;
      return { risk: out.risk, confidence: Math.max(0, Math.min(1, out.confidence)), reason: out.reason.slice(0, 200) };
    },

    async captionPhoto({ bytes, mediaType }): Promise<PhotoCaption | null> {
      try {
        const raw = await generateJson(null, [{ inlineData: { mimeType: mediaType, data: toB64(bytes) } }, { text: CAPTION_INSTRUCTION }]);
        const parsed = CaptionSchema.safeParse(raw);
        return parsed.success ? clampCaption(parsed.data) : null;
      } catch {
        return null;
      }
    },

    async synthesizeDay(input: DayInput): Promise<DaySynthesis | null> {
      const body = input.entries
        .map((e) => `${e.time} — ${e.text}${e.captions.length ? ` (photos: ${e.captions.join("; ")})` : ""}`)
        .join("\n")
        .slice(0, 24_000);
      try {
        const raw = await generateJson(synthesisSystem(input.careMode), [{ text: `Date: ${input.weekday}, ${input.localDate}. Name: ${input.userName}.\n\nMessages:\n${body}` }]);
        const parsed = DaySynthesisSchema.safeParse(raw);
        if (!parsed.success) return null;
        const c = clampSynthesis(parsed.data);
        return { ...c, mood: c.mood as MoodTag };
      } catch {
        return null;
      }
    },
  };
}
