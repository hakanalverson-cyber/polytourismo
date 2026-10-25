/* ===== Poly GT layer: scenery (shared pieces for the real circuits: the forest that fills the land around them, concrete walls, catch
   fencing, bank billboards, crowds in the stands, a hill town). Road Atlanta and Imola build their look from these. ===== */
(function(){const P=window.PT8;if(!P)return;
const merge=parts=>{let n=0;for(const p of parts)n+=p.attributes.position.count;const pos=new Float32Array(n*3);let o=0;for(const p of parts){pos.set(p.attributes.position.array,o);o+=p.attributes.position.array.length}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.computeVertexNormals();return g};
/* far trees, 1 unit tall: a two-tier pine, and a round hardwood crown on a short trunk. A handful of triangles each, so the whole
   countryside can be wooded */
const GEO={};
/* colours here are given as they should look on screen (sRGB); vertex and instance colours are linear, so convert */
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const farPine=()=>GEO.p||(GEO.p=(()=>{const a=new THREE.ConeGeometry(.3,.55,6,1).toNonIndexed();a.translate(0,.5,0);const b=new THREE.ConeGeometry(.22,.42,6,1).toNonIndexed();b.translate(0,.8,0);const t=new THREE.CylinderGeometry(.035,.045,.3,4,1).toNonIndexed();t.translate(0,.15,0);return merge([t,a,b])})());
const farBlob=()=>GEO.b||(GEO.b=(()=>{const a=new THREE.IcosahedronGeometry(.36,0);a.scale(1,.85,1);a.translate(0,.62,0);const b=new THREE.IcosahedronGeometry(.24,0);b.translate(.16,.78,.08);const t=new THREE.CylinderGeometry(.04,.055,.4,4,1).toNonIndexed();t.translate(0,.2,0);return merge([t,a,b])})());
const farCypress=()=>GEO.c||(GEO.c=(()=>{const a=new THREE.ConeGeometry(.14,.92,6,1).toNonIndexed();a.translate(0,.54,0);const t=new THREE.CylinderGeometry(.03,.03,.1,4,1).toNonIndexed();t.translate(0,.05,0);return merge([t,a])})());
const farUmb=()=>GEO.u||(GEO.u=(()=>{const a=new THREE.CylinderGeometry(.42,.3,.16,7,1).toNonIndexed();a.translate(0,.88,0);const t=new THREE.CylinderGeometry(.035,.05,.82,4,1).toNonIndexed();t.translate(0,.41,0);return merge([t,a])})());
const FG={pine:farPine,blob:farBlob,cypress:farCypress,umb:farUmb};
/* fill the land with woods: a jittered grid over the area around the track. o: {dRoad, from (m off the road edge where the fill starts),
   step, margin, kinds:[{g:'pine'|'blob'|..., w, h:[min,max], cols:[...]}], open(x,z) -> true keeps a spot clear, box (ground extent)} */
P.farForest=(T,g,o)=>{const[x0,x1,z0,z1]=T.bounds,M=o.margin||260,st=o.step||9;let s=(o.seed||1)>>>0;const rr=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
 const L=o.kinds.map(()=>[]),W=o.kinds.reduce((a,k)=>a+k.w,0),bx=o.box;
 for(let x=x0-M;x<x1+M;x+=st)for(let z=z0-M;z<z1+M;z+=st){const px=x+(rr()-.5)*st*.9,pz=z+(rr()-.5)*st*.9;if(bx&&(px<bx[0]||px>bx[1]||pz<bx[2]||pz>bx[3]))continue;
  const d=o.dRoad(px,pz);if(d<o.from)continue;
  /* the edge of the woods wanders, and a few fields open up further out */
  if(d<o.from+10&&T.nz(px*9+2,pz*9-5)>.3)continue;if(T.nz(px*1.7+17,pz*1.7-3)>(o.fields==null?.95:o.fields))continue;/* T.nz spans about +-1.75 */if(o.open&&o.open(px,pz))continue;
  let t=rr()*W,i=0;for(;i<o.kinds.length-1;i++){t-=o.kinds[i].w;if(t<=0)break}
  /* kinds can gather in patches (a stand of pines, a stand of oaks) instead of a uniform mix */
  if(o.patch!=null&&T.nz(px*3+40,pz*3+9)>.6)i=o.patch;
  const k=o.kinds[i],h=k.h[0]+(k.h[1]-k.h[0])*rr();L[i].push([px,T.terr(px,pz)-.4,pz,h,rr()*6,k.cols[Math.floor(rr()*k.cols.length)]])}
 const ob=new THREE.Object3D(),c=new THREE.Color();let n=0;
 o.kinds.forEach((k,i)=>{const l=L[i];if(!l.length)return;const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),im=new THREE.InstancedMesh(FG[k.g](),m,l.length);
  l.forEach((p,j)=>{const w=k.wide||1;ob.position.set(p[0],p[1],p[2]);ob.scale.set(p[3]*w,p[3],p[3]*w);ob.rotation.set(0,p[4],0);ob.updateMatrix();im.setMatrixAt(j,ob.matrix);im.setColorAt(j,lin(p[5]))});
  im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.castShadow=false;im.receiveShadow=true;im.userData.shd=1;g.add(im);n+=l.length});
 return n};
/* woods past the planted tree rows: real tree models (trees_q.js) in a band from o.from to o.to metres off the road edge, set out along the
   lap so every tree keeps its own space (qTrees spacing), with the edge of the woods wandering and a few clearings */
P.bandForest=(T,g,o)=>{const N=T.N;let s=(o.seed||1)>>>0;const rr=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
 const far=(x,z,R)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16),C=Math.ceil(R/16)+1;let b=1e9;for(let a=-C;a<=C;a++)for(let c=-C;c<=C;c++){const l=T.grid.get((cx+a)*8192+cz+c);if(!l)continue;for(const i of l){const d=Math.hypot(x-T.x[i],z-T.z[i])-T.hw[i];if(d<b)b=d}}return b};
 const L=o.kinds.map(()=>[]),W=o.kinds.reduce((a,k)=>a+k.w,0),st=o.step||13;
 for(let k=0;k<N;k+=2){const c=Math.cos(T.psi[k]),sn=Math.sin(T.psi[k]);for(const side of[-1,1])for(let d=o.from;d<o.to;d+=st){if(rr()>.8)continue;
  const l=side*(T.hw[k]+d+(rr()-.5)*st*.8),x=T.x[k]+c*l+(rr()-.5)*T.sp*2,z=T.z[k]-sn*l+(rr()-.5)*T.sp*2;
  if(T.nz(x*1.7+17,z*1.7-3)>(o.fields==null?1.1:o.fields))continue;if(o.open&&o.open(x,z))continue;if(far(x,z,o.from+4)<o.from-2)continue;
  let t=rr()*W,i=0;for(;i<o.kinds.length-1;i++){t-=o.kinds[i].w;if(t<=0)break}
  L[i].push([x,T.terr(x,z),z,.85+rr()*.35,rr()*6])}}
 let n=0;o.kinds.forEach((k,i)=>{n+=L[i].length;if(k.lob)P.lobTrees(g,L[i],k.h,k.tints,k.lob===true?'lob':k.lob);else P.qMix(g,k.names,L[i],k.h,k.tints,k.o)});return n};
