/* ===== Poly GT layer: Broken Span (suspension bridge snapped in half, a jump, then a walled island city) ===== */
(function ptBridge(){
'use strict';
const P=window.PT8;
const hex=h=>'#'+h.toString(16).padStart(6,'0');
const flat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,flatShading:true},o));
const frame=(T,k,l)=>{k=((k%T.N)+T.N)%T.N;const s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]);return[T.x[k]+c*l,T.z[k]-s*l,T.psi[k]]};

/* ---------- layout (world metres) ---------- */
const SEA=-1.2,GY=.8,LAND=1.9;
const ISL={x0:-50,x1:310,z0:-150,z1:170};      /* the island city */
const COAST=-620,MAINX=-1180;                    /* mainland shore */
const TOWX=[-520,-306],TOWH=34,DECK0=20,BZ=30;  /* two towers, nominal deck height, bridge centre line */
const GATE=[30,-92],GATEW=10.5;                  /* z of the two gates in the island's west wall */
const onIsland=(x,z)=>x>=ISL.x0&&x<=ISL.x1&&z>=ISL.z0&&z<=ISL.z1;
const GROUND=(x,z)=>onIsland(x,z)?GY:(x<COAST&&x>MAINX&&Math.abs(z)<460)?LAND:-3.2;

/* ---------- track hook: classify samples, walls, lamps, ground ---------- */
const ps=sampleTrack;
sampleTrack=d=>{const T=ps(d);if(!d.span)return T;
 const N=T.N;T.sg=new Uint8Array(N);T.lampOff=new Float32Array(N);
 for(let i=0;i<N;i++){const x=T.x[i],z=T.z[i];let sg;
  if(x>=ISL.x0+.5)sg=2;else if(x<COAST)sg=0;else sg=z>-30?1:3;
  T.sg[i]=sg;T.wall[i]=1;T.wh[i]=sg===1||sg===3?1.15:1.0;if(sg===1||sg===3)T.br[i]=1;
  T.lampOff[i]=sg===1||sg===3?.95:sg===2?1.9:3.2}
 T.terr=GROUND;T.jgl=0;if(T.jumps&&T.jumps.length){const c=T.jumps[0];for(let k=0;k<60&&T.gap[(c+k)%N];k++)T.jgl++}
 return T};
/* a respawn or crash recovery near the snapped span goes back to a long run-up, so the jump can be made again */
P.jumpBack=(T,i)=>{const J=T.jumps||[],N=T.N;if(!T.jgl||T.jgl*T.sp<15)return 0;const rl=Math.round(60/T.sp);
 for(const j of J){const dd=(i-j+N)%N;if(dd<T.jgl+rl+14||(N-dd)<rl+12){const target=(j-Math.round(240/T.sp)+N)%N;return(i-target+N)%N}}return 0};

/* ---------- textures ---------- */
const T_ASPH=()=>ctex(32,32,(x,w,h)=>{x.fillStyle='#3b3e44';x.fillRect(0,0,w,h);const r=rngf(4);for(let i=0;i<70;i++){x.fillStyle=r()<.5?'#00000022':'#ffffff10';x.fillRect(r()*w|0,r()*h|0,1,1)}x.fillStyle='#ffffffb0';x.fillRect(1,0,1,h);x.fillRect(w-2,0,1,h);x.fillStyle='#e8e0b0';x.fillRect(w/2-1,0,2,h/2)});
const T_PAVE=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#8f9296';x.fillRect(0,0,w,h);x.fillStyle='#00000026';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillRect(8,0,1,h);x.fillRect(0,8,w,1)});
const T_CONC=()=>ctex(8,8,(x,w,h)=>{x.fillStyle='#b4b7ba';x.fillRect(0,0,w,h);x.fillStyle='#d9c25a';x.fillRect(0,1,w,1);x.fillStyle='#0000001c';x.fillRect(0,h-2,w,2)});
const T_SLAB=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#8b8e90';x.fillRect(0,0,w,h);x.fillStyle='#0000001c';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);const r=rngf(2);for(let i=0;i<20;i++){x.fillStyle=r()<.5?'#ffffff10':'#00000014';x.fillRect(r()*w|0,r()*h|0,2,1)}});
const T_GRASS=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#6f9a4e';x.fillRect(0,0,w,h);const r=rngf(8);for(let i=0;i<60;i++){x.fillStyle=r()<.5?'#5a8840':'#82ac5e';x.fillRect(r()*w|0,r()*h|0,1,1)}});
const T_ALLEY=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#4d4b48';x.fillRect(0,0,w,h);const r=rngf(6);for(let i=0;i<40;i++){x.fillStyle=r()<.5?'#00000030':'#ffffff10';x.fillRect(r()*w|0,r()*h|0,2,2)}});
/* orange X-braced truss, transparent between the members */
const T_TRUSS=()=>{const t=ctex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#bf4426';x.lineWidth=5;x.beginPath();x.moveTo(2,2);x.lineTo(w-2,h-2);x.moveTo(w-2,2);x.lineTo(2,h-2);x.stroke();x.fillStyle='#c94b2a';x.fillRect(0,0,w,7);x.fillRect(0,h-7,w,7);x.fillRect(0,0,5,h);x.fillRect(w-5,0,5,h)});return t};
const T_ORANGE=()=>ctex(8,8,(x,w,h)=>{x.fillStyle='#c0482a';x.fillRect(0,0,w,h);x.fillStyle='#00000020';x.fillRect(0,h-2,w,2);x.fillStyle='#ffffff18';x.fillRect(0,0,w,1)});
const T_SIGN=(txt,bg,fg)=>ctex(256,64,(x,w,h)=>{x.fillStyle=fg||'#f4f0e4';x.fillRect(0,0,w,h);x.fillStyle=bg||'#1d4d34';x.fillRect(4,4,w-8,h-8);x.fillStyle=fg||'#f4f0e4';x.font='bold 30px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+2)});
const T_CHEV=()=>ctex(32,32,(x,w,h)=>{x.fillStyle='#f2c61c';x.fillRect(0,0,w,h);x.fillStyle='#16181c';for(let i=-2;i<4;i++){x.beginPath();x.moveTo(i*10,h);x.lineTo(i*10+6,h);x.lineTo(i*10+6+h,0);x.lineTo(i*10+h,0);x.fill()}});
const T_GATE=()=>ctex(64,64,(x,w,h)=>{x.fillStyle='#a7694f';x.fillRect(0,0,w,h);const r=rngf(3);for(let j=0;j<h/4;j++)for(let i=0;i<w/8;i++){x.fillStyle=r()<.5?'#9a5d45':'#b27659';x.fillRect(i*8+(j&1)*4,j*4,7,3)}x.fillStyle='#d9cdb4';x.fillRect(0,0,w,5);x.fillRect(0,h-6,w,6);for(let i=0;i<3;i++){x.fillStyle='#26323f';x.fillRect(6+i*20,14,12,26);x.fillStyle='#9ac3df';x.fillRect(7+i*20,15,10,9)}});

/* ---------- geometry helpers (all skip the broken span) ---------- */
function mkMesh(pos,idx,mt,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return new THREE.Mesh(g,mt)}
/* horizontal strip between two lateral offsets */
function strip(T,a,b,l0,l1,dy,mt,vs,segs){const pos=[],uv=[],idx=[],n=b-a+1,sg=segs||2;
 for(let r=0;r<n;r++){const k=(a+r)%T.N,s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]);for(let j=0;j<=sg;j++){const l=l0(k)+(l1(k)-l0(k))*j/sg;pos.push(T.x[k]+c*l,T.y[k]+dy,T.z[k]-s*l);uv.push(j/sg,r*T.sp/vs)}}
 for(let r=0;r<n-1;r++){const k=(a+r)%T.N,k2=(a+r+1)%T.N;if(T.gap[k]||T.gap[k2])continue;for(let j=0;j<sg;j++){const p=r*(sg+1)+j,q=p+sg+1;idx.push(p,q,p+1,p+1,q,q+1)}}
 return mkMesh(pos,idx,mt,uv)}
/* vertical strip at a lateral offset, from y0 to y1 (both relative to the road) */
function vstrip(T,a,b,lat,y0,y1,mt,vs,vrep){const pos=[],uv=[],idx=[],n=b-a+1;let cum=0;
 for(let r=0;r<n;r++){const k=(a+r)%T.N,f=frame(T,k,typeof lat==='function'?lat(k):lat);if(r)cum+=T.sp;const o0=typeof y0==='function'?y0(k):y0,o1=typeof y1==='function'?y1(k):y1;pos.push(f[0],T.y[k]+o0,f[1],f[0],T.y[k]+o1,f[1]);uv.push(cum/vs,0,cum/vs,vrep||1)}
 for(let r=0;r<n-1;r++){const k=(a+r)%T.N,k2=(a+r+1)%T.N;if(T.gap[k]||T.gap[k2])continue;const p=r*2;idx.push(p,p+2,p+1,p+1,p+2,p+3)}
 return mkMesh(pos,idx,mt,uv)}
/* consecutive samples satisfying pred */
function runs(T,pred){const out=[],N=T.N;let i=0;while(i<N){if(!pred(i)){i++;continue}let e=i;while(e+1<N&&pred(e+1))e++;out.push([i,e]);i=e+1}return out}
/* merged cylinders between pairs of points */
function beams(list,mt,sides){const pos=[],nor=[],idx=[];let base=0;const up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),dir=new THREE.Vector3();
 for(const [a,b,r] of list){dir.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const len=dir.length();if(len<1e-3)continue;dir.divideScalar(len);q.setFromUnitVectors(up,dir);
  const g=new THREE.CylinderGeometry(r,r,len,sides||5,1,false);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
  const p=g.attributes.position.array,n=g.attributes.normal.array,ix=g.index.array;for(let i=0;i<p.length;i++){pos.push(p[i]);nor.push(n[i])}for(let i=0;i<ix.length;i++)idx.push(ix[i]+base);base+=p.length/3;g.dispose()}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);const m=new THREE.Mesh(g,mt);m.frustumCulled=false;return m}
