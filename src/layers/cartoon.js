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
/* the files' gold times were measured with cars 30% quicker and no grip limit; now (25% quicker, 1.6 g grip) a CPU time-trial lap takes
   this much longer: 95.5 -> 107.6 s at Road Atlanta, 98.4 -> 114.7 s at Imola */
const MEDK={ra:.766,imola:.776},ALAT=23;/* tyre grip (16, then +20% and +20% more turning by request) limit on these tracks, m/s² (see the steering cap below) */
/* newest file wins (pack.rev = build time): an older copy saved in this browser never replaces a newer built-in one */
P.addTrackPack=pack=>{const i=baseOf(pack);if(i<0)throw new Error('This track file is for a track this game does not have ('+pack.replaces+')');const d=D[i];
 /* the small download has no track built in, so it also knows the newest file's build time: an old copy saved in the browser (Road Atlanta's first
    file drove through the coned loops and had no grid boxes) is turned away and deleted instead of quietly coming back */
 {const nr=(window.PT8_PACKREV||{})[pack.replaces]||0;if((pack.rev||0)<nr){const e=new Error('This '+pack.name+' file is an older version: add the new '+(pack.replaces==='ra'?'road-atlanta':pack.replaces)+'.ptrack');e.older=true;throw e}}
 if(d.cartoon&&(d.cartoon.rev||0)>(pack.rev||0)){const e=new Error('This is an older version of '+pack.name+' than the one already in the game');e.older=true;throw e}
 if(!d._orig)d._orig={pts:d.pts,bank:d.bank,medal:P.MEDAL_REF[i]};
 d.pts=pack.pts;d.bank=0;d.cartoon=pack;if(pack.medal)P.MEDAL_REF[i]=pack.medal*(MEDK[pack.replaces]||1);P.trackPacks[pack.id]=pack;
 if(P.ui&&P.ui.trClear)P.ui.trClear(i);return i};
/* physics: road and ground heights come from the model's surfaces, so the car sits exactly on what is drawn */
const ss=sampleTrack;sampleTrack=d=>{const T=ss(d);if(!d.cartoon)return T;const {hAt,kAt}=grid(d.cartoon);
 for(let i=0;i<T.N;i++){T.bank[i]=0;const h=hAt(T.x[i],T.z[i]);if(h!=null)T.y[i]=h}
 for(const c of T.cpts||[]){const h=hAt(c[0],c[1]);if(h!=null)c[2]=h}
 /* no tunnels from the old hand-built track; the hood camera only comes in where the model has a bridge or other structure over the road
    (pack.over: stretches in metres along the lap), from 16 m before it to 4 m after */
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 /* the CPU racing line keeps a bigger margin from the edges: the cars are drawn bigger here */
 T.rlm=((d.cartoon.carScale||1)-1)*1.2+1;
 T.alat=ALAT;T.cbrk=24;/* and brakes for them later: the cars can brake far harder than the old plan assumed *//* the CPU plans its corner speeds a little under the grip limit */
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
/* the camera reads a smoothed speed: c.sp twitches by up to 0.8 m/s per frame on the hills and the camera's height, distance and view
   width all follow speed, which made the picture jitter while the car itself moved smoothly */
const so=soloCam;soloCam=function(c,dt,out){const sp0=c.sp||0;c._csp=c._csp==null?sp0:c._csp+(sp0-c._csp)*Math.min(1,(dt||.016)*3);c.sp=c._csp;try{so.apply(this,arguments)}finally{c.sp=sp0}const k=K();if(k===1||c.fin)return;const f=1+(k-1)*.5,y=c.camY==null?c.y:c.camY;
 out.p.set(c.x+(out.p.x-c.x)*f,y+(out.p.y-y)*f,c.z+(out.p.z-c.z)*f);out.l.set(c.x+(out.l.x-c.x)*f,y+(out.l.y-y)*f,c.z+(out.l.z-c.z)*f);
 const v=Math.max(0,Math.min(1,((c._csp||0)-20)/50)),hood=(c.tnB||0)>.5||c.camMode;out.f+=v*(hood?3:6);
 /* hood view on these tracks: the stock one sat 1 m up inside a car drawn 1.8x and tilted the view with the raw body pitch, so crests and dips
    made it lurch and clip the bonnet. Here it rides at the big car's eye height and the tilt follows a smoothed pitch */
 const hb=c.tnB||0;if(hb>.002&&!c.camMode){const kk=hb*hb*(3-2*hb),fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),a=1-Math.exp(-(dt||.016)*6);c._hp=c._hp==null?c.pitch:c._hp+(c.pitch-c._hp)*a;
  const ey=c.y+.95*k+.35,ex=c.x+fx*.9*k,ez=c.z+fz*.9*k,ly=ey-Math.tan(c._hp)*40-.6;out.p.set(out.p.x+(ex-out.p.x)*kk,out.p.y+(ey-out.p.y)*kk,out.p.z+(ez-out.p.z)*kk);out.l.set(out.l.x+(ex+fx*40-out.l.x)*kk,out.l.y+(ly-out.l.y)*kk,out.l.z+(ez+fz*40-out.l.z)*kk)}else c._hp=c.pitch};/* speed streaks removed by request */
