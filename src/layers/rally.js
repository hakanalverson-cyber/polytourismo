/* ===== Poly Tourismo v9 layer: rally (water fords + splashes, stage weather effects, pace notes, take-turns sessions) ===== */
(function v9rally(){
'use strict';
const P=window.PT8,PI=Math.PI,BYID=P.BYID;
const rnd=(a,b)=>a+Math.random()*(b-a);
const PCOL=['#f1f3f5','#f2c76b','#7fd68a','#ef6a5a'];

/* ---------------- water: grip / speed drag ---------------- */
const mul0=P.mul;
P.mul=c=>{const m=mul0(c);if(c._wet>0){const k=Math.min(1,c._wet);m.top*=1-.1*k;m.acc*=1-.18*k;m.grip*=1-.22*k;m.brk*=1-.12*k}return m};
function waterDepth(T,c){const F=T.fords;if(!F||!F.length)return 0;
 for(const f of F){const dx=c.x-f.x,dz=c.z-f.z,s=dx*f.s+dz*f.c;if(s>f.w+3||s<-f.w-3)continue;const l=dx*f.c-dz*f.s;if(Math.abs(l)>f.L*.8)continue;
  const g=T.terr?T.terr(c.x,c.z):f.y;const d=f.yw-Math.min(g,c.onRoad&&c.idx!=null?T.y[c.idx]:g);if(d>.1&&c.y-f.yw<1.1)return Math.min(1,d/.6)}
 return 0}

/* ---------------- effects ---------------- */
const WLp=()=>WL;
function wheelPos(c,wi){const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw),w=WL[wi];return[c.x+cy*w[0]+sy*w[1],c.z-sy*w[0]+cy*w[1]]}
function splash(c,T,dt,dep){const sp=c.sp,rate=Math.min(1,sp/12)*(46+sp*2.4)*dep;c._wA=(c._wA||0)+rate*dt;
 const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw),f=T.fords[0],yw=T.fords.reduce((b,q)=>Math.hypot(q.x-c.x,q.z-c.z)<Math.hypot(b.x-c.x,b.z-c.z)?q:b,f).yw;
 while(c._wA>=1){c._wA--;const wi=(Math.random()*4)|0,p=wheelPos(c,wi),side=wi%2?1:-1,lx=cy*side,lz=-sy*side;
  const out=rnd(1.5,4.5)+sp*.04,up=rnd(2.5,5.5)+sp*.08;
  P.puff(p[0],yw+.08,p[1],lx*out+c.vx*.55,up,lz*out+c.vz*.55,[.9,.96,1],rnd(.4,.85),rnd(.6,1.1),.85,15);if(wi>1&&sp>14)P.puff(p[0],yw+.1,p[1],-sy*sp*.2+lx*1.5+c.vx*.4,up*1.25,-cy*sp*.2+lz*1.5+c.vz*.4,[.92,.97,1],rnd(.4,.8),rnd(.8,1.3),.8,16);
  if(Math.random()<.34)P.puff(p[0],yw+.15,p[1],lx*out*.5+c.vx*.3,rnd(.8,1.8),lz*out*.5+c.vz*.3,[.92,.97,.98],rnd(1.4,2.8),rnd(1.1,1.8),.3,-.5);
  if(sp>16&&wi<2&&Math.random()<.5)P.puff(p[0],yw+.1,p[1],sy*sp*.35+lx*2,rnd(3,6.5),cy*sp*.35+lz*2,[.88,.95,.98],rnd(.25,.5),rnd(.6,1),.75,18)}}
