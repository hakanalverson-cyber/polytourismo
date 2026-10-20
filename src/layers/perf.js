/* ===== Poly Tourismo v9 layer: perf (performance options: presets, pixel density cap, FPS counter, HUD DOM caching) ===== */
(function v9perf(){
'use strict';
const P=window.PT8,cv=R.domElement,dpr=devicePixelRatio||1,O=()=>window.PTO||{};
const PRE={
 MINIMUM:{maxDensity:1,resolution:.75,shadows:true,shadowRate:4,shadowRes:512,effects:1},
 LOW:{maxDensity:1,resolution:.9,shadows:true,shadowRate:3,shadowRes:1024,effects:1},
 MEDIUM:{maxDensity:1.25,resolution:1,shadows:true,shadowRate:2,shadowRes:1024,effects:2},
 HIGH:{maxDensity:1.5,resolution:1,shadows:true,shadowRate:2,shadowRes:1536,effects:2},
 ULTRA:{maxDensity:2,resolution:1,shadows:true,shadowRate:1,shadowRes:2048,effects:2}};
let lastPP=O().perfPreset;P.dynRes=1;
/* called at the top of the options apply(): applies a chosen preset, or flips to CUSTOM when a value is edited by hand */
P.perfPre=()=>{const o=O(),pr=PRE[o.perfPreset];if(o.perfPreset!==lastPP){lastPP=o.perfPreset;if(pr)Object.assign(o,pr);return}
 if(pr){for(const k in pr)if(o[k]!==pr[k]){o.perfPreset=lastPP='CUSTOM';break}}};
P.PERF_PRESETS=PRE;
/* render size = screen pixels x min(device density, cap) x render scale */
const rs1=rs;
rs=()=>{rs1();if(document.body.classList.contains('studio')||(typeof PX!=='undefined'&&PX!==1))return;const o=O(),d2=Math.min(dpr,2),f=Math.min(dpr,o.maxDensity||1.5)/d2*(o.resolution||1)*((typeof scr!=='undefined'&&scr==='game')?P.dynRes:1);
 if(Math.abs(f-1)>.002){R.setSize(Math.max(2,Math.round(cv.width*f)),Math.max(2,Math.round(cv.height*f)),false);cv.style.imageRendering='auto'}else cv.style.imageRendering=''};
/* FPS counter */
let fe=null,n=0,t0=performance.now(),worst=0,lt=t0;
(function loop(now){requestAnimationFrame(loop);const d=now-lt;lt=now;n++;if(d>worst)worst=d;
 if(now-t0>=500){const fps=n*1000/(now-t0);if(O().showFps){if(!fe){fe=document.createElement('div');fe.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:99999;font:700 11px monospace;letter-spacing:.12em;color:#ffffff;background:#000a;padding:3px 8px;pointer-events:none';document.body.appendChild(fe)}
  fe.style.display='';fe.textContent=Math.round(fps)+' FPS  '+(1000/fps).toFixed(1)+' ms  (worst '+Math.round(worst)+' ms)  '+R.domElement.width+'x'+R.domElement.height}else if(fe)fe.style.display='none';
  n=0;t0=now;worst=0}})(performance.now());
/* HUD: don't rebuild identical markup every frame (forces layout) */
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,configurable:true,set(v){const c=this.classList;if(c&&(c.contains('h8mode')||c.contains('cond')||c.contains('h8fin'))){if(this._ih===v)return;this._ih=v}d.set.call(this,v)}})}

/* ---- spatial chunking: every instanced prop mesh (trees, rocks, buildings...) was drawn in full, twice (camera + shadow map), every frame
   because its single bounding sphere could not be culled. Split them into ~100 m cells so the frustum (and the shadow frustum) cull them. ---- */
