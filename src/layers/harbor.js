/* ===== Poly Tourismo v9 layer: harbor (daylight docks: pier, alleys, restaurant) ===== */
(function v9harbor(){
'use strict';
const P=window.PT8;
const hex=h=>'#'+h.toString(16).padStart(6,'0');
/* control points we need to find again on the sampled track */
const near=(T,x,z)=>{let b=1e9,bi=0;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-x,T.z[i]-z);if(d<b){b=d;bi=i}}return bi};
const PIER=[[320,0],[250,90]],ALLEYS=[[[200,50],[-60,255]],[[-264,238],[-226,52]]],REST=[[-125,274],[-222,275]];
const seg=(T,a,b)=>[near(T,a[0],a[1]),near(T,b[0],b[1])];

/* restaurant = flagged "tunnel" (hood cam), low rail walls so the dining room can sit behind them */
const ps=sampleTrack;
sampleTrack=d=>{const T=ps(d);if(!d.harbor)return T;
 const [a,b]=seg(T,REST[0],REST[1]);T.tn=new Uint8Array(T.N);T.tunnels=[];
 for(let i=a;i<=b;i++){T.tn[i]=1;T.wall[i]=1;T.wh[i]=1.2}
 T.tunnels.push([a,b]);
 const [p0,p1]=seg(T,PIER[0],PIER[1]),al=ALLEYS.map(q=>seg(T,q[0],q[1]));
 for(const [l0,l1] of al)for(let i=l0;i<=l1;i++)T.tn[i]=1; /* narrow alleys use the hood camera too */
 T.hbr={pier:[p0,p1],alley:al[0],alleys:al,rest:[a,b]};return T};

/* ---------- textures ---------- */
const T_ASPH=()=>ctex(32,32,(x,w,h)=>{x.fillStyle='#3b3e44';x.fillRect(0,0,w,h);const r=rngf(4);for(let i=0;i<70;i++){x.fillStyle=r()<.5?'#00000022':'#ffffff10';x.fillRect(r()*w|0,r()*h|0,1,1)}x.fillStyle='#ffffffb0';x.fillRect(1,0,1,h);x.fillRect(w-2,0,1,h);x.fillStyle='#e8e0b0';x.fillRect(w/2-1,0,2,h/2)});
const T_PLANK=()=>ctex(32,32,(x,w,h)=>{const r=rngf(9);for(let i=0;i<4;i++){const t=r()*.5;x.fillStyle=`rgb(${176+t*26|0},${132+t*22|0},${86+t*16|0})`;x.fillRect(0,i*8,w,8);x.fillStyle='#7a5a3a';x.fillRect(0,i*8+7,w,1);x.fillStyle='#00000010';x.fillRect((r()*w)|0,i*8,1,7)}x.fillStyle='#ffffffa0';x.fillRect(0,0,1,h);x.fillRect(w-1,0,1,h)});
const T_COBBLE=()=>ctex(32,32,(x,w,h)=>{const r=rngf(3);x.fillStyle='#4a4742';x.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<8;i++){const o=(j&1)*2,t=r();x.fillStyle=`rgb(${100+t*50|0},${96+t*46|0},${88+t*40|0})`;x.fillRect(i*4+o,j*4,3,3)}});
const T_TILE=()=>ctex(16,16,(x,w,h)=>{for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.fillStyle=(i+j)&1?'#e2d6bf':'#b08a6e';x.fillRect(i*4,j*4,4,4)}});
const T_FACADE=seed=>ctex(64,128,(x,w,h)=>{const r=rngf(seed),cols=['#d8b99a','#c9877a','#e3d6a5','#9db8a8','#b9a0b8','#d4a373'];x.fillStyle=cols[seed%cols.length];x.fillRect(0,0,w,h);
 x.fillStyle='#00000012';for(let y=0;y<h;y+=6)x.fillRect(0,y,w,1);
 x.fillStyle='#5a4636';x.fillRect(0,h-26,w,26);x.fillStyle='#2a2018';x.fillRect(8,h-24,14,24);x.fillStyle='#d9382a';x.fillRect(28,h-34,30,6);x.fillStyle='#fff';for(let i=0;i<30;i+=6)x.fillRect(28+i,h-34,3,6);
 for(let row=0;row<3;row++)for(let c=0;c<2;c++){const wx=8+c*30,wy=12+row*30;x.fillStyle='#2b3a4a';x.fillRect(wx,wy,18,20);x.fillStyle='#9fd0f0aa';x.fillRect(wx+1,wy+1,16,8);x.fillStyle='#e9e4d4';x.fillRect(wx-1,wy+20,20,2);x.fillStyle=r()<.5?'#6a8f4a':'#cf6a6a';x.fillRect(wx+2,wy+18,14,3);x.fillStyle='#4a5a3a';x.fillRect(wx-3,wy,3,20);x.fillRect(wx+18,wy,3,20)}});
