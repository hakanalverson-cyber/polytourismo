/* ===== Poly GT layer: pit stops (Nov 15, Hakan). Two-player races only, Road Atlanta only for now.
   Steer onto the pit road on the inside of the last corner and the car takes over: it slows to 15 mph, follows the pit lane and pulls
   into the first empty box. When it has stopped the crew (Low Poly Airport Ground Crew, Studio Ochi, outfits toned down; CREW_B64 in
   PACKS builds) runs out round the car, never across it, and works on the wheels while the driver gets a quick time event: three random
   keys from the player's own cluster (P1: Q W E A S D, P2: the arrows and Page Up / Page Down). A wrong key costs a second. When the
   three are in, the crew runs back, the damage is repaired and the car drives itself out to the end of the pit exit at 15 mph.
   The pit lane is a list of points in the track model's own units (read off the model's surface map), scaled with the map. ===== */
(function ptPit(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof stepCar==='undefined')return;const BK=P.BK;
const V=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0);
const MPH15=6.7056,LANE_V=15.65/* 35 mph down the pit lane (Nov 15, Hakan: it takes too long); 15 mph for the last metres into the box */,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=t=>{t=cl(t,0,1);return t*t*(3-2*t)},wr=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* ---------- the pit lanes (model units). o: a point on the start straight, u: its direction, n: toward the pits ---------- */
/* Nov 15 (Hakan: straight and lined up with the tents): the straight is now measured off the row of pit tents themselves (o: a point on the
   tent row, u: along it, n: from the lane toward the tents, 27.96 units = 14.6 m out), and every box sits square in front of one tent */
const LANES={ra:(()=>{const o=[64.11,-836.97],u=[.8405,.5417],n=[-.5417,.8405],K=27.96,at=t=>[o[0]+u[0]*t-n[0]*K,o[1]+u[1]*t-n[1]*K];
 const pts=[[-284,-901],[-268,-909],[-250,-918],[-225,-929],[-200,-938.5],[-175,-943],[-150,-945],[-125,-948.5],[-100,-954.5],[-75,-949]];
 for(let t=-152;t<=264;t+=32)pts.push(at(t));
 pts.push([322,-702.5],[340,-684],[353,-665],[359.5,-645],[362,-625],[366,-606],[372,-590],[377,-573]);
 return{pts,boxes:[-26.2,7.9,41.1,141.2].map(t=>at(t)),boxT:[-26.2,7.9,41.1,141.2],tents:[-41.8,-26.2,-9.3,7.9,24.8,41.1,58.1,108,124.9,141.2,158.2,172.9],o,u,side:n,shift:10.53,entry:[10,42]}})()};
const laneOf=Rc=>{const d=Rc&&Rc.T&&Rc.T.d,pk=d&&d.cartoon;return pk&&LANES[pk.replaces]?{L:LANES[pk.replaces],f:pk.sf||1}:null};
/* dense path (about a metre a step) through the points, Catmull-Rom */
function build(Rc){const q=laneOf(Rc);if(!q)return null;const {L,f}=q,c=L.pts.map(p=>[p[0]*f,p[1]*f]),X=[],Z=[],S=[];
 const g=i=>c[cl(i,0,c.length-1)];
 for(let i=0;i<c.length-1;i++){const a=g(i-1),b=g(i),d=g(i+1),e=g(i+2),n=Math.max(2,Math.ceil(Math.hypot(d[0]-b[0],d[1]-b[1])));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;for(let j=0;j<2;j++){const v=.5*((2*b[j])+(-a[j]+d[j])*t+(2*a[j]-5*b[j]+4*d[j]-e[j])*t2+(-a[j]+3*b[j]-3*d[j]+e[j])*t3);(j?Z:X).push(v)}}}
 X.push(c[c.length-1][0]);Z.push(c[c.length-1][1]);
 let s=0;for(let i=0;i<X.length;i++){if(i)s+=Math.hypot(X[i]-X[i-1],Z[i]-Z[i-1]);S.push(s)}
 const near=(x,z)=>{let b=0,bd=1e18;for(let i=0;i<X.length;i++){const d=(X[i]-x)**2+(Z[i]-z)**2;if(d<bd){bd=d;b=i}}return{i:b,d:Math.sqrt(bd)}};
 const boxes=L.boxes.map(p=>{const x=p[0]*f,z=p[1]*f,i=cl(near(x,z).i,1,X.length-2),tx=X[i+1]-X[i-1],tz=Z[i+1]-Z[i-1],tl=Math.hypot(tx,tz)||1;/* to the centimetre, not the nearest path step */
  return{s:S[i]+((x-X[i])*tx+(z-Z[i])*tz)/tl,by:null,crew:null}});
 return{X,Z,S,len:s,boxes,side:L.side,shift:L.shift*f,entry:L.entry,near,box:14}}
/* a point on the lane at distance s, pulled sideways into box b around its stop point */
function at(PL,s,b,out){const S=PL.S;let i=Math.min(S.length-2,Math.max(0,Math.floor(s/PL.len*(S.length-1))));while(i>0&&S[i]>s)i--;while(i<S.length-2&&S[i+1]<s)i++;
 const t=cl((s-S[i])/Math.max(1e-6,S[i+1]-S[i]),0,1);let x=PL.X[i]+(PL.X[i+1]-PL.X[i])*t,z=PL.Z[i]+(PL.Z[i+1]-PL.Z[i])*t;
 if(b){const w=sm((PL.box-Math.abs(s-b.s))/(PL.box-2));/* flat for 2 m either side of the stop, so the parked car is dead straight */x+=PL.side[0]*PL.shift*w;z+=PL.side[1]*PL.shift*w}
 out.x=x;out.z=z;return out}
const _a={x:0,z:0},_b={x:0,z:0};
function pose(PL,s,b){at(PL,s,b,_a);at(PL,Math.min(PL.len,s+.6),b,_b);let dx=_b.x-_a.x,dz=_b.z-_a.z;if(dx*dx+dz*dz<1e-6){at(PL,Math.max(0,s-.6),b,_b);dx=_a.x-_b.x;dz=_a.z-_b.z}return{x:_a.x,z:_a.z,yaw:Math.atan2(dx,dz)}}

/* ---------- the crew ---------- */
let CREW=null,crewP=null;
const loadCrew=()=>crewP||(crewP=new Promise(res=>{const b64=window.CREW_B64;if(!b64||!THREE.GLTFLoader||!BK||!BK.peoPrep){res(null);return}
 try{const raw=atob(b64),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
  const cib=window.createImageBitmap;window.createImageBitmap=undefined;/* textures through <img> (see hpack.js) */
  try{new THREE.GLTFLoader().parse(u.buffer,'',g=>{try{CREW=BK.peoPrep(g).filter(Boolean);for(const T of CREW){const m=T.sm.material;if(m){m.roughness=.9;m.metalness=0}}}catch(e){console.warn('pit crew',e)}res(CREW)},e=>{console.warn('pit crew',e);res(null)})}finally{window.createImageBitmap=cib}}
 catch(e){console.warn('pit crew',e);res(null)}}));
