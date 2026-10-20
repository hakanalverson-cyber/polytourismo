/* ===== Poly Tourismo v8 layer: core (economy, gears, AI, race flow, modes) ===== */
(function v8core(){
'use strict';
const PT8=window.PT8={};
const fmtCr=n=>Math.round(n).toLocaleString('en-US')+' Cr.';
const ord=n=>{const v=n%100,x=['TH','ST','ND','RD'];return n+(x[(v-20)%10]||x[v]||x[0])};
PT8.fmtCr=fmtCr;PT8.ord=ord;
const fmtT=t=>{if(t==null||!isFinite(t))return'--:--.--';const m=Math.floor(t/60);return String(m).padStart(2,'0')+':'+(t-m*60).toFixed(2).padStart(5,'0')};
PT8.fmtT=fmtT;

/* oriented-box overlap (cars are ~1.9 x 4.3 m) */
PT8.obbHit=(ax,az,ay,bx,bz,by,hx,hz)=>{hx=hx||.95;hz=hz||2.1;const dx=bx-ax,dz=bz-az;if(dx*dx+dz*dz>25)return false;const sa=Math.sin(ay),ca=Math.cos(ay),sb=Math.sin(by),cb=Math.cos(by);
 for(const [nx,nz] of [[ca,-sa],[sa,ca],[cb,-sb],[sb,cb]]){const ra=hx*Math.abs(nx*ca-nz*sa)+hz*Math.abs(nx*sa+nz*ca),rb=hx*Math.abs(nx*cb-nz*sb)+hz*Math.abs(nx*sb+nz*cb);if(Math.abs(dx*nx+dz*nz)>=ra+rb)return false}return true};
/* ---------------- catalog ---------------- */
const CLS=['D','C','B','A','S'];
const CLSCOL={D:'#9aa79c',C:'#6fd16f',B:'#37b8ff',A:'#ffb62e',S:'#ff4a4a'};
const CARS=[
 {id:'lr',gears:3,name:'LAND ROVER',cls:'D',body:6,alt:10,top:34,acc:20,grip:.96,brk:.92,off:1.0,price:9000,altPrice:2500,type:'4X4 SUV',drive:'AWD',blurb:'Tall, heavy and unbothered by gravel. Slow on tarmac, a monster on loose ground.'},
 {id:'ford',gears:3,name:'FORD',cls:'C',body:4,alt:11,top:38,acc:24,grip:1,brk:1,off:.8,price:16000,altPrice:3000,type:'HOT HATCH',drive:'AWD',blurb:'A hot hatch with rally blood. Short on top speed, long on character.'},
 {id:'merc',gears:3,name:'MERCEDES',cls:'B',body:3,alt:9,top:42,acc:27,grip:1.03,brk:1.05,off:.5,price:34000,altPrice:4000,type:'PERFORMANCE SEDAN',drive:'RWD',blurb:'Fast, solid, refined. A proper all-rounder to start a career with.'},
 {id:'ster',gears:3,name:'STERRATO',cls:'A',body:1,alt:8,top:45,acc:29,grip:1.02,brk:1.08,off:.92,price:68000,altPrice:6000,type:'RAISED SUPERCAR',drive:'AWD',blurb:'Lifted, wide and loud. A supercar that does not care what is under the wheels.'},
 {id:'art',gears:3,name:'ARTURA',cls:'A',body:2,alt:13,top:47,acc:30,grip:1.06,brk:1.1,off:.45,price:88000,altPrice:6000,type:'HYBRID SUPERCAR',drive:'RWD',blurb:'Light, quick and precise. Electric punch with a V6 voice.'},
 {id:'ferr',gears:3,name:'FERRARI',cls:'S',body:5,alt:12,top:50,acc:33,grip:1.08,brk:1.14,off:.4,price:175000,altPrice:10000,type:'SUPERCAR',drive:'RWD',blurb:'Screaming, red and razor sharp. A poster on every wall.'},
 {id:'zen',gears:3,name:'ZENVO',cls:'S',body:0,alt:7,top:52,acc:34,grip:1.1,brk:1.16,off:.38,price:245000,altPrice:10000,type:'HYPERCAR',drive:'RWD',blurb:'Twin-charged and track-focused. Built to attack a lap.'},
 {id:'must',gears:3,name:'MUSTANG',cls:'B',body:18,alt:25,top:41.5,acc:26.5,grip:.99,brk:1,off:.42,price:28000,altPrice:3500,type:'MUSCLE COUPE',drive:'RWD',blurb:''},
 {id:'urus',gears:3,name:'URUS',cls:'B',body:15,alt:22,top:43,acc:27,grip:1,brk:1.04,off:.85,price:46000,altPrice:4500,type:'PERFORMANCE SUV',drive:'AWD',blurb:''},
 {id:'m8',gears:3,name:'BMW M8',cls:'A',body:14,alt:21,top:45.5,acc:29,grip:1.03,brk:1.09,off:.5,price:74000,altPrice:6000,type:'GRAND TOURER',drive:'AWD',blurb:''},
 {id:'amg',gears:3,name:'MERCEDES AMG',cls:'A',body:19,alt:26,top:46,acc:29.5,grip:1.04,brk:1.1,off:.46,price:82000,altPrice:6000,type:'SPORTS COUPE',drive:'RWD',blurb:''},
 {id:'gtr',gears:3,name:'GT-R',cls:'B',body:17,alt:24,top:43.5,acc:28.2,grip:1.045,brk:1.07,off:.6,price:52000,altPrice:5000,type:'SPORTS COUPE',drive:'AWD',blurb:''},
 {id:'por',gears:3,name:'PORSCHE',cls:'B',body:20,alt:27,top:44.5,acc:28.6,grip:1.055,brk:1.08,off:.42,price:58000,altPrice:5000,type:'SPORTS CAR',drive:'RWD',blurb:''},
 {id:'p1',gears:3,name:'P1 GTR',cls:'S',body:16,alt:23,top:53,acc:35,grip:1.11,brk:1.17,off:.3,price:310000,altPrice:12000,type:'HYBRID HYPERCAR',drive:'RWD',blurb:''}
];
const BYID={};CARS.forEach(c=>BYID[c.id]=c);
const clsIdx=c=>CLS.indexOf(c.cls);
PT8.CARS=CARS;PT8.CLS=CLS;PT8.CLSCOL=CLSCOL;PT8.BYID=BYID;
/* sorted D -> S, then price */
const SORTED=[...CARS].sort((a,b)=>clsIdx(a)-clsIdx(b)||a.price-b.price);
PT8.SORTED=SORTED;
/* gears */
/* per-car gear tables (3 speeds). 1st has the strongest pull, the top gear keeps acc .66 */
const _GT={};
/* three-speed boxes: gear ratios (high number = short gear). Top-speed fraction of gear i = ratio[last]/ratio[i] */
const RATIOS={std:[2.45,1.40,1.00],close:[2.35,1.38,1.00],wide:[2.70,1.50,1.00]};
const BOX={lr:'wide',urus:'wide',ford:'std',merc:'std',must:'std',ster:'close',art:'close',ferr:'close',zen:'close',m8:'close',amg:'close',gtr:'close',por:'close',p1:'close'};
function GT(car){car=car||BYID.merc;let t=_GT[car.id];if(t)return t;const R=RATIOS[BOX[car.id]||car.box||'std'],N=R.length;t=_GT[car.id]=[];for(let i=0;i<N;i++){const u=i/(N-1);t.push({top:R[N-1]/R[i],acc:.66+.44*Math.pow(1-u,1.5)})}return t}
PT8.GT=GT;const GEARS=GT(null);
/* power band: lugging below ~45% of a gear is weak, strongest 60-90%, falls off at the limiter */
const band=r=>r<.45?.46+r/.45*.14:r<.9?.6+(r-.45)/.45*.4:Math.max(.5,1-(r-.9)/.12*.25);PT8.band=band;
PT8.GEARS=GEARS;
/* steady-state top speed (m/s) of a car in a gear on dry tarmac, solving acc*(1-v/top)=DRAG*v^2 */
function topSpeed(car,gi){const G=GT(car),g=typeof gi==='number'?G[gi]:(gi?G[G.length-1]:G[1]),top=car.top*g.top,acc=car.acc*g.acc;let lo=0,hi=top;for(let i=0;i<40;i++){const v=(lo+hi)/2;if(acc*(1-v/top)>.0007*v*v)lo=v;else hi=v}return lo}
PT8.topSpeed=topSpeed;PT8.gearTops=car=>GT(car).map((g,i)=>topSpeed(car,i));
/* performance points, for display */
PT8.pp=car=>Math.round(300+(car.top-30)*14+(car.acc-18)*9+(car.grip-.9)*320+(car.brk-.9)*160+car.off*20);

/* surface status effects shown to the player (matches the physics wrapper) */
PT8.surfFx=(car,gravel)=>{const off=car.off;const g=gravel?lerpf(.5,.95,off):lerpf(1.04,.96,off),t=gravel?lerpf(.78,1,off):1;return{g:Math.round((g-1)*100),t:Math.round((t-1)*100),a:gravel?Math.round((lerpf(.6,.97,off)-1)*100):0}};
PT8.surfRank=car=>{const o=car.off;return{tar:o<.5?'good':o<.8?'ok':'poor',grv:o>=.85?'good':o>=.6?'ok':'poor'}};
/* ---------------- save ---------------- */
const SKEY='pt8-save';
const defSave=()=>({v:1,cr:3500,owned:{merc:1},sel:[{id:'merc',alt:0},{id:'merc',alt:0},{id:'merc',alt:0},{id:'merc',alt:0}],career:{done:{}},ta:{},stats:{earned:0,races:0,wins:0}});
let SV=defSave();
try{const j=JSON.parse(localStorage.getItem(SKEY)||'null');if(j&&j.v===1){SV=Object.assign(defSave(),j);SV.career=Object.assign({done:{}},j.career||{});SV.stats=Object.assign(defSave().stats,j.stats||{})}}catch(e){}
const save=()=>{try{localStorage.setItem(SKEY,JSON.stringify(SV))}catch(e){}};
PT8.SV=()=>SV;PT8.save=save;
PT8.owns=(id,alt)=>alt?false:((SV.owned[id]||0)&1)!==0;
PT8.ownedList=()=>SORTED.filter(c=>(SV.owned[c.id]||0)>0);
PT8.earn=n=>{SV.cr+=n;SV.stats.earned+=Math.max(0,n);save()};
PT8.spend=n=>{if(SV.cr<n)return false;SV.cr-=n;save();return true};
PT8.buy=(id,alt)=>{const c=BYID[id];const price=alt?c.altPrice:c.price;if(alt&&!PT8.owns(id,0))return false;if(PT8.owns(id,alt))return false;if(!PT8.spend(price))return false;SV.owned[id]=(SV.owned[id]||0)|(alt?2:1);save();return true};
PT8.modelOf=(id,alt)=>BYID[id].body;
PT8.setSel=(p,id,alt)=>{SV.sel[p]={id,alt:alt?1:0};save()};
PT8.resetSave=()=>{SV=defSave();save()};
/* ---- tuning: per car (+alt) setups. gear/susp/aero/brake -3..3, tyre -1..1 ---- */
PT8.TUNE=[{k:'gear',n:'Gearing',lo:'SHORT',hi:'LONG',r:3},{k:'tyre',n:'Tyres',lo:'SOFT',hi:'HARD',r:1},{k:'susp',n:'Suspension',lo:'SOFT',hi:'STIFF',r:3},{k:'aero',n:'Downforce',lo:'LOW',hi:'HIGH',r:3},{k:'brake',n:'Brakes',lo:'SOFT',hi:'STRONG',r:3}];
PT8.tuneKey=(id,alt)=>id+(alt?'a':'');
PT8.tuneGet=(id,alt)=>Object.assign({gear:0,tyre:0,susp:0,aero:0,brake:0},(SV.tune||{})[PT8.tuneKey(id,alt)]||{});
PT8.tuneSet=(id,alt,k,v)=>{const d=PT8.TUNE.find(x=>x.k===k);if(!d)return;if(!SV.tune)SV.tune={};const key=PT8.tuneKey(id,alt),t=PT8.tuneGet(id,alt);t[k]=Math.max(-d.r,Math.min(d.r,v));SV.tune[key]=t;save()};
PT8.tuneReset=(id,alt)=>{if(SV.tune)delete SV.tune[PT8.tuneKey(id,alt)];save()};
PT8.tuneFx=(t,gravel)=>{const g=t.gear,ty=t.tyre,s=t.susp,a=t.aero,b=t.brake;
 return{top:(1+.012*g)*(1-.008*a),acc:1-.04*g,grip:(1-.03*ty)*(gravel?1-.02*s:1+.012*s)*(1+.02*a),brk:1+.04*b,wear:(ty<0?1-.35*ty:1-.3*ty)*(1+.03*Math.max(0,b))}};

/* ---------------- globals for physics ---------------- */
const BASE=JSON.parse(JSON.stringify(MATS));
MATS.dirt={grip:.55,top:.78,acc:.62};BASE.dirt=JSON.parse(JSON.stringify(MATS.dirt));
MATS.scrub={grip:.62,top:.82,acc:.68};BASE.scrub=JSON.parse(JSON.stringify(MATS.scrub));
const LOOSE=['grass','sand','snow','dirt','scrub'];
const lerpf=(a,b,t)=>a+(b-a)*t;

/* ---------------- gears: double-tap detection ---------------- */
/* per-player transmission: PT8.TX[p] true = automatic, false = manual, undefined = follow the old global AUTO SHIFT setting */
try{PT8.TX=JSON.parse(localStorage.getItem('pt9-tx')||'[]')}catch(e){PT8.TX=[]}if(!Array.isArray(PT8.TX))PT8.TX=[];
PT8.setTX=(p,v)=>{PT8.TX[p]=!!v;try{localStorage.setItem('pt9-tx',JSON.stringify(PT8.TX))}catch(e){}};
PT8.isAuto=c=>{const v=c&&c.human?PT8.TX[c.k|0]:undefined;return v===undefined||v===null?!!(window.PTO&&PTO.autoShift):!!v};
const taps=[0,1,2,3].map(()=>({u:0,d:0}));
addEventListener('keydown',e=>{if(e.repeat)return;for(let p=0;p<4;p++){const k=KM[p];if(e.code===k.u)taps[p].u++;if(e.code===k.d)taps[p].d++}});
function shiftGear(c,d,auto){const cs_=c.cs||BYID.merc,G_=GT(cs_),n=clamp((c.gear|0)+(d>0?1:-1),0,G_.length-1);if(n===(c.gear|0))return false;const rr=c.sp/Math.max(1,(PT8.effTop?PT8.effTop(cs_,c.gear|0)*1.03:cs_.top*G_[c.gear|0].top)*(c.mt?c.mt.top:1));if(!auto&&d>0&&rr>=.8&&rr<=1.06){c.pb=1.1;c.perfect=1}else c.perfect=0;
 c.gear=n;c.shiftT=.14;c.gearFlash=.9;if(c.human){PT8.sfx(d>0?'up':'dn');if(c.perfect)PT8.sfx('move')}return true}
function autoGear(c,dt,mt,fac,auto){const cs=c.cs,G_=GT(cs),NG=G_.length,g=c.gear|0,ce=q=>(PT8.effTop?PT8.effTop(cs,q)*1.03:cs.top*G_[q].top)*(mt.top||1);let want=NG-1;for(let q=0;q<NG;q++)if(c.sp<=ce(q)*fac){want=q;break}
 if(want<g&&!(c.sp<ce(g)*.55))want=g;if(want!==g){c.gearHold=(c.gearHold||0)-dt;if(c.gearHold<=0){shiftGear(c,want>g?1:-1,auto);c.gearHold=auto?.5:.35}}else c.gearHold=.2}
function gearLogic(c,live,dt){const p=c.k,tp=taps[p],now=performance.now();
 if(c.seenU===undefined){c.seenU=tp.u;c.seenD=tp.d;c.lastU=0;c.lastD=0}
 if(PT8.isAuto(c)){c.seenU=tp.u;c.seenD=tp.d;if(live)autoGear(c,dt||.016,c.mt||MATS.road,.93,true);return}
 if(tp.u!==c.seenU){c.seenU=tp.u;if(live&&c.lastU&&now-c.lastU<340){shiftGear(c,1);c.lastU=0}else c.lastU=now}
 if(tp.qu){tp.qu=0;if(live)shiftGear(c,1)}if(tp.qd){tp.qd=0;if(live)shiftGear(c,-1)}
 if(tp.d!==c.seenD){c.seenD=tp.d;if(live&&c.lastD&&now-c.lastD<340){shiftGear(c,-1);c.lastD=0}else c.lastD=now}
 try{const g=navigator.getGamepads?navigator.getGamepads()[p]:null;if(g){const B=i=>!!(g.buttons[i]&&g.buttons[i].pressed),bu=B(5)||B(12),bd=B(4)||B(13);if(live){if(bu&&!c.pu)shiftGear(c,1);if(bd&&!c.pd)shiftGear(c,-1)}c.pu=bu;c.pd=bd}}catch(e){}
}

/* ---------------- AI ---------------- */
function kappa(T){if(T.kap)return T.kap;const kz=new Float32Array(T.N);for(let i=0;i<T.N;i++){const N=T.N;kz[i]=Math.max(0,-(T.y[(i+5)%N]-2*T.y[i]+T.y[(i-5+N)%N])/(25*T.sp*T.sp))}T.kz=kz;const N=T.N,k=new Float32Array(N),sp=T.sp;for(let i=0;i<N;i++){const a=Math.abs(wr(T.psi[(i+3)%N]-T.psi[(i-3+N)%N]));k[i]=a/(6*sp)}
 const o=new Float32Array(N);for(let i=0;i<N;i++){let m=0;for(let j=-2;j<=2;j++)m=Math.max(m,k[(i+j+N)%N]);o[i]=m}return T.kap=o}
function steerLimit(R){return 2.25*R/(1+.0105*R)}
function aiInput(c,dt){const Rc=RACE,T=Rc.T,N=T.N,a=c.ai||(c.ai={skill:.9,lat:0,mist:0,name:'CPU'}),K=kappa(T);
 const live=Rc.state==='race'&&c.respT<=0&&!(c.exp>0);
 const cs=c.cs,mt=c.mt||MATS.road;
 let skill=a.skill;
 if(c.cool&&!c.forceAI)skill=.55;
 else if(Rc.rubber){const ref=Rc.rubber();skill+=clamp((ref-c.unw)/N*.12,-.05,.04)}
 /* target point */
 let kn=0;for(let j=1;j<=7;j++)kn=Math.max(kn,K[(c.idx+j)%N]);
 const ld=Math.min(6+c.sp*.5,Math.max(8,1.15/Math.max(kn,1e-3))),la=Math.max(3,Math.round(ld/T.sp)),ti=(c.idx+la)%N,off=a.lat*T.hw[ti]*.55,s=Math.sin(T.psi[ti]),co=Math.cos(T.psi[ti]);
 const tx=T.x[ti]+co*off,tz=T.z[ti]-s*off,des=Math.atan2(tx-c.x,tz-c.z);
 let st=clamp(wr(des-c.yaw)*2.2,-1,1);
 /* speed plan */
 const gfac=(mt.grip||1)*cs.grip;let tgt=1e9;
 const jm=Math.max(44,Math.min(160,Math.ceil(c.sp*c.sp/(25*cs.brk)/T.sp)+8));for(let j=2;j<=jm;j+=2){const i=(c.idx+j)%N;if(T.gap[i])continue;const k=Math.max(K[i],8e-4),R_=1/k,vz=Math.sqrt(6.5/Math.max(T.kz[i],1e-4)),ice=T.ice[i]?.3:1,vlim=Math.min(vz,steerLimit(R_)*.9*Math.min(1,.6+gfac*.4)*ice,Math.sqrt(26*gfac*ice*R_));
  tgt=Math.min(tgt,Math.sqrt(vlim*vlim+2*(12.5*cs.brk)*j*T.sp))}
 const topNow=topSpeed(cs,GT(cs).length-1)*(mt.top||1);
 tgt=Math.min(tgt,topNow*(.9+.1*skill))*Math.min(1,.55+skill*.5);c._tg=tgt;c._tn=topNow;
 let th=0,br=0;if(!live){th=0}else{if(c.sp<tgt-.8)th=1;else if(c.sp>tgt+1.8)br=1}
 /* gears */
 if(live)autoGear(c,dt,mt,.86,false);
 if(c.stuck>1.5){th=0;br=1;st=-st}
 if(live&&c.m.wheels.every(w=>!w.g)){st*=.15;th=0;br=0}
 return{th,br,st,hb:0}}
PT8.aiInput=aiInput;PT8.kappa=kappa;

/* ---------------- physics wrapper ---------------- */
const innerStepCar=stepCar;
stepCar=(c,dt)=>{const Rc=RACE,T=Rc.T,st=c.cs||(c.cs=BYID.merc);
 const live=Rc.state==='race'&&!c.fin&&c.respT<=0&&!(c.exp>0);
 if(c.cool||!c.human||c.forceAI){c.in=aiInput(c,dt);if(PT8.aiPost)PT8.aiPost(c,dt)}
 else if(c.human)gearLogic(c,live,dt);
 if(c.shiftT>0){c.shiftT-=dt;c.in.th=0}
 if(PT8.inPost)PT8.inPost(c,dt);
 if(c.gearFlash>0)c.gearFlash-=dt;
 const g=GT(st)[Math.min(c.gear|0,GT(st).length-1)];TOP=st.top*g.top;{const mtp=(c.mt||MATS.road).top||1,r_=c.sp/Math.max(1,TOP*mtp);if(c.pb>0)c.pb-=dt;ACC=st.acc*g.acc*band(r_)*(c.pb>0?1.3:1)}GRIP=9*st.grip;BRK=40*st.brk;
 {const mm=PT8.mul?PT8.mul(c):null;if(mm){ACC*=mm.acc;TOP*=mm.top;GRIP*=mm.grip;BRK*=mm.brk}}
 /* surfaces: gravel road for rally, offroad stat softens loose ground */
 const off=st.off,gv=T.d.gravel;
 MATS.road.grip=gv?lerpf(.5,.95,off):lerpf(1.04,.96,off);MATS.road.top=gv?lerpf(.78,1,off):1;MATS.road.acc=gv?lerpf(.6,.97,off):1;
 const om=lerpf(.82,1.12,off);for(const k of LOOSE){const b=BASE[k];MATS[k].grip=b.grip*om;MATS[k].top=Math.min(1,b.top*om);MATS[k].acc=Math.min(1,b.acc*om)}
 const keep=c.cool&&c.fin;if(keep)c.fin=0;
 c.boost=0;c.dts=0;
 innerStepCar(c,dt);
 if(keep)c.fin=1;
 c.boost=0;c.dts=0;
 /* engine braking when above the gear ceiling */
 if((c.gear|0)<GT(st).length-1&&c.exp<=0){const mt=c.mt||MATS.road,lt=topSpeed(st,c.gear|0)*mt.top,ex=c.sp-lt;if(ex>.6){let n=0;for(const w of c.m.wheels)if(w.g)n++;if(n>=2){const f=Math.min(.5,.5*dt*ex/Math.max(c.sp,1));c.vx*=1-f;c.vz*=1-f}}}
};

/* ---------------- start grid ---------------- */
function gridSlot(T,c,slot){const row=slot>>1,idx0=-(5+row*5),i=((idx0%T.N)+T.N)%T.N,lat=(slot&1?1:-1)*T.hw[0]*.36,s=Math.sin(T.psi[i]),co=Math.cos(T.psi[i]);
 c.x=T.x[i]+co*lat;c.z=T.z[i]-s*lat;c.y=T.y[i]-lat*T.bank[i]+1.1;c.yaw=T.psi[i];c.idx=i;c.unw=idx0;c.cy=T.psi[i];c.camY=T.y[i]+1}

/* ---------------- race launch ---------------- */
const NAMES=['KAZE','RIVA','BOLT','MOSS','TANK','VEGA','DUSK','ORCA','NOVA','HAWK','LYNX','ONYX','ROOK','FINN','ZED','JUNO'];
PT8.lastCfg=null;
function cleanupRace(){if(!RACE)return;try{RACE.cars.forEach(c=>releaseCar(c.m));if(RACE.traffic)RACE.traffic.forEach(t=>releaseCar(t.m));disposeWorld(RACE.scene)}catch(e){}stopEng();RACE=null;FS=null;FX=[];if(PT8.resetTod)PT8.resetTod()}
PT8.cleanupRace=cleanupRace;
function launch(cfg){
 PT8.lastCfg=cfg;cleanupRace();
 const trackDef=Object.assign({},D[cfg.track]);
 if(cfg.mode==='cutup'){trackDef.jumps=[];trackDef.ice=[]}
 if(cfg.rev){trackDef.rev=true;trackDef.jumps=[]}
 if(trackDef.look!=null)trackDef.id=trackDef.look;
 const T=sampleTrack(trackDef);selT=cfg.track;
 const scene=buildWorld(T);FS=scene;FX=[];if(PT8.applyTod)PT8.applyTod(scene,T,cfg.tod||(D[cfg.track].tod0)||'day');if(PT8.shadeSetup)PT8.shadeSetup(scene);
 const laps=cfg.mode==='cutup'?1:cfg.laps;
 RACE={T,scene,cars:[],state:'count',cd:3.99,t:0,conn:{},shake:0,laps,fin:[],endT:0,mode:cfg.mode,cfg,ending:0,doneT:0,shown:1,sess:{cr:0}};
 const entries=[...cfg.humans.map((h,i)=>({human:true,p:i,id:h.id,alt:h.alt,loan:h.loan,name:h.name})),...(cfg.ai||[]).map((a,i)=>({human:false,p:4+i,id:a.id,alt:a.alt,skill:a.skill,name:a.name,lat:a.lat}))];
 const nh=cfg.humans.length,total=entries.length;
 /* grid: CPUs in front, humans behind in career/race, humans first in multiplayer */
 /* random grid order; career events may pin the human via ev.startPos (1 = pole); cfg.grid==='fixed' keeps the old order */
 const slots=entries.map((e,i)=>i);
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 if(cfg.grid!=='fixed'){shuffle(slots);const sp=cfg.ev&&cfg.ev.startPos;if(sp&&cfg.mode==='career'){const want=Math.min(Math.max(sp,1),total)-1,hi=Math.max(0,entries.findIndex(e=>e.human)),j=slots.indexOf(want);[slots[hi],slots[j]]=[slots[j],slots[hi]]}}
 const humanFirst=cfg.mode==='mp'&&total<=nh+1;
 entries.forEach((e,i)=>{
  const k=i;
  const car=BYID[e.id]||BYID.merc;
  while(COLS.length<=k){COLS.push([0xd4ded8,0x8a9fab,0xb2a28c,0x9a8c9e,0xc77,0x7c7,0x77c,0xcc7,0x7cc,0xc7c][COLS.length%10]);CS.push('#'+COLS[COLS.length-1].toString(16).padStart(6,'0'))}
  carChoices[k]=PT8.modelOf(car.id,e.alt);
  const c=newCar(T,k,e.human);c.cs=car;c.carId=car.id;c.alt=e.alt?1:0;c.gear=0;c.shiftT=0;c.gearFlash=0;c.tune=e.human&&cfg.mode!=='ta'?PT8.tuneGet(e.id,e.alt):null;if(c.tune){const f=PT8.tuneFx(c.tune,!!T.d.gravel);c.cs=Object.assign({},car,{top:car.top*f.top,acc:car.acc*f.acc,grip:car.grip*f.grip,brk:car.brk*f.brk})}c.loan=!!e.loan;c.pnum=e.human?e.p+1:0;c.ptName=e.human?(e.name||('P'+(e.p+1))):(e.name||NAMES[(k*7)%NAMES.length]);
  if(!e.human){c.ai={skill:e.skill||.85,lat:e.lat!=null?e.lat:(((k*37)%7)-3)/4,name:c.ptName};c.m.drv.visible=false}
  c.slot=cfg.grid==='fixed'?(e.human?(humanFirst?e.p:(total-nh)+e.p):(humanFirst?nh+(i-nh):i-nh)):slots[i];
  gridSlot(T,c,c.slot);
  RACE.cars.push(c);scene.add(c.m.g);scene.add(c.m.sh);
 });
 RACE.cars.forEach(c=>{c.camY=c.y;if(c.human){c.seenU=undefined}});
 RACE.rubber=cfg.mode==='career'?()=>{let b=-1e9;for(const c of RACE.cars)if(c.human&&!c.fin)b=Math.max(b,c.unw);return b>-1e8?b:0}:null;
 /* HUD shells */
 const h=$('huds');h.innerHTML='';RACE.cars.forEach((c,i)=>{const d=document.createElement('div');d.className='hud';d.id='h'+i;h.appendChild(d)});
 if(PT8.todPost)PT8.todPost(RACE);
 if(PT8.setupDust)PT8.setupDust(RACE);
 if(cfg.mode==='cutup'&&PT8.setupTraffic)PT8.setupTraffic(RACE);
 if(cfg.mode==='ta')RACE.ghost=PT8.ghostSetup?PT8.ghostSetup(RACE):null;
 paused=false;show('game');$('res').classList.remove('on');$('cd').textContent='';$('fade').style.opacity=0;
 RACE.cars.forEach(c=>{c.lapT=[];c.lapStart=0;c.curLap=0});
}
PT8.launch=launch;
startRace=()=>{if(PT8.lastCfg)PT8.launch(PT8.lastCfg)};

/* ---------------- race end / finish ---------------- */
function endRace(){const Rc=RACE;if(Rc.ending>0||Rc.state==='done')return;Rc.ending=Rc.mode==='cutup'?1.8:2.6;Rc.endAt=Rc.t}
PT8.endRace=endRace;
finishCheck=()=>{const Rc=RACE;if(Rc.ending>0)return;
 if(Rc.mode==='cutup'){if(Rc.timeLeft<=0)endRace();return}
 const N=Rc.T.N;
 for(const c of Rc.cars)if(!c.fin&&c.unw>=Rc.laps*N){c.lapT.push(Rc.t-c.lapStart);c.fin=1;c.finT=Rc.t;c.place=Rc.fin.length+1;Rc.fin.push(c);c.cool=1;c.cine=null;if(c.human){beep(900,.4,'triangle');c.finFlash=3.2;if(!Rc.firstHuman)Rc.firstHuman=Rc.t}}
 const left=Rc.cars.filter(c=>c.human&&!c.fin).length;
 if(!left)endRace();
 else if(Rc.firstHuman&&Rc.t>Rc.firstHuman+50)endRace();
};
function lapTrack(c){const Rc=RACE,N=Rc.T.N;if(c.fin)return;const lap=Math.floor(c.unw/N);if(lap>c.curLap&&lap>=1){c.lapT.push(Rc.t-c.lapStart);c.lapStart=Rc.t;c.curLap=lap;c.lapFlash=2.2}else if(lap<c.curLap)c.curLap=Math.max(0,lap)}
const baseStep=step;
step=dt=>{const Rc=RACE;
 if(Rc.state==='race'){for(const c of Rc.cars)lapTrack(c)}
 baseStep(dt);
 if(Rc.state==='race'&&PT8.modeTick)PT8.modeTick(Rc,dt);
 if(PT8.dustTick)PT8.dustTick(Rc,dt);
 for(const c of Rc.cars){if(c.finFlash>0)c.finFlash-=dt;if(c.lapFlash>0)c.lapFlash-=dt}
 if(Rc.ending>0){Rc.ending-=dt;if(Rc.ending<=0){Rc.state='done';Rc.shown=1;stopEng();if(PT8.showResults)PT8.showResults()}}
 Rc.shown=1;
};
/* single exit point for the old results screen: never show it */
const oldShow=show;

/* ---------------- audio: humans only ---------------- */
const oldEng=engineSnd;engineSnd=(c,i)=>{if(c.human)oldEng(c,i)};

/* ---------------- clusters: finished cars never merge ---------------- */
clusters=function(R_){const hs=R_.cars.filter(c=>c.human),n=hs.length,par=hs.map((_,i)=>i),f=i=>par[i]==i?i:(par[i]=f(par[i]));
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=Math.hypot(hs[i].x-hs[j].x,hs[i].z-hs[j].z),key=i+'-'+j,was=R_.conn[key];const fin=hs[i].fin||hs[j].fin,tn=R_.T.tn&&(R_.T.tn[hs[i].idx|0]||R_.T.tn[hs[j].idx|0]);const on=!(window.PTO&&PTO.splitAlways===false)?false:!fin&&!tn&&(d<MERGE||(was&&d<SPLIT));R_.conn[key]=on;if(on)par[f(i)]=f(j)}
 const groups=new Map();hs.forEach((c,i)=>{const r=f(i);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(c)});return[...groups.values()].sort((a,b)=>a[0].k-b[0].k)};

/* ---------------- cinematic camera for finished humans ---------------- */
const prevSolo=soloCam,_a=new V(),_b=new V();
soloCam=(c,dt,out)=>{
 if(!(c.fin&&c.cool&&RACE&&RACE.state!=='count')){prevSolo(c,dt,out);return}
 const T=RACE.T,N=T.N,s=c.cine||(c.cine={t:0,shot:-1,pos:new V(),look:new V(),f:50,ang:0,init:0});
 const fx_=Math.sin(c.yaw),fz_=Math.cos(c.yaw),rx_=Math.cos(c.yaw),rz_=-Math.sin(c.yaw);
 s.t-=dt;
 const pickShot=()=>{s.shot=(s.shot+1)%5;s.t=2.6+Math.random()*1.2;s.init=0;s.ang=Math.random()*6.28};
 if(s.shot<0||s.t<=0)pickShot();
 const road=(i,lat)=>{i=((i%N)+N)%N;const sn=Math.sin(T.psi[i]),cs=Math.cos(T.psi[i]);return[T.x[i]+cs*lat,T.y[i]-lat*T.bank[i],T.z[i]-sn*lat]};
 const sh=s.shot;let wantPos=null,wantLook=null,fov=50;const cy=c.y+.9;
 if(sh===0||sh===4){ /* trackside / far high, static ahead of the car */
  if(!s.init){const ahead=Math.round((sh===0?28+c.sp*1.3:48+c.sp*1.5)/T.sp),side=Math.random()<.5?-1:1,p=road(c.idx+ahead,side*(T.hw[c.idx]+(sh===0?6:10)));s.pos.set(p[0],p[1]+(sh===0?1.2:(14+Math.random()*8)),p[2]);const g=RACE.T.surf(s.pos.x,s.pos.z,s.pos.y+3).h;if(sh===0)s.pos.y=Math.max(s.pos.y,g+1.1);s.init=1}
  wantPos=s.pos;wantLook=_a.set(c.x+c.vx*.12,cy,c.z+c.vz*.12);fov=sh===0?lerp(34,52,clamp(Math.hypot(c.x-s.pos.x,c.z-s.pos.z)/50,0,1)):44;
  /* car has gone past: new shot */
  const dx=c.x-s.pos.x,dz=c.z-s.pos.z;if(dx*fx_+dz*fz_>16)s.t=Math.min(s.t,.01);
 }else if(sh===1){ /* in front, low, looking back */
  wantPos=_b.set(c.x+fx_*(9+c.sp*.12),c.y+.9,c.z+fz_*(9+c.sp*.12));wantLook=_a.set(c.x,c.y+.9,c.z);fov=64;
 }else if(sh===2){ /* orbit */
  s.ang+=dt*.9;wantPos=_b.set(c.x+Math.cos(s.ang)*13,c.y+5.2,c.z+Math.sin(s.ang)*13);wantLook=_a.set(c.x,c.y+.8,c.z);fov=52;
 }else{ /* low rear-quarter chase */
  wantPos=_b.set(c.x-fx_*5.2+rx_*3.4,c.y+.8,c.z-fz_*5.2+rz_*3.4);wantLook=_a.set(c.x+fx_*3,c.y+.7,c.z+fz_*3);fov=72;
 }
 const k=(sh===0||sh===4)?1:1-Math.exp(-dt*(sh===1?6:9));
 if(s.sm===undefined||s.lastShot!==sh){s.lastShot=sh;s.sm=1;s.cur=s.cur||new V();s.cur.copy(wantPos);s.lk=s.lk||new V();s.lk.copy(wantLook)}
 s.cur.lerp(wantPos,k);s.lk.lerp(wantLook,1-Math.exp(-dt*12));s.f+=(fov-s.f)*(1-Math.exp(-dt*5));
 out.p.copy(s.cur);out.l.copy(s.lk);out.f=s.f;c.cb=0;c.inTn=false;
};
/* the old group-cam blend never applies to finished cars */
PT8.TAPS=taps;
/* universal shift keys: the keys either side of forward (Q/E, PageUp/PageDown, U/O, R/Y); rally/track handle their own */
PT8.SHIFTK=[{dn:'KeyQ',up:'KeyE',n:['Q','E']},{dn:'PageUp',up:'PageDown',n:['PAGE UP','PAGE DOWN']},{dn:'KeyU',up:'KeyO',n:['U','O']},{dn:'KeyR',up:'KeyY',n:['R','Y']}];
PT8.SHIFTK.forEach(k=>{GAME_KEYS.add(k.dn);GAME_KEYS.add(k.up)});
/* handbrake is a single-driver tool: off whenever more than one human is racing */
PT8.noHb=()=>!!(RACE&&RACE.cfg&&RACE.cfg.humans&&RACE.cfg.humans.length>1);
/* player 2 can use the arrow keys or the numpad (8 4 5 6, 7 / 9 shift) */
{const AR={u:'ArrowUp',d:'ArrowDown',l:'ArrowLeft',r:'ArrowRight',h:'ShiftRight'},NP={u:'Numpad8',d:'Numpad5',l:'Numpad4',r:'Numpad6',h:'Numpad0'};
 PT8.p2Keys=(window.PTO&&PTO.p2numpad)?'numpad':'arrows';
 PT8.setP2Keys=v=>{PT8.p2Keys=v==='numpad'?'numpad':'arrows';const np=PT8.p2Keys==='numpad';Object.assign(KM[1],np?NP:AR);Object.values(KM[1]).forEach(k=>GAME_KEYS.add(k));
  Object.assign(PT8.SHIFTK[1],np?{dn:'Numpad7',up:'Numpad9',n:['7','9']}:{dn:'PageUp',up:'PageDown',n:['PAGE UP','PAGE DOWN']});GAME_KEYS.add('Numpad7');GAME_KEYS.add('Numpad9');
  if(PT8.rallyP2)PT8.rallyP2(np);if(window.PTO&&PTO.p2numpad!==np){PTO.p2numpad=np;try{localStorage.setItem('pt7-options',JSON.stringify(PTO))}catch(e){}}};
 PT8.syncP2=()=>{const v=(window.PTO&&PTO.p2numpad)?'numpad':'arrows';if(v!==PT8.p2Keys)PT8.setP2Keys(v)};
 PT8.p2Name=()=>PT8.p2Keys==='numpad'?'numpad 8 4 5 6':'arrows'}
addEventListener('keydown',e=>{if(e.repeat||!RACE||RACE.cfg.rally||scr!=='game')return;PT8.SHIFTK.forEach((k,p)=>{if(e.code===k.dn)taps[p].qd=1;else if(e.code===k.up)taps[p].qu=1})});
PT8.setP2Keys(PT8.p2Keys);
})();
