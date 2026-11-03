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
const ICO={fix:'<path d="M14.5 6.5a4 4 0 0 0-5.4 5.1L4 16.7 7.3 20l5.1-5.1a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',tune:'<path d="M5 4v6M5 14v6M12 4v3M12 11v9M19 4v9M19 17v3"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="15" r="2"/>',
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
 'If you keep hitting the wall, the car gets slower. I can fix it, but it costs.','On hot laps, a clean lap beats a fast messy one. Every damn time.'];
function vinLine(state){const g=G(),r=state&&state.res,nm=(P.SV().name||'').trim();
 if(r){const fix=wearOf(curCar().id)>.2?' Might want Nina to look at the car.':'';
  if(r.ok){const p=r.paid?` ${fmtCr(r.paid)}, as promised.`:'';return rnd([`Nice. ${r.what}.${p}`,`${r.what}. Not bad.${p}`,`Knew you had it. ${r.what}.${p}`])+(r.tierUp?` People are talking. You're ${TIERS[r.tierUp].n} level now.`:'')+fix}
  return rnd([`${r.what}. Happens. Offer's still there.`,`${r.what}. Eh. Go again.`,`${r.what}. Maybe get Nina to tune it.`])+fix}
 if(!g.met)return `${nm?nm+', right? ':''}I'm Vince. I get you races, and I know where the cheap cars are. Nina does the wrenching.`;
 return Math.random()<.4?moneyLine():rnd([`Hey.`,`What's up.`,`Yeah?`,`Oh, it's you. Good.`,`Got a few things going on.`])}
function redLine(){const c=curCar(),w=wearOf(c.id);if(w>.35)return rnd([`What the hell did you do to my car? It's at ${pctOK(c.id)}%.`,`Jesus. The ${c.car.name} is at ${pctOK(c.id)}%. Let me fix it before you race again.`]);
 if(w>.02)return `A few scratches on the ${c.car.name}. It's at ${pctOK(c.id)}%.`;return rnd([`Hey. The ${c.car.name} is ready to go.`,`Need something? I'm here.`,`Car's clean. Want me to tune it?`,`Hell of a car, this one. What do you need?`])}
const GOT=['Got the %s for you!','Got the %s for you! Keys are in it.','Got the %s for you! Try not to scratch this one.','Got the %s for you! Damn, I love this one.'];
const TUNE_L={gear:[`Shorter gears. It'll jump off the line, but top speed takes a hit.`,`Longer gears. Faster on the straights, lazy out of the corners.`],
 tyre:[`Softer tyres. Grippy as hell, but they wear quicker.`,`Harder compound. Lasts forever, slides a bit.`],
 susp:[`Softer springs. Better over bumps and gravel.`,`Stiffer. Sharp on tarmac. Your back will hate it.`],
 aero:[`Less wing. Slippery. Don't be a hero in the fast bends.`,`More wing. Sticks in corners, slower on the straights.`],
 brake:[`Softer brakes. Easier to feel.`,`Stronger brakes. Don't lock the damn things.`]};

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
function badPaint(root,c){if(!root||!c)return;/* body and trim get a cheap respray: every lit surface pulled hard towards one loud colour, windows and tyres left dark */
 const col=new THREE.Color(c);root.traverse(m=>{if(!m.isMesh||Array.isArray(m.material)||!m.material||(m.name!=='paint'&&m.name!=='body'))return;const mm=m.material.clone(),prev=mm.onBeforeCompile;
  mm.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.uBad={value:col};sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uBad;').replace('#include <color_fragment>','#include <color_fragment>\n{float l=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb=mix(diffuseColor.rgb,uBad*(.3+.4*l),smoothstep(.04,.12,l)*.92);}')};
  mm.customProgramCacheKey=()=>'gcBad'+(prev?1:0);mm.roughness=.95;mm.metalness=0;m.material=mm})}
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
function blob(r){const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.012;m.renderOrder=2;m.userData.noOL=1;return m}
/* Hakan's garage, baked offline (tools/garage/bake.py) to flat colours per face: a json header, then per group uint16 positions and one rgb per face.
   'shell' is the room and the big furniture, 'clutter' the small stuff that is hidden while you talk to someone */
function garMesh(b64){const buf=b64u(b64),dv=new DataView(buf),hl=dv.getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl)));let o=4+hl;const out={},mn=h.min,mx=h.max;
 for(const g of h.g){const nv=g.n*3,q=new Uint16Array(buf.slice(o,o+nv*6));o+=nv*6;const c=new Uint8Array(buf.slice(o,o+g.n*3));o+=g.n*3;
  const pos=new Float32Array(nv*3),col=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const a=i%3;pos[i]=mn[a]+q[i]/65535*(mx[a]-mn[a])}
  for(let f=0;f<g.n;f++)for(let a=0;a<3;a++){const v=Math.pow(c[f*3+a]/255,2.2);col[f*9+a]=col[f*9+3+a]=col[f*9+6+a]=v}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();geo.computeBoundingSphere();
  out[g.k]=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.86,metalness:0,side:THREE.DoubleSide}))}return out}
/* the hover outline: an inverted hull pushed out along smoothed normals, white and see-through */
function smoothN(geo){if(geo.attributes.oN)return;if(!geo.attributes.normal)geo.computeVertexNormals();const p=geo.attributes.position,n=geo.attributes.normal,m=new Map(),acc=[],ids=new Int32Array(p.count);
 for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*1e3)+','+Math.round(p.getY(i)*1e3)+','+Math.round(p.getZ(i)*1e3);let j=m.get(k);if(j==null){j=acc.length/3;m.set(k,j);acc.push(0,0,0)}ids[i]=j;acc[j*3]+=n.getX(i);acc[j*3+1]+=n.getY(i);acc[j*3+2]+=n.getZ(i)}
 const o=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const j=ids[i],x=acc[j*3],y=acc[j*3+1],z=acc[j*3+2],l=Math.hypot(x,y,z)||1;o[i*3]=x/l;o[i*3+1]=y/l;o[i*3+2]=z/l}
 geo.setAttribute('oN',new THREE.BufferAttribute(o,3))}
function outline(root,wm,hW){const L=[],ms=[];root.updateMatrixWorld(true);root.traverse(m=>{if(m.isMesh&&m.visible&&m.geometry&&m.geometry.attributes.position&&!m.userData.isOL&&!m.userData.noOL)ms.push(m)});
 /* skinned people: their bones carry the scale, so size the line from the bind-pose height against the real height */
 let D=0;if(hW)for(const m of ms)if(m.isSkinnedMesh){m.geometry.computeBoundingBox();const z=m.geometry.boundingBox.getSize(V3());D=Math.max(D,z.x,z.y,z.z)}
 for(const m of ms){try{smoothN(m.geometry)}catch(e){continue}const u={value:m.isSkinnedMesh&&D?wm*D/hW:wm/(m.matrixWorld.getMaxScaleOnAxis()||1)};
  const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.BackSide,depthWrite:false,fog:false,skinning:!!m.isSkinnedMesh});
  mat.onBeforeCompile=sh=>{sh.uniforms.uW=u;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 oN;uniform float uW;').replace('#include <begin_vertex>','vec3 transformed=position+oN*uW;')};
  mat.customProgramCacheKey=()=>'gcOL'+(m.isSkinnedMesh?1:0);
  let o;if(m.isSkinnedMesh){o=new THREE.SkinnedMesh(m.geometry,mat);o.bind(m.skeleton,m.bindMatrix)}else o=new THREE.Mesh(m.geometry,mat);
  o.position.copy(m.position);o.quaternion.copy(m.quaternion);o.scale.copy(m.scale);o.userData.isOL=1;o.frustumCulled=false;o.renderOrder=3;o.visible=false;m.parent.add(o);L.push(o)}
 return{L,a:0}}
