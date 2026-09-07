/**
 * ORCHESTRATOR. Merges a round's machine gate report with the council's
 * scorecard, computes Tier A points deterministically, applies the hard caps,
 * checks the regression ledger, and appends the round to the scoreboard.
 *
 *   pnpm gauntlet:score -- 01
 */
import fs from "node:fs";
import path from "node:path";

type Tier = "A1" | "A2" | "A3" | "A4" | "A5";
type Crit = Tier | "B1" | "B2" | "B3" | "B4" | "B5" | "C1" | "C2" | "C3" | "C4";

const MAX: Record<Crit, number> = { A1: 12, A2: 8, A3: 8, A4: 6, A5: 6, B1: 8, B2: 7, B3: 7, B4: 5, B5: 8, C1: 7, C2: 7, C3: 6, C4: 5 };
const COUNCIL: Crit[] = ["B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4"];

interface GateReport {
  round: string;
  checks: { id: string; pass: boolean; value: string }[];
  tiers: Record<Tier, boolean>;
  caps: { contrast: boolean; primaryTarget: boolean; brokenState: boolean };
}

interface Scorecard {
  round: number;
  advisors: string[];
  /** Which models judged, and whether the chair trusts the jury enough to nominate a 99. */
  jury?: { models: string[]; confidence: "high" | "low"; why?: string };
  scores: Record<string, { median: number; evidence: string }>;
  redFlags: string[];
  topFixes: string[];
  regressionsNoted?: string[];
  summary?: string;
}

interface Ledger {
  /** criterion → the last round it passed (undefined = never). */
  passed: Partial<Record<Crit, number>>;
  history: { round: number; total: number; capped: number; decision: string; regressions: Crit[] }[];
}

const root = path.resolve(__dirname, "..");
const roundArg = (process.argv[2] ?? "").replace(/^--?/, "");
if (!roundArg) {
  console.error("usage: tsx gauntlet/scripts/orchestrate.ts <round>");
  process.exit(1);
}
const round = Number(roundArg);
const roundDir = path.join(root, "rounds", `round-${String(round).padStart(2, "0")}`);
const gate = JSON.parse(fs.readFileSync(path.join(roundDir, "gate-report.json"), "utf8")) as GateReport;
// A re-judge supersedes the original verdict for that round. The superseded council
// stays on disk as the record of what a weaker jury said, and why it was thrown out.
const rejudgePath = path.join(roundDir, "council-rejudge", "scorecard.json");
const cardPath = fs.existsSync(rejudgePath) ? rejudgePath : path.join(roundDir, "council", "scorecard.json");
const superseded = cardPath === rejudgePath;
const card = JSON.parse(fs.readFileSync(cardPath, "utf8")) as Scorecard;
const ledgerPath = path.join(root, "ledger.json");
const ledger: Ledger = fs.existsSync(ledgerPath) ? (JSON.parse(fs.readFileSync(ledgerPath, "utf8")) as Ledger) : { passed: {}, history: [] };
// Re-scoring a round invalidates everything the ledger learned from it onward, or a
// criterion "passed" by a discredited verdict would fire a phantom regression later.
for (const [crit, at] of Object.entries(ledger.passed)) {
  if (typeof at === "number" && at >= round) delete ledger.passed[crit as Crit];
}
ledger.history = ledger.history.filter((h) => h.round < round);

// ── Tier A points: full marks for a passing gate, otherwise the share of its sub-checks that pass.
function tierPoints(t: Tier): number {
  const subs = gate.checks.filter((c) => c.id.startsWith(`${t}.`) && !/inline|warnings/.test(c.id));
  if (gate.tiers[t]) return MAX[t];
  const share = subs.length ? subs.filter((c) => c.pass).length / subs.length : 0;
  // A failed gate never earns more than 60% of its points, however many sub-checks pass.
  return Math.round(Math.min(0.6, share * 0.6) * MAX[t] * 2) / 2;
}
const points: Record<Crit, number> = {} as Record<Crit, number>;
for (const t of ["A1", "A2", "A3", "A4", "A5"] as Tier[]) points[t] = tierPoints(t);
for (const c of COUNCIL) {
  const s = card.scores[c];
  if (!s) throw new Error(`scorecard is missing ${c}`);
  if (!s.evidence || s.evidence.trim().length < 12) throw new Error(`${c} has no concrete evidence; a score without evidence is void`);
  points[c] = Math.min(MAX[c], Math.max(0, s.median));
}

