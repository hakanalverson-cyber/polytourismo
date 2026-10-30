/* ===== Poly GT layer: promo art. The Quickplay / main menu action scenes on hand-built backdrops (painted sky, scenery, road, sun
   shadows), and the title stills that show the art as real objects: a magazine on a table, a TV in a living room, a game case on a
   shelf, a billboard in the city at night ===== */
(function promo(){
'use strict';
const P=window.PT8;if(!P)return;
const V3=THREE.Vector3,TAU=Math.PI*2;
let R=null;
function rdr(W,H){if(!R){R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.setPixelRatio(1);
 R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap}R.setSize(W,H,false);return R}
const cnv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const rng=s=>{s=Math.abs(Math.round(s))%2147483646+1;return ()=>(s=(s*16807)%2147483647)/2147483647};
const tex=(c,rep)=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t};
const mat=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.85,metalness:0,flatShading:true},o));
const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
const shadowy=o=>{o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o};

/* ---- the cars: real models, front wheels turned straight (the models come steered), facing +z, wheels on y=0 ---- */
const WFX=new WeakMap();
function straightWheels(model){model.updateMatrixWorld(true);model.traverse(o=>{if(!o.isMesh||!/tire/i.test(o.name))return;
 const M=o.matrixWorld,key=M.elements.map(v=>v.toFixed(3)).join(',');let by=WFX.get(o.geometry);if(!by)WFX.set(o.geometry,by=new Map());let g=by.get(key);
 if(!g){g=o.geometry.clone();const pa=g.attributes.position,na=g.attributes.normal,Mi=new THREE.Matrix4().copy(M).invert(),v=new V3(),n=new V3(),W=[];
  for(let i=0;i<pa.count;i++)W.push(v.fromBufferAttribute(pa,i).applyMatrix4(M).clone());
  const bb=new THREE.Box3().setFromPoints(W),c=bb.getCenter(new V3()),sz=bb.getSize(new V3()),lz=sz.z>=sz.x,cl={};
  W.forEach((p,i)=>{const k=((lz?p.z:p.x)>(lz?c.z:c.x)?1:0)+((lz?p.x:p.z)>(lz?c.x:c.z)?2:0);(cl[k]=cl[k]||[]).push(i)});
  for(const k in cl){const q=cl[k];let mx=0,mz=0;q.forEach(i=>{mx+=W[i].x;mz+=W[i].z});mx/=q.length;mz/=q.length;let sxx=0,szz=0,sxz=0;
   q.forEach(i=>{const dx=W[i].x-mx,dz=W[i].z-mz;sxx+=dx*dx;szz+=dz*dz;sxz+=dx*dz});const a=.5*Math.atan2(2*sxz,sxx-szz),t0=lz?Math.PI/2:0;
   let ph=t0-a;while(ph>Math.PI/2)ph-=Math.PI;while(ph<-Math.PI/2)ph+=Math.PI;if(Math.abs(ph)<.03)continue;const cs=Math.cos(ph),sn=Math.sin(ph);
   for(const i of q){const p=W[i],dx=p.x-mx,dz=p.z-mz;v.set(mx+dx*cs-dz*sn,p.y,mz+dx*sn+dz*cs).applyMatrix4(Mi);pa.setXYZ(i,v.x,v.y,v.z);
    if(na){n.fromBufferAttribute(na,i).transformDirection(M);n.set(n.x*cs-n.z*sn,n.y,n.x*sn+n.z*cs).transformDirection(Mi);na.setXYZ(i,n.x,n.y,n.z)}}}
  pa.needsUpdate=true;if(na)na.needsUpdate=true;g.computeBoundingSphere();by.set(key,g)}
 o.geometry=g})}
P.straightWheels=straightWheels;
const FWD=1;/* +1: the models face +z after the turn below */
function car(id,fade,straight){const src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[P.modelOf(id,0)];if(!src)return null;
 const model=src.clone(true);if(straight!==false)straightWheels(model);const g=new THREE.Group(),c=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);c.add(ctd);g.add(c);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new V3()),ct=bb.getCenter(new V3()),s=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);c.scale.setScalar(s);c.rotation.y=(sz.x>sz.z?Math.PI/2:0)+Math.PI;
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(fade){const f=m=>{const q=m.clone();q.transparent=true;q.opacity=fade;q.depthWrite=false;return q};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}});
 /* a soft contact shadow under the car (sun shadows do the rest) */
 const sh=cnv(128,128),sg=sh.getContext('2d'),gr=sg.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');sg.fillStyle=gr;sg.fillRect(0,0,128,128);
 const cs=new THREE.Mesh(new THREE.PlaneGeometry(2.6,5.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sh),transparent:true,depthWrite:false,opacity:fade?fade*.6:.85}));cs.rotation.x=-Math.PI/2;cs.position.y=.02;cs.userData.contact=1;g.add(cs);
 g.userData.len=s*Math.max(sz.x,sz.z);return g}

/* ---- painted skies: a gradient, the sun and its glow, cumulus clouds (flat bases, lit tops) or stars, behind the 3D at its horizon ---- */
function paintSky(W,H,hy,E){const c=cnv(W,H),g=c.getContext('2d'),r=rng(E.seed||7);
 let gr=g.createLinearGradient(0,0,0,hy);E.sky.forEach((s,i)=>gr.addColorStop(i/(E.sky.length-1),s));g.fillStyle=gr;g.fillRect(0,0,W,Math.max(1,hy));g.fillStyle=E.sky[E.sky.length-1];g.fillRect(0,hy,W,H-hy);
 if(E.stars){g.fillStyle='#fff';for(let i=0;i<320;i++){const y=r()*hy*.85;g.globalAlpha=(.2+.8*r())*(1-y/hy*.7);const z=r()<.08?2:1;g.fillRect(r()*W,y,z,z)}g.globalAlpha=1}
 if(E.sun){const [sx,sy,rad,col]=E.sun,x=sx*W,y=hy-sy*H;for(const [k,a] of [[14,.16],[6,.26],[2.4,.5]]){const q=g.createRadialGradient(x,y,0,x,y,rad*H*k);q.addColorStop(0,col+Math.round(a*255).toString(16).padStart(2,'0'));q.addColorStop(1,col+'00');g.fillStyle=q;g.fillRect(0,0,W,H)}
  g.fillStyle=E.sunCore||'#fffbe8';g.beginPath();g.arc(x,y,rad*H,0,TAU);g.fill()}
 if(E.moon){const [mx,my,mr]=E.moon,x=mx*W,y=hy-my*H;const q=g.createRadialGradient(x,y,0,x,y,mr*H*8);q.addColorStop(0,'rgba(200,215,255,.3)');q.addColorStop(1,'rgba(200,215,255,0)');g.fillStyle=q;g.fillRect(0,0,W,H);g.fillStyle='#eef2ff';g.beginPath();g.arc(x,y,mr*H,0,TAU);g.fill()}
 if(E.clouds){const [top,base,n]=E.clouds,cl=cnv(W,H),q=cl.getContext('2d');
  for(let i=0;i<n;i++){const t=Math.pow(r(),.8),y=hy*(.12+.72*t),sz=W*(.16-.11*t)*(.7+.6*r()),x=r()*(W+sz)-sz/2,k=12+(r()*10|0);
   const pts=[];for(let j=0;j<k;j++){const u=j/(k-1),rr=sz*.13*(.45+Math.sin(u*Math.PI)*1.1)*(.6+.8*r());pts.push([x+(u-.5)*sz+(r()-.5)*sz*.05,y-rr*(.35+.4*r()),rr])}
   for(const [px,py,rr] of pts){const s=q.createLinearGradient(0,py-rr,0,py+rr);s.addColorStop(0,top);s.addColorStop(1,base);q.fillStyle=s;q.beginPath();q.arc(px,py,rr,0,TAU);q.fill()}
   q.save();q.globalCompositeOperation='destination-out';const cut=q.createLinearGradient(0,y-sz*.03,0,y+sz*.06);cut.addColorStop(0,'rgba(0,0,0,0)');cut.addColorStop(1,'rgba(0,0,0,1)');q.fillStyle=cut;q.fillRect(x-sz,y-sz*.03,sz*2,sz*.5);q.restore()}
  g.globalAlpha=E.cloudA||.9;g.filter='blur('+Math.max(1,W/700)+'px)';g.drawImage(cl,0,0);g.filter='none';g.globalAlpha=1}
 if(E.streaks){for(let i=0;i<E.streaks;i++){const y=hy*(.45+.5*r()),w=W*(.3+.5*r()),x=r()*W-w/2,h=H*(.006+.01*r());const q=g.createLinearGradient(x,0,x+w,0);q.addColorStop(0,E.streakC+'00');q.addColorStop(.5,E.streakC+'99');q.addColorStop(1,E.streakC+'00');g.fillStyle=q;g.fillRect(x,y,w,h)}}
 gr=g.createLinearGradient(0,hy-H*.14,0,hy+2);gr.addColorStop(0,E.fog+'00');gr.addColorStop(1,E.fog+'ff');g.fillStyle=gr;g.fillRect(0,hy-H*.14,W,H*.14+2);
 return c}
/* ---- the road's line: it climbs, dips and bends (cx: sideways, cy: height, both 0 with a level heading at z=0 where the cars are).
   Everything is laid out along a straight road first and then bent onto this line, so the scenery, the hills and the cars all follow it ---- */
function roadLine(o,E){o=o||{};const A=o.A||0,L=o.L||300,ph=o.ph||0,G=o.G||0,cA=o.cA||0,cL=o.cL||400,K=TAU/L,cK=TAU/cL,b=o.base||0,
 cy=z=>b+A*(Math.sin(z*K+ph)-Math.sin(ph))+G*z-A*K*Math.cos(ph)*z*(o.lev?1:0),dy=z=>A*K*Math.cos(z*K+ph)+G-(o.lev?A*K*Math.cos(ph):0),
 cx=z=>cA*(1-Math.cos(z*cK)),dx=z=>cA*cK*Math.sin(z*cK),edge=E.edge||10,
 /* towards the sea the land comes down from the road to the water: cliffs */wy=(x,z)=>E.sea&&Math.sign(x)===E.sea?cy(z)*(1-sstep(0,70,Math.abs(x)-edge)):cy(z);
 return {cx,cy,dx,dy,wy,flat:!A&&!G&&!cA&&!b,
  at:(x,y,z)=>new V3(x+cx(z),y+wy(x,z),z),
  /* a car (or anything that follows the road) at z: turned along the bend and pitched with the slope */
  orient:(o3,z,pitch)=>{o3.rotation.order='YXZ';o3.rotation.y+=Math.atan(dx(z));if(pitch!==false)o3.rotation.x=-Math.atan(dy(z))}}}
