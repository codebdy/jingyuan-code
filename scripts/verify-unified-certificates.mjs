import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const width of [1920,390]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const path of ['quality-manufacturing','certifications','about','products/jy-yjv-3x25','products/jy-mi-3x10','products/jy-kvv-10x1-5']){
 await p.goto('http://localhost:4321/'+path+'/');await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('[data-cert-card] img')].map(i=>{i.loading='eager';return i.decode()}));});const cards=p.locator('[data-cert-card]');assert.equal(await cards.count(),path==='certifications'?12:4);
 const check=async()=>{const rows=await cards.evaluateAll(ns=>ns.map(n=>({text:[...n.querySelectorAll('p')].map(p=>({text:p.textContent,visibility:getComputedStyle(p).visibility})),background:getComputedStyle(n).backgroundColor,broken:!n.querySelector('img').naturalWidth,h:n.getBoundingClientRect().height})));rows.forEach(r=>{assert(!r.broken);assert.equal(r.background,'rgb(238, 238, 238)');assert.equal(r.text.length,3);assert(r.text[0].text.includes('2025.04.07'));assert(r.text[1].text.includes('CCC Product Certification'));assert(r.text[2].text.includes('Explore our production'));assert(r.text.every(t=>t.visibility==='visible'))});return rows.map(r=>r.h)};
 const heights=await check();const tabs=p.locator('[data-certificate-filter]');for(let i=0;i<await tabs.count();i++){await tabs.nth(i).click();assert.deepEqual(await check(),heights);assert.equal(await p.locator('.certificate-empty').isVisible(),false)}
 const img=cards.first().locator('img[data-lightbox]');await img.click();assert(await p.locator('#media-dialog').evaluate(d=>d.open));await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(width===1920&&path.startsWith('products/')){assert(await p.locator('[data-slot-id="305:299"]').evaluate(n=>{const end=n.querySelector('[data-node-id="305:248"]').getBoundingClientRect().bottom;return end<=n.getBoundingClientRect().bottom+1}));}
 console.log(width,path,'passed');
 }assert.deepEqual(errors,[]);await p.close();
}await b.close();
