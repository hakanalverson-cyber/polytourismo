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
function dress(sc,T){const d=T.d;if(!d||!d.cartoon||!d.cartoon.stage||d._key!=='autumn')return;const t0=performance.now();seed=977;let n=0;
 sc.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.material||Array.isArray(o.material))return;
  if(/^ct_/.test(o.name)){if(/ICE_SURFACE/.test(o.name))return;
   /* the ground texture is snow already: there the shader adds the grain, the drifts and the glints, and whitens what is left bare */
   snowMat(o.material,/SNOW_SWEDEN/.test(o.name)?{lo:-1.,hi:.1,amt:.9}:/^ct_c$/.test(o.name)?{lo:-.3,hi:.42,amt:.9}/* hoarfrost: the trees and everything else of the model are white almost all over, only the undersides keep their colour */:{lo:.12,hi:.5,amt:.92});n++}
  else if(o.userData.rallyProp){/* the props share one material with every other map: this stage gets its own copy */if(o.userData.ptProp==='snowpole')return;o.material=snowMat(o.material.clone(),{lo:.35,hi:.65,amt:.92});n++}});
 sc.userData.sunStar=1;sc.userData.snowWhite=1;sc.traverse(o=>{if(o.isHemisphereLight)o.groundColor.lerp(new THREE.Color(0xeef3fb),.7)});const b=banks(sc,T);flakes(sc);/* a sunny morning: only a light drift of flakes in the air */const f=sc.userData.snow;if(f&&f.m&&f.m.material){f.m.material.size=.3;f.m.material.opacity=.7;f.m.geometry.setDrawRange(0,500)}if(sc.userData.snow2){sc.userData.snow2.m.material.opacity=.3;sc.userData.snow2.m.geometry.setDrawRange(0,300)}
 sc.userData.snowFx={mats:n,bankTris:b,ms:Math.round(performance.now()-t0)}}
/* after rallyprops.js has dressed the stage (it wraps buildWorld two ticks after load) */
setTimeout(()=>setTimeout(()=>setTimeout(()=>{const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);if(on())try{dress(sc,T)}catch(e){console.warn('snowfx',e)}return sc}},0),0),0);
})();
