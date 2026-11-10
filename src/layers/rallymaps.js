/* ===== Poly GT layer: rally maps (Nov 8, Hakan: "complete rally overhaul, all maps change to these" = the bought Cartoon Rally Track models of Finland,
   France, Portugal and Sweden). Each is a real point-to-point stage cut out of the model's road network by tools/cartoon_track/stage.py and replaces one of
   the four old rally stages (same slot, so records, medals and saves carry over). A stage file is a .ptrack with a "stage" block; cartoon.js hands it here.
   Driving model: the engine only knows closed loops, so the stage's road is closed out of sight (run-out past the finish, a chord back to the start) and the race
   ends after the fraction of the loop that is the stage. Invisible corridor walls line both sides of the route, so side roads and open fields are closed off.
   Stages skip the old procedural stage world completely (no terrain mesh, no scattered props): the model is the world. ===== */
(function rallymaps(){
'use strict';
const P=window.PT8;
if(!P||typeof D==='undefined'||typeof THREE==='undefined')return;
const SLOT={mangrove:'Mangrove Ford',terr:'Terrace Run',ash:'Ashfall Stage',autumn:'Autumn Ridge'};
P.stagePacks=P.stagePacks||{};
function addStagePack(pack){
 const k=pack.replaces;let i=D.findIndex(d=>d._key===k);if(i<0)i=D.findIndex(d=>d.name===SLOT[k]);
 if(i<0)throw new Error('This stage file is for a stage this game does not have ('+k+')');
 const d=D[i];
 if(d.cartoon&&(d.cartoon.rev||0)>(pack.rev||0)){const e=new Error('This is an older version of '+pack.name+' than the one already in the game');e.older=true;throw e}
 if(!d._orig)d._orig={name:d.name,desc:d.desc,pts:d.pts,fords:d.fords,hw:d.hw,medal:P.MEDAL_REF[i]};
 const L=pack.look||{};
 Object.assign(d,{name:pack.name,desc:pack.desc||d.desc,pts:pack.pts,cartoon:pack,stage:pack.stage,_key:k,bank:0,fords:undefined,jumps:[],walls:[],ice:[],boost:[],hard:0,crater:0,biome:'none',gravel:L.gravel!=null?L.gravel:1},L);
 d.hw=pack.stage.hwMed||d.hw;
 if(pack.medal)P.MEDAL_REF[i]=pack.medal;
 P.stagePacks[pack.id]=pack;if(P.ui&&P.ui.trClear)P.ui.trClear(i);
 return i}
P.addStagePack=addStagePack;
for(const p of P._stageQueue||[]){try{addStagePack(p)}catch(e){console.error('stage file',e)}}P._stageQueue=null;

/* ---- sampling: the finish index, ford list, bounds; the corner notes stop at the finish ---- */
const s0=sampleTrack;
sampleTrack=function(d){const T=s0.apply(this,arguments);const pk=d&&d.cartoon;if(!pk||!pk.stage)return T;
 const st=pk.stage,N=T.N;let bi=0,bd=1e18;for(let i=0;i<N;i++){const dx=T.x[i]-st.fin[0],dz=T.z[i]-st.fin[1],q=dx*dx+dz*dz;if(q<bd){bd=q;bi=i}}
 T.stage=st;T.finI=bi;
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<=bi;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 T.fords=(st.fords||[]).map(f=>{let b=0,q0=1e18;for(let i=0;i<=bi;i++){const dx=T.x[i]-f.x,dz=T.z[i]-f.z,q=dx*dx+dz*dz;if(q<q0){q0=q;b=i}}
  return{i:b,x:T.x[b],z:T.z[b],y:T.y[b],yw:f.yw,psi:T.psi[b],w:f.w,L:f.L||44,s:Math.sin(T.psi[b]),c:Math.cos(T.psi[b])}});
 {const K=P.kappa(T);for(let i=bi+6;i<N-10;i++)K[i]=0}
 T.cps=null;return T};
const cp0=P.cpsOf;
P.cpsOf=T=>{if(!T.stage||!T.finI)return cp0(T);if(T.cps)return T.cps;const K=Math.max(3,Math.round(T.stage.len/900)),o=[];for(let k=1;k<=K;k++)o.push(Math.round(T.finI*k/(K+1)));return T.cps=o};
/* the race is over at the finish, not after a lap of the hidden return road */
const st0=step;
step=function(dt){const Rc=RACE;if(Rc&&Rc.T&&Rc.T.stage&&!Rc._stg){Rc._stg=1;if(Rc.cfg&&Rc.cfg.rally)Rc.laps=Rc.T.finI/Rc.T.N}return st0.apply(this,arguments)};

/* ---- the world: sky, fog and light only; the stage model (cartoon.js) is added on top ---- */
/* surface brightness per stage (a multiplier on each material of the model: the dirt roads were blown out, the tarmac and the banks nearly black) */
const TINT={
 mangrove:[[/ROADS_FINLAND/,.5],[/GRAVEL_FINLAND/,.46],/* Nov 10 (Hakan: "the gravel is too bright and looks super out of place"): were .72 and .8 */[/GRASS_FINLAND/,1.45],[/LAKE_BOTTOM/,1.2],[/^ct_c$/,1.5],[/ATLAS/,1.25]],
 terr:[[/TARMAC_PLAIN/,2.6],[/ROADS_FRANCE/,2.1],[/GRASS_FRANCE/,1.3],[/SNOW_FRANCE/,.9],[/^ct_c$/,1.3]],
 ash:[[/ROADS_PORTUGAL/,1.1],[/GRAVEL_PORTUGAL/,.9],[/GRASS_PORTUGAL/,1.35],[/^ct_c$/,2.1]],
 autumn:[[/SNOW_SWEDEN/,.86],[/ICE_SURFACE/,.95],[/STONE/,1.3],[/^ct_c$/,1.5]]};
const EMIS={ash:[[/GRAVEL_PORTUGAL/,[.075,.048,.026]]],terr:[[/^ct_c$/,[.03,.035,.045]]],autumn:[[/^ct_c$/,[.03,.035,.045]]],mangrove:[[/^ct_c$/,[.02,.03,.02]]]};/* lifts the near-black rock and bank colours */
/* Portugal's cut banks use the road gravel texture and, lit from above, came out as flat grey-brown slabs: blotches and strata (from world position) break them up */
function bankNoise(m){if(m.userData._nz)return;m.userData._nz=1;m.onBeforeCompile=sh=>{
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;\nfloat h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}')
  .replace('#include <map_fragment>','#include <map_fragment>\nfloat nzN=vn(vWp*vec3(.3,.8,.3))*.6+vn(vWp*1.9)*.4;float nzS=.5+.5*sin(vWp.y*2.4+nzN*5.);float nzK=.55+.6*nzN+.25*nzS;diffuseColor.rgb*=nzK;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,.94,.78),nzN);')
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=nzK;')};m.needsUpdate=true}
function tintStage(sc,key){const em=EMIS[key]||[];const tb=TINT[key];if(!tb)return;/* Nov 10 (Hakan: "separations still looks off"): the model's ROADS_FINLAND border is a near-black asphalt edge that showed as a dark strip beside the gravel; it wears the gravel picture instead (PTO.roadEdge===false: old) */
 if(key==='mangrove'&&!(window.PTO&&window.PTO.roadEdge===false)){let gm=null;sc.traverse(o=>{if(!gm&&o.isMesh&&/^ct_GRAVEL_FINLAND/.test(o.name)&&o.material&&o.material.map)gm=o.material.map});if(gm)sc.traverse(o=>{if(o.isMesh&&/^ct_ROADS_FINLAND/.test(o.name)&&o.material&&o.material.map&&o.material.map!==gm)o.material.map=gm,o.material.needsUpdate=true})}
 sc.traverse(o=>{const m=o.isMesh&&o.material;if(!m||!m.color||!/^ct_/.test(o.name))return;if(!m.userData._c0)m.userData._c0=m.color.clone();let k=1;for(const[re,v]of tb)if(re.test(o.name)){k=v;break}m.color.copy(m.userData._c0);if(Array.isArray(k))m.color.multiply(new THREE.Color(k[0],k[1],k[2]));else m.color.multiplyScalar(k);if(m.emissive){let e=null;for(const[re,v]of em)if(re.test(o.name)){e=v;break}if(e){m.emissive.setRGB(e[0],e[1],e[2]);if(key==='ash')bankNoise(m)}else m.emissive.setRGB(0,0,0)}})}
/* ---- road surface detail (Nov 8: "the dirt paths look kinda weird, make them look more real"): one ribbon laid just above the road along the whole stage, with a
   texture made here: wheel ruts and a crown of loose gravel with grass at the edges on the dirt stages, white edge lines and a dashed centre line and worn
   tyre tracks on the tarmac, packed tyre tracks and slush on the snow. Lit and fogged like the rest of the world. ---- */
const ROADK={mangrove:'dirt',ash:'dirt',terr:'tarmac',autumn:'snow'},RTILE=14;
function roadTex(kind,key){const dry=key==='ash';/* Nov 10 (Hakan: a dark gap beside the Portugal road): the verge strip was grass green everywhere; between a dry road and a dry bank it read as a dark seam. Portugal's verge is now loose pale dirt that fades out */
 const W=256,H=512,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');let seed=kind.length*7919+3;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const band=(u,w,col,a,soft)=>{const x0=(u-w/2)*W,x1=(u+w/2)*W,gr=g.createLinearGradient(x0-soft*W,0,x1+soft*W,0);const c=(al)=>`rgba(${col[0]},${col[1]},${col[2]},${al})`;gr.addColorStop(0,c(0));gr.addColorStop(soft/(w+2*soft),c(a));gr.addColorStop(1-soft/(w+2*soft),c(a));gr.addColorStop(1,c(0));g.fillStyle=gr;g.fillRect(x0-soft*W,0,x1-x0+2*soft*W,H)};
 const dots=(n,xa,xb,cols,rmin,rmax)=>{for(let i=0;i<n;i++){const x=(xa+rnd()*(xb-xa))*W,y=rnd()*H,r=rmin+rnd()*(rmax-rmin),c=cols[(rnd()*cols.length)|0];g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()}};
 if(kind==='dirt'){
  if(!dry)band(.5,.86,[112,90,66],.5,.06);/* Finland: a brown wash over the whole width; the model's own road was a pale cream that glared against the forest */
  if(dry){band(.03,.1,[150,118,84],.3,.07);band(.97,.1,[150,118,84],.3,.07)}else{band(.04,.07,[64,76,38],.5,.05);band(.96,.07,[64,76,38],.5,.05)}                       /* grass and dirt at the verge */
  band(.5,.2,dry?[190,160,118]:[150,128,98],dry?.2:.13,.08);                                                      /* loose gravel on the crown */
  band(.31,.085,[46,32,22],.46,.045);band(.69,.085,[46,32,22],.46,.045);                     /* the ruts */
  band(.31,.025,[140,112,82],.16,.012);band(.69,.025,[140,112,82],.16,.012);             /* polished by the tyres */
  dots(900,.12,.88,['rgba(120,104,84,.4)','rgba(48,38,30,.4)','rgba(180,158,124,.3)'],.6,1.6);
  {const vc=dry?['rgba(120,96,70,.4)','rgba(168,138,100,.35)']:['rgba(40,60,28,.55)','rgba(76,92,44,.5)'];dots(160,.0,.1,vc,1.4,3);dots(160,.9,1.0,vc,1.4,3)}
  for(let i=0;i<(dry?0:14);i++){const x=(.44+rnd()*.12)*W,y=rnd()*H;g.strokeStyle='rgba(70,92,40,.5)';g.lineWidth=1.2;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x,y);g.lineTo(x+(k-1.5)*2.2,y-5-rnd()*4);g.stroke()}}
 }else if(kind==='tarmac'){
  band(.31,.11,[0,0,0],.2,.05);band(.69,.11,[0,0,0],.2,.05);                              /* tyre wear */
  dots(500,.05,.95,['rgba(255,255,255,.07)','rgba(0,0,0,.12)'],.5,1.3);
  g.fillStyle='rgba(236,236,228,.86)';g.fillRect(.035*W,0,.02*W,H);g.fillRect(.945*W,0,.02*W,H);        /* edge lines */
  g.fillStyle='rgba(236,236,228,.82)';g.fillRect(.49*W,0,.02*W,H*3/RTILE);                              /* dashed centre line: 3 m dash, 11 m gap */
  g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;for(let i=0;i<6;i++){g.beginPath();let x=(.1+rnd()*.8)*W,y=rnd()*H;g.moveTo(x,y);for(let k=0;k<5;k++){x+=(rnd()-.5)*10;y+=4+rnd()*8;g.lineTo(x,y)}g.stroke()}
 }else{
  band(.31,.1,[110,124,140],.42,.045);band(.69,.1,[110,124,140],.42,.045);               /* packed tyre tracks */
  band(.5,.16,[255,255,255],.16,.06);
  band(.03,.08,[132,142,154],.35,.05);band(.97,.08,[132,142,154],.35,.05);              /* slush at the edge */
  dots(260,.18,.82,['rgba(88,78,70,.5)','rgba(130,126,120,.45)'],.5,1.2);                /* grit */
 }
 const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t}
function roadRibbon(sc,T,key){const kind=ROADK[key];if(!kind||!T.finI)return;const C=10,n=T.finI+1,pos=new Float32Array(n*C*3),uv=new Float32Array(n*C*2),idx=[];let dist=0;
 for(let i=0;i<n;i++){if(i)dist+=Math.hypot(T.x[i]-T.x[i-1],T.z[i]-T.z[i-1]);const c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),hw=key==='mangrove'&&!(window.PTO&&window.PTO.roadEdge===false)?T.hw[i]+1.05:T.hw[i]*.97;
  /* Nov 10 (Hakan, "this bit of the road seems to be above the ground"): where the ground drops away at the edge the ribbon used to hang in the
     air; walking out from the middle, a point whose ground height jumps more than .35 from the last good one is pulled back onto it (PTO.ribbonClamp===false: old) */
  const LL=[],HH=[];for(let k=0;k<C;k++){const l=(k/(C-1)*2-1)*hw;let h=T.y[i];try{const q=T.surf(T.x[i]+c*l,T.z[i]-s*l,T.y[i]+30);if(q&&q.h!=null&&Math.abs(q.h-T.y[i])<1.5)h=q.h}catch(e){}LL[k]=l;HH[k]=h}
  if(!(window.PTO&&window.PTO.ribbonClamp===false)){const m0=C>>1;for(const dir of[1,-1]){let gl=LL[m0],gh=HH[m0],bad=false;for(let k=m0+dir;k>=0&&k<C;k+=dir){if(!bad&&Math.abs(HH[k]-gh)>.35)bad=true;if(bad){LL[k]=gl;HH[k]=gh}else{gl=LL[k];gh=HH[k]}}}}
  for(let k=0;k<C;k++){const l=LL[k],x=T.x[i]+c*l,z=T.z[i]-s*l,h=HH[k];
   const o=(i*C+k)*3;pos[o]=x;pos[o+1]=h+.04;pos[o+2]=z;uv[(i*C+k)*2]=k/(C-1);uv[(i*C+k)*2+1]=dist/RTILE}
  if(i)for(let k=0;k<C-1;k++){const a=(i-1)*C+k,b=a+1,c2=i*C+k,d=c2+1;idx.push(a,c2,b,b,c2,d)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);{const nn=new Float32Array(n*C*3);for(let q=0;q<n*C;q++)nn[q*3+1]=1;g.setAttribute('normal',new THREE.BufferAttribute(nn,3))}
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:roadTex(kind,key),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,side:THREE.DoubleSide}));
 m.frustumCulled=false;m.renderOrder=1;m.name='roadDetail';m.userData.noMerge=1;m.userData.noChunk=1;sc.add(m)}
