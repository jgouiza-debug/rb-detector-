"use client";

/**
 * Ask for notification permission and register a push subscription. In local
 * mode (no VAPID public key) we skip pushManager entirely and register a
 * synthetic `local://<sessionUserId>` endpoint so the DB + scheduler paths run
 * and Playwright can assert nudges via the outbox. Best-effort: never throws to
 * the caller for a denied permission.
 */
export async function subscribeToPush(): Promise<"subscribed" | "denied" | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  let permission: NotificationPermission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch {
      return "denied";
    }
  }
  if (permission !== "granted") return "denied";

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  try {
    if (vapid && "serviceWorker" in navigator && "PushManager" in window) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) });
      const json = sub.toJSON();
      await postSubscription({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" });
    } else {
      // Local mode: synthetic endpoint. The server fills in the user id.
      await postSubscription({ endpoint: "local://self", p256dh: "local", auth: "local" });
    }
    return "subscribed";
  } catch {
    return "denied";
  }
}

async function postSubscription(body: { endpoint: string; p256dh: string; auth: string }): Promise<void> {
  await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
}

function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
