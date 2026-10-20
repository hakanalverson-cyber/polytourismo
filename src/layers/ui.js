/* ===== Poly Tourismo v9 layer: UI (menu, mode cards, setup, career hub, studio garage / Brand Central, results) ===== */
(function v9ui(){
'use strict';
const P=window.PT8,CARS=P.CARS,BYID=P.BYID,CLS=P.CLS,fmtCr=P.fmtCr,fmtT=P.fmtT,ord=P.ord,SORTED=P.SORTED;
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const root=document.createElement('div');root.id='v8';document.body.appendChild(root);
const SCREENS=['s8cards','s8setup','s8career','s8show','s8res'];
const ST={mode:'ta',track:0,laps:3,rlaps:1,players:1,cpus:3,diff:1,time:120,traffic:'light',todUser:null,ret:'s8cards',cev:null,crank:null};
const SR={cat:'ALL',kind:'garage',player:0,cap:null,ret:'s8setup',id:'merc',alt:0,ang:.6,vel:0,drag:false,rally:false};
const crHTML='<div class="crbox"><small>BALANCE</small><b class="crv"></b></div>';

/* ================= pixel icons (drawn at 40x40, shown crisp) ================= */
function pxCanvas(n){const cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const o={cv,g,r:(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0)},
  circ:(cx,cy,rad,c,fill)=>{g.fillStyle=c;for(let y=-rad;y<=rad;y++)for(let x=-rad;x<=rad;x++){const d=Math.hypot(x,y);if(fill?d<=rad+.2:(d<=rad+.35&&d>=rad-1.0))g.fillRect(cx+x,cy+y,1,1)}},
  line:(x0,y0,x1,y1,c)=>{g.fillStyle=c;const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx-dy;for(;;){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x0+=sx}if(e2<dx){e+=dx;y0+=sy}}}};return o}
const IC={
 ta(){const p=pxCanvas(40),W='#e6e9ee',A='#f1f3f5',G='#2a3340',Y='#f2c76b';
  p.circ(20,23,14,G,true);p.circ(20,23,14,W,false);p.circ(20,23,13,W,false);p.r(17,5,6,3,W);p.r(19,8,2,4,W);p.r(29,9,4,3,W);p.r(31,8,2,2,W);
  for(let i=0;i<12;i++){const a=i/12*6.283;const x=20+Math.round(Math.cos(a)*11),y=23+Math.round(Math.sin(a)*11);p.r(x,y,1,1,i%3?'#566070':W)}
  p.line(20,23,20,14,A);p.line(21,23,21,14,A);p.line(20,23,27,27,Y);p.circ(20,23,2,W,true);
  /* checker */p.r(2,31,2,2,W);p.r(4,33,2,2,W);p.r(6,31,2,2,W);p.r(2,35,2,2,'#566070');
  return p.cv},
 mp(){const p=pxCanvas(48),W='#e6e9ee',A='#f1f3f5',Y='#f2c76b',K='#0a1018';
  /* two cars side by side, split line between them, P1 / P2 pips */
  const car=(x,y,c,hl)=>{p.r(x+2,y,10,26,c);p.r(x+3,y-2,8,2,c);p.r(x+3,y+26,8,2,c);p.r(x,y+4,2,6,'#000');p.r(x+12,y+4,2,6,'#000');p.r(x,y+17,2,6,'#000');p.r(x+12,y+17,2,6,'#000');
   p.r(x+3,y+7,8,6,K);p.r(x+3,y+21,8,3,K);p.r(x+3,y,2,2,hl);p.r(x+9,y,2,2,hl);p.r(x+6,y+14,2,5,'#00000033')};
  car(6,8,A,'#fff6c0');car(28,12,Y,'#fff6c0');
  for(let y=2;y<46;y+=6)p.r(23,y,2,3,'#59657a');
  return p.cv},
 cu(){const p=pxCanvas(48),W='#e6e9ee',A='#f1f3f5',Y='#f2c76b',T='#7b8696',K='#0a1018',D='#4a5566';
  /* box truck in the slow lane, player squeezing past it, close-pass bracket + multiplier */
  p.r(5,10,13,26,D);p.r(5,10,13,2,T);p.r(6,36,11,9,T);p.r(8,38,7,3,K);p.r(6,44,2,2,'#000');p.r(15,44,2,2,'#000');p.r(4,14,1,6,'#000');p.r(18,14,1,6,'#000');p.r(4,28,1,6,'#000');p.r(18,28,1,6,'#000');
  p.r(27,14,8,16,A);p.r(28,13,6,1,A);p.r(28,30,6,1,A);p.r(26,17,1,4,'#000');p.r(35,17,1,4,'#000');p.r(26,25,1,4,'#000');p.r(35,25,1,4,'#000');p.r(28,17,6,4,K);p.r(28,26,6,3,K);p.r(28,14,2,1,'#fff6c0');p.r(32,14,2,1,'#fff6c0');
  p.r(20,18,1,10,Y);p.r(21,18,2,1,Y);p.r(21,27,2,1,Y);p.r(24,18,1,10,Y);p.r(22,18,2,1,Y);p.r(22,27,2,1,Y);
  /* x3 */
  const gl={x:['101','010','101'],3:['111','001','111','001','111']};
  const dr=(g,x,y,c)=>g.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')p.r(x+i*2,y+j*2,2,2,c)}));
  dr(gl.x,35,5,Y);dr(gl[3],42,3,Y);
  p.r(30,36,12,1,'#59657a');p.r(33,39,9,1,'#59657a');p.r(36,42,6,1,'#59657a');
  return p.cv},
 el(){const p=pxCanvas(48),W='#e6e9ee',A='#f1f3f5',R='#ef6a5a',T='#566070',G='#141a21';
  const car=(x,y,c)=>{p.r(x+1,y,6,12,c);p.r(x+2,y-1,4,1,c);p.r(x+2,y+12,4,1,c);p.r(x,y+2,1,3,'#000');p.r(x+7,y+2,1,3,'#000');p.r(x,y+8,1,3,'#000');p.r(x+7,y+8,1,3,'#000');p.r(x+2,y+3,4,3,'#0a1018')};
  car(6,4,A);car(20,2,W);car(34,5,W);car(13,19,T);car(27,21,T);
  /* last car, crossed out */
  car(20,34,'#2c333d');  p.circ(24,37,9,R,false);p.circ(24,37,8,R,false);for(let i=-6;i<=6;i++){p.r(23+i,36+i,2,2,R)}
  return p.cv},
 ca(){const p=pxCanvas(48),Y='#f2c76b',D='#b8923f',K='#10151b',R='#c0392b';
  const star=(cx,cy,c)=>{p.r(cx-1,cy-4,2,3,c);p.r(cx-4,cy-1,8,2,c);p.r(cx-3,cy-2,6,4,c);p.r(cx-2,cy+1,2,3,c);p.r(cx,cy+1,2,3,c);p.r(cx-1,cy-1,2,3,c)};
  /* medal on a ribbon: three rank chevrons and a star */
  p.r(13,28,8,16,R);p.r(27,28,8,16,R);p.r(13,42,3,3,K);p.r(18,42,3,3,K);p.r(27,42,3,3,K);p.r(32,42,3,3,K);
  p.circ(24,20,17,D,true);p.circ(24,20,15,Y,true);
  star(24,9,K);
  for(let k=0;k<3;k++){const base=19+k*5;for(let x=-9;x<=9;x++){p.r(24+x,base-Math.round((9-Math.abs(x))*.6),1,3,K)}}
  return p.cv},
 tk(){const p=pxCanvas(48),W='#e6e9ee',Y='#f2c76b',G='#2a3340',R='#ef6a5a';
  /* circuit outline with start gantry and apex curbs */
  const pts=[[10,36],[10,14],[16,8],[26,8],[30,13],[27,18],[22,20],[24,26],[34,22],[40,28],[38,38],[28,41],[16,41]];
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let k=-1;k<=1;k++)p.line(a[0]+k,a[1],b[0]+k,b[1],G);p.line(a[0],a[1],b[0],b[1],W)}
  p.r(7,26,8,2,Y);p.r(7,24,2,6,W);p.r(13,24,2,6,W);for(let i=0;i<4;i++)p.r(9+i*2,24,2,2,i%2?W:'#10151b');
  p.r(25,18,2,2,R);p.r(36,36,2,2,R);p.r(18,40,2,2,R);
  return p.cv},
 ra(){const p=pxCanvas(48),W='#e6e9ee',A='#f1f3f5',Y='#f2c76b',K='#0a1018',B='#7fb6d9',L='#bfe0f2',M='#59657a';
  /* rally car carving through a ford: spray fans out from the wheels, waves underneath */
  for(let i=0;i<5;i++){p.r(2+i*9,40+(i%2)*2,6,1,B);p.r(5+i*9,43-(i%2)*2,5,1,M)}
  p.r(19,10,10,22,A);p.r(20,8,8,2,A);p.r(20,32,8,2,A);p.r(17,13,2,6,'#000');p.r(29,13,2,6,'#000');p.r(17,25,2,6,'#000');p.r(29,25,2,6,'#000');
  p.r(20,14,8,5,K);p.r(20,27,8,3,K);p.r(21,8,2,1,'#fff6c0');p.r(25,8,2,1,'#fff6c0');p.r(22,20,4,6,Y);p.r(23,21,2,4,K);
  [[14,24],[11,20],[9,25],[12,29],[7,18],[10,33],[5,23]].forEach(q=>p.r(q[0],q[1],2,2,i0(q)?L:B));
  [[33,24],[36,20],[38,25],[35,29],[40,18],[37,33],[42,23]].forEach(q=>p.r(q[0],q[1],2,2,i0(q)?L:B));
  p.r(15,34,5,3,B);p.r(28,34,5,3,B);
  function i0(q){return (q[0]+q[1])%2===0}
  return p.cv}
};
const evIcon={race:'<svg class="ic" viewBox="0 0 22 22"><path d="M4 20V3h2v2h12l-3 4 3 4H6v7z" fill="#e6e9ee"/></svg>',rally:'<svg class="ic" viewBox="0 0 22 22"><path d="M2 18l7-11 4 6 3-3 4 8z" fill="#c9a36a"/><rect x="16" y="3" width="3" height="3" fill="#f2c76b"/></svg>',cutup:'<svg class="ic" viewBox="0 0 22 22"><rect x="2" y="8" width="8" height="5" fill="#6a7586"/><rect x="11" y="13" width="9" height="6" fill="#f1f3f5"/><path d="M12 4l6-2" stroke="#f2c76b" stroke-width="2"/></svg>'};

