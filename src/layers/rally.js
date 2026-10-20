/* ===== Poly Tourismo v9 layer: rally (water fords + splashes, stage weather effects, pace notes, take-turns sessions) ===== */
(function v9rally(){
'use strict';
const P=window.PT8,PI=Math.PI,BYID=P.BYID;
const rnd=(a,b)=>a+Math.random()*(b-a);
let S=null;const CIR=()=>!!((S&&S.cfg&&S.cfg.circuit)||(typeof RACE!=='undefined'&&RACE&&RACE.cfg&&RACE.cfg.circuit)),W=(a,b)=>CIR()?b:a;
const PCOL=['#f1f3f5','#f2c76b','#7fd68a','#ef6a5a'];

/* ---------------- rally fleet: free rally-spec all-wheel-drive cars with gravel tyres ---------------- */
P.RALLY_CARS=['ford','lr','urus','gtr','ster'];P.CARS.forEach(c=>{if(c.rallyOnly||((c.cat==='HATCHBACK'||c.cat==='WAGON')&&!P.RALLY_CARS.includes(c.id)))P.RALLY_CARS.push(c.id)});
const WRCX=['c21','c53','c61','c5','c132'];WRCX.forEach(id=>{if(P.BYID[id]&&!P.RALLY_CARS.includes(id))P.RALLY_CARS.push(id)});P.CARS.forEach(c=>{c.rdiv=P.RALLY_CARS.includes(c.id)?(c.rallyOnly||WRCX.includes(c.id)?'WRC':'CASUAL'):null;if(c.rdiv==='WRC'){c.type='WRC RALLY CAR';c.drive='AWD'}});
{const setS=(id,sc,cl)=>{const c=P.BYID[id];if(!c)return;c.cls=cl;c.top=+(34+19*sc).toFixed(1);c.acc=+(20+15*sc).toFixed(1);c.grip=+(.96+.15*sc).toFixed(3);c.brk=+(.92+.25*sc).toFixed(3)};setS('c51',.88,'S');setS('c120',.86,'S');setS('c65',.84,'S');setS('c108',.74,'A');P.SORTED.sort((a,b)=>P.CLS.indexOf(a.cls)-P.CLS.indexOf(b.cls)||a.price-b.price)}
const ow0=P.owns;P.owns=(id,alt)=>P._ro&&P.RALLY_CARS.includes(id)?true:ow0(id,alt);
P.rallySel=p=>{const sv=P.SV();sv.rsel=sv.rsel||[];let s=sv.rsel[p];if(!s||!P.RALLY_CARS.includes(s.id))s=sv.rsel[p]={id:P.RALLY_CARS[p%P.RALLY_CARS.length],alt:0};return s};
/* water: grip / speed drag */
const mul0=P.mul;
P.mul=c=>{const m=mul0(c);if(c.human&&RACE&&RACE.cfg&&RACE.cfg.rally){const o=(c.cs&&c.cs.off)||0;if(!RACE.cfg.circuit){if(o<.9){m.grip*=(.5+.45*.9)/(.5+.45*o);m.top*=(.78+.22*.9)/(.78+.22*o);m.acc*=(.6+.37*.9)/(.6+.37*o)}m.grip*=.74*(1-Math.min(.2,c.sp/110));m.top*=1.06;m.acc*=1.1;m.brk*=.52}{const dm=c.dmg||0;if(dm>0){m.acc*=1-.5*Math.pow(dm,1.2);m.top*=1-.32*dm;m.grip*=1-.14*dm;m.brk*=1-.3*dm}}if(c._hb){m.grip*=.3;m.brk*=.85;m.acc*=.8}}if(c._wet>0){const k=Math.min(1,c._wet);m.top*=1-.1*k;m.acc*=1-.18*k;m.grip*=1-.22*k;m.brk*=1-.12*k}return m};
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
function roost(c,Rc,dt){const T=Rc.T;if(!c.human||!T.d.gravel||c.exp>0||c.respT>0||!c.onRoad||c.sp<5||c._wet>0||!Rc.dust)return;
 const slide=Math.abs(wrp(Math.atan2(c.vx,c.vz)-c.yaw)),rate=Math.min(1,(c.sp-4)/14)*(24+c.sp*.7)*(1+Math.min(1.8,slide*3)+(c._hb?1.2:0)+Math.max(0,c.in&&c.in.th||0)*.3);
 c._gA=(c._gA||0)+dt*rate;const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw),hx=T.d.dust||0xb89c70,bs=[((hx>>16)&255)/255,((hx>>8)&255)/255,(hx&255)/255].map(v=>v*v),dh=T.d.dirt||0x5a4630,dk=[((dh>>16)&255)/255,((dh>>8)&255)/255,(dh&255)/255].map(v=>v*v);
 while(c._gA>=1){c._gA--;const wi=2+(Math.random()<.5?0:1),w=c.m.wheels[wi];if(!w||!w.g)continue;
  const x=c.x+cy*WL[wi][0]+sy*WL[wi][1],z=c.z-sy*WL[wi][0]+cy*WL[wi][1],y=(w.s?w.s.h:c.y-1)+.25,b=1+(Math.random()-.5)*.2,sp=c.sp;
  P.puff(x,y,z,-sy*sp*.2+(Math.random()-.5)*3+c.vx*.1,rnd(1.2,3.2)+slide*2,-cy*sp*.2+(Math.random()-.5)*3+c.vz*.1,[bs[0]*b*1.3,bs[1]*b*1.3,bs[2]*b*1.3],rnd(1.5,2.9)*(1+slide*.5),rnd(1.4,2.5),rnd(.38,.58),-.2);
  if(Math.random()<.55)for(let k=0;k<2;k++)P.puff(x,y,z,-sy*sp*.3+(Math.random()-.5)*6,rnd(2.8,6.5),-cy*sp*.3+(Math.random()-.5)*6,dk,rnd(.14,.26),rnd(.6,1.1),.95,16)}}
function fxStep(c,Rc,dt){roost(c,Rc,dt);if(c.human)smokeFx(c,Rc,dt);const T=Rc.T;if(T.fords&&T.fords.length){const dep=waterDepth(T,c),was=c._wet>0;c._wet=dep;
  if(dep>0){c._wet=dep;if(c.sp>3)splash(c,T,dt,dep);
   if(!was&&c.sp>6){if(c.human){P.sfx&&P.sfx('splash',Math.min(1,c.sp/45));Rc.shake=Math.max(Rc.shake||0,.1*Math.min(1,c.sp/40))}}
   if(c.human&&c.sp>10){c._wS=(c._wS||0)-dt;if(c._wS<=0){c._wS=.28;P.sfx&&P.sfx('splash',.18+Math.min(.3,c.sp/150))}}}
  else if(was&&c.human&&c.sp>6)P.sfx&&P.sfx('splash',Math.min(.8,c.sp/60))}
 if(c.human&&Rc.cfg&&!Rc.cfg.noFx)stageFx(c,T,dt)}
const sc0=stepCar;
stepCar=function(c,dt){const Rc=RACE,rl=!!(Rc&&Rc.cfg&&Rc.cfg.rally&&c.human&&!c.forceAI),auto=P.isAuto(c);
 if(rl){if(c.rg===undefined)c.rg=c.gear|0;if(!auto)c.gear=c.rg;c._hb=!(S&&S.drv&&S.drv.length>1)&&Rc.state==='race'&&!c.fin&&c.respT<=0&&!(c.exp>0)&&!paused&&down.has(RK[curP].hb)}
 sc0.apply(this,arguments);
 if(rl){if(auto)c.rg=c.gear|0;else c.gear=c.rg;handbrakeFx(c,dt)}
 if(!Rc||!Rc.T||!Rc.dust)return;
 try{fxStep(c,Rc,dt)}catch(e){if(!P._rfxErr){P._rfxErr=1;console.error('rally fx',e)}}};
const wrp=a=>{while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a};
function corners(T){if(T.cor)return T.cor;const N=T.N,sp=T.sp,sg=new Float32Array(N);
 for(let i=0;i<N;i++)sg[i]=wrp(T.psi[(i+3)%N]-T.psi[(i-3+N)%N])/(6*sp);
 let st=0;for(let i=0;i<N;i++)if(Math.abs(sg[i])<1/200){st=i;break}
 const out=[],MAXL=Math.round(110/sp);let cur=null,low=0;
 const close=()=>{if(cur&&Math.abs(cur.ang)>.35)out.push({s:cur.s,len:Math.max(2,cur.len),R:1/Math.max(cur.mk,1e-4),dir:cur.ang>0?'L':'R'});cur=null;low=0};
 for(let u=0;u<N;u++){const i=(st+u)%N,v=sg[i],a=Math.abs(v);
  if(cur){if(a>1/180&&Math.sign(v)!==Math.sign(cur.ang)&&a>1/120){close()}else if(a<1/180){if(++low>=5){close()}}else low=0;if(cur&&cur.len>=MAXL)close()}
  if(!cur&&a>1/120)cur={s:i,len:0,mk:0,ang:0};
  if(cur){cur.len++;cur.mk=Math.max(cur.mk,a);cur.ang+=wrp(T.psi[(i+1)%N]-T.psi[i])}}
 close();T.cor=out;return out}
function note(c,T){const N=T.N,sp=T.sp,i0=c.idx||0;let ev=null;
 for(const f of T.fords||[]){const d=((f.i-i0-Math.round(f.w/sp)+N)%N)*sp;if(d<170&&(!ev||d<ev.d))ev={d,t:'WATER',s:'FORD'}}
 for(const j of T.jumps||[]){const d=((j-i0-Math.round(10/sp)+N)%N)*sp;if(d<170&&(!ev||d<ev.d))ev={d,t:'JUMP',s:'CREST'}}
 for(const q of T.pinch||[]){const a=(q.i-i0+N)%N,d=Math.max(0,a-Math.round(q.core/2/sp+4))*sp,past=((i0-q.i+N)%N)*sp;if(a>N/2&&past>q.core/2+10)continue;if(d<170&&(!ev||d<ev.d))ev={d:a>N/2?0:d,t:'NARROW',s:'PINCH'}}
 let cor=null;for(const k of corners(T)){const fw=(k.s-i0+N)%N,inside=(i0-k.s+N)%N,prog=inside/k.len;let d;
  if(inside<k.len*.75&&inside<N/2)d=0;else if(fw*sp<=180)d=fw*sp;else continue;
  if(!cor||d<cor.d){const R=k.R,g=R<15?'HAIRPIN':R<26?'1':R<40?'2':R<60?'3':R<85?'4':'5';cor={d,t:g==='HAIRPIN'?'HAIRPIN':'TURN '+g,g,dir:k.dir}}}
 return{ev,cor}}
/* arrow bends the way the corner turns; angle and colour follow severity (hairpin = hot red, grade 5 = cool green) */
const GR={HAIRPIN:[150,'#ff3b30'],1:[115,'#ff5a2a'],2:[88,'#ff9a2a'],3:[62,'#f2c76b'],4:[42,'#c8dc6a'],5:[26,'#8fd68a']};
function arrow(g,dir){const [ang,col]=GR[g]||GR[3],a=ang*PI/180,sx=dir==='L'?-1:1,x0=20,y0=36,y1=22,L=15,ex=x0+sx*Math.sin(a)*L,ey=y1-Math.cos(a)*L,dx=sx*Math.sin(a),dy=-Math.cos(a),px=-dy,py=dx,hx=ex+dx*5,hy=ey+dy*5;
 return `<svg viewBox="0 0 40 40" width="46" height="46"><path d="M${x0} ${y0}L${x0} ${y1}L${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${hx.toFixed(1)} ${hy.toFixed(1)}L${(ex+px*5.5).toFixed(1)} ${(ey+py*5.5).toFixed(1)}L${(ex-px*5.5).toFixed(1)} ${(ey-py*5.5).toFixed(1)}Z" fill="${col}"/></svg>`}
const hu0=hudUpdate;
hudUpdate=()=>{hu0();const Rc=RACE;if(!Rc||!Rc.cfg||!Rc.cfg.rally)return;
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!e.dataset.b)return;let el=e.querySelector('.h8pace');if(!el){el=document.createElement('div');el.className='h8pace';e.appendChild(el)}
  try{dashUpdate(Rc,c)}catch(e){if(!P._rdErr){P._rdErr=1;console.error('dash',e)}}
  if(Rc.state==='count'||Rc.cfg.circuit){el.style.opacity=0;if(el._t){el._t='';el.innerHTML=''}return}
  const n=note(c,Rc.T);let txt='',cls='';
  if(n.ev&&(!n.cor||n.ev.d<n.cor.d+15)){txt=`<b>${n.ev.t}</b><span>${Math.round(n.ev.d/10)*10} m</span>`;cls=n.ev.t==='NARROW'?'ev nr':'ev'}
  else if(n.cor){txt=`<i>${arrow(n.cor.t==='HAIRPIN'?'HAIRPIN':n.cor.g,n.cor.dir)}</i><b style="color:${(GR[n.cor.t==='HAIRPIN'?'HAIRPIN':n.cor.g]||GR[3])[1]}">${n.cor.t}</b><span>${Math.round(n.cor.d/10)*10} m</span>`;cls=n.cor.t==='HAIRPIN'?'hp':''}
  if(el._t!==txt){el._t=txt;el.innerHTML=txt}el.className='h8pace '+cls;el.style.opacity=txt?1:0})};

