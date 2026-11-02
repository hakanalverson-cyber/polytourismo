/* ===== Poly GT layer: Highway Cut-Up world (bike models, rider, endless highway, signalling traffic). The mode itself is bikes.js ===== */
(function bkWorld(){
'use strict';
const P=window.PT8;if(!P||typeof THREE==='undefined')return;
const BK=P.BK=P.BK||{};
const cl=(x,a,b)=>x<a?a:x>b?b:x,lp=(a,b,t)=>a+(b-a)*t,PI=Math.PI,PI2=PI*2;
const ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const s2l=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
const hexRGB=h=>[s2l((h>>16&255)/255),s2l((h>>8&255)/255),s2l((h&255)/255)];
BK.util={cl,lp,ss,rng,s2l,hexRGB};

/* ---------------- geometry builder: flat-shaded, vertex-coloured triangles merged into one mesh ---------------- */
class GB{constructor(){this.p=[];this.c=[]}
 tri(a,b,c,col){this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let i=0;i<3;i++)this.c.push(col[0],col[1],col[2])}
 quad(a,b,c,d,col){this.tri(a,b,c,col);this.tri(a,c,d,col)}
 /* box from a centre, half sizes and an orientation basis (fwd x/z unit, so it follows the road) */
 box(cx,cy,cz,hx,hy,hz,col,yaw,cols){const s=Math.sin(yaw||0),c=Math.cos(yaw||0);const V=(x,y,z)=>[cx+x*c+z*s,cy+y,cz-x*s+z*c];
  const v=[V(-hx,-hy,-hz),V(hx,-hy,-hz),V(hx,hy,-hz),V(-hx,hy,-hz),V(-hx,-hy,hz),V(hx,-hy,hz),V(hx,hy,hz),V(-hx,hy,hz)];
  const k=cols||[col,col,col,col,col,col];
  this.quad(v[4],v[5],v[6],v[7],k[0]);/* +z */this.quad(v[1],v[0],v[3],v[2],k[1]);/* -z */this.quad(v[5],v[1],v[2],v[6],k[2]);/* +x */this.quad(v[0],v[4],v[7],v[3],k[3]);/* -x */this.quad(v[3],v[7],v[6],v[2],k[4]);/* top */this.quad(v[0],v[1],v[5],v[4],k[5])}
 geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeVertexNormals();return g}}
BK.GB=GB;
const M_VC=()=>new THREE.MeshLambertMaterial({vertexColors:true});

/* ---------------- bike pack (bought models, project files only) with a hand-built fallback ---------------- */
let packP=null;BK.pack=null;
BK.loadPack=()=>{if(packP)return packP;packP=(async()=>{const b=window.BIKES_B64;if(!b||typeof DecompressionStream==='undefined')return null;
 const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const st=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));BK.pack=JSON.parse(await new Response(st).text());return BK.pack})().catch(e=>{console.warn('bike pack',e);return null});return packP};
const u8=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
/* catalogue: the pack's bikes, or four simple hand-built ones when the pack is not built in */
const FALLBACK=[
 {id:'fb_dirt',name:'Trail 250',kind:'DIRT',stats:{top:150,acc:.8,hnd:.92,trk:1},paint:[.92,.45,.08],alt:[.1,.55,.95],fb:'dirt'},
 {id:'fb_sport',name:'Street 600',kind:'SPORT',stats:{top:255,acc:.9,hnd:.84,trk:.76},paint:[.85,.12,.15],alt:[.1,.3,.85],fb:'sport'},
 {id:'fb_naked',name:'Roadster 800',kind:'NAKED',stats:{top:210,acc:.8,hnd:.8,trk:.7},paint:[.2,.22,.25],alt:[.9,.75,.1],fb:'naked'},
 {id:'fb_scoot',name:'City Scooter',kind:'SCOOTER',stats:{top:100,acc:.45,hnd:.88,trk:.6},paint:[.3,.75,.9],alt:[.95,.85,.2],fb:'scoot'}];
BK.list=()=>BK.pack?BK.pack.bikes:FALLBACK;
BK.byId=id=>BK.list().find(b=>b.id===id)||BK.list()[0];
/* simple bike: proportions shared with the pack (metres, +z forward, ground at y 0) */
function fbBike(d){const k=d.fb,sp=k==='sport',sc=k==='scoot',dt=k==='dirt',r=sc?.22:dt?.36:.31,wb=sc?1.3:1.42;
 const fw=[0,r,wb/2],rw=[0,r,-wb/2],seatY=sc?.78:dt?.95:.82,piv=[0,seatY+.18,fw[2]-.3];
 const out={body:new GB(),steer:new GB(),fw:new GB(),rw:new GB()};const PAINT=[-1,-1,-1],DK=[.04,.04,.05],MT=[.45,.46,.48],SEAT=[.06,.06,.07];
 const B=out.body;B.box(0,seatY-.22,-.02,.12,.17,.42,PAINT);/* tank / body */B.box(0,seatY,-.25,.11,.04,.3,SEAT);B.box(0,seatY-.45,0,.13,.16,.22,MT);/* engine */
 B.box(0,r+.08,-wb/4,.04,.04,wb/4,MT);/* swingarm */if(sp)B.box(0,seatY-.05,.42,.16,.2,.18,PAINT);if(sc){B.box(0,.42,.2,.18,.36,.07,PAINT);B.box(0,.28,-.02,.17,.04,.32,PAINT)}
 if(dt)B.box(0,seatY+.02,-.62,.08,.03,.22,PAINT);
 const S=out.steer,h=piv;/* bars and fork in steering-pivot space */S.box(0,0,0,.05,.05,.05,DK);S.box(0,.04,-.02,.36,.02,.02,DK);S.box(.33,.04,-.02,.05,.025,.025,[.02,.02,.02]);S.box(-.33,.04,-.02,.05,.025,.025,[.02,.02,.02]);
 const fl=Math.hypot(h[1]-fw[1],h[2]-fw[2]);const fa=Math.atan2(h[2]-fw[2],h[1]-fw[1]);
 for(const sx of[-.09,.09]){const n=6;for(let i=0;i<n;i++){const t=(i+.5)/n;S.box(sx,-(h[1]-fw[1])*t,-(h[2]-fw[2])*t,.025,fl/n/2,.025,MT)}}
 S.box(0,-(h[1]-fw[1])+r+.05,-(h[2]-fw[2])+.02,.08,.02,r*.7,PAINT);/* mudguard */S.box(0,-.05,.12,.08,.07,.05,[.9,.9,.8]);/* lamp */
 for(const W of[out.fw,out.rw]){const n=12;for(let i=0;i<n;i++){const a=i/n*PI2,b=(i+1)/n*PI2;for(const[rr,x,col]of[[r,.07,DK],[r*.72,.06,MT]]){const p=(a2,xx)=>[xx,Math.cos(a2)*rr,Math.sin(a2)*rr];
   W.quad(p(a,-x),p(b,-x),p(b,x),p(a,x),col);W.tri([-x,0,0],p(b,-x),p(a,-x),col);W.tri([x,0,0],p(a,x),p(b,x),col)}}}
 return{out,info:{fw,rw,rf:r,rr:r,piv,axis:[0,Math.cos(.44),-Math.sin(.44)],seat:[0,seatY,-.18],grip:[.36,piv[1]+.04,piv[2]-.02],peg:sc?[.14,.3,.25]:[.17,r+.05,-.12],len:wb+2*r,h:piv[1]+.1}}}