function boxAt(sc,w,h,d,mt,x,y,z,ry,rx,rz){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);m.position.set(x,y,z);if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;sc.add(m);return m}
function instB(sc,geo,m,list){const im=new THREE.InstancedMesh(geo,m,Math.max(1,list.length)),o=new THREE.Object3D();
 list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(0,p[6]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});
 im.count=list.length;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;sc.add(im);return im}

/* ---------- the world ---------- */
function buildSpan(T){const d=T.d,N=T.N,r=rngf(8*77+11),sc=new THREE.Scene();
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 sc.fog=new THREE.Fog(d.fog,260,1500);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],.8));const sun=new THREE.DirectionalLight(d.sun,.85);sun.position.set(-150,250,100);sc.add(sun);
 const sk=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,hex(d.sky[0]));g.addColorStop(.5,hex(d.sky[1]));g.addColorStop(1,hex(d.sky[1]));x.fillStyle=g;x.fillRect(0,0,w,h)});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sk,side:THREE.BackSide,fog:false}));sc.add(dome);const follow=[dome];
 const sunM=mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:d.sun,fog:false}),-500,420,-1000,sc);
 const U={};sc.userData.span=U;
 /* sea */
 const wm=new THREE.MeshStandardMaterial({color:0x14709f,roughness:1,metalness:0,flatShading:true});U.water=wm;
 const sea=mesh(new THREE.PlaneGeometry(7000,7000),wm,0,SEA,0,sc);sea.rotation.x=-Math.PI/2;
 const bed=mesh(new THREE.PlaneGeometry(7000,7000),flat(0x1a4a5e),0,-12,0,sc);bed.rotation.x=-Math.PI/2;
 /* mainland */
 {const gm=new THREE.MeshStandardMaterial({map:T_GRASS(),roughness:1});gm.map.repeat.set(90,90);
  const top=mesh(new THREE.PlaneGeometry(COAST-MAINX,920),gm,(COAST+MAINX)/2,LAND-.02,0,sc);top.rotation.x=-Math.PI/2;
  mesh(new THREE.BoxGeometry(COAST-MAINX,14,920),flat(0x6a6358),(COAST+MAINX)/2,LAND-7.05,0,sc);
  /* rocky headland hills behind the start */
  const hm=flat(0x5c7d46);for(let t=0,n=0;t<200&&n<14;t++){const hx=MAINX+40+r()*380,hz=(r()-.5)*860,hr=60+r()*80;let ok=true;for(let i=0;i<N&&ok;i+=2)if(Math.hypot(T.x[i]-hx,T.z[i]-hz)<hr+55)ok=false;if(!ok)continue;n++;const c=mesh(new THREE.ConeGeometry(hr,24+r()*40,7),hm,hx,LAND+4,hz,sc);c.rotation.y=r()*6}}
 /* island slab: concrete sea wall, paved top */
 {const w=ISL.x1-ISL.x0,h=ISL.z1-ISL.z0,cx=(ISL.x0+ISL.x1)/2,cz=(ISL.z0+ISL.z1)/2;
  const sm=new THREE.MeshStandardMaterial({map:T_SLAB(),roughness:1});sm.map.repeat.set(w/4,1);
  mesh(new THREE.BoxGeometry(w,GY+8,h),flat(0x777b7e),cx,(GY-8)/2,cz,sc);
  const pm=new THREE.MeshStandardMaterial({map:T_SLAB(),roughness:1,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2});pm.map.repeat.set(w/6,h/6);
  const top=mesh(new THREE.PlaneGeometry(w,h),pm,cx,GY-.015,cz,sc);top.rotation.x=-Math.PI/2}
 /* ----- road surface ----- */
 const PO={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2};
 sc.add(ribbon(T,k=>-T.hw[k],k=>T.hw[k],10,.03,new THREE.MeshStandardMaterial(Object.assign({map:T_ASPH(),roughness:.9,side:THREE.DoubleSide},PO)),6));
 const concM=new THREE.MeshStandardMaterial({map:T_SLAB(),roughness:1,side:THREE.DoubleSide}),steelM=flat(0x4a4d52,{side:THREE.DoubleSide}),orgM=new THREE.MeshStandardMaterial({map:T_ORANGE(),roughness:.8,side:THREE.DoubleSide,flatShading:true});
 const trussM=new THREE.MeshStandardMaterial({map:T_TRUSS(),roughness:.8,side:THREE.DoubleSide,alphaTest:.5});
 const jumps=T.jumps||[],broken=jumps.length>0;
 /* ----- bridge deck: slab, braced truss, underside ----- */
 for(const [a,b] of runs(T,i=>T.sg[i]===1)){
  sc.add(strip(T,a,b,k=>-(T.hw[k]+1.3),k=>T.hw[k]+1.3,-.02,concM,6,2));
  sc.add(strip(T,a,b,k=>-(T.hw[k]+1.3),k=>T.hw[k]+1.3,-.55,steelM,6,2));
  sc.add(strip(T,a,b,k=>-(T.hw[k]+1.3),k=>T.hw[k]+1.3,-4.2,steelM,6,2));
  for(const sd of[-1,1]){const t=vstrip(T,a,b,k=>sd*(T.hw[k]+1.3),-4.2,0,trussM,4.2,1);sc.add(t);sc.add(vstrip(T,a,b,k=>sd*(T.hw[k]+1.3),-.55,.0,orgM,4,1))}
  /* cross beams under the deck */
  const cb=[];for(let k=a;k<=b;k+=Math.max(1,Math.round(8/T.sp))){if(T.gap[k])continue;const f=frame(T,k,0);cb.push([f[0],T.y[k]-1.2,f[1],(T.hw[k]+1.3)*2,.5,.6,f[2]])}
  instB(sc,new THREE.BoxGeometry(1,1,1),steelM,cb)}
 /* shore abutment skirts: embankment sides where the road climbs over land */
 for(const [a,b] of runs(T,i=>T.sg[i]===0&&T.y[i]>LAND+.35&&T.z[i]>0)){for(const sd of[-1,1])sc.add(vstrip(T,a,b,k=>sd*(T.hw[k]+.1),k=>LAND-T.y[k],0,flat(0x77705f,{side:THREE.DoubleSide}),8,1))}
 /* ----- low causeway: concrete deck on piers ----- */
 {const pil=[];for(const [a,b] of runs(T,i=>T.sg[i]===3)){
   sc.add(strip(T,a,b,k=>-(T.hw[k]+1.2),k=>T.hw[k]+1.2,-.02,concM,6,2));sc.add(strip(T,a,b,k=>-(T.hw[k]+1.2),k=>T.hw[k]+1.2,-1.5,steelM,6,2));
   for(const sd of[-1,1])sc.add(vstrip(T,a,b,k=>sd*(T.hw[k]+1.2),-1.5,0,concM,4,1));
   for(let k=a;k<=b;k+=Math.max(1,Math.round(18/T.sp))){const f=frame(T,k,0);pil.push([f[0],(T.y[k]-1.5-10)/2,f[1],2.6,T.y[k]+8.5,(T.hw[k]+1.2)*2-1,f[2]])}}
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0x8a8d8f),pil)}
 /* ----- walls: visible concrete barrier on bridge and causeway, plain guardrail on land, invisible kerb walls on the island ----- */
 {const mats={1:new THREE.MeshStandardMaterial({map:T_CONC(),side:THREE.DoubleSide,roughness:.9}),0:flat(0xaab0b4,{side:THREE.DoubleSide})};
  for(const c of[0,1]){const W=Object.create(T);W.wall=Uint8Array.from(T.wall,(w,i)=>(c===0?T.sg[i]===0:T.sg[i]===1||T.sg[i]===3)&&w?1:0);
   W.wh=Float32Array.from(T.wh,(h,i)=>c===0?.8:h);sc.add(wallMesh(W,1,mats[c]));sc.add(wallMesh(W,-1,mats[c]))}}
 /* ----- bridge structure ----- */
 const deckY=(x)=>{let best=1e9,y=DECK0;for(let i=0;i<N;i++){if(T.sg[i]!==1||Math.abs(T.z[i]-BZ)>3)continue;const dd=Math.abs(T.x[i]-x);if(dd<best){best=dd;y=T.y[i]}}return y};
 const HW=T.hw[Math.max(0,T.sg.indexOf(1))]||8,LAT=HW+1.3;
 const cabM=flat(0x7a2a16),ropeM=flat(0x6a2a1a);
 {const cab=[],rop=[],LATC=LAT;
  const TOPY=DECK0+TOWH,mid=(TOWX[0]+TOWX[1])/2,half=(TOWX[1]-TOWX[0])/2,hmin=3.6;
  const cy=x=>{const u=(x-mid)/half;return DECK0+hmin+(TOPY-DECK0-hmin)*u*u};
  /* gap edges from the actual track */
  let gA=-425,gB=-401;if(broken){const c=jumps[0];let gl=0;for(let k=0;k<40;k++)if(T.gap[(c+k)%N])gl++;gA=T.x[c];gB=T.x[(c+gl)%N]}
  const cutA=broken?gA-1.2:mid,cutB=broken?gB+1.2:mid;
  for(const sd of[-1,1]){const lat=sd*LATC;
   const pt=(x,y)=>[x,y,BZ-lat];
   /* main spans, tower to break (or tower to tower when the bridge is whole) */
   const span=(xa,xb)=>{const n=Math.max(2,Math.round(Math.abs(xb-xa)/6));let prev=pt(xa,cy(xa));for(let i=1;i<=n;i++){const x=xa+(xb-xa)*i/n,q=pt(x,cy(x));cab.push([prev,q,.5]);prev=q}};
   span(TOWX[0],cutA);span(TOWX[1],cutB);
   /* hangers */
   const hang=(xa,xb)=>{const st=xa<xb?1:-1;for(let x=xa+st*10;st*(xb-x)>5;x+=st*10){const dy=deckY(x);rop.push([pt(x,cy(x)),pt(x,dy+.9),.1])}};
   hang(TOWX[0],cutA);hang(TOWX[1],cutB);
   /* back stays down to the anchorages */
   const anch=(xt,xa)=>{const ya=deckY(xa)+3.2,n=Math.round(Math.abs(xt-xa)/6);let prev=pt(xt,TOPY);for(let i=1;i<=n;i++){const u=i/n,x=xt+(xa-xt)*u,y=TOPY+(ya-TOPY)*u-5.5*4*u*(1-u),q=pt(x,y);cab.push([prev,q,.5]);prev=q;if(i%2===0&&i<n-1)rop.push([q,pt(x,deckY(x)+.9),.1])}};
   anch(TOWX[0],COAST-25);anch(TOWX[1],ISL.x0-18);
   if(broken){/* snapped cable ends dangle below the break */
    for(const [cx,dir] of[[cutA,-1],[cutB,1]]){let prev=pt(cx,cy(cx));for(let i=1;i<=4;i++){const q=[cx+dir*(.35*i+.03*i*i),cy(cx)-i*2.1,BZ-lat+sd*.15*i];cab.push([prev,q,.5-.03*i]);prev=q}}
    /* a couple of loose hangers swing below the cut cable */
    for(const [cx,dir] of[[cutA,-1],[cutB,1]]){const x=cx+dir*8,top=pt(x,cy(x));rop.push([top,pt(x+dir*.8,cy(x)-8.5),.1])}}}
  sc.add(beams(cab,cabM,6));sc.add(beams(rop,ropeM,4))}
 /* towers */
 for(const tx of TOWX){const y=deckY(tx),g=new THREE.Group();g.position.set(tx,0,BZ);sc.add(g);
  const TOPY=DECK0+TOWH;
  for(const sd of[-1,1]){const lz=sd*(LAT+2.1);
   /* stepped legs: wide plinth in the water, shaft, tapered top */
   mesh(new THREE.BoxGeometry(7.6,SEA+3.2+9,6.6),flat(0x6d7073),0,(-9+SEA+3.2)/2,lz,g);
   const segs=[[-4,y+4,4.4,3.6],[y+4,y+16,3.9,3.2],[y+16,y+26,3.4,2.8],[y+26,TOPY,3.0,2.4]];
   for(const [ya,yb,w,dd] of segs)mesh(new THREE.BoxGeometry(w,yb-ya,dd),orgM,0,(ya+yb)/2,lz,g);
   mesh(new THREE.BoxGeometry(3.3,1.0,2.7),flat(0x8f3220),0,TOPY+.5,lz,g)}
  /* portal beams between the legs (clear of the roadway) */
  for(const [by,bh] of[[y+11.5,2.4],[y+21,2.2],[y+TOWH-3,3.2]]){mesh(new THREE.BoxGeometry(2.6,bh,(LAT+2.1)*2),orgM,0,by,0,g);
   const x=mesh(new THREE.PlaneGeometry((LAT+.2)*2,bh*.0+4.6),new THREE.MeshStandardMaterial({map:T_TRUSS(),side:THREE.DoubleSide,alphaTest:.5,roughness:.8}),0,by-bh/2-2.3,0,g);x.rotation.y=Math.PI/2}}
 /* ----- broken ends, fallen deck, warning boards ----- */
 if(broken){const c=jumps[0];let gl=0;for(let k=0;k<40;k++)if(T.gap[(c+k)%N])gl++;
  const eA=(c-1+N)%N,eB=(c+gl)%N;
  for(const [k,dir] of[[eA,1],[eB,-1]]){const f=frame(T,k,0),ps2=T.psi[k],ax=Math.sin(ps2),az=Math.cos(ps2),lx=Math.cos(ps2),lz=-Math.sin(ps2);
   /* torn end: end plate, rebar and a bent truss lip */
   const reb=[];for(let i=0;i<22;i++){const l=(r()-.5)*2*(T.hw[k]+1),len=.8+r()*2.2,a0=[f[0]+lx*l,T.y[k]-.3-r()*.3,f[1]+lz*l],a1=[a0[0]+ax*dir*len,a0[1]-len*.35*r(),a0[2]+az*dir*len];reb.push([a0,a1,.045])}
   sc.add(beams(reb,flat(0x2a2220),4));
   for(const sd of[-1,1]){const lip=[];const base=frame(T,k,sd*(T.hw[k]+1.3));for(let i=0;i<4;i++){const h0=-4.2+i*1.15,len=.8+r()*2.4,a0=[base[0],T.y[k]+h0,base[1]],a1=[a0[0]+ax*dir*len,a0[1]-len*.6,a0[2]+az*dir*len];lip.push([a0,a1,.11])}sc.add(beams(lip,orgM,4))}
   /* hazard boards beside the road at the edge */
   for(const sd of[-1,1]){const g=new THREE.Group(),p=frame(T,(k-dir*3+N)%N,sd*(T.hw[k]+.2));g.position.set(p[0],T.y[k]+.55,p[1]);g.rotation.y=T.psi[k]+(dir>0?0:Math.PI);sc.add(g);
    const b=mesh(new THREE.BoxGeometry(2.6,1.1,.12),new THREE.MeshStandardMaterial({map:T_CHEV(),roughness:.8}),0,0,0,g);b.material.map.repeat.set(3,1)}}
  /* hanging "ROAD ENDS" sign on the approach gantry is built below; wreckage lies in the water under the gap */
  const cx=(T.x[eA]+T.x[eB])/2,cz=(T.z[eA]+T.z[eB])/2;
  for(let i=0;i<4;i++){const w=2.4+r()*3,l=5+r()*7;const b=boxAt(sc,w,.6,l,flat(0x55585a),cx+(r()-.5)*26,SEA-.9+r()*.9,cz+(r()-.5)*16,r()*3,(r()-.5)*.9,(r()-.5)*.9);
   const tr=mesh(new THREE.PlaneGeometry(l,2.4),trussM,0,1.1,0,b);tr.rotation.y=Math.PI/2}
  /* approach warning gantry before the ramp */
  const ga=(T.x[eA]-86);{const gk=(()=>{let b=1e9,bi=0;for(let i=0;i<N;i++){if(T.sg[i]!==1)continue;const dd=Math.abs(T.x[i]-ga)+Math.abs(T.z[i]-BZ);if(dd<b){b=dd;bi=i}}return bi})();
   const g=new THREE.Group(),f=frame(T,gk,0);g.position.set(f[0],T.y[gk],f[1]);g.rotation.y=f[2];sc.add(g);
   for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.7,7.4,.7),steelM,sd*(T.hw[gk]+.9),3.7,0,g);
   mesh(new THREE.BoxGeometry((T.hw[gk]+.9)*2+1,.8,.7),steelM,0,7.4,0,g);
   const s1=mesh(new THREE.PlaneGeometry(13,3.1),new THREE.MeshBasicMaterial({map:T_SIGN('BRIDGE OUT','#9b1c1c','#f6f1e6')}),0,6.0,-.4,g);s1.rotation.y=Math.PI}}
 /* ----- start gantry on the mainland ----- */
 {const g=new THREE.Group(),f=frame(T,0,0);g.position.set(f[0],T.y[0],f[1]);g.rotation.y=f[2];sc.add(g);
  for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.9,8.6,.9),steelM,sd*(T.hw[0]+1.2),4.3,0,g);
  mesh(new THREE.BoxGeometry(T.hw[0]*2+3.6,2.2,.6),new THREE.MeshBasicMaterial({map:ctex(32,4,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)&1?'#fff':'#111';x.fillRect(i,j,1,1)}})}),0,8.6,0,g)}
 /* ----- island: kerbs and pavements ----- */
 const paveM=new THREE.MeshStandardMaterial({map:T_PAVE(),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),curbM=flat(0xb9b6ae,{side:THREE.DoubleSide});
 for(const [a,b] of runs(T,i=>T.sg[i]===2))for(const sd of[-1,1]){
  sc.add(strip(T,a,b,k=>sd*(T.hw[k]+.02),k=>sd*(T.hw[k]+3.3),.12,paveM,3,2));
  sc.add(vstrip(T,a,b,k=>sd*(T.hw[k]+.02),.04,.12,curbM,4,1))}
 /* ----- the city ----- */
 city(sc,T,r,U);
 /* ----- sea-level stuff: bollards along the island edge ----- */
 {const bl=[];for(let x=ISL.x0+8;x<ISL.x1;x+=22){bl.push([x,GY+.4,ISL.z0+.5,.4,.8,.4]);bl.push([x,GY+.4,ISL.z1-.5,.4,.8,.4])}for(let z=ISL.z0+8;z<ISL.z1;z+=22){bl.push([ISL.x1-.5,GY+.4,z,.4,.8,.4]);if(Math.abs(z-GATE[0])>14&&Math.abs(z-GATE[1])>14)bl.push([ISL.x0+.5,GY+.4,z,.4,.8,.4])}
  instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x2a2f36),bl)}
 /* ----- far scenery: hazy hills, a skyline across the bay and sea haze ----- */
 {const Wd=4096,Hh=512,hz=352,cv=document.createElement('canvas');cv.width=Wd;cv.height=Hh;const g=cv.getContext('2d'),fog=new THREE.Color(d.fog),rr=rngf(77),mix=(h,t)=>'#'+new THREE.Color(h).lerp(fog,t).getHexString();
  g.fillStyle=mix(0x7b95a4,.55);g.beginPath();g.moveTo(0,hz);for(let x=0;x<=Wd;x+=16)g.lineTo(x,hz-40-34*Math.sin(x*.0031+1)-22*Math.sin(x*.0097)-10*Math.sin(x*.021));g.lineTo(Wd,hz);g.fill();
  for(let i=0;i<70;i++){const x=rr()*Wd,w=22+rr()*50,h=40+rr()*120;g.fillStyle=mix([0x8a9aa8,0x9aa8b0,0xa8a8b4][i%3],.6);g.fillRect(x,hz-h,w,h)}
  g.fillStyle=mix(0x6f9096,.45);g.beginPath();g.moveTo(0,hz);for(let x=0;x<=Wd;x+=16)g.lineTo(x,hz-16-14*Math.sin(x*.004+2)-8*Math.sin(x*.013));g.lineTo(Wd,hz);g.fill();
  const q=g.createLinearGradient(0,hz-10,0,Hh);q.addColorStop(0,mix(0x7fb4d0,.35));q.addColorStop(1,mix(0x4a86a6,.2));g.fillStyle=q;g.fillRect(0,hz,Wd,Hh-hz);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;
  const m=new THREE.Mesh(new THREE.CylinderGeometry(1300,1300,480,72,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));m.position.y=90;m.renderOrder=-2;sc.add(m);U.pano=m.material;U.follow=[follow[0],m,sunM]}
 {const [dome,pano,sunM]=U.follow;U.follow=null;const sx=-500,sy=420,sz=-1000;
  dome.onBeforeRender=(rd,sce,cam)=>{const p=cam.position;dome.position.set(p.x,0,p.z);dome.updateMatrixWorld();pano.position.set(p.x,90,p.z);pano.updateMatrixWorld();sunM.position.set(p.x+sx,sy,p.z+sz);sunM.updateMatrixWorld()}}
 return sc}

