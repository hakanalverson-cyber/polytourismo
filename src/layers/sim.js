/* ===== Poly GT layer: Sim handling (Hakan, Nov 8: "I want Gran Turismo physics"). Options > Gameplay > HANDLING: ARCADE | SIM.
   The arcade code turns the car at a rate set by the steering and speed and lets sideways speed die away at a fixed rate. In SIM the player's car
   (circuit and model tracks: Track Mode, Road Atlanta, Imola and the rest) is run as a bicycle model instead, with the tyre budget the game
   already tuned (P.simGrip: ALAT, downforce, the car's grip rating, the surface) as each axle's peak force:
   - each axle makes sideways force from its slip angle (a Pacejka-style curve: it builds up to about 9 degrees, then falls to about 76% when the
     tyre slides), so grip is progressive: push (understeer), then slide, then recovery, not a wall
   - weight moves forward under braking and backward under power (and so does grip): trail braking turns the car in, power on the exit unloads the fronts
   - friction circle: the more a tyre is used for braking or driving, the less is left for cornering
   - the drive layout of each car (RWD, AWD) decides which axle carries the power: RWD kicks the tail out when you ask too much on the exit,
     AWD hooks up and pulls; mid-engined cars have the weight at the back (sharper turn-in, snappier tail)
   - ABS and traction control (Options): off, a locked or spinning tyre loses grip and the braking or pull is lower; on, the pedal is held just
     under the limit (traction control at 75% of the tyre, ABS at 92%)
   The longitudinal side (engine, gears, top speed, brakes, drag) is still the arcade layer's: this takes over sideways motion and yaw only,
   above walking pace, and hands back to the arcade code below it. Walls and other solid things are still handled by the code around it. ===== */
