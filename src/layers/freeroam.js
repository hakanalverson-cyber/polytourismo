/* ===== Poly GT layer: Free Roam (open world game mode: launch, stops, jobs, drift/speed/meet money, map, HUD) ===== */
(function frgame(){
'use strict';
const P=window.PT8,F=P.FRW,BYID=P.BYID;
const $q=id=>document.getElementById(id),clampf=(v,a,b)=>v<a?a:v>b?b:v;
let FR=null,mapCv=null;
const SVfr=()=>{const sv=P.SV();return sv.fr||(sv.fr={drift:0,trap:0,view:0,top:0,jobs:0,visits:{}})};
const fmt=n=>(P.fmtCr?P.fmtCr(n):n.toLocaleString('en-US')+' Cr.');
/* ================= DOM: fade, hud, toasts, map ================= */
const CSS=`#frBlack{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:100001;transition:opacity .6s ease}
#frHud{position:fixed;inset:0;pointer-events:none;z-index:40;display:none;font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;color:#eef2f4}
#frHud .m{position:absolute;left:22px;top:20px;background:#0a0d11cc;border:1px solid #ffffff22;border-left:3px solid #ffd34d;padding:9px 16px 9px 14px;font-weight:800;letter-spacing:.08em;font-size:17px;font-style:italic}
#frHud .m small{display:block;font-size:9px;letter-spacing:.3em;font-weight:600;color:#9aa4ad;font-style:normal}
#frHud .o{position:absolute;left:22px;top:84px;max-width:290px;background:#0a0d11cc;border:1px solid #ffffff22;border-left:3px solid #4dffb0;padding:8px 14px;font-size:12px;letter-spacing:.06em;line-height:1.5;display:none}
#frHud .o b{font-size:15px;letter-spacing:.08em}
#frHud .t{position:absolute;left:50%;top:14%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:7px}
#frHud .t div{background:#0a0d11e6;border:1px solid #ffffff2a;border-left:3px solid var(--c,#fff);padding:8px 18px;font-weight:700;font-size:14px;letter-spacing:.1em;animation:frT 3.4s forwards;white-space:nowrap}
#frHud .t div i{font-style:normal;color:#7dffb0;margin-left:12px}
@keyframes frT{0%{opacity:0;transform:translateY(-8px)}8%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
#frHud .p{position:absolute;left:50%;bottom:21%;transform:translateX(-50%);background:#0a0d11e6;border:1px solid #ffffff33;padding:10px 22px;font-weight:700;letter-spacing:.14em;font-size:14px;display:none;border-bottom:3px solid var(--c,#fff)}
#frHud .p kbd{display:inline-block;background:#fff;color:#000;border-radius:3px;padding:1px 8px;margin-right:10px;font:800 12px system-ui}
#frHud .d{position:absolute;left:50%;top:26%;transform:translateX(-50%);text-align:center;font-weight:900;font-style:italic;display:none}
#frHud .d b{display:block;font-size:46px;letter-spacing:.04em;text-shadow:0 2px 14px #000a}
#frHud .d span{font-size:11px;letter-spacing:.3em;font-style:normal;color:#c9a8ff}
#frHud .g{position:absolute;right:18px;top:calc(clamp(110px,13vw,180px) + 28px);font-size:11px;letter-spacing:.14em;font-weight:700;text-align:right;display:none;text-shadow:0 1px 8px #000}
#frHud .g i{display:inline-block;font-style:normal;transition:none;margin-right:6px;font-size:15px;color:#fff}
#frBlur{position:fixed;inset:0;pointer-events:none;z-index:35;display:none;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);-webkit-mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,transparent 54%,#000 100%);mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,transparent 54%,#000 100%)}
#frMap{position:fixed;inset:0;background:#05080bf2;z-index:70;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;color:#eef2f4}
#frMap canvas{max-width:94vw;max-height:80vh;border:1px solid #ffffff33;cursor:crosshair;image-rendering:auto}
#frMap h3{margin:0;font-size:13px;letter-spacing:.4em;font-weight:700;color:#aab}
#frMap p{margin:0;font-size:11px;letter-spacing:.18em;color:#8a96a0}
body.fr .h8top,body.fr .h8mode{display:none!important}`;
function ensureUI(){if($q('frHud'))return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 const b=document.createElement('div');b.id='frBlack';document.body.appendChild(b);
 const h=document.createElement('div');h.id='frHud';h.innerHTML='<div class="m"><small>BALANCE</small><span id="frMoney">0 Cr.</span></div><div class="o" id="frObj"></div><div class="t" id="frToast"></div><div class="p" id="frPrompt"></div><div class="d" id="frDrift"></div><div class="g" id="frGps"></div>';document.body.appendChild(h);
 const bl=document.createElement('div');bl.id='frBlur';document.body.appendChild(bl);
 const mp=document.createElement('div');mp.id='frMap';mp.innerHTML='<h3>FREE ROAM MAP</h3><canvas id="frMapCv"></canvas><p>CLICK A STOP TO SET GPS / M OR ESC TO CLOSE</p>';document.body.appendChild(mp)}
let fadeTok=0;
function fade(mid,done,inMs){ensureUI();const b=$q('frBlack'),tok=++fadeTok;b.style.transition='opacity .55s ease';b.style.opacity=1;
 setTimeout(()=>{if(tok!==fadeTok)return;try{mid&&mid()}catch(e){console.error('free roam fade',e&&e.stack||e)}
  setTimeout(()=>{if(tok!==fadeTok)return;b.style.transition='opacity '+((inMs||700)/1000)+'s ease';b.style.opacity=0;setTimeout(()=>{if(tok===fadeTok&&done)done()},(inMs||700))},180)},590)}
function toast(txt,col,amt){ensureUI();const d=document.createElement('div');d.style.setProperty('--c',col||'#ffd34d');d.textContent=txt;if(amt){const i=document.createElement('i');i.textContent='+'+fmt(amt);d.appendChild(i)}
 const t=$q('frToast');t.appendChild(d);while(t.children.length>4)t.removeChild(t.firstChild);setTimeout(()=>d.remove(),3500)}
function pay(n,why,col){if(n<=0)return;P.earn(n);toast(why,col,n);if(P.sfx)try{P.sfx('select')}catch(e){}}
/* ================= world map (hill-shaded raster) ================= */
function makeMap(){if(mapCv)return mapCv;const MW=1120,MH=Math.round(MW*F.WZ/F.WX),k=F.WX/MW,cv=document.createElement('canvas');cv.width=MW;cv.height=MH;const g=cv.getContext('2d'),im=g.createImageData(MW,MH),d=im.data,W=F.W;
 for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const x=i*k,z=j*k,h=F.Hf(x,z),sh=(F.Hf(x+9,z+9)-F.Hf(x-9,z-9))*.045,o=(j*MW+i)*4;let r,gg,b;
  if(h<0){const t=clampf(-h/7,0,1);r=36-t*14;gg=96-t*26;b=140-t*30}
  else{const zn=W.Z[Math.round(z/F.CELL)*(F.WX/F.CELL+1)+Math.round(x/F.CELL)];
   if(zn===1){r=150;gg=152;b=158}else if(zn){r=84;gg=86;b=92}
   else if(h<2.6){r=222;gg=206;b=150}else if(h>124){r=240;gg=244;b=250}else if(h>82){const t=clampf((h-82)/42,0,1);r=122+t*80;gg=120+t*84;b=118+t*92}else{const t=clampf(h/70,0,1);r=96+t*34;gg=156-t*22;b=84+t*10}}
  const s=1+clampf(sh,-.35,.35);d[o]=clampf(r*s,0,255);d[o+1]=clampf(gg*s,0,255);d[o+2]=clampf(b*s,0,255);d[o+3]=255}
 g.putImageData(im,0,0);g.lineCap='round';g.lineJoin='round';
 for(const pass of[0,1])for(const r of F.ROADS){g.beginPath();for(let q=0;q<r.n;q+=2){const x=r.x[q]/k,z=r.z[q]/k;q?g.lineTo(x,z):g.moveTo(x,z)}if(r.closed)g.closePath();
  const town=r.id[0]==='t';g.strokeStyle=pass?(town?'#e8eaee':'#fff6d8'):'#1b1f26';g.lineWidth=pass?(town?1.3:r.hw>7?3:2.2):(town?2.6:r.hw>7?5.4:4.4);g.stroke()}
 g.fillStyle='#2b2d33';g.fillRect(3900/k,2798/k,1080/k,44/k);mapCv=cv;cv._k=k;return cv}
const poiIcon=(g,p,x,y,r)=>{g.fillStyle='#0b0e12';g.strokeStyle=p.col;g.lineWidth=2.2;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();g.stroke();g.fillStyle=p.col;g.font='800 '+Math.round(r*1.15)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.ic,x,y+.5)};
function drawFullMap(){const cv=$q('frMapCv'),m=makeMap();cv.width=m.width;cv.height=m.height;const g=cv.getContext('2d');g.drawImage(m,0,0);const k=m._k,c=RACE&&RACE.cars[0];
 for(const p of F.POIS){if(p.key==='trap')continue;poiIcon(g,p,p.x/k,p.z/k,11);g.font='700 10px system-ui';g.fillStyle='#fff';g.strokeStyle='#0b0e12';g.lineWidth=3;g.textAlign='center';g.strokeText(p.n,p.x/k,p.z/k+23);g.fillText(p.n,p.x/k,p.z/k+23)}
 for(const p of F.POIS)if(p.key==='trap'){g.fillStyle=p.col;g.beginPath();g.arc(p.x/k,p.z/k,4,0,6.2832);g.fill()}
 if(FR&&FR.wp){const p=FR.wp;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(p.x/k,p.z/k,17,0,6.2832);g.stroke()}
 if(c){g.save();g.translate(c.x/k,c.z/k);g.rotate(Math.PI-c.yaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(6,7);g.lineTo(0,3);g.lineTo(-6,7);g.closePath();g.fill();g.stroke();g.restore()}}
function toggleMap(on){ensureUI();const el=$q('frMap');if(on===undefined)on=el.style.display!=='flex';if(on&&!(FR&&RACE&&RACE.mode==='free'&&scr==='game'))return;
 if(on){FR.mapOpen=true;paused=true;try{stopEng()}catch(e){}drawFullMap();el.style.display='flex'}else{FR.mapOpen=false;el.style.display='none';paused=false;if(typeof down!=='undefined')down.clear()}}
function mapClick(e){const cv=$q('frMapCv'),r=cv.getBoundingClientRect(),k=makeMap()._k,x=(e.clientX-r.left)/r.width*cv.width*k,z=(e.clientY-r.top)/r.height*cv.height*k;let best=null,bd=1e9;for(const p of F.POIS){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;best=p}}
 if(best&&bd<450){FR.wp=FR.wp===best?null:best;toast(FR.wp?'GPS SET: '+best.n:'GPS CLEARED',best.col);makeWp();drawFullMap()}}
