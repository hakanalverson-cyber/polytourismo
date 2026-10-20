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
function build(sc,T,cfg){
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
 if(!best)return null;
 const k=best.k,rx=at(k,best.side*(hw(k)+3)),dirx=rx[0]-best.x,dirz=rx[1]-best.z,dl=Math.hypot(dirx,dirz),fx=dirx/dl,fz=dirz/dl,yaw=Math.atan2(fx,fz);
 const pre=sc.children.slice();
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
 const doors=[];for(const sd of[-1,1]){const piv=new THREE.Group();piv.position.set(sd*dw/2,0,D/2+.2);const dr=new THREE.Mesh(new THREE.BoxGeometry(dw/2,3.55,.14),M_(0x9b4a37));dr.position.set(-sd*dw/4,1.8,0);piv.add(dr);
  const xb=new THREE.Mesh(new THREE.BoxGeometry(dw/2*1.05,.16,.18),trim);xb.position.set(-sd*dw/4,1.8,.02);xb.rotation.z=sd*.7;piv.add(xb);g.add(piv);doors.push({piv,sd})}
 /* fence posts and the trail */
 const L=pt=>[pt[0],pt[1]];
 const nT=40,pts=[];for(let i=0;i<=nT;i++){const u=i/nT,l=best.side*(hw(k)+2.4+(best.off-2.4+6)*u),wig=Math.sin(u*PI*2.2)*5*Math.sin(u*PI),[px,pz]=at(k,l),a=T.psi[k];pts.push([px+Math.sin(a)*wig*(u>.04?1:0),pz+Math.cos(a)*wig*(u>.04?1:0)])}
 /* the last stretch bends in to meet the barn doors */
 const tp=[];for(let i=0;i<=nT;i++){const u=i/nT,p=pts[i],bx=best.x+fx*(D/2+3),bz=best.z+fz*(D/2+3),w=Math.pow(u,3);tp.push([p[0]*(1-w)+bx*w,p[1]*(1-w)+bz*w])}
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
 for(let i=3;i<nT-9;i+=4)for(const sd of[-1,1]){const a=tp[i-1],b=tp[i+1],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1,x=tp[i][0]+(-tz/tl)*3.2*sd,z=tp[i][1]+(tx/tl)*3.2*sd;
  const post=new THREE.Mesh(new THREE.BoxGeometry(.18,1.3,.18),M_(0x5a4634));post.position.set(x,T.terr(x,z)+.55,z);post.rotation.set((i%3-1)*.07,0,(i%5-2)*.06);sc.add(post)}
 /* a faded sign where the trail leaves the road */
 {const[sx,sz]=at(k,best.side*(hw(k)+4.2)),sg=new THREE.Group();sg.position.set(sx,T.terr(sx,sz),sz);sc.add(sg);const pl=new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,.12),M_(0x5a4634));pl.position.y=.9;sg.add(pl);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.0,.5,.07),M_(0xb9a27a));bd.position.set(0,1.6,0);bd.rotation.z=.08;sg.add(bd)}
 /* the real thing is the pack's barn: shown closed until the reveal, then swapped for the open-door barn while the screen is black */
 let pk=null;{const q=P.BLD&&P.BLD.Barn_02;if(q&&!found){pk=new THREE.Mesh(q.g.clone(),P.PROPKIT.MAT);pk.castShadow=true;pk.receiveShadow=true;g.add(pk);shell.forEach(o=>o.visible=false);doors.forEach(d=>d.piv.visible=false)}}
 const door={x:best.x+fx*(D/2+2.5),z:best.z+fz*(D/2+2.5)};
 const light=new THREE.PointLight(0xffd9a0,0,18,1.6);light.position.set(0,3.2,1);g.add(light);
 B={pk,shell,cfg,g,doors,light,car:null,found,x:best.x,z:best.z,y:best.y,fx,fz,yaw,door,D,sc,T};
 /* a found barn stays open and empty */
 if(found){doors.forEach(d=>d.piv.rotation.y=d.sd*1.75)}
 return B}
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
function startScene(){if(BN||!B||B.found)return;const car=B.car||barnCar();if(!car)return;B.car=car;if(B.pk){B.pk.visible=false;B.shell.forEach(o=>o.visible=true);B.doors.forEach(d=>d.piv.visible=true)}car.g.visible=true;
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