/* ---- terrain: low-poly hills that rise away from the road, mountains in the distance, coloured by height ---- */
function noise2(seed){const r=rng(seed),N=256,p=new Float32Array(N*N);for(let i=0;i<N*N;i++)p[i]=r();const s=t=>t*t*(3-2*t);
 const n=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=s(x-xi),fy=s(y-yi),A=p[((yi&255)*N+(xi&255))],B=p[((yi&255)*N+((xi+1)&255))],C=p[(((yi+1)&255)*N+(xi&255))],D=p[(((yi+1)&255)*N+((xi+1)&255))];return A+(B-A)*fx+(C-A)*fy+(A-B-C+D)*fx*fy};
 return (x,y)=>(n(x,y)*.55+n(x*2.1,y*2.1)*.28+n(x*4.3,y*4.3)*.17)}
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function makeHeight(E,seed){const f=noise2(seed),edge=E.edge||10;
 return (x,z)=>{const d=Math.abs(x)-edge;if(d<0)return -.02;if(E.sea&&Math.sign(x)===E.sea)return d<6?-d*.02:-.12-(d-6)*.05;
  const near=(E.hill||8)*sstep(0,45,d)*(f(x/70+3,z/70)*1.2-.15),far=(E.mount||0)*sstep(120,700,d+Math.max(0,-z-200)*.5)*Math.pow(f(x/260+9,z/260),1.6)*1.6;return Math.max(-.02,near+far)}}
function terrain(E,hAt,seed,RL){const geo=new THREE.PlaneGeometry(2400,2400,200,200);geo.rotateX(-Math.PI/2);geo.translate(0,0,-900);const pa=geo.attributes.position,col=[],f=noise2(seed+5);
 const C=E.tc.map(c=>new THREE.Color(c)),snow=new THREE.Color(E.snow||'#ffffff'),sand=new THREE.Color(E.sand||'#e6d3a3'),q=new THREE.Color();
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=hAt(x,z);pa.setY(i,h+RL.wy(x,z));pa.setX(i,x+RL.cx(z));const n=f(x/30,z/30);
  q.copy(C[0]).lerp(C[1],Math.min(1,n*1.3));if(h>(E.rockH||40))q.lerp(C[2],Math.min(1,(h-(E.rockH||40))/30));if(E.snowH&&h>E.snowH+f(x/40,z/40)*30)q.copy(snow);
  if(E.sea&&Math.sign(x)===E.sea&&Math.abs(x)-(E.edge||10)<14)q.copy(sand);col.push(q.r,q.g,q.b)}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));m.receiveShadow=true;return m}
/* ---- scenery pieces ---- */
const GEO={};
function pine(m1,m2,h){const g=new THREE.Group(),t=new THREE.Mesh(GEO.trunk||(GEO.trunk=new THREE.CylinderGeometry(.18,.26,1.6,6)),m2);t.position.y=.8;g.add(t);
 for(let i=0;i<3;i++){const c=new THREE.Mesh(GEO['c'+i]||(GEO['c'+i]=new THREE.ConeGeometry(1.9-i*.45,2.6,7)),m1);c.position.y=1.9+i*1.25;g.add(c)}g.scale.setScalar(h/5.4);return g}
function palm(m1,m2,h,r){const g=new THREE.Group();let x=0,y=0,lean=.06+r()*.12;for(let i=0;i<7;i++){const s=new THREE.Mesh(GEO.pt||(GEO.pt=new THREE.CylinderGeometry(.16,.2,1.05,6)),m2);s.position.set(x,y+.5,0);s.rotation.z=-lean*i*.7;g.add(s);x+=Math.sin(lean*i*.7)*1;y+=Math.cos(lean*i*.7)*1}
 for(let i=0;i<7;i++){const f=new THREE.Mesh(GEO.pf||(GEO.pf=new THREE.ConeGeometry(.35,3.2,4)),m1);f.position.set(x,y,0);f.rotation.set(0,i/7*TAU,1.75);f.translateY(1.3);g.add(f)}g.scale.setScalar(h/7);return g}
function rock(m,s,r){const k=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),m);k.scale.set(s*(.8+r()*.6),s*(.5+r()*.7),s*(.8+r()*.6));k.rotation.set(r()*3,r()*3,r()*3);return k}
function mesa(m,w,h,d){const g=new THREE.CylinderGeometry(w*.8,w,h,7,1);const k=new THREE.Mesh(g,m);k.scale.z=d/w;k.position.y=h/2;return k}
function peak(m,ms,h,r){const g=new THREE.Group(),c=new THREE.Mesh(new THREE.ConeGeometry(h*.9,h,6+(r()*3|0)),m);c.position.y=h/2;g.add(c);const s=new THREE.Mesh(new THREE.ConeGeometry(h*.9*.32,h*.32,6),ms);s.position.y=h-h*.16+.01;g.add(s);g.rotation.y=r()*3;return g}
function lamp(mp,me,night){const g=new THREE.Group(),p=box(.18,7,.18,mp);p.position.y=3.5;g.add(p);const a=box(2.2,.14,.14,mp);a.position.set(-1,7,0);g.add(a);const l=box(.7,.12,.3,me);l.position.set(-2,6.92,0);g.add(l);
 if(night){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd9a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(5,5,1);sp.position.set(-2,6.8,0);g.add(sp)}return g}
