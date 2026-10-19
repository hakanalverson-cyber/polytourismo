/* ===== Poly Tourismo v10 layer: cars10 (136 low-poly cars from the mega pack, built lazily from a compact gzip pack) ===== */
(function v10cars(){
'use strict';
const P=window.PT8,META=CAR10_META.cars,N=META.length;
const C10=P.C10={meta:META,n:N,ready:false};
/* palette texture shared by every car (nearest filtering keeps the colour cells crisp) */
const tex=new THREE.Texture();tex.flipY=false;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;tex.encoding=THREE.sRGBEncoding;
{const im=new Image();im.onload=()=>{tex.image=im;tex.needsUpdate=true};im.src='data:image/png;base64,'+CAR10_TEX_B64}
const srgb=(r,g,b)=>new THREE.Color(r/255,g/255,b/255).convertSRGBToLinear();
const ALT=[[214,50,45],[47,111,208],[240,176,32],[47,157,90],[242,106,27],[232,232,234],[26,28,32]];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function altRGB(k){const d=META[k].paint;for(let i=0;i<ALT.length;i++){const c=ALT[(k+i)%ALT.length];if(dist(c,d)>140)return c}return ALT[0]}
C10.altRGB=altRGB;C10.stockRGB=k=>META[k].paint;
/* in-game length (m): the pack's real proportions, eased towards the 4.5 m the physics boxes assume */
const gameLen=m=>Math.max(3.9,Math.min(5,4.5+(m.len-4.3)*.55));
let buf=null;const geo={},cache={};
const bodyMat=new THREE.MeshStandardMaterial({map:tex,roughness:.62,metalness:.12,flatShading:true});
function geoms(k){if(geo[k])return geo[k];const out={};
 for(const pt of META[k].parts){if(!pt.nt)continue;const g=new THREE.BufferGeometry(),pq=new Int16Array(buf,pt.p,pt.nv*3),pos=new Float32Array(pt.nv*3);
  for(let i=0;i<pos.length;i++)pos[i]=pq[i]*.001;g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  if(pt.n!=='paint'){const uq=new Uint16Array(buf,pt.u,pt.nv*2),uv=new Float32Array(pt.nv*2);for(let i=0;i<uv.length;i++)uv[i]=uq[i]/65535;g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf,pt.i,pt.nt*3),1));g.computeVertexNormals();out[pt.n]=g}
 return geo[k]=out}
function build(k,alt){const m=META[k],G=geoms(k),g=new THREE.Group();g.name='car'+k+(alt?'a':'');
 const lift=(META[k].lift||0);
 if(G.body){const b=new THREE.Mesh(G.body,bodyMat);b.name='body';b.position.y=lift;g.add(b)}
 if(G.tires){const t=new THREE.Mesh(G.tires,bodyMat);t.name='tires';g.add(t)}
 if(G.paint){const c=alt?altRGB(k):m.paint,pm=new THREE.MeshStandardMaterial({color:srgb(c[0],c[1],c[2]),roughness:.42,metalness:.32,flatShading:true});const p=new THREE.Mesh(G.paint,pm);p.name='paint';p.position.y=lift;g.add(p)}
 /* invisible nose / tail markers so the livery baker knows which way the car faces (front is -Z in model space) */
 const mk=(n,z)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,.5,z,0,.5,z,0,.5,z]),3));const q=new THREE.Mesh(t,new THREE.MeshBasicMaterial());q.name=n;q.visible=false;g.add(q)};
 mk('front',-m.len/2*.98);mk('rear',m.len/2*.98);
 g.userData.gl=gameLen(m);g.userData.k=k;return g}

