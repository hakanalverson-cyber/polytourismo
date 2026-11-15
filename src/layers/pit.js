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
 if(k==='run'){const s=Math.sin(ph),c=Math.cos(ph);/* a sprint: long stride, high knees, pumping arms, well forward over the feet */
  ps={hip:[0,hy-.07+.035*Math.cos(2*ph),0],lean:.34,flat:false,look:.16,feet:[[.085,Math.max(0,c)*.27,.43*s+.03],[.085,Math.max(0,-c)*.27,-.43*s+.03]],
   hands:[[.22,sy-arm*.5+.11*Math.max(0,-s),-.34*s+.14],[.22,sy-arm*.5+.11*Math.max(0,s),.34*s+.14]]}}
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
  M.R.g.position.copy(M.pos);M.R.g.rotation.y=M.yaw;crewPose(M,k,k==='run'?M.ph:t+M.ph)}
 b.clear=clear;return all}

/* ---------- pit lane dressing: tyre stacks, tool carts, fuel cans, air bottles, cones and pit boards by every tent (Nov 15, Hakan) ---------- */
function dress(Rc,PL){const q=laneOf(Rc);if(!q||!q.L.tents||PL.dressed)return;PL.dressed=1;const {L,f}=q,T=Rc.T,o=L.o,u=L.u,n=L.side,yawU=Math.atan2(u[0],u[1]);
 const mats={},mat=(c,r,m)=>mats[c+'|'+r]||(mats[c+'|'+r]=new THREE.MeshStandardMaterial({color:c,roughness:r==null?.8:r,metalness:m||0,flatShading:true}));
 const bins={},_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_n=new THREE.Matrix3();
 /* bake one piece into the bin of its material: a handful of draw calls for the whole lane */
 const put=(geo,m,x,y,z,ry,sx,sy,sz,rx)=>{const g=geo.index?geo.toNonIndexed():geo.clone();_e.set(rx||0,ry||0,0,'YXZ');_q.setFromEuler(_e);_m.compose(V(x,y,z),_q,V(sx||1,sy||sx||1,sz||sx||1));g.applyMatrix4(_m);const b=bins[m.uuid]||(bins[m.uuid]={m,p:[],n:[]});
  const P_=g.attributes.position.array;g.computeVertexNormals();const N_=g.attributes.normal.array;for(let i=0;i<P_.length;i++){b.p.push(P_[i]);b.n.push(N_[i])}g.dispose()};
 const G={tyre:new THREE.CylinderGeometry(.33,.33,.25,12),hub:new THREE.CylinderGeometry(.19,.19,.26,10),box:new THREE.BoxGeometry(1,1,1),cone:new THREE.ConeGeometry(.15,.46,8),cyl:new THREE.CylinderGeometry(.5,.5,1,10)};
 const rub=mat(0x16181b,.92),rim=mat(0xb9bec4,.45,.5),steel=mat(0x6b7178,.5,.5),dark=mat(0x23262b,.7),org=mat(0xe2601c,.7),wht=mat(0xe9ecef,.7),redc=mat(0xb3261e,.6);
 let sd=PL.len*1000|0;const rnd=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
 /* a spot in tent space: a metres along the row from tent t, k metres out from the tent row toward the lane */
 const at=(t,a,k)=>{const x=(o[0]+u[0]*t)*f+u[0]*a-n[0]*k,z=(o[1]+u[1]*t)*f+u[1]*a-n[1]*k;return[x,T.terr(x,z),z]};
 const stack=(p,h,ry,band)=>{for(let i=0;i<h;i++){const j=(rnd()-.5)*.05;put(G.tyre,rub,p[0]+j,p[1]+.125+i*.25,p[2]+j,rnd()*6);put(G.hub,i===h-1&&band?band:rim,p[0]+j,p[1]+.125+i*.25,p[2]+j,0)}};
 const lean=(p,ry)=>{put(G.tyre,rub,p[0],p[1]+.33,p[2],ry,1,1,1,Math.PI/2-.22);put(G.hub,rim,p[0],p[1]+.33,p[2],ry,1,1,1,Math.PI/2-.22)};
 const cart=(p,ry,c)=>{put(G.box,c,p[0],p[1]+.55,p[2],ry,.95,.62,.5);put(G.box,dark,p[0],p[1]+.88,p[2],ry,1.0,.05,.55);put(G.box,steel,p[0],p[1]+.2,p[2],ry,.9,.04,.46);
  for(const a of[-1,1])for(const b of[-1,1]){const dx=Math.cos(ry)*a*.4+Math.sin(ry)*b*.2,dz=-Math.sin(ry)*a*.4+Math.cos(ry)*b*.2;put(G.cyl,rub,p[0]+dx,p[1]+.08,p[2]+dz,ry,.16,.06,.16,Math.PI/2)}
  for(let i=0;i<3;i++)put(G.box,steel,p[0]+Math.sin(ry)*.255,p[1]+.36+i*.17,p[2]+Math.cos(ry)*.255,ry,.5,.025,.02)};
 const can=(p,ry,c)=>{put(G.box,c,p[0],p[1]+.23,p[2],ry,.34,.46,.18);put(G.cyl,dark,p[0]+Math.cos(ry)*.1,p[1]+.49,p[2]-Math.sin(ry)*.1,0,.07,.06,.07)};
 const cone=p=>{put(G.box,org,p[0],p[1]+.02,p[2],0,.34,.04,.34);put(G.cone,org,p[0],p[1]+.27,p[2],0);put(G.cyl,wht,p[0],p[1]+.3,p[2],0,.17,.07,.17)};
 const bottle=(p,c)=>{put(G.cyl,c,p[0],p[1]+.6,p[2],0,.24,1.2,.24);put(G.cyl,steel,p[0],p[1]+1.25,p[2],0,.1,.12,.1)};
 const board=(p,ry,c)=>{put(G.cyl,steel,p[0],p[1]+.8,p[2],0,.04,1.6,.04);put(G.box,c,p[0],p[1]+1.75,p[2],ry,.62,.44,.04);put(G.box,wht,p[0],p[1]+1.75,p[2],ry,.5,.1,.045)};
 const rack=(p,ry,c)=>{put(G.box,steel,p[0],p[1]+.05,p[2],ry,1.5,.06,.5);put(G.box,steel,p[0],p[1]+.9,p[2],ry,1.5,.05,.06);for(let i=0;i<4;i++){const d=(i-1.5)*.36,x=p[0]+Math.cos(ry)*d,z=p[2]-Math.sin(ry)*d;put(G.tyre,rub,x,p[1]+.42,z,ry+Math.PI/2,1,1,1,Math.PI/2);put(G.hub,c,x,p[1]+.42,z,ry+Math.PI/2,1,1,1,Math.PI/2)}};
 const boxT=L.boxT||[];
 L.tents.forEach((t,ti)=>{const bi=boxT.indexOf(t),team=mat(new THREE.Color(TEAMS[(bi>=0?bi:ti)%TEAMS.length]).getHex(),.6),isBox=bi>=0;
  /* behind the wall, under the front of the tent */
  stack(at(t,-2.1+rnd()*.3,3.5+rnd()*.5),3+(rnd()*2|0),0,team);stack(at(t,-1.35+rnd()*.2,3.9+rnd()*.5),2+(rnd()*3|0),0,team);if(rnd()<.7)stack(at(t,-1.8,4.6),2,0,team);
  cart(at(t,.3+rnd()*.5,3.6+rnd()*.4),yawU+(rnd()-.5)*.3,team);
  rack(at(t,2.1,4.9),yawU+Math.PI/2+(rnd()-.5)*.2,team);
  can(at(t,1.2+rnd()*.3,3.2),yawU+rnd(),redc);if(rnd()<.6)can(at(t,1.65,3.3),yawU+rnd(),redc);
  bottle(at(t,-.5,3.2),mat(0x2c62a8,.5,.3));bottle(at(t,-.78,3.25),mat(0x2c62a8,.5,.3));
  if(rnd()<.6)lean(at(t,-2.9,5.2),yawU+rnd()*3);
  board(at(t,3.3,5.5),yawU+Math.PI/2,team);
  /* on the lane side of the wall: kept well clear of where a crew stands at a box */
  const far=isBox?5.4:1.2;stack(at(t,far+rnd()*.4,7.35),2+(rnd()*2|0),0,team);stack(at(t,-far-rnd()*.4,7.35),3,0,team);cone(at(t,far+1.0,7.45));cone(at(t,-far-1.0,7.45));
  if(!isBox){cart(at(t,-.2,7.4),yawU,team);can(at(t,.75,7.45),yawU,redc)}});
 const grp=new THREE.Group();grp.name='pitDress';for(const k in bins){const b=bins[k],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,b.m);m.castShadow=true;m.receiveShadow=true;grp.add(m)}
 Rc.scene.add(grp);for(const k in G)G[k].dispose()}

