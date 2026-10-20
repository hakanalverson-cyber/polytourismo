/* ===== Poly GT layer: update log (menu button + overlay) ===== */
(function ptUpdateLog(){
'use strict';
const P=window.PT8;
P.LOG=[
 {v:'0.05',d:'Oct 20, 2026',t:'Loading scenes, rally split, podium',items:[
  'Animated podium: blocks rise, winner gets a shine, times and titles pop in.',
  'Career loads with a car cruising a city at night; Track loads with a trackside fly-by.',
  'WRC is now only the Stratos, Delta, 037, Polo and Impreza WRX Rally; the rest are Casual. R35, Civic Type R and AE86 left rally.',
  'WRC cars are phenomenal on gravel, Casual cars are good.',
  'Rally and Track garage sections start closed.',
  'Career Cut-Up targets are much lower (max 2,000).',
  'Road Atlanta now has the same grip across the whole surface.']},
 {v:'0.04',d:'Oct 20, 2026',t:'Classes, tuning and economy',items:[
  'Pagani Zonda Cinque is now the Zonda R.',
  'Diablo, Huracan, 458 and 599 GTB moved to the low end of class A; the RS4 Avant is now upper-middle class B (and priced to match).',
  'Track-only cars sit higher in their class and are a bit sharper.',
  'All cars cost 5% more; race income is up about 8%.',
  'Tuning is stronger and now costs credits for every step away from stock (reset is free).',
  'Different poses for the small photos under car info.',
  'Resuming from pause gives a 3-2-1 countdown.',
  'Removed the beeping ambience sound.']},
 {v:'0.03',d:'Oct 20, 2026',t:'Smoother menus and a loading screen',items:[
  'Menu transitions are now a plain black fade.',
  'Every mode gets the car loading screen, with your own car on it. Its wheels now spin and steer properly.',
  'Lists (tracks, cars, modes) pop in when a screen opens, not on every click.',
  'Harbor Lights town redone: tidy street grid, city buildings only (no barns or greenhouses), calmer colours.']},
 {v:'0.02',d:'Oct 20, 2026',t:'Update log',items:[
  'New update log button in the main menu (this screen).',
  'The tutorial moved to Settings > Driving, with a PLAY button.']},
 {v:'0.01',d:'Oct 20, 2026',t:'Poly GT',items:[
  'The game is now called Poly GT.',
  'Leaderboard: podium cards plus a full table with best lap, driver, car and a title for each driver.',
  'Damage setting in every mode. Hit something hard enough and the car is hurt; at 100% it explodes and respawns where it was 3 seconds later.',
  'Gentler wall damage: light scrapes do nothing, hits are spaced out and the collision margin is tighter.',
  'Sparks, smoke and debris on every impact; sparks while you grind along a wall; skid smoke now comes from the tires.',
  'Per-player Manual / Auto gearbox in car setup, and every car now has its real number of gears in every mode.',
  'Perf points come from real-world stats, are capped at 1,500, and every garage list runs lowest to highest within each class.',
  'Pit stops, fuel and tyre wear are gone.',
  'Harbor Lights: hundreds more buildings and trees around the docks.',
  'Cut-up: traffic wheels now spin and steer.',
  'Menu transitions: a sweep between screens and panels that glide in.',
  'Afterhours: street lights, tunnel and night-sky fixes, and a darker, calmer tunnel interior.']}
];
const css=document.createElement('style');
css.textContent=`@keyframes ptFadeIn{from{opacity:0}}#ptLog{position:fixed;inset:0;z-index:8000;display:none;align-items:center;justify-content:center;background:#05070acc;backdrop-filter:blur(3px)}
#ptLog.on{display:flex;animation:ptFadeIn .25s ease both}
#ptLog .lgBox{width:min(720px,92vw);max-height:84vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#121920,#0b0f13);border:1px solid #ffffff18;border-top:3px solid #f1f3f5}
#ptLog .lgHd{display:flex;align-items:center;padding:16px 22px;border-bottom:1px solid #ffffff12}
#ptLog .lgHd h2{margin:0;font:800 18px var(--mn);letter-spacing:.28em;font-style:italic}#ptLog .lgHd h2 em{color:#7fe3f2;font-style:italic}
#ptLog .lgHd span{margin-left:auto;font:700 10px var(--mn);letter-spacing:.2em;color:var(--dim)}
#ptLog .lgBody{overflow:auto;padding:6px 22px 18px}
#ptLog .lgV{padding:16px 0 4px;border-bottom:1px solid #ffffff0d}#ptLog .lgV:last-child{border:0}
#ptLog .lgV h3{margin:0 0 4px;font:800 15px var(--mn);letter-spacing:.14em;display:flex;gap:12px;align-items:baseline}
#ptLog .lgV h3 b{color:#f2c76b}#ptLog .lgV h3 small{font:600 10px var(--mn);letter-spacing:.18em;color:var(--dim)}
#ptLog .lgV h4{margin:0 0 8px;font:600 11px var(--mn);letter-spacing:.2em;color:#9fb0ba;text-transform:uppercase}
#ptLog ul{margin:0 0 12px;padding-left:18px}#ptLog li{margin:5px 0;font:500 13px/1.45 system-ui,sans-serif;color:#d7dde2}
#ptLog .lgFt{padding:12px 22px;border-top:1px solid #ffffff12;display:flex;justify-content:flex-end}`;
document.head.appendChild(css);
const ov=document.createElement('div');ov.id='ptLog';document.body.appendChild(ov);
const open=()=>{const cur=(document.querySelector('.menuTop small')||{}).textContent||'';
 ov.innerHTML=`<div class="lgBox"><div class="lgHd"><h2>UPDATE <em>LOG</em></h2><span>${cur}</span></div><div class="lgBody">`+P.LOG.map(e=>`<div class="lgV"><h3><b>v${e.v}</b><small>${e.d}</small></h3><h4>${e.t}</h4><ul>${e.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('')+`</div><div class="lgFt"><button class="btn" id="lgClose"><span>Close</span></button></div></div>`;
 ov.classList.add('on');if(P.sfx)P.sfx('select');ov.querySelector('#lgClose').onclick=close};
const close=()=>{if(ov.classList.contains('on')){ov.classList.remove('on');if(P.sfx)P.sfx('back')}};
ov.addEventListener('click',e=>{if(e.target===ov)close()});
addEventListener('keydown',e=>{if(ov.classList.contains('on')&&(e.code==='Escape'||e.code==='Enter')){e.stopImmediatePropagation();e.preventDefault();close()}},true);
const ma=document.querySelector('.menuActions');
if(ma){const b=document.createElement('button');b.innerHTML='<small>05</small> Update log';b.style.order=5;b.onclick=open;ma.append(b)}
P.openUpdateLog=open;
})();