/* speed streaks at the screen edges, faint from about 55 km/h, strongest from 215 km/h up (model tracks only) */
let sfx=null,sfxV=0;const speedFx=(c,v)=>{if(!c.human)return;if(!sfx){sfx=document.createElement('div');sfx.id='ptSpeedFx';
  sfx.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;mix-blend-mode:screen;background:repeating-conic-gradient(from 0deg at 50% 46%,rgba(255,255,255,.0) 0deg,rgba(255,255,255,.0) 2.2deg,rgba(255,255,255,.55) 2.5deg,rgba(255,255,255,0) 2.8deg,rgba(255,255,255,0) 5.3deg);-webkit-mask:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 55%,#000 100%);mask:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 55%,#000 100%)';
  document.body.appendChild(sfx)}
 sfxV+=(v-sfxV)*.15;sfx.style.opacity=(Math.min(1,sfxV)**2*.09).toFixed(3)};
{const hide=()=>{if(sfx)sfx.style.opacity=0;sfxV=0};const cr=P.cleanupRace;if(cr)P.cleanupRace=function(){hide();return cr.apply(this,arguments)};setInterval(()=>{if(sfx&&(typeof scr==='undefined'||scr!=='game'||K()===1))hide()},400)}
/* these circuits are full size and the cars drawn big, so at true speeds they crawl past the scenery: cars here are 25% quicker in every
   respect (top speed, acceleration, braking and grip together, so the handling balance stays the same) */
const SPD=1.25,TOPK=1.5,ACCK=.52,TS=1.4;{const m0=P.mul;P.mul=c=>{const m=m0?m0(c):{acc:1,top:1,grip:1,brk:1};if(K()>1){m.top*=TOPK;{const r=Math.min(.99,(c.sp||0)/Math.max(1,((c.cs&&c.cs.top)||40)*m.top));m.acc*=ACCK*Math.min(4,(1-.5*r)/Math.max(.08,1-r))}/* the base pull fades in a straight line to zero at top speed (100-200 mph crawled); this keeps it strong to about 85% of top *//* top speed 50% up and full pickup: these long tracks felt slow (x1.1 pickup gave 0-60 mph in 2.5 s, x.6 felt sluggish) */m.brk*=SPD;m.grip*=SPD;/* the tyre bite grip.js gives human drivers, for the CPU too here (it was a big part of why they were so slow) */if(!(c.human&&!c.forceAI)&&c.onRoad&&!c.cool)m.grip*=(window.PT8_GRIPK||1.4)}return m}}
/* cornering grip. The arcade model turns as tight as the steering asks at any speed (well over 3 g at 100 mph), so a 40 mph corner went
   at 100. On these tracks the tyres hold about ALAT (1.6 g, scaled by the car's grip and the surface):
   every car (yours and the CPU's): the nose still turns in as sharply as you steer (up to 1.7x what the tyres hold), but the direction you travel can only
     bend at the grip limit, so pushing too hard makes the car slide with the nose in (a drift you can catch), never a dead push wide.
     A first version capped the steering itself: with keyboard steering that felt like heavy understeer everywhere. */
/* grip grows with speed like downforce: 1.6 g in slow corners, about 2.6 g at 160 km/h, 3.5 g from 200 km/h, so slow corners stay real
   and fast sweepers can be taken flat out instead of the car pushing wide at speed */
