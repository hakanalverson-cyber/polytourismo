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
 boom:()=>{hiss(1,1,420,50,.5,'lowpass');tone(88,26,.9,'sine',1.7);tone(170,48,.55,'sawtooth',.5);hiss(.4,.55,3200,400,.8,'bandpass')},
 crash:()=>{noise(.5,.8,1000);tone(120,40,.4,'sawtooth',.6)},
 hit:(k)=>{const v=Math.min(1,k||.5);hiss(.18,.5*v,1400,400,.6,'lowpass');tone(110,45,.2,'sine',1.1*v)},
 scrape:()=>hiss(.12,.2,3200,2200,2,'bandpass'),
 splash:(k)=>{const v=Math.min(1,k||.6);hiss(.4,.34*v,3000,700,.7,'bandpass');hiss(.55,.24*v,1100,260,.6,'lowpass');tone(170,60,.12,'sine',.2*v)},
 land:(k)=>{tone(90,40,.18,'sine',Math.min(1.2,(k||.6)));hiss(.12,.25*(k||.6),900,300,.5,'lowpass')},
 medal:()=>{[659,830,988,1318].forEach((f,i)=>tone(f,f,.28,'triangle',.5,i*.12))},
 promo:()=>{[523,659,784,1046,1318].forEach((f,i)=>tone(f,f,.3,'triangle',.5,i*.1))},
 start:()=>{tone(60,140,.45,'sawtooth',.5);hiss(.3,.2,300,900,.6,'lowpass')},
 type:()=>tone(1800,1700,.015,'square',.08)
};
P.sfx=(n,a)=>{const f=SFX[n];if(f)f(a)};window.sfx=P.sfx;
P.audioOut=()=>{if(!on())return null;const a=ctx();return{a,g:MG,v:vol()}};P.SFX=SFX;

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
const profOf=car=>EP[EPID[car.id]||car.eng||'v8'];
/* Nov 9 ("I also want better engine noise"): the engine is no longer a stack of plain oscillators. Each car gets a recorded-style firing
   cycle built once per engine type: one 720 degree cycle holds every cylinder's exhaust pulse (a damped knock plus a burst of noise, with
   a little cycle-to-cycle jitter so it never buzzes), the cross-plane V8 fires its banks unevenly (the burble), and 24 cycles are looped.
   The loop's playback rate follows the rpm, so the pulse rate is the real firing frequency (cylinders x rpm / 120). It is then voiced like a car:
   - exhaust: a low-pass that opens with rpm and throttle, a body resonance and soft saturation that grows under load (it growls on the
     power and goes hollow off it)
   - intake: the same pulses through a band-pass an octave and more up, mostly on the throttle
   - turbo engines whistle with boost and chuff when you lift; high-revving engines crackle and pop on a lift from high rpm */
