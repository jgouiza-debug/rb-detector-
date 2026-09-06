import { expect, test } from "@playwright/test";

test("welcome renders with the mascot and CTA", async ({ page }) => {
  await page.goto("/welcome");
  await expect(page.getByRole("heading", { name: /hey, i'm pip/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /hey pip/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /pip/i }).first()).toBeVisible();
});

test("dev gallery shows all five expressions", async ({ page }) => {
  await page.goto("/dev/gallery");
  for (const e of ["listening", "happy", "thinking", "cozy", "concern"]) {
    await expect(page.getByTestId(`pip-${e}`)).toBeVisible();
  }
});