const _st={position:V(),quaternion:new THREE.Quaternion()};
/* one pose from a few numbers. k: 'stand' | 'set' (crouched, ready to go) | 'run' (ph: stride phase) | 'work' (kneeling at a wheel, ph: time) | 'pump' (on the jack handle).
   The body is posed in its own space (x left, y up, z forward) */
function crewPose(M,k,ph){const R=M.R,T=R.T,hy=T.hipC.y,sy=T.bp[T.idx.upper_armL].y,arm=(T.len.ua+T.len.fa);let ps;
 if(k==='run'||k==='runc'){const s=Math.sin(ph),c=Math.cos(ph);/* a sprint: long stride, high knees, pumping arms, well forward over the feet */
  ps={hip:[0,hy-.07+.035*Math.cos(2*ph),0],lean:.34,flat:false,look:.16,feet:[[.085,Math.max(0,c)*.27,.43*s+.03],[.085,Math.max(0,-c)*.27,-.43*s+.03]],
   hands:[[.22,sy-arm*.5+.11*Math.max(0,-s),-.34*s+.14],[.22,sy-arm*.5+.11*Math.max(0,s),.34*s+.14]]};if(k==='runc'){ps.lean=.22;ps.hands=[[.25,sy-arm*.4,.42],[.25,sy-arm*.4,.42]]}}
 else if(k==='work'){const a=Math.sin(ph*9),b=Math.sin(ph*9+1.6),sw=Math.sin(ph*1.3)*.03;
  ps={hip:[sw,hy*.5,-.16],lean:.55,flat:true,look:-.25,feet:[[.17,0,.1],[.17,0,-.3]],
   hands:[[.1+.04*b,hy*.42+.07*a,.42],[.1-.04*b,hy*.42-.07*a,.44]]}}
 else if(k==='pump'){const a=Math.sin(ph*6),u=.5+.5*a;
  ps={hip:[0,hy*(.78-.1*u),-.2],lean:.5+.22*u,flat:true,look:-.2,feet:[[.16,0,.16],[.16,0,-.22]],
   hands:[[.09,hy*(.95-.5*u),.4],[.09,hy*(.95-.5*u),.4]]}}
 else if(k==='set'){const b=Math.sin(ph*2.4)*.012;
  ps={hip:[0,hy*.86+b,-.06],lean:.3,flat:true,look:.12,feet:[[.14,0,.16],[.14,0,-.18]],hands:[[.24,sy-arm*.72,.2],[.24,sy-arm*.72,.2]]}}
 else{const b=Math.sin(ph*1.6)*.006;ps={hip:[0,hy-.012+b,0],lean:.02,flat:true,look:0,feet:[[.1,0,0],[.1,0,0]],hands:[[.24,sy-arm*.95,.04],[.24,sy-arm*.95,.04]]}}
 BK.poseRider({rider:R,I:{grip:[.3,sy,.4]},steer:_st},ps,1)}
/* every crew has its own colour: the clothing swatches of the pack's atlas (the last six of its eight columns) are recoloured, hair and skin are left alone */
const TEAMS=['#b3362c','#2c62a8','#c99a2a','#2f8a5c','#7a4aa0','#c9662a'],texC={};
function teamMat(T,team){const m0=T.sm.material,map=m0&&m0.map,key=(map?map.uuid:'x')+'|'+team;if(texC[key])return texC[key];const m=m0.clone();
 try{const im=map&&map.image;if(im&&im.width){const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const g=cv.getContext('2d');g.drawImage(im,0,0);
   const cw=im.width/8;/* the shirt, jacket and vest columns take the team colour; the greys and the dark trousers and boots stay as they are */for(const k of[3,4,7]){const x0=Math.round(cw*k);g.globalCompositeOperation='color';g.globalAlpha=.9;g.fillStyle=TEAMS[team%TEAMS.length];g.fillRect(x0,0,Math.round(cw),im.height);g.globalCompositeOperation='screen';g.globalAlpha=.16;g.fillStyle='#fff';g.fillRect(x0,0,Math.round(cw),im.height)}
   g.globalCompositeOperation='source-over';g.globalAlpha=1;const tx=new THREE.CanvasTexture(cv);tx.flipY=map.flipY;tx.encoding=map.encoding;tx.wrapS=map.wrapS;tx.wrapT=map.wrapT;tx.magFilter=map.magFilter;tx.minFilter=map.minFilter;tx.generateMipmaps=map.generateMipmaps;tx.needsUpdate=true;m.map=tx}}catch(e){}
 m.roughness=.72;m.metalness=0;m.needsUpdate=true;return texC[key]=m}
/* a crew of six for box b beside a car stopped at (x,z) heading yaw. Car space: +X toward the pit wall the crew waits on, +Z the car's nose.
   Each member has a way out as corner points round the car, so nobody crosses the bodywork: four on the wheels, one on a jack at each end.
   Until the car has stopped nobody goes past the first point of their way, which is always on the wall side, clear of the car coming in. */
const WAYS=[[[1.5,1.35]],[[1.5,-1.35]],[[1.8,3.3],[-1.75,3.3],[-1.5,1.35]],[[1.8,-3.3],[-1.75,-3.3],[-1.5,-1.35]],[[1.55,2.95],[.05,3.0]],[[1.55,-2.95],[.05,-3.0]]];
const HOME=[[1.95,.7],[1.95,-.7],[1.95,3.3],[1.95,-3.3],[1.95,2.1],[1.95,-2.1]],ROLE=['work','work','work','work','pump','pump'];
function mkCrew(Rc,PL,b){if(!CREW||!CREW.length||b.crew)return;const p=pose(PL,b.s,b),T=Rc.T,sd=PL.side,rt=[Math.cos(p.yaw),-Math.sin(p.yaw)],sg=Math.sign(rt[0]*sd[0]+rt[1]*sd[1])||1;b.p=p;b.sg=sg;b.rt=[rt[0]*sg,rt[1]*sg];
 const W=b.W=(lx,lz)=>{const x=p.x+rt[0]*lx*sg+Math.sin(p.yaw)*lz,z=p.z+rt[1]*lx*sg+Math.cos(p.yaw)*lz;return V(x,T.terr(x,z),z)};
 b.crew=WAYS.map((w,i)=>{const Tm=CREW[(i+b.n*2)%CREW.length],R=BK.makeRiderFrom(Tm,{});try{R.body.material=teamMat(Tm,b.n)}catch(e){}R.g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.layers.set(0)}});R.arms.visible=false;
  const home=W(HOME[i][0],HOME[i][1]),path=[home,...w.map(q=>W(q[0],q[1]))],e=w[w.length-1],look=ROLE[i]==='pump'?W(0,e[1]*.4):W(e[0]*.55,e[1]);
  const M={R,i,role:ROLE[i],path,lx:[HOME[i][0],...w.map(q=>q[0])],at:0,pos:home.clone(),yaw:p.yaw-sg*Math.PI/2,ph:i*1.7,face:look,homeYaw:p.yaw-sg*Math.PI/2,mv:0,idle:1};R.g.position.copy(home);R.g.rotation.y=M.yaw;Rc.scene.add(R.g);crewPose(M,'stand',0);return M})}
