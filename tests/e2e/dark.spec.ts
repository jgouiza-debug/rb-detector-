import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("dark mode toggle sets the theme and persists", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/settings/notifications");
  await page.getByRole("radio", { name: /dark/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // Persists across a reload (the inline theme script applies it before paint).
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
