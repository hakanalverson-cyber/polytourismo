/* ===== Poly GT layer: imola_cartoon (Imola drawn with the "Cartoon Race Track Imola" model Hakan bought; generated data in window.PT8_IMC by tools/imola_cartoon) ===== */
(function v9imc(){
'use strict';
const P=window.PT8,C=window.PT8_IMC;
if(!C||!P)return;
const dec=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
/* ground height (2 cm steps) and surface class (0 grass, 1 asphalt, 2 paved run-off, 3 gravel) on the model's own 2 m grid */
const G=C.grid,HG=new Int16Array(dec(G.h).buffer),KG=new Uint8Array(G.nx*G.nz);
{const r=dec(G.k);let o=0;for(let i=0;i<r.length;i+=2){KG.fill(r[i],o,o+r[i+1]);o+=r[i+1]}}
const hAt=(x,z)=>{const fx=(x-G.x0)/G.cell,fz=(z-G.z0)/G.cell;if(!(fx>=0&&fz>=0&&fx<G.nx-1&&fz<G.nz-1))return null;
 const ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,i=iz*G.nx+ix;return((HG[i]*(1-tx)+HG[i+1]*tx)*(1-tz)+(HG[i+G.nx]*(1-tx)+HG[i+G.nx+1]*tx)*tz)*.02};
const kAt=(x,z)=>{const ix=Math.round((x-G.x0)/G.cell),iz=Math.round((z-G.z0)/G.cell);return ix<0||iz<0||ix>=G.nx||iz>=G.nz?0:KG[iz*G.nx+ix]};
P.imcH=hAt;P.imcK=kAt;
/* physics: road and ground heights come from the model's surfaces, so the car sits exactly on what is drawn */
const ss=sampleTrack;sampleTrack=d=>{const T=ss(d);if(!d.imola)return T;
 for(let i=0;i<T.N;i++){T.bank[i]=0;const h=hAt(T.x[i],T.z[i]);if(h!=null)T.y[i]=h}
 for(const c of T.cpts||[]){const h=hAt(c[0],c[1]);if(h!=null)c[2]=h}
 const t0=T.terr;T.terr=(x,z)=>{const h=hAt(x,z);return h==null?t0(x,z):h};
 const s0=T.surf;T.surf=(x,z,y)=>{const r=s0(x,z,y),h=hAt(x,z);if(h==null)return r;r.h=h;
  if(!r.road){const k=kAt(x,z);if(k===1||k===2)r.near=1;else if(k===3)r.trap=1}return r};
 return T};
/* scenery: hide the generated track and dress the world with the model, tiled so off-screen pieces are culled */
let TEX=null;
function textures(){if(TEX)return TEX;TEX={};for(const k in C.tex){const im=new Image(),t=new THREE.Texture(im);im.onload=()=>{t.needsUpdate=true};im.src=C.tex[k];
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;TEX[k]=t}return TEX}
let MESH=null;
function meshes(){if(MESH)return MESH;const tx=textures(),mats={},lut=new Float32Array(256);for(let i=0;i<256;i++){const c=i/255;lut[i]=c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
 const mat=k=>mats[k]||(mats[k]=k==='c'?new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}):k[0]==='#'?new THREE.MeshLambertMaterial({color:new THREE.Color(k).convertSRGBToLinear(),side:THREE.DoubleSide}):
  new THREE.MeshLambertMaterial({map:tx[k==='road_s'?'road':k],side:THREE.DoubleSide,alphaTest:k==='fence'?.5:0,transparent:false}));
 const out=[];
 for(const m of C.meshes){const q=m.q,o=m.o,p16=new Int16Array(dec(m.p).buffer),u8=dec(m.i),idx=m.i32?new Uint32Array(u8.buffer):new Uint16Array(u8.buffer),g=new THREE.BufferGeometry();
  const pos=new Float32Array(p16.length);for(let i=0;i<p16.length;i++)pos[i]=p16[i]*q+o[i%3];
  if(m.c){/* one colour per face: unshare the corners */const fc=dec(m.c),n=idx.length,P2=new Float32Array(n*3),C2=new Float32Array(n*3);
   for(let i=0;i<n;i++){const v=idx[i]*3,f=(i/3|0)*3;P2[i*3]=pos[v];P2[i*3+1]=pos[v+1];P2[i*3+2]=pos[v+2];C2[i*3]=lut[fc[f]];C2[i*3+1]=lut[fc[f+1]];C2[i*3+2]=lut[fc[f+2]]}
   g.setAttribute('position',new THREE.BufferAttribute(P2,3));g.setAttribute('color',new THREE.BufferAttribute(C2,3))}
  else{g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(new THREE.BufferAttribute(idx,1));
   if(m.u){const u16=new Int16Array(dec(m.u).buffer),uv=new Float32Array(u16.length);for(let i=0;i<u16.length;i++)uv[i]=u16[i]/256;g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}}
  g.computeVertexNormals();g.computeBoundingSphere();const me=new THREE.Mesh(g,mat(m.m));me.matrixAutoUpdate=false;me.updateMatrix();me.name='imc_'+m.m;me.userData.noMerge=1;/* the static-mesh merger drops polygon offsets and per-face colours */out.push(me)}
 return MESH=out}
/* wrap buildWorld last (after every other layer has loaded) so whatever they add to the world is hidden too */
setTimeout(()=>{const bw=buildWorld;buildWorld=T=>{const sc=bw(T);if(!(T.d&&T.d.imola))return sc;
 try{const hide=[];sc.traverse(o=>{if(o===sc||!(o.isMesh||o.isInstancedMesh||o.isPoints||o.isLine||o.isSprite))return;const g=o.geometry;if(g&&!g.boundingSphere)g.computeBoundingSphere&&g.computeBoundingSphere();
   if(g&&g.boundingSphere&&g.boundingSphere.radius>1000&&o.material&&o.material.type==='MeshBasicMaterial')return;/* sky dome / horizon backdrop */hide.push(o)});
  hide.forEach(o=>{o.visible=false;if(o.parent)o.parent.remove(o)});/* removed, not just hidden: distance culling turns visibility back on */
  const grp=new THREE.Group();grp.name='imolaCartoon';for(const m of meshes())grp.add(m);sc.add(grp);
  T._bx={segs:[],pts:[]};T._bg=null;/* the hidden stock props must not collide */
  if(P.addSeg){const s=new Float32Array(dec(C.segs).buffer);for(let i=0;i<s.length;i+=4)P.addSeg(T,s[i],s[i+1],s[i+2],s[i+3],.35)}
 }catch(e){console.error('imola cartoon',e)}
 return sc}},0);
})();
