/* ===== Poly GT layer: Free Roam world (island height field, road network, stops, chunk streaming) ===== */
(function frworld(){
'use strict';
const P=window.PT8;
const S=6,CELL=8,WX=6720,WZ=4720,GX=WX/CELL+1,GZ=WZ/CELL+1,CH=192,CC=CH/CELL;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
/* ---------- noise ---------- */
const H2=(i,j)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
function vn(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz),a=H2(i,j),b=H2(i+1,j),c=H2(i,j+1),d=H2(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,z,o){let s=0,a=.5,f=1,n=0;for(let k=0;k<o;k++){s+=a*vn(x*f+k*17.3,z*f-k*9.1);n+=a;a*=.5;f*=2.03}return s/n}
function rng(seed){let s=seed>>>0||1;return()=>{s=Math.imul(s^(s>>>15),2246822507);s=Math.imul(s^(s>>>13),3266489909);s^=s>>>16;return(s>>>0)/4294967296}}
/* ---------- layout: filled from the island generator (frisland.js) when the world is built ---------- */
const ROADS=[],PLAT=[],ZONES=[],POIS=[],POIBY={},SPAWN={x:0,z:0,yaw:0},TOWNS=[],RUN={on:0,x0:0,z0:0,x1:0,z1:0,hw:20};
let W=null,G=null;
const inTown=(x,z,m)=>{for(const t of TOWNS){const r=t.rad+(m||0);if((x-t.x)*(x-t.x)+(z-t.z)*(z-t.z)<r*r)return true}return false};
/* ---------- raster build (once) ---------- */
/* flat areas (lots, the overlook): rotated rectangles that pull the ground to one height, blending out over a margin */
function fullH(x,z){let h=G.baseH(x,z);for(let k=0;k<PLAT.length;k++){const p=PLAT[k],c=Math.cos(p.ry||0),s=Math.sin(p.ry||0),dx=x-p.x,dz=z-p.z,lx=dx*c-dz*s,lz=dx*s+dz*c,ox=Math.max(Math.abs(lx)-p.w/2,0),oz=Math.max(Math.abs(lz)-p.d/2,0),q=1-sm(0,p.m,Math.hypot(ox,oz));if(q>0)h=lerp(h,p.h,q)}return h}
function buildWorld(){if(W)return W;
 const t0=performance.now();W={};G=P.FRI.make({seed:(P.FRW&&P.FRW.seed)||11});W.G=G;
 ROADS.length=0;PLAT.length=0;ZONES.length=0;POIS.length=0;TOWNS.length=0;for(const k in POIBY)delete POIBY[k];
 for(const r of G.roads)ROADS.push(r);
 const st=G.stops;for(const p of st.plat)PLAT.push(p);for(const z of st.zones)ZONES.push(z);for(const p of st.pois){POIS.push(p);POIBY[p.id]=p}
 Object.assign(SPAWN,st.spawn);if(st.run)Object.assign(RUN,st.run,{on:1});
 for(const s of G.sites)if(s.town)TOWNS.push({x:s.x,z:s.z,rad:s.rad||200,id:s.id});
 if(P.FRD&&P.FRD.plan)P.FRD.plan({G,ROADS,TOWNS,POIS,ZONES,PLAT,fullH,rng,fbm,H2,inTown});
 /* raster: nearest road distance, its height and how far its grading reaches */
 const dd=new Float32Array(GX*GZ).fill(1e4),ry=new Float32Array(GX*GZ),gw=new Float32Array(GX*GZ).fill(22);
 for(const r of ROADS){const g=r.gr||22,R=r.hw+g+4;for(let i=0;i<r.n-1;i++){const ax=r.x[i],az=r.z[i],bx=r.x[i+1],bz=r.z[i+1],ex=bx-ax,ez=bz-az,L2=ex*ex+ez*ez||1;
   const i0=Math.max(0,Math.floor((Math.min(ax,bx)-R)/CELL)),i1=Math.min(GX-1,Math.ceil((Math.max(ax,bx)+R)/CELL)),j0=Math.max(0,Math.floor((Math.min(az,bz)-R)/CELL)),j1=Math.min(GZ-1,Math.ceil((Math.max(az,bz)+R)/CELL));
   for(let j=j0;j<=j1;j++)for(let q=i0;q<=i1;q++){const x=q*CELL,z=j*CELL,t=clamp(((x-ax)*ex+(z-az)*ez)/L2,0,1),px=ax+ex*t,pz=az+ez*t,d=Math.hypot(x-px,z-pz)-r.hw,k=j*GX+q;if(d<dd[k]){dd[k]=d;ry[k]=lerp(r.y[i],r.y[i+1],t);gw[k]=g}}}}
 W.dd=dd;const HR=new Float32Array(GX*GZ);
 for(let j=0;j<GZ;j++)for(let i=0;i<GX;i++){const k=j*GX+i,x=i*CELL,z=j*CELL;let h=fullH(x,z);const d=dd[k];if(d<gw[k]+4){const w=sm(2.5,gw[k],d);h=lerp(ry[k],h,w)}HR[k]=h}
 W.HR=HR;
 /* where road ends meet, a round patch covers the notches the square ends leave */
 W.junc=[];{const J=[];for(const r of ROADS)for(const e of[0,r.n-1]){let c=null;for(const j of J)if(Math.hypot(j.x-r.x[e],j.z-r.z[e])<14){c=j;break}if(!c)J.push(c={x:r.x[e],z:r.z[e],m:[]});c.m.push([r,e])}
  for(const j of J)if(j.m.length>=2){let sx=0,sz=0;for(const[r,e]of j.m){sx+=r.x[e];sz+=r.z[e]}W.junc.push({x:sx/j.m.length,z:sz/j.m.length,r:Math.max(...j.m.map(q=>q[0].hw))+.4,dy:Math.max(...j.m.map(q=>q[0].dy))+.1})}}
 /* zones (rotated rectangles): 1 town stone, 2 lot, 4 piazza */
 const Z=new Uint8Array(GX*GZ);for(const z of ZONES){const c=Math.cos(z[5]||0),s=Math.sin(z[5]||0),hr=Math.hypot(z[2],z[3])/2,i0=Math.floor((z[0]-hr)/CELL),i1=Math.ceil((z[0]+hr)/CELL),j0=Math.floor((z[1]-hr)/CELL),j1=Math.ceil((z[1]+hr)/CELL);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(i<0||j<0||i>=GX||j>=GZ)continue;const dx=i*CELL-z[0],dz=j*CELL-z[1],lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<=z[2]/2&&Math.abs(lz)<=z[3]/2)Z[j*GX+i]=z[4]}}W.Z=Z;
 /* road hash for physics */
 const HC=32,hash=new Map(),put=(k,s)=>{let a=hash.get(k);if(!a)hash.set(k,a=[]);a.push(s)};
 W.segs=[];for(const r of ROADS){for(let i=0;i<r.n-1;i++){const s={ax:r.x[i],az:r.z[i],bx:r.x[i+1],bz:r.z[i+1],hw:r.hw,r};s.ex=s.bx-s.ax;s.ez=s.bz-s.az;s.L2=s.ex*s.ex+s.ez*s.ez||1;s.psi=Math.atan2(s.ex,s.ez);
   const i0=Math.floor((Math.min(s.ax,s.bx)-r.hw)/HC),i1=Math.floor((Math.max(s.ax,s.bx)+r.hw)/HC),j0=Math.floor((Math.min(s.az,s.bz)-r.hw)/HC),j1=Math.floor((Math.max(s.az,s.bz)+r.hw)/HC);for(let a=i0;a<=i1;a++)for(let b=j0;b<=j1;b++)put(a*4096+b,s)}}
 W.hash=hash;W.HC=HC;W.ms=performance.now()-t0;return W}
