/* ===== Poly GT layer: cinematic menu. Still-frame "photo shoots" (dark studio, neon street, sunset road, foggy dawn, tunnel, concrete bunker) cut in between the moving drive-by ===== */
(function cinema(){
'use strict';
const P=window.PT8;
const cl=(x,a,b)=>Math.max(a,Math.min(b,x)),sm=x=>{x=cl(x,0,1);return x*x*(3-2*x)};
/* shots: car name, set, camera start/end (x = right of the car, z = in front of its nose), lens, optional paint tint */
const C={cnt:'LAMBORGHINI COUNTACH',f40:'FERRARI F40',r34:'NISSAN SKYLINE GT-R R34',sup:'TOYOTA SUPRA A80 (JTCC)',gt2:'PORSCHE 911 GT2 RS',f1:'MCLAREN F1 GTR',dia:'LAMBORGHINI DIABLO',vey:'BUGATTI VEYRON',p918:'PORSCHE 918 SPYDER',c3:'CHEVROLET CORVETTE C3',hur:'LAMBORGHINI HURACAN',chg:'DODGE CHARGER R/T',ave:'LAMBORGHINI AVENTADOR SV',mur:'LAMBORGHINI MURCIELAGO',zon:'PAGANI ZONDA CINQUE',r8:'AUDI R8',s15:'NISSAN SILVIA S15',nsx:'HONDA NSX (NA1)',evo:'MITSUBISHI LANCER EVO X',gt350:'SHELBY GT350 (1965)',dmc:'DELOREAN DMC-12',amg:'MERCEDES-AMG GT',vip:'DODGE VIPER (GEN 5)',m3:'BMW M3 (E90)',mar:'FERRARI 575M MARANELLO',sup2:'PLYMOUTH SUPERBIRD',gal:'LAMBORGHINI GALLARDO SL',ven:'LAMBORGHINI VENENO',t930:'PORSCHE 911 TURBO (930)',rwb:'PORSCHE 911 CARRERA RWB'};
/* cars: [name, x, z, yaw in degrees]; nose points +z at yaw 0, +yaw swings it toward +x. Cameras look from a to b over the shot. */
const SH=[
 {env:'void',cars:[[C.cnt,0,0,-18],[C.f40,-4.2,-4.5,8],[C.dia,4.6,-5.5,-8],[C.ven,-8.4,-9,14],[C.ave,8.6,-10,-12]],a:[[6.5,.8,8],[0,.7,-3]],b:[[4,.9,9.5],[0,.7,-3.5]],fov:36},
 {env:'bunker',cars:[[C.f1,-7.5,0,0],[C.mur,-3.75,.6,0],[C.cnt,0,0,0],[C.gal,3.75,.5,0],[C.ven,7.5,0,0]],a:[[-9,.75,9.5],[0,.7,0]],b:[[-3,.8,9.5],[2,.7,0]],fov:38},
 {env:'neon',cars:[[C.r34,-2.6,0,0],[C.sup,2.6,4,0],[C.nsx,-2.6,8.5,0],[C.s15,2.6,13,0],[C.evo,-2.6,17.5,0]],a:[[0,.75,-7.5],[0,.7,10]],b:[[.6,.8,-5.5],[0,.7,11]],fov:42},
 {env:'sunset',cars:[[C.c3,0,-6,0],[C.gt350,0,0,0],[C.chg,0,6,0],[C.sup2,0,12,0]],a:[[10,.9,8],[0,.6,3]],b:[[10,.9,-2],[0,.6,3]],fov:30},
 {env:'tunnel',cars:[[C.f40,-2.6,0,6],[C.gt2,2.4,-5,-5],[C.zon,-2.5,-10,5],[C.vip,2.5,-15,-6]],a:[[0,.9,8],[0,.7,-6]],b:[[0,1,5.5],[0,.7,-6]],fov:40},
 {env:'dawn',cars:[[C.p918,0,0,-30],[C.r8,-5.6,3,20],[C.amg,5.4,2,-70],[C.t930,-3.4,-5.8,55],[C.rwb,3.6,-6.6,-25]],a:[[8,5.4,10],[0,.4,-1]],b:[[6,4.2,11.5],[0,.4,-1]],fov:34},
 {env:'void',cars:[[C.cnt,0,2.6,0],[C.f40,2.6,0,90],[C.dia,0,-2.6,180],[C.hur,-2.6,0,270]],a:[[0,11,.2],[0,0,0]],b:[[.5,9,-.4],[0,0,0]],fov:36},
 {env:'bunker',cars:[[C.cnt,0,0,-22],[C.f40,-5.2,-3.4,12]],a:[[2.2,.55,4.6],[.7,.55,1.6]],b:[[1.4,.6,4.4],[.6,.55,1.7]],fov:30},
 {env:'neon',cars:[[C.hur,0,0,-35],[C.ave,-5.4,-3,20],[C.gal,5.6,-4,-15]],a:[[-3.6,.5,6.6],[0,.5,0]],b:[[-1.8,.55,7],[.5,.5,0]],fov:34},
 {env:'sunset',cars:[[C.cnt,0,0,0],[C.dia,-4.6,-5,0],[C.mar,4.6,-4,0],[C.p918,-9,-10,0],[C.r34,9,-9,0]],a:[[2,.65,-6.5],[0,.7,4]],b:[[1,.7,-8.5],[0,.7,4]],fov:36},
 {env:'dawn',cars:[[C.dmc,0,0,-60],[C.m3,-6,-1,-80],[C.evo,6.2,0,-40]],a:[[-9,1.1,9],[0,.7,0]],b:[[-5,1,10.5],[0,.7,0]],fov:34},
 {env:'tunnel',cars:[[C.chg,0,0,0],[C.sup2,-5,-5,-6],[C.c3,5,-5,6]],a:[[-5.5,.65,6.6],[0,.7,0]],b:[[-4,.7,7.2],[0,.7,0]],fov:34},
 {env:'void',cars:[[C.r34,0,0,25],[C.sup,-5.4,2,-15],[C.s15,5.2,2,30],[C.nsx,-2.4,-6,10],[C.evo,2.6,-6.4,-20]],a:[[0,.7,10],[0,.7,0]],b:[[0,.8,8],[0,.7,0]],fov:36},
 {env:'bunker',cars:[[C.cnt,-3.2,0,0],[C.cnt,3.2,0,0],[C.f1,0,-5.4,0]],a:[[0,.5,7.5],[0,.7,-1]],b:[[0,.6,5.8],[0,.7,-1]],fov:38}];
const hdr=(c,k)=>new THREE.Color(c).multiplyScalar(k),bm=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o||{})),em=(c,k)=>new THREE.MeshBasicMaterial({color:hdr(c,(k||2.6)*.72)}),box=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(g[0],g[1],g[2]),m);o.position.set(x,y,z);o.receiveShadow=true;p.add(o);return o};
/* floors are glass-like: the mirrored copies of the cars underneath show through */
const floor=(w,d,c,o)=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.42,metalness:.1,transparent:true,opacity:.8},o||{})));f.rotation.x=-Math.PI/2;f.receiveShadow=true;return f};
/* environments: bg, fog, hemisphere, key (casts the shadows), rim, point lights, softboxes for the reflection map, geometry */
const ENV={
 void:{bg:0x010203,fog:[0x010203,18,60],hs:0x6f7f95,hg:0x05070a,hp:.28,kc:0xfff1de,kp:2.1,kp3:[6,11,7],rc:0x5b86ff,rp:1.6,rp3:[-9,4,-8],pts:[[0xff7a44,5,[5,1.6,-6]]],
  soft:[[16,5,0,9,0,1.5707,0,[2.2,2.2,2.4]],[2,8,-9,4,-1,0,1.5707,[1.2,1.5,2.6]],[2,8,9,4,-1,0,1.5707,[2.2,1.4,.9]]],
  build(g){g.add(floor(80,80,0x0a0c10));for(let i=-3;i<=3;i++)box([.22,.06,12],em(0xdfe8ff,3),i*2.6,7.2,0,g);for(let i=0;i<5;i++)box([9,.06,.18],em(0x6f86d8,2.4),0,6.4,-9+i*3.4,g)}},
 neon:{bg:0x040208,fog:[0x0e0418,14,70],hs:0x4a2f78,hg:0x07040c,hp:.3,kc:0xff7ad8,kp:1.5,kp3:[7,9,5],rc:0x38e8ff,rp:2,rp3:[-9,4,-7],pts:[[0xff3fb0,16,[5,2.8,3]],[0x20e0ff,16,[-6,2.8,-3]]],
  soft:[[10,4,-9,5,0,0,1.5707,[.4,2.4,2.8]],[10,4,9,5,0,0,1.5707,[2.8,.5,2.2]],[14,4,0,9,0,1.5707,0,[.8,.8,1.2]]],
  build(g){g.add(floor(44,140,0x0a0912,{roughness:.22}));
   for(const s of[-1,1]){for(let i=0;i<10;i++){const h=8+(i*7%11),b=box([6,h,5],bm(0x0b0a14),s*13,h/2,-34+i*8,g);for(let k=0;k<4;k++)box([.12,.9,4.2],em(k%2?0xff3fb0:0x20e0ff,2.8),s*9.9,3+k*2.2+(i%3),-34+i*8,g)}box([.25,.05,120],em(s>0?0xff3fb0:0x20e0ff,3),s*4.9,.03,0,g)}
   for(let i=0;i<14;i++)box([.2,.04,2.6],em(0xdfe0ea,1.6),0,.03,-30+i*5,g)}},
 sunset:{bg:0x3a1606,fog:[0x6a2a0e,30,130],hs:0xffb078,hg:0x2a1608,hp:.5,kc:0xffa04a,kp:3.2,kp3:[-14,3.2,10],rc:0x6a7fc0,rp:.9,rp3:[10,4,-8],pts:[],
  soft:[[24,10,-24,5,-6,0,1.1,[3.6,1.9,.7]],[16,5,0,9,0,1.5707,0,[.7,.8,1.4]]],
  build(g){g.add(floor(70,220,0x15171a,{roughness:.55,opacity:.86}));for(const s of[-1,1])box([.18,.02,200],em(0xe8e0c0,1.4),s*5.6,.02,0,g);for(let i=0;i<22;i++)box([.18,.02,2.6],em(0xe8e0c0,1.4),0,.02,-60+i*6,g);
   const sun=new THREE.Mesh(new THREE.CircleGeometry(15,48),new THREE.MeshBasicMaterial({color:hdr(0xffc06a,3.2),fog:false}));sun.position.set(-34,10,-90);sun.rotation.y=.3;g.add(sun);}},
 dawn:{bg:0x9fb2bd,fog:[0xa9bcc6,12,85],hs:0xe6eef4,hg:0x4a5a52,hp:.8,kc:0xfff0d0,kp:2.4,kp3:[-7,10,8],rc:0xa8c8e0,rp:.8,rp3:[8,3,-6],pts:[],
  soft:[[30,12,0,12,0,1.5707,0,[2.6,2.8,3]],[12,5,-9,4,-3,0,1.5707,[1.4,1.5,1.7]]],
  build(g){g.add(floor(70,220,0x2a2e31,{roughness:.4,opacity:.88}));const gr=new THREE.Mesh(new THREE.PlaneGeometry(220,220),bm(0x2f4a30));gr.rotation.x=-Math.PI/2;gr.position.y=-.03;g.add(gr);for(let i=0;i<22;i++)box([.18,.02,2.6],em(0xdcd8c8,1.3),0,.02,-60+i*6,g)}},
 tunnel:{bg:0x030303,fog:[0x070503,8,50],hs:0x8a6a3a,hg:0x080604,hp:.3,kc:0xffb55a,kp:1.6,kp3:[3,6,6],rc:0xff8a2a,rp:1.5,rp3:[-4,3,-8],pts:[[0xff9a3a,22,[0,4.4,3]],[0xff9a3a,18,[0,4.4,-9]]],
  soft:[[12,2,0,8,0,1.5707,0,[3.2,1.7,.6]],[2,6,-8,3,0,0,1.5707,[2.4,1.2,.5]],[2,6,8,3,0,0,1.5707,[2.4,1.2,.5]]],
  build(g){g.add(floor(17,140,0x15130f,{roughness:.3,opacity:.84}));box([.6,8,140],bm(0x1c1a17),-8.3,4,0,g);box([.6,8,140],bm(0x1c1a17),8.3,4,0,g);box([17,.6,140],bm(0x1c1a17),0,8,0,g);
   for(let i=0;i<16;i++){box([2.4,.2,.5],em(0xffc070,3),0,7.6,-44+i*6,g);box([.3,.3,.8],em(0xffc070,2.4),-7.6,1.2,-44+i*6,g);box([.3,.3,.8],em(0xffc070,2.4),7.6,1.2,-44+i*6,g)}box([.2,.02,140],em(0xe8d8a0,1.3),-3.4,.02,0,g);box([.2,.02,140],em(0xe8d8a0,1.3),3.4,.02,0,g)}},
 bunker:{bg:0x08090a,fog:[0x08090a,12,55],hs:0x9aa0a6,hg:0x101214,hp:.3,kc:0xfff4e6,kp:2.2,kp3:[3,9,6],rc:0xffb070,rp:1.2,rp3:[-8,3,-8],pts:[[0xffd9a0,14,[-5,3.6,2]]],
  soft:[[18,3,0,8.6,0,1.5707,0,[2.6,2.5,2.4]],[4,8,-13,4,0,0,0,[.5,.5,.55]]],
  build(g){g.add(floor(44,44,0x2a2c2e,{roughness:.4,opacity:.86}));box([44,9,.6],bm(0x2e3033),0,4.5,-15,g);box([.6,9,44],bm(0x26282a),-15,4.5,0,g);box([.6,9,44],bm(0x26282a),15,4.5,0,g);box([44,.6,44],bm(0x1a1b1d),0,9,0,g);
   for(let i=-2;i<=2;i++){box([.5,9,.5],bm(0x3a3c3f),i*6,4.5,-13,g);for(let k=0;k<5;k++)box([.52,.45,.52],bm(k%2?0xe0b020:0x15161a),i*6,.6+k*.9,-13,g);box([5,.1,.5],em(0xfff2d8,3),i*6,8.6,-3,g);box([5,.1,.5],em(0xfff2d8,3),i*6,8.6,5,g)}}}};
