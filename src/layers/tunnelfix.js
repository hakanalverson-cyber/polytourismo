/* ===== Poly GT layer: tunnel hills (Nov 9, Hakan: "PLEASE clean up the props around your generated maps. The tunnels keep floating").
   The stock tunnel was a separate dark slab laid over the road: it stopped 70 cm under the road level, so wherever the land beside the road
   dips (embankments, valleys) its edge hung in the air with a dark band under it, and the land poked through it in jagged strips.
   Here the stock slab and its end caps are taken out and each tunnel gets a hill that grows out of the land:
   - across the road it is the tunnel roof; to the sides it falls away on a smooth S-curve to the ground about 24 m out, and its outer edge
     ends 60 cm under the ground, so there is never a gap
   - past each portal it runs on for a few metres as low wing banks beside the road, so the portal sits in a cutting
   - where the land is already higher than the hill, the land shows (a tunnel through a real hillside)
   - same material and per-vertex colours as the land around it (sampled from the terrain mesh), so it reads as one surface ===== */
(function tunnelfix(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined'||typeof R==='undefined')return;
const GBf=(T,x,z)=>window.GB?window.GB(T,x,z):T.terr(x,z);
/* the land is drawn as tiles (vertex-coloured, indexed): a 4 m hash of their vertices gives the colour at any spot */
function terrainMesh(sc,T){const tiles=[];for(const o of sc.children){if(!o.isMesh||!o.geometry||!o.geometry.attributes.color||!o.material||!o.material.vertexColors||!o.geometry.index||o.userData.tnHill)continue;if(o.geometry.attributes.position.count>1000){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;if(b.max.x-b.min.x>120&&b.max.z-b.min.z>120)tiles.push(o)}}
 if(!tiles.length)return null;const H=new Map();for(const o of tiles){o.updateMatrixWorld();const p=o.geometry.attributes.position,c=o.geometry.attributes.color,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);H.set(Math.floor(v.x/4)*65536+Math.floor(v.z/4),[c.getX(i),c.getY(i),c.getZ(i)])}}
 return{material:tiles[0].material,H}}
function colourAt(tm,T,x,z){if(!tm)return null;const i=Math.floor(x/4),j=Math.floor(z/4);for(let r=0;r<3;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const c=tm.H.get((i+a)*65536+j+b);if(c)return c}return null}
const ss=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function fix(sc,T){if(sc.userData.tnFix)return;sc.userData.tnFix=1;const d=T.d;if(!T.tunnels||!T.tunnels.length||d.city||d.cartoon)return;const N=T.N,tm=terrainMesh(sc,T);
 for(const[a,b]of T.tunnels){
  /* the stock mound (a ribbon of 11 vertices per sample) and its four end caps (14 vertices) */
  const n=b-a+1,ends=[a,b].map(k=>new THREE.Vector3(T.x[k%N],T.y[k%N],T.z[k%N]));
  for(const o of sc.children.slice()){if(!o.isMesh||o.userData.tnHill||!o.geometry||!o.geometry.attributes.position)continue;const c=o.geometry.attributes.position.count;
   if(c===n*11&&o.material&&o.material.side===THREE.DoubleSide){sc.remove(o);continue}
   if(c===14&&o.geometry.index&&o.geometry.index.count===36){o.geometry.computeBoundingSphere();const p=o.geometry.boundingSphere.center;if(ends.some(e=>e.distanceTo(p)<40))sc.remove(o)}}
  /* the hill */
  const E=7,LS=30,pos=[],col=[],idx=[],band=[],ins=[];let rows=0;
  for(let kk=a-E;kk<=b+E;kk++){const k=((kk%N)+N)%N,hw=T.hw[k],W=hw+19,c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]),inside=kk>=a&&kk<=b,tap=inside?1:ss(1-(kk<a?a-kk:kk-b)/E);
   for(let j=0;j<=LS;j++){const u=j/LS*2-1,l=Math.sign(u)*Math.pow(Math.abs(u),1.15)*W,al=Math.abs(l),x=T.x[k]+c*l,z=T.z[k]-s*l,nh=GBf(T,x,z),roof=T.y[k]-l*T.bank[k]+8.4;
    band.push(al<=hw+.6?1:0);let f;if(al<=hw+.6)f=inside?1:0;else f=tap*(1-ss((al-hw-.6)/(W-hw-.6)));
    const top=Math.max(roof,nh),y=f>0?nh+(top-nh)*f-(1-f)*.6:nh-.6;
    pos.push(x,y+Math.sin(l*.37+k*.6)*.12*f*(al>hw+2?1:0),z);const cc=colourAt(tm,T,x,z)||[.3,.45,.25];col.push(cc[0],cc[1],cc[2])}
   ins.push(inside?1:0);rows++}
  /* the portal mouths stay open: no face joins the roof to the road outside */
  for(let r=0;r<rows-1;r++)for(let j=0;j<LS;j++){const p=r*(LS+1)+j,q=p+LS+1;if(ins[r]!==ins[r+1]&&(band[p]||band[p+1]||band[q]||band[q+1]))continue;if(!ins[r]&&!ins[r+1]&&(band[p]||band[p+1]))continue;idx.push(p,q,p+1,p+1,q,q+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,tm?tm.material:new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));m.receiveShadow=true;m.castShadow=true;m.userData.tnHill=1;sc.add(m)}}
P.tunnelFix=fix;
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{fix(sc,T)}catch(e){console.warn('tunnelfix',e)}return sc};
})();
