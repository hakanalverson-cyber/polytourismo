/* ===== Poly GT layer: tracks5 (circuit-mode track: the Nurburgring Nordschleife, 20.8 km. The landscape is streamed in tiles around the camera so the long lap never builds or draws all at once) ===== */
(function v9tracks5(){
'use strict';
const P=window.PT8,RG=window.PT8_RING;
if(!RG||!P.TRK_TRACKS)return;
const ring={id:16,look:0,name:'Nordschleife',desc:'nurburgring / 20.8 km / karussell / flugplatz / the green hell',hw:5.2,bank:10,off:'grass',idw:.85,offs:0,amp:5,up:9,shoulder:14,
 sky:[0x5b8bc2,0xd3e0ea],fog:0xc8d6de,sun:0xfff0d8,hemi:[0xd6e4ee,0x4a6a3a],road:'#3a3c41',tod0:'day',ring:1,
 pts:RG.pts.map(q=>[q[0],q[1],q[2],q[3]]),walls:[],ice:[],boost:[],jumps:[]};
D.push(ring);
P.TRACK_INFO.push({s:'TARMAC',tags:['20.8 KM','KARUSSELL','FLUGPLATZ','290 M CLIMB']});
P.TRK_TRACKS.push(D.length-1);
const RX=D.length-1;P.RING_IDX=RX;
P.MEDAL_REF[RX]=471;/* Mercedes AI lap 444.7 s x 1.06, same rule as Road Atlanta and Imola */
MATS.sandtrap=MATS.sandtrap||{grip:.42,top:.5,acc:.4};

/* ---------- corners (same rule as Imola: curvature above ~1/95 m for more than 18 m) ---------- */
function cornersOf(T){const N=T.N,curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wr(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 const corners=[];let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0105;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>6){let pk=0,pi=s;for(let q=s;q<i;q++)if(Math.abs(curv[q])>pk){pk=Math.abs(curv[q]);pi=q}corners.push({a:s,b:i,dir:Math.sign(curv[pi]),pk,pi})}s=-1}}
 let tot=0;for(let i=0;i<N;i++)tot+=curv[i];return{curv,corners,left:tot>=0?1:-1}}
const nearIdx=(T,x,z)=>{let b=1e18,bi=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<b){b=d;bi=i}}return bi};

/* ---------- fast terrain: the stock terrain looks at every centreline point for every height, which is far too slow for 20 km.
   Here the landscape only looks at centreline points within ~380 m (coarse grid), and the road blend only at the road within ~64 m ---------- */
let _rd=999;
function fastTerrain(T){const d=T.d,N=T.N,CG=128,cg=new Map(),nz=T.nz;
 for(let i=0;i<N;i+=4){const k=Math.floor(T.x[i]/CG)*8192+Math.floor(T.z[i]/CG);let a=cg.get(k);if(!a)cg.set(k,a=[]);a.push(T.x[i],T.z[i],T.y[i])}
 let ym=0;for(let i=0;i<N;i++)ym+=T.y[i];ym/=N;
 const R2=380*380,bumps=T.bumps||(T.bumps=[]);
 const land=(x,z)=>{const cx=Math.floor(x/CG),cz=Math.floor(z/CG);let sw=1e-9,sy=1e-9*ym,md=1e12;
  for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++){const L=cg.get((cx+a)*8192+cz+b);if(!L)continue;for(let q=0;q<L.length;q+=3){const dx=x-L[q],dz=z-L[q+1],d2=dx*dx+dz*dz;if(d2<md)md=d2;if(d2<R2){const u=1-d2/R2,w=u*u*u/(d2+900);sw+=w;sy+=w*L[q+2]}}}
  const mdd=Math.sqrt(md);let h=sy/sw+nz(x,z)*d.amp*sm(25,90,mdd)+d.up*sm(30,170,mdd)*(.6+.4*nz(x*1.7,z*1.7))+(nz(x*.21+31,z*.21-17)*.5+.5)*22*sm(60,320,mdd);
  for(const b of bumps){const e=((x-b.x)**2+(z-b.z)**2)/(b.r*b.r);if(e<4)h+=b.h*Math.exp(-e*1.6)}
  return h};
 const gk=(a,b)=>a*8192+b;
 T.terr=(x,z)=>{let b=land(x,z);const cx=Math.floor(x/16),cz=Math.floor(z/16);let bd=1e9,bi=-1;
  for(let a=-4;a<=4;a++)for(let c=-4;c<=4;c++){const l=T.grid.get(gk(cx+a,cz+c));if(!l)continue;for(const i of l){const dx=x-T.x[i],dz=z-T.z[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bi=i}}}
  _rd=999;
  if(bi>=0){const dd=Math.sqrt(bd),hw=T.hw[bi],lat=clamp((x-T.x[bi])*Math.cos(T.psi[bi])-(z-T.z[bi])*Math.sin(T.psi[bi]),-hw,hw),yr=T.y[bi]-lat*T.bank[bi];_rd=Math.max(0,dd-hw);
   b=lerp(yr,b,sm(hw+1.1,hw+1.1+d.shoulder+clamp(Math.abs(yr-b)*1.2,0,20),dd));
   /* keep the ground just under the road surface right next to it (copy of the stock rule) */
   for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const ids=T.grid.get(gk(cx+a,cz+c));if(!ids)continue;for(const i of ids){const j=(i+1)%N,ex=T.x[j]-T.x[i],ez=T.z[j]-T.z[i],fr=((x-T.x[i])*ex+(z-T.z[i])*ez)/(ex*ex+ez*ez),f=clamp(fr,0,1),px=lerp(T.x[i],T.x[j],f),pz=lerp(T.z[i],T.z[j],f),dist=Math.hypot(x-px,z-pz);if((fr<0||fr>1)&&dist<T.hw[i]+2.5)continue;if(dist<T.hw[i]+8){const psi=T.psi[i]+wr(T.psi[j]-T.psi[i])*f,lt=(x-px)*Math.cos(psi)-(z-pz)*Math.sin(psi),y=lerp(T.y[i],T.y[j],f)-lt*lerp(T.bank[i],T.bank[j],f);b=Math.min(b,y-.14+Math.max(0,dist-T.hw[i]-1.25)*.85)}}}}
  return b}}

