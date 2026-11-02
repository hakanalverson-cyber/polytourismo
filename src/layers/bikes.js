/* ===== Poly GT layer: Highway Cut-Up (bikes only). Endless highway, 1-2 riders in split screen, traffic that signals and changes lanes,
   8 tricks from a per-rider trick menu, wipeouts, head camera with the bars in view. World pieces are in bkworld.js ===== */
(function bikeMode(){
'use strict';
const P=window.PT8;if(!P||!P.BK)return;
const BK=P.BK,{cl,lp,ss,rng,hexRGB}=BK.util,RD=BK.ROAD,PI=Math.PI;
const $i=id=>document.getElementById(id);
const wrapA=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const O=()=>window.PTO||{};
const kmh=()=>(O().units||'kmh')!=='mph';
const spd=v=>kmh()?v*3.6:v*2.237;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const SV=()=>{const s=P.SV();return s.bk||(s.bk={best:0,sel:[{id:null,paint:0},{id:null,paint:1}],opt:{clock:180,traffic:'normal',tod:'day'},runs:0})};

/* ---------------- tricks ---------------- */
/* kind: 'wheelie' (front up, balance with throttle and rear brake), 'stoppie' (rear up on the front brake), 'balance' (a held move with a wobble you steer against),
   'burnout' (stand still, spin the rear). pps = points per second; min/max = speed window (m/s) */
const TRICKS=[
 {id:'wheelie',n:'Wheelie',k:'wheelie',pps:120,min:3,max:70,d:'Hold the trick key with the throttle on to lift the front. Throttle lifts, the rear brake (S) brings it down. Too far and you loop out.'},
 {id:'stoppie',n:'Stoppie',k:'stoppie',pps:170,min:9,max:60,d:'Hold the trick key and brake hard: the rear wheel lifts. Ease the brake to hold it. Too much and you go over the bars.'},
 {id:'standup',n:'Stand-Up Wheelie',k:'wheelie',stand:1,pps:190,min:3,max:55,d:'A wheelie standing on the pegs. Narrower balance than the sit-down one, more points.'},
 {id:'twelve',n:'12 O’Clock',k:'wheelie',twelve:1,pps:300,min:3,max:40,d:'Take a wheelie past 70°, nearly straight up. Points only count while you are past the line.'},
 {id:'nohands',n:'No-Hander',k:'balance',pps:150,min:10,max:80,d:'Let go of the bars and ride on. Steer against the wobble with A / D. Lean too far and you are down.'},
 {id:'superman',n:'Superman',k:'balance',pps:230,min:14,max:70,wob:1.35,d:'Stretch out flat behind the bars, legs off the back. Bigger wobble, bigger score.'},
 {id:'seatstand',n:'Seat Stand',k:'balance',pps:260,min:8,max:55,wob:1.6,d:'Climb up and stand on the seat with your arms out. The hardest balance of them all.'},
 {id:'burnout',n:'Burnout',k:'burnout',pps:110,min:0,max:4,d:'Stop, hold the trick key and the throttle: the front brake holds the bike while the rear spins up smoke.'}];
BK.TRICKS=TRICKS;
const TBY={};TRICKS.forEach((t,i)=>{TBY[t.id]=t;t.i=i});

/* ---------------- keys ---------------- */
const KEYS=[{u:'KeyW',d:'KeyS',l:'KeyA',r:'KeyD',t:'Space',m:'KeyQ',c:'KeyC',name:'W A S D',tn:'SPACE',mn:'Q',cn:'C'},
 {u:'ArrowUp',d:'ArrowDown',l:'ArrowLeft',r:'ArrowRight',t:'ShiftRight',m:'Slash',c:'Period',alt:{t:['Numpad0','ControlRight'],m:['NumpadEnter','Enter'],c:['NumpadDecimal']},name:'ARROWS',tn:'R-SHIFT',mn:'/',cn:'.'}];
const down=new Set();let B=null,PR=null;/* B = live run, PR = prep screen */
const kd=(p,k)=>{const K=KEYS[p];if(down.has(K[k]))return true;const a=K.alt&&K.alt[k];return!!(a&&a.some(x=>down.has(x)))};
const isKey=(p,k,code)=>{const K=KEYS[p];return K[k]===code||!!(K.alt&&K.alt[k]&&K.alt[k].includes(code))};
const active=()=>scr==='bike'||scr==='bikeprep'||scr==='bikeres';
addEventListener('keydown',e=>{if(!active())return;down.add(e.code);
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Tab'].includes(e.code))e.preventDefault();
 if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();onEsc();return}
 if(e.repeat)return;
 if(scr==='bike'&&B)runKey(e.code);else if(scr==='bikeprep'&&PR)prepKey(e.code);else if(scr==='bikeres')resKey(e.code);
 e.stopImmediatePropagation()},true);
addEventListener('keyup',e=>{down.delete(e.code)},true);
addEventListener('blur',()=>down.clear());
/* gamepads: stick X leans, RT throttle, LT brake, A trick, Y menu, B camera, Start pause */
const padIn=p=>{try{const g=navigator.getGamepads?navigator.getGamepads()[p]:null;if(!g)return null;const b=i=>g.buttons[i]?g.buttons[i].value:0;const x=Math.abs(g.axes[0])>.12?g.axes[0]:0;
 return{st:x,th:b(7),br:b(6),t:b(0)>.5,m:b(3)>.5,c:b(1)>.5,up:b(12)>.5,dn:b(13)>.5,lf:b(14)>.5,rt:b(15)>.5,st0:b(9)>.5}}catch(e){return null}};

/* ---------------- audio ---------------- */
const AU={ctx:()=>{try{return P.audioReady?P.audioReady():null}catch(e){return null}},on:()=>!!(P.aud&&P.aud.on())};
function engineFor(kind){const a=AU.ctx();if(!a||!P.aud||!P.aud.mg)return null;try{
 const o1=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),w=a.createBufferSource(),wf=a.createBiquadFilter(),wg=a.createGain();
 o1.type='sawtooth';o2.type='square';f.type='lowpass';f.Q.value=4;g.gain.value=0;o1.connect(f);o2.connect(f);f.connect(g);g.connect(P.aud.mg());
 w.buffer=P.aud.nb();w.loop=true;wf.type='bandpass';wf.frequency.value=900;wf.Q.value=.6;wg.gain.value=0;w.connect(wf);wf.connect(wg);wg.connect(P.aud.mg());
 o1.start();o2.start();w.start(0,Math.random());
 const base=kind==='SCOOTER'?52:kind==='CRUISER'||kind==='TOURER'?26:kind==='DIRT'?44:kind==='SUPERSPORT'||kind==='SPORT'?58:38;
 return{a,o1,o2,f,g,w,wf,wg,base,set(rpm,th,v,on){const t=a.currentTime,O_=O(),ev=(O_.master==null?.7:O_.master)*(O_.engine==null?.55:O_.engine);const fr=base*(1+rpm*2.6);
   o1.frequency.setTargetAtTime(fr,t,.03);o2.frequency.setTargetAtTime(fr*.5,t,.03);f.frequency.setTargetAtTime(400+rpm*1800+th*1400,t,.05);
   g.gain.setTargetAtTime(on&&AU.on()?(.035+th*.05)*ev:0,t,.08);wg.gain.setTargetAtTime(on&&AU.on()?Math.min(.12,v*v*.00004)*ev:0,t,.2)},
  stop(){try{const t=a.currentTime;g.gain.setTargetAtTime(0,t,.05);wg.gain.setTargetAtTime(0,t,.05);setTimeout(()=>{try{o1.stop();o2.stop();w.stop();g.disconnect();wg.disconnect()}catch(e){}},300)}catch(e){}}}}catch(e){return null}}
const sfx={hiss:(d,v,f0,f1,q,ty)=>{try{P.aud.hiss(d,v,f0,f1,q,ty)}catch(e){}},tone:(a,b,d,t,v)=>{try{P.aud.tone(a,b,d,t,v)}catch(e){}},
 near:()=>{sfx.hiss(.35,.55,2400,500,.9,'bandpass')},trick:k=>{sfx.tone(660+k*60,990+k*60,.12,'triangle',.5)},land:()=>{sfx.tone(520,780,.18,'sine',.6);sfx.tone(780,1170,.22,'sine',.4)},
 crash:()=>{sfx.hiss(.9,1.2,1400,120,.5,'lowpass');sfx.tone(140,40,.5,'sawtooth',.9)},scrape:()=>{sfx.hiss(.25,.6,3200,1800,2,'bandpass')},ui:n=>{try{P.sfx&&P.sfx(n)}catch(e){}}};

/* ---------------- run setup ---------------- */
const RIDER_COL=[{suit:0x24407a,trim:0xe6e9ec,helm:0xf0f0f0},{suit:0x7a1f24,trim:0xf2c14e,helm:0x1b1d21}];
const PCOL=['#5aa9ff','#ff6a5a'];
function newPlayer(k,sel){const d=BK.byId(sel.id),m=BK.makeBike(d.id,BK.paintOf(d,sel.paint),Object.assign({},RIDER_COL[k],{who:sel.who==null?k:sel.who}));BK.riderLayer(m.rider,k);
 const st=d.stats||{top:200,acc:.8,hnd:.8,trk:.8};
 return{k,d,m,sel,vmax:st.top/3.6,acc:3.2+st.acc*5.4,hnd:st.hnd,trk:st.trk,s:40+k*0,d_:RD.laneD(2+k)*1-0,dd:0,psi:0,v:0,lean:0,steer:0,stv:0,pitch:0,pv:0,
  th:0,br:0,st:0,score:0,mult:1,comboT:0,chain:0,best:0,bestCombo:0,top:0,near:0,splits:0,tricks:0,wipes:0,dist:0,bestTrick:null,
  equip:sel.trick||'wheelie',menu:false,menuSel:0,trk_:null,cam:0,wipe:null,ghost:0,pose:null,eng:null,popQ:[],gear:1,rpm:0,bal:0,balV:0,smoke:0,trickPts:0,scrape:0,lastTrick:-9}}
const START_S=60;
function startRun(o){/* o: {players:[{id,paint,trick}], clock, traffic, tod} */
 stopPrep();endRun(true);
 const sc=new THREE.Scene(),tod=BK.TOD[o.tod]||BK.TOD.day;sc.fog=new THREE.Fog(tod.fog,tod.fogN,tod.fogF);
 const hemi=new THREE.HemisphereLight(tod.hemi[0],tod.hemi[1],tod.hemi[2]);sc.add(hemi);const sun=new THREE.DirectionalLight(tod.sun[0],tod.sun[1]);sun.position.fromArray(tod.sunPos).multiplyScalar(100);sc.add(sun);sc.add(sun.target);
 const road=BK.makeRoad(((Math.random()*1e6)|0)+1),world=BK.makeWorld(sc,road,{tod:o.tod}),sky=BK.makeSky(sc,tod);
 const pl=o.players.map((s,k)=>newPlayer(k,s));
 pl.forEach((p,k)=>{p.s=START_S-k*0;p.d_=RD.laneD(o.players.length>1?(k?3:1):2);sc.add(p.m.g)});
 const cams=pl.map(()=>new THREE.PerspectiveCamera(72,1,.03,3200));
 B={o,sc,tod,road,world,sky,pl,cams,tr:[],t:0,state:'count',cd:3.6,clock:o.clock||0,left:o.clock||0,paused:false,rngT:rng(((Math.random()*1e6)|0)+3),spawnT:0,fx:[],hemi,sun,exp0:R.toneMappingExposure,fr:0};
 R.toneMappingExposure=tod.exp;
 world.fill(START_S-200,START_S+600);
 trafficInit();
 for(const p of B.pl){p.eng=engineFor(p.d.kind);poseRiderFor(p,0);}
 buildHud();show('bike');paused=false;document.body.classList.add('bkOn');
 if(typeof rs==='function')rs();
 SV().runs++;try{P.save()}catch(e){}}
function endRun(silent){if(!B)return;for(const p of B.pl){if(p.eng)p.eng.stop();BK.disposeBike(p.m);if(p.wipe&&p.wipe.rg&&p.wipe.rg.parent)p.wipe.rg.parent.remove(p.wipe.rg)}
 for(const v of B.tr)B.sc.remove(v.m.g);B.world.dispose();B.sky.dispose();for(const f of B.fx){B.sc.remove(f.m);f.m.geometry.dispose();f.m.material.dispose()}
 R.toneMappingExposure=B.exp0;B=null;const h=$i('bkHud');if(h)h.style.display='none';document.body.classList.remove('bkOn');if(!silent){}}

