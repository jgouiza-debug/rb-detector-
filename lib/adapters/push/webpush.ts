import webpush from "web-push";
import { getEnv } from "@/lib/env";
import type { PushPayload, PushPort, PushSubscriptionRow } from "@/lib/ports/push";

let configured = false;
function ensure() {
  if (configured) return;
  const env = getEnv();
  webpush.setVapidDetails(env.push.subject, env.push.publicKey as string, env.push.privateKey as string);
  configured = true;
}

export function webPush(): PushPort {
  return {
    async send(sub: PushSubscriptionRow, payload: PushPayload) {
      ensure();
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
        return "ok";
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) return "gone";
        return "error";
      }
    },
    publicKey() {
      return getEnv().push.publicKey;
    },
  };
}
