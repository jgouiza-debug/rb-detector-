import { describe, expect, it } from "vitest";
import { decorate, dwellMs } from "@/lib/chat/grouping";

const base = (id: string, sender: "user" | "pip" | "system", min: number, date = "2026-10-26") => ({
  id,
  sender,
  createdAt: new Date(Date.UTC(2026, 9, Number(date.slice(-2)), 12, min)).toISOString(),
  localDate: date,
});

describe("message grouping", () => {
  it("groups consecutive same-sender messages within 3 minutes", () => {
    const d = decorate([base("1", "pip", 0), base("2", "pip", 1), base("3", "pip", 2)]);
    expect(d[0].firstInGroup).toBe(true);
    expect(d[0].lastInGroup).toBe(false);
    expect(d[2].lastInGroup).toBe(true);
  });

  it("breaks the group after a gap over 3 minutes", () => {
    const d = decorate([base("1", "pip", 0), base("2", "pip", 10)]);
    expect(d[1].firstInGroup).toBe(true);
    expect(d[0].lastInGroup).toBe(true);
  });

  it("shows a day divider on a new local date", () => {
    const d = decorate([base("1", "user", 0, "2026-10-25"), base("2", "user", 5, "2026-10-26")]);
    expect(d[0].showDayDivider).toBe(true);
    expect(d[1].showDayDivider).toBe(true);
  });

  it("system messages never group", () => {
    const d = decorate([base("1", "system", 0), base("2", "system", 0)]);
    expect(d[0].firstInGroup).toBe(true);
    expect(d[0].lastInGroup).toBe(true);
  });

  it("dwell scales with length and caps at 2.2s", () => {
    expect(dwellMs("hi")).toBeLessThan(dwellMs("a much longer sentence here"));
    expect(dwellMs("x".repeat(500))).toBe(2200);
  });
});
