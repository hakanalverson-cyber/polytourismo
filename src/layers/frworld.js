/* ===== Poly GT layer: Free Roam world (height field, road network, town, stops, chunk streaming) ===== */
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
/* ---------- layout (sketch units x6 = metres) ---------- */
const sk=a=>a.map(p=>[p[0]*S,p[1]*S]);
const LANDP=sk([[120,300],[190,170],[350,110],[560,120],[760,95],[930,170],[1010,320],[960,500],[830,640],[640,690],[450,650],[300,690],[160,600],[100,450]]);
const LAKEP=sk([[420,330],[560,300],[640,380],[560,470],[430,440]]);
function crClosed(p,per){const n=p.length,o=[];for(let i=0;i<n;i++){const a=p[(i-1+n)%n],b=p[i],c=p[(i+1)%n],d=p[(i+2)%n];for(let k=0;k<per;k++){const t=k/per,t2=t*t,t3=t2*t;o.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3)))}}return o}
function crOpen(p,step){const n=p.length,o=[];for(let i=0;i<n-1;i++){const a=p[Math.max(i-1,0)],b=p[i],c=p[i+1],d=p[Math.min(i+2,n-1)],L=Math.hypot(c[0]-b[0],c[1]-b[1]),m=Math.max(2,Math.round(L/step));for(let k=0;k<m;k++){const t=k/m,t2=t*t,t3=t2*t;o.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3)))}}o.push(p[n-1].slice());return o}
/* town */
const TX0=1740,TZ0=3000,TB=90,TNX=8,TNZ=6;
const bcx=i=>TX0+TB*i+TB/2,bcz=j=>TZ0+TB*j+TB/2;
const ROADS=[];
const road=(id,pts,hw,closed,dy,sketch)=>ROADS.push({id,pts:sketch===false?pts:sk(pts),hw,closed,dy});
road('loop',[[255,500],[228,420],[222,330],[262,262],[400,200],[560,200],[690,150],[850,250],[900,400],[846,470],[820,520],[700,580],[560,560],[520,610],[420,598],[360,600],[300,595],[280,560]],8,true,.06);
road('mtn',[[560,200],[600,260],[660,300],[740,330]],7,false,.09);
road('summit',[[740,330],[760,290],[775,252]],6,false,.1);
road('lake',[[255,500],[340,508],[430,512],[520,506],[560,560]],7,false,.09);
road('meet',[[222,330],[172,330]],7,false,.09);
road('drift',[[900,400],[948,400]],8,false,.09);
road('air',[[846,470],[826,470]],7,false,.09);
for(let j=0;j<=TNZ;j++){const z=TZ0+TB*j;road('ts'+j,[[j===3?1672:TX0,z],[TX0+TB*TNX,z]],5,false,.08,false)}
for(let i=0;i<=TNX;i++){const x=TX0+TB*i;road('tv'+i,[[x,TZ0],[x,TZ0+TB*TNZ+(i===0?36:0)]],5,false,.08,false)}
/* flat areas: [x,z,w,d,margin,height|null] */
const PLAT=[
 {x:TX0+TB*TNX/2,z:TZ0+TB*TNZ/2,w:TB*TNX+40,d:TB*TNZ+40,m:150,h:null,min:9},
 {x:990,z:1980,w:230,d:170,m:80,h:null,min:5},
 {x:5730,z:2400,w:340,d:260,m:100,h:null,min:5},
 {x:4440,z:2820,w:1180,d:150,m:150,h:null,min:6},
 {x:4650,z:1512,w:50,d:50,m:60,h:null,min:5},
 {x:1250,z:1130,w:40,d:40,m:50,h:null,min:5},
 {x:4300,z:1200,w:30,d:30,m:50,h:null,min:5}];
const MTN=[[4650,1480,125,380],[4980,1800,68,300],[4300,1200,52,260],[1500,2900,22,240],[3200,3900,16,260],[2400,1000,20,300]];
/* paved zones: [x,z,w,d,type] 1 town concrete, 2 lot, 3 runway */
const ZONES=[[TX0+TB*TNX/2,TZ0+TB*TNZ/2,TB*TNX+10,TB*TNZ+10,1],[990,1980,220,160,2],[5730,2400,320,240,2],[4440,2820,1080,44,3],[4960,2820,150,110,2],[4650,1512,34,34,2],[1250,1130,26,26,2]];
/* ---------- stops ---------- */
const POIS=[
 {id:'garage',n:'YOUR GARAGE',col:'#ffd34d',ic:'H',x:bcx(1),z:bcz(1)+38,r:15,key:'garage'},
 {id:'brand',n:'BRAND CENTRAL',col:'#4dd2ff',ic:'B',x:bcx(4),z:bcz(2)+40,r:16,key:'brand'},
 {id:'office',n:'RACE OFFICE',col:'#ff4dd2',ic:'R',x:bcx(5),z:bcz(1)+38,r:15,key:'office'},
 {id:'tune',n:'TUNE SHOP',col:'#4d7dff',ic:'T',x:bcx(2),z:bcz(4)+36,r:15,key:'tune'},
 {id:'gas',n:'GAS STATION',col:'#ff6a4d',ic:'G',x:bcx(6),z:bcz(4)+10,r:17,key:'gas'},
 {id:'job',n:'JOB BOARD',col:'#4dffb0',ic:'J',x:bcx(3),z:bcz(1)+38,r:15,key:'job'},
 {id:'meet',n:'CAR MEET',col:'#ffa24d',ic:'M',x:990,z:1980,r:70,key:'meet',zone:1},
 {id:'drift',n:'DRIFT PIER',col:'#b04dff',ic:'D',x:5730,z:2400,r:130,key:'drift',zone:1},
 {id:'view',n:'SUMMIT OVERLOOK',col:'#ffffff',ic:'V',x:4650,z:1512,r:22,key:'view'},
 {id:'air',n:'AIRFIELD',col:'#ff9a3c',ic:'A',x:4440,z:2820,r:60,key:'air',zone:1},
 {id:'trap1',n:'SPEED TRAP',col:'#7dff4d',ic:'S',x:3360,z:1200,r:10,key:'trap',zone:1},
 {id:'trap2',n:'SPEED TRAP',col:'#7dff4d',ic:'S',x:5100,z:1500,r:10,key:'trap',zone:1},
 {id:'trap3',n:'SPEED TRAP',col:'#7dff4d',ic:'S',x:4200,z:3480,r:10,key:'trap',zone:1}];
