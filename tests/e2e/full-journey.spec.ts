import path from "node:path";
import { expect, test } from "@playwright/test";
import { onboard, sendText } from "./helpers";

// The whole bounty loop in one run: meet Pip -> talk -> photo -> reply -> crisis
// safety -> synthesis -> timeline -> paywall -> pay -> unlock -> export -> breathe -> delete.
test("a stranger can go from hello to a paid, exported, deleted account", async ({ page }) => {
  await onboard(page, "Riley");
  await expect(page.getByText(/hey riley/i)).toBeVisible();

  // Talk + photo.
  await sendText(page, "today was a good one, i felt proud of the work");
  await expect(page.getByText(/proud/i).first()).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "photo.jpg"));
  await page.getByLabel("message pip").fill("the light this morning");
  await page.getByRole("button", { name: "send" }).click();
  await expect(page.getByText("the light this morning")).toBeVisible();

  // Safety.
  await sendText(page, "i want to kill myself");
  await expect(page.getByRole("group", { name: /people who can help/i })).toBeVisible({ timeout: 10000 });

  // Synthesis + timeline.
  await page.request.post("/api/synthesize", {});
  await page.goto("/timeline");
  await expect(page.getByText(/today's keepsake/i)).toBeVisible({ timeout: 10000 });

  // Paywall -> pay -> unlock.
  await page.request.post("/api/dev/seed", { data: { days: 10 } });
  await page.goto("/timeline");
  await page.getByRole("button", { name: /keep it all/i }).click();
  await page.waitForURL("**/dev/checkout**");
  await page.getByTestId("dev-pay").click();
  await page.waitForURL("**/timeline**");
  await expect(page.getByRole("button", { name: /keep it all/i })).toHaveCount(0, { timeout: 10000 });

  // Breathe.
  await page.goto("/pause");
  await page.getByRole("button", { name: /i feel ready/i }).click();
  await page.waitForURL("**/thread");

  // Export + delete.
  await page.goto("/settings/data");
  const dl = page.waitForEvent("download");
  await page.getByTestId("export-zip").click();
  await (await dl).suggestedFilename();
  await page.getByRole("button", { name: /delete my account/i }).click();
  await page.getByLabel(/type delete to confirm/i).fill("delete");
  await page.getByRole("button", { name: /delete forever/i }).click();
  await page.waitForURL("**/goodbye");
  await expect(page.getByRole("heading", { name: /gone from here/i })).toBeVisible();
});