const CELL=160;
function chunkScene(sc){const list=[];sc.traverse(o=>{if(o.isInstancedMesh&&!o.userData.noChunk&&o.count*((o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3)>5000)list.push(o)});
 const m=new THREE.Matrix4(),pv=new THREE.Vector3(),sv=new THREE.Vector3(),col=new THREE.Color(),zero=new THREE.Vector3();
 for(const o of list){const geo=o.geometry;if(!geo.boundingSphere)geo.computeBoundingSphere();const gc=geo.boundingSphere.center,gr=geo.boundingSphere.radius,cells=new Map(),ic=o.instanceColor?o.instanceColor.array:null;
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);const e=m.elements;if(e[0]===0&&e[5]===0&&e[10]===0)continue;/* hidden instance (cleared by the barn / fords) */
   const k=Math.floor(e[12]/CELL)+','+Math.floor(e[14]/CELL);let c=cells.get(k);if(!c){c={ids:[]};cells.set(k,c)}c.ids.push(i)}
  if(cells.size<2)continue;
  const par=o.parent;if(!par)continue;
  for(const c of cells.values()){const n=c.ids.length,im=new THREE.InstancedMesh(null,o.material,n);
   let cx=0,cy=0,cz=0;const ctr=[];
   c.ids.forEach((id,j)=>{o.getMatrixAt(id,m);im.setMatrixAt(j,m);if(ic){col.setRGB(ic[id*3],ic[id*3+1],ic[id*3+2]);im.setColorAt(j,col)}
    pv.copy(gc).applyMatrix4(m);const sx=Math.hypot(m.elements[0],m.elements[1],m.elements[2]),sy=Math.hypot(m.elements[4],m.elements[5],m.elements[6]),sz=Math.hypot(m.elements[8],m.elements[9],m.elements[10]);
    ctr.push([pv.x,pv.y,pv.z,gr*Math.max(sx,sy,sz)]);cx+=pv.x;cy+=pv.y;cz+=pv.z});
   cx/=n;cy/=n;cz/=n;let rad=0;for(const q of ctr)rad=Math.max(rad,Math.hypot(q[0]-cx,q[1]-cy,q[2]-cz)+q[3]);
   const g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const nme in geo.attributes)g.setAttribute(nme,geo.attributes[nme]);g.groups=geo.groups.slice();g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,cy,cz),rad);g.boundingBox=geo.boundingBox;
   im.geometry=g;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
   im.position.copy(o.position);im.quaternion.copy(o.quaternion);im.scale.copy(o.scale);im.castShadow=o.castShadow;im.receiveShadow=o.receiveShadow;im.renderOrder=o.renderOrder;im.name=o.name;im.userData=Object.assign({},o.userData);im.layers.mask=o.layers.mask;im.frustumCulled=true;if(o.material.fog!==false)im.userData.fogCull=1;par.add(im)}
  par.remove(o)}}

/* big static meshes (terrain, road ribbons) are single objects too: cut them into tiles so only the visible tiles are drawn, and only the few tiles
   inside the small shadow frustum are rendered into the shadow map */
