import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:8081";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions: process.env.FAULTSCOPE_CHROME_PATH
      ? { executablePath: process.env.FAULTSCOPE_CHROME_PATH }
      : undefined,
  },
  webServer: {
    command: "../dist/faultscope --listen 127.0.0.1:8081",
    url: `${baseURL}/healthz`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
