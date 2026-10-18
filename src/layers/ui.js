/* ===== Poly Tourismo v9 layer: UI (menu, mode cards, setup, career hub, studio garage / Brand Central, results) ===== */
(function v9ui(){
'use strict';
const P=window.PT8,CARS=P.CARS,BYID=P.BYID,CLS=P.CLS,fmtCr=P.fmtCr,fmtT=P.fmtT,ord=P.ord,SORTED=P.SORTED;
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const root=document.createElement('div');root.id='v8';document.body.appendChild(root);
const SCREENS=['s8cards','s8setup','s8career','s8show','s8res'];
const ST={mode:'ta',track:0,laps:3,players:1,cpus:3,diff:1,time:120,traffic:'light',todUser:null,ret:'s8cards',cev:null,crank:null};
const SR={kind:'garage',player:0,cap:null,ret:'s8setup',id:'merc',alt:0,ang:.6,vel:0,drag:false,rally:false};
const crHTML='<div class="crbox"><small>BALANCE</small><b class="crv"></b></div>';

/* ================= pixel icons (drawn at 40x40, shown crisp) ================= */
function pxCanvas(n){const cv=document.createElement('canvas');cv.width=cv.height=n;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 const o={cv,g,r:(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0)},
  circ:(cx,cy,rad,c,fill)=>{g.fillStyle=c;for(let y=-rad;y<=rad;y++)for(let x=-rad;x<=rad;x++){const d=Math.hypot(x,y);if(fill?d<=rad+.2:(d<=rad+.35&&d>=rad-1.0))g.fillRect(cx+x,cy+y,1,1)}},
  line:(x0,y0,x1,y1,c)=>{g.fillStyle=c;const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx-dy;for(;;){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x0+=sx}if(e2<dx){e+=dx;y0+=sy}}}};return o}
const IC={
 ta(){const p=pxCanvas(40),W='#e6e9ee',A='#6fd3ee',G='#2a3340',Y='#f2c76b';
  p.circ(20,23,14,G,true);p.circ(20,23,14,W,false);p.circ(20,23,13,W,false);p.r(17,5,6,3,W);p.r(19,8,2,4,W);p.r(29,9,4,3,W);p.r(31,8,2,2,W);
  for(let i=0;i<12;i++){const a=i/12*6.283;const x=20+Math.round(Math.cos(a)*11),y=23+Math.round(Math.sin(a)*11);p.r(x,y,1,1,i%3?'#566070':W)}
  p.line(20,23,20,14,A);p.line(21,23,21,14,A);p.line(20,23,27,27,Y);p.circ(20,23,2,W,true);
  /* checker */p.r(2,31,2,2,W);p.r(4,33,2,2,W);p.r(6,31,2,2,W);p.r(2,35,2,2,'#566070');
  return p.cv},
 mp(){const p=pxCanvas(48),W='#e6e9ee',A='#6fd3ee',Y='#f2c76b',G='#161c24',L='#3a4452';
  /* two stacked screens (split view), each with a road + car */
  const scr=(y,col,cx)=>{p.r(2,y,44,20,G);p.r(2,y,44,1,L);p.r(2,y+19,44,1,L);p.r(2,y,1,20,L);p.r(45,y,1,20,L);
   p.r(2,y+12,44,8,'#232b36');for(let x=4;x<44;x+=8)p.r(x,y+15,4,1,'#59657a');
   p.r(cx,y+9,10,5,col);p.r(cx+2,y+7,5,3,col);p.r(cx+3,y+8,3,2,'#0a1018');p.r(cx+1,y+13,2,2,'#000');p.r(cx+7,y+13,2,2,'#000');p.r(cx+9,y+10,1,2,W);
   p.r(4,y+3,3,2,col);p.r(9,y+3,12,1,L)};
  scr(3,A,22);scr(25,Y,12);
  p.r(2,23,44,2,W);/* divider */p.r(21,22,6,4,W);p.r(22,23,4,2,'#0a1018');
  return p.cv},
 cu(){const p=pxCanvas(48),W='#e6e9ee',A='#6fd3ee',Y='#f2c76b',R='#ef6a5a',T='#7b8696',G='#141a21';
  const car=(x,y,c,up)=>{p.r(x+1,y,6,14,c);p.r(x+2,y-1,4,1,c);p.r(x+2,y+14,4,1,c);p.r(x,y+3,1,3,'#000');p.r(x+7,y+3,1,3,'#000');p.r(x,y+9,1,3,'#000');p.r(x+7,y+9,1,3,'#000');
   p.r(x+2,y+(up?3:7),4,3,'#0a1018');p.r(x+2,y+(up?11:2),4,2,'#0a1018');if(up){p.r(x+1,y,2,1,'#fff6c0');p.r(x+5,y,2,1,'#fff6c0')}else{p.r(x+1,y+13,2,1,R);p.r(x+5,y+13,2,1,R)}};
  p.r(4,0,40,48,G);p.r(4,0,2,48,W);p.r(42,0,2,48,W);
  for(let y=2;y<48;y+=10){p.r(17,y,2,5,'#59657a');p.r(29,y,2,5,'#59657a')}
  car(7,6,T,0);car(31,2,T,0);car(19,18,'#5b6677',0);
  car(19,32,A,1);
  /* near-miss sparks + trail */
  p.r(16,31,1,5,Y);p.r(28,33,1,5,Y);p.r(14,34,2,1,Y);p.r(28,36,2,1,Y);p.r(22,47,4,1,A);
  p.r(35,22,5,1,Y);p.r(36,24,4,1,Y);p.r(12,20,5,1,Y);
  return p.cv},
 ca(){const p=pxCanvas(40),W='#e6e9ee',Y='#f2c76b',A='#6fd3ee',D='#b8923f';
  p.r(12,6,16,2,Y);p.r(12,8,16,8,Y);p.r(13,16,14,3,Y);p.r(16,19,8,3,Y);p.r(18,22,4,6,D);p.r(14,28,12,3,Y);p.r(12,31,16,3,D);
  p.r(5,8,5,2,Y);p.r(5,10,2,6,Y);p.r(7,16,3,2,Y);p.r(30,8,5,2,Y);p.r(33,10,2,6,Y);p.r(30,16,3,2,Y);
  p.r(15,10,2,4,W);p.r(16,9,1,1,W);p.r(22,6,2,2,'#fff');p.r(2,36,36,1,'#566070');
  p.r(6,34,3,2,A);p.r(11,34,3,2,A);p.r(16,34,3,2,A);
  return p.cv}
};
const evIcon={race:'<svg class="ic" viewBox="0 0 22 22"><path d="M4 20V3h2v2h12l-3 4 3 4H6v7z" fill="#e6e9ee"/></svg>',rally:'<svg class="ic" viewBox="0 0 22 22"><path d="M2 18l7-11 4 6 3-3 4 8z" fill="#c9a36a"/><rect x="16" y="3" width="3" height="3" fill="#f2c76b"/></svg>',cutup:'<svg class="ic" viewBox="0 0 22 22"><rect x="2" y="8" width="8" height="5" fill="#6a7586"/><rect x="11" y="13" width="9" height="6" fill="#6fd3ee"/><path d="M12 4l6-2" stroke="#f2c76b" stroke-width="2"/></svg>'};