const T_FACADEW=()=>{const cols=['#d8b99a','#e3d6a5','#9db8a8','#a9bfd4','#e8e0d0','#c9877a'],TN=18;const t=ctex(64*TN,128,(x,w,h)=>{const r=rngf(5);for(let n=0;n<TN;n++){const ox=n*64;x.fillStyle=cols[Math.floor(n/3)%cols.length];x.fillRect(ox,0,64,h);
  x.fillStyle='#00000010';for(let y=0;y<h;y+=6)x.fillRect(ox,y,64,1);
  x.fillStyle='#5a4636';x.fillRect(ox,h-26,64,26);x.fillStyle='#2a2018';x.fillRect(ox+8,h-24,14,24);x.fillStyle='#b4574a';x.fillRect(ox+28,h-34,30,6);x.fillStyle='#e8dcc8';for(let i=0;i<30;i+=10)x.fillRect(ox+28+i,h-34,5,6);
  for(let row=0;row<3;row++)for(let c=0;c<2;c++){const wx=ox+8+c*30,wy=12+row*30;x.fillStyle='#34475a';x.fillRect(wx,wy,18,20);x.fillStyle='#a9cde6';x.fillRect(wx+1,wy+1,16,8);x.fillStyle='#f0ebdc';x.fillRect(wx-1,wy+20,20,2);x.fillStyle=r()<.5?'#7a9a62':'#c98a7a';x.fillRect(wx+2,wy+18,14,3);x.fillStyle='#5a6a4a';x.fillRect(wx-3,wy,3,20);x.fillRect(wx+18,wy,3,20)}}});t.repeat.set(1/TN,1);return t};

