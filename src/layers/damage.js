/* ===== Poly Tourismo v9 layer: damage (optional in every mode: bin it and the car really is hurt) ===== */
(function v9damage(){
'use strict';
const P=window.PT8;
P.dmgOn=Rc=>{const c=Rc&&Rc.cfg;return !!c&&(c.dmg!==undefined?!!c.dmg:!!c.rally)};
/* outside rally the rally layer's multipliers don't run, so a hurt car loses power / grip here */
const m0=P.mul;P.mul=c=>{const m=m0(c);const Rc=RACE;if(c.human&&c.dmg>0&&!(Rc&&Rc.cfg&&Rc.cfg.rally)){const dm=c.dmg;m.acc*=1-.5*Math.pow(dm,1.2);m.top*=1-.32*dm;m.grip*=1-.14*dm;m.brk*=1-.3*dm}return m};
const st0=step;step=function(dt){st0.apply(this,arguments);try{const Rc=RACE;if(!Rc||!Rc.cfg||Rc.cfg.rally)return;const on=P.dmgOn(Rc);let first=null;
 for(const c of Rc.cars){if(!c.human)continue;if(c.cdT>0)c.cdT-=dt;if(on&&P.smokeFx)P.smokeFx(c,Rc,dt);if(!first)first=c}
 if(on&&first&&Rc.state==='race'&&P.statUpdate)P.statUpdate(Rc,first)}catch(e){if(!P._dErr){P._dErr=1;console.warn('damage',e)}}};
const sh0=show;show=function(id){if(id!=='game'&&id!=='pause'){const e=document.getElementById('rlStat');if(e)e.style.display='none'}return sh0.apply(this,arguments)};
})();
