/* ===== Poly Tourismo v9 layer: world cleanup (start line, stray props) ===== */
(function v9clean(){
'use strict';
const P=window.PT8;
/* minimal scrollbars everywhere (replaces the default browser bars) */
{const st=document.createElement('style');st.id='ptScroll';st.textContent='*{scrollbar-width:thin;scrollbar-color:rgba(170,195,190,.38) transparent}*::-webkit-scrollbar{width:5px;height:5px;background:transparent}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:rgba(170,195,190,.34);border-radius:5px;border:0}*::-webkit-scrollbar-thumb:hover{background:rgba(205,225,220,.62)}*::-webkit-scrollbar-corner{background:transparent}*::-webkit-scrollbar-button{display:none;width:0;height:0}';document.head.appendChild(st)}

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
   const s=T.surf?T.surf(x,z,T.y[k]+3):null;let y=s&&s.road&&isFinite(s.h)?s.h:T.y[k]-l*T.bank[k];pos.push(x,y+.1,z);uv.push(i/C,r/rows)}}
 for(let r=0;r<rows;r++)for(let i=0;i<C;i++){const a=r*(C+1)+i,b=a+1,d=a+C+1,e=d+1;idx.push(a,d,b,b,d,e)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-12,polygonOffsetUnits:-12}));m.userData.noChunk=1;m.frustumCulled=false;sc.add(m)}
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{startLine(sc,T)}catch(e){console.warn('startLine',e)}return sc};