/* loblolly pine, the Georgia Piedmont tree: a tall straight bare trunk and a loose, lumpy crown only in the top third (not a Christmas-tree
   cone). 1 unit tall, coloured per vertex: bark trunk, darker crown underside, lighter crown top */
const TM={};const LOB=(()=>{let g=null;return()=>{if(g)return g;const parts=[],cols=[],add=(geo,fn)=>{geo=geo.index?geo.toNonIndexed():geo;const p=geo.attributes.position;for(let i=0;i<p.count;i++)cols.push(...fn(p.getY(i)));parts.push(geo)};
 const bark=lin(0x5a3a26),bk=[bark.r,bark.g,bark.b],dk=lin(0x2c4424),lt=lin(0x4f6e36);
 const t=new THREE.CylinderGeometry(.014,.03,.8,6,1);t.translate(0,.4,0);add(t,()=>bk);
 const blob=(r,x,y,z,sy)=>{const b=new THREE.IcosahedronGeometry(r,0);b.scale(1,sy,1);b.translate(x,y,z);add(b,yy=>{const u=Math.max(0,Math.min(1,(yy-(y-r*sy))/(2*r*sy)));return[dk.r+(lt.r-dk.r)*u,dk.g+(lt.g-dk.g)*u,dk.b+(lt.b-dk.b)*u]})};
 blob(.15,0,.88,0,.62);blob(.11,.12,.8,.03,.6);blob(.1,-.11,.79,-.05,.6);blob(.1,.02,.77,.12,.6);blob(.09,-.03,.72,-.11,.55);blob(.08,.08,.97,-.02,.6);
 /* a couple of short limbs below the crown */
 for(const[a,y]of[[.6,.66],[2.7,.62],[4.4,.7]]){const l=new THREE.CylinderGeometry(.006,.009,.12,4,1);l.rotateZ(1.1);l.rotateY(a);l.translate(Math.cos(a)*.05,y,-Math.sin(a)*.05);add(l,()=>bk)}
 g=merge(parts);g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));return g}})();
