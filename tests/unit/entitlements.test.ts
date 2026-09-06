import { describe, expect, it } from "vitest";
import { isPlus } from "@/lib/billing/entitlements";

const now = new Date("2026-10-26T12:00:00Z");
const future = new Date("2026-11-26T12:00:00Z");
const past = new Date("2026-10-20T12:00:00Z");
const within3d = new Date("2026-10-24T12:00:00Z"); // past by 2 days

describe("entitlement (server-derived plus)", () => {
  it("active/trialing are always plus", () => {
    expect(isPlus({ status: "active", currentPeriodEnd: future, cancelAtPeriodEnd: false }, now)).toBe(true);
    expect(isPlus({ status: "trialing", currentPeriodEnd: future, cancelAtPeriodEnd: false }, now)).toBe(true);
  });
  it("past_due keeps access within a 3-day grace after period end", () => {
    expect(isPlus({ status: "past_due", currentPeriodEnd: within3d, cancelAtPeriodEnd: false }, now)).toBe(true);
    expect(isPlus({ status: "past_due", currentPeriodEnd: past, cancelAtPeriodEnd: false }, now)).toBe(false);
  });
  it("canceled keeps access until period end, then loses it", () => {
    expect(isPlus({ status: "canceled", currentPeriodEnd: future, cancelAtPeriodEnd: true }, now)).toBe(true);
    expect(isPlus({ status: "canceled", currentPeriodEnd: past, cancelAtPeriodEnd: true }, now)).toBe(false);
  });
  it("none and unpaid are free", () => {
    expect(isPlus(null, now)).toBe(false);
    expect(isPlus({ status: "unpaid", currentPeriodEnd: future, cancelAtPeriodEnd: false }, now)).toBe(false);
  });
});
