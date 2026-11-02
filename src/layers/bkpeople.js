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

const DRV={};let HT=1.35;BK._ht=v=>{HT=v};/* role sets per template */
const _q1=Q(),_q2=Q(),_q3=Q(),_up=V(0,1,0);
BK.poseRider=(m,ps,gripW)=>{const R=m.rider,I=m.I;if(!R)return;if(!R.people)return BK.poseRider0(m,ps,gripW);
 const T=R.T,ix=T.idx,X=r=>ix[r];const drv=DRV[T.n+'_'+T.hipC.x]||(DRV[T.n+'_'+T.hipC.x]=new Set(['spine','spine004','thighL','shinL','footL','thighR','shinR','footR','upper_armL','forearmL','handL','upper_armR','forearmR','handR','shoulderL','shoulderR'].map(X)));
 const lean=ps.lean||0,roll=ps.side||0,hip=V(ps.hip[0],ps.hip[1],ps.hip[2]);
 const left=V(1,0,0).applyAxisAngle(V(0,0,1),roll),tup=V(0,Math.cos(lean),Math.sin(lean)).applyAxisAngle(V(0,0,1),roll);
 /* torso: one rigid turn from the bind body frame onto the leaning one, hips centred on the seat point */
 swing(_up,T.left,tup,left,_q1);
 const bodyAt=r=>V().subVectors(T.bp[X(r)],T.hipC).applyQuaternion(_q1).add(hip);
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
  else{H=V(I.grip[0]*sg*(gripW||1),I.grip[1],I.grip[2]);H.sub(m.steer.position);H.applyQuaternion(m.steer.quaternion);H.add(m.steer.position)}
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
  const pole=hj.clone().add(V(.22*sg,.1,.9));ik(hj,F,T.len.th,T.len.sh,pole,j,e);
  const bT=V().subVectors(T.bp[X('shin'+S)],T.bp[X('thigh'+S)]),bS=V().subVectors(T.bp[X('foot'+S)],T.bp[X('shin'+S)]);
  const nb=V().crossVectors(T.fwd,bT),np=V().crossVectors(V().subVectors(j,hj),V().subVectors(e,j));if(np.lengthSq()<1e-6)np.copy(left);
  put(R,X('thigh'+S),hj,swing(bT,nb,V().subVectors(j,hj),np,Q()),drv);
  const qs=swing(bS,nb,V().subVectors(e,j),np,Q());put(R,X('shin'+S),j,qs,drv);
  /* foot flat along the bike, toes forward */
  const bFt=V().subVectors(T.bp[X('toe'+S)],T.bp[X('foot'+S)]);put(R,X('foot'+S),e,swing(bFt,T.left,V(0,-.25,1),left,Q()),drv)}};
BK.headWorld=(m,out)=>{const R=m.rider;m.g.updateMatrixWorld();/* the bike moved this frame after the pose: refresh, or the camera trails the head at speed */if(!R||!R.st.head)return out.set(0,1.6,0);out.copy(R.st.head);m.inner.localToWorld(out);return out};
})();
