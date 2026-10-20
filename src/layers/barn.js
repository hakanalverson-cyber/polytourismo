/* ===== Poly Tourismo v9 layer: barn finds (hidden trails, locked barns, a car reveal, cars you cannot buy) ===== */
(function v9barn(){
'use strict';
const P=window.PT8,PI=Math.PI;
/* map name -> which car sleeps there and roughly where to look along the lap */
const BARNS={'Quarry Circuit':{car:'c29',frac:.30,side:1},'Canyon Viaduct':{car:'c66',frac:.55,side:-1},'Coastal Run':{car:'c130',frac:.40,side:1},'Alpine Pass':{car:'c44',frac:.62,side:-1}};
P.BARNS=BARNS;P.BARN_IDS=Object.values(BARNS).map(b=>b.car);
P.CARS.forEach(c=>{if(P.BARN_IDS.includes(c.id))c.barn=true});
const sv=()=>P.SV();
P.barnFound=id=>!!(sv().barn&&sv().barn[id]);
/* cars that live in barns never show up in Brand Central or in CPU fields */
{const mk=P.makeAI;P.makeAI=function(){return mk.apply(this,arguments).map(a=>P.BARN_IDS.includes(a.id)?Object.assign(a,{id:'merc'}):a)}}
let B=null;/* barn in the current race */
const M_=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.92,metalness:0,flatShading:true},o||{}));
function site(T,cfg){
 const N=T.N,hw=k=>T.hw[k],at=(k,l)=>{const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);return[T.x[k]+c*l,T.z[k]-s*l]};
 /* find calm, empty ground to one side of the road, not close to any other stretch of track */
 let best=null;
 for(let f=0;f<30;f++){const k=Math.floor(N*((cfg.frac+f*.031)%1));{let bad=false;for(let q=-6;q<=6;q++){const i=(k+q+N)%N;if((T.gap&&T.gap[i])||(T.br&&T.br[i])||(T.wall&&T.wall[i])||(T.tn&&T.tn[i]))bad=true}if(bad)continue}
  for(const side of[cfg.side,-cfg.side])for(const off of[60,70,82]){const l=side*(hw(k)+off),[x,z]=at(k,l),ty=T.terr(x,z);
   let sl=0;for(const[dx,dz]of[[9,0],[-9,0],[0,9],[0,-9],[7,7],[-7,-7]])sl=Math.max(sl,Math.abs(T.terr(x+dx,z+dz)-ty));
   let pm=0;for(let u=.1;u<1;u+=.15){const[px,pz]=at(k,side*(hw(k)+3+(off-3)*u));pm=Math.max(pm,Math.abs(T.terr(px,pz)-(T.y[k]+(ty-T.y[k])*u)))}
   let dmin=1e9;for(let i=0;i<N;i+=3){const d=Math.hypot(T.x[i]-x,T.z[i]-z)-hw(i);if(d<dmin)dmin=d}
   const dy=Math.abs(ty-T.y[k]);if(dy>7||dmin<40)continue;
   const sc_=sl*3+pm*1.2+dy*.4+f*.15;if(!best||sc_<best.s)best={s:sc_,k,side,off,x,z,y:ty}}}
 return best}