/* brick alley wall: 8 different 4 m tiles side by side (doors, windows, awnings, pipes, fire escape, posters) */
const T_BRICKW=()=>{const TN=8,TW=128,TH=256,BR=['#a4553f','#9b4a38','#b0644a','#8c4636','#b87556','#a05a46'];
 const t=ctex(TW*TN,TH,(x,w,h)=>{const r=rngf(31);
  for(let n=0;n<TN;n++){const ox=n*TW;x.fillStyle='#7d6a5c';x.fillRect(ox,0,TW,TH);
   for(let row=0;row<TH/6;row++){const off=(row&1)*6;for(let c=-1;c<TW/12+1;c++){x.fillStyle=BR[(r()*BR.length)|0];x.fillRect(ox+c*12+off+1,row*6+1,10,4)}}
   x.fillStyle='#00000020';for(let y=0;y<TH;y+=48)x.fillRect(ox,y,TW,2);
   const win=(wx,wy,ww,wh,sh)=>{x.fillStyle='#d9cdb4';x.fillRect(ox+wx-3,wy-3,ww+6,wh+6);x.fillStyle='#26323f';x.fillRect(ox+wx,wy,ww,wh);x.fillStyle='#9ac3df';x.fillRect(ox+wx+2,wy+2,ww-4,Math.floor(wh*.38));x.fillStyle='#d9cdb4';x.fillRect(ox+wx+ww/2-1,wy,2,wh);x.fillRect(ox+wx,wy+wh/2,ww,2);x.fillStyle='#bfb49c';x.fillRect(ox+wx-5,wy+wh+3,ww+10,4);
    if(sh){x.fillStyle='#3f6a58';x.fillRect(ox+wx-10,wy,8,wh);x.fillRect(ox+wx+ww+2,wy,8,wh)}};
   const door=(dx,w_,col)=>{x.fillStyle='#d9cdb4';x.fillRect(ox+dx-4,TH-92,w_+8,92);x.fillStyle=col;x.fillRect(ox+dx,TH-88,w_,88);x.fillStyle='#00000030';x.fillRect(ox+dx+w_/2-1,TH-88,2,88);x.fillStyle='#e8c860';x.fillRect(ox+dx+w_-9,TH-44,4,6)};
   const pipe=px=>{x.fillStyle='#59606a';x.fillRect(ox+px,0,6,TH);x.fillStyle='#8a929c';x.fillRect(ox+px,0,2,TH);for(let y=20;y<TH;y+=60){x.fillStyle='#3a3f46';x.fillRect(ox+px-2,y,10,4)}};
   if(n===0){win(14,26,26,38,1);win(78,26,26,38,1);win(14,100,26,38,0);win(78,100,26,38,0);door(48,32,'#4b3a2c')}
   else if(n===1){win(14,40,22,34,0);win(86,40,22,34,0);win(14,112,22,34,0);win(86,112,22,34,0);door(40,46,'#2f4a3e');x.fillStyle='#d9cdb4';x.beginPath();x.arc(ox+63,TH-90,27,Math.PI,0);x.fill();x.fillStyle='#e6b95a';x.fillRect(ox+98,TH-120,6,14)}
   else if(n===2){pipe(20);win(52,30,30,40,1);win(52,106,30,40,0);x.fillStyle='#e8dcc0';x.fillRect(ox+8,TH-150,112,34);x.fillStyle='#8a3a2c';x.font='bold 22px monospace';x.textAlign='center';x.fillText(['BAR','CAFE','TAPAS'][(r()*3)|0],ox+64,TH-125);door(84,30,'#6a4a2c')}
   else if(n===3){x.fillStyle='#e3d3b0';x.fillRect(ox,TH-130,TW,130);x.fillStyle='#00000012';for(let y=TH-130;y<TH;y+=8)x.fillRect(ox,y,TW,1);win(18,50,26,36,1);win(84,50,26,36,1);win(18,150,30,34,0);door(76,34,'#7a3a30')}
   else if(n===4){win(20,26,26,38,0);win(80,26,26,38,0);x.fillStyle='#2a3440';x.fillRect(ox+14,TH-84,100,70);x.fillStyle='#9ac3df88';x.fillRect(ox+16,TH-82,96,30);for(let i=0;i<10;i++){x.fillStyle=i&1?'#e8e2d4':'#c0392b';x.fillRect(ox+10+i*11,TH-100,11,22)}x.fillStyle='#00000030';x.fillRect(ox+10,TH-80,110,4)}
   else if(n===5){x.strokeStyle='#2c3238';x.lineWidth=3;for(let k=0;k<3;k++){const y0=40+k*70;x.beginPath();x.moveTo(ox+8,y0+60);x.lineTo(ox+120,y0);x.stroke();x.fillStyle='#2c3238';x.fillRect(ox+4,y0,120,4)}x.fillRect(ox+4,26,4,TH-26);x.fillRect(ox+120,26,4,TH-26);win(40,150,24,30,0);door(84,30,'#394a58')}
   else if(n===6){for(let k=0;k<5;k++){x.fillStyle=['#d9c98a','#8fb0c9','#e8e0d0','#c98a8a'][k%4];x.fillRect(ox+10+r()*90,30+r()*150,18+r()*14,22+r()*20)}x.fillStyle='#00000026';for(let k=0;k<9;k++)x.fillRect(ox+r()*TW,r()*TH,4+r()*8,20+r()*60);win(48,160,26,34,1);door(10,30,'#4b3a2c')}
   else {x.fillStyle='#5c6670';x.fillRect(ox+14,TH-120,100,116);for(let y=TH-120;y<TH-4;y+=9){x.fillStyle='#00000030';x.fillRect(ox+14,y,100,2)}x.fillStyle='#d8a028';x.fillRect(ox+14,TH-124,100,6);win(14,30,26,36,0);win(88,30,26,36,0);win(14,100,26,36,0);win(88,100,26,36,0)}
   x.fillStyle='#0000001e';x.fillRect(ox,0,TW,18);x.fillStyle='#ffffff10';x.fillRect(ox,TH-12,TW,12)}});
 t.repeat.set(1/TN,1);return t};
