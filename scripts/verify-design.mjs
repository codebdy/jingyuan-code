import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out='/private/tmp/jingyuan-qa';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const slugs=['','applications','applications/project','products','products/category','products/jy-yjv-3x25','quality-manufacturing','about','certifications','news','support','contact'];
const results=[];
for(const slug of slugs){await page.goto('http://127.0.0.1:4321/'+slug+'/',{waitUntil:'networkidle'});await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;});await page.screenshot({path:out+'/'+(slug.replaceAll('/','--')||'home')+'.png',fullPage:true});const data=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,images:document.images.length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),forms:document.forms.length,fields:document.querySelectorAll('[data-field]').length,actions:document.querySelectorAll('[data-action]').length,headings:document.querySelectorAll('h1,h2').length,body:document.body.innerText.length}));results.push({slug,...data});console.log(JSON.stringify(results.at(-1)));}
fs.writeFileSync(out+'/layout-report.json',JSON.stringify({results,errors},null,2));await browser.close();if(errors.length||results.some(r=>r.broken.length))process.exitCode=1;
