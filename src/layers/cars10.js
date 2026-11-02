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
const MV=META.reduce((t,m)=>t+m.len*m.wid*m.hgt,0)/META.length;
/* population-normalised size: pull every car's volume 75% of the way to the mean, keep the rest of its natural size order */
const gameLen=m=>{const k=Math.pow(MV/(m.len*m.wid*m.hgt),.25);return Math.min(4.65,Math.max(m.len,m.wid)*k)};
let buf=null;const geo={},cache={};
const bodyMat=new THREE.MeshStandardMaterial({map:tex,roughness:.62,metalness:.12,flatShading:true,shadowSide:THREE.DoubleSide});
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
 if(G.paint){const c=alt?altRGB(k):m.paint,pm=new THREE.MeshStandardMaterial({color:srgb(c[0],c[1],c[2]),roughness:.58,metalness:.18,flatShading:true,shadowSide:THREE.DoubleSide});const p=new THREE.Mesh(G.paint,pm);p.name='paint';p.position.y=lift;g.add(p)}
 /* invisible nose / tail markers so the livery baker knows which way the car faces (front is -Z in model space) */
 const mk=(n,z)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,.5,z,0,.5,z,0,.5,z]),3));const q=new THREE.Mesh(t,new THREE.MeshBasicMaterial());q.name=n;q.visible=false;g.add(q)};
 mk('front',-m.len/2*.98);mk('rear',m.len/2*.98);
 g.userData.gl=gameLen(m);g.userData.k=k;return g}

/* ================= catalogue: the 14 original ids keep their saves/stats but now wear pack models; 122 more cars join them ================= */
const CATS=['HATCHBACK','WAGON','SEDAN','COUPE','MUSCLE','SPORTS','SUPERCAR','HYPERCAR','TRACK'];
const LISTS={HATCHBACK:[26,50,51,65,67,76,91,100,132,93],WAGON:[113,133],SEDAN:[3,5,21,28,32,39,53,57,61,79,108,111,119],
 MUSCLE:[4,14,17,19,23,29,31,54,60,64,70,72,82,87,90,110,134],
 TRACK:[11,24,34,35,45,68,84,85,92,102,107,109,112,120,129],HYPERCAR:[0,36,37,73,98,104,106,115,116,127]};
const CATFIX={"0": "HYPERCAR", "1": "HYPERCAR", "2": "SPORTS", "3": "SPORTS", "5": "SEDAN", "8": "SPORTS", "9": "TRACK", "10": "MUSCLE", "11": "SPORTS", "12": "COUPE", "15": "HYPERCAR", "16": "SPORTS", "17": "SUPERCAR", "18": "COUPE", "21": "SPORTS", "22": "COUPE", "23": "TRACK", "25": "COUPE", "28": "SEDAN", "32": "SEDAN", "34": "SUPERCAR", "43": "SUPERCAR", "47": "SPORTS", "48": "COUPE", "49": "SPORTS", "51": "HYPERCAR", "52": "HYPERCAR", "53": "SPORTS", "55": "COUPE", "56": "SPORTS", "58": "COUPE", "59": "SPORTS", "61": "SPORTS", "62": "COUPE", "63": "TRACK", "65": "HYPERCAR", "73": "HYPERCAR", "74": "SUPERCAR", "75": "HYPERCAR", "76": "HATCHBACK", "77": "HYPERCAR", "79": "SPORTS", "80": "SUPERCAR", "84": "TRACK", "85": "SUPERCAR", "86": "SUPERCAR", "88": "SUPERCAR", "95": "SPORTS", "96": "COUPE", "97": "MUSCLE", "98": "HYPERCAR", "102": "TRACK", "103": "SPORTS", "104": "HYPERCAR", "105": "SUPERCAR", "108": "HYPERCAR", "109": "TRACK", "111": "COUPE", "113": "WAGON", "114": "COUPE", "115": "TRACK", "116": "SUPERCAR", "120": "HYPERCAR", "121": "COUPE", "122": "COUPE", "124": "SUPERCAR", "125": "SUPERCAR", "126": "SPORTS", "129": "SPORTS", "130": "SUPERCAR", "132": "SPORTS", "133": "WAGON", "135": "SUPERCAR"},DEL=new Set([69, 81, 89, 99, 112]),RALLYONLY=[51,52,65,108,120];
const catOf=k=>{if(CATFIX[k])return CATFIX[k];for(const c in LISTS)if(LISTS[c].includes(k))return c;const m=META[k];
 if(m.hgt<1.10)return'HYPERCAR';if(m.hgt<1.20)return'SUPERCAR';if(m.wing>=.97&&m.hgt<1.3)return'TRACK';return m.hgt<1.28&&m.wid>=2.0?'SPORTS':m.len<4.4?'COUPE':'SPORTS'};
