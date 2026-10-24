/* ===== Poly GT layer: grip (cars stay planted on tarmac) ===== */
(function(){const P=window.PT8;
/* the drift mode now needs the handbrake key held (patched in build.py): this says whether it is */
window.PT8_HB=c=>!!(c._hb||(c.in&&c.in.hb)||(c.human&&typeof KM!=='undefined'&&KM[c.k]&&down.has(KM[c.k].h)));
/* firmer tarmac grip for the player: sideways slip on asphalt dies out 1.4x faster, so the car goes where it is pointed.
   Gravel, grass, dirt and ice keep their loose feel. The AI keeps the grip its speed planner was tuned on (with more grip its line
   control overshoots on fast downhill bends). */
const m0=P.mul;P.mul=c=>{const m=m0?m0(c):{acc:1,top:1,grip:1,brk:1};const T=RACE&&RACE.T;
 if(T&&c.human&&!c.forceAI&&!c.cool&&!T.d.gravel&&c.onRoad&&!(T.ice&&T.ice[c.idx]))m.grip*=(window.PT8_GRIPK||1.4);return m};
})();
