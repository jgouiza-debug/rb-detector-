import { getEnv } from "@/lib/env";
import type { ClockPort } from "@/lib/ports/clock";

/**
 * Local-only clock. `now()` is synchronous everywhere, so it reads only the
 * PIP_FAKE_NOW env var (falling back to real time). Per-request time travel for
 * Playwright is handled explicitly by routes that need it (e.g. the cron tick
 * reads the `x-pip-test-now` header in async request scope and passes the
 * instant into runTick), which keeps this port simple and correct.
 */
export function testableClock(): ClockPort {
  return {
    now() {
      const iso = getEnv().test.fakeNow;
      if (iso) {
        const d = new Date(iso);
        if (!Number.isNaN(d.getTime())) return d;
      }
      return new Date();
    },
  };
}

/** Parse an optional test-clock override (header value) into a Date, in local mode only. */
export function parseTestNow(headerValue: string | null | undefined): Date | null {
  if (!headerValue) return null;
  if (getEnv().mode !== "local") return null;
  const d = new Date(headerValue);
  return Number.isNaN(d.getTime()) ? null : d;
}
