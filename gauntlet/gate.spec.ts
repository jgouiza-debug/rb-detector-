/**
 * GATE RUNNER. Renders every key screen (light + a dark subset), screenshots it,
 * and measures the Tier A gates: axe-core, rendered contrast, touch targets,
 * thumb zone, 8pt spacing, type/colour system, console errors, CLS/FCP, focus
 * indicators and reduced-motion. Writes gauntlet/rounds/round-NN/{screens,gate-report.*}.
 */
import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test, type Page } from "@playwright/test";
import sharp from "sharp";
import {
  auditPage,
  PERF_INIT_SCRIPT,
  probeFocus,
  probeSticky,
  readPerf,
  type FocusProbe,
  type StickyProbe,
} from "./lib/measure";
import {
  colorCoverage,
  evaluate,
  renderMarkdown,
  type AxeViolation,
  type ConsoleEvent,
  type ReducedMotionResult,
  type ScreenResult,
} from "./lib/report";
import { DARK_SCREENS, SCREENS, type Screen } from "./screens";

const ROUND = (process.env.GAUNTLET_ROUND ?? "00").padStart(2, "0");
const ROUND_DIR = path.join(__dirname, "rounds", `round-${ROUND}`);
const SHOTS_DIR = path.join(ROUND_DIR, "screens");
const VIEWPORT = { width: 390, height: 844 };

const results: ScreenResult[] = [];
const reduced: ReducedMotionResult[] = [];

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
});

function attachConsole(
  page: Page,
  current: { screen: string },
  sink: ConsoleEvent[],
) {
  page.on("console", (msg) => {
    const type = msg.type();
    if (type !== "error" && type !== "warning") return;
    sink.push({
      screen: current.screen,
      kind: type === "error" ? "console.error" : "console.warning",
      text: msg.text(),
    });
  });
  page.on("pageerror", (err) =>
    sink.push({ screen: current.screen, kind: "pageerror", text: err.message }),
  );
  page.on("response", (res) => {
    const status = res.status();
    if (status < 400) return;
    const url = new URL(res.url());
    // The locked-memory screen is *supposed* to 402; everything else 4xx/5xx is a defect.
    const expected = status === 402 && url.pathname.startsWith("/api/memory/");
    sink.push({
      screen: current.screen,
      kind: "http",
      text: `${status} ${res.request().method()} ${url.pathname}`,
      expected,
    });
  });
}

async function captureScreen(
  page: Page,
  s: Screen,
  theme: "light" | "dark",
  events: ConsoleEvent[],
  probeFocusRing: boolean,
): Promise<ScreenResult> {
  if (s.setup) await s.setup(page);
  // s.teardown runs before this returns; the run shares one page, so anything
  // setup leaves behind (a route override, an open dialog) would corrupt every
  // screen captured after it.
  if (!s.noReload) await page.goto(s.path);
  if (s.ready)
    await page.waitForSelector(s.ready, { timeout: 20_000 }).catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  // Capture the natural landing state (the thread lands scrolled to its newest message).
  await page.waitForTimeout(900);

  const base = `${s.id}-${theme}`;
  const png = await page.screenshot({ type: "png", fullPage: false });
  const viewportShot = path.join(SHOTS_DIR, `${base}.jpg`);
  await sharp(png).jpeg({ quality: 82 }).toFile(viewportShot);
  const shots: ScreenResult["shots"] = {
    viewport: path.relative(ROUND_DIR, viewportShot),
  };
  if (s.fullPage) {
    const full = await page.screenshot({ type: "png", fullPage: true });
    const fullShot = path.join(SHOTS_DIR, `${base}-full.jpg`);
    await sharp(full).jpeg({ quality: 82 }).toFile(fullShot);
    shots.full = path.relative(ROUND_DIR, fullShot);
  }

  const axe = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  const violations: AxeViolation[] = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? "unknown",
    tags: v.tags,
    nodes: v.nodes.length,
    help: v.help,
    sample: v.nodes.slice(0, 2).map((n) => n.html),
  }));
  const wcagSeriousOrCritical = violations.filter(
    (v) =>
      (v.impact === "serious" || v.impact === "critical") &&
      v.tags.some((t) => t.startsWith("wcag")),
  ).length;
  const contrast = violations.filter((v) =>
    v.id.includes("color-contrast"),
  ).length;

  // Resolve the primary action with Playwright's selector engine (`:has-text` is not DOM CSS).
  const primaryLoc = page.locator(s.primary).first();
  const primaryBox =
    (await primaryLoc.count()) > 0 ? await primaryLoc.boundingBox() : null;
  const audit = await page.evaluate(auditPage, {
    primaryBox,
    viewportW: VIEWPORT.width,
    viewportH: VIEWPORT.height,
  });
  const perf = await page.evaluate(readPerf);
  // User photos are content, not interface palette — mask them out of the histogram.
  const imageBoxes = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img, video"))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.max(0, r.left),
          y: Math.max(0, r.top),
          w: r.width,
          h: r.height,
        };
      })
      .filter((b) => b.w > 24 && b.h > 24),
  );
  // An earlier attempt masked everything outside an open dialog, which kept the
  // scrim out of the histogram but computed those screens' percentages over a
  // much smaller population than the other 32 — a real fix executed too broadly,
  // and a loosening. Every pixel is counted again; report.ts now recognises a
  // scrimmed colour as the token it is dimming.
  const colors = await colorCoverage(png, 8, imageBoxes);

  // Chrome that only exists at scroll position 0 is not chrome.
  const stickyBefore = (await page.evaluate(probeSticky, null)) as {
    el: string;
    top: number;
  }[];
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.waitForTimeout(500);
  const sticky = (await page.evaluate(
    probeSticky,
    stickyBefore,
  )) as StickyProbe[];
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const focus: FocusProbe[] = [];
  if (probeFocusRing) {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(probeFocus);
      if (!f) continue;
      if (seen.has(f.el)) break;
      seen.add(f.el);
      focus.push(f);
    }
  }

  const mine = events.filter((e) => e.screen === `${s.id}/${theme}`);
  if (s.teardown) await s.teardown(page);
  return {
    id: s.id,
    theme,
    path: s.path,
    thumbZone: s.thumbZone !== false,
    sticky,
    shots,
    axe: { violations, wcagSeriousOrCritical, contrast },
    audit,
    perf,
    focus,
    colors,
    console: mine,
  };
}

