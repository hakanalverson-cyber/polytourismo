/* ===== Poly GT layer: Drive Lab (DRIVE=1 builds only) =====
   A small test build for handling: the same physics as the game, but only one or two model tracks, no extra music or stills, and it
   skips the menus. A bar at the top picks the track and car, sets the steering sensitivity (live, the game's own STEERING option) and
   restarts the run. */
(function ptDriveLab(){
'use strict';
if(!window.PT8_DRIVE)return;
const P=window.PT8;
const LS='ptDriveLab',sv=(()=>{try{return JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){return{}}})(),save=()=>{try{localStorage.setItem(LS,JSON.stringify(sv))}catch(e){}};
const css=document.createElement('style');css.textContent=`
#dlab{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99995;display:flex;gap:10px;align-items:center;padding:7px 12px;border-radius:6px;
 background:rgba(8,10,12,.78);color:#e8ecee;font:12px/1.2 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;transition:opacity .3s}
#dlab b{font-weight:800;letter-spacing:.12em;color:#fff}
#dlab select,#dlab button{font:inherit;color:#fff;background:#1d2327;border:1px solid #3a444a;border-radius:4px;padding:4px 6px}
#dlab button{cursor:pointer;background:#e8ecee;color:#111;font-weight:700;padding:4px 12px}
#dlab input{width:110px;vertical-align:middle}
#dlab .v{display:inline-block;width:34px;text-align:right;font-variant-numeric:tabular-nums}
body.dlabDrive #dlab{opacity:.35}body.dlabDrive #dlab:hover{opacity:1}`;
document.head.appendChild(css);
function tracks(){const out=[];if(typeof D==='undefined')return out;D.forEach((d,i)=>{if(!d||i===P.RING_IDX)return;if(d.packOnly&&!d.cartoon)return;out.push([i,d.name])});
 /* the model tracks first */out.sort((a,b)=>(D[b[0]].cartoon?1:0)-(D[a[0]].cartoon?1:0));return out}
function cars(){const tc=P.TRACK_CARS||[];return P.CARS.slice().sort((a,b)=>(tc.includes(b.id)?1:0)-(tc.includes(a.id)?1:0)||a.name.localeCompare(b.name))}
function steer(v){if(window.PTO){PTO.steering=v;try{localStorage.setItem('pt7-options',JSON.stringify(PTO))}catch(e){}}}
function bar(){let e=document.getElementById('dlab');if(e)return e;e=document.createElement('div');e.id='dlab';
 const tr=tracks(),cs=cars(),tc=P.TRACK_CARS||[];if(sv.track==null||!tr.some(t=>t[0]===sv.track))sv.track=tr.length?tr[0][0]:0;
 if(!sv.car||!cs.some(c=>c.id===sv.car)){const r8=cs.find(c=>/r8/i.test(c.id+c.name));sv.car=(r8||cs[0]).id}
 if(!(sv.steer>0))sv.steer=(window.PTO&&PTO.steering)||1;
 e.innerHTML=`<b>DRIVE LAB</b><select id="dlT">${tr.map(t=>`<option value="${t[0]}"${t[0]===sv.track?' selected':''}>${t[1]}</option>`).join('')}</select>
 <select id="dlC">${cs.map(c=>`<option value="${c.id}"${c.id===sv.car?' selected':''}>${tc.includes(c.id)?'':'· '}${c.name}</option>`).join('')}</select>
 <label>Steering <input id="dlS" type="range" min="0.5" max="1.5" step="0.05" value="${sv.steer}"><span class="v" id="dlSv">${(+sv.steer).toFixed(2)}</span></label>
 <button id="dlGo">Drive</button>`;document.body.appendChild(e);
 const T=e.querySelector('#dlT'),C=e.querySelector('#dlC'),S=e.querySelector('#dlS');
 /* lists and the slider give the keyboard back at once, so the arrow keys and WASD drive instead of changing them */
 T.onchange=()=>{sv.track=+T.value;save();T.blur();go()};C.onchange=()=>{sv.car=C.value;save();C.blur();go()};
 S.oninput=()=>{sv.steer=+S.value;e.querySelector('#dlSv').textContent=sv.steer.toFixed(2);steer(sv.steer);save()};S.onchange=()=>S.blur();
 e.querySelector('#dlGo').onclick=ev=>{ev.target.blur();go()};steer(+sv.steer);return e}
function go(){try{if(typeof RACE!=='undefined'&&RACE&&P.cleanupRace)P.cleanupRace()}catch(e){}
 P.launch({mode:'rally',circuit:true,track:sv.track,laps:5,humans:[{id:sv.car,alt:0,name:'Driver'}],ai:[],tod:'day',endur:false,weather:'clear'})}
/* boot: wait for the game, skip the title and menus, open straight on the start line */
const t0=Date.now(),iv=setInterval(()=>{if(!(P.launch&&P.CARS&&typeof D!=='undefined'))return;const ti=document.getElementById('ptTitle');
 if(ti&&!ti.classList.contains('out')){ti.click();return}if(Date.now()-t0<1500)return;clearInterval(iv);bar();go()},300);
setInterval(()=>{document.body.classList.toggle('dlabDrive',typeof RACE!=='undefined'&&!!RACE&&!RACE.prep&&typeof scr!=='undefined'&&scr==='game')},300);
})();
