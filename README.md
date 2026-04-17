# qa-template

Universal QA template for web projects. Drop it into any new project in 30 seconds.

**Stack:** Playwright (functional + visual regression) + Lighthouse CI (performance + SEO) + axe-core (accessibility) + GitHub Actions (CI).

---

## Quick install in a new project

```bash
# From the root of your project:
npx degit azinoviev-pixel/qa-template tests-qa

cd tests-qa
pnpm install
pnpm exec playwright install --with-deps

# Run locally against deployed site:
BASE_URL=https://yoursite.com pnpm test

# Or against local dev server:
BASE_URL=http://localhost:3000 pnpm test
```

---

## What's inside

```
qa-template/
├── playwright.config.ts       # 8 device profiles (desktop + mobile + tablet)
├── tests/
│   ├── smoke.spec.ts          # every page loads, no JS errors, no h-scroll, iOS zoom fix
│   ├── a11y.spec.ts           # WCAG 2 AA via axe-core
│   └── visual.spec.ts         # pixel-diff screenshots
├── lighthouserc.json          # Lighthouse CI — perf/a11y/SEO budgets
├── .github/workflows/qa.yml   # runs on push, PR, daily 06:00 UTC
└── package.json
```

---

## Per-project setup

### 1. Edit `tests/smoke.spec.ts`

Add your routes to `PAGES`:
```ts
const PAGES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/contact", name: "Contact" },
];
```

### 2. Edit `tests/a11y.spec.ts` and `tests/visual.spec.ts`

Same — add all routes you want checked.

### 3. Set `BASE_URL` in GitHub

Repo → Settings → Secrets and variables → Actions → Variables → new variable `BASE_URL` = `https://yoursite.com`.

### 4. Copy workflow to your project

```bash
cp -r tests-qa/.github/workflows/qa.yml .github/workflows/
```

### 5. First visual baseline

```bash
BASE_URL=https://yoursite.com pnpm test:visual:update
git add tests/visual.spec.ts-snapshots/
git commit -m "QA: visual baseline"
```

---

## Daily usage

| Command | What it does |
|---|---|
| `pnpm test` | Run everything (~2 min on 8 devices) |
| `pnpm test:smoke` | Only smoke tests |
| `pnpm test:a11y` | Only accessibility checks |
| `pnpm test:visual` | Pixel diff against baseline |
| `pnpm test:visual:update` | Update baselines (after intentional design change) |
| `pnpm test:ui` | Interactive Playwright UI mode |
| `pnpm report` | Open HTML report |
| `pnpm lighthouse` | Run Lighthouse CI locally |

---

## How to read failures

### Smoke test failed
- Check the HTML report (`pnpm report`) — has video + screenshot + trace
- JS error? → fix in app code
- Horizontal scroll? → find overflowing element (usually wide image/table)

### Visual regression failed
- Report shows **expected / actual / diff** images
- If intentional change → `pnpm test:visual:update`
- If unintentional → CSS regression, fix it

### a11y failed
- `critical` and `serious` violations fail build
- `moderate` and `minor` only logged (adjust in `a11y.spec.ts`)
- Each violation has URL to WCAG rule explaining the fix

### Lighthouse failed
- Budgets are in `lighthouserc.json`
- Report URL printed in CI logs (hosted on public storage for 7 days)

---

## Tuning per project

- **Animations breaking visual tests** → `animations: "disabled"` in `use`
- **Dynamic content** (carousels, dates) → mask with `data-dynamic` attr, hide before screenshot
- **Auth-gated pages** → create `fixtures/auth.ts` with logged-in state (see Playwright storageState docs)
- **Slow site** → bump `navigationTimeout` in `playwright.config.ts`

---

## License

MIT — use in any project, public or private.
