/* ===== Poly GT layer: Highway Cut-Up riders from the Summer People pack (Studio Ochi, supplied by Hakan; embedded as PEOPLE_B64 in
   BIKES / PACKS builds, never in the repo). The pack is rigged but carries no animation clips, so every frame the bones are posed here:
   the torso and head as rigid groups, arms and legs by two-bone IK onto the grips and pegs, each bone turned from its bind pose
   by the swing between the bind segment frame and the posed one (so the skin never twists). Without the pack, bkworld.js's
   low-poly rider stays. ===== */
(function bkPeople(){
'use strict';
const P=window.PT8;if(!P||!P.BK||typeof THREE==='undefined')return;const BK=P.BK;
const V=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0),Q=()=>new THREE.Quaternion();
/* the six grown-ups in the pack (mesh order in the file) */
/* x: where each one stands in the file (metres along x), which is how they are told apart */
BK.PEOPLE=[{x:5,n:'Sam'},{x:2,n:'Rosa'},{x:3,n:'Theo'},{x:1,n:'Lena'},{x:4,n:'Marco'},{x:0,n:'Mia'}];
let PEO=null,peoP=null;
BK.loadPeople=()=>peoP||(peoP=new Promise(res=>{const b64=window.PEOPLE_B64;if(!b64||!THREE.GLTFLoader){res(null);return}
 try{const raw=atob(b64),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
  const cib=window.createImageBitmap;window.createImageBitmap=undefined;/* textures through <img> (see hpack.js) */
  try{new THREE.GLTFLoader().parse(u.buffer,'',g=>{try{PEO=prep(g)}catch(e){console.warn('people',e)}res(PEO)},e=>{console.warn('people',e);res(null)})}finally{window.createImageBitmap=cib}}
 catch(e){console.warn('people',e);res(null)}}));
{const lp0=BK.loadPack;BK.loadPack=()=>Promise.all([lp0(),BK.loadPeople()]).then(r=>r[0])}

/* the bones by role: names lose their dots and gain _<n> in the loader */
const role=n=>n.replace(/_\d+$/,'').replace(/\./g,'');
const ROLES=['spine','spine001','spine002','spine003','spine004','spine005','spine006','thighL','shinL','footL','toeL','thighR','shinR','footR','toeR',
 'shoulderL','upper_armL','forearmL','handL','shoulderR','upper_armR','forearmR','handR'];
function prep(g){const out=[];const meshes=[];g.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o)});
 /* mesh order in the file = the order the scene lists them */
 meshes.forEach((sm,mi)=>{const sk=sm.skeleton,n=sk.bones.length,bw=[],bp=[],bq=[],par=new Int16Array(n).fill(-1),idx={};
  for(let i=0;i<n;i++){const M=new THREE.Matrix4().copy(sk.boneInverses[i]).invert(),p=V(),q=Q(),s=V();M.decompose(p,q,s);bw.push(M);bp.push(p);bq.push(q);idx[role(sk.bones[i].name)]=i}
  for(let i=0;i<n;i++){const pa=sk.bones[i].parent;const j=sk.bones.indexOf(pa);par[i]=j}
  const miss=ROLES.filter(r=>idx[r]==null);if(miss.length){console.warn('people: missing bones',mi,miss);return}
  const J=r=>bp[idx[r]];
  /* the bind body frame: up +Y, left from the thighs, forward from the feet */
  const left=V().subVectors(J('thighL'),J('thighR'));left.y=0;left.normalize();const fwd=V().crossVectors(left,V(0,1,0)).negate();
  if(V().subVectors(J('toeL'),J('footL')).dot(fwd)<0)fwd.negate();
  const hipC=V().addVectors(J('thighL'),J('thighR')).multiplyScalar(.5);
  /* hands and fingers ride with the forearm, toes and heels with the foot: everything below a driven bone follows it rigidly */
  const L=(a,b)=>J(a).distanceTo(J(b));
  const T={sm,idx,bp,bq,par,n,left,fwd,hipC,neck:J('spine004').clone(),
   len:{th:L('thighL','shinL'),sh:L('shinL','footL'),ua:L('upper_armL','forearmL'),fa:L('forearmL','handL')},
   h:Math.max(...bp.map(p=>p.y))-Math.min(...bp.map(p=>p.y))};
  /* round 13: seated, the thighs swing 90 degrees and drag the back of the hips out into a spike (linear skinning). Hand the thigh weight of
     the vertices behind the hip joints over to the pelvis, so the seat of the trousers stays with the hips */
  {const g=sm.geometry,Ji=g.attributes.skinIndex,Wt=g.attributes.skinWeight,Ps=g.attributes.position,pel=idx.spine,th=new Set([idx.thighL,idx.thighR]),v=V(),SG=['setX','setY','setZ','setW'];
   for(let i=0;i<Ji.count;i++){v.fromBufferAttribute(Ps,i);const d=V().subVectors(v,hipC).dot(fwd);if(d>-.005||v.y<hipC.y-.22||v.y>hipC.y+.12)continue;
    const k=Math.min(1,(-d-.005)/.06)*Math.min(1,(v.y-(hipC.y-.22))/.08);let moved=0,pk=-1;
    for(let c=0;c<4;c++){const b=Ji[GC[c]](i),w=Wt[GC[c]](i);if(th.has(b)&&w>0){Wt[SG[c]](i,w*(1-k));moved+=w*k}if(b===pel)pk=c}
    if(moved<=0)continue;if(pk<0){let lo=9,lc=0;for(let c=0;c<4;c++){const w=Wt[GC[c]](i);if(w<lo){lo=w;lc=c}}pk=lc;Ji[SG[pk]](i,pel);moved+=lo;Wt[SG[pk]](i,0)}
    Wt[SG[pk]](i,Wt[GC[pk]](i)+moved)}Wt.needsUpdate=true;Ji.needsUpdate=true}
  /* the forearm-and-hand part of the skin (and the legs) for the rider's own head camera, which must not see the head and body */
  T.armGeo=subGeo(sm.geometry,sk,new Set(['forearmL','forearmR','handL','handR','upper_armL','upper_armR','thighL','thighR','shinL','shinR','footL','footR','toeL','toeR'].map(r=>idx[r])),idx,par);
  out[mi]=T});
 return out}
