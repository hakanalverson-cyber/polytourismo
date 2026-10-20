/* ===== Poly Tourismo v8 layer: dust, traffic, scoring, payouts, career, HUD ===== */
(function v8modes(){
'use strict';
const P=window.PT8,CARS=P.CARS,BYID=P.BYID,CLS=P.CLS,fmtCr=P.fmtCr,fmtT=P.fmtT,ord=P.ord;
const rnd=(a,b)=>a+Math.random()*(b-a);
const NAMES=['KAZE','RIVA','BOLT','MOSS','TANK','VEGA','DUSK','ORCA','NOVA','HAWK','LYNX','ONYX','ROOK','FINN','ZED','JUNO','SOL','MAKO','IVY','DRAX'];

/* ================= dust / dirt particles ================= */
const NP=900;
P.setupDust=Rc=>{
 const g=new THREE.BufferGeometry(),pos=new Float32Array(NP*3),col=new Float32Array(NP*4),siz=new Float32Array(NP);
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aCol',new THREE.BufferAttribute(col,4));g.setAttribute('aSize',new THREE.BufferAttribute(siz,1));
 const u={uScale:{value:600}};
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,fog:false,
  vertexShader:'attribute vec4 aCol;attribute float aSize;uniform float uScale;varying vec4 vC;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float z=max(-mv.z,.1);gl_PointSize=min(aSize*uScale/z,44.);vC.a*=smoothstep(2.5,7.5,z);}',
  fragmentShader:'varying vec4 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p)*2.;float a=smoothstep(1.,.12,d);a*=a*1.4;gl_FragColor=vec4(vC.rgb,vC.a*a);if(gl_FragColor.a<.01)discard;}'});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.renderOrder=5;
 const vp=new THREE.Vector4();
 pts.onBeforeRender=(r,sc,cam)=>{r.getViewport(vp);u.uScale.value=vp.w/(2*Math.tan(cam.fov*Math.PI/360))};
 Rc.scene.add(pts);
 Rc.dust={pts,pos,col,siz,vel:new Float32Array(NP*3),age:new Float32Array(NP).fill(99),life:new Float32Array(NP).fill(1),s0:new Float32Array(NP),a0:new Float32Array(NP),gr:new Float32Array(NP),rgb:new Float32Array(NP*3),head:0};
};
P.puff=(x,y,z,vx,vy,vz,rgb,size,life,alpha,grav)=>{const d=RACE&&RACE.dust;if(!d)return;const i=d.head;d.head=(d.head+1)%NP;
 d.pos[i*3]=x;d.pos[i*3+1]=y;d.pos[i*3+2]=z;d.vel[i*3]=vx;d.vel[i*3+1]=vy;d.vel[i*3+2]=vz;d.age[i]=0;d.life[i]=life;d.s0[i]=size;d.a0[i]=alpha;d.gr[i]=grav||0;d.rgb[i*3]=rgb[0];d.rgb[i*3+1]=rgb[1];d.rgb[i*3+2]=rgb[2]};
P.dustTick=(Rc,dt)=>{const d=Rc.dust;if(!d)return;
 for(let i=0;i<NP;i++){const a=d.age[i];if(a>=d.life[i]){d.siz[i]=0;d.col[i*4+3]=0;continue}
  d.age[i]=a+dt;const k=(a+dt)/d.life[i],dr=Math.exp(-dt*1.8);
  d.vel[i*3]*=dr;d.vel[i*3+2]*=dr;d.vel[i*3+1]=d.vel[i*3+1]*dr-d.gr[i]*dt;
  d.pos[i*3]+=d.vel[i*3]*dt;d.pos[i*3+1]+=d.vel[i*3+1]*dt;d.pos[i*3+2]+=d.vel[i*3+2]*dt;
  d.siz[i]=d.s0[i]*(1+k*2.6);d.col[i*4]=d.rgb[i*3];d.col[i*4+1]=d.rgb[i*3+1];d.col[i*4+2]=d.rgb[i*3+2];d.col[i*4+3]=d.a0[i]*(1-k)*(1-k)*Math.min(1,a*9+.2)}
 const g=d.pts.geometry;g.attributes.position.needsUpdate=true;g.attributes.aCol.needsUpdate=true;g.attributes.aSize.needsUpdate=true};
