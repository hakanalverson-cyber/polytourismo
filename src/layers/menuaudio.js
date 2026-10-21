/* ===== Poly GT layer: menu audio (calm looping music, faint wind) + a countdown in the classic three-beeps-then-one-high style ===== */
(function menuAudio(){
'use strict';
const P=window.PT8;let M=null,sch=0,nextT=0,bar=0;
const O=()=>window.PTO||{master:.7,sfx:.65,engine:.55};
/* four-chord loop, 70 bpm, one chord per bar (midi note numbers) */
const CH=[[53,57,60,64,67],[52,55,59,62,67],[50,53,57,60,64],[48,52,55,59,64]];
const BASS=[41,40,38,36],BEAT=60/70,mf=n=>440*Math.pow(2,(n-69)/12);
function init(){if(M)return M;const ac=P.audioReady&&P.audioReady(),nb=P.aud&&P.aud.nb();if(!ac||!nb)return null;
 const out=ac.createGain();out.gain.value=0;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.Q.value=.4;out.connect(lp);lp.connect(P.aud.mg());
 const wg=ac.createGain();wg.gain.value=0;const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=380;wf.Q.value=.45;const ws=ac.createBufferSource();ws.buffer=nb;ws.loop=true;ws.connect(wf);wf.connect(wg);wg.connect(P.aud.mg());ws.start();
 const lfo=ac.createOscillator();lfo.frequency.value=.07;const lg=ac.createGain();lg.gain.value=.012;lfo.connect(lg);lg.connect(wg.gain);lfo.start();
 M={ac,out,wg};return M}
function note(t,f,d,v,type,det){const ac=M.ac,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.04,d/3));g.gain.exponentialRampToValueAtTime(.0003,t+d);o.connect(g);g.connect(M.out);o.start(t);o.stop(t+d+.05)}
function playBar(t,b){const c=CH[b%4],L=BEAT*4;
 /* slow pad: two detuned triangles per chord tone */
 for(const n of c){note(t,mf(n-12),L*1.05,.016,'triangle',-6);note(t,mf(n-12),L*1.05,.016,'triangle',6)}
 /* soft sub bass on the one and the three */
 note(t,mf(BASS[b%4]),BEAT*1.8,.07,'sine');note(t+BEAT*2,mf(BASS[b%4]),BEAT*1.5,.05,'sine');
 /* gentle electric-piano arpeggio: sine plus a quiet octave */
 const pat=[0,2,4,3,2,4,1,3];for(let i=0;i<8;i++){const n=c[pat[i]]+12,tt=t+i*BEAT/2;note(tt,mf(n),BEAT*1.6,.03,'sine');note(tt,mf(n+12),BEAT*.7,.008,'sine')}}
function sched(){if(!M)return;const ac=M.ac;while(nextT<ac.currentTime+1.2){if(nextT<ac.currentTime)nextT=ac.currentTime+.05;playBar(nextT,bar++);nextT+=BEAT*4}}
const inMenu=()=>scr!=='game'&&!(typeof MUTE!=='undefined'&&MUTE);
function tick(){const m=init();if(!m)return;const ac=m.ac,t=ac.currentTime,on=inMenu()&&P.aud.on()&&!document.hidden,v=O().master;
 m.out.gain.setTargetAtTime(on?.55*v:0,t,on?1.4:.35);m.wg.gain.setTargetAtTime(on?.035*v:0,t,on?1.2:.3);
 if(on&&!sch){sch=setInterval(sched,400);nextT=ac.currentTime+.1;bar=0}
 if(!on&&sch&&m.out.gain.value<.002){clearInterval(sch);sch=0}}
setInterval(tick,500);
/* browsers only start audio after a click or key press */
const wake=()=>{try{P.audioReady&&P.audioReady();tick()}catch(e){}};addEventListener('pointerdown',wake,true);addEventListener('keydown',wake,true);
/* countdown: three even beeps, then one higher and longer for GO */
const S=P.aud;P.cdTick=()=>S.tone(880,880,.16,'sine',1.1);P.cdGo=()=>{S.tone(1760,1760,.55,'sine',1.2);S.tone(880,880,.55,'sine',.35)};
const o=P.sfx;P.sfx=window.sfx=(n,a)=>{if(n==='cdTick')return P.cdTick();if(n==='cdGo')return P.cdGo();return o(n,a)};
})();
