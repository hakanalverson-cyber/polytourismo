/* ===== Poly Tourismo v9 layer: stages (Rally: Mangrove Ford, Terrace Run, Ashfall Stage, Autumn Ridge) =====
   Four brand-new gravel stages. They share the rally road/terrain builder but own their
   ground colours, vegetation, props, backdrop and (two of them) real water crossings. */
(function v9stages(){
'use strict';
const P=window.PT8,PI=Math.PI,K=P.PROPKIT,{Bx,Cy,Sp,Dd,def,PLAN}=K;
const gb={bank:8,shoulder:6,gravel:1,ice:[],walls:[],boost:[]};
const H=(n)=>new THREE.Color(n);
/* the engine treats hex colours as linear and lights them hot, so scenery palettes are authored in sRGB and squared */
const S=h=>{const r=(h>>16&255)/255,g=(h>>8&255)/255,b=(h&255)/255;return((r*r*255|0)<<16)|((g*g*255|0)<<8)|(b*b*255|0)};
const def2=(n,parts,fr,sk,o)=>{parts.forEach(p=>{p.c=S(p.c)});def(n,parts,fr,sk,o)};

/* ---------------- stage definitions ---------------- */
const mang={id:10,look:4,name:'Mangrove Ford',desc:'tropical swamp / three water fords / palms',hw:6,off:'grass',idw:.9,offs:0,amp:3.2,up:15,biome:'none',tod0:'day',
 sky:[0x5aa6c4,0xf3ead0],fog:0xbfdccf,sun:0xfff0cc,hemi:[0xe6f6ee,0x3c5a3a],road:'#85704f',dust:0xb9a37a,dirt:0x4b3b28,fords:[3,10,18],fordW:11,water:[0x03201e,.8],
 pts:[[-280,-170,3],[-200,-215,4],[-110,-225,2],[-30,-228,.6],[50,-215,2],[140,-235,5],[240,-205,7],[300,-130,6],[270,-50,4],[185,-10,3],[190,55,1.2],[200,120,2.5],[290,170,5],[310,255,7],[230,300,5],[130,270,3],[60,215,2.5],[-10,165,1.5],[-80,205,.8],[-150,238,2],[-240,250,4],[-310,190,6],[-300,100,5],[-215,60,3],[-140,95,3.5],[-110,20,4.5],[-170,-40,4],[-260,-60,3],[-310,-110,3.5]]};
const terr={id:11,look:5,name:'Terrace Run',desc:'vineyard switchbacks / hillside climb / golden hour',hw:5.6,off:'grass',idw:.93,offs:0,amp:3.4,up:20,biome:'none',tod0:'sunset',
 sky:[0x6f9fd0,0xf7e3bd],fog:0xe9d5ae,sun:0xffe0ac,hemi:[0xfff0d6,0x7a6a3c],road:'#b79f74',dust:0xd8c28c,dirt:0x7d6538,
 pts:[[-300,-250,6],[-150,-262,9],[0,-258,12],[150,-262,15],[250,-248,17],[300,-215,18],[285,-170,20],[210,-160,22],[100,-168,24],[-40,-160,27],[-170,-165,29],[-250,-150,30],[-270,-110,31],[-240,-80,32],[-150,-72,34],[-30,-80,36],[100,-72,38],[210,-80,40],[260,-55,41],[255,-10,42],[190,10,43],[80,0,44],[-50,10,45],[-160,5,46],[-230,30,47],[-200,90,46],[-120,130,44],[-20,150,40],[90,140,36],[190,170,30],[280,230,24],[250,310,17],[130,350,12],[0,330,10],[-130,350,8],[-260,320,7],[-340,230,6],[-360,120,5],[-355,0,5],[-350,-120,5]]};
/* ashfall: crater rim ring with a causeway spur that dives into the crater and U-turns */
const ap=[],pol=(a,r,y)=>ap.push([Math.round(Math.cos(a*PI/180)*r),Math.round(Math.sin(a*PI/180)*r),y]);
[[0,265,14],[30,255,20],[60,275,28],[90,260,36],[120,270,42],[150,255,44],[170,250,40],[182,185,33],[184,138,29],[187,100,26],[193,70,24],[205,70,24],[211,100,26],[214,138,29],[216,185,33],[238,262,36],[265,258,28],[300,268,22],[330,255,17]].forEach(q=>pol(q[0],q[1],q[2]));
{const q=ap.slice(),n=q.length;ap.length=0;for(let i=0;i<n;i++){const a=q[i],b=q[(i+1)%n];ap.push(a);const ra=Math.hypot(a[0],a[1]),rb=Math.hypot(b[0],b[1]);
 if(ra>240&&rb>240){const ang=(Math.atan2(a[1],a[0])+Math.atan2(b[1],b[0]))/2+(Math.abs(Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]))>3?PI:0),r=(ra+rb)/2+(i%2?-14:14);ap.push([Math.round(Math.cos(ang)*r),Math.round(Math.sin(ang)*r),+((a[2]+b[2])/2).toFixed(1)])}}}
const ash={id:12,look:6,name:'Ashfall Stage',desc:'volcano crater rim / lava causeway / ash storm',hw:5.8,off:'sand',idw:.9,offs:0,amp:6,up:26,biome:'none',tod0:'sunset',crater:1,
 sky:[0x2c2631,0xc9774e],fog:0x70524c,sun:0xffa468,hemi:[0xd09a82,0x2a2220],road:'#4f4944',dust:0x6f655e,dirt:0x2a2422,pts:ap};
const autu={id:13,look:4,name:'Autumn Ridge',desc:'golden forest ridge / two stream fords / leaf fall',hw:5.6,off:'dirt',idw:.88,offs:0,amp:5.5,up:28,biome:'forest',tod0:'dawn',fords:[9,16],fordW:9,water:[0x0f2e40,.76],
 sky:[0x7d9bbb,0xf2dfba],fog:0xe3cfae,sun:0xffd49a,hemi:[0xfbe5c8,0x6a4a2a],road:'#8c7050',dust:0xb99b6a,dirt:0x4b3421,
 pts:[[-330,-60,30],[-250,-115,34],[-160,-105,38],[-80,-60,42],[10,-90,46],[100,-135,48],[190,-105,44],[255,-45,36],[300,35,28],[305,100,22],[300,165,23],[250,240,30],[160,270,36],[70,230,40],[-10,165,38],[-100,175,32],[-175,215,26],[-250,255,24],[-320,205,28],[-345,120,32],[-290,40,34]]};
terr.pts=terr.pts.map(q=>[Math.round(q[0]*.75),Math.round(q[1]*.75),+(5+(q[2]-5)*.62).toFixed(1)]);
[mang,terr,ash,autu].forEach(d=>Object.assign(d,gb,{shoulder:6}));
/* longer and tighter: stretch each stage, then keep adding alternating sideways kinks mid-segment until it is over triple a regular track.
   Locked points (fords, the jump run-up, the crater spur) keep their neighbouring segments straight. */
