import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

// Local mode: a registered push subscription plus the cron tick (authorized with
// the local secret) writes the morning nudge to the outbox.
//
// The subscription is registered through the same /api/push/subscribe endpoint the
// "turn on notifications" button posts to. We call it directly rather than clicking
// the button because headless Chromium reports `Notification.permission` as "denied"
// even when the permission is granted (navigator.permissions.query correctly says
// "granted"), so the UI gate can't be exercised reliably here.
test("a registered subscription receives a morning nudge from the tick", async ({ page }) => {
  await onboard(page, "Sam");
  // Set a morning time we can trigger.
  await page.request.patch("/api/settings/profile", { data: { morningTime: "08:30", timezone: "UTC", prefs: { morningEnabled: true } } });
  // Register a push subscription (local synthetic endpoint, exactly as the UI does).
  const sub = await page.request.post("/api/push/subscribe", { data: { endpoint: "local://self", p256dh: "local", auth: "local" } });
  expect(sub.ok()).toBeTruthy();

  // Fire the cron at 09:00 UTC (inside the morning window).
  const res = await page.request.get("/api/cron/tick", { headers: { authorization: "Bearer local", "x-pip-test-now": "2026-06-10T09:00:00Z" } });
  expect(res.ok()).toBeTruthy();

  // The outbox now holds a morning nudge.
  const outbox = await (await page.request.get("/api/dev/outbox")).json();
  const tags = outbox.outbox.map((r: { payload: { tag: string } }) => r.payload.tag);
  expect(tags).toContain("morning");
});

// A second tick in the same window must not send a duplicate (nudge_log dedupes).
test("a second tick in the same window does not duplicate the nudge", async ({ page }) => {
  await onboard(page, "Sam");
  await page.request.patch("/api/settings/profile", { data: { morningTime: "08:30", timezone: "UTC", prefs: { morningEnabled: true } } });
  await page.request.post("/api/push/subscribe", { data: { endpoint: "local://self", p256dh: "local", auth: "local" } });
  const hdrs = { authorization: "Bearer local", "x-pip-test-now": "2026-06-10T09:00:00Z" };
  await page.request.get("/api/cron/tick", { headers: hdrs });
  await page.request.get("/api/cron/tick", { headers: { ...hdrs, "x-pip-test-now": "2026-06-10T10:00:00Z" } });
  const outbox = await (await page.request.get("/api/dev/outbox")).json();
  const morning = outbox.outbox.filter((r: { payload: { tag: string } }) => r.payload.tag === "morning");
  expect(morning.length).toBe(1);
});