const POIBY={};POIS.forEach(p=>POIBY[p.id]=p);
const SPAWN={x:bcx(1),z:TZ0+TB*2,yaw:Math.PI/2};
/* ---------- raster build (once) ---------- */
let W=null;
function dField(poly,cs){const gx=Math.ceil(WX/cs)+1,gz=Math.ceil(WZ/cs)+1,ins=new Uint8Array(gx*gz),n=poly.length;
 for(let j=0;j<gz;j++){const z=j*cs;for(let i=0;i<gx;i++){const x=i*cs;let c=false;for(let a=0,b=n-1;a<n;b=a++){const pa=poly[a],pb=poly[b];if((pa[1]>z)!==(pb[1]>z)&&x<(pb[0]-pa[0])*(z-pa[1])/(pb[1]-pa[1])+pa[0])c=!c}ins[j*gx+i]=c?1:0}}
 const A=new Float32Array(gx*gz).fill(1e5),B=new Float32Array(gx*gz).fill(1e5);
 for(let k=0;k<gx*gz;k++){if(ins[k])B[k]=0;else A[k]=0}
 const pass=D=>{for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){const k=j*gx+i;let v=D[k];if(i>0)v=Math.min(v,D[k-1]+1);if(j>0){v=Math.min(v,D[k-gx]+1);if(i>0)v=Math.min(v,D[k-gx-1]+1.414);if(i<gx-1)v=Math.min(v,D[k-gx+1]+1.414)}D[k]=v}
  for(let j=gz-1;j>=0;j--)for(let i=gx-1;i>=0;i--){const k=j*gx+i;let v=D[k];if(i<gx-1)v=Math.min(v,D[k+1]+1);if(j<gz-1){v=Math.min(v,D[k+gx]+1);if(i<gx-1)v=Math.min(v,D[k+gx+1]+1.414);if(i>0)v=Math.min(v,D[k+gx-1]+1.414)}D[k]=v}};
 pass(A);pass(B);const o=new Float32Array(gx*gz);for(let k=0;k<gx*gz;k++)o[k]=ins[k]?(A[k]-.5)*cs:-(B[k]-.5)*cs;return{a:o,gx,gz,cs}}
const sd=(f,x,z)=>{const u=x/f.cs,v=z/f.cs,i=clamp(Math.floor(u),0,f.gx-2),j=clamp(Math.floor(v),0,f.gz-2),fx=clamp(u-i,0,1),fz=clamp(v-j,0,1),k=j*f.gx+i,a=f.a;return a[k]*(1-fx)*(1-fz)+a[k+1]*fx*(1-fz)+a[k+f.gx]*(1-fx)*fz+a[k+f.gx+1]*fx*fz};
function baseH(x,z){const d=sd(W.land,x,z);
 let e=11+44*(fbm(x/1700,z/1700,3)-.5)+6*(fbm(x/240,z/240,2)-.5);
 for(const m of MTN){const dx=x-m[0],dz=z-m[1];e+=m[2]*Math.exp(-(dx*dx+dz*dz)/(2*m[3]*m[3]))}
 e=Math.max(e,4);let h=lerp(-7,e,sm(-60,100,d));
 const ld=sd(W.lake,x,z);h=lerp(h,-4,sm(-30,50,ld));return h}
