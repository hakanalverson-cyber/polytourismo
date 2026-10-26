/* ===== Poly Tourismo v9 layer: hud2 (round-info list, whose-speedometer labels, floating P1..P4 tags, draft wind) ===== */
(function v9hud2(){
'use strict';
const P=window.PT8,PC=['#f1f3f5','#f2c76b','#7fd68a','#ef6a5a'];
/* ---------- HUD: vertical list for round info, driver labels when views are merged ---------- */
const hu0=hudUpdate;
hudUpdate=()=>{hu0();const Rc=RACE;if(!Rc)return;
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!e.dataset.b||!c.rect)return;
  const g=c.grp||[c],multi=g.length>1,s=parseFloat(e.style.getPropertyValue('--s'))||1,col=PC[c.k%4];
  let L=e.querySelector('.h8list');
  if(!L){L=document.createElement('div');L.className='h8list';e.appendChild(L);const md=e.querySelector('.h8mode');if(md)L.appendChild(md)}
  L.style.top=(10+g.length*94*s)+'px';
  const nm=(c.ptName&&c.ptName!=='P'+(c.pnum||0)?c.ptName+' ':'')+'P'+(c.pnum||c.k+1);
  const lab=nm+' · '+(P.BYID[c.carId]?P.BYID[c.carId].name:'');
  const spd=e.querySelector('.h8spd');let w=e.querySelector('.h8who');
  if(!w){w=document.createElement('div');w.className='h8who';spd.appendChild(w)}
  w.style.display=multi?'':'none';if(multi&&w._t!==lab){w._t=lab;w.innerHTML='<i style="background:'+col+'"></i>'+lab.replace(/</g,'')}
  const pl=e.querySelector('.h8plate');let tg=pl&&pl.querySelector('.tag');
  if(pl&&!tg){tg=document.createElement('div');tg.className='tag';pl.insertBefore(tg,pl.firstChild)}
  if(tg){tg.style.display=multi?'':'none';tg.style.color=col;tg.textContent=nm}
  if(multi){spd.querySelector('.spdmain').style.borderTop='3px solid '+col}else spd.querySelector('.spdmain').style.borderTop=''})};

/* ---------- floating player tags (only with 2+ humans; hidden on the tagged player's own screen, fade near the viewing camera) ---------- */
/* retro look: a square black plate with a stepped pixel border and pointer, lettered in the game's 5x7 pixel font (drawn small and
   scaled up with no smoothing) */
function tagTex(c){const cv=document.createElement('canvas');cv.width=128;cv.height=64;const g=cv.getContext('2d'),F=P.pxGlyphs||{};
 const col=PC[c.k%4],n='P'+(c.pnum||c.k+1),custom=c.ptName&&c.ptName!==n?c.ptName.toUpperCase().slice(0,12):'';
 const txt=(s,x,y,k,cl)=>{g.fillStyle=cl;for(const ch of s){const b=F[ch];if(b)b.split(' ').forEach((row,yy)=>{for(let i=0;i<5;i++)if(row[i]==='1')g.fillRect(x+i*k,y+yy*k,k,k)});x+=6*k}};
 const nw=n.length*12-2,ck=custom&&custom.length<=7?2:1,cw=custom?custom.length*6*ck-ck:0,w=Math.min(126,(custom?nw+8+cw:nw)+12),x0=Math.round(64-w/2),y0=10,h=28;
 g.fillStyle=col;g.fillRect(x0,y0,w,h);g.fillStyle='#0a0d11';g.fillRect(x0+2,y0+2,w-4,h-4);
 /* stepped pointer */g.fillStyle=col;for(let i=0;i<5;i++)g.fillRect(64-6+i,y0+h+i,12-2*i,1);g.fillStyle='#0a0d11';for(let i=0;i<3;i++)g.fillRect(64-4+i,y0+h-2+i,8-2*i,1);
 txt(n,x0+6,y0+7,2,col);if(custom)txt(custom,x0+6+nw+8,ck===2?y0+7:y0+11,ck,'#e8ecf1');
 const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.NearestFilter;t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;return t}
function addTags(Rc){const hs=Rc.cars.filter(c=>c.human);if(hs.length<2)return;
 for(const c of hs){if(!c.m||!c.m.g)continue;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tagTex(c),transparent:true,depthTest:false,depthWrite:false,fog:false}));
  sp.scale.set(3.4,1.7,1);sp.position.set(0,2.5,0);sp.renderOrder=999;sp.frustumCulled=false;
  const m=sp.material;sp.onBeforeRender=(r,sc,cam)=>{const d=cam.position.distanceTo(sp.getWorldPosition(new THREE.Vector3()));m.opacity=cam===c.cam&&!(c.cb>.5)?0:Math.max(0,Math.min(.95,(d-13)/6))};/* never on your own screen */
  c.m.g.add(sp);c.tag=sp}}

