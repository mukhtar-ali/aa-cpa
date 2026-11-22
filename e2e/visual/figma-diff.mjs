#!/usr/bin/env node
/**
 * Visual parity check (task T107): compares the reference homepage with the Figma export of node 411:169.
 *
 *   node e2e/visual/figma-diff.mjs [--url URL] [--figma PNG] [--out DIR] [--tolerance N] [--max-diff-pct N] [--lang ar|en]
 *   node e2e/visual/figma-diff.mjs --selftest
 *
 * Inputs
 *   --figma   Figma export of 411:169 at 1x (1512 px wide). Default e2e/visual/figma/home-1512.png
 *   --url     Page to capture. Default http://localhost:3000/<lang>/reference/home (start the web app with
 *             ENABLE_REFERENCE_PAGES=true)
 *   masks     e2e/visual/masks.json: [{ "name": "hero photo", "x": 0, "y": 0, "width": 100, "height": 100 }, ...] in Figma
 *             pixel coordinates. Masked areas (photos) are excluded from the comparison.
 * Outputs (in --out, default e2e/visual/out): actual.png, diff.png (red = different, masked areas blue), stats.json.
 * Exit code 1 when the differing share of compared pixels is above --max-diff-pct (default 5).
 * No extra dependencies: uses `sharp` (already in the workspace) and Playwright.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    throw new Error('`sharp` is not installed in this workspace; run `pnpm install` at the repo root.');
  }
}

/** Decode any image to raw RGBA, composited on white, resized to `width` if needed. */
async function toRaw(sharp, input, width) {
  let img = sharp(input).flatten({ background: '#ffffff' });
  const meta = await img.metadata();
  if (width && meta.width !== width) img = img.resize({ width });
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/**
 * Pure comparison of two raw RGBA images over their common area.
 * A pixel differs when any RGB channel differs by more than `tolerance` (0-255).
 */
export function comparePixels(a, b, { tolerance = 24, masks = [], bandHeight = 500 } = {}) {
  if (a.width !== b.width) throw new Error(`Widths differ: ${a.width} vs ${b.width}`);
  const width = a.width;
  const height = Math.min(a.height, b.height);
  const diff = Buffer.alloc(width * height * 4);
  const masked = new Uint8Array(width * height);
  for (const m of masks) {
    const x0 = Math.max(0, Math.floor(m.x));
    const y0 = Math.max(0, Math.floor(m.y));
    const x1 = Math.min(width, Math.ceil(m.x + m.width));
    const y1 = Math.min(height, Math.ceil(m.y + m.height));
    for (let y = y0; y < y1; y++) masked.fill(1, y * width + x0, y * width + x1);
  }
  let compared = 0;
  let different = 0;
  let maskedCount = 0;
  const bands = [];
  for (let y = 0; y < height; y++) {
    const band = Math.floor(y / bandHeight);
    bands[band] ??= { from: band * bandHeight, compared: 0, different: 0 };
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const o = p * 4;
      if (masked[p]) {
        maskedCount++;
        diff[o] = 40;
        diff[o + 1] = 80;
        diff[o + 2] = 220;
        diff[o + 3] = 255;
        continue;
      }
      compared++;
      bands[band].compared++;
      const dr = Math.abs(a.data[o] - b.data[o]);
      const dg = Math.abs(a.data[o + 1] - b.data[o + 1]);
      const db = Math.abs(a.data[o + 2] - b.data[o + 2]);
      if (dr > tolerance || dg > tolerance || db > tolerance) {
        different++;
        bands[band].different++;
        diff[o] = 230;
        diff[o + 1] = 30;
        diff[o + 2] = 30;
      } else {
        const g = Math.round((a.data[o] + a.data[o + 1] + a.data[o + 2]) / 3);
        diff[o] = diff[o + 1] = diff[o + 2] = 255 - Math.round((255 - g) * 0.25);
      }
      diff[o + 3] = 255;
    }
  }
  return {
    diff,
    width,
    height,
    stats: {
      width,
      comparedHeight: height,
      heightDelta: a.height - b.height,
      comparedPixels: compared,
      maskedPixels: maskedCount,
      differingPixels: different,
      differingPct: compared ? +((different / compared) * 100).toFixed(3) : 0,
      bands: bands.map((b) => ({ ...b, pct: b.compared ? +((b.different / b.compared) * 100).toFixed(2) : 0 })),
    },
  };
}