const polyLen=p=>{let L=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];L+=Math.hypot(a[0]-b[0],a[1]-b[1])}return L};
function lengthen(d,target,amp,grow,lockIdx,jumpAt){const lock=new Set();let p=d.pts.map(q=>[Math.round(q[0]*grow),Math.round(q[1]*grow),q[2]]);
 lockIdx.forEach(i=>lock.add(p[i]));const fr=(d.fords||[]).map(k=>p[k]),jr=jumpAt!=null?p[jumpAt]:null;
 for(let pass=0;pass<5&&polyLen(p)*1.1<target;pass++){const out=[];
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];out.push(a);if(lock.has(a)||lock.has(b))continue;const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<95)continue;
   const sg=((i+pass)%2?1:-1)*Math.min(amp*L,d.kc||34);out.push([Math.round((a[0]+b[0])/2-dz/L*sg),Math.round((a[1]+b[1])/2+dx/L*sg),+((a[2]+b[2])/2).toFixed(1)])}
  p=out}
 d.pts=p;if(d.fords)d.fords=fr.map(r=>p.indexOf(r));if(jr)d.jumps=[[p.indexOf(jr),.5]]}
const TARGET=7600;autu.kc=52;ash.kc=46;ash.cs=3.0;
const ev=d=>d.pts.map((q,i)=>i).filter(i=>i%5===2);
lengthen(mang,TARGET,.4,2.3,[...mang.fords.flatMap(k=>[k-1,k,k+1]),...ev(mang)]);
lengthen(terr,TARGET,.24,2.0,ev(terr));
{const lk=[];ash.pts.forEach((q,i)=>{if(Math.hypot(q[0],q[1])<235){lk.push(i-1,i,i+1)}});lengthen(ash,TARGET,.5,3.0,[...lk.map(i=>(i+ash.pts.length)%ash.pts.length),...ev(ash).filter(i=>Math.hypot(ash.pts[i][0],ash.pts[i][1])>240)])}
lengthen(autu,TARGET,.5,3.0,[...autu.fords.flatMap(k=>[k-1,k,k+1]),4,5,...ev(autu)],4);
mang.hw=5;terr.hw=4.8;ash.hw=5;autu.hw=4.8;[mang,terr,ash,autu].forEach(d=>{d.hard=1});
D.push(mang,terr,ash,autu);
const J0=D.length-4;
[[J0+1,{l:50,a:.75,t:1.6,r:100,f:.12}],[J0+2,{l:50,a:.75,t:1.6,r:100,f:.12}],[J0+3,{l:50,a:.75,t:1.6,r:100,f:.12}]].forEach(([i,rx])=>{const j=P.pickJumps(D[i],1,rx);D[i].jumps=j.length?j:[]});
D[J0].jumps=[];/* fords flatten the road near them, so Autumn Ridge's crest jump sits on the far ridge instead */
P.TRACK_INFO.push({s:'GRAVEL',tags:['WATER FORDS','SWAMP','PALMS']},{s:'GRAVEL',tags:['VINEYARDS','SWITCHBACKS','CLIMB']},{s:'GRAVEL',tags:['CRATER','LAVA','ASH']},{s:'GRAVEL',tags:['AUTUMN','FORDS','LEAF FALL']});
P.STAGES=[J0,J0+1,J0+2,J0+3];

/* ---------------- sampleTrack: fords + crater ---------------- */
const ps=sampleTrack;
sampleTrack=d=>{const T=ps(d);T.fords=[];if(!d.fords&&!d.crater)return T;const N=T.N,sp=T.sp;
 (d.fords||[]).forEach(k=>{const p=d.pts[k];let bi=0,bd=1e9;for(let i=0;i<N;i++){const dd=(T.x[i]-p[0])**2+(T.z[i]-p[1])**2;if(dd<bd){bd=dd;bi=i}}
  const w=d.fordW||10,yc=T.y[bi];
  for(let i=0;i<N;i++){let a=Math.abs(i-bi);a=Math.min(a,N-a)*sp;if(a<w+38){const tg=yc+Math.max(0,a-w)*.115;T.y[i]=lerp(T.y[i],tg,1-sm(w+10,w+38,a))}}
  T.fords.push({i:bi,x:T.x[bi],z:T.z[bi],y:yc,yw:yc+.5,psi:T.psi[bi],w,L:78,s:Math.sin(T.psi[bi]),c:Math.cos(T.psi[bi])})});
 T.cpts=[];for(let i=0;i<N;i+=6)T.cpts.push([T.x[i],T.z[i],T.y[i]]);
 const to=T.terr,hwm=d.hw,crater=d.crater;
 T.terr=(x,z)=>{let h=to(x,z);
  if(crater){const r=Math.hypot(x,z)/d.cs;if(r<240){let dd=40;const cx=Math.floor(x/16),cz=Math.floor(z/16);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=T.grid.get((cx+a)*8192+cz+b);if(!l)continue;for(const i of l){const q=Math.hypot(x-T.x[i],z-T.z[i]);if(q<dd)dd=q}}
    const k=(1-sm(120,235,r))*sm(hwm+2,hwm+22,dd);h=lerp(h,-1.5+T.nz(x*.05,z*.05)*1.2,k*.97)}}
  for(const f of T.fords){const dx=x-f.x,dz=z-f.z,s=dx*f.s+dz*f.c,as=Math.abs(s);if(as>f.w+62)continue;const l=dx*f.c-dz*f.s,al=Math.abs(l);if(al>f.L)continue;
   const kl=1-sm(f.L*.5,f.L,al),kr=sm(T.hw[f.i]+.2,T.hw[f.i]+1.8,al),bed=f.yw-1.35,we=f.w*(1-.55*sm(14,f.L*.75,al));
   if(as<f.w+9){if(h>bed){const kb=1-sm(we,we+8,as);h=lerp(h,bed,kb*kl*kr)}}
   /* banks: ground beside the stream stands clear of the water so it reads as a creek, not a flood */
   const kk=sm(we+3,we+9,as)*(1-sm(we+22,we+62,as))*(1-sm(f.L*.85,f.L,al))*kr;if(kk>0){const tg=f.yw+1.6+T.nz(x*.2,z*.2)*.35;if(h<tg)h=lerp(h,tg,kk)}}
  return h};
 return T};

