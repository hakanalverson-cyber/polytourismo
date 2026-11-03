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
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',back:'<path d="M15 18l-6-6 6-6"/>'};
const svgI=k=>'<svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(ICO[k]||'')+'</svg>';
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
/* the garage model in the game's look: every textured face gets one flat colour (the average of its patch of texture), flat shaded */
function flatten(root,tint){const cache=new Map();
 const pix=tex=>{if(cache.has(tex))return cache.get(tex);const im=tex.image;if(!im||!im.width)return null;const W=Math.min(512,im.width),H=Math.min(512,im.height),cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.drawImage(im,0,0,W,H);
  const d={W,H,a:g.getImageData(0,0,W,H).data,flipY:tex.flipY};cache.set(tex,d);return d};
 const ms=[];root.traverse(m=>{if(m.isMesh&&m.visible)ms.push(m)});const WS=[[1/3,1/3,1/3],[.6,.2,.2],[.2,.6,.2],[.2,.2,.6],[.45,.45,.1],[.1,.45,.45],[.45,.1,.45]];
 for(const m of ms){const mat=m.material,Px=mat&&mat.map&&pix(mat.map);if(!Px){if(mat)mat.flatShading=true;continue}const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(),uv=g.attributes.uv;if(!uv)continue;
  const n=g.attributes.position.count,col=new Float32Array(n*3),bc=mat.color||new THREE.Color(1,1,1),tn=tint(mat.name||''),c=new THREE.Color();
  const samp=(u,v,o)=>{u-=Math.floor(u);v-=Math.floor(v);const x=Math.min(Px.W-1,u*Px.W|0),y=Math.min(Px.H-1,(Px.flipY?1-v:v)*Px.H|0),i=(y*Px.W+x)*4;o[0]+=Px.a[i];o[1]+=Px.a[i+1];o[2]+=Px.a[i+2]};
  for(let t=0;t<n;t+=3){const a=[0,0,0];for(const w of WS)samp(w[0]*uv.getX(t)+w[1]*uv.getX(t+1)+w[2]*uv.getX(t+2),w[0]*uv.getY(t)+w[1]*uv.getY(t+1)+w[2]*uv.getY(t+2),a);
   c.setRGB(a[0]/WS.length/255,a[1]/WS.length/255,a[2]/WS.length/255).convertSRGBToLinear().multiply(bc);c.r*=tn[0];c.g*=tn[1];c.b*=tn[2];
   for(let q=0;q<3;q++){col[(t+q)*3]=c.r;col[(t+q)*3+1]=c.g;col[(t+q)*3+2]=c.b}}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));m.geometry=g;m.material=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.86,metalness:0,side:THREE.DoubleSide})}}
