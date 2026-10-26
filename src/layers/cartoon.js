/* ===== Poly GT layer: cartoon (track files: the bought "Cartoon Race Track" models of Imola and Road Atlanta.
   A track file (.ptrack, gzipped JSON made by tools/cartoon_track) replaces that circuit's road, ground, walls and scenery.
   Files can be built in (window.PT8_PACKS) or loaded from the track list with "+ Add track file"; loaded ones are kept in IndexedDB.) ===== */
(function v9cartoon(){
'use strict';
const P=window.PT8;
if(!P)return;
const dec=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
/* ground height (2 cm steps) and surface class (0 grass, 1 asphalt, 2 paved run-off, 3 gravel) on the model's own grid */
function grid(pack){if(pack._g)return pack._g;const G=pack.grid,HG=new Int16Array(dec(G.h).buffer),KG=new Uint8Array(G.nx*G.nz);
 {const r=dec(G.k);let o=0;for(let i=0;i<r.length;i+=2){KG.fill(r[i],o,o+r[i+1]);o+=r[i+1]}}
 const hAt=(x,z)=>{const fx=(x-G.x0)/G.cell,fz=(z-G.z0)/G.cell;if(!(fx>=0&&fz>=0&&fx<G.nx-1&&fz<G.nz-1))return null;
  const ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,i=iz*G.nx+ix;return((HG[i]*(1-tx)+HG[i+1]*tx)*(1-tz)+(HG[i+G.nx]*(1-tx)+HG[i+G.nx+1]*tx)*tz)*.02};
 const kAt=(x,z)=>{const ix=Math.round((x-G.x0)/G.cell),iz=Math.round((z-G.z0)/G.cell);return ix<0||iz<0||ix>=G.nx||iz>=G.nz?0:KG[iz*G.nx+ix]};
 return pack._g={hAt,kAt}}
const baseOf=pack=>D.findIndex(d=>pack.replaces==='imola'?d.imola:pack.replaces==='ra'?d.ra:false);
P.trackPacks={};
P.addTrackPack=pack=>{const i=baseOf(pack);if(i<0)throw new Error('This track file is for a track this game does not have ('+pack.replaces+')');const d=D[i];
 if(!d._orig)d._orig={pts:d.pts,bank:d.bank,medal:P.MEDAL_REF[i]};
 d.pts=pack.pts;d.bank=0;d.cartoon=pack;if(pack.medal)P.MEDAL_REF[i]=pack.medal;P.trackPacks[pack.id]=pack;
 if(P.ui&&P.ui.trClear)P.ui.trClear(i);return i};
/* physics: road and ground heights come from the model's surfaces, so the car sits exactly on what is drawn */
const ss=sampleTrack;sampleTrack=d=>{const T=ss(d);if(!d.cartoon)return T;const {hAt,kAt}=grid(d.cartoon);
 for(let i=0;i<T.N;i++){T.bank[i]=0;const h=hAt(T.x[i],T.z[i]);if(h!=null)T.y[i]=h}
 for(const c of T.cpts||[]){const h=hAt(c[0],c[1]);if(h!=null)c[2]=h}
 /* no tunnels from the old hand-built track; the hood camera only comes in where the model has a bridge or other structure over the road
    (pack.over: stretches in metres along the lap), from 16 m before it to 4 m after */
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 if(T.tn)T.tn.fill(0);T.ov=new Uint8Array(T.N);{let L=0;const Ls=new Float32Array(T.N);for(let i=1;i<T.N;i++){L+=Math.hypot(T.x[i]-T.x[i-1],T.z[i]-T.z[i-1]);Ls[i]=L}
  for(const[a,b]of d.cartoon.over||[])for(let i=0;i<T.N;i++)if(Ls[i]>=a-16&&Ls[i]<=b+4)T.ov[i]=1}
 const t0=T.terr;T.terr=(x,z)=>{const h=hAt(x,z);return h==null?t0(x,z):h};
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y),h=hAt(x,z);if(h==null)return r;r.h=h;
  if(!r.road){const k=kAt(x,z);if(k===1||k===2)r.near=1;else if(k===3)r.trap=1}return r};
 return T};