/* dips, crests and bumps along the whole stage; calm near the start, fords and jumps so those stay clean */
function undulate(T,d){const N=T.N,sp=T.sp,TP=Math.PI*2;let sd=(N*104729+d.id*977)%2147483647||1;const rr=()=>(sd=(sd*48271)%2147483647)/2147483647;
 const circ=(a,b)=>{const q=Math.abs(a-b);return Math.min(q,N-q)*sp};
 const small=[];for(let k=0;k<3;k++)small.push({A:.06+rr()*.08,w:11+rr()*14,p:rr()*TP});
 const e3=rr()*TP,e4=rr()*TP,ssm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};const cpl=P.cpsOf(T);
 /* ground profile built from slope: stretches of flat road, then easy, medium and steep climbs and drops that blend into each other */
 const prof=new Float32Array(N),slopes=[0,0,0,0,.025,.03,.05,.06,.08,.1,.12],bigK=d.id===10?1.2:1;{let g=0,y=0,tgt=0,next=0;
  for(let i=0;i<N;i++){const s=i*sp;if(s>=next){next=s+45+rr()*130;tgt=slopes[(rr()*slopes.length)|0]*(rr()<.5?-1:1)*bigK}g+=(tgt-g)*(1-Math.exp(-sp/20));y+=g*sp;prof[i]=y}
  const end=prof[N-1];let mean=0;for(let i=0;i<N;i++){prof[i]-=end*i/(N-1);mean+=prof[i]}mean/=N;const A=d.id===10?10:8;for(let i=0;i<N;i++)prof[i]=A*Math.tanh((prof[i]-mean)/A)}
 for(let i=0;i<N;i++){const s=i*sp;let tp=ssm(150,350,circ(i,0));for(const f of T.fords||[])tp=Math.min(tp,ssm(f.w+90,f.w+230,circ(i,f.i)));for(const j of T.jumps||[])tp=Math.min(tp,ssm(160,280,circ(i,j)));for(const q of cpl)tp=Math.min(tp,ssm(60,170,circ(i,q)));
  if(tp<=0)continue;const env2=ssm(0,.6,.5*Math.sin(s/260+e3)+.5*Math.sin(s/143+e4));
  let bp=0;for(const w of small)bp+=w.A*Math.sin(TP*s/w.w+w.p);T.y[i]+=(prof[i]+bp*env2)*tp}
 T.cpts=[];for(let i=0;i<N;i+=6)T.cpts.push([T.x[i],T.z[i],T.y[i]]);delete T.kap;delete T.kz;delete T.flat;delete T.cor}
/* ---------------- pinch points: the road shrinks to barely wider than a car ---------------- */
/* flat/straight measures per sample (radius and steepest grade within +-half metres) */
function flatMap(T,half){if(T.flat&&T.flat.h===half)return T.flat;const N=T.N,sp=T.sp,K=P.kappa(T),r=Math.round(half/sp),R=new Float32Array(N),G=new Float32Array(N),gs=new Float32Array(N);
 for(let i=0;i<N;i++)gs[i]=Math.abs(T.y[(i+1)%N]-T.y[i])/sp*100;
 for(let i=0;i<N;i++){let m=0,g=0;for(let k=-r;k<=r;k++){const a=(i+k+N)%N;if(K[a]>m)m=K[a];if(gs[a]>g)g=gs[a]}R[i]=1/Math.max(m,1e-5);G[i]=g}
 return T.flat={h:half,R,G}}
function rotateTrack(T,s){const N=T.N;if(!s)return;
 for(const k of['x','z','y','hw','psi','bank','gap','wall','ice','br','wh','tn']){const a=T[k];if(!a||a.length!==N)continue;const c=a.slice();for(let i=0;i<N;i++)a[i]=c[(i+s)%N]}
 const sh=i=>((i-s)%N+N)%N;
 T.jumps=(T.jumps||[]).map(sh);T.jumpCaps=(T.jumpCaps||[]).map(sh);(T.pads||[]).forEach(p=>{p.i=sh(p.i)});(T.fords||[]).forEach(f=>{f.i=sh(f.i)});(T.tunnels||[]).forEach(t=>{t[0]=sh(t[0]);t[1]=sh(t[1])});
 const g=[];T.grid.forEach((ids,k)=>g.push([k,Array.from(ids).map(sh)]));T.grid.clear();g.forEach(q=>T.grid.set(q[0],q[1]));
 delete T.kap;delete T.kz;delete T.cor;delete T.flat;delete T.cps}
/* the start line goes on the straightest, flattest piece of road that is clear of fords and jumps */
function pickStart(T){const N=T.N,sp=T.sp,fm=flatMap(T,60),circ=(a,b)=>{const q=Math.abs(a-b);return Math.min(q,N-q)*sp};
 const ok=i=>{for(const f of T.fords||[])if(circ(i,f.i)<f.w+110)return false;for(const j of T.jumps||[])if(circ(i,j)<150)return false;const r=Math.round(70/sp);for(let k=-r;k<=r;k++){const a=(i+k+N)%N;if(T.gap[a]||(T.tn&&T.tn[a]))return false}return true};
 for(const [Rm,Gm] of [[260,1.8],[200,2],[150,2.3],[120,2.6],[100,3],[80,3.5],[60,4.5]]){let best=-1,bs=-1;for(let i=0;i<N;i+=2){if(fm.R[i]<Rm||fm.G[i]>Gm||!ok(i))continue;const sc=fm.R[i]-fm.G[i]*40;if(sc>bs){bs=sc;best=i}}if(best>=0)return best}
 return 0}
const sf0=sampleTrack;
sampleTrack=d=>{const T=sf0(d);T.pinch=[];if(!d.hard)return T;if(!T.rooted){T.rooted=1;rotateTrack(T,pickStart(T))}const N=T.N,sp=T.sp,n=Math.max(4,Math.round(T.L/1250)),HWm=2.2;let sd=(N*7919+(d.fords?d.fords.length:0)*131)%2147483647||1;const rr=()=>(sd=(sd*48271)%2147483647)/2147483647;
 const circ=(a,b)=>{const q=Math.abs(a-b);return Math.min(q,N-q)*sp};
 for(let j=0;j<n;j++){const core=50+rr()*40,ramp=42;let best=-1;
  for(let t=0;t<40&&best<0;t++){const i=Math.round(N*((j+.5)/n)+(rr()-.5)*N/n*.7+N)%N;let ok=circ(i,0)>260;
   for(const f of T.fords||[])if(circ(i,f.i)<f.w+core+ramp+30)ok=false;for(const q of d.jumps||[])if(circ(i,q)<core+ramp+120)ok=false;for(const q of T.pinch)if(circ(i,q.i)<core+ramp*2+160)ok=false;
   for(let k=-12;k<=12&&ok;k++)if(T.gap[(i+k*6+N)%N])ok=false;if(ok)best=i}
  if(best<0)continue;const c=best,m=Math.min(HWm+rr()*.15,T.hw[c]);T.pinch.push({i:c,core,ramp});
  for(let i=0;i<N;i++){const a=circ(i,c);if(a<core/2+ramp){const pf=1-sm(core/2,core/2+ramp,a);T.hw[i]=Math.min(T.hw[i],lerp(T.hw[i],m,pf))}}}
 undulate(T,d);return T};

/* ---------------- helpers ---------------- */
const roadPts=T=>{const a=[];for(let i=0;i<T.N;i+=3)a.push([T.x[i],T.z[i],T.hw[i]]);return a};
const rdist=(rp,x,z)=>{let b=1e9;for(const p of rp){const dd=Math.hypot(x-p[0],z-p[1])-p[2];if(dd<b)b=dd}return b};
function bigMesh(sc){let b=null;sc.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes.color&&o.geometry.attributes.position.count>20000&&(!b||o.geometry.attributes.position.count>b.geometry.attributes.position.count))b=o});return b}
function recolor(T,sc,fn,gam){gam=gam||2;const m=bigMesh(sc);if(!m)return;const g=m.geometry,pa=g.attributes.position,na=g.attributes.normal,ca=g.attributes.color,d=T.d;
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),h=pa.getY(i),z=pa.getZ(i),ny=na?na.getY(i):1,tan=Math.sqrt(Math.max(0,1/Math.max(.05,ny*ny)-1)),slope=Math.min(1,tan*1.2);
  const n=T.nz(x*2.1,z*2.1)*.5+.5,n2=T.nz(x*.7+40,z*.7-17)*.5+.5,n3=T.nz(x*5.3,z*5.3)*.5+.5;
  const near=nearRoad(T,x,z,5)?1:nearRoad(T,x,z,16)?.45:0;
  const c=fn(x,z,h,slope,n,n2,n3,near);ca.setXYZ(i,Math.pow(c[0],gam),Math.pow(c[1],gam),Math.pow(c[2],gam))}
 ca.needsUpdate=true}