function fullH(x,z){let h=baseH(x,z);for(const p of PLAT){const dx=Math.max(Math.abs(x-p.x)-p.w/2,0),dz=Math.max(Math.abs(z-p.z)-p.d/2,0),q=1-sm(0,p.m,Math.hypot(dx,dz));if(q>0)h=lerp(h,p.h,q)}return h}
function buildWorld(){if(W)return W;
 const t0=performance.now();W={};W.land=dField(crClosed(LANDP,10),16);W.lake=dField(crClosed(LAKEP,10),16);
 for(const p of PLAT){if(p.h==null)p.h=Math.max(baseH(p.x,p.z),p.min)}
 /* roads: dense samples + smoothed height */
 const segs=[];for(const r of ROADS){let s=r.closed?crClosed(r.pts,12):crOpen(r.pts,28);const dense=[];
  /* resample at ~6 m */
  const pts=r.closed?s.concat([s[0]]):s;let acc=[[pts[0][0],pts[0][1]]];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.round(L/6));for(let k=1;k<=m;k++)acc.push([lerp(a[0],b[0],k/m),lerp(a[1],b[1],k/m)])}
  r.x=Float32Array.from(acc.map(p=>p[0]));r.z=Float32Array.from(acc.map(p=>p[1]));r.n=acc.length;
  const y=new Float32Array(r.n);for(let i=0;i<r.n;i++)y[i]=fullH(r.x[i],r.z[i]);
  for(let pass=0;pass<3;pass++){const y2=y.slice();for(let i=0;i<r.n;i++){let s=0,c=0;for(let k=-3;k<=3;k++){const q=i+k;if(q<0||q>=r.n)continue;s+=y[q];c++}y2[i]=s/c}y.set(y2)}
  r.y=y;r.cum=new Float32Array(r.n);for(let i=1;i<r.n;i++)r.cum[i]=r.cum[i-1]+Math.hypot(r.x[i]-r.x[i-1],r.z[i]-r.z[i-1]);r.len=r.cum[r.n-1]}
 /* raster: road distance/height */
 const dd=new Float32Array(GX*GZ).fill(1e4),ry=new Float32Array(GX*GZ);
 for(const r of ROADS){const R=r.hw+26;for(let i=0;i<r.n-1;i++){const ax=r.x[i],az=r.z[i],bx=r.x[i+1],bz=r.z[i+1],ex=bx-ax,ez=bz-az,L2=ex*ex+ez*ez||1;
   const i0=Math.max(0,Math.floor((Math.min(ax,bx)-R)/CELL)),i1=Math.min(GX-1,Math.ceil((Math.max(ax,bx)+R)/CELL)),j0=Math.max(0,Math.floor((Math.min(az,bz)-R)/CELL)),j1=Math.min(GZ-1,Math.ceil((Math.max(az,bz)+R)/CELL));
   for(let j=j0;j<=j1;j++)for(let q=i0;q<=i1;q++){const x=q*CELL,z=j*CELL,t=clamp(((x-ax)*ex+(z-az)*ez)/L2,0,1),px=ax+ex*t,pz=az+ez*t,d=Math.hypot(x-px,z-pz)-r.hw,k=j*GX+q;if(d<dd[k]){dd[k]=d;ry[k]=lerp(r.y[i],r.y[i+1],t)}}}}
 W.dd=dd;const HR=new Float32Array(GX*GZ);
 for(let j=0;j<GZ;j++)for(let i=0;i<GX;i++){const k=j*GX+i,x=i*CELL,z=j*CELL;let h=fullH(x,z);const d=dd[k];if(d<26){const w=sm(2.5,22,d);h=lerp(ry[k],h,w)}HR[k]=h}
 W.HR=HR;
 /* zones */
 const Z=new Uint8Array(GX*GZ);for(const z of ZONES){const i0=Math.floor((z[0]-z[2]/2)/CELL),i1=Math.ceil((z[0]+z[2]/2)/CELL),j0=Math.floor((z[1]-z[3]/2)/CELL),j1=Math.ceil((z[1]+z[3]/2)/CELL);for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(i>=0&&j>=0&&i<GX&&j<GZ)Z[j*GX+i]=z[4]}W.Z=Z;
 /* road hash for physics */
 const HC=32,hash=new Map(),put=(k,s)=>{let a=hash.get(k);if(!a)hash.set(k,a=[]);a.push(s)};
 W.segs=[];for(const r of ROADS){for(let i=0;i<r.n-1;i++){const s={ax:r.x[i],az:r.z[i],bx:r.x[i+1],bz:r.z[i+1],hw:r.hw,r};s.ex=s.bx-s.ax;s.ez=s.bz-s.az;s.L2=s.ex*s.ex+s.ez*s.ez||1;s.psi=Math.atan2(s.ex,s.ez);
   const i0=Math.floor((Math.min(s.ax,s.bx)-r.hw)/HC),i1=Math.floor((Math.max(s.ax,s.bx)+r.hw)/HC),j0=Math.floor((Math.min(s.az,s.bz)-r.hw)/HC),j1=Math.floor((Math.max(s.az,s.bz)+r.hw)/HC);for(let a=i0;a<=i1;a++)for(let b=j0;b<=j1;b++)put(a*4096+b,s)}}
 W.hash=hash;W.HC=HC;W.ms=performance.now()-t0;return W}