function Hf(x,z){const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i,a=W.HR;return a[k]*(1-fx)*(1-fz)+a[k+1]*fx*(1-fz)+a[k+GX]*(1-fx)*fz+a[k+GX+1]*fx*fz}
/* the height of the terrain mesh itself (the triangles the chunks are built from), so a road laid on it never sinks into a cell's diagonal */
function Hm(x,z){const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i,a=W.HR[k],b=W.HR[k+1],c=W.HR[k+GX],d=W.HR[k+GX+1];
 if((i+j)&1)return fx+fz<=1?a+(b-a)*fx+(c-a)*fz:d+(c-d)*(1-fx)+(b-d)*(1-fz);
 return fx>=fz?a+(b-a)*fx+(d-b)*fz:a+(d-c)*fx+(c-a)*fz}
function roadAt(x,z){const l=W.hash.get(Math.floor(x/W.HC)*4096+Math.floor(z/W.HC));let best=null,bd=1e9;if(l)for(const s of l){const t=clamp(((x-s.ax)*s.ex+(z-s.az)*s.ez)/s.L2,0,1),px=s.ax+s.ex*t,pz=s.az+s.ez*t,d=Math.hypot(x-px,z-pz)-s.hw;if(d<bd){bd=d;best={s,d,t,px,pz}}}return bd<0?best:null}
const roadDist=(x,z)=>{const u=clamp(x/CELL,0,GX-1),v=clamp(z/CELL,0,GZ-1);return W.dd[(Math.round(v))*GX+Math.round(u)]};
/* ---------- ground colours: sand, grass, scrub and pine land, limestone ----------
   written as the sRGB colour you would paint; cc() turns it into what the lit, gamma-corrected material needs */
const cc=h=>{const c=[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];return c.map(v=>Math.pow(v,2.2)/.72)};
const COL={sand:cc(0xe9dcae),seaS:cc(0xd9d3a6),seaM:cc(0x6fb0a0),seaD:cc(0x1b4b60),grass:cc(0x6b9a3a),lush:cc(0x4f8a34),dry:cc(0xb2a95a),maquis:cc(0x5d7a38),olive:cc(0x7f9456),pine:cc(0x2c5a30),soil:cc(0xa9805a),
 rock:cc(0x8f8573),rockD:cc(0x625a4d),cliff:cc(0xdccfb4),stone:cc(0xa8957a),stoneD:cc(0x85735c),lot:cc(0x5a5d66),piazza:cc(0xcdb98f),foam:cc(0xf2f2ea)};
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function groundColor(x,z,h,sl,zn,d,nz,fo,dr){
 if(zn===1)return mixc(COL.stone,COL.stoneD,nz*.55);if(zn===2)return COL.lot;if(zn===4)return mixc(COL.piazza,COL.stone,nz*.5);
 if(h<=0){if(h>-.4)return COL.foam;const t=-h;return t<5?mixc(COL.seaS,COL.seaM,sm(.4,5,t)):mixc(COL.seaM,COL.seaD,sm(5,32,t))}
 /* lowland grass, drying to straw in patches */
 let c=mixc(COL.grass,COL.dry,dr*.6);c=mixc(c,COL.lush,sm(.55,.2,nz)*(1-dr)*.55);
 /* lowland farm plots: a patchwork of tilled, fallow and green fields on gentle ground */
 if(h>3&&h<95&&sl<.2){const reg=sm(.5,.62,fbm(x/760+5,z/760+11,2));if(reg>0){const u=Math.floor((x*.94+z*.34)/70),v=Math.floor((-x*.34+z*.94)/55),q=H2(u*7+3,v*11+5);
  c=mixc(c,q<.24?COL.lush:q<.46?COL.dry:q<.64?COL.soil:q<.8?COL.olive:COL.grass,reg*.88*(1-sm(.12,.2,sl)))}}
 /* scrub (maquis) and olive land on the hills, pine woods where the forest noise is high */
 const hill=sm(25,120,h);c=mixc(c,mixc(COL.maquis,COL.olive,sm(.35,.7,nz)),hill*.62*(1-dr*.4));
 const fr=sm(.5,.62,fo);c=mixc(c,mixc(COL.lush,COL.pine,sm(20,110,h)),fr*.9);
 /* bare patches of soil */
 c=mixc(c,COL.soil,sm(.78,.9,nz)*(1-fr)*.45);
 /* high ground: scrub and dry meadow in a patchwork, grey limestone only on steep faces and in bare patches */
 const alt=sm(130,320,h);c=mixc(c,mixc(COL.maquis,COL.dry,sm(.2,.7,dr)*.7),alt*.55*(1-fr));
 const band=.5+.5*Math.sin(h*.42+nz*5);const rk=Math.max(sm(.4,.78,sl),alt*sm(.3,.7,dr)*.9);
 if(rk>0)c=mixc(c,mixc(COL.rock,COL.rockD,sm(.55,1.05,sl)*.65+band*.15),rk);
 /* sea cliffs are pale where they are steep */
 if(d<80){const cl=sm(.3,.58,sl)*(1-sm(40,80,d));if(cl>0)c=mixc(c,COL.cliff,cl*.8)}
 /* beach */
 const b=Math.max(sm(3.4,1.2,h)*sm(80,30,d),sm(30,8,d)*(1-sm(.22,.38,sl)));if(b>0)c=mixc(c,COL.sand,b);
 return c}