function chunkBig(sc){const list=[];sc.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position&&!o.userData.noChunk&&o.material&&!Array.isArray(o.material)&&o.material.fog!==false&&!o.material.transparent&&!(o.geometry.groups&&o.geometry.groups.length>1)){const g=o.geometry,t=(g.index?g.index.count:g.attributes.position.count)/3;if(t>6000)list.push(o)}});
 for(const o of list){const g=o.geometry,pos=g.attributes.position,idx=g.index,nt=idx?idx.count/3:pos.count/3,names=Object.keys(g.attributes),tiles=new Map();
  o.updateMatrix();const e=o.matrix.elements,TL=220;
  for(let t=0;t<nt;t++){const a=idx?idx.getX(t*3):t*3,b=idx?idx.getX(t*3+1):t*3+1,c=idx?idx.getX(t*3+2):t*3+2;
   const x=(pos.getX(a)+pos.getX(b)+pos.getX(c))/3,z=(pos.getZ(a)+pos.getZ(b)+pos.getZ(c))/3,wx=e[0]*x+e[8]*z+e[12],wz=e[2]*x+e[10]*z+e[14],k=Math.floor(wx/TL)+','+Math.floor(wz/TL);
   let L=tiles.get(k);if(!L){L=[];tiles.set(k,L)}L.push(a,b,c)}
  if(tiles.size<2)continue;
  for(const L of tiles.values()){const map=new Map(),n0=[];for(const v of L)if(!map.has(v)){map.set(v,map.size);n0.push(v)}
   const ng=new THREE.BufferGeometry();
   for(const nm of names){const A=g.attributes[nm],sz=A.itemSize,arr=new A.array.constructor(n0.length*sz);for(let i=0;i<n0.length;i++)for(let j=0;j<sz;j++)arr[i*sz+j]=A.array[n0[i]*sz+j];ng.setAttribute(nm,new THREE.BufferAttribute(arr,sz,A.normalized))}
   const ia=new(n0.length>65535?Uint32Array:Uint16Array)(L.length);for(let i=0;i<L.length;i++)ia[i]=map.get(L[i]);ng.setIndex(new THREE.BufferAttribute(ia,1));ng.computeBoundingSphere();ng.computeBoundingBox();
   const m=new THREE.Mesh(ng,o.material);m.position.copy(o.position);m.quaternion.copy(o.quaternion);m.scale.copy(o.scale);m.castShadow=o.castShadow;m.receiveShadow=o.receiveShadow;m.renderOrder=o.renderOrder;m.name=o.name;m.userData=Object.assign({},o.userData);m.layers.mask=o.layers.mask;m.frustumCulled=true;m.userData.fogCull=1;sc.add(m)}
  sc.remove(o)}}
P.chunkBig=chunkBig;
P.chunkScene=chunkScene;
{const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{chunkBig(sc);chunkScene(sc)}catch(e){console.warn('chunk',e)}return sc}}

/* tiles / prop cells that lie wholly beyond the fog are pure fog colour: skip them (per camera) */
const _c=new THREE.Vector3(),_cp=new THREE.Vector3();
{const r0=R.render.bind(R),cache=new WeakMap();
 R.render=function(scene,cam){if(scene&&scene.isScene&&scene.fog&&cam&&cam.isCamera){let L=cache.get(scene);if(!L||L.n!==scene.children.length){L=[];scene.traverse(o=>{if(o.userData&&o.userData.fogCull&&o.geometry)L.push(o)});L.n=scene.children.length;cache.set(scene,L)}
   const far=scene.fog.far*1.03;cam.getWorldPosition(_cp);
   for(const o of L){const bs=o.geometry.boundingSphere;if(!bs)continue;_c.copy(bs.center);if(o.parent&&o.parent.matrixWorld)_c.applyMatrix4(o.matrixWorld);const sc_=Math.max(o.scale.x,o.scale.y,o.scale.z);o.visible=_c.distanceTo(_cp)-bs.radius*sc_<far}}
  return r0(scene,cam)}}

/* adaptive resolution: if the game can't hold ~55 fps the render size eases down (never below 62%) and creeps back up when there is headroom,
   so "max graphics" keeps full quality on machines that can take it and stays smooth on ones that can't. PTO.adaptRes=false turns it off. */
{let acc=0,frames=0,slow=0,t0=performance.now(),lastUp=0,lt2=t0;
 (function tick(now){requestAnimationFrame(tick);const d=now-lt2;lt2=now;if(d>0&&d<250){acc+=d;frames++;if(d>24)slow++}
  if(now-t0<1200)return;const ingame=typeof scr!=='undefined'&&scr==='game'&&typeof RACE!=='undefined'&&RACE&&RACE.state==='race'&&!document.hidden;
  const fps=frames*1000/Math.max(1,acc),bad=slow/Math.max(1,frames);acc=0;frames=0;slow=0;t0=now;
  if(!ingame||O().adaptRes===false||frames<0)return;
  let nd=P.dynRes;
  if(fps<50||bad>.25)nd=Math.max(.62,nd-(fps<38?.14:.07));
  else if(fps>58&&nd<1&&now-lastUp>5000){nd=Math.min(1,nd+.05);lastUp=now}
  if(Math.abs(nd-P.dynRes)>.01){P.dynRes=nd;rs()}})(performance.now())}
rs();
})();
