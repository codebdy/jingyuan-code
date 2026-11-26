import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const width of [1920,390]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const path of ['quality-manufacturing','certifications']){
 await p.goto('http://localhost:4321/'+path+'/');
 const tabs=p.locator('[data-certificate-filter]');assert.equal(await tabs.count(),5);
 for(let i=0;i<5;i++){await tabs.nth(i).click();await p.waitForTimeout(50);assert.equal(await tabs.nth(i).getAttribute('aria-selected'),'true');assert.equal(await p.locator('[data-certificate-visible=true]').count(),(path==='certifications'?12:4));}
 await tabs.nth(3).click();assert.equal(await tabs.nth(3).evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)');assert.equal(await tabs.nth(3).evaluate(n=>getComputedStyle(n.parentElement).backgroundColor),'rgb(30, 30, 30)');const img=p.locator('[data-certificate-visible=true] img[data-lightbox]').first();await img.evaluate(i=>i.decode());await img.click();assert(await p.locator('#media-dialog').evaluate(d=>d.open));await p.keyboard.press('Escape');
 await tabs.nth(0).focus();await p.keyboard.press('End');assert.equal(await tabs.nth(4).getAttribute('aria-selected'),'true');
 }
 await p.goto('http://localhost:4321/quality-manufacturing/');
 if(width>800){const paint=p.locator('[data-node-id="322:1884"]');await paint.scrollIntoViewIfNeeded();const hits=p.locator('.quality-step-hit');for(let i=0;i<5;i++){await hits.nth(i).hover();await p.waitForTimeout(300);assert.equal(await p.locator(`[data-node-id="322:${1883+i}"]`).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(224, 69, 45)');await p.mouse.move(0,0);await p.waitForTimeout(300);assert.equal(await paint.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(186, 186, 186)');}}
 await p.goto('http://localhost:4321/products/category/');
 const faq=p.locator('[data-faq-toggle]');assert.equal(await faq.count(),6);
 await faq.first().scrollIntoViewIfNeeded();assert.equal(await faq.first().evaluate(n=>getComputedStyle(n.querySelector('.faq-indicator'),'::after').opacity),'0');
 await faq.first().click();assert.equal(await faq.first().getAttribute('aria-expanded'),'false');
 for(let i=0;i<6;i++){await faq.nth(i).click();assert.equal(await faq.nth(i).getAttribute('aria-expanded'),'true');const r=await faq.nth(i).boundingBox();assert(r.width>200);await faq.nth(i).click();}
 await p.locator('[data-faq-row]').first().screenshot({path:`/private/tmp/jingyuan-qa/faq-restored-${width}.png`});
 assert.equal(await p.locator('[data-reveal-group=selection-steps]').count(),6);
 assert.equal(await p.locator('[data-application-card]').count(),4);
 await p.goto('http://localhost:4321/about/');assert.equal(await p.locator('[data-application-card]').count(),4);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log(width+' passed');await p.close();
}
// Normal motion: confirm visual order and shared timing.
const p=await b.newPage({viewport:{width:1920,height:1400}});await p.goto('http://localhost:4321/products/category/');
for(const group of ['selection-steps','category-applications']){
 const roots=p.locator(`[data-reveal-group="${group}"]`);await roots.first().scrollIntoViewIfNeeded();await p.waitForTimeout(100);
 const values=await roots.evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.nodeId,state:n.dataset.contentRevealState,paint:n.querySelector('[data-reveal-paint-state]')?.dataset.revealPaintState,delay:(n.querySelector('[data-reveal-paint-state]')??n).style.getPropertyValue('--reveal-delay'),x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y})));
 const ordered=[...values].sort((a,b)=>group==='selection-steps'?a.y-b.y:a.x-b.x);
 ordered.forEach((value,i)=>{if(i)assert(parseFloat(value.delay)-parseFloat(ordered[i-1].delay)>250)});
 console.log(group,ordered);
}
await b.close();
