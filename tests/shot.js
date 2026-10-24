// node port of shot.py: node shot.js steps.json prefix [w h]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.dirname(__dirname),OUT=path.join(ROOT,'tests','out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const steps=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),pre=process.argv[3]||'s',W=+(process.argv[4]||1280),H=+(process.argv[5]||720);
 const html=process.env.HTML||path.join(ROOT,'dist','Poly-Tourismo.html');
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
 const pg=await b.newPage({viewport:{width:W,height:H}});const logs=[];
 pg.on('console',m=>logs.push(m.type()+': '+m.text()));pg.on('pageerror',e=>logs.push('PAGEERROR: '+e.message+' | '+String(e.stack).slice(0,400)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:'))return r.continue();
  if(u.includes('three.min.js'))return r.fulfill({path:ROOT+'/node_modules/three/build/three.min.js',contentType:'application/javascript'});
  if(u.includes('GLTFLoader'))return r.fulfill({path:ROOT+'/node_modules/three/examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'});return r.abort()});
 await pg.goto('file://'+html,{timeout:240000,waitUntil:'commit'});await pg.waitForTimeout(+(process.env.BOOT||40000));
 for(const s of steps){try{
  if(s[0]==='js'){const v=await pg.evaluate(s[1]);console.log('JS->',v)}
  else if(s[0]==='wait')await pg.waitForTimeout(s[1]);
  else if(s[0]==='shot')await pg.screenshot({path:path.join(OUT,pre+'_'+s[1]+'.png')});
  else if(s[0]==='key')await pg.keyboard.press(s[1]);else if(s[0]==='down')await pg.keyboard.down(s[1]);else if(s[0]==='up')await pg.keyboard.up(s[1]);
  else if(s[0]==='click')await pg.click(s[1]);}catch(e){console.log('ERR',String(e).slice(0,300))}}
 console.log(logs.slice(-25).join('\n'));await b.close()})();
