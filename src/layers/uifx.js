/* ===== Poly GT layer: menu sound effects from the sample set Hakan picked (UIFX*.wav, full build only; the synth sounds stay as fallback) ===== */
(function uifx(){
'use strict';
const P=window.PT8,B=window.UIFX_B64;if(!B||!P.audioOut||!P.SFX)return;
/* how loud each one plays: they go straight to the speakers (not through the game's compressor) and dip the menu music for a moment,
   so they cut through the songs */
const GAIN={select:1.6,click:1.4,back:1.4,whoosh:1.1,move:.9,start:1.7};
const buf={};let loading=null;
const load=a=>loading||(loading=Promise.all(Object.keys(B).map(k=>{const s=atob(B[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
 return new Promise(ok=>a.decodeAudioData(u.buffer,b=>{buf[k]=b;ok()},()=>ok()))})));
const play=(k,v)=>{const o=P.audioOut();if(!o)return false;load(o.a);const b=buf[k];if(!b)return false;
 try{const s=o.a.createBufferSource(),g=o.a.createGain();s.buffer=b;g.gain.value=Math.min(1,(GAIN[k]||1)*(v==null?1:v)*o.v);s.connect(g);g.connect(o.a.destination);s.start();P.duckUntil=performance.now()+b.duration*1000+(k==='move'?60:250)}catch(e){return false}return true};
const inMenu=()=>typeof scr==='undefined'||(scr!=='game'&&scr!=='pause');
/* the samples replace the synth for menu sounds; in a race (gear shifts use 'move') the synth stays */
for(const k of ['select','click','back','whoosh','move']){const f=P.SFX[k];P.SFX[k]=a=>{if(inMenu()&&play(k))return;if(f)f(a)}}
/* a rising sweep when a race is launched from the menus */
{const l0=P.launch;if(l0)P.launch=function(){if(inMenu())play('start');return l0.apply(this,arguments)}}
/* a soft tick when the pointer moves onto another menu item */
let last=null,lt=0;
document.addEventListener('mouseover',e=>{if(!inMenu())return;const t=e.target&&e.target.closest&&e.target.closest('.card,.qc,.mk,.trk,.ci,.gc,.btn,button,[data-m]');
 if(!t||t===last)return;last=t;const n=performance.now();if(n-lt<45)return;lt=n;play('move')},true);
/* decode as soon as the audio is unlocked by the first press */
const warm=()=>{const o=P.audioOut();if(o)load(o.a)};addEventListener('pointerdown',warm,{once:true,capture:true});addEventListener('keydown',warm,{once:true,capture:true});
})();