root.innerHTML=`
<section class="v8s" id="s8cards"><div class="hdr"><h2>SELECT <em>MODE</em></h2><div class="sp"></div>${crHTML}</div>
<div class="cards">
 <div class="card big" data-m="career"><span class="num">01</span><div class="ico" data-i="ca"></div><div class="tx"><h3>Career</h3><div class="sub">Rookie to legend / events &amp; prizes</div></div></div>
 <div class="card big" data-m="rally"><span class="num">02</span><div class="ico" data-i="ra"></div><div class="tx"><h3>Rally</h3><div class="sub">Water fords / new stages / take turns</div></div></div>
 <div class="card big" data-m="track"><span class="num">03</span><div class="ico" data-i="tk"></div><div class="tx"><h3>Track</h3><div class="sub">Tarmac circuit / race cars, 200 mph</div></div></div>
 <div class="qplabel"><i></i>QUICK PLAY<i></i></div>
 <div class="card mini" data-m="ta"><span class="num">04</span><div class="ico" data-i="ta"></div><div class="tx"><h3>Time Attack</h3><div class="sub">Solo / medals</div></div></div>
 <div class="card mini" data-m="mp"><span class="num">05</span><div class="ico" data-i="mp"></div><div class="tx"><h3>Multiplayer</h3><div class="sub">1-4 drivers / split screen</div></div></div>
 <div class="card mini" data-m="cutup"><span class="num">06</span><div class="ico" data-i="cu"></div><div class="tx"><h3>Cut-Up</h3><div class="sub">Traffic / combo score</div></div></div>
 <div class="card mini" data-m="elim"><span class="num">07</span><div class="ico" data-i="el"></div><div class="tx"><h3>Elimination</h3><div class="sub">Last place is out</div></div></div>
</div>
<div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="hint8">Arrows / 1-7 select &middot; Enter confirm &middot; Esc back</div><span style="width:90px"></span></div></section>

<section class="v8s" id="s8setup"><div class="hdr"><h2 id="suTitle">TIME <em>ATTACK</em></h2><div class="sp"></div>${crHTML}</div>
<div class="cols"><div class="pnl"><h4>Track</h4><div id="trkList"></div></div>
<div class="pnl"><div class="prev"><canvas id="trkPrev" width="480" height="320"></canvas></div><div class="tinfo" id="trkInfo"></div><div id="trkExtra"></div></div>
<div class="pnl"><div id="suCfg"></div><div id="suTod"></div><div id="suDrv"></div></div></div>
<div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="hint8" id="suHint"></div><button class="btn go" id="suGo"><span>Start</span></button></div></section>

<section class="v8s" id="s8career"><div class="hdr"><h2>CAREER <em id="cTitle">ROOKIE</em></h2><small id="cSub"></small><div class="sp"></div>${crHTML}</div>
<div class="cols" style="grid-template-columns:minmax(430px,56%) 1fr"><div class="pnl"><div class="rankbar" id="rankbar"></div><div class="evl" id="evList"></div></div><div class="pnl" id="evDet"></div></div>
<div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="hint8">Podium to clear an event &middot; final needs 3 events cleared</div><span style="width:90px"></span></div></section>

<section class="v8s clear" id="s8show"><div class="hdr"><h2 id="shTitle">GARAGE</h2><small id="shSub"></small><div class="sp"></div>${crHTML}</div>
<div class="lst" id="shList"></div><div class="stat" id="shStat"></div><div class="drag">Drag to rotate</div>
<div class="bot"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="gnav" id="shNav"><button class="btn" id="shPrev"><span>&lsaquo;</span></button><em id="shPos"></em><button class="btn" id="shNext"><span>&rsaquo;</span></button></div><div class="ptabs" id="shTabs"></div><div class="sw" id="shSw"></div><button class="btn" id="shLv" style="display:none"><span>Livery</span></button><div style="flex:1"></div><button class="btn go" id="shAct"><span>Select</span></button></div><div class="flash8" id="shFlash"></div><div class="shfade" id="shFade"></div></section>

<section class="v8s" id="s8res"><div class="box" id="resBox"></div></section>`;
$$('.ico',root).forEach(e=>{e.appendChild(IC[e.dataset.i]())});

/* ================= screen switching ================= */
const rawShow=show;let prevScr='menu';
show=n=>{const was=scr;rawShow(n);if(was!==n&&P.sfx&&['s8cards','s8setup','s8career','s8show','s8res','menu'].includes(n))P.sfx('whoosh');for(const id of SCREENS)$(id).classList.toggle('on',id===n);
 $$('.crv',root).forEach(e=>e.textContent=fmtCr(P.SV().cr));
 if(was==='s8show'&&n!=='s8show')studioOff();
 if(['menu','s8cards','s8setup','s8career','s8res'].includes(n))refreshMenuCars();
 if(n==='menu'&&P.menuStats)P.menuStats()};
function refreshMenuCars(){const sv=P.SV();for(let i=0;i<4;i++){const s=sv.sel[i];carChoices[i]=P.modelOf(s.id,s.alt)}}
const goBack={s8cards:()=>show('menu'),s8setup:()=>{if(isRL(ST.mode)&&ST.rstep===2){ST.rstep=1;renderSetup();return}show(ST.ret)},s8career:()=>show('s8cards'),s8res:()=>resContinue()};
const leaveShow=()=>{const r=SR.ret;if(r==='s8res_back'){renderSetup();show('s8setup');return}show(r);if(r==='s8setup')renderSetup();if(r==='s8career')renderCareer()};
function fadeTo(fn){const f=$('shFade');f.classList.add('on');setTimeout(()=>{try{fn()}catch(e){console.error('fadeTo',e&&e.stack||e)}setTimeout(()=>f.classList.remove('on'),260)},230)}
const inGrid=()=>CARDS()&&SR.view==='grid',inCar=()=>CARDS()&&SR.view==='car';
function openCar(id){const box=$('shList');SR.gridScroll=box?box.scrollTop:0;P.sfx&&P.sfx('select');fadeTo(()=>{SR.id=id;SR.alt=0;SR.view='car';renderShow()})}
function flipCar(d){const ord=(SR.order||[]).map(id=>BYID[id]);if(ord.length<2)return;const i=Math.max(0,ord.findIndex(c=>c.id===SR.id));SR.id=ord[(i+d+ord.length)%ord.length].id;SR.alt=0;P.sfx&&P.sfx('select');renderShow()}
function gridMove(d){const ord=(SR.order||[]);if(!ord.length)return;const i=Math.max(0,ord.indexOf(SR.id));SR.id=ord[Math.max(0,Math.min(ord.length-1,i+d))];const box=$('shList');$$('.gc.sel',box).forEach(x=>x.classList.remove('sel'));const el=box.querySelector('.gc[data-id="'+SR.id+'"]');if(el){el.classList.add('sel');el.scrollIntoView({block:'nearest'})}}
goBack.s8show=()=>{if(inCar()){fadeTo(()=>{SR.view='grid';renderShow();$('shList').scrollTop=SR.gridScroll||0});return}leaveShow()};
root.addEventListener('click',e=>{const b=e.target.closest('[data-a="back"]');if(b){(goBack[scr]||(()=>{}))()}});
const rawEsc=esc;esc=()=>{if(goBack[scr]){goBack[scr]();return}rawEsc()};
const RACE_RET=()=>{const c=P.lastCfg;return c&&c.ev?'s8career':(c&&c.mode?'s8setup':'s8cards')};
toSetup=()=>{if(scr==='menu'||scr==='setup'){openCards();return}if(RACE)P.cleanupRace();show(RACE_RET())};
function openCards(){show('s8cards');setFoc(foc)}
let foc=0;
function setFoc(i){const cs=$$('.card',root);foc=(i+cs.length)%cs.length;cs.forEach((c,k)=>c.classList.toggle('foc',k===foc))}
$$('.card',root).forEach((c,k)=>{c.onmouseenter=()=>setFoc(k);c.onclick=()=>pickMode(c.dataset.m)});
const barnIcon=d=>{const b=P.BARNS&&P.BARNS[d.name];if(!b||d.gravel)return '';const f=P.barnFound&&P.barnFound(b.car);return `<span class="bnh ${f?'got':''}" title="${f?'Barn find collected':'Barn find hidden here'}"><svg viewBox="0 0 16 16" width="15" height="15" shape-rendering="crispEdges"><path d="M8 1.5 1.5 7.5h2V14h3.6v-3.8h1.8V14h3.6V7.5h2z" fill="currentColor"/></svg></span>`};const isStg=i=>P.STAGES.indexOf(i)>=0,isTrk=i=>(P.TRK_TRACKS||[]).indexOf(i)>=0,okTrack=(m,i)=>m==='rally'?isStg(i):m==='track'?isTrk(i):(!isStg(i)&&!isTrk(i)),firstTrack=m=>m==='rally'?P.STAGES[0]:m==='track'?P.TRK_TRACKS[0]:0,isRL=m=>m==='rally'||m==='track';
function pickMode(m){if(m==='career'){ST.crank=null;ST.cev=null;openCareer()}else{ST.mode=m;P._to=m==='track';P._ro=m==='rally';if(isRL(m))ST.rstep=1;if(!okTrack(m,ST.track))ST.track=firstTrack(m);ST.ret='s8cards';if(m==='rally'&&P.rallyIntro){P.rallyIntro(()=>{renderSetup();show('s8setup');if(P.prewarmStages)setTimeout(P.prewarmStages,1500)},ST.track)}else{renderSetup();show('s8setup')}}}

/* ---- main menu ---- */
(function(){const ma=document.querySelector('.menuActions'),bt=ma.querySelectorAll('button');
 bt[0].innerHTML='<small>01</small> Play';bt[0].style.order=1;bt[0].onclick=openCards;
 const g=document.createElement('button');g.innerHTML='<small>02</small> Garage';g.style.order=2;g.onclick=()=>openShow('garage',{player:0,cap:null,ret:'menu'});
 const b=document.createElement('button');b.innerHTML='<small>03</small> Brand Central';b.style.order=3;b.onclick=()=>openShow('brand',{player:0,cap:null,ret:'menu'});
 ma.append(g,b);bt[1].style.order=4;bt[1].innerHTML='<small>04</small> Settings';
 const lg=$('logo');if(lg)lg.innerHTML='POLY<br><span>TOURISMO</span><small>GRAND TOUR / V9</small>';
 const mt=document.querySelector('.menuTop');if(mt){mt.querySelector('.brandMark').textContent='PT / 98';const sm=mt.querySelector('small');if(sm)sm.textContent='V9'}
 const f=document.createElement('div');f.className='mfoot';$('menu').appendChild(f);
 P.menuStats=()=>{const sv=P.SV();f.innerHTML='<span>Balance <b>'+fmtCr(sv.cr)+'</b></span><span>Career <b>'+P.RANKS[P.careerRank()].n+'</b></span><span>Races <b>'+sv.stats.races+'</b></span><span>Wins <b>'+sv.stats.wins+'</b></span><span style="margin-left:auto">Enter: play</span>'};
 P.menuStats()})();

