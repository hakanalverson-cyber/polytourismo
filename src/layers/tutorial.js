/* ===== Poly Tourismo v9 layer: tutorial (guided lesson on the Quarry + first-run offer) ===== */
(function v9tut(){
'use strict';
const P=window.PT8;
const auto=()=>!!(window.PTO&&PTO.autoShift);
/* each step: interactive ones advance when the player does the thing, info ones wait for Next */
const S=[
 {t:'Welcome',x:'This lesson is a free drive with prompts. <b>W</b> accelerate &middot; <b>S</b> brake / reverse &middot; <b>A</b> / <b>D</b> steer &middot; <b>Space</b> handbrake &middot; <b>Esc</b> pause. Wait for GO.',ok:(c,R)=>R.state==='race'},
 {t:'Throttle',x:'Hold <b>W</b> and build up some speed.',ok:c=>c.sp>12},
 {t:'Steering',x:'Steer both ways with <b>A</b> and <b>D</b>. Small, smooth inputs are faster than yanking the wheel.',ok:(c,R,s)=>s.a&&s.d&&c.sp>6},
 {t:'Gears',x:()=>auto()?'Auto-shift is on, so the gearbox changes for you. Reach 3rd gear. (Turn it off in Settings for manual shifting and perfect-shift boosts.)':'<b>Double-tap W</b> to shift up, <b>double-tap S</b> to shift down. Shift close to the redline for a free <b>perfect-shift</b> boost. Reach 3rd gear.',ok:c=>(c.gear|0)>=2},
 {t:'Braking',x:'Brake <b>before</b> corners, then get back on the power. Get above 70 km/h, then hold <b>S</b> until you are almost stopped.',ok:(c,R,s)=>{if(c.sp>20)s.fast=1;return s.fast&&c.sp<8}},
 {t:'Elimination',info:1,x:'In <b>Elimination</b> the car in last place is knocked out on every timer. Last place also gets a small speed boost, so staying out of the back is the job. Setup lets you change the interval and CPU level.'},
 {t:'Weather',info:1,x:'Rain, storm and fog change the grip and visibility. Set it in the <b>Weather</b> row of Multiplayer or Elimination setup. In the wet, brake earlier and be gentle with the throttle.'},
 {t:'Tuning',info:1,x:'In the <b>Garage</b> you can tune <b>gearing, aero, tyres and more</b>. Changes show on the performance chart with a green <b>+</b> bar. Tuning applies in Multiplayer, Elimination and Career (not Time Attack).'},
 {t:'Rally gearbox',part:2,info:1,x:'Rally uses <b>real gearboxes</b>: every car has the number of gears it has in real life (6 to 9). Shifting is manual: <b>E</b> up, <b>Q</b> down, <b>W/S</b> throttle and brake, <b>A/D</b> steer. Short gears pull hard, tall gears go fast. Upshift near the limit, drop a gear before a corner. (Auto-shift in Settings still works.)'},
 {t:'Handbrake and camera',part:2,info:1,x:'Hold <b>Space</b> to lock the rear wheels and swing the tail round hairpins and junctions, then release to get grip back. Press <b>C</b> to cycle the camera: chase, hood, bumper, far chase. The suspension is much softer in Rally, so cars ride dips and crests.'},
 {t:'Pace notes and checkpoints',part:2,info:1,x:'The arrow shows the next corner, turning the way it turns, and hotter colours mean tighter (hairpin is red). <b>WATER</b>, <b>JUMP</b> and <b>NARROW</b> warn you about fords, crests and pinch points. Each stage has gates that show your split time, and you can watch a replay at the end.'},
 {t:'Lesson complete',done:1,x:'That is the basics. Keep driving as long as you like, or head back to the menu.'}];
let st=null;
const el=()=>document.getElementById('tut');
function mkEl(){let e=el();if(e)return e;e=document.createElement('div');e.id='tut';
 e.innerHTML='<div class="th"><b>LESSON</b><span id="tutN"></span><i id="tutBar"><u></u></i></div><div id="tutBody"><div class="tt" id="tutT"></div><div class="tx" id="tutX"></div></div><div class="tbt"><button id="tutSkip"></button><button id="tutQuit">Exit lesson</button></div>';
 document.body.appendChild(e);
 e.querySelector('#tutSkip').onclick=()=>{if(!st)return;if(S[st.i].done){P.sfx('back');P.cleanupRace();show('menu');P.menuStats&&P.menuStats();st=null;e.style.display='none'}else next()};
 e.querySelector('#tutQuit').onclick=()=>{P.sfx('back');P.cleanupRace();show('menu');st=null;e.style.display='none'};return e}
function paint(){const e=mkEl(),s=S[st.i],last=!!s.done;e.style.display='';e.classList.toggle('ok',!!st.okT);e.querySelector('#tutBody').style.opacity=1;
 e.querySelector('#tutN').textContent=(st.i+1)+' / '+S.length;e.querySelector('#tutBar u').style.width=((st.i+(st.okT?1:0))/S.length*100)+'%';
 e.querySelector('#tutT').textContent=(st.okT?'✓ ':'')+(s.part?'PART 2 / RALLY · ':'')+s.t;e.querySelector('#tutX').innerHTML=typeof s.x==='function'?s.x():s.x;
 const b=e.querySelector('#tutSkip');b.textContent=last?'Back to menu':s.info?'Next':'Skip step';b.className=(s.info||last)?'pri':'';
 e.querySelector('#tutQuit').style.display=last?'none':''}
function next(){if(st.hold)return;P.sfx('click');const e=mkEl(),bd=e.querySelector('#tutBody'),mine=st;bd.style.opacity=0;st.i=Math.min(S.length-1,st.i+1);st.okT=0;st.s={};st.hold=1;setTimeout(()=>{if(st!==mine)return;st.hold=0;paint();bd.style.opacity=1},260);if(S[st.i].done){try{const sv=P.SV();sv.tutDone=1;P.save()}catch(e){}P.sfx('medal')}}
P.startTutorial=()=>{P.launch({mode:'ta',track:0,laps:99,endur:false,humans:[{id:'merc',alt:0}],ai:[]});if(RACE)RACE.tut=1;st={i:0,okT:0,s:{}};lt=0;mkEl();paint()};
const kd={a:0,d:0,hb:0};
addEventListener('keydown',e=>{if(!st)return;const s=st.s;if(e.code==='KeyA')s.a=1;if(e.code==='KeyD')s.d=1;if(e.code==='Space')s.hb=1});
const hu0=hudUpdate;let lt=0;
hudUpdate=()=>{hu0();const e=el();if(!st){if(e)e.style.display='none';return}
 if(!RACE||!RACE.tut||scr!=='game'){if(e)e.style.display='none';if(!RACE||!RACE.tut)st=null;return}
 if(e&&e.style.display==='none')e.style.display='';
 const now=RACE.t||0,dt=Math.max(0,Math.min(.1,now-lt));lt=now;const s=S[st.i];
 if(st.hold)return;if(st.okT){st.okT-=dt;if(st.okT<=0)next();return}
 if(s.info||s.done)return;const c=RACE.cars.find(q=>q.human);if(!c)return;
 if(s.ok(c,RACE,st.s,dt)){st.okT=1.1;P.sfx('ok');paint()}};
/* ---- menu entry + first-run offer ---- */
(function(){const ma=document.querySelector('.menuActions');if(!ma)return;
 const b=document.createElement('button');b.innerHTML='<small>05</small> Tutorial';b.style.order=5;b.onclick=()=>P.startTutorial();ma.append(b);
 const m=document.getElementById('menu');if(!m)return;const o=document.createElement('div');o.id='tutOffer';o.style.display='none';
 o.innerHTML='<b>New here?</b><span>Take the short driving lesson: controls, gears, braking and the rest.</span><button class="pri" id="tutYes">Start lesson</button><button id="tutNo">Not now</button>';m.appendChild(o);
 const hide=()=>{o.style.display='none';try{const sv=P.SV();sv.tutDone=sv.tutDone||2;P.save()}catch(e){}};
 o.querySelector('#tutYes').onclick=()=>{hide();P.startTutorial()};o.querySelector('#tutNo').onclick=()=>{P.sfx('back');hide()};
 setTimeout(()=>{try{if(scr==='menu'&&!P.SV().tutDone)o.style.display=''}catch(e){}},1800)})();
})();
