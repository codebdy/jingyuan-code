import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const dir='/private/tmp/jingyuan-qa/site-audit';fs.mkdirSync(dir,{recursive:true});
const routes=['','applications','applications/project','products','products/category','products/jy-yjv-3x25','products/jy-mi-3x10','products/jy-kvv-10x1-5','quality-manufacturing','about','certifications','news','support','contact'];
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const width of [1920,390]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const slug of routes){errors=[];await page.goto('http://localhost:4321/'+slug+'/',{waitUntil:'networkidle'});await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;});
 const data=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')),cards:document.querySelectorAll('[data-content-reveal-root]').length,titles:document.querySelectorAll('[data-title-reveal]').length,fields:document.querySelectorAll('input,select,textarea').length,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/')&&!h.startsWith('//')),unbound:[...document.querySelectorAll('[role=button],button')].filter(n=>getComputedStyle(n).cursor==='default'&&!n.disabled).map(n=>n.textContent.trim().slice(0,50))}));
 for(const [name,y] of [['top',0],['middle',data.height*.45],['bottom',data.height]]){await page.evaluate(y=>scrollTo(0,y),y);await page.screenshot({path:`${dir}/${slug.replaceAll('/','--')||'home'}-${width}-${name}.png`});}
 results.push({slug,viewport:width,...data,errors:[...errors]});console.log(JSON.stringify({slug,width,overflow:data.width>width,broken:data.broken.length,errors:errors.length,cards:data.cards}));}
 await page.close();}
fs.writeFileSync(dir+'/report.json',JSON.stringify(results,null,2));await browser.close();
if(results.some(r=>r.width>r.viewport||r.errors.length||r.broken.length))process.exitCode=1;