(function sim(){
'use strict';
const P=window.PT8;if(!P)return;
const O=()=>window.PTO||{};
const clamp=(x,a,b)=>x<a?a:x>b?b:x,wr=a=>{a%=6.283185307179586;if(a>3.141592653589793)a-=6.283185307179586;if(a<-3.141592653589793)a+=6.283185307179586;return a};
P.simOn=c=>!!(c&&c.human&&!c.forceAI&&!c.cool&&O().handling==='SIM'&&P.trkPhys&&P.trkPhys()&&typeof RACE!=='undefined'&&RACE&&RACE.T);
/* tyre curve (magic formula, no curvature term): peak at AP radians, falls to sin(C*pi/2) of the peak */
const DS=1.5,DSB=1.15,SIMK=.86,C_=1.45,AP=.155,B_=Math.tan(Math.PI/(2*C_))/AP;
const tyre=a=>Math.sin(C_*Math.atan(B_*a));
/* per car: weight on the front axle, and how power and brakes are shared between the axles */
function spec(c){const cs=c.cs||{};if(cs._sim)return cs._sim;const d=cs.drive||'RWD',t=((cs.cat||'')+' '+(cs.type||'')).toUpperCase();
 let wf=d==='FWD'?.6:d==='AWD'?.53:.5;if(/SUPERCAR|HYPERCAR/.test(t))wf=.43;else if(/MUSCLE/.test(t))wf=.55;else if(/SUV|WAGON/.test(t))wf=.54;
 const dr=d==='FWD'?[1,0]:d==='AWD'?[.38,.62]:[0,1];
 return cs._sim={wf,dr,br:[.62,.38]}}
const wallNear=(c,T)=>{try{const sc=T.surf(c.x,c.z,c.y);return !!(sc.road&&T.wall&&T.wall[sc.i]&&Math.abs(sc.lat)>T.hw[sc.i]-.95)}catch(e){return false}};
P.simPost=function(c,dt,vx0,vz0,y0,yr0){
 const R=RACE,T=R.T;
 if(R.state!=='race'||c.fin||c.respT>0||!c.m||!c.m.wheels||!(dt>0)){c._simOn=0;return false}
 let ng=0;for(const w of c.m.wheels)if(w.g)ng++;if(ng<3){c._simOn=0;return false}
 const s0=Math.hypot(vx0,vz0),sy0=Math.sin(y0),cy0=Math.cos(y0);let u=vx0*sy0+vz0*cy0,v=vx0*cy0-vz0*sy0;
 /* walking pace and reversing: the arcade code */
 if(u<6||s0<6){c._simOn=0;return false}
 /* a wall this step: the arcade response (and the solid code around us) decides, and we re-seed from what comes out */
 if(wallNear(c,T)){c._simOn=0;return false}
 const mt=c.mt||{grip:1},A=Math.max(6,(P.simGrip?P.simGrip(c,mt):23)*SIMK),K=(T.d&&T.d.cartoon&&T.d.cartoon.carScale)||1,L=3.3*K,sp=spec(c);
 const vx1=c.vx,vz1=c.vz,yaw1=c.yaw,yrA=c.yr||0;
 /* the acceleration the arcade layer gave along the car's nose this step (engine, brakes, drag), smoothed */
 const axr=((vx1-vx0)*Math.sin(yaw1)+(vz1-vz0)*Math.cos(yaw1))/dt;
 c._sax=c._simOn&&isFinite(c._sax)?c._sax+(axr-c._sax)*Math.min(1,dt*30):axr;
 let ax=clamp(c._sax,-2.2*A,2.2*A);
 const wf0=sp.wf,a=L*(1-wf0),b=L*wf0,Iz=1.05*a*b,abs=O().abs!==false,tc=O().tc!==false;
 /* the steering angle that gives the yaw rate the arcade steering asked for (kinematic, bicycle) */
 /* steering angle: the driver's (already smoothed) steering times a lock that shrinks with speed, like a real car's effective steering ratio:
 about 26 degrees at walking pace, 14 at 30 m/s, 6 at 60: full lock gives about 1.3x what the tyres can use at any speed (small inputs are finer: the input is raised to the power 1.35). Full lock at speed asks for more than the tyres give, so it pushes wide (understeer) instead of being clamped */
 const sr_=clamp(c.st||0,-1,1),stI=Math.sign(sr_)*Math.pow(Math.abs(sr_),1.35),lock=.45/(1+(u/34)*(u/34)),del=clamp(stI*lock*K,-.62,.62);
 /* weight transfer: braking loads the front, power loads the rear (about 15% of the weight at the grip limit) */
 const tr=clamp(ax/A,-1.3,1.3),wf=clamp(wf0-.15*tr,.22,.78),wrr=1-wf;
 const sh=ax>=0?sp.dr:sp.br,drive=ax>=0;
 /* the arcade engine and brakes are tuned gentler than real ones, so the pull on the tyres is scaled up (1.5x power, 1.15x brakes) to make traction and lock-up matter */
 const dsx=drive?DS:DSB;
 let dF=dsx*Math.abs(ax)*sh[0]/(A*wf),dR=dsx*Math.abs(ax)*sh[1]/(A*wrr),um=Math.max(dF,dR);
 let axE=ax,uF=dF,uR=dR;
 /* with the assist the pedal is held where the axle still has some sideways grip left (traction control: 75% of the tyre, ABS: 92%);
    without it the saturated axle is spinning or locked: less pull or braking, and almost no sideways grip on that axle */
 {const assist=drive?tc:abs,cap=drive?.75:.92;
  if(assist){if(um>cap){const k=cap/um;axE=ax*k;uF=dF*k;uR=dR*k}}
  else if(um>1){const k=.82/um;axE=ax*k;uF=dF>1?1:dF*k;uR=dR>1?1:dR*k}}
 const lF=Math.sqrt(Math.max(.1,1-Math.min(1,uF)*Math.min(1,uF))),lR=Math.sqrt(Math.max(.1,1-Math.min(1,uR)*Math.min(1,uR)));
 const DF=A*wf*.97*lF,DR=A*wrr*1.03*lR;
 /* integrate in small steps (the tyre forces are stiff) */
 const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;let r=c._simOn&&isFinite(c._sr)?c._sr:yr0,psi=0,uu=u,vv=v,fzF=0,fzR=0,saF=0,saR=0;
 for(let i=0;i<n;i++){const ue=Math.max(3,uu);
  const af=del-Math.atan2(vv+a*r,ue),ar=-Math.atan2(vv-b*r,ue);
  const Ff=DF*tyre(af),Fr=DR*tyre(ar);
  vv+=((Ff+Fr)-uu*r)*h;r+=(a*Ff-b*Fr)/Iz*h;
  /* cornering drag: the sideways force has a little of its length along the car's path */
  uu+=(axE+vv*r-.6*(Math.abs(Ff*Math.sin(af))+Math.abs(Fr*Math.sin(ar))))*h;psi+=r*h;saF=af;saR=ar;fzF=Ff;fzR=Fr}
 /* far past the limit the nose is eased back toward where the car is going, so a slide never ends in endless spinning */
 let beta=Math.atan2(vv,Math.max(1,uu));if(Math.abs(beta)>.75){const e=(Math.abs(beta)-.75)*Math.min(1,dt*5);psi-=Math.sign(beta)*e;r*=1-Math.min(.3,dt*4)}
 const ps=y0+psi,sP=Math.sin(ps),cP=Math.cos(ps),vxS=sP*uu+cP*vv,vzS=cP*uu-sP*vv;
 if(!isFinite(vxS)||!isFinite(vzS)||!isFinite(r)){c._simOn=0;return false}
 /* blend in over 6..11 m/s so the hand-over from the arcade steering is smooth */
 const k=clamp((u-6)/5,0,1),kk=k*k*(3-2*k);
 c.vx=vx1+(vxS-vx1)*kk;c.vz=vz1+(vzS-vz1)*kk;c.yaw=yaw1+wr(ps-yaw1)*kk;c.yr=yrA+(r-yrA)*kk;
 /* the arcade step moved the car with its own velocity: swap in the difference */
 c.x+=(c.vx-vx1)*dt;c.z+=(c.vz-vz1)*dt;c.sp=Math.hypot(c.vx,c.vz);
 c._sr=c.yr;c._simOn=1;c.sim={af:saF,ar:saR,wf,uF,uR,ax:axE,A,beta};
 return true};
})();
