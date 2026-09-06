export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type PushTag = "morning" | "evening" | "day_ready" | "test";

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: PushTag;
}

export interface PushPort {
  send(sub: PushSubscriptionRow, payload: PushPayload): Promise<"ok" | "gone" | "error">;
  publicKey(): string | null;
}