/* builds a THREE geometry for one part; paint faces are listed so the paint can change later */
function partGeo(part,pal,paintRGB){const pos=new Int16Array(u8(part.pos).buffer),idx=part.i32?new Uint32Array(u8(part.idx).buffer):new Uint16Array(u8(part.idx).buffer),col=u8(part.col);
 const nf=idx.length/3,P=new Float32Array(nf*9),C=new Float32Array(nf*9),paint=[];
 const L=pal.map(c=>c[0]<0?null:[s2l(c[0]/63),s2l(c[1]/63),s2l(c[2]/63)]);
 for(let f=0;f<nf;f++){const cc=L[col[f]];if(!cc)paint.push(f);const c=cc||paintRGB;for(let k=0;k<3;k++){const v=idx[f*3+k];P[f*9+k*3]=pos[v*3]/15000;P[f*9+k*3+1]=pos[v*3+1]/15000;P[f*9+k*3+2]=pos[v*3+2]/15000;C[f*9+k*3]=c[0];C[f*9+k*3+1]=c[1];C[f*9+k*3+2]=c[2]}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeVertexNormals();g.userData.paint=paint;return g}
function gbGeo(gb,paintRGB){const g=gb.geo(),c=g.attributes.color,paint=[];for(let f=0;f<c.count/3;f++)if(c.getX(f*3)<0){paint.push(f);for(let k=0;k<3;k++)c.setXYZ(f*3+k,paintRGB[0],paintRGB[1],paintRGB[2])}g.userData.paint=paint;return g}
const geoCache={};BK._geoCache=geoCache;
function bikeGeos(d){if(geoCache[d.id])return geoCache[d.id];const lin=c=>c?c.map(s2l):[.5,.5,.5];let r;
 if(d.parts){r={info:d,parts:{}};for(const k of['body','steer','fw','rw'])if(d.parts[k])r.parts[k]=partGeo(d.parts[k],d.pal,lin(d.paint))}
 else{const f=fbBike(d);r={info:Object.assign({},d,f.info),parts:{}};for(const k in f.out)r.parts[k]=gbGeo(f.out[k],lin(d.paint))}
 try{splitMirrors(r)}catch(e){console.warn('mirrors',e)}
 return geoCache[d.id]=r}
/* bar-end and bar-mounted mirrors come baked into the body part: find small loose pieces up by the grips and hand them to the steering part,
   so they turn with the bars (big pieces such as a fairing never qualify) */
function splitMirrors(r){const I=r.info,B=r.parts.body,S=r.parts.steer;if(!B||!S||!I.grip||!I.piv)return;
 const P=B.attributes.position,C=B.attributes.color,nf=P.count/3,q=v=>Math.round(v*400);
 /* components by shared corners */
 const par=new Int32Array(nf);for(let i=0;i<nf;i++)par[i]=i;const f_=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i};const map=new Map();
 for(let f=0;f<nf;f++)for(let k=0;k<3;k++){const v=f*3+k,key=q(P.getX(v))+','+q(P.getY(v))+','+q(P.getZ(v));const o=map.get(key);if(o==null)map.set(key,f);else{const a=f_(o),b=f_(f);if(a!==b)par[a]=b}}
 const box=new Map();for(let f=0;f<nf;f++){const c=f_(f);let b=box.get(c);if(!b){b={lo:[1e9,1e9,1e9],hi:[-1e9,-1e9,-1e9],fs:[]};box.set(c,b)}b.fs.push(f);for(let k=0;k<3;k++){const v=f*3+k,x=[P.getX(v),P.getY(v),P.getZ(v)];for(let j=0;j<3;j++){if(x[j]<b.lo[j])b.lo[j]=x[j];if(x[j]>b.hi[j])b.hi[j]=x[j]}}}
 const g=I.grip,take=new Uint8Array(nf);let n=0;
 for(const b of box.values()){const sx=b.hi[0]-b.lo[0],sy=b.hi[1]-b.lo[1],sz=b.hi[2]-b.lo[2];if(Math.max(sx,sy,sz)>.4)continue;
  const ax=Math.min(Math.abs(b.lo[0]),Math.abs(b.hi[0]));if(b.lo[0]<0&&b.hi[0]>0)continue;
  if(ax<.12||b.lo[1]<g[1]-.06||b.hi[1]>g[1]+.55||b.hi[2]<g[2]-.3||b.lo[2]>g[2]+.25)continue;
  for(const f of b.fs){take[f]=1;n++}}
 if(!n)return;
 const piv=I.piv,mkG=(keep,shift)=>{const cnt=keep.reduce((a,x)=>a+x,0),Pn=new Float32Array(cnt*9),Cn=new Float32Array(cnt*9);let o=0;const paint=[];const bp=new Set(B.userData.paint||[]);
  for(let f=0;f<nf;f++){if(!keep[f])continue;if(bp.has(f))paint.push(o/9);for(let k=0;k<3;k++){const v=f*3+k;Pn[o+k*3]=P.getX(v)-shift[0];Pn[o+k*3+1]=P.getY(v)-shift[1];Pn[o+k*3+2]=P.getZ(v)-shift[2];Cn[o+k*3]=C.getX(v);Cn[o+k*3+1]=C.getY(v);Cn[o+k*3+2]=C.getZ(v)}o+=9}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(Pn,3));gg.setAttribute('color',new THREE.BufferAttribute(Cn,3));gg.computeVertexNormals();gg.userData.paint=paint;return gg};
 const keepB=take.map(x=>x?0:1),mir=mkG(take,piv),nb=mkG(keepB,[0,0,0]);
 /* steering part + the mirrors (in steering-pivot space) */
 const SP=S.attributes.position,SC=S.attributes.color,sn=SP.count,mn=mir.attributes.position.count,Pn=new Float32Array((sn+mn)*3),Cn=new Float32Array((sn+mn)*3);
 Pn.set(SP.array.subarray(0,sn*3));Cn.set(SC.array.subarray(0,sn*3));Pn.set(mir.attributes.position.array,sn*3);Cn.set(mir.attributes.color.array,sn*3);
 const ns=new THREE.BufferGeometry();ns.setAttribute('position',new THREE.BufferAttribute(Pn,3));ns.setAttribute('color',new THREE.BufferAttribute(Cn,3));ns.computeVertexNormals();
 ns.userData.paint=(S.userData.paint||[]).concat(mir.userData.paint.map(f=>f+sn/3));r.parts.body=nb;r.parts.steer=ns;r.mirrors=n}
/* paint: an sRGB triple (0-1). Geometry is cloned per bike instance so two riders can share a model in different colours */
function setPaint(m,rgb){const L=rgb.map(s2l);for(const mesh of m.meshes){const g=mesh.geometry,p=g.userData.paint;if(!p||!p.length)continue;const c=g.attributes.color;for(const f of p)for(let k=0;k<3;k++)c.setXYZ(f*3+k,L[0],L[1],L[2]);c.needsUpdate=true}}
BK.PAINTS=[null,'alt',[.86,.1,.12],[.95,.55,.08],[.98,.86,.15],[.15,.75,.3],[.1,.45,.95],[.55,.2,.85],[.95,.95,.95],[.08,.08,.09]];
BK.paintOf=(d,i)=>{const p=BK.PAINTS[i%BK.PAINTS.length];return p===null?(d.paint||[.6,.6,.6]):p==='alt'?(d.alt||d.paint||[.6,.6,.6]):p};

/* bike instance: yaw group -> lean group (rolls about the tyre contact line) -> pitch group (wheelie about the rear contact, stoppie about the front)
   -> body, steering (rotates about the steering axis, carries the front wheel), rear wheel, rider */
BK.makeBike=(id,paint,rider)=>{const d=BK.byId(id),G=bikeGeos(d),I=G.info;
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.12,flatShading:true});
 const g=new THREE.Group(),lean=new THREE.Group(),pitch=new THREE.Group(),inner=new THREE.Group();g.add(lean);lean.add(pitch);pitch.add(inner);
 const meshes=[];const mk=(k,parent)=>{if(!G.parts[k])return null;const m=new THREE.Mesh(G.parts[k].clone(),mat);m.geometry.userData.paint=G.parts[k].userData.paint;parent.add(m);meshes.push(m);return m};
 mk('body',inner);
 const steer=new THREE.Group();steer.position.fromArray(I.piv);inner.add(steer);mk('steer',steer);
 const fwG=new THREE.Group();fwG.position.set(I.fw[0]-I.piv[0],I.fw[1]-I.piv[1],I.fw[2]-I.piv[2]);steer.add(fwG);mk('fw',fwG);
 const rwG=new THREE.Group();rwG.position.fromArray(I.rw);inner.add(rwG);mk('rw',rwG);
 /* contact shadow */
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(.5,I.len*.92),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-PI/2;sh.position.y=.03;sh.renderOrder=1;g.add(sh);
 const axis=new THREE.Vector3(I.axis[0],I.axis[1],I.axis[2]).normalize();
 const m={d,I,g,lean,pitch,inner,steer,fwG,rwG,meshes,sh,axis,mat,spinF:0,spinR:0,paint:paint||d.paint};
 setPaint(m,m.paint);
 if(rider){m.rider=BK.makeRider(rider);inner.add(m.rider.g)}
 return m};
BK.setPaint=setPaint;
const _q=new THREE.Quaternion();
/* pose: lean (rad, + = right), pitch (rad, + = front up), steer (rad, + = right), wheel spin increments */
BK.poseBike=(m,lean,pitch,steer,dF,dR)=>{m.lean.rotation.z=lean;
 const zp=pitch>=0?m.I.rw[2]:m.I.fw[2],a=-pitch;m.pitch.rotation.x=a; /* keep the pivot (ground contact under the wheel that stays down) fixed: offset = pivot - R*pivot */
 m.pitch.position.set(0,zp*Math.sin(a),zp-zp*Math.cos(a));
 _q.setFromAxisAngle(m.axis,-steer);m.steer.quaternion.copy(_q);
 m.spinF+=dF;m.spinR+=dR;m.fwG.rotation.x=m.spinF;m.rwG.rotation.x=m.spinR;
 m.sh.visible=true};
BK.disposeBike=m=>{if(!m)return;for(const x of m.meshes)x.geometry.dispose();m.mat.dispose();if(m.rider)BK.disposeRider(m.rider);if(m.g.parent)m.g.parent.remove(m.g)};

/* ---------------- rider: low-poly suit and helmet, two-bone IK for arms and legs ---------------- */
const RLAY={own:[1,2]};/* layer 1/2: P1/P2's own helmet and torso (hidden from that rider's own head camera) */
BK.makeRider=o=>{o=o||{};const suit=o.suit||0x2a3f6a,trim=o.trim||0xd8dde2,helm=o.helm||0xe8e8e8,dark=0x15171a;
 const ml=c=>new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:.05,flatShading:true});
 const Ms={suit:ml(suit),trim:ml(trim),helm:new THREE.MeshStandardMaterial({color:helm,roughness:.3,metalness:.2,flatShading:true}),dark:ml(dark),visor:new THREE.MeshStandardMaterial({color:0x101418,roughness:.15,metalness:.6,flatShading:true})};
 const g=new THREE.Group(),own=[];
 const seg=(r0,r1,mat,n)=>{const geo=new THREE.CylinderGeometry(r1,r0,1,n||6,1);geo.translate(0,.5,0);const m=new THREE.Mesh(geo,mat);g.add(m);return m};
 const blk=(w,h,d,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);g.add(m);return m};
 const R={g,Ms,own,
  hips:blk(.34,.18,.26,Ms.suit),chest:blk(.42,.5,.26,Ms.suit),stripe:blk(.43,.08,.27,Ms.trim),
  head:new THREE.Mesh(new THREE.IcosahedronGeometry(.155,1),Ms.helm),visor:blk(.2,.075,.08,Ms.visor),
  ua:[seg(.06,.05,Ms.suit),seg(.06,.05,Ms.suit)],fa:[seg(.05,.042,Ms.suit),seg(.05,.042,Ms.suit)],hand:[blk(.08,.06,.11,Ms.dark),blk(.08,.06,.11,Ms.dark)],
  th:[seg(.085,.07,Ms.suit),seg(.085,.07,Ms.suit)],sh:[seg(.065,.05,Ms.dark),seg(.065,.05,Ms.dark)],boot:[blk(.1,.11,.27,Ms.dark),blk(.1,.11,.27,Ms.dark)]};
 R.head.scale.set(1,1.06,1.12);g.add(R.head);
 own.push(R.head,R.visor,R.chest,R.stripe,R.hips,R.ua[0],R.ua[1]);
 g.traverse(x=>{if(x.isMesh){x.castShadow=false}});
 R.st={};return R};