function olSet(ol,on,dt){if(!ol)return;ol.a+=((on?.62:0)-ol.a)*Math.min(1,dt*10);const a=ol.a<.01?0:ol.a;for(const o of ol.L){o.material.opacity=a;o.visible=a>0}}
/* bones by role for the idle animation (names lose their dots and gain _<n> in the loader) */
function rig(bones){const R={};for(const b of bones){const r=b.name.replace(/_\d+$/,'').replace(/\./g,'');if(!R[r])R[r]=b;b.userData.q0=b.quaternion.clone()}return R}
async function buildScene(){if(GS.ok||GS.busy)return;GS.busy=true;
 try{const sc=new THREE.Scene();sc.background=new THREE.Color(0x15181c);sc.fog=new THREE.Fog(0x15181c,40,80);const cam=new THREE.PerspectiveCamera(56,16/9,.05,120);GS.sc=sc;GS.cam=cam;
  sc.add(new THREE.HemisphereLight(0xfff6ea,0x5d554c,.95));
  const ks=(x,y,z,tx,tz,i,ang,c)=>{const l=new THREE.SpotLight(c||0xffecd2,i,26,ang,.7,1.2);l.position.set(x,y,z);l.target.position.set(tx,0,tz);sc.add(l,l.target);return l};
  ks(SPOT.car.x,5.2,SPOT.car.z+.6,SPOT.car.x,SPOT.car.z,1.6,.62);ks(SPOT.red.x+.4,4.8,SPOT.red.z+1.2,SPOT.red.x,SPOT.red.z,.8,.5);ks(SPOT.vin.x+.6,4.8,SPOT.vin.z+1.4,SPOT.vin.x,SPOT.vin.z,.8,.5);
  const d=new THREE.DirectionalLight(0xfff1dc,.55);d.position.set(4,9,7);sc.add(d);const rim=new THREE.DirectionalLight(0x9fc4ff,.35);rim.position.set(-3,4,-9);sc.add(rim);
  let gm=null;try{if(window.GAR2_B64)gm=garMesh(window.GAR2_B64)}catch(e){console.warn('career garage',e)}
  if(gm){for(const k in gm)sc.add(gm[k]);GS.clutter=gm.clutter||null}
  else{const f=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x8d9097,roughness:.9}));f.rotation.x=-Math.PI/2;sc.add(f);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(40,10),new THREE.MeshStandardMaterial({color:0xc9bba8,roughness:1}));w.position.set(0,5,-6.2);sc.add(w)}
  /* Studio Ochi people (Hakan's packs): one character out of a pack, picked by its place along x. Skins with only a few bones are props
     (shovel, hammer): they stay when they sit close to the chosen person */
  const ochi=async(b64,k,spot,ry0,hTo)=>{const gl=b64?await parseGLB(b64):null;if(!gl)return null;const o=gl.scene;o.updateMatrixWorld(true);const sk=new Map(),props_=[];
   o.traverse(m=>{if(m.isSkinnedMesh){const bs=m.skeleton.bones;if(bs.length<8){props_.push(m);return}const key=bs[0];if(!sk.has(key))sk.set(key,{ms:[],bones:bs});sk.get(key).ms.push(m)}});
   const L=[...sk.values()].map(c=>{let x=0,y0=1e9,yh=-1e9;for(const b of c.bones){const p=b.getWorldPosition(V3());x+=p.x;y0=Math.min(y0,p.y);if(/head/i.test(b.name)&&!/end|top/i.test(b.name))yh=Math.max(yh,p.y)}return Object.assign(c,{x:x/c.bones.length,y0,yh})}).sort((a,b)=>a.x-b.x);
   const pick=L[Math.min(k,L.length-1)];if(!pick)return null;const keep=new Set(pick.bones),hip=pick.bones[0].getWorldPosition(V3());
   const near=m=>{const p=m.skeleton.bones[0].getWorldPosition(V3());let best=1e9,bx=null;for(const c of L){const d=Math.abs(p.x-c.x);if(d<best){best=d;bx=c}}return bx===pick};
   o.traverse(m=>{if(!m.isMesh)return;if(m.isSkinnedMesh){m.visible=props_.includes(m)?near(m):pick.ms.includes(m)}else{let a=m.parent,ok=false;while(a){if(keep.has(a)){ok=true;break}a=a.parent}m.visible=ok}if(m.visible){m.frustumCulled=false;if(m.material)m.material.envMapIntensity=.3}});
   const inner=new THREE.Group(),w=new THREE.Group();inner.add(o);o.position.set(-hip.x,-pick.y0,-hip.z);w.add(inner);
   const hy0=(pick.yh>-1e8?pick.yh:1.5)-pick.y0,ks_=hTo/Math.max(.3,hy0);inner.scale.setScalar(ks_);w.position.copy(spot);w.rotation.y=ry0;w.add(blob(.42));sc.add(w);
   const pe={g:w,h:hTo+.1,hy:hTo+.12,rig:rig(pick.bones),ry0};pe.ol=outline(w,.03,hTo+.15);return pe};
  /* Nina: the girl with the orange helmet and the hammer (Construction People, far left), half turned to the car she's working on.
     Vince: the man in the dark suit (Business People, 4th), by the bench, looking at his hands */
  const camY=s=>yawTo(s,SPOT.over.p);
  try{GS.red=await ochi(window.CON_B64,0,SPOT.red,lerpA(yawTo(SPOT.red,SPOT.car),camY(SPOT.red),.45),1.52)}catch(e){console.warn('career nina',e)}
  try{GS.vin=await ochi(window.BIZ_B64,3,SPOT.vin,camY(SPOT.vin)+.25,1.6)}catch(e){console.warn('career vince',e)}
  if(GS.red)GS.red.foc=()=>V3(SPOT.car.x+.6,.75,SPOT.car.z+.3);if(GS.vin)GS.vin.foc=()=>{const g=GS.vin.g,r=GS.vin.ry0;return V3(g.position.x+Math.sin(r)*.45,.95,g.position.z+Math.cos(r)*.45)};
  GS.cp.copy(SPOT.over.p);GS.cl.copy(SPOT.over.l);GS.tp.copy(SPOT.over.p);GS.tl.copy(SPOT.over.l);GS.ok=true;setCar(true)}
 catch(e){console.warn('career scene',e)}GS.busy=false}
/* the current car, built like cinema.js does (scaled to its real length, wheels on the floor), in its saved paint */
function setCar(force){if(!GS.ok)return;const c=curCar(),L=paintOf(c.id),key=c.id+':'+c.alt+':'+JSON.stringify(L||0);if(!force&&GS.carKey===key&&GS.car)return;
 if(GS.car){GS.sc.remove(GS.car);GS.car=null}GS.carKey=key;const idx=P.modelOf(c.id,c.alt),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src){GS.carKey='';return}
 const model=src.clone(true),g=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);g.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(V3()),ct=bb.getCenter(V3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);g.scale.setScalar(k);g.rotation.y=(sz.x>sz.z?Math.PI/2:0)+Math.PI;
 const o=new THREE.Group();o.add(g);o.position.copy(SPOT.car);o.rotation.y=SPOT.carRy;o.add(blob(2.9));o.traverse(m=>{if(m.isMesh){const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>{if(x&&x.isMeshStandardMaterial)x.envMapIntensity=.55})}});
 if(L)badPaint(model,L);
 GS.sc.add(o);GS.car=o;o.updateMatrixWorld(true);GS.carBox=new THREE.Box3().setFromObject(o);GS.carOl=outline(g,.035)}
/* portraits for the text box: each head rendered once, front on */
function portraits(){if(GS.pics)return;GS.pics=1;const rt=new THREE.WebGLRenderTarget(192,192);rt.texture.encoding=THREE.sRGBEncoding;const pc=new THREE.PerspectiveCamera(26,1,.05,20),fog=GS.sc.fog;GS.sc.fog=null;
 for(const k of ['red','vin']){const pe=GS[k];if(!pe||!pe.g)continue;try{const g=pe.g,r0=g.rotation.y,ry=yawTo(g.position,SPOT.over.p);g.rotation.y=ry;g.updateMatrixWorld(true);
  const hb=pe.rig&&(pe.rig.spine005||pe.rig.spine004),h=hb?hb.getWorldPosition(V3()):headOf(k);h.y+=hb?.04:-.06;pc.position.set(h.x+Math.sin(ry)*.95,h.y+.05,h.z+Math.cos(ry)*.95);pc.lookAt(h);for(const o of pe.ol.L)o.visible=false;
  R.setRenderTarget(rt);R.setClearColor(0x2a2e33,1);R.clear();R.render(GS.sc,pc);const px=new Uint8Array(192*192*4);R.readRenderTargetPixels(rt,0,0,192,192,px);R.setRenderTarget(null);
  const cv=document.createElement('canvas');cv.width=cv.height=192;const cx=cv.getContext('2d'),im=cx.createImageData(192,192);for(let y=0;y<192;y++)im.data.set(px.subarray((191-y)*768,(192-y)*768),y*768);cx.putImageData(im,0,0);
  pe.pic=cv.toDataURL();g.rotation.y=r0}catch(e){console.warn('career portrait',e)}}
 GS.sc.fog=fog;rt.dispose();const im=sec.querySelector('#gcBox .pic img');if(im&&UI.who&&GS[UI.who]&&GS[UI.who].pic)im.src=GS[UI.who].pic}