/* ---------- track data: corners, sand traps (trap-aware surface), guard-rail offsets ---------- */
const ssR=sampleTrack;sampleTrack=d=>{const T=ssR(d);if(!d.ring)return T;
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 const N=T.N,C=cornersOf(T);T._rc=C;
 /* Nurburg castle sits on its hill inside the loop, a few hundred metres off the start straight */
 {const k=Math.round(N*.012),inf=C.left,l=inf*330,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);T.castle={x:T.x[k]+c*l,z:T.z[k]-s*l};T.bumps=[{x:T.castle.x,z:T.castle.z,r:150,h:38}]}
 fastTerrain(T);
 /* gravel traps on the outside of the sharpest corners, where the outside is free of other road */
 const sharp=C.corners.slice().sort((a,b)=>b.pk-a.pk).slice(0,16);T.trapS=new Int8Array(N);T.traps=[];
 for(const c of sharp){const side=c.dir>0?-1:1;let ok=true;for(let q=c.a;q<=c.b+6&&ok;q+=3){const k=q%N,cs=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]),l=side*(T.hw[k]+18),x=T.x[k]+cs*l,z=T.z[k]-sn*l;
   const cx=Math.floor(x/16),cz=Math.floor(z/16);for(let a=-2;a<=2&&ok;a++)for(let b=-2;b<=2&&ok;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const di=Math.abs(((i-k)%N+N+N/2)%N-N/2);if(di>40&&Math.hypot(T.x[i]-x,T.z[i]-z)<T.hw[i]+14){ok=false;break}}}}
  if(!ok)continue;T.traps.push(c);for(let q=c.a-3;q<=c.b+6;q++)T.trapS[((q%N)+N)%N]=side}
 /* guard rail distance from the road edge, per side: close everywhere (the Nordschleife is lined with Armco), pushed back behind the traps */
 T.railL=new Float32Array(N).fill(3.2);T.railR=new Float32Array(N).fill(3.2);
 for(const c of T.traps){const R=c.dir>0?T.railR:T.railL;for(let q=c.a-12;q<=c.b+14;q++){const k=((q%N)+N)%N,t=Math.min(1,Math.min(q-(c.a-12),(c.b+14)-q)/9);R[k]=Math.max(R[k],lerp(3.2,15.6,t*t*(3-2*t)))}}
 for(let q=-30;q<=Math.round(N*.02);q++){const k=((q%N)+N)%N;T.railL[k]=Math.max(T.railL[k],5);T.railR[k]=Math.max(T.railR[k],5)}
 T.lampOff=new Float32Array(N);for(let i=0;i<N;i++)T.lampOff[i]=Math.max(T.railL[i],T.railR[i])+1.6;
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y);if(r.road)return r;const cx=Math.floor(x/16),cz=Math.floor(z/16);let bd=1e9,bi=-1,bl=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((x-T.x[i])*dx+(z-T.z[i])*dz)/l2)),px=T.x[i]+dx*f,pz=T.z[i]+dz*f,dd=Math.hypot(x-px,z-pz);if(dd<bd){bd=dd;bi=i;bl=(x-px)*Math.cos(T.psi[i])-(z-pz)*Math.sin(T.psi[i])}}}
  if(bi>=0&&T.trapS[bi]&&Math.sign(bl)===T.trapS[bi]){const ex=Math.abs(bl)-T.hw[bi];if(ex>2.3&&ex<13.6)r.trap=1}
  return r};
 return T};