function Hf(x,z){const u=clamp(x/CELL,0,GX-1.001),v=clamp(z/CELL,0,GZ-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GX+i,a=W.HR;return a[k]*(1-fx)*(1-fz)+a[k+1]*fx*(1-fz)+a[k+GX]*(1-fx)*fz+a[k+GX+1]*fx*fz}
function roadAt(x,z){const l=W.hash.get(Math.floor(x/W.HC)*4096+Math.floor(z/W.HC));let best=null,bd=1e9;if(l)for(const s of l){const t=clamp(((x-s.ax)*s.ex+(z-s.az)*s.ez)/s.L2,0,1),px=s.ax+s.ex*t,pz=s.az+s.ez*t,d=Math.hypot(x-px,z-pz)-s.hw;if(d<bd){bd=d;best={s,d,t,px,pz}}}return bd<0?best:null}
const roadDist=(x,z)=>{const u=clamp(x/CELL,0,GX-1),v=clamp(z/CELL,0,GZ-1);return W.dd[(Math.round(v))*GX+Math.round(u)]};
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
 const mk=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},o));if(typeof styleMaterial==='function')styleMaterial(m);return m};
 MAT={terrain:mk({vertexColors:true,color:0x8c8c8c,flatShading:true,roughness:1}),road:mk({map:road,color:0xa8a8a8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}),run:mk({map:run,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,side:THREE.DoubleSide}),
  props:mk({vertexColors:true,color:0x909090,flatShading:true,side:THREE.DoubleSide}),walls:mk({vertexColors:true,color:0x949494,map:win,roughness:.8,side:THREE.DoubleSide}),
  glass:mk({color:0x8fd0ff,emissive:0x1d4e7a,roughness:.15,metalness:.4,flatShading:true}),neon:new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true})};
 run.repeat.set(1,1);return MAT}
function signTex(txt,bg,fg,w,h){const key=txt+bg+fg;if(SIGN[key])return SIGN[key];const t=ctex(256,64,(x,W_,H_)=>{x.fillStyle=bg;x.fillRect(0,0,W_,H_);x.strokeStyle=fg;x.lineWidth=4;x.strokeRect(3,3,W_-6,H_-6);x.fillStyle=fg;x.font='900 '+(txt.length>12?26:34)+'px Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,W_/2,H_/2+2)});t.minFilter=t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return SIGN[key]=t}
function sign(txt,w,h,bg,fg){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(txt,bg,fg),side:THREE.DoubleSide}));return m}
/* ---------- stop structures ---------- */
const hexC=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
function bld(ctx,x,z,w,d,h,col,opt){opt=opt||{};const ry=0,hx=w/2,hz=d/2,a=[x-hx,z-hz,Hf(x,z)+0],g=ctx.W,y0=ctx.gy(x,z)-.4,k=col;
 const c=[[x-hx,z-hz],[x+hx,z-hz],[x+hx,z+hz],[x-hx,z+hz]];for(let i=0;i<4;i++){const p=c[i],q=c[(i+1)%4];g.wall([p[0],p[1],y0],[q[0],q[1],y0],h+.4,k,opt.vs,opt.u0||0)}
 ctx.G.box(x,y0+h+.4,z,w+.6,.5,d+.6,opt.roof||[.4,.4,.44]);
 for(let i=0;i<4;i++){const p=c[i],q=c[(i+1)%4];ctx.sg(p[0],p[1],q[0],q[1],.6)}
 return y0}
