const { test, expect } = require("@playwright/test");

const BASE = process.env.BASE_URL || "http://localhost:5173";

// EDIT PER PROJECT: list critical routes to check on real devices.
// Keep list short (3-5 pages) to stay within BrowserStack trial/paid minutes.
const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
];

// Single test with a loop — required for BrowserStack mobile single-context constraint.
test("Site smoke on real devices", async ({ page }) => {
  const failures = [];

  for (const { path, name } of PAGES) {
    const errors = [];
    page.removeAllListeners("pageerror");
    page.on("pageerror", (e) => errors.push(e.message));

    try {
      const r = await page.goto(`${BASE}${path}`, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      if (!r || r.status() >= 400) {
        failures.push(`${name}: HTTP ${r?.status()}`);
        continue;
      }
      if (errors.length) failures.push(`${name}: JS errors → ${errors.join("; ")}`);

      const hScroll = await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth + 5
      );
      if (hScroll) {
        const vw = await page.evaluate(() => window.innerWidth);
        const sw = await page.evaluate(() => document.body.scrollWidth);
        failures.push(`${name}: Horizontal scroll (body=${sw}px, viewport=${vw}px)`);
      }

      const navVisible = await page
        .locator("nav, header")
        .first()
        .isVisible()
        .catch(() => false);
      if (!navVisible) failures.push(`${name}: nav/header not visible`);
    } catch (e) {
      failures.push(`${name}: EXCEPTION ${e.message}`);
    }
  }

  console.log(`\n=== Checked ${PAGES.length} pages on BrowserStack ===`);
  console.log(`Failures: ${failures.length}/${PAGES.length}`);
  failures.forEach((f) => console.log("  - " + f));

  expect(failures, `Site issues found:\n${failures.join("\n")}`).toHaveLength(0);
});