/* ---------------- rally controls: real gearboxes (shift keys), handbrake, camera ---------------- */
const REAL0={lr:6,ford:6,merc:7,ster:7,art:8,ferr:7,zen:7,must:6,urus:8,m8:8,amg:9,gtr:6,por:7,p1:7};const REAL=new Proxy(REAL0,{get:(t,k)=>t[k]||(P.BYID[k]&&P.BYID[k].real)||6});
const gtOrig={};
function gearTable(n){const R0=n<=2?2.2:n<=4?3.4:n===5?4.2:n===6?5.2:n===7?5.8:n===8?6.4:7.2,t=[];for(let i=0;i<n;i++){const u=n>1?i/(n-1):1;t.push({top:Math.pow(R0,-Math.pow(1-u,1.5)),acc:.66+.44*Math.pow(1-u,1.5)})}return t}
function rallyGears(on){on=true;for(const id in REAL){const car=BYID[id];if(!car)continue;const arr=P.GT(car);
 if(on){if(!gtOrig[id])gtOrig[id]=arr.map(g=>({top:g.top,acc:g.acc}));const t=gearTable(REAL[id]);arr.length=0;t.forEach(g=>arr.push(g))}
 else if(gtOrig[id]){arr.length=0;gtOrig[id].forEach(g=>arr.push(g));delete gtOrig[id]}}}
P.rallyGears=rallyGears;P.REALGEARS=REAL;
const RK=[{dn:'KeyQ',up:'KeyE',hb:'Space',cam:'KeyC',n:['Q','E','SPACE','C']},{dn:'PageUp',up:'PageDown',hb:'ShiftRight',cam:'Slash',n:['PG UP','PG DN','R-SHIFT','/']},{dn:'KeyU',up:'KeyO',hb:'KeyM',cam:'KeyP',n:['U','O','M','P']},{dn:'KeyR',up:'KeyY',hb:'KeyB',cam:'KeyV',n:['R','Y','B','V']}];
{const ia=P.isAuto;P.isAuto=c=>{if(c&&c.human&&RACE&&RACE.cfg&&RACE.cfg.rally&&S&&S.drv&&S.drv[S.i]){const v=P.TX[S.drv[S.i].p];if(v!==undefined&&v!==null)return !!v}return ia(c)}}
const MOVE=['W A S D','Arrow keys','I J K L','T F G H'];P.rallyP2=np=>{MOVE[1]=np?'Numpad 8 4 5 6':'Arrow keys';Object.assign(RK[1],np?{dn:'Numpad7',up:'Numpad9',n:['7','9',RK[1].n[2],RK[1].n[3]]}:{dn:'PageUp',up:'PageDown',n:['PG UP','PG DN',RK[1].n[2],RK[1].n[3]]});[RK[1].dn,RK[1].up].forEach(x=>GAME_KEYS.add(x))};
RK.forEach(k=>[k.dn,k.up,k.hb,k.cam].forEach(x=>GAME_KEYS.add(x)));
let curP=0;const camPref={};const CAMS=['CHASE','HOOD','FAR CHASE'];
P.rallyP2(P.p2Keys==='numpad');
const ctlHTML=p=>{const k=RK[Math.min(p,3)].n,multi=S&&S.drv&&S.drv.length>1;return `<div class="rl-ctl"><span><b>${MOVE[Math.min(p,3)]}</b>drive</span><span><b>${k[0]} / ${k[1]}</b>shift down / up</span>${multi?'':`<span><b>${k[2]}</b>handbrake</span>`}<span><b>${k[3]}</b>camera</span></div>`};
function shiftR(c,d){const car=c.cs||BYID.merc,G=P.GT(car),g=c.rg|0,n=Math.max(0,Math.min(G.length-1,g+d));if(n===g)return;
 const rr=c.sp/Math.max(1,(CIR()&&P.effTop?P.effTop(car,g)*1.03:car.top*G[g].top)*(c.mt?c.mt.top:1));if(d>0&&rr>=.8&&rr<=1.06){c.pb=1.1;c.perfect=1}else c.perfect=0;
 c.rg=n;c.gear=n;c.shiftT=.14;c.gearFlash=.9;if(P.sfx){P.sfx(d>0?'up':'dn');if(c.perfect)P.sfx('move')}}
function handbrakeFx(c,dt){if(!c._hb||c.sp<5||c.exp>0)return;const st=c.in?c.in.st:0;
 c.yaw+=st*Math.min(1,c.sp/16)*1.25*dt;const f=1-.18*dt;c.vx*=f;c.vz*=f;c.drifting=true}
addEventListener('keydown',e=>{const Rc=RACE;if(!Rc||!Rc.cfg||!Rc.cfg.rally||Rc.prep||Rc.replay||e.repeat||paused)return;const k=RK[curP],c=human(Rc);if(!c||c.forceAI||scr!=='game')return;
 if(e.code===k.cam){c.camMode=((c.camMode||0)+1)%CAMS.length;camPref[curP]=c.camMode;if(P.sfx)P.sfx('click');toast(CAMS[c.camMode])}
 else if((e.code===k.up||e.code===k.dn)&&Rc.state==='race'&&!c.fin&&!P.isAuto(c))shiftR(c,e.code===k.up?1:-1)});
let tEl=null,tH=0;function toast(t){if(!tEl){tEl=document.createElement('div');tEl.id='rlToast';document.body.appendChild(tEl)}tEl.textContent=t;tEl.style.opacity=1;clearTimeout(tH);tH=setTimeout(()=>{tEl.style.opacity=0},1100)}
/* tarmac at 200 mph: steering authority falls with speed so a tap stays a tap (lateral pull stays roughly constant above ~90 mph) */
{const ip0=P.inPost;P.inPost=(c,dt)=>{if(ip0)ip0(c,dt);const Rc=RACE;if(Rc&&Rc.cfg&&c.human&&!c.forceAI&&c.in&&c.sp>40)c.in.st*=Math.pow(40/c.sp,.85)}}
const so0=soloCam;
soloCam=(c,dt,out)=>{so0(c,dt,out);const Rc=RACE;if(!(Rc&&Rc.cfg&&Rc.cfg.rally&&c.human)||!c.camMode||c.fin)return;
 const m=c.camMode,sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
 if(m===1){out.p.set(c.x+sy*1.7,c.y+.14,c.z+cy*1.7);out.l.set(out.p.x+sy*30,out.p.y-.7,out.p.z+cy*30);out.f=78}
 else{const s_=Math.sin(c.cy),co=Math.cos(c.cy),d=13+c.sp*.12,h=5.2+c.sp*.04;out.p.set(c.x-s_*d,c.camY+h,c.z-co*d);out.l.set(c.x+s_*8,c.camY+1.2,c.z+co*8);out.f=62}};
const sh0=show;show=function(id){if(id!=='game'&&id!=='pause'&&(document.body.classList.contains('rallyhud')||(dash&&dash.style.display!=='none')))leaveFx();if(id==='menu')rallyGears(false);if(id!=='s8show')P._ro=false;return sh0.apply(this,arguments)};