/* Poly GT dressing: a turntable under the car, the logo on the back wall, light strips, tyre stacks, a tool chest by Nina, bay lines, a chequered band */
function props(sc){const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0,flatShading:true},o||{}));
 const add=(g,m,x,y,z,ry)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;sc.add(o);return o};
 /* turntable */add(new THREE.CylinderGeometry(3.25,3.3,.07,40),M(0x2b2f36,{roughness:.45,metalness:.3}),SPOT.car.x,.035,SPOT.car.z);
 GS.ring=add(new THREE.TorusGeometry(3.27,.035,6,72),new THREE.MeshBasicMaterial({color:0x8fb4d8}),SPOT.car.x,.07,SPOT.car.z);GS.ring.rotation.x=Math.PI/2;
 /* the logo, lit */{const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const g=cv.getContext('2d');g.fillStyle='#1b1f26';g.fillRect(0,0,1024,256);g.strokeStyle='#8fb4d8';g.lineWidth=10;g.strokeRect(10,10,1004,236);
  g.font='italic 800 150px "PT Inter",Inter,Arial';g.textBaseline='middle';g.fillStyle='#ffffff';g.fillText('POLY',150,132);g.fillStyle='#9fc4ea';g.fillText('GT',600,132);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;add(new THREE.PlaneGeometry(4.2,1.05),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),1.1,4.55,-7.42)}
 /* chequered band along the back wall */{const cv=document.createElement('canvas');cv.width=512;cv.height=32;const g=cv.getContext('2d');for(let i=0;i<32;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?'#f2f2f2':'#1a1a1a';g.fillRect(i*16,j*16,16,16)}
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.repeat.x=3;add(new THREE.PlaneGeometry(18,.36),new THREE.MeshStandardMaterial({map:t,roughness:.8}),.3,3.35,-7.44)}
 /* light strips over the car */for(let i=-1;i<=1;i++)add(new THREE.BoxGeometry(.18,.06,3.6),new THREE.MeshBasicMaterial({color:0xfff6e8}),SPOT.car.x+i*1.4,5.6,SPOT.car.z);
 /* tyre stacks */const ty=new THREE.CylinderGeometry(.34,.34,.24,14),tm=M(0x1c1d20,{roughness:.9}),rim=new THREE.CylinderGeometry(.2,.2,.25,10),rm=M(0x9aa3ad,{metalness:.5,roughness:.4});
 for(const [x,z,n] of [[-4.6,-6.6,5],[-3.85,-6.75,3],[-5.2,-5.9,4],[7.2,-.6,4],[7.6,.3,2]])for(let k=0;k<n;k++){add(ty,tm,x,.12+k*.245,z);add(rim,rm,x,.12+k*.245,z)}
 /* Nina's tool chest */{const red=M(0x5c100d,{roughness:.9}),dk=M(0x2a2c30),x=2.7,z=-3.7;add(new THREE.BoxGeometry(1.1,.95,.55),red,x,.5,z,-.5);for(let i=0;i<4;i++)add(new THREE.BoxGeometry(1.0,.02,.02),dk,x+Math.sin(-.5)*.28,.2+i*.2,z+Math.cos(-.5)*.28,-.5);
  add(new THREE.BoxGeometry(1.14,.06,.6),M(0x3a3d43,{metalness:.4}),x,1.0,z,-.5);for(const k of [-.3,.05,.32])add(new THREE.BoxGeometry(.22,.07,.12),M([0xf2c94c,0x4a90d9,0x2fbf71][Math.round((k+.3)*3)%3]),x+k*Math.cos(.5),1.07,z+k*Math.sin(.5),-.5)}
 /* bay lines */const ye=M(0xf2c94c,{roughness:.6});for(const [x,z,w,d] of [[-.3,2.0,6.8,.09],[-.3,-6.0,6.8,.09],[-3.7,-2,.09,8],[3.1,-2,.09,8]])add(new THREE.BoxGeometry(w,.012,d),ye,x,.006,z)}
