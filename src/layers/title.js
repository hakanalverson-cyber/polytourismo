/* ===== Poly GT layer: "press any button" title screen before the main menu (also what lets the music start) ===== */
(function title(){
'use strict';
const P=window.PT8;if(document.getElementById('ptTitle'))return;
const st=document.createElement('style');st.textContent=`
body.ptTitle #menu{opacity:0!important;pointer-events:none!important}
#menu{transition:opacity .9s ease .25s}
#ptTitle{position:fixed;inset:0;z-index:99990;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f3f5f4;font-family:system-ui,sans-serif;cursor:pointer;user-select:none;transition:opacity .9s ease;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,.1) 0%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.88) 100%)}
#ptTitle.out{opacity:0;pointer-events:none}
#ptTitle .bar{margin:0;display:block;position:absolute;left:-4px;width:calc(100% + 8px);height:calc(9vh + 4px);background:#000;transform:scaleY(0);transition:transform 1.1s cubic-bezier(.7,0,.2,1)}
#ptTitle .bar.t{top:-4px;transform-origin:top}#ptTitle .bar.b{bottom:-4px;transform-origin:bottom}
#ptTitle.on .bar{transform:none}
#ptTitle .lg{font:900 italic min(12vw,150px)/.86 system-ui,sans-serif;letter-spacing:.01em;text-align:center;opacity:0;transform:translateY(14px) scale(.98);transition:opacity 1.2s ease .5s,transform 1.6s cubic-bezier(.2,.7,.2,1) .5s;
 background:linear-gradient(100deg,#fff 0%,#fff 38%,#9fb0b4 50%,#fff 62%,#fff 100%);background-size:260% 100%;padding:0 .16em 0 .06em;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ptSheen 5.5s ease-in-out 1.8s infinite}
#ptTitle .lg i{display:block;color:transparent;background:linear-gradient(100deg,#8a98a0,#5b6a72);-webkit-background-clip:text;background-clip:text}
#ptTitle.on .lg{opacity:1;transform:none}
#ptTitle .sub{margin-top:2.2vh;font:600 min(1.5vw,13px)/1 system-ui,sans-serif;letter-spacing:.7em;margin-right:-.7em;opacity:0;transition:opacity 1s ease 1.1s;color:#b9c4c6}
#ptTitle.on .sub{opacity:.85}
#ptTitle .ln{width:0;height:1px;margin-top:3.2vh;background:linear-gradient(90deg,transparent,#e9d9a6,transparent);transition:width 1.4s cubic-bezier(.2,.7,.2,1) 1.2s}
#ptTitle.on .ln{width:min(34vw,420px)}
#ptTitle .pr{position:absolute;bottom:53px;font:700 min(1.7vw,15px)/1 system-ui,sans-serif;letter-spacing:.55em;margin-right:-.55em;opacity:0;color:#fff}
#ptTitle.on .pr{animation:ptBlink 2.2s ease-in-out 2.2s infinite}
#ptTitle .vv{position:absolute;right:28px;bottom:53px;font:600 10px/1 system-ui,sans-serif;letter-spacing:.3em;opacity:.45}
#ptTitle .bg{position:absolute;inset:0;z-index:-2;overflow:hidden;background:#000}
#ptTitle .bg div{position:absolute;inset:-2%;background-size:cover;background-position:center;opacity:0;transition:opacity 1.6s ease;will-change:transform,opacity}
#ptTitle .bg div.on{opacity:1}
#ptTitle .bg div.kb{animation:ptKB 8.5s linear forwards}
#ptTitle .sh{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.35) 0%,rgba(0,0,0,.6) 55%,rgba(0,0,0,.92) 100%),linear-gradient(0deg,rgba(0,0,0,.7),transparent 35%,transparent 70%,rgba(0,0,0,.45));pointer-events:none}
#ptTitle .gr{position:absolute;inset:0;z-index:-1;opacity:.07;pointer-events:none;background-image:repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
#ptTitle .lg{clip-path:inset(0 100% 0 0);transition:opacity .3s ease .4s,transform 1.6s cubic-bezier(.2,.7,.2,1) .4s,clip-path 1.1s cubic-bezier(.7,0,.2,1) .45s}
#ptTitle.on .lg{clip-path:inset(0 0 0 0)}
#ptTitle .st{margin-top:1.6vh;font:700 10px/1 system-ui,sans-serif;letter-spacing:.42em;margin-right:-.42em;color:#e9d9a6;opacity:0;transition:opacity 1s ease 1.6s}
#ptTitle.on .st{opacity:.8}
#ptTitle .cap{position:absolute;left:3vw;bottom:11vh;font:600 10px/1.5 system-ui,sans-serif;letter-spacing:.3em;color:#fff;opacity:0;transition:opacity .6s}
#ptTitle .cap.on{opacity:.7}#ptTitle .cap b{display:block;font-size:13px;letter-spacing:.24em;opacity:1}
#ptTitle .tk{position:absolute;right:3vw;top:11vh;display:flex;gap:5px}
#ptTitle .tk i{display:block;width:10px;height:2px;background:#ffffff40;transition:background .4s}#ptTitle .tk i.on{background:#fff}
#ptTitle .sl{position:absolute;left:0;right:0;top:50%;height:0;z-index:-1;pointer-events:none}
#ptTitle .sl i{position:absolute;height:1px;width:22vw;left:-25vw;background:linear-gradient(90deg,transparent,#ffffffaa,transparent);opacity:0}
#ptTitle.on .sl i{animation:ptStreak 3.8s cubic-bezier(.5,0,.5,1) infinite}
#ptTitle.ov{background:none}#ptTitle.ov .bg,#ptTitle.ov .sh,#ptTitle.ov .gr,#ptTitle.ov .lg,#ptTitle.ov .sub,#ptTitle.ov .st,#ptTitle.ov .ln,#ptTitle.ov .tk,#ptTitle.ov .cap,#ptTitle.ov .bar{display:none}
@keyframes ptKB{from{transform:scale(1.14) translate(var(--x0),var(--y0))}to{transform:scale(1.02) translate(var(--x1),var(--y1))}}
@keyframes ptStreak{0%{left:-25vw;opacity:0}10%{opacity:.9}60%{opacity:.6}100%{left:105vw;opacity:0}}
@keyframes ptSheen{0%,50%{background-position:175% 0}100%{background-position:-175% 0}}
@keyframes ptBlink{0%,100%{opacity:.25}50%{opacity:1}}`;document.head.appendChild(st);
const d=document.createElement('div');d.id='ptTitle';d.innerHTML='<div class="bg"></div><div class="sh"></div><div class="gr"></div><div class="sl">'+[[-14,0],[9,1.3],[-4,2.4],[17,.7],[-21,3.1]].map(([y,t])=>'<i style="top:'+y+'vh;animation-delay:'+t+'s"></i>').join('')+'</div><div class="bar t"></div><div class="bar b"></div><div class="lg">POLY<i>GT</i></div><div class="sub">GRAND TOUR</div><div class="st"></div><div class="ln"></div><div class="pr">PRESS ANY BUTTON</div><div class="cap"></div><div class="tk"></div><div class="vv">MOTOR DIVISION</div>';
document.body.appendChild(d);document.body.classList.add('ptTitle');
/* stills behind the title, Brand Central style: the action shots on the real circuits when the build has them, slowly drifting
   (Ken Burns) and crossfading, with the circuit's name in the corner */
const CN={bat:'MOUNT PANORAMA \u00b7 BATHURST',hun:'HUNGARORING',imo:'IMOLA',lag:'LAGUNA SECA',nur:'N\u00dcRBURGRING',ra0:'ROAD ATLANTA',spa:'SPA-FRANCORCHAMPS',suz:'SUZUKA'};
/* mostly the photoshoot stills (the same ones the loading screen pans over), with a few hand-picked track shots spaced between them */
const PICK=['bat0','suz0','nur0'];
let SL=[];try{const nm=window.BBG_NAMES||[],bb=typeof BBG_B64!=='undefined'?BBG_B64:[],U=b=>'url(data:image/jpeg;base64,'+b+')',shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
 const ph=shuf((window.PT8_BOOTBG||[]).map(b=>({u:U(b),n:''})));let tr=PICK.map(k=>nm.indexOf(k)).filter(i=>i>=0).map(i=>({u:U(bb[i]),n:CN[nm[i].slice(0,3)]||''}));
 if(!tr.length)tr=[3,2].filter(i=>bb[i]).map(i=>({u:U(bb[i]),n:''}));tr=shuf(tr);
 if(window.PT8_BOOTI!=null&&ph.length>1){/* don't open on the still the loading screen was just showing */const cur=U(window.PT8_BOOTBG[window.PT8_BOOTI]),k=ph.findIndex(x=>x.u===cur);if(k===0)ph.push(ph.shift())}
 SL=ph.slice();tr.forEach((t,k)=>SL.splice(Math.min(SL.length,3+k*4),0,t))}catch(e){SL=[]}
/* the loading screen already shows the logo over the stills: the title then only adds its prompt on top of it, and the hand-picked track
   shots join the loading screen's slideshow */
const BT=document.getElementById('ptBoot');if(BT){d.classList.add('ov');try{const L=window.PT8_BOOTBG,nm=window.BBG_NAMES||[],bb=typeof BBG_B64!=='undefined'?BBG_B64:[];let ix=PICK.map(k=>nm.indexOf(k)).filter(i=>i>=0);if(!ix.length)ix=[3,2].filter(i=>bb[i]);
 ix.forEach((i,k)=>L.splice(Math.min(L.length,((window.PT8_BOOTI|0)+3+k*4)%(L.length+1)),0,bb[i]))}catch(e){}}
const bg=d.querySelector('.bg'),cap=d.querySelector('.cap'),tk=d.querySelector('.tk');tk.innerHTML=SL.map(()=>'<i></i>').join('');
let si=-1,slT=0;const R=()=>(Math.random()*4-2).toFixed(2)+'%';
function slide(){if(!SL.length||done)return;si=(si+1)%SL.length;const x=SL[si],e=document.createElement('div');e.style.backgroundImage=x.u;e.style.setProperty('--x0',R());e.style.setProperty('--y0',R());e.style.setProperty('--x1',R());e.style.setProperty('--y1',R());
 bg.appendChild(e);void e.offsetWidth;e.classList.add('kb','on');const old=[...bg.children].filter(c=>c!==e);setTimeout(()=>old.forEach(c=>c.remove()),1800);
 cap.classList.remove('on');setTimeout(()=>{cap.innerHTML=x.n?'<b>'+x.n+'</b>NOW SHOWING':'';cap.classList.toggle('on',!!x.n)},500);
 [...tk.children].forEach((t,k)=>t.classList.toggle('on',k===si));slT=setTimeout(slide,6500)}
d.querySelector('.st').textContent='VERSION '+(P.VERSION||'0.01');
/* everything that would otherwise load later (the Track Mode circuit shots and the rally stage renders) is made now, behind the boot
   screen with a progress bar; the title comes in when it is done */
window.PT8_BOOT=new Promise(res=>{const run=()=>setTimeout(async()=>{try{const BP=window.PT8_BP||(()=>{});
  const jobs=[];const isC=i=>typeof D!=='undefined'&&D[i]&&D[i].cartoon;for(const i of(P.TRK_TRACKS||[]))if(isC(i)&&P.trackShot)jobs.push([D[i].name,()=>P.trackShot(i)]);
  for(const i of(P.STAGES||[]))if(P.stageRender&&typeof D!=='undefined'&&D[i])jobs.push([D[i].name,()=>P.stageRender(i)]);
  BP(.5);for(let k=0;k<jobs.length;k++){await Promise.race([jobs[k][1]().catch(()=>null),new Promise(r=>setTimeout(r,120000))]);BP(.5+.5*(k+1)/jobs.length)}
 }catch(e){console.error('boot warm-up',e)}res()},400);if(document.readyState==='complete')run();else addEventListener('load',run)});
window.PT8_BOOT.then(()=>{P.bootDone=1});window.PT8_BOOT.then(()=>setTimeout(()=>{d.classList.add('on');if(!BT)slide()},400));
let done=false;
function go(e){if(done||!P.bootDone)return;done=true;const bt=document.getElementById('ptBoot');if(bt){bt.style.opacity=0;setTimeout(()=>bt.remove(),1050)}if(e){try{e.preventDefault();e.stopImmediatePropagation()}catch(x){}}
 try{P.audioReady&&P.audioReady();P.sfx&&P.sfx('select')}catch(x){}
 clearTimeout(slT);d.classList.add('out');document.body.classList.remove('ptTitle');setTimeout(()=>d.remove(),1100);for(const ev of EV)removeEventListener(ev,go,true);clearInterval(gp)}
const EV=['keydown','pointerdown','mousedown','touchstart','click'];for(const ev of EV)addEventListener(ev,go,true);
/* game pads count as buttons too */
const gp=setInterval(()=>{try{for(const g of(navigator.getGamepads?navigator.getGamepads():[]))if(g&&g.buttons.some(b=>b.pressed))go()}catch(x){}},150);
})();
