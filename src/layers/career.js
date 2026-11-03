/* ===== Poly GT layer: Career (0.03). The main menu's Career row opens your garage (#s8career, replacing the old Race Office there):
   a 3D scene in Hakan's garage model with your current car in the middle, Nina (mechanic and tuner, Hakan's Construction People pack)
   beside it and Vince (the fixer: races and Brand Central; a Summer People character until a better model turns up) at the desk.
   Click a person (or Left/Right + Enter) and the camera moves in close; answer choices appear. Vince hands out offers: races,
   eliminations, hot laps, rally stages and (with circuit packs) circuit races, all built from the existing modes. Clearing an offer
   pays its prize and earns reputation, which moves the career up a tier (harder fields, bigger prizes). Damage from career races
   stays on the car until Nina fixes it. Quick Play still pays, but only QP_K of the old amount. Save data: P.SV().gc
   Models: CON_B64 / BIZ_B64 / GARAGE_GLB_B64 (PEOPLE_B64 stand-in) come from project files (build.py, BIKES or PACKS builds); without them the hub
   still works on a plain floor ===== */
(function career(){
'use strict';
const P=window.PT8;if(!P||!P.ui||!P.CARS||typeof THREE==='undefined')return;
const $=id=>document.getElementById(id),BYID=P.BYID,CLS=P.CLS,fmtCr=P.fmtCr,fmtT=P.fmtT||(t=>t.toFixed(2));
const QP_K=.25;
const esc_=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const V3=(x,y,z)=>new THREE.Vector3(x||0,y||0,z||0);

/* ---------------- save ---------------- */
const G=()=>{const s=P.SV();if(!s.gc||typeof s.gc!=='object')s.gc={};const g=s.gc;if(!Array.isArray(g.offers))g.offers=[];if(!g.wear||typeof g.wear!=='object')g.wear={};
 g.rep=g.rep|0;g.seq=g.seq|0;g.wins=g.wins|0;g.runs=g.runs|0;g.earned=g.earned|0;return g};

/* ---------------- people ---------------- */
const ICO={chat:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M9.5 6.5h5v4h-5zM10 14h.01M12 14h.01M14 14h.01M10 16.5h.01M12 16.5h.01M14 16.5h.01"/>',fix:'<path d="M14.5 6.5a4 4 0 0 0-5.4 5.1L4 16.7 7.3 20l5.1-5.1a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',tune:'<path d="M5 4v6M5 14v6M12 4v3M12 11v9M19 4v9M19 17v3"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="15" r="2"/>',
 look:'<path d="M3.5 15a8.5 8.5 0 0 1 17 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.2"/>',tip:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
 bye:'<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h9"/>',race:'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',car:'<path d="M3 15l2-5.5C5.4 8.5 6.2 8 7.2 8h9.6c1 0 1.8.5 2.2 1.5L21 15v3h-3v-1.5H6V18H3z"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',swap:'<path d="M4 9h13l-3-3M20 15H7l3 3"/>',shop:'<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 13h6"/>',paint:'<path d="M4 4h13v5H4zM17 6.5h3V12h-8v3"/><path d="M11 15h2v6h-2z"/>',ok:'<path d="M5 12.5l4.5 4.5L19 7"/>',back:'<path d="M15 18l-6-6 6-6"/>'};
const svgI=k=>'<svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(ICO[k]||'')+'</svg>';
const RED={n:'Nina',role:'Mechanic & tuner',col:'#ffa64d'},VIN={n:'Vince',role:'Races & Marketplace',col:'#7fb6ff'};

/* ---------------- tiers ---------------- */
const TIERS=[
 {n:'ROOKIE',rep:0,cl:['C','B'],sk:.78,k:1.0},
 {n:'CLUB',rep:3,cl:['C','B'],sk:.83,k:1.25},
 {n:'NATIONAL',rep:7,cl:['B','A'],sk:.88,k:1.6},
 {n:'PRO',rep:12,cl:['A','B'],sk:.92,k:2.0},
 {n:'ELITE',rep:18,cl:['A','S'],sk:.96,k:2.6},
 {n:'LEGEND',rep:25,cl:['S','A'],sk:1.0,k:3.3}];
const tierOf=rep=>{let t=0;while(t<TIERS.length-1&&rep>=TIERS[t+1].rep)t++;return t};
P.gcTier=()=>TIERS[tierOf(G().rep)];

/* ---------------- tracks ---------------- */
const okT=(m,i)=>P.okTrack?P.okTrack(m,i):true;
const tarmac=()=>(P.quickTracks?P.quickTracks():[]).filter(i=>D[i]&&!D[i].gravel);
const stages=()=>D.map((d,i)=>okT('rally',i)&&d.gravel?i:-1).filter(i=>i>=0);
const circuits=()=>D.map((d,i)=>(P.TRK_TRACKS||[]).includes(i)&&okT('track',i)?i:-1).filter(i=>i>=0);

/* ---------------- offers ---------------- */
const rnd=a=>a[Math.random()*a.length|0];
const NAMES={race:['%s Club Race','%s Sprint','%s Trophy','%s Open','Sunday Cup: %s'],elim:['Last One Out: %s','%s Knockout','%s Survivor'],
 ta:['%s Hot Lap','%s Lap Record Bounty','%s Test Day'],rally:['%s Stage Run','%s Special Stage','%s Time Trial'],circuit:['%s Grand Prix','%s Endurance Sprint','%s Cup']};
/* the time (s) under which medal index k is reached on track t with car c (medalFor is monotonic in time, so bisect it) */
function medalTime(t,c,k){if(!P.medalFor||!c)return null;let lo=5,hi=3000;if(P.medalFor(t,c,lo)>k)return null;
 for(let i=0;i<40;i++){const m=(lo+hi)/2;if(P.medalFor(t,c,m)<=k)lo=m;else hi=m}return lo}
function makeOffer(type){const g=G(),ti=tierOf(g.rep),T=TIERS[ti];let o={id:'gc'+(++g.seq)+'_'+Date.now().toString(36),type,tier:ti};const pay=P.racePay0||P.racePay;
 if(type==='race'||type==='elim'){const L=tarmac();if(!L.length)return null;o.track=rnd(L);o.laps=type==='elim'?0:Math.min(5,2+(ti>>1)+(Math.random()<.4?1:0));o.n=Math.min(7,3+ti+(Math.random()*2|0));
  o.prize=Math.round((type==='elim'?.6:1)*pay(type==='elim'?4:o.laps,P.ui.trLen?P.ui.trLen(o.track):4000)*T.k*.8/50)*50}
 else if(type==='circuit'){const L=circuits();if(!L.length)return null;o.track=rnd(L);o.laps=2+(ti>2?1:0);o.n=Math.min(7,4+ti);o.prize=Math.round(pay(o.laps,5000)*T.k*.9/50)*50}
 else if(type==='ta'){const L=tarmac();if(!L.length)return null;o.track=rnd(L);o.laps=3;o.medal=Math.max(0,3-Math.round(ti*.7));o.prize=Math.round(2600*T.k/50)*50}
 else if(type==='rally'){const L=stages();if(!L.length)return null;o.track=rnd(L);o.laps=1;o.medal=Math.max(0,3-Math.round(ti*.7));o.prize=Math.round(3200*T.k/50)*50}
 o.name=rnd(NAMES[type]).replace('%s',D[o.track].name);return o}
function fillOffers(){const g=G();g.offers=g.offers.filter(o=>o&&D[o.track]);let guard=0;
 while(g.offers.length<3&&guard++<30){const have=g.offers.map(o=>o.type);
  let pool=['race','race','elim','ta','rally'];if(circuits().length)pool.push('circuit','circuit');
  /* keep at least one race and one solo run on the board */
  if(!have.some(t=>t==='race'||t==='circuit'))pool=circuits().length?['race','circuit']:['race'];else if(!have.some(t=>t==='ta'||t==='rally'))pool=['ta','rally'];
  const o=makeOffer(rnd(pool));if(o&&!g.offers.some(x=>x.track===o.track&&x.type===o.type))g.offers.push(o)}
 P.save()}

const TYPE_L={race:'RACE',elim:'ELIMINATION',ta:'HOT LAP',rally:'RALLY STAGE',circuit:'CIRCUIT RACE'};
const curCar=()=>{const s=P.SV().sel[0]||{id:'merc',alt:0};const car=BYID[s.id]||BYID.merc;return{id:car.id,alt:s.alt|0,car}};
const targetOf=o=>(o.type==='ta'||o.type==='rally')?medalTime(o.track,curCar().car,o.medal):null;
const MEDAL_N=['platinum','gold','silver','bronze'];
const firstPay=o=>(o.type==='race'||o.type==='elim'||o.type==='circuit')?Math.round(o.prize*1.5*1.08):Math.round(o.prize*1.08);
function goalTxt(o){if(o.type==='race'||o.type==='circuit')return 'Finish in the top 3';if(o.type==='elim')return 'Be one of the last 3 cars';
 const t=targetOf(o);return t?('Beat '+fmtT(t*(o.type==='rally'?o.laps:1))+(o.type==='ta'?' on your best lap':'')):'Set a '+MEDAL_N[o.medal]+' time'}
function detailTxt(o){const d=D[o.track],bits=[d.name];if(o.type==='race'||o.type==='circuit')bits.push(o.laps+' laps',(o.n+1)+' cars');else if(o.type==='elim')bits.push((o.n+1)+' cars');else if(o.type==='ta')bits.push('3 laps, solo');else bits.push('Point to point');return bits.join(' · ')}

/* ---------------- what they say ---------------- */
const wearOf=id=>Math.max(0,Math.min(1,+(G().wear[id]||0)));
const repairCost=id=>{const w=wearOf(id),c=BYID[id];return w<.02?0:Math.max(150,Math.round(w*(c&&c.price?c.price:30000)*.12/50)*50)};
const pctOK=id=>Math.round((1-wearOf(id))*100);
function pitch(o){const d=D[o.track].name;
 if(o.type==='race')return rnd([`A club at ${d} needs one more car on the grid. ${o.n+1} cars, ${o.laps} laps. Get on the podium and they pay.`,`${d}, ${o.laps} laps against ${o.n} locals. They think they own that place.`,`The ${o.name} is short of drivers. Top three and the money is yours.`]);
 if(o.type==='circuit')return rnd([`A proper circuit: ${d}. Real kerbs, faster cars. A podium pays well.`,`They're running the ${o.name}. It's a step up, but I think you're ready.`]);
 if(o.type==='elim')return rnd([`Elimination at ${d}. The last car each lap goes home. Just don't be last.`,`${o.n+1} cars start and they drop out one by one. Make the final three.`]);
 if(o.type==='ta')return rnd([`A tuning shop wants a lap time at ${d} for their adverts. Beat their target and they pay.`,`No traffic, no rivals. Just you, ${d} and a stopwatch.`]);
 return rnd([`A rally club is paying for a quick run on ${d}. It's gravel, so keep it tidy.`,`${d} stage. Beat the club's time and the prize is yours.`])}
/* Nina swears now and then; Vince keeps it cool and short */
function moneyLine(){const sv=P.SV(),cr=sv.cr,own=sv.owned||{},cur=curCar().car;
 const up=P.CARS.filter(c=>!(own[c.id]>0)&&!c.rallyOnly&&c.price&&CLS.indexOf(c.cls)>=CLS.indexOf(cur.cls)).sort((a,b)=>a.price-b.price);
 const can=up.filter(c=>c.price<=cr),next=up.find(c=>c.price>cr);
 if(can.length){const c=can[can.length-1];return `You've got ${fmtCr(cr)}. The ${c.name}'s in reach, if you care.`}
 if(next)return `${fmtCr(next.price-cr)} more and the ${next.name} is yours. Or check the Marketplace.`;return `Your garage is fine. Keep winning.`}
const TIPS=['Brake in a straight line, then turn. The car can only do one damn thing at a time.','Tyres and gearing make the biggest difference. Pay me and I\'ll sort them.',
 'A rally stage is one run. A small mistake costs less than a big crash.','In an elimination you only need to beat one car each lap. Stay out of the shit.',
 'If you keep hitting the wall, the car gets slower. I can fix it, but it costs.','On hot laps, a clean lap beats a fast messy one. Every time.'];
/* the name the player picked when the game asked them; both of them use it now and then */
const pName=()=>(P.SV().name||'').trim();
const withName=(t,p)=>{const n=pName();if(!n||t.includes(n)||Math.random()>(p==null?.45:p))return t;return /^[A-Z][^.!?]*[.!?]$/.test(t)&&t.length<40?t.replace(/([.!?])$/,`, ${n}$1`):`${n}. ${t}`};
function vinLine(state){const g=G(),r=state&&state.res,nm=pName();
 if(r){const fix=wearOf(curCar().id)>.2?' Might want Nina to look at the car.':'';
  if(r.ok){const p=r.paid?` ${fmtCr(r.paid)}, as promised.`:'';return rnd([`Nice. ${r.what}.${p}`,`${r.what}. Not bad.${p}`,`Knew you had it. ${r.what}.${p}`])+(r.tierUp?` People are talking. You're ${TIERS[r.tierUp].n} level now.`:'')+fix}
  return rnd([`${r.what}. Happens. Offer's still there.`,`${r.what}. Eh. Go again.`,`${r.what}. Maybe get Nina to tune it.`])+fix}
 if(!g.met)return `${nm?nm+', right? ':''}I'm Vince. I get you races, and I know where the cheap cars are. Nina does the wrenching.`;
 return Math.random()<.4?moneyLine():withName(rnd([`Hey.`,`What's up.`,`Yeah?`,`Oh, it's you. Good.`,`Got a few things going on.`].concat(nm?[`${nm}. Good timing.`,`There's ${nm}. What do you need?`]:[])),.5)}
function redLine(){const c=curCar(),w=wearOf(c.id),nm=pName();if(w>.35)return rnd([`What the hell did you do to my car? It's at ${pctOK(c.id)}%.`,`Jesus. The ${c.car.name} is at ${pctOK(c.id)}%. Let me fix it before you race again.`]);
 if(w>.02)return `A few scratches on the ${c.car.name}. It's at ${pctOK(c.id)}%.`;return withName(rnd([`Hey. The ${c.car.name} is ready to go.`,`Need something? I'm here.`,`Car's clean. Want me to tune it?`,`Hell of a car, this one. What do you need?`].concat(nm?[`${nm}! The ${c.car.name} is ready to go.`,`Hey ${nm}. Need something?`]:[])),.35)}
const GOT=['Got the %s for you!','Got the %s for you! Keys are in it.','Got the %s for you! Try not to scratch this one.','Got the %s for you! Damn, I love this one.'];
const TUNE_L={gear:[`Shorter gears. It'll jump off the line, but top speed takes a hit.`,`Longer gears. Faster on the straights, lazy out of the corners.`],
 tyre:[`Softer tyres. Loads of grip, but they wear quicker.`,`Harder compound. Lasts forever, slides a bit.`],
 susp:[`Softer springs. Better over bumps and gravel.`,`Stiffer. Sharp on tarmac. Your back will hate it.`],
 aero:[`Less wing. Slippery. Don't be a hero in the fast bends.`,`More wing. Sticks in corners, slower on the straights.`],
 brake:[`Softer brakes. Easier to feel.`,`Stronger brakes. Try not to lock them.`]};

/* ---------------- Vince's Marketplace: older cars, cheap, and they need work ---------------- */
const BADPAL=[['#5cff1a'],['#ff2fa8'],['#8a2be2'],['#ff6a00'],['#00e5c8']];
function mktFill(){const g=G();if(!Array.isArray(g.mkt))g.mkt=[];const own=P.SV().owned||{},bad=new Set([...(P.RALLY_CARS||[]),...(P.TRACK_CARS||[])]);
 g.mkt=g.mkt.filter(l=>BYID[l.id]&&!(own[l.id]&1));
 const pool=P.CARS.filter(c=>c.price&&c.price<150000&&!c.rallyOnly&&!bad.has(c.id)&&!(own[c.id]&1)&&!g.mkt.some(l=>l.id===c.id));
 while(g.mkt.length<4&&pool.length){const c=pool.splice(Math.random()*pool.length|0,1)[0],b=Math.random()<.4,pl=rnd(BADPAL);
  g.mkt.push({id:c.id,price:Math.max(1500,Math.round(c.price*(.36+Math.random()*.2)/50)*50),cond:Math.round((.42+Math.random()*.38)*100)/100,yr:1988+(Math.random()*24|0),km:60000+(Math.random()*260000|0),
   bad:b,L:b?pl[0]:null})}
 P.save()}
/* a bad paintjob: the body paint swapped for a loud colour (saved per car in gc.paint until Nina repaints it) */
const paintOf=id=>(G().paint||{})[id]||null;
function setPaint(id,c){const g=G();if(!g.paint)g.paint={};if(c)g.paint[id]=c;else delete g.paint[id];P.save()}
/* the look of a used car, in the paint shader itself so everything sits flush with the body: a bad respray (a loud colour, a second
   mismatched colour on whole panels, grey primer patches, runs, overspray grain, the old paint showing where it flaked) and wear (grime
   towards the sills, clusters of fine scratches down to bare metal, stone chips, rust spots low down on tired cars, sun-faded tops).
   Positions are the mesh's own, scaled to roughly metres, so the pattern stays put on the car in the garage and in races */
const GL_NOISE=`float gcH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float gcN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(gcH(i),gcH(i+vec3(1,0,0)),f.x),mix(gcH(i+vec3(0,1,0)),gcH(i+vec3(1,1,0)),f.x),f.y),mix(mix(gcH(i+vec3(0,0,1)),gcH(i+vec3(1,0,1)),f.x),mix(gcH(i+vec3(0,1,1)),gcH(i+vec3(1,1,1)),f.x),f.y),f.z);}
float gcF(vec3 p){return .5*gcN(p)+.25*gcN(p*2.03+1.7)+.125*gcN(p*4.01+3.1)+.125*gcN(p*7.9+5.3);}`;
const GL_LOOK=`{vec3 c=diffuseColor.rgb;float l=dot(c,vec3(.3,.59,.11)),pm=smoothstep(.006,.025,l);l=sqrt(l);vec3 p=(vCP-uMin)/uSz*4.6+uSeed;float hg=(vCP.y-uMin.y)/uSz,bot=1.-smoothstep(.03,.15,hg);
 if(uBadOn>.5){vec3 a=uBad*(.32+.4*l);a=mix(a,uBad2*(.32+.4*l),smoothstep(.5,.53,gcF(p*.55)));a=mix(a,vec3(.44,.45,.44)*(.5+.5*l),smoothstep(.6,.63,gcF(p*1.3+3.)));
  a*=1.-.4*smoothstep(.66,.74,gcF(vec3(p.x*10.,p.y*.7,p.z*10.)));a*=.84+.32*gcN(p*31.);a=mix(a,c,smoothstep(.66,.68,gcF(p*3.6+11.)));c=mix(c,a,pm*.96);}
 if(uWear>.01){float w=uWear;c=mix(c,c*vec3(.5,.46,.4),clamp(w*(.2+.7*bot)*gcF(p*2.2+5.)*1.5,0.,.85));
  float sc=0.;for(int i=0;i<4;i++){float fi=float(i);vec3 d=normalize(vec3(cos(fi*2.1+uSeed),.4*sin(fi*1.7),sin(fi*2.1+uSeed)));float u=dot(p,d)*(9.+fi*4.)+gcF(p*1.4+fi)*2.5;
   float ln=1.-smoothstep(0.,.05,abs(fract(u)-.5));float m=smoothstep(1.-w*.5,1.-w*.5+.05,gcF(p*vec3(1.6,3.,1.6)+fi*13.));sc=max(sc,ln*m);}
  c=mix(c,vec3(.74,.75,.77),sc*pm*.9);c=mix(c,vec3(.86,.86,.83),smoothstep(1.-w*.1,1.-w*.1+.015,gcN(p*26.))*pm*.85);
  c=mix(c,vec3(.33,.15,.06),smoothstep(.58,.72,gcF(p*2.8+9.))*bot*smoothstep(.3,.75,w)*pm);
  c=mix(c,vec3(dot(c,vec3(.333)))*1.12,smoothstep(.16,.28,hg)*w*.4*pm);}
 diffuseColor.rgb=c;}`;
const hashId=s_=>{let h=7;for(const ch of String(s_))h=(h*31+ch.charCodeAt(0))>>>0;return h};
function carLook(root,id,bad,wear){if(!root||(!bad&&!(wear>.03)))return;const h=hashId(id),col=new THREE.Color(bad||'#000'),pal=BADPAL.map(x=>x[0]).filter(x=>x!==bad),col2=new THREE.Color(pal[h%pal.length]||'#888');
 root.traverse(m=>{if(!m.isMesh||Array.isArray(m.material)||!m.material||(m.name!=='paint'&&m.name!=='body'))return;const ge=m.geometry;if(!ge.boundingBox)ge.computeBoundingBox();const bb=ge.boundingBox,sz=bb.getSize(V3());
  const mm=m.material.clone(),prev=mm.onBeforeCompile,U={uBad:{value:col},uBad2:{value:col2},uBadOn:{value:bad?1:0},uWear:{value:Math.min(1,wear||0)},uMin:{value:bb.min.clone()},uSz:{value:Math.max(sz.x,sz.y,sz.z,1e-3)},uSeed:{value:(h%997)/37}};
  mm.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);Object.assign(sh.uniforms,U);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=position;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCP;uniform vec3 uBad,uBad2,uMin;uniform float uBadOn,uWear,uSz,uSeed;\n'+GL_NOISE).replace('#include <color_fragment>','#include <color_fragment>\n'+GL_LOOK)};
  mm.customProgramCacheKey=()=>'gcLook'+(prev?1:0);if(bad){mm.roughness=.95;mm.metalness=0}else if('roughness' in mm)mm.roughness=Math.max(mm.roughness||0,.45+.45*wear);m.material=mm})}
const badPaint=(root,c)=>carLook(root,'x',c,0);
const mktPitch=l=>{const c=BYID[l.id];return l.bad?rnd([`Paint's... a choice. Price reflects it.`,`Yeah, I know. The paint. It was like that when I got it.`]):rnd([`${c.name}. ${Math.round(l.km/1000)}k km. It's fine.`,`Previous owner was a florist. Make of that what you will.`,`It's a ${c.name}. Drives. Mostly.`,`Cheap because it's tired. Nina can sort it.`,`${fmtCr(l.price)}. That's the price. I don't haggle.`])};

/* ---------------- the garage scene ---------------- */
const GS={ok:false,busy:false,sc:null,cam:null,cp:V3(),cl:V3(),tp:V3(),tl:V3(),t:0,car:null,carKey:'',red:null,vin:null,hov:null,cur:null,fk:0,clutter:null,ol:[]};
/* positions in Hakan's garage (metres): the car on the chequered mat, Nina at its right, Vince by the left-hand bench; the overview camera is up in the
   door-side corner, looking down across the room */
const SPOT={car:V3(-1.9,0,-.9),carRy:.25,red:V3(0,0,-1.95),vin:V3(-4.1,0,-1.7),over:{p:V3(1.1,3.2,3.0),l:V3(-2.4,.3,-2.0)}};
const b64u=s=>{const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u.buffer};
const parseGLB=b64=>new Promise(res=>{if(!b64||!THREE.GLTFLoader){res(null);return}const cib=window.createImageBitmap;window.createImageBitmap=undefined;
 try{new THREE.GLTFLoader().parse(b64u(b64),'',g=>res(g),e=>{console.warn('career glb',e);res(null)})}catch(e){console.warn('career glb',e);res(null)}finally{window.createImageBitmap=cib}});
const yawTo=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a)),lerpA=(a,b,k)=>a+wrapA(b-a)*k;
function blob(r,op){const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,opacity:op==null?1:op}));m.rotation.x=-Math.PI/2;m.position.y=.012;m.renderOrder=2;m.userData.noOL=1;return m}
/* Hakan's garage, baked offline (tools/garage/bake.py) to flat colours per face: a json header, then per group uint16 positions and one rgb per face.
   'shell' is the room and the big furniture, 'clutter' the small stuff that is hidden while you talk to someone */
function garMesh(b64){const buf=b64u(b64),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl)));let o=4+hl;const out={},mn=h.min,mx=h.max;
 for(const g of h.g){const nv=g.n*3,q=new Uint16Array(buf.slice(o,o+nv*6));o+=nv*6;const c=new Uint8Array(buf.slice(o,o+g.n*3));o+=g.n*3;
  const pos=new Float32Array(nv*3),col=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const a=i%3;pos[i]=mn[a]+q[i]/65535*(mx[a]-mn[a])}
  for(let f=0;f<g.n;f++)for(let a=0;a<3;a++){const v=Math.pow(c[f*3+a]/255,2.2);col[f*9+a]=col[f*9+3+a]=col[f*9+6+a]=v}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();geo.computeBoundingSphere();
  out[g.k]=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.86,metalness:0,side:THREE.DoubleSide}))}return out}
/* arms hanging at the sides: the pack poses some people mid-gesture (Nina had both hands up). Each raised upper arm, then its forearm, is
   swung to point down; a prop near that hand (her hammer) is moved onto the hand bone first so she keeps holding it */
function swingTo(a,b,dir){const pa=a.getWorldPosition(V3()),cur=b.getWorldPosition(V3()).sub(pa).normalize(),q=new THREE.Quaternion().setFromUnitVectors(cur,dir.normalize());
 a.parent.updateWorldMatrix(true,false);const qp=a.parent.getWorldQuaternion(new THREE.Quaternion());a.quaternion.premultiply(qp.clone().invert().multiply(q).multiply(qp));a.updateMatrixWorld(true)}
function lowerArms(B,w,props,all){w.updateMatrixWorld(true);const ry=w.rotation.y,fw=V3(Math.sin(ry),0,Math.cos(ry)),chest=B.spine003||B.spine002;if(!chest)return;const cp=chest.getWorldPosition(V3());
 for(const s of ['L','R']){const ua=B['upper_arm'+s],fa=B['forearm'+s],ha=B['hand'+s];if(!ua||!fa||!ha)continue;const hp=ha.getWorldPosition(V3());if(!all&&hp.y<cp.y-.12)continue;
  for(const pm of props){const b=pm.skeleton&&pm.skeleton.bones[0];if(b&&b.getWorldPosition(V3()).distanceTo(hp)<.4)ha.attach(b)}
  const out=ua.getWorldPosition(V3()).sub(cp);out.y=0;out.normalize();
  swingTo(ua,fa,V3(0,-1,0).addScaledVector(out,.2).addScaledVector(fw,.03));swingTo(fa,ha,V3(0,-1,0).addScaledVector(out,.08).addScaledVector(fw,.3))}
 for(const k in B)B[k].userData.q0=B[k].quaternion.clone()}