/* ================= TRACK PREVIEW (map + elevation) ================= */
const TS=[];function tr(i){return TS[i]||(TS[i]=sampleTrack(D[i]))}
function mix3(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function drawTrack(cv,i,full){const T=tr(i),g=cv.getContext('2d'),W=cv.width,H=cv.height;g.clearRect(0,0,W,H);g.fillStyle='#07090c';g.fillRect(0,0,W,H);
 const mapH=full?H*.7:H,pad=full?22:3;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;for(let k=0;k<T.N;k++){x0=Math.min(x0,T.x[k]);x1=Math.max(x1,T.x[k]);z0=Math.min(z0,T.z[k]);z1=Math.max(z1,T.z[k]);y0=Math.min(y0,T.y[k]);y1=Math.max(y1,T.y[k])}
 const s=Math.min((W-pad*2)/(x1-x0),(mapH-pad*2)/(z1-z0)),ox=W/2-(x0+x1)/2*s,oz=mapH/2-(z0+z1)/2*s;
 if(full){g.strokeStyle='#ffffff0a';g.lineWidth=1;for(let x=0;x<W;x+=24){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,mapH);g.stroke()}for(let y=0;y<mapH;y+=24){g.beginPath();g.moveTo(0,y+.5);g.lineTo(W,y+.5);g.stroke()}}
 g.lineCap='butt';g.lineJoin='round';
 g.strokeStyle='#000';g.lineWidth=full?9:4;g.beginPath();for(let k=0;k<=T.N;k+=2){const q=k%T.N;k?g.lineTo(T.x[q]*s+ox,T.z[q]*s+oz):g.moveTo(T.x[q]*s+ox,T.z[q]*s+oz)}g.stroke();
 const yr=Math.max(1,y1-y0),LO=[58,104,128],HI=[242,199,107];g.lineWidth=full?4.5:2.2;
 for(let k=0;k<T.N;k+=2){const a=k,b=(k+2)%T.N,u=(T.y[a]-y0)/yr,c=mix3(LO,HI,u);g.strokeStyle=T.gap[a]?'#e6e9ee':`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;g.beginPath();g.moveTo(T.x[a]*s+ox,T.z[a]*s+oz);g.lineTo(T.x[b]*s+ox,T.z[b]*s+oz);g.stroke()}
 g.fillStyle='#e6e9ee';g.fillRect(T.x[0]*s+ox-3,T.z[0]*s+oz-3,6,6);
 if(full){for(const j of T.jumps||[]){g.fillStyle='#e6e9ee';g.beginPath();g.arc(T.x[j]*s+ox,T.z[j]*s+oz,4,0,7);g.fill()}
  const ph=H*.24,py=H-ph-8;g.fillStyle='#0b0e12';g.fillRect(10,py,W-20,ph);g.strokeStyle='#2a3340';g.strokeRect(10.5,py+.5,W-21,ph-1);
  g.fillStyle='#f1f3f522';g.beginPath();g.moveTo(10,py+ph);for(let k=0;k<=T.N;k+=3){const q=Math.min(k,T.N-1),x=10+(W-20)*k/T.N,y=py+ph-3-(T.y[q]-y0)/yr*(ph-10);g.lineTo(x,y)}g.lineTo(W-10,py+ph);g.fill();
  g.strokeStyle='#f1f3f5';g.lineWidth=1.6;g.beginPath();for(let k=0;k<T.N;k+=3){const x=10+(W-20)*k/T.N,y=py+ph-3-(T.y[k]-y0)/yr*(ph-10);k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
  g.fillStyle='#7b8594';g.font='9px monospace';g.textAlign='left';g.fillText('ELEV '+Math.round(y0)+'-'+Math.round(y1)+' M',16,py+12);g.textAlign='right';g.fillText(Math.round(T.L)+' M',W-16,py+12)}}

/* ================= TIME OF DAY preview (small pixel render) ================= */
const BIOME={grass:[90,150,82],sand:[214,178,122],snow:[226,234,244],city:[38,38,58],forest:[62,112,64],desert:[200,143,94],moor:[106,127,78],harbor:[168,170,168]};
const rgb=h=>[(h>>16)&255,(h>>8)&255,h&255];
const LIGHT={dawn:{t:[255,205,185],k:.9},day:{t:[255,255,255],k:1},sunset:{t:[255,150,100],k:.82},night:{t:[70,100,190],k:.34}};
function drawTod(cv,trk,tod){const g=cv.getContext('2d'),W=cv.width,H=cv.height,d=D[trk],tp=P.TOD[tod];
 const city=(d.look!=null?d.look:d.id)===3;let sk;
 if(tod==='day')sk=city?[0x6aa4e8,0xcfe6ff]:d.sky;else sk=tp.sky;if(city&&tod==='night')sk=d.sky;
 const hz=Math.round(H*.56),lt=LIGHT[tod],L=(c,k)=>c.map((v,i)=>Math.min(255,v*(lt.t[i]/255)*lt.k*(k||1)));
 const gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#'+sk[0].toString(16).padStart(6,'0'));gr.addColorStop(1,'#'+sk[1].toString(16).padStart(6,'0'));g.fillStyle=gr;g.fillRect(0,0,W,hz);
 const night=tod==='night';
 if(night){g.fillStyle='#fff';for(let i=0;i<46;i++){const x=(i*73%W),y=(i*37%Math.max(1,hz-6));g.fillRect(x,y,1,1)}}
 const sx={dawn:.78,day:.6,sunset:.2,night:.72}[tod]*W,sy={dawn:hz-9,day:10,sunset:hz-10,night:11}[tod];
 const rad=night?5:(tod==='day'?6:9);const sg=g.createRadialGradient(sx,sy,0,sx,sy,rad*3);sg.addColorStop(0,night?'#dfe8ffcc':'#fff2c0cc');sg.addColorStop(1,'#ffffff00');g.fillStyle=sg;g.fillRect(sx-rad*3,sy-rad*3,rad*6,rad*6);
 g.fillStyle=night?'#e8efff':(tod==='day'?'#fff7d8':'#ffd9a0');g.beginPath();g.arc(sx,sy,rad*.62,0,7);g.fill();
 /* mountains */
 const fog=tod==='day'?(city?[188,210,230]:rgb(d.fog)):rgb(tp.fog);
 for(let l=0;l<2;l++){const col=mix3(fog,L(BIOME[d.biome||d.off]||[100,100,100],.55),l?.55:.25);g.fillStyle=`rgb(${col[0]|0},${col[1]|0},${col[2]|0})`;g.beginPath();g.moveTo(0,hz);for(let x=0;x<=W;x+=2){const h=(Math.sin(x*.05+l*2.3)*.5+Math.sin(x*.13+l)*.3+.9)*(l?9:14);g.lineTo(x,hz-h)}g.lineTo(W,hz);g.fill()}
 /* ground */
 const gc=L(BIOME[d.biome||d.off]||[100,120,90]);g.fillStyle=`rgb(${gc[0]|0},${gc[1]|0},${gc[2]|0})`;g.fillRect(0,hz,W,H-hz);
 const gg=g.createLinearGradient(0,hz,0,H);gg.addColorStop(0,`rgba(${fog[0]|0},${fog[1]|0},${fog[2]|0},.55)`);gg.addColorStop(1,'#00000000');g.fillStyle=gg;g.fillRect(0,hz,W,H-hz);
 /* road */
 const rc=L(rgb(typeof d.road==='number'?d.road:0x3a3d44),1.1);const rcx=W*.5;
 g.fillStyle=`rgb(${rc[0]|0},${rc[1]|0},${rc[2]|0})`;g.beginPath();g.moveTo(rcx-2,hz);g.lineTo(rcx+2,hz);g.lineTo(W*.78,H);g.lineTo(W*.22,H);g.fill();
 g.fillStyle='#ffffffaa';for(let k=0;k<5;k++){const t=k/5,y0=hz+(H-hz)*(t*t),y1=hz+(H-hz)*((t+.09)*(t+.09));g.fillRect(rcx-1,y0,2,Math.max(1,y1-y0))}
 if(night){const cg=g.createLinearGradient(0,H,0,hz);cg.addColorStop(0,'#fff0c8aa');cg.addColorStop(1,'#fff0c800');g.fillStyle=cg;g.beginPath();g.moveTo(rcx-1,hz+4);g.lineTo(rcx+1,hz+4);g.lineTo(W*.7,H);g.lineTo(W*.3,H);g.fill();
  g.fillStyle='#ffe9a8';for(let k=0;k<5;k++){const t=(k+.5)/5,y=hz+(H-hz)*t*t,x=rcx+(W*.28)*t*1.15;g.fillRect(rcx-(x-rcx)-1,y-3*t-1,2,2);g.fillRect(x-1,y-3*t-1,2,2)}}
 if(tod==='sunset'||tod==='dawn'){g.fillStyle=tod==='sunset'?'#ff7a3a22':'#ffb88a22';g.fillRect(0,0,W,H)}
 if(night){g.fillStyle='#10206a33';g.fillRect(0,0,W,H)}}

/* ================= SETUP ================= */
const MODE_NAME={ta:'TIME <em>ATTACK</em>',mp:'LOCAL <em>MULTIPLAYER</em>',cutup:'CUT<em>-UP</em>',elim:'<em>ELIMINATION</em>',rally:'<em>RALLY</em>',track:'<em>TRACK</em>'};
const selCar=p=>{if(ST.mode==='rally'&&P.rallySel)return P.rallySel(p);if(ST.mode==='track'&&P.trackSel)return P.trackSel(p);const sv=P.SV();let s=sv.sel[p]||sv.sel[0];if(!P.owns(s.id,s.alt)){const o=P.ownedList()[0]||BYID.merc;s={id:o.id,alt:P.owns(o.id,0)?0:1};P.setSel(p,s.id,s.alt)}return s};
const effTod=()=>ST.todUser||D[ST.track].tod0||'day';
const seg=(items,cur)=>items.map(([v,l])=>`<button class="btn sm ${v===cur?'sel':''}" data-v="${v}"><span>${l}</span></button>`).join('');
function renderSetup(){const m=ST.mode;$('suTitle').innerHTML=MODE_NAME[m];
 $('trkList').innerHTML=D.map((d,i)=>!okTrack(m,i)?'':`<div class="trk ${i===ST.track?'sel':''}" data-i="${i}"><canvas width="56" height="42"></canvas><div><b>${d.name}</b><small>${P.TRACK_INFO[i].s} &middot; ${Math.round(tr(i).L)} m</small></div>${barnIcon(d)}</div>`).join('');
 $$('#trkList .trk',root).forEach(e=>{const i=+e.dataset.i;drawTrack(e.querySelector('canvas'),i,false);e.onclick=()=>{ST.track=i;renderSetup()}});
 if(!okTrack(m,ST.track))ST.track=firstTrack(m);
 const T=tr(ST.track);
 if(m==='rally'&&P.stageRender){const want=ST.track,cv=$('trkPrev'),g=cv.getContext('2d'),paint=img=>{g.fillStyle='#0c1218';g.fillRect(0,0,cv.width,cv.height);if(img){const h=cv.width*img.height/img.width;g.drawImage(img,0,(cv.height-h)/2,cv.width,h)}else{g.fillStyle='#8a949c';g.font='12px monospace';g.textAlign='center';g.fillText('RENDERING STAGE MAP...',cv.width/2,cv.height/2)}},c0=P.stageCached&&P.stageCached(want);
  if(c0)paint(c0);else{paint(null);P.stageRender(want).then(img=>{if(img&&ST.track===want&&ST.mode==='rally'&&cv.isConnected)paint(img)})}}
 else drawTrack($('trkPrev'),ST.track,true);
 let y0=1e9,y1=-1e9;for(let k=0;k<T.N;k++){y0=Math.min(y0,T.y[k]);y1=Math.max(y1,T.y[k])}
 $('trkInfo').innerHTML=`<span class="chip">${P.TRACK_INFO[ST.track].s}</span><span class="chip">${Math.round(T.L)} m</span><span class="chip">Climb ${Math.round(y1-y0)} m</span>`+(T.jumps&&T.jumps.length&&m!=='cutup'?'<span class="chip">Jump</span>':'')+(T.fords&&T.fords.length?`<span class="chip hot">${T.fords.length} water ford${T.fords.length>1?'s':''}</span>`:'')+(P.STAGES.includes(ST.track)?'<span class="chip hot">New stage</span>':'')+(isTrk(ST.track)?'<span class="chip hot">New circuit</span>':'')+((P.BARNS&&P.BARNS[D[ST.track].name]&&!D[ST.track].gravel)?'<span class="chip bn">Barn find</span>':'');
 const car=BYID[selCar(0).id];let ex='';
 if(m==='ta'){const tk=ST.rev?'r'+ST.track:ST.track,rec=P.SV().ta[tk]||{};ex=`<h4 style="margin:8px 0 4px">Medal times &middot; ${car.name}</h4><div class="medals">`+P.MEDALS.map((md,i)=>`<div class="${rec.medal!=null&&rec.medal<=i?'got':''}"><b style="color:${md.col}">${md.n}</b>${fmtT(P.medalTime(tk,car,i))}</div>`).join('')+`</div><div style="font-size:10px;letter-spacing:.16em;color:var(--dim)">BEST LAP <b style="color:var(--ac)">${fmtT(rec.best)}</b></div>`}
 $('trkExtra').innerHTML=ex;if(m==='rally'&&P.poiStrip){const eh=document.createElement('h4');eh.style.margin='10px 0 4px';eh.textContent='Points of interest';const ph=document.createElement('div');ph.className='rl-poi';$('trkExtra').append(eh,ph);P.poiStrip(ST.track,ph)}
 let cfg='';
 if(m==='elim')cfg+=`<div class="row8"><b>Knockout every</b><span class="seg" id="cIv">${seg([[20,'20s'],[30,'30s'],[45,'45s']],ST.iv||30)}</span></div><div class="row8"><b>Direction</b><span class="seg" id="cRev">${seg([['0','Forward'],['1','Reverse']],ST.rev?'1':'0')}</span></div>`;
 if(m==='ta'||m==='mp')cfg+=`<div class="row8"><b>Laps</b><span class="seg" id="cLaps">${seg([[2,'2'],[3,'3'],[4,'4'],[5,'5'],[8,'8'],[10,'10']],ST.laps)}</span></div><div class="row8"><b>Direction</b><span class="seg" id="cRev">${seg([['0','Forward'],['1','Reverse']],ST.rev?'1':'0')}</span></div><div class="row8"><b>Fuel &amp; pits</b><span class="seg" id="cEnd">${seg([['auto','Auto'],['1','On'],['0','Off']],ST.endurS||'auto')}</span></div>`;
 if(m==='rally'){const Tn=tr(ST.track),dist=Tn.L*(ST.rlaps||1),wxn=(P.WX[ST.wx||'clear']||{n:'CLEAR'}).n;cfg+=`<div class="rcfg"><h4>Stage configuration</h4><div class="row8"><b>Stage laps</b><span class="seg" id="cRL">${seg([[1,'1'],[2,'2'],[3,'3']],ST.rlaps)}</span></div><div class="row8"><b>Drivers</b><span class="seg" id="cPl">${seg([[1,'1'],[2,'2'],[3,'3'],[4,'4']],ST.players)}</span></div><div class="row8"><b>Weather</b><span class="seg" id="cWx">${seg(P.WX_ORDER.map(k=>[k,P.WX[k].n[0]+P.WX[k].n.slice(1).toLowerCase()]),ST.wx||'clear')}</span></div><div class="rsum"><div><small>Distance</small><b>${(dist/1000).toFixed(1)} km</b></div><div><small>Drivers</small><b>${ST.players}</b></div><div><small>Conditions</small><b>${wxn} &middot; ${(P.TOD[effTod()]||{n:''}).n}</b></div></div><small class="rnote">Drivers take turns, one car on the stage at a time. Fastest total wins.</small></div>`}
 if(m==='track'){const Tn=tr(ST.track),dist=Tn.L*(ST.rlaps||1),wxn=(P.WX[ST.wx||'clear']||{n:'CLEAR'}).n;cfg+=`<div class="rcfg"><h4>Circuit configuration</h4><div class="row8"><b>Race laps</b><span class="seg" id="cRL">${seg([[1,'1'],[2,'2'],[3,'3'],[5,'5']],ST.rlaps)}</span></div><div class="row8"><b>Drivers</b><span class="seg" id="cPl">${seg([[1,'1'],[2,'2'],[3,'3'],[4,'4']],ST.players)}</span></div><div class="row8"><b>Weather</b><span class="seg" id="cWx">${seg(P.WX_ORDER.map(k=>[k,P.WX[k].n[0]+P.WX[k].n.slice(1).toLowerCase()]),ST.wx||'clear')}</span></div><div class="rsum"><div><small>Distance</small><b>${(dist/1000).toFixed(1)} km</b></div><div><small>Drivers</small><b>${ST.players}</b></div><div><small>Conditions</small><b>${wxn} &middot; ${(P.TOD[effTod()]||{n:''}).n}</b></div></div><small class="rnote">Drivers take turns, one car on the circuit at a time. Fastest total wins. Medal times follow your car.</small></div>`}
 if(m==='mp'||m==='cutup'||m==='elim')cfg+=`<div class="row8"><b>Drivers</b><span class="seg" id="cPl">${seg([[1,'1'],[2,'2'],[3,'3'],[4,'4']],ST.players)}</span></div>`;
 if(m==='elim')cfg+=`<div class="row8"><b>CPU</b><span class="seg" id="cCpu">${seg([[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5'],[7,'7']].filter(a=>a[0]+ST.players<=8),Math.max(1,ST.cpus))}</span></div><div class="row8"><b>Level</b><span class="seg" id="cDif">${seg([[0,'Easy'],[1,'Normal'],[2,'Hard']],ST.diff)}</span></div><div class="row8"><b>CPU class</b><span class="seg" id="cCc">${seg([['auto','Auto'],['C','C'],['B','B'],['A','A'],['S','S']],ST.cc||'auto')}</span></div>`;
 if(m==='mp')cfg+=`<div class="row8"><b>CPU</b><span class="seg" id="cCpu">${seg([[0,'0'],[2,'2'],[3,'3'],[4,'4']].filter(a=>a[0]+ST.players<=8),ST.cpus)}</span></div><div class="row8"><b>Level</b><span class="seg" id="cDif">${seg([[0,'Easy'],[1,'Normal'],[2,'Hard']],ST.diff)}</span></div><div class="row8"><b>CPU class</b><span class="seg" id="cCc">${seg([['auto','Auto'],['C','C'],['B','B'],['A','A'],['S','S']],ST.cc||'auto')}</span></div>`;
 if(m==='cutup')cfg+=`<div class="row8"><b>Traffic</b><span class="seg" id="cTr">${seg([['light','Light'],['heavy','Heavy']],ST.traffic)}</span></div><div class="row8"><b>Clock</b><span class="seg" id="cTime">${seg([[90,'90s'],[120,'120s'],[180,'180s']],ST.time)}</span></div>`;

 if(ST.players>=2&&m!=='rally'&&m!=='track'&&m!=='ta'){const kc=(l,c)=>`<i class="kc${c?' '+c:''}">${l}</i>`,np=P.p2Keys==='numpad';cfg+=`<div class="p2kb"><h4>Player 2 keys <small>click a layout</small></h4><div class="kbs"><button class="kbo${np?'':' on'}" data-k="arrows"><div class="kg">${kc('PgUp','sh')}${kc('&uarr;','gas')}${kc('PgDn','sh')}${kc('&larr;','st')}${kc('&darr;','br')}${kc('&rarr;','st')}</div><b>Arrow keys</b><small>PgUp / PgDn shift</small></button><button class="kbo${np?' on':''}" data-k="numpad"><div class="kg">${kc('7','sh')}${kc('8','gas')}${kc('9','sh')}${kc('4','st')}${kc('5','br')}${kc('6','st')}</div><b>Numpad 8 4 5 6</b><small>7 down &middot; 9 up</small></button></div></div>`}
 if(m==='mp'||m==='elim')cfg+=`<div class="row8"><b>Weather</b><span class="seg" id="cWx">${seg(P.WX_ORDER.map(k=>[k,P.WX[k].n[0]+P.WX[k].n.slice(1).toLowerCase()]),ST.wx||'clear')}</span></div>`;
 $('suCfg').innerHTML=cfg;
 const td=effTod();$('suTod').innerHTML=`<div class="tod"><h4 style="margin:0 0 7px;font:700 10px var(--mn);letter-spacing:.3em;color:var(--dim)">TIME OF DAY</h4><canvas id="todPrev" width="168" height="70"></canvas><span class="seg" id="cTod">${seg(P.TOD_ORDER.map(k=>[k,P.TOD[k].n]),td)}</span></div>`;
 drawTod($('todPrev'),ST.track,td);
 const bind=(id,k,num)=>{const e=$(id);if(e)$$('button',e).forEach(b=>b.onclick=()=>{ST[k]=num?+b.dataset.v:b.dataset.v;if(k==='players'&&(ST.mode==='mp'||ST.mode==='elim')&&ST.players+ST.cpus>8)ST.cpus=8-ST.players;renderSetup()})};
 $$('.p2kb .kbo',root).forEach(b=>b.onclick=()=>{P.setP2Keys(b.dataset.k);P.sfx('select');renderSetup()});bind('cLaps','laps',1);bind('cRL','rlaps',1);bind('cIv','iv',1);bind('cWx','wx',0);bind('cEnd','endurS',0);{const e=$('cRev');if(e)$$('button',e).forEach(b=>b.onclick=()=>{ST.rev=b.dataset.v==='1';renderSetup()})}bind('cPl','players',1);bind('cCpu','cpus',1);bind('cDif','diff',1);bind('cCc','cc',0);bind('cTime','time',1);bind('cTr','traffic',0);bind('cTod','todUser',0);
 const np=m==='ta'?1:ST.players;let dv='<h4 style="margin:6px 0 8px;font:700 10px var(--mn);letter-spacing:.3em;color:var(--dim)">VEHICLES</h4>';
 for(let p=0;p<np;p++){const s=selCar(p),c=BYID[s.id];dv+=`<div class="drv" style="border-left-color:${['#f1f3f5','#f2c76b','#7fd68a','#ef6a5a'][p]}"><div><b>${np>1?'P'+(p+1)+' &middot; ':''}${c.name}${s.alt?' ALT':''}</b><input class="nm" data-p="${p}" maxlength="12" spellcheck="false" placeholder="Name (P${p+1})" value="${((ST.names||[])[p]||'').replace(/[<>&"]/g,'')}"><small>Class <span class="cls ${c.cls}">${c.cls}</span> &middot; ${c.type}${m==='rally'?' &middot; RALLY SPEC':''}</small><div class="fxrow">${fxChip(m==='rally'?{...c,off:Math.max(c.off,.9)}:c,!!D[ST.track].gravel)}</div></div><span class="lvth" data-id="${s.id}" data-alt="${s.alt?1:0}"></span><button class="btn sm" data-p="${p}"><span>Garage</span></button></div>`}
 $('suDrv').innerHTML=dv;$$('#suDrv .lvth',root).forEach(e=>{const t=P.livThumb&&P.livThumb(e.dataset.id,+e.dataset.alt,84);if(t)e.appendChild(t)});$$('#suDrv input.nm',root).forEach(i=>i.oninput=()=>{(ST.names=ST.names||[])[+i.dataset.p]=i.value});$$('#suDrv button',root).forEach(b=>b.onclick=()=>openShow('garage',{player:+b.dataset.p,cap:null,ret:'s8setup',rally:ST.mode==='rally',track:ST.mode==='track'}));
{const sec=$('s8setup'),r2=isRL(m)&&ST.rstep===2;sec.classList.toggle('rs1',isRL(m)&&!r2);sec.classList.toggle('rs2',r2);
  let st=$('suSteps');if(!st){st=document.createElement('div');st.id='suSteps';st.className='steps';$('suTitle').after(st)}
  st.style.display=isRL(m)?'':'none';st.innerHTML=`<i class="${r2?'':'on'}">1 &middot; ${m==='track'?'Circuit':'Stage'}</i><i class="${r2?'on':''}">2 &middot; Car</i>`;
  if(m==='rally')$('suTitle').innerHTML='<em>RALLY</em> '+(r2?'CAR SELECTION':'STAGE SETUP');if(m==='track')$('suTitle').innerHTML='<em>TRACK</em> '+(r2?'CAR SELECTION':'CIRCUIT SETUP');
  $('suGo').querySelector('span').textContent=isRL(m)&&!r2?'Next: Car >':'Start';
  if(r2){const wxn=(P.WX[ST.wx||'clear']||{n:'CLEAR'}).n;$('suDrv').insertAdjacentHTML('afterbegin',`<div class="rrecap"><b>${D[ST.track].name}</b><small>${(Math.round(T.L)*(ST.rlaps||1)/1000).toFixed(1)} km &middot; ${m==='track'?ST.laps:(ST.rlaps||1)} lap${(ST.rlaps||1)>1?'s':''} &middot; ${wxn} &middot; ${(P.TOD[effTod()]||{n:''}).n}</small></div>`)}}
 $('suHint').textContent=m==='track'?'One car on the circuit at a time &middot; pass the controller between runs &middot; fastest total wins':m==='rally'?'One car on the stage at a time &middot; pass the controller between runs &middot; fastest total wins':m==='ta'?'W / S + A / D &middot; Q / E shift (or double-tap W / S)':'P1 WASD &middot; P2 '+P.p2Name()+' &middot; P3 IJKL &middot; P4 TFGH';$('suHint').innerHTML=$('suHint').textContent}
/* custom driver names: trimmed, 12 chars, unique across players */
function cleanName(p,np){const nm=(ST.names||[])[p];let v=(nm||'').replace(/[<>&"]/g,'').trim().slice(0,12);if(!v)return null;for(let q=0;q<p;q++){const o=((ST.names||[])[q]||'').trim().slice(0,12);if(o&&o.toLowerCase()===v.toLowerCase())v=v.slice(0,10)+(p+1)}return v}
$('suGo').onclick=()=>{if(isRL(ST.mode)&&ST.rstep!==2){P.sfx('select');openShow('garage',{player:0,cap:null,ret:'s8setup',rally:ST.mode==='rally',track:ST.mode==='track',flow:true});return}
 const m=ST.mode,d=D[ST.track],np=m==='ta'?1:ST.players,humans=[];for(let p=0;p<np;p++){const s=selCar(p);humans.push({id:s.id,alt:s.alt,name:cleanName(p)})}
 const tod=effTod();let cfg;
 const endur=ST.endurS==='1'?true:ST.endurS==='0'?false:undefined;
 if(m==='ta')cfg={mode:'ta',track:ST.track,laps:ST.laps,humans,ai:[],tod,endur,rev:!!ST.rev};
 else if(m==='track')cfg={mode:'rally',circuit:true,track:ST.track,laps:ST.rlaps||2,humans,ai:[],tod,endur:false,weather:ST.wx||'clear'};
 else if(m==='rally')cfg={mode:'rally',track:ST.track,laps:ST.rlaps||2,humans,ai:[],tod,endur:false,weather:ST.wx||'clear'};
 else if(m==='mp'){const df=[{cl:['C','B'],sk:.78},{cl:['B','A'],sk:.88},{cl:['A','S'],sk:.97}][ST.diff];cfg={mode:'mp',track:ST.track,laps:ST.laps,humans,ai:ST.cpus?P.makeAI({n:ST.cpus,classes:(ST.cc&&ST.cc!=='auto')?[ST.cc]:df.cl,skill:df.sk,rally:!!d.gravel}):[],tod,endur,rev:!!ST.rev,weather:ST.wx||'clear'}}
 else if(m==='elim'){const df=[{cl:['C','B'],sk:.78},{cl:['B','A'],sk:.88},{cl:['A','S'],sk:.97}][ST.diff],n=Math.max(1,Math.min(ST.cpus||3,8-ST.players));cfg={mode:'elim',track:ST.track,laps:99,humans,ai:P.makeAI({n,classes:(ST.cc&&ST.cc!=='auto')?[ST.cc]:df.cl,skill:df.sk,rally:!!d.gravel}),tod,endur:false,rev:!!ST.rev,interval:ST.iv||30,weather:ST.wx||'clear'}}
 else cfg={mode:'cutup',track:ST.track,time:ST.time,humans,ai:[],traffic:ST.traffic,tod};
 P.launch(cfg)};

/* ================= CAREER ================= */
const CTOD=['day','sunset','dawn','night','day'];
function careerPick(ev){const sv=P.SV(),el=P.eligibleCars(ev.cap);let s=sv.sel[0];if(s&&P.owns(s.id,s.alt)&&el.some(c=>c.id===s.id))return{id:s.id,alt:s.alt};
 if(el.length){const rally=ev.type==='rally';el.sort((a,b)=>CLS.indexOf(b.cls)-CLS.indexOf(a.cls)||(rally?b.off-a.off:b.top-a.top));const c=el[0];return{id:c.id,alt:P.owns(c.id,0)?0:1}}
 const l=P.loanerFor(ev.cap,ev.type==='rally');return{id:l.id,alt:0,loan:true}}
function openCareer(){ST.ret='s8cards';renderCareer();show('s8career')}
const fxChip=(car,grv)=>{const f=P.surfFx(car,grv);return`<span class="fx ${f.g>=0?'up':'dn'}">${grv?'Gravel':'Tarmac'} ${f.g>=0?'+':''}${f.g}% grip</span>`+(f.t?`<span class="fx dn">${f.t}% speed</span>`:'')};
function fxBoth(car){const r=P.surfRank(car);return`<div class="fxrow"><span class="fx ${r.tar==='good'?'up':r.tar==='poor'?'dn':''}">Tarmac &middot; ${r.tar==='good'?'strong':r.tar==='ok'?'fair':'weak'}</span><span class="fx ${r.grv==='good'?'up':r.grv==='poor'?'dn':''}">Gravel &middot; ${r.grv==='good'?'strong':r.grv==='ok'?'fair':'weak'}</span></div>`}
function renderCareer(){const cr=P.careerRank(),rk=ST.crank==null?cr:Math.min(ST.crank,cr),R_=P.RANKS[rk];
 $('cTitle').textContent=R_.n;$('cSub').textContent='Rank '+(rk+1)+' / '+P.RANKS.length;
 $('rankbar').innerHTML=P.RANKS.map((r,i)=>`<div class="rk ${i<cr?'done':''} ${i===rk?'cur':''}" data-r="${i}" style="${i>cr?'opacity:.35':'cursor:pointer'}">${r.n}</div>`).join('');
 $$('#rankbar .rk',root).forEach(e=>e.onclick=()=>{if(+e.dataset.r<=cr){ST.crank=+e.dataset.r;ST.cev=null;renderCareer()}});
 const evs=P.EVENTS.filter(e=>e.rank===rk);if(!ST.cev||P.EVENTS.find(e=>e.id===ST.cev).rank!==rk)ST.cev=(evs.find(e=>!P.careerDone(e.id)&&!P.eventLocked(e))||evs[0]).id;
 const todOf=e=>e.track===3?'night':CTOD[(e.idx+rk)%CTOD.length];
 $('evList').innerHTML=evs.map(e=>{const dn=P.careerDone(e.id),lk=P.eventLocked(e),t=D[e.track];return`<div class="ev ${e.id===ST.cev?'sel':''} ${lk?'lock':''} ${dn?'fin':''}" data-id="${e.id}"><canvas width="64" height="44"></canvas><div class="evt"><b>${e.name}</b><small>${t.name} &middot; ${t.gravel?'Gravel':'Tarmac'} &middot; ${P.TOD[todOf(e)].n}</small><small>${e.type==='cutup'?'Target '+e.target.toLocaleString('en-US')+' pts':e.laps+' laps &middot; '+(e.n+1)+' cars'}${e.cap?' &middot; max class '+e.cap:' &middot; any class'}</small></div><div class="st">${lk?'LOCKED':dn?'<i>CLEARED'+(dn.place?' '+ord(dn.place):'')+'</i>':'<i>'+fmtCr(e.prize)+'</i>'}</div></div>`}).join('');
 $$('#evList .ev',root).forEach((e,i)=>{drawTrack(e.querySelector('canvas'),evs[i].track,false);e.onclick=()=>{ST.cev=e.dataset.id;renderCareer()}});
 const ev=P.EVENTS.find(e=>e.id===ST.cev),lk=P.eventLocked(ev),pick=careerPick(ev),car=BYID[pick.id],t=D[ev.track],tod=todOf(ev),TT=tr(ev.track);let y0=1e9,y1=-1e9;for(let k=0;k<TT.N;k++){y0=Math.min(y0,TT.y[k]);y1=Math.max(y1,TT.y[k])}
 $('evDet').innerHTML=`<div class="big">${ev.name}</div><div class="prev"><canvas id="evPrev" width="480" height="320"></canvas></div>
 <div class="tinfo"><span class="chip">${ev.type}</span><span class="chip">${t.name}</span><span class="chip">${t.gravel?'Gravel':'Tarmac'}</span><span class="chip">${Math.round(TT.L)} m</span><span class="chip">Climb ${Math.round(y1-y0)} m</span><span class="chip">${P.TOD[tod].n}</span>${ev.type==='cutup'?`<span class="chip">Target ${ev.target.toLocaleString('en-US')}</span>`:`<span class="chip">${ev.laps} laps</span><span class="chip">${ev.n+1} cars</span>`}${ev.cap?`<span class="chip hot">Max class ${ev.cap}</span>`:''}</div>
 <div class="row8"><b>Prize</b><span style="color:var(--ac2);font-weight:700">${fmtCr(ev.prize)}</span><span class="chip" style="margin:0">${ev.type==='cutup'?'Reach the target':'Top 3 to clear'}</span></div>
 <div class="drv"><div><b>${car.name}${pick.alt?' ALT':''}${pick.loan?' &middot; loaner':''}</b><small>Class <span class="cls ${car.cls}">${car.cls}</span> &middot; ${car.type}${pick.loan?' &middot; no owned car fits':''}</small><div class="fxrow">${fxChip(car,!!t.gravel)}</div></div><button class="btn sm" id="evGar"><span>Garage</span></button></div>
 <div style="flex:1"></div><button class="btn go" id="evGo" ${lk?'disabled':''}><span>${lk?lk:'Start event'}</span></button>`;
 drawTrack($('evPrev'),ev.track,true);
 $('evGar').onclick=()=>openShow('garage',{player:0,cap:ev.cap,ret:'s8career',rally:ev.type==='rally'});
 $('evGo').onclick=()=>{if(lk)return;P.launch(Object.assign(P.eventCfg(ev,pick),{tod}))}}

/* ================= STUDIO (garage + Brand Central) : native res, MSAA, bloom ================= */
let S=null,STU={on:false},lastPhotoKey='';
const colCache={};
function bodyColor(idx){if(colCache[idx])return colCache[idx];const m=CAR_MODELS[idx];let best=null,bn=-1;if(m)m.traverse(o=>{if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(mm=>{const n=(mm.name||'')+(o.name||'');if(/glass|window|tire|tyre|wheel|rim|light|lamp|interior|chrome|grill|brake|plate|logo/i.test(n))return;const c=mm.color;if(!c)return;const l=c.r*.3+c.g*.59+c.b*.11;if(l<.05)return;const cnt=(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count:0)+(o.name==='paint'?1e9:0);if(cnt>bn){bn=cnt;best=o.name==='paint'?c.clone().convertLinearToSRGB():c}})}});
 return colCache[idx]=best?'#'+best.getHexString():'#888'}
function wallTex(){const cv=document.createElement('canvas');cv.width=4;cv.height=256;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#0b0d11');gr.addColorStop(.45,'#1f242c');gr.addColorStop(.8,'#313843');gr.addColorStop(1,'#232830');g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t}
function makePost(){
 const quadGeo=new THREE.PlaneGeometry(2,2),camQ=new THREE.OrthographicCamera(-1,1,1,-1,0,1),scQ=new THREE.Scene(),quad=new THREE.Mesh(quadGeo);quad.frustumCulled=false;scQ.add(quad);
 const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const mk=(fs,u)=>new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:u,depthTest:false,depthWrite:false,toneMapped:false});
 const bright=mk('uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(th,th+.55,l);gl_FragColor=vec4(c*k,1.);}',{t:{value:null},th:{value:1.7}});
 const blur=mk('uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 s=texture2D(t,vUv).rgb*.227027;vec2 o1=d*1.3846,o2=d*3.2308;s+=(texture2D(t,vUv+o1).rgb+texture2D(t,vUv-o1).rgb)*.3162+(texture2D(t,vUv+o2).rgb+texture2D(t,vUv-o2).rgb)*.0703;gl_FragColor=vec4(s,1.);}',{t:{value:null},d:{value:new THREE.Vector2()}});
 const comp=mk('uniform sampler2D tS,b0,b1,b2;uniform float bl,ex;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec3 c=texture2D(tS,vUv).rgb+(texture2D(b0,vUv).rgb*.5+texture2D(b1,vUv).rgb*.6+texture2D(b2,vUv).rgb*.7)*bl;c*=ex;c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);float v=smoothstep(1.05,.25,length((vUv-.5)*vec2(1.25,1.))*1.15);c*=mix(.72,1.,v);c=pow(max(c,0.),vec3(1./2.2));c+=(h(vUv*1531.)-.5)/255.;gl_FragColor=vec4(c,1.);}',{tS:{value:null},b0:{value:null},b1:{value:null},b2:{value:null},bl:{value:.4},ex:{value:.78}});
 const hdr=R.capabilities.isWebGL2&&!!R.extensions.get('EXT_color_buffer_float');
 const o={W:0,H:0,rt:{},resize(w,h){if(o.W===w&&o.H===h)return;o.W=w;o.H=h;for(const k in o.rt)o.rt[k].dispose();
   const opt=(s)=>({minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:hdr?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false,stencilBuffer:false});
   o.rt={S:new THREE.WebGLRenderTarget(w,h,Object.assign(opt(),{depthBuffer:true,samples:4}))};
   for(let l=0;l<3;l++){const s=Math.max(2,w>>(l+1)),q=Math.max(2,h>>(l+1));o.rt['H'+l]=new THREE.WebGLRenderTarget(s,q,opt());o.rt['V'+l]=new THREE.WebGLRenderTarget(s,q,opt())}
   o.rt.B=new THREE.WebGLRenderTarget(Math.max(2,w>>1),Math.max(2,h>>1),opt())},
  pass(m,rt){quad.material=m;R.setRenderTarget(rt);R.render(scQ,camQ)},
  render(scene,cam){const w=R.domElement.width,h=R.domElement.height;o.resize(w,h);const rt=o.rt;
   R.setRenderTarget(rt.S);R.clear();R.render(scene,cam);
   bright.uniforms.t.value=rt.S.texture;o.pass(bright,rt.B);let src=rt.B.texture,sw=rt.B.width,sh=rt.B.height;
   for(let l=0;l<3;l++){blur.uniforms.t.value=src;blur.uniforms.d.value.set(1/(l?rt['V'+(l-1)].width:sw),0);o.pass(blur,rt['H'+l]);blur.uniforms.t.value=rt['H'+l].texture;blur.uniforms.d.value.set(0,1/rt['H'+l].height);o.pass(blur,rt['V'+l]);src=rt['V'+l].texture}
   comp.uniforms.tS.value=rt.S.texture;comp.uniforms.b0.value=rt.V0.texture;comp.uniforms.b1.value=rt.V1.texture;comp.uniforms.b2.value=rt.V2.texture;o.pass(comp,null)}};
 return o}
function ensureStudio(){if(S)return S;
 const sc=new THREE.Scene();sc.background=new THREE.Color(0x0b0d11);
 /* environment: dark room with softboxes, baked to PMREM for glossy paint reflections */
 const env=new THREE.Scene();env.background=new THREE.Color(0x07080b);
 const box=(w,h,x,y,z,rx,ry,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(c[0],c[1],c[2]),side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);env.add(m)};
 box(14,5,0,9,0,Math.PI/2,0,[1.6,1.6,1.7]);box(2,8,-9,4,-1,0,Math.PI/2,[1.3,1.4,1.9]);box(2,8,9,4,-1,0,Math.PI/2,[1.4,1.3,1.2]);box(10,3,0,3,-10,0,0,[1.0,1.1,1.3]);box(8,3,0,2,10,0,Math.PI,[.9,.9,1.0]);
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(18,18,16,32,1,true),new THREE.MeshBasicMaterial({color:0x14171c,side:THREE.BackSide}));wall.position.y=6;env.add(wall);
 const pm=new THREE.PMREMGenerator(R);sc.environment=pm.fromScene(env,.03).texture;
 /* walls / floor */
 const wl=new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,48,1,true),new THREE.MeshBasicMaterial({map:wallTex(),side:THREE.BackSide,fog:false}));wl.position.y=7;sc.add(wl);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(15,64),new THREE.MeshLambertMaterial({color:0x16191f}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;sc.add(floor);
 const dark=new THREE.Mesh(new THREE.CircleGeometry(24,48),new THREE.MeshBasicMaterial({color:0x07080a}));dark.rotation.x=-Math.PI/2;dark.position.y=-.02;sc.add(dark);
 const wl2=new THREE.Mesh(new THREE.RingGeometry(1,1.012,96),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:.9}));wl2.rotation.x=-Math.PI/2;wl2.position.y=.012;wl2.scale.set(1.95,3.4,1);
 const wl3=new THREE.Mesh(new THREE.RingGeometry(1,1.006,96),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:.35}));wl3.rotation.x=-Math.PI/2;wl3.position.y=.012;wl3.scale.set(2.4,4.1,1);
 /* visible light fixtures (bloom) */
 const lightMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(1.6,1.6,1.8)});
 const top=new THREE.Mesh(new THREE.TorusGeometry(4.6,.09,8,96),lightMat);top.rotation.x=Math.PI/2;top.position.y=8.6;sc.add(top);
 for(const sx of[]){const st=new THREE.Mesh(new THREE.BoxGeometry(.1,5,.2),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(sx<0?.9:1.2,sx<0?1.1:1.1,sx<0?1.5:.9)}));st.position.set(sx*14,3.5,-9);st.rotation.y=sx*.5;sc.add(st)}
 /* lights */
 sc.add(new THREE.HemisphereLight(0x8fa0c0,0x10131a,.12));
 const key=new THREE.SpotLight(0xfff1de,1.15,40,.5,.7,1.2);key.position.set(6,11,7);key.target.position.set(0,.3,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;key.shadow.radius=4;key.shadow.camera.near=4;key.shadow.camera.far=30;sc.add(key,key.target);
 const rim=new THREE.DirectionalLight(0x7fb4ff,1.1);rim.position.set(-8,4,-8);sc.add(rim);
 const rim2=new THREE.DirectionalLight(0xffd2b0,.35);rim2.position.set(9,3,-7);sc.add(rim2);
 const turn=new THREE.Group();sc.add(turn);turn.add(wl2,wl3);
 const cam=new THREE.PerspectiveCamera(30,1,.1,100);
 S={sc,cam,turn,floor,idx:-1,car:null,mir:null,post:makePost(),key};return S}
