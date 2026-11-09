/* ===== Poly GT layer: engine sound, second try (Nov 9, Hakan: "the engines sound like crap").
   The first try looped one recorded-style cycle and changed its playback speed with the rpm, so the whole sound, its resonances too,
   slid up and down like a tape: dull and boxy low down, chipmunk at the top. A real engine is pulses at the firing rate going through pipes
   whose resonances stay put. So the engine is now generated sample by sample in an AudioWorklet (physically informed, after Baldan et al.):
   - every cylinder fires at its real moment in the 720 degree cycle; its exhaust pulse (a sharp pressure bump plus a little combustion
     noise, a few percent different each time) leaves through its own header (slightly different lengths per cylinder)
   - the pulses of each bank go down that bank's exhaust pipe: a waveguide (a delay line with a damped, inverting reflection at the open
     end) and then a muffler chamber, so the pipe's own resonances shape every engine the same way a real one does. A cross-plane V8
     fires its banks unevenly (L R L L R L R R), which is where the burble comes from; flat-plane, V10, V12 and the sixes fire evenly
   - an intake path (the same pulses, inverted, through a short pipe) that comes in with throttle, and a little mechanical clatter
   - on a closed throttle the pulses go weak and the odd one misfires into a pop
   PTO.engWk===false (or no AudioWorklet in the browser) keeps the first engine. ===== */