function build(sc,T,cfg){
 const N=T.N,hw=k=>T.hw[k],at=(k,l)=>{const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);return[T.x[k]+c*l,T.z[k]-s*l]};
 const best=T.barnSite||site(T,cfg);if(!best)return null;
 const k=best.k,rx=at(k,best.side*(hw(k)+3)),dirx=rx[0]-best.x,dirz=rx[1]-best.z,dl=Math.hypot(dirx,dirz),fx=dirx/dl,fz=dirz/dl,yaw=Math.atan2(fx,fz);
 const pre=sc.children.slice();
 /* the ground around the barn was graded flat when the track was sampled (see grade()), so the barn sits level on real terrain */
 const lw=(x,z)=>[best.x+x*fz+z*fx,best.z-x*fx+z*fz];
 const flatY=best.y;
 const padY=(x,z)=>{const[wx,wz]=lw(x,z);return T.terr(wx,wz)+.06};
 const padY0=(wx,wz)=>{const dx=wx-best.x,dz=wz-best.z;return padY(dx*fz-dz*fx,dx*fx+dz*fz)};
 {const XM=14,Z0=-11,Z1=20,st=2,xs=[],zs=[];for(let x=-XM;x<=XM+.01;x+=st)xs.push(x);for(let z=Z0;z<=Z1+.01;z+=st)zs.push(z);
  const pos=[],uv=[],idx=[];zs.forEach((z,j)=>xs.forEach((x,i)=>{const[wx,wz]=lw(x,z);pos.push(wx,T.terr(wx,wz)+.07,wz);uv.push(i/(xs.length-1),j/(zs.length-1))}));
  for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;idx.push(a,c,b,b,c,d)}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));pg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));pg.setIndex(idx);pg.computeVertexNormals();
  const cv=document.createElement('canvas');cv.width=cv.height=64;{const c=cv.getContext('2d'),gr=c.createRadialGradient(32,32,8,32,32,31);gr.addColorStop(0,'rgba(150,124,88,1)');gr.addColorStop(.62,'rgba(150,124,88,.95)');gr.addColorStop(1,'rgba(150,124,88,0)');c.fillStyle=gr;c.fillRect(0,0,64,64)}
  const tx=new THREE.CanvasTexture(cv);
  const pm=new THREE.Mesh(pg,new THREE.MeshStandardMaterial({map:tx,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));pm.receiveShadow=true;sc.add(pm)}
 const g=new THREE.Group();g.position.set(best.x,best.y,best.z);g.rotation.y=yaw;sc.add(g);
 const found=P.barnFound(cfg.car);
 /* barn shell, 9 wide x 13 deep, door end toward the road (+z in local space) */
 const wood=M_(0xb81212),dark=M_(0x2a2420),trim=M_(0xededed),roof=M_(0x35373c,{roughness:.8}),floor=M_(0x3a3430);
 const box=(w,h,d,m,x,y,z)=>{const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);g.add(q);return q};
 const W=9.2,D=12.8,H=4.4;
 box(W+1.2,.3,D+1.2,floor,0,.1,0);
 const sh0=g.children.length;
 box(.3,H,D,wood,-W/2,H/2,0);box(.3,H,D,wood,W/2,H/2,0);box(W,H,.3,wood,0,H/2,-D/2);
 /* front wall with a wide door opening */
 const dw=4.8;box((W-dw)/2,H,.3,wood,-(W+dw)/4,H/2,D/2);box((W-dw)/2,H,.3,wood,(W+dw)/4,H/2,D/2);box(dw,H-3.6,.3,wood,0,3.6+(H-3.6)/2,D/2);
 /* gable roof */
 const rl=Math.hypot(W/2+.6,2.8),ra=Math.atan2(2.8,W/2+.6);
 for(const sd of[-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(rl,.22,D+1.2),roof);r.position.set(sd*(W/4+.2),H+1.35,0);r.rotation.z=-sd*ra;g.add(r)}
 const gab=new THREE.Shape();gab.moveTo(-W/2,0);gab.lineTo(W/2,0);gab.lineTo(0,2.8);gab.closePath();
 for(const z of[-D/2,D/2]){const gm=new THREE.Mesh(new THREE.ShapeGeometry(gab),wood);gm.position.set(0,H,z+(z>0?.16:-.16));if(z<0)gm.rotation.y=PI;g.add(gm)}
 box(dw+.4,.25,.4,trim,0,3.65,D/2+.1);box(.25,3.6,.4,trim,-dw/2-.1,1.8,D/2+.1);box(.25,3.6,.4,trim,dw/2+.1,1.8,D/2+.1);
 const shell=g.children.slice(sh0);
 /* doors: hinged at the outer posts, swing open outward */
 const doors=[];for(const sd of[-1,1]){const piv=new THREE.Group();piv.position.set(sd*dw/2,0,D/2+.2);const dr=new THREE.Mesh(new THREE.BoxGeometry(dw/2,3.55,.14),M_(0xb81212));dr.position.set(-sd*dw/4,1.8,0);piv.add(dr);
  const xb=new THREE.Mesh(new THREE.BoxGeometry(dw/2*1.05,.16,.18),trim);xb.position.set(-sd*dw/4,1.8,.02);xb.rotation.z=sd*.7;piv.add(xb);g.add(piv);doors.push({piv,sd})}
 /* fence posts and the trail */
 const L=pt=>[pt[0],pt[1]];
 const nT=40,pts=[];for(let i=0;i<=nT;i++){const u=i/nT,l=best.side*(hw(k)+2.4+(best.off-2.4+6)*u),wig=Math.sin(u*PI*2.2)*5*Math.sin(u*PI),[px,pz]=at(k,l),a=T.psi[k];pts.push([px+Math.sin(a)*wig*(u>.04?1:0),pz+Math.cos(a)*wig*(u>.04?1:0)])}
 /* the last stretch bends in to meet the barn doors */
 const tp=[];{const iS=Math.round(nT*.8),G=lw(0,38),Dr=lw(0,D/2+.6);for(let i=0;i<=nT;i++){if(i<=iS){const u_=i/iS,w=u_*u_*(3-2*u_),p=pts[i];tp.push([p[0]*(1-w)+G[0]*w,p[1]*(1-w)+G[1]*w])}else{const t=(i-iS)/(nT-iS);tp.push([G[0]+(Dr[0]-G[0])*t,G[1]+(Dr[1]-G[1])*t])}}}
 {const pos=[],uv=[],idx=[];for(let i=0;i<=nT;i++){const a=tp[Math.max(0,i-1)],b=tp[Math.min(nT,i+1)],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1,nx=-tz/tl,nz=tx/tl,wd=1.9-.5*(i/nT),p=tp[i];
   for(const sd of[-1,1]){const x=p[0]+nx*wd*sd,z=p[1]+nz*wd*sd;pos.push(x,T.terr(x,z)+.09+.04*(i/nT),z);uv.push(sd>0?1:0,i*.25)}}
  for(let i=0;i<nT;i++){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2)}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();
  const tm=new THREE.Mesh(gg,new THREE.MeshStandardMaterial({color:0x7d6444,roughness:1,flatShading:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));sc.add(tm)}
 /* keep the way to the barn clear: hide or remove props, trees and solids near the trail */
 {const segs=[];for(let i=0;i<nT;i++)segs.push([tp[i],tp[i+1]]);const rd=at(k,best.side*(hw(k)+.2));segs.unshift([rd,tp[0]]);
  const dseg=(x,z)=>{let m=1e9;for(const[a,b]of segs){const vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l2));m=Math.min(m,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t))}return m};
  const bad=(x,z)=>dseg(x,z)<6.5||Math.hypot(x-best.x,z-best.z)<14;
  const mt=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);
  for(const o of pre){if(o.isInstancedMesh){let ch=false;for(let j=0;j<o.count;j++){o.getMatrixAt(j,mt);const e=mt.elements;if(bad(e[12],e[14])){o.setMatrixAt(j,zero);ch=true}}if(ch)o.instanceMatrix.needsUpdate=true}
   else if(o.isMesh||o.isGroup){if(o.position&&bad(o.position.x,o.position.z)&&o.position.y>-50&&!(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.scale.x>100))o.visible=false}}
  /* fence rails/posts are merged into one 'lines' mesh: cut a gap where the trail crosses */
 for(const o of pre){if(o.isMesh&&o.userData&&o.userData.ptProp==='lines'&&o.geometry&&o.geometry.attributes.position&&!o.geometry.index){const g=o.geometry,pa=g.attributes.position,ca=g.attributes.color,n=pa.count,keepP=[],keepC=[];
   for(let t=0;t+2<n;t+=3){const cx=(pa.getX(t)+pa.getX(t+1)+pa.getX(t+2))/3,cz=(pa.getZ(t)+pa.getZ(t+1)+pa.getZ(t+2))/3;if(dseg(cx,cz)<8.6||Math.hypot(cx-best.x,cz-best.z)<16)continue;for(let q=0;q<3;q++){keepP.push(pa.getX(t+q),pa.getY(t+q),pa.getZ(t+q));if(ca)keepC.push(ca.getX(t+q),ca.getY(t+q),ca.getZ(t+q))}}
   const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(keepP,3));if(ca)ng.setAttribute('color',new THREE.Float32BufferAttribute(keepC,3));ng.computeVertexNormals();o.geometry=ng}}
 if(T.solids)T.solids=T.solids.filter(q=>!(q&&isFinite(q.x)&&isFinite(q.z)&&bad(q.x,q.z)))}
 /* post-and-rail fence: lines the trail and closes the yard into a paddock, leaving the trail end open as a gate */
 {const pm_=M_(0x4a3626),rm_=M_(0x8a6c4a),pg_=new THREE.BoxGeometry(.26,1.35,.26),rg_=new THREE.BoxGeometry(1,.14,.08),fg=new THREE.Group(),up=new THREE.Vector3(1,0,0);sc.add(fg);
  const run_=pts=>{let prev=null;for(const[x,z]of pts){const y=Math.max(T.terr(x,z),padY0(x,z)),po=new THREE.Mesh(pg_,pm_);po.position.set(x,y+.55,z);po.castShadow=true;fg.add(po);
   if(prev){const dx=x-prev[0],dz=z-prev[2],dy=y-prev[1],len=Math.hypot(dx,dy,dz);for(const h of[.35,.7,1.05]){const r=new THREE.Mesh(rg_,rm_);r.scale.x=len;r.castShadow=true;r.position.set((x+prev[0])/2,(y+prev[1])/2+h,(z+prev[2])/2);r.quaternion.setFromUnitVectors(up,new THREE.Vector3(dx,dy,dz).normalize());fg.add(r)}}prev=[x,y,z]}};
  for(const sd of[-1,1]){const arr=[];for(let i=Math.round(nT*.8);i<nT;i+=1){const a=tp[Math.max(0,i-2)],b=tp[Math.min(nT,i+2)],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1;{const px=tp[i][0]+(-tz/tl)*3.4*sd,pz=tp[i][1]+(tx/tl)*3.4*sd,ddx=px-best.x,ddz=pz-best.z;if(ddx*fx+ddz*fz<18.5)break;arr.push([px,pz])}}arr.push(lw(sd*3.4,17));run_(arr)}
  /* paddock around the barn (local frame): back + both sides, front pieces either side of the gate */
  const FX=12,FZ0=-10,FZ1=17,pts_=[],seg=(x0,z0,x1,z1)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/3.6)),o=[];for(let i=0;i<=n;i++){const[wx,wz]=lw(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n);o.push([wx,wz])}return o};
  run_(seg(-3.4,FZ1,-FX,FZ1).concat(seg(-FX,FZ1,-FX,FZ0).slice(1),seg(-FX,FZ0,FX,FZ0).slice(1),seg(FX,FZ0,FX,FZ1).slice(1),seg(FX,FZ1,3.4,FZ1).slice(1)))}
 /* yard dressing from the pack: hay, crates, a well, trees and bushes around the barn, clear of the trail */
 if(P.BLD&&P.PROPKIT){const dress=[['Haystack_04',8,-3,.4],['Haystack_01',9.5,-.6,-.3],['Haystack_02',-8.6,-4.5,1],['WoodenCrates_01',-7.2,6,.3],['WoodenCrates_01',-8.3,7.4,-.4],['Well_02',7.8,9,0],['AnimalFeeder_01',-9,-1,1.57],['Tree_07',-14,-2,0],['Tree_04',13.5,4,1],['Tree_05',-13,12,2],['Tree_02',14,-8,3],['Bush_01',-10,10,0],['Bush_02',10.5,-7,1],['Bush_01',-11,-8,2],['Bush_02',11,13,0]];
  for(const[nm,lx,lz,ry]of dress){const q=P.BLD[nm];if(!q)continue;const m=new THREE.Mesh(q.g.clone(),P.PROPKIT.MAT);m.position.set(lx,padY(lx,lz)-.06-flatY,lz);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;g.add(m)}}
 /* a faded sign beside the trail mouth, well off the line of travel */
 {const a_=tp[1],b_=tp[3],tx=b_[0]-a_[0],tz=b_[1]-a_[1],tl=Math.hypot(tx,tz)||1,sx=tp[2][0]+(-tz/tl)*5.6,sz=tp[2][1]+(tx/tl)*5.6,sg=new THREE.Group();sg.position.set(sx,T.terr(sx,sz),sz);sg.rotation.y=Math.atan2(-tz,-tx)+PI/2;sc.add(sg);const pl=new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,.12),M_(0x5a4634));pl.position.y=.9;sg.add(pl);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.0,.5,.07),M_(0xb9a27a));bd.position.set(0,1.6,0);sg.add(bd)}
 /* the real thing is the pack's barn: shown closed until the reveal, then swapped for the open-door barn while the screen is black */
 let pk=null,pkMat=null;{const q=P.BLD&&P.BLD.Barn_02;if(q){pkMat=P.PROPKIT.MAT.clone();pkMat.side=THREE.DoubleSide;pk=new THREE.Mesh(q.g.clone(),pkMat);pk.castShadow=true;pk.receiveShadow=true;g.add(pk);shell.forEach(o=>o.visible=false);doors.forEach(d=>d.piv.visible=false);R.localClippingEnabled=true}}
 const door={x:best.x+fx*(D/2+2.5),z:best.z+fz*(D/2+2.5)};
 const light=new THREE.PointLight(0xffd9a0,0,18,1.6);light.position.set(0,3.2,1);g.add(light);
 B={pk,pkMat,shell,cfg,g,doors,light,car:null,found,x:best.x,z:best.z,y:best.y,fx,fz,yaw,door,D,sc,T};
 /* a found barn stays open and empty */
 if(found)openPk(B);
 return B}
