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
.h8spd .gx5{width:600px!important;height:200px!important;margin:0!important}`;document.head.appendChild(st);
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
P.gx5Cluster=(cv,o)=>{if(cv.width!==960||cv.height!==400){cv.width=960;cv.height=400}
 const g=cv.getContext('2d'),k=cv.width/480;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,480,200);
 /* Nov 13 (Hakan: pay attention to the layout): the whole Gran Turismo 7 cluster. A speedometer dial on the left (white arc fills with the speed), a tachometer
    dial on the right (red zone, red arc fills with the revs), the wide readout (number 13) on top between them with its strip of rev ticks, the speed in
    seven-segment digits, the gear and MT / AT, and the traction-control selector underneath. */
 const A0=Math.PI*.75,SW=Math.PI*1.5,PI=Math.PI,rev=Math.max(0,Math.min(1,o.rev)),maxS=Math.max(80,o.maxK||240),RED=.84;
 const pol=(cx,cy,r,a)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
 const disc=(cx,cy,R)=>{const gr=g.createRadialGradient(cx,cy-R*.3,R*.1,cx,cy,R);gr.addColorStop(0,'rgba(34,38,46,.8)');gr.addColorStop(1,'rgba(6,8,11,.88)');g.beginPath();g.arc(cx,cy,R,0,PI*2);g.fillStyle=gr;g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.14)';g.stroke()};
 const arc=(cx,cy,r,a0,a1,w,c)=>{g.beginPath();g.arc(cx,cy,r,a0,a1);g.lineWidth=w;g.strokeStyle=c;g.lineCap='butt';g.stroke()};
 const tk=(cx,cy,r,a,l,w,c)=>{const p=pol(cx,cy,r,a),q=pol(cx,cy,r-l,a);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.lineWidth=w;g.strokeStyle=c;g.stroke()};
 const mini=(cx,cy,r,lab0,lab1,fill)=>{arc(cx,cy,r,A0,A0+SW,1.4,'rgba(255,255,255,.35)');arc(cx,cy,r,A0,A0+SW*fill,1.4,'#fff');g.fillStyle='rgba(255,255,255,.7)';g.font='600 6px '+F;g.textAlign='center';g.textBaseline='middle';
  let p=pol(cx,cy,r+6,A0+.05);g.fillText(lab0,p[0],p[1]);p=pol(cx,cy,r+6,A0+SW-.05);g.fillText(lab1,p[0],p[1])};
 /* ---- left: speed ---- */
 {const cx=92,cy=128,R=72;disc(cx,cy,R);arc(cx,cy,R-3,A0,A0+SW,1.2,'rgba(255,255,255,.25)');
  const u=Math.min(1,(o.spd!=null?o.spd:o.kmh)/maxS);arc(cx,cy,R-3,A0,A0+SW*u,4,'#f4f7fa');
  const lab=maxS>320?80:40;g.font='600 7.5px '+F;g.textAlign='center';g.textBaseline='middle';
  for(let v=0;v<=maxS;v+=10){const a=A0+SW*v/maxS,big=v%lab===0;tk(cx,cy,R-8,a,big?7:4,big?1.4:1,'rgba(255,255,255,'+(big?.9:.5)+')');if(big){const p=pol(cx,cy,R-22,a);g.fillStyle='rgba(255,255,255,.85)';g.fillText(String(v),p[0],p[1])}}
  g.fillStyle='rgba(255,255,255,.65)';g.font='600 7px '+F;g.fillText(o.unit.toLowerCase(),cx,cy-34);mini(cx,cy+26,15,'E','F',.62)}
 /* ---- right: revs ---- */
 {const cx=388,cy=128,R=72;disc(cx,cy,R);arc(cx,cy,R-3,A0,A0+SW,1.2,'rgba(255,255,255,.25)');
  arc(cx,cy,R-3,A0+SW*RED,A0+SW,4,'rgba(255,74,61,.9)');arc(cx,cy,R-3,A0,A0+SW*Math.min(1,rev),4,rev>=RED?'#ff4a3d':'#ff7468');
  g.font='600 7.5px '+F;g.textAlign='center';g.textBaseline='middle';
  for(let v=0;v<=16;v++){const a=A0+SW*v/16,big=v%2===0,red=v/16>=RED;tk(cx,cy,R-8,a,big?7:4,big?1.4:1,red?'#ff8a80':'rgba(255,255,255,'+(big?.9:.5)+')');if(big){const p=pol(cx,cy,R-22,a);g.fillStyle=red?'#ff8a80':'rgba(255,255,255,.85)';g.fillText(String(v/2),p[0],p[1])}}
  g.fillStyle='rgba(255,255,255,.65)';g.font='600 6.5px '+F;g.fillText('x1000 rpm',cx,cy-34);mini(cx,cy+26,15,'-1','2',.4)}
 /* ---- centre top: the readout (number 13) ---- */
 {const cx=240,N=72,Rr=300,ccy=18+Rr;
  g.beginPath();g.moveTo(152,32);g.lineTo(328,32);g.lineTo(316,92);g.quadraticCurveTo(240,99,164,92);g.closePath();
  const pg=g.createLinearGradient(0,36,0,90);pg.addColorStop(0,'rgba(30,34,41,.92)');pg.addColorStop(1,'rgba(6,8,11,.94)');g.fillStyle=pg;g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.2)';g.stroke();
  for(let i=0;i<=N;i++){const u=i/N,a=-PI/2+(u-.5)*.5,on=u<=rev,red=u>=RED,big=i%8===0,L=big?9:6,c=Math.cos(a),sn=Math.sin(a);
   g.strokeStyle=on?(red?'#ff4a3d':'#fff'):(red?'rgba(255,74,61,.5)':'rgba(255,255,255,.32)');g.lineWidth=big?1.6:1.1;g.beginPath();g.moveTo(cx+c*Rr,ccy+sn*Rr);g.lineTo(cx+c*(Rr-L),ccy+sn*(Rr-L));g.stroke()}
  const dy=42,dh=36;seg7(g,String(o.kmh),cx-10,dy,dh,'#f4f7fa','right');
  g.textBaseline='alphabetic';g.textAlign='right';g.font='500 7px '+F;g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.unit.toLowerCase(),cx-10,dy+dh+9);
  g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cx,42,1,38);
  seg7(g,String(o.gear),cx+12,dy,dh,o.shift?'#ff5446':'#f4f7fa','left');
  g.textAlign='left';g.fillStyle='rgba(255,255,255,.6)';g.fillText(o.auto?'AT':'MT',cx+12,dy+dh+9);
  /* the box beside the gear: the next gear, red when it is time to change */
  const bx=cx+12+dh*.56+14,by=dy-1;g.fillStyle=o.shift?'#d8261b':'rgba(255,255,255,.12)';g.fillRect(bx,by,16,dh+2);if(o.shift)seg7(g,String(Math.min(9,(o.gear|0)+1)),bx+12,by+8,12,'#fff','right')}
 /* ---- centre bottom: traction control selector with the gear ---- */
 {const cx=240,cy=146;g.fillStyle='rgba(255,255,255,.85)';g.font='600 8px '+F;g.textAlign='center';g.textBaseline='middle';g.fillText('TCS',cx,100);
  arc(cx,cy+8,32,PI*1.08,PI*1.92,3,'rgba(255,255,255,.22)');arc(cx,cy+8,32,PI*1.08,PI*1.5,3,'#3b9cf0');g.fillStyle='rgba(255,255,255,.55)';g.font='600 6.5px '+F;g.fillText('LOW',cx-40,cy+10);g.fillText('HIGH',cx+40,cy+10);
  seg7(g,String(o.gear),cx+5,cy+12,20,'#f4f7fa','right');g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(cx-1,cy+40);g.lineTo(cx+5,cy+40);g.lineTo(cx+2,cy+45);g.closePath();g.fill()}
 if(o.tag){g.textAlign='center';g.textBaseline='alphabetic';g.font='700 11px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,240,194)}};
/* Nov 13 (Hakan: more interesting, more scientific): a telemetry readout. Speed and gear in the middle over a scaled rev bar (x1000 rpm marks), brake and throttle
   traces on the sides, a steering arc, and a G-force circle with a trailing dot, driven by the car's real accelerations. (PTO.gauge==='cluster': the dial cluster.) */
const TRAIL=new WeakMap();
P.gx5Tele=(cv,o)=>{if(cv.width!==1200||cv.height!==400){cv.width=1200;cv.height=400}
 const g=cv.getContext('2d'),k=cv.width/600;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,600,200);
 const T=o.tl||{th:0,br:0,st:0,lon:0,lat:0},rev=Math.max(0,Math.min(1,o.rev)),RED=.86,cx=300,PI=Math.PI;
 const line=(x0,y0,x1,y1,w,c)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineWidth=w;g.strokeStyle=c;g.stroke()};
 const dim='rgba(255,255,255,.55)',faint='rgba(255,255,255,.22)';
 g.textBaseline='alphabetic';
 /* speed + gear */
 g.shadowColor='rgba(0,0,0,.75)';g.shadowBlur=10;
 g.textAlign='right';g.font='italic 700 70px '+F;g.fillStyle='#fff';g.fillText(String(o.kmh),cx-8,108);
 g.textAlign='left';g.fillStyle=o.shift?'#ff5446':'#fff';g.fillText(String(o.gear),cx+30,108);g.shadowBlur=0;
 g.font='600 10px '+F;g.fillStyle=dim;g.textAlign='right';g.fillText(o.unit.toUpperCase(),cx-10,124);g.textAlign='left';g.fillText((o.auto?'AUTO':'MANUAL')+' · GEAR',cx+32,124);
 line(cx+8,56,cx+8,112,1.5,faint);
 /* the rev bar, with its scale */
 {const N=50,bw=290,x0=cx-bw/2,y0=148,sw=bw/N;
  for(let i=0;i<N;i++){const u=(i+.5)/N,on=u<=rev,red=u>=RED;g.fillStyle=on?(red?'#ff4a3d':'#fff'):(red?'rgba(255,74,61,.3)':faint);const x=x0+i*sw;g.beginPath();g.moveTo(x+2.5,y0);g.lineTo(x+sw-.6+2.5,y0);g.lineTo(x+sw-.6,y0+7);g.lineTo(x,y0+7);g.closePath();g.fill()}
  g.font='600 9px '+F;g.textAlign='center';for(let v=0;v<=8;v++){const x=x0+bw*v/8;line(x,y0+9,x,y0+13,1,v>=7?'#ff8a80':dim);g.fillStyle=v>=7?'#ff8a80':dim;g.fillText(String(v),x,y0+23)}
  g.textAlign='left';g.fillStyle=dim;g.fillText('x1000 RPM',x0,y0-6);g.textAlign='right';g.fillText(Math.round(rev*8000/10)*10+' RPM',x0+bw,y0-6);
  if(o.shift){g.shadowColor='#ff4a3d';g.shadowBlur=10;line(x0,y0+30,x0+bw,y0+30,2,'#ff4a3d');g.shadowBlur=0}}
 /* pedal traces: brake on the left, throttle on the right */
 const bar=(x,v,col,lab)=>{const y0=62,h=86;g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x-4,y0,8,h);g.fillStyle=col;const hh=h*Math.max(0,Math.min(1,v));g.fillRect(x-4,y0+h-hh,8,hh);
  for(let i=0;i<=4;i++)line(x+6,y0+h*i/4,x+9,y0+h*i/4,1,faint);g.font='600 8px '+F;g.textAlign='center';g.fillStyle=dim;g.fillText(lab,x,y0+h+13);g.fillText(Math.round(v*100)+'%',x,y0-8)};
 bar(70,T.br,'#ff5a4a','BRAKE');bar(530,T.th,'#7ee08a','THROTTLE');
 /* steering arc */
 {const sx=480,sy=100,R=30;g.beginPath();g.arc(sx,sy,R,PI*1.12,PI*1.88);g.lineWidth=2;g.strokeStyle=faint;g.stroke();
  const a=-PI/2+Math.max(-1,Math.min(1,T.st))*PI*.38;g.beginPath();g.arc(sx,sy,R,-PI/2,a,a<-PI/2);g.lineWidth=3;g.strokeStyle='#8fc4ff';g.stroke();
  const px=sx+Math.cos(a)*R,py=sy+Math.sin(a)*R;g.fillStyle='#fff';g.beginPath();g.arc(px,py,3.2,0,PI*2);g.fill();
  g.font='600 8px '+F;g.textAlign='center';g.fillStyle=dim;g.fillText('STEER',sx,sy+22);g.fillText(Math.round(T.st*100)+'%',sx,sy+32)}
 /* G circle with a trail */
 {const gx=120,gy=100,R=34;g.beginPath();g.arc(gx,gy,R,0,PI*2);g.fillStyle='rgba(8,10,14,.55)';g.fill();g.lineWidth=1;g.strokeStyle=dim;g.stroke();
  g.beginPath();g.arc(gx,gy,R*.5,0,PI*2);g.strokeStyle=faint;g.stroke();line(gx-R,gy,gx+R,gy,1,faint);line(gx,gy-R,gx,gy+R,1,faint);
  const tr=TRAIL.get(cv)||[];const dx=Math.max(-1,Math.min(1,T.lat/1.6))*R*.92,dy=-Math.max(-1,Math.min(1,T.lon/1.2))*R*.92;
  tr.push([dx,dy]);if(tr.length>14)tr.shift();TRAIL.set(cv,tr);
  tr.forEach((p,i)=>{g.fillStyle='rgba(143,196,255,'+(.08+.35*i/tr.length)+')';g.beginPath();g.arc(gx+p[0],gy+p[1],2+i*.12,0,PI*2);g.fill()});
  g.fillStyle='#fff';g.shadowColor='#8fc4ff';g.shadowBlur=8;g.beginPath();g.arc(gx+dx,gy+dy,4,0,PI*2);g.fill();g.shadowBlur=0;
  g.font='600 8px '+F;g.textAlign='center';g.fillStyle=dim;g.fillText('G FORCE',gx,gy+R+13);const gg=Math.hypot(T.lat,T.lon);g.fillStyle='#fff';g.fillText(gg.toFixed(2)+' G',gx,gy-R-6)}
 if(o.tag){g.textAlign='center';g.font='700 12px '+F;g.fillStyle=o.tagCol||'#fff';g.fillText(o.tag,cx,56)}};
/* Nov 13 (Hakan: it looks really AI-like): no glow, no gadgets. A plain plate in the same glossy grey as the pause menu and the finish board, a rev bar along its top edge
   (the game's blue, red at the limit), the gear in its own dark cell, the speed in steady upright digits. (PTO.gauge = 'cluster' or 'telemetry' bring the others back.) */
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
P.gx5Draw=(cv,o)=>{const st=window.PTO&&window.PTO.gauge;if(st==='cluster')return P.gx5Cluster(cv,o);if(st==='telemetry')return P.gx5Tele(cv,o);
 if(cv.width!==1200||cv.height!==400){cv.width=1200;cv.height=400}
 const g=cv.getContext('2d'),k=cv.width/600;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,600,200);
 const rev=Math.max(0,Math.min(1,o.rev)),RED=.88,cx=300,W=270,H=70,x0=cx-W/2,y0=118;
 /* plate */
 rr(g,x0,y0,W,H,6);const pg=g.createLinearGradient(0,y0,0,y0+H);pg.addColorStop(0,'#3a3e44');pg.addColorStop(.48,'#24272c');pg.addColorStop(.52,'#17191c');pg.addColorStop(1,'#1e2125');g.fillStyle=pg;g.fill();
 g.lineWidth=1.5;g.strokeStyle='#000';g.stroke();g.save();rr(g,x0+.5,y0+.5,W-1,H-1,5.5);g.clip();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x0,y0,W,1);g.restore();
 /* rev bar */
 {const N=36,bx=x0+10,bw=W-20,by=y0+8,bh=9,gap=1.6,sw=(bw-gap*(N-1))/N;
  for(let i=0;i<N;i++){const u=(i+.5)/N,on=u<=rev,red=u>=RED,x=bx+i*(sw+gap);
   if(on){const lg=g.createLinearGradient(0,by,0,by+bh);if(red){lg.addColorStop(0,'#ff8a7e');lg.addColorStop(1,'#d8261b')}else{lg.addColorStop(0,'#8fb4d8');lg.addColorStop(.5,'#4f7eab');lg.addColorStop(1,'#33608c')}g.fillStyle=lg}
   else g.fillStyle=red?'#4a1d1a':'#0c0e11';g.fillRect(x,by,sw,bh)}}
 /* gear cell */
 {const gw=46,gh=34,gx=x0+12,gy=y0+27;rr(g,gx,gy,gw,gh,4);if(o.shift){const rg=g.createLinearGradient(0,gy,0,gy+gh);rg.addColorStop(0,'#ff8a7e');rg.addColorStop(.5,'#d8261b');rg.addColorStop(1,'#a81a12');g.fillStyle=rg}else g.fillStyle='#0a0c0f';g.fill();g.lineWidth=1;g.strokeStyle=o.shift?'#ffd2cd':'rgba(255,255,255,.25)';g.stroke();
  g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='600 28px '+F;g.fillText(String(o.gear),gx+gw/2,gy+gh/2+1.5)}
 /* speed */
 g.textBaseline='alphabetic';g.textAlign='right';g.fillStyle='#fff';g.font='500 38px '+F;g.fillText(String(o.kmh),x0+W-62,y0+60);
 g.textAlign='left';g.fillStyle='#9aa3ab';g.font='500 11px '+F;g.fillText(o.unit.toUpperCase(),x0+W-56,y0+60);
 g.fillStyle='#9aa3ab';g.font='500 9px '+F;g.textAlign='left';g.fillText(o.auto?'AT':'MT',x0+W-56,y0+46);
 if(o.tag){g.textAlign='right';g.font='600 12px '+F;g.fillStyle=o.tagCol||'#fff';g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=3;g.fillText(o.tag,x0-8,y0+H-8);g.shadowBlur=0}};
})();
