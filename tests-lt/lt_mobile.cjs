const { test, expect } = require('@playwright/test');
const { _android } = require('playwright');

const BASE = process.env.BASE_URL || "https://example.com";

const PAGES = [
  { path: "/", name: "Home" },
];

// Try Pixel 5 first — it's the only device in LT docs example
const MOBILE_DEVICES = [
  {
    name: "Pixel-5-Android11",
    caps: {
      "LT:Options": {
        platformName: "android",
        deviceName: "Pixel 5",
        platformVersion: "11",
        isRealMobile: true,
        build: "qa-template-mobile",
        name: "Pixel 5 test",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
      },
    },
  },
];

test.describe.configure({ mode: "parallel" });
test.setTimeout(300_000);

for (const { name, caps } of MOBILE_DEVICES) {
  test(`mobile smoke on ${name}`, async () => {
    const ws = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`;
    const device = await _android.connect(ws);
    const context = await device.launchBrowser();
    context.setDefaultTimeout(60_000);
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
      await expect(page.locator("nav, header").first()).toBeVisible();
    } finally {
      await context.close();
      await device.close();
    }
  });
}