/* falling snow: a box of flakes that rides along with the camera (one draw call) */
function snowAdd(sc){const N=1400,pos=new Float32Array(N*3),seed=new Float32Array(N*3);for(let i=0;i<N*3;i++)seed[i]=Math.random();
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const cv=document.createElement('canvas');cv.width=cv.height=32;const c2=cv.getContext('2d'),q=c2.createRadialGradient(16,16,0,16,16,15);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.5,'rgba(255,255,255,.55)');q.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=q;c2.fillRect(0,0,32,32);
 const m=new THREE.Points(g,new THREE.PointsMaterial({size:.55,map:new THREE.CanvasTexture(cv),transparent:true,opacity:.9,depthWrite:false,sizeAttenuation:true,fog:false}));
 m.frustumCulled=false;m.renderOrder=6;m.userData.noMerge=1;m.userData.noChunk=1;m.userData.shd=1;sc.add(m);sc.userData.snow={m,seed,N}}
const rr0=R.render.bind(R);
R.render=function(scene,cam){const f=scene&&scene.userData&&scene.userData.snow;if(f&&cam&&cam.position&&scene.userData.snowOn!==false){const t=performance.now()*.001,p=f.m.geometry.attributes.position.array,s=f.seed,W=70,H=38;
  for(let i=0;i<f.N;i++){const k=i*3,x=((s[k]*W*2+Math.sin(t*.6+s[k+1]*9)*1.6)%(W*2)+W*2)%(W*2)-W,y=(((s[k+1]*H*2-t*(2.2+s[k+2]*1.6))%(H*2))+H*2)%(H*2)-H*.5,z=((s[k+2]*W*2+t*.8*s[k]+Math.cos(t*.5+s[k]*7)*1.2)%(W*2)+W*2)%(W*2)-W;p[k]=x;p[k+1]=y;p[k+2]=z}
  f.m.geometry.attributes.position.needsUpdate=true;f.m.position.set(cam.position.x,cam.position.y,cam.position.z)}
 return rr0.apply(this,arguments)};
