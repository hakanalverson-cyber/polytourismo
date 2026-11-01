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
 if(J.map){const im=new Image();im.src=J.map;try{await im.decode()}catch(e){}J.mapImg=im}return J}
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
 const pal=J.pal.map(c=>[cc(c[0]),cc(c[1]),cc(c[2])]);
 const tiles=new Map();for(const m of J.m){const e={tile:m[0],cat:m[1],tx:m[2],tz:m[3],nv:m[4],nf:m[5],off:m[6]};let l=tiles.get(e.tile);if(!l)tiles.set(e.tile,l=[]);l.push(e)}
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
function meshArrays(e){const nv=e.nv,nf=e.nf,q=new Int16Array(BUF,e.off,nv*3),io=e.off+nv*6,idx=new Uint16Array(BUF,io,nf*3);let co=io+nf*6;if(co&1)co++;const fc=new Uint8Array(BUF,co,nf);
 const V=new Float32Array(nv*3);for(let i=0;i<nv;i++){V[i*3]=e.tx+q[i*3]/64;V[i*3+1]=q[i*3+1]/32;V[i*3+2]=e.tz+q[i*3+2]/64}return{V,idx,fc}}
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
 T.surf=(x,z,y)=>{const s=surf(x,z,y,1.3),h=s.h,gz=-s.nz/s.ny,gx=-s.nx/s.ny;T.psi[2]=0;T.y[0]=h-2*gz;T.y[4]=h+2*gz;T.y[2]=h;T.bank[2]=-gx;T.bank[0]=T.bank[4]=-gx;return{h:s.road?h+.05:h,road:s.road?1:0,i:2,lat:0}};
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
function buildTile(k,lod){const M=F.mats(),group=new THREE.Group(),tx=(k%NT)*TILE,tz=Math.floor(k/NT)*TILE;group.userData.chunk=k;group.userData.lod=lod|0;group.userData.cars=[];
 const l=RK.tiles.get(k)||[],pos=[],col=[],segs=[];let nT=0;
 for(const e of l){if(e.cat===4)continue;const a=meshArrays(e),V=a.V,I=a.idx,fc=a.fc;nT+=e.nf;
  for(let f=0;f<e.nf;f++){const i0=I[f*3]*3,i1=I[f*3+1]*3,i2=I[f*3+2]*3,c=RK.pal[fc[f]];
   pos.push(V[i0],V[i0+1],V[i0+2],V[i1],V[i1+1],V[i1+2],V[i2],V[i2+1],V[i2+2]);col.push(c[0],c[1],c[2],c[0],c[1],c[2],c[0],c[1],c[2]);
   /* walls: near-vertical faces of buildings, walls, objects and steep terrain become 2-D segments with a height range */
   if(e.cat===4)continue;const ax=V[i0],ay=V[i0+1],az=V[i0+2],bx=V[i1],by=V[i1+1],bz=V[i1+2],cx=V[i2],cy=V[i2+1],cz=V[i2+2];
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;if(Math.abs(ny)/nl>.3)continue;
   const y0=Math.min(ay,by,cy),y1=Math.max(ay,by,cy);if(y1-y0<(e.cat===0||e.cat===5?1.4:.7))continue;
   const d1=(ax-bx)*(ax-bx)+(az-bz)*(az-bz),d2=(bx-cx)*(bx-cx)+(bz-cz)*(bz-cz),d3=(cx-ax)*(cx-ax)+(cz-az)*(cz-az);let p,q;if(d1>=d2&&d1>=d3){p=[ax,az];q=[bx,bz]}else if(d2>=d3){p=[bx,bz];q=[cx,cz]}else{p=[cx,cz];q=[ax,az]}
   if(Math.max(d1,d2,d3)<.16)continue;segs.push(p[0],p[1],q[0],q[1],y0,y1)}}
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,M.props);m.userData.fogCull=true;m.receiveShadow=!lod;m.castShadow=false;m.userData.kind='city';group.add(m)}
 /* fill ground patch (8 m), skipped where it is all sea */
 {const n=TILE/GC+1,p=new Float32Array(n*n*3),c=new Float32Array(n*n*3),idx=[];let hmax=-1e9;const gi0=tx/GC,gj0=tz/GC;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const gi=Math.min(gi0+i,GN-1),gj=Math.min(gj0+j,GN-1),h=W.HR[gj*GN+gi],v=(j*n+i)*3,x=tx+i*GC,z=tz+j*GC;if(h>hmax)hmax=h;
   const sl=Math.hypot(W.HR[gj*GN+Math.min(gi+1,GN-1)]-W.HR[gj*GN+Math.max(gi-1,0)],W.HR[Math.min(gj+1,GN-1)*GN+gi]-W.HR[Math.max(gj-1,0)*GN+gi])/(2*GC),cl=groundCol(h,sl,x,z);p[v]=x;p[v+1]=h;p[v+2]=z;c[v]=cl[0];c[v+1]=cl[1];c[v+2]=cl[2]}
  if(hmax>-6){for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+1,cc_=a+n,d=cc_+1;if((i+j)&1)idx.push(a,cc_,b,b,cc_,d);else idx.push(a,cc_,d,a,d,b)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
   const m=new THREE.Mesh(g,M.terrain);m.userData.fogCull=true;m.receiveShadow=true;group.add(m)}}
 /* trees: the game's own low-poly models at the original tree spots */
 const tl=RK.trees.get(k),pts=[];if(tl&&P.FM){const G={pos:[],col:[],sw:[]},fm=P.FM,hs=(i)=>{const q=Math.sin(i*12.9898)*43758.5453;return q-Math.floor(q)};
  for(const t of tl){const r=hs(t[5]),names=TREES[t[4]]||TREES[1],n=names[(r*names.length)|0],sz=fm.size(n)[1]||1,h=Math.min(t[3],t[4]===2?3:t[4]===0?22:16);if(lod&&r<.35)continue;
   fm.put(G,lod?n+'~lo':n,t[0],t[1]-.2,t[2],h/sz,r*37.7,{tint:[.9+r*.15,.98,.88+r*.1],sway:1});if(t[4]!==2)pts.push(t[0],t[2],t[1],.5)}
  if(G.pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));if(G.sw.length===G.pos.length/3)g.setAttribute('aSway',new THREE.Float32BufferAttribute(G.sw,1));g.computeVertexNormals();g.computeBoundingSphere();
   const m=new THREE.Mesh(g,M.props);m.userData.fogCull=true;m.castShadow=!lod;m.receiveShadow=!lod;m.userData.kind='trees';group.add(m)}}
 group.userData.wsegs=new Float32Array(segs);group.userData.tpts=new Float32Array(pts);group.userData.tris=nT;return group}
