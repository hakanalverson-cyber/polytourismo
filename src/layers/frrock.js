/* ===== Poly GT layer: Free Roam on the Rockport city pack (replaces the generated island when the pack is built in) =====
   The pack (FRR_B64, made by tools/rockport/*.py from Hakan's map files, kept in project files, never in the public repo) holds:
   flat-coloured city meshes in 256 m tiles (int16 positions, uint16 indices, one palette colour per face), an 8 m ground grid
   that fills the holes under the city and slopes to the sea, tree positions, the traced road network, the stops and a
   top-down map picture.  This layer fills the same P.FRW object the free-roam game reads (freeroam.js captured it), so
   the stops, map, HUD, jobs, speed traps and so on run unchanged.  Driving surfaces are the road / terrain meshes
   themselves (several levels: bridges, ramps, overpasses), walls come from the near-vertical faces of the loaded tiles. */
(function frrock(){
'use strict';
const P=window.PT8,F=P.FRW;
if(typeof FRR_B64==='undefined'||!F)return;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const O={build:F.build,Hf:F.Hf,roadAt:F.roadAt,nearRoadPt:F.nearRoadPt,farMesh:F.farMesh,World:F.World,makeT:F.makeT};
let J=null,BUF=null,DONE=null,W=null,RK=null;
/* ---------- decode (async, started at load; free roam waits for it) ---------- */
async function decode(){const raw=atob(FRR_B64),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);
 let out;if(typeof DecompressionStream!=='undefined'){const ds=new DecompressionStream('gzip'),s=new Blob([u8]).stream().pipeThrough(ds);out=new Uint8Array(await new Response(s).arrayBuffer())}else throw new Error('no gzip');
 const jl=new DataView(out.buffer).getUint32(0,true);J=JSON.parse(new TextDecoder().decode(out.subarray(4,4+jl)));BUF=out.buffer.slice(4+jl);
 if(J.map){const im=new Image();im.src=J.map;try{await im.decode()}catch(e){}J.mapImg=im}
 if(J.atlas){const im=new Image();im.src=J.atlas;try{await im.decode()}catch(e){}J.atlasImg=im}
 if(J.atlasS){const im=new Image();im.src=J.atlasS;try{await im.decode()}catch(e){}J.atlasSImg=im}return J}
P.FRR={ready:false,p:null};
P.FRR.load=()=>P.FRR.p||(P.FRR.p=decode().then(j=>{P.FRR.ready=true;return j}).catch(e=>{console.warn('rockport pack',e);P.FRR.fail=true}));
setTimeout(()=>P.FRR.load(),4000);
/* ---------- colours: painted sRGB -> what the lit flat material needs (same rule as the island ground) ---------- */
const cc=c=>Math.pow(c,2.2)/.72;
/* ---------- world (built once from the pack) ---------- */
const TILE=256,WX=10240,GC=8,GN=WX/GC+1,NT=WX/TILE;
function buildRock(){if(W)return W;const t0=performance.now();
 const G16=new Int16Array(BUF,J.goff,J.gn*J.gn),HR=new Float32Array(J.gn*J.gn);for(let i=0;i<HR.length;i++)HR[i]=G16[i]/J.gscale;
 W={HR,Z:new Uint8Array(J.gn*J.gn),dd:new Float32Array(J.gn*J.gn).fill(1e4),junc:[],rock:1};
 /* the sea only where the map has no ground of its own (sunken roads below sea level stay dry) */
 if(J.koff!=null){const KM=new Uint8Array(BUF,J.koff,J.gn*J.gn),HW=new Float32Array(HR);for(let i=0;i<HW.length;i++)if(KM[i])HW[i]=Math.max(HW[i],3);W.HRW=HW}
 const pal=J.pal.map(c=>[cc(c[0]),cc(c[1]),cc(c[2])]);
 const tiles=new Map();for(const m of J.m){const e={tile:m[0],cat:m[1],tx:m[2],tz:m[3],nv:m[4],nf:m[5],off:m[6],tid:m.length>7?m[7]:-1};let l=tiles.get(e.tile);if(!l)tiles.set(e.tile,l=[]);l.push(e)}
 /* trees: int16 x*2, y*8, z*2, h*16 then a type byte each */
 const TQ=new Int16Array(BUF,J.trees.off,J.trees.n*4),TT=new Uint8Array(BUF,J.trees.off+J.trees.n*8,J.trees.n),trees=new Map();
 for(let i=0;i<J.trees.n;i++){const x=TQ[i*4]/2,y=TQ[i*4+1]/8,z=TQ[i*4+2]/2,h=TQ[i*4+3]/16,k=Math.floor(z/TILE)*NT+Math.floor(x/TILE);let l=trees.get(k);if(!l)trees.set(k,l=[]);l.push([x,y,z,h,TT[i],i])}
 RK={pal,tiles,trees,ground:new Map()};
 /* roads, stops */
 F.ROADS.length=0;for(const r of J.roads){const n=r.x.length,x=Float32Array.from(r.x),z=Float32Array.from(r.z),y=Float32Array.from(r.y),cum=new Float32Array(n);for(let i=1;i<n;i++)cum[i]=cum[i-1]+Math.hypot(x[i]-x[i-1],z[i]-z[i-1]);
  F.ROADS.push({id:r.id,x,z,y,n,cum,hw:r.hw,type:r.hw>=7?'main':'road',dy:0,gr:0,noTraffic:1})}
 F.POIS.length=0;for(const k in F.POIBY)delete F.POIBY[k];for(const p of J.pois){F.POIS.push(p);F.POIBY[p.id]=p}
 Object.assign(F.SPAWN,J.spawn);if(J.run)Object.assign(F.RUN,J.run,{on:1});else F.RUN.on=0;F.TOWNS.length=0;F.PLAT.length=0;
 W.ms=performance.now()-t0;return W}
/* ---------- tile geometry ---------- */
function meshArrays(e){const nv=e.nv,nf=e.nf,tx_=e.tid>=0,q=new Int16Array(BUF,e.off,nv*3),uo=e.off+nv*6,io=uo+(tx_?nv*4:0),idx=new Uint16Array(BUF,io,nf*3);let co=io+nf*6;if(co&1)co++;const fc=new Uint8Array(BUF,co,nf);
 const V=new Float32Array(nv*3);for(let i=0;i<nv;i++){V[i*3]=e.tx+q[i*3]/64;V[i*3+1]=q[i*3+1]/32;V[i*3+2]=e.tz+q[i*3+2]/64}
 let UV=null;if(tx_){const u=new Int16Array(BUF,uo,nv*2);UV=new Float32Array(nv*2);for(let i=0;i<nv*2;i++)UV[i]=u[i]/1024}return{V,idx,fc,UV}}
/* driving surfaces of one tile: triangles of the terrain and road meshes binned in 8 m cells (built on demand, kept) */
const GCELL=8,GPT=TILE/GCELL;
function ground(k){let g=RK.ground.get(k);if(g)return g;const l=RK.tiles.get(k)||[];const tri=[],road=[];
 for(const e of l){if(e.cat!==0&&e.cat!==5)continue;const a=meshArrays(e),V=a.V,I=a.idx;for(let f=0;f<e.nf;f++){const i0=I[f*3]*3,i1=I[f*3+1]*3,i2=I[f*3+2]*3;
   const ax=V[i0],ay=V[i0+1],az=V[i0+2],bx=V[i1],by=V[i1+1],bz=V[i1+2],cx=V[i2],cy=V[i2+1],cz=V[i2+2];const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;
   if(Math.abs(ny)/nl<.42)continue;tri.push(ax,ay,az,bx,by,bz,cx,cy,cz);road.push(e.cat===5?1:0)}}
 const T=new Float32Array(tri),n=road.length,cells=new Array(GPT*GPT),tx=(k%NT)*TILE,tz=Math.floor(k/NT)*TILE;
 for(let t=0;t<n;t++){const o=t*9,x0=Math.min(T[o],T[o+3],T[o+6]),x1=Math.max(T[o],T[o+3],T[o+6]),z0=Math.min(T[o+2],T[o+5],T[o+8]),z1=Math.max(T[o+2],T[o+5],T[o+8]);
  const i0=clamp(Math.floor((x0-tx)/GCELL),0,GPT-1),i1=clamp(Math.floor((x1-tx)/GCELL),0,GPT-1),j0=clamp(Math.floor((z0-tz)/GCELL),0,GPT-1),j1=clamp(Math.floor((z1-tz)/GCELL),0,GPT-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*GPT+i;(cells[c]||(cells[c]=[])).push(t)}}
 g={T,road:Uint8Array.from(road),cells,tx,tz};RK.ground.set(k,g);if(RK.ground.size>220){const first=RK.ground.keys().next().value;if(first!==k)RK.ground.delete(first)}return g}
/* the fill grid (bilinear) */
function fillH(x,z){const u=clamp(x/GC,0,GN-1.001),v=clamp(z/GC,0,GN-1.001),i=u|0,j=v|0,fx=u-i,fz=v-j,k=j*GN+i,a=W.HR;return a[k]*(1-fx)*(1-fz)+a[k+1]*fx*(1-fz)+a[k+GN]*(1-fx)*fz+a[k+GN+1]*fx*fz}
/* surface under (x,z): the highest driving triangle no more than `up` above y (y=Infinity: the topmost); falls back to the fill */
const HIT={h:0,road:0,nx:0,ny:1,nz:0};
function surf(x,z,y,up){const k=Math.floor(z/TILE)*NT+Math.floor(x/TILE);let best=-1e9,br=0,bn=null;const lim=y+(up==null?1.3:up);
 if(x>=0&&z>=0&&x<WX&&z<WX){const g=ground(k),c=g.cells[clamp(Math.floor((z-g.tz)/GCELL),0,GPT-1)*GPT+clamp(Math.floor((x-g.tx)/GCELL),0,GPT-1)];
  if(c)for(const t of c){const T=g.T,o=t*9,ax=T[o],az=T[o+2],bx=T[o+3],bz=T[o+5],cx=T[o+6],cz=T[o+8],d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-9)continue;
   const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-.002||l2<-.002||l3<-.002)continue;
   const h=l1*T[o+1]+l2*T[o+4]+l3*T[o+7];if(h<=lim&&h>best){best=h;br=g.road[t];bn=o;HIT.T=T}}}
 const fh=fillH(x,z);if(fh>best&&fh<=lim+.4){best=fh;br=0;bn=null}
 if(best<-1e8){best=fh;br=0;bn=null}
 HIT.h=best;HIT.road=br;if(bn!=null){const T=HIT.T,o=bn,ux=T[o+3]-T[o],uy=T[o+4]-T[o+1],uz=T[o+5]-T[o+2],vx=T[o+6]-T[o],vy=T[o+7]-T[o+1],vz=T[o+8]-T[o+2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(ny<0){nx=-nx;ny=-ny;nz=-nz}const l=Math.hypot(nx,ny,nz)||1;HIT.nx=nx/l;HIT.ny=ny/l;HIT.nz=nz/l}
 else{const e=4,hx=fillH(x+e,z)-fillH(x-e,z),hz=fillH(x,z+e)-fillH(x,z-e),l=Math.hypot(hx/(2*e),1,hz/(2*e));HIT.nx=-hx/(2*e)/l;HIT.ny=1/l;HIT.nz=-hz/(2*e)/l}
 return HIT}
