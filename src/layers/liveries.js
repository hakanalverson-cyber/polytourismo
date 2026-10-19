/* ===== Poly Tourismo v9 layer: liveries =====
   Every car has one body-paint mesh. At first use each paint mesh gets two baked vertex attributes in a
   car-relative frame (aLp = along / across / height, aLn = normal in the same frame). A generated 1024px
   canvas holds three painted maps (top, right side, left side); the paint material samples them by those
   coordinates, so one design wraps every model without relying on the GLB UVs. */
(function v9liv(){
'use strict';
const P=window.PT8;
const PAL=['#f1f3f5','#c4c9cf','#8a9199','#3b4048','#111316','#5a0f24',
 '#d7263d','#ff6f61','#ff7a1a','#ffb400','#f2e205','#9be315',
 '#1fa84f','#14532d','#12b5a6','#2cc7f0','#4aa3ff','#1f5fe0',
 '#12285e','#4b3fcf','#8a4bdc','#e0359a','#ff8fb3','#ffc2a0',
 '#d9c49a','#c9a227','#b0702f','#7a4a2b','#6b6b2a','#a8ffd0',
 '#cfe9ff','#9b1d2d','#e8e0d0','#2b3a34','#33203f','#ff3d00'];
const FIN=[{n:'Gloss',r:.30,m:.08},{n:'Satin',r:.52,m:.06},{n:'Matte',r:.92,m:0},{n:'Metallic',r:.34,m:.42}];
const WHL=[{n:'Stock',c:null},{n:'White',c:'#eef0f2'},{n:'Black',c:'#1a1c20'},{n:'Gold',c:'#d4a72c'},{n:'Red',c:'#d7263d'},{n:'Silver',c:'#aeb4bb'},{n:'Accent',c:'accent'}];
const PATS=['Solid','Racing stripe','Twin stripe','Beltline','Two-tone','Chevron','Checker','Slash','Fade','Flames','Camo','Streaks','Facets','Rally panel','Lightning','Pinstripe'];
const PRESETS=[
 {n:'Harbor',p:1,a:'#12285e',b:'#f1f3f5',c:'#2cc7f0',f:0,w:1},
 {n:'Ember',p:9,a:'#111316',b:'#ff7a1a',c:'#ffb400',f:0,w:2},
 {n:'Chalk',p:4,a:'#f1f3f5',b:'#111316',c:'#d7263d',f:1,w:2},
 {n:'Tropic',p:8,a:'#12b5a6',b:'#ff6f61',c:'#f1f3f5',f:0,w:1},
 {n:'Night Run',p:14,a:'#111316',b:'#8a4bdc',c:'#2cc7f0',f:3,w:2},
 {n:'Forest Ops',p:10,a:'#14532d',b:'#6b6b2a',c:'#3b4048',f:2,w:2},
 {n:'Pit Wall',p:6,a:'#f1f3f5',b:'#111316',c:'#d7263d',f:0,w:2},
 {n:'Drift King',p:7,a:'#111316',b:'#e0359a',c:'#f2e205',f:0,w:6},
 {n:'Heritage',p:2,a:'#14532d',b:'#f1f3f5',c:'#c9a227',f:0,w:3},
 {n:'Poly',p:12,a:'#1f5fe0',b:'#8a4bdc',c:'#2cc7f0',f:1,w:1},
 {n:'Rally Red',p:13,a:'#d7263d',b:'#111316',c:'#f1f3f5',f:0,w:1,n0:7},
 {n:'Arctic',p:11,a:'#cfe9ff',b:'#1f5fe0',c:'#f1f3f5',f:1,w:5},
 {n:'Gold Rush',p:3,a:'#111316',b:'#c9a227',c:'#f1f3f5',f:3,w:3},
 {n:'Sunburst',p:5,a:'#f2e205',b:'#111316',c:'#ff7a1a',f:0,w:2},
 {n:'Bordeaux',p:15,a:'#5a0f24',b:'#c9a227',c:'#f1f3f5',f:0,w:3},
 {n:'Mono',p:1,a:'#3b4048',b:'#f1f3f5',c:'#8a9199',f:2,w:2}];
P.LIVPRESETS=PRESETS;

/* ---------- small helpers ---------- */
const RNG=s=>{let a=(s>>>0)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const hx=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const rgb=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return rgb(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)};
const lumOf=h=>{const c=hx(h);return(c[0]*.299+c[1]*.587+c[2]*.114)/255};
const shade=(h,f)=>f>=0?mixc(h,'#ffffff',f):mixc(h,'#000000',-f);
const ink=h=>lumOf(h)>.58?'#14161a':'#f4f6f8';
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

/* ---------- pattern painters (unit coords; x 0 = rear, 1 = front; top: y 0 = left; side: y 0 = roof, 1 = sill) ---------- */
function flame(k,x0,y0,len,th,curl,col){const{g,X,Y}=k;g.fillStyle=col;g.beginPath();g.moveTo(X(x0),Y(y0));
 g.bezierCurveTo(X(x0-len*.35),Y(y0-th*.2),X(x0-len*.7),Y(y0-curl*.35),X(x0-len),Y(y0-curl));
 g.bezierCurveTo(X(x0-len*.7),Y(y0+th*.1),X(x0-len*.4),Y(y0+th*.55),X(x0),Y(y0+th));g.closePath();g.fill()}
function bolt(k,x,y,w,h,col){k.Pl([[x,y],[x+w*.62,y],[x+w*.38,y+h*.4],[x+w*.82,y+h*.4],[x+w*.12,y+h],[x+w*.34,y+h*.55],[x,y+h*.55]],col)}
const PATF=[
 /*0 solid*/()=>{},
 /*1 racing stripe*/k=>{if(k.top){k.R(0,.355,1,.645,k.b);k.R(0,.29,1,.315,k.c);k.R(0,.685,1,.71,k.c)}else{k.R(0,.835,1,.86,k.c);k.R(0,.875,1,.965,k.b)}},
 /*2 twin stripe*/k=>{if(k.top){k.R(0,.30,1,.42,k.b);k.R(0,.58,1,.70,k.b);k.R(0,.435,1,.45,k.c);k.R(0,.55,1,.565,k.c)}else{k.R(0,.86,1,.89,k.c);k.R(0,.91,1,.97,k.b)}},
 /*3 beltline*/k=>{if(k.top){k.R(.52,.15,1,.19,k.b);k.R(.52,.81,1,.85,k.b);k.R(0,.47,1,.53,k.c)}else{k.R(0,.50,1,.62,k.b);k.R(0,.64,1,.665,k.c)}},
 /*4 two-tone*/k=>{if(k.top){k.R(0,0,1,1,k.b);k.R(0,.455,1,.545,k.c)}else{k.R(0,0,1,.42,k.b);k.R(0,.42,1,.45,k.c)}},
 /*5 chevron*/k=>{if(k.top){for(let i=0;i<5;i++){const x=.40+.12*i;k.Pl([[x,.12],[x+.06,.12],[x+.15,.5],[x+.06,.88],[x,.88],[x+.09,.5]],i%2?k.c:k.b)}}
   else{for(let i=0;i<5;i++){const x=.10+.17*i;k.Pl([[x,.44],[x+.07,.44],[x+.16,.69],[x+.07,.94],[x,.94],[x+.09,.69]],i%2?k.c:k.b)}}},
 /*6 checker*/k=>{const{g,W,H}=k,cw=W/36;let rows=k.top?5:3,y0=k.top?H/2-rows*cw/2:H*.52;for(let r=0;r<rows;r++)for(let i=0;i<36;i++){g.fillStyle=(i+r)%2?k.c:k.b;g.fillRect(i*cw,y0+r*cw,cw+.6,cw+.6)}},
 /*7 slash*/k=>{if(k.top){for(let i=0;i<3;i++){const x=.34+.22*i;k.Pl([[x,0],[x+.09,0],[x+.02,1],[x-.07,1]],k.b);k.Pl([[x+.11,0],[x+.14,0],[x+.07,1],[x+.04,1]],k.c)}}
   else{for(let i=0;i<3;i++){const x=.12+.27*i;k.Pl([[x,1],[x+.10,1],[x+.30,.2],[x+.20,.2]],k.b);k.Pl([[x+.12,1],[x+.15,1],[x+.35,.2],[x+.32,.2]],k.c)}}},
 /*8 fade*/k=>{const{g,W,H}=k;let gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,k.a);gr.addColorStop(.3,k.a);gr.addColorStop(1,k.b);g.fillStyle=gr;g.fillRect(0,0,W,H);
   if(!k.top){gr=g.createLinearGradient(0,H*.62,0,H);gr.addColorStop(0,k.c+'00');gr.addColorStop(1,k.c);g.fillStyle=gr;g.fillRect(0,H*.62,W,H*.38)}},
 /*9 flames*/k=>{if(k.top){const big=[[.12,.50,.10,.10],[.25,.36,.08,.08],[.02,.30,.08,.10]],small=[[.14,.30,.06,.06],[.04,.20,.05,.05]];
   for(const s of[1,-1]){const pl=(a,col)=>flame(k,1,s>0?a[0]:1-a[0],a[1],s>0?a[2]:-a[2],s>0?-a[3]:a[3],col);big.forEach(a=>pl(a,k.b));small.forEach(a=>pl(a,k.c))}}
   else{[[.98,.56,.66,.15,.20],[.98,.69,.54,.14,.14],[.98,.81,.44,.13,.10],[.98,.44,.44,.12,.18]].forEach(a=>flame(k,a[0],a[1],a[2],a[3],a[4],k.b));
     [[.98,.60,.42,.08,.13],[.98,.72,.32,.07,.09]].forEach(a=>flame(k,a[0],a[1],a[2],a[3],a[4],k.c))}},
 /*10 camo*/k=>{const{g}=k,r=k.rnd,cs=[k.b,k.c,shade(k.a,-.38),shade(k.a,.18)];for(let i=0;i<110;i++){const cx=r(),cy=r(),rad=.04+r()*.09,n=7+(r()*3|0),ph=r()*6.28;g.fillStyle=cs[i%4];g.beginPath();
   for(let j=0;j<n;j++){const an=ph+j/n*6.283,rr=rad*(.55+r()*.7);const px=k.X(cx+Math.cos(an)*rr*(k.top?.8:.7)),py=k.Y(cy+Math.sin(an)*rr*(k.top?1.1:1.3));j?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.fill()}},
 /*11 streaks*/k=>{const r=k.rnd;for(let i=0;i<18;i++){const y=r(),x0=r()*.55,len=.18+r()*.5,th=.012+r()*.03;k.Pl([[x0,y-th],[x0+len,y-th*.2],[x0+len,y+th*.2],[x0,y+th]],i%3?k.b:k.c)}},
 /*12 facets*/k=>{const{g,W,H}=k,r=k.rnd,cols=16,rows=Math.max(3,Math.round(cols*H/W*1.8)),pts=[];for(let j=0;j<=rows;j++){pts[j]=[];for(let i=0;i<=cols;i++){const jx=(i===0||i===cols)?0:(r()-.5)*.7,jy=(j===0||j===rows)?0:(r()-.5)*.7;pts[j][i]=[(i+jx)/cols,(j+jy)/rows]}}
   const tri=(a,b,c)=>{const t=(a[0]+b[0]+c[0])/3,q=r();let col=mixc(k.a,k.b,sstep(.15,.95,t));if(q>.92)col=k.c;col=shade(col,(r()-.5)*.26);g.fillStyle=col;g.strokeStyle=col;g.lineWidth=.7;g.beginPath();g.moveTo(k.X(a[0]),k.Y(a[1]));g.lineTo(k.X(b[0]),k.Y(b[1]));g.lineTo(k.X(c[0]),k.Y(c[1]));g.closePath();g.fill();g.stroke()};
   for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=pts[j][i],b=pts[j][i+1],c=pts[j+1][i],d=pts[j+1][i+1];if((i+j)%2){tri(a,b,c);tri(b,d,c)}else{tri(a,b,d);tri(a,d,c)}}},
 /*13 rally panel*/k=>{const{g}=k;if(k.top){k.R(0,.42,1,.58,k.b);k.RR(.70,.28,.92,.72,k.b,.03);k.RR(.715,.33,.905,.67,k.c,.025)}else{k.R(0,.86,1,.97,k.b);k.RR(.33,.46,.67,.84,k.b,.03);k.RR(.345,.50,.655,.80,k.c,.025)}},
 /*14 lightning*/k=>{if(k.top){bolt(k,.60,.18,.32,.64,k.c);bolt(k,.62,.22,.28,.56,k.b)}else{bolt(k,.30,.36,.40,.56,k.c);bolt(k,.32,.40,.36,.48,k.b)}},
 /*15 pinstripe*/k=>{if(k.top){[.28,.34,.66,.72].forEach((y,i)=>k.R(0,y,1,y+.018,i%2?k.c:k.b))}else{[.52,.58,.64,.70].forEach((y,i)=>k.R(0,y,1,y+.026,i%2?k.c:k.b))}}];

function numPlate(k,cx,cy,rx,ry,txt,mirror,plate){const{g}=k;g.save();g.translate(k.X(cx),k.Y(cy));
 if(plate!==false){g.fillStyle='#0b0d10';g.beginPath();g.ellipse(0,0,k.X(rx)+3,k.Y(ry)+3,0,0,6.2832);g.fill();g.fillStyle=k.pl;g.beginPath();g.ellipse(0,0,k.X(rx),k.Y(ry),0,0,6.2832);g.fill()}
 if(mirror)g.scale(-1,1);const t=String(txt);let fs=k.Y(ry)*1.55;g.font=`italic 900 ${fs}px "Arial Black",Impact,"Helvetica Neue",Arial,sans-serif`;
 const maxw=k.X(rx)*1.6;let w=g.measureText(t).width;if(w>maxw){fs*=maxw/w;g.font=`italic 900 ${fs}px "Arial Black",Impact,"Helvetica Neue",Arial,sans-serif`}
 g.fillStyle=ink(k.pl);g.textAlign='center';g.textBaseline='middle';g.fillText(t,0,fs*.04);g.restore()}

function paintView(g,view,W,H,L,seed){
 const top=view==='top',left=view==='left';const X=u=>u*W,Y=v=>v*H;
 g.fillStyle=L.a;g.fillRect(0,0,W,H);
 const R=(u0,v0,u1,v1,c)=>{g.fillStyle=c;g.fillRect(X(u0),Y(v0),X(u1)-X(u0),Y(v1)-Y(v0))};
 const Pl=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fill()};
 const RR=(u0,v0,u1,v1,c,r)=>{g.fillStyle=c;const x=X(u0),y=Y(v0),w=X(u1)-x,h=Y(v1)-y,rr=Math.min(w,h)*r*8;g.beginPath();g.moveTo(x+rr,y);g.arcTo(x+w,y,x+w,y+h,rr);g.arcTo(x+w,y+h,x,y+h,rr);g.arcTo(x,y+h,x,y,rr);g.arcTo(x,y,x+w,y,rr);g.closePath();g.fill()};
 const k={g,top,R,Pl,RR,X,Y,W,H,a:L.a,b:L.b,c:L.c,pl:L.c,rnd:RNG((seed||1)*131+(top?1:left?3:2)*977)};
 (PATF[L.p]||PATF[0])(k);
 if(L.n>0){const t=L.n;
  if(L.p===13){if(top)numPlate(k,.81,.5,.085,.15,t,false,false);else numPlate(k,.50,.65,.13,.17,t,left,false)}
  else if(top){numPlate(k,.80,.5,.075,.17,t,false)}
  else numPlate(k,.50,.66,.075,.19,t,left)}
}
function drawLivery(cv,L){const s=cv.width/1024,g=cv.getContext('2d');g.setTransform(s,0,0,s,0,0);
 [['top',0,384],['right',384,320],['left',704,320]].forEach(b=>{g.save();g.beginPath();g.rect(0,b[1],1024,b[2]);g.clip();g.translate(0,b[1]);paintView(g,b[0],1024,b[2],L,L.s||1);g.restore()})}