const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function tintInstances(sc,fn){sc.traverse(o=>{if(!o.isInstancedMesh||!o.instanceColor)return;const a=o.instanceColor.array,c=new THREE.Color(),m=new THREE.Matrix4(),v=new THREE.Vector3();
 for(let i=0;i<o.count;i++){c.setRGB(a[i*3],a[i*3+1],a[i*3+2]);o.getMatrixAt(i,m);v.setFromMatrixPosition(m);const r=fn(c,v,i);if(r){a[i*3]=r.r;a[i*3+1]=r.g;a[i*3+2]=r.b}}o.instanceColor.needsUpdate=true})}
/* instanced meshes with per-instance colour; list rows: [x,y,z,sx,sy,sz,rotY,tiltZ] */
function inst(sc,geo,list,cols,rough){if(!list.length)return null;const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:rough||1,flatShading:true}),list.length),o=new THREE.Object3D(),c=new THREE.Color();
 list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4]!=null?p[4]:p[3],p[5]!=null?p[5]:p[3]);o.rotation.set(0,p[6]||0,p[7]||0);o.updateMatrix();im.setMatrixAt(i,o.matrix);c.setHex(S(cols[(Math.abs(Math.sin(p[0]*12.9898+p[2]*78.233))*43758.5453%1*cols.length)|0]));const k=.88+.24*(Math.abs(Math.sin(p[0]*3.1+p[2]*1.7)));c.multiplyScalar(k);im.setColorAt(i,c)});
 im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;sc.add(im);return im}
function scatterW(T,sc,r,cnt,minR,maxR,rp,fn){const b=T.bounds,out=[];for(let t=0;t<cnt*18&&out.length<cnt;t++){const x=lerp(b[0]+10,b[1]-10,r()),z=lerp(b[2]+10,b[3]-10,r()),rd=rdist(rp,x,z);if(rd<minR||rd>maxR)continue;const h=T.terr(x,z);if(inFord(T,x,z,h,6))continue;fn(x,h,z,out,rd)}return out}
function inFord(T,x,z,h,m){for(const f of T.fords||[]){const dx=x-f.x,dz=z-f.z,s=dx*f.s+dz*f.c,l=dx*f.c-dz*f.s;if(Math.abs(s)<f.w+14+m&&Math.abs(l)<f.L&&h<f.yw+.9+m*.2)return true}return false}