/* bones by role for the idle animation (names lose their dots and gain _<n> in the loader) */
function rig(bones){const R={};for(const b of bones){const r=b.name.replace(/_\d+$/,'').replace(/\./g,'');if(!R[r])R[r]=b;b.userData.q0=b.quaternion.clone()}return R}
const buildScene=()=>GS.bp||(GS.bp=buildScene_());
async function buildScene_(){GS.busy=true;const pr=f=>{try{GS.onProg&&GS.onProg(f)}catch(e){}};
 try{const sc=new THREE.Scene();sc.background=new THREE.Color(0x10141a);sc.fog=new THREE.Fog(0x10141a,40,80);const cam=new THREE.PerspectiveCamera(56,16/9,.05,120);GS.sc=sc;GS.cam=cam;
  sc.add(new THREE.HemisphereLight(0xf4f1ea,0x2c313a,.55));
  /* the strip lights in the ceiling: soft pools of cool white under each fitting, and a little warm bounce off the floor */
  /* two lights, not five: every light costs every pixel of every mesh, and the five plus the floor bounce made the garage slow on laptops */
  for(const [x,z] of [[-1.9,-3.4],[-1.9,0.6]]){const pl=new THREE.PointLight(0xfff3e2,1.0,8,1.6);pl.position.set(x,2.55,z);sc.add(pl)}
  const ks=(x,y,z,tx,tz,i,ang,c)=>{const l=new THREE.SpotLight(c||0xe6efff,i,26,ang,.7,1.2);l.position.set(x,y,z);l.target.position.set(tx,0,tz);sc.add(l,l.target);return l};
  /* real shadows (the dark blobs under everyone looked like stains): the ceiling light over the car throws soft, nearly straight-down
     shadows of the car and both people onto the floor and benches. The room itself only receives, it never casts, so the ceiling
     above the light can't black everything out */
  {const l=ks(SPOT.car.x+.3,5.2,SPOT.car.z+.2,SPOT.car.x,SPOT.car.z-.4,1.6,.78);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.0004;l.shadow.normalBias=.02;l.shadow.radius=3;l.shadow.camera.near=1;l.shadow.camera.far=9;GS.shL=l}
  const d=new THREE.DirectionalLight(0xf1f5ff,.32);d.position.set(4,9,7);sc.add(d);const rim=new THREE.DirectionalLight(0x8fb8ff,.5);rim.position.set(-3,4,-9);sc.add(rim);
  let gm=null;try{if(window.GAR2_B64)gm=garMesh(window.GAR2_B64)}catch(e){console.warn('career garage',e)}
  if(gm){for(const k in gm){gm[k].receiveShadow=true;gm[k].castShadow=false;sc.add(gm[k])}GS.clutter=gm.clutter||null;GS.gar=gm;try{navBuild(gm)}catch(e){console.warn('career map',e)}}
  else{const f=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x8d9097,roughness:.9}));f.rotation.x=-Math.PI/2;sc.add(f);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(40,10),new THREE.MeshStandardMaterial({color:0xc9bba8,roughness:1}));w.position.set(0,5,-6.2);sc.add(w)}
  try{if(window.GPROP_B64){const pm=garMesh(window.GPROP_B64);if(pm.laptop){pm.laptop.position.copy(LAPTOP.p);pm.laptop.rotation.y=LAPTOP.ry;pm.laptop.scale.setScalar(1.35);pm.laptop.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});sc.add(pm.laptop);GS.laptop=pm.laptop}}}catch(e){console.warn('career props',e)}
  pr(.35);
  /* Studio Ochi people (Hakan's packs): one character out of a pack, picked by its place along x. Skins with only a few bones are props
     (shovel, hammer): they stay when they sit close to the chosen person */
  const ochi=async(b64,k,spot,ry0,hTo)=>{const gl=b64?await parseGLB(b64):null;if(!gl)return null;const o=gl.scene;o.updateMatrixWorld(true);const sk=new Map(),props_=[];
   o.traverse(m=>{if(m.isSkinnedMesh){const bs=m.skeleton.bones;if(bs.length<8){props_.push(m);return}const key=bs[0];if(!sk.has(key))sk.set(key,{ms:[],bones:bs});sk.get(key).ms.push(m)}});
   const L=[...sk.values()].map(c=>{let x=0,y0=1e9,yh=-1e9;for(const b of c.bones){const p=b.getWorldPosition(V3());x+=p.x;y0=Math.min(y0,p.y);if(/head/i.test(b.name)&&!/end|top/i.test(b.name))yh=Math.max(yh,p.y)}return Object.assign(c,{x:x/c.bones.length,y0,yh})}).sort((a,b)=>a.x-b.x);
   const pick=L[Math.min(k,L.length-1)];if(!pick)return null;const keep=new Set(pick.bones),hip=pick.bones[0].getWorldPosition(V3());
   const near=m=>{const p=m.skeleton.bones[0].getWorldPosition(V3());let best=1e9,bx=null;for(const c of L){const d=Math.abs(p.x-c.x);if(d<best){best=d;bx=c}}return bx===pick};
   o.traverse(m=>{if(!m.isMesh)return;if(m.isSkinnedMesh){m.visible=props_.includes(m)?near(m):pick.ms.includes(m)}else{let a=m.parent,ok=false;while(a){if(keep.has(a)){ok=true;break}a=a.parent}m.visible=ok}if(m.visible){m.frustumCulled=false;if(m.material)m.material.envMapIntensity=.3}});
   const inner=new THREE.Group(),w=new THREE.Group();inner.add(o);o.position.set(-hip.x,-pick.y0,-hip.z);w.add(inner);
   const hy0=(pick.yh>-1e8?pick.yh:1.5)-pick.y0,ks_=hTo/Math.max(.3,hy0);inner.scale.setScalar(ks_);w.position.copy(spot);w.rotation.y=ry0;w.traverse(m=>{if(m.isMesh){m.castShadow=true;m.frustumCulled=false}});sc.add(w);w.add(blob(.5,.5));
   const rg=rig(pick.bones);lowerArms(rg,w,props_.filter(m=>m.visible),k===3);const pe={g:w,h:hTo+.1,hy:hTo+.12,rig:rg,ry0,hand:''};return pe};
  /* Nina: the girl with the orange helmet and the hammer (Construction People, far left), half turned to the car she's working on.
     Vince: the man in the dark suit (Business People, 4th), by the bench, looking at his hands */
  const camY=s=>yawTo(s,SPOT.over.p);
  try{GS.red=await ochi(window.CON_B64,0,SPOT.red,lerpA(yawTo(SPOT.red,SPOT.car),camY(SPOT.red),.45),1.66)}catch(e){console.warn('career nina',e)}
  pr(.65);try{GS.vin=await ochi(window.BIZ_B64,3,SPOT.vin,camY(SPOT.vin)+.25,1.76)}catch(e){console.warn('career vince',e)}
  if(GS.red)GS.red.foc=()=>V3(SPOT.car.x+.6,.75,SPOT.car.z+.3);if(GS.vin)GS.vin.foc=()=>V3(-.6,1.55,2.6);
  GS.cp.copy(SPOT.over.p);GS.cl.copy(SPOT.over.l);GS.tp.copy(SPOT.over.p);GS.tl.copy(SPOT.over.l);GS.ok=true;setCar(true)}
 catch(e){console.warn('career scene',e)}GS.busy=false}
/* the current car, built like cinema.js does (scaled to its real length, wheels on the floor), in its saved paint */
function setCar(force){if(!GS.ok)return;const c=curCar(),L=paintOf(c.id),key=c.id+':'+c.alt+':'+JSON.stringify(L||0)+':'+Math.round(wearOf(c.id)*20);if(!force&&GS.carKey===key&&GS.car)return;
 if(GS.car){GS.sc.remove(GS.car);GS.car=null}GS.carKey=key;const idx=P.modelOf(c.id,c.alt),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src){GS.carKey='';return}
 const model=src.clone(true),g=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);g.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(V3()),ct=bb.getCenter(V3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);g.scale.setScalar(k);g.rotation.y=(sz.x>sz.z?Math.PI/2:0)+Math.PI;
 const o=new THREE.Group();o.add(g);o.position.copy(SPOT.car);o.rotation.y=SPOT.carRy;o.add(blob(2.6,.7));o.traverse(m=>{if(m.isMesh&&!m.userData.noOL){m.castShadow=true;const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>{if(x&&x.isMeshStandardMaterial)x.envMapIntensity=.55})}});
 carLook(model,c.id,L,wearOf(c.id));
 GS.sc.add(o);GS.car=o;o.updateMatrixWorld(true);GS.carBox=new THREE.Box3().setFromObject(o);navGrow()}
/* portraits for the text box: each head rendered once, front on */
function portraits(){if(GS.pics)return;GS.pics=1;const rt=new THREE.WebGLRenderTarget(192,192);rt.texture.encoding=THREE.sRGBEncoding;const pc=new THREE.PerspectiveCamera(26,1,.05,20),fog=GS.sc.fog;GS.sc.fog=null;const hid=[GS.car,...Object.values(GS.gar||{}),GS.red&&GS.red.g,GS.vin&&GS.vin.g].filter(Boolean),vis0=hid.map(o=>o.visible);
 for(const k of ['red','vin']){const pe=GS[k];if(!pe||!pe.g)continue;try{hid.forEach(o=>o.visible=o===pe.g);const g=pe.g,r0=g.rotation.y,ry=yawTo(g.position,SPOT.over.p);g.rotation.y=ry;g.updateMatrixWorld(true);
  const hb=pe.rig&&(pe.rig.spine005||pe.rig.spine004),h=hb?hb.getWorldPosition(V3()):headOf(k);h.y+=hb?.04:-.06;pc.position.set(h.x+Math.sin(ry)*.95,h.y+.05,h.z+Math.cos(ry)*.95);pc.lookAt(h);
  R.setRenderTarget(rt);const bg=GS.sc.background;GS.sc.background=null;R.getClearColor(CC);const ca=R.getClearAlpha();R.setClearColor(0x22262c,1);R.clear();R.render(GS.sc,pc);R.setClearColor(CC,ca);GS.sc.background=bg;const px=new Uint8Array(192*192*4);R.readRenderTargetPixels(rt,0,0,192,192,px);R.setRenderTarget(null);
  const cv=document.createElement('canvas');cv.width=cv.height=192;const cx=cv.getContext('2d'),im=cx.createImageData(192,192);for(let y=0;y<192;y++)im.data.set(px.subarray((191-y)*768,(192-y)*768),y*768);cx.putImageData(im,0,0);
  pe.pic=cv.toDataURL();g.rotation.y=r0}catch(e){console.warn('career portrait',e)}}
 hid.forEach((o,i)=>o.visible=vis0[i]);GS.sc.fog=fog;rt.dispose();const im=sec.querySelector('#gcBox .pic img');if(im&&UI.who&&GS[UI.who]&&GS[UI.who].pic)im.src=GS[UI.who].pic}
/* talking: the room is drawn at a quarter of the size and blurred (cheap, and it keeps the eye on the person); the person, or the car, goes on top sharp */
const BL={a:null,b:null,q:null};
function blInit(){const mk=fs=>new THREE.ShaderMaterial({uniforms:{tD:{value:null},dir:{value:new THREE.Vector2()},uA:{value:1}},depthTest:false,depthWrite:false,vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:fs});
 const blur=mk('uniform sampler2D tD;uniform vec2 dir;varying vec2 vU;void main(){vec4 c=texture2D(tD,vU)*.227;c+=(texture2D(tD,vU+dir*1.385)+texture2D(tD,vU-dir*1.385))*.316;c+=(texture2D(tD,vU+dir*3.23)+texture2D(tD,vU-dir*3.23))*.0702;gl_FragColor=c;}');
 const copy=mk('uniform sampler2D tD;uniform float uA;varying vec2 vU;void main(){vec4 c=texture2D(tD,vU);gl_FragColor=vec4(c.rgb*uA,1.);}');
 const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blur);q.frustumCulled=false;const sc=new THREE.Scene();sc.add(q);BL.q={sc,q,blur,copy,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1)}}
function blPass(mat,src,dst){BL.q.q.material=mat;mat.uniforms.tD.value=src.texture;R.setRenderTarget(dst);R.render(BL.q.sc,BL.q.cam)}
const focusSet=()=>onCar()?[GS.car,UI.view==='tune'&&GS.red&&GS.red.g].filter(Boolean):UI.who&&GS[UI.who]&&GS[UI.who].g?[GS[UI.who].g]:[];
function renderGarage(){const k=GS.fk,F=focusSet();if(k<.02){R.render(GS.sc,GS.cam);return}
 if(!BL.q)blInit();const W=R.domElement.width,H=R.domElement.height,w=Math.max(64,W>>2),h=Math.max(36,H>>2);
 if(!BL.a||BL.a.width!==w||BL.a.height!==h){for(const r of [BL.a,BL.b])if(r)r.dispose();const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false};BL.a=new THREE.WebGLRenderTarget(w,h,o);BL.b=new THREE.WebGLRenderTarget(w,h,o);BL.a.texture.encoding=BL.b.texture.encoding=THREE.sRGBEncoding}
 F.forEach(o=>o.visible=false);R.setRenderTarget(BL.a);R.clear();R.render(GS.sc,GS.cam);F.forEach(o=>o.visible=true);
 const u=BL.q.blur.uniforms;for(let i=0;i<3;i++){const r=k*(1+i*1.2);u.dir.value.set(r/w,0);blPass(BL.q.blur,BL.a,BL.b);u.dir.value.set(0,r/h);blPass(BL.q.blur,BL.b,BL.a)}
 R.setRenderTarget(null);const cp=BL.q.copy;cp.uniforms.uA.value=1-k*.3;cp.uniforms.tD.value=BL.a.texture;BL.q.q.material=cp;R.render(BL.q.sc,BL.q.cam);if(!F.length)return;
 const all=[...Object.values(GS.gar||{}),GS.car,GS.laptop,GS.red&&GS.red.g,GS.vin&&GS.vin.g].filter(Boolean),vis=all.map(o=>o.visible),bg=GS.sc.background;
 all.forEach(o=>o.visible=F.includes(o));GS.sc.background=null;const ac=R.autoClear;R.autoClear=false;R.clearDepth();R.render(GS.sc,GS.cam);R.autoClear=ac;GS.sc.background=bg;all.forEach((o,i)=>o.visible=vis[i])}
/* the hover outline: whatever is hovered is drawn alone into a mask, then one full-screen pass draws a soft white rim around it */
const OL={rt:null,q:null,a:0,k:null},CC=new THREE.Color();
function olInit(){const mat=new THREE.ShaderMaterial({uniforms:{tM:{value:null},px:{value:new THREE.Vector2()},uA:{value:0}},transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:'uniform sampler2D tM;uniform vec2 px;uniform float uA;varying vec2 vU;void main(){float c=texture2D(tM,vU).a,m=0.;for(int i=0;i<16;i++){float a=float(i)*.3927;vec2 d=vec2(cos(a),sin(a))*px;m=max(m,texture2D(tM,vU+d*3.5).a*.8);m=max(m,texture2D(tM,vU+d*1.8).a);}gl_FragColor=vec4(1.,1.,1.,clamp(m-c,0.,1.)*uA);}'});
 const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);q.frustumCulled=false;const sc=new THREE.Scene();sc.add(q);OL.q={sc,mat,cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1)}}
function olRender(dt){const k=!UI.who&&!onCar()?GS.hov:null;if(k&&k!==OL.k){OL.k=k;OL.a=0}OL.a+=((k?.85:0)-OL.a)*Math.min(1,dt*12);if(OL.a<.01||!OL.k)return;
 const root=OL.k==='car'?GS.car:OL.k==='pc'?GS.laptop:GS[OL.k]&&GS[OL.k].g;if(!root)return;const L=[];root.traverse(m=>{if(m.isMesh&&m.visible&&!m.userData.noOL)L.push(m)});if(!L.length)return;
 if(!OL.q)olInit();const W=R.domElement.width,H=R.domElement.height,dpr=Math.max(1,W/Math.max(1,innerWidth));if(!OL.rt||OL.rt.width!==W||OL.rt.height!==H){if(OL.rt)OL.rt.dispose();OL.rt=new THREE.WebGLRenderTarget(W,H)}
 for(const m of L)m.layers.enable(5);GS.cam.layers.set(5);const bg=GS.sc.background;GS.sc.background=null;R.getClearColor(CC);const ca=R.getClearAlpha();
 R.setRenderTarget(OL.rt);R.setClearColor(0,0);R.clear();R.render(GS.sc,GS.cam);R.setRenderTarget(null);R.setClearColor(CC,ca);GS.sc.background=bg;GS.cam.layers.set(0);for(const m of L)m.layers.disable(5);
 const u=OL.q.mat.uniforms;u.tM.value=OL.rt.texture;u.px.value.set(dpr/W,dpr/H);u.uA.value=OL.a;const ac=R.autoClear;R.autoClear=false;R.render(OL.q.sc,OL.q.cam);R.autoClear=ac}
/* camera targets */
function headOf(who){const p=GS[who],base=p&&p.g?p.g.position:who==='red'?SPOT.red:SPOT.vin;return V3(base.x,p&&p.hy?p.hy:1.62,base.z)}
const onCar=()=>UI.view==='cars'||UI.view==='tune';
/* close up at eye level: the person on the left, the choices on the right, the text box under them. People can be anywhere in the room now,
   so the camera tries directions around the one facing the room until the spot is clear of walls and furniture and the car isn't in the way */
function camOk(p,h){if(!NAV.cam)return true;const i=nIdx(p.x,p.z);if(i<0||NAV.cam[i])return false;const d=Math.hypot(h.x-p.x,h.z-p.z),n=Math.ceil(d/.05),o=GS.obb;
 for(let s=0;s<=n;s++){const t=s/n;if(d*(1-t)<.3)break;const x=p.x+(h.x-p.x)*t,z=p.z+(h.z-p.z)*t,j=nIdx(x,z);if(j<0||NAV.cam[j])return false;if(o&&inObb(o,x,z,.12))return false}return true}
function camFor(who){if(!who)return SPOT.over;const h=headOf(who),base=yawTo(h,SPOT.over.p);
 for(const D of [2.3,1.95,1.6])for(const da of [0,.3,-.3,.6,-.6,.9,-.9,1.25,-1.25,1.6,-1.6,2.1,-2.1,2.6,-2.6,3.14]){const a=base+da,dir=V3(Math.sin(a),0,Math.cos(a)),side=V3(dir.z,0,-dir.x);
  const p=h.clone().addScaledVector(dir,D).addScaledVector(side,.12);p.y=h.y-.22;if(!camOk(p,h))continue;const l=h.clone().addScaledVector(side,.78*D/2.3);l.y=h.y-.5;return{p,l}}
 const dir=V3(SPOT.over.p.x-h.x,0,SPOT.over.p.z-h.z).normalize(),side=V3(dir.z,0,-dir.x),p=h.clone().addScaledVector(dir,2.3).addScaledVector(side,.12);p.y=h.y-.22;const l=h.clone().addScaledVector(side,.78);l.y=h.y-.5;return{p,l}}
function aim(){let c;if(UI.view==='pc'&&pcCam())c=pcCam();else if(UI.view==='cars')c=SPOT.over;else if(onCar()){const s=SPOT.car,tu=UI.view==='tune';/* from the door side, the car on the left of the shot */
  c={p:s.clone().add(tu?V3(.9,1.25,3.7):V3(.5,1.9,4.5)),l:s.clone().add(tu?V3(1.5,.45,0):V3(1.75,.35,0))}}else c=camFor(UI.who);
 GS.tp.copy(c.p);GS.tl.copy(c.l)}
function tick(dt){GS.t+=dt;const k=1-Math.exp(-dt*3.4);GS.cp.lerp(GS.tp,k);GS.cl.lerp(GS.tl,k);if(!GS.pics)portraits();
 const cam=GS.cam,s=UI.view==='pc'?0:UI.who?.01:.04;cam.position.set(GS.cp.x+Math.sin(GS.t*.23)*s,GS.cp.y+Math.sin(GS.t*.31)*s*.4,GS.cp.z);cam.lookAt(GS.cl);
 const W=R.domElement.width,H=R.domElement.height;if(H&&Math.abs(cam.aspect-W/H)>1e-3){cam.aspect=W/H;cam.updateProjectionMatrix()}
 /* talking: the room fades into the dark behind whoever you're with, and the small clutter goes away once it can't be seen */
 const fo=(UI.who&&UI.view!=='cars')||UI.view==='tune'||UI.menu||LD_on();GS.fk+=((fo?1:0)-GS.fk)*Math.min(1,dt*(fo?3.4:9));
 /* behind the loading screen: a slow drift round the car, like the title screen's drive-by */
 if(LD_on()){const a=GS.t*.09+.5;GS.tp.set(SPOT.car.x+Math.sin(a)*2.5,1.35,SPOT.car.z+Math.cos(a)*3.3);GS.tl.set(SPOT.car.x,.7,SPOT.car.z)}const tg=onCar()?SPOT.car:UI.who?headOf(UI.who):null,dd=tg?cam.position.distanceTo(tg):6;
 if(GS.clutter)GS.clutter.visible=GS.fk<.85;
 for(const k of ['red','vin']){const pe=GS[k];if(pe&&pe.rig)try{roam(pe,k,dt);anim(pe,k,dt)}catch(e){if(!GS.aerr){GS.aerr=1;console.warn('career anim',e)}}}
 type(dt);tags();bubTick(dt);if(PC.el)pcPlace()}
/* idle life on top of the file's pose. Always: breathing, a slow weight shift, loose arms. The head goes to whatever they're busy with (Nina the car,
   Vince the room), to your cursor when you hover over them, to you while you talk. On top, short gestures: idle ones every few seconds (Nina taps
   her hammer, wipes her hands, stretches; Vince checks his watch, straightens his jacket, shifts his weight), and talking ones on every line
   (nods, shrugs, a point at the car). They turn to face you when you walk up, and Nina gets stuck in with the hammer while she tunes */
