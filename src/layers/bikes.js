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
 {id:'wheelie',n:'Wheelie',k:'wheelie',pps:120,min:3,max:70,d:'Hold the trick key and open the throttle to lift the front, then ride the balance point: throttle lifts, the rear brake (S) brings it down. Let go to land. Too far and you loop out.'},
 {id:'stoppie',n:'Stoppie',k:'stoppie',pps:170,min:9,max:60,d:'Hold the trick key and brake hard: the rear wheel lifts. Ease the brake to hold it, let go to land. Too much and you go over the bars.'},
 {id:'standup',n:'Stand-Up Wheelie',k:'wheelie',stand:1,pps:190,min:3,max:55,d:'A wheelie standing on the pegs. Narrower balance than the sit-down one, more points.'},
 {id:'twelve',n:'12 O’Clock',k:'wheelie',twelve:1,pps:300,min:3,max:40,d:'Take a wheelie past 70°, nearly straight up. Points only count while you are past the line.'},
 {id:'nohands',n:'No-Hander',k:'balance',pps:150,min:10,max:80,d:'Let go of the bars and ride on. Steer against the wobble with A / D. Lean too far and you are down.'},
 {id:'burnout',n:'Burnout',k:'burnout',pps:110,min:0,max:4,d:'Stop, tap the trick key and hold the throttle: the front brake holds the bike while the rear spins up smoke.'}];
BK.TRICKS=TRICKS;
const TBY={};TRICKS.forEach((t,i)=>{TBY[t.id]=t;t.i=i});

/* ---------------- keys ---------------- */
const KEYS=[{u:'KeyW',d:'KeyS',l:'KeyA',r:'KeyD',t:'Space',m:'KeyQ',c:'KeyC',name:'W A S D',tn:'SPACE',mn:'Q',cn:'C',tk:['KeyE','KeyR','KeyF','KeyC','KeyZ','KeyX','KeyT','KeyG'],tkn:['E','R','F','C','Z','X','T','G']},/* Nov 2: rider 1's tricks on letters around WASD */
 {u:'ArrowUp',d:'ArrowDown',l:'ArrowLeft',r:'ArrowRight',t:'ShiftRight',m:'Slash',c:'Period',alt:{t:['Numpad0','ControlRight'],m:['NumpadEnter','Enter'],c:['NumpadDecimal']},name:'ARROWS',tn:'R-SHIFT',mn:'/',cn:'.',tk:['KeyU','KeyI','KeyO','KeyP','KeyH','KeyJ','KeyK','KeyL'],tkn:['U','I','O','P','H','J','K','L']}];/* Nov 2: rider 2's tricks on letters, so no numpad is needed */
const down=new Set(),taps=new Set();/* taps: keys pressed since the last frame, so a quick tap between two frames still counts */let B=null,PR=null;/* B = live run, PR = prep screen */
const kd=(p,k)=>{const K=KEYS[p];if(down.has(K[k]))return true;const a=K.alt&&K.alt[k];return!!(a&&a.some(x=>down.has(x)))};
const isKey=(p,k,code)=>{const K=KEYS[p];return K[k]===code||!!(K.alt&&K.alt[k]&&K.alt[k].includes(code))};
const active=()=>scr==='bike'||scr==='bikeprep'||scr==='bikeres';
addEventListener('keydown',e=>{if(!active())return;down.add(e.code);if(!e.repeat)taps.add(e.code);
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Tab'].includes(e.code))e.preventDefault();
 /* pause on Tab like the car modes; Escape still backs out of the setup and results screens */
 if(e.code==='Tab'&&scr==='bike'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)onEsc();return}
 if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(scr!=='bike')onEsc();return}
 if(e.repeat)return;
 if(scr==='bike'&&B)runKey(e.code);else if(scr==='bikeres')resKey(e.code);
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
  th:0,br:0,st:0,score:0,mult:1,comboT:0,chain:0,chainPts:0,sk:[],skV:0,skEnd:null,best:0,bestCombo:0,top:0,near:0,splits:0,tricks:0,wipes:0,dist:0,bestTrick:null,
  equip:sel.trick||'wheelie',menu:false,menuSel:0,trk_:null,cam:0,wipe:null,ghost:0,pose:null,eng:null,popQ:[],gear:1,rpm:0,bal:0,balV:0,smoke:0,trickPts:0,scrape:0,lastTrick:-9}}
const START_S=60;
function startRun(o){/* o: {players:[{id,paint,trick}], clock, traffic, tod} */
 stopPrep();endRun(true);
 const sc=new THREE.Scene(),tod=BK.TOD[o.tod]||BK.TOD.day;sc.fog=new THREE.Fog(tod.fog,tod.fogN,tod.fogF);
 const hemi=new THREE.HemisphereLight(tod.hemi[0],tod.hemi[1],tod.hemi[2]);sc.add(hemi);const sun=new THREE.DirectionalLight(tod.sun[0],tod.sun[1]);sun.position.fromArray(tod.sunPos).multiplyScalar(100);sc.add(sun);sc.add(sun.target);
 const road=BK.makeRoad(o.seed||(((Math.random()*1e6)|0)+1)),world=BK.makeWorld(sc,road,{tod:o.tod}),sky=BK.makeSky(sc,tod);
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
   else{/* round 14: someone already alongside in the lane we are moving into: steer back */if(!c.back&&B.tr.some(u=>u!==v&&u.side===v.side&&u.ramp==null&&(u.lane===c.to&&!u.chg||u.chg&&u.chg.to===c.to&&u.chg.t>0)&&Math.abs(u.s-v.s)<(u.L+v.L)/2+1.5)){c.back=1;const f=c.from;c.from=c.to;c.to=f;c.t=Math.max(0,c.dur-c.t);v.sig=-v.sig}
    c.t+=dt;const u=ss(0,1,c.t/c.dur);v.d=v.side*lp(RD.laneD(c.from),RD.laneD(c.to),u);if(c.t>=c.dur){v.lane=c.to;v.d=v.side*RD.laneD(c.to);v.chg=null;v.offT=.6}}}
  else{if(v.offT>0){v.offT-=dt;if(v.offT<=0)v.sig=0}
   v.think-=dt;if(v.think<=0&&v.side>0){v.think=1.2+r()*2.2;decide(v)}}
  placeVeh(v);lights(v,dt)}
 /* round 14: no two vehicles share road. Anyone overlapping the car ahead in its lane drops back behind it */
 for(const v of B.tr){if(v.hit>0||v.ramp!=null)continue;for(const u of B.tr){if(u===v||u.side!==v.side||u.ramp!=null)continue;const ahead=(u.s-v.s)*v.side;if(ahead<0)continue;
  const near=Math.abs(u.d-v.d)<(u.W+v.W)/2-.15;if(!near)continue;const gap=ahead-(u.L+v.L)/2;if(gap<.4){v.s=u.s-v.side*((u.L+v.L)/2+.4);v.v=Math.min(v.v,u.v);placeVeh(v)}}}
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
 const vis=dn<560;m.g.visible=vis;if(!vis)return;const near=dn<90&&!m.name;/* game car models have their own lamps: our lens boxes only show while lit */
 /* Nov 2: indicators and brake lights are never lit (they looked goofy); traffic still signals and brakes, it just does not show it */const left=false,right=false,bk=false;
 m.iL.material=left&&on?L.on:L.off;m.iR.material=right&&on?L.on:L.off;m.br.material=bk?L.brOn:L.brOff;
 m.iL.visible=near||(left&&on);m.iR.visible=near||(right&&on);m.br.visible=near||bk;m.hd.visible=near||B.tod.lamps>0;if(m.sh)m.sh.visible=dn<220}

/* ---------------- rider poses ---------------- */
/* seated posture: hips on the seat, the torso leaned until the shoulders sit an arm's reach (~.58 m) from the grips */
/* the seat's real top surface, found once per model by a ray down the centre line (the seat marker sits on the tail, well above the cushion) */
function seatTop(m){const I=m.I;if(I._sy!==undefined)return I._sy;const ms=[];m.inner.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.visible){let q=o;while(q&&q!==m.inner){if(m.rider&&q===m.rider.g)return;q=q.parent}ms.push(o)}});
 m.inner.updateMatrixWorld(true);const rc=new THREE.Raycaster(),inv=new THREE.Matrix4().copy(m.inner.matrixWorld).invert(),hs=[];
 for(const dz of[0,-.06,.06])for(const dx of[0,.05,-.05]){const o=new THREE.Vector3(dx,I.seat[1]+.25,I.seat[2]-.04+dz);m.inner.localToWorld(o);const d=new THREE.Vector3(0,-1,0).transformDirection(m.inner.matrixWorld);rc.set(o,d);
  const h=rc.intersectObjects(ms,false)[0];if(h){const y=h.point.clone().applyMatrix4(inv).y;if(y>I.seat[1]-.35)hs.push(y)}}
 hs.sort((a,b)=>a-b);/* the median: one ray clipping the tank or the tail must not lift the rider */return I._sy=hs.length?hs[hs.length>>1]:I.seat[1]+.03}
function seatFit(I,m){if(I._fit)return I._fit;const g=I.grip,hy=(m&&m.inner?seatTop(m):I.seat[1]+.03)+.08;/* hip joint about a pelvis above the cushion */let hz=Math.min(I.seat[2]-.04,g[2]-.5);const reach=Math.sqrt(.58*.58-Math.pow(g[0]-.2,2)*.5);
 const f=l=>Math.hypot(hy+.5*Math.cos(l)-g[1],hz+.5*Math.sin(l)-g[2]);let lo=-.25,hi=1.2;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(f(m)>reach)lo=m;else hi=m}
 let lean=Math.min(1.0,(lo+hi)/2);/* still too far (low clip-ons): slide the hips forward instead of folding further */
 for(let i=0;i<20&&f(lean)>reach+.01;i++)hz+=.02;return I._fit={hz,hy,lean}}
function basePose(p){const I=p.m.I,peg=I.peg,F=seatFit(I,p.m);
 return{hip:[0,F.hy,F.hz],lean:F.lean,side:0,hands:null,feet:[[peg[0],peg[1]+.06,peg[2]+.05],[peg[0],peg[1]+.06,peg[2]+.05]],look:-.05}}
/* trick poses. u is the eased blend (0 riding, 1 in the trick), r the raw ramp, used to stage a move: the body goes first, then the feet,
   then the hands let go, so nothing snaps. Hands always travel from their grips (rider space, x mirrored per side) to where the trick puts them */
const seg=(r,a,b)=>{const x=cl((r-a)/(b-a),0,1);return x*x*(3-2*x)};
/* Nov 2: the Seat Stand and the hand drag are switched off for now (they still look wrong). Their pose code stays: set HAND_DRAG and
   put the Seat Stand back in TRICKS to bring them back */
const HAND_DRAG=false;
const HOLD=t=>!!t&&(t.k==='wheelie'||t.k==='stoppie');/* Nov 2: wheelie-type tricks are held, the rest are tapped on and off */
const SHOVE_T=.6;/* one shove, wind-up to recovery (s) */
const TRATE={wheelie:3.2,stoppie:3.4,standup:2.6,twelve:2.2,nohands:2.2,superman:1.7,seatstand:1.4,burnout:3};/* blend speed (1/s): big body moves take longer */
function trickPose(p,id,u,r){const b=basePose(p),I=p.m.I,seat=I.seat,SY=seatFit(I,p.m).hy-.1,g=I.grip;r=r==null?u:r;
 const hand=(t,v)=>v<.02?null:[lp(g[0],t[0],v),lp(g[1],t[1],v),lp(g[2],t[2],v)],both=(t,v)=>{const h=hand(t,v);return h?[h,h.slice()]:null};
 const feet=(t,v)=>[0,1].map(i=>b.feet[i].map((x,j)=>lp(x,t[i][j],v)));
 switch(id){
  case'wheelie':{/* seated, weight back on the seat, the bar hand on the throttle and the free (left) arm out to the side for balance;
    the deeper the wheelie, the further forward over the tank, so the body stays near upright */const arm=seg(r,.35,1);
   return Object.assign(b,{lean:b.lean+(.12+Math.max(0,p.pitch)*.72)*u,hip:[0,b.hip[1],b.hip[2]-.04*u],look:b.look+.12*u,hands:[hand([.74,b.hip[1]+.36,seat[2]+.36],arm),null]})}
  case'standup':{const up=seg(r,0,.8);/* up onto the pegs, knees soft, chest over the bars */return Object.assign(b,{hip:[0,lp(b.hip[1],SY+.5,up),lp(b.hip[2],seat[2]+.12,up)],lean:b.lean+.42*up+Math.max(0,p.pitch)*.5*u,look:b.look+.1*u})}
  case'twelve':{const up=seg(r,0,.7);/* stood up and folded forward so the body stays plumb while the bike points at the sky */return Object.assign(b,{hip:[0,lp(b.hip[1],SY+.42,up),lp(b.hip[2],seat[2]-.04,up)],lean:b.lean+Math.max(.5,p.pitch)*.95*u,look:-.25*u})}
  case'stoppie':{/* weight back and up off the seat, arms braced, looking down the road over the front */return Object.assign(b,{hip:[0,lp(b.hip[1],SY+.3,u),lp(b.hip[2],seat[2]-.18,u)],lean:b.lean-.3*u-Math.max(0,-p.pitch)*.4*u,look:.2*u})}
  case'nohands':{/* sat up straight, weight on the back of the seat, the hands come off the bars and rest in front of the chest */const sit=seg(r,0,.6),arm=seg(r,.3,1);
   return Object.assign(b,{lean:lp(b.lean,-.04,sit),hip:[0,b.hip[1],b.hip[2]-.08*sit],hands:both([.2,b.hip[1]+.42,seat[2]+.3],arm),look:.04*sit})}
  case'superman':{/* hips up and chest over the tank, hands on the bars, the right foot stays on its peg and the left leg kicks out
    straight behind, up high */const fwd=seg(r,0,.6),leg=seg(r,.3,1);
   return Object.assign(b,{hip:[0,lp(b.hip[1],SY+.46,fwd),lp(b.hip[2],seat[2]-.12,fwd)],lean:lp(b.lean,1.15,fwd),feet:[b.feet[0].map((x,j)=>lp(x,[.14,SY+.88,seat[2]-1.05][j],leg)),b.feet[1]],look:.35*fwd})}
  case'seatstand':{/* up onto the pegs, then one foot at a time onto the seat, crouched over with the hands still on the bars */const up=seg(r,0,.45),f0=seg(r,.2,.55),f1=seg(r,.35,.7),crouch=seg(r,.55,1),fy=SY+.06;
   const fs=[b.feet[0].map((x,j)=>lp(x,[.12,fy,seat[2]+.14][j],f0)),b.feet[1].map((x,j)=>lp(x,[.12,fy,seat[2]-.04][j],f1))];
   return Object.assign(b,{hip:[0,lp(b.hip[1],SY+.42,up)+.34*crouch,lp(b.hip[2],seat[2]-.04,up)+.12*crouch],lean:lp(lp(b.lean,.6,up),.9,crouch),leanMax:.98,feet:fs,look:-.15*crouch})}/* bent at the waist with straight arms to the bars, a clear gap between chest and tank (from the photo) */
  case'burnout':{/* weight forward over the front, left foot planted ahead of the peg */const ft=seg(r,0,.6);return Object.assign(b,{lean:b.lean+.25*u,hip:[0,b.hip[1],b.hip[2]+.05*u],feet:[b.feet[0].map((x,j)=>lp(x,[I.peg[0]+.1,.05,I.peg[2]+.35][j],ft)),b.feet[1]]})}
 }return b}