/* ---------------- props ---------------- */
def2('mangrove',[Cy(.34,.55,4.8,0x5b4229,0,0,0,null,6),Cy(.1,.16,2.6,0x5b4229,.95,0,0,{r:[0,0,.45]},5),Cy(.1,.16,2.6,0x5b4229,-.95,0,0,{r:[0,0,-.45]},5),Cy(.1,.16,2.6,0x5b4229,0,0,.95,{r:[-.45,0,0]},5),Cy(.1,.16,2.6,0x5b4229,0,0,-.95,{r:[.45,0,0]},5),Sp(2.5,0x2f6d3b,0,6.2,0,{s:[1,.72,1]}),Sp(1.7,0x40884a,1.5,5.4,.7),Sp(1.5,0x2a5f36,-1.4,5.2,-.6)],2.6,1.5);
def2('palm',[Cy(.2,.34,6.4,0x8c6a42,0,0,0,{r:[0,0,.1]},6),Bx(3.6,.08,.75,0x2f8040,-.62,6.3,0,{r:[0,0,.45]}),Bx(3.6,.08,.75,0x2f8040,-.62,6.3,0,{r:[0,0,-.45]}),Bx(.75,.08,3.6,0x3a9048,-.62,6.3,0,{r:[.45,0,0]}),Bx(.75,.08,3.6,0x3a9048,-.62,6.3,0,{r:[-.45,0,0]}),Sp(.45,0x5a4228,-.62,6.1,.3),Sp(.4,0x5a4228,-.4,6.0,-.35)],2.2,1.4);
def2('reeds',[0,1,2,3,4,5,6].map(i=>Cy(0,.09,1.5+(i%3)*.5,[0x6f8f3a,0x8aa046,0x587a30][i%3],Math.cos(i*1.9)*.55,0,Math.sin(i*1.9)*.55,{r:[Math.sin(i)*.12,0,Math.cos(i)*.12]},4)),1.1,1.6);
def2('stilthut',[Cy(.2,.24,3.4,0x6a4a2c,1.7,0,1.7,null,5),Cy(.2,.24,3.4,0x6a4a2c,-1.7,0,1.7,null,5),Cy(.2,.24,3.4,0x6a4a2c,1.7,0,-1.7,null,5),Cy(.2,.24,3.4,0x6a4a2c,-1.7,0,-1.7,null,5),Bx(4.4,.3,4.4,0x8a6840,0,3.2,0),Bx(3.6,2.1,3.6,0xc9a56a,0,3.5,0),Bx(1,1.5,.1,0x5a3a22,0,3.5,1.82),Cy(0,3.6,1.9,0x3f7a3c,0,5.6,0,{r:[0,.785,0],s:[1.15,1,1.15]},4),Bx(1.5,.1,1.2,0x8a6840,0,3.2,2.7)],3.4,3);
def2('canoe',[Cy(.55,.5,4.4,0xc65a2a,0,.1,0,{r:[PI/2,0,0],s:[1,1,.55]},6),Bx(.1,.1,3.8,0x6a4a2c,.4,.7,0)],1.4,1);
def2('cypress',[Cy(.14,.2,.9,0x5a4128,0,0,0,null,5),Cy(0,1.15,9,0x2c4a2e,0,.7,0,null,7),Cy(0,.9,3,0x35603a,0,.9,0,null,7)],1.3,1.2);
def2('olive',[Cy(.25,.42,1.9,0x6f5b44,0,0,0,{r:[0,0,.08]},6),Sp(1.9,0x7d8f5b,0,2.9,0,{s:[1.25,.8,1.1]}),Sp(1.2,0x93a068,1.2,2.4,.5),Sp(1.1,0x6f8450,-1.1,2.5,-.5)],2.2,1.4);
def2('vines',[Bx(9.5,.12,6,0x76603a,0,0,0),...[0,1,2,3,4].map(i=>Bx(8.6,.95,.55,i%2?0x628c32:0x578030,0,.1,-2.2+i*1.1)),...[-4,0,4].map(x=>Bx(.12,1.3,5.4,0x5a4128,x,.1,0))],5.2,1.6);
def2('stonehut',[Bx(4.8,2.7,4,0xdccba2,0,0,0),Cy(0,3.6,1.8,0xb5532a,0,2.7,0,{r:[0,.785,0],s:[1.3,1,1.1]},4),Bx(.9,1.6,.1,0x5a3a22,0,0,2.03),Bx(.9,.8,.1,0x4a6a8a,1.5,1.2,2.03)],3.6,2.2,{face:1});
def2('haystack',[Cy(1.3,1.5,1.8,0xd8b85a,0,0,0,null,8),Cy(0,1.3,1.1,0xc9a64a,0,1.8,0,null,8)],1.7,1);
def2('ashrock',[Dd(1.7,0x2d2b2d,0,1.1,0,{s:[1,.8,1.2]}),Dd(1,0x3d393b,1.5,.6,.3),Dd(.8,0x242224,-1.2,.5,-.6)],2.2,1.5);
def2('ashrockL',[Dd(3.8,0x2a282a,0,2.6,0,{s:[1,.85,1.1]}),Dd(2.1,0x38353a,3,1.3,.8),Dd(1.6,0x232123,-2.5,1,-1)],4.2,2.6);
def2('vent',[Cy(.5,2.5,2.2,0x2e2a2a,0,0,0,null,7),Cy(.9,.7,.14,0xff6a1a,0,2.15,0,null,7),Sp(.55,0xffa030,0,2.3,0),Dd(.7,0x3a3434,2.2,.3,.4)],2.6,1.6);
def2('deadtree',[Cy(.14,.3,4.2,0x3d3532,0,0,0,{r:[0,0,.05]},5),Cy(.05,.11,1.9,0x3d3532,.55,2.5,0,{r:[0,0,-.9]},4),Cy(.05,.11,1.7,0x3d3532,-.5,3.1,0,{r:[0,0,.8]},4),Cy(.04,.09,1.4,0x3d3532,0,3.5,.4,{r:[-.8,0,0]},4)],1.3,1);
def2('obsidian',[Cy(0,.5,2.8,0x1b1c22,0,0,0,{r:[.12,0,.1]},4),Cy(0,.34,1.8,0x26272f,.7,0,.2,{r:[-.2,0,-.15]},4),Cy(0,.28,1.4,0x1f2026,-.6,0,-.3,{r:[.25,0,.2]},4)],1.5,1.2);
def2('sulfur',[Cy(1.7,2.1,.12,0xd8c43a,0,0,0,null,8),Cy(.9,1.1,.18,0xe9dc52,.2,0,.1,null,7)],2.2,.7);
def2('maple',[Cy(.28,.42,3.4,0x5a4030,0,0,0,null,6),Sp(2.9,0xc4481a,0,5.1,0,{s:[1,.85,1]}),Sp(1.9,0xe39a23,1.6,4.6,.6),Sp(1.7,0xa7321a,-1.5,4.4,-.7)],3,1.6);
def2('birch',[Cy(.17,.27,6.2,0xe9e5d9,0,0,0,null,5),Sp(1.7,0xe6b928,0,6.7,0,{s:[1,1.3,1]}),Sp(1.1,0xd98e1e,.7,5.7,.3)],1.8,1.3);
def2('pumpkins',[[0,0],[.9,.3],[-.8,.5],[.3,-.9],[-.4,-.7]].map((q,i)=>Sp(.5+(i%2)*.1,i%2?0xe8731a:0xd96418,q[0],.4,q[1],{s:[1,.8,1]})),1.6,1);
def2('scarecrow',[Cy(.07,.09,2.3,0x6a4a2c,0,0,0,null,5),Bx(1.7,.1,.1,0x6a4a2c,0,1.6,0),Bx(.5,.75,.28,0xb04a2a,0,.95,0),Sp(.22,0xe8c88a,0,2.35,0),Cy(.05,.32,.36,0x3a2c20,0,2.45,0,null,6)],1,1);
Object.assign(PLAN,{
 'Mangrove Ford':{edge:[['reeds',0,13,3.2]],field:[['mangrove',150,7,150],['palm',70,7,120],['reeds',60,4,60],['stilthut',3,16,110],['canoe',3,10,50],['boulderG',5,12,100],['tentR',2,12,40],['tentB',2,12,40],['stump',6,5,50]]},
 'Terrace Run':{edge:[['cypress',0,26,3.5]],field:[['vines',34,9,120],['olive',80,6,130],['cypress',70,6,130],['stonehut',5,16,110],['haystack',10,8,70],['bale',6,6,40],['boulderG',7,12,120],['tentR',2,12,40],['tentB',2,12,40],['cairn',4,10,80]]},
 'Ashfall Stage':{edge:[],field:[['ashrock',90,5,130],['ashrockL',20,12,160],['vent',20,7,130],['obsidian',24,6,120],['sulfur',16,6,80],['deadtree',34,6,140],['tentR',2,12,40],['tentB',2,12,40]]},
 'Autumn Ridge':{edge:[],field:[['maple',60,7,130],['birch',50,7,130],['pumpkins',9,8,60],['scarecrow',3,10,60],['cabinW',4,14,110],['barn',1,16,120],['logs',7,8,70],['stump',14,5,60],['bale',8,6,40],['boulderG',8,12,160],['tentR',2,12,40],['tentB',2,12,40]],fence:[0x9a7a52,2]}});

