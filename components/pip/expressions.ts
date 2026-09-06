export type PipExpression = "listening" | "happy" | "thinking" | "cozy" | "concern";

export const PIP_EXPRESSIONS: readonly PipExpression[] = ["listening", "happy", "thinking", "cozy", "concern"];

export const expressionLabel: Record<PipExpression, string> = {
  listening: "listening",
  happy: "happy",
  thinking: "thinking",
  cozy: "cozy",
  concern: "gentle concern",
};