/* run a member toward point tgt of its way (0 is home); true when it is there */
const RUN_V=7.4;
function crewMove(M,tgt,dt){if(M.at===tgt&&M.pos.distanceTo(M.path[tgt])<.03)return true;const dir=tgt>M.at?1:tgt<M.at?-1:0;
 let left=RUN_V*dt;while(left>0){const nx=M.pos.distanceTo(M.path[M.at])<.03?(M.at===tgt?-1:M.at+(tgt>M.at?1:-1)):M.at;if(nx<0)break;M.at=nx;const d=M.path[nx],dd=M.pos.distanceTo(d),st=Math.min(left,dd);
  if(dd>1e-4){M.pos.addScaledVector(V().subVectors(d,M.pos).multiplyScalar(1/dd),st);M.yaw+=wr(Math.atan2(d.x-M.pos.x,d.z-M.pos.z)-M.yaw)*Math.min(1,dt*18)}left-=st;if(st<1e-5)break}
 M.ph+=dt*15;M.mv=1;return false}
/* phase: 'idle' (at the wall) | 'ready' (the car is coming: out to the first point, crouched) | 'work' (round the car and on it) | 'home' (back to the wall).
   Returns true when everyone is where the phase wants them; b.clear is true while nobody stands in the car's way out */
let LIB=null;
function tyreMeshes(M){if(M.tm!==undefined)return M.tm;if(!PROPS)return null;const L=LIB||(LIB=propLib()),t=L&&L.tyre;let g,m,s=1,rx=0;
 if(t){g=t.g;m=t.mat;s=.62/Math.max(t.sz.x,t.sz.z);rx=t.sz.y<Math.max(t.sz.x,t.sz.z)*.8?Math.PI/2:0}else{g=new THREE.TorusGeometry(.27,.11,10,22);m=new THREE.MeshStandardMaterial({color:0x222222,roughness:.9})}
 const mk=(mat)=>{const me=new THREE.Mesh(g,mat);me.scale.setScalar(s);me.rotation.x=rx;me.castShadow=true;const gp=new THREE.Group();gp.add(me);gp.position.set(0,.66,.46);gp.visible=false;gp.layers.set(0);me.layers.set(0);M.R.g.add(gp);return gp};
 const m2=m.clone();if(m2.color)m2.color.setRGB(.42,.42,.42);return M.tm=[mk(m),mk(m2)]}
let fr=0;
function crewTick(b,dt,phase){let all=true,clear=true;const t=performance.now()/1000;fr++;
 for(const M of b.crew){M.mv=0;let k='stand';const last=M.path.length-1;
  if(phase==='idle'){if(M.at===0&&M.idle&&((fr+M.i*7+b.n*13)%24))continue;/* nobody moving: a breath of the idle pose now and then is plenty */
   const ok=crewMove(M,0,dt);if(!ok){k='run';all=false}else{M.yaw+=wr(M.homeYaw-M.yaw)*Math.min(1,dt*8);M.idle=Math.abs(wr(M.homeYaw-M.yaw))<.02?1:0}}
  else{M.idle=0;
   if(phase==='ready'){const ok=crewMove(M,1,dt);if(!ok){k='run';all=false}else{k=last===1?'set':'set';M.yaw+=wr(Math.atan2(M.face.x-M.pos.x,M.face.z-M.pos.z)-M.yaw)*Math.min(1,dt*10)}}
   else if(phase==='work'){const ok=crewMove(M,last,dt);if(!ok){k='run';all=false}else{k=M.role;M.yaw+=wr(Math.atan2(M.face.x-M.pos.x,M.face.z-M.pos.z)-M.yaw)*Math.min(1,dt*12)}}
   else{const ok=crewMove(M,0,dt);if(!ok){k='run';all=false}else M.yaw+=wr(M.homeYaw-M.yaw)*Math.min(1,dt*8)}}
  /* in the way out: anyone not yet back on the wall side of the car (the first point of every way is on that side) */
  if((M.pos.x-b.p.x)*b.rt[0]+(M.pos.z-b.p.z)*b.rt[1]<1.35)clear=false;
  /* a tyre swap: the four on the wheels run out with a fresh tyre held in front of them, and carry the old one back */
  {const tw=b.svc==='tyre'&&M.i<4&&k==='run'?(phase==='work'?1:(phase==='home'||phase==='idle')?2:0):0;if(tw||M.tw){const q=tyreMeshes(M);if(q){q[0].visible=tw===1;q[1].visible=tw===2}M.tw=tw}if(tw)k='runc'}
  M.R.g.position.copy(M.pos);M.R.g.rotation.y=M.yaw;crewPose(M,k,k==='run'||k==='runc'?M.ph:t+M.ph)}
 b.clear=clear;return all}

/* ---------- pit lane dressing (Nov 15, Hakan: only the props he supplied, nothing overlapping, cones where the cars stop, decorated tents) ----------
   Models: the tyre set, the tool pack (tool box, hammer, wrenches), the tool shelf and the traffic pack (cones, barrels, delineators, barricades),
   all from PITPROPS_B64 (project files only). Everything is placed in tent space: a metres along the tent row from a tent's centre, d metres from the
   row's centre line toward the lane. The tent roofs end at d 3, the pit wall is at d 6.2, the apron is 6.4 to 11.4 and the lane's own line is about 14.6.
   A box's crew works at d 7.2 to 7.8 and the car stops at d 9.1, so the apron by a box is left clear: its cones stand on the lane edge between boxes.
   Every piece goes through claim(): a footprint rectangle in tent space that may not touch one already placed. */
let PROPS=null,propsP=null;
function loadProps(){return propsP||(propsP=new Promise(res=>{const B=window.PITPROPS_B64;if(!B||!THREE.GLTFLoader){res(null);return}
 const cib=window.createImageBitmap;window.createImageBitmap=undefined;const out={};let left=0;const done=()=>{if(--left===0){window.createImageBitmap=cib;res(PROPS=out)}};
 for(const k of Object.keys(B)){left++;try{const raw=atob(B[k]),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
  new THREE.GLTFLoader().parse(u.buffer,'',g=>{try{g.scene.updateMatrixWorld(true);const ms=[];g.scene.traverse(o=>{if(o.isMesh)ms.push(o)});out[k]=ms}catch(e){console.warn('pit props',k,e)}done()},e=>{console.warn('pit props',k,e);done()})}catch(e){console.warn('pit props',k,e);done()}}}))}
/* a mesh's geometry in metres, standing on y=0 and centred on x, z */
function baked(m,part){const g=(part||m.geometry).clone();g.applyMatrix4(m.matrixWorld);g.computeBoundingBox();const b=g.boundingBox;g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);g.computeBoundingBox();return{g,mat:m.material,sz:g.boundingBox.getSize(V())}}
/* the traffic pack has one mesh holding the cone, delineator and barrel as separate parts: split it into the welded islands */
function islands(m){const g=m.geometry,idx=g.index.array,pos=g.attributes.position,n=pos.count,par=new Int32Array(n).map((_,i)=>i),f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x},hm=new Map();
 for(let i=0;i<n;i++){const k=Math.round(pos.getX(i)*400)+','+Math.round(pos.getY(i)*400)+','+Math.round(pos.getZ(i)*400);if(hm.has(k))par[i]=hm.get(k);else hm.set(k,i)}
 for(let i=0;i<idx.length;i+=3){const a=f(idx[i]);par[f(idx[i+1])]=a;par[f(idx[i+2])]=a}
 const gr={};for(let i=0;i<idx.length;i+=3)(gr[f(idx[i])]||(gr[f(idx[i])]=[])).push(i);
 return Object.values(gr).map(tr=>{const map=new Map(),P_=[],N_=[],U_=[],I_=[];for(const t of tr)for(let k=0;k<3;k++){const v=idx[t+k];if(!map.has(v)){map.set(v,P_.length/3);P_.push(pos.getX(v),pos.getY(v),pos.getZ(v));N_.push(g.attributes.normal.getX(v),g.attributes.normal.getY(v),g.attributes.normal.getZ(v));U_.push(g.attributes.uv.getX(v),g.attributes.uv.getY(v))}I_.push(map.get(v))}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P_,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(N_,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(U_,2));G.setIndex(I_);return G})}
