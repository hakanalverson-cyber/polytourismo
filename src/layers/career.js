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
const RED={n:'Nina',role:'Mechanic & tuner',col:'#ffa64d'},VIN={n:'Vince',role:'Races & car deals',col:'#7fb6ff',who:0/* BK.PEOPLE[0] (x 5): the only one in the Summer People pack in a shirt and trousers (stand-in until a better model) */};

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
function moneyLine(){const sv=P.SV(),cr=sv.cr,own=sv.owned||{},cur=curCar().car;
 const up=P.CARS.filter(c=>!(own[c.id]>0)&&!c.rallyOnly&&c.price&&CLS.indexOf(c.cls)>=CLS.indexOf(cur.cls)).sort((a,b)=>a.price-b.price);
 const can=up.filter(c=>c.price<=cr),next=up.find(c=>c.price>cr);
 if(can.length){const c=can[can.length-1];return `You've got ${fmtCr(cr)}. I could do you the ${c.name} for that.`}
 if(next)return `${fmtCr(next.price-cr)} more and I can get you the ${next.name}.`;return `Your garage is looking good. Keep winning.`}
const TIPS=['Brake in a straight line, then turn. The car can only do one thing well at a time.','Tyres and gearing make the biggest difference. Come see me at the bench.',
 'A rally stage is one run. A small mistake costs less than a big crash.','In an elimination you only need to beat one car each lap. Stay out of trouble.',
 'If you keep hitting the wall, the car gets slower. I can fix it, but it costs.','On the hot laps, a clean lap beats a fast messy one.'];
function vinLine(state){const g=G(),r=state&&state.res,nm=(P.SV().name||'').trim();
 if(r){const fix=wearOf(curCar().id)>.2?' Nina should take a look at the car, though.':'';
  if(r.ok){const p=r.paid?` That's ${fmtCr(r.paid)} in your pocket.`:'';return rnd([`Yes! ${r.what}.${p}`,`That's how it's done. ${r.what}.${p}`,`Told you you could do it. ${r.what}.${p}`])+(r.tierUp?` People are talking: you're ${TIERS[r.tierUp].n} level now. Better races, better money.`:'')+fix}
  return rnd([`${r.what}. Not this time. The offer is still there if you want another go.`,`${r.what}. Shake it off. We go again.`,`${r.what}. Close. Maybe get Nina to tune the car, or try something else.`])+fix}
 if(!g.met)return `${nm?nm+', right? ':''}I'm Vince. I get drivers into races and I find them cars. Nina over there keeps your car running. Want to see what I've got?`;
 return Math.random()<.5?moneyLine():rnd([`What can I do for you?`,`I've got a few races lined up.`,`Back again? Good. I've got work.`])}
function redLine(){const c=curCar(),w=wearOf(c.id);if(w>.35)return `What did you do to my car? It's at ${pctOK(c.id)}%. Let me fix it before you race again.`;
 if(w>.02)return `A few scratches on the ${c.car.name}. It's at ${pctOK(c.id)}%.`;return rnd([`Hey. The ${c.car.name} is ready to go.`,`Need something? I'm here.`,`Car's clean. Want me to tune it?`])}

/* ---------------- the garage scene ---------------- */
const GS={ok:false,busy:false,sc:null,cam:null,cp:V3(),cl:V3(),tp:V3(),tl:V3(),t:0,car:null,carKey:'',red:null,vin:null,spots:{}};
/* positions in the garage model's own frame (metres): car in the open floor, Nina beside it, Vince by the right-hand desk */
const SPOT={car:V3(-.3,0,-2.0),red:V3(2.05,0,-.55),vin:V3(4.55,0,-5.05),over:{p:V3(1.4,1.55,5.6),l:V3(1.3,.95,-2.6)}};
const b64u=s=>{const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u.buffer};
const parseGLB=b64=>new Promise(res=>{if(!b64||!THREE.GLTFLoader){res(null);return}const cib=window.createImageBitmap;window.createImageBitmap=undefined;
 try{new THREE.GLTFLoader().parse(b64u(b64),'',g=>res(g),e=>{console.warn('career glb',e);res(null)})}catch(e){console.warn('career glb',e);res(null)}finally{window.createImageBitmap=cib}});