const tierA = (["A1", "A2", "A3", "A4", "A5"] as Crit[]).reduce((n, c) => n + points[c], 0);
const tierB = (["B1", "B2", "B3", "B4", "B5"] as Crit[]).reduce((n, c) => n + points[c], 0);
const tierC = (["C1", "C2", "C3", "C4"] as Crit[]).reduce((n, c) => n + points[c], 0);
const raw = Math.round((tierA + tierB + tierC) * 10) / 10;

// ── Hard caps (non-overridable).
const capsApplied: string[] = [];
let capped = raw;
if (gate.caps.contrast) {
  capped = Math.min(capped, 70);
  capsApplied.push("contrast failure → 70");
}
if (gate.caps.primaryTarget) {
  capped = Math.min(capped, 80);
  capsApplied.push("primary action <44px / outside thumb zone → 80");
}
if (gate.caps.brokenState) {
  capped = Math.min(capped, 75);
  capsApplied.push("console error / dead end → 75");
}
if (card.redFlags.length > 0 && capped >= 99) {
  capped = 98;
  capsApplied.push("vibe-coded red flag present → 99 locked");
}

// ── Regression ledger: a criterion that ever passed and now fails.
const passesNow = (c: Crit) => (c.startsWith("A") ? gate.tiers[c as Tier] : points[c] >= MAX[c] * 0.85);
const regressions: Crit[] = [];
for (const c of Object.keys(MAX) as Crit[]) {
  const before = ledger.passed[c];
  if (before !== undefined && before < round && !passesNow(c)) regressions.push(c);
  if (passesNow(c)) ledger.passed[c] = round;
}

const prev = ledger.history.filter((h) => h.round < round).sort((a, b) => b.round - a.round);
const last = prev[0];
const improvement = last ? Math.round((capped - last.capped) * 10) / 10 : capped;
const twoRoundGain = prev.length >= 2 ? capped - prev[1].capped : Infinity;

// Jury sanity: a 99 can only be nominated by a jury the chair rates high-confidence, spread over
// more than one model family, and the score cannot have jumped more than 25 points in one round.
const juryModels = new Set((card.jury?.models ?? []).map((m) => m.toLowerCase()));
const juryWeak = card.jury?.confidence === "low" || juryModels.size < 2;
const jumped = last ? capped - last.capped > 25 : false;
let decision: "CONTINUE" | "FORCE-FIX" | "ESCALATE-TO-HUMAN" | "RE-JUDGE" | "HALT";
let reason: string;
const allGates = Object.values(gate.tiers).every(Boolean);
if (regressions.length > 0) {
  decision = "FORCE-FIX";
  reason = `regression on ${regressions.join(", ")}: this round scores zero improvement; fix it before anything else`;
} else if (!allGates) {
  decision = "FORCE-FIX";
  reason = `Tier A gate failing (${(Object.keys(gate.tiers) as Tier[]).filter((t) => !gate.tiers[t]).join(", ")}); no credit until the machine gates pass`;
} else if (capped >= 97 && card.redFlags.length === 0 && (juryWeak || jumped)) {
  decision = "RE-JUDGE";
  reason = `median ≥ 97 but the jury cannot nominate a 99: ${juryWeak ? `jury confidence ${card.jury?.confidence ?? "unknown"} across ${juryModels.size} model famil${juryModels.size === 1 ? "y" : "ies"}` : ""}${juryWeak && jumped ? "; " : ""}${jumped ? `score jumped ${Math.round((capped - (last?.capped ?? 0)) * 10) / 10} points in one round` : ""}. Re-run the council on a stronger, mixed-model jury before trusting this number`;
} else if (capped >= 97 && card.redFlags.length === 0) {
  decision = "ESCALATE-TO-HUMAN";
  reason = "all gates pass, council median ≥ 97, zero red flags, high-confidence mixed jury: nominate for human first-use ratification";
} else if (round >= 10) {
  decision = "HALT";
  reason = "iteration cap (10 rounds) reached";
} else if (prev.length >= 2 && twoRoundGain < 2) {
  decision = "HALT";
  reason = `plateau: ${Math.round(twoRoundGain * 10) / 10} pts gained over two rounds; hand the diagnosis to a human`;
} else {
  decision = "CONTINUE";
  reason = `send the top 3 fixes to the builder (${improvement >= 0 ? "+" : ""}${improvement} vs last round)`;
}