const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
function gradTex(a,b,soft){const cv=document.createElement('canvas');cv.width=2;cv.height=64;const g=cv.getContext('2d'),q=g.createLinearGradient(0,0,0,64);q.addColorStop(0,hex(a));if(soft){const A=new THREE.Color(a),B=new THREE.Color(b);for(const [t,m] of [[.2,.1],[.32,.38],[.4,.7],[.46,.92]])q.addColorStop(t,'#'+A.clone().lerp(B,m).getHexString())}q.addColorStop(.5,hex(b));q.addColorStop(1,hex(b));g.fillStyle=q;g.fillRect(0,0,2,64);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t}
/* the look of each stage (Nov 8, "make rally's shaders look beautiful and atmospheric"): sky from deep blue overhead to a warm haze at the horizon, a fog
   that is the same colour as that haze, a low warm sun against a cool fill (the light that gives shapes a lit and a shadow side) */
const ATM={
 mangrove:{sky:[0x4f86c6,0xe8dcc2],fog:0xd9d6c4,near:140,far:640,sun:0xffd9a6,sunI:.78,sunAt:[-260,150,120],hemi:[0xa9c6e6,0x56703f],hemiI:1.7},/* Finland: morning mist through the pines */
 terr:{sky:[0x3f7fcf,0xcfe2f2],fog:0xd3e1ee,near:200,far:900,sun:0xfff0d8,sunI:.82,sunAt:[200,210,-120],hemi:[0xb4cdea,0x8a98a6],hemiI:1.8},/* France: clear alpine air */
 ash:{sky:[0x4a82c8,0xf5d6a4],fog:0xe8cfa6,near:130,far:720,sun:0xffc07a,sunI:.8,sunAt:[-300,110,160],hemi:[0xc8d4e4,0x8f7248],hemiI:1.8},/* Portugal: warm late afternoon dust */
 autumn:{sky:[0x0d58c2,0xa8cdf2],fog:0xcfe2f6,near:260,far:1250,sun:0xfff3dc,sunI:1.18,sunAt:[120,105,-200],hemi:[0x8db6f6,0xb9c8dc],hemiI:1.7,snow:1,star:1}};/* Sweden (Nov 10, Hakan: "brighter, like a sunny winter morning"): clear blue sky, a low warm sun, long blue shadows on the snow, a few flakes drifting in the air */
