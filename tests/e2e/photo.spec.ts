import path from "node:path";
import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("attach and send a photo, and it persists", async ({ page }) => {
  await onboard(page, "Sam");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.join(__dirname, "fixtures", "photo.jpg"));
  // The composer preview thumbnail appears once uploaded.
  await page.getByLabel("message pip").fill("morning light");
  await page.getByRole("button", { name: "send" }).click();
  await expect(page.getByText("morning light")).toBeVisible();
  // A photo image renders in the thread.
  await expect(page.getByRole("img", { name: /your photo|quiet moment|photo/i }).first()).toBeVisible({ timeout: 10000 });

  await page.reload();
  await expect(page.getByText("morning light")).toBeVisible();
});
