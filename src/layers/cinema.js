/* ===== Poly GT layer: cinematic menu. Still-frame "photo shoots" (dark studio, neon street, sunset road, foggy dawn, tunnel, concrete bunker) cut in between the moving drive-by ===== */
(function cinema(){
'use strict';
const P=window.PT8,V3=THREE.Vector3,base=menuScene;
const cl=(x,a,b)=>Math.max(a,Math.min(b,x)),sm=x=>{x=cl(x,0,1);return x*x*(3-2*x)};
/* shots: car name, set, camera start/end (x = right of the car, z = in front of its nose), lens, optional paint tint */
const SH=[
 {car:'LAMBORGHINI COUNTACH',env:'void',a:[[3.8,.62,5.6],[0,.55,0]],b:[[2.6,.66,6.4],[0,.55,.4]],fov:34},
 {car:'LAMBORGHINI COUNTACH',env:'void',a:[[-5.4,.9,-3.4],[0,.5,0]],b:[[-6.2,1,-1.6],[0,.5,.2]],fov:32},
 {car:'LAMBORGHINI COUNTACH',env:'sunset',a:[[6.8,.8,2.4],[0,.6,0]],b:[[6.4,.85,-1.2],[0,.6,0]],fov:30},
 {car:'FERRARI F40',env:'tunnel',a:[[2.6,.8,-7],[0,.6,0]],b:[[1.6,.9,-5.2],[0,.6,0]],fov:34},
 {car:'NISSAN SKYLINE GT-R R34',env:'neon',a:[[3.6,.7,5.2],[0,.6,0]],b:[[4.4,.8,4.4],[0,.6,.2]],fov:36},
 {car:'TOYOTA SUPRA A80 (JTCC)',env:'neon',a:[[-5.8,.8,3.2],[0,.6,0]],b:[[-6.4,.9,.8],[0,.6,0]],fov:32},
 {car:'PORSCHE 911 GT2 RS',env:'dawn',a:[[4.6,1.1,6.4],[0,.6,0]],b:[[5.4,1.3,5.4],[0,.6,0]],fov:34},
 {car:'MCLAREN F1 GTR',env:'bunker',a:[[3.2,.7,4.9],[0,.6,0]],b:[[2.2,.7,5.4],[0,.6,.3]],fov:36},
 {car:'LAMBORGHINI DIABLO',env:'sunset',a:[[-6.2,.9,-2.8],[0,.6,0]],b:[[-6.6,.9,-.4],[0,.6,0]],fov:30},
 {car:'BUGATTI VEYRON',env:'void',a:[[3.9,.9,-5.6],[0,.6,0]],b:[[4.6,1,-4.4],[0,.6,0]],fov:34},
 {car:'PORSCHE 918 SPYDER',env:'dawn',a:[[-4.6,.8,5.6],[0,.6,0]],b:[[-3.8,.8,6.4],[0,.6,.2]],fov:35},
 {car:'CHEVROLET CORVETTE C3',env:'sunset',a:[[4.2,.7,5.2],[0,.55,0]],b:[[5,.7,4],[0,.55,0]],fov:34},
 {car:'LAMBORGHINI HURACAN',env:'neon',a:[[3.2,.55,5.2],[.9,.45,2]],b:[[3.9,.62,5.6],[.9,.45,2]],fov:34},
 {car:'LAMBORGHINI COUNTACH',env:'bunker',a:[[1.5,.7,4.6],[.6,.55,2.6]],b:[[1.2,.72,4.2],[.5,.55,2.4]],fov:30},
 {car:'DODGE CHARGER R/T',env:'tunnel',a:[[-3.2,.9,6.4],[0,.7,0]],b:[[-2.4,1,5.6],[0,.7,0]],fov:34},
 {car:'FERRARI F40',env:'void',a:[[0,.5,6.8],[0,.6,0]],b:[[0,.7,5.2],[0,.6,0]],fov:36}];
const blob=(()=>{let t=null;return()=>{if(t)return t;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(.55,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return t=new THREE.CanvasTexture(c)}})();
const bm=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o||{})),em=c=>new THREE.MeshBasicMaterial({color:c}),box=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(g[0],g[1],g[2]),m);o.position.set(x,y,z);p.add(o);return o};
/* environments: [background, fog colour, fog near, fog far, hemi sky, hemi ground, hemi power, key colour, key power, key pos, rim colour, rim power, point lights, build()] */
const ENV={
 void:{bg:0x020304,fog:[0x020304,14,40],hs:0x8a98a6,hg:0x0a0c0f,hp:.55,kc:0xfff1de,kp:2.4,kp3:[5,9,6],rc:0x4f7dff,rp:2.2,rp3:[-8,3,-7],pts:[[0xff6a3a,1.6,[4,1.2,-5]]],
  build(g){const f=new THREE.Mesh(new THREE.CircleGeometry(40,48),bm(0x0b0d10,{roughness:.2,metalness:.5}));f.rotation.x=-Math.PI/2;g.add(f);for(let i=-3;i<=3;i++)box([.22,.06,10],em(0xdfe8ff),i*2.6,7,0,g);for(let i=0;i<6;i++)box([8,.06,.2],em(0x5c6ea8),0,6,-8+i*3.2,g)}},
 neon:{bg:0x07040f,fog:[0x120620,12,60],hs:0x5a3a8a,hg:0x0a0612,hp:.5,kc:0xff4fc8,kp:1.9,kp3:[6,5,4],rc:0x2fe4ff,rp:2.4,rp3:[-8,4,-6],pts:[[0xff3fb0,3,[5,2.5,3]],[0x20e0ff,3,[-6,2.5,-3]]],
  build(g){const f=new THREE.Mesh(new THREE.PlaneGeometry(40,120),bm(0x0b0a12,{roughness:.18,metalness:.6}));f.rotation.x=-Math.PI/2;g.add(f);
   for(const s of[-1,1]){for(let i=0;i<9;i++){const h=8+(i*7%11),b=box([6,h,5],bm(0x0c0b14),s*13,h/2,-30+i*8,g);for(let k=0;k<4;k++)box([.12,.9,4.2],em(k%2?0xff3fb0:0x20e0ff),s*9.9,3+k*2.2+(i%3),-30+i*8,g)}box([.25,.05,100],em(s>0?0xff3fb0:0x20e0ff),s*4.6,.03,0,g)}
   for(let i=0;i<12;i++)box([.2,.05,2.6],em(0xdfe0ea),0,.03,-30+i*5,g)}},
 sunset:{bg:0x5a2208,fog:[0x7a3210,25,110],hs:0xffb078,hg:0x2a1608,hp:.9,kc:0xffa04a,kp:2.8,kp3:[-14,2.4,10],rc:0x6a7fc0,rp:.8,rp3:[10,4,-8],pts:[],
  build(g){const f=new THREE.Mesh(new THREE.PlaneGeometry(60,200),bm(0x202225,{roughness:.9}));f.rotation.x=-Math.PI/2;g.add(f);for(const s of[-1,1])box([.18,.02,200],em(0xe8e0c0),s*5.4,.02,0,g);for(let i=0;i<20;i++)box([.18,.02,2.6],em(0xe8e0c0),0,.02,-60+i*6,g);
   const sun=new THREE.Mesh(new THREE.CircleGeometry(14,40),new THREE.MeshBasicMaterial({color:0xffc06a,fog:false}));sun.position.set(-30,9,-80);sun.rotation.y=.35;g.add(sun);
   for(const s of[-1,1])for(let i=0;i<10;i++){const h=1+(i*5%4),t=new THREE.Mesh(new THREE.ConeGeometry(2.2,h*4,6),bm(0x1c2a12));t.position.set(s*(14+(i*3%7)),h*2,-70+i*14);g.add(t)}}},
 dawn:{bg:0x8fa4b0,fog:[0x9eb2bd,10,70],hs:0xd8e6ee,hg:0x4a5a52,hp:1.1,kc:0xfff0d0,kp:1.7,kp3:[-6,6,8],rc:0xa8c8e0,rp:.9,rp3:[8,3,-6],pts:[],
  build(g){const f=new THREE.Mesh(new THREE.PlaneGeometry(60,200),bm(0x2c3033,{roughness:.5,metalness:.1}));f.rotation.x=-Math.PI/2;g.add(f);const gr=new THREE.Mesh(new THREE.PlaneGeometry(200,200),bm(0x2f4a30));gr.rotation.x=-Math.PI/2;gr.position.y=-.02;g.add(gr);for(let i=0;i<20;i++)box([.18,.02,2.6],em(0xdcd8c8),0,.02,-60+i*6,g);
   for(const s of[-1,1])for(let i=0;i<14;i++){const h=2+(i*5%4),t=new THREE.Mesh(new THREE.ConeGeometry(1.8,h*3,6),bm(0x20381f));t.position.set(s*(8+(i*3%6)),h*1.5,-50+i*8);g.add(t)}}},
 tunnel:{bg:0x040404,fog:[0x080604,6,44],hs:0x8a6a3a,hg:0x0a0806,hp:.55,kc:0xffb55a,kp:1.3,kp3:[3,5,6],rc:0xff8a2a,rp:1.6,rp3:[-4,3,-8],pts:[[0xff9a3a,3.2,[0,4.2,3]],[0xff9a3a,2.6,[0,4.2,-9]]],
  build(g){const f=new THREE.Mesh(new THREE.PlaneGeometry(16,120),bm(0x15130f,{roughness:.35,metalness:.3}));f.rotation.x=-Math.PI/2;g.add(f);box([.6,8,120],bm(0x1c1a17),-8.3,4,0,g);box([.6,8,120],bm(0x1c1a17),8.3,4,0,g);box([17,.6,120],bm(0x1c1a17),0,8,0,g);
   for(let i=0;i<14;i++){box([2.4,.2,.5],em(0xffc070),0,7.6,-40+i*6,g);box([.3,.3,.8],em(0xffc070),-7.6,1.2,-40+i*6,g);box([.3,.3,.8],em(0xffc070),7.6,1.2,-40+i*6,g)}box([.2,.02,120],em(0xe8d8a0),-3.4,.02,0,g);box([.2,.02,120],em(0xe8d8a0),3.4,.02,0,g)}},
 bunker:{bg:0x0a0b0c,fog:[0x0a0b0c,10,45],hs:0x9aa0a6,hg:0x121416,hp:.5,kc:0xfff4e6,kp:2.2,kp3:[3,8,6],rc:0xffb070,rp:1.4,rp3:[-7,2.5,-7],pts:[[0xffd9a0,2.4,[-5,3.4,2]]],
  build(g){const f=new THREE.Mesh(new THREE.PlaneGeometry(40,40),bm(0x2a2c2e,{roughness:.55,metalness:.15}));f.rotation.x=-Math.PI/2;g.add(f);box([40,9,.6],bm(0x2e3033),0,4.5,-14,g);box([.6,9,40],bm(0x26282a),-14,4.5,0,g);box([.6,9,40],bm(0x26282a),14,4.5,0,g);box([40,.6,40],bm(0x1a1b1d),0,9,0,g);
   for(let i=-2;i<=2;i++){box([.5,9,.5],bm(0x3a3c3f),i*6,4.5,-12,g);for(let k=0;k<5;k++)box([.52,.45,.52],bm(k%2?0xe0b020:0x15161a),i*6,.6+k*.9,-12,g);box([6,.1,.5],em(0xfff2d8),i*6,8.6,-3,g)}}}};