/* the triangles whose vertices all mostly follow the given bones (or their children) */
const GC=['getX','getY','getZ','getW'];
function subGeo(geo,sk,keep,idx,par){const n=sk.bones.length,under=new Uint8Array(n);for(let i=0;i<n;i++){let j=i;while(j>=0){if(keep.has(j)){under[i]=1;break}j=par[j]}}
 const J=geo.attributes.skinIndex,W=geo.attributes.skinWeight,vc=J.count,ok=new Uint8Array(vc);
 for(let v=0;v<vc;v++){let best=0,bi=0;for(let k=0;k<4;k++){const w=W[GC[k]](v);if(w>best){best=w;bi=J[GC[k]](v)}}ok[v]=under[bi]}
 const ix=geo.index?geo.index.array:null,tc=ix?ix.length/3:vc/3,o=[];for(let t=0;t<tc;t++){const a=ix?ix[t*3]:t*3,b=ix?ix[t*3+1]:t*3+1,c=ix?ix[t*3+2]:t*3+2;if(ok[a]&&ok[b]&&ok[c])o.push(a,b,c)}
 const g=new THREE.BufferGeometry();for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);g.setIndex(o);return g}

/* ---------------- a rider ---------------- */
const RLAY=k=>1+k;
const mkBones=T=>{const a=[];for(let i=0;i<T.n;i++){const b=new THREE.Bone();b.matrixAutoUpdate=true;a.push(b)}return a};
BK.makeRider0=BK.makeRider;BK.poseRider0=BK.poseRider;BK.riderLayer0=BK.riderLayer;BK.disposeRider0=BK.disposeRider;
BK.makeRider=o=>{o=o||{};if(!PEO)return BK.makeRider0(o);const pick=BK.PEOPLE[((o.who|0)%BK.PEOPLE.length+BK.PEOPLE.length)%BK.PEOPLE.length],T=PEO.find(t=>t&&Math.round(t.hipC.x)===pick.x);if(!T)return BK.makeRider0(o);
 const g=new THREE.Group(),bones=mkBones(T);for(const b of bones)g.add(b);/* flat: every bone is placed in rider space directly */
 const skel=new THREE.Skeleton(bones,T.sm.skeleton.boneInverses);
 const body=new THREE.SkinnedMesh(T.sm.geometry,T.sm.material);body.bind(skel,T.sm.bindMatrix);body.frustumCulled=false;g.add(body);
 const arms=new THREE.SkinnedMesh(T.armGeo,T.sm.material);arms.bind(skel,T.sm.bindMatrix);arms.frustumCulled=false;arms.visible=false;g.add(arms);
 /* a helmet on the head bone, in the rider colour */
 const hm=new THREE.MeshStandardMaterial({color:o.helm||0xe8e8e8,roughness:.3,metalness:.2,flatShading:true}),vm=new THREE.MeshStandardMaterial({color:0x101418,roughness:.15,metalness:.6,flatShading:true});
 const helm=new THREE.Group(),hs=new THREE.Mesh(new THREE.IcosahedronGeometry(.15,1),hm);hs.scale.set(1,1.02,1.1);const vz=new THREE.Mesh(new THREE.BoxGeometry(.19,.07,.06),vm);vz.position.set(0,.0,.14);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.3),new THREE.MeshStandardMaterial({color:o.suit||0x2a3f6a,roughness:.5,flatShading:true}));stripe.position.set(0,.15,-.01);
 helm.add(hs,vz,stripe);helm.visible=false;/* Nov 2: no helmet, the rider's own head shows */g.add(helm);
 const R={g,T,bones,skel,body,arms,helm,Ms:{hm,vm,st:stripe.material},own:[body,hs,vz,stripe],st:{},pp:{},people:1};
 /* bind pose until the first pose */
 for(let i=0;i<T.n;i++){bones[i].position.copy(T.bp[i]);bones[i].quaternion.copy(T.bq[i])}
 return R};