const yawTo=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
function blob(r){const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.012;m.renderOrder=2;return m}
async function buildScene(){if(GS.ok||GS.busy)return;GS.busy=true;
 try{const sc=new THREE.Scene();sc.background=new THREE.Color(0x0e0d0c);const cam=new THREE.PerspectiveCamera(46,16/9,.05,120);GS.sc=sc;GS.cam=cam;
  /* lights (as the free-roam home garage) */
  sc.add(new THREE.HemisphereLight(0xe4ebf5,0x3a342e,.75));
  const ks=(x,y,z,tx,tz,i,ang)=>{const l=new THREE.SpotLight(0xfff2e0,i,34,ang,.7,1.2);l.position.set(x,y,z);l.target.position.set(tx,0,tz);sc.add(l,l.target);return l};
  ks(-1.2,7,0,-.3,-2,1.6,.6);ks(4,6.5,-6,4.5,-5,1.0,.7);ks(-4,6.5,4,0,1,.6,.8);
  const d=new THREE.DirectionalLight(0xdfe8ff,.55);d.position.set(3,8,6);sc.add(d);
  const gar=typeof GARAGE_GLB_B64!=='undefined'?await parseGLB(GARAGE_GLB_B64):null;
  if(gar){const o=gar.scene;o.traverse(m=>{if(!m.isMesh||!m.material)return;const mn=m.material.name||'';if(/occluder/i.test(mn)){m.visible=false;return}
    if(/godrays/i.test(mn)){m.material.transparent=true;m.material.blending=THREE.AdditiveBlending;m.material.depthWrite=false;m.material.opacity=.5;return}
    m.material.envMapIntensity=.25;m.material.side=THREE.DoubleSide});sc.add(o)}
  else{const f=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x34373b,roughness:.9}));f.rotation.x=-Math.PI/2;sc.add(f);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(40,10),new THREE.MeshStandardMaterial({color:0x4a4640,roughness:1}));w.position.set(0,5,-7.6);sc.add(w)}
  /* Studio Ochi people (Hakan's packs): one character out of a pack, picked by its place along x, standing as the file has them */
  const ochi=async(b64,k,spot,yo,hTo)=>{const gl=b64?await parseGLB(b64):null;if(!gl)return null;const o=gl.scene;o.updateMatrixWorld(true);const sk=new Map();
   o.traverse(m=>{if(m.isSkinnedMesh){const key=m.skeleton.bones[0];if(!sk.has(key))sk.set(key,{ms:[],bones:m.skeleton.bones});sk.get(key).ms.push(m)}});
   const L=[...sk.values()].map(c=>{let x=0,y0=1e9,yh=-1e9;for(const b of c.bones){const p=b.getWorldPosition(V3());x+=p.x;y0=Math.min(y0,p.y);if(/head/i.test(b.name)&&!/end|top/i.test(b.name))yh=Math.max(yh,p.y)}return Object.assign(c,{x:x/c.bones.length,y0,yh})}).sort((a,b)=>a.x-b.x);
   const pick=L[Math.min(k,L.length-1)];if(!pick)return null;const keep=new Set(pick.bones);
   o.traverse(m=>{if(!m.isMesh)return;if(m.isSkinnedMesh){m.visible=pick.ms.includes(m)}else{let a=m.parent,ok=false;while(a){if(keep.has(a)){ok=true;break}a=a.parent}m.visible=ok}if(m.visible){m.frustumCulled=false;if(m.material)m.material.envMapIntensity=.3}});
   const hip=pick.bones[0].getWorldPosition(V3()),inner=new THREE.Group(),w=new THREE.Group();inner.add(o);o.position.set(-hip.x,-pick.y0,-hip.z);w.add(inner);
   const hy0=(pick.yh>-1e8?pick.yh:1.5)-pick.y0,ks=hTo/Math.max(.3,hy0);inner.scale.setScalar(ks);w.position.copy(spot);w.rotation.y=yawTo(spot,SPOT.over.p)+yo;w.add(blob(.42));sc.add(w);
   return{g:w,h:hTo+.1,hy:hTo+.12}};
  /* Nina: the girl with the orange helmet and the hammer (Construction People, far left); Vince: the man in the dark suit (Business People, 4th) */
  try{GS.red=await ochi(window.CON_B64,0,SPOT.red,-.2,1.52)}catch(e){console.warn('career nina',e)}
  try{GS.vin=await ochi(window.BIZ_B64,3,SPOT.vin,.3,1.6)}catch(e){console.warn('career vince',e)}
  if(!GS.red)GS.red={g:null,h:1.62,hy:1.6};
  if(!GS.vin)try{/* stand-in when the Business pack is not built in */const BK=P.BK;if(BK&&BK.loadPeople&&window.PEOPLE_B64&&await BK.loadPeople()){const Rr=BK.makeRider({who:VIN.who});if(Rr&&Rr.people){standPose(Rr);const w=new THREE.Group();w.add(Rr.g);
    const T=Rr.T;Rr.g.position.set(-T.hipC.x,-Math.min(...T.bp.map(p=>p.y)),-T.hipC.z);const face=Math.atan2(T.fwd.x,T.fwd.z);
    w.position.copy(SPOT.vin);w.rotation.y=yawTo(SPOT.vin,SPOT.over.p)-face+.35;w.add(blob(.4));Rr.body.frustumCulled=false;sc.add(w);
    const hi=T.idx.spine006!=null?T.idx.spine006:T.idx.spine004;GS.vin={g:w,R:Rr,h:T.h,hy:T.bp[hi].y-Math.min(...T.bp.map(p=>p.y))}}}}catch(e){console.warn('career vince',e)}
  if(!GS.vin)GS.vin={g:null,h:1.75};
  GS.cp.copy(SPOT.over.p);GS.cl.copy(SPOT.over.l);GS.tp.copy(SPOT.over.p);GS.tl.copy(SPOT.over.l);GS.ok=true;setCar()}
 catch(e){console.warn('career scene',e)}GS.busy=false}
