import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

test("onboarding lands in the thread with a personalized greeting", async ({ page }) => {
  await onboard(page, "Riley");
  await expect(page).toHaveURL(/\/thread$/);
  // Pip speaks first, using the name.
  await expect(page.getByText(/hey riley/i)).toBeVisible();
  await expect(page.getByText(/glad you're here/i)).toBeVisible();
  // The safety note is present and links to help.
  await expect(page.getByRole("link", { name: /get help now/i }).last()).toBeVisible();
});