let SRC=null;const cache={};
function carById(n){return P.CARS&&P.CARS.find(c=>c.name===n)}
function build(sc,id){if(cache[id])return cache[id];const car=P.BYID[id],idx=P.modelOf(id,0),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src)return null;
 const model=src.clone(true),g=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);g.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);g.scale.setScalar(k);const outer=new THREE.Group();g.rotation.y=(sz.x>sz.z?Math.PI/2:0)+(window.__cinFlip?0:Math.PI);outer.add(g);
 const L=Math.max(sz.x,sz.z)*k,W=Math.min(sz.x,sz.z)*k,sh=new THREE.Mesh(new THREE.PlaneGeometry(W*1.9,L*1.25),new THREE.MeshBasicMaterial({map:blob(),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;outer.add(sh);
 return cache[id]={g:outer,L}}
function photo(){const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,300),hemi=new THREE.HemisphereLight(0xffffff,0x222222,1),key=new THREE.DirectionalLight(0xffffff,2),rim=new THREE.DirectionalLight(0xffffff,1),p1=new THREE.PointLight(0xffffff,0,26),p2=new THREE.PointLight(0xffffff,0,26),env=new THREE.Group(),fade=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:1,depthTest:false,depthWrite:false,fog:false}));
 sc.add(hemi,key,rim,p1,p2,env,cam);fade.renderOrder=999;fade.position.z=-.3;cam.add(fade);let curEnv=null,curCar=null;
 return{sc,cam,fade,set(s){const e=ENV[s.env];if(curEnv!==s.env){env.clear();e.build(env);curEnv=s.env}
  sc.background=new THREE.Color(e.bg);sc.fog=new THREE.Fog(e.fog[0],e.fog[1],e.fog[2]);hemi.color.setHex(e.hs);hemi.groundColor.setHex(e.hg);hemi.intensity=e.hp;key.color.setHex(e.kc);key.intensity=e.kp;key.position.set(...e.kp3);rim.color.setHex(e.rc);rim.intensity=e.rp;rim.position.set(...e.rp3);
  [p1,p2].forEach((p,i)=>{const q=e.pts[i];p.intensity=q?q[1]:0;if(q){p.color.setHex(q[0]);p.position.set(...q[2])}});
  if(curCar)sc.remove(curCar);const c=carById(s.car),b=c&&build(sc,c.id);curCar=b?b.g:null;if(curCar)sc.add(curCar);return !!curCar}}}