const BASE={HATCHBACK:.22,WAGON:.3,SEDAN:.38,COUPE:.46,MUSCLE:.5,SPORTS:.56,TRACK:.74,SUPERCAR:.8,HYPERCAR:.94};
const OFF={HATCHBACK:.8,WAGON:.85,SEDAN:.5,COUPE:.45,MUSCLE:.4,SPORTS:.45,TRACK:.36,SUPERCAR:.38,HYPERCAR:.3};
const TYPE={HATCHBACK:'HOT HATCH',WAGON:'PERFORMANCE WAGON',SEDAN:'SPORTS SEDAN',COUPE:'SPORTS COUPE',MUSCLE:'MUSCLE COUPE',SPORTS:'SPORTS CAR',SUPERCAR:'SUPERCAR',HYPERCAR:'HYPERCAR',TRACK:'TRACK WEAPON'};
const BLURB={HATCHBACK:'Short, light and cheeky. Turns in sharply and loves a loose surface.',WAGON:'Long roof, long legs. Hauls itself down a stage like the shopping is on fire.',SEDAN:'Four doors, no apologies. Quick, planted and quietly rude.',COUPE:'A tidy two-door with real pace and a handling balance to match.',MUSCLE:'Big, loud and a little untidy. Wants straights and a firm hand.',SPORTS:'Sharp, low and driver-focused. Rewards smooth, committed driving.',SUPERCAR:'Wide, low and wedge-shaped. Huge grip and a very long top gear.',HYPERCAR:'The fastest things in the showroom. Barely road legal, barely controllable.',TRACK:'Wings, splitters and no manners. Built for lap times and nothing else.'};
const ENG={HATCHBACK:['i4t','i4t','v6t'],WAGON:['i6','v6t'],SEDAN:['v6t','i6','v8'],COUPE:['v6t','f6','i6'],MUSCLE:['v8','v8'],SPORTS:['f6','v6t','v8'],SUPERCAR:['v10','v8t','v12'],HYPERCAR:['v12','v8h','v8t'],TRACK:['v6t','v8','f6']};
const REALG={HATCHBACK:6,WAGON:6,SEDAN:6,COUPE:6,MUSCLE:6,SPORTS:6,SUPERCAR:7,HYPERCAR:7,TRACK:6};
const REALN=["PAGANI ZONDA CINQUE", "VOLKSWAGON W12 NARDO", "ASTON MARTIN DBS", "BMW M3 (E90)", "PLYMOUTH SUPERBIRD", "SUBARU IMPREZA WRX", "MASERATI GRANTURISMO", "AUDI R8", "NISSAN SKYLINE GT-R R34", "BMW M3 GTR (GT3)", "CHEVROLET CORVETTE C3", "NISSAN SILVIA S15", "NISSAN 350Z", "PORSCHE 911 CARRERA", "BUICK GRAND NATIONAL", "PORSCHE 918 SPYDER", "TOMMY KAIRA ZZ", "DODGE VIPER (GEN 5)", "ACURA RSX", "DODGE CHALLENGER", "MERCEDES-AMG GT", "MITSUBISHI LANCER EVO X", "DELOREAN DMC-12", "MAZDA RX8 TRACK SPEC", "FERRARI 575M MARANELLO", "NISSAN 240SX", "VOLKSWAGEN GOLF GTI", "HONDA NSX (NA1)", "VW JETTA (MK3)", "SHELBY GT350 (1965)", "LAMBORGHINI DIABLO", "DODGE CHARGER R/T", "MERCEDES-AMG CLS63", "LAMBORGHINI HURACAN", "PORSCHE 911 GT2 RS", "MCLAREN F1 GTR", "W MOTORS LYKAN HYPERSPORT", "BUGATTI VEYRON", "FERRARI F40", "KIA STINGER GT", "SUBARU BRZ", "ALFA ROMEO ALFETTA GTV", "FERRARI ENZO", "LAMBORGHINI AVENTADOR SV", "LAMBORGHINI COUNTACH", "BMW M4 GT3", "MERCEDES-AMG GT R", "CHEVROLET CORVETTE C7", "MAZDA RX7", "BMW I8", "AUDI A1", "LANCIA DELTA INTEGRALE", "LANCIA STRATOS", "MITSUBISHI LANCER EVO VI", "CHEVROLET CHEVELLE SS", "TOYOTA 300ZX (Z32)", "NISSAN Z (RZ34)", "MERCEDES-BENZ 190E EVO II", "LANCIA FULIVA", "PORSCHE 911 TURBO (930)", "CHEVROLET CAMARO IROC-Z", "MITSUBISHI LANCER EVO IX", "NISSAN SKYLINE (C110)", "MAZDA 787B", "FORD MUSTANG 1967", "VW POLO WRC", "BUGATTI EB110", "HONDA CIVIC TYPE R (EK9)", "BMW M1 PROCAR", "FERRARI F355", "CHEVROLET CAMARO Z28", "NISSAN 350Z", "FORD MUSTANG SHELBY GT500", "BUGATTI DIVO", "MERCEDES-BENZ SLS AMG BLACK SERIES", "TESLA ROADSTER", "SUBARU IMPREZA WRX STI (GR)", "HENNESSEY VENOM F5", "FERRARI 458 ITALIA", "NISSAN SKYLINE GT-R R32", "ALFA ROMEO 8C", "TOYOTA GR SUPRA", "CHEVROLET CAMARO SS", "BMW M3 (E36)", "TOYOTA SUPRA A80 (JTCC)", "BMW M3 GTR (NFS)", "FORD GT (2005)", "FORD MUSTANG SHELBY GT350", "FERRARI 599 GTB", "JAGUAR E-TYPE", "PLYMOUTH BARRACUDA", "VOLKSWAGEN GOLF MK1 GTI", "AUDI R8 LMS", "TOYOTA SPRINTER TRUENO AE86", "LAMBORGHINI MURCIELAGO", "DE TOMASO PANTERA", "MAZDA MX-5 MIATA", "CHEVROLET CORVETTE C4", "KOENIGSEGG JESKO", "ACURA NSX (2017)", "FORD FOCUS RS", "MAZDA RX-8", "NISSAN SKYLINE GT-R R33", "PORSCHE 911 CARRERA RWB", "PAGANI ZONDA C12", "ASTON MARTIN VANQUISH", "LAMBORGHINI SESTO ELEMENTO", "TOYOTA GT86", "SUBARU IMPREZA WRX RALLY (GD)", "ACURA NSX TRACK (NA1)", "DODGE VIPER GTS", "BMW M3 (E30)", "LAMBORGHINI GALLARDO SL", "MITSUBISHI GALANT VR4", "ALPINE A110", "BUGATTI BOLIDE", "FORD GT90", "DATSUN 240Z", "NISSAN GT-R (R35)", "MERCEDES-BENZ E63 AMG", "LANCIA 037 RALLY", "NISSAN SILVIA S14", "NISSAN SILVIA S15", "FORD GT (2017)", "SALEEN S7", "ASTON MARTIN DBS", "BMW M4", "LAMBORGHINI VENENO", "JAGUAR F-TYPE", "MAZDA RX-7 VEILSIDE", "FERRARI 288 GTO", "TESLA ROADSTER", "SUBARU WRX STI (GD)", "AUDI RS4 AVANT (B5)", "FORD MUSTANG SHELBY GT500 (2007)", "FERRARI F430"];
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
const LIFT={};
const OLD={lr:{k:133,cat:'WAGON',type:'RALLY WAGON'},ford:{k:76,cat:'HATCHBACK'},merc:{k:119,cat:'SEDAN'},ster:{k:100,cat:'HATCHBACK',type:'RALLY HATCH'},
 art:{k:49,cat:'SUPERCAR',type:'HYBRID SUPERCAR'},ferr:{k:38,cat:'SUPERCAR'},zen:{k:0,cat:'HYPERCAR'},must:{k:72,cat:'MUSCLE'},
 urus:{k:113,cat:'WAGON',type:'RALLY WAGON'},m8:{k:105,cat:'COUPE',type:'GRAND TOURER'},amg:{k:74,cat:'COUPE'},gtr:{k:118,cat:'SPORTS'},por:{k:103,cat:'SPORTS'},p1:{k:115,cat:'HYPERCAR',type:'HYPERCAR'}};
