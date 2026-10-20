/* ===== Poly Tourismo v9 layer: animals (rigged + animated; graze, wander, bolt from passing cars) ===== */
(function v9animals(){
'use strict';
const P=window.PT8,PI=Math.PI;if(typeof ANIM_B64==='undefined'||!THREE.GLTFLoader)return;
/* real-world body length (m) of each species, measured along the model's forward axis (+Z) */
const SPEC={Horse:2.25,Cow:2.15,Deer:1.75,Fox:.95,Wolf:1.25,Alpaca:1.35,Donkey:1.8,ShibaInu:.85,Husky:1.05,Bull:2.25,Stag:2.15,WhiteHorse:2.25};
const RUN={Horse:9,Cow:6,Deer:11,Fox:8,Wolf:9,Alpaca:7,Donkey:7,ShibaInu:7,Husky:8,Bull:6,Stag:10,WhiteHorse:9};
const MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,flatShading:true,skinning:true});
const SP={};/* species -> {root,clips,k} once parsed */
/* ---------- load: gunzip each glb, parse, merge its 5-8 colour primitives into ONE skinned mesh (one draw call) ---------- */
function prep(g,name){const root=g.scene;root.updateMatrixWorld(true);const sm=[];root.traverse(o=>{if(o.isSkinnedMesh)sm.push(o)});if(!sm.length)return;
 let nv=0,ni=0;for(const m of sm){nv+=m.geometry.attributes.position.count;ni+=m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count}
 const pos=new Float32Array(nv*3),col=new Float32Array(nv*3),si=new Uint16Array(nv*4),sw=new Float32Array(nv*4),idx=new Uint32Array(ni);let v0=0,i0=0;
 for(const m of sm){const a=m.geometry.attributes,n=a.position.count,c=m.material.color;
  for(let i=0;i<n;i++){pos[(v0+i)*3]=a.position.getX(i);pos[(v0+i)*3+1]=a.position.getY(i);pos[(v0+i)*3+2]=a.position.getZ(i);col[(v0+i)*3]=c.r;col[(v0+i)*3+1]=c.g;col[(v0+i)*3+2]=c.b;
   for(let j=0;j<4;j++){si[(v0+i)*4+j]=[a.skinIndex.getX,a.skinIndex.getY,a.skinIndex.getZ,a.skinIndex.getW][j].call(a.skinIndex,i);sw[(v0+i)*4+j]=[a.skinWeight.getX,a.skinWeight.getY,a.skinWeight.getZ,a.skinWeight.getW][j].call(a.skinWeight,i)}}
  const ix=m.geometry.index;if(ix)for(let i=0;i<ix.count;i++)idx[i0+i]=ix.getX(i)+v0;else for(let i=0;i<n;i++)idx[i0+i]=v0+i;i0+=ix?ix.count:n;v0+=n}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('color',new THREE.BufferAttribute(col,3));G.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));G.setIndex(new THREE.BufferAttribute(idx,1));
 const first=sm[0],par=first.parent,mm=new THREE.SkinnedMesh(G,MAT);mm.name='animalBody';mm.frustumCulled=false;mm.position.copy(first.position);mm.quaternion.copy(first.quaternion);mm.scale.copy(first.scale);par.add(mm);mm.updateMatrixWorld(true);mm.bind(first.skeleton,first.bindMatrix);
 sm.forEach(m=>m.parent.remove(m));
 /* body length from the bones (z extent in world space) -> metres */
 root.updateMatrixWorld(true);let z0=1e9,z1=-1e9;const v=new THREE.Vector3();root.traverse(o=>{if(o.isBone){o.getWorldPosition(v);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z)}});
 SP[name]={root,clips:g.animations,k:(SPEC[name]||1.5)/Math.max(.001,z1-z0)}}
/* clone with a private skeleton (SkinnedMesh.clone() shares the skeleton) */
function clone(sp){const src=sp.root,dst=src.clone(true),sb=[],db=[];src.traverse(o=>sb.push(o));dst.traverse(o=>db.push(o));const map=new Map();sb.forEach((o,i)=>map.set(o,db[i]));
 dst.traverse(o=>{if(o.isSkinnedMesh){const i=db.indexOf(o),so=sb[i],bones=so.skeleton.bones.map(b=>map.get(b));o.bind(new THREE.Skeleton(bones,so.skeleton.boneInverses),so.bindMatrix)}});return dst}
