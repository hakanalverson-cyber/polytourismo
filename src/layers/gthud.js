/* ===== Poly GT layer: gthud (Nov 13, Hakan's notes on the race screen: the position / lap box "takes up way too much space", and
   "a GT5 inspired speedometer", all of it working in split screen).
   - top left: no box. Position as "1/6", the lap count and the race clock as plain white text with a soft shadow, about half the old footprint
   - speedometer: a round analog rev counter (dark dial, white numbers, red zone, needle), the gear in a window at the foot of the dial (it turns
     red when it is time to change up) and the speed as digits beside it. One player: bottom centre, as in GT5. Split screen: bottom right of each
     view, scaled with the view, with the player tag by the speed. ===== */
(function gthud(){
'use strict';
const P=window.PT8;if(!P)return;
const st=document.createElement('style');st.textContent=`
.hud .h8top{background:none!important;box-shadow:none!important;border:0!important;padding:0!important;left:14px;display:flex!important;align-items:flex-end!important;gap:10px!important;text-shadow:0 1px 2px #000d,0 0 6px #0009}
.hud .h8pos{display:flex;align-items:baseline;gap:1px;padding:0!important;background:none!important;border:0!important;min-width:0!important}
.hud .h8pos b{font:italic 700 30px/1 var(--gt)!important;color:#fff!important}
.hud .h8pos i{display:none!important}
.hud .h8pos span{font:italic 600 14px/1 var(--gt)!important;color:#dfe5ea!important;letter-spacing:0!important}
.hud .h8plate{background:none!important;border:0!important;padding:0 0 1px!important;display:flex!important;flex-direction:column!important;gap:1px!important}
.hud .h8plate .lap,.hud .h8plate .tag{font:600 9px/1 var(--gt)!important;letter-spacing:.18em!important;color:#dfe5ea!important}
.hud .h8plate .raceTime{font:600 15px/1.05 var(--gt)!important;letter-spacing:.02em!important;color:#fff!important;font-variant-numeric:tabular-nums}
.hud .h8plate .bl{font:500 8px/1 var(--gt)!important;letter-spacing:.14em!important;color:#c3ccd3!important}
.hud .h8mode .cu{background:none!important;box-shadow:none!important;border:0!important;padding:0!important;gap:12px!important;text-shadow:0 1px 2px #000d,0 0 6px #0009}
.hud .h8mode .cu small{font:600 8px/1 var(--gt)!important;letter-spacing:.16em!important;color:#dfe5ea!important}
.hud .h8mode .cu b{font:600 13px/1.1 var(--gt)!important;color:#fff!important}
.hud .h8top{transform:scale(max(var(--s),.82))!important;transform-origin:top left!important}
.h8spd::before{display:none!important}
.h8spd .gx5{width:312px!important;height:208px!important;margin:-70px -10px -8px!important}`;document.head.appendChild(st);
const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif';
P.gx5Draw=(cv,o)=>{const g=cv.getContext('2d'),W=cv.width,k=W/240;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,240,160);
 /* Nov 13 (Hakan: make it look like number 13 in the Gran Turismo 7 screen): a curved strip of rev ticks over a dark readout, the speed on the left, a divider, and the gear on the right */
 const cx=120,rev=Math.max(0,Math.min(1,o.rev)),RED=.86,N=44,Rr=150,ccy=222;
 /* the readout plate: wide, flat, with slanted ends */
 g.beginPath();g.moveTo(16,92);g.lineTo(224,92);g.lineTo(212,134);g.quadraticCurveTo(120,142,28,134);g.closePath();
 const pg=g.createLinearGradient(0,92,0,138);pg.addColorStop(0,'rgba(24,28,34,.86)');pg.addColorStop(1,'rgba(6,8,11,.86)');g.fillStyle=pg;g.fill();
 g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.14)';g.stroke();
 /* the rev strip: ticks along a shallow arc, lit up to the revs, the last stretch red */
 for(let i=0;i<=N;i++){const u=i/N,a=-Math.PI/2+(u-.5)*1.05,c=Math.cos(a),sn=Math.sin(a),on=u<=rev,red=u>=RED,big=i%4===0;
  const x0=cx+c*Rr,y0=ccy+sn*Rr,x1=cx+c*(Rr-(big?10:7)),y1=ccy+sn*(Rr-(big?10:7));
  g.strokeStyle=on?(red?'#ff4a3d':'#ffffff'):(red?'rgba(255,74,61,.35)':'rgba(255,255,255,.28)');g.lineWidth=big?2.2:1.5;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
 /* the speed (left), a divider, the gear (right) */
 g.textBaseline='alphabetic';g.textAlign='right';g.font='italic 600 36px '+F;g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=4;g.fillText(String(o.kmh),cx-10,124);g.shadowBlur=0;
 g.textAlign='right';g.font='500 8px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.unit.toLowerCase(),cx-10,134);
 g.fillStyle='rgba(255,255,255,.28)';g.fillRect(cx,102,1,30);
 g.textAlign='left';g.font='italic 700 40px '+F;g.fillStyle=o.shift?'#ff4a3d':'#fff';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=4;g.fillText(String(o.gear),cx+16,125);g.shadowBlur=0;
 g.font='600 8px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.auto?'AT':'MT',cx+16,134);
 if(o.shift){g.fillStyle='#d8261b';g.fillRect(cx+46,106,9,9)}
 if(o.tag){g.textAlign='left';g.textBaseline='alphabetic';g.font='700 11px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,30,124)}};
})();