const EK={
 v8:{cyl:8,idle:800,red:6800,uneven:.32,res:95,cut:[260,2400],dr:2.6,nz:.22,int:.25},
 v8t:{cyl:8,idle:850,red:7000,uneven:.22,res:105,cut:[280,2600],dr:2.2,nz:.2,int:.22,turbo:1},
 v8h:{cyl:8,idle:950,red:8300,uneven:.1,res:130,cut:[320,3200],dr:2,nz:.16,int:.3,turbo:.6},
 v10:{cyl:10,idle:1000,red:8700,uneven:.06,res:150,cut:[360,3800],dr:1.9,nz:.14,int:.36},
 v12:{cyl:12,idle:1000,red:8900,uneven:.03,res:170,cut:[400,4200],dr:1.6,nz:.12,int:.4},
 i4t:{cyl:4,idle:850,red:7000,uneven:.04,res:120,cut:[300,2600],dr:2.2,nz:.3,int:.3,turbo:1},
 i6:{cyl:6,idle:750,red:6800,uneven:.03,res:110,cut:[300,2800],dr:1.8,nz:.18,int:.28},
 v6t:{cyl:6,idle:850,red:7000,uneven:.12,res:120,cut:[320,3000],dr:2.1,nz:.22,int:.26,turbo:1},
 v6h:{cyl:6,idle:950,red:8000,uneven:.08,res:140,cut:[340,3400],dr:1.9,nz:.18,int:.3,turbo:.7},
 f6:{cyl:6,idle:900,red:8800,uneven:.18,res:135,cut:[340,3600],dr:2.4,nz:.2,int:.34}
};
const R0=3000,CYC=24,EBUF={};
/* the firing cycle at R0 rpm (one cycle = two turns of the crank) */
function cycleBuf(a,name,k){if(EBUF[name])return EBUF[name];const sr=a.sampleRate,cl=120/R0,n=Math.round(cl*sr),N=n*CYC,b=a.createBuffer(1,N,sr),d=b.getChannelData(0);
 let seed=name.length*977+k.cyl*31;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const iv=n/k.cyl,tau=iv*.34,tn=iv*.12,fr=k.res*3/(R0*k.cyl/120);/* knock ring: about 3x the body resonance, in pulse periods */
 for(let c=0;c<CYC;c++){const amp=.88+rnd()*.24;
  for(let q=0;q<k.cyl;q++){/* uneven firing: alternate banks a little early/late and louder/softer (cross-plane burble) */
   const bank=(q*5+(q>>1))%2,off=(bank?1:-1)*k.uneven*iv*.5*(.6+rnd()*.4),A=amp*(1+(bank?1:-1)*k.uneven*.9)*(.9+rnd()*.2),st=Math.round(c*n+q*iv+off);
   for(let t=0;t<iv*1.6;t++){const x=st+t;if(x<0||x>=N)continue;const e=Math.exp(-t/tau),ph=t/iv*fr*2*Math.PI;
    d[x]+=A*(e*(Math.sin(ph)*.55+(t<iv*.18?1-t/(iv*.18):0)*.9)+Math.exp(-t/tn)*(rnd()*2-1)*k.nz*2)}}}
 let m=0;for(let x=0;x<N;x++){d[x]-=0;m=Math.max(m,Math.abs(d[x]))}for(let x=0;x<N;x++)d[x]/=m||1;
 return EBUF[name]=b}
const SAT={};function satCurve(dr){const key=dr.toFixed(2);if(SAT[key])return SAT[key];const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*dr)/Math.tanh(dr)}return SAT[key]=c}
function mkEng(car){const a=ctx(),name=EK[EPID[car.id]]?EPID[car.id]:EK[car.eng]?car.eng:'v8',k=EK[name],e={id:car.id,k,name};
 if(P.engWkLoad)P.engWkLoad(a);const w=P.engWkNode&&P.engWkNode(a,name,null);
 /* engwk.js: the modelled engine when the worklet is loaded */
 if(w){e.wk=w;e.src={stop(){w.stop()}};e.hp=a.createBiquadFilter();e.hp.type='highpass';e.hp.frequency.value=24;e.g=a.createGain();e.g.gain.value=0;w.node.connect(e.hp);e.hp.connect(e.g);e.g.connect(MG)}
 else{
 e.src=a.createBufferSource();e.src.buffer=cycleBuf(a,name,k);e.src.loop=true;
 e.ex=a.createBiquadFilter();e.ex.type='lowpass';e.ex.Q.value=.9;
 e.body=a.createBiquadFilter();e.body.type='peaking';e.body.frequency.value=k.res;e.body.Q.value=1.4;e.body.gain.value=7;
 e.sh=a.createWaveShaper();e.sh.curve=satCurve(k.dr);e.sh.oversample='2x';e.pre=a.createGain();e.pre.gain.value=.6;
 e.inF=a.createBiquadFilter();e.inF.type='bandpass';e.inF.Q.value=1.2;e.inG=a.createGain();e.inG.gain.value=0;
 e.hp=a.createBiquadFilter();e.hp.type='highpass';e.hp.frequency.value=28;
 e.g=a.createGain();e.g.gain.value=0;
 e.src.connect(e.ex);e.ex.connect(e.body);e.body.connect(e.pre);e.pre.connect(e.sh);e.sh.connect(e.hp);
 e.src.connect(e.inF);e.inF.connect(e.inG);e.inG.connect(e.hp);e.hp.connect(e.g);e.g.connect(MG);e.src.start(0,Math.random()*e.src.buffer.duration)}
 if(k.turbo){e.tb=a.createOscillator();e.tb.type='sine';e.tbG=a.createGain();e.tbG.gain.value=0;e.tb.connect(e.tbG);e.tbG.connect(MG);e.tb.start();e.boost=0}
 e.sq=a.createBufferSource();e.sq.buffer=NB;e.sq.loop=true;e.sf=a.createBiquadFilter();e.sf.type='bandpass';e.sf.frequency.value=1900;e.sf.Q.value=7;e.sg=a.createGain();e.sg.gain.value=0;e.sq.connect(e.sf);e.sf.connect(e.sg);e.sg.connect(MG);e.sq.start();
 e.os=[];e.lfo={stop(){}};e.rpm=.2;e.th=0;e.popT=0;e.last={gear:0,nm:0,combo:0,crash:0,lap:0,vy:0,fin:0,drift:0};return e}
