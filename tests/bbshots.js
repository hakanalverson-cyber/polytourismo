// action stills for the Brand Central backdrop: node bbshots.js outdir
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.dirname(__dirname),OUT=process.argv[2];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
 const pg=await b.newPage({viewport:{width:1024,height:576}});pg.on('pageerror',e=>console.log('PAGEERROR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.startsWith('file:'))return r.continue();
  if(u.includes('three.min.js'))return r.fulfill({path:ROOT+'/node_modules/three/build/three.min.js',contentType:'application/javascript'});return r.abort()});
 await pg.goto('file://'+(process.env.HTML||ROOT+'/dist/Poly-Tourismo.html'),{timeout:240000,waitUntil:'commit'});await pg.waitForTimeout(+(process.env.BOOT||70000));
 await pg.evaluate(()=>{const t=document.getElementById('ptTitle');if(t)t.click()});await pg.waitForTimeout(2500);
 const jobs=JSON.parse(process.env.JOBS);
 for(const [tr,secs,shot,pick,name] of jobs){
  await pg.evaluate(([tr,secs,shot,pick])=>{PT8.launch({mode:'mp',track:tr,laps:3,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:9,classes:['B','A'],skill:.9,rally:false}),trackRace:true});
   const C0=RACE.cars[0];C0.forceAI=1;C0.ai={skill:.95,lat:0,name:'T'};for(let i=0;i<secs*60;i++){step(1/60);if(RACE.state==='count'&&i>60*6)RACE.state='race'}window.drawRace=()=>{};return 1},[tr,secs,shot,pick]);
  await pg.waitForTimeout(3500);
  const url=await pg.evaluate(([tr,secs,shot,pick])=>{
   const cs=RACE.cars.slice().sort((a,b)=>b.unw-a.unw),c=cs[Math.min(cs.length-1,pick)],s=Math.sin(c.yaw),co=Math.cos(c.yaw),k=(RACE.T.d.cartoon&&RACE.T.d.cartoon.carScale)||1;
   const cam=new THREE.PerspectiveCamera(shot===2?28:40,16/9,.1,4000);const fx=-s,fz=-co,rx=co,rz=-s;/* forward and right of the car */
   const sets=[[fx*12+rx*4.5,.7,fz*12+rz*4.5,-fx*2,.9,-fz*2],[-fx*7.5+rx*2.5,1.4,-fz*7.5+rz*2.5,fx*4,.9,fz*4],[fx*26+rx*4,1.2,fz*26+rz*4,-fx*6,.8,-fz*6],[rx*7,1.1,rz*7,fx*2,.8,fz*2],[-fx*14,6,-fz*14,fx*10,0,fz*10]][shot];
   cam.position.set(c.x+sets[0]*k,c.y+sets[1]*k,c.z+sets[2]*k);cam.lookAt(c.x+sets[3]*k,c.y+sets[4]*k,c.z+sets[5]*k);
   R.setPixelRatio(1);R.setSize(1024,576,false);R.render(RACE.scene,cam);const u=R.domElement.toDataURL('image/jpeg',.88);PT8.cleanupRace&&PT8.cleanupRace();return u},[tr,secs,shot,pick]);
  fs.writeFileSync(path.join(OUT,name+'.jpg'),Buffer.from(url.split(',')[1],'base64'));console.log('saved',name)}
 await b.close()})();