(async()=>{try{const raw=atob(ANIM_B64),b=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);
 const ld=new THREE.GLTFLoader();
 for(const m of ANIM_META){const ab=await new Response(new Blob([b.subarray(m.off,m.off+m.len)]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  await new Promise(res=>ld.parse(ab,'',g=>{try{prep(g,m.n)}catch(e){console.warn('animal',m.n,e)}res()},e=>{console.warn('animal',m.n,e);res()}))}
 P.animalsReady=true}catch(e){console.warn('animals',e)}})();

/* ---------- where each map keeps its animals: [species, herds, min, max per herd] ---------- */
const HERDS={
 'Quarry Circuit':[['Donkey',2,2,3],['Alpaca',1,2,3],['Fox',1,1,2]],
 'Canyon Viaduct':[['Deer',2,2,4],['Wolf',1,2,3],['Donkey',1,2,2]],
 'Alpine Pass':[['Stag',2,2,3],['Alpaca',2,3,4],['Husky',1,2,2]],
 'Pinewood Stage':[['Cow',2,3,4],['Horse',1,2,3],['Bull',1,1,1],['ShibaInu',1,1,2]],
 'Redrock Stage':[['Horse',2,2,3],['Donkey',1,2,3],['Fox',1,1,2]],
 'Highmoor Stage':[['Alpaca',2,3,4],['Deer',1,2,3],['Husky',1,1,2]],
 'Coastal Run':[['Cow',2,3,4],['WhiteHorse',1,2,2],['Horse',1,2,2],['ShibaInu',1,1,1]],
 'Frostline Stage':[['Wolf',1,2,3],['Husky',1,2,2],['Stag',1,2,3],['Fox',1,1,2]],
 'Mangrove Ford':[['Cow',2,3,4],['Alpaca',1,2,3],['Horse',1,2,2]],
 'Terrace Run':[['Alpaca',2,3,4],['Donkey',1,2,2],['Stag',1,2,2]],
 'Ashfall Stage':[['Deer',2,2,3],['Wolf',1,2,2],['Fox',1,1,2]],
 'Autumn Ridge':[['Deer',1,2,3],['Stag',1,2,2],['Fox',1,1,2],['Horse',1,2,3]],
 'Road Atlanta':[['Horse',1,2,3],['WhiteHorse',1,2,2],['Cow',2,3,4]]};
let AN=null;/* animals of the race scene being played */
const rng=s=>{let a=s>>>0||1;return()=>((a=Math.imul(a^a>>>15,a|1),a^=a+Math.imul(a^a>>>7,a|61),((a^a>>>14)>>>0)/4294967296))};
function spawn(sc,T){AN=null;const plan=HERDS[T.d&&T.d.name];if(!plan||!P.animalsReady||(window.PTO&&window.PTO.animals===false))return;
 const N=T.N,r=rng(T.d.id*131+7),R=(a,b)=>a+(b-a)*r(),px=[],pz=[],ph=[];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,lo=1e9;
 for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i]);lo=Math.min(lo,T.y[i]);if(i%2===0){px.push(T.x[i]);pz.push(T.z[i]);ph.push(T.hw[i])}}
 const road=(x,z)=>{let b=1e9;for(let i=0;i<px.length;i++){const d=Math.hypot(x-px[i],z-pz[i])-ph[i];if(d<b)b=d}return b};
 const props=sc.userData.props||[],bn=P.barnInfo&&P.barnInfo();
 const ok=(x,z,rad)=>{const y=T.terr(x,z);if(T.d.sea&&y<lo-2)return null;if(T.d.harbor||T.d.flat)return null;
  let sl=0;for(const[dx,dz]of[[1.6,0],[-1.6,0],[0,1.6],[0,-1.6]])sl=Math.max(sl,Math.abs(T.terr(x+dx,z+dz)-y));if(sl>.7)return null;
  if(road(x,z)<rad)return null;for(const p of props)if(Math.hypot(p.x-x,p.z-z)<(p.fr||2)+2.5)return null;
  if(bn&&Math.hypot(bn.x-x,bn.z-z)<45)return null;
  for(let k=0;k<12;k++){const a=k*.5236;if(T.d.sea&&T.terr(x+Math.cos(a)*3,z+Math.sin(a)*3)<lo-2)return null}
  return y};
 const list=[];
 for(const[name,herds,mn,mx]of plan){const sp=SP[name];if(!sp)continue;
  for(let h=0;h<herds;h++){let cx,cz,cy=null;for(let t=0;t<200&&cy==null;t++){cx=R(x0-150,x1+150);cz=R(z0-150,z1+150);const d=road(cx,cz);if(d<26||d>150)continue;cy=ok(cx,cz,22)}
   if(cy==null)continue;const n=Math.round(R(mn,mx));
   for(let q=0;q<n;q++){let ax,az,ay=null;for(let t=0;t<12&&ay==null;t++){const a=R(0,6.283),rr=R(2,6);ax=cx+Math.cos(a)*rr;az=cz+Math.sin(a)*rr;ay=ok(ax,az,14)}
    if(ay==null)continue;
    const root=clone(sp),g=new THREE.Group();g.add(root);root.scale.setScalar(sp.k*R(.94,1.06));g.position.set(ax,ay,az);g.rotation.y=R(0,6.283);sc.add(g);
    root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.userData.shd=1}});
    const mx_=new THREE.AnimationMixer(root),act={};for(const c of sp.clips)act[c.name]=mx_.clipAction(c);
    const a0={g,root,mx:mx_,act,name,cx,cz,home:R(8,14),x:ax,z:az,yaw:g.rotation.y,st:'idle',cur:null,t:R(0,6),tx:ax,tz:az,run:RUN[name]||8,sp:sp,lod:0};
    play(a0,r()<.5?'Idle':'Eating',R(0,1));list.push(a0)}}}
 AN={list,T,sc,fr:0}}