/* ---------------- elevation profile ---------------- */
P.elevGraph=(T,w,h,at)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.className='rl-elev';P.elevDraw(cv,T,at);return cv};
P.elevDraw=(cv,T,at)=>{const g=cv.getContext('2d'),w=cv.width,h=cv.height,N=T.N,pad=6,top=14,bot=14;g.clearRect(0,0,w,h);
 let y0=1e9,y1=-1e9;for(let i=0;i<N;i++){if(T.y[i]<y0)y0=T.y[i];if(T.y[i]>y1)y1=T.y[i]}const span=Math.max(8,y1-y0),X=i=>pad+(w-2*pad)*i/N,Y=v=>h-bot-(h-top-bot)*(v-y0)/span;
 g.fillStyle='rgba(8,12,16,.72)';g.fillRect(0,0,w,h);
 const gr=g.createLinearGradient(0,top,0,h-bot);gr.addColorStop(0,'rgba(241,243,245,.55)');gr.addColorStop(1,'rgba(241,243,245,.06)');
 g.beginPath();g.moveTo(X(0),h-bot);for(let i=0;i<N;i+=2)g.lineTo(X(i),Y(T.y[i]));g.lineTo(X(N),Y(T.y[0]));g.lineTo(X(N),h-bot);g.closePath();g.fillStyle=gr;g.fill();
 g.beginPath();for(let i=0;i<=N;i+=2){const q=i%N;i?g.lineTo(X(i),Y(T.y[q])):g.moveTo(X(0),Y(T.y[0]))}g.strokeStyle='#f1f3f5';g.lineWidth=1.6;g.lineJoin='round';g.stroke();
 for(const q of T.pinch||[]){g.fillStyle='rgba(239,154,90,.35)';const a=X(q.i-q.core/2/T.sp),b=X(q.i+q.core/2/T.sp);g.fillRect(a,h-bot+2,Math.max(2,b-a),3)}
 for(const f of T.fords||[]){g.fillStyle='#7fc8ff';g.fillRect(X(f.i)-2,h-bot+2,4,4)}
 P.cpsOf(T).forEach((i,k)=>{g.strokeStyle='#7fe3f2';g.lineWidth=1;g.beginPath();g.moveTo(X(i),top-3);g.lineTo(X(i),h-bot);g.stroke();g.fillStyle='#7fe3f2';g.font='9px monospace';g.textAlign='center';g.fillText(k+1,X(i),top-5)});
 g.fillStyle='#9aa4ad';g.font='9px monospace';g.textAlign='left';g.fillText(Math.round(y1)+' m',pad+2,top+8);g.textAlign='right';g.fillText(Math.round(y0)+' m',w-pad-2,h-bot-3);g.textAlign='left';g.fillText('0',pad,h-3);g.textAlign='right';g.fillText((T.L/1000).toFixed(1)+' km',w-pad,h-3);
 if(at!=null){const i=((at%N)+N)%N,x=X(i),y=Y(T.y[Math.floor(i)]);g.fillStyle='#fff';g.strokeStyle='#05080b';g.lineWidth=2;g.beginPath();g.arc(x,y,4.2,0,7);g.fill();g.stroke()}};
let elT=0,elC=null;
function liveElev(Rc,dt){return;const c=human(Rc);if(!c||Rc.state==='done')return;elT-=dt;if(elT>0)return;elT=.25;
 if(!elC||elC._R!==Rc){if(!elC){elC=document.createElement('canvas');elC.id='rlElevLive';elC.width=360;elC.height=70;document.body.appendChild(elC)}elC._R=Rc}
 elC.style.display=(Rc.prep||Rc.replay||scr!=='game')?'none':'block';{const eh=document.getElementById('rdElev');if(eh&&elC.parentNode!==eh)eh.appendChild(elC)}P.elevDraw(elC,Rc.T,c.unw)}
/* ---------------- one-player dashboard (centre bottom) ---------------- */
let dash=null;const q$=id=>document.getElementById(id);
function mkDash(){if(dash)return dash;dash=document.createElement('div');dash.id='rlDash';
 dash.innerHTML=`<div class="rd-row"><div class="rd-side rd-l"><div class="rd-k"><small id="rdLbl">STAGE</small><b id="rdPct">0%</b><i class="rd-bar"><u id="rdBar"></u></i><em id="rdRem">-</em></div><div class="rd-k"><small>NEXT CHECKPOINT</small><b id="rdCp">-</b></div></div>
 <div class="rd-c"><canvas id="rdG" width="360" height="215"></canvas></div>
 <div class="rd-side rd-r"><div class="rd-k"><small>ALTITUDE</small><b id="rdAl">0 m</b></div><div class="rd-k"><small>SURFACE</small><b id="rdSf">-</b><em id="rdCm">-</em></div></div></div>
 <div class="rd-bars"><label>THR<i><u id="rdTh"></u></i></label><label>BRK<i><u id="rdBr"></u></i></label><label>HBK<i><u id="rdHk"></u></i></label><label>STR<i class="rd-st"><u id="rdSt"></u></i></label></div>`;
 document.body.appendChild(dash);return dash}
function drawGauge(cv,o){const g=cv.getContext('2d'),w=cv.width,h=cv.height,cx=w/2,cy=h*.5,R=h*.43,a0=Math.PI*(150/180),sw=Math.PI*(240/180);g.clearRect(0,0,w,h);
 g.fillStyle='rgba(8,12,16,.78)';g.beginPath();g.arc(cx,cy,R+16,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,R+16,0,7);g.stroke();
 const r=Math.min(1.04,o.rev),N=40;for(let i=0;i<=N;i++){const u=i/N,a=a0+sw*u,on=u<=r,c=u>.9?'#ff4d3d':u>.75?'#f2c76b':'#f1f3f5',big=i%5===0;g.strokeStyle=on?c:'rgba(255,255,255,.16)';g.lineWidth=big?3.4:2.2;const r1=R-(big?12:8),r2=R+2;g.beginPath();g.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);g.stroke()}
 g.beginPath();g.arc(cx,cy,R-18,a0,a0+sw*Math.min(1,r));g.strokeStyle=r>.9?'#ff4d3d':r>.75?'#f2c76b':'#f1f3f5';g.lineWidth=5;g.lineCap='round';g.stroke();g.lineCap='butt';
 g.textAlign='center';g.fillStyle='#fff';g.font='bold 54px monospace';g.fillText(String(o.kmh).padStart(3,'0'),cx,cy+6);g.font='bold 11px monospace';g.fillStyle='#9aa4ad';g.fillText('MPH',cx,cy+24);
 g.font='bold 10px monospace';g.fillText('GEAR',cx,cy+R*.62-14);g.font='bold 40px monospace';g.fillStyle=o.flash?'#7fe3f2':'#fff';g.fillText(o.gear,cx,cy+R*.62+22);
 for(let i=0;i<o.NG;i++){const x=cx+(i-(o.NG-1)/2)*11,y=cy+R*.62+34;g.fillStyle=i===o.gi?'#fff':i<o.gi?'rgba(255,255,255,.4)':'rgba(255,255,255,.14)';g.fillRect(x-3.5,y-(i===o.gi?7:4),7,i===o.gi?7:4)}
 if(o.shift){const px=cx,py=cy-R*.5,pu=.75+.25*Math.sin(performance.now()/260);g.fillStyle='rgba(255,60,48,'+(.22*pu)+')';g.beginPath();g.arc(px,py,13,0,7);g.fill();g.fillStyle='#ff3b30';g.beginPath();g.arc(px,py,6.5,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.2;g.beginPath();g.arc(px,py,6.5,0,7);g.stroke()}}
/* damage and penalty plates sit right of the top-left clock: damage first, penalty under it (or at the top when there is no damage) */
let stEl=null;
function statUpdate(Rc,c){if(!stEl){stEl=document.createElement('div');stEl.id='rlStat';document.body.appendChild(stEl)}
 const dv=Math.round((c.dmg||0)*100),pen=Rc.pen||0;if(!dv&&!pen){stEl.style.display='none';stEl._k='';return}
 const key=dv+'|'+pen;if(stEl._k!==key){stEl._k=key;const plate=(l,v,sub,col)=>`<div class="h8top"><div class="h8plate"><div class="lap">${l}</div><div class="raceTime" style="${col?'color:'+col:''}">${v}</div><div class="bl" style="${col?'color:'+col:''}">${sub}</div></div></div>`;
  stEl.innerHTML=(dv?plate('DAMAGE',dv+'%','',dv>=50?'#ef6a5a':dv>=20?'#f2c76b':''):'')+(pen?plate('PENALTY','+'+pen.toFixed(1)+' s',(Math.round(pen/5))+' CUT'+(pen>5?'S':''),'#ef6a5a'):'')}
 const ht=document.querySelector('#h0 .h8top');if(ht){const rc=ht.getBoundingClientRect();stEl.style.left=(rc.right+8)+'px';stEl.style.top=rc.top+'px';stEl.style.setProperty('--pw',ht.offsetWidth+'px');stEl.style.setProperty('--ph',ht.offsetHeight+'px');const pv=ht.parentNode.style.getPropertyValue('--s');if(pv)stEl.style.setProperty('--s',pv)}else{stEl.style.left='210px';stEl.style.top='12px'}
 stEl.style.display='flex'}
function dashUpdate(Rc,c){const d=mkDash(),on=scr==='game'&&!Rc.prep&&!Rc.replay&&!c.fin;d.style.display=on?'flex':'none';bodyCls('rallyhud',on);if(!on){if(stEl)stEl.style.display='none';return}
 const T=Rc.T,car=c.cs||BYID.merc,G=P.GT(car),gi=Math.min(c.gear|0,G.length-1),mt=(c.mt&&c.mt.top)||1,lim=(CIR()&&P.effTop?P.effTop(car,gi)*1.03:car.top*G[gi].top)*mt,rev=.2+.8*Math.min(1.05,c.sp/Math.max(1,lim)),kmh=Math.round(c.sp*2.23694),N=T.N;
 drawGauge(q$('rdG'),{rev,kmh,gear:gi+1,gi,NG:G.length,lim:Math.round(lim*2.23694),flash:c.gearFlash>0,shift:rev>.9&&gi<G.length-1&&Rc.state==='race'&&!P.isAuto(c)});
 const tot=N*Rc.laps,pr=Math.max(0,Math.min(1,c.unw/tot));q$('rdPct').textContent=Math.round(pr*100)+'%';q$('rdBar').style.width=pr*100+'%';q$('rdRem').textContent=Math.max(0,(tot-c.unw)*T.sp/1000).toFixed(1)+' km left';
 const cps=P.cpsOf(T),K=cps.length,n=(Rc.splits||[]).length,lapI=Math.floor(n/K);let cpT='FINISH',cd=(Rc.laps*N-c.unw)*T.sp;if(lapI<Rc.laps&&K&&n<K*Rc.laps){cpT='CP '+(n%K+1)+' / '+(K+1);cd=(lapI*N+cps[n%K]-c.unw)*T.sp}q$('rdCp').textContent=cpT+'  '+Math.max(0,Math.round(cd))+' m';
 const i0=c.idx||0;q$('rdAl').textContent=Math.round(c.y)+' m';
 q$('rdLbl').textContent=W('STAGE','RACE');q$('rdSf').textContent=c._wet>0?'WET':c.onRoad?W('GRAVEL','TARMAC'):W('OFF ROAD','GRASS');q$('rdCm').textContent='CAM / '+CAMS[c.camMode||0]+'  GRIP '+Math.round(((c.mt&&c.mt.grip)||1)*100)+'%';
 q$('rdTh').style.width=(c.in&&c.in.th||0)*100+'%';q$('rdBr').style.width=(c.in&&c.in.br||0)*100+'%';q$('rdHk').style.width=(c._hb?100:0)+'%';{const st=c.in?c.in.st:0;const u=q$('rdSt');u.style.width=Math.abs(st)*50+'%';u.style.left=st>=0?(50-Math.abs(st)*50)+'%':'50%'}
 statUpdate(Rc,c);
}
/* ---------------- take-turns session ---------------- */
const lh=P.launch;
const KMo=KM.map(k=>Object.assign({},k));
const keysFor=p=>{Object.assign(KM[0],KMo[0])};
const keysReset=()=>{Object.assign(KM[0],KMo[0])};
const $i=id=>document.getElementById(id);
const fade=document.createElement('div');fade.id='rlFade';document.body.appendChild(fade);
const dipEl=document.createElement('div');dipEl.id='rlDip';document.body.appendChild(dipEl);
const fadeTo=(a,ms)=>new Promise(r=>{fade.style.transitionDuration=ms+'ms';fade.style.opacity=a;setTimeout(r,ms+30)});
const dip=()=>{dipEl.style.transition='none';dipEl.style.opacity=.9;requestAnimationFrame(()=>requestAnimationFrame(()=>{dipEl.style.transition='opacity .6s';dipEl.style.opacity=0}))};
const human=Rc=>Rc&&Rc.cars.find(q=>q.human);
const fmt=t=>P.fmtT(t);
const bodyCls=(c,on)=>document.body.classList.toggle(c,on);
P.launch=cfg=>{
 if(cfg.mode==='rally'&&!cfg.rally){startSession(cfg);return}
 if(!cfg.rally){keysReset();S=null;leaveFx()}
 lh(cfg)};