let GLOW=null;function glowTex(){if(GLOW)return GLOW;const c=cnv(64,64),g=c.getContext('2d'),q=g.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.25,'rgba(255,255,255,.45)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,64,64);return GLOW=new THREE.CanvasTexture(c)}
function windows(seed,lit,base,day){const c=cnv(128,256),g=c.getContext('2d'),r=rng(seed);g.fillStyle=base;g.fillRect(0,0,128,256);for(let y=8;y<250;y+=12)for(let x=6;x<124;x+=10){g.fillStyle=day?(r()<.5?'#b8d0e6':'#8aa6c2'):r()<lit?(r()<.5?'#ffd98a':'#bfe3ff'):'rgba(0,0,0,.35)';g.fillRect(x,y,6,7)}return tex(c)}
function asphalt(E){const c=cnv(512,1024),g=c.getContext('2d'),r=rng(3);g.fillStyle=E.road;g.fillRect(0,0,512,1024);
 for(let i=0;i<9000;i++){const v=r();g.fillStyle=v<.5?'rgba(0,0,0,.10)':'rgba(255,255,255,.06)';g.fillRect(r()*512,r()*1024,1+r()*2,1+r()*2)}
 g.fillStyle='rgba(255,255,255,.92)';g.fillRect(14,0,10,1024);g.fillRect(488,0,10,1024);
 if(E.lanes)for(const x of E.lanes)for(let y=0;y<1024;y+=256)g.fillRect(x-5,y,10,140);
 if(E.kerb){for(let y=0;y<1024;y+=64){g.fillStyle=(y/64)%2?'#d6202c':'#f4f4f4';g.fillRect(0,y,12,64);g.fillRect(500,y,12,64)}}
 if(E.wet){const q=g.createLinearGradient(0,0,512,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(120,160,255,.08)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,512,1024)}
 return tex(c,[1,40])}

/* ---- the backdrops ---- */
const CU=(t,b,n)=>[t,b,n];
const ENV={
 /* Quickplay */
 dusk:{sky:['#1d2f66','#6a4c8c','#e5795a','#ffb46a','#ffd59a'],fog:'#ffc890',sun:[.5,.035,.03,'#ffd59a'],sunCore:'#fff4d8',clouds:CU('#ffd9b8','#b0607a',7),streaks:5,streakC:'#ffb08a',
  road:'#34353d',tc:['#4f6e34','#6c8a3e','#7a6a5a'],hill:10,mount:120,rockH:50,lanes:[],kerb:1,light:[0xffc58a,1.7,[0,8,-40]],hemi:[0xffd2a8,0x3a3a60,.65],fogN:120,fogF:1500,props:'circuit'},
 coast:{sky:['#1f63c6','#3f8fe2','#86c3f2','#d8eefb'],fog:'#d4ebf8',sun:[.82,.5,.018,'#ffffff'],clouds:CU('#ffffff','#b9cde0',8),road:'#3f4148',tc:['#5f8a3a','#7aa04a','#8a7a62'],hill:14,mount:90,rockH:40,sea:1,lanes:[256],
  light:[0xfff1dc,1.7,[30,40,20]],hemi:[0xcfe6ff,0x7a6a50,.8],fogN:160,fogF:1800,props:'coast'},
 desert:{sky:['#2f6ac0','#6aa4e0','#e9c99a','#f5d4a6'],fog:'#f0cfa0',sun:[.18,.3,.02,'#fff1d4'],clouds:CU('#fff6ea','#e0b48a',4),road:'#4a4542',tc:['#cf8a50','#dc9c62','#a85a32'],hill:6,mount:160,rockH:25,lanes:[256],
  light:[0xffdcb4,1.8,[-30,30,10]],hemi:[0xe6efff,0x9a5a35,.7],fogN:150,fogF:1700,props:'desert'},
 night:{sky:['#03050c','#0a1230','#1f2a5a','#3a3266'],fog:'#2e2b4e',stars:1,moon:[.82,.42,.016],road:'#1b1d24',tc:['#14161c','#1a1d24','#22252c'],hill:4,mount:0,lanes:[171,341],
  light:[0x9bb4ff,.5,[20,30,10]],hemi:[0x5a6ab0,0x0c0e16,.5],fogN:120,fogF:1200,props:'city',night:1},
 neon:{sky:['#05030c','#140b30','#3a1760','#93357a'],fog:'#5a245e',stars:1,road:'#16141d',tc:['#100e16','#14111c','#1a1622'],hill:2,mount:0,lanes:[256],wet:1,
  light:[0xc0a0ff,.45,[10,30,-20]],hemi:[0x8060c0,0x100818,.5],fogN:80,fogF:900,props:'neon',night:1},
 /* main menu */
 alpine:{sky:['#1554b8','#3f86dc','#9cc8f2','#e2f0fb'],fog:'#d8e8f5',sun:[.22,.5,.016,'#ffffff'],clouds:CU('#ffffff','#c2d2e2',6),road:'#3d4047',tc:['#4c6a4a','#5f7d52','#6e7884'],hill:18,mount:260,rockH:45,snowH:70,lanes:[256],
  light:[0xffffff,1.7,[-25,40,25]],hemi:[0xdfefff,0x8a98a8,.8],fogN:180,fogF:2000,props:'alpine'},
 harbour:{sky:['#2a5fb4','#5f98da','#bcd9f2','#eef5fb'],fog:'#e2ecf5',sun:[.7,.5,.016,'#ffffff'],clouds:CU('#ffffff','#bfcfdf',9),road:'#3a3d45',tc:['#8f969e','#9da4ac','#7a8088'],hill:2,mount:60,rockH:30,sea:-1,lanes:[256],
  light:[0xfff0d8,1.7,[25,35,-15]],hemi:[0xd4e6ff,0x5a6068,.8],fogN:160,fogF:1800,props:'harbour'},
 golden:{sky:['#41629e','#b88a86','#f2ac64','#ffd59a'],fog:'#f1cb94',sun:[.14,.07,.028,'#ffe0a4'],clouds:CU('#ffe4c4','#c07a6a',6),streaks:4,streakC:'#ffc49a',road:'#3c3c42',tc:['#6e8a34','#8aa040','#6a5a40'],hill:16,mount:140,rockH:60,lanes:[256],
  light:[0xffcf94,1.7,[-40,9,-10]],hemi:[0xffdcb0,0x4a4a3a,.65],fogN:140,fogF:1600,props:'forest'},
 autumn:{sky:['#4a72b0','#88aedb','#d6e2ee','#eef1f2'],fog:'#e7e4dc',sun:[.65,.4,.016,'#fffaf0'],clouds:CU('#ffffff','#c8cdd4',10),road:'#3e3e44',tc:['#8a7a3a','#a06a2e','#6a5a48'],hill:20,mount:150,rockH:55,lanes:[256],
  light:[0xfff0dc,1.6,[30,30,20]],hemi:[0xe8eef8,0x5a4a3a,.75],fogN:150,fogF:1700,props:'autumn'},
 dawn:{sky:['#3a5aa0','#a07ab0','#f2a2a8','#ffd2bc'],fog:'#f6c8b8',sun:[.62,.02,.026,'#ffe2cc'],sunCore:'#fff6ee',clouds:CU('#ffe0e6','#b07a9a',6),streaks:6,streakC:'#ffc0c0',road:'#3d3c44',tc:['#5a7a4a','#6f8a5a','#8a7a6a'],hill:10,mount:100,rockH:45,sea:1,lanes:[256],
  light:[0xffd2c0,1.5,[10,6,-40]],hemi:[0xffd8e0,0x40405a,.7],fogN:140,fogF:1600,props:'coast'},
 moon:{sky:['#02040a','#08122a','#16264a','#2a3a5e'],fog:'#24304c',stars:1,moon:[.25,.5,.02],road:'#22232a',tc:['#2a2420','#3a2e26','#1e1a18'],hill:6,mount:140,rockH:25,lanes:[256],
  light:[0xa8bcff,1.1,[-30,30,10]],hemi:[0x7a8ac0,0x241c16,.85],fogN:140,fogF:1500,props:'desert',night:1},
 city:{sky:['#2b62b8','#5f97d8','#b8d4ee','#e6eef6'],fog:'#dde6ee',sun:[.8,.55,.016,'#ffffff'],clouds:CU('#ffffff','#c4d0dc',7),road:'#3a3c43',tc:['#7a8088','#8a9098','#6a7078'],hill:2,mount:0,lanes:[171,341],
  light:[0xfff4e0,1.7,[30,40,10]],hemi:[0xd8e8ff,0x60666e,.8],fogN:140,fogF:1500,props:'cityday'},
 /* Quickplay, second pictures */
 grid:{sky:['#1a5cc4','#3f8ae0','#94c4f0','#dcecf8'],fog:'#d6e6f2',sun:[.3,.55,.016,'#ffffff'],clouds:CU('#ffffff','#b8c8da',7),road:'#36373e',tc:['#4f7a34','#64903e','#7a7060'],hill:8,mount:80,rockH:50,lanes:[],kerb:1,
  light:[0xfff4e2,1.8,[-30,40,15]],hemi:[0xd4e8ff,0x5a5a48,.8],fogN:160,fogF:1800,props:'circuit'},
 pass:{sky:['#22305e','#5a5a96','#d98a7a','#ffc49a'],fog:'#e8b8a0',sun:[.78,.04,.024,'#ffd6a8'],clouds:CU('#ffd2c0','#8a5a7a',5),streaks:4,streakC:'#ffb89a',road:'#38383f',tc:['#3f5a40','#4f6a48','#6a6670'],hill:22,mount:280,rockH:40,snowH:75,snow:'#ffe8e0',lanes:[256],
  light:[0xffc8a0,1.6,[35,8,-30]],hemi:[0xd8c0d8,0x2a2a40,.65],fogN:160,fogF:1900,props:'alpine'},
 redrock:{sky:['#28346e','#8a4a78','#e8784a','#ffb870'],fog:'#f2a070',sun:[.4,.03,.03,'#ffd090'],sunCore:'#fff0d0',clouds:CU('#ffc8a0','#9a4a5a',5),streaks:6,streakC:'#ffa070',road:'#3c3434',tc:['#a8502a','#bc6434','#7a3420'],hill:6,mount:170,rockH:25,lanes:[256],
  light:[0xffb070,1.7,[5,6,-40]],hemi:[0xffc0a0,0x40202a,.6],fogN:140,fogF:1700,props:'desert'},
 rush:{sky:['#101a3e','#3a3a7a','#b0607a','#f09a70'],fog:'#a0607a',stars:1,road:'#24252c',tc:['#1a1c22','#20232a','#2a2d34'],hill:3,mount:0,lanes:[171,341],
  light:[0xffb890,.7,[-10,6,-40]],hemi:[0x8a7ab8,0x18141c,.6],fogN:120,fogF:1300,props:'city',night:1},
 floods:{sky:['#02040c','#081232','#142050','#26306a'],fog:'#1e2448',stars:1,road:'#1a1b20',tc:['#14201a','#18261e','#202624'],hill:6,mount:60,rockH:50,lanes:[],kerb:1,wet:1,
  light:[0xd0dcff,.6,[15,30,10]],hemi:[0x5a6aa0,0x0a0c12,.55],fogN:100,fogF:1100,props:'circuit',night:1},
 /* main menu, more */
 snow:{sky:['#4a7cc4','#8ab4e4','#cfe2f4','#f2f6fa'],fog:'#e8eef4',sun:[.7,.4,.016,'#ffffff'],clouds:CU('#ffffff','#c8d4e0',6),road:'#44474e',tc:['#e8eef4','#f4f7fa','#9aa4b0'],hill:16,mount:240,rockH:60,snowH:40,lanes:[256],leaf:[0x1f4a32,0x2a5a3a,0x1a3f2c],
  light:[0xfff6ec,1.5,[25,30,20]],hemi:[0xe8f2ff,0xb0b8c4,.9],fogN:160,fogF:1800,props:'alpine'},
 tropic:{sky:['#2a2462','#8a3a7a','#f0704a','#ffc070'],fog:'#f4a070',sun:[.3,.02,.034,'#ffd090'],sunCore:'#fff2d0',clouds:CU('#ffb890','#7a3a6a',6),streaks:7,streakC:'#ff9a6a',road:'#3a3436',tc:['#3a5a2a','#4a6a30','#6a5a40'],hill:10,mount:80,rockH:40,sea:-1,seaC:0x6a4a8a,lanes:[256],
  light:[0xffa070,1.5,[-10,5,-40]],hemi:[0xffb0a0,0x302040,.65],fogN:140,fogF:1600,props:'coast'},
 fields:{sky:['#1858c0','#3a88e0','#8cc4f2','#e4f2fb'],fog:'#dcecf6',sun:[.15,.55,.016,'#ffffff'],clouds:CU('#ffffff','#b4c8dc',11),road:'#3c3e44',tc:['#6aa03a','#86b444','#9a8a5a'],hill:14,mount:60,rockH:70,lanes:[256],leaf:[0x3a7a32,0x4f9a3a,0x2f6a2c],
  light:[0xfff4e0,1.8,[-30,40,10]],hemi:[0xd8ecff,0x5a6a3a,.8],fogN:180,fogF:2000,props:'forest'},
 fjord:{sky:['#30508a','#6a8ab8','#b8c8d8','#e0e6ea'],fog:'#d0d8e0',clouds:CU('#f4f6f8','#9aa8b8',9),road:'#3a3d44',tc:['#3a5a40','#4a6a4a','#6a7078'],hill:26,mount:300,rockH:35,snowH:110,sea:-1,seaC:0x2a4a6a,lanes:[256],
  light:[0xf4f0ea,1.3,[20,30,-20]],hemi:[0xd0dcea,0x40484e,.85],fogN:170,fogF:1900,props:'alpine'},
 storm:{sky:['#3a4048','#596068','#7c848c','#9aa2a8'],fog:'#8e969c',clouds:CU('#9aa2aa','#4a5058',14),cloudA:.85,road:'#2a2c30',tc:['#3f5a38','#4f6a44','#5a5e62'],hill:14,mount:120,rockH:50,lanes:[256],wet:1,
  light:[0xd8e0e8,.9,[10,40,10]],hemi:[0xb0b8c0,0x30343a,.9],fogN:80,fogF:900,props:'forest'}};
function scenery(sc,E,hAt,seed,RL){const r=rng(seed||11),L=E.props,side=()=>r()<.5?-1:1,
 add=(o,x,z,s,fol)=>{o.position.y+=hAt(x,z)+RL.wy(x,z);o.position.x=x+RL.cx(z);o.position.z=z;if(fol)RL.orient(o,z,fol!==2);if(s)o.scale.multiplyScalar(s);shadowy(o);sc.add(o);return o},
 okSide=x=>!(E.sea&&Math.sign(x)===E.sea);
 const leaf=E.leaf||[0x2f6a3a,0x3f8a46,0x285a32],LM=leaf.map(c=>mat({color:c})),bark=mat({color:0x5a3e2a}),grey=mat({color:0x9aa0a8,metalness:.3,roughness:.5}),lampE=new THREE.MeshBasicMaterial({color:0xfff2c8});
 const trees=(n,x0,x1,z0,z1,kind)=>{for(let i=0;i<n;i++){let x=side()*(x0+r()*(x1-x0));if(!okSide(x))x=-x;const z=z0+r()*(z1-z0);
   const t=kind==='palm'?palm(mat({color:0x2f8a3a}),mat({color:0x8a6a45}),7+r()*5,r):kind==='round'?roundTree(LM[i%LM.length],bark,5+r()*5,r):pine(LM[i%LM.length],bark,6+r()*10);add(t,x,z)}};
 const rail=(x)=>{for(let z=-600;z<40;z+=4){const p=box(.12,.75,.12,grey);p.position.y=.37;add(p,x,z,0,2);const b=box(.06,.3,4.04,grey);b.position.y=.62;add(b,x,z+2,0,1)}};
 if(L==='circuit'){for(const x of [-9.4,9.4]){for(let z=-700;z<40;z+=10){const w=box(.4,1,10.05,mat({color:0xe6e9ee}));w.position.y=.5;add(w,x,z+5,0,1)}}
  for(let z=-600;z<0;z+=70){for(const sx of [-1,1]){const st=new THREE.Group(),b=box(14,6,46,mat({color:0x7a828e}));b.position.y=3;b.rotation.z=sx*.14;st.add(b);
    const c=box(13.8,.2,45,new THREE.MeshStandardMaterial({map:crowd(z),roughness:1}));c.position.set(0,6.1,0);c.rotation.z=sx*.14;st.add(c);const rf=box(15,.5,48,mat({color:0xf0f2f4}));rf.position.set(sx*1.5,10,0);st.add(rf);add(st,sx*36,z,0,1)}}
  for(let z=-400;z<0;z+=36){const b=box(.3,2.6,6,new THREE.MeshStandardMaterial({map:adBoard(z),roughness:.6}));b.position.y=1.3;add(b,side()*11,z,0,2)}
  const gan=new THREE.Group(),gm=mat({color:0x2a2e36});for(const x of [-10,10]){const p=box(.6,8,.6,gm);p.position.set(x,4,0);gan.add(p)}const tb=box(21,1.6,.8,new THREE.MeshStandardMaterial({map:adBoard(1,1),roughness:.5}));tb.position.y=8;gan.add(tb);add(gan,0,-70,0,2);
  if(E.night)for(let z=-500;z<40;z+=40)for(const sx of [-1,1]){const l=lamp(grey,lampE,1);if(sx<0)l.rotation.y=Math.PI;add(l,sx*10.6,z,0,2)}
  trees(160,40,140,-800,0)}
 if(L==='coast'){rail(E.sea*8.4);trees(80,11,70,-700,30,'palm');for(let i=0;i<40;i++)add(palm(mat({color:0x2f8a3a}),mat({color:0x8a6a45}),6+r()*5,r),E.sea*(11+r()*9),-r()*400+30);
  for(let i=0;i<7;i++){const k=peak(mat({color:0x4f7a4a}),mat({color:0x6f9a5a}),40+r()*70,r);k.position.y=-2;add(k,E.sea*(300+r()*700),-200-r()*900)}for(let i=0;i<20;i++){const x=-E.sea*(12+r()*50);add(rock(mat({color:0x8a7a62}),1+r()*3,r),x,-r()*600)}
  for(let i=0;i<6;i++){const y=box(2.6,.8,6,mat({color:0xffffff}));const xx=E.sea*(120+r()*400);y.position.y=-.2;add(y,xx,-200-r()*800)}}
 if(L==='desert'){const rk=[0xb86a3a,0xc67a45,0xa0522d];for(let i=0;i<36;i++){const m=mesa(mat({color:rk[i%3]}),18+r()*40,30+r()*90,18+r()*40);add(m,side()*(50+r()*350),-80-r()*900)}
  for(let i=0;i<80;i++)add(rock(mat({color:rk[i%3]}),.5+r()*2.2,r),side()*(10+r()*50),-r()*500+20);
  for(let i=0;i<50;i++){const c=new THREE.Group(),m=mat({color:0x4f7a3a}),b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.35,3.4,7),m);b.position.y=1.7;c.add(b);for(const sx of [-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.18,.2,1.3,6),m);a.position.set(sx*.55,2+r(),0);c.add(a)}add(c,side()*(11+r()*60),-r()*500+20)}
  for(let z=-600;z<40;z+=50){const p=box(.25,6,.25,mat({color:0x6a5040}));p.position.y=3;add(p,-12,z)}}
 if(L==='alpine'){trees(320,10,160,-900,30);for(let i=0;i<30;i++)add(rock(mat({color:0x7a8490}),1+r()*4,r),side()*(12+r()*80),-r()*700);rail(-8.6);rail(8.6)}
 if(L==='forest'||L==='autumn'){if(L==='autumn'){const AM=[0xd8862a,0xc4582a,0xe0b23a,0xa83a2a].map(c=>mat({color:c}));for(let i=0;i<260;i++){const x=side()*(10+r()*120),z=-r()*800+30;add(roundTree(AM[i%4],bark,5+r()*6,r),x,z)}trees(120,30,200,-900,0)}
  else{trees(260,10,180,-900,30);for(let i=0;i<60;i++)add(roundTree(LM[i%LM.length],bark,5+r()*5,r),side()*(12+r()*60),-r()*500)}rail(-8.6)}
 if(L==='city'||L==='neon'||L==='cityday'){const day=L==='cityday';for(let i=0;i<110;i++){const h=18+r()*110,w=12+r()*18,x=side()*(24+r()*160),z=-30-r()*900,m=new THREE.MeshStandardMaterial({map:windows(i+1,L==='neon'?.3:day?.0:.45,day?['#6f7f92','#8a96a6','#5a6878','#a0a8b4'][i%4]:L==='neon'?'#140f24':'#0e1220',day),roughness:day?.4:.9,metalness:day?.3:0});
   if(!day){m.emissive=new THREE.Color(0xffffff);m.emissiveMap=m.map;m.emissiveIntensity=.9}m.map.repeat.set(Math.max(1,w/14),Math.max(1,h/28));const b=box(w,h,w,m);b.position.y=h/2;add(b,x,z)}
  for(let z=-700;z<40;z+=28){add(lamp(grey,lampE,!day),-9,z,0,2);const l2=lamp(grey,lampE,!day);l2.rotation.y=Math.PI;add(l2,9,z,0,2)}
  if(L==='neon')for(let i=0;i<26;i++){const c=[0xff3aa0,0x3ae0ff,0xffd23a,0x9a5aff][i%4],sx=side(),s=box(.3,2.5+r()*3,6+r()*8,new THREE.MeshBasicMaterial({color:c}));s.position.y=5+r()*10;add(s,sx*(12+r()*3),-15-r()*400);
   const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(16,16,1);sp.position.copy(s.position);sc.add(sp)}
  if(day)trees(40,10,14,-600,30,'round')}
 if(L==='harbour'){for(let i=0;i<48;i++){const c=[0xd6202c,0x1d5fd0,0xf0b020,0x2a9a5a,0xe8ecf0,0xe0702a][(i*7)%6],k=box(2.6,2.6,6.2,mat({color:c}));k.position.y=1.3+((i/16|0))*2.6;add(k,-(22+(i%4)*3),-60+((i%16)>>2)*16)}
  for(let i=0;i<5;i++){const cr=new THREE.Group(),m=mat({color:i%2?0xd6202c:0xf0b020});for(const dx of [-3,3]){const a=box(.8,38,.8,m);a.position.set(dx,19,0);cr.add(a)}const b=box(40,1.4,1.4,m);b.position.set(-10,38,0);cr.add(b);add(cr,-34,-40+i*28)}
  for(let i=0;i<7;i++){const sh=new THREE.Group(),h=box(50,8,10,mat({color:[0x2a3a5a,0x8a2a2a,0x2a5a3a][i%3]}));h.position.y=3;sh.add(h);const d=box(12,8,9,mat({color:0xf0f2f4}));d.position.set(18,11,0);sh.add(d);add(sh,-(60+r()*260),-200+r()*260)}
  for(let z=-600;z<40;z+=30)add(lamp(grey,lampE,0),9,z,0,2);trees(60,14,70,-600,30,'round')}}