async function runTheme(page: Page, theme: "light" | "dark") {
  const current = { screen: "" };
  const events: ConsoleEvent[] = [];
  attachConsole(page, current, events);
  await page.addInitScript(PERF_INIT_SCRIPT);
  if (theme === "dark")
    await page.addInitScript(() => localStorage.setItem("pip-theme", "dark"));
  // Clean slate: every run is a brand-new anonymous user walking in cold.
  await page.goto("/welcome");
  await page.request.post("/api/dev/reset");
  await page.context().clearCookies();

  for (const s of SCREENS) {
    current.screen = `${s.id}/${theme}`;
    const capture = theme === "light" || DARK_SCREENS.has(s.id);
    if (!capture) {
      // Still execute the setup so later screens have their state.
      if (s.setup) await s.setup(page);
      continue;
    }
    results.push(
      await captureScreen(page, s, theme, events, theme === "light"),
    );
  }
}

test("light theme: render + measure every key screen", async ({ page }) => {
  await runTheme(page, "light");
});

test("dark theme: render + measure the daily screens", async ({ page }) => {
  await runTheme(page, "dark");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("no animation keeps running when the user asks for less motion", async ({
    page,
  }) => {
    await page.goto("/welcome");
    await page.request.post("/api/dev/reset");
    await page.context().clearCookies();
    const walk: Screen[] = SCREENS.filter((s) =>
      [
        "onboarding-welcome",
        "onboarding-name",
        "onboarding-focus",
        "onboarding-rhythm",
        "onboarding-notify",
        "thread",
        "timeline",
        "meditation-pause",
      ].includes(s.id),
    );
    for (const s of walk) {
      if (s.setup) await s.setup(page);
      await page.goto(s.path);
      if (s.ready)
        await page
          .waitForSelector(s.ready, { timeout: 20_000 })
          .catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        let running = 0;
        let longest = 0;
        for (const a of document.getAnimations()) {
          if (a.playState !== "running") continue;
          const t = a.effect?.getTiming();
          const d = typeof t?.duration === "number" ? t.duration : 0;
          // A transition under 50ms is the reduced-motion "instant" idiom, not motion.
          if (d < 50) continue;
          running++;
          longest = Math.max(longest, d === Infinity ? 99999 : d);
        }
        return { running, longest };
      });
      reduced.push({
        screen: s.id,
        runningAnimations: r.running,
        longestMs: r.longest,
      });
    }
  });
});

test.afterAll(async () => {
  if (results.length === 0)
    throw new Error(
      "no screens were captured; refusing to write an empty gate report",
    );
  const report = evaluate(ROUND, VIEWPORT, results, reduced);
  fs.writeFileSync(
    path.join(ROUND_DIR, "gate-report.json"),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(
    path.join(ROUND_DIR, "gate-report.md"),
    renderMarkdown(report),
  );
  console.log(
    `\nGate report → ${path.relative(process.cwd(), path.join(ROUND_DIR, "gate-report.md"))}`,
  );
  console.log(
    `A1 ${report.tiers.A1} · A2 ${report.tiers.A2} · A3 ${report.tiers.A3} · A4 ${report.tiers.A4} · A5 ${report.tiers.A5}`,
  );
});
