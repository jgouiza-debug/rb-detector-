/**
 * GAUNTLET CONFIG. Everything the gate needs to know about *this* product.
 * The rest of the harness is generic — see .claude/skills/ui-gauntlet/.
 */
import type { Page } from "@playwright/test";
import { palette as brandPalette } from "@/lib/theme/tokens";

/**
 * hex → token name, derived from the app's own palette so the two cannot drift.
 * A hand-typed second copy is exactly what went stale: it carried the pre-round-3
 * night-bubble-pip hex and was missing heavyTint entirely, so a real brand colour
 * scored as off-palette. camelCase keys become kebab token names to match the
 * gate's reports.
 */
function derivePalette(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, hex] of Object.entries(brandPalette)) {
    out[hex.toUpperCase()] = key
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
  }
  return out;
}

export interface GauntletConfig {
  viewport: { width: number; height: number };
  themeToggle: (page: Page, theme: "light" | "dark") => Promise<void>;
  type: { maxSizes: number; maxFamilies: number; maxWeights: number };
  palette: Record<string, string>;
  sealedNamespaces: string[];
  /**
   * Which palette tokens ARE the neutral family. 70/20/10 asks what share of the
   * screen is neutral ground versus accent, and that is a fact about the palette,
   * not something to infer from whichever colour happens to lead a given screen.
   * Inferring it by proximity-to-lead meant a white modal sheet and the warm page
   * behind it counted as two families, and the same two colours counted as one
   * family on every non-modal screen.
   */
  neutralTokens: string[];

  budgets: { fcp: number; cls: number; gridConformance: number };
  docs: { brand: string; spec: string; tasteBrief: string };
  fixtureAdapters: string[];
  productionAdapters: string[];
  allowedDeadEnds: { path: string; why: string }[];
}

export const config: GauntletConfig = {
  viewport: { width: 390, height: 844 },

  themeToggle: async (page, theme) => {
    if (theme === "dark")
      await page.addInitScript(() => localStorage.setItem("pip-theme", "dark"));
  },

  // Two families (Newsreader for display + reading, Inter for UI), which is what
  // brand-guidelines §7 mandates after the round 8 type rework.
  type: { maxSizes: 6, maxFamilies: 2, maxWeights: 3 },

  palette: derivePalette(),

  // --text-* was sealed from the start; --font-* was not, which is how a third
  // family shipped inside a modal for nine rounds. --radius-* is next: six
  // distinct radii currently render against a three-rung ladder.
  sealedNamespaces: ["--text-", "--font-", "--radius-"],

  /**
   * Which palette tokens ARE the neutral family. 70/20/10 asks what share of the
   * screen is neutral ground versus accent, and that is a fact about the palette,
   * not something to infer from whichever colour happens to lead a given screen.
   * Inferring it by proximity-to-lead meant a white modal sheet and the warm page
   * behind it counted as two families, and the same two colours counted as one
   * family on every non-modal screen.
   */
  neutralTokens: [
    "cream",
    "surface",
    "pip-bubble",
    "line",
    "ink",
    "ink-soft",
    "night",
    "night-raised",
    "night-text",
    "night-soft",
    "night-line",
    "night-bubble-pip",
  ],

  budgets: { fcp: 1800, cls: 0.1, gridConformance: 0.9 },

  docs: {
    brand: "docs/handoff/02-brand-guidelines.md",
    spec: "docs/handoff/03-design-spec.md",
    tasteBrief: "gauntlet/taste-brief.md",
  },

  // The gate runs offline, so every keepsake, title and reflection on screen is
  // deterministic stub output. The council spent eight rounds critiquing its
  // cadence before anyone noticed it is not what ships.
  fixtureAdapters: ["lib/adapters/ai/scripted.ts"],
  productionAdapters: [
    "lib/adapters/ai/anthropic.ts",
    "lib/ai/prompts/synthesis.ts",
  ],

  allowedDeadEnds: [
    {
      path: "/",
      why: "Redirect only — resolves to /welcome or /thread and renders nothing of its own.",
    },
    {
      path: "/dev/checkout",
      why: "Developer tooling, not reachable in a shipped build.",
    },
    {
      path: "/dev/gallery",
      why: "Developer tooling, not reachable in a shipped build.",
    },
    {
      path: "/dev/portal",
      why: "Developer tooling, not reachable in a shipped build.",
    },
  ],
};