/* scenery: tiles of the model, built once per track file */
function meshes(pack){if(pack._m)return pack._m;const tx={},mats={},lut=new Float32Array(256),alpha=new Set(pack.alpha||[]);for(let i=0;i<256;i++){const c=i/255;lut[i]=c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
 const tex=k=>tx[k]||(tx[k]=(()=>{const im=new Image(),t=new THREE.Texture(im);im.onload=()=>{t.needsUpdate=true};im.src=pack.tex[k];t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t})());
 const mat=k=>mats[k]||(mats[k]=k==='c'?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):k[0]==='#'?new THREE.MeshLambertMaterial({color:new THREE.Color(k).convertSRGBToLinear(),side:THREE.DoubleSide}):
  new THREE.MeshLambertMaterial({map:tex(k),side:THREE.DoubleSide,alphaTest:alpha.has(k)?.5:0}));
 const out=[];
 for(const m of pack.meshes){const q=m.q,o=m.o,p16=new Int16Array(dec(m.p).buffer),u8=dec(m.i),idx=m.i32?new Uint32Array(u8.buffer):new Uint16Array(u8.buffer),g=new THREE.BufferGeometry();
  const pos=new Float32Array(p16.length);for(let i=0;i<p16.length;i++)pos[i]=p16[i]*q+o[i%3];
  if(m.c){/* one colour per face: unshare the corners */const fc=dec(m.c),n=idx.length,P2=new Float32Array(n*3),C2=new Float32Array(n*3);
   for(let i=0;i<n;i++){const v=idx[i]*3,f=(i/3|0)*3;P2[i*3]=pos[v];P2[i*3+1]=pos[v+1];P2[i*3+2]=pos[v+2];C2[i*3]=lut[fc[f]];C2[i*3+1]=lut[fc[f+1]];C2[i*3+2]=lut[fc[f+2]]}
   g.setAttribute('position',new THREE.BufferAttribute(P2,3));g.setAttribute('color',new THREE.BufferAttribute(C2,3))}
  else{g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(new THREE.BufferAttribute(idx,1));
   if(m.u){const u16=new Int16Array(dec(m.u).buffer),uv=new Float32Array(u16.length);for(let i=0;i<u16.length;i++)uv[i]=u16[i]/256;g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}}
  g.computeVertexNormals();g.computeBoundingSphere();const me=new THREE.Mesh(g,mat(m.m));me.matrixAutoUpdate=false;me.updateMatrix();me.name='ct_'+m.m;
  me.userData.noMerge=1;/* the static-mesh merger drops per-face colours and swallowed whole tiles */out.push(me)}
 return pack._m=out}
