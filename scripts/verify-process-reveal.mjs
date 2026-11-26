import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const url = 'http://127.0.0.1:4321/';
const results = [], errors = [];
const out = '/private/tmp/jingyuan-qa';
fs.mkdirSync(out, { recursive: true });
const geometry = nodes => nodes.map(n => {
  const r = n.getBoundingClientRect();
  return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, text: n.textContent };
});
const ready = async page => { await page.goto(url, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); };

try {
  for (const width of [1920, 390]) {
    const baseline = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await ready(baseline);
    const original = await baseline.locator('.process').evaluateAll(geometry);
    const originalHeight = await baseline.evaluate(() => document.documentElement.scrollHeight);
    await baseline.close();

    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const starts = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.text().startsWith('process-start:')) starts.push(JSON.parse(message.text().slice(14)));
    });
    await page.addInitScript(() => document.addEventListener('animationstart', event => {
      if (event.animationName === 'content-reveal-in' && event.target.matches('.process')) console.log('process-start:' + JSON.stringify({ step: [...document.querySelectorAll('.process')].indexOf(event.target), time: performance.now() }));
    }));
    await ready(page);
    assert.equal(await page.locator('.process[data-content-reveal-state="pending"]').count(), 5);
    for (let i = 0; i < 5; i++) {
      const step = page.locator('.process').nth(i);
      await step.evaluate(n => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForFunction(i => document.querySelectorAll('.process')[i].dataset.contentRevealState === 'complete', i);
      assert.equal(await step.evaluate(n => getComputedStyle(n).opacity), '1');
    }
    assert.deepEqual(starts.map(start => start.step), [0, 1, 2, 3, 4]);
    assert.deepEqual(await page.locator('.process').evaluateAll(geometry), original);
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), originalHeight);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('.process').first().evaluate(n => n.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(250);
    assert.equal(starts.length, 5);
    const toggle = page.locator('.process-toggle').first();
    await toggle.click();
    await page.waitForFunction(() => document.querySelector('.process-description').getBoundingClientRect().height < .1);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await toggle.click();
    await page.waitForFunction(() => document.querySelector('.process-description').getBoundingClientRect().height > 0);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    if (width === 1920) await page.screenshot({ path: `${out}/process-reveal-complete.png` });
    results.push({ check: 'Five steps appear in order, retain layout, do not replay, plus controls work', width, starts });
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await page.locator('.process-toggle').nth(4).focus();
  assert.equal(await page.locator('.process').nth(4).evaluate(n => getComputedStyle(n).opacity), '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.process').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity !== '1' || !['none', '0px'].includes(getComputedStyle(n).translate)).length), 0);
  results.push({ check: 'Keyboard focus and reduced motion keep all content visible' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await ready(page);
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.process').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity !== '1').length), 0);
  results.push({ check: 'Printing keeps all five steps visible' });
  await page.close();

  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await ready(noJS);
  assert.equal(await noJS.locator('.process').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity === '1').length), 5);
  results.push({ check: 'No JavaScript keeps all five steps visible' });
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: results.length, errors }));
} finally {
  fs.writeFileSync(`${out}/process-reveal-report.json`, JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
