/* ===== Poly Tourismo v9 layer: audio (smooth engine synth, tire squeal, full SFX set) ===== */
(function v9audio(){
'use strict';
const P=window.PT8;let AC=null,MG=null,NB=null;
const O=()=>window.PTO||{master:.7,sfx:.65,engine:.55};
const vol=()=>O().master*O().sfx;
function ctx(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;AC=new C();const cp=AC.createDynamicsCompressor();cp.threshold.value=-16;cp.knee.value=12;cp.ratio.value=5;MG=AC.createGain();MG.gain.value=.9;MG.connect(cp);cp.connect(AC.destination);
  const n=AC.sampleRate*2|0;NB=AC.createBuffer(1,n,AC.sampleRate);const a=NB.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.0526;a[i]=(b0+b1+b2+w*.1848)*.22}}
 if(AC.state==='suspended')AC.resume();return AC}
const on=()=>!MUTE;
/* one blip: freq sweep f0->f1 over d seconds */
function tone(f0,f1,d,ty,v,dl){if(!on())return;try{const a=ctx(),t=a.currentTime+(dl||0),o=a.createOscillator(),g=a.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
 const pk=.16*(v==null?1:v)*vol();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+.004);g.gain.exponentialRampToValueAtTime(.0004,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d+.02)}catch(e){}}
function hiss(d,v,f0,f1,q,type,dl){if(!on())return;try{const a=ctx(),t=a.currentTime+(dl||0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;s.loop=true;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5*v*vol(),t+.01);g.gain.exponentialRampToValueAtTime(.0004,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t,Math.random());s.stop(t+d+.03)}catch(e){}}
/* replacements for the old globals (so v6/v7 code keeps working, but smoothed) */
beep=(f,d,ty,v)=>tone(f,f*.6,Math.max(.03,d),ty||'square',(v||1)*.8);
noise=(d,v,lp)=>{hiss(Math.max(.06,d),Math.min(1.4,v*1.2),lp||900,Math.max(80,(lp||900)*.25),.5,'lowpass');if(d>=.1&&v>=.2)tone(95,38,Math.min(.35,d*.7),'sine',Math.min(1.4,v*1.6))};
const SFX={
 hover:()=>tone(1500,1400,.022,'square',.09),
 click:()=>{tone(880,520,.05,'square',.32);tone(1320,900,.03,'triangle',.12)},
 back:()=>{tone(520,260,.08,'square',.3)},
 move:()=>tone(1000,820,.03,'square',.16),
 ok:()=>{tone(660,660,.07,'square',.28);tone(990,990,.1,'square',.26,.07)},
 err:()=>{tone(170,110,.16,'sawtooth',.4)},
 whoosh:()=>hiss(.22,.22,500,2600,.7,'bandpass'),
 pause:()=>{tone(700,420,.1,'triangle',.4)},
 resume:()=>{tone(420,780,.1,'triangle',.4)},
 buy:()=>{[880,1108,1318,1760].forEach((f,i)=>tone(f,f,.16,'triangle',.5,i*.07));hiss(.12,.1,6000,3000,1,'highpass',.2)},
 select:()=>{tone(740,740,.06,'triangle',.45);tone(1110,1110,.1,'triangle',.4,.06)},
 tick:()=>tone(720,700,.1,'square',.5),
 go:()=>{tone(1200,1200,.45,'square',.5);tone(600,600,.45,'sawtooth',.2)},
 up:()=>{tone(260,150,.07,'square',.3);hiss(.14,.22,1800,700,1.2,'bandpass',.02)},
 dn:()=>{tone(150,100,.1,'sawtooth',.3);tone(110,200,.06,'triangle',.18,.04)},
 lap:()=>{tone(1000,1000,.08,'triangle',.5);tone(1500,1500,.18,'triangle',.5,.09)},
 fin:()=>{[784,988,1175,1568].forEach((f,i)=>tone(f,f,.22,'triangle',.55,i*.1))},
 near:()=>{hiss(.2,.28,700,3000,.9,'bandpass');tone(900,1500,.08,'square',.14)},
 combo:(n)=>tone(700+Math.min(12,n||1)*70,1000+Math.min(12,n||1)*70,.09,'triangle',.4),
 crash:()=>{noise(.5,.8,1000);tone(120,40,.4,'sawtooth',.6)},
 hit:(k)=>{const v=Math.min(1,k||.5);hiss(.18,.5*v,1400,400,.6,'lowpass');tone(110,45,.2,'sine',1.1*v)},
 scrape:()=>hiss(.12,.2,3200,2200,2,'bandpass'),
 land:(k)=>{tone(90,40,.18,'sine',Math.min(1.2,(k||.6)));hiss(.12,.25*(k||.6),900,300,.5,'lowpass')},
 medal:()=>{[659,830,988,1318].forEach((f,i)=>tone(f,f,.28,'triangle',.5,i*.12))},
 promo:()=>{[523,659,784,1046,1318].forEach((f,i)=>tone(f,f,.3,'triangle',.5,i*.1))},
 start:()=>{tone(60,140,.45,'sawtooth',.5);hiss(.3,.2,300,900,.6,'lowpass')},
 type:()=>tone(1800,1700,.015,'square',.08)
};
P.sfx=(n,a)=>{const f=SFX[n];if(f)f(a)};window.sfx=P.sfx;

