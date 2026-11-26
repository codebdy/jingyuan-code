import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const cwd=process.cwd(),dir=path.join(cwd,'brief/figma-source');
const babelDir=fs.readdirSync('node_modules/.pnpm').find(n=>n.startsWith('@babel+parser@'));
const {parse}=require(path.join(cwd,'node_modules/.pnpm',babelDir,'node_modules/@babel/parser/lib/index.js'));
const units=v=>String(v).replace(/(-?\d*\.?\d+)px/g,(_,n)=>`calc(${n} * var(--u))`);
const val=s=>units(s.replaceAll('_',' ').replace(/(?<=[\d%)])([+-])(?=[\d.(])/g,' $1 '));
const unknown=new Set(),assets={};
const fixed={absolute:{position:'absolute'},relative:{position:'relative'},fixed:{position:'fixed'},sticky:{position:'sticky'},contents:{display:'contents'},block:{display:'block'},hidden:{display:'none'},flex:{display:'flex'},'inline-flex':{display:'inline-flex'},grid:{display:'grid'},'inline-grid':{display:'inline-grid'},'flex-col':{flexDirection:'column'},'flex-row':{flexDirection:'row'},'flex-wrap':{flexWrap:'wrap'},'flex-none':{flex:'none'},'shrink-0':{flexShrink:0},'grow':{flexGrow:1},'items-center':{alignItems:'center'},'items-start':{alignItems:'flex-start'},'items-end':{alignItems:'flex-end'},'items-stretch':{alignItems:'stretch'},'justify-center':{justifyContent:'center'},'justify-between':{justifyContent:'space-between'},'justify-end':{justifyContent:'flex-end'},'justify-start':{justifyContent:'flex-start'},'content-stretch':{alignContent:'stretch'},'self-stretch':{alignSelf:'stretch'},'place-items-start':{placeItems:'start'},'overflow-hidden':{overflow:'hidden'},'overflow-clip':{overflow:'clip'},'overflow-visible':{overflow:'visible'},'pointer-events-none':{pointerEvents:'none'},'not-italic':{fontStyle:'normal'},italic:{fontStyle:'italic'},capitalize:{textTransform:'capitalize'},uppercase:{textTransform:'uppercase'},lowercase:{textTransform:'lowercase'},'whitespace-nowrap':{whiteSpace:'nowrap'},'whitespace-pre':{whiteSpace:'pre'},'whitespace-pre-wrap':{whiteSpace:'pre-wrap'},'break-words':{overflowWrap:'break-word'},'text-left':{textAlign:'left'},'text-center':{textAlign:'center'},'text-right':{textAlign:'right'},'text-justify':{textAlign:'justify'},'border-solid':{borderStyle:'solid'},'border-dashed':{borderStyle:'dashed'},'object-cover':{objectFit:'cover'},'object-contain':{objectFit:'contain'},'max-w-none':{maxWidth:'none'},'mask-alpha':{maskMode:'alpha'},'mask-intersect':{maskComposite:'intersect'},'mask-no-clip':{maskClip:'no-clip'},'mask-no-repeat':{maskRepeat:'no-repeat'},'rounded-full':{borderRadius:'9999px'},'text-ellipsis':{textOverflow:'ellipsis'},'underline':{textDecoration:'underline'}};
const properties={w:'width',h:'height','min-w':'minWidth','max-w':'maxWidth','min-h':'minHeight','max-h':'maxHeight',left:'left',right:'right',top:'top',bottom:'bottom',gap:'gap','gap-x':'columnGap','gap-y':'rowGap',p:'padding',pt:'paddingTop',pb:'paddingBottom',pl:'paddingLeft',pr:'paddingRight',m:'margin',mt:'marginTop',mb:'marginBottom',ml:'marginLeft',mr:'marginRight',ms:'marginInlineStart',leading:'lineHeight',tracking:'letterSpacing',opacity:'opacity','grid-cols':'gridTemplateColumns','grid-rows':'gridTemplateRows','mask-size':'maskSize','mask-position':'maskPosition',basis:'flexBasis',flex:'flex',rounded:'borderRadius',z:'zIndex',aspect:'aspectRatio'};
const colors={white:'#fff',black:'#000',transparent:'transparent','current':'currentColor'};
function css(token){
 if(fixed[token])return fixed[token];
 if(/^border-[trbl]$/.test(token))return {['border'+({t:'Top',r:'Right',b:'Bottom',l:'Left'}[token.at(-1)])+'Width']:units('1px'),borderStyle:'solid'};
 if(token==='col-1')return {gridColumnStart:1};if(token==='row-1')return {gridRowStart:1};
 if(token==='-scale-y-100')return {scale:'1 -1'};
 if(token==='object-bottom')return {objectPosition:'bottom'};
 if(token==='mix-blend-darken')return {mixBlendMode:'darken'};
 if(token==='list-disc')return {listStyleType:'disc'};if(token==='list-decimal')return {listStyleType:'decimal'};
 if(token==='bg-gradient-to-b')return {backgroundImage:'linear-gradient(to bottom,var(--gradient-from) var(--gradient-start,0%),var(--gradient-to))'};
 if(/^\[.*\]$/.test(token)){const [k,...v]=token.slice(1,-1).split(':');return {[k]:val(v.join(':'))};}
 let t=token,negative=t.startsWith('-');if(negative)t=t.slice(1);
 const a=t.match(/^(.+?)-\[(.*)\]$/);let key=a?.[1],value=a?val(a[2]):null;
 if(!a){const m=t.match(/^(.+)-([^\-]+)$/);if(m){key=m[1];const raw=m[2];value=raw==='full'?'100%':raw==='screen'?'100vw':raw==='auto'?'auto':raw==='px'?units('1px'):raw==='normal'?'normal':raw==='none'?'1':raw==='1/2'?'50%':/^\d+(\.\d+)?$/.test(raw)?units(`${Number(raw)*4}px`):colors[raw];if(key==='opacity')value=Number(raw)/100;if(['rotate','z','font','col-start','row-start'].includes(key))value=raw;}}
 if(key==='font'&&value){if(a&&a[2].startsWith("'")){const name=a[2].slice(1,-1).replaceAll('_',' ');const weight=({'Light':300,'Regular':400,'Medium':500,'SemiBold':600,'Semi Bold':600,'Bold':700})[name.split(':')[1]]??400;return {fontFamily:"'Inter Tight Variable','Inter Tight',sans-serif",fontWeight:weight};}return {fontWeight:value};}
 if(!a&&key?.startsWith('border'))value=units(t.split('-').at(-1)+'px');
 if(key==='text'&&value)return /^#|^rgb|^rgba|^hsl/.test(String(value))||Object.values(colors).includes(value)?{color:value}:{fontSize:value};
 if(key==='bg'&&value)return {background:value};
 if(key==='backdrop-blur'&&value)return {backdropFilter:`blur(${value})`};
 if(key==='from'&&value)return {[String(value).endsWith('%')?'--gradient-start':'--gradient-from']:value};
 if(key==='to'&&value)return {'--gradient-to':value};
 if(key==='size'&&value)return {width:value,height:value};
 if(key==='inset'&&value)return {inset:value};
 if(['px','py','mx','my'].includes(key)&&value){const p=key[0]==='p'?'padding':'margin';return key[1]==='x'?{[p+'Left']:value,[p+'Right']:value}:{[p+'Top']:value,[p+'Bottom']:value};}
 if(key==='border'&&value)return /^#|^rgb/.test(String(value))?{borderColor:value}:{borderWidth:value,borderStyle:'solid'};
 if(key?.startsWith('border-')&&value){const side={t:'Top',r:'Right',b:'Bottom',l:'Left'}[key.slice(7)];if(side)return {[`border${side}Width`]:value,borderStyle:'solid'};}
 if(key==='rotate'&&value!==null)return {rotate:`${negative?'-':''}${String(value).replace(/deg$/,'')}deg`};
 if(key?.startsWith('translate-')&&value)return {translate:key.endsWith('x')?`${negative?'-':''}${value} 0`:`0 ${negative?'-':''}${value}`};
 if(key==='scale-x'&&value)return {scale:`${negative?'-':''}${Number(a?a[2]:value)/100} 1`};
 if(key==='col-start'||key==='row-start')return {[key==='col-start'?'gridColumnStart':'gridRowStart']:value};
 if(properties[key]&&value!==null&&value!==undefined)return {[properties[key]]:negative?`calc(-1 * ${value})`:value};
 if(token==='border')return {borderWidth:units('1px'),borderStyle:'solid'};
 if(token==='isolate')return {isolation:'isolate'};
 unknown.add(token);return {};
}
function evaluate(n,vars){if(!n)return null;switch(n.type){case'StringLiteral':case'NumericLiteral':case'BooleanLiteral':return n.value;case'NullLiteral':return null;case'Identifier':if(n.name in vars)return vars[n.name];throw Error('Unknown identifier '+n.name);case'TemplateLiteral':return n.quasis.map((q,i)=>q.value.cooked+(n.expressions[i]?evaluate(n.expressions[i],vars):'')).join('');case'ObjectExpression':return Object.fromEntries(n.properties.map(p=>[p.key.name??p.key.value,evaluate(p.value,vars)]));case'UnaryExpression':return -evaluate(n.argument,vars);default:throw Error('Unexpected expression '+n.type);}}
function localize(s){if(typeof s!=='string')return s;return s.replace(/https:\/\/www\.figma\.com\/api\/mcp\/asset\/[^\s"')`]+/g,url=>{const name=crypto.createHash('sha1').update(url).digest('hex').slice(0,12)+'-'+url.split('/').at(-1);assets[url]='/figma/'+name;return assets[url];});}
function jsx(n,vars){if(n.type==='JSXText'){const lines=n.value.replace(/\r/g,'').split('\n');const clean=lines.map((l,i)=>{l=l.replace(/\t/g,' ');if(i)l=l.replace(/^ +/,'');if(i<lines.length-1)l=l.replace(/ +$/,'');return l}).filter(Boolean).join(' ');return clean||null;}if(n.type==='JSXExpressionContainer')return n.expression.type==='JSXEmptyExpression'?null:evaluate(n.expression,vars);if(n.type!=='JSXElement')throw Error(n.type);const attrs={};let classes='';let style={};for(const a of n.openingElement.attributes){if(a.type!=='JSXAttribute')throw Error(a.type);const key=a.name.name;const value=a.value?.type==='JSXExpressionContainer'?evaluate(a.value.expression,vars):a.value?.value??true;if(key==='className')classes=value;else if(key==='style')style=value;else attrs[key]=localize(value);}const styles=Object.assign({},...classes.split(/\s+/).filter(Boolean).map(css),Object.fromEntries(Object.entries(style).map(([k,v])=>[k,localize(v)])));return {tag:n.openingElement.name.name,attrs,classes,style:styles,children:n.children.map(c=>jsx(c,vars)).filter(c=>c!==null&&c!==undefined)};}
function source(id){const file=path.join(dir,id.replace(':','-')+'.tsx');if(!fs.existsSync(file))return null;const code=fs.readFileSync(file,'utf8'),ast=parse(code,{sourceType:'module',plugins:['jsx']});const vars={};let root;for(const statement of ast.program.body){if(statement.type==='VariableDeclaration')for(const d of statement.declarations)vars[d.id.name]=evaluate(d.init,vars);if(statement.type==='ExportDefaultDeclaration'){const fn=statement.declaration;const ret=fn.body.body.find(s=>s.type==='ReturnStatement');root=jsx(ret.argument,vars);}}if(!root)throw Error('No root '+id);return root;}
const structure=JSON.parse(fs.readFileSync(path.join(dir,'structure.json')));
const list=JSON.parse(fs.readFileSync(path.join(dir,'list-structure.json')));
function pageNode(id,meta){const ready=source(id);if(ready)return ready;const data=id===list.id?list:structure.find(p=>p.id===id);if(!data)throw Error('Unresolved sparse node '+id);return {tag:'div',attrs:{'data-node-id':id},classes:'relative',style:{position:'relative',width:'100%',height:'100%'},children:data.children.filter(c=>c.visible!==false).map(c=>{const node=pageNode(c.id,c);if(c.type==='FRAME'||c.type==='LINE'||c.id==='284:155'){return {tag:'div',attrs:{'data-slot-id':c.id},style:{position:'absolute',left:units(c.x+'px'),top:units(c.y+'px'),width:units(c.width+'px'),height:units(c.height+'px')},children:[node]};}return node;})};}
const pages=[['applications','212:2',4871,'Applications and Case Studies'],['applications/project','245:946',9786,'Project Case Study'],['products','245:1425',3834,'Products'],['products/category','271:121',7808,'Cable Products'],['products/jy-yjv-3x25','273:1187',9280,'JY-YJV-3×25'],['quality-manufacturing','305:734',9764,'Quality Manufacturing'],['about','345:14',7921,'About Xinjingyuan'],['certifications','356:445',3877,'Certifications'],['news','356:1030',4290,'News'],['support','363:1508',8009,'Service Support'],['contact','382:328',3310,'Contact']];
fs.mkdirSync('src/data/design',{recursive:true});
for(const [slug,id,height,title] of pages){const root=pageNode(id);fs.writeFileSync('src/data/design/'+slug.replaceAll('/','--')+'.json',JSON.stringify({slug,id,height,title,root}));}
fs.writeFileSync('brief/figma-source/assets.json',JSON.stringify(assets,null,2));
fs.writeFileSync('brief/figma-source/unmapped-classes.json',JSON.stringify([...unknown].sort(),null,2));
console.log(JSON.stringify({pages:pages.length,assets:Object.keys(assets).length,unmapped:[...unknown].sort()},null,2));
