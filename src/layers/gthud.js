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
.h8spd .gx5{width:760px!important;height:250px!important;margin:0!important}`;document.head.appendChild(st);
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
P.gx5Plain=(cv,o)=>{
 const LW=o.lw||600,LH=o.lh||200,OX=o.ox||0,OY=o.oy||0;if(cv.width!==LW*2||cv.height!==LH*2){cv.width=LW*2;cv.height=LH*2}
 const g=cv.getContext('2d'),k=cv.width/LW;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(k,0,0,k,OX*k,OY*k);
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
/* Nov 13 (Hakan: I want the scientific look, something about that setup looked AI): a data-logger panel. Flat and square, thin 1 px rules, one monospace face, no glow, no shadows,
   no italics. Friction circle (lateral / longitudinal G with a thin trail), speed and gear in tabular digits over a ruled rev scale, and scrolling throttle / brake / steering
   traces with a grid, like an engineer's screen. (PTO.gauge = 'plain', 'cluster' or 'telemetry' bring the others back.) */
const MONO='"SF Mono","JetBrains Mono",Menlo,Consolas,"DejaVu Sans Mono","Liberation Mono",monospace';
const HIST=new WeakMap();
P.gx5Logger=(cv,o)=>{
 if(cv.width!==1200||cv.height!==400){cv.width=1200;cv.height=400}
 const g=cv.getContext('2d'),k=cv.width/600;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,600,200);
 const T=o.tl||{th:0,br:0,st:0,lon:0,lat:0},rev=Math.max(0,Math.min(1,o.rev)),RED=.88;
 const X0=36,Y0=96,W=528,H=98,ink='#e9edf0',dim='#8d98a2',rule='rgba(255,255,255,.2)',THR='#7fcf8e',BRK='#e5675a',STR='#9fb7cc';
 g.fillStyle='rgba(8,10,13,.72)';g.fillRect(X0,Y0,W,H);g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.28)';g.strokeRect(X0+.5,Y0+.5,W-1,H-1);
 const ln=(x0,y0,x1,y1,c,w)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineWidth=w||1;g.strokeStyle=c||rule;g.stroke()};
 const tx=(t,x,y,sz,c,al,wt)=>{g.font=(wt?'bold ':'')+sz+'px '+MONO;g.fillStyle=c||dim;g.textAlign=al||'left';g.textBaseline='alphabetic';g.fillText(t,x,y)};
 const sg=(x)=>(x>=0?'+':'−')+Math.abs(x).toFixed(2);
 /* history, sampled at 20 Hz */
 let H_=HIST.get(cv);if(!H_){H_={t:0,a:[]};HIST.set(cv,H_)}const now=performance.now();if(now-H_.t>50){H_.t=now;H_.a.push([T.th,T.br,T.st]);if(H_.a.length>110)H_.a.shift()}
 /* A: friction circle */
 {const cx=X0+54,cy=Y0+47,R=34;tx('G',X0+8,Y0+13,9,dim);
  g.beginPath();g.arc(cx,cy,R,0,6.2832);g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.4)';g.stroke();g.beginPath();g.arc(cx,cy,R/2,0,6.2832);g.strokeStyle=rule;g.stroke();ln(cx-R,cy,cx+R,cy);ln(cx,cy-R,cx,cy+R);
  const tr=H_.g||(H_.g=[]);if(H_.gt!==H_.t){H_.gt=H_.t;tr.push([T.lat,T.lon]);if(tr.length>40)tr.shift()}
  const pt=q=>[cx+Math.max(-1,Math.min(1,q[0]/1.6))*R,cy-Math.max(-1,Math.min(1,q[1]/1.2))*R];
  if(tr.length>1){g.beginPath();tr.forEach((q,i)=>{const p=pt(q);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.lineWidth=1;g.strokeStyle='rgba(159,183,204,.6)';g.stroke()}
  const p=pt([T.lat,T.lon]);g.fillStyle=ink;g.fillRect(p[0]-2.5,p[1]-2.5,5,5);
  tx('LAT '+sg(T.lat),X0+8,Y0+H-14,8,dim);tx('LON '+sg(T.lon),X0+8,Y0+H-5,8,dim)}
 ln(X0+112,Y0+6,X0+112,Y0+H-6);
 /* B: speed, gear, rev scale */
 {const bx=X0+122,bw=190;tx('SPD '+o.unit.toUpperCase(),bx,Y0+13,9,dim);tx('GEAR',bx+bw-52,Y0+13,9,dim);
  tx(String(o.kmh).padStart(3,' '),bx+2,Y0+56,46,ink,'left',500);
  tx(String(o.gear),bx+bw-50,Y0+56,46,o.shift?'#ff5a4d':ink,'left',500);tx(o.auto?'AT':'MT',bx+bw-14,Y0+30,9,dim,'left');
  /* ruled rev scale: 0 - 8 (x1000 rpm), filled to the revs */
  const sy=Y0+70,sh=7;g.fillStyle='rgba(255,255,255,.1)';g.fillRect(bx,sy,bw,sh);g.fillStyle='rgba(255,74,61,.28)';g.fillRect(bx+bw*RED,sy,bw*(1-RED),sh);
  g.fillStyle=rev>=RED?'#ff5a4d':ink;g.fillRect(bx,sy,bw*rev,sh);
  for(let v=0;v<=16;v++){const x=bx+bw*v/16,big=v%2===0;ln(x,sy+sh+1,x,sy+sh+(big?5:3),big?dim:rule)}
  for(let v=0;v<=8;v+=2)tx(String(v),bx+bw*v/8,sy+sh+14,8,dim,'center');
  tx('RPM x1000',bx+bw,Y0+66,8,dim,'right')}
 ln(X0+322,Y0+6,X0+322,Y0+H-6);
 /* C: scrolling traces */
 {const gx0=X0+332,gx1=X0+W-10,gy0=Y0+16,gy1=Y0+H-18,gw=gx1-gx0,gh=gy1-gy0;tx('THR',gx0,Y0+11,8,THR);tx('BRK',gx0+30,Y0+11,8,BRK);tx('STR',gx0+60,Y0+11,8,STR);tx('5 s',gx1,Y0+11,8,dim,'right');
  for(let i=0;i<=4;i++)ln(gx0,gy0+gh*i/4,gx1,gy0+gh*i/4,i===0||i===4?'rgba(255,255,255,.3)':'rgba(255,255,255,.1)');for(let i=1;i<5;i++)ln(gx0+gw*i/5,gy0,gx0+gw*i/5,gy1,'rgba(255,255,255,.08)');
  const a=H_.a,n=110,tr=(idx,col,fn)=>{if(a.length<2)return;g.beginPath();a.forEach((q,i)=>{const x=gx1-(a.length-1-i)*gw/n,y=fn(q[idx]);i?g.lineTo(x,y):g.moveTo(x,y)});g.lineWidth=1.2;g.strokeStyle=col;g.lineJoin='round';g.stroke()};
  tr(2,STR,v=>gy0+gh/2-Math.max(-1,Math.min(1,v))*gh/2);tr(1,BRK,v=>gy1-Math.max(0,Math.min(1,v))*gh);tr(0,THR,v=>gy1-Math.max(0,Math.min(1,v))*gh);
  tx('THR '+Math.round(T.th*100)+'%  BRK '+Math.round(T.br*100)+'%',gx0,Y0+H-5,8,dim);tx('STR '+(T.st>=0?'+':'−')+Math.abs(Math.round(T.st*100))+'%',gx1,Y0+H-5,8,dim,'right')}
 if(o.tag){tx(o.tag,X0,Y0-6,11,o.tagCol||ink,'left',600)}};
/* Nov 13 (Hakan: similar to GT7 but in our UI style, moved around a bit): the GT7 cluster's parts (a speed dial, a rev dial and a readout between them) drawn in the game's own
   glossy grey and blue. The readout plate sits low and centred with the dials flanking it, not stacked under it. (PTO.gauge = 'plain' | 'logger' | 'cluster' | 'telemetry' for the earlier ones.) */
/* split screen: the quiet GT7 four-player style, a dark plate with speed and gear, a fuel-style dial and a rev bar */
P.gx5Split=function(cv,o){const LW=460,LH=120,k=2;if(cv.width!==LW*k)cv.width=LW*k;if(cv.height!==LH*k)cv.height=LH*k;const g=cv.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,LW,LH);
 const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif',PI=Math.PI,TL=o.tl||{},I=o.info||{};
 const tx=(t,x,y,sz,c,al,wt)=>{g.font=(wt||500)+' '+sz+'px '+F;g.fillStyle=c;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y)};
 /* plate */
 g.beginPath();g.moveTo(120,36);g.quadraticCurveTo(230,10,340,36);g.lineTo(322,104);g.lineTo(138,104);g.closePath();let gr=g.createLinearGradient(0,36,0,104);gr.addColorStop(0,'rgba(18,22,26,.86)');gr.addColorStop(1,'rgba(10,12,15,.72)');g.fillStyle=gr;g.fill();
 /* steering: a dot riding above the curved top edge, centred, moving left and right with the wheel */
 {const st=Math.max(-1,Math.min(1,TL.st||0)),dx=230+st*84,tt=(dx-120)/220,dy=36-52*tt*(1-tt)-9;g.fillStyle='rgba(255,255,255,.18)';for(let q=-1;q<=1;q+=.5){const xx=230+q*84,t2=(xx-120)/220;g.fillRect(xx-.5,36-52*t2*(1-t2)-12,1,6)}g.beginPath();g.arc(dx,dy,4.2,0,PI*2);g.fillStyle=Math.abs(st)>.85?'#ffd27a':'#fff';g.shadowColor='rgba(120,180,255,.9)';g.shadowBlur=6;g.fill();g.shadowBlur=0}
 tx(String(Math.round(o.kmh)),214,64,40,'#fff','right',500);tx(o.unit,214,92,11,'rgba(255,255,255,.7)','right',500);
 g.fillStyle='rgba(255,255,255,.35)';g.fillRect(230,50,1,44);
 tx(String(o.gear),262,66,40,'#fff','center',500);tx(o.auto?'AT':'MT',262,92,11,'rgba(255,255,255,.7)','center',500);
 /* shift arrows */
 g.fillStyle=o.shift?'#fff':'rgba(255,255,255,.3)';g.beginPath();g.moveTo(104,96);g.lineTo(116,90);g.lineTo(116,102);g.fill();g.beginPath();g.moveTo(356,96);g.lineTo(344,90);g.lineTo(344,102);g.fill();
 /* rev bar (right) */
 {const bx=376,by=40,bh=62,rv=Math.max(0,Math.min(1,o.rev));g.fillStyle='rgba(255,255,255,.18)';g.fillRect(bx,by,5,bh);g.fillStyle=rv>.9?'#ff5a4a':'#fff';g.fillRect(bx,by+bh*(1-rv),5,bh*rv);g.fillStyle='rgba(255,255,255,.5)';for(let q=0;q<=6;q++)g.fillRect(bx+8,by+bh*q/6-.5,4,1);tx('N',bx+2.5,by+bh+9,8,'rgba(255,255,255,.6)','center',600)}
 /* left dial: speed sweep with the trip under it; right dial: throttle */
 const dial=(cx,cy,v,col)=>{g.lineWidth=2;g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(cx,cy,22,PI*.75,PI*2.25);g.stroke();const a=PI*.75+PI*1.5*Math.max(0,Math.min(1,v));g.strokeStyle=col;g.lineWidth=2.4;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*19,cy+Math.sin(a)*19);g.stroke();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(cx,cy,2.4,0,PI*2);g.fill()};
 dial(70,66,o.kmh/Math.max(1,o.maxK),'#fff');tx((I.trip==null?0:I.trip).toFixed(1).padStart(8,'0'),70,100,9,'rgba(255,255,255,.75)','center',500);
 dial(420,66,TL.th||0,'#9fd6a8');tx('THR',420,100,8,'rgba(255,255,255,.6)','center',600);
};
P.gx5Draw=(cv,o)=>{if(o.split)return P.gx5Split(cv,o);const st=window.PTO&&window.PTO.gauge;if(st==='cluster')return P.gx5Cluster(cv,o);if(st==='telemetry')return P.gx5Tele(cv,o);if(st==='plain')return P.gx5Plain(cv,o);if(st==='logger')return P.gx5Logger(cv,o);
 P.gx5Plain(cv,{...o,tag:'',lw:760,lh:250,ox:80,oy:44});
 const g=cv.getContext('2d'),k=cv.width/760,PI=Math.PI,A0=PI*.75,SW=PI*1.5,rev=Math.max(0,Math.min(1,o.rev)),RED=.88,maxS=Math.max(80,o.maxK||240);g.setTransform(k,0,0,k,80*k,44*k);
 const pol=(cx,cy,r,a)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
 const dial=(cx,cy,R,u,col,red,labels,minor)=>{
  /* bezel and glass */
  let gr=g.createLinearGradient(0,cy-R,0,cy+R);gr.addColorStop(0,'#4a4f56');gr.addColorStop(.5,'#1c1f23');gr.addColorStop(1,'#34383d');g.beginPath();g.arc(cx,cy,R,0,PI*2);g.fillStyle=gr;g.fill();g.lineWidth=1.5;g.strokeStyle='#000';g.stroke();
  gr=g.createRadialGradient(cx,cy-R*.35,R*.1,cx,cy,R*.92);gr.addColorStop(0,'#2a2e34');gr.addColorStop(1,'#0b0d10');g.beginPath();g.arc(cx,cy,R-5,0,PI*2);g.fillStyle=gr;g.fill();
  g.beginPath();g.arc(cx,cy,R-.5,PI*1.1,PI*1.9);g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.25)';g.stroke();
  /* arcs */
  const ra=R-9;g.lineCap='butt';g.beginPath();g.arc(cx,cy,ra,A0,A0+SW);g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.12)';g.stroke();
  if(red){g.beginPath();g.arc(cx,cy,ra,A0+SW*RED,A0+SW);g.lineWidth=3;g.strokeStyle='rgba(216,38,27,.9)';g.stroke()}
  if(u>0){const lg=g.createLinearGradient(cx-R,0,cx+R,0);lg.addColorStop(0,'#8fb4d8');lg.addColorStop(1,'#4f7eab');g.beginPath();g.arc(cx,cy,ra,A0,A0+SW*Math.min(1,u));g.lineWidth=3;g.strokeStyle=red&&u>=RED?'#ff4a3d':lg;g.stroke()}
  /* ticks and numbers */
  g.font='500 8.5px '+F;g.textAlign='center';g.textBaseline='middle';
  for(let i=0;i<=labels.n;i++){const a=A0+SW*i/labels.n,big=i%labels.every===0,rd=red&&i/labels.n>=RED;const p=pol(cx,cy,ra-3,a),q=pol(cx,cy,ra-(big?10:6),a);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.lineWidth=big?1.4:.9;g.strokeStyle=rd?'#ff8a80':'rgba(255,255,255,'+(big?.85:.4)+')';g.stroke();
   if(big){const t=pol(cx,cy,ra-20,a);g.fillStyle=rd?'#ff8a80':'rgba(255,255,255,.82)';g.fillText(labels.f(i),t[0],t[1])}}
  /* needle */
  const a=A0+SW*Math.min(1.02,u),n0=pol(cx,cy,-6,a),n1=pol(cx,cy,ra-4,a);g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=3;g.beginPath();g.moveTo(n0[0],n0[1]);g.lineTo(n1[0],n1[1]);g.lineWidth=2;g.strokeStyle='#e9eef2';g.stroke();g.shadowBlur=0;
  gr=g.createRadialGradient(cx-1,cy-2,1,cx,cy,7);gr.addColorStop(0,'#6a7078');gr.addColorStop(1,'#15181b');g.beginPath();g.arc(cx,cy,6,0,PI*2);g.fillStyle=gr;g.fill();g.lineWidth=1;g.strokeStyle='#000';g.stroke()};
 const stepS=maxS>320?20:10,everyS=maxS>320?80/stepS:40/stepS;
 dial(92,134,60,Math.min(1,o.kmh/maxS),null,false,{n:Math.round(maxS/stepS),every:Math.round(everyS),f:i=>String(i*stepS)});
 dial(508,134,60,rev,null,true,{n:16,every:2,f:i=>String(i/2)});
 g.font='600 8px '+F;g.fillStyle='rgba(255,255,255,.6)';g.textAlign='center';g.fillText(o.unit.toUpperCase(),92,176);g.fillText('RPM x1000',508,176);
 /* the information centres (GT7 has them all round the dials): gaps to the cars ahead and behind, tyre / grip state, trip, lap and the assist and status chips */
 const I=o.info||{};
 const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
 const chip=(x,y,w,h,on,col)=>{rr(x,y,w,h,3);const lg=g.createLinearGradient(0,y,0,y+h);if(on){lg.addColorStop(0,'#8fb4d8');lg.addColorStop(.5,'#4f7eab');lg.addColorStop(1,'#33608c')}else{lg.addColorStop(0,'#3a3e44');lg.addColorStop(.5,'#24272c');lg.addColorStop(1,'#17191c')}g.fillStyle=col||lg;g.fill();g.lineWidth=1;g.strokeStyle='#000';g.stroke()};
 const T=(t,x,y,sz,c,al,wt)=>{g.font=(wt||500)+' '+sz+'px '+F;g.fillStyle=c;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y)};
 /* steering sensor: a dot sliding left and right along a short rule above the plate */
 {const st=Math.max(-1,Math.min(1,(o.tl&&o.tl.st)||0)),sx=300+st*58;g.fillStyle='rgba(255,255,255,.22)';g.fillRect(240,101,120,1.5);g.fillRect(299,96,2,11);g.beginPath();g.arc(sx,101.7,4.2,0,PI*2);g.fillStyle=Math.abs(st)>.85?'#ffd27a':'#cfe6ff';g.shadowColor='rgba(120,180,255,.9)';g.shadowBlur=6;g.fill();g.shadowBlur=0}
 if(o.tag)T(o.tag,300,84,11,o.tagCol||'#fff','center',700);
 /* inside the dials: trip and the pedals */
 T('TRIP',92,152,7,'rgba(255,255,255,.55)','center',600);T((I.trip==null?0:I.trip).toFixed(2)+' '+(o.unit==='mph'?'mi':'km'),92,162,9,'#fff','center',600);
 {const bx=508-20,by=152;g.fillStyle='rgba(255,255,255,.12)';g.fillRect(bx,by,17,5);g.fillRect(bx+23,by,17,5);g.fillStyle='#ef6a5a';g.fillRect(bx,by,17*(I.br||0),5);g.fillStyle='#9fd6a8';g.fillRect(bx+23,by,17*(I.th||0),5);T('BRK',bx+8.5,by+12,6.5,'rgba(255,255,255,.55)','center',600);T('THR',bx+31.5,by+12,6.5,'rgba(255,255,255,.55)','center',600)}};


/* GT7 manual layout, item by item: 1 position box, 2 lap tag, 3 rear mirror, 4 minimap (gtmap), 5 lap list, 6 lap timer, 7 best tag and delta, 8 leaderboard, 10 total time, 11 brake warning, 20/21 tyres, 25 car card */
{const st=document.createElement('style');st.textContent=`.gtB{position:absolute;z-index:4;pointer-events:none;font-family:var(--gt,Inter,"Segoe UI",Arial,sans-serif);color:#fff;text-shadow:0 1px 3px #000c;--k:max(var(--s,1),.78)}
.gtP{left:12px;top:12px;width:max-content;display:flex;align-items:center;height:40px;padding:0 14px 0 0;border-radius:3px;position:relative;overflow:hidden;background:linear-gradient(90deg,#1c2a38f2,#223646d0 45%,#0a0d12dd 45%,#10161dcc);border:1px solid #ffffff22;transform:scale(var(--k));transform-origin:0 0}
.gtP:before{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(#ffffff1a,#ffffff00)}
.gtP .n{display:flex;align-items:baseline;gap:3px;padding:0 14px 0 14px;position:relative}
.gtP .n b{font:italic 800 26px/40px var(--gt,Inter,sans-serif)}
.gtP .n i{font:italic 700 13px var(--gt,Inter,sans-serif);color:#cfd8de;font-style:normal}
.gtP .l{display:flex;align-items:baseline;gap:8px;padding-left:14px;position:relative}
.gtP .l small{font:italic 800 9px var(--gt,Inter,sans-serif);letter-spacing:.24em;color:#aab6bf}
.gtP .l small.fl{color:#fff;background:#c0392b;padding:1px 6px;border-radius:2px;letter-spacing:.16em}
.gtP .l b{font:italic 800 17px var(--gt,Inter,sans-serif);letter-spacing:.04em}
.gtTw{left:12px;top:calc(60px*var(--k));transform:scale(var(--k));transform-origin:0 0;width:230px}
.gtTw .r{display:flex;align-items:center;gap:8px;height:28px;margin-bottom:3px;padding:0 10px 0 0;border-radius:3px;position:relative;overflow:hidden;background:linear-gradient(90deg,#0a0d12ee,#10161dcc 70%,#10161d99);border:1px solid #ffffff22;font:italic 800 12px var(--gt,Inter,sans-serif);letter-spacing:.05em;text-transform:uppercase}
.gtTw .r:before{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(#ffffff1a,#ffffff00)}
.gtTw .r b{width:30px;text-align:center;font:italic 800 14px var(--gt,Inter,sans-serif);color:#cfd8de;position:relative}
.gtTw .r span{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;position:relative}
.gtTw .r em{font:italic 700 12px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums;color:#ffd27a;position:relative}
.gtTw .r.dn em{color:#9fd8ff}
.gtTw .r.me{background:linear-gradient(90deg,#1c2a38f2,#223646d0 70%,#223646aa);border-color:#9fd8ff88}
.gtTw .r.me b,.gtTw .r.me em{color:#fff}
.gtMir{left:50%;top:0;width:36%;aspect-ratio:5.2/1;transform:translateX(-50%);border:2px solid #10161d;border-top:0;border-radius:0 0 6px 6px;box-shadow:0 0 0 1px #ffffff2a inset,0 4px 10px #0008;z-index:3}
.gtTim{left:50%;top:calc(36vw*0 + 0px);transform:translateX(-50%) scale(var(--k));transform-origin:50% 0;display:flex;align-items:center;gap:8px;white-space:nowrap}
.gtTim .tg{padding:2px 8px;border-radius:2px;font:italic 800 10px var(--gt,Inter,sans-serif);letter-spacing:.16em;background:#7a3fa0;color:#fff}
.gtTim .tg.d{background:#2b8a4e}.gtTim .tg.u{background:#b8372d}
.gtTim .t{font:italic 800 26px/30px var(--gt,Inter,sans-serif);letter-spacing:.04em;font-variant-numeric:tabular-nums}
.gtTim .fl{position:absolute;left:50%;top:-14px;transform:translateX(-50%);font:italic 800 9px var(--gt,Inter,sans-serif);letter-spacing:.2em;background:#c0392b;padding:0 8px;border-radius:2px}
.gtLaps{right:12px;top:46%;width:150px;transform:scale(var(--k));transform-origin:100% 0}
.gtLaps div{display:flex;align-items:center;gap:8px;height:22px;margin-bottom:2px;padding:0 8px 0 0;border-radius:3px;background:linear-gradient(90deg,#10161d99,#0a0d12ee);border:1px solid #ffffff22;font:italic 700 12px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums}
.gtLaps div b{width:26px;text-align:center;color:#aab6bf;font-weight:800}
.gtLaps div span{flex:1;text-align:right}
.gtLaps div.bt{background:linear-gradient(90deg,#7a3fa0cc,#5a2d78ee);border-color:#c79be0aa}
.gtTot{left:12px;bottom:12px;font:italic 800 22px var(--gt,Inter,sans-serif);letter-spacing:.04em;font-variant-numeric:tabular-nums;transform:scale(var(--k));transform-origin:0 100%}
.gtTy{left:14px;bottom:44px;width:84px;text-align:center;transform:scale(var(--k));transform-origin:0 100%;font:italic 700 9px var(--gt,Inter,sans-serif);letter-spacing:.1em;color:#cfd8de}
.gtTy .cr{position:relative;width:34px;height:62px;margin:0 auto 4px}
.gtTy .cr i{position:absolute;width:9px;height:17px;border-radius:2px;background:var(--tc,#9fc3e6);border:1px solid #000}
.gtTy .cr u{position:absolute;left:7px;top:6px;width:20px;height:50px;border-radius:7px;background:#14171a;border:1px solid #ffffff55}
.gtCar{right:12px;top:62%;padding:8px 16px 9px 14px;border-radius:3px;background:linear-gradient(90deg,#0a0d12cc,#0a0d12ee);border-left:3px solid #9fd8ff;transform:scale(var(--k));transform-origin:100% 0;opacity:0;transition:opacity .4s;text-align:right}
.gtCar.on{opacity:1}.gtCar small{display:block;font:italic 700 9px var(--gt,Inter,sans-serif);letter-spacing:.22em;color:#aab6bf}.gtCar b{display:block;font:italic 800 15px var(--gt,Inter,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.gtBrk{left:50%;bottom:calc(258px*var(--k));transform:translateX(-50%);font:italic 800 16px var(--gt,Inter,sans-serif);letter-spacing:.2em;color:#ff3b30;opacity:0;transition:opacity .08s}
.gtBrk.on{opacity:1}
.gtPass{position:absolute;right:12px;top:31%;z-index:5;pointer-events:none;font-family:var(--gt,Inter,sans-serif);text-align:right;opacity:0;transition:opacity .25s;color:#fff;text-shadow:0 1px 3px #000c;transform:scale(max(var(--s,1),.78));transform-origin:100% 0}
.gtPass.on{opacity:1}
.gtPass div{padding:7px 14px 8px 18px;border-radius:3px;background:linear-gradient(90deg,#0a0d12cc,#0a0d12ee);border:1px solid #ffffff22;border-right:3px solid #9fd8ff}
.gtPass small{display:block;font:italic 800 9px var(--gt,Inter,sans-serif);letter-spacing:.26em;color:#9fd8ff}
.gtPass b{display:block;font:italic 800 15px var(--gt,Inter,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.gtBadge{left:14px;top:12px;transform:scale(var(--k));transform-origin:0 0;display:none}
.gtBadge b{display:block;width:40px;height:40px;text-align:center;font:500 22px/40px var(--gt,Inter,sans-serif);background:rgba(15,18,22,.9);border-radius:2px}
.gtBadge span{display:block;margin-top:8px;font:500 12px var(--gt,Inter,sans-serif);letter-spacing:.03em;white-space:nowrap}
.gtLapR{right:14px;top:12px;text-align:right;transform:scale(var(--k));transform-origin:100% 0;display:none;font:500 10px var(--gt,Inter,sans-serif);letter-spacing:.08em}
.gtLapR b{display:block;font:500 16px var(--gt,Inter,sans-serif);letter-spacing:.04em}
.gtSplit .gtBadge,.gtSplit .gtLapR{display:block}
.gtSplit .gtP,.gtSplit .gtTw,.gtSplit .gtLaps,.gtSplit .gtTot,.gtSplit .gtTy{display:none!important}
.gtSplit .gtTim .t{background:rgba(15,18,22,.88);padding:2px 14px;border-radius:3px;font:500 15px/22px var(--gt,Inter,sans-serif);font-style:normal;letter-spacing:.04em}
.gtSplit .h8spd .gx5{width:540px!important;height:141px!important;margin:0!important}
body .gtSplit .h8spd{transform:translateX(-50%) scale(max(var(--s),.85))!important}
.gtSplit .gtB{--k:max(var(--s,1),.92)}
.hud .h8top,body .hud .h8top{display:none!important}`;document.head.appendChild(st);
 const mk=(e,cls)=>{let d=e.querySelector('.'+cls.split(' ').join('.'));if(!d){d=document.createElement('div');d.className=cls;e.appendChild(d)}return d};
 const set=(d,h)=>{if(d._h!==h){d._h=h;d.innerHTML=h}};
 const hu0=hudUpdate;
 hudUpdate=function(){hu0.apply(this,arguments);try{
  const Rc=RACE;if(!Rc||!Rc.cars)return;const T=Rc.T,cut=Rc.mode==='cutup',n=Rc.cars.length,fmt=P.fmtT;
  const order=[...Rc.cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw);
  Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!c.rect)return;
   const ids0=['gtB gtBadge','gtB gtLapR'],[dB,dR]=ids0.map(k=>mk(e,k));const spl=Rc.cars.filter(h=>h.human).length>1;e.classList.toggle('gtSplit',spl);
   const ids=['gtB gtP','gtB gtTw','gtB gtMir','gtB gtTim','gtB gtLaps','gtB gtTot','gtB gtTy','gtB gtCar','gtB gtBrk'];
   const [dP,dTw,dMir,dTim,dLaps,dTot,dTy,dCar,dBrk]=ids.map(k=>mk(e,k));
   const sh=!cut;[dP,dTw,dMir,dTim,dLaps,dTot,dTy,dCar,dBrk].forEach(d=>d.style.display=sh?'':'none');if(!sh)return;
   /* 1 + 2: position box and lap tag */
   const me=order.indexOf(c),fp=c.fin?c.place:me+1,lapN=Math.min(Rc.laps,Math.max(1,Math.floor(c.unw/T.N)+1)),fin=Rc.laps>1&&lapN===Rc.laps&&!c.fin;
   set(dP,'<div class="n"><b>'+fp+'</b><i>/'+n+'</i></div><div class="l">'+(fin?'<small class="fl">FINAL LAP</small>':'<small>LAP</small>')+'<b>'+lapN+'/'+Rc.laps+'</b></div>');
   /* 8: leaderboard */
   {const a=Math.max(0,Math.min(me-2,n-6)),b=Math.min(n,a+6),sp=Math.max(6,c.sp||0);let h='';
    for(let k=a;k<b;k++){const q=order[k],d=(q.unw-c.unw)*T.sp/sp,nm=q.ptName||(q.human?'PLAYER '+(q.k+1):'CAR '+(k+1));
     h+='<div class="r'+(q===c?' me':d<0?' dn':'')+'"><b>'+(k+1)+'</b><span>'+String(nm).toUpperCase()+'</span>'+(q===c?'<em></em>':'<em>'+(d>0?'+':'−')+Math.abs(d).toFixed(1)+'</em>')+'</div>'}
    set(dTw,h)}
   /* 6 + 7: the lap timer with the best tag and the delta */
   const L=c.lapT||[],last=L.length?L[L.length-1]:null,best=L.length?Math.min(...L):null,done=L.reduce((x,y)=>x+y,0),cur=Math.max(0,Rc.t-done),frac=(((c.unw%T.N)+T.N)%T.N)/T.N,dl=best!=null?cur-best*frac:null;
   dTim.style.top='calc('+(0)+'px + 0px)';
   {const mw=e.clientWidth*.36;dTim.style.top=(mw/5.2+6)+'px'}
   if(spl){set(dB,'<b>'+(c.k+1)+'</b><span>'+(c.ptName||'Player '+(c.k+1))+'</span>');set(dR,'LAP<b>'+lapN+'/'+Rc.laps+'</b>');set(dTim,'<span class="t">'+fmt(cur).replace(/^0/,'')+'</span>')}else
   set(dTim,(fin?'<div class="fl">FINAL LAP</div>':'')+(best!=null?'<span class="tg">BEST</span>':'')+'<span class="t">'+fmt(cur).replace(/^0/,'')+'</span>'+(dl!=null?'<span class="tg '+(dl>0?'u':'d')+'">'+(dl>0?'+':'−')+Math.abs(dl).toFixed(3)+'</span>':''));
   /* 5: lap list, newest on top */
   {let h='';const from=Math.max(0,L.length-5);for(let k=L.length-1;k>=from;k--)h+='<div'+(L[k]===best?' class="bt"':'')+'><b>'+(k+1)+'</b><span>'+fmt(L[k]).replace(/^0/,'')+'</span></div>';set(dLaps,h)}
   /* 10: total race time, 20/21: tyres */
   set(dTot,fmt(Rc.t).replace(/^0/,''));
   {const I=c._tl||{},gr=c._gripPct==null?100:c._gripPct;const col=gr>=97?'#9fc3e6':gr>=80?'#f2c76b':'#ef6a5a';dTy.style.setProperty('--tc',col);
    set(dTy,'<div class="cr"><u></u><i style="left:-4px;top:0"></i><i style="right:-4px;top:0"></i><i style="left:-4px;bottom:0"></i><i style="right:-4px;bottom:0"></i></div>'+(Rc.T&&Rc.T.d&&Rc.T.d.gravel?'GRAVEL':'TARMAC'))}
   /* 25: the car card for the first seconds of the race */
   dCar.style.display='none';
   /* 11: brake warning */
   {const T2=c._tl||{};dBrk.textContent='BRAKE';dBrk.classList.toggle('on',(T2.br||0)>.55&&(c.sp||0)>12)}
   /* pass popup: ahead of a car for more than 0.7 s after being behind it */
   let pp=e.querySelector('.gtPass');if(!pp){pp=document.createElement('div');pp.className='gtPass';e.appendChild(pp)}
   {const A=c._ah||(c._ah={}),now=performance.now();Rc.cars.forEach((q,j)=>{if(q===c||q.out)return;const sd=c.unw>q.unw?1:-1,o=A[j]||(A[j]={sd:sd,t:now,seen:false,fired:false});
     if(o.sd!==sd){o.sd=sd;o.t=now;o.fired=false;o.seen=true}
     if(sd>0&&o.seen&&!o.fired&&Rc.state==='race'&&now-o.t>700){o.fired=true;const cn=(P.BYID&&P.BYID[q.carId]&&P.BYID[q.carId].name)||'';pp.innerHTML='<div><small>PASSED</small><b>'+cn+'</b></div>';pp.classList.add('on');clearTimeout(pp._to);pp._to=setTimeout(()=>pp.classList.remove('on'),2800)}})}
  })}catch(_){}};
 /* 3: the rear-view mirror: a second render from the car looking backwards into the frame at the top centre of each view */
 {const R0=R.render.bind(R),v4=new THREE.Vector4(),mc=new THREE.PerspectiveCamera(62,5.2,.3,700),d=new THREE.Vector3();
  R.render=function(scene,cam){R0(scene,cam);
   try{const Rc=RACE;if(typeof scr==='undefined'||scr!=='game'||!Rc||scene!==Rc.scene||!cam||R.getRenderTarget()!==null||(window.PTO&&window.PTO.mirror===false))return;
    const c=Rc.cars.find(h=>h.human&&h.cam===cam);if(!c||!c.rect||Rc.mode==='cutup')return;
    const g=c.m&&c.m.g;if(!g)return;d.set(g.position.x-cam.position.x,0,g.position.z-cam.position.z);if(d.lengthSq()<.01)return;d.normalize();
    mc.position.set(g.position.x,g.position.y+1.35,g.position.z);mc.lookAt(g.position.x-d.x*30,g.position.y+1.2,g.position.z-d.z*30);mc.updateMatrixWorld();
    const W=R.domElement.width,H=R.domElement.height,r=c.rect,vw=r[2]*W,w=Math.round(vw*.36),h=Math.round(w/5.2),x=Math.round(r[0]*W+vw/2-w/2),y=Math.round((r[1]+r[3])*H)-h;
    R.getViewport(v4);const sc=R.getScissorTest();R.setScissorTest(true);R.setViewport(x,y,w,h);R.setScissor(x,y,w,h);R0(scene,mc);R.setViewport(v4);R.setScissor(v4);R.setScissorTest(sc)}catch(_){}}}
}
})();