/* ---------- slipstream: sonic-boom rings + streaking wind lines on whoever is sitting in another car's wind ---------- */
const WM=()=>new THREE.MeshBasicMaterial({color:0xeaf4ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false});
function mkDraft(Rc,c){const d={rings:[],lines:[],rt:0,lt:0};
 for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.9,1,40),WM());m.visible=false;m.frustumCulled=false;Rc.scene.add(m);d.rings.push({m,life:9,vx:0,vz:0})}
 for(let i=0;i<18;i++){const mat=new THREE.MeshBasicMaterial({map:streakTex(),color:0xf2f8ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false}),m=new THREE.Group();
  const g1=new THREE.PlaneGeometry(.13,1);g1.rotateX(-Math.PI/2);const g2=new THREE.PlaneGeometry(.13,1);g2.rotateZ(Math.PI/2);g2.rotateY(Math.PI/2);
  m.add(new THREE.Mesh(g1,mat),new THREE.Mesh(g2,mat));m.children.forEach(o=>o.frustumCulled=false);m.visible=false;m.frustumCulled=false;Rc.scene.add(m);d.lines.push({m,mat,life:9,vx:0,vz:0,len:2})}
 c.dfx=d;return d}
let _st=null;function streakTex(){if(_st)return _st;const cv=document.createElement('canvas');cv.width=4;cv.height=64;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.35,'rgba(255,255,255,.9)');gr.addColorStop(.6,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,4,64);_st=new THREE.CanvasTexture(cv);return _st}
const easeOut=t=>1-Math.pow(1-t,3),RL=.75,LL=.55;
function draftFx(Rc,dt){for(const c of Rc.cars){if(c.out)continue;const dr=c.draft||0;let d=c.dfx;
 const on=dr>.2&&!c.fin;if(on&&!d)d=mkDraft(Rc,c);
 if(!d)continue;
 const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw),k=Math.min(1,dr*1.4);
 d.rt-=dt;d.lt-=dt;
 /* sonic-boom rings: born at the nose, carried along at ~60% of car speed so they peel away behind, expanding with ease-out */
 if(on&&d.rt<=0){d.rt=.34;const r=d.rings.find(q=>q.life>=RL);if(r){r.life=0;r.m.position.set(c.x+fx*2.7,c.y+.7,c.z+fz*2.7);r.m.rotation.set(0,c.yaw,0);r.vx=c.vx*.6;r.vz=c.vz*.6;r.k=k;r.m.visible=true}}
 /* wind lines: spawn along the flanks, drift backwards relative to the car, stretch in then shrink out */
 if(on&&d.lt<=0){d.lt=.1/(.3+dr);const l=d.lines.find(q=>q.life>=LL);if(l){l.life=0;const side=Math.random()<.5?-1:1,lat=side*(1.0+Math.random()*.9),h=.2+Math.random()*1.0,fw=.6+Math.random()*2.2;
   l.m.position.set(c.x+fx*fw+rx*lat,c.y+h,c.z+fz*fw+rz*lat);l.m.rotation.set(0,c.yaw,0);l.vx=c.vx*.35;l.vz=c.vz*.35;l.len=2.2+c.sp*.07;l.k=k;l.m.visible=true}}
 for(const r of d.rings){if(r.life<RL){r.life+=dt;const t=Math.min(1,r.life/RL);r.m.position.x+=r.vx*dt;r.m.position.z+=r.vz*dt;
   r.m.scale.setScalar(.8+easeOut(t)*2.6);const fade=t<.15?t/.15:Math.pow(1-(t-.15)/.85,1.6);r.m.material.opacity=.17*fade*(r.k||1);if(r.life>=RL){r.m.visible=false;r.m.material.opacity=0}}}
 for(const l of d.lines){if(l.life<LL){l.life+=dt;const t=Math.min(1,l.life/LL);l.m.position.x+=l.vx*dt;l.m.position.z+=l.vz*dt;
   l.m.scale.set(1,1,Math.max(.01,l.len*Math.sin(t*Math.PI)));l.mat.opacity=.32*Math.sin(t*Math.PI)*(l.k||1);if(l.life>=LL){l.m.visible=false;l.mat.opacity=0}}}}}

const l0=P.launch;P.launch=cfg=>{l0(cfg);if(RACE)addTags(RACE)};
const st0=step;step=dt=>{st0(dt);const Rc=RACE;if(Rc&&Rc.scene&&Rc.state!=='done')draftFx(Rc,dt)};
})();