/* camera targets */
function headOf(who){const p=GS[who],base=p&&p.g?p.g.position:who==='red'?SPOT.red:SPOT.vin;return V3(base.x,p&&p.hy?p.hy:1.62,base.z)}
const onCar=()=>UI.view==='cars'||UI.view==='tune';
function camFor(who){if(!who)return SPOT.over;const h=headOf(who),from=SPOT.over.p,dir=V3(from.x-h.x,0,from.z-h.z).normalize(),side=V3(dir.z,0,-dir.x);
 /* close up, a little from above: the person on the left, the choices on the right, the text box under them */
 const p=h.clone().addScaledVector(dir,2.25).addScaledVector(side,.15);p.y=h.y+.22;const l=h.clone().addScaledVector(side,.72);l.y=h.y-.38;return{p,l}}
function aim(){let c;if(onCar()){const s=SPOT.car,tu=UI.view==='tune';/* from the door side, the car on the left of the shot */
  c={p:s.clone().add(tu?V3(.9,1.25,3.7):V3(.5,1.9,4.5)),l:s.clone().add(tu?V3(1.5,.45,0):V3(1.75,.35,0))}}else c=camFor(UI.who);
 GS.tp.copy(c.p);GS.tl.copy(c.l)}
function tick(dt){GS.t+=dt;const k=1-Math.exp(-dt*3.4);GS.cp.lerp(GS.tp,k);GS.cl.lerp(GS.tl,k);if(!GS.pics)portraits();
 const cam=GS.cam,s=UI.who?.01:.04;cam.position.set(GS.cp.x+Math.sin(GS.t*.23)*s,GS.cp.y+Math.sin(GS.t*.31)*s*.4,GS.cp.z);cam.lookAt(GS.cl);
 const W=R.domElement.width,H=R.domElement.height;if(H&&Math.abs(cam.aspect-W/H)>1e-3){cam.aspect=W/H;cam.updateProjectionMatrix()}
 /* talking: the room fades into the dark behind whoever you're with, and the small clutter goes away once it can't be seen */
 const fo=UI.who||onCar();GS.fk+=((fo?1:0)-GS.fk)*Math.min(1,dt*2.6);const tg=onCar()?SPOT.car:UI.who?headOf(UI.who):null,dd=tg?cam.position.distanceTo(tg):6;
 GS.sc.fog.near=40+(dd+.9-40)*GS.fk;GS.sc.fog.far=80+(dd+6.5-80)*GS.fk;if(GS.clutter)GS.clutter.visible=GS.fk<.85;
 for(const k of ['red','vin']){const pe=GS[k];if(pe&&pe.rig)try{anim(pe,k,dt)}catch(e){if(!GS.aerr){GS.aerr=1;console.warn('career anim',e)}}if(pe)olSet(pe.ol,!UI.who&&!onCar()&&GS.hov===k,dt)}
 olSet(GS.carOl,!UI.who&&GS.hov==='car',dt);type(dt);tags()}
/* idle life on top of the file's pose: breathing and a weight shift; the head on whatever they're busy with, on your cursor when you hover over
   them, on you while you talk; they turn to face you when you walk up, react to every answer, and Nina gets stuck in while she tunes */
const QW=new THREE.Quaternion(),QP=new THREE.Quaternion(),QD=new THREE.Quaternion();
function rotW(b,axis,ang){if(!b||!ang)return;b.parent.updateWorldMatrix(true,false);b.parent.getWorldQuaternion(QP);QW.setFromAxisAngle(axis,ang);QD.copy(QP).invert().multiply(QW).multiply(QP);b.quaternion.premultiply(QD)}
function anim(pe,k,dt){const B=pe.rig,t=GS.t+(k==='red'?1.7:0),g=pe.g;for(const r in B)if(B[r].userData.q0)B[r].quaternion.copy(B[r].userData.q0);
 const me=UI.who===k&&!onCar(),work=k==='red'&&UI.view==='tune',hov=!UI.who&&GS.hov===k;
 const ryT=me?yawTo(g.position,GS.tp)-.15:work?yawTo(g.position,SPOT.car):pe.ry0;g.rotation.y=lerpA(g.rotation.y,ryT,Math.min(1,dt*3.2));
 const ry=g.rotation.y,fw=V3(Math.sin(ry),0,Math.cos(ry)),rt=V3(Math.cos(ry),0,-Math.sin(ry)),up=V3(0,1,0);
 pe.tk=Math.max(0,(pe.tk||0)-dt);pe.wv=Math.max(0,(pe.wv||0)-dt);pe.re=Math.max(0,(pe.re||0)-dt*1.25);
 const h=headOf(k),tp=me?GS.cam.position:hov&&GS.cur?GS.cur:work?V3(SPOT.car.x,.6,SPOT.car.z):pe.foc?pe.foc():GS.cam.position;
 const dx=tp.x-h.x,dz=tp.z-h.z,dy=tp.y-h.y;let yaw=wrapA(Math.atan2(dx,dz)-ry),pit=-Math.atan2(dy,Math.hypot(dx,dz));
 if(!me&&!hov&&!work)yaw+=Math.sin(t*.21)*.18;yaw=Math.max(-.85,Math.min(.85,yaw));pit=Math.max(-.3,Math.min(.6,pit));
 const kk=Math.min(1,dt*(hov||me?5:2.2));pe.hy_=pe.hy_==null?yaw:pe.hy_+(yaw-pe.hy_)*kk;pe.hp_=pe.hp_==null?pit:pe.hp_+(pit-pe.hp_)*kk;
 const br=Math.sin(t*2*Math.PI/3.8),sw=Math.sin(t*.42),tk=pe.tk>0?Math.min(1,pe.tk)*Math.sin(t*7.5):0,re=pe.re>0?Math.sin(Math.PI*(1-pe.re)):0;
 rotW(B.spine,fw,sw*.022);rotW(B.spine,up,Math.sin(t*.31)*.04);
 if(work){rotW(B.spine002,rt,.2+Math.sin(t*3.1)*.03);rotW(B.spine003,rt,.12)}
 rotW(B.spine002,rt,-br*.018-re*.07);rotW(B.spine003,rt,-br*.022);rotW(B.spine003,fw,-sw*.014+re*.04);
 rotW(B.spine004,up,pe.hy_*.35);rotW(B.spine005,up,pe.hy_*.4);rotW(B.spine006,up,pe.hy_*.25);
 rotW(B.spine004,rt,pe.hp_*.3);rotW(B.spine005,rt,pe.hp_*.45+tk*.05);rotW(B.spine006,rt,pe.hp_*.2);rotW(B.spine006,fw,Math.sin(t*.37)*.035+re*.09);
 for(const [s,sg] of [['L',1],['R',-1]]){rotW(B['upper_arm'+s],fw,sg*br*.02);rotW(B['shoulder'+s],fw,-sg*(br*.012+re*.12))}
 if(pe.hand==null){let hi=null,hy=-1e9;for(const s of ['L','R']){const hb=B['hand'+s];if(hb){const p=hb.getWorldPosition(V3());if(p.y>hy){hy=p.y;hi=s}}}const sh=B['spine004'];pe.hand=hi&&sh&&hy>sh.getWorldPosition(V3()).y-.05?hi:''}
 const arm=pe.hand||'R',sg=arm==='L'?1:-1;
 if(work)rotW(B['forearm'+arm],fw,Math.max(0,Math.sin(t*6.5))*.6*sg);
 else if(pe.hand){const w=pe.wv>0?Math.min(1,pe.wv)*Math.sin(t*9):Math.sin(t*1.1)*.08;rotW(B['forearm'+pe.hand],fw,w*.35*sg)}
 else if(re)rotW(B['forearm'+arm],fw,re*.3*sg)}
