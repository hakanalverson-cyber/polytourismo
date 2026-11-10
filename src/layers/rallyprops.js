/* ===== Poly GT layer: rally stage dressing (Nov 9, Hakan: "feel free to add stuff to the rally maps, because they NEED it, but make sure any
   props you add are anchored to the ground, match the low poly, and make sense").
   The four stage models were only the landscape. A rally has people and kit along it, so each stage now gets, from the game's own low-poly
   prop kit (flat-shaded, vertex colours, the same look as the rest of the game):
   - spectator spots at the best corners: a tent with people in it, set back from the outside of the bend, hay bales lining the apex
   - a start and finish area: sponsor boards and tents beside the gates
   - marshal points with cones partway along the stage
   - the country's own touches: snow poles marking both edges in Sweden (the real Swedish rally has them), log piles and stumps in the
     Finnish forest, boulders on the Portuguese hillsides, barrels and crates in the French villages
   Every prop is set on the drawn ground: a ray from above finds the model's surface where it stands; a spot is skipped if that surface is
   steep, if something of the model is already there (a tree, a rock, a house), or if it is too close to the road. Props near the road are
   solid (they get colliders). ===== */
(function rallyprops(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof buildWorld==='undefined')return;
const on=()=>!window.PTO||window.PTO.rallyProps!==false;
const KEYS={mangrove:'fi',terr:'fr',ash:'pt',autumn:'se'};
/* the spectator tents differ per country (colour), the corner liner too */
const SET={fi:{tent:['tentR','tentB'],line:'bale',deco:[['logs',.5],['stump',.5]],decoEvery:120},
 se:{tent:['tentB','tentG'],line:'snowman',deco:[['snowpole',1]],decoEvery:0,poles:1},
 pt:{tent:['tentR','tentG'],line:'bale',deco:[['boulderR',.6],['cairn',.4]],decoEvery:170},
 fr:{tent:['tentR','tentB'],line:'bale',deco:[['barrels',.5],['crates',.5]],decoEvery:200}};
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const rc=new THREE.Raycaster(),DN=new THREE.Vector3(0,-1,0),O=new THREE.Vector3();
function dress(sc,T){const d=T.d,pk=d&&d.cartoon;if(!pk||!pk.stage||!T.finI)return;const K=P.PROPKIT;if(!K||!K.LIB)return;
 const set=SET[KEYS[d._key]]||SET.fi;let grp=null;sc.traverse(o=>{if(o.name==='cartoonTrack')grp=o});if(!grp)return;
 seed=(d.id||7)*977+13;grp.updateMatrixWorld(true);const meshes=[];grp.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const c=g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);meshes.push({o,x:c.x,z:c.z,r:g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis()})}});const near=(x,z,r)=>meshes.filter(m=>Math.hypot(m.x-x,m.z-z)<m.r+r+1).map(m=>m.o);const t0=performance.now();
 const N=T.N,fin=T.finI,sp=T.sp||3;
 /* distance from a point to the road edge (negative on the road) */
 const gap=(x,z)=>{let b=1e9;const CS=16,cx=Math.floor(x/CS),cz=Math.floor(z/CS);if(T.grid){for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const q=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(q<b)b=q}}return b}
  for(let i=0;i<N;i+=2){const q=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(q<b)b=q}return b};
 /* the drawn ground at (x,z): the first surface a ray from above meets; null when that is not open ground */
 /* the drawn ground at (x,z), from the model's own height grid (the same one the cars drive on); null on a slope, or where the model
    already has something standing (a tree trunk or a wall from its collider list) */
 const BX=T._bx||{pts:[],segs:[]},segD=(x,z,q)=>{const dx=q[2]-q[0],dz=q[3]-q[1],L=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-q[0])*dx+(z-q[1])*dz)/L));return Math.hypot(x-q[0]-dx*t,z-q[1]-dz*t)};
 const ground=(x,z,y0,r)=>{for(const p of BX.pts)if(Math.abs(p[0]-x)<r+3&&Math.abs(p[1]-z)<r+3&&Math.hypot(p[0]-x,p[1]-z)<r+(p[2]||.5)+.4)return null;
  for(const q of BX.segs)if(Math.min(q[0],q[2])-r-1<x&&Math.max(q[0],q[2])+r+1>x&&Math.min(q[1],q[3])-r-1<z&&Math.max(q[1],q[3])+r+1>z&&segD(x,z,q)<r+.5)return null;
  const tops=[];for(const[dx,dz]of[[0,0],[r,0],[-r,0],[0,r],[0,-r]]){const h=T.terr(x+dx,z+dz);if(h==null||!isFinite(h))return null;tops.push(h)}
  const lo=Math.min(...tops),hi=Math.max(...tops);if(hi-lo>Math.max(.7,r*.45))return null;return lo};
 const put={},col=[];const add=(n,x,y,z,yaw,s,solid)=>{(put[n]=put[n]||[]).push([x,y,z,yaw,s||1]);if(solid)col.push([x,z,solid])};
 const place=(n,i,off,s,solid,yawOff)=>{const L=K.LIB[n];if(!L)return false;const k=((i%N)+N)%N,c=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]),x=T.x[k]+c*off,z=T.z[k]-sn*off,fr=(L.fr||1)*(s||1);
  if(gap(x,z)<Math.max(1.2,fr*.8))return false;const y=ground(x,z,T.y[k],Math.max(.5,fr*.8));if(y==null)return false;
  const yaw=T.psi[k]+(yawOff!=null?yawOff:(off>0?-Math.PI/2:Math.PI/2));add(n,x,y-.04,z,yaw,s,solid&&gap(x,z)<14?solid:0);return true};
 /* the first spot that works, trying a few distances out and a few metres along, this side then the other */
 const any=(n,i,side,offs,solid,yawOff,both)=>{for(const sd of both===false?[side]:[side,-side])for(const o of offs)for(const a of[0,6,-6,12,-12]){const k=i+Math.round(a/sp),hw=T.hw[((k%N)+N)%N];if(place(n,k,sd*(hw+o),1,solid,yawOff))return true}return false};
 /* corners: local curvature along the stage */
 const cv=new Float32Array(N);for(let i=6;i<fin-6;i++){let a=T.psi[i+6]-T.psi[i-6];a=Math.atan2(Math.sin(a),Math.cos(a));cv[i]=a/(12*sp)}
 const pk_=[];for(let i=40;i<fin-40;i++){const a=Math.abs(cv[i]);if(a<.012)continue;let top=true;for(let j=-30;j<=30&&top;j++)if(j&&Math.abs(cv[i+j])>a)top=false;if(top)pk_.push(i)}
 pk_.sort((a,b)=>Math.abs(cv[b])-Math.abs(cv[a]));const spots=[];for(const i of pk_){if(spots.every(j=>Math.abs(j-i)*sp>320))spots.push(i);if(spots.length>=Math.max(5,Math.round(fin*sp/600)))break}
 for(const i of spots){const out=-Math.sign(cv[i])||1,hw=T.hw[i];/* outside of the bend: psi turning left (+) puts the outside on the right... sign per the road frame */
  const side=out;any(set.tent[spots.indexOf(i)%set.tent.length],i,side,[10,13,8,16],1.9);if(rnd()<.6)any(set.tent[(spots.indexOf(i)+1)%set.tent.length],i+Math.round(14/sp),side,[10,13,16],1.9);
  /* the apex line: a few bales (or snowmen) along the outside edge */
  if(set.line==='bale')for(let j=-3;j<=3;j++)place('bale',i+Math.round(j*3.2/sp),side*(hw+2.6),1,.75,0);
  else place('snowman',i+Math.round(6/sp),side*(hw+5),1,.6)}
 /* start and finish areas */
 for(const[i0,label]of[[8,'start'],[fin-8,'finish']]){for(let j=0;j<3;j++){any(['bbA','bbB','bbC'][j],i0+Math.round((j*14-8)/sp),j%2?1:-1,[5,7,9],0)}
  any(set.tent[0],i0+Math.round(10/sp),1,[9,12,15],1.9);any(set.tent[1]||set.tent[0],i0-Math.round(10/sp),-1,[9,12,15],1.9)}
 /* marshal points: cones by the road */
 for(let s=500;s<fin*sp-300;s+=650){const i=Math.round(s/sp);place('cones',i,(rnd()<.5?1:-1)*(T.hw[i]+2.2),1,.5,0)}
 /* the country's touches */
 if(set.poles){/* snow poles every 40 m on both edges, slightly irregular like the real ones */for(let s=20;s<fin*sp;s+=40){const i=Math.round(s/sp);for(const u of[-1,1])place('snowpole',i,u*(T.hw[i]+1.1+rnd()*.3),1,0,rnd()*.3)}}
 if(set.decoEvery){for(let s=set.decoEvery*.6;s<fin*sp;s+=set.decoEvery*(.7+rnd()*.6)){const i=Math.round(s/sp),r=rnd();let acc=0,n=set.deco[0][0];for(const[nm,w]of set.deco){acc+=w;if(r<acc){n=nm;break}}
  place(n,i,(rnd()<.5?1:-1)*(T.hw[i]+4+rnd()*5),.85+rnd()*.35,n==='stump'||n==='cairn'?.5:n==='boulderR'?1.6:1,rnd()*6.28)}}
 /* draw: one instanced mesh per prop kind */
 let total=0;const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),V=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
 for(const n in put){const L=K.LIB[n],a=put[n];const im=new THREE.InstancedMesh(L.g,K.MAT,a.length);a.forEach((q,i)=>{Q.setFromAxisAngle(Y,q[3]);S.setScalar(q[4]);M.compose(V.set(q[0],q[1],q[2]),Q,S);im.setMatrixAt(i,M)});
  im.castShadow=true;im.receiveShadow=true;im.userData.ptProp=n;im.userData.rallyProp=1;im.frustumCulled=false;sc.add(im);total+=a.length;
  if(L.crowd){for(const q of a)(sc.userData.crowd=sc.userData.crowd||[]).push([q[0],q[2]])}}
 if(P.addPt)for(const c of col)P.addPt(T,c[0],c[1],c[2]);T._bg=null;
 sc.userData.rallyProps=total;sc.userData.rallyPropsMs=Math.round(performance.now()-t0)}
P.rallyDress=dress;
/* after cartoon.js has put the stage model in (it wraps buildWorld a tick after load) */
setTimeout(()=>setTimeout(()=>{const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);if(on())try{dress(sc,T)}catch(e){console.warn('rally props',e)}return sc}},0),0);
})();
