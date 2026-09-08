/**
 * PREFLIGHT. Runs before the gate. Every check here exists because it failed in
 * real use and cost real rounds — the incident is written above each one.
 *
 * A failure is a hard stop, not a warning. The whole point of a gauntlet is that
 * the loop cannot quietly narrow what it measures until it passes.
 *
 *   pnpm gauntlet:preflight
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { config } from "../config";
import { SCREENS } from "../screens";

const root = path.resolve(__dirname, "..", "..");
const rel = (p: string) => path.relative(root, p) || p;

interface Finding {
  check: string;
  level: "fail" | "banner";
  message: string;
  detail?: string[];
}
const findings: Finding[] = [];
const fail = (check: string, message: string, detail?: string[]) =>
  findings.push({ check, level: "fail", message, detail });

/** Read a file, or "" if it isn't there. Never throw: a missing file is its own finding. */
function read(p: string): string {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function walk(dir: string, hit: (f: string) => void): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git")
      continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, hit);
    else hit(full);
  }
}

// ── 1. fixture-completeness ──────────────────────────────────────────────────
// INCIDENT: a terminal screen with zero interactive elements sat outside the
// screen list for nine rounds while five advisors per round hunted dead ends.
// Every A5 "0 dead ends" in that window was measured on a fixture that could not
// see it. The council was not at fault; the fixture was lying.
//
// Enumerate the app's real routes and assert the screen list reaches each one.
function routesFromFilesystem(): string[] {
  const appDir = path.join(root, "app");
  if (!fs.existsSync(appDir)) return [];
  const routes: string[] = [];
  walk(appDir, (f) => {
    if (!/[\\/]page\.(tsx|ts|jsx|js)$/.test(f)) return;
    const url = path
      .dirname(path.relative(appDir, f))
      .split(path.sep)
      // route groups (marketing) and parallel routes @slot are not URL segments
      // "." is dirname's answer for the root page; route groups (marketing) and
      // parallel routes @slot are not URL segments either.
      .filter(
        (seg) =>
          seg && seg !== "." && !/^\(.*\)$/.test(seg) && !seg.startsWith("@"),
      )
      .join("/");
    routes.push("/" + url);
  });
  return [...new Set(routes)].sort();
}

const routes = routesFromFilesystem();
if (routes.length > 0) {
  const covered = new Set(
    SCREENS.map((s) => s.path.split("?")[0].replace(/\/$/, "") || "/"),
  );
  const allowed = new Set(config.allowedDeadEnds.map((d) => d.path));
  // A dynamic route ([date]) is covered by any concrete path of the same shape.
  const isCovered = (r: string) =>
    covered.has(r) ||
    [...covered].some((c) => {
      const pattern = new RegExp("^" + r.replace(/\[[^\]]+\]/g, "[^/]+") + "$");
      return pattern.test(c);
    });
  const missing = routes.filter((r) => !isCovered(r) && !allowed.has(r));
  if (missing.length) {
    fail(
      "fixture-completeness",
      `${missing.length} route(s) exist that the gate never renders. Add them to screens.ts, or list them in config.allowedDeadEnds with a written reason.`,
      missing,
    );
  }
}

// ── 2. state-completeness ────────────────────────────────────────────────────
// INCIDENT: a third font family shipped inside a modal that no screen's setup
// opened. The type gate passed nine times. A route being in the screen list is
// not the same as its *states* being rendered.
//
// Find components that render a dialog/sheet/modal and check some screen setup
// mentions them. Heuristic on purpose — it flags for a human, it does not judge.
const dialogFiles: string[] = [];
for (const dir of ["components", "app"]) {
  walk(path.join(root, dir), (f) => {
    if (!/\.(tsx|jsx)$/.test(f)) return;
    const src = read(f);
    if (
      /role=["']dialog["']|role=["']alertdialog["']|<Sheet\b|<Modal\b|<Dialog\b|<Drawer\b/.test(
        src,
      )
    )
      dialogFiles.push(f);
  });
}
const screensSrc = read(path.join(root, "gauntlet", "screens.ts"));
const unopened = dialogFiles.filter((f) => {
  const name = path.basename(f).replace(/\.(tsx|jsx)$/, "");
  return !screensSrc.includes(name);
});
if (unopened.length) {
  fail(
    "state-completeness",
    `${unopened.length} component(s) render a dialog/sheet/modal that no screen setup appears to open. A state the gate never enters is a state it cannot measure.`,
    unopened.map(rel),
  );
}

// ── 3. token-seal ────────────────────────────────────────────────────────────
// INCIDENT: same as above. The project reset `--text-*: initial` so an off-ramp
// size emitted no CSS at all — genuinely good discipline — but never did the
// same for `--font-*`, so the framework's default mono stack still resolved and
// a third family shipped behind the system's back.
const cssFiles: string[] = [];
walk(path.join(root, "app"), (f) => {
  if (f.endsWith(".css")) cssFiles.push(f);
});
walk(path.join(root, "styles"), (f) => {
  if (f.endsWith(".css")) cssFiles.push(f);
});
const allCss = cssFiles.map(read).join("\n");
if (allCss) {
  const unsealed = config.sealedNamespaces.filter(
    (ns) =>
      !new RegExp(`${ns.replace(/[-]/g, "\\-")}\\*\\s*:\\s*initial`).test(
        allCss,
      ),
  );
  if (unsealed.length) {
    fail(
      "token-seal",
      `${unsealed.length} declared namespace(s) are not reset to \`initial\`, so framework defaults can still resolve behind the design system.`,
      unsealed.map(
        (ns) => `${ns}* — add \`${ns}*: initial;\` to the theme block`,
      ),
    );
  }
}