/* ---------- the island city: gap-free rows facing every shore, street rows, block fill, alleys ---------- */
function city(sc,T,r,U){const HP=P.HP,N=T.N;if(!HP||!HP.ready){console.warn('bridge: model pack not ready');return}
 const D=n=>HP.defs[n],L={},PK={},B=P.BLD,MAT=P.PROPKIT&&P.PROPKIT.MAT;
 const KK=['bld_A','bld_B','bld_C','bld_D','bld_E','bld_F','bld_G','bld_H'].filter(D);
 const PKN=['CompanyBuilding_01','CompanyBuilding_02','CompanyBuilding_03','CompanyBuilding_04','CommercialBuilding_01','CommercialBuilding_02','CommercialBuilding_03','ResidentBuilding_01','ResidentBuilding_02','ResidentBuilding_03','ResidentBuilding_04','ResidentBuilding_05','ResidentBuilding_06','StoreBuilding_01'].filter(n=>B&&B[n]&&MAT);
 const PD={};for(const n of PKN){const g=B[n].g;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;PD[n]={w:b.max.x-b.min.x,h:b.max.y-b.min.y,d:b.max.z-b.min.z,my:b.min.y}}
 const pick=a=>a[(r()*a.length)|0];
 const TINT=[0xffffff,0xf3e6d3,0xe9d2c0,0xd8dde6,0xe6e0c8,0xdac0b0,0xf6efe2];
 /* occupancy raster, 2 m cells */
 const CS=2,GW=Math.ceil((ISL.x1-ISL.x0)/CS),GH=Math.ceil((ISL.z1-ISL.z0)/CS),occ=new Uint8Array(GW*GH);
 const ci=x=>Math.floor((x-ISL.x0)/CS),cj=z=>Math.floor((z-ISL.z0)/CS);
 const cell=(i,j)=>i>=0&&j>=0&&i<GW&&j<GH?occ[j*GW+i]:1;
 const each=(cx,cz,w,dp,yaw,pad,fn)=>{const cs=Math.cos(yaw),sn=Math.sin(yaw),R=Math.hypot(w,dp)/2+1;
  for(let j=Math.max(0,cj(cz-R));j<=Math.min(GH-1,cj(cz+R));j++)for(let i=Math.max(0,ci(cx-R));i<=Math.min(GW-1,ci(cx+R));i++){
   const x=ISL.x0+(i+.5)*CS,z=ISL.z0+(j+.5)*CS,dx=x-cx,dz=z-cz,u=dx*cs-dz*sn,v=dx*sn+dz*cs;
   if(Math.abs(u)<=w/2+pad&&Math.abs(v)<=dp/2+pad)fn(i,j)}};
 const rectFree=(cx,cz,w,dp,yaw)=>{if(cx-w/2<ISL.x0-.01||cx+w/2>ISL.x1+.01||cz-dp/2<ISL.z0-.01||cz+dp/2>ISL.z1+.01){const R=Math.hypot(w,dp)/2;if(cx-R<ISL.x0||cx+R>ISL.x1||cz-R<ISL.z0||cz+R>ISL.z1)return false}
  let ok=true;each(cx,cz,w,dp,yaw,-.35,(i,j)=>{if(occ[j*GW+i])ok=false});return ok};
 const mark=(cx,cz,w,dp,yaw,pad)=>each(cx,cz,w,dp,yaw,pad||0,(i,j)=>{occ[j*GW+i]=1});
 /* roads and pavements are off limits */
 for(let i=0;i<N;i++){if(T.sg[i]!==2)continue;const R=T.hw[i]+3.3;each(T.x[i],T.z[i],R*2,R*2,0,0,(a,b)=>{const x=ISL.x0+(a+.5)*CS,z=ISL.z0+(b+.5)*CS;if((x-T.x[i])**2+(z-T.z[i])**2<=R*R)occ[b*GW+a]=1})}
 const gateBox=[];
 /* ---- model placement ---- */
 const placeHP=(nm,x,z,yaw,s,sy,tint)=>{const d=D(nm);(L[nm]=L[nm]||[]).push([x,GY-d.min.y*s*sy-.15,z,yaw,s,tint,sy])};
 const placePK=(nm,x,z,yaw,sx,sy,sz,tint)=>{(PK[nm]=PK[nm]||[]).push([x,GY+.02,z,yaw,sx,sy,sz,tint])};
 const roofs=[];
 /* a building spec for a slot of width W (along the frontage) */
 const spec=(W,hLo,hHi,dMin)=>{const H=hLo+r()*(hHi-hLo);
  if(PKN.length&&(r()<.38||!KK.length)){/* pack building, stretched to the slot */
   let best=null,bs=1e9;for(const n of PKN){const sc2=Math.abs(Math.log(W/PD[n].w))+r()*.55;if(sc2<bs){bs=sc2;best=n}}
   const p=PD[best],sx=W/p.w,Dp=Math.max(dMin||0,Math.min(13,p.d*sx*.95)),sz=Dp/p.d,sy=Math.max(.8,Math.min(3.4,H/p.h));return{pk:best,W,D:Dp,sx,sy,sz,H:p.h*sy}}
  const nm=pick(KK),d=D(nm),s=W/d.w,Dp=d.d*s,sy=Math.max(.8,Math.min(3.2,H/(d.h*s)));return{hp:nm,W,D:Dp,s,sy,H:d.h*s*sy}};
 const put=(sp,cx,cz,yaw)=>{const t=pick(TINT);if(sp.pk)placePK(sp.pk,cx,cz,yaw,sp.sx,sp.sy,sp.sz,t);else placeHP(sp.hp,cx,cz,yaw,sp.s,sp.sy,t);mark(cx,cz,sp.W,sp.D,yaw,0);if(r()<.11&&D('watertower'))roofs.push([cx,GY+sp.H,cz,yaw])};
 /* widths that tile a run exactly */
 const tile=(len,lo,hi)=>{const out=[];let rem=len;while(rem>.01){let w=lo+r()*(hi-lo);if(rem-w<lo*.85)w=rem;out.push(w);rem-=w}return out};
 /* ---- 1) the sea wall: four unbroken rows facing outward, corner towers, gate houses ---- */
 const CORNER=14;
 const ringRow=(a,b,fix,axis,out,hLo,hHi)=>{/* from a to b along `axis`; building front sits 0.4 m inside the edge */
  const len=b-a;if(len<4)return;let u=a;for(const W of tile(len,10,17)){const sp=spec(W,hLo,hHi,11),c=u+W/2;
   const dep=sp.D;let cx,cz,yaw;
   if(axis==='z'){cx=fix-out*(dep/2+.4);cz=c;yaw=Math.atan2(out,0)}else{cx=c;cz=fix-out*(dep/2+.4);yaw=Math.atan2(0,out)}
   put(sp,cx,cz,yaw);u+=W}};
 /* corner towers first (square, tall) */
 for(const [cx,cz] of[[ISL.x0+CORNER/2,ISL.z0+CORNER/2],[ISL.x1-CORNER/2,ISL.z0+CORNER/2],[ISL.x0+CORNER/2,ISL.z1-CORNER/2],[ISL.x1-CORNER/2,ISL.z1-CORNER/2]]){
  const nm=PKN.length?pick(PKN.filter(n=>/Company/.test(n))):null;
  if(nm){const p=PD[nm];placePK(nm,cx,cz,0,CORNER/p.w,Math.min(3.6,(34+r()*14)/p.h),CORNER/p.d,pick(TINT))}
  else{const n2=pick(KK),d=D(n2),s=CORNER/Math.max(d.w,d.d);placeHP(n2,cx,cz,0,s,2.6,pick(TINT))}
  mark(cx,cz,CORNER,CORNER,0,0)}
 ringRow(ISL.x0+CORNER,ISL.x1-CORNER,ISL.z0,'x',-1,16,36);   /* north, faces -z */
 ringRow(ISL.x0+CORNER,ISL.x1-CORNER,ISL.z1,'x',1,16,36);    /* south, faces +z */
 ringRow(ISL.z0+CORNER,ISL.z1-CORNER,ISL.x1,'z',1,16,36);    /* east, faces +x */
 /* west wall, split by the two gates */
 {const gs=GATE.slice().sort((p,q)=>p-q);let a=ISL.z0+CORNER;for(const g of gs){ringRow(a,g-GATEW,ISL.x0,'z',-1,16,36);a=g+GATEW}ringRow(a,ISL.z1-CORNER,ISL.x0,'z',-1,16,36)}
 /* gate houses: a block spanning each gate, road passes under it */
 {const gm=new THREE.MeshStandardMaterial({map:T_GATE(),roughness:.95});gm.map.repeat.set(6,2);
  for(const gz of GATE){const w=11;const m=mesh(new THREE.BoxGeometry(w,8.2,GATEW*2),gm,ISL.x0+w/2,GY+7.2+4.1,gz,sc);m.userData.gate=1;
   mesh(new THREE.BoxGeometry(w+.6,.8,GATEW*2+.6),flat(0xd9cdb4),ISL.x0+w/2,GY+15.7,gz,sc);
   const sg=mesh(new THREE.PlaneGeometry(9,2.2),new THREE.MeshBasicMaterial({map:T_SIGN(gz===GATE[0]?'CITY ISLAND':'CAUSEWAY','#1d3a5c')}),ISL.x0-.06,GY+11.4,gz,sc);sg.rotation.y=-Math.PI/2;
   mark(ISL.x0+w/2,gz,w,GATEW*2,0,0)}}
 /* ---- 2) street rows: continuous frontage along both sides of every island road ---- */
 const isl=[];for(let i=0;i<N;i++)if(T.sg[i]===2)isl.push(i);
 /* contiguous runs in track order */
 const rr=[];{let cur=null,prev=-5;for(const i of isl){if(cur&&i===prev+1)cur.push(i);else{cur=[i];rr.push(cur)}prev=i}}
 for(const run of rr)for(const sd of[-1,1]){
  /* offset polyline */
  const pts=run.map(k=>{const f=frame(T,k,sd*(T.hw[k]+3.4));return[f[0],f[1]]}),cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const total=cum[cum.length-1];const at=s=>{s=Math.max(0,Math.min(total,s));let i=1;while(i<cum.length-1&&cum[i]<s)i++;const u=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]);return[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*u,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*u]};
  let s=0;while(s<total-6){const W=9+r()*8,e=Math.min(total,s+W);if(e-s<7){break}
   const A=at(s),Bp=at(e),tx=Bp[0]-A[0],tz=Bp[1]-A[1],tl=Math.hypot(tx,tz)||1;
   const rx=tz/tl,rz=-tx/tl;                  /* right of travel */
   const fcx=-sd*rx,fcz=-sd*rz;               /* facing = toward the road */
   const sp=spec(e-s,12,30,7),cx=(A[0]+Bp[0])/2-fcx*sp.D/2,cz=(A[1]+Bp[1])/2-fcz*sp.D/2,yaw=Math.atan2(fcx,fcz);
   if(rectFree(cx,cz,sp.W,sp.D,yaw)){put(sp,cx,cz,yaw);s=e}else s+=3}}
 /* ---- 3) block fill: tall buildings in everything that is left, biggest first ---- */
 const nearestRoad=(x,z)=>{let b=1e9,bx=0,bz=0;for(const i of isl){const dd=(T.x[i]-x)**2+(T.z[i]-z)**2;if(dd<b){b=dd;bx=T.x[i];bz=T.z[i]}}return[bx,bz]};
 for(const [maxW,minW] of[[18,10],[14,8],[10,6]]){
  const order=[];for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)order.push([i,j]);for(let k=order.length-1;k>0;k--){const q=(r()*(k+1))|0;[order[k],order[q]]=[order[q],order[k]]}
  for(const [i,j] of order){if(occ[j*GW+i])continue;
   let wc=0;while(wc<maxW/CS&&!cell(i+wc,j))wc++;let dc=0;
   outer:while(dc<maxW/CS){for(let a=0;a<wc;a++)if(cell(i+a,j+dc))break outer;dc++}
   if(wc*CS<minW||dc*CS<minW)continue;
   const W=Math.min(wc*CS,minW+r()*(maxW-minW)),Dp=Math.min(dc*CS,minW+r()*(maxW-minW));
   const cx=ISL.x0+i*CS+W/2,cz=ISL.z0+j*CS+Dp/2,[rx,rz]=nearestRoad(cx,cz),ax=rx-cx,az=rz-cz;
   const yaw=Math.abs(ax)>Math.abs(az)?(ax>0?Math.PI/2:-Math.PI/2):(az>0?0:Math.PI);
   const upright=Math.abs(Math.sin(yaw))>.5;const WW=upright?Dp:W,DD=upright?W:Dp;   /* width along the facade */
   const H=20+r()*34,tint=pick(TINT);
   if(PKN.length&&(r()<.45||!KK.length)){const nm=pick(PKN),p=PD[nm];placePK(nm,cx,cz,yaw,WW/p.w,Math.min(4,H/p.h),DD/p.d,tint);if(r()<.1&&D('watertower'))roofs.push([cx,GY+Math.min(4,H/p.h)*p.h,cz,yaw])}
   else{const nm=pick(KK),d=D(nm),s=Math.min(WW/d.w,DD/d.d),sy=Math.max(.8,Math.min(3.4,H/(d.h*s)));placeHP(nm,cx,cz,yaw,s,sy,tint)}
   mark(cx,cz,W,Dp,0,0)}}
 /* ---- 4) whatever is still free: tiny alleys (dumpsters, bins, bags, crates) or, if large, a pocket park ---- */
 const seen=new Uint8Array(GW*GH),alleys=[],parks=[],lotsFloor=[];
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){if(occ[j*GW+i]||seen[j*GW+i])continue;
  const q=[[i,j]];seen[j*GW+i]=1;const cells=[];let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;
  while(q.length){const [a,b]=q.pop();cells.push([a,b]);mnx=Math.min(mnx,a);mxx=Math.max(mxx,a);mnz=Math.min(mnz,b);mxz=Math.max(mxz,b);for(const [da,db] of[[1,0],[-1,0],[0,1],[0,-1]]){const na=a+da,nb=b+db;if(na<0||nb<0||na>=GW||nb>=GH||occ[nb*GW+na]||seen[nb*GW+na])continue;seen[nb*GW+na]=1;q.push([na,nb])}}
  (cells.length>26?parks:alleys).push({cells,x0:ISL.x0+mnx*CS,x1:ISL.x0+(mxx+1)*CS,z0:ISL.z0+mnz*CS,z1:ISL.z0+(mxz+1)*CS})}
 const trees={};const TR=['Tree_02','Tree_04','Tree_05','Tree_07'].filter(n=>B&&B[n]);
 const alleyProps=['dumpster','dumpster','trash_A','trash_A','trash_B','box_A','box_B','barrel'].filter(D);
 const fl=[];
 for(const a of alleys){/* dark paved floor and clutter, a dumpster at each end */
  for(const [ci2,cj2] of a.cells)fl.push([ISL.x0+(ci2+.5)*CS,GY+.012,ISL.z0+(cj2+.5)*CS,CS,.02,CS]);
  const n=a.cells.length<3?(r()<.5?1:0):Math.max(2,Math.round(a.cells.length/2.2));
  for(let k=0;k<n;k++){const [ci2,cj2]=a.cells[(r()*a.cells.length)|0],x=ISL.x0+(ci2+.5)*CS+(r()-.5)*1.4,z=ISL.z0+(cj2+.5)*CS+(r()-.5)*1.4;
   const nm=(k<2&&a.cells.length>=3)?'dumpster':pick(alleyProps);if(!D(nm))continue;const h=nm==='dumpster'?1.15:nm==='barrel'?1.0:nm.startsWith('box')?.9:.55,s=h/D(nm).h;
   (L[nm]=L[nm]||[]).push([x,GY+.02,z,r()*6.28,s,undefined,1])}}
 for(const pk of parks){for(const [ci2,cj2] of pk.cells)fl.push([ISL.x0+(ci2+.5)*CS,GY+.018,ISL.z0+(cj2+.5)*CS,CS,.02,CS,0,1]);
  for(let k=0;k<Math.min(9,pk.cells.length/6);k++){const [ci2,cj2]=pk.cells[(r()*pk.cells.length)|0],nm=pick(TR);if(nm)(trees[nm]=trees[nm]||[]).push([ISL.x0+(ci2+.5)*CS,GY,ISL.z0+(cj2+.5)*CS,r()*6.28,1.3+r()*.7])}}
 {const g=fl.filter(f=>f.length<8),pg=fl.filter(f=>f.length>=8);
  if(g.length)instB(sc,new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({map:T_ALLEY(),roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),g);
  if(pg.length)instB(sc,new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x5f8f48,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),pg)}
 /* ---- 5) street furniture and trees on the pavements ---- */
 for(const run of rr){for(let q=4;q<run.length-3;q+=Math.max(2,Math.round(26/T.sp))){const k=run[q],sd=((q/Math.max(2,Math.round(26/T.sp)))|0)%2?1:-1,f=frame(T,k,sd*(T.hw[k]+2.4));
   if(!TR.length)break;const nm=pick(TR);(trees[nm]=trees[nm]||[]).push([f[0],GY+.1,f[1],r()*6.28,1.0+r()*.5])}
  for(let q=7;q<run.length-3;q+=Math.max(3,Math.round(17/T.sp))){const k=run[q],sd=r()<.5?-1:1,f=frame(T,k,sd*(T.hw[k]+2.9));const nm=pick(['firehydrant','box_A','trash_A','bench'].filter(D));if(!nm)continue;
   const h=nm==='firehydrant'?.9:nm==='bench'?.55:nm==='box_A'?.8:.6,s=h/D(nm).h,yaw=Math.atan2(-Math.cos(T.psi[k])*sd,Math.sin(T.psi[k])*sd);(L[nm]=L[nm]||[]).push([f[0],GY+.12,f[1],yaw,s,undefined,1])}}
 /* ---- build meshes ---- */
 for(const n in L)HP.add(sc,n,L[n]);
 {const o=new THREE.Object3D(),c=new THREE.Color();
  for(const n in PK){const rows=PK[n],im=new THREE.InstancedMesh(B[n].g.clone(),MAT,rows.length);rows.forEach((w,i)=>{o.position.set(w[0],w[1],w[2]);o.rotation.set(0,w[3],0);o.scale.set(w[4],w[5],w[6]);o.updateMatrix();im.setMatrixAt(i,o.matrix);c.setHex(w[7]);im.setColorAt(i,c)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.userData.ptProp=n;sc.add(im)}
  for(const n in trees){const rows=trees[n],im=new THREE.InstancedMesh(B[n].g.clone(),MAT,rows.length);rows.forEach((w,i)=>{o.position.set(w[0],w[1],w[2]);o.rotation.set(0,w[3],0);o.scale.setScalar(w[4]);o.updateMatrix();im.setMatrixAt(i,o.matrix);c.setHex(0xffffff);im.setColorAt(i,c)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;sc.add(im)}}
 if(roofs.length&&D('watertower'))HP.add(sc,'watertower',roofs.map(q=>[q[0],q[1]-.1,q[2],q[3],7,undefined,1]));
 U.stats={ring:0,alleys:alleys.length,parks:parks.length,buildings:Object.values(L).reduce((a,b)=>a+b.length,0)+Object.values(PK).reduce((a,b)=>a+b.length,0)};
 sc.userData.occ=occ;U.occ={occ,GW,GH,CS,x0:ISL.x0,z0:ISL.z0};
}

/* time of day tints the unlit backdrop and the water */
const TINT={dawn:[1.0,.82,.78],day:[1,1,1],sunset:[1,.66,.52],night:[.1,.14,.3]},WT={dawn:[1,.85,.85],day:[1,1,1],sunset:[1,.7,.6],night:[.18,.24,.5]};
if(P.applyTod){const at=P.applyTod;P.applyTod=(sc,T,key)=>{at(sc,T,key);const h=sc.userData&&sc.userData.span;if(!h||!h.pano)return;const t=TINT[key]||TINT.day,w=WT[key]||WT.day;h.pano.color.setRGB(t[0],t[1],t[2]);h.water.color.setRGB(.06,.38,.55).multiply(new THREE.Color(w[0],w[1],w[2]))}}
const bw=buildWorld;buildWorld=T=>T.d.span?buildSpan(T):bw(T);
})();
