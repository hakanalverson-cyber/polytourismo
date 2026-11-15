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
const MPH15=6.7056,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=t=>{t=cl(t,0,1);return t*t*(3-2*t)},wr=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* ---------- the pit lanes (model units). o: a point on the start straight, u: its direction, n: toward the pits ---------- */
/* Nov 15 (Hakan: straight and lined up with the tents): the straight is now measured off the row of pit tents themselves (o: a point on the
   tent row, u: along it, n: from the lane toward the tents, 27.96 units = 14.6 m out), and every box sits square in front of one tent */
const LANES={ra:(()=>{const o=[64.11,-836.97],u=[.8405,.5417],n=[-.5417,.8405],K=27.96,at=t=>[o[0]+u[0]*t-n[0]*K,o[1]+u[1]*t-n[1]*K];
 const pts=[[-284,-901],[-268,-909],[-250,-918],[-225,-929],[-200,-938.5],[-175,-943],[-150,-945],[-125,-948.5],[-100,-954.5],[-75,-949]];
 for(let t=-152;t<=264;t+=32)pts.push(at(t));
 pts.push([322,-702.5],[340,-684],[353,-665],[359.5,-645],[362,-625],[366,-606],[372,-590],[377,-573]);
 return{pts,boxes:[-26.2,7.9,41.1,141.2].map(t=>at(t)),side:n,shift:10.53,entry:[10,42]}})()};
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
/* one pose from a few numbers: k 'stand' | 'run' (ph: stride phase) | 'work' (ph: time). The body is posed in its own space (x left, y up, z forward) */
function crewPose(M,k,ph){const R=M.R,T=R.T,hy=T.hipC.y,sy=T.bp[T.idx.upper_armL].y,arm=(T.len.ua+T.len.fa);let ps;
 if(k==='run'){const s=Math.sin(ph),c=Math.cos(ph);
  ps={hip:[0,hy-.05+.025*Math.cos(2*ph),0],lean:.2,flat:false,look:.1,feet:[[.09,Math.max(0,c)*.17,.3*s+.02],[.09,Math.max(0,-c)*.17,-.3*s+.02]],
   hands:[[.25,sy-arm*.62+.05*Math.max(0,-s),-.26*s+.1],[.25,sy-arm*.62+.05*Math.max(0,s),.26*s+.1]]}}
 else if(k==='work'){const a=Math.sin(ph*7),b=Math.sin(ph*7+1.6);
  ps={hip:[0,hy*.5,-.16],lean:.55,flat:true,look:-.25,feet:[[.17,0,.1],[.17,0,-.3]],
   hands:[[.1+.03*b,hy*.42+.05*a,.42],[.1-.03*b,hy*.42-.05*a,.44]]}}
 else{const b=Math.sin(ph*1.6)*.006;ps={hip:[0,hy-.012+b,0],lean:.02,flat:true,look:0,feet:[[.1,0,0],[.1,0,0]],hands:[[.24,sy-arm*.95,.04],[.24,sy-arm*.95,.04]]}}
 BK.poseRider({rider:R,I:{grip:[.3,sy,.4]},steer:_st},ps,1)}
/* a crew for box b beside a car stopped at (x,z) heading yaw. Car space: +X toward the pit wall side the crew waits on, +Z the car's nose.
   Each member has a way out as corner points round the car (1.75 m from its centre line, 3.1 m from its middle fore and aft), so nobody crosses the bodywork */
const WAYS=[[[1.5,1.35]],[[1.5,-1.35]],[[1.75,3.1],[-1.75,3.1],[-1.5,1.35]],[[1.75,-3.1],[-1.75,-3.1],[-1.5,-1.35]]];
const HOME=[[1.95,.6],[1.95,-.6],[1.95,2.3],[1.95,-2.3]];/* against the pit wall: the box is 4.8 m wide and the car sits in its middle */
function mkCrew(Rc,PL,b){if(!CREW||!CREW.length||b.crew)return;const p=pose(PL,b.s,b),T=Rc.T,sd=PL.side,rt=[Math.cos(p.yaw),-Math.sin(p.yaw)],sg=Math.sign(rt[0]*sd[0]+rt[1]*sd[1])||1;
 const W=(lx,lz)=>{const x=p.x+rt[0]*lx*sg+Math.sin(p.yaw)*lz,z=p.z+rt[1]*lx*sg+Math.cos(p.yaw)*lz;return V(x,T.terr(x,z),z)};
 b.crew=WAYS.map((w,i)=>{const R=BK.makeRiderFrom(CREW[(i+b.n*2)%CREW.length],{});R.g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.layers.set(0)}});R.arms.visible=false;
  const home=W(HOME[i][0],HOME[i][1]),path=[home,...w.map(q=>W(q[0],q[1]))],look=W(w[w.length-1][0]*.55,w[w.length-1][1]);
  const M={R,path,at:0,pos:home.clone(),yaw:p.yaw-sg*Math.PI/2,ph:i*1.7,face:look,homeYaw:p.yaw-sg*Math.PI/2,mv:0};R.g.position.copy(home);R.g.rotation.y=M.yaw;Rc.scene.add(R.g);crewPose(M,'stand',0);return M})}
