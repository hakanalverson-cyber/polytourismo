/* ===== Poly GT layer: grip (cars stay planted on tarmac) ===== */
(function(){const P=window.PT8;
/* the drift mode now needs the handbrake key held (patched in build.py): this says whether it is */
window.PT8_HB=c=>!!(c._hb||(c.in&&c.in.hb)||(c.human&&typeof KM!=='undefined'&&KM[c.k]&&down.has(KM[c.k].h)));
/* firmer tarmac grip for the player: sideways slip on asphalt dies out 1.4x faster, so the car goes where it is pointed.
   Gravel, grass, dirt and ice keep their loose feel. The AI keeps the grip its speed planner was tuned on (with more grip its line
   control overshoots on fast downhill bends). */
const m0=P.mul;P.mul=c=>{const m=m0?m0(c):{acc:1,top:1,grip:1,brk:1};const T=RACE&&RACE.T;
 if(T&&c.human&&!c.forceAI&&!c.cool&&!T.d.gravel&&c.onRoad&&!(T.ice&&T.ice[c.idx]))m.grip*=(window.PT8_GRIPK||1.4);return m};
/* gravel is looser, by how well the car is built for it (its off-road rating): weak cars slide 50% more, neutral ones 25% more, cars built
   for gravel 10% more. "More slippery" = sideways grip divided by 1.5 / 1.25 / 1.1. Applies to every car on a gravel road. */
P.gravelSlip=c=>{const o=(c&&c.off)||0;return o>=.8?1.1:o>=.45?1.25:1.5};
{const m1=P.mul;P.mul=c=>{const m=m1(c);const T=RACE&&RACE.T;if(T&&T.d&&T.d.gravel&&c.onRoad&&c.cs)m.grip/=P.gravelSlip(c.cs);return m}}
/* downhill: the suspension damper (patched in build.py) works on the body's vertical speed relative to the ground below it. c._gv is how fast
   the ground under the car rises or falls along its path this step (m/s); without it a car going down a hill had its dampers holding it
   up off the road, so fewer than two tyres touched more than half the time and grip vanished. */
const sc0=stepCar;stepCar=function(c,dt){try{const T=RACE&&RACE.T;c._gv=0;if(T&&T.surf&&!(c.respT>0)){const h=.06,a=T.surf(c.x,c.z,c.y).h,b=T.surf(c.x+c.vx*h,c.z+c.vz*h,c.y).h,g=(b-a)/h;c._gv=isFinite(g)?Math.max(-20,Math.min(20,g)):0}}catch(e){c._gv=0}
 return sc0.apply(this,arguments)};
})();