function roundTree(m1,m2,h,r){const g=new THREE.Group(),t=new THREE.Mesh(GEO.trunk2||(GEO.trunk2=new THREE.CylinderGeometry(.2,.3,2.4,6)),m2);t.position.y=1.2;g.add(t);
 for(let i=0;i<3;i++){const b=new THREE.Mesh(GEO.ico||(GEO.ico=new THREE.IcosahedronGeometry(1.6,0)),m1);b.position.set((r()-.5)*1.4,3+r()*1.4,(r()-.5)*1.4);b.scale.setScalar(.8+r()*.5);g.add(b)}g.scale.setScalar(h/5.5);return g}
function crowd(seed){const c=cnv(256,256),g=c.getContext('2d'),r=rng(seed*7+3|1);g.fillStyle='#3a3f4a';g.fillRect(0,0,256,256);for(let i=0;i<2600;i++){g.fillStyle=['#e8e8e8','#d6202c','#1d5fd0','#f0b020','#2a2a2a','#e0a080'][(r()*6)|0];g.fillRect(r()*256,r()*256,3,3)}return tex(c)}
function adBoard(seed,big){const c=cnv(512,128),g=c.getContext('2d'),r=rng((seed|0)*13+5|1),pal=[['#d6202c','#ffffff'],['#1d5fd0','#ffffff'],['#111418','#f0b020'],['#f0f2f4','#16191d']][(r()*4)|0];
 g.fillStyle=pal[0];g.fillRect(0,0,512,128);g.fillStyle=pal[1];g.font='italic 900 76px '+(getComputedStyle(document.body).getPropertyValue('--gt')||'sans-serif');g.textBaseline='middle';g.textAlign='center';g.fillText(big?'POLY GT':['POLY GT','GRAND TOUR','MOTOR DIVISION','RACING'][(r()*4)|0],256,68);return tex(c)}