/* bones by role for the idle animation (names lose their dots and gain _<n> in the loader) */
function rig(bones){const R={};for(const b of bones){const r=b.name.replace(/_\d+$/,'').replace(/\./g,'');if(!R[r])R[r]=b;b.userData.q0=b.quaternion.clone()}return R}
async function buildScene(){if(GS.ok||GS.busy)return;GS.busy=true;
 try{const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a2522);sc.fog=new THREE.Fog(0x2a2522,26,60);const cam=new THREE.PerspectiveCamera(46,16/9,.05,120);GS.sc=sc;GS.cam=cam;
  /* light: warm and soft like the game's own scenes, a cool rim from the doors */
  sc.add(new THREE.HemisphereLight(0xfff3e2,0x6d5f52,1.05));
  const ks=(x,y,z,tx,tz,i,ang,c)=>{const l=new THREE.SpotLight(c||0xffe9cc,i,34,ang,.75,1.1);l.position.set(x,y,z);l.target.position.set(tx,0,tz);sc.add(l,l.target);return l};
  ks(-.3,6.8,1.2,-.3,-2,1.7,.62);ks(4.2,6.5,-3.5,4.5,-5,1.0,.7);ks(1.5,6.5,2.5,2,-.5,.7,.7);
  const d=new THREE.DirectionalLight(0xfff1dc,.6);d.position.set(4,9,7);sc.add(d);const rim=new THREE.DirectionalLight(0x9fc4ff,.45);rim.position.set(-3,4,-9);sc.add(rim);
  const gar=typeof GARAGE_GLB_B64!=='undefined'?await parseGLB(GARAGE_GLB_B64):null;
  if(gar){const o=gar.scene;o.traverse(m=>{if(!m.isMesh||!m.material)return;const mn=m.material.name||'';if(/occluder|godrays/i.test(mn)){m.visible=false;return}});
   flatten(o,mn=>/walls/.test(mn)?[1.08,.97,.86]:/ground/.test(mn)?[.9,.92,.98]:/structure/.test(mn)?[.86,.9,1.02]:[1,1,1]);sc.add(o)}
  else{const f=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x8d9097,roughness:.9}));f.rotation.x=-Math.PI/2;sc.add(f);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(40,10),new THREE.MeshStandardMaterial({color:0xc9bba8,roughness:1}));w.position.set(0,5,-7.6);sc.add(w)}
  props(sc);
  /* Studio Ochi people (Hakan's packs): one character out of a pack, picked by its place along x, standing as the file has them.
     Skins with only a few bones are props (shovel, hammer): they stay when they sit close to the chosen person */
  const ochi=async(b64,k,spot,yo,hTo)=>{const gl=b64?await parseGLB(b64):null;if(!gl)return null;const o=gl.scene;o.updateMatrixWorld(true);const sk=new Map(),props_=[];
   o.traverse(m=>{if(m.isSkinnedMesh){const bs=m.skeleton.bones;if(bs.length<8){props_.push(m);return}const key=bs[0];if(!sk.has(key))sk.set(key,{ms:[],bones:bs});sk.get(key).ms.push(m)}});
   const L=[...sk.values()].map(c=>{let x=0,y0=1e9,yh=-1e9;for(const b of c.bones){const p=b.getWorldPosition(V3());x+=p.x;y0=Math.min(y0,p.y);if(/head/i.test(b.name)&&!/end|top/i.test(b.name))yh=Math.max(yh,p.y)}return Object.assign(c,{x:x/c.bones.length,y0,yh})}).sort((a,b)=>a.x-b.x);
   const pick=L[Math.min(k,L.length-1)];if(!pick)return null;const keep=new Set(pick.bones),hip=pick.bones[0].getWorldPosition(V3());
   const near=m=>{const p=m.skeleton.bones[0].getWorldPosition(V3());let best=1e9,bx=null;for(const c of L){const d=Math.abs(p.x-c.x);if(d<best){best=d;bx=c}}return bx===pick};
   o.traverse(m=>{if(!m.isMesh)return;if(m.isSkinnedMesh){m.visible=props_.includes(m)?near(m):pick.ms.includes(m)}else{let a=m.parent,ok=false;while(a){if(keep.has(a)){ok=true;break}a=a.parent}m.visible=ok}if(m.visible){m.frustumCulled=false;if(m.material)m.material.envMapIntensity=.3}});
   const inner=new THREE.Group(),w=new THREE.Group();inner.add(o);o.position.set(-hip.x,-pick.y0,-hip.z);w.add(inner);
   const hy0=(pick.yh>-1e8?pick.yh:1.5)-pick.y0,ks=hTo/Math.max(.3,hy0);inner.scale.setScalar(ks);w.position.copy(spot);w.rotation.y=yawTo(spot,SPOT.over.p)+yo;w.add(blob(.42));sc.add(w);
   return{g:w,h:hTo+.1,hy:hTo+.12,rig:rig(pick.bones),yo}};
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
 const p=h.clone().addScaledVector(dir,who==='vin'?2.45:2.1).addScaledVector(side,.2);p.y=h.y-(who==='vin'?.06:-.02);const l=h.clone().addScaledVector(side,.78);l.y=h.y-.3;return{p,l}}