const gripAt=(c,mt)=>{const v=c.sp||0;return ALAT*Math.min(2.2,1+.6*(v/35)*(v/35))*((c.cs&&c.cs.grip)||1)*(mt.grip||1)};
{const ip0=P.inPost;P.inPost=(c,dt)=>{if(ip0)ip0(c,dt);if(K()===1||!c.in||c.exp>0)return;const vf=c.vx*Math.sin(c.yaw)+c.vz*Math.cos(c.yaw);if(vf<6)return;
 const mt=c.mt||{grip:1},a=gripAt(c,mt),sr=2.5-Math.min(c.sp,40)*.03,mx=a/(vf*sr)*1.7;
 /* calmer steering at low speed (first gear felt twitchy): full lock gives 60% of the old turn rate at walking pace, all of it from 90 km/h */
 if(c.human&&!c.forceAI)c.in.st=(c.in.st||0)*1.2*(.6+.4*Math.min(1,Math.max(0,(vf-6)/19)))/* x1.2: turn 20% tighter in every gear */;const st=c.in.st||0;
 if(Math.abs(st)>mx)c.in.st=Math.sign(st)*mx}}
{const sg0=stepCar;stepCar=function(c,dt){const vx0=c.vx,vz0=c.vz,r=sg0.apply(this,arguments);
 if(K()===1||c.exp>0||!(dt>0))return r;const s0=Math.hypot(vx0,vz0),s1=Math.hypot(c.vx,c.vz);if(s0<6||s1<6||!c.m||!c.m.wheels.some(w=>w.g))return r;
 const mt=c.mt||{grip:1},a=gripAt(c,mt),h0=Math.atan2(vx0,vz0),h1=Math.atan2(c.vx,c.vz),d=wr(h1-h0),mx=a*dt/s1;
 if(Math.abs(d)>mx){const h=h0+Math.sign(d)*mx;c.vx=Math.sin(h)*s1;c.vz=Math.cos(h)*s1}
 /* past about 35 degrees of slide the nose is eased back toward the travel direction, so a slide never turns into a spin */
 const hv=Math.atan2(c.vx,c.vz),sl=wr(c.yaw-hv);if(Math.abs(sl)>.6){c.yaw-=Math.sign(sl)*(Math.abs(sl)-.6)*Math.min(1,dt*6);c.yr*=.9}
 return r}}
/* hood camera: on these tracks only under something overhead (T.ov from the model) */
/* it starts early (looking about 1.7 s ahead at the current speed) and blends in and out slowly, so the switch is finished by the time the
   bridge passes overhead instead of snapping at it */
/* sense of speed: the models are built 2.4x real size and the cars drawn 1.8x to match, so the road streamed past at little more than half
   the speed the dial showed. Cars on these tracks run their physics TS times faster than the clock: the dial still reads physics speed,
   but the car covers TS times the ground per real second (lap times and medals are real seconds) */
{const ts0=stepCar;stepCar=function(c,dt){const k=K()>1;DRAG=k?.0007*.4:.0007;/* less air drag there too: it ate the pull from 100 mph up */if(!k)return ts0.call(this,c,dt);
 /* fixed small physics steps: with big frame times (slow PCs, uneven frames) the car bounced where the slope changes on the hills */
 const d=dt*TS,n=Math.max(1,Math.ceil(d/(1/200)));let r;for(let i=0;i<n;i++)r=ts0.call(this,c,d/n);return r}}
{const sc0=stepCar;stepCar=function(c,dt){const r=sc0.apply(this,arguments);const R=typeof RACE!=='undefined'?RACE:null,T=R&&R.T;if(T&&T.ov){const N=T.N,i0=((c.idx|0)%N+N)%N,ah=Math.ceil(Math.max(20,(c.sp||0)*1.7)/T.sp);
  let on=false;for(let j=-1;j<=ah&&!on;j++)if(T.ov[(i0+j+N)%N])on=true;c.inTn=on&&!!c.onRoad;c.tnR=1.9}return r}}
/* grid: each car stands in one of the boxes painted on the model's start straight (front row first) */
P.gridHook=(T,c,slot)=>{const pk=T.d&&T.d.cartoon;let s=pk&&pk.slots&&pk.slots[slot];if(!s)return false;const N=T.N;let bi=0,bd=1e18;
 for(let i=0;i<N;i++){const d=(T.x[i]-s[0])**2+(T.z[i]-s[1])**2;if(d<bd){bd=d;bi=i}}
 /* the slot is the painted line across the front of the box: the car stands with its nose just behind it */
 const bk=2.45*K(),sx=s[0]-Math.sin(T.psi[bi])*bk,sz=s[1]-Math.cos(T.psi[bi])*bk;s=[sx,sz];
 bd=1e18;for(let i=0;i<N;i++){const d=(T.x[i]-s[0])**2+(T.z[i]-s[1])**2;if(d<bd){bd=d;bi=i}}
 c.x=s[0];c.z=s[1];c.lane0=(s[0]-T.x[bi])*Math.cos(T.psi[bi])-(s[1]-T.z[bi])*Math.sin(T.psi[bi]);c.y=T.surf(s[0],s[1],T.y[bi]+2).h+1.1;c.yaw=T.psi[bi];c.idx=bi;c.unw=bi>N/2?bi-N:bi;c.cy=c.yaw;c.camY=c.y;return true};
