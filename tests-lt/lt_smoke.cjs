const { test, expect, chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL || "https://example.com";

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
];

// LambdaTest Playwright capabilities format
const DEVICES = [
  {
    name: "macOS-Sonoma-Chrome",
    caps: {
      browserName: "Chrome",
      browserVersion: "latest",
      "LT:Options": {
        platform: "MacOS Sonoma",
        build: "qa-template",
        name: "macOS Chrome",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
        console: true,
        network: false,
      },
    },
  },
  {
    name: "Windows11-Chrome",
    caps: {
      browserName: "Chrome",
      browserVersion: "latest",
      "LT:Options": {
        platform: "Windows 11",
        build: "qa-template",
        name: "Windows Chrome",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
      },
    },
  },
  {
    name: "macOS-Safari",
    caps: {
      browserName: "pw-webkit",
      browserVersion: "latest",
      "LT:Options": {
        platform: "MacOS Sonoma",
        build: "qa-template",
        name: "macOS Safari",
        user: process.env.LT_USERNAME,
        accessKey: process.env.LT_ACCESS_KEY,
        video: true,
      },
    },
  },
];

test.describe.configure({ mode: "parallel" });
test.setTimeout(180_000);

for (const { name, caps } of DEVICES) {
  test(`smoke on ${name}`, async () => {
    const wsEndpoint = `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(caps))}`;
    const browser = await chromium.connect(wsEndpoint);
    const page = await browser.newPage();
    const failures = [];
    try {
      for (const { path, name: p } of PAGES) {
        const errors = [];
        page.removeAllListeners("pageerror");
        page.on("pageerror", (e) => errors.push(e.message));
        const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
        if (!r || r.status() >= 400) { failures.push(`${p}: HTTP ${r?.status()}`); continue; }
        if (errors.length) failures.push(`${p}: JS errors → ${errors.join("; ")}`);
        const nav = await page.locator("nav, header").first().isVisible().catch(() => false);
        if (!nav) failures.push(`${p}: nav not visible`);
      }
    } finally {
      await browser.close();
    }
    expect(failures, `Fails on ${name}:\n${failures.join("\n")}`).toHaveLength(0);
  });
}