function wallsAround(){}
function lamp(ctx,x,z){const y=ctx.gy(x,z);ctx.G.box(x,y,z,.25,7,.25,[.25,.26,.3]);ctx.G.box(x+.9,y+6.9,z,2,.2,.3,[.25,.26,.3]);ctx.N.box(x+1.6,y+6.7,z,.9,.18,.5,[1.6,1.5,1.1]);ctx.pt(x,z,.5)}
function signAt(ctx,txt,x,y,z,w,h,bg,fg,ry){const s=sign(txt,w,h,bg,fg);s.position.set(x,y,z);s.rotation.y=ry||0;ctx.group.add(s)}
const STRUCT={
 garage(ctx,p){const x=bcx(1),z=bcz(1),y=ctx.gy(x,z);bld(ctx,x,z-4,36,26,7.4,[.86,.8,.72],{u0:.1});wallsAround(ctx,x,z-4,36,26);
  ctx.G.box(x-8,y,z+9.4,13,5.6,.5,[.62,.68,.78]);for(let i=0;i<5;i++)ctx.G.box(x-8,y+1+i*1,z+9.7,13,.12,.1,[.4,.45,.55]);
  ctx.G.box(x+9,y,z+9.4,5,3.4,.5,[.35,.2,.15]);signAt(ctx,'HOME GARAGE',x-8,y+6.8,z+9.9,10,2.5,'#1b1f27','#ffd34d');lamp(ctx,x+17,z+18)},
 brand(ctx,p){const x=bcx(4),z=bcz(2),y=ctx.gy(x,z);bld(ctx,x,z-3,66,38,9,[.7,.78,.88],{u0:.4});wallsAround(ctx,x,z-3,66,38);
  const gm=new THREE.Mesh(new THREE.BoxGeometry(50,5.4,.4),MAT.glass);gm.position.set(x,y+3.2,z+16.4);ctx.group.add(gm);
  signAt(ctx,'BRAND CENTRAL',x,y+11.4,z+16.8,26,4.4,'#0f1824','#4dd2ff');ctx.N.box(x-34,y,z+17,1,13,1,[.3,1.6,2.2]);ctx.N.box(x+34,y,z+17,1,13,1,[.3,1.6,2.2]);
  ctx.park(x-18,z+27,.2);ctx.park(x,z+27,1.7);ctx.park(x+18,z+27,2.6)},
 office(ctx,p){const x=bcx(5),z=bcz(1),y=ctx.gy(x,z);bld(ctx,x,z-4,34,28,11,[.82,.62,.7],{u0:.7});wallsAround(ctx,x,z-4,34,28);
  signAt(ctx,'RACE OFFICE',x,y+13.2,z+10.2,20,4,'#201018','#ff4dd2');for(let i=0;i<8;i++)for(let j=0;j<2;j++)ctx.G.box(x-9+i*2.4,y+14.4+j*1.2,z+10.4,1.2,1.2,.2,((i+j)&1)?[.95,.95,.95]:[.08,.08,.08])},
 tune(ctx,p){const x=bcx(2),z=bcz(4),y=ctx.gy(x,z);bld(ctx,x,z-3,40,28,6.4,[.72,.76,.82],{u0:.25});wallsAround(ctx,x,z-3,40,28);
  for(let i=0;i<3;i++){ctx.G.box(x-11+i*11,y,z+11.2,8,4.6,.4,[.3,.34,.44]);ctx.N.box(x-11+i*11,y+4.7,z+11.4,8,.3,.3,[.4,.6,2.0])}signAt(ctx,'TUNE SHOP',x,y+7.8,z+11.6,16,3,'#10162a','#4d7dff')},
 gas(ctx,p){const x=bcx(6),z=bcz(4),y=ctx.gy(x,z);bld(ctx,x,z-22,34,16,5.2,[.9,.88,.82],{u0:.55});wallsAround(ctx,x,z-22,34,16);
  const cy=y+5.6;ctx.G.box(x,cy,z+6,36,.7,20,[.9,.2,.18]);ctx.G.box(x,cy+.7,z+6,36.4,.35,20.4,[.95,.95,.95]);
  for(const sx of[-14,14])for(const sz of[-2,14])ctx.G.box(x+sx,y,z+sz,.7,5.6,.7,[.8,.8,.82]);
  for(const sx of[-9,9])for(const sz of[3,9]){ctx.G.box(x+sx,y,z+sz,1.1,1.9,.8,[.85,.12,.1]);ctx.G.box(x+sx,y+1.5,z+sz,1.14,.25,.84,[.95,.95,.95])}
  signAt(ctx,'GAS STATION',x,y+8.2,z-13.4,16,3,'#2a0f0c','#ff6a4d');ctx.G.box(x+26,y,z+22,.7,12,.7,[.7,.7,.74]);signAt(ctx,'GAS',x+26,y+12.4,z+22.4,5,2,'#d42b22','#ffffff')},
 job(ctx,p){const x=bcx(3),z=bcz(1),y=ctx.gy(x,z);bld(ctx,x,z-8,16,12,4.2,[.7,.84,.78],{u0:.15});wallsAround(ctx,x,z-8,16,12);
  signAt(ctx,'JOB BOARD',x,y+5.4,z-1.6,10,2.2,'#0f221a','#4dffb0');ctx.G.box(x,y,z+3,6,2.2,.3,[.45,.34,.22]);ctx.G.box(x-2,y,z+3.1,.2,2.6,.2,[.3,.2,.12]);ctx.G.box(x+2,y,z+3.1,.2,2.6,.2,[.3,.2,.12])},
 tower(ctx,p){const x=bcx(0)+30,z=bcz(3),y=ctx.gy(x,z);ctx.G.cyl(x,y+14,z,5.2,5,10,[.82,.82,.86]);for(const [a,b]of[[-3,-3],[3,-3],[-3,3],[3,3]])ctx.G.box(x+a,y,z+b,.5,15,.5,[.5,.5,.55]);ctx.G.cone(x,y+19,z,6,3,10,[.4,.45,.55]);ctx.sp(x,z,4)},
 meet(ctx,p){const x=p.x,z=p.z,y=ctx.gy(x,z);for(let i=-4;i<=4;i++){lamp(ctx,x-100+(i<0?0:0),z+i*18)}
  const cs=[[-60,-40,.3],[-30,-40,.2],[0,-40,.1],[30,-40,-.1],[-60,36,3.1],[-30,36,3.3],[0,36,3],[30,36,3.2],[-60,0,1.6],[70,-10,1.7]];cs.forEach((c,i)=>ctx.park(x+c[0],z+c[1],c[2],i));
  signAt(ctx,'CAR MEET',x-70,y+9,z-60,16,3,'#1d1308','#ffa24d',.4);ctx.G.box(x-70,y,z-60,.4,9,.4,[.3,.3,.34])},
 drift(ctx,p){const x=p.x,z=p.z,y=ctx.gy(x,z);const ring=[[0,0,48],[0,0,90]];for(const r of[34,66,98])for(let i=0;i<22;i++){const t=i/22*6.28;const cx=x+Math.cos(t)*r*1.15,cz=z+Math.sin(t)*r;ctx.G.cone(cx,ctx.gy(cx,cz),cz,.45,1.1,6,i%2?[1,.45,.1]:[.95,.95,.95])}
  for(let i=0;i<6;i++)ctx.N.box(x-150+i*60,y+7,z-120,1.2,.7,.5,[1.8,.4,1.8]);signAt(ctx,'DRIFT PIER',x,y+9,z-124,22,4,'#180d26','#b04dff')},
 trap(ctx,p){const r=roadAt(p.x,p.z);if(!r)return;const psi=r.s.psi,c=Math.cos(psi),s=Math.sin(psi),hw=r.s.hw+2,y=ctx.gy(p.x,p.z);
  for(const sd of[-1,1])ctx.G.box(p.x+c*hw*sd,y,p.z-s*hw*sd,.8,9,.8,[.5,.52,.58],psi);ctx.G.box(p.x,y+8.6,p.z,hw*2+1,.9,.9,[.4,.42,.48],psi);
  ctx.N.box(p.x,y+7.9,p.z,1.2,.5,.6,[2.0,.3,.3],psi);signAt(ctx,'SPEED CHECK',p.x,y+10.6,p.z,12,2.2,'#0f1a0a','#7dff4d',psi);signAt(ctx,'SPEED CHECK',p.x,y+10.6,p.z,12,2.2,'#0f1a0a','#7dff4d',psi+Math.PI)},
 view(ctx,p){const x=p.x,z=p.z,y=ctx.gy(x,z);for(let i=0;i<16;i++){const t=i/16*6.28,cx=x+Math.cos(t)*14,cz=z+Math.sin(t)*14;ctx.G.box(cx,y,cz,.3,1.2,.3,[.8,.8,.85])}ctx.G.cyl(x,y,z,14.2,.3,16,[.5,.5,.55]);
  ctx.G.cyl(x+4,y,z-4,.5,1.8,6,[.3,.3,.35]);ctx.G.box(x+4,y+1.7,z-4,1.2,.5,.5,[.2,.2,.24]);signAt(ctx,'SUMMIT',x-9,y+3,z+2,5,1.2,'#102030','#ffffff',1.2)},
 air(ctx,p){const x=4440,z=2820,y=ctx.gy(x,z);
  for(const hx of[x-260,x+120]){bld(ctx,hx,z-80,60,40,12,[.75,.78,.82],{u0:.3});}
  ctx.G.cyl(x+330,y,z+90,2.2,26,8,[.85,.85,.88]);ctx.G.box(x+330,y+26,z+90,9,5,9,[.35,.5,.65]);
  const wsx=x-380,wsz=z+36;ctx.G.cyl(wsx,ctx.gy(wsx,wsz),wsz,.2,7,5,[.8,.8,.8]);ctx.G.cone(wsx+1.6,ctx.gy(wsx,wsz)+6.2,wsz,1,3.6,6,[1,.4,.1])},
 lighthouse(ctx,p){const x=1250,z=1130,y=ctx.gy(x,z);for(let i=0;i<6;i++)ctx.G.cyl(x,y+i*6,z,5-i*.25,6,10,i&1?[.9,.15,.12]:[.95,.95,.95]);ctx.G.cyl(x,y+36,z,3.3,3,10,[.2,.2,.24]);ctx.N.box(x,y+36.5,z,2.6,2,2.6,[2.2,2.0,1.4]);ctx.G.cone(x,y+39,z,4,3,10,[.8,.12,.1])},
 radio(ctx,p){const x=4300,z=1200,y=ctx.gy(x,z);for(const a of[[-1,-1],[1,-1],[1,1],[-1,1]])ctx.G.box(x+a[0]*1.2,y,z+a[1]*1.2,.35,44,.35,[.8,.2,.18]);for(let i=0;i<6;i++)ctx.G.box(x,y+i*7+3,z,3.2,.3,3.2,[.85,.85,.88]);ctx.N.box(x,y+44,z,.6,.6,.6,[2,.2,.2])}
};
/* town fillers */
function townBlock(ctx,i,j){const key=i+','+j;if(['1,1','4,2','5,1','2,4','6,4','3,1','0,3'].includes(key))return;const r=rng(i*977+j*131+7),cx=bcx(i),cz=bcz(j);
 const mid=Math.hypot(i-3.5,j-2.5),tall=sm(3.6,0,mid);
 if(i===3&&j===3){for(let t=0;t<14;t++){const x=cx+(r()-.5)*66,z=cz+(r()-.5)*66;ctx.tree(x,z,.9)}ctx.G.cyl(cx,ctx.gy(cx,cz),cz,9,.3,16,[.3,.5,.7]);return}
 const n=2+(r()*2.2|0),pal=[[.84,.8,.74],[.74,.78,.84],[.86,.72,.62],[.7,.8,.72],[.8,.74,.82],[.9,.88,.84]];
 for(let q=0;q<n;q++){const w=18+r()*20,d=14+r()*16,hh=6+r()*8+tall*(r()*20),ox=(q%2?1:-1)*(10+r()*8),oz=(q<2?-1:1)*(10+r()*8),x=cx+ox,z=cz+oz*.9;
  if(Math.abs(ox)+w/2>43||Math.abs(oz*.9)+d/2>43)continue;bld(ctx,x,z,w,d,hh,pal[(r()*pal.length)|0],{u0:r()});wallsAround(ctx,x,z,w,d)}}
