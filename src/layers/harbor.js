/* ===== Poly Tourismo v9 layer: harbor (daylight docks: pier, alleys, restaurant) ===== */
(function v9harbor(){
'use strict';
const P=window.PT8;
const hex=h=>'#'+h.toString(16).padStart(6,'0');
/* control points we need to find again on the sampled track */
const near=(T,x,z)=>{let b=1e9,bi=0;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-x,T.z[i]-z);if(d<b){b=d;bi=i}}return bi};
const PIER=[[320,0],[250,90]],ALLEY=[[200,50],[-60,240]],REST=[[-125,274],[-250,262]];
const seg=(T,a,b)=>[near(T,a[0],a[1]),near(T,b[0],b[1])];

/* restaurant = flagged "tunnel" (hood cam), low rail walls so the dining room can sit behind them */
const ps=sampleTrack;
sampleTrack=d=>{const T=ps(d);if(!d.harbor)return T;
 const [a,b]=seg(T,REST[0],REST[1]);T.tn=new Uint8Array(T.N);T.tunnels=[];
 for(let i=a;i<=b;i++){T.tn[i]=1;T.wall[i]=1;T.wh[i]=1.2}
 T.tunnels.push([a,b]);
 const [p0,p1]=seg(T,PIER[0],PIER[1]),[l0,l1]=seg(T,ALLEY[0],ALLEY[1]);
 for(let i=l0;i<=l1;i++)T.tn[i]=1; /* narrow alleys use the hood camera too */
 T.hbr={pier:[p0,p1],alley:[l0,l1],rest:[a,b]};return T};

/* ---------- textures ---------- */
const T_ASPH=()=>ctex(32,32,(x,w,h)=>{x.fillStyle='#3b3e44';x.fillRect(0,0,w,h);const r=rngf(4);for(let i=0;i<70;i++){x.fillStyle=r()<.5?'#00000022':'#ffffff10';x.fillRect(r()*w|0,r()*h|0,1,1)}x.fillStyle='#ffffffb0';x.fillRect(1,0,1,h);x.fillRect(w-2,0,1,h);x.fillStyle='#e8e0b0';x.fillRect(w/2-1,0,2,h/2)});
const T_PLANK=()=>ctex(32,32,(x,w,h)=>{const r=rngf(9);for(let i=0;i<8;i++){const t=r();x.fillStyle=`rgb(${150+t*34|0},${108+t*26|0},${66+t*18|0})`;x.fillRect(0,i*4,w,3);x.fillStyle='#2a1c10';x.fillRect(0,i*4+3,w,1);x.fillStyle='#00000018';x.fillRect((r()*w)|0,i*4,1,3)}x.fillStyle='#ffffffb0';x.fillRect(0,0,1,h);x.fillRect(w-1,0,1,h)});
const T_COBBLE=()=>ctex(32,32,(x,w,h)=>{const r=rngf(3);x.fillStyle='#4a4742';x.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<8;i++){const o=(j&1)*2,t=r();x.fillStyle=`rgb(${100+t*50|0},${96+t*46|0},${88+t*40|0})`;x.fillRect(i*4+o,j*4,3,3)}});
const T_TILE=()=>ctex(16,16,(x,w,h)=>{for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.fillStyle=(i+j)&1?'#e9dfcf':'#8a3b2c';x.fillRect(i*4,j*4,4,4)}});
const T_FACADE=seed=>ctex(64,128,(x,w,h)=>{const r=rngf(seed),cols=['#d8b99a','#c9877a','#e3d6a5','#9db8a8','#b9a0b8','#d4a373'];x.fillStyle=cols[seed%cols.length];x.fillRect(0,0,w,h);
 x.fillStyle='#00000012';for(let y=0;y<h;y+=6)x.fillRect(0,y,w,1);
 x.fillStyle='#5a4636';x.fillRect(0,h-26,w,26);x.fillStyle='#2a2018';x.fillRect(8,h-24,14,24);x.fillStyle='#d9382a';x.fillRect(28,h-34,30,6);x.fillStyle='#fff';for(let i=0;i<30;i+=6)x.fillRect(28+i,h-34,3,6);
 for(let row=0;row<3;row++)for(let c=0;c<2;c++){const wx=8+c*30,wy=12+row*30;x.fillStyle='#2b3a4a';x.fillRect(wx,wy,18,20);x.fillStyle='#9fd0f0aa';x.fillRect(wx+1,wy+1,16,8);x.fillStyle='#e9e4d4';x.fillRect(wx-1,wy+20,20,2);x.fillStyle=r()<.5?'#6a8f4a':'#cf6a6a';x.fillRect(wx+2,wy+18,14,3);x.fillStyle='#4a5a3a';x.fillRect(wx-3,wy,3,20);x.fillRect(wx+18,wy,3,20)}});