function catalogue(){
 for(let k=0;k<N;k++){const c=catOf(k);META[k].lift=LIFT[c]||0}
 
 const used=new Set();for(const id in OLD){const o=OLD[id],c=P.BYID[id];if(!c)continue;const nc=CATFIX[o.k]||o.cat;Object.assign(c,{body:o.k*2,alt:o.k*2+1,name:REALN[o.k],cat:nc,k10:o.k});if(o.type&&nc===o.cat)c.type=o.type;else c.type=TYPE[nc];c.eng=c.eng||ENG[nc][0];used.add(o.k)}
 /* fix up per-id tables the other layers read */
 const byCat={};
 for(let k=0;k<N;k++){if(used.has(k)||DEL.has(k))continue;const cat=catOf(k);(byCat[cat]=byCat[cat]||[]).push(k)}
 let made=0;
 for(const cat of CATS){const ks=byCat[cat]||[];ks.forEach((k,i)=>{const m=META[k],id='c'+k,jit=(((k*37+11)%17)/17-.5)*.16;
  let s=PWR[k]!=null?PWR[k]:Math.max(.04,Math.min(.98,BASE[cat]+jit+(m.wid-2.0)*.12+(1.3-m.hgt)*.15));const nm=REALN[k];
  const cls=s<.2?'D':s<.4?'C':s<.62?'B':s<.82?'A':'S',price=Math.round(8000*Math.exp(3.7*s)/500)*500;
  const c={id,gears:3,name:nm,cls,body:k*2,alt:k*2+1,top:+(34+19*s).toFixed(1),acc:+(20+15*s).toFixed(1),grip:+(.96+.15*s).toFixed(3),brk:+(.92+.25*s).toFixed(3),off:OFF[cat],price,altPrice:Math.max(2500,Math.min(12000,Math.round(price*.06/500)*500)),type:TYPE[cat],drive:cat==='HATCHBACK'||cat==='WAGON'?'AWD':cat==='MUSCLE'||cat==='HYPERCAR'?'RWD':(k%3===0?'AWD':'RWD'),blurb:BLURB[cat],cat,k10:k,eng:ENG[cat][k%ENG[cat].length]};
  c.box=c.off>=.8?'wide':s<.5?'std':'close';if(RALLYONLY.includes(k))c.rallyOnly=true;P.CARS.push(c);P.BYID[id]=c;made++})}
 P.CARS.forEach(c=>{c.cat=c.cat||'COUPE';c.real=REALG[c.cat]||6;if(!c.box)c.box=P.BYID[c.id]&&({lr:'wide',urus:'wide',ford:'std',merc:'std',must:'std'})[c.id]||'close'});
 const clsIdx=c=>P.CLS.indexOf(c.cls);P.SORTED.length=0;P.SORTED.push(...[...P.CARS].sort((a,b)=>clsIdx(a)-clsIdx(b)||a.price-b.price));
 P.CATS=CATS;
}
catalogue();
function install(){const L=N*2;
 for(let i=0;i<L;i++)Object.defineProperty(CAR_MODELS,i,{configurable:true,enumerable:true,get(){return cache[i]||(cache[i]=build(i>>1,i&1))},set(v){cache[i]=v}});
 C10.ready=true;ALL_CARS.forEach(attachCarModel);if(typeof $==='function'&&$('loadState'))$('loadState').textContent=N+' cars';
 if(P.onCars10)P.onCars10()}