const Hf=(x,z)=>surf(x,z,1e6).h;
/* nearest traced road (for GPS / the respawn heading) */
function nearRoadPt(x,z,pred){let bd=1e18,b=null;for(const r of F.ROADS){if(pred&&!pred(r))continue;for(let i=0;i<r.n;i++){const d=(r.x[i]-x)*(r.x[i]-x)+(r.z[i]-z)*(r.z[i]-z);if(d<bd){bd=d;b=[r,i]}}}if(!b)return null;const r=b[0],i=b[1],a=Math.max(0,i-1),c=Math.min(r.n-1,i+1);return{x:r.x[i],z:r.z[i],yaw:Math.atan2(r.x[c]-r.x[a],r.z[c]-r.z[a]),r,i,d:Math.sqrt(bd)}}
/* ---------- engine terrain interface ---------- */
function makeT(){buildRock();const N=16,T={d:{id:0,name:'Free Roam',off:'grass',gravel:false,dust:0x9c9480,dirt:0x5a4630,fog:0xcfe3f2,hemi:[0xe3ecf2,0x6e7a62],sun:0xfff1d6,sky:[0x4f86d6,0xcfe3f2],hw:8},free:true,rock:true,N,L:1000,sp:1,
  x:new Float32Array(N).fill(-9e6),z:new Float32Array(N).fill(-9e6),y:new Float32Array(N),hw:new Float32Array(N).fill(8),psi:new Float32Array(N),bank:new Float32Array(N),gap:new Uint8Array(N),wall:new Uint8Array(N),ice:new Uint8Array(N),br:new Uint8Array(N),wh:new Float32Array(N).fill(1.3),cum:new Float32Array(N),
  pads:[],jumps:[],cpts:[],grid:new Map(),tunnels:[],tn:new Uint8Array(N),bounds:[0,WX,0,WX]};
 const refY=()=>{const c=typeof RACE!=='undefined'&&RACE&&RACE.cars&&RACE.cars[0];return c?c.y:1e6};
 T.terr=(x,z)=>surf(x,z,refY(),1.6).h;T.nz=()=>0;
 /* road under the wheel: the plane of the hit triangle gives the grade / bank the visual tilt uses (psi 0 = +z, lateral = +x) */
 T.surf=(x,z,y)=>{const s=surf(x,z,y,-.2),h=s.h,road=s.road;let gz=-s.nz/s.ny,gx=-s.nx/s.ny;
  /* tilt from the ground around the point (1.5 m each way), not from one triangle: a steep sliver at a road edge
     no longer rolls the car and slides it sideways */
  {const a=surf(x+1.5,z,y,-.2).h,b=surf(x-1.5,z,y,-.2).h,c2=surf(x,z+1.5,y,-.2).h,d=surf(x,z-1.5,y,-.2).h;
   const ok=v=>Math.abs(v-h)<.9;const fx=ok(a)&&ok(b)?(a-b)/3:ok(a)?(a-h)/1.5:ok(b)?(h-b)/1.5:0,fz=ok(c2)&&ok(d)?(c2-d)/3:ok(c2)?(c2-h)/1.5:ok(d)?(h-d)/1.5:0;
   gx=fx;gz=fz;const m=Math.hypot(gx,gz);if(m>.3){gx*=.3/m;gz*=.3/m}}T.psi[2]=0;T.y[0]=h-2*gz;T.y[4]=h+2*gz;T.y[2]=h;T.bank[2]=-gx;T.bank[0]=T.bank[4]=-gx;return{h:road?h+.05:h,road:road?1:0,i:2,lat:0}};
 return T}
