/* ===== Poly GT layer: Free Roam life (ambient traffic made of the game's own cars, pedestrians on the sidewalks, birds) ===== */
(function frlife(){
'use strict';
const P=window.PT8,PI=Math.PI,TAU=PI*2;
const rnd=()=>Math.random();
const CIV=['c26','c50','c67','c91','c5','c28','c32','c39','c57','c12','c18','c22','c25','c40','c41','c48','c55','c58','c62','c83','c96','c101','c111','c114','c117','c121','c19','c31','c54','c64','lr','ford','ster','merc','must','urus','c93'];
function carMesh(id){const idx=P.modelOf(id,0),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src)return null;
 const model=src.clone(true),car=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);car.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);car.scale.setScalar(k);car.rotation.y=(sz.x>sz.z?PI/2:0);const o=new THREE.Group();o.add(car);
 o.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;m.userData.shared=true}});return o}
/* ---------- traffic ---------- */
function roadsFor(F){const out=[];for(const r of F.ROADS){if(r.lane||r.mat)continue;if(r.id==='summit'||r.id==='air'||r.id==='drift'||r.id==='meet')continue;out.push(r)}return out}
function initTraffic(F,sc){const L={cars:[],roads:roadsFor(F),grp:new THREE.Group()};sc.add(L.grp);
 const ids=CIV.filter(i=>P.BYID&&P.BYID[i]);for(let k=0;k<16;k++){const id=ids[(Math.random()*ids.length)|0],m=carMesh(id);if(!m)continue;m.visible=false;L.grp.add(m);L.cars.push({m,r:null,t:0,dir:1,v:0,vt:12,lane:1,hit:0,on:false,x:0,z:0,yaw:0,id})}
 return L}
function seg(r,t){/* point on road r at arc length t */let lo=0,hi=r.n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(r.cum[m]<=t)lo=m;else hi=m}const a=r.cum[hi]-r.cum[lo]||1,f=Math.min(1,Math.max(0,(t-r.cum[lo])/a));return[r.x[lo]+(r.x[hi]-r.x[lo])*f,r.z[lo]+(r.z[hi]-r.z[lo])*f,r.x[hi]-r.x[lo],r.z[hi]-r.z[lo]]}
function spawn(L,F,c,car){/* put a car on a road 130..320 m from the player, not in view straight ahead */
 for(let k=0;k<30;k++){const r=L.roads[(Math.random()*L.roads.length)|0],t=Math.random()*r.len,p=seg(r,t),d=Math.hypot(p[0]-c.x,p[1]-c.z);if(d<110||d>330)continue;
  const town=F.inTown(p[0],p[1],0),dir=Math.random()<.5?1:-1;car.r=r;car.t=t;car.dir=dir;car.lane=dir;car.vt=(town?9+rnd()*4:r.hw>=5.5?17+rnd()*6:13+rnd()*4);car.v=car.vt;car.hit=0;car.on=true;car.m.visible=true;return}
 car.on=false;car.m.visible=false}