function setStudioCar(idx){ensureStudio();if(S.idx===idx)return;const src=CAR_MODELS[idx];if(!src)return;
 if(S.car){S.turn.remove(S.car)}
 const model=src.clone(true),car=new THREE.Group(),centered=new THREE.Group();centered.add(model);car.add(centered);centered.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),size=bb.getSize(new THREE.Vector3()),ctr=bb.getCenter(new THREE.Vector3()),sc=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(size.x,size.z,.001),h=size.y*sc;
 centered.position.copy(ctr).multiplyScalar(-1);car.scale.setScalar(sc);car.rotation.y=(size.x>size.z?Math.PI/2:0)+Math.PI;
 const wrap=new THREE.Group();wrap.add(car);car.position.y=h/2-(ctr.y-bb.min.y)*0+0;
 /* put the lowest point on the floor */ wrap.position.y=0;car.position.y=0;centered.position.y=-bb.min.y;centered.position.x=-ctr.x;centered.position.z=-ctr.z;
 car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m&&m.isMeshStandardMaterial){m.envMapIntensity=.4}})}});
 const mir=wrap.clone(true);mir.scale.y=-1;mir.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 S.turn.add(wrap);S.car=wrap;S.mir=mir;S.idx=idx;lastPhotoKey=''}
function studioOn(){if(STU.on)return;STU.on=true;document.body.classList.add('studio');$('c').style.imageRendering='auto';STU.tm=R.toneMapping;R.toneMapping=THREE.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;sizeStudio()}
function sizeStudio(){const d=Math.min(devicePixelRatio||1,2);R.setPixelRatio(1);R.setSize(Math.max(2,innerWidth*d|0),Math.max(2,innerHeight*d|0),false)}
function studioOff(){if(!STU.on)return;STU.on=false;document.body.classList.remove('studio');$('c').style.imageRendering='';R.toneMapping=STU.tm;R.setRenderTarget(null);rs()}
const rs0=rs;rs=()=>{if(STU.on)sizeStudio();else rs0()};
function drawShow(dt){studioOn();ensureStudio();const car=BYID[SR.id],idx=P.modelOf(SR.id,SR.alt);if(S.idx!==idx&&CAR_MODELS[idx])setStudioCar(idx);
 if(P.LV)P.LV.studio(S,SR);
 SR.ang+=dt*(SR.drag?0:.35)+SR.vel*dt;SR.vel*=Math.pow(.05,dt);S.turn.rotation.y=SR.ang;
 const W=R.domElement.width,H=R.domElement.height;S.cam.aspect=W/H;const ca=.55+Math.sin(T0*.17)*.12;{const dz=CARDS()?8.4:10.2;S.cam.position.set(Math.sin(ca)*dz,(CARDS()?2.2:2.5)+Math.sin(T0*.23)*.15,Math.cos(ca)*dz)};S.cam.lookAt(0,.75,0);
 S.cam.setViewOffset(W,H,-W*(CARDS()?.075:0),H*.02,W,H);S.cam.updateProjectionMatrix();
 R.setScissorTest(false);R.setViewport(0,0,W,H);S.post.render(S.sc,S.cam);R.setRenderTarget(null);
 const key=idx+'|'+(window.PT7&&window.PT7.photos[idx]?1:0);if(key!==lastPhotoKey&&CAR_MODELS[idx]){lastPhotoKey=key;fillPhotos(idx)}}