/* walk a member toward the end (dir 1) or the start (dir -1) of its way; true when it has arrived */
function crewMove(M,dir,dt){const tgt=dir>0?M.path.length-1:0;if(M.at===tgt&&M.pos.distanceTo(M.path[tgt])<.03)return true;
 let left=4.3*dt;while(left>0){const nx=M.pos.distanceTo(M.path[M.at])<.03?(M.at===tgt?-1:M.at+dir):M.at;if(nx<0)break;M.at=nx;const d=M.path[nx],dd=M.pos.distanceTo(d),st=Math.min(left,dd);
  if(dd>1e-4){M.pos.addScaledVector(V().subVectors(d,M.pos).multiplyScalar(1/dd),st);M.yaw+=wr(Math.atan2(d.x-M.pos.x,d.z-M.pos.z)-M.yaw)*Math.min(1,dt*14)}left-=st;if(st<1e-5)break}
 M.ph+=dt*11;M.mv=1;return false}
function crewTick(b,dt,phase){let all=true;const t=performance.now()/1000;
 for(const M of b.crew){M.mv=0;let k='stand';
  if(phase==='out'||phase==='work'){const ok=crewMove(M,1,dt);if(!ok){k='run';all=false}else{k='work';M.yaw+=wr(Math.atan2(M.face.x-M.pos.x,M.face.z-M.pos.z)-M.yaw)*Math.min(1,dt*10)}}
  else{const ok=crewMove(M,-1,dt);if(!ok){k='run';all=false}else M.yaw+=wr(M.homeYaw-M.yaw)*Math.min(1,dt*8)}
  M.R.g.position.copy(M.pos);M.R.g.rotation.y=M.yaw;crewPose(M,k,k==='run'?M.ph:t+M.ph)}
 return all}

/* ---------- the quick time event ---------- */
const KEYS=[[['KeyQ','Q'],['KeyW','W'],['KeyE','E'],['KeyA','A'],['KeyS','S'],['KeyD','D']],
 [['ArrowUp','↑'],['ArrowDown','↓'],['ArrowLeft','←'],['ArrowRight','→'],['PageUp','PG UP'],['PageDown','PG DN']]];
const css=document.createElement('style');css.textContent=`
.ptQ{position:fixed;z-index:40;display:none;flex-direction:column;align-items:center;gap:10px;pointer-events:none;font-family:var(--gt,Inter,sans-serif);color:#fff;transform:translate(-50%,-50%)}
.ptQ.on{display:flex}
.ptQ small{font:600 11px var(--gt);letter-spacing:.32em;text-transform:uppercase;color:#e4eaee;text-shadow:0 1px 4px #000}
.ptQ .ks{display:flex;gap:10px}
.ptQ .ks b{display:grid;place-items:center;min-width:58px;height:58px;padding:0 10px;box-sizing:border-box;border-radius:10px;font:700 22px var(--gt);letter-spacing:.02em;color:#9aa5ae;background:#0a0e14cc;box-shadow:inset 0 1px 0 #ffffff26,0 0 0 1px #ffffff2e,0 6px 18px #0009;transition:transform .12s,background .12s,color .12s}
.ptQ .ks b.now{color:#0a0e14;background:#f1f3f5;transform:scale(1.12)}
.ptQ .ks b.ok{color:#fff;background:#3f8f5acc}
.ptQ.bad .ks b.now{background:#d8463c;color:#fff;animation:ptQs .28s}
@keyframes ptQs{25%{transform:scale(1.12) translateX(-6px)}75%{transform:scale(1.12) translateX(6px)}}
.ptQ em{font:600 12px var(--gt);font-style:normal;letter-spacing:.2em;color:#ffb0a8;min-height:15px;text-shadow:0 1px 4px #000}
.ptQ.msg .ks{display:none}.ptQ.msg small{font-size:14px;padding:8px 16px;border-radius:8px;background:#0a0e14b0}`;document.head.appendChild(css);
const QE=[null,null];
function qel(k){if(QE[k]&&QE[k].isConnected)return QE[k];const e=document.createElement('div');e.className='ptQ';e.innerHTML='<small></small><div class="ks"></div><em></em>';document.body.appendChild(e);return QE[k]=e}
function qPlace(c,e){const r=c.rect||[0,0,1,1];e.style.left=((r[0]+r[2]/2)*100)+'%';e.style.top=((1-(r[1]+r[3]*.62))*100)+'%'}
function qShow(c,st){const e=qel(c.k);qPlace(c,e);e.classList.add('on');e.classList.remove('msg');e.querySelector('small').textContent='Pit stop';
 e.querySelector('.ks').innerHTML=st.q.map((q,i)=>'<b class="'+(i<st.qi?'ok':i===st.qi?'now':'')+'">'+q[1]+'</b>').join('');e.querySelector('em').textContent=st.pen>0?'+'+st.pen.toFixed(0)+' s':''}