const effective = regressions.length > 0 && last ? Math.min(capped, last.capped) : capped;
ledger.history.push({ round, total: raw, capped: effective, decision, regressions });
ledger.history.sort((a, b) => a.round - b.round);
fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

// ── Scoreboard row + round summary.
const rowCells = (Object.keys(MAX) as Crit[]).map((c) => `${points[c]}/${MAX[c]}`);
const juryNote = card.jury?.confidence === "low" ? " (jury low-confidence: provisional)" : "";
const row = `| ${round} | ${rowCells.join(" | ")} | ${raw} | ${effective} | ${capsApplied.length ? capsApplied.join("; ") : "none"} | ${card.redFlags.length} | ${decision}${juryNote} |`;
const boardPath = path.join(root, "scoreboard.md");
let board = fs.existsSync(boardPath) ? fs.readFileSync(boardPath, "utf8") : "";
if (!board.includes("| Round |")) {
  board += `\n| Round | ${(Object.keys(MAX) as Crit[]).join(" | ")} | Raw | Effective | Caps | Red flags | Decision |\n|${"---|".repeat(Object.keys(MAX).length + 6)}\n`;
}
const lines = board.split("\n").filter((l) => !l.startsWith(`| ${round} |`));
board = lines.join("\n").replace(/\n+$/, "\n") + row + "\n";
fs.writeFileSync(boardPath, board);

const summary = [
  `# Round ${round} — orchestrator verdict`,
  "",
  `- Tier A (machine): ${tierA}/40 · Tier B (council): ${tierB}/35 · Tier C (council): ${tierC}/25`,
  `- Raw total: **${raw}** · after caps: **${capped}**${regressions.length ? ` · effective (regression, zero credit): **${effective}**` : ""}`,
  `- Caps applied: ${capsApplied.length ? capsApplied.join("; ") : "none"}`,
  `- Red flags: ${card.redFlags.length ? card.redFlags.map((f) => `"${f}"`).join(", ") : "none"}`,
  `- Regressions: ${regressions.length ? regressions.join(", ") : "none"}`,
  `- Verdict source: ${superseded ? "council-rejudge (the original council for this round was superseded)" : "council"}`,
  `- Jury: ${card.jury ? `${card.jury.models.join(", ")} · confidence ${card.jury.confidence}${card.jury.why ? ` (${card.jury.why})` : ""}` : "not recorded"}`,
  `- Improvement vs previous round: ${last ? `${improvement >= 0 ? "+" : ""}${improvement}` : "baseline"}`,
  "",
  `## Decision: ${decision}`,
  "",
  reason,
  "",
  "## Top fixes for the next round (highest leverage first)",
  "",
  ...card.topFixes.map((f, i) => `${i + 1}. ${f}`),
  "",
].join("\n");
fs.writeFileSync(path.join(roundDir, "verdict.md"), summary);
console.log(summary);