/* ---------- chunk builder ---------- */
function ctxFor(cx,cz,group){const G=GB(),N=GB(),Wb=WB(),trees=GB(),ctx={G,N,W:Wb,group,T:trees,segs:[],pts:[],cars:[],gy:(x,z)=>Hf(x,z),
 sg(a,b,c,d,r){ctx.segs.push([a,b,c,d,r||.4])},pt(x,z,r){ctx.pts.push([x,z,r])},sp(x,z,r){ctx.pts.push([x,z,r])},
 tree(x,z,s){const y=Hf(x,z);if(y<2.2||y>96)return;const k=H2(Math.floor(x),Math.floor(z));s=s||1;if(k<.55){const h=(5+k*5)*s;trees.box(x,y,z,.5*s,h*.3,.5*s,[.32,.2,.12]);for(let q=0;q<3;q++)trees.cone(x,y+h*.2+q*h*.24,z,(2.4-q*.55)*s,h*.52,7,[.1+k*.08,.34+k*.12,.2]);ctx.pts.push([x,z,.5*s])}else{const h=(4+k*3)*s;trees.box(x,y,z,.55*s,h*.5,.55*s,[.36,.24,.14]);trees.ico(x,y+h*.78,z,2.3*s,[.22+k*.1,.5+k*.14,.18],.9);ctx.pts.push([x,z,.55*s])}},
 park(x,z,ry,i){ctx.cars.push([x,z,ry,i==null?0:i])}};return ctx}
