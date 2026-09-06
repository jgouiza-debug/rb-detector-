/**
 * Tidy a raw dictation transcript into a clean journal line — pure, offline, no
 * model, safe to run on client or server. Deliberately conservative (Tesler's
 * law lands the mess on the machine, Postel says be liberal in what you accept):
 * strip only unambiguous vocalized fillers, collapse stutters, fix spacing and
 * casing. It never touches real words, so "i like this" and "kind of blue"
 * survive intact — the point is to clean speech, not rewrite the person.
 */

// Sounds that are never real words in a sentence. "like", "you know", "i mean",
// "sort of" are left alone on purpose — each is meaningful too often to strip.
const FILLERS = ["um", "umm", "uhm", "uh", "uhh", "uhhh", "er", "err", "erm", "ah", "ahh", "hmm", "hmmm", "mmm", "mhm"];

const FILLER_RE = new RegExp(`(^|[\\s,.;:!?])(?:${FILLERS.join("|")})(?=[\\s,.;:!?]|$)`, "gi");

export function tidyTranscript(raw: string): string {
  let s = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!s) return "";

  // Drop floating filler sounds (run twice to catch back-to-back "um uh").
  s = s.replace(FILLER_RE, "$1").replace(FILLER_RE, "$1");

  // Collapse immediate word repeats from stutters: "i i went" -> "i went".
  s = s.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");

  // Normalize whitespace and punctuation the filler removal may have orphaned.
  s = s
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])\1+/g, "$1")
    .replace(/^[\s,.;:!?]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!s) return "";

  // Capitalize each sentence start so a spoken thought reads like a written one.
  s = s.replace(/(^|[.!?]\s+)([a-z])/g, (_m, lead: string, ch: string) => lead + ch.toUpperCase());

  // Land on a terminal mark.
  if (!/[.!?]$/.test(s)) s += ".";
  return s;
}
