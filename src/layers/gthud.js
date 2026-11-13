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
.h8spd{left:50%!important;right:auto!important;transform:translateX(-50%) scale(max(var(--s),.72))!important;transform-origin:50% 100%!important}
.h8spd .gx5{width:312px!important;height:208px!important;margin:-70px 0 -8px!important}`;document.head.appendChild(st);
const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif';
P.gx5Draw=(cv,o)=>{const g=cv.getContext('2d'),W=cv.width,k=W/240;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,240,160);
 /* Nov 13 (Hakan: make it look like number 13 in the Gran Turismo 7 screen): a curved strip of rev ticks over a dark glass readout, speed left, divider, gear right */
 const cx=120,rev=Math.max(0,Math.min(1,o.rev)),RED=.86,N=48,Rr=170,ccy=250;
 g.beginPath();g.moveTo(14,86);g.lineTo(226,86);g.lineTo(214,138);g.quadraticCurveTo(120,148,26,138);g.closePath();
 const pg=g.createLinearGradient(0,86,0,142);pg.addColorStop(0,'rgba(34,40,48,.9)');pg.addColorStop(.5,'rgba(14,17,22,.9)');pg.addColorStop(1,'rgba(4,6,9,.92)');g.fillStyle=pg;g.fill();
 g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.22)';g.stroke();
 /* the blue accent along the foot of the plate */
 g.beginPath();g.moveTo(26,138);g.quadraticCurveTo(120,148,214,138);g.lineWidth=2;g.strokeStyle='#5f9bd6';g.stroke();
 /* the rev strip */
 for(let i=0;i<=N;i++){const u=i/N,a=-Math.PI/2+(u-.5)*.98,c=Math.cos(a),sn=Math.sin(a),on=u<=rev,red=u>=RED,big=i%4===0;
  const L=big?15:10,x0=cx+c*Rr,y0=ccy+sn*Rr,x1=cx+c*(Rr-L),y1=ccy+sn*(Rr-L);
  if(on){g.shadowColor=red?'rgba(255,60,45,.9)':'rgba(255,255,255,.8)';g.shadowBlur=5}
  g.strokeStyle=on?(red?'#ff4a3d':'#ffffff'):(red?'rgba(255,74,61,.45)':'rgba(255,255,255,.32)');g.lineWidth=big?2.6:1.8;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.shadowBlur=0}
 g.textBaseline='alphabetic';g.textAlign='right';g.font='italic 600 34px '+F;g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=5;g.fillText(String(o.kmh),cx-12,124);g.shadowBlur=0;
 g.font='500 9px '+F;g.fillStyle='rgba(255,255,255,.62)';g.fillText(o.unit.toLowerCase(),cx-12,136);
 g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cx,98,1,34);
 g.textAlign='left';g.font='italic 700 40px '+F;g.fillStyle=o.shift?'#ff4a3d':'#fff';g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=5;g.fillText(String(o.gear),cx+16,126);g.shadowBlur=0;
 g.font='600 9px '+F;g.fillStyle='rgba(255,255,255,.62)';g.fillText(o.auto?'AT':'MT',cx+16,136);
 if(o.shift){g.fillStyle='#d8261b';g.fillRect(cx+52,104,10,10)}
 if(o.tag){g.textAlign='left';g.font='700 10px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,30,100)}};
})();
