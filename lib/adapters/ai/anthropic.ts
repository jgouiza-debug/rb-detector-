import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getEnv } from "@/lib/env";
import { BubbleParser } from "@/lib/ai/bubbles";
import { classifyAiError } from "@/lib/ai/errors";
import { CAPTION_INSTRUCTION } from "@/lib/ai/prompts/caption";
import { PIP_SYSTEM, volatileContext } from "@/lib/ai/prompts/companion";
import { RISK_SYSTEM } from "@/lib/ai/prompts/risk";
import { synthesisSystem } from "@/lib/ai/prompts/synthesis";
import { CaptionSchema, DaySynthesisSchema, RiskSchema, clampCaption, clampSynthesis } from "@/lib/ai/schemas";
import type { AiPort, AiUsage, CompanionInput, DayInput, DaySynthesis, MoodTag, PhotoCaption, ReplyEvent, RiskVerdict } from "@/lib/ports/ai";

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (client) return client;
  const key = getEnv().ai.apiKey;
  if (!key) throw new Error("ANTHROPIC_API_KEY is required for AI_PROVIDER=anthropic");
  client = new Anthropic({ apiKey: key });
  return client;
}

function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function usageOf(u: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null } | undefined): AiUsage {
  return {
    inputTokens: u?.input_tokens ?? 0,
    outputTokens: u?.output_tokens ?? 0,
    cacheReadTokens: u?.cache_read_input_tokens ?? 0,
    cacheWriteTokens: u?.cache_creation_input_tokens ?? 0,
  };
}

export function anthropicAi(): AiPort {
  const model = getEnv().ai.model;
  return {
    async *reply(input: CompanionInput, opts): AsyncIterable<ReplyEvent> {
      const imageBlocks = input.images.slice(0, 2).map((im) => ({
        type: "image" as const,
        source: { type: "base64" as const, media_type: im.mediaType, data: toB64(im.bytes) },
      }));
      const ctx = volatileContext(input);
      const history = input.history.map((h) => ({ role: h.role, content: h.text }));
      // Cache breakpoint on the last history turn keeps the prefix warm.
      const messages: Anthropic.MessageParam[] = [
        ...history.map((h, i) =>
          i === history.length - 1
            ? ({ role: h.role, content: [{ type: "text" as const, text: h.content, cache_control: { type: "ephemeral" as const } }] } as Anthropic.MessageParam)
            : ({ role: h.role, content: h.content } as Anthropic.MessageParam),
        ),
        { role: "user", content: [...imageBlocks, { type: "text", text: `${ctx}\n\n${input.userText}` }] },
      ];
      const parser = new BubbleParser();
      let usage: AiUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
      // Count bubbles actually delivered so a mid-stream failure never retries into
      // duplicates, and so the fallback only appears when nothing was shown.
      let produced = 0;
      const attempt = async function* (): AsyncIterable<ReplyEvent> {
        const stream = anthropic().messages.stream(
          {
            model,
            max_tokens: 300,
            thinking: { type: "adaptive" },
            output_config: { effort: "low" },
            system: [{ type: "text", text: PIP_SYSTEM, cache_control: { type: "ephemeral" } }],
            messages,
          } as Anthropic.MessageStreamParams,
          { signal: opts?.signal },
        );
        stream.on("text", () => {});
        // Drain text deltas through the parser.
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            for (const out of parser.push(ev.delta.text)) {
              if (out.type === "bubble") produced++;
              yield out;
            }
          }
        }
        const final = await stream.finalMessage();
        usage = usageOf(final.usage as never);
        for (const out of parser.end()) {
          if (out.type === "bubble") produced++;
          yield out;
        }
      };
      try {
        yield* attempt();
      } catch (e) {
        const err = classifyAiError(e);
        // Retry only when nothing was streamed yet; retrying after partial output
        // would re-emit the already-delivered bubbles.
        if (err.retryable && produced === 0) {
          await new Promise((r) => setTimeout(r, 800));
          try {
            const p2 = new BubbleParser();
            const stream = anthropic().messages.stream(
              { model, max_tokens: 300, thinking: { type: "adaptive" }, output_config: { effort: "low" }, system: [{ type: "text", text: PIP_SYSTEM, cache_control: { type: "ephemeral" } }], messages } as Anthropic.MessageStreamParams,
              { signal: opts?.signal },
            );
            for await (const ev of stream) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
                for (const out of p2.push(ev.delta.text)) {
                  if (out.type === "bubble") produced++;
                  yield out;
                }
            }
            const final = await stream.finalMessage();
            usage = usageOf(final.usage as never);
            for (const out of p2.end()) {
              if (out.type === "bubble") produced++;
              yield out;
            }
            yield { type: "done", usage };
            return;
          } catch {
            /* fall through to fallback bubble */
          }
        }
        // Keep any partial reply; only offer the fallback when nothing was delivered.
        if (produced === 0) yield { type: "bubble", text: "give me a sec, i got a little tangled. say that again?" };
      }
      yield { type: "done", usage };
    },

    async classifyRisk({ text, recent }, opts): Promise<RiskVerdict> {
      const res = await anthropic().messages.parse(
        {
          model,
          max_tokens: 200,
          thinking: { type: "adaptive" },
          output_config: { effort: "low", format: zodOutputFormat(RiskSchema) },
          system: RISK_SYSTEM,
          messages: [{ role: "user", content: `recent context:\n${recent.join("\n")}\n\nlatest message:\n${text}` }],
        } as never,
        { timeout: opts.timeoutMs },
      );
      const out = (res as { parsed_output: RiskVerdict | null }).parsed_output;
      if (!out) throw new Error("risk classifier returned no structured output");
      return { risk: out.risk, confidence: Math.max(0, Math.min(1, out.confidence)), reason: out.reason.slice(0, 200) };
    },

    async captionPhoto({ bytes, mediaType }): Promise<PhotoCaption | null> {
      try {
        const res = await anthropic().messages.parse({
          model,
          max_tokens: 200,
          thinking: { type: "adaptive" },
          output_config: { effort: "low", format: zodOutputFormat(CaptionSchema) },
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mediaType, data: toB64(bytes) } },
                { type: "text", text: CAPTION_INSTRUCTION },
              ],
            },
          ],
        });
        const out = (res as { parsed_output: PhotoCaption | null }).parsed_output;
        return out ? clampCaption(out) : null;
      } catch {
        return null;
      }
    },

    async synthesizeDay(input: DayInput): Promise<DaySynthesis | null> {
      const body = input.entries
        .map((e) => `${e.time} — ${e.text}${e.captions.length ? ` (photos: ${e.captions.join("; ")})` : ""}`)
        .join("\n")
        .slice(0, 24_000);
      const run = async (effort: "medium" | "high") => {
        const res = await anthropic().messages.parse({
          model,
          max_tokens: 700,
          thinking: { type: "adaptive" },
          output_config: { effort, format: zodOutputFormat(DaySynthesisSchema) },
          system: synthesisSystem(input.careMode),
          messages: [{ role: "user", content: `Date: ${input.weekday}, ${input.localDate}. Name: ${input.userName}.\n\nMessages:\n${body}` }],
        });
        return (res as { parsed_output: (DaySynthesis & { mood: string }) | null }).parsed_output;
      };
      try {
        const out = (await run("medium")) ?? (await run("high"));
        if (!out) return null;
        const c = clampSynthesis({ ...out, mood: out.mood });
        return { ...c, mood: c.mood as MoodTag };
      } catch {
        return null;
      }
    },
  };
}
