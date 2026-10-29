/* ===== Poly GT layer: cinematic menu. Still-frame "photo shoots" (dark studio, neon street, sunset road, foggy dawn, tunnel, concrete bunker) cut in between the moving drive-by ===== */
(function cinema(){
'use strict';
const P=window.PT8;
const cl=(x,a,b)=>Math.max(a,Math.min(b,x)),sm=x=>{x=cl(x,0,1);return x*x*(3-2*x)};
/* shots: car name, set, camera start/end (x = right of the car, z = in front of its nose), lens, optional paint tint */
const C={cnt:'LAMBORGHINI COUNTACH',f40:'FERRARI F40',r34:'NISSAN SKYLINE GT-R R34',sup:'TOYOTA SUPRA A80 (JTCC)',gt2:'PORSCHE 911 GT2 RS',f1:'MCLAREN F1 GTR',dia:'LAMBORGHINI DIABLO',vey:'BUGATTI VEYRON',p918:'PORSCHE 918 SPYDER',c3:'CHEVROLET CORVETTE C3',hur:'LAMBORGHINI HURACAN',chg:'DODGE CHARGER R/T',ave:'LAMBORGHINI AVENTADOR SV',mur:'LAMBORGHINI MURCIELAGO',zon:'PAGANI ZONDA CINQUE',r8:'AUDI R8',s15:'NISSAN SILVIA S15',nsx:'HONDA NSX (NA1)',evo:'MITSUBISHI LANCER EVO X',gt350:'SHELBY GT350 (1965)',dmc:'DELOREAN DMC-12',amg:'MERCEDES-AMG GT',vip:'DODGE VIPER (GEN 5)',m3:'BMW M3 (E90)',mar:'FERRARI 575M MARANELLO',sup2:'PLYMOUTH SUPERBIRD',gal:'LAMBORGHINI GALLARDO SL',ven:'LAMBORGHINI VENENO',t930:'PORSCHE 911 TURBO (930)',rwb:'PORSCHE 911 CARRERA RWB'};
/* cars: [name, x, z, yaw in degrees]; nose points +z at yaw 0, +yaw swings it toward +x. Cameras look from a to b over the shot. */
const row=(ns,dx,dz,x0,z0,yaw)=>ns.map((n,i)=>[n,x0+i*dx,z0+i*dz,yaw||0]);
const SH=[
 /* black studio */
 {env:'void',cars:row([C.f40,C.zon,C.gt2,C.p918,C.ave],3.4,4.6,-6.8,-9.2,0),a:[[-9,.8,12],[0,.7,0]],b:[[-4,.9,13],[0,.7,0]],fov:38},
 {env:'void',cars:[[C.f40,-2.5,0,10],[C.dia,2.5,.4,-10]],a:[[0,.7,9],[0,.65,0]],b:[[1.4,.8,7.4],[0,.65,0]],fov:34},
 {env:'void',cars:[[C.cnt,0,4.6,90],[C.f40,4.6,0,180],[C.dia,0,-4.6,270],[C.hur,-4.6,0,0]],a:[[0,6.6,11.5],[0,.2,.4]],b:[[3.6,6.8,10],[0,.2,.4]],fov:46},
 {env:'void',cars:[[C.zon,0,0,0],[C.ven,-3.4,-5,0],[C.ave,3.4,-5,0],[C.mur,-6.8,-10,0],[C.gal,6.8,-10,0]],a:[[0,.7,8],[0,.7,-3]],b:[[0,1.3,7],[0,.7,-3]],fov:40},
 {env:'void',cars:[...row([C.r8,C.amg,C.mar],4,0,-4,0,0),...row([C.hur,C.p918,C.ven],4,0,-4,-7,0)],a:[[0,3.2,13],[0,.4,-2.5]],b:[[2,3.6,12],[0,.4,-2.5]],fov:38},
 {env:'void',cars:[[C.gt2,0,0,35],[C.mur,-5.2,-5,-20],[C.f1,5.2,-5.4,20]],a:[[-5,.7,-9],[0,.7,0]],b:[[-2,.8,-9.5],[0,.7,0]],fov:34},
 {env:'void',cars:row([C.ven,C.f40,C.zon,C.ave],3.3,0,-5,0,0),a:[[-7,.45,6.4],[1.5,.6,0]],b:[[0,.5,7.6],[0,.6,0]],fov:42},
 {env:'void',cars:[[C.p918,-4,2,25],[C.hur,4.4,3,-30],[C.mar,0,-4,170],[C.r8,-6,-6,60],[C.ave,6.4,-5,-100],[C.dia,0,8.6,200]],a:[[0,9,10],[0,0,0]],b:[[2.4,9.6,8.6],[0,0,0]],fov:44},
 {env:'void',cars:[[C.cnt,0,0,-20],[C.zon,-4.6,-4.4,10],[C.vey,4.8,-4.8,-8]],a:[[4.6,.75,6.2],[0,.65,-.6]],b:[[2.6,.8,6.8],[0,.65,-.6]],fov:34},
 /* concrete bunker */
 {env:'bunker',cars:row([C.f1,C.mur,C.gal,C.ven,C.hur],3.75,.4,-7.5,0,0),a:[[-9,.75,9.5],[0,.7,0]],b:[[-3,.8,9.5],[2,.7,0]],fov:38},
 {env:'bunker',cars:[[C.cnt,0,0,-22],[C.f40,-5.2,-3.4,12]],a:[[2.2,.55,4.6],[.7,.55,1.6]],b:[[1.4,.6,4.4],[.6,.55,1.7]],fov:30},
 {env:'bunker',cars:[[C.gt350,-3.2,0,6],[C.chg,3.2,.2,-6],[C.sup2,0,-5.4,0]],a:[[0,.5,7.5],[0,.7,-1]],b:[[0,.6,5.8],[0,.7,-1]],fov:38},
 /* neon street */
 {env:'neon',cars:[[C.r34,-2.6,0,0],[C.sup,2.6,4,0],[C.nsx,-2.6,8.5,0],[C.s15,2.6,13,0],[C.evo,-2.6,17.5,0]],a:[[0,.75,-7.5],[0,.7,10]],b:[[.6,.8,-5.5],[0,.7,11]],fov:42},
 {env:'neon',cars:[[C.hur,0,0,-35],[C.ave,-5.4,-3,20],[C.gal,5.6,-4,-15]],a:[[-3.6,.5,6.6],[0,.5,0]],b:[[-1.8,.55,7],[.5,.5,0]],fov:34},
 {env:'neon',cars:[[C.r34,-3,0,0],[C.sup,3,0,0],[C.s15,0,-5.6,0]],a:[[0,.55,8],[0,.7,-1]],b:[[0,.7,6.2],[0,.7,-1]],fov:38},
 /* tunnel */
 {env:'tunnel',cars:[[C.f40,-2.6,0,6],[C.gt2,2.4,-5,-5],[C.zon,-2.5,-10,5],[C.vip,2.5,-15,-6]],a:[[0,.9,8],[0,.7,-6]],b:[[0,1,5.5],[0,.7,-6]],fov:40},
 {env:'tunnel',cars:[[C.chg,0,0,0],[C.sup2,-5,-5,-6],[C.c3,5,-5,6]],a:[[-5.5,.65,6.6],[0,.7,0]],b:[[-4,.7,7.2],[0,.7,0]],fov:34},
 /* foggy dawn */
 {env:'dawn',cars:[[C.p918,0,0,-30],[C.r8,-5.6,3,20],[C.amg,5.4,2,-70],[C.t930,-3.4,-5.8,55],[C.rwb,3.6,-6.6,-25]],a:[[8,5.4,10],[0,.4,-1]],b:[[6,4.2,11.5],[0,.4,-1]],fov:34},
 {env:'dawn',cars:[[C.dmc,0,0,-60],[C.m3,-6,-1,-80],[C.evo,6.2,0,-40]],a:[[-9,1.1,9],[0,.7,0]],b:[[-5,1,10.5],[0,.7,0]],fov:34},
 /* white cyclorama */
 {env:'white',cars:[[C.hur,0,0,-28],[C.ave,-5.6,-4,14],[C.gal,5.6,-4.6,-12]],a:[[5,1,8.4],[0,.6,-.6]],b:[[2.6,1.2,9.4],[0,.6,-.6]],fov:34},
 {env:'white',cars:row([C.r8,C.nsx,C.m3,C.evo,C.s15],3.2,0,-6.4,0,0),a:[[-10,.9,7.6],[0,.6,0]],b:[[-4,1,8.4],[0,.6,0]],fov:40},
 {env:'white',cars:[[C.f1,0,0,0],[C.vey,-5,-5.6,0],[C.zon,5,-5.6,0]],a:[[0,.6,9],[0,.7,-1]],b:[[0,1.2,8],[0,.7,-1]],fov:36},
 /* blue hour skyline */
 {env:'dusk',cars:[[C.r34,-2.6,0,0],[C.sup,2.6,5,0],[C.nsx,-2.6,10,0],[C.s15,2.6,15,0]],a:[[0,.8,-8],[0,.8,10]],b:[[1,.9,-6],[0,.8,11]],fov:42},
 {env:'dusk',cars:[[C.vey,0,0,-30],[C.mar,-5.4,-3,15]],a:[[5.4,.8,6.4],[0,.7,0]],b:[[3.6,.9,7],[0,.7,0]],fov:34},
 {env:'dusk',cars:[[C.p918,-3,0,0],[C.ave,3,.2,0],[C.mur,0,-6,0]],a:[[0,.6,9],[0,.7,-1]],b:[[0,.8,7.4],[0,.7,-1]],fov:38},
 /* red room */
 {env:'redroom',cars:[[C.f40,0,0,-25],[C.dia,-5,-4.5,12]],a:[[3.6,.7,6],[0,.6,0]],b:[[2.2,.75,6.6],[0,.6,0]],fov:32},
 {env:'redroom',cars:[[C.zon,-3,0,10],[C.ven,3,0,-10],[C.f1,0,-5.6,0]],a:[[0,.55,8.6],[0,.7,-1]],b:[[0,.7,7],[0,.7,-1]],fov:38},
 /* arctic road */
 {env:'arctic',cars:[[C.evo,0,0,-35],[C.sup2,-5,-4,15],[C.gt350,5.2,-4.6,-12]],a:[[5.6,.9,7],[0,.6,-.6]],b:[[3.6,1,8],[0,.6,-.6]],fov:34},
 {env:'arctic',cars:[[C.gt2,0,0,0],[C.r34,0,6,0],[C.m3,0,12,0]],a:[[8,.9,3],[0,.6,6]],b:[[8,.9,10],[0,.6,6]],fov:30},
 /* sunset road */
 {env:'sunset',cars:[['FERRARI 599 GTB',0,0,-25],[C.cnt,-5.2,-4,14]],a:[[4.6,.7,6.6],[0,.8,-1]],b:[[3,.75,7.2],[0,.8,-1]],fov:34},
 {env:'sunset',cars:[['MAZDA 787B',0,0,-30],['MAZDA RX-7 VEILSIDE',-5.6,-3.4,15],[C.r34,5.4,-4.4,-12]],a:[[5.4,.65,6.4],[0,.8,-1]],b:[[3.6,.7,7],[0,.8,-1]],fov:34},
 {env:'sunset',cars:[[C.f40,-2.6,0,0],['FERRARI 288 GTO',2.6,5,0],['FERRARI ENZO',-2.6,10,0]],a:[[0,.8,-8],[0,.9,10]],b:[[1,.9,-6],[0,.9,11]],fov:42},
 /* pale studio */
 {env:'pale',cars:[['FERRARI 288 GTO',-6,0,0],[C.f40,-2,0,0],['FERRARI F430',2,0,0],['FERRARI 458 ITALIA',6,0,0]],a:[[-11,.85,9],[-1,.6,0]],b:[[-6,.9,10],[0,.6,0]],fov:38},
 {env:'pale',cars:[['LANCIA STRATOS',0,0,-28],['LANCIA 037 RALLY',-5.6,-4,16],['LANCIA DELTA INTEGRALE',5.6,-4.6,-14]],a:[[7.4,1.2,10.6],[0,.6,-1.6]],b:[[5,1.3,11.6],[0,.6,-1.6]],fov:40},
 {env:'pale',cars:[['ALFA ROMEO 8C',-3,0,10],['MASERATI GRANTURISMO',3,0,-10],['ASTON MARTIN VANQUISH',0,-5.6,0]],a:[[0,.6,9],[0,.7,-1]],b:[[0,.8,7.4],[0,.7,-1]],fov:38},
 /* more studio sets */
 {env:'void',cars:[['FERRARI ENZO',0,0,-22],['KOENIGSEGG JESKO',-5,-4.6,12],['BUGATTI DIVO',5.2,-5,-10]],a:[[4.4,.7,6.4],[0,.6,-.6]],b:[[3,.75,7],[0,.6,-.6]],fov:34},
 {env:'bunker',cars:[['FORD GT90',-4,0,8],['FORD GT (2005)',0,-.6,0],['FORD GT (2017)',4,0,-8]],a:[[0,.8,8.8],[0,.6,-.5]],b:[[0,.9,7.6],[0,.6,-.5]],fov:38},
 {env:'neon',cars:[['NISSAN SKYLINE GT-R R32',-3.2,0,10],['NISSAN SKYLINE GT-R R33',0,-1.2,0],[C.r34,3.2,0,-10]],a:[[0,.6,8.2],[0,.65,-1]],b:[[0,.75,6.8],[0,.65,-1]],fov:38},
 {env:'tunnel',cars:[['SALEEN S7',-2.4,0,4],['HENNESSEY VENOM F5',2.4,-5.4,-4]],a:[[-3.4,.7,6.8],[0,.6,-2]],b:[[-2.2,.75,7.4],[0,.6,-2]],fov:36},
 {env:'void',cars:[['BMW M1 PROCAR',0,4.6,90],['BMW M3 GTR (GT3)',4.6,0,180],['BMW M4 GT3',0,-4.6,270],['BMW M3 (E30)',-4.6,0,0]],a:[[2,6.8,11],[0,.2,.4]],b:[[4,7,9.6],[0,.2,.4]],fov:46},
 {env:'bunker',cars:[['DODGE CHALLENGER',-6,0,0],['PLYMOUTH BARRACUDA',-2,0,0],['CHEVROLET CHEVELLE SS',2,0,0],['CHEVROLET CAMARO Z28',6,0,0]],a:[[-11,.8,9.4],[-1,.7,0]],b:[[-6,.85,10],[0,.7,0]],fov:38}];
const hdr=(c,k)=>new THREE.Color(c).multiplyScalar(k),bm=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o||{})),em=(c,k)=>new THREE.MeshBasicMaterial({color:hdr(c,(k||2.6)*.72)}),box=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(g[0],g[1],g[2]),m);o.position.set(x,y,z);o.receiveShadow=true;p.add(o);return o};
/* floors are glass-like: the mirrored copies of the cars underneath show through */
const floor=(w,d,c,o)=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.42,metalness:.1,transparent:true,opacity:.8},o||{})));f.rotation.x=-Math.PI/2;f.receiveShadow=true;return f};
/* environments: bg, fog, hemisphere, key (casts the shadows), rim, point lights, softboxes for the reflection map, geometry */
const ENV={
 void:{bg:0x010203,fog:[0x010203,18,60],hs:0x6f7f95,hg:0x05070a,hp:.28,kc:0xfff1de,kp:2.1,kp3:[6,11,7],rc:0x5b86ff,rp:1.6,rp3:[-9,4,-8],pts:[[0xff7a44,5,[5,1.6,-6]]],
  soft:[[16,5,0,9,0,1.5707,0,[2.2,2.2,2.4]],[2,8,-9,4,-1,0,1.5707,[1.2,1.5,2.6]],[2,8,9,4,-1,0,1.5707,[2.2,1.4,.9]]],
  build(g){g.add(floor(80,80,0x0a0c10));}},
 neon:{bg:0x040208,fog:[0x0e0418,14,70],hs:0x4a2f78,hg:0x07040c,hp:.3,kc:0xff7ad8,kp:1.5,kp3:[7,9,5],rc:0x38e8ff,rp:2,rp3:[-9,4,-7],pts:[[0xff3fb0,16,[5,2.8,3]],[0x20e0ff,16,[-6,2.8,-3]]],
  soft:[[10,4,-9,5,0,0,1.5707,[.4,2.4,2.8]],[10,4,9,5,0,0,1.5707,[2.8,.5,2.2]],[14,4,0,9,0,1.5707,0,[.8,.8,1.2]]],
  build(g){g.add(floor(44,140,0x0a0912,{roughness:.22}));
   for(const s of[-1,1]){for(let i=0;i<10;i++){const h=8+(i*7%11),b=box([6,h,5],bm(0x0b0a14),s*13,h/2,-34+i*8,g);for(let k=0;k<4;k++)box([.12,.9,4.2],em(k%2?0xff3fb0:0x20e0ff,2.8),s*9.9,3+k*2.2+(i%3),-34+i*8,g)}box([.25,.05,120],em(s>0?0xff3fb0:0x20e0ff,3),s*4.9,.03,0,g)}
   for(let i=0;i<14;i++)box([.2,.04,2.6],em(0xdfe0ea,1.6),0,.03,-30+i*5,g)}},
 white:{bg:0xcfd4d8,fog:[0xcfd4d8,22,90],hs:0xffffff,hg:0x9aa0a6,hp:.9,kc:0xffffff,kp:2.6,kp3:[6,12,7],rc:0xd0e0ff,rp:.9,rp3:[-8,4,-7],pts:[],bl:.1,
  soft:[[30,14,0,12,0,1.5707,0,[2.4,2.4,2.5]],[10,6,-9,4,-3,0,1.5707,[1.6,1.7,1.8]],[10,6,9,4,3,0,1.5707,[1.4,1.4,1.5]]],
  build(g){g.add(floor(160,160,0xc2c7cc,{roughness:.32,opacity:.92}))}},
 dusk:{bg:0x070d1f,fog:[0x0a1430,22,120],hs:0x3a5a9a,hg:0x070a14,hp:.5,kc:0xaac4ff,kp:1.5,kp3:[-7,9,8],rc:0xff9a6a,rp:1.1,rp3:[8,3,-8],pts:[[0xffd2a0,12,[4,3,5]]],bl:.16,
  soft:[[24,8,0,10,0,1.5707,0,[.8,1.1,2]],[6,4,-9,3,-2,0,1.5707,[2.2,1.5,.8]],[6,4,9,3,2,0,1.5707,[1.2,1.3,2]]],
  build(g){g.add(floor(70,240,0x0d1018,{roughness:.32,opacity:.86}));for(const s of[-1,1])box([.18,.02,200],em(0xdfe0ea,1.1),s*5.6,.02,0,g);for(let i=0;i<24;i++)box([.18,.02,2.6],em(0xdfe0ea,1.1),0,.02,-60+i*6,g);
   const R2=((n)=>()=>(n=(n*16807)%2147483647)/2147483647)(7);for(let i=0;i<46;i++){const h=6+R2()*22,x=(R2()-.5)*150,z=-70-R2()*50,w=3+R2()*5;box([w,h,w],bm(0x0a0d16),x,h/2,z,g);for(let k=0;k<6;k++)box([.5,.5,.1],em(R2()<.6?0xffd9a0:0x9ac4ff,1.6),x+(R2()-.5)*w*.8,1+R2()*(h-2),z+w/2+.06,g)}}},
 redroom:{bg:0x050102,fog:[0x050102,14,52],hs:0x6a1a22,hg:0x050203,hp:.3,kc:0xffe6e0,kp:1.9,kp3:[6,10,6],rc:0xff2a3a,rp:2,rp3:[-8,3,-7],pts:[[0xff2038,12,[-5,1.5,-4]],[0xff2038,9,[6,1.5,-6]]],bl:.14,
  soft:[[16,5,0,9,0,1.5707,0,[2,1.6,1.6]],[3,8,-9,4,-2,0,1.5707,[2.6,.3,.4]],[3,8,9,4,-2,0,1.5707,[2.6,.3,.4]]],
  build(g){g.add(floor(70,70,0x0b0507,{roughness:.3,opacity:.82}));for(let i=-6;i<=6;i++)box([.12,7,.12],em(0xff2038,2.2),i*3,3.7,-15,g);box([40,.12,.12],em(0xff2038,2.2),0,.1,-15,g);box([40,.12,.12],em(0xff2038,2.2),0,7.2,-15,g)}},
 arctic:{bg:0xb9c9d3,fog:[0xc3d3dd,14,80],hs:0xeaf3fb,hg:0x6f808c,hp:.8,kc:0xfff6e6,kp:2.4,kp3:[-8,9,7],rc:0xaed0ff,rp:.8,rp3:[8,3,-6],pts:[],bl:.1,
  soft:[[30,12,0,12,0,1.5707,0,[2.2,2.4,2.8]],[12,5,-9,4,-3,0,1.5707,[1.4,1.5,1.8]]],
  build(g){g.add(floor(34,220,0x4f5a62,{roughness:.32,opacity:.9}));const sn=new THREE.Mesh(new THREE.PlaneGeometry(240,240),bm(0xd8e4ec));sn.rotation.x=-Math.PI/2;sn.position.y=-.03;sn.receiveShadow=true;g.add(sn);for(const s of[-1,1])box([.16,.02,200],em(0xffffff,1.1),s*5.4,.02,0,g);for(let i=0;i<22;i++)box([.16,.02,2.6],em(0xffffff,1.1),0,.02,-60+i*6,g);
   for(const s of[-1,1])for(let i=0;i<20;i++)box([2.6,.9+(i*3%5)*.15,5.4],bm(0xdfeaf1),s*(8.8+(i*7%3)*.4),.45,-70+i*8,g)}},
 dawn:{bg:0x9fb2bd,fog:[0xa9bcc6,12,85],hs:0xe6eef4,hg:0x4a5a52,hp:.8,kc:0xfff0d0,kp:2.4,kp3:[-7,10,8],rc:0xa8c8e0,rp:.8,rp3:[8,3,-6],pts:[],
  soft:[[30,12,0,12,0,1.5707,0,[2.6,2.8,3]],[12,5,-9,4,-3,0,1.5707,[1.4,1.5,1.7]]],
  build(g){g.add(floor(70,220,0x2a2e31,{roughness:.4,opacity:.88}));const gr=new THREE.Mesh(new THREE.PlaneGeometry(220,220),bm(0x2f4a30));gr.rotation.x=-Math.PI/2;gr.position.y=-.03;g.add(gr);for(let i=0;i<22;i++)box([.18,.02,2.6],em(0xdcd8c8,1.3),0,.02,-60+i*6,g)}},
 tunnel:{bg:0x030303,fog:[0x070503,8,50],hs:0x8a6a3a,hg:0x080604,hp:.3,kc:0xffb55a,kp:1.6,kp3:[3,6,6],rc:0xff8a2a,rp:1.5,rp3:[-4,3,-8],pts:[[0xff9a3a,22,[0,4.4,3]],[0xff9a3a,18,[0,4.4,-9]]],bl:.05,
  soft:[[12,2,0,8,0,1.5707,0,[3.2,1.7,.6]],[2,6,-8,3,0,0,1.5707,[2.4,1.2,.5]],[2,6,8,3,0,0,1.5707,[2.4,1.2,.5]]],
  build(g){g.add(floor(17,140,0x15130f,{roughness:.3,opacity:.84}));box([.6,8,140],bm(0x1c1a17),-8.3,4,0,g);box([.6,8,140],bm(0x1c1a17),8.3,4,0,g);box([17,.6,140],bm(0x1c1a17),0,8,0,g);
   for(let i=0;i<16;i++){box([2.4,.2,.5],em(0xffc070,1.5),0,7.6,-44+i*6,g);box([.3,.3,.8],em(0xffc070,1.3),-7.6,1.2,-44+i*6,g);box([.3,.3,.8],em(0xffc070,1.3),7.6,1.2,-44+i*6,g)}box([.2,.02,140],em(0xe8d8a0,1.3),-3.4,.02,0,g);box([.2,.02,140],em(0xe8d8a0,1.3),3.4,.02,0,g)}},
 /* sunset road: a painted gradient sky with a low sun and mesas in silhouette behind the cars */
 sunset:{bg:0xe0703a,fog:[0xe8804a,30,120],hs:0xff9a7a,hg:0x2a1426,hp:.5,kc:0xffa860,kp:1.6,kp3:[-6,6,-14],rc:0xffd0a0,rp:1.2,rp3:[9,5,9],pts:[],bl:.12,
  soft:[[30,6,0,3,-14,0,0,[1.6,.8,.4]],[24,8,0,10,0,1.5707,0,[1.4,.8,1]],[8,4,9,3,4,0,1.5707,[1.2,.9,1.1]]],
  build(g){g.add(floor(60,220,0x2a1820,{roughness:.28,opacity:.86}));for(const s of[-1,1])box([.18,.02,200],em(0xffe2c4,1.1),s*5.6,.02,0,g);for(let i=0;i<24;i++)box([.18,.02,2.6],em(0xffe2c4,1.1),0,.02,-60+i*6,g);
   const cv=document.createElement('canvas');cv.width=4;cv.height=256;const x=cv.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#120c30');gr.addColorStop(.35,'#5a1e5e');gr.addColorStop(.62,'#c8385a');gr.addColorStop(.82,'#ff6a30');gr.addColorStop(1,'#ffb050');x.fillStyle=gr;x.fillRect(0,0,4,256);
   const tx=new THREE.CanvasTexture(cv),mk=(m)=>{m.fog=false;return m};for(const [px,pz,ry] of[[0,-95,0],[-95,0,1.5707],[95,0,-1.5707],[0,95,3.1416]]){const sk=new THREE.Mesh(new THREE.PlaneGeometry(260,90),mk(new THREE.MeshBasicMaterial({map:tx})));sk.position.set(px,36,pz);sk.rotation.y=ry;g.add(sk)}
   const sun=new THREE.Mesh(new THREE.CircleGeometry(9,48),mk(new THREE.MeshBasicMaterial({color:hdr(0xffd890,1.25)})));sun.position.set(-10,6,-92);g.add(sun);
   const R2=((n)=>()=>(n=(n*16807)%2147483647)/2147483647)(11);for(let i=0;i<30;i++){const h=1+R2()*R2()*7,w=8+R2()*22,x2=(R2()-.5)*260,z=-84-R2()*6;const m=box([w,h,4],mk(new THREE.MeshBasicMaterial({color:0x2a0f2a})),x2,h/2-.3,z,g);m.receiveShadow=false;const m2=box([w,h,4],mk(new THREE.MeshBasicMaterial({color:0x2a0f2a})),z,h/2-.3,-x2,g);m2.rotation.y=1.5707;const m3=box([w,h,4],mk(new THREE.MeshBasicMaterial({color:0x2a0f2a})),x2,h/2-.3,-z,g)}}},
 /* pale studio: a warm cream cyclorama, soft light from above */
 pale:{bg:0xece6dc,fog:[0xece6dc,16,70],hs:0xfffaf0,hg:0xb4aa9c,hp:.95,kc:0xfff4e4,kp:2.3,kp3:[5,12,6],rc:0xf0e0c8,rp:.8,rp3:[-8,5,-7],pts:[],bl:.08,
  soft:[[30,14,0,12,0,1.5707,0,[2.5,2.4,2.2]],[10,6,-9,4,-3,0,1.5707,[1.8,1.7,1.5]],[10,6,9,4,3,0,1.5707,[1.5,1.4,1.3]]],
  build(g){g.add(floor(160,160,0xe2dacd,{roughness:.36,opacity:.94}))}},
 bunker:{bg:0x08090a,fog:[0x08090a,12,55],hs:0x9aa0a6,hg:0x101214,hp:.3,kc:0xfff4e6,kp:2.2,kp3:[3,9,6],rc:0xffb070,rp:1.2,rp3:[-8,3,-8],pts:[[0xffd9a0,14,[-5,3.6,2]]],
  soft:[[18,3,0,8.6,0,1.5707,0,[2.6,2.5,2.4]],[4,8,-13,4,0,0,0,[.5,.5,.55]]],
  build(g){g.add(floor(44,44,0x2a2c2e,{roughness:.4,opacity:.86}));box([44,9,.6],bm(0x2e3033),0,4.5,-15,g);box([.6,9,44],bm(0x26282a),-15,4.5,0,g);box([.6,9,44],bm(0x26282a),15,4.5,0,g);box([44,.6,44],bm(0x1a1b1d),0,9,0,g);
   for(let i=-2;i<=2;i++){box([.5,9,.5],bm(0x3a3c3f),i*6,4.5,-13,g);for(let k=0;k<5;k++)box([.52,.45,.52],bm(k%2?0xe0b020:0x15161a),i*6,.6+k*.9,-13,g);box([5,.1,.5],em(0xfff2d8,3),i*6,8.6,-3,g);box([5,.1,.5],em(0xfff2d8,3),i*6,8.6,5,g)}}}};