root.innerHTML=`
<section class="v8s" id="s8cards"><div class="hdr"><h2>SELECT <em>MODE</em></h2><div class="sp"></div>${crHTML}</div>
<div class="cards">
 <div class="card" data-m="ta"><span class="num">01</span><div class="ico" data-i="ta"></div><div class="tx"><h3>Time Attack</h3><div class="sub">Solo / medals</div></div></div>
 <div class="card" data-m="mp"><span class="num">02</span><div class="ico" data-i="mp"></div><div class="tx"><h3>Local Multiplayer</h3><div class="sub">1-4 drivers / split screen</div></div></div>
 <div class="card" data-m="cutup"><span class="num">03</span><div class="ico" data-i="cu"></div><div class="tx"><h3>Cut-Up</h3><div class="sub">Traffic / combo score</div></div></div>
 <div class="card" data-m="career"><span class="num">04</span><div class="ico" data-i="ca"></div><div class="tx"><h3>Career</h3><div class="sub">Rookie to legend</div></div></div>
</div>
<div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="hint8">Arrows / 1-4 select &middot; Enter confirm &middot; Esc back</div><span style="width:90px"></span></div></section>

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
<div class="bot"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="ptabs" id="shTabs"></div><div class="sw" id="shSw"></div><div style="flex:1"></div><button class="btn go" id="shAct"><span>Select</span></button></div><div class="flash8" id="shFlash"></div></section>

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
const goBack={s8cards:()=>show('menu'),s8setup:()=>show(ST.ret),s8career:()=>show('s8cards'),s8res:()=>resContinue()};
goBack.s8show=()=>{const r=SR.ret;if(r==='s8res_back'){renderSetup();show('s8setup');return}show(r);if(r==='s8setup')renderSetup();if(r==='s8career')renderCareer()};
root.addEventListener('click',e=>{const b=e.target.closest('[data-a="back"]');if(b){(goBack[scr]||(()=>{}))()}});
const rawEsc=esc;esc=()=>{if(goBack[scr]){goBack[scr]();return}rawEsc()};
const RACE_RET=()=>{const c=P.lastCfg;return c&&c.ev?'s8career':(c&&c.mode?'s8setup':'s8cards')};
toSetup=()=>{if(scr==='menu'||scr==='setup'){openCards();return}if(RACE)P.cleanupRace();show(RACE_RET())};
function openCards(){show('s8cards');setFoc(foc)}
let foc=0;
function setFoc(i){const cs=$$('.card',root);foc=(i+cs.length)%cs.length;cs.forEach((c,k)=>c.classList.toggle('foc',k===foc))}
$$('.card',root).forEach((c,k)=>{c.onmouseenter=()=>setFoc(k);c.onclick=()=>pickMode(c.dataset.m)});
function pickMode(m){if(m==='career'){ST.crank=null;ST.cev=null;openCareer()}else{ST.mode=m;ST.ret='s8cards';renderSetup();show('s8setup')}}

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
  g.fillStyle='#6fd3ee22';g.beginPath();g.moveTo(10,py+ph);for(let k=0;k<=T.N;k+=3){const q=Math.min(k,T.N-1),x=10+(W-20)*k/T.N,y=py+ph-3-(T.y[q]-y0)/yr*(ph-10);g.lineTo(x,y)}g.lineTo(W-10,py+ph);g.fill();
  g.strokeStyle='#6fd3ee';g.lineWidth=1.6;g.beginPath();for(let k=0;k<T.N;k+=3){const x=10+(W-20)*k/T.N,y=py+ph-3-(T.y[k]-y0)/yr*(ph-10);k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
  g.fillStyle='#7b8594';g.font='9px monospace';g.textAlign='left';g.fillText('ELEV '+Math.round(y0)+'-'+Math.round(y1)+' M',16,py+12);g.textAlign='right';g.fillText(Math.round(T.L)+' M',W-16,py+12)}}

/* ================= TIME OF DAY preview (small pixel render) ================= */
const BIOME={grass:[90,150,82],sand:[214,178,122],snow:[226,234,244],city:[38,38,58],forest:[62,112,64],desert:[200,143,94],moor:[106,127,78]};
const rgb=h=>[(h>>16)&255,(h>>8)&255,h&255];
const LIGHT={dawn:{t:[255,205,185],k:.9},day:{t:[255,255,255],k:1},sunset:{t:[255,150,100],k:.82},night:{t:[70,100,190],k:.34}};
function drawTod(cv,trk,tod){const g=cv.getContext('2d'),W=cv.width,H=cv.height,d=D[trk],tp=P.TOD[tod];
 const city=d.id===3;let sk;
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
const MODE_NAME={ta:'TIME <em>ATTACK</em>',mp:'LOCAL <em>MULTIPLAYER</em>',cutup:'CUT<em>-UP</em>'};
const selCar=p=>{const sv=P.SV();let s=sv.sel[p]||sv.sel[0];if(!P.owns(s.id,s.alt)){const o=P.ownedList()[0]||BYID.merc;s={id:o.id,alt:P.owns(o.id,0)?0:1};P.setSel(p,s.id,s.alt)}return s};
const effTod=()=>ST.todUser||D[ST.track].tod0||'day';
const seg=(items,cur)=>items.map(([v,l])=>`<button class="btn sm ${v===cur?'sel':''}" data-v="${v}"><span>${l}</span></button>`).join('');
function renderSetup(){const m=ST.mode;$('suTitle').innerHTML=MODE_NAME[m];
 $('trkList').innerHTML=D.map((d,i)=>`<div class="trk ${i===ST.track?'sel':''}" data-i="${i}"><canvas width="56" height="42"></canvas><div><b>${d.name}</b><small>${P.TRACK_INFO[i].s} &middot; ${Math.round(tr(i).L)} m</small></div></div>`).join('');
 $$('#trkList .trk',root).forEach((e,i)=>{drawTrack(e.querySelector('canvas'),i,false);e.onclick=()=>{ST.track=i;renderSetup()}});
 const T=tr(ST.track);drawTrack($('trkPrev'),ST.track,true);
 let y0=1e9,y1=-1e9;for(let k=0;k<T.N;k++){y0=Math.min(y0,T.y[k]);y1=Math.max(y1,T.y[k])}
 $('trkInfo').innerHTML=`<span class="chip">${P.TRACK_INFO[ST.track].s}</span><span class="chip">${Math.round(T.L)} m</span><span class="chip">Climb ${Math.round(y1-y0)} m</span>`+(T.jumps&&T.jumps.length&&m!=='cutup'?'<span class="chip">Jump</span>':'');
 const car=BYID[selCar(0).id];let ex='';
 if(m==='ta'){const tk=ST.rev?'r'+ST.track:ST.track,rec=P.SV().ta[tk]||{};ex=`<h4 style="margin:8px 0 4px">Medal times &middot; ${car.name}</h4><div class="medals">`+P.MEDALS.map((md,i)=>`<div class="${rec.medal!=null&&rec.medal<=i?'got':''}"><b style="color:${md.col}">${md.n}</b>${fmtT(P.medalTime(tk,car,i))}</div>`).join('')+`</div><div style="font-size:10px;letter-spacing:.16em;color:var(--dim)">BEST LAP <b style="color:var(--ac)">${fmtT(rec.best)}</b></div>`}
 $('trkExtra').innerHTML=ex;
 let cfg='';
 if(m==='ta'||m==='mp')cfg+=`<div class="row8"><b>Laps</b><span class="seg" id="cLaps">${seg([[2,'2'],[3,'3'],[4,'4'],[5,'5'],[8,'8'],[10,'10']],ST.laps)}</span></div><div class="row8"><b>Direction</b><span class="seg" id="cRev">${seg([['0','Forward'],['1','Reverse']],ST.rev?'1':'0')}</span></div><div class="row8"><b>Tyres &amp; fuel</b><span class="seg" id="cEnd">${seg([['auto','Auto'],['1','On'],['0','Off']],ST.endurS||'auto')}</span></div>`;
 if(m==='mp'||m==='cutup')cfg+=`<div class="row8"><b>Drivers</b><span class="seg" id="cPl">${seg([[1,'1'],[2,'2'],[3,'3'],[4,'4']],ST.players)}</span></div>`;
 if(m==='mp')cfg+=`<div class="row8"><b>CPU</b><span class="seg" id="cCpu">${seg([[0,'0'],[2,'2'],[3,'3'],[4,'4']].filter(a=>a[0]+ST.players<=8),ST.cpus)}</span></div><div class="row8"><b>Level</b><span class="seg" id="cDif">${seg([[0,'Easy'],[1,'Normal'],[2,'Hard']],ST.diff)}</span></div>`;
 if(m==='cutup')cfg+=`<div class="row8"><b>Traffic</b><span class="seg" id="cTr">${seg([['light','Light'],['heavy','Heavy']],ST.traffic)}</span></div><div class="row8"><b>Clock</b><span class="seg" id="cTime">${seg([[90,'90s'],[120,'120s'],[180,'180s']],ST.time)}</span></div>`;
 $('suCfg').innerHTML=cfg;
 const td=effTod();$('suTod').innerHTML=`<div class="tod"><h4 style="margin:0 0 7px;font:700 10px var(--mn);letter-spacing:.3em;color:var(--dim)">TIME OF DAY</h4><canvas id="todPrev" width="168" height="70"></canvas><span class="seg" id="cTod">${seg(P.TOD_ORDER.map(k=>[k,P.TOD[k].n]),td)}</span></div>`;
 drawTod($('todPrev'),ST.track,td);
 const bind=(id,k,num)=>{const e=$(id);if(e)$$('button',e).forEach(b=>b.onclick=()=>{ST[k]=num?+b.dataset.v:b.dataset.v;if(k==='players'&&ST.mode==='mp'&&ST.players+ST.cpus>8)ST.cpus=8-ST.players;renderSetup()})};
 bind('cLaps','laps',1);bind('cEnd','endurS',0);{const e=$('cRev');if(e)$$('button',e).forEach(b=>b.onclick=()=>{ST.rev=b.dataset.v==='1';renderSetup()})}bind('cPl','players',1);bind('cCpu','cpus',1);bind('cDif','diff',1);bind('cTime','time',1);bind('cTr','traffic',0);bind('cTod','todUser',0);
 const np=m==='ta'?1:ST.players;let dv='<h4 style="margin:6px 0 8px;font:700 10px var(--mn);letter-spacing:.3em;color:var(--dim)">VEHICLES</h4>';
 for(let p=0;p<np;p++){const s=selCar(p),c=BYID[s.id];dv+=`<div class="drv" style="border-left-color:${['#6fd3ee','#f2c76b','#7fd68a','#ef6a5a'][p]}"><div><b>${np>1?'P'+(p+1)+' &middot; ':''}${c.name}${s.alt?' ALT':''}</b><small>Class <span class="cls ${c.cls}">${c.cls}</span> &middot; ${c.type}</small><div class="fxrow">${fxChip(c,!!D[ST.track].gravel)}</div></div><button class="btn sm" data-p="${p}"><span>Garage</span></button></div>`}
 $('suDrv').innerHTML=dv;$$('#suDrv button',root).forEach(b=>b.onclick=()=>openShow('garage',{player:+b.dataset.p,cap:null,ret:'s8setup',rally:!!D[ST.track].gravel}));
 $('suHint').textContent=m==='ta'?'W / S + A / D &middot; double-tap W up, S down to shift':'P1 WASD &middot; P2 arrows &middot; P3 IJKL &middot; P4 TFGH';$('suHint').innerHTML=$('suHint').textContent}
$('suGo').onclick=()=>{
 const m=ST.mode,d=D[ST.track],np=m==='ta'?1:ST.players,humans=[];for(let p=0;p<np;p++){const s=selCar(p);humans.push({id:s.id,alt:s.alt})}
 const tod=effTod();let cfg;
 const endur=ST.endurS==='1'?true:ST.endurS==='0'?false:undefined;
 if(m==='ta')cfg={mode:'ta',track:ST.track,laps:ST.laps,humans,ai:[],tod,endur,rev:!!ST.rev};
 else if(m==='mp'){const df=[{cl:['C','B'],sk:.78},{cl:['B','A'],sk:.88},{cl:['A','S'],sk:.97}][ST.diff];cfg={mode:'mp',track:ST.track,laps:ST.laps,humans,ai:ST.cpus?P.makeAI({n:ST.cpus,classes:df.cl,skill:df.sk,rally:!!d.gravel}):[],tod,endur,rev:!!ST.rev}}
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
function bodyColor(idx){if(colCache[idx])return colCache[idx];const m=CAR_MODELS[idx];let best=null,bn=-1;if(m)m.traverse(o=>{if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(mm=>{const n=(mm.name||'')+(o.name||'');if(/glass|window|tire|tyre|wheel|rim|light|lamp|interior|chrome|grill|brake|plate|logo/i.test(n))return;const c=mm.color;if(!c)return;const l=c.r*.3+c.g*.59+c.b*.11;if(l<.05)return;const cnt=o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count:0;if(cnt>bn){bn=cnt;best=c}})}});
 return colCache[idx]=best?'#'+best.getHexString():'#888'}
function wallTex(){const cv=document.createElement('canvas');cv.width=4;cv.height=256;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#0b0d11');gr.addColorStop(.45,'#1f242c');gr.addColorStop(.8,'#313843');gr.addColorStop(1,'#232830');g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t}
function makePost(){
 const quadGeo=new THREE.PlaneGeometry(2,2),camQ=new THREE.OrthographicCamera(-1,1,1,-1,0,1),scQ=new THREE.Scene(),quad=new THREE.Mesh(quadGeo);quad.frustumCulled=false;scQ.add(quad);
 const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const mk=(fs,u)=>new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:u,depthTest:false,depthWrite:false,toneMapped:false});
 const bright=mk('uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));float k=smoothstep(th,th+.55,l);gl_FragColor=vec4(c*k,1.);}',{t:{value:null},th:{value:1.1}});
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
 box(14,5,0,9,0,Math.PI/2,0,[3.2,3.2,3.4]);box(2,8,-9,4,-1,0,Math.PI/2,[2.2,2.4,3.2]);box(2,8,9,4,-1,0,Math.PI/2,[2.4,2.2,2.0]);box(10,3,0,3,-10,0,0,[1.6,1.7,2.0]);box(8,3,0,2,10,0,Math.PI,[.9,.9,1.0]);
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
 const key=new THREE.SpotLight(0xfff1de,1.5,40,.5,.7,1.2);key.position.set(6,11,7);key.target.position.set(0,.3,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;key.shadow.radius=4;key.shadow.camera.near=4;key.shadow.camera.far=30;sc.add(key,key.target);
 const rim=new THREE.DirectionalLight(0x7fb4ff,1.1);rim.position.set(-8,4,-8);sc.add(rim);
 const rim2=new THREE.DirectionalLight(0xffb98a,.7);rim2.position.set(9,3,-7);sc.add(rim2);
 const turn=new THREE.Group();sc.add(turn);turn.add(wl2,wl3);
 const cam=new THREE.PerspectiveCamera(30,1,.1,100);
 S={sc,cam,turn,floor,idx:-1,car:null,mir:null,post:makePost(),key};return S}
function setStudioCar(idx){ensureStudio();if(S.idx===idx)return;const src=CAR_MODELS[idx];if(!src)return;
 if(S.car){S.turn.remove(S.car)}
 const model=src.clone(true),car=new THREE.Group(),centered=new THREE.Group();centered.add(model);car.add(centered);centered.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),size=bb.getSize(new THREE.Vector3()),ctr=bb.getCenter(new THREE.Vector3()),sc=4.7/Math.max(size.x,size.z,.001),h=size.y*sc;
 centered.position.copy(ctr).multiplyScalar(-1);car.scale.setScalar(sc);car.rotation.y=(size.x>size.z?Math.PI/2:0)+Math.PI;
 const wrap=new THREE.Group();wrap.add(car);car.position.y=h/2-(ctr.y-bb.min.y)*0+0;
 /* put the lowest point on the floor */ wrap.position.y=0;car.position.y=0;centered.position.y=-bb.min.y;centered.position.x=-ctr.x;centered.position.z=-ctr.z;
 car.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m&&m.isMeshStandardMaterial){m.envMapIntensity=.7}})}});
 const mir=wrap.clone(true);mir.scale.y=-1;mir.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
 S.turn.add(wrap);S.car=wrap;S.mir=mir;S.idx=idx;lastPhotoKey=''}
function studioOn(){if(STU.on)return;STU.on=true;document.body.classList.add('studio');$('c').style.imageRendering='auto';STU.tm=R.toneMapping;R.toneMapping=THREE.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;sizeStudio()}
function sizeStudio(){const d=Math.min(devicePixelRatio||1,2);R.setPixelRatio(1);R.setSize(Math.max(2,innerWidth*d|0),Math.max(2,innerHeight*d|0),false)}
function studioOff(){if(!STU.on)return;STU.on=false;document.body.classList.remove('studio');$('c').style.imageRendering='';R.toneMapping=STU.tm;R.setRenderTarget(null);rs()}
const rs0=rs;rs=()=>{if(STU.on)sizeStudio();else rs0()};
function drawShow(dt){studioOn();ensureStudio();const car=BYID[SR.id],idx=P.modelOf(SR.id,SR.alt);if(S.idx!==idx&&CAR_MODELS[idx])setStudioCar(idx);
 SR.ang+=dt*(SR.drag?0:.35)+SR.vel*dt;SR.vel*=Math.pow(.05,dt);S.turn.rotation.y=SR.ang;
 const W=R.domElement.width,H=R.domElement.height;S.cam.aspect=W/H;const ca=.55+Math.sin(T0*.17)*.12;S.cam.position.set(Math.sin(ca)*10.2,2.5+Math.sin(T0*.23)*.15,Math.cos(ca)*10.2);S.cam.lookAt(0,.75,0);
 S.cam.setViewOffset(W,H,-W*.0,H*.02,W,H);S.cam.updateProjectionMatrix();
 R.setScissorTest(false);R.setViewport(0,0,W,H);S.post.render(S.sc,S.cam);R.setRenderTarget(null);
 const key=idx+'|'+(window.PT7&&window.PT7.photos[idx]?1:0);if(key!==lastPhotoKey&&CAR_MODELS[idx]){lastPhotoKey=key;fillPhotos(idx)}}
function fillPhotos(idx){const box=$('shPhotos');if(!box)return;let ph=window.PT7&&(window.PT7.photos[idx]||(()=>{try{return window.PT7.makePhotos(idx)}catch(e){return null}})());box.innerHTML='';
 for(let i=0;i<3;i++){const cv=document.createElement('canvas');cv.width=96;cv.height=60;const g=cv.getContext('2d');g.fillStyle='#14181d';g.fillRect(0,0,96,60);if(ph&&ph[i]){try{g.drawImage(ph[i],0,0,96,60)}catch(e){}}box.appendChild(cv)}}
function openShow(kind,o){SR.kind=kind;SR.player=o.player||0;SR.cap=o.cap==null?null:o.cap;SR.ret=o.ret||'menu';SR.rally=!!o.rally;
 const list=showList();if(kind==='garage'){const s=P.SV().sel[SR.player];const ok=list.find(c=>c.id===s.id&&!c.off);const f=ok||list.find(c=>!c.off)||list[0];SR.id=f.id;SR.alt=(ok&&P.owns(f.id,s.alt))?s.alt:(P.owns(f.id,0)?0:1)}
 else{if(!BYID[SR.id])SR.id='merc';if(SR.alt&&!P.owns(SR.id,1))SR.alt=0}
 renderShow();show('s8show');}
function showList(){const sv=P.SV();let l=SORTED.map(c=>({...c,off:false}));if(SR.kind==='garage'){l=l.filter(c=>(sv.owned[c.id]||0)>0);l.forEach(c=>{c.off=SR.cap!=null&&CLS.indexOf(c.cls)>CLS.indexOf(SR.cap)});if(!l.length)l=[{...BYID.merc,off:false}]}return l}
function statBars(c){const gt=P.gearTops(c).map(v=>v*3.6),hi=gt[gt.length-1];const n=(v,a,b)=>clamp((v-a)/(b-a),0,1);
 return{bars:[['Top speed',n(hi,120,190),Math.round(hi)+' km/h'],['Accel',n(c.acc,18,35),(c.acc*.115).toFixed(1)+' s'],['Handling',n(c.grip,.9,1.12),Math.round(c.grip*100)],['Braking',n(c.brk,.88,1.18),Math.round(c.brk*100)],['Off-road',c.off,Math.round(c.off*100)+'%']],gt}}
function renderShow(){const kind=SR.kind,sv=P.SV(),list=showList(),car=BYID[SR.id],owned=P.owns(car.id,0),ownAlt=P.owns(car.id,1);
 $('shTitle').innerHTML=kind==='garage'?'YOUR <em>GARAGE</em>':'BRAND <em>CENTRAL</em>';$('shSub').textContent=kind==='garage'?(SR.cap?'Class '+SR.cap+' and below':''):'Buy cars / alt colors';
 let h='',last=null;for(const c of list){if(c.cls!==last){last=c.cls;h+=`<div class="ch"><span class="cls ${c.cls}">${c.cls}</span> &nbsp;Class ${c.cls}</div>`}const o=(sv.owned[c.id]||0)>0;
  h+=`<div class="ci ${c.id===SR.id?'sel':''} ${c.off?'off':''}" data-id="${c.id}"><b>${c.name}</b><small>${kind==='brand'?(o?'Owned':fmtCr(c.price)):(c.off?'Class cap':c.type)}</small></div>`}
 $('shList').innerHTML=h;$$('#shList .ci',root).forEach(e=>e.onclick=()=>{SR.id=e.dataset.id;if(!P.owns(SR.id,SR.alt))SR.alt=0;renderShow()});
 const sel=$$('#shList .ci.sel',root)[0];if(sel)sel.scrollIntoView({block:'nearest'});
 const sb=statBars(car),bars=sb.bars,gt=sb.gt;
 $('shStat').innerHTML=`<div class="nm">${car.name}${SR.alt?' <span style="color:var(--ac2);font-size:.6em">ALT</span>':''}</div><div class="tp">${car.type} &middot; ${car.drive}</div>
 <div class="pp"><small>Perf.<br>points</small><b>${P.pp(car)}</b><span class="cls ${car.cls}">${car.cls}</span></div>
 ${bars.map(b=>`<div class="bar"><span>${b[0]}</span><i><u style="width:${Math.round(b[1]*100)}%"></u></i><em>${b[2]}</em></div>`).join('')}
 ${fxBoth(car)}
 <div class="gears9" style="grid-template-columns:repeat(${gt.length<=6?3:gt.length<=8?4:5},1fr)">${gt.map((v,i)=>`<div><small>GEAR ${i+1}</small>${Math.round(v)}</div>`).join('')}</div>
 <div class="spec">${kind==='brand'?'Price<b>'+fmtCr(car.price)+'</b><br>Alt color<b>'+fmtCr(car.altPrice)+'</b>':'Status<b>'+(owned?'Owned':'Not owned')+'</b>'}</div><div class="photos" id="shPhotos"></div>`;
 lastPhotoKey='';
 const m0=P.modelOf(car.id,0),m1=P.modelOf(car.id,1);
 $('shSw').innerHTML=`<div class="swb ${SR.alt?'':'sel'}" data-alt="0"><i style="background:${bodyColor(m0)}"></i><span>Standard${kind==='brand'&&owned?' &middot; owned':''}</span></div><div class="swb ${SR.alt?'sel':''}" data-alt="1"><i style="background:${bodyColor(m1)}"></i><span>Alt${kind==='brand'?(ownAlt?' &middot; owned':' &middot; '+fmtCr(car.altPrice)):(ownAlt?'':' &middot; locked')}</span></div>`;
 $$('#shSw .swb',root).forEach(e=>e.onclick=()=>{SR.alt=+e.dataset.alt;renderShow()});
 let tabs='';if(kind==='garage'&&SR.ret==='s8setup'&&ST.mode!=='ta'){for(let p=0;p<ST.players;p++)tabs+=`<button class="btn sm ${p===SR.player?'sel':''}" data-p="${p}"><span>P${p+1}</span></button>`}
 $('shTabs').innerHTML=tabs;$$('#shTabs button',root).forEach(b=>b.onclick=()=>{SR.player=+b.dataset.p;const s=sv.sel[SR.player];if(P.owns(s.id,s.alt)){SR.id=s.id;SR.alt=s.alt}renderShow()});
 const act=$('shAct');const altOwn=SR.alt?ownAlt:owned;act.classList.remove('off');
 if(kind==='brand'){const price=SR.alt?car.altPrice:car.price;
  if(altOwn){act.innerHTML='<span>Owned</span>';act.classList.add('off')}
  else if(SR.alt&&!owned){act.innerHTML='<span>Buy car first</span>';act.classList.add('off')}
  else{act.innerHTML='<span>Buy '+fmtCr(price)+'</span>';if(sv.cr<price){act.classList.add('off');act.innerHTML='<span>Need '+fmtCr(price-sv.cr)+' more</span>'}}}
 else{const off=list.find(c=>c.id===car.id).off;act.classList.toggle('off',off||!altOwn);act.innerHTML='<span>'+(off?'Class cap':altOwn?'Select':'Locked')+'</span>'}
 $$('.crv',root).forEach(e=>e.textContent=fmtCr(sv.cr))}
$('shAct').onclick=()=>{const car=BYID[SR.id];
 if(SR.kind==='brand'){if(P.buy(car.id,SR.alt)){P.sfx('buy');const f=$('shFlash');f.textContent='Purchased / '+car.name+(SR.alt?' alt':'');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');renderShow()}}
 else{const it=showList().find(c=>c.id===car.id);if(it.off||!P.owns(car.id,SR.alt))return;P.setSel(SR.player,car.id,SR.alt);P.sfx('select');goBack.s8show();}};
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
 else h+='<table class="rt"><tr><th>Pos</th><th>Driver</th><th>Car</th><th>Time</th><th>Best lap</th></tr>'+res.rows.map(r=>`<tr class="${r.human?'hum':''}"><td class="pl">${r.place}</td><td><b style="${r.human?'color:'+r.col:''}">${r.name}${r.loan?' (loaner)':''}</b></td><td>${r.car}</td><td>${r.time!=null?fmtT(r.time):(r.lapsDown?'+'+r.lapsDown+' lap':'...')}</td><td style="color:var(--ac)">${r.best!=null?fmtT(r.best):'--'}</td></tr>`).join('')+'</table>';
 h+='<div>'+res.pay.map(p=>`<div class="pay"><span>${p.l}</span><span>+${fmtCr(p.v)}</span></div>`).join('')+`<div class="pay tot"><span>Total earned</span><span>+${fmtCr(res.total)}</span></div><div class="pay"><span>Balance</span><span>${fmtCr(res.balance)}</span></div></div>`;
 const career=res.cfg&&res.cfg.ev;
 h+=`<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn go" id="rcCont"><span>${career?'Career hub':'Continue'}</span></button><button class="btn" id="rcRetry"><span>Retry</span></button><button class="btn" id="rcBrand"><span>Brand Central</span></button><button class="btn" id="rcMenu"><span>Main menu</span></button></div>`;
 $('resBox').innerHTML=h;paused=true;show('s8res');
 $('rcCont').onclick=resContinue;$('rcRetry').onclick=()=>{startRace()};$('rcBrand').onclick=()=>{P.cleanupRace();openShow('brand',{player:0,cap:null,ret:'s8res_back'})};$('rcMenu').onclick=()=>{P.cleanupRace();show('menu')}};
