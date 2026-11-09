// node port of shot.py: node shot.js steps.json prefix [w h]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.dirname(__dirname),OUT=path.join(ROOT,'tests','out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const steps=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),pre=process.argv[3]||'s',W=+(process.argv[4]||1280),H=+(process.argv[5]||720);
 const html=process.env.HTML||path.join(ROOT,'dist','Poly-Tourismo.html');
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
 const pg=await b.newPage({viewport:{width:W,height:H}});const logs=[];
 pg.on('console',m=>logs.push(m.type()+': '+m.text()));pg.on('pageerror',e=>logs.push('PAGEERROR: '+e.message+' | '+String(e.stack).slice(0,400)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:'))return r.continue();if(process.env.ARTDIR&&u.startsWith('https://art.test/')){const f=path.join(process.env.ARTDIR,u.slice(17).split('?')[0]||'index.html');return r.fulfill({path:f,contentType:f.endsWith('.html')?'text/html':'text/plain'})}
  if(u.includes('three.min.js'))return r.fulfill({path:ROOT+'/node_modules/three/build/three.min.js',contentType:'application/javascript'});
  if(u.includes('GLTFLoader'))return r.fulfill({path:ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'});return r.abort()});
 await pg.goto(process.env.ARTDIR?'https://art.test/index.html':'file://'+html,{timeout:240000,waitUntil:'commit'});await pg.waitForTimeout(+(process.env.BOOT||40000));
 for(const s of steps){try{
  if(s[0]==='js'){const v=await pg.evaluate(s[1]);console.log('JS->',v)}
  else if(s[0]==='save'){const v=await pg.evaluate(s[2]);if(typeof v==='string'&&v.startsWith('data:'))fs.writeFileSync(path.join(OUT,pre+'_'+s[1]+'.jpg'),Buffer.from(v.split(',')[1],'base64'));else console.log('SAVE->',String(v).slice(0,200))}
  else if(s[0]==='wait')await pg.waitForTimeout(s[1]);
  else if(s[0]==='shot')await pg.screenshot({path:path.join(OUT,pre+'_'+s[1]+'.png')});
  else if(s[0]==='key')await pg.keyboard.press(s[1]);else if(s[0]==='down')await pg.keyboard.down(s[1]);else if(s[0]==='up')await pg.keyboard.up(s[1]);
  else if(s[0]==='click')await pg.click(s[1]);else if(s[0]==='hover')await pg.hover(s[1],{force:true});else if(s[0]==='prof'){const c=await pg.context().newCDPSession(pg);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:500});await c.send('Profiler.start');await pg.waitForTimeout(s[1]);const {profile:P}=await c.send('Profiler.stop');const dt=(P.endTime-P.startTime)/1000,cnt={};P.samples.forEach(id=>cnt[id]=(cnt[id]||0)+1);const self={};const byId={};P.nodes.forEach(n=>byId[n.id]=n);for(const id in cnt){const f=byId[id].callFrame;const k=(f.functionName||'(anon)')+' L'+f.lineNumber+':'+f.columnNumber;self[k]=(self[k]||0)+cnt[id]}const tot=P.samples.length;console.log('PROF ms',dt|0,'samples',tot);Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,s[2]||30).forEach(([k,v])=>console.log('PROF',(100*v/tot).toFixed(1)+'%',k))}else if(s[0]==='inject')await pg.evaluate(fs.readFileSync(s[1],'utf8'));else if(s[0]==='file')await pg.setInputFiles(s[1],s[2]);}catch(e){console.log('ERR',String(e).slice(0,300))}}
 console.log(logs.slice(-25).join('\n'));await b.close()})();