function stageScene(T){const d=T.d,sc=new THREE.Scene(),A=ATM[d._key]||{};
 sc.fog=new THREE.Fog(A.fog!=null?A.fog:d.fog,A.near||150,A.far||620);const hm=A.hemi||d.hemi;sc.add(new THREE.HemisphereLight(hm[0],hm[1],A.hemiI||1.1));const sun=new THREE.DirectionalLight(A.sun!=null?A.sun:d.sun,A.sunI||1.0);sun.position.set(...(A.sunAt||[-150,250,100]));sc.add(sun);
 const sk=A.sky||d.sky;
 const dm=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:gradTex(sk[0],sk[1]),side:THREE.BackSide,fog:false}));dm.frustumCulled=false;dm.userData.skyAt=[0,null,0];sc.userData.skyRide=1;sc.add(dm);
 styleScene(sc);return sc}
const bw=buildWorld;
buildWorld=function(T){if(T.d&&T.d.stage&&T.d.cartoon){if(!T.bounds)T.bounds=[-500,500,-500,500];return stageScene(T)}return bw.apply(this,arguments)};

/* ---- start and finish gates (added after cartoon.js has cleared the stock scenery) ---- */
function bannerTex(txt){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');
 g.fillStyle='#0a0d11';g.fillRect(0,0,512,96);g.strokeStyle='#f1f3f5';g.lineWidth=4;g.strokeRect(4,4,504,88);
 g.fillStyle='#f2c76b';g.font='600 46px "PT Inter",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(txt.split('').join(' '),256,52);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
function checkTex(){const cv=document.createElement('canvas');cv.width=16;cv.height=2;const g=cv.getContext('2d');for(let i=0;i<16;i++){g.fillStyle=i&1?'#f1f3f5':'#0a0d11';g.fillRect(i,0,1,1);g.fillStyle=i&1?'#0a0d11':'#f1f3f5';g.fillRect(i,1,1,1)}
 const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.encoding=THREE.sRGBEncoding;return t}
function gate(sc,T,i,txt){const hw=T.hw[i]+1.3,g=new THREE.Group();g.position.set(T.x[i],T.y[i],T.z[i]);g.rotation.y=T.psi[i];
 const post=new THREE.MeshLambertMaterial({color:0x2a2f36}),pm=new THREE.BoxGeometry(.9,9,.9);
 for(const s of[-1,1]){const m=new THREE.Mesh(pm,post);m.position.set(s*hw,4.5,0);g.add(m)}
 const beam=new THREE.Mesh(new THREE.BoxGeometry(hw*2+.9,.7,.8),post);beam.position.set(0,9,0);g.add(beam);
 const bm=new THREE.MeshBasicMaterial({map:bannerTex(txt),side:THREE.DoubleSide,fog:false}),w=Math.min(hw*1.8,13);const sg=new THREE.Mesh(new THREE.PlaneGeometry(w,w*96/512),bm);sg.position.set(0,7.6,.02);g.add(sg);
 const ck=new THREE.Mesh(new THREE.PlaneGeometry(hw*2-.4,1.8),new THREE.MeshBasicMaterial({map:checkTex(),fog:false}));ck.rotation.x=-Math.PI/2;ck.position.set(0,.14,0);g.add(ck);
 g.userData.noMerge=1;sc.add(g)}
setTimeout(()=>{const bw2=buildWorld;buildWorld=function(T){const sc=bw2.apply(this,arguments);try{if(T.d&&T.d.stage&&T.d.cartoon&&T.finI){/* far mountains and clouds, and the snow: added here, after cartoon.js has cleared the stock scenery */try{if(P.skyBuild)P.skyBuild(sc,T)}catch(e){console.warn('sky',e)}const A=ATM[T.d._key];if(A&&A.snow)snowAdd(sc);tintStage(sc,T.d._key);roadRibbon(sc,T,T.d._key)}}catch(e){console.warn('gates',e)}return sc}},0);

/* ---- time of day on the stages (Nov 9: "the sunset and other shaders still don't look good"). The generic time-of-day pass painted its own orange dome, fog and
   lights over the stage's atmosphere and left the far mountains and clouds in their daytime colours. For stages it is replaced: every look is made from the
   stage's own atmosphere (ATM) by a per-time table: dome top and horizon, fog warmth, sun colour / height / strength, fill, global grade, and the tint of
   the far ring and the clouds, so a sunset is a warm low sun, a pink-orange horizon fading to dusk blue, and mountains that sit in the same haze. ---- */
const TODK={
 dawn:{glow:[0xfff0d8,0xffcfa0],top:0x5f7cb4,hor:0xf2c9a2,fogW:0xe8c8ac,fogM:.55,sun:0xffc08a,si:.92,hi:.59,el:.34,mul:[1.03,1,.96],add:[.01,.004,0],sat:1.02,exp:1,ring:[.97,.86,.86],cl:[1,.82,.78],near:.9,far:1},
 sunset:{top:0x56649a,hor:0xf1bd94,fogW:0xd9b096,fogM:.55,sun:0xffa65e,si:1.1,hi:.6,el:.2,mul:[1.04,.98,.93],add:[.01,0,-.006],sat:1.02,exp:1.02,ring:[.96,.82,.78],cl:[.92,.78,.74],near:.85,far:1,glow:[0xffe9c4,0xffb878]},
 night:{top:0x04070e,hor:0x1b2438,fogW:0x141b2b,fogM:.85,sun:0x8fa2ff,si:.33,hi:.26,el:.9,mul:[.7,.78,1.05],add:[0,.004,.02],sat:.85,exp:.95,ring:[.12,.14,.24],cl:[.15,.17,.28],near:.55,far:.8}};
/* the low sun itself: a small bright disc inside stacked, faint additive spheres (the sky-tracker in ui.js carries 40-radius unfogged spheres with the camera), so the
   horizon gets a soft glow around the sun like a real low sun instead of a flat orange band */
function sunGlow(sc,A,K,key){const old=sc.userData.sunG;if(old){for(const o of old){sc.remove(o);o.geometry.dispose();o.material.dispose()}sc.userData.sunG=null}
 if(!K.glow)return;const at=A.sunAt||[-150,250,100],hz=Math.hypot(at[0],at[2])||1,e=K.el,cx=Math.sqrt(1-e*e),D=1250,g=[];
 [[1,K.glow[0],1],[2.6,K.glow[1],.5],[5,K.glow[1],.22],[9,K.glow[1],.12],[15,K.glow[1],.07]].forEach(([k,col,op],i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(40,16,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  m.scale.setScalar(k);m.position.set(at[0]/hz*D*cx,D*e,at[2]/hz*D*cx);m.renderOrder=-1+i*.01;m.frustumCulled=false;sc.add(m);g.push(m)});sc.userData.sunG=g}
function stageTod(sc,T,key){const A=ATM[T.d._key]||{},K=TODK[key],U=window.TODU;P.curTod=key;sc.userData.tod=key;
 {const ef={dawn:.85,sunset:.6,night:.1}[key]||1,wm=({dawn:[.96,.9,.86],sunset:[1,.8,.6]})[key]||[1,1,1],wc=new THREE.Color(wm[0],wm[1],wm[2]);sc.traverse(o=>{const m=o.isMesh&&o.material;if(!m||!m.emissive)return;if(!m.userData._e0)m.userData._e0=m.emissive.clone();m.emissive.copy(m.userData._e0).multiplyScalar(ef).multiply(wc)})}/* the daytime lifts must not glow at night */
 if(!K){if(P.resetTod)P.resetTod();return}
 for(const o of sc.children){
  if(o.isHemisphereLight){const h=A.hemi||[0xb0c4e0,0x607040];o.color.setHex(key==='night'?0x3a4a80:h[0]);if(key!=='night')o.color.lerp(new THREE.Color(K.fogW),.3);o.groundColor.setHex(key==='night'?0x10141f:h[1]);if(key!=='night')o.groundColor.multiplyScalar(.8);o.intensity=(A.hemiI||1.1)*K.hi}
  else if(o.isDirectionalLight){const at=A.sunAt||[-150,250,100],hz=Math.hypot(at[0],at[2])||1,L=330;o.color.setHex(K.sun);o.intensity=(A.sunI||1)*K.si;o.position.set(at[0]/hz*L*Math.sqrt(1-K.el*K.el),L*K.el,at[2]/hz*L*Math.sqrt(1-K.el*K.el))}
  else if(o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===1500){o.material.map=gradTex(K.top,K.hor,1);o.material.needsUpdate=true}}
 sunGlow(sc,A,K,key);
 if(sc.fog){const f=new THREE.Color(A.fog!=null?A.fog:T.d.fog);f.lerp(new THREE.Color(K.fogW),K.fogM);sc.fog.color.copy(f);if(sc.userData.ptFog)sc.userData.ptFog.color.copy(f);if(sc.background&&sc.background.isColor)sc.background.copy(f);
  sc.fog.near=(A.near||150)*K.near;sc.fog.far=(A.far||620)*K.far;if(sc.userData.ptFog){sc.userData.ptFog.near=sc.fog.near;sc.userData.ptFog.far=sc.fog.far}}
 const fx=sc.userData.skyFx;if(fx){if(fx.ring)fx.ring.material.color.setRGB(K.ring[0],K.ring[1],K.ring[2]);
  for(const c of fx.clouds||[]){const m=c.material;if(!m.userData.c0)m.userData.c0=m.color.clone();m.color.copy(m.userData.c0).multiply(new THREE.Color(K.cl[0],K.cl[1],K.cl[2]))}}
 if(key==='night'&&!sc.userData.stars){sc.userData.stars=1;const st=[],r=Math.random;for(let i=0;i<420;i++){const a=r()*6.28,b=r()*1.25+.08;st.push(Math.cos(a)*Math.cos(b)*1400,Math.sin(b)*1400,Math.sin(a)*Math.cos(b)*1400)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(st,3));sc.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false})))}
 if(U){U.mul.value.set(K.mul[0],K.mul[1],K.mul[2]);U.add.value.set(K.add[0],K.add[1],K.add[2]);U.sat.value=K.sat}
 P.baseExpo=P.baseExpo||R.toneMappingExposure;R.toneMappingExposure=P.baseExpo*K.exp}
setTimeout(()=>{const at=P.applyTod;if(!at)return;P.applyTod=function(sc,T,key){if(sc&&T&&T.d&&T.d.stage&&T.d.cartoon&&T.d._key){/* one look per stage (Nov 10) */if(!(window.PTO&&window.PTO.todLock===false))key='day';try{stageTod(sc,T,key);return}catch(e){console.warn('stageTod',e)}}return at.apply(this,arguments)}},0);
})();
