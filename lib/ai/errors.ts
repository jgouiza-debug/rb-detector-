import Anthropic from "@anthropic-ai/sdk";

export interface AiError {
  kind: "rate_limit" | "unavailable" | "bad_request" | "unknown";
  retryable: boolean;
  message: string;
}

/** Most-specific-first mapping. The TS SDK has no APIStatusError; never string-match. */
export function classifyAiError(e: unknown): AiError {
  if (e instanceof Anthropic.RateLimitError) return { kind: "rate_limit", retryable: true, message: e.message };
  if (e instanceof Anthropic.InternalServerError) return { kind: "unavailable", retryable: true, message: e.message };
  if (e instanceof Anthropic.APIConnectionError) return { kind: "unavailable", retryable: true, message: e.message };
  if (e instanceof Anthropic.BadRequestError) return { kind: "bad_request", retryable: false, message: e.message };
  if (e instanceof Anthropic.APIError) return { kind: "unknown", retryable: false, message: e.message };
  return { kind: "unknown", retryable: false, message: e instanceof Error ? e.message : String(e) };
}
