/* ===== Poly GT layer: arcade handling (Quickplay modes only: Quick Race, Time Attack, Elimination, Cut-Up, Versus) =====
   Rally and Track Mode keep their own handling. For the player in these modes:
   - grippier (sideways slip dies out 1.3x faster) and brakes twice as strong
   - the steering reaches the wheel quicker (patched in build.py through PT8.arcSnap)
   - turning hard at speed hops the car into a drift (no key, so every player can) that carves tight corners; no turbo
   - walls take only the speed going into them and turn the car back along the road (patched in build.py through PT8.arcWall) */
(function ptArcade(){
'use strict';
const P=window.PT8;
const AM={mp:1,ta:1,elim:1,cutup:1};
P.arcade=()=>{const R=typeof RACE!=='undefined'?RACE:null,f=R&&R.cfg;return !!(f&&AM[f.mode]&&!f.trackRace&&!f.circuit&&!f.rally&&!f.free)};
const hu=c=>c&&c.human&&!c.forceAI;
{const m0=P.mul;P.mul=c=>{const m=m0?m0(c):{acc:1,top:1,grip:1,brk:1};if(hu(c)&&P.arcade()){m.grip*=1.3;m.brk*=2}return m}}
/* steering ramp rate: 7 per second in the base game, 12 here */
P.arcSnap=c=>hu(c)&&P.arcade()?12:7;
/* wall contact: the base pushes back 1.3x the speed into the wall (a bounce off it); here 1.05x, and the nose is eased toward the
   road direction so the car slides along the wall and carries on */
P.arcWall=(c,psi,dt)=>{if(!(hu(c)&&P.arcade()))return 1.3;if(psi!=null){const f=Math.cos(c.yaw-psi)>=0?psi:psi+Math.PI;let d=f-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));c.yaw+=d*Math.min(1,(dt||.016)*10);c.yr*=.5}return 1.05};
/* drifting (no key, every player): hold the wheel hard over at speed (near full lock above about 45 mph for a quarter second) and the
   car hops into a Mario Kart style drift (below) that holds while you keep turning */
P.arcBlendIn=c=>hu(c)&&P.arcade()?3:4.3;
/* no drift turbo (Hakan: drifting is for tight corners). The tyre smoke grows the longer you drift */
{const sc0=stepCar;stepCar=function(c,dt){const arc=hu(c)&&P.arcade(),s0=Math.hypot(c.vx||0,c.vz||0);
 if(arc&&c.in){const fw=c.vx*Math.sin(c.yaw)+c.vz*Math.cos(c.yaw),st=Math.abs(c.in.st||0);
  c._hardT=st>.85&&fw>20?(c._hardT||0)+dt:0;c._hb=c.ptDrift?(c._hb&&st>.3&&fw>11):c._hardT>.25}
 else if(c._hb&&!(RACE&&RACE.cfg&&RACE.cfg.rally))c._hb=false;
 const r=sc0.apply(this,arguments);if(!arc||!(dt>0))return r;
 c.dts=0;c.boost=0;/* no turbo */
 /* Mario Kart style drift: a small hop as it starts, the nose swings in to a set drift angle (about 26 degrees) in under half a second,
    and the car then carves a steady arc, tighter than grip alone allows: steering into the drift tightens it, steering out widens it.
    Speed is kept (the base tyres scrubbed a third of it off at that angle), except when a wall takes it */
 if(c.ptDrift&&!(c.exp>0)&&c.m&&c.m.wheels.some(w=>w.g)){const s1=Math.hypot(c.vx,c.vz);if(s1>8){
  if(!c._dOn){c._dOn=1;c._dA=0;c._dSide=c.ptSide||Math.sign(c.in&&c.in.st||1);c.vy=Math.max(c.vy||0,2.6)}
  const sd=c._dSide,u=Math.max(-1,Math.min(1,(c.in&&c.in.st||0)*sd)),w=sd*(.75+.55*u)*Math.min(1.25,32/Math.max(s1,15));
  c._dA+=(.46-c._dA)*Math.min(1,dt*6);const h=Math.atan2(c.vx,c.vz)+w*dt,sp=s1<s0*.85?s1:Math.max(s1,s0*(1-.05*dt));
  c.vx=Math.sin(h)*sp;c.vz=Math.cos(h)*sp;c.yaw=h+sd*c._dA;c.yr=w}}
 else if(c._dOn&&!c.ptDrift){c._dOn=0;/* drift exit: the car shoots off where the nose points (most of the way), keeping its speed, instead of scrubbing the angle off */
  const s2=Math.hypot(c.vx,c.vz),h2=Math.atan2(c.vx,c.vz)+(c._dSide||0)*(c._dA||0)*.75;c.vx=Math.sin(h2)*s2;c.vz=Math.cos(h2)*s2}
 if(c.ptDrift&&c._dOn&&!(c.exp>0)){c._dT=(c._dT||0)+dt;
  c._smT=(c._smT||0)+dt;if(c._smT>.07&&typeof fx==='function'&&typeof WL!=='undefined'){c._smT=0;const t=Math.min(c._dT,3.5),sz=.12+t*.08,life=.4+t*.12,cy=Math.cos(c.yaw),sy=Math.sin(c.yaw);
   for(const w of [WL[2],WL[3]])fx(c.x+cy*w[0]+sy*w[1],c.y-.55,c.z-sy*w[0]+cy*w[1],0xe8e8e8,1,1.2+t*.3,life,sz,-.4)}} 
 else if(!c.ptDrift)c._dT=0;
 return r}}
})();
