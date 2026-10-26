/* ===== Poly Tourismo v9 layer: race2 (slipstream, tyre wear, fuel, pit stops) ===== */
(function v9race2(){
'use strict';
const P=window.PT8;
const L0=P.launch;
P.launch=cfg=>{cfg.endur=false;L0(cfg)};
const endur=Rc=>false;

/* ---------- physics multipliers (read every physics step by the stepCar wrapper) ---------- */
P.mul=c=>{const Rc=RACE,m={acc:1,top:1,grip:1,brk:1};if(!Rc)return m;
 const d=c.draft||0;if(d>0){m.acc+=.10*d;m.top+=.10*d}
 if(endur(Rc)){const t=c.tyre==null?1:c.tyre,f=c.fuel==null?1:c.fuel;
  m.grip*=1-.30*Math.pow(1-t,1.2)-(t<.15?.08*(1-t/.15):0);m.brk*=1-.18*Math.pow(1-t,1.2);
  m.acc*=1+.05*(1-f);if(f<=0){m.acc*=.12;m.top*=.45}}
 return m};

/* ---------- pit zone on the start straight ---------- */
function pitSetup(Rc){const T=Rc.T,a=14,b=a+Math.ceil(64/T.sp);Rc.pit={a,b,mid:Math.round((a+b)/2)}}
P.pitSetup=Rc=>{if(endur(Rc))pitSetup(Rc)};

/* ---------- per-frame state ---------- */
const needOf=c=>Math.max(1-(c.tyre==null?1:c.tyre),1-(c.fuel==null?1:c.fuel));
function tick(Rc,dt){const T=Rc.T,en=endur(Rc),pit=Rc.pit,N=T.N;
 for(const c of Rc.cars){if(c.fin||c.exp>0||c.respT>0){c.draft=0;continue}
  /* slipstream */
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);let best=0;
  if(c.sp>22){for(const o of Rc.cars){if(o===c||o.exp>0||o.respT>0)continue;const dx=o.x-c.x,dz=o.z-c.z,lon=dx*fx+dz*fz;if(lon<3||lon>32)continue;const lat=Math.abs(dx*rx+dz*rz);if(lat>2.3||o.sp<c.sp*.7)continue;best=Math.max(best,(1-lon/32)*(1-lat/2.3))}}
  /* you must sit in the tow for a while before it bites: 1.6s delay, then ramps in over 1s */
  c.dwait=best>0?(c.dwait||0)+dt:Math.max(0,(c.dwait||0)-dt*2.5);if(best>0)c.dbest=best;
  best=best>0&&c.dwait>1.6?best*Math.min(1,(c.dwait-1.6)/1)  :0;
  c.draft=(c.draft||0)+(best-(c.draft||0))*Math.min(1,dt*3);if(c.draft<.01)c.draft=0;
  if(!en)continue;
  if(c.tyre==null){c.tyre=1;c.fuel=1}
  const inp=c.in||{th:0,br:0};
  const live=Rc.state==='race';
  c.tyre=1;if(live){c.fuel=Math.max(0,c.fuel-.0019*(.35+.65*inp.th)*dt*(c.human?1:.8))}
  /* pit zone */
  const inZ=pit&&c.idx>=pit.a&&c.idx<=pit.b&&c.sp<80;c.inPit=inZ;
  if(c.human){
   if(c.pitSvc){c.pitT+=dt;if(c.pitT>=c.pitNeed){c.tyre=1;c.fuel=1;c.dmg=0;c.pitSvc=false;c.pitDone=true;c.pitCount=(c.pitCount||0)+1;P.sfx('buy')}}
   else if(!c.pitDone&&c.sp<2.2&&needOf(c)>.04){c.pitSvc=true;c.pitT=0;c.pitNeed=1.3+needOf(c)*3.2;P.sfx('click')}
   if(c.sp>6)c.pitDone=false;
  }
  if(c.pitSvc&&!c.human)c.pitSvc=false;
 }}
P.raceTick=tick;

/* ---------- inputs while being serviced / AI pit logic ---------- */
{const ip0=P.inPost;P.inPost=(c,dt)=>{if(ip0)ip0(c,dt);if(c.pitSvc&&c.in){c.in.th=0;c.in.br=1;c.in.st=0;c.vx*=.85;c.vz*=.85}};}
P.aiPost=(c,dt)=>{const Rc=RACE;if(!endur(Rc)||c.human||!Rc.pit||c.fin)return;const pit=Rc.pit,N=Rc.T.N,lapsLeft=Rc.laps-c.unw/N;
 const inZ=c.idx>=pit.a&&c.idx<=pit.b;
 if(!inZ){c.pitWant=false;c.pitSeen=false;return}
 if(!c.pitSeen){c.pitSeen=true;c.pitWant=lapsLeft>1.3&&((c.tyre!=null&&c.tyre<.42)||(c.fuel!=null&&c.fuel<.2))}
 if(c.pitWant){const I=c.in;if(c.sp>7){I.th=0;I.br=1}else I.th=Math.min(I.th,.4);
  if(c.idx>=pit.mid&&c.sp<9){c.tyre=1;c.fuel=1;c.dmg=0;c.pitWant=false;c.pitCount=(c.pitCount||0)+1}}};

/* ---------- HUD add-on ---------- */
const hudOld=hudUpdate;
hudUpdate=()=>{hudOld();const Rc=RACE;if(!Rc)return;const en=endur(Rc);
 Rc.cars.forEach((c,i)=>{if(!c.human)return;const h=$('h'+i);if(!h||!c.rect)return;let e=h.querySelector('.h9ex');
  if(!e){e=document.createElement('div');e.className='h9ex';e.innerHTML='<div class="pr"></div><div class="bars"><div class="tk"><small>FUEL</small><i><u></u></i></div></div><div class="dr">SLIPSTREAM</div>';h.appendChild(e)}
  e.querySelector('.bars').style.display=en?'':'none';
  const us=e.querySelectorAll('.bars u');
  if(en){const f=c.fuel==null?1:c.fuel;us[0].style.width=(f*100)+'%';us[0].parentNode.className=f<.15?'lo':f<.35?'mid':''}
  const dr=e.querySelector('.dr');dr.style.opacity=c.draft>.12?Math.min(1,c.draft*1.6):0;
  let msg='';
  if(en&&Rc.state==='race'&&!c.fin){
   if(c.fuel<=0)msg='OUT OF FUEL - STOP TO REFUEL';
   else if(c.pitSvc)msg='SERVICING '+Math.max(0,c.pitNeed-c.pitT).toFixed(1)+'s';
   else if(c.fuel<.12)msg='LOW FUEL - STOP TO REFUEL';}
  const pr=e.querySelector('.pr');pr.textContent=msg;pr.style.opacity=msg?1:0})};

/* ---------- engage ---------- */
const mt0=P.modeTick;P.modeTick=(Rc,dt)=>{mt0(Rc,dt);tick(Rc,dt)};
const ds0=P.launch;P.launch=cfg=>{ds0(cfg);if(RACE&&endur(RACE))P.pitSetup(RACE)};

/* ---------- ghost lap (Time Attack): best lap per track+car+direction, saved in the browser ---------- */
const gkey=(Rc,c)=>'pt9g_'+Rc.cfg.track+(Rc.cfg.rev?'r':'')+'_'+c.carId+(c.alt?'a':'');
const gload=k=>{try{const j=JSON.parse(localStorage.getItem(k));if(j&&j.d&&j.d.length>=50)return j}catch(e){}return null};
const gsave=(k,t,d)=>{try{localStorage.setItem(k,JSON.stringify({t,d}))}catch(e){}};
P.ghostSetup=Rc=>{const h=Rc.cars[0];if(!h)return null;const key=gkey(Rc,h),b=gload(key);
 const G={key,best:b?b.d:null,bestT:b?b.t:1e9,rec:[],acc:0,lap:0,fin:false,mesh:null,bu:b?b.d.filter((v,i)=>i%5===4):null};
 if(G.best){try{const m=h.m.g.clone(true);const gm=new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.34,depthWrite:false});const kill=[];m.traverse(o=>{if(o.isMesh){o.material=gm;o.castShadow=false;o.receiveShadow=false;o.renderOrder=5}});m.visible=false;G.mesh=m;Rc.scene.add(m)}catch(e){console.warn('ghost',e)}}
 return G};
