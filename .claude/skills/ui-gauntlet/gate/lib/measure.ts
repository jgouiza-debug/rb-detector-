/**
 * Browser-side measurement for the Tier A gates. Everything in `auditPage` runs
 * inside the page via `page.evaluate`, so it must be self-contained: no imports,
 * no closures over module scope.
 */

export interface TargetInfo {
  el: string;
  role: string;
  w: number;
  h: number;
  x: number;
  y: number;
  /** Inline text link inside a block of text (WCAG 2.5.8 exempts these). */
  inline: boolean;
  pass: boolean;
}

export interface ContrastFailure {
  el: string;
  text: string;
  fg: string;
  bg: string;
  ratio: number;
  required: number;
  size: number;
  weight: number;
}

export interface SpacingOffender {
  el: string;
  prop: string;
  value: number;
}

export interface PageAudit {
  targets: TargetInfo[];
  primary: { found: boolean; x: number; y: number; w: number; h: number; inViewport: boolean; inThumbZone: boolean } | null;
  /** Horizontal overflow of the document beyond the viewport, in px, with the widest offenders. */
  overflowX: { px: number; offenders: { el: string; w: number }[] };
  /**
   * Composition: how much of the first screen is left empty below the last piece of
   * content, and whether the page even scrolls. A short page ending 400px up an 844px
   * phone is a design that stopped, not a design that finished.
   */
  composition: { bottomVoid: number; lastContentBottom: number; scrolls: boolean };
  spacing: {
    values: { value: number; count: number; on8: boolean; on4: boolean }[];
    total: number;
    on8: number;
    on4Only: number;
    offGrid: number;
    /** Layout spacings (>= 8px) that are not multiples of 8. */
    offenders: SpacingOffender[];
    distinctLeftEdges: number[];
  };
  type: {
    sizes: { value: number; count: number }[];
    families: { value: string; count: number }[];
    weights: { value: number; count: number }[];
  };
  color: {
    textColors: { value: string; count: number }[];
    contrastFailures: ContrastFailure[];
    contrastChecked: number;
    contrastUnknown: number;
  };
  animations: { running: number; longest: number };
  interactiveCount: number;
  headingCount: number;
}