/* ---------- geometry builders ---------- */
function GB(){const pos=[],col=[];const o={pos,col,
 tri(a,b,c,k){pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let i=0;i<3;i++)col.push(k[0],k[1],k[2])},
 quad(a,b,c,d,k){o.tri(a,b,c,k);o.tri(a,c,d,k)},
 box(x,y,z,w,h,d,k,ry,tp){ /* centre x,z; y = bottom */ const c=Math.cos(ry||0),s=Math.sin(ry||0),hx=w/2,hz=d/2,P=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
  const A=P(-hx,0,-hz),B=P(hx,0,-hz),C=P(hx,0,hz),D=P(-hx,0,hz),E=P(-hx,h,-hz),F=P(hx,h,-hz),G=P(hx,h,hz),Hh=P(-hx,h,hz),sh=k=>[k[0]*.78,k[1]*.78,k[2]*.78],t=tp||k;
  o.quad(E,Hh,G,F,t);o.quad(A,B,F,E,sh(k));o.quad(B,C,G,F,sh(k));o.quad(C,D,Hh,G,sh(k));o.quad(D,A,E,Hh,sh(k))},
 cone(x,y,z,r,h,n,k){const a=[];for(let i=0;i<n;i++){const t=i/n*6.2832;a.push([x+Math.cos(t)*r,y,z+Math.sin(t)*r])}const top=[x,y+h,z],sh=[k[0]*.8,k[1]*.8,k[2]*.8];for(let i=0;i<n;i++){const a0=a[i],a1=a[(i+1)%n];o.tri(a0,a1,top,i&1?k:sh);o.tri(a1,a0,[x,y,z],sh)}},
 cyl(x,y,z,r,h,n,k){const a=[],b=[];for(let i=0;i<n;i++){const t=i/n*6.2832;a.push([x+Math.cos(t)*r,y,z+Math.sin(t)*r]);b.push([x+Math.cos(t)*r,y+h,z+Math.sin(t)*r])}for(let i=0;i<n;i++){const j=(i+1)%n,s=i&1?k:[k[0]*.85,k[1]*.85,k[2]*.85];o.quad(a[i],a[j],b[j],b[i],s);o.tri(b[i],b[j],[x,y+h,z],k)}},
 ico(x,y,z,r,k,sq){const t=1.618,v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p=>{const l=Math.hypot(...p);return[x+p[0]/l*r,y+p[1]/l*r*(sq||1),z+p[2]/l*r]}),f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];f.forEach((q,i)=>o.tri(v[q[0]],v[q[1]],v[q[2]],i%3?k:[k[0]*.86,k[1]*.86,k[2]*.86]))},
 build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();return g}};return o}
/* textured walls: facade windows */
function WB(){const pos=[],uv=[],col=[];const o={pos,uv,col,
 wall(a,b,h,k,vs,u0){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);pos.push(a[0],a[2],a[1],b[0],b[2],b[1],b[0],b[2]+h,b[1],a[0],a[2],a[1],b[0],b[2]+h,b[1],a[0],a[2]+h,a[1]);
  const ul=L/9,vh=h/(vs||9);uv.push(u0,0,u0+ul,0,u0+ul,vh,u0,0,u0+ul,vh,u0,vh);for(let i=0;i<6;i++)col.push(k[0],k[1],k[2])},
 build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();return g}};return o}
/* ---------- materials / textures ---------- */
let MAT=null;const SIGN={};
function mats(){if(MAT)return MAT;
 const road=ctex(64,64,(x,w,h)=>{x.fillStyle='#3a3d44';x.fillRect(0,0,w,h);for(let i=0;i<260;i++){const v=40+Math.random()*26|0;x.fillStyle='rgb('+v+','+v+','+(v+6)+')';x.fillRect(Math.random()*w|0,Math.random()*h|0,1,1)}
  x.fillStyle='#e9e6d4';x.fillRect(3,0,2,h);x.fillRect(w-5,0,2,h);x.fillStyle='#e8c84a';x.fillRect(w/2-1,0,2,h*.45)});
 const win=ctex(64,64,(x,w,h)=>{x.fillStyle='#d8dadf';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<4;c++){const lit=Math.random()<.22;x.fillStyle=lit?'#ffe9a8':'#33465e';x.fillRect(c*16+3,r*16+4,10,8);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(c*16+3,r*16+12,10,1)}x.fillStyle='rgba(0,0,0,.12)';for(let r=0;r<4;r++)x.fillRect(0,r*16+14,w,1)});
 const run=ctex(32,256,(x,w,h)=>{x.fillStyle='#2b2d33';x.fillRect(0,0,w,h);x.fillStyle='#f2f2f2';x.fillRect(2,0,2,h);x.fillRect(w-4,0,2,h);for(let i=0;i<8;i++)x.fillRect(w/2-1,i*32+6,2,18)});
 const lane=ctex(64,64,(x,w,h)=>{x.fillStyle='#8a7355';x.fillRect(0,0,w,h);for(let i=0;i<340;i++){const v=100+Math.random()*50|0;x.fillStyle='rgb('+v+','+(v-14)+','+(v-40)+')';x.fillRect(Math.random()*w|0,Math.random()*h|0,2,1)}x.fillStyle='rgba(60,45,30,.45)';x.fillRect(w*.28,0,w*.14,h);x.fillRect(w*.6,0,w*.14,h)});
 const alley=ctex(64,64,(x,w,h)=>{x.fillStyle='#4a4b50';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){const v=56+Math.random()*34|0;x.fillStyle='rgb('+v+','+v+','+(v+4)+')';x.fillRect(Math.random()*w|0,Math.random()*h|0,2,1)}x.fillStyle='rgba(20,20,22,.45)';x.fillRect(w*.3,0,w*.12,h);x.fillRect(w*.6,0,w*.12,h);x.fillStyle='rgba(30,28,24,.35)';for(let i=0;i<4;i++)x.fillRect(Math.random()*w,Math.random()*h,9,5)});
 const mk=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},o));if(typeof styleMaterial==='function')styleMaterial(m);return m};
 MAT={alley:mk({map:alley,color:0xa0a0a0,polygonOffset:true,polygonOffsetFactor:-.5,polygonOffsetUnits:-.5,side:THREE.DoubleSide}),lane:mk({map:lane,color:0xb0b0b0,polygonOffset:true,polygonOffsetFactor:-.5,polygonOffsetUnits:-.5,side:THREE.DoubleSide}),terrain:mk({vertexColors:true,color:0x8c8c8c,flatShading:true,roughness:1}),road:mk({map:road,color:0xa8a8a8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}),run:mk({map:run,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,side:THREE.DoubleSide}),
  props:mk({vertexColors:true,color:0x909090,flatShading:true,side:THREE.DoubleSide}),walls:mk({vertexColors:true,color:0x949494,map:win,roughness:.8,side:THREE.DoubleSide}),
  glass:mk({color:0x8fd0ff,emissive:0x1d4e7a,roughness:.15,metalness:.4,flatShading:true}),neon:new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true})};
 run.repeat.set(1,1);return MAT}