function ghostEnd(Rc,G,t){if(t<G.bestT&&G.rec.length>50){G.bestT=t;G.best=G.rec.slice();gsave(G.key,t,G.best.map(v=>Math.round(v*100)/100));G.newBest=true}G.rec=[]}
P.ghostTick=(Rc,dt)=>{const G=Rc.ghost,h=Rc.cars[0];if(!G||!h)return;const lt=Rc.t-h.lapStart;
 if(h.curLap!==G.lap&&!h.fin){ghostEnd(Rc,G,h.lapT[h.lapT.length-1]);G.lap=h.curLap;G.acc=0}
 if(h.fin&&!G.fin){G.fin=true;ghostEnd(Rc,G,h.lapT[h.lapT.length-1])}
 if(!h.fin){G.acc+=dt;while(G.acc>=1/30){G.acc-=1/30;G.rec.push(h.x,h.y,h.z,h.yaw,h.unw-h.curLap*Rc.T.N)}}
 const d=G.best;if(!d||!G.mesh)return;const n=d.length/5,f=lt*30,i=Math.floor(f);
 if(i<0||i>=n-1||h.fin){G.mesh.visible=false;G.delta=null;return}
 const u=f-i,a=i*5,b=a+5,ly=(p,q)=>p+(q-p)*u;let yw0=d[a+3],yw1=d[b+3],dy=yw1-yw0;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
 G.mesh.position.set(ly(d[a],d[b]),ly(d[a+1],d[b+1]),ly(d[a+2],d[b+2]));G.mesh.rotation.y=yw0+dy*u;G.mesh.visible=true;
 /* delta vs ghost at the same distance along the lap */
 let lo=0,hi=n-1;const target=h.unw-h.curLap*Rc.T.N;while(lo<hi){const m=(lo+hi)>>1;if(d[m*5+4]<target)lo=m+1;else hi=m}
 G.delta=lt-lo/30};
