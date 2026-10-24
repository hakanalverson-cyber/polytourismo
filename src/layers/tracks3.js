/* ===== Poly Tourismo v9 layer: tracks3 (circuit-mode tracks: Road Atlanta) ===== */
(function v9tracks3(){
'use strict';
const P=window.PT8,RA=window.PT8_RA;
if(!RA)return;
const PI=Math.PI,RAK=1,RAY=1;/* data is already at real size (4,088 m lap, 1 unit = 1 m) */
const roadAtl={id:14,look:0,name:'Road Atlanta',desc:'braselton georgia / uphill T1 / esses / T10 / T12 dive',hw:7.5,bank:5,off:'grass',idw:.85,offs:0,amp:3,up:5,shoulder:17,
 sky:[0x3f86d2,0xcfe4f4],fog:0xcfe0ea,sun:0xfff0d0,hemi:[0xd4e8f8,0x4f7a3c],road:'#3b3d43',tod0:'day',ra:1,
 pts:RA.pts.map(q=>[q[0]*RAK,q[1]*RAK,q[2]*RAY]),walls:[],ice:[],boost:[],jumps:[]};
D.push(roadAtl);
P.TRACK_INFO.push({s:'TARMAC',tags:['ESSES','UPHILL T1','T10 COMPLEX','T12 DIVE']});
P.TRK_TRACKS=[D.length-1];
P.RA=RA;

/* ---------------- Road Atlanta dressing ---------------- */
const hex=h=>'#'+h.toString(16).padStart(6,'0');
function near(T,x,z){let b=1e9,bi=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<b){b=d;bi=i}}return bi}
/* ---------- shared by Road Atlanta and Imola: tidy tree lines, copses, a canopy card behind them, and a painted hill horizon ----------
   o: {seed, set (m from the road edge to the first row), rows, kinds:[{w, build(list)}], card tint, start:[k0,k1] kept clear for the paddock} */