/* ---------- the quick time event: three stages of 3, 4 and 5 keys, drawn like the race HUD (flat dark plates, the white row for what is live, red for the gap) ---------- */
const KEYS=[[['KeyQ','Q'],['KeyW','W'],['KeyE','E'],['KeyA','A'],['KeyS','S'],['KeyD','D']],
 [['ArrowUp','↑'],['ArrowDown','↓'],['ArrowLeft','←'],['ArrowRight','→'],['PageUp','PG UP'],['PageDown','PG DN']]];
const STAGES=[3,4,5],SNAME=['JACK UP','REPAIR','TORQUE DOWN'];
const css=document.createElement('style');css.textContent=`
.ptQ{position:fixed;z-index:40;display:none;pointer-events:none;font-family:"PTExo",var(--gt,Inter,sans-serif);color:#fff;--u:1px}
.ptQ.on{display:block}
.ptQ .bar{position:absolute;left:50%;top:calc(var(--u)*118);transform:translateX(-50%);display:flex;align-items:stretch;gap:calc(var(--u)*3);white-space:nowrap}
.ptQ .bar span{display:block;padding:0 calc(var(--u)*13);font:600 calc(var(--u)*13)/calc(var(--u)*30) "PTExo",var(--gt,Inter,sans-serif);letter-spacing:.14em;color:#aeb6bd;background:rgba(20,22,25,.82);border-radius:2px}
.ptQ .bar span.on{color:#15181c;background:#f4f6f7}
.ptQ .bar span.tm{color:#fff;background:#c81e1a;font-variant-numeric:tabular-nums;letter-spacing:.04em;min-width:calc(var(--u)*74);text-align:center}
.ptQ .mid{position:absolute;left:50%;bottom:calc(var(--vw)*.222);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*6)}
.ptQ .hd{display:flex;align-items:stretch;gap:calc(var(--u)*3);white-space:nowrap}
.ptQ .hd b,.ptQ .hd i,.ptQ .hd em{display:block;font:600 calc(var(--u)*12)/calc(var(--u)*24) "PTExo",var(--gt,Inter,sans-serif);font-style:normal;letter-spacing:.16em;padding:0 calc(var(--u)*10);border-radius:2px;background:rgba(20,22,25,.86)}
.ptQ .hd b{background:#f4f6f7;color:#15181c}.ptQ .hd i{color:#d5dadf;font-variant-numeric:tabular-nums}.ptQ .hd em{background:#c81e1a;color:#fff;display:none}.ptQ .hd em.on{display:block}
.ptQ .ks{display:flex;gap:calc(var(--u)*4)}
.ptQ .ks b{display:grid;place-items:center;min-width:calc(var(--u)*50);height:calc(var(--u)*50);padding:0 calc(var(--u)*8);box-sizing:border-box;border-radius:2px;font:700 calc(var(--u)*21) "PTExo",var(--gt,Inter,sans-serif);color:#8e979f;background:rgba(20,22,25,.86);border-bottom:calc(var(--u)*3) solid rgba(255,255,255,.14)}
.ptQ .ks b.now{color:#15181c;background:#f4f6f7;border-bottom-color:#c81e1a}
.ptQ .ks b.ok{color:#fff;background:rgba(40,42,45,.72);border-bottom-color:#f4f6f7}
.ptQ.bad .ks b.now{background:#c81e1a;color:#fff;animation:ptQs .24s}
@keyframes ptQs{25%{transform:translateX(calc(var(--u)*-5))}75%{transform:translateX(calc(var(--u)*5))}}
.ptQ .pg{display:flex;gap:calc(var(--u)*3)}.ptQ .pg u{display:block;width:calc(var(--u)*38);height:calc(var(--u)*4);background:rgba(20,22,25,.86)}.ptQ .pg u.ok{background:#f4f6f7}.ptQ .pg u.now{background:#c81e1a}
.ptQ.msg .mid{display:none}`;document.head.appendChild(css);
const QE=[null,null];
function qel(k){if(QE[k]&&QE[k].isConnected)return QE[k];const e=document.createElement('div');e.className='ptQ';e.innerHTML='<div class="bar"><span>PIT IN</span><span>REPAIR</span><span>PIT OUT</span><span class="tm"></span></div><div class="mid"><div class="hd"><b></b><i></i><em></em></div><div class="ks"></div><div class="pg"></div></div>';document.body.appendChild(e);return QE[k]=e}
function qPlace(c,e){const r=c.rect||[0,0,1,1],w=r[2]*innerWidth,h=r[3]*innerHeight;e.style.left=(r[0]*100)+'%';e.style.top=((1-(r[1]+r[3]))*100)+'%';e.style.width=(r[2]*100)+'%';e.style.height=(r[3]*100)+'%';e.style.setProperty('--u',Math.max(.6,Math.min(w/640,1.4)).toFixed(3)+'px');e.style.setProperty('--vw',w.toFixed(0)+'px')}
const fmtT=t=>{const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(3)};
/* the strip across the top: where the stop has got to, and its clock */
function qBar(c,st,step){const e=qel(c.k);qPlace(c,e);e.classList.add('on');const sp=e.querySelectorAll('.bar span');if(e._s!==step){e._s=step;for(let i=0;i<3;i++)sp[i].classList.toggle('on',i===step)}
 const t=fmtT(Math.max(0,st.T));if(e._t!==t){e._t=t;sp[3].textContent=t}return e}