/* the hover tag over whatever the cursor is on */
function tags(){const t=$('gcTag');if(!t)return;const k=!UI.who&&!onCar()&&GS.ok?GS.hov:null;t.classList.toggle('on',!!k);if(!k)return;
 const p=k==='car'?V3(SPOT.car.x,(GS.carBox?GS.carBox.max.y:1.3)+.25,SPOT.car.z):headOf(k).add(V3(0,.38,0));p.project(GS.cam);
 if(t.dataset.k!==k){t.dataset.k=k;const d=k==='car'?{n:curCar().car.name,r:'Your car',a:'Change car',c:'#e8eef5'}:k==='red'?{n:RED.n,r:RED.role,a:'Talk',c:RED.col}:{n:VIN.n,r:VIN.role,a:'Talk',c:VIN.col};
  t.style.setProperty('--c',d.c);t.innerHTML=`<small>${d.r}</small><b>${esc_(d.n)}</b><em>${d.a}</em>`}
 t.style.left=((p.x*.5+.5)*innerWidth).toFixed(1)+'px';t.style.top=((-p.y*.5+.5)*innerHeight).toFixed(1)+'px'}
/* what's under the cursor: people first (thin boxes around them), then the car */
const RC=new THREE.Raycaster(),MV=new THREE.Vector2();
function pickAt(cx,cy){if(!GS.ok)return null;MV.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);RC.setFromCamera(MV,GS.cam);let best=null,bd=1e9;
 for(const k of ['red','vin']){const pe=GS[k];if(!pe||!pe.g)continue;const p=pe.g.position,b=new THREE.Box3(V3(p.x-.4,0,p.z-.4),V3(p.x+.4,(pe.hy||1.6)+.28,p.z+.4)),hit=RC.ray.intersectBox(b,V3());
  if(hit){const d=hit.distanceTo(RC.ray.origin);if(d<bd){bd=d;best=k}}}
 if(!best&&GS.carBox&&RC.ray.intersectBox(GS.carBox,V3()))best='car';
 if(best&&best!=='car')GS.cur=RC.ray.at(GS.cam.position.distanceTo(headOf(best)),V3());return best}
{const f0=frame;let vis=false;const MENU_BG=['menu','s8cards','s8quick','s8pick','s8setup','s8career','s8res'];
 frame=function(n){if(scr==='s8career'&&GS.ok&&sec.classList.contains('gcOn')){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
   try{tick(dt);R.render(GS.sc,GS.cam)}catch(e){if(!GS.err){GS.err=1;console.warn('career frame',e)}}
   if(!vis){vis=true;R.domElement.style.visibility='';document.body.classList.add('gcG')}return}
  if(vis){vis=false;document.body.classList.remove('gcG');R.domElement.style.visibility=MENU_BG.includes(scr)&&!(RACE&&scr==='s8res')?'hidden':''}
  return f0.apply(this,arguments)}}