function signTex(txt,bg,fg,w,h){const key=txt+bg+fg;if(SIGN[key])return SIGN[key];const t=ctex(256,64,(x,W_,H_)=>{x.fillStyle=bg;x.fillRect(0,0,W_,H_);x.strokeStyle=fg;x.lineWidth=4;x.strokeRect(3,3,W_-6,H_-6);x.fillStyle=fg;x.font='900 '+(txt.length>12?26:34)+'px Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,W_/2,H_/2+2)});t.minFilter=t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return SIGN[key]=t}
function sign(txt,w,h,bg,fg){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(txt,bg,fg),side:THREE.DoubleSide}));return m}
/* ---------- stop structures (each is built in a frame: origin at the stop's marker, +z toward the road) ---------- */
const hexC=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
function signAt(ctx,txt,x,y,z,w,h,bg,fg,ry){const s=sign(txt,w,h,bg,fg);s.position.set(x,y,z);s.rotation.y=ry||0;ctx.group.add(s)}
function frame(ctx,x0,z0,ry){const c=Math.cos(ry),s=Math.sin(ry),X=(a,b)=>x0+a*c+b*s,Z=(a,b)=>z0-a*s+b*c;
 const wg=B=>({pos:B.pos,col:B.col,box:(x,y,z,w,h,d,k,r,tp)=>B.box(X(x,z),y,Z(x,z),w,h,d,k,(r||0)+ry,tp),cyl:(x,y,z,a,b,n,k)=>B.cyl(X(x,z),y,Z(x,z),a,b,n,k),cone:(x,y,z,a,b,n,k)=>B.cone(X(x,z),y,Z(x,z),a,b,n,k),ico:(x,y,z,a,b,n)=>B.ico(X(x,z),y,Z(x,z),a,b,n)});
 return{X,Z,ry,G:wg(ctx.G),N:wg(ctx.N),T:wg(ctx.T),group:ctx.group,gy:(x,z)=>ctx.gy(X(x,z),Z(x,z)),park:(x,z,r,i)=>ctx.park(X(x,z),Z(x,z),(r||0)+ry,i),tree:(x,z,s,k)=>ctx.tree(X(x,z),Z(x,z),s,k),
  sg:(a,b,c,d,r)=>ctx.sg(X(a,b),Z(a,b),X(c,d),Z(c,d),r),pt:(x,z,r)=>ctx.pt(X(x,z),Z(x,z),r),
  mput:(n,x,z,r,s,o)=>P.FRD.mput(ctx,n,X(x,z),Z(x,z),(r||0)+ry,s,o),sign:(txt,x,y,z,w,h,bg,fg,r)=>signAt(ctx,txt,X(x,z),y,Z(x,z),w,h,bg,fg,(r||0)+ry),
  lamp(x,z,r){const y=ctx.gy(X(x,z),Z(x,z));this.G.box(x,y,z,.22,6.2,.22,[.25,.26,.3]);this.G.box(x+.8,y+6.1,z,1.8,.18,.28,[.25,.26,.3],r||0);this.N.box(x+1.45,y+5.9,z,.8,.16,.45,[1.6,1.5,1.1],r||0);ctx.pt(X(x,z),Z(x,z),.4)}}}