/* arms hanging: each upper arm, then each forearm, is swung so it points where we want (whatever the bind pose was) */
function standPose(Rr){const T=Rr.T,bones=Rr.bones,idx=T.idx,par=T.par;const under=(j,root)=>{while(j>=0){if(j===root)return true;j=par[j]}return false};
 const swing=(a,b,dir)=>{if(a==null||b==null)return;const piv=bones[a].position.clone(),cur=bones[b].position.clone().sub(piv).normalize(),q=new THREE.Quaternion().setFromUnitVectors(cur,dir.clone().normalize());
  for(let j=0;j<T.n;j++)if(under(j,a)){const bn=bones[j];bn.position.sub(piv).applyQuaternion(q).add(piv);bn.quaternion.premultiply(q)}};
 for(const [s,sg] of [['L',1],['R',-1]]){const out=T.left.clone().multiplyScalar(sg);
  swing(idx['upper_arm'+s],idx['forearm'+s],V3(0,-1,0).addScaledVector(out,.16).addScaledVector(T.fwd,.04));
  swing(idx['forearm'+s],idx['hand'+s],V3(0,-1,0).addScaledVector(out,.08).addScaledVector(T.fwd,.22))}}
/* the current car, built like cinema.js does (scaled to its real length, wheels on the floor) */
function setCar(){if(!GS.ok)return;const c=curCar(),key=c.id+':'+c.alt;if(GS.carKey===key&&GS.car)return;
 if(GS.car){GS.sc.remove(GS.car);GS.car=null}GS.carKey=key;const idx=P.modelOf(c.id,c.alt),src=typeof CAR_MODELS!=='undefined'&&CAR_MODELS[idx];if(!src){GS.carKey='';return}
 const model=src.clone(true),g=new THREE.Group(),ctd=new THREE.Group();ctd.add(model);g.add(ctd);ctd.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(V3()),ct=bb.getCenter(V3()),k=(src.userData.gl?src.userData.gl*1.093:4.7)/Math.max(sz.x,sz.z,.001);
 ctd.position.set(-ct.x,-bb.min.y,-ct.z);g.scale.setScalar(k);g.rotation.y=(sz.x>sz.z?Math.PI/2:0)+Math.PI;
 const o=new THREE.Group();o.add(g);o.position.copy(SPOT.car);o.rotation.y=.62;o.add(blob(2.9));o.traverse(m=>{if(m.isMesh){const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>{if(x&&x.isMeshStandardMaterial)x.envMapIntensity=.55})}});
 GS.sc.add(o);GS.car=o}