/* lift-off: a turbo chuff, and pops from a hot exhaust */
function liftFx(e,r){const k=e.k;if(k.turbo&&e.boost>.35){hiss(.28,.16*e.boost*k.turbo,2600,700,1.4,'bandpass');/* compressor flutter: the air chattering back through the turbo */for(let j=0;j<6;j++)hiss(.035,.09*e.boost*k.turbo*(1-j/7),1100-j*80,500,1.2,'bandpass',.1+j*.055)}
 if(r>.55&&(k.cyl>=8||name6(e))){const n=2+(Math.random()*4|0);for(let i=0;i<n;i++){const dl=.05+i*(.05+Math.random()*.09);hiss(.05,.22+Math.random()*.2,700+Math.random()*900,200,.7,'lowpass',dl);tone(70+Math.random()*40,40,.05,'sine',.5,dl)}}}
const name6=e=>e.name==='f6'||e.name==='v6h';
function voice(e,c,th,live,t){const k=e.k,rpm=k.idle+e.rpm*(k.red-k.idle),rate=rpm/R0,lo=Math.min(1,th);
 const rr=(rpm-k.idle)/(k.red-k.idle);
 if(e.wk){const W=e.wk.k,wr_=W.idle+e.rpm*(W.red-W.idle);e.wk.node.port?e.wk.node.port.postMessage({rpm:wr_,load:c.shiftT>0?.03:lo,vol:1,lim:e.rpm>.975&&lo>.6?1:0,cab:c.camMode?1:0}):e.wk.set(wr_,c.shiftT>0?.03:lo,1,{lim:e.rpm>.975&&lo>.6?1:0,cab:c.camMode?1:0});e.g.gain.setTargetAtTime(live?(.5+lo*.25)*O().master*O().engine*1.6:0,t,.05)}else{
 e.src.playbackRate.setTargetAtTime(rate,t,.03);
 e.ex.frequency.setTargetAtTime(k.cut[0]+(k.cut[1]-k.cut[0])*(.25*rr+.75*rr*lo)+lo*180,t,.05);
 e.pre.gain.setTargetAtTime(.35+lo*.9+rr*.25,t,.05);
 e.inF.frequency.setTargetAtTime(500+rr*2600,t,.05);e.inG.gain.setTargetAtTime(k.int*(.12+lo*.88)*(.3+rr*.7),t,.05);
 const ev=live?(.07+lo*.07+rr*.05)*O().master*O().engine*2.1:0;e.g.gain.setTargetAtTime(ev,t,.05)}
 if(e.tb){e.boost+=((lo>.5&&rr>.25?1:0)*Math.min(1,rr*1.4)-e.boost)*(lo>.5?.04:.25);e.tb.frequency.setTargetAtTime(2400+e.boost*4200+rr*900,t,.08);e.tbG.gain.setTargetAtTime(live?e.boost*.018*k.turbo*O().master*O().engine*2:0,t,.08)}
 if(live&&e.th>.6&&th<.15&&rr>.35&&t>e.popT){e.popT=t+.6;liftFx(e,rr)}e.th=th}