/* Italian stone pine (pino domestico): bare trunk leaning a little, forking high, under one wide flat umbrella of dark green */
TM.stone=()=>{const parts=[],cols=[],add=(geo,c)=>{geo=geo.index?geo.toNonIndexed():geo;for(let i=0;i<geo.attributes.position.count;i++)cols.push(...c(geo.attributes.position.getY(i)));parts.push(geo)};
 const bk=lin(0x6b4a34),dk=lin(0x24391f),lt=lin(0x46622f),B=()=>[bk.r,bk.g,bk.b];
 const t=new THREE.CylinderGeometry(.022,.04,.62,6,1);t.translate(0,.31,0);t.rotateZ(.06);add(t,B);
 for(const a of[.8,3.6]){const f=new THREE.CylinderGeometry(.012,.02,.22,5,1);f.rotateZ(.55);f.rotateY(a);f.translate(Math.cos(a)*.06,.7,-Math.sin(a)*.06);add(f,B)}
 const blob=(r,x,y,z,sy)=>{const b=new THREE.IcosahedronGeometry(r,1);b.scale(1,sy,1);b.translate(x,y,z);add(b,yy=>{const u=Math.max(0,Math.min(1,(yy-(y-r*sy))/(2*r*sy)));return[dk.r+(lt.r-dk.r)*u,dk.g+(lt.g-dk.g)*u,dk.b+(lt.b-dk.b)*u]})};
 blob(.32,.02,.86,0,.28);blob(.2,.2,.83,.08,.3);blob(.19,-.19,.84,-.06,.3);blob(.16,.03,.84,-.22,.3);blob(.15,-.04,.85,.22,.3);
 const g=merge(parts);g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));return g};
/* Italian cypress: a tall dark spindle, widest a third of the way up, pointed top; a short trunk at the foot */
TM.cypress=()=>{const cols=[],dk=lin(0x1e3220),lt=lin(0x34502f),bk=lin(0x5a3e2a);const pr=[];for(let i=0;i<=10;i++){const y=.04+i*.096,u=i/10;pr.push(new THREE.Vector2(Math.max(.004,.11*Math.sin(Math.PI*Math.pow(u,.8))*(1-.25*u)),y))}
 const sp=new THREE.LatheGeometry(pr,7).toNonIndexed();const t=new THREE.CylinderGeometry(.015,.02,.08,5,1).toNonIndexed();t.translate(0,.04,0);
 const P1=sp.attributes.position;for(let i=0;i<P1.count;i++){const u=P1.getY(i),w=.5+.5*Math.sin(i*1.7);cols.push(dk.r+(lt.r-dk.r)*u*w,dk.g+(lt.g-dk.g)*u*w,dk.b+(lt.b-dk.b)*u*w)}
 for(let i=0;i<t.attributes.position.count;i++)cols.push(bk.r,bk.g,bk.b);const g=merge([sp,t]);g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));return g};