/* wrap buildWorld last (after every other layer has loaded) so whatever they add to the world is removed too */
setTimeout(()=>{const bw=buildWorld;buildWorld=T=>{const sc=bw(T),pack=T.d&&T.d.cartoon;if(!pack)return sc;
 try{const rm=[];sc.traverse(o=>{if(o===sc||!(o.isMesh||o.isInstancedMesh||o.isPoints||o.isLine||o.isSprite))return;const g=o.geometry;if(g&&!g.boundingSphere&&g.computeBoundingSphere)g.computeBoundingSphere();
   if(g&&g.boundingSphere&&g.boundingSphere.radius>1000&&o.material&&o.material.type==='MeshBasicMaterial')return;/* sky dome / horizon backdrop */rm.push(o)});
  rm.forEach(o=>{if(o.parent)o.parent.remove(o)});/* removed, not hidden: distance culling turns visibility back on */
  const grp=new THREE.Group();grp.name='cartoonTrack';for(const m of meshes(pack))grp.add(m);sc.add(grp);
  T._bx={segs:[],pts:[]};T._bg=null;/* the removed stock props must not collide */
  if(P.addSeg){const s=new Float32Array(dec(pack.segs).buffer);for(let i=0;i<s.length;i+=4)P.addSeg(T,s[i],s[i+1],s[i+2],s[i+3],.35)}
 }catch(e){console.error('cartoon track',e)}
 return sc};
/* the bought models are built at their real size, which dwarfs our cars: on these tracks the cars are drawn bigger (carScale), and the
   chase camera, wall contact and car-to-car contact grow with them. Physics speeds are unchanged. */
const K=()=>{const R=typeof RACE!=="undefined"?RACE:null,d=R&&R.T&&R.T.d;return d&&d.cartoon&&d.cartoon.carScale||1};
const uv=updateVisual;updateVisual=function(c,T,t){const m=c&&c.m,k=K();if(m&&m.g)m.g.scale.setScalar(1);const r=uv.apply(this,arguments);
 if(m&&m.g&&k!==1&&m.g.visible!==false){m.g.scale.setScalar(k);m.g.position.y+=(k-1)*.95;if(m.sh){m.sh.scale.x*=k;m.sh.scale.y*=k}}return r};
/* chase camera: pulled back less than the car grew (the car fills more of the screen and the camera sits nearer the road, so the ground
   streams past faster), plus a wider view and a light buzz at speed: the big tracks otherwise feel slow with big cars */
const so=soloCam;soloCam=function(c,dt,out){so.apply(this,arguments);const k=K();if(k===1||c.fin)return;const f=1+(k-1)*.55,y=c.camY==null?c.y:c.camY;
 out.p.set(c.x+(out.p.x-c.x)*f,y+(out.p.y-y)*f,c.z+(out.p.z-c.z)*f);out.l.set(c.x+(out.l.x-c.x)*f,y+(out.l.y-y)*f,c.z+(out.l.z-c.z)*f);
 const v=Math.max(0,Math.min(1,((c.sp||0)-15)/45)),hood=(c.tnB||0)>.5||c.camMode;out.f+=v*(hood?6:12);
 if(!hood&&v>0&&!(c.exp>0)){const t=performance.now()/1000,a=v*v*.06;out.p.x+=Math.sin(t*37.1)*a;out.p.y+=Math.sin(t*29.3+1)*a;out.p.z+=Math.sin(t*33.7+2)*a}
 speedFx(c,v)};
/* speed streaks at the screen edges, faint from about 55 km/h, strongest from 215 km/h up (model tracks only) */
let sfx=null,sfxV=0;const speedFx=(c,v)=>{if(!c.human)return;if(!sfx){sfx=document.createElement('div');sfx.id='ptSpeedFx';
  sfx.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;mix-blend-mode:screen;background:repeating-conic-gradient(from 0deg at 50% 46%,rgba(255,255,255,.0) 0deg,rgba(255,255,255,.0) 2.2deg,rgba(255,255,255,.55) 2.5deg,rgba(255,255,255,0) 2.8deg,rgba(255,255,255,0) 5.3deg);-webkit-mask:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 55%,#000 100%);mask:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 55%,#000 100%)';
  document.body.appendChild(sfx)}
 sfxV+=(v-sfxV)*.15;sfx.style.opacity=(sfxV*sfxV*.35).toFixed(3);sfx.style.transform='rotate('+(Math.random()*2.5).toFixed(2)+'deg) scale(1.05)'};
{const hide=()=>{if(sfx)sfx.style.opacity=0;sfxV=0};const cr=P.cleanupRace;if(cr)P.cleanupRace=function(){hide();return cr.apply(this,arguments)};setInterval(()=>{if(sfx&&(typeof scr==='undefined'||scr!=='game'||K()===1))hide()},400)}
/* hood camera: on these tracks only under something overhead (T.ov from the model) */
{const sc0=stepCar;stepCar=function(c,dt){const r=sc0.apply(this,arguments);const R=typeof RACE!=='undefined'?RACE:null,T=R&&R.T;if(T&&T.ov)c.inTn=!!(T.ov[((c.idx|0)%T.N+T.N)%T.N]&&c.onRoad);return r}}
/* grid: each car stands in one of the boxes painted on the model's start straight (front row first) */
P.gridHook=(T,c,slot)=>{const pk=T.d&&T.d.cartoon,s=pk&&pk.slots&&pk.slots[slot];if(!s)return false;const N=T.N;let bi=0,bd=1e18;
 for(let i=0;i<N;i++){const d=(T.x[i]-s[0])**2+(T.z[i]-s[1])**2;if(d<bd){bd=d;bi=i}}
 c.x=s[0];c.z=s[1];c.y=T.surf(s[0],s[1],T.y[bi]+2).h+1.1;c.yaw=T.psi[bi];c.idx=bi;c.unw=bi>N/2?bi-N:bi;c.cy=c.yaw;c.camY=c.y;return true};
const cc=carCollide;carCollide=function(a,b){const k=K();if(k===1||a.out||b.out)return cc.apply(this,arguments);
 const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),D=3.2*k;if(!(d<D&&d>.01&&Math.abs(a.y-b.y)<1.6*k))return;
 const nx=dx/d,nz=dz/d,ov=(D-d)/2;a.x-=nx*ov;a.z-=nz*ov;b.x+=nx*ov;b.z+=nz*ov;const rv=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;
 if(rv<0){const j=-rv*.75;a.vx-=nx*j;a.vz-=nz*j;b.vx+=nx*j;b.vz+=nz*j;if(rv<-3){fx((a.x+b.x)/2,a.y+.5,(a.z+b.z)/2,0xffe080,6,5,.3,.15,8);noise(.12,.2,1200);RACE.shake=Math.max(RACE.shake,Math.min(1,-rv/15))}}};
P.carK=K},0);
/* ---- track files: built in, loaded from disk, remembered ---- */
const gunzip=async buf=>{const u=new Uint8Array(buf);if(u[0]!==0x1f||u[1]!==0x8b)return new TextDecoder().decode(u);
 const ds=new DecompressionStream('gzip');return await new Response(new Blob([u]).stream().pipeThrough(ds)).text()};
