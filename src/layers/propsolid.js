/* ===== Poly GT layer: every prop is solid (Nov 9, Hakan: "some of the props don't have collisions").
   solid.js only knew props by name from the placement log (bales, barrels, boulders, poles...): trees, houses, signs, rocks from the scenery
   kits, farm buildings and the rest could be driven straight through. A short moment after a race scene first draws (after the late layers
   have added their props, before the static meshes are merged), every mesh and instance standing on the ground within 32 m of the road is
   measured and gets a collider:
   - tall and slim (trees, posts, signs): a round trunk-sized collider (14% of the width, 0.3 to 0.7 m), so you hit the trunk, not the leaves
   - low and round (rocks, stumps, bushes over 1 m): a circle at 45% of the width
   - big (houses, sheds, containers, walls, fences): the four sides of its footprint
   It runs on the third frame and again on the 24th (late props), before the static meshes are merged.
   Things over the road (gantries, arches, bridges), floating things (lamp heads, wires), flat things (under 0.9 m) and the cars are skipped. ===== */
(function propsolid(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const GBf=(T,x,z)=>window.GB?window.GB(T,x,z):(T.terr?T.terr(x,z):0);
const box=new THREE.Box3(),M=new THREE.Matrix4(),V=new THREE.Vector3(),C=[0,1,2,3].map(()=>new THREE.Vector3());
/* distance from (x,z) to the road edge (negative = on the road), using the track's spatial grid */
function roadGap(T,x,z){const CS=16,cx=Math.floor(x/CS),cz=Math.floor(z/CS);let best=1e9;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const l=T.grid&&T.grid.get((cx+a)*8192+cz+b);if(!l)continue;for(const i of l){const d=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(d<best)best=d}}return best}
function consider(T,geo,mw,out){if(!geo.boundingBox)geo.computeBoundingBox();const b=geo.boundingBox;if(!isFinite(b.min.x))return;
 box.copy(b).applyMatrix4(mw);const w=box.max.x-box.min.x,dd=box.max.z-box.min.z,h=box.max.y-box.min.y;if(h<.9||w>40||dd>40||w<.12||dd<.12)return;
 const cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2,g=roadGap(T,cx,cz);if(g>32||g<.3)return;
 const gy=GBf(T,cx,cz);if(!isFinite(gy)||box.min.y-gy>1.6||box.max.y<gy+.9)return;
 /* footprint in the object's own frame (so a rotated house gets a rotated box) */
 const sx=b.max.x-b.min.x,sz=b.max.z-b.min.z,ex=new THREE.Vector3().setFromMatrixColumn(mw,0).length(),ez=new THREE.Vector3().setFromMatrixColumn(mw,2).length(),fw=Math.min(sx*ex,sz*ez),fl=Math.max(sx*ex,sz*ez);
 if(fl<3.4){const r=h>1.4*fl?Math.max(.3,Math.min(.7,fl*.14)):fl*.45;if(r<.22)return;if(g<r+.4)return;out.pts.push([cx,cz,r]);return}
 /* big: the four bottom corners */
 const y0=b.min.y;C[0].set(b.min.x,y0,b.min.z);C[1].set(b.max.x,y0,b.min.z);C[2].set(b.max.x,y0,b.max.z);C[3].set(b.min.x,y0,b.max.z);
 const pts=C.map(c=>c.clone().applyMatrix4(mw));if(pts.some(p=>roadGap(T,p.x,p.z)<.3))return;
 for(let k=0;k<4;k++){const u=pts[k],v=pts[(k+1)%4];out.segs.push([u.x,u.z,v.x,v.z,.25])}}
function collect(sc,T){const out={pts:[],segs:[]},cars=new Set();(RACE.cars||[]).forEach(c=>{if(c.m&&c.m.g)c.m.g.traverse(o=>cars.add(o))});
 sc.updateMatrixWorld(true);
 sc.traverse(o=>{if(!o.isMesh||!o.visible||cars.has(o)||o.userData.noChunk||o.userData.tnHill||o.userData.skyx)return;if(o.parent&&o.parent.visible===false)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.transparent&&m.opacity<.95)return;
  const geo=o.geometry;if(!geo||!geo.attributes||!geo.attributes.position)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);M.premultiply(o.matrixWorld);consider(T,geo,M,out)}}
  else consider(T,geo,o.matrixWorld,out)});
 /* the same tree or rock drawn as several meshes (trunk + crown) would stack: keep one circle per spot */
 const seen=new Map();for(const p of out.pts){const k=Math.round(p[0]/1.2)+','+Math.round(p[1]/1.2),q=seen.get(k);if(q){q[2]=Math.min(q[2],p[2]);continue}seen.set(k,p)}
 /* run again later: take out what the last run added first */
 const X=T._bx||(T._bx={segs:[],pts:[]}),old=T._psAdd;if(old){X.pts=X.pts.filter(p=>!old.has(p));X.segs=X.segs.filter(s=>!old.has(s))}
 const add=new Set();for(const p of seen.values()){const q=[p[0],p[1],p[2]];X.pts.push(q);add.add(q)}for(const s of out.segs){X.segs.push(s);add.add(s)}
 T._psAdd=add;T._bg=null;T._propSolid=add.size;return add.size}
P.propSolid=collect;
const r0=R.render.bind(R);
R.render=function(scene,cam){try{if(scene&&scene.isScene&&typeof RACE!=='undefined'&&RACE&&RACE.scene===scene&&RACE.T&&!RACE.T.free&&!(RACE.T.d&&RACE.T.d.cartoon)){const u=scene.userData;u.psF=(u.psF||0)+1;if(u.psF===3||u.psF===24)collect(scene,RACE.T)}}catch(e){console.warn('propsolid',e)}return r0.apply(this,arguments)};
})();