function qShow(c,st){const e=qBar(c,st,1);e.classList.remove('msg');e.querySelector('.hd b').textContent=SNAME[st.stg]||'REPAIR';e.querySelector('.hd i').textContent=(st.stg+1)+' / '+STAGES.length;
 const em=e.querySelector('.hd em');em.classList.toggle('on',st.pen>0);em.textContent='+'+st.pen.toFixed(0)+' s';
 e.querySelector('.ks').innerHTML=st.q.map((q,i)=>'<b class="'+(i<st.qi?'ok':i===st.qi?'now':'')+'">'+q[1]+'</b>').join('');
 e.querySelector('.pg').innerHTML=STAGES.map((n,i)=>'<u class="'+(i<st.stg?'ok':i===st.stg?'now':'')+'"></u>').join('')}
function qHide(c){const e=QE[c.k];if(e){e.classList.remove('on','msg','bad');e._s=null}}
const newQ=(c,n)=>{const s=KEYS[c.k===1?1:0];let last=-1;return Array.from({length:n},()=>{let i;do{i=Math.floor(Math.random()*s.length)}while(i===last&&Math.random()<.7);last=i;return s[i]})};
addEventListener('keydown',ev=>{const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars||typeof scr==='undefined'||scr!=='game'||ev.repeat)return;
 for(const c of Rc.cars){const st=c._pit;if(!st||st.ph!=='qte'||!st.q||st.qi>=st.q.length)continue;const set=KEYS[c.k===1?1:0];if(!set.some(q=>q[0]===ev.code))continue;
  if(/^(Arrow|Page)/.test(ev.code))ev.preventDefault();
  if(ev.code===st.q[st.qi][0]){st.qi++;try{P.sfx&&P.sfx('select')}catch(e){}
   if(st.qi>=st.q.length&&st.stg<STAGES.length-1){st.stg++;st.q=newQ(c,STAGES[st.stg]);st.qi=0;try{P.sfx&&P.sfx('buy')}catch(e){}}}
  else{st.pen+=1;st.wait+=1;const e=qel(c.k);e.classList.remove('bad');void e.offsetWidth;e.classList.add('bad');try{P.sfx&&P.sfx('back')}catch(e){}}
  qShow(c,st)}},true);

