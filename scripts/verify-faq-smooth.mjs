import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const width of [1920,390])for(const path of ['products/category','support']){
const p=await b.newPage({viewport:{width,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:4321/'+path+'/');
const buttons=p.locator('[data-faq-toggle]');await buttons.first().scrollIntoViewIfNeeded();await p.waitForTimeout(1800);
const read=()=>buttons.first().evaluate(n=>{const row=n.closest('[data-faq-row]');const icon=n.querySelector('.faq-indicator');const bar=getComputedStyle(icon,'::before');return {open:n.getAttribute('aria-expanded'),h:row.getBoundingClientRect().height,panel:row.querySelector('.faq-answer-panel').getBoundingClientRect().height,icon:icon.getBoundingClientRect().width,bar:[bar.width,bar.height],vertical:getComputedStyle(icon,'::after').opacity}});
const expanded=await read();await buttons.first().click();await p.waitForTimeout(100);const mid=await read();await p.waitForTimeout(500);const closed=await read();assert(mid.h>closed.h+1&&mid.h<expanded.h-1);assert.equal(closed.panel,0);assert.equal(closed.vertical,'1');assert.deepEqual(closed.bar,expanded.bar);assert.equal(closed.icon,expanded.icon);assert.equal(expanded.vertical,'0');
await buttons.first().click();await p.waitForTimeout(100);const opening=await read();assert(opening.h>closed.h&&opening.h<expanded.h);await p.waitForTimeout(500);
await buttons.nth(1).click();await p.waitForTimeout(500);assert.equal(await buttons.first().getAttribute('aria-expanded'),'false');assert.equal(await buttons.nth(1).getAttribute('aria-expanded'),'true');
await buttons.nth(1).click();await p.waitForTimeout(50);await buttons.nth(1).click();await p.waitForTimeout(550);assert.equal(await buttons.nth(1).getAttribute('aria-expanded'),'true');
const sizes=await buttons.locator('.faq-indicator').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));assert(sizes.every(v=>v===sizes[0]));
await p.emulateMedia({reducedMotion:'reduce'});await buttons.nth(1).focus();await p.keyboard.press('Enter');assert.equal(await buttons.nth(1).getAttribute('aria-expanded'),'false');assert.equal(await buttons.nth(1).evaluate(n=>n.closest('[data-faq-row]').querySelector('.faq-answer-panel').getBoundingClientRect().height),0);
assert.deepEqual(errors,[]);await p.locator('[data-faq-row]').first().screenshot({path:`/private/tmp/jingyuan-qa/faq-smooth-${path.replace('/','-')}-${width}.png`});console.log({width,path,expanded,mid,closed,opening});await p.close();
}await b.close();