const T_CONC=()=>ctex(8,8,(x,w,h)=>{x.fillStyle='#b9bcbf';x.fillRect(0,0,w,h);x.fillStyle='#e7c93a';x.fillRect(0,0,w,2);x.fillStyle='#2a2a2a';for(let i=0;i<w;i+=4)x.fillRect(i,0,2,2);x.fillStyle='#0003';x.fillRect(0,h-2,w,2)});
const T_RAIL=()=>ctex(8,8,(x,w,h)=>{x.fillStyle='#8a5a34';x.fillRect(0,0,w,h);x.fillStyle='#d8c29a';x.fillRect(0,0,w,2);x.fillStyle='#0004';x.fillRect(0,h-2,w,2);x.fillRect(3,2,1,h-4)});
const T_WALLB=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#c9b79c';x.fillRect(0,0,w,h);x.fillStyle='#00000018';for(let y=0;y<h;y+=4)x.fillRect(0,y,w,1)});
const T_SIGN=txt=>ctex(256,48,(x,w,h)=>{x.fillStyle='#1a3a2c';x.fillRect(0,0,w,h);x.fillStyle='#f0d9a0';x.fillRect(3,3,w-6,h-6);x.fillStyle='#1a3a2c';x.fillRect(6,6,w-12,h-12);x.fillStyle='#f6e9c0';x.font='bold 28px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+1)});
const flat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,flatShading:true},o));

/* one section of road surface with its own material (uv along the track) */
function strip(T,a,b,l0,l1,dy,mt,vs,segs){const pos=[],uv=[],idx=[],n=b-a+1,sg=segs||4;
 for(let r=0;r<n;r++){const k=(a+r)%T.N,s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]);for(let j=0;j<=sg;j++){const l=l0(k)+(l1(k)-l0(k))*j/sg;pos.push(T.x[k]+c*l,T.y[k]+dy,T.z[k]-s*l);uv.push(j/sg,r*T.sp/vs)}}
 for(let r=0;r<n-1;r++)for(let j=0;j<sg;j++){const p=r*(sg+1)+j,q=p+sg+1;idx.push(p,q,p+1,p+1,q,q+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return new THREE.Mesh(g,mt)}
function instB(sc,geo,m,list,tint){const im=new THREE.InstancedMesh(geo,m,Math.max(1,list.length)),o=new THREE.Object3D(),col=new THREE.Color();
 list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(0,p[6]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(tint){col.setHex(tint[i%tint.length]);im.setColorAt(i,col)}});
 im.count=list.length;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;sc.add(im);return im}

const WATER=(x,z)=>(x>215&&z>5)||z>315;
const frame=(T,k,l)=>{const s=Math.sin(T.psi[k]),c=Math.cos(T.psi[k]);return[T.x[k]+c*l,T.z[k]-s*l,T.psi[k]]};