function ribbon(w,y,RL,m){const g=new THREE.PlaneGeometry(w,1400,1,700);g.rotateX(-Math.PI/2);g.translate(0,y,-600);const pa=g.attributes.position;
 for(let i=0;i<pa.count;i++){const z=pa.getZ(i);pa.setX(i,pa.getX(i)+RL.cx(z));pa.setY(i,pa.getY(i)+RL.cy(z))}g.computeVertexNormals();const o=new THREE.Mesh(g,m);o.receiveShadow=true;return o}
function envScene(E,seed,rd){const RL=roadLine(rd,E);const sc=new THREE.Scene(),fogC=new THREE.Color(E.fog);sc.fog=new THREE.Fog(fogC,E.fogN,E.fogF);
 sc.add(new THREE.HemisphereLight(E.hemi[0],E.hemi[1],E.hemi[2]));const sun=new THREE.DirectionalLight(E.light[0],E.light[1]);sun.position.set(...E.light[2]).normalize().multiplyScalar(80);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc_=sun.shadow.camera;sc_.left=-40;sc_.right=40;sc_.top=40;sc_.bottom=-40;sc_.near=1;sc_.far=260;sun.shadow.bias=-.0004;sc.add(sun);sc.add(sun.target);
 const hAt=makeHeight(E,seed);const road=ribbon(16,.02,RL,new THREE.MeshStandardMaterial({map:asphalt(E),roughness:E.wet?.45:.9,metalness:E.wet?.12:0}));sc.add(road);
 sc.add(ribbon(22,0,RL,mat({color:new THREE.Color(E.tc[0]).multiplyScalar(.8),flatShading:false})));
 sc.add(terrain(E,hAt,seed,RL));if(E.sea){const sea=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.MeshStandardMaterial({color:E.seaC||0x2a86c0,roughness:.2,metalness:.35}));sea.rotation.x=-Math.PI/2;sea.position.set(E.sea*2010,-.35,-900);sc.add(sea)}
 scenery(sc,E,hAt,seed,RL);return {sc,sun,RL,road}}

/* the scenes: cars [id, metres behind the lead (negative = ahead), metres to the side, opacity]; cam/look [side, up, ahead]; rd: the road's climbs and bends (roadLine).
   q: the Quickplay mode it belongs to (its place in the list); two each, shown in turn. The rest are the main menu's, never shown in Quickplay */
P.PROMO_REV=3;
P.PROMO_SCENES=[
 /* Quick Race: the pack into the first corner */
 {q:0,rd:{A:5,L:360,cA:18,cL:520},env:'dusk',cars:[['gtr',9,1.4],['c78',4.5,-1.5],['c86',0,1.3],['c34',-4.5,-1.2]],cam:[-1,1,-19],look:[0,1.2,0],fov:28,blur:'zoom',amt:.045},
 {q:0,rd:{G:-.035,cA:-14,cL:500},env:'grid',cars:[['c97',0,-1.6],['c70',3,1.8],['c82',7,-1.2],['c87',11,1.6]],cam:[-6.5,2.2,-7],look:[0,1,3],fov:32,blur:'zoom',amt:.04},
 /* Time Attack: one car, alone on the road */
 {q:1,rd:{A:4,L:240,ph:1,base:6,cA:10,cL:600},env:'coast',cars:[['c27',0,0]],cam:[-7.5,.9,.6],look:[0,.9,.6],fov:34,blur:'pan',amt:.06},
 {q:1,rd:{G:-.07,cA:30,cL:300},env:'pass',cars:[['c110',0,-.6]],cam:[3,.45,7],look:[0,1,-1],fov:30,blur:'zoom',amt:.04},
 /* Elimination: the field strung out, the last car fading */
 {q:2,rd:{A:3,L:200,G:-.03},env:'desert',cars:[['c34',0,-1.5],['c46',3.5,1.7],['c15',7.5,-1.2],['c78',5.5,.1,.4]],cam:[.2,.55,9],look:[0,1.1,-4],fov:30,blur:'zoom',amt:.05},
 {q:2,rd:{A:8,L:500,cA:25,cL:600},env:'redrock',cars:[['c64',0,0],['c54',5,-1.6],['c60',10,1.5],['c31',16,-.4,.35]],cam:[5,4,25],look:[0,1,2],fov:32,blur:'zoom',amt:.03},
 /* Cut-Up: weaving through traffic */
 {q:3,rd:{G:.02,cA:12,cL:600},env:'night',cars:[['c86',0,1.2],['c26',1.5,-3.2],['c50',4.5,4],['c28',9,-3.2]],cam:[5,3.2,10],look:[0,1.6,-6],fov:34,blur:'zoom',amt:.03},
 {q:3,rd:{A:3,L:300,ph:.8},env:'rush',cars:[['c134',0,-.2],['c19',4,-3.6],['c14',8,3.8],['c29',13,0],['c10',18,-3.6]],cam:[1.6,.6,7],look:[0,1.2,-6],fov:32,blur:'zoom',amt:.045},
 /* Versus: side by side */
 {q:4,env:'neon',cars:[['ferr',0,-1.8],['c42',.4,1.8]],cam:[0,.42,6],look:[0,1,-1],fov:38,blur:'zoom',amt:.05,pair:1},
 {q:4,rd:{A:2.5,L:260,cA:-15,cL:500},env:'floods',cars:[['c90',0,-1.8],['c4',.2,1.8]],cam:[-1,1.1,-12],look:[0,1,1],fov:30,blur:'zoom',amt:.045,pair:1},
 /* the main menu */
 {rd:{G:-.06,cA:22,cL:350},env:'alpine',cars:[['c79',0,-.9],['c102',5.5,1.3]],cam:[3.6,.5,6.5],look:[0,1.1,-1],fov:30,blur:'zoom',amt:.04},
 {env:'harbour',cars:[['c46',0,0]],cam:[7.5,.8,-.6],look:[0,.9,-.6],fov:34,blur:'pan',amt:.05},
 {rd:{A:6,L:300,cA:20,cL:500},env:'golden',cars:[['c8',0,-1.4],['c34',5,1.5]],cam:[2.4,.9,-12],look:[0,1.3,1],fov:30,blur:'zoom',amt:.045},
 {rd:{A:5,L:260,ph:2,cA:-18,cL:400},env:'autumn',cars:[['c13',0,-1.2]],cam:[-4.2,.6,6.2],look:[0,1,-1.5],fov:30,blur:'zoom',amt:.04},
 {rd:{A:5,L:300,base:8},env:'dawn',cars:[['c33',0,-1],['c30',6,1.4]],cam:[-9,1,-1],look:[0,1,-1],fov:34,blur:'pan',amt:.06},
 {rd:{A:4,L:340,cA:15,cL:500},env:'moon',cars:[['c110',0,0]],cam:[2.6,.5,-8],look:[0,1,2],fov:32,blur:'zoom',amt:.04},
 {rd:{G:-.02},env:'city',cars:[['c128',0,-1.6],['c20',3,1.8]],cam:[4,2.2,12],look:[0,1.6,-6],fov:32,blur:'zoom',amt:.03},
 {rd:{A:5,L:280,cA:-20,cL:450},env:'storm',cars:[['c21',0,0],['c61',7,.8]],cam:[3.4,.45,7],look:[0,1.1,-2],fov:30,blur:'zoom',amt:.045},
 {rd:{G:.05,cA:20,cL:400},env:'snow',cars:[['c102',0,1.2],['c79',4,-1.4]],cam:[-3.8,1.4,-9],look:[0,1,1],fov:30,blur:'zoom',amt:.04},
 {rd:{A:3,L:250,base:5},env:'tropic',cars:[['c42',0,0]],cam:[-7.2,.7,.4],look:[0,.9,.4],fov:34,blur:'pan',amt:.06},
 {rd:{A:7,L:420,cA:25,cL:700},env:'fields',cars:[['c123',0,-1.3],['c27',6,1.4]],cam:[5,2.6,9],look:[0,1,-3],fov:30,blur:'zoom',amt:.035},
 {rd:{G:-.04,cA:-25,cL:420},env:'fjord',cars:[['gtr',0,-.8]],cam:[3.5,1.5,8.5],look:[0,1,-4],fov:30,blur:'zoom',amt:.04}];
