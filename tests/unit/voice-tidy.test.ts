import { describe, expect, it } from "vitest";
import { tidyTranscript } from "@/lib/voice/tidy";

describe("tidyTranscript", () => {
  it("strips vocalized fillers", () => {
    expect(tidyTranscript("um so uh i went for a walk")).toBe("So i went for a walk.");
  });

  it("collapses stutter repeats", () => {
    expect(tidyTranscript("i i i really needed that")).toBe("I really needed that.");
  });

  it("keeps real words that look like fillers", () => {
    // "like" and "kind of" carry meaning — never strip them.
    expect(tidyTranscript("i really like this kind of quiet")).toBe("I really like this kind of quiet.");
  });

  it("capitalizes each sentence and adds a terminal mark", () => {
    expect(tidyTranscript("that was hard. tomorrow feels lighter")).toBe("That was hard. Tomorrow feels lighter.");
  });

  it("normalizes messy whitespace and punctuation", () => {
    expect(tidyTranscript("  the   day was  good ,,  really ")).toBe("The day was good, really.");
  });

  it("returns empty for blank or filler-only input", () => {
    expect(tidyTranscript("   ")).toBe("");
    expect(tidyTranscript("um uh er")).toBe("");
  });

  it("preserves an existing question mark", () => {
    expect(tidyTranscript("why do i keep doing this?")).toBe("Why do i keep doing this?");
  });
});
