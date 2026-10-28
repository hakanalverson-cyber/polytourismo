/* ===== Poly GT layer: arcade handling (Quickplay modes only: Quick Race, Time Attack, Elimination, Cut-Up, Versus) =====
   Rally and Track Mode keep their own handling. For the player in these modes:
   - grippier (sideways slip dies out 1.3x faster) and brakes twice as strong
   - the steering reaches the wheel quicker (patched in build.py through PT8.arcSnap)
   - turning hard at speed drifts (no key, so every player can); the longer the drift, the bigger the turbo when it ends
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
   tail starts to come out; it swings out gradually (PT8.arcBlendIn slows the base drift blend, build.py) and the drift holds while you
   keep turning */
P.arcBlendIn=c=>hu(c)&&P.arcade()?1.3:4.3;
/* drift turbo by how long the drift lasted, shown with no HUD: the tyre smoke grows the longer you drift, a very faint glow round the
   screen edge takes the level's colour and gets a little stronger at each level, and the exhaust flame on release has that colour */
const LV=[{t:0,col:0xe8e8e8,b:0,push:0},{t:.8,col:0x2f8cff,b:.6,push:0},{t:1.8,col:0xff7a00,b:1.1,push:6},{t:3,col:0x9b30ff,b:1.7,push:14}];
const lvOf=t=>{let k=0;for(let i=1;i<LV.length;i++)if(t>=LV[i].t)k=i;return k};
const flame=(c,k)=>{if(!c.m||!c.m.fl||c._flK===k)return;c._flK=k;c.m.fl.forEach(f=>f.traverse&&f.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){if(o._c0==null)o._c0=o.material.color.getHex();o.material.color.setHex(k?LV[k].col:o._c0);o.scale.setScalar(k?1+k*.55:1)}}))};
{const sc0=stepCar;stepCar=function(c,dt){const arc=hu(c)&&P.arcade();
 if(arc&&c.in){const fw=c.vx*Math.sin(c.yaw)+c.vz*Math.cos(c.yaw),st=Math.abs(c.in.st||0);
  c._hardT=st>.85&&fw>20?(c._hardT||0)+dt:0;c._hb=c.ptDrift?(c._hb&&st>.3&&fw>11):c._hardT>.25}
 else if(c._hb&&!(RACE&&RACE.cfg&&RACE.cfg.rally))c._hb=false;
 const r=sc0.apply(this,arguments);if(!arc||!(dt>0))return r;
 c.dts=0;/* the base drift turbo is replaced by the levels below */
 if(c.ptDrift&&(c.ptBlend||0)>.35&&!(c.exp>0)){c._dT=(c._dT||0)+dt;
  c._smT=(c._smT||0)+dt;if(c._smT>.07&&typeof fx==='function'&&typeof WL!=='undefined'){c._smT=0;const t=Math.min(c._dT,3.5),sz=.12+t*.08,life=.4+t*.12,cy=Math.cos(c.yaw),sy=Math.sin(c.yaw);
   for(const w of [WL[2],WL[3]])fx(c.x+cy*w[0]+sy*w[1],c.y-.55,c.z-sy*w[0]+cy*w[1],0xe8e8e8,1,1.2+t*.3,life,sz,-.4)}}
 else if(c._dT>0&&!c.ptDrift){const k=lvOf(c._dT);c._dT=0;if(k){c.boost=Math.max(c.boost||0,LV[k].b);c._bk=k;flame(c,k);if(typeof beep==='function')beep(380+k*140,.18,'sine',.35)}}
 if(c.boost>0){const k=c._bk||0;if(LV[k]&&LV[k].push){const fx_=Math.sin(c.yaw),fz_=Math.cos(c.yaw);c.vx+=fx_*LV[k].push*dt;c.vz+=fz_*LV[k].push*dt}}
 else if(c._flK){c._bk=0;flame(c,0)}
 return r}}
/* the screen-edge glow (one driver on screen only: split screen keeps it clean) */
const eg=document.createElement('div');eg.id='arcEdge';eg.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;opacity:0;transition:opacity .35s,box-shadow .35s';document.body.appendChild(eg);
const hex=n=>'#'+n.toString(16).padStart(6,'0'),OP=[0,.10,.16,.22];
(function tick(){requestAnimationFrame(tick);let k=0;try{const R=typeof RACE!=='undefined'?RACE:null,hs=R&&R.cars?R.cars.filter(q=>q.human):[],c=hs[0];
 if(c&&hs.length===1&&P.arcade()&&R.state!=='done'&&typeof scr!=='undefined'&&scr==='game')k=c.ptDrift&&c._dT>0?lvOf(c._dT):(c.boost>0?(c._bk||0):0)}catch(e){}
 if(eg._k!==k){eg._k=k;if(k)eg.style.boxShadow='inset 0 0 90px 18px '+hex(LV[k].col);eg.style.opacity=OP[k]}})();
})();
