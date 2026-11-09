/* ===== Poly GT layer: sky and distance for the Quick Play maps. Nov 8, Hakan: "spice up the atmosphere, map design and more cool backgrounds. Maybe more elevation".
   - more elevation: the road and the land around it rise and fall about 20 to 40% more on every Quick Play map except the two city maps
   - a ring of far mountains, mesas, cliffs or snow peaks beyond the fog (real 3D shapes, so they shift against the sky as you drive), tinted toward the
     fog colour at the bottom so they melt into the horizon; one draw call
   - drifting clouds: soft billboards high in the sky, a different set per map (white cumulus, thin streaks, banks of overcast, warm sunset clouds); they
     move slowly around the map, a dozen transparent quads
   PTO.sky===false turns the far shapes and clouds off. ===== */
(function sky(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined'||typeof D==='undefined')return;
/* ---- elevation (before any track is built) ---- */
const EL={0:1.4,1:1.3,2:1.2,4:1.2,5:1.12,6:1.0,7:1.3,9:1.2};
for(const d of D){const k=EL[d.id];if(!k||d._elev||!d.pts)continue;d._elev=1;for(const p of d.pts)p[2]=+(p[2]*k).toFixed(1);d.amp=(d.amp||0)*1.25;d.up=(d.up||0)*1.15}
/* ---- per map look: far-shape kind, colour, size range, cloud count / opacity / tint ---- */
const LK={
 0:{kind:'hill',c:0x6e8a7a,cap:0,n:20,h:[90,220],cl:[14,.92,0xffffff]},
 1:{kind:'mesa',c:0xb4653c,cap:0,n:22,h:[90,210],cl:[6,.7,0xfff0dc]},
 2:{kind:'peak',c:0x76879a,cap:1,n:24,h:[220,520],cl:[16,.95,0xffffff]},
 4:{kind:'peak',c:0x4e6f66,cap:0,n:22,h:[120,300],cl:[12,.85,0xf4f8f4]},
 5:{kind:'mesa',c:0xc07044,cap:0,n:24,h:[100,260],cl:[5,.6,0xffe8cc]},
 6:{kind:'hill',c:0x7b8a72,cap:0,n:20,h:[100,260],cl:[18,.8,0xe4e8ea]},
 7:{kind:'hill',c:0x6f8794,cap:0,n:18,h:[40,110],cl:[12,.9,0xffd8b0]},
 9:{kind:'peak',c:0xcfdceb,cap:1,n:24,h:[200,480],cl:[16,.9,0xf4f8ff]},
 /* the four rally stages (stage files) */
 21:{kind:'hill',c:0x587a62,cap:0,n:22,h:[120,280],cl:[12,.8,0xffffff]},22:{kind:'peak',c:0x6f829f,cap:1,n:26,h:[190,430],cl:[14,.9,0xffffff]},
 23:{kind:'mesa',c:0xb88a5c,cap:0,n:22,h:[90,210],cl:[6,.6,0xffe8cc]},24:{kind:'hill',c:0x9aaabc,cap:1,n:20,h:[80,210],cl:[0,.8,0xe8eef5]}};
/* stage worlds reuse another map's id as their look, so the map is found by name */
const NM={'Quarry Circuit':0,'Canyon Viaduct':1,'Alpine Pass':2,'Pinewood Stage':4,'Redrock Stage':5,'Highmoor Stage':6,'Coastal Run':7,'Frostline Stage':9,'Finland':21,'France':22,'Portugal':23,'Sweden':24};
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const rng=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
let cloudTex=null;
function cloudTexture(){if(cloudTex)return cloudTex;const cv=document.createElement('canvas');cv.width=256;cv.height=128;const g=cv.getContext('2d');
 const r=rng(11);for(let i=0;i<9;i++){const x=40+r()*176,y=62+(r()-.5)*26,rad=26+r()*30,q=g.createRadialGradient(x,y,2,x,y,rad);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(.55,'rgba(255,255,255,.55)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,rad,0,7);g.fill()}
 /* flat-ish base: darker, cooler underside */
 const b=g.createLinearGradient(0,60,0,110);b.addColorStop(0,'rgba(120,135,160,0)');b.addColorStop(1,'rgba(120,135,160,.38)');g.globalCompositeOperation='source-atop';g.fillStyle=b;g.fillRect(0,60,256,60);
 cloudTex=new THREE.CanvasTexture(cv);cloudTex.encoding=THREE.sRGBEncoding;return cloudTex}
function shape(kind,r,h,rand){
 /* geometry 1 unit tall in y from 0, base radius r */
 let g;
 if(kind==='mesa'){g=new THREE.CylinderGeometry(r*(.55+.2*rand()),r,h,7,2,false);g.translate(0,h/2,0)}
 else if(kind==='cliff'){g=new THREE.CylinderGeometry(r*.5,r,h,6,2,false);g.translate(0,h/2,0)}
 else if(kind==='hill'){g=new THREE.CylinderGeometry(r*.3,r,h,10,2,false);g.translate(0,h/2,0)}
 else{g=new THREE.ConeGeometry(r,h,6+((rand()*3)|0),3,false);g.translate(0,h/2,0)}
 g=g.toNonIndexed();
 /* jitter so no two read the same */
 const p=g.attributes.position,cache=new Map();
 for(let i=0;i<p.count;i++){const k=p.getX(i).toFixed(2)+','+p.getY(i).toFixed(2)+','+p.getZ(i).toFixed(2);let j=cache.get(k);if(!j){j=[(rand()-.5)*r*.28,(rand()-.5)*h*.12,(rand()-.5)*r*.28];cache.set(k,j)}
  const edge=p.getY(i)>.01*h&&p.getY(i)<.98*h?1:0;p.setXYZ(i,p.getX(i)+j[0]*edge,Math.max(0,p.getY(i)+j[1]*edge),p.getZ(i)+j[2]*edge)}
 return g}
function build(sc,T){
 const d=T.d,L=LK[NM[d.name]];if(!L||sc.userData.skyFar||(window.PTO&&window.PTO.sky===false))return;sc.userData.skyFar=1;
 const rand=rng((NM[d.name]||0)*977+13),b=T.bounds||[-400,400,-400,400],cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2;
 let ys=0;for(let i=0;i<T.N;i++)ys+=T.y[i];ys/=T.N;let ymin=1e9;for(let i=0;i<T.N;i++)ymin=Math.min(ymin,T.y[i]);
 const base=Math.min(ymin-70,ys-90),fog=sc.fog&&sc.fog.color?sc.fog.color.clone():lin(d.fog||0xaaaaaa),col=lin(L.c),top=col.clone().lerp(new THREE.Color(1,1,1),.18),snow=lin(0xf6f9ff);
 const pos=[],cols=[];
 const NN=d.cartoon&&L.kind==='peak'?Math.round(L.n*1.5):L.n;/* the bought stages: slimmer, more numerous peaks (the stock cones read as giant pale slabs) */
 for(let i=0;i<NN;i++){const a=(i+rand()*.8)/NN*Math.PI*2,rd=820+rand()*260,h=L.h[0]+rand()*(L.h[1]-L.h[0]),r=h*(L.kind==='hill'?1.9:L.kind==='mesa'?.9:d.cartoon?.6:1.0)*(.8+rand()*.5);
  const g=shape(L.kind,r,h,rand),p=g.attributes.position,x0=cx+Math.cos(a)*rd,z0=cz+Math.sin(a)*rd,yaw=rand()*6.28,cy=Math.cos(yaw),sy=Math.sin(yaw),shade=.82+rand()*.3;
  for(let v=0;v<p.count;v++){const x=p.getX(v),y=p.getY(v),z=p.getZ(v),t=Math.min(1,y/h);
   pos.push(x0+x*cy+z*sy,base+y,z0-x*sy+z*cy);
   /* bottom melts into the fog colour; top lighter; caps white on snowy maps */
   const c=fog.clone().lerp(col.clone().multiplyScalar(shade),Math.min(1,.28+t*1.1)).lerp(top,Math.max(0,t-.6)*.8);
   if(L.cap&&t>.74)c.lerp(snow,Math.min(1,(t-.74)/.12));
   /* faces catching the light on one side: cheap fake lighting */
   const f=.9+.18*Math.sin(Math.atan2(x,z)+yaw*0+i);c.multiplyScalar(f);
   cols.push(c.r,c.g,c.b)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false}));m.frustumCulled=false;m.renderOrder=-1;m.userData.shd=1;m.castShadow=false;m.receiveShadow=false;m.userData.noChunk=1;m.userData.noMerge=1;sc.add(m);
 /* clouds */
 const [cn,co,ct]=L.cl,sun=d.sun?lin(d.sun):new THREE.Color(1,1,1),tint=lin(ct).lerp(sun,.35),tex=cloudTexture(),clouds=[];
 for(let i=0;i<cn;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:tint,transparent:true,opacity:co*(.7+rand()*.3),depthWrite:false,fog:false}));
  const w=300+rand()*340;s.scale.set(w,w*(.34+rand()*.14),1);s.userData={a:rand()*6.28,r:620+rand()*640,y:base+360+rand()*300,sp:(.0012+rand()*.0016)*(rand()<.5?1:-1)};s.renderOrder=-1;s.frustumCulled=false;s.userData.shd=1;s.castShadow=false;sc.add(s);clouds.push(s)}
 sc.userData.skyFx={cx,cz,clouds,ring:m,ymid:ys,ride:!!T.stage}}
P.skyBuild=build;
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{build(sc,T)}catch(e){console.warn('sky',e)}return sc};
/* drift */
const r0=R.render.bind(R);
R.render=function(scene,cam){const f=scene&&scene.userData&&scene.userData.skyFx;if(f){const t=performance.now();
  /* stages are kilometres long: the far shapes and clouds travel with the camera (a little slower, so they still slide against the sky) */
  let ox=0,oz=0;if(f.ride&&cam&&cam.position){ox=(cam.position.x-f.cx)*.94;oz=(cam.position.z-f.cz)*.94;f.ring.position.set(ox,(cam.position.y-f.ymid)*.9,oz)}
  for(const s of f.clouds){const u=s.userData,a=u.a+t*u.sp*.001;s.position.set(f.cx+ox+Math.cos(a)*u.r,u.y+(f.ride&&cam&&cam.position?cam.position.y-f.ymid:0),f.cz+oz+Math.sin(a)*u.r)}}return r0.apply(this,arguments)};
})();
