/**
 * GAUNTLET CONFIG. Copy to `gauntlet/config.ts` in the target repo and fill in.
 * Everything the gate needs to know about *this* product lives here; the rest of
 * the system is generic.
 *
 * Set the numbers from the project's own brand book, not from taste. If the
 * brand mandates three type families, `maxFamilies` is 3 — the gate enforces the
 * project's discipline, it does not impose its own.
 */
import type { Page } from "@playwright/test";

export interface GauntletConfig {
  /** The device the product is judged on. Judge the primary target, not a desktop. */
  viewport: { width: number; height: number };

  /** How the runner forces dark mode before the page loads. */
  themeToggle: (page: Page, theme: "light" | "dark") => Promise<void>;

  /** Declared type discipline. The gate fails a screen that exceeds any of these. */
  type: { maxSizes: number; maxFamilies: number; maxWeights: number };

  /**
   * hex → token name, so reports read `honey` rather than `#F5B841`. Include the
   * dark-mode half; a palette with no dark entries silently reports every dark
   * screen as off-brand.
   */
  palette: Record<string, string>;

  /**
   * Design-token namespaces the project claims to fully control. Preflight
   * asserts each is reset to `initial` in the stylesheet, so a framework default
   * cannot resolve behind the system's back.
   *
   * This check exists because a project sealed `--text-*` and not `--font-*`,
   * and shipped a third font family for nine rounds inside a modal the screen
   * list never opened.
   */
  sealedNamespaces: string[];

  /**
   * Which palette tokens ARE the neutral family, for the 70/20/10 check. This is
   * a fact about the palette, so declare it; inferring it from whichever colour
   * leads a given screen makes the answer change per screen, and splits a modal
   * sheet from the page behind it into two families that are really one.
   */
  neutralTokens: string[];

  budgets: {
    /** Max first contentful paint, ms. */
    fcp: number;
    /** Max cumulative layout shift. */
    cls: number;
    /** Minimum share of measured spacing landing on the 8pt grid, 0–1. */
    gridConformance: number;
  };

  /** Product truth the council may read. Paths relative to the repo root. */
  docs: { brand: string; spec: string; tasteBrief: string };

  /**
   * Modules that generate user-visible CONTENT. When the gate runs against the
   * fixture set, generated copy on every screen is a test double and must not be
   * scored as the product's voice.
   *
   * Preflight compares which is live under the gate's env and stamps a FIXTURE
   * CONTENT banner into the gate report and every advisor prompt.
   *
   * Leave both empty only if the product renders no generated content at all.
   */
  fixtureAdapters: string[];
  productionAdapters: string[];

  /**
   * Routes that are allowed to have no forward navigation. Each needs a written
   * reason. A terminal screen is still a dead end under the rubric unless the
   * product genuinely ends there — and "the account was deleted" is a reason to
   * offer a way out, not a reason to omit one.
   */
  allowedDeadEnds: { path: string; why: string }[];
}

export const config: GauntletConfig = {
  viewport: { width: 390, height: 844 },

  themeToggle: async (page, theme) => {
    if (theme === "dark")
      await page.addInitScript(() => localStorage.setItem("app-theme", "dark"));
  },

  type: { maxSizes: 6, maxFamilies: 2, maxWeights: 3 },

  palette: {
    "#FFFFFF": "surface",
    "#000000": "ink",
  },

  sealedNamespaces: ["--text-", "--font-", "--radius-"],

  neutralTokens: ["surface", "ink"],

  budgets: { fcp: 1800, cls: 0.1, gridConformance: 0.9 },

  docs: {
    brand: "docs/brand-guidelines.md",
    spec: "docs/design-spec.md",
    tasteBrief: "gauntlet/taste-brief.md",
  },

  fixtureAdapters: [],
  productionAdapters: [],

  allowedDeadEnds: [],
};