/* ---------- streamed terrain tiles ---------- */
const TS=128;
function tileSystem(T,sc){
 const N=T.N,d=T.d,grp=new THREE.Group();grp.name='ringTiles';grp.userData.noChunk=1;sc.add(grp);
 const need=new Map();
 for(let i=0;i<N;i+=4){const tx=Math.floor(T.x[i]/TS),tz=Math.floor(T.z[i]/TS);for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++){const X=tx+a,Z=tz+b,dd=Math.hypot((X+.5)*TS-T.x[i],(Z+.5)*TS-T.z[i]);if(dd>640)continue;const k=X*8192+Z,o=need.get(k);if(!o)need.set(k,{X,Z,d:dd});else if(dd<o.d)o.d=dd}}
 const mt=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});styleMaterial(mt);
 const live=new Map();let job=null,want=[],lx=1e9,lz=1e9;
 const forest=T.forest;
 function begin(t){const cs=t.d<120?4:t.d<280?8:16,n=TS/cs;return{t,cs,n,row:0,h:new Float32Array((n+1)*(n+1)),c:new Float32Array((n+1)*(n+1)*3)}}
 function stepRow(j){const{t,cs,n}=j,r=j.row,z=t.Z*TS+r*cs;
  for(let i=0;i<=n;i++){const x=t.X*TS+i*cs,h=terrainBed(T,x,z),rd=_rd,k=r*(n+1)+i;j.h[k]=h;
   const v=T.nz(x*2.1,z*2.1)*.5+.5,v2=T.nz(x*.6+40,z*.6-17)*.5+.5,fo=forest(x,z);
   let c=[.2+.06*v,.44+.1*v,.12+.03*v];
   if(v2>.66){const q=Math.min(1,(v2-.66)*6);c=[lerp(c[0],.36,q),lerp(c[1],.5,q),lerp(c[2],.18,q)]}
   if(fo>0){const q=fo*.85;c=[lerp(c[0],.17+.05*v,q),lerp(c[1],.27+.05*v,q),lerp(c[2],.1,q)]}
   if(rd<26){const q=1-sm(9,26,rd),st=((Math.floor(x/7)+Math.floor(z/7))&1)?.03:-.02;c=[lerp(c[0],.25+st,q),lerp(c[1],.55+st,q),lerp(c[2],.14,q)]}
   j.c[k*3]=c[0];j.c[k*3+1]=c[1];j.c[k*3+2]=c[2]}
  j.row++;return j.row>n}
 function finish(j){const{t,cs,n}=j,W=n+1,cnt=W*W,pos=new Float32Array((cnt+4*W)*3),col=new Float32Array((cnt+4*W)*3),idx=[];
  for(let r=0;r<=n;r++)for(let i=0;i<=n;i++){const k=r*W+i;pos[k*3]=t.X*TS+i*cs;pos[k*3+1]=j.h[k];pos[k*3+2]=t.Z*TS+r*cs}
  col.set(j.c);
  for(let r=0;r<n;r++)for(let i=0;i<n;i++){const a=r*W+i,b=a+W;idx.push(a,b,a+1,a+1,b,b+1)}
  /* skirts hide the cracks where a fine tile meets a coarse one */
  const edges=[[...Array(W).keys()],[...Array(W).keys()].map(i=>n*W+i),[...Array(W).keys()].map(r=>r*W),[...Array(W).keys()].map(r=>r*W+n)];let v=cnt;
  for(const E of edges){const s0=v;for(const k of E){pos[v*3]=pos[k*3];pos[v*3+1]=pos[k*3+1]-7;pos[v*3+2]=pos[k*3+2];col[v*3]=col[k*3]*.8;col[v*3+1]=col[k*3+1]*.8;col[v*3+2]=col[k*3+2]*.8;v++}
   for(let q=0;q<E.length-1;q++)idx.push(E[q],E[q+1],s0+q,E[q+1],s0+q+1,s0+q)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mt);m.receiveShadow=true;m.userData.noChunk=1;m.matrixAutoUpdate=false;m.updateMatrix();grp.add(m);return m}
 const far=()=>((sc.fog&&sc.fog.far)||520)+150;
 function plan(px,pz){lx=px;lz=pz;const R=far(),R2=(R+90)*(R+90);want=[];
  for(const[k,t]of need){const dx=(t.X+.5)*TS-px,dz=(t.Z+.5)*TS-pz,d2=dx*dx+dz*dz;if(d2<R2)want.push([d2,k,t]);else{const m=live.get(k);if(m&&d2>(R+380)*(R+380)){grp.remove(m);m.geometry.dispose();live.delete(k)}}}
  want.sort((a,b)=>a[0]-b[0])}
 const sys={grp,live,need,
  update(px,pz,budget){if(Math.hypot(px-lx,pz-lz)>24)plan(px,pz);const t0=performance.now();
   while(performance.now()-t0<budget){if(!job){const w=want.find(e=>!live.has(e[1]));if(!w)break;job=begin(w[2]);job.k=w[1]}
    if(stepRow(job)){live.set(job.k,finish(job));job=null}}
   /* tiles past the fog are pure fog colour: hide them */
   const R=far()-150;for(const m of grp.children){const s=m.geometry.boundingSphere;m.visible=Math.hypot(s.center.x-px,s.center.z-pz)-s.radius<R}},
  pending(){return want.filter(e=>!live.has(e[1])).length}};
 return sys}

/* ---------- the world ---------- */
const PANO_R=1290;
function panoRing(T){const d=T.d,W=4096,H=512,hz=352,fog=new THREE.Color(d.fog),cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),r=rngf(1927);
 const mix=(hex,t)=>'#'+new THREE.Color(hex).lerp(fog,t).getHexString(),sn=(x,seed,terms)=>{let s=0;for(const[k,a,p]of terms)s+=a*Math.sin(2*PI*k*x/W+p+seed);return s};
 const ridge=(base,amp,terms,seed,fill)=>{g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,base-amp*sn(x,seed,terms));g.lineTo(W,H);g.closePath();g.fillStyle=fill;g.fill()};
 const T3=[[2,.5,0],[5,.3,1],[11,.18,2],[23,.1,3]],T4=[[3,.4,1],[8,.25,0],[17,.12,2],[37,.06,1]];
 ridge(300,60,T3,3,mix(0x6f8798,.62));
 /* the Hohe Acht: the tallest Eifel peak, with its lookout tower */
 {const x0=W*.18,w=720,h=150;g.beginPath();g.moveTo(x0,hz);for(let i=0;i<=40;i++){const u=i/40;g.lineTo(x0+w*u,hz-h*Math.pow(Math.sin(PI*u),1.4)-8*Math.sin(u*31))}g.closePath();g.fillStyle=mix(0x4f6a5c,.5);g.fill();g.fillStyle=mix(0x3c4a44,.45);g.fillRect(x0+w/2-5,hz-h-30,10,34);g.fillRect(x0+w/2-9,hz-h-34,18,6)}
 ridge(322,44,T4,1,mix(0x4d6a50,.48));
 /* wind turbines on a far ridge */
 for(let i=0;i<7;i++){const x=W*.55+i*58+r()*20,hh=96+r()*16;g.fillStyle=mix(0xeef2f4,.3);g.fillRect(x-1.5,hz-34-hh,3,hh);g.save();g.translate(x,hz-34-hh);const a0=r()*6;for(let b=0;b<3;b++){g.save();g.rotate(a0+b*2.094);g.fillRect(-1,0,2,-40);g.restore()}g.restore()}
 ridge(338,30,T3,7,mix(0x3f5c40,.36));
 /* Nurburg castle on its hill */
 {const x=W*.72,h=60;g.fillStyle=mix(0x3f5c40,.3);g.beginPath();g.moveTo(x-200,hz);g.quadraticCurveTo(x,hz-h*2,x+200,hz);g.fill();g.fillStyle=mix(0x7d7466,.32);g.fillRect(x-34,hz-h-14,68,22);g.fillRect(x-10,hz-h-48,20,40);for(let q=0;q<5;q++)g.fillRect(x-34+q*15,hz-h-20,8,6)}
 g.fillStyle=mix(0x24402c,.2);for(let layer=0;layer<2;layer++)for(let x=-10;x<W+10;x+=6+layer*3){const hh=14+layer*8+r()*(22+layer*12);g.beginPath();g.moveTo(x,hz+6);g.lineTo(x+4,hz-hh);g.lineTo(x+8,hz+6);g.fill()}
 const gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,mix(0x2c4a30,.18));gr.addColorStop(1,mix(0x335233,.1));g.fillStyle=gr;g.fillRect(0,hz+4,W,H-hz);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;
 const m=new THREE.Mesh(new THREE.CylinderGeometry(PANO_R,PANO_R,480,72,1,true),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));m.renderOrder=-2;m.frustumCulled=false;m.userData.noChunk=1;m.userData.ringPano=1;return m}