/* ---------- model baking ---------- */
const FWD=new THREE.Vector3(),RGT=new THREE.Vector3(),tv=new THREE.Vector3();
function isPaintMesh(o){if(!o.isMesh||!/^paint/i.test(o.name))return false;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||!m.color)return false;const c=m.color;return c.r*.3+c.g*.59+c.b*.11>.02}
function bake(model){if(!model||model.userData.livBaked)return;model.userData.livBaked=1;model.updateMatrixWorld(true);
 const meshes=[];model.traverse(o=>{if(o.isMesh)meshes.push(o)});
 const sz=new THREE.Box3().setFromObject(model).getSize(tv),lx=sz.x>sz.z,ctr=o=>new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
 let fc=null,rc=null;meshes.forEach(o=>{if(/^front/i.test(o.name))fc=ctr(o);else if(/^rear/i.test(o.name))rc=ctr(o)});
 let s=1;if(fc&&rc){const d=lx?fc.x-rc.x:fc.z-rc.z;s=d<0?-1:1}
 lx?FWD.set(s,0,0):FWD.set(0,0,s);RGT.crossVectors(FWD,new THREE.Vector3(0,1,0));
 let rim=null,rl=-1;
 meshes.forEach(o=>{
  if(/^rims/i.test(o.name)&&o.material&&o.material.color){const c=o.material.color,l=c.r*.3+c.g*.59+c.b*.11;if(l>rl){rl=l;rim=o}}
  if(!isPaintMesh(o))return;const g=o.geometry,pos=g.attributes.position,nor=g.attributes.normal;if(!pos||!nor||g.attributes.aLp)return;
  const n=pos.count,f=new Float32Array(n),r=new Float32Array(n),y=new Float32Array(n),nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
  let f0=1e9,f1=-1e9,r0=1e9,r1=-1e9,y0=1e9,y1=-1e9;
  for(let i=0;i<n;i++){tv.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);f[i]=tv.dot(FWD);r[i]=tv.dot(RGT);y[i]=tv.y;
   if(f[i]<f0)f0=f[i];if(f[i]>f1)f1=f[i];if(r[i]<r0)r0=r[i];if(r[i]>r1)r1=r[i];if(y[i]<y0)y0=y[i];if(y[i]>y1)y1=y[i]}
  const rm=(r0+r1)/2,rh=Math.max(.01,(r1-r0)/2),fl=Math.max(.01,f1-f0),yh=Math.max(.01,y1-y0),lp=new Float32Array(n*3),ln=new Float32Array(n*3),nv=new THREE.Vector3();
  for(let i=0;i<n;i++){lp[i*3]=(f[i]-f0)/fl;lp[i*3+1]=Math.max(-1,Math.min(1,(r[i]-rm)/rh));lp[i*3+2]=(y[i]-y0)/yh;
   nv.fromBufferAttribute(nor,i).applyMatrix3(nm).normalize();ln[i*3]=nv.dot(FWD);ln[i*3+1]=nv.dot(RGT);ln[i*3+2]=nv.y}
  g.setAttribute('aLp',new THREE.BufferAttribute(lp,3));g.setAttribute('aLn',new THREE.BufferAttribute(ln,3));
  const m=Array.isArray(o.material)?o.material[0]:o.material;model.userData.livStock='#'+m.color.getHexString();
  g.userData.livInfo={fl,rh,yh}});
 if(rim)rim.geometry.userData.livRim=1}
