const { test, expect } = require('@playwright/test');
const { _android } = require('playwright');

const BASE = process.env.BASE_URL || "https://example.com";

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
];

const MOBILE_DEVICES = [
  {
    name: "Pixel-8-Android14",
    caps: {
      "LT:Options": {
        platformName: "android",
        deviceName: "Pixel 8",
        platformVersion: "14",
        isRealMobile: true,
        build: "qa-template-mobile",
        name: "Pixel 8",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
        console: true,
      },
    },
  },
  {
    name: "Galaxy-S23-Android13",
    caps: {
      "LT:Options": {
        platformName: "android",
        deviceName: "Galaxy S23",
        platformVersion: "13",
        isRealMobile: true,
        build: "qa-template-mobile",
        name: "Galaxy S23",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
      },
    },
  },
];

test.describe.configure({ mode: "parallel" });
test.setTimeout(240_000);

for (const { name, caps } of MOBILE_DEVICES) {
  test(`mobile smoke on ${name}`, async () => {
    const ws = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`;
    const device = await _android.connect(ws);
    const context = await device.launchBrowser();
    context.setDefaultTimeout(60_000);
    const page = await context.newPage();

    const failures = [];
    try {
      for (const { path, name: p } of PAGES) {
        const errors = [];
        page.removeAllListeners("pageerror");
        page.on("pageerror", (e) => errors.push(e.message));
        const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45_000 });
        if (!r || r.status() >= 400) { failures.push(`${p}: HTTP ${r?.status()}`); continue; }
        if (errors.length) failures.push(`${p}: JS errors`);
        const nav = await page.locator("nav, header").first().isVisible().catch(() => false);
        if (!nav) failures.push(`${p}: nav not visible`);
      }
    } finally {
      await context.close();
      await device.close();
    }

    expect(failures, `Fails on ${name}:\n${failures.join("\n")}`).toHaveLength(0);
  });
}