function buildChunk(cx,cz){const x0=cx*CH,z0=cz*CH,x1=x0+CH,z1=z0+CH,group=new THREE.Group(),M=mats(),ctx=ctxFor(cx,cz,group);group.userData.chunk=[cx,cz];
 /* terrain */
 {const n=CC+1,pos=new Float32Array(n*n*3),col=new Float32Array(n*n*3),idx=[];const rr=rng(cx*7349+cz*911+3);
  for(let j=0;j<=CC;j++)for(let i=0;i<=CC;i++){const gi=cx*CC+i,gj=cz*CC+j,x=gi*CELL,z=gj*CELL,k=(clamp(gj,0,GZ-1))*GX+clamp(gi,0,GX-1),h=W.HR[k],v=(j*n+i)*3;pos[v]=x;pos[v+1]=h;pos[v+2]=z;
   const hx=W.HR[k+(gi<GX-1?1:0)]-W.HR[k-(gi>0?1:0)],hz=W.HR[k+(gj<GZ-1?GX:0)]-W.HR[k-(gj>0?GX:0)],sl=Math.hypot(hx,hz)/(2*CELL),zn=W.Z[k],nz=fbm(x/90,z/90,2),fo=fbm(x/520+9,z/520,2);
   let c0,c1,c2;if(zn===1){c0=.32+.04*nz;c1=.33+.04*nz;c2=.35+.04*nz}else if(zn===2){c0=.27;c1=.28;c2=.31}else if(zn===3){c0=.26;c1=.27;c2=.3}
   else if(h<0){c0=.5;c1=.46;c2=.34}
   else{const fr=sm(.52,.62,fo);c0=.3-.1*fr+.1*nz;c1=.56-.12*fr+.12*nz-clamp(h/200,0,.12);c2=.2+.02*nz;
    if(h<2.6){const b=sm(2.6,.8,h);c0=lerp(c0,.86,b);c1=lerp(c1,.78,b);c2=lerp(c2,.52,b)}
    const rk=Math.max(sm(.42,.68,sl),sm(78,108,h));if(rk>0){const g=.46+.1*nz;c0=lerp(c0,g,rk);c1=lerp(c1,g,rk);c2=lerp(c2,g+.02,rk)}
    const sn=sm(146,162,h)*(1-sm(.6,.9,sl)*.6);if(sn>0){c0=lerp(c0,.93,sn);c1=lerp(c1,.96,sn);c2=lerp(c2,1,sn)}}
   col[v]=c0;col[v+1]=c1;col[v+2]=c2}
  for(let j=0;j<CC;j++)for(let i=0;i<CC;i++){const a=j*n+i,b=a+1,c=a+n,d=c+1;if((i+j)&1){idx.push(a,c,b,b,c,d)}else{idx.push(a,c,d,a,d,b)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,M.terrain);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}
 /* roads */
 for(const r of ROADS){let run=[];const flush=()=>{if(run.length<2){run=[];return}const n=run.length,pos=[],uv=[],idx=[];
   for(let q=0;q<n;q++){const i=run[q],a=Math.max(0,i-1),b=Math.min(r.n-1,i+1);let tx=r.x[b]-r.x[a],tz=r.z[b]-r.z[a];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;const px=tz,pz=-tx;
    for(const sd of[-1,1]){const x=r.x[i]+px*r.hw*sd,z=r.z[i]+pz*r.hw*sd;pos.push(x,Hf(x,z)+r.dy+.05,z);uv.push(sd<0?0:1,r.cum[i]/14)}}
   for(let q=0;q<n-1;q++){const a=q*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,M.road);m.userData.fogCull=true;m.receiveShadow=true;group.add(m);run=[]};
  for(let i=0;i<r.n;i++){const inside=r.x[i]>x0-12&&r.x[i]<x1+12&&r.z[i]>z0-12&&r.z[i]<z1+12;if(inside)run.push(i);else flush()}flush()}
 /* stops + town */
 const owns=(x,z)=>x>=x0&&x<x1&&z>=z0&&z<z1;
 for(const p of POIS){const fx=p.key==='garage'?bcx(1):p.key==='brand'?bcx(4):p.key==='office'?bcx(5):p.key==='tune'?bcx(2):p.key==='gas'?bcx(6):p.key==='job'?bcx(3):p.x,fz=p.key==='garage'?bcz(1):p.key==='brand'?bcz(2):p.key==='office'?bcz(1):p.key==='tune'?bcz(4):p.key==='gas'?bcz(4):p.key==='job'?bcz(1):p.z;if(owns(fx,fz)&&STRUCT[p.key])STRUCT[p.key](ctx,p)}
 if(owns(1250,1130))STRUCT.lighthouse(ctx);if(owns(4300,1200))STRUCT.radio(ctx);if(owns(bcx(0)+30,bcz(3)))STRUCT.tower(ctx);
 for(let i=0;i<TNX;i++)for(let j=0;j<TNZ;j++)if(owns(bcx(i),bcz(j)))townBlock(ctx,i,j);
 if(x1>TX0&&x0<TX0+TB*TNX&&z1>TZ0&&z0<TZ0+TB*TNZ){for(let i=0;i<=TNX;i++)for(let j=0;j<=TNZ;j++){const x=TX0+TB*i+7,z=TZ0+TB*j+7;if(owns(x,z)&&(i+j)%2===0)lamp(ctx,x,z)}}
 /* trees & rocks */
 {const r=rng(cx*31337+cz*7919+11),st=13;for(let gz=0;gz<CH/st;gz++)for(let gx=0;gx<CH/st;gx++){const x=x0+gx*st+r()*st,z=z0+gz*st+r()*st;if(x<4||z<4||x>WX-4||z>WZ-4)continue;const k=(Math.round(z/CELL))*GX+Math.round(x/CELL);
   if(W.Z[k])continue;const dd=W.dd[k];if(dd<7)continue;const h=Hf(x,z);if(h<2.4||h>96)continue;const fo=fbm(x/520+9,z/520,2),pr=.12+sm(.38,.6,fo)*.8+.08;if(r()>pr)continue;
   if(Math.hypot(x-(TX0+TB*TNX/2),z-(TZ0+TB*TNZ/2))<(TB*TNX/2+90)&&Math.abs(x-(TX0+TB*TNX/2))<TB*TNX/2+60&&Math.abs(z-(TZ0+TB*TNZ/2))<TB*TNZ/2+60)continue;ctx.tree(x,z,.8+r()*.6)}
  for(let q=0;q<10;q++){const x=x0+r()*CH,z=z0+r()*CH,k=(Math.round(z/CELL))*GX+Math.round(x/CELL);if(W.Z[k]||W.dd[k]<6)continue;const h=Hf(x,z);if(h<1)continue;const rk=h>70||r()<.18;if(!rk)continue;const s=.9+r()*2.2;ctx.T.ico(x,h+s*.3,z,s,[.46+r()*.08,.46+r()*.06,.48],.7);if(s>1.6)ctx.pts.push([x,z,s*.85])}}
 /* merge */
 const add=(geo,mat,sh)=>{const m=new THREE.Mesh(geo,mat);m.userData.fogCull=true;if(sh){m.castShadow=true;m.receiveShadow=true}group.add(m);return m};
 if(ctx.G.pos.length)add(ctx.G.build(),M.props,1);if(ctx.T.pos.length)add(ctx.T.build(),M.props,1);if(ctx.N.pos.length)add(ctx.N.build(),M.neon,0);if(ctx.W.pos.length)add(ctx.W.build(),M.walls,1);
 /* runway quad + parked cars */
 {const ra=Math.max(x0,3900),rb=Math.min(x1,4980),rz0=2798,rz1=2842;if(ra<rb&&z1>rz0&&z0<rz1){const ya=Hf((ra+rb)/2,2820)+.16,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([ra,ya,rz0,rb,ya,rz0,rb,ya,rz1,ra,ya,rz1],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,ra/256,0,rb/256,1,rb/256,1,ra/256],2));g.setIndex([0,2,1,0,3,2]);g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,M.run);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}}
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
P.FRW={S,CH,WX,WZ,CELL,POIS,POIBY,SPAWN,ROADS,LANDP,LAKEP,PLAT,build:buildWorld,Hf,roadAt,World,makeT,mats,sign,bcx,bcz,TX0,TZ0,TB,TNX,TNZ,MTN,get W(){return W}};
})();
