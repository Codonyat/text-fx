import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    colorScheme: "dark", // keep first-visit OS detection from flipping screenshots to light
  },
  projects: [
    {
      // smoke.spec + regressions.spec — everything except the mobile-only suite.
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 } },
      testIgnore: /mobile\.spec\.ts$/,
    },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 }, hasTouch: true },
      testMatch: /mobile\.spec\.ts$/,
    },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