function qMsg(c,t){const e=qel(c.k);qPlace(c,e);e.classList.add('on','msg');e.querySelector('small').textContent=t}
function qHide(c){const e=QE[c.k];if(e)e.classList.remove('on','msg','bad')}
addEventListener('keydown',ev=>{const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars||typeof scr==='undefined'||scr!=='game'||ev.repeat)return;
 for(const c of Rc.cars){const st=c._pit;if(!st||st.ph!=='qte'||st.qi>=st.q.length)continue;const set=KEYS[c.k===1?1:0];if(!set.some(q=>q[0]===ev.code))continue;
  if(/^(Arrow|Page)/.test(ev.code))ev.preventDefault();
  if(ev.code===st.q[st.qi][0]){st.qi++;try{P.sfx&&P.sfx('select')}catch(e){}}else{st.pen+=1;st.wait+=1;const e=qel(c.k);e.classList.remove('bad');void e.offsetWidth;e.classList.add('bad');try{P.sfx&&P.sfx('back')}catch(e){}}
  qShow(c,st)}},true);

/* ---------- the stop itself ---------- */
const pitOK=Rc=>!!(Rc&&Rc.T&&Rc.cars&&Rc.state==='race'&&Rc.cars.filter(c=>c.human).length===2&&!(Rc.cfg&&(Rc.cfg.rally||Rc.cfg.freeroam))&&laneOf(Rc)&&!(window.PTO&&window.PTO.pit===false));
function lane(Rc){if(Rc._pl===undefined){Rc._pl=build(Rc);if(Rc._pl){Rc._pl.boxes.forEach((b,i)=>b.n=i);loadCrew()}}return Rc._pl}
function enter(Rc,c,PL,i){const b=PL.boxes.find(q=>!q.by&&q.s>PL.S[i]+PL.box+4)||PL.boxes.find(q=>!q.by);if(!b)return;b.by=c;const h=Rc.T.surf(c.x,c.z,c.y).h;
 c._pit={ph:'in',s:PL.S[i],b,v:Math.max(MPH15,c.sp||0),ox:c.x-PL.X[i],oz:c.z-PL.Z[i],oy:c.yaw,rh:cl(c.y-h,.25,1.3),t:0,q:null,qi:0,pen:0,wait:0};
 const p=pose(PL,c._pit.s,b);c._pit.oy=wr(c.yaw-p.yaw);mkCrew(Rc,PL,b);loadCrew().then(()=>{if(RACE===Rc&&b.by===c)mkCrew(Rc,PL,b)});qMsg(c,'Pit lane · 15 mph');try{P.sfx&&P.sfx('click')}catch(e){}}
