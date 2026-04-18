// Separate config for BrowserStack run — CommonJS required by their SDK.
// Does NOT interfere with main playwright.config.ts (used by regular CI).
const config = {
  testDir: "./tests-bs",
  testMatch: "**/bstack_*.cjs",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [["line"]],
  projects: [
    {
      name: "chrome",
      use: { browserName: "chromium", channel: "chrome" },
    },
  ],
};

module.exports = config;