const envTex={};let PM=null;
function envMap(name){if(envTex[name])return envTex[name];PM=PM||new THREE.PMREMGenerator(R);const e=ENV[name],sc=new THREE.Scene();sc.background=new THREE.Color(e.bg===0x9fb2bd?0x7f939e:0x050608);
 for(const q of e.soft){const m=new THREE.Mesh(new THREE.PlaneGeometry(q[0],q[1]),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(q[7][0],q[7][1],q[7][2]),side:THREE.DoubleSide}));m.position.set(q[2],q[3],q[4]);m.rotation.set(q[5],q[6],0);sc.add(m)}
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(18,18,16,24,1,true),new THREE.MeshBasicMaterial({color:0x101216,side:THREE.BackSide}));wall.position.y=6;sc.add(wall);return envTex[name]=PM.fromScene(sc,.03).texture}
let SRC=null;const cache={};
function carById(n){return P.CARS&&P.CARS.find(c=>c.name===n)}
function build(sc,id){if(cache[id])return cache[id];const car=P.BYID[id],idx=P.modelOf(id,0),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src)return null;
 const model=src.clone(true),g=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);g.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);g.scale.setScalar(k);const outer=new THREE.Group();g.rotation.y=(sz.x>sz.z?Math.PI/2:0)+(window.__cinFlip?0:Math.PI);outer.add(g);
 outer.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m&&m.isMeshStandardMaterial)m.envMapIntensity=.55})}});
 return cache[id]={g:outer,L:Math.max(sz.x,sz.z)*k}}
