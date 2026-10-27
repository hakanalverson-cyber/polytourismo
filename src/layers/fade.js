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
 setTimeout(()=>{try{lw(cfg)}finally{
  /* hold black until a few frames of the race have drawn, then fade in */
  let n=0;const tick=()=>{if(++n<8)return requestAnimationFrame(tick);setTimeout(()=>{el.style.transition='opacity .6s ease';el.style.opacity='0';el.style.pointerEvents='none';busy=false},120)};requestAnimationFrame(tick)}},240)};
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