function stageFx(c,T,dt){const nm=T.d.name,sc=RACE.scene,sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
 if(nm==='Ashfall Stage'){c._fA=(c._fA||0)+dt*26;
  while(c._fA>=1){c._fA--;const a=rnd(0,6.283),r=rnd(4,34);P.puff(c.x+Math.cos(a)*r+sy*c.sp*.5,c.y+rnd(2,11),c.z+Math.sin(a)*r+cy*c.sp*.5,rnd(.5,1.8),0,rnd(-.6,.6),[.5,.47,.46],rnd(.1,.2),rnd(3,4.5),.5,1.8)}
  const vs=(sc.userData.props||[]).filter(p=>p.n==='vent');c._vt=(c._vt||0)-dt;
  if(c._vt<=0){c._vt=.06;for(const v of vs){const d=Math.hypot(v.x-c.x,v.z-c.z);if(d>110)continue;
    if(Math.random()<.5)P.puff(v.x+rnd(-.4,.4),v.y+2.4,v.z+rnd(-.4,.4),rnd(-.4,.4)+1,rnd(2,4),rnd(-.4,.4),[1,.55,.14],rnd(.18,.34),rnd(1.1,1.9),.9,-3);
    if(Math.random()<.35)P.puff(v.x,v.y+2.5,v.z,rnd(-.3,.3)+.8,rnd(1.6,2.6),rnd(-.3,.3),[.62,.6,.6],rnd(1.4,2.4),rnd(2,3.2),.22,-.8)}}}
 else if(nm==='Autumn Ridge'){c._fA=(c._fA||0)+dt*16;const pal=[[.85,.4,.1],[.78,.2,.08],[.9,.65,.14],[.7,.45,.1]];
  while(c._fA>=1){c._fA--;const a=rnd(0,6.283),r=rnd(3,32),k=pal[(Math.random()*4)|0];P.puff(c.x+Math.cos(a)*r+sy*c.sp*.7,c.y+rnd(3,10),c.z+Math.sin(a)*r+cy*c.sp*.7,rnd(.8,2.4),0,rnd(-.8,.8),k,rnd(.2,.34),rnd(3.4,5),.85,.8)}}
 else if(nm==='Terrace Run'){c._fA=(c._fA||0)+dt*9;
  while(c._fA>=1){c._fA--;const a=rnd(0,6.283),r=rnd(3,26);P.puff(c.x+Math.cos(a)*r+sy*c.sp*.6,c.y+rnd(.5,5),c.z+Math.sin(a)*r+cy*c.sp*.6,rnd(.2,1),rnd(.1,.5),rnd(-.5,.5),[1,.88,.5],rnd(.08,.15),rnd(3,4.5),.55,.12)}}
 else if(nm==='Mangrove Ford'){c._fA=(c._fA||0)+dt*5;
  while(c._fA>=1){c._fA--;const a=rnd(0,6.283),r=rnd(4,28);P.puff(c.x+Math.cos(a)*r+sy*c.sp*.6,c.y+rnd(.4,3),c.z+Math.sin(a)*r+cy*c.sp*.6,rnd(-.3,.3),rnd(.1,.4),rnd(-.3,.3),[1,.97,.7],rnd(.08,.14),rnd(2.5,4),.7,-.05)}}}
const sc0=stepCar;
stepCar=function(c,dt){sc0.apply(this,arguments);const Rc=RACE;if(!Rc||!Rc.T||!Rc.dust)return;
 try{const T=Rc.T;if(T.fords&&T.fords.length){const dep=waterDepth(T,c),was=c._wet>0;c._wet=dep;
   if(dep>0){c._wet=dep;if(c.sp>3)splash(c,T,dt,dep);
    if(!was&&c.sp>6){if(c.human){P.sfx&&P.sfx('splash',Math.min(1,c.sp/45));Rc.shake=Math.max(Rc.shake||0,.1*Math.min(1,c.sp/40))}}
    if(c.human&&c.sp>10){c._wS=(c._wS||0)-dt;if(c._wS<=0){c._wS=.28;P.sfx&&P.sfx('splash',.18+Math.min(.3,c.sp/150))}}}
   else if(was&&c.human&&c.sp>6)P.sfx&&P.sfx('splash',Math.min(.8,c.sp/60))}
  if(c.human&&Rc.cfg&&!Rc.cfg.noFx)stageFx(c,T,dt)}catch(e){if(!P._rfxErr){P._rfxErr=1;console.error('rally fx',e)}}};