BK.riderLayer=(R,k)=>{/* k: 0/1 (the player whose head camera should not see this rider's helmet and torso) */for(const m of R.own)m.layers.set(1+k)};
BK.disposeRider=R=>{R.g.traverse(x=>{if(x.isMesh)x.geometry.dispose()});for(const k in R.Ms)R.Ms[k].dispose()};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),_a=V3(0,0,0),_b=V3(0,0,0),_c=V3(0,0,0),_up=V3(0,1,0);
/* place a unit cylinder (along +y from its base) between two points */
function bone(m,a,b){_a.subVectors(b,a);const L=_a.length()||1e-4;m.position.copy(a);m.scale.set(1,L,1);m.quaternion.setFromUnitVectors(_up,_a.multiplyScalar(1/L))}
/* two-bone IK: root, target, lengths, pole hint -> joint */
function ik(root,tgt,l1,l2,pole,out){_a.subVectors(tgt,root);let d=_a.length();const dmax=l1+l2-1e-3;if(d>dmax){_a.multiplyScalar(dmax/d);d=dmax}if(d<1e-3)d=1e-3;
 const dir=_a.clone().multiplyScalar(1/d),al=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-al*al));
 _b.copy(pole).sub(root);_b.addScaledVector(dir,-_b.dot(dir));if(_b.lengthSq()<1e-6)_b.set(0,-1,0);_b.normalize();
 out.copy(root).addScaledVector(dir,al).addScaledVector(_b,h);return root.clone().addScaledVector(dir,d)}
/* pose description (bike space, metres): hip (hip-centre position), lean (torso pitch forward from vertical, rad), side (torso roll), hands [L,R] targets or null for grips,
   feet [L,R] targets, look (head pitch) */
BK.poseRider=(m,ps,gripW)=>{const R=m.rider,I=m.I;if(!R)return;
 const hip=V3(ps.hip[0],ps.hip[1],ps.hip[2]);const lean=ps.lean,roll=ps.side||0;
 const fwd=V3(0,Math.cos(lean),Math.sin(lean)).applyAxisAngle(V3(0,0,1),roll);/* torso up direction */
 R.hips.position.copy(hip);R.hips.rotation.set(-lean*.5,0,roll);
 const sh=hip.clone().addScaledVector(fwd,.5);/* shoulder centre */
 R.chest.position.copy(hip).addScaledVector(fwd,.27);R.chest.quaternion.setFromUnitVectors(_up,fwd);R.stripe.position.copy(hip).addScaledVector(fwd,.34);R.stripe.quaternion.copy(R.chest.quaternion);
 const hd=sh.clone().addScaledVector(fwd,.21).add(V3(0,0,.03));R.head.position.copy(hd);R.head.rotation.set(-(ps.look||0)+lean*.15,ps.turn||0,roll*.5);
 R.visor.position.copy(hd).add(V3(0,.01,.135).applyEuler(R.head.rotation));R.visor.rotation.copy(R.head.rotation);
 R.st.head=hd;R.st.fwd=fwd;
 /* arms */
 const sx=V3(1,0,0).applyAxisAngle(V3(0,0,1),roll);
 for(let s=0;s<2;s++){const sg=s?-1:1;const S=sh.clone().addScaledVector(sx,.2*sg);let H;
  if(ps.hands&&ps.hands[s])H=V3(ps.hands[s][0]*sg,ps.hands[s][1],ps.hands[s][2]);
  else{/* the grip, carried by the steering head */H=V3(I.grip[0]*sg*(gripW||1),I.grip[1],I.grip[2]);H.sub(m.steer.position);H.applyQuaternion(m.steer.quaternion);H.add(m.steer.position)}
  const pole=S.clone().add(V3(.5*sg,-.35,-.3)),el=V3(0,0,0);const hh=ik(S,H,.31,.3,pole,el);
  bone(R.ua[s],S,el);bone(R.fa[s],el,hh);R.hand[s].position.copy(hh);R.hand[s].quaternion.setFromUnitVectors(V3(0,0,1),_c.subVectors(hh,el).normalize())}
 /* legs */
 for(let s=0;s<2;s++){const sg=s?-1:1;const Hj=hip.clone().addScaledVector(sx,.11*sg).add(V3(0,-.04,0));const F=V3(ps.feet[s][0]*sg,ps.feet[s][1],ps.feet[s][2]);
  const pole=Hj.clone().add(V3(.25*sg,.1,.9)),kn=V3(0,0,0);const ff=ik(Hj,F,.45,.45,pole,kn);bone(R.th[s],Hj,kn);bone(R.sh[s],kn,ff);
  R.boot[s].position.copy(ff).add(V3(0,-.02,.06));R.boot[s].rotation.set(0,0,0)}};
BK.headWorld=(m,out)=>{const R=m.rider;m.g.updateMatrixWorld();/* the bike moved this frame after the pose: refresh, or the camera trails the head at speed */if(!R||!R.st.head)return out.set(0,1.6,0);out.copy(R.st.head);m.inner.localToWorld(out);return out};

/* ---------------- endless highway ---------------- */
/* curvilinear frame: s along the road, d across it (0 = median centre, + = right). Our carriageway is d 1.8..16.2 (4 lanes of 3.6 m), the oncoming one mirrors it */
const SP=4,LW=3.6,NL=4,D0=1.8,EDGE=D0+LW*NL,SHO=EDGE+2.6;
BK.ROAD={SP,LW,NL,D0,EDGE,SHO,laneD:i=>D0+LW*(i+.5)};
BK.makeRoad=seed=>{const r=rng(seed||7),ph=[r()*9,r()*9,r()*9,r()*9,r()*9];
 let cap=4096,X=new Float64Array(cap),Z=new Float64Array(cap),H=new Float64Array(cap),Y=new Float64Array(cap),n=1;X[0]=0;Z[0]=0;H[0]=0;
 const kap=s=>{const w=ss(.2,.8,Math.sin(s/2600+ph[0])*.5+.5);return(.00075*Math.sin(s/1500+ph[1])+.00045*Math.sin(s/610+ph[2]))*w};
 const yAt=s=>13*Math.sin(s/1150+ph[3])+5*Math.sin(s/430+ph[4]);Y[0]=yAt(0);
 const grow=()=>{cap*=2;for(const k of['X','Z','H','Y']){}const nx=new Float64Array(cap);nx.set(X);X=nx;const nz=new Float64Array(cap);nz.set(Z);Z=nz;const nh=new Float64Array(cap);nh.set(H);H=nh;const ny=new Float64Array(cap);ny.set(Y);Y=ny};
 const ensure=s=>{const need=Math.ceil(s/SP)+2;while(n<need){if(n>=cap)grow();const s0=(n-1)*SP,h=H[n-1]+kap(s0+SP/2)*SP;H[n]=h;const hm=(H[n-1]+h)/2;X[n]=X[n-1]+Math.sin(hm)*SP;Z[n]=Z[n-1]+Math.cos(hm)*SP;Y[n]=yAt(n*SP);n++}};
 const R={seed:seed||7,kap,yAt,ensure,
  /* frame at s: position of the centreline, heading, height */
  at(s,o){s=Math.max(0,s);ensure(s+SP);const i=Math.floor(s/SP),f=s/SP-i;o=o||{};o.x=X[i]+(X[i+1]-X[i])*f;o.z=Z[i]+(Z[i+1]-Z[i])*f;o.h=H[i]+(H[i+1]-H[i])*f;o.y=Y[i]+(Y[i+1]-Y[i])*f;o.g=(Y[i+1]-Y[i])/SP;return o},
  /* world position of (s,d) */
  pos(s,d,o){const f=R.at(s,_fr);o=o||{};o.x=f.x-Math.cos(f.h)*d;o.z=f.z+Math.sin(f.h)*d;o.y=f.y+R.camber(d);o.h=f.h;o.g=f.g;return o},
  /* the lanes are one flat quad per side from D0-.3 to EDGE, so the height between is the straight line across it: anything placed on the road
     (traffic, bikes, paint) follows that line and sits exactly on the surface, where the old stepped curve left whole lanes 3-5 cm in the air or sunk */
  camber(d){const a=Math.abs(d),a0=D0-.3,ce=-.11;return a<a0?.05:a<EDGE?.05+(ce-.05)*(a-a0)/(EDGE-a0):a<SHO?-.11-(a-EDGE)*.02:-.16},
  /* exits: an extra lane on the right from e-260 to the gore at e, the ramp curls away beyond the guardrail */
  exitNear(s){const E=3100,k=Math.round((s-1400)/E);const e=1400+k*E+((k*7919)%5)*90;return k>=1?e:-1e9}};
 const _fr={};return R};
/* exit ramp offset beyond the gore (m to the right of the lane centre line), and height */
BK.rampD=t=>t<=0?0:t*t/170*.55+t*.06;BK.rampY=t=>t<=0?0:Math.min(6.5,t*.035);

