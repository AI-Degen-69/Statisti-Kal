#!/usr/bin/env node
/**
 * build-og-image.mjs — Renders og-image.svg → og-image.png (1200x630) and
 * favicon.svg → apple-touch-icon.png (180x180) using Playwright headless
 * Chromium and Google-Fonts-loaded HTML wrappers.
 *
 * Why an HTML wrapper instead of opening the .svg directly?
 *   - Document loaded as an SVG has no `document.body`, so any styling that
 *     touches `<body>` throws.
 *   - The wrapper pulls in Google Fonts via `<link>`, so we screenshot the
 *     same fonts that the live page renders with — no font-substitution drift
 *     between the OG card and what the user sees on the site.
 *
 * Usage:
 *   node scripts/build-og-image.mjs           # one-shot
 *   npm run build:og                          # via package.json script
 *
 * Wired into `npm run build` so production deploys always ship a fresh card.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const RENDERS = [
  {
    src: 'og-image.svg',
    out: 'og-image.png',
    width: 1200,
    height: 630,
    background: null,
  },
  {
    src: 'favicon.svg',
    out: 'apple-touch-icon.png',
    width: 180,
    height: 180,
    background: '#0E0F12',
  },
];

// Same Google-Fonts URL shape as web/index.html so the OG card and the live
// site render with the same fonts. Includes the Hebrew Assistant weights.
const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Frank+Ruhl+Libre:wght@400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Geist+Mono&display=swap" rel="stylesheet" />';

function wrapSvg(svgContent, { width, height, background }) {
  const bg = background ?? 'transparent';
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    ${FONT_LINK}
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${width}px;
        height: ${height}px;
        background: ${bg};
        overflow: hidden;
      }
      svg { display: block; width: 100%; height: 100%; }
    </style>
  </head>
  <body>${svgContent}</body>
</html>`;
}

async function renderOne(browser, target) {
  const page = await browser.newPage({
    viewport: { width: target.width, height: target.height },
    deviceScaleFactor: 1,
  });

  const svgContent = readFileSync(join(PUBLIC_DIR, target.src), 'utf8');
  const html = wrapSvg(svgContent, target);
  await page.setContent(html, { waitUntil: 'load' });

  // Wait for Google Fonts to actually arrive, capped so a flaky network
  // never blocks a build indefinitely. If fonts don't arrive in 8s we still
  // fall through to the screenshot (browser will substitute system fallback).
  await page
    .waitForFunction(
      () => typeof document.fonts !== 'undefined' && document.fonts.status === 'loaded',
      { timeout: 8000 },
    )
    .catch(() => undefined);

  const outPath = join(PUBLIC_DIR, target.out);
  await page.screenshot({
    path: outPath,
    fullPage: false,
    type: 'png',
    omitBackground: target.background === null,
  });
  await page.close();

  console.log(`  • ${target.src}  →  ${target.out}  (${target.width}×${target.height})`);
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    // Don't fail the whole production build if the Chromium binary is missing
    // (e.g. on a clean Vercel build image). The OG assets are committed to the
    // repo, so deploys still ship a valid social card without regenerating it.
    console.warn(
      'build-og-image: skipped — Playwright Chromium not available.\n' +
        `  (${error instanceof Error ? error.message : String(error)})\n` +
        '  Using committed og-image.png / apple-touch-icon.png instead.',
    );
    return;
  }

  try {
    for (const target of RENDERS) {
      await renderOne(browser, target);
    }
  } finally {
    await browser.close();
  }

  console.log('build-og-image: done.');
}

main().catch((error) => {
  console.error('build-og-image: unexpected error:', error);
  process.exit(1);
});
