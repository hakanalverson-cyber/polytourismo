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
 const cx=78,cy=82,R=70,A0=Math.PI*.75,A1=Math.PI*2.25,RED=.84,ang=u=>A0+(A1-A0)*u;
 /* dial */
 const gr=g.createRadialGradient(cx,cy-18,8,cx,cy,R);gr.addColorStop(0,'rgba(34,38,46,.86)');gr.addColorStop(1,'rgba(6,8,11,.9)');
 g.beginPath();g.arc(cx,cy,R,0,6.2832);g.fillStyle=gr;g.fill();g.lineWidth=1.6;g.strokeStyle='rgba(255,255,255,.42)';g.stroke();
 g.beginPath();g.arc(cx,cy,R-4.5,ang(RED),A1);g.lineWidth=5;g.strokeStyle='#e8271c';g.stroke();
 g.textAlign='center';g.textBaseline='middle';g.font='600 11px '+F;
 for(let i=0;i<=32;i++){const u=i/32,a=ang(u),big=i%4===0,red=u>=RED,c=Math.cos(a),s=Math.sin(a);g.strokeStyle=red&&!big?'#ffb4ae':'#fff';g.lineWidth=big?2:1;g.beginPath();g.moveTo(cx+c*(R-2),cy+s*(R-2));g.lineTo(cx+c*(R-(big?11:6)),cy+s*(R-(big?11:6)));g.stroke();
  if(big){g.fillStyle=red?'#ff6a5e':'#fff';g.fillText(String(i/4),cx+c*(R-21),cy+s*(R-21))}}
 g.font='500 6.5px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText('x1000 r/min',cx,cy-22);
 /* needle */
 const rv=Math.max(0,Math.min(1.02,o.rev)),a=ang(rv),nc=Math.cos(a),ns=Math.sin(a);
 g.lineCap='round';g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=3;g.strokeStyle='#ff3a2c';g.lineWidth=2.6;g.beginPath();g.moveTo(cx-nc*9,cy-ns*9);g.lineTo(cx+nc*(R-9),cy+ns*(R-9));g.stroke();g.shadowBlur=0;g.lineCap='butt';
 g.beginPath();g.arc(cx,cy,7.5,0,6.2832);g.fillStyle='#0b0d11';g.fill();g.lineWidth=1.4;g.strokeStyle='rgba(255,255,255,.55)';g.stroke();
 /* gear window */
 {const x=cx-14,y=cy+28,w=28,h=27,r=4;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
  g.fillStyle=o.shift?'#d8261b':'rgba(4,5,7,.92)';g.fill();g.lineWidth=1.2;g.strokeStyle=o.shift?'#ffd2cd':'rgba(255,255,255,.5)';g.stroke();
  g.font='700 22px '+F;g.fillStyle='#fff';g.fillText(String(o.gear),cx,y+h/2+1)}
 /* speed */
 {const x=154,y=86,w=84,h=58,r=7;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle='rgba(6,8,11,.72)';g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.28)';g.stroke();
  g.textAlign='right';g.textBaseline='alphabetic';g.font='600 36px '+F;g.fillStyle='#fff';g.fillText(String(o.kmh),x+w-8,y+36);
  g.font='500 10px '+F;g.fillStyle='rgba(255,255,255,.72)';g.fillText(o.unit,x+w-8,y+51);
  if(o.tag){g.textAlign='left';g.font='700 11px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,x+8,y+51)}}};
})();