/* ---------- far ground: the fill grid at 32 m, sunk under the tiles ---------- */
function groundCol(h,sl,x,z){const g=[.42,.6,.28],dry=[.62,.6,.36],sand=[.86,.8,.6],rock=[.56,.53,.47],sea=[.55,.62,.5];let c;
 if(h<1.5)c=h<-1?sea:sand;else{const t=clamp(h/320,0,1),n=.5+.5*Math.sin(x*.013+Math.sin(z*.011)*2);c=[g[0]+(dry[0]-g[0])*t*.8+n*.03,g[1]+(dry[1]-g[1])*t*.8+n*.02,g[2]+(dry[2]-g[2])*t*.8];if(sl>.55)c=rock;else if(sl>.35){const k=(sl-.35)/.2;c=[c[0]+(rock[0]-c[0])*k,c[1]+(rock[1]-c[1])*k,c[2]+(rock[2]-c[2])*k]}}
 return[cc(c[0]),cc(c[1]),cc(c[2])]}
function farMesh(){if(W.far)return W.far;const FS=4,st=GC*FS,n=Math.floor((GN-1)/FS)+1,pos=new Float32Array(n*n*3),col=new Float32Array(n*n*3),idx=[];
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=i*st,z=j*st,gi=Math.min(i*FS,GN-1),gj=Math.min(j*FS,GN-1);let m=1e9;for(let b=-FS;b<=FS;b+=2)for(let a=-FS;a<=FS;a+=2){const h=W.HR[clamp(gj+b,0,GN-1)*GN+clamp(gi+a,0,GN-1)];if(h<m)m=h}
  const h=W.HR[gj*GN+gi],sl=Math.hypot(W.HR[gj*GN+Math.min(gi+FS,GN-1)]-W.HR[gj*GN+Math.max(gi-FS,0)],W.HR[Math.min(gj+FS,GN-1)*GN+gi]-W.HR[Math.max(gj-FS,0)*GN+gi])/(2*st),v=(j*n+i)*3,c=groundCol(h,sl,x,z);
  pos[v]=x;pos[v+1]=m-2.2;pos[v+2]=z;col[v]=c[0];col[v+1]=c[1];col[v+2]=c[2]}
 for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+1,c=a+n,d=c+1;if((i+j)&1)idx.push(a,c,b,b,c,d);else idx.push(a,c,d,a,d,b)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
 const m=new THREE.Mesh(g,F.mats().terrain);m.frustumCulled=false;return W.far=m}
/* ---------- tile builder: city meshes (flat face colours), its patch of fill ground, trees, wall segments ---------- */
const TREES=[['q_pine1','q_pine2','q_pine3','q_pine4'],['q_oak3','q_oak4','q_oak5'],['q_bush1','q_bush2']];
/* the original texture most used by each category: the faces the converter left without one (flat colours) get it, so our
   old flat colours no longer sit next to the original textures */
let DOMT=null;function domTex(){if(DOMT)return DOMT;const cnt=[{},{},{},{},{},{}];for(const l of RK.tiles.values())for(const e of l)if(e.tid>=0&&e.cat<6)cnt[e.cat][e.tid]=(cnt[e.cat][e.tid]||0)+e.nf;
 const lum=t=>{const c=J.texc&&J.texc[t];return c?(c[0]+c[1]+c[2])/3:.3},plain=t=>{const c=J.texc&&J.texc[t];if(!c)return true;const mx=Math.max(c[0],c[1],c[2]),mn=Math.min(c[0],c[1],c[2]);return (mx-mn)/Math.max(mx,.001)<.15&&lum(t)>.2&&lum(t)<.75&&(!J.texv||J.texv[t]<.1)};
 DOMT=cnt.map((c,cat)=>{let b=-1,n=0;for(const k in c)if(c[k]>n&&(cat===0||plain(+k))&&(cat!==5||lum(+k)<.36)){n=c[k];b=+k}return b>=0?J.tex[b]:null});return DOMT}
