const {chromium}=require('playwright');const path=require('path');const ROOT='/home/claude/polytourismo';
(async()=>{const b=await chromium.launch({args:['--enable-precise-memory-info']});const pg=await b.newPage({viewport:{width:1280,height:720}});
await pg.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:'))return r.continue();
  if(u.includes('three.min.js'))return r.fulfill({path:ROOT+'/node_modules/three/build/three.min.js',contentType:'application/javascript'});
  if(u.includes('GLTFLoader'))return r.fulfill({path:ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'});return r.abort()});
await pg.goto('file://'+(process.env.HTML||ROOT+'/dist/Poly-Tourismo.html'),{timeout:240000,waitUntil:'commit'});await pg.waitForTimeout(60000);
await pg.evaluate(()=>{const t=document.getElementById('ptTitle');if(t)t.click()});await pg.waitForTimeout(4000);
const fps=()=>pg.evaluate(()=>new Promise(ok=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else ok(n/3)};requestAnimationFrame(f)}));
console.log('menu fps',await fps(),'scr',await pg.evaluate(()=>scr));
if(process.env.NOPROF){await b.close();return}const cdp=await pg.context().newCDPSession(pg);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');await pg.waitForTimeout(5000);const {profile}=await cdp.send('Profiler.stop');
const self={};const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const dt=profile.timeDeltas;const cnt={};profile.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(dt[i]||0)});
for(const id in cnt){const n=byId[id];const k=n.callFrame.functionName+' '+(n.callFrame.url||'').slice(-20)+':'+n.callFrame.lineNumber+':'+n.callFrame.columnNumber;self[k]=(self[k]||0)+cnt[id]}
console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>(v/1000).toFixed(0)+'ms '+k).join('\n'));
console.log('dom nodes',await pg.evaluate(()=>document.getElementsByTagName('*').length),'timers?');
await b.close()})();
