/* ===== Poly GT layer: hpack (open-source CC0 models: Kenney ships/vehicles via pmndrs market-assets, KayKit city + cargo bits) ===== */
(function hpack(){
'use strict';
const P=window.PT8;if(typeof HPACK_B64==='undefined'||!THREE.GLTFLoader)return;
const HP=P.HP={ready:false,defs:{},cache:{}};
/* the pack is one glb: every top-level node is a model, named like the source file */
HP.mats={};
function prep(g){const root=g.scene;root.updateMatrixWorld(true);
 root.children.forEach(node=>{const parts=[],inv=new THREE.Matrix4();node.updateMatrixWorld(true);inv.copy(node.matrixWorld).invert();
  node.traverse(o=>{if(!o.isMesh)return;const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),mat=o.material;
   if(mat.map){mat.map.magFilter=mat.map.minFilter=THREE.NearestFilter;mat.map.generateMipmaps=false;mat.map.needsUpdate=true}
   mat.roughness=.92;mat.metalness=0;mat.flatShading=false;mat.needsUpdate=true;
   const gm=o.geometry.clone();gm.applyMatrix4(m);parts.push({geo:gm,mat})});
  /* merge parts that share a material so every model costs one draw call per material */
  {const by=new Map();parts.forEach(q=>{const k=q.mat.uuid;if(!by.has(k))by.set(k,{mat:q.mat,list:[]});by.get(k).list.push(q.geo)});parts.length=0;
   by.forEach(({mat,list})=>{if(list.length===1){parts.push({geo:list[0],mat});return}
    const g=new THREE.BufferGeometry(),att=['position','normal','uv'].filter(a=>list.every(q=>q.attributes[a]));let tot=0,ti=0;list.forEach(q=>{tot+=q.attributes.position.count;ti+=q.index?q.index.count:q.attributes.position.count});
    att.forEach(a=>{const sz=list[0].attributes[a].itemSize,arr=new Float32Array(tot*sz);let o=0;list.forEach(q=>{const A=q.attributes[a];for(let i=0;i<A.count;i++){arr[o++]=A.getX(i);arr[o++]=A.getY(i);if(sz>2)arr[o++]=A.getZ(i)}});g.setAttribute(a,new THREE.BufferAttribute(arr,sz))});
    const idx=new Uint32Array(ti);let o=0,vo=0;list.forEach(q=>{const n=q.index?q.index.count:q.attributes.position.count;for(let i=0;i<n;i++)idx[o+i]=(q.index?q.index.getX(i):i)+vo;o+=n;vo+=q.attributes.position.count});g.setIndex(new THREE.BufferAttribute(idx,1));parts.push({geo:g,mat})})}
  const b=new THREE.Box3();parts.forEach(p=>{p.geo.computeBoundingBox();b.union(p.geo.boundingBox)});
  const s=b.getSize(new THREE.Vector3());HP.defs[node.name]={parts,w:s.x,h:s.y,d:s.z,min:b.min.clone(),max:b.max.clone()}})}
(async()=>{try{const raw=atob(HPACK_B64),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);
 const ab=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 new THREE.GLTFLoader().parse(ab,'',g=>{try{prep(g);HP.ready=true}catch(e){console.warn('hpack',e)}},e=>console.warn('hpack',e))}catch(e){console.warn('hpack',e)}})();
/* instanced placement: list rows are [x,y,z,yaw,scale,tintHex?]; sy optional non-uniform height factor in row[6] */
HP.add=(sc,name,list,o)=>{o=o||{};const d=HP.defs[name];if(!d||!list.length)return[];const out=[],dm=new THREE.Object3D(),col=new THREE.Color(),ptr=new THREE.Matrix4();
 for(const part of d.parts){const mat=o.matFix?o.matFix(part.mat):part.mat;const im=new THREE.InstancedMesh(part.geo,mat,list.length);
  list.forEach((q,i)=>{dm.position.set(q[0],q[1],q[2]);dm.rotation.set(0,q[3]||0,0);const s=q[4]||1,sy=q[6]||1;dm.scale.set(s,s*sy,s);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);if(q[5]!=null){col.setHex(q[5]);im.setColorAt(i,col)}});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.userData.ptProp='hp_'+name;sc.add(im);out.push(im)}
 return out};
/* one standalone clone (for a few hero pieces) */
HP.make=name=>{const d=HP.defs[name];if(!d)return null;const g=new THREE.Group();d.parts.forEach(p=>g.add(new THREE.Mesh(p.geo,p.mat)));return g};
})();