function buildTile(k,lod){const M=F.mats(),group=new THREE.Group(),tx=(k%NT)*TILE,tz=Math.floor(k/NT)*TILE;group.userData.chunk=k;group.userData.lod=lod|0;group.userData.cars=[];
 const l=RK.tiles.get(k)||[],pos=[],col=[],posR=[],colR=[],posW=[],colW=[],uvW=[],segs=[],posT=[],uvT=[],rcT=[],posTR=[],uvTR=[],rcTR=[];let nT=0;
 for(const e of l){if(e.cat===4)continue;const a=meshArrays(e),V=a.V,I=a.idx,fc=a.fc,UV=a.UV,rc=UV?J.tex[e.tid]:null;nT+=e.nf;
  for(let f=0;f<e.nf;f++){const i0=I[f*3]*3,i1=I[f*3+1]*3,i2=I[f*3+2]*3,c=RK.pal[fc[f]];
   /* original textures: one atlas, each vertex carries its texture's rect (the shader tiles inside it) */
   if(UV){const P_=e.cat===5?posTR:posT,U_=e.cat===5?uvTR:uvT,C_=e.cat===5?rcTR:rcT;for(const i of[I[f*3],I[f*3+1],I[f*3+2]]){P_.push(V[i*3],V[i*3+1],V[i*3+2]);U_.push(UV[i*2],UV[i*2+1]);C_.push(rc[0],rc[1],rc[2],rc[3])}}
   else{const ux=V[i1]-V[i0],uy=V[i1+1]-V[i0+1],uz=V[i1+2]-V[i0+2],vx=V[i2]-V[i0],vy=V[i2+1]-V[i0+1],vz=V[i2+2]-V[i0+2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;
    /* no texture of its own: borrow one (facade / roof for buildings, the category's usual one otherwise), planar UVs */
    let done=false;{const D=domTex(),vert=Math.abs(ny)/nl<.3;let rc=null,su=0,sv=0,mode=0;
     if(e.cat===1&&J.fac&&J.fac.length&&vert){const fq=J.fac[(Math.abs((e.off|0)*7+(e.tile|0)*3)>>3)%Math.min(6,J.fac.length)];rc=J.tex[fq[0]];su=fq[1];sv=fq[2];mode=1}
     else if(e.cat===1&&J.roo&&J.roo.length){rc=J.tex[J.roo[0][0]];su=sv=J.roo[0][1];mode=2}
     else if(D[e.cat]&&e.cat!==1){rc=(e.cat===0&&vert&&D[2])?D[2]:D[e.cat];su=sv=(e.cat===0||e.cat===5)?8:2.5;mode=vert?3:2}
     if(rc){const P_=e.cat===5?posTR:posT,U_=e.cat===5?uvTR:uvT,C_=e.cat===5?rcTR:rcT,ax_=-nz/nl,az_=nx/nl,al=Math.hypot(ax_,az_)||1;
      for(const i of[i0,i1,i2]){P_.push(V[i],V[i+1],V[i+2]);let u,v;if(mode===2){u=V[i]/su;v=V[i+2]/sv}else{u=(V[i]*ax_/al+V[i+2]*az_/al)/su;v=1-V[i+1]/sv}U_.push(u,v);C_.push(rc[0],rc[1],rc[2],rc[3])}
      done=true}}
    /* roads in their own mesh (drawn over anything coplanar: no grass flicker through the asphalt); building walls get windows */
    if(done){}else if(e.cat===5){posR.push(V[i0],V[i0+1],V[i0+2],V[i1],V[i1+1],V[i1+2],V[i2],V[i2+1],V[i2+2]);colR.push(c[0],c[1],c[2],c[0],c[1],c[2],c[0],c[1],c[2])}
    else if(e.cat===1&&Math.abs(ny)/nl<.3){const tx_=-nz/nl,tz_=nx/nl,tl=Math.hypot(tx_,tz_)||1,ax_=tx_/tl,az_=tz_/tl;
     for(const i of[i0,i1,i2]){posW.push(V[i],V[i+1],V[i+2]);colW.push(c[0],c[1],c[2]);uvW.push((V[i]*ax_+V[i+2]*az_)/WINW,V[i+1]/WINH)}}
    else{pos.push(V[i0],V[i0+1],V[i0+2],V[i1],V[i1+1],V[i1+2],V[i2],V[i2+1],V[i2+2]);col.push(c[0],c[1],c[2],c[0],c[1],c[2],c[0],c[1],c[2])}}
   /* walls: near-vertical faces of buildings, walls, objects and steep terrain become 2-D segments with a height range */
   if(e.cat===4)continue;const ax=V[i0],ay=V[i0+1],az=V[i0+2],bx=V[i1],by=V[i1+1],bz=V[i1+2],cx=V[i2],cy=V[i2+1],cz=V[i2+2];
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;if(Math.abs(ny)/nl>.3)continue;
   const y0=Math.min(ay,by,cy),y1=Math.max(ay,by,cy);if(y1-y0<(e.cat===0||e.cat===5?1.4:.7))continue;
   const d1=(ax-bx)*(ax-bx)+(az-bz)*(az-bz),d2=(bx-cx)*(bx-cx)+(bz-cz)*(bz-cz),d3=(cx-ax)*(cx-ax)+(cz-az)*(cz-az);let p,q;if(d1>=d2&&d1>=d3){p=[ax,az];q=[bx,bz]}else if(d2>=d3){p=[bx,bz];q=[cx,cz]}else{p=[cx,cz];q=[ax,az]}
   if(Math.max(d1,d2,d3)<.16)continue;segs.push(p[0],p[1],q[0],q[1],y0,y1)}}
 for(const[P_,U_,C_,road] of[[posT,uvT,rcT,0],[posTR,uvTR,rcTR,1]]){if(!P_.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P_,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U_,2));g.setAttribute('arect',new THREE.Float32BufferAttribute(C_,4));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,road?amats().road:amats().base);m.userData.fogCull=true;m.receiveShadow=!lod;m.userData.kind=road?'road':'city';group.add(m)}
 if(posR.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(posR,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colR,3));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rmats().road);m.userData.fogCull=true;m.receiveShadow=!lod;m.userData.kind='road';group.add(m)}
 if(posW.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(posW,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colW,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvW,2));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rmats().wall);m.userData.fogCull=true;m.receiveShadow=!lod;m.userData.kind='city';group.add(m)}
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,M.props);m.userData.fogCull=true;m.receiveShadow=!lod;m.castShadow=false;m.userData.kind='city';group.add(m)}
 /* fill ground patch (8 m), skipped where it is all sea */
 {const n=TILE/GC+1,p=new Float32Array(n*n*3),c=new Float32Array(n*n*3),idx=[];let hmax=-1e9;const gi0=tx/GC,gj0=tz/GC;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const gi=Math.min(gi0+i,GN-1),gj=Math.min(gj0+j,GN-1),h=W.HR[gj*GN+gi],v=(j*n+i)*3,x=tx+i*GC,z=tz+j*GC;if(h>hmax)hmax=h;
   const sl=Math.hypot(W.HR[gj*GN+Math.min(gi+1,GN-1)]-W.HR[gj*GN+Math.max(gi-1,0)],W.HR[Math.min(gj+1,GN-1)*GN+gi]-W.HR[Math.max(gj-1,0)*GN+gi])/(2*GC),cl=groundCol(h,sl,x,z);p[v]=x;p[v+1]=h;p[v+2]=z;c[v]=cl[0];c[v+1]=cl[1];c[v+2]=cl[2]}
  if(hmax>-6){for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+1,cc_=a+n,d=cc_+1;if((i+j)&1)idx.push(a,cc_,b,b,cc_,d);else idx.push(a,cc_,d,a,d,b)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
   /* the fill ground wears the map's own grass texture, lightly tinted by our sand / rock / grass colour */
   const GT=domTex()[0];let gm=M.terrain;if(GT){const uv=new Float32Array(n*n*2),rc=new Float32Array(n*n*4);for(let q=0;q<n*n;q++){uv[q*2]=p[q*3]/8;uv[q*2+1]=p[q*3+2]/8;rc.set(GT,q*4);
     const mn=(c[q*3]+c[q*3+1]+c[q*3+2])/3||1;for(let k2=0;k2<3;k2++)c[q*3+k2]=1+(c[q*3+k2]/mn-1)*.35}
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('arect',new THREE.BufferAttribute(rc,4));gm=amats().terr}
   const m=new THREE.Mesh(g,gm);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}}
 /* trees: the game's own low-poly models at the original tree spots */
 const tl=RK.trees.get(k),pts=[];if(tl&&P.FM){const G={pos:[],col:[],sw:[]},fm=P.FM,hs=(i)=>{const q=Math.sin(i*12.9898)*43758.5453;return q-Math.floor(q)};
  for(const t of tl){const r=hs(t[5]),names=TREES[t[4]]||TREES[1],n=names[(r*names.length)|0],sz=fm.size(n)[1]||1,h=Math.min(t[3],t[4]===2?3:t[4]===0?22:16);if(lod&&r<.35)continue;
   fm.put(G,lod?n+'~lo':n,t[0],t[1]-.2,t[2],h/sz,r*37.7,{tint:[.9+r*.15,.98,.88+r*.1],sway:1});if(t[4]!==2)pts.push(t[0],t[2],t[1],.5)}
  if(G.pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));if(G.sw.length===G.pos.length/3)g.setAttribute('aSway',new THREE.Float32BufferAttribute(G.sw,1));g.computeVertexNormals();g.computeBoundingSphere();
   const m=new THREE.Mesh(g,M.props);m.userData.fogCull=true;m.castShadow=!lod;m.receiveShadow=!lod;m.userData.kind='trees';group.add(m)}}
 group.userData.wsegs=new Float32Array(segs);group.userData.tpts=new Float32Array(pts);group.userData.tris=nT;return group}