function bakeAll(){const cm=CAR_MODELS;if(cm)for(let i=0;i<cm.length;i++)if(cm[i])bake(cm[i])}
const stockColor=idx=>{bakeAll();const m=CAR_MODELS[idx];return(m&&m.userData.livStock)||'#8a9199'};

/* ---------- material with the livery shader ---------- */
const GLSL=`{float wt=smoothstep(.38,.78,vLn.z);float sx=clamp(vLp.x,.004,.996);
 vec2 uT=vec2(sx,clamp(.5+.5*vLp.y,.012,.988)*.375);float hh=clamp(1.-vLp.z,.02,.98);float off=vLp.y>=0.?.375:.6875;
 vec2 uS=vec2(sx,off+hh*.3125);diffuseColor.rgb=mix(texture2D(uLiv,uS).rgb,texture2D(uLiv,uT).rgb,wt)*uGain;}`;
function inject(sh,uL,graded,uG){sh.uniforms.uLiv=uL;sh.uniforms.uGain=uG;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aLp;attribute vec3 aLn;varying vec3 vLp;varying vec3 vLn;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLp=aLp;vLn=aLn;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uLiv;uniform float uGain;varying vec3 vLp;varying vec3 vLn;').replace('#include <color_fragment>','#include <color_fragment>\n'+GLSL);
 if(graded)sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor.rgb=mix(vec3(monoLuma),gl_FragColor.rgb,0.50);','gl_FragColor.rgb=mix(vec3(monoLuma),gl_FragColor.rgb,0.82);')}
function makeMat(m0,graded){const mm=m0.clone();mm.userData={uL:{value:null},uG:{value:1},lg:graded};mm.color.set(0xffffff);
 if(graded&&typeof styleMaterial==='function')styleMaterial(mm);
 const prev=mm.onBeforeCompile;mm.onBeforeCompile=function(sh){if(prev)prev.call(this,sh);inject(sh,mm.userData.uL,graded,mm.userData.uG)};
 mm.customProgramCacheKey=()=>(graded?'street-matte-v4':'plain')+'-liv2';mm.needsUpdate=true;return mm}

/* ---------- texture cache ---------- */
const texCache=new Map();
function texFor(L,size){const key=size+'|'+JSON.stringify(L);let t=texCache.get(key);if(!t){const cv=document.createElement('canvas');cv.width=cv.height=size;drawLivery(cv,L);t=new THREE.CanvasTexture(cv);t.flipY=false;t.encoding=THREE.sRGBEncoding;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=4;texCache.set(key,t)}return t}
function clearTex(){texCache.forEach(t=>t.dispose());texCache.clear()}

/* ---------- apply to a car visual ---------- */
function applyTo(group,L,o){o=o||{};if(!group)return;bakeAll();const tex=L?(o.tex||texFor(L,o.size||1024)):null,rimC=L&&WHL[L.w|0]&&WHL[L.w|0].c;
 group.traverse(m=>{if(!m.isMesh||!m.geometry)return;const g=m.geometry;
  if(g.attributes&&g.attributes.aLp){if(!m.userData.mat0)m.userData.mat0=m.material;
   if(!L){m.material=m.userData.mat0;return}
   let mm=m.userData.livMat;if(!mm||mm.userData.lg!==!!o.graded){mm=makeMat(m.userData.mat0,!!o.graded);m.userData.livMat=mm}
   mm.userData.uL.value=tex;mm.userData.uG.value=o.gain||(o.graded?.5:1);const f=FIN[L.f|0]||FIN[0];mm.roughness=f.r+(o.graded?.16:0);mm.metalness=o.graded?Math.min(f.m,.3):f.m;if(!o.graded)mm.envMapIntensity=.10+f.m*.8;m.material=mm}
  else if(g.userData&&g.userData.livRim){if(!m.userData.mat0)m.userData.mat0=m.material;
   if(!rimC){m.material=m.userData.mat0;return}
   let mm=m.userData.livMat;if(!mm){mm=m.userData.mat0.clone();m.userData.livMat=mm}
   mm.color.set(rimC==='accent'?L.b:rimC);mm.roughness=.35;mm.metalness=Math.min(.35,mm.metalness||0);m.material=mm}})}

/* ---------- saved liveries ---------- */
const key=(id,alt)=>P.tuneKey(id,alt);
const norm=L=>L&&Object.assign({p:0,a:'#8a9199',b:'#f1f3f5',c:'#111316',f:0,w:0,n:0,s:1},L);
P.livGet=(id,alt)=>{const sv=P.SV();const L=sv.liv&&sv.liv[key(id,alt)];return L?norm(L):null};
P.livSet=(id,alt,L)=>{const sv=P.SV();if(!sv.liv)sv.liv={};if(L)sv.liv[key(id,alt)]=Object.assign({},L);else delete sv.liv[key(id,alt)];P.save()};

/* ---------- race: humans use their saved scheme, CPUs get a curated one ---------- */
function aiLivery(r,used){let p;for(let t=0;t<12;t++){p=PRESETS[(r()*PRESETS.length)|0];if(!used.has(p.n))break}used.add(p.n);
 let n=1+((r()*98)|0);return norm({p:p.p,a:p.a,b:p.b,c:p.c,f:p.f,w:p.w,n,s:1+((r()*9999)|0)})}
const l0=P.launch;P.launch=cfg=>{clearTex();l0(cfg);const Rc=RACE;if(!Rc)return;const r=RNG((Date.now()&0xffffff)),used=new Set();
 Rc.cars.forEach(c=>{const vm=c.m&&c.m.visualModel;if(!vm)return;let L=null;
  if(c.human){if(!c.loan)L=P.livGet(c.carId,c.alt)}else if(!(cfg.mode==='cutup'&&false))L=aiLivery(r,used);
  c.liv=L;if(L)applyTo(vm,L,{size:c.human?1024:512,graded:true})})};

/* ---------- showroom ---------- */
const ED={key:null,L:null,stock:true,cv:null,tex:null,ver:0,slot:0,id:null,alt:0};
function studio(S,SR){if(!S||!S.car)return;let L=null,tex=null,ver=0;const k=key(SR.id,SR.alt);
 if(SR.kind==='garage'&&P.owns(SR.id,SR.alt)){if(SR.lv&&ED.key===k){L=ED.stock?null:ED.L;tex=ED.tex;ver=ED.ver}else{L=P.livGet(SR.id,SR.alt)}}
 const sig=S.car.uuid+'|'+k+'|'+ver+'|'+(L?JSON.stringify(L):'-');if(S.livSig===sig)return;S.livSig=sig;applyTo(S.car,L,{tex:L&&tex&&L===ED.L?tex:null,size:1024,graded:false,gain:.55})}

/* ---------- editor ---------- */
function openEd(id,alt){const k=key(id,alt);if(ED.key===k&&ED.cv)return;ED.key=k;ED.id=id;ED.alt=alt;const sv=P.livGet(id,alt),idx=P.modelOf(id,alt);
 ED.stock=!sv;ED.L=sv||norm({a:stockColor(idx),s:1+((Math.random()*9999)|0)});if(!ED.cv){ED.cv=document.createElement('canvas');ED.cv.width=ED.cv.height=1024;ED.tex=new THREE.CanvasTexture(ED.cv);ED.tex.flipY=false;ED.tex.encoding=THREE.sRGBEncoding;ED.tex.generateMipmaps=true;ED.tex.minFilter=THREE.LinearMipmapLinearFilter;ED.tex.anisotropy=4}
 redraw()}
function redraw(){drawLivery(ED.cv,ED.L);ED.tex.needsUpdate=true;ED.ver++}
function commit(){if(ED.stock)ED.stock=false;P.livSet(ED.id,ED.alt,ED.L);redraw()}
function thumb(L,w){const h=Math.round(w*.42),cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),sw=Math.round(w*1.5),sh=Math.round(sw*.30),t=document.createElement('canvas');t.width=sw;t.height=sh;
 paintView(t.getContext('2d'),'right',sw,sh,L,L.s||1);
 g.save();g.beginPath();const S=[[.02,.74],[.03,.58],[.16,.52],[.30,.28],[.46,.2],[.62,.2],[.76,.42],[.92,.52],[.98,.62],[.98,.74]];S.forEach((p,i)=>i?g.lineTo(p[0]*w,p[1]*h*1.12):g.moveTo(p[0]*w,p[1]*h*1.12));g.closePath();g.clip();
 g.drawImage(t,0,.2*h*1.12,w,.58*h*1.12);g.restore();g.fillStyle='#07090b';[.2,.8].forEach(x=>{g.beginPath();g.arc(x*w,.76*h*1.12,h*.1,0,6.3);g.fill()});
 g.strokeStyle='#0008';g.lineWidth=1;g.stroke();return cv}
