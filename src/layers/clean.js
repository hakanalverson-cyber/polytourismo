/* ===== Poly Tourismo v9 layer: world cleanup (start line, stray props) ===== */
(function v9clean(){
'use strict';
const P=window.PT8;
/* a proper chequered start line: fine grid that follows the real road surface, drawn over it */
function startLine(sc,T){
 const old=[];sc.children.forEach(o=>{const m=o.material;if(o.isMesh&&!o.isInstancedMesh&&m&&!Array.isArray(m)&&m.map&&m.map.image&&m.map.image.width===16&&m.map.image.height===2)old.push(o)});
 old.forEach(o=>sc.remove(o));
 const k=0,j=1,N=T.N,hw=Math.max(3,T.hw[k]);
 let fx=T.x[j]-T.x[k],fz=T.z[j]-T.z[k];const fl=Math.hypot(fx,fz)||1;fx/=fl;fz/=fl;const lx=fz,lz=-fx;
 const C=Math.max(8,Math.round(hw*2/1.1)),Rr=2,RS=4,pos=[],uv=[],idx=[],len=1.5;
 const cv=document.createElement('canvas');cv.width=C;cv.height=Rr;const c=cv.getContext('2d');
 for(let r=0;r<Rr;r++)for(let i=0;i<C;i++){c.fillStyle=(i+r)&1?'#f4f4f4':'#16161a';c.fillRect(i,r,1,1)}
 const tx=new THREE.CanvasTexture(cv);tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;
 const rows=Rr*RS;
 for(let r=0;r<=rows;r++){const a=(r/rows-.5)*len*Rr;for(let i=0;i<=C;i++){const l=(i/C-.5)*2*hw,x=T.x[k]+lx*l+fx*a,z=T.z[k]+lz*l+fz*a;
   const s=T.surf?T.surf(x,z,T.y[k]+3):null;let y=s&&s.road&&isFinite(s.h)?s.h:T.y[k]-l*T.bank[k];pos.push(x,y+.03,z);uv.push(i/C,r/rows)}}
 for(let r=0;r<rows;r++)for(let i=0;i<C;i++){const a=r*(C+1)+i,b=a+1,d=a+C+1,e=d+1;idx.push(a,d,b,b,d,e)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8}));m.userData.noChunk=1;m.frustumCulled=false;sc.add(m)}
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{startLine(sc,T)}catch(e){console.warn('startLine',e)}return sc};