const hex3=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
/* wheel dust & dirt on loose ground */
const prevVis=updateVisual;
updateVisual=(c,T,t)=>{prevVis(c,T,t);const Rc=RACE;if(!Rc||!Rc.dust||c.exp>0||c.respT>0)return;
 const loose=(T.d.gravel&&c.onRoad&&!T.ice[c.idx])||!c.onRoad;if(!loose||c.sp<4)return;
 const dcol=T.d.dust||0xb89c70,base=hex3(dcol),dk=hex3(T.d.dirt||0x5a4630);
 const slide=Math.abs(wr(Math.atan2(c.vx,c.vz)-c.yaw)),rate=clamp((c.sp-3)/13,0,1)*(c.onRoad?32:46)*(1+Math.min(1.8,slide*3)+(c.drifting?.6:0));
 c.dAcc=(c.dAcc||0)+dtf*rate;const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
 while(c.dAcc>=1){c.dAcc--;const wi=2+(Math.random()<.5?0:1),w=c.m.wheels[wi];if(!w||!w.g){continue}
  const x=c.x+cy*WL[wi][0]+sy*WL[wi][1],z=c.z-sy*WL[wi][0]+cy*WL[wi][1],y=(w.s?w.s.h:c.y-1)+.2,b=1+(Math.random()-.5)*.14;
  const sp=c.sp;P.puff(x,y,z,-sy*sp*.16+(Math.random()-.5)*2.4+c.vx*.12,rnd(.9,2.6)+slide*2,-cy*sp*.16+(Math.random()-.5)*2.4+c.vz*.12,[base[0]*b,base[1]*b,base[2]*b],rnd(.8,1.5)*(1+slide*.6),rnd(1.0,1.7),rnd(.2,.34),.15)}
 if(c.sp>12&&Math.random()<.34*dtf*60){const wi=2+(Math.random()<.5?0:1),w=c.m.wheels[wi];if(w&&w.g){const x=c.x+cy*WL[wi][0]+sy*WL[wi][1],z=c.z-sy*WL[wi][0]+cy*WL[wi][1],y=(w.s?w.s.h:c.y-1)+.25;
  for(let k=0;k<2;k++)P.puff(x,y,z,-sy*c.sp*.28+(Math.random()-.5)*5,rnd(2.5,6),-cy*c.sp*.28+(Math.random()-.5)*5,dk,rnd(.16,.3),rnd(.5,.9),.9,15)}}
};

/* ================= traffic / cut-up ================= */
P.setupTraffic=Rc=>{const T=Rc.T,N=T.N,cfg=Rc.cfg;Rc.timeLeft=cfg.time||120;Rc.timeMax=Rc.timeLeft+45;
 for(const c of Rc.cars)if(c.human){c.score=0;c.combo=0;c.comboT=0;c.nm=0;c.crashes=0;c.bestCombo=0;c.pop=null;c.popT=0;c.near=0;c.passes=0}
 const hv=cfg.traffic==='heavy';Rc.tmul=hv?1.5:1;Rc.heavy=hv;const cnt=Math.round(clamp(Math.round(T.L/50),28,48)*(hv?2.5:1)),lanes=[{l:-.75,d:1,v:[11,16]},{l:-.25,d:1,v:[17,22]},{l:.25,d:-1,v:[15,22]},{l:.75,d:-1,v:[12,18]}];
 Rc.traffic=[];
 for(let k=0;k<cnt;k++){const ln=lanes[k%4],m=mkCar([0xb94a3a,0x3a6fb9,0xd8d0b8,0x3f8f5a,0xd2a23a,0x555a66][k%6],100+k);Rc.scene.add(m.g);Rc.scene.add(m.sh);
  m.wheels.forEach((w,n)=>w.pv.position.set(WL[n][0],-.6,WL[n][1]));
  const t={m,lane:ln,lat:ln.l,tl:ln.l,chg:rnd(2,9),dir:ln.d,v:rnd(ln.v[0],ln.v[1])*(hv?rnd(.78,1.1):1),idx:(k/cnt*N+rnd(0,hv?26:8)+30)%N,hit:0,x:0,y:0,z:0,yaw:0,seen:{},vx:0,vy:0,vz:0,spin:0};Rc.traffic.push(t)}
 /* never spawn on the grid, or on gaps */
 Rc.traffic.forEach(t=>{const i=Math.floor(t.idx);if(T.gap[i]||(i>N-40||i<20))t.idx=(t.idx+40)%N});
 for(let pass=0;pass<12;pass++){let moved=0;for(const t of Rc.traffic)for(const u of Rc.traffic){if(u===t||u.dir!==t.dir||Math.abs(u.lat-t.lat)*T.hw[0]>2.7)continue;const d=((u.idx-t.idx)*t.dir%N+N)%N*T.sp;if(d<14){u.idx=(u.idx+u.dir*5+N)%N;moved=1}}if(!moved)break}
};
function placeTraffic(t,T){const N=T.N,i=Math.floor(t.idx)%N,j=(i+1)%N,u=t.idx-Math.floor(t.idx),lat=t.lat*T.hw[i],psi=T.psi[i]+wr(T.psi[j]-T.psi[i])*u,s=Math.sin(psi),c=Math.cos(psi);
 t.x=lerp(T.x[i],T.x[j],u)+c*lat;t.z=lerp(T.z[i],T.z[j],u)-s*lat;t.y=lerp(T.y[i],T.y[j],u)-lat*lerp(T.bank[i],T.bank[j],u);t.yaw=psi+(t.dir<0?PI:0);t.gapHide=!!(T.gap[i]||T.gap[j]);
 t.pitch=-Math.atan((T.y[j]-T.y[i])/T.sp)*t.dir}
