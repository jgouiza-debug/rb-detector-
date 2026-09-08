/**
 * Node-side aggregation: per-screen results → gate-report.json + gate-report.md.
 * The gate report is the ground truth the council cannot argue with.
 */
import sharp from "sharp";
import type { FocusProbe, PageAudit, PerfSnapshot, StickyProbe } from "./measure";

export interface AxeViolation {
  id: string;
  impact: string;
  tags: string[];
  nodes: number;
  help: string;
  sample: string[];
}

export interface ConsoleEvent {
  screen: string;
  kind: "console.error" | "console.warning" | "pageerror" | "http";
  text: string;
  expected?: boolean;
}

export interface ColorShare {
  hex: string;
  share: number;
  token: string | null;
}

export interface ScreenResult {
  id: string;
  theme: "light" | "dark";
  path: string;
  /** Whether the thumb-zone rule applies to this screen's primary action. */
  thumbZone: boolean;
  shots: { viewport: string; full?: string };
  axe: { violations: AxeViolation[]; wcagSeriousOrCritical: number; contrast: number };
  audit: PageAudit;
  perf: PerfSnapshot;
  focus: FocusProbe[];
  sticky: StickyProbe[];
  colors: { top: ColorShare[]; dominant: number; top2: number; top3: number };
  console: ConsoleEvent[];
}

export interface ReducedMotionResult {
  screen: string;
  runningAnimations: number;
  longestMs: number;
}

export interface GateCheck {
  id: string;
  label: string;
  value: string;
  pass: boolean;
  detail?: string;
}

export interface GateReport {
  round: string;
  generatedAt: string;
  viewport: { width: number; height: number };
  screens: ScreenResult[];
  reducedMotion: ReducedMotionResult[];
  checks: GateCheck[];
  tiers: { A1: boolean; A2: boolean; A3: boolean; A4: boolean; A5: boolean };
  caps: { contrast: boolean; primaryTarget: boolean; brokenState: boolean };
  /** Distinct type sizes / families / weights across every screen. */
  system: { sizes: number[]; families: string[]; weights: number[] };
}