/* distant mountains (panorama meshes): always shown */
function panorama(){const pos=[],col=[];for(const[k,l]of RK.tiles)for(const e of l){if(e.cat!==4)continue;const a=meshArrays(e),V=a.V,I=a.idx;for(let f=0;f<e.nf;f++){const c=RK.pal[a.fc[f]];for(let q=0;q<3;q++){const i=I[f*3+q]*3;pos.push(V[i],V[i+1],V[i+2]);col.push(c[0],c[1],c[2])}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,F.mats().props);m.frustumCulled=false;return m}
/* ---------- streaming: tiles within ~1.4 km, the nearest in full detail; collision set refreshed around the car ---------- */
function World(scene,T,opt){const R=6,o={scene,T,loaded:new Map(),stats:{built:0,ms:0},cars:null,colT:0};
 if(!W.pano){W.pano=panorama()}scene.add(W.pano);
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
  T._bg=null};
 o.fill=(px,pz,rad)=>{const cx=Math.floor(px/TILE),cz=Math.floor(pz/TILE);for(let dz=-rad;dz<=rad;dz++)for(let dx=-rad;dx<=rad;dx++)if(dx*dx+dz*dz<=rad*rad+1)o.add(cx+dx,cz+dz,dx*dx+dz*dz>5?1:0);o.rebuildCol()};
 o.dispose=()=>{for(const k of [...o.loaded.keys()])o.drop(k);scene.remove(W.pano)};return o}
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
})();