function killEng(e){try{e.src.stop();if(e.tb){e.tb.stop();e.tbG.disconnect()}e.sq.stop();e.g.disconnect();e.sg.disconnect()}catch(er){}}
function tick(c,i){if(!on()){return}
 try{ctx();let e=eng[i];const car0=c.cs||P.BYID.merc;if(e&&(e.id!==car0.id||(!e.wk&&AC&&(AC._ptEng||AC._ptEngSP)&&P.engWkNode))){const old=e;eng[i]=null;killEng(old);e=null}if(!e)e=eng[i]=mkEng(car0);const a=AC,t=a.currentTime,live=RACE&&scr==='game'&&!paused;
 const car=c.cs||P.BYID.merc,gi=c.gear|0,ceil=Math.max(8,car.top*P.GT(car)[Math.min(gi,P.GT(car).length-1)].top*.92),r=Math.min(1.05,c.sp/ceil),th=c.in?c.in.th:0;
 const cnt=RACE&&RACE.state==='count'&&c.human&&!c.cool;const rpm=cnt?Math.min(1,.16+th*.72+(th>.5?Math.sin(t*38)*.03:0)):Math.max(.14,Math.min(1,.14+r*.86+(c.shiftT>0?-.18:0)+th*.04));e.rpm+=(rpm-e.rpm)*.35;
 voice(e,c,th,live,t);
 /* squeal: only when truly sliding */
 const slide=Math.abs(wr(Math.atan2(c.vx,c.vz)-c.yaw)),sq=live&&c.sp>14&&c.onRoad!==false&&!c.exp?Math.max(0,Math.min(1,(slide-.2)*2.2))*Math.min(1,(c.sp-12)/20):0;
 e.sg.gain.setTargetAtTime(sq*.14*vol(),t,.05);e.sf.frequency.setTargetAtTime(1500+Math.min(1,c.sp/40)*900+slide*400,t,.08);
 /* event sfx from state changes */
 const L=e.last;if(live){
  if(c.nm>L.nm)SFX.near();if(c.combo>L.combo&&c.combo>1)SFX.combo(c.combo);if(c.crashes>L.crash)SFX.crash();
  if(c.lapT&&c.lapT.length>L.lap&&!c.fin)SFX.lap();if(c.fin&&!L.fin)SFX.fin();
  if(L.vy<-7&&c.vy>L.vy+4)SFX.land(Math.min(1.2,-L.vy/18));}
 L.nm=c.nm||0;L.combo=c.combo||0;L.crash=c.crashes||0;L.lap=c.lapT?c.lapT.length:0;L.fin=c.fin?1:0;L.vy=c.vy||0}catch(er){if(!P._engErr){P._engErr=1;console.error('engine',er)}}}
/* Nov 9 ("take the engines to the next level"): the cars around you are heard too. The three nearest opponents within 140 m each get a
   modelled engine, quieter with distance, panned to where they are and pitched by their speed toward or away from you (doppler) */