/* ---------- engine: two oscillators through a lowpass, smoothed; separate squeal ---------- */
const eng=[];
/* per-car engine voices: oscillator stack [type, ratio, gain, whine?], filter, lumpy-idle LFO */
const EP={
 v8:{w:[['sawtooth',1,.5],['square',.5,.34],['triangle',2.01,.3]],f0:34,f1:150,c0:380,c1:1500,q:2.6,lf:.30,lr:[9,32]},
 v8t:{w:[['sawtooth',1,.5],['square',.5,.3],['triangle',2.01,.26],['sine',5,.16,1]],f0:36,f1:160,c0:400,c1:1700,q:2.4,lf:.22,lr:[10,34]},
 v8h:{w:[['sawtooth',1,.5],['square',.5,.26],['triangle',2.01,.22],['sine',6,.3,1]],f0:38,f1:170,c0:420,c1:1900,q:2.2,lf:.15,lr:[10,36]},
 v10:{w:[['sawtooth',1,.46],['sawtooth',1.008,.34],['triangle',2.02,.3]],f0:52,f1:215,c0:520,c1:2400,q:2.0,lf:.13,lr:[16,52]},
 v12:{w:[['sawtooth',1,.4],['triangle',2,.34],['sine',3,.22],['sawtooth',.5,.2]],f0:58,f1:245,c0:620,c1:2800,q:1.4,lf:.05,lr:[20,60]},
 i4t:{w:[['square',1,.4],['sawtooth',.5,.34],['sine',4.5,.15,1]],f0:46,f1:150,c0:360,c1:1300,q:2.8,lf:.26,lr:[12,30]},
 i6:{w:[['sawtooth',1,.46],['triangle',.5,.4],['triangle',2,.2]],f0:40,f1:140,c0:340,c1:1250,q:2.0,lf:.08,lr:[12,28]},
 v6t:{w:[['sawtooth',1,.46],['square',1.5,.2],['triangle',.5,.3],['sine',5.5,.16,1]],f0:48,f1:185,c0:420,c1:1800,q:2.4,lf:.16,lr:[12,34]},
 v6h:{w:[['sawtooth',1,.42],['triangle',2,.28],['sine',4,.34,1],['sine',8,.12,1]],f0:50,f1:200,c0:440,c1:2000,q:2.0,lf:.1,lr:[12,34]},
 f6:{w:[['sawtooth',1,.44],['square',1.5,.22],['triangle',.5,.3],['sawtooth',3,.12]],f0:46,f1:195,c0:460,c1:2200,q:3.0,lf:.2,lr:[14,40]}
};
const EPID={lr:'i6',ford:'i4t',merc:'v8',ster:'v10',art:'v6h',ferr:'v12',zen:'v8t',must:'v8',urus:'v8t',m8:'v8t',amg:'v8t',gtr:'v6t',por:'f6',p1:'v8h'};
const profOf=car=>EP[EPID[car.id]||'v8'];
function mkEng(car){const a=ctx(),pr=profOf(car),e={id:car.id,pr,os:[]};
 e.f=a.createBiquadFilter();e.f.type='lowpass';e.f.Q.value=pr.q;e.am=a.createGain();e.am.gain.value=1;e.g=a.createGain();e.g.gain.value=0;
 e.f.connect(e.am);e.am.connect(e.g);e.g.connect(MG);
 pr.w.forEach(w=>{const o=a.createOscillator(),g=a.createGain();o.type=w[0];g.gain.value=w[3]?0:w[2];o.connect(g);g.connect(e.f);o.start();e.os.push({o,g,w})});
 e.lfo=a.createOscillator();e.lfo.type='sine';e.lfo.frequency.value=pr.lr[0];e.ld=a.createGain();e.ld.gain.value=pr.lf*.5;e.lfo.connect(e.ld);e.ld.connect(e.am.gain);e.lfo.start();
 e.sq=a.createBufferSource();e.sq.buffer=NB;e.sq.loop=true;e.sf=a.createBiquadFilter();e.sf.type='bandpass';e.sf.frequency.value=1900;e.sf.Q.value=7;e.sg=a.createGain();e.sg.gain.value=0;e.sq.connect(e.sf);e.sf.connect(e.sg);e.sg.connect(MG);e.sq.start();
 e.rpm=.2;e.last={gear:0,nm:0,combo:0,crash:0,lap:0,vy:0,fin:0,drift:0};return e}
