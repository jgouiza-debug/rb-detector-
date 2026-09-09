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
  /**
   * Component basenames whose dialog/sheet state this screen renders. Preflight
   * uses these to prove every modal in the tree is measured by something; a
   * modal no screen opens is a modal the gate cannot see, which is how a third
   * font family shipped past nine consecutive type gates.
   */
  opens?: string[];
  /**
   * Undo anything `setup` left on the shared page. The run is one continuous
   * session, so a route override or an open dialog outlives its own screen and
   * silently corrupts every screen after it.
   */
  teardown?: (page: Page) => Promise<void>;
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
      await box.fill(
        "today was a lot honestly. work was heavy and i didn't stop once",
      );
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
    // The composer holding an attached photo. Round 4 shipped a 20px remove control
    // here for four rounds because no gated screen ever entered this state.
    id: "thread-composing-photo",
    path: "/thread",
    primary: "button[aria-label='send']",
    ready: "img[alt='']",
    noReload: true,
    setup: async (page) => {
      await page.goto("/thread");
      await settle(page, 400);
      await page.setInputFiles(
        "input[type='file']",
        "tests/e2e/fixtures/photo.jpg",
      );
      await page.waitForSelector("button[aria-label='remove photo']", {
        timeout: 15_000,
      });
      await page
        .getByLabel("message pip")
        .fill("this was the light this afternoon");
      await page.waitForTimeout(1200);
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
      await page
        .waitForSelector("text=/today's keepsake/i", { timeout: 20_000 })
        .catch(() => {});
    },
  },
  {
    // Today's keepsake opened for the first time: the full-screen reveal, once
    // per device. Captured before memory-card so the localStorage flag is still
    // clean; memory-card (yesterday) never sets today's flag.
    id: "keepsake-reveal",
    path: `/memory/${isoDaysAgo(0)}`,
    primary: "button:has-text('keep it')",
    opens: ["KeepsakeReveal"],
    ready: "[role='dialog']",
  },
  {
    id: "memory-card",
    path: `/memory/${isoDaysAgo(1)}`,
    // The keepsake's own action: marking that a day still lands.
    primary: "button[aria-label='mark as resonated']",
    thumbZone: false,
    fullPage: true,
    ready: "article",
  },
  {
    id: "memory-locked-paywall",
    path: `/memory/${isoDaysAgo(9)}`,
    primary: "button:has-text('keep it all')",
    ready: "section[aria-label='keep your whole story with pip+']",
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
    primary: "button:has-text('keep it all')",
    ready: "h1:has-text('subscription')",
  },
  {
    id: "help",
    path: "/help",
    primary: "a[href='tel:988']",
    fullPage: true,
    ready: "h1",
  },
  {
    id: "thread-crisis",
    path: "/thread",
    primary: "a.crisis-primary",
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
  // ── The half of the app the fixture could not see until round 9. Twelve routes
  // and three modal states were never rendered, so every "0 dead ends" and every
  // font-family count came from 62% of the product.
  {
    id: "settings-account",
    path: "/settings/account",
    primary: "button:has-text('save')",
    thumbZone: false,
  },
  {
    id: "settings-notifications",
    path: "/settings/notifications",
    primary: "button[role='switch'], button[aria-label]",
    thumbZone: false,
  },
  {
    id: "settings-data",
    path: "/settings/data",
    primary: "button:has-text('export')",
    thumbZone: false,
  },
  {
    id: "settings-about",
    path: "/settings/about",
    primary: "a[href='/settings']",
    thumbZone: false,
  },
  {
    // The confirm dialog that shipped a third font family past nine type gates.
    id: "settings-delete-confirm",
    path: "/settings/data",
    primary: "button:has-text('delete forever')",
    noReload: true,
    opens: ["DangerZone"],
    setup: async (page) => {
      await page.goto("/settings/data");
      await settle(page, 300);
      await page.getByRole("button", { name: /delete my account/i }).click();
      await settle(page, 300);
    },
  },
  {
    // Zero interactive elements for nine rounds, on a screen the council was
    // explicitly hunting for.
    id: "goodbye",
    path: "/goodbye",
    primary: "a[href='/']",
  },
  {
    id: "sign-in",
    path: "/sign-in",
    primary: "button:has-text('send me a code')",
  },
  {
    id: "offline",
    path: "/offline",
    primary: "button:has-text('try again')",
  },
  {
    id: "thread-voice",
    path: "/thread",
    primary: "button:has-text('done')",
    noReload: true,
    opens: ["VoiceSheet"],
    setup: async (page) => {
      await page.goto("/thread");
      await settle(page, 400);
      await page
        .getByRole("button", { name: /voice|speak|mic/i })
        .first()
        .click();
      await settle(page, 400);
    },
  },
  {
    // The sheet opens off /api/me reporting needsEmailLink, so the fixture has to
    // make the server say so rather than click anything.
    id: "email-link",
    // Over the timeline, not the thread: the thread carries the crisis history
    // this session created, and a subscription sheet framed over crisis bubbles
    // is a bad frame to leave in the render set even though it's unreachable in
    // production (the care-mode guard blocks it there).
    path: "/timeline",
    primary: "button:has-text('send me a code')",
    noReload: true,
    opens: ["EmailLinkSheet"],
    setup: async (page) => {
      await page.route("**/api/me", async (route) => {
        const res = await route.fetch();
        const body = await res.json();
        // Force a non-care-mode state: the continuous session triggered crises
        // on earlier screens, so the real profile is in care mode by now, and
        // the sheet (correctly) refuses to open during it. This screen exists to
        // capture the sheet's normal appearance.
        await route.fulfill({
          json: { ...body, needsEmailLink: true, inCareMode: false },
        });
      });
      await page.goto("/timeline");
      await settle(page, 600);
    },
    teardown: async (page) => {
      await page.unroute("**/api/me");
    },
  },
  {
    // Signed-in users are redirected to /timeline, so the only way to see this
    // screen is as the signed-out visitor it was written for. Clearing the
    // session ends the continuous run, which is why it is captured last.
    id: "checkout-done",
    path: "/checkout/done",
    primary: "a:has-text('sign in')",
    setup: async (page) => {
      await page.context().clearCookies();
      await page.goto("/checkout/done");
      await settle(page, 400);
    },
  },
];

/** Screens re-rendered in dark mode (a subset: the ones users live in). */
export const DARK_SCREENS = new Set([
  "onboarding-welcome",
  "thread",
  "timeline",
  "memory-card",
  "meditation-pause",
  "settings",
  "memory-locked-paywall",
  "thread-composing-photo",
  "goodbye",
  "settings-delete-confirm",
  // The highest-stakes screen in the app went unverified in dark until round 12.
  "thread-crisis",
]);