const AIV=[];let aiT=0;
function aiTick(c){if(!on()||!P.engWkNode||!AC||!(AC._ptEng||AC._ptEngSP))return;const Rc=RACE;if(!Rc||scr!=='game'||paused)return;const me=Rc.cars.find(q=>q.human);if(!me)return;
 const now=AC.currentTime;if(now-aiT>.25){aiT=now;/* reassign voices to the nearest cars */const L=Rc.cars.filter(q=>!q.human&&!q.fin).map(q=>[Math.hypot(q.x-me.x,q.z-me.z),q]).filter(x=>x[0]<140).sort((a,b)=>a[0]-b[0]).slice(0,3).map(x=>x[1]);
  for(const v of AIV)if(!L.includes(v.c)){v.c=null}
  for(const q of L){if(AIV.some(v=>v.c===q))continue;let v=AIV.find(v=>!v.c);if(!v&&AIV.length<3){const car=q.cs||P.BYID.merc,name=EK[EPID[car.id]]?EPID[car.id]:EK[car.eng]?car.eng:'v8';const pan=AC.createStereoPanner?AC.createStereoPanner():null,g=AC.createGain();g.gain.value=0;const w=P.engWkNode(AC,name,null);if(!w)return;w.node.connect(g);if(pan){g.connect(pan);pan.connect(MG)}else g.connect(MG);v={w,g,pan,c:null,name,rpm:.3};AIV.push(v)}if(v)v.c=q}}
 const v=AIV.find(v=>v.c===c);if(!v)return;const car=c.cs||P.BYID.merc,gi=c.gear|0,GT=P.GT(car),ceil=Math.max(8,car.top*GT[Math.min(gi,GT.length-1)].top*.92),r=Math.min(1.05,c.sp/ceil),th=c.in?c.in.th:0;
 v.rpm+=(Math.max(.14,Math.min(1,.14+r*.86))-v.rpm)*.3;const W=v.w.k,dx=c.x-me.x,dz=c.z-me.z,d=Math.hypot(dx,dz)||1;
 /* doppler: closing speed along the line between the cars */const vr=((c.vx-me.vx)*dx+(c.vz-me.vz)*dz)/d,dop=Math.max(.8,Math.min(1.25,343/(343+vr)));
 v.w.node.port?v.w.node.port.postMessage({rpm:W.idle+v.rpm*(W.red-W.idle),load:th,vol:1,dop}):v.w.set(W.idle+v.rpm*(W.red-W.idle),th,1,{dop});
 const t=AC.currentTime,g=Math.pow(1/(1+d/10),1.25)*.55*O().master*O().engine*1.6;v.g.gain.setTargetAtTime(g,t,.08);
 if(v.pan){const s=Math.sin(me.yaw),co=Math.cos(me.yaw),lat=(dx*co-dz*s)/d;v.pan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,-lat)),t,.08)}}
function aiQuiet(){for(const v of AIV){v.c=null;try{v.g.gain.setTargetAtTime(0,AC.currentTime,.05)}catch(e){}}}
engineSnd=(c,i)=>{if(c.human)tick(c,i);else try{aiTick(c)}catch(e){}};
setInterval(()=>{if(AIV.length&&(typeof scr==='undefined'||scr!=='game'||paused))aiQuiet();for(const v of AIV)if(!v.c){try{v.g.gain.setTargetAtTime(0,AC.currentTime,.1)}catch(e){}}},300);
stopEng=()=>{aiQuiet();eng.forEach(e=>{if(!e)return;try{const t=AC.currentTime;e.g.gain.setTargetAtTime(0,t,.03);e.sg.gain.setTargetAtTime(0,t,.03);if(e.tbG)e.tbG.gain.setTargetAtTime(0,t,.03)}catch(er){}})};

/* ---------- UI sounds: every hover / click in the menus ---------- */
const HOV='button,.card,.trk,.ci,.ev,.rk,.swb,.seg button,#pause .b button,.menuActions button,.mrow';
let lastH=null;
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest(HOV);if(t&&t!==lastH){lastH=t;if(!t.disabled&&!t.classList.contains('off'))SFX.hover()}else if(!t)lastH=null},true);
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest(HOV);if(!t)return;ctx();if(t.disabled||t.classList.contains('off')){SFX.err();return}
 if(t.dataset&&t.dataset.a==='back')SFX.back();else if(t.classList.contains('go'))SFX.ok();else if(t.id==='shAct'||t.id==='evGo')return;else SFX.click()},true);
addEventListener('keydown',e=>{if(e.repeat)return;if(scr==='game'||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Enter','Escape','Space'].includes(e.code))return;if(e.code==='Escape')SFX.back();else if(e.code==='Enter'||e.code==='Space')SFX.ok();else SFX.move()});
P.audioReady=ctx;P.aud={ctx,mg:()=>MG,nb:()=>NB,on,vol,tone,hiss};
})();
