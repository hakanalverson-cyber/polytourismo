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
.hud .h8spd,body .hud .h8spd{left:50%!important;right:auto!important;transform:translateX(-50%) scale(max(var(--s),.72))!important;transform-origin:50% 100%!important}
.h8spd .gx5{width:312px!important;height:208px!important;margin:-64px 0 -26px!important}`;document.head.appendChild(st);
const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif';
/* seven-segment digits, slanted a touch, as on the Gran Turismo 7 cluster */
const SEG={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg','-':'g'};
function seg7(g,txt,x,y,h,col,align){const w=h*.56,t=Math.max(2,h*.12),gap=h*.2,n=txt.length,tot=n*w+(n-1)*gap;let x0=align==='right'?x-tot:x;
 const sk=-.14;g.save();g.fillStyle=col;
 for(const ch of txt){const on=SEG[ch]||'';const R=(sx,sy,sw,sh)=>{g.beginPath();g.moveTo(sx+sy*sk*-1,sy);g.lineTo(sx+sw+sy*sk*-1,sy);g.lineTo(sx+sw+(sy+sh)*sk*-1,sy+sh);g.lineTo(sx+(sy+sh)*sk*-1,sy+sh);g.closePath();g.fill()};
  const a=h/2;const X=x0,Y=y;
  if(on.includes('a'))R(X+t*.6,Y,w-t*1.2,t);if(on.includes('d'))R(X+t*.6,Y+h-t,w-t*1.2,t);if(on.includes('g'))R(X+t*.6,Y+a-t/2,w-t*1.2,t);
  if(on.includes('f'))R(X,Y+t*.6,t,a-t*.9);if(on.includes('b'))R(X+w-t,Y+t*.6,t,a-t*.9);if(on.includes('e'))R(X,Y+a+t*.3,t,a-t*.9);if(on.includes('c'))R(X+w-t,Y+a+t*.3,t,a-t*.9);
  x0+=w+gap}
 g.restore();return tot}
P.gx5Draw=(cv,o)=>{const g=cv.getContext('2d'),W=cv.width,k=W/240;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,240,160);
 /* Nov 13 (Hakan: look at number 13 in the Gran Turismo 7 screen): a dense strip of fine rev ticks arching over a wide, low, dark plate with slanted ends:
    speed in seven-segment digits on the left, a divider, the gear on the right with MT / AT under it and a red box with the next gear when it is time to change */
 const cx=120,rev=Math.max(0,Math.min(1,o.rev)),RED=.84,N=72,Rr=360,ccy=64+Rr;
 g.beginPath();g.moveTo(12,84);g.lineTo(228,84);g.lineTo(214,128);g.quadraticCurveTo(120,136,26,128);g.closePath();
 const pg=g.createLinearGradient(0,84,0,132);pg.addColorStop(0,'rgba(30,34,41,.88)');pg.addColorStop(1,'rgba(5,7,10,.9)');g.fillStyle=pg;g.fill();
 g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.2)';g.stroke();
 for(let i=0;i<=N;i++){const u=i/N,a=-Math.PI/2+(u-.5)*.56,c=Math.cos(a),sn=Math.sin(a),on=u<=rev,red=u>=RED,big=i%6===0;
  const L=big?11:7,x0=cx+c*Rr,y0=ccy+sn*Rr,x1=cx+c*(Rr-L),y1=ccy+sn*(Rr-L);
  g.strokeStyle=on?(red?'#ff4a3d':'#ffffff'):(red?'rgba(255,74,61,.45)':'rgba(255,255,255,.3)');g.lineWidth=big?1.8:1.2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
 const dy=92,dh=30,ink='#f4f7fa';
 seg7(g,String(o.kmh),cx-14,dy,dh,ink,'right');
 g.textBaseline='alphabetic';g.textAlign='right';g.font='500 8px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.unit.toLowerCase(),cx-14,dy+dh+9);
 g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cx,90,1,36);
 seg7(g,String(o.gear),cx+16,dy,dh,o.shift?'#ff5446':ink,'left');
 g.textAlign='left';g.font='600 8px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.auto?'AT':'MT',cx+16,dy+dh+9);
 if(o.shift){const bx=cx+16+dh*.56+13,by=dy-2;g.fillStyle="#d8261b";g.fillRect(bx,by,14,15);seg7(g,String(Math.min(9,(o.gear|0)+1)),bx+11,by+3,9,"#fff","right")}
 if(o.tag){g.textAlign='left';g.font='700 10px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,28,104)}};
})();