function openPk(b){if(!b.pk)return;b.g.updateMatrixWorld(true);const m_=b.g.matrixWorld,bx=[[1,0,0,-2.7],[-1,0,0,-2.7],[0,1,0,-4.3],[0,-1,0,0],[0,0,1,-9],[0,0,-1,5.6]];b.pkMat.clippingPlanes=bx.map(([nx,ny,nz,c])=>new THREE.Plane(new THREE.Vector3(nx,ny,nz),c).applyMatrix4(m_));b.pkMat.clipIntersection=true;b.pkMat.needsUpdate=true}
/* level the ground under and around the barn: a gentle cut/fill pad blended into the hills (before any mesh or prop samples the terrain) */
function grade(T,cfg){const best=site(T,cfg);if(!best)return;
 const k=best.k,rx=(()=>{const c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),l=best.side*(T.hw[k]+3);return[T.x[k]+c*l,T.z[k]-s*l]})(),dx=rx[0]-best.x,dz=rx[1]-best.z,dl=Math.hypot(dx,dz),fx=dx/dl,fz=dz/dl;
 let sum=0,n=0;for(let x=-5;x<=5;x+=2.5)for(let z=-7;z<=7;z+=2.5){sum+=T.terr(best.x+x*fz+z*fx,best.z-x*fx+z*fz);n++}
 best.y=sum/n+.05;T.barnSite=best;const t0=T.terr,fy=best.y;
 T.terr=(x,z)=>{const h=t0(x,z),ddx=x-best.x,ddz=z-best.z,lx=ddx*fz-ddz*fx,lz=ddx*fx+ddz*fz,ax=Math.max(0,Math.abs(lx)-7.5),az=lz<-8.5?-8.5-lz:Math.max(0,lz-14),d=Math.hypot(ax,az);if(d>16)return h;const w=1-Math.min(1,d/16),e=w*w*(3-2*w);return h+(fy-h)*e}}