function propLib(){if(!PROPS)return null;const L={},find=(k,re)=>(PROPS[k]||[]).find(m=>re.test(m.name));
 const add=(n,m,part)=>{if(m)try{L[n]=baked(m,part)}catch(e){}};
 add('tyre',find('tire',/Cylinder002/));add('tyres2',find('tire',/Cylinder004/));
 add('toolbox',find('tool',/Tool_box/));add('hammer',find('tool',/Hammer/));add('wrench',find('tool',/^Wrench/));add('pipewrench',find('tool',/Pipe_Wrench/));add('shelf',find('shelf',/./));
 add('barricadeA',find('traffic',/BarricadeA/));add('barricadeB',find('traffic',/BarricadeB/));
 const ta=find('traffic',/TrafficAssets/);if(ta){ta.updateMatrixWorld(true);for(const G of islands(ta)){G.computeBoundingBox();const g2=G.clone();g2.applyMatrix4(ta.matrixWorld);g2.computeBoundingBox();const z=g2.boundingBox.getSize(V());
  const nm=z.y>.5&&z.y<.7&&z.x<.5&&z.z<.5&&G.index.count/3>300?'cone':z.y>.9&&z.x>.8?'barrel':z.y>.9&&z.x<.5&&z.z<.4&&z.x>.3?'panel':z.y>1&&z.x<.2?'post':null;if(nm&&!L[nm])add(nm,ta,G)}}
 return L}
function dress(Rc,PL){const q=laneOf(Rc);if(!q||!q.L.tents||PL.dressed)return;PL.dressed=1;const {L,f}=q,T=Rc.T,o=L.o,u=L.u,n=L.side,yawU=Math.atan2(u[0],u[1]),lib=propLib();if(!lib)return;
 const inst={};/* one instanced mesh per model */
 const used=[];/* footprints already taken: [t, a0, a1, d0, d1] in tent space, tent t's row coordinate */
 const hit=(t,a,d,ra,rd)=>used.some(r=>Math.abs(r[0]-t)<.001&&a-ra<r[2]&&a+ra>r[1]&&d-rd<r[4]&&d+rd>r[3]);
 /* put model k at (t, a, d) turned ry about the up axis, scaled s; ra, rd are its half sizes along the row and across it. Refused if it would touch something. */
 const place=(k,t,a,d,ry,s,y0)=>{const e=lib[k];if(!e)return false;s=s||1;const sx=e.sz.x*s/2,sz=e.sz.z*s/2,c=Math.abs(Math.cos(ry-yawU)),sn=Math.abs(Math.sin(ry-yawU)),ra=sz*c+sx*sn+.04,rd=sx*c+sz*sn+.04;
  /* the row axis is x in tent space, the cross axis d: a model turned by ry (relative to the row) covers ra by rd */
  if(!y0){if(hit(t,a,d,ra,rd))return false;used.push([t,a-ra,a+ra,d-rd,d+rd])}
  const wx=(o[0]+u[0]*t)*f+u[0]*a-n[0]*d,wz=(o[1]+u[1]*t)*f+u[1]*a-n[1]*d,wy=T.terr(wx,wz)+(y0||0);
  (inst[k]||(inst[k]=[])).push([wx,wy,wz,ry,s]);return true};
 const row=yawU,across=yawU+Math.PI/2;/* a model's own +x along the row / along the cross axis */
 const boxT=new Set(L.boxT||[]);
 L.tents.forEach((t,ti)=>{const isBox=boxT.has(t),r=(i)=>{let x=Math.sin((t+i)*12.9898)*43758.5453;return x-Math.floor(x)};
  /* under the roof: the shelf against the back, tool boxes and tyre stacks on the floor, a hammer and a wrench on a box */
  place('shelf',t,0,-2.35,across,.8);place('toolbox',t,-2.15,-.9,row+.2+r(1)*.3,.16);place('toolbox',t,-1.2,-1.7,row-.1,.13);
  const stack=(a,d,h,k)=>{if(place('tyre',t,a,d,r(k)*6,1))for(let i=1;i<h;i++)place('tyre',t,a,d,r(k+i)*6,1,i*.4)};
  stack(2.2,-1.5,3,0);stack(1.35,-1.9,2,4);
  /* between the tent and the pit wall: tall stacks against the tent legs, a pair leaning on the wall, nothing near the crew's gate in the middle */
  stack(-2.5,3.75,2+(r(7)*3|0),9);stack(2.45,3.7,3+(r(8)*2|0),14);
  place('tyres2',t,-1.2,5.1,across+r(3)*.3,1);place('tyres2',t,1.6,5.25,across+r(5)*.3,1);
  if(r(2)<.5)place('barrel',t,-3.0,5.2,0,1);
  if(isBox){
   /* the stop: two cones on the lane edge at each end of the box and a delineator on the wall by each, so the driver sees where the car must stand */
   for(const e of[-1,1]){place('cone',t,e*4.4,11.9,0,1);place('cone',t,e*4.4+e*.45,11.9,0,1);place('panel',t,e*4.65,6.85,across,1)}
   place('cone',t,0,12.4,0,1)}
  else{
   /* a spare bay: barricades against the wall and cones in front of them */
   place('barricadeA',t,-1.7,6.9,across,1);place('barricadeA',t,1.7,6.9,across,1);for(const e of[-3.0,0,3.0])place('cone',t,e,7.7,0,1);place('post',t,-3.8,7.1,0,1);place('post',t,3.8,7.1,0,1)}});
 const grp=new THREE.Group();grp.name='pitDress';const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
 for(const k in inst){const e=lib[k],list=inst[k],im=new THREE.InstancedMesh(e.g,e.mat,list.length);list.forEach((p,i)=>{_e.set(0,p[3],0);_q.setFromEuler(_e);_m.compose(V(p[0],p[1],p[2]),_q,V(p[4],p[4],p[4]));im.setMatrixAt(i,_m)});im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;grp.add(im)}
 Rc.scene.add(grp);PL.props=Object.fromEntries(Object.keys(inst).map(k=>[k,inst[k].length]))}

/* ---------- the quick time event: three stages of 3, 4 and 5 keys, drawn like the race HUD (flat dark plates, the white row for what is live, red for the gap) ---------- */
const KEYS=[[['KeyQ','Q'],['KeyW','W'],['KeyE','E'],['KeyA','A'],['KeyS','S'],['KeyD','D']],
 [['ArrowUp','↑'],['ArrowDown','↓'],['ArrowLeft','←'],['ArrowRight','→'],['PageUp','PG UP'],['PageDown','PG DN']]];