function resContinue(){const cfg=RES&&RES.cfg;P.cleanupRace();if(cfg&&cfg.ev){if(RES.promo)ST.crank=null;renderCareer();show('s8career')}else{renderSetup();show('s8setup')}}

/* ================= keys ================= */
let cheatBuf='';
addEventListener('keydown',e=>{
 if(scr==='s8cards'){if(e.code==='ArrowRight'||e.code==='KeyD')setFoc(foc+1);else if(e.code==='ArrowLeft'||e.code==='KeyA')setFoc(foc-1);else if(/^Digit[1-4]$/.test(e.code))pickMode($$('.card',root)[+e.code[5]-1].dataset.m);else if(e.code==='Enter'||e.code==='Space')pickMode($$('.card',root)[foc].dataset.m);return}
 if(scr==='s8show'){if(SR.kind==='brand'){cheatBuf=(cheatBuf+(e.key.length===1?e.key.toLowerCase():'')).slice(-13);if(cheatBuf.endsWith('hakannowant')){cheatBuf='';const sv=P.SV();sv.owned={merc:1};sv.sel=sv.sel.map(()=>({id:'merc',alt:0}));P.save();SR.id='merc';SR.alt=0;renderShow();return}
  if(cheatBuf.endsWith('hakanwantsall')){cheatBuf='';const sv=P.SV();CARS.forEach(c=>{sv.owned[c.id]=3});P.save();renderShow();return}}
  const list=showList(),i=list.findIndex(c=>c.id===SR.id);if(e.code==='ArrowDown'){SR.id=list[Math.min(list.length-1,i+1)].id;SR.alt=P.owns(SR.id,SR.alt)?SR.alt:0;renderShow()}else if(e.code==='ArrowUp'){SR.id=list[Math.max(0,i-1)].id;SR.alt=P.owns(SR.id,SR.alt)?SR.alt:0;renderShow()}else if(e.code==='ArrowLeft')SR.vel-=3;else if(e.code==='ArrowRight')SR.vel+=3;else if(e.code==='KeyC'&&SR.kind==='garage'){SR.alt=SR.alt?0:1;renderShow()}else if(e.code==='Enter')$('shAct').click();return}
 if(scr==='s8setup'&&e.code==='Enter'){$('suGo').click();return}
 if(scr==='menu'&&e.code==='Enter'){openCards();return}
 if(scr==='s8res'&&e.code==='Enter'){resContinue()}});

