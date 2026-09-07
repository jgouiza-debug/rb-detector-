import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

// The bounty finish line: free -> mock checkout -> unlocked -> portal cancel keeps
// access -> expire -> locked, all through the same applyBillingEvent the real
// Stripe webhook uses.
test("free user upgrades through mock checkout and the timeline unlocks", async ({ page }) => {
  await onboard(page, "Sam");
  // Seed 10 days so the paywall (and locked days) appear.
  await page.request.post("/api/dev/seed", { data: { days: 10 } });
  await page.goto("/timeline");
  await expect(page.getByText("last 7 days", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /keep it all/i })).toBeVisible();

  await page.getByRole("button", { name: /keep it all/i }).click();
  await page.waitForURL("**/dev/checkout**");
  await page.getByTestId("dev-pay").click();

  // Lands back in the app, now Pip+ (no window pill, no paywall).
  await page.waitForURL("**/timeline**");
  await expect(page.getByText("last 7 days", { exact: true })).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByRole("button", { name: /keep it all/i })).toHaveCount(0);

  // Settings shows Pip+ active.
  await page.goto("/settings/subscription");
  await expect(page.getByText(/Pip\+/).first()).toBeVisible();

  // Portal cancel-at-period-end keeps access.
  await page.getByRole("button", { name: /manage subscription/i }).click();
  await page.waitForURL("**/dev/portal**");
  await page.getByTestId("portal-cancel").click();
  await page.waitForURL("**/settings/subscription**");
  await expect(page.getByText(/access until|Pip\+/i).first()).toBeVisible();

  // Expire now -> back to free -> paywall returns.
  await page.getByRole("button", { name: /manage subscription/i }).click();
  await page.waitForURL("**/dev/portal**");
  await page.getByTestId("portal-expire").click();
  await page.waitForURL("**/settings/subscription**");
  await page.goto("/timeline");
  await expect(page.getByRole("button", { name: /keep it all/i })).toBeVisible({ timeout: 10000 });
});

test("a locked older day shows the paywall instead of the memory", async ({ page }) => {
  await onboard(page, "Sam");
  await page.request.post("/api/dev/seed", { data: { days: 10 } });
  // A day well outside the 7-day window.
  const locked = new Date();
  locked.setDate(locked.getDate() - 9);
  const iso = locked.toISOString().slice(0, 10);
  await page.goto(`/memory/${iso}`);
  await expect(page.getByRole("button", { name: /keep it all/i })).toBeVisible({ timeout: 10000 });
});