/* ---------- Rockport materials: roads drawn on top of coplanar ground, building walls with a mip-mapped window texture ---------- */
const WINW=12.8,WINH=14;let RM=null,AM=null,AT=null;
/* ---------- looks: one colour grade shared by the map and the home garage (Hakan picks one; L key cycles in free roam) ---------- */
const LOOK=P.LOOK||(P.LOOK={u:{value:0},b:{value:0},n:0});
const LOOK_GLSL='uniform float uLook;uniform float uLookB;\nvec3 lkS(vec3 c){return pow(max(c,vec3(0.)),vec3(1./2.2));}\nfloat lkL(vec3 s){return dot(s,vec3(.299,.587,.114));}\n'+
 'vec3 lkGrade(vec3 c,vec3 cb){if(uLook<.5)return c;vec3 s=lkS(c);float l=lkL(s);\n'+
 'if(uLook<1.5){s=mix(vec3(l),s,1.4)*1.15+.04;}\n'+
 'else if(uLook<2.5){s=mix(vec3(l),s,1.6);s=(s-.5)*1.1+.5;s=s*1.15+.06;}\n'+
 /* clean: colour from a heavily blurred copy (no grime), the pattern (windows, bricks, lines) kept as light/dark only */
 'else{vec3 b=lkS(cb);float d=clamp(l-lkL(b),-.3,.3);float bl=lkL(b);b=mix(vec3(bl),b,1.8)*1.22+.07;s=b+d*.5;}\n'+
 'return pow(clamp(s,0.,1.),vec3(2.2));}\n';
/* patch any standard material (the garage model): grade after the texture, blur the texture in the clean look */
P.lookPatch=m=>{if(!m||m.userData.lk)return;m.userData.lk=1;const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(ob)ob(sh,r);sh.uniforms.uLook=LOOK.u;sh.uniforms.uLookB=LOOK.b;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\n'+LOOK_GLSL)
   .replace('#include <map_fragment>','vec3 lkB=diffuseColor.rgb;\n#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vUv,uLookB);texelColor=mapTexelToLinear(texelColor);lkB*=mapTexelToLinear(texture2D(map,vUv,4.5)).rgb;diffuseColor*=texelColor;\n#endif\ndiffuseColor.rgb=lkGrade(diffuseColor.rgb,lkB);')};
 const ok=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';m.customProgramCacheKey=()=>ok()+'|lk';m.needsUpdate=true};
const LOOKS=[
 {name:'Original, overcast',sky:['#7d8a96','#aeb7bd','#bfc6ca'],fog:0xb4bcc0,hemi:[0xcdd5dc,0x4f4c44,.85],sun:[0xe9e4da,.55],flat:false},
 {name:'Graded, sunny',sky:['#5f93d6','#b9d3ec','#d6e3ee'],fog:0xd3dfe9,hemi:[0xe3ecf4,0x6c7262,1.0],sun:[0xfff0d6,.95],flat:false},
 {name:'Soft painted',sky:['#6f9fdc','#c3d8ec','#dde6ee'],fog:0xd6e1ea,hemi:[0xe6eef5,0x6c7262,1.0],sun:[0xfff0d6,.95],flat:true},
 {name:'Poly style',sky:['#4f86d6','#b9d6f0','#d6e6f2'],fog:0xd3e2ee,hemi:[0xe8f0f6,0x6c7a5e,1.1],sun:[0xfff1d6,1.0],flat:true,own:true},
 {name:'Clean poly',sky:['#93aecb','#c9d3dd','#d5dce3'],fog:0xd0d8e0,hemi:[0xe8eef4,0x707866,1.1],sun:[0xfff3dc,1.0],flat:true}];
