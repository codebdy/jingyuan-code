import {chromium} from '/Users/biliqun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const routes=['','applications','applications/project','products','products/category','products/jy-yjv-3x25','products/jy-mi-3x10','products/jy-kvv-10x1-5','quality-manufacturing','about','certifications','news','support','contact'];
const browser=await chromium.launch({channel:'chrome',headless:true});let checks=0;
try{
for(const width of [1920,390]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  await page.goto('http://localhost:4321/'+(route?route+'/':''));const url=page.url();const trigger=page.locator('[data-nav-inquiry]');const dialog=page.locator('#navigation-inquiry');
  assert.equal(await trigger.getAttribute('href'),'/contact/');await trigger.click();assert(await dialog.isVisible());assert.equal(page.url(),url);
  assert.equal(await page.evaluate(()=>document.querySelector('#navigation-inquiry').contains(document.activeElement)),true);
  const dimensions=await dialog.evaluate(d=>{const r=d.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:d.scrollWidth,client:d.clientWidth};});assert(dimensions.left>=0&&dimensions.right<=width&&dimensions.top>=0&&dimensions.bottom<=844);assert(dimensions.scroll<=dimensions.client+1);
  if(route.startsWith('products/jy-'))assert.equal(await dialog.locator('[name=product-model]').inputValue(),await page.locator('.design-canvas').getAttribute('data-product-model'));
  await page.keyboard.press('Escape');assert(!(await dialog.isVisible()));assert(await trigger.evaluate(e=>document.activeElement===e));
  await trigger.focus();await page.keyboard.press('Enter');assert(await dialog.isVisible());await dialog.locator('.dialog-close').click();assert(!(await dialog.isVisible()));
  await trigger.click();await page.mouse.click(2,2);assert(!(await dialog.isVisible()));checks++;
 }
 await page.goto('http://localhost:4321/');await page.locator('[data-nav-inquiry]').click();const dialog=page.locator('#navigation-inquiry');const submit=dialog.locator('[type=submit]');await submit.click();assert.equal(await dialog.locator('.inquiry-status').count(),0);assert.equal(await dialog.locator('form').evaluate(f=>f.checkValidity()),false);
 await dialog.locator('[name=full-name]').fill('Test Buyer');await dialog.locator('[name=email-address]').fill('buyer@example.com');await dialog.locator('[name=message]').fill('Please quote this cable.');await submit.hover();await page.waitForTimeout(300);assert.deepEqual(await submit.evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]),['rgb(224, 69, 45)','rgb(0, 0, 0)']);
 await submit.click();const status=dialog.locator('.inquiry-status');await status.waitFor();assert((await status.innerText()).includes('has not been sent'));assert.equal(await status.evaluate(e=>getComputedStyle(e).position),'relative');assert.equal(await dialog.locator('[name=message]').inputValue(),'Please quote this cable.');
 await page.keyboard.press('Escape');await page.reload();await page.locator('[data-nav-inquiry]').click();assert.equal(await dialog.locator('[name=full-name]').inputValue(),'Test Buyer');assert.equal(await dialog.locator('[name=message]').inputValue(),'Please quote this cable.');
 await page.keyboard.press('Escape');await page.goto('http://localhost:4321/contact/');const contact=page.locator('[data-inquiry-form]').filter({hasNot:page.locator('.inquiry-dialog-fields')});assert.equal(await contact.locator('[name=full-name]').inputValue(),'');
 await page.locator('[data-nav-inquiry]').click();await dialog.locator('[name=message]').focus();for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.querySelector('#navigation-inquiry').contains(document.activeElement)),true);}
 await page.screenshot({path:'/private/tmp/jingyuan-qa/inquiry-dialog-'+width+'.png'});assert.deepEqual(errors,[]);await page.close();
}
const small=await browser.newPage({viewport:{width:390,height:667}});await small.goto('http://localhost:4321/products/jy-mi-3x10/');await small.locator('[data-nav-inquiry]').click();await small.locator('#navigation-inquiry [type=submit]').scrollIntoViewIfNeeded();assert(await small.locator('#navigation-inquiry [type=submit]').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));await small.close();
console.log(`Passed ${checks} route/viewport checks, keyboard focus, all close methods, model prefill, validation, draft restore/isolation, honest unconfigured submission and short mobile viewport.`);
}finally{await browser.close();}
