/* ===== Poly GT layer: map clean-up (Nov 9 overhaul). Small fixes to the generated maps, applied once the world is built:
   - night street lights: the city road was a wet-look mirror (metalness .4, roughness .35), so each lamp made one hard white streak on it instead
     of a pool of light; the road is now a satin finish, so the light spreads. Lamp heads glow warm instead of a white ball ===== */
(function mapfix(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined')return;
function fix(sc,T){const d=T.d||{};
 sc.traverse(o=>{if(!o.isMesh||!o.material)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){
  if(m.isMeshStandardMaterial&&m.metalness>=.35&&m.roughness<=.4&&m.map&&!m.userData.mfx){m.userData.mfx=1;m.roughness=.68;m.metalness=.12;m.needsUpdate=true}}});
 const g=sc.userData.lamps;if(g)g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshBasicMaterial&&!o.material.userData.mfx){o.material.userData.mfx=1;o.material.color.set(0xffd9a0)}})}
P.mapFix=fix;
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{fix(sc,T)}catch(e){console.warn('mapfix',e)}return sc};
})();
