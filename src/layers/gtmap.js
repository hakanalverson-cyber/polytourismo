/* ===== Poly GT layer: gtmap (Nov 13, Hakan: replace the distance line with a GT5-looking minimap; with more than one player it centres between
   them and gets bigger). No box: a white course line with a dark edge that fades out toward the rim, the start line as a tick, rivals as small
   dots, players as ringed dots in their colour. One player: the map follows the car and turns with it (heading up), top right. Split screen: one
   shared map at the top of the screen between the two views (in the very middle with three or four), north up, centred on the point between the players and zoomed to keep them all in. ===== */
(function gtmap(){
'use strict';
const P=window.PT8;if(!P)return;
const st=document.createElement('style');st.textContent=`
#gtm{position:fixed;z-index:6;pointer-events:none;display:none;top:10px;right:14px;width:clamp(150px,15vw,210px);height:clamp(150px,15vw,210px)}
#gtm.on{display:block}
#gtm.multi{top:50%;left:50%;right:auto;width:clamp(190px,20vw,290px);height:clamp(190px,20vw,290px);transform:translate(-50%,-50%)}
#gtm.multi.four{width:clamp(170px,17vw,240px);height:clamp(170px,17vw,240px)}
body.gtm #dtm,body.gtm #mm{display:none!important}
body.rprep #gtm,body.barnscene #gtm,body.finale #gtm{display:none!important}`;document.head.appendChild(st);
const cv=document.createElement('canvas');cv.id='gtm';document.body.appendChild(cv);const g=cv.getContext('2d');
const PC=['#6cc4ff','#ffb347','#8ef08a','#ff7a9a'];
let vx=0,vz=0,vr=260,va=0,lastT=null;
function off(){if(cv.classList.contains('on')){cv.classList.remove('on');document.body.classList.remove('gtm')}lastT=null}
function draw(){requestAnimationFrame(draw);
 const R=typeof RACE!=='undefined'?RACE:null,gm=document.getElementById('game');
 if(!R||!R.T||R.state==='done'||(R.cfg&&(R.cfg.freeroam||R.cfg.rally))||R.T.stage||typeof scr==='undefined'||scr!=='game'||!gm||(window.PTO&&window.PTO.gtMap===false)){off();return}
 const T=R.T,hs=R.cars.filter(c=>c.human&&!c.out);if(!hs.length){off();return}
 const multi=hs.length>1;if(!cv.classList.contains('on')){cv.classList.add('on');document.body.classList.add('gtm')}cv.classList.toggle('multi',multi);cv.classList.toggle('four',hs.length>2);
 const dpr=Math.min(2,devicePixelRatio||1),W=Math.round(cv.clientWidth*dpr)||300;if(cv.width!==W){cv.width=W;cv.height=W}
 /* where the map looks */
 let cx=0,cz=0;for(const c of hs){cx+=c.x;cz+=c.z}cx/=hs.length;cz/=hs.length;
 let rad=240,ang=0;
 if(multi){let far=0;for(const c of hs)far=Math.max(far,Math.hypot(c.x-cx,c.z-cz));rad=Math.max(240,far*1.35+110)}
 else{const c=hs[0];ang=c.cy!=null?c.cy:c.yaw}
 if(lastT!==T){lastT=T;vx=cx;vz=cz;vr=rad;va=ang}
 const k=multi?.12:.3;vx+=(cx-vx)*k;vz+=(cz-vz)*k;vr+=(rad-vr)*.08;{let d=ang-va;d=Math.atan2(Math.sin(d),Math.cos(d));va+=d*.14}
 const s=W*.46/vr,ca=Math.cos(va),sa=Math.sin(va),h=W/2;
 /* world to map: heading up for one player (the car's forward, (sin yaw, cos yaw), points up the screen) */
 const X=(x,z)=>{const dx=x-vx,dz=z-vz;return h+(-(dx*ca-dz*sa))*s*(multi?-1:1)},Y=(x,z)=>{const dx=x-vx,dz=z-vz;return h-(dx*sa+dz*ca)*s};
 g.clearRect(0,0,W,W);g.lineJoin='round';g.lineCap='round';
 const N=T.N,stp=Math.max(1,Math.round(6/(T.sp||3)));
 const path=()=>{g.beginPath();for(let i=0;i<=N;i+=stp){const j=i%N,x=X(T.x[j],T.z[j]),y=Y(T.x[j],T.z[j]);if(i)g.lineTo(x,y);else g.moveTo(x,y)}if(!T.open)g.closePath()};
 /* Nov 13 (Hakan: the minimap looks really cartoony): a dark glass disc behind it, the road as a faint ribbon at its real width, a thin light centre line, and players as small heading arrows */
 {const bg=g.createRadialGradient(h,h,W*.1,h,h,W*.48);bg.addColorStop(0,'rgba(10,13,18,.5)');bg.addColorStop(.8,'rgba(10,13,18,.42)');bg.addColorStop(1,'rgba(10,13,18,0)');g.fillStyle=bg;g.beginPath();g.arc(h,h,W*.48,0,6.283);g.fill()}
 path();g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=Math.max(3,(T.hw[0]||7)*2*s);g.stroke();
 path();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=Math.max(2.6,W*.014);g.stroke();
 path();g.strokeStyle='rgba(235,240,245,.92)';g.lineWidth=Math.max(1.3,W*.0065);g.stroke();
 /* start line */
 {const c=Math.cos(T.psi[0]),sn=Math.sin(T.psi[0]),w=(T.hw[0]||6)+10,x0=X(T.x[0]+c*w,T.z[0]-sn*w),y0=Y(T.x[0]+c*w,T.z[0]-sn*w),x1=X(T.x[0]-c*w,T.z[0]+sn*w),y1=Y(T.x[0]-c*w,T.z[0]+sn*w);
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=W*.018;g.stroke();g.strokeStyle='#fff';g.lineWidth=W*.008;g.stroke()}
 /* the rim fades out, so the line never ends on a hard edge */
 if(vr<(T.bounds?Math.max(T.bounds[1]-T.bounds[0],T.bounds[3]-T.bounds[2])*.7:1e9)){g.globalCompositeOperation='destination-in';const gr=g.createRadialGradient(h,h,W*.2,h,h,W*.47);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,W);g.globalCompositeOperation='source-over'}
 /* cars: rivals first, players on top */
 const dot=(c,r,fill,ring)=>{const x=X(c.x,c.z),y=Y(c.x,c.z);if(Math.hypot(x-h,y-h)>W*.48)return;g.beginPath();g.arc(x,y,r,0,6.283);g.fillStyle=fill;g.fill();g.lineWidth=Math.max(1.5,W*.011);g.strokeStyle=ring;g.stroke()};
 for(const c of R.cars)if(!c.human&&!c.out)dot(c,W*.018,'#aeb8c2','rgba(0,0,0,.8)');
 for(const c of R.cars)if(!c.human&&!c.out){}
 hs.forEach((c,i)=>{const col=PC[R.cars.filter(q=>q.human).indexOf(c)%4]||PC[i%4],x=X(c.x,c.z),y=Y(c.x,c.z),yw=c.cy!=null?c.cy:c.yaw,fx=X(c.x+Math.sin(yw)*8,c.z+Math.cos(yw)*8)-x,fy=Y(c.x+Math.sin(yw)*8,c.z+Math.cos(yw)*8)-y,L=Math.hypot(fx,fy)||1,ux=fx/L,uy=fy/L,r=W*.04;
  g.beginPath();g.moveTo(x+ux*r*1.25,y+uy*r*1.25);g.lineTo(x-ux*r*.8-uy*r*.8,y-uy*r*.8+ux*r*.8);g.lineTo(x-ux*r*.35,y-uy*r*.35);g.lineTo(x-ux*r*.8+uy*r*.8,y-uy*r*.8-ux*r*.8);g.closePath();g.fillStyle=col;g.fill();g.lineWidth=Math.max(1,W*.007);g.strokeStyle='rgba(0,0,0,.8)';g.stroke()})}
requestAnimationFrame(draw);
})();