/* ---------- night: windows glow, lamp posts with light pools, halos ---------- */
const WIN={value:0};
{const M=P.PROPKIT&&P.PROPKIT.MAT;if(M){M.onBeforeCompile=sh=>{sh.uniforms.uWin=WIN;sh.fragmentShader='uniform float uWin;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n float ptw=step(.62,vColor.b)*step(vColor.r,.56)*step(.55,vColor.g);\n totalEmissiveRadiance+=vec3(1.,.84,.5)*ptw*uWin;\n#endif')};M.customProgramCacheKey=()=>'ptwin1';M.needsUpdate=true}}
const glowTex=(rgb,hard)=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(hard||.25,`rgba(${rgb},.55)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(cv);return t};
let TXH=null,TXP=null;
function lamps(sc,T){
 TXH=TXH||glowTex('255,226,170',.18);TXP=TXP||glowTex('255,214,150',.35);
 const log=sc.userData.props||[],have=log.filter(p=>/^lamp/.test(p.n)),L=[];
 const grp=new THREE.Group();grp.visible=false;grp.userData.noChunk=1;sc.add(grp);sc.userData.lamps=grp;
 if(have.length){for(const p of have)L.push({x:p.x,y:(p.y||T.terr(p.x,p.z))+5.6,z:p.z,px:p.x,pz:p.z,py:(p.y||T.terr(p.x,p.z)),own:0})}
 else if(!T.d.gravel){const N=T.N,st=Math.max(2,Math.round(36/(T.sp||6)));let side=1;
  for(let i=Math.floor(st/2);i<N;i+=st){if((T.gap&&T.gap[i])||(T.tn&&T.tn[i])||(T.wall&&T.wall[i]&&!T.br[i]))continue;side=-side;const c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),lo=side*(T.hw[i]+3.2),x=T.x[i]+c*lo,z=T.z[i]-s*lo,y=T.br&&T.br[i]?T.y[i]-lo*T.bank[i]:T.terr(x,z);
   const li=side*(T.hw[i]+1.6),hx=T.x[i]+c*li,hz=T.z[i]-s*li;L.push({x:hx,y:y+6.2,z:hz,px:x,pz:z,py:y,own:1,rx:T.x[i]+c*side*T.hw[i]*.45,rz:T.z[i]-s*side*T.hw[i]*.45,ry:T.y[i]-side*T.hw[i]*.45*T.bank[i]+.07})}}
 if(!L.length)return;
 const dm=new THREE.Object3D(),own=L.filter(l=>l.own);
 if(own.length){const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.1,6.2,6),new THREE.MeshStandardMaterial({color:0x2a2f36,roughness:.7}),own.length),head=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,.14,.38),new THREE.MeshBasicMaterial({color:0xffe9bd}),own.length);
  own.forEach((l,i)=>{dm.position.set(l.px,l.py+3.1,l.pz);dm.rotation.set(0,0,0);dm.updateMatrix();pole.setMatrixAt(i,dm.matrix);dm.position.set(l.x,l.y,l.z);dm.rotation.y=Math.atan2(l.px-l.x,l.pz-l.z)+1.5708;dm.updateMatrix();head.setMatrixAt(i,dm.matrix)});
  pole.frustumCulled=head.frustumCulled=false;grp.add(pole,head)}
 /* halos: one Points draw call */
 const pp=[];L.forEach(l=>pp.push(l.x,l.y,l.z));const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));
 const hp=new THREE.Points(hg,new THREE.PointsMaterial({map:TXH,size:9,sizeAttenuation:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,color:0xffe0a8}));hp.frustumCulled=false;grp.add(hp);
 /* light pools on the road */
 const pools=L.filter(l=>l.own);if(pools.length){const pm=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:TXP,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,color:0xffc98a,opacity:.8,fog:false}),pools.length);
  pools.forEach((l,i)=>{dm.position.set(l.rx,l.ry,l.rz);dm.rotation.set(0,0,0);dm.scale.set(15,1,15);dm.updateMatrix();pm.setMatrixAt(i,dm.matrix)});dm.scale.set(1,1,1);pm.frustumCulled=false;grp.add(pm)}
}

/* ---------- Afterhours Loop: the box skyscrapers are replaced by the pack's buildings, scaled up into a proper skyline ---------- */
function city(sc,T){
 if(!(T.d&&T.d.city)||!P.BLD||!P.PROPKIT)return;
 const N=T.N,rx=[],rz=[],rh=[];for(let i=0;i<N;i+=2){rx.push(T.x[i]);rz.push(T.z[i]);rh.push(T.hw[i])}
 const near=(x,z)=>{let b=1e9;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i])-rh[i];if(d<b)b=d}return b};
 const nearest=(x,z)=>{let b=1e9,k=0;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i]);if(d<b){b=d;k=i}}return k};
 let seed=T.d.id*7919+11;const r=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const TOW=['CompanyBuilding_01','CompanyBuilding_02','CompanyBuilding_03','CompanyBuilding_04','CommercialBuilding_01','CommercialBuilding_02','ResidentBuilding_04','ResidentBuilding_05'],LOW=['ResidentBuilding_01','ResidentBuilding_02','ResidentBuilding_03','CommercialBuilding_03','StoreBuilding_01','ResidentBuilding_06'];
 const placed=[],log=sc.userData.props||[],out={};let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;rx.forEach((x,i)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,rz[i]);z1=Math.max(z1,rz[i])});
 const clear=(x,z,rad)=>{for(const q of placed)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+rad)return false;for(const p of log)if(Math.hypot(p.x-x,p.z-z)<(p.fr||2)+rad)return false;return true};
 const tryPlace=(list,sMin,sMax,dMin,dMax,tries,cnt,box)=>{let n=0;for(let t=0;t<tries&&n<cnt;t++){const x=x0-box+r()*(x1-x0+2*box),z=z0-box+r()*(z1-z0+2*box),d=near(x,z);if(d<dMin||d>dMax)continue;
   const nm=list[Math.floor(r()*list.length)],g=P.BLD[nm];if(!g)continue;const s=sMin+r()*(sMax-sMin),rad=Math.max(g.w,g.d)*s*.52+1.5;if(!clear(x,z,rad))continue;
   const k=nearest(x,z),yaw=Math.atan2(rx[k]-x,rz[k]-z),y=T.terr(x,z);placed.push([x,z,rad]);(out[nm]=out[nm]||[]).push([x,y,z,yaw,s]);log.push({n:nm,x,z,y,fr:rad,sk:.5,s});n++}return n};
 /* street wall: continuous front line of normal-size buildings along both sides, then a second row, then towers that grow with distance */
 const row=(list,sMin,sMax,off,gapMin,gapMax,keepRoad)=>{for(const side of[-1,1]){let nextS=0,acc=0,px=T.x[0],pz=T.z[0];for(let i=0;i<T.N;i+=1){acc+=Math.hypot(T.x[i]-px,T.z[i]-pz);px=T.x[i];pz=T.z[i];if(acc<nextS)continue;
   const nm=list[Math.floor(r()*list.length)],g=P.BLD[nm];if(!g)continue;const s=sMin+r()*(sMax-sMin),wd=Math.max(g.w,g.d)*s;
   const l=side*(T.hw[i]+off+wd*.5),c=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]),x=T.x[i]+c*l,z=T.z[i]-sn*l;
   if(near(x,z)<T.hw[i]+off*.8+wd*.35){acc=nextS-1;continue}
   if(!clear(x,z,wd*.42)){continue}
   const k=nearest(x,z),yaw=Math.atan2(rx[k]-x,rz[k]-z),y=T.terr(x,z);placed.push([x,z,wd*.42]);(out[nm]=out[nm]||[]).push([x,y,z,yaw,s]);log.push({n:nm,x,z,y,fr:wd*.42,sk:.5,s});
   nextS=acc+wd*.9+gapMin+r()*(gapMax-gapMin)}}};
 row(LOW,.8,1.1,13,1,4);
 row(LOW.concat(TOW.slice(4)),1.0,1.5,13+16,2,8);
 tryPlace(TOW,1.6,2.4,48,100,500,40,140);
 tryPlace(TOW,2.4,3.6,95,200,700,50,260);
 tryPlace(TOW,3.6,5.5,190,520,900,50,460);
 const dum=new THREE.Object3D(),col=new THREE.Color();
 for(const nm in out){const L=out[nm],im=new THREE.InstancedMesh(P.BLD[nm].g.clone(),P.PROPKIT.MAT,L.length);
  L.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.setScalar(q[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);const h=.55+r()*.35;col.setHSL(h,.18+r()*.25,.62+r()*.3);im.setColorAt(i,col)});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.userData.ptProp=nm;sc.add(im)}
 sc.userData.props=log}

/* ---------- ground cover: grass tufts, flowers and scrub so no meadow is bare ---------- */
const COVER={
 'Quarry Circuit':{t:[0x6fae5c,0x5e9c52,0x86c070,0x4f8f4a],f:[0xffe27a,0xffffff,0xf59ac0,0xb7a3f0],nt:2200,nf:700},
 'Highmoor Stage':{t:[0x8a9a58,0x73854e,0x9aa565,0x5f7a48],f:[0xe9a8ff,0xffe27a,0xffffff],nt:2200,nf:500},
 'Pinewood Stage':{t:[0x4f8a45,0x3f7a3d,0x5e9650],f:[0xffffff,0xffd27a],nt:2200,nf:300},
 'Coastal Run':{t:[0x78b06a,0x66a05c,0x8cbc78],f:[0xffe27a,0xffffff,0xf59ac0],nt:1800,nf:500},
 'Terrace Run':{t:[0x8fa24f,0x7a8f45,0xa6b05a],f:[0xe9c24a,0xffffff],nt:1700,nf:300},
 'Autumn Ridge':{t:[0xc8782a,0xb5622a,0xd69a3a,0x8a5a2a],f:[0xe8503a,0xf2b13a],nt:2200,nf:400},
 'Mangrove Ford':{t:[0x3f7f4a,0x2f6f40,0x56965a],f:[0xff7ab8,0xffffff],nt:1800,nf:400},
 'Canyon Viaduct':{t:[0xb98f55,0xa57c48,0xcfa66a],f:[],nt:1400,nf:0},
 'Redrock Stage':{t:[0xb1703a,0xa05f30,0xc98a50],f:[],nt:1400,nf:0},
 'Ashfall Stage':{t:[0x5a5350,0x6a625e],f:[],nt:900,nf:0},
 'Road Atlanta':{t:[0x6fae5c,0x5e9c52,0x86c070],f:[0xffffff,0xffe27a],nt:1800,nf:400},
 'Alpine Pass':{t:[0x7a8a78,0x66786a],f:[],nt:500,nf:0}};
function cover(sc,T){
 const cfg=COVER[T.d&&T.d.name];if(!cfg)return;const N=T.N,log=sc.userData.props||[];let lo=1e9;for(let i=0;i<N;i++)lo=Math.min(lo,T.y[i]);
 let seed=T.d.id*2654435+7;const r=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const spot=(maxL)=>{for(let t=0;t<8;t++){const i=Math.floor(r()*N),side=r()<.5?-1:1,l=side*(T.hw[i]+3+Math.pow(r(),1.25)*maxL),c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),x=T.x[i]+c*l,z=T.z[i]-s*l,y=T.terr(x,z);
   if(T.d.sea&&y<lo-1.5)continue;const sf=T.surf?T.surf(x,z,y+4):null;if(sf&&sf.road)continue;const bs=T.barnSite;if(bs&&Math.hypot(bs.x-x,bs.z-z)<30)continue;let bad=false;for(const p of log){if(Math.abs(p.x-x)<(p.fr||2)&&Math.abs(p.z-z)<(p.fr||2)){bad=true;break}}if(bad)continue;return[x,y,z]}return null};
 const dm=new THREE.Object3D(),col=new THREE.Color(),mk=(geo,n,pal,smin,smax,lift)=>{const pts=[];for(let q=0;q<n;q++){const p=spot(95);if(p)pts.push(p)}if(!pts.length)return;
  const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),pts.length);
  pts.forEach((p,i)=>{const sc_=smin+r()*(smax-smin);dm.position.set(p[0],p[1]+lift*sc_,p[2]);dm.rotation.set((r()-.5)*.25,r()*6.28,(r()-.5)*.25);dm.scale.set(sc_*(.8+r()*.5),sc_*(.7+r()*.8),sc_*(.8+r()*.5));dm.updateMatrix();im.setMatrixAt(i,dm.matrix);col.setHex(pal[Math.floor(r()*pal.length)]);col.offsetHSL(0,(r()-.5)*.06,(r()-.5)*.06);im.setColorAt(i,col)});
  im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.receiveShadow=false;sc.add(im)};
 /* (grass tufts read as grey cones under the hazy grade, so only the flowers and the dry-scrub variants are kept) */
 if(!cfg.nf)mk(new THREE.IcosahedronGeometry(.5,0),Math.round(cfg.nt*.35),cfg.t,1.0,1.9,.35);
 if(cfg.nf)mk(new THREE.OctahedronGeometry(.13,0),cfg.nf*2,cfg.f,1.1,1.9,.5)}
const bw0=buildWorld;buildWorld=function(T){const sc=bw0.apply(this,arguments);try{city(sc,T)}catch(e){console.warn('city',e)}try{cover(sc,T)}catch(e){console.warn('cover',e)}try{lamps(sc,T)}catch(e){console.warn('lamps',e)}return sc};
const at0=P.applyTod;P.applyTod=function(sc,T,key){const r=at0.apply(this,arguments);try{WIN.value=key==='night'?1.5:(key==='sunset'||key==='dawn')?.3:0;const g=sc&&sc.userData&&sc.userData.lamps;if(g)g.visible=key==='night'||key==='dawn'||key==='sunset'}catch(e){}return r};
})();