const popTxt=(c,txt)=>{c.pop=txt;c.popT=1.5};
/* traffic never overlaps: followers match the leader's speed and keep a gap; lane changes need a clear gap */
function spaceTraffic(Rc,dt){const T=Rc.T,N=T.N,sp=T.sp,L=Rc.traffic;
 for(const t of L){if(t.hit>0)continue;if(t.vb===undefined)t.vb=t.v;let lim=t.vb,hw=T.hw[Math.floor(t.idx)%N]||6;
  for(const u of L){if(u===t||u.hit>0||u.dir!==t.dir)continue;if(Math.abs(u.lat-t.lat)*hw>2.7)continue;
   const d=(((u.idx-t.idx)*t.dir)%N+N)%N*sp;if(d>40||d<=0&&false)continue;
   if(d<7){t.idx=(u.idx-t.dir*7/sp+N)%N;lim=Math.min(lim,(u.v||u.vb)*.9)}
   else if(d<26)lim=Math.min(lim,(u.v||u.vb)*.97+Math.max(0,d-11)*.55)}
  t.v+=(lim-t.v)*Math.min(1,dt*(lim<t.v?4:1.2))}}
const laneClear=(Rc,t,lat)=>{const T=Rc.T,hw=T.hw[Math.floor(t.idx)%T.N]||6;for(const u of Rc.traffic){if(u===t||u.dir!==t.dir)continue;if(Math.abs(u.tl-lat)*hw>2.7&&Math.abs(u.lat-lat)*hw>2.7)continue;const d=Math.abs(((u.idx-t.idx)*t.dir+T.N*1.5)%T.N-T.N*.5)*T.sp;if(d<20)return false}return true};
function trafficTick(Rc,dt){const T=Rc.T,N=T.N;spaceTraffic(Rc,dt);
 for(const t of Rc.traffic){const m=t.m;
  if(m.visualModel&&!t.vm){m.visualModel.position.y=-.72+m.visualHeight/2;t.vm=1}
  if(t.hit>0){t.hit-=dt;t.vy-=22*dt;t.x+=t.vx*dt;t.y+=t.vy*dt;t.z+=t.vz*dt;t.spin+=dt*9;
   m.g.position.set(t.x,Math.max(t.y,T.surf(t.x,t.z,t.y+3).h+.9),t.z);m.g.rotation.set(t.spin*.6,t.yaw+t.spin*.3,t.spin);
   if(t.hit<=0){t.idx=(Rc.cars.find(c=>c.human).idx+90+Math.random()*60)%N;for(let q=0;q<10&&!laneClear(Rc,t,t.tl);q++)t.idx=(t.idx+9)%N;t.seen={};t.vb=t.v=rnd(t.lane.v[0],t.lane.v[1])}
   m.sh.visible=false;continue}
  if(Rc.heavy&&t.dir>0){t.chg-=dt;if(t.chg<=0){const nl=t.tl<-.5?-.25:-.75;if(laneClear(Rc,t,nl)){t.chg=rnd(3,10);t.tl=nl}else t.chg=.7}}t.lat+=(t.tl-t.lat)*Math.min(1,dt*2);
  t.idx=(t.idx+t.dir*t.v*dt/T.sp+N)%N;placeTraffic(t,T);
  m.g.visible=!t.gapHide;m.sh.visible=!t.gapHide&&!(P.realShadows&&Rc.scene.userData.sun);
  m.g.position.set(t.x,t.y+.83,t.z);m.g.rotation.set(t.pitch,t.yaw,0,'YXZ');if(window.__wheels&&!t.gapHide)try{window.__wheels(m,t.v,Math.max(-1,Math.min(1,(t.tl-t.lat)*t.dir*2.5)),dt)}catch(e){}m.sh.position.set(t.x,t.y+.08,t.z);m.sh.rotation.z=0}
 for(const c of Rc.cars){if(!c.human||c.fin)continue;
  c.comboT-=dt;if(c.comboT<=0)c.combo=0;if(c.popT>0)c.popT-=dt;
  const fx_=Math.sin(c.yaw),fz_=Math.cos(c.yaw),rx_=Math.cos(c.yaw),rz_=-Math.sin(c.yaw);
  for(const t of Rc.traffic){if(t.hit>0||t.gapHide)continue;const dx=t.x-c.x,dz=t.z-c.z;if(dx*dx+dz*dz>900)continue;
   const lon=dx*fx_+dz*fz_,lat=Math.abs(dx*rx_+dz*rz_),prev=t.seen[c.k];t.seen[c.k]=lon;
   if(Math.abs(t.y-c.y)<2.5&&P.obbHit(c.x,c.z,c.yaw,t.x,t.z,t.yaw)){ /* crash */
    const rel=Math.hypot(c.vx-(Math.sin(t.yaw)*t.v),c.vz-(Math.cos(t.yaw)*t.v));
    t.hit=2.4;t.vx=c.vx*.9+rnd(-3,3);t.vz=c.vz*.9+rnd(-3,3);t.vy=rnd(7,12);t.spin=0;
    c.vx*=.4;c.vz*=.4;c.combo=0;c.comboT=0;c.crashes++;Rc.shake=Math.max(Rc.shake,.9);popTxt(c,'CRASH / COMBO LOST');
    c.score=Math.max(0,c.score-Math.round(rel*4));fx(c.x+fx_*2,c.y+.6,c.z+fz_*2,0xffe080,10,7,.35,.2,8);noise(.2,.4,900);beep(120,.25,'sawtooth',.8);continue}
   if(prev!==undefined&&prev>0&&lon<=0&&lat<3.9&&c.sp>16){ /* passed it */
    if(lat>=2.15){const gap=lat-2.15,close=gap<(Rc.heavy?1.25:1.1);c.passes++;
     if(close){c.combo=Math.min(12,c.combo+1);c.comboT=4;c.nm++;c.bestCombo=Math.max(c.bestCombo,c.combo);const pts=Math.round((50+c.sp*1.6)*(t.dir<0?2:1)*(1+(1.7-gap)*.4)*c.combo*(Rc.tmul||1));c.score+=pts;Rc.timeLeft=Math.min(Rc.timeMax,Rc.timeLeft+(Rc.heavy?.5:.4));popTxt(c,(t.dir<0?'ONCOMING ':'NEAR MISS ')+'+'+pts);beep(700+c.combo*50,.07,'triangle',.6)}
     else{c.score+=8;}}}
  }}}
