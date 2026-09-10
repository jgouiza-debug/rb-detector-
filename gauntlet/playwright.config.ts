import { defineConfig } from "@playwright/test";

/**
 * The UI Gauntlet's gate runner. Separate from the e2e suite on purpose: it is
 * a measurement harness, not a regression test, and it writes screenshots + a
 * machine gate report into gauntlet/rounds/round-NN/ for the council to judge.
 *
 *   GAUNTLET_ROUND=01 pnpm gauntlet:gates
 */
const PORT = Number(process.env.GAUNTLET_PORT ?? 3200);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: ".",
  testMatch: /gate\.spec\.ts/,
  outputDir: ".results",
  workers: 1,
  retries: 0,
  timeout: 240_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    permissions: ["notifications"],
    // Real motion by default; the reduced-motion check opens its own context.
    contextOptions: { reducedMotion: "no-preference" },
  },
  projects: [
    // Same fixed mobile viewport as tests/e2e (see the note in playwright.config.ts).
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: true } },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `${baseURL}/welcome`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      APP_MODE: "local",
      PGLITE_DATA_DIR: ".data/gauntlet",
      BLOB_DIR: ".data/gauntlet-blobs",
    },
  },
});