/* ---------- the stop itself ---------- */
const pitOK=Rc=>!!(Rc&&Rc.T&&Rc.cars&&Rc.state==='race'&&Rc.cars.filter(c=>c.human).length===2&&!(Rc.cfg&&(Rc.cfg.rally||Rc.cfg.freeroam))&&laneOf(Rc)&&!(window.PTO&&window.PTO.pit===false));
function lane(Rc){if(Rc._pl===undefined){Rc._pl=build(Rc);if(Rc._pl){const PL=Rc._pl;PL.boxes.forEach((b,i)=>b.n=i);try{dress(Rc,PL)}catch(e){console.warn('pit dress',e)}
   /* every box has its crew standing by from the start, each in its own colour */
   loadCrew().then(()=>{if(typeof RACE!=='undefined'&&RACE===Rc)for(const b of PL.boxes)try{mkCrew(Rc,PL,b)}catch(e){console.warn('pit crew',e)}})}}return Rc._pl}
function enter(Rc,c,PL,i){const b=PL.boxes.find(q=>!q.by&&q.s>PL.S[i]+PL.box+4)||PL.boxes.find(q=>!q.by);if(!b)return;b.by=c;const h=Rc.T.surf(c.x,c.z,c.y).h;
 c._pit={ph:'in',s:PL.S[i],b,v:Math.max(MPH15,c.sp||0),ox:c.x-PL.X[i],oz:c.z-PL.Z[i],oy:c.yaw,rh:cl(c.y-h,.25,1.3),lift:0,t:0,T:0,q:null,qi:0,stg:0,pen:0,wait:0};
 const p=pose(PL,c._pit.s,b);c._pit.oy=wr(c.yaw-p.yaw);mkCrew(Rc,PL,b);try{P.sfx&&P.sfx('click')}catch(e){}}