P.modeTick=(Rc,dt)=>{
 if(Rc.mode==='cutup'){Rc.timeLeft=Math.max(0,Rc.timeLeft-dt);if(Rc.traffic)trafficTick(Rc,dt)}
 if(Rc.mode==='ta'&&P.ghostTick)P.ghostTick(Rc,dt)};

/* ================= AI field builder ================= */
P.makeAI=function({n,classes,skill,rally,cap,seed,ids}){
 const RALLY=['lr','urus','ford','ster'],capOk=c=>cap==null||CLS.indexOf(c.cls)<=CLS.indexOf(cap);
 let pool=rally?CARS.filter(c=>RALLY.includes(c.id)&&classes.includes(c.cls)&&capOk(c)):CARS.filter(c=>classes.includes(c.cls)&&capOk(c));
 if(rally&&!pool.length)pool=CARS.filter(c=>RALLY.includes(c.id)&&capOk(c));if(rally&&!pool.length)pool=CARS.filter(c=>RALLY.includes(c.id));
 if(ids&&ids.length){const q=CARS.filter(c=>ids.includes(c.id));if(q.length)pool=q}
 const list=pool.length?pool:[BYID.merc];
 const out=[],names=NAMES.slice().sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){let c;if(rally){const w=list.map(x=>.4+x.off*1.6);let r=Math.random()*w.reduce((a,b)=>a+b,0),k=0;while(k<list.length-1&&(r-=w[k])>0)k++;c=list[k]}else c=list[Math.floor(Math.random()*list.length)];
  out.push({id:c.id,alt:Math.random()<.5?1:0,skill:clamp(skill+rnd(-.035,.03),.55,1.02),name:names[i%names.length],lat:((i*5)%7-3)/4})}
 return out};

/* ================= rally/time-attack references, prizes ================= */
P.MEDAL_REF={0:57.4,1:59.4,2:83.7,3:45.3,4:72.8,5:77.3,6:76.9,r0:57.6,r1:57.7,r2:83.0,r3:45.3,r4:75.3,r5:74.8,r6:78.7};/* per-lap seconds for the B-class reference (Mercedes): AI lap x1.06 */
const MEDALS=[{n:'PLATINUM',f:1.0,cr:3600,col:'#cfe8ff'},{n:'GOLD',f:1.05,cr:1800,col:'#ffd23f'},{n:'SILVER',f:1.12,cr:900,col:'#c7ccd1'},{n:'BRONZE',f:1.22,cr:400,col:'#d08a4a'}];
P.MEDALS=MEDALS;
P.medalFor=(track,car,lap)=>{const ref=P.MEDAL_REF[track];if(!ref||lap==null)return -1;const sc=Math.pow(BYID.merc.top/car.top,.8),r=ref*sc;for(let i=0;i<MEDALS.length;i++)if(lap<=r*MEDALS[i].f)return i;return MEDALS.length};
P.medalTime=(track,car,i)=>{const ref=P.MEDAL_REF[track];if(!ref)return null;return ref*Math.pow(BYID.merc.top/car.top,.8)*MEDALS[i].f};
const PLACE_FRAC=[1,.6,.4,.28,.2,.14,.1,.08];
P.raceBase=(laps,car)=>Math.round(450*laps*(1+CLS.indexOf(car.cls)*.35));