/* ---------------- scenery: chunks of 100 m built ahead, dropped behind ---------------- */
const CH=100;BK.CH=CH;
const SIGNS=['Poly Bay','Facet City','Vertex Hills','Low Poly Jct','Bevel Point','Gouraud Park','Quad Falls','Mesh Harbor','Normal Heights','Shader Springs','Pixel Pass','Lambert'];
function signTex(lines,exit){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#0f6a3a';x.fillRect(0,0,512,256);x.strokeStyle='#f3f3f3';x.lineWidth=8;x.strokeRect(10,10,492,236);
 x.fillStyle='#f3f3f3';x.textAlign='center';if(exit){x.fillStyle='#f3f3f3';x.fillRect(330,20,160,52);x.fillStyle='#0f6a3a';x.font='bold 34px sans-serif';x.fillText('EXIT '+exit,410,58);x.fillStyle='#f3f3f3'}
 x.font='bold 54px sans-serif';x.fillText(lines[0],256,exit?140:112);x.font='38px sans-serif';if(lines[1])x.fillText(lines[1],256,exit?205:185);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
BK.TOD={
 day:{n:'Day',sky:['#3a76c4','#9cc6ee','#dbe9f3'],fog:0xd3e2ee,fogN:260,fogF:1500,hemi:[0xdfe9f2,0x5f6a55,.95],sun:[0xfff1d8,.95],sunPos:[-.4,.75,.5],lamps:0,exp:1.05,disc:0xfff4d6},
 dusk:{n:'Sunset',sky:['#2b2a5c','#c45a6a','#f7b061'],fog:0xe7a27a,fogN:220,fogF:1350,hemi:[0xffc9a0,0x4a3a4a,.8],sun:[0xffb070,.85],sunPos:[.1,.12,1],lamps:1,exp:1.08,disc:0xffd6a0},
 night:{n:'Night',sky:['#03050c','#0b1630','#1d2a44'],fog:0x101826,fogN:120,fogF:900,hemi:[0x5068a0,0x10141c,.42],sun:[0x9ab0e0,.25],sunPos:[.3,.6,-.4],lamps:2,exp:1.25,disc:0xdfe8ff}};
BK.makeWorld=(scene,road,opt)=>{opt=opt||{};const tod=BK.TOD[opt.tod]||BK.TOD.day;const chunks=new Map(),mat=M_VC();
 const lampMat=new THREE.MeshBasicMaterial({color:tod.lamps?0xffe3a8:0xd0d4d8});const signMats=[];
 const exitNo=e=>11+Math.round(e/3100)*3;
 const signFor=(k,exit,name,mi)=>{name=name||SIGNS[k%SIGNS.length];mi=mi||(2+k%5)+' MILES';const key=name+'|'+exit+'|'+mi;let m=signMats.find(x=>x.key===key);if(!m){m={key,mat:new THREE.MeshBasicMaterial({map:signTex([name,mi],exit),toneMapped:false})};if(tod.lamps>1)m.mat.color.setScalar(.6);signMats.push(m)}return m.mat};
 const hill=(x,z)=>22*Math.sin(x*.0047+1.3)*Math.sin(z*.0039+.4)+11*Math.sin(x*.013+z*.011)+5*Math.sin(x*.031-z*.027);
 const C={asph:hexRGB(0x56585b),asph2:hexRGB(0x525457),sho:hexRGB(0x5d5f62),fence:hexRGB(0x34373a),fpost:hexRGB(0x55585c),hedge:[hexRGB(0x2f5a2c),hexRGB(0x3a6a32),hexRGB(0x44763a)],white:hexRGB(0xe8e8e2),yel:hexRGB(0xe0b22a),conc:hexRGB(0xb7b4ac),conc2:hexRGB(0x9a978f),rail:hexRGB(0xc4c8cc),post:hexRGB(0x7a7e84),
  g1:hexRGB(0x5f8a3e),g2:hexRGB(0x6f9a46),g3:hexRGB(0x8a9a52),dirt:hexRGB(0x8b7a58),trunk:hexRGB(0x5a4232),leaf:[hexRGB(0x2f6a34),hexRGB(0x3c7a3a),hexRGB(0x4f8a3a),hexRGB(0x2a5a3a)],rock:hexRGB(0x8d8a86),
  pole:hexRGB(0x8c9096),steel:hexRGB(0x6c7178),cush:hexRGB(0xf2c014),dark:hexRGB(0x22252a)};
 const fr={},pp={};
 /* low-poly round canopy: a jittered icosahedron, lit faces a shade lighter on top */
 const IV=(()=>{const t=(1+Math.sqrt(5))/2,v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(a=>{const l=Math.hypot(...a);return a.map(x=>x/l)});return v})(),IF=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 let canopy=null;
 /* regions: the highway runs through a random sequence of landscapes, ~1.7 km each, blended over 240 m */
 /* Nov 2: one landscape, as asked: the highway through gentle grassy plains, a few trees, and herds of the game's own animals */
 const REG=[{n:'Plains',k:'plains',g:[0x6f9a46,0x7ea64c,0x8f9f55],amp:.55,lift:3,leaf:[0x3c7a3a,0x4f8a3a,0x2f6a34,0x5d9440]}];
 for(const R of REG){R.c=R.g.map(hexRGB);R.lc=R.leaf.map(hexRGB)}
 const CX={sea:hexRGB(0x2a6a92),sea2:hexRGB(0x3277a0),sand:hexRGB(0xe6d6a2),snow:hexRGB(0xeef2f4),barn:hexRGB(0x9a2e24),roof:hexRGB(0x4a4a4e),bale:hexRGB(0xd8b85a),white:hexRGB(0xeeeeea),
  cact:hexRGB(0x4f7f3c),mesa:hexRGB(0xa45a38),mesa2:hexRGB(0xc27a4e),palm:hexRGB(0x8a6a48),bld:[0x8a8f96,0xb8b2a6,0x6c7480,0xa8a090,0x5d6672].map(hexRGB),win:[0,0,0],winD:hexRGB(0x2c3644)};
 const RL=1700,BL=240,seq=[],rs=rng(road.seed*131+5);
 const regK=k=>{while(seq.length<=k){const p=seq.length?seq[seq.length-1]:-1;seq.push(p<0?(rs()*REG.length)|0:(p+1+((rs()*(REG.length-1))|0))%REG.length)}return REG[seq[k]]};
 const RA={};const regAt=s=>{const k=Math.max(0,Math.floor(s/RL)),f=s-k*RL;RA.A=regK(k);RA.B=regK(k+1);RA.t=f>RL-BL?ss(RL-BL,RL,f):0;return RA};
 const wOf=(R,key)=>(R.A.k===key?1-R.t:0)+(R.B.k===key?R.t:0);
 const dith=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)};
 const pickR=(s,b)=>{const R=regAt(s);return dith(s,b)<R.t?R.B:R.A};
 /* terrain height at (s, dd metres past the verge base) on side sg */
 const ground=(s,d,dd,sg)=>{road.pos(s,d,pp);const R=regAt(s),amp=lp(R.A.amp,R.B.amp,R.t),lift=lp(R.A.lift,R.B.lift,R.t),fl=ss(10,70,dd);
  let y=pp.y-.35*ss(0,2,dd)+(hill(pp.x,pp.z)*amp+lift)*fl*fl;if(sg>0){const w=wOf(R,'coast')*ss(22,52,dd);if(w>0)y=lp(y,pp.y-4.5,w)}return y};
 function build(ci){const gb=new GB(),gm=new GB(),r=rng(ci*977+13),s0=ci*CH,s1=s0+CH,N=Math.round(CH/SP);road.ensure(s1+SP);
  const W=(s,d,dy,o)=>{road.pos(s,d,pp);return[pp.x,pp.y+(dy||0),pp.z]};
  const ex=road.exitNear(s0+CH/2),hasEx=ex>-1e8;
  const extraAt=s=>{if(!hasEx)return 0;/* width of the exit lane at s */return s<ex-260?0:s<ex-200?LW*ss(ex-260,ex-200,s):s<=ex?LW:0};
  /* road surface rows */
  for(let k=0;k<N;k++){const a=s0+k*SP,b=a+SP;
   const strip=(d0,d1,col,dy)=>gb.quad(W(a,d0,dy),W(a,d1,dy),W(b,d1,dy),W(b,d0,dy),col);
   const xa=extraAt(a),xb=extraAt(b);
   for(const sg of[1,-1]){/* lanes as one strip each side, the shoulders a lighter grey */
    const L=(d0,d1,col,dy)=>{if(sg>0)strip(d0,d1,col,dy);else strip(-d1,-d0,col,dy)};
    L(D0-.3,EDGE,(k+ci)%2?C.asph:C.asph2);
    if(sg>0&&(xa>0||xb>0)){gb.quad(W(a,EDGE),W(a,EDGE+xa),W(b,EDGE+xb),W(b,EDGE),C.asph);gb.quad(W(a,EDGE+xa),W(a,SHO+xa),W(b,SHO+xb),W(b,EDGE+xb),C.sho)}
    else L(EDGE,SHO,C.sho);
    L(.6,D0-.3,C.sho)}
   /* verges and terrain out to 280 m each side */
   const DS=[0,1.4,6,14,28,50,85,135,200,280];
   for(const sg of[1,-1]){const base=sg>0?SHO+Math.max(xa,xb):SHO;
    for(let j=0;j<DS.length-1;j++){const d0=base+DS[j],d1=base+DS[j+1];
     const T=(s,d)=>{const y=ground(s,d*sg,d-base,sg);return[pp.x,y,pp.z]};
     const p00=T(a,d0),p01=T(a,d1),p10=T(b,d0),p11=T(b,d1);const hh=(p01[1]+p11[1])/2-(p00[1]+p10[1])/2;
     const RG=pickR(a,j*7+sg),g=RG.c,ry=road.at(a,fr).y,up=(p01[1]+p11[1])/2-ry;let col;
     if(RG.k==='coast'&&sg>0&&j>=3)col=j===3?CX.sand:(Math.floor(a/16)+j)%2?CX.sea:CX.sea2;
     else if(j===0)col=g[0];
     else if(RG.k==='alpine'&&up>40)col=CX.snow;
     else if(hh>3.5)col=g[2];
     else if(RG.k==='farm'&&j>=2)col=(Math.floor(a/40)+j+(sg>0?0:1))%2?g[1]:g[0];
     else col=(Math.floor(a/24)+j+ci)%3===0?g[1]:g[0];
     if(sg>0){gb.quad(p00,p01,p11,p10,col)}else{gb.quad(p00,p10,p11,p01,col)}}}
   /* markings: dashes 3 m every 12 m, solid edges */
   const mk=(d,w,col,s_,e_)=>{gm.quad(W(s_,d-w,.025),W(s_,d+w,.025),W(e_,d+w,.025),W(e_,d-w,.025),col)};
   for(const sg of[1,-1]){mk(sg*(EDGE-.15),.08,C.white,a,b);mk(sg*(D0+.12),.08,C.yel,a,b);
    if(Math.floor(a/12)!==Math.floor((a+SP*.75)/12)||((a%12)<3)){}
    for(let l=1;l<NL;l++){const dl=sg*(D0+LW*l);/* 8 m dashes, 12 m gaps */for(let t=Math.floor(a/20)*20;t<b;t+=20){const lo=Math.max(a,t),hi=Math.min(b,t+8);if(hi>lo)mk(dl,.08,C.white,lo,hi)}}}
   /* median: concrete barrier */
   /* median (after the reference highway): a clipped hedge between two guardrails */
   {gb.quad(W(a,-.45,.02),W(a,.45,.02),W(b,.45,.02),W(b,-.45,.02),C.dirt);
    const hc=C.hedge[(k+ci)%3],h1=.75+.25*Math.sin(a*.37+ci),h2=.75+.25*Math.sin(b*.37+ci);
    gb.quad(W(a,-.4,0),W(a,-.32,h1),W(b,-.32,h2),W(b,-.4,0),hc);gb.quad(W(a,.32,h1),W(a,.4,0),W(b,.4,0),W(b,.32,h2),hc);gb.quad(W(a,-.32,h1),W(a,.32,h1),W(b,.32,h2),W(b,-.32,h2),C.hedge[(k+ci+1)%3]);
    for(const sg of[1,-1]){const dg=sg*.55;gb.quad(W(a,dg,.45),W(a,dg,.75),W(b,dg,.75),W(b,dg,.45),C.rail);gb.quad(W(a,dg,.75),W(a,dg,.45),W(b,dg,.45),W(b,dg,.75),C.rail);const pp_=W(a,sg*.62,0);gb.box(pp_[0],pp_[1]+.36,pp_[2],.05,.36,.05,C.post,road.at(a,fr).h)}}
   /* guardrails on both outer edges (pushed out along the exit lane) */
   for(const sg of[1,-1]){const ga=sg*(SHO+.2+(sg>0?xa:0)),gb_=sg*(SHO+.2+(sg>0?xb:0));
    gb.quad(W(a,ga,.45),W(a,ga,.75),W(b,gb_,.75),W(b,gb_,.45),C.rail);gb.quad(W(a,ga,.75),W(a,ga,.45),W(b,gb_,.45),W(b,gb_,.75),C.rail);
    if(k%1===0){const p=W(a,ga+sg*.08,.0);gb.box(p[0],p[1]+.36,p[2],.05,.36,.05,C.post,road.at(a,fr).h)}}
   /* a dark mesh fence behind the outer rails, as on the reference highway */
   for(const sg of[1,-1]){if(sg>0&&hasEx&&a>ex-320&&a<ex+280)continue;const d=sg*(SHO+1.7);gb.quad(W(a,d,0),W(a,d,2.6),W(b,d,2.6),W(b,d,0),C.fence);gb.quad(W(a,d,2.6),W(a,d,0),W(b,d,0),W(b,d,2.6),C.fence);
    if(k%1===0){const p_=W(a,d,0);gb.box(p_[0],p_[1]+1.35,p_[2],.06,1.35,.06,C.fpost,road.at(a,fr).h)}}
   /* city: noise walls behind the rails */
   {const R=regAt(a);if(wOf(R,'city')>.5)for(const sg of[1,-1]){if(sg>0&&(hasEx&&a>ex-300&&a<ex+300))continue;const d=sg*(SHO+1.8);gb.quad(W(a,d,0),W(a,d,4.2),W(b,d,4.2),W(b,d,0),(k%2)?C.conc:C.conc2);gb.quad(W(a,d,4.2),W(a,d,0),W(b,d,0),W(b,d,4.2),C.conc2)}}
   /* the exit lane's dashed line and the gore */
   if(hasEx&&xa>0){const t0=Math.ceil(a/6)*6;for(let t=t0;t<b;t+=6)if(t>ex-200)mk(EDGE+.05,.12,C.white,t,Math.min(t+3,b))}
  }
  /* exit gore: crash cushion, the ramp curling off to the right with its own rails */
  if(hasEx&&ex>=s0&&ex<s1){const p=W(ex,SHO+.2,0);gb.box(p[0],p[1]+.5,p[2],.5,.5,.9,C.cush,road.at(ex,fr).h);
   for(let t=0;t<260;t+=8){const u=t+8,dA=EDGE+LW/2+BK.rampD(t),dB=EDGE+LW/2+BK.rampD(u),yA=BK.rampY(t),yB=BK.rampY(u);
    const R2=(s,d,y)=>W(ex+s,d,y);
    gb.quad(R2(t,dA-2.6,yA),R2(t,dA+2.6,yA),R2(u,dB+2.6,yB),R2(u,dB-2.6,yB),C.asph);
    gb.quad(R2(t,dA-2.6,yA-1.5),R2(t,dA-2.6,yA),R2(u,dB-2.6,yB),R2(u,dB-2.6,yB-1.5),C.conc2);
    gb.quad(R2(t,dA+2.6,yA),R2(t,dA+2.6,yA-1.5),R2(u,dB+2.6,yB-1.5),R2(u,dB+2.6,yB),C.conc2);
    gb.quad(R2(t,dA+2.6,yA+.45),R2(t,dA+2.6,yA+.75),R2(u,dB+2.6,yB+.75),R2(u,dB+2.6,yB+.45),C.rail);
    gm.quad(R2(t,dA-2.45,yA+.025),R2(t,dA-2.3,yA+.025),R2(u,dB-2.3,yB+.025),R2(u,dB-2.45,yB+.025),C.white)}}
  /* median lamp posts every 60 m (both arms) */
  for(let s=Math.ceil(s0/50)*50;s<s1;s+=50)for(const sg of[1,-1]){if(sg>0&&hasEx&&s>ex-320&&s<ex+280)continue;const ss_=s+(sg<0?25:0);if(ss_>=s1)continue;const f=road.at(ss_,fr),p=W(ss_,sg*(SHO+.9),0);gb.box(p[0],p[1]+5,p[2],.1,5,.1,C.pole,f.h);
   const q1=W(ss_,sg*(SHO+.3),10.4),q2=W(ss_,sg*(SHO-2.2),10.6);gb.box((p[0]+q1[0])/2,q1[1]-.15,(p[2]+q1[2])/2,.35,.05,.06,C.pole,f.h+PI/2);gb.box((q1[0]+q2[0])/2,q2[1]-.1,(q1[2]+q2[2])/2,1.3,.05,.06,C.pole,f.h+PI/2);
   const L=W(ss_,sg*(SHO-3.1),10.45);gm.box(L[0],L[1],L[2],.36,.08,.18,[0,0,0],f.h,null)}
  /* sign gantry every 1600 m, an overpass every 2300 m */
  const sk=Math.floor((s0+700)/1600);for(const s of[sk*1600-700])if(s>=s0&&s<s1&&s>200){const f=road.at(s,fr);const col=C.steel;
   for(const d of[SHO+.6,D0-.8]){const p=W(s,d,0);gb.box(p[0],p[1]+3.6,p[2],.18,3.6,.18,col,f.h)}
   const mid=W(s,(SHO+D0)/2,7.1);gb.box(mid[0],mid[1],mid[2],(SHO-D0)/2+1,.22,.22,col,f.h+PI/2);
   const e2=road.exitNear(s+900),k2=Math.floor(s/1600);
   const nk=Math.floor(s/RL)+1,dist=nk*RL-s,nx=regK(nk).n,mi=dist<800?Math.max(1,Math.round(dist/100))*100+' M':(dist/1609).toFixed(1)+' MILES';
   const panels=[[EDGE-LW*1.2,e2>s&&e2<s+2200?exitNo(e2):0],[D0+LW*1.3,0]];
   for(const[d,exn]of panels){const c=W(s,d,8.2);const pm=new THREE.Mesh(new THREE.PlaneGeometry(5.6,2.8),signFor(k2+(exn?3:0),exn));pm.position.set(c[0],c[1],c[2]);pm.rotation.y=f.h+PI;gm.p.length;pm.userData.sign=1;pm.matrixAutoUpdate=false;pm.updateMatrix();pp.sign=(pp.sign||[]);pp.sign.push(pm);
    const back=W(s,d,8.2);gb.box(back[0],back[1],back[2],2.85,1.45,.06,C.steel,f.h)}}
  const ok=Math.floor((s0+1500)/2300);for(const s of[ok*2300-1500])if(s>=s0&&s<s1&&s>300){const f=road.at(s,fr);
   for(const d of[-SHO-3,0,SHO+3]){const p=W(s,d,0);gb.box(p[0],p[1]+3.4,p[2],.6,3.4,.9,C.conc,f.h)}
   const c=W(s,0,7.4);gb.box(c[0],c[1],c[2],34,.55,6,C.conc,f.h+PI/2);const c2=W(s,0,8.25);gb.box(c2[0],c2[1],c2[2],34,.3,.12,C.conc2,f.h+PI/2);
   for(const sg of[1,-1]){const e=W(s,sg*42,0);gb.box(e[0],e[1]+3.6,e[2],8,3.8,7,C.conc2,f.h+PI/2)}}
  canopy=(cx,cy,cz,rad,col)=>{const j=IV.map(v=>{const k=rad*(.82+r()*.36);return[cx+v[0]*k,cy+v[1]*k*.8,cz+v[2]*k]});const hi=[Math.min(1,col[0]*1.25),Math.min(1,col[1]*1.25),Math.min(1,col[2]*1.25)];
   for(const f of IF){const up=(IV[f[0]][1]+IV[f[1]][1]+IV[f[2]][1])>.6;gb.tri(j[f[0]],j[f[1]],j[f[2]],up?hi:col)}};
  /* a dense belt of broadleaf trees behind the fences (reference highway), then open fields */
  for(const sg of[1,-1])for(let t=s0+r()*4;t<s1;t+=4.5+r()*3){if(sg>0&&hasEx&&t>ex-320&&t<ex+280)continue;for(let row=0;row<2;row++){const d=sg*(SHO+4+row*5+r()*3),y=ground(t,d,Math.abs(d)-SHO,sg);const x=pp.x,z=pp.z,hgt=6+r()*4,lc=C.hedge[(r()*3)|0];
   gb.box(x,y+hgt*.25,z,.16,hgt*.25,.16,C.trunk,r()*3);canopy(x,y+hgt*.62,z,hgt*.27,lc);if(r()<.6)canopy(x+(r()-.5)*1.6,y+hgt*.82,z+(r()-.5)*1.6,hgt*.19,C.hedge[(r()*3)|0])}}
  /* scenery by region: trees, farms, desert, coast, mountains, city blocks */
  const cone=(x,y,z,hgt,lc)=>{gb.box(x,y+hgt*.18,z,.22,hgt*.2,.22,C.trunk,0);const n=6,rad=hgt*.24+.6;for(let l=0;l<2;l++){const yb=y+hgt*(.25+l*.3),yt=yb+hgt*(.55-l*.12),rr=rad*(1-l*.3);
    for(let q=0;q<n;q++){const a1=q/n*PI2,a2=(q+1)/n*PI2;gb.tri([x+Math.cos(a1)*rr,yb,z+Math.sin(a1)*rr],[x,yt,z],[x+Math.cos(a2)*rr,yb,z+Math.sin(a2)*rr],lc)}}};
  const blob=(x,y,z,hgt,lc)=>{gb.box(x,y+hgt*.25,z,.25,hgt*.25,.25,C.trunk,0);const rr=hgt*.32;gb.box(x,y+hgt*.68,z,rr,hgt*.24,rr,lc,r()*3);gb.box(x,y+hgt*.82,z,rr*.7,hgt*.16,rr*.7,lc,r()*3)};
  const palm=(x,y,z,hgt)=>{const lx=(r()-.5)*1.4,lz=(r()-.5)*1.4;for(let q=0;q<4;q++){const t0=q/4,t1=(q+1)/4;gb.box(x+lx*t0*t0,y+hgt*(t0+t1)/2,z+lz*t0*t0,.2-.03*q,hgt/8,.2-.03*q,CX.palm,q)}
   const tx=x+lx,ty=y+hgt,tz=z+lz,lc=C.leaf[1];for(let q=0;q<7;q++){const a1=q/7*PI2+r()*.3,ca=Math.cos(a1),sa=Math.sin(a1),L=3.2+r(),ox=-sa*.5,oz=ca*.5;gb.tri([tx+ox,ty,tz+oz],[tx-ox,ty,tz-oz],[tx+ca*L,ty-1.3,tz+sa*L],lc);gb.tri([tx-ox,ty,tz-oz],[tx+ox,ty,tz+oz],[tx+ca*L,ty-1.3,tz+sa*L],lc)}};
  const cactus=(x,y,z,hgt)=>{gb.box(x,y+hgt/2,z,.28,hgt/2,.28,CX.cact,0);const sd=r()<.5?1:-1;gb.box(x+sd*.7,y+hgt*.5,z,.45,.16,.16,CX.cact,0);gb.box(x+sd*1.05,y+hgt*.68,z,.16,hgt*.2,.16,CX.cact,0);if(r()<.6){gb.box(x-sd*.6,y+hgt*.38,z,.35,.14,.14,CX.cact,0);gb.box(x-sd*.85,y+hgt*.5,z,.14,hgt*.14,.14,CX.cact,0)}};
  const gable=(x,y,z,hx,hy,hz,rot,col)=>{const s_=Math.sin(rot),c_=Math.cos(rot);const V=(u,v,w)=>[x+u*c_+w*s_,y+v,z-u*s_+w*c_];
   gb.quad(V(-hx,0,-hz),V(-hx,0,hz),V(0,hy,hz),V(0,hy,-hz),col);gb.quad(V(hx,0,hz),V(hx,0,-hz),V(0,hy,-hz),V(0,hy,hz),col);
   gb.tri(V(-hx,0,hz),V(hx,0,hz),V(0,hy,hz),CX.barn);gb.tri(V(hx,0,-hz),V(-hx,0,-hz),V(0,hy,-hz),CX.barn)};
  const yAtD=(s,d)=>ground(s,d,Math.abs(d)-SHO,Math.sign(d));
  const nt=14+Math.floor(r()*8);for(let i=0;i<nt;i++){const s=s0+r()*CH,sg=r()<.5?-1:1,RG=pickR(s,i),K=RG.k;
   let d=sg*(SHO+18+Math.pow(r(),1.6)*160);if(K==='coast'&&sg>0)d=SHO+6+r()*16;
   const y=yAtD(s,d),x=pp.x,z=pp.z,f=road.at(s,fr),lc=RG.lc[(r()*RG.lc.length)|0],q=r();
   if(K==='plains'){if(q<.16)blob(x,y,z,5+r()*4,lc);else if(q<.22)cone(x,y,z,6+r()*5,lc);else if(q<.26)gb.box(x,y+.4,z,.8+r(),.5+r()*.4,.7+r(),C.rock,r()*3)}
   else if(K==='forest'||K==='alpine'){if(q<.1)gb.box(x,y+.6,z,1.2+r(),.9+r()*.6,1+r(),C.rock,r()*3);else cone(x,y,z,K==='alpine'?8+r()*9:5+r()*7,lc)}
   else if(K==='farm'){if(q<.12&&Math.abs(d)>40){const w=5+r()*2,dp=8+r()*3,hb=3.2+r();gb.box(x,y+hb,z,w,hb,dp,CX.barn,f.h);gable(x,y+hb*2,z,w+.3,3.2,dp+.3,f.h,CX.roof);gb.box(x+5,y+5,z,1.6,5,1.6,CX.white,0)}
    else if(q<.42){for(let n=0;n<3;n++)gb.box(x+n*2.6,y+.55,z+r()*2,.75,.6,.75,CX.bale,r())}
    else if(q<.5&&Math.abs(d)>60&&i%3===0){const ht=28+r()*8;gb.box(x,y+ht/2,z,.45,ht/2,.45,CX.white,0);const hy=y+ht;gb.box(x,hy,z,.6,.6,1.6,CX.white,f.h);
     const u=[Math.sin(f.h),Math.cos(f.h)],ph=r()*PI2;for(let n=0;n<3;n++){const t=ph+n*PI2/3,ux=Math.cos(t),uy=Math.sin(t);const L=13;
      gb.tri([x-u[1]*.0+u[0]*.0,hy,z],[x+u[0]*ux*L+u[1]*.6,hy+uy*L,z+u[1]*ux*L-u[0]*.6],[x+u[0]*ux*L-u[1]*.6,hy+uy*L,z+u[1]*ux*L+u[0]*.6],CX.white);
      gb.tri([x+u[0]*ux*L-u[1]*.6,hy+uy*L,z+u[1]*ux*L+u[0]*.6],[x+u[0]*ux*L+u[1]*.6,hy+uy*L,z+u[1]*ux*L-u[0]*.6],[x,hy,z],CX.white)}}
    else if(q<.62)blob(x,y,z,5+r()*4,lc)}
   else if(K==='desert'){if(q<.12&&Math.abs(d)>90){const w=18+r()*30,h=14+r()*26;gb.box(x,y+h/2-2,z,w,h/2+2,w*.6,CX.mesa,r()*3);gb.box(x,y+h+.6,z,w*.85,.9,w*.5,CX.mesa2,r()*3)}
    else if(q<.6)cactus(x,y,z,2.5+r()*3);else gb.box(x,y+.4,z,.8+r(),.5+r()*.5,.7+r(),CX.mesa2,r()*3)}
   else if(K==='coast'){if(sg>0){if(q<.75)palm(x,y,z,7+r()*4)}else if(q<.5)palm(x,y,z,7+r()*4);else blob(x,y,z,5+r()*3,lc)}
   else if(K==='city'){if(i%2)continue;const w=6+r()*10,dp=6+r()*10,h=12+Math.pow(r(),1.5)*55,col=CX.bld[(r()*CX.bld.length)|0];d=sg*(SHO+8+w+r()*120);const y2=yAtD(s,d),x2=pp.x,z2=pp.z;gb.box(x2,y2+h/2-1,z2,w,h/2+1,dp,col,f.h);
    for(let fy=4;fy<h-2;fy+=3.6)gm.box(x2,y2+fy,z2,w+.06,.4,dp+.06,tod.lamps?CX.win:CX.winD,f.h);if(r()<.3)gb.box(x2,y2+h+1.2,z2,w*.4,1.2,dp*.4,C.steel,f.h)}}
  const grp=new THREE.Group();const m1=new THREE.Mesh(gb.geo(),mat);grp.add(m1);
  /* a herd of the game's animals grazing in the fields, now and then */
  const anims=[];const AK=P.animalKit;if(AK&&P.animalsReady&&!(window.PTO&&window.PTO.animals===false)&&r()<.42){
   const pool=['Cow','Horse','WhiteHorse','Bull','Donkey','Alpaca','Deer'].filter(n=>AK.SP[n]);if(pool.length){const name=pool[(r()*pool.length)|0],sp=AK.SP[name];
    const sg=r()<.5?-1:1,hs=s0+r()*CH,hd=SHO+28+r()*110,n=3+((r()*4)|0);
    for(let i=0;i<n;i++){const s=hs+(r()-.5)*14,d=sg*(hd+(r()-.5)*12),y=yAtD(s,d),x=pp.x,z=pp.z;
     const root=AK.clone(sp),g=new THREE.Group();g.add(root);root.scale.setScalar(sp.k*(.94+r()*.12));g.position.set(x,y,z);g.rotation.y=r()*PI2;grp.add(g);
     const mx=new THREE.AnimationMixer(root);const clip=sp.clips.find(c=>c.name===(r()<.65?'Eating':'Idle'))||sp.clips[0];if(clip){const ac=mx.clipAction(clip);ac.play();ac.time=r()*clip.getClip?0:r()*clip.duration}anims.push({mx,s,g})}}}
  const m2=new THREE.Mesh(gm.geo(),new THREE.MeshBasicMaterial({vertexColors:true}));/* markings, lamp heads */grp.add(m2);
  if(tod.lamps){const g2=m2.geometry,c=g2.attributes.color;for(let i=0;i<c.count;i++)if(c.getX(i)===0&&c.getY(i)===0)c.setXYZ(i,1,.86,.6)}
  if(pp.sign){for(const s of pp.sign)grp.add(s);pp.sign=null}
  scene.add(grp);return{grp,anims,geos:[m1.geometry,m2.geometry],mats:[m2.material]}}
 const W={chunks,tod,regAt,regionName:s=>{const R=regAt(s);return(R.t>.5?R.B:R.A).n},
  /* animate the animals near the riders (far ones hold still) */
  tick(dt,sMin,sMax){for(const[k,v]of chunks){if(!v.anims||!v.anims.length)continue;for(const a of v.anims){const ds=a.s<sMin?sMin-a.s:a.s>sMax?a.s-sMax:0;if(ds<220)a.mx.update(dt)}}},
  update(sMin,sMax){const c0=Math.max(0,Math.floor((sMin-150)/CH)),c1=Math.floor((sMax+1300)/CH);
   for(const[k,v]of chunks)if(k<c0-1||k>c1+1){scene.remove(v.grp);v.geos.forEach(g=>g.dispose());v.mats.forEach(m=>m.dispose());v.grp.traverse(x=>{if(x.userData.sign)x.geometry.dispose()});chunks.delete(k)}
   let built=0;for(let k=c0;k<=c1&&built<1;k++)if(!chunks.has(k)){chunks.set(k,build(k));built++}
   return built},
  fill(sMin,sMax){let n=0;while(W.update(sMin,sMax)&&n<60)n++},
  dispose(){for(const[k,v]of chunks){scene.remove(v.grp);v.geos.forEach(g=>g.dispose());v.mats.forEach(m=>m.dispose())}chunks.clear();mat.dispose();lampMat.dispose();signMats.forEach(m=>{m.mat.map.dispose();m.mat.dispose()})}};
 return W};