BK.riderLayer=(R,k)=>{if(!R.people)return BK.riderLayer0(R,k);for(const m of R.own)m.layers.set(RLAY(k));R.arms.visible=true;R.arms.layers.set(0);
 /* the arms copy is only for the rider's own head camera: everyone else sees the whole body */R.arms.layers.disable(0);R.arms.layers.enable(3+k);R.ownK=k};
BK.disposeRider=R=>{if(!R.people)return BK.disposeRider0(R);R.helm.traverse(x=>{if(x.isMesh)x.geometry.dispose()});for(const k in R.Ms)R.Ms[k].dispose();R.skel.dispose&&R.skel.dispose()};

/* segment frame: Y along d, X along n (made perpendicular), as a rotation */
const _m=new THREE.Matrix4(),_x=V(),_y=V(),_z=V();
function frame(d,n,out){_y.copy(d).normalize();_x.copy(n).addScaledVector(_y,-n.dot(_y));if(_x.lengthSq()<1e-8){_x.set(1,0,0).addScaledVector(_y,-_y.x);if(_x.lengthSq()<1e-8)_x.set(0,0,1)}_x.normalize();_z.crossVectors(_x,_y);
 _m.makeBasis(_x,_y,_z);return out.setFromRotationMatrix(_m)}
/* rotation taking (bind dir, bind normal) onto (pose dir, pose normal) */
const _qa=Q(),_qb=Q();
function swing(db,nb,dp,np,out){frame(db,nb,_qa);frame(dp,np,_qb);return out.copy(_qb).multiply(_qa.invert())}
/* two-bone IK: joint position for root -> target with lengths and a pole */
const _a=V(),_b=V();
function ik(root,tgt,l1,l2,pole,joint,end){_a.subVectors(tgt,root);let d=_a.length();const dm=(l1+l2)*.999;if(d>dm){_a.multiplyScalar(dm/d);d=dm}if(d<1e-3)d=1e-3;_a.multiplyScalar(1/d);
 const al=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-al*al));_b.subVectors(pole,root);_b.addScaledVector(_a,-_b.dot(_a));if(_b.lengthSq()<1e-8)_b.set(0,-1,0);_b.normalize();
 joint.copy(root).addScaledVector(_a,al).addScaledVector(_b,h);end.copy(root).addScaledVector(_a,d)}

/* place bone i (and, rigidly, all its undriven children) with rotation q about its head at position p */
function put(R,i,p,q,driven){const T=R.T,b=R.bones[i];b.position.copy(p);b.quaternion.copy(q).multiply(T.bq[i]);
 /* children that are not driven follow: same delta rotation, bind offsets */
 for(let c=0;c<T.n;c++)if(T.par[c]===i&&!driven.has(c)){const off=V().subVectors(T.bp[c],T.bp[i]).applyQuaternion(q);put(R,c,off.add(p),q,driven)}}