function play(a,nm,off){const n=a.act[nm];if(!n||a.cur===nm)return;const o=a.act[a.cur];n.reset().setEffectiveWeight(1).play();if(off)n.time=off*n.getClip().duration;if(o&&o!==n)o.crossFadeTo(n,.25,false);a.cur=nm}
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{spawn(sc,T)}catch(e){console.warn('animals',e);AN=null}return sc};
const _p=new THREE.Vector3();
function tick(dt){if(!AN||!RACE||RACE.T!==AN.T||dt<=0)return;const T=AN.T,cars=RACE.cars.filter(c=>c.human);if(!cars.length)return;AN.fr++;
 for(const a of AN.list){let dn=1e9,nc=null;for(const c of cars){const d=Math.hypot(c.x-a.x,c.z-a.z);if(d<dn){dn=d;nc=c}}
  if(dn>320){a.g.visible=false;continue}a.g.visible=true;
  /* far animals animate at half rate; very far ones freeze */
  if(dn>170)continue;const step=dn>80?((AN.fr+a.lod)%2===0?dt*2:0):dt;if(!a.lod)a.lod=AN.list.indexOf(a)&1||2;
  const spd=nc?Math.hypot(nc.vx,nc.vz):0;
  /* bolt when a car is close (or loud and nearish) */
  if(a.st!=='flee'&&nc&&(dn<20||(dn<36&&spd>22))){a.st='flee';a.t=2.2+Math.random()*1.6;const ax=a.x-nc.x,az=a.z-nc.z,l=Math.hypot(ax,az)||1;a.tx=a.x+ax/l*40;a.tz=a.z+az/l*40}
  a.t-=step;
  if(a.st==='flee'){if(a.t<=0){a.st='idle';a.t=3+Math.random()*3}}
  else if(a.t<=0){if(a.st==='walk'||Math.random()<.45){a.st=Math.random()<.5?'idle':'graze';a.t=4+Math.random()*6}else{a.st='walk';a.t=3+Math.random()*4;const an=Math.random()*6.283,rr=Math.random()*a.home;a.tx=a.cx+Math.cos(an)*rr;a.tz=a.cz+Math.sin(an)*rr}}
  let v=0;if(a.st==='flee')v=a.run;else if(a.st==='walk')v=1.15*(a.sp.k*3.6);
  if(v>0){const dx=a.tx-a.x,dz=a.tz-a.z,l=Math.hypot(dx,dz);if(l<1&&a.st==='walk'){a.st='idle';a.t=3}
   else{const want=Math.atan2(dx,dz);let d=want-a.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));a.yaw+=d*Math.min(1,step*(a.st==='flee'?7:3));
    const nx=a.x+Math.sin(a.yaw)*v*step,nz=a.z+Math.cos(a.yaw)*v*step;
    /* never step onto the road */
    let rd=1e9;const ib=((T.N*((nx-T.x[0])*0))|0);{let bd=1e9;for(let i=0;i<T.N;i+=3){const q=Math.hypot(nx-T.x[i],nz-T.z[i])-T.hw[i];if(q<bd)bd=q}rd=bd}
    if(rd>6){a.x=nx;a.z=nz}else{a.st='idle';a.t=2}}}
  a.g.position.set(a.x,T.terr(a.x,a.z),a.z);a.g.rotation.y=a.yaw;
  play(a,a.st==='flee'?'Gallop':a.st==='walk'?'Walk':a.st==='graze'?'Eating':'Idle');
  if(a.cur==='Gallop')a.act.Gallop.timeScale=Math.max(.6,v/Math.max(4,a.run)*1.1);else if(a.cur==='Walk')a.act.Walk.timeScale=1;
  a.mx.update(step)}}
const stp=step;step=dt=>{stp(dt);try{tick(dt)}catch(e){if(!tick.err){tick.err=1;console.warn('animal tick',e)}}};
P.animals=()=>AN;
})();
