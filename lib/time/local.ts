/**
 * Timezone math with Intl only (no date library). Every nudge/synthesis decision
 * is made in the user's local wall-clock time via these helpers.
 */
export interface LocalParts {
  date: string; // YYYY-MM-DD
  minutes: number; // minutes since local midnight, 0..1439
  hhmm: string; // HH:mm
  weekday: string; // Monday..Sunday
  weekdayShort: string; // Mon..Sun
  dow: number; // 0 = Monday .. 6 = Sunday
  dayPart: "morning" | "afternoon" | "evening" | "night";
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long",
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function safeTimeZone(tz: string | null | undefined): string {
  return isValidTimeZone(tz) ? tz : "UTC";
}

export function localParts(instant: Date, tz: string): LocalParts {
  const parts = fmt(safeTimeZone(tz)).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  const weekday = get("weekday");
  const dow = Math.max(0, WEEKDAYS.indexOf(weekday));
  const minutes = hour * 60 + minute;
  const dayPart = hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "night";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes,
    hhmm: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    weekday,
    weekdayShort: weekday.slice(0, 3),
    dow,
    dayPart,
  };
}

export function hhmmToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error(`bad HH:mm: ${hhmm}`);
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) throw new Error(`bad HH:mm: ${hhmm}`);
  return h * 60 + mi;
}

export function isHHmm(v: unknown): v is string {
  return typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

/** True when `localMinutes` is in [target, target + widthMin), wrapping past midnight. */
export function isDue(localMinutes: number, targetHHmm: string, widthMin: number): boolean {
  const t = hhmmToMinutes(targetHHmm);
  const delta = (localMinutes - t + 1440) % 1440;
  return delta >= 0 && delta < widthMin;
}

/** Add n days to a YYYY-MM-DD string (calendar arithmetic, timezone-free). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function isISODate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

/** Compare two YYYY-MM-DD strings. */
export function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Days between a and b (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** "Thursday, October 26" style long date for a YYYY-MM-DD string. */
export function formatLongDate(date: string, opts: { year?: boolean } = {}): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(opts.year ? { year: "numeric" } : {}),
  }).format(dt);
}

export function formatShortDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(dt);
}

/** "8:24 AM" in the user's zone. */
export function formatTime(instant: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: safeTimeZone(tz), hour: "numeric", minute: "2-digit" }).format(instant);
}