const envTex={};let PM=null;
function envMap(name){if(envTex[name])return envTex[name];PM=PM||new THREE.PMREMGenerator(R);const e=ENV[name],sc=new THREE.Scene();sc.background=new THREE.Color(e.hp>=.8?0x8a96a0:0x050608);
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
 key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0005;key.shadow.radius=4;{const sh=key.shadow.camera;sh.left=-16;sh.right=16;sh.top=16;sh.bottom=-16;sh.near=1;sh.far=60}sc.add(hemi,key,key.target,rim,p1,p2,env,cam);fade.renderOrder=999;fade.position.z=-.3;cam.add(fade);let curEnv=null,curCars=[],curBl=.2;
 return{sc,cam,fade,dirty:1,get bl(){return curBl},set(s){this.dirty=1;const e=ENV[s.env];curBl=e.bl||.2;if(curEnv!==s.env){env.clear();e.build(env);curEnv=s.env}
  sc.background=new THREE.Color(e.bg);sc.environment=envMap(s.env);sc.fog=new THREE.Fog(e.fog[0],e.fog[1],e.fog[2]);hemi.color.setHex(e.hs);hemi.groundColor.setHex(e.hg);hemi.intensity=e.hp*.6;key.color.setHex(e.kc);key.intensity=e.kp*.5;key.position.set(...e.kp3);rim.color.setHex(e.rc);rim.intensity=e.rp*.55;rim.position.set(...e.rp3);
  [p1,p2].forEach((p,i)=>{const q=e.pts[i];p.intensity=q?q[1]*.4:0;if(q){p.color.setHex(q[0]);p.position.set(...q[2])}});
  curCars.forEach(o=>sc.remove(o));curCars=[];let ok=true;s.cars.forEach((q,i)=>{const c=carById(q[0]),b=c&&build(sc,c.id);if(!b){if(i===0)ok=false;return}const o=b.g.clone(true);o.position.set(q[1],0,q[2]);o.rotation.y=(q[3]||0)*Math.PI/180;sc.add(o);curCars.push(o);const m=o.clone(true);m.scale.y=-1;m.traverse(q=>{if(q.isMesh){q.castShadow=false;q.receiveShadow=false}});sc.add(m);curCars.push(m)});return ok&&curCars.length>0}}}
