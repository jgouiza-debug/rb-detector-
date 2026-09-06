import { describe, expect, it } from "vitest";
import { BubbleParser, parseReply } from "@/lib/ai/bubbles";

describe("bubble parser", () => {
  it("splits on blank lines into separate bubbles", () => {
    const { bubbles, action } = parseReply("that sounds heavy.\n\ndo you want to talk about it?");
    expect(bubbles).toEqual(["that sounds heavy.", "do you want to talk about it?"]);
    expect(action).toBeNull();
  });

  it("strips the [[breathe]] marker into an action", () => {
    const { bubbles, action } = parseReply("that's a lot.\n\nlet's slow down.\n\n[[breathe]]");
    expect(bubbles).toEqual(["that's a lot.", "let's slow down."]);
    expect(action).toBe("breathe");
  });

  it("strips [[crisis]] and crisis wins over breathe", () => {
    const { action } = parseReply("i'm worried about you.\n\n[[crisis]]");
    expect(action).toBe("crisis");
  });

  it("caps at three bubbles", () => {
    const { bubbles } = parseReply("one\n\ntwo\n\nthree\n\nfour\n\nfive");
    expect(bubbles.length).toBeLessThanOrEqual(3);
  });

  it("emits incrementally across streamed chunks", () => {
    const p = new BubbleParser();
    const out: string[] = [];
    for (const ev of p.push("first bubble\n")) if (ev.type === "bubble") out.push(ev.text);
    for (const ev of p.push("\nsecond ")) if (ev.type === "bubble") out.push(ev.text);
    for (const ev of p.push("bubble")) if (ev.type === "bubble") out.push(ev.text);
    for (const ev of p.end()) if (ev.type === "bubble") out.push(ev.text);
    expect(out).toEqual(["first bubble", "second bubble"]);
  });

  it("splits a single very long paragraph at a sentence boundary", () => {
    const long = "First sentence is here. " + "x".repeat(210) + ". Final part.";
    const { bubbles } = parseReply(long);
    expect(bubbles.length).toBeGreaterThan(1);
  });
});