/* simple floating stop icons (drawn by hand so no font glyph is needed) */
const ICONS={};
function iconTex(key,col){const k=key+col;if(ICONS[k])return ICONS[k];const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
 x.fillStyle='rgba(12,14,18,.82)';x.beginPath();x.arc(64,64,58,0,6.2832);x.fill();x.lineWidth=7;x.strokeStyle=col;x.stroke();x.fillStyle=x.strokeStyle='#fff';x.lineWidth=8;x.lineJoin=x.lineCap='round';
 const path=(pts,close)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));if(close)x.closePath()};
 if(key==='garage'){path([[26,66],[64,32],[102,66]]);x.stroke();path([[36,60],[36,98],[92,98],[92,60]]);x.stroke();x.strokeRect(54,72,20,26)}
 else if(key==='brand'){path([[64,26],[74,54],[104,56],[80,74],[89,102],[64,86],[39,102],[48,74],[24,56],[54,54]],1);x.fill()}
 else if(key==='office'){path([[40,102],[40,28]]);x.stroke();path([[40,30],[96,30],[84,48],[96,66],[40,66]],1);x.fill()}
 else if(key==='tune'){x.beginPath();x.arc(64,64,24,0,6.2832);x.stroke();for(let i=0;i<8;i++){const a=i*.7854;path([[64+Math.cos(a)*24,64+Math.sin(a)*24],[64+Math.cos(a)*36,64+Math.sin(a)*36]]);x.stroke()}}
 else if(key==='gas'){x.strokeRect(36,34,36,64);x.fillRect(42,42,24,14);path([[72,50],[92,56],[92,86]]);x.stroke()}
 else if(key==='job'){path([[28,52],[64,36],[100,52],[100,92],[64,108],[28,92]],1);x.stroke();path([[28,52],[64,68],[100,52]]);x.stroke();path([[64,68],[64,108]]);x.stroke()}
 else if(key==='meet'){for(const[a,b]of[[44,70],[84,70],[64,48]]){x.beginPath();x.arc(a,b,12,0,6.2832);x.fill()}path([[30,96],[98,96]]);x.stroke()}
 else if(key==='drift'){x.beginPath();x.moveTo(34,92);x.bezierCurveTo(34,40,96,96,96,40);x.stroke();path([[84,44],[96,38],[100,54]]);x.stroke()}
 else if(key==='view'){path([[24,98],[54,44],[72,70],[84,56],[104,98]],1);x.fill()}
 else if(key==='air'){path([[64,24],[72,52],[104,72],[104,80],[72,70],[70,92],[82,100],[82,106],[64,102],[46,106],[46,100],[58,92],[56,70],[24,80],[24,72],[56,52]],1);x.fill()}
 else{x.beginPath();x.arc(64,64,14,0,6.2832);x.fill()}
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return ICONS[k]=t}
/* a ring of flat low-poly clouds that drifts around the player */
function makeClouds(){const pos=[],n=[],ico=new THREE.IcosahedronGeometry(1,0),ip=ico.attributes.position.array;let a=7;const R=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
 for(let i=0;i<22;i++){const ang=R()*6.283,rad=500+R()*850,cx=Math.cos(ang)*rad,cz=Math.sin(ang)*rad,cy=260+R()*190,pc=3+(R()*3|0),sc0=.8+R()*1.1;
  for(let j=0;j<pc;j++){const ox=(j-pc/2)*46*sc0+(R()-.5)*18,oy=(R()-.5)*8,oz=(R()-.5)*30,sx=(34+R()*30)*sc0,sy=(12+R()*8)*sc0,sz=(22+R()*14)*sc0;
   for(let v=0;v<ip.length;v+=3)pos.push(cx+ox+ip[v]*sx,cy+oy+ip[v+1]*sy*(ip[v+1]<0?.35:1),cz+oz+ip[v+2]*sz)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8a94a6,fog:false,transparent:true,opacity:.94}));m.frustumCulled=false;m.renderOrder=-1;return m}
