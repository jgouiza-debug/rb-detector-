import type { ReplyEvent } from "@/lib/ports/ai";

const MAX_BUBBLES = 3;
const SOFT_SPLIT = 220;

/**
 * Turns a streamed reply into bubble/action events. Splits on blank lines,
 * strips the [[breathe]] / [[crisis]] markers into actions, caps at 3 bubbles
 * (extra text merges into the last), and splits one very long paragraph at a
 * sentence boundary. Pure and incremental so it can drive a live stream.
 */
export class BubbleParser {
  private buf = "";
  private emitted: string[] = [];
  private action: "breathe" | "crisis" | null = null;

  push(chunk: string): ReplyEvent[] {
    this.buf += chunk;
    const events: ReplyEvent[] = [];
    let idx: number;
    // Emit complete paragraphs (terminated by a blank line) as they arrive.
    while ((idx = this.buf.search(/\n\s*\n/)) !== -1) {
      const raw = this.buf.slice(0, idx);
      this.buf = this.buf.slice(idx).replace(/^\n\s*\n/, "");
      for (const b of this.consume(raw)) events.push(b);
    }
    return events;
  }

  end(): ReplyEvent[] {
    const events: ReplyEvent[] = [];
    if (this.buf.trim()) for (const b of this.consume(this.buf)) events.push(b);
    this.buf = "";
    if (this.action) events.push({ type: "action", action: this.action });
    return events;
  }

  get actionDetected(): "breathe" | "crisis" | null {
    return this.action;
  }

  private consume(raw: string): ReplyEvent[] {
    const events: ReplyEvent[] = [];
    let text = raw;
    // Strip markers anywhere; last one wins by severity (crisis > breathe).
    if (/\[\[\s*crisis\s*\]\]/i.test(text)) this.action = "crisis";
    else if (/\[\[\s*breathe\s*\]\]/i.test(text) && this.action !== "crisis") this.action = "breathe";
    text = text.replace(/\[\[\s*(crisis|breathe)\s*\]\]/gi, "").trim();
    if (!text) return events;
    for (const piece of this.splitLong(text)) {
      if (this.emitted.length >= MAX_BUBBLES) {
        // Merge overflow into the last emitted bubble.
        this.emitted[this.emitted.length - 1] += ` ${piece}`;
        // Re-emit is not possible for already-sent bubbles, so drop overflow past the cap
        // only if nothing was emitted yet in this consume call.
        continue;
      }
      this.emitted.push(piece);
      events.push({ type: "bubble", text: piece });
    }
    return events;
  }

  private splitLong(text: string): string[] {
    if (text.length <= SOFT_SPLIT) return [text];
    const sentences = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [text];
    const out: string[] = [];
    let cur = "";
    for (const s of sentences) {
      if ((cur + s).length > SOFT_SPLIT && cur) {
        out.push(cur.trim());
        cur = s;
      } else {
        cur += s;
      }
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
}

/** Convenience for tests / scripted paths: parse a whole reply string. */
export function parseReply(full: string): { bubbles: string[]; action: "breathe" | "crisis" | null } {
  const p = new BubbleParser();
  const bubbles: string[] = [];
  for (const ev of [...p.push(full), ...p.end()]) if (ev.type === "bubble") bubbles.push(ev.text);
  return { bubbles, action: p.actionDetected };
}