function tickTraffic(L,F,c,dt){
 for(const q of L.cars){if(!q.on){spawn(L,F,c,q);continue}
  const r=q.r,p=seg(r,q.t),dl=Math.hypot(p[0]-c.x,p[1]-c.z);if(dl>420){q.on=false;q.m.visible=false;continue}
  /* hit recovery / braking for the player or a car ahead */
  q.hit=Math.max(0,q.hit-dt);let want=q.hit>0?0:q.vt;
  const tx=p[2],tz=p[3],tl=Math.hypot(tx,tz)||1,fx=tx/tl*q.dir,fz=tz/tl*q.dir;
  {const ax=c.x-q.x,az=c.z-q.z,ad=Math.hypot(ax,az);if(ad<24&&(ax*fx+az*fz)/ad>.8)want=Math.min(want,Math.max(0,(ad-9)*1.2))}
  for(const o of L.cars){if(o===q||!o.on)continue;const ax=o.x-q.x,az=o.z-q.z,ad=Math.hypot(ax,az);if(ad<18&&(ax*fx+az*fz)/(ad||1)>.85&&Math.abs(ax*fz-az*fx)<2.6)want=Math.min(want,Math.max(0,(ad-6.5)*1.4))}
  q.v+=(want-q.v)*Math.min(1,dt*(want<q.v?2.6:.9));q.t+=q.v*dt*q.dir;
  if(q.t<2||q.t>r.len-2){q.on=false;q.m.visible=false;continue}
  const s=seg(r,q.t),sl=Math.hypot(s[2],s[3])||1,dx=s[2]/sl*q.dir,dz=s[3]/sl*q.dir,off=Math.min(r.hw*.5,3.4);/* right-hand traffic: keep to the right of travel */
  const nx=-dz*-1,nz=dx*-1;/* right = (dz,-dx) */
  const px=s[0]+dz*off,pz=s[1]-dx*off,h=F.Hf(px,pz),yaw=Math.atan2(dx,dz),h2=F.Hf(px+dx*2.2,pz+dz*2.2),h1=F.Hf(px-dx*2.2,pz-dz*2.2);
  q.x=px;q.z=pz;q.yaw=yaw;q.m.position.set(px,h+.06,pz);q.m.rotation.set(0,yaw,0);q.m.children[0].rotation.x=Math.atan2(h1-h2,4.4)*.0;q.m.rotation.x=-Math.atan2(h2-h1,4.4);
  /* the player running into it */
  const ex=c.x-px,ez=c.z-pz,ed=Math.hypot(ex,ez);if(ed<3.6&&ed>.01&&q.hit<=0){const nxn=ex/ed,nzn=ez/ed,rel=(c.vx-fx*q.v)*nxn+(c.vz-fz*q.v)*nzn;if(rel<-1){const j=-rel*1.25;c.vx+=nxn*j;c.vz+=nzn*j;c.vx*=.82;c.vz*=.82;q.hit=2.4;q.v*=.2;if(P.sfx&&P.sfx.hit)try{P.sfx.hit(Math.min(1,-rel/18))}catch(e){}}}}
}
/* ---------- pedestrians (instanced) ---------- */
function initPeds(F,sc){const N=44,L={n:N,p:[],legL:null,legR:null,body:null,head:null};
 const mk=(g,col)=>{const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:col}),N);m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);sc.add(m);return m};
 const gb=new THREE.BoxGeometry(.5,.62,.28);gb.translate(0,1.2,0);const gh=new THREE.IcosahedronGeometry(.17,0);gh.translate(0,1.68,0);const gl=new THREE.BoxGeometry(.2,.84,.22);gl.translate(0,-.42,0);const ga=new THREE.BoxGeometry(.14,.6,.16);ga.translate(0,-.3,0);
 L.body=mk(gb,0xffffff);L.head=mk(gh,0xe2b48f);L.legL=mk(gl,0x2f3a52);L.legR=mk(gl,0x2f3a52);L.armL=mk(ga,0xffffff);L.armR=mk(ga,0xffffff);
 const cols=[0xd44a3a,0x3a78d4,0x3ab06a,0xe6c23a,0x8a4ad4,0xe8e8ea,0x333a44,0xe07a30],c=new THREE.Color();
 for(let i=0;i<N;i++){const p={x:0,z:0,dx:1,dz:0,on:false,ph:Math.random()*6,sp:1.1+Math.random()*.6,col:cols[(Math.random()*cols.length)|0]};L.p.push(p);c.setHex(p.col);L.body.setColorAt(i,c);L.armL.setColorAt(i,c);L.armR.setColorAt(i,c)}
 L.body.instanceColor.needsUpdate=true;L.armL.instanceColor.needsUpdate=true;L.armR.instanceColor.needsUpdate=true;L.dm=new THREE.Object3D();return L}
function pedSpawn(L,F,c,p){/* a spot on a sidewalk near the player */
 const TX0=F.TX0,TZ0=F.TZ0,TB=F.TB;for(let k=0;k<12;k++){const along=Math.random()<.5,ang=Math.random()*TAU,rad=30+Math.random()*110;let x=c.x+Math.cos(ang)*rad,z=c.z+Math.sin(ang)*rad;
  if(!F.inTown(x,z,-20))continue;
  if(along){/* walk along an east-west street */const j=Math.round((z-TZ0)/TB),sd=Math.random()<.5?-1:1;z=TZ0+TB*j+sd*6.8;if(j<0||j>F.TNZ)continue;p.dx=Math.random()<.5?1:-1;p.dz=0}
  else{const i=Math.round((x-TX0)/TB),sd=Math.random()<.5?-1:1;x=TX0+TB*i+sd*6.8;if(i<0||i>F.TNX)continue;p.dx=0;p.dz=Math.random()<.5?1:-1}
  p.x=x;p.z=z;p.on=true;return}
 p.on=false}
