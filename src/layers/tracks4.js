/* ===== Poly GT layer: tracks4 (circuit-mode track: Imola, the real circuit's layout shrunk and dressed as a proper race track) ===== */
(function v9tracks4(){
'use strict';
const P=window.PT8,IM=window.PT8_IMOLA;
if(!IM||!P.TRK_TRACKS)return;
const PI=Math.PI,IMK=1,IMY=1,lin=h=>new THREE.Color(h).convertSRGBToLinear();/* data is already at real size (4,909 m lap, 1 unit = 1 m) */
const imola={id:15,look:0,name:'Imola',desc:'italian grand prix circuit / chicanes / sand traps / tyre walls',hw:7.4,bank:5,off:'grass',idw:.85,offs:0,amp:2.6,up:4,shoulder:17,
 sky:[0x3f86d2,0xcfe4f4],fog:0xcfe0ea,sun:0xfff0d0,hemi:[0xd4e8f8,0x4f7a3c],road:'#3b3d43',tod0:'day',imola:1,
 pts:IM.pts.map(q=>[q[0]*IMK,q[1]*IMK,q[2]*IMY,q[3]]),walls:[],ice:[],boost:[],jumps:[]};
D.push(imola);
P.TRACK_INFO.push({s:'TARMAC',tags:['CHICANES','SAND TRAPS','TYRE WALLS','KERBS']});
P.TRK_TRACKS.push(D.length-1);
P.MEDAL_REF[D.length-1]=110.8;
MATS.sandtrap={grip:.42,top:.5,acc:.4};
const IMX=D.length-1;
/* the real circuit's trackside layout (imola_ref.js): per-sample offsets past the road edge for each side, or -1 */
const IR=window.PT8_IMREF,irB=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const i16=s=>{const u=irB(s);return new Int16Array(u.buffer,0,u.length>>1)};
/* ground layers (gravel, green paint, asphalt run-off): rows 1 m apart, each a list of [x0,x1] runs */
const GRUN=(()=>{const o={};if(!IR||!IR.gr)return o;for(const k in IR.gr){const a=i16(IR.gr[k]),m=new Map();for(let i=0;i<a.length;i+=3){const r=a[i];(m.get(r)||m.set(r,[]).get(r)).push([a[i+1]/4,a[i+2]/4])}o[k]=m}return o})();
const inLay=(nm,x,z)=>{const m=GRUN[nm];if(!m)return false;const A=m.get(Math.round(z+200-.25));if(!A)return false;for(const[a,b]of A)if(x>=a&&x<=b)return true;return false};

/* ---------- track data: corners, sand traps, trap-aware surface ---------- */
const wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
function cornersOf(T){const N=T.N,curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wrp(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 const corners=[];let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0105;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>6){let pk=0,pi=s;for(let q=s;q<i;q++)if(Math.abs(curv[q])>pk){pk=Math.abs(curv[q]);pi=q}corners.push({a:s,b:i,dir:Math.sign(curv[pi]),pk,pi})}s=-1}}
 let tot=0;for(let i=0;i<N;i++)tot+=curv[i];return{curv,corners,left:tot>=0?1:-1}}
const ssI=sampleTrack;sampleTrack=d=>{const T=ssI(d);if(!d.imola)return T;
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 const C=cornersOf(T);T._im=C;const N=T.N;T.trapS=new Int8Array(N);
 const kc=[];for(const c of C.corners){const p=kc[kc.length-1];if(p&&p.dir===c.dir&&c.a-p.b<16)p.b=c.b;else kc.push({a:c.a,b:c.b,dir:c.dir})}
 const real=!!GRUN.sand;T._irOk=real;
 if(!real)for(const c of kc){const side=c.dir>0?-1:1;for(let q=c.a-3;q<=c.b+6;q++)T.trapS[((q%N)+N)%N]=side}
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y);if(r.road)return r;const cx=Math.floor(x/16),cz=Math.floor(z/16);let bd=1e9,bi=-1,bl=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((x-T.x[i])*dx+(z-T.z[i])*dz)/l2)),px=T.x[i]+dx*f,pz=T.z[i]+dz*f,dd=Math.hypot(x-px,z-pz);if(dd<bd){bd=dd;bi=i;bl=(x-px)*Math.cos(T.psi[i])-(z-pz)*Math.sin(T.psi[i])}}}
  if(real){if(inLay('sand',x,z))r.trap=1;else if(inLay('asph',x,z)||inLay('green',x,z))r.near=1/* paved run-off grips like the road */}
  else if(bi>=0&&T.trapS[bi]&&Math.sign(bl)===T.trapS[bi]){const ex=Math.abs(bl)-T.hw[bi];if(ex>2.3&&ex<13.6)r.trap=1}
  return r};
 return T};