/* camera targets */
function headOf(who){const p=who==='red'?GS.red:GS.vin;const base=who==='red'?SPOT.red:SPOT.vin;return V3(base.x,p&&p.hy?p.hy:1.62,base.z)}
function camFor(who){if(!who)return SPOT.over;const h=headOf(who),from=SPOT.over.p,dir=V3(from.x-h.x,0,from.z-h.z).normalize(),side=V3(dir.z,0,-dir.x);
 /* close up, the person on the left third and the dialogue on the right */
 const p=h.clone().addScaledVector(dir,2.1).addScaledVector(side,.2);p.y=h.y+.02;const l=h.clone().addScaledVector(side,.78);l.y=h.y-.3;return{p,l}}
function aim(who){const c=camFor(who);GS.tp.copy(c.p);GS.tl.copy(c.l)}
function tick(dt){GS.t+=dt;const k=1-Math.exp(-dt*3.2);GS.cp.lerp(GS.tp,k);GS.cl.lerp(GS.tl,k);
 /* a slow breathing drift so the shot never looks frozen */
 const cam=GS.cam,s=UI.who?.012:.05;cam.position.set(GS.cp.x+Math.sin(GS.t*.23)*s,GS.cp.y+Math.sin(GS.t*.31)*s*.4,GS.cp.z);cam.lookAt(GS.cl);
 const W=R.domElement.width,H=R.domElement.height;if(H&&Math.abs(cam.aspect-W/H)>1e-3){cam.aspect=W/H;cam.updateProjectionMatrix()}
 
 tags()}
/* name tags over the heads in the overview */
function tags(){const el=$('gcTags');if(!el)return;const show_=!UI.who&&GS.ok;el.style.opacity=show_?1:0;if(!show_)return;const W=innerWidth,H=innerHeight;
 for(const k of ['red','vin']){const t=el.querySelector('[data-k="'+k+'"]');if(!t)continue;const p=headOf(k);p.y+=.42;p.project(GS.cam);
  t.style.left=((p.x*.5+.5)*W).toFixed(1)+'px';t.style.top=((-p.y*.5+.5)*H).toFixed(1)+'px';t.style.display=p.z<1?'':'none'}}
{const f0=frame;let vis=false;const MENU_BG=['menu','s8cards','s8quick','s8pick','s8setup','s8career','s8res'];
 frame=function(n){if(scr==='s8career'&&GS.ok&&sec.classList.contains('gcOn')){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(n-last)/1000));last=n;dtf=dt;T0+=dt;
   try{tick(dt);R.render(GS.sc,GS.cam)}catch(e){if(!GS.err){GS.err=1;console.warn('career frame',e)}}
   if(!vis){vis=true;R.domElement.style.visibility='';document.body.classList.add('gcG')}return}
  if(vis){vis=false;document.body.classList.remove('gcG');R.domElement.style.visibility=MENU_BG.includes(scr)&&!(RACE&&scr==='s8res')?'hidden':''}
  return f0.apply(this,arguments)}}

