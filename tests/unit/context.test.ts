import { describe, expect, it } from "vitest";
import { buildHistory, type RawTurn } from "@/lib/ai/context";

function turn(id: string, role: "user" | "assistant", text: string, kind = "text", caption?: string): RawTurn {
  return { id, role, text, kind, caption };
}

describe("context builder", () => {
  it("drops crisis/system turns and merges consecutive same-role bubbles", () => {
    const { history } = buildHistory([
      turn("1", "user", "hey"),
      turn("2", "assistant", "hi there"),
      turn("3", "assistant", "how are you?"),
      turn("c", "assistant", "crisis text", "crisis"),
      turn("n", "assistant", "note", "note"),
      turn("4", "user", "i'm ok"),
    ]);
    expect(history).toHaveLength(3);
    expect(history[0]).toMatchObject({ role: "user", text: "hey" });
    expect(history[1].text).toBe("hi there\nhow are you?");
    expect(history[2]).toMatchObject({ role: "user", text: "i'm ok" });
  });

  it("renders photo turns with their caption", () => {
    const { history } = buildHistory([turn("1", "user", "", "photo", "a cup of coffee")]);
    expect(history[0].text).toContain("[photo: a cup of coffee]");
  });

  it("always starts the window on a user turn", () => {
    const { history } = buildHistory([turn("a", "assistant", "leading pip line"), turn("b", "user", "then me"), turn("c", "assistant", "reply")]);
    expect(history[0].role).toBe("user");
  });
});