function instC(sc,geo,m,list,tint){const im=new THREE.InstancedMesh(geo,m,list.length),o=new THREE.Object3D(),col=new THREE.Color();
 list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4]||p[3],p[5]||p[3]);o.rotation.set(0,p[6]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(tint){col.setHex(tint[(Math.floor(Math.abs(p[0]*7+p[2]*13))%tint.length)]);col.offsetHSL(0,0,(Math.sin(p[0]*.13-p[2]*.23))*.035);im.setColorAt(i,col)}});
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;sc.add(im);return im}

function buildRing(T){const d=T.d,N=T.N,sc=new THREE.Scene(),C=T._rc||cornersOf(T),curv=C.curv,corners=C.corners,infield=C.left;
 const rr=(()=>{let s=20832;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();
 sc.userData.ring=1;
 sc.fog=new THREE.Fog(d.fog,120,520);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],1.05));const sun=new THREE.DirectionalLight(d.sun,.95);sun.position.set(-150,250,100);sc.add(sun);
 const sk=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#'+d.sky[0].toString(16).padStart(6,'0'));g.addColorStop(.5,'#'+d.sky[1].toString(16).padStart(6,'0'));g.addColorStop(1,'#'+d.sky[1].toString(16).padStart(6,'0'));x.fillStyle=g;x.fillRect(0,0,w,h)});
 {const dm=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sk,side:THREE.BackSide,fog:false}));dm.frustumCulled=false;sc.add(dm);
  const sd=mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:d.sun,fog:false}),-500,420,-1000,sc);sd.frustumCulled=false}
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 /* forest cover: dense Eifel woods with clearings and a few open meadows (the Flugplatz plateau, the Dottinger Hohe fields) */
 const open=[];for(const nm of['FLUGPLATZ','DOTTINGER HOHE','QUIDDELBACHER HOHE','ANTONIUSBUCHE']){const i=RG.marks[nm];if(i==null)continue;const p=RG.pts[i];open.push([p[0],p[1],nm==='DOTTINGER HOHE'?900:420])}
 T.forest=(x,z)=>{let f=clamp(((T.nz(x*.33+11,z*.33-7)*.5+.5)-.16)*3.4,0,1);for(const o of open){const e=Math.hypot(x-o[0],z-o[1])/o[2];if(e<1)f*=sm(.55,1,e)}if(T.castle){const e=Math.hypot(x-T.castle.x,z-T.castle.z);if(e<120)f=0}return f};
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-s*l,ry=T.y[k]-l*T.bank[k],ex=Math.abs(l)-T.hw[k];if(ex>1.2){const ty=T.terr(x,z);return[x,(ex<5?Math.max(ty,ry):ty)+(dy||0)+(ex<5?.05:0),z]}return[x,ry+(dy||0),z]};
 const dRoad=(x,z,far)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16),R=far||2;let b=1e9;for(let a=-R;a<=R;a++)for(let c=-R;c<=R;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const dd=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(dd<b)b=dd}}return b>=1e9?999:Math.max(0,b)};
 const M_=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{}));
 const MB=c=>new THREE.MeshBasicMaterial({color:c});
 const g=new THREE.Group();g.name='ringDress';
 /* ---- road: dark Eifel tarmac with white edge lines (no centre line on the Nordschleife), concrete gutters, recessed deck ---- */
 const rt=ctex(32,32,(x,w,h)=>{x.fillStyle=d.road;x.fillRect(0,0,w,h);const q=rngf(5);for(let i=0;i<120;i++){x.fillStyle=q()<.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.05)';x.fillRect(q()*w|0,q()*h|0,1,1)}x.fillStyle='#ffffffc0';x.fillRect(1,0,1,h);x.fillRect(w-2,0,1,h)}),rm=new THREE.MeshStandardMaterial({map:rt,roughness:.9,side:THREE.DoubleSide});
 sc.add(ribbon(T,k=>-T.hw[k],k=>T.hw[k],8,.05,rm,6));
 const gm=M_(0x9c9f9a,{side:THREE.DoubleSide,flatShading:false});
 sc.add(ribbon(T,k=>T.hw[k],k=>T.hw[k]+.7,1,.055,gm,4));sc.add(ribbon(T,k=>-T.hw[k]-.7,k=>-T.hw[k],1,.055,gm,4));
 sc.add(ribbon(T,k=>-T.hw[k]-.75,k=>T.hw[k]+.75,4,-.65,mat(0x42484a),8));
 for(const side of[-1,1]){const pp=[],ind=[];for(let i=0;i<=N;i++){const k=i%N,l=side*(T.hw[k]+.72),x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l,y=T.y[k]-l*T.bank[k];pp.push(x,y-.68,z,x,y+.05,z)}for(let i=0;i<N;i++){const a=i*2;ind.push(a,a+2,a+1,a+1,a+2,a+3)}const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));gg.setIndex(ind);gg.computeVertexNormals();sc.add(new THREE.Mesh(gg,mat(0x565c5e,{side:THREE.DoubleSide})))}
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,p0=at(k,side*(T.hw[k]+w0),dy),p1=at(k,side*(T.hw[k]+w1),dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 /* ---- kerbs on every corner ---- */
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#d8392f':'#f1f1f1';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 {const inR=[],inL=[];for(const c of corners){const a=((c.a-2)%N+N)%N,b=c.b+2;(c.dir>0?inL:inR).push([a,b])}
  strip(inL,1,-.15,1.3,.07,curbM,2.8);strip(inR,-1,-.15,1.3,.07,curbM,2.8)}
 /* ---- the Karussell: the famous banked concrete bowl on the inside ---- */
 {const km=RG.marks.KARUSSELL;if(km!=null){const p=RG.pts[km],k0=nearIdx(T,p[0],p[1]);const c=corners.find(c=>k0>=c.a-30&&k0<=c.b+30);if(c){const side=c.dir>0?1:-1;
   const ct=ctex(16,16,(x,w,h)=>{x.fillStyle='#a7a7a0';x.fillRect(0,0,w,h);x.fillStyle='#8c8c86';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillStyle='rgba(0,0,0,.06)';x.fillRect(3,5,4,2);x.fillRect(9,11,3,2)});
   const cm=new THREE.MeshStandardMaterial({map:ct,roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const pos=[],uv=[],idx=[],a=c.a-4,n=c.b-c.a+8;for(let q=0;q<=n;q++){const k=((a+q)%N+N)%N;for(let j=0;j<=4;j++){const l=side*lerp(-T.hw[k]*.15,T.hw[k],j/4),x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l;pos.push(x,T.y[k]-l*T.bank[k]+.065,z);uv.push(j/4*2,q*T.sp/3)}}
   for(let q=0;q<n;q++)for(let j=0;j<4;j++){const i=q*5+j;idx.push(i,i+5,i+1,i+1,i+5,i+6)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,cm));T.karussell=c}}}
 /* ---- gravel traps ---- */
 {const sandTex=ctex(32,32,(x,w,h)=>{x.fillStyle='#d9c58e';x.fillRect(0,0,w,h);x.fillStyle='#c6b077';for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1);x.fillStyle='#e8d9a8';for(let j=2;j<h;j+=8)x.fillRect(0,j,w,1)});
  const sandM=new THREE.MeshStandardMaterial({map:sandTex,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  for(const c of T.traps){const side=c.dir>0?-1:1,a=c.a-3,b=c.b+6;for(let w=2.4;w<13.4;w+=2.2)strip([[((a%N)+N)%N,b]],side,w,Math.min(13.5,w+2.2),.14,sandM,8)}}
 /* ---- Armco on both sides of the whole lap (double rail on posts), every rail a real collider ---- */
 {const railTex=ctex(4,16,(x,w,h)=>{x.fillStyle='#b9c1c4';x.fillRect(0,0,w,h);x.fillStyle='#7c8689';x.fillRect(0,3,w,2);x.fillRect(0,11,w,2);x.fillStyle='#dfe5e7';x.fillRect(0,1,w,1);x.fillRect(0,9,w,1)}),
   rail=new THREE.MeshStandardMaterial({map:railTex,roughness:.45,metalness:.4,side:THREE.DoubleSide}),posts=[];
  for(const side of[-1,1]){const RO=side>0?T.railL:T.railR,pos=[],uv=[],idx=[];
   for(let i=0;i<=N;i++){const k=i%N,l=side*(T.hw[k]+RO[k]),p0=at(k,l,.38),p1=at(k,l,1.0);pos.push(...p0,...p1);uv.push(i*T.sp/4,0,i*T.sp/4,1);if(i<N&&i%2===0)posts.push([p0[0],p0[1]-.1,p0[2],1,1,0,T.psi[k]]);
    if(i<N&&P.addSeg){const q0=at(k,l,0),q1=at(k+1,side*(T.hw[(k+1)%N]+RO[(k+1)%N]),0);P.addSeg(T,q0[0],q0[2],q1[0],q1[2],.3)}}
   for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();sc.add(new THREE.Mesh(gg,rail))}
  instC(g,new THREE.BoxGeometry(.16,1.1,.16),M_(0x6f797d),posts.map(p=>[p[0],p[1]+.55,p[2],1,1,1,p[6]]))}
 /* ---- tyre walls behind the gravel at the sharpest corners ---- */
 {const sharp=T.traps.slice().sort((a,b)=>b.pk-a.pk).slice(0,7),B=[],Wt=[],R=[];
  for(const c of sharp){const side=c.dir>0?-1:1;for(let q=c.a-2;q<=c.b+6;q++){const k=((q%N)+N)%N,blk=Math.floor(q/4)%5;for(let row=0;row<2;row++){const l=side*(T.hw[k]+14.4-row*1.05);for(let h=0;h<3;h++){const p=at(k,l,.28+h*.52);(blk===0?Wt:blk===3?R:B).push([p[0],p[1],p[2],1,1,1,0])}}
    if(P.addSeg){const p1=at(k,side*(T.hw[k]+13.9),0),p2=at(k+1,side*(T.hw[(k+1)%N]+13.9),0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.9)}}}
  const cg=new THREE.CylinderGeometry(.55,.55,.5,9);if(B.length)instC(g,cg,M_(0x1b1d21),B);if(Wt.length)instC(g,cg,M_(0xf1f1f1),Wt);if(R.length)instC(g,cg,M_(0xd8392f),R)}
 /* ---- forest ---- */
 {const spr=[],dec=[],bush=[];
  const nS=Math.round(N*.03);
  for(let i=0;i<N;i+=2){for(const side of[-1,1]){const RO=side>0?T.railL:T.railR;for(let t=0;t<4;t++){const l=side*(T.hw[i]+RO[i]+3.2+Math.pow(rr(),1.6)*170),startZ=(i<nS||i>N-20)&&Math.abs(l)<75,c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),x=T.x[i]+c*l+(rr()-.5)*6,z=T.z[i]-s*l+(rr()-.5)*6;
    const f=T.forest(x,z);if(startZ||rr()>f*.95+.03)continue;if(dRoad(x,z,1)<RO[i]+3)continue;const y=T.terr(x,z),sc_=.8+rr()*.75;(rr()<.72?spr:dec).push([x,y,z,sc_,0,0,rr()*6])}
   if(rr()<.25){const l=side*(T.hw[i]+RO[i]+1.6+rr()*2.5),p=at(i,l,0);bush.push([p[0],p[1]+.25,p[2],.6+rr()*.7,.5+rr()*.4,.6+rr()*.7,rr()*6])}}}
  const tk=M_(0x4a3424);
  instC(g,new THREE.CylinderGeometry(.24,.36,2.6,5),tk,spr.concat(dec).map(p=>[p[0],p[1]+1.3*p[3],p[2],p[3]]));
  const ti=[0x24583a,0x1f4d34,0x2b6440,0x1b4630];
  instC(g,new THREE.ConeGeometry(2.6,4.6,7),M_(0xffffff),spr.map(p=>[p[0],p[1]+3.8*p[3],p[2],p[3],p[3],p[3],p[6]]),ti);
  instC(g,new THREE.ConeGeometry(1.9,4,7),M_(0xffffff),spr.map(p=>[p[0],p[1]+6.6*p[3],p[2],p[3],p[3],p[3],p[6]]),ti);
  instC(g,new THREE.ConeGeometry(1.2,3.4,7),M_(0xffffff),spr.map(p=>[p[0],p[1]+9*p[3],p[2],p[3],p[3],p[3],p[6]]),ti);
  instC(g,new THREE.IcosahedronGeometry(2.8,0),M_(0xffffff),dec.map(p=>[p[0],p[1]+4.8*p[3],p[2],p[3],p[3]*1.05,p[3],p[6]]),[0x4d8b2f,0x5a9636,0x3f7a2c,0x6a9a3a]);
  instC(g,new THREE.IcosahedronGeometry(1,0),M_(0xffffff),bush,[0x3f6a30,0x4a7a34,0x355e2c]);
  T._trees=spr.length+dec.length}
 /* ---- signs: corner names, distance boards ---- */
 const signCanvas=(txt,w,h,bg,fg,fs)=>ctex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=3;c.strokeRect(3,3,W-6,H-6);c.fillStyle=fg;c.font='bold '+(fs||Math.floor(H*.5))+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+2)}),
  signTex=(...a)=>{const t=signCanvas(...a);t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;return t};/* filtered, so text stays readable from far away */
 const board=(k,l,txt,wm,hm,bg,fg,yy)=>{const[px,py,pz]=at(k,l,0),grp=new THREE.Group();grp.position.set(px,py,pz);grp.rotation.y=T.psi[((k%N)+N)%N]+PI;g.add(grp);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(.18,(yy||2.4)+hm/2,.18),M_(0x666d73));pl.position.set(0,(yy||2.4)/2+hm/4,0);grp.add(pl);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:signTex(txt,Math.max(128,Math.round(wm*96)),Math.max(64,Math.round(hm*96)),bg,fg)}));sg.position.set(0,(yy||2.4)+hm/2,.12);grp.add(sg);const sb=sg.clone();sb.position.z=-.12;sb.rotation.y=PI;grp.add(sb);/* two single-sided faces so the text never reads mirrored */return grp};
 const MK={};for(const nm in RG.marks){const p=RG.pts[RG.marks[nm]];MK[nm]=nearIdx(T,p[0],p[1])}
 const NICE={'FUCHSROHRE':'FUCHSRÖHRE','QUIDDELBACHER HOHE':'QUIDDELBACHER HÖHE','EX-MUHLE':'EX-MÜHLE','HEDWIGSHOHE':'HEDWIGSHÖHE','BRUNNCHEN':'BRÜNNCHEN','DOTTINGER HOHE':'DÖTTINGER HÖHE'};
 for(const nm in MK){if(nm==='START / FINISH')continue;const k=MK[nm],kk=((k-16)%N+N)%N,sd=-1;const txt=NICE[nm]||nm;board(kk,sd*(T.hw[kk]+T.railR[kk]+1.4),txt,Math.max(4,txt.length*.42),1.2,'#10151b','#f1f3f5',1.6)}
 for(let km=1;km<21;km++){const k=Math.round(km*1000/T.sp)%N;board(k,(T.hw[k]+T.railL[k]+1.2),String(km),1.1,1.1,'#f1f3f5','#10151b',1.2)}
 /* ---- bridges over the track (Breidscheid road bridge, Antoniusbuche, and a footbridge near the start) ---- */
 const bridge=(k,txt,col,foot)=>{k=((k%N)+N)%N;const[bx,by,bz]=at(k,0,0),bp=new THREE.Group();bp.position.set(bx,by,bz);bp.rotation.y=T.psi[k];g.add(bp);const wd=T.hw[k]+Math.max(T.railL[k],T.railR[k])+4,H=foot?6.6:7.4;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(wd*2+(foot?0:30),foot?.6:1.4,foot?3.2:10),M_(col));deck.position.y=H+(foot?.3:.7);bp.add(deck);
  for(const sx of[-1,1]){const gx=T.terr(bx+Math.cos(T.psi[k])*sx*wd,bz-Math.sin(T.psi[k])*sx*wd)-by,hh=H-gx+.1,ab=new THREE.Mesh(new THREE.BoxGeometry(foot?1.2:3,hh,foot?2.6:10.4),M_(0xb9bcb6));ab.position.set(sx*wd,gx+hh/2,0);bp.add(ab)}
  if(txt){const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.4,1.3),new THREE.MeshBasicMaterial({map:signTex(txt,1024,128,'#10151b','#f1f3f5',68)}));ban.position.set(0,H+(foot?1.4:.7),(foot?1.9:5.35));bp.add(ban);const b2=ban.clone();b2.position.z=-ban.position.z;b2.rotation.y=PI;bp.add(b2)}};
 if(MK.BREIDSCHEID!=null)bridge(MK.BREIDSCHEID+8,'ADENAU',0x8d8f8a);
 if(MK.ANTONIUSBUCHE!=null)bridge(MK.ANTONIUSBUCHE+12,'B 258',0x8d8f8a);
 bridge(Math.round(N*.045),'NÜRBURGRING',0x2c6cd0,1);
 /* ---- start / finish at the T13 grandstand ---- */
 {const MA=new THREE.MeshStandardMaterial({color:0xd8392f,roughness:.8});
  for(let row=0;row<6;row++){const k=(((-(5+row*5))%N)+N)%N;for(const s of[-1,1]){const[bx,by,bz]=at(k,s*T.hw[0]*.36,.09),bx2=new THREE.Mesh(new THREE.PlaneGeometry(3.1,5.4),MB(0xf1f1f1));bx2.rotation.x=-PI/2;bx2.rotation.order='YXZ';bx2.rotation.y=T.psi[k];bx2.position.set(bx,by,bz);g.add(bx2);
     const inn=new THREE.Mesh(new THREE.PlaneGeometry(2.7,5),MB(0x3a3c41));inn.rotation.copy(bx2.rotation);inn.position.set(bx,by+.012,bz);g.add(inn)}}
  const seats=ctex(16,8,(x,w,h)=>{x.fillStyle='#8d949c';x.fillRect(0,0,w,h);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b'];for(let i=0;i<w;i+=2){x.fillStyle=pal[(i>>1)%4];x.fillRect(i,1,2,2);x.fillRect(i,5,2,2)}}),seatM=new THREE.MeshStandardMaterial({map:seats,roughness:.9});
  const stand=(k,l,len,rows)=>{const sg=l>0?1:-1,[px,py,pz]=at(k,l,0),grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);const top=Math.max(py-gy,0);
   for(let r=0;r<rows;r++){const h=top+1.2+r*.95,b=new THREE.Mesh(new THREE.BoxGeometry(2.4,h+3,len),seatM);b.position.set(sg*r*2.4,(h-3)/2,0);grp.add(b)}
   const roof=new THREE.Mesh(new THREE.BoxGeometry(rows*2.4+1.5,.4,len+1.5),MB(0xe9e9e9));roof.position.set(sg*(rows*1.2-1.2),top+rows*.95+6.2,0);grp.add(roof);
   for(const sz of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(.35,rows*.95+6.5,.35),M_(0x9aa2a8));pl.position.set(sg*(rows*2.4-1.2),top+(rows*.95+6.5)/2-2,sz*len/2);grp.add(pl)}
   if(P.addPt)for(let q=-2;q<=2;q++){const a=Math.cos(T.psi[k]),b=Math.sin(T.psi[k]);P.addPt(T,px+b*q*len/5,pz+a*q*len/5,2.2)}
   return grp};
  stand(14,-infield*(T.hw[14]+T.railR[14]+7),90,10);stand(40,-infield*(T.hw[40]+T.railR[40]+7),50,7);
  /* gantry */
  {const kg=4,[gx,gy,gz]=at(kg,0,0),gp=new THREE.Group();gp.position.set(gx,gy,gz);gp.rotation.y=T.psi[kg]+PI;g.add(gp);const wd=T.hw[kg]+4;
   for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1,11,1),MA);col.position.set(sx*wd,5.5,0);gp.add(col)}
   const beam=new THREE.Mesh(new THREE.BoxGeometry(wd*2+1,1.2,1.2),M_(0xf1f1f1));beam.position.set(0,10.8,0);gp.add(beam);
   const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.9,3.2),new THREE.MeshBasicMaterial({map:ctex(512,96,(c,W,H)=>{c.fillStyle='#10151b';c.fillRect(0,0,W,H);c.fillStyle='#d8392f';c.fillRect(0,H-12,W,12);c.fillStyle='#f1f1f1';c.font='bold 58px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('NORDSCHLEIFE',W/2,H/2-4)})}));ban.position.set(0,8.6,.65);gp.add(ban);const b2=ban.clone();b2.position.z=-.65;b2.rotation.y=PI;gp.add(b2)}
  /* low buildings behind the stands */
  for(let q=0;q<5;q++){const k=(20+q*16)%N,[px,py,pz]=at(k,infield*(T.hw[k]+T.railL[k]+16),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[k];g.add(b);
   const bl=new THREE.Mesh(new THREE.BoxGeometry(9,4.6,12),M_(q%2?0xd7d9d4:0xc7cbc5));bl.position.y=2.3;b.add(bl);const rf=new THREE.Mesh(new THREE.BoxGeometry(10,.5,13),M_(0x2c3238));rf.position.y=4.8;b.add(rf);if(P.addPt)P.addPt(T,px,pz,6.5)}
  const fl=[],pl=[];for(let k=6;k<Math.round(N*.03);k+=9)for(const sd of[-1,1]){const RO=sd>0?T.railL:T.railR,p=at(k,sd*(T.hw[k]+RO[k]+1.2),0);pl.push([p[0],p[1]+4,p[2],1,8,1]);fl.push([p[0],p[1]+7,p[2],1,1,1,T.psi[k]])}
  instC(g,new THREE.CylinderGeometry(.07,.09,1,5),M_(0xcfd3d6),pl);instC(g,new THREE.BoxGeometry(2.2,1.3,.05),MB(0xffffff),fl,[0xd8392f,0xf2c76b,0x2c6cd0,0x10151b])}
 /* ---- spectator banks: campers, tents and crowds at the classic spots ---- */
 {const peeps=[],tents=[],vans=[];
  for(const nm of['BRUNNCHEN','PFLANZGARTEN','KARUSSELL','ADENAUER FORST','SCHWEDENKREUZ','EX-MUHLE','HOHE ACHT','WEHRSEIFEN']){const k0=MK[nm];if(k0==null)continue;
   for(let q=-30;q<=30;q+=2){const k=((k0+q)%N+N)%N,side=curv[k]>0?-1:1,RO=side>0?T.railL:T.railR;
    for(let n=0;n<3;n++){if(rr()<.35)continue;const l=side*(T.hw[k]+RO[k]+1.4+rr()*7),p=at(k,l,0);peeps.push([p[0],p[1]+.55,p[2],1,1,1,rr()*6])}
    if(q%10===0){const l=side*(T.hw[k]+RO[k]+12+rr()*6),p=at(k,l,0);(rr()<.5?tents:vans).push([p[0],p[1],p[2],1,1,1,T.psi[k]+(rr()-.5)*.6])}}}
  if(peeps.length){instC(g,new THREE.CylinderGeometry(.22,.26,1.0,5),M_(0xffffff),peeps,[0xd8392f,0x2f6fd0,0xf2c230,0x2fa05a,0x111111,0xe8e8e8,0xff7a2a]);instC(g,new THREE.SphereGeometry(.2,5,4),M_(0xe3b58d),peeps.map(p=>[p[0],p[1]+.7,p[2],1]))}
  if(tents.length)instC(g,new THREE.ConeGeometry(2.6,2.4,4),M_(0xffffff),tents.map(p=>[p[0],p[1]+1.2,p[2],1,1,1,p[6]+PI/4]),[0xf1f1f1,0xd8392f,0x2c6cd0,0xf2c76b]);
  if(vans.length){instC(g,new THREE.BoxGeometry(2.3,2.6,6),M_(0xffffff),vans.map(p=>[p[0],p[1]+1.5,p[2],1,1,1,p[6]]),[0xeeeeea,0xd9d2c0,0xc0d0dc]);for(const p of vans)if(P.addPt)P.addPt(T,p[0],p[2],2.4)}}
 /* ---- Nurburg castle ---- */
 if(T.castle){const{x,z}=T.castle,y=T.terr(x,z),cg=new THREE.Group();cg.position.set(x,y,z);g.add(cg);const st=M_(0x9a9182),rf=M_(0x5a4a40);
  const keep=new THREE.Mesh(new THREE.CylinderGeometry(6,7,26,10),st);keep.position.y=12;cg.add(keep);const kc=new THREE.Mesh(new THREE.CylinderGeometry(7,6.6,2,10),st);kc.position.y=25.5;cg.add(kc);
  for(let q=0;q<10;q++){const a=q/10*PI*2,w=new THREE.Mesh(new THREE.BoxGeometry(14,7,2.2),st);w.position.set(Math.cos(a)*22,2.5,Math.sin(a)*22);w.rotation.y=-a+PI/2;cg.add(w)}
  for(const a of[.3,2.4,4.4]){const tw=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,11,8),st);tw.position.set(Math.cos(a)*23,4.5,Math.sin(a)*23);cg.add(tw);const cn=new THREE.Mesh(new THREE.ConeGeometry(3.8,5,8),rf);cn.position.set(Math.cos(a)*23,12.5,Math.sin(a)*23);cg.add(cn)}}
 styleScene(g);sc.add(g);
 const pn=panoRing(T);sc.add(pn);
 styleScene(sc);
 /* streamed terrain: build everything around the start now, the rest follows the camera */
 const tiles=tileSystem(T,sc);sc.userData.ringTiles=tiles;sc.userData.ringPano=pn;
 tiles.update(T.x[0],T.z[0],1e9);
 return sc}

const bwR=buildWorld;buildWorld=T=>T.d&&T.d.ring?buildRing(T):bwR(T);

/* every render of a ring scene: the panorama rides with the camera at eye height, and terrain tiles are streamed in around it (a few ms per frame) */
{const r0=R.render.bind(R),cp=new THREE.Vector3();
 R.render=function(scene,cam){if(scene&&scene.userData&&scene.userData.ringTiles&&cam&&cam.isCamera){cam.getWorldPosition(cp);const pn=scene.userData.ringPano;if(pn){pn.position.set(cp.x,cp.y+84,cp.z);pn.updateMatrixWorld()}
   try{scene.userData.ringTiles.update(cp.x,cp.z,(typeof scr!=='undefined'&&scr==='game')?2.5:6)}catch(e){console.warn('ring tiles',e)}}
  return r0(scene,cam)}}
})();
