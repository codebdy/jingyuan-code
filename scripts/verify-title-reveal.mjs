import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base='http://127.0.0.1:4321',out='/private/tmp/jingyuan-qa',results=[],errors=[];
const routes=['','applications','applications/project','products','products/category','products/jy-yjv-3x25','products/jy-mi-3x10','products/jy-kvv-10x1-5','quality-manufacturing','about','certifications','news','support','contact'];
const geometry=n=>{const r=n.getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height,text:n.querySelector('reveal-source')?.textContent??n.textContent,color:getComputedStyle(n).color}};
const open=async(p,route='')=>{await p.goto(`${base}/${route}${route?'/':''}`,{waitUntil:'networkidle'});await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{})}))});await p.waitForTimeout(100)};
try{
 for(const width of [1920,390]){
  const p=await browser.newPage({viewport:{width,height:1000}});p.on('pageerror',e=>errors.push(e.message));
  // Compare actual line paint at its resting position with the original text.
  for(const [route,selector] of [['','#manufacturing-title'],['','#contact-title'],['about','[data-title-reveal]']]){
   await open(p,route);const candidates=p.locator(selector).filter({has:p.locator('reveal-source')});
   const selectedId=await candidates.last().evaluate(n=>{n.id ||= 'qa-measured-title';return n.id});
   const title=p.locator('#'+selectedId);
   const before=await title.evaluate(geometry);assert.equal(await title.getAttribute('data-title-reveal-state'),'pending');
   assert.ok(Number(await title.getAttribute('data-title-lines'))>=1);
   await title.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
   await p.waitForFunction(id=>document.getElementById(id)?.dataset.titleRevealState==='revealing',selectedId);
   const lines=await title.locator('reveal-line').evaluateAll(ns=>ns.map(n=>({name:getComputedStyle(n).animationName,delay:parseFloat(getComputedStyle(n).animationDelay),filter:getComputedStyle(n).filter,hidden:n.parentElement.getAttribute('aria-hidden')})));
   lines.forEach((l,i)=>{assert.equal(l.name,'title-reveal-line');assert.equal(l.filter,'none');assert.equal(l.hidden,'true');if(i)assert.ok(Math.abs(l.delay-lines[i-1].delay-.1)<.002)});
   assert.equal(await title.locator('reveal-line').evaluateAll(ns=>ns.filter(n=>getComputedStyle(n).overflow!=='clip'||Math.abs(n.getBoundingClientRect().height-n.parentElement.getBoundingClientRect().height)>.01).length),0,'Each moving line must clip away adjacent text before it enters the outer mask');
   const painted=await title.evaluate(n=>{
    n.querySelectorAll('reveal-line').forEach(line=>line.getAnimations().forEach(a=>{a.pause();a.currentTime=2000}));
    const ranges=root=>{const rows=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode())for(const word of t.textContent.matchAll(/\S+/g)){const r=document.createRange();r.setStart(t,word.index);r.setEnd(t,word.index+word[0].length);for(const b of r.getClientRects())rows.push({text:word[0],x:b.x,y:b.y,w:b.width,h:b.height,color:getComputedStyle(t.parentElement).color})}return rows};
    const original=ranges(n.querySelector('reveal-source'));
    const copies=[...n.querySelectorAll('reveal-line-mask')].flatMap(mask=>{const box=mask.getBoundingClientRect();return ranges(mask.firstElementChild).filter(r=>r.y+r.h/2>=box.top&&r.y+r.h/2<=box.bottom)});
    return{original,copies};
   });
   assert.equal(painted.original.length,painted.copies.length);
   painted.original.forEach((word,i)=>{const copy=painted.copies[i];assert.equal(copy.text,word.text);assert.equal(copy.color,word.color);for(const key of ['x','y','w','h'])assert.ok(Math.abs(word[key]-copy[key])<.6,`${route} ${width} ${word.text} ${key}: ${word[key]} / ${copy[key]}`)});
   await p.waitForFunction(id=>document.getElementById(id)?.dataset.titleRevealState==='complete',selectedId);
   // The locator used a temporary descendant, so resolve the stable title again.
   const after=await title.evaluate(geometry);
   for(const key of ['x','y','w','h'])assert.ok(Math.abs(before[key]-after[key])<.6,JSON.stringify({route,width,key,before,after}));
   assert.equal(after.text,before.text);assert.equal(after.color,before.color);
   results.push({width,route:route||'home',title:before.text,lines:lines.length,paint:'matches original'});
  }
  await open(p);const title=p.locator('#solutions-title');
  await title.evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
  await p.waitForFunction(()=>document.querySelector('#solutions-title').dataset.titleRevealState==='revealing');
  const sequence=await p.evaluate(()=>['#solutions-title','[data-title-reveal-after="solutions-title"]'].map(s=>parseFloat(document.querySelector(s).style.getPropertyValue('--title-reveal-delay'))));
  assert.ok(sequence[1]-sequence[0]>190&&sequence[1]-sequence[0]<=225,JSON.stringify(sequence));
  assert.equal(await p.locator('.solution-copy h3[data-title-reveal-state]').count(),0);
  await p.setViewportSize({width:width===1920?1280:430,height:900});
  await p.waitForFunction(()=>!document.querySelector('reveal-line-mask'));
  assert.equal(await p.locator('#solutions-title').getAttribute('data-title-reveal-state'),'complete');
  results.push({width,sequence,resize:'restored original text'});
  await p.close();
 }
 const p=await browser.newPage({viewport:{width:1920,height:1000}});p.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  await open(p,route);assert.ok(await p.locator('[data-title-reveal-state]').count()>0,route);
  const before=await p.locator('[data-title-reveal-state]').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height}}));
  await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await p.waitForTimeout(40);
  assert.equal(await p.locator('[data-title-reveal-state=pending]').evaluateAll(ns=>ns.filter(n=>n.getBoundingClientRect().bottom<0).length),0,route+' fast scroll');
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('reveal-line-mask'));
  assert.equal(await p.locator('[data-title-reveal-state]').evaluateAll(ns=>ns.filter(n=>getComputedStyle(n).opacity!=='1').length),0);
  const after=await p.locator('[data-title-reveal-state]').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height}}));
  before.forEach((r,i)=>{for(const key of ['x','y','w','h'])assert.ok(Math.abs(r[key]-after[i][key])<.6,`${route} title ${i} ${key}`)});
  results.push({route:route||'home',geometry:'unchanged',fastScroll:'visible',reducedMotion:'original text'});
  await p.emulateMedia({reducedMotion:'no-preference'});
 }
 await open(p);await p.locator('#application-title').evaluate(n=>n.textContent='Updated title from selected case');await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('#application-title').dataset.titleRevealState==='complete');assert.equal(await p.locator('#application-title').innerText(),'Updated title from selected case');results.push({dynamicText:'preserved after interrupted reveal'});await p.emulateMedia({reducedMotion:'no-preference'});
 await open(p);await p.emulateMedia({media:'print'});assert.equal(await p.locator('#solutions-title').evaluate(n=>getComputedStyle(n).opacity),'1');await p.close();
 const noJS=await browser.newPage({javaScriptEnabled:false});await open(noJS);assert.equal(await noJS.locator('reveal-line-mask').count(),0);assert.equal(await noJS.locator('#solutions-title').evaluate(n=>getComputedStyle(n).opacity),'1');await noJS.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results.length,errors}));
}finally{fs.writeFileSync(`${out}/title-reveal-report.json`,JSON.stringify({results,errors},null,2));await browser.close()}
