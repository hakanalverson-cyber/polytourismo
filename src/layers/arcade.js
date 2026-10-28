/* ===== Poly GT layer: arcade handling (Quickplay modes only: Quick Race, Time Attack, Elimination, Cut-Up, Versus) =====
   Rally and Track Mode keep their own handling. For the player in these modes:
   - grippier (sideways slip dies out 1.3x faster) and brakes twice as strong
   - the steering reaches the wheel quicker (patched in build.py through PT8.arcSnap)
   - the handbrake key (Space for P1, Right Shift for P2, U for P3) drifts again; a drift charges the turbo, which fires when it ends
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
/* turbo meter (player 1): fills while you drift, drains while the turbo fires. Hidden outside the arcade modes */
const css=document.createElement('style');css.textContent=`#arcTurbo{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);width:220px;z-index:40;pointer-events:none;display:none;
 font:800 11px/1 Arial,sans-serif;letter-spacing:.18em;color:#fff;text-align:center;text-shadow:0 1px 2px #000a}
#arcTurbo i{display:block;height:6px;margin-top:5px;background:#ffffff33;border-radius:3px;overflow:hidden}
#arcTurbo b{display:block;height:100%;width:0;background:#fff;border-radius:3px}
#arcTurbo.on b{background:#ffb02e}`;document.head.appendChild(css);
const el=document.createElement('div');el.id='arcTurbo';el.innerHTML='<span>TURBO</span><i><b></b></i>';document.body.appendChild(el);
const lb=el.querySelector('span'),bar=el.querySelector('b');
(function tick(){requestAnimationFrame(tick);let show=false;try{const R=typeof RACE!=='undefined'?RACE:null,c=R&&R.cars&&R.cars[0];
 if(c&&c.human&&P.arcade()&&R.state!=='done'&&typeof scr!=='undefined'&&scr==='game'){show=true;const on=c.boost>0;
  el.classList.toggle('on',on);lb.textContent=on?'TURBO':c.ptDrift?'DRIFT / CHARGING':'HOLD SPACE TO DRIFT';
  bar.style.width=Math.max(0,Math.min(100,on?c.boost/1.6*100:(c.dts||0)/3*100))+'%'}}catch(e){}
 el.style.display=show?'block':'none'})();
})();