TM.lob=()=>LOB();const TG={};const tgeo=k=>TG[k]||(TG[k]=TM[k]());
P.lobTrees=(par,list,h,tints,kind)=>{const G=par.userData._lob||(par.userData._lob=new Map()),C=8,ok=[];
 for(const p of list){const r=h*p[3]*(kind==='stone'?.3:kind==='cypress'?.07:.12),cx=Math.floor(p[0]/C),cz=Math.floor(p[2]/C);let free=true;
  for(let a=-1;a<=1&&free;a++)for(let b=-1;b<=1&&free;b++){const l=G.get((cx+a)*65536+cz+b);if(l)for(const q of l)if(Math.hypot(q[0]-p[0],q[1]-p[2])<(q[2]+r)*.9){free=false;break}}
  if(!free)continue;const k=cx*65536+cz;(G.get(k)||G.set(k,[]).get(k)).push([p[0],p[2],r]);ok.push(p)}
 if(!ok.length)return null;const im=new THREE.InstancedMesh(tgeo(kind||'lob'),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,flatShading:true}),ok.length),ob=new THREE.Object3D();
 ok.forEach((p,i)=>{const s=h*p[3];ob.position.set(p[0],p[1]-.3,p[2]);ob.scale.set(s*(.9+.2*((i*7)%5)/5),s,s);ob.rotation.set(0,p[4]||0,0);ob.updateMatrix();im.setMatrixAt(i,ob.matrix);if(tints)im.setColorAt(i,new THREE.Color(tints[i%tints.length]))});
 im.instanceMatrix.needsUpdate=true;par.add(im);return im};
/* a solid wall ribbon along the track at lateral l (per sample), with a top cap; runs only where nothing else is closer to the road.
   every link is a real collider */
P.trackWall=(T,g,at,dRoad,o)=>{const N=T.N,side=o.side,pos=[],idx=[],col=[],c0=lin(o.col),c1=lin(o.top||o.col),H=o.h||1,th=o.th||.4;let run=[];
 const flush=()=>{if(run.length<2){run=[];return}for(let q=0;q<run.length;q++){const p=run[q],v=pos.length/3;
   pos.push(p.x,p.y,p.z,p.x,p.y+H,p.z,p.x+p.nx*th,p.y+H,p.z+p.nz*th,p.x+p.nx*th,p.y,p.z+p.nz*th);for(let j=0;j<4;j++){const cc=j===1||j===2?c1:c0;col.push(cc.r,cc.g,cc.b)}
   if(q){const a=v-4;idx.push(a,v,a+1,v,v+1,a+1, a+1,v+1,a+2,v+1,v+2,a+2, a+2,v+2,a+3,v+2,v+3,a+3);if(P.addSeg)P.addSeg(T,run[q-1].x,run[q-1].z,p.x,p.z,.3)}}run=[]};
 for(let q=o.a;q<=o.b;q++){const k=((q%N)+N)%N,l=side*(T.hw[k]+(typeof o.off==='function'?o.off(k):o.off)),p=at(k,l,0),c=Math.cos(T.psi[k]),s=Math.sin(T.psi[k]);
  if(o.skip&&o.skip(k)||dRoad(p[0],p[2])<Math.abs(l)-T.hw[k]-1.5){flush();continue}run.push({x:p[0],y:p[1]-.15,z:p[2],nx:c*side,nz:-s*side})}
 flush();if(!pos.length)return null;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gg.setIndex(idx);gg.computeVertexNormals();
 const m=new THREE.Mesh(gg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true,side:THREE.DoubleSide}));g.add(m);return m};
