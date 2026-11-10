/* ===== Poly GT layer: mood lighting for the race maps. Nov 8, Hakan: "the garage is the only set in the entire map that has interesting
   lighting (only good looking lighting)". What the garage does that the maps did not: one strong, warm key light against a dim, cooler fill,
   so things have a lit side and a shadow side and throw real shadows; the maps had a bright sky fill nearly as strong as the sun and a sun
   high overhead, which flattens everything to the same pastel. So for every race scene:
   - the sky fill (hemisphere light) drops and cools, the ground bounce darkens: shadow sides read as shadow
   - the sun gets stronger and a touch warmer, and is brought down to a late-afternoon height so shadows are long and shapes get modelled
   - fog starts further out so near things keep their contrast (the distance still hazes)
   - a colour grade: an S-curve for contrast (blacks and whites never clip, so snow keeps its detail), cool shadows, warm highlights (per time of day)
   - a soft vignette over the race view
   Dawn, sunset and night keep their own sun position; night only gets the grade and a darker fill. ===== */
(function mood(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const on=()=>!window.PTO||window.PTO.mood!==false;
const C=(h)=>new THREE.Color(h);
/* per time of day: fill (hemisphere) factor and tint, sun factor and warm tint, max sun height (deg), fog start factor, grade */
/* Nov 10 (round 13, Hakan: the Quick Play maps look dark and grey): the shadow side was dropped so far that cars and buildings went navy; the sky fill and the ground bounce come back up
   about a third (PTO.moodLift===false: as before) */
const LIFT=!(window.PTO&&window.PTO.moodLift===false);
const M={
 day:{hemi:LIFT?.68:.5,hemiT:[0x9fb6dc,.28],gnd:LIFT?.72:.55,sun:1.4,sunT:[0xffd6a0,.38],el:30,fog:1.5,gr:{c:1.22,sat:1.14,s:[-.016,-.004,.026],h:[1.05,1.0,.93]}},
 dawn:{hemi:.72,hemiT:[0x8a9be0,.18],gnd:.7,sun:1.22,sunT:[0xffb27a,.1],el:0,fog:1.2,gr:{c:1.2,sat:1.06,s:[-.008,-.005,.028],h:[1.06,.99,.93]}},
 sunset:{hemi:.7,hemiT:[0x8c84c8,.2],gnd:.68,sun:1.25,sunT:[0xff8a40,.08],el:0,fog:1.2,gr:{c:1.22,sat:1.06,s:[-.01,-.007,.03],h:[1.07,.98,.91]}},
 night:{hemi:.85,hemiT:[0x34447e,.15],gnd:.8,sun:1.05,sunT:null,el:0,fog:1,gr:{c:1.16,sat:1,s:[-.004,0,.022],h:[1.0,1.0,1.03]}}};
const NEUTRAL={c:1,sat:1,s:[0,0,0],h:[1,1,1]};
function moodOf(sc){const k=sc.userData.tod||P.curTod||'day';return M[k]||M.day}
function apply(sc){if(!sc||sc.userData.mood||!on())return;let sun=null,hemi=null;sc.traverse(o=>{if(o.isDirectionalLight&&!sun)sun=o;if(o.isHemisphereLight&&!hemi)hemi=o});if(!sun)return;
 const m=moodOf(sc);sc.userData.mood=1;
 if(hemi){hemi.intensity*=m.hemi;hemi.color.lerp(C(m.hemiT[0]),m.hemiT[1]);hemi.groundColor.multiplyScalar(m.gnd)}
 sun.intensity*=m.sun;if(m.sunT)sun.color.lerp(C(m.sunT[0]),m.sunT[1]);
 /* lower a high sun to late-afternoon height, keeping where it is around the compass */
 if(m.el){const t=sun.target?sun.target.position:new THREE.Vector3(),d=sun.position.clone().sub(t),L=d.length()||1;d.normalize();const el=Math.asin(Math.max(-1,Math.min(1,d.y))),mx=m.el*Math.PI/180;
  if(el>mx){let h=Math.hypot(d.x,d.z);if(h<1e-3){d.x=.6;d.z=.8;h=1}d.x*=Math.cos(mx)/h;d.z*=Math.cos(mx)/h;d.y=Math.sin(mx);sun.position.copy(t).addScaledVector(d,L);
   /* the sun disc in the sky follows */
   for(const o of sc.children)if(o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===40)o.position.copy(d).multiplyScalar(1350)}}
 if(sc.fog&&sc.fog.isFog){sc.fog.near=Math.min(sc.fog.far*.6,sc.fog.near*m.fog);const f2=sc.userData.ptFog;if(f2)f2.near=sc.fog.near}
 sc.userData.grade=m.gr}
/* before the shadows and the sky reflections are set up, so both use the new sun */
const s0=P.shadeSetup;P.shadeSetup=function(sc){try{apply(sc)}catch(e){console.warn('mood',e)}return s0?s0.apply(this,arguments):undefined};
/* the grade is set per drawn scene: race scenes carry theirs, everything else (menus, showroom, garage) draws neutral */
const U=window.TODU,r0=R.render.bind(R);let cur=null;
const setG=g=>{if(!U||!U.grC||g===cur)return;cur=g;U.grC.value=g.c;U.grS.value.set(g.s[0],g.s[1],g.s[2]);U.grH.value.set(g.h[0],g.h[1],g.h[2]);if(U.grSat)U.grSat.value=g.sat||1};
/* the pale maps: bluer sky, a fog that matches it, and a stronger grade (deeper greens and earth instead of washed-out mint and grey) */
const PAL={'Quarry Circuit':{c:1.3,sat:1.28,sky:0xb0ccff,fog:[0xc8daf0,.4]},'Canyon Viaduct':{c:1.26,sat:1.22,sky:0xb4ccf6,fog:[0xcfdcef,.45]},'Pinewood Stage':{c:1.3,sat:1.3,ground:[.24,.34,.15,.62],sky:0xaac8f6,fog:[0xc6d8ea,.45]},
 'Finland':{c:1.26,sat:1.22},'France':{c:1.24,sat:1.16},'Portugal':{c:1.26,sat:1.24,h:[1.07,.99,.9]},'Sweden':{c:1.22,sat:1.1,s:[-.012,-.004,.03]},
 'Alpine Pass':{c:1.26,sat:1.12,snow:1,sky:0xb8d0f8,fog:[0xd4e0f0,.35]},'Frostline Stage':{c:1.26,sat:1.1,always:1,h:[1.0,1,1],s:[0,0,.008],sky:0xc4d6f4,fog:[0xdce6f4,.7]},'Grand Valley':{c:1.24,sat:1.18,lift:1.7},
 'Highmoor Stage':{c:1.2,sat:1.12,always:1,lift:1.7,h:[1.06,.99,.93],s:[-.008,-.005,.028]},'Redrock Stage':{c:1.14,sat:1.04,always:1,lift:1.4,h:[1.05,.99,.94],s:[-.01,-.007,.03]}};
function pal(sc){sc.userData.pal=1;const Rc=typeof RACE!=='undefined'?RACE:null,n=Rc&&Rc.T&&Rc.T.d&&Rc.T.d.name,p=PAL[n];if(!p||(!p.always&&sc.userData.tod&&sc.userData.tod!=='day')||!sc.userData.grade)return;
 sc.userData.grade=Object.assign({},sc.userData.grade,{c:p.c,sat:p.sat},p.h?{h:p.h}:{},p.s?{s:p.s}:{});
 if(p.sky)for(const o of sc.children)if(o.geometry&&o.geometry.type==='SphereGeometry'&&o.geometry.parameters.radius===1500&&o.material&&o.material.color)o.material.color.multiply(C(p.sky).lerp(C(0xffffff),.35));
 /* dark materials (the town's slate walls) come up so the buildings have a colour and not just a silhouette (PTO.moodLift===false: off) */
 if(p.lift&&LIFT)sc.traverse(o=>{if(!o.isMesh||!o.material||o.userData.ptProp)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(!m||!m.color||m.userData._lift)continue;m.userData._lift=1;const c=m.color,l=.2126*c.r+.7152*c.g+.0722*c.b;if(l<.3&&!m.isMeshBasicMaterial){const k=1+(p.lift-1)*(1-l/.3);c.multiplyScalar(k)}}});
 /* the snow was drawn pure white and clipped to a flat sheet under the sun; it comes down to a cool pale blue-white so the slopes keep their shape (PTO.moodLift===false: off) */
 if(p.snow&&LIFT)sc.traverse(o=>{if(!o.isMesh||!o.material||o.userData.ptProp)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){if(!m||!m.color||m.userData._snw||m.isMeshBasicMaterial)continue;m.userData._snw=1;const c=m.color,l=.2126*c.r+.7152*c.g+.0722*c.b;if(l>.62)c.multiply(new THREE.Color(.8,.86,.96))}});
 /* the hills of a pine forest were bare sand-coloured; the sandy parts of the terrain's vertex colours go to a mossy forest floor (PTO.moodLift===false: off) */
 if(p.ground&&LIFT)sc.traverse(o=>{if(!o.isMesh||!o.geometry||o.userData._gr)return;const g=o.geometry,a=g.attributes.color,P_=g.attributes.position;if(!a||P_.count<5000)return;g.computeBoundingBox();if(g.boundingBox.max.x-g.boundingBox.min.x<400)return;o.userData._gr=1;const q=p.ground,n=a.itemSize;for(let i=0;i<a.count;i++){const r=a.getX(i),gg=a.getY(i),b=a.getZ(i);if(r>b*1.25&&r>=gg*.98){const t=q[3]*Math.min(1,(r-b*1.25)*4+.3);a.setXYZ(i,r+(q[0]-r)*t,gg+(q[1]-gg)*t,b+(q[2]-b)*t)}}a.needsUpdate=true});
 if(p.fog&&sc.fog){sc.fog.color.lerp(C(p.fog[0]),p.fog[1]);if(sc.userData.ptFog)sc.userData.ptFog.color.copy(sc.fog.color);if(sc.background&&sc.background.isColor)sc.background.copy(sc.fog.color)}}
R.render=function(scene){if(scene&&scene.userData&&scene.userData.grade&&!scene.userData.pal&&typeof RACE!=='undefined'&&RACE&&RACE.scene===scene)try{pal(scene)}catch(e){};setG(scene&&scene.userData&&scene.userData.grade&&on()?scene.userData.grade:NEUTRAL);return r0.apply(this,arguments)};
/* vignette over the race view (under the HUD) */
const st=document.createElement('style');st.textContent=`#ptMoodV{position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(ellipse 75% 70% at 50% 52%,transparent 55%,#05070c55 100%)}
body.ptMood #ptMoodV{opacity:1}`;document.head.appendChild(st);
const v=document.createElement('div');v.id='ptMoodV';const cv=R.domElement;if(cv.parentNode)cv.parentNode.insertBefore(v,cv.nextSibling);else document.body.appendChild(v);
(function tk(){requestAnimationFrame(tk);const g=typeof scr!=='undefined'&&(scr==='game'||scr==='pause')&&on();if(g!==document.body.classList.contains('ptMood'))document.body.classList.toggle('ptMood',g)})();
})();