/* ---------------- screen ---------------- */
const CSS=`
body.gcG #v8Bg{opacity:0!important}
#s8career.gcOn::before{background:linear-gradient(180deg,#07090cb0 0%,#07090c30 13%,transparent 30%,transparent 70%,#07090cc0 100%)!important}
#s8career.gcOn .gcTags{position:absolute;inset:0;pointer-events:none;transition:opacity .3s;z-index:2}
#s8career.gcOn .gcTag{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;padding:8px 14px 9px;border-radius:9px;text-align:center;white-space:nowrap;
 background:linear-gradient(180deg,rgba(62,68,76,.85),rgba(22,25,29,.92));box-shadow:inset 0 1px 0 #ffffff38,inset 0 0 0 1px #ffffff14,0 8px 22px #000a;transition:box-shadow .15s,transform .15s}
#s8career.gcOn .gcTag::after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:rgba(22,25,29,.92)}
#s8career.gcOn .gcTag b{display:block;font:500 16px var(--gt);color:#fff}#s8career.gcOn .gcTag small{font:600 9px var(--gt);letter-spacing:.2em;color:var(--c);text-transform:uppercase}
#s8career.gcOn .gcTag.on{box-shadow:0 0 0 2px var(--c),0 10px 26px #000c,0 0 22px color-mix(in srgb,var(--c) 45%,transparent);transform:translate(-50%,-100%) scale(1.06)}
#s8career.gcOn .gcTier{position:absolute;left:24px;top:84px;z-index:2;display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:9px;background:rgba(20,23,27,.72);box-shadow:inset 0 0 0 1px #ffffff14;width:min(360px,40vw)}
#s8career.gcOn .gcTier b{font:600 12px var(--gt);letter-spacing:.18em}
#s8career.gcOn .gcTier .bar{flex:1;height:5px;border-radius:3px;background:#ffffff14;overflow:hidden}#s8career.gcOn .gcTier .bar i{display:block;height:100%;background:linear-gradient(90deg,#8fb4d8,#cfe2f5)}
#s8career.gcOn .gcTier small{font:500 10px var(--gt);color:#9aa4b0;white-space:nowrap}
#s8career.gcOn .gcCarI{position:absolute;left:24px;bottom:84px;z-index:2;padding:10px 14px;border-radius:9px;background:rgba(20,23,27,.72);box-shadow:inset 0 0 0 1px #ffffff14;transition:opacity .3s}
#s8career.gcOn .gcCarI small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#9aa4b0}#s8career.gcOn .gcCarI b{font:500 15px var(--gt)}#s8career.gcOn .gcCarI em{font:400 12px var(--gt);color:#c9d0d7;font-style:normal;margin-left:8px}
#s8career.gcOn .gcCarI em.bad{color:#ff9d90}
#s8career.gcOn .gcDlg{position:absolute;right:4vw;top:50%;transform:translate(30px,-50%);width:min(520px,44vw);z-index:3;opacity:0;pointer-events:none;transition:opacity .3s,transform .35s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcDlg.on{opacity:1;transform:translate(0,-50%);pointer-events:auto}
#s8career.gcOn .gcSay{padding:18px 20px 20px;border-radius:12px;background:linear-gradient(180deg,rgba(62,68,76,.86),rgba(22,25,29,.93));box-shadow:inset 0 1px 0 #ffffff38,inset 0 0 0 1px #ffffff14,0 12px 34px #000a}
#s8career.gcOn .gcSay small{display:block;font:600 10px var(--gt);letter-spacing:.22em;color:var(--c);text-transform:uppercase;margin-bottom:4px}
#s8career.gcOn .gcSay h3{margin:0 0 8px;font:300 30px var(--gt);color:#fff}
#s8career.gcOn .gcSay p{margin:0;font:400 16px/1.5 var(--gt);color:#eef1f4;min-height:3em}
#s8career.gcOn .gcCh{margin-top:12px;display:flex;flex-direction:column;gap:7px}
#s8career.gcOn .gcCh>div{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:9px;cursor:pointer;font:500 15px var(--gt);color:#e9edf1;background:rgba(20,23,27,.8);box-shadow:inset 0 0 0 1px #ffffff14;transition:background .12s,box-shadow .12s}
#s8career.gcOn .gcCh>div>i{font:600 11px var(--mn);font-style:normal;color:#8b95a1;width:14px}#s8career.gcOn .gcCh>div>em{margin-left:auto;font:700 13px var(--mn);color:var(--ac2);font-style:normal}
#s8career.gcOn .gcCh>div.on{background:linear-gradient(180deg,#5d87b3,#3c6591);box-shadow:inset 0 1px 0 #ffffff4d,0 0 0 1px #000a,0 0 18px #4f7eab80;color:#fff}#s8career.gcOn .gcCh>div.on>i{color:#dfeaf5}
#s8career.gcOn .gcCh>div.off{opacity:.45}
#s8career.gcOn .gcO{position:relative;display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;padding:11px 14px;border-radius:9px;cursor:pointer;background:rgba(20,23,27,.84);box-shadow:inset 0 0 0 1px #ffffff14;transition:box-shadow .15s,background .15s}
#s8career.gcOn .gcO.on{background:rgba(40,52,66,.92);box-shadow:0 0 0 2px #8fb4d8,0 0 22px #4f7eab70}
#s8career.gcOn .gcO canvas{width:96px;height:62px;border-radius:6px;background:#07090c}
#s8career.gcOn .gcO em{font:600 9px var(--gt);letter-spacing:.2em;color:#8fb4d8;font-style:normal}
#s8career.gcOn .gcO b{display:block;font:500 16px var(--gt);color:#f2f4f6;margin:1px 0}
#s8career.gcOn .gcO small{display:block;font:400 11.5px var(--gt);color:#a9b2bc}
#s8career.gcOn .gcO .pz{text-align:right}#s8career.gcOn .gcO .pz u{display:block;text-decoration:none;font:600 9px var(--gt);letter-spacing:.2em;color:#9aa4b0}
#s8career.gcOn .gcO .pz i{font:700 15px var(--mn);color:var(--ac2);font-style:normal}
#resBox .gcRes{display:flex;gap:14px;align-items:center;margin:4px 0 14px;padding:12px 16px;border-radius:10px;background:linear-gradient(180deg,rgba(62,68,76,.6),rgba(22,25,29,.8));box-shadow:inset 0 0 0 1px #ffffff14}
#resBox .gcRes small{display:block;font:600 9px var(--gt);letter-spacing:.2em;color:#7fb6ff}#resBox .gcRes p{margin:3px 0 0;font:400 14px/1.4 var(--gt);color:#eef1f4}
#resBox .gcRes .gcPz{margin-left:auto;text-align:right;font:700 16px var(--mn);color:var(--ac2);white-space:nowrap}#resBox .gcRes .gcPz.no{color:#9aa4b0}
`;
{const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st)}

