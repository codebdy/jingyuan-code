import fs from 'node:fs';
const imageMetadata=JSON.parse(fs.readFileSync('brief/figma-source/image-metadata.json'));
const headers=new Set(['212:140','245:987','245:1466','271:162','273:1228','305:775','345:42','356:473','356:1043','363:1522','382:357']);
const categories=['Low Voltage Power Cables','Low-Smoke Halogen-Free Cables','Mineral-Insulated Fire-Resistant Cables','Building Wires','Aluminum Alloy Cables','Control Cables'];
const content=n=>typeof n==='string'?n:(n.children??[]).map(content).join(' ').replace(/\s+/g,' ').trim();
const objs=n=>(n.children??[]).filter(c=>typeof c==='object');
function decorate(page){
 const primaryHeadings={'applications':'233:20','applications/project':'249:48','products':'245:1585','products/category':'271:281','products/jy-yjv-3x25':'273:1401','quality-manufacturing':'309:990','about':'345:35','certifications':'356:879','news':'362:1373','support':'364:10','contact':'382:345'};
 const parents=new Map(),nodes=[];
 function visit(n,p){if(typeof n!=='object')return;parents.set(n,p);nodes.push(n);for(const c of objs(n))visit(c,n);}
 visit(page.root,null);
 const climb=(n,predicate)=>{for(let p=parents.get(n);p;p=parents.get(p))if(predicate(p))return p;return null;};
 const images=n=>n.tag==='img'?Number(!String(n.attrs?.src).endsWith('.svg')):objs(n).reduce((a,c)=>a+images(c),0);
 const mark=(n,key,value='')=>{n.attrs??={};n.attrs[key]=value;};
 const link=(n,href)=>{if(['p','h2'].includes(n.tag))n.style.display??='block';n.tag='a';mark(n,'href',href);mark(n,'data-design-link');};
 const allText=new Map(nodes.map(n=>[n,content(n)]));
 for(const n of nodes){
  n.attrs??={};n.style??={};const text=allText.get(n),id=n.attrs['data-node-id'];
  if(n.style.fontSize)n.style['--design-font']=Number(String(n.style.fontSize).match(/-?\d*\.?\d+/)?.[0]??14);
  if(headers.has(id)){n.omit=true;continue;}
  if(n.tag==='img'){
   mark(n,'loading','lazy');mark(n,'decoding','async');
   const basename=n.attrs.src?.split('/').at(-1)??'';
   mark(n,basename.endsWith('.svg')?'data-vector':'data-photo');
   if(!n.attrs.alt&&!basename.endsWith('.svg'))mark(n,'alt',n.attrs['data-name']??'Jingyuan Cable product and manufacturing photograph');
   continue;
  }
  if(n.tag!=='p'||!text)continue;
  if(n.style.fontSize)n.style['--design-font']=Number(String(n.style.fontSize).match(/-?\d*\.?\d+/)?.[0]??14);
  if(Number(n.style['--design-font'])>=32)n.tag=id===primaryHeadings[page.slug]?'h1':'h2';
  if(/^\d+\+?$/.test(text)&&Number(n.style['--design-font'])>=56&&Number(text.replace('+',''))>4){mark(n,'data-counter',text);}
  if(/^(Read More|Explore Our Products|Explore About Us|Understand quality manufacturing|View Certificates|Submit an Inquiry|Contact Us|Contact Our Team|Contact Our Support Team|Discuss Your Project|Send Inquiry|Submit Inquiry)$/i.test(text)){
   const parent=climb(n,p=>allText.get(p)===text&&objs(p).length>=2)??n;
   if(parent.attrs?.['data-action'])continue;
   let href=/certificate/i.test(text)?'/certifications/':/quality manufacturing/i.test(text)?'/quality-manufacturing/':/about/i.test(text)?'/about/':/inquiry|contact|discuss/i.test(text)?'/contact/':'/products/';
   const card=climb(n,p=>images(p)>0&&images(p)<=2&&allText.get(p).length<2000&&/Read More|Explore Our Products/i.test(allText.get(p)));
   if(card){const body=allText.get(card);if(/JY-YJV/.test(body))href='/products/jy-yjv-3x25/';else if(/JY-MI|JY-KVV/.test(body)){href='/products/category/';mark(parent,'data-quick-product',body.includes('JY-MI')?'mi':'kvv');}else if(page.slug==='applications'||page.slug==='applications/project')href='/applications/project/';else if(page.slug==='products')href='/products/category/';
    if(/JY-|Rated Voltage/.test(body)){mark(card,'data-catalog-card',body);mark(card,'data-catalog-model',body.match(/JY-[\w×.\-]+/)?.[0]??'');}
    if(page.slug==='applications')mark(card,'data-case-card',body);
    if(page.slug==='news'){mark(card,'data-news-card',body);mark(parent,'data-news-preview');href='/news/';}
    mark(card,'data-card-hover');
   }
   link(parent,href);mark(parent,'data-action');
   if(/^Read More$/i.test(text))mark(parent,'data-action-kind','text');
   // A button background may be a sibling of the label/arrow row in Figma.
   const backdrop=climb(parent,p=>allText.get(p)===text&&objs(p).some(c=>c.style?.background));
   if(backdrop){mark(backdrop,'data-button-shell');for(const c of objs(backdrop))if(c.style?.background)mark(c,'data-button-background');if(!/^Read More$/i.test(text)){link(backdrop,href);mark(backdrop,'data-action');if(parent.attrs['data-quick-product'])mark(backdrop,'data-quick-product',parent.attrs['data-quick-product']);parent.tag='div';for(const key of ['href','data-action','data-design-link','data-quick-product'])delete parent.attrs[key];}}
  }
  if(/^(Download Data.?sheet|Download Datasheet)$/i.test(text)){link(n,'/contact/?request=datasheet');}
  if(/^(Home|Privacy Policy)$/i.test(text))link(n,text.toLowerCase()==='home'?'/':'/contact/?request=privacy');
  if(categories.includes(text)||['LSZH Cables','Mineral Insulated Cables'].includes(text)){
   const p=parents.get(n);if(p&&!n.attrs.href){const insideSidebar=climb(n,a=>a.style?.width?.includes('385')||a.style?.width?.includes('435'));if(insideSidebar){const row=climb(n,a=>allText.get(a).length<240&&objs(a).length>=2&&a.style?.background)??p;row.tag='button';mark(row,'type','button');mark(row,'data-category-filter',text);mark(row,'aria-pressed','false');}else link(n,'/products/category/?category='+encodeURIComponent(text));}
  }
  if(/^\[?\s*(Building\s*&\s*Infrastructure|Industrial\s*&\s*Manufacturing|Transportation|Energy\s*&\s*Power)\s*\]?$/i.test(text)){
   const chip=climb(n,p=>allText.get(p)===text&&Boolean(p.style?.background));if(page.slug==='applications'&&chip){chip.tag='button';mark(chip,'type','button');mark(chip,'data-case-filter',text);mark(chip,'aria-pressed',String(chip.style?.background==='#e0452d'));}else if(!n.attrs.href)link(n,'/applications/?sector='+encodeURIComponent(text));
  }
  if(/^(Quality Management System|Environmental Management System|Occupational Health.*System|Product Certification|Inspection.*Reports)$/i.test(text)){
   const row=climb(n,p=>allText.get(p).length<160&&objs(p).length>=2)??n;row.tag='button';mark(row,'type','button');mark(row,'data-certificate-filter',text);mark(row,'aria-pressed','false');
  }
  if(text.endsWith('?')&&text.length<100&&Number(n.style['--design-font'])<28){
   let row=climb(n,p=>objs(p).length>=2&&allText.get(p).startsWith(text)&&allText.get(p).length<800);
   if(row)for(let p=parents.get(row);p;p=parents.get(p)){const value=allText.get(p);if(value.startsWith(text)&&(value.match(/\?/g)||[]).length===1&&value.length<1000)row=p;}
   if(row){mark(row,'data-faq-row');n.tag='button';mark(n,'type','button');mark(n,'data-faq-toggle');mark(n,'aria-expanded',String(allText.get(row).length>text.length+10));}
  }
 }
 // Replace drawn text fields with native controls in the exact same rectangles.
 const fieldLabels=/^(Full Name|Company Name|Name|Email(?: Address)?|Phone(?:\s*\/\s*WhatsApp)?|Country|Product Category|Inquiry Type|Product Model|Rated Voltage|Conductor Material|Core Number|Conductor Cross.Section|Required Quantity|Message)\s*:?$/i;
 const fields=[];
 const formScopes=new Set(['382:865','382:327','305:685']);
 for(const n of nodes){if(!formScopes.has(n.attrs?.['data-node-id'])&&!climb(n,p=>formScopes.has(p.attrs?.['data-node-id'])))continue;const children=objs(n),label=children.find(c=>['p','h2'].includes(c.tag)&&fieldLabels.test(allText.get(c)));
  if(!label)continue;const box=children.find(c=>c.style?.background&&c.tag==='div'&&c.style?.height&&(!c.children||!c.children.length));if(!box)continue;
  const name=allText.get(label).replace(/:$/,'').trim(),isSelect=/^(Product Category|Inquiry Type)$/i.test(name),isArea=parseFloat(String(box.style.height).match(/\d+/)?.[0]??0)>100;
  box.tag=isArea?'textarea':isSelect?'select':'input';box.children=[];mark(box,'data-field',name);mark(box,'aria-label',name);mark(box,'name',name.toLowerCase().replace(/[^a-z0-9]+/g,'-'));mark(box,'placeholder',name+':');
  box.style.fontSize='calc(14 * var(--u))';box.style.fontFamily='inherit';box.style.padding='calc(14 * var(--u)) calc(28 * var(--u))';box.style.border=0;box.style.borderRadius=0;
  if(!isSelect&&!isArea)mark(box,'type',/email/i.test(name)?'email':/phone/i.test(name)?'tel':'text');
  if(/^(Full Name|Name|Email(?: Address)?|Message)$/i.test(name))mark(box,'required',true);
  if(isSelect){const options=/Product Category/i.test(name)?categories:/Inquiry Type/i.test(name)?['Product Consultation','Technical Support','Quality Inquiry','After-Sales Service','Other']:[];box.children=[{tag:'option',attrs:{value:''},children:[name+':']},...options.map(v=>({tag:'option',attrs:{value:v},children:[v]}))];}
  label.omit=true;fields.push(box);
  mark(n,'data-field-group');mark(n,'data-field-type',isArea?'textarea':isSelect?'select':'input');
  for(const sibling of children)if(sibling!==box&&sibling!==label&&objs(sibling).length){mark(sibling,'data-field-icon');mark(sibling,'aria-hidden','true');}
 }
 if(fields.length){let form=parents.get(fields[0]);while(form&&!fields.every(f=>{for(let p=f;p;p=parents.get(p))if(p===form)return true;return false;}))form=parents.get(form);if(form){form.tag='form';mark(form,'data-inquiry-form');mark(form,'novalidate',false);const submit=nodes.find(n=>{for(let p=n;p;p=parents.get(p))if(p===form)return /Submit Inquiry/i.test(allText.get(n))&&n.attrs?.['data-action']!==undefined;return false;});if(submit){submit.tag='button';delete submit.attrs.href;mark(submit,'type','submit');}}}
 // Structural image candidates use original source imagery, never page screenshots.
 for(const n of nodes){if(n.tag!=='img'||!n.attrs['data-photo']&&n.attrs['data-photo']!=='')continue;const p=parents.get(n);const nearest=climb(n,a=>a.attrs?.['data-catalog-card']!==undefined);
  if(nearest){const body=nearest.attrs['data-catalog-card'],href=/JY-YJV/.test(body)?'/products/jy-yjv-3x25/':'/products/category/';if(p&&p.tag==='div'&&images(p)===1){link(p,href);mark(p,'data-card-image');if(!/JY-YJV/.test(body))mark(p,'data-quick-product',/JY-MI/.test(body)?'mi':'kvv');}}
  const meta=imageMetadata[n.attrs.src];
  if(meta&&meta.width/meta.height<.9&&(page.slug==='certifications'||climb(n,a=>/Certificates|Quality Backed|Quality Verified/.test(allText.get(a))&&images(a)>=3&&allText.get(a).length<4000))){mark(n,'data-lightbox','certificate');mark(n,'tabindex','0');mark(n,'role','button');mark(n,'aria-label','View certificate');const card=climb(n,p=>images(p)===1&&allText.get(p).length>30&&allText.get(p).length<700);if(card)mark(card,'data-cert-card',allText.get(card));}
 }
 for(const n of nodes){const text=allText.get(n),card=climb(n,p=>p.attrs?.['data-catalog-card']!==undefined);if(!card)continue;const body=card.attrs['data-catalog-card'],href=/JY-YJV/.test(body)?'/products/jy-yjv-3x25/':'/products/category/';if(/^JY-[A-Z]/.test(text)&&text.length<40){link(n,href);if(!/JY-YJV/.test(body))mark(n,'data-quick-product',/JY-MI/.test(body)?'mi':'kvv');}if(text==='+'&&n.tag==='p'){const button=climb(n,p=>allText.get(p)==='+'&&(p.style?.background||objs(p).some(c=>c.style?.background)))??n;link(button,href);mark(button,'data-product-preview');if(!/JY-YJV/.test(body))mark(button,'data-quick-product',/JY-MI/.test(body)?'mi':'kvv');for(const child of objs(button))if(child.style?.background)mark(child,'data-preview-paint');}}
 for(const n of nodes){const text=allText.get(n),fontNode=n.style?.fontSize?n:climb(n,p=>Boolean(p.style?.fontSize));const size=Number(String(fontNode?.style.fontSize??'100').match(/\d+/)?.[0]);if(/^\d+$/.test(text)&&size<=18&&n.tag==='p'){const row=climb(n,p=>/^1 2 3/.test(allText.get(p))&&allText.get(p).length<45);if(row){n.tag='button';mark(n,'type','button');mark(n,'data-page-button',text);mark(n,'aria-label','Page '+text);mark(row,'data-pagination');mark(row,'role','navigation');mark(row,'aria-label','Pagination');}}}
 // Keep desktop paint order; CSS order is applied only in the mobile flow.
 for(const child of objs(page.root))child.style['--mobile-order']=Number(String(child.style?.top??'0').match(/-?\d*\.?\d+/)?.[0]??0);
 const dimension=value=>typeof value==='string'&&/^calc\([-\d.]+ \* var\(--u\)\)$/.test(value)?Number(value.match(/[-\d.]+/)?.[0]):0;
 const stages=new Set(nodes.filter(n=>dimension(n.style?.width)>=80&&dimension(n.style?.height)>=80&&images(n)>0&&!allText.get(n)));
 for(const n of nodes){if(!n.style)continue;let shorthand=[];if(n.style.inset){let token='',depth=0;for(const ch of n.style.inset){if(ch==='(')depth++;if(ch===')')depth--;if(ch===' '&&depth===0){if(token)shorthand.push(token);token='';}else token+=ch;}if(token)shorthand.push(token);}const edges=shorthand.length?[shorthand[0],shorthand[1]??shorthand[0],shorthand[2]??shorthand[0],shorthand[3]??shorthand[1]??shorthand[0]]:[];
  const defaults={position:'static',display:'block',left:edges[3]??'auto',right:edges[1]??'auto',top:edges[0]??'auto',bottom:edges[2]??'auto',inset:'auto',width:'auto',height:'auto',translate:'none',rotate:'none',scale:'none',marginLeft:0,marginTop:0,marginRight:0,marginBottom:0,objectFit:'fill',objectPosition:'50% 50%'};
  for(const [key,value] of Object.entries(defaults))n.style['--native-'+key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())]=n.style[key]??value;
  if(stages.has(n)&&!climb(n,p=>stages.has(p))){mark(n,'data-image-stage');n.style['--image-native-width']=dimension(n.style.width);n.style.aspectRatio=dimension(n.style.width)+' / '+dimension(n.style.height);}
 }
 return page;
}
for(const file of fs.readdirSync('src/data/design')){const p='src/data/design/'+file;fs.writeFileSync(p,JSON.stringify(decorate(JSON.parse(fs.readFileSync(p)))));}
