import { describe, expect, it } from "vitest";
import { addDays, daysBetween, hhmmToMinutes, isDue, isHHmm, localParts } from "@/lib/time/local";

describe("local time helpers", () => {
  it("computes local date and minutes across timezones", () => {
    const instant = new Date("2026-10-26T02:30:00Z"); // 2:30 UTC
    expect(localParts(instant, "America/New_York").date).toBe("2026-10-25"); // still the 25th in NY (EDT -4)
    expect(localParts(instant, "Asia/Kolkata").date).toBe("2026-10-26"); // +5:30
    expect(localParts(instant, "Pacific/Auckland").hhmm).toMatch(/^\d{2}:\d{2}$/);
  });

  it("handles US spring-forward (2026-03-08, America/New_York)", () => {
    // 2:30am local does not exist; 07:30 UTC is 02:30 EST->EDT boundary. Just assert no crash + sane date.
    const p = localParts(new Date("2026-03-08T12:00:00Z"), "America/New_York");
    expect(p.date).toBe("2026-03-08");
  });

  it("isDue windows correctly and wraps midnight", () => {
    expect(isDue(hhmmToMinutes("08:45"), "08:30", 90)).toBe(true);
    expect(isDue(hhmmToMinutes("10:30"), "08:30", 90)).toBe(false);
    expect(isDue(5, "23:30", 90)).toBe(true); // 00:05 is within 90m of 23:30
  });

  it("addDays and daysBetween are calendar-correct across a month boundary", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(daysBetween("2026-10-25", "2026-11-01")).toBe(7);
  });

  it("validates HH:mm", () => {
    expect(isHHmm("08:30")).toBe(true);
    expect(isHHmm("24:00")).toBe(false);
    expect(isHHmm("8:30")).toBe(false);
  });
});
