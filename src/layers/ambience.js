/* ===== Poly Tourismo v9 layer: ambience (wind, tyre rumble, per-map beds, wildlife, crowds) ===== */
(function v9amb(){
'use strict';
const P=window.PT8;let A=null;
const O=()=>window.PTO||{master:.7,sfx:.65,engine:.55};
/* what each map sounds like: wind amount, bed (looped noise colour), one-shot events */
const PROF={
 'Quarry Circuit':{wind:.5,bed:['machine',.5],ev:['clank']},
 'Canyon Viaduct':{wind:.9,bed:['gust',.5],ev:['eagle']},
 'Alpine Pass':{wind:1,bed:['gust',.6],ev:['bell','eagle']},
 'Afterhours Loop':{wind:.35,bed:['city',.7],ev:['siren','horn']},
 'Pinewood Stage':{wind:.55,bed:['leaves',.5],ev:['bird','bird','woodpecker']},
 'Redrock Stage':{wind:1,bed:['gust',.7],ev:['eagle','cricket']},
 'Highmoor Stage':{wind:1.1,bed:['gust',.8],ev:['curlew','bell']},
 'Coastal Run':{wind:.8,bed:['sea',.9],ev:['gull','gull','bell']},
 'Grand Valley':{wind:.7,bed:['leaves',.5],ev:['gull','bird','bird']},
 'Frostline Stage':{wind:1.1,bed:['gust',.7],ev:['creak','bird']},
 'Mangrove Ford':{wind:.3,bed:['stream',.7],ev:['frog','frog','bird','gull']},
 'Terrace Run':{wind:.5,bed:['leaves',.35],ev:['cricket','bell','bird']},
 'Ashfall Stage':{wind:1.2,bed:['rumbleBed',.8],ev:['rumble','crow','creak']},
 'Autumn Ridge':{wind:.7,bed:['leaves',.6],ev:['crow','woodpecker','bird']}};
P.AMBPROF=PROF;
function init(){if(A)return A;const ac=P.audioReady&&P.audioReady(),nb=P.aud&&P.aud.nb();if(!ac||!nb)return null;
 const mg=P.aud.mg();A={ac,nb,bus:ac.createGain(),g:{}};A.bus.gain.value=0;A.bus.connect(mg);
 const src=(type,f,q,name,pan)=>{const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ac.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(A.bus);s.start(0,Math.random()*1.5);A.g[name]={g,f:fl};return A.g[name]};
 src('bandpass',500,.5,'wind');src('lowpass',170,.7,'roll');src('bandpass',2100,.8,'crunch');src('lowpass',420,.4,'bed');src('bandpass',900,.55,'crowd');src('lowpass',90,.6,'tun');
 /* slow LFO for gusts / swell on the bed */
 A.lfo=ac.createOscillator();A.lfo.frequency.value=.11;A.lg=ac.createGain();A.lg.gain.value=0;A.lfo.connect(A.lg);A.lg.connect(A.g.bed.g.gain);A.lfo.start();
 A.hum=ac.createOscillator();A.hum.type='sawtooth';A.hum.frequency.value=50;const hf=ac.createBiquadFilter();hf.type='lowpass';hf.frequency.value=160;A.hg=ac.createGain();A.hg.gain.value=0;A.hum.connect(hf);hf.connect(A.hg);A.hg.connect(A.bus);A.hum.start();
 return A}
/* one-shot voice helpers (all routed through the ambience bus) */
function osc(t0,f0,f1,d,type,v,pan,lp){const ac=A.ac,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t0+d);
 g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(v,t0+Math.min(.02,d/4));g.gain.exponentialRampToValueAtTime(.0003,t0+d);let n=o;
 if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);let out=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}out.connect(A.bus);o.start(t0);o.stop(t0+d+.05)}
function burst(t0,f,q,d,v,pan,f1){const ac=A.ac,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=A.nb;fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f,t0);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t0+d);
 g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(v,t0+.03);g.gain.exponentialRampToValueAtTime(.0003,t0+d);s.connect(fl);fl.connect(g);let out=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}out.connect(A.bus);s.start(t0,Math.random());s.stop(t0+d+.05)}