function leave(Rc,c){const st=c._pit;if(!st)return;if(st.b.by===c)st.b.by=null;c._pit=null;c._pitOut=Rc.t;qHide(c)}
function rail(Rc,c,dt){const st=c._pit,PL=Rc._pl,T=Rc.T,b=st.b;st.t+=dt;st.T+=dt;
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
 if(st.ph==='in'){qBar(c,st,0).classList.add('msg');if(st.v===0&&st.s===b.s){st.ph='qte';st.t=0;st.stg=0;st.q=newQ(c,STAGES[0]);st.qi=0;qShow(c,st)}}
 else if(st.ph==='qte'){qBar(c,st,1);if(st.wait>0)st.wait-=dt;if(st.stg>=STAGES.length-1&&st.qi>=st.q.length&&st.wait<=0){st.ph='back';st.t=0;c.dmg=0;c.tyre=1;c.fuel=1;qBar(c,st,2).classList.add('msg');try{P.sfx&&P.sfx('buy')}catch(e){}}}
 else if(st.ph==='back'){qBar(c,st,2);if((!b.crew||b.clear)&&st.t>.2){st.ph='go';st.t=0}}
 else if(st.ph==='go'){qBar(c,st,2);if(st.t>2.2)qHide(c);if(st.s>=PL.len-.05){c.sp=st.v;leave(Rc,c)}}}