export function auditPage(opts: { primaryBox: { x: number; y: number; width: number; height: number } | null; viewportW: number; viewportH: number }): PageAudit {
  const vw = opts.viewportW;
  const vh = opts.viewportH;

  function describe(el: Element): string {
    const tag = el.tagName.toLowerCase();
    const label = el.getAttribute("aria-label");
    const id = el.id ? `#${el.id}` : "";
    const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32);
    return `${tag}${id}${label ? `[aria-label="${label}"]` : ""}${text ? ` "${text}"` : ""}`;
  }

  function visible(el: Element): boolean {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function parseRgb(s: string): { r: number; g: number; b: number; a: number } | null {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function toHex(c: { r: number; g: number; b: number }): string {
    const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
  }

  function blend(fg: { r: number; g: number; b: number; a: number }, bg: { r: number; g: number; b: number }) {
    return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
  }

  function luminance(c: { r: number; g: number; b: number }): number {
    const f = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }

  function contrast(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  /** Walk up until an opaque background is found; composite translucent layers on the way. */
  function effectiveBackground(el: Element): { r: number; g: number; b: number } | "unknown" {
    const layers: { r: number; g: number; b: number; a: number }[] = [];
    let node: Element | null = el;
    while (node) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return "unknown";
      const c = parseRgb(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
      node = node.parentElement;
    }
    if (layers.length === 0 || layers[layers.length - 1].a < 1) {
      const body = parseRgb(getComputedStyle(document.body).backgroundColor);
      layers.push(body && body.a > 0 ? { ...body, a: 1 } : { r: 255, g: 255, b: 255, a: 1 });
    }
    let acc = { r: layers[layers.length - 1].r, g: layers[layers.length - 1].g, b: layers[layers.length - 1].b };
    for (let i = layers.length - 2; i >= 0; i--) acc = blend(layers[i], acc);
    return acc;
  }

  function effectiveOpacity(el: Element): number {
    let o = 1;
    let node: Element | null = el;
    while (node) {
      o *= Number(getComputedStyle(node).opacity || 1);
      node = node.parentElement;
    }
    return o;
  }

  const all = Array.from(document.body.querySelectorAll<HTMLElement>("*")).filter((el) => {
    if (el.closest("svg")) return false;
    if (el.closest("script, style, noscript")) return false;
    return visible(el);
  });

  // ── A2: touch targets ────────────────────────────────────────────────
  const interactiveSel = "a[href], button, input, select, textarea, [role='button'], [role='tab'], [role='checkbox'], [role='radio'], [role='switch'], [tabindex]:not([tabindex='-1'])";
  const targets: TargetInfo[] = [];
  for (const el of all) {
    if (!el.matches(interactiveSel)) continue;
    if (el.matches("input[type='file'][hidden], input[hidden]")) continue;
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" && cs.left && cs.left.startsWith("-")) continue; // skip-link style off-screen
    if (el.classList.contains("sr-only")) continue;
    const r = el.getBoundingClientRect();
    const inline = el.tagName === "A" && cs.display === "inline" && !!el.parentElement && (el.parentElement.textContent || "").trim().length > (el.textContent || "").trim().length + 4;
    const pass = r.width >= 44 && r.height >= 44;
    targets.push({ el: describe(el), role: el.getAttribute("role") || el.tagName.toLowerCase(), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, x: Math.round(r.left), y: Math.round(r.top + window.scrollY), inline, pass });
  }

  let primary: PageAudit["primary"] = null;
  const r = opts.primaryBox;
  if (r) {
    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;
    const inViewport = r.y >= 0 && r.y + r.height <= vh && r.x >= 0 && r.x + r.width <= vw + 1;
    // Thumb zone on a one-handed phone: the lower ~60% of the viewport, not glued to a top corner.
    const inThumbZone = inViewport && cy >= vh * 0.4 && cy <= vh && cx >= 0 && cx <= vw;
    primary = { found: true, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), inViewport, inThumbZone };
  } else {
    primary = { found: false, x: 0, y: 0, w: 0, h: 0, inViewport: false, inThumbZone: false };
  }

  // ── Composition: the empty ground under the last content on the first screen ──
  let lastContentBottom = 0;
  for (const el of all) {
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0);
    const isBox = el.matches("img, svg, input, textarea, button, a[href], hr") || getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)";
    if (!hasText && !isBox) continue;
    if (el.classList.contains("sr-only")) continue;
    const rb = el.getBoundingClientRect();
    // Only content inside the first screen counts; a full-height wrapper is not content.
    if (rb.height >= vh * 0.95) continue;
    if (rb.top < vh && rb.bottom <= vh + 1) lastContentBottom = Math.max(lastContentBottom, Math.round(rb.bottom));
  }
  const scrolls = document.documentElement.scrollHeight > window.innerHeight + 4;
  const composition = { bottomVoid: scrolls ? 0 : Math.max(0, vh - lastContentBottom), lastContentBottom, scrolls };

  // ── A5: horizontal overflow (the page must never scroll sideways on a phone) ──
  const overflowPx = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
  const overflowOffenders: { el: string; w: number }[] = [];
  if (overflowPx > 0) {
    for (const el of all) {
      const r2 = el.getBoundingClientRect();
      if (r2.width > vw + 1 && overflowOffenders.length < 5) overflowOffenders.push({ el: describe(el), w: Math.round(r2.width) });
    }
  }

  // ── A3: spacing grid ─────────────────────────────────────────────────
  const spacingCounts = new Map<number, number>();
  const offenders: SpacingOffender[] = [];
  const props = ["padding-top", "padding-right", "padding-bottom", "padding-left", "margin-top", "margin-right", "margin-bottom", "margin-left"];
  const autoClass = (cls: string, prop: string) => {
    const side = prop.split("-")[1];
    const shorthand: Record<string, string[]> = { top: ["mt", "my", "m"], bottom: ["mb", "my", "m"], left: ["ml", "mx", "m"], right: ["mr", "mx", "m"] };
    const tokens = cls.split(/\s+/);
    return (shorthand[side] ?? []).some((p) => tokens.includes(`${p}-auto`));
  };
  for (const el of all) {
    if (el.matches("input[type='time']")) continue;
    if (el.classList.contains("sr-only")) continue;
    const rect0 = el.getBoundingClientRect();
    if (rect0.width <= 1 || rect0.height <= 1) continue;
    const cs = getComputedStyle(el);
    const list = [...props];
    if (cs.display.includes("flex") || cs.display.includes("grid")) list.push("row-gap", "column-gap");
    for (const prop of list) {
      const raw = parseFloat(cs.getPropertyValue(prop));
      if (!raw || Number.isNaN(raw)) continue;
      const v = Math.round(Math.abs(raw) * 10) / 10;
      if (v === 0) continue;
      // Auto margins (mx-auto, mt-auto…) resolve to arbitrary px; they are layout, not spacing.
      if (prop.startsWith("margin-") && typeof el.className === "string" && autoClass(el.className, prop)) continue;
      spacingCounts.set(v, (spacingCounts.get(v) || 0) + 1);
      if (v >= 8 && v % 8 !== 0 && offenders.length < 40) offenders.push({ el: describe(el), prop, value: v });
    }
  }
  const values = Array.from(spacingCounts.entries())
    .map(([value, count]) => ({ value, count, on8: value % 8 === 0, on4: value % 4 === 0 }))
    .sort((a, b) => b.count - a.count);
  let total = 0;
  let on8 = 0;
  let on4Only = 0;
  let offGrid = 0;
  for (const v of values) {
    total += v.count;
    if (v.on8) on8 += v.count;
    else if (v.on4) on4Only += v.count;
    else offGrid += v.count;
  }
  // Alignment: within one parent, wide block children (≥ 60% of the parent) should share a
  // left edge. Nested content edges (card → padding) are design; misaligned siblings are not.
  const leftEdges = new Set<number>();
  for (const parent of all) {
    if (parent.children.length < 2) continue;
    const pr = parent.getBoundingClientRect();
    if (pr.width < 120) continue;
    const pcs = getComputedStyle(parent);
    // A centred stack aligns on its centre axis, not a left edge.
    if (pcs.alignItems === "center" || pcs.justifyItems === "center" || pcs.textAlign === "center") continue;
    const edges = new Set<number>();
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || !visible(child) || child.classList.contains("sr-only")) continue;
      const ccs = getComputedStyle(child);
      // Out-of-flow children (scrims, sheets, floating actions) are not siblings in the
      // layout sense and cannot be "misaligned" against the column.
      if (ccs.position === "absolute" || ccs.position === "fixed") continue;
      const cls = typeof child.className === "string" ? child.className.split(/\s+/) : [];
      if (cls.includes("mx-auto") || cls.includes("self-center") || cls.includes("self-end")) continue;
      const cr = child.getBoundingClientRect();
      if (cr.width >= pr.width * 0.6) edges.add(Math.round(cr.left));
    }
    if (edges.size > 1) for (const e of edges) leftEdges.add(e);
  }

  // ── A4: type + colour ────────────────────────────────────────────────
  const textEls = all.filter((el) => Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0));
  const sizeCounts = new Map<number, number>();
  const familyCounts = new Map<string, number>();
  const weightCounts = new Map<number, number>();
  const textColorCounts = new Map<string, number>();
  const contrastFailures: ContrastFailure[] = [];
  let contrastChecked = 0;
  let contrastUnknown = 0;
  for (const el of textEls) {
    const cs = getComputedStyle(el);
    const size = Math.round(parseFloat(cs.fontSize) * 2) / 2;
    const fam = (cs.fontFamily.split(",")[0] || "").replace(/["']/g, "").trim();
    const family = fam.replace(/^__/, "").replace(/_[A-Za-z0-9]+$/, "").toLowerCase();
    const weight = Number(cs.fontWeight) || 400;
    sizeCounts.set(size, (sizeCounts.get(size) || 0) + 1);
    familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
    weightCounts.set(weight, (weightCounts.get(weight) || 0) + 1);

    const fg = parseRgb(cs.color);
    if (!fg) continue;
    if (el.closest("[disabled], [aria-disabled='true']")) continue;
    if (el.closest("[aria-hidden='true']")) continue;
    const bg = effectiveBackground(el);
    if (bg === "unknown") {
      contrastUnknown++;
      continue;
    }
    const alpha = fg.a * effectiveOpacity(el);
    const fgEff = blend({ ...fg, a: alpha }, bg);
    textColorCounts.set(toHex(fgEff), (textColorCounts.get(toHex(fgEff)) || 0) + 1);
    const ratio = contrast(fgEff, bg);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = large ? 3 : 4.5;
    contrastChecked++;
    if (ratio < required && contrastFailures.length < 40) {
      contrastFailures.push({ el: describe(el), text: (el.textContent || "").trim().slice(0, 40), fg: toHex(fgEff), bg: toHex(bg), ratio: Math.round(ratio * 100) / 100, required, size, weight });
    }
  }
  const sortMap = <K,>(m: Map<K, number>) => Array.from(m.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);

  // ── A5/B4: animations ────────────────────────────────────────────────
  let running = 0;
  let longest = 0;
  for (const a of document.getAnimations()) {
    if (a.playState !== "running") continue;
    const t = a.effect?.getTiming();
    const d = typeof t?.duration === "number" ? t.duration : 0;
    running++;
    if (d === Infinity) longest = Math.max(longest, 99999);
    else longest = Math.max(longest, d);
  }

  return {
    targets,
    primary,
    overflowX: { px: overflowPx, offenders: overflowOffenders },
    composition,
    spacing: { values, total, on8, on4Only, offGrid, offenders, distinctLeftEdges: Array.from(leftEdges).sort((a, b) => a - b) },
    type: { sizes: sortMap(sizeCounts), families: sortMap(familyCounts), weights: sortMap(weightCounts) },
    color: { textColors: sortMap(textColorCounts), contrastFailures, contrastChecked, contrastUnknown },
    animations: { running, longest },
    interactiveCount: targets.length,
    headingCount: document.querySelectorAll("h1, h2, h3").length,
  };
}

/** Installed before navigation so layout-shift + LCP entries are buffered from the first paint. */
export const PERF_INIT_SCRIPT = `
(() => {
  const w = window;
  w.__gauntlet = { cls: 0, shifts: [], lcp: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) { w.__gauntlet.cls += e.value; w.__gauntlet.shifts.push({ value: e.value, t: Math.round(e.startTime) }); }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) w.__gauntlet.lcp = Math.round(last.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
})();
`;

export interface PerfSnapshot {
  cls: number;
  shifts: { value: number; t: number }[];
  lcp: number;
  fcp: number;
  domContentLoaded: number;
  load: number;
}

export function readPerf(): PerfSnapshot {
  const w = window as unknown as { __gauntlet?: { cls: number; shifts: { value: number; t: number }[]; lcp: number } };
  const g = w.__gauntlet ?? { cls: 0, shifts: [], lcp: 0 };
  const paint = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint");
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return {
    cls: Math.round(g.cls * 1000) / 1000,
    shifts: g.shifts.slice(0, 10),
    lcp: g.lcp,
    fcp: paint ? Math.round(paint.startTime) : 0,
    domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
    load: nav ? Math.round(nav.loadEventEnd) : 0,
  };
}

export interface FocusProbe {
  el: string;
  outline: string;
  boxShadow: string;
  visible: boolean;
}

export function probeFocus(): FocusProbe | null {
  const el = document.activeElement as HTMLElement | null;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  const outlineW = parseFloat(cs.outlineWidth) || 0;
  const hasOutline = cs.outlineStyle !== "none" && outlineW > 0;
  const hasShadow = cs.boxShadow && cs.boxShadow !== "none";
  const tag = el.tagName.toLowerCase();
  const label = el.getAttribute("aria-label");
  const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32);
  return { el: `${tag}${label ? `[aria-label="${label}"]` : ""}${text ? ` "${text}"` : ""}`, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, boxShadow: cs.boxShadow, visible: hasOutline || !!hasShadow };
}