const sec=$('s8career');
/* who: null (overview), 'red' or 'vin'; view: 'talk' or 'offers'; f: focused choice / offer; tag: focused name tag in the overview */
const UI={who:null,view:'talk',f:0,tag:1,line:'',res:null};
function hdr(){const g=G(),T=TIERS[tierOf(g.rep)];return `<div class="hdr"><h2>CAREER <em>${T.n}</em></h2><small>${g.wins} cleared &middot; ${fmtCr(g.earned)} earned</small><div class="sp"></div><div class="crbox"><small>CREDITS</small><b class="crv">${fmtCr(P.SV().cr)}</b></div></div>`}
function render(){P.gcRun=null;sec.classList.add('gcOn');buildScene().then(()=>{setCar()});setCar();const g=G();fillOffers();const ti=tierOf(g.rep),T=TIERS[ti],nx=TIERS[ti+1],c=curCar(),w=wearOf(c.id);
 const prog=nx?Math.max(0,Math.min(1,(g.rep-T.rep)/(nx.rep-T.rep))):1;
 sec.innerHTML=hdr()+`<div class="gcTier"><b>${T.n}</b><div class="bar"><i style="width:${Math.round(prog*100)}%"></i></div><small>${nx?g.rep+' / '+nx.rep+' rep to '+nx.n:'Top tier'}</small></div>
 <div class="gcTags" id="gcTags"><div class="gcTag" data-k="red" style="--c:${RED.col}"><small>${RED.role}</small><b>${RED.n}</b></div><div class="gcTag" data-k="vin" style="--c:${VIN.col}"><small>${VIN.role}</small><b>${VIN.n}</b></div></div>
 <div class="gcCarI" id="gcCarI"><small>YOUR CAR</small><b>${c.car.name}</b> <span class="cls ${c.car.cls}">${c.car.cls}</span><em class="${w>.2?'bad':''}">Condition ${pctOK(c.id)}%</em></div>
 <div class="gcDlg" id="gcDlg"></div>
 <div class="foot8"><button class="btn" data-a="back"><span>&lt; Back</span></button><div class="hint8" id="gcHint"></div><span style="width:90px"></span></div>`;
 sec.querySelectorAll('.gcTag').forEach(t=>{const k=t.dataset.k;t.onmouseenter=()=>{UI.tag=k==='red'?0:1;paintTags()};t.onclick=()=>talk(k)});
 paintTags();if(UI.who)talk(UI.who,true,UI.line);else{aim(null);hint()}}
