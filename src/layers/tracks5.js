/* ===== Poly GT layer: tracks5 (circuit-mode track: the Nurburgring Nordschleife, 20.8 km. The landscape is streamed in tiles around the camera so the long lap never builds or draws all at once) ===== */
(function v9tracks5(){
'use strict';
const P=window.PT8,RG=window.PT8_RING;
if(!RG||!P.TRK_TRACKS)return;
const ring={id:16,look:0,name:'Nordschleife',desc:'nurburgring / 20.8 km / karussell / flugplatz / the green hell',hw:5.2,bank:10,off:'grass',idw:.85,offs:0,amp:5,up:9,shoulder:14,
 sky:[0x5b8bc2,0xd3e0ea],fog:0xc8d6de,sun:0xfff0d8,hemi:[0xcfe0c4,0x2c4422],road:'#3a3c41',tod0:'day',ring:1,
 pts:RG.pts.map(q=>[q[0],q[1],q[2],q[3]]),walls:[],ice:[],boost:[],jumps:[]};
D.push(ring);
P.TRACK_INFO.push({s:'TARMAC',tags:['20.8 KM','KARUSSELL','FLUGPLATZ','290 M CLIMB']});
P.TRK_TRACKS.push(D.length-1);
const RX=D.length-1;P.RING_IDX=RX;
P.MEDAL_REF[RX]=521;/* Mercedes AI lap 491.1 s on the OSM layout x 1.06, same rule as Road Atlanta and Imola */
MATS.sandtrap=MATS.sandtrap||{grip:.42,top:.5,acc:.4};

/* ---------- corners (same rule as Imola: curvature above ~1/95 m for more than 18 m) ---------- */
function cornersOf(T){const N=T.N,curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wr(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 const corners=[];let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0105;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>6){let pk=0,pi=s;for(let q=s;q<i;q++)if(Math.abs(curv[q])>pk){pk=Math.abs(curv[q]);pi=q}corners.push({a:s,b:i,dir:Math.sign(curv[pi]),pk,pi})}s=-1}}
 let tot=0;for(let i=0;i<N;i++)tot+=curv[i];return{curv,corners,left:tot>=0?1:-1}}
const nearIdx=(T,x,z)=>{let b=1e18,bi=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<b){b=d;bi=i}}return bi};

/* ---------- fast terrain: the stock terrain looks at every centreline point for every height, which is far too slow for 20 km.
   Here the landscape only looks at centreline points within ~380 m (coarse grid), and the road blend only at the road within ~64 m ---------- */