export interface StickyProbe {
  el: string;
  position: string;
  topBefore: number;
  topAfter: number;
  stayed: boolean;
}

/**
 * Persistent chrome must persist. Run once at the top of the page and once scrolled;
 * anything declared sticky/fixed that leaves the viewport is not chrome, it is content
 * that happens to start at the top — the failure that hid a whole app's navigation.
 */
export function probeSticky(before: { el: string; top: number }[] | null): StickyProbe[] | { el: string; top: number }[] {
  const found: { el: string; top: number; position: string }[] = [];
  for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    const cs = getComputedStyle(el);
    if (cs.position !== "sticky" && cs.position !== "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 8) continue;
    const tag = el.tagName.toLowerCase();
    const label = el.getAttribute("aria-label");
    found.push({ el: `${tag}${label ? `[aria-label="${label}"]` : ""}`, top: Math.round(r.top), position: cs.position });
  }
  if (!before) return found.map((f) => ({ el: f.el, top: f.top }));
  const vh = window.innerHeight;
  return before.map((b) => {
    const now = found.find((f) => f.el === b.el);
    const topAfter = now ? now.top : 99999;
    // It counts as staying if any part of it is still on screen.
    const stayed = !!now && topAfter > -8 && topAfter < vh;
    return { el: b.el, position: now?.position ?? "gone", topBefore: b.top, topAfter, stayed };
  });
}
