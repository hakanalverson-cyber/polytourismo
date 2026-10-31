/* ===== Poly GT: CC0 model library for Free Roam (Kenney City Builder / Racing / Furniture kits + pandazole pack) ===== */
(function frmodels(){
'use strict';
const P=window.PT8,M={},FM={M};
/* triangle-soup blobs: positions int16 /1000, colours uint8 (painted sRGB). FRM = Kenney kits, FRI = the island kit
   (the CC0 buildings and trees re-coloured to the Mediterranean palette), FRP = the bought / supplied packs converted
   by tools/models/convert.py (Italian city scene, rocks, road-works props; full builds only) */
for(const bb of[typeof FRM_B64!=='undefined'?[FRM_B64,FRM_META]:null,typeof FRI_B64!=='undefined'?[FRI_B64,FRI_META]:null,typeof FRP_B64!=='undefined'?[FRP_B64,FRP_META]:null]){
 if(!bb)continue;const raw=atob(bb[0]),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);
 for(const m of bb[1]){const nv=m.nv,pp=new Int16Array(u8.buffer.slice(m.off,m.off+nv*6)),cc=u8.subarray(m.off+nv*6,m.off+nv*9),Pf=new Float32Array(nv*3),Cf=new Float32Array(nv*3);
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
FM.lib=n=>{const k='l_'+n;if(M[k])return M[k];const K=P.PROPKIT;if(!K||!K.LIB[n])return null;const g0=K.LIB[n].g,g=g0.index?g0.toNonIndexed():g0,p=g.attributes.position.array,c=g.attributes.color,nv=p.length/3,Cf=new Float32Array(nv*3);
 for(let i=0;i<nv;i++){Cf[i*3]=c?c.getX(i):.7;Cf[i*3+1]=c?c.getY(i):.7;Cf[i*3+2]=c?c.getZ(i):.7}
 g.computeBoundingBox();const b=g.boundingBox;return M[k]={P:new Float32Array(p),C:Cf,n:nv,min:[b.min.x,b.min.y,b.min.z],size:[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z]}};
/* bridge-map city pack (KayKit, CC0): bake the palette texture into vertex colours so it merges into the chunk meshes */
const TX=new Map();
function texData(im){let t=TX.get(im);if(t)return t;const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const cx=cv.getContext('2d');cx.drawImage(im,0,0);t={d:cx.getImageData(0,0,cv.width,cv.height).data,w:cv.width,h:cv.height};TX.set(im,t);return t}
FM.hp=n=>{const k='h_'+n;if(M[k])return M[k];const H=P.HP;if(!H||!H.ready||!H.defs[n])return null;const d=H.defs[n],Pa=[],Ca=[];
 for(const part of d.parts){const g=part.geo,pos=g.attributes.position,uv=g.attributes.uv,idx=g.index,map=part.mat.map,mc=part.mat.color||{r:1,g:1,b:1};let tx=null;if(map&&map.image&&map.image.width)try{tx=texData(map.image)}catch(e){}
  const cnt=idx?idx.count:pos.count;for(let q=0;q<cnt;q++){const i=idx?idx.getX(q):q;Pa.push(pos.getX(i),pos.getY(i),pos.getZ(i));let r=1,gg=1,b=1;
   if(tx&&uv){let u=uv.getX(i),v=uv.getY(i);u-=Math.floor(u);v-=Math.floor(v);const x=Math.min(tx.w-1,Math.floor(u*tx.w)),y=Math.min(tx.h-1,Math.floor((map.flipY?1-v:v)*tx.h)),o=(y*tx.w+x)*4;r=Math.pow(tx.d[o]/255,2.1);gg=Math.pow(tx.d[o+1]/255,2.1);b=Math.pow(tx.d[o+2]/255,2.1)}
   Ca.push(r*mc.r,gg*mc.g,b*mc.b)}}
 return M[k]={P:new Float32Array(Pa),C:new Float32Array(Ca),n:Pa.length/3,min:[d.min.x,d.min.y,d.min.z],size:[d.max.x-d.min.x,d.max.y-d.min.y,d.max.z-d.min.z]}};
/* Quaternius nature models (CC0, baked in trees_q.js: 1 unit tall, one palette index per triangle) */
FM.q=n=>{const k='q_'+n;if(M[k])return M[k];const TD=window.PT8_TREES,d=TD&&TD[n];if(!d)return null;const dec=t=>{const b=atob(t),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
 const q=new Int16Array(dec(d.p).buffer),ci=dec(d.c),pal=d.pal.map(h=>new THREE.Color(h)),nv=q.length/3,Pf=new Float32Array(q.length),Cf=new Float32Array(q.length);let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
 for(let i=0;i<q.length;i++){const v=q[i]/16000;Pf[i]=v;const a=i%3;if(v<mn[a])mn[a]=v;if(v>mx[a])mx[a]=v}
 for(let t=0;t<ci.length;t++){const c=pal[ci[t]];for(let v=0;v<3;v++){const o=t*9+v*3;Cf[o]=c.r;Cf[o+1]=c.g;Cf[o+2]=c.b}}
 return M[k]={P:Pf,C:Cf,n:nv,min:mn,size:[mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]]}};
/* a coarse copy for far chunks (name + '~lo'): vertices clustered on a grid about a sixth of the model's size, flat colours kept */
FM.lod=(n,div)=>{const k=n+'~lo';if(M[k])return M[k];const b=FM.get(n);if(!b)return null;const P0=b.P,C0=b.C,nv=b.n,mn=b.min,cell=Math.max(b.size[0],b.size[1],b.size[2])/(div||6),cl=new Map(),kk=[];
 for(let i=0;i<nv;i++){const q=Math.round((P0[i*3]-mn[0])/cell)+','+Math.round((P0[i*3+1]-mn[1])/cell)+','+Math.round((P0[i*3+2]-mn[2])/cell);kk.push(q);let c=cl.get(q);if(!c)cl.set(q,c={x:0,y:0,z:0,n:0});c.x+=P0[i*3];c.y+=P0[i*3+1];c.z+=P0[i*3+2];c.n++}
 const o=[],oc=[];for(let t=0;t+2<nv;t+=3){const a=cl.get(kk[t]),c1=cl.get(kk[t+1]),c2=cl.get(kk[t+2]);if(a===c1||c1===c2||a===c2)continue;for(let v=0;v<3;v++){const q=cl.get(kk[t+v]),i=t+v;o.push(q.x/q.n,q.y/q.n,q.z/q.n);oc.push(C0[i*3],C0[i*3+1],C0[i*3+2])}}
 return M[k]={P:new Float32Array(o),C:new Float32Array(oc),n:o.length/3,min:mn,size:b.size}};
FM.get=n=>M[n]||(n.slice(-3)==='~lo'?FM.lod(n.slice(0,-3)):n.slice(0,2)==='l_'?FM.lib(n.slice(2)):n.slice(0,2)==='h_'?FM.hp(n.slice(2)):n.slice(0,2)==='q_'?FM.q(n.slice(2)):null);
/* append a model to a GB builder: x,y,z = base centre, s = uniform scale, ry = yaw (same convention as GB.box) */
FM.put=(G,n,x,y,z,s,ry,o)=>{const m=FM.get(n);if(!m)return false;o=o||{};const c=Math.cos(ry||0),sn=Math.sin(ry||0),sx=s,sy=s*(o.sy||1),t=o.tint||null,mn=m.min,cx=(mn[0]+m.size[0]/2),cz=(mn[2]+m.size[2]/2),by=o.noGround?0:mn[1],v=o.v||0,pos=G.pos,col=G.col,Pf=m.P,Cf=m.C,sw=G.sw,swk=o.sway&&sw?m.size[1]*sy*.03/(m.size[1]*m.size[1]||1):0;
 for(let i=0,e=m.n;i<e;i++){const px=(Pf[i*3]-cx)*sx,py=(Pf[i*3+1]-by)*sy,pz=(Pf[i*3+2]-cz)*sx;pos.push(x+px*c+pz*sn,y+py,z-px*sn+pz*c);
  let r=Cf[i*3],g=Cf[i*3+1],b=Cf[i*3+2];if(t){r*=t[0];g*=t[1];b*=t[2]}if(v){r*=1+v;g*=1+v;b*=1+v}col.push(r,g,b);if(sw){const h=Math.max(0,Pf[i*3+1]-by);sw.push(swk*h*h)}}return true};
FM.size=n=>{const m=FM.get(n);return m?m.size:[1,1,1]};
/* stand-alone mesh (garage furniture, showcase pieces) */
let LM=null;
FM.mesh=(n,s,o)=>{const m=FM.get(n);if(!m)return null;o=o||{};const G={pos:[],col:[]};FM.put(G,n,0,0,0,s,0,o);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));g.computeVertexNormals();g.computeBoundingSphere();
 const mt=o.mat||(LM||(LM=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9,metalness:0})));return new THREE.Mesh(g,mt)};
P.FM=FM;
})();
