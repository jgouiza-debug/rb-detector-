/**
 * GAUNTLET CONFIG. Everything the gate needs to know about *this* product.
 * The rest of the harness is generic — see .claude/skills/ui-gauntlet/.
 */
import type { Page } from "@playwright/test";

export interface GauntletConfig {
  viewport: { width: number; height: number };
  themeToggle: (page: Page, theme: "light" | "dark") => Promise<void>;
  type: { maxSizes: number; maxFamilies: number; maxWeights: number };
  palette: Record<string, string>;
  sealedNamespaces: string[];
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

  palette: {
    "#FFDE7A": "sunlight",
    "#F5B841": "honey",
    "#B9791A": "amber-ink",
    "#82540F": "amber-deep",
    "#FFF9ED": "cream",
    "#2B2620": "ink",
    "#6B635A": "ink-soft",
    "#FFF3D1": "pip-bubble",
    "#FFCF4D": "user-bubble",
    "#EFE6D3": "line",
    "#8FC7D9": "sky",
    "#F3B7A6": "blush",
    "#A9C6A1": "sage",
    "#1C1A17": "night",
    "#26231F": "night-raised",
    "#F3ECDD": "night-text",
    "#C3B9A9": "night-soft",
    "#33302A": "night-bubble-pip",
    "#3A352E": "night-line",
    "#FFFFFF": "surface",
  },

  // --text-* was sealed from the start; --font-* was not, which is how a third
  // family shipped inside a modal for nine rounds. --radius-* is next: six
  // distinct radii currently render against a three-rung ladder.
  sealedNamespaces: ["--text-", "--font-"],

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