function aim(who){const c=camFor(who);GS.tp.copy(c.p);GS.tl.copy(c.l)}
function tick(dt){GS.t+=dt;const k=1-Math.exp(-dt*3.2);GS.cp.lerp(GS.tp,k);GS.cl.lerp(GS.tl,k);
 /* a slow breathing drift so the shot never looks frozen */
 const cam=GS.cam,s=UI.who?.012:.05;cam.position.set(GS.cp.x+Math.sin(GS.t*.23)*s,GS.cp.y+Math.sin(GS.t*.31)*s*.4,GS.cp.z);cam.lookAt(GS.cl);
 const W=R.domElement.width,H=R.domElement.height;if(H&&Math.abs(cam.aspect-W/H)>1e-3){cam.aspect=W/H;cam.updateProjectionMatrix()}
 
 for(const k of ['red','vin']){const pe=GS[k];if(pe&&pe.rig)try{anim(pe,k,dt)}catch(e){if(!GS.aerr){GS.aerr=1;console.warn('career anim',e)}}}
 if(GS.ring)GS.ring.material.color.setHSL(.58,.45,.62+Math.sin(GS.t*1.6)*.08);
 type(dt);tags()}
/* idle life, layered on the file's pose: breathing, a slow weight shift, the head looking around (or at you while you talk to them),
   nods while they speak, and Nina's raised hand waving when you walk up */