const DRV={};let HT=1.35;const TK=1.07;/* round 13: torso 7% longer, chest and shoulders a touch higher above the hips */
const TUP=new Set(['spine004','shoulderL','shoulderR','upper_armL','upper_armR']);
function tOff(T,r){const X=T.idx,o=V().subVectors(T.bp[X[r]],T.hipC);if(TUP.has(r)){const b=T.bp[X.spine].y-T.hipC.y;o.y=b+(o.y-b)*TK}return o}
BK._ht=v=>{HT=v};/* role sets per template */
const _q1=Q(),_q2=Q(),_q3=Q(),_up=V(0,1,0);
BK.poseRider=(m,ps,gripW)=>{const R=m.rider,I=m.I;if(!R)return;if(!R.people)return BK.poseRider0(m,ps,gripW);
 const T=R.T,ix=T.idx,X=r=>ix[r];const drv=DRV[T.n+'_'+T.hipC.x]||(DRV[T.n+'_'+T.hipC.x]=new Set(['spine','spine004','thighL','shinL','footL','thighR','shinR','footR','upper_armL','forearmL','handL','upper_armR','forearmR','handR','shoulderL','shoulderR'].map(X)));
 let lean=ps.lean||0;const roll=ps.side||0,hip=V(ps.hip[0],ps.hip[1],ps.hip[2]);
 const left=V(1,0,0).applyAxisAngle(V(0,0,1),roll),tup=V();
 /* grip targets (the bars steer) and the reach check: fold the torso forward just enough that both wrists reach the grips, so the hands never stop short in the air or sink into the fairing */
 const gT=[];for(let s=0;s<2;s++){const sg=s?-1:1;if(ps.hands&&ps.hands[s]){gT.push(null);continue}const H=V(I.grip[0]*sg*(gripW||1),I.grip[1],I.grip[2]);H.sub(m.steer.position);H.applyQuaternion(m.steer.quaternion);H.add(m.steer.position);gT.push(H)}
 const setT=l=>{tup.set(0,Math.cos(l),Math.sin(l)).applyAxisAngle(V(0,0,1),roll);swing(_up,T.left,tup,left,_q1)};
 const reachOK=l=>{setT(l);const mx=(T.len.ua+T.len.fa)*.96;for(let s=0;s<2;s++){if(!gT[s])continue;const sh=tOff(T,s?'upper_armR':'upper_armL').applyQuaternion(_q1).add(hip);if(sh.distanceTo(gT[s])-.06>mx)return false}return true};
 if((gT[0]||gT[1])&&!reachOK(lean)){let lo=lean,hi=Math.max(lean,ps.leanMax!=null?ps.leanMax:1.45);/* a pose can cap the fold (leanMax): then the hips move instead */if(reachOK(hi)){for(let i=0;i<10;i++){const md=(lo+hi)/2;if(reachOK(md))hi=md;else lo=md}lean=hi}else{lean=hi;/* still short (crouched on the seat, say): move the hips toward the bars, down as well as forward, until both hands reach */
  for(let i=0;i<24&&!reachOK(lean);i++){setT(lean);const gm=V(),sm=V();let n=0;for(let s=0;s<2;s++){if(!gT[s])continue;gm.add(gT[s]);sm.add(tOff(T,s?'upper_armR':'upper_armL').applyQuaternion(_q1).add(hip));n++}
   const d=gm.sub(sm).multiplyScalar(1/n);d.x=0;d.y*=.35;/* mostly forward, so a standing rider stays standing */if(d.lengthSq()<1e-6)break;hip.addScaledVector(d.normalize(),.02)}}}
 setT(lean);
 /* a free hand reaching for something beyond arm's length (the road on a hand drag): the whole body slides toward it */
 if(ps.reach!=null&&ps.hands&&ps.hands[ps.reach]){const s=ps.reach,sg=s?-1:1,H=V(ps.hands[s][0]*sg,ps.hands[s][1],ps.hands[s][2]);
  const sh=tOff(T,s?'upper_armR':'upper_armL').applyQuaternion(_q1).add(hip);const ex=sh.distanceTo(H)-(T.len.ua+T.len.fa)*.97;
  if(ex>0)hip.addScaledVector(V().subVectors(H,sh).normalize(),Math.min(ex,ps.reachMax!=null?ps.reachMax:.8))}
 /* torso: one rigid turn from the bind body frame onto the leaning one, hips centred on the seat point */
 const bodyAt=r=>tOff(T,r).applyQuaternion(_q1).add(hip);
 const torso=new Set(drv);for(const r of['spine001','spine002','spine003'])torso.delete(X(r));
 put(R,X('spine'),bodyAt('spine'),_q1,new Set([X('spine004'),X('thighL'),X('thighR'),X('shoulderL'),X('shoulderR')]));
 /* shoulders ride with the chest */
 for(const r of['shoulderL','shoulderR'])put(R,X(r),bodyAt(r),_q1,drv);
 /* head and neck: kept nearer upright than the torso, pitched by look, turned by turn */
 const hp=lean*.35-(ps.look||0),hup=V(0,Math.cos(hp),Math.sin(hp)).applyAxisAngle(V(0,0,1),roll*.5);swing(_up,T.left,hup,left,_q2);if(ps.turn)_q2.premultiply(_q3.setFromAxisAngle(_up,ps.turn));
 const neck=bodyAt('spine004');put(R,X('spine004'),neck,_q2,new Set());
 /* the helmet sits on the head bone */
 const hb=R.bones[X('spine006')],hh=V(0,.09,.03).applyQuaternion(_q2).add(V().subVectors(T.bp[X('spine006')],T.bp[X('spine004')]).applyQuaternion(_q2).add(neck));
 R.helm.position.copy(hh);R.helm.quaternion.copy(_q2).multiply(_q3.setFromUnitVectors(V(0,0,1),T.fwd.clone().setY(0).normalize()));
 R.st.head=hh;R.st.fwd=tup;
 /* arms: IK from each upper arm to its hand target */
 const j=V(),e=V();
 for(let s=0;s<2;s++){const sg=s?-1:1,S=s?'R':'L';const sh=bodyAt('upper_arm'+S);let H;
  if(ps.hands&&ps.hands[s])H=V(ps.hands[s][0]*sg,ps.hands[s][1],ps.hands[s][2]);
  else H=gT[s].clone();
  /* the hand bone starts at the wrist: aim the wrist a palm short of the grip */
  H.addScaledVector(V().subVectors(H,sh).normalize(),-.06);
  const pole=sh.clone().add(V(.55*sg,-.35,-.35).applyAxisAngle(V(0,0,1),roll));ik(sh,H,T.len.ua,T.len.fa,pole,j,e);
  const bU=V().subVectors(T.bp[X('forearm'+S)],T.bp[X('upper_arm'+S)]),bF=V().subVectors(T.bp[X('hand'+S)],T.bp[X('forearm'+S)]);
  const nb=V().crossVectors(bU,T.fwd),np=V().crossVectors(V().subVectors(j,sh),V().subVectors(e,j));if(np.lengthSq()<1e-6)np.crossVectors(V().subVectors(j,sh),V(0,0,1));
  put(R,X('upper_arm'+S),sh,swing(bU,nb,V().subVectors(j,sh),np,Q()),drv);
  const qf=swing(bF,nb,V().subVectors(e,j),np,Q());put(R,X('forearm'+S),j,qf,drv);
  /* hand: on from the forearm, a touch of wrist drop when gripping */
  /* turn the palm down onto the grip (the bind pose holds the palms inward) unless the hand is free */
  const qh=(ps.hands&&ps.hands[s])?qf:Q().setFromAxisAngle(V().subVectors(e,j).normalize(),HT*sg).multiply(qf);put(R,X('hand'+S),e,qh,drv)}
 /* legs: IK from each hip joint to the foot target, knees forward and a little out */
 for(let s=0;s<2;s++){const sg=s?-1:1,S=s?'R':'L';const hj=bodyAt('thigh'+S);const F=V(ps.feet[s][0]*sg,ps.feet[s][1]+.07,ps.feet[s][2]-.05);
  /* the inside knee opens out in a lean (lean + = right; +X is the rider's left) */const ko=Math.max(0,-sg*(ps.knee||0));F.x+=sg*ko*.08;
  const pole=hj.clone().add(V(.22*sg+sg*ko*1.6,.1-ko*.3,.9));ik(hj,F,T.len.th,T.len.sh,pole,j,e);
  const bT=V().subVectors(T.bp[X('shin'+S)],T.bp[X('thigh'+S)]),bS=V().subVectors(T.bp[X('foot'+S)],T.bp[X('shin'+S)]);
  const nb=V().crossVectors(T.fwd,bT),np=V().crossVectors(V().subVectors(j,hj),V().subVectors(e,j));if(np.lengthSq()<1e-6)np.copy(left);
  put(R,X('thigh'+S),hj,swing(bT,nb,V().subVectors(j,hj),np,Q()),drv);
  const qs=swing(bS,nb,V().subVectors(e,j),np,Q());put(R,X('shin'+S),j,qs,drv);
  /* foot flat along the bike, toes forward */
  const bFt=V().subVectors(T.bp[X('toe'+S)],T.bp[X('foot'+S)]);put(R,X('foot'+S),e,swing(bFt,T.left,V(0,-.25,1),left,Q()),drv)}};