/* ================= scene: sky, sun, water, beacons, parked cars ================= */
const hexs=h=>'#'+h.toString(16).padStart(6,'0');
function parkedBuilder(g){const ids=['merc','f40','dia','hur','r8','gt2','mur','nsx','amg','mar','ven','ave'],list=g.userData.cars,sub=new THREE.Group();sub.userData.shared=true;
 const known=(P.CARS||[]).map(c=>c.id);const pool=ids.filter(i=>known.indexOf(i)>=0);const use=pool.length?pool:known;if(!use.length)return;
 for(const e of list){const id=use[((e[3]*7+Math.floor(e[0]))%use.length+use.length)%use.length],idx=P.modelOf(id,0),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src)continue;
  const model=src.clone(true),car=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);car.add(ctd);ctd.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
  ctd.position.set(-ct.x,-bb.min.y,-ct.z);car.scale.setScalar(k);car.rotation.y=(sz.x>sz.z?Math.PI/2:0);const o=new THREE.Group();o.add(car);o.position.set(e[0],F.Hf(e[0],e[1])+.04,e[1]);o.rotation.y=e[2];
  o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.shared=true}});sub.add(o);g.userData.pts.push([e[0],e[1],1.5])}
 g.add(sub)}
function makeWp(){if(!FR)return;if(FR.wpMesh){FR.sc.remove(FR.wpMesh);FR.wpMesh=null}if(!FR.wp)return;const m=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,420,10,1,true),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide}));
 m.position.set(FR.wp.x,F.Hf(FR.wp.x,FR.wp.z)+200,FR.wp.z);m.frustumCulled=false;FR.sc.add(m);FR.wpMesh=m}
/* ================= launch ================= */
function mkPlayer(T,sel,from){const car=BYID[sel.id]||BYID.merc,k=0;while(COLS.length<=k){COLS.push([0xd4ded8,0x8a9fab,0xb2a28c,0x9a8c9e,0xc77,0x7c7,0x77c,0xcc7,0x7cc,0xc7c][COLS.length%10]);CS.push('#'+COLS[COLS.length-1].toString(16).padStart(6,'0'))}
 carChoices[k]=P.modelOf(car.id,sel.alt);const c=newCar(T,k,true);c.cs=car;c.carId=car.id;c.alt=sel.alt?1:0;c.gear=0;c.shiftT=0;c.gearFlash=0;c.tune=P.tuneGet(sel.id,sel.alt);
 if(c.tune){const f=P.tuneFx(c.tune,false);c.cs=Object.assign({},car,{top:car.top*f.top,acc:car.acc*f.acc,grip:car.grip*f.grip,brk:car.brk*f.brk})}
 c.loan=false;c.pnum=1;c.ptName='P1';c.slot=0;const s=from||F.SPAWN;c.x=s.x;c.z=s.z;c.y=F.Hf(s.x,s.z)+1.2;c.yaw=s.yaw;c.cy=s.yaw;c.camY=c.y+1;c.idx=2;c.unw=0;c.lapT=[];c.lapStart=0;c.curLap=0;
 if(from&&from.keep){c.vx=from.vx||0;c.vz=from.vz||0}return c}
