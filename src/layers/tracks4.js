/* ===== Poly GT layer: tracks4 (circuit-mode track: Imola, the real circuit's layout shrunk and dressed as a proper race track) ===== */
(function v9tracks4(){
'use strict';
const P=window.PT8,IM=window.PT8_IMOLA;
if(!IM||!P.TRK_TRACKS)return;
const PI=Math.PI,IMK=1,IMY=1;/* data is already at real size (4,909 m lap, 1 unit = 1 m) */
const imola={id:15,look:0,name:'Imola',desc:'italian grand prix circuit / chicanes / sand traps / tyre walls',hw:7.4,bank:12,off:'grass',idw:.85,offs:0,amp:2.6,up:4,shoulder:17,
 sky:[0x3f86d2,0xcfe4f4],fog:0xcfe0ea,sun:0xfff0d0,hemi:[0xd4e8f8,0x4f7a3c],road:'#3b3d43',tod0:'day',imola:1,
 pts:IM.pts.map(q=>[q[0]*IMK,q[1]*IMK,q[2]*IMY,q[3]]),walls:[],ice:[],boost:[],jumps:[]};
D.push(imola);
P.TRACK_INFO.push({s:'TARMAC',tags:['CHICANES','SAND TRAPS','TYRE WALLS','KERBS']});
P.TRK_TRACKS.push(D.length-1);
P.MEDAL_REF[D.length-1]=98.5;
MATS.sandtrap={grip:.42,top:.5,acc:.4};
const IMX=D.length-1;

/* ---------- track data: corners, sand traps, trap-aware surface ---------- */
const wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
function cornersOf(T){const N=T.N,curv=new Float32Array(N);for(let i=0;i<N;i++)curv[i]=wrp(T.psi[(i+5)%N]-T.psi[(i-5+N)%N])/(10*T.sp);
 const corners=[];let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0105;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>6){let pk=0,pi=s;for(let q=s;q<i;q++)if(Math.abs(curv[q])>pk){pk=Math.abs(curv[q]);pi=q}corners.push({a:s,b:i,dir:Math.sign(curv[pi]),pk,pi})}s=-1}}
 let tot=0;for(let i=0;i<N;i++)tot+=curv[i];return{curv,corners,left:tot>=0?1:-1}}
const ssI=sampleTrack;sampleTrack=d=>{const T=ssI(d);if(!d.imola)return T;
 if(T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}
 const C=cornersOf(T);T._im=C;const N=T.N;T.trapS=new Int8Array(N);
 for(const c of C.corners){const side=c.dir>0?-1:1;for(let q=c.a-3;q<=c.b+6;q++)T.trapS[((q%N)+N)%N]=side}
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y);if(r.road)return r;const cx=Math.floor(x/16),cz=Math.floor(z/16);let bd=1e9,bi=-1,bl=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+cz+b);if(!ids)continue;for(const i of ids){const j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((x-T.x[i])*dx+(z-T.z[i])*dz)/l2)),px=T.x[i]+dx*f,pz=T.z[i]+dz*f,dd=Math.hypot(x-px,z-pz);if(dd<bd){bd=dd;bi=i;bl=(x-px)*Math.cos(T.psi[i])-(z-pz)*Math.sin(T.psi[i])}}}
  if(bi>=0&&T.trapS[bi]&&Math.sign(bl)===T.trapS[bi]){const ex=Math.abs(bl)-T.hw[bi];if(ex>2.3&&ex<13.6)r.trap=1}
  return r};
 return T};