function leaveFx(){if(stEl)stEl.style.display='none';if(elC)elC.style.display='none';if(dash)dash.style.display='none';bodyCls('rallyhud',false);rallyGears(false);bodyCls('rprep',false);bodyCls('rreplay',false);const a=$i('rlPrep'),b=$i('rlRep'),c=$i('rlCp');if(a)a.style.display='none';if(b)b.style.display='none';if(c)c.style.opacity=0}
function startSession(cfg){const hs=cfg.humans;
 S={cfg,drv:hs.map((h,i)=>({name:(h.name||'P'+(i+1)).slice(0,12),id:h.id,alt:h.alt,p:i,time:null,best:null,laps:[],medal:-1,splits:[]})),i:0,ref:null,refT:1e9};
 if(S.drv.length>1)briefing(0);else turn(0)}
async function turn(i){S.i=i;const d=S.drv[i],cfg=S.cfg;keysFor(d.p);curP=0;rallyGears(true);
 await fadeTo(1,450);
 lh(Object.assign({},cfg,{mode:'mp',rally:true,rallyTurn:i,humans:[{id:d.id,alt:d.alt,name:d.name}],ai:[],grid:'fixed'}));
 enterPrep(d,i);
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 await fadeTo(0,800)}
const box=()=>$i('resBox');
const keyHint=p=>['W A S D',P.p2Keys==='numpad'?'numpad 8 4 5 6':'arrow keys','I J K L','T F G H'][p]||'';
const quitRally=()=>{S=null;keysReset();leaveFx();P.cleanupRace();show('menu')};
function briefing(i){const d=S.drv[i],car=BYID[d.id],st=D[S.cfg.track];paused=true;
 box().innerHTML=`<h1>UP NEXT</h1><div class="sub">${st.name.toUpperCase()} &middot; ${S.cfg.laps} LAP${S.cfg.laps>1?'S':''} &middot; RUN ${i+1} OF ${S.drv.length}</div>
 <div class="rl-pass"><span class="rl-dot" style="background:${PCOL[d.p%4]}"></span><b>${d.name.replace(/</g,'')}</b><small>${car.name}${d.alt?' ALT':''} &middot; ${keyHint(0)}</small></div>
 ${i?standingsHTML(false):''}
 ${ctlHTML(0)}
 <div class="rl-note">Pass the controller. Fastest total time wins; the ${W('stage','circuit')} is the same for everyone.</div>
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlGo"><span>Ready</span></button><button class="btn" id="rlQuit"><span>${W('Quit rally','Quit track')}</span></button></div>`;
 show('s8res');$i('rlGo').onclick=()=>{turn(i)};$i('rlQuit').onclick=quitRally}
function sorted(){return S.drv.filter(d=>d.time!=null).sort((a,b)=>a.time-b.time)}
function standingsHTML(fin){const done=sorted(),lead=done.length?done[0].time:0;
 return P.lbHTML(done.map((d,i)=>({place:i+1,name:d.name.replace(/</g,''),car:BYID[d.id].name,time:d.time,best:d.best,col:PCOL[d.p%4],human:true,medal:d.medal,gap:fin&&i?'+'+(d.time-lead).toFixed(2):''})),{mode:'rally'})}
const splitsHTML=d=>(d.pen?`<div class="rl-note">CUT PENALTIES / +${d.pen.toFixed(1)} s (${Math.round(d.pen/5)} cut${d.pen>5?'s':''}) included in the time</div>`:'')+(d.splits&&d.splits.length?`<div class="rl-spl">${d.splits.map((t,k)=>`<span>CP${k+1}<b>${fmt(t)}</b></span>`).join('')}</div>`:'');
const sr0=P.showResults;
P.showResults=function(){const Rc=RACE;if(!(Rc&&Rc.cfg&&Rc.cfg.rally&&S))return sr0.apply(this,arguments);
 const c=human(Rc),d=S.drv[S.i];d.pen=Rc.pen||0;d.time=c&&c.fin?c.finT+d.pen:null;d.laps=(c&&c.lapT)||[];d.best=d.laps.length?Math.min(...d.laps):null;d.splits=(Rc.splits||[]).slice();
 if(d.time==null){d.time=((c&&c.finT)||9999)+d.pen}
 const sv=P.SV(),key=S.cfg.track+':'+S.cfg.laps;sv.ral=sv.ral||{};const rec=sv.ral[key];
 if(!rec||d.time<rec.t){sv.ral[key]={t:d.time,s:d.splits};P.save();d.pb=true}
 if(d.time<S.refT){S.refT=d.time;S.ref=d.splits}
 leaveFx();bodyCls('rreplay',false);
 if(S.i+1<S.drv.length)interim();else finish()};
const replayBtn=()=>RACE&&RACE.rec&&RACE.rec.length>30?'<button class="btn" id="rlRep1"><span>Watch replay</span></button>':'';
function interim(){const d=S.drv[S.i],pos=sorted().indexOf(d)+1;paused=true;
 box().innerHTML=`<h1>RUN COMPLETE</h1><div class="sub">${d.name.toUpperCase().replace(/</g,'')} &middot; ${fmt(d.time)} &middot; ${pos===1?'LEADING':'P'+pos+' SO FAR'}</div>${d.pb?'<span class="goal ok">NEW '+W('STAGE','TRACK')+' RECORD</span>':''}${standingsHTML(false)}${splitsHTML(d)}
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlNext"><span>Next: ${S.drv[S.i+1].name.replace(/</g,'')}</span></button>${replayBtn()}<button class="btn" id="rlQuit"><span>${W('Quit rally','Quit track')}</span></button></div>`;
 show('s8res');$i('rlNext').onclick=()=>briefing(S.i+1);$i('rlQuit').onclick=quitRally;const r=$i('rlRep1');if(r)r.onclick=()=>startReplay(interim)}
function finish(){const sv=P.SV(),cfg=S.cfg,tr=cfg.track,tk=tr,rec=sv.ta[tk]||(sv.ta[tk]={}),order=sorted(),N=S.drv.length,pay=[];let total=0,notes=[];
 keysReset();
 const FR=[1,.6,.4,.3];
 order.forEach((d,i)=>{const car=BYID[d.id],base=P.raceBase(Math.max(3,cfg.laps*4),car),fr=N===1?.75:FR[Math.min(i,3)],cr=Math.round(base*fr);pay.push({l:d.name+(N>1?' / '+P.ord(i+1)+' PLACE':W(' / STAGE CLEARED',' / RACE COMPLETE')),v:cr});total+=cr;
  const m=P.medalFor(tk,car,d.time/cfg.laps);d.medal=m>=0&&m<P.MEDALS.length?m:-1;const prevM=rec.medal==null?P.MEDALS.length:rec.medal;
  if(d.medal>=0&&d.medal<prevM){let g=0;for(let q=d.medal;q<prevM&&q<P.MEDALS.length;q++)g+=P.MEDALS[q].cr;pay.push({l:d.name+' / '+P.MEDALS[d.medal].n+' MEDAL',v:g});total+=g;rec.medal=d.medal}
  if(d.best!=null&&(rec.best==null||d.best<rec.best)){rec.best=d.best;notes.push('NEW '+W('STAGE','TRACK')+' BEST LAP '+fmt(d.best)+(N>1?' / '+d.name:''))}
  if(d.pb)notes.push(W('STAGE','TRACK')+' RECORD '+fmt(d.time)+(N>1?' / '+d.name:''));
  if(rec.total==null||d.time<rec.total)rec.total=d.time});
 P.earn(total);sv.stats.races++;if(N>1)sv.stats.wins++;P.save();
 const win=order[0];S.fin={pay,total,notes,win};showFinal()}
function showFinal(){const sv=P.SV(),cfg=S.cfg,tr=cfg.track,F=S.fin,N=S.drv.length,win=F.win;paused=true;
 box().innerHTML=`<h1>${N>1?W('RALLY RESULT','TRACK RESULT'):W('STAGE COMPLETE','RACE COMPLETE')}</h1><div class="sub">${D[tr].name.toUpperCase()} &middot; ${cfg.laps} LAP${cfg.laps>1?'S':''}${N>1?' &middot; WINNER '+win.name.toUpperCase().replace(/</g,''):''}</div>
 ${F.notes.map(n=>`<span class="goal ok">${n}</span>`).join('')}${standingsHTML(true)}${N===1?splitsHTML(win):''}
 <div>${F.pay.map(p=>`<div class="pay"><span>${p.l}</span><span>+${P.fmtCr(p.v)}</span></div>`).join('')}<div class="pay tot"><span>Total earned</span><span>+${P.fmtCr(F.total)}</span></div><div class="pay"><span>Balance</span><span>${P.fmtCr(sv.cr)}</span></div></div>
 <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rlAgain"><span>${W('Run it again','Race again')}</span></button>${replayBtn()}<button class="btn" id="rlSetup"><span>${W('Stage select','Circuit select')}</span></button><button class="btn" id="rlBrand"><span>Brand Central</span></button><button class="btn" id="rlMenu"><span>Main menu</span></button></div>`;
 show('s8res');
 $i('rlAgain').onclick=()=>{P.cleanupRace();startSession(S.cfg)};
 $i('rlSetup').onclick=()=>{leaveFx();P.cleanupRace();S=null;P.ui.renderSetup();show('s8setup')};
 $i('rlBrand').onclick=()=>{leaveFx();P.cleanupRace();S=null;P.ui.openShow('brand',{player:0,cap:null,ret:'s8res_back'})};
 $i('rlMenu').onclick=()=>{leaveFx();P.cleanupRace();S=null;show('menu')};
 const r=$i('rlRep1');if(r)r.onclick=()=>startReplay(showFinal)}