function freeLaunch(cfg){ensureUI();cfg=Object.assign({mode:'free',track:0,laps:1e9,humans:[],ai:[]},cfg);const sel=P.SV().sel[0]||{id:'merc',alt:0};cfg.humans=[{id:sel.id,alt:sel.alt}];P.lastCfg=cfg;P.cleanupRace();
 F.build();const T=F.makeT(),sc=new THREE.Scene();FS=sc;FX=[];sc.fog=new THREE.Fog(0xc9dcea,230,720);
 const sky=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3f78cc');g.addColorStop(.42,'#9cc4ec');g.addColorStop(.5,'#c9dcea');g.addColorStop(1,'#c9dcea');x.fillStyle=g;x.fillRect(0,0,w,h)});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sky,side:THREE.BackSide,fog:false}));dome.rotation.x=0;sc.add(dome);const clouds=makeClouds();sc.add(clouds);
 sc.add(new THREE.HemisphereLight(0xdfe9f2,0x6a7560,.95));const sun=new THREE.DirectionalLight(0xfff0d4,.85);sun.position.set(-150,250,100);sc.add(sun);
 const disc=new THREE.Mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:0xfff2cc,fog:false}));sc.add(disc);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),new THREE.MeshStandardMaterial({color:0x2d7fae,roughness:.3,metalness:.1,transparent:true,opacity:.9}));water.rotation.x=-Math.PI/2;water.position.y=-.05;if(typeof styleMaterial==='function')styleMaterial(water.material);sc.add(water);
 if(P.shadeSetup)P.shadeSetup(sc);
 RACE={T,scene:sc,cars:[],state:'race',cd:0,t:0,conn:{},shake:0,laps:1e9,fin:[],endT:0,mode:'free',cfg,ending:0,doneT:0,shown:1,sess:{cr:0}};RACE.mmCls=new Uint8Array(T.N);
 let sp=cfg.spawn||F.SPAWN;if(cfg.at&&F.POIBY[cfg.at]){const p=F.POIBY[cfg.at];sp={x:p.x-24,z:F.TZ0+F.TB*2,yaw:Math.PI/2}}
 const c=mkPlayer(T,sel,sp);RACE.cars.push(c);sc.add(c.m.g);sc.add(c.m.sh);
 const h=$q('huds');h.innerHTML='';const d=document.createElement('div');d.className='hud';d.id='h0';h.appendChild(d);
 const world=F.World(sc,T,{R:cfg.R||4});world.cars=parkedBuilder;world.fill(sp.x,sp.z,2);
 FR={rc:RACE,sc,T,W:world,sky:dome,clouds,sun,disc,water,t:0,safe:{x:sp.x,z:sp.z,yaw:sp.yaw},safeT:0,wet:0,toast:0,beacons:[],wp:cfg.wp?F.POIBY[cfg.wp]:null,near:null,busy:false,trap:{},drift:{cur:0,idle:0,combo:0,in:false},meet:{t:0,cool:0},view:{},job:null,air:{max:0,on:false},mapOpen:false,fuel:0,baseCs:null,sel:sel.id+'|'+(sel.alt?1:0)};
 for(const p of F.POIS){if(p.key==='trap')continue;const g=new THREE.Group(),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:iconTex(p.key,p.col),transparent:true,depthWrite:false,fog:false}));sp.scale.set(5.2,5.2,1);sp.position.y=p.key==='garage'?9:11;sp.renderOrder=9;
  g.add(sp);g.position.set(p.x,F.Hf(p.x,p.z),p.z);g.userData={dm:sp,m:{}};g.visible=false;sc.add(g);FR.beacons.push([p,g])}
 if(P.setupDust)P.setupDust(RACE);makeWp();
 paused=false;document.body.classList.add('fr');show('game');$q('res')&&$q('res').classList.remove('on');$q('cd').textContent='';$q('fade').style.opacity=0;if(typeof rs==='function')rs();
 if(typeof down!=='undefined')down.clear();setTimeout(()=>toast('FREE ROAM',F.POIBY.garage.col),400)}
P.freeLaunch=freeLaunch;
const L0=P.launch;P.launch=cfg=>{if(cfg&&cfg.mode==='free')return freeLaunch(cfg);document.body.classList.remove('fr');return L0(cfg)};
{const cr=P.cleanupRace;P.cleanupRace=function(){if(FR){try{FR.W.dispose()}catch(e){}}FR=null;document.body.classList.remove('fr');if($q('frMap'))$q('frMap').style.display='none';return cr.apply(this,arguments)}}
P.freeEnter=at=>{ensureUI();const sv=SVfr();fade(()=>{freeLaunch({at:at||null})},null,1100)};
P.frBack=()=>{if(RACE&&RACE.mode==='free'){fade(()=>{show('game');paused=false;afterShow()});return true}
 if(P.lastCfg&&P.lastCfg.ev){fade(()=>freeLaunch({at:'office'}));return true}return false};
/* ================= respawn / safety ================= */
const rsp0=respawn;respawn=function(c){if(RACE&&RACE.mode==='free'&&FR){safeRespawn(c);return}return rsp0(c)};
function safeRespawn(c){const s=FR.safe||F.SPAWN;c.x=s.x;c.z=s.z;c.y=F.Hf(s.x,s.z)+1.3;c.vx=c.vy=c.vz=0;c.yaw=s.yaw;c.cy=s.yaw;c.pitch=c.roll=c.wpt=c.wrl=c.yr=0;c.respT=.9;c.stuck=0;c.boost=0;c.driftTimer=0;c.dts=0;c.camY=c.y+1}
/* back from garage / brand central: swap in whatever car was picked */
function afterShow(){if(!(FR&&RACE&&RACE.mode==='free'))return;const sel=P.SV().sel[0],key=sel.id+'|'+(sel.alt?1:0);P.SR&&(P.SR.home=false);
 if(key!==FR.sel){const o=RACE.cars[0];releaseCar(o.m);RACE.scene.remove(o.m.g);RACE.scene.remove(o.m.sh);const n=mkPlayer(RACE.T,sel,{x:o.x,z:o.z,yaw:o.yaw});RACE.cars[0]=n;RACE.scene.add(n.m.g);RACE.scene.add(n.m.sh);FR.sel=key;FR.fuel=0;FR.baseCs=null;if(P.setupDust)P.setupDust(RACE)}
 const c=RACE.cars[0];c.vx=c.vz=0;c.in={th:0,br:0,st:0,hb:0}}
const sh0=show;show=n=>{const was=scr;sh0(n);if(n==='game'&&was!=='game'&&was!=='pause'&&FR&&RACE&&RACE.mode==='free')afterShow()};
/* ================= stop actions ================= */
function openShowFrom(kind,home){if(FR.busy)return;FR.busy=true;fade(()=>{try{stopEng()}catch(e){}if(P.SR)P.SR.home=!!home;P.ui.openShow(kind,{player:0,cap:null,ret:'game'});if(P.SR)P.SR.home=!!home},()=>{FR.busy=false})}
function openOffice(){if(FR.busy)return;FR.busy=true;fade(()=>{try{stopEng()}catch(e){}const ST=P.ui.ST;ST.crank=null;ST.cev=null;ST.ret='game';P.ui.renderCareer();show('s8career')},()=>{FR.busy=false})}
const JOBDEST=['brand','office','tune','gas','meet','drift','view','air','garage'];
function takeJob(){if(FR.job){toast('FINISH YOUR CURRENT JOB FIRST','#4dffb0');return}const c=RACE.cars[0];const opts=JOBDEST.map(id=>F.POIBY[id]).filter(p=>Math.hypot(p.x-c.x,p.z-c.z)>900);const to=opts[(Math.random()*opts.length)|0]||F.POIBY.view,dist=Math.hypot(to.x-c.x,to.z-c.z);
 FR.job={to,t:dist/20+30,pay:Math.round(260+dist*.2),dist};FR.wp=to;makeWp();toast('JOB ACCEPTED: DELIVER TO '+to.n,'#4dffb0')}
