import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("settings hub and rhythm save", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get help now/i })).toBeVisible();

  await page.getByRole("link", { name: /your rhythm/i }).click();
  await page.waitForURL("**/settings/notifications");
  await page.getByRole("button", { name: /save my rhythm/i }).click();
  await expect(page.getByText(/rhythm saved/i)).toBeVisible();
});

test("anonymous account can be linked with an email (local code 000000)", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/settings/account");
  await page.getByLabel("email").fill("sam@example.com");
  await page.getByRole("button", { name: /send code/i }).click();
  await page.getByLabel("code").fill("000000");
  await page.getByRole("button", { name: /confirm/i }).click();
  await expect(page.getByText("sam@example.com")).toBeVisible({ timeout: 10000 });
});
