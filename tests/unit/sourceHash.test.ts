import { describe, expect, it } from "vitest";
import { computeSourceHash } from "@/lib/synthesis/sourceHash";

describe("synthesis source hash", () => {
  it("is stable regardless of id order", () => {
    const a = computeSourceHash({ messageIds: ["m2", "m1"], mediaIds: ["p1"], careMode: false });
    const b = computeSourceHash({ messageIds: ["m1", "m2"], mediaIds: ["p1"], careMode: false });
    expect(a).toBe(b);
  });
  it("changes when a new entry is added", () => {
    const a = computeSourceHash({ messageIds: ["m1"], mediaIds: [], careMode: false });
    const b = computeSourceHash({ messageIds: ["m1", "m2"], mediaIds: [], careMode: false });
    expect(a).not.toBe(b);
  });
  it("changes when care mode flips", () => {
    const a = computeSourceHash({ messageIds: ["m1"], mediaIds: [], careMode: false });
    const b = computeSourceHash({ messageIds: ["m1"], mediaIds: [], careMode: true });
    expect(a).not.toBe(b);
  });
});
