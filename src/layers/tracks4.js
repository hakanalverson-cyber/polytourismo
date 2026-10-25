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
P.MEDAL_REF[D.length-1]=108.2;
MATS.sandtrap={grip:.42,top:.5,acc:.4};
const IMX=D.length-1;
/* the real circuit's trackside layout (imola_ref.js): per-sample offsets past the road edge for each side, or -1 */
const IR=window.PT8_IMREF,irB=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const irOff=(()=>{if(!IR)return null;const o={};for(const c in IR.off)o[c]=IR.off[c].map(s=>{const u=irB(s),f=new Float32Array(u.length);for(let i=0;i<u.length;i++)f[i]=u[i]===255?-1:u[i]/4;return f});return o})();

/* ---------- track data: corners, sand traps, trap-aware surface ---------- */
const wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
function cornersOf(T){const N=T.N,curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wrp(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 const corners=[];let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0105;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>6){let pk=0,pi=s;for(let q=s;q<i;q++)if(Math.abs(curv[q])>pk){pk=Math.abs(curv[q]);pi=q}corners.push({a:s,b:i,dir:Math.sign(curv[pi]),pk,pi})}s=-1}}
 let tot=0;for(let i=0;i<N;i++)tot+=curv[i];return{curv,corners,left:tot>=0?1:-1}}