P.promoFor=q=>P.PROMO_SCENES.map((s,k)=>s.q===q?k:-1).filter(k=>k>=0);
P.promoMenu=()=>P.PROMO_SCENES.map((s,k)=>s.q===undefined?k:-1).filter(k=>k>=0);
const PS={};
P.promoShotCached=k=>PS[k]&&PS[k]._v||null;
P.promoShotSeed=(k,cv)=>{const pr=Promise.resolve(cv);pr._v=cv;PS[k]=pr};
P.promoShot=k=>PS[k]||(PS[k]=new Promise(res=>setTimeout(()=>{let sc=null;try{const W=1280,H=720,S=P.PROMO_SCENES[k],E=ENV[S.env],o=envScene(E,k*31+7,S.rd);sc=o.sc;const RL=o.RL;
 /* the scenery runs off towards -z: a shot from behind the cars is turned round so it looks into it too */const fl=S.look[2]>S.cam[2]+.5?-1:1;
 const cars=[];for(const [id,d,l,fade] of S.cars){const g=car(id,fade);if(!g)continue;g.position.copy(RL.at(l*fl,0,-d*fl));g.rotation.y=fl>0?0:Math.PI;RL.orient(g,-d*fl);if(fl<0)g.rotation.x=-g.rotation.x;sc.add(g);cars.push(g)}
 const cam=new THREE.PerspectiveCamera(S.fov||32,W/H,.3,2400);cam.position.copy(RL.at(S.cam[0]*fl,S.cam[1],S.cam[2]*fl));cam.lookAt(RL.at(S.look[0]*fl,S.look[1],S.look[2]*fl));cam.updateMatrixWorld();
 o.sun.target.position.copy(o.RL.at(0,0,-4));o.sun.position.add(o.sun.target.position);
 const r=rdr(W,H);r.toneMappingExposure=E.night?1.15:1.05;
 const dv=cam.getWorldDirection(new V3()).setY(0).normalize(),hz=cam.position.clone().addScaledVector(dv,2000).setY(0).project(cam),hy=Math.max(0,Math.min(H,(1-hz.y)/2*H));const sky=paintSky(W,H,hy,E);
 r.setClearColor(0,0);r.render(sc,cam);const full=cnv(W,H),fg=full.getContext('2d');fg.drawImage(sky,0,0);fg.drawImage(r.domElement,0,0);
 /* the cars (with their shadows on an invisible floor) on their own layer, kept sharp over the blurred picture */
 const hid=[];sc.traverse(x=>{if(x===sc||x.isLight)return;let p=x,inCar=false;while(p){if(cars.includes(p)){inCar=true;break}p=p.parent}if(!inCar&&(x.isMesh||x.isSprite)&&x.visible){x.visible=false;hid.push(x)}});
 /* the shadows land on the road itself (a copy of it that only shows shadow) */const catcher=new THREE.Mesh(o.road.geometry,new THREE.ShadowMaterial({opacity:E.night?.45:.38}));catcher.position.y=.005;catcher.receiveShadow=true;sc.add(catcher);
 const fogK=sc.fog;sc.fog=null;r.setClearColor(0,0);r.render(sc,cam);sc.fog=fogK;hid.forEach(x=>x.visible=true);sc.remove(catcher);
 const carL=cnv(W,H);carL.getContext('2d').drawImage(r.domElement,0,0);
 let fx=W/2,fy=H*.55;if(cars[0]){const v=new V3(0,1,0).applyMatrix4(cars[0].matrixWorld);if(S.pair&&cars[1])v.add(new V3(0,1,0).applyMatrix4(cars[1].matrixWorld)).multiplyScalar(.5);v.project(cam);fx=(v.x+1)/2*W;fy=(1-v.y)/2*H}
 const out=cnv(W,H),g=out.getContext('2d'),amt=S.amt||.05;g.filter='saturate(1.2) contrast(1.06)';
 const NB=28;for(let i=0;i<NB;i++){g.globalAlpha=1/(i+1);if(S.blur==='pan'){g.setTransform(1,0,0,1,(i/(NB-1)-.5)*amt*W,0)}else{const s=1+amt*i/(NB-1);g.setTransform(s,0,0,s,fx*(1-s),fy*(1-s))}g.drawImage(full,0,0)}
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(carL,0,0);g.filter='none';
 /* a light vignette, like a lens */const vg=g.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,W*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 res(out)}catch(e){console.error('promo shot',e);delete PS[k];res(null)}
 finally{if(sc)sc.traverse(x=>{if(x.geometry&&!x.parent?.userData?.keep&&x.userData.contact)x.geometry.dispose()})}},30)));
{const ps=P.promoShot;P.promoShot=k=>{const pr=ps(k);pr.then(v=>{if(v&&PS[k])PS[k]._v=v});return pr}}
/* ---- the title stills: the action pictures as real things. A magazine on a table, a TV in a living room, a game case on a shelf,
   a billboard over a city road at night. 1600x900, framed for the boot screen's bars (the top tenth and the bottom sixth are covered) ---- */
const FNT=()=>getComputedStyle(document.body).getPropertyValue('--gt')||'sans-serif';
const sp_=(g,v)=>{try{g.letterSpacing=v}catch(e){}};
function crop(g,im,x,y,w,h,fx){/* cover-fit an action picture into a box, keeping its middle (or fx, 0..1 across) */const s=Math.max(w/im.width,h/im.height),sw=w/s,sh=h/s,sx=Math.max(0,Math.min(im.width-sw,im.width*(fx??.5)-sw/2)),sy=(im.height-sh)/2;g.drawImage(im,sx,sy,sw,sh,x,y,w,h)}
function wood(seed,cols,n){const c=cnv(1024,1024),g=c.getContext('2d'),r=rng(seed),bw=1024/(n||6);
 for(let x=0;x<1024;x+=bw){g.fillStyle=cols[(r()*cols.length)|0];g.fillRect(x,0,bw,1024);
  for(let i=0;i<46;i++){g.strokeStyle='rgba(30,15,5,'+(.04+r()*.12).toFixed(3)+')';g.lineWidth=.6+r()*2.2;g.beginPath();const x0=x+r()*bw,a=2+r()*7,f=120+r()*200,ph=r()*9;g.moveTo(x0,0);for(let y=0;y<=1024;y+=32)g.lineTo(x0+Math.sin(y/f+ph)*a,y);g.stroke()}
  g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,0,2,1024);g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x+2,0,2,1024)}
 return tex(c)}
function magCover(shot,o){const W=900,H=1200,c=cnv(W,H),g=c.getContext('2d'),FN=FNT();crop(g,shot,0,0,W,H,o.fx);
 let q=g.createLinearGradient(0,0,0,380);q.addColorStop(0,'rgba(0,0,0,.5)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,W,380);
 q=g.createLinearGradient(0,H*.6,0,H);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=q;g.fillRect(0,H*.6,W,H*.4);
 g.fillStyle='rgba(255,255,255,.85)';g.font='600 22px '+FN;sp_(g,'8px');g.textBaseline='top';g.fillText('THE DRIVING MAGAZINE',46,34);sp_(g,'0px');
 g.font='italic 900 196px '+FN;sp_(g,'-10px');g.fillStyle=o.mc||'#ffffff';g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=18;g.fillText('POLY GT',30,58);g.shadowBlur=0;sp_(g,'0px');
 g.fillStyle='#d2202f';g.fillRect(46,298,W-92,9);
 g.font='800 30px '+FN;g.fillStyle='#ffd23a';g.fillText(o.k1||'TESTED',46,330);g.font='600 26px '+FN;g.fillStyle='#fff';g.fillText(o.k2||'',46,366);
 g.textBaseline='alphabetic';let f=120;g.font='italic 900 '+f+'px '+FN;while(g.measureText(o.head).width>W-92&&f>60){f-=4;g.font='italic 900 '+f+'px '+FN}g.fillStyle='#fff';g.fillText(o.head,44,H-150);
 g.font='500 30px '+FN;g.fillStyle='rgba(255,255,255,.88)';g.fillText(o.sub||'',48,H-104);
 g.fillStyle='#d2202f';g.beginPath();g.arc(W-120,470,82,0,TAU);g.fill();g.fillStyle='#fff';g.textAlign='center';g.font='900 52px '+FN;g.fillText('131',W-120,470);g.font='700 20px '+FN;g.fillText('CARS INSIDE',W-120,500);g.textAlign='left';
 g.fillStyle='#fff';g.fillRect(W-190,H-96,140,64);g.fillStyle='#111';const r=rng(o.seed||5);for(let x=W-182;x<W-58;x+=2+((r()*3)|0)){if(r()<.6)g.fillRect(x,H-90,1+((r()*2)|0),44)}
 return c}
function caseCover(shot,o){const W=820,H=1160,c=cnv(W,H),g=c.getContext('2d'),FN=FNT();crop(g,shot,0,86,W,H-86,o.fx);
 let q=g.createLinearGradient(0,H*.55,0,H);q.addColorStop(0,'rgba(4,10,26,0)');q.addColorStop(1,'rgba(4,10,26,.92)');g.fillStyle=q;g.fillRect(0,H*.55,W,H*.45);
 q=g.createLinearGradient(0,0,0,86);q.addColorStop(0,'#24272c');q.addColorStop(1,'#0c0d10');g.fillStyle=q;g.fillRect(0,0,W,86);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,85,W,1);
 g.fillStyle='#e8ecf0';g.font='italic 800 34px '+FN;g.textBaseline='middle';g.fillText('POLY',34,45);const w=g.measureText('POLY ').width;g.font='italic 200 34px '+FN;g.fillText('GT',34+w,45);
 g.textBaseline='alphabetic';g.font='italic 800 150px '+FN;g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=24;g.fillText('POLY',46,H-150);const w2=g.measureText('POLY ').width;g.font='italic 200 150px '+FN;g.fillText('GT',46+w2,H-150);g.shadowBlur=0;
 const bg=g.createLinearGradient(48,0,180,0);bg.addColorStop(0,'#fff');bg.addColorStop(1,'#8fb4d8');g.fillStyle=bg;g.fillRect(50,H-300,130,7);
 g.font='500 26px '+FN;sp_(g,'9px');g.fillStyle='#c9d8ee';g.fillText('GRAND TOUR',52,H-100);sp_(g,'0px');return c}
function spine(seed,col,txt,dark){const c=cnv(64,512),g=c.getContext('2d'),r=rng(seed);g.fillStyle=col;g.fillRect(0,0,64,512);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,64,64);
 g.fillStyle=dark?'#16191d':'#ffffff';g.globalAlpha=.85;g.fillRect(16,20,32,24);g.save();g.translate(40,96);g.rotate(Math.PI/2);g.font='italic 800 26px '+FNT();g.fillText(txt||'',0,0);g.restore();
 for(let i=0;i<2;i++)g.fillRect(14+i*10,470-r()*30,4,30);g.globalAlpha=1;return tex(c)}
function paperM(c){return new THREE.MeshStandardMaterial({color:c||0xf4f2ee,roughness:.9})}
function propLights(sc,o){sc.add(new THREE.HemisphereLight(o.hemi[0],o.hemi[1],o.hemi[2]));const d=new THREE.DirectionalLight(o.sun[0],o.sun[1]);d.position.set(...o.sun[2]);d.castShadow=true;d.shadow.mapSize.set(2048,2048);
 const s=o.sh||1,cm=d.shadow.camera;cm.left=-s;cm.right=s;cm.top=s;cm.bottom=-s;cm.near=.05;cm.far=40;d.shadow.bias=-.0003;d.shadow.radius=4;sc.add(d);sc.add(d.target);return d}