const QW=new THREE.Quaternion(),QP=new THREE.Quaternion(),QD=new THREE.Quaternion(),AX=V3();
function rotW(b,axis,ang){if(!b||!ang)return;b.parent.updateWorldMatrix(true,false);b.parent.getWorldQuaternion(QP);QW.setFromAxisAngle(axis,ang);QD.copy(QP).invert().multiply(QW).multiply(QP);b.quaternion.premultiply(QD)}
function anim(pe,k,dt){const B=pe.rig,t=GS.t+(k==='red'?1.7:0),g=pe.g;for(const r in B)if(B[r].userData.q0)B[r].quaternion.copy(B[r].userData.q0);
 const ry=g.rotation.y,fw=V3(Math.sin(ry),0,Math.cos(ry)),rt=V3(Math.cos(ry),0,-Math.sin(ry)),up=V3(0,1,0);
 const me=UI.who===k;pe.tk=Math.max(0,(pe.tk||0)-dt);pe.wv=Math.max(0,(pe.wv||0)-dt);
 /* where the head turns: at the camera while you talk to them, otherwise a slow look around with the odd glance at the camera */
 const cp=GS.cam.position,dx=cp.x-g.position.x,dz=cp.z-g.position.z;let tgt=Math.atan2(dx,dz)-ry;tgt=Math.atan2(Math.sin(tgt),Math.cos(tgt));
 const idle=Math.sin(t*.21)*.35+Math.sin(t*.53)*.12,look=me?Math.max(-.7,Math.min(.7,tgt)):(Math.sin(t*.13)>.55?Math.max(-.6,Math.min(.6,tgt)):idle);
 pe.hy_=(pe.hy_==null?look:pe.hy_+(look-pe.hy_)*Math.min(1,dt*2.4));
 const br=Math.sin(t*2*Math.PI/3.8),sw=Math.sin(t*.42),tk=pe.tk>0?Math.min(1,pe.tk)*Math.sin(t*7.5):0;
 rotW(B.spine,fw,sw*.022);rotW(B.spine,up,Math.sin(t*.31)*.04);
 rotW(B.spine002,rt,-br*.018);rotW(B.spine003,rt,-br*.022);rotW(B.spine003,fw,-sw*.014);
 rotW(B.spine004,up,pe.hy_*.35);rotW(B.spine005,up,pe.hy_*.4);rotW(B.spine006,up,pe.hy_*.25);
 rotW(B.spine005,rt,tk*.05+Math.sin(t*.7)*.02);rotW(B.spine006,fw,Math.sin(t*.37)*.035);
 for(const [s,sg] of [['L',1],['R',-1]]){rotW(B['upper_arm'+s],fw,sg*br*.02);rotW(B['shoulder'+s],fw,-sg*br*.012)}
 /* the raised hand (Nina greets with it) */
 if(pe.hand==null){let hi=null,hy=-1e9;for(const s of ['L','R']){const h=B['hand'+s];if(h){const p=h.getWorldPosition(V3());if(p.y>hy){hy=p.y;hi=s}}}const sh=B['spine004'];pe.hand=hi&&sh&&hy>sh.getWorldPosition(V3()).y-.05?hi:''}
 if(pe.hand){const w=pe.wv>0?Math.min(1,pe.wv)*Math.sin(t*9):Math.sin(t*1.1)*.08;rotW(B['forearm'+pe.hand],fw,w*.35*(pe.hand==='L'?1:-1))}}
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
#s8career.gcOn .gcDlg{position:absolute;right:5vw;top:calc(50% + 10px);transform:translate(40px,-50%) perspective(1400px) rotateY(-9deg);transform-origin:right center;width:clamp(400px,34vw,600px);z-index:3;opacity:0;pointer-events:none;
 padding:clamp(14px,1.2vw,22px);box-sizing:border-box;border-radius:14px;background:linear-gradient(180deg,#2a2e33ec,#141619f2);box-shadow:inset 0 1px 0 #ffffff35,0 0 0 1px #000,0 24px 50px #000c;transition:opacity .3s,transform .45s cubic-bezier(.16,.85,.25,1)}
#s8career.gcOn .gcDlg.on{opacity:1;transform:translate(0,-50%) perspective(1400px) rotateY(-9deg);pointer-events:auto}
#s8career.gcOn .gcPf{display:flex;align-items:center;gap:14px;padding:4px 6px 14px;margin-bottom:12px;border-bottom:1px solid #ffffff14}
#s8career.gcOn .gcPf .av{flex:none;width:52px;height:52px;border-radius:10px;display:grid;place-items:center;font:300 28px var(--gt);color:#fff;background:linear-gradient(160deg,var(--c),color-mix(in srgb,var(--c) 45%,#101215));box-shadow:inset 0 1px 0 #ffffffa0,0 0 18px color-mix(in srgb,var(--c) 35%,transparent)}
#s8career.gcOn .gcPf b{display:block;font:400 24px var(--gt);color:#fff}#s8career.gcOn .gcPf small{display:block;font:500 11px var(--gt);letter-spacing:.18em;color:var(--c);text-transform:uppercase;margin-top:2px}
#s8career.gcOn .gcSay p{margin:0 6px 4px;font:300 clamp(16px,2.1vh,20px)/1.5 var(--gt);color:#eef1f4;min-height:4.5em}
#s8career.gcOn .gcSay p .ghost{visibility:hidden}
#s8career.gcOn .gcSay p .cur{display:inline-block;width:8px;height:1.05em;margin:0 1px -3px;background:var(--c);border-radius:2px;animation:gcBlink .6s steps(2) infinite}
@keyframes gcBlink{50%{opacity:0}}
#s8career.gcOn .gcCh{margin-top:12px;display:flex;flex-direction:column;gap:2px}
#s8career.gcOn .gcRow{position:relative;display:flex;align-items:center;gap:16px;height:clamp(46px,6.2vh,62px);padding:0 18px;border-radius:9px;cursor:pointer;overflow:hidden;font:300 clamp(17px,2.3vh,23px) var(--gt);color:#c9d2d8;transition:background .15s,color .15s}
#s8career.gcOn .gcRow .mi{flex:none;width:24px;height:24px;opacity:.75;transition:transform .25s cubic-bezier(.3,1.6,.5,1),opacity .15s}
#s8career.gcOn .gcRow em{margin-left:auto;font:500 12px var(--gt);letter-spacing:.12em;color:#9aa3ab;font-style:normal}
#s8career.gcOn .gcRow:hover{background:#ffffff0d;color:#fff}
#s8career.gcOn .gcRow.on{background:var(--gxa,linear-gradient(180deg,#8fb4d8 0%,#4f7eab 48%,#33608c 52%,#4a77a3 100%));color:#fff;text-shadow:0 1px 1px #0005;box-shadow:inset 0 1px 0 #ffffffa0,inset 0 -1px 0 #0004,0 0 24px #4f7eab90}
#s8career.gcOn .gcRow.on .mi{opacity:1;transform:scale(1.15) rotate(-6deg)}#s8career.gcOn .gcRow.on em{color:#e8f0f7}
#s8career.gcOn .gcRow.on::after{content:"";position:absolute;top:0;bottom:0;left:-40%;width:35%;background:linear-gradient(100deg,transparent,#ffffff55,transparent);animation:gcShine 2.6s ease-in-out .2s infinite}
@keyframes gcShine{0%{left:-40%}45%,100%{left:120%}}
#s8career.gcOn .gcRow.off{opacity:.45}
#s8career.gcOn .gcDlg.fresh .gcRow,#s8career.gcOn .gcDlg.fresh .gcO,#s8career.gcOn .gcOf .gcRow,#s8career.gcOn .gcOf .gcO{animation:gcIn .45s cubic-bezier(.16,.85,.25,1) var(--d,0ms) backwards}
@keyframes gcIn{from{opacity:0;transform:translateX(26px)}}
#s8career.gcOn .gcCh>div.hit{animation:gcHit .2s ease-out}
@keyframes gcHit{0%{transform:scale(1)}40%{transform:scale(.965);filter:brightness(1.5)}100%{transform:scale(1)}}
#s8career.gcOn .gcPad{display:flex;gap:20px;margin:16px 8px 2px;font:400 13px var(--gt);color:#e6e9ee}
#s8career.gcOn .gcDlg.ofv .gcPad{margin-top:8px}#s8career.gcOn .gcDlg.ofv .gcSay p{min-height:0}#s8career.gcOn .gcPad span{display:flex;align-items:center;gap:8px}
#s8career.gcOn .gcPad u{text-decoration:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:700 11px Arial,sans-serif;background:radial-gradient(circle at 50% 35%,#3a4048,#121418);box-shadow:inset 0 1px 0 #ffffff40,0 0 0 1px #000}
#s8career.gcOn .gcPad .x{color:#8fb4ff}#s8career.gcOn .gcPad .o{color:#ff8a8a}
#s8career.gcOn .gcTag{animation:gcBob 3.2s ease-in-out infinite}#s8career.gcOn .gcTag[data-k="vin"]{animation-delay:-1.4s}
@keyframes gcBob{50%{margin-top:-5px}}
#s8career.gcOn .gcTag.on b::after{content:"  \\25B8 Talk";font:500 11px var(--gt);letter-spacing:.1em;color:var(--c)}
#s8career.gcOn .gcO{position:relative;display:grid;grid-template-columns:96px 1fr auto;gap:14px;align-items:center;padding:6px 10px;margin-bottom:3px;border-radius:9px;cursor:pointer;background:#ffffff08;box-shadow:inset 0 0 0 1px #ffffff12;transition:box-shadow .15s,background .15s}
#s8career.gcOn .gcO.on{background:linear-gradient(180deg,#4f7eabd0,#33608cd8);box-shadow:inset 0 1px 0 #ffffff80,0 0 22px #4f7eab90}#s8career.gcOn .gcO.on em,#s8career.gcOn .gcO.on small,#s8career.gcOn .gcO.on .pz u{color:#e8f0f7}
#s8career.gcOn .gcO canvas{width:96px;height:52px;border-radius:6px;background:#07090c}
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
  if(cost)L.push({ic:'fix',t:'Fix the damage',pz:fmtCr(cost),off:P.SV().cr<cost,a:()=>{const sv=P.SV();if(sv.cr<cost){say(`That's ${fmtCr(cost)}. Win a race and come back.`);return}sv.cr-=cost;G().wear[c.id]=0;P.save();P.sfx&&P.sfx('select');say(rnd([`Done. Good as new.`,`All fixed. Try to keep it off the walls this time.`]));refreshCar()}});
  L.push({ic:'tune',t:'Tune my car',a:()=>{UI.line='';P.ui.openShow('garage',{player:0,cap:null,ret:'s8career'})}});
  L.push({ic:'look',t:'How is the car looking?',a:()=>{const w=wearOf(c.id),T=TIERS[tierOf(G().rep)];let s=w>.02?`It's at ${pctOK(c.id)}%. ${w>.3?'It will feel slow until I fix it.':'Nothing serious.'}`:`It's in perfect shape.`;
   if(CLS.indexOf(c.car.cls)<CLS.indexOf(T.cl[0]))s+=` But it's a class ${c.car.cls} car, and the ${T.n} races are getting faster. Talk to Vince about something quicker.`;else s+=` Tuning helps more than you'd think.`;say(s)}});
  L.push({ic:'tip',t:'Any tips?',a:()=>say(rnd(TIPS))});L.push({ic:'bye',t:'See you later',a:()=>leave()});return L}
 return[{ic:'race',t:'What races have you got?',a:()=>{UI.view='offers';UI.f=0;drawDlg();const o=G().offers[0];if(o)setLine(pitch(o))}},
  {ic:'car',t:'Show me some cars',a:()=>{UI.line='';P.ui.openShow('brand',{player:0,cap:null,ret:'s8career'})}},
  {ic:'chart',t:'How am I doing?',a:()=>{const g=G(),ti=tierOf(g.rep),nx=TIERS[ti+1];say(`You're ${TIERS[ti].n} level. ${g.wins} events cleared, ${fmtCr(g.earned)} earned.`+(nx?` ${nx.rep-g.rep} more wins and the ${nx.n} organisers will call.`:` Nobody's above you now.`)+' '+moneyLine())}},
  {ic:'bye',t:'See you later',a:()=>leave()}]}
