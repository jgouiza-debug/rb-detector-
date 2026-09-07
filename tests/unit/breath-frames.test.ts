import { describe, expect, it } from "vitest";
import { breathAt } from "@/lib/breath/engine";
import { BOX, FOUR78, cycleSeconds } from "@/lib/breath/patterns";
import { dominantFrame, eyelidAt, frameWeights, fullnessAt, layerOpacities, PIP_FRAMES } from "@/lib/breath/frames";

const at = (ms: number, p = BOX) => breathAt(ms, p, 90);

describe("breath engine cycleProgress", () => {
  it("runs 0..1 across one cycle and wraps", () => {
    expect(at(0).cycleProgress).toBe(0);
    expect(at(8000).cycleProgress).toBeCloseTo(0.5, 5);
    expect(at(16_000).cycleProgress).toBeCloseTo(0, 5);
    expect(at(19_000, FOUR78).cycleProgress).toBeCloseTo(0, 5);
    expect(at(9500, FOUR78).cycleProgress).toBeCloseTo(0.5, 5);
  });
});

describe("pip meditation frames", () => {
  it("ships three cut frames in eyelid order", () => {
    expect(PIP_FRAMES.map((f) => f.key)).toEqual(["open", "soft", "closed"]);
  });

  it("eyes open on the inhale, soften on the hold, close on the exhale, stay closed on the empty hold", () => {
    expect(eyelidAt(at(0))).toBeCloseTo(2, 5); // inhale starts closed
    expect(eyelidAt(at(3990))).toBeCloseTo(0, 5); // ...and ends open
    expect(eyelidAt(at(4000))).toBeCloseTo(0, 5); // hold starts open
    expect(eyelidAt(at(7990))).toBeCloseTo(1, 5); // ...and ends half-lidded
    expect(eyelidAt(at(8000))).toBeCloseTo(1, 5); // exhale starts half-lidded
    expect(eyelidAt(at(11_990))).toBeCloseTo(2, 5); // ...and ends closed
    expect(eyelidAt(at(13_000))).toBe(2); // hold in
  });

  it("is continuous across every phase boundary for both patterns", () => {
    for (const p of [BOX, FOUR78]) {
      const cycle = cycleSeconds(p) * 1000;
      let acc = 0;
      for (const ph of p.phases) {
        acc += ph.seconds * 1000;
        const before = eyelidAt(breathAt((acc - 1) % cycle, p, 90));
        const after = eyelidAt(breathAt(acc % cycle, p, 90));
        expect(Math.abs(before - after)).toBeLessThan(0.02);
      }
    }
  });

  it("frame weights are a partition of unity over adjacent frames", () => {
    for (let ms = 0; ms < 19_000; ms += 137) {
      const w = frameWeights(at(ms, FOUR78));
      expect(w.open + w.soft + w.closed).toBeCloseTo(1, 5);
      expect(w.open === 0 || w.closed === 0).toBe(true);
    }
  });

  it("layer opacities reproduce the weighted mix without a mid-fade dip", () => {
    expect(layerOpacities({ open: 1, soft: 0, closed: 0 })).toEqual({ open: 1, soft: 0, closed: 0 });
    expect(layerOpacities({ open: 0.5, soft: 0.5, closed: 0 })).toEqual({ open: 1, soft: 0.5, closed: 0 });
    expect(layerOpacities({ open: 0, soft: 0.3, closed: 0.7 })).toEqual({ open: 0, soft: 1, closed: 0.7 });
    expect(layerOpacities({ open: 0, soft: 0, closed: 1 })).toEqual({ open: 0, soft: 0, closed: 1 });
  });

  it("fullness rises on the inhale, holds, and falls on the exhale", () => {
    expect(fullnessAt(at(0))).toBe(0);
    expect(fullnessAt(at(2000))).toBeCloseTo(0.5, 5);
    expect(fullnessAt(at(5000))).toBe(1);
    expect(fullnessAt(at(10_000))).toBeCloseTo(0.5, 5);
    expect(fullnessAt(at(14_000))).toBe(0);
  });

  it("picks a sensible still frame for reduced motion", () => {
    expect(dominantFrame(at(3900)).key).toBe("open");
    expect(dominantFrame(at(7900)).key).toBe("soft");
    expect(dominantFrame(at(13_000)).key).toBe("closed");
  });
});