function paintTags(){sec.querySelectorAll('.gcTag').forEach(t=>t.classList.toggle('on',(t.dataset.k==='red'?0:1)===UI.tag))}
function hint(){const h=$('gcHint');if(!h)return;h.innerHTML=!UI.who?'Left / Right choose &middot; Enter talk &middot; Esc back':UI.view==='offers'?'Up / Down choose &middot; Enter start &middot; Esc back':'Up / Down choose &middot; Enter answer &middot; Esc back'}

/* ---------------- talking ---------------- */
function choices(){const c=curCar();if(UI.who==='red'){const cost=repairCost(c.id),L=[];
  if(cost)L.push({t:'Fix the damage',pz:fmtCr(cost),off:P.SV().cr<cost,a:()=>{const sv=P.SV();if(sv.cr<cost){say(`That's ${fmtCr(cost)}. Win a race and come back.`);return}sv.cr-=cost;G().wear[c.id]=0;P.save();P.sfx&&P.sfx('select');say(rnd([`Done. Good as new.`,`All fixed. Try to keep it off the walls this time.`]));refreshCar()}});
  L.push({t:'Tune my car',a:()=>{UI.line='';P.ui.openShow('garage',{player:0,cap:null,ret:'s8career'})}});
  L.push({t:'How is the car looking?',a:()=>{const w=wearOf(c.id),T=TIERS[tierOf(G().rep)];let s=w>.02?`It's at ${pctOK(c.id)}%. ${w>.3?'It will feel slow until I fix it.':'Nothing serious.'}`:`It's in perfect shape.`;
   if(CLS.indexOf(c.car.cls)<CLS.indexOf(T.cl[0]))s+=` But it's a class ${c.car.cls} car, and the ${T.n} races are getting faster. Talk to Vince about something quicker.`;else s+=` Tuning helps more than you'd think.`;say(s)}});
  L.push({t:'Any tips?',a:()=>say(rnd(TIPS))});L.push({t:'See you later',a:()=>leave()});return L}
 return[{t:'What races have you got?',a:()=>{UI.view='offers';UI.f=0;drawDlg();const o=G().offers[0];if(o)setLine(pitch(o))}},
  {t:'Show me some cars',a:()=>{UI.line='';P.ui.openShow('brand',{player:0,cap:null,ret:'s8career'})}},
  {t:'How am I doing?',a:()=>{const g=G(),ti=tierOf(g.rep),nx=TIERS[ti+1];say(`You're ${TIERS[ti].n} level. ${g.wins} events cleared, ${fmtCr(g.earned)} earned.`+(nx?` ${nx.rep-g.rep} more wins and the ${nx.n} organisers will call.`:` Nobody's above you now.`)+' '+moneyLine())}},
  {t:'See you later',a:()=>leave()}]}
function talk(who,keep,line){if(!GS.ok&&!keep){/* the scene is still loading: talk anyway, the camera catches up */}UI.who=who;if(!keep){UI.view='talk';UI.f=0}
 aim(who);UI.line=line||UI.line||(who==='red'?redLine():vinLine());if(who==='vin'){const g=G();if(!g.met){g.met=1;P.save()}}P.sfx&&!keep&&P.sfx('select');drawDlg();hint();const ci=$('gcCarI');if(ci)ci.style.opacity=who==='red'?1:.0}
function leave(){UI.who=null;UI.line='';aim(null);const d=$('gcDlg');if(d)d.classList.remove('on');const ci=$('gcCarI');if(ci)ci.style.opacity=1;P.sfx&&P.sfx('back');hint()}
function say(t){setLine(t);UI.line=t}
function setLine(t){const p=sec.querySelector('.gcSay p');if(p)p.textContent=t;UI.line=t}
function drawDlg(){const d=$('gcDlg');if(!d||!UI.who)return;const pe=UI.who==='red'?RED:VIN;d.style.setProperty('--c',pe.col);
 let body='';if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length)UI.f=0;
  body=`<div class="gcCh gcOf">`+g.offers.map((o,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}"><canvas width="192" height="124"></canvas><div><em>${TYPE_L[o.type]}</em><b>${esc_(o.name)}</b><small>${detailTxt(o)}</small><small>${goalTxt(o)}</small></div><div class="pz"><u>${o.type==='ta'||o.type==='rally'?'PRIZE':'1ST PLACE'}</u><i>${fmtCr(firstPay(o))}</i></div></div>`).join('')+`<div class="${UI.f===g.offers.length?'on':''}" data-i="${g.offers.length}"><i>&larr;</i>Something else</div></div>`}
 else body=`<div class="gcCh">`+choices().map((c,i)=>`<div class="${i===UI.f?'on':''}${c.off?' off':''}" data-i="${i}"><i>${i+1}</i>${c.t}${c.pz?'<em>'+c.pz+'</em>':''}</div>`).join('')+`</div>`;
 d.innerHTML=`<div class="gcSay"><small>${pe.role}</small><h3>${pe.n}</h3><p>${esc_(UI.line)}</p></div>${body}`;d.classList.add('on');
 d.querySelectorAll('.gcCh>div').forEach(e=>{const i=+e.dataset.i;const cv=e.querySelector('canvas');if(cv)try{P.ui.drawTrack(cv,G().offers[i].track,false)}catch(er){}
  e.onmouseenter=()=>focusC(i);e.onclick=()=>{focusC(i);pickC()}})}
