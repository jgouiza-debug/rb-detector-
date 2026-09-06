import { describe, expect, it } from "vitest";
import { PIP_SYSTEM } from "@/lib/ai/prompts/companion";

// Rough token estimate (chars/4). Sonnet 5's minimum cacheable prefix is ~1024 tokens.
function estTokens(s: string): number {
  return Math.ceil(s.length / 4);
}

describe("companion system prompt", () => {
  it("clears Sonnet 5's 1024-token cache minimum", () => {
    expect(estTokens(PIP_SYSTEM)).toBeGreaterThan(1200);
  });
  it("is a stable frozen constant (byte-identical across imports)", async () => {
    const again = (await import("@/lib/ai/prompts/companion")).PIP_SYSTEM;
    expect(again).toBe(PIP_SYSTEM);
  });
  it("states the non-therapist boundary and the output contract", () => {
    expect(PIP_SYSTEM).toMatch(/not a therapist/i);
    expect(PIP_SYSTEM).toContain("[[breathe]]");
    expect(PIP_SYSTEM).toContain("[[crisis]]");
  });
});
