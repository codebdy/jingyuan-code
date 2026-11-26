import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const articles=[['smarter-manufacturing-better-quality','Smarter Manufacturing, Better Quality'],['advancing-manufacturing-excellence','Advancing Manufacturing Excellence'],['industry-trends-in-focus','Industry Trends in Focus']];
const b=await chromium.launch({channel:'chrome',headless:true}),errors=[],results=[],out='/private/tmp/jingyuan-qa';
const base='http://127.0.0.1:4321',path=i=>`/news/${articles[i][0]}/`;
try{
 for(const width of [1920,1280,390]){
  const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  for(let i=0;i<articles.length;i++){
   await p.goto(base+path(i),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
   assert.equal(await p.locator('h1').innerText(),articles[i][1]);
   assert.equal(await p.locator('article time').first().getAttribute('datetime'),'2026-10-20');
   assert.equal(await p.locator('.article-meta dd').last().innerText(),'Exhibition Information');
   assert.ok((await p.locator('.article-prose').innerText()).length>100);
   assert.equal(await p.locator('.article-cover img').evaluate(n=>n.naturalWidth>0),true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await p.locator('.header nav a[aria-current=page]').last().innerText(),'News');
   assert.equal(await p.locator('[rel=prev]').count()?await p.locator('[rel=prev]').getAttribute('href'):null,i>0?path(i-1):null);
   assert.equal(await p.locator('[rel=next]').count()?await p.locator('[rel=next]').getAttribute('href'):null,i<2?path(i+1):null);
   if(i===0)assert.equal(await p.locator('.article-neighbour.is-unavailable').count(),1);
   await p.locator('[data-nav-inquiry]').click();assert.equal(await p.locator('#navigation-inquiry').evaluate(n=>n.open),true);await p.keyboard.press('Escape');
   if(i===1){await p.screenshot({path:`${out}/news-detail-${width}-top.png`});await p.locator('.article-pagination').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/news-detail-${width}-bottom.png`});}
   results.push({width,slug:articles[i][0],metadata:true,body:true,previousNext:true,overflow:false});
  }
  await p.goto(base+'/news/',{waitUntil:'networkidle'});
  const cards=p.locator('[data-news-card]');assert.equal(await cards.count(),9);
  const mapping=await cards.evaluateAll(ns=>ns.map(n=>({href:n.dataset.newsHref,links:[...n.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),label:a.getAttribute('aria-label'),text:a.textContent.trim()}))})));
  mapping.forEach((card,i)=>{assert.equal(card.href,path(i%3));assert.ok(card.links.length>=3);card.links.forEach(link=>assert.equal(link.href,card.href));});
  await cards.first().locator('[data-news-heading]').click();await p.waitForURL('**'+path(0));
  await p.locator('[rel=next]').click();await p.waitForURL('**'+path(1));
  await p.locator('[rel=prev]').click();await p.waitForURL('**'+path(0));
  await p.locator('.article-back').click();await p.waitForURL('**/news/');
  await p.locator('[data-news-card]').nth(2).getByText('As green infrastructure development continues to advance, environmentally friendly cable products are gradually becoming an important direction for industry development.',{exact:true}).click();await p.waitForURL('**'+path(2));
  await p.goto(base+'/',{waitUntil:'networkidle'});
  const homeCards=p.locator('.news-card');assert.equal(await homeCards.count(),3);
  for(let i=0;i<3;i++)assert.equal(await homeCards.nth(i).locator('h3 a').getAttribute('href'),path(i));
  await homeCards.nth(1).locator('h3 a').click();await p.waitForURL('**'+path(1));
  await p.close();
 }
 const noJS=await b.newPage({javaScriptEnabled:false,viewport:{width:1280,height:900}});await noJS.goto(base+'/news/');await noJS.locator('[data-news-card] [data-news-heading]').first().click();await noJS.waitForURL('**'+path(0));assert.equal(await noJS.locator('h1').innerText(),articles[0][1]);await noJS.locator('[rel=next]').click();await noJS.waitForURL('**'+path(1));await noJS.close();
 const p=await b.newPage({viewport:{width:390,height:844}});await p.goto(base+path(0));await p.waitForFunction(()=>document.querySelector('#article-title').dataset.titleRevealState==='complete');assert.equal(await p.locator('h1').innerText(),articles[0][1]);await p.locator('.article-pagination').scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.querySelectorAll('[data-reveal-card]')].every(n=>n.dataset.contentRevealState==='complete'));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results.length,newsListNativeLinks:27,homeNativeLinks:9,noJS:true,errors}));
}finally{fs.writeFileSync(out+'/news-details-report.json',JSON.stringify({results,errors},null,2));await b.close()}