/* sky dome, sun and a ring of far hills, all riding with the camera */
BK.makeSky=(scene,tod)=>{const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,tod.sky[0]);g.addColorStop(.38,tod.sky[1]);g.addColorStop(.5,tod.sky[2]);g.addColorStop(1,tod.sky[2]);x.fillStyle=g;x.fillRect(0,0,4,256);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const dome=new THREE.Mesh(new THREE.SphereGeometry(2400,24,16),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));dome.renderOrder=-10;scene.add(dome);
 const disc=new THREE.Mesh(new THREE.CircleGeometry(tod===BK.TOD.night?36:60,24),new THREE.MeshBasicMaterial({color:tod.disc,fog:false,toneMapped:false,transparent:true,opacity:.95,depthWrite:false}));disc.renderOrder=-9;scene.add(disc);
 /* far hills: a jagged ring, tinted toward the fog */
 const gb=new GB(),fc=new THREE.Color(tod.fog),hc=new THREE.Color(0x4f6a58).lerp(fc,.55),hc2=new THREE.Color(0x3d5548).lerp(fc,.45),r=rng(5);
 const n=64;let prev=null;for(let i=0;i<=n;i++){const a=i/n*PI2,h=60+r()*120+(i%7===0?90:0);const p=[Math.cos(a)*2000,h,Math.sin(a)*2000];if(prev){const col=i%2?[hc.r,hc.g,hc.b]:[hc2.r,hc2.g,hc2.b];gb.quad([prev[0],-80,prev[2]],[p[0],-80,p[2]],p,prev,col)}prev=p}
 const hills=new THREE.Mesh(gb.geo(),new THREE.MeshBasicMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide}));hills.renderOrder=-8;scene.add(hills);
 /* stars at night */
 let stars=null;if(tod===BK.TOD.night){const sp=[];const r2=rng(9);for(let i=0;i<700;i++){const a=r2()*PI2,e=Math.asin(r2()*.95+.05);sp.push(Math.cos(a)*Math.cos(e)*2300,Math.sin(e)*2300,Math.sin(a)*Math.cos(e)*2300)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false}));scene.add(stars)}
 const sd=new THREE.Vector3().fromArray(tod.sunPos).normalize();
 return{follow(cx,cy,cz){dome.position.set(cx,cy*0+cy,cz);hills.position.set(cx,cy*.2-20,cz);disc.position.set(cx+sd.x*2000,cy+sd.y*2000,cz+sd.z*2000);disc.lookAt(cx,cy,cz);if(stars)stars.position.set(cx,cy,cz)},
  dispose(){for(const m of[dome,disc,hills,stars])if(m){scene.remove(m);m.geometry.dispose();if(m.material.map)m.material.map.dispose();m.material.dispose()}}}};