/* catch fence: posts and a see-through chain-link sheet on top of a wall line */
let fenceTex=null;
P.catchFence=(T,g,at,dRoad,o)=>{fenceTex=fenceTex||ctex(16,16,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,210,214,1)';x.lineWidth=1;for(let i=-16;i<32;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i+16,16);x.stroke();x.beginPath();x.moveTo(i+16,0);x.lineTo(i,16);x.stroke()}});
 const N=T.N,side=o.side,H=o.h||3.2,y0=o.y0||1,pos=[],uv=[],idx=[],posts=[];let u=0,last=null,run=0;
 for(let q=o.a;q<=o.b;q++){const k=((q%N)+N)%N,l=side*(T.hw[k]+o.off),p=at(k,l,0);if(o.skip&&o.skip(k)||dRoad(p[0],p[2])<Math.abs(l)-T.hw[k]-1.5){last=null;continue}
  const v=pos.length/3;if(last)u+=Math.hypot(p[0]-last[0],p[2]-last[2])/1.6;pos.push(p[0],p[1]+y0,p[2],p[0],p[1]+y0+H,p[2]);uv.push(u,0,u,H/1.6);if(last)idx.push(v-2,v,v-1,v,v+1,v-1);last=p;if(run++%2===0)posts.push([p[0],p[1]+y0+H/2-.5,p[2],1,1,0])}
 if(!pos.length)return;const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);
 const fm=new THREE.MeshBasicMaterial({map:fenceTex,transparent:true,opacity:.55,alphaTest:.2,side:THREE.DoubleSide,depthWrite:false,color:0x9aa3aa});fenceTex.magFilter=THREE.LinearFilter;g.add(new THREE.Mesh(gg,fm));
 if(posts.length)inst(g,new THREE.CylinderGeometry(.06,.06,H+1,5),new THREE.MeshStandardMaterial({color:0x7d868d,metalness:.4,roughness:.5}),posts)};
/* a big billboard on two legs, standing on the bank and turned to face the cars coming toward it. Plain generic text only */
P.bankBoard=(g,x,y,z,yaw,txt,bg,fg,w,h)=>{w=w||9;h=h||2.6;const grp=new THREE.Group();grp.position.set(x,y,z);grp.rotation.y=yaw;g.add(grp);
 const leg=new THREE.MeshStandardMaterial({color:0x6f777d,metalness:.3,roughness:.6});for(const sx of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.22,2.2+h,.22),leg);p.position.set(sx*w*.36,(2.2+h)/2,-.15);grp.add(p)}
 const tx=ctex(Math.round(w*36),Math.round(h*36),(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.font='bold '+Math.floor(H*.52)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H/2+2);c.fillRect(0,H-6,W,6)});tx.magFilter=THREE.LinearFilter;
 const f=new THREE.Mesh(new THREE.BoxGeometry(w,h,.18),[leg,leg,leg,leg,new THREE.MeshBasicMaterial({map:tx}),leg]);f.position.y=2.2+h/2;grp.add(f);return grp};
/* spectators in a grandstand: a sheet of little coloured figures laid over the seat steps (kitStand geometry: rows deep, D=.9, H=.55) */
let crowdTex=null;
P.kitCrowd=(st,len,rows,fill)=>{crowdTex=crowdTex||ctex(64,16,(x,w,h)=>{x.clearRect(0,0,w,h);let s=91;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);const pal=['#d8392f','#f1f1f1','#2c6cd0','#f2c76b','#27303a','#7fd68a','#e98a3a','#9aa5b0'];
  for(let j=0;j<4;j++)for(let i=0;i<w;i+=2){if(r()<.18)continue;x.fillStyle=pal[Math.floor(r()*pal.length)];x.fillRect(i,j*4+1,2,2);x.fillStyle='#d9b08c';x.fillRect(i,j*4,2,1)}});
 const D=.9,Hh=.55,m=new THREE.MeshBasicMaterial({map:crowdTex,transparent:true,alphaTest:.5,side:THREE.DoubleSide});const t=crowdTex.clone();t.needsUpdate=true;t.repeat.set(len/8,rows*(fill||1)/4);m.map=t;
 const p=new THREE.Mesh(new THREE.PlaneGeometry(len-.8,Math.hypot(rows*D,rows*Hh)*(fill||1)),m);const a=Math.atan2(Hh,D);p.rotation.x=-(Math.PI/2-a);p.rotation.order='YXZ';
 const f=fill||1;p.position.set(0,Hh*.5+rows*Hh*f/2+.35,-(rows*D*f)/2-.1);st.add(p);return p};
