/**
 * The key screens the gauntlet renders and measures every round. Order matters:
 * the run is one continuous session (anonymous user → onboarding → seeded data),
 * so later screens depend on the state earlier ones create.
 *
 * `primary` names the screen's single primary action for the thumb-zone check
 * (Tier A2). `setup` runs before the screen is captured.
 */
import type { Page } from "@playwright/test";

export interface Screen {
  id: string;
  path: string;
  /** Playwright selector for the primary action. */
  primary: string;
  /**
   * false when the "primary" is a navigation list / tab row rather than a CTA: the
   * ≥44px rule still applies, the thumb-zone rule is reported as n/a.
   */
  thumbZone?: boolean;
  /** Screens whose main content sits inside a scrolling container get full-page shots too. */
  fullPage?: boolean;
  setup?: (page: Page) => Promise<void>;
  /** Wait for this locator before measuring. */
  ready?: string;
  /** Capture the state `setup` left behind instead of reloading `path` (client-only state). */
  noReload?: boolean;
}

export function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function settle(page: Page, ms = 800): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(ms);
}

export const SCREENS: Screen[] = [
  {
    id: "onboarding-welcome",
    path: "/welcome",
    primary: "button:has-text('hey pip')",
  },
  {
    id: "onboarding-name",
    path: "/name",
    primary: "button:has-text('continue')",
    setup: async (page) => {
      // Start the anonymous session the way the welcome button does.
      await page.goto("/welcome");
      await page.getByRole("button", { name: /hey pip/i }).click();
      await page.waitForURL("**/name");
    },
  },
  {
    id: "onboarding-focus",
    path: "/focus",
    primary: "button:has-text('continue')",
    setup: async (page) => {
      await page.goto("/name");
      await page.getByLabel("your name").fill("Sam");
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForURL("**/focus");
    },
  },
  {
    id: "onboarding-rhythm",
    path: "/rhythm",
    primary: "button:has-text('set my rhythm')",
    setup: async (page) => {
      await page.goto("/focus");
      await page.getByRole("checkbox", { name: "processing a lot" }).click();
      await page.getByRole("button", { name: /^continue$/i }).click();
      await page.waitForURL("**/rhythm");
    },
  },
  {
    id: "onboarding-notify",
    path: "/notify",
    primary: "button:has-text('yes, gently check in')",
    setup: async (page) => {
      await page.goto("/rhythm");
      await page.getByRole("button", { name: /skip for now/i }).click();
      await page.waitForURL("**/notify");
    },
  },
  {
    id: "thread",
    path: "/thread",
    primary: "button[aria-label='speak a thought'], button[aria-label='send']",
    ready: "[role='log']",
    setup: async (page) => {
      await page.goto("/notify");
      await page.getByRole("button", { name: /not now/i }).click();
      await page.waitForURL("**/thread");
      // Seed ten days of history FIRST so today's real conversation is the newest
      // thing in the thread (seeded rows carry older local dates but fresh timestamps).
      await page.request.post("/api/dev/seed", { data: { days: 10 } });
      await page.goto("/thread");
      await settle(page, 400);
      const box = page.getByLabel("message pip");
      await box.fill("today was a lot honestly. work was heavy and i didn't stop once");
      await page.getByRole("button", { name: "send" }).click();
      await page.waitForTimeout(2500);
      await box.fill("but i made it through, and i'm home now");
      await page.getByRole("button", { name: "send" }).click();
      await page.waitForTimeout(3500);
      // Wrap up today so the timeline has a payoff to show.
      await page.request.post("/api/synthesize", {});
    },
  },
  {
    id: "timeline",
    path: "/timeline",
    // The payoff action: opening the freshest memory.
    primary: "a[href^='/memory/']",
    fullPage: true,
    ready: "h1:has-text('Your Story')",
    setup: async (page) => {
      await page.goto("/timeline");
      await page.waitForSelector("text=/today's keepsake/i", { timeout: 20_000 }).catch(() => {});
    },
  },
  {
    id: "memory-card",
    path: `/memory/${isoDaysAgo(1)}`,
    primary: "[role='tab']:has-text('Keepsake Card')",
    thumbZone: false,
    fullPage: true,
    ready: "[role='tab']",
  },
  {
    id: "memory-locked-paywall",
    path: `/memory/${isoDaysAgo(9)}`,
    primary: "button:has-text('Unlock with Pip+')",
    ready: "section[aria-label='unlock pip+']",
  },
  {
    id: "meditation-pause",
    path: "/pause",
    primary: "button:has-text('i feel ready')",
    ready: "h1",
  },
  {
    id: "settings",
    path: "/settings",
    primary: "a[href='/settings/account']",
    thumbZone: false,
    ready: "h1:has-text('settings')",
  },
  {
    id: "settings-subscription",
    path: "/settings/subscription",
    primary: "button:has-text('upgrade to Pip+')",
    ready: "h1:has-text('subscription')",
  },
  {
    id: "help",
    path: "/help",
    primary: "a[href^='tel:']",
    fullPage: true,
    ready: "h1",
  },
  {
    id: "thread-crisis",
    path: "/thread",
    primary: "a[href^='tel:']",
    ready: "[role='group']",
    noReload: true,
    setup: async (page) => {
      await page.goto("/thread");
      await settle(page, 400);
      await page.getByLabel("message pip").fill("i want to kill myself");
      await page.getByRole("button", { name: "send" }).click();
      await page.waitForSelector("[role='group']", { timeout: 15_000 });
      await page.waitForTimeout(1200);
    },
  },
];

/** Screens re-rendered in dark mode (a subset: the ones users live in). */
export const DARK_SCREENS = new Set(["onboarding-welcome", "thread", "timeline", "memory-card", "meditation-pause", "settings", "memory-locked-paywall"]);
