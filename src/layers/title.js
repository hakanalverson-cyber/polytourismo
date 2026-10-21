/* ===== Poly GT layer: "press any button" title screen before the main menu (also what lets the music start) ===== */
(function title(){
'use strict';
const P=window.PT8;if(document.getElementById('ptTitle'))return;
const st=document.createElement('style');st.textContent=`
body.ptTitle #menu{opacity:0!important;pointer-events:none!important}
#menu{transition:opacity .9s ease .25s}
#ptTitle{position:fixed;inset:0;z-index:99990;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f3f5f4;font-family:system-ui,sans-serif;cursor:pointer;user-select:none;transition:opacity .9s ease;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,.1) 0%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.88) 100%)}
#ptTitle.out{opacity:0;pointer-events:none}
#ptTitle .bar{position:absolute;left:0;width:100%;height:9vh;background:#000;transform:scaleY(0);transition:transform 1.1s cubic-bezier(.7,0,.2,1)}
#ptTitle .bar.t{top:0;transform-origin:top}#ptTitle .bar.b{bottom:0;transform-origin:bottom}
#ptTitle.on .bar{transform:none}
#ptTitle .lg{font:900 italic min(12vw,150px)/.86 system-ui,sans-serif;letter-spacing:.01em;text-align:center;opacity:0;transform:translateY(14px) scale(.98);transition:opacity 1.2s ease .5s,transform 1.6s cubic-bezier(.2,.7,.2,1) .5s;
 background:linear-gradient(100deg,#fff 0%,#fff 38%,#9fb0b4 50%,#fff 62%,#fff 100%);background-size:260% 100%;padding:0 .16em 0 .06em;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ptSheen 5.5s ease-in-out 1.8s infinite}
#ptTitle .lg i{display:block;color:transparent;background:linear-gradient(100deg,#8a98a0,#5b6a72);-webkit-background-clip:text;background-clip:text}
#ptTitle.on .lg{opacity:1;transform:none}
#ptTitle .sub{margin-top:2.2vh;font:600 min(1.5vw,13px)/1 system-ui,sans-serif;letter-spacing:.7em;margin-right:-.7em;opacity:0;transition:opacity 1s ease 1.1s;color:#b9c4c6}
#ptTitle.on .sub{opacity:.85}
#ptTitle .ln{width:0;height:1px;margin-top:3.2vh;background:linear-gradient(90deg,transparent,#e9d9a6,transparent);transition:width 1.4s cubic-bezier(.2,.7,.2,1) 1.2s}
#ptTitle.on .ln{width:min(34vw,420px)}
#ptTitle .pr{position:absolute;bottom:15vh;font:700 min(1.7vw,15px)/1 system-ui,sans-serif;letter-spacing:.55em;margin-right:-.55em;opacity:0;color:#fff}
#ptTitle.on .pr{animation:ptBlink 2.2s ease-in-out 2.2s infinite}
#ptTitle .vv{position:absolute;right:3vw;bottom:11vh;font:600 10px/1 system-ui,sans-serif;letter-spacing:.3em;opacity:.45}
@keyframes ptSheen{0%,50%{background-position:175% 0}100%{background-position:-175% 0}}
@keyframes ptBlink{0%,100%{opacity:.25}50%{opacity:1}}`;document.head.appendChild(st);
const d=document.createElement('div');d.id='ptTitle';d.innerHTML='<div class="bar t"></div><div class="bar b"></div><div class="lg">POLY<i>GT</i></div><div class="sub">GRAND TOUR</div><div class="ln"></div><div class="pr">PRESS ANY BUTTON</div><div class="vv">MOTOR DIVISION</div>';
document.body.appendChild(d);document.body.classList.add('ptTitle');requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('on')));
let done=false;
function go(e){if(done)return;done=true;if(e){try{e.preventDefault();e.stopImmediatePropagation()}catch(x){}}
 try{P.audioReady&&P.audioReady();P.sfx&&P.sfx('select')}catch(x){}
 d.classList.add('out');document.body.classList.remove('ptTitle');setTimeout(()=>d.remove(),1100);for(const ev of EV)removeEventListener(ev,go,true);clearInterval(gp)}
const EV=['keydown','pointerdown','mousedown','touchstart','click'];for(const ev of EV)addEventListener(ev,go,true);
/* game pads count as buttons too */
const gp=setInterval(()=>{try{for(const g of(navigator.getGamepads?navigator.getGamepads():[]))if(g&&g.buttons.some(b=>b.pressed))go()}catch(x){}},150);
})();