/* ---------------- traffic vehicles (procedural, low poly) ---------------- */
const VT={/* length, width, height, desired speed (m/s) range, accel, kind */
 sedan:{L:4.6,W:1.82,H:1.45,v:[29,36],a:1.6},hatch:{L:4.0,W:1.75,H:1.5,v:[27,34],a:1.6},suv:{L:4.8,W:1.95,H:1.75,v:[28,35],a:1.4},pickup:{L:5.5,W:2.0,H:1.85,v:[27,33],a:1.3},
 van:{L:5.2,W:2.0,H:2.3,v:[25,31],a:1.1},box:{L:7.8,W:2.45,H:3.4,v:[23,27],a:.8},semi:{L:16.5,W:2.55,H:3.9,v:[23,26],a:.6},bus:{L:12,W:2.55,H:3.3,v:[24,27],a:.7}};
BK.VT=VT;
const PAINT_POOL=[0xb8bcc2,0x1c1e22,0xf0f0ee,0x8a1d1d,0x1f3f7a,0x6a6e74,0x2e5a3c,0xc7a046,0x4a2a5a,0xd8d2c0,0x2f2f33,0x9aa3ad,0xb03a2e,0x2d6fa8];
const vgeoCache={};
function vehGeo(kind,col){const key=kind+'|'+col;if(vgeoCache[key])return vgeoCache[key];const t=VT[kind],gb=new GB(),body=hexRGB(col),glass=hexRGB(0x1b2430),dk=hexRGB(0x111214),tyre=hexRGB(0x151515),rim=hexRGB(0x9a9ea4),chrome=hexRGB(0xc9cdd2),white=hexRGB(0xe6e6e2);
 const L=t.L,W=t.W/2,H=t.H;
 const wheel=(x,z,r,w)=>{const n=8;for(let i=0;i<n;i++){const a1=i/n*PI2,a2=(i+1)/n*PI2,p=(a,xx,rr)=>[xx,r+Math.cos(a)*rr,z+Math.sin(a)*rr];
  for(const sx of[x,-x]){const o=sx>0?w:-w;gb.quad(p(a1,sx-o,r),p(a2,sx-o,r),p(a2,sx+o,r),p(a1,sx+o,r),tyre);gb.tri([sx+o*1.02,r,z],p(a1,sx+o*1.02,r*.62),p(a2,sx+o*1.02,r*.62),rim)}}};
 if(kind==='semi'||kind==='box'||kind==='bus'||kind==='van'){
  if(kind==='semi'){const cab=3.3;gb.box(0,1.75,L/2-cab/2,W,1.25,cab/2,body);gb.box(0,3.25,L/2-cab*.6,W*.95,.45,cab*.38,body);gb.box(0,2.3,L/2-.02,W*.92,.55,.04,glass);gb.box(0,1.05,L/2+.05,W*.98,.3,.12,chrome);
   const tl=L-cab-.6;gb.box(0,2.45,-L/2+tl/2,W,1.45,tl/2,hexRGB([0xe8e8e8,0xd9d4c8,0x9aa1a8,0x8a1d1d,0x1f3f7a][(col>>3)%5]));gb.box(0,.85,-L/2+tl/2,W*.6,.25,tl/2,dk);
   for(const z of[L/2-.8,L/2-cab+.5,-L/2+1.4,-L/2+2.7])wheel(W*.85,z,.52,.17)}
  else if(kind==='box'){const cab=2.2;gb.box(0,1.45,L/2-cab/2,W*.95,1.0,cab/2,body);gb.box(0,1.95,L/2-.05,W*.85,.42,.04,glass);gb.box(0,2.1,-L/2+(L-cab-.3)/2,W,1.3,(L-cab-.3)/2,white);for(const z of[L/2-.9,-L/2+1.4])wheel(W*.85,z,.48,.18)}
  else if(kind==='bus'){gb.box(0,1.9,0,W,1.4,L/2,body);gb.box(0,2.25,0,W*1.005,.45,L/2-.6,glass);gb.box(0,2.1,L/2+.005,W*.9,.6,.02,glass);gb.box(0,.75,0,W*.98,.25,L/2*.98,white);for(const z of[L/2-2.3,-L/2+2.8])wheel(W*.86,z,.5,.18)}
  else{gb.box(0,1.25,-.15,W,1.0,L/2-.15,body);gb.box(0,1.85,L/2-.75,W*.96,.35,.35,glass);gb.box(0,.92,L/2-.25,W,.5,.25,body);gb.box(0,1.9,-L/2+.15,W*.9,.4,.02,glass);for(const z of[L/2-1,-L/2+1])wheel(W*.88,z,.38,.13)}}
 else{/* cars: lower body, a glasshouse, bumpers */const sill=.32,bh=kind==='suv'||kind==='pickup'?.78:.6,r0=kind==='hatch'?.36:.34;
  gb.box(0,sill+bh/2,0,W,bh/2,L/2,body);gb.box(0,sill+.12,L/2-.02,W*.97,.14,.06,dk);gb.box(0,sill+.12,-L/2+.02,W*.97,.14,.06,dk);
  const gl=kind==='pickup'?L*.36:kind==='hatch'?L*.62:L*.5,gz=kind==='pickup'?L*.1:kind==='hatch'?-L*.08:-L*.04,gt=sill+bh,gh=H-gt;
  const q=(x,y,z)=>[x,y,z];const fwdZ=gz+gl/2,bkZ=gz-gl/2,inF=gl*.22,inB=kind==='hatch'?gl*.06:gl*.16,Wt=W*.82;
  const A=q(-W,gt,fwdZ),B=q(W,gt,fwdZ),C=q(W,gt,bkZ),D=q(-W,gt,bkZ),E=q(-Wt,H,fwdZ-inF),F=q(Wt,H,fwdZ-inF),G=q(Wt,H,bkZ+inB),Hh=q(-Wt,H,bkZ+inB);
  gb.quad(A,B,F,E,glass);gb.quad(C,D,Hh,G,glass);gb.quad(B,C,G,F,glass);gb.quad(D,A,E,Hh,glass);gb.quad(E,F,G,Hh,body);
  if(kind==='pickup'){gb.box(0,gt+.02,-L*.28,W*.95,.04,L*.2,dk)}
  for(const z of[L/2-.85,-L/2+.85])wheel(W*.9,z,r0,.12)}
 const g=gb.geo();vgeoCache[key]=g;return g}