/* ---------------- traffic: IDM car following, MOBIL-style lane changes with indicators, exits ---------------- */
const DENS={light:5,normal:9,heavy:15};/* vehicles per km per lane, our side */
function laneOf(d){return Math.round((d-RD.D0)/RD.LW-.5)}
function spawnVeh(s,lane,side,opt){const r=B.rngT,kind=BK.pickKind(r),m=BK.makeVehicle(kind,BK.pickPaint(r),B.tod.lamps>0,r),t=m.t;B.sc.add(m.g);
 const fast=lane===0?1.08:lane===1?1.02:lane===2?.97:.92;
 const v0=(t.v[0]+r()*(t.v[1]-t.v[0]))*(side>0?fast:1)*(opt&&opt.v0k||1);
 const v={m,kind,t,L:t.L,W:t.W,side,lane,s,d:side*RD.laneD(lane),v:v0*.9,v0,a:t.a,b:2.6,T:1.3+r()*.5,sig:0,sigT:0,chg:null,think:1+r()*3,exit:false,hit:0,haz:0,brk:0,yaw:0,y:0,blink:r(),dead:false};
 if(side>0&&r()<.3)v.exit=true;
 placeVeh(v);B.tr.push(v);return v}
function gapOK(s,lane,side,need){for(const v of B.tr){if(v.side!==side)continue;if((v.lane===lane||(v.chg&&v.chg.to===lane))&&Math.abs(v.s-s)<need+v.L/2)return false}
 for(const p of B.pl)if(side>0&&Math.abs(laneOf(p.d_)-lane)<1&&Math.abs(p.s-s)<need)return false;return true}
function trafficInit(){const dens=DENS[B.o.traffic]||DENS.normal,r=B.rngT;
 for(let lane=0;lane<4;lane++){let s=START_S-200;while(s<START_S+1100){s+=1000/dens*(.55+r()*.9);if(Math.abs(s-START_S)<70)continue;if(gapOK(s,lane,1,22))spawnVeh(s,lane,1)}}
 for(let lane=0;lane<4;lane++){let s=START_S-200;while(s<START_S+1300){s+=1000/(dens*.8)*(.55+r()*.9);if(gapOK(s,lane,-1,25))spawnVeh(s,lane,-1)}}}
const _pp={};
function placeVeh(v){let d=v.d,yo=0;if(v.ramp!=null){const t=v.s-v.ramp;d=RD.EDGE+RD.LW/2+BK.rampD(t);yo=BK.rampY(t)}
 B.road.pos(v.s,d,_pp);const hd=v.side>0?_pp.h:_pp.h+PI;
 let dy=0;if(v.chg){const c=v.chg,u=cl(c.t/c.dur,0,1);dy=Math.sin(u*PI)*(c.to>c.from?-1:1)*.09*v.side}
 if(v.ramp!=null){const t=v.s-v.ramp;dy=-Math.atan(BK.rampD(t+1)-BK.rampD(t))}
 v.m.g.position.set(_pp.x,_pp.y+yo,_pp.z);v.m.g.rotation.set(-Math.atan(_pp.g)*(v.side>0?1:-1),hd+dy+(v.hit>0?v.spin||0:0),0,'YXZ')}
/* lead vehicle in a lane: gap (bumper to bumper) and its speed */
function leader(v,lane,s){let best=1e9,lv=v.v0;const sd=v.side;
 for(const u of B.tr){if(u===v||u.side!==sd||u.ramp!=null)continue;const occ=u.lane===lane||(u.chg&&(u.chg.to===lane||u.chg.from===lane));if(!occ)continue;const g=(u.s-s)*sd-(u.L+v.L)/2;if(g>-v.L*.5&&g<best){best=g;lv=u.hit>0?0:u.v}}
 if(sd>0)for(const p of B.pl){if(p.wipe&&p.wipe.t<.1)continue;const pd=p.wipe?p.wipe.bd:p.d_,ps=p.wipe?p.wipe.bs:p.s;if(Math.abs(pd-RD.laneD(lane))>2.1)continue;const g=ps-s-1.1-v.L/2;if(g>-1&&g<best){best=g;lv=p.wipe?0:p.v*Math.cos(p.psi)}}
 return[best,lv]}
function follower(v,lane,s){let best=1e9,fv=null;for(const u of B.tr){if(u===v||u.side!==v.side||u.ramp!=null)continue;const occ=u.lane===lane||(u.chg&&u.chg.to===lane);if(!occ)continue;const g=(s-u.s)*v.side-(u.L+v.L)/2;if(g>-v.L*.5&&g<best){best=g;fv=u}}return[best,fv]}
function idm(v,gap,lv){const s0=2.5,vv=v.v,dv=vv-lv,sst=s0+Math.max(0,vv*v.T+vv*dv/(2*Math.sqrt(v.a*v.b)));return v.a*(1-Math.pow(vv/Math.max(1,v.v0),4)-Math.pow(sst/Math.max(.5,gap),2))}
function trafficStep(dt){const r=B.rngT,sMin=Math.min(...B.pl.map(p=>p.wipe?p.wipe.bs:p.s)),sMax=Math.max(...B.pl.map(p=>p.wipe?p.wipe.bs:p.s));
 for(const v of B.tr){
  v.blink+=dt;
  if(v.hit>0){v.hit-=dt;v.v=Math.max(0,v.v-9*dt);v.spin=(v.spin||0)*.98;v.s+=v.v*dt*v.side;if(v.hit<=0){v.haz=0;v.spin=0}placeVeh(v);lights(v,dt);continue}
  if(v.ramp!=null){v.v=Math.max(17,v.v-2*dt);v.s+=v.v*dt;if(v.s-v.ramp>250)v.dead=true;placeVeh(v);lights(v,dt);continue}
  const[g,lv]=leader(v,v.lane,v.s);let acc=idm(v,g,lv);
  if(v.chg){const[g2,lv2]=leader(v,v.chg.to,v.s);acc=Math.min(acc,idm(v,g2,lv2))}
  if(v.side>0){/* exit lane ends at the gore: anyone still in it must be exiting */
   const ex=B.road.exitNear(v.s+200);
   if(v.exit&&ex>-1e8){const toG=ex-v.s;if(v.lane===4&&toG<=0){v.ramp=ex;v.lane=4;v.d=RD.EDGE+RD.LW/2;v.sig=0;continue}
    if(v.lane===4)acc=Math.min(acc,(22*22-v.v*v.v)/(2*Math.max(30,toG+40)))}}
  v.brk=acc<-1.2?1:0;v.v=Math.max(0,v.v+acc*dt);v.s+=v.v*dt*v.side;
  /* lane change in progress */
  if(v.chg){const c=v.chg;if(v.sigT>0){v.sigT-=dt;if(v.sigT<=0){/* look again before moving */if(!safe(v,c.to)){v.chg=null;v.sig=0;v.think=1+r()*2}}}
   else{c.t+=dt;const u=ss(0,1,c.t/c.dur);v.d=v.side*lp(RD.laneD(c.from),RD.laneD(c.to),u);if(c.t>=c.dur){v.lane=c.to;v.d=v.side*RD.laneD(c.to);v.chg=null;v.offT=.6}}}
  else{if(v.offT>0){v.offT-=dt;if(v.offT<=0)v.sig=0}
   v.think-=dt;if(v.think<=0&&v.side>0){v.think=1.2+r()*2.2;decide(v)}}
  placeVeh(v);lights(v,dt)}
 /* despawn / spawn */
 for(const v of B.tr)if(!v.dead&&(v.s<sMin-320||v.s>sMax+1500))v.dead=true;
 for(let i=B.tr.length-1;i>=0;i--)if(B.tr[i].dead){B.sc.remove(B.tr[i].m.g);B.tr.splice(i,1)}
 B.spawnT-=dt;if(B.spawnT<=0){B.spawnT=.25;const dens=DENS[B.o.traffic]||DENS.normal;
  const ahead=s=>B.tr.filter(v=>v.side>0&&v.s>s&&v.s<s+1100).length,want=dens*4*1.1;
  if(ahead(sMax-150)<want){const lane=(r()*4)|0,s=sMax+850+r()*300;if(gapOK(s,lane,1,30))spawnVeh(s,lane,1)}
  /* faster traffic coming up from behind in the left lanes */
  if(r()<.08){const lane=r()<.6?0:1,s=sMin-240;if(gapOK(s,lane,1,40)&&B.tr.filter(v=>v.side>0&&v.s<sMin).length<6)spawnVeh(s,lane,1,{v0k:1.25})}
  const onc=B.tr.filter(v=>v.side<0&&v.s>sMax).length;if(onc<dens*4*.9){const lane=(r()*4)|0,s=sMax+1000+r()*350;if(gapOK(s,lane,-1,30))spawnVeh(s,lane,-1)}}}
function safe(v,lane){const[gf,lvf]=leader(v,lane,v.s);if(gf<Math.max(6,v.v*.6))return false;const[gb,fv]=follower(v,lane,v.s);if(fv){if(gb<Math.max(5,fv.v*.5))return false;const an=idm(fv,gb,v.v);if(an<-3)return false}
 if(v.side>0)for(const p of B.pl){if(p.wipe)continue;if(Math.abs(p.d_-RD.laneD(lane))<2.2&&Math.abs(p.s-v.s)<v.L/2+6)return false}return true}
function decide(v){const opts=[];const ex=B.road.exitNear(v.s+200),toG=ex-v.s,exitZone=v.exit&&ex>-1e8&&toG<1000&&toG>40;
 const[g0,l0]=leader(v,v.lane,v.s),a0=idm(v,g0,l0);
 for(const dl of[-1,1]){const to=v.lane+dl;if(to<0||to>4)continue;
  if(to===4){if(!(exitZone&&toG<240&&toG>60))continue}
  if(v.lane===4)continue;
  const[g,l]=leader(v,to,v.s),a1=idm(v,g,l);let inc=a1-a0+(dl>0?.12:-.08);
  if(exitZone)inc+=dl>0?2.5:-3;if(v.kind==='semi'||v.kind==='box'||v.kind==='bus'){if(to<2)inc-=1.5}
  if(inc>.35&&safe(v,to))opts.push([inc,to])}
 if(!opts.length)return;opts.sort((a,b)=>b[0]-a[0]);const to=opts[0][1];v.chg={from:v.lane,to,t:0,dur:3.2+B.rngT()*1.2};v.sig=to>v.lane?1:-1;v.sigT=1.4+B.rngT()*.8;v.blink=0}
/* lights, plus distance culling: past 560 m a car is a few pixels in the fog, so it is not drawn at all; small lenses that are off are only drawn up close */
function lights(v,dt){const on=(v.blink%0.7)<.38,m=v.m;const L=BK.LM;let dn=1e9;for(const p of B.pl){const q=Math.abs(v.s-p.s);if(q<dn)dn=q}
 const vis=dn<560;m.g.visible=vis;if(!vis)return;const near=dn<90;
 const left=v.haz||(v.sig<0),right=v.haz||(v.sig>0),bk=v.brk||v.hit>0;/* sig + = right (as seen from the driver) */
 m.iL.material=left&&on?L.on:L.off;m.iR.material=right&&on?L.on:L.off;m.br.material=bk?L.brOn:L.brOff;
 m.iL.visible=near||(left&&on);m.iR.visible=near||(right&&on);m.br.visible=near||bk;m.hd.visible=near||B.tod.lamps>0;if(m.sh)m.sh.visible=dn<220}

/* ---------------- rider poses ---------------- */
/* seated posture: hips on the seat, the torso leaned until the shoulders sit an arm's reach (~.58 m) from the grips */
function seatFit(I){if(I._fit)return I._fit;const g=I.grip,hy=I.seat[1]+.1;let hz=Math.min(I.seat[2]-.04,g[2]-.5);const reach=Math.sqrt(.58*.58-Math.pow(g[0]-.2,2)*.5);
 const f=l=>Math.hypot(hy+.5*Math.cos(l)-g[1],hz+.5*Math.sin(l)-g[2]);let lo=-.25,hi=1.2;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(f(m)>reach)lo=m;else hi=m}
 let lean=Math.min(1.0,(lo+hi)/2);/* still too far (low clip-ons): slide the hips forward instead of folding further */
 for(let i=0;i<20&&f(lean)>reach+.01;i++)hz+=.02;return I._fit={hz,hy,lean}}