/* chapters: a shuffled run of stills, then the old moving cinematic, and round again */
let ph=null,old=null;
function menuScene2(){const pt=photo();let t0=performance.now()/1000,order=[],pos=0,mode='still',shotT=0,cur=null,mov=0;
 const DUR=7.2,FADE=.7;
 function next(){if(!order.length||pos>=order.length){order=SH.map((s,i)=>i).sort(()=>Math.random()-.5).slice(0,5);pos=0;mode='move';mov=0;return}
  const s=SH[order[pos++]];if(!pt.set(s)){return next()}cur=s;mode='still';shotT=0}
 const self={get sc(){return mode==='move'&&old?old.sc:pt.sc},get cam(){return mode==='move'&&old?old.cam:pt.cam},
  tick(time){const now=performance.now()/1000,dt=Math.min(.1,now-t0);t0=now;const W=innerWidth,H=innerHeight;
   if(!cur&&mode==='still')next();
   if(mode==='move'){if(!old)old=base();mov+=dt;old.tick(time);old.cam.aspect=W/H;old.cam.updateProjectionMatrix();if(mov>14)next();return}
   shotT+=dt;const u=cl(shotT/DUR,0,1),e=sm(u),A=cur.a,B=cur.b,c=pt.cam;
   c.position.set(A[0][0]+(B[0][0]-A[0][0])*e,A[0][1]+(B[0][1]-A[0][1])*e,A[0][2]+(B[0][2]-A[0][2])*e);
   const lk=[A[1][0]+(B[1][0]-A[1][0])*e,A[1][1]+(B[1][1]-A[1][1])*e,A[1][2]+(B[1][2]-A[1][2])*e];c.lookAt(lk[0],lk[1],lk[2]);
   c.fov=cur.fov;c.aspect=W/H;c.updateProjectionMatrix();c.setViewOffset(W,H,-W*.12,0,W,H);
   pt.fade.material.opacity=shotT<FADE?1-sm(shotT/FADE):shotT>DUR-FADE?sm((shotT-(DUR-FADE))/FADE):0;pt.fade.scale.setScalar(Math.max(1,W/H)*2);
   if(shotT>=DUR)next()}};
 window.__cin={self,pt,SH,go(i){const s=SH[i];pt.set(s);cur=s;mode='still';shotT=1.2;order=[];pos=99}};
 return self}
menuScene=menuScene2;
})();