/* ---- garage cards: every car as a card, owned in colour, the rest blacked out ---- */
try{SR.of=localStorage.getItem('pt9-ownfirst')==='1'}catch(e){SR.of=false}
const THQ=[];let thRun=0,thIO=null;
/* thumbnails: one small private renderer draws every car (real model, real paint) into a cached canvas */
let TH=null;const THC=new Map();
function thumbFor(id){if(THC.has(id))return THC.get(id);
 if(!TH){const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(336,200,false);r.setClearColor(0,0);
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x56606c,1.05));const d=new THREE.DirectionalLight(0xfff4e6,1.0);d.position.set(5,8,7);sc.add(d);const d2=new THREE.DirectionalLight(0xbcd4ff,.45);d2.position.set(-6,3,-5);sc.add(d2);
  const cam=new THREE.PerspectiveCamera(28,336/200,.1,100);cam.position.set(5.6,2.5,8.4);cam.lookAt(0,.8,0);TH={r,sc,cam}}
 const car=BYID[id],idx=P.modelOf(id,0),src=CAR_MODELS[idx];if(!src)return null;
 const model=src.clone(true),car_=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);car_.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);car_.scale.setScalar(k);car_.rotation.y=(sz.x>sz.z?Math.PI/2:0)+Math.PI;TH.sc.add(car_);
 TH.r.render(TH.sc,TH.cam);const cv=document.createElement('canvas');cv.width=336;cv.height=200;cv.getContext('2d').drawImage(TH.r.domElement,0,0);TH.sc.remove(car_);
 THC.set(id,cv);return cv}