P.livThumb=(id,alt,w)=>{const L=P.livGet(id,alt);return L?thumb(L,w||84):null};

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function panelHTML(){const L=ED.L,slotN=['Body','Accent','Trim'],sk=['a','b','c'][ED.slot];
 return `<div class="lv"><div class="th"><b>LIVERY</b><span class="lvb"><button class="btn sm" data-a="rnd"><span>Random</span></button><button class="btn sm" data-a="stock"><span>Stock</span></button></span></div>
 <div class="lvh">Presets</div><div class="lvpre" id="lvPre">${PRESETS.map((p,i)=>`<div class="lvt pre" data-a="pre" data-i="${i}" title="${p.n}"><i data-th="${i}"></i><span>${p.n}</span></div>`).join('')}</div>
 <div class="lvh">Pattern</div><div class="lvpg">${PATS.map((n,i)=>`<div class="lvt ${!ED.stock&&L.p===i?'sel':''}" data-a="pat" data-i="${i}"><i data-tp="${i}"></i><span>${n}</span></div>`).join('')}</div>
 <div class="lvh">Colours</div><div class="lvsl">${slotN.map((n,i)=>`<button class="${ED.slot===i?'sel':''}" data-a="slot" data-i="${i}"><i style="background:${L['abc'[i]]}"></i><span>${n}</span></button>`).join('')}</div>
 <div class="lvsw">${PAL.map(c=>`<b data-a="col" data-c="${c}" class="${L[sk].toLowerCase()===c?'sel':''}" style="background:${c}"></b>`).join('')}</div>
 <label class="lvcu"><span>Custom</span><input type="color" id="lvCu" value="${L[sk]}"></label>
 <div class="lvh">Finish</div><div class="lvch">${FIN.map((f,i)=>`<button class="${L.f===i?'sel':''}" data-a="fin" data-i="${i}"><span>${f.n}</span></button>`).join('')}</div>
 <div class="lvh">Wheels</div><div class="lvwh">${WHL.map((w,i)=>`<button class="${L.w===i?'sel':''}" data-a="whl" data-i="${i}" title="${w.n}"><i style="background:${w.c==='accent'?L.b:w.c||'linear-gradient(135deg,#575757 50%,#2e2e2e 50%)'}"></i></button>`).join('')}</div>
 <div class="lvh">Race number</div><div class="lvnum"><button class="btn sm" data-a="num" data-d="-1"><span>&lsaquo;</span></button><em>${L.n>0?String(L.n).padStart(2,'0'):'OFF'}</em><button class="btn sm" data-a="num" data-d="1"><span>&rsaquo;</span></button><button class="btn sm" data-a="num" data-d="r"><span>Random</span></button></div>
 <div class="lvn">${ED.stock?'Stock paint. Pick anything to start a livery.':'Saved per car, and per colour variant. CPU rivals get their own.'}</div></div>`}