function circuitWoods(T,sc,g,o){
 const N=T.N,rr=(()=>{let s=o.seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})(),sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
 const dRoad=(x,z)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16);let b=1e9;for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const d=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(d<b)b=d}}return b>=1e9?999:Math.max(0,b)};
 /* the stock world's loose random trees go: the woods below replace them */
 {const cnt=new Set(),rm=[];sc.traverse(m=>{const q=m.geometry&&m.geometry.parameters;if(m.isInstancedMesh&&m.geometry.type==='ConeGeometry'&&q.radius>2&&q.radius<2.5&&q.height>6&&q.height<7){rm.push(m);cnt.add(m.count)}});
  sc.traverse(m=>{if(m.isInstancedMesh&&m.geometry.type==='CylinderGeometry'&&cnt.has(m.count)&&m.parent===sc)rm.push(m)});rm.forEach(m=>m.parent&&m.parent.remove(m))}
 /* anything already standing (stands, pits, bridges, signs, tyre walls): trees keep 4 m clear of its footprint */
 const box=[],bb=new THREE.Box3();sc.updateMatrixWorld(true);g.updateMatrixWorld(true);const look=m=>{if(!m.isMesh||m.isInstancedMesh)return;bb.setFromObject(m);const sx=bb.max.x-bb.min.x,sz=bb.max.z-bb.min.z,sy=bb.max.y-bb.min.y;if(sy<1.2||sx>140||sz>140||!isFinite(sx))return;box.push([bb.min.x-4,bb.max.x+4,bb.min.z-4,bb.max.z+4])};sc.traverse(look);g.traverse(look);
 const clear=(x,z)=>{for(const b of box)if(x>b[0]&&x<b[1]&&z>b[2]&&z<b[3])return false;return true};
 const inStart=k=>{const[a,b]=o.start;return k>=((a%N)+N)%N||k<=b};
 const lists=o.kinds.map(()=>[]),pick=x=>{let t=rr()*o.kinds.reduce((a,k)=>a+k.w,0);for(let i=0;i<o.kinds.length;i++){t-=o.kinds[i].w;if(t<=0)return i}return 0};
 const put=(x,z,s,r)=>{const i=o.kinds.length>1&&T.nz(x*.03+3,z*.03-8)>.45?(o.cluster||0):pick();lists[i].push([x,T.terr(x,z),z,s,r])};
 /* tree lines: rows at a set distance, gently staggered; the line steps back where it would crowd another part of the track */
 const step=4.6,bush=[],wob=(k,side)=>Math.max(0,T.nz(T.x[k]*.012+side*7,T.z[k]*.012-3)*.5+.5)*14;/* the edge wanders in and out, so it reads as woods, not an avenue */
 for(const side of[-1,1])for(let k=0;k<N;k++){if(inStart(k))continue;const k2=(k+1)%N,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),fx=T.x[k2]-T.x[k],fz=T.z[k2]-T.z[k],seg=Math.hypot(fx,fz)||1;
  for(let a=0;a<seg;a+=step){for(let r=0;r<o.rows;r++){if(rr()>(r<2?.9:.75))continue;const u=(a+(r%2)*step*.5+(rr()-.5)*3)/seg,l=side*(T.hw[k]+o.set+wob(k,side)+r*4.2+(rr()-.5)*3.2),x=T.x[k]+fx*u+c*l,z=T.z[k]+fz*u-s*l;
   if(dRoad(x,z)<o.set-2.5||!clear(x,z))continue;put(x,z,(r===0&&rr()<.3?.62:.85)+.4*(T.nz(x*.3,z*.3)*.5+.5)*rr()+.15*rr(),rr()*6)}
   /* undergrowth along the foot of the line hides the trunks */
   if(rr()<.75){const u=(a+rr()*step)/seg,l=side*(T.hw[k]+o.set+wob(k,side)-2+rr()*2),x=T.x[k]+fx*u+c*l,z=T.z[k]+fz*u-s*l;if(dRoad(x,z)>o.set-4&&clear(x,z))bush.push([x,T.terr(x,z),z,.8+rr()*.7,rr()*6])}}}
 /* copses further out: round clumps, so open ground between them reads as fields, not gaps */
 const[x0,x1,z0,z1]=T.bounds;for(let t=0;t<o.copses*30&&t<4000;t++){const cx=x0+(x1-x0)*rr(),cz=z0+(z1-z0)*rr(),d=dRoad(cx,cz);if(d<o.set+30)continue;const R=10+rr()*16,n=Math.round(R*R*.09);
  for(let q=0;q<n;q++){const a=rr()*6.283,rad=Math.sqrt(rr())*R,x=cx+Math.cos(a)*rad,z=cz+Math.sin(a)*rad;if(dRoad(x,z)<o.set+20||!clear(x,z))continue;put(x,z,(.9+.3*rr())*(1+.15*(1-rad/R)),rr()*6)}if(--o.copses<=0)break}
 o.kinds.forEach((k,i)=>k.build(g,lists[i]));
 if(bush.length)P.qMix(g,['bush1','bush2'],bush.map(p=>[p[0],p[1],p[2],p[3]*1.1,p[4]]),1.6,[0xffffff,0xe2ecda,0xd2dec8]);
 /* canopy card behind the rows, height easing in and out wherever it has to stop */
 if(window.PT8_RING_FOREST){const tx=new THREE.TextureLoader().load(window.PT8_RING_FOREST);tx.wrapS=THREE.RepeatWrapping;tx.encoding=THREE.sRGBEncoding;tx.anisotropy=4;
  const fm=new THREE.MeshBasicMaterial({map:tx,color:o.tint,alphaTest:.5,side:THREE.DoubleSide});const BACK=o.set+o.rows*4+8,Hh=o.cardH,rep=80;
  for(const side of[-1,1]){const pos=[],uv=[],idx=[],pt=[];
   for(let k=0;k<N;k+=3){const l=side*(T.hw[k]+BACK),c=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-sn*l;pt.push({k,x,z,y:terrainBed(T,x,z)-1,ok:!inStart(k)&&dRoad(x,z)>BACK-6&&clear(x,z)})}
   const M=pt.length,link=new Uint8Array(M);for(let q=0;q<M;q++){const a=pt[q],b=pt[(q+1)%M];if(!a.ok||!b.ok)continue;const dx=b.x-a.x,dz=b.z-a.z,dl=Math.hypot(dx,dz),tx_=Math.sin(T.psi[b.k]),tz_=Math.cos(T.psi[b.k]);if(dl>.5&&dl<T.sp*12&&(dx*tx_+dz*tz_)/dl>.35)link[q]=1}
   const runL=new Float32Array(M),runR=new Float32Array(M);for(let q=0;q<2*M;q++){const a=q%M,p=(a-1+M)%M;runL[a]=link[p]?Math.min(99,runL[p]+1):0}for(let q=2*M-1;q>=0;q--){const a=q%M,n=(a+1)%M;runR[a]=link[a]?Math.min(99,runR[n]+1):0}
   const hAt=a=>{const e=Math.min(runL[a],runR[a])/6;return Hh*(e>=1?1:e*e*(3-2*e))};let u=0;
   for(let q=0;q<M;q++){if(!link[q])continue;const a=pt[q],b=pt[(q+1)%M],dl=Math.hypot(b.x-a.x,b.z-a.z),v=pos.length/3,u1=u+dl/rep,ha=hAt(q),hb=hAt((q+1)%M);
    pos.push(a.x,a.y,a.z,b.x,b.y,b.z,b.x,b.y+hb,b.z,a.x,a.y+ha,a.z);uv.push(u,0,u1,0,u1,hb/Hh,u,ha/Hh);idx.push(v,v+1,v+2,v,v+2,v+3);u=u1}
   if(pos.length){const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);g.add(new THREE.Mesh(gg,fm))}}}
 /* horizon: swap the stock skyline (grey stands and chimneys) for painted hills */
 sc.traverse(m=>{if(m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop>1000&&m.material.map){const t=new THREE.CanvasTexture(o.pano());t.encoding=m.material.map.encoding;t.wrapS=THREE.RepeatWrapping;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;m.material.map=t;m.material.needsUpdate=true}});
}
/* painted hill horizon (4096 x 512, ground from y 352): ridges fade into the fog colour, tree texture along the nearer ridges */
function hillPano(seed,fogHex,layers,extra){const W=4096,H=512,hz=352,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
 const fog=new THREE.Color(fogHex),mix=(hex,t)=>'#'+new THREE.Color(hex).lerp(fog,t).getHexString();
 const sn=(x,ph,terms)=>{let v=0;for(const[k,a,p]of terms)v+=a*Math.sin(2*Math.PI*k*x/W+p+ph);return v};
 for(const L of layers){const ph=r()*6,terms=[[2,.5,r()*6],[5,.3,r()*6],[11,.16,r()*6],[23,.08,r()*6]],top=x=>L.base-L.amp*(.5+.5*sn(x,ph,terms));
  g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,top(x));g.lineTo(W,H);g.closePath();g.fillStyle=mix(L.col,L.fog);g.fill();
  if(L.trees){g.fillStyle=mix(L.tcol||L.col,L.fog*.9);for(let x=0;x<W;x+=L.trees*(.7+.6*r())){const y=top(x),w=L.trees*(1.1+r()*.8),h=w*(.9+r()*.5);g.beginPath();g.ellipse(x,y+h*.25,w*.7,h*.6,0,0,6.283);g.fill()}}
  if(L.fields){for(let i=0;i<L.fields;i++){const x=r()*W,w=60+r()*160,y=top(x)+6+r()*10;g.fillStyle=mix([0xb9a35c,0x8fae4a,0xa8b866][i%3],L.fog+.05);g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+2);g.lineTo(x+w-20,y+12);g.lineTo(x-14,y+10);g.closePath();g.fill()}}}
 if(extra)extra(g,W,H,hz,mix,r);
 const gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,mix(0x3d6a34,.25));gr.addColorStop(1,mix(0x4a7a3a,.1));g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);return cv}