function basePose(p){const I=p.m.I,peg=I.peg,F=seatFit(I);
 return{hip:[0,F.hy,F.hz],lean:F.lean,side:0,hands:null,feet:[[peg[0],peg[1]+.06,peg[2]+.05],[peg[0],peg[1]+.06,peg[2]+.05]],look:-.05}}
function trickPose(p,id,u){const b=basePose(p),I=p.m.I,seat=I.seat;
 switch(id){
  case'wheelie':return Object.assign(b,{lean:b.lean+.35*u});
  case'standup':return Object.assign(b,{hip:[0,seat[1]+.1+.42*u,seat[2]+.14*u],lean:b.lean+.5*u});
  case'twelve':return Object.assign(b,{hip:[0,seat[1]+.1+.34*u,seat[2]-.04*u],lean:b.lean+1.0*u,look:-.3*u});
  case'stoppie':return Object.assign(b,{hip:[0,seat[1]+.1+.22*u,seat[2]-.2*u],lean:b.lean-.35*u,look:.15*u});
  case'nohands':{const sy=seat[1]+.1+.5;return Object.assign(b,{lean:lp(b.lean,-.02,u),hands:u>.05?[[.42,sy+.42*u+.1,seat[2]+.15],[.42,sy+.42*u+.1,seat[2]+.15]]:null})}
  case'superman':return Object.assign(b,{hip:[0,seat[1]+.1+.32*u,seat[2]-.5*u],lean:lp(b.lean,1.35,u),feet:[[.12,seat[1]+.2+.3*u,seat[2]-1.05*u],[.12,seat[1]+.25+.3*u,seat[2]-1.0*u]],look:.35*u});
  case'seatstand':{const fy=seat[1]+.06;return Object.assign(b,{hip:[0,seat[1]+.1+.62*u,seat[2]-.06*u],lean:lp(b.lean,.08,u),feet:u>.3?[[.13,fy,seat[2]+.02],[.13,fy,seat[2]-.12]]:b.feet,
    hands:u>.4?[[.75,seat[1]+1.18,seat[2]+.02],[.75,seat[1]+1.18,seat[2]-.02]]:null,look:.1})}
  case'burnout':return Object.assign(b,{lean:b.lean+.25*u,feet:[[I.peg[0]+.08,.05,I.peg[2]+.35],b.feet[1]]});
 }return b}
function mixPose(a,b,u){const L=(x,y)=>x.map((v,i)=>lp(v,y[i],u));return{hip:L(a.hip,b.hip),lean:lp(a.lean,b.lean,u),side:lp(a.side||0,b.side||0,u),look:lp(a.look||0,b.look||0,u),
 hands:(a.hands||b.hands)&&u>.5?b.hands:a.hands&&u<=.5?a.hands:null,feet:[L(a.feet[0],b.feet[0]),L(a.feet[1],b.feet[1])]}}
function poseRiderFor(p,dt){const t=p.trk_;const id=t?t.id:p.lastPose||'wheelie';p.tu=lp(p.tu||0,t?1:0,cl(dt*7,0,1));if(t)p.lastPose=t.id;
 const ps=p.tu>.01?trickPose(p,id,p.tu):basePose(p);ps.side=(ps.side||0)-p.lean*.25;
 /* stopped: the left foot goes down to the road (people riders) */
 p.fd=lp(p.fd||0,(!p.trk_&&p.v<1.2&&!p.wipe)?1:0,cl(dt*4,0,1));if(p.fd>.01&&p.m.rider&&p.m.rider.people){const f=ps.feet[0].slice(),I=p.m.I;ps.feet[0]=[lp(f[0],I.peg[0]+.2,p.fd),lp(f[1],-.02,p.fd),lp(f[2],I.peg[2]+.18,p.fd)];ps.side-=.06*p.fd}
 BK.poseRider(p.m,ps)}

/* ---------------- bike physics ---------------- */
const G=9.81;
function inputs(p){const K=KEYS[p.k],pad=padIn(p.k);let th=kd(p.k,'u')?1:0,br=kd(p.k,'d')?1:0,st=(kd(p.k,'r')?1:0)-(kd(p.k,'l')?1:0),tr=kd(p.k,'t');
 if(pad){th=Math.max(th,pad.th);br=Math.max(br,pad.br);if(pad.st)st=pad.st;tr=tr||pad.t;
  if(pad.m&&!p.padM)toggleMenu(p);p.padM=pad.m;if(pad.c&&!p.padC)p.cam=(p.cam+1)%2;p.padC=pad.c;
  if(p.menu){if(pad.up&&!p.padU)menuMove(p,-1);if(pad.dn&&!p.padD)menuMove(p,1);p.padU=pad.up;p.padD=pad.dn}}
 if(p.menu){/* the menu takes up / down; the throttle holds where it was */th=p.th>.5?1:0;br=0}
 return{th,br,st,tr}}
function physStep(p,dt){if(p.wipe){wipeStep(p,dt);return}
 const I=inputs(p),live=B.state==='ride';const th=live?I.th:0,br=live?I.br:(B.state==='count'?1:0);
 p.th=lp(p.th,th,cl(dt*8,0,1));p.br=br;p.ghost=Math.max(0,p.ghost-dt);
 const v=p.v,T=p.trk_;
 /* trick start / end */
 const want=I.tr&&live&&!p.menu;
 if(want&&!T&&p.t2==null){const t=TBY[p.equip];if(canStart(p,t))beginTrick(p,t);else if(!p.warnT||B.t-p.warnT>1.2){p.warnT=B.t;pop(p,needMsg(p,t),'#c9d2d8',.9)}}
 if(T&&!want&&T.k!=='wheelie'&&T.k!=='stoppie')endTrick(p,true);
 /* drive force */
 let a=0;const top=p.vmax;
 const thr=T&&T.k==='burnout'?0:p.th;
 a+=thr*p.acc*Math.max(0,1-Math.pow(v/top,2.2))*(v<4?.85:1);
 a-=.0042*v*v+.15;/* drag + rolling */
 const brk=T&&T.k==='burnout'?1:p.br;
 if(brk>0&&v>0)a-=brk*(T&&T.k==='stoppie'?6.2:9.2);
 p.v=Math.max(0,v+a*dt);if(p.v<.05&&brk>0)p.v=0;
 /* gears for sound and the dial */
 const gr=Math.min(6,1+Math.floor(p.v/top*6.2));p.gear=gr;const lo=(gr-1)/6.2*top,hi=gr/6.2*top;p.rpm=cl((p.v-lo)/(hi-lo+1e-3),0,1)*.8+.15+(T&&T.k==='burnout'?.5*p.th:0);
 /* steering: target lean from input, yaw from the lean (coordinated turn); slow speeds steer the bars directly */
 let st=I.st;if(T&&T.k==='balance'){st=0}if(T&&(T.k==='wheelie'||T.k==='stoppie'))st*=.55;
 if(T&&T.k==='burnout')st*=.3;
 p.st=lp(p.st,st,cl(dt*(5+p.hnd*4),0,1));
 const vs=p.v,maxL=.78*ss(2,11,vs)*(.85+p.hnd*.2);let tl=p.st*maxL;
 if(T&&T.k==='balance')tl=p.bal*.55;
 p.lean=lp(p.lean,tl,cl(dt*(2.6+p.hnd*2.2),0,1));
 let w=0;if(vs>4)w=G*Math.tan(p.lean)/vs;
 const wl=vs*Math.tan(p.st*.55)/1.45;w=lp(wl,w,ss(3,9,vs));
 if(T&&T.k==='burnout'&&vs<1)w=p.st*.6;/* pivot the rear round on a burnout */
 const kap=B.road.kap(p.s);p.psi=wrapA(p.psi+w*dt-kap*vs*Math.cos(p.psi)*dt);
 /* bar angle: the real counter-steer is tiny, so the bars show the input */
 p.stv=lp(p.stv,cl(p.st*.32*(1-.55*ss(5,40,vs))+Math.atan(1.42*w/Math.max(vs,2))*.6,-.55,.55),cl(dt*10,0,1));
 const ds=vs*Math.cos(p.psi)*dt;p.s+=ds;p.d_+=vs*Math.sin(p.psi)*dt;if(ds>0)p.dist+=ds;
 /* tricks */
 trickStep(p,dt,I);
 /* walls */
 walls(p,dt);
 /* speed bookkeeping */
 if(spd(p.v)>p.top)p.top=spd(p.v);
 if(live&&p.v>36){p.score+=(p.v-36)*.6*dt*p.mult}}
function canStart(p,t){if(!t)return false;if(t.k==='burnout')return p.v<t.max;return p.v>=t.min&&p.v<=t.max}
function needMsg(p,t){if(t.k==='burnout')return'STOP FIRST FOR A BURNOUT';if(p.v<t.min)return'FASTER FOR '+t.n.toUpperCase();return'TOO FAST FOR '+t.n.toUpperCase()}
function beginTrick(p,t){p.trk_=t;p.tt=0;p.trickPts=0;p.bal=(Math.random()-.5)*.1;p.balV=0;if(t.k==='wheelie'&&p.pitch<.05){p.pv=Math.max(p.pv,(1.1+p.trk*.6)*(t.twelve?1.15:1))}
 if(t.k==='stoppie'){p.pv=Math.min(p.pv,-.6)}sfx.trick(t.i);pop(p,t.n.toUpperCase(),'#ffffff',.8,'t')}
function endTrick(p,clean){const t=p.trk_;if(!t)return;p.trk_=null;const pts=Math.round(p.trickPts);
 if(clean&&pts>20&&p.tt>.6){const bonus=Math.round(pts*.25*p.mult);p.score+=bonus;p.tricks++;bumpChain(p,1);if(!p.bestTrick||pts+bonus>p.bestTrick.pts)p.bestTrick={n:t.n,pts:pts+bonus};
  pop(p,t.n.toUpperCase()+'  '+p.tt.toFixed(1)+'s  +'+fmtN(pts+bonus),'#bfe0a8',1.6);sfx.land()}
 p.lastTrick=B.t}
function trickStep(p,dt,I){const t=p.trk_;
 /* pitch dynamics: gravity pulls the bike back to both wheels below the balance point and over it above; throttle lifts, rear brake drops */
 const bal=t&&t.twelve?1.38:1.05;/* wheelie balance angle (rad) */
 if(p.pitch>0||t&&t.k==='wheelie'){const top=t&&t.twelve?bal+.02:bal-.05,lift=t&&t.k==='wheelie'?p.th*(2.6+p.trk*1.6)*(p.v<25?1:ss(60,25,p.v)*.9+.1)*cl((top-p.pitch)/.45,0,1)+(Math.random()-.5)*1.6:0,drop=p.br*6;
  const gtq=-Math.cos(p.pitch)*(2.2+(bal-1)*1.5)+Math.max(0,p.pitch-bal)*4.2;
  p.pv+=(lift-drop+gtq-p.pv*.9)*dt;p.pitch+=p.pv*dt;
  if(p.pitch<=0){p.pitch=0;if(p.pv<-1.2&&t&&p.tt>.3){/* front slaps down */}p.pv=0;if(t&&t.k==='wheelie'&&p.tt>.25)endTrick(p,true)}
  if(p.pitch>(t&&t.twelve?1.62:1.45)){wipeout(p,'LOOPED OUT');return}}
 else if(p.pitch<0||t&&t.k==='stoppie'){const press=t&&t.k==='stoppie'?p.br*(2.4+p.trk*.9)*ss(3,12,p.v):0;
  const gtq=Math.cos(p.pitch)*2.3*(1-Math.min(0,p.pitch+.95)*-2)+Math.min(0,p.pitch+.95)*-3.5*0;
  p.pv+=(-press+gtq*(p.pitch<-.95?-1:1)-p.pv*1.2)*dt;p.pitch+=p.pv*dt;
  if(p.v<1.5&&t&&t.k==='stoppie')p.pv+=3*dt;
  if(p.pitch>=0){p.pitch=0;p.pv=0;if(t&&t.k==='stoppie'&&p.tt>.25)endTrick(p,true)}
  if(p.pitch<-1.15){wipeout(p,'OVER THE BARS');return}}
 if(!t){p.smoke=Math.max(0,p.smoke-dt);return}
 p.tt+=dt;let rate=0;
 if(t.k==='wheelie'){const ang=p.pitch*57.3;if(t.twelve)rate=ang>70?1:0;else rate=ang>12?(t.stand?(ang>20?1:.4):1):0;if(t.stand&&p.v<2)rate=0}
 else if(t.k==='stoppie'){rate=p.pitch<-.12?1:0;if(p.v<.6)endTrick(p,true)}
 else if(t.k==='balance'){/* wobble: a slow random push, unstable; A / D push back */
  const k=t.wob||1;p.balV+=((Math.random()-.5)*2.4*k+p.bal*(1.6*k)+I.st*(-3.4))*dt;p.balV*=1-dt*1.2;p.bal+=p.balV*dt;
  rate=1;if(Math.abs(p.bal)>1){wipeout(p,'LOST BALANCE');return}if(p.v<t.min*.7){endTrick(p,true);return}}
 else if(t.k==='burnout'){rate=p.th>.3?1:0;p.smoke=p.th;if(p.th>.3&&Math.random()<dt*24)smokePuff(p)}
 if(rate>0){const pts=t.pps*rate*dt*(.6+p.trk*.4);p.trickPts+=pts;p.score+=pts*p.mult;p.comboT=Math.max(p.comboT,2.2)}}
