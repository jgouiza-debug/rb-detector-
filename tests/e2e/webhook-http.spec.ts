import { expect, test } from "@playwright/test";

// The critic's finding: proxy.ts must never redirect the Stripe webhook (no cookies)
// or the cron endpoint. These POST/GET without a session and must return JSON, never a 3xx.
test("the billing webhook is reachable without a session and never redirects", async ({ request }) => {
  const res = await request.post("/api/billing/webhook", { data: { hello: "world" }, maxRedirects: 0 });
  // Local mock parseWebhook returns [] -> 200 received. The point: not a 3xx to /welcome.
  expect(res.status()).toBeLessThan(300);
  expect(res.status()).toBeGreaterThanOrEqual(200);
});

test("the cron endpoint rejects an unauthenticated call with 401 JSON, not a redirect", async ({ request }) => {
  const res = await request.get("/api/cron/tick", { maxRedirects: 0 });
  expect(res.status()).toBe(401);
});

test("an app API without a session returns 401 JSON, never a 307 redirect", async ({ request }) => {
  const res = await request.get("/api/me", { maxRedirects: 0 });
  expect(res.status()).toBe(401);
});