async function selfTest() {
  const sharp = await loadSharp();
  const w = 200;
  const h = 100;
  const solid = (r, g, b) => ({ data: Buffer.from(Array.from({ length: w * h }, () => [r, g, b, 255]).flat()), width: w, height: h });
  const base = solid(239, 236, 223);
  const same = comparePixels(base, solid(239, 236, 223));
  if (same.stats.differingPixels !== 0) throw new Error('selftest: identical images must not differ');
  const other = solid(239, 236, 223);
  for (let y = 10; y < 30; y++) for (let x = 20; x < 60; x++) other.data.set([0, 0, 0, 255], (y * w + x) * 4);
  const changed = comparePixels(base, other);
  if (changed.stats.differingPixels !== 20 * 40) throw new Error(`selftest: expected 800 differing, got ${changed.stats.differingPixels}`);
  const masked = comparePixels(base, other, { masks: [{ x: 20, y: 10, width: 40, height: 20 }] });
  if (masked.stats.differingPixels !== 0 || masked.stats.maskedPixels !== 800) throw new Error('selftest: mask must exclude the changed area');
  const near = solid(250, 236, 223);
  if (comparePixels(base, near, { tolerance: 24 }).stats.differingPixels !== 0) throw new Error('selftest: tolerance must absorb small deltas');
  const png = await sharp(changed.diff, { raw: { width: changed.width, height: changed.height, channels: 4 } }).png().toBuffer();
  if (png.length < 50) throw new Error('selftest: diff PNG not written');
  console.log('figma-diff selftest: ok');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selftest) return selfTest();

  const sharp = await loadSharp();
  const lang = args.lang === 'en' ? 'en' : 'ar';
  const url = args.url || `http://localhost:3000/${lang}/reference/home`;
  const figmaPath = path.resolve(args.figma || path.join(here, 'figma/home-1512.png'));
  const outDir = path.resolve(args.out || path.join(here, 'out'));
  const tolerance = Number(args.tolerance ?? 24);
  const maxPct = Number(args['max-diff-pct'] ?? 5);
  if (!fs.existsSync(figmaPath)) {
    throw new Error(`Figma export not found at ${figmaPath}. Export node 411:169 at 1x (1512 px wide) and save it there.`);
  }
  const masksPath = path.join(here, 'masks.json');
  const masks = fs.existsSync(masksPath) ? JSON.parse(fs.readFileSync(masksPath, 'utf8')) : [];
  fs.mkdirSync(outDir, { recursive: true });

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  let shot;
  try {
    const context = await browser.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (!res || !res.ok()) throw new Error(`Could not load ${url} (status ${res?.status()}). Is the web app running with ENABLE_REFERENCE_PAGES=true?`);
    await page.evaluate(() => document.fonts.ready);
    shot = await page.screenshot({ timeout: 180000, fullPage: true, animations: 'disabled' });
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(outDir, 'actual.png'), shot);

  const figma = await toRaw(sharp, figmaPath, 1512);
  const actual = await toRaw(sharp, shot, 1512);
  const { diff, width, height, stats } = comparePixels(figma, actual, { tolerance, masks });
  await sharp(diff, { raw: { width, height, channels: 4 } }).png().toFile(path.join(outDir, 'diff.png'));
  const result = { url, figma: path.relative(process.cwd(), figmaPath), tolerance, maxDiffPct: maxPct, masks: masks.length, ...stats };
  fs.writeFileSync(path.join(outDir, 'stats.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`compared ${stats.comparedPixels} px (${stats.maskedPixels} masked): ${stats.differingPct}% differ; height delta ${stats.heightDelta}px`);
  for (const b of stats.bands) console.log(`  y ${String(b.from).padStart(5)}+  ${String(b.pct).padStart(6)}%`);
  console.log(`wrote ${path.relative(process.cwd(), outDir)}/{actual,diff}.png and stats.json`);
  if (stats.differingPct > maxPct) {
    console.error(`FAIL: ${stats.differingPct}% > allowed ${maxPct}%`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
