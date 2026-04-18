const { test, expect, chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL || "https://example.com";

const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
];

const DEVICES = [
  { name: "macOS-Chrome", caps: { browser: "chrome", os: "OSX", os_version: "Sonoma", name: "mac-chrome" } },
  { name: "Windows-Chrome", caps: { browser: "chrome", os: "Windows", os_version: "11", name: "win-chrome" } },
  { name: "iPhone-14", caps: { browser: "playwright-webkit", os_version: "16", device: "iPhone 14", real_mobile: "true", name: "iphone14" } },
  { name: "iPhone-SE", caps: { browser: "playwright-webkit", os_version: "15", device: "iPhone SE 2022", real_mobile: "true", name: "iphoneSE" } },
  { name: "Galaxy-S23", caps: { browser: "chrome", os_version: "13.0", device: "Samsung Galaxy S23", real_mobile: "true", name: "galaxyS23" } },
];

test.describe.configure({ mode: "parallel" });
test.setTimeout(180_000);

for (const { name, caps } of DEVICES) {
  test(`smoke on ${name}`, async () => {
    const fullCaps = {
      ...caps,
      "browserstack.username": process.env.BROWSERSTACK_USERNAME,
      "browserstack.accessKey": process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: "QA Template",
      buildName: `qa-template-${Date.now()}`,
    };
    const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(fullCaps))}`;
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
        if (errors.length) failures.push(`${p}: JS errors`);
        const nav = await page.locator("nav, header").first().isVisible().catch(() => false);
        if (!nav) failures.push(`${p}: nav not visible`);
      }
    } finally {
      await browser.close();
    }
    expect(failures, `Fails on ${name}:\n${failures.join("\n")}`).toHaveLength(0);
  });
}
