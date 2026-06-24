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
    viewport: { width: 1280, height: 900 },
    colorScheme: "dark", // keep first-visit OS detection from flipping screenshots to light
  },
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
