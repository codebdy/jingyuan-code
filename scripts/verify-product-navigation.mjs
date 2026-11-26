import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[],errors=[];
const models=[
 {id:'yJV',model:'JY-YJV-3×25',path:'/products/jy-yjv-3x25/',voltage:'0.6/1kV',cores:'3-Core',size:'25 mm²',insulation:'XLPE',sheath:'PVC'},
 {id:'mi',model:'JY-MI-3×10',path:'/products/jy-mi-3x10/',voltage:'0.6/1kV (Example)',cores:'3-Core',size:'10 mm²',insulation:'Mineral Insulation',sheath:'Copper Sheath (Example)'},
 {id:'kvv',model:'JY-KVV-10×1.5',path:'/products/jy-kvv-10x1-5/',voltage:'450/750V',cores:'10-Core',size:'1.5 mm²',insulation:'PVC',sheath:'PVC'},
];
const base='http://localhost:4321';
const open=async(p,path)=>{await p.goto(base+path,{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);};
const detail=async(p,m)=>{await p.waitForURL('**'+m.path);assert.equal(await p.locator('h1').innerText(),m.model);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('.design-canvas').getAttribute('data-product-model'),m.model);assert.equal(await p.locator('input[name=product-model]').inputValue(),m.model);assert.equal(await p.locator('dialog[open]').count(),0);};
try{
 for(const width of [1920,390]){
  const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  for(const page of ['/', '/products/category/'])for(const m of models)for(const part of ['image','model','plus','more']){
   await open(p,page);
   const card=page==='/'?p.locator('#product-'+m.id):p.locator(`[data-catalog-model="${m.model}"]`).first();
   const selectors=page==='/'?{image:'.product-image',model:'.product-heading h3 a',plus:'.product-plus',more:'.text-link'}:{image:'[data-card-image]',model:'[data-catalog-model-label]',plus:width===390?'.mobile-product-plus':'[data-product-preview]',more:'[data-action-kind=text]'};
   const link=card.locator(selectors[part]);assert.equal(await link.getAttribute('href'),m.path);
   await link.click();await detail(p,m);results.push({width,page,model:m.model,entry:part,passed:true});
  }
  // Blank parameter space also opens the card; native category tags stay independent.
  await open(p,'/products/category/');const card=p.locator('[data-catalog-card]').first();await card.scrollIntoViewIfNeeded();const rect=await card.boundingBox();await card.click({position:{x:rect.width-8,y:rect.height-8}});await detail(p,models[0]);
  let desktopGeometry;
  for(const m of models){
   await open(p,m.path);
   for(const [id,value]of [['275:1843',m.voltage],['273:1413',m.cores],['273:1417',m.size],['273:1421',m.insulation],['273:1425',m.sheath],['300:409',m.voltage],['300:421',m.cores],['300:424',m.size],['300:415',m.insulation],['300:427',m.sheath]])assert.equal(await p.locator(`[data-node-id="${id}"]`).innerText(),value);
   assert.ok((await p.locator('[data-node-id="305:479"]').innerText()).includes(m.model));
   assert.equal(await p.locator('input[name=rated-voltage]').inputValue(),m.voltage);
   assert.ok((await p.title()).includes(m.model));assert.ok((await p.locator('meta[name=description]').getAttribute('content')).includes(m.model));
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===1920){const g=await p.evaluate(()=>['273:1394','300:191','300:193','300:437','300:481','300:811','305:33','305:299','305:472','305:685'].map(id=>{const n=document.querySelector(`[data-node-id="${id}"]`),r=n.getBoundingClientRect();return{id,x:r.x+scrollX,y:r.y+scrollY,w:r.width,h:r.height};}));if(desktopGeometry)assert.deepEqual(g,desktopGeometry);else desktopGeometry=g;}
   if(m.id!=='yJV'){const image=p.locator('[data-node-id="273:1394"] img[data-photo]');await image.evaluate(i=>i.decode());assert.ok((await image.getAttribute('src')).includes(m.id==='mi'?'865b8':'2dcd5'));assert.equal(await image.getAttribute('alt'),m.model+' '+(m.id==='mi'?'Mineral-Insulated Cable':'Control Cable'));await p.screenshot({path:`/private/tmp/jingyuan-qa/detail-${m.id}-${width}.png`});}
   const related=p.locator('[data-catalog-model="JY-MI-3×10"] [data-action]').first();assert.equal(await related.getAttribute('href'),models[1].path);
   // Every detail page retains the original section navigation and its offset.
   await p.locator('[data-node-id="310:1002"] p').nth(2).click();await p.waitForFunction(()=>location.hash==='#product-section-2');await p.locator('.product-section-sticky').waitFor({state:'visible'});
   const top=await p.locator('#product-section-2').evaluate(n=>n.getBoundingClientRect().top),bottom=await p.locator('.product-section-sticky').evaluate(n=>n.getBoundingClientRect().bottom);assert.ok(top>=bottom-1);
  }
  // Per-model inquiry details and drafts do not leak between different products.
  await open(p,models[1].path);await p.locator('textarea[name=message]').fill('MI product draft');await p.locator('input[name=name]').fill('Ada');
  await open(p,models[2].path);assert.equal(await p.locator('textarea[name=message]').inputValue(),'');assert.equal(await p.locator('input[name=name]').inputValue(),'Ada');await p.locator('textarea[name=message]').fill('KVV product draft');
  await open(p,models[1].path);assert.equal(await p.locator('textarea[name=message]').inputValue(),'MI product draft');await p.locator('a[href*="request=datasheet"]').first().click();assert.equal(await p.locator('#media-dialog').evaluate(d=>d.open),true);assert.equal(new URL(await p.locator('[data-preview-inquiry]').getAttribute('href'),base).searchParams.get('product'),models[1].model);
  results.push({width,check:'Three model-specific pages, source parameters, layout, section navigation and isolated inquiry drafts',passed:true});await p.close();
 }
 const noJS=await browser.newPage({javaScriptEnabled:false,reducedMotion:'reduce'});for(const m of models){await open(noJS,'/products/category/');await noJS.locator(`[data-catalog-model="${m.model}"] [data-card-image]`).first().click();await noJS.waitForURL('**'+m.path);assert.equal(await noJS.locator('h1').innerText(),m.model);assert.equal(await noJS.locator('input[name=product-model]').inputValue(),m.model);}await noJS.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:results.length,errors}));
}finally{fs.writeFileSync('/private/tmp/jingyuan-qa/product-navigation-report.json',JSON.stringify({results,errors},null,2));await browser.close();}