/* ================= career ================= */
const RANKS=[
 {n:'ROOKIE',col:'#8fd16b',ai:['C','B'],skill:.80,prize:1900},
 {n:'AMATEUR',col:'#4fc3ff',ai:['B','A'],skill:.85,prize:3800},
 {n:'SEMI-PRO',col:'#ffd23f',ai:['A','B'],skill:.89,prize:7200},
 {n:'PRO',col:'#ff9a3c',ai:['A','S'],skill:.93,prize:13500},
 {n:'ELITE',col:'#ff4d4d',ai:['S','A'],skill:.965,prize:24000},
 {n:'LEGEND',col:'#d65bff',ai:['S'],skill:1.0,prize:42000}
];
/* [type,name,track,laps,cap,field,extra] type: race | rally | cutup */
const EV=[
 [['race','Quarry Open',0,2,'B',4],['rally','Pinewood Shakedown',4,2,'C',3],['cutup','Cut-Up: Back Streets',3,0,null,0,3500],['race','Canyon Rookie Cup',1,2,'B',5],['race','ROOKIE FINAL: Alpine Pass',2,2,'B',5]],
 [['rally','Redrock Dash',5,2,null,4],['race','Afterhours Sprint',3,3,null,5],['cutup','Cut-Up: Canyon Run',1,0,null,0,6500],['race','Hatch Heroes',0,3,'C',5],['rally','AMATEUR FINAL: Highmoor Stage',6,3,null,5]],
 [['race','Alpine Sprint',2,3,null,5],['rally','Pinewood Open',4,3,'B',5],['cutup','Cut-Up: Overpass',3,0,null,0,10000],['rally','Utility Rally',6,2,'D',4],['race','SEMI-PRO FINAL: Canyon GP',1,4,null,6]],
 [['race','Quarry Grand Prix',0,4,null,6],['rally','Redrock Open',5,3,null,5],['cutup','Cut-Up: Alpine',2,0,null,0,14000],['race','Afterhours GP',3,4,null,6],['rally','PRO FINAL: Highmoor Rally',6,4,null,6]],
 [['race','Canyon Masters',1,4,null,6],['rally','Pinewood Masters',4,4,null,6],['cutup','Cut-Up: Quarry',0,0,null,0,19000],['race','Alpine Masters',2,4,null,7],['race','ELITE FINAL: Afterhours Grand Prix',3,5,null,7]],
 [['race','Legends Quarry',0,5,null,7],['rally','Legends Redrock',5,4,null,7],['cutup','Cut-Up: Legends',1,0,null,0,26000],['race','Legends Alpine',2,5,null,7],['rally','LEGEND FINAL: Grand Pinewood',4,5,null,7]]
];
const EVENTS=[];EV.forEach((r,ri)=>r.forEach((e,ei)=>EVENTS.push({id:'r'+ri+'e'+ei,rank:ri,idx:ei,type:e[0],name:e[1],track:e[2],laps:e[3],cap:e[4],n:e[5],target:e[6],final:ei===4,
 prize:Math.round(RANKS[ri].prize*(e[0]==='cutup'?.9:e[0]==='rally'?1.1:1)*(ei===4?2:1))})));
P.RANKS=RANKS;P.EVENTS=EVENTS;
P.careerRank=()=>{const d=P.SV().career.done;let r=0;while(r<RANKS.length-1&&d['r'+r+'e4'])r++;return r};
P.careerDone=id=>P.SV().career.done[id];
P.eventLocked=ev=>{const d=P.SV().career.done,r=P.careerRank();if(ev.rank>r)return'RANK LOCKED';if(ev.final){let n=0;for(let i=0;i<4;i++)if(d['r'+ev.rank+'e'+i])n++;if(n<3)return'WIN '+(3-n)+' MORE EVENTS'}return''};
P.eligibleCars=cap=>P.ownedList().filter(c=>cap==null||CLS.indexOf(c.cls)<=CLS.indexOf(cap));
P.loanerFor=(cap,rally)=>{const pool=CARS.filter(c=>(rally||!c.rallyOnly)&&(cap==null||CLS.indexOf(c.cls)<=CLS.indexOf(cap)));pool.sort((a,b)=>CLS.indexOf(b.cls)-CLS.indexOf(a.cls)||(rally?b.off-a.off:b.top-a.top));return pool[0]||BYID.merc};
P.eventCfg=(ev,humanPick)=>{const rk=RANKS[ev.rank],rally=ev.type==='rally';
 const cfg={mode:'career',ev,track:ev.track,laps:ev.laps||1,humans:[humanPick],cap:ev.cap};
 if(ev.type==='cutup'){cfg.mode='cutup';cfg.cutup=true;cfg.time=120+ev.rank*5;cfg.ai=[]}
 else{cfg.ai=P.makeAI({n:ev.n,classes:rk.ai,skill:rk.skill+(ev.final?.025:0),rally,cap:ev.cap&&(CLS.indexOf(ev.cap)<2?ev.cap:null)})}
 return cfg};