function finish(cv,W,H,o){/* depth of field (a sharp band through the subject, soft above and below), a warm or cool grade, the vignette */
 const out=cnv(W,H),g=out.getContext('2d');g.filter='blur('+(o.dof||6)+'px) '+(o.grade||'');g.drawImage(cv,-8,-8,W+16,H+16);g.filter='none';
 const sh=cnv(W,H),s=sh.getContext('2d');s.filter=o.grade||'none';s.drawImage(cv,0,0);s.filter='none';s.globalCompositeOperation='destination-in';
 const [a,b]=o.band||[.35,.7],q=s.createLinearGradient(0,0,0,H);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(Math.max(0,a-.18),'rgba(0,0,0,0)');q.addColorStop(a,'rgba(0,0,0,1)');q.addColorStop(b,'rgba(0,0,0,1)');q.addColorStop(Math.min(1,b+.2),'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,0)');s.fillStyle=q;s.fillRect(0,0,W,H);
 g.drawImage(sh,0,0);const vg=g.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,W*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(o.vig??.45)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);return out}
function toy(id,len){const c=car(id,0,true);if(!c)return null;c.scale.setScalar(len/(c.userData.len||4.7));c.traverse(m=>{if(m.isMesh&&!m.userData.contact){m.castShadow=true;m.receiveShadow=true}});return c}
function mug(col){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col||0xf4f4f2,roughness:.25}),b=new THREE.Mesh(new THREE.CylinderGeometry(.042,.038,.095,40,1,true),m);b.position.y=.0475;g.add(b);
 const bt=new THREE.Mesh(new THREE.CircleGeometry(.038,40),m);bt.rotation.x=Math.PI/2;bt.position.y=.001;g.add(bt);const cf=new THREE.Mesh(new THREE.CircleGeometry(.0405,40),new THREE.MeshStandardMaterial({color:0x2a160c,roughness:.15}));cf.rotation.x=-Math.PI/2;cf.position.y=.085;g.add(cf);
 const inn=new THREE.Mesh(new THREE.CylinderGeometry(.039,.036,.09,40,1,true),new THREE.MeshStandardMaterial({color:col||0xf4f4f2,roughness:.3,side:THREE.BackSide}));inn.position.y=.05;g.add(inn);
 const h=new THREE.Mesh(new THREE.TorusGeometry(.026,.0075,12,28,Math.PI*1.25),m);h.position.set(.046,.05,0);h.rotation.z=-Math.PI*.62;g.add(h);return shadowy(g)}
function keys(){const g=new THREE.Group(),blk=new THREE.MeshStandardMaterial({color:0x16181c,roughness:.35}),met=new THREE.MeshStandardMaterial({color:0xc8ccd2,metalness:1,roughness:.3});
 const f=box(.032,.012,.058,blk);f.position.y=.006;g.add(f);const bt=new THREE.Mesh(new THREE.CircleGeometry(.007,20),new THREE.MeshStandardMaterial({color:0xd2202f,roughness:.4}));bt.rotation.x=-Math.PI/2;bt.position.set(0,.0125,.008);g.add(bt);
 const rg=new THREE.Mesh(new THREE.TorusGeometry(.016,.0016,8,40),met);rg.rotation.x=Math.PI/2;rg.position.set(0,.002,-.044);g.add(rg);const k=box(.008,.002,.04,met);k.position.set(.01,.002,-.07);k.rotation.y=.4;g.add(k);return shadowy(g)}
function pad(col){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col||0x1a1c20,roughness:.45}),b=box(.11,.028,.06,m);b.position.y=.016;g.add(b);
 for(const sx of [-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.022,.018,.07,16),m);h.rotation.x=1.2;h.rotation.z=sx*.25;h.position.set(sx*.06,.014,.03);g.add(h);
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.012,16),new THREE.MeshStandardMaterial({color:0x0c0d0f,roughness:.8}));st.position.set(sx*.024,.034,.012);g.add(st)}
 for(let i=0;i<4;i++){const bb=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.006,12),new THREE.MeshStandardMaterial({color:[0x3ac06a,0xd2202f,0x3a7ae0,0xe0c03a][i],roughness:.4}));bb.position.set(.05+[0,.01,-.01,0][i],.032,-.008+[-.01,0,0,.01][i]);g.add(bb)}
 return shadowy(g)}
function plant(h){const g=new THREE.Group(),pot=new THREE.Mesh(new THREE.CylinderGeometry(h*.16,h*.12,h*.28,24),new THREE.MeshStandardMaterial({color:0xd8d2c6,roughness:.7}));pot.position.y=h*.14;g.add(pot);
 const lm=mat({color:0x2f6a3a}),r=rng(h*1000);for(let i=0;i<14;i++){const l=new THREE.Mesh(GEO.lf||(GEO.lf=new THREE.ConeGeometry(.08,1,4)),lm);const a=i/14*TAU,t=.25+r()*.5;l.scale.set(h*.5,h*(.55+r()*.4),h*.25);l.position.set(Math.cos(a)*h*.05,h*.28+l.scale.y*.45,Math.sin(a)*h*.05);l.rotation.set(Math.sin(a)*t,0,-Math.cos(a)*t);g.add(l)}return shadowy(g)}