/* the studio's own render path (MSAA, bloom, tone map, vignette) at native resolution */
const ST={on:false,last:0,sh:0},SCR=['menu','s8cards','s8quick','s8setup','s8career','s8res'];let POST=null;
function off(){if(!ST.on)return;ST.on=false;P.menuShadowHold=false;R.shadowMap.autoUpdate=true;R.toneMapping=ST.tm;R.shadowMap.enabled=ST.se;R.shadowMap.type=ST.st;$('c').style.imageRendering='';R.setRenderTarget(null);try{rs()}catch(e){}}
function draw(pt){if(!ST.on){ST.on=true;ST.sh=0;ST.last=0;ST.tm=R.toneMapping;ST.se=R.shadowMap.enabled;ST.st=R.shadowMap.type;R.toneMapping=THREE.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;$('c').style.imageRendering='auto'}
 const d=P.studioDPR?P.studioDPR():1;if(R.domElement.width!==Math.max(2,innerWidth*d|0)||R.domElement.height!==Math.max(2,innerHeight*d|0))P.sizeNative();if(!POST){POST=P.makePost();POST.bl.value=.2;POST.th.value=2.1}
 const W=R.domElement.width,H=R.domElement.height;R.setScissorTest(false);R.setViewport(0,0,W,H);/* the stills drift slowly: 30 frames a second is plenty, and the shadows only change when the shot does */
 const now=performance.now();if(now-ST.last<31&&!pt.dirty)return;ST.last=now;P.menuShadowHold=true;R.shadowMap.autoUpdate=false;if(pt.dirty||!ST.sh){R.shadowMap.needsUpdate=true;ST.sh=1;pt.dirty=0}
 POST.bl.value=pt.bl;POST.render(pt.sc,pt.cam);R.setRenderTarget(null)}
