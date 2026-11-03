/* ===== Poly GT layer: menu motion. Nov 3 (Hakan): the Career menu's feel everywhere else too. Rows slide in one after another when a
   menu opens, the chosen row has the glint sweeping across it and its icon springs up, a hovered row lights up, a picked row pulses.
   Main menu, Quick Play, the setup screens, Options and the pause menus (cars and bikes) ===== */
(function menufx(){
'use strict';
const P=window.PT8;if(!P)return;
const EASE='cubic-bezier(.16,.85,.25,1)',SPRING='cubic-bezier(.3,1.6,.5,1)';
/* the stagger: each row waits 45 ms more than the one before it (like the Career choices) */
const stag=(sel,n,step)=>Array.from({length:n},(_,i)=>`${sel}:nth-child(${i+1}){animation-delay:${i*step}ms!important}`).join('\n');
/* the chosen row's glint (Career's gcShine) */
const SHINE=['#gxBot .gxm.on b','#gxQp .qr.foc','#gxSu .gxr.on','#ptOptions nav button.sel','#pause .b button:hover','#pause .b button:focus','#bkPause .b button:hover','#bkPause .b button:focus',
 '#pause .b button.fxOn','#s8setup.gxOn #suGo:hover','.foot8 .btn:hover','#resBox button:hover','#s8res button:hover'];
const css=`
@keyframes fxShine{0%{left:-40%}45%,100%{left:120%}}
@keyframes fxIn{from{opacity:0;translate:30px 0}}
@keyframes fxUp{from{opacity:0;translate:0 16px}}
@keyframes fxFade{from{opacity:0}}
@keyframes fxHit{0%{scale:1}40%{scale:.96;filter:brightness(1.6)}100%{scale:1}}
@keyframes fxPanel{from{opacity:0;translate:50px 0;scale:.97}}
@keyframes fxPic{from{opacity:0;scale:1.03}}
${SHINE.map(s=>s).join(',')}{position:relative!important;overflow:hidden!important}
${SHINE.map(s=>s+'::after').join(',')}{content:"";position:absolute;top:0;bottom:0;left:-40%;width:35%;background:linear-gradient(100deg,transparent,#ffffff50,transparent);animation:fxShine 2.6s ease-in-out .2s infinite;pointer-events:none;z-index:2}
/* icons spring up on the chosen row */
#gxBot .gxm b .mi,#gxQp .qr svg{transition:transform .3s ${SPRING},opacity .15s!important}
#gxBot .gxm.on b .mi,#gxQp .qr.foc svg{transform:scale(1.15) rotate(-6deg)}
/* hover: the row lights up before it is chosen */
#gxBot .gxm b,#gxQp .qr,#gxSu .gxr,#ptOptions main label,#pause .b button,#bkPause .b button{transition:background .15s,color .15s,box-shadow .15s,translate .18s!important}
#gxBot .gxm:not(.on):hover b{background:#ffffff0d!important;box-shadow:inset 0 1px 0 #ffffff1c!important}
#gxQp .qr:not(.foc):hover{color:#fff;background:#ffffff0d;box-shadow:inset 0 1px 0 #ffffff1c}
#pause .b button.fxOn{background:var(--gxa)!important;color:#fff!important;box-shadow:var(--gxaS)!important}
#ptOptions main label{border-radius:8px}#ptOptions main label:hover{background:#ffffff0a!important;box-shadow:inset 0 1px 0 #ffffff1a}
#ptOptions nav button,#ptOptions footer button,#pause .b button,#bkPause .b button{transition:translate .18s,background .15s,color .15s,box-shadow .15s!important}
#ptOptions nav button:hover,#ptOptions footer button:hover{translate:0 -1px}
#pause .b button:hover,#pause .b button:focus,#pause .b button.fxOn,#bkPause .b button:hover,#bkPause .b button:focus{translate:4px 0}
/* slide-in: the menus as they open */
#gxBot .gxm b{animation:fxIn .5s ${EASE} backwards}
${stag('#gxBot .gxm',10,45).replace(/\)\{/g,') b{')}
#gxQp .qr{animation:fxIn .5s ${EASE} backwards}
${stag('#gxQp .qr',10,45)}
#gxQp .qkL{animation:fxPanel .55s ${EASE} backwards}
#gxQp .qP{animation:fxUp .55s ${EASE} .12s backwards}
#gxSu.fxIn .gxHero{animation:fxPic .6s ${EASE} backwards}
#gxSu.fxIn .gxCard{animation:fxUp .5s ${EASE} backwards}
${stag('#gxSu.fxIn .gxCard',4,70).replace(/\{animation-delay:(\d+)ms/g,(m,d)=>'{animation-delay:'+(+d+120)+'ms')}
#gxSu.fxIn .gxr{animation:fxIn .45s ${EASE} backwards}
${stag('#gxSu.fxIn .gxr',12,40).replace(/\{animation-delay:(\d+)ms/g,(m,d)=>'{animation-delay:'+(+d+180)+'ms')}
#ptOptions section{animation:fxPanel .5s ${EASE} backwards}
#ptOptions nav button{animation:fxIn .45s ${EASE} backwards}
${stag('#ptOptions nav button',8,40)}
#ptOptions main.fxIn label{animation:fxIn .45s ${EASE} backwards}
${stag('#ptOptions main.fxIn label',16,35)}
#pause .w,#bkPause .w{animation:fxPanel .45s ${EASE} backwards}
#pause .b button,#bkPause .b button{animation:fxIn .45s ${EASE} backwards}
${stag('#pause .b button',8,50)}
${stag('#bkPause .b button',8,50)}
/* level: the Quick Play list runs exactly as tall as the picture beside it (top and bottom edges in line; it used to float in the middle) */
#gxQp .qkL{align-self:stretch!important;margin-bottom:calc(clamp(36px,6vh,70px) + 4px)!important;justify-content:stretch!important}
#gxQp .qr{flex:1 1 0!important;height:auto!important;max-height:none!important;min-height:44px}
/* a picked row pulses */
.fxHit{animation:fxHit .22s ease-out!important}
#gxBot .gxm.fxHit b{animation:fxHit .22s ease-out!important}
@media (prefers-reduced-motion:reduce){#gxBot .gxm,#gxQp .qr,#gxQp .qkL,#gxQp .qP,#gxSu.fxIn *,#ptOptions *,#pause *,#bkPause *{animation:none!important}}
`;
const st=document.createElement('style');st.id='menufx';st.textContent=css;document.head.appendChild(st);

/* the setup screen and Options redraw their rows on every change: the slide-in only plays when the screen, the step or the tab is new */
const gate=(el,sig)=>{if(!el)return;let last='';new MutationObserver(()=>{const s=sig();if(s===last)return;last=s;el.classList.remove('fxIn');void el.offsetWidth;el.classList.add('fxIn');clearTimeout(el._fxT);el._fxT=setTimeout(()=>el.classList.remove('fxIn'),1400)}).observe(el,{childList:true})};
const vis=e=>e&&e.offsetParent!==null;
const hookSetup=()=>{const b=document.getElementById('gxSu');if(!b||b._fx)return!!b;b._fx=1;
 gate(b,()=>{const s=document.querySelector('#suSteps .on'),t=document.getElementById('suTitle');return(t?t.textContent:'')+'|'+(s?s.textContent:'')+'|'+(b.querySelector('.gxCards')?b.querySelector('.gxCards').children.length:0)+'|'+P._fxOpen});return true};
const hookOpts=()=>{const o=document.getElementById('ptOptions'),m=o&&o.querySelector('main');if(!m||m._fx)return!!m;m._fx=1;gate(m,()=>{const s=o.querySelector('nav button.sel');return(s?s.textContent:'')+'|'+P._fxOpen});return true};
/* a new visit to a screen counts as new, even with the same step and tab */
P._fxOpen=0;
const wrapShow=()=>{if(typeof show!=='function'||show._fx)return;const s0=show;show=function(n){const was=typeof scr!=='undefined'?scr:null;const r=s0.apply(this,arguments);if(n!==was)P._fxOpen++;hookSetup();hookOpts();return r};show._fx=1};
const tick=()=>{wrapShow();const a=hookSetup(),b=hookOpts();if(!(a&&b&&show._fx))setTimeout(tick,800)};setTimeout(tick,0);

/* the pause menus: Up / Down move a highlight like the menus (the hover look), Enter presses it */
let pf=-1;const pBtns=()=>{for(const id of['pause']){const p=document.getElementById(id);if(p&&getComputedStyle(p).display!=='none'&&getComputedStyle(p).visibility!=='hidden'&&(id!=='pause'||(typeof scr!=='undefined'&&scr==='pause')||document.body.classList.contains('ptPause'))){const b=[...p.querySelectorAll('.b button')].filter(vis);if(b.length)return b}}return null};
const pMark=(L,i)=>{L.forEach((b,k)=>b.classList.toggle('fxOn',k===i))};
addEventListener('keydown',e=>{const L=pBtns();if(!L){pf=-1;document.querySelectorAll('#pause .fxOn').forEach(b=>b.classList.remove('fxOn'));return}
 if(e.code==='ArrowDown'||e.code==='ArrowUp'){pf=pf<0?0:(pf+(e.code==='ArrowDown'?1:-1)+L.length)%L.length;pMark(L,pf);P.sfx&&P.sfx('move');e.preventDefault()}
 else if((e.code==='Enter'||e.code==='Space')&&pf>=0&&L[pf]&&L[pf].classList.contains('fxOn')){const b=L[pf];pulse(b);pf=-1;pMark(L,-1);e.preventDefault();e.stopPropagation();setTimeout(()=>b.click(),120)}},true);
addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('#pause .b button,#bkPause .b button');if(b){const L=pBtns();if(L){pf=L.indexOf(b);pMark(L,-1)}}},true);

/* the pulse on whatever gets picked: by click, or by Enter on the chosen row */
const PICK='#gxBot .gxm,#gxQp .qr,#gxSu .gxr,#ptOptions button,#pause .b button,#bkPause .b button,.foot8 .btn,#s8setup.gxOn #suGo,#resBox button,#s8res button,#s8career .gcRow';
function pulse(el){if(!el)return;el.classList.remove('fxHit');void el.offsetWidth;el.classList.add('fxHit');clearTimeout(el._hitT);el._hitT=setTimeout(()=>el.classList.remove('fxHit'),260)}
P.fxPulse=pulse;
addEventListener('click',e=>{const el=e.target.closest&&e.target.closest(PICK);if(el)pulse(el)},true);
addEventListener('keydown',e=>{if(e.code!=='Enter'&&e.code!=='Space')return;if(e.target&&e.target.tagName==='INPUT')return;
 const c=document.querySelector('#gxBot .gxm.on'),q=document.querySelector('#gxQp .qr.foc'),s=document.querySelector('#gxSu .gxr.on');
 for(const el of[q,s,c])if(vis(el)){pulse(el);break}},true);
})();