/* ---------------- pace notes ---------------- */
const wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
function note(c,T){const N=T.N,sp=T.sp,K=P.kappa(T),i0=c.idx||0,max=Math.round(180/sp);let ev=null;
 for(const f of T.fords||[]){const d=((f.i-i0-Math.round(f.w/sp)+N)%N)*sp;if(d<170&&(!ev||d<ev.d))ev={d,t:'WATER',s:'FORD'}}
 for(const j of T.jumps||[]){const d=((j-i0-Math.round(10/sp)+N)%N)*sp;if(d<170&&(!ev||d<ev.d))ev={d,t:'JUMP',s:'CREST'}}
 let j=0;for(;j<max;j++){if(K[(i0+j)%N]>1/95)break}
 let cor=null;if(j<max){let mk=0,sg=0;for(let u=0;u<70;u++){const r=(i0+j+u)%N;if(u>4&&K[r]<1/150)break;if(K[r]>mk)mk=K[r];sg+=wrp(T.psi[(r+3)%N]-T.psi[(r-3+N)%N])}
  const R=1/Math.max(mk,1e-4),g=R<15?'HAIRPIN':R<26?'1':R<40?'2':R<60?'3':R<85?'4':'5';cor={d:j*sp,t:g==='HAIRPIN'?'HAIRPIN':'TURN '+g,g,dir:sg>0?'L':'R'}}
 return{ev,cor}}
/* arrow bends the way the corner turns; angle and colour follow severity (hairpin = hot red, grade 5 = cool green) */
const GR={HAIRPIN:[150,'#ff3b30'],1:[115,'#ff5a2a'],2:[88,'#ff9a2a'],3:[62,'#f2c76b'],4:[42,'#c8dc6a'],5:[26,'#8fd68a']};
function arrow(g,dir){const [ang,col]=GR[g]||GR[3],a=ang*PI/180,sx=dir==='L'?-1:1,x0=20,y0=36,y1=22,L=15,ex=x0+sx*Math.sin(a)*L,ey=y1-Math.cos(a)*L,dx=sx*Math.sin(a),dy=-Math.cos(a),px=-dy,py=dx,hx=ex+dx*5,hy=ey+dy*5;
 return `<svg viewBox="0 0 40 40" width="46" height="46"><path d="M${x0} ${y0}L${x0} ${y1}L${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${hx.toFixed(1)} ${hy.toFixed(1)}L${(ex+px*5.5).toFixed(1)} ${(ey+py*5.5).toFixed(1)}L${(ex-px*5.5).toFixed(1)} ${(ey-py*5.5).toFixed(1)}Z" fill="${col}"/></svg>`}
const hu0=hudUpdate;
hudUpdate=()=>{hu0();const Rc=RACE;if(!Rc||!Rc.cfg||!Rc.cfg.rally)return;
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!e.dataset.b)return;let el=e.querySelector('.h8pace');if(!el){el=document.createElement('div');el.className='h8pace';e.appendChild(el)}
  if(Rc.state==='count'){el.style.opacity=0;return}
  const n=note(c,Rc.T);let txt='',cls='';
  if(n.ev&&(!n.cor||n.ev.d<n.cor.d+15)){txt=`<b>${n.ev.t}</b><span>${Math.round(n.ev.d/10)*10} m</span>`;cls='ev'}
  else if(n.cor){txt=`<i>${arrow(n.cor.t==='HAIRPIN'?'HAIRPIN':n.cor.g,n.cor.dir)}</i><b style="color:${(GR[n.cor.t==='HAIRPIN'?'HAIRPIN':n.cor.g]||GR[3])[1]}">${n.cor.t}</b><span>${Math.round(n.cor.d/10)*10} m</span>`;cls=n.cor.t==='HAIRPIN'?'hp':''}
  if(el._t!==txt){el._t=txt;el.innerHTML=txt}el.className='h8pace '+cls;el.style.opacity=txt?1:0})};