/* ---------------- wipeout ragdoll (people riders) ----------------
   Verlet particles on the joints: a stiff torso box (pelvis, neck, hips, shoulders), a neck to the head, and two-link arms and legs.
   Gravity, ground contact with sliding friction, and length constraints; then each bone is turned from its bind pose onto the particles. */
const RJ=['spine','spine004','spine006','thighL','thighR','upper_armL','upper_armR','forearmL','handL','forearmR','handR','shinL','footL','shinR','footR'];
const RR=[.11,.1,.12,.08,.08,.08,.08,.06,.05,.06,.05,.07,.06,.07,.06];
BK.ragStart=(m,vel,o)=>{o=o||{};const R=m.rider;if(!R||!R.people)return null;const T=R.T,X=r=>T.idx[r];R.g.updateMatrixWorld(true);
 const P_=RJ.map(r=>R.bones[X(r)].getWorldPosition(V()));const h=1/60;
 /* round 13: over the bars the legs catch on the bike while the upper body keeps going: the higher the joint, the faster it leaves (a flip) */
 const fw=V(vel.x,0,vel.z).normalize(),y0=P_[0].y;
 const O=P_.map((p,i)=>p.clone().addScaledVector(vel,-h).addScaledVector(fw,-(o.flip||0)*(p.y-y0)*h).add(V((Math.random()-.5)*.02,(Math.random()-.5)*.02,(Math.random()-.5)*.02)));
 const C=[];const tor=[0,1,3,4,5,6];for(let a=0;a<tor.length;a++)for(let b=a+1;b<tor.length;b++)C.push([tor[a],tor[b],0,1]);
 for(const [a,b] of[[1,2],[5,7],[7,8],[6,9],[9,10],[3,11],[11,12],[4,13],[13,14],[0,2]])C.push([a,b,0,1]);
 for(const c of C)c[2]=P_[c[0]].distanceTo(P_[c[1]]);
 /* soft: limbs may bend but not fold flat */for(const [a,b,f] of[[5,8,.55],[6,10,.55],[3,12,.6],[4,14,.6]])C.push([a,b,P_[a].distanceTo(P_[b])*f,2]);
 return{P:P_,O,C,h,roll:!!o.roll,t:0}};