/* a model fitted to a real-world footprint, set behind the marker with its front 4 m away from it */
function bldg(f,name,Wd,Ht,maxD,front,o){const D=P.FRD,fit=D.fit(name,Wd,Ht,maxD),sz=P.FM.size(name),hd=sz[2]*fit.s/2;const b=f.mput(name,0,-((front==null?4:front)+hd),0,fit.s,Object.assign({sy:fit.sy},o||{}));return b&&Object.assign(b,{front:front==null?4:front,Ht})}
const nm=(a,b)=>P.FM&&P.FM.get(a)?a:b;
const STRUCT={
 garage(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),b=bldg(f,'building-garage',26,8.5,22);if(!b)return;const yy=f.gy(0,-4);
  f.sign('HOME GARAGE',0,b.y+9.6,-3.4,13,2.8,'#1b1f27','#ffd34d');f.lamp(-17,-2);f.lamp(17,-2);f.park(-5,6,.1,1);f.tree(-28,-18,.9,.5);f.tree(28,-18,.9,.5)},
 brand(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),b=bldg(f,nm('md_hotel_d','b_CompanyBuilding_04'),24,19,22);if(!b)return;
  f.sign('BRAND CENTRAL',0,b.y+8.2,-3.4,22,3.8,'#0f1824','#4dd2ff');f.N.box(-20,b.y,-3,.8,12,.8,[.3,1.6,2.2]);f.N.box(20,b.y,-3,.8,12,.8,[.3,1.6,2.2]);for(let q=0;q<5;q++)f.park(-16+q*8,8,q&1?.15:-.15,q*3+1)},
 office(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),b=bldg(f,nm('md_hotel_c','b_CompanyBuilding_04'),22,16,22);if(!b)return;
  f.sign('RACE OFFICE',0,b.y+7,-3.4,16,3,'#201018','#ff4dd2');for(let i=0;i<8;i++)for(let j=0;j<2;j++)f.G.box(-8+i*2.2,b.y+9.4+j*1.1,-3.5,1.1,1.1,.2,((i+j)&1)?[.95,.95,.95]:[.08,.08,.08]);f.lamp(20,-2);f.tree(-24,4,.8,.5);f.park(-4,6,1.6,5)},
 tune(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),b=bldg(f,nm('md_shop_c','b_CommercialBuilding_03'),22,8,16);if(!b)return;
  for(let i=0;i<3;i++)f.N.box(-9+i*9,b.y+4.8,-3.5,6,.25,.25,[.4,.6,2.0]);f.sign('TUNE SHOP',0,b.y+9.0,-3.4,14,2.6,'#10162a','#4d7dff');f.park(16,8,1.2,2);f.park(-10,10,-.4,9);f.park(2,14,2.8,6)},
 job(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),b=bldg(f,nm('md_house_c','building-small-d'),12,8,12);if(!b)return;
  f.sign('JOB BOARD',0,b.y+9.4,-3.4,9,2,'#0f221a','#4dffb0');f.G.box(0,b.y,6,5,2.2,.3,[.45,.34,.22]);f.G.box(-2.2,b.y,6.1,.2,2.6,.2,[.3,.2,.12]);f.G.box(2.2,b.y,6.1,.2,2.6,.2,[.3,.2,.12])},
 gas(ctx,p){const f=frame(ctx,p.x,p.z,p.ry),y=f.gy(0,0),b=bldg(f,nm('md_store','b_StoreBuilding_01'),15,6,10,14);if(!b)return;
  const cy=y+4.9;f.G.box(0,cy,2,22,.6,14,[.9,.2,.18]);f.G.box(0,cy+.6,2,22.4,.3,14.4,[.95,.95,.95]);
  for(const sx of[-9.5,9.5])for(const sz of[-3.5,7.5])f.G.box(sx,y,sz,.55,4.9,.55,[.8,.8,.82]);
  for(const sx of[-5,5])for(const sz of[.5,4.5]){f.G.box(sx,y,sz,.7,1.5,.55,[.85,.12,.1]);f.G.box(sx,y+1.2,sz,.74,.2,.58,[.95,.95,.95])}
  f.sign('GAS STATION',0,b.y+5.6,-13.4,11,2.2,'#2a0f0c','#ff6a4d');f.G.box(18,y,16,.5,9,.5,[.7,.7,.74]);f.sign('GAS',18,y+9.3,16.3,4,1.6,'#d42b22','#ffffff');f.park(-4,3,1.57,3);f.park(6,14,.1,8)},
 meet(ctx,p){const f=frame(ctx,p.x,p.z,p.ry+Math.PI*0),y=f.gy(0,0);for(let i=-3;i<=3;i++)f.lamp(-70,i*14);
  const cs=[[-45,-30,.3],[-15,-30,.2],[15,-30,.1],[45,-30,-.1],[-45,30,3.1],[-15,30,3.3],[15,30,3],[45,30,3.2],[-45,0,1.6],[55,-8,1.7]];cs.forEach((c,i)=>f.park(c[0],c[1],c[2],i));
  f.sign('CAR MEET',-60,y+9,-52,16,3,'#1d1308','#ffa24d',.4);f.G.box(-60,y,-52,.4,9,.4,[.3,.3,.34])},
 drift(ctx,p){const f=frame(ctx,p.x,p.z,0),y=f.gy(0,0);for(const r of[34,66,98])for(let i=0;i<22;i++){const t=i/22*6.28,cx=Math.cos(t)*r*1.15,cz=Math.sin(t)*r;f.G.cone(cx,f.gy(cx,cz),cz,.45,1.1,6,i%2?[1,.45,.1]:[.95,.95,.95])}
  for(let i=0;i<5;i++)f.N.box(-110+i*55,y+7,-96,1.2,.7,.5,[1.8,.4,1.8]);f.sign('DRIFT YARD',0,y+9,-98,22,4,'#180d26','#b04dff')},
 trap(ctx,p){const r=roadAt(p.x,p.z);if(!r)return;const psi=r.s.psi,c=Math.cos(psi),s=Math.sin(psi),hw=r.s.hw+2,y=ctx.gy(p.x,p.z);
  for(const sd of[-1,1])ctx.G.box(p.x+c*hw*sd,y,p.z-s*hw*sd,.8,9,.8,[.5,.52,.58],psi);ctx.G.box(p.x,y+8.6,p.z,hw*2+1,.9,.9,[.4,.42,.48],psi);
  ctx.N.box(p.x,y+7.9,p.z,1.2,.5,.6,[2.0,.3,.3],psi);signAt(ctx,'SPEED CHECK',p.x,y+10.6,p.z,12,2.2,'#0f1a0a','#7dff4d',psi);signAt(ctx,'SPEED CHECK',p.x,y+10.6,p.z,12,2.2,'#0f1a0a','#7dff4d',psi+Math.PI)},
 view(ctx,p){const x=p.x,z=p.z,y=ctx.gy(x,z),H=20,near=(a,b)=>{for(const[u,v]of[[0,0],[4,0],[-4,0],[0,4],[0,-4]])if(roadAt(a+u,b+v))return true;return false};
  /* a low stone parapet round the square, open where the three roads come in */
  for(let i=0;i<10;i++){const t=-H+2+i*4;for(const[px,pz,ry]of[[x+t,z-H,0],[x+t,z+H,0],[x-H,z+t,Math.PI/2],[x+H,z+t,Math.PI/2]]){if(near(px,pz))continue;const gy=ctx.gy(px,pz);ctx.G.box(px,gy-.7,pz,4.05,1.8,.6,[.66,.6,.5],ry);ctx.G.box(px,gy+1.05,pz,4.1,.2,.8,[.8,.74,.62],ry)}}
  signAt(ctx,'MONTE GRANDE',x-9,y+3,z+2,7,1.4,'#102030','#ffffff',1.2)},
 run(ctx,p){if(!RUN.on)return;for(const[x,z]of[[RUN.x0,RUN.z0],[RUN.x1,RUN.z1]]){const r=roadAt(x,z);if(!r)continue;const psi=r.s.psi,c=Math.cos(psi),s=Math.sin(psi),hw=r.s.hw+2,y=ctx.gy(x,z);
   for(const sd of[-1,1])ctx.G.box(x+c*hw*sd,y,z-s*hw*sd,.7,7,.7,[.5,.52,.58],psi);ctx.G.box(x,y+6.6,z,hw*2+1,.8,.8,[.9,.5,.1],psi);signAt(ctx,'LUNGOMARE RUN',x,y+8.4,z,10,1.8,'#2a1608','#ff9a3c',psi);signAt(ctx,'LUNGOMARE RUN',x,y+8.4,z,10,1.8,'#2a1608','#ff9a3c',psi+Math.PI)}}
};
/* ---------- chunk builder ---------- */
function ctxFor(cx,cz,group){const G0=GB(),N=GB(),Wb=WB(),trees=GB(),ctx={G:G0,N,W:Wb,group,T:trees,segs:[],pts:[],cars:[],gy:(x,z)=>Hf(x,z),
 sg(a,b,c,d,r){ctx.segs.push([a,b,c,d,r||.4])},pt(x,z,r){ctx.pts.push([x,z,r])},sp(x,z,r){ctx.pts.push([x,z,r])},
 tree(x,z,s,kk){const y=Hf(x,z);if(y<2.2||y>190)return;const k=kk!=null?kk:H2(Math.floor(x),Math.floor(z));s=s||1;const fm=P.FM;if(!fm)return;
  const names=['q_umb1','q_umb2','q_pine1','q_pine3','q_oak3','q_oak5'],hs=[12,11,14,14,8,8],i=Math.floor(k*names.length)%names.length;
  fm.put(trees,names[i],x,y-.3,z,hs[i]*s*(.85+k*.3),k*37.7,{tint:[.92+k*.12,.98,.9+k*.1]});ctx.pts.push([x,z,.5*s])},
 park(x,z,ry,i){ctx.cars.push([x,z,ry,i==null?0:i])}};return ctx}
