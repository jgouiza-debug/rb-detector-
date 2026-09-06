import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { onboard } from "./helpers";

const PAGES = ["/thread", "/timeline", "/settings", "/pause", "/help"];

test("no serious or critical accessibility violations (light)", async ({ page }) => {
  await onboard(page, "Sam");
  await page.request.post("/api/synthesize", {});
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, `${path}: ${serious.map((v) => v.id).join(", ")}`).toEqual([]);
  }
});

test("no serious or critical accessibility violations (dark)", async ({ page }) => {
  await onboard(page, "Sam");
  await page.goto("/settings/notifications");
  await page.getByRole("radio", { name: /dark/i }).click();
  for (const path of ["/thread", "/timeline", "/settings"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, `${path} (dark): ${serious.map((v) => v.id).join(", ")}`).toEqual([]);
  }
});