const idb=()=>new Promise((ok,no)=>{try{const r=indexedDB.open('polygt_tracks',1);r.onupgradeneeded=()=>r.result.createObjectStore('packs');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}});
const idbDo=(mode,fn)=>idb().then(db=>new Promise((ok,no)=>{const tx=db.transaction('packs',mode),st=tx.objectStore('packs');const r=fn(st);tx.oncomplete=()=>ok(r&&r.result);tx.onerror=()=>no(tx.error)}));
P.loadTrackFile=async file=>{const buf=await file.arrayBuffer();const pack=JSON.parse(await gunzip(buf));if(!pack||!pack.pts||!pack.meshes||!pack.replaces)throw new Error('Not a Poly GT track file');
 const i=P.addTrackPack(pack);try{await idbDo('readwrite',st=>st.put(buf,pack.id))}catch(e){console.warn('track file not saved',e)}return{pack,i}};
P.removeTrackPack=async id=>{const p=P.trackPacks[id];if(!p)return;const i=baseOf(p),d=D[i];if(d&&d._orig){d.pts=d._orig.pts;d.bank=d._orig.bank;P.MEDAL_REF[i]=d._orig.medal;delete d.cartoon;if(P.ui&&P.ui.trClear)P.ui.trClear(i)}
 delete P.trackPacks[id];try{await idbDo('readwrite',st=>st.delete(id))}catch(e){}};
for(const p of window.PT8_PACKS||[]){try{P.addTrackPack(p)}catch(e){console.error('built-in track file',e)}}
P.trackPacksReady=(async()=>{try{const keys=await idbDo('readonly',st=>st.getAllKeys());for(const k of keys||[]){const buf=await idbDo('readonly',st=>st.get(k));try{P.addTrackPack(JSON.parse(await gunzip(buf)))}catch(e){console.warn('saved track file',k,e)}}
 if(keys&&keys.length&&P.ui&&P.ui.refreshTracks)P.ui.refreshTracks()}catch(e){console.warn('saved track files unavailable',e)}})();
})();