function walls(p,dt){const ex=B.road.exitNear(p.s+250),x=ex>-1e8&&p.s>ex-230&&p.s<ex?RD.LW:0;
 const lo=.62,hi=RD.SHO-.28+x,vlat=p.v*Math.sin(p.psi);
 if(p.d_<lo||p.d_>hi){const side=p.d_<lo?-1:1;p.d_=side<0?lo:hi;
  if(Math.abs(vlat)>7.5&&p.ghost<=0){wipeout(p,side<0?'HIT THE BARRIER':'HIT THE RAIL');return}
  p.psi=wrapA(-p.psi*.35);p.v*=.93;p.lean*=.6;if(p.scrape<=0){sfx.scrape();p.scrape=.3;spark(p,side)}if(p.mult>1){pop(p,'SCRAPE','#ef6a5a',.8)}}
 p.scrape=Math.max(0,p.scrape-dt);
 /* gore nose: the exit lane closes */
 if(ex>-1e8&&p.s>ex&&p.s<ex+3&&p.d_>RD.SHO-.28&&p.ghost<=0)wipeout(p,'HIT THE CUSHION')}

/* ---------------- scoring ---------------- */
function bumpChain(p,n){p.chain+=n;p.mult=Math.min(10,1+Math.floor(p.chain/2));p.comboT=4;if(p.mult>p.bestCombo)p.bestCombo=p.mult}
function scoreStep(p,dt){if(p.wipe)return;p.comboT-=dt;if(p.comboT<=0&&p.chain>0){if(p.mult>1)pop(p,'COMBO x'+p.mult+' BANKED','#9fc3e6',1.2);p.chain=0;p.mult=1}
 /* near misses and lane splits: pass a vehicle within 1.3 m */
 const pv=p.v*Math.cos(p.psi);
 for(const v of B.tr){if(v.side<0||v.ramp!=null||v.hit>0)continue;const ds=v.s-p.s;if(Math.abs(ds)>v.L/2+3){v['ps'+p.k]=Math.sign(ds);continue}
  const gap=Math.abs(v.d-p.d_)-v.W/2-.38;const prev=v['ps'+p.k];const now=Math.sign(ds);
  if(prev>0&&now<=0&&gap<1.3&&gap>-.05&&pv-v.v>3&&p.v>16&&B.state==='ride'){
   const close=gap<.6,base=close?260:150,pts=Math.round(base*(1+(p.v-16)/30)*p.mult);p.score+=pts;p.near++;bumpChain(p,1);
   /* a split: vehicles both sides at once */
   const other=B.tr.find(u=>u!==v&&u.side>0&&Math.abs(u.s-p.s)<u.L/2+2&&Math.sign(u.d-p.d_)!==Math.sign(v.d-p.d_)&&Math.abs(u.d-p.d_)<u.W/2+1.6);
   if(other){p.splits++;bumpChain(p,1);pop(p,'LANE SPLIT +'+fmtN(pts*2),'#ffd36a',1.4);p.score+=pts}else pop(p,(close?'CLOSE CALL':'NEAR MISS')+' +'+fmtN(pts),close?'#ffd36a':'#ffffff',1.1);sfx.near()}
  v['ps'+p.k]=now}}
function collide(p){if(p.wipe||p.ghost>0)return;const pd=p.d_,hw=.36+Math.abs(Math.sin(p.psi))*.9;
 for(const v of B.tr){if(v.side<0||v.ramp!=null)continue;const ds=p.s-v.s;if(Math.abs(ds)>v.L/2+1.1)continue;const dd=pd-v.d;if(Math.abs(dd)>v.W/2+hw)continue;
  /* inside the box: where from? */
  const ox=v.L/2+1.1-Math.abs(ds),oy=v.W/2+hw-Math.abs(dd);const vrel=p.v*Math.cos(p.psi)-(v.hit>0?v.v*.5:v.v);
  if(ox<oy){/* nose or tail: a rear-end */if(Math.abs(vrel)>4.5){hitVeh(v,p);wipeout(p,ds<0?'REAR-ENDED A '+vName(v):'HIT BY A '+vName(v));return}
   p.s=v.s+Math.sign(ds||-1)*(v.L/2+1.12);p.v=Math.max(0,v.v*(ds<0?.95:1.05));p.pv=0;pop(p,'BUMP','#ef6a5a',.8);sfx.scrape()}
  else{const lat=p.v*Math.sin(p.psi)*Math.sign(-dd);if(lat>5.5||p.trk_&&p.trk_.k==='balance'){hitVeh(v,p);wipeout(p,'SIDESWIPED A '+vName(v));return}
   p.d_=v.d+Math.sign(dd||1)*(v.W/2+hw+.02);p.psi=wrapA(p.psi*.3+Math.sign(dd)*.05);p.v*=.9;p.lean*=.5;if(p.scrape<=0){sfx.scrape();p.scrape=.35;spark(p,-Math.sign(dd))}
   if(p.chain>0){pop(p,'TRADED PAINT','#ef6a5a',.9);p.comboT=Math.min(p.comboT,.8)}}}}
const vName=v=>({sedan:'CAR',hatch:'CAR',suv:'SUV',pickup:'PICKUP',van:'VAN',box:'TRUCK',semi:'SEMI',bus:'BUS'})[v.kind]||'CAR';
function hitVeh(v,p){v.hit=4.5;v.haz=1;v.sig=0;v.chg=null;v.spin=(Math.random()-.5)*.08}

/* ---------------- wipeouts ---------------- */
function wipeout(p,why){if(p.wipe)return;if(p.trk_)p.trk_=null;
 const m=p.m,R_=m.rider,vf=p.v,ps=p.psi;p.wipes++;
 const lost=Math.round(p.score*0);if(p.chain>0)pop(p,'COMBO LOST','#ef6a5a',1.3);p.chain=0;p.mult=1;p.comboT=0;
 /* the rider leaves the bike: move the rider group into the scene at the same place */
 m.g.updateMatrixWorld(true);const wpos=new THREE.Vector3(),wq=new THREE.Quaternion();R_.g.getWorldPosition(wpos);R_.g.getWorldQuaternion(wq);
 const rg=R_.g;m.inner.remove(rg);B.sc.add(rg);rg.position.copy(wpos);rg.quaternion.copy(wq);
 const pitchUp=p.pitch;
 p.wipe={t:0,why,rg,rs:p.s,rd:p.d_,rh:.9,rvs:vf*Math.cos(ps)*.92,rvd:vf*Math.sin(ps)+(Math.random()-.5)*2,rvh:2.5+Math.min(6,vf*.12)+(pitchUp<0?3:0),
  spin:new THREE.Vector3((Math.random()-.5)*6+(pitchUp<0?-7:pitchUp>0?5:0),(Math.random()-.5)*4,(Math.random()-.5)*6),
  bs:p.s,bd:p.d_,bv:vf,bpsi:ps,bspin:(Math.random()-.5)*2.5,blean:p.lean,side:p.lean>=0?1:-1,bpitch:p.pitch};
 p.pitch=0;p.pv=0;sfx.crash();if(p.eng)p.eng.set(0,0,0,false);
 for(let i=0;i<10;i++)spark(p,(Math.random()-.5)*2);
 pop(p,'WIPEOUT','#ef6a5a',2.4,'w');pop(p,why,'#c9d2d8',2.2)}
const _wv=new THREE.Vector3(),_wq=new THREE.Quaternion(),_we=new THREE.Euler();
function wipeStep(p,dt){const w=p.wipe;w.t+=dt;
 /* rider: ballistic, then tumbling and sliding along the road */
 w.rvh-=G*dt;w.rs+=w.rvs*dt;w.rd+=w.rvd*dt;w.rh+=w.rvh*dt;
 if(w.rh<=.18){w.rh=.18;if(w.rvh<-1.5){w.rvh=-w.rvh*.32;w.spin.multiplyScalar(.7)}else w.rvh=0;const sp=Math.hypot(w.rvs,w.rvd);if(sp>.01){const f=Math.max(0,sp-6.5*dt)/sp;w.rvs*=f;w.rvd*=f}w.spin.multiplyScalar(1-dt*1.8)}
 if(w.rd<.5){w.rd=.5;w.rvd=Math.abs(w.rvd)*.3}if(w.rd>RD.SHO-.1){w.rd=RD.SHO-.1;w.rvd=-Math.abs(w.rvd)*.3}
 B.road.pos(w.rs,w.rd,_pp);w.rg.position.set(_pp.x,_pp.y+w.rh-.55,_pp.z);
 _wq.setFromEuler(_we.set(w.spin.x*dt,w.spin.y*dt,w.spin.z*dt));w.rg.quaternion.multiply(_wq);
 /* when slowed, lie flat-ish */
 if(w.rh<=.2&&Math.hypot(w.rvs,w.rvd)<3){const target=new THREE.Quaternion().setFromEuler(new THREE.Euler(-PI/2*.92,_pp.h,0,'YXZ'));w.rg.quaternion.slerp(target,cl(dt*2,0,1))}
 /* limbs flail */
 const ft=w.t*7,fl=Math.max(0,1-w.t*.4);
 BK.poseRider({rider:p.m.rider,I:p.m.I,steer:p.m.steer},{hip:[0,1,0],lean:Math.sin(ft*.7)*.4*fl,side:0,look:.3,
  hands:[[.55+Math.sin(ft)*.2*fl,1.35+Math.cos(ft*1.3)*.3*fl,.15],[.55+Math.cos(ft*1.1)*.2*fl,1.3+Math.sin(ft*.9)*.3*fl,-.1]],feet:[[.2+Math.sin(ft*.8)*.15*fl,.15,.3*Math.cos(ft)*fl],[.22,.2+Math.cos(ft*.6)*.2*fl,-.25]]});
 /* bike: falls on its side and slides, spinning, throwing sparks */
 w.bv=Math.max(0,w.bv-(w.bv>3?7.5:4)*dt);w.bpsi+=w.bspin*dt*(w.bv>.5?1:0);w.bs+=w.bv*Math.cos(w.bpsi)*dt;w.bd+=w.bv*Math.sin(w.bpsi)*dt;
 if(w.bd<.7){w.bd=.7;w.bpsi=-w.bpsi*.5}if(w.bd>RD.SHO-.3+0){w.bd=RD.SHO-.3;w.bpsi=-w.bpsi*.5}
 w.blean=lp(w.blean,w.side*1.32,cl(dt*3.2,0,1));w.bpitch=lp(w.bpitch,0,cl(dt*4,0,1));
 if(w.bv>4&&Math.random()<dt*30)spark(p,w.side,true);
 p.s=w.bs;p.d_=w.bd;p.psi=w.bpsi;p.v=0;p.lean=w.blean;p.pitch=w.bpitch;
 if(w.t>3.4||(w.t>2&&w.bv<.5&&Math.hypot(w.rvs,w.rvd)<.4)){if(!w.fade){w.fade=1;fadeFlash(p,()=>respawn(p))}}}
function respawn(p){const w=p.wipe;if(!w)return;const rg=w.rg;B.sc.remove(rg);p.m.inner.add(rg);rg.position.set(0,0,0);rg.quaternion.identity();
 /* back on the right shoulder side of the lane it stopped in, upright, slowly rolling */
 const s=Math.max(w.bs,w.rs)+4;let lane=cl(laneOf(w.bd),0,3);for(const v of B.tr){if(v.side>0&&Math.abs(v.s-s)<14&&v.lane===lane&&v.hit<=0)v.s=s+16}
 p.s=s;p.d_=RD.laneD(lane);p.psi=0;p.v=8;p.lean=0;p.pitch=0;p.pv=0;p.wipe=null;p.ghost=2.2;p.st=0;p.stv=0;p.tu=0;p.trk_=null}