/* ---------------- screen ---------------- */
const CSS=`
body.gcG #v8Bg{opacity:0!important}
#s8career.gcOn{cursor:default}#s8career.gcOn.hv{cursor:pointer}
#s8career.gcOn::before{background:linear-gradient(180deg,#07090cb0 0%,#07090c30 13%,transparent 30%,transparent 70%,#07090cc0 100%)!important}
#s8career.gcOn .gcVig{position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0;transition:opacity .6s;background:radial-gradient(ellipse at 30% 50%,transparent 35%,#07090ca0 100%),linear-gradient(90deg,transparent 45%,#07090c90 100%)}
#s8career.gcOn.talk .gcVig{opacity:1}
#s8career.gcOn .gcTag{position:absolute;z-index:2;transform:translate(-50%,-100%) translateY(8px);pointer-events:none;padding:8px 16px 9px;border-radius:10px;text-align:center;white-space:nowrap;opacity:0;
 background:linear-gradient(180deg,#2a2e33ec,#141619f2);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 10px 26px #000c;transition:opacity .2s,transform .25s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcTag.on{opacity:1;transform:translate(-50%,-100%)}
#s8career.gcOn .gcTag::after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#141619}
#s8career.gcOn .gcTag small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:var(--c);text-transform:uppercase}
#s8career.gcOn .gcTag b{display:block;font:400 18px var(--gt);color:#fff;margin:1px 0 3px}
#s8career.gcOn .gcTag em{display:inline-block;font:600 10px var(--gt);letter-spacing:.14em;text-transform:uppercase;font-style:normal;color:#fff;padding:3px 9px;border-radius:999px;background:var(--gxa,linear-gradient(180deg,#8fb4d8,#33608c));box-shadow:inset 0 1px 0 #ffffff90}
#s8career.gcOn .gcTier{position:absolute;left:24px;top:84px;z-index:2;display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:9px;background:rgba(20,23,27,.72);box-shadow:inset 0 0 0 1px #ffffff14;width:min(360px,40vw);transition:opacity .4s}
#s8career.gcOn .gcTier b{font:600 12px var(--gt);letter-spacing:.18em}
#s8career.gcOn .gcTier .bar{flex:1;height:5px;border-radius:3px;background:#ffffff14;overflow:hidden}#s8career.gcOn .gcTier .bar i{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#cfe2f5)}
#s8career.gcOn .gcTier small{font:500 10px var(--gt);color:#9aa4b0;white-space:nowrap}
#s8career.gcOn .gcCarI{position:absolute;left:24px;bottom:84px;z-index:2;padding:10px 14px;border-radius:9px;background:rgba(20,23,27,.72);box-shadow:inset 0 0 0 1px #ffffff14;transition:opacity .3s}
#s8career.gcOn.talk .gcCarI,#s8career.gcOn.talk .gcTier{opacity:0;pointer-events:none}
#s8career.gcOn .gcCarI small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#9aa4b0}#s8career.gcOn .gcCarI b{font:500 15px var(--gt)}#s8career.gcOn .gcCarI em{font:400 12px var(--gt);color:#c9d0d7;font-style:normal;margin-left:8px}
#s8career.gcOn .gcCarI em.bad{color:#ff9d90}
/* the choices: the main menu's tilted panel */
#s8career.gcOn .gcDlg{position:absolute;right:5vw;top:92px;max-height:calc(100vh - 220px);display:flex;flex-direction:column;transform:translateX(60px) perspective(1400px) rotateY(-9deg);transform-origin:right center;width:clamp(380px,33vw,580px);z-index:3;opacity:0;pointer-events:none;
 padding:clamp(12px,1.1vw,20px);box-sizing:border-box;border-radius:14px;background:linear-gradient(180deg,#2a2e33ec,#141619f2);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;transition:opacity .35s,transform .5s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcDlg.on{opacity:1;transform:translateX(0) perspective(1400px) rotateY(-9deg);pointer-events:auto}
#s8career.gcOn .gcDlg h6{margin:2px 8px 10px;font:600 11px var(--gt);letter-spacing:.24em;color:var(--c);text-transform:uppercase;display:flex;align-items:center;gap:10px}
#s8career.gcOn .gcDlg h6 span{margin-left:auto;color:#9aa4b0;letter-spacing:.14em}
#s8career.gcOn .gcCh{display:flex;flex-direction:column;gap:2px;overflow-y:auto;min-height:0;scrollbar-width:thin}
#s8career.gcOn .gcRow{position:relative;flex:none;display:flex;align-items:center;gap:16px;height:clamp(46px,6.2vh,60px);padding:0 18px;border-radius:999px;cursor:pointer;overflow:hidden;font:300 clamp(17px,2.3vh,23px) var(--gt);color:#ffffffb0;transition:background .15s,color .15s}
#s8career.gcOn .gcRow .mi{flex:none;width:24px;height:24px;opacity:.7;transition:transform .3s cubic-bezier(.3,1.6,.5,1),opacity .15s}
#s8career.gcOn .gcRow em{margin-left:auto;font:500 12px var(--gt);letter-spacing:.12em;color:#ffffff80;font-style:normal}
#s8career.gcOn .gcRow:hover{color:#fff}
#s8career.gcOn .gcRow.on{background:var(--gxa,linear-gradient(180deg,#8fb4d8 0%,#4f7eab 48%,#33608c 52%,#4a77a3 100%));color:#fff;text-shadow:0 1px 1px #0005;box-shadow:inset 0 1px 0 #ffffffa0,inset 0 -1px 0 #0004,0 0 24px #4f7eab90}
#s8career.gcOn .gcRow.on .mi{opacity:1;transform:scale(1.15) rotate(-6deg)}#s8career.gcOn .gcRow.on em{color:#e8f0f7}
#s8career.gcOn .gcRow.on::after,#s8career.gcOn .gcO.on::after{content:"";position:absolute;top:0;bottom:0;left:-40%;width:35%;background:linear-gradient(100deg,transparent,#ffffff50,transparent);animation:gcShine 2.6s ease-in-out .2s infinite}
@keyframes gcShine{0%{left:-40%}45%,100%{left:120%}}
#s8career.gcOn .gcRow.off{opacity:.45}
#s8career.gcOn .gcDlg.fresh .gcCh>div{animation:gcIn .5s cubic-bezier(.16,.85,.25,1) var(--d,0ms) backwards}
@keyframes gcIn{from{opacity:0;transform:translateX(30px)}}
#s8career.gcOn .gcCh>div.hit{animation:gcHit .22s ease-out}
@keyframes gcHit{0%{transform:scale(1)}40%{transform:scale(.96);filter:brightness(1.6)}100%{transform:scale(1)}}
#s8career.gcOn .gcO{position:relative;flex:none;overflow:hidden;display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;padding:6px 10px;margin-bottom:3px;border-radius:10px;cursor:pointer;background:#ffffff08;box-shadow:inset 0 0 0 1px #ffffff12;transition:box-shadow .15s,background .15s}
#s8career.gcOn .gcO.on{background:var(--gxa,linear-gradient(180deg,#4f7eabd0,#33608cd8));box-shadow:inset 0 1px 0 #ffffff80,0 0 22px #4f7eab90}#s8career.gcOn .gcO.on em,#s8career.gcOn .gcO.on small,#s8career.gcOn .gcO.on .pz u{color:#e8f0f7}
#s8career.gcOn .gcO canvas{width:96px;height:52px;border-radius:6px;background:#07090c}
#s8career.gcOn .gcO .sw{width:96px;height:52px;border-radius:6px;background:#07090c center/cover no-repeat;display:grid;place-items:center;font:600 10px var(--gt);letter-spacing:.14em;color:#9aa4b0}
#s8career.gcOn .gcO em{font:600 9px var(--gt);letter-spacing:.2em;color:#8fb4d8;font-style:normal}
#s8career.gcOn .gcO em.bad{color:#ff9d90}
#s8career.gcOn .gcO b{display:block;font:500 16px var(--gt);color:#f2f4f6;margin:1px 0}
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
#s8career.gcOn .gcBox{position:absolute;left:4vw;bottom:82px;width:min(860px,54vw);z-index:3;display:flex;gap:18px;align-items:flex-start;padding:16px 22px 18px 16px;box-sizing:border-box;border-radius:14px;
 background:linear-gradient(180deg,#2a2e33f0,#141619f6);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;opacity:0;transform:translateY(24px);pointer-events:none;transition:opacity .3s,transform .5s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcBox.on{opacity:1;transform:none;pointer-events:auto}
#s8career.gcOn .gcBox.pop{animation:gcPop .45s cubic-bezier(.16,.85,.25,1)}
@keyframes gcPop{from{opacity:0;transform:translateY(22px) scale(.97)}}
#s8career.gcOn .gcBox .pic{flex:none;width:88px;height:88px;border-radius:12px;overflow:hidden;display:grid;place-items:center;font:300 40px var(--gt);color:#fff;background:linear-gradient(160deg,var(--c),color-mix(in srgb,var(--c) 40%,#101215));box-shadow:inset 0 1px 0 #ffffffa0,0 0 0 2px var(--c),0 0 22px color-mix(in srgb,var(--c) 40%,transparent)}
#s8career.gcOn .gcBox .pic img{width:100%;height:100%;object-fit:cover;display:block}
#s8career.gcOn .gcBox.pop .pic{animation:gcPic .55s cubic-bezier(.3,1.6,.5,1)}
@keyframes gcPic{from{transform:scale(.6) rotate(-8deg);opacity:0}}
#s8career.gcOn .gcBox .bx{flex:1;min-width:0}
#s8career.gcOn .gcBox .nm{display:flex;align-items:baseline;gap:12px;margin:2px 0 6px}
#s8career.gcOn .gcBox .nm b{font:400 22px var(--gt);color:#fff}#s8career.gcOn .gcBox .nm small{font:600 10px var(--gt);letter-spacing:.2em;color:var(--c);text-transform:uppercase}
#s8career.gcOn .gcBox .tx{margin:0;font:300 clamp(16px,2.1vh,20px)/1.5 var(--gt);color:#eef1f4;min-height:3em}
#s8career.gcOn .gcBox .tx .ghost{visibility:hidden}
#s8career.gcOn .gcBox .tx .cur{display:inline-block;width:8px;height:1.05em;margin:0 1px -3px;background:var(--c);border-radius:2px;animation:gcBlink .6s steps(2) infinite}
#s8career.gcOn .gcBox .nx{position:absolute;right:16px;bottom:12px;color:var(--c);font-style:normal;opacity:0;transition:opacity .2s}#s8career.gcOn .gcBox .tx.done~.nx{opacity:1;animation:gcNx 1s ease-in-out infinite}
@keyframes gcNx{50%{transform:translateX(4px)}}
@keyframes gcBlink{50%{opacity:0}}
/* key hints like the main menu's */
#s8career.gcOn .gcPad{display:flex;gap:22px;justify-content:center;font:400 clamp(13px,1.5vh,16px) var(--gt);color:#e6e9ee}
#s8career.gcOn .gcPad span{display:flex;align-items:center;gap:8px}
#s8career.gcOn .gcPad u{text-decoration:none;min-width:22px;height:22px;padding:0 7px;box-sizing:border-box;border-radius:6px;display:grid;place-items:center;font:600 11px var(--gt);color:#e6e9ee;background:linear-gradient(180deg,#3a4048,#1a1d22);box-shadow:inset 0 1px 0 #ffffff40,0 0 0 1px #000,0 2px 0 #000}
#resBox .gcRes{display:flex;gap:14px;align-items:center;margin:4px 0 14px;padding:12px 16px;border-radius:10px;background:linear-gradient(180deg,rgba(62,68,76,.6),rgba(22,25,29,.8));box-shadow:inset 0 0 0 1px #ffffff14}
#resBox .gcRes small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#7fb6ff}#resBox .gcRes p{margin:3px 0 0;font:400 14px/1.4 var(--gt);color:#eef1f4}
#resBox .gcRes .gcPz{margin-left:auto;text-align:right;font:700 16px var(--mn);color:var(--ac2);white-space:nowrap}#resBox .gcRes .gcPz.no{color:#9aa4b0}
`;
{const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st)}

const sec=$('s8career');
/* who: null (overview), 'red' or 'vin'. view: talk, offers, mkt, cars, tune. ch: a one-off list of answers (a question she asked), f: focused row,
   tag: keyboard focus in the overview (0 Nina, 1 the car, 2 Vince) */
const UI={who:null,view:'talk',f:0,tag:1,line:'',res:null,ch:null};
const TAGK=['red','car','vin'];
function hdr(){const g=G(),T=TIERS[tierOf(g.rep)];return `<div class="hdr"><h2>CAREER <em>${T.n}</em></h2><small>${g.wins} cleared &middot; ${fmtCr(g.earned)} earned</small><div class="sp"></div><div class="crbox"><small>CREDITS</small><b class="crv">${fmtCr(P.SV().cr)}</b></div></div>`}
const carInfo=()=>{const c=curCar(),w=wearOf(c.id);return `<small>YOUR CAR</small><b>${c.car.name}</b> <span class="cls ${c.car.cls}">${c.car.cls}</span><em class="${w>.2?'bad':''}">Condition ${pctOK(c.id)}%</em>`};
function render(){P.gcRun=null;sec.classList.add('gcOn');buildScene().then(()=>{setCar()});setCar();const g=G();fillOffers();mktFill();const ti=tierOf(g.rep),T=TIERS[ti],nx=TIERS[ti+1];
 const prog=nx?Math.max(0,Math.min(1,(g.rep-T.rep)/(nx.rep-T.rep))):1;
 sec.innerHTML=hdr()+`<div class="gcVig"></div><div class="gcTier"><b>${T.n}</b><div class="bar"><i style="width:${Math.round(prog*100)}%"></i></div><small>${nx?g.rep+' / '+nx.rep+' rep to '+nx.n:'Top tier'}</small></div>
 <div class="gcTag" id="gcTag"></div><div class="gcCarI" id="gcCarI">${carInfo()}</div>
 <div class="gcDlg" id="gcDlg"></div><div class="gcBox" id="gcBox"><div class="pic"></div><div class="bx"><div class="nm"><b></b><small></small></div><p class="tx"></p></div><i class="nx">&#9656;</i></div>
 <div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="gcPad" id="gcHint"></div><span style="width:90px"></span></div>`;
 if(UI.who)talk(UI.who,true,UI.line);else{aim();hint()}}
