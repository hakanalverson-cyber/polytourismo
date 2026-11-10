/* ===== Poly GT layer: snow (Nov 10, Hakan: "clean up rally more please, there should be more snow everywhere, and there should be snow shaders").
   On the snow stage (Sweden):
   - a snow shader on everything of the stage model and on the props added to it: snow lies where it can settle, on the faces that look up
     (the tiers of a spruce, the top of a rock, a roof, the top of a bank, a hay bale), with a ragged edge so it does not end on a ruler line;
     steep and overhanging faces keep their own colour. The snow has a fine grain, slow drifts of slightly different white, a cold blue in the
     shade, and glints that come and go as you move (single crystals catching the light)
   - snow banks: a ploughed ridge along both edges of the road for the whole stage, set on the model's ground, uneven in height and width
   - the falling snow comes in two layers, fine flakes near the camera and big slow ones further out (light, on a sunny morning)
   PTO.snowFx===false turns all of it off. ===== */
(function snowfx(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof buildWorld==='undefined')return;
const on=()=>!window.PTO||window.PTO.snowFx!==false;
const NOISE=`float sh31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float svn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(sh31(i),sh31(i+vec3(1,0,0)),f.x),mix(sh31(i+vec3(0,1,0)),sh31(i+vec3(1,1,0)),f.x),f.y),mix(mix(sh31(i+vec3(0,0,1)),sh31(i+vec3(1,0,1)),f.x),mix(sh31(i+vec3(0,1,1)),sh31(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
/* lo..hi: how far a face must look up before snow holds on it; amt: how white it gets; all: 1 = snow whatever the slope (the banks) */
function snowMat(m,o){if(!m||m.userData.snowFx||!m.isMeshStandardMaterial&&!m.isMeshLambertMaterial&&!m.isMeshPhongMaterial)return m;m.userData.snowFx=1;o=o||{};
 const lo=(o.lo!=null?o.lo:.3).toFixed(3),hi=(o.hi!=null?o.hi:.62).toFixed(3),amt=(o.amt!=null?o.amt:.94).toFixed(3),all=o.all?1:0,prev=m.onBeforeCompile;
 m.extensions=Object.assign({},m.extensions,{derivatives:true});
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSnP;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 sw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nsw=instanceMatrix*sw;\n#endif\nvSnP=(modelMatrix*sw).xyz;}');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSnP;float snK=0.;float snG=0.;\n'+NOISE)
   .replace('#include <color_fragment>',`#include <color_fragment>
{vec3 sn=normalize(cross(dFdx(vSnP),dFdy(vSnP)));vec3 sv=cameraPosition-vSnP;if(dot(sn,sv)<0.)sn=-sn;
 float n1=svn(vSnP*.55),n2=svn(vSnP*2.3);
 snK=${all?'1.':`smoothstep(${lo},${hi},sn.y+(n1-.5)*.34+(n2-.5)*.12)`}*${amt};
 /* the snow itself: drifts of slightly different white, a fine grain, colder where it faces away from the sky */
 vec3 sc=vec3(.975,.985,1.)*(.955+.05*n1)*(.985+.03*sh31(floor(vSnP*9.)));sc=mix(sc*vec3(.9,.94,1.),sc,smoothstep(.15,.8,sn.y));
 diffuseColor.rgb=mix(diffuseColor.rgb,sc,snK);
 /* glints: a few crystals per square metre, each lit only from a narrow range of directions, so they flicker as the camera moves */
 float dist=length(sv);vec3 cell=floor(vSnP*7.);float hsh=sh31(cell);vec3 vd=sv/max(dist,.001);
 float ang=fract(hsh*31.7+dot(vd,vec3(5.3,2.1,4.7))*2.2);snG=step(.94,hsh)*smoothstep(.12,0.,abs(ang-.5))*snK*(1.-smoothstep(18.,60.,dist));}`)
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance=mix(totalEmissiveRadiance,vec3(.05,.058,.075),snK)/* the snow lights itself a little: light scattered inside it keeps the shade white instead of grey-blue */+vec3(1.,.98,.94)*snG*.55;')};
 const k0=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>k0+'|snow'+lo+hi+amt+all;m.needsUpdate=true;return m}
P.snowMat=snowMat;
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
/* the ploughed ridge along both road edges */
function banks(sc,T){const N=T.finI||T.N,sp=T.sp||3,pos=[],idx=[];let nv=0;
 for(const side of[-1,1]){let run=0;for(let i=2;i<N-2;i+=2){const c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),hw=T.hw[i];
   const wob=.5+.5*Math.sin(i*.11+side)+.35*Math.sin(i*.37+side*2),w=1.5+wob*.7,h=.42+wob*.28+rnd()*.12,o0=hw+.35,ring=[];let ok=true;
   /* cross-section: road-side toe, crest (toward the road side), a shoulder, the outer toe well out on the verge */
   for(const[u,v]of[[0,0],[.3,1],[.62,.72],[1,0]]){const off=side*(o0+u*w),x=T.x[i]+c*off,z=T.z[i]-s*off,g=T.terr(x,z);if(g==null||!isFinite(g)||Math.abs(g-T.y[i])>1.3){ok=false;break}ring.push(x,g-.06+v*h,z)}
   if(!ok){run=0;continue}for(const v of ring)pos.push(v);if(run){const a=nv-4,b=nv;for(let k=0;k<3;k++){if(side>0)idx.push(a+k,b+k,a+k+1,a+k+1,b+k,b+k+1);else idx.push(a+k,a+k+1,b+k,a+k+1,b+k+1,b+k)}}nv+=4;run=1}}
 if(!idx.length)return 0;let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g=g.toNonIndexed();g.computeVertexNormals();
 const m=snowMat(new THREE.MeshStandardMaterial({color:0xe6ecf4,roughness:.92,metalness:0,flatShading:true}),{all:1,amt:1});
 const me=new THREE.Mesh(g,m);me.name='snowBanks';me.receiveShadow=true;me.castShadow=false;me.userData.noMerge=1;me.userData.noChunk=1;me.frustumCulled=false;sc.add(me);return idx.length/3}
/* a second, slower layer of big flakes further out; the first layer (rallymaps.js) gets finer and denser */
function flakes(sc){const N=900,pos=new Float32Array(N*3),sd=new Float32Array(N*3);for(let i=0;i<N*3;i++)sd[i]=Math.random();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const cv=document.createElement('canvas');cv.width=cv.height=32;const c2=cv.getContext('2d'),q=c2.createRadialGradient(16,16,0,16,16,15);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(.4,'rgba(255,255,255,.4)');q.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=q;c2.fillRect(0,0,32,32);
 const m=new THREE.Points(g,new THREE.PointsMaterial({size:1.5,map:new THREE.CanvasTexture(cv),transparent:true,opacity:.5,depthWrite:false,sizeAttenuation:true,fog:false}));
 m.frustumCulled=false;m.renderOrder=6;m.userData.noMerge=1;m.userData.noChunk=1;m.userData.shd=1;sc.add(m);sc.userData.snow2={m,sd,N}}
const r0=R.render.bind(R);
R.render=function(scene,cam){const f=scene&&scene.userData&&scene.userData.snow2;if(f&&cam&&cam.position&&scene.userData.snowOn!==false){const t=performance.now()*.001,p=f.m.geometry.attributes.position.array,s=f.sd,W=120,H=50,cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;
  /* each flake keeps its place in the world and wraps around the camera, so driving through them reads as moving through the snowfall */
  for(let i=0;i<f.N;i++){const k=i*3,wx=s[k]*W*2+t*1.3+Math.sin(t*.4+s[k+1]*9)*2.5,wy=s[k+1]*H*2-t*(1.1+s[k+2]*.9),wz=s[k+2]*W*2+t*.5;
   p[k]=cx+(((wx-cx)%(W*2))+W*2)%(W*2)-W;p[k+1]=cy+(((wy-cy)%(H*2))+H*2)%(H*2)-H*.4;p[k+2]=cz+(((wz-cz)%(W*2))+W*2)%(W*2)-W}
  f.m.geometry.attributes.position.needsUpdate=true}return r0.apply(this,arguments)};
/* ---- the car in the snow (Nov 10, Hakan: "how can we make the car look better in that environment"). On the snow stage:
   - its reflections come from a picture of this place: deep blue overhead, a bright horizon, the frosted tree line, white snow below and a
     hard white sun, so the paint and glass carry the sky on top, the snow along the sills and a sun highlight on the shoulders
   - the paint is a little glossier there, and reflects more
   - snow packs onto the body from the road up: sills, arches and bumpers go white in a ragged line that climbs as you drive (PTO.snowCar===false: off) ---- */
/* Nov 10 (Hakan, on the snow car: "THIS IS PERFECT!! NOW DO THIS FOR DIRT PLEASE"): the same on the other stages, each with its own place in
   the reflections and its own dirt. Finland: dark pine forest, green verges, brown forest mud. Portugal: warm sky, dry hills, pale dust.
   France (tarmac): alpine sky and grey rock, only a light road film. zen/hor/gnd/shd/tree/top: the reflected place; th: height of the tree
   line; dirt: its colour; k: how much; sp: how far the spatter reaches above the packed line; gl: paint gloss */
const C3=(r,g,b)=>new THREE.Color(r,g,b);
const CAR={autumn:{zen:C3(.05,.22,.8),hor:C3(.8,.92,1.15),gnd:C3(1.25,1.28,1.36),shd:C3(.55,.66,.95),tree:C3(.42,.52,.56),top:C3(1.05,1.1,1.18),th:.1,sun:C3(1,.97,.9),dirt:[.93,.95,.99],k:1,sp:.5,gl:1},
 mangrove:{zen:C3(.1,.3,.78),hor:C3(.92,.9,.78),gnd:C3(.2,.3,.11),shd:C3(.07,.12,.05),tree:C3(.03,.07,.03),top:C3(.1,.22,.08),th:.34,sun:C3(1,.9,.72),dirt:[.3,.21,.13],k:.9,sp:.9,gl:.8},
 ash:{zen:C3(.12,.33,.8),hor:C3(1.05,.86,.6),gnd:C3(.5,.36,.21),shd:C3(.26,.18,.11),tree:C3(.1,.14,.05),top:C3(.22,.32,.1),th:.16,sun:C3(1,.85,.6),dirt:[.56,.43,.29],k:.85,sp:1.2,gl:.75},
 terr:{zen:C3(.08,.28,.82),hor:C3(.82,.92,1.08),gnd:C3(.2,.21,.23),shd:C3(.1,.11,.13),tree:C3(.3,.32,.36),top:C3(.75,.78,.84),th:.24,sun:C3(1,.95,.86),dirt:[.34,.33,.32],k:.3,sp:.7,gl:1}};
let pm=null,envRT=null;
function snowEnv(sc,K){let sun=null;sc.traverse(o=>{if(o.isDirectionalLight&&!sun)sun=o});const sd=sun?sun.position.clone().sub(sun.target?sun.target.position:new THREE.Vector3()).normalize():new THREE.Vector3(.4,.4,-.8);
 const es=new THREE.Scene(),g=new THREE.SphereGeometry(10,96,48),pos=g.attributes.position,col=new Float32Array(pos.count*3),d=new THREE.Vector3(),c=new THREE.Color(),t=new THREE.Color();
 const zen=K.zen,hor=K.hor,snw=K.gnd,shd=K.shd,tree=K.tree,frost=K.top,TH=K.th/.1;
 for(let i=0;i<pos.count;i++){d.fromBufferAttribute(pos,i).normalize();const y=d.y,az=Math.atan2(d.z,d.x);
  if(y>0)c.copy(hor).lerp(zen,Math.pow(Math.min(1,y*1.25),.6));else{/* the snow, with long blue shadow bands across it */const b=.5+.5*Math.sin(az*9+Math.sin(az*3)*2);c.copy(snw).lerp(shd,b*b*.55*Math.min(1,-y*4))}
  /* the tree line: frosted tops over darker trunks, uneven in height */
  const th=(.1+.07*Math.sin(az*17)+.05*Math.sin(az*41+1.3))*TH;if(y>-.02&&y<th){const k=Math.min(1,(y+.02)/th);t.copy(tree).lerp(frost,k*k);c.lerp(t,.85)}
  const s_=Math.max(0,d.dot(sd));t.copy(K.sun).multiplyScalar(Math.pow(s_,90)*14+Math.pow(s_,10)*.5);c.add(t);
  col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false,fog:false});es.add(new THREE.Mesh(g,mat));
 if(!pm)pm=new THREE.PMREMGenerator(R);if(envRT)envRT.dispose();envRT=pm.fromScene(es,0,.1,100);g.dispose();mat.dispose();return envRT.texture}
const CARU={v:new THREE.Vector4(0,0,0,0),c:new THREE.Vector4(.93,.95,.99,.5),gl:1};
function carMat(m,U){if(!m||!m.isMeshStandardMaterial||m.userData.snowCar)return;m.userData.snowCar={e:m.envMapIntensity,r:m.roughness,obc:m.onBeforeCompile,key:m.customProgramCacheKey};
 const gl=CARU.gl;m.envMapIntensity=(m.transparent?1.3:1.05)*(.6+.4*gl);if(m.roughness<.8)m.roughness=Math.max(.13,m.roughness*(1-.38*gl));
 const prev=m.onBeforeCompile,k0=m.customProgramCacheKey?m.customProgramCacheKey():'';
 m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);sh.uniforms.snCar={value:U};sh.uniforms.snCol={value:CARU.c};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vScW;varying vec3 vScL;').replace('#include <begin_vertex>','#include <begin_vertex>\nvScL=position;vScW=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vScW;varying vec3 vScL;uniform vec4 snCar;uniform vec4 snCol;float scK=0.;\n'+NOISE)
   .replace('#include <color_fragment>',`#include <color_fragment>
{float h=vScW.y-snCar.y;float n=svn(vScL*7.)*.6+svn(vScL*19.)*.4;float top=.2+.5*snCar.w;
 /* packed snow from the road up, a ragged edge, and a fine dusting of spray above it */
 scK=smoothstep(top+.12,top-.1,h+(n-.5)*.34)*step(.001,snCar.w);float dust=smoothstep(top+.55+snCol.w*.5,top,h)*smoothstep(.45,.8,svn(vScL*13.)*.65+svn(vScL*29.)*.35)*snCol.w*snCar.w;
 scK=clamp(scK*.92+dust,0.,1.);diffuseColor.rgb=mix(diffuseColor.rgb,snCol.rgb*(.86+.2*n),scK);}`)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.95,scK);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor*=1.-scK;')};
 m.customProgramCacheKey=()=>k0+'|snowCar';m.needsUpdate=true}
function carUndo(){const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars)return;for(const c of Rc.cars){if(!c.m||!c.m.g)continue;c.m.g.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){const u=m&&m.userData.snowCar;if(!u)continue;
   m.envMapIntensity=u.e;m.roughness=u.r;m.onBeforeCompile=u.obc;m.customProgramCacheKey=u.key;delete m.userData.snowCar;m.needsUpdate=true}})}}
/* a new race starts: the last race's cars get their own paint back first (their materials can be reused) */
const l0=P.launch;if(l0)P.launch=function(){try{carUndo()}catch(e){}return l0.apply(this,arguments)};
const r1=R.render.bind(R);
R.render=function(scene,cam){const u=scene&&scene.userData;if(u&&u.snowCar&&typeof RACE!=='undefined'&&RACE&&RACE.scene===scene&&on()&&!(window.PTO&&window.PTO.snowCar===false)){try{
   const K=u.carCfg||CAR.autumn;CARU.gl=K.gl;CARU.c.set(K.dirt[0],K.dirt[1],K.dirt[2],K.sp);
   if(u.snowCar===1&&scene.environment){scene.environment=snowEnv(scene,K);u.snowCar=2}
   /* every car on the stage, whatever the model (Hakan: "map this for every car too"): each has its own ground height and its own build-up */
   for(const me of RACE.cars){if(!me.m||!me.m.g)continue;const U=me._snU||(me._snU=new THREE.Vector4());
    if(me._snT!==scene||((P.frame+(me.gi|0)*7)%120)===0){if(me._snT!==scene)me._snD=0;me._snT=scene;me._snX=me.x;me._snZ=me.z;me.m.g.traverse(o=>{if(o.isMesh&&!o.userData.contact)for(const m of Array.isArray(o.material)?o.material:[o.material])carMat(m,U)})}
    /* the dirt climbs with the distance driven: under half at the start, full after about 500 m */
    const dd=Math.hypot(me.x-me._snX,me.z-me._snZ);if(dd<30)me._snD+=dd;me._snX=me.x;me._snZ=me.z;
    let gy=me.y;const w=me.m.wheels&&me.m.wheels[0];if(w&&w.s&&w.s.h!=null)gy=w.s.h;else if(RACE.T&&RACE.T.terr){const h=RACE.T.terr(me.x,me.z);if(h!=null&&isFinite(h))gy=h}
    U.set(me.x,gy,me.z,Math.min(1,.5+me._snD/900)*K.k)}}catch(e){u.snowCar=0;console.warn('snowCar',e)}}
  return r1.apply(this,arguments)};
function dress(sc,T){const d=T.d;if(!d||!d.cartoon||!d.cartoon.stage)return;if(CAR[d._key]){sc.userData.snowCar=1;sc.userData.carCfg=CAR[d._key]}if(d._key!=='autumn')return;const t0=performance.now();seed=977;let n=0;
 sc.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.material||Array.isArray(o.material))return;
  if(/^ct_/.test(o.name)){if(/ICE_SURFACE/.test(o.name))return;
   /* the ground texture is snow already: there the shader adds the grain, the drifts and the glints, and whitens what is left bare */
   snowMat(o.material,/SNOW_SWEDEN/.test(o.name)?{lo:-1.,hi:.1,amt:.9}:/^ct_c$/.test(o.name)?{lo:-.3,hi:.42,amt:.9}/* hoarfrost: the trees and everything else of the model are white almost all over, only the undersides keep their colour */:{lo:.12,hi:.5,amt:.92});n++}
  else if(o.userData.rallyProp){/* the props share one material with every other map: this stage gets its own copy */if(o.userData.ptProp==='snowpole')return;o.material=snowMat(o.material.clone(),{lo:.35,hi:.65,amt:.92});n++}});
 sc.userData.sunStar=1;sc.userData.snowCar=1;sc.userData.snowWhite=1;sc.traverse(o=>{if(o.isHemisphereLight)o.groundColor.lerp(new THREE.Color(0xeef3fb),.7)});const b=banks(sc,T);flakes(sc);/* a sunny morning: only a light drift of flakes in the air */const f=sc.userData.snow;if(f&&f.m&&f.m.material){f.m.material.size=.3;f.m.material.opacity=.7;f.m.geometry.setDrawRange(0,500)}if(sc.userData.snow2){sc.userData.snow2.m.material.opacity=.3;sc.userData.snow2.m.geometry.setDrawRange(0,300)}
 sc.userData.snowFx={mats:n,bankTris:b,ms:Math.round(performance.now()-t0)}}
/* after rallyprops.js has dressed the stage (it wraps buildWorld two ticks after load) */
setTimeout(()=>setTimeout(()=>setTimeout(()=>{const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);if(on())try{dress(sc,T)}catch(e){console.warn('snowfx',e)}return sc}},0),0),0);
})();
