import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("the web manifest advertises an installable app", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.name).toBe("pip");
  expect(m.start_url).toBe("/thread");
  expect(m.display).toBe("standalone");
  expect(m.icons.length).toBeGreaterThanOrEqual(2);
});

test("the service worker script is served with the right headers", async ({ request }) => {
  const res = await request.get("/sw.js");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["content-type"]).toContain("javascript");
  expect(res.headers()["service-worker-allowed"]).toBe("/");
  const body = await res.text();
  expect(body).toContain('addEventListener("push"');
  expect(body).toContain('addEventListener("notificationclick"');
});

test("the offline shell page loads", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/offline");
  await expect(page.getByText(/we're offline/i)).toBeVisible();
});