function talk(who,keep,line){if(!GS.ok&&!keep){/* the scene is still loading: talk anyway, the camera catches up */}UI.who=who;if(!keep){UI.view='talk';UI.f=0}
 aim(who);if(!keep&&GS[who])GS[who].wv=2.4;UI.line=line||UI.line||(who==='red'?redLine():vinLine());UI.ty=null;if(GS[who])GS[who].tk=2.5;if(who==='vin'){const g=G();if(!g.met){g.met=1;P.save()}}P.sfx&&!keep&&P.sfx('select');drawDlg();hint();const ci=$('gcCarI');if(ci)ci.style.opacity=who==='red'?1:.0}
function leave(){UI.who=null;UI.line='';aim(null);const d=$('gcDlg');if(d)d.classList.remove('on');const ci=$('gcCarI');if(ci)ci.style.opacity=1;P.sfx&&P.sfx('back');hint()}
function say(t){setLine(t);UI.line=t}
function setLine(t){UI.line=t;UI.ty={t,i:0};const pe=GS[UI.who];if(pe)pe.tk=Math.min(3.5,t.length/26);paintType()}
function paintType(){const p=sec.querySelector('.gcSay p');if(!p||!UI.ty)return;const n=Math.floor(UI.ty.i),done=n>=UI.ty.t.length;p.innerHTML=esc_(UI.ty.t.slice(0,n))+(done?'':'<i class="cur"></i>')+'<span class="ghost">'+esc_(UI.ty.t.slice(n))+'</span>';p.classList.toggle('done',done)}
function type(dt){const ty=UI.ty;if(!ty||ty.i>=ty.t.length)return;const n0=Math.floor(ty.i);ty.i=Math.min(ty.t.length,ty.i+dt*62);if(Math.floor(ty.i)!==n0)paintType()}
const typing=()=>UI.ty&&UI.ty.i<UI.ty.t.length;const finishType=()=>{if(UI.ty){UI.ty.i=UI.ty.t.length;paintType()}};
function drawDlg(){const d=$('gcDlg');if(!d||!UI.who)return;const pe=UI.who==='red'?RED:VIN;d.style.setProperty('--c',pe.col);
 let body='';if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length)UI.f=0;
  body=`<div class="gcCh gcOf">`+g.offers.map((o,i)=>`<div class="gcO${i===UI.f?' on':''}" data-i="${i}" style="--d:${80+i*55}ms"><canvas width="192" height="124"></canvas><div><em>${TYPE_L[o.type]}</em><b>${esc_(o.name)}</b><small>${detailTxt(o)}</small><small>${goalTxt(o)}</small></div><div class="pz"><u>${o.type==='ta'||o.type==='rally'?'PRIZE':'1ST PLACE'}</u><i>${fmtCr(firstPay(o))}</i></div></div>`).join('')+`<div class="gcRow${UI.f===g.offers.length?' on':''}" data-i="${g.offers.length}" style="--d:${80+g.offers.length*55}ms">${svgI('back')}<span>Something else</span></div></div>`}
 else body=`<div class="gcCh">`+choices().map((c,i)=>`<div class="gcRow${i===UI.f?' on':''}${c.off?' off':''}" data-i="${i}" style="--d:${80+i*55}ms">${svgI(c.ic)}<span>${c.t}</span>${c.pz?'<em>'+c.pz+'</em>':''}</div>`).join('')+`</div>`;
 const keep=d.classList.contains('on')&&d.dataset.who===UI.who;d.dataset.who=UI.who;
 d.innerHTML=`<div class="gcSay"><div class="gcPf"><div class="av">${pe.n[0]}</div><div><b>${pe.n}</b><small>${pe.role}</small></div></div><p></p></div>${body}<div class="gcPad"><span><u>&uarr;&darr;</u>Choose</span><span><u class="x">&#10005;</u>Select</span><span><u class="o">&#9675;</u>Back</span></div>`;
 d.classList.add('on');d.classList.toggle('ofv',UI.view==='offers');d.classList.toggle('fresh',!keep);void d.offsetWidth;if(!UI.ty||UI.ty.t!==UI.line)UI.ty={t:UI.line,i:keep?UI.line.length:0};paintType();
 d.querySelectorAll('.gcCh>div').forEach(e=>{const i=+e.dataset.i;const cv=e.querySelector('canvas');if(cv)try{P.ui.drawTrack(cv,G().offers[i].track,false)}catch(er){}
  e.onmouseenter=()=>focusC(i);e.onclick=()=>{focusC(i);finishType();pickC()}})}