const STAGES=[3,4,5],SNAME=['JACK UP','REPAIR','TORQUE DOWN'],SNAMET=['JACK UP','SWAP TYRES','TORQUE DOWN'];
const css=document.createElement('style');css.textContent=`
.ptQ{position:fixed;z-index:40;display:none;pointer-events:none;font-family:"PTExo",var(--gt,Inter,sans-serif);color:#fff;--u:1px}
.ptQ.on{display:block}
.ptQ .bar{position:absolute;left:calc(50% + var(--u)*22);width:max-content;top:calc(var(--u)*14);transform:translateX(-50%);display:flex;align-items:stretch;gap:calc(var(--u)*3);white-space:nowrap}
.ptQ .bar span{display:block;white-space:nowrap;flex:none;padding:0 calc(var(--u)*8);font:600 calc(var(--u)*11)/calc(var(--u)*30) "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.14em;color:#aeb6bd;background:rgba(20,22,25,.82);border-radius:2px}
.ptQ .bar span:nth-child(1){min-width:calc(var(--u)*118);text-align:center;box-sizing:border-box;padding:0 calc(var(--u)*5)}.ptQ .bar span{box-sizing:border-box}
.ptQ .bar span.on{color:#15181c;background:#f4f6f7}
.ptQ .bar span.tm{color:#fff;background:#c81e1a;font-variant-numeric:tabular-nums;letter-spacing:.04em;min-width:calc(var(--u)*72);text-align:center;font-weight:700}
.ptQ .pm{position:absolute;left:50%;width:max-content;bottom:calc(var(--u)*26);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*9)}
.ptQ .cap{font:700 calc(var(--u)*17) "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.03em;color:#fff;text-shadow:0 1px 0 #000,0 0 calc(var(--u)*8) #000b;white-space:nowrap}
.ptQ .cap i{font-style:normal;color:#ff8a80;margin-left:calc(var(--u)*10)}
.ptQ .ks{display:flex;gap:calc(var(--u)*3)}
.ptQ .ks b{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*5);min-width:calc(var(--u)*92);height:calc(var(--u)*68);padding:0 calc(var(--u)*10);box-sizing:border-box;border-radius:2px;background:rgba(36,38,41,.88);color:#e9edf0;font:700 calc(var(--u)*24)/1 "PTExo",var(--gt,Inter,sans-serif);border-bottom:calc(var(--u)*3) solid rgba(255,255,255,.12)}
.ptQ .ks b::before{content:attr(data-n);font:600 calc(var(--u)*10)/1 "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.16em;color:#9aa3ab}
.ptQ .ks b.now{background:#f4f6f7;color:#15181c;border-bottom-color:#c81e1a}.ptQ .ks b.now::before{color:#5d656c}
.ptQ .ks b.ok{opacity:.4}
.ptQ.bad .ks b.now{background:#c81e1a;border-bottom-color:#c81e1a;color:#fff;animation:ptQs .24s}
@keyframes ptQs{25%{transform:translateX(calc(var(--u)*-5))}75%{transform:translateX(calc(var(--u)*5))}}
.ptQ.msg .pm{display:none}
.ptQ .bar span{border-radius:calc(var(--u)*6);background:rgba(18,22,28,.78) var(--ps-glass);box-shadow:inset 0 1px 0 #ffffff26,0 3px 10px #0007;font-family:var(--mn,"PTExo",sans-serif)}
.ptQ .bar span.on{color:#fff;background:var(--gxa);box-shadow:var(--gxaS)}
.ptQ .bar span.tm{background:rgba(18,22,28,.78) var(--ps-glass);color:#fff;box-shadow:inset 0 1px 0 #ffffff26,inset 0 -2px 0 #c81e1a,0 3px 10px #0007}
.ptQ .ks b,.ptQ .ty{border-radius:calc(var(--u)*8);background:rgba(18,22,28,.78) var(--ps-glass);box-shadow:inset 0 1px 0 #ffffff26,0 3px 10px #0007;border-bottom:0;font-family:var(--mn,"PTExo",sans-serif)}
.ptQ .ks b.now,.ptQ.mnu .ks b:hover{background:var(--gxa);color:#fff;box-shadow:var(--gxaS);border-bottom:0}
.ptQ .ks b.now::before,.ptQ.mnu .ks b:hover::before,.ptQ.mnu .ks b:hover small{color:#dbe9f7}
.ptQ.bad .ks b.now{background:linear-gradient(180deg,#e0605a,#b02a24 50%,#8f1a15);box-shadow:inset 0 1px 0 #ffffffa0,0 0 16px #c81e1a90}
.ptQ .ty .tg b{border-radius:calc(var(--u)*4);box-shadow:none;background:var(--c,#4ade80)}
.ptQ .cap{font-family:var(--mn,"PTExo",sans-serif)}
.ptQ .bar span.cn{pointer-events:auto;cursor:pointer;min-width:calc(var(--u)*86);text-align:center}.ptQ .bar span.cn:hover{color:#fff;background:linear-gradient(180deg,#e0605a,#b02a24 50%,#8f1a15)}.ptQ .bar span.cn.off{opacity:.35;pointer-events:none}
.ptFade{z-index:45}
.ptQ .ty{display:flex;align-items:center;gap:calc(var(--u)*10);padding:calc(var(--u)*7) calc(var(--u)*10);background:rgba(20,22,25,.82);border-radius:2px}
.ptQ .ty .tg{display:grid;grid-template-columns:repeat(2,calc(var(--u)*52));gap:calc(var(--u)*3)}
.ptQ .ty .tg b{display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(var(--u)*34);border-radius:2px;color:#0e1114;font:700 calc(var(--u)*13)/1 "PTExo",var(--gt,Inter,sans-serif);background:var(--c,#4ade80)}
.ptQ .ty .tg b::before{content:attr(data-p);font:600 calc(var(--u)*7.5)/1.4 "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.14em;opacity:.7}
.ptQ .ty .gp{width:calc(var(--u)*118);font:600 calc(var(--u)*9)/1 "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.14em;color:#aeb6bd}
.ptQ .ty .gp div{height:calc(var(--u)*7);margin-top:calc(var(--u)*6);background:rgba(255,255,255,.14)}.ptQ .ty .gp div i{display:block;height:100%;background:var(--c,#4ade80)}
.ptQ .ty .gp em{display:block;margin-top:calc(var(--u)*5);font-style:normal;font-size:calc(var(--u)*15);color:#fff;letter-spacing:.02em;font-weight:700}
.ptQ.mnu .ks b{pointer-events:auto;cursor:pointer;min-width:calc(var(--u)*150);height:calc(var(--u)*74);font-size:calc(var(--u)*20);letter-spacing:.06em}
.ptQ.mnu .ks b small{font:600 calc(var(--u)*9) "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.08em;color:#9aa3ab}
.ptQ.mnu .ks b:hover{background:#f4f6f7;color:#15181c;border-bottom-color:#c81e1a}.ptQ.mnu .ks b:hover small,.ptQ.mnu .ks b:hover::before{color:#5d656c}
.ptFade{position:fixed;z-index:45;background:#000;opacity:0;pointer-events:none;transition:opacity .45s ease}
.ptPit .h8spd,.ptPit .gtPc:not([data-k=MM]),.ptPit .gtTy,.ptPit .gtBrk{opacity:0!important;transition:opacity .4s}
.h8spd,.gtPc,.gtTy,.gtBrk{transition:opacity .4s}`;document.head.appendChild(css);
const QE=[null,null];
function qel(k){if(QE[k]&&QE[k].isConnected)return QE[k];const e=document.createElement('div');e.className='ptQ';e.innerHTML='<div class="bar"><span>SERVICE</span><span class="cn">CANCEL</span><span class="tm"></span></div><div class="pm"><div class="cap"></div><div class="ty" style="display:none"></div><div class="ks"></div></div>';document.body.appendChild(e);return QE[k]=e}
function qPlace(c,e){const r=c.rect||[0,0,1,1],w=r[2]*innerWidth,h=r[3]*innerHeight;e.style.left=(r[0]*100)+'%';e.style.top=((1-(r[1]+r[3]))*100)+'%';e.style.width=(r[2]*100)+'%';e.style.height=(r[3]*100)+'%';e.style.setProperty('--u',Math.max(.6,Math.min(w/640,1.4)).toFixed(3)+'px');e.style.setProperty('--vw',w.toFixed(0)+'px')}
const fmtT=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(3)};
/* the strip across the top: where the stop has got to, and its clock */
function qBar(c,st,step){const e=qel(c.k);qPlace(c,e);e.classList.add('on');const sp=e.querySelectorAll('.bar span');if(e._s!==step){e._s=step;sp[0].classList.toggle('on',step<2);sp[1].classList.toggle('off',step>1);if(step!==1)sp[0].textContent='SERVICE'}
 const t=fmtT(Math.max(0,st.T));if(e._t!==t){e._t=t;sp[2].textContent=t}return e}