/* blend two whole poses; a hand that is on its grip in one pose counts as sitting at the grip, so it travels instead of jumping */
function blendPose(a,b,w,g){const L=(x,y)=>x.map((v,i)=>lp(v,y[i],w)),G=[g[0],g[1],g[2]];const o=Object.assign({},b);o.hip=L(a.hip,b.hip);o.lean=lp(a.lean,b.lean,w);o.side=lp(a.side||0,b.side||0,w);o.look=lp(a.look||0,b.look||0,w);
 o.feet=[L(a.feet[0],b.feet[0]),L(a.feet[1],b.feet[1])];if(a.hands||b.hands){const ha=a.hands||[null,null],hb=b.hands||[null,null];o.hands=[0,1].map(s=>{if(!ha[s]&&!hb[s])return null;const h=L(ha[s]||G,hb[s]||G);return Math.hypot(h[0]-G[0],h[1]-G[1],h[2]-G[2])<.01?null:h})}
 if(a.leanMax!=null||b.leanMax!=null)o.leanMax=Math.max(a.leanMax!=null?a.leanMax:1.45,b.leanMax!=null?b.leanMax:1.45);return o}
function mixPose(a,b,u){const L=(x,y)=>x.map((v,i)=>lp(v,y[i],u));return{hip:L(a.hip,b.hip),lean:lp(a.lean,b.lean,u),side:lp(a.side||0,b.side||0,u),look:lp(a.look||0,b.look||0,u),
 hands:(a.hands||b.hands)&&u>.5?b.hands:a.hands&&u<=.5?a.hands:null,feet:[L(a.feet[0],b.feet[0]),L(a.feet[1],b.feet[1])]}}
function poseRiderFor(p,dt){const t=p.trk_;
 /* trick blend: a linear ramp shaped by smootherstep, so each move eases in and out; a new trick waits for the last one to fade first */
 /* a new trick picked mid-trick cross-fades straight from the old pose to the new one */if(t&&p.lastPose&&t.id!==p.lastPose&&p.tr>=.02){p.prevPose=p.lastPose;p.prevU=p.tu||0;p.tr=0;p.lastPose=t.id}
 if(t&&(!p.lastPose||p.tr<.02))p.lastPose=t.id;const id=p.lastPose||'wheelie',want=t&&t.id===id?1:0;
 const rt=TRATE[id]||3;p.tr=cl((p.tr||0)+(want?rt:-rt*1.15)*dt,0,1);const u=p.tr*p.tr*p.tr*(p.tr*(p.tr*6-15)+10);p.tu=u;
 /* the body counters the bike's lean a little, lagging it so the roll looks weighted */
 p.rs=lp(p.rs||0,-p.lean*.25,cl(dt*6,0,1));
 if(p.prevU>0)p.prevU=Math.max(0,p.prevU-dt*(TRATE[p.prevPose]||3)*1.15);
 let ps=u>.005?trickPose(p,id,u,p.tr):basePose(p);if(p.prevU>.005){const a=trickPose(p,p.prevPose,p.prevU,p.prevU);ps=blendPose(a,ps,u/(u+p.prevU),p.m.I.grip)}ps.side=(ps.side||0)+p.rs;
 /* the body answers the controls: steering shifts the hips and shoulders to the inside and turns the head; throttle and brake rock the torso */
 const st=p.st||0;p.rst=lp(p.rst||0,st,cl(dt*5,0,1));const tb=(p.th||0)-(p.br||0);p.rtb=lp(p.rtb||0,tb,cl(dt*4,0,1));
 ps.hip=ps.hip.slice();ps.hip[0]-=p.rst*.06+p.lean*.05;ps.side-=p.rst*(.12+.18*u);ps.turn=(ps.turn||0)-p.rst*.35;ps.lean+=(p.trk_&&p.trk_.k==='wheelie'?-1:1)*p.rtb*.06;
 if(p.trk_&&p.trk_.k==='balance'){/* balance tricks: the arms and body work against the wobble */ps.side-=(p.bal||0)*.6;if(ps.hands)ps.hands=ps.hands.map((h,i)=>[h[0],h[1]+(i?-1:1)*(p.bal||0)*.5,h[2]])}
 ps.knee=p.lean;
 /* speed: tuck in behind the bars as the speed climbs (chest down, head up to see over them), sit up when crawling, and at full chat the wind
    buffets the shoulders and head. Riding only: a trick pose takes over as it blends in */
 {const tk=seg(p.v,24,52)*(1-u),slow=1-cl(p.v/6,0,1),bf=seg(p.v,38,62)*(1-u);p.tkS=lp(p.tkS||0,tk,cl(dt*2.5,0,1));const k_=p.tkS;
  ps.lean+=.34*k_-.1*slow*(1-u);ps.hip=ps.hip.slice();ps.hip[1]-=.035*k_;ps.hip[2]+=.05*k_;ps.look=(ps.look||0)+.22*k_;
  if(bf>0){const t_=B?B.t:0;ps.side+=bf*.035*(Math.sin(t_*11.3+p.k)+.6*Math.sin(t_*17.9));ps.turn=(ps.turn||0)+bf*.03*Math.sin(t_*8.7+1.3);ps.look+=bf*.02*Math.sin(t_*13.1)}}
 /* reach out: shove the other rider (one hand off the bar, arm out towards them) */
 if(p.shoveT>0)p.shoveT-=dt;
 const S=p.m.I.seat,hy=seatFit(p.m.I,p.m).hy;
 if(p.shoveT>0||p.shE<SHOVE_T){/* a shove in three beats: wind up (arm drawn back, body away), the push (arm drives out at the other
   rider's shoulder, body and head turn into it), then back to the grip */const e=p.shE=BK._shAt!=null?BK._shAt:Math.min(SHOVE_T,(p.shE||0)+dt),/* _shAt: test hook, holds a beat for a screenshot */side=p.shoveSide||1,s_=side>0?1:0,sg=s_?-1:1,g=p.m.I.grip;
  const wind=seg(e,0,.12)*(1-seg(e,.12,.2)),ext=seg(e,.12,.22)*(1-seg(e,.36,.58));
  const o=B.pl[1-p.k];let tgt=[.75,hy+.5,S[2]+.3];if(o&&o.m){p.m.g.updateMatrixWorld(true);o.m.g.updateMatrixWorld(true);const w=new THREE.Vector3(0,1.2,.05);o.m.inner.localToWorld(w);p.m.inner.worldToLocal(w);tgt=[cl(w.x*sg,.35,1.0),cl(w.y,hy+.3,hy+.7),cl(w.z,S[2]-.1,S[2]+.6)]}
  const hs=ps.hands?ps.hands.slice():[null,null],back=[g[0]+.12,g[1]+.18,g[2]-.28];
  if(wind+ext>.02){const k1=wind,k2=ext;hs[s_]=[0,1,2].map(j=>g[j]+(back[j]-g[j])*k1+(tgt[j]-g[j])*k2);ps.hands=hs;ps.reach=s_;ps.reachMax=.12}
  ps.side+=side*(.22*ext-.1*wind);ps.turn=(ps.turn||0)-side*(.45*ext+.15*wind);ps.lean+=.08*ext;ps.hip=ps.hip.slice();ps.hip[0]-=side*.06*ext}
 /* on the receiving end: the bike is knocked sideways and the body lags behind it, then rights itself */
 if(p.jolt>0){p.jolt=Math.max(0,p.jolt-dt*1.8);const j=Math.sin(Math.min(1,p.jolt)*Math.PI)*p.jolt;ps.side-=(p.joltSide||1)*.35*j;ps.turn=(ps.turn||0)+(p.joltSide||1)*.25*j;ps.look=(ps.look||0)+.1*j}
 /* deep wheelie: one hand goes down to the road behind */
 p.dg=lp(p.dg||0,p.drag?1:0,cl(dt*6,0,1));
 if(p.dg>.05){/* the hand-drag pose (from a real one): bike near vertical, the rider sat low on the tail with the legs along the bike,
   torso leaning back and out to one side, the bar hand up on its grip and the other arm straight down to the road beside the rear wheel */
  const m=p.m,side=p.dragSide||1,u=p.dg,s_=side>0?0:1,sg=s_?-1:1;p.m.g.updateMatrixWorld(true);/* beside the rear tyre, where the bike actually stands */const rw=new THREE.Vector3().fromArray(p.m.I.rw);m.inner.localToWorld(rw);
  B.road.pos(p.s,p.d_,_pp);const yaw=m.g.rotation.y,rgt=new THREE.Vector3(-Math.cos(yaw),0,Math.sin(yaw)),fwd=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const w=new THREE.Vector3(rw.x,_pp.y+.03,rw.z).addScaledVector(rgt,side>0?-.75:.75).addScaledVector(fwd,-.1);m.inner.worldToLocal(w);
  const hs=ps.hands?ps.hands.slice():[null,null];const g=p.m.I.grip;hs[s_]=[lp(g[0],w.x*sg,u),lp(g[1],w.y,u),lp(g[2],w.z,u)];/* the other hand goes back to its grip */const o_=hs[1-s_];hs[1-s_]=o_&&u<.95?[lp(o_[0],g[0],u),lp(o_[1],g[1],u),lp(o_[2],g[2],u)]:null;ps.hands=hs;ps.reach=s_;ps.reachMax=.22;
  ps.hip=[lp(ps.hip[0],sg*.1,u),lp(ps.hip[1],hy-.02,u),lp(ps.hip[2],S[2]-.16,u)];ps.lean=lp(ps.lean,p.pitch-.95,u);ps.leanMax=p.pitch-.75;/* leaning back off the bike, chest well clear of the tank *//* hold it longer and the body swings further out over the road */p.dfar=lp(p.dfar||0,cl(((p.dragT||0)-.8)/1.5,0,1),cl(dt*2,0,1));const far=p.dfar;ps.side=lp(ps.side,-sg*(.5+.3*far),u);
  /* feet stay down on the pegs (as in the photos): the outside foot a touch back, the inside knee open */{const pg=p.m.I.peg;ps.feet=ps.feet.map((f,i)=>[lp(f[0],pg[0]+(i===s_?.04:.0),u),lp(f[1],pg[1]+.06,u),lp(f[2],pg[2]+(i===s_?.02:-.08),u)])}ps.look=lp(ps.look||0,.25,u);ps.turn=lp(ps.turn||0,sg*.5,u)}
 /* stopped: the left foot goes down to the road (people riders) */
 p.fd=lp(p.fd||0,(!p.trk_&&p.v<1.2&&!p.wipe)?1:0,cl(dt*4,0,1));if(p.fd>.01&&p.m.rider&&p.m.rider.people){const f=ps.feet[0].slice(),I=p.m.I;ps.feet[0]=[lp(f[0],I.peg[0]+.2,p.fd),lp(f[1],-.02,p.fd),lp(f[2],I.peg[2]+.18,p.fd)];ps.side-=.06*p.fd}
 BK.poseRider(p.m,ps)}

/* ---------------- bike physics ---------------- */
const G=9.81;
/* Nov 2: every trick has its own key (1-8 for rider 1, numpad 1-8 for rider 2): hold it to do the trick. A pad's trick button does the
   last trick used, and its menu button steps through them */
