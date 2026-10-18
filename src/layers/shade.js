/* ===== Poly Tourismo v9 layer: real sun shadows that follow each camera ===== */
(function v9shade(){
'use strict';
const P=window.PT8;P.realShadows=true;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.shadowMap.autoUpdate=true;
const on=()=>P.realShadows&&(!window.PTO||window.PTO.shadows!==false);
P.shadeSetup=sc=>{let sun=null,hemi=null;sc.traverse(o=>{if(o.isDirectionalLight&&!sun)sun=o;if(o.isHemisphereLight&&!hemi)hemi=o});if(!sun)return;
 sun.castShadow=true;const S=sun.shadow;S.mapSize.set(2048,2048);const c=S.camera;c.left=-72;c.right=72;c.top=72;c.bottom=-72;c.near=1;c.far=620;S.bias=-.0006;S.normalBias=.5;S.radius=2.2;c.updateProjectionMatrix();
 sun.userData.d0=sun.position.clone().normalize();sun.userData.k=1;if(!sun.target.parent)sc.add(sun.target);
 sun.intensity*=1.28;if(hemi)hemi.intensity*=.86;sc.userData.sun=sun;sc.userData.flagT=0};
function flag(sc){sc.traverse(o=>{if(o.userData.shd)return;if(!(o.isMesh||o.isInstancedMesh)){return}
 const m=Array.isArray(o.material)?o.material[0]:o.material;o.userData.shd=1;if(!m)return;
 if(m.transparent||m.isMeshBasicMaterial||m.depthWrite===false||o.isSkinnedMesh===undefined&&m.blending===THREE.AdditiveBlending){o.castShadow=false;o.receiveShadow=false;return}
 o.castShadow=true;o.receiveShadow=true})}
const _d=new THREE.Vector3(),_f=new THREE.Vector3(),r0=R.render.bind(R);
R.render=function(scene,cam){const sun=scene&&scene.userData&&scene.userData.sun;
 if(sun){if(!on()){sun.castShadow=false}else{sun.castShadow=true;
  if((scene.userData.flagT-=1)<=0){scene.userData.flagT=45;flag(scene)}
  cam.getWorldDirection(_d);_d.y=0;_d.normalize();_f.copy(cam.position).addScaledVector(_d,34);
  const q=2.5;_f.x=Math.round(_f.x/q)*q;_f.z=Math.round(_f.z/q)*q;_f.y=Math.round(_f.y/q)*q;
  sun.target.position.copy(_f);sun.target.updateMatrixWorld();sun.position.copy(_f).addScaledVector(sun.userData.d0,260)}}
 return r0(scene,cam)};
})();