/* light quads per vehicle: indicators left / right (front corners + rear corners), brake lights; plus head / tail lamps baked at night */
const LM={off:new THREE.MeshBasicMaterial({color:0x5a3a10}),on:new THREE.MeshBasicMaterial({color:0xffa31a,toneMapped:false}),brOff:new THREE.MeshBasicMaterial({color:0x4a0d0d}),brOn:new THREE.MeshBasicMaterial({color:0xff2a2a,toneMapped:false}),
 head:new THREE.MeshBasicMaterial({color:0xfff6dc,toneMapped:false}),headOff:new THREE.MeshBasicMaterial({color:0xcfd3d6})};
for(const k in LM){LM[k].polygonOffset=true;LM[k].polygonOffsetFactor=-2;LM[k].polygonOffsetUnits=-2}
BK.LM=LM;
function lightGeo(pts,w,h){const gb=new GB();for(const p of pts){const yaw=p[3]||0;gb.box(p[0],p[1],p[2],w,h,.03,[1,1,1],yaw)}const g=gb.geo();g.deleteAttribute('color');return g}
const lgCache={};
/* the game's own cars (cars10 pack) for the car-sized traffic; vans, trucks, semis and buses stay hand-built */
/* Nov 2: traffic is everyday cars only (hatchbacks, wagons, saloons) in everyday paint, built fresh so no race livery leaks in */
const CARPOOL={sedan:['SEDAN','WAGON'],hatch:['HATCHBACK'],suv:['WAGON','SEDAN','HATCHBACK']},carBox={};
const EVERYDAY=[[236,236,232],[236,236,232],[176,180,184],[176,180,184],[110,114,118],[28,30,34],[28,30,34],[38,58,104],[120,30,32],[196,184,160],[70,92,74]];
function gameCar(kind,r){const C=P.C10;if(!C||!C.ready||!C.traffic||!CARPOOL[kind]||!P.CARS)return null;
 const pool=P.CARS.filter(c=>c.k10!=null&&CARPOOL[kind].includes(c.cat)&&!c.rallyOnly);if(!pool.length)return null;
 const c=pool[(r()*pool.length)|0],src=C.traffic(c.k10,EVERYDAY[(r()*EVERYDAY.length)|0]);if(!src)return null;
 let bx=carBox[c.k10];if(!bx){src.updateMatrixWorld(true);bx=carBox[c.k10]=new THREE.Box3().setFromObject(src)}
 const sz=bx.getSize(new THREE.Vector3()),gl=src.userData.gl||4.5,sc=gl/Math.max(sz.x,sz.z,.01);
 const m=src,w=new THREE.Group();w.add(m);m.scale.setScalar(sc);m.rotation.y=sz.x>sz.z?-PI/2:PI;/* model front is -Z, traffic front is +Z */
 m.position.y=-bx.min.y*sc;m.traverse(o=>{if(o.isMesh)o.castShadow=false});
 const L=Math.max(sz.x,sz.z)*sc,Wd=Math.min(sz.x,sz.z)*sc,H=sz.y*sc;return{g:w,model:m,lamps:src.userData.lamps,lift:src.userData.lift||0,L,W:Wd,H,name:c.name}}