/* ---------------- backdrop panoramas ---------------- */
function pano(T,kind){const d=T.d,W=4096,Hh=512,hz=352,fog=H(d.fog),cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const g=cv.getContext('2d'),r=rngf(d.id*57+3);
 const mix=(hex,t)=>'#'+H(hex).lerp(fog,t).getHexString(),sn=(x,seed,terms)=>{let s=0;for(const[k,a,p]of terms)s+=a*Math.sin(2*PI*k*x/W+p+seed);return s};
 const ridge=(base,amp,terms,seed,fill)=>{g.beginPath();g.moveTo(0,Hh);for(let x=0;x<=W;x+=8)g.lineTo(x,base-amp*sn(x,seed,terms));g.lineTo(W,Hh);g.closePath();g.fillStyle=fill;g.fill()};
 const gr=(y0,y1,a,b)=>{const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
 const T3=[[2,.5,0],[5,.3,1],[11,.18,2],[23,.1,3]],T4=[[3,.4,1],[8,.25,0],[17,.12,2],[37,.06,1]];
 if(kind==='mang'){ridge(292,70,T3,0,mix(0x6b9a98,.62));ridge(316,46,T4,2,mix(0x4f8470,.5));
  for(let i=0;i<26;i++){const x=r()*W,h=60+r()*40;g.strokeStyle=mix(0x2a4a30,.3);g.lineWidth=5;g.beginPath();g.moveTo(x,hz+4);g.quadraticCurveTo(x+8,hz-h*.6,x+16,hz-h);g.stroke();g.fillStyle=mix(0x2f6a3c,.3);for(let k=0;k<5;k++){g.beginPath();g.ellipse(x+16+Math.cos(k*1.3)*20,hz-h+Math.sin(k*1.3)*5+4,22,5,k*.6-.3,0,2*PI);g.fill()}}
  g.fillStyle=mix(0x2e5e3a,.22);for(let x=-10;x<W+10;x+=14){g.beginPath();g.arc(x,hz+4,16+r()*14,PI,0);g.fill()}
  g.fillStyle=gr(hz-60,hz+30,'#ffffff00','#ffffff66');g.fillRect(0,hz-60,W,90);g.fillStyle=gr(hz,Hh,mix(0x2d5a3a,.15),mix(0x3a6a40,.1));g.fillRect(0,hz+4,W,Hh-hz)}
 else if(kind==='terr'){ridge(296,64,T3,3,mix(0xd2b27a,.55));ridge(322,40,T4,1,mix(0x9fae62,.45));
  for(let b=0;b<9;b++){g.fillStyle=b%2?'#7f9a3c26':'#e8cf7c26';ridge(316+b*3,34-b*2,T4,1,g.fillStyle)}
  for(let i=0;i<20;i++){const x=r()*W,hh=24+r()*30;g.fillStyle=mix(0x2f4a2e,.35);g.beginPath();g.moveTo(x,hz);g.lineTo(x+4,hz-hh);g.lineTo(x+8,hz);g.fill()}
  for(let i=0;i<9;i++){const x=r()*W+0,y=hz-10-r()*20;g.fillStyle=mix(0xe8dbb8,.3);g.fillRect(x,y,26,14);g.fillStyle=mix(0xb5532a,.3);g.beginPath();g.moveTo(x-3,y);g.lineTo(x+13,y-9);g.lineTo(x+29,y);g.fill()}
  g.fillStyle=gr(hz-70,hz+30,'#ffe9b000','#ffe9b066');g.fillRect(0,hz-70,W,100);g.fillStyle=gr(hz,Hh,mix(0x93a24a,.3),mix(0x8c9a46,.15));g.fillRect(0,hz+4,W,Hh-hz)}
 else if(kind==='ash'){const cx=W*.18;g.fillStyle=gr(hz-190,hz,'#ff7a3a00','#ff7a3a55');g.fillRect(0,hz-190,W,190);
  ridge(310,60,T3,2,mix(0x4a3c3c,.5));
  g.beginPath();g.moveTo(cx-520,hz);g.lineTo(cx-70,hz-210);g.lineTo(cx-34,hz-232);g.lineTo(cx+34,hz-232);g.lineTo(cx+70,hz-210);g.lineTo(cx+520,hz);g.closePath();g.fillStyle=mix(0x302a2c,.38);g.fill();
  g.fillStyle=gr(hz-236,hz-205,'#ffb040','#ff5a1a');g.beginPath();g.ellipse(cx,hz-232,36,7,0,0,2*PI);g.fill();
  for(let i=0;i<12;i++){g.fillStyle=`rgba(${70+i*5},${60+i*4},${62+i*4},${.42-i*.025})`;g.beginPath();g.ellipse(cx+i*34+r()*20,hz-250-i*34,34+i*12,22+i*7,0,0,2*PI);g.fill()}
  ridge(332,40,T4,6,mix(0x2f2828,.36));
  g.fillStyle=gr(hz-90,hz+20,'#ff6a2a00','#ff6a2a40');g.fillRect(0,hz-90,W,110);g.fillStyle=gr(hz,Hh,mix(0x2a2424,.2),mix(0x1f1b1b,.1));g.fillRect(0,hz+4,W,Hh-hz)}
 else{ridge(290,74,T3,5,mix(0x9a7a62,.58));ridge(314,48,T4,3,mix(0xb06a34,.48));ridge(334,32,T3,8,mix(0x9a5a2a,.4));
  const ac=[0xd9631c,0xc2401a,0xe8a523,0xb5651d,0x7a8a2a,0xe0c040];
  for(let i=0;i<340;i++){const x=r()*W,h=14+r()*34,w=10+r()*18;g.fillStyle=mix(ac[(r()*ac.length)|0],.2+r()*.3);g.beginPath();g.ellipse(x,hz+2-h*.5,w,h*.6,0,0,2*PI);g.fill()}
  for(let i=0;i<30;i++){const x=r()*W,h=42+r()*40;g.fillStyle=mix(0x2f4a2f,.3);g.beginPath();g.moveTo(x,hz+2);g.lineTo(x+5,hz-h);g.lineTo(x+10,hz+2);g.fill()}
  g.fillStyle=gr(hz-70,hz+30,'#ffe0a000','#ffe0a066');g.fillRect(0,hz-70,W,100);g.fillStyle=gr(hz,Hh,mix(0x9a5a2a,.25),mix(0x8a5a2a,.12));g.fillRect(0,hz+4,W,Hh-hz)}
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return t}

/* ---------------- world ---------------- */
function waterMesh(T,f,col,op){const w2=f.w+11,L=f.L*.8,g=new THREE.PlaneGeometry(2*L,2*w2,26,6),pa=g.attributes.position;
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);pa.setZ(i,Math.sin(x*.21+y*.4)*.035+Math.cos(x*.13-y*.3)*.03)}g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:col,roughness:.18,metalness:.08,flatShading:true,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide}));
 m.rotation.x=-PI/2;const gp=new THREE.Group();gp.position.set(f.x,f.yw,f.z);gp.rotation.y=f.psi;gp.add(m);m.renderOrder=-1;return gp}