function pumpThumbs(){if(thRun)return;thRun=1;const go=()=>{const j=THQ.shift();if(!j){thRun=0;return}try{if(j.cv.isConnected){const t=thumbFor(j.id);if(t){j.cv.getContext('2d').drawImage(t,0,0,j.cv.width,j.cv.height);j.cv.classList.add('rdy')}}}catch(e){}setTimeout(go,8)};setTimeout(go,10)}
function cardHTML(c,sv){const o=!c.lk;return `<div class="gc ${o?'':'lock'} ${c.barn&&!o?'bn':''} ${c.id===SR.id&&o?'sel':''} ${c.off?'off':''}" data-id="${c.id}"><div class="th"><canvas width="336" height="200" data-id="${c.id}"></canvas>${!o&&c.barn?'<i>?</i>':''}</div><b>${o||!c.barn?c.name:'???'}</b><small><span class="cls ${c.cls}">${c.cls}</span>${c.off?'Class cap':o?c.type:(c.barn?'Hidden on a map':'Not owned')}</small></div>`}
function cardsHTML(list,sv){
 const reg=list.filter(c=>!c.barn),barn=list.filter(c=>c.barn),cats=(P.CATS||[]).filter(k=>reg.some(c=>c.cat===k));
 const own=c=>!c.lk&&!c.off;let h='',order=[];
 const nOwn=list.filter(c=>!c.lk).length;
 h+=`<div class="gtools"><button class="of ${SR.of?'on':''}" data-of="1"><span></span>Owned first</button><em>${nOwn} / ${list.length} cars</em></div><div class="cats">`+cats.map(k=>`<button data-jump="${k}">${k}<i>${reg.filter(c=>c.cat===k).length}</i></button>`).join('')+(barn.length?`<button data-jump="__barn">Barn finds<i>${barn.length}</i></button>`:'')+'</div>';
 let used=new Set();
 if(SR.of){const mine=reg.filter(c=>!c.lk);if(mine.length){h+=`<div class="gh" data-sec="__own">Your cars<i>${mine.length}</i></div><div class="gg">`+mine.map(c=>cardHTML(c,sv)).join('')+'</div>';mine.forEach(c=>{used.add(c.id);if(own(c))order.push(c.id)})}}
 for(const k of cats){const v=reg.filter(c=>c.cat===k&&!used.has(c.id));if(!v.length)continue;h+=`<div class="gh" data-sec="${k}">${k}<i>${v.length}</i></div><div class="gg">`+v.map(c=>cardHTML(c,sv)).join('')+'</div>';v.forEach(c=>{if(own(c))order.push(c.id)})}
 if(barn.length){h+=`<div class="gh barn" data-sec="__barn">Barn finds<i>${barn.filter(c=>!c.lk).length} / ${barn.length}</i></div><div class="gg">`+barn.map(c=>cardHTML(c,sv)).join('')+'</div>';barn.forEach(c=>{if(own(c))order.push(c.id)})}
 SR.order=order;return h}
function bindCards(list){const box=$('shList');
 $$('.gc',box).forEach(e=>e.onclick=()=>{if(!((P.SV().owned[e.dataset.id]||0)>0)||e.classList.contains('off')){P.sfx&&P.sfx('back');return}openCar(e.dataset.id)});
 $$('[data-of]',box).forEach(b=>b.onclick=()=>{SR.of=!SR.of;try{localStorage.setItem('pt9-ownfirst',SR.of?'1':'0')}catch(e){}P.sfx&&P.sfx('select');renderShow();$('shList').scrollTop=0});
 $$('[data-jump]',box).forEach(b=>b.onclick=()=>{const t=box.querySelector(`.gh[data-sec="${b.dataset.jump}"]`);if(t)box.scrollTo({top:t.offsetTop-44,behavior:'smooth'})});
 if(thIO)thIO.disconnect();thIO=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){thIO.unobserve(en.target);THQ.push({cv:en.target,id:en.target.dataset.id});pumpThumbs()}}),{root:box,rootMargin:'160px'});
 THQ.length=0;$$('.gc canvas',box).forEach(cv=>{const t=THC.get(cv.dataset.id);if(t){cv.getContext('2d').drawImage(t,0,0,cv.width,cv.height);cv.classList.add('rdy')}else thIO.observe(cv)});
 const sel=box.querySelector('.gc.sel');if(sel&&!SR.noScroll){const r=sel.getBoundingClientRect(),b=box.getBoundingClientRect();if(r.top<b.top+40||r.bottom>b.bottom)sel.scrollIntoView({block:'center'})}}
function fillPhotos(idx){const box=$('shPhotos');if(!box)return;let ph=window.PT7&&(window.PT7.photos[idx]||(()=>{try{return window.PT7.makePhotos(idx)}catch(e){return null}})());box.innerHTML='';
 for(let i=0;i<3;i++){const cv=document.createElement('canvas');cv.width=96;cv.height=60;const g=cv.getContext('2d');g.fillStyle='#14181d';g.fillRect(0,0,96,60);if(ph&&ph[i]){try{g.drawImage(ph[i],0,0,96,60)}catch(e){}}box.appendChild(cv)}}
