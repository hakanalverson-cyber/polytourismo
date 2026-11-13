/* ===== Poly GT layer: ra (Road Atlanta only: curbs tip the car a little, and the last few solid objects the model's collision set missed) ===== */
(function ra(){
'use strict';
const P=window.PT8;
const isRA=T=>!!(T&&T.d&&T.d.cartoon&&T.d.cartoon.replaces==='ra');
/* pit-side structures the surveyed collision lines did not reach (found by sweeping a ray from the centreline every 6 m, both sides) */
const EXTRA=[[140.6,-181.4,126.8,-176.0,.5],[83.4,-136.6,80.0,-133.6,.6]];
setTimeout(()=>{const bw=buildWorld;buildWorld=T=>{const sc=bw(T);try{if(isRA(T)&&P.addSeg&&!T._raX){T._raX=1;for(const s of EXTRA)P.addSeg(T,s[0],s[1],s[2],s[3],s[4])}}catch(e){}return sc};
 /* curbs: the strip of paving just off the racing surface. The car leans up onto it (about 2.5 degrees) with a light rumble; no change to grip or speed */
 const uv=updateVisual;updateVisual=function(c,T,t){const r=uv.apply(this,arguments);try{
  if(isRA(T)&&c&&c.m&&c.m.g&&!(c.exp>0)){const i=((c.idx|0)%T.N+T.N)%T.N,cs=Math.cos(T.psi[i]),sn=Math.sin(T.psi[i]),lat=(c.x-T.x[i])*cs-(c.z-T.z[i])*sn,a=Math.abs(lat),hw=T.hw[i];
   let on=0;if(a>hw-.25&&a<hw+1.7&&c.sp>2){const s=T.surf(c.x,c.z,c.y+2);if(s&&!s.trap&&(s.road||s.near))on=Math.min(1,(a-(hw-.25))/.4)*Math.min(1,(hw+1.7-a)/.5)}
   const tg=on*(lat>0?1:-1);c._kb=(c._kb||0)+(tg-(c._kb||0))*.18;
   if(Math.abs(c._kb)>.01){c._kp=(c._kp||0)+c.sp*.045;c.m.g.rotateZ(c._kb*.044);c.m.g.position.y+=Math.abs(c._kb)*(.035+.012*Math.sin(c._kp)*Math.min(1,c.sp/20))}}
 }catch(e){}return r}},140);
})();
