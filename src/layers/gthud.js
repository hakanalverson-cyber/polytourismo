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
.hud .h8spd,body .hud .h8spd{left:50%!important;right:auto!important;bottom:8px!important;transform:translateX(-50%)!important;transform-origin:50% 100%!important}
.h8spd .gx5{width:var(--gw,600px)!important;height:calc(var(--gw,600px)*var(--gr,.23))!important;margin:0!important}`;document.head.appendChild(st);
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
/* the GT7 numerals: wide, squared, thin-stroked digits drawn as rounded polylines. The canvas and the DOM (inline SVG) share the same paths. */
const GD=(()=>{const W=1.4,R=.2,GAP=.3,pc={};
 const f=v=>+v.toFixed(3),u=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[dx/l,dy/l,l]};
 const cn=(a,b,c)=>{const ab=u(a,b),bc=u(b,c),r=Math.min(R,ab[2]/2,bc[2]/2);return[f(b[0]-ab[0]*r),f(b[1]-ab[1]*r),f(b[0]+bc[0]*r),f(b[1]+bc[1]*r)]};
 const rp=(pts,closed)=>{const n=pts.length;let d='';
  if(closed){for(let i=0;i<n;i++){const b=pts[i],k=cn(pts[(i+n-1)%n],b,pts[(i+1)%n]);d+=(i?'L':'M')+k[0]+' '+k[1]+'Q'+b[0]+' '+b[1]+' '+k[2]+' '+k[3]}return d+'Z'}
  d='M'+pts[0][0]+' '+pts[0][1];for(let i=1;i<n-1;i++){const b=pts[i],k=cn(pts[i-1],b,pts[i+1]);d+='L'+k[0]+' '+k[1]+'Q'+b[0]+' '+b[1]+' '+k[2]+' '+k[3]}return d+'L'+pts[n-1][0]+' '+pts[n-1][1]};
 const G={'0':[W,[[[0,0],[W,0],[W,1],[0,1]],1]],'1':[.46,[[[.06,.2],[.3,.02],[.3,1]]]],
  '2':[W,[[[0,0],[W,0],[W,.5],[0,.5],[0,1],[W,1]]]],'3':[W,[[[0,0],[W,0],[W,1],[0,1]]],[[[W*.3,.5],[W,.5]]]],
  '4':[W,[[[W*.55,0],[0,.68],[W,.68]]],[[[W*.74,.3],[W*.74,1]]]],'5':[W,[[[W,0],[0,0],[0,.5],[W,.5],[W,1],[0,1]]]],
  '6':[W,[[[W,0],[0,0],[0,1],[W,1],[W,.5],[0,.5]]]],'7':[W,[[[0,0],[W,0],[W*.42,1]]]],
  '8':[W,[[[0,0],[W,0],[W,1],[0,1]],1],[[[0,.5],[W,.5]]]],'9':[W,[[[W,.5],[0,.5],[0,0],[W,0],[W,1],[0,1]]]],
  ':':[.22,[[[.11,.2],[.11,.34]]],[[[.11,.66],[.11,.8]]]],'.':[.22,[[[.11,.86],[.11,1]]]],'/':[.62,[[[.56,0],[.06,1]]]],
  '-':[.7,[[[.05,.5],[.65,.5]]]],'+':[.7,[[[.05,.5],[.65,.5]]],[[[.35,.2],[.35,.8]]]],' ':[.4]};
 G['−']=G['-'];
 const D={};for(const c in G)D[c]=G[c].slice(1).map(q=>rp(q[0],q[1])).join('');
 const wid=str=>{let w=0;for(const c of str)w+=(G[c]?G[c][0]:.4)+GAP;return Math.max(0,w-GAP)};
 return{w:(str,h)=>wid(String(str))*h,
  draw(g,str,x,y,h,al,col,lw){str=String(str);const tw=wid(str)*h;let cx=al==='right'?x-tw:al==='center'?x-tw/2:x;g.save();g.strokeStyle=col||'#fff';g.lineJoin='round';g.lineCap='butt';
   for(const c of str){const q=G[c];if(q&&D[c]){g.save();g.translate(cx,y-h/2);g.scale(h,h);g.lineWidth=lw||.1;g.stroke(pc[c]||(pc[c]=new Path2D(D[c])));g.restore()}cx+=((q?q[0]:.4)+GAP)*h}g.restore();return tw},
  svg(str,h,col,lw){str=String(str);let x=0,d='';for(const c of str){const q=G[c];if(q&&D[c])d+='<path transform="translate('+f(x)+' 0)" d="'+D[c]+'"/>';x+=(q?q[0]:.4)+GAP}const wu=Math.max(.1,x-GAP);
   return'<svg width="'+f(wu*h)+'" height="'+h+'" viewBox="0 0 '+f(wu)+' 1" style="overflow:visible;vertical-align:middle;display:inline-block" fill="none" stroke="'+(col||'#fff')+'" stroke-width="'+(lw||.1)+'" stroke-linejoin="round">'+d+'</svg>'}}})();
P.gtDig=GD;
/* the circuit outline for the two-player cluster: ~120 points of the track, normalised once per track */
P.gtCirc=T=>{if(T._gc)return T._gc;const N=T.N,st=Math.max(1,Math.floor(N/120)),pts=[];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i+=st){const x=T.x[i],z=-T.z[i];pts.push([x,z,i]);x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}const sc=1/Math.max(x1-x0,z1-z0,1);return T._gc={pts:pts.map(p=>[(p[0]-(x0+x1)/2)*sc,(p[1]-(z0+z1)/2)*sc,p[2]]),N}};
/* the GT7 cluster, laid out from the reference screenshots.
   One player: fuel dial + odometer, assist icons, bracket, the arched plate (dense rev band, speed | gear), bracket with the throttle bar, icons, boost dial.
   Two players: the same on a longer arch, with a second row under it: tyres, icons, the circuit map with its cross, icons.
   Three or four players: fuel dial, bracket, plate, bar, boost dial. */
P.gx5Split=function(cv,o){const lay=o.lay||1,two=lay===2,LW=two?760:lay===1?560:420,LH=two?186:96,k=2;if(cv.width!==LW*k)cv.width=LW*k;if(cv.height!==LH*k)cv.height=LH*k;const g=cv.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,LW,LH);
 const F='"Inter","Segoe UI","Helvetica Neue",Arial,sans-serif',PI=Math.PI,TL=o.tl||{},I=o.info||{},O=window.PTO||{},cm=LW/2;
 const tx=(t,x,y,sz,c,al,wt)=>{g.font=(wt||500)+' '+sz+'px '+F;g.fillStyle=c;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y)};
 const W_='rgba(255,255,255,.9)',D_='rgba(255,255,255,.3)',rv=Math.max(0,Math.min(1,o.rev));
 const fuel=(cx,cy,R)=>{const fu=I.fuel==null?1:I.fuel;g.lineCap='butt';g.lineWidth=R*.13;g.strokeStyle=W_;g.beginPath();g.arc(cx,cy,R,PI*1.04,PI*1.96);g.stroke();
  g.lineWidth=1;for(const t of[0,.5,1]){const a=PI*1.04+PI*.92*t;g.beginPath();g.moveTo(cx+Math.cos(a)*(R-1),cy+Math.sin(a)*(R-1));g.lineTo(cx+Math.cos(a)*(R-R*.3),cy+Math.sin(a)*(R-R*.3));g.stroke()}
  const a=PI*1.04+PI*.92*fu;g.strokeStyle='#fff';g.lineWidth=R*.09;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.5,cy+Math.sin(a)*R*.5);g.lineTo(cx+Math.cos(a)*(R-2),cy+Math.sin(a)*(R-2));g.stroke();
  /* pump icon in a dark disc */g.fillStyle='rgba(60,62,66,.9)';g.beginPath();g.arc(cx,cy-R*.1,R*.4,0,PI*2);g.fill();g.fillStyle='#fff';const u=R*.4;g.fillRect(cx-u*.42,cy-R*.1-u*.5,u*.56,u*.95);g.fillStyle='rgba(60,62,66,1)';g.fillRect(cx-u*.3,cy-R*.1-u*.38,u*.32,u*.3);g.strokeStyle='#fff';g.lineWidth=u*.14;g.beginPath();g.moveTo(cx+u*.14,cy-R*.1-u*.1);g.lineTo(cx+u*.44,cy-R*.1-u*.1);g.lineTo(cx+u*.44,cy-R*.1+u*.4);g.stroke();
  tx('E',cx-R-7,cy+1,R*.32,W_,'center',500);tx('F',cx+R+7,cy+1,R*.32,W_,'center',500);
  tx((I.trip==null?0:I.trip).toFixed(1).padStart(8,'0'),cx,cy+R*.62+8,Math.max(7.5,R*.42),W_,'center',500)};
 const bracket=(xv,d,y0,y1,v,col)=>{/* xv: the upright; d: +1 opens to the right ("["), -1 to the left ("]") */g.strokeStyle=W_;g.lineWidth=1.1;g.beginPath();g.moveTo(xv+d*9,y0);g.lineTo(xv,y0);g.lineTo(xv,y1);g.lineTo(xv+d*9,y1);g.moveTo(xv,(y0+y1)/2);g.lineTo(xv+d*5,(y0+y1)/2);g.stroke();if(v!=null&&v>0.01){const h=(y1-y0-6)*Math.max(0,Math.min(1,v));g.fillStyle=col;g.fillRect(d>0?xv+3:xv-9,y1-3-h,6,h)}};
 const arrows=(xl,xr,y,s)=>{g.fillStyle=o.shift?'rgba(255,255,255,.95)':'rgba(170,170,170,.72)';const ar=(x,d)=>{g.beginPath();g.moveTo(x+d*s*.2,y-s*.5);g.lineTo(x-d*s*.55,y);g.lineTo(x+d*s*.2,y+s*.5);g.lineTo(x+d*s*.2,y+s*.2);g.lineTo(x+d*s*.75,y+s*.2);g.lineTo(x+d*s*.75,y-s*.2);g.lineTo(x+d*s*.2,y-s*.2);g.closePath();g.fill()};ar(xl,1);ar(xr,-1)};
 const icon=(x,y,r,lab,on)=>{g.beginPath();g.arc(x,y,r,0,PI*2);g.fillStyle=on?'rgba(235,238,240,.95)':'rgba(255,255,255,.14)';g.fill();g.lineWidth=.8;g.strokeStyle=on?'#fff':'rgba(255,255,255,.22)';g.stroke();if(lab)tx(lab,x,y+.4,r*.62,on?'#16181b':'rgba(255,255,255,.4)','center',700)};
 const icons=(x,y,r,list)=>list.forEach((q,i)=>icon(x+(i%2)*(r*2+4),y+Math.floor(i/2)*(r*2+4),r,q[0],q[1]));
 const tcol=(()=>{const gc=I.grip==null?100:I.grip;return gc>=97?'#f2f4f5':gc>=80?'#f2c76b':'#ef6a5a'})();
 /* the GT5 tachometer: a flat ruler in a dark box, numbered 0 to 9, ticks that light as the revs climb, a red zone at the end and a bar under it; the steering dot slides along above the box */
 const plate=(p0,p1,ya,yc,yb,inset,N,th)=>{const x0=p0,x1=p1,y0=yc+4,r=5;
  g.beginPath();g.moveTo(x0+r,y0);g.arcTo(x1,y0,x1,yb,r);g.arcTo(x1,yb,x0,yb,r);g.arcTo(x0,yb,x0,y0,r);g.arcTo(x0,y0,x1,y0,r);g.closePath();
  const gr=g.createLinearGradient(0,y0,0,yb);gr.addColorStop(0,'rgba(34,36,39,.84)');gr.addColorStop(.5,'rgba(18,19,21,.8)');gr.addColorStop(1,'rgba(10,11,13,.76)');g.fillStyle=gr;g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.16)';g.stroke();
  const sx0=x0+14,sx1=x1-14,sw=sx1-sx0,ny=y0+th*.95,t0=y0+th*1.55,t1=t0+th*1.15,RZ=.86,M=45;
  for(let i=0;i<=9;i++)tx(String(i),sx0+sw*i/9,ny,th*.78,i/9>=RZ?'#ff6a5a':'#fff','center',600);
  for(let j=0;j<=M;j++){const t=j/M,x=sx0+sw*t,big=j%5===0,on=t<=rv+.001,red=t>=RZ;g.strokeStyle=on?(red?'#ff3b30':'#fff'):(red?'rgba(255,70,58,.5)':'rgba(255,255,255,.32)');g.lineWidth=big?1.5:1;g.beginPath();g.moveTo(x,big?t0-th*.2:t0+th*.2);g.lineTo(x,t1);g.stroke()}
  const by=t1+th*.25,bh=Math.max(2,th*.3);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(sx0,by,sw,bh);g.fillStyle='rgba(255,60,48,.4)';g.fillRect(sx0+sw*RZ,by,sw*(1-RZ),bh);g.fillStyle=rv>=RZ?'#ff3b30':'#fff';g.fillRect(sx0,by,sw*rv,bh);
  /* steering dot above the box */
  const st=Math.max(-1,Math.min(1,TL.st||0));g.fillStyle='rgba(255,255,255,.25)';g.fillRect(cm-.5,y0-th*1.05,1,th*.55);g.beginPath();g.arc(cm+st*sw*.32,y0-th*.78,Math.max(1.8,th*.26),0,PI*2);g.fillStyle=Math.abs(st)>.85?'#ffd27a':'#ff4a3d';g.fill()};
 const readout=(yd,hs,hg,yu,us)=>{const sw=GD.draw(g,Math.round(o.kmh),cm-hs*.9,yd,hs,'right','#fff',.1);tx(o.unit,cm-hs*.9,yu,us,W_,'right',500);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(cm-.5,yd-hg*.72,1,hg*1.7);
  const gw=GD.draw(g,o.gear,cm+hg*.55,yd+(hs-hg)*-.05,hg,'left','#fff',.1);const bx=cm+hg*.55+gw+hg*.3,bs=hg*.86;
  if(o.shift){g.fillStyle='#e0261b';g.beginPath();const r=bs*.14,by=yd-bs/2;g.moveTo(bx+r,by);g.arcTo(bx+bs*1.25,by,bx+bs*1.25,by+bs,r);g.arcTo(bx+bs*1.25,by+bs,bx,by+bs,r);g.arcTo(bx,by+bs,bx,by,r);g.arcTo(bx,by,bx+bs*1.25,by,r);g.closePath();g.fill();GD.draw(g,o.gear+1,bx+bs*.625,yd,bs*.56,'center','#fff',.12)}
  tx(o.auto?'AT':'MT',bx+bs*.625,yu,us,W_,'center',500)};
 const boost=(cx,cy,R)=>{g.lineWidth=1.4;g.strokeStyle=W_;g.beginPath();g.arc(cx,cy,R,PI*.75,PI*2.25);g.stroke();for(let i=0;i<=12;i++){const a=PI*.75+PI*1.5*i/12,r0=R-(i%4===0?5:3);g.lineWidth=.8;g.beginPath();g.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);g.lineTo(cx+Math.cos(a)*(R-1),cy+Math.sin(a)*(R-1));g.stroke()}
  const a=PI*.75+PI*1.5*(TL.th||0);g.strokeStyle='#fff';g.lineWidth=1.6;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*(R-6),cy+Math.sin(a)*(R-6));g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,1.8,0,PI*2);g.fill();tx('x100',cx,cy+R*.52,R*.27,W_,'center',500);tx('kPa',cx,cy+R*.86,R*.27,W_,'center',500)};
 const LI=[['ABS',O.abs!==false],['TC',O.tc!==false],['',false],['',false]],RI=[[o.auto?'AT':'MT',true],['',false],['DMG',!!I.dmgOn],['',false]];
 if(!two){const one=lay===1,fx=one?44:40,blx=one?150:88,p0=one?166:96,p1=one?394:324,brx=one?410:332,bdx=one?514:388;
  fuel(fx,42,20);if(one)icons(96,36,8,LI);bracket(blx,-1,26,70,null);
  plate(p0,p1,28,8,80,14,112,9);readout(59,13,19,73,7);arrows(p0+6,p1-6,89,9);
  bracket(brx,1,26,70,TL.th||0,'#fff');if(one)icons(440,36,8,RI);boost(bdx,42,20)}
 else{fuel(64,44,30);tx('',0,0,1,'#fff');bracket(160,-1,26,94,null);
  plate(210,590,34,12,96,16,170,11);readout(72,17,25,89,9);arrows(218,582,106,11);
  bracket(640,1,26,94,TL.th||0,'#fff');
  /* second row: tyres, icons, the circuit with its cross, icons */
  {const cx=64,cy=146;tx(I.ty||'SM',cx,117,9,W_,'center',600);tx(I.ty||'SM',cx,178,9,W_,'center',600);g.fillStyle=tcol;for(const[dx,dy]of[[-30,-22],[22,-22],[-30,6],[22,6]])g.fillRect(cx+dx,cy+dy,8,20);
   g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.2;g.beginPath();const x=cx-12,y=cy-24,w=24,h=52,r=9;g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.stroke();g.fillStyle='rgba(255,255,255,.18)';g.fillRect(cx-7,cy-10,14,22)}
  icons(170,136,9,LI);icons(574,136,9,RI);
  const C=o.circ;{const cx=cm,cy=146;g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.8;g.beginPath();g.moveTo(cx,112);g.lineTo(cx,LH-2);g.moveTo(cx-150,cy);g.lineTo(cx+150,cy);g.stroke();
   if(C){/* the car sits on the cross; the circuit slides under it */let best=0,bd=1e9;const ci=o.ci||0;C.pts.forEach((p,i)=>{let d=Math.abs(p[2]-ci);d=Math.min(d,C.N-d);if(d<bd){bd=d;best=i}});const bp=C.pts[best],S=70;
    g.save();g.beginPath();g.rect(cx-150,110,300,LH-112);g.clip();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.8;g.lineJoin='round';g.beginPath();C.pts.forEach((p,i)=>{const x=cx+(p[0]-bp[0])*S,y=cy+(p[1]-bp[1])*S*.62;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.stroke();g.restore();
    g.fillStyle='#ff4a3d';g.beginPath();g.arc(cx,cy,3,0,PI*2);g.fill()}}}
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


/* HUD layouts from Hakan's reference screenshots: 1 player (position block, leaderboard with the fastest lap, mirror, lap timer, total time, tyres, compact cluster),
   2 players (position block and timer top centre, long strip cluster with the circuit map, tyres), 3 or 4 players (number box, name, lap, timer pill, compact cluster) */
{const st=document.createElement('style');st.textContent=`.gtB{position:absolute;z-index:4;pointer-events:none;font-family:var(--gt,Inter,"Segoe UI",Arial,sans-serif);color:#fff;text-shadow:0 1px 3px #000c;--k:max(var(--s,1),.8)}
.gtP{left:16px;top:14px;display:flex;align-items:stretch;gap:12px;transform:scale(var(--k));transform-origin:0 0}
.gtP .pb{min-width:40px;height:40px;padding:0 9px;display:flex;align-items:center;justify-content:center;background:rgba(20,22,25,.86);border-radius:2px}
.gtP .pc{display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;padding:1px 0}
.gtP .pc small{font:500 9.5px/12px var(--gt,Inter,sans-serif);letter-spacing:.12em;color:#f2f4f5}
.gtP .pc span{display:block;line-height:0;padding-bottom:2px}
.gtP .lp{margin-left:22px}
.gtP .pc small.fl{background:#8f1a15;padding:1px 8px;border-radius:2px;letter-spacing:.06em}
.gtTw{left:16px;top:calc(76px*var(--k));transform:scale(var(--k));transform-origin:0 0;width:230px;font:500 11.5px var(--gt,Inter,sans-serif)}
.gtTw .r{display:flex;align-items:stretch;gap:3px;height:23px;margin-bottom:3px;position:relative;width:176px}
.gtTw .r b{width:26px;text-align:center;font:600 11.5px/23px var(--gt,Inter,sans-serif);background:rgba(20,22,25,.82);color:#f2f4f5}
.gtTw .r span{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;line-height:23px;padding:0 8px;background:rgba(20,22,25,.74)}
.gtTw .r em{position:absolute;left:100%;top:0;margin-left:3px;height:23px;line-height:23px;padding:0 9px;font-style:normal;font-variant-numeric:tabular-nums;background:#c81e1a;color:#fff;white-space:nowrap}
.gtTw .r.me b,.gtTw .r.me span{background:rgba(236,238,240,.94);color:#14171a;text-shadow:none;font-weight:600}
.gtTw .gp{width:176px;text-align:right;font:500 10.5px/15px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums;padding:0 8px 3px 0;box-sizing:border-box}
.gtTw .r.fl{margin-top:12px;margin-bottom:0}.gtTw .r.fl b{background:rgba(8,9,10,.92);font-size:10.5px}
.gtTw .flt{width:176px;box-sizing:border-box;text-align:right;padding:0 8px;font:500 11px/17px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums;background:linear-gradient(90deg,#7a3fa000,#8d4bb8 55%)}
.gtMir{left:50%;top:0;width:34%;aspect-ratio:5.2/1;transform:translateX(-50%);border:2px solid #10161d;border-top:0;border-radius:0 0 6px 6px;box-shadow:0 0 0 1px #ffffff2a inset,0 4px 10px #0008;z-index:3}
.gtTim{left:50%;top:0;transform:translateX(-50%) scale(var(--k));transform-origin:50% 0;display:flex;flex-direction:column;align-items:center;gap:6px;white-space:nowrap}
.gtTim .rw{display:flex;align-items:center;gap:8px}
.gtTim .t{display:block;line-height:0;background:rgba(40,42,45,.72);padding:6px 14px;border-radius:2px}
.gtTim .tg{padding:1px 7px;border-radius:2px;font:500 10px/16px var(--gt,Inter,sans-serif);letter-spacing:.1em;background:#7a3fa0}.gtTim .tg.d{background:#2b8a4e}.gtTim .tg.u{background:#b8372d}
.gtTim .fl{padding:1px 9px;border-radius:2px;font:500 10px/15px var(--gt,Inter,sans-serif);background:#8f1a15;letter-spacing:.06em}
.gtLaps{right:16px;top:46%;width:150px;transform:scale(var(--k));transform-origin:100% 0}
.gtLaps div{display:flex;align-items:stretch;gap:3px;height:21px;margin-bottom:3px;font:500 11.5px/21px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums}
.gtLaps div b{width:24px;text-align:center;background:rgba(20,22,25,.82);font-weight:600}
.gtLaps div span{flex:1;text-align:right;padding:0 8px;background:rgba(20,22,25,.74)}.gtLaps div.bt span{background:#8d4bb8}
.gtTot{left:16px;bottom:14px;line-height:0;transform:scale(var(--k));transform-origin:0 100%}
.gtTy{left:calc(50% - var(--gw,600px)/2 - 64px);bottom:calc(var(--gw,600px)*.03);width:56px;text-align:center;transform:scale(var(--k));transform-origin:50% 100%;font:600 8.5px var(--gt,Inter,sans-serif);letter-spacing:.06em;color:#f2f4f5}
.gtTy .lb{line-height:11px}
.gtTy .cr{position:relative;width:26px;height:50px;margin:1px auto}
.gtTy .cr i{position:absolute;width:7px;height:18px;background:var(--tc,#f2f4f5)}
.gtTy .cr i:nth-of-type(1),.gtTy .cr i:nth-of-type(3){left:-12px!important}.gtTy .cr i:nth-of-type(2),.gtTy .cr i:nth-of-type(4){right:-12px!important}
.gtTy .cr u{position:absolute;left:2px;top:0;width:22px;height:50px;box-sizing:border-box;border-radius:9px;border:1.2px solid #ffffffc0;background:radial-gradient(#ffffff30 0 40%,#0000 42%)}
.gtBrk{left:50%;bottom:calc(var(--gw,600px)*.3);transform:translateX(-50%);font:italic 800 16px var(--gt,Inter,sans-serif);letter-spacing:.2em;color:#ff3b30;opacity:0;transition:opacity .08s}
.gtBrk.on{opacity:1}
.gtBadge{left:16px;top:14px;transform:scale(var(--k));transform-origin:0 0;display:none}
.gtBadge b{display:flex;align-items:center;justify-content:center;width:38px;height:38px;background:rgba(20,22,25,.88);border-radius:2px}
.gtBadge span{display:block;margin-top:9px;font:500 12px var(--gt,Inter,sans-serif);letter-spacing:.02em;white-space:nowrap}
.gtLapR{right:16px;top:14px;text-align:left;transform:scale(var(--k));transform-origin:100% 0;display:none}
.gtLapR small{display:block;font:500 9.5px/12px var(--gt,Inter,sans-serif);letter-spacing:.1em;margin-bottom:5px}
.gtLapR b{display:block;line-height:0}
.gtL3 .gtBadge,.gtL3 .gtLapR{display:block}
.gtL3 .gtTim{top:calc(18px*var(--k))}
.gtL2 .gtP{left:50%;top:14px;transform:translateX(-50%) scale(var(--k));transform-origin:50% 0}
.gtL2 .gtP .pb{background:none;border:1.5px solid #ffffff59;box-sizing:border-box}
.gtL2 .gtP .lp{margin-left:6px}
.gtL2 .gtTim{top:calc(76px*var(--k))}
.gtL2 .gtTim .t{background:none;padding:2px 0}
.gtL2 .gtTw,.gtL2 .gtLaps,.gtL2 .gtTot,.gtL2 .gtTy,.gtL2 .gtMir,.gtL3 .gtP,.gtL3 .gtTw,.gtL3 .gtLaps,.gtL3 .gtTot,.gtL3 .gtTy,.gtL3 .gtMir{display:none!important}
.gtPass{position:absolute;right:14px;top:31%;z-index:5;pointer-events:none;font-family:var(--gt,Inter,sans-serif);text-align:right;opacity:0;transition:opacity .25s;color:#fff;text-shadow:0 1px 3px #000c;transform:scale(max(var(--s,1),.8));transform-origin:100% 0}
.gtPass.on{opacity:1}
.gtPass div{padding:7px 14px 8px 18px;border-radius:3px;background:linear-gradient(90deg,#0a0d12cc,#0a0d12ee);border:1px solid #ffffff22;border-right:3px solid #9fd8ff}
.gtPass small{display:block;font:italic 800 9px var(--gt,Inter,sans-serif);letter-spacing:.26em;color:#9fd8ff}
.gtPass b{display:block;font:italic 800 15px var(--gt,Inter,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.hud .h8top,body .hud .h8top{display:none!important}`;document.head.appendChild(st);
 const mk=(e,cls)=>{let d=e.querySelector('.'+cls.split(' ').join('.'));if(!d){d=document.createElement('div');d.className=cls;e.appendChild(d)}return d};
 const set=(d,h)=>{if(d._h!==h){d._h=h;d.innerHTML=h}};
 const hu0=hudUpdate;
 hudUpdate=function(){hu0.apply(this,arguments);try{
  const Rc=RACE;if(!Rc||!Rc.cars)return;const T=Rc.T,cut=Rc.mode==='cutup',n=Rc.cars.length,fmt=P.fmtT,nh=Rc.cars.filter(h=>h.human).length,lay=nh<2?1:nh===2?2:3;
  const order=[...Rc.cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw);
  Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!c.rect)return;
   e.classList.toggle('gtL1',lay===1);e.classList.toggle('gtL2',lay===2);e.classList.toggle('gtL3',lay===3);
   const Wv=e.clientWidth||600,gw=lay===1?Math.min(.58*Wv,760):lay===2?Math.min(.92*Wv,760):Math.min(.68*Wv,520);e.style.setProperty('--gw',gw+'px');e.style.setProperty('--gr',(lay===2?186/760:lay===1?96/560:96/420));
   const ids0=['gtB gtBadge','gtB gtLapR'],[dB,dR]=ids0.map(k=>mk(e,k));
   const ids=['gtB gtP','gtB gtTw','gtB gtMir','gtB gtTim','gtB gtLaps','gtB gtTot','gtB gtTy','gtB gtBrk'];
   const [dP,dTw,dMir,dTim,dLaps,dTot,dTy,dBrk]=ids.map(k=>mk(e,k));
   const sh=!cut;[dP,dTw,dMir,dTim,dLaps,dTot,dTy,dBrk].forEach(d=>d.style.display=sh?'':'none');if(!sh)return;
   const me=order.indexOf(c),fp=c.fin?c.place:me+1,lapN=Math.min(Rc.laps,Math.max(1,Math.floor(c.unw/T.N)+1)),fin=Rc.laps>=1&&lapN===Rc.laps&&!c.fin;
   const L=c.lapT||[],last=L.length?L[L.length-1]:null,best=L.length?Math.min(...L):null,done=L.reduce((x,y)=>x+y,0),cur=Math.max(0,Rc.t-done),frac=(((c.unw%T.N)+T.N)%T.N)/T.N,dl=best!=null?cur-best*frac:null;
   const SV=GD.svg,tf=t=>{if(t==null||!isFinite(t))return'-:--.---';const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(3)},nmOf=(q,k)=>q.ptName||(q.human?'Player '+(q.k+1):'Car '+(k+1)),sp=Math.max(6,c.sp||0),gapTo=q=>(q.unw-c.unw)*T.sp/sp;
   /* position block: the box, POSITION over /N, the lap tag over n/N */
   set(dP,lay===1?'<div class="pb">'+SV(fp,22,'#fff',.11)+'</div><div class="pc"><small>POSITION</small><span>'+SV('/'+n,15,'#fff',.1)+'</span></div><div class="pc lp">'+(fin?'<small class="fl">FINAL LAP</small>':'<small>LAP</small>')+'<span>'+SV(lapN+'/'+Rc.laps,15,'#fff',.1)+'</span></div>'
    :'<div class="pb">'+SV(fp,20,'#fff',.11)+'</div><div class="pc lp">'+(fin?'<small class="fl">FINAL LAP</small>':'<small>LAP</small>')+'<span>'+SV(lapN+'/'+Rc.laps,15,'#fff',.1)+'</span></div>');
   if(lay===3){set(dB,'<b>'+SV(c.k+1,17,'#fff',.11)+'</b><span>'+nmOf(c,0)+'</span>');set(dR,'<small>LAP</small><b>'+SV(lapN+'/'+Rc.laps,13,'#fff',.1)+'</b>')}
   /* leaderboard: number cell + name cell, your row light with the red tag outside it, the intervals to the cars ahead and behind between the rows, then the fastest lap */
   if(lay===1){const a=Math.max(0,Math.min(me-3,n-8)),b=Math.min(n,a+8);let h='';
    for(let k=a;k<b;k++){const q=order[k],mine=q===c;
     if(mine&&k>0)h+='<div class="gp">+ '+Math.abs(gapTo(order[k-1])).toFixed(3)+'</div>';
     h+='<div class="r'+(mine?' me':'')+'"><b>'+(k+1)+'</b><span>'+nmOf(q,k)+'</span>'+(mine?'<em>'+(k>0?'+'+Math.abs(gapTo(order[0])).toFixed(3):'--.--')+'</em>':'')+'</div>';
     if(mine&&k<n-1)h+='<div class="gp">- '+Math.abs(gapTo(order[k+1])).toFixed(3)+'</div>'}
    let fb=null,fq=null;Rc.cars.forEach(q=>{if(q.lapT&&q.lapT.length){const m=Math.min(...q.lapT);if(fb==null||m<fb){fb=m;fq=q}}});
    if(fb!=null)h+='<div class="r fl"><b>FL</b><span>'+nmOf(fq,0)+'</span></div><div class="flt">'+tf(fb)+'</div>';
    set(dTw,h)}
   /* lap timer */
   {const mw=e.clientWidth*.34;dTim.style.top=lay===1?(mw/5.2+8)+'px':''}
   set(dTim,(fin&&lay===2?'<span class="fl">FINAL LAP</span>':'')+'<div class="rw">'+(lay===1&&best!=null?'<span class="tg">BEST</span>':'')+'<span class="t">'+SV(tf(cur),lay===2?15:11,'#fff',.11)+'</span>'+(lay===1&&dl!=null?'<span class="tg '+(dl>0?'u':'d')+'">'+(dl>0?'+':'−')+Math.abs(dl).toFixed(3)+'</span>':'')+'</div>');
   {let h='';const from=Math.max(0,L.length-5);for(let k=L.length-1;k>=from;k--)h+='<div'+(L[k]===best?' class="bt"':'')+'><b>'+(k+1)+'</b><span>'+tf(L[k])+'</span></div>';set(dLaps,h)}
   set(dTot,SV(tf(Rc.t),13,'#fff',.11));
   {const gr=c._gripPct==null?100:c._gripPct,col=gr>=97?'#f2f4f5':gr>=80?'#f2c76b':'#ef6a5a';dTy.style.setProperty('--tc',col);
    const sm=c._tyLab||'SM';set(dTy,'<div class="lb">'+sm+'</div><div class="cr"><u></u><i style="left:-4px;top:2px"></i><i style="right:-4px;top:2px"></i><i style="left:-4px;bottom:2px"></i><i style="right:-4px;bottom:2px"></i></div><div class="lb">'+sm+'</div>')}
   {const T2=c._tl||{};dBrk.textContent='BRAKE';dBrk.classList.toggle('on',(T2.br||0)>.55&&(c.sp||0)>12)}
   let pp=e.querySelector('.gtPass');if(!pp){pp=document.createElement('div');pp.className='gtPass';e.appendChild(pp)}
   {const A=c._ah||(c._ah={}),now=performance.now();Rc.cars.forEach((q,j)=>{if(q===c||q.out)return;const sd=c.unw>q.unw?1:-1,o=A[j]||(A[j]={sd:sd,t:now,seen:false,fired:false});
     if(o.sd!==sd){o.sd=sd;o.t=now;o.fired=false;o.seen=true}
     if(sd>0&&o.seen&&!o.fired&&Rc.state==='race'&&now-o.t>700){o.fired=true;const cn=(P.BYID&&P.BYID[q.carId]&&P.BYID[q.carId].name)||'';pp.innerHTML='<div><small>PASSED</small><b>'+cn+'</b></div>';pp.classList.add('on');clearTimeout(pp._to);pp._to=setTimeout(()=>pp.classList.remove('on'),2800)}})}
  })}catch(_){}};
 /* the rear-view mirror: one player only (a second render per view is too dear for split screen) */
 {const R0=R.render.bind(R),v4=new THREE.Vector4(),mc=new THREE.PerspectiveCamera(62,5.2,.3,700),d=new THREE.Vector3();
  R.render=function(scene,cam){R0(scene,cam);
   try{const Rc=RACE;if(typeof scr==='undefined'||scr!=='game'||!Rc||scene!==Rc.scene||!cam||R.getRenderTarget()!==null||(window.PTO&&window.PTO.mirror===false))return;
    if(Rc.cars.filter(h=>h.human).length!==1)return;
    const c=Rc.cars.find(h=>h.human&&h.cam===cam);if(!c||!c.rect||Rc.mode==='cutup')return;
    const g=c.m&&c.m.g;if(!g)return;d.set(g.position.x-cam.position.x,0,g.position.z-cam.position.z);if(d.lengthSq()<.01)return;d.normalize();
    mc.position.set(g.position.x,g.position.y+1.35,g.position.z);mc.lookAt(g.position.x-d.x*30,g.position.y+1.2,g.position.z-d.z*30);mc.updateMatrixWorld();
    const W=R.domElement.width,H=R.domElement.height,r=c.rect,vw=r[2]*W,w=Math.round(vw*.34),h=Math.round(w/5.2),x=Math.round(r[0]*W+vw/2-w/2),y=Math.round((r[1]+r[3])*H)-h;
    R.getViewport(v4);const sc=R.getScissorTest();R.setScissorTest(true);R.setViewport(x,y,w,h);R.setScissor(x,y,w,h);R0(scene,mc);R.setViewport(v4);R.setScissor(v4);R.setScissorTest(sc)}catch(_){}}}
}
})();