function fadeFlash(p,cb){const h=hudOf(p);const f=h&&h.querySelector('.bkfade');if(f){f.style.opacity=1;setTimeout(()=>{cb();setTimeout(()=>{f.style.opacity=0},120)},420)}else cb()}

/* ---------------- effects: sparks and tyre smoke ---------------- */
const fxGeo=new THREE.BoxGeometry(.06,.06,.06),smGeo=new THREE.IcosahedronGeometry(.5,0);
function spark(p,side,slide){if(!B||B.fx.length>220)return;const m=new THREE.Mesh(fxGeo,new THREE.MeshBasicMaterial({color:0xffc060,toneMapped:false,transparent:true}));
 const w=p.wipe;B.road.pos(w?w.bs:p.s,(w?w.bd:p.d_)+side*.3,_pp);m.position.set(_pp.x,_pp.y+.15+Math.random()*.3,_pp.z);B.sc.add(m);
 const h=_pp.h-(w?w.bpsi:p.psi),sp=(w?w.bv:p.v)*.6;B.fx.push({m,t:.45+Math.random()*.3,v:new THREE.Vector3(Math.sin(h)*sp+(Math.random()-.5)*4,1+Math.random()*3,Math.cos(h)*sp+(Math.random()-.5)*4),g:1})}
function smokePuff(p){if(!B||B.fx.length>220)return;const m=new THREE.Mesh(smGeo,new THREE.MeshLambertMaterial({color:0xe6e8ea,transparent:true,opacity:.55,depthWrite:false}));
 const I=p.m.I;m.position.copy(new THREE.Vector3(0,I.rr,I.rw[2]-.1));p.m.inner.localToWorld(m.position);B.sc.add(m);m.scale.setScalar(.4);
 B.fx.push({m,t:1.6,v:new THREE.Vector3((Math.random()-.5)*1.2,.6+Math.random()*.6,(Math.random()-.5)*1.2),g:-.05,grow:1})}
function fxStep(dt){for(let i=B.fx.length-1;i>=0;i--){const f=B.fx[i];f.t-=dt;f.v.y-=9.8*dt*f.g;f.m.position.addScaledVector(f.v,dt);
 if(f.grow){f.m.scale.multiplyScalar(1+dt*1.1);f.m.material.opacity=Math.max(0,f.t/1.6*.55)}else f.m.material.opacity=Math.min(1,f.t*3);
 if(f.t<=0){B.sc.remove(f.m);f.m.material.dispose();B.fx.splice(i,1)}}}

/* ---------------- placing the bike ---------------- */
function placeBike(p,dt){const m=p.m,w=p.wipe;B.road.pos(p.s,p.d_,_pp);m.g.position.set(_pp.x,_pp.y,_pp.z);m.g.rotation.set(0,_pp.h-p.psi,0);
 m.g.rotation.x=0;const pitchRoad=-Math.atan(_pp.g)*Math.cos(p.psi);m.lean.rotation.x=pitchRoad;
 const rf=m.I.rf||.3,rr=m.I.rr||.3;const T=p.trk_;const rearSpin=T&&T.k==='burnout'?p.th*28:0;
 BK.poseBike(m,p.lean,p.pitch,w?0:p.stv,(w?0:p.v)*dt/rf,((w?0:p.v)+rearSpin)*dt/rr);
 m.sh.visible=!w||true;m.sh.position.y=.03;
 /* ghost after a respawn: blink */
 m.g.visible=!(p.ghost>0&&Math.floor(p.ghost*10)%2===0)}

/* ---------------- cameras ---------------- */
const _h=new THREE.Vector3(),_f=new THREE.Vector3(),_t=new THREE.Vector3();
function camStep(p,cam,dt,aspect){const m=p.m;cam.aspect=aspect;if(BK._dbgCam&&!p.wipe){BK._dbgCam(p,cam);cam.updateProjectionMatrix();return}
 if(p.wipe){/* follow the tumbling rider from behind and above */const w=p.wipe;w.rg.getWorldPosition(_t);const hd=_pp.h;B.road.at(w.rs,_fr);
  const want=_h.set(_t.x+Math.sin(_fr.h)*-7+Math.cos(_fr.h)*-2.5,_t.y+3.2,_t.z+Math.cos(_fr.h)*-7-Math.sin(_fr.h)*-2.5);
  if(!p.wc){p.wc=cam.position.clone()}p.wc.lerp(want,cl(dt*3,0,1));cam.position.copy(p.wc);cam.up.set(0,1,0);cam.lookAt(_t);cam.fov=60;cam.layers.enableAll();cam.updateProjectionMatrix();return}
 p.wc=null;
 if(p.cam===0){BK.headWorld(m,_h);
  const yaw=m.g.rotation.y;const fx=Math.sin(yaw),fz=Math.cos(yaw);
  cam.position.set(_h.x-fx*.06,_h.y+.05,_h.z-fz*.06);
  /* look down far enough that the real grips (wherever the pose and the pitch put them) sit in the bottom of the view */
  const I=m.I;_g2.set(0,I.grip[1],I.grip[2]);m.inner.localToWorld(_g2);const hz=(_g2.x-cam.position.x)*fx+(_g2.z-cam.position.z)*fz,al=Math.atan2(cam.position.y-_g2.y,Math.max(.15,hz));
  const FOV=82,want=-cl(al-FOV/2*.0174*.68,-.3,.58);p.cpt=p.cpt==null?want:lp(p.cpt,want,cl(dt*5,0,1));
  const pt=p.cpt;
  cam.rotation.set(pt,yaw+PI,-p.lean*.72,'YXZ');cam.rotation.order='YXZ';cam.rotation.set(pt,yaw+PI,0);
  /* roll about the view axis */cam.rotateZ(p.lean*.72);
  cam.fov=82;cam.layers.set(0);cam.layers.enable(1+(1-p.k));cam.layers.enable(3+p.k)/* own arms and legs (people riders) */}
 else{const yaw=m.g.rotation.y;const fx=Math.sin(yaw),fz=Math.cos(yaw);m.g.getWorldPosition(_t);
  /* the offset trails, not the position, so the camera never falls behind at speed */const want=_h.set(-fx*4.6,1.85+p.pitch*.6,-fz*4.6);if(!p.cc)p.cc=want.clone();p.cc.lerp(want,cl(dt*5,0,1));cam.position.copy(_t).add(p.cc);cam.up.set(0,1,0);cam.lookAt(_t.x+fx*2,_t.y+1.0,_t.z+fz*2);
  cam.fov=64;cam.layers.enableAll()}
 cam.updateProjectionMatrix()}
const _fr={},_g2=new THREE.Vector3();

/* ---------------- main loop ---------------- */
function step(dt){if(!B)return;const live=!B.paused;
 if(live){B.t+=dt;
  if(B.state==='count'){B.cd-=dt;const n=Math.ceil(B.cd-.6);if(n!==B.cdn){B.cdn=n;if(n>0){sfx.tone(880,880,.16,'sine',1)}else{sfx.tone(1760,1760,.5,'sine',1.1)}showCount(n>0?n:'GO')}if(B.cd<=.6){B.state='ride';}}
  if(B.state==='ride'&&B.clock>0){B.left-=dt;if(B.left<=0){B.left=0;finish();return}}
  for(const p of B.pl){physStep(p,dt);if(!B)return;collide(p);scoreStep(p,dt)}
  trafficStep(dt);fxStep(dt);
  const sMin=Math.min(...B.pl.map(p=>p.s)),sMax=Math.max(...B.pl.map(p=>p.s));B.world.update(sMin,sMax);for(const p of B.pl){const rn=B.world.regionName(p.s);if(rn!==p.reg){if(p.reg)pop(p,'ENTERING  '+rn.toUpperCase(),'#9fc3e6',2.4);p.reg=rn}}
  for(const p of B.pl){if(!p.wipe)poseRiderFor(p,dt);placeBike(p,dt);if(p.eng)p.eng.set(p.rpm,p.th,p.v,!p.wipe&&B.state!=='done')}}
 render(dt);hudStep(dt)}
function render(dt){const W=R.domElement.width,H=R.domElement.height,n=B.pl.length;R.setScissorTest(true);
 for(let i=0;i<n;i++){const p=B.pl[i],cam=B.cams[i],x=n>1?(i*W/2)|0:0,w=n>1?(W/2)|0:W;camStep(p,cam,dt,w/H);
  B.sky.follow(cam.position.x,cam.position.y,cam.position.z);
  R.setViewport(x,0,w,H);R.setScissor(x,0,w,H);R.render(B.sc,cam)}
 R.setScissorTest(false)}
function finish(){if(!B||B.state==='done')return;B.state='done';for(const p of B.pl){if(p.trk_)endTrick(p,true);if(p.eng)p.eng.set(0,0,0,false)}
 const res=B.pl.map(p=>({k:p.k,bike:p.d.name,score:Math.round(p.score),best:p.bestCombo,top:Math.round(p.top),near:p.near,splits:p.splits,tricks:p.tricks,wipes:p.wipes,dist:p.dist,bestTrick:p.bestTrick}));
 const total=res.reduce((a,r)=>a+r.score,0),cr=Math.round(Math.min(60000,total/12));const sv=SV();const top=Math.max(...res.map(r=>r.score));const nb=top>sv.best;if(nb)sv.best=top;
 if(cr>0&&P.earn)P.earn(cr);try{P.save()}catch(e){}
 setTimeout(()=>showResults(res,cr,nb),900)}