BK.ragStep=(rag,dt,gy)=>{const P_=rag.P,O=rag.O,n=P_.length,ss=3,h=Math.min(dt,1/20)/ss,g=-9.8*h*h,t=V();
 /* round 13: tuck and roll. The first time the body lands after being thrown, it gets a forward roll about its side axis (top moving the
    way it travels), and the ground grips less while it rolls */
 rag.t+=dt;if(rag.rollT>0)rag.rollT-=dt;
 if(rag.roll&&!rag.rolled&&rag.t>.2){let hit=false;for(const i of[0,1,2,5,6])if(P_[i].y<=gy(P_[i].x,P_[i].z)+RR[i]+.03)hit=true;
  if(hit){rag.rolled=1;rag.rollT=.8;const com=V(),vc=V();for(let i=0;i<n;i++){com.add(P_[i]);vc.add(V().subVectors(P_[i],O[i]))}com.multiplyScalar(1/n);vc.multiplyScalar(1/n/h);vc.y=0;const sp=vc.length();
   if(sp>3){const ax=V().crossVectors(V(0,1,0),vc.normalize()),w=Math.min(9,Math.max(4,sp/.5)),hh=h;for(let i=0;i<n;i++){const r=V().subVectors(P_[i],com),dv=V().crossVectors(ax,r).multiplyScalar(w);const mx=8;if(dv.length()>mx)dv.setLength(mx);O[i].addScaledVector(dv,-hh)}}}}
 for(let k=0;k<ss;k++){
  /* speed cap: the body as a whole at 28 m/s, scaled evenly so a spin survives (each joint is also held under 45 m/s) */
  const av=V();for(let i=0;i<n;i++)av.add(t.subVectors(P_[i],O[i]));av.multiplyScalar(1/n);const mx=28*h,cf=av.length()>mx?mx/av.length():1;
  for(let i=0;i<n;i++){const p=P_[i],o=O[i];t.subVectors(p,o).multiplyScalar(.995*cf);const m2=45*h;if(t.lengthSq()>m2*m2)t.setLength(m2);o.copy(p);p.add(t);p.y+=g}
  for(let it=0;it<6;it++){for(const c of rag.C){const a=P_[c[0]],b=P_[c[1]];t.subVectors(b,a);const d=t.length()||1e-4;if(c[3]===2&&d>=c[2])continue;const w=c[0]===0?.35:.5,f=(d-c[2])/d;
     a.addScaledVector(t,f*w);b.addScaledVector(t,-f*(1-w))}
   for(let i=0;i<n;i++){const p=P_[i],y0=gy(p.x,p.z)+RR[i];if(p.y<y0){p.y=y0;const o=O[i];if(o.y<y0)o.y=y0+(o.y-y0)*-.25;/* sliding friction (about 0.65 g): take a fixed amount of speed off each step */const vx=p.x-o.x,vz=p.z-o.z,vh=Math.hypot(vx,vz),dv=6.5*h*h/6*(rag.rollT>0?.3:1);/* applied once per constraint pass */if(vh<=dv){o.x=p.x;o.z=p.z}else{o.x+=vx*dv/vh;o.z+=vz*dv/vh}}}}}
 return P_[0]};