function buildHarbor(T){const d=T.d,N=T.N,r=rngf(8*77+5),sc=new THREE.Scene(),H=T.hbr;
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 sc.fog=new THREE.Fog(d.fog,170,900);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],.78));const sun=new THREE.DirectionalLight(d.sun,.8);sun.position.set(-150,250,100);sc.add(sun);
 const sk=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,hex(d.sky[0]));g.addColorStop(.5,hex(d.sky[1]));g.addColorStop(1,hex(d.sky[1]));x.fillStyle=g;x.fillRect(0,0,w,h)});
 sc.add(new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sk,side:THREE.BackSide,fog:false})));
 mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:d.sun,fog:false}),-500,420,-1000,sc);
 /* water everywhere, land with a harbour-basin hole */
 const wm=new THREE.MeshStandardMaterial({color:0x0d6a99,roughness:1,metalness:0,flatShading:true});
 const sea=mesh(new THREE.PlaneGeometry(6000,6000),wm,0,-1.3,0,sc);sea.rotation.x=-Math.PI/2;sc.userData.harbor={water:wm};
 const bed=mesh(new THREE.PlaneGeometry(6000,6000),flat(0x1a4a5e),0,-9,0,sc);bed.rotation.x=-Math.PI/2;
 const shp=new THREE.Shape();shp.moveTo(-760,-760);shp.lineTo(760,-760);shp.lineTo(760,760);shp.lineTo(-760,760);shp.lineTo(-760,-760);
 const hole=new THREE.Path();[[215,5],[760,5],[760,760],[-760,760],[-760,315],[215,315]].forEach((p,i)=>i?hole.lineTo(p[0],-p[1]):hole.moveTo(p[0],-p[1]));shp.holes.push(hole);
 /* shape is XY; map y=-z so rotating -90deg about X lands it on the ground */
 {const g=new THREE.ShapeGeometry(shp);const gm=new THREE.MeshStandardMaterial({map:T_CONC_G(),roughness:1});const land=new THREE.Mesh(g,gm);land.rotation.x=-Math.PI/2;land.position.y=-.06;sc.add(land)}
 function T_CONC_G(){const t=ctex(16,16,(x,w,h)=>{x.fillStyle='#7b7e80';x.fillRect(0,0,w,h);x.fillStyle='#0000001a';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);const rr=rngf(2);for(let i=0;i<20;i++){x.fillStyle=rr()<.5?'#ffffff10':'#00000014';x.fillRect(rr()*w|0,rr()*h|0,2,1)}});t.repeat.set(160,160);return t}
 /* quay edge: stone face + curb along the basin outline */
 const seg2=[[[215,5],[215,315]],[[215,5],[760,5]],[[-760,315],[215,315]]];
 for(const [a,b] of seg2){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),m=mesh(new THREE.BoxGeometry(len,1.6,1.2),flat(0x6a6d70),(a[0]+b[0])/2,-.7,(a[1]+b[1])/2,sc);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0])}
 /* ----- road surfaces ----- */
 const asph=new THREE.MeshStandardMaterial({map:T_ASPH(),roughness:.9,side:THREE.DoubleSide});sc.add(ribbon(T,k=>-T.hw[k],k=>T.hw[k],10,.05,asph,6));
 const hw=k=>T.hw[k];
 const plank=new THREE.MeshStandardMaterial({map:T_PLANK(),roughness:1,side:THREE.DoubleSide}),cob=new THREE.MeshStandardMaterial({map:T_COBBLE(),roughness:1,side:THREE.DoubleSide}),tile=new THREE.MeshStandardMaterial({map:T_TILE(),roughness:.7,side:THREE.DoubleSide});
 sc.add(strip(T,H.pier[0],H.pier[1],k=>-hw(k),k=>hw(k),.09,plank,6));
 sc.add(strip(T,H.alley[0],H.alley[1],k=>-hw(k),k=>hw(k),.09,cob,5));
 /* pier supports */
 {const pil=[];for(let i=H.pier[0];i<=H.pier[1];i+=4)for(const sd of [-1,1]){const f=frame(T,i,sd*(hw(i)-.6));pil.push([f[0],-4.6,f[1],.55,8.8,.55])}instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x4a3a2a),pil)}
 /* ----- walls: concrete barrier on the quay, wooden rail on pier/restaurant, tall painted facades in the alleys ----- */
 const cat=new Uint8Array(N);for(let i=0;i<N;i++){cat[i]=(i>=H.alley[0]&&i<=H.alley[1])?2:((i>=H.pier[0]&&i<=H.pier[1])||(i>=H.rest[0]&&i<=H.rest[1]))?1:0}
 const mats=[new THREE.MeshStandardMaterial({map:T_CONC(),side:THREE.DoubleSide,roughness:.9}),new THREE.MeshStandardMaterial({map:T_RAIL(),side:THREE.DoubleSide,roughness:.9}),new THREE.MeshStandardMaterial({map:T_FACADE(1),side:THREE.DoubleSide,roughness:.95})];
 for(let c=0;c<3;c++){const W=Object.create(T);W.wh=Float32Array.from(T.wh,(h,i)=>cat[i]===c?h:-.3);sc.add(wallMesh(W,1,mats[c]));sc.add(wallMesh(W,-1,mats[c]))}
 /* top trim along the alley walls */
 {const W=Object.create(T);W.wh=Float32Array.from(T.wh,(h,i)=>cat[i]===2?.0:-.3)}
 /* ----- start arch ----- */
 {const ar=new THREE.Group();ar.position.set(T.x[0],T.y[0],T.z[0]);ar.rotation.y=T.psi[0];sc.add(ar);
  for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.8,8,.8),mat(0xdddddd),sd*(T.hw[0]+1.2),4,0,ar);
  mesh(new THREE.BoxGeometry(T.hw[0]*2+3.6,2.2,.6),new THREE.MeshBasicMaterial({map:ctex(32,4,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)&1?'#fff':'#111';x.fillRect(i,j,1,1)}})}),0,8.4,0,ar);
  const sl=mesh(new THREE.PlaneGeometry(T.hw[0]*2,2.4),new THREE.MeshBasicMaterial({map:ctex(16,2,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i&1?'#fff':'#111';x.fillRect(i,0,1,1);x.fillStyle=i&1?'#111':'#fff';x.fillRect(i,1,1,1)}})}),T.x[0],T.y[0]+.1,T.z[0],sc);sl.rotation.order='YXZ';sl.rotation.set(-Math.PI/2,T.psi[0],0)}
 /* ----- scatter helper (land only, away from the road) ----- */
 const rd=(x,z)=>{let b=1e9;for(let i=0;i<N;i+=2){const dd=Math.hypot(x-T.x[i],z-T.z[i]);if(dd<b)b=dd}return b};
 const scatter=(cnt,lo,hi,fn)=>{const out=[];for(let t=0;t<cnt*30&&out.length<cnt;t++){const x=-640+r()*1280,z=-640+r()*1280;if(WATER(x,z)||Math.abs(x)>700)continue;const q=rd(x,z);if(q<lo||q>=hi)continue;fn(x,z,out,q)}return out};
 /* containers (quay) */
 {const cols=[0xc0392b,0x2c6fb0,0xd98324,0x3f8a4a,0x8a8f95,0xe8e0c8];
  const list=[];scatter(70,16,70,(x,z,o)=>{const rot=r()<.5?0:Math.PI/2,st=1+(r()*2.4|0);for(let s=0;s<st;s++)list.push([x,1.3+s*2.6,z,2.5,2.6,6.1,rot])});
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0xffffff),list,cols)}
 /* warehouses */
 {const list=[];scatter(26,38,170,(x,z,o)=>{const w=24+r()*30,dp=20+r()*26,h=9+r()*7;list.push([x,h/2,z,w,h,dp,(r()*4|0)*Math.PI/2])});
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0xffffff),list,[0xa8664a,0x4f7f8f,0xc89a5a,0x6f8a62,0xb0554a,0xd8c27a]);
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0x555a60),list.map(p=>[p[0],p[4]+.4,p[2],p[3]*1.02,.8,p[5]*1.02,p[6]]))}
 /* alley buildings behind the facade walls: taller blocks give the skyline */
 {const list=[];for(let i=H.alley[0];i<=H.alley[1];i+=5)for(const sd of [-1,1]){const f=frame(T,i,sd*(hw(i)+8.5)),h=13+r()*12;list.push([f[0],h/2,f[1],13,h,13,f[2]])}
  const wt=new THREE.MeshStandardMaterial({map:T_FACADE(3),roughness:.95,flatShading:true});
  instB(sc,new THREE.BoxGeometry(1,1,1),wt,list,[0xffffff,0xf4e6d0,0xe8d2c8,0xd8e4dc]);
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0x6a4a3a),list.map(p=>[p[0],p[4]+.3,p[2],p[3]*1.05,.6,p[5]*1.05,p[6]]))}
 /* cranes */
 for(const cp of [[-40,-262,0],[120,-268,0]]){const g=new THREE.Group();g.position.set(cp[0],0,cp[1]);sc.add(g);const rm=flat(0xd9702a);
  for(const [lx,lz] of [[-7,-5],[7,-5],[-7,5],[7,5]])mesh(new THREE.BoxGeometry(1,28,1),rm,lx,14,lz,g);
  mesh(new THREE.BoxGeometry(18,2,14),rm,0,28,0,g);mesh(new THREE.BoxGeometry(4,3,50),rm,0,30,10,g);mesh(new THREE.BoxGeometry(6,6,8),flat(0x3a3f44),0,25,-4,g)}
 /* lamp posts along quay and pier */
 {const pl=[],hd=[];for(let i=0;i<N;i+=14){if(cat[i]===2||(i>=H.rest[0]&&i<=H.rest[1]))continue;const f=frame(T,i,hw(i)+1.2);pl.push([f[0],3.4,f[1],.18,6.8,.18]);hd.push([f[0],6.9,f[1],.9,.45,.9])}
  instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x3a3f44),pl);instB(sc,new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xfff0c0}),hd)}
 /* boats in the basin */
 {const hull=[],cab=[],mast=[],hcol=[0xf2f2f2,0xdfe8f2,0xc0392b,0x2c6fb0,0xf0d9a0];
  for(let t=0;t<400&&hull.length<16;t++){const x=230+r()*330,z=20+r()*300;if(rd(x,z)<14)continue;const rot=r()*Math.PI,len=7+r()*7;hull.push([x,-.7,z,2.6,1.6,len,rot]);cab.push([x+Math.sin(rot)*len*.08,.6,z+Math.cos(rot)*len*.08,1.8,1.3,len*.3,rot]);if(r()<.5)mast.push([x,5,z,.12,9,.12])}
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0xffffff),hull,hcol);instB(sc,new THREE.BoxGeometry(1,1,1),flat(0xf6f6f2),cab);instB(sc,new THREE.CylinderGeometry(1,1,1,5),flat(0xdddddd),mast)}
 /* bollards on the quay edge */
 {const bl=[];for(let z=20;z<310;z+=22)bl.push([216.5,.5,z,.5,1,.5]);for(let x=216;x<500;x+=22)bl.push([x,.5,6.5,.5,1,.5]);instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x2a2f36),bl)}
 /* ----- restaurant dining hall around the flagged section ----- */
 {const [a,b]=H.rest,W=hw(a)+7.5,hall=new THREE.MeshStandardMaterial({color:0xe6d3b0,roughness:.95,side:THREE.DoubleSide,flatShading:true});
  sc.add(strip(T,a,b,k=>-W,k=>W,.02,tile,5,2));
  /* ceiling + outer walls (with window bands) */
  const ceil=strip(T,a,b,k=>-W-.3,k=>W+.3,8.2,new THREE.MeshStandardMaterial({color:0xb99b72,roughness:1,side:THREE.DoubleSide}),20,2);sc.add(ceil);
  const roof=strip(T,a,b,k=>-W-1,k=>W+1,9.6,flat(0x8a4a38,{side:THREE.DoubleSide}),20,2);sc.add(roof);
  const wallStrip=(sd)=>{const pos=[],uv=[],idx=[],n=b-a+1;for(let q=0;q<n;q++){const k=a+q,f=frame(T,k,sd*W);pos.push(f[0],0,f[1],f[0],9.6,f[1]);uv.push(q*T.sp/6,0,q*T.sp/6,1)}for(let q=0;q<n-1;q++){const p=q*2;idx.push(p,p+2,p+1,p+1,p+2,p+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   const wtex=ctex(32,32,(x,w,h)=>{x.fillStyle='#e6d3b0';x.fillRect(0,0,w,h);x.fillStyle='#7a4a2a';x.fillRect(0,0,w,3);x.fillRect(0,h-5,w,5);x.fillStyle='#9ad0f0';x.fillRect(4,8,24,15);x.fillStyle='#ffffff90';x.fillRect(5,9,22,3);x.fillStyle='#7a4a2a';x.fillRect(15,8,2,15);x.fillRect(4,15,24,1)});
   return new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:wtex,side:THREE.DoubleSide,roughness:.9}))};
  sc.add(wallStrip(1));sc.add(wallStrip(-1));
  /* tables + chairs + plants in the two dining strips, pendant lights overhead */
  const tab=[],tops=[],chr=[],plant=[],bulbs=[],cand=[];
  for(let i=a+3;i<b-2;i+=4)for(const sd of [-1,1]){const lat=sd*(hw(i)+3.6+r()*1.8),f=frame(T,i,lat);tab.push([f[0],.55,f[1],.18,1.1,.18]);tops.push([f[0],1.1,f[1],1.7,.08,1.7]);
   for(const dd of [-1,1]){const g=frame(T,i,lat+dd*1.4);chr.push([g[0],.45,g[1],.7,.9,.7,f[2]]);cand.push([f[0],1.2,f[1],.12,.22,.12])}}
  for(let i=a+5;i<b-2;i+=9)for(const sd of [-1,1]){const f=frame(T,i,sd*(W-1)),f2=frame(T,i,sd*(hw(i)+1.3));plant.push([f[0],1.1,f[1],.9,2.2,.9]);bulbs.push([f2[0],6.6,f2[1],.55,.55,.55])}
  for(let i=a+4;i<b-2;i+=8){const f=frame(T,i,0);bulbs.push([f[0],7.1,f[1],.7,.7,.7])}
  instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x3a2a1c),tab);instB(sc,new THREE.CylinderGeometry(1,1,1,10),flat(0xf6f0e0),tops);
  instB(sc,new THREE.BoxGeometry(1,1,1),flat(0xa04a2c),chr);instB(sc,new THREE.IcosahedronGeometry(1,0),flat(0x3f8a4a),plant);
  instB(sc,new THREE.CylinderGeometry(1,1,1,5),new THREE.MeshBasicMaterial({color:0xffd27a}),cand);
  instB(sc,new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xffe2a0}),bulbs);
  /* entrance portals + signs */
  for(const [k,flip] of [[a,0],[b,1]]){const f=frame(T,k,0),g=new THREE.Group();g.position.set(f[0],0,f[1]);g.rotation.y=f[2]+(flip?Math.PI:0);sc.add(g);
   mesh(new THREE.BoxGeometry(W*2+2,2.4,1.2),flat(0x8a4a38),0,10.9,0,g);for(const sd of [-1,1])mesh(new THREE.BoxGeometry(1.2,10.4,1.2),flat(0x8a4a38),sd*(W+.4),5.2,0,g);
   const sg=mesh(new THREE.PlaneGeometry(14,2.6),new THREE.MeshBasicMaterial({map:T_SIGN('HARBOR GRILL')}),0,10.9,-.65,g);sg.rotation.y=Math.PI}}
 /* ----- pano: distant skyline + sea haze ----- */
 {const Wd=4096,Hh=512,hz=352,cv=document.createElement('canvas');cv.width=Wd;cv.height=Hh;const g=cv.getContext('2d'),fog=new THREE.Color(d.fog),rr=rngf(77),mix=(h,t)=>'#'+new THREE.Color(h).lerp(fog,t).getHexString();
  for(let i=0;i<90;i++){const x=rr()*Wd,w=24+rr()*60,h=40+rr()*130;g.fillStyle=mix([0x8a9aa8,0x9aa8b0,0xa8a8b4][i%3],.55);g.fillRect(x,hz-h,w,h)}
  g.fillStyle=mix(0x7da0b8,.5);g.beginPath();g.moveTo(0,hz);for(let x=0;x<=Wd;x+=16)g.lineTo(x,hz-18-14*Math.sin(x*.004)-8*Math.sin(x*.013));g.lineTo(Wd,hz);g.fill();
  const q=g.createLinearGradient(0,hz-10,0,Hh);q.addColorStop(0,mix(0x7fb4d0,.35));q.addColorStop(1,mix(0x4a86a6,.2));g.fillStyle=q;g.fillRect(0,hz,Wd,Hh-hz);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;
  const bb=T.bounds,m=new THREE.Mesh(new THREE.CylinderGeometry(1300,1300,480,72,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));m.position.set((bb[0]+bb[1])/2,90,(bb[2]+bb[3])/2);m.renderOrder=-2;sc.add(m);sc.userData.harbor.pano=m.material}
 return sc}

/* time of day tints the unlit backdrop and the water */
const TINT={dawn:[1.0,.82,.78],day:[1,1,1],sunset:[1,.66,.52],night:[.1,.14,.3]},WT={dawn:[1,.85,.85],day:[1,1,1],sunset:[1,.7,.6],night:[.18,.24,.5]};
if(P.applyTod){const at=P.applyTod;P.applyTod=(sc,T,key)=>{at(sc,T,key);const h=sc.userData&&sc.userData.harbor;if(!h)return;const t=TINT[key]||TINT.day,w=WT[key]||WT.day;h.pano.color.setRGB(t[0],t[1],t[2]);h.water.color.setRGB(.035,.3,.46).multiply(new THREE.Color(w[0],w[1],w[2]))}}
const bw=buildWorld;buildWorld=T=>T.d.harbor?buildHarbor(T):bw(T);
})();
