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
  if(pt.n==='body'){const uq=new Uint16Array(buf,pt.u,pt.nv*2),uv=new Float32Array(pt.nv*2);for(let i=0;i<uv.length;i++)uv[i]=uq[i]/65535;g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf,pt.i,pt.nt*3),1));g.computeVertexNormals();out[pt.n]=g}
 return geo[k]=out}
function build(k,alt){const m=META[k],G=geoms(k),g=new THREE.Group();g.name='car'+k+(alt?'a':'');
 if(G.body){const b=new THREE.Mesh(G.body,bodyMat);b.name='body';g.add(b)}
 if(G.paint){const c=alt?altRGB(k):m.paint,pm=new THREE.MeshStandardMaterial({color:srgb(c[0],c[1],c[2]),roughness:.42,metalness:.32,flatShading:true});const p=new THREE.Mesh(G.paint,pm);p.name='paint';g.add(p)}
 /* invisible nose / tail markers so the livery baker knows which way the car faces (front is -Z in model space) */
 const mk=(n,z)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,.5,z,0,.5,z,0,.5,z]),3));const q=new THREE.Mesh(t,new THREE.MeshBasicMaterial());q.name=n;q.visible=false;g.add(q)};
 mk('front',-m.len/2*.98);mk('rear',m.len/2*.98);
 g.userData.gl=gameLen(m);g.userData.k=k;return g}

/* ================= catalogue: the 14 original ids keep their saves/stats but now wear pack models; 122 more cars join them ================= */
const CATS=['HATCHBACK','WAGON','SEDAN','COUPE','MUSCLE','SPORTS','SUPERCAR','HYPERCAR','TRACK'];
const LISTS={HATCHBACK:[26,50,51,65,67,76,91,100,101,132,93,56],WAGON:[113,133],SEDAN:[3,5,28,39,53,57,61,79,108,111,119,125],
 MUSCLE:[4,8,14,17,23,29,31,41,46,54,58,64,70,72,82,87,90,110,114,117,134,59,83],
 TRACK:[11,24,34,35,45,84,85,92,98,102,104,109,112,129,107],HYPERCAR:[0,115,127,123,63]};
const catOf=k=>{for(const c in LISTS)if(LISTS[c].includes(k))return c;const m=META[k];
 if(m.hgt<1.10)return'HYPERCAR';if(m.hgt<1.20)return'SUPERCAR';if(m.wing>=.97&&m.hgt<1.3)return'TRACK';return m.hgt<1.28&&m.wid>=2.0?'SPORTS':m.len<4.4?'COUPE':'SPORTS'};
const BASE={HATCHBACK:.22,WAGON:.3,SEDAN:.38,COUPE:.46,MUSCLE:.5,SPORTS:.56,TRACK:.74,SUPERCAR:.8,HYPERCAR:.94};
const OFF={HATCHBACK:.8,WAGON:.85,SEDAN:.5,COUPE:.45,MUSCLE:.4,SPORTS:.45,TRACK:.36,SUPERCAR:.38,HYPERCAR:.3};
const TYPE={HATCHBACK:'HOT HATCH',WAGON:'PERFORMANCE WAGON',SEDAN:'SPORTS SEDAN',COUPE:'SPORTS COUPE',MUSCLE:'MUSCLE COUPE',SPORTS:'SPORTS CAR',SUPERCAR:'SUPERCAR',HYPERCAR:'HYPERCAR',TRACK:'TRACK WEAPON'};
const BLURB={HATCHBACK:'Short, light and cheeky. Turns in sharply and loves a loose surface.',WAGON:'Long roof, long legs. Hauls itself down a stage like the shopping is on fire.',SEDAN:'Four doors, no apologies. Quick, planted and quietly rude.',COUPE:'A tidy two-door with real pace and a handling balance to match.',MUSCLE:'Big, loud and a little untidy. Wants straights and a firm hand.',SPORTS:'Sharp, low and driver-focused. Rewards smooth, committed driving.',SUPERCAR:'Wide, low and wedge-shaped. Huge grip and a very long top gear.',HYPERCAR:'The fastest things in the showroom. Barely road legal, barely controllable.',TRACK:'Wings, splitters and no manners. Built for lap times and nothing else.'};
const ENG={HATCHBACK:['i4t','i4t','v6t'],WAGON:['i6','v6t'],SEDAN:['v6t','i6','v8'],COUPE:['v6t','f6','i6'],MUSCLE:['v8','v8'],SPORTS:['f6','v6t','v8'],SUPERCAR:['v10','v8t','v12'],HYPERCAR:['v12','v8h','v8t'],TRACK:['v6t','v8','f6']};
const REALG={HATCHBACK:6,WAGON:6,SEDAN:6,COUPE:6,MUSCLE:6,SPORTS:6,SUPERCAR:7,HYPERCAR:7,TRACK:6};
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
const OLD={lr:{k:133,name:'OUTRIDER',cat:'WAGON',type:'RALLY WAGON'},ford:{k:76,name:'HORNET',cat:'HATCHBACK'},merc:{k:119,name:'REGENT',cat:'SEDAN'},ster:{k:100,name:'STERRATO',cat:'HATCHBACK',type:'RAISED HATCH'},
 art:{k:49,name:'ARTURA',cat:'SUPERCAR',type:'HYBRID SUPERCAR'},ferr:{k:38,name:'FERRARI',cat:'SUPERCAR'},zen:{k:0,name:'ZENVO',cat:'HYPERCAR'},must:{k:72,name:'MUSTANG',cat:'MUSCLE'},
 urus:{k:113,name:'VIKING',cat:'WAGON',type:'RALLY WAGON'},m8:{k:105,name:'BMW M8',cat:'COUPE',type:'GRAND TOURER'},amg:{k:74,name:'MERCEDES AMG',cat:'COUPE'},gtr:{k:118,name:'GT-R',cat:'SPORTS'},por:{k:103,name:'PORSCHE',cat:'SPORTS'},p1:{k:115,name:'P1 GTR',cat:'HYPERCAR',type:'HYBRID HYPERCAR'}};
function catalogue(){
 const used=new Set();for(const id in OLD){const o=OLD[id],c=P.BYID[id];if(!c)continue;Object.assign(c,{body:o.k*2,alt:o.k*2+1,name:o.name,cat:o.cat,k10:o.k});if(o.type)c.type=o.type;c.eng=c.eng||ENG[o.cat][0];used.add(o.k)}
 /* fix up per-id tables the other layers read */
 const byCat={};
 for(let k=0;k<N;k++){if(used.has(k))continue;const cat=catOf(k);(byCat[cat]=byCat[cat]||[]).push(k)}
 let made=0;
 for(const cat of CATS){const ks=byCat[cat]||[];ks.forEach((k,i)=>{const m=META[k],id='c'+k,jit=(((k*37+11)%17)/17-.5)*.16;
  let s=Math.max(.04,Math.min(.98,BASE[cat]+jit+(m.wid-2.0)*.12+(1.3-m.hgt)*.15));const nm=NAMES[cat][i%NAMES[cat].length]+(i>=NAMES[cat].length?' '+(Math.floor(i/NAMES[cat].length)+1):'');
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