P.circuitWoods=circuitWoods;P.hillPano=hillPano;
function dressRA(T,sc){
 const N=T.N,wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
 const rr=(()=>{let s=1234567;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();
 const lerp=(a,b,t)=>a+(b-a)*t;
 /* off the paving, everything sits on the real ground (never floats, never sinks under the grass) */
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-s*l,ry=T.y[k]-l*T.bank[k],ex=Math.abs(l)-T.hw[k];if(ex>1.2){/* sit on the ground the terrain mesh is built from, never on a raised road level */return[x,terrainBed(T,x,z)+(dy||0)+.03,z]}return[x,ry+(dy||0),z]};
 const g=new THREE.Group();g.name='raDress';
 /* no pyramid hills on the circuits: drop the stock backdrop cones */
 {const rm=[];sc.traverse(o=>{const q=o.geometry&&o.geometry.parameters;if(q&&o.geometry.type==='ConeGeometry'&&q.radius>=80)rm.push(o)});rm.forEach(o=>o.parent.remove(o))}
 /* corner indices on the sampled track */
 const M={};for(const k in RA.marks){const p=RA.pts[RA.marks[k]];M[k]=near(T,p[0]*RAK,p[1]*RAK)}
 /* curvature per sample (positive = turning left for the car, because lateral +l is the car's left) */
 const curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wrp(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 /* distance from road centre line for any x,z */
 const dRoad=(x,z)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16);let b=1e9;for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const dx=x-T.x[i],dz=z-T.z[i],d=Math.hypot(dx,dz)-T.hw[i];if(d<b)b=d}}return b>=1e9?999:Math.max(0,b)};
 /* ---- terrain: Georgia grass, red clay, mown verges, gravel run-offs ---- */
 let ter=null,most=0;sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.color&&o.geometry.attributes.position.count>most){most=o.geometry.attributes.position.count;ter=o}});
 if(ter){const pa=ter.geometry.attributes.position,ca=ter.geometry.attributes.color;
  for(let v=0;v<pa.count;v++){const x=pa.getX(v),z=pa.getZ(v),n=T.nz(x*2.1,z*2.1)*.5+.5,n2=T.nz(x*.55+90,z*.55-40)*.5+.5,n3=T.nz(x*1.3-30,z*1.3+10)*.5+.5,d=dRoad(x,z);
   let c=[.12+.08*n,.42+.13*n,.06+.04*n];
   if(n2>.68){const t=Math.min(1,(n2-.68)*7);c=[lerp(c[0],.4+.07*n3,t),lerp(c[1],.17+.04*n3,t),lerp(c[2],.08,t)]}
   if(d<26){const t=1-Math.min(1,Math.max(0,(d-9)/17));c=[lerp(c[0],.22+.07*n,t*.8),lerp(c[1],.5+.06*n,t*.8),lerp(c[2],.1,t*.8)]}
   if(d<9.5){c=[.2+.06*n,.46+.06*n,.1]}
   ca.setXYZ(v,c[0],c[1],c[2])}
  ca.needsUpdate=true}
 /* ---- materials ---- */
 const M_=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{}));
 const MB=c=>new THREE.MeshBasicMaterial({color:c});
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{/* wide strips are split into ~1.6 m bands so they follow the ground instead of bridging over it */const nb=Math.ceil((w1-w0)/1.6-1e-6);if(nb>1){let m;for(let j=0;j<nb;j++)m=strip1(ranges,side,lerp(w0,w1,j/nb),lerp(w0,w1,(j+1)/nb),dy,mt,vs);return m}return strip1(ranges,side,w0,w1,dy,mt,vs)},
  strip1=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,s0=side*(T.hw[k]+w0),s1=side*(T.hw[k]+w1),p0=at(k,s0,dy),p1=at(k,s1,dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 /* ---- corner ranges from curvature ---- */
 const corners=[];{let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0085;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>8)corners.push({a:s,b:i,dir:Math.sign(curv[Math.round((s+i)/2)])});s=-1}}}
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#e01a14':'#f4f4f4';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 curbTex.repeat.set(1,1);
 const inR=[],outR=[],inL=[],outL=[];
 for(const c of corners){const a=Math.max(0,c.a-3),b=c.b+3;/* inside of a left turn is +l */ (c.dir>0?inL:inR).push([a,b]);(c.dir>0?outR:outL).push([a+4,c.b-2])}
 /* kerbs ride on the road plane across their whole width (never on the ground beside it), a hair above the asphalt */
 const kerb=(ranges,side,w0,w1,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const[a,b]of ranges){const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);
    for(const w of[w0,w1]){const l=side*(T.hw[k]+w);pos.push(T.x[k]+c*l,T.y[k]-l*T.bank[k]+.1,T.z[k]-s*l)}uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);m.renderOrder=1;g.add(m);return m};
 kerb(inL,1,-.1,1.5,curbM,2.0);kerb(inR,-1,-.1,1.5,curbM,2.0);kerb(outL,1,-.1,1.2,curbM,2.0);kerb(outR,-1,-.1,1.2,curbM,2.0);
 /* paint-your-own gravel run-off strips on the outside of corners */
 const gm=M_(0x9a8460,{roughness:1});for(const c of corners){const a=Math.max(0,c.a-2),b=c.b+2;strip([[a,b]],c.dir>0?-1:1,2.4,11,.03,gm,6)}
 /* ---- guardrail: outside of corners, far from the racing line ---- */
 {const rail=M_(0xa9b2b6,{metalness:.5,roughness:.5,side:THREE.DoubleSide}),posts=[],pm=[];
  for(const c of corners){const side=c.dir>0?-1:1;const pos=[],idx=[];const a=c.a,b=c.b,n=b-a;for(let q=0;q<=n;q++){const k=(a+q)%N,l=side*(T.hw[k]+13);pos.push(...at(k,l,.55),...at(k,l,1.0));if(q%3===0)pm.push([...at(k,l,.5),1]);if(q<n&&P.addSeg){const p1=at(k,l,0),p2=at((a+q+1)%N,l,0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.3)}}
   for(let q=0;q<n;q++){const i=q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,rail))}
  if(pm.length)inst(g,new THREE.BoxGeometry(.14,1.1,.14),M_(0x77818a),pm)}
 /* ---- tyre walls at the slow corners ---- */
 {const L=[];for(const nm of['T7','T10a','T12','T4']){const k0=M[nm];if(k0==null)continue;const side=curv[k0]>0?-1:1;for(let q=-14;q<=14;q++){const k=(k0+q+N)%N,l=side*(T.hw[k]+16);for(let h=0;h<3;h++){const p=at(k,l,.3+h*.52);L.push([p[0],p[1],p[2],1,1,0]);if(h===0&&P.addPt)P.addPt(T,p[0],p[2],.6)}}}
  const im=inst(g,new THREE.CylinderGeometry(.55,.55,.5,8),M_(0x1c1e22),L)}
 /* ---- helper builders ---- */
 const seats=ctex(16,8,(x,w,h)=>{x.fillStyle='#8d949c';x.fillRect(0,0,w,h);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b'];for(let i=0;i<w;i+=2){x.fillStyle=pal[(i>>1)%4];x.fillRect(i,1,2,2);x.fillRect(i,5,2,2)}}),seatM=new THREE.MeshStandardMaterial({map:seats,roughness:.9});
 const stand=(k,l,len,rows)=>{const sg=l>0?1:-1,[px,py,pz]=at(k,l,0),grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);const top=Math.max(py-gy,0);
  for(let r=0;r<rows;r++){const h=top+1.2+r*.95,b=new THREE.Mesh(new THREE.BoxGeometry(2.4,h+3,len),seatM);b.position.set(sg*r*2.4,(h-3)/2,0);grp.add(b)}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(rows*2.4+1.5,.4,len+1.5),MB(0xe9e9e9));roof.position.set(sg*(rows*1.2-1.2),top+rows*.95+6.2,0);grp.add(roof);
  for(const sz of[-1,1])for(let q=0;q<=2;q++){const pl=new THREE.Mesh(new THREE.BoxGeometry(.35,rows*.95+6.5,.35),M_(0x9aa2a8));pl.position.set(sg*(rows*2.4-1.2),top+(rows*.95+6.5)/2-2,sz*len/2*(q/2)*(q?1:0)+(q===0?0:0));grp.add(pl)}
  return grp};
 const signCanvas=(txt,w,h,bg,fg,fs)=>ctex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=3;c.strokeRect(3,3,W-6,H-6);c.fillStyle=fg;c.font='bold '+(fs||Math.floor(H*.5))+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+2)});
 const board=(k,l,txt,wm,hm,bg,fg,yy)=>{const[px,py,pz]=at(k,l,0),grp=new THREE.Group();grp.position.set(px,py,pz);grp.rotation.y=T.psi[k]+PI;g.add(grp);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(.18,(yy||2.4)+hm/2,.18),M_(0x666d73));pl.position.set(0,(yy||2.4)/2+hm/4,0);grp.add(pl);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:signCanvas(txt,Math.max(64,Math.round(wm*40)),Math.max(32,Math.round(hm*40)),bg,fg),side:THREE.DoubleSide}));sg.position.set(0,(yy||2.4)+hm/2,.12);grp.add(sg);return grp};
 /* ---- corner boards ---- */
 const names={T1:'1',T3:'3',T4:'4',T5:'5',T6:'6',T7:'7',T10a:'10A',T10b:'10B',T11:'11',T12:'12'};
 for(const nm in names){const k0=M[nm];if(k0==null)continue;const side=curv[k0]>0?-1:1;board((k0-24+N)%N,side*(T.hw[k0]+6),names[nm],2.6,1.5,'#f2c76b','#10151b',2.2)}
 {const k0=M.E2;if(k0!=null)board((k0-18+N)%N,(curv[k0]>0?-1:1)*(T.hw[k0]+7),'THE ESSES',5.6,1.4,'#10151b','#f1f3f5',2.2)}
 /* ---- start / finish complex ---- */
 {const sg=(k,l)=>at(k,l,0);
  /* gantry */
  const kg=34,[gx,gy,gz]=at(kg,0,0),gp=new THREE.Group();gp.position.set(gx,gy,gz);gp.rotation.y=T.psi[kg]+PI;g.add(gp);const wd=T.hw[kg]+4;
  for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1,11,1),M_(0xd8392f));col.position.set(sx*wd,5.5,0);gp.add(col)}
  const beam=new THREE.Mesh(new THREE.BoxGeometry(wd*2+1,1.2,1.2),M_(0xf1f1f1));beam.position.set(0,10.8,0);gp.add(beam);
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.9,3.6),new THREE.MeshBasicMaterial({map:ctex(512,96,(c,W,H)=>{c.fillStyle='#d8392f';c.fillRect(0,0,W,H);c.fillStyle='#f1f1f1';c.fillRect(0,H-12,W,12);c.fillStyle='#f1f1f1';c.font='bold 62px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('ROAD ATLANTA',W/2,H/2-4)}),side:THREE.DoubleSide}));ban.position.set(0,8.6,.1);gp.add(ban);
  /* pit building (infield, right) and control tower */
  for(let q=0;q<6;q++){const[px,py,pz]=at(10+q*18,-(T.hw[10]+22),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[10+q*18];g.add(b);
   const bl=new THREE.Mesh(new THREE.BoxGeometry(9,4.2,17),M_(q%2?0xd7d9d4:0xc7cbc5));bl.position.y=2.1;b.add(bl);
   const rf=new THREE.Mesh(new THREE.BoxGeometry(10,.5,18),M_(0x2c3238));rf.position.y=4.4;b.add(rf);
   const dr=new THREE.Mesh(new THREE.BoxGeometry(.2,3,12),new THREE.MeshBasicMaterial({color:q%2?0x2c6cd0:0xd8392f}));dr.position.set(4.6,2,0);b.add(dr)}
  {const[px,py,pz]=at(6,-(T.hw[6]+44),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[6];g.add(b);const tw=new THREE.Mesh(new THREE.BoxGeometry(6,22,6),M_(0xe3e5e2));tw.position.y=11;b.add(tw);const cab=new THREE.Mesh(new THREE.BoxGeometry(9,3.4,9),M_(0x2c3a4a,{metalness:.2}));cab.position.y=23.4;b.add(cab);const cr=new THREE.Mesh(new THREE.BoxGeometry(10,.5,10),M_(0xd8392f));cr.position.y=25.4;b.add(cr)}
  /* main grandstand across the straight */
  stand(34,T.hw[34]+20,70,9);stand(115,T.hw[115]+20,44,7);
  /* flag poles + banners down both sides of the straight */
  const fl=[],pl=[];for(let k=8;k<150;k+=10)for(const sd of[-1,1]){const p=at(k,sd*(T.hw[k]+4.5),0);pl.push([p[0],p[1]+4,p[2],1,8,0]);fl.push([p[0],p[1]+7,p[2],1,1,T.psi[k]])}
  inst(g,new THREE.CylinderGeometry(.07,.09,1,5),M_(0xcfd3d6),pl);inst(g,new THREE.BoxGeometry(2.2,1.3,.05),new THREE.MeshBasicMaterial({color:0xd8392f}),fl.map((p,i)=>[p[0],p[1],p[2],1,1,p[5]])) }
 /* ---- T10 terrace + paddock stand + T11 footbridge ---- */
 {const k=M.T10a,side=curv[k]>0?-1:1;stand(k,side*(T.hw[k]+20),50,9);stand((M.T10b+12)%N,(curv[M.T10b]>0?-1:1)*(T.hw[M.T10b]+22),40,8)}
 {const k=M.T11,[bx,by,bz]=at(k,0,0),bp=new THREE.Group();bp.position.set(bx,by,bz);bp.rotation.y=T.psi[k];g.add(bp);const wd=T.hw[k]+7;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(wd*2,.7,4),M_(0x2c6cd0));deck.position.y=9.4;bp.add(deck);
  for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1.6,9.6,2.4),M_(0xe6e8ea));col.position.set(sx*wd,4.8,0);bp.add(col);const ramp=new THREE.Mesh(new THREE.BoxGeometry(14,.5,3),M_(0xcfd3d6));ramp.position.set(sx*(wd+7),4.7,0);ramp.rotation.z=sx*-.62;bp.add(ramp)}
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.5,1.6),new THREE.MeshBasicMaterial({map:signCanvas('ROAD ATLANTA',512,64,'#2c6cd0','#f1f1f1',34),side:THREE.DoubleSide}));ban.position.set(0,10.4,2.05);bp.add(ban);const ban2=ban.clone();ban2.position.z=-2.05;bp.add(ban2);
  const rail=new THREE.Mesh(new THREE.BoxGeometry(wd*2,.12,.12),M_(0xf1f1f1));for(const z of[-1.9,1.9]){const r=rail.clone();r.position.set(0,10.2,z);bp.add(r)}}
 /* ---- hospitality tents + billboards around the paddock ---- */
 for(let q=0;q<5;q++){const k=(60+q*22)%N,[px,py,pz]=at(k,-(T.hw[k]+60),0),tn=new THREE.Group();tn.position.set(px,T.terr(px,pz),pz);tn.rotation.y=T.psi[k];g.add(tn);const bd=new THREE.Mesh(new THREE.BoxGeometry(10,3,14),M_([0xf1f1f1,0xd8392f,0x2c6cd0,0xf2c76b,0xe9e9e9][q]));bd.position.y=1.5;tn.add(bd);const tp=new THREE.Mesh(new THREE.BoxGeometry(10.6,.5,14.6),M_(0xf1f1f1));tp.position.y=3.25;tn.add(tp)}
 /* ---- Georgia woods: loblolly pines (tall bare trunks, crowns on top) with hardwoods mixed in ---- */
 {const tm=M_(0x5a3b26),tint=(geo,mt,list,cols,f)=>{/* one mesh per colour: plain material colours survive the scene's mesh merging */const ob=new THREE.Object3D();cols.forEach((cc,ci)=>{const sub=list.filter((p,i)=>i%cols.length===ci);if(!sub.length)return;const im=new THREE.InstancedMesh(geo,cols.length>1||mt.color.getHex()===0xffffff?M_(cc):mt,sub.length);sub.forEach((p,i)=>{f(ob,p);ob.updateMatrix();im.setMatrixAt(i,ob.matrix)});g.add(im)})};
  circuitWoods(T,sc,g,{seed:4088,set:24,rows:4,copses:26,tint:0x5d7a60,cardH:20,start:[-40,Math.round(N*.06)],cluster:1,
   /* loblolly pines (tall, crowns high up) with hardwoods mixed in: Quaternius CC0 models from trees_q.js */
   kinds:[{w:.7,build:(g,L)=>P.qMix(g,['pine2','pine3','pine4'],L,[19,17,18],[0xffffff,0xe8f2dc,0xdbe6cf,0xf4fbe6])},
    {w:.3,build:(g,L)=>P.qMix(g,['oak4','oak3','umb2'],L,[12,13,12],[0xffffff,0xeef6dc,0xe2ecd2])}],
   pano:()=>hillPano(77,0xcfe0ea,[{base:300,amp:46,col:0x5e7d8c,fog:.62},{base:322,amp:34,col:0x4b6e58,fog:.5,trees:22},{base:340,amp:20,col:0x355a3a,fog:.34,trees:16}])})}
 styleScene(g);sc.add(g);
}
/* the Quarry world's tunnel does not belong on Road Atlanta (the look is borrowed, the tunnel slot is not) */
const ssRA=sampleTrack;sampleTrack=d=>{const T=ssRA(d);if(d.ra&&T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}return T};
const bwRA=buildWorld;
buildWorld=T=>{const sc=bwRA(T);if(T.d&&T.d.ra){try{dressRA(T,sc)}catch(e){console.error('roadAtlanta dress',e)}}return sc};
})();