/* ================= results & payouts ================= */
P.showResults=function(){const Rc=RACE,cfg=Rc.cfg,N=Rc.T.N,humans=Rc.cars.filter(c=>c.human);
 const res={cfg,mode:cfg.cutup?'cutup':cfg.mode,rows:[],notes:[],pay:[],total:0,title:'',sub:'',promo:null,medal:null};
 const sv=P.SV();
 const rank=cars=>[...cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw);
 if(Rc.mode==='cutup'){
  const hs=humans.slice().sort((a,b)=>b.score-a.score);
  hs.forEach((c,i)=>{const cr=Math.round(c.score/10)+(c.bestCombo>=8?250:0);res.rows.push({name:c.ptName,car:BYID[c.carId].name,score:c.score,extra:'NEAR MISSES '+c.nm+' / BEST COMBO x'+c.bestCombo+' / CRASHES '+c.crashes,cr,human:true,place:i+1,col:CS[c.k]});res.total+=cr});
  res.title='CUT-UP COMPLETE';res.sub=cfg.ev?cfg.ev.name:'TRAFFIC RUN';
  if(cfg.ev){const t=cfg.ev.target,best=hs[0].score,ok=best>=t;res.goal={txt:'TARGET '+t.toLocaleString('en-US')+' PTS',ok};if(ok){const first=!sv.career.done[cfg.ev.id];const bonus=first?cfg.ev.prize:Math.round(cfg.ev.prize*.35);res.pay.push({l:first?'EVENT PRIZE':'REPLAY PRIZE',v:bonus});res.total+=bonus;if(first){sv.career.done[cfg.ev.id]={score:best};res.first=true}else if((sv.career.done[cfg.ev.id].score||0)<best)sv.career.done[cfg.ev.id].score=best}}
 }else{
  const order=rank(Rc.cars);
  order.forEach((c,i)=>{res.rows.push({name:c.ptName,car:BYID[c.carId].name,time:Rc.mode==='elim'?null:(c.fin?c.finT:null),txt:Rc.mode==='elim'?(c.txt||'OUT'):null,place:i+1,human:c.human,col:CS[c.k],best:c.lapT&&c.lapT.length?Math.min(...c.lapT):null,loan:c.loan,lapsDown:Rc.mode==='elim'||c.fin?0:Math.max(0,Rc.laps-Math.floor(Math.max(0,c.unw)/N)-1)})});
  const hrows=res.rows.filter(r=>r.human);
  const topCls=Math.max(...humans.map(c=>CLS.indexOf(BYID[c.carId].cls)));
  if(Rc.mode==='ta'){
   const c=humans[0],bl=c.lapT&&c.lapT.length?Math.min(...c.lapT):null,tr=cfg.track,tk=cfg.rev?'r'+tr:tr,rec=sv.ta[tk]||(sv.ta[tk]={});
   res.title='TIME ATTACK';res.sub=D[tr].name.toUpperCase()+(cfg.rev?' (REVERSE)':'');
   const med=bl!=null?P.medalFor(tk,BYID[c.carId],bl):-1;
   res.medal=med>=0&&med<MEDALS.length?med:-1;
   const laps=(c.lapT||[]).length,run=laps*60;res.pay.push({l:'LAPS COMPLETED x'+laps,v:run});res.total+=run;
   const prevM=rec.medal==null?MEDALS.length:rec.medal;
   if(res.medal>=0&&res.medal<prevM){let g=0;for(let m=res.medal;m<prevM&&m<MEDALS.length;m++)g+=MEDALS[m].cr;res.pay.push({l:MEDALS[res.medal].n+' MEDAL',v:g});res.total+=g;rec.medal=res.medal}
   if(bl!=null&&(rec.best==null||bl<rec.best)){res.notes.push('NEW BEST LAP '+fmtT(bl));rec.best=bl}
   if(c.fin&&(rec.total==null||c.finT<rec.total)){rec.total=c.finT}
   res.rows=[{name:c.ptName,car:BYID[c.carId].name,time:c.fin?c.finT:null,place:1,human:true,col:CS[c.k],best:bl,laps:c.lapT}];
  }else{
   const base=cfg.ev?cfg.ev.prize:P.raceBase(Rc.mode==='elim'?4:Rc.laps,BYID[humans[0].carId]);
   hrows.forEach(r=>{const c=humans.find(h=>h.ptName===r.name),clean=!c.expl;const frac=PLACE_FRAC[Math.min(r.place-1,7)];let cr=Math.round(base*frac*1);
    if(cfg.ev){const done=sv.career.done[cfg.ev.id];const pod=r.place<=3;const first=pod&&!done;
     if(pod){cr=first?Math.round(base*frac+base*.5):Math.round(base*frac*.4)}else cr=Math.round(base*.06);
     if(first){sv.career.done[cfg.ev.id]={place:r.place};res.first=true}else if(pod&&done&&(done.place==null||r.place<done.place))done.place=r.place}
    r.cr=cr;res.pay.push({l:r.name+' / '+ord(r.place)+' PLACE',v:cr});res.total+=cr});
   const flb=Math.min(...res.rows.map(r=>r.best==null?1e9:r.best));
   res.title=cfg.ev?(res.first?'EVENT CLEARED':'RACE FINISHED'):(Rc.mode==='elim'?'ELIMINATION':'RACE FINISHED');res.sub=cfg.ev?cfg.ev.name:D[cfg.track].name.toUpperCase();
   if(cfg.ev&&hrows[0].place>3)res.goal={txt:'PODIUM NEEDED TO CLEAR',ok:false};else if(cfg.ev)res.goal={txt:'PODIUM / CLEARED',ok:true};
  }
 }
 /* stats, money, rank-up */
 const before=P.careerRank();
 P.earn(res.total);sv.stats.races++;if(res.rows.length&&res.rows.find(r=>r.human&&r.place===1))sv.stats.wins++;P.save();
 const after=P.careerRank();if(cfg.ev&&after>before)res.promo=RANKS[after];
 res.balance=sv.cr;
 if(P.renderResults)P.renderResults(res);
};