function qShow(c,st){const e=qBar(c,st,1);e.classList.remove('msg');e.classList.remove('mnu');e._m=null;const sp=e.querySelectorAll('.bar span')[0],tx=(st.svc==='tyre'?'TYRE SWAP ':'REPAIR ')+(st.stg+1)+'/'+STAGES.length;if(sp.textContent!==tx)sp.textContent=tx;
 e.querySelector('.cap').innerHTML=((st.svc==='tyre'?SNAMET:SNAME)[st.stg]||'REPAIR')+(st.pen>0?'<i>+'+st.pen.toFixed(0)+' s</i>':'');
 e.querySelector('.ks').innerHTML=st.q.map((q,i)=>'<b data-n="'+(i+1)+'" class="'+(i<st.qi?'ok':i===st.qi?'now':'')+'">'+q[1]+'</b>').join('')}
function hudPit(c,on){const h=document.getElementById('h'+c.k);if(h)h.classList.toggle('ptPit',!!on)}
function qHide(c){const e=QE[c.k];if(e){e.classList.remove('on','msg','bad','mnu');e._s=null;e._m=null}}
const newQ=(c,n)=>{const s=KEYS[c.k===1?1:0];let last=-1;return Array.from({length:n},()=>{let i;do{i=Math.floor(Math.random()*s.length)}while(i===last&&Math.random()<.7);last=i;return s[i]})};
/* the two menus: PIT IN / PIT OUT, then REPAIR / TIRE SWAP. The tyre meter (one box per tyre, green good to red worn, and the grip bar) shows on the second */
const tyCol=v=>'hsl('+Math.round(125*Math.pow(cl((v-.05)/.9,0,1),.8))+' 72% 52%)';
function qMenu(c,st){const e=qBar(c,st,0);e.classList.remove('msg');e.classList.add('mnu');const m=st.ph==='menu1',w=c._tw||[1,1,1,1],g=c._tyG==null?1:c._tyG,kh=c.k===1?['←','→']:['Q','E'];
 const pc=v=>'<em style="font-style:normal;color:'+tyCol(v)+'">'+Math.round(v*100)+'%</em>';const sig=(m?1:2)+'|'+Math.round(g*100)+'|'+w.map(v=>Math.round(v*100)).join(',')+'|'+Math.round((c.dmg||0)*100);if(e._m===sig)return;e._m=sig;
 const O=m?[['PIT IN','REPAIR OR NEW TYRES'],['PIT OUT','BACK TO THE RACE']]:[['REPAIR','FIX THE DAMAGE  '+pc(1-(c.dmg||0))],['TIRE SWAP','TYRE CONDITION  '+pc((w[0]+w[1]+w[2]+w[3])/4)]];
 e.querySelector('.cap').textContent=m?'PIT STOP':'CHOOSE THE WORK';
 const ty=e.querySelector('.ty');ty.style.display='none';
 if(0)ty.innerHTML='<div class="tg">'+['FL','FR','RL','RR'].map((n,i)=>'<b data-p="'+n+'" style="--c:'+tyCol(w[i])+'">'+Math.round(w[i]*100)+'%</b>').join('')+'</div><div class="gp">TYRE GRIP<div style="--c:'+tyCol(g)+'"><i style="width:'+Math.round(g*100)+'%"></i></div><em>'+Math.round(g*100)+'%</em></div>';
 e.querySelector('.ks').innerHTML=O.map((o,i)=>'<b data-n="'+kh[i]+'" data-i="'+i+'">'+o[0]+'<small>'+o[1]+'</small></b>').join('')}
function pick(Rc,c,i){const st=c&&c._pit;if(!st||(st.ph!=='menu1'&&st.ph!=='menu2'))return;try{P.sfx&&P.sfx('select')}catch(e){}
 if(st.ph==='menu1'){if(i===0){st.ph='menu2';const e=qel(c.k);e._m=null;qMenu(c,st)}else{st.svc=null;startFade(c,st)}return}
 st.svc=i===0?'repair':'tyre';st.ph='qte';st.t=0;st.stg=0;st.q=newQ(c,STAGES[0]);st.qi=0;st.pen=0;st.wait=0;qShow(c,st)}
const FE=[null,null];
function fadeEl(c,on){let f=FE[c.k];if(!f||!f.isConnected){if(!on)return;f=FE[c.k]=document.createElement('div');f.className='ptFade';document.body.appendChild(f)}
 const r=c.rect||[0,0,1,1];f.style.left=(r[0]*100)+'%';f.style.top=((1-(r[1]+r[3]))*100)+'%';f.style.width=(r[2]*100)+'%';f.style.height=(r[3]*100)+'%';f.style.opacity=on?1:0}