/* Italian hill town: ochre and cream houses with terracotta roofs, a brick bell tower and one tall modern block. Stands at x,z facing yaw */
P.hillTown=(g,T,cx,cz,R,seed)=>{let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);const W=[0xd9b77a,0xe6cf9f,0xc98f55,0xe9dcc0,0xd4a06a,0xbf7a4a],RF=[0xa4482c,0xb5583a,0x94402a],BOX=new THREE.BoxGeometry(1,1,1),ROOF=new THREE.ConeGeometry(.75,1,4,1);ROOF.rotateY(Math.PI/4);
 const wl=[],rl=[];for(let i=0;i<110;i++){const a=r()*6.283,d=Math.sqrt(r())*R,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,w=7+r()*9,dd=6+r()*8,h=6+r()*9*(1-d/R*.5),y=T.terr(x,z)-.5,yaw=r()*.5;wl.push([x,y+h/2,z,w,h,dd,yaw,W[i%W.length]]);rl.push([x,y+h+1.2,z,w*1.02,2.4,dd*1.02,yaw,RF[i%RF.length]])}
 const put=(geo,L)=>{const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),L.length),o=new THREE.Object3D(),c=new THREE.Color();L.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.scale.set(p[3],p[4],p[5]);o.rotation.set(0,p[6],0);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,lin(p[7]))});im.castShadow=false;im.userData.shd=1;g.add(im)};
 put(BOX,wl);put(ROOF,rl);
 /* bell tower: brick shaft, open belfry, small spire */
 const by=T.terr(cx,cz)-.5,bm=new THREE.MeshStandardMaterial({color:0x9c5a3c,roughness:.95,flatShading:true});const sh=new THREE.Mesh(new THREE.BoxGeometry(6,38,6),bm);sh.position.set(cx,by+19,cz);g.add(sh);
 for(const[dx,dz]of[[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]]){const c=new THREE.Mesh(new THREE.BoxGeometry(1,6,1),bm);c.position.set(cx+dx,by+41,cz+dz);g.add(c)}
 const cap=new THREE.Mesh(new THREE.BoxGeometry(6.6,1,6.6),bm);cap.position.set(cx,by+44.5,cz);g.add(cap);const sp=new THREE.Mesh(new THREE.ConeGeometry(4,8,4),new THREE.MeshStandardMaterial({color:0x8a4a30,flatShading:true}));sp.rotation.y=Math.PI/4;sp.position.set(cx,by+49,cz);g.add(sp);
 /* a tall modern block at the edge of town */
 const mx=cx+R*.8,mz=cz-R*.3,my=T.terr(mx,mz)-.5,tw=new THREE.Mesh(new THREE.BoxGeometry(16,62,14),new THREE.MeshStandardMaterial({color:0xc9ccc4,roughness:.6,flatShading:true}));tw.position.set(mx,my+31,mz);g.add(tw);
 for(let f=0;f<14;f++){const b=new THREE.Mesh(new THREE.BoxGeometry(16.2,1.6,14.2),new THREE.MeshStandardMaterial({color:0x50606e,roughness:.3,metalness:.3}));b.position.set(mx,my+4+f*4.2,mz);g.add(b)}};
})();