function killEng(e){try{e.os.forEach(x=>{x.o.stop();x.o.disconnect()});e.lfo.stop();e.sq.stop();e.g.disconnect();e.sg.disconnect()}catch(er){}}
function tick(c,i){if(!on()){return}
 try{ctx();let e=eng[i];const car0=c.cs||P.BYID.merc;if(e&&e.id!==car0.id){const old=e;eng[i]=null;killEng(old);e=null}if(!e)e=eng[i]=mkEng(car0);const a=AC,t=a.currentTime,live=RACE&&scr==='game'&&!paused;
 const car=c.cs||P.BYID.merc,gi=c.gear|0,ceil=Math.max(8,car.top*P.GT(car)[Math.min(gi,P.GT(car).length-1)].top*.92),r=Math.min(1.05,c.sp/ceil),th=c.in?c.in.th:0;
 const rpm=Math.max(.14,Math.min(1,.14+r*.86+(c.shiftT>0?-.18:0)+th*.04));e.rpm+=(rpm-e.rpm)*.35;
 const pr=e.pr,base=pr.f0+e.rpm*(pr.f1-pr.f0);
 e.os.forEach(x=>{x.o.frequency.setTargetAtTime(base*x.w[1],t,.04);if(x.w[3])x.g.gain.setTargetAtTime(x.w[2]*Math.pow(e.rpm,2)*(.4+th*.6),t,.06)});
 e.lfo.frequency.setTargetAtTime(pr.lr[0]+e.rpm*(pr.lr[1]-pr.lr[0]),t,.05);e.ld.gain.setTargetAtTime(pr.lf*.5*(1-th*.45),t,.06);
 e.f.frequency.setTargetAtTime(pr.c0+e.rpm*(pr.c1-pr.c0)+th*600,t,.05);
 const ev=live?(.05+th*.06+e.rpm*.03)*O().master*O().engine*2.2:0;e.g.gain.setTargetAtTime(ev,t,.06);
 /* squeal: only when truly sliding */
 const slide=Math.abs(wr(Math.atan2(c.vx,c.vz)-c.yaw)),sq=live&&c.sp>14&&c.onRoad!==false&&!c.exp?Math.max(0,Math.min(1,(slide-.2)*2.2))*Math.min(1,(c.sp-12)/20):0;
 e.sg.gain.setTargetAtTime(sq*.14*vol(),t,.05);e.sf.frequency.setTargetAtTime(1500+Math.min(1,c.sp/40)*900+slide*400,t,.08);
 /* event sfx from state changes */
 const L=e.last;if(live){
  if(c.nm>L.nm)SFX.near();if(c.combo>L.combo&&c.combo>1)SFX.combo(c.combo);if(c.crashes>L.crash)SFX.crash();
  if(c.lapT&&c.lapT.length>L.lap&&!c.fin)SFX.lap();if(c.fin&&!L.fin)SFX.fin();
  if(L.vy<-7&&c.vy>L.vy+4)SFX.land(Math.min(1.2,-L.vy/18));}
 L.nm=c.nm||0;L.combo=c.combo||0;L.crash=c.crashes||0;L.lap=c.lapT?c.lapT.length:0;L.fin=c.fin?1:0;L.vy=c.vy||0}catch(er){}}
engineSnd=(c,i)=>{if(c.human)tick(c,i)};
stopEng=()=>{eng.forEach(e=>{if(!e)return;try{const t=AC.currentTime;e.g.gain.setTargetAtTime(0,t,.03);e.sg.gain.setTargetAtTime(0,t,.03)}catch(er){}})};

/* ---------- UI sounds: every hover / click in the menus ---------- */
const HOV='button,.card,.trk,.ci,.ev,.rk,.swb,.seg button,#pause .b button,.menuActions button,.mrow';
let lastH=null;
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest(HOV);if(t&&t!==lastH){lastH=t;if(!t.disabled&&!t.classList.contains('off'))SFX.hover()}else if(!t)lastH=null},true);
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(HOV);if(!t)return;ctx();if(t.disabled||t.classList.contains('off')){SFX.err();return}
 if(t.dataset&&t.dataset.a==='back')SFX.back();else if(t.classList.contains('go'))SFX.ok();else if(t.id==='shAct'||t.id==='evGo')return;else SFX.click()},true);
addEventListener('keydown',e=>{if(e.repeat)return;if(scr==='game'||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Enter','Escape','Space'].includes(e.code))return;if(e.code==='Escape')SFX.back();else if(e.code==='Enter'||e.code==='Space')SFX.ok();else SFX.move()});
P.audioReady=ctx;P.aud={ctx,mg:()=>MG,nb:()=>NB,on,vol,tone,hiss};
})();