function gasUp(){const c=RACE.cars[0],cost=150;if(FR.fuel>0){toast('PREMIUM FUEL ALREADY IN THE TANK','#ff6a4d');return}if(P.spend&&!P.spend(cost)){toast('NOT ENOUGH CREDITS ('+fmt(cost)+')','#ff6a4d');return}
 FR.fuel=600;FR.baseCs=c.cs;c.cs=Object.assign({},c.cs,{acc:c.cs.acc*1.07,top:c.cs.top*1.025});toast('PREMIUM FUEL: +7% PICKUP, +2.5% TOP SPEED FOR 10 MIN','#ff6a4d');
 if(P.puff)for(let i=0;i<10;i++)P.puff(c.x,c.y+.5,c.z,(Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3,[.9,.9,.92],1.2,.9,.4,0)}
function fuelEnd(){const c=RACE.cars[0];if(FR.baseCs){c.cs=FR.baseCs;FR.baseCs=null}FR.fuel=0}
const ACT={garage:()=>openShowFrom('garage',true),brand:()=>openShowFrom('brand',false),tune:()=>openShowFrom('garage',false),office:openOffice,job:takeJob,gas:gasUp};
const LABEL={garage:'YOUR GARAGE',brand:'BRAND CENTRAL',tune:'TUNE SHOP',office:'RACE OFFICE',job:'TAKE A DELIVERY JOB',gas:'PREMIUM FUEL  (150 Cr.)'};
addEventListener('keydown',e=>{if(!(FR&&RACE&&RACE.mode==='free')||e.repeat)return;
 if(scr==='game'||FR.mapOpen){if(e.code==='KeyM'){e.preventDefault();toggleMap();return}if(FR.mapOpen&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();toggleMap(false);return}}
 if(scr!=='game'||paused)return;
 if((e.code==='Enter'||e.code==='KeyF')&&FR.near&&ACT[FR.near.key]&&!FR.busy){const c=RACE.cars[0];if(c.sp>13){toast('SLOW DOWN FIRST','#ffffff');return}e.preventDefault();ACT[FR.near.key]()}
 if(e.code==='Backspace'){e.preventDefault();safeRespawn(RACE.cars[0])}},true);
$q('frMapCv')&&0;document.addEventListener('click',e=>{if(e.target&&e.target.id==='frMapCv')mapClick(e)});
/* ================= per-frame logic ================= */
const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a};
function frTick(dt){const Rc=RACE,c=Rc.cars[0],T=Rc.T;if(c.respT>0&&c.respT>.85){}
 FR.t+=dt;const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);FR.W.update(c.x,c.z,fx,fz,5);if(P.frAnimalsTick){if(!FR.an&&P.frAnimalsInit)FR.an=P.frAnimalsInit(F);try{P.frAnimalsTick(FR.an,FR.sc,F,c,dt)}catch(e){if(!FR.anErr){FR.anErr=1;console.warn('herds',e)}}}
 FR.sky.position.set(c.x,0,c.z);FR.clouds.position.set(c.x,0,c.z);FR.clouds.rotation.y+=dt*.004;const sd=FR.sun.userData.d0||FR.sun.position.clone().normalize();FR.disc.position.set(c.x+sd.x*1300,sd.y*1300,c.z+sd.z*1300);FR.water.position.x=c.x;FR.water.position.z=c.z;
 const h=F.Hf(c.x,c.z);
 if(h<-.45&&c.y<.5){const k=Math.exp(-dt*2.2);c.vx*=k;c.vz*=k;FR.wet+=dt;if(FR.wet>2.4){safeRespawn(c);FR.wet=0;toast('CAR RECOVERED',' #4d9bff')}}else FR.wet=Math.max(0,FR.wet-dt*.5);
 if(c.x<40||c.z<40||c.x>F.WX-40||c.z>F.WZ-40){c.x=clampf(c.x,40,F.WX-40);c.z=clampf(c.z,40,F.WZ-40);c.vx*=.5;c.vz*=.5}
 FR.safeT-=dt;if(FR.safeT<=0&&c.onRoad&&c.sp<48&&Math.abs(c.roll)<.35&&Math.abs(c.pitch)<.35&&c.respT<=0){FR.safeT=1.5;let y=T.psi[2];if(Math.cos(wrap(c.yaw-y))<0)y+=Math.PI;FR.safe={x:c.x,z:c.z,yaw:y}}
 if(FR.fuel>0){FR.fuel-=dt;if(FR.fuel<=0){fuelEnd();toast('PREMIUM FUEL USED UP','#ff6a4d')}}
 /* nearest stop */
 let near=null,nd=1e9;for(const p of F.POIS){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<p.r&&d<nd){nd=d;near=p}}FR.near=near&&!near.zone?near:null;
 /* beacons */
 for(const[p,g]of FR.beacons){const d=Math.hypot(p.x-c.x,p.z-c.z),vis=d<1000&&d>p.r*.5;g.visible=vis;if(vis){g.userData.dm.position.y=(p.key==='garage'?9:11)+Math.sin(FR.t*2+p.x)*.5;g.userData.dm.scale.set(5.2*Math.max(1,d/90),5.2*Math.max(1,d/90),1)}}
 if(FR.wpMesh){FR.wpMesh.position.x=FR.wp.x;FR.wpMesh.position.z=FR.wp.z}
 const kph=c.sp*3.6;
 /* ---- passive zones ---- */
 {const dp=F.POIBY.drift,D=FR.drift,inz=Math.hypot(c.x-dp.x,c.z-dp.z)<dp.r;
  if(inz&&c.sp>8){const slip=Math.abs(wrap(Math.atan2(c.vx,c.vz)-c.yaw));if(slip>.28&&slip<1.9&&c.onRoad===0||slip>.28&&slip<1.9){D.cur+=c.sp*slip*dt*(24+D.combo*2);D.idle=0;D.combo=Math.min(10,D.combo+dt*.6);D.in=true}else D.idle+=dt}else if(D.cur>0)D.idle+=dt;
  if(D.cur>0&&(D.idle>1.7||(!inz&&D.cur>0))){const win=Math.round(D.cur*.16);if(win>=20){pay(win,'DRIFT SCORE '+Math.round(D.cur),dp.col);const s=SVfr();if(D.cur>s.drift){s.drift=Math.round(D.cur);if(s.drift>800)toast('NEW DRIFT RECORD','#b04dff')}}D.cur=0;D.combo=0;D.idle=0}
  const el=$q('frDrift');if(D.cur>0){el.style.display='block';el.innerHTML='<b style="color:#e6d0ff">'+Math.round(D.cur)+'</b><span>DRIFT x'+Math.max(1,Math.round(D.combo))+'</span>'}else el.style.display='none'}
 for(const p of F.POIS){if(p.key!=='trap')continue;const d=Math.hypot(p.x-c.x,p.z-c.z),t=FR.trap[p.id]||(FR.trap[p.id]={max:0,in:false,cool:0});t.cool-=dt;
  if(d<p.r+4){t.in=true;t.max=Math.max(t.max,kph)}else if(t.in){t.in=false;const v=Math.round(t.max);t.max=0;if(t.cool<=0&&v>=110){const s=SVfr(),win=Math.round((v-95)*7);pay(win,'SPEED TRAP '+v+' KM/H',p.col);t.cool=25;if(v>s.trap){s.trap=v;toast('PERSONAL BEST '+v+' KM/H','#7dff4d')}}else if(t.cool<=0&&v>20)toast('SPEED TRAP: '+v+' KM/H','#7dff4d')}}
 {const mp=F.POIBY.meet,M=FR.meet,inz=Math.hypot(c.x-mp.x,c.z-mp.z)<mp.r;M.cool-=dt;if(inz&&c.sp<2.2&&M.cool<=0){M.t+=dt;if(M.t>6){M.t=0;M.cool=240;pay(260,'CAR MEET: YOU TURNED HEADS',mp.col)}}else if(!inz||c.sp>=2.2)M.t=Math.max(0,M.t-dt*2)}
 {const vp=F.POIBY.view;if(Math.hypot(c.x-vp.x,c.z-vp.z)<vp.r&&c.sp<3){FR.view.t=(FR.view.t||0)+dt;if(FR.view.t>1.5&&!FR.view.got){FR.view.got=1;const s=SVfr();if(!s.view){s.view=1;pay(700,'SUMMIT REACHED',vp.col)}else pay(60,'SUMMIT VIEW',vp.col)}}else{FR.view.t=0;if(Math.hypot(c.x-vp.x,c.z-vp.z)>vp.r+30)FR.view.got=0}}
 {const ap=F.POIBY.air,A=FR.air,onr=Math.abs(c.z-2820)<22&&c.x>3900&&c.x<4980;if(onr){A.max=Math.max(A.max,kph);A.on=true}else if(A.on){A.on=false;const v=Math.round(A.max);A.max=0;const s=SVfr();if(v>150){const win=Math.round((v-140)*5);pay(win,'AIRFIELD RUN '+v+' KM/H',ap.col);if(v>s.top){s.top=v;toast('TOP SPEED RECORD '+v+' KM/H','#ff9a3c')}}}}
 /* ---- job ---- */
 if(FR.job){const j=FR.job;j.t-=dt;if(Math.hypot(c.x-j.to.x,c.z-j.to.z)<j.to.r+10&&c.sp<20){const bonus=Math.round(Math.max(0,j.t)*3);pay(j.pay+bonus,'DELIVERY COMPLETE',j.to.col);SVfr().jobs++;FR.job=null;FR.wp=null;makeWp()}else if(j.t<=0){toast('JOB FAILED: OUT OF TIME','#ff5a4d');FR.job=null;FR.wp=null;makeWp()}}
 FR.kph=kph}
