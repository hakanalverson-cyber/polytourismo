/* ===== Poly GT v0.04 layer: econ (class placement fixes, +5% prices, higher income, paid + stronger tuning) ===== */
(function econ(){
'use strict';
const P=window.PT8;if(!P||!P.CARS)return;
const AT=P.CLASS_AT||[480,576,672,768],ceil=v=>{for(const a of AT)if(v<a)return a-4;return 1500};
/* 1) renames */
{const z=P.BYID.zen;if(z)z.name='PAGANI ZONDA R'}
/* rally gravel: WRC cars are phenomenal on gravel, casual rally cars are good */
P.CARS.forEach(c=>{if(c.rdiv==='WRC')c.off=Math.max(c.off||0,1);else if(c.rdiv==='CASUAL')c.off=Math.max(c.off||0,.9)});
{const m0=P.mul;P.mul=c=>{const m=m0(c);try{if(c.human&&RACE&&RACE.cfg&&RACE.cfg.rally&&!RACE.cfg.circuit&&c.cs){const d=c.cs.rdiv;if(d==='WRC'){m.grip*=1.14;m.acc*=1.1;m.brk*=1.25;m.top*=1.03}else if(d==='CASUAL'){m.grip*=1.04;m.acc*=1.03;m.brk*=1.08}}}catch(e){}return m}}
/* 2) class placement: fixed performance points + a small matching nudge to the real stats */
const FIX={};const nudge=(c,m)=>{const t=o=>{if(!o)return;o.acc=+(o.acc*m).toFixed(2);o.grip=+(o.grip*m).toFixed(3);o.brk=+(o.brk*m).toFixed(3)};t(c);t(c._std);t(c._tk)};
const set=(id,target)=>{const c=P.BYID[id];if(!c)return;const p0=P.pp(c);FIX[id]=target;nudge(c,Math.max(.94,Math.min(1.12,1+(target/p0-1)*.25)))};
set('c30',692);set('c33',700);set('c78',704);set('c88',708);   /* Diablo, Huracan, 458, 599: low class A */
set('lr',648);                                                  /* RS4 Avant: upper-middle class B */
/* track-only cars sit higher in their class and are a touch sharper at what they do */
{const tk=new Set([...(P.TRACK_CARS||[]),...P.CARS.filter(c=>c.trackOnly).map(c=>c.id)]);
 tk.forEach(id=>{const c=P.BYID[id];if(!c||FIX[id]!=null)return;const p0=P.pp(c);FIX[id]=Math.min(p0+30,ceil(p0));nudge(c,1.03)})}
{const pp1=P.pp;P.pp=c=>{const v=c&&FIX[c.id||c.carId];return v!=null?v:pp1(c)}}
P.reclass();
/* 3) prices +5% */
P.CARS.forEach(c=>{c.price=Math.round(c.price*1.05/100)*100;if(c.altPrice)c.altPrice=Math.round(c.altPrice*1.05/50)*50});
{const r=P.BYID.lr;if(r)r.price=46500}
P.SORTED.sort((a,b)=>P.CLS.indexOf(a.cls)-P.CLS.indexOf(b.cls)||P.pp(a)-P.pp(b));
/* 4) income a little higher */
{const e0=P.earn;P.earn=n=>e0(n>0?Math.round(n*1.08):n)}
/* 5) tuning: stronger effects, and every step away from stock costs credits */
P.tuneFx=(t,gravel)=>{const g=t.gear,ty=t.tyre,s=t.susp,a=t.aero,b=t.brake;
 return{top:(1+.025*g)*(1-.018*a),acc:1-.06*g,grip:(1-.07*ty)*(gravel?1-.05*s:1+.03*s)*(1+.04*a),brk:1+.08*b,wear:(ty<0?1-.35*ty:1-.3*ty)*(1+.03*Math.max(0,b))}};
P.tuneBase=id=>{const c=P.BYID[id];return Math.max(150,Math.min(3000,Math.round((c?c.price:20000)*.004/50)*50))};
P.tuneCost=(id,alt,k,v)=>{const d=P.TUNE.find(x=>x.k===k);if(!d)return 0;let cur=P.tuneGet(id,alt)[k];const to=Math.max(-d.r,Math.min(d.r,v)),b=P.tuneBase(id);let cost=0;
 while(cur!==to){const nx=cur+(to>cur?1:-1);if(Math.abs(nx)>Math.abs(cur))cost+=b*Math.abs(nx);cur=nx}return cost};
{const ts0=P.tuneSet;P.tuneSet=(id,alt,k,v)=>{const cost=P.tuneCost(id,alt,k,v);if(cost>0&&!P.spend(cost)){P._tuneMsg='Not enough credits ('+cost.toLocaleString()+' needed)';return false}P._tuneMsg=cost>0?'-'+cost.toLocaleString()+' cr':'';ts0(id,alt,k,v);return true}}

/* 6) 3-2-1 countdown when resuming from pause */
{const rs0=resume;let tok=0;
 const el=()=>{let e=document.getElementById('ptCD');if(!e){e=document.createElement('div');e.id='ptCD';e.style.cssText='position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;pointer-events:none;font:900 italic min(34vh,260px)/1 var(--mn,monospace);color:#fff;text-shadow:0 6px 40px #000c,0 0 8px #000;letter-spacing:.04em';document.body.appendChild(e)}return e};
 resume=function(){if(tok)return;const my=++tok,e=el();paused=true;down.clear();show('game');
  let n=3;const tick=()=>{if(my!==tok)return;if(scr!=='game'){e.style.display='none';tok=0;return}
   if(n===0){e.style.display='none';tok=0;rs0();return}
   e.textContent=n;e.style.display='flex';e.style.animation='none';void e.offsetWidth;e.style.animation='ptCD .9s ease-out both';try{beep(n>1?520:780,.14,'square',.2)}catch(er){}n--;setTimeout(tick,1000)};
  tick()};
 const o=show;show=function(n){if(n!=='game'){tok=0;const e=document.getElementById('ptCD');if(e)e.style.display='none'}return o.apply(this,arguments)}}
})();