C10.model=(k,alt)=>CAR_MODELS[k*2+(alt?1:0)];

/* ================= traffic copies (Nov 2): built fresh, never the cached race model, so no baked livery leaks in ================= */
/* the pack poses the front wheels steered (a showroom pose): each wheel is turned back until it is thinnest across the car */
const tireFix={};
function straightTires(k){if(tireFix[k])return tireFix[k];const G=geoms(k);if(!G.tires)return null;const g=G.tires.clone(),P_=g.attributes.position,n=P_.count;
 g.computeBoundingBox();const bc=g.boundingBox.getCenter(new THREE.Vector3());const cl=new Int8Array(n);const grp=[[],[],[],[]];
 for(let i=0;i<n;i++){const q=(P_.getX(i)>bc.x?1:0)+(P_.getZ(i)>bc.z?2:0);cl[i]=q;grp[q].push(i)}
 for(const ids of grp){if(ids.length<6)continue;let cx=0,cz=0;for(const i of ids){cx+=P_.getX(i);cz+=P_.getZ(i)}cx/=ids.length;cz/=ids.length;
  let best=0,bw=1e9;for(let a=-.7;a<=.7;a+=.01){const c=Math.cos(a),s_=Math.sin(a);let lo=1e9,hi=-1e9;for(const i of ids){const x=P_.getX(i)-cx,z=P_.getZ(i)-cz,xr=x*c-z*s_;if(xr<lo)lo=xr;if(xr>hi)hi=xr}if(hi-lo<bw-1e-4){bw=hi-lo;best=a}}
  if(Math.abs(best)<.03)continue;const c=Math.cos(best),s_=Math.sin(best);
  for(const i of ids){const x=P_.getX(i)-cx,z=P_.getZ(i)-cz;P_.setXYZ(i,cx+x*c-z*s_,P_.getY(i),cz+x*s_+z*c)}}
 P_.needsUpdate=true;g.computeVertexNormals();return tireFix[k]=g}
