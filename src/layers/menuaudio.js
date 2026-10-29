/* ===== Poly GT layer: menu audio (shuffled music, garage / Brand Central tracks, now-playing popup, faint wind) + a three-beeps-then-one-high countdown ===== */
(function menuAudio(){
'use strict';
const P=window.PT8;let M=null;
const O=()=>window.PTO||{master:.7,sfx:.65,engine:.55};
/* tracks are embedded as base64 <script type="text/plain" id="mus_*"> blocks and decoded the first time they are needed */
const TR={baby:['Baby So Free','mus_baby'],supreme:['Supreme Moment','mus_supreme'],space:['Space','mus_space'],glass:['Glasstress','mus_glass'],body:['Body And Mind','mus_body'],nocomm:['No Communication No Love','mus_nocomm'],lizzie:["Lizzie's Balloon",'mus_lizzie'],
 cafe:['Café de Flore','mus_cafe'],adore:['Adore','mus_adore'],girl:['All About The Girl','mus_girl'],vision:['Vision','mus_vision'],fruit:['Forbidden Fruit','mus_fruit'],hippos:['Sixtyfour Hippos','mus_hippos']};
const MENU=['baby','supreme','space','glass','nocomm','lizzie','cafe','adore','girl','vision','fruit','hippos'],urls={};
function urlOf(k){if(urls[k])return urls[k];const e=document.getElementById(TR[k][1]);if(!e)return null;const b=atob(e.textContent.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return urls[k]=URL.createObjectURL(new Blob([u],{type:'audio/mpeg'}))}
let deck=[],menuKey=null,pop=null,popT=0,shown='',blockedUntilGesture=false;const AU={};
const has=k=>!!document.getElementById(TR[k][1]);
function shuffle(last){deck=MENU.filter(has);for(let i=deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]]}if(deck[0]===last&&deck.length>1)deck.push(deck.shift())}
function popup(k){try{if(scr!=='menu')return;/* only on the main menu (the music itself keeps playing everywhere) */const txt=TR[k][0];
 /* now playing, PS3 style: a soft translucent plate under the top bar on the right, a music-note disc, the song in white and
    "Now Playing" under it; it glides in, waits, and fades away */
 if(!pop){pop=document.createElement('div');pop.id='ptNowPlaying';document.body.appendChild(pop);const st=document.createElement('style');st.textContent=
  '#ptNowPlaying{position:fixed;right:24px;top:82px;z-index:99999;pointer-events:none;display:flex;align-items:center;gap:12px;min-width:220px;max-width:340px;padding:10px 18px 10px 10px;border-radius:8px!important;'
  +'background:linear-gradient(180deg,rgba(70,76,84,.62) 0%,rgba(30,33,37,.72) 50%,rgba(14,15,18,.78) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(255,255,255,.08),0 8px 26px rgba(0,0,0,.45);'
  +'-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#fff;font-family:var(--gt,sans-serif);opacity:0;transform:translateX(24px);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.8,.2,1)}'
  +'#ptNowPlaying .d{flex:none;width:38px;height:38px;border-radius:50%!important;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#7d8a95,#2b3239 70%);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.5)}'
  +'#ptNowPlaying .d svg{width:18px;height:18px}#ptNowPlaying.on .d{animation:ptNpS 2.4s ease-in-out infinite}'
  +'#ptNowPlaying b{display:block;font-weight:400;font-size:14px;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.6)}'
  +'#ptNowPlaying small{display:block;margin-top:3px;font-size:10px;letter-spacing:.06em;color:#b8c1c8}'
  +'#ptNowPlaying .eq{display:flex;gap:2px;align-items:flex-end;height:12px;margin-left:auto;padding-left:8px}#ptNowPlaying .eq i{width:2px;background:#e9ecef;border-radius:1px!important;animation:ptNpE 1s ease-in-out infinite}'
  +'#ptNowPlaying .eq i:nth-child(2){animation-delay:-.4s}#ptNowPlaying .eq i:nth-child(3){animation-delay:-.7s}'
  +'@keyframes ptNpE{0%,100%{height:3px}50%{height:12px}}@keyframes ptNpS{0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.5)}50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 0 12px rgba(255,255,255,.25)}}';document.head.appendChild(st)}
 clearTimeout(popT);const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
 pop.innerHTML='<div class="d"><svg viewBox="0 0 24 24" fill="#fff"><path d="M9 17.5V6l10-2v11.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="6.8" cy="17.6" r="2.4"/><circle cx="16.8" cy="15.6" r="2.4"/></svg></div><div style="min-width:0"><b>'+esc(txt)+'</b><small>Now Playing</small></div><div class="eq"><i></i><i></i><i></i></div>';
 pop.classList.add('on');requestAnimationFrame(()=>{pop.style.opacity=1;pop.style.transform='none'});popT=setTimeout(()=>{pop.style.opacity=0;pop.style.transform='translateX(24px)';pop.classList.remove('on')},5500)}catch(e){}}
/* one Audio element per track; paused (never dropped) when the screen changes, so a song always plays out to its end */
function el(k,loop){let a=AU[k];if(a)return a;const u=urlOf(k);if(!u)return null;a=AU[k]=new Audio(u);a.loop=!!loop;a.preload='auto';a._v=0;a._k=k;a._ann=false;a._t=0;
 if(!loop)a.addEventListener('ended',()=>{delete AU[k];if(menuKey===k)menuKey=null});return a}
function wanted(){/* 0.02: silent while loading; the music starts when the title says PRESS ANY BUTTON */if(!P.bootDone)return null;if(scr==='game')return(typeof RACE!=='undefined'&&RACE&&RACE.mode==='free')?'menu':null;if(scr==='s8show'){const kd=P.SR&&P.SR.kind;return kd==='brand'?'menu':(P.SR&&(P.SR.rally||P.SR.trk))?'menu':(has('body')?'body':'menu')}return'menu'}
function tick(){if(pop&&scr!=='menu'&&pop.style.opacity!=='0'){clearTimeout(popT);pop.style.opacity=0;pop.style.transform='translateX(24px)'}const on=P.aud&&P.aud.on()&&!document.hidden,w=on?wanted():null,t=O().master;let key=null;
 if(w==='menu'){if(!menuKey){if(!deck.length)shuffle(null);menuKey=deck.shift()}key=menuKey}else if(w==='body'||w==='cafe')key=w;
 for(const k in AU){const a=AU[k];if(k!==key){a._v+=(0-a._v)*.22;a.volume=Math.max(0,Math.min(1,a._v));if(a._v<.01&&!a.paused)a.pause()}}
 if(!key)return;const a=el(key,key==='body'||key==='cafe');if(!a)return;
 a._v+=(Math.min(1,t)*(scr==='game'?.4:1)*(performance.now()<(P.duckUntil||0)?.45:1)-a._v)*(performance.now()<(P.duckUntil||0)?.5:.12);/* dips under the menu sound effects */a.volume=Math.max(0,Math.min(1,a._v));
 if(a.paused&&!blockedUntilGesture&&!a._pend){a._pend=1;a.play().then(()=>{a._pend=0;hint(false);if(!a._ann){a._ann=true;popup(key)}}).catch(()=>{a._pend=0;blockedUntilGesture=true;hint(true)})}}
P.npShow=popup;setInterval(tick,200);
/* browsers refuse sound until the first click or key press, so start inside that very event and show a small hint until then */
let hnt=null;function hint(on){try{if(!hnt){hnt=document.createElement('div');hnt.textContent='CLICK OR PRESS ANY KEY FOR MUSIC';hnt.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:14px;white-space:nowrap;z-index:99999;pointer-events:none;color:#eef1ef;font:600 10px/1 system-ui,sans-serif;letter-spacing:.28em;opacity:0;transition:opacity .6s;text-shadow:0 1px 8px #000a';document.body.appendChild(hnt)}hnt.style.opacity=on&&scr!=='game'&&!document.getElementById('ptTitle')?.7:0}catch(e){}}
const gest=()=>{blockedUntilGesture=false;tick()};for(const ev of['pointerdown','mousedown','keydown','touchstart','click'])addEventListener(ev,gest,true);
tick();
/* a faint wind under the menus */
function init(){if(M)return M;const ac=P.audioReady&&P.audioReady(),nb=P.aud&&P.aud.nb();if(!ac||!nb)return null;
 const wg=ac.createGain();wg.gain.value=0;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=380;wf.Q.value=.45;const ws=ac.createBufferSource();ws.buffer=nb;ws.loop=true;ws.connect(wf);wf.connect(wg);wg.connect(P.aud.mg());ws.start();
 const lfo=ac.createOscillator();lfo.frequency.value=.07;const lg=ac.createGain();lg.gain.value=.01;lfo.connect(lg);lg.connect(wg.gain);lfo.start();M={ac,wg};return M}
setInterval(()=>{const m=init();if(!m)return;const on=!!P.bootDone&&scr!=='game'&&P.aud.on()&&!document.hidden;m.wg.gain.setTargetAtTime(on?.03*O().master:0,m.ac.currentTime,on?1.2:.3)},500);
const wake=()=>{try{P.audioReady&&P.audioReady()}catch(e){}};addEventListener('pointerdown',wake,true);addEventListener('keydown',wake,true);
/* countdown: the supplied clip (beeps land at .24 / 1.23 / 2.23 s, the long GO at 3.20 s); the three-then-one synth is the fallback until it has decoded */
const S=P.aud,AT=[.24,1.23,2.23,3.2];P.cdTick=()=>S.tone(880,880,.16,'sine',1.1);P.cdGo=()=>{S.tone(1760,1760,.55,'sine',1.2);S.tone(880,880,.55,'sine',.35)};
let cdBuf=null,cdLoad=0;
function loadCd(){if(cdBuf||cdLoad)return;const ac=P.audioReady&&P.audioReady(),e=document.getElementById('mus_cd');if(!ac||!e)return;cdLoad=1;try{const b=atob(e.textContent.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);ac.decodeAudioData(u.buffer,x=>{cdBuf=x},()=>{cdLoad=0})}catch(er){cdLoad=0}}
setInterval(loadCd,700);
/* start the clip; returns {at:beep times, syn:true when the synth fallback must beep} and Rc-independent clock */
P.cdBegin=()=>{loadCd();const ac=P.audioReady&&P.audioReady();if(cdBuf&&ac&&P.aud.on()){const s=ac.createBufferSource(),g=ac.createGain();s.buffer=cdBuf;g.gain.value=Math.min(1.6,O().master*O().sfx*2.2);s.connect(g);g.connect(P.aud.mg());s.start();return{at:AT,syn:0,t0:performance.now()/1000}}return{at:AT,syn:1,t0:performance.now()/1000}};
/* race-start countdown, called every frame from the count state */
P.cdStep=(Rc,dt)=>{if(Rc._cdS==null){Rc._cdS=P.cdBegin();Rc._cdE=0;Rc._cdN=0}const c=Rc._cdS;Rc._cdE=performance.now()/1000-c.t0;const e=Rc._cdE;
 while(Rc._cdN<4&&e>=AT[Rc._cdN]){if(c.syn)try{(Rc._cdN<3?P.cdTick:P.cdGo)()}catch(er){}Rc._cdN++}
 Rc.cd=Math.max(.001,AT[3]-e);return{txt:e<AT[0]?'':e<AT[1]?'3':e<AT[2]?'2':e<AT[3]?'1':'GO!',go:e>=AT[3]}};
const o=P.sfx;P.sfx=window.sfx=(n,a)=>{if(n==='cdTick')return P.cdTick();if(n==='cdGo')return P.cdGo();return o(n,a)};
})();
