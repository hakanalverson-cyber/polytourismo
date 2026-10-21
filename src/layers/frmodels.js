/* ===== Poly GT: CC0 model library for Free Roam (Kenney City Builder / Racing / Furniture kits + pandazole pack) ===== */
(function frmodels(){
'use strict';
const P=window.PT8,M={},FM={M};
/* Kenney kits: positions int16 /1000, colours uint8, triangle soup */
if(typeof FRM_B64!=='undefined'){
 const raw=atob(FRM_B64),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);
 for(const m of FRM_META){const nv=m.nv,pp=new Int16Array(u8.buffer.slice(m.off,m.off+nv*6)),cc=u8.subarray(m.off+nv*6,m.off+nv*9),Pf=new Float32Array(nv*3),Cf=new Float32Array(nv*3);
  for(let i=0;i<nv*3;i++){Pf[i]=pp[i]*.001;Cf[i]=Math.pow(cc[i]/255,2.1)}
  M[m.n]={P:Pf,C:Cf,n:nv,min:m.min,size:m.size}}}
/* pandazole buildings / trees (already in the page for the track maps) */
if(typeof BLD_B64!=='undefined'){
 const raw=atob(BLD_B64),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);const buf=u8.buffer;
 for(const m of BLD_META){const pos=new Int16Array(buf.slice(m.off,m.off+m.nv*6)),col=new Uint8Array(buf,m.off+m.nv*6,m.nv*3),idx=new Uint16Array(buf.slice(m.ioff,m.ioff+m.ni*2)),nv=m.ni,Pf=new Float32Array(nv*3),Cf=new Float32Array(nv*3);
  let mnx=1e9,mny=1e9,mnz=1e9;
  for(let i=0;i<m.ni;i++){const k=idx[i];Pf[i*3]=pos[k*3]*.001;Pf[i*3+1]=pos[k*3+1]*.001;Pf[i*3+2]=pos[k*3+2]*.001;Cf[i*3]=col[k*3]/255;Cf[i*3+1]=col[k*3+1]/255;Cf[i*3+2]=col[k*3+2]/255}
  for(let i=0;i<m.ni;i++){mnx=Math.min(mnx,Pf[i*3]);mny=Math.min(mny,Pf[i*3+1]);mnz=Math.min(mnz,Pf[i*3+2])}
  M['b_'+m.name]={P:Pf,C:Cf,n:m.ni,min:[mnx,mny,mnz],size:m.size}}}
/* prop-library geometry (poles, boulders, billboards, tents…) pulled in lazily once the props layer exists */
FM.lib=n=>{const k='l_'+n;if(M[k])return M[k];const K=P.PROPKIT;if(!K||!K.LIB[n])return null;const g=K.LIB[n].g.toNonIndexed(),p=g.attributes.position.array,c=g.attributes.color,nv=p.length/3,Cf=new Float32Array(nv*3);
 for(let i=0;i<nv;i++){Cf[i*3]=c?c.getX(i):.7;Cf[i*3+1]=c?c.getY(i):.7;Cf[i*3+2]=c?c.getZ(i):.7}
 g.computeBoundingBox();const b=g.boundingBox;return M[k]={P:new Float32Array(p),C:Cf,n:nv,min:[b.min.x,b.min.y,b.min.z],size:[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z]}};
FM.get=n=>M[n]||(n.slice(0,2)==='l_'?FM.lib(n.slice(2)):null);
/* append a model to a GB builder: x,y,z = base centre, s = uniform scale, ry = yaw (same convention as GB.box) */
FM.put=(G,n,x,y,z,s,ry,o)=>{const m=FM.get(n);if(!m)return false;o=o||{};const c=Math.cos(ry||0),sn=Math.sin(ry||0),sx=s,sy=s*(o.sy||1),t=o.tint||null,mn=m.min,cx=(mn[0]+m.size[0]/2),cz=(mn[2]+m.size[2]/2),by=o.noGround?0:mn[1],v=o.v||0,pos=G.pos,col=G.col,Pf=m.P,Cf=m.C;
 for(let i=0,e=m.n;i<e;i++){const px=(Pf[i*3]-cx)*sx,py=(Pf[i*3+1]-by)*sy,pz=(Pf[i*3+2]-cz)*sx;pos.push(x+px*c+pz*sn,y+py,z-px*sn+pz*c);
  let r=Cf[i*3],g=Cf[i*3+1],b=Cf[i*3+2];if(t){r*=t[0];g*=t[1];b*=t[2]}if(v){r*=1+v;g*=1+v;b*=1+v}col.push(r,g,b)}return true};
FM.size=n=>{const m=FM.get(n);return m?m.size:[1,1,1]};
/* stand-alone mesh (garage furniture, showcase pieces) */
let LM=null;
FM.mesh=(n,s,o)=>{const m=FM.get(n);if(!m)return null;o=o||{};const G={pos:[],col:[]};FM.put(G,n,0,0,0,s,0,o);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));g.computeVertexNormals();g.computeBoundingSphere();
 const mt=o.mat||(LM||(LM=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9,metalness:0})));return new THREE.Mesh(g,mt)};
P.FM=FM;
})();