function inputs(p){const K=KEYS[p.k],pad=padIn(p.k);let th=kd(p.k,'u')?1:0,br=kd(p.k,'d')?1:0,st=(kd(p.k,'r')?1:0)-(kd(p.k,'l')?1:0),tk=-1;
 /* tap, not hold: only the moment a trick key goes down counts */
 let fresh=false;for(let i=0;i<TRICKS.length;i++)if(taps.has(K.tk[i])){taps.delete(K.tk[i]);tk=i;fresh=true;break}
 let tap=fresh;
 if(pad){th=Math.max(th,pad.th);br=Math.max(br,pad.br);if(pad.st)st=pad.st;if(pad.t&&!p.padT){tap=true;if(tk<0)tk=TBY[p.equip].i}p.padT=pad.t;
  if(pad.m&&!p.padM){p.equip=TRICKS[(TBY[p.equip].i+1)%TRICKS.length].id;guidePaint(p)}p.padM=pad.m;p.padC=pad.c}
 if(tap&&tk>=0&&!p.trk_&&TRICKS[tk].id!==p.equip){p.equip=TRICKS[tk].id;guidePaint(p)}
 /* held trick key (wheelies and stoppies are held, not toggled): its index, or the equipped trick while a pad's trick button is held */
 let tkH=-1;for(let i=0;i<TRICKS.length;i++)if(down.has(K.tk[i])){tkH=i;break}if(tkH<0&&pad&&pad.t)tkH=TBY[p.equip].i;
 return{th,br,st,tap,tk,tkH}}
