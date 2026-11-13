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
.h8spd .gx5{width:228px!important;height:152px!important}`;document.head.appendChild(st);
const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif';
P.gx5Draw=(cv,o)=>{const g=cv.getContext('2d'),W=cv.width,k=W/240;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,240,160);
 /* Nov 13 (Hakan: the gauge cluster looks pretty bad): one round dial, the way GT5 draws it. The speed is in the dial itself, the gear sits in a small
    window at its foot (red when it is time to change up), and there are no boxes round anything. */
 const cx=150,cy=82,R=74,A0=Math.PI*.72,A1=Math.PI*2.28,RED=.86,ang=u=>A0+(A1-A0)*u;
 const gr=g.createRadialGradient(cx,cy-20,6,cx,cy,R);gr.addColorStop(0,'rgba(30,34,42,.72)');gr.addColorStop(1,'rgba(4,6,9,.82)');
 g.beginPath();g.arc(cx,cy,R,0,6.2832);g.fillStyle=gr;g.fill();g.lineWidth=1.2;g.strokeStyle='rgba(255,255,255,.3)';g.stroke();
 g.beginPath();g.arc(cx,cy,R-3.5,ang(RED),A1);g.lineWidth=4;g.strokeStyle='rgba(232,39,28,.92)';g.stroke();
 g.textAlign='center';g.textBaseline='middle';g.font='600 10px '+F;
 for(let i=0;i<=32;i++){const u=i/32,a=ang(u),big=i%4===0,red=u>=RED,c=Math.cos(a),s=Math.sin(a);if(!big&&i%2)continue;g.strokeStyle=red?'#ff8a80':'#fff';g.lineWidth=big?1.8:.9;g.beginPath();g.moveTo(cx+c*(R-1.5),cy+s*(R-1.5));g.lineTo(cx+c*(R-(big?9:5)),cy+s*(R-(big?9:5)));g.stroke();
  if(big){g.fillStyle=red?'#ff6a5e':'#e8edf1';g.fillText(String(i/4),cx+c*(R-18),cy+s*(R-18))}}
 /* needle: a thin tapered pointer, from the rim in to just short of the digits */
 const rv=Math.max(0,Math.min(1.02,o.rev)),a=ang(rv),nc=Math.cos(a),ns=Math.sin(a),px=-ns,py=nc;
 g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=3;g.fillStyle='#ff3a2c';g.beginPath();g.moveTo(cx+nc*(R-3),cy+ns*(R-3));g.lineTo(cx+nc*30+px*2.2,cy+ns*30+py*2.2);g.lineTo(cx+nc*30-px*2.2,cy+ns*30-py*2.2);g.closePath();g.fill();g.shadowBlur=0;
 /* speed in the dial */
 g.textAlign='center';g.textBaseline='alphabetic';g.font='italic 700 30px '+F;g.fillStyle='#fff';g.fillText(String(o.kmh),cx,cy+14);
 g.font='500 8px '+F;g.fillStyle='rgba(255,255,255,.65)';g.fillText(o.unit.toUpperCase(),cx,cy+25);
 /* gear window at the foot of the dial */
 {const w=22,h=20,x=cx-w/2,y=cy+R-26,r=4;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
  g.fillStyle=o.shift?'#d8261b':'rgba(0,0,0,.55)';g.fill();g.lineWidth=1;g.strokeStyle=o.shift?'#ffd2cd':'rgba(255,255,255,.45)';g.stroke();
  g.textBaseline='middle';g.font='700 15px '+F;g.fillStyle='#fff';g.fillText(String(o.gear),cx,y+h/2+.5)}
 if(o.tag){g.textAlign='right';g.textBaseline='alphabetic';g.font='700 12px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,cx-R-8,cy+R-4)}};
})();