const sh0=show;show=function(n){if(ST.on&&SCR.indexOf(n)<0)off();return sh0.apply(this,arguments)};setInterval(()=>{if(ST.on&&SCR.indexOf(scr)<0)off()},200);
/* a shuffled run of stills, forever */
function menuScene2(){const pt=photo();let t0=performance.now()/1000,order=[],cur=null,shotT=0,last=-1;
 const DUR=7.4,FADE=.8;
 function next(n){n=n|0;if(!order.length){/* 0.02: the menus show only the studio sets (black void, white, pale), the backdrop the glossy black bars were made for */order=SH.map((_,i)=>i).filter(i=>['void','white','pale'].includes(SH[i].env));if(!order.length)order=SH.map((_,i)=>i);order.sort(()=>Math.random()-.5);if(order[0]===last)order.push(order.shift())}
  const k=order.shift(),s=SH[k];last=k;if(!pt.set(s)){if(n<SH.length)return next(n+1);cur=null;return}cur=s;shotT=0}
 const self={sc:pt.sc,cam:pt.cam,draw(){draw(pt)},
  tick(time){const now=performance.now()/1000,dt=Math.min(.1,now-t0);t0=now;const W=innerWidth,H=innerHeight;
   if(!cur){next();if(!cur)return}shotT+=dt;const u=cl(shotT/DUR,0,1),e=sm(u),A=cur.a,B=cur.b,c=pt.cam;
   c.position.set(A[0][0]+(B[0][0]-A[0][0])*e,A[0][1]+(B[0][1]-A[0][1])*e,A[0][2]+(B[0][2]-A[0][2])*e);
   c.lookAt(A[1][0]+(B[1][0]-A[1][0])*e,A[1][1]+(B[1][1]-A[1][1])*e,A[1][2]+(B[1][2]-A[1][2])*e);
   c.fov=cur.fov;c.aspect=W/H;c.updateProjectionMatrix();c.setViewOffset(W,H,0,0,W,H);
   pt.fade.material.opacity=shotT<FADE?1-sm(shotT/FADE):shotT>DUR-FADE?sm((shotT-(DUR-FADE))/FADE):0;pt.fade.scale.setScalar(Math.max(1,W/H)*2);
   if(shotT>=DUR)next()}};
 window.__cin={self,pt,SH,go(i){const s=SH[i];pt.set(s);cur=s;shotT=1.2;order=[]}};
 return self}

