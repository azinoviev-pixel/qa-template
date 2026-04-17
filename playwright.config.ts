import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    process.env.CI ? ["github"] : ["line"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  projects: [
    { name: "Desktop Chrome 1920", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
    { name: "Desktop Chrome 1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "Desktop Chrome 1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "Desktop Safari",      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
    { name: "iPhone 14",           use: { ...devices["iPhone 14"] } },
    { name: "iPhone SE",           use: { ...devices["iPhone SE"] } },
    { name: "Pixel 7",             use: { ...devices["Pixel 7"] } },
    { name: "iPad Pro",            use: { ...devices["iPad Pro 11"] } },
  ],
});