/* ---------------- collisions and damage: trees, rocks and posts hurt; a hurt car smokes, pulls and loses power ---------------- */
function crashStep(Rc,dt){const c=human(Rc);if(!c)return;const T=Rc.T;if(!T.solids||Rc.state!=='race'||c.fin||c.respT>0||c.exp>0)return;
 if(!T._sg){const g=new Map();T.solids.forEach(s=>{const k=Math.floor(s[0]/8)+','+Math.floor(s[1]/8);if(!g.has(k))g.set(k,[]);g.get(k).push(s)});T._sg=g}
 c.cdT=(c.cdT||0)-dt;const cx=Math.floor(c.x/8),cz=Math.floor(c.z/8);
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=T._sg.get((cx+a)+','+(cz+b));if(!l)continue;
  for(const s of l){const dx=c.x-s[0],dz=c.z-s[1],d=Math.hypot(dx,dz),R=s[2]+1.05;if(d>=R||d<.001)continue;const nx=dx/d,nz=dz/d,vn=c.vx*nx+c.vz*nz;
   if(Math.abs(c.y-(T.terr?T.terr(s[0],s[1]):c.y))>3.5)continue;c.x+=nx*(R-d);c.z+=nz*(R-d);
   if(vn<0){c.vx-=1.28*vn*nx;c.vz-=1.28*vn*nz;c.vx*=.82;c.vz*=.82;if(-vn>2.2&&c.cdT<=0){c.cdT=.7;hurt(Rc,c,-vn,nx,nz)}}}}}
function hurt(Rc,c,v,nx,nz){if(P.hitFx)P.hitFx(Rc,c,v,c.x-nx*.9,c.y+.35,c.z-nz*.9,nx,nz);if(!P.dmgOn(Rc)){Rc.shake=Math.max(Rc.shake||0,Math.min(1,v/16));if(P.sfx)P.sfx('crash');return}if(v<4){if(P.sfx&&v>2.6)P.sfx('crash');return}const was=c.dmg||0,add=Math.min(.5,Math.pow((v-3.5)/24,1.5)*.9);c.dmg=Math.min(1,was+add);c.hits=(c.hits||0)+1;Rc.shake=Math.max(Rc.shake||0,Math.min(1.2,v/14));
 c.yaw+=(Math.random()<.5?-1:1)*Math.min(.5,v*.02);if(!c._pull)c._pull=(Math.random()<.5?-1:1);
 if(P.sfx)P.sfx('crash');const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
 for(let k=0;k<10;k++)P.puff(c.x-nx*1.1,c.y+.2,c.z-nz*1.1,-nx*rnd(1,6)+rnd(-2,2),rnd(1,5),-nz*rnd(1,6)+rnd(-2,2),k%2?[1,.7,.2]:[.55,.5,.45],rnd(.12,.3),rnd(.4,.9),.95,14);
 if(c.dmg>=1&&!(c.exp>0)&&window.__explode)window.__explode(c,'dmg')}
P.hurt=(Rc,c,v,nx,nz)=>hurt(Rc,c,v,nx,nz);P.smokeFx=(c,Rc,dt)=>smokeFx(c,Rc,dt);P.statUpdate=(Rc,c)=>statUpdate(Rc,c);
function smokeFx(c,Rc,dt){const dm=c.dmg||0;if(dm<.18||c.exp>0||c.respT>0)return;const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);
 const rate=(4+dm*26)*(c.sp>3?1:.6);c._smA=(c._smA||0)+dt*rate;
 while(c._smA>=1){c._smA--;const dark=Math.min(1,(dm-.18)/.6),g=.62-.5*dark,hot=dm>.75;
  P.puff(c.x+sy*1.15+rnd(-.35,.35),c.y+.55,c.z+cy*1.15+rnd(-.35,.35),c.vx*.55+rnd(-.5,.5),rnd(1.2,2.6)+dark*1.2,c.vz*.55+rnd(-.5,.5),[g,g,g*1.02],rnd(.7,1.3)*(1+dark*.9),rnd(1.1,1.8)+dark*.8,.34+dark*.3,-.35);
  if(hot&&Math.random()<.35)P.puff(c.x+sy*1.6,c.y+.35,c.z+cy*1.6,c.vx*.5+rnd(-1,1),rnd(2,4),c.vz*.5+rnd(-1,1),[1,.55,.12],rnd(.12,.24),rnd(.5,.9),.9,-3)}
 /* damaged steering alignment: the car pulls to one side */
 if(dm>.25&&c.sp>8&&Rc.state==='race'&&!c.fin)c.yaw+=(c._pull||1)*dm*.045*Math.min(1,c.sp/30)*dt*8}
/* ---------------- cut penalty: running well off the road and gaining ground adds time ---------------- */
const CUT={gain:30,pen:5,cool:8};
function cutCheck(Rc,dt){const c=human(Rc);if(!c||Rc.state!=='race'||c.fin||c.respT>0||c.exp>0)return;const T=Rc.T,N=T.N,i=c.idx||0;
 const lat=(c.x-T.x[i])*Math.cos(T.psi[i])-(c.z-T.z[i])*Math.sin(T.psi[i]),off=Math.abs(lat)>T.hw[i]+2.5&&!c.onRoad,k=Rc.cut||(Rc.cut={last:c.unw,acc:0,ok:0,cd:0,n:0});
 const d=(c.unw-k.last)*T.sp;k.last=c.unw;if(k.cd>0)k.cd-=dt;
 let air=0;for(const w of c.m.wheels)if(!w.g)air++;
 if(off&&air<3){if(d>0&&d<20)k.acc+=d;k.ok=0}else{k.ok+=dt;if(k.ok>1.5)k.acc=0}
 if(k.acc>=CUT.gain&&k.cd<=0){k.acc=0;k.cd=CUT.cool;k.n++;Rc.pen=(Rc.pen||0)+CUT.pen;toast('CUT / +'+CUT.pen.toFixed(1)+' s PENALTY');if(P.sfx)P.sfx('back')}}
/* ---------------- checkpoints ---------------- */
function cpBox(){let e=$i('rlCp');if(!e){e=document.createElement('div');e.id='rlCp';document.body.appendChild(e)}return e}
function cpCheck(Rc){const c=human(Rc);if(!c||Rc.state!=='race'||c.fin)return;const T=Rc.T,cps=P.cpsOf(T),K=cps.length,N=T.N;if(!K)return;
 Rc.splits=Rc.splits||[];const n=Rc.splits.length,lapI=Math.floor(n/K);if(lapI>=Rc.laps)return;const target=lapI*N+cps[n%K];
 if(c.unw>=target&&c.unw<target+N*.45){Rc.splits.push(Rc.t+(Rc.pen||0));
  const sv=P.SV(),saved=sv.ral&&sv.ral[Rc.cfg.track+':'+Rc.cfg.laps],ref=(S&&S.ref)||(saved&&saved.s)||null,rt=ref&&ref[n];
  const el=cpBox(),k=n%K+1,lab=Rc.laps>1?` &middot; LAP ${lapI+1}`:'';
  let dl='';if(rt!=null){const dd=Rc.t+(Rc.pen||0)-rt;dl=`<em class="${dd<=0?'ok':'bad'}">${dd<=0?'-':'+'}${Math.abs(dd).toFixed(2)}</em>`}
  const ht=document.querySelector('#h0 .h8top');if(ht){const rc=ht.getBoundingClientRect();el.style.left=rc.left+'px';el.style.top=(rc.bottom+6)+'px';el.style.setProperty('--pw',ht.offsetWidth+'px');el.style.setProperty('--ph',ht.offsetHeight+'px');const pv=ht.parentNode.style.getPropertyValue('--s');if(pv)el.style.setProperty('--s',pv)}else{el.style.left='16px';el.style.top='84px'}
  el.innerHTML=`<div class="h8top"><div class="h8plate"><div class="lap">CHECKPOINT ${k} / ${K+1}${lab}</div><div class="raceTime">${fmt(Rc.t+(Rc.pen||0))}</div><div class="bl" style="${rt!=null?'color:'+(Rc.t+(Rc.pen||0)-rt<=0?'#7fd68a':'#ef6a5a'):''}">${rt!=null?'SPLIT '+(Rc.t+(Rc.pen||0)-rt<=0?'-':'+')+Math.abs(Rc.t+(Rc.pen||0)-rt).toFixed(2):'SPLIT --'}</div></div></div>`;el.style.opacity=1;clearTimeout(el._h);el._h=setTimeout(()=>{el.style.opacity=0},3800);
  if(c.human)P.sfx&&P.sfx('select')}}

/* ---------------- prep: start-line scene with free cameras until Play ---------------- */
const prepCam=new THREE.PerspectiveCamera(48,1,.2,3500);
function enterPrep(d,i){const Rc=RACE;if(!Rc)return;Rc.prep=true;Rc.prepT=0;Rc.shot0=(Math.random()*5)|0;Rc.shot=-1;const T=Rc.T,st=T.d,cps=P.cpsOf(T);
 let e=$i('rlPrep');if(!e){e=document.createElement('div');e.id='rlPrep';document.body.appendChild(e)}
 const car=BYID[d.id],wx=Rc.wx?Rc.wx.n:'Clear',tod=(P.TOD&&Rc.todKey&&P.TOD[Rc.todKey])?P.TOD[Rc.todKey].n:'';
 e.innerHTML=`<div class="rp-l"><small>${W('RALLY','TRACK')} &middot; ${S.drv.length>1?'RUN '+(i+1)+' OF '+S.drv.length:'SOLO RUN'}</small><h2>${st.name}</h2><div class="rp-c"><span>${(T.L/1000).toFixed(1)} km</span><span>${S.cfg.laps} lap${S.cfg.laps>1?'s':''}</span><span>${cps.length} checkpoints</span>${T.fords&&T.fords.length?`<span class="hot">${T.fords.length} fords</span>`:''}${T.jumps&&T.jumps.length?'<span>jump</span>':''}<span>${wx}</span></div>${ctlHTML(0)}<div class="rp-d"><i style="background:${PCOL[d.p%4]}"></i><b>${d.name.replace(/</g,'')}</b><small>${car.name}${d.alt?' ALT':''} &middot; ${keyHint(0)}</small></div></div>
 <div class="rp-r"><button class="btn go" id="rlPlay"><span>${W('Start stage','Start race')}</span></button><small>Enter to start &middot; Esc to leave</small></div>`;
 e.style.display='flex';bodyCls('rprep',true);$i('rlPlay').onclick=startStage}
