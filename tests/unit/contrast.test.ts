import { describe, expect, it } from "vitest";
import { contrastRatio, thresholds } from "@/lib/theme/contrast";
import { allowedPairs, forbiddenTextPairs, moodTokens } from "@/lib/theme/tokens";

describe("brand contrast (WCAG AA)", () => {
  for (const p of allowedPairs) {
    it(`${p.name} >= ${thresholds[p.role]}:1 (${p.role})`, () => {
      expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(thresholds[p.role]);
    });
  }
  for (const p of forbiddenTextPairs) {
    it(`${p.name} is NOT body-text safe (so the UI must never use it for text)`, () => {
      expect(contrastRatio(p.fg, p.bg)).toBeLessThan(thresholds.body);
    });
  }
  it("every mood pill text and mood accent text pass AA", () => {
    for (const [mood, t] of Object.entries(moodTokens)) {
      // Label text sits ON the pill (t.fg = ink) and must pass body 4.5.
      expect(contrastRatio(t.fg, t.bg), `${mood} pill text on pill`).toBeGreaterThanOrEqual(4.5);
      // The mood accent (t.ink) is used for text on cream and must pass body 4.5.
      expect(contrastRatio(t.ink, "#FFF9ED"), `${mood} accent on cream`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