/* ---------------- take-turns session ---------------- */
const lh=P.launch;let S=null;
const KMo=KM.map(k=>Object.assign({},k));
const keysFor=p=>{Object.assign(KM[0],KMo[Math.min(p,KMo.length-1)])};
const keysReset=()=>{Object.assign(KM[0],KMo[0])};
P.launch=cfg=>{
 if(cfg.mode==='rally'&&!cfg.rally){startSession(cfg);return}
 if(!cfg.rally){keysReset();S=null}
 lh(cfg)};
function startSession(cfg){const hs=cfg.humans;
 S={cfg,drv:hs.map((h,i)=>({name:(h.name||'P'+(i+1)).slice(0,12),id:h.id,alt:h.alt,p:i,time:null,best:null,laps:[],medal:-1})),i:0,done:false};
 if(S.drv.length>1)briefing(0);else turn(0)}
function turn(i){S.i=i;const d=S.drv[i],cfg=S.cfg;keysFor(d.p);
 lh(Object.assign({},cfg,{mode:'mp',rally:true,rallyTurn:i,humans:[{id:d.id,alt:d.alt,name:d.name}],ai:[],grid:'fixed'}))}
const box=()=>document.getElementById('resBox');
const fmt=t=>P.fmtT(t);
const keyHint=p=>['W A S D','arrow keys','I J K L','T F G H'][p]||'';
function briefing(i){const d=S.drv[i],car=BYID[d.id],st=D[S.cfg.track];paused=true;
 const nxt=S.drv.length-i;
 box().innerHTML=`<h1>UP NEXT</h1><div class="sub">${st.name.toUpperCase()} &middot; ${S.cfg.laps} LAP${S.cfg.laps>1?'S':''} &middot; RUN ${i+1} OF ${S.drv.length}</div>
 <div class="rl-pass"><span class="rl-dot" style="background:${PCOL[d.p%4]}"></span><b>${d.name.replace(/</g,'')}</b><small>${car.name}${d.alt?' ALT':''} &middot; ${keyHint(d.p)}</small></div>
 ${i?standingsHTML(false):''}
 <div class="rl-note">Pass the controller. Fastest total time wins; the stage is the same for everyone.</div>
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlGo"><span>Start run</span></button><button class="btn" id="rlQuit"><span>Quit rally</span></button></div>`;
 show('s8res');document.getElementById('rlGo').onclick=()=>{turn(i)};document.getElementById('rlQuit').onclick=()=>{S=null;keysReset();P.cleanupRace();show('menu')}}
function sorted(){return S.drv.filter(d=>d.time!=null).sort((a,b)=>a.time-b.time)}
function standingsHTML(fin){const done=sorted(),lead=done.length?done[0].time:0;
 return `<table class="rt"><tr><th>Pos</th><th>Driver</th><th>Car</th><th>Time</th><th>${fin?'Gap':'Best lap'}</th></tr>`+done.map((d,i)=>`<tr class="${i===0?'hum':''}"><td class="pl">${i+1}</td><td><b style="color:${PCOL[d.p%4]}">${d.name.replace(/</g,'')}</b></td><td>${BYID[d.id].name}${d.medal>=0?` <span class="rl-med" style="background:${P.MEDALS[d.medal].col}" title="${P.MEDALS[d.medal].n}"></span>`:''}</td><td>${fmt(d.time)}</td><td style="color:var(--ac)">${fin?(i?'+'+(d.time-lead).toFixed(2):'--'):(d.best!=null?fmt(d.best):'--')}</td></tr>`).join('')+'</table>'}
const sr0=P.showResults;
P.showResults=function(){const Rc=RACE;if(!(Rc&&Rc.cfg&&Rc.cfg.rally&&S))return sr0.apply(this,arguments);
 const c=Rc.cars.find(q=>q.human),d=S.drv[S.i];d.time=c&&c.fin?c.finT:null;d.laps=(c&&c.lapT)||[];d.best=d.laps.length?Math.min(...d.laps):null;
 if(d.time==null){d.time=(c&&c.finT)||9999}
 if(S.i+1<S.drv.length){interim()}else finish()};
