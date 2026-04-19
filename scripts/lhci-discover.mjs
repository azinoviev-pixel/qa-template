#!/usr/bin/env node
// Generates lighthouserc.json with URLs discovered from sitemap.xml.
// Priority: LHCI_URLS env -> BASE_URL/sitemap.xml -> BASE_URL alone.

import { writeFileSync } from 'node:fs';

const BASE_URL = process.env.BASE_URL;
const LHCI_URLS = process.env.LHCI_URLS;

if (!BASE_URL) {
  console.error('[lhci-discover] BASE_URL not set');
  process.exit(1);
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.text();
}

async function discover() {
  if (LHCI_URLS) {
    const urls = LHCI_URLS.split(',').map((u) => u.trim()).filter(Boolean);
    console.log(`[lhci-discover] Using ${urls.length} URLs from LHCI_URLS`);
    return urls;
  }
  try {
    const sitemapUrl = BASE_URL.replace(/\/$/, '') + '/sitemap.xml';
    const xml = await fetchText(sitemapUrl);
    const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (matches.length > 0) {
      console.log(`[lhci-discover] Found ${matches.length} URLs in ${sitemapUrl}`);
      return matches.slice(0, 15);
    }
  } catch (e) {
    console.log(`[lhci-discover] sitemap.xml unavailable (${e.message})`);
  }
  console.log(`[lhci-discover] Fallback to BASE_URL only`);
  return [BASE_URL];
}

const urls = await discover();
const config = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};

writeFileSync('lighthouserc.json', JSON.stringify(config, null, 2));
console.log(`[lhci-discover] Wrote lighthouserc.json with ${urls.length} URLs:`);
urls.forEach((u) => console.log(`  - ${u}`));