const QW=new THREE.Quaternion(),QP=new THREE.Quaternion(),QD=new THREE.Quaternion();
function rotW(b,axis,ang){if(!b||!ang)return;b.parent.updateWorldMatrix(true,false);b.parent.getWorldQuaternion(QP);QW.setFromAxisAngle(axis,ang);QD.copy(QP).invert().multiply(QW).multiply(QP);b.quaternion.premultiply(QD)}
/* talking gestures stay small and low: a nod, a shrug, a hand to the hip. Nothing that lifts the hands into the air without a reason */
const GEST={red:{idle:['look'],talk:['nod','shrug','nod','hip','nod']},vin:{idle:['watch','look'],talk:['nod','shrug','nod','palm']}};
const GLEN={tap:2.4,wipe:2.2,stretch:2.6,look:2.8,watch:2.6,jacket:2.0,shift:3.0,nod:1.1,shrug:1.4,point:1.8,hip:2.0,palm:1.6,hey:1.5};
function gesture(pe,k){if(!pe)return;pe.gs={k,t:0,d:GLEN[k]||1.5}}
P.gcGesture=(who,k)=>gesture(GS[who],k);
function anim(pe,k,dt){const B=pe.rig,t=GS.t+(k==='red'?1.7:0),g=pe.g;for(const r in B)if(B[r].userData.q0)B[r].quaternion.copy(B[r].userData.q0);
 const me=UI.who===k&&!onCar(),work=k==='red'&&UI.view==='tune'&&!pe.mv&&(!pe.home||g.position.distanceTo(pe.home)<.2),hov=false;
 if(!pe.mv){const ryT=me?yawTo(g.position,GS.tp)-.12:work?yawTo(g.position,SPOT.car):pe.ryB!=null?pe.ryB:pe.ry0;g.rotation.y=lerpA(g.rotation.y,ryT,Math.min(1,dt*3.2))}
 const ry=g.rotation.y,fw=V3(Math.sin(ry),0,Math.cos(ry)),rt=V3(Math.cos(ry),0,-Math.sin(ry)),up=V3(0,1,0);
 pe.tk=Math.max(0,(pe.tk||0)-dt);
 /* gestures */
 if(pe.gs){pe.gs.t+=dt;if(pe.gs.t>=pe.gs.d)pe.gs=null}
 pe.nx=(pe.nx==null?1+Math.random()*3:pe.nx)-dt;if(pe.nx<=0&&!pe.mv&&!pe.ac){pe.nx=8+Math.random()*8;let q;do q=rnd(IDLE[k]);while(q===pe.pz&&IDLE[k].length>1);pe.pz=q;if(!me&&!pe.gs&&!work&&Math.random()<.3)gesture(pe,'look')}
 const G_=pe.gs,gk=G_?G_.k:'',gp=G_?G_.t/G_.d:0,E=G_?Math.pow(Math.sin(Math.PI*Math.min(1,gp)),.7):0;
 /* where the head looks */
 const h=headOf(k);let tp=me?GS.cam.position:hov&&GS.cur?GS.cur:work?V3(SPOT.car.x,.6,SPOT.car.z):pe.foc?pe.foc():GS.cam.position;
 if(gk==='watch'){tp=g.position.clone().addScaledVector(fw,.35).addScaledVector(rt,.2);tp.y=1.05}
 else if(gk==='look'){tp=g.position.clone().addScaledVector(fw,2).addScaledVector(rt,Math.sin(t*.7)*3);tp.y=1.7}
 else if(gk==='point'){tp=V3(SPOT.car.x,.8,SPOT.car.z)}
 if(!me&&!hov&&!work&&!G_&&pe.lk)tp=pe.lk;
 const dx=tp.x-h.x,dz=tp.z-h.z,dy=tp.y-h.y;let yaw=wrapA(Math.atan2(dx,dz)-ry),pit=-Math.atan2(dy,Math.hypot(dx,dz));
 if(!me&&!hov&&!work&&!G_)yaw+=Math.sin(t*.21)*.15;yaw=Math.max(-.85,Math.min(.85,yaw));pit=Math.max(-.3,Math.min(.6,pit));
 const kk=Math.min(1,dt*(hov||me||G_?4.5:2));pe.hy_=pe.hy_==null?yaw:pe.hy_+(yaw-pe.hy_)*kk;pe.hp_=pe.hp_==null?pit:pe.hp_+(pit-pe.hp_)*kk;
 const br=Math.sin(t*2*Math.PI/3.8),sw=Math.sin(t*.42),tk=pe.tk>0?Math.min(1,pe.tk)*Math.sin(t*6.5):0;
 /* body */
 const shift=0,hip=gk==='hip'?E:0;
 rotW(B.spine,fw,sw*.012-hip*.07);rotW(B.spine,up,Math.sin(t*.31)*.04);
 if(work){rotW(B.spine002,rt,.1+Math.sin(t*.8)*.02);rotW(B.spine003,rt,.05)}
 rotW(B.spine002,rt,-br*.02-(gk==='stretch'?E*.2:0));rotW(B.spine003,rt,-br*.024);rotW(B.spine003,fw,-sw*.016-shift*.05+hip*.05);
 /* head */
 const nod=gk==='nod'?Math.sin(gp*Math.PI*3)*E*.14:0;
 rotW(B.spine004,up,pe.hy_*.35);rotW(B.spine005,up,pe.hy_*.4);rotW(B.spine006,up,pe.hy_*.25);
 rotW(B.spine004,rt,pe.hp_*.3);rotW(B.spine005,rt,pe.hp_*.45+tk*.04+nod);rotW(B.spine006,rt,pe.hp_*.2-(gk==='stretch'?E*.2:0));
 rotW(B.spine006,fw,Math.sin(t*.37)*.035+(gk==='shrug'?E*.1:0));
 /* shoulders */
 const sh=gk==='shrug'?E:gk==='stretch'?E*.6:0;
 for(const [s,sg] of [['L',1],['R',-1]])rotW(B['shoulder'+s],fw,-sg*(br*.012+sh*.16));
 /* arms (negative about the body's right axis lifts the arm forwards) */
 for(const [s,sg] of [['L',1],['R',-1]]){rotW(B['upper_arm'+s],rt,Math.sin(t*.42+sg)*.025);rotW(B['upper_arm'+s],fw,sg*br*.015);rotW(B['forearm'+s],rt,-.08-Math.sin(t*.5+sg)*.025)}
 const A=(s,u,f)=>{rotW(B['upper_arm'+s],rt,u);rotW(B['forearm'+s],rt,f)};
 if(work){A('L',.05,-.2);rotW(B.upper_armL,fw,.5);rotW(B.forearmL,fw,-1.15)}
 else if(gk==='tap'){A('L',-.35*E,-1.2*E);A('R',-.3*E,-(1.0+Math.max(0,Math.sin(t*8))*.45)*E)}
 else if(gk==='wipe'){A('L',-.35*E,-1.3*E);A('R',-.35*E,-1.3*E);rotW(B.forearmR,up,Math.sin(t*7)*.25*E);rotW(B.forearmL,up,-Math.sin(t*7)*.25*E)}
 else if(gk==='stretch'){A('L',-.25*E,-.5*E);A('R',-.25*E,-.5*E);for(const [s,sg] of [['L',1],['R',-1]])rotW(B['upper_arm'+s],fw,sg*E*.35)}
 else if(gk==='watch'){A('L',-.5*E,-1.45*E);rotW(B.forearmL,up,-.4*E)}
 else if(gk==='jacket'){A('L',-.25*E,-1.5*E);A('R',-.25*E,-1.5*E);rotW(B.spine005,rt,.1*E)}
 else if(gk==='point'){A('R',-1.05*E,-.25*E)}
 else if(gk==='palm'){A('R',-.3*E,-.6*E);A('L',-.2*E,-.45*E);for(const [s,sg] of [['L',1],['R',-1]])rotW(B['forearm'+s],fw,sg*.35*E)}
 else if(gk==='shrug'){A('L',-.2*E,-.75*E);A('R',-.2*E,-.75*E);for(const [s,sg] of [['L',1],['R',-1]])rotW(B['forearm'+s],fw,sg*.4*E)}
 else if(gk==='hip'){A('R',.05*E,-.2*E);rotW(B.upper_armR,fw,-.5*E);rotW(B.forearmR,fw,1.15*E)}
 else if(gk==='hey'){const e=E*Math.min(1,(1-gp)*3);A('R',-.35*e,-1.15*e);rotW(B.forearmR,fw,Math.sin(t*9)*.12*e)}
 g.position.y=walkPose(pe,B,rt,fw,up);posePP(pe,k,B,t,dt,rt,fw,up,A,me,work||!!G_)}
/* ---------------- moving around the shop ----------------
   The garage is mapped once from its own mesh into a 10 cm floor grid (NAV): every bit of wall, bench, shelf, locker or bin between 8 cm and
   1.75 m up blocks its cell, the car blocks its rotated footprint, and the grid is grown by a body's radius so nobody brushes a wall. People walk
   A* paths on it (string-pulled into straight runs), turn on the spot first if the path starts behind them, and never walk into each other (the
   other person's spot is blocked while planning, and a walker waits if the other one is in the way).
   STATIONS are measured spots in the room: where to stand, which way to face, what the hands go to (the top of the back bench, a box on the
   right-hand shelf, the tyre stack, the laptop on the cart by the left wall). Nina potters about (bench, shelf, tyres, her phone), Vince walks
   to his laptop and types, looks out of the door window, or checks the car. Click someone mid-routine and the routine fades out where they
   stand: they turn to you there, and pick it up again a little while after you leave */
const NAV={x0:-6.2,z0:-6.5,c:.1,W:88,H:108,raw:null,cam:null,nav:null};
const nIdx=(x,z)=>{const i=Math.floor((x-NAV.x0)/NAV.c),j=Math.floor((z-NAV.z0)/NAV.c);return i<0||j<0||i>=NAV.W||j>=NAV.H?-1:j*NAV.W+i};
function navBuild(gm){const N=NAV.W*NAV.H,raw=new Uint8Array(N),cam=new Uint8Array(N);
 for(const k in gm){const a=gm[k].geometry.attributes.position.array;
  for(let f=0;f<a.length;f+=9){const ya=Math.min(a[f+1],a[f+4],a[f+7]),yb=Math.max(a[f+1],a[f+4],a[f+7]);if(yb<.08||ya>2.1)continue;
   const e=Math.max(Math.hypot(a[f+3]-a[f],a[f+5]-a[f+2]),Math.hypot(a[f+6]-a[f],a[f+8]-a[f+2]),Math.hypot(a[f+6]-a[f+3],a[f+8]-a[f+5]),yb-ya),n=Math.min(80,Math.ceil(e/.05));
   for(let u=0;u<=n;u++)for(let v=0;v<=n-u;v++){const w=1-(u+v)/n,uu=u/n,vv=v/n,x=a[f]*w+a[f+3]*uu+a[f+6]*vv,y=a[f+1]*w+a[f+4]*uu+a[f+7]*vv,z=a[f+2]*w+a[f+5]*uu+a[f+8]*vv;
    if(y<.08||y>2.1)continue;const i=nIdx(x,z);if(i<0)continue;cam[i]=1;if(y<1.75)raw[i]=1}}}
 /* outside the walls is blocked too */
 for(let j=0;j<NAV.H;j++)for(let i=0;i<NAV.W;i++){const x=NAV.x0+(i+.5)*NAV.c,z=NAV.z0+(j+.5)*NAV.c;if(x<-5.95||x>2.3||z<-6.3||z>3.75){raw[j*NAV.W+i]=1;cam[j*NAV.W+i]=1}}
 NAV.raw=raw;NAV.cam=cam;navGrow()}
/* the car's footprint, rotated with it (from the model's own box, without its floor shadow) */
function carObb(){const o=GS.car;if(!o)return null;const g=o.children[0],ry=o.rotation.y;o.rotation.y=0;o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);o.rotation.y=ry;o.updateMatrixWorld(true);
 const c=b.getCenter(V3()).sub(o.position);return{x:o.position.x+c.x*Math.cos(ry)+c.z*Math.sin(ry),z:o.position.z-c.x*Math.sin(ry)+c.z*Math.cos(ry),hx:(b.max.x-b.min.x)/2,hz:(b.max.z-b.min.z)/2,ry,top:b.max.y}}
const inObb=(o,x,z,m)=>{const dx=x-o.x,dz=z-o.z,c=Math.cos(o.ry),s=Math.sin(o.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<o.hx+m&&Math.abs(lz)<o.hz+m};
function navView(){const c=new THREE.PerspectiveCamera(56,1.6,.05,120);c.position.copy(SPOT.over.p);c.lookAt(SPOT.over.l);c.updateMatrixWorld(true);const v=new Uint8Array(NAV.W*NAV.H),q=V3();
 for(let j=0;j<NAV.H;j++)for(let i=0;i<NAV.W;i++){const x=NAV.x0+(i+.5)*NAV.c,z=NAV.z0+(j+.5)*NAV.c;let ok=true;for(const y of [0,1.85]){q.set(x,y,z).project(c);if(q.z>1||Math.abs(q.x)>.86||q.y<-.74||q.y>.78)ok=false}v[j*NAV.W+i]=ok?0:1}return v}
function navGrow(){if(!NAV.raw)return;if(!NAV.view)NAV.view=navView();const R_=3,N=NAV.W*NAV.H,nav=new Uint8Array(N),ob=GS.car?carObb():null;GS.obb=ob;
 for(let j=0;j<NAV.H;j++)for(let i=0;i<NAV.W;i++){if(!NAV.raw[j*NAV.W+i])continue;for(let b=-R_;b<=R_;b++)for(let a=-R_;a<=R_;a++){if(a*a+b*b>R_*R_+1)continue;const ii=i+a,jj=j+b;if(ii>=0&&jj>=0&&ii<NAV.W&&jj<NAV.H)nav[jj*NAV.W+ii]=1}}
 if(ob)for(let j=0;j<NAV.H;j++)for(let i=0;i<NAV.W;i++)if(inObb(ob,NAV.x0+(i+.5)*NAV.c,NAV.z0+(j+.5)*NAV.c,.34))nav[j*NAV.W+i]=1;
 for(let i=0;i<nav.length;i++)if(NAV.view[i])nav[i]=1;
 NAV.nav=nav}
const navFree=(x,z,blk)=>{const i=nIdx(x,z);return i>=0&&!NAV.nav[i]&&!(blk&&Math.hypot(x-blk.x,z-blk.z)<.75)};
function navSeg(a,b,blk){const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(d/.05);for(let s=1;s<=n;s++){const t=s/n;if(!navFree(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,blk))return false}return true}
function navNear(p,blk){if(navFree(p.x,p.z,blk))return p.clone();for(let r=.1;r<1.5;r+=.1)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*Math.PI*2)*r,z=p.z+Math.sin(a/16*Math.PI*2)*r;if(navFree(x,z,blk))return V3(x,0,z)}return p.clone()}
/* A* over the grown grid, 8 neighbours, then string-pulled */
function navPath(from,to,blk){if(!NAV.nav)return [to.clone()];const s0=navNear(from,blk),t0=navNear(to,blk),W=NAV.W,H=NAV.H,N=W*H;
 const si=nIdx(s0.x,s0.z),ti=nIdx(t0.x,t0.z);if(si<0||ti<0)return [to.clone()];
 const g=new Float32Array(N).fill(1e9),from_=new Int32Array(N).fill(-1),done=new Uint8Array(N),open=[si];g[si]=0;const ti_=ti%W,tj=ti/W|0;
 const hh=i=>{const dx=Math.abs(i%W-ti_),dz=Math.abs((i/W|0)-tj);return Math.max(dx,dz)+.414*Math.min(dx,dz)};const fs=new Float32Array(N);fs[si]=hh(si);
 const blocked=i=>{if(NAV.nav[i])return true;if(!blk)return false;const x=NAV.x0+(i%W+.5)*NAV.c,z=NAV.z0+((i/W|0)+.5)*NAV.c;return Math.hypot(x-blk.x,z-blk.z)<.75};
 let it=0;while(open.length&&it++<20000){let bi=0;for(let q=1;q<open.length;q++)if(fs[open[q]]<fs[open[bi]])bi=q;const c=open[bi];open[bi]=open[open.length-1];open.pop();if(c===ti)break;if(done[c])continue;done[c]=1;
  const ci=c%W,cj=c/W|0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;const ii=ci+a,jj=cj+b;if(ii<0||jj<0||ii>=W||jj>=H)continue;const n=jj*W+ii;if(done[n]||blocked(n))continue;
   if(a&&b&&(blocked(cj*W+ii)||blocked(jj*W+ci)))continue;const ng=g[c]+(a&&b?1.414:1);if(ng<g[n]){g[n]=ng;from_[n]=c;fs[n]=ng+hh(n);open.push(n)}}}
 if(from_[ti]<0&&ti!==si)return null;
 const pts=[];for(let c=ti;c>=0;c=from_[c]){pts.push(V3(NAV.x0+(c%W+.5)*NAV.c,0,NAV.z0+((c/W|0)+.5)*NAV.c));if(c===si)break}pts.reverse();pts[0]=s0;pts[pts.length-1]=t0;
 const out=[pts[0]];let a=0;while(a<pts.length-1){let b=pts.length-1;while(b>a+1&&!navSeg(pts[a],pts[b],blk))b--;out.push(pts[b]);a=b}
 if(t0.distanceTo(to)<.05)out[out.length-1]=to.clone();out.shift();return out}
/* where people go. Measured from the map: back bench top 0.95 m with its front edge at z -5.2; right-hand bench top 0.95 m, front edge x 0.8,
   boxes on the shelf behind it at 1.35-1.8 m; tyre stack in the back right corner (x 0-1.6, z -5.9..-5.1, 0.75 m tall); the cart with the red
   gas can against the left wall (x -5.5..-4.75, z -0.8..0.7, top 1.14 m); door window x -3.5..-0.4 at z 3.85 */
const STN={
 red:[{k:'bench',p:V3(-1.2,0,-4.62),ry:Math.PI,look:V3(-1.2,.98,-5.45),d:[7,11]},
  {k:'bench',p:V3(-.6,0,-4.62),ry:Math.PI,look:V3(-.6,1.08,-5.4),d:[6,10]},
  {k:'shelf',p:V3(.22,0,-3.3),ry:Math.PI/2,look:V3(1.25,1.4,-3.3),d:[5,8]},
  {k:'bench',p:V3(-2.0,0,-4.62),ry:Math.PI,look:V3(-2.0,.98,-5.45),d:[6,10]},
  {k:'car',p:null,d:[6,10]}],
 vin:[{k:'type',p:V3(-4.36,0,-.3),ry:-Math.PI/2,look:V3(-5.0,1.25,-.3),d:[10,18]},
  {k:'type',p:V3(-4.36,0,-.3),ry:-Math.PI/2,look:V3(-5.0,1.25,-.3),d:[10,18]},
  {k:'lean',p:V3(-2.7,0,-4.62),ry:Math.PI,look:V3(-2.7,.98,-5.45),d:[8,12]},
  {k:'car',p:null,d:[5,8]}]};
const LAPTOP={p:V3(-5.0,1.14,-.3),ry:Math.PI/2};
/* a spot beside the car, on the side nearest to the person */
function carStation(pe){const o=GS.obb;if(!o)return null;const c=Math.cos(o.ry),s=Math.sin(o.ry),dx=pe.g.position.x-o.x,dz=pe.g.position.z-o.z,lx=dx*c-dz*s;
 const side=lx<0?-1:1,lz=(Math.random()-.5)*o.hz*1.2,ax=side*(o.hx+.6),wx=o.x+ax*c+lz*s,wz=o.z-ax*s+lz*c,p=V3(wx,0,wz);return{k:'car',p,ry:yawTo(p,V3(o.x+lz*s*.5,0,o.z+lz*c*.5)),look:V3(o.x,.9,o.z),d:[5,8]}}
function roamInit(pe,k){pe.home=pe.g.position.clone();pe.homeRy=pe.ry0;pe.ryB=pe.ry0;pe.sp=0;pe.ph=0;pe.wk=0;pe.aw=0;pe.path=null;pe.task=null;pe.ac=null;pe.nxR=k==='red'?9+Math.random()*6:14+Math.random()*8;pe.spd=k==='red'?1.15:.95}
const other=k=>GS[k==='red'?'vin':'red'];
function goTo(pe,k,p,then){const o=other(k),blk=o&&o.g?o.g.position:null;let path=navPath(pe.g.position,p,blk);if(!path)path=navPath(pe.g.position,p,null);if(!path)return false;pe.path=path;pe.then=then;pe.wait=0;return true}
function startTask(pe,k,st){pe.ac=null;if(st.k==='car'){st=carStation(pe);if(!st)return}
 pe.task=Object.assign({},st,{t:0,d:st.d[0]+Math.random()*(st.d[1]-st.d[0])});goTo(pe,k,st.p,'act')}
const free_=k=>GS.ok&&!LD_on()&&UI.who!==k&&!(k==='red'&&(onCar()||UI.view==='tune'));
const LD_on=()=>!!(LD&&LD.classList.contains('on')&&!LD.classList.contains('rdy'));
function roam(pe,k,dt){if(!pe.home)roamInit(pe,k);const g=pe.g,me=UI.who===k;
 /* talking to them, or Nina needed at the car: drop the routine where they stand */
 if(me&&(pe.task||pe.path)){pe.task=null;pe.path=null;pe.then=null;pe.qPh=0;pe.nxR=Math.max(pe.nxR,4+Math.random()*4)}
 if(false){pe.task=null;pe.qPh=0;goTo(pe,k,pe.home,'home')}
 /* the next outing */
 if(false&&!pe.task&&!pe.path&&free_(k)){pe.nxR-=dt;if(pe.nxR<=0){const away=g.position.distanceTo(pe.home)>.3;
   if(away&&Math.random()<.6){goTo(pe,k,pe.home,'home');pe.nxR=9+Math.random()*10}else{startTask(pe,k,rnd(STN[k]));pe.nxR=(k==='red'?10:14)+Math.random()*10}}}
 /* walking */
 let tgtSp=0,ryT=null;pe.mv=false;
 if(pe.path&&pe.path.length){const w=pe.path[0],dx=w.x-g.position.x,dz=w.z-g.position.z,d=Math.hypot(dx,dz),last=pe.path.length===1;
  if(d<(last?.04:.18)){pe.path.shift();if(!pe.path.length)arrive(pe,k)}
  else{const hd=Math.atan2(dx,dz),off=wrapA(hd-g.rotation.y),o=other(k);ryT=hd;
   let blockd=false;if(o&&o.g){const ox=o.g.position.x-g.position.x,oz=o.g.position.z-g.position.z,od=Math.hypot(ox,oz);if(od<.8&&(ox*dx+oz*dz)/(d*od)>.3)blockd=true}
   if(blockd){pe.wait+=dt;if(pe.wait>1.6){pe.wait=0;const end=pe.path[pe.path.length-1];goTo(pe,k,end,pe.then)}}
   else{const rem=pe.path.reduce((s,p,i,a)=>s+(i?p.distanceTo(a[i-1]):Math.hypot(p.x-g.position.x,p.z-g.position.z)),0);
    tgtSp=Math.abs(off)>.9?0:pe.spd*Math.max(.25,Math.min(1,rem/.55))*(1-Math.min(.6,Math.abs(off)*.6))}
   pe.mv=true}}
 if(pe.mv||pe.sp>.01){pe.sp+=(tgtSp-pe.sp)*Math.min(1,dt*(tgtSp>pe.sp?2.2:4));if(pe.sp<.005&&!pe.mv)pe.sp=0;const ry=g.rotation.y;
  if(ryT!=null){const off=wrapA(ryT-ry),tr=Math.sign(off)*Math.min(Math.abs(off),dt*(pe.sp<.2?3.2:4.5));g.rotation.y=ry+tr;pe.turn=Math.abs(tr)/Math.max(dt,1e-4)}else pe.turn=0;
  const fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y),nx=g.position.x+fx*pe.sp*dt,nz=g.position.z+fz*pe.sp*dt;
  if(navFree(nx,nz)||!navFree(g.position.x,g.position.z)){g.position.x=nx;g.position.z=nz}else pe.sp=0;
  /* never stand stuck against something: give up on the path and think again */
  pe.stk=pe.mv&&pe.sp<.03&&!pe.wait?(pe.stk||0)+dt:0;if(pe.stk>3){pe.stk=0;pe.path=null;pe.task=null;pe.nxR=2}
  /* the legs follow the distance covered, so the feet don't slide; a turn on the spot is a small shuffle */
  const step=.62*(pe.h||1.7)/1.75;pe.ph+=(pe.sp*dt/step)*Math.PI+(pe.sp<.15&&pe.turn>.3?dt*5.5:0)}
 else pe.turn=0;
 const wk=Math.min(1,pe.sp/.9)+(pe.turn>.3&&pe.sp<.15?.35:0);pe.wk+=(Math.min(1,wk)-pe.wk)*Math.min(1,dt*8);
 /* the routine's pose fades in once they've arrived, and out when it ends or you click on them */
 if(pe.ac&&(!pe.task||me))pe.ac=null;
 if(pe.task&&pe.ac&&!pe.mv){pe.task.t+=dt;if(pe.task.t>=pe.task.d){const tk=pe.task;pe.task=null;
   /* now and then she checks her phone before heading back */
}}
 pe.lk=pe.mv?g.position.clone().add(V3(Math.sin(g.rotation.y)*3,1.45,Math.cos(g.rotation.y)*3)):pe.ac&&pe.aw>.2?(pe.lkH||pe.ac.look):null}
function arrive(pe,k){pe.path=null;const th=pe.then;pe.then=null;if(th==='home'){pe.ryB=pe.homeRy;pe.ac=null;return}
 if(th==='act'&&pe.task){pe.ryB=pe.task.ry;pe.ac=pe.task;pe.task.t=0}}
/* the walk: thighs swing about the hip, the knee folds on the forward swing, the foot stays flat, hips and shoulders counter-rotate, arms
   swing against the legs and the body rises over each planted foot. rotW sign: negative about the body's right axis = forwards */
function walkPose(pe,B,rt,fw,up){const w=pe.wk;if(w<.01)return 0;const f=pe.ph,amp=.36*w;
 for(const [s,o] of [['L',0],['R',Math.PI]]){const sn=Math.sin(f+o),cs=Math.cos(f+o),th=-amp*sn,kn=w*(.06+.62*Math.pow(Math.max(0,cs),1.6)),ft=-(th+kn)*.75+(sn<-.6?-.18*w*(-sn-.6)/.4:0);
  rotW(B['thigh'+s],rt,th);rotW(B['shin'+s],rt,kn);rotW(B['foot'+s],rt,ft)}
 const sn=Math.sin(f);rotW(B.spine,up,.07*w*sn);rotW(B.spine003,up,-.11*w*sn);rotW(B.spine,fw,.025*w*Math.sin(f*2));rotW(B.spine002,rt,.05*w);
 for(const [s,sg] of [['L',1],['R',-1]]){rotW(B['upper_arm'+s],rt,sg*.32*w*sn);rotW(B['forearm'+s],rt,-.18*w-Math.max(0,-sg*sn)*.2*w)}
 return -.022*w*(.5-.5*Math.cos(2*f))}
/* posture. Standing still is a held shape the body drifts between every few seconds (weight on one leg with the other knee eased, a hand
   on the hip, hands in pockets, hands folded in front); a routine at a station is the same kind of shape with a few phases (typing, then a
   hand resting on the cart; both hands on the bench, then holding something up to look at). Everything goes through pe.pp, which eases
   toward its target, so standing, walking, routines and talking all blend into each other instead of snapping.
   sw: weight to the left (+) or right (-) leg; ln: lean forward; u/f: upper arm and forearm forwards (negative lifts); o: upper arm out to
   the side; tw: forearm turned in; hd: head down */
const PK=['sw','ln','uL','fL','oL','tL','uR','fR','oR','tR','hd'];
const PZ={N:{},WL:{sw:.9},WR:{sw:-.9},hipR:{sw:-.7,uR:.05,fR:-.2,oR:.5},hipL:{sw:.7,uL:.05,fL:-.2,oL:.5},hips:{sw:.35,uL:.05,fL:-.2,oL:.45,uR:.05,fR:-.2,oR:.45},
 belt:{sw:-.6,uL:0,fL:-.18,oL:.2,uR:0,fR:-.18,oR:.2},clasp:{sw:.5,uL:-.22,fL:-.72,tL:.5,uR:-.22,fR:-.72,tR:.5},pockets:{sw:-.7,uL:.06,fL:-.42,oL:.12,uR:.06,fR:-.42,oR:.12}};
const IDLE={red:['WL','belt','WR','hipR','WL','belt','hipL'],vin:['WL','clasp','pockets','WR','pockets']};
function routine(a,k,tt,t){const H=Object.assign;switch(a.k){
 case 'type':{const c=tt%9;return c<6.2?{ln:.12,uL:-.72,fL:-.78,tL:.25,uR:-.72,fR:-.78,tR:.25,_ty:1}:{ln:.06,sw:.5,uL:-.04,fL:-.22,uR:-.62,fR:-.5,tR:.15}}
 case 'bench':{const c=tt%9;return c<5.5?{ln:.24,hd:.1,uL:-.62,fL:-.45,tL:.15+.12*Math.sin(t*.9),uR:-.62,fR:-.45,tR:.15-.12*Math.sin(t*.7),_wk:1}:{ln:.16,sw:.5,hd:.12,uL:-.6,fL:-.45,tL:.15,uR:-.12,fR:-.55,oR:.55}}
 case 'shelf':{const c=tt%8;return c<3?H({hd:-.12},PZ.hipL):c<5?{sw:.3,ln:-.04,hd:-.1,uR:-1.2,fR:-.2,uL:-.12,fL:-.55,oL:.5}:H({hd:-.08},PZ.WL)}
 case 'tires':{const c=tt%6;return c<3.8?{ln:.3,sw:.5,uR:-.42,fR:-.12,_pat:1}:PZ.hipL}
 case 'lean':{const c=tt%8;return c<5?{ln:.2,uL:-.6,fL:-.42,uR:-.6,fR:-.42}:PZ.clasp}
 case 'car':return k==='vin'?H({ln:.05},PZ.pockets):H({ln:.12,hd:.1},PZ.hips)}
 return PZ.N}
