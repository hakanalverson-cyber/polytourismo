/* ===== Poly Tourismo v9 layer: tracks3 (circuit-mode tracks: Road Atlanta) ===== */
(function v9tracks3(){
'use strict';
const P=window.PT8,RA=window.PT8_RA;
if(!RA)return;
const PI=Math.PI;
const roadAtl={id:14,look:0,name:'Road Atlanta',desc:'braselton georgia / uphill T1 / esses / T10 / T12 dive',hw:7.5,bank:14,off:'grass',idw:.85,offs:0,amp:3,up:5,shoulder:17,
 sky:[0x3f86d2,0xcfe4f4],fog:0xcfe0ea,sun:0xfff0d0,hemi:[0xd4e8f8,0x4f7a3c],road:'#3b3d43',tod0:'day',ra:1,
 pts:RA.pts,walls:[],ice:[],boost:[],jumps:[]};
D.push(roadAtl);
P.TRACK_INFO.push({s:'TARMAC',tags:['ESSES','UPHILL T1','T10 COMPLEX','T12 DIVE']});
P.TRK_TRACKS=[D.length-1];
P.RA=RA;

/* ---------------- Road Atlanta dressing ---------------- */
const hex=h=>'#'+h.toString(16).padStart(6,'0');
function near(T,x,z){let b=1e9,bi=0;for(let i=0;i<T.N;i++){const d=(T.x[i]-x)**2+(T.z[i]-z)**2;if(d<b){b=d;bi=i}}return bi}
function dressRA(T,sc){
 const N=T.N,wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
 const rr=(()=>{let s=1234567;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();
 const lerp=(a,b,t)=>a+(b-a)*t;
 const at=(k,l,dy)=>{k=((k%N)+N)%N;const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);return[T.x[k]+c*l,T.y[k]-l*T.bank[k]+(dy||0),T.z[k]-s*l]};
 const g=new THREE.Group();g.name='raDress';
 /* corner indices on the sampled track */
 const M={};for(const k in RA.marks){const p=RA.pts[RA.marks[k]];M[k]=near(T,p[0],p[1])}
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
 const strip=(ranges,side,w0,w1,dy,mt,vs)=>{const pos=[],uv=[],idx=[];let base=0;for(const r of ranges){const[a,b]=r;const n=((b-a)%N+N)%N;for(let q=0;q<=n;q++){const k=(a+q)%N,s0=side*(T.hw[k]+w0),s1=side*(T.hw[k]+w1),p0=at(k,s0,dy),p1=at(k,s1,dy);pos.push(...p0,...p1);uv.push(0,q*T.sp/vs,1,q*T.sp/vs)}
   for(let q=0;q<n;q++){const i=base+q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=(n+1)*2}
  if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mt);g.add(m);return m};
 /* ---- corner ranges from curvature ---- */
 const corners=[];{let s=-1;for(let i=0;i<N;i++){const on=Math.abs(curv[i])>.0085;if(on&&s<0)s=i;if(!on&&s>=0){if(i-s>8)corners.push({a:s,b:i,dir:Math.sign(curv[Math.round((s+i)/2)])});s=-1}}}
 const curbTex=ctex(2,8,(x,w,h)=>{for(let j=0;j<8;j++){x.fillStyle=j<4?'#d8392f':'#f1f1f1';x.fillRect(0,j,w,1)}}),curbM=new THREE.MeshStandardMaterial({map:curbTex,roughness:.8,side:THREE.DoubleSide});
 curbTex.repeat.set(1,1);
 const inR=[],outR=[],inL=[],outL=[];
 for(const c of corners){const a=Math.max(0,c.a-3),b=c.b+3;/* inside of a left turn is +l */ (c.dir>0?inL:inR).push([a,b]);(c.dir>0?outR:outL).push([a+4,c.b-2])}
 strip(inL,1,.9,2.6,.075,curbM,2.8);strip(inR,-1,.9,2.6,.075,curbM,2.8);strip(outL,1,.9,2.2,.072,curbM,2.8);strip(outR,-1,.9,2.2,.072,curbM,2.8);
 /* paint-your-own gravel run-off strips on the outside of corners */
 const gm=M_(0x9a8460,{roughness:1});for(const c of corners){const a=Math.max(0,c.a-2),b=c.b+2;strip([[a,b]],c.dir>0?-1:1,2.4,11,.03,gm,6)}
 /* ---- guardrail: outside of corners, far from the racing line ---- */
 {const rail=M_(0xa9b2b6,{metalness:.5,roughness:.5,side:THREE.DoubleSide}),posts=[],pm=[];
  for(const c of corners){const side=c.dir>0?-1:1;const pos=[],idx=[];const a=c.a,b=c.b,n=b-a;for(let q=0;q<=n;q++){const k=(a+q)%N,l=side*(T.hw[k]+13);pos.push(...at(k,l,.55),...at(k,l,1.0));if(q%3===0)pm.push([...at(k,l,.5),1])}
   for(let q=0;q<n;q++){const i=q*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();g.add(new THREE.Mesh(gg,rail))}
  if(pm.length)inst(g,new THREE.BoxGeometry(.14,1.1,.14),M_(0x77818a),pm)}
 /* ---- tyre walls at the slow corners ---- */
 {const L=[];for(const nm of['T7','T10a','T12','T4']){const k0=M[nm];if(k0==null)continue;const side=curv[k0]>0?-1:1;for(let q=-14;q<=14;q++){const k=(k0+q+N)%N,l=side*(T.hw[k]+16);for(let h=0;h<3;h++){const p=at(k,l,.3+h*.52);L.push([p[0],p[1],p[2],1,1,0])}}}
  const im=inst(g,new THREE.CylinderGeometry(.55,.55,.5,8),M_(0x1c1e22),L)}
 /* ---- pine forest ---- */
 {const pines=[],pines2=[],round=[];const x0=T.bounds[0]+8,x1=T.bounds[1]-8,z0=T.bounds[2]+8,z1=T.bounds[3]-8;
  for(let t=0;t<9000&&pines.length+pines2.length<1400;t++){const x=lerp(x0,x1,rr()),z=lerp(z0,z1,rr()),d=dRoad(x,z);if(d<18)continue;const cl=T.nz(x*.4,z*.4)*.5+.5;if(d<45&&rr()>.55)continue;if(cl<.3&&d<90&&rr()>.35)continue;const h=T.terr(x,z),s=.8+rr()*.9;(rr()<.5?pines:pines2).push([x,h,z,s,0,rr()*6])}
  for(let t=0;t<2500&&round.length<160;t++){const x=lerp(x0,x1,rr()),z=lerp(z0,z1,rr()),d=dRoad(x,z);if(d<26)continue;round.push([x,T.terr(x,z),z,1+rr()*.8,0,rr()*6])}
  const trunk=new THREE.CylinderGeometry(.22,.34,2.2,5),cone=(a,b)=>new THREE.ConeGeometry(a,b,7);
  const tm=M_(0x4a2f1e);inst(g,trunk,tm,pines.concat(pines2).map(p=>[p[0],p[1]+1.1*p[3],p[2],p[3]]));
  inst(g,cone(2.4,5.2),M_(0x1d5a33),pines.map(p=>[p[0],p[1]+4.2*p[3],p[2],p[3],0,p[5]]));inst(g,cone(1.7,4),M_(0x246b3b),pines.map(p=>[p[0],p[1]+7.2*p[3],p[2],p[3],0,p[5]]));
  inst(g,cone(2.6,6),M_(0x2a6a3a),pines2.map(p=>[p[0],p[1]+4.6*p[3],p[2],p[3],0,p[5]]));inst(g,cone(1.8,4.2),M_(0x347a45),pines2.map(p=>[p[0],p[1]+8*p[3],p[2],p[3],0,p[5]]));
  inst(g,new THREE.CylinderGeometry(.3,.4,3,5),tm,round.map(p=>[p[0],p[1]+1.5*p[3],p[2],p[3]]));inst(g,new THREE.IcosahedronGeometry(2.8,0),M_(0x4d8b2f),round.map(p=>[p[0],p[1]+4.6*p[3],p[2],p[3],0,p[5]]))}
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
 for(let q=0;q<5;q++){const k=(60+q*22)%N,[px,py,pz]=at(k,-(T.hw[k]+60),0),tn=new THREE.Group();tn.position.set(px,T.terr(px,pz),pz);tn.rotation.y=T.psi[k];g.add(tn);const bd=new THREE.Mesh(new THREE.BoxGeometry(10,3,14),M_([0xf1f1f1,0xd8392f,0x2c6cd0,0xf2c76b,0xe9e9e9][q]));bd.position.y=1.5;tn.add(bd);const tp=new THREE.Mesh(new THREE.ConeGeometry(8.5,3,4),M_(0xf1f1f1));tp.position.y=4.5;tp.rotation.y=PI/4;tn.add(tp)}
 styleScene(g);sc.add(g);
}
/* the Quarry world's tunnel does not belong on Road Atlanta (the look is borrowed, the tunnel slot is not) */
const ssRA=sampleTrack;sampleTrack=d=>{const T=ssRA(d);if(d.ra&&T.tunnels&&T.tunnels.length){for(const[a,b]of T.tunnels)for(let i=a;i<=b;i++){const k=i%T.N;T.tn[k]=0;T.wall[k]=0;T.wh[k]=1.3}T.tunnels=[]}return T};
const bwRA=buildWorld;
buildWorld=T=>{const sc=bwRA(T);if(T.d&&T.d.ra){try{dressRA(T,sc)}catch(e){console.error('roadAtlanta dress',e)}}return sc};
})();
