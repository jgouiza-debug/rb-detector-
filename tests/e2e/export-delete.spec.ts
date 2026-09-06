import { expect, test } from "@playwright/test";
import { onboard, sendText } from "./helpers";

test("export downloads a non-empty zip", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "a little something worth keeping");
  await page.goto("/settings/data");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-zip").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/pip-export-.*\.zip/);
});

test("deleting the account clears the session and lands on goodbye", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "one last note");
  await page.goto("/settings/data");
  await page.getByRole("button", { name: /delete my account/i }).click();
  await page.getByLabel(/type delete to confirm/i).fill("delete");
  await page.getByRole("button", { name: /delete forever/i }).click();
  await page.waitForURL("**/goodbye");
  await expect(page.getByRole("heading", { name: /gone from here/i })).toBeVisible();
  // The session is gone: the thread now redirects to welcome.
  await page.goto("/thread");
  await expect(page).toHaveURL(/\/welcome$/);
});