const BRAND: Record<string, string> = {
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
};

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function nearestToken(hex: string): string | null {
  const [r, g, b] = hexToRgb(hex);
  let best: string | null = null;
  let bestD = Infinity;
  for (const [h, name] of Object.entries(BRAND)) {
    const [r2, g2, b2] = hexToRgb(h);
    const d = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  // Within ~18 per channel counts as "this token" (anti-aliasing + quantisation).
  return bestD <= 18 * 18 * 3 ? best : null;
}

/** Pixel-coverage histogram of a screenshot, quantised to 16 levels/channel, top N colours. */
/**
 * Near-neutral colours (cream, white cards, pale pip-bubble; night, night-raised) are one
 * "neutral family" for the 70/20/10 read. Two channels within 40 of the dominant colour
 * (after 16-level quantisation) belong to the family.
 */
function sameFamily(a: string, b: string): boolean {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.abs(r1 - r2) <= 40 && Math.abs(g1 - g2) <= 40 && Math.abs(b1 - b2) <= 40;
}

/**
 * Colour coverage of the INTERFACE. Regions occupied by user content (photos) are
 * excluded: 70/20/10 is a rule about the palette a designer chooses, not about the
 * pictures people put into their own journal. Measuring both together meant a
 * screen failed the palette gate for the crime of showing a photograph.
 * (Added in round 7, after exactly that false failure on `memory-card`.)
 */
export async function colorCoverage(png: Buffer, topN = 8, exclude: { x: number; y: number; w: number; h: number }[] = []): Promise<ScreenResult["colors"]> {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const counts = new Map<number, number>();
  const scale = info.width / 390; // screenshots render at the viewport's device ratio
  const boxes = exclude.map((b) => ({ x0: b.x * scale, y0: b.y * scale, x1: (b.x + b.w) * scale, y1: (b.y + b.h) * scale }));
  let px = 0;
  for (let i = 0; i < data.length; i += 3) {
    const p = i / 3;
    const x = p % info.width;
    const y = (p - x) / info.width;
    if (boxes.some((b) => x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1)) continue;
    px++;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  if (px === 0) return { top: [], dominant: 0, top2: 0, top3: 0 };
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const top: ColorShare[] = sorted.slice(0, topN).map(([key, n]) => {
    const r = ((key >> 8) & 15) * 16 + 8;
    const g = ((key >> 4) & 15) * 16 + 8;
    const b = (key & 15) * 16 + 8;
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    return { hex, share: Math.round((n / px) * 1000) / 10, token: nearestToken(hex) };
  });
  // dominant = the neutral family's share; top2/top3 add the next distinct (non-family) colours.
  const lead = top[0]?.hex ?? "#000000";
  const family = top.filter((c) => sameFamily(c.hex, lead));
  const others = top.filter((c) => !sameFamily(c.hex, lead));
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const dominant = round1(family.reduce((s, c) => s + c.share, 0));
  const top2 = round1(dominant + (others[0]?.share ?? 0));
  const top3 = round1(top2 + (others[1]?.share ?? 0));
  return { top, dominant, top2, top3 };
}

export function pct(n: number, d: number): string {
  return d === 0 ? "n/a" : `${Math.round((n / d) * 1000) / 10}%`;
}

export function evaluate(round: string, viewport: { width: number; height: number }, screens: ScreenResult[], reducedMotion: ReducedMotionResult[]): GateReport {
  const checks: GateCheck[] = [];
  const light = screens.filter((s) => s.theme === "light");

  // ── A1 accessibility ─────────────────────────────────────────────────
  const axeSerious = screens.reduce((n, s) => n + s.axe.wcagSeriousOrCritical, 0);
  const axeContrast = screens.reduce((n, s) => n + s.axe.contrast, 0);
  const measuredContrast = screens.reduce((n, s) => n + s.audit.color.contrastFailures.length, 0);
  const focusProbes = light.flatMap((s) => s.focus);
  const focusMissing = focusProbes.filter((f) => !f.visible);
  const rmRunning = reducedMotion.reduce((n, r) => n + r.runningAnimations, 0);
  checks.push({ id: "A1.axe", label: "axe-core WCAG 2.x A/AA serious+critical violations", value: String(axeSerious), pass: axeSerious === 0, detail: screens.filter((s) => s.axe.wcagSeriousOrCritical > 0).map((s) => `${s.id}/${s.theme}: ${s.axe.violations.filter((v) => (v.impact === "serious" || v.impact === "critical") && v.tags.some((t) => t.startsWith("wcag"))).map((v) => v.id).join(", ")}`).join("; ") });
  checks.push({ id: "A1.contrast", label: "Rendered text contrast failures (axe + measured)", value: `${axeContrast} axe / ${measuredContrast} measured`, pass: axeContrast === 0 && measuredContrast === 0, detail: screens.flatMap((s) => s.audit.color.contrastFailures.slice(0, 3).map((f) => `${s.id}/${s.theme}: ${f.el} ${f.fg} on ${f.bg} = ${f.ratio}:1 (needs ${f.required})`)).join("; ") });
  checks.push({ id: "A1.focus", label: "Keyboard focus indicator visible on tabbed controls", value: `${focusProbes.length - focusMissing.length}/${focusProbes.length}`, pass: focusMissing.length === 0, detail: focusMissing.slice(0, 5).map((f) => f.el).join("; ") });
  checks.push({ id: "A1.reducedMotion", label: "Animations still running under prefers-reduced-motion", value: String(rmRunning), pass: rmRunning === 0, detail: reducedMotion.filter((r) => r.runningAnimations > 0).map((r) => `${r.screen}: ${r.runningAnimations} (longest ${r.longestMs}ms)`).join("; ") });
  const A1 = axeSerious === 0 && axeContrast === 0 && measuredContrast === 0 && focusMissing.length === 0 && rmRunning === 0;

  // ── A2 touch + ergonomics ────────────────────────────────────────────
  const allTargets = screens.flatMap((s) => s.audit.targets.map((t) => ({ ...t, screen: `${s.id}/${s.theme}` })));
  const blockTargets = allTargets.filter((t) => !t.inline);
  const smallBlock = blockTargets.filter((t) => !t.pass);
  const smallInline = allTargets.filter((t) => t.inline && !t.pass);
  const primaries = screens.map((s) => ({ screen: `${s.id}/${s.theme}`, p: s.audit.primary }));
  const primaryMissing = primaries.filter((x) => !x.p || !x.p.found);
  const primarySmall = primaries.filter((x) => x.p && x.p.found && (x.p.w < 44 || x.p.h < 44));
  const primaryBelowFold = primaries.filter((x) => x.p && x.p.found && !x.p.inViewport);
  const primaryOutOfZone = primaries.filter((x) => x.p && x.p.found && x.p.inViewport && !x.p.inThumbZone && screens.find((s) => `${s.id}/${s.theme}` === x.screen)?.thumbZone);
  checks.push({ id: "A2.targets", label: "Interactive targets under 44×44 (block-level)", value: `${smallBlock.length}/${blockTargets.length}`, pass: smallBlock.length === 0, detail: Array.from(new Set(smallBlock.map((t) => `${t.screen}: ${t.el} ${t.w}×${t.h}`))).slice(0, 12).join("; ") });
  checks.push({ id: "A2.inline", label: "Inline text links under 44px (WCAG 2.5.8 exempt, advisory)", value: String(smallInline.length), pass: true, detail: Array.from(new Set(smallInline.map((t) => `${t.screen}: ${t.el} ${t.w}×${t.h}`))).slice(0, 8).join("; ") });
  const primaryBad = new Set([...primaryMissing, ...primarySmall, ...primaryBelowFold, ...primaryOutOfZone].map((x) => x.screen));
  checks.push({ id: "A2.primary", label: "Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs)", value: `${primaries.length - primaryBad.size}/${primaries.length}`, pass: primaryBad.size === 0, detail: [...primaryMissing.map((x) => `${x.screen}: not found`), ...primarySmall.map((x) => `${x.screen}: ${x.p!.w}×${x.p!.h}`), ...primaryBelowFold.map((x) => `${x.screen}: off-screen at landing (y=${x.p!.y})`), ...primaryOutOfZone.map((x) => `${x.screen}: centre y=${x.p!.y + x.p!.h / 2} above thumb zone`)].join("; ") });
  const A2 = primaryBad.size === 0 && smallBlock.length === 0;

  // ── A3 spatial system ────────────────────────────────────────────────
  const spTotal = screens.reduce((n, s) => n + s.audit.spacing.total, 0);
  const spOn8 = screens.reduce((n, s) => n + s.audit.spacing.on8, 0);
  const spOff = screens.reduce((n, s) => n + s.audit.spacing.offGrid, 0);
  const on8Share = spTotal ? spOn8 / spTotal : 1;
  const offenderValues = new Map<number, number>();
  for (const s of screens) for (const v of s.audit.spacing.values) if (!v.on8) offenderValues.set(v.value, (offenderValues.get(v.value) || 0) + v.count);
  const worstEdges = Math.max(0, ...screens.map((s) => s.audit.spacing.distinctLeftEdges.length));
  checks.push({ id: "A3.grid8", label: "Spacing values on the 8pt grid", value: pct(spOn8, spTotal), pass: on8Share >= 0.9, detail: `off-8 values (count): ${Array.from(offenderValues.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, c]) => `${v}px×${c}`).join(", ")}` });
  checks.push({ id: "A3.grid4", label: "Spacing values off even the 4pt half-grid", value: String(spOff), pass: spOff === 0 });
  const voids = screens.filter((s) => s.audit.composition.bottomVoid > 200);
  checks.push({ id: "A3.void", label: "Empty ground below the last content on a non-scrolling screen (advisory, >200px)", value: `${voids.length}/${screens.length} screens`, pass: true, detail: screens.filter((s) => s.audit.composition.bottomVoid > 0).map((s) => `${s.id}/${s.theme}: ${s.audit.composition.bottomVoid}px`).join("; ") });
  checks.push({ id: "A3.align", label: "Misaligned sibling blocks (distinct left edges among wide siblings, per screen max)", value: String(worstEdges), pass: worstEdges === 0, detail: screens.filter((s) => s.audit.spacing.distinctLeftEdges.length > 0).map((s) => `${s.id}/${s.theme}: ${s.audit.spacing.distinctLeftEdges.join(",")}`).join("; ") });
  const A3 = on8Share >= 0.9 && spOff === 0 && worstEdges === 0;

  // ── A4 type + colour systems ─────────────────────────────────────────
  const sizes = new Set<number>();
  const families = new Set<string>();
  const weights = new Set<number>();
  for (const s of screens) {
    for (const v of s.audit.type.sizes) sizes.add(v.value);
    for (const v of s.audit.type.families) families.add(v.value);
    for (const v of s.audit.type.weights) weights.add(v.value);
  }
  const sizeList = Array.from(sizes).sort((a, b) => a - b);
  const famList = Array.from(families).sort();
  const weightList = Array.from(weights).sort((a, b) => a - b);
  // Two families (an editorial serif + a neutral sans), which is the rubric's own
  // bar. This was 3 while the brand ran a three-role system; the type rework in
  // round 8 removed the exception, so the gate tightens back to the standard.
  const FAMILY_LIMIT = 2;
  checks.push({ id: "A4.sizes", label: "Distinct type sizes across the app (≤ 6)", value: `${sizeList.length}: ${sizeList.join(", ")}px`, pass: sizeList.length <= 6 });
  checks.push({ id: "A4.families", label: `Distinct font families (≤ ${FAMILY_LIMIT})`, value: `${famList.length}: ${famList.join(", ")}`, pass: famList.length <= FAMILY_LIMIT });
  checks.push({ id: "A4.weights", label: "Distinct font weights (≤ 3)", value: `${weightList.length}: ${weightList.join(", ")}`, pass: weightList.length <= 3 });
  const dominantLow = screens.filter((s) => s.colors.dominant < 55);
  const busy = screens.filter((s) => s.colors.top3 < 85);
  checks.push({ id: "A4.palette", label: "70/20/10 proxy: neutral family ≥ 55% and neutral + two accents ≥ 85% of pixels", value: `${screens.length - new Set([...dominantLow, ...busy]).size}/${screens.length} screens`, pass: dominantLow.length === 0 && busy.length === 0, detail: [...dominantLow.map((s) => `${s.id}/${s.theme}: dominant ${s.colors.dominant}%`), ...busy.map((s) => `${s.id}/${s.theme}: top-3 ${s.colors.top3}%`)].join("; ") });
  const A4 = sizeList.length <= 6 && famList.length <= FAMILY_LIMIT && weightList.length <= 3 && dominantLow.length === 0 && busy.length === 0 && axeContrast === 0 && measuredContrast === 0;

  // ── A5 correctness + performance ─────────────────────────────────────
  const errors = screens.flatMap((s) => s.console.filter((c) => !c.expected && c.kind !== "console.warning"));
  const warnings = screens.flatMap((s) => s.console.filter((c) => c.kind === "console.warning"));
  const clsBad = screens.filter((s) => s.perf.cls > 0.1);
  const fcpBad = screens.filter((s) => s.perf.fcp > 1800);
  const deadEnds = screens.filter((s) => s.audit.interactiveCount < 2 || !s.audit.primary?.found);
  const overflow = screens.filter((s) => s.audit.overflowX.px > 0);
  checks.push({ id: "A5.console", label: "Console errors / page errors / failed requests", value: String(errors.length), pass: errors.length === 0, detail: errors.slice(0, 8).map((e) => `${e.screen}: [${e.kind}] ${e.text.slice(0, 120)}`).join("; ") });
  checks.push({ id: "A5.warnings", label: "Console warnings (advisory)", value: String(warnings.length), pass: true, detail: Array.from(new Set(warnings.map((w) => w.text.slice(0, 100)))).slice(0, 5).join("; ") });
  checks.push({ id: "A5.cls", label: "Cumulative layout shift ≤ 0.1 on every screen", value: `${screens.length - clsBad.length}/${screens.length}`, pass: clsBad.length === 0, detail: clsBad.map((s) => `${s.id}/${s.theme}: ${s.perf.cls}`).join("; ") });
  checks.push({ id: "A5.fcp", label: "First contentful paint ≤ 1800ms on every screen", value: `${screens.length - fcpBad.length}/${screens.length}`, pass: fcpBad.length === 0, detail: fcpBad.map((s) => `${s.id}/${s.theme}: ${s.perf.fcp}ms`).join("; ") });
  checks.push({ id: "A5.deadEnds", label: "Dead-end screens (no primary action or < 2 controls)", value: String(deadEnds.length), pass: deadEnds.length === 0, detail: deadEnds.map((s) => `${s.id}/${s.theme}`).join("; ") });
  const stuck = screens.flatMap((s) => s.sticky.filter((p) => !p.stayed).map((p) => `${s.id}/${s.theme}: ${p.el} (${p.position}) left the viewport at top=${p.topAfter}`));
  checks.push({ id: "A5.sticky", label: "Sticky/fixed chrome still on screen after scrolling", value: `${screens.reduce((n, s) => n + s.sticky.filter((p) => p.stayed).length, 0)}/${screens.reduce((n, s) => n + s.sticky.length, 0)}`, pass: stuck.length === 0, detail: stuck.slice(0, 8).join("; ") });
  checks.push({ id: "A5.overflow", label: "Screens that scroll sideways (horizontal overflow)", value: String(overflow.length), pass: overflow.length === 0, detail: overflow.map((s) => `${s.id}/${s.theme}: +${s.audit.overflowX.px}px (${s.audit.overflowX.offenders[0]?.el ?? "?"} ${s.audit.overflowX.offenders[0]?.w ?? "?"}px wide)`).join("; ") });
  const A5 = errors.length === 0 && clsBad.length === 0 && fcpBad.length === 0 && deadEnds.length === 0 && overflow.length === 0 && stuck.length === 0;

  return {
    round,
    generatedAt: new Date().toISOString(),
    viewport,
    screens,
    reducedMotion,
    checks,
    tiers: { A1, A2, A3, A4, A5 },
    caps: {
      contrast: axeContrast > 0 || measuredContrast > 0,
      primaryTarget: primarySmall.length > 0 || primaryOutOfZone.length > 0 || primaryBelowFold.length > 0,
      brokenState: errors.length > 0 || deadEnds.length > 0 || overflow.length > 0 || stuck.length > 0,
    },
    system: { sizes: sizeList, families: famList, weights: weightList },
  };
}

export function renderMarkdown(r: GateReport): string {
  const mark = (b: boolean) => (b ? "PASS" : "FAIL");
  const lines: string[] = [];
  lines.push(`# Gate report — round ${r.round}`);
  lines.push("");
  lines.push(`Generated ${r.generatedAt} · viewport ${r.viewport.width}×${r.viewport.height} · ${r.screens.length} screen renders (${r.screens.filter((s) => s.theme === "dark").length} dark)`);
  lines.push("");
  lines.push("## Tier A summary");
  lines.push("");
  lines.push("| Gate | Result |");
  lines.push("|---|---|");
  lines.push(`| A1 Accessibility | ${mark(r.tiers.A1)} |`);
  lines.push(`| A2 Touch & ergonomics | ${mark(r.tiers.A2)} |`);
  lines.push(`| A3 Spatial system | ${mark(r.tiers.A3)} |`);
  lines.push(`| A4 Type & colour systems | ${mark(r.tiers.A4)} |`);
  lines.push(`| A5 Correctness & performance | ${mark(r.tiers.A5)} |`);
  lines.push("");
  lines.push(`Hard caps triggered: contrast→70: **${r.caps.contrast ? "YES" : "no"}** · primary target→80: **${r.caps.primaryTarget ? "YES" : "no"}** · broken state→75: **${r.caps.brokenState ? "YES" : "no"}**`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  lines.push("| # | Check | Value | Pass | Detail |");
  lines.push("|---|---|---|---|---|");
  for (const c of r.checks) lines.push(`| ${c.id} | ${c.label} | ${c.value} | ${mark(c.pass)} | ${(c.detail || "").replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push("## Per screen");
  lines.push("");
  lines.push("| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | void below | CLS | FCP | dominant colour | console |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const s of r.screens) {
    const p = s.audit.primary;
    const primary = !p || !p.found ? "missing" : `${p.w}×${p.h} ${!p.inViewport ? "OFF-SCREEN" : !s.thumbZone ? "zone n/a" : p.inThumbZone ? "thumb-ok" : "OUT OF ZONE"}`;
    const dom = s.colors.top[0] ? `${s.colors.top[0].token ?? s.colors.top[0].hex} ${s.colors.dominant}%` : "n/a";
    lines.push(`| ${s.id} | ${s.theme} | ${s.axe.wcagSeriousOrCritical} | ${s.audit.color.contrastFailures.length} | ${s.audit.targets.filter((t) => !t.inline && !t.pass).length}/${s.audit.targets.filter((t) => !t.inline).length} | ${primary} | ${pct(s.audit.spacing.on8, s.audit.spacing.total)} | ${s.audit.composition.scrolls ? "scrolls" : `${s.audit.composition.bottomVoid}px`} | ${s.perf.cls} | ${s.perf.fcp}ms | ${dom} (family ${s.colors.dominant}%) | ${s.console.filter((c) => !c.expected && c.kind !== "console.warning").length} |`);
  }
  lines.push("");
  lines.push("## Type system observed");
  lines.push("");
  lines.push(`- Sizes (${r.system.sizes.length}): ${r.system.sizes.join(", ")}px`);
  lines.push(`- Families (${r.system.families.length}): ${r.system.families.join(", ")}`);
  lines.push(`- Weights (${r.system.weights.length}): ${r.system.weights.join(", ")}`);
  lines.push("");
  lines.push("## Colour coverage (pixel share of the viewport, top 5; dominant = neutral family)");
  lines.push("");
  for (const s of r.screens) lines.push(`- ${s.id}/${s.theme}: ${s.colors.top.slice(0, 5).map((c) => `${c.token ?? c.hex} ${c.share}%`).join(" · ")}`);
  lines.push("");
  lines.push("## axe violations (all impacts, WCAG + best-practice)");
  lines.push("");
  const seen = new Set<string>();
  for (const s of r.screens) {
    for (const v of s.axe.violations) {
      const key = `${s.id}/${s.theme}/${v.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`- ${s.id}/${s.theme}: **${v.id}** (${v.impact}, ${v.nodes} node${v.nodes === 1 ? "" : "s"}) — ${v.help}${v.sample.length ? ` · e.g. \`${v.sample[0].slice(0, 100)}\`` : ""}`);
    }
  }
  if (seen.size === 0) lines.push("- none");
  lines.push("");
  lines.push("## Console / network events");
  lines.push("");
  const evs = r.screens.flatMap((s) => s.console);
  if (evs.length === 0) lines.push("- none");
  for (const e of evs.slice(0, 40)) lines.push(`- ${e.screen}: [${e.kind}${e.expected ? ", expected" : ""}] ${e.text.slice(0, 160)}`);
  lines.push("");
  lines.push("## Reduced motion");
  lines.push("");
  for (const rm of r.reducedMotion) lines.push(`- ${rm.screen}: ${rm.runningAnimations} running animation${rm.runningAnimations === 1 ? "" : "s"}${rm.runningAnimations ? ` (longest ${rm.longestMs}ms)` : ""}`);
  lines.push("");
  return lines.join("\n");
}