function nC(){return UI.view==='offers'?G().offers.length+1:choices().length}
function focusC(i){if(i===UI.f)return;UI.f=i;P.sfx&&P.sfx('move');const d=$('gcDlg');if(!d)return;d.querySelectorAll('.gcCh>div').forEach(e=>e.classList.toggle('on',+e.dataset.i===i));
 if(UI.view==='offers'){const o=G().offers[i];if(o)setLine(pitch(o));else setLine(`Something else, then?`)}}
function pickC(){if(typing()){finishType();return}if(UI.busy)return;const el=$('gcDlg')&&$('gcDlg').querySelector('.gcCh>div[data-i="'+UI.f+'"]');if(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit')}
 P.sfx&&P.sfx('select');UI.busy=1;setTimeout(()=>{UI.busy=0;pickC_()},150)}
function pickC_(){if(UI.view==='offers'){const g=G();if(UI.f>=g.offers.length){UI.view='talk';UI.f=0;say(`Something else, then?`);drawDlg();hint();return}start(UI.f);return}
 const c=choices()[UI.f];if(c){c.a();if(UI.who&&scr==='s8career'&&!c.leaves)drawDlg()}}
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
 else if(/^Digit[1-9]$/.test(c)&&+c[5]<=n){focusC(+c[5]-1);finishType();pickC()}else return;e.preventDefault();e.stopImmediatePropagation()},true);
P.gcDebug=()=>({G:G(),UI,GS,run:P.gcRun});P.gcTalk=talk;
})();