/* ---------------- HUD (PS3 plates) ---------------- */
const CSS=`
#bkHud{position:fixed;inset:0;z-index:40;pointer-events:none;display:none;font-family:var(--gt,"Inter",sans-serif);color:#f2f4f6;-webkit-font-smoothing:antialiased;
 --plate:linear-gradient(180deg,rgba(70,76,84,.66) 0%,rgba(30,33,37,.76) 50%,rgba(14,15,18,.82) 100%);--plhi:inset 0 1px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(255,255,255,.08),0 8px 26px rgba(0,0,0,.45);--cb:#8fb4d8}
#bkHud .pv{position:absolute;top:0;bottom:0;overflow:hidden}
#bkHud .pv.two+.pv.two{border-left:2px solid #000}
#bkHud .pl{position:absolute;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);background:var(--plate);box-shadow:var(--plhi);border-radius:8px}
#bkHud .sc{left:18px;top:16px;padding:10px 18px 10px 16px;min-width:170px}
#bkHud .sc small{display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.24em;color:#c9d2d8}#bkHud .sc small i{width:8px;height:8px;border-radius:50%;background:var(--pc)}
#bkHud .sc b{display:block;font-size:30px;font-weight:300;letter-spacing:.02em;margin-top:2px;font-variant-numeric:tabular-nums}
#bkHud .mu{display:flex;align-items:center;gap:10px;margin-top:6px}#bkHud .mu em{font-style:normal;font-size:18px;font-weight:600;color:#ffd36a;min-width:36px}
#bkHud .mu .bar{flex:1;height:4px;border-radius:2px;background:#ffffff22;overflow:hidden}#bkHud .mu .bar u{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#ffd36a);width:0}
#bkHud .sp{right:18px;bottom:18px;padding:10px 20px 10px 18px;text-align:right;min-width:150px}
#bkHud .sp b{font-size:46px;font-weight:200;line-height:1;font-variant-numeric:tabular-nums}#bkHud .sp small{display:block;font-size:10px;letter-spacing:.26em;color:#c9d2d8;margin-top:4px}
#bkHud .sp .gr{position:absolute;left:14px;top:12px;font-size:11px;letter-spacing:.14em;color:var(--cb)}
#bkHud .tk{left:50%;bottom:18px;transform:translateX(-50%);padding:8px 16px 8px 10px;display:flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.14em;white-space:nowrap}
#bkHud .tk kbd{display:inline-block;background:linear-gradient(180deg,#fff 0%,#e9ecef 48%,#d3d8dc 52%,#e6e9ec 100%);color:#15181c;border-radius:5px;padding:2px 8px;font:600 11px var(--gt,sans-serif);box-shadow:0 1px 3px #0008}
#bkHud .tk span{color:#c9d2d8}#bkHud .tk b{font-weight:600;color:#fff}
#bkHud .bm{left:50%;bottom:66px;transform:translateX(-50%);width:min(320px,70%);height:12px;padding:5px;display:none}
#bkHud .bm i{position:absolute;left:5px;right:5px;top:5px;bottom:5px;border-radius:3px;background:linear-gradient(90deg,#ef6a5a 0%,#ffd36a 22%,#7fd68a 40%,#7fd68a 60%,#ffd36a 78%,#ef6a5a 100%);opacity:.75}
#bkHud .bm u{position:absolute;top:2px;bottom:2px;width:4px;margin-left:-2px;background:#fff;border-radius:2px;box-shadow:0 0 8px #fff}
#bkHud .bm.v{left:auto;right:22px;bottom:50%;transform:translateY(50%);width:12px;height:min(220px,40%)}
#bkHud .bm.v i{background:linear-gradient(0deg,#5a6470 0%,#7fd68a 35%,#7fd68a 70%,#ffd36a 85%,#ef6a5a 100%)}#bkHud .bm.v u{left:2px;right:2px;width:auto;height:4px;margin:0 0 -2px;top:auto}
#bkHud .pp{position:absolute;left:50%;top:22%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px}
#bkHud .pp div{padding:7px 18px;border-radius:8px;background:var(--plate);box-shadow:var(--plhi);font-size:14px;font-weight:500;letter-spacing:.14em;white-space:nowrap;animation:bkPop var(--d,1.2s) forwards;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#bkHud .pp div.t{font-size:20px;font-weight:300;letter-spacing:.2em;background:none;box-shadow:none;text-shadow:0 2px 12px #000c}
#bkHud .pp div.w{font-size:40px;font-weight:200;letter-spacing:.3em;background:none;box-shadow:none;color:#fff!important;text-shadow:0 2px 18px #000}
@keyframes bkPop{0%{opacity:0;transform:translateY(8px) scale(.96)}10%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
#bkHud .tm{left:50%;top:14px;transform:translateX(-50%);padding:8px 22px;text-align:center}#bkHud .tm small{display:block;font-size:9px;letter-spacing:.3em;color:#c9d2d8}#bkHud .tm b{font-size:26px;font-weight:300;font-variant-numeric:tabular-nums}
#bkHud .tm.low b{color:#ef6a5a}
#bkHud .cd{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:110px;font-weight:200;letter-spacing:.05em;text-shadow:0 4px 30px #000b;opacity:0}
#bkHud .cd.on{animation:bkCd .9s forwards}@keyframes bkCd{0%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}20%{opacity:1;transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0}}
#bkHud .bkfade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .35s}
#bkHud .mn{left:18px;top:50%;transform:translateY(-50%);width:min(300px,46%);padding:0;overflow:hidden;display:none}
#bkHud .mn h4{margin:0;padding:12px 16px 10px;font-size:11px;font-weight:500;letter-spacing:.28em;color:#c9d2d8;border-bottom:1px solid #ffffff14;display:flex;justify-content:space-between}
#bkHud .mn h4 kbd{background:#ffffff22;border-radius:4px;padding:0 6px;font:500 10px var(--gt);color:#fff}
#bkHud .mn ul{list-style:none;margin:0;padding:6px}
#bkHud .mn li{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:6px;font-size:13px;letter-spacing:.04em;color:#e6e9ec}
#bkHud .mn li svg{width:20px;height:20px;flex:none;opacity:.85}
#bkHud .mn li em{margin-left:auto;font-style:normal;font-size:10px;letter-spacing:.12em;color:#9aa3ab}
#bkHud .mn li.on{background:linear-gradient(180deg,#fff 0%,#e9ecef 48%,#d3d8dc 52%,#e6e9ec 100%);color:#15181c;box-shadow:0 0 0 2px #8fb4d8,0 0 16px #4f7eab90}#bkHud .mn li.on em{color:#4a5560}
#bkHud .mn li.eq:after{content:"";width:7px;height:7px;border-radius:50%;background:#7fd68a;box-shadow:0 0 6px #7fd68a}
#bkHud .mn p{margin:0;padding:10px 16px 14px;font-size:11px;line-height:1.5;color:#c9d2d8;border-top:1px solid #ffffff14}
#bkHud .hint{left:18px;bottom:18px;padding:7px 12px;font-size:10px;letter-spacing:.16em;color:#c9d2d8;display:flex;gap:12px}
#bkHud .hint kbd{background:#ffffff22;border-radius:4px;padding:1px 6px;font:500 10px var(--gt);color:#fff;margin-right:5px}
body.bkOn #ptNowPlaying{display:none}
`;
const ICON={wheelie:'<path d="M4 18a3 3 0 106 0 3 3 0 00-6 0zM14 9l3-4 3 1M7 15l5-6h4l3 8"/>',stoppie:'<path d="M14 18a3 3 0 106 0 3 3 0 00-6 0zM5 7l4 2 7 9M9 9h5"/>',standup:'<path d="M12 3v6l-3 3M12 9l3 3M5 19a2 2 0 104 0 2 2 0 00-4 0zM15 19h4"/>',
 twelve:'<path d="M12 3v14M8 7l4-4 4 4M9 21h6"/>',nohands:'<path d="M5 5l4 5M19 5l-4 5M12 10v6M6 20a2 2 0 104 0M14 20a2 2 0 104 0"/>',superman:'<path d="M3 12h11l4-3M14 12l5 3M6 19a2 2 0 104 0"/>',seatstand:'<path d="M12 3v8M5 7h14M10 15h4M7 20a2 2 0 104 0M13 20a2 2 0 104 0"/>',burnout:'<path d="M5 18a3 3 0 106 0M14 18c2-1 2-3 4-3s2 2 3 1M15 11c1-2 3-2 4-4"/>'};
const icon=id=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(ICON[id]||'')+'</svg>';
function ensureCss(){if($i('bkCss'))return;const s=document.createElement('style');s.id='bkCss';s.textContent=CSS+PREP_CSS;document.head.appendChild(s)}
function buildHud(){ensureCss();let h=$i('bkHud');if(!h){h=document.createElement('div');h.id='bkHud';document.body.appendChild(h)}h.style.display='block';const n=B.pl.length;
 h.innerHTML=B.pl.map((p,i)=>`<div class="pv${n>1?' two':''}" data-p="${i}" style="left:${n>1?i*50:0}%;width:${n>1?50:100}%;--pc:${PCOL[i]}">
 <div class="pl sc"><small><i></i>${n>1?'PLAYER '+(i+1):'SCORE'}</small><b>0</b><div class="mu"><em>x1</em><div class="bar"><u></u></div></div></div>
 <div class="pl sp"><span class="gr">GEAR 1</span><b>0</b><small>${kmh()?'KM/H':'MPH'}</small></div>
 <div class="pl tk"><kbd>${KEYS[i].tn}</kbd><b class="tn"></b><span>&middot;</span><kbd>${KEYS[i].mn}</kbd><span>TRICKS</span></div>
 <div class="pl bm"><i></i><u></u></div>
 <div class="pl mn"><h4>TRICKS<span><kbd>${i?'&uarr;&darr;':'W S'}</kbd> <kbd>${KEYS[i].tn}</kbd></span></h4><ul>${TRICKS.map(t=>`<li data-t="${t.id}">${icon(t.id)}<span>${t.n}</span><em>${t.k==='burnout'?'STOPPED':Math.round(spd(t.min))+'+ '+(kmh()?'KM/H':'MPH')}</em></li>`).join('')}</ul><p></p></div>
 ${i===0?`<div class="pl hint"><span><kbd>C</kbd>CAMERA</span><span><kbd>ESC</kbd>PAUSE</span></div>`:''}
 <div class="pp"></div><div class="bkfade"></div></div>`).join('')+`<div class="pl tm" style="${B.clock?'':'display:none'}"><small>TIME</small><b></b></div><div class="cd"></div>`;
 B.pl.forEach(p=>menuPaint(p))}
const hudOf=p=>$i('bkHud')&&$i('bkHud').querySelector('.pv[data-p="'+p.k+'"]');
function pop(p,txt,col,d,cls){const h=hudOf(p);if(!h)return;const pp=h.querySelector('.pp');const e=document.createElement('div');e.textContent=txt;e.style.color=col||'#fff';e.style.setProperty('--d',(d||1.2)+'s');if(cls)e.className=cls;pp.appendChild(e);
 while(pp.children.length>4)pp.firstChild.remove();setTimeout(()=>e.remove(),(d||1.2)*1000+50)}
function showCount(n){const c=$i('bkHud')&&$i('bkHud').querySelector('.cd');if(!c)return;c.textContent=n;c.classList.remove('on');void c.offsetWidth;c.classList.add('on')}
function hudStep(){if(!B)return;const h=$i('bkHud');if(!h)return;
 for(const p of B.pl){const e=hudOf(p);if(!e)continue;const q=s=>e.querySelector(s);
  q('.sc b').textContent=fmtN(p.score);q('.mu em').textContent='x'+p.mult;q('.mu .bar u').style.width=(p.chain>0?cl(p.comboT/4,0,1)*100:0)+'%';
  q('.sp b').textContent=Math.round(spd(p.wipe?0:p.v));q('.sp .gr').textContent='GEAR '+p.gear;
  const t=TBY[p.equip];q('.tk .tn').textContent=t.n.toUpperCase();
  const bm=q('.bm'),T=p.trk_;
  if(T&&(T.k==='balance')){bm.style.display='block';bm.className='pl bm';bm.querySelector('u').style.left=(50+cl(p.bal,-1,1)*50)+'%';bm.querySelector('u').style.bottom=''}
  else if(T&&(T.k==='wheelie'||T.k==='stoppie')||p.pitch>.05||p.pitch<-.05){bm.style.display='block';bm.className='pl bm v';const u=bm.querySelector('u');u.style.left='';const lim=p.pitch<0?1.15:(T&&T.twelve?1.62:1.45);u.style.bottom=(cl(Math.abs(p.pitch)/lim,0,1)*100)+'%'}
  else bm.style.display='none';
  q('.mn').style.display=p.menu?'block':'none'}
 const tm=h.querySelector('.tm');if(B.clock){const l=Math.max(0,B.left);tm.querySelector('b').textContent=Math.floor(l/60)+':'+String(Math.floor(l%60)).padStart(2,'0');tm.classList.toggle('low',l<15)}}
function menuPaint(p){const e=hudOf(p);if(!e)return;const li=[...e.querySelectorAll('.mn li')];li.forEach((x,i)=>{x.classList.toggle('on',i===p.menuSel);x.classList.toggle('eq',x.dataset.t===p.equip)});e.querySelector('.mn p').textContent=TRICKS[p.menuSel].d}
function toggleMenu(p){p.menu=!p.menu;if(p.menu)p.menuSel=TBY[p.equip].i;menuPaint(p);sfx.ui(p.menu?'whoosh':'back')}
function menuMove(p,d){p.menuSel=(p.menuSel+d+TRICKS.length)%TRICKS.length;menuPaint(p);sfx.ui('move')}
function menuPick(p){p.equip=TRICKS[p.menuSel].id;p.menu=false;menuPaint(p);sfx.ui('select');pop(p,'EQUIPPED: '+TRICKS[p.menuSel].n.toUpperCase(),'#9fc3e6',1.2);SV().sel[p.k]=Object.assign(SV().sel[p.k]||{},{trick:p.equip})}
function runKey(code){if(B.paused){pauseKey(code);return}
 for(const p of B.pl){const k=p.k;
  if(isKey(k,'m',code)){toggleMenu(p);continue}
  if(isKey(k,'c',code)||(k===0&&code==='KeyC')){p.cam=(p.cam+1)%2;continue}
  if(p.menu){if(isKey(k,'u',code))menuMove(p,-1);else if(isKey(k,'d',code))menuMove(p,1);else if(isKey(k,'t',code)||isKey(k,'r',code))menuPick(p)}}}

/* ---------------- pause ---------------- */
function onEsc(){if(scr==='bike'&&B){if(B.state==='done')return;setPause(!B.paused)}else if(scr==='bikeprep'){leavePrep()}else if(scr==='bikeres'){resAct('menu')}}
function setPause(on){if(!B)return;B.paused=on;let e=$i('bkPause');if(!e){e=document.createElement('div');e.id='bkPause';document.body.appendChild(e)}
 if(on){for(const p of B.pl)if(p.eng)p.eng.set(0,0,0,false);e.innerHTML=`<div class="bkpbox"><h3>PAUSED</h3><button data-a="res" class="on">Resume</button><button data-a="rst">Restart</button><button data-a="prep">Change bikes</button><button data-a="quit">Quit to menu</button></div>`;
  e.style.display='flex';e.querySelectorAll('button').forEach((b,i)=>{b.onmouseenter=()=>{B&&(B.psel=i);paintPause()};b.onclick=()=>pauseAct(b.dataset.a)});B.psel=0;sfx.ui('select')}else{e.style.display='none'}}