function startStage(){const Rc=RACE;if(!Rc||!Rc.prep)return;const hc=human(Rc);if(hc)hc.camMode=camPref[curP]||0;Rc.prep=false;bodyCls('rprep',false);const e=$i('rlPrep');if(e)e.style.display='none';dip();beep(700,.1)}
function prepDraw(Rc,dt){const c=human(Rc),W=R.domElement.width,H=R.domElement.height;Rc.prepT+=dt;
 const sh=Math.floor(Rc.prepT/6),u=(Rc.prepT%6)/6,e=u*u*(3-2*u);if(sh!==Rc.shot){Rc.shot=sh;if(sh>0)dip()}
 const sy=Math.sin(c.yaw),cy=Math.cos(c.yaw),fx=sy,fz=cy,lx=cy,lz=-sy,g0=c.y-.6,T0_=Rc.prepT,k=(sh+Rc.shot0)%5,mix=(a,b,t)=>a+(b-a)*t;let p,l,fov=48;
 if(k===0){const a=T0_*.3+1;p=[c.x+Math.sin(a)*7.8,g0+2.3,c.z+Math.cos(a)*7.8];l=[c.x,g0+.9,c.z]}
 else if(k===1){const lat=mix(6.5,-6.5,e);p=[c.x+fx*9+lx*lat,g0+.8,c.z+fz*9+lz*lat];l=[c.x+fx*1.4,g0+.7,c.z+fz*1.4];fov=44}
 else if(k===2){const b=mix(12,36,e),lt=mix(-4,6,e);p=[c.x-fx*b+lx*lt,g0+mix(1.6,16,e),c.z-fz*b+lz*lt];const a=mix(2,28,e);l=[c.x+fx*a,g0+mix(1,3,e),c.z+fz*a];fov=52}
 else if(k===3){const a=mix(-13,11,e);p=[c.x+lx*8+fx*a,g0+1.4,c.z+lz*8+fz*a];l=[c.x+fx*mix(-4,3,e),g0+.8,c.z+fz*mix(-4,3,e)];fov=42}
 else{const a=mix(2.8,1.3,e);p=[c.x+lx*3.2+fx*a,g0+.55,c.z+lz*3.2+fz*a];l=[c.x+lx*.9+fx*1.7,g0+.45,c.z+lz*.9+fz*1.7];fov=36}
 const gh=Rc.T.surf(p[0],p[2],p[1]+2).h+.5;if(p[1]<gh)p[1]=gh;
 prepCam.position.set(p[0],p[1],p[2]);prepCam.lookAt(l[0],l[1],l[2]);prepCam.fov=fov;prepCam.aspect=Math.max(.1,W/H);prepCam.updateProjectionMatrix();
 R.setScissorTest(false);R.setViewport(0,0,W,H);R.clear();R.render(Rc.scene,prepCam)}

/* ---------------- replay ---------------- */
const rcam=new THREE.PerspectiveCamera(60,1,.2,3500);
function record(Rc){if(Rc.state!=='race')return;const c=human(Rc);if(!c)return;let m=0;c.m.wheels.forEach((w,i)=>{if(w.g)m|=1<<i});
 (Rc.rec=Rc.rec||[]).push([Rc.t,c.x,c.y,c.z,c.yaw,c.pitch,c.roll,c.vx,c.vy,c.vz,c.st,c.sp,c.idx,c.in&&c.in.br||0,m,c.onRoad?1:0,c.drifting?1:0])}
let replayBack=null;
function startReplay(back){const Rc=RACE;if(!Rc||!Rc.rec||Rc.rec.length<30)return;replayBack=back;const c=human(Rc);
 Rc.replay={t:Rc.rec[0][0],speed:1,cam:0,paused:false,tv:null,tvs:1};c.fin=0;c.respT=0;c.exp=0;paused=false;
 let e=$i('rlRep');if(!e){e=document.createElement('div');e.id='rlRep';document.body.appendChild(e)}
 e.innerHTML=`<div class="rr-top"><b>REPLAY</b><span id="rrCam">CHASE</span></div><div class="rr-bar" id="rrBar"><i id="rrFill"></i></div><div class="rr-btns"><button id="rrPlay">Pause</button><button data-s=".25">.25x</button><button data-s=".5">.5x</button><button data-s="1" class="on">1x</button><button data-s="2">2x</button><button data-s="4">4x</button><button id="rrCamB">Camera</button><button id="rrRst">Restart</button><button id="rrExit">Done</button></div>`;
 e.style.display='block';bodyCls('rreplay',true);show('game');
 const R_=Rc.replay;
 $i('rrPlay').onclick=()=>{R_.paused=!R_.paused;$i('rrPlay').textContent=R_.paused?'Play':'Pause'};
 e.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{R_.speed=+b.dataset.s;e.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b))});
 $i('rrCamB').onclick=cycleCam;$i('rrRst').onclick=()=>{R_.t=Rc.rec[0][0];R_.paused=false;$i('rrPlay').textContent='Pause'};$i('rrExit').onclick=exitReplay;
 $i('rrBar').onclick=ev=>{const r=$i('rrBar').getBoundingClientRect(),f=(ev.clientX-r.left)/r.width,t0=Rc.rec[0][0],t1=Rc.rec[Rc.rec.length-1][0];R_.t=t0+(t1-t0)*Math.min(1,Math.max(0,f))}}
const CAMN=['CHASE','HOOD','TV','HELI'];
function cycleCam(){const Rc=RACE;if(!Rc||!Rc.replay)return;Rc.replay.cam=(Rc.replay.cam+1)%CAMN.length;Rc.replay.tv=null;$i('rrCam').textContent=CAMN[Rc.replay.cam];dip()}
function exitReplay(){const Rc=RACE;if(!Rc||!Rc.replay)return;Rc.replay=null;bodyCls('rreplay',false);const e=$i('rlRep');if(e)e.style.display='none';paused=true;stopEng&&stopEng();const b=replayBack;replayBack=null;if(b)b()}
function replayTick(Rc,dt){const R_=Rc.replay,c=human(Rc),rec=Rc.rec,t0=rec[0][0],t1=rec[rec.length-1][0];
 if(!R_.paused)R_.t+=dt*R_.speed;if(R_.t>=t1){R_.t=t1;if(!R_.paused){R_.paused=true;$i('rrPlay').textContent='Play'}}
 let lo=0,hi=rec.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(rec[m][0]<=R_.t)lo=m;else hi=m}
 const a=rec[lo],b=rec[Math.min(rec.length-1,lo+1)],u=b[0]>a[0]?Math.min(1,Math.max(0,(R_.t-a[0])/(b[0]-a[0]))):0,L=i=>a[i]+(b[i]-a[i])*u,A=i=>a[i]+wrp(b[i]-a[i])*u;
 c.x=L(1);c.y=L(2);c.z=L(3);c.yaw=A(4);c.pitch=A(5);c.roll=A(6);c.vx=L(7);c.vy=L(8);c.vz=L(9);c.st=L(10);c.sp=L(11);c.idx=a[12];c.in={th:1,br:a[13],st:0,hb:0};c.onRoad=!!a[15];c.drifting=!!a[16];c.respT=0;c.exp=0;c.dts=0;c.fin=0;
 c.m.wheels.forEach((w,i)=>{w.g=!!(a[14]&(1<<i));w.s={h:c.y-1,road:c.onRoad}});
 Rc.shake=0;try{updateVisual(c,Rc.T,T0);fxStep(c,Rc,R_.paused?0:dt*R_.speed)}catch(e){}
 if(!R_.paused&&P.dustTick)P.dustTick(Rc,dt*R_.speed);
 const f=$i('rrFill');if(f)f.style.width=(100*(R_.t-t0)/Math.max(.01,t1-t0))+'%'}
function replayDraw(Rc,dt){const R_=Rc.replay,c=human(Rc),W=R.domElement.width,H=R.domElement.height,T=Rc.T,sy=Math.sin(c.yaw),cy=Math.cos(c.yaw);let p,l,fov=60;
 if(R_.cam===1){p=[c.x+sy*1.7,c.y+.14,c.z+cy*1.7];l=[p[0]+sy*20,p[1]-.5,p[2]+cy*20];fov=74}
 else if(R_.cam===2){const near=R_.tv&&Math.hypot(c.x-R_.tv[0],c.z-R_.tv[2])<150&&((c.x-R_.tv[0])*sy+(c.z-R_.tv[2])*cy)<32;
  if(!near){const j=(c.idx+Math.round(60/T.sp))%T.N;R_.tvs=-R_.tvs;const o=T.hw[j]+8+Math.random()*5;R_.tv=[T.x[j]+Math.cos(T.psi[j])*R_.tvs*o,T.y[j]+2.4+Math.random()*2.5,T.z[j]-Math.sin(T.psi[j])*R_.tvs*o]}
  p=R_.tv;l=[c.x,c.y+.4,c.z];fov=36}
 else{const a=performance.now()*.00018;p=[c.x+Math.sin(a)*40,c.y+26,c.z+Math.cos(a)*40];l=[c.x+sy*6,c.y,c.z+cy*6];fov=52}
 const gh=T.surf(p[0],p[2],p[1]+2).h+.8;if(p[1]<gh)p[1]=gh;
 rcam.position.set(p[0],p[1],p[2]);rcam.lookAt(l[0],l[1],l[2]);rcam.fov=fov;rcam.aspect=Math.max(.1,W/H);rcam.updateProjectionMatrix();
 R.setScissorTest(false);R.setViewport(0,0,W,H);R.clear();R.render(Rc.scene,rcam)}
const dr0=drawRace;
drawRace=function(dt){const Rc=RACE;if(Rc&&Rc.prep){prepDraw(Rc,dt);return}if(Rc&&Rc.replay&&Rc.replay.cam>0){replayDraw(Rc,dt);return}return dr0.apply(this,arguments)};
const st0=step;
step=dt=>{const Rc=RACE;if(Rc&&Rc.prep){if(P.dustTick)P.dustTick(Rc,dt);return}if(Rc&&Rc.replay){replayTick(Rc,dt);return}
 st0(dt);if(Rc&&RACE===Rc&&Rc.cfg&&Rc.cfg.rally){record(Rc);cpCheck(Rc);cutCheck(Rc,dt);crashStep(Rc,dt);liveElev(Rc,dt)}};
addEventListener('keydown',e=>{const Rc=RACE;if(!Rc)return;
 if(Rc.prep){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();startStage()}else if(e.code==='Escape'){e.stopImmediatePropagation();const multi=S&&S.drv.length>1;leaveFx();P.cleanupRace();keysReset();if(multi){S=null;show('menu')}else{S=null;P.ui.renderSetup();show('s8setup')}}return}
 if(Rc.replay){const R_=Rc.replay;let h=true;if(e.code==='Space')$i('rrPlay').click();else if(e.code==='KeyC')cycleCam();else if(e.code==='Escape'||e.code==='Enter')exitReplay();else if(e.code==='ArrowRight')R_.t+=5;else if(e.code==='ArrowLeft')R_.t=Math.max(Rc.rec[0][0],R_.t-5);else if(/^Digit[1-5]$/.test(e.code)){$i('rlRep').querySelectorAll('[data-s]')[+e.code[5]-1].click()}else h=false;if(h){e.preventDefault();e.stopImmediatePropagation()}}},true);