function physStep(p,dt){if(p.wipe){wipeStep(p,dt);return}
 const I=inputs(p),live=B.state==='ride';const th=live?I.th:0,br=live?I.br:(B.state==='count'?1:0);
 p.th=lp(p.th,th,cl(dt*8,0,1));p.br=br;p.ghost=Math.max(0,p.ghost-dt);
 const v=p.v,T=p.trk_;
 /* trick start / end */
 /* tap a trick key to start that trick, tap any trick key again to land it */
 if(I.tap&&live){const nt=I.tk>=0?TRICKS[I.tk]:null;
  if(!T&&!p.trOn)p.trOn=true;
  else if(T&&p.trOn&&nt&&nt.id!==T.id&&canStart(p,nt)){/* combo: a different trick key mid-trick goes straight into that trick (the one you were in is scored), no landing first */
   endTrick(p,true);p.equip=nt.id;p.trOn=true;beginTrick(p,nt);guidePaint(p)}
  else if(p.trOn&&!HOLD(T||TBY[p.equip]))p.trOn=false;else if(!p.trOn&&nt)p.trQ=nt.id/* still landing: start this one next */}
 /* wheelie family: held. Let go of its key and you land */
 /* wheelie family (round 13): the key is a balance input, not an on/off. The trick lasts until the wheel is back on the road */
 p.hold=T&&HOLD(T)&&live?I.tkH===T.i:false;
 if(!T&&!p.trOn&&p.trQ&&live){p.equip=p.trQ;p.trQ=null;p.trOn=true;guidePaint(p)}
 if(!live){p.trOn=false;p.trQ=null}
 const want=p.trOn&&live;
 if(want&&!T&&p.t2==null){const t=TBY[p.equip];if(canStart(p,t))beginTrick(p,t);else{p.trOn=false;if(!p.warnT||B.t-p.warnT>1.2){p.warnT=B.t;pop(p,needMsg(p,t),'#c9d2d8',.9)}}}
 if(T&&!want&&T.k!=='wheelie'&&T.k!=='stoppie')endTrick(p,true);
 /* drive force */
 let a=0;const top=p.vmax;
 /* landing a wheelie: roll off so the front comes down; landing a stoppie: ease off the front brake */
 const thr=T&&T.k==='burnout'?0:p.th;
 a+=thr*p.acc*Math.max(0,1-Math.pow(v/top,2.2))*(v<4?.85:1);
 a-=.0042*v*v+.15;/* drag + rolling */
 a+=thr*(.0042*top*top+.15)*Math.pow(Math.min(1,v/top),2);/* round 13: full throttle holds the bike's stated top speed */
 const brk=T&&T.k==='burnout'?1:p.br;
 if(brk>0&&v>0)a-=brk*(T&&T.k==='stoppie'?6.2:9.2);
 if(T&&T.k==='stoppie'&&p.hold&&v>0)a-=4+Math.max(0,-p.pitch)*7;/* round 13: the stoppie is the front brake */
 p.v=Math.max(0,v+a*dt);if(p.v<.05&&brk>0)p.v=0;
 /* gears for sound and the dial */
 const gr=Math.min(6,1+Math.floor(p.v/top*6.2));p.gear=gr;const lo=(gr-1)/6.2*top,hi=gr/6.2*top;p.rpm=cl((p.v-lo)/(hi-lo+1e-3),0,1)*.8+.15+(T&&T.k==='burnout'?.5*p.th:0);
 /* steering: target lean from input, yaw from the lean (coordinated turn); slow speeds steer the bars directly */
 let st=I.st;if(T&&T.k==='balance'){st=0}if(T&&(T.k==='wheelie'||T.k==='stoppie'))st*=.55;
 if(T&&T.k==='burnout')st*=.3;
 p.st=lp(p.st,st,cl(dt*(5+p.hnd*4),0,1));
 const vs=p.v,maxL=.78*ss(2,11,vs)*(.85+p.hnd*.2);let tl=p.st*maxL;
 if(T&&T.k==='balance')tl=p.bal*.55;
 /* lean as a critically damped spring: it rolls in and settles out gradually instead of snapping to the input */
 {const om=4.2+p.hnd*2.4,h=Math.min(dt,.05);p.lv=(p.lv||0)+(om*om*(tl-p.lean)-2*om*(p.lv||0))*h;p.lean+=p.lv*h}
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
function beginTrick(p,t){p.trk_=t;p.tt=0;p.up=0;p.trickPts=0;p.bal=(Math.random()-.5)*.1;p.balV=0;if(t.k==='wheelie'&&p.pitch<.05){p.pv=Math.max(p.pv,.25)}
 if(t.k==='stoppie'){p.pv=Math.min(p.pv,-.2)}sfx.trick(t.i);p.liveSk={n:t.n.toUpperCase(),id:++SKID};p.skV++/* round 13: the trick shows as a live line in the skill chain, not a big label */}
function endTrick(p,clean){const t=p.trk_;if(!t)return;p.trk_=null;p.trOn=false;p.liveSk=null;p.skV++;const pts=Math.round(p.trickPts);
 if(clean&&pts>20&&p.tt>.6){const bonus=Math.round(pts*.25*p.mult);p.score+=bonus;p.tricks++;bumpChain(p,1);if(!p.bestTrick||pts+bonus>p.bestTrick.pts)p.bestTrick={n:t.n,pts:pts+bonus};
  skill(p,t.n.toUpperCase(),pts+bonus,0,p.tt);sfx.land()}
 p.lastTrick=B.t}
function trickStep(p,dt,I){const t=p.trk_;
 /* pitch dynamics: gravity pulls the bike back to both wheels below the balance point and over it above; throttle lifts, rear brake drops */
 const bal=t&&t.twelve?1.38:1.05;/* wheelie balance angle (rad) */
 /* Nov 2 (round 4): tapped tricks hold themselves. While a wheelie or stoppie is on, the bike is steered to a target angle (throttle
    raises it, brake lowers it); after the landing tap the target is zero and the wheel comes down softly, which ends the trick */
 if(t&&(t.k==='wheelie'||t.k==='stoppie')){const wh=t.k==='wheelie',th_=I?I.th:0,br_=I?I.br:0;
  /* Nov 2 (round 6): no autopilot. The key is held; the bike balances on an unstable point and you ride it there yourself: throttle lifts
     the front, the rear brake drops it, a drifting gust pushes it about. Under the point it falls back, past it it goes over */
  const w0=p.wn||0;p.wn=w0+((Math.random()-.5)*8-w0*1.4)*dt;
  /* Round 13: hold the trick key to lift, let go to let it fall, and balance it there by pumping the key or the throttle (speeding up
     lifts, braking drops). Getting it up takes the key and the throttle together and enough speed; past the balance point it goes over */
  const hk=p.hold?1:0;
  if(wh){const bp=t.twelve?1.3:t.stand?.95:1.06,spdK=ss(4,10,p.v)*(.55+.45*ss(70,20,p.v));
   const gt=-3.3*Math.sin(bp-p.pitch),lift=((p.tt<.45?hk*(2.4+p.trk*.3):0)+th_*(3.05+p.trk*.4))*spdK-br_*5-(1-th_)*1.3/* off the gas it comes down */;/* round 14: the trick key pops it up, the throttle holds and deepens it */
   p.pv+=(lift+gt+p.wn*.9-p.pv*.8)*dt;p.pitch+=p.pv*dt;
   if(p.pitch<=0){p.pitch=0;p.pv=Math.max(0,p.pv);if(p.tt>.6&&(p.up||!hk)){endTrick(p,!!p.up);p.up=0;return}}
   if(p.pitch>.12)p.up=1;
   if(p.pitch>bp+.4){wipeout(p,'LOOPED OUT');return}}
  else{/* stoppie: holding the key grabs the front brake, which slows you and tips the back up. Speed keeps it up: the faster you go the
     harder it tips, the throttle pushes the back down, and it falls back once you have run out of speed */
   const spdK=ss(3,14,p.v),press=hk*(3.3+p.trk*.5)*spdK+br_*1.2*spdK-th_*2.2,gt=p.pitch>-.95?2.4*Math.cos(p.pitch):-1.6;
   p.pv+=(-press+gt+p.wn*.8-p.pv*1.0)*dt;p.pitch+=p.pv*dt;
   if(p.pitch>=0){p.pitch=0;p.pv=Math.min(0,p.pv);if(p.tt>.6&&(p.up||!hk)){endTrick(p,!!p.up);p.up=0;return}}
   if(p.pitch<-.1)p.up=1;
   if(p.v<1.5)p.pv+=3*dt;
   if(p.pitch<-1.15){wipeout(p,'OVER THE BARS');return}}}
 else{
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
 }
 if(!t){p.smoke=Math.max(0,p.smoke-dt);return}
 p.tt+=dt;let rate=0;
 p.drag=HAND_DRAG&&t.k==='wheelie'&&!t.stand&&p.pitch>1.18&&p.v>4;/* near vertical, like a real hand drag */if(p.drag){p.dragT=(p.dragT||0)+dt;p.trickPts+=60*dt*p.mult;if(p.dragT>.3&&!p.dragPop){p.dragPop=1;pop(p,'HAND DRAG','#ffd36a',1.1)}if(Math.random()<dt*14)spark(p,p.dragSide||1)}else{p.dragT=0;p.dragPop=0}
 if(t.k==='wheelie'){const ang=p.pitch*57.3;if(t.twelve)rate=ang>70?1:0;else rate=ang>12?(t.stand?(ang>20?1:.4):1):0;if(t.stand&&p.v<2)rate=0}
 else if(t.k==='stoppie'){rate=p.pitch<-.12?1:0;if(p.v<.6)endTrick(p,true)}
 else if(t.k==='balance'){/* wobble: a slow random push, unstable; A / D push back */
  const k=t.wob||1;p.balV+=((Math.random()-.5)*3.4*k+p.bal*(2.1*k)+I.st*(-3.4))*dt;p.balV*=1-dt*1.0;/* round 6: wobblier, less damped */p.bal+=p.balV*dt;
  rate=1;if(Math.abs(p.bal)>1){wipeout(p,'LOST BALANCE');return}if(p.v<t.min*.7){endTrick(p,true);return}}
 else if(t.k==='burnout'){rate=p.th>.3?1:0;p.smoke=p.th;if(p.th>.3&&Math.random()<dt*24)smokePuff(p)}
 if(rate>0){const pts=t.pps*rate*dt*(.6+p.trk*.4);p.trickPts+=pts;p.score+=pts*p.mult/* the chain timer keeps running during a trick (it used to be topped up, which froze the counter through a long burnout or wheelie); landing the trick is what extends the chain */}}
function walls(p,dt){const ex=B.road.exitNear(p.s+250),x=ex>-1e8&&p.s>ex-230&&p.s<ex?RD.LW:0;
 const lo=.62,hi=RD.SHO-.28+x,vlat=p.v*Math.sin(p.psi);
 if(p.d_<lo||p.d_>hi){const side=p.d_<lo?-1:1;p.d_=side<0?lo:hi;
  if(Math.abs(vlat)>7.5&&p.ghost<=0){wipeout(p,side<0?'HIT THE BARRIER':'HIT THE RAIL');return}
  p.psi=wrapA(-p.psi*.35);p.v*=.93;p.lean*=.6;if(p.scrape<=0){sfx.scrape();p.scrape=.3;spark(p,side)}if(p.chain>0){p.comboT=Math.min(p.comboT,.8)}pen(p,'SCRAPE')}
 p.scrape=Math.max(0,p.scrape-dt);
 /* gore nose: the exit lane closes */
 if(ex>-1e8&&p.s>ex&&p.s<ex+3&&p.d_>RD.SHO-.28&&p.ghost<=0)wipeout(p,'HIT THE CUSHION')}

/* ---------------- scoring ---------------- */
/* the skill chain (Forza style): every move that keeps the chain alive is listed with its points, repeats stack (NEAR MISS x3),
   and the chain total is banked when the timer runs out or lost in a wipeout */
/* round 13: knocks (traded paint, bumps, scrapes) are small chain lines too, and they take points off */
function pen(p,n){if(p.chain<=0)return;const x=Math.round(40+p.chainPts*.12);p.score=Math.max(0,p.score-x);skill(p,n,-x)}
let SKID=0;function skill(p,n,pts,side,dur){const top=p.sk[0];if(dur){p.sk.unshift({n,c:1,pts,t:B.t,id:++SKID,dur});if(p.sk.length>4)p.sk.length=4}else if(top&&top.n===n&&!top.dur&&B.t-top.t<3){top.c++;top.pts+=pts;top.t=B.t;top.id=++SKID}else{p.sk.unshift({n,c:1,pts,t:B.t,id:++SKID});if(p.sk.length>4)p.sk.length=4}
 p.chainPts=Math.max(0,p.chainPts+pts);p.skV++;p.skEnd=null;if(side){const h=hudOf(p),f=h&&h.querySelector('.nf.'+(side>0?'r':'l'));if(f){f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}}}
function endChain(p,ok){if(p.chain>0&&p.chainPts>0)p.skEnd={ok,pts:Math.round(p.chainPts),m:p.mult,t:B.t};p.chain=0;p.mult=1;p.comboT=0;p.chainPts=0;p.sk=[];p.skV++}
/* harder to keep a chain going: 2.6 s to land the next move (was 4), and three moves per multiplier step (was two) */
const CHAIN_T=2.6;function bumpChain(p,n){p.chain+=n;p.mult=Math.min(10,1+Math.floor(p.chain/3));p.comboT=CHAIN_T;if(p.mult>p.bestCombo)p.bestCombo=p.mult}
function scoreStep(p,dt){if(p.wipe)return;p.comboT-=dt;if(p.comboT<=0&&p.chain>0)endChain(p,true);
 /* round 13: more chain moves. HIGH SPEED for holding near the bike's top speed, DRAFTING for tucking in close behind a car */
 if(B.state==='ride'){if(p.v>p.vmax*.9){p.hsT=(p.hsT||0)+dt;if(p.hsT>3){p.hsT=0;const pts=Math.round(90*p.mult);p.score+=pts;bumpChain(p,1);skill(p,'HIGH SPEED',pts)}}else p.hsT=0;
  const dv=p.v>20&&B.tr.find(v=>v.side>0&&v.ramp==null&&!(v.hit>0)&&v.s>p.s&&v.s-p.s<v.L/2+8&&Math.abs(v.d-p.d_)<v.W/2-.1);
  if(dv){p.drT=(p.drT||0)+dt;if(p.drT>2){p.drT=0;const pts=Math.round(120*p.mult);p.score+=pts;bumpChain(p,1);skill(p,'DRAFTING',pts)}}else p.drT=0}
 /* near misses and lane splits: pass a vehicle within 1.3 m */
 const pv=p.v*Math.cos(p.psi);
 for(const v of B.tr){if(v.side<0||v.ramp!=null||v.hit>0)continue;const ds=v.s-p.s;if(Math.abs(ds)>v.L/2+3){v['ps'+p.k]=Math.sign(ds);continue}
  const gap=Math.abs(v.d-p.d_)-v.W/2-.38;const prev=v['ps'+p.k];const now=Math.sign(ds);
  if(prev>0&&now<=0&&gap<1.3&&gap>-.05&&pv-v.v>3&&p.v>16&&B.state==='ride'){
   const close=gap<.6,base=close?260:150,pts=Math.round(base*(1+(p.v-16)/30)*p.mult);p.score+=pts;p.near++;bumpChain(p,1);
   /* a split: vehicles both sides at once */
   const other=B.tr.find(u=>u!==v&&u.side>0&&Math.abs(u.s-p.s)<u.L/2+2&&Math.sign(u.d-p.d_)!==Math.sign(v.d-p.d_)&&Math.abs(u.d-p.d_)<u.W/2+1.6);
   const sd=Math.sign(v.d-p.d_)||1;if(other){p.splits++;bumpChain(p,1);p.score+=pts;skill(p,'LANE SPLIT',pts*2,sd)}else skill(p,close?'CLOSE CALL':'NEAR MISS',pts,sd);sfx.near()}
  v['ps'+p.k]=now}}
function collide(p){if(p.wipe||p.ghost>0)return;const pd=p.d_,hw=.36+Math.abs(Math.sin(p.psi))*.9;
 for(const v of B.tr){if(v.side<0||v.ramp!=null)continue;const ds=p.s-v.s;if(Math.abs(ds)>v.L/2+1.1)continue;const dd=pd-v.d,vw=v.W*.46;/* round 14: the body, not the mirrors */if(Math.abs(dd)>vw+hw)continue;
  /* inside the box: where from? */
  const ox=v.L/2+1.1-Math.abs(ds),oy=vw+hw-Math.abs(dd);const vrel=p.v*Math.cos(p.psi)-(v.hit>0?v.v*.5:v.v);
  if(ox<oy){/* nose or tail: a rear-end */if(Math.abs(vrel)>4.5){hitVeh(v,p);wipeout(p,ds<0?pick(['RAN OUT OF ROAD','MISJUDGED THE GAP','NO GAP LEFT','TOO CLOSE FOR COMFORT']):pick(['BLINDSIDED','CAUGHT FROM BEHIND']));return}
   p.s=v.s+Math.sign(ds||-1)*(v.L/2+1.12);p.v=Math.max(0,v.v*(ds<0?.95:1.05));p.pv=0;pen(p,'BUMP');sfx.scrape()}
  else{const lat=p.v*Math.sin(p.psi)*Math.sign(-dd);if(lat>5.5||p.trk_&&p.trk_.k==='balance'){hitVeh(v,p);wipeout(p,pick(['SQUEEZED OUT','SWAPPED PAINT','THREADED IT TOO FINE']));return}
   p.d_=v.d+Math.sign(dd||1)*(vw+hw+.02);p.psi=wrapA(p.psi*.3+Math.sign(dd)*.05);p.v*=.9;p.lean*=.5;if(p.scrape<=0){sfx.scrape();p.scrape=.35;spark(p,-Math.sign(dd))}
   if(p.chain>0){pen(p,'TRADED PAINT');p.comboT=Math.min(p.comboT,.8)}}}}
/* rider against rider (two players): the same box logic as traffic, but both bikes give way; a hard rear-end or a fast swipe drops whoever caused it */
function collideRiders(){const P=B.pl;if(P.length<2)return;const a=P[0],b=P[1];if(a.wipe||b.wipe||a.ghost>0||b.ghost>0)return;
 {/* close alongside: whoever is not mid-trick reaches out and shoves; the push only moves you apart */
  const ds0=b.s-a.s,dd0=b.d_-a.d_;if(Math.abs(ds0)<1.3&&Math.abs(dd0)<1.7&&Math.abs(dd0)>.5){for(const [q,o] of[[a,b],[b,a]]){if(q.trk_||q.shoveCD>0)continue;q.shoveT=SHOVE_T;q.shE=0;q.shoveHit=0;q.shoveCD=1.6;q.shoveSide=(o.d_>q.d_)?1:-1}}
  for(const q of P){q.shoveCD=Math.max(0,(q.shoveCD||0)-1/60);const e=q.shE||0;if(q.shoveT>0&&e>.14&&e<.34){const o=q===a?b:a,dir=Math.sign(o.d_-q.d_)||1;o.d_+=dir*1.2/60;q.d_-=dir*.35/60;o.lv=(o.lv||0)+dir*.4/60*20;if(!q.shoveHit){q.shoveHit=1;if(B.state==='ride'){const pts=Math.round(180*q.mult);q.score+=pts;bumpChain(q,1);skill(q,'DANGEROUS',pts)}o.jolt=1;o.joltSide=dir;sfx.scrape()}}}}
 const ds=b.s-a.s,dd=b.d_-a.d_,LS=2.05,LD=.62+(Math.abs(Math.sin(a.psi))+Math.abs(Math.sin(b.psi)))*.45;if(Math.abs(ds)>LS||Math.abs(dd)>LD)return;
 const ox=LS-Math.abs(ds),oy=LD-Math.abs(dd);const va=a.v*Math.cos(a.psi),vb=b.v*Math.cos(b.psi),la=a.v*Math.sin(a.psi),lb=b.v*Math.sin(b.psi);
 if(ox<oy){const back=ds>0?a:b,front=ds>0?b:a,close=(ds>0?va-vb:vb-va);
  if(close>6.5){wipeout(back,'REAR-ENDED '+(front===a?'RIDER 1':'RIDER 2'));front.v+=close*.25;front.pv-=.3;return}
  const sg=Math.sign(ds||1);a.s-=sg*ox*.5;b.s+=sg*ox*.5;if(close>0){back.v-=close*.6;front.v+=close*.4}for(const p of P)pen(p,'BUMP');sfx.scrape()}
 else{const sg=Math.sign(dd||1),cl_=(la-lb)*sg;/* closing sideways speed */
  if(cl_>6){const hitter=Math.abs(la)>Math.abs(lb)?a:b;wipeout(hitter,'SIDESWIPED '+(hitter===a?'RIDER 2':'RIDER 1'));return}
  a.d_-=sg*oy*.5;b.d_+=sg*oy*.5;a.psi=wrapA(a.psi*.4-sg*.04);b.psi=wrapA(b.psi*.4+sg*.04);a.lv=(a.lv||0)-sg*1.2;b.lv=(b.lv||0)+sg*1.2;a.v*=.97;b.v*=.97;
  for(const p of P)if(p.scrape<=0){sfx.scrape();p.scrape=.35;spark(p,p===a?sg:-sg);if(p.chain>0){pen(p,'TRADED PAINT');p.comboT=Math.min(p.comboT,.8)}}}}
const vName=v=>({sedan:'CAR',hatch:'CAR',suv:'SUV',pickup:'PICKUP',van:'VAN',box:'TRUCK',semi:'SEMI',bus:'BUS'})[v.kind]||'CAR';
function hitVeh(v,p){v.hit=4.5;v.haz=1;v.sig=0;v.chg=null;v.spin=(Math.random()-.5)*.08}

/* ---------------- wipeouts ---------------- */
const pick=a=>a[(Math.random()*a.length)|0];/* round 14: vaguer crash lines */
function wipeout(p,why){if(p.wipe)return;p.why=why;p.liveSk=null;if(p.trk_)p.trk_=null;p.trOn=false;p.trQ=null;
 const m=p.m,R_=m.rider,vf=p.v,ps=p.psi;p.wipes++;
 endChain(p,false);
 /* the rider leaves the bike: move the rider group into the scene at the same place */
 m.g.updateMatrixWorld(true);const wpos=new THREE.Vector3(),wq=new THREE.Quaternion();R_.g.getWorldPosition(wpos);R_.g.getWorldQuaternion(wq);
 const rg=R_.g;m.inner.remove(rg);B.sc.add(rg);rg.position.copy(wpos);rg.quaternion.copy(wq);
 const pitchUp=p.pitch;
 p.wipe={t:0,why,rg,rs:p.s,rd:p.d_,rh:.9,rvs:vf*Math.cos(ps)*.92,rvd:vf*Math.sin(ps)+(Math.random()-.5)*2,rvh:2.5+Math.min(6,vf*.12)+(pitchUp<0?3:0),
  spin:new THREE.Vector3((Math.random()-.5)*6+(pitchUp<0?-7:pitchUp>0?5:0),(Math.random()-.5)*4,(Math.random()-.5)*6),
  bs:p.s,bd:p.d_,bv:Math.min(vf,24)/* the bike slides a few car lengths, not hundreds of metres */,bpsi:ps,bspin:(Math.random()-.5)*2.5,blean:p.lean,side:p.lean>=0?1:-1,bpitch:p.pitch};
 /* people riders go limp: a ragdoll that starts with the bike's speed plus the throw */
 {const y=m.g.rotation.y,vel=new THREE.Vector3(Math.sin(y),0,Math.cos(y)).multiplyScalar(Math.min(vf*.92,20));/* thrown, not launched: at most 20 m/s along the road */vel.y=p.wipe.rvh*.8;vel.x+=Math.cos(y)*p.wipe.rvd*.3;vel.z-=Math.sin(y)*p.wipe.rvd*.3;
  const otb=why==='OVER THE BARS'||why==='LOOPED OUT'&&false;if(otb){vel.y=Math.max(vel.y,4.5)}
  const rag=BK.ragStart&&BK.ragStart(m,vel,{flip:otb?Math.min(9,3+vf*.15):0,roll:vf>9});if(rag){p.wipe.rag=rag;rg.position.set(0,0,0);rg.quaternion.identity();p.wipe.p0=rag.P[0].clone()}}
 p.pitch=0;p.pv=0;sfx.crash();if(p.eng)p.eng.set(0,0,0,false);
 for(let i=0;i<10;i++)spark(p,(Math.random()-.5)*2);
 pop(p,'WIPEOUT','#ef6a5a',2.4,'w');pop(p,why,'#c9d2d8',2.2)}
const _wv=new THREE.Vector3(),_wq=new THREE.Quaternion(),_we=new THREE.Euler();
function wipeStep(p,dt){const w=p.wipe;w.t+=dt;
 if(w.rag){/* ragdoll: follow the pelvis in the road frame so the ground height and the verges are known */
  B.road.at(w.rs,_fr);const fx=Math.sin(_fr.h),fz=Math.cos(_fr.h);
  const gy=(x,z)=>{B.road.pos(w.rs,w.rd,_pp);return _pp.y};
  const p0=BK.ragStep(w.rag,dt,gy);/* a ragdoll that blew up (NaN, or flung far off) must never take the run down: drop it and respawn */
  if(!isFinite(p0.x+p0.y+p0.z)||Math.abs(p0.x-w.p0.x)+Math.abs(p0.z-w.p0.z)>5){w.rag=null;if(!w.fade){w.fade=1;fadeFlash(p,()=>respawn(p))}return}const dx=p0.x-w.p0.x,dz=p0.z-w.p0.z;w.rs+=dx*fx+dz*fz;w.rd+=-dx*Math.cos(_fr.h)+dz*Math.sin(_fr.h);w.p0.copy(p0);
  /* the median and the outer fence stop the body */
  const lim=w.rd<.6?.6-w.rd:w.rd>RD.SHO-.2?RD.SHO-.2-w.rd:0;if(lim){const ax=-Math.cos(_fr.h)*lim,az=Math.sin(_fr.h)*lim;for(const q of w.rag.P){q.x+=ax;q.z+=az}for(const q of w.rag.O){q.x+=ax*1.3;q.z+=az*1.3}w.rd+=lim;w.p0.copy(w.rag.P[0])}
  BK.ragPose(p.m,w.rag)}
 else{
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
  hands:[[.55+Math.sin(ft)*.2*fl,1.35+Math.cos(ft*1.3)*.3*fl,.15],[.55+Math.cos(ft*1.1)*.2*fl,1.3+Math.sin(ft*.9)*.3*fl,-.1]],feet:[[.2+Math.sin(ft*.8)*.15*fl,.15,.3*Math.cos(ft)*fl],[.22,.2+Math.cos(ft*.6)*.2*fl,-.25]]});}
 /* bike: falls on its side and slides, spinning, throwing sparks */
 w.bv=Math.max(0,w.bv-(w.bv>3?11:6)*dt);w.bpsi+=w.bspin*dt*(w.bv>.5?1:0);w.bs+=w.bv*Math.cos(w.bpsi)*dt;w.bd+=w.bv*Math.sin(w.bpsi)*dt;
 if(w.bd<.7){w.bd=.7;w.bpsi=-w.bpsi*.5}if(w.bd>RD.SHO-.3+0){w.bd=RD.SHO-.3;w.bpsi=-w.bpsi*.5}
 w.blean=lp(w.blean,w.side*1.32,cl(dt*3.2,0,1));w.bpitch=lp(w.bpitch,0,cl(dt*4,0,1));
 if(w.bv>4&&Math.random()<dt*30)spark(p,w.side,true);
 p.s=w.bs;p.d_=w.bd;p.psi=w.bpsi;p.v=0;p.lean=w.blean;p.lv=0;p.pitch=w.bpitch;
 if(w.t>3.4||(w.t>2&&w.bv<.5&&Math.hypot(w.rvs,w.rvd)<.4)){if(!w.fade){w.fade=1;fadeFlash(p,()=>respawn(p))}}}