/* the lamps, found from the palette colour under each body triangle: amber = indicators, red = tail, pale at the nose = headlights */
let pal=null;function palette(){if(pal)return pal;const im=tex.image;if(!im||!im.width)return null;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);pal={w:im.width,h:im.height,d:x.getImageData(0,0,im.width,im.height).data};return pal}
const lampCache={};
/* body triangles sorted by the palette colour under them: lamps only count on the nose and tail faces (facing out); everything else keeps its stock texture */
function lamps(k){if(lampCache[k]!==undefined)return lampCache[k];const G=geoms(k),b=G.body,pl=palette();if(!b||!pl||!b.attributes.uv)return lampCache[k]=null;
 const P_=b.attributes.position,U=b.attributes.uv,ix=b.index.array;b.computeBoundingBox();const bb=b.boundingBox,zL=bb.max.z-bb.min.z,zc=(bb.max.z+bb.min.z)/2;
 const out={l:[],r:[],b:[],h:[],liv:[],rest:[]},A=new THREE.Vector3(),B_=new THREE.Vector3(),C=new THREE.Vector3(),N=new THREE.Vector3(),E=new THREE.Vector3();
 for(let t=0;t<ix.length;t+=3){const a=ix[t],b_=ix[t+1],c=ix[t+2];const u=(U.getX(a)+U.getX(b_)+U.getX(c))/3,v=(U.getY(a)+U.getY(b_)+U.getY(c))/3;
  const px=Math.min(pl.w-1,Math.max(0,Math.floor(u*pl.w))),py=Math.min(pl.h-1,Math.max(0,Math.floor(v*pl.h))),o=(py*pl.w+px)*4,R=pl.d[o],Gc=pl.d[o+1],Bc=pl.d[o+2];
  A.fromBufferAttribute(P_,a);B_.fromBufferAttribute(P_,b_);C.fromBufferAttribute(P_,c);N.subVectors(B_,A).cross(E.subVectors(C,A)).normalize();
  const z=(A.z+B_.z+C.z)/3-zc,x=(A.x+B_.x+C.x)/3,end=Math.abs(z)>zL*.36&&Math.abs(N.z)>.35&&Math.sign(N.z)===Math.sign(z);
  const mx=Math.max(R,Gc,Bc),mn=Math.min(R,Gc,Bc),sat=mx-mn>70;
  const amber=R>190&&Gc>80&&Gc<200&&Bc<90&&R-Bc>120,red=R>140&&Gc<80&&Bc<90,pale=mn>170;
  if(end&&amber){(x>0?out.r:out.l).push(a,b_,c);out.rest.push(a,b_,c)}/* model front is -Z, so +X is the driver's right; the lens stays in the body too, so it shows unlit */
  else if(end&&red&&z>0){out.b.push(a,b_,c);out.rest.push(a,b_,c)}
  else if(end&&pale&&z<0){out.h.push(a,b_,c);out.rest.push(a,b_,c)}
  else out.rest.push(a,b_,c)}
 /* no amber lenses on this model: the indicators flash the outer part of the head and tail lamps on each side */
 const outer=(src,neg)=>{const res=[];let xm=0;for(let t=0;t<src.length;t+=3){const x=Math.abs(P_.getX(src[t]));if(x>xm)xm=x}
  for(let t=0;t<src.length;t+=3){const x=(P_.getX(src[t])+P_.getX(src[t+1])+P_.getX(src[t+2]))/3;if((neg?x<0:x>0)&&Math.abs(x)>xm*.55)res.push(src[t],src[t+1],src[t+2])}return res};
 if(!out.l.length&&!out.r.length){out.l=outer(out.h,true).concat(outer(out.b,true));out.r=outer(out.h,false).concat(outer(out.b,false))}
 const mk=arr=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',P_);g.setIndex(arr);return g};
 const body=new THREE.BufferGeometry();for(const n in b.attributes)body.setAttribute(n,b.attributes[n]);body.setIndex(out.rest);
 const liv=out.liv.length?(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',P_);g.setAttribute('normal',b.attributes.normal);g.setIndex(out.liv);return g})():null;
 return lampCache[k]={l:mk(out.l),r:mk(out.r),b:mk(out.b),h:mk(out.h),body,liv}}
const trafMat={};
/* traffic wears each car's own stock look: the factory paint colour and its texture untouched (no repaint, no stripes recoloured) */
C10.traffic=(k)=>{const m=META[k],G=geoms(k),g=new THREE.Group(),lift=m.lift||0,rgb=m.paint;
 const L_=lamps(k);let pm=null;if(G.paint){const key=rgb.join(',');pm=trafMat[key]||(trafMat[key]=new THREE.MeshStandardMaterial({color:srgb(rgb[0],rgb[1],rgb[2]),roughness:.5,metalness:.2,flatShading:true}))}
 if(G.body){const b=new THREE.Mesh(L_?L_.body:G.body,bodyMat);b.position.y=lift;g.add(b)}
 const tg=straightTires(k)||G.tires;if(tg)g.add(new THREE.Mesh(tg,bodyMat));
 if(G.paint){const p=new THREE.Mesh(G.paint,pm);p.position.y=lift;g.add(p)}
 g.userData.gl=gameLen(m);g.userData.k=k;g.userData.lamps=L_;g.userData.lift=lift;return g};
async function init(){try{
 const raw=atob(CAR10_BIN_B64),b=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)b[i]=raw.charCodeAt(i);
 const rs=new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip')));buf=await rs.arrayBuffer();install()}catch(e){console.error('cars10',e)}}
init();
})();