// ── 4. fixture-vs-production ─────────────────────────────────────────────────
// INCIDENT: the worst one. Four advisors and a chair spent eight rounds
// critiquing generated copy — its cadence, its templating, its voice — that came
// from an offline test stub. The production adapter's prompt already asked for
// exactly what they kept requesting. Eight rounds of judgement aimed at a file
// that never ships.
//
// This does not fail the run. It raises a banner that MUST reach the advisors.
if (config.fixtureAdapters.length) {
  const live = config.fixtureAdapters.filter((f) =>
    fs.existsSync(path.join(root, f)),
  );
  if (live.length) {
    findings.push({
      check: "fixture-vs-production",
      level: "banner",
      message:
        "FIXTURE CONTENT — generated copy on these screens comes from a test double, not the production path. Score layout, hierarchy and interaction normally. Do NOT score the generated copy as the product's voice.",
      detail: [
        ...live.map((f) => `fixture: ${f}`),
        ...config.productionAdapters.map((f) => `production: ${f}`),
      ],
    });
  }
}

// ── 5. checkout-freshness ────────────────────────────────────────────────────
// INCIDENT: advisors ran in git worktrees cut from a stale base commit, so they
// read and cited code that was never in the screenshots they were judging. One
// advisor noticed unprompted. The other four did not.
try {
  const head = execSync("git rev-parse HEAD", { cwd: root }).toString().trim();
  const dirty = execSync("git status --porcelain", { cwd: root })
    .toString()
    .trim();
  const stamp = { head, dirty: dirty.length > 0, at: new Date().toISOString() };
  const roundDir = path.join(
    root,
    "gauntlet",
    "rounds",
    `round-${(process.env.GAUNTLET_ROUND ?? "00").padStart(2, "0")}`,
  );
  fs.mkdirSync(roundDir, { recursive: true });
  fs.writeFileSync(
    path.join(roundDir, "checkout.json"),
    JSON.stringify(stamp, null, 2),
  );
  if (stamp.dirty) {
    fail(
      "checkout-freshness",
      "The working tree is dirty. Screenshots would be rendered from code that is not committed, and advisors reading the tree later may see something different. Commit or stash first.",
      dirty.split("\n").slice(0, 10),
    );
  }
} catch {
  // Not a git checkout; freshness is unverifiable but not violated.
}

// ── 6. jury-diversity ────────────────────────────────────────────────────────
// INCIDENT: a jury drawn from one model family returned 96.5. A mixed jury,
// re-judging the identical screenshots, returned 77. Self-preference is not a
// hypothetical failure mode in this system; it is the observed default.
//
// Checked against the previous round's scorecard, since the current round's does
// not exist yet at preflight time.
const prev = Number(process.env.GAUNTLET_ROUND ?? "0") - 1;
if (prev >= 0) {
  const cardPath = path.join(
    root,
    "gauntlet",
    "rounds",
    `round-${String(prev).padStart(2, "0")}`,
    "council",
    "scorecard.json",
  );
  const raw = read(cardPath);
  if (raw) {
    try {
      const card = JSON.parse(raw) as { jury?: { models?: string[] } };
      const families = new Set(
        (card.jury?.models ?? []).map((m) => m.toLowerCase().split(/[-\s]/)[0]),
      );
      if (families.size === 1) {
        fail(
          "jury-diversity",
          `Round ${prev} was judged by a single model family (${[...families][0]}). Re-judge it on a mixed jury before trusting its score, and spread this round's advisors across families.`,
        );
      }
    } catch {
      /* a malformed scorecard is the orchestrator's problem, not preflight's */
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────
const fails = findings.filter((f) => f.level === "fail");
const banners = findings.filter((f) => f.level === "banner");

const lines: string[] = ["# Preflight", ""];
if (!findings.length)
  lines.push("All checks pass. Nothing is hiding from the gate.");
for (const f of findings) {
  lines.push(
    `## ${f.level === "fail" ? "FAIL" : "BANNER"} — ${f.check}`,
    "",
    f.message,
    "",
  );
  if (f.detail?.length) lines.push(...f.detail.map((d) => `- ${d}`), "");
}
const out = path.join(
  root,
  "gauntlet",
  "rounds",
  `round-${(process.env.GAUNTLET_ROUND ?? "00").padStart(2, "0")}`,
  "preflight.md",
);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join("\n"));

console.log(lines.join("\n"));
console.log(`\nwrote ${rel(out)}`);

if (banners.length)
  console.log(
    `\n${banners.length} banner(s) must be pasted into every advisor prompt and the gate report.`,
  );
if (fails.length) {
  console.error(
    `\n${fails.length} preflight check(s) failed. Fix them; do not disable them.`,
  );
  process.exit(1);
}
