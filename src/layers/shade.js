/* ===== Poly Tourismo v9 layer: real sun shadows that follow each camera ===== */
(function v9shade(){
'use strict';
const P=window.PT8;P.realShadows=true;
/* PCF with a radius instead of PCF-soft: about half the shadow-map reads per pixel for nearly the same soft edge */
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;R.shadowMap.autoUpdate=true;
const on=()=>P.realShadows&&(!window.PTO||window.PTO.shadows!==false);
P.shadeSetup=sc=>{let sun=null,hemi=null;sc.traverse(o=>{if(o.isDirectionalLight&&!sun)sun=o;if(o.isHemisphereLight&&!hemi)hemi=o});if(!sun)return;
 sun.castShadow=true;const S=sun.shadow;S.mapSize.set(2048,2048);const c=S.camera;c.left=-72;c.right=72;c.top=72;c.bottom=-72;c.near=1;c.far=620;S.bias=-.0006;S.normalBias=.5;S.radius=2.2;c.updateProjectionMatrix();
 sun.userData.d0=sun.position.clone().normalize();sun.userData.k=1;if(!sun.target.parent)sc.add(sun.target);
 sun.intensity*=1.28;if(hemi)hemi.intensity*=.86;sc.userData.sun=sun;sc.userData.flagT=0};
function flag(sc){sc.traverse(o=>{if(o.userData.shd)return;if(!(o.isMesh||o.isInstancedMesh)){return}
 const m=Array.isArray(o.material)?o.material[0]:o.material;o.userData.shd=1;if(!m)return;
 if(m.transparent||m.isMeshBasicMaterial||m.depthWrite===false||o.isSkinnedMesh===undefined&&m.blending===THREE.AdditiveBlending){o.castShadow=false;o.receiveShadow=false;return}
 o.castShadow=!ground(o);o.receiveShadow=true})}
/* ground-like meshes (terrain, road and kerb ribbons: big, and mostly facing up) are re-drawn into the shadow map every update but never throw
   a shadow anyone can see. They still receive shadows; they just no longer cast them */
function ground(o){if(o.isInstancedMesh||o.isSkinnedMesh)return false;const g=o.geometry,n=g&&g.attributes&&g.attributes.normal;if(!n||n.count<200)return false;
 if(g.userData.ground==null){let s=0;const a=n.array,st=Math.max(1,Math.floor(n.count/4000));let k=0;for(let i=0;i<n.count;i+=st){s+=Math.abs(a[i*3+1]);k++}g.userData.ground=s/k>.8}
 return g.userData.ground}
const _d=new THREE.Vector3(),_f=new THREE.Vector3(),r0=R.render.bind(R);
P.frame=0;(function tk(){P.frame++;requestAnimationFrame(tk)})();
R.render=function(scene,cam){const sun=scene&&scene.userData&&scene.userData.sun;let upd=true;
 if(sun){if(!on()){sun.castShadow=false}else{sun.castShadow=true;
  const O=window.PTO||{},res=O.shadowRes||2048,rate=Math.max(1,O.shadowRate|0||1);
  if(sun.shadow.mapSize.x!==res){sun.shadow.mapSize.set(res,res);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  /* update the shadow map every N frames (single viewport only); the sun is frozen between updates so shadows never swim */
  const single=typeof scr!=='undefined'&&scr==='game'&&RACE&&RACE.cars.filter(c=>c.human).length<=1;
  upd=!(rate>1&&single)||P.frame%rate===0;R.shadowMap.autoUpdate=false;R.shadowMap.needsUpdate=upd;
  if(upd){
  if((scene.userData.flagT-=1)<=0){scene.userData.flagT=45;flag(scene)}
  cam.getWorldDirection(_d);_d.y=0;_d.normalize();_f.copy(cam.position).addScaledVector(_d,34);
  const q=2.5;_f.x=Math.round(_f.x/q)*q;_f.z=Math.round(_f.z/q)*q;_f.y=Math.round(_f.y/q)*q;
  sun.target.position.copy(_f);sun.target.updateMatrixWorld();sun.position.copy(_f).addScaledVector(sun.userData.d0,260)}}}
 else if(!P.menuShadowHold)R.shadowMap.autoUpdate=true; /* (the menu stills hold theirs between shots: cinema.js) studio / menus: always refresh shadows (stale race shadow maps smeared over the showroom cars) */
 return r0(scene,cam)};
})();
