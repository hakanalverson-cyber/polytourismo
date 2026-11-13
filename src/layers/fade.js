/* ===== Poly GT layer: a short black fade when a race is started from the menus, so the track builds and its first frames draw out of sight ===== */
(function ptFade(){
'use strict';
const P=window.PT8,lw=P.launchWithIntro;if(!lw)return;
const el=document.createElement('div');el.id='ptFade';
el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:99990;transition:opacity .22s ease';
document.body.appendChild(el);
let busy=false;
P.launchWithIntro=cfg=>{
 /* rally stages keep their own loading screen */
 if(busy||(cfg&&cfg.mode==='rally'&&!cfg.circuit))return lw(cfg);
 busy=true;el.style.transition='opacity .22s ease';el.style.pointerEvents='auto';el.style.opacity='1';
 hold=true;wrap();
 setTimeout(()=>{try{lw(cfg);/* Nov 13: build every shader program for the new scene now, behind the black, so nothing compiles on the first frames */try{const Rc_=typeof RACE!=='undefined'?RACE:null;if(Rc_&&Rc_.scene&&typeof R!=='undefined'&&R.compile)R.compile(Rc_.scene,new THREE.PerspectiveCamera(60,16/9,.5,3000))}catch(e){}}finally{
  /* the race stays frozen behind the black (no formation lap, no countdown) until frames come smoothly: the first frames of a new track
     can take seconds while textures upload and shaders compile, and the countdown used to run out in the dark. Then let go and fade in */
  let n=0,ok=0,last=performance.now();const t0=last;
  let pd=0;const tick=()=>{const now=performance.now(),d=now-last;last=now;n++;/* steady, not necessarily fast: a slow machine settles at its own pace */ok=d<120&&pd&&Math.abs(d-pd)<Math.max(8,pd*.3)?ok+1:0;pd=d;if((n<10||ok<8)&&now-t0<20000)return requestAnimationFrame(tick);
   hold=false;setTimeout(()=>{el.style.transition='opacity .6s ease';el.style.opacity='0';el.style.pointerEvents='none';busy=false},60)};requestAnimationFrame(tick)}},240)};
/* the freeze: wrapped once at the first launch, when every layer has added its own step, so it sits outside all of them */
let hold=false,wrapped=false;
function wrap(){if(wrapped||typeof step!=='function')return;wrapped=true;const s0=step;step=function(){if(hold)return;return s0.apply(this,arguments)}}
})();
/* leaving Brand Central: fade the showroom out to black first, then switch (the menu then fades up from black) */
(function ptBrandOut(){
'use strict';
const P=window.PT8;if(typeof show!=='function')return;
const el=document.createElement('div');el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:99996;transition:opacity .4s ease';document.body.appendChild(el);
const s0=show;let busy=false,pend=null;
show=n=>{if(busy){pend=n;return}if(typeof scr==='undefined'||scr!=='s8show'||n==='s8show'||!(P.SR&&P.SR.kind==='brand'))return s0(n);
 busy=true;el.style.transition='opacity .4s ease';el.style.pointerEvents='auto';el.style.opacity='1';
 setTimeout(()=>{try{s0(n);if(pend!=null&&pend!==n)s0(pend)}finally{busy=false;pend=null;el.style.transition='opacity .6s ease';el.style.opacity='0';el.style.pointerEvents='none'}},420)};
})();