/* ---------- dressing ---------- */
function dressIM(T,sc){
 const N=T.N,C=T._im||cornersOf(T),curv=C.curv,corners=C.corners,infield=C.left;/* +1: infield is the car's left */
 const rr=(()=>{let s=7654321;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();
 const lerp=(a,b,t)=>a+(b-a)*t;
 const DG=P.drawnGround?P.drawnGround(sc):null;
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-s*l,ry=T.y[k]-l*T.bank[k],ex=Math.abs(l)-T.hw[k];if(ex>1.2){/* sit on the ground the terrain mesh is built from, never on a raised road level */let y=terrainBed(T,x,z);if(DG){const h=DG(x,z);if(h!=null&&h>y)y=h}return[x,y+(dy||0)+.03,z]}return[x,ry+(dy||0),z]};
 const g=new THREE.Group();g.name='imolaDress';
 {const rm=[];sc.traverse(o=>{const q=o.geometry&&o.geometry.parameters;if(q&&o.geometry.type==='ConeGeometry'&&q.radius>=80)rm.push(o)});rm.forEach(o=>o.parent.remove(o))}
 const dRoad=(x,z)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16);let b=1e9;for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const d=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(d<b)b=d}}return b>=1e9?999:Math.max(0,b)};
 /* terrain: bright arcade green, mown stripes near the road */
 let ter=null,most=0;sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.color&&o.geometry.attributes.position.count>most){most=o.geometry.attributes.position.count;ter=o}});
 if(ter){const pa=ter.geometry.attributes.position,ca=ter.geometry.attributes.color;
  for(let v=0;v<pa.count;v++){const x=pa.getX(v),z=pa.getZ(v),n=T.nz(x*2.1,z*2.1)*.5+.5,n2=T.nz(x*.55+90,z*.55-40)*.5+.5,d=dRoad(x,z);
   /* Romagna parkland green (linear values): deep under the trees, a little leaf litter, mown stripes by the road */
   let c=[.05+.03*n,.16+.07*n,.025+.015*n];if(d>32){const t=Math.min(1,(d-32)/14);c=[lerp(c[0],.05+.03*n,t),lerp(c[1],.1+.03*n,t),lerp(c[2],.025,t)]}
   if(d<30){const st=((Math.floor(x/9)+Math.floor(z/9))&1)?.018:-.01;const t=1-Math.min(1,Math.max(0,(d-10)/20));c=[lerp(c[0],.075+st,t*.85),lerp(c[1],.23+st*2,t*.85),lerp(c[2],.035,t*.85)]}
   if(d<10){const st=((Math.floor(x/7)+Math.floor(z/7))&1)?.016:-.008;c=[.075+st,.235+st*2,.035]}
   ca.setXYZ(v,c[0],c[1],c[2])}
  ca.needsUpdate=true}
 const M_=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{}));
 const MB=c=>new THREE.MeshBasicMaterial({color:c});
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{/* wide strips are split into ~1.6 m bands so they follow the ground instead of bridging over it */const nb=Math.ceil((w1-w0)/1.6-1e-6);if(nb>1){let m;for(let j=0;j<nb;j++)m=strip1(ranges,side,lerp(w0,w1,j/nb),lerp(w0,w1,(j+1)/nb),dy,mt,vs);return m}return strip1(ranges,side,w0,w1,dy,mt,vs)},
  strip1=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,p0=at(k,side*(T.hw[k]+w0),dy),p1=at(k,side*(T.hw[k]+w1),dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 const IRk=IR&&IR.kerb&&IR.N===N?IR.kerb.map(irB):null;
 /* ======== everything beside the road is the real circuit as surveyed (imola_ref.js), redrawn in low poly: kerbs, gravel, green paint
    and asphalt run-offs follow the survey's own outlines; walls, Armco, catch fences and tyre walls follow its own lines; every building,
    grandstand, tent, vehicle and prop is a stack of flat-shaded blocks with the real footprint and height; trees stand where the real ones do ======== */
 const PS=-1;/* the pits are on the right of the start straight (side -1) */
 /* kerbs where the survey has them, as wide as it has them */
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#e01a14':'#f4f4f4';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
 curbTex.wrapS=curbTex.wrapT=THREE.RepeatWrapping;curbTex.magFilter=THREE.NearestFilter;
 if(IRk){for(const side of[-1,1]){const K=IRk[side<0?0:1],pos=[],uv=[],idx=[];let prev=false,q=0;
   for(let i=0;i<=N;i++){const k=i%N,a=K[k],b=K[N+k];if(a===255){prev=false;continue}const w0=(a-20)/10,w1=Math.max(w0+.4,(b-20)/10),c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),v=pos.length/3;
    for(const w of[w0,w1]){const l=side*(T.hw[k]+w);pos.push(T.x[k]+c*l,T.y[k]-l*T.bank[k]+.1,T.z[k]-s*l)}uv.push(0,i*T.sp/2,1,i*T.sp/2);if(prev)idx.push(v-2,v-1,v,v-1,v+1,v);prev=true}
   if(idx.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,curbM);m.renderOrder=1;g.add(m)}}}
 /* nearest sample, signed lateral offset, distance past the road edge */
 const near=(x,z)=>{let k=0,bd=1e18;for(let i=0;i<N;i+=3){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<bd){bd=d;k=i}}for(let i=k-3;i<=k+3;i++){const j=(i+N)%N,d=(T.x[j]-x)**2+(T.z[j]-z)**2;if(d<bd){bd=d;k=j}}
  const l=(x-T.x[k])*Math.cos(T.psi[k])-(z-T.z[k])*Math.sin(T.psi[k]);return[k,l,Math.sqrt(bd)-T.hw[k]]};
 /* ground height for anything laid on the ground: the road plane at the road's edge, the terrain bed further out */
 const gy=(x,z)=>{const d=dRoad(x,z);if(d<1.2){const[k,l]=near(x,z);return T.y[k]-l*T.bank[k]}let y=terrainBed(T,x,z);if(DG){const h=DG(x,z);if(h!=null&&h>y)y=h}return y};
 /* GRAVEL, GREEN PAINT, ASPHALT RUN-OFF: the survey's outlines as rows 1 m apart; consecutive rows are joined edge to edge so the outline
    runs smooth, and each piece is cut every 4 m so it lies on the ground */
 const sandTex=ctex(32,32,(x,w,h)=>{x.fillStyle='#e6d29b';x.fillRect(0,0,w,h);x.fillStyle='#d4bd80';for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1);x.fillStyle='#f1e3b4';for(let j=2;j<h;j+=8)x.fillRect(0,j,w,1)});
 sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;
 const LAY={sand:[new THREE.MeshStandardMaterial({map:sandTex,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),.22],
  green:[new THREE.MeshStandardMaterial({color:lin(0x2f8a52),roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}),.16],
  asph:[new THREE.MeshStandardMaterial({color:lin(0x45484e),roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),.12]};
 for(const nm in LAY){const R=GRUN[nm];if(!R)continue;const[mt,dy]=LAY[nm],pos=[],uv=[],idx=[];
  const quad=(z0,a0,a1,z1,b0,b1)=>{const n=Math.max(1,Math.ceil(Math.max(a1-a0,b1-b0)/4)),v=pos.length/3;
   for(let i=0;i<=n;i++){const t=i/n,xa=a0+(a1-a0)*t,xb=b0+(b1-b0)*t;pos.push(xa,gy(xa,z0)+dy,z0,xb,gy(xb,z1)+dy,z1);uv.push(xa/4,z0/4,xb/4,z1/4)}
   for(let i=0;i<n;i++){const a=v+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}};
  const rows=[...R.keys()].sort((a,b)=>a-b);
  for(const r of rows){const A=R.get(r),B=R.get(r+1)||[],z0=-200+r+.25,z1=z0+1;
   for(const[a0,a1]of A){let joined=false;for(const[b0,b1]of B)if(a0<b1&&b0<a1){quad(z0,a0,a1,z1,b0,b1);joined=true}
    if(!joined)quad(z0,a0,a1,z0+.5,a0+(a1-a0)*.25,a1-(a1-a0)*.25)}
   /* a row with no row below it still gets a short lip so the outline closes */
   if(!R.has(r-1))for(const[a0,a1]of A)quad(z0-.5,a0+(a1-a0)*.25,a1-(a1-a0)*.25,z0,a0,a1)}
  if(!idx.length)continue;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,mt))}
 /* BARRIERS along the survey's own lines */
 const LN={};if(IR&&IR.ln)for(const c in IR.ln){const meta=i16(IR.ln[c][0]),pts=i16(IR.ln[c][1]),out=[];let o=0;for(let i=0;i<meta.length;i+=3){const n=meta[i],p=[];for(let j=0;j<n;j++){p.push([pts[(o+j)*2]/4,pts[(o+j)*2+1]/4])}o+=n;out.push({p,h:meta[i+1]/10,b:meta[i+2]/10})}LN[c]=out}
 /* a barrier never crosses the road: break a line wherever it touches the asphalt */
 for(const c in LN){const out=[];for(const L of LN[c]){let cur=[];const push=()=>{if(cur.length>1)out.push({p:cur,h:L.h,b:L.b});cur=[]};
   for(let i=0;i<L.p.length;i++){const[x,z]=L.p[i];let hit=dRoad(x,z)<.35;if(!hit&&i){const[xa,za]=L.p[i-1],n=Math.ceil(Math.hypot(x-xa,z-za));for(let t=1;t<n&&!hit;t++)hit=dRoad(xa+(x-xa)*t/n,za+(z-za)*t/n)<.35}
    if(hit){push();if(dRoad(x,z)>=.35)cur.push(L.p[i])}else cur.push(L.p[i])}push()}LN[c]=out}
 const nearTrack=(x,z)=>dRoad(x,z)<45;
 /* walls: green with a white top beside the track, plain concrete further away; every link by the track is a collider */
 {const pos=[],col=[],idx=[],gC=lin(0x0c5a22),wC=lin(0xe9ebe6),cC=lin(0xb9bcb8);
  for(const L of LN.wall||[]){const H=Math.max(.8,Math.min(4,L.h)),th=.4,p=L.p;if(p.length<2)continue;
   for(let i=0;i<p.length-1;i++){const[x0,z0]=p[i],[x1,z1]=p[i+1],dx=x1-x0,dz=z1-z0,ln=Math.hypot(dx,dz);if(ln<.05)continue;const nx=-dz/ln*th/2,nz=dx/ln*th/2,y0=gy(x0,z0)-.2,y1=gy(x1,z1)-.2,tr=nearTrack((x0+x1)/2,(z0+z1)/2),c0=tr&&H<1.8?gC:cC,v=pos.length/3;
    /* a box per link: two long faces and the cap */
    const P=[[x0-nx,y0,z0-nz],[x1-nx,y1,z1-nz],[x1-nx,y1+H,z1-nz],[x0-nx,y0+H,z0-nz],[x0+nx,y0,z0+nz],[x1+nx,y1,z1+nz],[x1+nx,y1+H,z1+nz],[x0+nx,y0+H,z0+nz]];
    for(const f of[[0,1,2,3],[5,4,7,6],[3,2,6,7],[4,0,3,7],[1,5,6,2]]){const b=pos.length/3,cc=f[0]===3?(tr&&H<1.8?wC:cC):c0;for(const q of f){pos.push(...P[q]);col.push(cc.r,cc.g,cc.b)}idx.push(b,b+1,b+2,b,b+2,b+3)}
    if(tr&&P.addSeg)P.addSeg(T,x0,z0,x1,z1,.3)}}
  if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true,side:THREE.DoubleSide})))}}
 /* Armco: a galvanised band on posts */
 {const pos=[],idx=[],posts=[],rail=new THREE.MeshStandardMaterial({color:lin(0xb9c1c4),roughness:.45,metalness:.4,side:THREE.DoubleSide,flatShading:true});
  for(const L of LN.rail||[]){const p=L.p;let run=0;for(let i=0;i<p.length;i++){const[x,z]=p[i],y=gy(x,z),v=pos.length/3;pos.push(x,y+.4,z,x,y+.95,z);if(i){idx.push(v-2,v,v-1,v-1,v,v+1);const[xa,za]=p[i-1];run+=Math.hypot(x-xa,z-za);if(nearTrack(x,z)&&P.addSeg)P.addSeg(T,xa,za,x,z,.3)}
    if(i%1===0)posts.push([x,y+.45,z,1,1,0])}}
  if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,rail));inst(g,new THREE.BoxGeometry(.12,.9,.12),M_(0x7d868d),posts)}}
 /* catch fences: see-through mesh panels with posts, from the survey's base to its top (on top of a wall where it stands on one) */
 {const tex=ctex(16,16,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,210,214,1)';x.lineWidth=1;for(let i=-16;i<32;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i+16,16);x.stroke();x.beginPath();x.moveTo(i+16,0);x.lineTo(i,16);x.stroke()}});tex.magFilter=THREE.LinearFilter;
  const pos=[],uv=[],idx=[],posts=[];
  for(const L of LN.fence||[]){const b=Math.max(0,Math.min(2,L.b)),H=Math.max(2,Math.min(5,L.h-b)),p=L.p;let u=0;
   for(let i=0;i<p.length;i++){const[x,z]=p[i],y=gy(x,z)+b,v=pos.length/3;if(i)u+=Math.hypot(x-p[i-1][0],z-p[i-1][1])/1.6;pos.push(x,y,z,x,y+H,z);uv.push(u,0,u,H/1.6);if(i)idx.push(v-2,v,v-1,v,v+1,v-1);posts.push([x,y+H/2-.5,z,1,1,0])}}
  if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);
   g.add(new THREE.Mesh(gg,new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.55,alphaTest:.2,side:THREE.DoubleSide,depthWrite:false,color:0x9aa3aa})));
   inst(g,new THREE.CylinderGeometry(.06,.06,4,5),new THREE.MeshStandardMaterial({color:0x7d868d,metalness:.4,roughness:.5}),posts)}}
 /* tyre walls: stacks of tyres every 1.1 m along the line, black with a red block now and then; colliders by the track */
 {const B=[],R=[];for(const L of LN.tyre||[]){const p=L.p,rows=Math.max(1,Math.min(4,Math.round(L.h/.5)));let cnt=0;
   for(let i=0;i<p.length-1;i++){const[x0,z0]=p[i],[x1,z1]=p[i+1],ln=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(ln/1.1));
    for(let t=0;t<n;t++){const f=t/n,x=x0+(x1-x0)*f,z=z0+(z1-z0)*f,y=gy(x,z),blk=Math.floor(cnt++/5)%9;for(let h=0;h<rows;h++)(blk===0?R:B).push([x,y+.25+h*.5,z,1,1,0])}
    if(nearTrack(x0,z0)&&P.addSeg)P.addSeg(T,x0,z0,x1,z1,.6)}}
  const cg=new THREE.CylinderGeometry(.55,.55,.5,8);if(B.length)inst(g,cg,M_(0x0c0d10),B);if(R.length)inst(g,cg,M_(0x6e0c08),R)}
 /* BUILDINGS & OBJECTS: every object of the survey at its measured footprint and height, drawn as a clean low-poly model of its kind:
    buildings with floors of windows, houses with pitched roofs, grandstands (open rakes, or covered stands up on legs under a roof),
    tents, vans, trucks and boards; the pit building, its paddock block and the control tower are modelled by hand from the survey. Never on the road */
 const box=[];
 {const OB=(IR&&IR.ob)||[],TL=new Map(),C_=h=>lin(h);
  const geo=k=>{if(!TL.has(k))TL.set(k,{pos:[],col:[],idx:[]});return TL.get(k)};
  /* a drawing kit in a local frame (u along ang, v across, y up) at cx,cz */
  const kit=(cx,cz,ang)=>{const ca=Math.cos(ang),sa=Math.sin(ang),{pos,col,idx}=geo(Math.floor(cx/250)+','+Math.floor(cz/250));
   const P=(u,v,y)=>[cx+u*ca-v*sa,y,cz+u*sa+v*ca];
   const quad=(a,b,c,d,cl)=>{const i=pos.length/3;for(const q of[a,b,c,d]){pos.push(q[0],q[1],q[2]);col.push(cl.r,cl.g,cl.b)}idx.push(i,i+2,i+1,i,i+3,i+2)};
   const tri=(a,b,c,cl)=>{const i=pos.length/3;for(const q of[a,b,c]){pos.push(q[0],q[1],q[2]);col.push(cl.r,cl.g,cl.b)}idx.push(i,i+2,i+1)};
   const bx=(u0,u1,v0,v1,ya,yb,sc,tc,bc)=>{const a=P(u0,v0,ya),b=P(u1,v0,ya),c=P(u1,v1,ya),d=P(u0,v1,ya),e=P(u0,v0,yb),f=P(u1,v0,yb),g2=P(u1,v1,yb),h=P(u0,v1,yb);
    quad(a,b,f,e,sc);quad(b,c,g2,f,sc);quad(c,d,h,g2,sc);quad(d,a,e,h,sc);if(tc)quad(e,f,g2,h,tc);if(bc)quad(d,c,b,a,bc)};
   /* a flat panel on the face v=vf (normal +v if dir>0) */
   const pan=(u0,u1,vf,ya,yb,cl,dir)=>{const o=dir>0?.03:-.03;dir>0?quad(P(u1,vf+o,ya),P(u0,vf+o,ya),P(u0,vf+o,yb),P(u1,vf+o,yb),cl):quad(P(u0,vf+o,ya),P(u1,vf+o,ya),P(u1,vf+o,yb),P(u0,vf+o,yb),cl)};
   const panU=(v0,v1,uf,ya,yb,cl,dir)=>{const o=dir>0?.03:-.03;dir>0?quad(P(uf+o,v0,ya),P(uf+o,v1,ya),P(uf+o,v1,yb),P(uf+o,v0,yb),cl):quad(P(uf+o,v1,ya),P(uf+o,v0,ya),P(uf+o,v0,yb),P(uf+o,v1,yb),cl)};
   return{P,quad,tri,bx,pan,panU}};
  const base=(cx,cz,ang,L,W)=>{const ca=Math.cos(ang),sa=Math.sin(ang);let y0=gy(cx,cz);for(const[u,v]of[[-L/2,-W/2],[L/2,-W/2],[L/2,W/2],[-L/2,W/2]])y0=Math.min(y0,gy(cx+u*ca-v*sa,cz+u*sa+v*ca));return[y0-.2,gy(cx,cz)]};
  const WHT=C_(0xeceae6),LGR=C_(0xc9cbcc),MGR=C_(0x8d9196),DGR=C_(0x45494e),GLS=C_(0x2b3a48),RED=C_(0xc8242c),NAV=C_(0x1f2f5a),SKY=C_(0x8fc3d8);
  /* windows: a dark band on every floor of every face */
  const floors=(K,u0,u1,v0,v1,ya,yb,step,frac)=>{for(let y=ya+step*.35;y+step*frac<yb-.3;y+=step){const y2=y+step*frac;K.pan(u0+.6,u1-.6,v1,y,y2,GLS,1);K.pan(u0+.6,u1-.6,v0,y,y2,GLS,-1);K.panU(v0+.6,v1-.6,u1,y,y2,GLS,1);K.panU(v0+.6,v1-.6,u0,y,y2,GLS,-1)}};
  for(const o of OB){const[t,cx,cz,ang,L,W,H]=o;
   const cs=[[-L/2,-W/2],[L/2,-W/2],[L/2,W/2],[-L/2,W/2]].map(([u,v])=>[cx+u*Math.cos(ang)-v*Math.sin(ang),cz+u*Math.sin(ang)+v*Math.cos(ang)]);
   let onRoad=dRoad(cx,cz)<1.5;for(const[x,z]of cs)if(dRoad(x,z)<1)onRoad=true;if(onRoad)continue;
   const[y0,yb]=base(cx,cz,ang,L,W),K=kit(cx,cz,ang),{P,quad,tri,bx}=K,hl=L/2,hw=W/2;
   if(t==='bld'){const bands=(o[7]||[]).filter(Boolean),wc=C_(bands.length?bands[Math.min(1,bands.length-1)]:0xeceae6),rc=C_(o[8]||0x8d9196),top=yb+H,acc=bands.length>2&&bands[2]!==bands[1]?C_(bands[2]):null;
    bx(-hl,hl,-hw,hw,y0,top,wc,rc);if(acc&&H>4)bx(-hl-.05,hl+.05,-hw-.05,hw+.05,top-Math.min(1.2,H*.15),top,acc,null);
    if(H>=3.2&&L>4&&W>4)floors(K,-hl,hl,-hw,hw,yb,top-(acc?1.2:0),3.4,.38);
    if(L>8&&W>8)bx(-hl,hl,-hw,hw,top,top+.4,wc,rc)}
   else if(t==='house'){const e=Math.max(2.6,Math.min(o[7]||H-2.5,H-1.2)),wc=C_(0xeadfc8),rc=C_(0xb5532f),gc=C_(0xd9cdb4),ly=yb+e,ry=yb+H,ov=.5;
    bx(-hl,hl,-hw,hw,y0,ly,wc,null);
    for(let y=yb+1;y+1.3<ly;y+=3)for(let u=-hl+1.5;u<hl-1.5;u+=3.2){K.pan(u,u+1.1,hw,y,y+1.3,GLS,1);K.pan(u,u+1.1,-hw,y,y+1.3,GLS,-1)}
    if(L>=W){quad(P(-hl-ov,-hw-ov,ly-.25),P(hl+ov,-hw-ov,ly-.25),P(hl+ov,0,ry),P(-hl-ov,0,ry),rc);quad(P(hl+ov,hw+ov,ly-.25),P(-hl-ov,hw+ov,ly-.25),P(-hl-ov,0,ry),P(hl+ov,0,ry),rc);
     tri(P(-hl,-hw,ly),P(-hl,0,ry),P(-hl,hw,ly),gc);tri(P(hl,hw,ly),P(hl,0,ry),P(hl,-hw,ly),gc)}
    else{quad(P(hl+ov,-hw-ov,ly-.25),P(hl+ov,hw+ov,ly-.25),P(0,hw+ov,ry),P(0,-hw-ov,ry),rc);quad(P(-hl-ov,hw+ov,ly-.25),P(-hl-ov,-hw-ov,ly-.25),P(0,-hw-ov,ry),P(0,hw+ov,ry),rc);
     tri(P(hl,-hw,ly),P(0,-hw,ry),P(-hl,-hw,ly),gc);tri(P(-hl,hw,ly),P(0,hw,ry),P(hl,hw,ly),gc)}}
   else if(t==='stand'){const lo=o[7],hi=Math.max(o[8],lo+1),rf=o[9],cc=C_(0xc4c6c6),st=C_(0x9da3a6),seat=C_(lo>4.5?0xdfe1e2:0x3f6f8f),dk=C_(0x6d7275);
    if(lo>4.5){/* covered grandstand: raked seating up on V legs, roof above, open underneath */
     const rt=yb+hi,dk0=yb+2.2,dk1=Math.max(dk0+2,rt-3.2),n=Math.max(2,Math.round(W/1.4));
     for(let k=0;k<n;k++){const v0=-hw+W*k/n,v1=-hw+W*(k+1)/n,y=dk0+(dk1-dk0)*(k+1)/n;bx(-hl,hl,v0,v1,y-.45,y,cc,seat)}
     bx(-hl,hl,-hw,-hw+.25,dk0-.6,dk0+.9,cc,cc);bx(-hl,hl,hw-.3,hw,dk1-.4,rt,cc,null);
     const m=Math.max(2,Math.round(L/10));for(let k=0;k<=m;k++){const u=-hl+L*k/m;bx(u-.35,u+.35,-hw*.4-.35,-hw*.4+.35,y0,dk0+(dk1-dk0)*.3,st,null);quad(P(u-.25,-hw*.4,dk0),P(u+.25,-hw*.4,dk0),P(u+.25,hw-.3,rt),P(u-.25,hw-.3,rt),st)}
     bx(-hl-.6,hl+.6,-hw-2.5,hw+.4,rt,rt+.45,DGR,MGR,MGR)}
    else{const steps=Math.max(2,Math.min(12,Math.round(W/1.6)));
     for(let k=0;k<steps;k++){const v0=-hw+W*k/steps,v1=-hw+W*(k+1)/steps,hy=yb+lo+(hi-lo)*(k+1)/steps;bx(-hl,hl,v0,v1,y0,hy,cc,seat)}
     bx(-hl,hl,hw-.4,hw,y0,yb+hi+1.1,dk,dk);
     if(rf>hi+1.5){const ry=yb+rf;bx(-hl-.5,hl+.5,-hw-1.5,hw+.3,ry-.35,ry,WHT,WHT);const n=Math.max(2,Math.round(L/9));for(let k=0;k<=n;k++){const u=-hl+L*k/n;bx(u-.18,u+.18,hw-.3,hw,yb+hi,ry-.35,dk,null)}}}}
   else if(t==='tent'){const e=Math.max(2.2,H*.62),pc=C_(0x9aa0a6);
    for(const[u,v]of[[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw]])bx(u-.06,u+.06,v-.06,v+.06,y0,yb+e,pc,null);
    if(L*W>40)bx(-hl,hl,-hw,hw,y0,yb+e-.2,WHT,null);
    const pk=P(0,0,yb+H),c4=[P(-hl,-hw,yb+e),P(hl,-hw,yb+e),P(hl,hw,yb+e),P(-hl,hw,yb+e)];for(let k=0;k<4;k++)tri(c4[k],c4[(k+1)%4],pk,WHT)}
   else if(t==='van'||t==='truck'){const bc=C_(o[7]||0xdddddd),wh=C_(0x15171a),h=Math.min(H,t==='van'?2.6:4);
    if(t==='van'){bx(-hl,hl,-hw,hw,yb+.35,yb+h,bc,bc);K.panU(-hw+.15,hw-.15,hl,yb+h*.55,yb+h*.85,GLS,1)}
    else{const cab=Math.min(2.4,L*.25);bx(-hl,hl-cab-.2,-hw,hw,yb+.9,yb+h,bc,bc);bx(hl-cab,hl,-hw,hw,yb+.6,yb+Math.min(3.2,h),WHT,WHT);K.panU(-hw+.2,hw-.2,hl,yb+2,yb+2.8,GLS,1)}
    bx(-hl+.3,hl-.3,-hw+.1,hw-.1,yb,yb+.4,wh,null)}
   else if(t==='board'){const b=o[7],bc=C_(o[8]||0x2a5aa0),pc=C_(0x6d7378),y1=yb+Math.max(H,b+.8);
    bx(-hl,hl,-hw,hw,yb+b,y1,bc,pc);if(b>.3)for(const u of[-hl*.8,hl*.8])bx(u-.08,u+.08,-.06,.06,y0,yb+b,pc,null)}
   if(H>2&&t!=='board')box.push([Math.min(...cs.map(c=>c[0]))-2,Math.max(...cs.map(c=>c[0]))+2,Math.min(...cs.map(c=>c[1]))-2,Math.max(...cs.map(c=>c[1]))+2])}
  /* the pit building: garages facing the pit lane (+z) under a navy balcony, offices above, rooftop pavilions; then the taller paddock block
     with its dark roof overhang and red end block, and the control tower. Positions and heights from the survey */
  const pitRow=(x0,x1,z0,z1,upper)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,L=x1-x0,W=z1-z0,K=kit(cx,cz,0),[y0,yb]=base(cx,cz,0,L,W),hl=L/2,hw=W/2;
   K.bx(-hl,hl,-hw,hw,y0,yb+4.5,WHT,LGR);
   for(let u=-hl+.6;u+6<=hl;u+=6.5){K.pan(u+.7,u+5.9,hw,yb,yb+3.7,C_(0xf6f4f2),1);K.pan(u+.7,u+1.1,hw+.01,yb+.4,yb+3.4,RED,1);K.pan(u+5.5,u+5.9,hw+.01,yb+.4,yb+3.4,RED,1);K.bx(u,u+.6,hw,hw+.35,y0,yb+4.5,RED,RED)}
   K.bx(-hl,hl,hw-.2,hw+1.4,yb+4.5,yb+5.4,NAV,NAV,NAV);K.bx(-hl,hl,hw+1.25,hw+1.4,yb+5.4,yb+6.4,SKY,SKY);
   box.push([x0-2,x1+2,z0-2,z1+2]);if(upper)upper(K,yb,y0,hl,hw)};
  pitRow(1388,1581,186,203,(K0,yb)=>{const K=kit(1484.5,189.5,0),hl=96.5,hw=9.5;
   K.bx(-hl,hl,-hw,hw,yb+4.5,yb+9.6,C_(0xe4e4e1),LGR);K.pan(-hl+.5,hl-.5,hw,yb+6.6,yb+8.2,GLS,1);K.pan(-hl+.5,hl-.5,-hw,yb+6.6,yb+8.2,GLS,-1);
   K.bx(-hl,hl,-hw-.3,hw+.3,yb+9.6,yb+10,MGR,MGR);
   for(const u of[-70,-25,20,65]){K.bx(u-5,u+5,-3.5,3.5,yb+10,yb+12.4,LGR,null);K.pan(u-4,u+4,3.5,yb+10.6,yb+11.8,GLS,1);K.bx(u-6,u+6,-4.5,4.5,yb+12.4,yb+12.8,NAV,NAV,NAV)}});
  pitRow(1329,1388,186,203,()=>{const K=kit(1361.5,190,0),[y0,yb]=base(1361.5,190,0,65,25),hl=32.5,hw=12.5;
   K.bx(-hl,hl,-hw,hw,y0,yb+12.4,C_(0xbcbfc2),MGR);K.pan(-hl+.5,hl-.5,hw,yb+6.2,yb+7.8,GLS,1);K.pan(-hl+.5,hl-.5,hw,yb+9.3,yb+10.9,GLS,1);
   K.bx(-hl-.5,hl+.5,-hw,hw+3,yb+12.4,yb+13.1,DGR,DGR,DGR);box.push([1327,1396,175,204]);
   const R=kit(1388,186.5,0),[r0,rb]=base(1388,186.5,0,20,29);R.bx(-10,10,-14.5,14.5,r0,rb+14,RED,LGR);R.bx(-10.2,10.2,-14.7,14.7,rb+13.2,rb+14,WHT,null);floors(R,-10,10,-14.5,14.5,rb+4.6,rb+13,3.2,.35)});
  /* the paddock block behind the start straight follows the straight's angle: an extruded outline from the survey */
  {const poly=[[1216,178],[1224,156],[1320,176],[1326,188],[1321,202]],cx=1265,cz=180,K=kit(cx,cz,0),{pos,col,idx}=geo(Math.floor(cx/250)+','+Math.floor(cz/250));
   let y0=1e9;for(const[x,z]of poly)y0=Math.min(y0,gy(x,z));y0-=.2;const yb=gy(cx,cz),top=yb+12,wc=C_(0xbcbfc2);
   for(let i=0;i<poly.length;i++){const[xa,za]=poly[i],[xb,zb]=poly[(i+1)%poly.length],L=Math.hypot(xb-xa,zb-za),ux=(xb-xa)/L,uz=(zb-za)/L;
    K.quad([xa,y0,za],[xb,y0,zb],[xb,top,zb],[xa,top,za],wc);
    for(let y=yb+1.4;y+1.4<top-.5;y+=3.3){const nx=uz*.04,nz=-ux*.04;K.quad([xa+ux*.8+nx,y,za+uz*.8+nz],[xb-ux*.8+nx,y,zb-uz*.8+nz],[xb-ux*.8+nx,y+1.4,zb-uz*.8+nz],[xa+ux*.8+nx,y+1.4,za+uz*.8+nz],GLS)}}
   for(let i=1;i<poly.length-1;i++)K.tri([poly[0][0],top,poly[0][1]],[poly[i][0],top,poly[i][1]],[poly[i+1][0],top,poly[i+1][1]],MGR);
   box.push([1214,1328,154,204])}
  /* pit apron (light concrete) and pit lane asphalt in front of the garages */
  {const K=kit(1455,207,0),flat=(x0,x1,z0,z1,c)=>{for(let x=x0;x<x1;x+=4){const xb=Math.min(x1,x+4);K.quad([x,gy(x,z1)+.14,z1],[xb,gy(xb,z1)+.14,z1],[xb,gy(xb,z0)+.14,z0],[x,gy(x,z0)+.14,z0],c)}};
   flat(1329,1581,203,211,C_(0xd8c6b8));flat(1329,1590,211,216.6,C_(0x4a4d52))}
  {const K=kit(1145,164.5,0),[y0,yb]=base(1145,164.5,0,22,10),hl=11,hw=5;
   K.bx(-hl,hl,-hw,hw,y0,yb+4.5,GLS,LGR);K.bx(-hl,hl,-hw,hw,yb+4.5,yb+22,WHT,DGR);
   for(let y=yb+5.6;y<yb+20;y+=3.3){K.pan(-hl+.4,hl-.4,hw,y,y+1.6,GLS,1);K.pan(-hl+.4,hl-.4,-hw,y,y+1.6,GLS,-1);K.panU(-hw+.4,hw-.4,hl,y,y+1.6,GLS,1);K.panU(-hw+.4,hw-.4,-hl,y,y+1.6,GLS,-1)}
   K.bx(-hl-.1,hl+.1,-hw-.1,hw+.1,yb+12.6,yb+13.2,RED,null);K.bx(-hl-.1,hl+.1,-hw-.1,hw+.1,yb+20.8,yb+22,RED,null);K.bx(-hl+3,hl-3,-hw+1,hw-1,yb+22,yb+24,LGR,MGR);
   for(let k=0;k<6;k++)K.bx(-.35,.35,-.35,.35,yb+24+k*3.7,yb+24+(k+1)*3.7,k%2?WHT:RED,k===5?RED:null);box.push([1132,1158,157,172])}
  const bm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:true,side:THREE.DoubleSide});
  for(const{pos,col,idx}of TL.values()){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gg.setIndex(idx);gg.computeVertexNormals();gg.computeBoundingSphere();
   const m=new THREE.Mesh(gg,bm);m.userData.fogCull=1;g.add(m)}}
 /* footbridges over the track where the survey has them */
 const MBc=c=>new THREE.MeshBasicMaterial({color:c});
 for(const br of(IR&&IR.br)||[]){let k=0,bd=1e18;for(let i=0;i<N;i++){const d=(T.x[i]-br[0])**2+(T.z[i]-br[1])**2;if(d<bd){bd=d;k=i}}if(bd>25*25)continue;
  const[bx_,by,bz]=at(k,0,0),bp=new THREE.Group();bp.position.set(bx_,by,bz);bp.rotation.y=T.psi[k];g.add(bp);const wd=T.hw[k]+7;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(wd*2,.7,4),M_(0x2c6cd0));deck.position.y=9.4;bp.add(deck);
  for(const sx of[-1,1]){const cl=new THREE.Mesh(new THREE.BoxGeometry(1.6,9.6,2.4),M_(0xe6e8ea));cl.position.set(sx*wd,4.8,0);bp.add(cl)}}
 /* the stock world's loose random cone trees go */
 {const cnt=new Set(),rm=[];sc.traverse(m=>{const q=m.geometry&&m.geometry.parameters;if(m.isInstancedMesh&&m.geometry.type==='ConeGeometry'&&q.radius>2&&q.radius<2.5&&q.height>6&&q.height<7){rm.push(m);cnt.add(m.count)}});
  sc.traverse(m=>{if(m.isInstancedMesh&&m.geometry.type==='CylinderGeometry'&&cnt.has(m.count)&&m.parent===sc)rm.push(m)});rm.forEach(m=>m.parent&&m.parent.remove(m))}
 /* what trees must keep clear of: a 2 m grid marking the barriers, the gravel/paint/run-off and every block */
 const OC=new Map(),ok_=(x,z)=>(Math.floor(x/2)+4096)*65536+(Math.floor(z/2)+4096),mark=(x,z)=>OC.set(ok_(x,z),1);
 for(const c in LN)for(const L of LN[c])for(let i=0;i<L.p.length-1;i++){const[x0,z0]=L.p[i],[x1,z1]=L.p[i+1],n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.5);for(let t=0;t<=n;t++)mark(x0+(x1-x0)*t/n,z0+(z1-z0)*t/n)}
 for(const nm in GRUN)for(const[r,A]of GRUN[nm])for(const[a0,a1]of A)for(let x=a0;x<=a1;x+=1.5)mark(x,-200+r+.5);
 for(const b of box)for(let x=b[0];x<=b[1];x+=1.5)for(let z=b[2];z<=b[3];z+=1.5)mark(x,z);
 const clear=(x,z,r)=>{const n=Math.ceil(r/2)+1;for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){if(OC.has(ok_(x+a*2,z+b*2))&&Math.hypot(a*2,b*2)<r+1.5)return false}return true};
 const built=(x,z)=>OC.has(ok_(x,z));
 const AUT={or:{'#0e1709':'#3c1604','#16270f':'#52280a'},ye:{'#0e1709':'#3a2c04','#16270f':'#5a4a12'},ru:{'#0e1709':'#2a0c04','#16270f':'#421a0a'}};
 /* ---- every tree where the real one stands: broadleaf (mostly green, some turning), Italian cypresses, stone pines ---- */
 {const tp=new Int16Array(irB(IR.tp).buffer),tk=irB(IR.tk),n=tk.length/3,G=[[],[],[],[]],CY=[],ST=[],FB=[],FC=[],FU=[];
  const FAR=[0x2f5a26,0x3a6a2c,0x2a4f22,0x46722f,0x5a6a26];
  for(let i=0;i<n;i++){const x=tp[i*3]/4,z=tp[i*3+1]/4,kd=tk[i*3],h=tk[i*3+1]/5;
   const r=((i*2654435761)>>>0)/4294967296,y=T.terr(x,z),rot=r*6.28,[,,ex]=near(x,z);
   if(ex>140){if(built(x,z))continue;const hh=Math.max(6,Math.min(26,h));(kd===1||kd===3?FC:kd===2?FU:FB).push([x,y-.4,z,kd===2?hh*.9:hh,rot,FAR[Math.floor(r*997)%FAR.length]]);continue}
   const s_=kd===1||kd===3?Math.max(.6,Math.min(1.4,h/17)):kd===2?Math.max(.6,Math.min(1.05,h/15)):Math.max(.95,Math.min(1.9,h/10)),
    cr=kd===1||kd===3?s_*17*.1:kd===2?s_*15*.38:s_*12*.36;
   /* no crown over the road, the gravel, the run-off, a barrier or a building */
   if(dRoad(x,z)<cr+2.5||!clear(x,z,cr))continue;
   if(kd===1||kd===3)CY.push([x,y,z,s_,rot]);else if(kd===2)ST.push([x,y,z,s_,rot]);else G[r<.8?0:r<.88?1:r<.95?2:3].push([x,y,z,s_,rot])}
  P.qMix(g,['oak3','oak4','oak5'],G[0],[12,12,12],[0xffffff,0xf0f8e0,0xe4eed6],{gap:.7});
  P.qMix(g,['oak3','oak4'],G[1],[12,12],[0xffffff],{pal:AUT.or,gap:.7});P.qMix(g,['oak4','oak5'],G[2],[12,12],[0xffffff],{pal:AUT.ye,gap:.7});P.qMix(g,['oak5'],G[3],[12],[0xffffff],{pal:AUT.ru,gap:.7});
  P.lobTrees(g,CY,17,[0xffffff,0xe6eee0],'cypress');P.lobTrees(g,ST,15,[0xffffff,0xeef6e0],'stone');
  if(P.farInst){P.farInst(g,'blob',FB);P.farInst(g,'cypress',FC);P.farInst(g,'umb',FU)}
  T._farTrees=n}
 /* past the surveyed land: low-poly woods out into the haze, so the horizon is trees, never bare fields */
 const ty=(x,z)=>{const y=T.terr(x,z);return isFinite(y)?y:0};
 {const[bx0,bx1,bz0,bz1]=T.bounds,M=330,st=12,FB=[],FP=[],FAR=[0x24481e,0x2d5524,0x203f1a,0x37602a,0x3f5a22,0x55481e];let s=7;const rr=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
  for(let x=bx0-M;x<bx1+M;x+=st)for(let z=bz0-M;z<bz1+M;z+=st){const px=x+(rr()-.5)*st*.9,pz=z+(rr()-.5)*st*.9,[,,ex]=near(px,pz);if(ex<260||ex>520)continue;
   if(built(px,pz))continue;if(Math.sin(px*.011+1.3)*Math.sin(pz*.013-.7)+Math.sin((px+pz)*.006)*.6>.95)continue;
   const h=13+rr()*12,c=FAR[Math.floor(rr()*FAR.length)];(rr()<.12?FP:FB).push([px,ty(px,pz)-.4,pz,h*(rr()<.12?1.25:1),rr()*6,c])}
  if(P.farInst){P.farInst(g,'blob',FB);P.farInst(g,'pine',FP)}T._woods=FB.length+FP.length}
 /* Emilia hills and the town on the horizon */
 {const pano=()=>P.hillPano(49,0xcfe0ea,[{base:296,amp:60,col:0x6a8496,fog:.62},{base:318,amp:42,col:0x5f7f52,fog:.5,trees:14,fields:40},{base:338,amp:22,col:0x4a7340,fog:.34,trees:12}],(g,W,H,hz,mix,r)=>{
     /* the town on the hill: terracotta roofs and a bell tower */
     for(const cx of[W*.31,W*.78]){for(let i=0;i<26;i++){const x=cx+(r()-.5)*240,w=10+r()*16,h=8+r()*10,y=hz-14-r()*10;g.fillStyle=mix(0xd9cdb5,.45);g.fillRect(x,y-h,w,h);g.fillStyle=mix(0xb0583a,.42);g.beginPath();g.moveTo(x-2,y-h);g.lineTo(x+w/2,y-h-5);g.lineTo(x+w+2,y-h);g.fill()}
      g.fillStyle=mix(0xc9b08e,.42);g.fillRect(cx-5,hz-70,10,50);g.fillStyle=mix(0xa8503a,.42);g.fillRect(cx-7,hz-74,14,6)}});sc.traverse(m=>{if(m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop>1000&&m.material.map){const t=new THREE.CanvasTexture(pano());t.encoding=m.material.map.encoding;t.wrapS=THREE.RepeatWrapping;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;m.material.map=t;m.material.needsUpdate=true}})}
 {const rm=[];sc.traverse(o=>{if(o.isInstancedMesh&&o.geometry&&/Octahedron|Icosahedron|Dodecahedron/.test(o.geometry.type))rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o))}
 styleScene(g);sc.add(g);
}
const bwI=buildWorld;buildWorld=T=>{const sc=bwI(T);if(T.d&&T.d.imola){try{dressIM(T,sc)}catch(e){console.error('imola dress',e)}}return sc};
})();
