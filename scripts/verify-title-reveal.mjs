import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], results = [];
const base = 'http://127.0.0.1:4321';
const out = '/private/tmp/jingyuan-qa';
fs.mkdirSync(out, { recursive: true });
const measure = element => {
  const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
  return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height,
    state: element.dataset.titleRevealState, opacity: style.opacity, filter: style.filter,
    html: element.innerHTML, color: style.color };
};

try {
  for (const width of [1920, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1080 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const title = page.locator('#solutions-title');
    const before = await title.evaluate(measure);
    assert.equal(before.state, 'pending');
    assert.equal(before.opacity, '0');
    const cardTitles = page.locator('.solution-copy h3');
    assert.equal(await cardTitles.count(), 4);
    assert.equal(await cardTitles.evaluateAll(nodes => nodes.filter(n => n.dataset.titleRevealState || getComputedStyle(n).opacity !== '1').length), 0);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await title.evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => document.querySelector('#solutions-title').dataset.titleRevealState === 'revealing');
    const animation = await title.evaluate(e => getComputedStyle(e).animationName);
    assert.ok(animation.includes('title-reveal-sharp'));
    const subtitle = page.locator('[data-title-reveal-after="solutions-title"]');
    await page.waitForFunction(() => document.querySelector('[data-title-reveal-after="solutions-title"]').dataset.titleRevealState === 'revealing');
    const sequence = await page.evaluate(() => {
      const primary = document.querySelector('#solutions-title');
      const secondary = document.querySelector('[data-title-reveal-after="solutions-title"]');
      return { primary: parseFloat(getComputedStyle(primary).animationDelay), secondary: parseFloat(getComputedStyle(secondary).animationDelay) };
    });
    assert.ok(sequence.secondary - sequence.primary >= .28 && sequence.secondary - sequence.primary <= .34, JSON.stringify(sequence));
    if (width === 1920) {
      await page.waitForTimeout(420);
      await page.screenshot({ path: `${out}/title-reveal-in-progress.png` });
    }
    await page.waitForFunction(() => document.querySelector('#solutions-title').dataset.titleRevealState === 'complete');
    await page.waitForFunction(() => document.querySelector('[data-title-reveal-after="solutions-title"]').dataset.titleRevealState === 'complete');
    const after = await title.evaluate(measure);
    for (const key of ['x', 'y', 'width', 'height', 'html', 'color']) assert.equal(after[key], before[key], key);
    assert.equal(after.opacity, '1');
    assert.equal(after.filter, 'none');
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), pageHeight);
    assert.equal(await page.locator('#hero-title').getAttribute('data-title-reveal-state'), null);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await title.evaluate(e => e.scrollIntoView({ behavior: 'instant', block: 'center' }));
    assert.equal(await title.getAttribute('data-title-reveal-state'), 'complete');
    if (width === 1920) await page.screenshot({ path: `${out}/title-reveal-complete.png` });
    results.push({ check: 'Main/subtitle order, static card titles, stable geometry, no replay', width, sequence, before, after });
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => errors.push(e.message));
  for (const slug of ['', 'applications', 'applications/project', 'products', 'products/category', 'products/jy-yjv-3x25', 'quality-manufacturing', 'about', 'certifications', 'news', 'support', 'contact']) {
    await page.goto(`${base}/${slug}`, { waitUntil: 'networkidle' });
    const count = await page.locator('[data-title-reveal-state]').count();
    assert.ok(count > 0, slug);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const hidden = await page.locator('[data-title-reveal-state]').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity !== '1').length);
    assert.equal(hidden, 0, slug);
    results.push({ check: 'All pages registered; reduced motion reveals all titles', slug, count });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('#solutions-title').evaluate(e => getComputedStyle(e).opacity), '1');
  results.push({ check: 'Print keeps titles visible' });
  await page.close();

  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1920, height: 1080 } });
  await noJS.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await noJS.locator('#solutions-title').evaluate(e => getComputedStyle(e).opacity), '1');
  results.push({ check: 'No JavaScript keeps original titles visible' });
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: results.length, errors }));
} finally {
  fs.writeFileSync(`${out}/title-reveal-report.json`, JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