/* ---------------- stage map render (3D aerial of the whole stage with the route marked) ---------------- */
const RC={};let rr=null;
function rrInit(){if(!rr){rr=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rr.outputEncoding=THREE.sRGBEncoding;rr.toneMapping=THREE.ACESFilmicToneMapping;rr.toneMappingExposure=1.05;rr.setPixelRatio(1)}}
/* little pictures of the interesting places on a stage: start, fords, jump, pinch, sharpest corner, high point */
function poiShots(sc,T){const out=[];try{rrInit();rr.setSize(320,180,false);const N=T.N,sp=T.sp,cam=new THREE.PerspectiveCamera(58,16/9,.5,6000),pl=[['START LINE',0,26,3.4,30]];
 (T.fords||[]).slice(0,2).forEach(f=>pl.push(['WATER FORD',f.i,34,4.2,26]));
 if(T.jumps&&T.jumps.length)pl.push(['JUMP',T.jumps[0],34,3.6,20]);
 if(T.pinch&&T.pinch.length)pl.push(['PINCH POINT',T.pinch[0].i,24,2.6,30]);
 const cr=corners(T).slice().sort((a,b)=>a.R-b.R)[0];if(cr)pl.push([cr.R<20?'HAIRPIN':'TIGHT CORNER',(cr.s+Math.round(cr.len/2))%N,38,12,18]);
 let hi=0;for(let i=0;i<N;i++)if(T.y[i]>T.y[hi])hi=i;pl.push(['HIGH POINT',hi,36,6,40]);
 for(const [n,i,back,up,ahead] of pl.slice(0,6)){const a=((i-Math.round(back/sp))%N+N)%N,b=(i+Math.round(ahead/sp))%N;cam.position.set(T.x[a],T.y[a]+up,T.z[a]);cam.lookAt(T.x[b],T.y[b]+1.2,T.z[b]);cam.updateMatrixWorld();
  rr.render(sc,cam);const cv=document.createElement('canvas');cv.width=320;cv.height=180;cv.getContext('2d').drawImage(rr.domElement,0,0);out.push({n,c:cv})}}catch(e){console.error('poi',e)}
 return out}
P.poiStrip=(idx,host)=>{host.innerHTML='';P.stageRender(idx).then(img=>{if(!img||!img.pois||!host.isConnected)return;host.innerHTML='';img.pois.forEach(p=>{const f=document.createElement('figure'),c=document.createElement('canvas');c.width=320;c.height=180;c.getContext('2d').drawImage(p.c,0,0);const cap=document.createElement('figcaption');cap.textContent=p.n;f.append(c,cap);host.appendChild(f)})})};

P.prewarmStages=()=>P.STAGES.reduce((p,i)=>p.then(()=>P.stageRender(i)).then(()=>new Promise(r=>setTimeout(r,700))),Promise.resolve());
P.stageCached=idx=>RC[idx]||null;
P.stageRender=idx=>{if(RC[idx])return Promise.resolve(RC[idx]);
 return new Promise(res=>setTimeout(()=>{let sc=null;try{
  const def=Object.assign({},D[idx]);if(def.look!=null)def.id=def.look;const T=sampleTrack(def);sc=buildWorld(T);const pois=poiShots(sc,T);sc.fog=null;
  sc.traverse(o=>{const g=o.geometry&&o.geometry.parameters;if(!g)return;if((o.geometry.type==='SphereGeometry'&&g.radius===1500)||(o.geometry.type==='CylinderGeometry'&&g.radiusTop===1300)||(o.geometry.type==='ConeGeometry'&&g.radius>=80&&g.height>=60))o.visible=false});
  sc.background=new THREE.Color(0x0c1218);
  const b=T.bounds,cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,Dm=Math.max(b[1]-b[0],b[3]-b[2]);let y0=1e9,y1=-1e9;for(let i=0;i<T.N;i++){y0=Math.min(y0,T.y[i]);y1=Math.max(y1,T.y[i])}
  const cam=new THREE.PerspectiveCamera(36,16/9,10,12000);cam.position.set(cx-Dm*.1,y1+Dm*.78,cz+Dm*.86);cam.lookAt(cx,(y0+y1)/2,cz-Dm*.02);cam.updateMatrixWorld();
  rrInit();rr.setSize(960,540,false);
  rr.render(sc,cam);
  const cv=document.createElement('canvas');cv.width=960;cv.height=540;const g=cv.getContext('2d');g.drawImage(rr.domElement,0,0);
  const v=new THREE.Vector3(),pj=(x,y,z)=>{v.set(x,y,z).project(cam);return[(v.x*.5+.5)*960,(1-(v.y*.5+.5))*540]};
  g.lineJoin='round';g.lineCap='round';
  for(const [w,col] of [[7,'#0b0e12'],[3.4,'#f2c76b']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();for(let i=0;i<=T.N;i+=3){const q=pj(T.x[i%T.N],T.y[i%T.N]+3,T.z[i%T.N]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}g.stroke()}
  g.font='bold 12px monospace';g.textAlign='center';g.textBaseline='middle';
  P.cpsOf(T).forEach((i,k)=>{const q=pj(T.x[i],T.y[i]+3,T.z[i]);g.fillStyle='#0b3a44';g.strokeStyle='#7fe3f2';g.lineWidth=2;g.beginPath();g.arc(q[0],q[1],9,0,7);g.fill();g.stroke();g.fillStyle='#fff';g.fillText(k+1,q[0],q[1]+1)});
  for(const f of T.fords||[]){const q=pj(f.x,f.yw+3,f.z);g.fillStyle='#1b5a7a';g.strokeStyle='#bfe8ff';g.lineWidth=2;g.beginPath();g.rect(q[0]-14,q[1]-8,28,16);g.fill();g.stroke();g.fillStyle='#fff';g.font='bold 9px monospace';g.fillText('FORD',q[0],q[1]+1)}
  {const q=pj(T.x[0],T.y[0]+3,T.z[0]);g.fillStyle='#fff';g.fillRect(q[0]-5,q[1]-5,10,10);g.fillStyle='#111';g.fillRect(q[0]-5,q[1]-5,5,5);g.fillRect(q[0],q[1],5,5);g.font='bold 10px monospace';g.fillStyle='#fff';g.fillText('START',q[0],q[1]-13)}
  cv.pois=pois;RC[idx]=cv;res(cv)}catch(e){console.error('stage render',e);res(null)}
  finally{if(sc){try{disposeWorld(sc)}catch(e){}}}},40))};

/* ---------------- loading animation between the play cards and the rally setup ---------------- */
const PR={};const sr_=P.stageRender;
P.stageRender=idx=>{if(RC[idx])return Promise.resolve(RC[idx]);return PR[idx]||(PR[idx]=sr_(idx).then(v=>{delete PR[idx];return v}))};
/* loading scene: helicopter shot of your rally car running a gravel loop */
let JS=null;
function jumpInit(box){
 if(JS){box.appendChild(JS.cv);return JS}
 const cv=document.createElement('canvas');cv.style.cssText='width:100%;height:100%;display:block';
 const r=new THREE.WebGLRenderer({canvas:cv,antialias:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(1);
 const HZ=0xd9e3d2,sc=new THREE.Scene();sc.fog=new THREE.Fog(HZ,90,520);
 {const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gd=g.createLinearGradient(0,0,0,256);gd.addColorStop(0,'#3f78c4');gd.addColorStop(.45,'#7fb1e0');gd.addColorStop(.8,'#c7dcea');gd.addColorStop(1,'#f0e4c8');g.fillStyle=gd;g.fillRect(0,0,4,256);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;sc.background=tx}
 const cam=new THREE.PerspectiveCamera(52,16/9,.5,1800);
 sc.add(new THREE.HemisphereLight(0xdfeeff,0x55663a,.4));const dl=new THREE.DirectionalLight(0xffe2b0,.95);dl.position.set(-80,60,70);sc.add(dl);
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.95,metalness:0,flatShading:true},o||{}));
 const rnd=(()=>{let x=11;return()=>{x=(x*16807)%2147483647;return x/2147483647}})();
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),M(0x5f8741));gr.rotation.x=-Math.PI/2;sc.add(gr);
 const gc=[0x6a9448,0x557a3a,0x7a9a4e,0x4f7036,0x8aa456];for(let i=0;i<90;i++){const m=new THREE.Mesh(new THREE.CircleGeometry(14+rnd()*40,7),M(gc[i%5]));m.rotation.x=-Math.PI/2;m.position.set((rnd()-.5)*640,.03+i*.0005,(rnd()-.5)*640);sc.add(m)}
 const pts=[];const NP=9;for(let i=0;i<NP;i++){const a=i/NP*Math.PI*2,rad=75+((i*37)%5)*10;pts.push(new THREE.Vector3(Math.cos(a)*rad*1.25,0,Math.sin(a)*rad))}
 const curve=new THREE.CatmullRomCurve3(pts,true,'catmullrom',.5),CL=curve.getLength();
 const ribbon=(w,y,col,off)=>{const N=360,pos=[],idx=[];for(let i=0;i<=N;i++){const u=i/N,p=curve.getPointAt(u%1),t=curve.getTangentAt(u%1),nx=-t.z,nz=t.x;pos.push(p.x+nx*(off-w/2),y,p.z+nz*(off-w/2),p.x+nx*(off+w/2),y,p.z+nz*(off+w/2));if(i<N){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();sc.add(new THREE.Mesh(g,M(col,{side:THREE.DoubleSide})))};
 ribbon(9.5,.05,0x8b7a52,0);ribbon(7.2,.07,0xb89c6a,0);ribbon(1.1,.09,0x8d7448,-1.6);ribbon(1.1,.09,0x8d7448,1.6);ribbon(.5,.11,0xd8c595,0);
 const samp=[];for(let i=0;i<160;i++)samp.push(curve.getPointAt(i/160));
 const far=(p,d)=>{for(const q of samp){const dx=q.x-p.x,dz=q.z-p.z;if(dx*dx+dz*dz<d*d)return false}return true};
 /* forest clumps: pines in three greens, denser near a few centres */
 const TN=520,cols=[0x2b5a2c,0x376b32,0x2f5a3a],fol=cols.map(c=>new THREE.InstancedMesh(new THREE.ConeGeometry(2.3,7,6),M(c),TN)),fol2=cols.map(c=>new THREE.InstancedMesh(new THREE.ConeGeometry(1.7,5,6),M(c),TN)),trk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.3,1.6,5),M(0x4a3524),TN*3),mt=new THREE.Matrix4(),cnt=[0,0,0];let tn=0;
 const centres=[];for(let i=0;i<9;i++)centres.push([(rnd()-.5)*420,(rnd()-.5)*420]);
 for(let tries=0;tries<6000&&tn<TN*3-3;tries++){const c=centres[tries%9],x=c[0]+(rnd()-.5)*110,z=c[1]+(rnd()-.5)*110,p={x,z};if(!far(p,9))continue;const k=tn%3,s=.75+rnd()*1.1,n=cnt[k]++;mt.makeScale(s,s,s);mt.setPosition(x,3.9*s,z);fol[k].setMatrixAt(n,mt);mt.makeScale(s,s,s);mt.setPosition(x,7.2*s,z);fol2[k].setMatrixAt(n,mt);mt.makeScale(s,s,s);mt.setPosition(x,.8*s,z);trk.setMatrixAt(tn,mt);tn++}
 fol.forEach((f,k)=>{f.count=fol2[k].count=cnt[k];sc.add(f,fol2[k])});trk.count=tn;sc.add(trk);
 for(let i=0;i<46;i++){const a=rnd()*Math.PI*2,d=70+rnd()*260,p={x:Math.cos(a)*d,z:Math.sin(a)*d};if(!far(p,8))continue;const k=new THREE.Mesh(new THREE.DodecahedronGeometry(.8+rnd()*1.8,0),M(0x8a8a84));k.position.set(p.x,.5,p.z);k.rotation.set(rnd()*3,rnd()*3,0);sc.add(k)}
 for(let i=0;i<40;i++){const a=rnd()*Math.PI*2,d=60+rnd()*280,p={x:Math.cos(a)*d,z:Math.sin(a)*d};if(!far(p,7))continue;const b=new THREE.Mesh(new THREE.IcosahedronGeometry(1+rnd()*1.2,0),M(i%2?0x4d7a38:0x5f8f3f));b.scale.y=.7;b.position.set(p.x,.7,p.z);sc.add(b)}
 /* rolling hills and snow-capped mountains for depth */
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2+rnd()*.2,d=330+rnd()*160,h=22+rnd()*34;const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),M(i%3?0x5b8a43:0x6a9a4a));m.scale.set(80+rnd()*70,h,70+rnd()*60);m.position.set(Math.cos(a)*d,h*.3-4,Math.sin(a)*d);sc.add(m)}
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2+rnd()*.3,d=720+rnd()*220,h=170+rnd()*200,rr_=90+rnd()*80;const m=new THREE.Mesh(new THREE.ConeGeometry(rr_,h,7),M(i%2?0x77808f:0x8a93a0));m.position.set(Math.cos(a)*d,h/2-6,Math.sin(a)*d);sc.add(m);const cap=new THREE.Mesh(new THREE.ConeGeometry(rr_*.36,h*.3,7),M(0xf2f5f8));cap.position.set(m.position.x,h*.85-6,m.position.z);sc.add(cap)}
 for(let i=0;i<14;i++){const cl=new THREE.Group();for(let j=0;j<4;j++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(14+rnd()*14,0),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92,fog:false}));b.scale.y=.45;b.position.set(j*18-27,rnd()*4,rnd()*12);cl.add(b)}cl.position.set((rnd()-.5)*1400,150+rnd()*120,(rnd()-.5)*1400);sc.add(cl)}
 const sun=new THREE.Mesh(new THREE.CircleGeometry(26,24),new THREE.MeshBasicMaterial({color:0xfff1c8,fog:false}));sun.position.set(-520,230,430);sun.lookAt(0,0,0);sc.add(sun);
 /* dust puffs */
 const dust=[],dg=new THREE.IcosahedronGeometry(1,0);for(let i=0;i<90;i++){const m=new THREE.Mesh(dg,new THREE.MeshBasicMaterial({color:0xcdb994,transparent:true,opacity:0,depthWrite:false}));m.visible=false;sc.add(m);dust.push({m,age:9,vx:0,vy:0,vz:0,life:1})}
 const car=mkCar(0xdddddd,0);car.modelIndex=-1;sc.add(car.g);
 JS={cv,r,sc,cam,curve,CL,car,dust,t:0,acc:0,di:0,last:0,raf:0,w:0,h:0,on:false};
 JS.setCar=mi=>{if(car.modelIndex===mi)return;if(car.visualModel)car.g.remove(car.visualModel);if(car.exhaustRig)car.g.remove(car.exhaustRig);if(car.ptRig)car.g.remove(car.ptRig);car.visualModel=null;car.ptWheels=null;car.modelIndex=mi;attachCarModel(car)};
 JS.size=()=>{const J=JS,w=J.cv.parentNode.clientWidth|0,h=J.cv.parentNode.clientHeight|0;if(w&&(J.w!==w||J.h!==h)){J.w=w;J.h=h;J.r.setSize(w,h,false);J.cam.aspect=w/h;J.cam.updateProjectionMatrix()}return !!J.w};
 box.appendChild(cv);return JS}
