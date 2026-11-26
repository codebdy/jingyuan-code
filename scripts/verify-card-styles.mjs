import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base='http://127.0.0.1:4321', out='/private/tmp/jingyuan-qa', results=process.env.QA_RESUME ? JSON.parse(fs.readFileSync(out+'/card-styles-report.json','utf8')).results.filter(row=>row.width!==390) : [], errors=[];
const routes=['','applications','applications/project','products','products/category','products/jy-yjv-3x25','products/jy-mi-3x10','products/jy-kvv-10x1-5','quality-manufacturing','about','certifications','news','support','contact'];
fs.mkdirSync(out,{recursive:true});
const open=async(page,route)=>{await page.goto(`${base}/${route}${route?'/':''}`,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});};
const geometry=()=>[...document.querySelectorAll('[data-content-reveal-root]')].flatMap((root,i)=>[root,...root.querySelectorAll('p,h2,h3,a,img')].map((n,j)=>{const r=n.getBoundingClientRect();return{key:`${i}:${j}`,x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height}}));
const compare=(a,b,label)=>{assert.equal(a.length,b.length,label+' count');a.forEach((x,i)=>{for(const key of ['x','y','w','h'])assert.ok(Math.abs(x[key]-b[i][key])<.6,`${label} ${x.key} ${key}: ${x[key]} vs ${b[i][key]}`);});};
try{
 for(const width of (process.env.QA_WIDTHS||'1920,390').split(',').map(Number)){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  for(const route of routes){
   await page.emulateMedia({reducedMotion:'reduce'});await open(page,route);
   const baseline=await page.evaluate(geometry),height=await page.evaluate(()=>document.documentElement.scrollHeight);
   const header=page.locator('.header'),link=width===1920?page.locator('.header nav > a').first():page.locator('.menu-toggle');
   assert.equal(await link.evaluate(n=>getComputedStyle(n).color),route?'rgb(255, 255, 255)':'rgb(0, 0, 0)',route+' initial nav');
   await link.hover();assert.equal(await link.evaluate(n=>getComputedStyle(n).color),route?'rgb(224, 69, 45)':'rgb(255, 255, 255)',route+' nav hover');
   await page.mouse.move(width-1,999);await page.evaluate(()=>scrollTo(0,400));await page.waitForTimeout(50);
   assert.equal(await header.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(0, 0, 0)');assert.equal(await link.evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)');
   await page.emulateMedia({reducedMotion:'no-preference'});await open(page,route);
   console.log(JSON.stringify({route,width,scanHeight:height,actualHeight:await page.evaluate(()=>document.documentElement.scrollHeight)}));
   const count=await page.locator('[data-content-reveal-root]').count();assert.ok(count>0,route+' cards');
   const registered=await page.locator('[data-reveal-paint-state]').count();assert.ok(registered>0,route+' paint boxes');
   assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--content-reveal-duration').trim()),'1000ms');
   for(let y=0;y<height;y+=600){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(65);}
   await page.waitForTimeout(3800);
   const stuck=await page.locator('[data-reveal-paint-state=pending]').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();let left=r.left,right=r.right,top=r.top,bottom=r.bottom;for(let a=n.parentElement;a&&a!==document.documentElement;a=a.parentElement){const s=getComputedStyle(a),b=a.getBoundingClientRect();if(s.overflowX!=='visible'&&s.display!=='contents'){left=Math.max(left,b.left);right=Math.min(right,b.right);}if(s.overflowY!=='visible'&&s.display!=='contents'){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom);}}return right>Math.max(0,left)&&left<innerWidth&&bottom>top;}).map(n=>({id:n.dataset.nodeId,text:n.textContent.slice(0,55),top:n.getBoundingClientRect().top+scrollY})));
   assert.deepEqual(stuck,[],`${width} ${route} unrevealed`);
   await page.mouse.move(width-1,0);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(320);
   compare(baseline,await page.evaluate(geometry),`${width} ${route}`);
   assert.ok(Math.abs(await page.evaluate(()=>document.documentElement.scrollHeight)-height)<1,route+' height');
   if(route==='support')assert.equal(await page.locator('[data-reveal-group=service-options][data-content-reveal-state=complete]').count(),4);
   results.push({width,route:route||'home',cards:count,paintBoxes:registered,geometry:'unchanged',navigation:'passed'});console.log(JSON.stringify(results.at(-1)));
  }
  await page.close();
 }
 const p=await browser.newPage({viewport:{width:1920,height:1000}});await open(p,'');await p.emulateMedia({media:'print'});assert.equal(await p.locator('[data-reveal-paint-state]').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).opacity==='0').length),0);await p.emulateMedia({media:'screen',reducedMotion:'reduce'});assert.equal(await p.locator('[data-reveal-paint-state]').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).opacity==='0').length),0);await p.close();
 const noJS=await browser.newPage({javaScriptEnabled:false});for(const route of ['','products/category','support']){await open(noJS,route);assert.equal(await noJS.locator('[data-reveal-paint-state]').count(),0);}await noJS.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results.length,errors}));
}finally{fs.writeFileSync(`${out}/card-styles-report.json`,JSON.stringify({results,errors},null,2));await browser.close();}