function fillThumbs(el){el.querySelectorAll('[data-th]').forEach(e=>{const p=PRESETS[+e.dataset.th];e.appendChild(thumb(norm(p),92))});
 el.querySelectorAll('[data-tp]').forEach(e=>{const i=+e.dataset.tp;e.appendChild(thumb(Object.assign({},ED.L,{p:i,n:0}),84))})}
function panel(el,SR){openEd(SR.id,SR.alt);const sx=el.scrollTop;const draw=()=>{const px=(el.querySelector('#lvPre')||{}).scrollLeft||0,y=el.scrollTop;el.innerHTML=panelHTML();fillThumbs(el);el.scrollTop=y;const pr=el.querySelector('#lvPre');if(pr){pr.scrollLeft=px;pr.onwheel=e=>{pr.scrollLeft+=e.deltaY+e.deltaX;e.preventDefault()}}
  const cu=el.querySelector('#lvCu');if(cu){cu.oninput=()=>{ED.L['abc'[ED.slot]]=cu.value;commit()};cu.onchange=()=>{ED.L['abc'[ED.slot]]=cu.value;commit();draw()}}};
 el.onclick=e=>{const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,i=+t.dataset.i,L=ED.L;let did=1;
  if(a==='stock'){ED.stock=true;P.livSet(ED.id,ED.alt,null);ED.L=norm({a:stockColor(P.modelOf(ED.id,ED.alt)),s:L.s});redraw()}
  else if(a==='pre'){const p=PRESETS[i];ED.L=norm({p:p.p,a:p.a,b:p.b,c:p.c,f:p.f,w:p.w,n:p.n0||0,s:L.s});commit()}
  else if(a==='pat'){if(ED.stock){/* keep the car's own paint as the base colour */}L.p=i;commit()}
  else if(a==='slot'){ED.slot=i}
  else if(a==='col'){L['abc'[ED.slot]]=t.dataset.c;commit()}
  else if(a==='fin'){L.f=i;commit()}
  else if(a==='whl'){L.w=i;commit()}
  else if(a==='num'){if(t.dataset.d==='r')L.n=1+((Math.random()*98)|0);else L.n=(L.n+ +t.dataset.d+100)%100;commit()}
  else if(a==='rnd'){const r=Math.random,pk=()=>PAL[(r()*PAL.length)|0];let a1=pk(),b1=pk(),c1=pk();for(let q=0;q<8&&Math.abs(lumOf(a1)-lumOf(b1))<.25;q++)b1=pk();
   ED.L=norm({p:1+((r()*15)|0),a:a1,b:b1,c:c1,f:(r()*4)|0,w:(r()*WHL.length)|0,n:r()<.6?1+((r()*98)|0):0,s:1+((r()*9999)|0)});commit()}
  else did=0;
  if(did){if(P.sfx)P.sfx('select');draw()}};
 draw();el.scrollTop=sx}
P.LV={panel,studio,applyTo,thumb,PRESETS,PATS,drawLivery,paintView,stockColor,ED,bakeAll,texFor};
})();