const T_PAVE=()=>ctex(16,16,(x,w,h)=>{x.fillStyle='#8f9296';x.fillRect(0,0,w,h);x.fillStyle='#00000026';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillRect(8,0,1,h);x.fillRect(0,8,w,1)});
const T_CONC=()=>ctex(8,8,(x,w,h)=>{x.fillStyle='#b4b7ba';x.fillRect(0,0,w,h);x.fillStyle='#d9c25a';x.fillRect(0,1,w,1);x.fillStyle='#0000001c';x.fillRect(0,h-2,w,2)});
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
 {const g=new THREE.ShapeGeometry(shp);const gm=new THREE.MeshStandardMaterial({map:T_CONC_G(),roughness:1,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2});const land=new THREE.Mesh(g,gm);land.rotation.x=-Math.PI/2;land.position.y=-.3;sc.add(land)}
 function T_CONC_G(){const t=ctex(16,16,(x,w,h)=>{x.fillStyle='#7b7e80';x.fillRect(0,0,w,h);x.fillStyle='#0000001a';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);const rr=rngf(2);for(let i=0;i<20;i++){x.fillStyle=rr()<.5?'#ffffff10':'#00000014';x.fillRect(rr()*w|0,rr()*h|0,2,1)}});t.repeat.set(160,160);return t}
 /* quay edge: stone face + curb along the basin outline */
 const seg2=[[[215,5],[215,315]],[[215,5],[760,5]],[[-760,315],[215,315]]];
 for(const [a,b] of seg2){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),m=mesh(new THREE.BoxGeometry(len,1.6,1.2),flat(0x6a6d70),(a[0]+b[0])/2,-.7,(a[1]+b[1])/2,sc);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0])}
 /* ----- road surfaces ----- */
 const PO={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2};const asph=new THREE.MeshStandardMaterial(Object.assign({map:T_ASPH(),roughness:.9,side:THREE.DoubleSide},PO));sc.add(ribbon(T,k=>-T.hw[k],k=>T.hw[k],10,.07,asph,6));
 const hw=k=>T.hw[k];
 const plank=new THREE.MeshStandardMaterial({map:T_PLANK(),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),cob=new THREE.MeshStandardMaterial({map:T_COBBLE(),roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),tile=new THREE.MeshStandardMaterial({map:T_TILE(),roughness:.7,side:THREE.DoubleSide});
 sc.add(strip(T,H.pier[0],H.pier[1],k=>-hw(k),k=>hw(k),.09,plank,6));
 const paveM=new THREE.MeshStandardMaterial({map:T_PAVE(),roughness:1,side:THREE.DoubleSide}),curbM=new THREE.MeshStandardMaterial({color:0xb9b6ae,roughness:1,side:THREE.DoubleSide});
 for(const [a0,a1] of H.alleys){sc.add(strip(T,a0,a1,k=>-hw(k),k=>hw(k),.09,cob,5));
  /* kerb face + raised pavement on both sides: the paving sits strictly outside the drivable width */
  for(const sd of[-1,1]){sc.add(strip(T,a0,a1,k=>sd*(hw(k)+.02),k=>sd*(hw(k)+1.95),.2,paveM,3,2));
   const pos=[],idx=[],n=a1-a0+1;for(let q=0;q<n;q++){const k=(a0+q)%T.N,f=frame(T,k,sd*(hw(k)+.02));pos.push(f[0],T.y[k]+.07,f[1],f[0],T.y[k]+.2,f[1])}
   for(let q=0;q<n-1;q++){const p=q*2;idx.push(p,p+2,p+1,p+1,p+2,p+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();sc.add(new THREE.Mesh(g,curbM))}}
 /* pier supports */
 {const pil=[];for(let i=H.pier[0];i<=H.pier[1];i+=4)for(const sd of [-1,1]){const f=frame(T,i,sd*(hw(i)-.6));pil.push([f[0],-4.6,f[1],.55,8.8,.55])}instB(sc,new THREE.CylinderGeometry(1,1,1,6),flat(0x4a3a2a),pil)}
 /* ----- walls: concrete barrier on the quay, wooden rail on pier/restaurant, tall painted facades in the alleys ----- */
 const cat=new Uint8Array(N);const inAl=i=>H.alleys.some(a=>i>=a[0]&&i<=a[1]);for(let i=0;i<N;i++){cat[i]=inAl(i)?2:((i>=H.pier[0]&&i<=H.pier[1])||(i>=H.rest[0]&&i<=H.rest[1]))?1:0}
 const mats=[new THREE.MeshStandardMaterial({map:T_CONC(),side:THREE.DoubleSide,roughness:.9}),new THREE.MeshStandardMaterial({map:T_RAIL(),side:THREE.DoubleSide,roughness:.9}),new THREE.MeshStandardMaterial({map:T_BRICKW(),side:THREE.DoubleSide,roughness:.95})];
 for(let c=0;c<3;c++){const W=Object.create(T);W.wh=Float32Array.from(T.wh,(h,i)=>cat[i]===c?h:-.3);if(c===2)W.hw=Float32Array.from(T.hw,h=>h+1.7);sc.add(wallMesh(W,1,mats[c]));sc.add(wallMesh(W,-1,mats[c]))}
 /* top trim along the alley walls */
 {const W=Object.create(T);W.wh=Float32Array.from(T.wh,(h,i)=>cat[i]===2?.0:-.3)}
 /* ----- start arch ----- */
 {const ar=new THREE.Group();ar.position.set(T.x[0],T.y[0],T.z[0]);ar.rotation.y=T.psi[0];sc.add(ar);
  for(const sd of[-1,1])mesh(new THREE.BoxGeometry(.8,8,.8),mat(0xdddddd),sd*(T.hw[0]+1.2),4,0,ar);
  mesh(new THREE.BoxGeometry(T.hw[0]*2+3.6,2.2,.6),new THREE.MeshBasicMaterial({map:ctex(32,4,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)&1?'#fff':'#111';x.fillRect(i,j,1,1)}})}),0,8.4,0,ar);
  const sl=mesh(new THREE.PlaneGeometry(T.hw[0]*2,2.4),new THREE.MeshBasicMaterial({map:ctex(16,2,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i&1?'#fff':'#111';x.fillRect(i,0,1,1);x.fillStyle=i&1?'#111':'#fff';x.fillRect(i,1,1,1)}})}),T.x[0],T.y[0]+.1,T.z[0],sc);sl.rotation.order='YXZ';sl.rotation.set(-Math.PI/2,T.psi[0],0)}
 const occ=sc.userData.occ=[];
 /* ----- scatter helper (land only, away from the road) ----- */
 const rd=(x,z)=>{let b=1e9;for(let i=0;i<N;i+=2){const dd=Math.hypot(x-T.x[i],z-T.z[i]);if(dd<b)b=dd}return b};
 const scatter=(cnt,lo,hi,fn)=>{const out=[];for(let t=0;t<cnt*30&&out.length<cnt;t++){const x=-640+r()*1280,z=-640+r()*1280;if(WATER(x,z)||Math.abs(x)>700)continue;const q=rd(x,z);if(q<lo||q>=hi)continue;fn(x,z,out,q)}return out};
 harborDress(sc,T,H,{r,rd,WATER,occ,frame,cat});
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