const ssB=sampleTrack;sampleTrack=function(d){const T=ssB.apply(this,arguments);try{const cfg=BARNS[d&&d.name];if(cfg&&!d.gravel&&!T.barnSite)grade(T,cfg)}catch(e){console.error('barn grade',e)}return T};
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);B=null;try{const cfg=BARNS[T.d&&T.d.name];if(cfg&&!(T.d&&T.d.gravel))build(sc,T,cfg)}catch(e){console.error('barn',e)}return sc};
P.barnInfo=()=>B&&{x:B.x,y:B.y,z:B.z,door:B.door,yaw:B.yaw,found:B.found};
P.barnT=t=>{if(BN)BN.t=t};
P.nearBarn=c=>!!(B&&Math.hypot(c.x-B.x,c.z-B.z)<150);
/* ---------- prompt ---------- */
let pr=null;
function prompt(on){if(!pr){pr=document.createElement('div');pr.id='barnPrompt';pr.innerHTML='<kbd>SPACEBAR</kbd><span>Open the barn</span>';document.body.appendChild(pr)}pr.style.opacity=on?1:0}
/* ---------- reveal scene ---------- */
let BN=null;const bcam=new THREE.PerspectiveCamera(52,16/9,.2,8000);
let fade=null,card=null;
const fadeEl=()=>{if(!fade){fade=document.createElement('div');fade.id='bnFade';document.body.appendChild(fade)}return fade};
function barnCar(){const id=B.cfg.car,idx=P.modelOf(id,0),src=CAR_MODELS[idx];if(!src)return null;
 const model=src.clone(true),grp=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);grp.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl||4.4)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);grp.scale.setScalar(k);grp.rotation.y=(sz.x>sz.z?PI/2:0)+PI+.3;
 grp.position.set(0,.27,-1.1);B.g.add(grp);return{g:grp}}