function hint(){const h=$('gcHint');if(!h)return;sec.classList.toggle('talk',!!UI.who||onCar());
 const k=(a,b)=>`<span><u>${a}</u>${b}</span>`;
 h.innerHTML=!UI.who&&!onCar()?k('&larr;&rarr;','Look around')+k('Enter','Select')+k('Esc','Back'):UI.view==='tune'?k('&uarr;&darr;','Choose')+k('&larr;&rarr;','Adjust')+k('Esc','Done'):k('&uarr;&darr;','Choose')+k('Enter','Select')+k('Esc','Back')}

/* ---------------- talking ---------------- */
const fixCost=id=>repairCost(id),tuneFee=()=>{const c=curCar().car;return Math.max(400,Math.round((c.price||30000)*.015/50)*50)};
function choices(){if(UI.ch)return UI.ch;const c=curCar();if(UI.who==='red'){const cost=fixCost(c.id),L=[];
  if(cost)L.push({ic:'fix',t:'Fix the damage',pz:fmtCr(cost),off:P.SV().cr<cost,a:()=>{const sv=P.SV();if(sv.cr<cost){say(`That's ${fmtCr(cost)}. Win a damn race and come back.`);return}sv.cr-=cost;G().wear[c.id]=0;P.save();say(rnd([`Done. Good as new.`,`All fixed. Keep it off the damn walls this time.`]));refreshCar()}});
  L.push({ic:'tune',t:'Tune my car',a:askTune});
  L.push({ic:'swap',t:'Bring out another car',a:openCars});
  L.push({ic:'look',t:'How is the car looking?',a:()=>{const w=wearOf(c.id),T=TIERS[tierOf(G().rep)];let s=w>.02?`It's at ${pctOK(c.id)}%. ${w>.3?'It\'ll feel slow as hell until I fix it.':'Nothing serious.'}`:`It's in perfect shape.`;
   if(CLS.indexOf(c.car.cls)<CLS.indexOf(T.cl[0]))s+=` But it's a class ${c.car.cls} car, and the ${T.n} races are getting faster. Talk to Vince.`;else s+=` A tune would help more than you'd think.`;say(s)}});
  L.push({ic:'tip',t:'Any tips?',a:()=>say(rnd(TIPS))});L.push({ic:'bye',t:'See you later',a:()=>leave()});return L}
 return[{ic:'race',t:'What races have you got?',a:()=>{UI.view='offers';UI.f=0;const o=G().offers[0];if(o)setLine(pitch(o))}},
  {ic:'shop',t:'Marketplace',pz:'USED',a:()=>{mktFill();UI.view='mkt';UI.f=0;const l=G().mkt[0];setLine(rnd([`Marketplace. Older stuff, cheap. Some of it even runs.`,`Got a few used ones. No refunds.`,`These need a bit of love. Nina likes that sort of thing.`])+(l?' ':''))}},
  {ic:'car',t:'Brand Central',pz:'NEW',a:()=>{UI.line='';P.ui.openShow('brand',{player:0,cap:null,ret:'s8career'})}},
  {ic:'chart',t:'How am I doing?',a:()=>{const g=G(),ti=tierOf(g.rep),nx=TIERS[ti+1];say(`${TIERS[ti].n}. ${g.wins} cleared, ${fmtCr(g.earned)} earned.`+(nx?` ${nx.rep-g.rep} more and the ${nx.n} people call.`:` Nobody's above you.`)+' '+moneyLine())}},
  {ic:'bye',t:'See you later',a:()=>leave()}]}
/* tuning costs: she asks first, then the tuning bench */
function askTune(){const fee=tuneFee();say(rnd([`I can tune it, but it's gonna cost you. ${fmtCr(fee)}.`,`Tuning? Sure. Not free though. ${fmtCr(fee)}.`,`I can make it faster. ${fmtCr(fee)}, and that's the friends price, damn it.`]));
 UI.ch=[{ic:'tune',t:'Do it',pz:fmtCr(fee),off:P.SV().cr<fee,a:()=>{const sv=P.SV();if(sv.cr<fee){UI.ch=null;say(`You're short. ${fmtCr(fee-sv.cr)} short. Go win something.`);return}sv.cr-=fee;P.save();$$crv();UI.ch=null;UI.view='tune';UI.f=0;
   say(rnd([`Alright, let's see what we've got. Tell me what you want changed.`,`Hand me that wrench. Okay. What are we doing?`]))}},
  {ic:'back',t:'Maybe later',a:()=>{UI.ch=null;say(rnd([`Your call.`,`Fine. It's not getting any faster on its own, though.`]))}}];UI.f=0}
function tuneAdj(i,d){const T=P.TUNE[i];if(!T)return;const c=curCar(),t=P.tuneGet(c.id,c.alt),v=Math.max(-T.r,Math.min(T.r,t[T.k]+d));if(v===t[T.k])return;P.tuneSet(c.id,c.alt,T.k,v);P.sfx&&P.sfx('move');
 const L=TUNE_L[T.k];setLine(v===0?rnd([`Back to stock on the ${T.n.toLowerCase()}.`,`Stock ${T.n.toLowerCase()}. Boring, but it works.`]):L[d>0?1:0]);UI.f=i;drawDlg(true);const r=sec.querySelector('.gcTu[data-i="'+i+'"]');if(r){r.classList.remove('bump');void r.offsetWidth;r.classList.add('bump')}}
function tuneDone(){UI.view='talk';UI.f=0;say(rnd([`There. Go break something. Not the car, though.`,`Done. If it handles like shit, that's on you, not me.`,`All set. Damn, that sounds good.`]));if(GS.red)GS.red.re=1}
/* the cars you own, one click to bring one out */
function owned(){const own=P.SV().owned||{},cur=curCar();const L=P.CARS.filter(c=>own[c.id]&1).map(c=>({id:c.id,alt:0,car:c}));if(!L.some(x=>x.id===cur.id))L.unshift({id:cur.id,alt:cur.alt,car:cur.car});return L}
function openCars(){UI.who='red';UI.view='cars';UI.ch=null;const L=owned(),cur=curCar();UI.f=Math.max(0,L.findIndex(x=>x.id===cur.id));aim();
 say(rnd([`Which one do you want out?`,`Pick one. I'll roll it out.`,`Which one? Hurry up, I've got shit to do.`]));drawDlg();hint()}
function bringOut(i){const x=owned()[i];if(!x)return;const was=curCar().id;if(x.id!==was){P.setSel(0,x.id,x.alt);setCar();refreshCar()}
 UI.view='talk';UI.ch=null;UI.f=0;aim();say(rnd(GOT).replace('%s',x.car.name));if(GS.red){GS.red.re=1;GS.red.wv=1.6}drawDlg();hint()}
/* buying in the Marketplace: the money goes, the car comes out with its wear and its paint, and Nina has something to say about it */
function buy(i){const g=G(),l=g.mkt[i],sv=P.SV();if(!l)return;const c=BYID[l.id];if(sv.cr<l.price){say(`You're short. Come back with ${fmtCr(l.price-sv.cr)} more.`);return}
 sv.cr-=l.price;sv.owned[l.id]=(sv.owned[l.id]||0)|1;g.wear[l.id]=Math.max(0,Math.min(1,1-l.cond));setPaint(l.id,l.L||null);P.setSel(0,l.id,0);g.mkt.splice(i,1);P.save();$$crv();setCar();refreshCar();
 say(rnd([`Pleasure.`,`It's yours. Don't call me about it.`,`Done. Keys are on the bench.`]));if(GS.vin)GS.vin.re=1;UI.view='talk';UI.f=0;drawDlg();
 const id=l.id,bad=!!l.L;setTimeout(()=>{if(scr!=='s8career'||curCar().id!==id)return;popIn(id,bad)},1500)}
