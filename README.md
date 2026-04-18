# qa-template

> Drop-in QA infrastructure for web projects. Playwright + Lighthouse + axe-core + BrowserStack, wired up with GitHub Actions. **Ten-minute setup on any project.**

[![QA](https://github.com/azinoviev-pixel/qa-template/actions/workflows/qa.yml/badge.svg)](https://github.com/azinoviev-pixel/qa-template/actions/workflows/qa.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Playwright](https://img.shields.io/badge/tests-Playwright-45ba4b)](https://playwright.dev)
[![Lighthouse](https://img.shields.io/badge/perf-Lighthouse%20CI-orange)](https://github.com/GoogleChrome/lighthouse-ci)

---

## What you get

Five layers of automated QA — all running on every push to `main`:

| Layer | Tool | Cost | Finds |
|---|---|---|---|
| Smoke tests | Playwright | free | Page loads, JS errors, horizontal scroll, nav visibility |
| Visual regression | Playwright screenshots | free | Unintended design drift via pixel diff |
| Accessibility (WCAG 2 AA) | axe-core | free | Color contrast, missing labels, ARIA issues |
| Performance + SEO + best practices | Lighthouse CI | free | LCP/CLS/TBT, meta tags, mixed content |
| Real device testing | BrowserStack | $29/mo or trial | iOS Safari bugs that emulation misses |

Tests run on **8 emulated devices** (1920 / 1440 / 1280 desktop, Safari, iPhone 14/SE, Pixel 7, iPad Pro) plus **5 real devices** via BrowserStack (weekly).

---

## Quick start — 3 minutes

### One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/azinoviev-pixel/qa-template/main/install.sh | bash
```

### Or manual

```bash
npx degit azinoviev-pixel/qa-template tests-qa
cd tests-qa
pnpm install
pnpm exec playwright install --with-deps

# Edit tests/smoke.spec.ts → PAGES array with your routes
# Then:
BASE_URL=https://yoursite.com pnpm test
```

Full setup guide: [INSTALL.md](INSTALL.md)

---

## Repository structure

```
qa-template/
├── .github/workflows/
│   ├── qa.yml                    # Playwright + Lighthouse (every push + daily)
│   └── browserstack.yml          # Real devices (weekly + manual)
├── tests/
│   ├── smoke.spec.ts             # Page loads, JS errors, h-scroll, nav
│   ├── a11y.spec.ts              # WCAG 2 AA via axe
│   └── visual.spec.ts            # Pixel diff regression
├── tests-bs/
│   └── bstack_smoke.js           # BrowserStack (single-context mobile-compatible)
├── playwright.config.ts          # 8 device profiles (emulated)
├── playwright.bs.config.js       # CommonJS config for BrowserStack SDK
├── browserstack.yml              # 5 real device platforms
├── lighthouserc.json             # Lighthouse budgets (perf/a11y/SEO/best-practices)
├── install.sh                    # One-liner installer
├── package.json
├── INSTALL.md                    # Detailed setup guide
├── CUSTOMIZATION.md              # Per-framework recipes
├── ARCHITECTURE.md               # Why each tool
├── CHANGELOG.md                  # Version history
└── README.md                     # This file
```

---

## What each workflow does

### `qa.yml` — every push / PR / daily

- **Triggers:** push to main, PR to main, daily 06:00 UTC, manual dispatch
- **Playwright job:** install browsers → run tests on 8 devices → upload HTML report
- **Lighthouse job:** run lhci autorun → check perf/a11y/SEO budgets

Badges show on every commit. Failures block merges (if branch protection enabled).

### `browserstack.yml` — weekly / manual

- **Triggers:** Monday 07:00 UTC, manual dispatch
- **Real-devices job:** install browserstack-node-sdk → run smoke on 5 real devices

Conservative schedule preserves trial/paid minutes. Each run uses ~5–10 min of BrowserStack allowance.

---

## Daily commands

```bash
pnpm test                       # Run everything locally (~2 min on 8 devices)
pnpm test:smoke                 # Smoke only
pnpm test:a11y                  # Accessibility only
pnpm test:visual                # Visual regression
pnpm test:visual:update         # Update baselines (after intentional design changes)
pnpm test:ui                    # Interactive Playwright UI
pnpm report                     # Open last HTML report
pnpm lighthouse                 # Run Lighthouse CI locally
```

---

## Reading failures

| Failure | Where to look |
|---|---|
| Smoke test fails | `pnpm report` → HTML with video + screenshots + trace |
| a11y violations | Check test output for rule IDs, each has a WCAG spec link |
| Visual regression | Report shows expected / actual / diff — compare to decide if intentional |
| Lighthouse budget miss | CI logs contain public report URL valid for 7 days |
| BrowserStack fails | Dashboard at automate.browserstack.com has video per session |

---

## Tuning for your project

- **Fewer devices?** Trim `projects[]` in `playwright.config.ts` down to what you care about
- **Lighthouse budgets too strict?** Adjust thresholds in `lighthouserc.json`
- **BrowserStack too expensive?** Remove `browserstack.yml` workflow; emulation alone finds ~80% of bugs
- **Auth-gated pages?** Use Playwright's `storageState` pattern — add to `playwright.config.ts` `use.storageState`
- **Local dev server for tests?** Set `BASE_URL=http://localhost:5173` in `.env.local`

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for recipes.

---

## Known constraints

- **BrowserStack SDK is flaky at scale.** Keep `browserstack.yml` to 5–7 platforms max.
- **Mobile real devices = single browser context.** BrowserStack tests use one `test()` with a page loop, not test-per-page.
- **Visual regression baselines are platform-specific.** Generate them on the same OS as your CI (Linux for GitHub Actions). First run will always fail until baselines exist.
- **BrowserStack trial is 100 minutes total** (not per month). Schedule weekly to stretch it.

---

## Skills integration (Claude Code)

If you use Claude Code, this template is wired into the `qa-setup` skill. In any project just say:

```
настрой QA в этом проекте
```

Claude will pull the template, adapt routes, configure GitHub, and trigger the first run — about 10 minutes end to end.

See `~/.claude/skills/qa-setup/SKILL.md` for the skill definition.

---

## Contributing

This template evolves as real projects use it. If you find a pattern that helps, open a PR. See [ARCHITECTURE.md](ARCHITECTURE.md) for the design decisions.

---

## License

MIT — use in any project, public or private. See [LICENSE](LICENSE).