/* ---------- dressing ---------- */
function dressIM(T,sc){
 const N=T.N,C=T._im||cornersOf(T),curv=C.curv,corners=C.corners,infield=C.left;/* +1: infield is the car's left */
 const rr=(()=>{let s=7654321;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();
 const lerp=(a,b,t)=>a+(b-a)*t;
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),x=T.x[k]+c*l,z=T.z[k]-s*l,ry=T.y[k]-l*T.bank[k],ex=Math.abs(l)-T.hw[k];if(ex>1.2){/* sit on the ground the terrain mesh is built from, never on a raised road level */return[x,terrainBed(T,x,z)+(dy||0)+.03,z]}return[x,ry+(dy||0),z]};
 const g=new THREE.Group();g.name='imolaDress';
 {const rm=[];sc.traverse(o=>{const q=o.geometry&&o.geometry.parameters;if(q&&o.geometry.type==='ConeGeometry'&&q.radius>=80)rm.push(o)});rm.forEach(o=>o.parent.remove(o))}
 const dRoad=(x,z)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16);let b=1e9;for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const d=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(d<b)b=d}}return b>=1e9?999:Math.max(0,b)};
 /* terrain: bright arcade green, mown stripes near the road */
 let ter=null,most=0;sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.color&&o.geometry.attributes.position.count>most){most=o.geometry.attributes.position.count;ter=o}});
 if(ter){const pa=ter.geometry.attributes.position,ca=ter.geometry.attributes.color;
  for(let v=0;v<pa.count;v++){const x=pa.getX(v),z=pa.getZ(v),n=T.nz(x*2.1,z*2.1)*.5+.5,n2=T.nz(x*.55+90,z*.55-40)*.5+.5,d=dRoad(x,z);
   let c=[.16+.08*n,.5+.12*n,.1+.04*n];if(n2>.7){const t=Math.min(1,(n2-.7)*6);c=[lerp(c[0],.45,t),lerp(c[1],.4,t),lerp(c[2],.18,t)]}
   if(d<30){const st=((Math.floor(x/9)+Math.floor(z/9))&1)?.05:-.03;const t=1-Math.min(1,Math.max(0,(d-10)/20));c=[lerp(c[0],.26+st,t*.85),lerp(c[1],.6+st,t*.85),lerp(c[2],.14,t*.85)]}
   if(d<10){const st=((Math.floor(x/7)+Math.floor(z/7))&1)?.04:-.02;c=[.24+st,.58+st,.12]}
   ca.setXYZ(v,c[0],c[1],c[2])}
  ca.needsUpdate=true}
 const M_=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{}));
 const MB=c=>new THREE.MeshBasicMaterial({color:c});
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{/* wide strips are split into ~1.6 m bands so they follow the ground instead of bridging over it */const nb=Math.ceil((w1-w0)/1.6-1e-6);if(nb>1){let m;for(let j=0;j<nb;j++)m=strip1(ranges,side,lerp(w0,w1,j/nb),lerp(w0,w1,(j+1)/nb),dy,mt,vs);return m}return strip1(ranges,side,w0,w1,dy,mt,vs)},
  strip1=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,p0=at(k,side*(T.hw[k]+w0),dy),p1=at(k,side*(T.hw[k]+w1),dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 /* kerbs: red/white on the inside of every corner, a short outside kerb on exit */
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#e01a14':'#f4f4f4';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide});
 const inR=[],outR=[],inL=[],outL=[];
 for(const c of corners){const a=Math.max(0,c.a-3),b=c.b+3;(c.dir>0?inL:inR).push([a,b]);(c.dir>0?outR:outL).push([a+4,c.b-2])}
 strip(inL,1,.9,2.6,.075,curbM,2.0);strip(inR,-1,.9,2.6,.075,curbM,2.0);strip(outL,1,.9,2.2,.072,curbM,2.0);strip(outR,-1,.9,2.2,.072,curbM,2.0);
 /* SAND TRAPS on the outside of every corner (really slow: cars bog down in them) with a rake-line pattern */
 const sandTex=ctex(32,32,(x,w,h)=>{x.fillStyle='#e6d29b';x.fillRect(0,0,w,h);x.fillStyle='#d4bd80';for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1);x.fillStyle='#f1e3b4';for(let j=2;j<h;j+=8)x.fillRect(0,j,w,1)});
 const sandM=new THREE.MeshStandardMaterial({map:sandTex,roughness:1,side:THREE.DoubleSide});sandTex.wrapS=sandTex.wrapT=THREE.RepeatWrapping;
 sandM.polygonOffset=true;sandM.polygonOffsetFactor=-2;sandM.polygonOffsetUnits=-2;for(const c of corners){const side=c.dir>0?-1:1,a=Math.max(0,c.a-3),b=c.b+6;for(let w=2.4;w<13.4;w+=2.2)strip([[a,b]],side,w,Math.min(13.5,w+2.2),.14,sandM,8)}
 /* guardrail on the outside of corners (past the sand), concrete wall along the pit straight */
 {const rail=M_(0xa9b2b6,{metalness:.5,roughness:.5,side:THREE.DoubleSide}),pm=[];
  for(const c of corners){const side=c.dir>0?-1:1;const pos=[],idx=[],a=c.a,b=c.b+6,n=b-a;for(let q=0;q<=n;q++){const k=(a+q)%N,l=side*(T.hw[k]+16);pos.push(...at(k,l,.55),...at(k,l,1.05));if(q%3===0)pm.push([...at(k,l,.5),1]);if(q<n&&P.addSeg){const p1=at(k,l,0),p2=at((a+q+1)%N,l,0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.3)}}
   for(let q=0;q<n;q++){const i=q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,rail))}
  if(pm.length)inst(g,new THREE.BoxGeometry(.14,1.1,.14),M_(0x77818a),pm)}
 /* TYRE WALLS: the sharpest corners get a thick stacked wall just behind the sand, painted blocks of white and red */
 {const sharp=corners.slice().sort((a,b)=>b.pk-a.pk).slice(0,6),B=[],W=[],R=[];
  for(const c of sharp){const side=c.dir>0?-1:1;for(let q=c.a-4;q<=c.b+8;q++){const k=((q%N)+N)%N,blk=Math.floor(q/4)%5;for(let row=0;row<2;row++){const l=side*(T.hw[k]+14.8+row*1.05);for(let h=0;h<3;h++){const p=at(k,l,.28+h*.52);const L=(blk===0?W:blk===3?R:B);L.push([p[0],p[1],p[2],1,1,0])}}
    if(P.addSeg&&q<c.b+8){const p1=at(k,side*(T.hw[k]+15.3),0),p2=at(k+1,side*(T.hw[k+1]+15.3),0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.9)}}}
  const cg=new THREE.CylinderGeometry(.55,.55,.5,9);inst(g,cg,M_(0x1b1d21),B);inst(g,cg,M_(0xf1f1f1),W);inst(g,cg,M_(0xd8392f),R)}
 /* pit wall + concrete barrier on the start straight (both sides, solid) */
 {const cm=M_(0xc9ccc9,{side:THREE.DoubleSide}),top=M_(0xd8392f);const K0=-10,K1=Math.round(N*.075);
  for(const side of[-1,1]){const l=side*(T.hw[0]+6.2),pos=[],idx=[];for(let q=K0;q<=K1;q++){const k=((q%N)+N)%N;pos.push(...at(k,l,0),...at(k,l,1.1))}for(let q=0;q<K1-K0;q++){const i=q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,cm));
   for(let q=K0;q<K1;q+=1){if(P.addSeg){const p1=at(q,l,0),p2=at(q+1,l,0);P.addSeg(T,p1[0],p1[2],p2[0],p2[2],.35)}}}}
 /* trees: round and cypress, kept away from the road and the traps */
 {const round=[],cyp=[],x0=T.bounds[0]+8,x1=T.bounds[1]-8,z0=T.bounds[2]+8,z1=T.bounds[3]-8;
  for(let t=0;t<9000&&round.length+cyp.length<1100;t++){const x=lerp(x0,x1,rr()),z=lerp(z0,z1,rr()),d=dRoad(x,z);if(d<24)continue;if(d<50&&rr()>.5)continue;const cl=T.nz(x*.4,z*.4)*.5+.5;if(cl<.3&&d<90&&rr()>.35)continue;(rr()<.62?round:cyp).push([x,T.terr(x,z),z,.8+rr()*.9,0,rr()*6])}
  const tm=M_(0x4a2f1e);inst(g,new THREE.CylinderGeometry(.22,.34,2.2,5),tm,round.concat(cyp).map(p=>[p[0],p[1]+1.1*p[3],p[2],p[3]]));
  inst(g,new THREE.IcosahedronGeometry(2.6,0),M_(0x4f9a35),round.map(p=>[p[0],p[1]+4.2*p[3],p[2],p[3],p[3]*.9,p[5]]));inst(g,new THREE.IcosahedronGeometry(1.9,0),M_(0x62ac40),round.map(p=>[p[0]+.6,p[1]+5.6*p[3],p[2]-.4,p[3],p[3]*.9,p[5]]));
  inst(g,new THREE.ConeGeometry(1.5,7,6),M_(0x2c6a3a),cyp.map(p=>[p[0],p[1]+4.5*p[3],p[2],p[3],p[3],p[5]]))}
 /* helpers */
 const seats=ctex(16,8,(x,w,h)=>{x.fillStyle='#8d949c';x.fillRect(0,0,w,h);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b'];for(let i=0;i<w;i+=2){x.fillStyle=pal[(i>>1)%4];x.fillRect(i,1,2,2);x.fillRect(i,5,2,2)}}),seatM=new THREE.MeshStandardMaterial({map:seats,roughness:.9});
 const stand=(k,l,len,rows)=>{const sg=l>0?1:-1,[px,py,pz]=at(k,l,0),grp=new THREE.Group(),gy=T.terr(px,pz);grp.position.set(px,gy,pz);grp.rotation.y=T.psi[k];g.add(grp);const top=Math.max(py-gy,0);
  for(let r=0;r<rows;r++){const h=top+1.2+r*.95,b=new THREE.Mesh(new THREE.BoxGeometry(2.4,h+3,len),seatM);b.position.set(sg*r*2.4,(h-3)/2,0);grp.add(b)}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(rows*2.4+1.5,.4,len+1.5),MB(0xe9e9e9));roof.position.set(sg*(rows*1.2-1.2),top+rows*.95+6.2,0);grp.add(roof);
  for(const sz of[-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(.35,rows*.95+6.5,.35),M_(0x9aa2a8));pl.position.set(sg*(rows*2.4-1.2),top+(rows*.95+6.5)/2-2,sz*len/2);grp.add(pl)}
  if(P.addSeg){const a=Math.cos(T.psi[k]),b=Math.sin(T.psi[k]);}
  return grp};
 const signCanvas=(txt,w,h,bg,fg,fs)=>ctex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=3;c.strokeRect(3,3,W-6,H-6);c.fillStyle=fg;c.font='bold '+(fs||Math.floor(H*.5))+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+2)});
 const board=(k,l,txt,wm,hm,bg,fg,yy)=>{const[px,py,pz]=at(k,l,0),grp=new THREE.Group();grp.position.set(px,py,pz);grp.rotation.y=T.psi[k]+PI;g.add(grp);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(.18,(yy||2.4)+hm/2,.18),M_(0x666d73));pl.position.set(0,(yy||2.4)/2+hm/4,0);grp.add(pl);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:signCanvas(txt,Math.max(64,Math.round(wm*40)),Math.max(32,Math.round(hm*40)),bg,fg),side:THREE.DoubleSide}));sg.position.set(0,(yy||2.4)+hm/2,.12);grp.add(sg);return grp};
 /* corner numbers + brake boards + marshal posts */
 corners.forEach((c,i)=>{const side=c.dir>0?-1:1;board((c.a-14+N)%N,side*(T.hw[c.a]+5),String(i+1),2.4,1.5,'#f2c76b','#10151b',2.1);
  const k=c.pi,[mx,my,mz]=at(k,side*(T.hw[k]+18.5),0),mp=new THREE.Group();mp.position.set(mx,my,mz);mp.rotation.y=T.psi[k];g.add(mp);
  const hut=new THREE.Mesh(new THREE.BoxGeometry(2,2.2,2),M_(0xf2c76b));hut.position.y=1.1;mp.add(hut);const rf=new THREE.Mesh(new THREE.BoxGeometry(2.6,.3,2.6),M_(0xd8392f));rf.position.y=2.3;mp.add(rf);const fp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.4,5),M_(0xcfd3d6));fp.position.set(1.1,3.7,0);mp.add(fp);const fl=new THREE.Mesh(new THREE.BoxGeometry(.05,.7,1.1),MB([0xf2c76b,0xffffff,0x2c6cd0][i%3]));fl.position.set(1.1,5.2,.55);mp.add(fl)});
 /* start/finish: gantry, painted line + grid boxes, pit row, tower, stands, footbridge, advert boards */
 {  /* grid boxes behind the line */
  /* exactly where gridSlot() puts the cars: row = slot>>1 at -(5+row*5) samples, lateral +-0.36 x hw[0] */
  for(let row=0;row<6;row++){const k=(((-(5+row*5))%N)+N)%N;for(const s of[-1,1]){const[bx,by,bz]=at(k,s*T.hw[0]*.36,.09),bx2=new THREE.Mesh(new THREE.PlaneGeometry(3.1,5.4),MB(0xf1f1f1));bx2.rotation.x=-PI/2;bx2.rotation.order='YXZ';bx2.rotation.y=T.psi[k];bx2.position.set(bx,by,bz);g.add(bx2);
     const inn=new THREE.Mesh(new THREE.PlaneGeometry(2.7,5),MB(0x3b3d43));inn.rotation.copy(bx2.rotation);inn.position.set(bx,by+.012,bz);g.add(inn)}}
  /* pit buildings on the infield side */
  const is=infield;for(let q=0;q<6;q++){const k=(10+q*10)%N,[px,py,pz]=at(k,is*(T.hw[k]+17),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[k];g.add(b);
   const bl=new THREE.Mesh(new THREE.BoxGeometry(9,4.2,9),M_(q%2?0xd7d9d4:0xc7cbc5));bl.position.y=2.1;b.add(bl);const rf=new THREE.Mesh(new THREE.BoxGeometry(10,.5,10),M_(0x2c3238));rf.position.y=4.4;b.add(rf);
   const dr=new THREE.Mesh(new THREE.BoxGeometry(.2,3,6.5),new THREE.MeshBasicMaterial({color:q%2?0x2c6cd0:0xd8392f}));dr.position.set(-is*4.6,2,0);b.add(dr);if(P.addPt){P.addPt(T,px,pz,5.2)}}
  {const k=3,[px,py,pz]=at(k,is*(T.hw[k]+32),0),b=new THREE.Group();b.position.set(px,T.terr(px,pz),pz);b.rotation.y=T.psi[k];g.add(b);const tw=new THREE.Mesh(new THREE.BoxGeometry(6,22,6),M_(0xe3e5e2));tw.position.y=11;b.add(tw);const cab=new THREE.Mesh(new THREE.BoxGeometry(9,3.4,9),M_(0x2c3a4a,{metalness:.2}));cab.position.y=23.4;b.add(cab);const cr=new THREE.Mesh(new THREE.BoxGeometry(10,.5,10),M_(0xd8392f));cr.position.y=25.4;b.add(cr);if(P.addPt)P.addPt(T,px,pz,4.2)}
  stand(8,-infield*(T.hw[8]+20),60,9);stand(Math.round(N*.06),-infield*(T.hw[0]+20),40,7);
  const fl=[],pl=[];for(let k=4;k<Math.round(N*.075);k+=7)for(const sd of[-1,1]){const p=at(k,sd*(T.hw[k]+4.5),0);pl.push([p[0],p[1]+4,p[2],1,8,0]);fl.push([p[0],p[1]+7,p[2],1,1,T.psi[k]])}
  inst(g,new THREE.CylinderGeometry(.07,.09,1,5),M_(0xcfd3d6),pl);inst(g,new THREE.BoxGeometry(2.2,1.3,.05),MB(0xd8392f),fl)}
 /* footbridge over the straight */
 {const k=Math.round(N*.045),[bx,by,bz]=at(k,0,0),bp=new THREE.Group();bp.position.set(bx,by,bz);bp.rotation.y=T.psi[k];g.add(bp);const wd=T.hw[k]+7;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(wd*2,.7,4),M_(0x2c6cd0));deck.position.y=9.4;bp.add(deck);
  for(const sx of[-1,1]){const col=new THREE.Mesh(new THREE.BoxGeometry(1.6,9.6,2.4),M_(0xe6e8ea));col.position.set(sx*wd,4.8,0);bp.add(col)}
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(wd*1.5,1.6),new THREE.MeshBasicMaterial({map:signCanvas('IMOLA',512,64,'#2c6cd0','#f1f1f1',34),side:THREE.DoubleSide}));ban.position.set(0,10.4,2.05);bp.add(ban);const b2=ban.clone();b2.position.z=-2.05;bp.add(b2)}
 /* advert boards along the straights' outside edge */
 {const txt=['POLY GT','TURBO','APEX','RACE ON'],bg=['#d8392f','#2c6cd0','#f2c76b','#10151b'],fg=['#f1f1f1','#f1f1f1','#10151b','#f2c76b'];let q=0;
  for(let k=Math.round(N*.1);k<N-6;k+=14){let st=true;for(let d=-3;d<=3;d++)if(Math.abs(curv[(k+d+N)%N])>.006)st=false;if(!st)continue;const side=-infield;board(k,side*(T.hw[k]+11),txt[q%4],5.2,1.7,bg[q%4],fg[q%4],1.1);q++}}
 /* tyre stacks as cones marking the pit exit, small detail */
 styleScene(g);sc.add(g);
}
const bwI=buildWorld;buildWorld=T=>{const sc=bwI(T);if(T.d&&T.d.imola){try{dressIM(T,sc)}catch(e){console.error('imola dress',e)}}return sc};
})();
