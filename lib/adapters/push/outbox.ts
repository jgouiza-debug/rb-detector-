import { getDb } from "@/lib/db/client";
import { pushOutbox } from "@/lib/db/schema";
import type { PushPayload, PushPort, PushSubscriptionRow } from "@/lib/ports/push";

/** Local push: append to push_outbox (readable at /dev/outbox). Endpoints look like local://<userId>. */
export function outboxPush(): PushPort {
  return {
    async send(sub: PushSubscriptionRow, payload: PushPayload) {
      const userId = sub.endpoint.startsWith("local://") ? sub.endpoint.slice("local://".length) : sub.endpoint;
      const db = await getDb();
      try {
        await db.insert(pushOutbox).values({ userId, payload: payload as unknown as Record<string, unknown> });
        return "ok";
      } catch {
        return "error";
      }
    },
    publicKey() {
      return "local-vapid-public-key";
    },
  };
}
