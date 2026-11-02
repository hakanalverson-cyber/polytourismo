/* ===== Poly GT layer: start-line showcase. Every car mode (Quickplay, Rally, Track, Career) opens on the start line with a
   cinematic card: letterbox bars, a live camera caption, the track map with a lap tracer, the car's numbers and the grid.
   rally.js owns the prep state (cameras, Enter / Esc); this layer dresses the card and gives Quickplay and Career the same prep. ===== */
(function prepFx(){
'use strict';
const P=window.PT8;if(!P||!P.launch)return;
const $i=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[<&>]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;'})[c]);
const SHOTS=['ORBIT','START LINE','AERIAL','FLYBY','WHEEL CAM'];
const MODES={ta:'TIME ATTACK',mp:'RACE',elim:'ELIMINATION',cutup:'CUT-UP',drift:'DRIFT'};

const CSS=`
#rlPrep.pf{display:none;padding:0;background:none;align-items:stretch;justify-content:stretch;font-family:var(--gt,"Inter",sans-serif);color:#f2f4f6;-webkit-font-smoothing:antialiased}
#rlPrep.pf{background:none!important}#rlPrep.pf:before{display:none!important}
#rlPrep.pf .pfBar{position:absolute;left:0;right:0;height:9vh;background:#000;transform:scaleY(0);animation:pfBar .7s cubic-bezier(.2,.8,.2,1) forwards}
#rlPrep.pf .pfBar.t{top:0;transform-origin:top}#rlPrep.pf .pfBar.b{bottom:0;transform-origin:bottom}
@keyframes pfBar{to{transform:scaleY(1)}}
#rlPrep.pf .pfVig{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(0,0,0,.55) 100%),linear-gradient(90deg,rgba(0,0,0,.5),transparent 32%,transparent 66%,rgba(0,0,0,.45))}
#rlPrep.pf .pfCap{position:absolute;top:calc(9vh + 18px);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.3em;color:#e9edf0;text-shadow:0 1px 4px #000;animation:pfFade .8s .4s both}
#rlPrep.pf .pfCap i{width:9px;height:9px;border-radius:50%;background:#ef3b2d;box-shadow:0 0 10px #ef3b2d;animation:pfRec 1.1s steps(2) infinite}
#rlPrep.pf .pfCap b{font-weight:600}#rlPrep.pf .pfCap em{font-style:normal;color:#9aa3ab}
@keyframes pfRec{50%{opacity:.15}}
#rlPrep.pf .pfTop{position:absolute;top:0;left:0;right:0;height:9vh;display:flex;align-items:center;padding:0 3.2vw;gap:16px;animation:pfFade .6s .25s both}
#rlPrep.pf .pfTop .lg{font:italic 700 17px var(--gt);letter-spacing:.12em}#rlPrep.pf .pfTop .lg i{color:#9aa3ab}
#rlPrep.pf .pfTop .md{font:200 15px var(--gt);letter-spacing:.32em;color:#dfe5ea}
#rlPrep.pf .pfTop .cond{margin-left:auto;display:flex;gap:8px}
#rlPrep.pf .chip{padding:5px 11px;border-radius:999px;background:#ffffff14;box-shadow:inset 0 1px 0 #ffffff22,inset 0 0 0 1px #ffffff14;font-size:10.5px;letter-spacing:.18em;color:#e6ebef;white-space:nowrap}
#rlPrep.pf .pl{background:linear-gradient(180deg,rgba(70,76,84,.6) 0%,rgba(30,33,37,.72) 50%,rgba(14,15,18,.8) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(255,255,255,.08),0 10px 30px rgba(0,0,0,.5);border-radius:10px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
#rlPrep.pf .pfL{position:absolute;left:3.2vw;top:calc(9vh + 54px);width:min(380px,32vw);display:flex;flex-direction:column;gap:10px;animation:pfInL .7s .35s cubic-bezier(.2,.8,.2,1) both}
#rlPrep.pf .pfR{position:absolute;right:3.2vw;top:calc(9vh + 54px);width:min(340px,29vw);display:flex;flex-direction:column;gap:10px;animation:pfInR .7s .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes pfInL{from{opacity:0;transform:translateX(-40px)}}@keyframes pfInR{from{opacity:0;transform:translateX(40px)}}@keyframes pfFade{from{opacity:0}}
#rlPrep.pf .tk{padding:16px 18px 14px}
#rlPrep.pf .tk small{display:block;font-size:10px;letter-spacing:.28em;color:#aab3ba}
#rlPrep.pf .tk h2{margin:4px 0 10px!important;font:200 clamp(24px,2.9vw,40px)/1.05 var(--gt)!important;letter-spacing:.02em!important;text-transform:none!important;color:#fff!important}
#rlPrep.pf .tk .fx{display:flex;flex-wrap:wrap;gap:6px}
#rlPrep.pf .map{position:relative;padding:10px}
#rlPrep.pf .map canvas{display:block;width:100%;height:auto}
#rlPrep.pf .map .lab{position:absolute;left:16px;bottom:12px;font-size:9.5px;letter-spacing:.26em;color:#aab3ba}
#rlPrep.pf .car{padding:14px 16px}
#rlPrep.pf .car .hd{display:flex;align-items:center;gap:12px}
#rlPrep.pf .car .cls{width:38px;height:38px;border-radius:7px;display:grid;place-items:center;font:600 20px var(--gt);color:#15181c;background:var(--gxw,#e9edf0);box-shadow:0 2px 8px #0008}
#rlPrep.pf .car .nm{flex:1;min-width:0}#rlPrep.pf .car .nm b{display:block;font-weight:500;font-size:15px;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rlPrep.pf .car .nm small{font-size:9.5px;letter-spacing:.22em;color:#aab3ba}
#rlPrep.pf .st{display:grid;grid-template-columns:78px 1fr 30px;align-items:center;gap:4px 10px;margin-top:12px;font-size:9.5px;letter-spacing:.2em;color:#c9d0d6}
#rlPrep.pf .st .b{height:5px;border-radius:3px;background:#ffffff18;overflow:hidden}
#rlPrep.pf .st .b i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#5d8fc4,#a9d1f5);box-shadow:0 0 8px #7fb6ea88;transform-origin:left;animation:pfGrow .9s cubic-bezier(.2,.8,.2,1) both}
#rlPrep.pf .st em{font-style:normal;text-align:right;color:#fff;font-size:11px;letter-spacing:.04em}
@keyframes pfGrow{from{transform:scaleX(0)}}
#rlPrep.pf .car p{margin:12px 0 0;font-size:11.5px;line-height:1.45;color:#c4ccd2;font-style:italic}
#rlPrep.pf .grid{padding:12px 14px}
#rlPrep.pf .grid h4{margin:0 0 8px;font-weight:500;font-size:10px;letter-spacing:.28em;color:#aab3ba}
#rlPrep.pf .grid ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px}
#rlPrep.pf .grid li{display:flex;gap:7px;align-items:center;font-size:10.5px;letter-spacing:.06em;color:#dfe5ea;white-space:nowrap;overflow:hidden;animation:pfFade .5s both}
#rlPrep.pf .grid li b{width:18px;font-weight:600;color:#8e979e;font-size:10px}
#rlPrep.pf .grid li.me{color:#fff}#rlPrep.pf .grid li.me b{color:#7fb6ea}
#rlPrep.pf .grid li span{overflow:hidden;text-overflow:ellipsis}
#rlPrep.pf .pfBot{position:absolute;left:0;right:0;bottom:0;height:9vh;display:flex;align-items:center;justify-content:flex-end;gap:18px;padding:0 3.2vw;animation:pfFade .6s .6s both}
#rlPrep.pf .pfBot .ks{font-size:10px;letter-spacing:.2em;color:#9aa3ab}
#rlPrep.pf .pfBot kbd{display:inline-block;background:var(--gxw,#e9edf0);color:#15181c;border-radius:4px;padding:2px 7px;font:600 10px var(--gt);margin:0 4px 0 10px}
#rlPrep.pf #rlPlay{pointer-events:auto;min-width:190px;height:44px;border:0;border-radius:8px;cursor:pointer;font:500 15px var(--gt);letter-spacing:.22em;text-transform:uppercase;color:#fff;
 background:linear-gradient(180deg,#7fa7d4 0%,#3f6fa3 52%,#2c5687 100%);box-shadow:inset 0 1px 0 #ffffff70,0 0 0 1px #0006,0 0 22px #6fa8e688;animation:pfGlow 1.8s ease-in-out infinite}
@keyframes pfGlow{50%{box-shadow:inset 0 1px 0 #ffffff70,0 0 0 1px #0006,0 0 38px #8cc0f5cc}}
#rlPrep.pf .who{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:11px;letter-spacing:.08em}
#rlPrep.pf .who i{width:9px;height:9px;border-radius:50%}
body.rprep [id^="h8"],body.rprep .h8top,body.rprep #rlCp{visibility:hidden!important}
@media (max-width:760px){#rlPrep.pf .pfR{display:none}#rlPrep.pf .pfL{width:auto;right:3.2vw}#rlPrep.pf .map{display:none}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* the numbers on the car card, scaled to the best car in the game */
let MAX=null;
const maxes=()=>{if(MAX)return MAX;MAX={top:1,acc:1,grip:1,brk:1};for(const c of P.CARS||[])for(const k in MAX)if(+c[k]>MAX[k])MAX[k]=+c[k];return MAX};
const bar=(lab,v,m,show)=>`<span>${lab}</span><span class="b"><i style="width:${Math.round(Math.max(.06,Math.min(1,v/m))*100)}%"></i></span><em>${show}</em>`;

function modeName(Rc,o){const c=Rc.cfg||{};let m=o.label||MODES[c.mode]||String(c.mode||'RACE').toUpperCase();
 if(c.mode==='mp'&&c.humans&&c.humans.length>1)m='SPLIT SCREEN';
 const ST=P.ui&&P.ui.ST;if(ST&&ST.cev&&!c.rally)m='CAREER · '+m;return m}

function dress(e,Rc,o){const c=Rc.cfg||{},T=Rc.T,car=o.car||{},mx=maxes(),cls=car.cls||'',tod=(c.tod||'day'),wx=(Rc.wx&&Rc.wx.n)||c.weather||'clear';
 const humans=(c.humans||[]).length,ai=c.ai||[],BY=P.BYID||{};
 const grid=c.rally?'':`<div class="pl grid"><h4>THE FIELD</h4><ol>${[{me:1,n:(o.d&&o.d.name)||'You',car:car.name}].concat((c.humans||[]).slice(1).map((h,i)=>({me:1,n:h.name||'P'+(i+2),car:(BY[h.id]||{}).name})),ai.map(a=>({n:(BY[a.id]||{}).name||a.id}))).slice(0,12)
   .map((r,i)=>`<li class="${r.me?'me':''}" style="animation-delay:${.7+i*.06}s"><b>${i+1}</b><span>${esc(r.me?r.n.toUpperCase():r.n)}</span></li>`).join('')}</ol></div>`;
 const facts=(o.facts||[]).filter(f=>!/^99 laps/i.test(f)).map(f=>`<span class="chip">${esc(String(f).toUpperCase())}</span>`).join('');
 e.className='pf';
 e.innerHTML=`<div class="pfVig"></div><div class="pfBar t"></div><div class="pfBar b"></div>
 <div class="pfTop"><span class="lg">POLY <i>GT</i></span><span class="md">${esc(modeName(Rc,o))}</span><span class="cond"><span class="chip">${esc(String(tod).toUpperCase())}</span><span class="chip">${esc(String(wx).toUpperCase())}</span></span></div>
 <div class="pfCap"><i></i><b>LIVE</b><em id="pfShot">START LINE</em></div>
 <div class="pfL"><div class="pl tk"><small>${o.multi?'RUN '+(o.i+1):(c.rally?'STAGE':'CIRCUIT')}</small><h2>${esc(T&&T.d&&T.d.name||'')}</h2><div class="fx">${facts}</div>
   ${o.multi?`<div class="who"><i style="background:${['#f1f3f5','#f2c76b','#7fd68a','#ef6a5a'][(o.d.p||0)%4]}"></i><b>${esc(o.d.name)}</b></div>`:''}</div>
  <div class="pl map"><canvas id="pfMap" width="560" height="300"></canvas><span class="lab">${c.circuit||!c.rally?'LAP':'ROUTE'} MAP</span></div></div>
 <div class="pfR"><div class="pl car"><div class="hd"><span class="cls">${esc(cls)}</span><span class="nm"><b>${esc(car.name||'')}</b><small>${esc([car.type,car.drive].filter(Boolean).join(' · '))}</small></span></div>
   <div class="st">${bar('TOP SPEED',car.top||0,mx.top,Math.round((car.k10?car.top*2.6:car.top*2.4))+'')}${bar('ACCEL',car.acc||0,mx.acc,Math.round((car.acc||0)/mx.acc*100))}${bar('GRIP',car.grip||0,mx.grip,Math.round((car.grip||0)/mx.grip*100))}${bar('BRAKES',car.brk||0,mx.brk,Math.round((car.brk||0)/mx.brk*100))}</div>
   ${car.blurb?`<p>${esc(car.blurb)}</p>`:''}</div>${grid}</div>
 <div class="pfBot"><span class="ks"><kbd>C</kbd>NEXT SHOT<kbd>ESC</kbd>BACK<kbd>ENTER</kbd>START</span><button id="rlPlay"><span>${esc(o.startTxt||'Start')}</span></button></div>`;
 /* the top speed reads in the player's own unit when the game knows one */
 const sp=e.querySelector('.st em');if(sp&&car.top){const mph=!(P.SV&&P.SV().units==='kmh');sp.textContent=Math.round(car.top*(mph?2.237:3.6))}
 drawMap(Rc);if(!loopOn){loopOn=true;requestAnimationFrame(tick)}
 if(P.sfx)P.sfx('select')}
P.prepDress=dress;

/* track map: the centre line fitted into the card, a glowing line and a tracer running the lap */
let MAPC=null;
function drawMap(Rc){const cv=$i('pfMap'),T=Rc&&Rc.T;if(!cv||!T||!T.x||!T.N)return;const N=T.N;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 for(let i=0;i<N;i++){const x=T.x[i],z=T.z[i];if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z}
 const W=cv.width,H=cv.height,pad=26,s=Math.min((W-pad*2)/Math.max(1,x1-x0),(H-pad*2)/Math.max(1,z1-z0)),ox=(W-(x1-x0)*s)/2,oy=(H-(z1-z0)*s)/2;
 const pts=new Float32Array(N*2);for(let i=0;i<N;i++){pts[i*2]=ox+(T.x[i]-x0)*s;pts[i*2+1]=oy+(T.z[i]-z0)*s}
 MAPC={cv,pts,N,loop:!(Rc.cfg&&Rc.cfg.rally&&!Rc.cfg.circuit),t0:performance.now()}}
function paintMap(now){const M=MAPC;if(!M||!M.cv.isConnected)return;const g=M.cv.getContext('2d'),W=M.cv.width,H=M.cv.height,p=M.pts,N=M.N;g.clearRect(0,0,W,H);
 const path=()=>{g.beginPath();g.moveTo(p[0],p[1]);for(let i=1;i<N;i++)g.lineTo(p[i*2],p[i*2+1]);if(M.loop)g.closePath()};
 g.lineJoin='round';g.lineCap='round';path();g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=11;g.stroke();path();g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=7;g.stroke();path();g.strokeStyle='#e9eef2';g.lineWidth=2.4;g.stroke();
 /* the tracer: a bright head and a fading tail */
 const per=9000,u=((now-M.t0)%per)/per,hi=Math.floor(u*N),tail=Math.floor(N*.16);
 for(let k=tail;k>0;k--){const a=(hi-k+N)%N,b=(hi-k+1+N)%N;if(!M.loop&&b<a)continue;g.beginPath();g.moveTo(p[a*2],p[a*2+1]);g.lineTo(p[b*2],p[b*2+1]);g.strokeStyle=`rgba(127,182,234,${(1-k/tail)*.95})`;g.lineWidth=4;g.stroke()}
 g.beginPath();g.arc(p[hi*2],p[hi*2+1],5.5,0,Math.PI*2);g.fillStyle='#fff';g.shadowColor='#8cc0f5';g.shadowBlur=14;g.fill();g.shadowBlur=0;
 /* start: a chequer tick across the line */
 const dx=p[2]-p[0],dy=p[3]-p[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*9,ny=dx/l*9;g.beginPath();g.moveTo(p[0]-nx,p[1]-ny);g.lineTo(p[0]+nx,p[1]+ny);g.strokeStyle='#ef3b2d';g.lineWidth=3;g.stroke()}

let loopOn=false,lastShot=-1;
function tick(now){const e=$i('rlPrep'),Rc=typeof RACE!=='undefined'?RACE:null;
 if(!e||e.style.display==='none'||!Rc||!Rc.prep){loopOn=false;lastShot=-1;return}
 paintMap(now);const k=Rc.shotK;if(k!=null&&k!==lastShot){lastShot=k;const s=$i('pfShot');if(s){s.style.transition='none';s.style.opacity=0;s.textContent=SHOTS[k]||'';requestAnimationFrame(()=>{s.style.transition='opacity .5s';s.style.opacity=1})}}
 requestAnimationFrame(tick)}

/* C skips to the next camera shot */
addEventListener('keydown',e=>{const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.prep||e.code!=='KeyC'||e.repeat)return;e.preventDefault();e.stopImmediatePropagation();Rc.prepT=(Math.floor(Rc.prepT/6)+1)*6+.001;if(P.sfx)P.sfx('move')},true);

/* Quickplay and Career races get the same start line: launch, then hold on the prep until the player starts */
const L0=P.launch;
P.launch=function(cfg){const r=L0.apply(this,arguments);try{
 const Rc=typeof RACE!=='undefined'?RACE:null;
 if(Rc&&cfg&&!cfg.rally&&cfg.mode!=='free'&&cfg.mode!=='rally'&&!Rc.prep&&!cfg.noPrep&&P.enterPrep){const h=(cfg.humans||[])[0]||{};P.enterPrep({id:h.id,alt:h.alt,name:h.name||'You',p:0},0)}
}catch(err){console.warn('prepfx',err)}return r};
})();
