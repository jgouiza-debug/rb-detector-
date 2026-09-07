import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("the breathing pacer renders and returns to the thread", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/pause");
  await expect(page.getByRole("heading", { name: /breathe in|breathe out|hold/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /breathe in/i })).toBeVisible();
  // The ring + mascot are present; the phase countdown is live.
  await expect(page.getByRole("img", { name: /pip/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /i feel ready/i }).click();
  await page.waitForURL("**/thread");
});

test("the pattern toggle switches between box and 4-7-8", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/pause");
  await expect(page.getByRole("button", { name: /4-4-4-4 Box/i })).toBeVisible();
  await page.getByRole("button", { name: /switch rhythm/i }).click();
  await expect(page.getByRole("button", { name: /4-7-8 Calm/i })).toBeVisible();
});
