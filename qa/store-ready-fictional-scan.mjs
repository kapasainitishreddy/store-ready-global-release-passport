/** StoreReady ReleaseProof: pinned, isolated, scripted fictional visitor checks. */
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const PIN='55a4dcb8c3101181643dbc869acc85b83e08cc77',BASE='http://127.0.0.1:4173';
const OUT=resolve('qa-output');await mkdir(resolve(OUT,'screenshots'),{recursive:true});
const revision=(await readFile(resolve(OUT,'target-commit.txt'),'utf8')).trim();
if(revision!==PIN)throw Error('Pinned StoreReady checkout mismatch');
const checks=[],startedAt=new Date().toISOString();
const lenses=[
 {id:'startup-founder',name:'Mira',goal:'Find a launch blocker and verify a proposed fix',width:1280,height:900},
 {id:'security-reviewer',name:'Dev',goal:'Inspect security and compliance evidence boundaries',width:1280,height:900},
 {id:'market-planner',name:'Rin',goal:'Find country-specific market plans without assuming legal compliance',width:1280,height:900},
 {id:'mobile-operator',name:'Alex',goal:'Navigate the demo release workspace on a small screen',width:390,height:844},
 {id:'keyboard-researcher',name:'Sam',goal:'Find focusable skip link and report export controls',width:1280,height:900},
];
const browser=await chromium.launch({headless:true});
for(const lens of lenses){
 const context=await browser.newContext({viewport:{width:lens.width,height:lens.height},serviceWorkers:'block',
  permissions:[],acceptDownloads:true,reducedMotion:'reduce'});
 const blocked=[],errors=[],warnings=[];let shotIndex=0;
 await context.route('**/*',async route=>{
  const req=route.request();
  try{const url=new URL(req.url());
   if(url.origin!==BASE||!['GET','HEAD','OPTIONS'].includes(req.method())){blocked.push(url.origin+url.pathname);await route.abort('blockedbyclient');return;}
  }catch{blocked.push('invalid-url');await route.abort('blockedbyclient');return;}
  await route.continue();
 });
 if(context.routeWebSocket)await context.routeWebSocket('**/*',ws=>ws.close());
 await context.tracing.start({screenshots:true,snapshots:true});
 const page=await context.newPage();page.setDefaultTimeout(7000);
 page.on('pageerror',e=>errors.push(e.message.slice(0,340)));
 page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text().slice(0,300))});
 async function shot(name){const file='screenshots/'+lens.id+'-'+(++shotIndex)+'-'+name+'.png';
  await page.screenshot({path:resolve(OUT,file),fullPage:false});return file;}
 async function check(id,expected,action){
  try{const data=await action(),ok=data.pass;delete data.pass;checks.push({
   lens:lens.id,fictionalName:lens.name,id,expected,status:ok?'PASS':'FAIL',...data});
  }catch(e){checks.push({lens:lens.id,fictionalName:lens.name,id,expected,status:'ERROR',
   error:String(e.message||e).slice(0,800),screenshot:await shot(id+'-error').catch(()=>null)})}
 }
 try{
  const response=await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:25000});
  await check('launch','A private/local demo launches with a clear workspace and no blocked registration requirement.',async()=>{
   const head=await page.locator('h1').first().innerText();
   const menu=await page.locator('button.nav-link').count();
   return {pass:response?.status()===200&&/release health/i.test(head)&&menu>=5,
    title:await page.title(),head,primaryItems:menu,screenshot:await shot('home')};
  });
  await check('source-honesty','The deliberately broken local fixture and unsupported assessments are disclosed.',async()=>{
   const notice=await page.locator('#fixture-notice').innerText();
   const flag=await page.locator('.demo-indicator').innerText();
   return {pass:/deliberately flawed/i.test(notice)&&/demo workspace/i.test(flag),
    fixtureNotice:notice.slice(0,260),demoFlag:flag};
  });
  if(lens.id==='startup-founder'){
   await check('broken-scan','The broken fixture produces an auditable blocker count, not a false passing result.',async()=>{
    await page.locator('#run-audit').click();
    await page.waitForFunction(()=>!document.querySelector('#run-audit')?.disabled,{timeout:12000});
    const blocker=Number((await page.locator('#blocker-count').innerText()).replace(/\D/g,''));
    const score=await page.locator('#score').innerText();
    const title=await page.locator('#decision-title').innerText();
    return {pass:Number.isFinite(blocker)&&blocker>0,
     blockerCount:blocker,score,decision:title,screenshot:await shot('broken-audit')};
   });
   await check('fix-comparison','An explicitly demonstrated fixture fix changes the audit result; not production code.',async()=>{
    const old=Number((await page.locator('#blocker-count').innerText()).replace(/\D/g,''));
    await page.locator('#review-diff').click();
    await page.locator('#apply-demo-fix').click();
    await page.waitForFunction(()=>!document.querySelector('#run-audit')?.disabled,{timeout:12000});
    const next=Number((await page.locator('#blocker-count').innerText()).replace(/\D/g,''));
    const returnVisible=await page.locator('#switch-to-broken').isVisible();
    return {pass:next<old&&returnVisible,oldBlockers:old,fixedBlockers:next,
     canRestoreBrokenFixture:returnVisible,screenshot:await shot('fixed-audit')};
   });
  }
  if(lens.id==='security-reviewer'){
   await check('security-profile','Security tab offers scoped checklist findings without guaranteeing certification.',async()=>{
    await page.locator('.profile-tab[data-profile="security"]').click();
    const selected=await page.locator('.profile-tab[aria-selected="true"]').getAttribute('data-profile');
    const footnote=await page.locator('#profile-footnote').innerText();
    return {pass:selected==='security',profile:selected,footnote,screenshot:await shot('security')};
   });
   await check('compliance-map','Compliance tab can be reached but does not claim a legal pass.',async()=>{
    await page.locator('.profile-tab[data-profile="compliance"]').click();
    const selected=await page.locator('.profile-tab[aria-selected="true"]').getAttribute('data-profile');
    return {pass:selected==='compliance',profile:selected,screenshot:await shot('compliance')};
   });
  }
  if(lens.id==='market-planner'){
   await check('market-discovery','Markets view exposes editable market plans for the selected product.',async()=>{
    await page.locator('button.nav-link[data-view="markets"]').click();
    const active=await page.locator('.view.active').getAttribute('data-page');
    const select=await page.locator('#market-country').count();
    const cards=await page.locator('.market-kpi').count();
    return {pass:active==='markets'&&select>0&&cards>0,
     active,marketSelectPresent:select>0,kpiCount:cards,screenshot:await shot('markets')};
   });
   await check('region-search','Country-search input helps find market options without changing tax/legal status.',async()=>{
    await page.locator('#add-market').click();
    await page.locator('#market-search').fill('India');
    const matches=await page.locator('#market-country option').allTextContents();
    return {pass:matches.length>0&&matches.some(t=>/India/i.test(t)),
     matchingOptions:matches.slice(0,12),screenshot:await shot('market-india')};
   });
  }
  if(lens.id==='mobile-operator'){
   await check('mobile-nav','Mobile menu opens and user can reach Reports.',async()=>{
    const button=page.locator('#mobile-menu');
    const visible=await button.isVisible();
    if(visible)await button.click();
    const sidebar=page.locator('#sidebar');
    const open=await sidebar.evaluate(el=>el.classList.contains('open')||
      getComputedStyle(el).transform==='none').catch(()=>false);
    await page.locator('#sidebar button.nav-link[data-view="reports"]').click();
    const active=await page.locator('.view.active').getAttribute('data-page');
    return {pass:visible&&active==='reports',
      menuVisible:visible,sidebarOpened:open,active,screenshot:await shot('mobile-reports')};
   });
   await check('mobile-width','The workspace does not create document-wide horizontal overflow.',async()=>{
    const widths=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
    return {pass:widths.document<=widths.viewport+2,...widths};
   });
  }
  if(lens.id==='keyboard-researcher'){
   await check('skip-link','The skip link can be reached by keyboard and moves focus to the workspace.',async()=>{
    await page.keyboard.press('Tab');
    const label=await page.locator(':focus').innerText().catch(()=>'');
    await page.keyboard.press('Enter');
    const hash=new URL(page.url()).hash;
    return {pass:/skip to workspace/i.test(label)&&hash==='#main',
     firstFocused:label,hash,screenshot:await shot('skip-link')};
   });
   await check('report-exports','Report export controls are explicitly available in the Reports tab.',async()=>{
    await page.locator('button.nav-link[data-view="reports"]').click();
    const exports=await page.locator('#view-reports [data-export]').evaluateAll(nodes=>
     nodes.map(n=>({type:n.dataset.export,disabled:n.disabled,visible:getComputedStyle(n).display!=='none'})));
    return {pass:exports.some(x=>x.type==='json')&&exports.some(x=>x.type==='html'),
     exports,screenshot:await shot('report-controls')};
   });
  }
  await check('runtime-health','No uncaught app JavaScript errors or unauthorized outbound fetches.',async()=>({
   pass:errors.length===0,errorCount:errors.length,errors,blockedExternalRequests:blocked.length,
   warnings:warnings.slice(0,3)
  }));
 }catch(e){checks.push({lens:lens.id,id:'harness-infrastructure',status:'ERROR',
  error:String(e.message||e).slice(0,850)})}
 finally{await context.tracing.stop({path:resolve(OUT,lens.id+'-trace.zip')}).catch(()=>{});
  await context.close();await writeFile(resolve(OUT,'checks.json'),JSON.stringify(checks,null,2));}
}
await browser.close();
const totals={checks:checks.length,passed:checks.filter(x=>x.status==='PASS').length,
 failed:checks.filter(x=>x.status==='FAIL').length,errors:checks.filter(x=>x.status==='ERROR').length};
const result={kind:'scripted-fictional-user-QA',app:'StoreReady ReleaseProof (demo, not proprietary StoreReady)',
 pinnedCommit:revision,startedAt,endedAt:new Date().toISOString(),lenses,
 humanParticipants:0,realCustomerStudies:0,paidModelCalls:0,productionChanges:false,
 productionPaymentOrLoginAccess:false,
 limitations:[
  'This repository contains a bounded MIT hackathon demo, not the proprietary StoreReady backend.',
  'The deliberately broken and fixed fixtures are test objects; changing fixtures is not an app security fix.',
  'No real app submission, store review, licensing certification, translations or jurisdictional legal audit occurred.',
  'No private GitHub repositories were scanned, and all third-party requests were blocked.',
 ],
 totals,checks};
await writeFile(resolve(OUT,'summary.json'),JSON.stringify(result,null,2));
console.log('STOREREADY_QA_RESULT '+JSON.stringify({commit:revision,lenses:lenses.length,...totals,
 issues:checks.filter(c=>c.status!=='PASS').map(c=>({lens:c.lens,id:c.id,status:c.status,error:c.error||null}))}));
if(totals.failed||totals.errors)process.exitCode=1;