function leave(Rc,c){const st=c._pit;if(!st)return;if(st.b.by===c)st.b.by=null;c._pit=null;c._pitOut=Rc.t;qHide(c)}
function rail(Rc,c,dt){const st=c._pit,PL=Rc._pl,T=Rc.T,b=st.b;st.t+=dt;
 /* speed: down to 15 mph, to a stop on the box, away again at 15 */
 let vt=MPH15;if(st.ph==='in')vt=Math.min(MPH15,Math.sqrt(Math.max(0,2*3.2*(b.s-st.s)))+.02);else if(st.ph!=='go')vt=0;
 st.v+=cl(vt-st.v,-(st.v>MPH15+.5?15:6)*dt,3.2*dt);if(st.ph==='in'&&b.s-st.s<.04){st.v=0;st.s=b.s}st.s=Math.min(PL.len,st.s+st.v*dt);
 const k=Math.exp(-dt*2.6);st.ox*=k;st.oz*=k;st.oy*=k;const p=pose(PL,st.s,b);
 c.x=p.x+st.ox;c.z=p.z+st.oz;c.yaw=p.yaw+st.oy;const h=T.surf(c.x,c.z,c.y).h;c.y+=(h+st.rh-c.y)*Math.min(1,dt*12);
 c.vx=Math.sin(p.yaw)*st.v;c.vz=Math.cos(p.yaw)*st.v;c.vy=0;c.sp=st.v;c.yr=0;c.wpt=c.wrl=0;c.pitch*=.9;c.roll*=.9;c.st=(c.st||0)*.85;c.wrong=0;c.stuck=0;c.boost=0;c.drifting=false;c.driftTimer=0;
 if(c.in){c.in.th=0;c.in.br=0;c.in.st=0;c.in.hb=0}
 /* lap progress, as the physics step does it */
 {let bi=c.idx,bd=1e18;const N=T.N;for(let q=-6;q<=30;q++){const i=(c.idx+q+N)%N,dx=c.x-T.x[i],dz=c.z-T.z[i],d2=dx*dx+dz*dz;if(d2<bd){bd=d2;bi=i}}let dl=bi-c.idx;if(dl>N/2)dl-=N;if(dl<-N/2)dl+=N;if(Math.abs(dl)<40){c.idx=bi;c.unw+=dl}}
 if(st.ph==='in'){if(st.t>2.2&&!st.q)qHide(c);if(st.v===0&&st.s===b.s){st.ph='qte';st.t=0;st.q=[0,1,2].map(()=>{const s=KEYS[c.k===1?1:0];return s[Math.floor(Math.random()*s.length)]});st.qi=0;qShow(c,st)}}
 else if(st.ph==='qte'){if(st.wait>0)st.wait-=dt;if(st.qi>=st.q.length&&st.wait<=0&&st.t>2.4&&(!b.crew||b.arr)){st.ph='back';st.t=0;c.dmg=0;c.tyre=1;c.fuel=1;qMsg(c,'Repaired');try{P.sfx&&P.sfx('buy')}catch(e){}}}
 else if(st.ph==='back'){if((!b.crew||b.home)&&st.t>.5){st.ph='go';st.t=0;qHide(c)}}
 else if(st.ph==='go'){if(st.s>=PL.len-.05){c.sp=st.v;leave(Rc,c)}}}
function tick(Rc,dt){const PL=lane(Rc);if(!PL)return;
 for(const c of Rc.cars){if(!c.human||c._pit||c.fin||c.respT>0)continue;if(c._pitOut!=null&&Rc.t-c._pitOut<4)continue;if((c.sp||0)<1.5)continue;
  const n=PL.near(c.x,c.z);if(n.d>2.6||PL.S[n.i]<PL.entry[0]||PL.S[n.i]>PL.entry[1])continue;const p=pose(PL,PL.S[n.i],null);if(Math.sin(p.yaw)*c.vx+Math.cos(p.yaw)*c.vz<1)continue;enter(Rc,c,PL,n.i)}
 for(const b of PL.boxes){if(!b.crew)continue;const c=b.by,st=c&&c._pit,stopped=!!(st&&(st.ph==='qte'));b.arr=false;
  if(stopped){b.arr=crewTick(b,dt,st.qi>=st.q.length&&st.wait<=0?'work':'out');b.home=false}else b.home=crewTick(b,dt,'home')}}
/* the car on the rail skips the physics step altogether; everyone else drives as before */
const sc0=stepCar;stepCar=function(c,dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(c&&c._pit&&Rc&&Rc._pl){if(Rc.state!=='race'||c.fin){leave(Rc,c)}else{rail(Rc,c,dt);return}}return sc0.apply(this,arguments)};
const s0=step;step=function(dt){const Rc=typeof RACE!=='undefined'?RACE:null;if(Rc&&pitOK(Rc)){try{tick(Rc,dt)}catch(e){if(!Rc._pe){Rc._pe=1;console.warn('pit',e)}}}else for(const e of QE)if(e)e.classList.remove('on');return s0.apply(this,arguments)};
P.pit={lane:Rc=>lane(Rc||RACE),KEYS,loadCrew,enter:(c)=>{const Rc=RACE,PL=lane(Rc);if(PL&&!c._pit)enter(Rc,c,PL,PL.near(PL.X[12],PL.Z[12]).i)}};
})();