/* Brand Central: a one second fade up from black on the way in, a quick black dip on the way out */
(function(){const mk=(css)=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;width:100%;pointer-events:none;'+css;return d};
 let top=null,bot=null,line=null,dip=null,was=false;
 function ensure(){if(top)return;top=mk('top:0;height:50.2%;background:#000;z-index:99998;transform:translateY(-101%);will-change:transform');bot=mk('bottom:0;height:50.2%;background:#000;z-index:99998;transform:translateY(101%);will-change:transform');line=mk('top:50%;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);z-index:99999;opacity:0;box-shadow:0 0 22px 4px rgba(255,235,190,.6)');dip=mk('top:0;height:100%;background:#000;z-index:99997;opacity:0');document.body.append(top,bot,line,dip)}
 function open_(){ensure();dip.style.transition='none';dip.style.opacity=1;void dip.offsetWidth;setTimeout(()=>{dip.style.transition='opacity 1s ease';dip.style.opacity=0},60)}
 function dip_(){ensure();dip.style.transition='none';dip.style.opacity=1;void dip.offsetWidth;setTimeout(()=>{dip.style.transition='opacity .55s ease';dip.style.opacity=0},160)}
 new MutationObserver(()=>{const st=document.body.classList.contains('studio'),brand=st&&P.SR&&P.SR.kind==='brand';if(brand&&!was)open_();else if(!st&&was)dip_();was=brand}).observe(document.body,{attributes:true,attributeFilter:['class']})})();
menuScene=menuScene2;
})();