function photo(){const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,300),hemi=new THREE.HemisphereLight(0xffffff,0x222222,1),key=new THREE.DirectionalLight(0xffffff,2),rim=new THREE.DirectionalLight(0xffffff,1),p1=new THREE.PointLight(0xffffff,0,26),p2=new THREE.PointLight(0xffffff,0,26),env=new THREE.Group(),fade=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:1,depthTest:false,depthWrite:false,fog:false}));
 key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0005;key.shadow.radius=4;{const sh=key.shadow.camera;sh.left=-16;sh.right=16;sh.top=16;sh.bottom=-16;sh.near=1;sh.far=60}sc.add(hemi,key,key.target,rim,p1,p2,env,cam);fade.renderOrder=999;fade.position.z=-.3;cam.add(fade);let curEnv=null,curCars=[];
 return{sc,cam,fade,set(s){const e=ENV[s.env];if(curEnv!==s.env){env.clear();e.build(env);curEnv=s.env}
  sc.background=new THREE.Color(e.bg);sc.environment=envMap(s.env);sc.fog=new THREE.Fog(e.fog[0],e.fog[1],e.fog[2]);hemi.color.setHex(e.hs);hemi.groundColor.setHex(e.hg);hemi.intensity=e.hp*.6;key.color.setHex(e.kc);key.intensity=e.kp*.5;key.position.set(...e.kp3);rim.color.setHex(e.rc);rim.intensity=e.rp*.55;rim.position.set(...e.rp3);
  [p1,p2].forEach((p,i)=>{const q=e.pts[i];p.intensity=q?q[1]*.4:0;if(q){p.color.setHex(q[0]);p.position.set(...q[2])}});
  curCars.forEach(o=>sc.remove(o));curCars=[];let ok=true;s.cars.forEach((q,i)=>{const c=carById(q[0]),b=c&&build(sc,c.id);if(!b){if(i===0)ok=false;return}const o=b.g.clone(true);o.position.set(q[1],0,q[2]);o.rotation.y=(q[3]||0)*Math.PI/180;sc.add(o);curCars.push(o);const m=o.clone(true);m.scale.y=-1;m.traverse(q=>{if(q.isMesh){q.castShadow=false;q.receiveShadow=false}});sc.add(m);curCars.push(m)});return ok&&curCars.length>0}}}