function tickPeds(L,F,c,dt,t){const dm=L.dm,TX0=F.TX0,TZ0=F.TZ0,TB=F.TB;
 for(let i=0;i<L.n;i++){const p=L.p[i];if(!p.on||Math.hypot(p.x-c.x,p.z-c.z)>190||!F.inTown(p.x,p.z,-8)){pedSpawn(L,F,c,p)}
  if(p.on){/* keep to the sidewalk line; cross the street at intersections now and then */
   p.x+=p.dx*p.sp*dt;p.z+=p.dz*p.sp*dt;
   const lx=(p.x-TX0)/TB,lz=(p.z-TZ0)/TB;
   if(p.dx!==0){const nz=Math.round(lz);const off=(p.z-TZ0-TB*nz);if(Math.abs(off)>5.2&&Math.abs(off)<8.5&&Math.abs(((p.x-TX0)/TB)%1)>.9)p.z+=0;}
   const ix=Math.abs(lx-Math.round(lx))*TB,iz=Math.abs(lz-Math.round(lz))*TB;
   if(ix<7.6&&iz<7.6&&!p.turned){p.turned=true;if(Math.random()<.45){const a=p.dx,b=p.dz;p.dx=b*(Math.random()<.5?1:-1);p.dz=a*(Math.random()<.5?1:-1);if(p.dx!==0){p.z=TZ0+TB*Math.round(lz)+(Math.random()<.5?-1:1)*6.8}else{p.x=TX0+TB*Math.round(lx)+(Math.random()<.5?-1:1)*6.8}}}
   if(ix>10||iz>10)p.turned=false;
   p.ph+=dt*p.sp*5.2}
  const y=p.on?F.Hf(p.x,p.z)+.16:-999,yaw=Math.atan2(p.dx,p.dz),sw=Math.sin(p.ph)*.6;
  const set=(m,ox,oy,oz,rx)=>{dm.position.set(p.x+Math.cos(yaw)*ox,y+oy,p.z-Math.sin(yaw)*ox);dm.rotation.set(rx||0,yaw,0);dm.scale.setScalar(p.on?1:0.0001);dm.updateMatrix();m.setMatrixAt(i,dm.matrix)};
  set(L.body,0,0,0,0);set(L.head,0,0,0,0);set(L.legL,.11,.86,0,sw);set(L.legR,-.11,.86,0,-sw);set(L.armL,.33,1.46,0,-sw);set(L.armR,-.33,1.46,0,sw)}
 for(const m of[L.body,L.head,L.legL,L.legR,L.armL,L.armR])m.instanceMatrix.needsUpdate=true}
/* ---------- birds ---------- */
function initBirds(sc){const N=22,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,.5,-1.5,.15,-.2,0,0,-.3,0,0,.5,0,0,-.3,1.5,.15,-.2],3));g.computeVertexNormals();
 const m=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:0x2b2f38,side:THREE.DoubleSide,fog:false}),N);m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);sc.add(m);
 const b=[];for(let i=0;i<N;i++)b.push({a:Math.random()*TAU,r:70+Math.random()*180,h:45+Math.random()*70,w:.1+Math.random()*.12,ph:Math.random()*6,cx:0,cz:0});return{m,b,dm:new THREE.Object3D(),ox:null}}
function tickBirds(B,c,dt,t){const dm=B.dm;if(B.ox==null){B.ox=c.x;B.oz=c.z}B.ox+=(c.x-B.ox)*Math.min(1,dt*.08);B.oz+=(c.z-B.oz)*Math.min(1,dt*.08);
 B.b.forEach((q,i)=>{q.a+=q.w*dt;const x=B.ox+Math.cos(q.a)*q.r,z=B.oz+Math.sin(q.a)*q.r,fl=.45+.55*Math.abs(Math.sin(t*7+q.ph));dm.position.set(x,q.h+Math.sin(q.a*3+q.ph)*4,z);dm.rotation.set(0,-q.a+PI,0);dm.scale.set(1.2,fl,1.2);dm.updateMatrix();B.m.setMatrixAt(i,dm.matrix)});B.m.instanceMatrix.needsUpdate=true}
/* ---------- entry points ---------- */
P.frLifeInit=(F,sc)=>{const L={t:0,F};try{L.tr=initTraffic(F,sc)}catch(e){console.warn('traffic',e)}try{L.pd=initPeds(F,sc)}catch(e){console.warn('peds',e)}try{L.bd=initBirds(sc)}catch(e){console.warn('birds',e)}return L};
P.frLifeTick=(L,sc,F,c,dt)=>{if(!L)return;L.t+=dt;if(L.tr)tickTraffic(L.tr,F,c,dt);
 const nearTown=F.inTown(c.x,c.z,260);if(L.pd){if(nearTown)tickPeds(L.pd,F,c,dt,L.t);else for(const p of L.pd.p)p.on=false}
 if(L.bd)tickBirds(L.bd,c,dt,L.t)};
P.frLifeDispose=(L,sc)=>{};
})();