const st0=step;step=dt=>{st0(dt);if(RACE&&RACE.mode==='free'&&FR&&FR.rc===RACE&&scr==='game'&&!FR.mapOpen)frTick(dt)};
/* ================= HUD (called from the hudUpdate wrapper) ================= */
function drawMini(c){const cv=$q('mm'),m=cv.getContext('2d'),S_=cv.width,mp=makeMap(),k=mp._k,R=480,th=-Math.PI/2-Math.atan2(Math.cos(c.yaw),Math.sin(c.yaw));
 m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,S_,S_);m.imageSmoothingEnabled=false;m.save();m.beginPath();m.rect(0,0,S_,S_);m.clip();m.translate(S_/2,S_/2);m.rotate(th);
 {const q=1.46;m.drawImage(mp,(c.x-R*q)/k,(c.z-R*q)/k,2*R*q/k,2*R*q/k,-S_*q/2,-S_*q/2,S_*q,S_*q)}m.restore();
 const tr=(x,z)=>{const dx=(x-c.x)/R*S_/2,dz=(z-c.z)/R*S_/2,co=Math.cos(th),si=Math.sin(th);return[S_/2+dx*co-dz*si,S_/2+dx*si+dz*co]};
 const edge=(p,col,r)=>{let[x,y]=tr(p.x,p.z);const lim=S_/2-9,dx=x-S_/2,dy=y-S_/2,d=Math.hypot(dx,dy);if(d>lim){x=S_/2+dx/d*lim;y=S_/2+dy/d*lim}poiIcon(m,{col:col||p.col,ic:p.ic},x,y,r)};
 for(const p of F.POIS){if(p.key==='trap')continue;const[x,y]=tr(p.x,p.z);if(Math.hypot(x-S_/2,y-S_/2)<S_/2-6)poiIcon(m,p,x,y,8)}
 if(FR.wp)edge(FR.wp,'#ffffff',9);
 m.fillStyle='#fff';m.strokeStyle='#000';m.lineWidth=2;m.beginPath();m.moveTo(S_/2,S_/2-9);m.lineTo(S_/2+6.5,S_/2+7);m.lineTo(S_/2,S_/2+3);m.lineTo(S_/2-6.5,S_/2+7);m.closePath();m.fill();m.stroke()}
