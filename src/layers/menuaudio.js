/* ===== Poly GT layer: menu audio (shuffled music, garage / Brand Central tracks, now-playing popup, faint wind) + a three-beeps-then-one-high countdown ===== */
(function menuAudio(){
'use strict';
const P=window.PT8;let M=null;
const O=()=>window.PTO||{master:.7,sfx:.65,engine:.55};
/* tracks are embedded as base64 <script type="text/plain" id="mus_*"> blocks and decoded the first time they are needed */
const TR={baby:['Baby So Free','mus_baby'],supreme:['Supreme Moment','mus_supreme'],space:['Space','mus_space'],glass:['Glasstress','mus_glass'],body:['Body And Mind','mus_body'],cafe:['Café de Flore','mus_cafe'],nocomm:['No Communication No Love','mus_nocomm'],lizzie:["Lizzie's Balloon",'mus_lizzie']};
const MENU=['baby','supreme','space','glass','nocomm','lizzie'],urls={};
function urlOf(k){if(urls[k])return urls[k];const e=document.getElementById(TR[k][1]);if(!e)return null;const b=atob(e.textContent.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return urls[k]=URL.createObjectURL(new Blob([u],{type:'audio/mpeg'}))}
let deck=[],cur=null,au=null,vol=0,want=null,pop=null,popT=0;
function shuffle(){deck=MENU.slice();for(let i=deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]]}if(deck[0]===cur&&deck.length>1)deck.push(deck.shift())}
function popup(k){try{if(!pop){pop=document.createElement('div');pop.style.cssText='position:fixed;right:2.2vw;bottom:3.2vh;z-index:99999;pointer-events:none;background:rgba(10,14,18,.82);border-left:3px solid #e9d9a6;padding:10px 18px 10px 14px;color:#eef1ef;font:600 13px/1.25 system-ui,sans-serif;letter-spacing:.06em;opacity:0;transform:translateX(18px);transition:opacity .5s,transform .5s;backdrop-filter:blur(4px)';document.body.appendChild(pop)}
 pop.innerHTML='<div style="font-size:10px;opacity:.6;letter-spacing:.18em;margin-bottom:3px">NOW PLAYING</div><div style="font-size:15px">'+TR[k][0].toUpperCase()+'</div>';pop.style.opacity=1;pop.style.transform='none';clearTimeout(popT);popT=setTimeout(()=>{pop.style.opacity=0;pop.style.transform='translateX(18px)'},5200)}catch(e){}}
function play(k,loop){const u=urlOf(k);if(!u)return;if(au){au.pause();au=null}au=new Audio(u);au.loop=!!loop;au.volume=0;cur=k;au.onended=()=>{if(!loop){au=null;cur=null}};au.play().catch(()=>{au=null;cur=null});popup(k)}
/* which track belongs to this screen? */
function wanted(){if(scr==='game')return null;if(document.body.classList.contains('studio')){const kd=P.SR&&P.SR.kind;return kd==='brand'?'cafe':(P.SR&&(P.SR.rally||P.SR.trk))?'menu':'body'}return'menu'}
function tick(){const on=P.aud&&P.aud.on()&&!document.hidden,w=on?wanted():null,t=O().master;
 if(w!==want){want=w;if(w&&w!=='menu'&&cur!==w){play(w,true)}else if(w==='menu'&&MENU.indexOf(cur)<0){cur=null}}
 if(w==='menu'&&!au){if(!deck.length)shuffle();play(deck.shift(),false)}
 const target=w?Math.min(1,.8*t*1.25):0;vol+=(target-vol)*(target>vol?.06:.18);if(au){au.volume=Math.max(0,Math.min(1,vol));if(!w&&vol<.01){au.pause();au=null;cur=null}}}
setInterval(tick,200);
/* a faint wind under the menus */
function init(){if(M)return M;const ac=P.audioReady&&P.audioReady(),nb=P.aud&&P.aud.nb();if(!ac||!nb)return null;
 const wg=ac.createGain();wg.gain.value=0;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=380;wf.Q.value=.45;const ws=ac.createBufferSource();ws.buffer=nb;ws.loop=true;ws.connect(wf);wf.connect(wg);wg.connect(P.aud.mg());ws.start();
 const lfo=ac.createOscillator();lfo.frequency.value=.07;const lg=ac.createGain();lg.gain.value=.01;lfo.connect(lg);lg.connect(wg.gain);lfo.start();M={ac,wg};return M}
setInterval(()=>{const m=init();if(!m)return;const on=scr!=='game'&&P.aud.on()&&!document.hidden;m.wg.gain.setTargetAtTime(on?.03*O().master:0,m.ac.currentTime,on?1.2:.3)},500);
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