function tick(Rc,dt){const PL=lane(Rc);if(!PL)return;
 for(const c of Rc.cars){if(!c.human||c._pit||c.fin||c.respT>0)continue;if(c._pitOut!=null&&Rc.t-c._pitOut<4)continue;if((c.sp||0)<1.5)continue;
  const n=PL.near(c.x,c.z);if(n.d>2.6||PL.S[n.i]<PL.entry[0]||PL.S[n.i]>PL.entry[1])continue;const p=pose(PL,PL.S[n.i],null);if(Math.sin(p.yaw)*c.vx+Math.cos(p.yaw)*c.vz<1)continue;enter(Rc,c,PL,n.i)}
 for(const b of PL.boxes){if(!b.crew)continue;const c=b.by,st=c&&c._pit;let ph='idle';b.arr=false;
  /* the crew is on its way while the car is still rolling in: out to their marks from 45 m away, round the car the moment it stops */
  if(st){if(st.ph==='in')ph=b.s-st.s<45?(st.v<.6&&b.s-st.s<.5?'work':'ready'):'idle';else if(st.ph==='qte')ph='work';else ph='home'}
  const ok=crewTick(b,dt,ph);if(ph==='work')b.arr=ok}}
/* the car on the rail skips the physics step altogether; everyone else drives as before */
const sc0=stepCar;stepCar=function(c,dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(c&&c._pit&&Rc&&Rc._pl){if(Rc.state!=='race'||c.fin){leave(Rc,c)}else{rail(Rc,c,dt);return}}return sc0.apply(this,arguments)};
const s0=step;step=function(dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(Rc&&pitOK(Rc)){try{tick(Rc,dt)}catch(e){if(!Rc._pe){Rc._pe=1;console.warn('pit',e)}}}else for(const e of QE)if(e)e.classList.remove('on');return s0.apply(this,arguments)};
/* the pit camera (Nov 15, Hakan: an angle like Gran Turismo's): once the car is nearly on its marks the view cuts to a low three-quarter shot from the lane side,
   the car and its crew in front of the pit wall and the tents, and stays there until the car pulls away. Set after the camera layer so it has the last word. */
setTimeout(()=>{const pc=soloCam;soloCam=function(c,dt,out){pc.apply(this,arguments);try{const st=c&&c._pit,b=st&&st.b;if(!st||!b||!b.W||!out||!out.p)return;
  const on=st.ph==='qte'||st.ph==='back'||(st.ph==='in'&&b.s-st.s<5.5)||(st.ph==='go'&&st.t<.9);if(!on)return;
  const r=c.rect,asp=r?(r[2]*innerWidth)/Math.max(1,r[3]*innerHeight):1.78,nar=asp<1.25,dr=st.ph==='qte'?Math.sin(st.t*.35)*.25:0;
  const a=b.W(nar?-4.9:-4.5,(nar?4.4:3.9)+dr),l=b.W(.25,.15);out.p.set(a.x,a.y+.85,a.z);out.l.set(l.x,l.y+(nar?-.05:.3),l.z);out.f=nar?60:46;c.cb=0;c.inTn=false}catch(e){}}},600);
P.pit={lane:Rc=>lane(Rc||RACE),KEYS,loadCrew,enter:(c)=>{const Rc=RACE,PL=lane(Rc);if(PL&&!c._pit)enter(Rc,c,PL,PL.near(PL.X[12],PL.Z[12]).i)}};
})();
