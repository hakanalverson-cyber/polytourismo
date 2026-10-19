/* ===== Poly Tourismo v9 layer: suspension sway, ground-hugging shadows ===== */
(function v9extra(){
'use strict';
const P=window.PT8,BYID=P.BYID,CLS=P.CLS;
/* ---------- soft shadow texture ---------- */
let shTex=null;
function shadowTex(){if(shTex)return shTex;const cv=document.createElement('canvas');cv.width=64;cv.height=128;const g=cv.getContext('2d');
 g.filter='blur(5px)';g.fillStyle='#000';g.beginPath();g.roundRect?g.roundRect(14,16,36,96,14):g.rect(14,16,36,96);g.fill();
 shTex=new THREE.CanvasTexture(cv);return shTex}
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_n=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0),_ax=new THREE.Vector3(0,1,0);
/* sway amount per class: A and S are stiff */
const SWAY={D:1,C:.8,B:.5,A:0,S:0};
const prev=updateVisual;
updateVisual=(c,T,t)=>{prev(c,T,t);const m=c.m;if(!m||!RACE)return;const dt=Math.min(.05,Math.max(.001,dtf));
 /* --- low-pass the body attitude: removes one-frame spikes when wheels hop between dirt and road --- */
 {const g=m.g,k=1-Math.exp(-dt*24);if(c.respT>0||c.exp>0||c.svx===undefined||c.lastSmT!==RACE){c.svx=g.rotation.x;c.svz=g.rotation.z}else{const dx=g.rotation.x-c.svx,dz=g.rotation.z-c.svz;c.svx+=dx*k;c.svz+=dz*k;g.rotation.x=c.svx;g.rotation.z=c.svz}c.lastSmT=RACE}
 /* --- sway (visual only) --- */
 const cls=(c.cs&&c.cs.cls)||'B',RL=!!(RACE.cfg&&RACE.cfg.rally),amt=RL?Math.max(SWAY[cls]||0,.9)*1.7:(SWAY[cls]||0);
 if(amt>0&&c.respT<=0&&!(c.exp>0)&&!c.cool0){
  const yawR=wr(c.yaw-(c.pyaw===undefined?c.yaw:c.pyaw))/dt;c.pyaw=c.yaw;
  const al=clamp(c.sp*yawR,-26,26),ac=((c.sp-(c.psp===undefined?c.sp:c.psp))/dt);c.psp=c.sp;
  const rough=(c.mt&&c.mt!==undefined&&(c.mt.grip<.9||T.d.gravel))?clamp(c.sp/30,0,1):0;
  const lim=RL?2.2:1,tr=clamp(al*.0032*amt,-.11*lim,.11*lim)+(rough?(Math.random()-.5)*.03*rough*amt:0),tp=clamp(-ac*.0021*amt,-.07*lim,.07*lim)+(rough?(Math.random()-.5)*.02*rough*amt:0);
  const w0=RL?7.4:10.5,zt=RL?.2:.3+.15*(1-amt);c.swr=c.swr||0;c.swp=c.swp||0;c.swvr=c.swvr||0;c.swvp=c.swvp||0;
  /* semi-implicit spring: underdamped so the body rocks */
  c.swvr+=(-w0*w0*(c.swr-tr)-2*zt*w0*c.swvr)*dt;c.swr+=c.swvr*dt;
  c.swvp+=(-w0*w0*(c.swp-tp)-2*zt*w0*c.swvp)*dt;c.swp+=c.swvp*dt;
  m.g.rotation.x+=c.swp;m.g.rotation.z+=c.swr;
  if(RL){/* heave: the body rides over dips and bumps on soft springs */
   const ay=(c.vy-(c.pvy===undefined?c.vy:c.pvy))/dt;c.pvy=c.vy;c.hvy=c.hvy||0;c.hh=c.hh||0;const tg=clamp(-ay*.012,-.32,.32);
   c.hvy+=(-52*(c.hh-tg)-2*.22*7.2*c.hvy)*dt;c.hh+=c.hvy*dt;m.g.position.y+=clamp(c.hh,-.4,.4);m.g.rotation.x+=clamp(c.hh*.12,-.05,.05)}
  if(m.visualModel)m.visualModel.position.y+=Math.abs(c.swr)*.35;
 }else{c.swr=c.swp=c.swvr=c.swvp=0;c.pyaw=c.yaw;c.psp=c.sp}
 /* --- shadow --- */
 const sh=m.sh;if(!sh)return;
 if(P.realShadows&&RACE.scene.userData.sun&&(!window.PTO||window.PTO.shadows!==false)){sh.visible=false;return}sh.visible=true;
 if(!sh.userData.v9){sh.userData.v9=1;const hu=c.human,sx_=hu?5:2,sz_=hu?9:4;sh.geometry=new THREE.PlaneGeometry(3.3,6.0,sx_,sz_);sh.geometry.rotateX(-Math.PI/2);sh.userData.base=sh.geometry.attributes.position.array.slice();sh.frustumCulled=false;sh.material=new THREE.MeshBasicMaterial({map:shadowTex(),transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:false});sh.renderOrder=-1}
 /* draped shadow: every vertex follows the real ground height, so it never sinks into crests or floats over dips */
 const bs=sh.userData.base,pos=sh.geometry.attributes.position,arr=pos.array,cy=Math.cos(c.yaw),sy=Math.sin(c.yaw);
 let minh=1e9,avg=0,n=0;
 for(let i=0;i<arr.length;i+=3){const lx=bs[i],lz=bs[i+2],wx=c.x+cy*lx+sy*lz,wz=c.z-sy*lx+cy*lz;let h;try{h=T.surf(wx,wz,c.y+.4).h}catch(e){h=c.y-1}if(!isFinite(h))h=c.y-1;h=Math.min(h,c.y-.3);arr[i]=wx;arr[i+1]=h+.07;arr[i+2]=wz;avg+=h;n++}
 pos.needsUpdate=true;sh.position.set(0,0,0);sh.quaternion.identity();sh.scale.setScalar(1);
 const air=Math.max(0,c.y-avg/n-1.1);sh.material.opacity=clamp(.62-air*.05,.16,.62);
};
P.sway=SWAY;
/* 5x7 bitmap digits for the speedo */
const DIG={'0':'01110 10001 10011 10101 11001 10001 01110','1':'00100 01100 00100 00100 00100 00100 01110','2':'01110 10001 00001 00010 00100 01000 11111','3':'11110 00001 00001 01110 00001 00001 11110','4':'00010 00110 01010 10010 11111 00010 00010','5':'11111 10000 11110 00001 00001 10001 01110','6':'00110 01000 10000 11110 10001 10001 01110','7':'11111 00001 00010 00100 01000 01000 01000','8':'01110 10001 10001 01110 10001 10001 01110','9':'01110 10001 10001 01111 00001 00010 01100'};
P.pxDraw=(cv,str,col)=>{const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.fillStyle=col;let x=0;for(const ch of str){const b=DIG[ch];if(b){b.split(' ').forEach((row,y)=>{for(let i=0;i<5;i++)if(row[i]==='1')g.fillRect(x+i,y,1,1)})}x+=6}};
})();