/* ================= catalogue: the 14 original ids keep their saves/stats but now wear pack models; 122 more cars join them ================= */
const CATS=['HATCHBACK','WAGON','SEDAN','COUPE','MUSCLE','SPORTS','SUPERCAR','HYPERCAR','TRACK'];
const LISTS={HATCHBACK:[26,50,51,65,67,76,91,100,132,93],WAGON:[113,133],SEDAN:[3,5,21,28,32,39,53,57,61,79,108,111,119],
 MUSCLE:[4,14,17,19,23,29,31,54,60,64,70,72,82,87,90,110,134],
 TRACK:[11,24,34,35,45,68,84,85,92,102,107,109,112,120,129],HYPERCAR:[0,36,37,73,98,104,106,115,116,127]};
const catOf=k=>{for(const c in LISTS)if(LISTS[c].includes(k))return c;const m=META[k];
 if(m.hgt<1.10)return'HYPERCAR';if(m.hgt<1.20)return'SUPERCAR';if(m.wing>=.97&&m.hgt<1.3)return'TRACK';return m.hgt<1.28&&m.wid>=2.0?'SPORTS':m.len<4.4?'COUPE':'SPORTS'};
const BASE={HATCHBACK:.22,WAGON:.3,SEDAN:.38,COUPE:.46,MUSCLE:.5,SPORTS:.56,TRACK:.74,SUPERCAR:.8,HYPERCAR:.94};
const OFF={HATCHBACK:.8,WAGON:.85,SEDAN:.5,COUPE:.45,MUSCLE:.4,SPORTS:.45,TRACK:.36,SUPERCAR:.38,HYPERCAR:.3};
const TYPE={HATCHBACK:'HOT HATCH',WAGON:'PERFORMANCE WAGON',SEDAN:'SPORTS SEDAN',COUPE:'SPORTS COUPE',MUSCLE:'MUSCLE COUPE',SPORTS:'SPORTS CAR',SUPERCAR:'SUPERCAR',HYPERCAR:'HYPERCAR',TRACK:'TRACK WEAPON'};
const BLURB={HATCHBACK:'Short, light and cheeky. Turns in sharply and loves a loose surface.',WAGON:'Long roof, long legs. Hauls itself down a stage like the shopping is on fire.',SEDAN:'Four doors, no apologies. Quick, planted and quietly rude.',COUPE:'A tidy two-door with real pace and a handling balance to match.',MUSCLE:'Big, loud and a little untidy. Wants straights and a firm hand.',SPORTS:'Sharp, low and driver-focused. Rewards smooth, committed driving.',SUPERCAR:'Wide, low and wedge-shaped. Huge grip and a very long top gear.',HYPERCAR:'The fastest things in the showroom. Barely road legal, barely controllable.',TRACK:'Wings, splitters and no manners. Built for lap times and nothing else.'};
const ENG={HATCHBACK:['i4t','i4t','v6t'],WAGON:['i6','v6t'],SEDAN:['v6t','i6','v8'],COUPE:['v6t','f6','i6'],MUSCLE:['v8','v8'],SPORTS:['f6','v6t','v8'],SUPERCAR:['v10','v8t','v12'],HYPERCAR:['v12','v8h','v8t'],TRACK:['v6t','v8','f6']};
const REALG={HATCHBACK:6,WAGON:6,SEDAN:6,COUPE:6,MUSCLE:6,SPORTS:6,SUPERCAR:7,HYPERCAR:7,TRACK:6};
const REALN=["PAGANI ZONDA R", "JAGUAR XJ220", "ASTON MARTIN V8 VANTAGE", "BMW M3 (F80)", "PLYMOUTH SUPERBIRD", "BMW M3 (E90)", "MASERATI GRANTURISMO", "AUDI R8", "NISSAN SKYLINE GT-R R34", "MAZDA RX-7 FC", "CHEVROLET CORVETTE C4", "NISSAN SILVIA S15", "NISSAN 370Z", "PORSCHE 911 CARRERA", "BUICK GRAND NATIONAL", "PORSCHE 918 SPYDER", "LOTUS ELISE", "DODGE VIPER", "HONDA CIVIC SI COUPE", "DODGE CHALLENGER", "MERCEDES-AMG GT", "MITSUBISHI LANCER EVO X", "DELOREAN DMC-12", "FORD MUSTANG BOSS 302", "FERRARI 575M MARANELLO", "NISSAN 240SX", "VOLKSWAGEN GOLF GTI", "HONDA NSX (NA1)", "FORD SIERRA RS500", "SHELBY GT350 (1965)", "LAMBORGHINI DIABLO", "DODGE CHARGER R/T", "MERCEDES-AMG C63", "LAMBORGHINI HURACAN", "PORSCHE 911 GT2 RS", "MCLAREN F1 GTR", "W MOTORS LYKAN HYPERSPORT", "BUGATTI VEYRON", "FERRARI F40", "KIA STINGER GT", "SUBARU BRZ", "ALFA ROMEO ALFETTA GTV", "FERRARI ENZO", "LAMBORGHINI AVENTADOR SV", "LAMBORGHINI COUNTACH", "BMW M4 GT3", "MERCEDES-AMG GT R", "CHEVROLET CORVETTE C7", "NISSAN 300ZX", "BMW I8", "AUDI A1", "LANCIA DELTA INTEGRALE", "LANCIA STRATOS", "MITSUBISHI LANCER EVO VI", "CHEVROLET CHEVELLE SS", "TOYOTA SUPRA (A80)", "NISSAN Z (RZ34)", "MERCEDES-BENZ 190E EVO II", "FORD ESCORT RS MK1", "PORSCHE 911 TURBO (930)", "CHEVROLET CAMARO IROC-Z", "MITSUBISHI LANCER EVO IX", "LOTUS ESPRIT", "FORD GT40", "FORD MUSTANG 1967", "FORD FOCUS RS WRC", "BUGATTI EB110", "HONDA CIVIC TYPE R (EK9)", "BMW M1 PROCAR", "FERRARI F355", "CHEVROLET CAMARO Z28", "NISSAN 350Z", "FORD MUSTANG SHELBY GT500", "BUGATTI CHIRON", "MERCEDES-BENZ SLS AMG", "CHEVROLET CORVETTE C8", "SUBARU IMPREZA WRX STI", "KOENIGSEGG CCX", "FERRARI 458 ITALIA", "NISSAN SKYLINE GT-R R32", "ALFA ROMEO 8C", "TOYOTA GR SUPRA", "CHEVROLET CAMARO SS", "BMW M3 (E36)", "CHEVROLET CORVETTE C6.R", "BMW M3 GTR", "FORD GT (2005)", "FORD MUSTANG SHELBY GT350", "FERRARI 599 GTB", "JAGUAR E-TYPE", "PLYMOUTH BARRACUDA", "VOLKSWAGEN GOLF MK1 GTI", "AUDI R8 LMS", "TOYOTA SPRINTER TRUENO AE86", "LAMBORGHINI MURCIELAGO", "CHEVROLET CORVETTE C6 ZR1", "MAZDA MX-5 MIATA", "PONTIAC FIERO GT", "LAMBORGHINI SIAN", "ACURA NSX (2017)", "FORD FOCUS RS", "MAZDA RX-8", "NISSAN 180SX", "PORSCHE 911 GT3 RS", "PAGANI HUAYRA", "ASTON MARTIN VANQUISH", "LAMBORGHINI SESTO ELEMENTO", "TOYOTA GT86", "SUBARU IMPREZA WRX (GC8)", "TOYOTA MR2 (SW20)", "DODGE VIPER GTS", "BMW M3 (E30)", "LAMBORGHINI GALLARDO SL", "AUDI RS6 AVANT", "PORSCHE 911 (964)", "BUGATTI BOLIDE", "LAMBORGHINI CENTENARIO", "DATSUN 240Z", "NISSAN GT-R (R35)", "MERCEDES-BENZ E63 AMG", "LANCIA 037 RALLY", "NISSAN SILVIA S14", "NISSAN SKYLINE GT-R R33", "FORD GT (2017)", "SALEEN S7", "ASTON MARTIN DB11", "BMW M4", "LAMBORGHINI VENENO", "JAGUAR F-TYPE", "MAZDA RX-7 VEILSIDE", "FERRARI TESTAROSSA", "TESLA ROADSTER", "SUBARU WRX STI (GD)", "AUDI RS4 AVANT", "FORD MUSTANG SHELBY GT500 (2007)", "FERRARI F430"];
const NAMES={
 HATCHBACK:['PIXEL','GADFLY','SCAMP','TEMPO','BANTAM','SPRITE','CRICKET','WHIPPET','RASCAL','NIMBUS','DART','FIZZ'],
 WAGON:['TRAVERSE','OUTLAND','PACKHORSE','ESTATE GT','HAULER','RAMBLER'],
 SEDAN:['MERIDIAN','AURELIA','CADENCE','SOVEREIGN','STRATA','PILOT','VECTOR','ENVOY','MONARCH','CONSUL','DIPLOMAT','BARON'],
 COUPE:['KESTREL','MERLIN','OSPREY','HARRIER','SHRIKE','CONDOR','LARK','PEREGRINE','FALCONET','TERCEL','ORIOLE','KITE','SWIFT','ROOK'],
 MUSCLE:['HAVOC','STAMPEDE','RAMPAGE','BRAWLER','MAULER','MARAUDER','BRUISER','ANVIL','WARHORSE','WRECKER','THUNDERHEAD','BULLDOG','RIOT','GRIZZLY','JUGGERNAUT','TITAN','SLEDGE','BEHEMOTH','CHARGER X','BRUTUS','OUTLAW','RAZORBACK','HELLION'],
 SPORTS:['ARROW','TALON','ZEPHYR','COMET','FLARE','RAPIER','SABRE','LANCER X','DERVISH','CORSAIR','BANSHEE','PHANTOM','MISTRAL','SIROCCO','HALCYON'],
 SUPERCAR:['VEGA','ALTAIR','RIGEL','ANTARES','SIRIUS','ARCTURUS','VESPER','PULSAR','QUASAR','LUMEN','SOLACE','ORION','NOVA S','DRAXA','CORVANE','ASTRA','CAPELLA','POLARIS'],
 HYPERCAR:['TEMPEST','MAELSTROM','TYPHON','CHIMERA','BASILISK','WRAITH','LEVIATHAN','KRAKEN','REVENANT','SPECTER','ECLIPSE','CATACLYSM'],
 TRACK:['R-SPEC','GT-RS','TRACKDAY','APEX','SLICK','HOTLAP','CHICANE','PITLANE','BOOST R','CLUBSPORT','SCRAPER','LAPPER','TIMEATTACK','HAIRPIN','SPLITTER']};