function startScene(){if(BN||!B||B.found)return;const car=B.car||barnCar();if(!car)return;B.car=car;openPk(B);car.g.visible=true;
 BN={t:0,ph:0,cardUp:false};RACE.cars.forEach(c=>{if(c.m&&c.m.g)c.m.g.visible=false});document.body.classList.add('barnscene');const f=fadeEl();f.style.transition='opacity .6s';f.style.opacity=1;if(P.sfx)P.sfx('whoosh');prompt(false)}
function endScene(){const id=B.cfg.car,s=sv();s.owned[id]=(s.owned[id]||0)|1;s.barn=s.barn||{};s.barn[id]=1;P.save();B.found=true;if(card)card.style.display='none';
 BN.ph=4;BN.t=0;const f=fadeEl();f.style.transition='opacity .6s';f.style.opacity=1}
function tickScene(dt){const N_=BN;N_.t+=dt;const f=fadeEl();
 if(N_.ph===0&&N_.t>.7){N_.ph=1;N_.t=0;f.style.transition='opacity 1.6s';f.style.opacity=0}
 if(N_.ph===1){const o=Math.max(0,Math.min(1,(N_.t-1.4)/1.8)),e=o*o*(3-2*o);B.doors.forEach(d=>d.piv.rotation.y=d.sd*1.75*e);B.light.intensity=2.6*e;if(o>0&&!N_.snd){N_.snd=1;if(P.sfx)P.sfx('back')}
  if(N_.t>5&&!N_.cardUp){N_.cardUp=true;showCard()}if(N_.t>5.2)N_.ph=2}
 if(N_.ph===4&&N_.t>.8){document.body.classList.remove('barnscene');const f2=fadeEl();f2.style.transition='opacity 1s';f2.style.opacity=0;BN=null;RACE.cars.forEach(c=>{if(c.m&&c.m.g)c.m.g.visible=true})}}