(function engwk(){
'use strict';
const P=window.PT8;if(!P)return;
const SRC=`
class PtEngine extends AudioWorkletProcessor{
 constructor(o){super();const k=o.processorOptions||{};this.k=k;const sr=sampleRate;this.sr=sr;
  this.cyl=k.cyl||8;this.banks=k.banks||'LRLLRLRR';this.ph=Math.random();this.rpm=k.idle||900;this.tr=this.rpm;this.load=0;this.tl=0;this.vol=0;this.tv=0;
  let s=(k.seed||7)*7919+13;this.rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
  /* header lengths and firing offsets per cylinder */
  this.hd=[];this.off=[];for(let q=0;q<this.cyl;q++){this.hd.push(Math.round(sr*(k.hd||.0012)*(.7+this.rnd()*.6)));this.off.push(q/this.cyl)}
  /* active pulses: start sample, amplitude, width, bank, misfire */
  this.pl=[];this.n=0;this.ta=1/(sr*(k.ta||.00009));
  const mk=(ms,g,a)=>({b:new Float32Array(8192),w:0,D:Math.max(2,Math.round(sr*ms/1000)),g,a,lp:0});
  this.pipe=[mk(k.pipe||6,-.62,.42),mk((k.pipe||6)*(k.pipe2||1.13),-.62,.42)];this.muf=[mk(k.muf||1.5,.5,.5),mk((k.muf||1.5)*1.21,.5,.5)];
  this.intk=mk(k.ipipe||.9,.66,.6);this.lpo=0;this.lpi=0;this.hpx=0;this.hpy=0;this.mr1=0;this.mr2=0;this.lastq=-1;
  /* a resonator for the block (mechanical clatter) */
  const f=k.mech||1300,r=.985;this.ma1=2*r*Math.cos(2*Math.PI*f/sr);this.ma2=-r*r;
  this.port.onmessage=e=>{const d=e.data;if(d.rpm!=null)this.tr=d.rpm;if(d.load!=null)this.tl=d.load;if(d.vol!=null)this.tv=d.vol}}
 comb(c,x){const D=c.D,i=c.w,j=(i-D+8192)&8191;c.lp+=c.a*(c.b[j]-c.lp);const y=x+c.g*c.lp;c.b[i]=y;c.w=(i+1)&8191;return y}
 process(_,outs){const o=outs[0][0];if(!o)return true;const k=this.k,sr=this.sr,cyl=this.cyl,N=o.length;
  for(let i=0;i<N;i++){
   this.rpm+=(this.tr-this.rpm)*.0016;this.load+=(this.tl-this.load)*.002;this.vol+=(this.tv-this.vol)*.002;
   const rpm=this.rpm,cyc=rpm/120,dph=cyc/sr,ph0=this.ph;this.ph+=dph;
   /* firings this sample */
   for(let q=0;q<cyl;q++){let f=this.off[q]+(this.banks[q]==='L'?-1:1)*(k.uneven||0)*.5/cyl;f-=Math.floor(f);
    const a=ph0-Math.floor(ph0),b=a+dph;if((f>=a&&f<b)||(f+1>=a&&f+1<b)){
     const ld=this.load,mis=ld<.08&&rpm>2600&&this.rnd()<(k.pop||.06),amp=(mis?1.6:(.22+.78*ld))*(1+(this.rnd()-.5)*(k.jit||.12))*(this.banks[q]==='L'?1:(k.bal||1));
     const iv=sr/(cyc*cyl),W=Math.max(sr*.00035,Math.min(sr*.0055,iv*(k.wid||.3)*.5))*(mis?.5:1);
     this.pl.push({t:this.n+this.hd[q],a:amp,W,bk:this.banks[q]==='L'?0:1,nz:(k.nz||.25)*(mis?3:1)})}}
   if(this.ph>1e6)this.ph-=Math.floor(this.ph);
   /* pulses into the banks */
   let e0=0,e1=0;for(let p=this.pl.length-1;p>=0;p--){const q=this.pl[p],t=this.n-q.t;if(t<0)continue;const u=t/q.W;if(u>7){this.pl.splice(p,1);continue}
    const v=q.a*((1-Math.exp(-t*this.ta))*Math.exp(-u)*1.15+q.nz*(Math.random()*2-1)*Math.exp(-u*1.2));if(q.bk)e1+=v;else e0+=v}
   this.n++;
   /* exhaust: pipe then muffler, per bank */
   const x0=this.comb(this.muf[0],this.comb(this.pipe[0],e0)),x1=this.comb(this.muf[1],this.comb(this.pipe[1],e1));
   let ex=x0+x1;
   /* brightness: opens with load and rpm */
   const rr=Math.min(1,(rpm-(k.idle||900))/((k.red||7000)-(k.idle||900))),fc=(k.cut0||420)*3+(k.cut1||3400)*1.6*(.25*rr+.75*rr*this.load)+this.load*500,al=1-Math.exp(-2*Math.PI*fc/sr);
   this.lpo+=al*(ex-this.lpo);ex=this.lpo*(1-(k.raw||.05))+ex*(k.raw||.05);
   /* intake */
   const it=this.comb(this.intk,-(e0+e1));this.lpi+=.35*(it-this.lpi);const ig=(k.int||.3)*(.1+.9*this.load)*(.2+.8*rr);
   /* block clatter */
   const mx=(e0+e1)*.02+this.ma1*this.mr1+this.ma2*this.mr2;this.mr2=this.mr1;this.mr1=mx;
   let y=ex+(it-this.lpi)*ig+mx*(k.mk||.25)*(1-this.load*.5);
   /* level: more pulses per second are louder, so even it out a bit; saturation grows under load */
   y*=Math.pow(1000/rpm,.32)*(k.g||.5);const dr=1+(k.dr||1.6)*this.load;y=Math.tanh(y*dr)/Math.sqrt(dr);
   /* dc block */
   const h=y-this.hpx+.995*this.hpy;this.hpx=y;this.hpy=h;o[i]=h*this.vol}
  for(let c=1;c<outs[0].length;c++)outs[0][c].set(o);return true}}
registerProcessor('pt-engine',PtEngine);`;
/* per engine: firing banks, pipe lengths (ms), header, muffler, brightness, intake, saturation */
const EW={
 v8:{cyl:8,banks:'LRLLRLRR',idle:780,red:6800,uneven:0,pipe:7.2,pipe2:1.09,muf:1.7,hd:.0016,cut0:360,cut1:2600,int:.22,dr:1.9,wid:.34,nz:.22,mech:1100,g:.55,pop:.08},
 v8t:{cyl:8,banks:'LRLLRLRR',idle:820,red:7000,pipe:6.4,pipe2:1.1,muf:1.5,hd:.0014,cut0:380,cut1:2800,int:.2,dr:1.6,wid:.32,nz:.2,mech:1200,g:.52,pop:.06},
 v8h:{cyl:8,banks:'LRLRLRLR',idle:950,red:8300,pipe:4.6,pipe2:1.15,muf:1.2,hd:.0011,cut0:460,cut1:3800,int:.32,dr:1.5,wid:.28,nz:.16,mech:1500,g:.5,pop:.1},
 v10:{cyl:10,banks:'LRLRLRLRLR',idle:1000,red:8700,pipe:4.2,pipe2:1.12,muf:1.1,hd:.001,cut0:520,cut1:4400,int:.36,dr:1.4,wid:.27,nz:.14,mech:1700,g:.5,pop:.1},
 v12:{cyl:12,banks:'LRLRLRLRLRLR',idle:1000,red:8900,pipe:3.8,pipe2:1.08,muf:1,hd:.0009,cut0:560,cut1:4800,int:.4,dr:1.3,wid:.26,nz:.12,mech:1900,g:.5,pop:.08},
 i4t:{cyl:4,banks:'LLLL',idle:850,red:7000,pipe:5.4,pipe2:1,muf:1.4,hd:.0013,cut0:420,cut1:3000,int:.3,dr:1.7,wid:.3,nz:.3,mech:1400,g:.6,pop:.08},
 i6:{cyl:6,banks:'LLLLLL',idle:750,red:6800,pipe:5.8,pipe2:1,muf:1.5,hd:.0012,cut0:420,cut1:3200,int:.28,dr:1.4,wid:.3,nz:.18,mech:1300,g:.55,pop:.05},
 v6t:{cyl:6,banks:'LRLRLR',idle:850,red:7000,pipe:5.2,pipe2:1.1,muf:1.4,hd:.0012,cut0:420,cut1:3200,int:.26,dr:1.6,wid:.3,nz:.22,mech:1400,g:.55,pop:.06},
 v6h:{cyl:6,banks:'LRLRLR',idle:950,red:8000,pipe:4.4,pipe2:1.14,muf:1.2,hd:.001,cut0:480,cut1:3800,int:.3,dr:1.5,wid:.28,nz:.18,mech:1600,g:.52,pop:.1},
 f6:{cyl:6,banks:'LRLRLR',idle:900,red:8800,uneven:.06,pipe:4.8,pipe2:1.2,muf:1.3,hd:.0015,cut0:460,cut1:3900,int:.34,dr:1.6,wid:.3,nz:.2,mech:1500,g:.52,pop:.1}};
P.ENG_WK=EW;
const ok=()=>!(window.PTO&&window.PTO.engWk===false)&&typeof AudioWorkletNode!=='undefined';
const ready=new WeakMap();
/* load the processor into a context (also an OfflineAudioContext, for tests). A page opened from a file has no origin, so a blob or data
   module can be refused: then the same code runs in a ScriptProcessor on the main thread (bigger buffer, same sound) */
const SPC={};const spClass=sr=>{if(SPC[sr])return SPC[sr];new Function('sampleRate','AudioWorkletProcessor','registerProcessor',SRC)(sr,class{constructor(){this.port={}}},(n,c)=>{SPC[sr]=c});return SPC[sr]};
P.engWkLoad=a=>{if(!ok()||!a)return Promise.resolve(false);let p=ready.get(a);if(p)return p;
 const sp=()=>{a._ptEngSP=1;return true};
 const tryUrl=u=>a.audioWorklet.addModule(u).then(()=>{a._ptEng=1;return true});
 p=!a.audioWorklet?Promise.resolve(sp()):tryUrl(URL.createObjectURL(new Blob([SRC],{type:'application/javascript'}))).catch(()=>tryUrl('data:application/javascript;base64,'+btoa(SRC))).catch(e=>{console.warn('engine worklet: using the main-thread engine',e&&e.message);return sp()});ready.set(a,p);return p};
/* a voice: returns null until the processor is loaded */
P.engWkNode=(a,name,dest)=>{if(!ok()||!(a._ptEng||a._ptEngSP))return null;const k=Object.assign({seed:name.length*31+7},EW[name]||EW.v8);
 try{if(a._ptEng){const n=new AudioWorkletNode(a,'pt-engine',{numberOfInputs:0,numberOfOutputs:1,outputChannelCount:[1],processorOptions:k});if(dest)n.connect(dest);
   return{node:n,k,set(rpm,load,vol){n.port.postMessage({rpm,load,vol})},stop(){try{n.port.postMessage({vol:0});setTimeout(()=>{try{n.disconnect()}catch(e){}},120)}catch(e){}}}}
  const pr=new (spClass(a.sampleRate))({processorOptions:k});
  const n=a.createScriptProcessor(1024,1,1);n.onaudioprocess=e=>{const o=e.outputBuffer.getChannelData(0);pr.process([],[[o]])};if(dest)n.connect(dest);
  return{node:n,k,set(rpm,load,vol){pr.port.onmessage({data:{rpm,load,vol}})},stop(){try{pr.port.onmessage({data:{vol:0}});setTimeout(()=>{try{n.onaudioprocess=null;n.disconnect()}catch(e){}},120)}catch(e){}}}}catch(e){console.warn('engine node',e);return null}};
})();