/* car-to-car contact (every track): boxes the size of the drawn car (grown with carScale here), not a circle, so cars side by side no
   longer touch at a car's width apart; a softer bounce so two cars don't ping-pong off each other, and one knock gives one set of sparks
   (a pair can't spark/shake again for 0.6 s while they are still rubbing) */
carCollide=function(a,b){if(a.out||b.out)return;const k=K(),dx=b.x-a.x,dz=b.z-a.z,HX=.95*k,HZ=2.1*k,R2=(HX+HZ)*(HX+HZ)*4;if(dx*dx+dz*dz>R2||Math.abs(a.y-b.y)>1.6*k)return;
 const sa=Math.sin(a.yaw),ca=Math.cos(a.yaw),sb=Math.sin(b.yaw),cb=Math.cos(b.yaw);let best=1e9,bx=0,bz=0;
 for(const[nx,nz]of[[ca,-sa],[sa,ca],[cb,-sb],[sb,cb]]){const ra=HX*Math.abs(nx*ca-nz*sa)+HZ*Math.abs(nx*sa+nz*ca),rb=HX*Math.abs(nx*cb-nz*sb)+HZ*Math.abs(nx*sb+nz*cb),pr=dx*nx+dz*nz,ov=ra+rb-Math.abs(pr);if(ov<=0)return;if(ov<best){best=ov;const sg=pr<0?-1:1;bx=nx*sg;bz=nz*sg}}
 const ov=best/2+.01;a.x-=bx*ov;a.z-=bz*ov;b.x+=bx*ov;b.z+=bz*ov;const rv=(b.vx-a.vx)*bx+(b.vz-a.vz)*bz;if(!(rv<0))return;
 const j=-rv*.6;a.vx-=bx*j;a.vz-=bz*j;b.vx+=bx*j;b.vz+=bz*j;
 const R=RACE,key=Math.min(a.k,b.k)+'-'+Math.max(a.k,b.k),hit=R._hit||(R._hit={});if(rv<-3&&!(hit[key]>R.t)){hit[key]=R.t+.6;const x=(a.x+b.x)/2,y=a.y+.5,z=(a.z+b.z)/2;
  fx(x,y,z,0xffe080,6,5,.3,.15,8);if(window.__hitFx)window.__hitFx(x,y,z,-rv,a,b);noise(.12,.2,1200);R.shake=Math.max(R.shake,Math.min(1,-rv/15))}};
/* a chase camera that ends up inside the car behind (close racing, formation laps) used to fill the screen with that car's paint: cars whose
   body the camera is inside are skipped for that view */
{const rd=R.render.bind(R);R.render=function(sc,cam){const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars||sc!==Rc.scene||!cam||!cam.isPerspectiveCamera)return rd(sc,cam);
  const k=K(),r2=(2.4*k)*(2.4*k),hid=[];for(const c of Rc.cars){const g=c.m&&c.m.g;if(!g||!g.visible)continue;const dx=cam.position.x-c.x,dy=cam.position.y-(c.y+.5*k),dz=cam.position.z-c.z;if(dx*dx+dy*dy+dz*dz<r2&&c.cam!==cam){g.visible=false;hid.push(g)}}
  try{return rd(sc,cam)}finally{for(const g of hid)g.visible=true}}}
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
P.trackPacksReady=(async()=>{try{const keys=await idbDo('readonly',st=>st.getAllKeys());for(const k of keys||[]){const buf=await idbDo('readonly',st=>st.get(k));try{P.addTrackPack(JSON.parse(await gunzip(buf)))}catch(e){if(e&&e.older){try{await idbDo('readwrite',st=>st.delete(k))}catch(_){}}else console.warn('saved track file',k,e)}}
 if(keys&&keys.length&&P.ui&&P.ui.refreshTracks)P.ui.refreshTracks()}catch(e){console.warn('saved track files unavailable',e)}})();
})();
