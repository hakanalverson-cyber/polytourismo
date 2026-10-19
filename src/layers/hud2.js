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

/* ---------- floating Smash-style player tags (only with 2+ humans; fade near the viewing camera) ---------- */
function tagTex(c){const cv=document.createElement('canvas');cv.width=256;cv.height=128;const g=cv.getContext('2d');
 const col=PC[c.k%4],n='P'+(c.pnum||c.k+1),custom=c.ptName&&c.ptName!==n?c.ptName:'';
 g.fillStyle='#0a0d11';g.strokeStyle=col;g.lineWidth=7;g.beginPath();const w=custom?232:132,x0=128-w/2;
 g.moveTo(x0+16,10);g.lineTo(x0+w-16,10);g.quadraticCurveTo(x0+w,10,x0+w,26);g.lineTo(x0+w,64);g.quadraticCurveTo(x0+w,80,x0+w-16,80);g.lineTo(150,80);g.lineTo(128,108);g.lineTo(106,80);g.lineTo(x0+16,80);g.quadraticCurveTo(x0,80,x0,64);g.lineTo(x0,26);g.quadraticCurveTo(x0,10,x0+16,10);g.closePath();g.fill();g.stroke();
 g.textBaseline='middle';g.fillStyle=col;g.font='900 44px sans-serif';g.textAlign=custom?'left':'center';
 if(custom){g.fillText(n,x0+16,47);g.fillStyle='#e8ecf1';g.font='700 26px sans-serif';g.fillText(custom.toUpperCase(),x0+16+g.measureText(n).width+0,47)}else g.fillText(n,128,47);
 const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;return t}
function addTags(Rc){const hs=Rc.cars.filter(c=>c.human);if(hs.length<2)return;
 for(const c of hs){if(!c.m||!c.m.g)continue;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tagTex(c),transparent:true,depthTest:false,depthWrite:false,fog:false}));
  sp.scale.set(3.4,1.7,1);sp.position.set(0,2.5,0);sp.renderOrder=999;sp.frustumCulled=false;
  const m=sp.material;sp.onBeforeRender=(r,sc,cam)=>{const d=cam.position.distanceTo(sp.getWorldPosition(new THREE.Vector3()));m.opacity=Math.max(0,Math.min(.95,(d-13)/6))};
  c.m.g.add(sp);c.tag=sp}}

/* ---------- slipstream: sonic-boom rings + streaking wind lines on whoever is sitting in another car's wind ---------- */
const WM=()=>new THREE.MeshBasicMaterial({color:0xeaf4ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false});
function mkDraft(Rc,c){const d={rings:[],lines:[],rt:0,lt:0};
 for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.86,1,28),WM());m.visible=false;m.frustumCulled=false;Rc.scene.add(m);d.rings.push({m,life:9})}
 for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.045,.045,1),WM());m.visible=false;m.frustumCulled=false;Rc.scene.add(m);d.lines.push({m,life:9})}
 c.dfx=d;return d}
function draftFx(Rc,dt){for(const c of Rc.cars){if(c.out)continue;const dr=c.draft||0;let d=c.dfx;
 if(dr>.14&&!c.fin){if(!d)d=mkDraft(Rc,c);
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
  d.rt-=dt;d.lt-=dt;
  if(d.rt<=0&&dr>.25){d.rt=.2;const r=d.rings.find(q=>q.life>=.5);if(r){r.life=0;r.m.position.set(c.x+fx*2.7,c.y+.7,c.z+fz*2.7);r.m.rotation.set(0,c.yaw,0);r.m.visible=true}}
  if(d.lt<=0){d.lt=.8/(10+dr*30);const l=d.lines.find(q=>q.life>=.4);if(l){l.life=0;const lat=(Math.random()*2-1)*1.5,h=.15+Math.random()*1.2,fw=-.5+Math.random()*2.6;
   l.m.position.set(c.x+fx*fw+rx*lat,c.y+h,c.z+fz*fw+rz*lat);l.m.rotation.set(0,c.yaw,0);l.m.scale.set(1,1,2+c.sp*.06);l.m.visible=true}}}
 if(d){for(const r of d.rings){if(r.life<.5){r.life+=dt;const t=r.life/.5;r.m.scale.setScalar(.9+t*2.4);r.m.material.opacity=.55*(1-t)*(1-t);if(r.life>=.5)r.m.visible=false}}
  for(const l of d.lines){if(l.life<.4){l.life+=dt;const t=l.life/.4;l.m.material.opacity=.5*Math.sin(t*3.14);if(l.life>=.4)l.m.visible=false}}}}}

const l0=P.launch;P.launch=cfg=>{l0(cfg);if(RACE)addTags(RACE)};
const st0=step;step=dt=>{st0(dt);const Rc=RACE;if(Rc&&Rc.scene&&Rc.state!=='done')draftFx(Rc,dt)};
})();
