import { describe, expect, it } from "vitest";
import { breathAt } from "@/lib/breath/engine";
import { BOX, FOUR78, cycleSeconds } from "@/lib/breath/patterns";

describe("breath engine", () => {
  it("box pattern cycles 4-4-4-4 and names each phase", () => {
    expect(cycleSeconds(BOX)).toBe(16);
    expect(breathAt(0, BOX, 90).phaseName).toBe("breathe in");
    expect(breathAt(5000, BOX, 90).phaseName).toBe("hold");
    expect(breathAt(9000, BOX, 90).phaseName).toBe("breathe out");
    expect(breathAt(13000, BOX, 90).phaseName).toBe("hold in");
    expect(breathAt(17000, BOX, 90).phaseName).toBe("breathe in"); // next cycle
  });

  it("4-7-8 pattern has the long exhale", () => {
    expect(cycleSeconds(FOUR78)).toBe(19);
    expect(breathAt(0, FOUR78, 90).phaseName).toBe("breathe in");
    expect(breathAt(5000, FOUR78, 90).phaseName).toBe("hold");
    expect(breathAt(12000, FOUR78, 90).phaseName).toBe("breathe out");
  });

  it("scale rises on inhale and falls on exhale", () => {
    const inhaleStart = breathAt(100, BOX, 90).scale;
    const inhaleEnd = breathAt(3900, BOX, 90).scale;
    expect(inhaleEnd).toBeGreaterThan(inhaleStart);
    const exhaleStart = breathAt(8100, BOX, 90).scale;
    const exhaleEnd = breathAt(11900, BOX, 90).scale;
    expect(exhaleEnd).toBeLessThan(exhaleStart);
  });

  it("secondsLeft counts down within a phase and is never zero while active", () => {
    expect(breathAt(500, BOX, 90).secondsLeft).toBe(4);
    expect(breathAt(3500, BOX, 90).secondsLeft).toBe(1);
  });

  it("reports done at the session length and progress reaches 1", () => {
    expect(breathAt(90_000, BOX, 90).done).toBe(true);
    expect(breathAt(90_000, BOX, 90).sessionProgress).toBe(1);
    expect(breathAt(45_000, BOX, 90).sessionProgress).toBeCloseTo(0.5, 2);
    expect(breathAt(45_000, BOX, 90).done).toBe(false);
  });
});