const slopeAt=(x,z)=>{const e=CELL;return Math.hypot(Hf(x+e,z)-Hf(x-e,z),Hf(x,z+e)-Hf(x,z-e))/(2*e)};
/* plants by place: umbrella pines on the coast, pine woods higher up, olive orchards in rows, scrub everywhere */
function nature(ctx,cx,cz){const fm=P.FM;if(!fm)return;const x0=cx*CH,z0=cz*CH,r=rng(cx*31337+cz*7919+11),T=ctx.T;
 const ok=(x,z)=>{if(x<20||z<20||x>WX-20||z>WZ-20)return false;const k=(Math.round(z/CELL))*GX+Math.round(x/CELL);return!W.Z[k]&&W.dd[k]>8};
 const PN=['q_pine1','q_pine2','q_pine3','q_pine4'],ON=['q_oak3','q_oak4','q_oak5'],UM=['q_umb1','q_umb2'],BU=['q_bush1','q_bush2'];
 const put=(n,x,z,hgt,tint)=>{const y=Hf(x,z),sz=fm.size(n)[1]||1;fm.put(T,n,x,y-.25,z,hgt/sz,r()*6.28,{tint,v:(r()-.5)*.16});return y};
 for(let gz=0;gz<CH/13;gz++)for(let gx=0;gx<CH/13;gx++){const x=x0+gx*13+r()*13,z=z0+gz*13+r()*13,q=r(),t=r(),u=r();if(!ok(x,z))continue;
  const h=Hf(x,z);if(h<2.6||h>205)continue;const d=G.sd(x,z);if(d<14)continue;const sl=slopeAt(x,z);if(sl>.78)continue;
  const fo=fbm(x/520+9,z/520,2),pf=(.1+sm(.46,.62,fo)*.62)*(1-sm(.45,.72,sl))*(1-sm(150,205,h))*sm(10,60,d)*(inTown(x,z,60)?.15:1);
  if(h<95&&d<320&&q<.12*(1-sm(.3,.5,sl))){const tn=.9+u*.2;put(UM[(t*2)|0],x,z,10+u*5,[tn,tn,tn]);ctx.pts.push([x,z,.6]);continue}
  if(q<pf){if(h<80&&t<.4){const tn=.85+u*.2;put(ON[(t*7.5)|0],x,z,7+u*3,[tn*.95,tn,tn*.9])}else{const tn=.86+u*.24;put(PN[(t*4)|0],x,z,12+u*7,[tn,tn,tn*.95])}ctx.pts.push([x,z,.6]);continue}
  if(q<pf+.2&&sl<.6){put(BU[(t*2)|0],x,z,1.3+u*1.1,[.95+u*.15,1,.85+u*.2])}}
 /* orchards: regular rows on gentle ground, in patches */
 for(let a=0;a<CH/11;a++)for(let b=0;b<CH/13;b++){const x=x0+a*11+(b&1?5:0)+(r()-.5)*1.2,z=z0+b*13+(r()-.5)*1.2;if(!ok(x,z))continue;const og=fbm(x/640+31,z/640+7,2);if(og<.6)continue;
  const h=Hf(x,z);if(h<6||h>85)continue;const d=G.sd(x,z);if(d<40)continue;if(slopeAt(x,z)>.22||inTown(x,z,20))continue;
  if(fm.get('md_olive'))fm.put(T,'md_olive',x,h-.2,z,(5+r()*1.4)/fm.size('md_olive')[1],r()*6.28,{tint:[.95,1.02,.9],v:(r()-.5)*.14});else put(ON[((a+b)%3)],x,z,5.2+r()*1.2,[.8,.9,.78]);ctx.pts.push([x,z,.5])}
 /* rocks: boulders on the slopes, the shore and the high ground; big outcrops and sea-cliff stacks where it is steep */
 const RB=['rk_moss1','rk_moss2','rk_moss3','rk_blk1','rk_blk2','rk_blk3'].filter(n=>fm.get(n)),RC=['rk_cliff1','rk_cliff2','rk_cliff3','rk_cliff4','rk_big1','rk_big2'].filter(n=>fm.get(n)),RG=['rk_spire1','rk_spire2'].filter(n=>fm.get(n));
 if(RB.length){let big=0;for(let gz=0;gz<CH/20;gz++)for(let gx=0;gx<CH/20;gx++){const x=x0+gx*20+r()*20,z=z0+gz*20+r()*20,q=r(),t=r(),u=r();if(!ok(x,z))continue;const h=Hf(x,z),d=G.sd(x,z);if(h<.6||inTown(x,z,40))continue;const sl=slopeAt(x,z),rk=Math.max(sm(.28,.7,sl),sm(110,300,h)*.55,sm(34,4,d)*.45);
   if(q<.04+rk*.34){const hg=.9+u*1.5;const n=RB[(t*RB.length)|0],sz=fm.size(n)[1]||1;fm.put(T,n,x,h-.2,z,hg/sz,r()*6.28,{tint:[.95+u*.1,.95+u*.08,.92+u*.1],v:(r()-.5)*.12});if(hg>1.6)ctx.pts.push([x,z,.9])}
   else if(RC.length&&big<5&&q>.985-rk*.06&&(sl>.42||(d<50&&sl>.3))&&r()<.7){const n=RC[(t*RC.length)|0],hg=5+u*5.5,sz=fm.size(n)[1]||1,k=hg/sz;fm.put(T,n,x,h-1.2,z,k,r()*6.28,{tint:[.97,.96,.93],v:(r()-.5)*.1});ctx.pts.push([x,z,Math.max(1.4,fm.size(n)[0]*k*.32)]);big++}
   else if(RG.length&&big<5&&h>150&&sl>.5&&q>.992){const n=RG[(t*RG.length)|0],hg=7+u*5,sz=fm.size(n)[1]||1,k=hg/sz;fm.put(T,n,x,h-1.5,z,k,r()*6.28,{});ctx.pts.push([x,z,Math.max(2,fm.size(n)[0]*k*.3)]);big++}}}}