function openShow(kind,o){SR.sec=0;P._ro=!!o.rally&&kind==='garage';P._to=!!o.track&&kind==='garage';SR.trk=!!o.track;SR.view='grid';SR.lv=false;SR.kind=kind;SR.player=o.player||0;SR.cap=o.cap==null?null:o.cap;SR.ret=o.ret||'menu';SR.rally=!!o.rally;SR.flow=!!o.flow;
 const list=showList();if(kind==='garage'){const s=SR.rally?P.rallySel(SR.player):SR.trk?P.trackSel(SR.player):P.SV().sel[SR.player];const ok=list.find(c=>c.id===s.id&&!c.off&&!c.lk);const f=ok||list.find(c=>!c.off&&!c.lk)||list.find(c=>!c.lk)||BYID.merc;SR.id=f.id;SR.alt=(ok&&P.owns(f.id,s.alt))?s.alt:(P.owns(f.id,0)?0:1)}
 else{if(!BYID[SR.id])SR.id='merc';if(SR.alt&&!P.owns(SR.id,1))SR.alt=0}
 if(SR.flow){SR.cat=SR.trk?(BYID[SR.id].tdiv||'PRO'):(BYID[SR.id].rdiv||'WRC');SR.sec=1}
 renderShow();show('s8show');}
function showList(){const sv=P.SV();let l=SORTED.map(c=>({...c,off:false}));if(SR.rally&&SR.kind==='garage')return l.filter(c=>P.RALLY_CARS.includes(c.id));if(SR.trk&&SR.kind==='garage')return l.filter(c=>P.TRACK_CARS.includes(c.id));l=l.filter(c=>!c.rallyOnly&&!c.trackOnly);if(SR.kind==='brand')l=l.filter(c=>!c.barn);if(SR.kind==='garage'){l.forEach(c=>{c.lk=!((sv.owned[c.id]||0)>0);c.off=SR.cap!=null&&CLS.indexOf(c.cls)>CLS.indexOf(SR.cap)})}return l}
const CARDS=()=>SR.kind==='garage'&&!SR.rally&&!SR.trk;
function statBars(c,tn){const f=tn?P.tuneFx(tn,false):{top:1,acc:1,grip:1,brk:1},fg=tn?P.tuneFx(tn,true):{grip:1};
 const gt=P.gearTops(c).map(v=>v*2.23694*f.top),hi=gt[gt.length-1];const n=(v,a,b)=>clamp((v-a)/(b-a),0,1);
 /* [label, tuned bar, text, ratio vs stock, stock bar] */
 return{bars:[
  ['Top speed',n(hi,75,210),Math.round(hi)+' mph',f.top,n(hi/f.top,75,210)],
  ['Accel',n(c.acc*f.acc,18,40),(120/(c.acc*f.acc)).toFixed(1)+' s',f.acc,n(c.acc,18,40)],
  ['Handling',n(c.grip*f.grip,.9,1.12),Math.round(c.grip*f.grip*100),f.grip,n(c.grip,.9,1.12)],
  ['Braking',n(c.brk*f.brk,.88,1.18),Math.round(c.brk*f.brk*100),f.brk,n(c.brk,.88,1.18)],
  ['Off-road',clamp(c.off*fg.grip,0,1),Math.round(c.off*fg.grip*100)+'%',fg.grip,c.off]],gt}}
const barHTML=b=>{const pc=Math.round((b[3]-1)*100),w=Math.round(b[1]*100),w0=Math.round(b[4]*100);let ex='',lbl='';
 if(pc>0){ex=`<s class="up" style="left:${w0}%;width:${Math.max(1,w-w0)}%"></s>`;lbl=` <b class="dl up">+${pc}%</b>`}
 else if(pc<0){ex=`<s class="dn" style="left:${w}%;width:${Math.max(1,w0-w)}%"></s>`;lbl=` <b class="dl dn">${pc}%</b>`}
 return `<div class="bar"><span>${b[0]}</span><i><u style="width:${Math.min(w,w0)}%"></u>${ex}</i><em>${b[2]}${lbl}</em></div>`};
function tuneHTML(car){const t=P.tuneGet(car.id,SR.alt);
 return `<div class="tune"><div class="th"><b>TUNING</b><button class="btn sm" id="tuReset"><span>Reset</span></button></div>`+P.TUNE.map(d=>{const v=t[d.k],pips=[];for(let i=-d.r;i<=d.r;i++)pips.push(`<i class="${i===0?'ctr ':''}${(v>0&&i>0&&i<=v)||(v<0&&i<0&&i>=v)?'on':''}"></i>`);
  return `<div class="tr"><span>${d.n}</span><button class="btn sm" data-k="${d.k}" data-d="-1"><span>&lsaquo;</span></button><div class="pp5">${pips.join('')}</div><button class="btn sm" data-k="${d.k}" data-d="1"><span>&rsaquo;</span></button><em>${v===0?'STOCK':v<0?d.lo:d.hi}${v&&d.r>1?' '+Math.abs(v):''}</em></div>`}).join('')+`<div class="tn">Applies to races &amp; events. Time Attack always runs stock so medals stay fair.</div></div>`}
function renderShow(){SR.alt=0;const kind=SR.kind,sv=P.SV(),list=showList(),car=BYID[SR.id],owned=P.owns(car.id,0),ownAlt=P.owns(car.id,1);
 $('shTitle').innerHTML=kind==='garage'?(SR.rally?'RALLY <em>GARAGE</em>':SR.trk?'TRACK <em>GARAGE</em>':'YOUR <em>GARAGE</em>'):'BRAND <em>CENTRAL</em>';$('shSub').textContent=kind==='garage'?(SR.flow?(D[ST.track].name+' · '+(Math.round(tr(ST.track).L)*(ST.rlaps||1)/1000).toFixed(1)+' km · '+(ST.rlaps||1)+' lap'+((ST.rlaps||1)>1?'s':'')+' · '+((P.WX[ST.wx||'clear']||{n:'CLEAR'}).n)+' · '+((P.TOD[effTod()]||{n:''}).n)+' · '+ST.players+' driver'+(ST.players>1?'s':'')):SR.trk?'Circuit cars only / free to use':SR.rally?'Rally-spec all-wheel-drive cars with gravel tyres / free to use':(SR.cap?'Class '+SR.cap+' and below':'')):'Buy cars';
 const RG=(SR.rally||SR.trk)&&kind==='garage',dc=c=>RG?(SR.trk?c.tdiv:c.rdiv):c.cat,cats=RG?(SR.trk?['PRO','CLUB']:['WRC','CASUAL']):['ALL',...(P.CATS||[]),...(kind==='brand'?['OWNED']:[])],cnt=k=>list.filter(c=>k==='ALL'||(k==='OWNED'?(sv.owned[c.id]||0)>0:dc(c)===k)).length;
 if(!cats.includes(SR.cat))SR.cat=cats[0];
 const vis=list.filter(c=>SR.cat==='ALL'||(SR.cat==='OWNED'?(sv.owned[c.id]||0)>0:dc(c)===SR.cat));
const secMode=true;let h='',last=null;
 if(CARDS()){h=cardsHTML(list,sv)}
 else if(secMode&&!SR.sec){h='<div class="secs">'+cats.filter(k=>k!=='ALL'&&cnt(k)).concat(RG?[]:['ALL']).map(k=>{const v=list.filter(c=>k==='ALL'||(k==='OWNED'?(sv.owned[c.id]||0)>0:dc(c)===k));const lo=Math.min(...v.map(c=>c.price));return `<button class="sect" data-cat="${k}"><b>${k==='ALL'?'ALL CARS':k}</b><small>${v.length} cars${kind==='brand'&&k!=='OWNED'?' &middot; from '+fmtCr(lo):''}</small></button>`}).join('')+'</div>'}
 else{
  if(secMode)h+=`<button class="secback" data-back="1"><span>&lsaquo; SECTIONS</span><i>${SR.cat==='ALL'?'ALL CARS':SR.cat} &middot; ${vis.length}</i></button>`;
  else h+='<div class="cats">'+cats.filter(k=>cnt(k)||k==='ALL').map(k=>`<button class="${k===SR.cat?'sel':''}" data-cat="${k}">${k==='ALL'?'ALL':k==='OWNED'?'OWNED':k}<i>${cnt(k)}</i></button>`).join('')+'</div>';
  for(const c of vis){if(c.cls!==last){last=c.cls;h+=`<div class="ch"><span class="cls ${c.cls}">${c.cls}</span> &nbsp;Class ${c.cls}</div>`}const o=(sv.owned[c.id]||0)>0;
   h+=`<div class="ci ${c.id===SR.id?'sel':''} ${c.off?'off':''}" data-id="${c.id}"><b>${c.name}</b><small>${kind==='brand'?(o?'Owned':fmtCr(c.price)):(c.off?'Class cap':c.type)}</small></div>`}}
 $('shList').innerHTML=h;$('shList').classList.toggle('cards',CARDS());$('s8show').classList.toggle('gv-grid',inGrid());$('s8show').classList.toggle('gv-car',inCar());if(inCar()){const o=SR.order||[];$('shPos').textContent=(o.indexOf(SR.id)+1)+' / '+o.length}if(CARDS())bindCards(list);$$('#shList .cats button',root).forEach(b=>b.onclick=()=>{SR.cat=b.dataset.cat;const v=list.filter(c=>SR.cat==='ALL'||(SR.cat==='OWNED'?(sv.owned[c.id]||0)>0:dc(c)===SR.cat));if(v.length&&!v.some(c=>c.id===SR.id)){SR.id=v[0].id;SR.alt=0}P.sfx('select');renderShow();$('shList').scrollTop=0});$$('#shList .ci',root).forEach(e=>e.onclick=()=>{SR.id=e.dataset.id;if(!P.owns(SR.id,SR.alt))SR.alt=0;renderShow()});
 $$('#shList .sect',root).forEach(b=>b.onclick=()=>{SR.cat=b.dataset.cat;SR.sec=1;const v=list.filter(c=>SR.cat==='ALL'||(SR.cat==='OWNED'?(sv.owned[c.id]||0)>0:dc(c)===SR.cat));if(v.length&&!v.some(c=>c.id===SR.id)){SR.id=v[0].id;SR.alt=0}P.sfx('select');renderShow();$('shList').scrollTop=0});
 $$('#shList .secback',root).forEach(b=>b.onclick=()=>{SR.sec=0;P.sfx('select');renderShow();$('shList').scrollTop=0});
 const sel=$$('#shList .ci.sel',root)[0];if(sel)sel.scrollIntoView({block:'nearest'});
 const tn=kind==='garage'&&owned?P.tuneGet(car.id,SR.alt):null,sb=statBars(car,tn),bars=sb.bars,gt=sb.gt;
 $('shStat').innerHTML=`<div class="nm">${car.name}${SR.alt?' <span style="color:var(--ac2);font-size:.6em">ALT</span>':''}</div><div class="tp">${car.type} &middot; ${car.drive}</div>${SR.flow?`<input id="shNm" class="nmi" maxlength="12" spellcheck="false" placeholder="Name (P${SR.player+1})" value="${((ST.names||[])[SR.player]||'').replace(/[<>&"]/g,'')}">`:''}
 <div class="pp"><small>Perf.<br>points</small><b>${P.pp(car)}</b><span class="cls ${car.cls}">${car.cls}</span></div>
 ${bars.map(barHTML).join('')}
 ${fxBoth(car)}
 <div class="gears9" style="grid-template-columns:repeat(${gt.length<=6?3:gt.length<=8?4:5},1fr)">${gt.map((v,i)=>`<div><small>GEAR ${i+1}</small>${Math.round(v)}</div>`).join('')}</div>
 <div class="spec">${kind==='brand'?'Price<b>'+fmtCr(car.price)+'</b>':'Status<b>'+(owned?'Owned':'Not owned')+'</b>'}</div>${kind==='garage'&&owned?tuneHTML(car):'<div class="photos" id="shPhotos"></div>'}`;
 if(kind==='garage'&&owned){$$('#shStat .tr button',root).forEach(b=>b.onclick=()=>{const k=b.dataset.k;P.tuneSet(car.id,SR.alt,k,P.tuneGet(car.id,SR.alt)[k]+ +b.dataset.d);P.sfx('select');renderShow()});$('tuReset').onclick=()=>{P.tuneReset(car.id,SR.alt);P.sfx('select');renderShow()}}
 const lvb=$('shLv');const lvOk=kind==='garage'&&owned&&P.owns(car.id,SR.alt)&&!!P.LV;lvb.style.display=lvOk?'':'none';if(!lvOk)SR.lv=false;lvb.querySelector('span').textContent=SR.lv?'Stats':'Livery';lvb.onclick=()=>{SR.lv=!SR.lv;P.sfx('select');renderShow()};
 if(SR.lv&&lvOk)P.LV.panel($('shStat'),SR);
 lastPhotoKey='';
 const m0=P.modelOf(car.id,0),m1=P.modelOf(car.id,1);
 $('shSw').innerHTML='';$('shSw').style.display='none';
 $$('#shSw .swb',root).forEach(e=>e.onclick=()=>{SR.alt=+e.dataset.alt;renderShow()});
 let tabs='';if(kind==='garage'&&SR.ret==='s8setup'&&ST.mode!=='ta'){for(let p=0;p<ST.players;p++)tabs+=`<button class="btn sm ${p===SR.player?'sel':''}" data-p="${p}"><span>P${p+1}</span></button>`}
 $('shTabs').innerHTML=tabs;$$('#shTabs button',root).forEach(b=>b.onclick=()=>{SR.player=+b.dataset.p;const s=SR.rally?P.rallySel(SR.player):SR.trk?P.trackSel(SR.player):sv.sel[SR.player];if(P.owns(s.id,s.alt)){SR.id=s.id;SR.alt=s.alt}renderShow()});
 const act=$('shAct');const altOwn=SR.alt?ownAlt:owned;act.classList.remove('off');
 if(kind==='brand'){const price=SR.alt?car.altPrice:car.price;
  if(altOwn){act.innerHTML='<span>Owned</span>';act.classList.add('off')}
  else if(SR.alt&&!owned){act.innerHTML='<span>Buy car first</span>';act.classList.add('off')}
  else{act.innerHTML='<span>Buy '+fmtCr(price)+'</span>';if(sv.cr<price){act.classList.add('off');act.innerHTML='<span>Need '+fmtCr(price-sv.cr)+' more</span>'}}}
 else{const off=list.find(c=>c.id===car.id).off;act.classList.toggle('off',off||!altOwn);act.innerHTML='<span>'+(off?'Class cap':altOwn?(SR.flow?(SR.player<ST.players-1?'Next driver >':(SR.trk?'Start race':'Start stage')):'Select'):'Locked')+'</span>'}
 $$('.crv',root).forEach(e=>e.textContent=fmtCr(sv.cr))}
$('shPrev').onclick=()=>flipCar(-1);$('shNext').onclick=()=>flipCar(1);
$('shStat').addEventListener('input',e=>{if(e.target.id==='shNm')(ST.names=ST.names||[])[SR.player]=e.target.value});
$('shAct').onclick=()=>{const car=BYID[SR.id];
 if(SR.kind==='brand'){if(P.buy(car.id,SR.alt)){P.sfx('buy');const f=$('shFlash');f.textContent='Purchased / '+car.name+(SR.alt?' alt':'');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');renderShow()}}
 else{const it=showList().find(c=>c.id===car.id);if(it.off||!P.owns(car.id,SR.alt))return;if(SR.rally){const sv=P.SV();(sv.rsel=sv.rsel||[])[SR.player]={id:car.id,alt:SR.alt?1:0};P.save()}else if(SR.trk){const sv=P.SV();(sv.tsel=sv.tsel||[])[SR.player]={id:car.id,alt:SR.alt?1:0};P.save()}else P.setSel(SR.player,car.id,SR.alt);P.sfx('select');
  if(SR.flow){if(SR.player<ST.players-1){openShow('garage',{player:SR.player+1,cap:null,ret:'s8setup',rally:SR.rally,track:SR.trk,flow:true});return}ST.rstep=2;$('suGo').click();ST.rstep=1;return}
  leaveShow();}};
(function(){const el=$('s8show');let lx=0;el.addEventListener('pointerdown',e=>{if(e.target.closest('.lst,.stat,.bot,.hdr'))return;SR.drag=true;lx=e.clientX;el.setPointerCapture(e.pointerId)});el.addEventListener('pointermove',e=>{if(!SR.drag)return;const d=e.clientX-lx;lx=e.clientX;SR.ang+=d*.01;SR.vel=d*.5});el.addEventListener('pointerup',()=>{SR.drag=false});el.addEventListener('pointercancel',()=>{SR.drag=false})})();

/* ================= RESULTS ================= */
let RES=null;
P.renderResults=res=>{RES=res;const mode=res.mode;
 let h=`<h1>${res.title}</h1><div class="sub">${res.sub}</div>`;
 if(res.promo)h+=`<div class="promo">Promoted &middot; ${res.promo.n} rank unlocked</div>`;
 if(res.goal)h+=`<span class="goal ${res.goal.ok?'ok':'no'}">${res.goal.txt}</span>`;
 if(res.medal!=null&&res.medal>=0){const md=P.MEDALS[res.medal];h+=`<span class="medalbig" style="background:${md.col}">${md.n} medal</span>`}
 res.notes.forEach(n=>h+=`<span class="goal ok">${n}</span>`);
 if(mode==='cutup'){h+='<table class="rt"><tr><th>#</th><th>Driver</th><th>Car</th><th>Score</th><th>Detail</th><th>Cr.</th></tr>'+res.rows.map(r=>`<tr class="hum"><td class="pl">${r.place}</td><td><b style="color:${r.col}">${r.name}</b></td><td>${r.car}</td><td><b>${r.score.toLocaleString('en-US')}</b></td><td style="font-size:10px;color:var(--dim)">${r.extra}</td><td style="color:var(--ac2)">${fmtCr(r.cr)}</td></tr>`).join('')+'</table>'}
 else if(mode==='ta'){const r=res.rows[0];h+=`<table class="rt"><tr><th>Lap</th><th>Time</th></tr>`+(r.laps||[]).map((t,i)=>`<tr class="${t===r.best?'hum':''}"><td class="pl">${i+1}</td><td>${fmtT(t)}${t===r.best?'  best':''}</td></tr>`).join('')+`</table><div style="font-size:11px;letter-spacing:.16em;color:var(--dim)">TOTAL <b style="color:#fff">${fmtT(r.time)}</b></div>`}
 else h+='<table class="rt"><tr><th>Pos</th><th>Driver</th><th>Car</th><th>Time</th><th>Best lap</th></tr>'+res.rows.map(r=>`<tr class="${r.human?'hum':''}"><td class="pl">${r.place}</td><td><b style="${r.human?'color:'+r.col:''}">${r.name}${r.loan?' (loaner)':''}</b></td><td>${r.car}</td><td>${r.time!=null?fmtT(r.time):(r.txt?r.txt:(r.lapsDown?'+'+r.lapsDown+' lap':'...'))}</td><td style="color:var(--ac)">${r.best!=null?fmtT(r.best):'--'}</td></tr>`).join('')+'</table>';
 h+='<div>'+res.pay.map(p=>`<div class="pay"><span>${p.l}</span><span>+${fmtCr(p.v)}</span></div>`).join('')+`<div class="pay tot"><span>Total earned</span><span>+${fmtCr(res.total)}</span></div><div class="pay"><span>Balance</span><span>${fmtCr(res.balance)}</span></div></div>`;
 const career=res.cfg&&res.cfg.ev;
 h+=`<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rcCont"><span>${career?'Career hub':'Continue'}</span></button><button class="btn" id="rcRetry"><span>Retry</span></button><button class="btn" id="rcBrand"><span>Brand Central</span></button><button class="btn" id="rcMenu"><span>Main menu</span></button></div>`;
 $('resBox').innerHTML=h;paused=true;show('s8res');
 $('rcCont').onclick=resContinue;$('rcRetry').onclick=()=>{startRace()};$('rcBrand').onclick=()=>{P.cleanupRace();openShow('brand',{player:0,cap:null,ret:'s8res_back'})};$('rcMenu').onclick=()=>{P.cleanupRace();show('menu')}};
