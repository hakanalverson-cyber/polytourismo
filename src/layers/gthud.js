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
/* HUD numerals: the game's own font, italic and bold, as on the GT5 readouts (canvas and DOM share the helper) */
const GD={draw(g,str,x,y,h,al,col){g.font='italic 700 '+(h*1.32).toFixed(1)+'px "PTExo","Inter","SF Pro Display","Segoe UI","Helvetica Neue",Arial,sans-serif';g.fillStyle=col||'#fff';g.textAlign=al||'left';g.textBaseline='middle';g.fillText(String(str),x,y+h*.06);return g.measureText(String(str)).width},
 svg(str,h){return'<span class="gd" style="font-size:'+Math.round(h*1.3)+'px">'+str+'</span>'}};
P.gtDig=GD;
/* each car's real redline in rpm, by catalogue number (researched per model; an electric car gets its motor's top speed) */
const RED=[7500,7000,6800,8400,6000,6500,7500,8250,8000,8250,6000,7000,6600,7500,5000,9150,7500,6400,7900,6200,7000,7000,6500,9000,7750,6500,6500,8000,6500,6500,7500,5500,6500,8500,7200,7500,7000,6500,7750,6500,7400,6000,8200,8500,7500,7000,7000,6600,8000,6500,6500,6500,7800,7000,6000,7000,6800,7700,6500,6800,5500,7000,7500,9000,6000,8500,8250,8400,9000,8500,6500,6600,7500,6700,8000,14000,6700,8500,9000,7500,7500,6500,6500,7300,7000,8000,6500,8250,8400,5500,6000,6900,8500,7600,8000,6000,7000,5700,8500,7500,6800,9000,8000,6800,6000,7000,8500,7400,7500,8000,6000,7250,8500,7000,6750,7000,7000,6500,7000,7200,8000,7000,7000,7000,6500,6800,7600,8500,6500,8000,7700,14000,7000,7000,6250,8500];
P.redOf=id=>{try{const c=P.BYID[id],k=c?(c.k10!=null?c.k10:Math.floor(c.body/2)):null;return(k!=null&&RED[k])||7000}catch(e){return 7000}};
/* the cluster: the GT5 tachometer and nothing the game does not have. A flat ruler in a dark box, numbered in thousands up to just past the car's own redline:
   white up to the redline, red beyond it, with no break between the two, and an orange needle at the engine speed. Speed and gear under it, the steering dot above it. */