/* the 14 original ids -> pack models (stats and ids unchanged, so saves keep working) */
const PWR={37:.97,73:.99,0:.93,104:.92,106:.91,127:.94,116:.93,98:.92,36:.9,115:.97,35:.86,42:.86,38:.82,123:.84,86:.8,124:.82,77:.9,15:.9,30:.74,33:.8,43:.88,44:.7,94:.78,112:.75,1:.78,66:.76,63:.7,78:.8,135:.76,88:.8,130:.66,69:.66,7:.72,92:.8,99:.72,49:.64,105:.7,74:.74,20:.72,46:.8,118:.78,
 76:.3,26:.22,91:.12,67:.26,50:.2,93:.2,96:.14,100:.34,65:.4,51:.34,120:.42,52:.46,68:.5,57:.4,111:.42,28:.34};
const LIFT={WAGON:.12};
const OLD={lr:{k:133,cat:'WAGON',type:'RALLY WAGON'},ford:{k:76,cat:'HATCHBACK'},merc:{k:119,cat:'SEDAN'},ster:{k:100,cat:'HATCHBACK',type:'RAISED HATCH'},
 art:{k:49,cat:'SUPERCAR',type:'HYBRID SUPERCAR'},ferr:{k:38,cat:'SUPERCAR'},zen:{k:0,cat:'HYPERCAR'},must:{k:72,cat:'MUSCLE'},
 urus:{k:113,cat:'WAGON',type:'RALLY WAGON'},m8:{k:105,cat:'COUPE',type:'GRAND TOURER'},amg:{k:74,cat:'COUPE'},gtr:{k:118,cat:'SPORTS'},por:{k:103,cat:'SPORTS'},p1:{k:115,cat:'HYPERCAR',type:'HYPERCAR'}};
