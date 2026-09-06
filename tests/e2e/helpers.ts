import { expect, type Page } from "@playwright/test";

/** Walk the whole onboarding flow and land in the thread. */
export async function onboard(page: Page, name = "Sam"): Promise<void> {
  await page.goto("/welcome");
  await page.getByRole("button", { name: /hey pip/i }).click();
  await page.waitForURL("**/name");
  await page.getByLabel("your name").fill(name);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForURL("**/focus");
  await page.getByRole("checkbox", { name: "processing a lot" }).click();
  await page.getByRole("button", { name: /^continue$/i }).click();
  await page.waitForURL("**/rhythm");
  await page.getByRole("button", { name: /skip for now/i }).click();
  await page.waitForURL("**/notify");
  await page.getByRole("button", { name: /not now/i }).click();
  await page.waitForURL("**/thread");
}

export async function sendText(page: Page, text: string): Promise<void> {
  const box = page.getByLabel("message pip");
  await box.fill(text);
  await page.getByRole("button", { name: "send" }).click();
}