const EV={
 gull(t,p){const n=2+Math.random()*3|0;for(let i=0;i<n;i++){osc(t+i*.34,1900+Math.random()*300,1250,.26,'triangle',.5,p,3800)}},
 bird(t,p){const n=3+Math.random()*4|0,b=2600+Math.random()*1800;for(let i=0;i<n;i++)osc(t+i*.11,b*(1+.15*Math.random()),b*1.25,.07,'sine',.35,p)},
 woodpecker(t,p){for(let i=0;i<9;i++)burst(t+i*.065,1500,3,.03,.45,p)},
 cricket(t,p){for(let i=0;i<14;i++)osc(t+i*.045,4300,4300,.025,'sine',.18,p)},
 curlew(t,p){osc(t,900,1900,.7,'sine',.35,p);osc(t+.75,1900,1000,.5,'sine',.3,p)},
 eagle(t,p){burst(t,2400,3,.9,.4,p,1500);osc(t,2300,1500,.9,'triangle',.18,p,3500)},
 bell(t,p){[0,.28].forEach((d,i)=>{osc(t+d,i?560:700,i?560:700,1.1,'sine',.3,p);osc(t+d,i?1120:1400,i?1120:1400,.5,'sine',.1,p)})},
 horn(t,p){osc(t,118,112,1.7,'sawtooth',.25,p,400);osc(t,236,224,1.7,'square',.06,p,500)},
 siren(t,p){for(let i=0;i<4;i++)osc(t+i*.55,i%2?640:880,i%2?640:880,.55,'sine',.12,p,1500)},
 clank(t,p){burst(t,900,6,.18,.5,p);osc(t,330,300,.4,'triangle',.25,p,1400)},
 beeper(){},
 creak(t,p){osc(t,150,95,1.2,'sawtooth',.1,p,380)},
 frog(t,p){const n=2+Math.random()*3|0;for(let i=0;i<n;i++)osc(t+i*.17,300,190,.12,'square',.1,p,800)},
 crow(t,p){const n=2+Math.random()*2|0;for(let i=0;i<n;i++)osc(t+i*.34,720,470,.22,'sawtooth',.16,p,1900)},
 rumble(t,p){burst(t,80,1.2,2.4,.8,p,38);osc(t,52,34,2.2,'sine',.45,p)}};
P.AMBEV=EV;
const BEDS={sea:{f:520,q:.4,lfo:.1,depth:.55},gust:{f:380,q:.5,lfo:.07,depth:.8},machine:{f:140,q:.9,lfo:.4,depth:.25},city:{f:260,q:.5,lfo:.05,depth:.2},leaves:{f:1900,q:.6,lfo:.12,depth:.5},stream:{f:1300,q:.5,lfo:.2,depth:.4},rumbleBed:{f:110,q:.7,lfo:.05,depth:.5}};
P.AMBBEDS=BEDS;
let prof=null,nextEv=3,tun=0,crowdT=0;
const lastP=P.launch;
P.launch=cfg=>{lastP(cfg);const Rc=RACE;if(!Rc)return;prof=PROF[Rc.T.d.name]||{wind:.6,bed:['gust',.4],ev:[]};nextEv=2+Math.random()*4;
 if(init()){const b=BEDS[prof.bed[0]]||BEDS.gust;A.g.bed.f.frequency.value=b.f;A.g.bed.f.Q.value=b.q;A.lfo.frequency.value=b.lfo;A.hgT=prof.bed[0]==='city'?1:0}};
const st0=step;
step=dt=>{st0(dt);if(!A||!prof)return;const Rc=RACE;if(!Rc||!Rc.cars)return;
 const ac=A.ac,t=ac.currentTime,live=!MUTE&&scr==='game'&&!paused&&Rc.state!=='done'&&P.aud.on();
 const hs=Rc.cars.filter(c=>c.human);if(!live||!hs.length){A.bus.gain.setTargetAtTime(0,t,.15);return}
 const v=O().master*O().sfx*1.6;A.bus.gain.setTargetAtTime(v,t,.3);
 let sp=0,tn=0,off=0,airb=0,cr=0;const T=Rc.T,g=!!T.d.gravel,cp=Rc.scene.userData.crowd||[];
 for(const c of hs){sp=Math.max(sp,c.sp||0);if(T.tn&&T.tn[c.idx|0])tn=1;off=Math.max(off,c.off||0);if(c.air)airb=1;
  for(const q of cp){const dd=Math.hypot(q[0]-c.x,q[1]-c.z);if(dd<80)cr=Math.max(cr,1-dd/80)}}
 /* start-line roar: strongest on the grid and the first seconds */
 if(Rc.t<7)cr=Math.max(cr,Math.min(1,(7-Rc.t)/4)*.9);
 const u=Math.min(1,sp/65),G=A.g,S=(n,val,tc)=>G[n].g.gain.setTargetAtTime(val,t,tc||.12);
 S('wind',0);G.wind.f.frequency.setTargetAtTime(320+u*900,t,.2);
 const surf=(g||off>.5)?1:0;S('roll',(.025+u*.085)*(airb?0:1)*(surf?.7:1)*(tn?1.3:1));
 S('crunch',airb?0:u*(surf?.17+off*.1:.015),.1);G.crunch.f.frequency.setTargetAtTime(1500+u*1400,t,.2);
 const bd=prof.bed[1],bi=BEDS[prof.bed[0]]||BEDS.gust;S('bed',0,.4);A.lg.gain.setTargetAtTime(0,t,.5);
 S('tun',0,.2);A.hg.gain.setTargetAtTime(0,t,.5);
 S('crowd',0,.35);G.crowd.f.frequency.setTargetAtTime(750+cr*500+Math.sin(Rc.t*1.7)*140,t,.3);
 nextEv-=dt;if(false&&nextEv<=0&&prof.ev.length){nextEv=6+Math.random()*12;const k=prof.ev[Math.random()*prof.ev.length|0];if(!tn)EV[k](t+.05,(Math.random()*2-1)*.8)}};
/* menus & pause: let the beds die away */
P.ambDbg={A:()=>A,EV,prof:()=>prof};
document.addEventListener('visibilitychange',()=>{if(A&&document.hidden)A.bus.gain.value=0});
})();