/* ---------- level dressing assembled from the CC0 model pack (Kenney ships/vehicles, KayKit city + cargo bits) ---------- */
function harborDress(sc,T,H,X){const HP=P.HP;if(!HP||!HP.ready){console.warn('harbor: model pack not ready');return}
 const {r,rd,WATER,occ,frame,cat}=X,N=T.N,L={},D=n=>HP.defs[n];
 const put=(n,x,z,yaw,s,o)=>{const d=D(n);if(!d)return;o=o||{};(L[n]=L[n]||[]).push([x,o.y!=null?o.y:0,z,yaw,s,o.tint,o.sy])};
 const fit=(n,h)=>D(n)?h/D(n).h:1, fitW=(n,w)=>D(n)?w/Math.max(D(n).w,D(n).d):1;
 const free=(x,z,rad)=>{for(const q of occ)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+rad)return false;return true};
 const land=(x,z,m)=>!WATER(x,z)&&!WATER(x+m,z)&&!WATER(x-m,z)&&!WATER(x,z+m)&&!WATER(x,z-m)&&Math.abs(x)<690&&Math.abs(z)<690;
 const pick=a=>a[(r()*a.length)|0];
 /* 1) brick alleys: KayKit buildings stand shoulder to shoulder right behind the brick walls, taller than the wall so you see roofs against the sky */
 const BLDS=['bld_A','bld_B','bld_C','bld_D','bld_E','bld_F','bld_G','bld_H'].filter(D),ROOF=[0xffffff,0xf2e4d0,0xe8d8c4,0xdcc8b4,0xf4ecdc];
 for(const [a0,a1] of H.alleys)for(const sd of[-1,1]){let k=a0+1;
  while(k<a1-1){const nm=pick(BLDS);if(!nm)break;const w0=D(nm).w,d0=D(nm).d,s=(7+r()*2.5)/w0,wp=w0*s,dp=d0*s,sy=1.45+r()*.7;
   const hwk=T.hw[k],lat=sd*(hwk+2.4+dp/2),f=frame(T,k,lat),yaw=Math.atan2(-Math.cos(T.psi[k])*sd,Math.sin(T.psi[k])*sd);
   const half=Math.hypot(wp,dp)/2*.92;
   if(rd(f[0],f[1])-half>=hwk+2.2&&free(f[0],f[1],half*.8)&&land(f[0],f[1],4)){put(nm,f[0],f[1],yaw,s,{sy,tint:pick(ROOF)});occ.push([f[0],f[1],half*.8])}
   k+=Math.max(2,Math.round((wp+.4)/T.sp))}}
 /* 2) pavement furniture in the alleys: bins, hydrants, boxes, benches stay on the kerb strip, never on the asphalt */
 const FUR=[['dumpster',1.3],['firehydrant',.9],['trash_A',.8],['trash_A',.8],['box_A',.9],['box_B',.8],['barrel',.9],['bench',.85],['bush',1.4]];
 for(const [a0,a1] of H.alleys)for(let k=a0+3;k<a1-2;k+=Math.round(11/T.sp)+((r()*4)|0)){const sd=r()<.5?-1:1,[nm,h]=pick(FUR);if(!D(nm))continue;
  const f=frame(T,k,sd*(T.hw[k]+1.15));const s=fit(nm,h),yaw=Math.atan2(-Math.cos(T.psi[k])*sd,Math.sin(T.psi[k])*sd);
  put(nm,f[0],f[1],yaw,s,{y:.2})}
 /* 3) container yard on the north-east apron: stacked cargo pods, depots, trucks, cranes, wind turbines */
 const YARD={x0:226,x1:640,z0:-175,z1:-4};
 const STACK=['cargo_A_stacked','cargo_B_stacked','cargo_A_packed','cargo_B_packed','cargo_A','cargo_B'].filter(D),SHED=['cargodepot_A','cargodepot_B','cargodepot_C','basemodule_garage','basemodule_A','basemodule_D'].filter(D),TRK=['truck','truck_flat','delivery_truck','van','tractor'].filter(D);
 const yardSpot=(x,z,rad)=>land(x,z,rad)&&x>YARD.x0&&x<YARD.x1&&z>YARD.z0&&z<YARD.z1&&rd(x,z)>16+rad&&free(x,z,rad);
 /* big sheds first */
 for(let t=0,n=0;t<400&&n<13;t++){const x=YARD.x0+r()*(YARD.x1-YARD.x0),z=YARD.z0+r()*(YARD.z1-YARD.z0),nm=pick(SHED),s=fitW(nm,24+r()*8),rad=D(nm).w*s*.62;
  if(!yardSpot(x,z,rad+3))continue;put(nm,x,z,Math.round(r()*2)*Math.PI/2,s);occ.push([x,z,rad+3]);n++}
 /* stacks in tidy rows */
 for(let t=0,n=0;t<900&&n<70;t++){const x=YARD.x0+r()*(YARD.x1-YARD.x0),z=YARD.z0+r()*(YARD.z1-YARD.z0),nm=pick(STACK),yaw=Math.round(r()*2)*Math.PI/2,s=fitW(nm,/stacked/.test(nm)?5:3.4);
  const cols=2+((r()*3)|0),rows=1+((r()*3)|0),sp=D(nm).w*s+.25,rad=Math.max(cols,rows)*sp*.6+2;if(!yardSpot(x,z,rad))continue;
  const tintv=pick([0xffffff,0xffe0b8,0xc0d8ff,0xffb8a8,0xc8ffd0]);
  for(let a=0;a<cols;a++)for(let b=0;b<rows;b++)put(nm,x+Math.cos(yaw)*(a-cols/2)*sp+Math.sin(yaw)*(b-rows/2)*sp,z-Math.sin(yaw)*(a-cols/2)*sp+Math.cos(yaw)*(b-rows/2)*sp,yaw,s,{tint:tintv});
  occ.push([x,z,rad]);n++}
 for(let t=0,n=0;t<300&&n<16;t++){const x=YARD.x0+r()*(YARD.x1-YARD.x0),z=YARD.z0+r()*(YARD.z1-YARD.z0),nm=pick(TRK),s=fit(nm,3.4);if(!yardSpot(x,z,5))continue;put(nm,x,z,r()*6.28,s);occ.push([x,z,5]);n++}
 for(let t=0,n=0;t<300&&n<8;t++){const x=YARD.x0+r()*(YARD.x1-YARD.x0),z=YARD.z0+r()*(YARD.z1-YARD.z0),nm=pick(['drill_structure','structure_tall','structure_low','watertower'].filter(D)),s=fit(nm,nm==='watertower'?22:16);if(!nm||!yardSpot(x,z,10))continue;put(nm,x,z,Math.round(r()*3)*Math.PI/2,s);occ.push([x,z,10]);n++}
 for(let t=0,n=0;t<400&&n<6;t++){const x=-640+r()*1280,z=-640+r()*500,nm=pick(['windturbine_tall','windturbine_low'].filter(D));if(!nm||!land(x,z,6)||rd(x,z)<60||!free(x,z,12))continue;put(nm,x,z,r()*6.28,fit(nm,40));occ.push([x,z,12]);n++}
 /* 4) crate rows on the west quay edge (x<215, z 60..310): stay >14 m from the asphalt */
 for(let z=70;z<312;z+=7+r()*8){const nm=pick(STACK),x=207-r()*4;if(!nm)continue;const s=fitW(nm,/stacked/.test(nm)?4:3);if(rd(x,z)<12||!free(x,z,3))continue;put(nm,x,z,Math.round(r()*2)*Math.PI/2,s);occ.push([x,z,3])}
 /* 5) ships: moored in the east basin and out at sea, plus rowboats and a wreck */
 const wl=-1.3,ship=(nm,x,z,yaw,len)=>{const d=D(nm);if(!d)return;const s=len/Math.max(d.d,d.w);put(nm,x,z,yaw,s,{y:wl-d.min.y*s-d.h*s*.03})};
 ship('ship_dark',470,95,0,52);ship('ship_light',560,215,Math.PI,50);ship('ship_dark',690,120,Math.PI,56);ship('ship_wreck',690,290,.5,46);
 ship('ship_light',60,400,Math.PI/2,54);ship('ship_dark',310,420,-Math.PI/2,60);ship('ship_light',-170,470,Math.PI/2,50);ship('ship_dark',560,470,Math.PI/2,64);ship('ship_dark',420,330,.6,46);
 for(const [x,z,yaw] of[[290,150,.3],[300,205,-.5],[276,115,1.2],[380,40,.2],[390,190,2.4],[236,230,0]]){const nm=r()<.5?'boat_large':'boat_small';if(D(nm))put(nm,x,z,yaw,fit(nm,1.4),{y:wl-.05})}
 /* 6) piers: benches and crates along the boardwalk */
 for(let k=H.pier[0]+4;k<H.pier[1]-2;k+=Math.round(26/T.sp)){const sd=r()<.5?-1:1,f=frame(T,k,sd*(T.hw[k]-1.0)),yaw=Math.atan2(-Math.cos(T.psi[k])*sd,Math.sin(T.psi[k])*sd);
  if(D('bench'))put('bench',f[0],f[1],yaw+Math.PI,fitW('bench',2.2),{y:.1})}
 for(const n in L)HP.add(sc,n,L[n])}

/* time of day tints the unlit backdrop and the water */
const TINT={dawn:[1.0,.82,.78],day:[1,1,1],sunset:[1,.66,.52],night:[.1,.14,.3]},WT={dawn:[1,.85,.85],day:[1,1,1],sunset:[1,.7,.6],night:[.18,.24,.5]};
if(P.applyTod){const at=P.applyTod;P.applyTod=(sc,T,key)=>{at(sc,T,key);const h=sc.userData&&sc.userData.harbor;if(!h)return;const t=TINT[key]||TINT.day,w=WT[key]||WT.day;h.pano.color.setRGB(t[0],t[1],t[2]);h.water.color.setRGB(.035,.3,.46).multiply(new THREE.Color(w[0],w[1],w[2]))}}
const bw=buildWorld;buildWorld=T=>T.d.harbor?buildHarbor(T):bw(T);
})();