function catalogue(){
 for(let k=0;k<N;k++){const c=catOf(k);META[k].lift=LIFT[c]||0}
 META[100].lift=.1;
 const used=new Set();for(const id in OLD){const o=OLD[id],c=P.BYID[id];if(!c)continue;Object.assign(c,{body:o.k*2,alt:o.k*2+1,name:REALN[o.k],cat:o.cat,k10:o.k});if(o.type)c.type=o.type;c.eng=c.eng||ENG[o.cat][0];used.add(o.k)}
 /* fix up per-id tables the other layers read */
 const byCat={};
 for(let k=0;k<N;k++){if(used.has(k))continue;const cat=catOf(k);(byCat[cat]=byCat[cat]||[]).push(k)}
 let made=0;
 for(const cat of CATS){const ks=byCat[cat]||[];ks.forEach((k,i)=>{const m=META[k],id='c'+k,jit=(((k*37+11)%17)/17-.5)*.16;
  let s=PWR[k]!=null?PWR[k]:Math.max(.04,Math.min(.98,BASE[cat]+jit+(m.wid-2.0)*.12+(1.3-m.hgt)*.15));const nm=REALN[k];
  const cls=s<.2?'D':s<.4?'C':s<.62?'B':s<.82?'A':'S',price=Math.round(8000*Math.exp(3.7*s)/500)*500;
  const c={id,gears:3,name:nm,cls,body:k*2,alt:k*2+1,top:+(34+19*s).toFixed(1),acc:+(20+15*s).toFixed(1),grip:+(.96+.15*s).toFixed(3),brk:+(.92+.25*s).toFixed(3),off:OFF[cat],price,altPrice:Math.max(2500,Math.min(12000,Math.round(price*.06/500)*500)),type:TYPE[cat],drive:cat==='HATCHBACK'||cat==='WAGON'?'AWD':cat==='MUSCLE'||cat==='HYPERCAR'?'RWD':(k%3===0?'AWD':'RWD'),blurb:BLURB[cat],cat,k10:k,eng:ENG[cat][k%ENG[cat].length]};
  c.box=c.off>=.8?'wide':s<.5?'std':'close';P.CARS.push(c);P.BYID[id]=c;made++})}
 P.CARS.forEach(c=>{c.cat=c.cat||'COUPE';c.real=REALG[c.cat]||6;if(!c.box)c.box=P.BYID[c.id]&&({lr:'wide',urus:'wide',ford:'std',merc:'std',must:'std'})[c.id]||'close'});
 const clsIdx=c=>P.CLS.indexOf(c.cls);P.SORTED.length=0;P.SORTED.push(...[...P.CARS].sort((a,b)=>clsIdx(a)-clsIdx(b)||a.price-b.price));
 P.CATS=CATS;console.info('catalogue',P.CARS.length,'cars');
}
catalogue();
function install(){const L=N*2;
 for(let i=0;i<L;i++)Object.defineProperty(CAR_MODELS,i,{configurable:true,enumerable:true,get(){return cache[i]||(cache[i]=build(i>>1,i&1))},set(v){cache[i]=v}});
 C10.ready=true;ALL_CARS.forEach(attachCarModel);if(typeof $==='function'&&$('loadState'))$('loadState').textContent=N+' cars';
 console.info('cars10 ready',N,'cars');if(P.onCars10)P.onCars10()}
C10.model=(k,alt)=>CAR_MODELS[k*2+(alt?1:0)];
async function init(){try{
 const raw=atob(CAR10_BIN_B64),b=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);
 const rs=new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip')));buf=await rs.arrayBuffer();install()}catch(e){console.error('cars10',e)}}
init();
})();
