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
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sky,side:THREE.BackSide,fog:false}));dome.rotation.x=0;sc.add(dome);
 sc.add(new THREE.HemisphereLight(0xdfe9f2,0x6a7560,.95));const sun=new THREE.DirectionalLight(0xfff0d4,.85);sun.position.set(-150,250,100);sc.add(sun);
 const disc=new THREE.Mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:0xfff2cc,fog:false}));sc.add(disc);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),new THREE.MeshStandardMaterial({color:0x2d7fae,roughness:.3,metalness:.1,transparent:true,opacity:.9}));water.rotation.x=-Math.PI/2;water.position.y=-.05;if(typeof styleMaterial==='function')styleMaterial(water.material);sc.add(water);
 if(P.shadeSetup)P.shadeSetup(sc);
 RACE={T,scene:sc,cars:[],state:'race',cd:0,t:0,conn:{},shake:0,laps:1e9,fin:[],endT:0,mode:'free',cfg,ending:0,doneT:0,shown:1,sess:{cr:0}};RACE.mmCls=new Uint8Array(T.N);
 let sp=cfg.spawn||F.SPAWN;if(cfg.at&&F.POIBY[cfg.at]){const p=F.POIBY[cfg.at];sp={x:p.x-24,z:F.TZ0+F.TB*2,yaw:Math.PI/2}}
 const c=mkPlayer(T,sel,sp);RACE.cars.push(c);sc.add(c.m.g);sc.add(c.m.sh);
 const h=$q('huds');h.innerHTML='';const d=document.createElement('div');d.className='hud';d.id='h0';h.appendChild(d);
 const world=F.World(sc,T,{R:cfg.R||4});world.cars=parkedBuilder;world.fill(sp.x,sp.z,2);
 FR={rc:RACE,sc,T,W:world,sky:dome,sun,disc,water,t:0,safe:{x:sp.x,z:sp.z,yaw:sp.yaw},safeT:0,wet:0,toast:0,beacons:[],wp:cfg.wp?F.POIBY[cfg.wp]:null,near:null,busy:false,trap:{},drift:{cur:0,idle:0,combo:0,in:false},meet:{t:0,cool:0},view:{},job:null,air:{max:0,on:false},mapOpen:false,fuel:0,baseCs:null,sel:sel.id+'|'+(sel.alt?1:0)};
 for(const p of F.POIS){if(p.key==='trap')continue;const g=new THREE.Group(),col=parseInt(p.col.slice(1),16),m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),b=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,70,10,1,true),m),dm=new THREE.Mesh(new THREE.OctahedronGeometry(1.6),new THREE.MeshBasicMaterial({color:col}));
  b.position.y=35;dm.position.y=8;g.add(b,dm);g.position.set(p.x,F.Hf(p.x,p.z),p.z);g.userData={dm,m};g.visible=false;sc.add(g);FR.beacons.push([p,g])}
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
 FR.t+=dt;const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);FR.W.update(c.x,c.z,fx,fz,5);
 FR.sky.position.set(c.x,0,c.z);const sd=FR.sun.userData.d0||FR.sun.position.clone().normalize();FR.disc.position.set(c.x+sd.x*1300,sd.y*1300,c.z+sd.z*1300);FR.water.position.x=c.x;FR.water.position.z=c.z;
 const h=F.Hf(c.x,c.z);
 if(h<-.45&&c.y<.5){const k=Math.exp(-dt*2.2);c.vx*=k;c.vz*=k;FR.wet+=dt;if(FR.wet>2.4){safeRespawn(c);FR.wet=0;toast('CAR RECOVERED',' #4d9bff')}}else FR.wet=Math.max(0,FR.wet-dt*.5);
 if(c.x<40||c.z<40||c.x>F.WX-40||c.z>F.WZ-40){c.x=clampf(c.x,40,F.WX-40);c.z=clampf(c.z,40,F.WZ-40);c.vx*=.5;c.vz*=.5}
 FR.safeT-=dt;if(FR.safeT<=0&&c.onRoad&&c.sp<48&&Math.abs(c.roll)<.35&&Math.abs(c.pitch)<.35&&c.respT<=0){FR.safeT=1.5;let y=T.psi[2];if(Math.cos(wrap(c.yaw-y))<0)y+=Math.PI;FR.safe={x:c.x,z:c.z,yaw:y}}
 if(FR.fuel>0){FR.fuel-=dt;if(FR.fuel<=0){fuelEnd();toast('PREMIUM FUEL USED UP','#ff6a4d')}}
 /* nearest stop */
 let near=null,nd=1e9;for(const p of F.POIS){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<p.r&&d<nd){nd=d;near=p}}FR.near=near&&!near.zone?near:null;
 /* beacons */
 for(const[p,g]of FR.beacons){const d=Math.hypot(p.x-c.x,p.z-c.z),vis=d<1000&&d>p.r*.5;g.visible=vis;if(vis){g.userData.dm.rotation.y+=dt*1.6;g.userData.dm.position.y=8+Math.sin(FR.t*2+p.x)*.6;g.userData.m.opacity=.16+.07*Math.sin(FR.t*2.4+p.z)}}
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
function homeGarage(S){if(HOME)return HOME;const g=new THREE.Group(),B=(w,h,d,x,y,z,col,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||new THREE.MeshBasicMaterial({color:col}));m.position.set(x,y,z);g.add(m);return m};
 const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;return t};
 const block=tex(128,64,(x,w,h)=>{x.fillStyle='#4b4640';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<4;c++){const o=(r&1)*16,v=70+Math.random()*22|0;x.fillStyle='rgb('+v+','+(v-4)+','+(v-10)+')';x.fillRect(c*32+o+1,r*16+1,30,14)}});block.repeat.set(5,3);
 const floor=tex(128,128,(x,w,h)=>{x.fillStyle='#2c2f35';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){const v=38+Math.random()*16|0;x.fillStyle='rgb('+v+','+v+','+(v+4)+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='#d9b23a';x.lineWidth=3;x.strokeRect(2,2,w-4,h-4)});floor.repeat.set(4,4);
 const door=tex(64,128,(x,w,h)=>{x.fillStyle='#8c9199';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i&1?'#7c8189':'#999ea6';x.fillRect(0,i*16,w,15)}});
 const wm=new THREE.MeshBasicMaterial({map:block,side:THREE.BackSide,color:0xb9aea0}),W=30,Hh=7.4;
 const room=new THREE.Mesh(new THREE.BoxGeometry(W,Hh,W),wm);room.position.y=Hh/2-.02;g.add(room);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,W),new THREE.MeshBasicMaterial({map:floor,color:0xc8c8d0}));fl.rotation.x=-Math.PI/2;fl.position.y=-.015;g.add(fl);
 const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,W),new THREE.MeshBasicMaterial({color:0x1a1c20}));ceil.rotation.x=Math.PI/2;ceil.position.y=Hh-.03;g.add(ceil);
 /* back wall: roller door half open onto a dusk sky */
 const sk=tex(4,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2c3f78');gr.addColorStop(.6,'#e0875a');gr.addColorStop(1,'#ffcf86');x.fillStyle=gr;x.fillRect(0,0,w,h)});
 const sky=new THREE.Mesh(new THREE.PlaneGeometry(11,5.4),new THREE.MeshBasicMaterial({map:sk}));sky.position.set(-14.8,2.9,-4);sky.rotation.y=Math.PI/2;g.add(sky);
 const dr=new THREE.Mesh(new THREE.PlaneGeometry(11,2.4),new THREE.MeshBasicMaterial({map:door,color:0xbfc4cc}));dr.position.set(-14.7,6.2,-4);dr.rotation.y=Math.PI/2;g.add(dr);
 /* workbench + pegboard */
 B(.9,.12,8,-14,1.05,5,0x6b4a2c);for(const z of[1.4,8.6])B(.8,1,.12,-14,.5,z,0x3a3d44);B(.12,2.1,8.2,-14.8,2.3,5,0x8a6a45);
 for(let i=0;i<9;i++)B(.12,.9+((i*5)%3)*.3,.14,-14.65,2.4+((i%3)-1)*.5,1.6+i*.85,[0xd24a3a,0xe0b13a,0x4a7bc4][i%3]);
 /* red tool chest + shelf with tyres */
 B(1.4,1.5,.9,-12.2,.75,13.4,0xb02a22);B(1.46,.12,.96,-12.2,1.55,13.4,0x2a2d33);
 for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.5,.2,8,16),new THREE.MeshBasicMaterial({color:0x1b1c20}));t.rotation.x=Math.PI/2;t.position.set(-4+i*.04,.25+i*.4,-14.2);g.add(t)}
 B(5,.1,1,-6,1.6,-14.5,0x4a4d55);B(5,.1,1,-6,2.9,-14.5,0x4a4d55);for(let i=0;i<5;i++)B(.5,.7,.6,-8+i*1,2.0,-14.4,[0xc8a24a,0x6b7a8f,0xa84a3a][i%3]);
 /* hanging light bars (bloom) */
 for(const z of[-8,0,8])for(const x of[-6,6]){const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.1,6),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(1.7,1.65,1.45)}));m.position.set(x,Hh-.5,z);g.add(m)}
 /* garage-number sign */
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1),new THREE.MeshBasicMaterial({map:tex(256,64,(x,w,h)=>{x.fillStyle='#14161a';x.fillRect(0,0,w,h);x.strokeStyle='#ffd34d';x.lineWidth=4;x.strokeRect(3,3,w-6,h-6);x.fillStyle='#ffd34d';x.font='900 34px Helvetica,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('HOME GARAGE',w/2,h/2+2)})}));sg.position.set(-8,4.9,-14.9);g.add(sg);
 g.visible=false;S.sc.add(g);return HOME=g}
P.studioDress=(S,SR)=>{if(!S)return;const home=!!(SR&&SR.home&&SR.kind==='garage'&&FR);if(S.wall){S.wall.visible=!home;if(S.dark)S.dark.visible=!home;if(S.ring)S.ring.visible=!home}
 const g=home?homeGarage(S):HOME;if(g)g.visible=home;if(S.floor)S.floor.material.color.setHex(home?0x1d1f24:0x16191f);S.sc.background.setHex(home?0x0e0d0c:0x0b0d11)};
P.FRdebug=()=>FR;
})();
