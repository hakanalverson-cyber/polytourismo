/* Bakes the loading screen's photos. A real browser renders the game's own scenes from a LITE build: the location photoshoots (P.LOAD_LOC, car on the road with a real
   backdrop, depth of field, glossy paint) and the object photo (the magazine on a café table), and writes them to assets/bootbg/ as JPEGs:
   u-NN-name.jpg are the photoshoots (the loading screen's logo moves to the top left over them), b-NN-name.jpg carry their own logo. build.py embeds whatever is in that folder,
   so the loading screen shows them from the first start, at once, without rendering anything.
     LITE=1 python3 build.py /tmp/lite.html && node tools/bake/bake.js /tmp/lite.html [size]
   Needs playwright (npm i playwright) and three@0.128 in node_modules (the page's CDN scripts are served from there). Software GL is fine, it takes a few minutes. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const html=path.resolve(process.argv[2]||'/tmp/lite.html'),W=+(process.argv[3]||1920),out=path.join(__dirname,'../../assets/bootbg'),R=path.join(__dirname,'../../node_modules/three/');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:')||u.startsWith('data:'))return r.continue();if(u.includes('three.min.js'))return r.fulfill({path:R+'build/three.min.js',contentType:'application/javascript'});if(u.includes('GLTFLoader'))return r.fulfill({path:R+'examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'});return r.abort()});
 await p.addInitScript(w=>{window.PT8_FAST=1;window.PT8_NOSCENE=1;window.PT8_LOCW=w;try{localStorage.setItem('pt8-save',JSON.stringify({askedName:1,name:'baker'}))}catch(e){}},W);
 p.on('pageerror',e=>console.error('page error',e.message));p.goto('file://'+html).catch(()=>{});
 for(let k=0;k<600;k++){await p.waitForTimeout(500);if(await p.evaluate(()=>!!(window.PT8&&PT8.bootDone)).catch(()=>false))break}
 fs.mkdirSync(out,{recursive:true});for(const f of fs.readdirSync(out))if(/\.jpg$/.test(f))fs.unlinkSync(path.join(out,f));
 const n=await p.evaluate(()=>PT8.LOAD_LOC.length);let i=0;
 for(let k=0;k<n;k++){const r=await p.evaluate(async k=>{const P=PT8;await P.photoReady();const s=P.LOAD_LOC[k],c=await P.locShot(s,'l');return {n:P.SHOOTS[s].env,d:c.toDataURL('image/jpeg',.92)}},k);
  const f='u-'+String(++i).padStart(2,'0')+'-'+r.n+'.jpg';fs.writeFileSync(path.join(out,f),Buffer.from(r.d.split(',')[1],'base64'));console.log(f)}
 for(const nm of ['mag']){const r=await p.evaluate(async nm=>{const P=PT8;await P.photoReady();const c=await P.propShot(P.PROPS.indexOf(nm));return c&&c.toDataURL('image/jpeg',.92)},nm);
  if(r){const f='b-'+String(++i).padStart(2,'0')+'-'+nm+'.jpg';fs.writeFileSync(path.join(out,f),Buffer.from(r.split(',')[1],'base64'));console.log(f)}}
 await b.close()})();