function buildChunk(cx,cz){const x0=cx*CH,z0=cz*CH,x1=x0+CH,z1=z0+CH,group=new THREE.Group(),M=mats(),ctx=ctxFor(cx,cz,group);group.userData.chunk=[cx,cz];
 /* terrain: a chunk of open sea needs no ground at all */
 {const n=CC+1,pos=new Float32Array(n*n*3),col=new Float32Array(n*n*3),idx=[];let hmax=-1e9;
  for(let j=0;j<=CC;j++)for(let i=0;i<=CC;i++){const gi=cx*CC+i,gj=cz*CC+j,x=gi*CELL,z=gj*CELL,k=(clamp(gj,0,GZ-1))*GX+clamp(gi,0,GX-1),h=W.HR[k],v=(j*n+i)*3;pos[v]=x;pos[v+1]=h;pos[v+2]=z;if(h>hmax)hmax=h;
   const hx=W.HR[k+(gi<GX-1?1:0)]-W.HR[k-(gi>0?1:0)],hz=W.HR[k+(gj<GZ-1?GX:0)]-W.HR[k-(gj>0?GX:0)],sl=Math.hypot(hx,hz)/(2*CELL),zn=W.Z[k],nz=fbm(x/90,z/90,2),fo=fbm(x/520+9,z/520,2),dr=sm(.5,.8,fbm(x/300+40,z/300,2))*.8+sm(60,5,h)*.2;
   const c=groundColor(x,z,h,sl,zn,G.sd(x,z),nz,fo,dr);col[v]=c[0];col[v+1]=c[1];col[v+2]=c[2]}
  if(hmax>-14){for(let j=0;j<CC;j++)for(let i=0;i<CC;i++){const a=j*n+i,b=a+1,c=a+n,d=c+1;if((i+j)&1){idx.push(a,c,b,b,c,d)}else{idx.push(a,c,d,a,d,b)}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
   const m=new THREE.Mesh(g,M.terrain);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}}
 /* roads */
 for(const r of ROADS){let run=[];const flush=()=>{if(run.length<2){run=[];return}const n=run.length,pos=[],uv=[],idx=[];
   for(let q=0;q<n;q++){const i=run[q],a=Math.max(0,i-1),b=Math.min(r.n-1,i+1);let tx=r.x[b]-r.x[a],tz=r.z[b]-r.z[a];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;const px=tz,pz=-tx;
    for(const sd of[-1,1]){const x=r.x[i]+px*r.hw*sd,z=r.z[i]+pz*r.hw*sd;pos.push(x,Hm(x,z)+r.dy+((r.lane||r.mat)?.1:.05),z);uv.push(sd<0?0:1,r.cum[i]/14)}}
   for(let q=0;q<n-1;q++){const a=q*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,r.mat?M[r.mat]:(r.lane?M.lane:M.road));m.userData.fogCull=true;m.receiveShadow=true;group.add(m);run=[]};
  for(let i=0;i<r.n;i++){const inside=r.x[i]>x0-12&&r.x[i]<x1+12&&r.z[i]>z0-12&&r.z[i]<z1+12;if(inside)run.push(i);else flush()}flush()}
 for(const j of W.junc){if(j.x<x0||j.x>=x1||j.z<z0||j.z>=z1)continue;const N=14,pos=[j.x,Hm(j.x,j.z)+j.dy,j.z],uv=[.5,.75],idx=[];
  for(let q=0;q<N;q++){const a=q/N*6.2832,x=j.x+Math.cos(a)*j.r,z=j.z+Math.sin(a)*j.r;pos.push(x,Hm(x,z)+j.dy,z);uv.push(.5+Math.cos(a)*.28,.75+Math.sin(a)*.2);idx.push(0,1+q,1+(q+1)%N)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,M.road);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}
 /* stops */
 const owns=(x,z)=>x>=x0&&x<x1&&z>=z0&&z<z1;
 for(const p of POIS)if(owns(p.x,p.z)&&STRUCT[p.key])STRUCT[p.key](ctx,p);
 if(P.FRD&&P.FRD.chunk)P.FRD.chunk(ctx,cx,cz);
 nature(ctx,cx,cz);
 /* merge */
 const add=(geo,mat,sh)=>{const m=new THREE.Mesh(geo,mat);m.userData.fogCull=true;if(sh){m.castShadow=true;m.receiveShadow=true}group.add(m);return m};
 if(ctx.G.pos.length)add(ctx.G.build(),M.props,1);if(ctx.T.pos.length)add(ctx.T.build(),M.props,1);if(ctx.N.pos.length)add(ctx.N.build(),M.neon,0);if(ctx.W.pos.length)add(ctx.W.build(),M.walls,1);
 group.userData.cars=ctx.cars;group.userData.segs=ctx.segs;group.userData.pts=ctx.pts;return group}
/* ---------- streaming manager ---------- */
function World(scene,T,opt){const o={scene,T,R:(opt&&opt.R)||4,loaded:new Map(),q:[],stats:{built:0,ms:0},cars:(opt&&opt.carBuilder)||null};
 const key=(a,b)=>a+','+b;
 o.rebuildCol=()=>{const X=T._bx||(T._bx={segs:[],pts:[]});X.segs.length=0;X.pts.length=0;for(const c of o.loaded.values()){for(const s of c.userData.segs)X.segs.push(s);for(const p of c.userData.pts)X.pts.push(p)}T._bg=null};
 o.add=(cx,cz)=>{const k=key(cx,cz);if(o.loaded.has(k)||cx<0||cz<0||cx*CH>WX||cz*CH>WZ)return;const t=performance.now(),g=buildChunk(cx,cz);scene.add(g);o.loaded.set(k,g);
  if(o.cars&&g.userData.cars.length)o.cars(g);o.stats.built++;o.stats.ms+=performance.now()-t;o.dirty=true};
 o.drop=k=>{const g=o.loaded.get(k);if(!g)return;scene.remove(g);g.traverse(m=>{if(m.geometry&&!m.userData.shared)m.geometry.dispose()});o.loaded.delete(k);o.dirty=true};
 o.update=(px,pz,fx,fz,budget)=>{const cx=Math.floor(px/CH),cz=Math.floor(pz/CH),R=o.R;let best=null,bs=1e9;
  for(let dz=-R;dz<=R;dz++)for(let dx=-R;dx<=R;dx++){const d2=dx*dx+dz*dz;if(d2>R*R+1)continue;const a=cx+dx,b=cz+dz;if(a<0||b<0||a*CH>WX||b*CH>WZ||o.loaded.has(key(a,b)))continue;
   const sc=d2-(dx*fx+dz*fz)*1.5;if(sc<bs){bs=sc;best=[a,b]}}
  const t0=performance.now();let n=0;while(best&&n<4){o.add(best[0],best[1]);n++;if(performance.now()-t0>(budget||5))break;best=null;bs=1e9;
   for(let dz=-R;dz<=R;dz++)for(let dx=-R;dx<=R;dx++){const d2=dx*dx+dz*dz;if(d2>R*R+1)continue;const a=cx+dx,b=cz+dz;if(a<0||b<0||a*CH>WX||b*CH>WZ||o.loaded.has(key(a,b)))continue;const sc=d2-(dx*fx+dz*fz)*1.5;if(sc<bs){bs=sc;best=[a,b]}}}
  for(const k of [...o.loaded.keys()]){const[a,b]=k.split(',').map(Number),dx=a-cx,dz=b-cz;if(dx*dx+dz*dz>(R+1.6)*(R+1.6))o.drop(k)}
  if(o.dirty){o.dirty=false;o.rebuildCol()}};
 o.fill=(px,pz,rad)=>{const cx=Math.floor(px/CH),cz=Math.floor(pz/CH);for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++)if(dx*dx+dz*dz<=rad*rad+1)o.add(cx+dx,cz+dz);o.rebuildCol();o.dirty=false};
 o.dispose=()=>{for(const k of [...o.loaded.keys()])o.drop(k)};return o}