P.rockLook=n=>{n=((n|0)%LOOKS.length+LOOKS.length)%LOOKS.length;const L=LOOKS[n];LOOK.n=n;LOOK.u.value=L.own?0:n>3?3:n;
 if(AT&&J.atlasSImg){const im=L.own?J.atlasSImg:J.atlasImg;if(AT.image!==im){AT.image=im;AT.needsUpdate=true}}LOOK.b.value=n===2?1.6:0;
 const mats=[];if(AM)mats.push(AM.base,AM.road,AM.terr);const H=P.homeGLB;if(H)H.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData.lk)mats.push(o.material)});
 for(const m of mats){if(m&&m.flatShading!==L.flat){m.flatShading=L.flat;m.needsUpdate=true}}
 const sc=typeof RACE!=='undefined'&&RACE&&RACE.mode==='free'&&RACE.scene;if(sc){if(sc.fog)sc.fog.color.setHex(L.fog);
  sc.children.forEach(o=>{if(o.isHemisphereLight){o.color.setHex(L.hemi[0]);o.groundColor.setHex(L.hemi[1]);o.intensity=L.hemi[2]}else if(o.isDirectionalLight){o.color.setHex(L.sun[0]);o.intensity=L.sun[1]}
   else if(o.isMesh&&o.material&&o.material.side===THREE.BackSide&&o.material.map){const c=document.createElement('canvas');c.width=2;c.height=64;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,L.sky[0]);g.addColorStop(.45,L.sky[1]);g.addColorStop(.5,L.sky[2]);g.addColorStop(1,L.sky[2]);x.fillStyle=g;x.fillRect(0,0,2,64);const t=new THREE.CanvasTexture(c);t.encoding=o.material.map.encoding;o.material.map=t;o.material.needsUpdate=true}})}
 return L.name};
addEventListener('keydown',e=>{if(e.code==='KeyL'&&!e.repeat&&typeof RACE!=='undefined'&&RACE&&RACE.mode==='free'&&on&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))){const nm=P.rockLook(LOOK.n+1);if(P.frToast)P.frToast('Look: '+nm,'#9cc4ec')}});
/* the original Rockport textures: one atlas; uv is tiled inside each texture's rect, mip level from the unwrapped uv so the
   tile seams stay clean */
function amats(){if(AM)return AM;const t=new THREE.Texture(J.atlasImg);AT=t;t.flipY=false;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;
 const mk=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:.92,metalness:0,side:THREE.DoubleSide},o));
  m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_pars_vertex>','#include <uv_pars_vertex>\nattribute vec4 arect;varying vec4 vRect;').replace('#include <uv_vertex>','#include <uv_vertex>\nvRect=arect;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\nvarying vec4 vRect;')
    .replace('#include <map_fragment>','vec2 aUv=vRect.xy+fract(vUv)*vRect.zw;\n#if __VERSION__>=300\nvec4 texelColor=textureGrad(map,aUv,dFdx(vUv)*vRect.zw*exp2(uLookB),dFdy(vUv)*vRect.zw*exp2(uLookB));\n#else\nvec4 texelColor=texture2D(map,aUv);\n#endif\ntexelColor=mapTexelToLinear(texelColor);vec3 lkB=diffuseColor.rgb;\n#if __VERSION__>=300\nlkB*=mapTexelToLinear(textureGrad(map,vRect.xy+fract(vUv)*vRect.zw,dFdx(vUv)*vRect.zw*8.,dFdy(vUv)*vRect.zw*8.)).rgb;\n#else\nlkB*=texelColor.rgb;\n#endif\ndiffuseColor*=texelColor;diffuseColor.rgb=lkGrade(diffuseColor.rgb,lkB);').replace('#include <map_pars_fragment>','#include <map_pars_fragment>\n'+LOOK_GLSL);sh.uniforms.uLook=LOOK.u;sh.uniforms.uLookB=LOOK.b};
  m.customProgramCacheKey=()=>'rockatlas'+(o.polygonOffset?1:0)+(o.vertexColors?'v':'');return m};
 AM={base:mk({}),road:mk({polygonOffset:true,polygonOffsetFactor:-1.5,polygonOffsetUnits:-3}),terr:mk({vertexColors:true})};return AM}
function rmats(){if(RM)return RM;const M=F.mats();
 const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');x.fillStyle='#e4e2dc';x.fillRect(0,0,128,128);
 let sd=7;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 for(let r=0;r<4;r++){x.fillStyle='rgba(0,0,0,.10)';x.fillRect(0,r*32+27,128,3);for(let c=0;c<4;c++){const lit=rnd()<.16;x.fillStyle=lit?'#f3dfa2':(rnd()<.5?'#3d4f63':'#4a5c70');x.fillRect(c*32+6,r*32+7,20,16);x.fillStyle='rgba(255,255,255,.22)';x.fillRect(c*32+6,r*32+7,20,3);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(c*32+15,r*32+7,2,16)}}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
 const mk=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide},o));if(typeof styleMaterial==='function')styleMaterial(m);return m};
 RM={road:mk({color:0x909090,flatShading:true,polygonOffset:true,polygonOffsetFactor:-1.5,polygonOffsetUnits:-3}),wall:mk({color:0x9a9a9a,map:t,roughness:.82})};return RM}