const bw=buildWorld;
buildWorld=T=>{const sc=bw(T),d=T.d;
 const nm=d.name,k=nm==='Mangrove Ford'?'mang':nm==='Terrace Run'?'terr':nm==='Ashfall Stage'?'ash':nm==='Autumn Ridge'?'autu':null;if(!k)return sc;
 const r=rngf(d.id*191+k.length*7+T.N),rp=roadPts(T),bd=T.bounds;
 /* ground */
 const lowest=(()=>{let m=1e9;for(let i=0;i<T.N;i+=5)m=Math.min(m,T.y[i]);return m})();
 if(k==='mang')recolor(T,sc,(x,z,h,sl,n,n2,n3,near)=>{let c=[.13+.07*n,.33+.1*n,.17+.05*n];if(n2>.6)c=[.2+.05*n3,.4+.05*n3,.2];const low=1-sm(lowest+.5,lowest+7,h);c=mix3(c,[.3+.05*n3,.25+.04*n3,.16],low*.8);c=mix3(c,[.46,.46,.42],sm(.5,.95,sl)*.9);return mix3(c,[.42,.34,.22],near*.55)});
 else if(k==='terr')recolor(T,sc,(x,z,h,sl,n,n2,n3,near)=>{const band=Math.sin(h*1.15+n*1.6)>.15?1:0;let c=band?[.42+.08*n,.55+.08*n,.2]:[.74+.06*n,.62+.05*n,.34];if(n2>.62)c=mix3(c,[.55,.5,.26],.5);c=mix3(c,[.62,.55,.42],sm(.4,.9,sl)*.9);return mix3(c,[.7,.58,.4],near*.55)},1.35);
 else if(k==='ash')recolor(T,sc,(x,z,h,sl,n,n2,n3,near)=>{let c=[.17+.05*n,.16+.04*n,.17+.04*n];if(n2>.68)c=[.4+.04*n3,.38+.04*n3,.37+.04*n3];const hot=1-sm(2,26,h);c=mix3(c,[.5,.16,.07],hot*.65*(.6+.4*n3));c=mix3(c,[.3,.28,.27],sm(.5,.95,sl)*.8);return mix3(c,[.31,.29,.28],near*.5)},2.7);
 else recolor(T,sc,(x,z,h,sl,n,n2,n3,near)=>{let c=[.5+.08*n,.31+.06*n,.1];if(n2>.6)c=[.55+.05*n3,.5+.05*n3,.14];if(n2<.3)c=[.4+.06*n,.38+.06*n,.14];c=mix3(c,[.5,.44,.38],sm(.5,.95,sl)*.85);return mix3(c,[.46,.34,.2],near*.6)});
 /* base forest (Autumn Ridge): turn the pines gold/red, keep a few green */
 if(k==='autu'){const pal=[0xd9631c,0xc2401a,0xe8a523,0xb5651d,0xe0c040,0xa03a18].map(h=>H(S(h)));let q=0;tintInstances(sc,(c,v,i)=>{if(c.g>c.r*1.12&&c.g>c.b*1.05){q++;const hsh=Math.abs(Math.sin(v.x*9.7+v.z*3.3));if(hsh<.14)return c;return pal[(hsh*40|0)%pal.length].clone().multiplyScalar(.9+hsh*.2)}return null})}
 /* custom vegetation where the base biome is empty */
 if(k==='mang'){
  const tl=scatterW(T,sc,r,520,7,140,rp,(x,h,z,o)=>{if(h<lowest+.4)return;o.push([x,h,z,.8+r()*.9,0,0,r()*6])});
  inst(sc,new THREE.CylinderGeometry(.22,.36,3.4,5),tl.map(p=>[p[0],p[1]+1.7*p[3],p[2],p[3]]),[0x5b4229,0x6a4e30]);
  inst(sc,new THREE.IcosahedronGeometry(2.3,0),tl.map(p=>[p[0],p[1]+4.3*p[3],p[2],p[3],p[3]*.75,p[3],p[6]]),[0x2f6d3b,0x377a42,0x28603a,0x3f8648]);
  const fe=scatterW(T,sc,r,420,3.5,70,rp,(x,h,z,o)=>{o.push([x,h+.2,z,.6+r()*.9,.5+r()*.5,0,r()*6])});inst(sc,new THREE.IcosahedronGeometry(1,0),fe,[0x3f8a3c,0x4a9a44,0x2f7035,0x5aa048]);}
 if(k==='terr'){
  const cy=scatterW(T,sc,r,170,6,150,rp,(x,h,z,o)=>{o.push([x,h+4.2,z,.8+r()*.5,1+r()*.6,.8+r()*.5,0])});inst(sc,new THREE.ConeGeometry(1.1,8.6,6),cy,[0x2c4a2e,0x33573a,0x28432b]);
  const bu=scatterW(T,sc,r,320,3.5,80,rp,(x,h,z,o)=>{o.push([x,h+.3,z,.5+r()*.8,.4+r()*.4,0,r()*6])});inst(sc,new THREE.IcosahedronGeometry(1,0),bu,[0x7a8a3c,0x6a7d34,0x8a8a44,0xb0963c]);
  const rk=scatterW(T,sc,r,160,3.5,120,rp,(x,h,z,o)=>{o.push([x,h+.3,z,.6+r()*1.4,.5+r()*.8,.6+r()*1.3,r()*6])});inst(sc,new THREE.DodecahedronGeometry(1.2,0),rk,[0xa59a82,0x9a8f78,0xb3a78c]);}
 if(k==='ash'){
  const rk=scatterW(T,sc,r,420,3.5,170,rp,(x,h,z,o)=>{o.push([x,h+.4,z,.5+r()*1.7,.4+r()*1.1,.5+r()*1.7,r()*6])});inst(sc,new THREE.DodecahedronGeometry(1.2,0),rk,[0x2f2c2e,0x3a3638,0x262426,0x4a4543]);
  const sh=scatterW(T,sc,r,120,5,100,rp,(x,h,z,o)=>{o.push([x,h+1.3,z,.8+r()*.9,1+r()*1.4,.8+r()*.9,r()*6])});inst(sc,new THREE.ConeGeometry(.9,2.6,4),sh,[0x1b1c22,0x24252c]);}
 /* mountains ring: tint to the stage */
 const mcol={mang:0x5b8a76,terr:0xb8a06a,ash:0x3d3233,autu:0xab6b3c}[k];
 sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='ConeGeometry'&&o.geometry.parameters.radius>=80&&o.geometry.parameters.height>=60){o.material=o.material.clone();o.material.color.setHex(S(mcol)).multiplyScalar(.85+.3*Math.abs(Math.sin(o.position.x*.01)));if(k==='ash')o.scale.y=1.35;{const rad=o.geometry.parameters.radius,x=o.position.x*1.35,z=o.position.z*1.35,L0=Math.hypot(x,z)||1,ux=x/L0,uz=z/L0;let L=L0;for(let n=0;n<90&&rdist(rp,ux*L,uz*L)<rad+50;n++)L+=30;o.position.x=ux*L;o.position.z=uz*L}}});
 /* backdrop */
 sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===1300&&o.material.map){const t=pano(T,k);o.material.map.dispose();o.material.map=t;o.material.needsUpdate=true}});
 /* water */
 for(const f of T.fords){const w=d.water||[0x4a8fa0,.8];const gp=waterMesh(T,f,w[0],w[1]);sc.add(gp)}
 /* shore reeds at fords */
 if(T.fords.length){const rl=[];for(const f of T.fords)for(let t=0;t<160;t++){const l=(r()<.5?-1:1)*(8+r()*(f.L*.6)),s=(r()-.5)*2*(f.w+22);if(Math.abs(s)<f.w+3&&Math.abs(l)<T.hw[f.i]+3)continue;
   const x=f.x+f.c*l+f.s*s,z=f.z-f.s*l+f.c*s,h=T.terr(x,z);if(Math.abs(h-f.yw)>.9)continue;rl.push([x,h,z,.7+r()*.7,.8+r()*1.1,.7+r()*.7,r()*6])}
  const reeds=inst(sc,new THREE.ConeGeometry(.22,1.7,4),rl.map(p=>[p[0],p[1]+.8*p[4],p[2],p[3],p[4],p[5],p[6]]),k==='mang'?[0x6f8f3a,0x8aa046,0x587a30]:[0xb8a050,0x9a8a40,0xc4b060]);if(reeds)reeds.userData.keepAll=true;
  /* clear any scenery that landed in the water */
  const m4=new THREE.Matrix4(),v=new THREE.Vector3(),z0=new THREE.Matrix4().makeScale(0,0,0);
  sc.traverse(o=>{if(!o.isInstancedMesh||o.userData.keepAll)return;let ch=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);v.setFromMatrixPosition(m4);for(const f of T.fords){const dx=v.x-f.x,dz=v.z-f.z,s=dx*f.s+dz*f.c,l=dx*f.c-dz*f.s;if(Math.abs(s)<f.w+12&&Math.abs(l)<f.L&&v.y<f.yw+1.6){o.setMatrixAt(i,z0);ch=1;break}}}if(ch)o.instanceMatrix.needsUpdate=true})}
 /* lava lake */
 if(k==='ash'){const g=new THREE.RingGeometry(1,215*d.cs,64,16),pa=g.attributes.position,col=new Float32Array(pa.count*3);
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),n=T.nz(x*.09/d.cs,y*.09/d.cs)*.5+.5,n2=T.nz(x*.31+9,y*.31)*.5+.5,hot=Math.min(1,n*.7+n2*.45),c=mix3([.42,.05,.01],[.78,.2,.02],hot);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));const lv=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,fog:false}));lv.rotation.x=-PI/2;lv.position.set(0,3.2,0);sc.add(lv);sc.userData.lava=lv}
 sc.userData.stage=k;return sc};