/* ---------- night: windows glow, lamp posts with light pools, halos ---------- */
const WIN={value:0};
{const M=P.PROPKIT&&P.PROPKIT.MAT;if(M){M.onBeforeCompile=sh=>{sh.uniforms.uWin=WIN;sh.fragmentShader='uniform float uWin;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\n float ptw=step(.62,vColor.b)*step(vColor.r,.56)*step(.55,vColor.g);\n totalEmissiveRadiance+=vec3(1.,.84,.5)*ptw*uWin;\n#endif')};M.customProgramCacheKey=()=>'ptwin1';M.needsUpdate=true}}
const glowTex=(rgb,hard)=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,`rgba(${rgb},1)`);g.addColorStop(hard||.25,`rgba(${rgb},.55)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(cv);return t};
let TXH=null,TXP=null;
function lamps(sc,T){
 if(T.d&&(T.d.ring||T.d.ra||T.d.imola))return;/* the real circuits have no street lights */
 TXH=TXH||(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);[0,.04,.08,.14,.2,.3,.4,.5,.62,.75,.88,1].forEach(o=>g.addColorStop(o,`rgba(255,226,170,${(Math.exp(-o*o*9)*(1-o*o)*.9).toFixed(3)})`));c.fillStyle=g;c.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})();
 const N=T.N,K=P.PROPKIT,log=sc.userData.props||[],have=log.filter(p=>p.n==='lamp'&&isFinite(p.yaw)),L=[];
 const grp=new THREE.Group();grp.visible=false;grp.userData.noChunk=1;sc.add(grp);sc.userData.lamps=grp;
 const AX=3.7,HY=6.8;
 if(have.length){for(const p of have){const y=isFinite(p.y)?p.y:T.terr(p.x,p.z);L.push({hx:p.x+Math.sin(p.yaw)*AX,hy:y+HY,hz:p.z+Math.cos(p.yaw)*AX})}}
 else if(!T.d.gravel&&K&&P.lampParts){const st=Math.max(2,Math.round(40/(T.sp||6)));let side=1;const own=[];
  const HB=T.d.harbor&&T.hbr,hb=i=>HB&&((i>=HB.rest[0]&&i<=HB.rest[1])||HB.tuns.some(a=>i>=a[0]-1&&i<=a[1]+1)),inAl=i=>HB&&HB.alleys.some(a=>i>=a[0]&&i<=a[1]),onPier=i=>HB&&i>=HB.pier[0]&&i<=HB.pier[1];
  for(let i=Math.floor(st/2);i<N;i+=st){if(HB){if(hb(i))continue}else if((T.gap&&T.gap[i])||(T.tn&&T.tn[i])||(T.d.span&&T.sg&&T.sg[i]===3)||(!T.d.city&&!T.d.span&&T.wall&&T.wall[i]&&!(T.br&&T.br[i])))continue;side=-side;const c=Math.cos(T.psi[i]),s_=Math.sin(T.psi[i]),lo=side*(HB?(onPier(i)?T.hw[i]-.25:inAl(i)?T.hw[i]+1.1:T.hw[i]+3.4):T.lampOff?T.hw[i]+T.lampOff[i]:T.hw[i]+3.2),x=T.x[i]+c*lo,z=T.z[i]-s_*lo,y=HB?(inAl(i)?.2:onPier(i)?.09:.12)+T.y[i]:T.d.span?T.y[i]+(T.sg[i]===2?.12:0):T.br&&T.br[i]?T.y[i]-lo*T.bank[i]:T.terr(x,z),yaw=Math.atan2(-c*side,s_*side);
   own.push([x,y,z,yaw]);L.push({hx:x+Math.sin(yaw)*AX,hy:y+HY,hz:z+Math.cos(yaw)*AX})}
  if(own.length){const im=new THREE.InstancedMesh(K.mk(P.lampParts()),K.MAT,own.length),dm=new THREE.Object3D();const wc=new THREE.Color(1,1,1);own.forEach((q,i)=>{dm.position.set(q[0],q[1],q[2]);dm.rotation.set(0,q[3],0);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);im.setColorAt(i,wc)});im.frustumCulled=false;im.userData.ptProp='lamp';sc.add(im)}}
 if(!L.length)return;
 /* locate each lamp head over the road: nearest sample + signed lateral offset */
 const rx=[],rz=[],ri=[];for(let i=0;i<N;i+=1){rx.push(T.x[i]);rz.push(T.z[i]);ri.push(i)}
 for(const l of L){let b=1e9,k=0;for(let i=0;i<N;i++){const d=(rx[i]-l.hx)**2+(rz[i]-l.hz)**2;if(d<b){b=d;k=i}}l.k=k;const c=Math.cos(T.psi[k]),s_=Math.sin(T.psi[k]);l.lat=(l.hx-T.x[k])*c-(l.hz-T.z[k])*s_}
 sc.userData.lampPos=L.map(l=>[l.hx,l.hy,l.hz]);sc.userData.lampDbg=L.map(l=>[+l.lat.toFixed(1),+T.hw[l.k].toFixed(1),l.k]);
 /* halo sprite on each lamp head (small, so it never balloons up close) */
 const pp=[];L.forEach(l=>pp.push(l.hx,l.hy-.1,l.hz));const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));
 const hp=new THREE.Points(hg,new THREE.PointsMaterial({map:TXH,size:30,sizeAttenuation:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,color:0xffe0a8}));hp.frustumCulled=false;grp.add(hp);
 /* light pools: one merged sheet per lamp, built from the actual road samples so it follows grade, bank and curvature exactly; soft gaussian falloff via vertex colour */
 const pos=[],col=[],idx=[];let vi=0;const LX=20,LW=5,SX=(T.sp||3);
 for(const l of L){if(!(l.lat===l.lat)||Math.abs(l.lat)>T.hw[l.k]+1.5)continue;const jr=Math.max(2,Math.round(LX/SX)),rows=2*jr+1,cols=17,w=Math.min(T.hw[l.k]*1.15,8);
  for(let r=0;r<rows;r++){const j=((l.k-jr+r)%N+N)%N,c=Math.cos(T.psi[j]),s_=Math.sin(T.psi[j]),dx=(r-jr)*SX;
   for(let q=0;q<cols;q++){const lt=-w+2*w*q/(cols-1),dl=lt-l.lat,u=Math.min(1,Math.abs(dx)/LX),I=(.6*Math.exp(-(dx*dx/(2*3.4*3.4)+dl*dl/(2*2.8*2.8)))+.4*Math.exp(-(dx*dx/(2*8.5*8.5)+dl*dl/(2*5.5*5.5))))*Math.pow(1-u*u,2.4);
    pos.push(T.x[j]+c*lt,T.y[j]-lt*T.bank[j]+.045,T.z[j]-s_*lt);const v=I*.34;col.push(v,v*.78,v*.5)}}
  for(let r=0;r<rows-1;r++)for(let q=0;q<cols-1;q++){const a=vi+r*cols+q;idx.push(a,a+cols,a+1,a+1,a+cols,a+cols+1)}vi+=rows*cols}
 if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
  const pm=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:false}));pm.frustumCulled=false;grp.add(pm);sc.userData.lampPool=pm}
}
/* real light from the nearest lamps: a small fixed pool of point lights follows the lead car, and the car's blob shadow leans away from the closest lamp */
/* ---------- daytime skyline for the city backdrop (the original backdrop is a night silhouette that reads black in daylight) ---------- */
let dayTex=null;
function dayPano(){if(dayTex)return dayTex;const W=4096,H=512,hz=352,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');let sd=77;const r=()=>((sd=(sd*1664525+1013904223)>>>0)/4294967296);
 g.clearRect(0,0,W,H);
 const layers=[['#b9c9dc',.55,70,170,34,60],['#9fb2c9',.7,55,140,30,56],['#8497b2',.85,40,105,26,50]];
 for(const[c,al,hmin,hmax,wmin,wmax]of layers){let x=-20;while(x<W+40){const w=wmin+r()*(wmax-wmin),h=hmin+r()*(hmax-hmin);g.globalAlpha=al;g.fillStyle=c;g.fillRect(x,hz-h,w,h+4);
   g.globalAlpha=al*.55;g.fillStyle='#dfeaf6';for(let yy=hz-h+8;yy<hz-6;yy+=9)for(let xx=x+4;xx<x+w-5;xx+=8)if(r()<.38)g.fillRect(xx,yy,3,4);
   if(r()<.12){g.globalAlpha=al;g.fillStyle=c;g.fillRect(x+w*.5,hz-h-18,2,18)}x+=w+(r()<.3?2+r()*10:0)}}
 g.globalAlpha=1;const gr=g.createLinearGradient(0,hz-40,0,hz+30);gr.addColorStop(0,'rgba(207,224,242,0)');gr.addColorStop(1,'rgba(207,224,242,.95)');g.fillStyle=gr;g.fillRect(0,hz-40,W,H-hz+40);
 g.fillStyle='#c9d9ea';g.fillRect(0,hz+28,W,H-hz-28);
 dayTex=new THREE.CanvasTexture(cv);dayTex.encoding=THREE.sRGBEncoding;dayTex.wrapS=THREE.RepeatWrapping;dayTex.magFilter=dayTex.minFilter=THREE.LinearFilter;dayTex.generateMipmaps=false;return dayTex}
function setPano(sc,key){let m=null;sc.children.forEach(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===1300)m=o});if(!m||!m.material)return;
 const ud=m.userData;if(!ud.nightMap)ud.nightMap=m.material.map;
 if(key==='night'){m.material.map=ud.nightMap;m.material.color.setRGB(1,1,1)}else{m.material.map=dayPano();m.material.color.setRGB(...(key==='sunset'?[1,.78,.66]:key==='dawn'?[.95,.84,.82]:[1,1,1]))}
 m.material.needsUpdate=true}

const LTS=[];let lampSc=null;const NL=3;
function ensureLights(sc){if(LTS.length&&lampSc===sc)return;LTS.length=0;lampSc=sc;for(let i=0;i<NL;i++){const l=new THREE.PointLight(0xffd29a,0,58,1.5);l.userData.lampLight=1;l.userData.li=-1;sc.add(l);LTS.push(l)}}
/* lights keep their lamp until it falls out of range and has faded out, so nothing ever pops; intensity eases with distance */
function lampFrame(){const Rc=RACE;if(!Rc||!Rc.scene)return;const sc=Rc.scene,g=sc.userData&&sc.userData.lamps,pos=sc.userData&&sc.userData.lampPos;
 if(!g||!pos||!LTS.length||lampSc!==sc)return;const on=g.visible,c0=Rc.cars.find(c=>c.human)||Rc.cars[0];if(!c0)return;
 const R=62,near=[];for(let i=0;i<pos.length;i++){const d=Math.hypot(pos[i][0]-c0.x,pos[i][2]-c0.z);if(d<R)near.push([d,i])}near.sort((a,b)=>a[0]-b[0]);const want=near.slice(0,NL),wset=new Map(want.map(w=>[w[1],w[0]]));
 const used=new Set();for(const l of LTS)if(l.userData.li>=0&&wset.has(l.userData.li))used.add(l.userData.li);
 for(const l of LTS){const li=l.userData.li;
  if(li>=0&&wset.has(li)){continue}
  if(l.intensity<.03){const nx=want.find(w=>!used.has(w[1]));if(nx){l.userData.li=nx[1];used.add(nx[1]);const p=pos[nx[1]];l.position.set(p[0],p[1]-.4,p[2])}else l.userData.li=-1}}
 for(const l of LTS){const li=l.userData.li;let tgt=0;if(on&&li>=0&&wset.has(li)){const u=Math.max(0,1-wset.get(li)/R);tgt=4.4*u*u*(3-2*u)}l.intensity+=(tgt-l.intensity)*.1}
 }
function leanShadow(c){const Rc=RACE;if(!Rc||!Rc.scene)return;const sc=Rc.scene,g=sc.userData&&sc.userData.lamps,pos=sc.userData&&sc.userData.lampPos;if(!g||!g.visible||!pos||!c.m||!c.m.sh||!c.m.sh.visible)return;
 let bd=1e9,bi=-1;for(let i=0;i<pos.length;i++){const d=Math.hypot(pos[i][0]-c.x,pos[i][2]-c.z);if(d<bd){bd=d;bi=i}}if(bi<0||bd>30)return;
 const dx=c.x-pos[bi][0],dz=c.z-pos[bi][2],dl=Math.hypot(dx,dz)||1,k=Math.min(1,bd/6)*(1-bd/30)*1.5+.2,sh=c.m.sh;sh.position.x+=dx/dl*k;sh.position.z+=dz/dl*k;sh.rotation.z=Math.atan2(dx,dz);sh.scale.x*=1+k*.5;sh.scale.y*=1+k*.2}

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
 row(LOW,.8,1.1,12,.5,2.5);
 row(LOW.concat(TOW.slice(4)),1.0,1.4,12+14,1,4);
 row(LOW.concat(TOW),1.3,1.9,12+14+22,1,5);
 /* grass: verge strips beside the road and lawns, from the pack's GrassLand tile */
 if(P.BLD.GrassLand_Plain){const GL='GrassLand_Plain',gs=2.3,gt=gs*5;
  /* verge: one continuous grass ribbon per side (no overlapping tiles), broken wherever the road is a bridge, tunnel or crossing */
  {const pos=[],col=[],idx=[],c0=new THREE.Color(),W0=3.4,W1=11.5;let vi=0,open=false;
   for(const side of[-1,1]){open=false;for(let i=0;i<T.N;i++){const bad=(T.gap&&T.gap[i])||(T.br&&T.br[i])||(T.tn&&T.tn[i]);const c=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]);let xa,za,xb,zb;
     if(!bad){const la=side*(T.hw[i]+W0),lb=side*(T.hw[i]+W1);xa=T.x[i]+c*la;za=T.z[i]-sn*la;xb=T.x[i]+c*lb;zb=T.z[i]-sn*lb;if(near(xb,zb)<T.hw[i]+W1*.55)open=open&&false,xa=null}
     if(bad||xa===null){open=false;continue}
     const ya=T.terr(xa,za)+.06,yb=T.terr(xb,zb)+.06,j=(Math.sin(i*.9)+Math.sin(i*.37+side))*.05;c0.setHSL(.29+j*.2,.42,.34+j);pos.push(xa,ya,za,xb,yb,zb);col.push(c0.r,c0.g,c0.b,c0.r*.92,c0.g*.92,c0.b*.92);
     if(open){const q=vi-2;idx.push(q,q+1,vi,q+1,vi+1,vi);if(side>0)idx.push(),0}
     open=true;vi+=2}}
   if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.frustumCulled=false;m.receiveShadow=false;sc.add(m)}
   /* street trees and hedges along the verge */
   const ST=['Tree_02','Tree_04','Tree_05','Tree_07'].filter(n=>P.BLD[n]),HB=['Bush_01','Bush_02'].filter(n=>P.BLD[n]);let acc=0;
   for(const side of[-1,1])for(let i=0;i<T.N;i+=3){if((T.gap&&T.gap[i])||(T.br&&T.br[i])||(T.tn&&T.tn[i]))continue;const c=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]);
    if(ST.length&&i%9===(side>0?0:4)){const l=side*(T.hw[i]+W0+3+r()*3),x=T.x[i]+c*l,z=T.z[i]-sn*l;if(near(x,z)>T.hw[i]+W0+1.5&&clear(x,z,1.2)){const nm=ST[Math.floor(r()*ST.length)],sc_=1.0+r()*.6;(out[nm]=out[nm]||[]).push([x,T.terr(x,z),z,r()*6.28,sc_,1]);placed.push([x,z,1.2])}}
    if(HB.length&&i%3===0&&r()<.8){const l=side*(T.hw[i]+W0+.9),x=T.x[i]+c*l,z=T.z[i]-sn*l;if(near(x,z)>T.hw[i]+W0*.5){const nm=HB[Math.floor(r()*HB.length)];(out[nm]=out[nm]||[]).push([x,T.terr(x,z),z,r()*6.28,1.0+r()*.5,1])}}}}
  const lawn=(cx,cz,R)=>{for(let gx=-R;gx<=R;gx+=gt*.9)for(let gz=-R;gz<=R;gz+=gt*.9){const x=cx+gx,z=cz+gz;if(Math.hypot(gx,gz)>R||near(x,z)<T.hw[nearest(x,z)]+3)continue;(out[GL]=out[GL]||[]).push([x,T.terr(x,z),z,r()*6.28,gs,1])}};
  P._lawn=lawn}
 /* parks: small forests between the blocks */
 const TREES=['Tree_02','Tree_04','Tree_05','Tree_07','Bush_01','Bush_02'].filter(n=>P.BLD[n]);
 if(TREES.length){const nP=40;let pk=0;for(let t=0;t<900&&pk<nP;t++){const cx=x0-80+r()*(x1-x0+160),cz=z0-80+r()*(z1-z0+160),d=near(cx,cz);if(d<26||d>170||!clear(cx,cz,16))continue;
   const R_=18+r()*22,n=26+Math.floor(r()*30);placed.push([cx,cz,R_*.55]);if(P._lawn)P._lawn(cx,cz,R_*.9);if(r()<.3&&P.BLD.WaterLand_05){(out.WaterLand_05=out.WaterLand_05||[]).push([cx,T.terr(cx,cz)-.15,cz,r()*6.28,1.5,0])}let c=0;for(let q=0;q<n*3&&c<n;q++){const a=r()*6.283,rr=Math.sqrt(r())*R_,x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;if(near(x,z)<T.hw[nearest(x,z)]+9)continue;let bad=false;for(const p of log)if(p.n.indexOf('Tree')<0&&p.n.indexOf('Bush')<0&&Math.hypot(p.x-x,p.z-z)<(p.fr||2)+1.5){bad=true;break}if(bad)continue;
     const nm=TREES[Math.floor(r()*TREES.length)],big=nm.indexOf('Tree')==0,sc_=big?1.0+r()*.8:1.1+r()*.6;(out[nm]=out[nm]||[]).push([x,T.terr(x,z),z,r()*6.28,sc_,1]);log.push({n:nm,x,z,y:0,fr:1.4,sk:.3,s:sc_});c++}pk++}}
 /* pack-themed lots: community gardens (FarmLand grid + greenhouse + fences + crates), well plazas and fenced ponds */
 {const B=P.BLD,add_=(nm,x,z,yaw,sc_,y)=>{if(!B[nm])return;(out[nm]=out[nm]||[]).push([x,y===undefined?T.terr(x,z):y,z,yaw,sc_,2]);},
  fence=(cx,cz,R,gap,sf)=>{const len=3*sf,n=Math.max(8,Math.floor(6.283*R/len));for(let k=0;k<n;k++){const a=k/n*6.283;if(Math.abs(((a-gap+9.42)%6.283)-3.14)>3.14-.22)continue;const x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R;if(near(x,z)<T.hw[nearest(x,z)]+5)continue;(add_('WoodFence_02',x,z,-(a+1.5708),sf),P.addSeg&&P.addSeg(T,x+Math.sin(a)*1.5*sf,z-Math.cos(a)*1.5*sf,x-Math.sin(a)*1.5*sf,z+Math.cos(a)*1.5*sf,.2))}},
  FL=Object.keys(B).filter(n=>/^FarmLand_/.test(n));
  let lots=0;for(let t=0;t<1500&&lots<34;t++){const cx=x0-90+r()*(x1-x0+180),cz=z0-90+r()*(z1-z0+180),d=near(cx,cz);if(d<24||d>150||!clear(cx,cz,17))continue;const kind=lots%3,R=kind===0?15:kind===1?11:12;
   placed.push([cx,cz,R+2]);lots++;const gap=Math.atan2(rz[nearest(cx,cz)]-cz,rx[nearest(cx,cz)]-cx);
   if(P._lawn)P._lawn(cx,cz,R+3);
   if(kind===0&&FL.length){for(let gx=-1;gx<=0;gx++)for(let gz=-1;gz<=0;gz++){const x=cx+gx*8.4+4.2-3,z=cz+gz*8.4+4.2-3;add_(FL[Math.floor(r()*FL.length)],x,z,Math.floor(r()*4)*1.5708,1.6)}
    add_('GreenMouse',cx+R*.55*Math.cos(gap+3.14),cz+R*.55*Math.sin(gap+3.14),gap+1.57,1.1);add_('WoodenCrates_01',cx+R*.5,cz-R*.3,r()*6,1.3);add_('WoodenCrates_01',cx+R*.55,cz-R*.18,r()*6,1.1);add_('Haystack_04',cx-R*.5,cz+R*.4,r()*6,1.3);add_('Well_02',cx+3,cz+R*.45,0,1.3);fence(cx,cz,R,gap,1.35)}
   else if(kind===1){add_('Well_02',cx,cz,0,2.2);for(let q=0;q<5;q++){const a=q/5*6.283+r();add_(['Bush_01','Bush_02'][q&1],cx+Math.cos(a)*5,cz+Math.sin(a)*5,r()*6,1.6)}add_('WoodenCrates_01',cx+3.4,cz+2,r()*6,1.3);add_('AnimalFeeder_01',cx-4.5,cz+1,r()*6,1.4);for(let q=0;q<4;q++){const a=q/4*6.283+.7;add_(['Tree_02','Tree_04','Tree_05','Tree_07'][q],cx+Math.cos(a)*9,cz+Math.sin(a)*9,r()*6,1.3)}fence(cx,cz,R,gap,1.1)}
   else{add_('WaterLand_05',cx,cz,r()*6,1.8,T.terr(cx,cz)-.12);for(let q=0;q<9;q++){const a=q/9*6.283+r()*.4;add_(['Bush_01','Bush_02','Tree_04','Tree_02'][q&3],cx+Math.cos(a)*(6.5+r()*2),cz+Math.sin(a)*(6.5+r()*2),r()*6,q&2?1.3:1.5)}add_('AnimalFeeder_01',cx+7,cz-4,.6,1.3);fence(cx,cz,R,gap,1.2)}
   for(const nm of['Tree_02'])void 0;
  }}
 tryPlace(TOW,1.6,2.4,60,110,700,70,140);
 tryPlace(TOW,2.4,3.6,100,210,900,80,260);
 tryPlace(TOW,3.6,5.5,200,520,1200,70,460);
 const dum=new THREE.Object3D(),col=new THREE.Color();
 for(const nm in out){const L=out[nm],im=new THREE.InstancedMesh(P.BLD[nm].g.clone(),P.PROPKIT.MAT,L.length);
  L.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.set(q[4],q[6]||q[4],q[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);if(q[5]===2){col.setRGB(1,1,1)}else if(q[5]){col.setHSL(.27+r()*.08,.35,.78+r()*.2)}else{const h=.55+r()*.35;col.setHSL(h,.18+r()*.25,.62+r()*.3)}im.setColorAt(i,col)});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.userData.ptProp=nm;sc.add(im)}
 sc.userData.props=log}


/* ---------- Afterhours tunnel: drop the big window slab, build a lit concrete underpass with towers over it ---------- */
function tunnel(sc,T){
 if(!(T.d&&T.d.city)||!T.tunnels||!T.tunnels.length)return;const N=T.N;
 const kill=[];sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.height===26&&o.material&&o.material.emissiveMap)kill.push(o)});kill.forEach(o=>o.parent.remove(o));const seen=new Set();sc.traverse(o=>{const m=o.material;if(o.isMesh&&m&&!seen.has(m)&&m.isMeshStandardMaterial&&m.side===THREE.DoubleSide&&m.color.getHex()===0x3a3a46){seen.add(m);m.color.setHex(0x2c3044);m.emissive=new THREE.Color(0x0d1020);m.needsUpdate=true}});

 /* lit side walls: panelled concrete from the kerb up to the roof, so the underpass is never a black void */
 for(const[a,b]of T.tunnels){for(const sd of[-1,1]){const pos=[],col=[],idx=[],c=new THREE.Color();let vi=0;
   for(let k=a;k<=b;k++){const i=k%N,cs=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]),l=sd*(T.hw[i]+.15),x=T.x[i]+cs*l,z=T.z[i]-sn*l,y0=T.y[i]-l*T.bank[i]-.2,seam=(k%8===0)?.55:1;
    pos.push(x,y0,z,x,y0+8,z);c.setRGB(.022*seam,.024*seam,.04*seam);col.push(c.r,c.g,c.b);c.setRGB(.06*seam,.062*seam,.09*seam);col.push(c.r,c.g,c.b);
    if(k>a){const q=vi-2;idx.push(q,q+1,vi,q+1,vi+1,vi)}vi+=2}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));m.frustumCulled=false;sc.add(m)}}

 /* warm light pools on the carriageway under each ceiling light */
 {TXP=TXP||glowTex('255,214,150',.35);const pl=[];for(const[a,b]of T.tunnels)for(let k=a+2;k<=b-2;k+=5){const i=k%N;pl.push([T.x[i],T.y[i]+.1,T.z[i],T.psi[i],T.hw[i]*2.6])}
  if(pl.length){const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:TXP,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6,color:0xffc98a,opacity:.28,fog:false}),pl.length);
   const dm2=new THREE.Object3D();pl.forEach((q,i)=>{dm2.position.set(q[0],q[1],q[2]);dm2.rotation.set(0,q[3],0);dm2.scale.set(q[4],1,q[4]*1.2);dm2.updateMatrix();im.setMatrixAt(i,dm2.matrix)});im.frustumCulled=false;sc.add(im)}}
 const cy=new THREE.BoxGeometry(.22,.22,3.2),cols=[0xffe2a8,0xffc878],ms=cols.map(c=>new THREE.MeshBasicMaterial({color:c,fog:false})),L=[[],[]];
 const slab=new THREE.MeshStandardMaterial({color:0x3a3d4c,roughness:.9,flatShading:true}),pil=new THREE.MeshStandardMaterial({color:0x5a5f70,roughness:.9});
 const dum=new THREE.Object3D(),slabs=[],pils=[];
 for(const[a,b]of T.tunnels){
  for(let k=a;k<=b;k+=3){const i=k%N,c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),m=(k/3|0)&1;
   for(const sd of[-1,1]){const l=sd*(T.hw[i]+.35);L[m].push([T.x[i]+c*l,T.y[i]+5.6-l*T.bank[i],T.z[i]-s*l,T.psi[i]])}
   const l2=0;L[1-m].push([T.x[i],T.y[i]+7.35,T.z[i],T.psi[i]])}
  /* pillars + cross-beams every 18 samples */
  for(let k=a;k<=b;k+=18){const i=k%N,c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]);for(const sd of[-1,1]){const l=sd*(T.hw[i]+1.2);pils.push([T.x[i]+c*l,T.y[i]+4,T.z[i]-s*l,T.psi[i]])}slabs.push([T.x[i],T.y[i]+7.9,T.z[i],T.psi[i],T.hw[i]*2+3.4])}
  /* pack buildings straddling the roof */
  const log=sc.userData.props||[],names=['CompanyBuilding_01','CompanyBuilding_02','CompanyBuilding_03','CompanyBuilding_04','CommercialBuilding_01','ResidentBuilding_04'].filter(n=>P.BLD[n]);
  const out={};let sd0=T.d.id*31+5;const r=()=>((sd0=(sd0*1664525+1013904223)>>>0)/4294967296);
  for(let k=a+8;k<b-8;k+=34){const i=k%N,nm=names[Math.floor(r()*names.length)],sc_=1.1+r()*.5;(out[nm]=out[nm]||[]).push([T.x[i],T.y[i]+7.9+2.6*sc_,T.z[i],T.psi[i]+(r()<.5?0:Math.PI),sc_]);log.push({n:nm,x:T.x[i],z:T.z[i],y:T.y[i],fr:12,sk:.5,s:sc_})}
  for(const nm in out){const g=P.BLD[nm],L2=out[nm],im=new THREE.InstancedMesh(g.g.clone(),P.PROPKIT.MAT,L2.length),col=new THREE.Color();L2.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.setScalar(q[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);col.setHSL(.55+r()*.3,.2+r()*.2,.7+r()*.25);im.setColorAt(i,col)});im.frustumCulled=false;sc.add(im)}
 }
 const mk=(geo,mat,arr,fn)=>{if(!arr.length)return;const im=new THREE.InstancedMesh(geo,mat,arr.length);arr.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.set(1,1,1);if(fn)fn(q);dum.updateMatrix();im.setMatrixAt(i,dum.matrix)});im.frustumCulled=false;sc.add(im)};
 L.forEach((arr,i)=>mk(cy,ms[i],arr));
 mk(new THREE.BoxGeometry(1.1,8,1.1),pil,pils);
 if(slabs.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.7,1.2),slab,slabs.length);slabs.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.set(q[4],1,1);dum.updateMatrix();im.setMatrixAt(i,dum.matrix)});im.frustumCulled=false;sc.add(im)}
}

/* ---------- rural lots for every non-city map: farm plots, ranch yards, orchards and ponds built from the pack, rooted on level ground, clear of the road and barn ---------- */
const LOTS={'Quarry Circuit':[12,'fpwo'],'Canyon Viaduct':[5,'wh'],'Alpine Pass':[6,'wh'],'Coastal Run':[9,'fpwo'],'Pinewood Stage':[9,'fwoh'],'Redrock Stage':[5,'wh'],'Highmoor Stage':[9,'fwoh'],'Terrace Run':[12,'fpo'],'Autumn Ridge':[9,'fwoh'],'Mangrove Ford':[6,'pwo'],'Frostline Stage':[5,'wh']};/* the real circuits have no farm yards in their woods */
function lotsAll(sc,T){
 const cfg=LOTS[T.d&&T.d.name];if(!cfg||T.d.city||!P.BLD)return;const B=P.BLD,N=T.N;
 const rx=[],rz=[],rh=[],rf=[];for(let i=0;i<N;i+=2){rx.push(T.x[i]);rz.push(T.z[i]);rh.push(T.hw[i]);rf.push((T.gap&&T.gap[i])||(T.br&&T.br[i])||(T.tn&&T.tn[i])||(T.wall&&T.wall[i])?1:0)}
 const near=(x,z)=>{let b=1e9;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i])-rh[i];if(d<b)b=d}return b};
 const nearest=(x,z)=>{let b=1e9,k=0;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i]);if(d<b){b=d;k=i}}return k};
 let seed=T.d.id*40503+17;const r=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;rx.forEach((x,i)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,rz[i]);z1=Math.max(z1,rz[i])});
 let lo=1e9;for(let i=0;i<N;i++)lo=Math.min(lo,T.y[i]);
 const log=sc.userData.props||[],placed=[],out={},bs=T.barnSite;
 const clear=(x,z,rad)=>{for(const q of placed)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+rad)return false;for(const p of log)if(Math.hypot(p.x-x,p.z-z)<(p.fr||2)+rad)return false;return true};
 const add_=(nm,x,z,yaw,sc_,sink)=>{if(!B[nm])return;(out[nm]=out[nm]||[]).push([x,T.terr(x,z)-(sink||0),z,yaw,sc_,2])};
 const fence=(cx,cz,R,gap,sf)=>{const len=3*sf,n=Math.max(8,Math.floor(6.283*R/len));for(let k=0;k<n;k++){const a=k/n*6.283;if(Math.abs(((a-gap+9.42)%6.283)-3.14)>3.14-.2)continue;const x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R;if(near(x,z)<6)continue;(add_('WoodFence_02',x,z,-(a+1.5708),sf,.1),P.addSeg&&P.addSeg(T,x+Math.sin(a)*1.5*sf,z-Math.cos(a)*1.5*sf,x-Math.sin(a)*1.5*sf,z+Math.cos(a)*1.5*sf,.2))}};
 const FL=Object.keys(B).filter(n=>/^FarmLand_/.test(n)),TR=['Tree_02','Tree_04','Tree_05','Tree_07'].filter(n=>B[n]);
 let n=0;const want=cfg[0],kinds=cfg[1];
 for(let t=0;t<2500&&n<want;t++){const k=kinds[n%kinds.length],R=k==='f'?14:k==='h'?13:k==='o'?15:11,i=Math.floor(r()*rx.length),side=r()<.5?-1:1,off=rh[i]+R+7+r()*60,c=Math.cos(T.psi[i*2]),sn=Math.sin(T.psi[i*2]),cx=rx[i]+c*side*off,cz=rz[i]-sn*side*off;
  if(near(cx,cz)<R+6||!clear(cx,cz,R+2))continue;if(bs&&Math.hypot(bs.x-cx,bs.z-cz)<R+38)continue;
  let bad=false;for(let q=-8;q<=8&&!bad;q++){const j=(nearest(cx,cz)+q+rx.length)%rx.length;if(rf[j]&&Math.hypot(rx[j]-cx,rz[j]-cz)<R+40)bad=true}if(bad)continue;
  const h0=T.terr(cx,cz);if(T.d.sea&&h0<lo-1.5)continue;let mn=1e9,mx=-1e9;for(let a=0;a<6;a++){const h=T.terr(cx+Math.cos(a)*R*.8,cz+Math.sin(a)*R*.8);mn=Math.min(mn,h);mx=Math.max(mx,h)}if(mx-mn>2.4)continue;
  if(T.fords&&T.fords.some(f=>Math.hypot(T.x[f.i%N]-cx,T.z[f.i%N]-cz)<R+70))continue;
  const kk=nearest(cx,cz),gap=Math.atan2(rz[kk]-cz,rx[kk]-cx),face=Math.atan2(rx[kk]-cx,rz[kk]-cz);placed.push([cx,cz,R+1]);log.push({n:'lot',x:cx,z:cz,y:h0,fr:R+1,sk:0,s:1});n++;
  if(k==='f'&&FL.length){for(let gx=0;gx<2;gx++)for(let gz=0;gz<3;gz++)add_(FL[Math.floor(r()*FL.length)],cx+(gx-.5)*8.4,cz+(gz-1)*8.4,Math.floor(r()*4)*1.5708,1.6);fence(cx,cz,R,gap,1.35);add_('GreenMouse',cx-R*.8*Math.cos(gap),cz-R*.8*Math.sin(gap),face,1.0);add_('WoodenCrates_01',cx+R*.55,cz-R*.4,r()*6,1.3);add_('Haystack_04',cx-R*.5,cz+R*.55,r()*6,1.4);add_('Well_02',cx+R*.6,cz+R*.5,0,1.3)}
  else if(k==='p'&&B.WaterLand_05){add_('WaterLand_05',cx,cz,r()*6,2.2,.14);for(let q=0;q<10;q++){const a=q/10*6.283+r()*.3;add_(['Bush_01','Bush_02','Tree_04','Tree_02'][q&3],cx+Math.cos(a)*(7.5+r()*2),cz+Math.sin(a)*(7.5+r()*2),r()*6,q&2?1.4:1.6)}add_('AnimalFeeder_01',cx+8.5,cz-3,.6,1.3);fence(cx,cz,R,gap,1.2)}
  else if(k==='w'){add_('Well_02',cx,cz,0,2.2);add_('WoodenCrates_01',cx+3.5,cz+2,r()*6,1.3);add_('WoodenCrates_01',cx+4.6,cz+3,r()*6,1.1);add_('AnimalFeeder_01',cx-4.5,cz+1,r()*6,1.4);add_('Haystack_01',cx-3,cz-4,r()*6,1.5);add_('Haystack_04',cx+4,cz-4.5,r()*6,1.4);for(let q=0;q<4;q++){const a=q/4*6.283+.7;add_(TR[q%TR.length],cx+Math.cos(a)*8.5,cz+Math.sin(a)*8.5,r()*6,1.2)}fence(cx,cz,R,gap,1.1)}
  else if(k==='h'){const bx=cx-Math.cos(gap)*R*.2,bz=cz-Math.sin(gap)*R*.2;add_('FarmerHouse',bx,bz,face,1.1,.5);add_('ChickenCoop',cx+Math.sin(face)*-6+Math.cos(face)*6,cz+Math.cos(face)*-6-Math.sin(face)*6,face+.5,1.2,.2);add_('Silo_01',cx-6,cz+5,0,1.2,.3);add_('Silo_02',cx-8.5,cz+4,0,1.2,.3);add_('Outhouses',cx+7,cz+6,face,1.3,.2);add_('Haystack_04',cx+6,cz-6,r()*6,1.4);add_('WoodenCrates_01',cx+3,cz+7,r()*6,1.2);add_('Well_02',cx-4,cz-7,0,1.3);for(let q=0;q<5;q++){const a=q/5*6.283+.4;add_(TR[q%TR.length],cx+Math.cos(a)*(R+2),cz+Math.sin(a)*(R+2),r()*6,1.3)}fence(cx,cz,R,gap,1.3)}
  else if(k==='o'){for(let gx=-1;gx<=1;gx++)for(let gz=-1;gz<=1;gz++){if(!gx&&!gz){add_('Well_02',cx,cz,0,1.6);continue}add_(TR[(gx+gz+2)%TR.length],cx+gx*6+(r()-.5)*1.5,cz+gz*6+(r()-.5)*1.5,r()*6,1.1+r()*.4)}add_('Haystack_02',cx+8.5,cz+5,r()*6,1.4);fence(cx,cz,R,gap,1.3)}
 }
 const dum=new THREE.Object3D(),col=new THREE.Color();
 for(const nm in out){const L=out[nm],im=new THREE.InstancedMesh(B[nm].g.clone(),P.PROPKIT.MAT,L.length);L.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.setScalar(q[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);col.setRGB(1,1,1);im.setColorAt(i,col)});im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.userData.ptProp=nm;sc.add(im)}
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
 'Imola':{t:[0x6fae5c,0x5e9c52,0x86c070],f:[0xffffff,0xffe27a],nt:700,nf:200},
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

/* ---------- Harbor Lights: a proper harbour town of pack buildings around the docks ---------- */
function harborTown(sc,T){
 if(!(T.d&&T.d.harbor)||!P.BLD||!P.PROPKIT)return;
 const N=T.N,rx=[],rz=[],rh=[];for(let i=0;i<N;i+=2){rx.push(T.x[i]);rz.push(T.z[i]);rh.push(T.hw[i])}
 const near=(x,z)=>{let b=1e9;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i])-rh[i];if(d<b)b=d}return b};
 const nearest=(x,z)=>{let b=1e9,k=0;for(let i=0;i<rx.length;i++){const d=Math.hypot(x-rx[i],z-rz[i]);if(d<b){b=d;k=i}}return k};
 const WATER=(x,z)=>(x>215&&z>5)||z>315,land=(x,z,m)=>!WATER(x,z)&&!WATER(x+m,z)&&!WATER(x-m,z)&&!WATER(x,z+m)&&!WATER(x,z-m);
 let seed=991,r=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const occ=(sc.userData.occ||[]).slice(),log=sc.userData.props||(sc.userData.props=[]),out={};
 const clear=(x,z,rad)=>{for(const q of occ)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+rad)return false;return true};
 const LOW=['CommercialBuilding_03','CommercialBuilding_02','ResidentBuilding_04'],
  MID=['CommercialBuilding_01','CommercialBuilding_02','ResidentBuilding_04','CompanyBuilding_03','CompanyBuilding_04'],TOW=['CompanyBuilding_01','CompanyBuilding_02','CompanyBuilding_03','CompanyBuilding_04'],
  SHED=[];
 const place=(list,sMin,sMax,dMin,dMax,tries,cnt,grid)=>{let n=0;for(let t=0;t<tries&&n<cnt;t++){let x=-660+r()*1320,z=-660+r()*1320;x=Math.round(x/grid)*grid+(r()-.5)*grid*.7;z=Math.round(z/grid)*grid+(r()-.5)*grid*.7;if(!land(x,z,14))continue;const d=near(x,z);if(d<dMin+r()*r()*(dMax-dMin)*.5||d>dMax)continue;
   const nm=list[Math.floor(r()*list.length)],g=P.BLD[nm];if(!g)continue;const s=sMin+Math.pow(r(),1.4)*(sMax-sMin),rad=Math.max(g.w,g.d)*s*.5+1.2+r()*r()*8;if(!clear(x,z,rad))continue;const sy=.85+r()*.5;
   const k=nearest(x,z),yaw=Math.round(Math.atan2(rx[k]-x,rz[k]-z)/(Math.PI/2))*Math.PI/2+(r()<.3?(r()-.5)*.35:0);occ.push([x,z,rad]);(out[nm]=out[nm]||[]).push([x,.02,z,yaw,s,0,sy]);log.push({n:nm,x,z,y:.02,fr:rad,sk:.5,s});n++}return n};
 /* low-rise streets near the quay, mid-rise behind, towers on the far ring; everything on a lattice and square to the street */
 /* the street walls near the road are assembled in harbor.js; only the far tower ring is placed here */
 /* trees and hedges between the blocks */
 const TR=['Tree_02','Tree_04','Tree_05','Tree_07'].filter(n=>P.BLD[n]);
 for(let t=0,n=0;t<1500&&n<0;t++){const x=-660+r()*1320,z=-660+r()*1320;if(!land(x,z,8)||near(x,z)<12)continue;if(!clear(x,z,2))continue;const nm=TR[Math.floor(r()*TR.length)];(out[nm]=out[nm]||[]).push([x,.02,z,r()*6.28,1.1+r()*.7,1]);occ.push([x,z,1.6])}
 const dum=new THREE.Object3D(),col=new THREE.Color();
 for(const nm in out){const L=out[nm],im=new THREE.InstancedMesh(P.BLD[nm].g.clone(),P.PROPKIT.MAT,L.length);
  L.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.set(q[4],q[4]*(q[6]||1),q[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);if(q[5]===1){col.setHSL(.27+r()*.08,.35,.78+r()*.2)}else{const PAL=[[.07,.28,.62],[.09,.22,.74],[.06,.3,.5],[.58,.1,.72],[.12,.18,.78],[.0,.04,.66],[.1,.14,.58]],ck=(Math.floor(q[0]/110)*73856093^Math.floor(q[2]/110)*19349663)>>>0,pk=PAL[r()<.55?ck%PAL.length:Math.floor(r()*PAL.length)];col.setHSL(pk[0]+(r()-.5)*.03,pk[1],pk[2]+(r()-.5)*.1)}im.setColorAt(i,col)});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.userData.ptProp=nm;sc.add(im)}
}
const bw0=buildWorld;buildWorld=function(T){const sc=bw0.apply(this,arguments);try{city(sc,T)}catch(e){console.warn('city',e)}try{harborTown(sc,T)}catch(e){console.warn('harborTown',e)}try{tunnel(sc,T)}catch(e){console.warn('tunnel',e)}try{lotsAll(sc,T)}catch(e){console.warn('lots',e)}try{cover(sc,T)}catch(e){console.warn('cover',e)}try{lamps(sc,T)}catch(e){console.warn('lamps',e)}return sc};
const at0=P.applyTod;P.applyTod=function(sc,T,key){const r=at0.apply(this,arguments);try{if(T&&T.d&&T.d.city)setPano(sc,key)}catch(e){console.warn('pano',e)}try{WIN.value=key==='night'?1.5:(key==='sunset'||key==='dawn')?.3:0;const g=sc&&sc.userData&&sc.userData.lamps;if(g){g.visible=key==='night'||key==='dawn'||key==='sunset';const pm=sc.userData.lampPool;if(pm)pm.material.color.setScalar(key==='night'?1:key==='dawn'||key==='sunset'?.45:0);if(g.visible&&sc.userData.lampPos&&sc.userData.lampPos.length)ensureLights(sc)}}catch(e){console.warn('lampTod',e)}return r};
/* ---------- visual smoothing: the body, tilt and wheel travel are low-pass filtered at render time so ground-height kinks on slopes never show as jitter (physics is untouched) ---------- */
{const uvJ=updateVisual;updateVisual=function(c,T,t){const m=c&&c.m;let S=null,dt=Math.min(.05,Math.max(.001,dtf));
  if(m&&m.wheels){S=c._sv||(c._sv={y:c.y,p:c.pitch,r:c.roll,l:[0,0,0,0],init:0});const k=1-Math.exp(-dt/.055);
   if(!S.init||c.respT>.4||c.exp>0){S.l=m.wheels.map(w=>w.len);S.init=1}else m.wheels.forEach((w,i)=>{S.l[i]+=(w.len-S.l[i])*k;w.len=S.l[i]})}
  const hold=m&&m.wheels&&c.pitch,sp0=c.pitch,sr0=c.roll,sy0=c.y;
  if(S){const kk=1-Math.exp(-dt/.05),kp=1-Math.exp(-dt/.07);if(Math.abs(c.y-S.y)>3||c.respT>.4||c.exp>0){S.y=c.y;S.p=c.pitch;S.r=c.roll;S.v=0;S.cy=c.y}else{/* height is not filtered any more: physics height is already smooth, and the lag sank the body into uphill road and, at speed, passed the .9 m snap every few frames (the hill jitter) */S.y=c.y;S.p+=(c.pitch-S.p)*kp;S.r+=(c.roll-S.r)*kp}
   /* feed the smoothed pose to the renderer only, then restore the physics state */
   c.y=S.y;c.pitch=S.p;c.roll=S.r}
  let out;try{out=uvJ.apply(this,arguments)}finally{if(S){c.y=sy0;c.pitch=sp0;c.roll=sr0}}return out}}

const uv0=updateVisual;updateVisual=function(c,T,t){const r=uv0.apply(this,arguments);try{if(c===(RACE&&(RACE.cars.find(q=>q.human)||RACE.cars[0])))lampFrame();leanShadow(c)}catch(e){if(!window._lfw){window._lfw=1;console.warn('lampFrame',e&&e.stack||e)}}return r};
})();
