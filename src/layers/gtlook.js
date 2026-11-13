/* ===== Poly GT layer: gtlook (Nov 13, Hakan: "more realistic, less cartoony lighting, more Gran Turismo").
   On the imported circuits the picture was lit almost flat (a bright sky light from every side, a weak sun) and shown at full colour strength, so the
   grass glowed and nothing had a lit side and a shaded side. Here the sun does the work: a warm key light about twice as strong as the sky fill,
   a cool sky fill with a brown-green bounce from the ground, colours pulled back to roughly photographic strength with a slightly warm balance,
   and a pale haze toward the horizon. Applies to the race and to the drone preview (both go through P.applyTod). PTO.gtLook=false turns it off. ===== */
(function gtlook(){
'use strict';
const P=window.PT8,U=window.TODU;
const LOOK={
 day:{hemi:[0xb8cdf0,0x5c5a48,.5],sun:[0xfff0d8,1.7],sat:1,mul:[1,1,1],add:[0,0,0],fog:0xbfcbd8,exp:.97},
 dawn:{hemi:[0xb9bfe8,0x5a4c50,.6],sun:[0xffbe86,1.35],sat:1,mul:[1,1,1],add:[0,0,0],fog:null,exp:.96},
 sunset:{hemi:[0xe8b894,0x4c3a44,.58],sun:[0xff8a3e,1.45],sat:1,mul:[1,1,1],add:[0,0,0],fog:null,exp:.97},
 night:null};
const on=()=>!(window.PTO&&window.PTO.gtLook===false);
function apply(sc,T,key){const d=T&&T.d;if(!on()||!d||!d.cartoon||d.cartoon.stage)return;const L=LOOK[key||'day'];if(!L)return;
 for(const o of sc.children){
  if(o.isHemisphereLight){o.color.setHex(L.hemi[0]);o.groundColor.setHex(L.hemi[1]);o.userData.gt0=o.userData.gt0||o.intensity;o.intensity=L.hemi[2]}
  else if(o.isDirectionalLight&&!o.userData.gtKeep){o.color.setHex(L.sun[0]);o.intensity=L.sun[1]}
  else if(o.isAmbientLight){o.intensity*=.6}}
 /* surfaces, measured against Gran Turismo 4's own circuit pictures (Hakan's reference pack: average colour strength 0.13 to 0.33, grass a dark
    olive, asphalt a mid grey): the grass textures are a lime green no grade can turn olive, and the asphalt is near black */
 sc.traverse(o=>{if(!o.name||o.name.indexOf('ct_')!==0||!o.material||!o.material.color||o.material.userData.gt)return;const n=o.name,m=o.material;m.userData.gt=1;
  /* Nov 13 (Hakan: bring back the colour): the grass, trees and props keep their own colours; only the near-black asphalt is lifted a little */if(/road|tarmac|asphalt/i.test(n))m.color.setRGB(1.25,1.25,1.26)});
 if(L.fog&&sc.fog){sc.fog.color.setHex(L.fog);if(sc.userData.ptFog)sc.userData.ptFog.color.setHex(L.fog)}
 if(U){U.sat.value*=L.sat;U.mul.value.set(U.mul.value.x*L.mul[0],U.mul.value.y*L.mul[1],U.mul.value.z*L.mul[2]);U.add.value.set(U.add.value.x+L.add[0],U.add.value.y+L.add[1],U.add.value.z+L.add[2])}
 if(typeof R!=='undefined')R.toneMappingExposure*=L.exp;
 sc.userData.gtLook=key||'day'}
/* the PS3-era finish (Hakan's GT5 references: clean, neutral, silvery, deep contrast): no scanlines over the race, a firmer contrast curve */
{const st=document.createElement('style');st.textContent='body.gtl:after{background:none!important;box-shadow:inset 0 0 140px #0007!important}body.gtl #c{filter:saturate(1.05) contrast(1.1) brightness(1.02)!important;image-rendering:auto!important}';document.head.appendChild(st);
 setInterval(()=>{const R_=typeof RACE!=='undefined'?RACE:null,g=!!(on()&&R_&&R_.scene&&R_.scene.userData.gtLook&&typeof scr!=='undefined'&&scr==='game');if(document.body.classList.contains('gtl')!==g)document.body.classList.toggle('gtl',g)},400)}
setTimeout(()=>{const a0=P.applyTod;if(!a0)return;P.applyTod=function(sc,T,key){const r=a0.apply(this,arguments);try{apply(sc,T,key)}catch(e){console.warn('gtlook',e)}return r};
 P.gtLookDbg=sc=>sc.children.filter(o=>o.isLight).map(o=>o.type+' '+o.color.getHexString()+' '+o.intensity.toFixed(2))},160);
})();
