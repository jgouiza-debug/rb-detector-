import type { ClockPort } from "@/lib/ports/clock";

export function systemClock(): ClockPort {
  return { now: () => new Date() };
}