function popIn(id,bad){const c=BYID[id],oil=Math.max(150,Math.round(fixCost(id)*.45/50)*50),paint=1200;
 const line=bad?rnd([`Dear god... that is the shittiest paintjob I've ever seen!`,`Who painted this, a toddler with a grudge? Damn.`,`Oh hell no. That paint has to go.`]):rnd([`Ooh, a project! I'll change the oil for cheap!`,`That thing's been sitting for years. I'll change the oil for cheap, at least.`,`Well, shit. It runs, I guess. I'll do the oil and the basics for cheap.`]);
 const L=[];const drop=x=>{UI.ch=UI.ch.filter(y=>y!==x);if(UI.ch.length<=1)UI.ch=null};
 if(wearOf(id)>.02){const o={ic:'fix',t:'Oil and the basics',pz:fmtCr(oil),a:()=>{const sv=P.SV();if(sv.cr<oil){say(`Can't do it for less than ${fmtCr(oil)}. Sorry.`);return}sv.cr-=oil;G().wear[id]=0;P.save();$$crv();refreshCar();drop(o);say(rnd([`Done. Runs like a dream now. Well, a loud dream.`,`Oil's fresh, belts are new. Damn, that's better.`]))}};L.push(o)}
 if(bad){const o={ic:'paint',t:'Repaint it',pz:fmtCr(paint),a:()=>{const sv=P.SV();if(sv.cr<paint){say(`Paint costs ${fmtCr(paint)}. You'll have to live with it for now.`);return}sv.cr-=paint;setPaint(id,null);$$crv();setCar();drop(o);say(rnd([`Much better. My eyes thank you.`,`There. Now it looks like a car and not a crime scene.`]))}};L.push(o)}
 L.push({ic:'bye',t:'Later',a:()=>{UI.ch=null;say(rnd([`Suit yourself. It'll sound like a damn coffee grinder till then.`,`Your funeral.`]))}});
 UI.who='red';UI.view='talk';UI.f=0;UI.ch=L.length>1?L:null;aim();UI.line=line;UI.ty=null;if(GS.red){GS.red.tk=2.5;GS.red.re=1}drawDlg();hint()}
function talk(who,keep,line){UI.who=who;if(!keep){UI.view='talk';UI.f=0;UI.ch=null}
 aim();if(!keep&&GS[who]){GS[who].wv=2.4;GS[who].re=1}UI.line=line||UI.line||(who==='red'?redLine():vinLine());UI.ty=null;if(GS[who])GS[who].tk=2.5;if(who==='vin'){const g=G();if(!g.met){g.met=1;P.save()}}P.sfx&&!keep&&P.sfx('select');drawDlg();hint()}
function leave(){UI.who=null;UI.line='';UI.view='talk';UI.ch=null;aim();const d=$('gcDlg');if(d)d.classList.remove('on');const b=$('gcBox');if(b)b.classList.remove('on');P.sfx&&P.sfx('back');hint()}
function act(k){if(k==='car'){P.sfx&&P.sfx('select');openCars()}else if(k)talk(k)}
function say(t){setLine(t);UI.line=t}
function setLine(t){UI.line=t;UI.ty={t,i:0};const pe=GS[UI.who];if(pe)pe.tk=Math.min(3.5,t.length/26);paintType()}
function paintType(){const p=sec.querySelector('#gcBox .tx');if(!p||!UI.ty)return;const n=Math.floor(UI.ty.i),done=n>=UI.ty.t.length;p.innerHTML=esc_(UI.ty.t.slice(0,n))+(done?'':'<i class="cur"></i>')+'<span class="ghost">'+esc_(UI.ty.t.slice(n))+'</span>';p.classList.toggle('done',done)}
function type(dt){const ty=UI.ty;if(!ty||ty.i>=ty.t.length)return;const n0=Math.floor(ty.i);ty.i=Math.min(ty.t.length,ty.i+dt*62);if(Math.floor(ty.i)!==n0)paintType()}
const typing=()=>UI.ty&&UI.ty.i<UI.ty.t.length;const finishType=()=>{if(UI.ty){UI.ty.i=UI.ty.t.length;paintType()}};
function drawBox(){const b=$('gcBox');if(!b||!UI.who)return;const pe=UI.who==='red'?RED:VIN,ps=GS[UI.who];b.style.setProperty('--c',pe.col);
 if(b.dataset.who!==UI.who||!b.classList.contains('on')){b.dataset.who=UI.who;b.querySelector('.pic').innerHTML=ps&&ps.pic?`<img src="${ps.pic}" alt="">`:pe.n[0];b.querySelector('.nm b').textContent=pe.n;b.querySelector('.nm small').textContent=pe.role;
  b.classList.remove('pop');void b.offsetWidth;b.classList.add('on','pop')}
 if(!UI.ty||UI.ty.t!==UI.line)UI.ty={t:UI.line,i:0};paintType()}