function respawn(p){const w=p.wipe;if(!w)return;const rg=w.rg;B.sc.remove(rg);p.m.inner.add(rg);rg.position.set(0,0,0);rg.quaternion.identity();
 /* back on the right shoulder side of the lane it stopped in, upright, slowly rolling */
 const s=Math.max(w.bs,w.rs)+4;let lane=cl(laneOf(w.bd),0,3);for(const v of B.tr){if(v.side>0&&Math.abs(v.s-s)<14&&v.lane===lane&&v.hit<=0)v.s=s+16}
 p.s=s;p.d_=RD.laneD(lane);p.psi=0;p.v=8;p.lean=0;p.lv=0;p.tr=0;p.pitch=0;p.pv=0;p.wipe=null;p.ghost=2.2;p.st=0;p.stv=0;p.tu=0;p.trk_=null}
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
const _bb=new THREE.Box3(),_bb2=new THREE.Box3();
function placeBike(p,dt){const m=p.m,w=p.wipe;B.road.pos(p.s,p.d_,_pp);m.g.position.set(_pp.x,_pp.y,_pp.z);m.g.rotation.set(0,_pp.h-p.psi,0);
 m.g.rotation.x=0;const pitchRoad=-Math.atan(_pp.g)*Math.cos(p.psi);m.lean.rotation.x=pitchRoad;
 const rf=m.I.rf||.3,rr=m.I.rr||.3;const T=p.trk_;const rearSpin=T&&T.k==='burnout'?p.th*28:0;
 BK.poseBike(m,p.lean,p.pitch,w?0:p.stv,(w?0:p.v)*dt/rf,((w?0:p.v)+rearSpin)*dt/rr);
 m.sh.visible=!w||true;m.sh.position.y=.03;
 /* a bike on its side must not sink: lift it by however far its lowest point went under the road */
 if(w){m.g.updateMatrixWorld(true);_bb.makeEmpty();for(const q of m.meshes){if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();_bb2.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);_bb.union(_bb2)}
  const sink=_pp.y+.01-_bb.min.y;if(sink>0)m.g.position.y+=sink}
 /* ghost after a respawn: blink */
 m.g.visible=!(p.ghost>0&&Math.floor(p.ghost*10)%2===0)}

/* ---------------- cameras ---------------- */
const _h=new THREE.Vector3(),_f=new THREE.Vector3(),_t=new THREE.Vector3();
function camStep(p,cam,dt,aspect){const m=p.m;cam.aspect=aspect;if(BK._dbgCam&&(!p.wipe||BK._dbgAll)){BK._dbgCam(p,cam);cam.updateProjectionMatrix();return}
 if(p.wipe){/* follow the tumbling rider from behind and above */const w=p.wipe;if(w.rag)_t.copy(w.rag.P[0]);else w.rg.getWorldPosition(_t);const hd=_pp.h;B.road.at(w.rs,_fr);
  const want=_h.set(_t.x+Math.sin(_fr.h)*-7+Math.cos(_fr.h)*-2.5,_t.y+3.2,_t.z+Math.cos(_fr.h)*-7-Math.sin(_fr.h)*-2.5);
  if(!p.wc){p.wc=cam.position.clone()}p.wc.lerp(want,cl(dt*3,0,1));cam.position.copy(p.wc);cam.up.set(0,1,0);cam.lookAt(_t);cam.fov=60;cam.layers.enableAll();cam.updateProjectionMatrix();return}
 p.wc=null;
 if(p.cam===0){BK.headWorld(m,_h);
  const yaw=m.g.rotation.y;const fx=Math.sin(yaw),fz=Math.cos(yaw);
  cam.position.set(_h.x-fx*.06,_h.y+.05,_h.z-fz*.06);
  /* Nov 2 (round 4): one fixed view for every bike and both riders: the same downward pitch and field of view, so a dirt bike and a sport bike frame the road the same way */
  const sp=cl(p.v/60,0,1),FOV=78+24*Math.pow(sp,1.6),/* the view stretches hard with speed */want=-.4+Math.max(-.12,Math.min(.12,p.pitch||0))*.3;p.cpt=p.cpt==null?want:lp(p.cpt,want,cl(dt*3,0,1));
  p.croll=lp(p.croll||0,p.lean*.18,cl(dt*4,0,1));
  /* and shakes once you are flying */const sh=Math.max(0,sp-.45)*.016,t_=B.t;cam.rotation.order='YXZ';cam.rotation.set(p.cpt+sh*(Math.sin(t_*31)+.5*Math.sin(t_*47.3)),yaw+PI+sh*.6*Math.sin(t_*23.7),0);cam.rotateZ(p.croll+sh*.5*Math.sin(t_*19.1));
  cam.fov=FOV;cam.layers.set(0);cam.layers.enable(1+(1-p.k));cam.layers.enable(3+p.k)/* own arms and legs (people riders) */}
 else{/* Nov 2: chase cam that trails the bike's heading instead of being bolted to it: low, a little further back at speed, looking down the road */
  const yb=m.g.rotation.y;m.g.getWorldPosition(_t);if(p.cy==null||Math.abs(wrapA(yb-p.cy))>1.2)p.cy=yb;p.cy+=wrapA(yb-p.cy)*cl(dt*4.5,0,1);
  const sp=cl(p.v/60,0,1),back=5.2+1.3*sp,hgt=1.55+.25*sp+Math.max(0,p.pitch)*.5,fx=Math.sin(p.cy),fz=Math.cos(p.cy);
  const want=_h.set(_t.x-fx*back,_t.y+hgt,_t.z-fz*back);if(!p.cc)p.cc=want.clone();p.cc.lerp(want,cl(dt*9,0,1));cam.position.copy(p.cc);
  /* never sink into the road on crests */B.road.pos(p.s,p.d_,_pp);cam.position.y=Math.max(cam.position.y,_pp.y+1.1);
  cam.up.set(0,1,0);cam.lookAt(_t.x+fx*7,_t.y+1.05,_t.z+fz*7);cam.rotateZ(-p.lean*.06);
  cam.fov=58+12*sp;cam.layers.enableAll()}
 cam.updateProjectionMatrix()}
const _fr={},_g2=new THREE.Vector3();