try{document.fonts.load('italic 700 12px PTExo');document.fonts.load('600 12px PTExo')}catch(_){}
P.gx5Split=function(cv,o){const one=o.lay===1,CW=one?480:300,OX=(CW-300)/2,LW=300,LH=92,k=3;if(cv.width!==CW*k)cv.width=CW*k;if(cv.height!==LH*k)cv.height=LH*k;if(cv._cw!==CW){cv._cw=CW;cv.style.setProperty('width','calc(var(--gw,600px)*'+(CW/300)+')','important')}const g=cv.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,CW,LH);g.translate(OX,0);
 const F='"PTExo","Inter","SF Pro Display","Segoe UI","Helvetica Neue",Arial,sans-serif',PI=Math.PI,TL=o.tl||{},cm=LW/2;
 const tx=(t,x,y,sz,c,al,wt)=>{g.font=(wt||500)+' '+sz+'px '+F;g.fillStyle=c;g.textAlign=al||'center';g.textBaseline='middle';g.fillText(t,x,y)};
 const red=o.red||7000,ev=red>10000,stp=ev?2000:1000,maxR=(Math.floor(red/stp)+1)*stp+(red%stp===0?0:0),rpm=Math.max(0,Math.min(1.03,o.rev))*red;
 const x0=36,x1=264,y0=12,yb=80,r=5;
 g.beginPath();g.moveTo(x0+r,y0);g.arcTo(x1,y0,x1,yb,r);g.arcTo(x1,yb,x0,yb,r);g.arcTo(x0,yb,x0,y0,r);g.arcTo(x0,y0,x1,y0,r);g.closePath();
 const gr=g.createLinearGradient(0,y0,0,yb);gr.addColorStop(0,'rgba(34,36,39,.84)');gr.addColorStop(.5,'rgba(18,19,21,.8)');gr.addColorStop(1,'rgba(10,11,13,.76)');g.fillStyle=gr;g.fill();g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.16)';g.stroke();
 const sx0=x0+14,sx1=x1-14,sw=sx1-sx0,X=v=>sx0+sw*v/maxR,xr=X(red),nL=maxR/stp,sub=5;
 for(let i=0;i<=nL;i++)tx(String(i*stp/1000),X(i*stp),y0+8.5,7,i*stp>=red?'#ff6a5a':'#fff','center',700);
 /* segmented rev bar sits on the scale itself: one cell per 100 rpm with a thin slit between cells */
 {const f=Math.max(0,Math.min(1,rpm/red)),t=Math.max(0,(f-.45)/.55),G=Math.round(t<.5?255-(255-150)*t*2:150-(150-59)*(t-.5)*2),B=Math.round(t<.5?255-(255-185)*t*2:185-(185-48)*(t-.5)*2),lit='rgb(255,'+G+','+B+')';
  const cells=nL*10,cw=sw/cells,ty=y0+14,th=9.5;
  for(let j=0;j<cells;j++){const v=j*stp/10,on=v<rpm-1,inR=v>=red-1;g.fillStyle=on?(inR?'#ff3b30':lit):(inR?'rgba(255,59,48,.3)':'rgba(255,255,255,.14)');g.fillRect(sx0+j*cw+.3,ty,cw-.6,th)}
  /* graduation under the bar: long at each 1000, medium at 500, short at 100 */
  for(let j=0;j<=cells;j++){const v=j*stp/10,x=X(v),L=j%10===0?4.2:j%5===0?2.8:1.5;g.fillStyle=v>=red-1?'#ff3b30':'rgba(255,255,255,.9)';g.fillRect(x-(j%10===0?.55:.3),y0+27.4,j%10===0?1.1:.6,L)}
  g.fillStyle='#fff';g.fillRect(sx0-.7,y0+24.5,xr-sx0+.7,2.2);g.fillStyle='#ff3b30';g.fillRect(xr,y0+24.5,sx1-xr+.7,2.2);
  tx('x1000 r/min',sx1,y0+35,4.6,'rgba(255,255,255,.6)','right',600);tx(String(Math.round(rpm/10)*10),sx0,y0+35,5.4,'rgba(255,255,255,.85)','left',700)}
 /* speed | gear */
 GD.draw(g,Math.round(o.kmh),cm-12,61,14,'right','#fff');tx(o.unit,cm-12,74.5,6.5,'rgba(255,255,255,.85)','right',600);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(cm-.5,47,1,29);
 const gw=GD.draw(g,o.gear,cm+13,60,19,'left',o.shift?'#ff5a4a':'#fff');tx(o.auto?'AT':'MT',cm+13+gw+9,74.5,6.5,'rgba(255,255,255,.85)','left',600);
 /* brake (left) and throttle (right) bars in brackets beside the box */
 for(const[bx,d,v,col]of[[22,1,TL.br||0,'#ff4a3d'],[278,-1,TL.th||0,'#f4f6f7']]){const ty=20,bb=72,h=bb-ty;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.beginPath();g.moveTo(bx+d*4,ty);g.lineTo(bx,ty);g.lineTo(bx,bb);g.lineTo(bx+d*4,bb);g.stroke();
  const fx=d>0?bx+3:bx-8,fh=h*Math.max(0,Math.min(1,v));g.fillStyle='rgba(255,255,255,.12)';g.fillRect(fx,ty+1,5,h-2);g.fillStyle=col;g.fillRect(fx,bb-1-Math.max(0,fh-2),5,Math.max(0,fh-2));g.fillStyle='rgba(255,255,255,.7)';for(let q=1;q<4;q++)g.fillRect(d>0?bx:bx-2.5,ty+h*q/4-.25,2.5,.5)}
 /* single player: instrument flanks. Left is a g-g plot, right a live telemetry table */
 if(one){const dim='rgba(255,255,255,.55)',ink='rgba(255,255,255,.92)',hair='rgba(255,255,255,.28)';
  {const cx=-36,cy=46,R=22,la=Math.max(-1.5,Math.min(1.5,+TL.lat||0)),lo=Math.max(-1.5,Math.min(1.5,+TL.lon||0));
   g.lineWidth=.6;g.strokeStyle=hair;for(const r of[R,R*2/3,R/3]){g.beginPath();g.arc(cx,cy,r,0,PI*2);g.stroke()}
   g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.8;g.beginPath();g.arc(cx,cy,R,0,PI*2);g.stroke();
   g.strokeStyle=hair;g.lineWidth=.6;g.beginPath();g.moveTo(cx-R-3,cy);g.lineTo(cx+R+3,cy);g.moveTo(cx,cy-R-3);g.lineTo(cx,cy+R+3);g.stroke();
   for(let a2=0;a2<24;a2++){const an=a2*PI/12,l=a2%6===0?3:1.6;g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(cx+Math.cos(an)*R,cy+Math.sin(an)*R);g.lineTo(cx+Math.cos(an)*(R-l),cy+Math.sin(an)*(R-l));g.stroke()}
   g.beginPath();g.arc(cx+la/1.5*R,cy-lo/1.5*R,2.2,0,PI*2);g.fillStyle='#ff4a3d';g.fill();
   tx('G-FORCE',cx,12.5,5.6,dim,'center',600);tx(Math.hypot(la,lo).toFixed(2)+' g',cx,81,6.8,ink,'center',600);tx('1.5',cx+R+2,cy-4,3.8,dim,'left',600)}
  {const xL=302,xR=380,rows=[['THROTTLE',Math.round((TL.th||0)*100)+' %'],['BRAKE',Math.round((TL.br||0)*100)+' %'],['STEER',(TL.st>0?'+':'')+Math.round((TL.st||0)*100)+' %'],['LAT',(+TL.lat||0).toFixed(2)+' g'],['LON',(+TL.lon||0).toFixed(2)+' g'],['GRIP',Math.round(o.info&&o.info.grip!=null?o.info.grip:100)+' %']];
   tx('TELEMETRY',xL,12.5,5.6,dim,'left',600);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(xL,17.6,xR-xL,.6);
   rows.forEach((r,i)=>{const y=24.5+i*10;tx(r[0],xL,y,5.6,dim,'left',600);tx(r[1],xR,y,6.8,ink,'right',600);g.fillStyle=hair;g.fillRect(xL,y+4.7,xR-xL,.4)})}}
  /* steering dot above the box */
 const st=Math.max(-1,Math.min(1,TL.st||0));g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cm-.5,2.5,1,5);g.beginPath();g.arc(cm+st*sw*.34,5,2.4,0,PI*2);g.fillStyle=Math.abs(st)>.85?'#ffd27a':'#ff4a3d';g.fill()};
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
.gtP .pc span{display:block;line-height:1}
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
.gtTim .t{display:block;line-height:1;background:rgba(40,42,45,.72);padding:5px 14px;border-radius:2px}
.gtTim .tg{padding:1px 7px;border-radius:2px;font:500 10px/16px var(--gt,Inter,sans-serif);letter-spacing:.1em;background:#7a3fa0}.gtTim .tg.d{background:#2b8a4e}.gtTim .tg.u{background:#b8372d}
.gtTim .fl{padding:1px 9px;border-radius:2px;font:500 10px/15px var(--gt,Inter,sans-serif);background:#8f1a15;letter-spacing:.06em}
.gtLaps{right:16px;top:46%;width:150px;transform:scale(var(--k));transform-origin:100% 0}
.gtLaps p{margin:0 0 3px;padding:4px 8px 5px;background:rgba(20,22,25,.82);text-align:right;font-family:var(--gt,Inter,sans-serif)}.gtLaps p b{display:block;font-weight:600;font-size:12px;line-height:15px}.gtLaps p span{display:block;font-weight:500;font-size:9.5px;line-height:12px;letter-spacing:.08em;opacity:.75;text-transform:uppercase}
.gtLaps div{display:flex;align-items:stretch;gap:3px;height:21px;margin-bottom:3px;font:500 11.5px/21px var(--gt,Inter,sans-serif);font-variant-numeric:tabular-nums}
.gtLaps div b{width:24px;text-align:center;background:rgba(20,22,25,.82);font-weight:600}
.gtLaps div span{flex:1;text-align:right;padding:0 8px;background:rgba(20,22,25,.74)}.gtLaps div.bt span{background:#8d4bb8}
.gtTot{left:16px;bottom:14px;line-height:1;transform:scale(var(--k));transform-origin:0 100%}
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
.gtLapR b{display:block;line-height:1}
.gtL3 .gtBadge,.gtL3 .gtLapR{display:block}
.gtL3 .gtTim{top:calc(18px*var(--k))}
.gtL2 .gtP{left:50%;top:14px;transform:translateX(-50%) scale(var(--k));transform-origin:50% 0}
.gtL2 .gtP .pb{background:none;border:1.5px solid #ffffff59;box-sizing:border-box}
.gtL2 .gtP .lp{margin-left:6px}
.gtL2 .gtTim{top:calc(76px*var(--k))}
.gtL2 .gtTim .t{background:none;padding:2px 0}
@font-face{font-family:PTExo;font-style:italic;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:PTExo;font-style:normal;font-weight:600;src:url(data:font/woff2;base64,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)}
.gd{font:italic 700 16px/1 PTExo,var(--gt,Inter,sans-serif);display:inline-block;letter-spacing:.01em;font-variant-numeric:tabular-nums}
.gtTy{display:none!important}
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
   const Wv=e.clientWidth||600,gw=lay===1?Math.min(.32*Wv,440):lay===2?Math.min(.6*Wv,420):Math.min(.56*Wv,380);e.style.setProperty('--gw',gw+'px');e.style.setProperty('--gr',92/300);
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
   {/* the lap time shows for about 3 s after each completed lap */if(c._lapN==null)c._lapN=L.length;if(L.length>c._lapN){c._lapN=L.length;c._lapShow=performance.now()}if(L.length<c._lapN)c._lapN=L.length;
    const on=c._lapShow&&performance.now()-c._lapShow<3000&&last!=null;dTim.style.visibility=on?'visible':'hidden';
    if(on){const prev=L.length>1?Math.min(...L.slice(0,-1)):null,dd=prev!=null?last-prev:null;set(dTim,'<div class="rw">'+(lay===1&&dd!=null&&dd<=0?'<span class="tg">BEST</span>':'')+'<span class="t">'+SV(tf(last),lay===2?15:12)+'</span>'+(lay===1&&dd!=null?'<span class="tg '+(dd>0?'u':'d')+'">'+(dd>0?'+':'−')+Math.abs(dd).toFixed(3)+'</span>':'')+'</div>')}}
   {let h=L.length?'<p><b>'+nmOf(c,0)+'</b><span>'+((P.BYID&&P.BYID[c.carId]&&P.BYID[c.carId].name)||'')+'</span></p>':'';const from=Math.max(0,L.length-5);for(let k=L.length-1;k>=from;k--)h+='<div'+(L[k]===best?' class="bt"':'')+'><b>'+(k+1)+'</b><span>'+tf(L[k])+'</span></div>';set(dLaps,h)}
   set(dTot,SV(tf(c.fin?(L.length?L[L.length-1]:0):Math.max(0,Rc.t-(c.lapStart||0))),13,'#fff',.11));
   {const gr=c._gripPct==null?100:c._gripPct,col=gr>=97?'#f2f4f5':gr>=80?'#f2c76b':'#ef6a5a';dTy.style.setProperty('--tc',col);
    const sm=c._tyLab||'SM';set(dTy,'<div class="lb">'+sm+'</div><div class="cr"><u></u><i style="left:-4px;top:2px"></i><i style="right:-4px;top:2px"></i><i style="left:-4px;bottom:2px"></i><i style="right:-4px;bottom:2px"></i></div><div class="lb">'+sm+'</div>')}
   {const T2=c._tl||{};dBrk.textContent='';dBrk.classList.remove('on')}
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