/* ---------- the garage (Hakan's building, in the map's flat style) ---------- */
function garageMesh(){const G=J.garage;if(!G)return null;if(W.garage)return W.garage;
 /* outside it is just another city block (Hakan): a box with one of the city's own facade textures and a roof texture,
    a roller door and a small lit logo sign as the only tell; the garage model itself is the inside */
 const c=Math.cos(G.ry),s_=Math.sin(G.ry),X0=-10,X1=10,Z0=-9,Z1=12,Y0=-1.2,Y1=11,wp=(lx,ly,lz)=>[G.x+lx*c+lz*s_,G.y+ly,G.z-lx*s_+lz*c];
 const fac=(J.fac&&J.fac.length)?J.fac[(Math.abs(Math.round(G.x*7+G.z*3))%Math.min(6,J.fac.length))]:null,roo=(J.roo&&J.roo.length)?J.roo[0]:null;
 const pos=[],uv=[],rc=[],segs=[],grp=new THREE.Group();
 const quad=(a,b,cq,d,ua,tid)=>{const r=J.tex[tid];for(const[p,u]of[[a,ua[0]],[b,ua[1]],[cq,ua[2]],[a,ua[0]],[cq,ua[2]],[d,ua[3]]]){pos.push(...p);uv.push(u[0],u[1]);rc.push(r[0],r[1],r[2],r[3])}};
 const wall=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),mu=fac?fac[1]:10,mv=fac?fac[2]:10,h=Y1-Y0;
  if(fac)quad(wp(ax,Y0,az),wp(bx,Y0,bz),wp(bx,Y1,bz),wp(ax,Y1,az),[[0,1],[L/mu,1],[L/mu,1-h/mv],[0,1-h/mv]],fac[0]);
  const A=wp(ax,0,az),B=wp(bx,0,bz);segs.push(A[0],A[2],B[0],B[2],G.y+Y0,G.y+Y1)};
 wall(X0,Z1,X1,Z1);wall(X1,Z1,X1,Z0);wall(X1,Z0,X0,Z0);wall(X0,Z0,X0,Z1);
 if(roo){const m=roo[1];const A=wp(X0,Y1,Z0),B=wp(X1,Y1,Z0),C_=wp(X1,Y1,Z1),D=wp(X0,Y1,Z1);quad(A,B,C_,D,[[0,0],[20/m,0],[20/m,21/m],[0,21/m]],roo[0])}
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('arect',new THREE.Float32BufferAttribute(rc,4));g.computeVertexNormals();
  const m=new THREE.Mesh(g,amats().base);m.castShadow=m.receiveShadow=true;grp.add(m)}
 /* roller door: ribbed steel */
 {const cv=document.createElement('canvas');cv.width=64;cv.height=128;const x=cv.getContext('2d');x.fillStyle='#6d737a';x.fillRect(0,0,64,128);for(let r=0;r<128;r+=8){x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,r+6,64,2);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,r,64,1)}
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;const d=new THREE.Mesh(new THREE.PlaneGeometry(7,4.6),new THREE.MeshStandardMaterial({map:t,roughness:.6,metalness:.4}));
  const p=wp(0,2.3,Z1+.05);d.position.set(p[0],p[1],p[2]);d.rotation.y=G.ry;grp.add(d)}
 /* the indicator: a lit logo sign over the door with a chrome-blue light bar */
 {const cv=document.createElement('canvas');cv.width=512;cv.height=512;const x=cv.getContext('2d');
  x.fillStyle='#1b1f24';x.beginPath();x.roundRect?x.roundRect(8,8,496,496,46):x.rect(8,8,496,496);x.fill();x.strokeStyle='#cfd6de';x.lineWidth=7;x.stroke();
  x.strokeStyle='#ffffff';x.lineWidth=20;x.beginPath();x.arc(256,214,128,0,Math.PI*2);x.stroke();
  x.lineJoin='miter';x.lineWidth=26;x.beginPath();x.moveTo(184,250);x.lineTo(256,168);x.lineTo(328,250);x.stroke();
  x.fillStyle='#8fb4d8';x.fillRect(206,266,100,18);x.fillStyle='#ffffff';x.font='600 46px Inter,Helvetica,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('G A R A G E',256,416);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));const p=wp(0,6.7,Z1+.12);sg.position.set(p[0],p[1],p[2]);sg.rotation.y=G.ry;grp.add(sg);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(7.4,.16,.12),new THREE.MeshBasicMaterial({color:0x8fb4d8,toneMapped:false}));const q=wp(0,4.85,Z1+.1);bar.position.set(q[0],q[1],q[2]);bar.rotation.y=G.ry;grp.add(bar)}
 grp.userData.kind='garage';grp.userData.wsegs=new Float32Array(segs);return W.garage=grp}
/* distant mountains (panorama meshes): always shown */
function panorama(){const pos=[],col=[];for(const[k,l]of RK.tiles)for(const e of l){if(e.cat!==4)continue;const a=meshArrays(e),V=a.V,I=a.idx;for(let f=0;f<e.nf;f++){const c=RK.pal[a.fc[f]];for(let q=0;q<3;q++){const i=I[f*3+q]*3;pos.push(V[i],V[i+1],V[i+2]);col.push(c[0],c[1],c[2])}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,F.mats().props);m.frustumCulled=false;return m}
/* ---------- streaming: tiles within ~1.4 km, the nearest in full detail; collision set refreshed around the car ---------- */
function World(scene,T,opt){const R=6,o={scene,T,loaded:new Map(),stats:{built:0,ms:0},cars:null,colT:0};
 if(!W.pano){W.pano=panorama()}scene.add(W.pano);const gm=garageMesh();if(gm)scene.add(gm);
 const ok=(i,j)=>i>=0&&j>=0&&i<NT&&j<NT;
 o.add=(i,j,lod)=>{const k=j*NT+i;if(o.loaded.has(k)||!ok(i,j))return;const t=performance.now(),g=buildTile(k,lod);scene.add(g);o.loaded.set(k,g);o.stats.built++;o.stats.ms+=performance.now()-t};
 o.drop=k=>{const g=o.loaded.get(k);if(!g)return;scene.remove(g);g.traverse(m=>{if(m.geometry&&!m.userData.shared)m.geometry.dispose()});o.loaded.delete(k)};
 const pick=(cx,cz,fx,fz)=>{let best=null,bs=1e9;for(let dz=-R;dz<=R;dz++)for(let dx=-R;dx<=R;dx++){const d2=dx*dx+dz*dz;if(d2>R*R+1)continue;const a=cx+dx,b=cz+dz;if(!ok(a,b)||o.loaded.has(b*NT+a))continue;const sc=d2-(dx*fx+dz*fz)*1.5;if(sc<bs){bs=sc;best=[a,b,d2]}}return best};
 o.update=(px,pz,fx,fz,budget)=>{const cx=Math.floor(px/TILE),cz=Math.floor(pz/TILE);const t0=performance.now();let n=0,b;
  while((b=pick(cx,cz,fx,fz))&&n<3){o.add(b[0],b[1],b[2]>5?1:0);n++;if(performance.now()-t0>(budget||6))break}
  if(!n)for(const[k,g]of o.loaded){if(!g.userData.lod)continue;const dx=(k%NT)-cx,dz=Math.floor(k/NT)-cz;if(dx*dx+dz*dz<=5){o.drop(k);o.add(k%NT,Math.floor(k/NT),0);break}}
  for(const k of [...o.loaded.keys()]){const dx=(k%NT)-cx,dz=Math.floor(k/NT)-cz;if(dx*dx+dz*dz>(R+1.6)*(R+1.6))o.drop(k)}
  o.colT-=1/60;if(o.colT<=0){o.colT=.2;o.rebuildCol()}};
 /* only the walls the car can hit: within 70 m and overlapping the car's height band */
 o.rebuildCol=()=>{const c=typeof RACE!=='undefined'&&RACE&&RACE.cars&&RACE.cars[0];const X=T._bx||(T._bx={segs:[],pts:[]});X.segs.length=0;X.pts.length=0;if(!c){T._bg=null;return}
  const y0=c.y-.9,y1=c.y+1.4,R2=70*70;for(const[k,g]of o.loaded){const tx=(k%NT)*TILE+TILE/2,tz=Math.floor(k/NT)*TILE+TILE/2;if(Math.abs(tx-c.x)>TILE/2+80||Math.abs(tz-c.z)>TILE/2+80)continue;
   const s=g.userData.wsegs;for(let i=0;i<s.length;i+=6){if(s[i+5]<y0||s[i+4]>y1)continue;const mx=(s[i]+s[i+2])/2-c.x,mz=(s[i+1]+s[i+3])/2-c.z;if(mx*mx+mz*mz>R2)continue;X.segs.push([s[i],s[i+1],s[i+2],s[i+3],.18])}
   const p=g.userData.tpts;for(let i=0;i<p.length;i+=4){const dx=p[i]-c.x,dz=p[i+1]-c.z;if(dx*dx+dz*dz>R2||Math.abs(p[i+2]-c.y)>4)continue;X.pts.push([p[i],p[i+1],p[i+3]])}}
  if(W.garage){const s=W.garage.userData.wsegs;for(let i=0;i<s.length;i+=6){if(s[i+5]<y0||s[i+4]>y1)continue;const mx=(s[i]+s[i+2])/2-c.x,mz=(s[i+1]+s[i+3])/2-c.z;if(mx*mx+mz*mz>R2)continue;X.segs.push([s[i],s[i+1],s[i+2],s[i+3],.18])}}
  T._bg=null};
 o.fill=(px,pz,rad)=>{const cx=Math.floor(px/TILE),cz=Math.floor(pz/TILE);for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++)if(dx*dx+dz*dz<=rad*rad+1)o.add(cx+dx,cz+dz,dx*dx+dz*dz>5?1:0);o.rebuildCol()};
 o.dispose=()=>{for(const k of [...o.loaded.keys()])o.drop(k);scene.remove(W.pano);if(W.garage)scene.remove(W.garage)};return o}