function posePP(pe,k,B,t,dt,rt,fw,up,A,me,busy){if(!pe.pp){pe.pp={};for(const q of PK)pe.pp[q]=0}const pp=pe.pp,ac=pe.ac&&!pe.mv&&!me?pe.ac:null;
 let tg=ac?routine(ac,k,ac.t||0,t):PZ[pe.pz||'N']||PZ.N;if(pe.mv)tg=PZ.N;
 const kk=Math.min(1,dt*1.5);for(const q of PK){let v=tg[q]||0;if(busy&&q!=='sw'&&q!=='ln'&&q!=='hd')v=0;pp[q]+=(v-pp[q])*kk}
 const st=1-pe.wk;
 /* weight on one leg: the other knee eases, the shoulders tilt back over the standing leg */
 const a=Math.abs(pp.sw)*st,fr=pp.sw>0?'R':'L';rotW(B['thigh'+fr],rt,-.05*a);rotW(B['shin'+fr],rt,.2*a);rotW(B['foot'+fr],rt,-.14*a);
 rotW(B.spine001,fw,pp.sw*.035*st);rotW(B.spine003,fw,-pp.sw*.04*st);rotW(B.spine,up,pp.sw*.05*st);
 rotW(B.spine002,rt,pp.ln);rotW(B.spine003,rt,pp.ln*.4);rotW(B.spine005,rt,pp.hd);
 A('L',pp.uL,pp.fL);A('R',pp.uR,pp.fR);rotW(B.upper_armL,fw,pp.oL);rotW(B.upper_armR,fw,-pp.oR);/* the elbow goes out, the forearm folds back in: that is what puts a hand on a hip or a belt instead of out in the air */rotW(B.forearmL,fw,-pp.oL*2.3);rotW(B.forearmR,fw,pp.oR*2.3);rotW(B.forearmL,up,-pp.tL);rotW(B.forearmR,up,pp.tR);
 /* small live detail on top, only once the routine's shape has settled in */
 const on=!!(ac&&pe.task);pe.aw+=((on?1:0)-pe.aw)*Math.min(1,dt*2);const tg_=ac?routine(ac,k,ac.t||0,t):null;
 if(tg_&&tg_._ty&&pe.aw>.05){const ps=Math.sin(t*.9)>.75?0:1;rotW(B.forearmL,rt,Math.sin(t*13.1)*.06*ps*pe.aw);rotW(B.forearmR,rt,Math.sin(t*11.3+1.3)*.06*ps*pe.aw)}
 if(tg_&&tg_._wk&&pe.aw>.05){rotW(B.forearmR,up,Math.sin(t*1.7)*.12*pe.aw);rotW(B.handR,rt,Math.sin(t*2.3)*.15*pe.aw)}
 if(tg_&&tg_._pat&&pe.aw>.05)rotW(B.forearmR,rt,-Math.max(0,Math.sin(t*4.2))*.3*pe.aw);
 pe.lkH=tg_&&tg_._hand&&B.handR?B.handR.getWorldPosition(V3()):null}
/* the hover label: a rounded pill with the name ("Change car" on the car) */
function tags(){const t=$('gcTag');if(!t)return;const k=!UI.who&&!onCar()&&UI.view!=='pc'&&GS.ok&&!UI.menu&&GS.hov!==BUB.who?GS.hov:null;t.classList.toggle('on',!!k);if(!k)return;
 const p=k==='car'?V3(SPOT.car.x,(GS.carBox?GS.carBox.max.y:1.3)+.3,SPOT.car.z):k==='pc'?GS.laptop.position.clone().add(V3(0,.5,0)):headOf(k).add(V3(0,.36,0));p.project(GS.cam);
 if(t.dataset.k!==k){t.dataset.k=k;t.style.setProperty('--c',k==='car'||k==='pc'?'#cfe2f5':k==='red'?RED.col:VIN.col);t.innerHTML=k==='car'?'Change car':k==='pc'?'Marketplace':k==='red'?RED.n:VIN.n}
 t.style.left=((p.x*.5+.5)*innerWidth).toFixed(1)+'px';t.style.top=((-p.y*.5+.5)*innerHeight).toFixed(1)+'px'}
/* what's under the cursor: people first (thin boxes around them), then the car */
const RC=new THREE.Raycaster(),MV=new THREE.Vector2();
function pickAt(cx,cy){if(!GS.ok)return null;MV.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);RC.setFromCamera(MV,GS.cam);let best=null,bd=1e9;const hit=(k,d)=>{if(d!=null&&d<bd){bd=d;best=k}};
 /* people: a box around where the body actually is right now (from the bones), a little padded, so leaning or a hand out still counts */
 for(const k of ['red','vin']){const pe=GS[k];if(!pe||!pe.g)continue;const b=new THREE.Box3();let n=0;if(pe.rig)for(const r in pe.rig){const bn=pe.rig[r];if(!bn||!bn.getWorldPosition)continue;b.expandByPoint(bn.getWorldPosition(V3()));n++}
  if(!n){const p=pe.g.position;b.set(V3(p.x-.3,0,p.z-.3),V3(p.x+.3,(pe.hy||1.6)+.2,p.z+.3))}else{b.min.y=0;b.max.y+=.2;b.expandByVector(V3(.13,0,.13))}
  const h=RC.ray.intersectBox(b,V3());if(h)hit(k,h.distanceTo(RC.ray.origin))}
 /* the car: its real surface, not its bounding box */
 if(GS.car){const I=RC.intersectObject(GS.car,true).filter(x=>!x.object.userData.noOL);if(I.length)hit('car',I[0].distance)}
 /* the computer: the laptop and the top of the cart it sits on */
 if(GS.laptop){const b=new THREE.Box3().setFromObject(GS.laptop).expandByVector(V3(.12,.08,.12));const h=RC.ray.intersectBox(b,V3());if(h)hit('pc',h.distanceTo(RC.ray.origin)-.15)}
 if(best&&best!=='car'&&best!=='pc')GS.cur=RC.ray.at(GS.cam.position.distanceTo(headOf(best)),V3());return best}
{const f0=frame;let vis=false;const MENU_BG=['menu','s8cards','s8quick','s8pick','s8setup','s8career','s8res'];
 frame=function(n){if(scr==='s8career'&&GS.ok&&sec.classList.contains('gcOn')){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
   /* other screens (split-screen races, the bike mode, the menu previews) leave a viewport or scissor of their own behind, and the adaptive
      resolution resizes the canvas under it: start every garage frame from the full canvas so the picture never ends up in a corner */
   {const pr=R.getPixelRatio()||1;R.shadowMap.enabled=true;R.shadowMap.autoUpdate=true;R.setRenderTarget(null);R.setScissorTest(false);R.setViewport(0,0,R.domElement.width/pr,R.domElement.height/pr);R.setScissor(0,0,R.domElement.width/pr,R.domElement.height/pr)}
   try{tick(dt);renderGarage();olRender(dt)}catch(e){if(!GS.err){GS.err=1;console.warn('career frame',e)}}
   if(!vis){vis=true;R.domElement.style.visibility='';document.body.classList.add('gcG')}return}
  if(vis){vis=false;document.body.classList.remove('gcG');R.domElement.style.visibility=MENU_BG.includes(scr)&&!(RACE&&scr==='s8res')?'hidden':''}
  return f0.apply(this,arguments)}}

/* ---------------- screen ---------------- */
const CSS=`
body.gcG #v8Bg{opacity:0!important}
#s8career.gcOn{cursor:default}#s8career.gcOn.hv{cursor:pointer}
#s8career.gcOn::before{background:linear-gradient(180deg,#07090cb0 0%,#07090c30 13%,transparent 30%,transparent 70%,#07090cc0 100%)!important}
#s8career.gcOn .gcVig{position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .6s;background:radial-gradient(ellipse at 32% 45%,transparent 45%,#07090c80 100%),linear-gradient(90deg,transparent 55%,#07090c70 100%)}
#s8career.gcOn.talk .gcVig{opacity:1}
#s8career.gcOn .gcTag{position:absolute;z-index:2;transform:translate(-50%,-100%) translateY(6px) scale(.92);pointer-events:none;padding:8px 18px 8px 14px;border-radius:999px;white-space:nowrap;opacity:0;font:400 16px var(--gt);color:#fff;
 background:linear-gradient(180deg,#3a3f46f2,#1a1d22f6);box-shadow:inset 0 1px 0 #ffffff45,0 0 0 1px #000,0 8px 22px #000b;transition:opacity .2s,transform .3s cubic-bezier(.3,1.4,.5,1)}
#s8career.gcOn .gcTag.on{opacity:1;transform:translate(-50%,-100%)}
#s8career.gcOn .gcTag::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--c);margin-right:9px;vertical-align:1px;box-shadow:0 0 8px var(--c)}
#s8career.gcOn .gcTier{position:absolute;left:24px;top:84px;z-index:2;display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;background:linear-gradient(180deg,#2a2e33e0,#141619ec);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 10px 26px #0008;width:min(360px,40vw);transition:opacity .4s}
#s8career.gcOn .gcTier b{font:600 12px var(--gt);letter-spacing:.18em}
#s8career.gcOn .gcTier .bar{flex:1;height:6px;border-radius:3px;background:#00000080;box-shadow:inset 0 1px 2px #000;overflow:hidden}#s8career.gcOn .gcTier .bar i{display:block;height:100%;border-radius:3px;background:linear-gradient(180deg,#8fb4d8,#4f7eab 48%,#33608c 52%,#4a77a3);box-shadow:inset 0 1px 0 #ffffffa0}
#s8career.gcOn .gcTier small{font:500 10px var(--gt);color:#9aa4b0;white-space:nowrap}
#s8career.gcOn .gcCarI{position:absolute;left:24px;bottom:78px;z-index:2;display:flex;align-items:center;gap:14px;padding:8px 18px 8px 8px;border-radius:12px;background:linear-gradient(180deg,#2a2e33e0,#141619ec);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 10px 26px #0008;transition:opacity .3s;cursor:pointer}
#s8career.gcOn .gcCarI .th{width:112px;height:66px;border-radius:8px;background:#07090c center/cover no-repeat;box-shadow:inset 0 0 0 1px #ffffff14}
#s8career.gcOn .gcCarI small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#9aa4b0}#s8career.gcOn .gcCarI b{display:block;font:500 16px var(--gt);margin:2px 0 6px}
#s8career.gcOn .gcCarI .cd{display:flex;align-items:center;gap:10px;font:400 11px var(--gt);color:#c9d0d7}#s8career.gcOn .gcCarI .cd i{display:block;width:110px;height:5px;border-radius:3px;background:#00000080;overflow:hidden}#s8career.gcOn .gcCarI .cd i u{display:block;height:100%;background:linear-gradient(90deg,#7fe0b0,#cfe2f5)}
#s8career.gcOn .gcCarI .cd.bad i u{background:linear-gradient(90deg,#ff7a6a,#ffb29a)}#s8career.gcOn .gcCarI .cd.bad{color:#ffb29a}
#s8career.gcOn.talk .gcCarI,#s8career.gcOn.talk .gcTier{opacity:0;pointer-events:none}
/* the choices: the main menu's tilted panel */
#s8career.gcOn .gcDlg{position:absolute;right:5vw;top:calc(50% - 10px);max-height:calc(100vh - 230px);display:flex;flex-direction:column;transform:translate(50px,-50%) perspective(1400px) rotateY(-9deg);transform-origin:right center;width:clamp(360px,31vw,540px);z-index:3;opacity:0;pointer-events:none;
 padding:clamp(12px,1.1vw,20px);box-sizing:border-box;border-radius:14px;background:linear-gradient(180deg,#2a2e33ec,#141619f2);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;transition:opacity .35s,transform .5s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcDlg.on{opacity:1;transform:translate(0,-50%) perspective(1400px) rotateY(-9deg);pointer-events:auto}
#s8career.gcOn .gcDlg h6:empty{display:none}
#s8career.gcOn .gcDlg h6{margin:2px 8px 10px;font:600 11px var(--gt);letter-spacing:.24em;color:var(--c);text-transform:uppercase;display:flex;align-items:center;gap:10px}
#s8career.gcOn .gcDlg h6 span{margin-left:auto;color:#9aa4b0;letter-spacing:.14em}
#s8career.gcOn .gcCh{display:flex;flex-direction:column;gap:7px;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;min-height:0;scrollbar-width:thin;padding:6px 6px 8px;margin:-6px -6px -8px}
#s8career.gcOn .gcRow{position:relative;flex:none;display:flex;align-items:center;gap:16px;height:clamp(44px,5.8vh,56px);padding:0 18px;border-radius:999px;cursor:pointer;overflow:hidden;font:300 clamp(17px,2.3vh,23px) var(--gt);color:#ffffffb0;transition:background .15s,color .15s}
#s8career.gcOn .gcRow .mi{flex:none;width:24px;height:24px;opacity:.7;transition:transform .3s cubic-bezier(.3,1.6,.5,1),opacity .15s}
#s8career.gcOn .gcRow em{margin-left:auto;font:500 12px var(--gt);letter-spacing:.12em;color:#ffffff80;font-style:normal}
#s8career.gcOn .gcRow:hover{color:#fff;background:#ffffff08;box-shadow:inset 0 1px 0 #ffffff1c}
#s8career.gcOn .gcRow.on{background:var(--gxa,linear-gradient(180deg,#8fb4d8 0%,#4f7eab 48%,#33608c 52%,#4a77a3 100%));color:#fff;text-shadow:0 1px 1px #0005;box-shadow:inset 0 1px 0 #ffffffa0,inset 0 -1px 0 #0004,0 0 0 1px #00000080,0 0 14px #4f7eab60}
#s8career.gcOn .gcRow.on .mi{opacity:1;transform:scale(1.15) rotate(-6deg)}#s8career.gcOn .gcRow.on em{color:#e8f0f7}
#s8career.gcOn .gcRow.on::after,#s8career.gcOn .gcO.on::after{content:"";position:absolute;top:0;bottom:0;left:-40%;width:35%;background:linear-gradient(100deg,transparent,#ffffff50,transparent);animation:gcShine 2.6s ease-in-out .2s infinite}
@keyframes gcShine{0%{left:-40%}45%,100%{left:120%}}
#s8career.gcOn .gcRow.off{opacity:.45}
#s8career.gcOn .gcDlg.fresh .gcCh>div{animation:gcIn .5s cubic-bezier(.16,.85,.25,1) var(--d,0ms) backwards}
@keyframes gcIn{from{opacity:0;transform:translateX(30px)}}
#s8career.gcOn .gcCh>div.hit{animation:gcHit .22s ease-out}
@keyframes gcHit{0%{transform:scale(1)}40%{transform:scale(.96);filter:brightness(1.6)}100%{transform:scale(1)}}
#s8career.gcOn .gcO{position:relative;flex:none;overflow:hidden;display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;padding:7px 12px;margin-bottom:0;border-radius:12px;cursor:pointer;background:#ffffff08;box-shadow:inset 0 1px 0 #ffffff24,0 0 0 1px #00000080;transition:box-shadow .15s,background .15s}
#s8career.gcOn .gcO.on{background:var(--gxa,linear-gradient(180deg,#4f7eabd0,#33608cd8));box-shadow:inset 0 1px 0 #ffffffa0,0 0 0 1px #00000080,0 0 14px #4f7eab60}#s8career.gcOn .gcO.on em,#s8career.gcOn .gcO.on small,#s8career.gcOn .gcO.on .pz u{color:#e8f0f7}
#s8career.gcOn .gcO canvas{width:96px;height:52px;border-radius:6px;background:#07090c}
#s8career.gcOn.pcv .gcCarI,#s8career.gcOn.pcv .gcTier,#s8career.gcOn.pcv #gcTag{opacity:0!important;pointer-events:none!important}
#s8career.gcOn .gcO .sw{width:96px;height:52px;border-radius:6px;background:#07090c center/cover no-repeat;display:grid;place-items:center;font:600 10px var(--gt);letter-spacing:.14em;color:#9aa4b0}
#s8career.gcOn .gcO em{font:600 9px var(--gt);letter-spacing:.2em;color:#8fb4d8;font-style:normal}
#s8career.gcOn .gcO em.bad{color:#ff9d90}
#s8career.gcOn .gcO>div{min-width:0}#s8career.gcOn .gcO b,#s8career.gcOn .gcO small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#s8career.gcOn .gcO b{display:block;font:500 16px var(--gt);color:#f2f4f6;margin:1px 0}
#s8career.gcOn .gcO small{display:block;font:400 11.5px var(--gt);color:#a9b2bc}
#s8career.gcOn .gcO .pz{text-align:right}#s8career.gcOn .gcO .pz u{display:block;text-decoration:none;font:600 9px var(--gt);letter-spacing:.2em;color:#9aa4b0}
#s8career.gcOn .gcO .pz i{font:700 15px var(--mn);color:var(--ac2);font-style:normal}#s8career.gcOn .gcO .pz s{display:block;font:400 11px var(--mn);color:#8c96a0}
#s8career.gcOn .gcO .cls{margin-left:6px}
/* tuning rows */
#s8career.gcOn .gcTu{flex:none;position:relative;overflow:hidden;display:grid;grid-template-columns:110px 1fr;gap:6px 14px;align-items:center;padding:9px 16px;border-radius:12px;cursor:pointer;transition:background .15s}
#s8career.gcOn .gcTu.on{background:#ffffff10;box-shadow:inset 0 0 0 1px #8fb4d880,0 0 18px #4f7eab50}
#s8career.gcOn .gcTu b{font:400 16px var(--gt);color:#eef1f4}
#s8career.gcOn .gcTu .seg{display:flex;align-items:center;gap:4px}
#s8career.gcOn .gcTu .seg i{flex:1;height:12px;border-radius:3px;background:#ffffff14;transition:background .2s,transform .2s}
#s8career.gcOn .gcTu .seg i.f{background:linear-gradient(180deg,#cfe2f5,#6f9cc8);box-shadow:0 0 8px #8fb4d870}
#s8career.gcOn .gcTu .seg i.z{background:#ffffff40}
#s8career.gcOn .gcTu .seg u{text-decoration:none;font:600 15px var(--gt);color:#9aa4b0;padding:0 6px;cursor:pointer}#s8career.gcOn .gcTu.on .seg u{color:#fff}
#s8career.gcOn .gcTu small{grid-column:2;display:flex;justify-content:space-between;font:600 9px var(--gt);letter-spacing:.18em;color:#7f8a95}
#s8career.gcOn .gcTu.bump .seg i.f{animation:gcBump .3s ease-out}
@keyframes gcBump{40%{transform:scaleY(1.6);filter:brightness(1.5)}}
/* the text box: portrait, name, line */
#s8career.gcOn .gcBox{position:absolute;left:5vw;bottom:84px;width:min(720px,50vw);z-index:3;display:flex;gap:16px;align-items:center;padding:14px 22px 14px 14px;box-sizing:border-box;border-radius:16px;
 background:linear-gradient(180deg,#1d2025eb,#121418f2);box-shadow:inset 0 1px 0 #ffffff30,0 0 0 1px #000,0 16px 40px #0009;opacity:0;transform:translateY(18px);pointer-events:none;transition:opacity .3s,transform .45s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcBox.on{opacity:1;transform:none;pointer-events:auto}
#s8career.gcOn .gcBox.pop{animation:gcPop .4s cubic-bezier(.16,.85,.25,1)}
@keyframes gcPop{from{opacity:0;transform:translateY(16px)}}
#s8career.gcOn .gcBox .pic{flex:none;align-self:flex-start;width:58px;height:58px;border-radius:50%;overflow:hidden;display:grid;place-items:center;font:300 26px var(--gt);color:#fff;background:#22262c;box-shadow:0 0 0 2px var(--c)}
#s8career.gcOn .gcBox .pic img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.25)}
#s8career.gcOn .gcBox.pop .pic{animation:gcPic .45s cubic-bezier(.3,1.5,.5,1)}
@keyframes gcPic{from{transform:scale(.7);opacity:0}}
#s8career.gcOn .gcBox .bx{flex:1;min-width:0}
#s8career.gcOn .gcBox .nm{display:flex;align-items:baseline;gap:10px;margin:0 0 4px}
#s8career.gcOn .gcBox .nm b{font:500 16px var(--gt);color:var(--c)}#s8career.gcOn .gcBox .nm small{font:500 10px var(--gt);letter-spacing:.18em;color:#8a939c;text-transform:uppercase}
#s8career.gcOn .gcBox .tx{margin:0;font:300 clamp(16px,2vh,19px)/1.5 var(--gt);color:#eef1f4;min-height:3em}
#s8career.gcOn .gcBox .tx .ghost{visibility:hidden}
#s8career.gcOn .gcBox .tx .cur{display:inline-block;width:2px;height:1.05em;margin:0 1px -3px;background:var(--c);animation:gcBlink .6s steps(2) infinite}
#s8career.gcOn .gcBox .nx{position:absolute;right:14px;bottom:10px;color:#ffffff60;font-style:normal;font-size:12px;opacity:0;transition:opacity .2s}#s8career.gcOn .gcBox .tx.done~.nx{opacity:1;animation:gcNx 1.2s ease-in-out infinite}
@keyframes gcNx{50%{transform:translateX(4px)}}
@keyframes gcBlink{50%{opacity:0}}
/* key hints like the main menu's */
#s8career.gcOn .gcPad{display:flex;gap:22px;justify-content:center;font:400 clamp(13px,1.5vh,16px) var(--gt);color:#e6e9ee}
#s8career.gcOn .gcPad span{display:flex;align-items:center;gap:8px}
#s8career.gcOn .gcPad u{text-decoration:none;min-width:22px;height:22px;padding:0 7px;box-sizing:border-box;border-radius:6px;display:grid;place-items:center;font:600 11px var(--gt);color:#e6e9ee;background:linear-gradient(180deg,#3a4048,#1a1d22);box-shadow:inset 0 1px 0 #ffffff40,0 0 0 1px #000,0 2px 0 #000}
/* the career menu: the main menu's panel, in the middle */
#s8career.gcOn .gcMenu{position:absolute;left:50%;top:50%;width:clamp(380px,32vw,560px);z-index:6;padding:clamp(12px,1.1vw,20px);box-sizing:border-box;border-radius:14px;background:linear-gradient(180deg,#2a2e33ec,#141619f2);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;
 opacity:0;pointer-events:none;transform:translate(-50%,-46%) scale(.96);transition:opacity .3s,transform .45s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcMenu.on{opacity:1;pointer-events:auto;transform:translate(-50%,-50%)}
#s8career.gcOn .gcMenu.fresh .gcCh>div{animation:gcIn .5s cubic-bezier(.16,.85,.25,1) var(--d,0ms) backwards}
#s8career.gcOn .gcPf2{display:flex;align-items:center;gap:14px;padding:6px 8px 14px;margin-bottom:8px;border-bottom:1px solid #ffffff14}
#s8career.gcOn .gcPf2 .av{width:46px;height:46px;border-radius:10px;display:grid;place-items:center;color:#fff;background:linear-gradient(180deg,#8fb4d8,#4f7eab 48%,#33608c 52%,#4a77a3);box-shadow:inset 0 1px 0 #ffffffa0,0 0 0 1px #000}
#s8career.gcOn .gcPf2 .av .mi{width:24px;height:24px}
#s8career.gcOn .gcPf2 b{display:block;font:400 20px var(--gt);color:#fff}#s8career.gcOn .gcPf2 small{display:block;font:400 11px var(--gt);color:#9aa4b0;margin-top:2px}
#s8career.gcOn.menu .gcTier,#s8career.gcOn.menu .gcCarI,#s8career.gcOn.menu .gcTag{opacity:0;pointer-events:none}
#s8career.gcOn .gcFoot{justify-content:center}
/* loading screen, built like the one at the start */
#s8career.gcOn .gcBub{position:absolute;z-index:3;max-width:300px;transform:translate(-50%,-100%) translateY(8px) scale(.9);transform-origin:50% 100%;pointer-events:none;opacity:0;padding:9px 14px 10px;border-radius:14px;font:400 14.5px/1.35 var(--gt);color:#f2f4f6;background:linear-gradient(180deg,#2c3036f2,#1b1e22f2);box-shadow:inset 0 1px 0 #ffffff30,0 0 0 1px #000a,0 8px 22px #0009;transition:opacity .2s,transform .25s cubic-bezier(.2,.9,.3,1.2)}
#s8career.gcOn .gcBub.on{opacity:1;transform:translate(-50%,-100%) translateY(-6px) scale(1)}
#s8career.gcOn .gcBub b{display:block;font:600 10px var(--gt);letter-spacing:.18em;text-transform:uppercase;color:var(--c);margin-bottom:2px}
#s8career.gcOn .gcBub::after{content:'';position:absolute;left:50%;bottom:-6px;width:12px;height:12px;margin-left:-6px;transform:rotate(45deg);background:#1b1e22;box-shadow:1px 1px 0 #000a}
#s8career.gcOn.cars .gcDlg{right:auto;left:5vw}#s8career.gcOn.cars .gcCarI{opacity:0}
#s8career.gcOn.ld>*{visibility:hidden}
#s8career.gcOn .gcSF{display:contents}
#s8career.gcOn .sfCar{cursor:default;background:#ffffff05}
#s8career.gcOn .sfAsk{height:auto;padding:10px 16px 8px;border-radius:16px;display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:10px}#s8career.gcOn .sfAsk>span{white-space:nowrap}
#s8career.gcOn .sfAsk u{text-decoration:none;display:grid;place-items:center;width:26px;height:26px;border-radius:8px;font:400 20px/1 var(--gt);background:#ffffff10;box-shadow:inset 0 1px 0 #ffffff24,0 0 0 1px #00000080;cursor:pointer}
#s8career.gcOn .sfAsk b{font:700 15px var(--gt);min-width:96px;text-align:center}#s8career.gcOn .sfAsk small{grid-column:1/-1;margin-top:0;font:600 9px var(--gt);letter-spacing:.18em;text-transform:uppercase;color:#9aa4b0}
#s8career.gcOn .sfIn{height:auto;padding:10px 16px 12px;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;gap:5px;cursor:text}#s8career.gcOn .sfIn>span{font:600 9px var(--gt);letter-spacing:.2em;text-transform:uppercase;color:#9aa4b0}
#s8career.gcOn .sfIn input,#s8career.gcOn .sfIn textarea{width:100%;box-sizing:border-box;resize:none;border:0;outline:0;padding:7px 10px;border-radius:8px;font:400 14px/1.35 var(--gt);color:#f2f4f6;background:#0007;box-shadow:inset 0 1px 3px #000a,0 0 0 1px #ffffff14}
#s8career.gcOn .sfIn input:focus,#s8career.gcOn .sfIn textarea:focus{box-shadow:inset 0 1px 3px #000a,0 0 0 1px var(--c)}
#s8career.gcOn .sfMeter{padding:8px 12px 10px;display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;animation:gcIn .4s both;animation-delay:var(--d)}
#s8career.gcOn .sfMeter small{font:600 9px var(--gt);letter-spacing:.2em;text-transform:uppercase;color:#c9d2d8}#s8career.gcOn .sfMeter b{font:700 16px var(--gt)}
#s8career.gcOn .sfMeter i{grid-column:1/-1;height:6px;border-radius:3px;background:#0008;box-shadow:inset 0 1px 2px #000;overflow:hidden}
#s8career.gcOn .sfMeter u{display:block;height:100%;width:var(--p,50%);border-radius:3px;background:linear-gradient(90deg,#4f7eab,#8fd0ff);transition:width .35s cubic-bezier(.2,.8,.2,1),background .3s}
#s8career.gcOn .sfMeter[data-l=good] u{background:linear-gradient(90deg,#3e9a62,#7ee3a0)}#s8career.gcOn .sfMeter[data-l=bad] u{background:linear-gradient(90deg,#a3403a,#ff8c7a)}
#s8career.gcOn .sfMeter[data-l=good] b{color:#7ee3a0}#s8career.gcOn .sfMeter[data-l=bad] b{color:#ff9d90}
#gcAnn{position:fixed;left:50%;top:78px;z-index:99990;display:flex;align-items:center;gap:14px;min-width:360px;max-width:min(560px,92vw);padding:12px 18px 12px 12px;border-radius:16px;color:#f2f4f6;font-family:var(--gt);cursor:pointer;
 background:linear-gradient(180deg,#30343af5 0%,#202327f5 50%,#1a1d21f5 100%);box-shadow:inset 0 1px 0 #ffffff38,0 0 0 1px #000c,0 14px 40px #000a;transform:translate(-50%,-30px) scale(.96);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.16,.9,.25,1.15),opacity .3s}
#gcAnn.on{transform:translate(-50%,0) scale(1);opacity:1;pointer-events:auto}
#gcAnn .pic{flex:none;width:48px;height:48px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:#22262c;box-shadow:0 0 0 2px #7fb6ff;font:300 22px var(--gt)}#gcAnn .pic img{width:100%;height:100%;object-fit:cover;transform:scale(1.25)}
#gcAnn .tx{flex:1;min-width:0}#gcAnn small{display:block;font:700 9px var(--gt);letter-spacing:.22em}#gcAnn small.ok{color:#7ee3a0}#gcAnn small.no{color:#ff9d90}
#gcAnn b{display:block;font:500 16px var(--gt);margin:2px 0}#gcAnn p{margin:0;font:400 12.5px/1.35 var(--gt);color:#b8c0c8}#gcAnn .cr{flex:none;font:700 17px var(--gt);color:#7ee3a0}#gcAnn .cr.neg{color:#ff9d90}
#gcPC{position:fixed;left:0;top:0;width:960px;height:610px;transform-origin:0 0;z-index:5;opacity:0;pointer-events:none;overflow:hidden;background:#f3f5f8;color:#1c2633;font:15px/1.35 Tahoma,Verdana,"Segoe UI",sans-serif;box-sizing:border-box}
#gcPC.live{pointer-events:auto}#gcPC *{box-sizing:border-box}
#gcPC .glare{position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,#ffffff1f 0%,#ffffff08 32%,transparent 46%),repeating-linear-gradient(0deg,#00000008 0 1px,transparent 1px 3px);box-shadow:inset 0 0 0 2px #0006}
#gcPC .app{position:absolute;inset:0;display:flex;flex-direction:column}
#gcPC .tb{flex:none;display:flex;align-items:center;gap:18px;height:56px;padding:0 18px;background:linear-gradient(#2d6bc0,#1f4f93);color:#fff;box-shadow:0 2px 0 #163c72}
#gcPC .logo{font:400 22px Tahoma,sans-serif;letter-spacing:-.01em}#gcPC .logo b{font-weight:700;color:#ffd75a}
#gcPC nav{display:flex;gap:6px;flex:1}#gcPC nav u{text-decoration:none;cursor:pointer;padding:7px 16px;border-radius:6px;font-weight:700;color:#d8e6fa}#gcPC nav u:hover{background:#ffffff1f;color:#fff}#gcPC nav u.on{background:#f3f5f8;color:#1f4f93}
#gcPC nav i{font-style:normal;display:inline-block;min-width:20px;margin-left:7px;padding:0 6px;border-radius:10px;background:#e2463b;color:#fff;font-size:12px;text-align:center}
#gcPC .cr{font-weight:700;color:#ffd75a}#gcPC .x{width:34px;height:34px;border:0;border-radius:6px;background:#ffffff1a;color:#fff;font-size:22px;cursor:pointer}#gcPC .x:hover{background:#e2463b}
#gcPC .bd{flex:1;min-height:0;overflow-y:auto;padding:16px 20px;scrollbar-width:thin}
#gcPC h2{margin:0 0 12px;font:700 20px Tahoma,sans-serif;color:#1f4f93}#gcPC h2 small{font-size:13px;font-weight:400;color:#6b7788;margin-left:8px}#gcPC h3{margin:16px 0 8px;font-size:14px;color:#6b7788;text-transform:uppercase;letter-spacing:.08em}
#gcPC .list{display:flex;flex-direction:column;gap:8px}
#gcPC .it{display:flex;align-items:center;gap:14px;padding:8px 12px;background:#fff;border:1px solid #d3dae4;border-radius:8px}
#gcPC .it.conv{cursor:pointer}#gcPC .it.conv:hover{border-color:#2d6bc0;background:#f6f9fe}#gcPC .it.conv.new{border-left:4px solid #e2463b}
#gcPC .th{flex:none;width:112px;height:62px;border-radius:5px;background:#0b0d10 center/cover no-repeat}
#gcPC .nf{flex:1;min-width:0}#gcPC .nf b{display:block;font-size:16px}#gcPC .nf small{display:block;color:#5d6a7c;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#gcPC .nf em{color:#c0392b;font-style:normal}#gcPC .nf .nw{color:#8a95a5}
#gcPC .cls{display:inline-block;margin-left:6px;padding:0 6px;border-radius:4px;background:#1c2633;color:#fff;font-size:11px;vertical-align:2px}
#gcPC .pr{flex:none;text-align:right;min-width:120px}#gcPC .pr b{display:block;font-size:18px;color:#1c2633}#gcPC .pr s{display:block;color:#8a95a5;font-size:13px}#gcPC .pr em{display:block;font-style:normal;font-size:11px;font-weight:700;color:#2e8b3a;text-transform:uppercase}#gcPC .pr small{display:block;color:#8a95a5;font-size:11px;text-transform:uppercase}
#gcPC .bt{flex:none;display:flex;flex-direction:column;gap:5px}
#gcPC button{font:700 14px Tahoma,sans-serif;cursor:pointer;padding:7px 16px;border-radius:6px;border:1px solid #1f4f93;background:linear-gradient(#3b7fd6,#2459a8);color:#fff}#gcPC button:hover{background:linear-gradient(#4b8fe6,#2d69bb)}
#gcPC button.ghost{background:#fff;color:#1f4f93;border-color:#aebbd0}#gcPC button.ghost:hover{background:#eef4fd}#gcPC button:disabled{opacity:.45;cursor:default}
#gcPC .empty{color:#6b7788;padding:30px;text-align:center}
#gcPC .av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(#5d97e0,#2459a8);color:#fff;font:700 20px Tahoma,sans-serif}
#gcPC .chat{display:flex;flex-direction:column;height:100%;margin:-16px -20px;}
#gcPC .ch{display:flex;align-items:center;gap:12px;padding:10px 16px;background:#fff;border-bottom:1px solid #d3dae4}#gcPC .ch b{display:block;font-size:17px}#gcPC .ch small{color:#5d6a7c}#gcPC .ch .back{padding:5px 10px;margin-right:6px}
#gcPC .px{display:flex;background:#fff;border-bottom:1px solid #d3dae4}#gcPC .px span{flex:1;padding:6px 10px;text-align:center;border-right:1px solid #e3e8ee}#gcPC .px span.on{background:#eef5ff}#gcPC .px u{display:block;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:.1em;color:#7a8698}#gcPC .px b{font-size:16px}
#gcPC .msgs{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:12px 16px;background:#e9edf2;scrollbar-width:thin}
#gcPC .m{max-width:72%;padding:8px 13px;border-radius:14px;white-space:pre-wrap}#gcPC .m.them{align-self:flex-start;background:#fff;border:1px solid #cfd6df;border-bottom-left-radius:4px}
#gcPC .m.me{align-self:flex-end;background:linear-gradient(#3b7fd6,#2459a8);color:#fff;border-bottom-right-radius:4px}#gcPC .m.note{align-self:center;padding:3px 12px;background:#c9d2de;color:#3d4a5a;font-size:12px;font-weight:700;letter-spacing:.05em}
#gcPC .m.typing{color:#8692a0;font-style:italic;animation:gcTxBlink .8s steps(2) infinite}@keyframes gcTxBlink{50%{opacity:.35}}
#gcPC .opts{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px;background:#fff;border-top:1px solid #d3dae4}#gcPC .opts:empty{display:none}#gcPC .opts button em{font-style:normal;display:inline-block;width:18px;height:18px;margin-right:7px;border-radius:50%;background:#fff;color:#2459a8;font-size:11px;line-height:18px;text-align:center}
#gcPC .form{display:flex;flex-direction:column;gap:12px;max-width:640px}#gcPC .row label{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7788;margin-bottom:4px}
#gcPC input,#gcPC textarea{width:100%;font:15px Tahoma,sans-serif;padding:8px 10px;border:1px solid #aebbd0;border-radius:6px;background:#fff;color:#1c2633;resize:none;outline:0}#gcPC input:focus,#gcPC textarea:focus{border-color:#2d6bc0;box-shadow:0 0 0 2px #2d6bc033}
#gcPC .ask{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#gcPC .ask b{font-size:22px;min-width:150px;text-align:center}#gcPC .ask small{width:100%;color:#6b7788}#gcPC .ask button{width:40px;padding:5px 0;font-size:18px}
#gcPC .meter{display:flex;align-items:center;gap:12px}#gcPC .meter span{font-size:13px;color:#6b7788}#gcPC .meter i{flex:1;height:12px;border-radius:6px;background:#d6dde6;overflow:hidden}#gcPC .meter u{display:block;height:100%;background:#2e8b3a;transition:width .3s}
#gcPC .meter[data-l=ok] u{background:#d9a21b}#gcPC .meter[data-l=bad] u{background:#c0392b}#gcPC .meter b{font-size:18px;min-width:50px}#gcPC .form .bt{flex-direction:row}
@keyframes gcLdIn{from{opacity:0}}
@keyframes gcLdPan{to{transform:translateX(8%)}}
@keyframes gcLdT{from{letter-spacing:.4em;opacity:0}}@keyframes gcSheen{0%{background-position:100% 0}60%,100%{background-position:-60% 0}}
@keyframes gcLdUp{from{opacity:0;transform:translateY(16px)}}
#resBox .gcRes{display:flex;gap:14px;align-items:center;margin:4px 0 14px;padding:12px 16px;border-radius:10px;background:linear-gradient(180deg,rgba(62,68,76,.6),rgba(22,25,29,.8));box-shadow:inset 0 0 0 1px #ffffff14}
#resBox .gcRes small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#7fb6ff}#resBox .gcRes p{margin:3px 0 0;font:400 14px/1.4 var(--gt);color:#eef1f4}
#resBox .gcRes .gcPz{margin-left:auto;text-align:right;font:700 16px var(--mn);color:var(--ac2);white-space:nowrap}#resBox .gcRes .gcPz.no{color:#9aa4b0}
`;
{const st=document.createElement('style');/* the theme squares every corner (*{border-radius:0!important}), so ours need !important too */st.textContent=CSS.replace(/border-radius:([^;}!]+)(?=[;}])/g,'border-radius:$1!important');document.head.appendChild(st)}

