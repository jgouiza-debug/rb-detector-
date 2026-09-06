import { expect, test } from "@playwright/test";
import { onboard, sendText } from "./helpers";

test("a crisis message surfaces resources with 988 and no generative reply", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "i want to kill myself");
  // The templated crisis bubbles and the resources card appear.
  await expect(page.getByText(/glad you did/i)).toBeVisible({ timeout: 10000 });
  const card = page.getByRole("group", { name: /crisis resources|people who can help/i });
  await expect(card).toBeVisible();
  await expect(card.getByText(/988 Suicide/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /call/i }).first()).toBeVisible();
  // The scripted companion line must NOT appear (no generative reply on crisis).
  await expect(page.getByText(/tell me a little more|i hear you/i)).toHaveCount(0);
});

test("figurative 'killing me' is treated as an ordinary message", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "this deadline is killing me honestly");
  await expect(page.getByText(/i hear you|tell me|right here|a lot to carry/i).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("group", { name: /people who can help/i })).toHaveCount(0);
});