BK.makeVehicle=(kind,col,night,rnd)=>{const gc=gameCar(kind,rnd||Math.random);const t=gc?Object.assign({},VT[kind],{L:gc.L,W:gc.W,H:gc.H}):VT[kind],g=new THREE.Group();
 if(gc)g.add(gc.g);else{const body=new THREE.Mesh(vehGeo(kind,col),BK.vmat||(BK.vmat=new THREE.MeshLambertMaterial({vertexColors:true})));g.add(body)}
 const L=t.L,W=t.W/2,yL=kind==='semi'||kind==='box'||kind==='bus'?1.05:gc?Math.min(.75,t.H*.5):.72;
 const key=gc?'g'+L.toFixed(1)+'_'+W.toFixed(2)+'_'+yL.toFixed(2):kind;let lg=lgCache[key];if(!lg){lg=lgCache[key]={
  l:lightGeo([[W-.12,yL,L/2+.02],[W-.12,yL,-L/2-.02],[W+.01,yL+.05,L/2-.8,PI/2]],.1,.06),
  r:lightGeo([[-W+.12,yL,L/2+.02],[-W+.12,yL,-L/2-.02],[-W-.01,yL+.05,L/2-.8,PI/2]],.1,.06),
  b:lightGeo([[W-.32,yL,-L/2-.03],[-W+.32,yL,-L/2-.03]],.16,.07),
  h:lightGeo([[W-.35,yL,L/2+.03],[-W+.35,yL,L/2+.03]],.17,.07)}}
 let iL=new THREE.Mesh(lg.l,LM.off),iR=new THREE.Mesh(lg.r,LM.off),br=new THREE.Mesh(lg.b,LM.brOff),hd=new THREE.Mesh(lg.h,night?LM.head:LM.headOff);g.add(iL,iR,br,hd);
 /* game cars: the lamps are the model's own lamp triangles, lit in place (each falls back to a lens box when the model has none) */
 const lp_=gc&&gc.lamps;if(lp_){const own=(geo,old,mat)=>{if(!geo)return old;g.remove(old);const q=new THREE.Mesh(geo,mat);q.position.y=gc.lift;q.renderOrder=2;gc.model.add(q);return q};
  iL=own(lp_.l,iL,LM.off);iR=own(lp_.r,iR,LM.off);br=own(lp_.b,br,LM.brOff);hd=own(lp_.h,hd,night?LM.head:LM.headOff)}
 const sh=new THREE.Mesh(BK.shGeo||(BK.shGeo=new THREE.PlaneGeometry(1,1)),BK.shMat||(BK.shMat=new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false})));sh.rotation.x=-PI/2;sh.scale.set(t.W*1.05,t.L*1.02,1);sh.position.y=.04;sh.renderOrder=1;g.add(sh);
 return{g,iL,iR,br,hd,sh,t,kind,name:gc&&gc.name}};
BK.pickKind=r=>{const x=r();/* Nov 2: traffic is only the game's own cars when they are loaded */if(P.C10&&P.C10.ready)return x<.45?'sedan':x<.72?'hatch':'suv';return x<.34?'sedan':x<.5?'hatch':x<.66?'suv':x<.74?'pickup':x<.82?'van':x<.89?'box':x<.96?'semi':'bus'};
BK.pickPaint=r=>PAINT_POOL[(r()*PAINT_POOL.length)|0];
})();