function drawDlg(keepAnim){const d=$('gcDlg');if(!d||!UI.who)return;const pe=UI.who==='red'?RED:VIN;d.style.setProperty('--c',pe.col);drawBox();
 const sv=P.SV(),g=G();let body='',cap=pe.n,cap2='';
 if(UI.view==='offers'){cap='Races';cap2=TIERS[tierOf(g.rep)].n;if(UI.f>g.offers.length)UI.f=0;
  body=g.offers.map((o,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*55}ms"><canvas width="192" height="124"></canvas><div><em>${TYPE_L[o.type]}</em><b>${esc_(o.name)}</b><small>${detailTxt(o)}</small><small>${goalTxt(o)}</small></div><div class="pz"><u>${o.type==='ta'||o.type==='rally'?'PRIZE':'1ST PLACE'}</u><i>${fmtCr(firstPay(o))}</i></div></div>`).join('')+backRow(g.offers.length)}
 else if(UI.view==='mkt'){cap='Marketplace';cap2=fmtCr(sv.cr);if(UI.f>g.mkt.length)UI.f=0;
  body=g.mkt.map((l,i)=>{const c=BYID[l.id];return`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*55}ms"><div class="sw" data-car="${l.id}"></div><div><em${l.bad?' class="bad"':''}>${l.bad?'USED &middot; BAD PAINT':'USED'}</em><b>${esc_(c.name)}<span class="cls ${c.cls}">${c.cls}</span></b><small>${Math.round(l.km/1000)}k km &middot; condition ${Math.round(l.cond*100)}%</small></div><div class="pz"><u>PRICE</u><i>${fmtCr(l.price)}</i><s>${fmtCr(c.price)}</s></div></div>`}).join('')+backRow(g.mkt.length)}
 else if(UI.view==='cars'){cap='Your cars';const L=owned();cap2=L.length+' OWNED';const cur=curCar().id;
  body=L.map((x,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${Math.min(8,i)*45+60}ms"><div class="sw" data-car="${x.id}"></div><div><em>${x.id===cur?'OUT NOW':'IN STORAGE'}</em><b>${esc_(x.car.name)}<span class="cls ${x.car.cls}">${x.car.cls}</span></b><small>Condition ${pctOK(x.id)}%</small></div><div class="pz"></div></div>`).join('')}
 else if(UI.view==='tune'){cap='Tuning';cap2=curCar().car.name;const c=curCar(),t=P.tuneGet(c.id,c.alt);
  body=P.TUNE.map((T,i)=>{let seg='';for(let v=-T.r;v<=T.r;v++){const on=t[T.k]<0?v>=t[T.k]&&v<0:t[T.k]>0?v<=t[T.k]&&v>0:false;seg+=`<i class="${on?'f':v===0?'z':''}" data-v="${v}"></i>`}
   return`<div class="gcTu${i===UI.f?' on':''}" data-i="${i}" style="--d:${60+i*50}ms"><b>${T.n}</b><div class="seg"><u data-d="-1">&lsaquo;</u>${seg}<u data-d="1">&rsaquo;</u></div><small><span>${T.lo}</span><span>${T.hi}</span></small></div>`}).join('')+
   `<div class="gcRow${UI.f===P.TUNE.length?' on':''}" data-i="${P.TUNE.length}" style="--d:${60+P.TUNE.length*50}ms">${svgI('ok')}<span>Done</span></div>`}
 else body=choices().map((c,i)=>`<div class="gcRow${i===UI.f?' on':''}${c.off?' off':''}" data-i="${i}" style="--d:${60+i*55}ms">${svgI(c.ic)}<span>${c.t}</span>${c.pz?'<em>'+c.pz+'</em>':''}</div>`).join('');
 const sig=UI.who+UI.view+(UI.ch?'c'+UI.ch.length:''),fresh=!keepAnim&&d.dataset.sig!==sig;d.dataset.sig=sig;
 d.innerHTML=`<h6>${esc_(cap)}<span>${esc_(cap2)}</span></h6><div class="gcCh">${body}</div>`;
 d.classList.add('on');d.classList.toggle('fresh',fresh);
 d.querySelectorAll('.gcCh>div').forEach(e=>{const i=+e.dataset.i,cv=e.querySelector('canvas');if(cv)try{P.ui.drawTrack(cv,g.offers[i].track,false)}catch(er){}
  const sw=e.querySelector('.sw[data-car]');if(sw&&P.carThumb)try{const u=P.carThumb(sw.dataset.car);if(u){sw.style.backgroundImage='url('+u+')';sw.textContent=''}}catch(er){}
  e.onmouseenter=()=>focusC(i);
  e.onclick=ev=>{const u=ev.target.closest('u[data-d]'),iv=ev.target.closest('.seg i');if(UI.view==='tune'&&i<P.TUNE.length){if(u){tuneAdj(i,+u.dataset.d);return}if(iv){const T=P.TUNE[i],c=curCar(),cur=P.tuneGet(c.id,c.alt)[T.k];tuneAdj(i,+iv.dataset.v-cur);return}focusC(i);return}
   focusC(i);finishType();pickC()}});
 const on=d.querySelector('.gcCh>.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'})}
const backRow=n=>`<div class="gcRow${UI.f===n?' on':''}" data-i="${n}" style="--d:${60+n*55}ms">${svgI('back')}<span>Something else</span></div>`;
function nC(){return UI.view==='offers'?G().offers.length+1:UI.view==='mkt'?G().mkt.length+1:UI.view==='cars'?owned().length:UI.view==='tune'?P.TUNE.length+1:choices().length}
function focusC(i){if(i===UI.f)return;UI.f=i;P.sfx&&P.sfx('move');const d=$('gcDlg');if(!d)return;d.querySelectorAll('.gcCh>div').forEach(e=>e.classList.toggle('on',+e.dataset.i===i));
 const on=d.querySelector('.gcCh>.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
 if(UI.view==='offers'){const o=G().offers[i];setLine(o?pitch(o):`Something else, then?`)}
 else if(UI.view==='mkt'){const l=G().mkt[i];setLine(l?mktPitch(l):`Something else?`)}}
function pickC(){if(typing()){finishType();return}if(UI.busy)return;const el=$('gcDlg')&&$('gcDlg').querySelector('.gcCh>div[data-i="'+UI.f+'"]');if(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit')}
 P.sfx&&P.sfx('select');UI.busy=1;setTimeout(()=>{UI.busy=0;pickC_()},150)}
function pickC_(){const pe=GS[UI.who];if(pe){pe.re=1}
 if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length){UI.view='talk';UI.f=0;say(`Something else, then?`);drawDlg();hint();return}start(UI.f);return}
 if(UI.view==='mkt'){const g=G();if(UI.f>=g.mkt.length){UI.view='talk';UI.f=0;say(`Sure.`);drawDlg();hint();return}buy(UI.f);hint();return}
 if(UI.view==='cars'){bringOut(UI.f);return}
 if(UI.view==='tune'){if(UI.f>=P.TUNE.length){tuneDone();aim();drawDlg();hint()}return}
 const c=choices()[UI.f];if(c){const v0=UI.view;c.a();if(UI.who&&scr==='s8career'){if(UI.view!==v0)aim();drawDlg();hint()}}}
function refreshCar(){const e=$('gcCarI');if(e)e.innerHTML=carInfo();$$crv()}
function $$crv(){sec.querySelectorAll('.crv').forEach(e=>e.textContent=fmtCr(P.SV().cr))}
P.gcRender=()=>{render();return true};
/* hovering and clicking in the room */
sec.addEventListener('mousemove',e=>{if(!sec.classList.contains('gcOn')||UI.who||onCar()){if(GS.hov){GS.hov=null;sec.classList.remove('hv')}return}
 const k=e.target.closest&&e.target.closest('.gcDlg,.gcBox,.hdr,.foot8,.gcTier,.gcCarI')?null:pickAt(e.clientX,e.clientY);if(k!==GS.hov){GS.hov=k;if(k){UI.tag=TAGK.indexOf(k);P.sfx&&P.sfx('move')}}sec.classList.toggle('hv',!!k)});
sec.addEventListener('mouseleave',()=>{GS.hov=null;sec.classList.remove('hv')});
sec.addEventListener('click',e=>{if(!sec.classList.contains('gcOn')||UI.who||onCar())return;if(e.target.closest&&e.target.closest('button,.gcDlg,.gcBox,.hdr,.foot8'))return;const k=pickAt(e.clientX,e.clientY);if(k){GS.hov=null;sec.classList.remove('hv');act(k)}});

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
  try{for(const c of RACE.cars)if(c.human&&!c.loan&&paintOf(c.carId))badPaint(c.m&&(c.m.visualModel||c.m.g||c.m),paintOf(c.carId))}catch(e){}return r}}

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

/* ---------------- entering, keys, back ---------------- */
P.careerEnter=()=>{P.sfx&&P.sfx('select');P.ui.ST.ret='menu';const g=G();UI.who=g.met?null:'vin';UI.view='talk';UI.f=0;UI.ch=null;UI.line='';UI.tag=1;render();show('s8career')};
function escBack(){if(UI.view==='tune'){tuneDone();aim();drawDlg();hint();return}
 if(UI.view==='cars'){UI.view='talk';UI.f=0;leave();return}
 if(UI.who&&(UI.view==='offers'||UI.view==='mkt')){UI.view='talk';UI.f=0;say(UI.who==='vin'?`Sure.`:`Something else, then?`);drawDlg();hint();return}
 if(UI.who&&UI.ch){UI.ch=null;UI.f=0;say(UI.who==='red'?`Fine. What else?`:`Okay.`);drawDlg();hint();return}
 leave()}
{const fb=P.frBack;P.frBack=()=>{if(scr==='s8career'&&sec.classList.contains('gcOn')){if(UI.who||onCar()){escBack();return true}P.sfx&&P.sfx('back');show('menu');return true}return fb?fb():false}}
addEventListener('keydown',e=>{if(scr!=='s8career'||!sec.classList.contains('gcOn'))return;if(e.target&&e.target.tagName==='INPUT')return;const c=e.code;
 if(!UI.who&&!onCar()){if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){const d=c==='ArrowLeft'||c==='KeyA'?-1:1;let t=UI.tag;for(let n=0;n<3;n++){t=(t+d+3)%3;if(TAGK[t]==='car'?GS.car:GS[TAGK[t]]&&GS[TAGK[t]].g)break}UI.tag=t;GS.hov=TAGK[t];P.sfx&&P.sfx('move')}
  else if(c==='Enter'||c==='Space'){act(GS.hov||TAGK[UI.tag]);GS.hov=null}else return;e.preventDefault();e.stopImmediatePropagation();return}
 const n=nC();if(c==='ArrowDown'||c==='KeyS')focusC((UI.f+1)%n);else if(c==='ArrowUp'||c==='KeyW')focusC((UI.f+n-1)%n);
 else if(UI.view==='tune'&&(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD')){if(UI.f<P.TUNE.length)tuneAdj(UI.f,c==='ArrowLeft'||c==='KeyA'?-1:1)}
 else if(c==='Enter'||c==='Space')pickC();
 else if(/^Digit[1-9]$/.test(c)&&+c[5]<=n&&UI.view!=='tune'){focusC(+c[5]-1);finishType();pickC()}else return;e.preventDefault();e.stopImmediatePropagation()},true);
P.gcDebug=()=>({G:G(),UI,GS,run:P.gcRun});P.gcTalk=talk;P.gcAct=act;P.gcPick=(x,y)=>pickAt(x,y);P.gcHover=k=>{GS.hov=k};P.gcPop=popIn;
})();