function startFade(c,st){st.ph='fade';st.t=0;const e=qBar(c,st,2);e.classList.add('msg');e.classList.remove('mnu');e._m=null;fadeEl(c,1)}
addEventListener('click',ev=>{const cn=ev.target&&ev.target.closest&&ev.target.closest('.ptQ .bar .cn');if(cn){const Rc=typeof RACE!=='undefined'?RACE:null,k=QE.indexOf(cn.closest('.ptQ')),c=Rc&&Rc.cars&&Rc.cars.find(h=>h.human&&h.k===k),st=c&&c._pit;if(st&&(st.ph==='menu1'||st.ph==='menu2'||st.ph==='qte')){st.svc=null;try{P.sfx&&P.sfx('back')}catch(e){}startFade(c,st)}return}
 const b=ev.target&&ev.target.closest&&ev.target.closest('.ptQ .ks b[data-i]');if(!b)return;const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars)return;const k=QE.indexOf(b.closest('.ptQ')),c=Rc.cars.find(h=>h.human&&h.k===k);if(c)pick(Rc,c,+b.dataset.i)},true);
addEventListener('keydown',ev=>{const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars||typeof scr==='undefined'||scr!=='game'||ev.repeat)return;
 for(const c of Rc.cars){const st=c._pit;if(st&&(st.ph==='menu1'||st.ph==='menu2')){const mk=c.k===1?['ArrowLeft','ArrowRight']:['KeyQ','KeyE'],i=mk.indexOf(ev.code);if(i>=0){ev.preventDefault();pick(Rc,c,i)}continue}
  if(!st||st.ph!=='qte'||!st.q||st.qi>=st.q.length)continue;const set=KEYS[c.k===1?1:0];if(!set.some(q=>q[0]===ev.code))continue;
  if(/^(Arrow|Page)/.test(ev.code))ev.preventDefault();
  if(ev.code===st.q[st.qi][0]){st.qi++;try{P.sfx&&P.sfx('select')}catch(e){}
   if(st.qi>=st.q.length&&st.stg<STAGES.length-1){st.stg++;st.q=newQ(c,STAGES[st.stg]);st.qi=0;try{P.sfx&&P.sfx('buy')}catch(e){}}}
  else{st.pen+=1;st.wait+=1;const e=qel(c.k);e.classList.remove('bad');void e.offsetWidth;e.classList.add('bad');try{P.sfx&&P.sfx('back')}catch(e){}}
  qShow(c,st)}},true);

/* ---------- the stop itself ---------- */
const pitOK=Rc=>!!(Rc&&Rc.T&&Rc.cars&&Rc.state==='race'&&Rc.cars.filter(c=>c.human).length===2&&!(Rc.cfg&&(Rc.cfg.rally||Rc.cfg.freeroam))&&laneOf(Rc)&&!(window.PTO&&window.PTO.pit===false));
function lane(Rc){if(Rc._pl===undefined){Rc._pl=build(Rc);if(Rc._pl){const PL=Rc._pl;PL.boxes.forEach((b,i)=>b.n=i);loadProps().then(()=>{if(typeof RACE!=='undefined'&&RACE===Rc)try{dress(Rc,PL)}catch(e){console.warn('pit dress',e)}})
   /* every box has its crew standing by from the start, each in its own colour */
   loadCrew().then(()=>{if(typeof RACE!=='undefined'&&RACE===Rc)for(const b of PL.boxes)try{mkCrew(Rc,PL,b)}catch(e){console.warn('pit crew',e)}})}}return Rc._pl}
function enter(Rc,c,PL,i){const b=PL.boxes.find(q=>!q.by&&q.s>PL.S[i]+PL.box+4)||PL.boxes.find(q=>!q.by);if(!b)return;b.by=c;const h=Rc.T.surf(c.x,c.z,c.y).h;
 b.svc=null;c.camX=0;c._pit={ph:'in',svc:null,sel:-1,s:PL.S[i],b,v:Math.max(MPH15,c.sp||0),ox:c.x-PL.X[i],oz:c.z-PL.Z[i],oy:c.yaw,rh:cl(c.y-h,.25,1.3),lift:0,t:0,T:0,q:null,qi:0,stg:0,pen:0,wait:0};
 const p=pose(PL,c._pit.s,b);c._pit.oy=wr(c.yaw-p.yaw);mkCrew(Rc,PL,b);try{P.sfx&&P.sfx('click')}catch(e){}}
function leave(Rc,c){const st=c._pit;if(!st)return;fadeEl(c,0);if(st.b.by===c)st.b.by=null;c._pit=null;c._pitOut=Rc.t;qHide(c);hudPit(c,false)}
function rail(Rc,c,dt){const st=c._pit,PL=Rc._pl,T=Rc.T,b=st.b;st.t+=dt;if(st.ph==='qte'||st.ph==='back')st.T+=dt;
 /* speed: hard on the brakes down to the lane limit, 15 mph for the last metres, to a stop on the box, away again at the limit */
 let vt=LANE_V;const left=b.s-st.s;if(st.ph==='in')vt=left>9?Math.min(LANE_V,Math.sqrt(MPH15*MPH15+2*5*(left-9))):Math.min(MPH15,Math.sqrt(Math.max(0,2*2.6*left))+.03);else if(st.ph!=='go')vt=0;
 st.v+=cl(vt-st.v,-(st.v>LANE_V+.5?17:8)*dt,5.2*dt);if(st.ph==='in'&&left<.04){st.v=0;st.s=b.s}st.s=Math.min(PL.len,st.s+st.v*dt);
 const k=Math.exp(-dt*3.2);st.ox*=k;st.oz*=k;st.oy*=k;const p=pose(PL,st.s,b);
 c.x=p.x+st.ox;c.z=p.z+st.oz;c.yaw=p.yaw+st.oy;
 /* the body follows the ground under it: height from the middle, nose and roll from the slope fore-aft and across (it used to level out and float its nose on the hill) */
 const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw),h=T.surf(c.x,c.z,c.y).h,hf=T.surf(c.x+sy*1.3,c.z+cy*1.3,c.y).h,hr=T.surf(c.x-sy*1.3,c.z-cy*1.3,c.y).h,ha=T.surf(c.x+cy*.8,c.z-sy*.8,c.y).h,hb=T.surf(c.x-cy*.8,c.z+sy*.8,c.y).h;
 const jack=st.ph==='qte'&&b.arr?.075:0;st.lift+=(jack-st.lift)*Math.min(1,dt*7);
 c.y+=(((hf+hr)/2+h)/2+st.rh+st.lift-c.y)*Math.min(1,dt*12);
 const tp=cl(-Math.atan2(hf-hr,2.6),-.4,.4),tr=cl(Math.atan2(ha-hb,1.6),-.4,.4),kk=Math.min(1,dt*9);c.pitch+=(tp-c.pitch)*kk;c.roll+=(tr-c.roll)*kk;
 c.vx=Math.sin(p.yaw)*st.v;c.vz=Math.cos(p.yaw)*st.v;c.vy=0;c.sp=st.v;c.yr=0;c.wpt=c.wrl=0;c.st=(c.st||0)*.85;c.wrong=0;c.stuck=0;c.boost=0;c.drifting=false;c.driftTimer=0;
 if(c.in){c.in.th=0;c.in.br=0;c.in.st=0;c.in.hb=0}
 /* lap progress, as the physics step does it */
 {let bi=c.idx,bd=1e18;const N=T.N;for(let q=-6;q<=30;q++){const i=(c.idx+q+N)%N,dx=c.x-T.x[i],dz=c.z-T.z[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bi=i}}let dl=bi-c.idx;if(dl>N/2)dl-=N;if(dl<-N/2)dl+=N;if(Math.abs(dl)<40){c.idx=bi;c.unw+=dl}}
 if(st.ph==='in'){const near=b.s-st.s<70;hudPit(c,near);if(near)qBar(c,st,0).classList.add('msg');else qHide(c);if(st.v===0&&st.s===b.s){st.ph='menu1';st.t=0;st.sel=-1;qMenu(c,st)}}
 else if(st.ph==='menu1'||st.ph==='menu2'){hudPit(c,true);qMenu(c,st)}
 else if(st.ph==='qte'){qBar(c,st,1);if(st.wait>0)st.wait-=dt;if(st.stg>=STAGES.length-1&&st.qi>=st.q.length&&st.wait<=0){st.ph='back';st.t=0;if(st.svc==='tyre'){c._tw=[1,1,1,1];c._tyG=1;c._tyK=1;c.tyre=1}else c.dmg=0;c.fuel=1;qBar(c,st,2).classList.add('msg');try{P.sfx&&P.sfx('buy')}catch(e){}}}
 else if(st.ph==='back'){qBar(c,st,2);if((!b.crew||b.clear)&&st.t>.2)startFade(c,st)}
 /* the work is done: a black fade, back to the default camera while it is dark, then the car drives itself out */
 else if(st.ph==='fade'){qBar(c,st,2);if(st.t>.55&&(!b.crew||b.clear)){c.camX=0;fadeEl(c,0);st.ph='go';st.t=0}}
 else if(st.ph==='go'){qBar(c,st,2);hudPit(c,st.t<1.4||st.s<PL.len-30);if(st.t>2.2)qHide(c);if(st.s>=PL.len-.05){c.sp=st.v;leave(Rc,c)}}}
