/* ===== Poly GT layer: update log (menu button + overlay) ===== */
(function ptUpdateLog(){
'use strict';
const P=window.PT8;
P.LOG=[
 {v:'0.04',d:'Oct 20, 2026',t:'New track: Broken Span',items:[
  'Harbor Lights is gone, replaced by Broken Span, the first track of a brand-new roster: a long orange suspension bridge with two towers, hangers and cables, snapped in half.',
  'Floor it up the ramp and jump the 18 m gap. Fall short and you are sent back to a long run-up, so you can try again at full speed.',
  'You land on City Island, a walled island city built from the building pack and KayKit buildings: unbroken rows of buildings face every shore, corner towers, brick gate houses over both roads, shopfronts, trees, hydrants, bins and rooftop water towers.',
  'Any gap between buildings is a tiny alley with dumpsters, bins, crates and bags; larger leftovers become pocket parks.',
  'A low causeway on concrete piers brings you home across the bay, then a hairpin on the mainland and back up the bridge approach.',
  'Wreckage lies in the water under the gap, with dangling cables, bent truss ends, rebar and hazard boards; the whole map works at dawn, day, sunset and night.',
  'Jumps can now have their own gap length and ramp height, and respawns near a long gap start well back so you can build speed again.']},
 {v:'0.03',d:'Oct 20, 2026',t:'New streetlights',items:[
  'All streetlights on every map: new lamp model, a much wider and softer pool of light, a smoother glow, and lights that fade in and out instead of popping.',
  'Only the rally mode has a loading screen now; everything else launches straight in. The loader car\'s front wheels point straight.',
  'Update log reset: everything before this is folded into 0.02.']},
 {v:'0.02',d:'Oct 20, 2026',t:'Everything so far',items:[
  'The game is now Poly GT, with an update log in the main menu and the tutorial under Settings > Driving.',
  'Leaderboard podium cards with animated blocks, a full table, and a title for each driver.',
  'Damage setting in every mode: sparks, smoke and debris on impacts, explosions at 100% and a respawn after 3 seconds.',
  'Per-player Manual / Auto gearbox; every car has its real gear count. Pit stops, fuel and tyre wear are gone.',
  'Perf points come from real stats and are capped at 1,500; every garage list runs low to high within each class.',
  'Reclassed cars (Diablo, Huracan, 458 and 599 GTB low class A, RS4 Avant upper class B, Zonda R renamed), higher-sitting track-only cars, 5% higher prices, about 8% more income.',
  'Stronger tuning that now costs credits (reset is free); new poses for the car photos; a 3-2-1 countdown when you resume.',
  'WRC is the Stratos, Delta, 037, Polo and Impreza WRX Rally (phenomenal on gravel); other rally cars are Casual (good on gravel). Rally and Track garage sections start closed.',
  'Career Cut-Up targets are lower (max 2,000). Every road surface now has the same steady grip.',
  'Smoother menus: black fades, lists pop in once, beeping ambience removed.',
  'Afterhours skyline rebuilt with the building pack.']}
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