const sec=$('s8career');
/* who: null (overview), 'red' or 'vin'. view: talk, offers, mkt, cars, tune. ch: a one-off list of answers (a question she asked), f: focused row,
   tag: keyboard focus in the overview (0 Nina, 1 the car, 2 Vince) */
const UI={who:null,view:'talk',f:0,tag:1,line:'',res:null,ch:null,menu:null};
const TAGK=['red','car','vin','pc'];
function hdr(){const g=G(),T=TIERS[tierOf(g.rep)];return `<div class="hdr"><h2>CAREER <em>${T.n}</em></h2><small>${g.wins} cleared &middot; ${fmtCr(g.earned)} earned</small><div class="sp"></div><div class="crbox"><small>CREDITS</small><b class="crv">${fmtCr(P.SV().cr)}</b></div></div>`}
const carInfo=()=>{const c=curCar(),w=wearOf(c.id);let th='';try{th=P.carThumb?P.carThumb(c.id):''}catch(e){}return `<div class="th" style="${th?'background-image:url('+th+')':''}"></div><div><small>CURRENT CAR</small><b>${c.car.name} <span class="cls ${c.car.cls}">${c.car.cls}</span></b><div class="cd${w>.2?' bad':''}"><i><u style="width:${pctOK(c.id)}%"></u></i>Condition ${pctOK(c.id)}%</div></div>`};
function render(){P.gcRun=null;sec.classList.add('gcOn');buildScene().then(()=>{setCar()});setCar();const g=G();fillOffers();mktFill();const ti=tierOf(g.rep),T=TIERS[ti],nx=TIERS[ti+1];
 const prog=nx?Math.max(0,Math.min(1,(g.rep-T.rep)/(nx.rep-T.rep))):1;
 sec.innerHTML=hdr()+`<div class="gcVig"></div><div class="gcTier"><b>${T.n}</b><div class="bar"><i style="width:${Math.round(prog*100)}%"></i></div><small>${nx?g.rep+' / '+nx.rep+' rep to '+nx.n:'Top tier'}</small></div>
 <div class="gcTag" id="gcTag"></div><div class="gcBub" id="gcBub"></div><div class="gcCarI" id="gcCarI">${carInfo()}</div>
 <div class="gcDlg" id="gcDlg"></div><div class="gcBox" id="gcBox"><div class="pic"></div><div class="bx"><div class="nm"><b></b><small></small></div><p class="tx"></p></div><i class="nx">&#9656;</i></div>
 <div class="foot8 gcFoot"><div class="gcPad" id="gcHint"></div></div><div class="gcMenu" id="gcMenu"></div>`;
 const ci=$('gcCarI');if(ci)ci.onclick=()=>{if(!UI.who&&!onCar()&&!UI.menu)act('car')};
 if(UI.who)talk(UI.who,true,UI.line);else{aim();hint()}}
function hint(){const h=$('gcHint');if(!h)return;sec.classList.toggle('talk',!!UI.who||onCar());sec.classList.toggle('cars',UI.view==='cars');
 const k=(a,b)=>`<span><u>${a}</u>${b}</span>`;
 sec.classList.toggle('pcv',UI.view==='pc');h.innerHTML=UI.view==='pc'?k('Click','Select')+k('1-4','Reply')+k('Esc','Back'):UI.menu?k('&uarr;&darr;','Choose')+k('Enter','Select')+k('Esc','Close'):!UI.who&&!onCar()?k('&larr;&rarr;','Look around')+k('Enter','Select')+k('Esc','Menu'):UI.view==='tune'?k('&uarr;&darr;','Choose')+k('&larr;&rarr;','Adjust')+k('Esc','Done'):k('&uarr;&darr;','Choose')+k('Enter','Select')+k('Esc','Back')}

/* ---------------- talking ---------------- */
const fixCost=id=>repairCost(id),tuneFee=()=>{const c=curCar().car;return Math.max(400,Math.round((c.price||30000)*.015/50)*50)};
function choices(){if(UI.ch)return UI.ch;const c=curCar();if(UI.who==='red'){const cost=fixCost(c.id),L=[];
  if(cost)L.push({ic:'fix',t:'Fix the damage',pz:fmtCr(cost),off:P.SV().cr<cost,a:()=>{const sv=P.SV();if(sv.cr<cost){say(`That's ${fmtCr(cost)}. Win a race and come back.`);return}sv.cr-=cost;$$crv();fadeDo(()=>{G().wear[c.id]=0;P.save();setCar(true);refreshCar();say(rnd([`Done. Good as new.`,`All fixed. Keep it off the walls this time.`]));drawDlg()},420)}});
  /* a bad respray can be stripped back to the factory colour. That's the only colour she does */
  if(paintOf(c.id)){const pc=1200;L.push({ic:'paint',t:'Repaint it (factory colour)',pz:fmtCr(pc),off:P.SV().cr<pc,a:()=>{const sv=P.SV();if(sv.cr<pc){say(`Paint costs ${fmtCr(pc)}. You'll have to live with it for now.`);return}sv.cr-=pc;$$crv();UI.ch=null;fadeDo(()=>{setPaint(c.id,null);setCar(true);refreshCar();say(rnd([`Back to the factory colour. Much better. My eyes thank you.`,`There. Now it looks like a car and not a crime scene.`,`Stripped that shit off and did it properly. Factory colour, nothing fancy.`]));drawDlg()},420)}})}
  L.push({ic:'tune',t:'Tune my car',a:askTune});
  L.push({ic:'swap',t:'Bring out another car',a:openCars});
  L.push({ic:'look',t:'How is the car looking?',a:()=>{const w=wearOf(c.id),T=TIERS[tierOf(G().rep)];let s=w>.02?`It's at ${pctOK(c.id)}%. ${w>.3?'It\'ll feel slow until I fix it.':'Nothing serious.'}`:`It's in perfect shape.`;
   if(CLS.indexOf(c.car.cls)<CLS.indexOf(T.cl[0]))s+=` But it's a class ${c.car.cls} car, and the ${T.n} races are getting faster. Talk to Vince.`;else s+=` A tune would help more than you'd think.`;say(s)}});
  L.push({ic:'tip',t:'Any tips?',a:()=>say(rnd(TIPS))});L.push({ic:'bye',t:'See you later',a:()=>leave()});return L}
 return[{ic:'race',t:'What races have you got?',a:()=>{UI.view='offers';UI.f=0;const o=G().offers[0];if(o)setLine(pitch(o))}},
  {ic:'shop',t:'Marketplace',pz:'COMPUTER',a:()=>{UI.ch=null;say(rnd([`It's all on the computer. Go have a look.`,`Laptop's on the cart. Knock yourself out.`]));setTimeout(()=>{if(UI.who==='vin'){leave();openPC('buy')}},900);return;const l=G().mkt[0];setLine(rnd([`Marketplace. Older stuff, cheap. Some of it even runs.`,`Got a few used ones. No refunds.`,`These need a bit of love. Nina likes that sort of thing.`])+(l?' ':''))}},
  {ic:'car',t:'Brand Central',pz:'NEW',a:()=>{UI.line='';P.ui.openShow('brand',{player:0,cap:null,ret:'s8career'})}},
  {ic:'chart',t:'How am I doing?',a:()=>{const g=G(),ti=tierOf(g.rep),nx=TIERS[ti+1];say(`${TIERS[ti].n}. ${g.wins} cleared, ${fmtCr(g.earned)} earned.`+(nx?` ${nx.rep-g.rep} more and the ${nx.n} people call.`:` Nobody's above you.`)+' '+moneyLine())}},
  {ic:'bye',t:'See you later',a:()=>leave()}]}
/* a short black fade around anything that changes the car (bringing one out, buying, selling the one you have, paint, repairs, tuning):
   the screen goes black, the change happens out of sight, the new car gets a couple of frames to draw, and the room fades back up */