function tick(Rc,dt){const PL=lane(Rc);if(!PL)return;
 for(const c of Rc.cars){if(!c.human||c._pit||c.fin||c.respT>0)continue;if(c._pitOut!=null&&Rc.t-c._pitOut<4)continue;if((c.sp||0)<1.5)continue;
  const n=PL.near(c.x,c.z);if(n.d>2.6||PL.S[n.i]<PL.entry[0]||PL.S[n.i]>PL.entry[1])continue;const p=pose(PL,PL.S[n.i],null);if(Math.sin(p.yaw)*c.vx+Math.cos(p.yaw)*c.vz<1)continue;enter(Rc,c,PL,n.i)}
 for(const b of PL.boxes){if(!b.crew)continue;const c=b.by,st=c&&c._pit;let ph='idle';b.arr=false;
  /* the crew is on its way while the car is still rolling in: out to their marks from 45 m away, round the car the moment it stops */
  if(st){b.svc=st.svc||null;if(st.ph==='in')ph=b.s-st.s<45?'ready':'idle';else if(st.ph==='menu1'||st.ph==='menu2')ph='ready';else if(st.ph==='qte')ph='work';else ph='home'}
  const ok=crewTick(b,dt,ph);if(ph==='work')b.arr=ok}}
/* the car on the rail skips the physics step altogether; everyone else drives as before */
/* tyre wear (Nov 16, Hakan): each of the four tyres has its own life, worn by cornering (the outside pair most), braking (the fronts) and spinning the drive wheels (the rears).
   The grip bar is the sum of it: 100% on new tyres, 16% less on worn out ones, and a tyre swap in the pits makes them new again. */
function wear(c,dt){const w=c._tw||(c._tw=[1,1,1,1]);const dy=wr(c.yaw-(c._twY==null?c.yaw:c._twY));c._twY=c.yaw;const la=(c.sp||0)*dy/Math.max(dt,1e-3)/9.81;c._twL=(c._twL||0)+(cl(la,-3,3)-(c._twL||0))*Math.min(1,dt*5);
 const sp=c.sp||0;if(sp>2){const ag=Math.min(2,Math.abs(c._twL)),L=c._twL>0?[.5,1.3,.5,1.3]:[1.3,.5,1.3,.5],br=c.in?c.in.br||0:0,th=c.in?c.in.th||0:0,sl=c.drifting?1:0;
  for(let i=0;i<4;i++){const fr=i<2;w[i]=Math.max(0,w[i]-dt*(.0005+.0014*ag*L[i]+.0011*br*(fr?1.2:.8)+(fr?0:.0007*th*(sp<20?1:.4))+(sl?.0015:0)))}}
 const g=.6*(w[0]+w[1]+w[2]+w[3])/4+.4*Math.min(w[0],w[1],w[2],w[3]);c._tyG=g;c._tyK=.84+.16*g}
const sc0=stepCar;stepCar=function(c,dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(c&&c._pit&&Rc&&Rc._pl){if(Rc.state!=='race'||c.fin){leave(Rc,c)}else{rail(Rc,c,dt);return}}
 const r=sc0.apply(this,arguments);if(c&&c.human&&!c.forceAI&&dt>0&&Rc&&Rc.state==='race'&&!c.fin&&!(c.respT>0)&&Rc._pl&&pitOK(Rc))try{wear(c,dt)}catch(e){}return r};
const s0=step;step=function(dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(Rc&&Rc.cars&&!Rc._cam0){Rc._cam0=1;for(const c of Rc.cars)if(c.human)c.camX=0}if(Rc&&pitOK(Rc)){try{tick(Rc,dt)}catch(e){if(!Rc._pe){Rc._pe=1;console.warn('pit',e)}}}else{for(const e of QE)if(e)e.classList.remove('on');document.querySelectorAll('.ptPit').forEach(h=>h.classList.remove('ptPit'));for(const f of FE)if(f)f.style.opacity=0}return s0.apply(this,arguments)};
/* the pit camera (Nov 15, Hakan: an angle like Gran Turismo's): once the car is nearly on its marks the view cuts to a low three-quarter shot from the lane side,
   the car and its crew in front of the pit wall and the tents, and stays there until the car pulls away. Set after the camera layer so it has the last word. */
setTimeout(()=>{const pc=soloCam;soloCam=function(c,dt,out){pc.apply(this,arguments);try{const st=c&&c._pit,b=st&&st.b;if(!st||!b||!b.W||!out||!out.p)return;
  const on=st.ph==='qte'||st.ph==='back'||st.ph==='fade'||st.ph==='menu1'||st.ph==='menu2'||(st.ph==='in'&&b.s-st.s<5.5);if(!on)return;
  const r=c.rect,asp=r?(r[2]*innerWidth)/Math.max(1,r[3]*innerHeight):1.78,nar=asp<1.25,dr=st.ph==='qte'?Math.sin(st.t*.35)*.25:0;
  const a=b.W(nar?-4.9:-4.5,(nar?4.4:3.9)+dr),l=b.W(.25,.15);out.p.set(a.x,a.y+.85,a.z);out.l.set(l.x,l.y+(nar?-.05:.3),l.z);out.f=nar?60:46;c.cb=0;c.inTn=false}catch(e){}}},600);
P.pit={pick:(c,i)=>pick(RACE,c,i),lane:Rc=>lane(Rc||RACE),KEYS,loadCrew,enter:(c)=>{const Rc=RACE,PL=lane(Rc);if(PL&&!c._pit)enter(Rc,c,PL,PL.near(PL.X[12],PL.Z[12]).i)}};
})();