function resContinue(){const cfg=RES&&RES.cfg;P.cleanupRace();if(cfg&&cfg.ev){if(RES.promo)ST.crank=null;renderCareer();show('s8career')}else{renderSetup();show('s8setup')}}

/* ================= keys ================= */
let cheatBuf='';
addEventListener('keydown',e=>{
 if(scr==='s8cards'){if(e.code==='ArrowRight'||e.code==='KeyD')setFoc(foc+1);else if(e.code==='ArrowLeft'||e.code==='KeyA')setFoc(foc-1);else if(e.code==='ArrowDown'||e.code==='KeyS')setFoc(foc<3?3+Math.min(3,foc+(foc>0?1:0)):foc);else if(e.code==='ArrowUp'||e.code==='KeyW')setFoc(foc>=3?Math.min(2,Math.max(0,foc-3)):foc);else if(/^Digit[1-7]$/.test(e.code))pickMode($$('.card',root)[+e.code[5]-1].dataset.m);else if(e.code==='Enter'||e.code==='Space')pickMode($$('.card',root)[foc].dataset.m);return}
 if(scr==='s8show'){if(e.target&&e.target.tagName==='INPUT')return;if(SR.kind==='brand'){cheatBuf=(cheatBuf+(e.key.length===1?e.key.toLowerCase():'')).slice(-13);if(cheatBuf.endsWith('hakannowant')){cheatBuf='';const sv=P.SV();sv.owned={merc:1};sv.sel=sv.sel.map(()=>({id:'merc',alt:0}));P.save();SR.id='merc';SR.alt=0;renderShow();return}
  if(cheatBuf.endsWith('hakanwantsall')){cheatBuf='';const sv=P.SV();CARS.forEach(c=>{sv.owned[c.id]=3});P.save();renderShow();return}}
  if(CARDS()){if(inGrid()){if(e.code==='ArrowLeft'||e.code==='ArrowUp'){e.preventDefault();gridMove(-1)}else if(e.code==='ArrowRight'||e.code==='ArrowDown'){e.preventDefault();gridMove(1)}else if(e.code==='Enter'){if((P.SV().owned[SR.id]||0)>0)openCar(SR.id)}return}
   if(e.code==='ArrowLeft'||e.code==='KeyQ')flipCar(-1);else if(e.code==='ArrowRight'||e.code==='KeyE')flipCar(1);else if(e.code==='Enter')$('shAct').click();return}
  const list=(CARDS()&&SR.order)?SR.order.map(id=>BYID[id]):showList().filter(c=>!SR.sec||SR.cat==='ALL'||(SR.cat==='OWNED'?(P.SV().owned[c.id]||0)>0:((SR.rally||SR.trk)&&SR.kind==='garage'?(SR.trk?c.tdiv:c.rdiv):c.cat)===SR.cat)),i=Math.max(0,list.findIndex(c=>c.id===SR.id));if(!list.length)return;if(e.code==='ArrowDown'){SR.id=list[Math.min(list.length-1,i+1)].id;SR.alt=P.owns(SR.id,SR.alt)?SR.alt:0;renderShow()}else if(e.code==='ArrowUp'){SR.id=list[Math.max(0,i-1)].id;SR.alt=P.owns(SR.id,SR.alt)?SR.alt:0;renderShow()}else if(e.code==='ArrowLeft')SR.vel-=3;else if(e.code==='ArrowRight')SR.vel+=3;else if(e.code==='Enter')$('shAct').click();return}
 if(scr==='s8setup'&&e.code==='Enter'){$('suGo').click();return}
 if(scr==='menu'&&e.code==='Enter'){openCards();return}
 if(scr==='s8res'&&e.code==='Enter'){resContinue()}});

/* ================= frame loop ================= */
frame=function(n){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
 if(RACE&&(scr==='game'||scr==='pause'||scr==='s8res')){if(!paused)step(dt);drawRace(dt);if(scr==='game')hudUpdate()}
 else if(scr==='s8show'){if(!inGrid())drawShow(dt)}
 else if(scr==='menu'||scr==='s8cards'||scr==='s8setup'||scr==='s8career'||scr==='s8res'){MS=MS||menuScene();MS.tick(Math.max(0,T0));R.setScissorTest(false);R.setViewport(0,0,R.domElement.width,R.domElement.height);R.render(MS.sc,MS.cam)}};
/* pause menu */
(function(){const b=$('pause').querySelector('.b'),opt=[...b.querySelectorAll('button')].pop();b.innerHTML='<button id="pRes">Resume</button><button id="pRst">Restart</button><button id="pQuit">Quit to menu</button>';b.appendChild(opt);
 $('pRes').onclick=()=>resume();$('pRst').onclick=()=>{startRace()};$('pQuit').onclick=()=>{const r=RACE_RET();P.cleanupRace();show(r);if(r==='s8setup')renderSetup();if(r==='s8career')renderCareer()};
 $('pause').querySelector('.tb').textContent='Paused'})();
P.studioDbg=()=>S;P.ui={openCards,openShow,renderSetup,renderCareer,ST,SR};
document.title='Poly Tourismo v9';
refreshMenuCars();MS=null;
})();