BK.ragPose=(m,rag)=>{const R=m.rider,T=R.T,X=r=>T.idx[r],P_=rag.P;const drv=DRV[T.n+'_'+T.hipC.x];if(!drv)return;
 R.g.position.set(0,0,0);R.g.quaternion.identity();
 const bu=V().subVectors(T.bp[X('spine004')],T.bp[X('spine')]),bl=V().subVectors(T.bp[X('thighL')],T.bp[X('thighR')]);
 const cu=V().subVectors(P_[1],P_[0]),cl_=V().subVectors(P_[3],P_[4]);const qt=swing(bu,bl,cu,cl_,Q());
 put(R,X('spine'),P_[0],qt,new Set([X('spine004'),X('thighL'),X('thighR'),X('shoulderL'),X('shoulderR')]));
 for(const r of['shoulderL','shoulderR'])put(R,X(r),V().subVectors(T.bp[X(r)],T.bp[X('spine')]).applyQuaternion(qt).add(P_[0]),qt,drv);
 const bh=V().subVectors(T.bp[X('spine006')],T.bp[X('spine004')]),ch=V().subVectors(P_[2],P_[1]);put(R,X('spine004'),P_[1],swing(bh,bl,ch,cl_,Q()),new Set());
 const lim=(A,Bn,Cn,ia,ib,ic,fw)=>{const a=P_[ia],j=P_[ib],e=P_[ic];const b1=V().subVectors(T.bp[X(Bn)],T.bp[X(A)]),b2=V().subVectors(T.bp[X(Cn)],T.bp[X(Bn)]);
  const nb=fw?V().crossVectors(b1,T.fwd):V().crossVectors(T.fwd,b1),np=V().crossVectors(V().subVectors(j,a),V().subVectors(e,j));if(np.lengthSq()<1e-6)np.copy(cl_);
  put(R,X(A),a,swing(b1,nb,V().subVectors(j,a),np,Q()),drv);const q2=swing(b2,nb,V().subVectors(e,j),np,Q());put(R,X(Bn),j,q2,drv);return q2};
 put(R,X('handL'),P_[8],lim('upper_armL','forearmL','handL',5,7,8,1),drv);put(R,X('handR'),P_[10],lim('upper_armR','forearmR','handR',6,9,10,1),drv);
 put(R,X('footL'),P_[12],lim('thighL','shinL','footL',3,11,12,0),drv);put(R,X('footR'),P_[14],lim('thighR','shinR','footR',4,13,14,0),drv);
 R.st.head=P_[2].clone()};
BK.headWorld=(m,out)=>{const R=m.rider;m.g.updateMatrixWorld();/* the bike moved this frame after the pose: refresh, or the camera trails the head at speed */if(!R||!R.st.head)return out.set(0,1.6,0);out.copy(R.st.head);m.inner.localToWorld(out);return out};
})();