/* ================= frame loop ================= */
frame=function(n){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
 if(RACE&&(scr==='game'||scr==='pause'||scr==='s8res')){if(!paused)step(dt);drawRace(dt);if(scr==='game')hudUpdate()}
 else if(scr==='s8show')drawShow(dt);
 else if(scr==='menu'||scr==='s8cards'||scr==='s8setup'||scr==='s8career'||scr==='s8res'){MS=MS||menuScene();MS.tick(Math.max(0,T0));R.setScissorTest(false);R.setViewport(0,0,R.domElement.width,R.domElement.height);R.render(MS.sc,MS.cam)}};
/* pause menu */
(function(){const b=$('pause').querySelector('.b'),opt=[...b.querySelectorAll('button')].pop();b.innerHTML='<button id="pRes">Resume</button><button id="pRst">Restart</button><button id="pQuit">Quit to menu</button>';b.appendChild(opt);
 $('pRes').onclick=()=>resume();$('pRst').onclick=()=>{startRace()};$('pQuit').onclick=()=>{const r=RACE_RET();P.cleanupRace();show(r);if(r==='s8setup')renderSetup();if(r==='s8career')renderCareer()};
 $('pause').querySelector('.tb').textContent='Paused'})();
P.studioDbg=()=>S;P.ui={openCards,openShow,renderSetup,renderCareer,ST,SR};
document.title='Poly Tourismo v9';
refreshMenuCars();MS=null;
})();