function render(sc,cam,W,H,exp,bg){const r=rdr(W,H);r.toneMappingExposure=exp||1;r.setClearColor(bg??0,1);r.render(sc,cam);const c=cnv(W,H);c.getContext('2d').drawImage(r.domElement,0,0);return c}
function free(sc){sc.traverse(x=>{if(x.userData.car)return;if(x.geometry&&!Object.values(GEO).includes(x.geometry)&&x.userData.own)x.geometry.dispose()})}
const PROPS=[
 /* the magazine on a café table, a second issue under it, coffee, keys and a die-cast model */
 {n:'mag',shots:[12,2],async make(S){const W=1600,H=900,sc=new THREE.Scene();propLights(sc,{hemi:[0xfff2e0,0x403020,.55],sun:[0xffe2bc,2.2,[-.9,1.6,.5]],sh:.5});
  const tb=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshStandardMaterial({map:wood(4,['#6a452c','#74503a','#5e3c26','#7a5236'],5),roughness:.55}));tb.material.map.repeat.set(2,1.4);tb.material.map.wrapS=tb.material.map.wrapT=THREE.RepeatWrapping;tb.rotation.x=-Math.PI/2;tb.receiveShadow=true;sc.add(tb);
  const mag=(cv,x,z,ry,y)=>{const t=tex(cv),p=paperM(),m=new THREE.Mesh(new THREE.BoxGeometry(.21,.004,.28),[p,p,new THREE.MeshStandardMaterial({map:t,roughness:.35,metalness:.05}),p,p,p]);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;sc.add(m);return m};
  mag(magCover(S[1],{head:'COAST TO COAST',sub:'The long way round, flat out',k1:'ROAD TRIP',k2:'Six cars, one tank of fuel',seed:9,fx:.45}),-.13,-.07,.42,.002);
  mag(magCover(S[0],{head:'FIRST DRIVE',sub:'Twelve cylinders, one test day',k1:'TESTED',k2:'The fastest cars of the year',seed:3}),.01,.005,-.1,.0062);
  const mg=mug(0xf2efe8);mg.position.set(.22,0,-.12);sc.add(mg);const k=keys();k.position.set(-.2,0,.15);k.rotation.y=.9;sc.add(k);
  const t=toy('c27',.14);if(t){t.position.set(.23,0,.12);t.rotation.y=-2.2;sc.add(t)}
  const cam=new THREE.PerspectiveCamera(30,W/H,.01,20);cam.position.set(.02,.66,.5);cam.lookAt(.02,0,-.02);
  return finish(render(sc,cam,W,H,1.05),W,H,{dof:5,band:[.3,.82],grade:'saturate(1.1) contrast(1.05)',vig:.5})}},
 /* the game running on a TV in a dark living room: the screen lights the room */
 {n:'tv',shots:[0],async make(S){const W=1600,H=900,sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0x8090c0,0x20180f,.22));
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshStandardMaterial({map:wood(7,['#4a3424','#3e2a1c','#523a28'],8),roughness:.4}));fl.material.map.wrapS=fl.material.map.wrapT=THREE.RepeatWrapping;fl.material.map.repeat.set(4,4);fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sc.add(fl);
  const wl=new THREE.Mesh(new THREE.PlaneGeometry(10,4),new THREE.MeshStandardMaterial({color:0x2c3442,roughness:.95}));wl.position.set(0,2,-.4);wl.receiveShadow=true;sc.add(wl);
  const cab=box(2.2,.46,.42,new THREE.MeshStandardMaterial({map:wood(8,['#2a1e16','#30231a'],2),roughness:.5}));cab.position.set(0,.23,-.18);shadowy(cab);sc.add(cab);
  for(const sx of [-.55,.55]){const d=box(.98,.36,.005,new THREE.MeshStandardMaterial({color:0x1a1410,roughness:.4}));d.position.set(sx,.23,.031);sc.add(d)}
  const blk=new THREE.MeshStandardMaterial({color:0x0a0b0d,roughness:.25,metalness:.4}),tvW=1.42,tvH=.81;
  const bz=box(tvW,tvH,.05,blk);bz.position.set(0,.5+.12+tvH/2,-.16);shadowy(bz);sc.add(bz);const nk=box(.08,.14,.04,blk);nk.position.set(0,.53,-.17);sc.add(nk);const bs=box(.42,.015,.2,blk);bs.position.set(0,.468,-.16);shadowy(bs);sc.add(bs);
  const st=tex(S[0]),scr=new THREE.Mesh(new THREE.PlaneGeometry(tvW-.03,tvH-.03),new THREE.MeshBasicMaterial({map:st,toneMapped:false}));scr.position.set(0,bz.position.y,-.134);sc.add(scr);
  const gl=new THREE.PointLight(0x9ab0ff,1.6,5,2);gl.position.set(0,1.0,.7);sc.add(gl);const gl2=new THREE.PointLight(0xffb070,.8,4,2);gl2.position.set(0,.95,.2);sc.add(gl2);
  const lmp=new THREE.Group(),pm=new THREE.MeshStandardMaterial({color:0x111214,roughness:.4,metalness:.6}),pole=box(.025,1.5,.025,pm);pole.position.y=.75;lmp.add(pole);const bs2=new THREE.Mesh(new THREE.CylinderGeometry(.15,.17,.025,32),pm);bs2.position.y=.012;lmp.add(bs2);
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.3,32,1,true),new THREE.MeshStandardMaterial({color:0xfff0d8,emissive:0xffc880,emissiveIntensity:.9,side:THREE.DoubleSide,roughness:.9}));sh.position.y=1.55;lmp.add(sh);
  const ll=new THREE.PointLight(0xffc27a,1.8,6,2);ll.position.y=1.5;ll.castShadow=true;ll.shadow.mapSize.set(1024,1024);ll.shadow.bias=-.002;lmp.add(ll);shadowy(lmp);sh.castShadow=false;lmp.position.set(-1.55,0,-.05);sc.add(lmp);
  const cons=box(.36,.06,.28,new THREE.MeshStandardMaterial({color:0x0c0d10,roughness:.15,metalness:.3}));cons.position.set(.66,.49,-.12);shadowy(cons);sc.add(cons);const led=box(.3,.006,.004,new THREE.MeshBasicMaterial({color:0x3ab0ff}));led.position.set(.66,.48,.022);sc.add(led);
  const p=pad();p.position.set(-.55,.46,-.02);p.rotation.y=.35;sc.add(p);const pl=plant(.9);pl.position.set(1.55,0,-.1);sc.add(pl);
  for(const sx of [-1.25,1.2]){const sp=box(.2,.95,.24,new THREE.MeshStandardMaterial({color:0x15161a,roughness:.6}));sp.position.set(sx,.475,-.2);shadowy(sp);sc.add(sp);const cn=new THREE.Mesh(new THREE.CircleGeometry(.07,24),new THREE.MeshStandardMaterial({color:0x222428,roughness:.9}));cn.position.set(sx,.62,-.079);sc.add(cn)}
  const fr=box(.6,.42,.03,new THREE.MeshStandardMaterial({color:0x1a1a1c,roughness:.5}));fr.position.set(-.95,1.7,-.385);sc.add(fr);const art=new THREE.Mesh(new THREE.PlaneGeometry(.5,.32),new THREE.MeshStandardMaterial({map:tex(S[1]||S[0]),roughness:.6}));art.position.set(-.95,1.7,-.368);sc.add(art);
  const cam=new THREE.PerspectiveCamera(36,W/H,.05,30);cam.position.set(.55,1.02,2.55);cam.lookAt(.05,.92,-.2);
  const glow=render(sc,cam,W,H,1.1);const g=glow.getContext('2d');/* the screen's bloom */const v=new V3(0,bz.position.y,-.13).project(cam),cx=(v.x+1)/2*W,cy=(1-v.y)/2*H;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(cx,cy,W*.08,cx,cy,W*.45);q.addColorStop(0,'rgba(110,130,200,.18)');q.addColorStop(1,'rgba(110,130,200,0)');g.fillStyle=q;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
  return finish(glow,W,H,{dof:4,band:[.25,.8],grade:'saturate(1.08) contrast(1.06)',vig:.55})},shots2:[13]},
 /* the game case on a shelf of games, leaning on the spines */
 {n:'case',shots:[16],async make(S){const W=1600,H=900,sc=new THREE.Scene();propLights(sc,{hemi:[0xfff2e2,0x3a3028,.5],sun:[0xfff0dc,1.7,[.6,1.1,1]],sh:.6});
  const wl=new THREE.Mesh(new THREE.PlaneGeometry(4,2),new THREE.MeshStandardMaterial({color:0x6e665e,roughness:.95}));wl.position.set(0,.5,-.14);wl.receiveShadow=true;sc.add(wl);
  const sf=box(1.6,.03,.3,new THREE.MeshStandardMaterial({map:wood(11,['#c8a070','#bc9464','#d0aa7a'],3),roughness:.6}));sf.position.set(0,-.015,0);shadowy(sf);sc.add(sf);
  const cm=caseCover(S[0],{fx:.5}),cw=.135,ch=.19,cd=.014,cl=new THREE.MeshStandardMaterial({color:0x111216,roughness:.3}),sp=spine(1,'#0c0d10','POLY GT');
  const hero=new THREE.Mesh(new THREE.BoxGeometry(cw,ch,cd),[cl,new THREE.MeshStandardMaterial({map:sp,roughness:.3}),cl,cl,new THREE.MeshStandardMaterial({map:tex(cm),roughness:.22,metalness:.05}),cl]);hero.castShadow=hero.receiveShadow=true;
  hero.position.set(.02,ch/2*Math.cos(.14)+.002,-.06+.03);hero.rotation.set(-.14,-.22,0);sc.add(hero);
  const C=['#0c0d10','#1b3f8f','#f0f2f4','#d2202f','#16191d','#3a3f4a','#0c0d10','#e8b030','#1d5fd0','#f0f2f4','#2a2d34','#0c0d10','#7a1a22','#16191d'],r=rng(4);
  let x=-.3;C.forEach((c,i)=>{const t=cd+(r()<.2?.006:0),m=new THREE.Mesh(new THREE.BoxGeometry(t,ch,cw),[new THREE.MeshStandardMaterial({color:c,roughness:.35}),cl,cl,cl,new THREE.MeshStandardMaterial({map:spine(i+3,c,'',c==='#f0f2f4'||c==='#e8b030'),roughness:.35}),cl]);
   m.position.set(x+t/2,ch/2,-.07);m.castShadow=m.receiveShadow=true;sc.add(m);x+=t+.0015});
  const t=toy('gtr',.11);if(t){t.position.set(.19,0,0);t.rotation.y=-.75;sc.add(t)}const pl=plant(.16);pl.position.set(.3,0,-.06);sc.add(pl);
  const cam=new THREE.PerspectiveCamera(30,W/H,.01,10);cam.position.set(.0,.15,.6);cam.lookAt(0,.085,-.04);
  return finish(render(sc,cam,W,H,1.05),W,H,{dof:5,band:[.22,.86],grade:'saturate(1.08) contrast(1.04)',vig:.45})}},
 /* a billboard over a city road at night, a car going by underneath */
 {n:'board',shots:[4],async make(S){const W=1600,H=900,E=ENV.rush,o=envScene(E,77),sc=o.sc;
  const bc=cnv(1600,900),g=bc.getContext('2d'),FN=FNT();crop(g,S[0],0,0,1600,900);let q=g.createLinearGradient(0,0,900,0);q.addColorStop(0,'rgba(0,0,0,.7)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,1600,900);
  g.fillStyle='#fff';g.font='italic 800 190px '+FN;g.fillText('POLY',70,640);const w=g.measureText('POLY ').width;g.font='italic 200 190px '+FN;g.fillText('GT',70+w,640);g.fillStyle='#d2202f';g.fillRect(76,420,150,10);g.font='600 44px '+FN;sp_(g,'14px');g.fillStyle='#fff';g.fillText('OUT NOW',80,730);sp_(g,'0px');
  const bm=new THREE.MeshStandardMaterial({color:0x2a2c32,roughness:.6,metalness:.5}),bb=new THREE.Group(),pn=new THREE.Mesh(new THREE.PlaneGeometry(16,9),new THREE.MeshBasicMaterial({map:tex(bc),toneMapped:false}));pn.position.y=14.5;bb.add(pn);
  const fr=box(16.8,9.8,.5,bm);fr.position.set(0,14.5,-.3);bb.add(fr);const pole=box(.9,10,.9,bm);pole.position.set(0,5,-.6);bb.add(pole);const cat=box(16.8,.3,1.4,bm);cat.position.set(0,9.6,.5);bb.add(cat);
  for(let i=0;i<4;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xfff0d0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(4,4,1);sp.position.set(-6+i*4,9.9,1);bb.add(sp)}
  shadowy(bb);pn.castShadow=false;bb.position.set(-20,0,-42);bb.rotation.y=.45;sc.add(bb);
  const c=car('c86');if(c){c.position.set(1.8,0,-8);sc.add(c)}
  const cam=new THREE.PerspectiveCamera(40,W/H,.3,2400);cam.position.set(5.2,1.1,4);cam.lookAt(-7,7,-34);cam.updateMatrixWorld();o.sun.target.position.copy(o.RL.at(0,0,-4));o.sun.position.add(o.sun.target.position);
  const r=rdr(W,H);r.toneMappingExposure=1.15;const dv=cam.getWorldDirection(new V3()).setY(0).normalize(),hz=cam.position.clone().addScaledVector(dv,2000).setY(0).project(cam),hy=Math.max(0,Math.min(H,(1-hz.y)/2*H));
  r.setClearColor(0,0);r.render(sc,cam);const full=cnv(W,H),fg=full.getContext('2d');fg.drawImage(paintSky(W,H,hy,E),0,0);fg.drawImage(r.domElement,0,0);
  const v=new V3(0,14.5,0).applyMatrix4(pn.matrixWorld).project(cam),bx=(v.x+1)/2*W,by=(1-v.y)/2*H;fg.globalCompositeOperation='lighter';const gq=fg.createRadialGradient(bx,by,W*.05,bx,by,W*.4);gq.addColorStop(0,'rgba(255,190,150,.16)');gq.addColorStop(1,'rgba(255,190,150,0)');fg.fillStyle=gq;fg.fillRect(0,0,W,H);fg.globalCompositeOperation='source-over';
  if(c)sc.remove(c);return finish(full,W,H,{dof:0,band:[0,1],grade:'saturate(1.15) contrast(1.06)',vig:.4})}}];
P.PROPS=PROPS.map(p=>p.n);
const PP={};
P.propShot=k=>PP[k]||(PP[k]=(async()=>{const p=PROPS[k];try{const S=[];for(const i of p.shots)S.push(await P.promoShot(i));if(S.some(x=>!x))return null;if(p.shots2)for(const i of p.shots2)S.push(await P.promoShot(i));
 return await new Promise((res,rej)=>setTimeout(()=>{p.make(S).then(res,rej)},30))}catch(e){console.error('prop shot',p.n,e);delete PP[k];return null}})());
})();