/* ---------- switch P.FRW over (same object: freeroam.js holds a reference to it) ---------- */
let on=false;
function activate(){if(on)return;on=true;buildRock();
 Object.assign(F,{build:buildRock,Hf,roadAt:()=>null,nearRoadPt,farMesh,World,makeT,WX,WZ:WX,CELL:GC,CH:TILE,rock:true,mapImg:J.mapImg||null});
 Object.defineProperty(F,'W',{get:()=>W,configurable:true});Object.defineProperty(F,'G',{get:()=>null,configurable:true})}
P.FRR.activate=activate;
/* free roam waits for the pack (a few seconds after boot it is normally ready): freeLaunch asks the gate first */
P.FRR.gate=go=>{if(on||P.FRR.fail)return false;if(P.FRR.ready){activate();return false}
 const fd=document.getElementById('fade');if(fd)fd.style.opacity=1;P.FRR.load().then(()=>{if(P.FRR.ready)activate();go()});return true};
/* no people, no herds; traffic comes later (it needs lane directions on the traced roads) */
for(const n of['frLifeTick','frAnimalsTick','frLifeInit','frAnimalsInit']){const f=P[n];if(f)P[n]=function(){if(F.rock)return /Init$/.test(n)?{off:1}:undefined;return f.apply(this,arguments)}}
/* ---------- driving on Rockport: the car stays planted over crests and bank edges (no pop into the air), and its nose and tail
   collide with walls too (the engine only tests a circle round the middle of the car) ---------- */
{const sc0=stepCar;stepCar=function(c,dt){const r=sc0.apply(this,arguments);try{const T=RACE&&RACE.T;if(!T||!T.rock||!c.human||c.respT>0)return r;
 const s=surf(c.x,c.z,c.y,1.3),gap=c.y-s.h;let nG=0;for(const w of c.m.wheels)if(w.g)nG++;
 if(nG>=3){c._rest=c._rest==null?gap:c._rest+(gap-c._rest)*.02;c._air=0}else c._air=(c._air||0)+dt;
 const rest=c._rest!=null?Math.min(Math.max(c._rest,.35),1):.6,lift=gap-rest,sp=Math.hypot(c.vx,c.vz);
 const vmax=Math.max(0,c._gv||0)+1.2;if(c.vy>vmax&&lift<1.5)c.vy=vmax;
 if(lift>.03&&lift<1.6&&c._air<.7)c.vy-=Math.min(34,16+sp*.45)*dt;
 /* nose / tail */
 const g=T._bg;if(g&&g.size&&sp>.3){const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);
  for(const off of[1.55,-1.45]){const px=c.x+fx*off,pz=c.z+fz*off,cx=Math.floor(px/8),cz=Math.floor(pz/8);let bd=1e9,bnx=0,bnz=0,br=0;
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=g.get((cx+a)+','+(cz+b));if(!l)continue;for(const q of l){let qx,qz,rr;if(q.length===5){const dx=q[2]-q[0],dz=q[3]-q[1],ll=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((px-q[0])*dx+(pz-q[1])*dz)/ll));qx=q[0]+dx*t;qz=q[1]+dz*t;rr=q[4]}else{qx=q[0];qz=q[1];rr=q[2]}
     const ex=px-qx,ez=pz-qz,d=Math.hypot(ex,ez);if(d-rr<bd){bd=d-rr;bnx=d>1e-3?ex/d:0;bnz=d>1e-3?ez/d:0;br=rr}}}
   const R0=.78;if(bd<R0&&(bnx||bnz)){const pen=R0-bd;c.x+=bnx*pen;c.z+=bnz*pen;const vn=c.vx*bnx+c.vz*bnz;if(vn<0){c.vx-=1.2*vn*bnx;c.vz-=1.2*vn*bnz;c.vx*=.9;c.vz*=.9;if(-vn>3&&P.sfx){try{P.sfx('crash')}catch(e){}}}}}}
}catch(e){}return r}}
})();
