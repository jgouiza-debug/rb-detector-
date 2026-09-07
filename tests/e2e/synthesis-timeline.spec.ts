import { expect, test } from "@playwright/test";
import { onboard, sendText } from "./helpers";

test("a day of messages becomes a browsable memory on the timeline", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "today was genuinely good, i felt proud of the work");
  await expect(page.getByText(/proud/i).first()).toBeVisible();

  // Wrap up the day on demand.
  await page.request.post("/api/synthesize", {});
  await page.goto("/timeline");
  await expect(page.getByRole("heading", { name: /Your Story/i })).toBeVisible();
  await expect(page.getByText(/today's keepsake/i)).toBeVisible({ timeout: 10000 });
  // The keepsake card links to the day detail; follow it and confirm the keepsake view.
  const href = await page.getByRole("link", { name: /^open$/i }).first().getAttribute("href");
  expect(href).toMatch(/\/memory\//);
  await page.goto(href!);
  await expect(page.getByRole("tab", { name: /Keepsake Card/i })).toBeVisible({ timeout: 10000 });
});

test("timeline search narrows to a matching memory", async ({ page }) => {
  await onboard(page, "Sam");
  await page.request.post("/api/dev/seed", { data: { days: 6 } });
  await page.goto("/timeline");
  await page.getByLabel("search memories").fill("amber leaves");
  await expect(page.getByText(/amber leaves|walk/i).first()).toBeVisible({ timeout: 10000 });
});