/* ================= HUD ================= */
const SEGS=36;
const HUDHTML=`<div class="h8top"><div class="h8pos"><b>1</b><i>ST</i><span>/6</span></div><div class="h8plate"><div class="lap"></div><div class="raceTime"></div><div class="bl"></div></div></div>
<div class="h8mode"></div>
<div class="h8spd"><div class="gnum"><small>GEAR</small><b>1</b><div class="pips"><i></i><i></i><i></i><i></i></div></div><div class="spdmain"><div class="dg"><b class="rdot"></b><canvas width="17" height="7"></canvas><i>MPH</i></div><div class="segs"></div><div class="sub"><div class="ghint"></div><div class="cond"></div></div></div></div>
<div class="h8warn raceWarning"></div><div class="h8pop"></div><div class="h8fin"></div>`;
hudUpdate=()=>{const Rc=RACE,T=Rc.T;
 const order=[...Rc.cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw);
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=$('h'+i);if(!e||!c.rect)return;const r=c.rect,g=c.grp||[c],gi=g.indexOf(c);
  e.style.left=r[0]*innerWidth+'px';e.style.top=(1-r[1]-r[3])*innerHeight+'px';e.style.width=r[2]*innerWidth+'px';e.style.height=r[3]*innerHeight+'px';
  if(!e.dataset.b){e.innerHTML=HUDHTML;e.dataset.b=1;const sg=e.querySelector('.segs');for(let k=0;k<SEGS;k++)sg.appendChild(document.createElement('i'))}
  const s=clamp(Math.min(r[2]*innerWidth/860,r[3]*innerHeight/580),.46,1.15);e.style.setProperty('--s',s);
  const q=k=>e.querySelector(k),st=c.cs,mt=c.mt||MATS.road;
  const gt=P.gearTops(st).map(v=>v*2.23694),NG=gt.length,topH=gt[NG-1],kmh=Math.round(c.sp*2.23694),maxK=Math.ceil(topH/10)*10+10,gx=c.gear|0;
  q('.h8top').style.top=(10+gi*94*s)+'px';{const sp=e.querySelector('.h8spd');sp.style.right=(12+(gi%2)*(236*s))+'px';sp.style.bottom=(12+Math.floor(gi/2)*84*s)+'px'}
  const cut=Rc.mode==='cutup',lap=clamp(Math.floor(c.unw/T.N)+1,1,Rc.laps);
  q('.h8pos').style.display=cut?'none':'';
  if(!cut){const pl=order.indexOf(c)+1,fp=c.fin?c.place:pl;q('.h8pos b').textContent=fp;q('.h8pos i').textContent=ord(fp).replace(/\d/g,'');q('.h8pos span').textContent='/'+Rc.cars.length}
  q('.lap').textContent=cut?'CUT-UP':(c.fin?'FINISHED':'LAP '+lap+'/'+Rc.laps);
  q('.raceTime').textContent=cut?fmtT(Rc.timeLeft):fmtT(Rc.t);
  const bl=c.lapT&&c.lapT.length?Math.min(...c.lapT):null;q('.bl').textContent=cut?(c.score?'':''):('BEST '+fmtT(bl));q('.bl').style.display=cut?'none':'';
  /* mode panel */
  const md=q('.h8mode');md.style.display=gi?'none':'';
  if(cut){md.innerHTML='<div class="cu"><div class="sc"><small>SCORE</small><b>'+String(c.score).padStart(6,'0')+'</b></div><div class="cm'+(c.combo>1?' on':'')+'"><small>COMBO</small><b>x'+Math.max(1,c.combo)+'</b></div><div class="cc"><small>EARNING</small><b>'+Math.round(c.score/10).toLocaleString('en-US')+' Cr.</b></div></div>'}
  else if(Rc.mode==='ta'){const last=c.lapT&&c.lapT.length?c.lapT[c.lapT.length-1]:null,g=P.medalTime(Rc.cfg.rev?'r'+Rc.cfg.track:Rc.cfg.track,st,1);md.innerHTML='<div class="cu"><div class="sc"><small>LAST LAP</small><b>'+fmtT(last)+'</b></div><div class="sc"><small>GOLD TIME</small><b>'+fmtT(g)+'</b></div></div>'}
  else md.innerHTML='';
  /* speed + gear */
  {const cv=q('.dg canvas'),tx=String(kmh).padStart(3,'0');if(cv._t!==tx){cv._t=tx;P.pxDraw(cv,tx,'#ffffff')}}
  const sgs=e.querySelectorAll('.segs i'),lit=Math.round(clamp(kmh/maxK,0,1)*SEGS);
  sgs.forEach((x,k)=>{const v=(k+.5)/SEGS*maxK;let zi=0;while(zi<NG-1&&v>=gt[zi])zi++;const zb=Math.min(3,Math.floor(k*4/SEGS));x.className=(k<lit?'on ':'')+'z'+zb+(gx===zi?' cur':'')});
  q('.gnum b').textContent=gx+1;{const pp=q('.pips');if(pp.children.length!==NG){pp.innerHTML='<i></i>'.repeat(NG)}pp.querySelectorAll('i').forEach((x,k)=>x.className=k<=gx?'on':'')}
  q('.gnum').className='gnum'+(c.gearFlash>0?' fl':'');
  const ceilK=st.top*P.GT(st)[gx].top*((c.mt&&c.mt.top)||1)*2.23694,upN=Rc.state==='race'&&!c.fin&&gx<NG-1&&kmh>=ceilK*.84,dnN=kmh<ceilK*.34;let hint='';if(Rc.state==='race'&&!c.fin){if(upN)hint='SHIFT UP';else if(gx>0&&dnN)hint='SHIFT DOWN'}
  q('.ghint').textContent=hint;
  {const up=upN,rd=q('.rdot');rd.className='rdot'+(up?' on':'');
   const fx=P.surfFx(st,!!Rc.T.d.gravel),cd=q('.cond');cd.innerHTML=(Rc.T.d.gravel?'GRAVEL':'TARMAC')+' <b class="'+(fx.g>=0?'up':'dn')+'">GRIP '+(fx.g>=0?'+':'')+fx.g+'%</b>'+(fx.t<-1||fx.t>1?' <b class="'+(fx.t>=0?'up':'dn')+'">SPD '+(fx.t>=0?'+':'')+fx.t+'%</b>':'')}
  const w=q('.h8warn');w.textContent=c.warnT>0&&c.warn?c.warn:(c.wrong>1?'WRONG WAY':'');
  const pp=q('.h8pop');pp.textContent=c.popT>0&&c.pop?c.pop:(c.lapFlash>0&&c.lapT&&c.lapT.length&&!cut?'LAP '+c.lapT.length+'  '+fmtT(c.lapT[c.lapT.length-1]):'');pp.className='h8pop'+((c.popT>0||c.lapFlash>0)?' on':'');
  const fn=q('.h8fin');if(c.fin&&!cut){fn.innerHTML='<b>'+ord(c.place)+'</b><span>'+(Rc.cars.filter(h=>h.human&&!h.fin).length?'WAITING FOR OTHER DRIVERS':'')+'</span>';fn.className='h8fin on'}else fn.className='h8fin';
 });
 /* minimap */
 const cv=$('mm'),m=cv.getContext('2d'),S_=cv.width;m.clearRect(0,0,S_,S_);
 let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;for(let i=0;i<T.N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}
 const rr=S_/Math.max(60,cv.clientWidth||S_),D=22*rr,scale=Math.min((S_-D-6*rr)/(x1-x0),(S_-D-6*rr)/(z1-z0)),ox=S_-D-x1*scale,oz=D-z0*scale;
 /* section classes, built once per race: 1 medium, 2 hard, 3 hairpin corner, 4 jump */
 if(!Rc.mmCls){const K=P.kappa(T),cl=new Uint8Array(T.N);for(let i=0;i<T.N;i++){const R=1/Math.max(K[i],1e-4);cl[i]=R<35?3:R<55?2:R<80?1:0}
  for(const j of (T.jumps||[])){const a0=j-Math.round(26/T.sp),a1=j+Math.round(22/T.sp);for(let k=a0;k<=a1;k++)cl[((k%T.N)+T.N)%T.N]=4}Rc.mmCls=cl}
 const cl=Rc.mmCls,pt=i=>{i=((i%T.N)+T.N)%T.N;return[T.x[i]*scale+ox,T.z[i]*scale+oz]};
 m.lineJoin='round';m.lineCap='round';m.strokeStyle='#000000b0';m.lineWidth=8;m.beginPath();for(let i=0;i<T.N;i++){const [x,z]=pt(i);i?m.lineTo(x,z):m.moveTo(x,z)}m.closePath();m.stroke();
 m.strokeStyle='#e9ecef';m.lineWidth=3.4;m.stroke();
 const COL=['','#ffd23f','#ff9a2f','#ff3b30','#ff3b30'];m.lineWidth=3.8;
 for(let i=0;i<T.N;){const c0=cl[i];if(!c0){i++;continue}let j=i;while(j+1<T.N&&cl[j+1]===c0)j++;m.strokeStyle=COL[c0];m.beginPath();for(let k=i;k<=j+1;k++){const [x,z]=pt(k);k===i?m.moveTo(x,z):m.lineTo(x,z)}m.stroke();i=j+1}
 for(const j of (T.jumps||[])){const [x,z]=pt(j);m.fillStyle='#ff3b30';m.strokeStyle='#fff';m.lineWidth=1.6;m.beginPath();m.moveTo(x,z-5);m.lineTo(x+5,z);m.lineTo(x,z+5);m.lineTo(x-5,z);m.closePath();m.fill();m.stroke()}
 m.fillStyle='#fff';m.fillRect(T.x[0]*scale+ox-3,T.z[0]*scale+oz-3,6,6);
 for(const c of Rc.cars){const x=c.x*scale+ox,z=c.z*scale+oz;m.fillStyle=c.human?CS[c.k]:'#8a909a';m.strokeStyle='#05070a';m.lineWidth=2;m.beginPath();m.arc(x,z,c.human?6:3.6,0,PI*2);m.fill();m.stroke();if(c.human){m.fillStyle='#05070a';m.font='bold 8px monospace';m.textAlign='center';m.textBaseline='middle';m.fillText(String(c.k+1),x,z+.5);m.textAlign='left';m.textBaseline='alphabetic'}}
 if(Rc.traffic){m.fillStyle='#ffffff55';for(const t of Rc.traffic){if(t.hit>0)continue;m.fillRect(t.x*scale+ox-1,t.z*scale+oz-1,2,2)}}
};
})();