/* the studio's own render path (MSAA, bloom, tone map, vignette) at native resolution */
const ST={on:false},SCR=['menu','s8cards','s8setup','s8career','s8res'];let POST=null;
function off(){if(!ST.on)return;ST.on=false;R.toneMapping=ST.tm;R.shadowMap.enabled=ST.se;R.shadowMap.type=ST.st;$('c').style.imageRendering='';R.setRenderTarget(null);try{rs()}catch(e){}}
function draw(pt){if(!ST.on){ST.on=true;ST.tm=R.toneMapping;ST.se=R.shadowMap.enabled;ST.st=R.shadowMap.type;R.toneMapping=THREE.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;$('c').style.imageRendering='auto'}
 const d=Math.min(devicePixelRatio||1,2);if(R.domElement.width!==Math.max(2,innerWidth*d|0)||R.domElement.height!==Math.max(2,innerHeight*d|0))P.sizeNative();POST=POST||P.makePost();
 const W=R.domElement.width,H=R.domElement.height;R.setScissorTest(false);R.setViewport(0,0,W,H);POST.render(pt.sc,pt.cam);R.setRenderTarget(null)}
const sh0=show;show=function(n){if(ST.on&&SCR.indexOf(n)<0)off();return sh0.apply(this,arguments)};setInterval(()=>{if(ST.on&&SCR.indexOf(scr)<0)off()},200);
/* a shuffled run of stills, forever */
function menuScene2(){const pt=photo();let t0=performance.now()/1000,order=[],cur=null,shotT=0,last=-1;
 const DUR=7.4,FADE=.8;
 function next(n){n=n|0;if(!order.length){order=SH.map((_,i)=>i).sort(()=>Math.random()-.5);if(order[0]===last)order.push(order.shift())}
  const k=order.shift(),s=SH[k];last=k;if(!pt.set(s)){if(n<SH.length)return next(n+1);cur=null;return}cur=s;shotT=0}
 const self={sc:pt.sc,cam:pt.cam,draw(){draw(pt)},
  tick(time){const now=performance.now()/1000,dt=Math.min(.1,now-t0);t0=now;const W=innerWidth,H=innerHeight;
   if(!cur){next();if(!cur)return}shotT+=dt;const u=cl(shotT/DUR,0,1),e=sm(u),A=cur.a,B=cur.b,c=pt.cam;
   c.position.set(A[0][0]+(B[0][0]-A[0][0])*e,A[0][1]+(B[0][1]-A[0][1])*e,A[0][2]+(B[0][2]-A[0][2])*e);
   c.lookAt(A[1][0]+(B[1][0]-A[1][0])*e,A[1][1]+(B[1][1]-A[1][1])*e,A[1][2]+(B[1][2]-A[1][2])*e);
   c.fov=cur.fov;c.aspect=W/H;c.updateProjectionMatrix();c.setViewOffset(W,H,-W*.1,0,W,H);
   pt.fade.material.opacity=shotT<FADE?1-sm(shotT/FADE):shotT>DUR-FADE?sm((shotT-(DUR-FADE))/FADE):0;pt.fade.scale.setScalar(Math.max(1,W/H)*2);
   if(shotT>=DUR)next()}};
 window.__cin={self,pt,SH,go(i){const s=SH[i];pt.set(s);cur=s;shotT=1.2;order=[]}};
 return self}