/* ---------------- checkpoints (gates every ~900 m; split times are kept per run) ---------------- */
P.cpsOf=T=>{if(T.cps)return T.cps;const N=T.N,K=Math.max(5,Math.round(T.L/950)),out=[],fm=flatMap(T,55);
 const circ=(a,b)=>{const d=Math.abs(a-b);return Math.min(d,N-d)*T.sp};
 const bad=i=>{if(T.gap[i])return true;if(circ(i,0)<260)return true;for(const j of T.jumps||[])if(circ(i,j)<70)return true;for(const f of T.fords||[])if(circ(i,f.i)<f.w+50)return true;for(const q of T.pinch||[])if(circ(i,q.i)<q.core/2+q.ramp+15)return true;return false};
 let prev=0;
 for(let k=1;k<K;k++){const base=Math.round(N*k/K);let pick=-1;
  for(const [Rm,Gm] of [[220,3],[160,4],[110,5],[80,7],[50,10],[0,99]]){let bo=1e9;for(let o=-170;o<=170;o+=2){const a=((base+o)%N+N)%N;if(bad(a)||fm.R[a]<Rm||fm.G[a]>Gm)continue;if(circ(a,prev)<380)continue;if(Math.abs(o)<bo){bo=Math.abs(o);pick=a}}if(pick>=0)break}
  if(pick<0)pick=base;out.push(pick);prev=pick}
 T.cps=out;T.cpK=K;return out};
function post(T,i,sd,hw,mat_,beam,g,top){const lx=sd*(hw+1.2),wx=T.x[i]+Math.cos(T.psi[i])*lx,wz=T.z[i]-Math.sin(T.psi[i])*lx,yr=T.y[i]-lx*T.bank[i],gr=T.terr(wx,wz),bot=Math.min(gr,yr)-1.2,h=yr+top-bot;
 const p=new THREE.Mesh(new THREE.BoxGeometry(.55,h,.55),mat_);p.position.set(lx,bot+h/2-T.y[i],0);g.add(p);return{lx,yr}}
function gate(T,i,n,tot){const g=new THREE.Group(),hw=T.hw[i],c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');
 x.fillStyle='#0b3a44';x.fillRect(0,0,512,64);x.fillStyle='#7fe3f2';for(let k=0;k<512;k+=32)x.fillRect(k,0,16,6),x.fillRect(k+16,58,16,6);x.fillStyle='#fff';x.font='bold 34px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('CHECKPOINT '+n+' / '+tot,256,33);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const mb=new THREE.MeshBasicMaterial({map:t}),pm=new THREE.MeshStandardMaterial({color:S(0xdfe9ec),roughness:.8,flatShading:true}),beam=new THREE.MeshBasicMaterial({color:S(0x5fd8ee),transparent:true,opacity:.28,depthWrite:false,fog:true});
 for(const sd of[-1,1]){const q=post(T,i,sd,hw,pm,beam,g,7.2);const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,34,6),beam);b.position.set(q.lx,q.yr-T.y[i]+17,0);g.add(b)}
 const bn=new THREE.Mesh(new THREE.BoxGeometry(hw*2+2.4,1.5,.3),mb);bn.position.set(0,6.9,0);g.add(bn);
 g.position.set(T.x[i],T.y[i],T.z[i]);g.rotation.y=T.psi[i];return g}
/* the start arch from the base track layers stands on the road edge; give each post a footing that reaches the terrain */
function footing(T,sc){const hw=T.hw[0],pm=new THREE.MeshStandardMaterial({color:S(0xe8e3d4),roughness:.8,flatShading:true});
 for(const sd of[-1,1]){const lx=sd*(hw+1.15),wx=T.x[0]+Math.cos(T.psi[0])*lx,wz=T.z[0]-Math.sin(T.psi[0])*lx,yr=T.y[0]-lx*T.bank[0],gr=T.terr(wx,wz),bot=Math.min(gr,yr)-1.4,h=yr+.3-bot;
  const m=new THREE.Mesh(new THREE.BoxGeometry(1.0,h,1.0),pm);m.position.set(wx,bot+h/2,wz);m.rotation.y=T.psi[0];sc.add(m)}}
/* solid scenery near the road (tree trunks, rocks, posts, huts): the rally layer turns these into crash obstacles */
function collectSolids(sc,T){const rp=roadPts(T),out=[],seen=new Set(),box=new THREE.Box3(),m4=new THREE.Matrix4(),x0=T.x[0],z0=T.z[0];
 const test=(bb,mat,g0,o0)=>{box.copy(bb).applyMatrix4(mat);const w=Math.max(box.max.x-box.min.x,box.max.z-box.min.z),h=box.max.y-box.min.y;if(h<1.4||w>9||w<.2)return;
  /* weeds, reeds, grass and shrubs are not obstacles */
  if(o0.userData.keepAll||(g0.type==='ConeGeometry'&&g0.parameters.radius<1)||(g0.type==='BufferGeometry'&&h<4.2&&w<3.2))return;
  const cx=(box.max.x+box.min.x)/2,cz=(box.max.z+box.min.z)/2;if(Math.hypot(cx-x0,cz-z0)<16)return;const d=rdist(rp,cx,cz);if(d>14||d<-.6)return;
  if(box.min.y>T.terr(cx,cz)+1.7)return;const key=Math.round(cx/1.1)+','+Math.round(cz/1.1);if(seen.has(key))return;seen.add(key);out.push([cx,cz,Math.max(.35,Math.min(2.2,w*.4))])};
 sc.updateMatrixWorld(true);
 sc.traverse(o=>{if(!o.isMesh||!o.geometry)return;const g=o.geometry,t=g.type;if(t==='PlaneGeometry'||t==='RingGeometry'||t==='SphereGeometry'||t==='CircleGeometry')return;
  if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);m4.premultiply(o.matrixWorld);test(bb,m4,g,o)}}else test(bb,o.matrixWorld,g,o)});
 T.solids=out}
const bwG=buildWorld;
buildWorld=T=>{const sc=bwG(T);if(!T.d.hard)return sc;try{collectSolids(sc,T)}catch(e){console.error('solids',e);T.solids=[]}const cps=P.cpsOf(T);cps.forEach((i,k)=>sc.add(gate(T,i,k+1,cps.length+1)));footing(T,sc);return sc};
/* medal references: filled by the AI-lap test (tests/stages_laps.py) */
Object.assign(P.MEDAL_REF,{10:213,11:232.6,12:218.3,13:218.9});
})();
