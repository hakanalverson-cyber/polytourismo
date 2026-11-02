/* ===== Poly GT layer: the start stage, in the main menu's own look.
   One floating menu panel on the right (the same panel, rows and blue selection as the main menu), the event title in thin type
   bottom-left, and the main menu's key hints. Used by every car mode (rally.js owns the prep state and cameras; this layer draws the
   card and gives Quickplay and Career the same prep) and by the bike mode's prep screen (bikes.js uses the .psx classes). ===== */
(function prepFx(){
'use strict';
const P=window.PT8;if(!P||!P.launch)return;
const $i=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[<&>"]/g,c=>({'<':'&lt;','&':'&amp;','>':'&gt;','"':'&quot;'})[c]);
const SHOTS=['Orbit','Start line','Aerial','Fly-by','Wheel'];
const MODES={ta:'Time Attack',mp:'Race',elim:'Elimination',cutup:'Cut-Up',drift:'Drift'};

/* the main menu panel (#gxBot), rows (.gxm) and key hints (.gxpad), as shared classes */
const CSS=`
.psx{position:fixed;right:5vw;top:calc(66px + clamp(24px,8vh,110px));width:clamp(400px,31vw,600px);padding:clamp(14px,1.2vw,22px);box-sizing:border-box;border-radius:14px;
 background:linear-gradient(180deg,#2a2e33e8,#141619f0);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;transform:perspective(1400px) rotateY(-9deg);transform-origin:right center;
 z-index:46;pointer-events:auto;color:#fff;font-family:var(--gt,"Inter",sans-serif);-webkit-font-smoothing:antialiased;animation:psxIn .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes psxIn{from{opacity:0;transform:perspective(1400px) rotateY(-9deg) translateX(40px)}}
.psx .hd{display:flex;align-items:center;gap:14px;padding:6px 8px clamp(12px,1.8vh,18px);margin-bottom:10px;border-bottom:1px solid #ffffff14}
.psx .hd .av{flex:none;width:clamp(40px,5.4vh,56px);height:clamp(40px,5.4vh,56px);border-radius:10px;display:grid;place-items:center;font:500 clamp(16px,2.4vh,24px) var(--gt);color:#fff;
 background:linear-gradient(160deg,#8fb4d8,#33608c);box-shadow:inset 0 1px 0 #ffffffa0}
.psx .hd .pt{min-width:0}.psx .hd b{display:block;font:400 clamp(16px,2.1vh,22px) var(--gt);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.psx .hd small{display:block;font:400 clamp(11px,1.4vh,14px) var(--gt);color:#9aa3ab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.psx .rs{display:flex;flex-direction:column;gap:2px}
.psx .r{display:flex;align-items:center;gap:14px;height:clamp(46px,6.4vh,70px);padding:0 clamp(16px,1.2vw,22px);border-radius:9px;cursor:pointer;font:300 clamp(18px,2.6vh,27px) var(--gt);color:#c9d2d8;white-space:nowrap}
.psx.sm .r{height:clamp(36px,4.9vh,52px);font-size:clamp(15px,2.1vh,22px)}
.psx .r:hover{color:#fff}
.psx .r .v{margin-left:auto;display:flex;align-items:center;gap:10px;font:400 clamp(11px,1.3vh,14px) var(--gt);letter-spacing:.14em;color:#ffffff70;text-transform:uppercase}
.psx .r .v i{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 1px 0 #ffffff60,0 0 0 1px #0008}
.psx .r .v s{text-decoration:none;opacity:0;font:300 18px var(--gt);letter-spacing:0;padding:0 2px}
.psx .r.on{color:#fff;background:var(--gxa,#3f6fa3);box-shadow:inset 0 1px 0 #ffffffa0,inset 0 -1px 0 #0004,0 0 24px #4f7eab90;text-shadow:0 1px 1px #0005}
.psx .r.on .v{color:#e8f0f7}.psx .r.on .v s{opacity:.9}
.psx .r .dot{width:9px;height:9px;border-radius:50%;flex:none}
.psx .gap{height:8px}
.psxPad{position:fixed;right:5vw;bottom:clamp(20px,3.4vh,40px);z-index:46;display:flex;gap:24px;font:400 clamp(13px,1.5vh,16px) var(--gt,"Inter",sans-serif);color:#e6e9ee;pointer-events:auto}
.psxPad span{display:flex;align-items:center;gap:8px;cursor:pointer}
.psxPad u{text-decoration:none;min-width:22px;height:22px;padding:0 7px;box-sizing:border-box;border-radius:6px;display:grid;place-items:center;font:600 11px var(--gt);color:#e6e9ee;
 background:linear-gradient(180deg,#3a4048,#1a1d22);box-shadow:inset 0 1px 0 #ffffff40,0 0 0 1px #000,0 2px 0 #000}
.psxT{position:fixed;left:5vw;bottom:clamp(40px,8vh,96px);z-index:46;color:#fff;font-family:var(--gt,"Inter",sans-serif);pointer-events:none;text-shadow:0 2px 14px #000a;animation:psxUp .6s .1s cubic-bezier(.2,.8,.2,1) both}
@keyframes psxUp{from{opacity:0;transform:translateY(18px)}}
.psxT small{display:flex;align-items:center;gap:10px;font:500 11px var(--gt);letter-spacing:.22em;color:#c9d2d8;text-transform:uppercase;margin-bottom:6px}
.psxT small:after{content:"";width:50px;height:1px;background:currentColor}
.psxT b{display:block;font:200 clamp(38px,6vh,64px)/1 var(--gt);white-space:nowrap}
.psxT p{margin:10px 0 0;font:400 clamp(12px,1.5vh,15px) var(--gt);letter-spacing:.06em;color:#c9d2d8}
.psxT .sb{display:grid;grid-template-columns:110px 160px;gap:6px 14px;align-items:center;margin-top:14px;font:500 10px var(--gt);letter-spacing:.2em;color:#c9d2d8}
.psxT .sb u{display:block;height:4px;border-radius:2px;background:#ffffff26;overflow:hidden}.psxT .sb u i{display:block;height:100%;background:#e8f0f7}
.psxV{position:fixed;inset:0;z-index:44;pointer-events:none;background:linear-gradient(90deg,#000a 0%,#0000 38%,#0000 58%,#0008 100%),linear-gradient(0deg,#0009 0%,#0000 30%)}
#rlPrep.psxOn{background:none!important;padding:0!important}#rlPrep.psxOn:before{display:none!important}
body.rprep [id^="h8"],body.rprep .h8top,body.rprep #rlCp{visibility:hidden!important}
@media (max-width:760px){.psx{left:16px;right:16px;width:auto;transform:none;top:auto;bottom:70px}.psxT{display:none}.psxPad{left:16px;right:16px}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

/* a row list with a selection: rows are {k,l,v,dot,act,adj}. Returns the html of the rows */
P.psxRows=(rows,sel)=>rows.map((r,i)=>r.gap?'<div class="gap"></div>':`<div class="r${i===sel?' on':''}" data-i="${i}">${r.dot?`<span class="dot" style="background:${r.dot}"></span>`:''}<span>${esc(r.l)}</span>${r.v!=null?`<span class="v">${r.adj?'<s data-d="-1">&lsaquo;</s>':''}${r.sw?`<i style="background:${r.sw}"></i>`:''}${esc(r.v)}${r.adj?'<s data-d="1">&rsaquo;</s>':''}</span>`:''}</div>`).join('');
P.psxPad=items=>items.map(([k,l,a])=>`<span data-a="${a||''}"><u>${k}</u>${l}</span>`).join('');

/* ---------------- car modes: the start stage ---------------- */
let PS=null;/* {rows, sel} while a car prep is up */
function modeName(Rc,o){const c=Rc.cfg||{};let m=o.label?o.label.charAt(0)+o.label.slice(1).toLowerCase():(MODES[c.mode]||'Race');
 if(c.mode==='mp'&&c.humans&&c.humans.length>1)m='Split Screen';const ST=P.ui&&P.ui.ST;if(ST&&ST.cev&&!c.rally)m='Career · '+m;return m}
function carRows(Rc){const k=Rc.shotK==null?0:Rc.shotK;return[{k:'go',l:PS.startTxt,act:1},{k:'cam',l:'Camera',v:SHOTS[k],adj:1},{k:'back',l:'Back',act:1}]}
function paint(){const e=$i('rlPrep');if(!e||!PS)return;const rs=e.querySelector('.rs');if(!rs)return;PS.rows=carRows(RACE);rs.innerHTML=P.psxRows(PS.rows,PS.sel);hook(e)}
function hook(e){e.querySelectorAll('.psx .r').forEach(r=>{const i=+r.dataset.i;r.onmouseenter=()=>{if(PS.sel!==i){PS.sel=i;paint()}};r.onclick=ev=>{const d=ev.target&&ev.target.dataset&&ev.target.dataset.d;PS.sel=i;if(d)change(+d);else act()}});
 e.querySelectorAll('.psxPad span').forEach(s=>s.onclick=()=>{const a=s.dataset.a;if(a==='go')act(0);else if(a==='back')back();else if(a==='cam')change(1)})}
function act(force){const r=PS.rows[force!=null?force:PS.sel];if(!r)return;if(r.k==='go'){PS=null;P.startStage&&P.startStage()}else if(r.k==='back')back();else if(r.k==='cam')change(1)}
function back(){window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}))}
function change(d){const Rc=RACE;if(!Rc)return;const r=PS.rows[PS.sel];if(!r||r.k!=='cam'){PS.sel=1}
 /* the prep cameras change shot every 6 s: step to the next (or previous) one */
 const sh=Math.floor(Rc.prepT/6);Rc.prepT=Math.max(0,(sh+(d>0?1:-1))*6)+.001;if(d<0&&sh===0)Rc.shot0=(Rc.shot0+4)%5;if(P.sfx)P.sfx('move');setTimeout(paint,30)}

function dress(e,Rc,o){const c=Rc.cfg||{},T=Rc.T,car=o.car||{},wx=(Rc.wx&&Rc.wx.n)||c.weather||'clear';
 PS={sel:0,startTxt:o.startTxt||'Start race',rows:[]};
 const facts=(o.facts||[]).filter(f=>!/^99 laps/i.test(f)).concat(c.tod&&c.tod!=='day'?[c.tod]:[]).map(f=>String(f).toLowerCase()).join(' · ');
 const who=o.multi?`${esc(o.d.name)} · run ${o.i+1}`:'';
 e.className='psxOn';
 e.innerHTML=`<div class="psxV"></div>
 <div class="psxT"><small>${esc(modeName(Rc,o))}${who?' · '+who:''}</small><b>${esc(T&&T.d&&T.d.name||'')}</b><p>${esc(facts)}</p></div>
 <div class="psx"><div class="hd"><div class="av">${esc(car.cls||'')}</div><div class="pt"><b>${esc(car.name||'')}</b><small>${esc([car.type,car.drive].filter(Boolean).join(' · '))}</small></div></div><div class="rs"></div></div>
 <div class="psxPad">${P.psxPad([['&uarr;&darr;','Choose'],['Enter','Select','go'],['C','Camera','cam'],['Esc','Back','back']])}</div>
 <button id="rlPlay" style="display:none"></button>`;
 paint();lastShot=-1;if(!loopOn){loopOn=true;requestAnimationFrame(tick)}}
P.prepDress=dress;

/* keys while a car prep is up: rally.js asks first (Enter would otherwise start at once) */
P.prepKey=e=>{if(!PS)return false;const c=e.code;
 if(c==='ArrowUp'||c==='KeyW'){PS.sel=(PS.sel+PS.rows.length-1)%PS.rows.length;P.sfx&&P.sfx('move');paint();return true}
 if(c==='ArrowDown'||c==='KeyS'){PS.sel=(PS.sel+1)%PS.rows.length;P.sfx&&P.sfx('move');paint();return true}
 if(c==='ArrowLeft'||c==='KeyA'){if(PS.rows[PS.sel]&&PS.rows[PS.sel].k==='cam'){change(-1);return true}return true}
 if(c==='ArrowRight'||c==='KeyD'){if(PS.rows[PS.sel]&&PS.rows[PS.sel].k==='cam'){change(1);return true}return true}
 if(c==='KeyC'){change(1);return true}
 if(c==='Enter'||c==='Space'||c==='NumpadEnter'){const r=PS.rows[PS.sel];if(r&&r.k==='back'){PS=null;return false/* rally.js treats Esc */}act();return true}
 if(c==='Escape'){PS=null;return false}return false};

let loopOn=false,lastShot=-1;
function tick(){const e=$i('rlPrep'),Rc=typeof RACE!=='undefined'?RACE:null;
 if(!e||e.style.display==='none'||!Rc||!Rc.prep||!PS){loopOn=false;lastShot=-1;if(!(Rc&&Rc.prep))PS=null;return}
 if(Rc.shotK!=null&&Rc.shotK!==lastShot){lastShot=Rc.shotK;paint()}requestAnimationFrame(tick)}

/* Quickplay and Career races get the same start stage */
const L0=P.launch;
P.launch=function(cfg){const r=L0.apply(this,arguments);try{
 const Rc=typeof RACE!=='undefined'?RACE:null;
 if(Rc&&cfg&&!cfg.rally&&cfg.mode!=='free'&&cfg.mode!=='rally'&&!Rc.prep&&!cfg.noPrep&&P.enterPrep){const h=(cfg.humans||[])[0]||{};P.enterPrep({id:h.id,alt:h.alt,name:h.name||'You',p:0},0)}
}catch(err){console.warn('prepfx',err)}return r};
})();