/* Brand Central: a shutter opens on the way in, a quick black dip on the way out */
(function(){const mk=(css)=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;width:100%;pointer-events:none;'+css;return d};
 let top=null,bot=null,line=null,dip=null,was=false;
 function ensure(){if(top)return;top=mk('top:0;height:50.2%;background:#000;z-index:99998;transform:translateY(-101%);will-change:transform');bot=mk('bottom:0;height:50.2%;background:#000;z-index:99998;transform:translateY(101%);will-change:transform');line=mk('top:50%;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);z-index:99999;opacity:0;box-shadow:0 0 22px 4px rgba(255,235,190,.6)');dip=mk('top:0;height:100%;background:#000;z-index:99997;opacity:0');document.body.append(top,bot,line,dip)}
 function open_(){ensure();for(const e of[top,bot])e.style.transition='none';top.style.transform='none';bot.style.transform='none';line.style.transition='none';line.style.opacity=1;line.style.transform='scaleX(.15)';
  void top.offsetWidth;setTimeout(()=>{line.style.transition='transform .35s ease-out';line.style.transform='scaleX(1)'},40);
  setTimeout(()=>{for(const e of[top,bot])e.style.transition='transform .95s cubic-bezier(.77,0,.18,1)';top.style.transform='translateY(-101%)';bot.style.transform='translateY(101%)';line.style.transition='opacity .6s ease .15s';line.style.opacity=0},420)}
 function dip_(){ensure();dip.style.transition='none';dip.style.opacity=1;void dip.offsetWidth;setTimeout(()=>{dip.style.transition='opacity .55s ease';dip.style.opacity=0},160)}
 new MutationObserver(()=>{const st=document.body.classList.contains('studio'),brand=st&&P.SR&&P.SR.kind==='brand';if(brand&&!was)open_();else if(!st&&was)dip_();was=brand}).observe(document.body,{attributes:true,attributeFilter:['class']})})();
menuScene=menuScene2;
})();