/* ---------- terrain interface used by the engine ---------- */
function makeT(){buildWorld();const N=16,T={d:{id:0,name:'Free Roam',off:'grass',gravel:false,dust:0xb89c70,dirt:0x5a4630,fog:0xcfe3f2,hemi:[0xe3ecf2,0x6e7a62],sun:0xfff1d6,sky:[0x4f86d6,0xcfe3f2],hw:8},free:true,N,L:1000,sp:1,
  x:new Float32Array(N).fill(-9e6),z:new Float32Array(N).fill(-9e6),y:new Float32Array(N),hw:new Float32Array(N).fill(8),psi:new Float32Array(N),bank:new Float32Array(N),gap:new Uint8Array(N),wall:new Uint8Array(N),ice:new Uint8Array(N),br:new Uint8Array(N),wh:new Float32Array(N).fill(1.3),cum:new Float32Array(N),
  pads:[],jumps:[],cpts:[],grid:new Map(),tunnels:[],tn:new Uint8Array(N),bounds:[0,WX,0,WZ]};
 T.terr=(x,z)=>Hf(x,z);T.nz=(x,z)=>0;
 T.surf=(x,z,y)=>{const h=Hf(x,z),r=roadAt(x,z);if(r){const s=r.s,c=Math.sin(s.psi),d=Math.cos(s.psi);T.psi[2]=s.psi;T.bank[2]=0;T.y[4]=Hf(x+c*2,z+d*2);T.y[0]=Hf(x-c*2,z-d*2);const lat=(x-r.px)*d-(z-r.pz)*c;return{h:h+.1,road:1,i:2,lat}}return{h,road:0,i:-1,lat:0}};
 return T}
/* the whole island as one coarse mesh (32 m cells), sunk under the chunk terrain so it only shows beyond the loaded chunks */
function farMesh(){if(W.far)return W.far;const FS=4,st=CELL*FS,nx=Math.floor((GX-1)/FS)+1,nz=Math.floor((GZ-1)/FS)+1,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),idx=[];
 const hmin=(i,j)=>{let m=1e9;for(let b=-FS;b<=FS;b+=2)for(let a=-FS;a<=FS;a+=2){const x=clamp(i*FS+a,0,GX-1),z=clamp(j*FS+b,0,GZ-1),h=W.HR[z*GX+x];if(h<m)m=h}return m};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=Math.min(i*st,WX),z=Math.min(j*st,WZ),gi=Math.min(i*FS,GX-1),gj=Math.min(j*FS,GZ-1),k=gj*GX+gi,h=W.HR[k],v=(j*nx+i)*3;
  const hx=W.HR[gj*GX+Math.min(gi+FS,GX-1)]-W.HR[gj*GX+Math.max(gi-FS,0)],hz=W.HR[Math.min(gj+FS,GZ-1)*GX+gi]-W.HR[Math.max(gj-FS,0)*GX+gi],sl=Math.hypot(hx,hz)/(2*st);
  pos[v]=x;pos[v+1]=hmin(i,j)-1.6;pos[v+2]=z;
  const c=groundColor(x,z,h,sl,W.Z[k],G.sd(x,z),fbm(x/90,z/90,2),fbm(x/520+9,z/520,2),sm(.5,.8,fbm(x/300+40,z/300,2))*.8+sm(60,5,h)*.2);col[v]=c[0];col[v+1]=c[1];col[v+2]=c[2]}
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;if((i+j)&1)idx.push(a,c,b,b,c,d);else idx.push(a,c,d,a,d,b)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
 const m=new THREE.Mesh(g,mats().terrain);m.frustumCulled=false;return W.far=m}
function nearRoadPt(x,z,pred){let bd=1e18,b=null;for(const r of ROADS){if(pred&&!pred(r))continue;for(let i=0;i<r.n;i++){const d=(r.x[i]-x)*(r.x[i]-x)+(r.z[i]-z)*(r.z[i]-z);if(d<bd){bd=d;b=[r,i]}}}if(!b)return null;const r=b[0],i=b[1],a=Math.max(0,i-1),c=Math.min(r.n-1,i+1);return{x:r.x[i],z:r.z[i],yaw:Math.atan2(r.x[c]-r.x[a],r.z[c]-r.z[a]),r,i,d:Math.sqrt(bd)}}
P.FRW={inTown,S,CH,WX,WZ,CELL,POIS,POIBY,SPAWN,ROADS,TOWNS,RUN,PLAT,build:buildWorld,Hf,roadAt,nearRoadPt,farMesh,World,makeT,mats,sign,seed:11,get G(){return G},get W(){return W}};
})();
