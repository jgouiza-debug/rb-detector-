import { expect, test } from "@playwright/test";
import { onboard, sendText } from "./helpers";

test("send a message, get a reply, and it persists across reload", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "i had a really nice walk today");
  // Optimistic user bubble appears immediately.
  await expect(page.getByText("i had a really nice walk today")).toBeVisible();
  // Pip replies (scripted).
  await expect(page.getByText(/i hear you|tell me|right here/i).first()).toBeVisible({ timeout: 10000 });

  await page.reload();
  await expect(page.getByText("i had a really nice walk today")).toBeVisible();
});

test("a tired message gets the two-bubble reflective reply", async ({ page }) => {
  await onboard(page, "Sam");
  await sendText(page, "i'm so exhausted and drained");
  await expect(page.getByText(/a lot to carry today/i)).toBeVisible({ timeout: 10000 });
});
