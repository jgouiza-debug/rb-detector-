import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

// Real speech recognition isn't available (or deterministic) in headless Chromium,
// so the sheet falls back to its keyboard path — which drives the same quiet-log
// pipeline: capture -> safety-check -> save, no reply.
test("a voice thought-bump logs quietly with no reply and persists", async ({ page }) => {
  // Headless Chromium exposes webkitSpeechRecognition but never returns results,
  // so remove it to drive the deterministic keyboard fallback (the same path an
  // iOS in-app webview takes). The quiet-log pipeline underneath is identical.
  await page.addInitScript(() => {
    try {
      Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
    } catch {
      /* ignore */
    }
    try {
      Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
    } catch {
      /* ignore */
    }
  });
  await onboard(page, "Sam");

  // The composer's trailing button is the mic while the field is empty.
  await page.getByRole("button", { name: "speak a thought" }).click();

  const field = page.getByLabel("what's on your mind");
  await expect(field).toBeVisible();
  await field.fill("um the garden actually looked alive today");
  await page.getByRole("button", { name: "log it" }).click();

  // It lands as a tidied, mic-marked note (filler stripped, capitalized).
  await expect(page.getByText("The garden actually looked alive today.")).toBeVisible();
  await expect(page.getByText("noted quietly · no reply")).toBeVisible();

  // Pip stays silent — no typing indicator, no reply bubble.
  await expect(page.getByLabel("pip is typing")).toHaveCount(0);

  // It survives a reload (it was really persisted, not just optimistic).
  await page.reload();
  await expect(page.getByText("The garden actually looked alive today.")).toBeVisible();

  // And it counts toward the day: synthesis turns the lone voice note into a keepsake.
  await page.request.post("/api/synthesize", {});
  await page.goto("/timeline");
  await expect(page.getByText(/today's keepsake/i)).toBeVisible({ timeout: 10000 });
});
