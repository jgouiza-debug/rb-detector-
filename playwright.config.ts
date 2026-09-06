import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    permissions: ["notifications"],
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `${baseURL}/welcome`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      APP_MODE: "local",
      PGLITE_DATA_DIR: ".data/e2e",
      BLOB_DIR: ".data/e2e-blobs",
      NEXT_PUBLIC_SW: "1",
    },
  },
});