P.frHud=()=>{if(!(FR&&RACE&&RACE.mode==='free'))return;const c=RACE.cars[0];ensureUI();
 $q('frMoney').textContent=fmt(P.SV().cr);drawMini(c);
 const pr=$q('frPrompt'),n=FR.near;if(n&&ACT[n.key]&&!FR.busy&&!paused){pr.style.display='block';pr.style.setProperty('--c',n.col);const slow=c.sp>13;pr.innerHTML='<kbd>ENTER</kbd>'+(slow?'<span style="opacity:.6">SLOW DOWN &middot; </span>':'')+LABEL[n.key];pr.style.opacity=slow?.75:1}else pr.style.display='none';
 const o=$q('frObj');if(FR.job){const j=FR.job,left=Math.max(0,j.t),d=Math.round(Math.hypot(c.x-j.to.x,c.z-j.to.z));o.style.display='block';o.innerHTML='<b>DELIVERY</b><br>'+j.to.n+' &middot; '+(d>999?(d/1000).toFixed(1)+' km':d+' m')+'<br>'+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')+' &middot; pays '+fmt(j.pay)}else if(FR.fuel>0){o.style.display='block';o.style.borderLeftColor='#ff6a4d';o.innerHTML='<b>PREMIUM FUEL</b><br>'+Math.floor(FR.fuel/60)+':'+String(Math.floor(FR.fuel%60)).padStart(2,'0')+' left'}else o.style.display='none';
 if(FR.job)o.style.borderLeftColor='#4dffb0';
 const g=$q('frGps');if(FR.wp){const d=Math.hypot(c.x-FR.wp.x,c.z-FR.wp.z),ang=Math.atan2(FR.wp.x-c.x,FR.wp.z-c.z)-c.yaw;g.style.display='block';g.innerHTML='<i style="transform:rotate('+(-ang*57.2958)+'deg)">&#9650;</i>'+FR.wp.n+' &middot; '+(d>999?(d/1000).toFixed(1)+' km':Math.round(d)+' m')}else g.style.display='none';
 const hudOn=scr==='game'&&!paused||FR.mapOpen;$q('frHud').style.display=scr==='game'?'block':'none';
 const bl=$q('frBlur');bl.style.display=scr==='game'?'block':'none';const v=clampf((c.sp-12)/55,0,1);bl.style.opacity=(.35+.65*v).toFixed(2);bl.style.backdropFilter=bl.style.webkitBackdropFilter='blur('+(1.5+v*1.6).toFixed(1)+'px)'};
/* hide the free-roam overlay whenever the game screen is not showing */
setInterval(()=>{const h=$q('frHud'),b=$q('frBlur');if(!h)return;const on=FR&&RACE&&RACE.mode==='free'&&scr==='game';if(!on){h.style.display='none';b.style.display='none'}},250);
/* home garage studio dressing: called by the studio each frame */
let HOME=null;
function homeGarage(S){if(HOME)return HOME;const FM=P.FM,g=new THREE.Group();
 const tex=(w,h,fn,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;if(rep)t.repeat.set(rep[0],rep[1]);return t};
 const L=(o)=>new THREE.MeshLambertMaterial(Object.assign({side:THREE.DoubleSide},o)),Bm=(c)=>new THREE.MeshBasicMaterial({color:c});
 const X0=-9.5,X1=8.5,Z0=-9.5,Z1=11.8,Hh=5.8,CX=(X0+X1)/2,CZ=(Z0+Z1)/2,WX=X1-X0,WZ=Z1-Z0,lowH=3.5;
 const plane=(w,h,mat,x,y,z,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry||0;if(rx)m.rotation.x=rx;g.add(m);return m};
 const B=(w,h,d,x,y,z,col,mat,ry)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||L({color:col}));m.position.set(x,y,z);if(ry)m.rotation.y=ry;g.add(m);return m};
 const mkBrick=(rw,rh)=>tex(128,128,(x,w,h)=>{x.fillStyle='#5b4a3e';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<4;c++){const o=(r&1)*16,v=-16+Math.random()*28|0;x.fillStyle='rgb('+(156+v)+','+(106+v*.7)+','+(86+v*.6)+')';x.fillRect(((c*32+o)%128)+1,r*16+1,30,14);if(o&&c===3)x.fillRect(1,r*16+1,14,14)}},[rw/3.2,rh/3.2]);
 const paint=tex(8,8,(x,w,h)=>{x.fillStyle='#d8cdb9';x.fillRect(0,0,w,h)});
 const floorT=tex(128,128,(x,w,h)=>{x.fillStyle='#53565e';x.fillRect(0,0,w,h);for(let i=0;i<700;i++){const v=70+Math.random()*30|0;x.fillStyle='rgb('+v+','+v+','+(v+5)+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,0,w,2);x.fillRect(0,0,2,h)},[WX/4,WZ/4]);
 const topM=L({map:paint,color:0xffffff});
 /* floor, ceiling and four closed walls: every wall is double-sided, so none can be missing from any angle */
 plane(WX,WZ,L({map:floorT,color:0xffffff}),CX,-.01,CZ,0,-Math.PI/2);
 plane(WX,WZ,L({color:0x34363c}),CX,Hh,CZ,0,Math.PI/2);
 const wallSet=(len,x,z,ry)=>{plane(len,lowH,L({map:mkBrick(len,lowH),color:0xffffff}),x,lowH/2,z,ry);plane(len,Hh-lowH,topM,x,lowH+(Hh-lowH)/2,z,ry)};
 wallSet(WX,CX,Z0,0);wallSet(WX,CX,Z1,Math.PI);wallSet(WZ,X0,CZ,Math.PI/2);wallSet(WZ,X1,CZ,-Math.PI/2);
 B(WX,.3,.16,CX,.15,Z0+.08,0x3b342d);B(.16,.3,WZ,X0+.08,.15,CZ,0x3b342d);B(WX,.3,.16,CX,.15,Z1-.08,0x3b342d);B(.16,.3,WZ,X1-.08,.15,CZ,0x3b342d);
 for(let i=0;i<4;i++)B(.45,.45,WZ,X0+2.5+i*4.6,Hh-.22,CZ,0x3a2f26);
 /* roller door on the -x wall, half open onto a dusk sky */
 const sk=tex(4,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2c3f78');gr.addColorStop(.55,'#e0875a');gr.addColorStop(1,'#ffd48a');x.fillStyle=gr;x.fillRect(0,0,w,h)});
 const skyM=()=>new THREE.MeshBasicMaterial({map:sk,side:THREE.DoubleSide});
 plane(8.6,3.9,skyM(),X0+.04,1.95,-1.6,Math.PI/2);
 const door=tex(64,128,(x,w,h)=>{x.fillStyle='#8c9199';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i&1?'#7c8189':'#9ea3ab';x.fillRect(0,i*16,w,15)}});
 plane(8.6,1.5,L({map:door,color:0xffffff}),X0+.1,4.65,-1.6,Math.PI/2);
 B(.4,4.6,.4,X0+.22,2.3,-6.0,0x4b4f57);B(.4,4.6,.4,X0+.22,2.3,2.8,0x4b4f57);B(.4,.4,9.2,X0+.22,4.6,-1.6,0x4b4f57);
 /* window on the back wall */
 plane(4.4,2.2,skyM(),3.2,3.1,Z0+.04,0);
 for(const [w,h,x,y] of[[4.6,.2,3.2,4.25],[4.6,.2,3.2,1.95],[.2,2.4,.9,3.1],[.2,2.4,5.5,3.1],[.1,2.2,3.2,3.1]])B(w,h,.2,x,y,Z0+.1,0x3b2f26);
 /* models */
 const put=(n,x,z,ry,s,y,o)=>{if(!FM)return null;const m=FM.mesh(n,s||2.4,o);if(!m)return null;m.position.set(x,y||0,z);m.rotation.y=ry||0;g.add(m);return m};
 const sz=(n,s)=>{const q=FM?FM.size(n):[1,1,1];return[q[0]*(s||2.4),q[1]*(s||2.4),q[2]*(s||2.4)]};
 const PI=Math.PI,S0=2.4;
 /* lounge by the back wall (right of the car) */
 put('f_rug_round',4.9,-5.6,0,5.2,.02);
 put('f_lounge_sofa_long',4.6,Z0+sz('f_lounge_sofa_long')[2]/2+.2,0,S0);
 put('f_pillow_blue',3.5,Z0+1.0,.3,2.4,1.1);put('f_pillow',5.9,Z0+1.0,-.3,2.4,1.1);
 put('f_table_coffee',4.6,-6.0,0,S0);put('f_books',4.0,-6.0,.4,2.4,sz('f_table_coffee')[1]);put('f_laptop',5.3,-6.0,-.3,2.4,sz('f_table_coffee')[1]);
 put('f_lounge_chair_relax',7.3,-5.2,-PI/2-.25,S0);
 put('f_bookcase_open',7.6,-8.0,-PI/2,S0);put('f_potted_plant',2.2,Z0+.8,0,S0);
 /* tv wall (back wall, left of the window) */
 put('f_cabinet_television',-2.6,Z0+sz('f_cabinet_television')[2]/2+.2,0,S0);put('f_television_modern',-2.6,Z0+.9,0,S0,sz('f_cabinet_television')[1]);
 put('f_speaker',-4.2,Z0+.8,.15,S0);put('f_speaker',-1.0,Z0+.8,-.15,S0);put('f_plant_small_2',-1.0,Z0+.6,0,S0,sz('f_speaker')[1]);
 /* corner desk nook */
 put('f_desk_corner',X0+1.6,Z0+1.6,0,S0);put('f_computer_screen',X0+1.35,Z0+1.35,PI/4,S0,sz('f_desk_corner')[1]);put('f_computer_keyboard',X0+2.1,Z0+2.1,PI/4,2.2,sz('f_desk_corner')[1]);put('f_lamp_square_table',X0+.8,Z0+2.6,0,S0,sz('f_desk_corner')[1]);
 put('f_chair_desk',X0+3.1,Z0+3.1,PI*.75,S0);put('f_bookcase_closed_doors',X0+.7,-5.2,PI/2,S0);
 /* workshop along the -x wall */
 B(1.4,.12,6.2,X0+.9,1.95,7.4,0x7a5a38);for(const zz of[4.4,10.4])B(1.2,1.95,.16,X0+.9,.97,zz,0x353941);B(1.2,.08,5.8,X0+.9,.75,7.4,0x4b4f57);
 B(.12,2.6,6.6,X0+.1,3.3,7.4,0x8a6a45);
 for(let i=0;i<9;i++)B(.1,.9+((i*5)%3)*.3,.14,X0+.26,3.3+((i%3)-1)*.6,4.7+i*.65,[0xd24a3a,0xe0b13a,0x4a7bc4][i%3]);
 B(1.6,1.9,1.0,X0+1.0,.95,3.6,0xb02a22);B(1.7,.14,1.1,X0+1.0,1.97,3.6,0x2a2d33);for(let i=0;i<4;i++)B(1.5,.04,.04,X0+1.9,.35+i*.45,3.6,0x2a2d33);
 put('f_stool_bar',X0+2.4,7.2,0,S0);put('f_cardboard_box_closed',X0+1.0,-8.2+.0,.3,2.4);put('f_cardboard_box_open',X0+1.0,11.0,-.2,2.4);
 for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.55,.24,8,18),L({color:0x1c1d21}));t.rotation.x=PI/2;t.position.set(-4.6,.26+i*.46,Z0+.9);g.add(t)}
 /* posters + signs (power-of-two canvases so WebGL1 renders them) */
 const poster=(x,y,z,ry,w,h,bg,fg,txt)=>{const m=plane(w,h,new THREE.MeshBasicMaterial({map:tex(128,128,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.fillRect(0,H*.64,W,H*.09);c.fillRect(0,H*.8,W,H*.04);c.beginPath();c.moveTo(W*.1,H*.58);c.lineTo(W*.32,H*.34);c.lineTo(W*.74,H*.34);c.lineTo(W*.92,H*.58);c.closePath();c.fill();c.fillStyle='#0b0d11';c.beginPath();c.arc(W*.28,H*.6,W*.07,0,6.3);c.arc(W*.74,H*.6,W*.07,0,6.3);c.fill();c.fillStyle='#fff';c.font='900 '+(W*.2|0)+'px Helvetica,Arial';c.textAlign='center';c.fillText(txt,W/2,H*.24)}),side:THREE.DoubleSide}),x,y,z,ry);B(w+.12,h+.12,.04,x-Math.sin(ry||0)*.06,y,z-Math.cos(ry||0)*.06,0x15161a,null,ry);return m};
 poster(-6.3,3.0,Z0+.1,0,1.6,1.9,'#ff5a3a','#ffd34d','GT');poster(-0.2,3.1,Z0+.1,0,1.5,1.7,'#2a5ac8','#e8f1ff','TURBO');poster(X0+.1,3.0,-7.6,PI/2,1.5,1.8,'#1d8f6a','#ffe38a','RALLY');poster(7.4,3.2,Z0+.1,0,1.4,1.7,'#8a2ac8','#ffe3ff','NIGHT');
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1),new THREE.MeshBasicMaterial({map:tex(256,64,(x,w,h)=>{x.fillStyle='#14161a';x.fillRect(0,0,w,h);x.strokeStyle='#ffd34d';x.lineWidth=4;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#ffd34d';x.font='900 34px Helvetica,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('HOME GARAGE',w/2,h/2+2)})}));sg.position.set(-2.6,4.9,Z0+.06);g.add(sg);
 /* ceiling light bars (bloom), fan, lights */
 for(const z of[-6,0,6])for(const x of[-5,0,5]){const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.1,4.6),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(1.7,1.65,1.45)}));m.position.set(x,Hh-.55,z);g.add(m)}
 put('f_ceiling_fan',3.6,-3.2,0,S0,Hh-sz('f_ceiling_fan')[1]-.05);
 g.add(new THREE.HemisphereLight(0xfff2e0,0x3a3834,.9));
 for(const [x,z,c] of[[4.5,-5,0xffc47a],[-2.5,-6.5,0xffd9a0],[-6,3,0xfff0d0],[0,3,0xffffff],[-7,-7,0xffe2b0]]){const l=new THREE.PointLight(c,.8,14,1.4);l.position.set(x,4.4,z);g.add(l)}
 g.visible=false;S.sc.add(g);return HOME=g}
P.studioDress=(S,SR)=>{if(!S)return;const home=!!(SR&&SR.home&&SR.kind==='garage'&&FR);if(S.wall){S.wall.visible=!home;if(S.dark)S.dark.visible=!home;if(S.ring)S.ring.visible=!home}
 const g=home?homeGarage(S):HOME;if(g)g.visible=home;if(S.floor)S.floor.material.color.setHex(home?0x1d1f24:0x16191f);S.sc.background.setHex(home?0x0e0d0c:0x0b0d11)};
P.FRdebug=()=>FR;P.homeGroup=()=>HOME;
})();
