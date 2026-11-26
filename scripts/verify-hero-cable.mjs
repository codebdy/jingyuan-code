import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { chromium } from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
const out = '/private/tmp/jingyuan-qa';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
try {
  for (const [width, dpr] of [[1920, 1], [1920, 2], [390, 3]]) {
    const page = await browser.newPage({ viewport: { width, height: 1080 }, deviceScaleFactor: dpr });
    page.on('pageerror', error => errors.push(error.message));
    const requestedGIFs = [];
    page.on('request', request => { if (/hero-cable.*\.gif/.test(request.url())) requestedGIFs.push(request.url()); });
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    const image = page.locator('.hero-cable img');
    await image.evaluate(img => img.decode());
    const state = await image.evaluate(img => {
      const r = img.getBoundingClientRect(), s = getComputedStyle(img);
      const frame = img.closest('.hero-cable-frame').getBoundingClientRect();
      return { natural: [img.naturalWidth, img.naturalHeight], display: [r.width, r.height],
        frame: [frame.x, frame.y, frame.width, frame.height], transform: s.transform, filter: s.filter,
        samplingRatio: img.naturalWidth / (r.width * devicePixelRatio), pageWidth: document.documentElement.scrollWidth };
    });
    assert.equal(state.transform, 'none');
    assert.equal(state.filter, 'none');
    assert.ok(state.samplingRatio >= .99);
    assert.equal(state.pageWidth, width);
    assert.deepEqual(state.frame, width === 1920 ? [902, 0, 540, 960] : [214, 150, 242, 430]);
    assert.deepEqual(requestedGIFs, []);
    const first = sha(await image.screenshot());
    await page.waitForTimeout(700);
    assert.notEqual(sha(await image.screenshot()), first, 'The replacement must remain animated');
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.hero-cable img').dataset.paused === 'true');
    assert.ok((await image.evaluate(img => img.currentSrc)).includes('hero-cable-retina-poster'));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.hero-cable img').dataset.paused === 'false');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.hero-cable img').currentSrc.includes('hero-cable-retina-poster'));
    await image.evaluate(img => img.decode());
    if (width === 1920) await page.screenshot({ path: `${out}/cable-after-dpr${dpr}.png`, clip: { x: 902, y: 0, width: 540, height: 960 } });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('.hero-cable img').currentSrc.includes('hero-cable-retina.') && document.querySelector('.hero-cable img').dataset.paused === 'false');
    results.push({ width, dpr, ...state, animated: true, pauseResume: true, reducedMotion: true });
    await page.close();
  }
  assert.deepEqual(errors, []);
  assert.equal(sha(fs.readFileSync('src/assets/figma/hero-cable-20261124.gif')), '1fd7d71ff847e394fe3dbb8214b1d40750437f9764037f3366e6bf5b9b3052c5');
  console.log(JSON.stringify({ results, errors }));
} finally {
  fs.writeFileSync(`${out}/hero-cable-report.json`, JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