let _rd=999,_ri=-1,_rs=0;
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
  _rd=999;_ri=bi;
  if(bi>=0){const dd=Math.sqrt(bd),hw=T.hw[bi],lat=clamp((x-T.x[bi])*Math.cos(T.psi[bi])-(z-T.z[bi])*Math.sin(T.psi[bi]),-hw,hw),yr=T.y[bi]-lat*T.bank[bi];_rd=Math.max(0,dd-hw);_rs=Math.sign((x-T.x[bi])*Math.cos(T.psi[bi])-(z-T.z[bi])*Math.sin(T.psi[bi]));
   b=lerp(yr,b,sm(hw+1.1,hw+1.1+d.shoulder+clamp(Math.abs(yr-b)*1.2,0,20),dd));
   /* the ground meets the road edge flush (just under the asphalt) and eases away from it */
   let bd2=1e9,by2=0;
   for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const ids=T.grid.get(gk(cx+a,cz+c));if(!ids)continue;for(const i of ids){const j=(i+1)%N,ex=T.x[j]-T.x[i],ez=T.z[j]-T.z[i],fr=((x-T.x[i])*ex+(z-T.z[i])*ez)/(ex*ex+ez*ez),f=clamp(fr,0,1),px=lerp(T.x[i],T.x[j],f),pz=lerp(T.z[i],T.z[j],f),dist=Math.hypot(x-px,z-pz);if((fr<0||fr>1)&&dist<T.hw[i]+2.5)continue;if(dist<T.hw[i]+8){const psi=T.psi[i]+wr(T.psi[j]-T.psi[i])*f,lt=(x-px)*Math.cos(psi)-(z-pz)*Math.sin(psi),y=lerp(T.y[i],T.y[j],f)-lt*lerp(T.bank[i],T.bank[j],f);if(dist-T.hw[i]<bd2){bd2=dist-T.hw[i];by2=y}}}}if(bd2<1e9){const e=Math.max(0,bd2-5)*.85;b=Math.min(Math.max(b,by2-.04-e),by2-.04+e)}}
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
 /* the exact height of the drawn ground at (x,z): same grid size and diagonal as the tile that covers it (snap.js sits props on this) */
 T.meshH=(x,z)=>{const X=Math.floor(x/TS),Z=Math.floor(z/TS),t=need.get(X*8192+Z);if(!t)return null;const cs=t.d<120?4:t.d<280?8:16,n=TS/cs,lx=(x-X*TS)/cs,lz=(z-Z*TS)/cs,i=Math.min(n-1,Math.floor(lx)),j=Math.min(n-1,Math.floor(lz)),fi=lx-i,fj=lz-j,H=(a,b)=>terrainBed(T,X*TS+a*cs,Z*TS+b*cs);
  const ha1=H(i+1,j),hb=H(i,j+1);if(fi+fj<=1){const ha=H(i,j);return ha+fi*(ha1-ha)+fj*(hb-ha)}const hb1=H(i+1,j+1);return hb1+(1-fi)*(hb-hb1)+(1-fj)*(ha1-hb1)};
 const mt=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide});styleMaterial(mt);
 const live=new Map();let job=null,want=[],lx=1e9,lz=1e9;
 const forest=T.forest;
 function begin(t){const cs=t.d<120?4:t.d<280?8:16,n=TS/cs;return{t,cs,n,row:0,h:new Float32Array((n+1)*(n+1)),c:new Float32Array((n+1)*(n+1)*3)}}
 function stepRow(j){const{t,cs,n}=j,r=j.row,z=t.Z*TS+r*cs;
  for(let i=0;i<=n;i++){const x=t.X*TS+i*cs,h=terrainBed(T,x,z),rd=_rd,ri=_ri,rs=_rs,k=r*(n+1)+i;j.h[k]=h;
   const v=T.nz(x*2.1,z*2.1)*.5+.5,v2=T.nz(x*.6+40,z*.6-17)*.5+.5,ew=ri>=0?(rs>0?T.edgeL[ri]:T.edgeR[ri])-T.hw[ri]:60,fo=forest(x,z,99)*sm(ew-1,ew+2.5,rd);
   let c=[.13+.05*v,.36+.09*v,.08+.03*v];
   if(v2>.66){const q=Math.min(1,(v2-.66)*6);c=[lerp(c[0],.36,q),lerp(c[1],.5,q),lerp(c[2],.18,q)]}
   if(fo>0){const q=fo*.85;c=[lerp(c[0],.08+.04*v,q),lerp(c[1],.22+.05*v,q),lerp(c[2],.07,q)]}
   if(rd<ew+1){const q=1-sm(ew-1.5,ew+1,rd),st=((Math.floor(x/7)+Math.floor(z/7))&1)?.03:-.02;c=[lerp(c[0],.19+st,q),lerp(c[1],.47+st,q),lerp(c[2],.1,q)]}
   if(rd<ew&&ew>14){const q=Math.min(1,(ew-14)/20)*(1-sm(10,ew,rd))*(.75+.25*v2);if(q>0)c=[lerp(c[0],.24+.04*v,q),lerp(c[1],.43+.04*v,q),lerp(c[2],.12,q)]}
   /* sand traps are painted into the ground itself, so they can never float above it */
   if(ri>=0&&T.trapS&&T.trapS[ri]&&rs===T.trapS[ri]&&rd>2.2&&rd<13.8){const q=.04*v;c=[.62+q,.55+q,.36+q*.5]}
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
 sc.fog=new THREE.Fog(d.fog,120,520);sc.add(new THREE.HemisphereLight(d.hemi[0],d.hemi[1],.92));const sun=new THREE.DirectionalLight(d.sun,1.0);sun.position.set(-150,250,100);sc.add(sun);
 const sk=ctex(2,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#'+d.sky[0].toString(16).padStart(6,'0'));g.addColorStop(.5,'#'+d.sky[1].toString(16).padStart(6,'0'));g.addColorStop(1,'#'+d.sky[1].toString(16).padStart(6,'0'));x.fillStyle=g;x.fillRect(0,0,w,h)});
 {const dm=new THREE.Mesh(new THREE.SphereGeometry(1500,16,12),new THREE.MeshBasicMaterial({map:sk,side:THREE.BackSide,fog:false}));dm.frustumCulled=false;sc.add(dm);
  const sd=mesh(new THREE.SphereGeometry(40,12,8),new THREE.MeshBasicMaterial({color:d.sun,fog:false}),-500,420,-1000,sc);sd.frustumCulled=false}
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}T.bounds=[x0-190,x1+190,z0-190,z1+190];
 /* forest cover: dense Eifel woods with clearings and a few open meadows (the Flugplatz plateau, the Dottinger Hohe fields) */
 const open=[];for(const nm of['FLUGPLATZ','DOTTINGER HOHE','QUIDDELBACHER HOHE','ANTONIUSBUCHE','BRUNNCHEN','PFLANZGARTEN','KARUSSELL','ADENAUER FORST','SCHWEDENKREUZ','EX-MUHLE','HOHE ACHT','WEHRSEIFEN']){const i=RG.marks[nm];if(i==null)continue;const p=RG.pts[i];open.push([p[0],p[1],nm==='DOTTINGER HOHE'?300:nm==='FLUGPLATZ'||nm==='QUIDDELBACHER HOHE'||nm==='ANTONIUSBUCHE'?190:110])}
 /* clearings are grassy banks along the road with the forest standing back: openF says how deep in a clearing a point is */
 T.openF=(x,z)=>{let o=0;for(const q of open){const e=Math.hypot(x-q[0],z-q[1])/q[2];if(e<1)o=Math.max(o,1-sm(.55,1,e))}return o};
 T.forest0=(x,z)=>clamp(.86+.14*(T.nz(x*.33+11,z*.33-7)*.5+.5),0,1);/* solid forest everywhere: only the named clearings open it up */
 /* dist = metres from the road edge: past the grass banks (about 38 m) even a clearing is forest again */
 /* the tree line on each side: grass bank 6 m deep behind the Armco, opening out smoothly to ~48 m through the named clearings and the start area */
 {const o=new Float32Array(N),nS=Math.round(N*.03);for(let k=0;k<N;k++)o[k]=Math.max(T.openF(T.x[k],T.z[k]),(k<nS||k>N-25)?1:0);
  for(let pass=0;pass<3;pass++){const t=o.slice();for(let k=0;k<N;k++){let a=0;for(let q=-6;q<=6;q++)a+=t[((k+q)%N+N)%N];o[k]=a/13}}
  T.edgeL=new Float32Array(N);T.edgeR=new Float32Array(N);
  for(let k=0;k<N;k++){const e=Math.min(1,o[k]*1.6),w=e*e*(3-2*e)*28;T.edgeL[k]=T.hw[k]+T.railL[k]+6+w;T.edgeR[k]=T.hw[k]+T.railR[k]+6+w}}
 /* animals graze on the clearing banks, between the Armco and the tree line, where they can be seen */
 T.animalAt=r=>{for(let t=0;t<40;t++){const k=Math.floor(r()*N),side=r()<.5?-1:1,E=side>0?T.edgeL:T.edgeR,RO=side>0?T.railL:T.railR,room=E[k]-T.hw[k]-RO[k];if(room<18)continue;
   const l=side*(T.hw[k]+RO[k]+8+r()*(room-12)),c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);return[T.x[k]+c*l,T.z[k]-s*l]}return null};
 T.forest=(x,z,dist)=>{let f=T.forest0(x,z);if(!(dist>24))for(const o of open){const e=Math.hypot(x-o[0],z-o[1])/o[2];if(e<1)f*=sm(.55,1,e)}if(T.castle){const e=Math.hypot(x-T.castle.x,z-T.castle.z);if(e<120)f=0}return f};
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-s*l,ry=T.y[k]-l*T.bank[k],ex=Math.abs(l)-T.hw[k];if(ex>1.2){/* sit on the ground the tiles are built from, never on a raised road level */return[x,terrainBed(T,x,z)+(dy||0)+.03,z]}return[x,ry+(dy||0),z]};
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
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{/* wide strips are split into ~1.6 m bands so they follow the ground instead of bridging over it */const nb=Math.ceil((w1-w0)/1.6-1e-6);if(nb>1){let m;for(let j=0;j<nb;j++)m=strip1(ranges,side,lerp(w0,w1,j/nb),lerp(w0,w1,(j+1)/nb),dy,mt,vs);return m}return strip1(ranges,side,w0,w1,dy,mt,vs)},
  strip1=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,p0=at(k,side*(T.hw[k]+w0),dy),p1=at(k,side*(T.hw[k]+w1),dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 /* kerbs ride on the road plane across their whole width (never on the ground beside it), a hair above the asphalt */
 const kerb=(ranges,side,w0,w1,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const[a,b]of ranges){const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);
    for(const w of[w0,w1]){const l=side*(T.hw[k]+w);pos.push(T.x[k]+c*l,T.y[k]-l*T.bank[k]+.1,T.z[k]-s*l)}uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);m.renderOrder=1;g.add(m);return m};
 /* ---- kerbs on every corner ---- */
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#e01a14':'#f4f4f4';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 {const inR=[],inL=[];for(const c of corners){const a=((c.a-2)%N+N)%N,b=c.b+2;(c.dir>0?inL:inR).push([a,b])}
  kerb(inL,1,-.15,1.3,curbM,2.0);kerb(inR,-1,-.15,1.3,curbM,2.0)}
 /* ---- the Karussell: the famous banked concrete bowl on the inside ---- */
 {const km=RG.marks.KARUSSELL;if(km!=null){const p=RG.pts[km],k0=nearIdx(T,p[0],p[1]);const c=corners.find(c=>k0>=c.a-30&&k0<=c.b+30);if(c){const side=c.dir>0?1:-1;
   const ct=ctex(16,16,(x,w,h)=>{x.fillStyle='#a7a7a0';x.fillRect(0,0,w,h);x.fillStyle='#8c8c86';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillStyle='rgba(0,0,0,.06)';x.fillRect(3,5,4,2);x.fillRect(9,11,3,2)});
   const cm=new THREE.MeshStandardMaterial({map:ct,roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
   const pos=[],uv=[],idx=[],a=c.a-4,n=c.b-c.a+8;for(let q=0;q<=n;q++){const k=((a+q)%N+N)%N;for(let j=0;j<=4;j++){const l=side*lerp(-T.hw[k]*.15,T.hw[k],j/4),x=T.x[k]+Math.cos(T.psi[k])*l,z=T.z[k]-Math.sin(T.psi[k])*l;pos.push(x,T.y[k]-l*T.bank[k]+.065,z);uv.push(j/4*2,q*T.sp/3)}}
   for(let q=0;q<n;q++)for(let j=0;j<4;j++){const i=q*5+j;idx.push(i,i+5,i+1,i+1,i+5,i+6)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,cm));T.karussell=c}}}
 /* ---- gravel traps ---- */
 /* (sand is painted into the terrain tiles in tileSystem, so it can never float) */
 /* ---- Armco on both sides of the whole lap (double rail on posts), every rail a real collider ---- */
 {const railTex=ctex(4,16,(x,w,h)=>{x.fillStyle='#b9c1c4';x.fillRect(0,0,w,h);x.fillStyle='#7c8689';x.fillRect(0,3,w,2);x.fillRect(0,11,w,2);x.fillStyle='#dfe5e7';x.fillRect(0,1,w,1);x.fillRect(0,9,w,1)}),
   rail=new THREE.MeshStandardMaterial({map:railTex,roughness:.45,metalness:.4,side:THREE.DoubleSide}),posts=[];
  /* concrete walls instead of Armco along the start/finish straight, the Döttinger Höhe and past the stands at the classic corners */
  const conc=new Uint8Array(N),zone=(k,back,fwd)=>{for(let q=-Math.round(back/T.sp);q<=Math.round(fwd/T.sp);q++)conc[((k+q)%N+N)%N]=1};
  zone(0,700,520);
  for(const[nm,b,f]of[['DOTTINGER HOHE',500,900],['FLUGPLATZ',120,160],['SCHWEDENKREUZ',120,200],['BRUNNCHEN',140,160],['PFLANZGARTEN',120,180]]){const m=RG.marks[nm];if(m!=null){const p=RG.pts[m];zone(nearIdx(T,p[0],p[1]),b,f)}}
  T.conc=conc;
  {const cT=ctex(8,16,(x,w,h)=>{x.fillStyle='#c9cbc6';x.fillRect(0,0,w,h);x.fillStyle='#b3b5b0';x.fillRect(0,12,w,4);x.fillStyle='#dcded9';x.fillRect(0,0,w,2);x.fillStyle='rgba(0,0,0,.08)';x.fillRect(w-1,0,1,h)}),
    cM=new THREE.MeshStandardMaterial({map:cT,roughness:.95,side:THREE.DoubleSide});
   /* jersey profile, from the road face over the top to the back face (lateral offset, height) */
   const prof=[[0,-.25],[0,.32],[.18,.5],[.3,1.0],[.5,1.0],[.62,.5],[.8,-.25]];
   for(const side of[-1,1]){const RO=side>0?T.railL:T.railR,pos=[],uv=[],idx=[],W=prof.length;let v=0;
    for(let i=0;i<N;i++){if(!conc[i]||!conc[(i+1)%N])continue;
     for(const kk of[i,i+1]){const k=kk%N;for(let m=0;m<W;m++){const l=side*(T.hw[k]+RO[k]-.4+prof[m][0]),p=at(k,l,prof[m][1]);pos.push(...p);uv.push(kk*T.sp/2,m/(W-1))}}
     for(let m=0;m<W-1;m++){const a=v+m,b=v+W+m;idx.push(a,b,a+1,a+1,b,b+1)}v+=2*W}
    if(!pos.length)continue;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();sc.add(new THREE.Mesh(gg,cM))}}
  for(const side of[-1,1]){const RO=side>0?T.railL:T.railR,pos=[],uv=[],idx=[];
   for(let i=0;i<=N;i++){const k=i%N,l=side*(T.hw[k]+RO[k]),p0=at(k,l,.38),p1=at(k,l,1.0);pos.push(...p0,...p1);uv.push(i*T.sp/4,0,i*T.sp/4,1);if(i<N&&i%2===0&&!conc[k])posts.push([p0[0],p0[1]-.1,p0[2],1,1,0,T.psi[k]]);
    if(i<N&&P.addSeg){const q0=at(k,l,0),q1=at(k+1,side*(T.hw[(k+1)%N]+RO[(k+1)%N]),0);P.addSeg(T,q0[0],q0[2],q1[0],q1[2],.3)}}
   for(let i=0;i<N;i++){if(conc[i]&&conc[(i+1)%N])continue;const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();sc.add(new THREE.Mesh(gg,rail))}
  instC(g,new THREE.BoxGeometry(.16,1.1,.16),M_(0x6f797d),posts.map(p=>[p[0],p[1]+.55,p[2],1,1,1,p[6]]))}
 /* ---- catch fencing behind the Armco in the clearings and past the spectator spots: posts and a see-through mesh ---- */
 {const fT=ctex(32,32,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,212,216,.95)';x.lineWidth=1.4;x.beginPath();x.moveTo(0,0);x.lineTo(w,h);x.moveTo(w,0);x.lineTo(0,h);x.stroke();x.fillStyle='rgba(205,212,216,.95)';x.fillRect(0,0,w,2)});
  fT.magFilter=THREE.LinearFilter;fT.minFilter=THREE.LinearMipmapLinearFilter;fT.generateMipmaps=true;
  const fM=new THREE.MeshStandardMaterial({map:fT,transparent:true,alphaTest:.35,side:THREE.DoubleSide,roughness:.6,metalness:.3,depthWrite:false});
  const spots=[];for(const nm of['BRUNNCHEN','PFLANZGARTEN','KARUSSELL','FLUGPLATZ','SCHWEDENKREUZ','ADENAUER FORST','BREIDSCHEID','HOHE ACHT']){const m=RG.marks[nm];if(m!=null){const p=RG.pts[m];spots.push(nearIdx(T,p[0],p[1]))}}
  const want=k=>T.openF(T.x[k],T.z[k])>.3||spots.some(s0=>{let d=Math.abs(k-s0);d=Math.min(d,N-d);return d*T.sp<220});
  const posts=[];for(const side of[-1,1]){const RO=side>0?T.railL:T.railR,pos=[],uv=[],idx=[];let u=0;
   for(let i=0;i<N;i++){const j=(i+1)%N;if(!want(i)||!want(j))continue;
    const a=at(i,side*(T.hw[i]+RO[i]+1.3),0),b=at(j,side*(T.hw[j]+RO[j]+1.3),0),dl=Math.hypot(b[0]-a[0],b[2]-a[2]),v=pos.length/3,u1=u+dl/.7;
    pos.push(a[0],a[1],a[2],b[0],b[1],b[2],b[0],b[1]+3.4,b[2],a[0],a[1]+3.4,a[2]);uv.push(u,0,u1,0,u1,4.9,u,4.9);idx.push(v,v+1,v+2,v,v+2,v+3);u=u1;if(i%2===0)posts.push([a[0],a[1]+1.75,a[2],1])}
   if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,fM);m.renderOrder=1;sc.add(m)}}
  if(posts.length)instC(g,new THREE.CylinderGeometry(.06,.06,3.5,5),M_(0x9aa2a6),posts)}
 /* ---- writing on the asphalt: chalk and paint scrawls from fans, in patches along the lap ---- */
 {const words=['NÜRBURGRING','GRÜNE HÖLLE','VOLLGAS','FLAT OUT','NO LIFT','GO GO GO','EIFEL','NORDSCHLEIFE','POLY GT','24H','HAKAN','LENA','MAX','JONAS','ANNA','TIM','FULL SEND','DANKE','KEEP LEFT','♥'];
  const gT=ctex(512,512,(x,w,h)=>{x.clearRect(0,0,w,h);const q=rngf(9);for(let r=0;r<4;r++)for(let n=0;n<3;n++){const t=words[Math.floor(q()*words.length)],cx=40+q()*(w-80),cy=r*128+40+n*34+q()*10;x.save();x.translate(cx,cy);x.rotate((q()-.5)*.5);x.globalAlpha=.62+q()*.3;x.fillStyle=q()<.75?'#f4f4ee':'#e8d36a';x.font='bold '+Math.round(30+q()*16)+'px sans-serif';x.textAlign='center';x.fillText(t,0,0);if(q()<.3){x.strokeStyle=x.fillStyle;x.lineWidth=2;x.strokeRect(-60,-30,120,40)}x.restore()}});
  gT.magFilter=THREE.LinearFilter;gT.minFilter=THREE.LinearMipmapLinearFilter;gT.generateMipmaps=true;gT.wrapS=gT.wrapT=THREE.ClampToEdgeWrapping;
  const gM=new THREE.MeshBasicMaterial({map:gT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});styleMaterial(gM);
  const pos=[],uv=[],idx=[],q=rngf(31),L=5;T.graff=[];for(let p=0;p<46;p++){const k0=Math.floor(q()*N),row=Math.floor(q()*4);if(k0<40||k0>N-40)continue;T.graff.push(k0);
   for(let r=0;r<L;r++){const k=(k0+r)%N,v=pos.length/3;for(const[l,u_]of[[-T.hw[k]*.92,1],[T.hw[k]*.92,0]]){const c=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]);pos.push(T.x[k]+c*l,T.y[k]-l*T.bank[k]+.06,T.z[k]-sn*l);uv.push(u_,(row+1-r/(L-1))/4)}/* turned to read upright for a car coming towards it */
    if(r<L-1)idx.push(v,v+2,v+1,v+1,v+2,v+3)}}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);sc.add(new THREE.Mesh(gg,gM))}
 /* ---- tyre walls behind the gravel at the sharpest corners ---- */
 {const sharp=T.traps.slice().sort((a,b)=>b.pk-a.pk).slice(0,7),B=[],TP=1.1;
  /* tyres touch each other: walk the wall line in tyre-sized steps between track samples, two rows staggered, three high */
  for(const c of sharp){const side=c.dir>0?-1:1;for(let row=0;row<2;row++){let carry=row*TP/2;
    for(let q=c.a-2;q<c.b+6;q++){const k=((q%N)+N)%N,k2=(k+1)%N,l1=side*(T.hw[k]+14.4-row*1.05),l2=side*(T.hw[k2]+14.4-row*1.05),a=at(k,l1,0),b=at(k2,l2,0),seg=Math.hypot(b[0]-a[0],b[2]-a[2]);
     for(let t=carry;t<seg;t+=TP){const f=t/seg,x=lerp(a[0],b[0],f),z=lerp(a[2],b[2],f),y=lerp(a[1],b[1],f);for(let h=0;h<3;h++)B.push([x,y+.28+h*.52,z,1,1,1,0])}
     carry=((carry-seg)%TP+TP)%TP;
     if(row===0&&P.addSeg){const p1=at(k,side*(T.hw[k]+13.9),0),p2=at(k2,side*(T.hw[k2]+13.9),0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.9)}}}}
  const cg=new THREE.CylinderGeometry(.56,.56,.5,10);if(B.length)instC(g,cg,M_(0x1b1d21),B)}
 /* ---- forest: a clean, continuous tree line on both sides at a set distance behind the Armco (T.edgeL / T.edgeR), rows of
   3D trees standing in front of one painted canopy card set well back, so the card only adds depth between and above the crowns ---- */
 {const spr=[],dec=[],bush=[],FR=5.5,ROWS=3;
  for(const side of[-1,1]){const E=side>0?T.edgeL:T.edgeR;
   for(let k=0;k<N;k++){const k2=(k+1)%N,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),fx=T.x[k2]-T.x[k],fz=T.z[k2]-T.z[k],seg=Math.hypot(fx,fz)||1;
    for(let a=0;a<seg;a+=FR)for(let r=0;r<ROWS;r++){if(rr()>(r<3?.94:.8))continue;
     const u=(a+(r%2)*FR*.5+(rr()-.5)*1.4)/seg,l=side*(E[k]+1.6+r*3.9+(rr()-.5)*1.3),x=T.x[k]+fx*u+c*l,z=T.z[k]+fz*u-s*l;
     if(dRoad(x,z,1)<9||T.forest(x,z,99)<.5)continue;
     const y=T.terr(x,z),patch=T.nz(x*.022+5,z*.022-9)*.5+.5,dc=patch>.6?rr()<.8:rr()<.1,sc_=(dc?.95:1)*(.98+.22*(T.nz(x*.4,z*.4)*.5+.5))*(1+r*.04);
     (dc?dec:spr).push([x,y,z,sc_,0,0,rr()*6])}
    /* low bushes along the foot of the tree line hide the trunks and make the edge read as one clean wall of green */
    for(let a=0;a<seg;a+=2.6){if(rr()<.35)continue;const u=a/seg,l=side*(E[k]-.2+rr()*1.2),x=T.x[k]+fx*u+c*l,z=T.z[k]+fz*u-s*l;if(dRoad(x,z,1)<7)continue;
     bush.push([x,T.terr(x,z)+.35,z,.9+rr()*.6,.6+rr()*.35,.9+rr()*.6,rr()*6])}}}
  /* Quaternius CC0 spruces / broadleaves / bushes (trees_q.js), split across models so the line never repeats one shape */
  if(P.qTrees){const by=(L,n)=>[...Array(n)].map((_,j)=>L.filter((p,i)=>i%n===j)),ti=[0xffffff,0xe6f0dc,0xd6e2cc,0xf2fae6];
   const S=by(spr,3);['pine1','pine2','pine3'].forEach((n,j)=>P.qTrees(g,n,S[j].map(p=>[p[0],p[1],p[2],p[3],p[6]]),[15,13.5,14.5][j],ti));
   const Dd=by(dec,3);['oak3','oak5','birch4'].forEach((n,j)=>P.qTrees(g,n,Dd[j].map(p=>[p[0],p[1],p[2],p[3],p[6]]),[12,10.5,12][j],[0xffffff,0xeaf4dc,0xfff6e0]));
   const B=by(bush,2);['bush1','bush2'].forEach((n,j)=>P.qTrees(g,n,B[j].map(p=>[p[0],p[1]-.35,p[2],p[3]*.8,p[6]]),1.5,[0xffffff,0xe4eedc]))}
  T._trees=spr.length+dec.length}
 /* ---- canopy card: one painted strip (PNG) behind the tree rows. Its height eases in and out over ~8 links wherever it has to
   stop (another part of the track, the castle), so it never ends in a hard cut ---- */
 if(window.PT8_RING_FOREST){const tx=new THREE.TextureLoader().load(window.PT8_RING_FOREST);tx.wrapS=THREE.RepeatWrapping;tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;
  const fm=new THREE.MeshBasicMaterial({map:tx,color:0x5f7666,alphaTest:.5,side:THREE.DoubleSide});styleMaterial(fm);const BACK=40,Hh=12,rep=80;/* set well back, low and in shadow: depth between the crowns, not a wall */
  for(const side of[-1,1]){const E=side>0?T.edgeL:T.edgeR,pos=[],uv=[],idx=[],pt=[];
   for(let k=0;k<N;k+=2){const l=side*(E[k]+BACK),c=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-sn*l;
    pt.push({k,x,z,y:terrainBed(T,x,z)-1.2,ok:dRoad(x,z,5)>E[k]+BACK-T.hw[k]-8&&T.forest(x,z,99)>.5})}
   const M=pt.length,link=new Uint8Array(M);
   for(let q=0;q<M;q++){const a=pt[q],b=pt[(q+1)%M];if(!a.ok||!b.ok)continue;const dx=b.x-a.x,dz=b.z-a.z,dl=Math.hypot(dx,dz),tx_=Math.sin(T.psi[b.k]),tz_=Math.cos(T.psi[b.k]);if(dl>.5&&dl<T.sp*5&&(dx*tx_+dz*tz_)/dl>.35)link[q]=1}
   const runL=new Float32Array(M),runR=new Float32Array(M);for(let q=0;q<2*M;q++){const a=q%M,p=(a-1+M)%M;runL[a]=link[p]?Math.min(99,runL[p]+1):0}for(let q=2*M-1;q>=0;q--){const a=q%M,n=(a+1)%M;runR[a]=link[a]?Math.min(99,runR[n]+1):0}
   const hAt=a=>{const e=Math.min(runL[a],runR[a])/8;return Hh*(e>=1?1:e*e*(3-2*e))};let u=0;
   for(let q=0;q<M;q++){if(!link[q])continue;const a=pt[q],b=pt[(q+1)%M],dl=Math.hypot(b.x-a.x,b.z-a.z),v=pos.length/3,u1=u+dl/rep,ha=hAt(q),hb=hAt((q+1)%M);
    pos.push(a.x,a.y,a.z,b.x,b.y,b.z,b.x,b.y+hb,b.z,a.x,a.y+ha,a.z);uv.push(u,0,u1,0,u1,hb/Hh,u,ha/Hh);idx.push(v,v+1,v+2,v,v+2,v+3);u=u1}
   if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);sc.add(new THREE.Mesh(gg,fm))}}}
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
  const seats=ctex(16,8,(x,w,h)=>{x.fillStyle='#8d949c';x.fillRect(0,0,w,h);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b'];for(let i=0;i<w;i+=2){x.fillStyle=pal[(i>>1)%4];x.fillRect(i,1,2,2);x.fillRect(i,5,2,2)}}),seatM=new THREE.MeshStandardMaterial({map:seats,roughness:.9});
  const stand=(k,l,len,rows)=>{const sg=l>0?1:-1,[px,py,pz]=at(k,l,0),grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);const top=Math.max(py-gy,0);
   for(let r=0;r<rows;r++){const h=top+1.2+r*.95,b=new THREE.Mesh(new THREE.BoxGeometry(2.4,h+3,len),seatM);b.position.set(sg*r*2.4,(h-3)/2,0);grp.add(b)}
   const roof=new THREE.Mesh(new THREE.BoxGeometry(rows*2.4+1.5,.4,len+1.5),MB(0xe9e9e9));roof.position.set(sg*(rows*1.2-1.2),top+rows*.95+6.2,0);grp.add(roof);
   for(const sz of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(.35,rows*.95+6.5,.35),M_(0x9aa2a8));pl.position.set(sg*(rows*2.4-1.2),top+(rows*.95+6.5)/2-2,sz*len/2);grp.add(pl)}
   if(P.addPt)for(let q=-2;q<=2;q++){const a=Math.cos(T.psi[k]),b=Math.sin(T.psi[k]);P.addPt(T,px+b*q*len/5,pz+a*q*len/5,2.2)}
   return grp};
  /* (no grandstands: they looked out of place) */
  /* gantry */
  {const kg=4,[gx,gy,gz]=at(kg,0,0),gp=new THREE.Group();gp.position.set(gx,gy,gz);gp.rotation.y=T.psi[kg]+PI;g.add(gp);const wd=T.hw[kg]+4;
   for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1,11,1),MA);col.position.set(sx*wd,5.5,0);gp.add(col)}
   const beam=new THREE.Mesh(new THREE.BoxGeometry(wd*2+1,1.2,1.2),M_(0xf1f1f1));beam.position.set(0,10.8,0);gp.add(beam);
   const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.9,3.2),new THREE.MeshBasicMaterial({map:ctex(512,96,(c,W,H)=>{c.fillStyle='#10151b';c.fillRect(0,0,W,H);c.fillStyle='#d8392f';c.fillRect(0,H-12,W,12);c.fillStyle='#f1f1f1';c.font='bold 58px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('NORDSCHLEIFE',W/2,H/2-4)})}));ban.position.set(0,8.6,.65);gp.add(ban);const b2=ban.clone();b2.position.z=-.65;b2.rotation.y=PI;gp.add(b2)}
  /* low buildings behind the stands */
  for(let q=0;q<5;q++){const k=(20+q*16)%N,[px,py,pz]=at(k,infield*(T.hw[k]+T.railL[k]+16),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[k];g.add(b);
   const cb=P.kitCabin(12,9,q%2?0xd7d9d4:0xe3e5e2,q%2?0x2c6cd0:0xd8392f);cb.rotation.y=-infield*PI/2;b.add(cb);if(P.addPt)P.addPt(T,px,pz,6.5)}
  const fl=[],pl=[];for(let k=6;k<Math.round(N*.03);k+=9)for(const sd of[-1,1]){const RO=sd>0?T.railL:T.railR,p=at(k,sd*(T.hw[k]+RO[k]+1.2),0);pl.push([p[0],p[1]+4,p[2],1,8,1]);fl.push([p[0],p[1]+7,p[2],1,1,1,T.psi[k]])}
  instC(g,new THREE.CylinderGeometry(.07,.09,1,5),M_(0xcfd3d6),pl);instC(g,new THREE.BoxGeometry(2.2,1.3,.05),MB(0xffffff),fl,[0xd8392f,0xf2c76b,0x2c6cd0,0x10151b])}
 /* ---- spectator banks: campers, tents and crowds at the classic spots ---- */
 {const peeps=[],tents=[],vans=[];
  for(const nm of['BRUNNCHEN','PFLANZGARTEN','KARUSSELL','ADENAUER FORST','SCHWEDENKREUZ','EX-MUHLE','HOHE ACHT','WEHRSEIFEN']){const k0=MK[nm];if(k0==null)continue;
   for(let q=-30;q<=30;q+=2){const k=((k0+q)%N+N)%N,side=curv[k]>0?-1:1,RO=side>0?T.railL:T.railR;
    for(let n=0;n<3;n++){if(rr()<.35)continue;const l=side*(T.hw[k]+RO[k]+1.4+rr()*7),p=at(k,l,0);peeps.push([p[0],p[1]+.55,p[2],1,1,1,rr()*6])}
    if(q%10===0&&Math.abs(q)<=12){const l=side*(T.hw[k]+RO[k]+12+rr()*6),p=at(k,l,0);(rr()<.5?tents:vans).push([p[0],p[1],p[2],1,1,1,T.psi[k]+(rr()-.5)*.6])}}}
  if(peeps.length){instC(g,new THREE.CylinderGeometry(.22,.26,1.0,5),M_(0xffffff),peeps,[0xd8392f,0x2f6fd0,0xf2c230,0x2fa05a,0x111111,0xe8e8e8,0xff7a2a]);instC(g,new THREE.SphereGeometry(.2,5,4),M_(0xe3b58d),peeps.map(p=>[p[0],p[1]+.7,p[2],1]))}
  if(tents.length){/* gazebos: pyramid roofs on four poles, a few colours */
   const cols=[0xf1f1f1,0xd8392f,0x2c6cd0,0xf2c76b];cols.forEach((c,ci)=>P.kitInstances(g,P.kitTent(c),tents.filter((p,i)=>i%cols.length===ci).map(p=>[p[0],p[1],p[2],p[6]])))}
  if(vans.length){/* camper vans: one shaped body with windscreen, window band and wheels */
   const cols=[0xf1f1f1,0xe8e2d0,0xd9dee2];cols.forEach((c,ci)=>P.kitInstances(g,P.kitVan(c),vans.filter((p,i)=>i%cols.length===ci).map(p=>[p[0],p[1],p[2],p[6]])))
   for(const p of vans)if(P.addPt)P.addPt(T,p[0],p[2],2.4)}}
 /* ---- Nurburg castle ---- */
 if(T.castle){const{x,z}=T.castle,y=T.terr(x,z),cg=new THREE.Group();cg.position.set(x,y,z);g.add(cg);const st=M_(0x9a9182),rf=M_(0x5a4a40);
  const keep=new THREE.Mesh(new THREE.CylinderGeometry(6,7,26,10),st);keep.position.y=12;cg.add(keep);const kc=new THREE.Mesh(new THREE.CylinderGeometry(7,6.6,2,10),st);kc.position.y=25.5;cg.add(kc);
  for(let q=0;q<10;q++){const a=q/10*PI*2,w=new THREE.Mesh(new THREE.BoxGeometry(14,7,2.2),st);w.position.set(Math.cos(a)*22,2.5,Math.sin(a)*22);w.rotation.y=-a+PI/2;cg.add(w)}
  for(const a of[.3,2.4,4.4]){const tw=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,11,8),st);tw.position.set(Math.cos(a)*23,4.5,Math.sin(a)*23);cg.add(tw);const cn=new THREE.Mesh(new THREE.CylinderGeometry(3.7,3.7,1.2,8),st);cn.position.set(Math.cos(a)*23,10.6,Math.sin(a)*23);cg.add(cn)}}
 styleScene(g);sc.add(g);
 const pn=panoRing(T);sc.add(pn);
 styleScene(sc);
 /* streamed terrain: build everything around the start now, the rest follows the camera */
 const tiles=tileSystem(T,sc);sc.userData.ringTiles=tiles;sc.userData.ringPano=pn;
 tiles.update(T.x[0],T.z[0],1e9);
 return sc}

const bwR=buildWorld;/* the Eifel forest should look lush: richer colour grade on this track only (every time of day) */
if(P.applyTod){const at0=P.applyTod;P.applyTod=(sc,T,key)=>{const r=at0(sc,T,key);if(T&&T.d&&(T.d.ring||T.d.ra||T.d.imola)&&window.TODU)window.TODU.sat.value*=1.45;return r}}
buildWorld=T=>T.d&&T.d.ring?buildRing(T):bwR(T);
/* running along the very edge (gutter, kerb) for a long way must not count as a shortcut: on this track the
   last-safe point also follows the car while it stays right beside the road */
{const st0=stepCar;stepCar=(c,dt)=>{const T=RACE&&RACE.T;if(T&&T.d&&T.d.ring&&!(c.exp>0)&&c.safeIdx!=null&&c.idx!=null){const N=T.N,k=((c.idx%N)+N)%N;
  if(Math.hypot(c.x-T.x[k],c.z-T.z[k])<T.hw[k]+4){let d=k-c.safeIdx;d=((d+N/2)%N+N)%N-N/2;if(d>0&&d<=40){c.safeIdx=k;c.safeUnw+=d}}}
 return st0(c,dt)}}

/* every render of a ring scene: the panorama rides with the camera at eye height, and terrain tiles are streamed in around it (a few ms per frame) */
{const r0=R.render.bind(R),cp=new THREE.Vector3();
 R.render=function(scene,cam){if(scene&&scene.userData&&scene.userData.ringTiles&&cam&&cam.isCamera){cam.getWorldPosition(cp);const pn=scene.userData.ringPano;if(pn){pn.position.set(cp.x,cp.y+84,cp.z);pn.updateMatrixWorld()}
   try{scene.userData.ringTiles.update(cp.x,cp.z,(typeof scr!=='undefined'&&scr==='game')?2.5:6)}catch(e){console.warn('ring tiles',e)}}
  return r0(scene,cam)}}
})();