function showCard(){if(!card){card=document.createElement('div');card.id='bnCard';document.body.appendChild(card)}const c=P.BYID[B.cfg.car];
 card.innerHTML=`<small>BARN FIND</small><h2>${c.name}</h2><p>${c.type} &middot; ${Math.round(c.mphG||0)} mph</p><div class="bn-add">Added to your garage</div><span><kbd>SPACEBAR</kbd> Continue</span>`;card.style.display='flex'}
const stp=step;step=dt=>{if(BN){tickScene(dt);return}stp(dt);const Rc=RACE;if(!B||B.found||!Rc||Rc.state!=='race'||Rc.cfg.rally){prompt(false);return}
 let near=false;for(const c of Rc.cars)if(c.human&&!c.fin&&Math.hypot(c.x-B.door.x,c.z-B.door.z)<9)near=true;prompt(near)};
const drw=drawRace;drawRace=function(dt){if(BN&&B){const sy=Math.sin(B.yaw),cy=Math.cos(B.yaw),t=BN.t+(BN.ph>=1?.7:0),dist=15-Math.min(7,t*1.1);
  const gx=B.x,gz=B.z;bcam.position.set(gx+sy*(B.D/2+dist)+cy*1.4,B.y+2.4,gz+cy*(B.D/2+dist)-sy*1.4);bcam.lookAt(gx+sy*(B.D/2-3),B.y+1.2,gz+cy*(B.D/2-2));bcam.aspect=Math.max(.1,R.domElement.width/R.domElement.height);bcam.updateProjectionMatrix();
  R.setScissorTest(false);R.setViewport(0,0,R.domElement.width,R.domElement.height);R.clear();R.render(RACE.scene,bcam);return}
 return drw.apply(this,arguments)};
addEventListener('keydown',e=>{if(e.code!=='Space')return;if(BN){if(BN.cardUp&&BN.ph===2){e.preventDefault();e.stopImmediatePropagation();endScene()}else{e.preventDefault();e.stopImmediatePropagation()}return}
 if(pr&&pr.style.opacity==='1'&&B&&!B.found&&RACE&&RACE.state==='race'){e.preventDefault();e.stopImmediatePropagation();startScene()}},true);
/* leaving the race clears the barn */
const cr=P.cleanupRace;P.cleanupRace=function(){B=null;BN=null;document.body.classList.remove('barnscene');if(pr)pr.style.opacity=0;const f=document.getElementById('bnFade');if(f)f.style.opacity=0;return cr.apply(this,arguments)};
})();
