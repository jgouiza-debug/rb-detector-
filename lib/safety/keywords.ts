/**
 * Tiered lexical signals for the safety gate. Regexes use word boundaries and
 * handle common misspellings. Negation like "i don't want to die" is still a
 * tier-1 signal (the person is talking about dying), which is intentional.
 */

// Tier 1: explicit self-harm / suicidal intent / imminent danger -> crisis, no model call.
export const TIER1: RegExp[] = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend\s+(it\s+all|my\s+life|myself|things)\b/i,
  /\b(want|going|need|ready)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+)?(alive|here|live|exist)\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bbetter\s+off\s+(without\s+me|dead|if\s+i\s+(was|were)\s+gone)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bsuacid|sucide|suicid\b/i,
  // Gerunds too: "hurting myself" / "harming myself" are as explicit as the base
  // verb and were slipping the net when only `cut` carried the -ing variant.
  /\b(hurt(ing)?|harm(ing)?|cut(ting)?|self[-\s]?injur(e|ing|y))\s+myself\b/i,
  /\bself[-\s]?harm\b/i,
  /\bself[-\s]?injur(e|ing|y)\b/i,
  /\boverdos(e|ing)\b/i,
  /\bno\s+(reason|point)\s+(to\s+)?(live|living|be\s+here|go\s+on)\b/i,
  /\bkms\b/i,
  /\bunalive\b/i,
];

// Imminence modifiers that push a tier-2 to crisis when combined.
export const IMMINENCE: RegExp[] = [/\btonight\b/i, /\bright\s+now\b/i, /\bhave\s+(the\s+)?pills\b/i, /\bwrote\s+a\s+note\b/i, /\bgoodbye\b/i, /\bthis\s+is\s+it\b/i];

// Tier 2: ambiguous distress -> model intent check (fail-safe to crisis).
// "kill me" lives here, not Tier 1: it is genuinely ambiguous ("this meeting,
// kill me" vs "please just kill me, i can't") — the classifier disambiguates it,
// and fails safe to crisis on error.
export const TIER2: RegExp[] = [
  /\bkill\s+me\b/i,
  /\bhopeless\b/i,
  /\bcan'?t\s+(do|take)\s+this\s+(anymore|any\s+longer)\b/i,
  /\bno\s+point\b/i,
  /\bgive\s+up\s+on\s+everything\b/i,
  /\b(want\s+to\s+)?disappear\b/i,
  /\bnothing\s+matters\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bpills\b/i,
];

// Tier 3: soft distress -> gentler tone (concern), no crisis card.
export const TIER3: RegExp[] = [
  /\boverwhelm(ed|ing)?\b/i,
  /\bcan'?t\s+cope\b/i,
  /\bpanic(king|\s+attack)?\b/i,
  /\bexhausted\b/i,
  /\bhate\s+myself\b/i,
  /\bbreaking\s+down\b/i,
  /\bfalling\s+apart\b/i,
  /\bso\s+anxious\b/i,
];

// Figurative phrases that must NOT trip the gate (asserted in tests).
export const FIGURATIVE_SAFE: string[] = [
  "this deadline is killing me",
  "i'm dying to see you",
  "my phone died",
  "that joke killed me",
  "i could kill for a coffee",
  "killing it at work",
  "dead tired but happy",
];
