/* ===== Poly GT: image-based lighting (Hakan, Nov 7: "better lighting on EVERYTHING, so it doesn't look like the same flat plastic") =====
   Every race scene gets an environment map made from its own sky: the hemisphere light's sky and ground colours, the fog/horizon colour and a
   bright patch where the sun is. PBR materials then pick up soft reflections and sky-coloured fill from above, so paint, chrome and glass read
   as paint, chrome and glass, and the shading follows the time of day and weather. Cars get the full reflection; the world gets a lighter
   touch (and the hemisphere light is eased down to match) so tracks don't wash out. */
(function lightfx(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const on=()=>!window.PTO||window.PTO.ibl!==false;
let pm=null,envRT=null;
function build(sc){
 let sun=null,hemi=null;sc.traverse(o=>{if(o.isDirectionalLight&&!sun)sun=o;if(o.isHemisphereLight&&!hemi)hemi=o});
 const lin=c=>c.clone();
 const sky=hemi?lin(hemi.color).multiplyScalar(Math.min(1.6,hemi.intensity)):new THREE.Color(.55,.65,.8);
 const gnd=hemi?lin(hemi.groundColor).multiplyScalar(Math.min(1.6,hemi.intensity)*.55):new THREE.Color(.18,.17,.15);
 let hor=sc.fog&&sc.fog.color?lin(sc.fog.color):(sc.background&&sc.background.isColor?lin(sc.background):sky.clone().lerp(new THREE.Color(1,1,1),.3));
 hor.lerp(sky,.35);
 const sunC=sun?lin(sun.color).multiplyScalar(Math.min(2.5,sun.intensity)*.6):new THREE.Color(1,1,1);
 const sd=sun?sun.position.clone().sub(sun.target?sun.target.position:new THREE.Vector3()).normalize():new THREE.Vector3(.3,.8,.4);
 /* the sky dome as vertex colours on a sphere (a plain MeshBasicMaterial, the same kind the showroom's reflections are made from) */
 const es=new THREE.Scene(),g=new THREE.SphereGeometry(10,64,32),pos=g.attributes.position,col=new Float32Array(pos.count*3),d=new THREE.Vector3(),c=new THREE.Color(),t=new THREE.Color();
 for(let i=0;i<pos.count;i++){d.fromBufferAttribute(pos,i).normalize();const y=d.y;
  if(y>0)c.copy(hor).lerp(sky,Math.pow(Math.min(1,y),.55));else c.copy(hor).lerp(gnd,Math.pow(Math.min(1,-y*3),.7));
  const s_=Math.max(0,d.dot(sd));t.copy(sunC).multiplyScalar(Math.pow(s_,48)*5+Math.pow(s_,6)*.35);c.add(t);
  if(y>.55)c.add(t.copy(sky).multiplyScalar(.25*Math.min(1,(y-.55)/.4)));
  col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false,fog:false}),m=new THREE.Mesh(g,mat);es.add(m);
 if(!pm){pm=new THREE.PMREMGenerator(R)}
 const rt=pm.fromScene(es,0,.1,100);g.dispose();mat.dispose();return rt}
/* materials: the world keeps most of its look (a little env fill), cars get the reflections */
const WORLD=.3,CAR=.6;
function tuneWorld(sc){sc.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const x of ms){if(!x||!x.isMeshStandardMaterial||x.userData.iblC)continue;if(x.userData.ibl==null){x.userData.ibl=1;x.envMapIntensity=WORLD;x.needsUpdate=true}
  /* Nov 10 (Hakan: "make the ground reflect less"): the ground, the road and the big model surfaces are matte: no sky sheen, no shine
     (PTO.matteGround===false: as before) */
  if(!x.userData.matte&&!(window.PTO&&window.PTO.matteGround===false)){const g=o.geometry;let big=/^ct_(GRASS|GRAVEL|ROADS|SNOW|TARMAC|DIRT|SAND|FINLAND_LAKE)/.test(o.name);if(!big&&g&&g.attributes&&g.attributes.position&&g.attributes.position.count>800){if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;big=b.max.x-b.min.x>250||b.max.z-b.min.z>250}
   if(big&&!o.isInstancedMesh){x.userData.matte=1;x.envMapIntensity=.05;x.roughness=1;x.metalness=0;x.needsUpdate=true}}}})}
function tuneCar(g){if(!g)return;g.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const x of ms){if(!x||!x.isMeshStandardMaterial||x.userData.iblC)continue;
 x.userData.iblC=1;x.userData.ibl=1;x.envMapIntensity=CAR;
 /* body paint and trim: a touch glossier so the sky runs along the panels; very rough parts (tyres, rubber) stay matte */
 if(x.roughness<.8)x.roughness=Math.max(.22,x.roughness*.85);x.needsUpdate=true}})}
function apply(sc){if(!sc||!on())return;try{
 if(envRT){envRT.dispose();envRT=null}envRT=build(sc);sc.environment=envRT.texture;
 sc.traverse(o=>{if(o.isHemisphereLight&&!o.userData.iblK){o.userData.iblK=1;o.intensity*=.8}});
 tuneWorld(sc)}catch(e){console.warn('lightfx',e)}}
P.iblApply=apply;
const s0=P.shadeSetup;P.shadeSetup=function(sc){const r=s0?s0.apply(this,arguments):undefined;apply(sc);return r};
/* cars arrive after the scene: tune them (and anything added later) once the grid exists, and again shortly after for late loads */
const tuneRace=()=>{const Rc=typeof RACE!=='undefined'?RACE:null;if(!Rc||!Rc.cars||!on())return;for(const c of Rc.cars)if(c.m)tuneCar(c.m.g);if(Rc.scene)tuneWorld(Rc.scene)};
const l0=P.launch;if(l0)P.launch=function(){const r=l0.apply(this,arguments);try{tuneRace();setTimeout(tuneRace,1500);setTimeout(tuneRace,5000)}catch(e){}return r};
/* time of day / weather changes rebuild the sky, so rebuild the reflections too */
const at=P.applyTod;if(at)P.applyTod=function(sc){const r=at.apply(this,arguments);if(sc&&sc.environment)apply(sc);return r};
})();
