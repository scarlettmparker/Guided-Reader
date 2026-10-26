import { defineConfig } from "@playwright/test";

import { APP_URL } from "./support/env";
import { STORAGE_STATE_PATH } from "./support/fixture";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./support/global-setup.ts",
  globalTeardown: "./support/global-teardown.ts",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 15_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: APP_URL,
    storageState: STORAGE_STATE_PATH,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
});