function interim(){const d=S.drv[S.i],pos=sorted().indexOf(d)+1;paused=true;
 box().innerHTML=`<h1>RUN COMPLETE</h1><div class="sub">${d.name.toUpperCase()} &middot; ${fmt(d.time)} &middot; ${pos===1?'LEADING':'P'+pos+' SO FAR'}</div>${standingsHTML(false)}
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlNext"><span>Next: ${S.drv[S.i+1].name.replace(/</g,'')}</span></button><button class="btn" id="rlQuit"><span>Quit rally</span></button></div>`;
 show('s8res');document.getElementById('rlNext').onclick=()=>briefing(S.i+1);document.getElementById('rlQuit').onclick=()=>{S=null;keysReset();P.cleanupRace();show('menu')}}
function finish(){const sv=P.SV(),cfg=S.cfg,tr=cfg.track,tk=tr,rec=sv.ta[tk]||(sv.ta[tk]={}),order=sorted(),N=S.drv.length,pay=[];let total=0,notes=[];
 keysReset();
 const FR=[1,.6,.4,.3];
 order.forEach((d,i)=>{const car=BYID[d.id],base=P.raceBase(Math.max(2,cfg.laps+1),car),fr=N===1?.75:FR[Math.min(i,3)],cr=Math.round(base*fr);pay.push({l:d.name+(N>1?' / '+P.ord(i+1)+' PLACE':' / STAGE CLEARED'),v:cr});total+=cr;
  if(d.best!=null){const m=P.medalFor(tk,car,d.best);d.medal=m>=0&&m<P.MEDALS.length?m:-1;const prevM=rec.medal==null?P.MEDALS.length:rec.medal;
   if(d.medal>=0&&d.medal<prevM){let g=0;for(let q=d.medal;q<prevM&&q<P.MEDALS.length;q++)g+=P.MEDALS[q].cr;pay.push({l:d.name+' / '+P.MEDALS[d.medal].n+' MEDAL',v:g});total+=g;rec.medal=d.medal}
   if(rec.best==null||d.best<rec.best){rec.best=d.best;notes.push('NEW STAGE BEST LAP '+fmt(d.best)+(N>1?' / '+d.name:''))}}
  if(rec.total==null||d.time<rec.total)rec.total=d.time});
 P.earn(total);sv.stats.races++;if(N>1)sv.stats.wins++;P.save();
 const win=order[0];paused=true;
 box().innerHTML=`<h1>${N>1?'RALLY RESULT':'STAGE COMPLETE'}</h1><div class="sub">${D[tr].name.toUpperCase()} &middot; ${cfg.laps} LAP${cfg.laps>1?'S':''}${N>1?' &middot; WINNER '+win.name.toUpperCase().replace(/</g,''):''}</div>
 ${notes.map(n=>`<span class="goal ok">${n}</span>`).join('')}${standingsHTML(true)}
 <div>${pay.map(p=>`<div class="pay"><span>${p.l}</span><span>+${P.fmtCr(p.v)}</span></div>`).join('')}<div class="pay tot"><span>Total earned</span><span>+${P.fmtCr(total)}</span></div><div class="pay"><span>Balance</span><span>${P.fmtCr(sv.cr)}</span></div></div>
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlAgain"><span>Run it again</span></button><button class="btn" id="rlSetup"><span>Stage select</span></button><button class="btn" id="rlBrand"><span>Brand Central</span></button><button class="btn" id="rlMenu"><span>Main menu</span></button></div>`;
 show('s8res');
 document.getElementById('rlAgain').onclick=()=>{P.cleanupRace();startSession(S.cfg)};
 document.getElementById('rlSetup').onclick=()=>{P.cleanupRace();S=null;P.ui.renderSetup();show('s8setup')};
 document.getElementById('rlBrand').onclick=()=>{P.cleanupRace();S=null;P.ui.openShow('brand',{player:0,cap:null,ret:'s8res_back'})};
 document.getElementById('rlMenu').onclick=()=>{P.cleanupRace();S=null;show('menu')}}
/* pause > restart mid-turn replays just this driver's run (launch keeps rally:true in lastCfg) */
P.RALLYSESSION=()=>S;
})();