const SPD=26;
function jumpUpdate(J,dt){
 J.t+=dt;const u=(((J.t*SPD)/J.CL)%1+1)%1,p=J.curve.getPointAt(u),tg=J.curve.getTangentAt(u),tg2=J.curve.getTangentAt((u+.004)%1),car=J.car;
 const k=(tg.x*tg2.z-tg.z*tg2.x)/.004/J.CL;
 car.g.position.set(p.x,.8,p.z);car.g.rotation.set(0,Math.atan2(tg.x,tg.z),0);car.g.updateMatrixWorld(true);
 try{if(window.__wheels)window.__wheels(car,SPD,Math.max(-1,Math.min(1,k*140)),dt||1/60)}catch(e){}
 J.acc+=dt;const V=new THREE.Vector3();
 while(J.acc>1/45){J.acc-=1/45;for(const sx of[-.85,.85]){const d=J.dust[J.di=(J.di+1)%J.dust.length];V.set(sx,.25,-2).applyMatrix4(car.g.matrixWorld);d.m.position.copy(V);d.age=0;d.life=1.1+Math.random()*.7;d.vx=(Math.random()-.5)*2.4-tg.x*3;d.vz=(Math.random()-.5)*2.4-tg.z*3;d.vy=.8+Math.random()*1.1;d.s0=.35+Math.random()*.3;d.m.visible=true}}
 for(const d of J.dust){if(!d.m.visible)continue;d.age+=dt;if(d.age>d.life){d.m.visible=false;continue}const q=d.age/d.life;d.m.position.x+=d.vx*dt;d.m.position.y+=d.vy*dt*(1-q*.7);d.m.position.z+=d.vz*dt;d.m.scale.setScalar(d.s0+q*2.6);d.m.material.opacity=.5*(1-q)*(1-q*.3)}
 J.pt=p;J.tg=tg}
function jumpDraw(J){
 const p=J.pt,tg=J.tg,a=J.t*.3+.9,R=15+Math.sin(J.t*.5)*2.5,H=8.5+Math.sin(J.t*.37)*2.2;
 J.cam.position.set(p.x+Math.sin(a)*R,H,p.z+Math.cos(a)*R);J.cam.up.set(Math.sin(J.t*.8)*.025,1,0);J.cam.lookAt(p.x+tg.x*3,1.2,p.z+tg.z*3);
 J.r.render(J.sc,J.cam)}
function jumpFrame(now){
 const J=JS;if(!J||!J.on)return;J.raf=requestAnimationFrame(jumpFrame);
 const dt=Math.max(0,Math.min(.05,(now-J.last)/1000||0));J.last=now;
 if(!J.size())return;jumpUpdate(J,dt);jumpDraw(J)}
P._jumpAt=t=>{const J=JS;if(!J)return 0;J.on=false;cancelAnimationFrame(J.raf);J.size();J.t=0;J.dust.forEach(d=>d.m.visible=false);for(let i=0;i<Math.round(t*30);i++)jumpUpdate(J,1/30);jumpDraw(J);return 1};
P.rallyIntro=(open,track,o)=>{o=o||{};let e=$i('rlLoad');
 if(!e){e=document.createElement('div');e.id='rlLoad';e.innerHTML=`<div class="rl-jump"></div><div class="rl-lt"><small>PREPARING</small><h2>RALLY</h2><p>LOADING STAGES</p><div class="rl-pb"><u></u></div></div>`;document.body.appendChild(e)}
 {const t=e.querySelector('h2'),p_=e.querySelector('p');if(t)t.textContent=o.title||'RALLY';if(p_)p_.textContent=o.sub||'LOADING STAGES'}
 e.classList.remove('on','done','ready');void e.offsetWidth;e.classList.add('on');const t0=performance.now();
 let J=null;
 /* 1) get everything ready and paint one still frame; nothing animates while the heavy work runs */
 try{J=jumpInit(e.querySelector('.rl-jump'));try{const sel=o.car||P.rallySel(0);J.setCar(P.modelOf(sel.id,sel.alt?1:0))}catch(er){console.error('loadcar',er)}J.on=false;J.size();J.dust.forEach(d=>d.m.visible=false);J.t=0;J.acc=0;for(let i=0;i<40;i++)jumpUpdate(J,1/30);jumpDraw(J)}catch(err){console.error('jump',err);J=null}
 const finish=()=>{
  /* 2) all loaded: now play the shot smoothly, then fade out */
  e.classList.add('ready');if(J){try{J.on=true;J.last=performance.now();cancelAnimationFrame(J.raf);J.raf=requestAnimationFrame(jumpFrame)}catch(er){}}
  setTimeout(()=>{e.classList.add('done');setTimeout(()=>{e.classList.remove('on','done','ready');if(J){J.on=false;cancelAnimationFrame(J.raf)}},650)},1500)};
 requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{try{open()}catch(err){console.error(err)}
  (P.stageRender&&track!=null&&!o.noStage?P.stageRender(track):Promise.resolve()).catch(()=>{}).then(()=>setTimeout(finish,60))},80)))};
/* every mode gets the car loading screen */
P.launchWithIntro=cfg=>{if(P._introBusy)return;const rally=cfg.mode==='rally'&&!cfg.circuit,circ=!!cfg.circuit,mm=cfg.cutup?'cutup':cfg.mode;
 const NAME={ta:'TIME ATTACK',mp:'MULTIPLAYER',elim:'ELIMINATION',cutup:'CUT-UP'};
 const title=rally?'RALLY':circ?'TRACK':(NAME[mm]||'RACE'),sub=rally?'LOADING STAGES':circ?'LOADING CIRCUIT':'LOADING TRACK';
 let car=null;try{const h=cfg.humans&&cfg.humans[0];if(h)car={id:h.id,alt:h.alt}}catch(e){}
 P._introBusy=1;setTimeout(()=>{P._introBusy=0},1200);
 P.rallyIntro(()=>P.launch(cfg),rally?cfg.track:null,{title,sub,car,noStage:!rally})};
P.RALLYSESSION=()=>S;
})();
