/* ===== Poly Tourismo v9 layer: elim (elimination mode, last-place catch-up boost) ===== */
(function v9elim(){
'use strict';
const P=window.PT8,ord=P.ord;
const BOOST=1.012;
const isEl=Rc=>!!Rc&&Rc.mode==='elim';
const alive=Rc=>Rc.cars.filter(c=>!c.out);
const standings=Rc=>alive(Rc).sort((a,b)=>b.unw-a.unw);

/* eliminated cars are frozen, hidden and never collide */
const sc0=stepCar;stepCar=(c,dt)=>{if(c.out){c.vx=c.vy=c.vz=0;c.sp=0;c.in={th:0,br:1,st:0,hb:0};return}sc0(c,dt)};
const cc0=carCollide;carCollide=(a,b)=>{if(a.out||b.out)return;cc0(a,b)};
const uv0=updateVisual;updateVisual=(c,T,t)=>{uv0(c,T,t);if(c.out&&c.m){c.m.g.visible=false;if(c.m.sh)c.m.sh.visible=false}};

/* last place alive gets +1.2% acceleration and top speed */
const mul0=P.mul;
P.mul=c=>{const m=mul0(c),Rc=RACE;if(isEl(Rc)&&Rc.elimLast===c){m.acc*=BOOST;m.top*=BOOST}return m};

/* spectator camera: eliminated humans follow the leader */
const sol0=soloCam;
soloCam=(c,dt,out)=>{const Rc=RACE;if(c.out&&Rc){let b=null;for(const o of Rc.cars)if(!o.out&&(!b||o.unw>b.unw))b=o;if(b){sol0(b,dt,out);return}}sol0(c,dt,out)};

/* the race never ends by lap count */
const fc0=finishCheck;finishCheck=()=>{if(isEl(RACE))return;fc0()};

const l0=P.launch;
P.launch=cfg=>{if(cfg.mode==='elim'){cfg.laps=99;cfg.endur=false}
 l0(cfg);const Rc=RACE;if(isEl(Rc)){const iv=cfg.interval||30;Rc.el={iv,next:iv+10,n:0,flash:0,last:null,beep:-1};Rc.elimLast=null;Rc.cars.forEach(c=>{c.out=0})}};

function finish(Rc){
 standings(Rc).forEach((c,i)=>{c.fin=1;c.finT=Rc.t+i*.001;c.place=i+1;c.txt=i===0?'WINNER':'SURVIVED';Rc.fin.push(c);
  if(c.human&&i===0){c.cool=1;c.cine=null;c.finFlash=3.2;try{beep(900,.4,'triangle')}catch(e){}}});
 P.endRace();
}
function eliminate(Rc){
 const al=standings(Rc);if(al.length<2)return;
 const v=al[al.length-1];
 v.out=1;v.fin=1;v.place=al.length;v.finT=1e5-Rc.t;v.txt='OUT';Rc.el.n++;Rc.el.flash=2.4;Rc.el.last=v;Rc.fin.push(v);
 try{fx(v.x,v.y+.8,v.z,0xef6a5a,18,9,.5,.2,10)}catch(e){}
 try{beep(220,.35,'sawtooth',.8)}catch(e){}
 if(v.human){v.pop='ELIMINATED';v.popT=3}
}
P.elimTick=(Rc,dt)=>{
 const el=Rc.el;if(!el||Rc.ending>0)return;
 if(el.flash>0)el.flash-=dt;
 let al=standings(Rc);
 if(!al.some(c=>c.human)||al.length<=1){finish(Rc);return}
 const left=el.next-Rc.t;
 if(left<=3.2&&left>0&&Math.ceil(left)!==el.beep){el.beep=Math.ceil(left);try{beep(700,.08)}catch(e){}}
 if(Rc.t>=el.next){eliminate(Rc);el.next=Rc.t+el.iv;al=standings(Rc);if(!al.some(c=>c.human)||al.length<=1){finish(Rc);return}}
 Rc.elimLast=al.length>=2?al[al.length-1]:null;
};
const mt0=P.modeTick;P.modeTick=(Rc,dt)=>{mt0(Rc,dt);if(isEl(Rc))P.elimTick(Rc,dt)};

/* HUD: elimination status over the lap text */
const hu0=hudUpdate;hudUpdate=()=>{hu0();const Rc=RACE;if(!isEl(Rc)||!Rc.el)return;
 const al=alive(Rc),el=Rc.el,left=Math.max(0,el.next-Rc.t),st=standings(Rc);
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const e=document.getElementById('h'+i);if(!e||!e.dataset.b)return;
  const q=k=>e.querySelector(k);
  q('.lap').textContent=c.out?'OUT':'ELIMINATION';
  const bl=q('.bl');bl.style.display='';bl.textContent=al.length+' CARS LEFT';
  const md=q('.h8mode');
  if(md.style.display!=='none'){
   const last=Rc.elimLast===c,urgent=left<5&&Rc.state==='race';
   md.innerHTML='<div class="cu"><div class="sc"><small>NEXT OUT</small><b'+(urgent?' style="color:#ef6a5a"':'')+'>'+(Rc.state==='race'?left.toFixed(1)+'s':'--')+'</b></div><div class="sc"><small>'+(last?'LAST / +1.2% SPEED':'ALIVE')+'</small><b'+(last?' style="color:#f2c76b"':'')+'>'+al.length+'/'+Rc.cars.length+'</b></div></div>'}
  if(c.out){const fn=q('.h8fin');fn.innerHTML='<b style="font-size:.5em">OUT</b><span>SPECTATING / '+ord(c.place)+' PLACE</span>';fn.className='h8fin on'}
  else if(!c.fin){const k=st.indexOf(c)+1;q('.h8pos b').textContent=k;q('.h8pos i').textContent=ord(k).replace(/\d/g,'');q('.h8pos span').textContent='/'+al.length}
  if(el.flash>0&&el.last&&!c.out){const pp=q('.h8pop');pp.textContent=el.last.ptName+' ELIMINATED';pp.className='h8pop on'}
 })};
})();
