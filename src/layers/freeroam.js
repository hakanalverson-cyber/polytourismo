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
/* PS3 look (matches the menus): soft glossy plates (lit top, dark bottom, a thin white highlight), light upright Inter type, chrome-blue accent */
#frHud{position:fixed;inset:0;pointer-events:none;z-index:40;display:none;font-family:var(--gt,"Inter","Segoe UI",sans-serif);color:#f2f4f6;-webkit-font-smoothing:antialiased;--plate:linear-gradient(180deg,rgba(70,76,84,.66) 0%,rgba(30,33,37,.76) 50%,rgba(14,15,18,.82) 100%);--plhi:inset 0 1px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(255,255,255,.08),0 8px 26px rgba(0,0,0,.45);--cb:#8fb4d8}
#frHud .m{display:none}
#frHud .o{position:absolute;left:22px;top:20px;max-width:300px;background:var(--plate);box-shadow:var(--plhi);border-radius:8px;padding:10px 16px;font-size:12px;letter-spacing:.04em;line-height:1.55;display:none;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-left:0!important}
#frHud .o b{font-size:14px;font-weight:600;letter-spacing:.12em}
#frHud .t{position:absolute;left:50%;top:13%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px}
#frHud .t div{background:var(--plate);box-shadow:var(--plhi);border-radius:8px;padding:9px 20px 9px 16px;font-weight:500;font-size:14px;letter-spacing:.12em;animation:frT 3.4s forwards;white-space:nowrap;display:flex;align-items:center;gap:10px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#frHud .t div:before{content:"";width:9px;height:9px;border-radius:50%;background:var(--c,#fff);box-shadow:0 0 8px var(--c,#fff)}
#frHud .t div i{font-style:normal;color:#bfe0a8;margin-left:6px}
@keyframes frT{0%{opacity:0;transform:translateY(-8px)}8%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
#frHud .p{position:absolute;left:50%;bottom:21%;transform:translateX(-50%);background:var(--plate);box-shadow:var(--plhi);border-radius:8px;padding:10px 22px 10px 12px;font-weight:500;letter-spacing:.14em;font-size:14px;display:none;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#frHud .p kbd{display:inline-block;background:linear-gradient(180deg,#fff 0%,#e9ecef 48%,#d3d8dc 52%,#e6e9ec 100%);color:#15181c;border-radius:5px;padding:2px 9px;margin-right:12px;font:600 12px var(--gt,sans-serif);box-shadow:0 1px 3px #0008}
#frHud .d{position:absolute;left:50%;top:26%;transform:translateX(-50%);text-align:center;font-weight:300;display:none}
#frHud .d b{display:block;font-size:46px;font-weight:300;letter-spacing:.06em;text-shadow:0 2px 14px #000a}
#frHud .d span{font-size:11px;letter-spacing:.34em;color:var(--cb)}
#frHud .g{position:absolute;right:16px;top:calc(clamp(160px,18vw,236px) + 26px);font-size:11px;letter-spacing:.14em;text-align:left;display:none;background:var(--plate);box-shadow:var(--plhi);border-radius:8px;padding:8px 14px 8px 10px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#frHud .g i{display:inline-block;width:18px;height:18px;vertical-align:-4px;margin-right:9px}#frHud .g b{display:block;font-size:13px;font-weight:600;letter-spacing:.1em;color:#fff}#frHud .g small{display:block;margin:2px 0 0 27px;color:var(--cb);font-size:10px;letter-spacing:.22em}
body.fr #mm{width:clamp(160px,18vw,236px)!important;height:clamp(160px,18vw,236px)!important;top:14px!important;right:14px!important;border-radius:50%;image-rendering:auto!important;background:none!important;border:0!important;filter:drop-shadow(0 4px 12px #000b)}
#frBlur{position:fixed;inset:0;pointer-events:none;z-index:35;display:none;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);-webkit-mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,transparent 54%,#000 100%);mask-image:radial-gradient(ellipse 72% 70% at 50% 52%,transparent 54%,#000 100%)}
#frMap{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,#151a20f2 0%,#05070af7 75%);z-index:70;display:none;align-items:center;justify-content:center;flex-direction:column;gap:12px;font-family:var(--gt,"Inter",sans-serif);color:#f2f4f6;-webkit-font-smoothing:antialiased;padding-top:66px}
#frMap:before{content:"";position:absolute;left:0;right:0;top:0;height:66px;background:var(--gx,linear-gradient(180deg,#3a3e44f2 0%,#24272cf2 48%,#17191cf2 52%,#1e2125f2 100%));box-shadow:inset 0 1px 0 #ffffff30,inset 0 -1px 0 #000,0 4px 16px #0009}
#frMap h3{position:absolute;top:0;left:34px;height:66px;display:flex;align-items:center;margin:0;font-size:20px;font-weight:300;letter-spacing:.3em;color:#fff;z-index:1}
#frMap canvas{max-width:92vw;max-height:70vh;border-radius:10px;cursor:crosshair;image-rendering:auto;box-shadow:0 0 0 1px #ffffff26,0 12px 40px #000c}
#frMap p{margin:0;font-size:11px;letter-spacing:.2em;color:#aeb6be}
#frFT{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:92vw;align-items:center}
#frFT button{pointer-events:auto;background:linear-gradient(180deg,#4a4f56 0%,#33373c 48%,#26292d 52%,#2e3236 100%);color:#fff;border:0;border-radius:6px;box-shadow:inset 0 1px 0 #ffffff38,0 2px 6px #0008;padding:7px 14px 7px 11px;font:500 11px var(--gt,sans-serif);letter-spacing:.14em;cursor:pointer;display:flex;align-items:center;gap:8px}
#frFT button:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c,#fff)}
#frFT button:hover{background:linear-gradient(180deg,#fff 0%,#e9ecef 48%,#d3d8dc 52%,#e6e9ec 100%);color:#15181c;box-shadow:0 0 0 2px #8fb4d8,0 0 16px #4f7eab90}
body.fr .h8top,body.fr .h8mode{display:none!important}`;
function ensureUI(){if($q('frHud'))return;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 const b=document.createElement('div');b.id='frBlack';document.body.appendChild(b);
 const h=document.createElement('div');h.id='frHud';h.innerHTML='<div class="m"><small>BALANCE</small><span id="frMoney">0 Cr.</span></div><div class="o" id="frObj"></div><div class="t" id="frToast"></div><div class="p" id="frPrompt"></div><div class="d" id="frDrift"></div><div class="g" id="frGps"></div>';document.body.appendChild(h);
 const bl=document.createElement('div');bl.id='frBlur';document.body.appendChild(bl);
 const mp=document.createElement('div');mp.id='frMap';mp.innerHTML='<h3>MAP</h3><canvas id="frMapCv"></canvas><p>CLICK A STOP TO SET GPS &middot; CLICK IT AGAIN TO FAST TRAVEL &middot; M OR ESC TO CLOSE</p><div id="frFT"></div>';document.body.appendChild(mp)}
let fadeTok=0;
function fade(mid,done,inMs){ensureUI();const b=$q('frBlack'),tok=++fadeTok;b.style.transition='opacity .55s ease';b.style.opacity=1;
 setTimeout(()=>{if(tok!==fadeTok)return;try{mid&&mid()}catch(e){console.error('free roam fade',e&&e.stack||e)}
  setTimeout(()=>{if(tok!==fadeTok)return;b.style.transition='opacity '+((inMs||700)/1000)+'s ease';b.style.opacity=0;setTimeout(()=>{if(tok===fadeTok&&done)done()},(inMs||700))},180)},590)}
function toast(txt,col,amt){ensureUI();const d=document.createElement('div');d.style.setProperty('--c',col||'#ffd34d');d.textContent=txt;if(amt){const i=document.createElement('i');i.textContent='+'+fmt(amt);d.appendChild(i)}
 const t=$q('frToast');t.appendChild(d);while(t.children.length>4)t.removeChild(t.firstChild);setTimeout(()=>d.remove(),3500)}
function pay(n,why,col){if(n<=0)return;P.earn(n);toast(why,col,n);if(P.sfx)try{P.sfx('select')}catch(e){}}
/* ================= world map (hill-shaded raster) ================= */
function makeMap(){if(mapCv)return mapCv;const MW=1120,MH=Math.round(MW*F.WZ/F.WX),k=F.WX/MW,cv=document.createElement('canvas');cv.width=MW;cv.height=MH;const g=cv.getContext('2d');
 /* a map with its own top-down picture (the Rockport pack) */
 if(F.mapImg&&F.mapImg.complete&&F.mapImg.naturalWidth){g.drawImage(F.mapImg,0,0,MW,MH);mapCv=cv;cv._k=k;return cv}
 const im=g.createImageData(MW,MH),d=im.data,W=F.W,GXm=F.WX/F.CELL+1;
 for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const x=i*k,z=j*k,h=F.Hf(x,z),sh=(F.Hf(x+9,z+9)-F.Hf(x-9,z-9))*.03,o=(j*MW+i)*4;let r,gg,b;
  if(h<0){const t=clampf(-h/46,0,1);r=88-t*66;gg=186-t*118;b=198-t*88}
  else{const zn=W.Z[Math.round(z/F.CELL)*GXm+Math.round(x/F.CELL)];
   if(zn===1||zn===4){r=178;gg=164;b=146}else if(zn){r=84;gg=86;b=92}
   else if(h<3.2){r=234;gg=219;b=168}else if(h>170){const t=clampf((h-170)/90,0,1);r=156+t*68;gg=150+t*72;b=140+t*76}else{const t=clampf(h/165,0,1);r=96+t*58;gg=134+t*6;b=78+t*30}}
  const s=1+clampf(sh,-.4,.4);d[o]=clampf(r*s,0,255);d[o+1]=clampf(gg*s,0,255);d[o+2]=clampf(b*s,0,255);d[o+3]=255}
 g.putImageData(im,0,0);g.lineCap='round';g.lineJoin='round';
 for(const pass of[0,1])for(const r of F.ROADS){g.beginPath();for(let q=0;q<r.n;q+=2){const x=r.x[q]/k,z=r.z[q]/k;q?g.lineTo(x,z):g.moveTo(x,z)}
  const street=r.type==='street',main=r.type==='main',c=r.col||[255,240,130];g.strokeStyle=pass?(street?'#e8eaee':'rgb('+c[0]+','+c[1]+','+c[2]+')'):'#1b1f26';g.lineWidth=pass?(street?1.1:main?2.6:2.1):(street?2.2:main?4.8:4.0);g.stroke()}
 mapCv=cv;cv._k=k;return cv}
const poiIcon=(g,p,x,y,r)=>{{const gr=g.createLinearGradient(0,y-r,0,y+r);gr.addColorStop(0,'#3e434a');gr.addColorStop(.5,'#1e2125');gr.addColorStop(1,'#101215');g.fillStyle=gr}if(0)g.fillStyle='#0b0e12';g.strokeStyle=p.col;g.lineWidth=2.2;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();g.stroke();g.fillStyle=p.col;g.font='600 '+Math.round(r*1.1)+'px Inter,Segoe UI,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.ic,x,y+.5)};
function drawFullMap(){const cv=$q('frMapCv'),m=makeMap();cv.width=m.width;cv.height=m.height;const g=cv.getContext('2d');g.drawImage(m,0,0);const k=m._k,c=RACE&&RACE.cars[0];
 for(const p of F.POIS){if(p.key==='trap')continue;poiIcon(g,p,p.x/k,p.z/k,11);g.font='700 10px system-ui';g.fillStyle='#fff';g.strokeStyle='#0b0e12';g.lineWidth=3;g.textAlign='center';g.strokeText(p.n,p.x/k,p.z/k+23);g.fillText(p.n,p.x/k,p.z/k+23)}
 for(const p of F.POIS)if(p.key==='trap'){g.fillStyle=p.col;g.beginPath();g.arc(p.x/k,p.z/k,4,0,6.2832);g.fill()}
 if(FR&&FR.wp){const p=FR.wp;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(p.x/k,p.z/k,17,0,6.2832);g.stroke()}
 if(c){g.save();g.translate(c.x/k,c.z/k);g.rotate(Math.PI-c.yaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(6,7);g.lineTo(0,3);g.lineTo(-6,7);g.closePath();g.fill();g.stroke();g.restore()}}
function toggleMap(on){ensureUI();const el=$q('frMap');if(on===undefined)on=el.style.display!=='flex';if(on&&!(FR&&RACE&&RACE.mode==='free'&&scr==='game'))return;
 if(on){FR.mapOpen=true;paused=true;try{stopEng()}catch(e){}drawFullMap();el.style.display='flex';const ft=$q('frFT');if(ft){ft.innerHTML='';const lab=document.createElement('span');lab.textContent='FAST TRAVEL';lab.style.cssText='font:500 11px var(--gt,sans-serif);letter-spacing:.3em;color:#8fb4d8;margin-right:8px';ft.appendChild(lab);for(const p of F.POIS){if(p.key==='trap')continue;const b=document.createElement('button');b.textContent=p.n;b.style.setProperty('--c',p.col);b.onclick=e=>{e.stopPropagation();fastTravel(p)};ft.appendChild(b)}}}else{FR.mapOpen=false;el.style.display='none';paused=false;if(typeof down!=='undefined')down.clear()}}
function mapClick(e){const cv=$q('frMapCv'),r=cv.getBoundingClientRect(),k=makeMap()._k,x=(e.clientX-r.left)/r.width*cv.width*k,z=(e.clientY-r.top)/r.height*cv.height*k;let best=null,bd=1e9;for(const p of F.POIS){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;best=p}}
 if(best&&bd<450){if(FR.wp===best){fastTravel(best);return}FR.wp=best;FR.route=null;toast('GPS SET: '+best.n,best.col);makeWp();drawFullMap()}}
/* simple floating stop icons (drawn by hand so no font glyph is needed) */
const ICONS={};
function iconTex(key,col){const k=key+col;if(ICONS[k])return ICONS[k];const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
 x.fillStyle='rgba(12,14,18,.82)';x.beginPath();x.arc(64,64,58,0,6.2832);x.fill();x.lineWidth=7;x.strokeStyle=col;x.stroke();x.fillStyle=x.strokeStyle='#fff';x.lineWidth=8;x.lineJoin=x.lineCap='round';
 const path=(pts,close)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));if(close)x.closePath()};
 if(key==='garage'){x.beginPath();x.arc(64,64,34,0,Math.PI*2);x.stroke();path([[46,72],[64,51],[82,72]]);x.stroke();x.fillStyle=x.strokeStyle;x.fillRect(52,78,24,5)}
 else if(key==='brand'){path([[64,26],[74,54],[104,56],[80,74],[89,102],[64,86],[39,102],[48,74],[24,56],[54,54]],1);x.fill()}
 else if(key==='office'){path([[40,102],[40,28]]);x.stroke();path([[40,30],[96,30],[84,48],[96,66],[40,66]],1);x.fill()}
 else if(key==='tune'){x.beginPath();x.arc(64,64,24,0,6.2832);x.stroke();for(let i=0;i<8;i++){const a=i*.7854;path([[64+Math.cos(a)*24,64+Math.sin(a)*24],[64+Math.cos(a)*36,64+Math.sin(a)*36]]);x.stroke()}}
 else if(key==='gas'){x.strokeRect(36,34,36,64);x.fillRect(42,42,24,14);path([[72,50],[92,56],[92,86]]);x.stroke()}
 else if(key==='job'){path([[28,52],[64,36],[100,52],[100,92],[64,108],[28,92]],1);x.stroke();path([[28,52],[64,68],[100,52]]);x.stroke();path([[64,68],[64,108]]);x.stroke()}
 else if(key==='meet'){for(const[a,b]of[[44,70],[84,70],[64,48]]){x.beginPath();x.arc(a,b,12,0,6.2832);x.fill()}path([[30,96],[98,96]]);x.stroke()}
 else if(key==='drift'){x.beginPath();x.moveTo(34,92);x.bezierCurveTo(34,40,96,96,96,40);x.stroke();path([[84,44],[96,38],[100,54]]);x.stroke()}
 else if(key==='view'){path([[24,98],[54,44],[72,70],[84,56],[104,98]],1);x.fill()}
 else if(key==='run'){for(let q=0;q<3;q++){path([[30+q*22,40],[52+q*22,64],[30+q*22,88]]);x.stroke()}}
 else if(key==='town'){path([[28,100],[28,62],[64,32],[100,62],[100,100]],1);x.stroke();x.strokeRect(54,70,20,30)}
 else{x.beginPath();x.arc(64,64,14,0,6.2832);x.fill()}
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return ICONS[k]=t}
/* a ring of flat low-poly clouds that drifts around the player */
function makeClouds(){const pos=[],n=[],ico=new THREE.IcosahedronGeometry(1,0),ip=ico.attributes.position.array;let a=7;const R=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296};
 for(let i=0;i<26;i++){const ang=R()*6.283,rad=700+R()*1700,cx=Math.cos(ang)*rad,cz=Math.sin(ang)*rad,cy=520+R()*260,pc=3+(R()*3|0),sc0=1.5+R()*1.7;
  for(let j=0;j<pc;j++){const ox=(j-pc/2)*46*sc0+(R()-.5)*18,oy=(R()-.5)*8,oz=(R()-.5)*30,sx=(34+R()*30)*sc0,sy=(12+R()*8)*sc0,sz=(22+R()*14)*sc0;
   for(let v=0;v<ip.length;v+=3)pos.push(cx+ox+ip[v]*sx,cy+oy+ip[v+1]*sy*(ip[v+1]<0?.35:1),cz+oz+ip[v+2]*sz)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x8a94a6,fog:false,transparent:true,opacity:.94}));m.frustumCulled=false;m.renderOrder=-1;return m}
/* ================= scene: sky, sun, water, beacons, parked cars ================= */
const hexs=h=>'#'+h.toString(16).padStart(6,'0');
function parkedBuilder(g){const ids=(P.FRD&&P.FRD.cars)||['merc'],list=g.userData.cars,sub=new THREE.Group();sub.userData.shared=true;
 const known=(P.CARS||[]).map(c=>c.id);const pool=ids.filter(i=>known.indexOf(i)>=0);const use=pool.length?pool:known;if(!use.length)return;
 for(const e of list){const id=use[(Math.floor(Math.abs(e[3]*7.31+e[0]*.37+e[1]*.19))%use.length+use.length)%use.length],idx=P.modelOf(id,0),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src)continue;
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
function freeLaunch(cfg){if(P.FRR&&P.FRR.gate&&P.FRR.gate(()=>freeLaunch(cfg)))return;ensureUI();cfg=Object.assign({mode:'free',track:0,laps:1e9,humans:[],ai:[]},cfg);const sel=P.SV().sel[0]||{id:'merc',alt:0};cfg.humans=[{id:sel.id,alt:sel.alt}];P.lastCfg=cfg;P.cleanupRace();
 F.build();const T=F.makeT(),sc=new THREE.Scene();FS=sc;FX=[];sc.fog=new THREE.Fog(0xcfe3f2,300,3100);
 const sky=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3a74c8');g.addColorStop(.42,'#9cc4ec');g.addColorStop(.5,'#cfe3f2');g.addColorStop(1,'#cfe3f2');x.fillStyle=g;x.fillRect(0,0,w,h)});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sky,side:THREE.BackSide,fog:false,depthWrite:false}));dome.rotation.x=0;dome.renderOrder=-20;sc.add(dome);const clouds=makeClouds();sc.add(clouds);
 sc.add(new THREE.HemisphereLight(0xdfe9f2,0x6a7560,.95));const sun=new THREE.DirectionalLight(0xfff0d4,.85);sun.position.set(-150,250,100);sc.add(sun);
 const disc=new THREE.Mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:0xfff2cc,fog:false}));sc.add(disc);
 const water=P.FRWater?P.FRWater.make(F):new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),new THREE.MeshStandardMaterial({color:0x2d7fae,roughness:.3,metalness:.1,transparent:true,opacity:.9}));if(!P.FRWater){water.rotation.x=-Math.PI/2;water.position.y=-.05}sc.add(water);sc.add(F.farMesh());if(typeof cam!=='undefined'){cam.far=7000;cam.updateProjectionMatrix()}
 if(P.shadeSetup)P.shadeSetup(sc);
 RACE={T,scene:sc,cars:[],state:'race',cd:0,t:0,conn:{},shake:0,laps:1e9,fin:[],endT:0,mode:'free',cfg,ending:0,doneT:0,shown:1,sess:{cr:0}};RACE.mmCls=new Uint8Array(T.N);
 let sp=cfg.spawn||F.SPAWN;if(cfg.at&&F.POIBY[cfg.at]){const p=F.POIBY[cfg.at];if(p.tp)sp={x:p.tp[0],z:p.tp[1],yaw:p.tp[2]};else{const q=F.nearRoadPt(p.x,p.z);if(q)sp={x:q.x,z:q.z,yaw:q.yaw}}}
 const c=mkPlayer(T,sel,sp);RACE.cars.push(c);sc.add(c.m.g);sc.add(c.m.sh);
 const h=$q('huds');h.innerHTML='';const d=document.createElement('div');d.className='hud';d.id='h0';h.appendChild(d);
 const world=F.World(sc,T,{R:cfg.R||4});world.cars=parkedBuilder;world.fill(sp.x,sp.z,2);
 FR={rc:RACE,sc,T,W:world,sky:dome,clouds,sun,disc,water,t:0,safe:{x:sp.x,z:sp.z,yaw:sp.yaw},safeT:0,wet:0,toast:0,beacons:[],wp:cfg.wp?F.POIBY[cfg.wp]:null,near:null,busy:false,trap:{},drift:{cur:0,idle:0,combo:0,in:false},meet:{t:0,cool:0},view:{},job:null,air:{max:0,on:false},mapOpen:false,fuel:0,baseCs:null,sel:sel.id+'|'+(sel.alt?1:0)};
 for(const p of F.POIS){if(p.key==='trap')continue;const g=new THREE.Group(),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:iconTex(p.key,p.col),transparent:true,depthWrite:false,fog:false}));sp.scale.set(5.2,5.2,1);sp.position.y=p.key==='garage'?9:11;sp.renderOrder=9;
  g.add(sp);g.position.set(p.x,F.Hf(p.x,p.z),p.z);g.userData={dm:sp,m:{}};g.visible=false;sc.add(g);FR.beacons.push([p,g])}
 if(P.setupDust)P.setupDust(RACE);makeWp();
 paused=false;document.body.classList.add('fr');show('game');$q('res')&&$q('res').classList.remove('on');$q('cd').textContent='';$q('fade').style.opacity=0;if(typeof rs==='function')rs();
 if(typeof down!=='undefined')down.clear();setTimeout(()=>toast('FREE ROAM',F.POIBY.garage.col),400)}
P.freeLaunch=freeLaunch;P.frToast=(t,c)=>toast(t,c);P.frState=()=>FR;P.frFast=p=>fastTravel(p);
const L0=P.launch;P.launch=cfg=>{if(cfg&&cfg.mode==='free')return freeLaunch(cfg);document.body.classList.remove('fr');return L0(cfg)};
{const cr=P.cleanupRace;P.cleanupRace=function(){if(FR){try{FR.W.dispose()}catch(e){}if(typeof cam!=='undefined'){cam.far=2500;cam.updateProjectionMatrix()}}FR=null;document.body.classList.remove('fr');if($q('frMap'))$q('frMap').style.display='none';return cr.apply(this,arguments)}}
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
const JOBDEST=['brand','office','tune','gas','meet','drift','view','borgo','rocco','cala','faro','garage'];
function takeJob(){if(FR.job){toast('FINISH YOUR CURRENT JOB FIRST','#4dffb0');return}const c=RACE.cars[0];const opts=JOBDEST.map(id=>F.POIBY[id]).filter(p=>p&&Math.hypot(p.x-c.x,p.z-c.z)>900);const to=opts[(Math.random()*opts.length)|0]||F.POIBY.view,dist=Math.hypot(to.x-c.x,to.z-c.z);
 FR.job={to,t:dist/20+30,pay:Math.round(260+dist*.2),dist};FR.wp=to;makeWp();toast('JOB ACCEPTED: DELIVER TO '+to.n,'#4dffb0')}
function gasUp(){const c=RACE.cars[0],cost=150;if(FR.fuel>0){toast('PREMIUM FUEL ALREADY IN THE TANK','#ff6a4d');return}if(P.spend&&!P.spend(cost)){toast('NOT ENOUGH CREDITS ('+fmt(cost)+')','#ff6a4d');return}
 FR.fuel=600;FR.baseCs=c.cs;c.cs=Object.assign({},c.cs,{acc:c.cs.acc*1.07,top:c.cs.top*1.025});toast('PREMIUM FUEL: +7% PICKUP, +2.5% TOP SPEED FOR 10 MIN','#ff6a4d');
 if(P.puff)for(let i=0;i<10;i++)P.puff(c.x,c.y+.5,c.z,(Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3,[.9,.9,.92],1.2,.9,.4,0)}
function fuelEnd(){const c=RACE.cars[0];if(FR.baseCs){c.cs=FR.baseCs;FR.baseCs=null}FR.fuel=0}
const ACT={garage:()=>openShowFrom('garage',true),brand:()=>openShowFrom('brand',false),tune:()=>openShowFrom('garage',false),office:openOffice,job:takeJob,gas:gasUp};P.frAct=k=>ACT[k]&&ACT[k]();
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
 FR.t+=dt;const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);FR.W.update(c.x,c.z,fx,fz,5);if(P.frLifeTick){if(!FR.lf&&P.frLifeInit)FR.lf=P.frLifeInit(F,FR.sc);try{P.frLifeTick(FR.lf,FR.sc,F,c,dt)}catch(e){if(!FR.lfErr){FR.lfErr=1;console.warn('life',e)}}}if(P.frAnimalsTick){if(!FR.an&&P.frAnimalsInit)FR.an=P.frAnimalsInit(F);try{P.frAnimalsTick(FR.an,FR.sc,F,c,dt)}catch(e){if(!FR.anErr){FR.anErr=1;console.warn('herds',e)}}}
 FR.sky.position.set(c.x,0,c.z);FR.clouds.position.set(c.x,0,c.z);FR.clouds.rotation.y+=dt*.004;const sd=FR.sun.userData.d0||FR.sun.position.clone().normalize();FR.disc.position.set(c.x+sd.x*1300,sd.y*1300,c.z+sd.z*1300);FR.water.position.x=c.x;FR.water.position.z=c.z;if(FR.water.material.uniforms)FR.water.material.uniforms.uTime.value=FR.t;
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
 {const dp=F.POIBY.drift||{x:-1e9,z:-1e9,r:1,col:'#b04dff'},D=FR.drift,inz=Math.hypot(c.x-dp.x,c.z-dp.z)<dp.r;
  if(inz&&c.sp>8){const slip=Math.abs(wrap(Math.atan2(c.vx,c.vz)-c.yaw));if(slip>.28&&slip<1.9&&c.onRoad===0||slip>.28&&slip<1.9){D.cur+=c.sp*slip*dt*(24+D.combo*2);D.idle=0;D.combo=Math.min(10,D.combo+dt*.6);D.in=true}else D.idle+=dt}else if(D.cur>0)D.idle+=dt;
  if(D.cur>0&&(D.idle>1.7||(!inz&&D.cur>0))){const win=Math.round(D.cur*.16);if(win>=20){pay(win,'DRIFT SCORE '+Math.round(D.cur),dp.col);const s=SVfr();if(D.cur>s.drift){s.drift=Math.round(D.cur);if(s.drift>800)toast('NEW DRIFT RECORD','#b04dff')}}D.cur=0;D.combo=0;D.idle=0}
  const el=$q('frDrift');if(D.cur>0){el.style.display='block';el.innerHTML='<b style="color:#e6d0ff">'+Math.round(D.cur)+'</b><span>DRIFT x'+Math.max(1,Math.round(D.combo))+'</span>'}else el.style.display='none'}
 for(const p of F.POIS){if(p.key!=='trap')continue;const d=Math.hypot(p.x-c.x,p.z-c.z),t=FR.trap[p.id]||(FR.trap[p.id]={max:0,in:false,cool:0});t.cool-=dt;
  if(d<p.r+4){t.in=true;t.max=Math.max(t.max,kph)}else if(t.in){t.in=false;const v=Math.round(t.max);t.max=0;if(t.cool<=0&&v>=110){const s=SVfr(),win=Math.round((v-95)*7);pay(win,'SPEED TRAP '+v+' KM/H',p.col);t.cool=25;if(v>s.trap){s.trap=v;toast('PERSONAL BEST '+v+' KM/H','#7dff4d')}}else if(t.cool<=0&&v>20)toast('SPEED TRAP: '+v+' KM/H','#7dff4d')}}
 {const mp=F.POIBY.meet||{x:-1e9,z:-1e9,r:1,col:'#ffa24d'},M=FR.meet,inz=Math.hypot(c.x-mp.x,c.z-mp.z)<mp.r;M.cool-=dt;if(inz&&c.sp<2.2&&M.cool<=0){M.t+=dt;if(M.t>6){M.t=0;M.cool=240;pay(260,'CAR MEET: YOU TURNED HEADS',mp.col)}}else if(!inz||c.sp>=2.2)M.t=Math.max(0,M.t-dt*2)}
 {const vp=F.POIBY.view||{x:-1e9,z:-1e9,r:1,col:'#fff'};if(Math.hypot(c.x-vp.x,c.z-vp.z)<vp.r&&c.sp<3){FR.view.t=(FR.view.t||0)+dt;if(FR.view.t>1.5&&!FR.view.got){FR.view.got=1;const s=SVfr();if(!s.view){s.view=1;pay(700,'SUMMIT REACHED',vp.col)}else pay(60,'SUMMIT VIEW',vp.col)}}else{FR.view.t=0;if(Math.hypot(c.x-vp.x,c.z-vp.z)>vp.r+30)FR.view.got=0}}
 {const ap=F.POIBY.run,A=FR.air,R=F.RUN;let onr=false;if(ap&&R.on){const ex=R.x1-R.x0,ez=R.z1-R.z0,L2=ex*ex+ez*ez||1,t=((c.x-R.x0)*ex+(c.z-R.z0)*ez)/L2;onr=t>0&&t<1&&Math.hypot(c.x-(R.x0+ex*t),c.z-(R.z0+ez*t))<R.hw+3}
  if(onr){A.max=Math.max(A.max,kph);A.on=true}else if(A.on){A.on=false;const v=Math.round(A.max);A.max=0;const s=SVfr();if(v>150){const win=Math.round((v-140)*5);pay(win,'LUNGOMARE RUN '+v+' KM/H',ap.col);if(v>s.top){s.top=v;toast('TOP SPEED RECORD '+v+' KM/H','#ff9a3c')}}}}
 /* ---- job ---- */
 if(FR.job){const j=FR.job;j.t-=dt;if(Math.hypot(c.x-j.to.x,c.z-j.to.z)<j.to.r+10&&c.sp<20){const bonus=Math.round(Math.max(0,j.t)*3);pay(j.pay+bonus,'DELIVERY COMPLETE',j.to.col);SVfr().jobs++;FR.job=null;FR.wp=null;makeWp()}else if(j.t<=0){toast('JOB FAILED: OUT OF TIME','#ff5a4d');FR.job=null;FR.wp=null;makeWp()}}
 FR.kph=kph}
const st0=step;step=dt=>{st0(dt);if(RACE&&RACE.mode==='free'&&FR&&FR.rc===RACE&&scr==='game'&&!FR.mapOpen)frTick(dt)};
/* ================= HUD (called from the hudUpdate wrapper) ================= */
/* ================= fast travel ================= */
function fastTravel(p){if(!FR||!RACE)return;toggleMap(false);const c=RACE.cars[0];
 fade(()=>{let x,z,yaw,y=null;if(p.id==='garage'&&F.SPAWN){x=F.SPAWN.x;z=F.SPAWN.z;yaw=F.SPAWN.yaw}else if(p.tp){[x,z,yaw,y]=p.tp}else{const q=F.nearRoadPt(p.x,p.z);if(!q)return;x=q.x;z=q.z;yaw=q.yaw;if(q.r&&q.r.y)y=q.r.y[q.i]}
  if(y==null)y=F.Hf(x,z);const T=RACE.T;let h=y;try{h=T.surf(x,z,y+2).h}catch(e){}
  c.x=x;c.z=z;c.y=h+.9;c.vx=c.vy=c.vz=0;c.yaw=c.cy=yaw;c.pitch=c.roll=c.wpt=c.wrl=0;c.camY=c.y+1;c._px=c._pz=null;
  FR.W.fill(x,z,2);FR.safe={x,z,yaw};if(FR.wp===p){FR.wp=null;makeWp()}FR.route=null;toast('FAST TRAVEL: '+p.n,p.col)},null,700)}
/* ================= GPS route over the road network (Dijkstra on the road points) ================= */
let GRAPH=null;
function graph(){if(GRAPH&&GRAPH.src===F.ROADS&&GRAPH.n0===F.ROADS.length)return GRAPH;const R=F.ROADS,base=[];let n=0;for(const r of R){base.push(n);n+=r.n}
 const X=new Float32Array(n),Z=new Float32Array(n),RI=new Int32Array(n),adj=Array.from({length:n},()=>[]);let k=0;
 R.forEach((r,ri)=>{for(let i=0;i<r.n;i++){X[k]=r.x[i];Z[k]=r.z[i];RI[k]=ri;if(i){const d=Math.hypot(r.x[i]-r.x[i-1],r.z[i]-r.z[i-1]);adj[k].push(k-1,d);adj[k-1].push(k,d)}k++}});
 const H=new Map(),key=(x,z)=>Math.floor(x/16)*100000+Math.floor(z/16);for(let i=0;i<n;i++){const kk=key(X[i],Z[i]);let l=H.get(kk);if(!l)H.set(kk,l=[]);l.push(i)}
 for(let i=0;i<n;i++){const r=R[RI[i]],end=i===base[RI[i]]||i===base[RI[i]]+r.n-1,lim=end?18:7,cx=Math.floor(X[i]/16),cz=Math.floor(Z[i]/16),best=new Map();
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=H.get((cx+a)*100000+cz+b);if(!l)continue;for(const j of l){if(RI[j]===RI[i])continue;const d=Math.hypot(X[j]-X[i],Z[j]-Z[i]);if(d<lim){const o=best.get(RI[j]);if(!o||d<o[1])best.set(RI[j],[j,d])}}}
  for(const[j,d]of best.values()){adj[i].push(j,d+1);adj[j].push(i,d+1)}}
 return GRAPH={src:R,n0:R.length,X,Z,adj,H,n}}
function nearNode(G,x,z){let b=-1,bd=1e18;const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let rr=1;rr<40&&b<0;rr*=2)for(let a=-rr;a<=rr;a++)for(let c=-rr;c<=rr;c++){const l=G.H.get((cx+a)*100000+cz+c);if(!l)continue;for(const j of l){const d=(G.X[j]-x)**2+(G.Z[j]-z)**2;if(d<bd){bd=d;b=j}}}return b}
function route(x0,z0,x1,z1){const G=graph(),s=nearNode(G,x0,z0),t=nearNode(G,x1,z1);if(s<0||t<0)return null;const D=new Float64Array(G.n).fill(Infinity),pr=new Int32Array(G.n).fill(-1),hp=[];D[s]=0;hp.push([0,s]);
 const push=e=>{hp.push(e);let i=hp.length-1;while(i){const p=(i-1)>>1;if(hp[p][0]<=hp[i][0])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p}},pop=()=>{const top=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&hp[a][0]<hp[m][0])m=a;if(b<hp.length&&hp[b][0]<hp[m][0])m=b;if(m===i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m}}return top};
 let it=0;while(hp.length&&it++<400000){const[d,u]=pop();if(d>D[u])continue;if(u===t)break;const A=G.adj[u];for(let q=0;q<A.length;q+=2){const v=A[q],nd=d+A[q+1];if(nd<D[v]){D[v]=nd;pr[v]=u;push([nd,v])}}}
 if(!isFinite(D[t]))return null;const out=[];for(let u=t;u>=0;u=pr[u])out.push([G.X[u],G.Z[u]]);out.reverse();out.push([x1,z1]);return out}
function updRoute(c){if(!FR.wp){FR.route=null;return}FR.rT=(FR.rT||0)-1/60;let off=0;if(FR.route){let bd=1e9;for(let i=0;i<FR.route.length;i+=2){const d=Math.hypot(FR.route[i][0]-c.x,FR.route[i][1]-c.z);if(d<bd)bd=d}off=bd}
 if(!FR.route||FR.routeFor!==FR.wp||(off>45&&FR.rT<=0)){FR.rT=1.2;FR.routeFor=FR.wp;try{FR.route=route(c.x,c.z,FR.wp.x,FR.wp.z)}catch(e){FR.route=null}}}
/* the floating navigation arrow over the car: points along the route ~35 m ahead */
function navArrow(c){if(!FR.wp){if(FR.nav)FR.nav.visible=false;return}if(!FR.nav){const sh=new THREE.Shape();sh.moveTo(0,1.25);sh.lineTo(.95,-.15);sh.lineTo(.38,-.15);sh.lineTo(.38,-1);sh.lineTo(-.38,-1);sh.lineTo(-.38,-.15);sh.lineTo(-.95,-.15);sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:1});g.rotateX(-Math.PI/2);g.translate(0,0,0);
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x9cc4ec,emissive:0x2f6496,emissiveIntensity:.85,metalness:.35,roughness:.3,flatShading:true,fog:false}));const e=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x0b1520,side:THREE.BackSide,fog:false}));e.scale.set(1.09,1.25,1.09);m.add(e);m.rotation.order='YXZ';m.renderOrder=8;FR.sc.add(m);FR.nav=m}
 let tx=FR.wp.x,tz=FR.wp.z;if(FR.route){let bi=0,bd=1e9;for(let i=0;i<FR.route.length;i++){const d=Math.hypot(FR.route[i][0]-c.x,FR.route[i][1]-c.z);if(d<bd){bd=d;bi=i}}let acc=0,i=bi;while(i<FR.route.length-1&&acc<35){acc+=Math.hypot(FR.route[i+1][0]-FR.route[i][0],FR.route[i+1][1]-FR.route[i][1]);i++}tx=FR.route[i][0];tz=FR.route[i][1]}
 const a=Math.atan2(tx-c.x,tz-c.z),t=performance.now()/1000,m=FR.nav;m.visible=Math.hypot(FR.wp.x-c.x,FR.wp.z-c.z)>25;m.position.set(c.x+Math.sin(c.yaw)*1.4,c.y+2.9+Math.sin(t*2.6)*.1,c.z+Math.cos(c.yaw)*1.4);m.rotation.set(.42,a+Math.PI,0);m.scale.setScalar(.85)}
/* ================= minimap: round, rotating, roads drawn crisp, GPS route, compass ring, district name ================= */
function district(c){let best=null,bd=1e9;for(const p of F.POIS){if(p.key!=='town')continue;const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<bd){bd=d;best=p}}return best&&bd<1400?best.n:(F.rock?'ROCKPORT':'RIVIERA')}
function drawMini(c){const cv=$q('mm');if(cv.width!==460){cv.width=cv.height=460}const m=cv.getContext('2d'),S_=460,C2=S_/2,RAD=C2-20,mp=makeMap(),k=mp._k,th=-Math.PI/2-Math.atan2(Math.cos(c.yaw),Math.sin(c.yaw));
 const spd=Math.hypot(c.vx||0,c.vz||0);FR.mmR=(FR.mmR||260)+((230+Math.min(spd,70)*5)-(FR.mmR||260))*.04;const R=FR.mmR,sc=RAD/R;
 m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,S_,S_);
 m.save();m.beginPath();m.arc(C2,C2,RAD,0,6.2832);m.clip();m.fillStyle='#1d4e6b';m.fillRect(0,0,S_,S_);m.translate(C2,C2);m.rotate(th);m.imageSmoothingEnabled=true;
 {const q=1.5;m.drawImage(mp,(c.x-R*q)/k,(c.z-R*q)/k,2*R*q/k,2*R*q/k,-RAD*q,-RAD*q,2*RAD*q,2*RAD*q)}
 m.fillStyle='rgba(8,12,18,.28)';m.fillRect(-RAD*1.6,-RAD*1.6,RAD*3.2,RAD*3.2);
 /* roads near the car, crisp: dark casing then light surface */
 const vis=[],lim=R*1.5;for(const r of F.ROADS){if(!r.bb){let a=1e9,b=-1e9,cc=1e9,d=-1e9;for(let i=0;i<r.n;i++){a=Math.min(a,r.x[i]);b=Math.max(b,r.x[i]);cc=Math.min(cc,r.z[i]);d=Math.max(d,r.z[i])}r.bb=[a,b,cc,d]}if(r.bb[1]<c.x-lim||r.bb[0]>c.x+lim||r.bb[3]<c.z-lim||r.bb[2]>c.z+lim)continue;vis.push(r)}
 m.lineCap='round';m.lineJoin='round';
 for(const pass of[0,1])for(const r of vis){m.beginPath();for(let i=0;i<r.n;i++){const x=(r.x[i]-c.x)*sc,z=(r.z[i]-c.z)*sc;i?m.lineTo(x,z):m.moveTo(x,z)}const w=Math.max(2.4,(r.hw||5)*2*sc);m.strokeStyle=pass?(r.hw>=7?'#f3e3b0':'#e7ebef'):'#0d1117';m.lineWidth=pass?w:w+4;m.stroke()}
 /* GPS route: glowing ribbon */
 if(FR.route&&FR.route.length>1){m.beginPath();FR.route.forEach((p,i)=>{const x=(p[0]-c.x)*sc,z=(p[1]-c.z)*sc;i?m.lineTo(x,z):m.moveTo(x,z)});m.strokeStyle='rgba(79,126,171,.45)';m.lineWidth=15;m.stroke();m.strokeStyle='#8fb4d8';m.lineWidth=6;m.stroke();m.strokeStyle='#f4f8fc';m.lineWidth=1.8;m.stroke()}
 m.restore();
 const tr=(x,z)=>{const dx=(x-c.x)*sc,dz=(z-c.z)*sc,co=Math.cos(th),si=Math.sin(th);return[C2+dx*co-dz*si,C2+dx*si+dz*co]};
 /* inner vignette */
 {const g=m.createRadialGradient(C2,C2,RAD*.62,C2,C2,RAD);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');m.fillStyle=g;m.beginPath();m.arc(C2,C2,RAD,0,6.2832);m.fill()}
 const edge=(p,col,r)=>{let[x,y]=tr(p.x,p.z);const lim2=RAD-12,dx=x-C2,dy=y-C2,d=Math.hypot(dx,dy);if(d>lim2){x=C2+dx/d*lim2;y=C2+dy/d*lim2}poiIcon(m,{col:col||p.col,ic:p.ic},x,y,r)};
 for(const p of F.POIS){if(p.key==='trap')continue;const[x,y]=tr(p.x,p.z);if(Math.hypot(x-C2,y-C2)<RAD-10)poiIcon(m,p,x,y,13)}
 if(FR.wp)edge(FR.wp,'#8fb4d8',15);
 /* bezel: glossy dark metal ring (lit top, dark bottom), thin white highlight, ticks, N */
 {const g=m.createLinearGradient(0,C2-RAD-18,0,C2+RAD+18);g.addColorStop(0,'#5a6068');g.addColorStop(.48,'#2c3035');g.addColorStop(.52,'#1c1f23');g.addColorStop(1,'#2a2e33');m.lineWidth=18;m.strokeStyle=g;m.beginPath();m.arc(C2,C2,RAD+9,0,6.2832);m.stroke()}
 m.lineWidth=1.5;m.strokeStyle='rgba(255,255,255,.45)';m.beginPath();m.arc(C2,C2,RAD+17.5,Math.PI*1.08,Math.PI*1.92);m.stroke();m.strokeStyle='rgba(255,255,255,.2)';m.beginPath();m.arc(C2,C2,RAD,0,6.2832);m.stroke();
 for(let i=0;i<36;i++){const a=th+i*Math.PI/18,l=i%9===0?8:4;m.strokeStyle=i%9===0?'rgba(255,255,255,.85)':'rgba(255,255,255,.35)';m.lineWidth=i%9===0?2.2:1.3;m.beginPath();m.moveTo(C2+Math.cos(a)*(RAD+3),C2+Math.sin(a)*(RAD+3));m.lineTo(C2+Math.cos(a)*(RAD+3+l),C2+Math.sin(a)*(RAD+3+l));m.stroke()}
 {const a=th-Math.PI/2,x=C2+Math.cos(a)*(RAD+9),y=C2+Math.sin(a)*(RAD+9),g=m.createLinearGradient(0,y-12,0,y+12);g.addColorStop(0,'#ffffff');g.addColorStop(.48,'#e9ecef');g.addColorStop(.52,'#d3d8dc');g.addColorStop(1,'#e6e9ec');m.fillStyle=g;m.beginPath();m.arc(x,y,12.5,0,6.2832);m.fill();m.fillStyle='#15181c';m.font='600 14px Inter,Segoe UI,sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText('N',x,y+1)}
 /* district name */
 {const t=district(c);m.font='500 16px Inter,Segoe UI,sans-serif';const w=m.measureText(t).width+30,y0=S_-78,g=m.createLinearGradient(0,y0,0,y0+28);g.addColorStop(0,'rgba(70,76,84,.85)');g.addColorStop(.5,'rgba(30,33,37,.9)');g.addColorStop(1,'rgba(14,15,18,.92)');m.fillStyle=g;m.beginPath();m.roundRect?m.roundRect(C2-w/2,y0,w,28,8):m.rect(C2-w/2,y0,w,28);m.fill();m.strokeStyle='rgba(255,255,255,.22)';m.lineWidth=1;m.stroke();m.fillStyle='#f2f4f6';m.textAlign='center';m.textBaseline='middle';m.fillText(t.split('').join(String.fromCharCode(8202)),C2,y0+14.5)}
 /* the car */
 m.save();m.translate(C2,C2);m.shadowColor='#8fb4d8';m.shadowBlur=14;m.fillStyle='#ffffff';m.strokeStyle='#0b0f14';m.lineWidth=3;m.beginPath();m.moveTo(0,-17);m.lineTo(12,13);m.lineTo(0,6);m.lineTo(-12,13);m.closePath();m.fill();m.shadowBlur=0;m.stroke();m.fillStyle='#8fb4d8';m.beginPath();m.moveTo(0,-9);m.lineTo(5,6);m.lineTo(0,3);m.lineTo(-5,6);m.closePath();m.fill();m.restore()}
P.frHud=()=>{if(!(FR&&RACE&&RACE.mode==='free'))return;const c=RACE.cars[0];ensureUI();
 $q('frMoney').textContent=fmt(P.SV().cr);try{updRoute(c);navArrow(c)}catch(e){}drawMini(c);
 const pr=$q('frPrompt'),n=FR.near;if(n&&ACT[n.key]&&!FR.busy&&!paused){pr.style.display='block';pr.style.setProperty('--c',n.col);const slow=c.sp>13;pr.innerHTML='<kbd>ENTER</kbd>'+(slow?'<span style="opacity:.6">SLOW DOWN &middot; </span>':'')+LABEL[n.key];pr.style.opacity=slow?.75:1}else pr.style.display='none';
 const o=$q('frObj');if(FR.job){const j=FR.job,left=Math.max(0,j.t),d=Math.round(Math.hypot(c.x-j.to.x,c.z-j.to.z));o.style.display='block';o.innerHTML='<b>DELIVERY</b><br>'+j.to.n+' &middot; '+(d>999?(d/1000).toFixed(1)+' km':d+' m')+'<br>'+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')+' &middot; pays '+fmt(j.pay)}else if(FR.fuel>0){o.style.display='block';o.style.borderLeftColor='#ff6a4d';o.innerHTML='<b>PREMIUM FUEL</b><br>'+Math.floor(FR.fuel/60)+':'+String(Math.floor(FR.fuel%60)).padStart(2,'0')+' left'}else o.style.display='none';
 if(FR.job)o.style.borderLeftColor='#4dffb0';
 const g=$q('frGps');if(FR.wp){let d=Math.hypot(c.x-FR.wp.x,c.z-FR.wp.z);if(FR.route&&FR.route.length>1){let bi=0,bd=1e9;for(let i=0;i<FR.route.length;i++){const q=Math.hypot(FR.route[i][0]-c.x,FR.route[i][1]-c.z);if(q<bd){bd=q;bi=i}}d=bd;for(let i=bi;i<FR.route.length-1;i++)d+=Math.hypot(FR.route[i+1][0]-FR.route[i][0],FR.route[i+1][1]-FR.route[i][1])}
  const ang=Math.atan2(FR.wp.x-c.x,FR.wp.z-c.z)-c.yaw;g.style.display='block';g.innerHTML='<b><i style="display:inline-block;transform:rotate('+(-ang*57.2958)+'deg)"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2 L21 21 L12 16 L3 21 Z" fill="#8fb4d8" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg></i>'+FR.wp.n+'</b><small>'+(d>999?(d/1000).toFixed(1)+' KM':Math.round(d)+' M')+' &middot; GPS</small>'}else g.style.display='none';
 const hudOn=scr==='game'&&!paused||FR.mapOpen;$q('frHud').style.display=scr==='game'?'block':'none';
 const bl=$q('frBlur');bl.style.display=scr==='game'?'block':'none';const v=clampf((c.sp-12)/55,0,1);bl.style.opacity=(.35+.65*v).toFixed(2);bl.style.backdropFilter=bl.style.webkitBackdropFilter='blur('+(1.5+v*1.6).toFixed(1)+'px)'};
/* hide the free-roam overlay whenever the game screen is not showing */
setInterval(()=>{const h=$q('frHud'),b=$q('frBlur');if(!h)return;const on=FR&&RACE&&RACE.mode==='free'&&scr==='game';if(!on){h.style.display='none';b.style.display='none'}},250);
/* home garage studio dressing: called by the studio each frame */
let HOME=null,HOME_ENV=null;
function homeGarage(S){if(HOME)return HOME;const g=new THREE.Group(),PI=Math.PI;
  const rnd=(()=>{let q=11;return()=>{q=(q*16807)%2147483647;return q/2147483647}})();
  const tex=(w,h,fn,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=4;return t};
  const Sm=(o)=>new THREE.MeshStandardMaterial(Object.assign({side:THREE.DoubleSide,roughness:.8,metalness:.1},o));
  const glow=(r,gg,b)=>new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(r,gg,b)});
  const M=(c,r,m)=>Sm({color:c,roughness:r==null?.7:r,metalness:m==null?.2:m});
  const add=(m,x,y,z,ry,rx,rz)=>{m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m};
  const B=(w,h,d,x,y,z,mat,ry)=>add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z,ry);
  const cyl=(rt,rb,h,x,y,z,mat,rx,rz,seg)=>add(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),mat),x,y,z,0,rx,rz);
  const plane=(w,h,mat,x,y,z,ry,rx)=>add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat),x,y,z,ry,rx);
  const X0=-7,X1=7,Z0=-24,Z1=8,H=8.4,CX=0,CZ=(Z0+Z1)/2,WX=X1-X0,WZ=Z1-Z0;
  const STEEL=M(0x1a1c20,.55,.6),RUST=M(0x3a2a20,.8,.4),BLK=M(0x0e0f11,.9,0),METAL=M(0x6d7178,.45,.7);
  /* ---- stained concrete ---- */
  const concrete=(base,stain)=>tex(512,512,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=rnd()*60|0;x.fillStyle='rgba('+v+','+v+','+v+','+(.05+rnd()*.12)+')';x.fillRect(rnd()*w,rnd()*h,1+rnd()*3,1+rnd()*3)}
   for(let i=0;i<22;i++){const px=rnd()*w,py=rnd()*h*.5,r=20+rnd()*70;const gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(10,9,8,'+stain+')');gr.addColorStop(1,'rgba(10,9,8,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2)}
   for(let i=0;i<40;i++){const px=rnd()*w;x.fillStyle='rgba(15,12,10,'+(.1+rnd()*.25)+')';x.fillRect(px,rnd()*h*.5,1+rnd()*3,40+rnd()*220)}
   x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=2;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke()},[1,1]);
  const wallT=concrete('#6b6a66',.5),floorT=tex(512,512,(x,w,h)=>{x.fillStyle='#4a4b4f';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){const v=40+rnd()*50|0;x.fillStyle='rgba('+v+','+v+','+v+','+(.08+rnd()*.14)+')';x.fillRect(rnd()*w,rnd()*h,1+rnd()*3,1+rnd()*3)}
   for(let i=0;i<16;i++){const px=rnd()*w,py=rnd()*h,r=30+rnd()*70;const gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(8,8,10,.5)');gr.addColorStop(1,'rgba(8,8,10,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2)}
   x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=3;x.strokeRect(0,0,w,h);x.beginPath();x.moveTo(0,h/2);x.lineTo(w,h/2);x.moveTo(w/2,0);x.lineTo(w/2,h);x.stroke();for(let i=0;i<4;i++){x.lineWidth=1.5;x.beginPath();let px=rnd()*w,py=rnd()*h;x.moveTo(px,py);for(let k=0;k<6;k++){px+=(rnd()-.5)*50;py+=rnd()*40;x.lineTo(px,py)}x.stroke()}},[WX/6,WZ/6]);
  /* shell: floor (glossy, slightly see-through so the mirrored car shows), black sub-floor, walls, roof */
  plane(WX,WZ,new THREE.MeshBasicMaterial({color:0x050506}),CX,-3,CZ,0,-PI/2);
  add(new THREE.Mesh(new THREE.PlaneGeometry(WX,WZ),Sm({map:floorT,color:0x0c0d0f,roughness:.65,metalness:0,envMapIntensity:.15,transparent:true,opacity:.5})),CX,.004,CZ,0,-PI/2).receiveShadow=true;
  const wm=(w,h,rep)=>{const t=wallT.clone();t.needsUpdate=true;t.repeat.set(rep[0],rep[1]);return Sm({map:t,color:0x242321,roughness:.95,metalness:0})};
  plane(WX,H,wm(0,0,[WX/6,H/6]),CX,H/2,Z0,0);plane(WX,H,wm(0,0,[WX/6,H/6]),CX,H/2,Z1,PI);plane(WZ,H,wm(0,0,[WZ/6,H/6]),X0,H/2,CZ,PI/2);plane(WZ,H,wm(0,0,[WZ/6,H/6]),X1,H/2,CZ,-PI/2);
  plane(WX,WZ,M(0x121316,.7,.3),CX,H,CZ,0,PI/2);
  /* wall pilasters, base plinth, window bands */
  for(let z=Z0+3;z<Z1;z+=6){B(.5,H,.6,X0+.25,H/2,z,M(0x5a5955,.95,0));B(.5,H,.6,X1-.25,H/2,z,M(0x5a5955,.95,0))}
  for(let x=X0+3;x<X1;x+=6)B(.6,H,.5,x,H/2,Z0+.25,M(0x5a5955,.95,0));
  B(.3,.5,WZ,X0+.15,.25,CZ,M(0x2c2c2e,.9,0));B(.3,.5,WZ,X1-.15,.25,CZ,M(0x2c2c2e,.9,0));
  for(const x of[-4.5,-1.5,1.5,4.5])plane(2.2,.9,glow(.3,.36,.42),x,6.9,Z0+.02,0);
  /* ---- roof steel: cross trusses, purlins, big ducts, conduit ---- */
  for(let z=Z0+2;z<Z1;z+=4){B(WX,.5,.22,CX,H-.4,z,STEEL);B(WX,.12,.5,CX,H-.7,z,STEEL);for(let x=X0+.8;x<X1;x+=1.6)B(.1,.55,.1,x,H-.45,z,STEEL,.6)}
  for(const x of[-4.5,-1.5,1.5,4.5])B(.2,.28,WZ,x,H-.3,CZ,STEEL);
  cyl(.7,.7,WZ-2,X0+1.4,H-1.6,CZ,M(0x55565a,.5,.6),PI/2,0,18);for(let z=Z0+4;z<Z1;z+=6)B(.14,.5,.9,X0+1.4,H-1.6,z,STEEL);
  cyl(.45,.45,WZ-4,X1-1.3,H-1.5,CZ,M(0x4a4d52,.5,.6),PI/2,0,16);
  for(let i=0;i<5;i++)cyl(.1,.1,WZ,X0+.65,1.2+i*.28+3.6,CZ,i%2?RUST:METAL,PI/2,0,8);
  for(let i=0;i<4;i++)cyl(.07,.07,WZ,X1-.5,5.0+i*.25,CZ,i%2?METAL:RUST,PI/2,0,8);
  /* steel columns */
  for(const z of[-3,-9,-15,-21])for(const x of[-5.4,5.4]){B(.45,H,.45,x,H/2,z,STEEL);B(.7,.15,.7,x,.08,z,STEEL);B(.7,.2,.7,x,H-1,z,STEEL)}
  /* ---- fluorescent strips hung from the roof (bloom sources) ---- */
  const tubeM=glow(2.2,2.3,2.5);const strips=[];for(let z=Z1-3;z>Z0+3;z-=4.5)for(const x of[-2.6,2.6]){strips.push([x,z]);B(.14,.07,2.4,x,H-1.4,z,tubeM);B(.02,1.2,.02,x-.7,H-.8,z,BLK);B(.02,1.2,.02,x+.7,H-.8,z,BLK)}
  /* ---- mezzanine catwalk across the far end ---- */
  {const y=3.0,z0=Z0+.6,z1=Z0+6.4;B(WX-.6,.18,z1-z0,CX,y,(z0+z1)/2,M(0x3a3c40,.6,.6));for(const x of[-6,-2,2,6])for(const z of[z0+.4,z1-.4])B(.22,y,.22,x,y/2,z,STEEL);
   B(WX-.6,.06,.06,CX,y+1.05,z1,METAL);B(WX-.6,.06,.06,CX,y+.55,z1,METAL);for(let x=X0+.5;x<X1;x+=1.2)B(.05,1.0,.05,x,y+.55,z1,METAL);
   for(let i=0;i<9;i++)B(1.6,.1,.3,4.6,.25+i*.31,z1+.4+i*.27-1.0,M(0x3a3c40,.6,.6))}
  /* ---- shipping containers (corrugated, rusty, stencilled) ---- */
  const sheet=(base,rust,label)=>tex(256,256,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<w;i+=16){const gr=x.createLinearGradient(i,0,i+16,0);gr.addColorStop(0,'rgba(255,255,255,.2)');gr.addColorStop(.5,'rgba(0,0,0,.28)');gr.addColorStop(1,'rgba(255,255,255,.1)');x.fillStyle=gr;x.fillRect(i,0,16,h)}
   for(let i=0;i<rust*30;i++){const px=rnd()*w,py=rnd()*h,r=4+rnd()*20;const gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(110,55,22,.5)');gr.addColorStop(1,'rgba(110,55,22,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2)}
   for(let i=0;i<rust*10;i++){x.fillStyle='rgba(60,32,14,'+(.15+rnd()*.2)+')';x.fillRect(rnd()*w,rnd()*h*.6,1+rnd()*2,30+rnd()*100)}
   if(label){x.fillStyle='rgba(235,235,230,.75)';x.font='900 28px Helvetica,Arial';x.textAlign='center';x.fillText(label,w/2,h*.45)}});
  const cmat=(c,r,l)=>Sm({map:sheet(c,r,l),roughness:.7,metalness:.45,color:0x555555});
  const cont=(x,y,z,ry,c,r,l,len)=>{len=len||6;const m=cmat(c,r,l);const bx=B(len,2.6,2.44,x,y+1.3,z,m,ry);bx.castShadow=bx.receiveShadow=true;const c2=Math.cos(ry),s2=Math.sin(ry);for(const e of[-1,1])for(const o of[-.15,.15]){B(.06,2.4,.06,x+c2*e*(len/2)+0*s2,y+1.3,z-s2*e*(len/2)+o*c2,METAL,ry)}return bx};
  cont(5.3,0,-6.5,PI/2,'#a95a2a',1.6,'A-07');cont(5.3,2.6,-6.5,PI/2,'#2f5f86',1.2,'W-14');cont(5.3,0,-13,PI/2,'#2f5f86',1,'C-22');cont(5.2,0,-19.2,PI/2+.04,'#7a3a2a',1.8,'K-93');cont(5.3,2.6,-19.2,PI/2,'#8a8f98',1);
  cont(-5.6,0,-15,PI/2,'#8a4a22',1.8,null);cont(-5.6,2.6,-15,PI/2,'#35688f',1.2,'T-03');cont(-5.6,0,-21,PI/2,'#3b3f46',1,null);
  cont(-3.2,0,-19.8,0.2,'#a95a2a',1.4,'R-11',4.2);
  /* ---- floor props ---- */
  const tyre=(x,y,z,s)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.3*(s||1),.12*(s||1),10,18),BLK);t.rotation.x=PI/2;add(t,x,y,z)};
  for(let i=0;i<5;i++)tyre(-4.1,.13+i*.24,-1.4);for(let i=0;i<3;i++)tyre(-3.5,.13+i*.24,-1.1);for(let i=0;i<4;i++)tyre(4.0,.13+i*.24,-1.8);
  const YEL=M(0xd9a621,.6,.3),REDM=M(0xa5271f,.5,.4),BLUE=M(0x25496e,.55,.5),DARKM=M(0x24262b,.55,.6);
  for(const [x,z,m] of[[-4.3,-3.8,BLUE],[-4.4,-4.6,REDM],[-3.7,-4.2,YEL],[4.2,-3.6,BLUE],[4.4,-4.4,REDM],[-4.2,-12,DARKM],[-4.1,-12.8,BLUE]]){cyl(.3,.3,.9,x,.45,z,m,0,0,16);cyl(.31,.31,.03,x,.2,z,DARKM,0,0,16);cyl(.31,.31,.03,x,.7,z,DARKM,0,0,16)}
  /* pallets + crates */
  const PAL=M(0x6b4a2a,.9,0),CRATE=M(0x7a5a38,.85,0);for(const [x,z,r] of[[-4.4,-7.2,0],[-4.3,-9.2,.2],[3.9,-9.6,.1]]){B(1.1,.14,1.1,x,.07,z,PAL,r);B(.95,.7,.95,x,.5,z,CRATE,r);B(.8,.55,.8,x+.05,1.12,z,CRATE,r+.3)}
  /* tool chest, compressor, gas bottles, cones, work stand lamps */
  B(1.0,1.15,.55,-3.9,.6,2.6,M(0x8e211a,.5,.4),PI/2);B(1.04,.06,.6,-3.9,1.2,2.6,DARKM,PI/2);
  cyl(.28,.28,1.0,3.9,.62,2.2,REDM,0,PI/2,16);B(.06,.5,.06,3.9,.25,2.0,DARKM);B(.06,.5,.06,3.9,.25,2.4,DARKM);
  for(const [x,z] of[[4.3,-1.0],[4.55,-.8]])cyl(.1,.1,1.2,x,.6,z,[REDM,BLUE][x>4.4?1:0],0,0,10);
  for(let i=0;i<4;i++)cyl(.02,.2,.5,-3.0+i*1.0,.25,5.2-i*.5,M(0xff6a18,.6,0),0,0,10);
  const stand=(x,z,h)=>{for(const a of[0,2.1,4.2])B(.04,h,.04,x+Math.cos(a)*.2,h/2,z+Math.sin(a)*.2,BLK,0);cyl(.02,.02,h,x,h/2,z,BLK,0,0,5);const hd=B(.5,.35,.12,x,h+.2,z,M(0x2a2c30,.5,.5));const bl=B(.38,.24,.02,x,h+.2,z+.07,glow(2.6,2.1,1.2));return{x,z,h}};
  const st=[stand(-3.6,-5.8,1.8),stand(3.8,-15.8,1.8)];
  /* hanging cables */
  for(const [px,pz] of[[-2,-12],[3,-5]]){const crv=new THREE.CatmullRomCurve3([new THREE.Vector3(px,H-.5,pz),new THREE.Vector3(px+.3,H-2.4,pz+.2),new THREE.Vector3(px+.6,H-3.6,pz),new THREE.Vector3(px+.5,H-4.4,pz-.1)]);add(new THREE.Mesh(new THREE.TubeGeometry(crv,14,.03,5),BLK),0,0,0)}
  /* ---- lighting: very dark, cool fluorescent pools, warm work-lights, one shadow-casting key over the car ---- */
  g.add(new THREE.HemisphereLight(0x8fa0bd,0x1a1613,.04));
  const spot=(x,y,z,tx,tz,c,i,ang,sh)=>{const l=new THREE.SpotLight(c,i,30,ang,.8,1.4);l.position.set(x,y,z);l.target.position.set(tx,0,tz);g.add(l,l.target);if(sh){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.0005;l.shadow.radius=5;l.shadow.camera.near=1.5;l.shadow.camera.far=24}return l};
  spot(-1.0,H-1.5,-1.5,0,-2.6,0xdfe8ff,.6,.55,true);spot(2.6,H-1.5,-9,1,-9,0xe8f0ff,.5,.6,false);spot(-2.6,H-1.5,-16,-1,-16,0xe0e8ff,.35,.6,false);
  strips.forEach(([x,z],i)=>{if(i%2==0){const pl=new THREE.PointLight(0xdfe8ff,.35,9,1.8);pl.position.set(x,H-2,z);g.add(pl)}});
  for(const q of st){const pl=new THREE.PointLight(0xffb868,.7,7,1.8);pl.position.set(q.x,q.h+.3,q.z+.4);g.add(pl)}
  g.traverse(m=>{if(m.isMesh&&m.material&&!m.material.isMeshBasicMaterial&&!m.material.transparent){m.castShadow=true;m.receiveShadow=true;m.material.envMapIntensity=.18}});
  /* small baked reflection map so the car paint picks up the strip lights */
  try{const tmp=new THREE.Scene();tmp.background=new THREE.Color(0x0a0a0c);const em=(w,h,x,y,z,c,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.x=rx||0;tmp.add(m)};
   for(let k=-2;k<=2;k++)em(.3,6,k*2.2,6,0,0x8a96a8,Math.PI/2);em(10,3,0,3,-8,0x2a3140);em(6,2.5,-8,3,0,0x3a2a1a);
   const pm=new THREE.PMREMGenerator(R);HOME_ENV=pm.fromScene(tmp,.04).texture;pm.dispose()}catch(e){console.warn('garage env',e)}
  /* Hakan's garage model (project files only, built in with the Rockport pack) replaces the hand-made warehouse when present */
  if(typeof GARAGE_GLB_B64!=='undefined'&&THREE.GLTFLoader){try{const bin=atob(GARAGE_GLB_B64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
   new THREE.GLTFLoader().parse(u.buffer,'',gl=>{const o=gl.scene;o.position.set(0,0,-2);
    o.traverse(m=>{if(!m.isMesh||!m.material)return;const mn=m.material.name||'';if(/occluder/i.test(mn)){m.visible=false;return}
     if(/godrays/i.test(mn)){m.material.transparent=true;m.material.blending=THREE.AdditiveBlending;m.material.depthWrite=false;m.material.opacity=.5;return}
     m.receiveShadow=true;m.castShadow=false;m.material.envMapIntensity=.25;m.material.side=THREE.DoubleSide;if(P.lookPatch)P.lookPatch(m.material)});P.homeGLB=o;if(P.rockLook&&P.LOOK)setTimeout(()=>P.rockLook(P.LOOK.n),0);
    g.children.slice().forEach(c=>{c.visible=false});
    const L=new THREE.Group();L.add(new THREE.HemisphereLight(0xe4ebf5,0x3a342e,.6));
    const ks=(x,y,z,tx,tz,i,ang,sh)=>{const l=new THREE.SpotLight(0xfff2e0,i,34,ang,.7,1.2);l.position.set(x,y,z);l.target.position.set(tx,0,tz);L.add(l,l.target);if(sh){l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.0005;l.shadow.radius=4;l.shadow.camera.near=1.5;l.shadow.camera.far=20}return l};
    ks(-1.2,7,0,0,-2.6,1.5,.6,true);ks(4,6.5,-6,0,-6,.8,.8,false);ks(-4,6.5,4,0,3,.6,.8,false);
    const d=new THREE.DirectionalLight(0xdfe8ff,.5);d.position.set(3,8,-10);L.add(d);
    g.add(o,L);g.userData.glb=1},e=>console.warn('garage glb',e))}catch(e){console.warn('garage glb',e)}}
  g.visible=false;S.sc.add(g);return HOME=g}
P.studioDress=(S,SR)=>{if(!S)return;const home=!!(SR&&SR.home&&SR.kind==='garage'&&FR);if(S.wall){S.wall.visible=!home;if(S.dark)S.dark.visible=!home;if(S.ring)S.ring.visible=!home}
 const g=home?homeGarage(S):HOME;if(g)g.visible=home;if(S.floor){S.floor.visible=!home;S.floor.material.color.setHex(0x16191f)}S.sc.background.setHex(home?0x0e0d0c:0x0b0d11);P.homeCamOn=home;if(S.turn){S.turn.scale.setScalar(home?(HOME&&HOME.userData.glb?1:.78):1);S.turn.position.z=home?-2.6:0;if(S.mir){if(home){if(S.mir.parent!==S.turn)S.turn.add(S.mir)}else if(S.mir.parent)S.mir.parent.remove(S.mir)}}S.sc.environment=home?HOME_ENV:null;S.turn&&S.turn.children.forEach(o=>{if(o.geometry&&o.geometry.type==='RingGeometry')o.visible=!home});const glb=home&&HOME&&HOME.userData.glb;if(S._glbL!==glb){S._glbL=glb;S.sc.children.forEach(o=>{if(o.isLight&&o!==HOME){if(o.userData.v0==null)o.userData.v0=o.visible;o.visible=glb?false:o.userData.v0}})}S.sc.traverse(o=>{if(o.isSpotLight){if(o.userData.i0==null)o.userData.i0=o.intensity;o.intensity=o.userData.i0*(home?.45:1)}});if(S.cam&&S.cam.fov!==(home?36:30)){S.cam.fov=home?36:30;S.cam.updateProjectionMatrix()}};
P.homeCam=t=>({p:[2.6+Math.sin(t*.13)*.4,.62+Math.sin(t*.21)*.04,6.4+Math.cos(t*.11)*.25],l:[-.2,.55,-3]});
P.FRdebug=()=>FR;P.homeGroup=()=>HOME;
})();