function nC(){return UI.view==='offers'?G().offers.length+1:choices().length}
function focusC(i){if(i===UI.f)return;UI.f=i;P.sfx&&P.sfx('move');const d=$('gcDlg');if(!d)return;d.querySelectorAll('.gcCh>div').forEach(e=>e.classList.toggle('on',+e.dataset.i===i));
 if(UI.view==='offers'){const o=G().offers[i];if(o)setLine(pitch(o));else setLine(`Something else, then?`)}}
function pickC(){if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length){UI.view='talk';UI.f=0;say(`Something else, then?`);drawDlg();hint();return}start(UI.f);return}
 const c=choices()[UI.f];if(c){P.sfx&&P.sfx('select');c.a();if(UI.who&&scr==='s8career'&&!c.leaves)drawDlg()}}
function refreshCar(){const c=curCar(),e=$('gcCarI');if(e)e.innerHTML=`<small>YOUR CAR</small><b>${c.car.name}</b> <span class="cls ${c.car.cls}">${c.car.cls}</span><em class="${wearOf(c.id)>.2?'bad':''}">Condition ${pctOK(c.id)}%</em>`;$$crv()}
function $$crv(){sec.querySelectorAll('.crv').forEach(e=>e.textContent=fmtCr(P.SV().cr))}
P.gcRender=()=>{render();return true};

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
  if(P.gcRun){try{for(const c of RACE.cars)if(c.human){const w=wearOf(c.carId);if(w>0)c.dmg=Math.max(c.dmg||0,w)}}catch(e){}}return r}}

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
P.careerEnter=()=>{P.sfx&&P.sfx('select');P.ui.ST.ret='menu';const g=G();UI.who=g.met?null:'vin';UI.view='talk';UI.f=0;UI.line='';UI.tag=1;render();show('s8career')};
{const fb=P.frBack;P.frBack=()=>{if(scr==='s8career'&&sec.classList.contains('gcOn')){if(UI.who&&UI.view==='offers'){UI.view='talk';UI.f=0;say(`Something else, then?`);drawDlg();hint();return true}
  if(UI.who){leave();return true}P.sfx&&P.sfx('back');show('menu');return true}return fb?fb():false}}
addEventListener('keydown',e=>{if(scr!=='s8career'||!sec.classList.contains('gcOn'))return;if(e.target&&e.target.tagName==='INPUT')return;const c=e.code;
 if(!UI.who){if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){UI.tag=1-UI.tag;P.sfx&&P.sfx('move');paintTags()}else if(c==='Enter'||c==='Space')talk(UI.tag?'vin':'red');else return;e.preventDefault();e.stopImmediatePropagation();return}
 const n=nC();if(c==='ArrowDown'||c==='KeyS')focusC((UI.f+1)%n);else if(c==='ArrowUp'||c==='KeyW')focusC((UI.f+n-1)%n);else if(c==='Enter'||c==='Space')pickC();
 else if(/^Digit[1-9]$/.test(c)&&+c[5]<=n){focusC(+c[5]-1);pickC()}else return;e.preventDefault();e.stopImmediatePropagation()},true);
P.gcDebug=()=>({G:G(),UI,GS,run:P.gcRun});P.gcTalk=talk;
})();