const ssI=sampleTrack;sampleTrack=d=>{const T=ssI(d);if(!d.imola)return T;
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 const C=cornersOf(T);T._im=C;const N=T.N;T.trapS=new Int8Array(N);
 const kc=[];for(const c of C.corners){const p=kc[kc.length-1];if(p&&p.dir===c.dir&&c.a-p.b<16)p.b=c.b;else kc.push({a:c.a,b:c.b,dir:c.dir})}
 const real=irOff&&IR.N===N;T._irOk=real;
 if(!real)for(const c of kc){const side=c.dir>0?-1:1;for(let q=c.a-3;q<=c.b+6;q++)T.trapS[((q%N)+N)%N]=side}
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y);if(r.road)return r;const cx=Math.floor(x/16),cz=Math.floor(z/16);let bd=1e9,bi=-1,bl=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((x-T.x[i])*dx+(z-T.z[i])*dz)/l2)),px=T.x[i]+dx*f,pz=T.z[i]+dz*f,dd=Math.hypot(x-px,z-pz);if(dd<bd){bd=dd;bi=i;bl=(x-px)*Math.cos(T.psi[i])-(z-pz)*Math.sin(T.psi[i])}}}
  if(bi>=0&&real){const si=bl<0?0:1,lo=irOff.sand_lo[si][bi],hi=irOff.sand_hi[si][bi],ex=Math.abs(bl)-T.hw[bi];if(lo>=0&&hi>lo&&ex>Math.max(2.4,lo)&&ex<hi)r.trap=1}
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
 /* kerbs: red/white on the inside of every corner, a short outside kerb on exit */
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#e01a14':'#f4f4f4';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const inR=[],outR=[],inL=[],outL=[];
 const kc=[];for(const c of corners){const p=kc[kc.length-1];if(p&&p.dir===c.dir&&c.a-p.b<16)p.b=c.b;else kc.push({a:c.a,b:c.b,dir:c.dir})}/* one kerb per corner: brief dips in curvature no longer break it in two */
 for(const c of kc){const a=Math.max(0,c.a-3),b=c.b+3;(c.dir>0?inL:inR).push([a,b]);(c.dir>0?outR:outL).push([a+4,c.b-2])}
 /* kerbs ride on the road plane across their whole width (never on the ground beside it), a hair above the asphalt */
 const kerb=(ranges,side,w0,w1,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const[a,b]of ranges){const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);
    for(const w of[w0,w1]){const l=side*(T.hw[k]+w);pos.push(T.x[k]+c*l,T.y[k]-l*T.bank[k]+.1,T.z[k]-s*l)}uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);m.renderOrder=1;g.add(m);return m};
 kerb(inL,1,-.1,1.5,curbM,2.0);kerb(inR,-1,-.1,1.5,curbM,2.0);kerb(outL,1,-.1,1.2,curbM,2.0);kerb(outR,-1,-.1,1.2,curbM,2.0);
 /* Imola's kerbs carry a green, white and red stripe along their outer edge, with a black band between */
 {const tri=ctex(4,1,(x)=>{x.fillStyle='#111317';x.fillRect(0,0,1,1);x.fillStyle='#1f8a3c';x.fillRect(1,0,1,1);x.fillStyle='#f4f4f4';x.fillRect(2,0,1,1);x.fillStyle='#d8261e';x.fillRect(3,0,1,1)}),triM=new THREE.MeshStandardMaterial({map:tri,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  kerb(inL,1,1.5,2.4,triM,4);kerb(inR,-1,1.5,2.4,triM,4)}
 /* SAND TRAPS on the outside of every corner (really slow: cars bog down in them) with a rake-line pattern */
 const sandTex=ctex(32,32,(x,w,h)=>{x.fillStyle='#e6d29b';x.fillRect(0,0,w,h);x.fillStyle='#d4bd80';for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1);x.fillStyle='#f1e3b4';for(let j=2;j<h;j+=8)x.fillRect(0,j,w,1)});
 const sandM=new THREE.MeshStandardMaterial({map:sandTex,roughness:1,side:THREE.DoubleSide});sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;
 sandM.polygonOffset=true;sandM.polygonOffsetFactor=-2;sandM.polygonOffsetUnits=-2;
 /* ---- the real circuit's trackside, measured from a survey of Imola (imola_ref.js): gravel, green run-offs, green walls, Armco,
    catch fences and tyre walls stand where they stand at the real track. Nothing closer than 2.5 m to the road edge ---- */
 /* the pits are on the right of the start straight at the real circuit (side -1), garages from 56 samples before the line to 60 after */
 const PS=-1,K0=-56,K1=60,inPit=k=>k>=N+K0||k<=K1+2;
 /* opposite the pits, along the whole start straight: the real wall and fence, with one continuous run of grandstands right behind them */
 const inStart=k=>{k=((k%N)+N)%N;return k>=N-70||k<=K1+90};
 /* walls, fences and rails run unbroken: gaps of up to 30 samples are bridged, sudden steps become a gentle slant (1 m per sample at most)
    and leftover stubs under 8 samples are dropped */
 const smooth=a=>{const o=Float32Array.from(a),n=o.length;let i=0;while(i<n&&o[i]>=0)i++;if(i===n)return o;
  for(let q=0;q<n;q++){const k=(i+q)%n;if(o[k]>=0)continue;let e=q;while(e<n&&o[(i+e)%n]<0)e++;const L=e-q;
   if(L<=30){const v0=o[(i+q-1+n)%n],v1=o[(i+e)%n];for(let t=0;t<L;t++)o[(i+q+t)%n]=v0+(v1-v0)*(t+1)/(L+1)}q=e}
  for(let it=0;it<20;it++)for(let k=0;k<n;k++){const v=o[k];if(v<0)continue;for(const j of[(k+1)%n,(k-1+n)%n])if(o[j]>=0&&o[j]-1>v)o[k]=o[j]-1}
  for(let q=0;q<n;q++){const k=(i+q)%n;if(o[k]<0)continue;let e=q;while(e<n&&o[(i+e)%n]>=0)e++;if(e-q<8)for(let t=q;t<e;t++)o[(i+t)%n]=-1;q=e}return o};
 const irC={};for(const c in irOff)irC[c]=c==='wall'||c==='fence'||c==='rail'?irOff[c].map(smooth):irOff[c];
 const get=(c,side,k)=>{k=((k%N)+N)%N;return irC[c][side<0?0:1][k]},pitSide=(side,k)=>side===PS&&inPit(k);
 const brk=(c,side)=>k=>{const a=get(c,side,k),b=get(c,side,k-1);return a<0||b<0||Math.abs(a-b)>2.5};
 /* gravel and green run-off between their inner and outer edge, in 12 bands so they follow the ground */
 const ribbon=(cLo,cHi,side,mt,dy)=>{for(let j=0;j<12;j++){const pos=[],uv=[],idx=[];let prev=-1;
   for(let q=0;q<=N;q++){const k=q%N,lo0=get(cLo,side,k),hi=get(cHi,side,k);if(lo0<0||hi<0||pitSide(side,k)){prev=-1;continue}
    const lo=Math.max(2.4,lo0);if(hi<lo+.5){prev=-1;continue}const w0=lo+(hi-lo)*j/12,w1=lo+(hi-lo)*(j+1)/12,v=pos.length/3;
    pos.push(...at(k,side*(T.hw[k]+w0),dy),...at(k,side*(T.hw[k]+w1),dy));uv.push(w0/4,q*T.sp/8,w1/4,q*T.sp/8);
    if(prev>=0&&Math.abs(hi-get(cHi,side,prev))<4&&Math.abs(lo0-get(cLo,side,prev))<4)idx.push(v-2,v-1,v,v-1,v+1,v);prev=k}
   if(!idx.length)continue;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,mt))}};
 const greenM=new THREE.MeshStandardMaterial({color:new THREE.Color(0x0e6a48).convertSRGBToLinear(),roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 for(const side of[-1,1]){ribbon('green_lo','green_hi',side,greenM,.1);ribbon('sand_lo','sand_hi',side,sandM,.14)}
 for(const side of[-1,1]){
  /* green concrete walls */
  P.trackWall(T,g,at,dRoad,{side,a:0,b:N,off:k=>Math.max(2.5,get('wall',side,k)),h:1.1,col:0x0c5a22,top:0xe9ebe6/* the scene grading halves saturation: a deep green reads as Imola's green */,skip:k=>get('wall',side,k)<0||pitSide(side,k),brk:k=>get('wall',side,k-1)<0});
  /* Armco */
  const ro=new Float32Array(N);for(let k=0;k<N;k++){const v=get('rail',side,k);ro[k]=v<0||pitSide(side,k)?-1:Math.max(2.5,v)}P.armco(T,g,at,side,ro);
  /* catch fences: on top of the wall where one stands within a metre or so, otherwise on their own posts */
  const onWall=k=>{const w=get('wall',side,k),f=get('fence',side,k);return w>=0&&f>=0&&Math.abs(w-f)<1.2};
  P.catchFence(T,g,at,dRoad,{side,a:0,b:N,h:3,off:k=>onWall(k)?Math.max(2.5,get('wall',side,k))+.2:Math.max(2.5,get('fence',side,k)),y0:k=>onWall(k)?1.05:0,
   skip:k=>get('fence',side,k)<0||pitSide(side,k),brk:k=>get('fence',side,k-1)<0||onWall(k)!==onWall(k-1)})}
 /* TYRE WALLS: two tyres high, black with a white and a red block now and then; every link a collider */
 /* they always stand against the face of a wall or Armco run: no barrier just behind them, no tyres */
 {const bar=(side,k,o)=>{let b=-1;for(const c of['wall','rail']){let v=get(c,side,k);if(v<0||pitSide(side,k))continue;v=Math.max(2.5,v);if(v>=o-1.5&&v-o<=5&&(b<0||v<b))b=v}return b},
   tw=(side,k)=>{const o=get('tyre',side,k);if(o<1.5||pitSide(side,k))return -1;const b=bar(side,k,o);return b<0?-1:b-.6};
  const B=[],W=[],R=[];for(const side of[-1,1])for(let k=0;k<N;k++){const e0=tw(side,k);if(e0<0)continue;const t1=tw(side,k+1),e1=t1>=0&&Math.abs(e0-t1)<2.5?t1:-1;
   for(let t=0;t<3;t++){if(t&&e1<0)break;const f=t/3,pa=at(k,side*(T.hw[k]+e0),0),pb=e1<0?pa:at(k+1,side*(T.hw[(k+1)%N]+e1),0),x=pa[0]+(pb[0]-pa[0])*f,y=pa[1]+(pb[1]-pa[1])*f,z=pa[2]+(pb[2]-pa[2])*f,blk=Math.floor((k*3+t)/5)%9;
    for(let h=0;h<2;h++)(blk===0?R:B).push([x,y+.25+h*.5,z,1,1,0])}
   if(e1>=0&&P.addSeg){const p1=at(k,side*(T.hw[k]+e0),0),p2=at(k+1,side*(T.hw[(k+1)%N]+e1),0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.8)}}
  const cg=new THREE.CylinderGeometry(.55,.55,.5,8);inst(g,cg,M_(0x0c0d10),B);if(R.length)inst(g,cg,M_(0x6e0c08),R)}
 const behind=(side,k)=>{let m=-1;for(const c of['wall','rail','tyre','fence']){const v=get(c,side,k);if(v>m)m=v}return m};

 /* helpers */
 const seats=ctex(16,8,(x,w,h)=>{x.fillStyle='#8d949c';x.fillRect(0,0,w,h);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b'];for(let i=0;i<w;i+=2){x.fillStyle=pal[(i>>1)%4];x.fillRect(i,1,2,2);x.fillRect(i,5,2,2)}}),seatM=new THREE.MeshStandardMaterial({map:seats,roughness:.9});
 const stand=(k,l,len,rows)=>{const sg=l>0?1:-1,[px,py,pz]=at(k,l,0),grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);
  const st=P.kitStand(len,Math.min(rows,9),[0x2f6b3a,0xf1f1f1,0xd8392f]);st.rotation.y=-sg*PI/2;grp.add(st);if(P.kitCrowd)P.kitCrowd(st,len,Math.min(rows,9),.85);return grp};
 const signCanvas=(txt,w,h,bg,fg,fs)=>ctex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=3;c.strokeRect(3,3,W-6,H-6);c.fillStyle=fg;c.font='bold '+(fs||Math.floor(H*.5))+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+2)});
 const board=(k,l,txt,wm,hm,bg,fg,yy)=>{const[px,py,pz]=at(k,l,0),grp=new THREE.Group();grp.position.set(px,py,pz);grp.rotation.y=T.psi[k]+PI;g.add(grp);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(.18,(yy||2.4)+hm/2,.18),M_(0x666d73));pl.position.set(0,(yy||2.4)/2+hm/4,0);grp.add(pl);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:signCanvas(txt,Math.max(64,Math.round(wm*40)),Math.max(32,Math.round(hm*40)),bg,fg),side:THREE.DoubleSide}));sg.position.set(0,(yy||2.4)+hm/2,.12);grp.add(sg);return grp};
 /* corner numbers + brake boards + marshal posts */
 corners.forEach((c,i)=>{const side=c.dir>0?-1:1;{const kb=(c.a-14+N)%N,w=behind(side,kb);board(kb,side*(T.hw[c.a]+(w>=0&&w<8.5?Math.max(2.5,w)+.9:7.4)),String(i+1),2.4,1.5,'#f2c76b','#10151b',2.1)}
  if(0)board(0,0,String(i+1),2.4,1.5,'#f2c76b','#10151b',2.1);
  const k=c.pi,mo=behind(side,k),[mx,my,mz]=at(k,side*(T.hw[k]+(mo>=0?Math.max(2.5,mo)+3.5:18.5)),0),mp=new THREE.Group();mp.position.set(mx,my,mz);mp.rotation.y=T.psi[k];g.add(mp);
  const hut=P.kitHut();hut.rotation.y=-side*PI/2;mp.add(hut);const fp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.4,5),M_(0xcfd3d6));fp.position.set(1.1,3.7,0);mp.add(fp);const fl=new THREE.Mesh(new THREE.BoxGeometry(.05,.7,1.1),MB([0xf2c76b,0xffffff,0x2c6cd0][i%3]));fl.position.set(1.1,5.2,.55);mp.add(fl)});
 /* start/finish: gantry, painted line + grid boxes, pit row, tower, stands, footbridge, advert boards */
 {  /* grid boxes behind the line */
  /* exactly where gridSlot() puts the cars: row = slot>>1 at -(5+row*5) samples, lateral +-0.36 x hw[0] */
  for(let row=0;row<6;row++){const k=(((-(5+row*5))%N)+N)%N;for(const s of[-1,1]){const[bx,by,bz]=at(k,s*T.hw[0]*.36,.09),bx2=new THREE.Mesh(new THREE.PlaneGeometry(3.1,5.4),MB(0xf1f1f1));bx2.rotation.x=-PI/2;bx2.rotation.order='YXZ';bx2.rotation.y=T.psi[k];bx2.position.set(bx,by,bz);g.add(bx2);
     const inn=new THREE.Mesh(new THREE.PlaneGeometry(2.7,5),MB(0x3b3d43));inn.rotation.copy(bx2.rotation);inn.position.set(bx,by+.012,bz);g.add(inn)}}
  /* pit buildings on the infield side */
  const is=PS;P.kitPitRow(g,T,at,K0,K1+2,is,16);
  {const k=3,[px,py,pz]=at(k,is*(T.hw[k]+34),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[k];g.add(b);{const tw=P.kitTower(20);/* Imola's race control: red and white bands, a glass box on top */tw.children[0].material=M_(0xd8392f);for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(2.45-.08*i,2.5-.08*i,1.6,8),M_(0xf1f1f1));r.position.y=3+i*4.4;tw.add(r)}tw.children[1].material=M_(0x6f93ad,{roughness:.15,metalness:.4});b.add(tw)}if(P.addPt)P.addPt(T,px,pz,4.2)}
  }
 /* footbridges where the real circuit has them (only those that span the track) */
 for(const br of IR.br){let k=0,bd=1e18;for(let i=0;i<N;i++){const d=(T.x[i]-br[0])**2+(T.z[i]-br[1])**2;if(d<bd){bd=d;k=i}}if(bd>25*25)continue;
 {const [bx,by,bz]=at(k,0,0),bp=new THREE.Group();bp.position.set(bx,by,bz);bp.rotation.y=T.psi[k];g.add(bp);const wd=T.hw[k]+7;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(wd*2,.7,4),M_(0x2c6cd0));deck.position.y=9.4;bp.add(deck);
  for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1.6,9.6,2.4),M_(0xe6e8ea));col.position.set(sx*wd,4.8,0);bp.add(col)}
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.5,1.6),new THREE.MeshBasicMaterial({map:signCanvas('IMOLA',512,64,'#2c6cd0','#f1f1f1',34),side:THREE.DoubleSide}));ban.position.set(0,10.4,2.05);bp.add(ban);const b2=ban.clone();b2.position.z=-2.05;bp.add(b2)}}
 /* tyre stacks as cones marking the pit exit, small detail */
 /* grandstands where the real ones stand: long stands are cut into 40 m sections, each one squared to the road beside it and set back
    behind the barriers (never closer than 4 m past the wall, fence or tyres), standing on a concrete plinth so nothing hangs in the air */
 {const plM=M_(0x8a8f94);
  for(const sd of IR.st){const[cx,cz,,len,dep,,ang]=sd,ax=Math.cos(ang),az=Math.sin(ang),ns=Math.max(1,Math.round(len/42)),sl=Math.min(40,len/ns-2);
   const rows=Math.max(4,Math.min(12,Math.round(dep*.55/.9))),D=rows*.9;
   for(let j=0;j<ns;j++){const t=-len/2+(j+.5)*len/ns,x=cx+ax*t,z=cz+az*t;let k=0,bd=1e18;for(let i=0;i<N;i++){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<bd){bd=d;k=i}}
    const l=(x-T.x[k])*Math.cos(T.psi[k])-(z-T.z[k])*Math.sin(T.psi[k]),side=Math.sign(l)||1;if(side===PS&&inPit(k))continue;if(side===-PS&&inStart(k))continue;/* the start straight gets its own continuous run below */
    let need=6;for(let d=-8;d<=8;d++){const v=behind(side,k+d);if(v>=0)need=Math.max(need,Math.max(2.5,v)+4)}
    const off=side===-PS&&inStart(k)?need+1:Math.max(need,Math.abs(l)-T.hw[k]-D/2);if(off>90)continue;
    const[px,,pz]=at(k,side*(T.hw[k]+off),0);if(dRoad(px,pz)<need-1)continue;
    const grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);
    const st=P.kitStand(sl,rows,[0x2f6b3a,0xf1f1f1,0xd8392f]);st.rotation.y=-side*PI/2;grp.add(st);if(P.kitCrowd)P.kitCrowd(st,sl,rows,.85);
    const pl=new THREE.Mesh(new THREE.BoxGeometry(D+.5,8,sl),plM);pl.position.set(side*(D/2),-4.02,0);grp.add(pl)}}}
 /* the main grandstands: one unbroken run along the start straight opposite the pits, right behind the wall and fence */
 {const plM=M_(0x8a8f94),side=-PS,rows=10,D=rows*.9,st=Math.max(1,Math.round(42/T.sp));
  for(let k=-64;k<K1+84;k+=st){const kk=((k%N)+N)%N;let need=6;for(let d=-2;d<=st+2;d++){const v=behind(side,kk+d);if(v>=0)need=Math.max(need,Math.max(2.5,v)+3)}if(need>34)continue;const[px,,pz]=at(kk,side*(T.hw[kk]+need),0),grp=new THREE.Group();grp.position.set(px,T.terr(px,pz),pz);grp.rotation.y=T.psi[kk];g.add(grp);
   const sl=Math.hypot(T.x[(kk+st)%N]-T.x[kk],T.z[(kk+st)%N]-T.z[kk])-.6;const s2=P.kitStand(sl,rows,[0x2f6b3a,0xf1f1f1,0xd8392f]);s2.rotation.y=-side*PI/2;s2.position.z=sl/2;grp.add(s2);if(P.kitCrowd)P.kitCrowd(s2,sl,rows,.85);
   const pl=new THREE.Mesh(new THREE.BoxGeometry(D+.5,8,sl),plM);pl.position.set(side*(D/2),-4.02,sl/2);grp.add(pl)}}
 /* the stock world's loose random cone trees go; trees keep 3 m clear of anything built (stands, pits, bridges) */
 {const cnt=new Set(),rm=[];sc.traverse(m=>{const q=m.geometry&&m.geometry.parameters;if(m.isInstancedMesh&&m.geometry.type==='ConeGeometry'&&q.radius>2&&q.radius<2.5&&q.height>6&&q.height<7){rm.push(m);cnt.add(m.count)}});
  sc.traverse(m=>{if(m.isInstancedMesh&&m.geometry.type==='CylinderGeometry'&&cnt.has(m.count)&&m.parent===sc)rm.push(m)});rm.forEach(m=>m.parent&&m.parent.remove(m))}
 const box=[];{const bb=new THREE.Box3();g.updateMatrixWorld(true);g.traverse(m=>{if(!m.isMesh||m.isInstancedMesh)return;bb.setFromObject(m);const sx=bb.max.x-bb.min.x,sz=bb.max.z-bb.min.z,sy=bb.max.y-bb.min.y;if(sy<1.5||sx>220||sz>220||!isFinite(sx))return;box.push([bb.min.x-3,bb.max.x+3,bb.min.z-3,bb.max.z+3])})}
 const built=(x,z)=>{for(const b of box)if(x>b[0]&&x<b[1]&&z>b[2]&&z<b[3])return true;return false};
 /* ---- Romagna parkland, tree by tree where the real ones stand: broadleaf (mostly green, some turning), Italian cypresses, stone pines, pines ---- */
 const AUT={or:{'#0e1709':'#3c1604','#16270f':'#52280a'},ye:{'#0e1709':'#3a2c04','#16270f':'#5a4a12'},ru:{'#0e1709':'#2a0c04','#16270f':'#421a0a'}};
 /* where a point is against the lap: nearest sample, signed lateral offset and distance past the road edge (any distance) */
 const near=(x,z)=>{let k=0,bd=1e18;for(let i=0;i<N;i+=2){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<bd){bd=d;k=i}}for(let i=k-2;i<=k+2;i++){const j=(i+N)%N,d=(T.x[j]-x)**2+(T.z[j]-z)**2;if(d<bd){bd=d;k=j}}
  const l=(x-T.x[k])*Math.cos(T.psi[k])-(z-T.z[k])*Math.sin(T.psi[k]);return[k,l,Math.sqrt(bd)-T.hw[k]]};
 /* everything the track owns on one side at sample k: barriers, gravel and green run-off (metres past the road edge) */
 const zone=(side,k)=>{let m=0;for(let d=-3;d<=3;d++)for(const c of['wall','rail','tyre','fence','sand_hi','green_hi']){const v=get(c,side,k+d);if(v>m)m=v}return m};
 {const tp=new Int16Array(irB(IR.tp).buffer),tk=irB(IR.tk),n=tk.length/3,G=[[],[],[],[]],CY=[],ST=[],FB=[],FC=[],FU=[];
  const FAR=[0x2f5a26,0x3a6a2c,0x2a4f22,0x46722f,0x5a6a26];
  for(let i=0;i<n;i++){const x=tp[i*3]/4,z=tp[i*3+1]/4,kd=tk[i*3],h=tk[i*3+1]/5;if(built(x,z))continue;
   const r=((i*2654435761)>>>0)/4294967296,y=T.terr(x,z),rot=r*6.28,[k,l,ex]=near(x,z),side=l<0?-1:1;
   /* the woods further out: a few triangles a tree, so the land is wooded right out to where the real woods end */
   if(ex>140){const hh=Math.max(6,Math.min(26,h));(kd===1||kd===3?FC:kd===2?FU:FB).push([x,y-.4,z,kd===2?hh*.9:hh,rot,FAR[Math.floor(r*997)%FAR.length]]);continue}
   const sc=kd===1||kd===3?Math.max(.6,Math.min(1.4,h/17)):kd===2?Math.max(.6,Math.min(1.05,h/15)):Math.max(.95,Math.min(1.9,h/10)),
    cr=kd===1||kd===3?sc*17*.1:kd===2?sc*15*.38:sc*12*.36;
   /* no crown reaches over the road, the run-off or the barriers */
   if(ex<zone(side,k)+cr+1.5||dRoad(x,z)<cr+2.5)continue;
   if(kd===1||kd===3)CY.push([x,y,z,sc,rot]);else if(kd===2)ST.push([x,y,z,sc,rot]);else G[r<.8?0:r<.88?1:r<.95?2:3].push([x,y,z,sc,rot])}
  P.qMix(g,['oak3','oak4','oak5'],G[0],[12,12,12],[0xffffff,0xf0f8e0,0xe4eed6],{gap:.7});
  P.qMix(g,['oak3','oak4'],G[1],[12,12],[0xffffff],{pal:AUT.or,gap:.7});P.qMix(g,['oak4','oak5'],G[2],[12,12],[0xffffff],{pal:AUT.ye,gap:.7});P.qMix(g,['oak5'],G[3],[12],[0xffffff],{pal:AUT.ru,gap:.7});
  P.lobTrees(g,CY,17,[0xffffff,0xe6eee0],'cypress');P.lobTrees(g,ST,15,[0xffffff,0xeef6e0],'stone');
  if(P.farInst){P.farInst(g,'blob',FB);P.farInst(g,'cypress',FC);P.farInst(g,'umb',FU)}
  T._farTrees=n}
 /* buildings around the circuit where the real ones stand (houses, sheds, the paddock blocks): plain rendered walls, terracotta or flat roofs */
 {const winM=M_(0x3c4a56),wallC=[0xe8dcc4,0xd9c6a4,0xefe6d6,0xcdb999,0xe2d2b6],roofC=0xa24a2c,flat=M_(0x6e7378),W=wallC.map(c=>M_(c)),Rf=M_(roofC);
  for(const[i,b]of(IR.bl||[]).entries()){const[cx,cz,,len,dep,h,ang]=b,[k,,ex]=near(cx,cz);if(ex<Math.max(dep,len)/2+zone(1,k)*0+12||built(cx,cz))continue;
   const L=Math.max(5,len),Dd=Math.max(4,dep),H=Math.max(3.5,Math.min(18,h-(L>40?0:2))),gy=T.terr(cx,cz),grp=new THREE.Group();grp.position.set(cx,gy-.3,cz);grp.rotation.y=-ang;g.add(grp);
   const body=new THREE.Mesh(new THREE.BoxGeometry(L,H,Dd),W[i%W.length]);body.position.y=H/2;grp.add(body);
   /* a dark band of windows round each floor, so no building is a blank box */
   for(let f=0;f<Math.floor(H/3.4);f++){const wb=new THREE.Mesh(new THREE.BoxGeometry(L-1.2,1.1,Dd+.08),winM);wb.position.y=f*3.4+1.9;grp.add(wb);const wc=new THREE.Mesh(new THREE.BoxGeometry(L+.08,1.1,Dd-1.2),winM);wc.position.y=f*3.4+1.9;grp.add(wc)}
   if(L>40||Dd>30){const r=new THREE.Mesh(new THREE.BoxGeometry(L+.4,.5,Dd+.4),flat);r.position.y=H+.25;grp.add(r)}
   else{const rg=new THREE.CylinderGeometry(0,1,1,4,1);rg.rotateY(Math.PI/4);const r=new THREE.Mesh(rg,Rf);r.scale.set(L*.75,Math.min(L,Dd)*.32,Dd*.75);r.position.y=H+Math.min(L,Dd)*.16;grp.add(r)}}}
 /* the land beyond: the scene fog swallows everything past about 600 m, so the open fields out to it get woods (a jittered grid of
    low-poly crowns from just behind the barriers and run-off out to 480 m off the road, with a few clearings), and the town of Imola sits on the north side. From the track you
    see woods and roofs fading into the haze, never bare grass running to the sky */
 const ty=(x,z)=>{const y=T.terr(x,z);return isFinite(y)?y:0};
 {const[bx0,bx1,bz0,bz1]=T.bounds,M=330,st=12,FB=[],FP=[],FAR=[0x24481e,0x2d5524,0x203f1a,0x37602a,0x3f5a22,0x55481e];let s=7;const rr=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
  for(let x=bx0-M;x<bx1+M;x+=st)for(let z=bz0-M;z<bz1+M;z+=st){const px=x+(rr()-.5)*st*.9,pz=z+(rr()-.5)*st*.9,[k,l,ex]=near(px,pz);if(ex<32||ex>480)continue;
   if(ex<zone(l<0?-1:1,k)+14||built(px,pz))continue;if(Math.sin(px*.011+1.3)*Math.sin(pz*.013-.7)+Math.sin((px+pz)*.006)*.6>.95)continue;/* clearings */
   const h=13+rr()*12,c=FAR[Math.floor(rr()*FAR.length)];(rr()<.12?FP:FB).push([px,ty(px,pz)-.4,pz,h*(rr()<.12?1.25:1),rr()*6,c])}
  if(P.farInst){P.farInst(g,'blob',FB);P.farInst(g,'pine',FP)}T._woods=FB.length+FP.length}
 {const W=[0xe8dcc4,0xd9c6a4,0xefe6d6,0xcdb999].map(c=>M_(c)),Rf=M_(0xa24a2c);let s=91;const rr=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
  /* the town: on the far side of the start straight from the pits, 250 to 420 m out */
  const k0=0,c=Math.cos(T.psi[k0]),sn=Math.sin(T.psi[k0]),ox=c*-PS,oz=-sn*-PS,fx=Math.sin(T.psi[k0]),fz=Math.cos(T.psi[k0]);let n=0;
  for(let j=0;j<220&&n<70;j++){const d=250+rr()*170,t=(rr()-.5)*900,x=T.x[k0]+ox*d+fx*t,z=T.z[k0]+oz*d+fz*t,[,,ex]=near(x,z);if(ex<200||built(x,z))continue;n++;
   const y=ty(x,z),w=9+rr()*12,dd=8+rr()*10,h=7+rr()*14,grp=new THREE.Group();grp.position.set(x,y-.3,z);grp.rotation.y=Math.atan2(fx,fz)+(rr()<.5?0:PI/2);g.add(grp);
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dd),W[j%4]);b.position.y=h/2;grp.add(b);
   const rg=new THREE.CylinderGeometry(0,1,1,4,1);rg.rotateY(PI/4);const r=new THREE.Mesh(rg,Rf);r.scale.set(w*.75,Math.min(w,dd)*.3,dd*.75);r.position.y=h+Math.min(w,dd)*.15;grp.add(r)
   if(n===30){const tw=new THREE.Mesh(new THREE.BoxGeometry(6,38,6),W[1]);tw.position.set(x+14,y+19,z);g.add(tw);const cap=new THREE.Mesh(new THREE.ConeGeometry(4.6,7,4),Rf);cap.position.set(x+14,y+41.5,z);cap.rotation.y=PI/4;g.add(cap)}}}
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