const FD={el:null,on:false};
function fadeDo(fn,hold){if(FD.on){try{fn()}catch(e){console.warn(e)}return}FD.on=true;if(!FD.el){FD.el=document.createElement('div');FD.el.id='gcFade';FD.el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:99980;transition:opacity .28s ease';document.body.appendChild(FD.el)}
 const el=FD.el;el.style.transition='opacity .28s ease';el.style.pointerEvents='auto';void el.offsetWidth;el.style.opacity='1';P.sfx&&P.sfx('move');
 setTimeout(()=>{try{fn()}catch(e){console.warn('career fade',e)}let n=0;const tk=()=>{if(++n<4)return requestAnimationFrame(tk);setTimeout(()=>{el.style.transition='opacity .5s ease';el.style.opacity='0';el.style.pointerEvents='none';FD.on=false},hold||260)};requestAnimationFrame(tk)},300)}
/* tuning costs: she asks first, then the tuning bench */
function askTune(){const fee=tuneFee();say(rnd([`I can tune it, but it's gonna cost you. ${fmtCr(fee)}.`,`Tuning? Sure. Not free though. ${fmtCr(fee)}.`,`I can make it faster. ${fmtCr(fee)}, and that's the friends price.`]));
 UI.ch=[{ic:'tune',t:'Do it',pz:fmtCr(fee),off:P.SV().cr<fee,a:()=>{const sv=P.SV();if(sv.cr<fee){UI.ch=null;say(`You're short. ${fmtCr(fee-sv.cr)} short. Go win something.`);return}sv.cr-=fee;P.save();$$crv();UI.ch=null;fadeDo(()=>{UI.view='tune';UI.f=0;aim();GS.cp.copy(GS.tp);GS.cl.copy(GS.tl);
   say(rnd([`Alright, let's see what we've got. Tell me what you want changed.`,`Hand me that wrench. Okay. What are we doing?`]));drawDlg();hint()})}},
  {ic:'back',t:'Maybe later',a:()=>{UI.ch=null;say(rnd([`Your call.`,`Fine. It's not getting any faster on its own, though.`]))}}];UI.f=0}
function tuneAdj(i,d){const T=P.TUNE[i];if(!T)return;const c=curCar(),t=P.tuneGet(c.id,c.alt),v=Math.max(-T.r,Math.min(T.r,t[T.k]+d));if(v===t[T.k])return;P.tuneSet(c.id,c.alt,T.k,v);P.sfx&&P.sfx('move');
 const L=TUNE_L[T.k];setLine(v===0?rnd([`Back to stock on the ${T.n.toLowerCase()}.`,`Stock ${T.n.toLowerCase()}. Boring, but it works.`]):L[d>0?1:0]);UI.f=i;drawDlg(true);const r=sec.querySelector('.gcTu[data-i="'+i+'"]');if(r){r.classList.remove('bump');void r.offsetWidth;r.classList.add('bump')}}
function tuneDone(){fadeDo(()=>{UI.view='talk';UI.f=0;aim();GS.cp.copy(GS.tp);GS.cl.copy(GS.tl);say(rnd([`There. Go break something. Not the car, though.`,`Done. If it handles badly, that's on you, not me.`,`All set. Damn, that sounds good.`]));drawDlg();hint()})}
/* the cars you own, one click to bring one out */
function owned(){const own=P.SV().owned||{},cur=curCar();const L=P.CARS.filter(c=>own[c.id]&1&&!listed(c.id)).map(c=>({id:c.id,alt:0,car:c}));if(!L.some(x=>x.id===cur.id))L.unshift({id:cur.id,alt:cur.alt,car:cur.car});return L}
function openCars(){UI.who='red';UI.view='cars';UI.ch=null;const L=owned(),cur=curCar();UI.f=Math.max(0,L.findIndex(x=>x.id===cur.id));aim();
 say(rnd([`Which one do you want out?`,`Pick one. I'll roll it out.`,`Which one? Hurry up, I've got stuff to do.`]));drawDlg();hint()}
function bringOut(i){const x=owned()[i];if(!x)return;const was=curCar().id;if(x.id===was){bringOut_(x);return}fadeDo(()=>{P.setSel(0,x.id,x.alt);setCar();refreshCar();bringOut_(x);GS.cp.copy(GS.tp);GS.cl.copy(GS.tl)},420)}
function bringOut_(x){
 /* back to the overview; Nina says it over her head. A car that looks like shit (bad paint, or worn out) gets an insult instead */
 const ugly=!!paintOf(x.id)||pctOK(x.id)<55;UI.who=null;UI.view='talk';UI.ch=null;UI.f=0;UI.line='';aim();const d=$('gcDlg');if(d)d.classList.remove('on');hint();P.sfx&&P.sfx('select');
 bubble('red',withName(ugly?rnd(ROAST):rnd(GOT).replace('%s',x.car.name),.4),ugly?3.4:3);gesture(GS.red,ugly?rnd(['point','shrug']):'hey')}
const ROAST=[`What the FUCK is that?`,`Jesus Christ, that's ugly.`,`Oh hell no. Get that piece of shit out of here.`,`That is fucking disgusting.`,`Are you fucking kidding me?`,`What the hell did you drag in here?`,`God, that's hideous.`,`Ew. No. What the fuck.`,`That thing is a goddamn eyesore.`];
/* ---------------- selling through Vince ----------------
   Marketplace > Sell one of yours: pick a car (not your last one), set the asking price, write a title and a description. The chance meter is
   the odds a buyer bites: it falls fast once you ask more than the car is worth (its value drops with wear and a bad paintjob), and a title and
   a proper description push it back up. A listed car goes to Vince's lot (it can't be driven) and the result comes in a minute or two later,
   as an announcement anywhere in the game except mid-race (it waits until you're back) */
const sales=()=>{const g=G();if(!Array.isArray(g.sales))g.sales=[];return g.sales};
const listed=id=>sales().some(s=>s.id===id);
const carValue=id=>{const c=BYID[id];if(!c)return 0;return Math.max(500,Math.round((c.price||30000)*(.33+.3*(1-wearOf(id)))*(paintOf(id)?.85:1)/50)*50)};
function sellChance(id,ask,title,desc){const v=carValue(id),r=ask/Math.max(1,v);let p=1/(1+Math.exp((r-1.12)*8));
 /* a title and a description add up to 10 points, no more */
 const t=(title||'').trim(),w=(desc||'').trim().split(/\s+/).filter(x=>x.length>1).length;const b=(t.length>=4?.3:0)+(t.length>=14?.2:0)+Math.min(.5,w*.025);
 return Math.max(.02,Math.min(.97,p+.1*b))}
function sellable(){const cur=curCar().id;return owned().filter(x=>!listed(x.id))}
function openSell(){UI.view='sell';UI.f=0;const n=sellable().length;say(n<2?rnd([`That's your only car. What are you gonna drive, a bus?`,`You need something to drive. Keep it.`]):rnd([`Which one's going?`,`Sure. Which one?`,`I'll put it on the lot. Which one?`]));drawDlg();hint()}
function sellRows(){const L=sellable(),S=sales();return{L,S,n:L.length+S.length+1}}
function pickSell(i){const {L,S}=sellRows();if(i<L.length){if(L.length<2){say(`That's your only car. Not happening.`);return}const x=L[i],v=carValue(x.id);
  UI.sf={id:x.id,ask:v,title:'',desc:''};UI.view='sellForm';UI.f=0;say(rnd([`Worth about ${fmtCr(v)}, give or take. Ask too much and nobody calls.`,`I'd say ${fmtCr(v)}, your call.`]));drawDlg();hint();return}
 const s=S[i-L.length];if(s){/* pull a listing */const k=sales().indexOf(s);if(k>=0)sales().splice(k,1);P.save();say(`Pulled it. It's back in the garage.`);drawDlg();hint();return}
 UI.view='mkt';UI.f=G().mkt.length;say(`Sure.`);drawDlg();hint()}
const sfStep=v=>Math.max(250,Math.round(v*.04/50)*50);
function sfAdj(d){const f=UI.sf;if(!f)return;const v=carValue(f.id);f.ask=Math.max(250,Math.min(v*4,f.ask+d*sfStep(v)));P.sfx&&P.sfx('move');sfPaint()}
function sfPaint(){const f=UI.sf,d=$('gcDlg');if(!f||!d)return;const v=carValue(f.id),p=sellChance(f.id,f.ask,f.title,f.desc),pc=Math.round(p*100);
 const a=d.querySelector('.sfAsk b');if(a)a.textContent=fmtCr(f.ask);const m=d.querySelector('.sfMeter');if(m){m.style.setProperty('--p',pc+'%');m.dataset.l=pc>=70?'good':pc>=40?'ok':'bad';m.querySelector('b').textContent=pc+'%';
  m.querySelector('small').textContent=pc>=80?'Should go quick':pc>=55?'Decent odds':pc>=30?'Might sit a while':'Long shot'}
 const r=d.querySelector('.sfAsk small');if(r){const q=f.ask/v;r.textContent=q>1.25?'Way over value':q>1.05?'Over value':q<.85?'Under value':'About right'}}
function sfList(){const f=UI.sf;if(!f)return;const p=sellChance(f.id,f.ask,f.title,f.desc),ok=Math.random()<p,c=BYID[f.id];
 sales().push({id:f.id,ask:f.ask,title:(f.title||'').trim().slice(0,60),ch:p,ok,due:Date.now()+(35+Math.random()*70)*1000*(ok?1:1.4)});
 if(curCar().id===f.id){const o=sellable().find(x=>x.id!==f.id);if(o)fadeDo(()=>{P.setSel(0,o.id,o.alt);setCar();refreshCar()},420)}P.save();UI.sf=null;UI.view='talk';UI.f=0;
 const q=f.ask/carValue(f.id);say(q>1.3?rnd([`Listed. At that price? Good luck.`,`It's up. Don't hold your breath.`]):q<.85?rnd([`Listed. You're basically giving it away.`,`It's up. Cheap. It'll go.`]):rnd([`It's on the lot. I'll let you know.`,`Listed. Someone will call. Probably.`]));P.sfx&&P.sfx('select');drawDlg();hint()}
function sfHtml(){const f=UI.sf,c=BYID[f.id],v=carValue(f.id),on=i=>UI.f===i?' on':'';
 return `<div class="gcO sfCar" style="--d:40ms"><div class="sw" data-car="${f.id}"></div><div><em>VALUE ${fmtCr(v)}</em><b>${esc_(c.name)}<span class="cls ${c.cls}">${c.cls}</span></b><small>Condition ${pctOK(f.id)}%${paintOf(f.id)?' &middot; bad paint':''}</small></div><div class="pz"></div></div>
 <div class="gcRow sfAsk${on(0)}" data-i="0" style="--d:90ms"><span>Asking price</span><u data-d="-1">&lsaquo;</u><b>${fmtCr(f.ask)}</b><u data-d="1">&rsaquo;</u><small></small></div>
 <label class="gcRow sfIn${on(1)}" data-i="1" style="--d:140ms"><span>Title</span><input maxlength="60" placeholder="e.g. Clean ${esc_(c.name.split(' ').slice(-1)[0])}, runs great" value="${esc_(f.title)}"></label>
 <label class="gcRow sfIn sfTa${on(2)}" data-i="2" style="--d:190ms"><span>Description</span><textarea maxlength="400" rows="3" placeholder="Mileage, history, what's been done to it...">${esc_(f.desc)}</textarea></label>
 <div class="sfMeter" style="--d:240ms"><small></small><b></b><i><u></u></i></div>
 <div class="gcRow${on(3)}" data-i="3" style="--d:290ms">${svgI('ok')}<span>List it</span></div>
 <div class="gcRow${on(4)}" data-i="4" style="--d:330ms">${svgI('back')}<span>Cancel</span></div>`}
function sfWire(d){const f=UI.sf;if(!f)return;const ti=d.querySelector('.sfIn input'),ta=d.querySelector('.sfIn textarea');
 const keys=(el,i)=>{el.oninput=()=>{if(i===1)f.title=el.value;else f.desc=el.value;sfPaint()};el.onfocus=()=>{UI.f=i;d.querySelectorAll('.gcCh .gcRow').forEach(e=>e.classList.toggle('on',+e.dataset.i===i))};
  el.onkeydown=e=>{if(e.key==='Escape'){el.blur();e.stopPropagation();e.preventDefault();return}if((e.key==='Enter'&&i===1)||(e.key==='ArrowDown'&&(i===1||el.selectionStart===el.value.length))){e.preventDefault();el.blur();focusC(i+1)}else if(e.key==='ArrowUp'&&(i===1||el.selectionStart===0)){e.preventDefault();el.blur();focusC(i-1)}e.stopPropagation()}};
 if(ti)keys(ti,1);if(ta)keys(ta,2);d.querySelectorAll('.sfAsk u[data-d]').forEach(u=>u.onclick=ev=>{ev.stopPropagation();sfAdj(+u.dataset.d)});sfPaint()}
/* ---------------- the computer: Marketplace and messages ----------------
   Click the laptop on the cart and the camera goes up to it; the Marketplace runs on its screen (the page is laid onto the screen's four
   corners every frame, so it sits in the room in perspective). Three tabs: Buy (used listings, buy one or message the seller), Sell (list one of
   yours with a price, a title and a description, pull a listing), Messages (every conversation, kept in the save, open any of them any time).
   Haggling: everybody is stubborn. A seller never comes down more than 5,000 (less on cheap cars) and a buyer never offers more than 5,000
   under your price; the closer they get to that line the less they move and the more they complain. Five texts at most per conversation.
   Everyone gives reasons: buyers point at paint, wear and mileage, sellers at condition, original paint and what a new one costs. */
const r50=v=>Math.round(v/50)*50;
/* reasons: what's wrong with it (used by whoever is buying) and what's right with it (used by whoever is selling), from the car itself */
function flaws(x){const L=[];if(x.bad)L.push(`The paint is a disaster, that's ${fmtCr(1200)} just to fix that.`,`Who painted it? I'd have to redo it.`);
 if(x.cond<.6)L.push(`It's at ${Math.round(x.cond*100)}%. That's a lot of work.`,`Condition's rough, ${Math.round(x.cond*100)}%. It needs a mechanic.`);else if(x.cond<.85)L.push(`It's not perfect, ${Math.round(x.cond*100)}% condition.`);
 if(x.km>120000)L.push(`It's done ${Math.round(x.km/1000)}k km.`);
 L.push(`I've seen cheaper ones around.`,`Cash, today, no messing around.`,`That's all I've got budgeted.`);return L}
function strengths(x){const L=[];if(x.cond>=.85)L.push(`It's in great shape, ${Math.round(x.cond*100)}%.`,`Nothing wrong with it. At all.`);if(!x.bad)L.push(`Original paint, never touched.`);
 if(x.price<x.nw*.6)L.push(`A new one is ${fmtCr(x.nw)}. This is already a steal.`);if(x.km&&x.km<60000)L.push(`Only ${Math.round(x.km/1000)}k km on it.`);
 L.push(`I've had other people asking.`,`It drives perfect.`,`I'm not giving it away.`);return L}
/* how far someone will move: most of the time a little, sometimes not at all, and hardly anything once they're near their limit */
function budge(cur,lim,gap,dir){const room=Math.abs(cur-lim);if(room<50)return cur;const near=room<Math.max(600,Math.abs(lim-(dir>0?lim-5000:lim+5000))*.25)||false;
 if(Math.random()<(near?.55:.3))return cur;const step=Math.min(room,Math.max(100,Math.abs(gap)*(near?.15:.35)));return r50(cur+dir*step)}
const CV=()=>{const g=G();if(!Array.isArray(g.conv))g.conv=[];return g.conv};
let cvSeq=0;const uid=()=>Date.now().toString(36)+(cvSeq++).toString(36);
const NB=['Dale','Marco','Steph','Big Mike','Ronnie','Trish','Gus','Lena'],NS=['Kev','Jordan','Priya','Tommo','Sal','Nadia','Rick','Unknown'];
const clean=t=>String(t).replace(/Cr\.\./g,'Cr.');
function cvPost(cv,me,t,delay){cv.log.push({me:me?1:0,t:clean(t),at:Date.now()+(delay||0)});cv.n++;cv.ts=Date.now()+(delay||0);P.save()}
function cvNote(cv,t,delay){cv.log.push({note:1,t:clean(t),at:Date.now()+(delay||0)});P.save()}
const cvPending=cv=>cv.log.some(m=>m.at>Date.now());
const cvSeen=cv=>cv.log.filter(m=>m.at<=Date.now()).length;
const cvUnread=cv=>cv.log.some((m,i)=>!m.me&&m.at<=Date.now()&&i>=(cv.rd||0));
const cvListing=cv=>G().mkt&&G().mkt.find(l=>l.uid===cv.lid);
const cvSale=cv=>sales().find(s=>s.uid===cv.sid);
const lagT=()=>1200+Math.random()*900;
/* buying: you message the seller from the listing */
function cvBuy(l){if(!l.uid)l.uid=uid();let cv=CV().find(c=>c.kind==='buy'&&c.lid===l.uid);if(cv)return cv;const c=BYID[l.id],P0=l.price,D=Math.min(5000,r50(Math.max(250,P0*.15)));
 cv={id:uid(),kind:'buy',lid:l.uid,car:l.id,who:rnd(NB),nw:c.price||P0,base:P0,cur:P0,lim:P0-D,D,x:{cond:l.cond,km:l.km,bad:!!(l.L||l.bad),nw:c.price||P0,price:P0},log:[],n:0,st:'open',rd:0,ts:Date.now()};
 CV().push(cv);l.tx=1;P.save();return cv}
/* selling: a buyer messages you about a listing */
function cvSell(s){if(!s.uid)s.uid=uid();const c=BYID[s.id],A=s.ask,D=Math.min(5000,r50(Math.max(250,A*.15))),off=Math.max(A-D,A-r50(D*(.5+Math.random()*.5))),cap=Math.min(A,r50(off+(A-off)*(.35+Math.random()*.4)));
 const cv={id:uid(),kind:'sell',sid:s.uid,car:s.id,who:rnd(NS),nw:(c&&c.price)||A,base:A,cur:off,lim:cap,D,x:{cond:1-wearOf(s.id),km:0,bad:!!paintOf(s.id),nw:(c&&c.price)||A,price:A},log:[],n:0,st:'open',rd:0,ts:Date.now()};
 CV().push(cv);cvPost(cv,0,rnd([`Hey, saw your ${s.title?'"'+s.title+'"':c.name}. Would you take ${fmtCr(off)}?`,`Is the ${c.name} still available? I can do ${fmtCr(off)} cash.`,`${fmtCr(off)} for the ${c.name}? Can pick up today.`])+' '+rnd(flaws(cv.x)));
 while(CV().length>14){const i=CV().findIndex(q=>q.st!=='open');if(i<0)break;CV().splice(i,1)}
 announce({ok:1,tag:'NEW MESSAGE',h:`${cv.who}, about your ${c.name}`,p:cv.log[0].t,cv:cv.id});P.save();if(PC.on)pcDraw()}
/* what you can say next */
function cvOpts(cv){if(cv.st!=='open'||cvPending(cv))return[];const L=[],A=cv.cur;
 if(cv.kind==='buy'){const offs=[A-r50(A*.05),A-r50(A*.1),A-r50(A*.2)].filter((v,i,a)=>v>0&&v<A&&a.indexOf(v)===i);
  if(cv.n===0)return offs.map(v=>({t:`Offer ${fmtCr(v)}`,a:()=>cvBuyOffer(cv,v)}));
  if(cv.n>=4)return[{t:`OK, ${fmtCr(A)}`,a:()=>cvBuyDeal(cv,A,true)},{t:'No thanks',a:()=>cvEnd(cv,`No thanks. Good luck with it.`)}];
  return[{t:`OK, ${fmtCr(A)}`,a:()=>cvBuyDeal(cv,A,true)}].concat(offs.slice(0,2).map(v=>({t:`Offer ${fmtCr(v)}`,a:()=>cvBuyOffer(cv,v)})),[{t:'Never mind',a:()=>cvEnd(cv,`Never mind, thanks.`)}])}
 const B=cv.base;L.push({t:`Deal at ${fmtCr(A)}`,a:()=>cvSellDeal(cv,A,true)});
 if(cv.n<3){const mid=r50((A+B)/2);if(mid>A&&mid<B)L.push({t:`Counter ${fmtCr(mid)}`,a:()=>cvSellCounter(cv,mid)});L.push({t:`Price is ${fmtCr(B)}`,a:()=>cvSellCounter(cv,B)})}
 L.push({t:'No thanks',a:()=>cvEnd(cv,rnd([`No thanks.`,`Not that low. Sorry.`]))});return L}
function cvEnd(cv,t){cvPost(cv,1,t);cv.st='closed';cvNote(cv,'CONVERSATION ENDED',300);
 if(cv.kind==='sell'){const s=cvSale(cv);if(s)s.due=Date.now()+(20+Math.random()*40)*1000}P.save();pcDraw()}
function cvBuyOffer(cv,v){const x=cv.x;cvPost(cv,1,(cv.n===0?rnd([`Hey, is the ${BYID[cv.car].name} still for sale? Would you take ${fmtCr(v)}?`,`Hi. Interested in the ${BYID[cv.car].name}. ${fmtCr(v)} cash?`]):rnd([`How about ${fmtCr(v)}?`,`${fmtCr(v)}, then.`,`Come on. ${fmtCr(v)}?`]))+' '+rnd(flaws(x)));
 const nx=budge(cv.cur,cv.lim,cv.cur-v,-1),dl=lagT();
 if(v>=nx){cvPost(cv,0,rnd([`Deal. Come get it.`,`Fine. ${fmtCr(v)}. Bring cash.`]),dl);cvBuyDeal(cv,v,false,dl);return}
 const moved=nx<cv.cur,near=nx-cv.lim<cv.D*.25;cv.cur=Math.max(cv.lim,nx);const A=cv.cur;
 let t=v<cv.lim-cv.D?rnd([`Lol. No.`,`Are you serious? It's ${fmtCr(A)}.`,`Don't waste my time. ${fmtCr(A)}.`]):!moved?rnd(strengths(x))+' '+rnd([`Price is ${fmtCr(A)}. Not moving on it.`,`Still ${fmtCr(A)}.`,`It's worth every bit of ${fmtCr(A)}, man.`]):near?rnd([`Ugh. ${fmtCr(A)}. And that's me being nice. Not a cent less.`,`Man... fine. ${fmtCr(A)}. That's it. I mean it.`,`${fmtCr(A)}. I'm already losing money here.`]):(x.bad&&Math.random()<.5?`Yeah, ok, the paint's bad. `:x.cond<.7&&Math.random()<.5?`Fair, it needs some work. `:'')+rnd([`I could do ${fmtCr(A)}.`,`Meet me at ${fmtCr(A)}?`,`${fmtCr(A)}, and you're picking it up today.`]);
 cvPost(cv,0,cv.n>=3?t+' Take it or leave it.':t,dl);pcDraw()}
function cvBuyDeal(cv,v,mine,dl){if(mine)cvPost(cv,1,rnd([`Ok. ${fmtCr(v)} it is.`,`Deal. ${fmtCr(v)}.`]));cv.st='deal';cv.cur=v;const l=cvListing(cv);if(l){l.deal=v}cvNote(cv,`DEAL: ${fmtCr(v)}. Buy it from the listing.`,(dl||0)+300);P.save();pcDraw()}
function cvSellCounter(cv,v){const x=cv.x,B=cv.base;cvPost(cv,1,(v>=B?rnd([`Price is firm. ${fmtCr(B)}.`,`It's ${fmtCr(B)}. That's already fair.`]):rnd([`Meet me at ${fmtCr(v)}?`,`Can't go that low. ${fmtCr(v)}?`]))+' '+rnd(strengths(x)));const dl=lagT();
 if(v<=cv.lim&&Math.random()<.5){cvPost(cv,0,rnd([`Fine. ${fmtCr(v)}. On my way.`,`Ok ok. ${fmtCr(v)}. Deal.`]),dl);cvSellDeal(cv,v,false,dl);return}
 const nb=Math.min(cv.lim,budge(cv.cur,cv.lim,v-cv.cur,1)),moved=nb>cv.cur,near=cv.lim-nb<Math.max(300,cv.D*.2);cv.cur=nb;const A=nb;
 const t=!moved?rnd([`${fmtCr(A)}. That's what I've got.`,`Nah. ${fmtCr(A)}.`,`Still ${fmtCr(A)}.`])+' '+rnd(flaws(x)):near?rnd([`Ugh. ${fmtCr(A)}. That's everything I have, man.`,`${fmtCr(A)}. Seriously, that's my limit.`]):rnd([`I can do ${fmtCr(A)}.`,`${fmtCr(A)}?`,`How about ${fmtCr(A)}, cash today?`]);
 cvPost(cv,0,cv.n>=2?t+' Last offer.':t,dl);pcDraw()}
function cvSellDeal(cv,v,mine,dl){if(mine)cvPost(cv,1,rnd([`Deal. ${fmtCr(v)}.`,`Ok, ${fmtCr(v)}. It's yours.`]));cv.st='deal';cv.cur=v;const s=cvSale(cv),c=BYID[cv.car];
 if(s){sales().splice(sales().indexOf(s),1);const sv=P.SV();sv.cr+=v;if(sv.owned)sv.owned[s.id]=(sv.owned[s.id]||0)&~1;const g=G();delete g.wear[s.id];try{setPaint(s.id,null)}catch(e){}
  if(curCar().id===s.id){const q=owned().find(x=>x.id!==s.id);if(q)P.setSel(0,q.id,q.alt)}try{refreshCar();setCar();$$crv()}catch(e){}
  setTimeout(()=>announce({ok:1,h:`Your ${c?c.name:'car'} sold`,p:`Haggled, but it's done. ${fmtCr(v)} is in your account.`,cr:v}),(dl||0)+1200)}
 cvNote(cv,`SOLD: ${fmtCr(v)}`,(dl||0)+300);P.save();pcDraw()}
/* a conversation whose car went some other way is closed */
function cvTidy(){for(const cv of CV()){if(cv.st!=='open')continue;if(cv.kind==='buy'&&!cvListing(cv)){cv.st='closed';cvNote(cv,'LISTING GONE')}if(cv.kind==='sell'&&!cvSale(cv)){cv.st='closed';cvNote(cv,'LISTING GONE')}}}

/* ---- the screen ---- */
const PC={on:false,tab:'buy',cv:null,sf:null,el:null,sig:''};
/* the screen's corners in the laptop's own space (measured from the model: the lid's front face, inside the bezel) */
const PC_Q=[V3(-.148,.206,-.0965),V3(.148,.206,-.0965),V3(.148,.018,-.0965),V3(-.148,.018,-.0965)],PC_W=960,PC_H=610;
function pcCam(){const L=GS.laptop;if(!L)return null;L.updateMatrixWorld(true);const c=L.localToWorld(V3(0,.112,-.0965)),n=L.localToWorld(V3(0,.112,1)).sub(L.localToWorld(V3(0,.112,0))).normalize();
 return{p:c.clone().addScaledVector(n,.44).add(V3(0,.035,0)),l:c}}
function pcEl(){if(PC.el&&PC.el.isConnected)return PC.el;const e=document.createElement('div');e.id='gcPC';e.innerHTML='<div class="app"></div><div class="glare"></div>';document.body.appendChild(e);PC.el=e;
 e.addEventListener('click',pcClick);e.addEventListener('input',pcInput);e.addEventListener('keydown',ev=>{if(ev.target.tagName==='INPUT'||ev.target.tagName==='TEXTAREA')ev.stopPropagation()});return e}
/* map the page's rectangle onto the four projected corners (a projective transform) */
function pcPlace(){const e=PC.el;if(!e||!GS.laptop)return;{const cp=pcCam(),k=cp?GS.cam.position.distanceTo(cp.p):9;if(!PC.on||k>.72){if(e.style.display!=='none')e.style.display='none';return}if(e.style.display==='none')e.style.display=''}const L=GS.laptop,q=PC_Q.map(v=>{const w=L.localToWorld(v.clone());w.project(GS.cam);return[(w.x*.5+.5)*innerWidth,(-w.y*.5+.5)*innerHeight]});
 const [x0,y0]=q[0],[x1,y1]=q[1],[x2,y2]=q[2],[x3,y3]=q[3],dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1||1e-9;
 const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den,a=x1-x0+g*x1,b=x3-x0+h*x3,d=y1-y0+g*y1,f=y3-y0+h*y3,W=PC_W,H=PC_H;
 const tf=`matrix3d(${(a/W).toFixed(6)},${(d/W).toFixed(6)},0,${(g/W).toFixed(8)},${(b/H).toFixed(6)},${(f/H).toFixed(6)},0,${(h/H).toFixed(8)},0,0,1,0,${x0.toFixed(2)},${y0.toFixed(2)},0,1)`;if(e._tf!==tf){e._tf=tf;e.style.transform=tf}
 const cp=pcCam(),k=cp?GS.cam.position.distanceTo(cp.p):9;e.style.opacity=PC.on?Math.max(0,Math.min(1,1.6-k*2.2)):0;e.classList.toggle('live',PC.on&&k<.4)}
function openPC(tab,cvId){if(!GS.laptop)return;PC.on=true;PC.tab=tab||PC.tab||'buy';PC.cv=cvId||null;if(cvId)PC.tab='msg';PC.sf=null;UI.who=null;UI.view='pc';UI.ch=null;UI.line='';GS.hov=null;
 const d=$('gcDlg');if(d)d.classList.remove('on');const b=$('gcBox');if(b)b.classList.remove('on');mktFill();cvTidy();pcEl();aim();pcDraw();hint();P.sfx&&P.sfx('select')}
function closePC(){if(!PC.on)return;PC.on=false;PC.sf=null;UI.view='talk';aim();hint();P.sfx&&P.sfx('back');if(document.activeElement&&PC.el&&PC.el.contains(document.activeElement))document.activeElement.blur()}
const cls_=c=>`<span class="cls ${c.cls}">${c.cls}</span>`;
function pcThumb(id){try{return P.carThumb?P.carThumb(id):''}catch(e){return''}}
function pcDraw(){if(!PC.el)return;const a=PC.el.querySelector('.app');if(!a)return;cvTidy();const g=G(),sv=P.SV(),C=CV(),unread=C.filter(cvUnread).length;
 const tab=(k,n,x)=>`<u class="${PC.tab===k?'on':''}" data-tab="${k}">${n}${x?`<i>${x}</i>`:''}</u>`;
 let body='';
 if(PC.tab==='buy'){const L=g.mkt||[];body=`<h2>Used cars near you <small>${L.length} listings</small></h2><div class="list">`+L.map((l,i)=>{const c=BYID[l.id],cv=C.find(q=>q.kind==='buy'&&q.lid===l.uid),pr=lPrice(l),th=pcThumb(l.id);
   return`<div class="it"><div class="th"${th?` style="background-image:url(${th})"`:''}></div><div class="nf"><b>${esc_(c.name)} ${cls_(c)}</b><small>${Math.round(l.km/1000)}k km &middot; condition ${Math.round(l.cond*100)}%${l.bad||l.L?' &middot; <em>bad paint</em>':''}</small><small class="nw">New: ${fmtCr(c.price||0)}</small></div>
   <div class="pr">${l.deal?`<s>${fmtCr(l.price)}</s>`:''}<b>${fmtCr(pr)}</b>${l.deal?'<em>agreed</em>':''}</div><div class="bt"><button data-buy="${i}"${sv.cr<pr?' disabled':''}>Buy</button>${cv?`<button class="ghost" data-open="${cv.id}">Messages</button>`:`<button class="ghost" data-msg="${i}">Message seller</button>`}</div></div>`}).join('')+(L.length?'':'<p class="empty">Nothing listed right now. Check back after a race.</p>')+'</div>'}
 else if(PC.tab==='sell'){if(PC.sf){const f=PC.sf,c=BYID[f.id],v=carValue(f.id),p=Math.round(sellChance(f.id,f.ask,f.title,f.desc)*100),q=f.ask/v;
   body=`<h2>New listing <small>${esc_(c.name)}</small></h2><div class="form"><div class="row"><label>Asking price</label><div class="ask"><button data-adj="-1">&minus;</button><b>${fmtCr(f.ask)}</b><button data-adj="1">+</button><small>Worth about ${fmtCr(v)} &middot; ${q>1.25?'way over value':q>1.05?'over value':q<.85?'under value':'about right'}</small></div></div>
   <div class="row"><label>Title</label><input data-f="title" maxlength="60" value="${esc_(f.title)}" placeholder="e.g. Clean ${esc_(c.name.split(' ').slice(-1)[0])}, runs great"></div>
   <div class="row"><label>Description</label><textarea data-f="desc" maxlength="400" rows="3" placeholder="Mileage, history, what's been done to it...">${esc_(f.desc)}</textarea></div>
   <div class="meter" data-l="${p>=70?'good':p>=40?'ok':'bad'}"><span>Chance someone buys it</span><i><u style="width:${p}%"></u></i><b>${p}%</b></div>
   <div class="bt"><button data-list="1">List it</button><button class="ghost" data-cancel="1">Cancel</button></div></div>`}
  else{const L=sellable(),S=sales();body=`<h2>Sell a car <small>${L.length} in your garage</small></h2><div class="list">`+L.map(x=>{const th=pcThumb(x.id);return`<div class="it"><div class="th"${th?` style="background-image:url(${th})"`:''}></div><div class="nf"><b>${esc_(x.car.name)} ${cls_(x.car)}</b><small>${x.id===curCar().id?'Out now':'In storage'} &middot; condition ${pctOK(x.id)}%${paintOf(x.id)?' &middot; <em>bad paint</em>':''}</small></div><div class="pr"><small>worth</small><b>${fmtCr(carValue(x.id))}</b></div><div class="bt"><button data-sell="${x.id}"${L.length<2?' disabled title="You need something to drive"':''}>List it</button></div></div>`}).join('')+
   (S.length?`<h3>Listed</h3>`+S.map(q=>{const c=BYID[q.id],th=pcThumb(q.id);return`<div class="it"><div class="th"${th?` style="background-image:url(${th})"`:''}></div><div class="nf"><b>${esc_(c?c.name:q.id)}</b><small>${q.title?esc_(q.title):'No title'} &middot; ${Math.round(q.ch*100)}% chance</small></div><div class="pr"><small>asking</small><b>${fmtCr(q.ask)}</b></div><div class="bt"><button class="ghost" data-pull="${q.uid||(q.uid=uid())}">Pull it</button></div></div>`}).join(''):'')+'</div>'}}
 else{const cv=PC.cv&&C.find(q=>q.id===PC.cv);if(cv){cv.rd=cvSeen(cv);const c=BYID[cv.car],now=Date.now(),O=cvOpts(cv);
   body=`<div class="chat"><div class="ch"><button class="ghost back" data-back="1">&lsaquo; All messages</button><div class="av">${cv.who==='Unknown'?'?':cv.who.replace(/^Big /,'')[0]}</div><div><b>${esc_(cv.who)}</b><small>${cv.kind==='buy'?'Selling':'Wants to buy'} your${cv.kind==='buy'?' &middot; their':''} ${esc_(c?c.name:'car')}</small></div></div>
   <div class="px"><span><u>NEW</u><b>${fmtCr(cv.nw)}</b></span><span><u>${cv.kind==='buy'?'LISTED':'YOUR PRICE'}</u><b>${fmtCr(cv.base)}</b></span><span class="on"><u>ON THE TABLE</u><b>${fmtCr(cv.cur)}</b></span><span><u>TEXTS</u><b>${Math.min(5,cv.n)} / 5</b></span></div>
   <div class="msgs">`+cv.log.filter(m=>m.at<=now).map(m=>m.note?`<div class="m note">${esc_(m.t)}</div>`:`<div class="m ${m.me?'me':'them'}">${esc_(m.t)}</div>`).join('')+(cvPending(cv)?'<div class="m them typing">typing...</div>':'')+`</div>
   <div class="opts">${O.map((o,i)=>`<button data-o="${i}"><em>${i+1}</em>${esc_(o.t)}</button>`).join('')}${cv.st==='deal'&&cv.kind==='buy'&&cvListing(cv)?`<button data-buyl="${cv.lid}"><em>&#10003;</em>Buy it now for ${fmtCr(cv.cur)}</button>`:''}</div></div>`;PC.opts=O}
  else{const L=C.slice().sort((a,b)=>(b.ts||0)-(a.ts||0));body=`<h2>Messages <small>${L.length?L.length+' conversations':''}</small></h2><div class="list">`+L.map(cv=>{const c=BYID[cv.car],last=cv.log.filter(m=>m.at<=Date.now()).slice(-1)[0];
   return`<div class="it conv${cvUnread(cv)?' new':''}" data-open="${cv.id}"><div class="av">${cv.who==='Unknown'?'?':cv.who.replace(/^Big /,'')[0]}</div><div class="nf"><b>${esc_(cv.who)} <small>&middot; ${esc_(c?c.name:'')}</small></b><small>${last?esc_((last.me?'You: ':'')+last.t):'No messages yet'}</small></div><div class="pr"><small>${cv.st==='open'?(cvPending(cv)?'typing...':'open'):cv.st==='deal'?'deal':'closed'}</small><b>${fmtCr(cv.cur)}</b></div></div>`}).join('')+(L.length?'':'<p class="empty">No messages. Message a seller from a listing, or list a car and wait for buyers.</p>')+'</div>'}}
 a.innerHTML=`<div class="tb"><div class="logo">Poly<b>Market</b></div><nav>${tab('buy','Buy')}${tab('sell','Sell')}${tab('msg','Messages',unread||'')}</nav><div class="cr">${fmtCr(sv.cr)}</div><button class="x" data-close="1">&times;</button></div><div class="bd">${body}</div>`;
 const m=a.querySelector('.msgs');if(m)m.scrollTop=m.scrollHeight;PC.sig=pcSig()}
const pcSig=()=>PC.tab+'|'+(PC.cv||'')+'|'+CV().map(c=>c.id+':'+cvSeen(c)+':'+cvPending(c)+':'+c.st).join(',')+'|'+sales().length+'|'+((G().mkt||[]).length);
setInterval(()=>{if(PC.on&&scr!=='s8career'){PC.on=false;PC.sf=null;if(UI.view==='pc')UI.view='talk'}if(PC.el&&!PC.on&&scr!=='s8career')PC.el.style.opacity=0;if(PC.on&&!PC.sf&&pcSig()!==PC.sig)pcDraw()},400);
function pcClick(ev){const t=ev.target.closest('[data-tab],[data-close],[data-buy],[data-msg],[data-open],[data-back],[data-o],[data-buyl],[data-sell],[data-pull],[data-adj],[data-list],[data-cancel]');if(!t)return;ev.stopPropagation();const D=t.dataset,g=G();P.sfx&&P.sfx('move');
 if(D.tab){PC.tab=D.tab;PC.cv=null;PC.sf=null}
 else if(D.close){closePC();return}
 else if(D.buy!=null){const l=(g.mkt||[])[+D.buy];if(l)pcBuy(l);return}
 else if(D.buyl){const l=(g.mkt||[]).find(x=>x.uid===D.buyl);if(l)pcBuy(l);return}
 else if(D.msg!=null){const l=(g.mkt||[])[+D.msg];if(l){const cv=cvBuy(l);PC.tab='msg';PC.cv=cv.id}}
 else if(D.open){PC.tab='msg';PC.cv=D.open}
 else if(D.back){PC.cv=null}
 else if(D.o!=null){const o=PC.opts&&PC.opts[+D.o];if(o){o.a();return}}
 else if(D.sell){const v=carValue(D.sell);PC.sf={id:D.sell,ask:v,title:'',desc:''}}
 else if(D.pull){const s=sales().find(x=>x.uid===D.pull);if(s){sales().splice(sales().indexOf(s),1);P.save()}}
 else if(D.adj){const f=PC.sf;if(f){const v=carValue(f.id);f.ask=Math.max(250,Math.min(v*4,f.ask+(+D.adj)*sfStep(v)))}}
 else if(D.list){pcList();return}
 else if(D.cancel){PC.sf=null}
 pcDraw()}
function pcInput(ev){const f=PC.sf,k=ev.target.dataset&&ev.target.dataset.f;if(!f||!k)return;f[k]=ev.target.value;/* update the meter in place, so typing never re-renders the form */
 const a=PC.el,p=Math.round(sellChance(f.id,f.ask,f.title,f.desc)*100),m=a.querySelector('.meter');if(m){m.dataset.l=p>=70?'good':p>=40?'ok':'bad';m.querySelector('u').style.width=p+'%';m.querySelector('b').textContent=p+'%'}}
function pcList(){const f=PC.sf;if(!f)return;const p=sellChance(f.id,f.ask,f.title,f.desc),ok=Math.random()<p;
 sales().push({id:f.id,uid:uid(),ask:f.ask,title:(f.title||'').trim().slice(0,60),ch:p,ok,due:Date.now()+(35+Math.random()*70)*1000*(ok?1:1.4)});P.save();
 const id=f.id;PC.sf=null;if(curCar().id===id){const o=sellable().find(x=>x.id!==id);if(o)fadeDo(()=>{P.setSel(0,o.id,o.alt);setCar();refreshCar()},420)}P.sfx&&P.sfx('select');pcDraw()}
function pcBuy(l){const g=G(),sv=P.SV(),c=BYID[l.id],pr=lPrice(l);if(sv.cr<pr)return;
 fadeDo(()=>{sv.cr-=pr;sv.owned[l.id]=(sv.owned[l.id]||0)|1;g.wear[l.id]=Math.max(0,Math.min(1,1-l.cond));setPaint(l.id,l.L||null);P.setSel(0,l.id,0);const i=g.mkt.indexOf(l);if(i>=0)g.mkt.splice(i,1);P.save();$$crv();setCar();refreshCar();
  closePC();GS.cp.copy(GS.tp);GS.cl.copy(GS.tl);announce({ok:1,tag:'BOUGHT',h:`You bought the ${c.name}`,p:l.deal?`Talked down to ${fmtCr(pr)}. It's in your garage.`:`It's in your garage. Nina's already looking at it.`,cr:-pr});
  const id=l.id,bad=!!l.L;setTimeout(()=>{if(scr!=='s8career'||curCar().id!==id||UI.view==='pc')return;popIn(id,bad)},1500)},420)}
/* the announcement */
const inRace=()=>scr==='game'||scr==='bike';let ANN=null,annQ=[];
function announce(o){annQ.push(o);if(!ANN||!ANN.classList.contains('on'))annNext()}
function annNext(){const o=annQ.shift();if(!o)return;if(!ANN){ANN=document.createElement('div');ANN.id='gcAnn';document.body.appendChild(ANN);ANN.onclick=()=>{ANN.classList.remove('on');const c=ANN._cv;if(c&&scr==='s8career'&&GS.ok){if(UI.who)leave();openPC('msg',c)}setTimeout(annNext,400)}}
 ANN._cv=o.cv||null;const pic=GS.vin&&GS.vin.pic;ANN.innerHTML=`<div class="pic">${pic?`<img src="${pic}" alt="">`:'V'}</div><div class="tx"><small class="${o.ok?'ok':'no'}">${o.tag||(o.ok?'SOLD':'NO BUYERS')} &middot; MARKETPLACE</small><b>${esc_(o.h)}</b><p>${esc_(o.p)}</p></div>${o.cr?`<div class="cr${o.cr<0?' neg':''}">${o.cr<0?'&minus;':'+'}${fmtCr(Math.abs(o.cr))}</div>`:''}`;
 ANN.classList.remove('on');void ANN.offsetWidth;ANN.classList.add('on');P.sfx&&P.sfx(o.ok?'select':'back');clearTimeout(ANN._t);ANN._t=setTimeout(()=>{ANN.classList.remove('on');setTimeout(annNext,450)},6000)}
function salesTick(){let S;try{S=sales()}catch(e){return}if(!S.length||inRace()||document.hidden)return;const now=Date.now();
 for(const s of S.slice()){if(!s.uid)s.uid=uid();if(s.due>now||(s.tx&&CV().some(c=>c.sid===s.uid&&c.st==='open')))continue;if(!s.tx&&s.ask>=1500&&Math.random()<.5){s.tx=1;cvSell(s);continue}S.splice(S.indexOf(s),1);const c=BYID[s.id],nm=c?c.name:'car',sv=P.SV();
  if(s.ok){sv.cr+=s.ask;if(sv.owned)sv.owned[s.id]=(sv.owned[s.id]||0)&~1;const g=G();delete g.wear[s.id];try{setPaint(s.id,null)}catch(e){}
   if(curCar().id===s.id){const o=owned().find(x=>x.id!==s.id);if(o)P.setSel(0,o.id,o.alt)}
   announce({ok:1,h:`Your ${nm} sold`,p:(s.title?`"${s.title}" `:'')+rnd([`went for the asking price. Vince took his cut out of the buyer, apparently.`,`is gone. Buyer paid cash. Vince didn't ask questions.`,`found a buyer. Money's in your account.`]),cr:s.ask})}
  else announce({ok:0,h:`Nobody bought your ${nm}`,p:rnd([`No takers at ${fmtCr(s.ask)}. Vince pulled the listing, it's back in your garage.`,`It sat on the lot. Back in your garage. Maybe ask less.`])});
  P.save()}
 if(scr==='s8career'){try{refreshCar();setCar();if(UI.who&&(UI.view==='sell'||UI.view==='cars'))drawDlg(true)}catch(e){}}}
setInterval(salesTick,1000);
/* the speech bubble over someone's head (the car list keeps the camera back in the room, so she talks from where she is) */
const BUB={who:null,t:0};
function bubble(who,txt,dur){const b=$('gcBub');if(!b)return;BUB.who=who;BUB.t=dur||Math.max(2.6,Math.min(6,txt.length/13));const pe=who==='red'?RED:VIN;b.style.setProperty('--c',pe.col);
 b.innerHTML=`<b>${pe.n}</b>${esc_(txt)}`;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');const ps=GS[who];if(ps)ps.tk=Math.min(3.5,txt.length/26)}
function bubTick(dt){const b=$('gcBub');if(!b||!BUB.who)return;const keep=UI.view==='cars'&&UI.who===BUB.who;if(!keep)BUB.t-=dt;
 if(BUB.t<=0||(UI.who&&UI.view!=='cars')||UI.menu){b.classList.remove('on');BUB.who=null;return}
 const p=headOf(BUB.who).add(V3(0,.42,0));p.project(GS.cam);b.style.left=((p.x*.5+.5)*innerWidth).toFixed(1)+'px';b.style.top=((-p.y*.5+.5)*innerHeight).toFixed(1)+'px'}
/* buying in the Marketplace: the money goes, the car comes out with its wear and its paint, and Nina has something to say about it */
const lPrice=l=>l.deal||l.price;
/* picking a listing: buy it at the price (or the price you talked them down to), or text the seller first */
function mktPick(i){const l=G().mkt[i];if(!l)return;const c=BYID[l.id],pr=lPrice(l);UI.view='talk';UI.f=0;
 UI.ch=[{ic:'shop',t:l.deal?'Buy it at the agreed price':'Buy it',pz:fmtCr(pr),off:P.SV().cr<pr,a:()=>{UI.ch=null;buy(G().mkt.indexOf(l))}}];
 if(!l.tx)UI.ch.push({ic:'chat',t:'Text the seller',a:()=>{UI.ch=null;UI.view='mkt';UI.f=Math.max(0,G().mkt.indexOf(l));openPC('msg',cvBuy(l).id)}});
 UI.ch.push({ic:'back',t:'Back to the list',a:()=>{UI.ch=null;UI.view='mkt';UI.f=Math.max(0,G().mkt.indexOf(l))}});
 say(l.deal?`You got them to ${fmtCr(pr)}. Still want it?`:rnd([`The ${c.name}. ${fmtCr(pr)}. Want it, or want to try your luck with the seller?`,`${fmtCr(pr)} for the ${c.name}. Buy it, or text the guy.`]));drawDlg();hint()}
function buy(i){const g=G(),l=g.mkt[i],sv=P.SV();if(!l)return;const c=BYID[l.id],pr=lPrice(l);if(sv.cr<pr){say(`You're short. Come back with ${fmtCr(pr-sv.cr)} more.`);return}
 fadeDo(()=>{sv.cr-=pr;sv.owned[l.id]=(sv.owned[l.id]||0)|1;g.wear[l.id]=Math.max(0,Math.min(1,1-l.cond));setPaint(l.id,l.L||null);P.setSel(0,l.id,0);g.mkt.splice(i,1);P.save();$$crv();setCar();refreshCar();buy_(l);announce({ok:1,tag:'BOUGHT',h:`You bought the ${c.name}`,p:l.deal?`Talked down to ${fmtCr(pr)}. It's in your garage.`:`It's in your garage. Nina's already looking at it.`,cr:-pr})},420)}
function buy_(l){
 say(rnd([`Pleasure.`,`It's yours. Don't call me about it.`,`Done. Keys are on the bench.`]));gesture(GS.vin,'palm');UI.view='talk';UI.f=0;drawDlg();
 const id=l.id,bad=!!l.L;setTimeout(()=>{if(scr!=='s8career'||curCar().id!==id)return;popIn(id,bad)},1500)}
function popIn(id,bad){const c=BYID[id],oil=Math.max(150,Math.round(fixCost(id)*.45/50)*50),paint=1200;
 const line=bad?rnd([`Dear god... that is the shittiest paintjob I've ever seen!`,`Who painted this, a toddler with a grudge? Damn.`,`Oh hell no. That paint has to go.`]):rnd([`Ooh, a project! I'll change the oil for cheap!`,`That thing's been sitting for years. I'll change the oil for cheap, at least.`,`Well, shit. It runs, I guess. I'll do the oil and the basics for cheap.`]);
 const L=[];const drop=x=>{UI.ch=UI.ch.filter(y=>y!==x);if(UI.ch.length<=1)UI.ch=null};
 if(wearOf(id)>.02){const o={ic:'fix',t:'Oil and the basics',pz:fmtCr(oil),a:()=>{const sv=P.SV();if(sv.cr<oil){say(`Can't do it for less than ${fmtCr(oil)}. Sorry.`);return}sv.cr-=oil;$$crv();drop(o);fadeDo(()=>{G().wear[id]=0;P.save();setCar(true);refreshCar();say(rnd([`Done. Runs like a dream now. Well, a loud dream.`,`Oil's fresh, belts are new. Damn, that's better.`]));drawDlg()},420)}};L.push(o)}
 if(bad){const o={ic:'paint',t:'Repaint it',pz:fmtCr(paint),a:()=>{const sv=P.SV();if(sv.cr<paint){say(`Paint costs ${fmtCr(paint)}. You'll have to live with it for now.`);return}sv.cr-=paint;$$crv();drop(o);fadeDo(()=>{setPaint(id,null);setCar(true);say(rnd([`Much better. My eyes thank you.`,`There. Now it looks like a car and not a crime scene.`]));drawDlg()},420)}};L.push(o)}
 L.push({ic:'bye',t:'Later',a:()=>{UI.ch=null;say(rnd([`Suit yourself. It'll sound like a damn coffee grinder till then.`,`Your funeral.`]))}});
 UI.who='red';UI.view='talk';UI.f=0;UI.ch=L.length>1?L:null;aim();UI.line=line;UI.ty=null;if(GS.red){GS.red.tk=2.5;gesture(GS.red,'shrug')}drawDlg();hint()}
function talk(who,keep,line){UI.who=who;if(!keep){UI.view='talk';UI.f=0;UI.ch=null}
 aim();if(!keep&&GS[who])gesture(GS[who],who==='red'?'hey':'nod');UI.line=String(line||UI.line||(who==='red'?redLine():vinLine())).replace(/Cr\.\./g,'Cr.');UI.ty=null;if(GS[who])GS[who].tk=2.5;if(who==='vin'){const g=G();if(!g.met){g.met=1;P.save()}}P.sfx&&!keep&&P.sfx('select');drawDlg();hint()}
function leave(){UI.who=null;UI.line='';UI.view='talk';UI.ch=null;aim();const d=$('gcDlg');if(d)d.classList.remove('on');const b=$('gcBox');if(b)b.classList.remove('on');P.sfx&&P.sfx('back');hint()}
function act(k){if(k==='pc'){openPC('buy');return}if(k==='car'){P.sfx&&P.sfx('select');openCars()}else if(k)talk(k)}
function say(t){setLine(t)}
function setLine(t){t=String(t).replace(/Cr\.\./g,'Cr.');UI.line=t;if(UI.view==='cars'&&UI.who){bubble(UI.who,t);return}UI.ty={t,i:0};const pe=GS[UI.who];if(pe)pe.tk=Math.min(3.5,t.length/26);paintType()}
function paintType(){const p=sec.querySelector('#gcBox .tx');if(!p||!UI.ty)return;const n=Math.floor(UI.ty.i),done=n>=UI.ty.t.length;p.innerHTML=esc_(UI.ty.t.slice(0,n))+(done?'':'<i class="cur"></i>')+'<span class="ghost">'+esc_(UI.ty.t.slice(n))+'</span>';p.classList.toggle('done',done)}
function type(dt){const ty=UI.ty;if(!ty||ty.i>=ty.t.length)return;const n0=Math.floor(ty.i);ty.i=Math.min(ty.t.length,ty.i+dt*62);if(Math.floor(ty.i)!==n0)paintType()}
const typing=()=>UI.ty&&UI.ty.i<UI.ty.t.length;const finishType=()=>{if(UI.ty){UI.ty.i=UI.ty.t.length;paintType()}};
function drawBox(){const b=$('gcBox');if(!b||!UI.who)return;if(UI.view==='cars'){b.classList.remove('on');return}const pe=UI.who==='red'?RED:VIN,ps=GS[UI.who];b.style.setProperty('--c',pe.col);
 if(b.dataset.who!==UI.who||!b.classList.contains('on')){b.dataset.who=UI.who;b.querySelector('.pic').innerHTML=ps&&ps.pic?`<img src="${ps.pic}" alt="">`:pe.n[0];b.querySelector('.nm b').textContent=pe.n;b.querySelector('.nm small').textContent=pe.role;
  b.classList.remove('pop');void b.offsetWidth;b.classList.add('on','pop')}
 if(!UI.ty||UI.ty.t!==UI.line)UI.ty={t:UI.line,i:0};paintType()}
function drawDlg(keepAnim){const d=$('gcDlg');if(!d||!UI.who)return;const pe=UI.who==='red'?RED:VIN;d.style.setProperty('--c',pe.col);drawBox();
 const sv=P.SV(),g=G();let body='',cap=pe.n,cap2='';
 if(UI.view==='offers'){cap='Races';cap2=TIERS[tierOf(g.rep)].n;if(UI.f>g.offers.length)UI.f=0;
  body=g.offers.map((o,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*55}ms"><canvas width="192" height="124"></canvas><div><em>${TYPE_L[o.type]}</em><b>${esc_(o.name)}</b><small>${detailTxt(o)}</small><small>${goalTxt(o)}</small></div><div class="pz"><u>${o.type==='ta'||o.type==='rally'?'PRIZE':'1ST PLACE'}</u><i>${fmtCr(firstPay(o))}</i></div></div>`).join('')+backRow(g.offers.length)}
 else if(UI.view==='mkt'){cap='Marketplace';cap2=fmtCr(sv.cr);if(UI.f>g.mkt.length+1)UI.f=0;
  body=g.mkt.map((l,i)=>{const c=BYID[l.id];return`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*55}ms"><div class="sw" data-car="${l.id}"></div><div><em${l.bad?' class="bad"':''}>${l.bad?'USED &middot; BAD PAINT':'USED'}</em><b>${esc_(c.name)}<span class="cls ${c.cls}">${c.cls}</span></b><small>${Math.round(l.km/1000)}k km &middot; cond. ${Math.round(l.cond*100)}%</small></div><div class="pz"><u>PRICE</u><i>${fmtCr(l.price)}</i><s>${fmtCr(c.price)}</s></div></div>`}).join('')+`<div class="gcRow${UI.f===g.mkt.length?' on':''}" data-i="${g.mkt.length}" style="--d:${60+g.mkt.length*55}ms">${svgI('swap')}<span>Sell one of yours</span>${sales().length?'<em>'+sales().length+' LISTED</em>':''}</div>`+backRow(g.mkt.length+1)}
 else if(UI.view==='sell'){cap='Sell a car';const {L,S}=sellRows();cap2=fmtCr(sv.cr);if(UI.f>=L.length+S.length+1)UI.f=0;
  body=L.map((x,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${Math.min(8,i)*45+60}ms"><div class="sw" data-car="${x.id}"></div><div><em>${x.id===curCar().id?'OUT NOW':'IN STORAGE'}</em><b>${esc_(x.car.name)}<span class="cls ${x.car.cls}">${x.car.cls}</span></b><small>Condition ${pctOK(x.id)}%</small></div><div class="pz"><u>WORTH</u><i>${fmtCr(carValue(x.id))}</i></div></div>`).join('')+
   S.map((q,j)=>{const i=L.length+j,c=BYID[q.id];return`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${Math.min(8,i)*45+60}ms"><div class="sw" data-car="${q.id}"></div><div><em class="bad">LISTED &middot; ${Math.round(q.ch*100)}% CHANCE</em><b>${esc_(c?c.name:q.id)}</b><small>${q.title?esc_(q.title):'Click to pull the listing'}</small></div><div class="pz"><u>ASKING</u><i>${fmtCr(q.ask)}</i></div></div>`}).join('')+backRow(L.length+S.length)}
 else if(UI.view==='sellForm'&&UI.sf){cap='New listing';cap2=fmtCr(sv.cr);body=sfHtml()}
 else if(UI.view==='cars'){cap='Your cars';const L=owned();cap2=L.length+' OWNED';const cur=curCar().id;
  body=L.map((x,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${Math.min(8,i)*45+60}ms"><div class="sw" data-car="${x.id}"></div><div><em>${x.id===cur?'OUT NOW':'IN STORAGE'}</em><b>${esc_(x.car.name)}<span class="cls ${x.car.cls}">${x.car.cls}</span></b><small>Condition ${pctOK(x.id)}%</small></div><div class="pz"></div></div>`).join('')}
 else if(UI.view==='tune'){cap='Tuning';cap2=curCar().car.name;const c=curCar(),t=P.tuneGet(c.id,c.alt);
  body=P.TUNE.map((T,i)=>{let seg='';for(let v=-T.r;v<=T.r;v++){const on=t[T.k]<0?v>=t[T.k]&&v<0:t[T.k]>0?v<=t[T.k]&&v>0:false;seg+=`<i class="${on?'f':v===0?'z':''}" data-v="${v}"></i>`}
   return`<div class="gcTu${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*50}ms"><b>${T.n}</b><div class="seg"><u data-d="-1">&lsaquo;</u>${seg}<u data-d="1">&rsaquo;</u></div><small><span>${T.lo}</span><span>${T.hi}</span></small></div>`}).join('')+
   `<div class="gcRow${UI.f===P.TUNE.length?' on':''}" data-i="${P.TUNE.length}" style="--d:${60+P.TUNE.length*50}ms">${svgI('ok')}<span>Done</span></div>`}
 else body=choices().map((c,i)=>`<div class="gcRow${i===UI.f?' on':''}${c.off?' off':''}" data-i="${i}" style="--d:${60+i*55}ms">${svgI(c.ic)}<span>${c.t}</span>${c.pz?'<em>'+c.pz+'</em>':''}</div>`).join('');
 const sig=UI.who+UI.view+(UI.ch?'c'+UI.ch.length:''),fresh=!keepAnim&&d.dataset.sig!==sig;d.dataset.sig=sig;
 d.innerHTML=(UI.view==='talk'?'<h6></h6>':`<h6>${esc_(cap)}<span>${esc_(cap2)}</span></h6>`)+`<div class="gcCh">${body}</div>`;
 d.classList.add('on');d.classList.toggle('fresh',fresh);
 d.querySelectorAll('.gcCh>div,.gcCh>label').forEach(e=>{const i=+e.dataset.i,cv=e.querySelector('canvas');if(cv)try{P.ui.drawTrack(cv,g.offers[i].track,false)}catch(er){}
  const sw=e.querySelector('.sw[data-car]');if(sw&&P.carThumb)try{const u=P.carThumb(sw.dataset.car);if(u){sw.style.backgroundImage='url('+u+')';sw.textContent=''}}catch(er){}
  if(isNaN(i))return;if(e.tagName==='LABEL'){e.onmouseenter=null;return}e.onmouseenter=()=>focusC(i);
  e.onclick=ev=>{const u=ev.target.closest('u[data-d]'),iv=ev.target.closest('.seg i');if(UI.view==='tune'&&i<P.TUNE.length){if(u){tuneAdj(i,+u.dataset.d);return}if(iv){const T=P.TUNE[i],c=curCar(),cur=P.tuneGet(c.id,c.alt)[T.k];tuneAdj(i,+iv.dataset.v-cur);return}focusC(i);return}
   focusC(i);finishType();pickC()}});
 if(UI.view==='sellForm')sfWire(d);
 const on=d.querySelector('.gcCh>.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'})}
const backRow=n=>`<div class="gcRow${UI.f===n?' on':''}" data-i="${n}" style="--d:${60+n*55}ms">${svgI('back')}<span>Something else</span></div>`;
function nC(){return UI.view==='offers'?G().offers.length+1:UI.view==='mkt'?G().mkt.length+2:UI.view==='sell'?sellRows().n:UI.view==='sellForm'?5:UI.view==='cars'?owned().length:UI.view==='tune'?P.TUNE.length+1:choices().length}
function focusC(i){if(i===UI.f)return;UI.f=i;P.sfx&&P.sfx('move');const d=$('gcDlg');if(!d)return;d.querySelectorAll('.gcCh>[data-i]').forEach(e=>e.classList.toggle('on',+e.dataset.i===i));
 if(UI.view==='sellForm'){const el=d.querySelector('.gcCh>[data-i="'+i+'"] input,.gcCh>[data-i="'+i+'"] textarea');if(el)el.focus();else if(document.activeElement&&d.contains(document.activeElement))document.activeElement.blur()}
 const on=d.querySelector('.gcCh>.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
 if(UI.view==='offers'){const o=G().offers[i];setLine(o?pitch(o):`Something else, then?`)}
 else if(UI.view==='mkt'){const l=G().mkt[i];setLine(l?mktPitch(l):`Something else?`)}}
function pickC(){if(typing()){finishType();return}if(UI.busy)return;const el=$('gcDlg')&&$('gcDlg').querySelector('.gcCh>div[data-i="'+UI.f+'"]');if(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit')}
 P.sfx&&P.sfx('select');UI.busy=1;setTimeout(()=>{UI.busy=0;pickC_()},150)}
function pickC_(){const pe=GS[UI.who];if(pe&&!pe.gs&&UI.view!=='tune')gesture(pe,rnd(GEST[UI.who].talk))
 if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length){UI.view='talk';UI.f=0;say(`Something else, then?`);drawDlg();hint();return}start(UI.f);return}
 if(UI.view==='mkt'){const g=G();if(UI.f===g.mkt.length){openSell();return}if(UI.f>g.mkt.length){UI.view='talk';UI.f=0;say(`Sure.`);drawDlg();hint();return}mktPick(UI.f);hint();return}
 if(UI.view==='sell'){pickSell(UI.f);return}
 if(UI.view==='sellForm'){if(UI.f===3)sfList();else if(UI.f===4){UI.sf=null;openSell()}return}
 if(UI.view==='cars'){bringOut(UI.f);return}
 if(UI.view==='tune'){if(UI.f>=P.TUNE.length){tuneDone();aim();drawDlg();hint()}return}
 const c=choices()[UI.f];if(c){const v0=UI.view;c.a();if(UI.who&&scr==='s8career'){if(UI.view!==v0)aim();drawDlg();hint()}}}
function refreshCar(){const e=$('gcCarI');if(e)e.innerHTML=carInfo();$$crv()}
function $$crv(){sec.querySelectorAll('.crv').forEach(e=>e.textContent=fmtCr(P.SV().cr))}
P.gcRender=()=>{render();return true};
/* hovering and clicking in the room */
sec.addEventListener('mousemove',e=>{if(!sec.classList.contains('gcOn')||UI.who||onCar()||UI.menu||UI.view==='pc'){if(GS.hov){GS.hov=null;sec.classList.remove('hv')}return}
 const k=e.target.closest&&e.target.closest('.gcDlg,.gcBox,.hdr,.foot8,.gcTier,.gcCarI')?null:pickAt(e.clientX,e.clientY);if(k!==GS.hov){GS.hov=k;if(k){UI.tag=TAGK.indexOf(k);P.sfx&&P.sfx('move')}}sec.classList.toggle('hv',!!k)});
sec.addEventListener('mouseleave',()=>{GS.hov=null;sec.classList.remove('hv')});
sec.addEventListener('click',e=>{if(!sec.classList.contains('gcOn')||UI.who||onCar()||UI.menu||UI.view==='pc')return;if(e.target.closest&&e.target.closest('button,.gcDlg,.gcBox,.hdr,.foot8,.gcMenu,.gcCarI'))return;const k=pickAt(e.clientX,e.clientY);if(k){GS.hov=null;sec.classList.remove('hv');act(k)}});

/* ---------------- launching ---------------- */
function start(i){const g=G(),o=g.offers[i];if(!o)return;const c=curCar(),T=TIERS[o.tier],nm=(P.SV().name||'').trim()||null;
 const humans=[{id:c.id,alt:c.alt,name:nm}];let cfg;const ev={id:o.id,name:o.name,prize:o.prize,type:o.type,gc:1};
 if(o.type==='race')cfg={mode:'mp',track:o.track,laps:o.laps,humans,ai:P.makeAI({n:o.n,classes:T.cl,skill:T.sk,rally:false}),tod:'day',endur:false,weather:'clear'};
 else if(o.type==='circuit')cfg={mode:'mp',track:o.track,laps:o.laps,humans,ai:P.makeAI({n:o.n,classes:T.cl,skill:T.sk,rally:false,trackCars:true}),tod:'day',endur:false,weather:'clear',trackRace:true};
 else if(o.type==='elim')cfg={mode:'elim',track:o.track,laps:99,humans,ai:P.makeAI({n:o.n,classes:T.cl,skill:T.sk,rally:false}),tod:'day',endur:false,interval:30,weather:'clear'};
 else if(o.type==='ta')cfg={mode:'ta',track:o.track,laps:o.laps,humans,ai:[],tod:'day',endur:false};
 else cfg={mode:'rally',track:o.track,laps:o.laps,humans,ai:[],tod:'day',endur:false,weather:'clear'};
 cfg.ev=ev;cfg.gc=o.id;cfg.dmg=true;o.target=targetOf(o);P.sfx&&P.sfx('select');
 P._to=o.type==='circuit';P._ro=o.type==='rally';UI.lastStart=i;
 (P.launchWithIntro||P.launch)(cfg)}
{const l0=P.launch;P.launch=function(cfg){const g=G(),o=cfg&&cfg.gc&&g.offers.find(x=>x.id===cfg.gc);P.gcRun=o?{o:Object.assign({},o),done:false}:null;const r=l0.apply(this,arguments);
  /* the car starts the race with the damage it came home with */
  if(P.gcRun){try{for(const c of RACE.cars)if(c.human){const w=wearOf(c.carId);if(w>0)c.dmg=Math.max(c.dmg||0,w)}}catch(e){}}
  /* the bad paint goes racing too, in every mode */
  try{for(const c of RACE.cars)if(c.human&&!c.loan)carLook(c.m&&(c.m.visualModel||c.m.g||c.m),c.carId,paintOf(c.carId),wearOf(c.carId))}catch(e){}return r}}

/* ---------------- Quick Play pays less ---------------- */
P.qpK=()=>P.gcRun?1:QP_K;
P.racePay0=P.racePay;{const rp=P.racePay;P.racePay=function(){return Math.round(rp.apply(this,arguments)*P.qpK()/50)*50}}
{const rb=P.raceBase;if(rb)P.raceBase=function(){return Math.round(rb.apply(this,arguments)*P.qpK())}}

/* ---------------- results ---------------- */
function judge(){const Rc=typeof RACE!=='undefined'?RACE:null,run=P.gcRun;if(!Rc||!run)return null;const o=run.o,c=Rc.cars.find(x=>x.human);if(!c)return null;
 if(c.carId)G().wear[c.carId]=Math.max(0,Math.min(1,+(c.dmg||0)));
 if(o.type==='race'||o.type==='circuit'||o.type==='elim'){const order=[...Rc.cars].sort((a,b)=>(b.fin?1e6-b.finT:0)-(a.fin?1e6-a.finT:0)||b.unw-a.unw),pl=order.indexOf(c)+1;
  return{ok:pl<=3,what:(P.ord?P.ord(pl):pl)+' place'}}
 if(o.type==='ta'){const bl=c.lapT&&c.lapT.length?Math.min(...c.lapT):null,t=o.target;if(bl==null)return{ok:false,what:'No lap set'};
  if(t==null)return{ok:!!P.medalFor&&P.medalFor(o.track,BYID[c.carId],bl)<=o.medal,what:'Best lap '+fmtT(bl)};return{ok:bl<=t,what:'Best lap '+fmtT(bl)+(bl<=t?'':', the target was '+fmtT(t))}}
 if(!c.fin)return{ok:false,what:'Stage not finished'};const tm=c.finT+(Rc.pen||0),t=o.target!=null?o.target*o.laps:null;
 return{ok:t==null?true:tm<=t,what:'Stage time '+fmtT(tm)+(t!=null&&tm>t?', the target was '+fmtT(t):'')}}
{const e0=P.earn;P.earn=function(n){const r=e0.apply(this,arguments);const run=P.gcRun;
  if(run&&!run.done){run.done=true;try{const j=judge();if(j){const g=G(),o=run.o;g.runs++;let paid=0,tierUp=0;
    if(j.ok){const before=tierOf(g.rep);g.rep+=o.type==='circuit'?2:1;g.wins++;const after=tierOf(g.rep);if(after>before)tierUp=after;
     if(o.type==='ta'||o.type==='rally'){paid=Math.round(o.prize*1.08);e0(o.prize)}else paid=Math.round(Math.max(0,n)*1.08);
     g.offers=g.offers.filter(x=>x.id!==o.id);fillOffers()}
    g.earned+=Math.round(Math.max(0,n)*1.08)+(o.type==='ta'||o.type==='rally'?paid:0);run.res=Object.assign(j,{paid,tierUp});P.save()}}catch(e){console.warn('career judge',e)}}
  return r}}
/* once the results screen is up: Vince's reaction on top, and the buttons lead back to the garage */
{const sh0=show;show=function(n){const r=sh0.apply(this,arguments);if(n==='s8res'&&P.gcRun&&P.gcRun.res)setTimeout(decorate,0);return r}}
function decorate(){const run=P.gcRun,box=$('resBox');if(!run||!box||box.querySelector('.gcRes'))return;const r=run.res;
 const d=document.createElement('div');d.className='gcRes';
 d.innerHTML=`<div><small>${r.ok?'EVENT CLEARED':'NOT CLEARED'}</small><p>${esc_(r.what)}${r.ok?'':' · the offer stays on the board'}</p></div><div class="gcPz${r.ok?'':' no'}">${r.ok&&r.paid?'+'+fmtCr(r.paid):r.ok?'CLEARED':'NO PRIZE'}</div>`;
 const h=box.querySelector('.sub');if(h&&h.nextSibling)h.parentNode.insertBefore(d,h.nextSibling);else box.prepend(d);
 const rows=[...box.querySelectorAll('div')].filter(x=>x.querySelector(':scope>button.btn'));const row=rows[rows.length-1];
 if(row){row.innerHTML=`<button class="btn go" id="gcBack"><span>Back to the garage</span></button>`+(r.ok?'':`<button class="btn" id="gcRetry"><span>Try again</span></button>`);
  $('gcBack').onclick=back;const t=$('gcRetry');if(t)t.onclick=retry}
 P.resHook=back;UI.res=r}
function back(){try{P.cleanupRace()}catch(e){}const r=UI.res;UI.res=null;P.gcRun=null;P.sfx&&P.sfx('select');UI.who='vin';UI.view='talk';UI.f=0;UI.line=r?vinLine({res:r}):'';render();show('s8career')}
function retry(){const id=P.gcRun&&P.gcRun.o.id;try{P.cleanupRace()}catch(e){}UI.res=null;P.gcRun=null;const g=G(),i=g.offers.findIndex(o=>o.id===id);if(i<0){render();show('s8career');return}start(i)}

/* ---------------- the career menu (Esc in the garage): career is its own game, so leaving is a choice, not a key press ---------------- */
const MENU=[{ic:'back',t:'Back to the garage',a:()=>menuClose()},{ic:'chart',t:'Career progress',a:()=>{menuClose();talk('vin');const g=G(),ti=tierOf(g.rep),nx=TIERS[ti+1];say(`${TIERS[ti].n}. ${g.wins} cleared, ${fmtCr(g.earned)} earned.`+(nx?` ${nx.rep-g.rep} more and the ${nx.n} people call.`:` Nobody's above you.`))}},
 {ic:'bye',t:'Leave career',sub:'Back to the main menu. Everything is saved.',a:()=>{UI.menu=null;menuDraw();P.sfx&&P.sfx('back');show('menu')}}];
function menuOpen(){UI.menu={f:0};GS.hov=null;P.sfx&&P.sfx('select');menuDraw();hint()}
function menuClose(){UI.menu=null;P.sfx&&P.sfx('back');menuDraw();hint()}
function menuDraw(){const m=$('gcMenu');if(!m)return;sec.classList.toggle('menu',!!UI.menu);if(!UI.menu){m.classList.remove('on');return}const g=G(),T=TIERS[tierOf(g.rep)];
 m.innerHTML=`<div class="gcPf2"><div class="av">${svgI('race')}</div><div><b>Career</b><small>${T.n} &middot; ${g.wins} cleared &middot; ${fmtCr(P.SV().cr)}</small></div></div><div class="gcCh">`+MENU.map((r,i)=>`<div class="gcRow${i===UI.menu.f?' on':''}" data-i="${i}" style="--d:${60+i*55}ms">${svgI(r.ic)}<span>${r.t}</span></div>`).join('')+`</div>`;
 m.classList.add('on','fresh');m.querySelectorAll('.gcRow').forEach(e=>{const i=+e.dataset.i;e.onmouseenter=()=>menuFocus(i);e.onclick=()=>{menuFocus(i);menuPick()}})}
function menuFocus(i){if(!UI.menu||i===UI.menu.f)return;UI.menu.f=i;P.sfx&&P.sfx('move');const m=$('gcMenu');if(m)m.querySelectorAll('.gcRow').forEach(e=>e.classList.toggle('on',+e.dataset.i===i))}
function menuPick(){if(!UI.menu)return;const r=MENU[UI.menu.f],el=$('gcMenu').querySelector('.gcRow.on');if(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit')}P.sfx&&P.sfx('select');setTimeout(()=>r.a(),150)}

/* ---------------- the loading screen: everything is built before you see the garage, so every screen opens at once ---------------- */
const TIPS_LD=[['Nina','Brake in a straight line, then turn. The car can only do one damn thing at a time.'],['Vince','Marketplace cars are cheap for a reason. Nina likes a project.'],
 ['Nina','A tune costs money, but it\'s the cheapest speed you\'ll ever buy.'],['Vince','Win races, the better organisers call. Simple as that.'],['Nina','Keep it off the walls. Damage stays on the car until I fix it.'],['Vince','Quick Play is fine. Career is where the money is.']];
let LD=null;
/* the loading screen is the game's own start-up screen (build.py's #ptBoot, whose style stays in the page), with CAREER for POLY GT and the
   same slideshow of car stills */
function ldShow(){if(!LD){LD=document.createElement('div');LD.id='gcBoot';document.body.appendChild(LD);
  const bs=document.getElementById('ptBootSt'),st=document.createElement('style');st.textContent=(bs?bs.textContent.replace(/#ptBoot/g,'#gcBoot'):'')+'#gcBoot{display:none;z-index:99980}#gcBoot.on{display:flex}#gcBoot.out{opacity:0}';document.head.appendChild(st)}
 const g=G(),T=TIERS[tierOf(g.rep)];clearTimeout(LD._t);
 LD.className='';LD.innerHTML=`<div class="bs"></div><div class="bv"></div><div class="gt"><b>POLY <i>GT</i></b></div><div class="gb"></div><div class="lg">CAREER</div><div class="st">${T.n.toUpperCase()} &middot; ${g.wins} CLEARED</div><div class="ln"></div><div class="bp"><div class="bl"><span>LOADING</span><b>0%</b></div><div class="bt"><u></u></div></div>`;
 void LD.offsetWidth;LD.classList.add('on');sec.classList.add('ld');ldSlide(true)}
function ldSlide(first){if(!LD||!LD.classList.contains('on')||LD.classList.contains('out'))return;const L=window.PT8_BOOTBG||[],s=LD.querySelector('.bs');if(!L.length||!s)return;
 LD._i=first?Math.random()*L.length|0:((LD._i|0)+1)%L.length;let x=L[LD._i];const m=x.charAt(1)===','?x.charAt(0):'';if(m)x=x.slice(2);
 LD.classList.toggle('bx',m==='b'||m==='w');LD.classList.toggle('lt',m==='w');LD.classList.toggle('up',m==='u');
 const e=document.createElement('div'),r=()=>(Math.random()*3-1.5).toFixed(2)+'%';e.style.backgroundImage='url(data:image/jpeg;base64,'+x+')';e.style.setProperty('--x0',r());e.style.setProperty('--y0',r());s.appendChild(e);void e.offsetWidth;e.className='on';
 const o=[...s.children].filter(c=>c!==e);setTimeout(()=>o.forEach(c=>c.remove()),1800);LD._t=setTimeout(()=>ldSlide(false),6500)}
function ldProg(f){if(!LD)return;const u=LD.querySelector('.bt u'),b=LD.querySelector('.bl b');if(u)u.style.width=Math.round(f*100)+'%';if(b)b.textContent=Math.round(f*100)+'%'}
function ldHide(){sec.classList.remove('ld');aim();if(!LD)return;LD.classList.add('rdy','out');clearTimeout(LD._t);setTimeout(()=>{if(LD&&LD.classList.contains('out'))LD.classList.remove('on')},1000)}
const tick0=()=>new Promise(r=>setTimeout(r,16));
async function loadCareer(){const t0=performance.now();ldShow();ldProg(.04);GS.onProg=f=>ldProg(.04+f*.6);
 try{await buildScene();ldProg(.66);setCar();await tick0();
  /* the thumbnails the Marketplace and the car list will show */
  const ids=[...G().mkt.map(l=>l.id),...owned().map(x=>x.id),curCar().id];for(let i=0;i<ids.length;i++){try{P.carThumb&&P.carThumb(ids[i])}catch(e){}ldProg(.66+.22*(i+1)/ids.length);await tick0()}
  refreshCar();if(GS.ok){try{R.compile(GS.sc,GS.cam)}catch(e){}if(!GS.pics)portraits()}ldProg(.96);await tick0()}catch(e){console.warn('career load',e)}
 ldProg(1);const left=2400-(performance.now()-t0);if(left>0)await new Promise(r=>setTimeout(r,left));ldHide()}

/* ---------------- entering, keys, back ---------------- */
P.careerEnter=()=>{P.sfx&&P.sfx('select');P.ui.ST.ret='menu';const g=G();UI.who=g.met?null:'vin';UI.view='talk';UI.f=0;UI.ch=null;UI.menu=null;UI.line='';UI.tag=1;render();show('s8career');loadCareer()};
function escBack(){if(UI.view==='sellForm'){UI.sf=null;openSell();return}if(UI.view==='sell'){UI.view='mkt';UI.f=G().mkt.length;say(`Sure.`);drawDlg();hint();return}
 if(UI.view==='tune'){tuneDone();aim();drawDlg();hint();return}
 if(UI.view==='cars'){UI.view='talk';UI.f=0;leave();return}
 if(UI.who&&(UI.view==='offers'||UI.view==='mkt')){UI.view='talk';UI.f=0;say(UI.who==='vin'?`Sure.`:`Something else, then?`);drawDlg();hint();return}
 if(UI.who&&UI.ch){UI.ch=null;UI.f=0;say(UI.who==='red'?`Fine. What else?`:`Okay.`);drawDlg();hint();return}
 leave()}
{const fb=P.frBack;P.frBack=()=>{if(scr==='s8career'&&sec.classList.contains('gcOn')){if(LD&&LD.classList.contains('on')&&!LD.classList.contains('rdy'))return true;if(UI.menu){menuClose();return true}if(UI.view==='pc'){if(PC.sf){PC.sf=null;pcDraw()}else if(PC.cv){PC.cv=null;pcDraw()}else closePC();return true}if(UI.who||onCar()){escBack();return true}menuOpen();return true}return fb?fb():false}}
addEventListener('keydown',e=>{if(scr!=='s8career'||!sec.classList.contains('gcOn'))return;if(FD.on){e.preventDefault();e.stopImmediatePropagation();return}if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;const c=e.code;
 if(LD&&LD.classList.contains('on')&&!LD.classList.contains('rdy')){e.preventDefault();e.stopImmediatePropagation();return}
 if(UI.view==='pc'){if(c==='Escape'||c==='Backspace'){e.preventDefault();e.stopImmediatePropagation();if(PC.sf){PC.sf=null;pcDraw()}else if(PC.cv){PC.cv=null;pcDraw()}else closePC()}else if(/^Digit[1-4]$/.test(c)&&PC.cv&&PC.opts&&PC.opts[+c[5]-1]){e.preventDefault();e.stopImmediatePropagation();PC.opts[+c[5]-1].a()}return}
 if(UI.menu){if(c==='ArrowDown'||c==='KeyS')menuFocus((UI.menu.f+1)%MENU.length);else if(c==='ArrowUp'||c==='KeyW')menuFocus((UI.menu.f+MENU.length-1)%MENU.length);else if(c==='Enter'||c==='Space')menuPick();else return;e.preventDefault();e.stopImmediatePropagation();return}
 if(!UI.who&&!onCar()){if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){const d=c==='ArrowLeft'||c==='KeyA'?-1:1;let t=UI.tag;for(let n=0;n<TAGK.length;n++){t=(t+d+TAGK.length)%TAGK.length;if(TAGK[t]==='car'?GS.car:TAGK[t]==='pc'?GS.laptop:GS[TAGK[t]]&&GS[TAGK[t]].g)break}UI.tag=t;GS.hov=TAGK[t];P.sfx&&P.sfx('move')}
  else if(c==='Enter'||c==='Space'){act(GS.hov||TAGK[UI.tag]);GS.hov=null}else return;e.preventDefault();e.stopImmediatePropagation();return}
 const n=nC();if(c==='ArrowDown'||c==='KeyS')focusC((UI.f+1)%n);else if(c==='ArrowUp'||c==='KeyW')focusC((UI.f+n-1)%n);
 else if(UI.view==='tune'&&(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD')){if(UI.f<P.TUNE.length)tuneAdj(UI.f,c==='ArrowLeft'||c==='KeyA'?-1:1)}
 else if(UI.view==='sellForm'&&UI.f===0&&(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'))sfAdj(c==='ArrowLeft'||c==='KeyA'?-1:1)
 else if(c==='Enter'||c==='Space')pickC();
 else if(/^Digit[1-9]$/.test(c)&&+c[5]<=n&&UI.view!=='tune'){focusC(+c[5]-1);finishType();pickC()}else return;e.preventDefault();e.stopImmediatePropagation()},true);
P.gcDebug=()=>({G:G(),UI,GS,run:P.gcRun});P.gcPC=(t,c)=>openPC(t,c);P.gcPCClick=sel=>{const e=PC.el&&PC.el.querySelector(sel);if(e)e.click();return !!e};P.gcCvBuy=()=>{mktFill();return cvBuy(G().mkt[0]).id};P.gcCvSell=()=>{const x=owned()[0];const s_={id:x.id,uid:uid(),ask:20000,title:'Clean one',ch:.5,ok:true,due:Date.now()+9e5,tx:1};sales().push(s_);cvSell(s_);return CV()[CV().length-1].id};P.gcCV=CV;P.gcRoam=(k,i)=>{const pe=GS[k];if(pe){if(!pe.home)roamInit(pe,k);startTask(pe,k,STN[k][i]);pe.nxR=30}};P.gcNav=()=>NAV;P.gcSetCar=()=>setCar(true);P.gcSell=()=>{talk('vin');openSell()};P.gcSellPick=i=>pickSell(i);P.gcSellList=()=>sfList();P.gcPath=(k,x,z)=>navPath(GS[k].g.position,V3(x,0,z),null);P.gcTalk=talk;P.gcAct=act;P.gcPick=(x,y)=>pickAt(x,y);P.gcHover=k=>{GS.hov=k};P.gcPop=popIn;
})();