/* ---------------- main loop ---------------- */
function step(dt){if(!B)return;const live=!B.paused;
 if(live){B.t+=dt;
  if(B.state==='count'){B.cd-=dt;const n=Math.ceil(B.cd-.6);if(n!==B.cdn){B.cdn=n;if(n>0){sfx.tone(880,880,.16,'sine',1)}else{sfx.tone(1760,1760,.5,'sine',1.1)}showCount(n>0?n:'GO!')}if(B.cd<=.6){B.state='ride';}}
  if(B.state==='ride'&&B.clock>0){B.left-=dt;if(B.left<=0){B.left=0;finish();return}}
  for(const p of B.pl){physStep(p,dt);if(!B)return;collide(p);scoreStep(p,dt)}collideRiders();
  trafficStep(dt);fxStep(dt);
  const sMin=Math.min(...B.pl.map(p=>p.s)),sMax=Math.max(...B.pl.map(p=>p.s));B.world.update(sMin,sMax);B.world.tick(dt,sMin,sMax);
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
#bkHud .bm{left:50%;bottom:26px;transform:translateX(-50%);width:min(320px,70%);height:12px;padding:5px;display:none}
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
#bkHud .bm{display:block!important;opacity:0;transition:opacity .25s}#bkHud .bm.on{opacity:1}
#bkHud .tg{transition:opacity .25s,translate .25s}#bkHud .tg.off{opacity:0;translate:-12px 0}
#bkPause{animation:bkPzB .2s ease-out;transition:opacity .16s}#bkPause.out{opacity:0}@keyframes bkPzB{0%{opacity:0}100%{opacity:1}}/* opacity only: the card is centred with a transform, so animating transform made it jump in from the corner */
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
/* score and combo on one plate: score with the best under it, the combo beside it lit only while a chain is running, its bar the time left to keep it */
#bkHud .cb{left:16px;top:12px;transform:scale(var(--s));transform-origin:left top;display:flex;align-items:stretch;padding:0;overflow:hidden}
#bkHud .cb small{display:block;font:600 9px var(--gt);letter-spacing:.24em;color:var(--gxd,#9aa3ab)}
#bkHud .cb .sc{padding:8px 16px 9px;min-width:118px}#bkHud .cb .sc b{display:block;font:300 28px var(--gt);font-variant-numeric:tabular-nums;line-height:1.1;letter-spacing:.01em}
#bkHud .cb .sc em{display:block;margin-top:2px;font:500 9px var(--gt);font-style:normal;letter-spacing:.18em;color:var(--gxd,#9aa3ab)}
@keyframes bkBump{0%{transform:scale(1.45)}100%{transform:none}}
/* skill chain, top centre: multiplier badge, chain total, the time left to keep it, and the moves in it (newest on top) */
#bkHud .sk{position:absolute;right:16px;top:12px;transform:scale(var(--s));transform-origin:right top;min-width:250px;/* round 13: off the middle of the screen, top right under the pause chip */transition:opacity .25s;opacity:0}
#bkHud .sk.live,#bkHud .sk.end{opacity:1}
#bkHud .sk .skh{display:flex;align-items:stretch;background:var(--gx);border-radius:8px 8px 0 0;box-shadow:var(--gxhi),0 0 0 1px #000c,0 4px 14px #0009;overflow:hidden}
#bkHud .sk .skm{min-width:62px;display:flex;align-items:center;justify-content:center;font:500 26px var(--gt);color:#fff;background:linear-gradient(180deg,#8fb4d8 0%,#4f7eab 48%,#33608c 52%,#4a77a3 100%);box-shadow:inset 0 1px 0 #ffffff80}
#bkHud .sk .skm.bump{animation:bkBump .35s ease-out}
#bkHud .sk .skt{flex:1;padding:7px 16px 8px;text-align:right}#bkHud .sk .skt small{display:block;font:600 9px var(--gt);letter-spacing:.24em;color:var(--gxd,#9aa3ab)}
#bkHud .sk .skt b{display:block;font:300 26px var(--gt);font-variant-numeric:tabular-nums;line-height:1.1;color:#fff}
#bkHud .sk .skb{display:block;height:3px;background:#0009;border-radius:0 0 3px 3px;overflow:hidden;box-shadow:0 0 0 1px #000c}#bkHud .sk .skb u{display:block;height:100%;width:0;background:linear-gradient(90deg,#8fb4d8,#fff);transition:width .2s linear}
#bkHud .sk ul{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
#bkHud .sk li{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 12px;border-radius:6px;background:var(--gx);box-shadow:var(--gxhi),0 0 0 1px #000c;font:500 11px var(--gt);letter-spacing:.14em;color:#c9d2d8;opacity:.8}
#bkHud .sk li b{font-weight:500;color:#fff;font-variant-numeric:tabular-nums}#bkHud .sk li em{font-style:normal;color:#8fb4d8;margin-left:4px}
#bkHud .sk li.new{opacity:1;color:#fff;animation:bkSk .3s ease-out}@keyframes bkSk{0%{transform:translateY(-6px) scale(1.04);opacity:0}100%{transform:none;opacity:1}}
#bkHud .sk li.neg b{color:#ef6a5a}#bkHud .sk li b.dur{display:grid}#bkHud .sk li b.dur i{grid-area:1/1;font-style:normal;text-align:right}
#bkHud .sk li b.dur i:first-child{animation:bkTmOut .5s .15s both}#bkHud .sk li b.dur i:last-child{color:#8fe08a;animation:bkTmIn .45s .45s both}
@keyframes bkTmOut{to{opacity:0;transform:translateY(-5px)}}@keyframes bkTmIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
#bkHud .sk li:not(.neg):not(.live) b{color:#8fe08a}#bkHud .sk li.live{opacity:1;color:#fff;box-shadow:var(--gxhi),0 0 0 1px #8fb4d8aa}#bkHud .sk li.live b{color:#bfe0ff}
#bkHud .sk li:nth-child(3){opacity:.55}#bkHud .sk li:nth-child(4){opacity:.35}
#bkHud .sk.end .skb,#bkHud .sk.end ul{display:none}#bkHud .sk.end .skh{border-radius:8px}
#bkHud .sk.end.ok .skt b{color:#bfe0a8}#bkHud .sk.end.no .skm{display:none}#bkHud .sk.end.no .skt{text-align:center}#bkHud .sk.end.no .skt b{color:#ef6a5a}
#bkHud .sk.end{animation:bkSkEnd 2s forwards}@keyframes bkSkEnd{0%{transform:scale(calc(var(--s) * 1.06))}12%{transform:scale(var(--s))}75%{opacity:1}100%{opacity:0;transform:scale(var(--s))}}
/* near miss: a cool flash along the edge the car went past */
#bkHud .nf{position:absolute;top:0;bottom:0;width:18%;opacity:0;pointer-events:none}#bkHud .nf.l{left:0;background:linear-gradient(90deg,#8fb4d866,#8fb4d800)}#bkHud .nf.r{right:0;background:linear-gradient(270deg,#8fb4d866,#8fb4d800)}
#bkHud .nf.on{animation:bkNf .5s ease-out}@keyframes bkNf{0%{opacity:1}100%{opacity:0}}
/* sense of speed: streaks rushing out from the middle of the view and a closing vignette, both from about 160 km/h */
#bkHud .sl{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#bkHud .vg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,transparent 52%,#000a 100%);opacity:0}
#bkHud .hint.pz{left:18px;right:auto;top:auto;bottom:58px}/* round 14: right above player 1's guide key */
/* round 14: time left at the top centre, score in its old spot top left, the chain top right, all on one top line */
#bkHud .h8top{left:50%;top:12px;transform:translateX(-50%) scale(var(--s));transform-origin:top center}
#bkHud .hint{left:18px;bottom:18px;padding:7px 12px;font-size:10px;letter-spacing:.16em;color:#c9d2d8;display:flex;gap:12px}
#bkHud .hint kbd{background:#ffffff22;border-radius:4px;padding:1px 6px;font:500 10px var(--gt);color:#fff;margin-right:5px}
body.bkOn #ptNowPlaying{display:none}
`;
const ICON={wheelie:'<path d="M4 18a3 3 0 106 0 3 3 0 00-6 0zM14 9l3-4 3 1M7 15l5-6h4l3 8"/>',stoppie:'<path d="M14 18a3 3 0 106 0 3 3 0 00-6 0zM5 7l4 2 7 9M9 9h5"/>',standup:'<path d="M12 3v6l-3 3M12 9l3 3M5 19a2 2 0 104 0 2 2 0 00-4 0zM15 19h4"/>',
 twelve:'<path d="M12 3v14M8 7l4-4 4 4M9 21h6"/>',nohands:'<path d="M5 5l4 5M19 5l-4 5M12 10v6M6 20a2 2 0 104 0M14 20a2 2 0 104 0"/>',superman:'<path d="M3 12h11l4-3M14 12l5 3M6 19a2 2 0 104 0"/>',seatstand:'<path d="M12 3v8M5 7h14M10 15h4M7 20a2 2 0 104 0M13 20a2 2 0 104 0"/>',burnout:'<path d="M5 18a3 3 0 106 0M14 18c2-1 2-3 4-3s2 2 3 1M15 11c1-2 3-2 4-4"/>'};
const icon=id=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(ICON[id]||'')+'</svg>';
function ensureCss(){if($i('bkCss'))return;const s=document.createElement('style');s.id='bkCss';/* the game's theme squares every corner (*{border-radius:0!important}): our rounded corners have to win over it */s.textContent=(CSS+PREP_CSS+SAME_CSS).replace(/border-radius:([^;}!]+)(?=[;}])/g,'border-radius:$1!important');document.head.appendChild(s);cloneCss([['#pause','#bkPause']])}
/* copy the game's own rules for an element onto ours, so the bike pause looks exactly like the car pause (and follows any later restyle) */
function cloneCss(map){const out=[];const walk=(rs,media)=>{for(const r of rs){if(r.media&&r.cssRules){walk(r.cssRules,r.media.mediaText);continue}const sel=r.selectorText;if(!sel||!map.some(([a])=>sel.includes(a)))continue;
  const parts=sel.split(',').filter(x=>map.some(([a])=>x.includes(a))).map(x=>{for(const[a,b]of map)x=x.split(a).join(b);return x});out.push((media?'@media '+media+'{':'')+parts.join(',')+'{'+r.style.cssText+'}'+(media?'}':''))}};
 for(const sh of document.styleSheets){let rs;try{rs=sh.cssRules}catch(e){continue}if(rs)walk(rs,null)}const st=document.createElement('style');st.id='bkCss2';st.textContent=out.join('\n');document.head.appendChild(st)}
/* Nov 2: the same look as the car HUD: plates in the glossy panel colours, pop-ups as the car's message plate, the car countdown */
const SAME_CSS=`
#bkHud .pl{background:var(--gx)!important;box-shadow:var(--gxhi),0 0 0 1px #000c,0 4px 14px #0009!important;border-radius:8px!important;-webkit-backdrop-filter:none;backdrop-filter:none}
#bkHud .hint kbd,#bkHud .tg kbd{background:#ffffff1f!important;color:#fff!important;border-radius:5px!important;box-shadow:inset 0 1px 0 #ffffff2e,0 0 0 1px #000a;font:600 10px var(--gt)!important;padding:2px 7px!important}
#bkHud .pp{top:34%!important;gap:8px}
#bkHud .pp div,#bkHud .pp div.t,#bkHud .pp div.w{padding:9px 22px;background:var(--gx)!important;border-radius:8px!important;box-shadow:var(--gxhi),0 0 0 1px #000c,0 6px 18px #000a!important;font:500 clamp(13px,2.4vh,20px) var(--gt)!important;letter-spacing:.14em!important;text-shadow:none!important;-webkit-backdrop-filter:none;backdrop-filter:none}
#bkHud .pp div.w{font-size:clamp(18px,3.4vh,28px)!important}
#bkHud .cd{top:30%!important;font:200 clamp(80px,22vh,180px) var(--gt)!important;color:#fff!important;text-shadow:0 4px 30px #000a!important;letter-spacing:.02em}
#bkHud .tg{position:absolute;left:16px;top:50%;transform:translateY(-50%) scale(var(--s,1));transform-origin:left center;min-width:200px;padding:8px;background:var(--gx);border-radius:8px;box-shadow:var(--gxhi),0 0 0 1px #000c,0 4px 14px #0009;font-family:var(--gt);-webkit-font-smoothing:antialiased}
#bkHud .tg h6{margin:2px 8px 6px;font:600 9px var(--gt);letter-spacing:.24em;color:var(--gxd,#9aa3ab);text-transform:uppercase}
#bkHud .tg ul{list-style:none;margin:0;padding:0}
#bkHud .tg p{margin:6px 8px 2px;font:500 9px var(--gt);letter-spacing:.14em;color:var(--gxd,#9aa3ab);text-transform:uppercase}
#bkHud .tg li{display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:6px;font:400 13px var(--gt);color:#e9ecef}
#bkHud .tg li kbd{min-width:14px;text-align:center}
#bkHud .tg li em{margin-left:auto;font:500 9px var(--gt);font-style:normal;letter-spacing:.12em;color:#9aa3ab;text-transform:uppercase}
#bkHud .tg li.off{opacity:.45}
#bkHud .tg li.on{opacity:1;color:#fff;background:linear-gradient(180deg,#8fb4d8 0%,#4f7eab 48%,#33608c 52%,#4a77a3 100%);box-shadow:inset 0 1px 0 #ffffffa0,0 0 12px #4f7eab90}
#bkHud .tg li.on em{color:#fff}
#bkHud .pv.two .tg{min-width:160px}#bkHud .pv.two .tg li{font-size:11px;padding:3px 6px}
#bkPause{position:fixed;inset:0;z-index:60;align-items:center;justify-content:center}
`;
function buildHud(){ensureCss();let h=$i('bkHud');if(!h){h=document.createElement('div');h.id='bkHud';document.body.appendChild(h)}h.style.display='block';const n=B.pl.length;
 h.innerHTML=B.pl.map((p,i)=>`<div class="pv hud${n>1?' two':''}" data-p="${i}" style="left:${n>1?i*50:0}%;width:${n>1?50:100}%;--pc:${PCOL[i]};--s:${Math.max(.46,Math.min(1.15,innerWidth/n/860,innerHeight/580)).toFixed(3)}">
 <div class="h8top"><div class="h8plate">${n>1?'<div class="tag" style="color:'+PCOL[i]+'">P'+(i+1)+'</div>':''}<div class="lap">HIGHWAY CUT-UP</div><div class="raceTime">${B.clock?'':'FREE RIDE'}</div><div class="bl" style="display:none"></div></div></div>
 <div class="pl cb"><div class="sc"><small>SCORE</small><b>0</b><em>BEST ${fmtN(SV().best||0)}</em></div></div>
 <div class="sk"><div class="skh"><div class="skm">x1</div><div class="skt"><small>SKILL CHAIN</small><b>0</b></div></div><i class="skb"><u></u></i><ul></ul></div>
 <canvas class="sl"></canvas><div class="vg"></div><div class="nf l"></div><div class="nf r"></div>
 <div class="h8spd"><canvas class="gx5" width="480" height="320"></canvas></div>
 <div class="pl hint"><span><kbd>${KEYS[i].mn}</kbd>GUIDE</span></div>
 <div class="pl bm"><i></i><u></u></div>
 <div class="tg"><h6>Tricks</h6><ul>${TRICKS.map((t,j)=>`<li data-t="${t.id}"><kbd>${KEYS[i].tkn[j]}</kbd><span>${t.n}</span><em>${t.k==='burnout'?'stopped':Math.round(spd(t.min))+'+'}</em></li>`).join('')}</ul><p>Pop wheelies with the key, balance on the gas</p></div>
 ${i===0?`<div class="pl hint pz"><span><kbd>TAB</kbd>PAUSE</span></div>`:''}
 <div class="pp"></div><div class="bkfade"></div></div>`).join('')+`<div class="cd"></div>`;
 B.pl.forEach(p=>guidePaint(p))}
const hudOf=p=>$i('bkHud')&&$i('bkHud').querySelector('.pv[data-p="'+p.k+'"]');
function pop(p,txt,col,d,cls){const h=hudOf(p);if(!h)return;const pp=h.querySelector('.pp');const e=document.createElement('div');e.textContent=txt;e.style.color=col||'#fff';e.style.setProperty('--d',(d||1.2)+'s');if(cls)e.className=cls;pp.appendChild(e);
 while(pp.children.length>4)pp.firstChild.remove();setTimeout(()=>e.remove(),(d||1.2)*1000+50)}
function showCount(n){const c=$i('bkHud')&&$i('bkHud').querySelector('.cd');if(!c)return;c.textContent=n;c.classList.remove('on');void c.offsetWidth;c.classList.add('on')}
function hudStep(){if(!B)return;const h=$i('bkHud');if(!h)return;
 for(const p of B.pl){const e=hudOf(p);if(!e)continue;const q=s=>e.querySelector(s);
  /* the same HUD pieces as the car modes: time plate, score / combo strip, GT-style gauge */
  {const sc=fmtN(Math.round(p.score)),b=q('.cb .sc b');if(b._t!==sc){b._t=sc;b.textContent=sc}}
  {/* skill chain: live while a chain runs, then BANKED / CHAIN LOST for a moment */const k=q('.sk'),end=p.skEnd&&B.t-p.skEnd.t<2?p.skEnd:null,st=p.chain>0||p.liveSk?'live':end?(end.ok?'end ok':'end no'):'off';
   if(k._s!==st){k._s=st;k.className='sk '+st}
   if(st==='live'){const m='x'+p.mult,mm=k.querySelector('.skm');if(mm._t!==m){mm._t=m;mm.textContent=m;mm.classList.remove('bump');void mm.offsetWidth;mm.classList.add('bump')}
    const tt=fmtN(Math.round(p.chainPts)),tb=k.querySelector('.skt b');if(tb._t!==tt){tb._t=tt;tb.textContent=tt}k.querySelector('.skt small').textContent='SKILL CHAIN';
    const w=Math.round(cl(p.comboT/CHAIN_T,0,1)*100),u=k.querySelector('.skb u');if(u._w!==w){u._w=w;u.style.width=w+'%'}
    {const lv=p.liveSk,vk=p.skV+'|'+(lv?Math.floor(p.tt*10):'');if(k._v!==vk){k._v=vk;const top=p.sk[0]&&p.sk[0].id,sg=v=>(v<0?'\u2212':'+')+fmtN(Math.abs(Math.round(v)));
     k.querySelector('ul').innerHTML=(lv?`<li class="live"><span>${lv.n}</span><b>${p.tt.toFixed(1)}s</b></li>`:'')+p.sk.slice(0,lv?3:4).map(e=>`<li class="${e.id===top&&!lv?'new':''}${e.pts<0?' neg':''}"><span>${e.n}${e.c>1?` <em>x${e.c}</em>`:''}</span>${e.dur&&e.id===top&&!lv?`<b class="dur"><i>${e.dur.toFixed(1)}s</i><i>${sg(e.pts)}</i></b>`:`<b>${sg(e.pts)}</b>`}</li>`).join('')}}}
   else if(end&&k._e!==end){k._e=end;const mm=k.querySelector('.skm');mm._t=null;mm.textContent=end.ok?'x'+end.m:'';k.querySelector('.skt small').textContent=end.ok?'CHAIN BANKED':'CHAIN LOST';k.querySelector('.skt b').textContent=(end.ok?'+':'')+fmtN(end.pts);k.querySelector('ul').innerHTML='';k._v=-1}}
  if(B.clock){const l=Math.max(0,B.left),tt=Math.floor(l/60)+':'+String(Math.floor(l%60)).padStart(2,'0'),rt=q('.raceTime');if(rt._t!==tt){rt._t=tt;rt.textContent=tt}rt.style.color=l<15?'#ff6b5e':''}
  {const cv=q('.gx5'),v=Math.round(spd(p.wipe?0:p.v)),rv=cl(p.rpm||0,0,1.04),up=!p.wipe&&rv>.9,key=v+'|'+p.gear+'|'+Math.round(rv*200)+'|'+up;
   if(cv._k!==key){cv._k=key;P.gx5Draw(cv,{rev:rv,kmh:v,gear:p.gear,shift:up,unit:kmh()?'km/h':'mph',tag:B.pl.length>1?'P'+(p.k+1):'',tagCol:PCOL[p.k]})}}
  speedFx(p,q('.sl'),q('.vg'));
  if(!p.gT||B.t-p.gT>.2){p.gT=B.t;guidePaint(p)}
  const bm=q('.bm'),T=p.trk_;
  /* the meter fades in and out (never pops) */if(T&&(T.k==='balance')){bm.className='pl bm on';bm.querySelector('u').style.left=(50+cl(p.bal,-1,1)*50)+'%';bm.querySelector('u').style.bottom=''}
  else if(T&&(T.k==='wheelie'||T.k==='stoppie')||p.pitch>.05||p.pitch<-.05){bm.className='pl bm v on';const u=bm.querySelector('u');u.style.left='';const lim=p.pitch<0?1.15:(T&&T.twelve?1.62:1.45);u.style.bottom=(cl(Math.abs(p.pitch)/lim,0,1)*100)+'%'}
  else bm.classList.remove('on');
}
}
function speedFx(p,cv,vg){const f=p.wipe?0:seg(p.v,42,68);p.sfx_=lp(p.sfx_||0,f,.1);const a=p.sfx_;vg.style.opacity=(a*.85).toFixed(3);
 if(!cv)return;const w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}const g=cv.getContext('2d');g.clearRect(0,0,w,h);if(a<.02)return;
 /* each streak lives on a fixed ray from the centre and slides outward, faster with speed */const cx=w/2,cy=h*.46,R0=Math.hypot(w,h)*.5,n=70,t_=B.t*(1.4+a*1.6);
 g.lineCap='round';for(let i=0;i<n;i++){const ang=i*2.39996,ph=(t_+i*.37)%1,r0=R0*(.28+ph*.9),len=R0*(.08+.22*a)*(.5+ph),c=Math.cos(ang),s_=Math.sin(ang);
  g.strokeStyle='rgba(235,242,250,'+(a*.7*ph*(1-ph)*4).toFixed(3)+')';g.lineWidth=1.2+ph*3;g.beginPath();g.moveTo(cx+c*r0,cy+s_*r0);g.lineTo(cx+c*(r0+len),cy+s_*(r0+len));g.stroke()}}
function guidePaint(p){const e=hudOf(p);if(!e)return;const g=e.querySelector('.tg');if(!g)return;g.classList.toggle('off',p.guide===false);
 g.querySelectorAll('li').forEach(x=>{const t=TBY[x.dataset.t];x.classList.toggle('on',!!(p.trk_&&p.trk_.id===t.id));x.classList.toggle('off',!canStart(p,t))})}
function runKey(code){if(B.paused){pauseKey(code);return}
 for(const p of B.pl){const k=p.k;
  if(isKey(k,'m',code)){p.guide=p.guide===false;/* starts shown (undefined), so the first press hides it */guidePaint(p);continue}
}}

/* ---------------- pause ---------------- */
function onEsc(){if(scr==='bike'&&B){if(B.state==='done')return;setPause(!B.paused)}else if(scr==='bikeprep'){leavePrep()}else if(scr==='bikeres'){resAct('menu')}}
function setPause(on){if(!B)return;B.paused=on;let e=$i('bkPause');if(!e){e=document.createElement('div');e.id='bkPause';e.className='s';document.body.appendChild(e)}
 if(on){for(const p of B.pl)if(p.eng)p.eng.set(0,0,0,false);e.innerHTML=`<div class="mid w"><div class="tb">Paused</div><div class="b"><button data-a="res">Resume</button><button data-a="rst">Restart</button><button data-a="prep">Change bikes</button><button data-a="quit">Quit to menu</button></div></div>`;
  e.classList.remove('out');clearTimeout(e._h);e.style.display='flex';e.querySelectorAll('button').forEach((b,i)=>{b.onmouseenter=()=>{B&&(B.psel=i);paintPause()};b.onclick=()=>pauseAct(b.dataset.a)});B.psel=0;paintPause();sfx.ui('select')}else{/* fade out, then hide */e.classList.add('out');clearTimeout(e._h);e._h=setTimeout(()=>{e.style.display='none';e.classList.remove('out')},170)}}
function paintPause(){const e=$i('bkPause');if(!e||!B)return;const bs=e.querySelectorAll('button');if(bs[B.psel])bs[B.psel].focus()}
function pauseKey(code){const n=4;if(code==='KeyW'||code==='ArrowUp'){B.psel=(B.psel+n-1)%n;paintPause();sfx.ui('move')}else if(code==='KeyS'||code==='ArrowDown'){B.psel=(B.psel+1)%n;paintPause();sfx.ui('move')}
 else if(code==='Enter'||code==='Space'){pauseAct(['res','rst','prep','quit'][B.psel])}}
function pauseAct(a){sfx.ui('select');if(a==='res'){setPause(false);return}const o=B.o;$i('bkPause').style.display='none';
 if(a==='rst'){startRun(o)}else if(a==='prep'){endRun();openPrep(2)}else{endRun();goMenu()}}
function goMenu(){show('menu');try{P.menuStats&&P.menuStats()}catch(e){}try{P.menuBg&&P.menuBg()}catch(e){}}

/* ---------------- results ---------------- */
function showResults(res,cr,nb){if(!B)return;const o=B.o,n=res.length,order=res.slice().sort((x,y)=>y.score-x.score);
 const rows=order.map((r,i)=>({place:i+1,human:true,name:n>1?'Rider '+(r.k+1):(P.SV().name||'You'),car:r.bike,score:r.score,stats:[['Best combo','x'+Math.max(1,r.best)],['Near misses',r.near],['Tricks',r.tricks],['Wipeouts',r.wipes],['Distance',(kmh()?(r.dist/1000).toFixed(1)+' km':(r.dist/1609).toFixed(1)+' mi')]]}));
 const R_={mode:'cutup',title:n>1?'RIDER '+(order[0].k+1)+' WINS':'RUN COMPLETE',sub:'HIGHWAY CUT-UP'+(nb?' &middot; NEW BEST':''),notes:[],rows,pay:[{l:'SCORE BONUS',v:cr}],total:cr,balance:P.SV().cr,cfg:null};
 endRun(true);P.renderResults(R_);
 const bind=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=()=>{sfx.ui('select');f()}};
 const cont=()=>{openPrep(2)};bind('rcCont',cont);bind('rcRetry',()=>startRun(o));bind('rcMenu',goMenu);{const b=document.getElementById('rcBrand');if(b)b.style.display='none'}
 const c=document.getElementById('rcCont');if(c)c.querySelector('span').textContent='Change bikes';
 P.resHook=cont;sfx.ui('whoosh')}
let RS=0;function paintRes(){const e=$i('bkRes');if(e)e.querySelectorAll('.bkrb button').forEach((b,i)=>b.classList.toggle('on',i===RS))}
function resKey(code){if(code==='KeyA'||code==='ArrowLeft'){RS=(RS+2)%3;paintRes();sfx.ui('move')}else if(code==='KeyD'||code==='ArrowRight'){RS=(RS+1)%3;paintRes();sfx.ui('move')}else if(code==='Enter'||code==='Space')resAct(['again','prep','menu'][RS])}
function resAct(a){sfx.ui('select');const e=$i('bkRes');if(e)e.style.display='none';const o=B?B.o:null;if(a==='again'&&o){startRun(o);return}endRun();if(a==='prep')openPrep(2);else goMenu()}

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
/* Nov 2: the setup is the game's own flat setup screen (ui.js gxRender), not a 3D scene: a still picture of the chosen bike and rider,
   the options in the same blue cards as every other mode */
function openPrep(step){ensureCss();PR=prepState();PR.sel=0;PR.step=step||1;PR.seed=((Math.random()*1e6)|0)+1;/* the ride previewed on the map is the ride you get *//* 'Change bikes' lands straight on part two */const ST=P.ui.ST;
 const reset=()=>{const g=$i('suGo');if(g)g.innerHTML='<span>Start</span>'};ST.custom={render:bikeRender,go:()=>{if((PR.step||1)===1){sfx.ui('select');PR.step=2;bikeRender();return}prepGo()},back:()=>{if(PR&&PR.step===2){sfx.ui('back');PR.step=1;ST.custom=cst;bikeRender();return}sfx.ui('back');reset();PR=null;goMenu()},leave:reset};const cst=ST.custom;
 show('s8setup');const t=$i('suTitle');if(t)t.innerHTML='HIGHWAY <em>CUT-UP</em>';const g=$i('suGo');if(g)g.innerHTML='<span>Ride</span>';bikeRender()}
const shotCache={};
/* the studio picture: one bike, or both riders' bikes side by side (P.objShot in ui.js renders and caches it) */
function bikeShot(cv,list,only){if(!cv)return;list=Array.isArray(list)?list:[list];const key='bk|'+list.map(s=>s.id+'.'+s.paint+'.'+s.who).join('|')+(only!=null?'|only'+only:'')+'|st',ms=[];
 P.objShot(cv,key,()=>{const g=new THREE.Group();list.forEach((s,i)=>{if(only!=null&&i!==only)return;const d=BK.byId(s.id),m=BK.makeBike(s.id,BK.paintOf(d,s.paint),Object.assign({},RIDER_COL[i]||RIDER_COL[0],{who:s.who}));ms.push(m);
  const fake={m,d,trk_:null,lean:0,k:0};BK.poseBike(m,0,0,.18,0,0);const bp=basePose(fake),I=m.I,ppl=m.rider&&m.rider.people;
  /* round 15 (Hakan): player 1 stands beside the bike (on the camera side, one hand resting on the seat), any other rider sits on theirs */
  if(ppl&&i===0){const T=m.rider.T,hy=(T.len.th+T.len.sh)*.98,S=I.seat;BK.poseRider(m,{flat:1,hip:[-.62,hy,S[2]+.1],lean:0,side:0,look:-.05,turn:-.45,feet:[[-.5,0,S[2]+.02],[.76,0,S[2]+.16]],hands:[[-.2,S[1]+.06,S[2]+.3],[.86,hy-.02,S[2]+.12]]})}
  else{if(ppl)bp.feet[0]=[I.peg[0]+.2,-.02,I.peg[2]+.18];BK.poseRider(m,Object.assign(bp,{look:-.05,turn:.35,side:ppl?-.06:0}))}
  m.g.position.set(list.length>1?(i?.75:-.75):0,0,list.length>1?(i?.9:-.9):0);g.add(m.g)});return g},{yaw:2.1,reg:[-.16,.97,-.95,.93],/* round 16: fill more of the picture */fy:list.length>1?1.25:1.1,fx:list.length>1?.8:.62,clear:true,
  /* round 13: the camera frames a fixed bike-sized box in each slot (2.2 m long, 1.5 m tall), so a small scooter is not blown up to a big bike's size */
  ref:(bx,yaw)=>{const b=new THREE.Box3(),v=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0),n=list.length;for(let i=0;i<n;i++){const px=n>1?(i?.75:-.75):0,pz=n>1?(i?.9:-.9):0;for(const sx of[i===0?-.95:-.4,.4])for(const sz of[-.95,.95])for(const sy of[0,1.86]){v.set(px+sx,sy,pz+sz).applyAxisAngle(ax,yaw);b.expandByPoint(v)}}b.min.y=bx.min.y;b.max.y=bx.min.y+1.86;return b}/* round 16: tall enough for the standing rider, with headroom */,dispose:()=>{for(const m of ms)BK.disposeBike(m)}})}
const STATN=[['Top speed',d=>d.stats.top/300,d=>Math.round(kmh()?d.stats.top:d.stats.top/1.609)+(kmh()?' km/h':' mph')],['Acceleration',d=>d.stats.acc,d=>Math.round(d.stats.acc*100)],['Handling',d=>d.stats.hnd,d=>Math.round(d.stats.hnd*100)],['Tricks',d=>d.stats.trk,d=>Math.round(d.stats.trk*100)]];
const PAINTN=['Stock','Second','Red','Orange','Yellow','Green','Blue','Purple','White','Black'];
const OPTS={clock:[[120,'2 min'],[180,'3 min'],[300,'5 min'],[0,'Endless']],traffic:[['light','Light'],['normal','Normal'],['heavy','Heavy']],tod:[['day','Day'],['dusk','Sunset'],['night','Night']]};
const rgb=c=>'rgb('+c.map(x=>Math.round(x*255)).join(',')+')';
/* part one's picture: the route ahead, drawn from the same road the run will use: the first 6 km with the exits and the start */
function rideMap(cv){if(!cv||!PR)return;const dpr=Math.min(2,devicePixelRatio||1),cw=Math.max(320,Math.round((cv.clientWidth||960)*dpr)),ch=Math.max(180,Math.round((cv.clientHeight||300)*dpr));if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}
 const g=cv.getContext('2d'),road=BK.makeRoad(PR.seed),L=6000,pts=[],f={};for(let s_=0;s_<=L;s_+=20){road.at(s_,f);pts.push([f.x,f.z])}
 /* rotate so the run heads left to right, then fit into the right part of the picture */
 const a=Math.atan2(pts[pts.length-1][0]-pts[0][0],pts[pts.length-1][1]-pts[0][1]),ca=Math.cos(a),sa=Math.sin(a);const q=pts.map(([x,z])=>[z*ca+x*sa,x*ca-z*sa]);
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of q){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const rx0=cw*.36,rx1=cw*.95,ry0=ch*.18,ry1=ch*.82,k=Math.min((rx1-rx0)/(x1-x0||1),(ry1-ry0)/Math.max(400,y1-y0)),ky=Math.max(k,Math.min(k*5,(ry1-ry0)*.8/Math.max(1,y1-y0))),ox=(rx0+rx1)/2-(x0+x1)/2*k,oy=(ry0+ry1)/2-(y0+y1)/2*ky,P_=([x,y])=>[ox+x*k,oy+y*ky];/* bends drawn up to 5x deeper so a gentle highway still reads as a route */
 const bg=g.createRadialGradient(cw*.66,ch*.55,10,cw*.66,ch*.55,cw*.7);bg.addColorStop(0,'#24405e');bg.addColorStop(.55,'#121b26');bg.addColorStop(1,'#07090c');g.fillStyle=bg;g.fillRect(0,0,cw,ch);
 g.strokeStyle='#ffffff08';g.lineWidth=1;for(let x=0;x<cw;x+=40*dpr){g.beginPath();g.moveTo(x,0);g.lineTo(x,ch);g.stroke()}for(let y=0;y<ch;y+=40*dpr){g.beginPath();g.moveTo(0,y);g.lineTo(cw,y);g.stroke()}
 const line=(w,c)=>{g.beginPath();q.forEach((p,i)=>{const [x,y]=P_(p);i?g.lineTo(x,y):g.moveTo(x,y)});g.lineWidth=w;g.strokeStyle=c;g.lineJoin='round';g.lineCap='round';g.stroke()};
 line(16*dpr,'#5aa0ff22');line(7*dpr,'#0b0f14');line(3.2*dpr,'#cfe3ff');
 g.font=`700 ${10*dpr}px system-ui,sans-serif`;g.textAlign='center';
 for(let s_=1000;s_<L;s_+=1000){const [x,y]=P_(q[Math.round(s_/20)]);g.fillStyle='#ffffff55';g.fillRect(x-1*dpr,y-7*dpr,2*dpr,14*dpr);g.fillText((s_/1000)+' km',x,y+20*dpr)}
 for(let kk=1;kk<4;kk++){const e=road.exitNear(1400+kk*3100);if(e<0||e>=L)continue;const [x,y]=P_(q[Math.round(e/20)]);g.fillStyle='#7fd68a';g.beginPath();g.arc(x,y,5*dpr,0,7);g.fill();g.fillStyle='#7fd68acc';g.fillText('EXIT',x,y-12*dpr)}
 const [sx,sy]=P_(q[0]);g.fillStyle='#ffd36a';g.beginPath();g.arc(sx,sy,7*dpr,0,7);g.fill();g.fillStyle='#ffd36a';g.fillText('START',sx,sy-14*dpr);
 const [ex,ey]=P_(q[q.length-1]);g.fillStyle='#cfe3ff88';g.fillText('and on…',ex,ey-14*dpr)}
function bikeRender(){if(!PR)return;const two=PR.p[1].in,L=BK.list(),rows=[];
 const re=()=>{sfx.ui('move');bikeRender()};
 /* round 13 (Hakan): no rider count on the ride step. The bikes step is the 2 x 2 player grid: Add player brings rider 2 in, the x takes them out (two riders at most: split screen) */
 const addRider=()=>{if(PR.p[1].in)return;PR.p[1].in=true;PR.focus=1;PR.newP=1;sfx.ui('select');bikeRender();PR.newP=null},dropRider=()=>{PR.p[1].in=false;PR.focus=0;sfx.ui('back');bikeRender()};const step=PR.step||1;P.gxSteps&&P.gxSteps(step,'The ride','Bikes');
 if(step===2)for(let i=0;i<2;i++){const s=PR.p[i];if(i===1&&!two)continue;const d=BK.byId(s.id),grp=i?1:0,dot=two?PCOL[i]:null;
  if(BK.PEOPLE&&window.PEOPLE_B64)rows.push({grp,dot,l:'Rider',v:BK.PEOPLE[s.who%BK.PEOPLE.length].n,opts:BK.PEOPLE.length,go:k=>{s.who=(s.who+k+BK.PEOPLE.length)%BK.PEOPLE.length;PR.focus=i;re()}});
  rows.push({grp,dot,l:'Bike',v:d.name,opts:L.length,go:k=>{let j=L.findIndex(b=>b.id===s.id);s.id=L[(j+k+L.length)%L.length].id;PR.focus=i;re()}});
  rows.push({grp,dot,l:'Paint',v:PAINTN[s.paint]||'Paint',sw:rgb(BK.paintOf(d,s.paint)),opts:BK.PAINTS.length,go:k=>{s.paint=(s.paint+k+BK.PAINTS.length)%BK.PAINTS.length;PR.focus=i;re()}});
  rows.push({grp,l:'Keys',v:i?'Arrows &middot; tricks U I O P H J':'W A S D &middot; tricks E R F C Z X',opts:1})}
 /* round 16: like the car screen, Add player is the next empty frame (dashed tile), not a button under the name */
 if(step===2&&!two)rows.push({grp:1,add:1,pn:2,hint:'Arrow keys, tricks on U I O P H J',act:addRider});
 rows.forEach((r,j)=>{if(r.grp!=null&&step===2&&!r.add)r.pl=r.grp});
 if(step===1)for(const[k,l]of[['clock','Clock'],['traffic','Traffic'],['tod','Time of day']]){const Lo=OPTS[k],j=Math.max(0,Lo.findIndex(z=>String(z[0])===String(PR.opt[k])));
  rows.push({grp:/^(Traffic|Time of day)$/.test(l)?1:0,l,v:Lo[j][1],opts:Lo.length,go:dd=>{const n=(j+dd+Lo.length)%Lo.length;/* round 15: arrows wrap round */if(n!==j){PR.opt[k]=k==='clock'?+Lo[n][0]:Lo[n][0];re()}}})}
 const fi=PR.focus&&two?1:0,s=PR.p[fi],d=BK.byId(s.id),k=L.findIndex(b=>b.id===s.id);
 const side=`<div class="gxSide"><h6>${esc(d.kind)} &middot; ${k+1} of ${L.length}</h6><div class="st">${STATN.map(([n,f,v])=>`<span>${n}</span><u><i style="width:${Math.round(cl(f(d),0,1)*100)}%"></i></u><em>${v(d)}</em>`).join('')}</div></div>`;
 const lineup=two?[PR.p[0],PR.p[1]]:[PR.p[0]];
 if(step===1)P.gxRender({kind:'Best score '+fmtN(SV().best||0),name:'Highway Cut-Up',facts:['Endless highway','Plains','Up to two riders, split screen'],rows,groups:['The ride','Conditions',''],shot:cv=>rideMap(cv),go:'Next: bikes'});
 else P.gxRender({kind:(two?'Player '+(fi+1)+' &middot; ':'')+esc(d.kind),name:esc(d.name),facts:[esc(d.kind),'Tricks on '+KEYS[fi].tkn.slice(0,TRICKS.length).join(' ')],side:'',rows,groups:['Player 1','Player 2'],grid:true,cols:PCOL,heroCls:'cars'+(PR.newP!=null?' fin':''),newP:PR.newP,rm:(p,go)=>{if(go){dropRider();return}return p===1&&two},
  onAdd:addRider,shot:cv=>{bikeShot(cv,lineup);/* round 15: the bike being edited glows for a moment, like the car screen */if(two&&P.gxHiPulse){const hc=document.createElement('canvas');hc.id='gxHi';hc.style.setProperty('--pc',PCOL[fi]);cv.after(hc);bikeShot(hc,lineup,fi);P.gxHiPulse()}},go:'Ride'});
 const g=$i('suGo');if(g)g.innerHTML='<span>'+(step===1?'Next: bikes &rsaquo;':'Ride')+'</span>'}
function stopPrep(){if(!PR)return;const e=$i('bkPrep');if(e)e.style.display='none';if(PR.sc){for(const m of PR.bikes)if(m)BK.disposeBike(m);PR.world.dispose();PR.sky.dispose();R.toneMappingExposure=PR.exp0}PR=null}
function leavePrep(){sfx.ui('back');stopPrep();document.body.classList.remove('bkOn');goMenu()}
function prepGo(){if(!PR)return;const sv=SV();PR.p.forEach((s,i)=>{sv.sel[i]={id:s.id,paint:s.paint,trick:s.trick,who:s.who}});sv.opt=Object.assign({},PR.opt);try{P.save()}catch(e){}
 const o={players:PR.p.filter(x=>x.in).map(x=>({id:x.id,paint:x.paint,trick:x.trick,who:x.who})),clock:PR.opt.clock,traffic:PR.opt.traffic,tod:PR.opt.tod,seed:PR.seed};
 if(!o.players.length)return;try{P.sfx&&P.sfx('start')}catch(e){}
 const f=$i('fade');if(f){f.style.transition='opacity .35s';f.style.opacity=1;setTimeout(()=>{startRun(o);f.style.opacity=0},380)}else startRun(o)}
/* pads in the prep screen */
let padPrev=[{},{}];setInterval(()=>{if(scr!=='bike'||!B)return;const p=padIn(0);if(p&&p.st0&&!padPrev.s){setPause(!B.paused)}padPrev.s=p&&p.st0},80);

/* ---------------- frame hook ---------------- */
const f0=frame;frame=function(n){if(scr==='bike'||(scr==='bikeres'&&B)){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
  if(R.domElement.style.visibility==='hidden')R.domElement.style.visibility='';
  try{if(B){if(scr==='bikeres'){render(dt)}else step(dt)}}catch(e){if(!frame.err){frame.err=1;console.error('bike mode',e)}}return}
 return f0(n)};
/* leaving through some other path (menu shortcut, options): tidy up */
{const sh0=show;show=n=>{sh0(n);if(n!=='bike'&&n!=='bikeres'&&n!=='pause'&&n!=='ptOptions'&&B&&n!=='bikeprep'){endRun()}if(n!=='s8setup'&&PR&&n!=='bike'&&n!=='ptOptions'){stopPrep()}if(n!=='bike'&&n!=='bikeprep'&&n!=='bikeres')document.body.classList.remove('bkOn');
  for(const id of['bkHud'])if($i(id)&&n!=='bike'&&n!=='bikeres')$i(id).style.display='none';if(n!=='bikeres'&&$i('bkRes'))$i('bkRes').style.display='none'}}
BK._steerView=(id,steer,who)=>{const d=BK.byId(id),m=BK.makeBike(id,BK.paintOf(d,0),Object.assign({},RIDER_COL[0],{who:who||0}));const fake={m,d,trk_:null,lean:0,k:0};BK.poseBike(m,0,0,steer,0,0);BK.poseRider(m,basePose(fake));m.g.userData.m=m;return m.g};
BK._handProbe=(ids,whos)=>{const out=[];const L=ids||BK.list().map(b=>b.id),W=whos||[...Array((BK.PEOPLE||[0]).length).keys()];
 const poses=[['ride',null,0,0,0],['leanL',null,.75,0,.25],['leanR',null,-.75,0,-.25],['steerL',null,0,0,.5],['wheelie','wheelie',0,.7,0],['deep','wheelie',0,1.2,0],['stoppie','stoppie',0,-.35,0],['standup','standup',0,.5,0],['twelve','twelve',0,1.3,0],['burnout','burnout',0,0,0]];
 for(const id of L)for(const who of W){const d=BK.byId(id),m=BK.makeBike(id,BK.paintOf(d,0),Object.assign({},RIDER_COL[0],{who}));if(!m.rider||!m.rider.people||!m.rider.T){out.push([id,who,"nopeople"]);BK.disposeBike(m);continue}const R=m.rider,T=R.T,ix=T.idx;
  for(const [n,tid,lean,pitch,steer] of poses){const fake={m,d,trk_:null,lean,pitch,k:0,tr:1};BK.poseBike(m,lean,pitch,steer,0,0);m.g.updateMatrixWorld(true);
   const ps=tid?trickPose(fake,tid,1,1):basePose(fake);ps.knee=lean;BK.poseRider(m,ps);m.g.updateMatrixWorld(true);let worst=0;
   for(let s=0;s<2;s++){if(ps.hands&&ps.hands[s])continue;const sg=s?-1:1,H=new THREE.Vector3(m.I.grip[0]*sg,m.I.grip[1],m.I.grip[2]);H.sub(m.steer.position);H.applyQuaternion(m.steer.quaternion);H.add(m.steer.position);
    const b=R.bones[ix[s?'handR':'handL']],w=new THREE.Vector3();b.getWorldPosition(w);m.inner.worldToLocal(w);worst=Math.max(worst,Math.abs(w.distanceTo(H)-.06))}
   out.push([id,who,n,+worst.toFixed(3)])}
  BK.disposeBike(m)}
 return out};
BK.debug=()=>({B,PR});BK._wipe=(p,why)=>wipeout(p,why||"TEST");BK._skill=(p,n,pts,side)=>{bumpChain(p,1);p.score+=pts;skill(p,n,pts,side)};
P.bikeStart=o=>BK.loadPack().then(()=>startRun(o));
})();