function paintPause(){const e=$i('bkPause');if(!e||!B)return;e.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',i===B.psel))}
function pauseKey(code){const n=4;if(code==='KeyW'||code==='ArrowUp'){B.psel=(B.psel+n-1)%n;paintPause();sfx.ui('move')}else if(code==='KeyS'||code==='ArrowDown'){B.psel=(B.psel+1)%n;paintPause();sfx.ui('move')}
 else if(code==='Enter'||code==='Space'){pauseAct(['res','rst','prep','quit'][B.psel])}}
function pauseAct(a){sfx.ui('select');if(a==='res'){setPause(false);return}const o=B.o;$i('bkPause').style.display='none';
 if(a==='rst'){startRun(o)}else if(a==='prep'){endRun();openPrep()}else{endRun();goMenu()}}
function goMenu(){show('menu');try{P.menuStats&&P.menuStats()}catch(e){}try{P.menuBg&&P.menuBg()}catch(e){}}

/* ---------------- results ---------------- */
function showResults(res,cr,nb){if(!B)return;let e=$i('bkRes');if(!e){e=document.createElement('div');e.id='bkRes';document.body.appendChild(e)}
 const n=res.length,win=n>1?res.reduce((a,r)=>r.score>a.score?r:a,res[0]):null;
 const row=(l,f)=>`<tr><th>${l}</th>${res.map(r=>`<td>${f(r)}</td>`).join('')}</tr>`;
 e.innerHTML=`<div class="bkrbox"><small>HIGHWAY CUT-UP</small><h2>${n>1?(win?'PLAYER '+(win.k+1)+' WINS':'RUN COMPLETE'):'RUN COMPLETE'}</h2>
 <table><thead><tr><th></th>${res.map(r=>`<td><i style="background:${PCOL[r.k]}"></i>${n>1?'PLAYER '+(r.k+1):'YOU'}<br><span>${esc(r.bike)}</span></td>`).join('')}</tr></thead><tbody>
 ${row('Score',r=>`<b>${fmtN(r.score)}</b>`)}${row('Best combo',r=>'x'+r.best)}${row('Top speed',r=>r.top+' '+(kmh()?'km/h':'mph'))}${row('Tricks landed',r=>r.tricks)}${row('Best trick',r=>r.bestTrick?esc(r.bestTrick.n)+' <span>'+fmtN(r.bestTrick.pts)+'</span>':'&ndash;')}
 ${row('Near misses',r=>r.near)}${row('Lane splits',r=>r.splits)}${row('Wipeouts',r=>r.wipes)}${row('Distance',r=>(r.dist/1000).toFixed(1)+' km')}</tbody></table>
 <div class="bkrf"><div><small>EARNED</small><b>${P.fmtCr?P.fmtCr(cr):fmtN(cr)+' Cr.'}</b>${nb?'<em>NEW BEST</em>':''}</div><div class="bkrb"><button data-a="again" class="on">Ride again</button><button data-a="prep">Change bikes</button><button data-a="menu">Main menu</button></div></div></div>`;
 e.style.display='flex';e.querySelectorAll('button').forEach((b,i)=>{b.onmouseenter=()=>{RS=i;paintRes()};b.onclick=()=>resAct(b.dataset.a)});RS=0;show('bikeres');sfx.ui('whoosh')}
let RS=0;function paintRes(){const e=$i('bkRes');if(e)e.querySelectorAll('.bkrb button').forEach((b,i)=>b.classList.toggle('on',i===RS))}
function resKey(code){if(code==='KeyA'||code==='ArrowLeft'){RS=(RS+2)%3;paintRes();sfx.ui('move')}else if(code==='KeyD'||code==='ArrowRight'){RS=(RS+1)%3;paintRes();sfx.ui('move')}else if(code==='Enter'||code==='Space')resAct(['again','prep','menu'][RS])}
function resAct(a){sfx.ui('select');const e=$i('bkRes');if(e)e.style.display='none';const o=B?B.o:null;if(a==='again'&&o){startRun(o);return}endRun();if(a==='prep')openPrep();else goMenu()}

/* ---------------- prep: up to two riders pick bikes, paint and the run before they ride ---------------- */
const PREP_CSS=`
#bkPrep{position:fixed;inset:0;z-index:45;display:none;pointer-events:none}
#bkPause,#bkRes{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,#151a20d0 0%,#05070af0 75%);font-family:var(--gt,"Inter",sans-serif);color:#f2f4f6}
.bkpbox{display:flex;flex-direction:column;gap:8px;min-width:280px;padding:22px;border-radius:12px;background:linear-gradient(180deg,rgba(70,76,84,.62),rgba(14,15,18,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 12px 40px #000c}
.bkpbox h3{margin:0 0 8px;font:200 22px var(--gt);letter-spacing:.3em;text-align:center}
.bkpbox button,.bkrb button{border:0;border-radius:999px;padding:11px 22px;font:500 13px var(--gt);letter-spacing:.14em;cursor:pointer;background:var(--gxb);color:#fff;box-shadow:inset 0 1px 0 #ffffff38,0 2px 6px #0008}
.bkpbox button.on,.bkrb button.on{background:var(--gxw);color:#15181c;box-shadow:0 0 0 2px #8fb4d8,0 0 16px #4f7eab90}
.bkrbox{min-width:min(720px,92vw);padding:26px 30px;border-radius:12px;background:linear-gradient(180deg,rgba(70,76,84,.55),rgba(14,15,18,.9));box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 12px 40px #000c;animation:bkIn .6s cubic-bezier(.2,.8,.2,1) both}
.bkrbox>small{font-size:10px;letter-spacing:.3em;color:#9aa3ab}.bkrbox h2{margin:4px 0 16px;font:200 34px var(--gt);letter-spacing:.12em}
.bkrbox table{width:100%;border-collapse:collapse;font-size:13px}.bkrbox th{text-align:left;font-weight:400;font-size:10px;letter-spacing:.2em;color:#9aa3ab;padding:7px 0;text-transform:uppercase}
.bkrbox td{padding:7px 10px;border-top:1px solid #ffffff12;text-align:right;font-variant-numeric:tabular-nums}.bkrbox thead td{border:0;font-size:11px;letter-spacing:.16em;line-height:1.5}.bkrbox thead td i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px}
.bkrbox td span{color:#9aa3ab;font-size:11px}.bkrbox td b{font-size:20px;font-weight:300}
.bkrf{display:flex;align-items:flex-end;justify-content:space-between;margin-top:18px;gap:20px}.bkrf small{display:block;font-size:9px;letter-spacing:.26em;color:#9aa3ab}.bkrf b{font-size:24px;font-weight:300}.bkrf em{margin-left:12px;font-style:normal;font-size:10px;letter-spacing:.2em;color:#ffd36a}
.bkrb{display:flex;gap:8px}
body.bkOn #gxDrop,body.bkOn #ptNowPlaying{display:none!important}
`;
function prepState(){const sv=SV(),L=BK.list();const pick=(i,dflt)=>{const s=sv.sel[i]||{};const id=s.id&&L.find(b=>b.id===s.id)?s.id:L[dflt%L.length].id;return{id,paint:s.paint==null?i:s.paint,trick:s.trick||'wheelie',who:s.who==null?i:s.who}};
 return{p:[Object.assign(pick(0,0),{in:true,ready:false}),Object.assign(pick(1,2),{in:false,ready:false})],opt:Object.assign({clock:180,traffic:'normal',tod:'day'},sv.opt),t:0}}
P.bikeEnter=()=>{ensureCss();const go=()=>BK.loadPack().then(()=>openPrep());try{if(P.sfx)P.sfx('select')}catch(e){}go()};
function openPrep(){ensureCss();PR=prepState();let e=$i('bkPrep');if(!e){e=document.createElement('div');e.id='bkPrep';document.body.appendChild(e)}
 buildPrepScene();renderPrep();e.style.display='block';show('bikeprep');document.body.classList.add('bkOn')}
function stopPrep(){if(!PR)return;const e=$i('bkPrep');if(e)e.style.display='none';if(PR.sc){for(const m of PR.bikes)if(m)BK.disposeBike(m);PR.world.dispose();PR.sky.dispose();R.toneMappingExposure=PR.exp0}PR=null}
function leavePrep(){sfx.ui('back');stopPrep();document.body.classList.remove('bkOn');goMenu()}
function buildPrepScene(){const tod=BK.TOD[PR.opt.tod]||BK.TOD.day,sc=new THREE.Scene();sc.fog=new THREE.Fog(tod.fog,tod.fogN*.6,tod.fogF);sc.add(new THREE.HemisphereLight(tod.hemi[0],tod.hemi[1],tod.hemi[2]));const sun=new THREE.DirectionalLight(tod.sun[0],tod.sun[1]*1.1);sun.position.fromArray(tod.sunPos).multiplyScalar(100);sc.add(sun);
 const road=BK.makeRoad(4242),world=BK.makeWorld(sc,road,{tod:PR.opt.tod}),sky=BK.makeSky(sc,tod);world.fill(0,500);
 /* a few cars streaming past on the highway behind the bikes */
 const cars=[];const r=rng(77);for(let i=0;i<9;i++){const kind=BK.pickKind(r),m=BK.makeVehicle(kind,BK.pickPaint(r),tod.lamps>0);sc.add(m.g);cars.push({m,s:r()*600,lane:(r()*4)|0,v:25+r()*10,side:r()<.5?1:-1,blink:r(),sig:r()<.3?(r()<.5?1:-1):0})}
 PR.exp0=PR.exp0||R.toneMappingExposure;R.toneMappingExposure=tod.exp;
 PR.sc=sc;PR.road=road;PR.world=world;PR.sky=sky;PR.cars=cars;PR.bikes=[null,null];PR.cam=new THREE.PerspectiveCamera(40,1,.1,3000);PR.todK=PR.opt.tod;syncPrepBikes()}
const PREP_S=180;
function syncPrepBikes(){for(let i=0;i<2;i++){const s=PR.p[i];const key=s.in?s.id+'|'+s.paint+'|'+s.who:'';const m=PR.bikes[i];if(m&&m.key===key)continue;if(m){BK.disposeBike(m);PR.bikes[i]=null}
  if(!s.in)continue;const d=BK.byId(s.id),b=BK.makeBike(s.id,BK.paintOf(d,s.paint),Object.assign({},RIDER_COL[i],{who:s.who}));b.key=key;b.pop=0;PR.sc.add(b.g);PR.bikes[i]=b;
  const fake={m:b,d,trk_:null,lean:0,k:i};BK.poseRider(b,Object.assign(basePose(fake),{look:-.1}));b.fake=fake}}
function prepStep(dt){if(!PR||!PR.sc)return;PR.t+=dt;const road=PR.road,n=PR.p.filter(x=>x.in).length;
 /* bikes side by side on the hard shoulder, a slow orbiting camera */
 for(let i=0;i<2;i++){const b=PR.bikes[i];if(!b)continue;b.pop=Math.min(1,b.pop+dt*2.2);const two=PR.p[0].in&&PR.p[1].in,dd=RD.SHO-1.6-(two?(i?2.2:-2.2)*0:0),ss_=PREP_S+(two?(i?-1.6:1.6):0);
  road.pos(ss_,dd+(two?(i?1.4:-1.4):0)*0,_pp);b.g.position.set(_pp.x,_pp.y,_pp.z);b.g.rotation.set(0,_pp.h-.5,0);const e=1-Math.pow(1-b.pop,3);b.g.scale.setScalar(.6+.4*e);b.g.position.y+=(1-e)*1.2;
  BK.poseBike(b,-.0,0,Math.sin(PR.t*.7+i)*.12,dt*0,0);{const bp=basePose(b.fake),I=b.I;if(b.rider&&b.rider.people)bp.feet[0]=[I.peg[0]+.2,-.02,I.peg[2]+.18];BK.poseRider(b,Object.assign(bp,{look:-.1+Math.sin(PR.t*.4+i)*.05,turn:Math.sin(PR.t*.23+i*2)*.25,side:b.rider&&b.rider.people?-.06:0}))}}
 const a=PR.t*.11;road.pos(PREP_S,RD.SHO-1.6,_pp);const cx=_pp.x,cy=_pp.y,cz=_pp.z,h=_pp.h;const dist=n>1?7.2:4.6;
 const ang=h+PI*.5+Math.sin(a)*.95;PR.cam.position.set(cx+Math.sin(ang)*dist,cy+1.25+Math.sin(a*1.7)*.3,cz+Math.cos(ang)*dist);PR.cam.lookAt(cx,cy+.8,cz);
 for(const c of PR.cars){c.s+=c.v*dt*c.side;if(c.s>PREP_S+520)c.s-=900;if(c.s<PREP_S-380)c.s+=900;road.pos(c.s,c.side*RD.laneD(c.lane),_pp);c.m.g.position.set(_pp.x,_pp.y,_pp.z);c.m.g.rotation.set(0,c.side>0?_pp.h:_pp.h+PI,0);c.blink+=dt;
  const on=(c.blink%.7)<.38;c.m.iL.material=c.sig<0&&on?BK.LM.on:BK.LM.off;c.m.iR.material=c.sig>0&&on?BK.LM.on:BK.LM.off}
 const W=R.domElement.width,H=R.domElement.height;PR.cam.aspect=W/H;/* the bikes sit left of centre, clear of the menu panel on the right */if(W>760)PR.cam.setViewOffset(W,H,W*.16,0,W,H);else PR.cam.clearViewOffset();PR.cam.updateProjectionMatrix();PR.sky.follow(PR.cam.position.x,PR.cam.position.y,PR.cam.position.z);
 R.setScissorTest(false);R.setViewport(0,0,W,H);R.render(PR.sc,PR.cam)}
const STATN=[['TOP SPEED',d=>d.stats.top/300,d=>Math.round(kmh()?d.stats.top:d.stats.top/1.609)],['ACCELERATION',d=>d.stats.acc,d=>Math.round(d.stats.acc*100)],['HANDLING',d=>d.stats.hnd,d=>Math.round(d.stats.hnd*100)],['TRICKS',d=>d.stats.trk,d=>Math.round(d.stats.trk*100)]];
const PAINTN=['Stock','Second','Red','Orange','Yellow','Green','Blue','Purple','White','Black'];
const OPTS={clock:[[120,'2 min'],[180,'3 min'],[300,'5 min'],[0,'Endless']],traffic:[['light','Light'],['normal','Normal'],['heavy','Heavy']],tod:[['day','Day'],['dusk','Sunset'],['night','Night']]};
const rgb=c=>'rgb('+c.map(x=>Math.round(x*255)).join(',')+')';
/* the prep is one menu panel in the main menu's look: a row per choice, the selected rider's bike named bottom-left */
function prepRows(){const L=[],o=PR.opt,two=PR.p[1].in;
 for(let i=0;i<2;i++){const s=PR.p[i];if(i===1){L.push({k:'join',l:'Rider 2',v:two?'Riding':'Off',adj:1,dot:PCOL[1]});if(!two)continue}
  const d=BK.byId(s.id),t=TBY[s.trick]||TRICKS[0],pre=two?'Rider '+(i+1)+' · ':'';
  if(BK.PEOPLE&&window.PEOPLE_B64)L.push({k:'who',i,l:pre+'Rider',v:BK.PEOPLE[s.who%BK.PEOPLE.length].n,adj:1,dot:two?PCOL[i]:null});L.push({k:'bike',i,l:pre+'Bike',v:d.name,adj:1,dot:two?PCOL[i]:null},{k:'paint',i,l:pre+'Paint',v:PAINTN[s.paint]||'',sw:rgb(BK.paintOf(d,s.paint)),adj:1,dot:two?PCOL[i]:null},{k:'trick',i,l:pre+'Starting trick',v:t.n,adj:1,dot:two?PCOL[i]:null})}
 L.push({gap:1});for(const[k,l]of[['clock','Clock'],['traffic','Traffic'],['tod','Time of day']]){const x=OPTS[k].find(z=>String(z[0])===String(o[k]))||OPTS[k][0];L.push({k,l,v:x[1],adj:1})}
 L.push({gap:1},{k:'go',l:'Ride'});return L}
function renderPrep(){const e=$i('bkPrep');if(!e||!PR)return;const sv=SV();PR.rows=prepRows();if(PR.sel==null)PR.sel=PR.rows.findIndex(r=>r.k==='go');
 if(PR.sel>=PR.rows.length||PR.rows[PR.sel].gap)PR.sel=PR.rows.findIndex(r=>r.k==='go');
 const r=PR.rows[PR.sel],ri=r&&r.i!=null?r.i:0,s=PR.p[ri],d=BK.byId(s.id),L=BK.list(),k=L.findIndex(b=>b.id===s.id);
 e.innerHTML=`<div class="psxV"></div>
 <div class="psxT"><small>${PR.p[1].in?'Rider '+(ri+1)+' · ':''}${esc(d.kind)} · ${k+1} of ${L.length}</small><b>${esc(d.name)}</b>
  <div class="sb">${STATN.map(([n,f,v])=>`<span>${n}</span><u><i style="width:${Math.round(cl(f(d),0,1)*100)}%"></i></u>`).join('')}</div></div>
 <div class="psx sm"><div class="hd"><div class="av">${icon('wheelie')}</div><div class="pt"><b>Highway Cut-Up</b><small>Best score ${fmtN(sv.best||0)}</small></div></div><div class="rs">${P.psxRows(PR.rows,PR.sel)}</div></div>
 <div class="psxPad">${P.psxPad([['&uarr;&darr;','Choose'],['&larr;&rarr;','Change'],['Enter','Ride','go'],['Esc','Back','back']])}</div>`;
 const av=e.querySelector('.av svg');if(av){av.style.width='60%';av.style.height='60%'}
 e.querySelectorAll('.psx .r').forEach(el=>{const i=+el.dataset.i;el.onmouseenter=()=>{if(PR.sel!==i){PR.sel=i;renderPrep()}};
  el.onclick=ev=>{const dd=ev.target&&ev.target.dataset&&ev.target.dataset.d;PR.sel=i;if(dd)prepChange(+dd);else prepAct()}});
 e.querySelectorAll('.psxPad span').forEach(sp=>sp.onclick=()=>{if(sp.dataset.a==='go')prepGo();else if(sp.dataset.a==='back')leavePrep()})}
function prepMove(d){const n=PR.rows.length;let i=PR.sel;do{i=(i+d+n)%n}while(PR.rows[i].gap);PR.sel=i;sfx.ui('move');renderPrep()}
function prepChange(d){const r=PR.rows[PR.sel];if(!r||r.gap)return;
 if(r.k==='who'){const s=PR.p[r.i];s.who=(s.who+d+BK.PEOPLE.length)%BK.PEOPLE.length;sfx.ui('move');syncPrepBikes();renderPrep()}else if(r.k==='bike')prepBike(r.i,d);else if(r.k==='paint')prepPaint(r.i,d);else if(r.k==='trick')prepTrick(r.i,d);
 else if(r.k==='join'){const s=PR.p[1];s.in=!s.in;sfx.ui(s.in?'select':'back');syncPrepBikes();renderPrep()}
 else if(OPTS[r.k]){const L=OPTS[r.k],j=L.findIndex(z=>String(z[0])===String(PR.opt[r.k]));prepOpt(r.k,L[(j+d+L.length)%L.length][0])}}
function prepAct(){const r=PR.rows[PR.sel];if(!r)return;if(r.k==='go')prepGo();else if(r.k==='join'&&!PR.p[1].in)prepChange(1);else prepChange(1)}
function prepBike(i,d){const L=BK.list(),s=PR.p[i];let k=L.findIndex(b=>b.id===s.id);k=(k+d+L.length)%L.length;s.id=L[k].id;sfx.ui('move');syncPrepBikes();renderPrep()}
function prepPaint(i,d){const s=PR.p[i];s.paint=(s.paint+d+BK.PAINTS.length)%BK.PAINTS.length;sfx.ui('move');syncPrepBikes();renderPrep()}
function prepTrick(i,d){const s=PR.p[i];const k=(TBY[s.trick]?TBY[s.trick].i:0);s.trick=TRICKS[(k+d+TRICKS.length)%TRICKS.length].id;sfx.ui('move');renderPrep()}
function prepJoin(i){const s=PR.p[i];if(!s.in){s.in=true;sfx.ui('select');syncPrepBikes();renderPrep();return true}return false}
function prepOpt(k,v){PR.opt[k]=k==='clock'?+v:v;sfx.ui('move');if(k==='tod'){const exp0=PR.exp0;for(const m of PR.bikes)if(m)BK.disposeBike(m);PR.world.dispose();PR.sky.dispose();for(const c of PR.cars)PR.sc.remove(c.m.g);R.toneMappingExposure=exp0;PR.exp0=exp0;buildPrepScene()}renderPrep()}
function prepKey(code){
 if(code==='ArrowUp'||code==='KeyW'){prepMove(-1);return}if(code==='ArrowDown'||code==='KeyS'){prepMove(1);return}
 if(code==='ArrowLeft'||code==='KeyA'){prepChange(-1);return}if(code==='ArrowRight'||code==='KeyD'){prepChange(1);return}
 if(code==='Enter'||code==='NumpadEnter'||code==='Space'){prepAct();return}
 /* rider 2's trick key joins them straight in */
 if(isKey(1,'t',code)&&!PR.p[1].in){prepJoin(1);return}}
function prepGo(){if(!PR)return;const sv=SV();PR.p.forEach((s,i)=>{sv.sel[i]={id:s.id,paint:s.paint,trick:s.trick,who:s.who}});sv.opt=Object.assign({},PR.opt);try{P.save()}catch(e){}
 const o={players:PR.p.filter(x=>x.in).map(x=>({id:x.id,paint:x.paint,trick:x.trick,who:x.who})),clock:PR.opt.clock,traffic:PR.opt.traffic,tod:PR.opt.tod};
 if(!o.players.length)return;try{P.sfx&&P.sfx('start')}catch(e){}
 const f=$i('fade');if(f){f.style.transition='opacity .35s';f.style.opacity=1;setTimeout(()=>{startRun(o);f.style.opacity=0},380)}else startRun(o)}
/* pads in the prep screen */
let padPrev=[{},{}];setInterval(()=>{if(scr!=='bikeprep'||!PR)return;for(let i=0;i<2;i++){const p=padIn(i);if(!p)continue;const pv=padPrev[i],e=(k)=>p[k]&&!pv[k];
  if(e('t')){if(i===1&&!PR.p[1].in)prepJoin(1);else prepAct()}if(e('lf'))prepChange(-1);if(e('rt'))prepChange(1);if(e('up'))prepMove(-1);if(e('dn'))prepMove(1);if(e('st0'))prepGo();padPrev[i]=p}},60);
setInterval(()=>{if(scr!=='bike'||!B)return;const p=padIn(0);if(p&&p.st0&&!padPrev.s){setPause(!B.paused)}padPrev.s=p&&p.st0},80);

/* ---------------- frame hook ---------------- */
const f0=frame;frame=function(n){if(scr==='bike'||scr==='bikeprep'||(scr==='bikeres'&&B)){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
  if(R.domElement.style.visibility==='hidden')R.domElement.style.visibility='';
  try{if(scr==='bikeprep')prepStep(dt);else if(B){if(scr==='bikeres'){render(dt)}else step(dt)}}catch(e){if(!frame.err){frame.err=1;console.error('bike mode',e)}}return}
 return f0(n)};
/* leaving through some other path (menu shortcut, options): tidy up */
{const sh0=show;show=n=>{sh0(n);if(n!=='bike'&&n!=='bikeres'&&n!=='pause'&&n!=='ptOptions'&&B&&n!=='bikeprep'){endRun()}if(n!=='bikeprep'&&PR&&n!=='bike'){stopPrep()}if(n!=='bike'&&n!=='bikeprep'&&n!=='bikeres')document.body.classList.remove('bkOn');
  for(const id of['bkHud'])if($i(id)&&n!=='bike'&&n!=='bikeres')$i(id).style.display='none';if(n!=='bikeres'&&$i('bkRes'))$i('bkRes').style.display='none'}}
BK.debug=()=>({B,PR});
P.bikeStart=o=>BK.loadPack().then(()=>startRun(o));
})();