const hud0=hudUpdate;
hudUpdate=()=>{hud0();const Rc=RACE;if(!Rc||Rc.mode!=='ta'||!Rc.ghost)return;const h=Rc.cars[0],e=$('h0');if(!e)return;const x=e.querySelector('.h9ex');if(!x)return;let g=x.querySelector('.gd');
 if(!g){g=document.createElement('div');g.className='gd';x.appendChild(g)}
 const G=Rc.ghost;if(G.delta==null||!G.best){g.style.opacity=G.best?.5:0;g.textContent=G.best?'GHOST':'';return}
 g.style.opacity=1;g.className='gd '+(G.delta<=0?'up':'dn');g.textContent='GHOST '+(G.delta<=0?'-':'+')+Math.abs(G.delta).toFixed(2)};

/* ---------- controller: menus (stick/d-pad, A = enter, B = back, Start = enter) ---------- */
let padSt={};const kd=(code,key)=>{const o={code,key,bubbles:true,cancelable:true};const t=document.activeElement||document.body;t.dispatchEvent(new KeyboardEvent('keydown',o));t.dispatchEvent(new KeyboardEvent('keyup',o))};
setInterval(()=>{if(typeof scr==='undefined'||scr==='game')return;let gs;try{gs=navigator.getGamepads?navigator.getGamepads():[]}catch(e){return}
 for(const g of gs){if(!g)continue;const B=i=>!!(g.buttons[i]&&g.buttons[i].pressed),ax=g.axes[0]||0,ay=g.axes[1]||0;
  const st={up:B(12)||ay<-.6,dn:B(13)||ay>.6,lf:B(14)||ax<-.6,rt:B(15)||ax>.6,ok:B(0)||B(9),bk:B(1)},o=padSt[g.index]||{};
  if(st.up&&!o.up)kd('ArrowUp','ArrowUp');if(st.dn&&!o.dn)kd('ArrowDown','ArrowDown');if(st.lf&&!o.lf)kd('ArrowLeft','ArrowLeft');if(st.rt&&!o.rt)kd('ArrowRight','ArrowRight');
  if(st.ok&&!o.ok){const a=document.activeElement;if(a&&a.click&&a!==document.body)a.click();else kd('Enter','Enter')}if(st.bk&&!o.bk)kd('Escape','Escape');
  padSt[g.index]=st}},60);
})();
