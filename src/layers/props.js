/* ===== Poly Tourismo v9 layer: props (rooted scenery for every map) =====
   Rules every prop obeys:
   - rooted things stand on measured ground (min of terrain under the footprint) and carry a buried foundation/skirt,
     placement is refused if the slope under the footprint is deeper than the skirt
   - stacked things (bales, logs, containers, snowmen, cairns, arches) are built so each part rests on the one below
   - water things sit on the water plane, land things never in water
   - nothing on the road, nothing inside existing scenery (occupancy grid of the base world) */
(function v9props(){
'use strict';
const P=window.PT8,PI=Math.PI;
const MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0,flatShading:true});
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);

/* ---------- geometry kit (parts merged into one vertex-coloured geometry) ---------- */
const part=(g,c,x,y,z,o)=>({g,c,p:[x,y,z],r:(o&&o.r)||[0,0,0],s:(o&&o.s)||[1,1,1]});
const Bx=(w,h,d,c,x,y0,z,o)=>part(new THREE.BoxGeometry(w,h,d),c,x,y0+h/2,z,o);
const Cy=(rt,rb,h,c,x,y0,z,o,sg)=>part(new THREE.CylinderGeometry(rt,rb,h,sg||7),c,x,y0+h/2,z,o);
const Sp=(r,c,x,yc,z,o)=>part(new THREE.IcosahedronGeometry(r,1),c,x,yc,z,o);
const Dd=(r,c,x,yc,z,o)=>part(new THREE.DodecahedronGeometry(r,0),c,x,yc,z,o);
function mk(parts){const pos=[],col=[],c=new THREE.Color(),q=new THREE.Quaternion(),e=new THREE.Euler(),m=new THREE.Matrix4(),v=new THREE.Vector3();
 for(const p of parts){const g=p.g.index?p.g.toNonIndexed():p.g;e.set(p.r[0],p.r[1],p.r[2]);q.setFromEuler(e);m.compose(V3(p.p[0],p.p[1],p.p[2]),q,V3(p.s[0],p.s[1],p.s[2]));
  const a=g.attributes.position;c.setHex(p.c);for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(m);pos.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b)}}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));G.computeVertexNormals();return G}
/* a straight bar between two world points (fence rails, wires) */
const bar=(L,a,b,th,c)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1,q=new THREE.Quaternion().setFromUnitVectors(V3(0,0,1),V3(dx/l,dy/l,dz/l)),e=new THREE.Euler().setFromQuaternion(q);
 L.push(part(new THREE.BoxGeometry(th,th,l),c,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,{r:[e.x,e.y,e.z]}))};

/* ---------- prop library: geometry origin = ground contact, +z = front (faces the road) ---------- */
const LIB={};
const def=(n,parts,fr,sk,o)=>{LIB[n]=Object.assign({g:mk(parts),fr,sk},o||{})};
const ROOF=[0,PI/4,0];
function cabin(n,w,d,hw,wall,roof,o){o=o||{};const rh=o.rh||2.1,P_=[
  Bx(w+.3,1.7,d+.3,o.found||0x77716a,0,-1.5,0),Bx(w,hw,d,wall,0,0,0),
  Cy(0,1,rh,roof,0,hw,0,{r:ROOF,s:[(w+1)/1.414,1,(d+1)/1.414]},4),
  Bx(1.1,2.1,.1,0x4a3526,-w*.18,0,d/2+.04),Bx(1.0,.9,.1,0x9fd0f0,w*.2,1.1,d/2+.04),Bx(1.0,.9,.1,0x9fd0f0,w*.36,1.1,d/2+.04),
  Bx(.1,.9,1.0,0x9fd0f0,w/2+.04,1.1,0),Bx(.1,.9,1.0,0x9fd0f0,-w/2-.04,1.1,0)];
 if(!o.nochim)P_.push(Bx(.7,2.4,.7,0x7d6f66,w*.2,hw+.2,-d*.1));
 if(o.snow)P_.push(Cy(0,1,rh*.5,0xf4f8fc,0,hw+rh*.5+.02,0,{r:ROOF,s:[(w+1)/1.414*.53,1,(d+1)/1.414*.53]},4));
 def(n,P_,Math.max(w,d)/2+1.2,1.5,{face:1})}
cabin('cabinW',7,5,3,0x9a6f45,0x5a3d2c);cabin('cabinR',8,5.5,3.1,0xb8483a,0x4a4a52);cabin('cabinS',7,5,3,0xa8a29a,0x5e5750,{found:0x6b665e});
cabin('cabinH',6.5,5,3,0xf0ece2,0x8a4b3a);cabin('cabinA',6.5,5,3,0xcfa77a,0xb9724a,{rh:1.3,nochim:1});
cabin('chalet',8,5.5,3.2,0xa27447,0xeef3f8,{rh:2.6,snow:1});cabin('cabinF',7,5,3,0x8f6b48,0x6b7a86,{snow:1});
def('barn',[Bx(9.3,1.6,6.8,0x77716a,0,-1.5,0),Bx(9,4.4,6.5,0xa23a30,0,0,0),Cy(0,1,3.2,0x4a4a52,0,4.4,0,{r:ROOF,s:[11/1.414,1,8/1.414]},4),Bx(3,3.2,.1,0xe9e2d0,0,0,3.3)],6.2,1.6,{face:1});
def('pole',[Cy(.17,.23,9.4,0x6b4f35,0,-.7,0),Bx(.16,.16,2.8,0x5a4330,0,8.0,0),Bx(.14,.14,1.6,0x5a4330,0,7.0,0),Cy(.05,.05,.3,0xcfd8dc,0,8.16,1.1),Cy(.05,.05,.3,0xcfd8dc,0,8.16,-1.1)],.4,.6,{wire:8.4});
def('post',[Bx(.1,1.7,.1,0xf1f1f1,0,-1.0,0),Bx(.11,.2,.11,0xd23a2a,0,.5,0)],.2,.5);
def('snowpole',[Cy(.05,.06,4.0,0x2a2a2e,0,-1.0,0,null,5),Cy(.052,.052,.5,0xe8742a,0,2.0,0,null,5),Cy(.052,.052,.5,0xe8742a,0,1.0,0,null,5)],.2,.5);
def('bale',[part(new THREE.CylinderGeometry(.55,.55,1.2,10),0xc9a64a,0,.55,-.56,{r:[0,0,PI/2]}),part(new THREE.CylinderGeometry(.55,.55,1.2,10),0xbf9c42,0,.55,.56,{r:[0,0,PI/2]}),part(new THREE.CylinderGeometry(.55,.55,1.2,10),0xd2b055,0,1.497,0,{r:[0,0,PI/2]})],1.7,.3);
def('boulderG',[Dd(1.6,0x8a8c8e,0,.55,0,{s:[1.2,.8,1]}),Dd(.9,0x7c7e80,1.9,.3,.6),Dd(.6,0x95979a,-1.5,.2,.9)],2.6,1.0);
def('boulderR',[Dd(1.6,0x9a5a3e,0,.55,0,{s:[1.2,.8,1]}),Dd(.9,0x8a4f36,1.9,.3,.6),Dd(.6,0xa8664a,-1.5,.2,.9)],2.6,1.0);
def('boulderS',[Dd(1.6,0xdfe6ee,0,.55,0,{s:[1.2,.8,1]}),Dd(.9,0xcdd6e0,1.9,.3,.6),Dd(.6,0xeef2f7,-1.5,.2,.9)],2.6,1.0);
def('cairn',[Cy(.62,.7,.42,0x8d8f90,0,-.2,0,null,6),Cy(.5,.58,.34,0x9a9c9d,0,.22,0,null,6),Cy(.38,.44,.3,0x85878a,0,.56,0,null,6),Cy(.25,.3,.26,0xa3a5a6,0,.86,0,null,6),Sp(.16,0x929496,0,1.2,0)],.9,.4);
def('turbine',(()=>{const a=[Cy(.45,.8,36,0xe9edf0,0,-.6,0,null,10),Bx(1.4,1.4,3.4,0xdfe3e7,0,35.4,.5),Sp(.75,0xdfe3e7,0,36.1,2.3)];
 for(let k=0;k<3;k++){const t=k*2.094+.4;a.push(part(new THREE.BoxGeometry(.4,15,.12),0xf2f4f6,-Math.sin(t)*7.5,36.1+Math.cos(t)*7.5,2.45,{r:[0,0,t]}))}return a})(),1.3,.9);
def('cactus',[Cy(.32,.38,3.6,0x4f7f3a,0,-.3,0,null,6),Sp(.34,0x4f7f3a,0,3.3,0),part(new THREE.CylinderGeometry(.2,.2,.95,6),0x4f7f3a,.8,1.6,0,{r:[0,0,PI/2]}),Cy(.2,.2,1.3,0x4f7f3a,1.27,1.12,0,null,6),part(new THREE.CylinderGeometry(.17,.17,.7,6),0x4f7f3a,-.6,2.1,0,{r:[0,0,PI/2]}),Cy(.17,.17,.9,0x4f7f3a,-.93,1.77,0,null,6)],.7,.5);
def('lighthouse',(()=>{const a=[Cy(3.6,4.6,5,0x8a8f94,0,-3,0,null,10)];const cols=[0xf3f3f3,0xc0392b,0xf3f3f3,0xc0392b];let y=2,r=3.2;cols.forEach(c=>{a.push(Cy(r-.3,r,4,c,0,y,0,null,10));y+=4;r-=.3});
 a.push(Cy(3,3,.4,0x30343a,0,y,0,null,10),Cy(1.5,1.5,2.4,0xffe9a8,0,y+.4,0,null,8),Cy(0,2,1.8,0xb22d22,0,y+2.8,0,null,8));return a})(),4.6,3);
[['tentR',0xd23a2a],['tentB',0x2f6fb8],['tentG',0xe6e6e6]].forEach(([n,c])=>{const a=[];[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(l=>a.push(Cy(.05,.05,2.5,0x9aa0a6,l[0],-.1,l[1],null,5)));
 a.push(Cy(0,1,1.0,c,0,2.4,0,{r:ROOF,s:[2.7,1,2.7]},4),Bx(2.2,.08,.8,0x8a6a48,0,.8,-.8),Bx(.08,.8,.08,0x6a5038,-.9,0,-.8),Bx(.08,.8,.08,0x6a5038,.9,0,-.8));
 [[-.8,.3],[0,.5],[.8,.2]].forEach((p,i)=>{a.push(Cy(.2,.25,.9,[0x3a6aa8,0xd2a63a,0x4a8a58][(i+(c&3))%3],p[0],0,p[1],null,6),Sp(.19,0xe0b890,p[0],1.1,p[1]))});
 def(n,a,2.5,.5,{face:1,crowd:1})});[['bbA',0xe94f37,0xf4d35e],['bbB',0x2a7de1,0xffffff],['bbC',0x2f9e6e,0xf2e9d8]].forEach(([n,a,b])=>def(n,[Cy(.18,.2,5.6,0x5a6068,-2.2,-.6,0,null,6),Cy(.18,.2,5.6,0x5a6068,2.2,-.6,0,null,6),Bx(7,3,.25,0x2f3338,0,4.4,0),Bx(6.6,2.6,.05,a,0,4.6,.14),Bx(4.2,.5,.06,b,-.8,5.4,.18),Bx(2,.3,.06,b,1.6,4.8,.18),Bx(7,.2,.5,0x4a5058,0,4.2,.2)],3.2,.8,{face:1}));
P.lampParts=()=>[Cy(.3,.38,.5,0x2a2e33,0,-.55,0,null,8),Cy(.2,.27,.3,0x3a4048,0,-.1,0,null,8),Cy(.07,.13,6.9,0x4d535a,0,.2,0,null,8),Cy(.17,.17,.12,0x2a2e33,0,1.4,0,null,8),Cy(.15,.15,.1,0x2a2e33,0,3.6,0,null,8),Cy(.1,.1,.14,0x2a2e33,0,6.5,0,null,8),Cy(.09,.09,.3,0x2a2e33,0,7.05,0,null,6),Bx(.1,.1,3.9,0x4d535a,0,6.95,1.95),Bx(.06,.06,2.2,0x4d535a,0,6.35,.95,{r:[-.5,0,0]}),Bx(.06,.06,1.2,0x4d535a,0,6.6,.4,{r:[-.9,0,0]}),Bx(.62,.18,1.35,0x2e3339,0,6.86,3.55),Bx(.78,.05,1.55,0x2a2e33,0,7.0,3.55),Bx(.5,.04,1.1,0xfff2c8,0,6.76,3.58),Bx(.6,.06,.06,0x2a2e33,0,6.88,2.84)];
def('lamp',P.lampParts(),.3,.5,{face:1});
def('busstop',[Bx(3.6,2.3,.08,0x9fc9dc,0,0,-.55),Bx(3.9,.12,1.6,0x44505c,0,2.3,0),Cy(.05,.05,2.3,0x44505c,-1.8,0,.7,null,5),Cy(.05,.05,2.3,0x44505c,1.8,0,.7,null,5),Bx(2.6,.1,.5,0x8a6a48,0,.5,-.2),Bx(.1,.5,.4,0x44505c,-1.1,0,-.2),Bx(.1,.5,.4,0x44505c,1.1,0,-.2),Bx(.8,1.1,.08,0xf2c230,1.5,1.0,-.5)],2.3,.4,{face:1});
def('dumpster',[Bx(2.4,1.2,1.2,0x3b6b4a,0,.25,0),Bx(2.5,.12,1.3,0x2c4f38,0,1.45,0),Bx(.25,.25,.2,0x222,-1,0,.4),Bx(.25,.25,.2,0x222,1,0,.4),Bx(.25,.25,.2,0x222,-1,0,-.4),Bx(.25,.25,.2,0x222,1,0,-.4)],1.4,.35,{face:1});
def('cones',(()=>{const a=[];for(let i=0;i<4;i++){a.push(Bx(.55,.05,.55,0x24242a,i*1.6-2.4,0,0),Cy(.04,.22,.7,0xf06a1a,i*1.6-2.4,.05,0,null,6),Cy(.17,.19,.12,0xf2f2f2,i*1.6-2.4,.3,0,null,6))}return a})(),2.8,.2);
def('barrels',(()=>{const a=[],cl=[0xb23a2a,0x2f6fb8,0x5a6068];[[0,0],[.75,.1],[.35,.7]].forEach((p,i)=>a.push(Cy(.35,.35,.95,cl[i%3],p[0],0,p[1],null,8),Cy(.37,.37,.06,0x222,p[0],.4,p[1],null,8)));return a})(),1.3,.3);
def('crates',[Bx(1.1,1.0,1.1,0xb08a58,0,0,0),Bx(1.1,1.0,1.1,0xa07c4c,1.15,0,.1),Bx(1.0,1.0,1.0,0xbc9460,.55,1.0,.05,{r:[0,.15,0]})],1.6,.3);
const CC=[0x2f6fb8,0xc0392b,0x2f9e6e,0xe0a030,0x6a6f78,0x8a4b9e];
CC.forEach((c,i)=>{const lo=[Bx(6.1,2.6,2.44,c,0,0,0),Bx(.08,2.2,2.0,0x2a2d32,3.04,.2,0)],c2=CC[(i+2)%CC.length],hi=[Bx(6.1,2.6,2.44,c2,0,2.6,0),Bx(.08,2.2,2.0,0x2a2d32,-3.04,2.8,0)];
 def('cont'+i,lo,3.4,.3);def('cont2_'+i,lo.concat(hi),3.4,.3)});
def('officeC',[Bx(6.0,2.6,2.4,0xc9b98a,0,.4,0),Bx(.5,.4,.5,0x6b665e,-2.6,0,-.8),Bx(.5,.4,.5,0x6b665e,2.6,0,-.8),Bx(.5,.4,.5,0x6b665e,-2.6,0,.8),Bx(.5,.4,.5,0x6b665e,2.6,0,.8),Bx(1.0,2.0,.08,0x4a3526,-1.5,.4,1.24),Bx(1.6,.9,.08,0x9fd0f0,1.2,1.4,1.24),Bx(1.8,.12,1.1,0x6b665e,-1.5,.2,1.7)],3.2,.5,{face:1});
function truck(n,c){const a=[],wz=[-3.1,-1.4,2.5];wz.forEach(z=>{[-1.45,1.45].forEach(x=>a.push(part(new THREE.CylinderGeometry(.9,.9,.62,10),0x1d1d20,x,.9,z,{r:[0,0,PI/2]}),part(new THREE.CylinderGeometry(.42,.42,.64,8),0x9aa0a6,x,.9,z,{r:[0,0,PI/2]})))});
 a.push(Bx(2.6,.55,8.8,0x2c2f34,0,.95,-.2),Bx(2.5,1.9,2.2,c,0,1.5,3.2),Bx(2.3,.9,.06,0x9fd0f0,0,2.35,4.32),Bx(3.4,.25,5.2,0x2c2f34,0,1.5,-1.9),Bx(3.4,1.7,.3,c,0,1.75,-4.4),Bx(.3,1.7,5.2,c,-1.55,1.75,-1.9),Bx(.3,1.7,5.2,c,1.55,1.75,-1.9),Bx(3.4,1.4,.3,c,0,1.75,.6));
 def(n,a,4.6,.4,{face:0})}
truck('truckY',0xe0a82a);truck('truckO',0xd9622b);
def('hoodoo',[Cy(2.4,3.1,4.6,0xb0603c,0,-1.2,0,null,6),Cy(1.6,2.2,3.4,0xa05434,0,3.4,0,null,6),Cy(2.8,1.5,1.9,0xbe6a44,0,6.8,0,null,6)],3.2,1.4);
def('arch',[Cy(1.9,2.7,6.7,0xae5e3a,-4.2,-1.7,0,null,7),Cy(1.9,2.7,6.7,0xa4563a,4.2,-1.7,0,null,7),Bx(11.6,2.3,3.4,0xb86a44,0,5.0,0)],6.6,1.6,{span:4.2});
def('pump',[Bx(4.4,.4,1.8,0x4a4f55,0,-.3,0),Bx(.3,4.3,.3,0x2d5f7a,0,.1,-.55),Bx(.3,4.3,.3,0x2d5f7a,0,.1,.55),part(new THREE.BoxGeometry(6.4,.42,.5),0x2d6a8c,.1,4.5,0,{r:[0,0,.1]}),Bx(.9,1.3,.5,0x555a60,3.0,2.9,0),Bx(.4,1.7,.4,0x2d6a8c,-3.1,3.1,0),Cy(.17,.17,1.7,0x6b665e,-3.4,0,0,null,6)],3.6,.5);
def('snowman',[Sp(.78,0xf4f8fc,0,.65,0),Sp(.56,0xf4f8fc,0,1.6,0),Sp(.4,0xf4f8fc,0,2.3,0),Cy(0,.07,.5,0xe8742a,0,2.3,.55,{r:[PI/2,0,0]},5),Sp(.05,0x222,-.15,2.42,.34),Sp(.05,0x222,.15,2.42,.34),Cy(.42,.42,.12,0xc0392b,0,1.95,0,null,8),Cy(.42,.42,.05,0x2a2a2e,0,2.62,0,null,8),Cy(.28,.28,.4,0x2a2a2e,0,2.66,0,null,8),Bx(.05,1.0,.05,0x5a4330,.85,1.7,0,{r:[0,0,-1.0]}),Bx(.05,1.0,.05,0x5a4330,-.85,1.7,0,{r:[0,0,1.0]})],1.1,.45);
def('logs',(()=>{const a=[],cl=[0x7b5a3a,0x6f5033,0x86643f];const L=(y,z,i)=>a.push(part(new THREE.CylinderGeometry(.28,.28,3.2,8),cl[i%3],0,y,z,{r:[0,0,PI/2]}),part(new THREE.CylinderGeometry(.22,.22,3.22,6),0xc9a77a,0,y,z,{r:[0,0,PI/2]}));
 L(.28,-.56,0);L(.28,0,1);L(.28,.56,2);L(.765,-.28,1);L(.765,.28,0);L(1.25,0,2);return a})(),2.2,.35);
def('stump',[Cy(.45,.6,.7,0x6f5033,0,-.2,0,null,8),Cy(.42,.42,.04,0xc9a77a,0,.49,0,null,8)],.7,.4);
function sheep(n,wl){def(n,[Sp(.5,wl,0,.85,0,{s:[.9,.8,1.3]}),Sp(.21,0x2c2a28,0,.98,.74,{s:[.9,1,1.15]}),Cy(.04,.05,.55,0x2c2a28,-.2,0,.4,null,5),Cy(.04,.05,.55,0x2c2a28,.2,0,.4,null,5),Cy(.04,.05,.55,0x2c2a28,-.2,0,-.4,null,5),Cy(.04,.05,.55,0x2c2a28,.2,0,-.4,null,5)],.8,.25)}
sheep('sheepA',0xece8dc);sheep('sheepB',0xd8d2c4);
def('bollard',[Cy(.26,.33,.7,0x2c2f34,0,-.1,0,null,8),Cy(.38,.38,.12,0xe0a82a,0,.55,0,null,8)],.4,.25);
def('crane',(()=>{const a=[];[[-4,-5],[4,-5],[-4,5],[4,5]].forEach(l=>a.push(Bx(.7,16,.7,0xd8d8d8,l[0],-.4,l[1])));
 a.push(Bx(10,1.2,13,0x6a707a,0,15.6,0),Bx(1.4,1.4,34,0xdc3b2f,0,16.8,12),Bx(7.4,.4,.5,0x6a707a,0,3,-5),Bx(7.4,.4,.5,0x6a707a,0,3,5),Bx(.4,.4,10,0x6a707a,-4,3,0),Bx(.4,.4,10,0x6a707a,4,3,0),Bx(2.2,2.2,2.6,0xe0a82a,0,13.2,6));return a})(),8,.4,{face:1});
function boat(n,k){const a=[];if(k===0){a.push(Bx(2.6,1.3,7.2,0xb23a2c,0,-.6,0),Bx(2.5,.12,7.0,0xe6dcc0,0,.7,0),Bx(1.8,1.5,2.3,0xf2f2f2,0,.8,-.7),Bx(2.0,.12,2.5,0x2f6fb8,0,2.3,-.7),Cy(.05,.05,3.6,0x555,0,2.4,-.7,null,5),Bx(2.7,.2,7.3,0xf2f2f2,0,.45,0))}
 else{a.push(Bx(1.9,1.0,6.4,0xf4f4f4,0,-.5,0),Bx(1.8,.12,6.2,0xcdbb98,0,.5,0),Bx(1.2,.55,2.2,0xe8e8e8,0,.6,-.4),Cy(.05,.05,8.6,0xb0b4b8,0,.6,.9,null,5),Cy(0,1,6.2,0xf6f3ea,0,1.8,-.5,{s:[.03,1,1.5]},3),Bx(.1,.1,3.0,0xb0b4b8,0,1.3,-.9))}
 def(n,a,3.6,0,{water:1})}
boat('fish',0);boat('sail',1);
def('buoy',[Sp(.55,0xd23a2a,0,.15,0),Cy(0,.3,.7,0xf2f2f2,0,.5,0,null,6),Sp(.1,0xffd24a,0,1.25,0)],.6,0,{water:1});

/* ---------- placement plan per track (by name) ---------- */
const PLAN={
 'Quarry Circuit':   {edge:[['pole',1,60,10],['post',0,42,2.4]],field:[['truckY',3,26,150],['truckO',2,26,150],['officeC',3,18,90],['barrels',6,10,90],['cones',5,7,40],['bbA',2,18,120],['boulderG',16,14,230],['cairn',3,12,80],['tentR',2,12,40],['tentB',2,12,40]],fence:[0x8a8f94,2]},
 'Canyon Viaduct':{edge:[['pole',-1,70,10]],field:[['hoodoo',9,30,260],['arch',2,30,260],['boulderR',20,14,230],['cactus',14,10,150],['truckO',1,24,120],['bbB',2,20,120],['tentG',2,12,40],['tentR',1,12,40],['cairn',4,12,90]]},
 'Alpine Pass':{edge:[['snowpole',0,24,3.4],['post',0,42,2.4]],field:[['chalet',8,16,150],['cairn',8,10,120],['sheepA',0,0,0],['boulderG',10,14,200],['tentB',2,12,40],['tentR',1,12,40],['bbB',1,20,120]],flock:[['sheepA',6,4,18,130]],fence:[0x9a7a52,2]},
 'Afterhours Loop':{edge:[],field:[['bbA',3,14,100],['bbB',3,14,100],['bbC',3,14,100],['busstop',4,6,40],['dumpster',6,6,60],['cones',6,6,40],['officeC',2,14,70]]},
 'Pinewood Stage':{edge:[['pole',1,60,9],['post',0,42,2.4]],field:[['cabinW',4,14,110],['cabinR',2,14,110],['barn',1,16,120],['logs',7,8,70],['stump',16,5,60],['bale',6,6,40],['tentR',2,12,40],['tentB',2,12,40],['boulderG',8,12,160]],fence:[0x9a7a52,2]},
 'Redrock Stage':{edge:[['pole',-1,70,10]],field:[['cactus',36,7,170],['hoodoo',9,30,260],['arch',2,30,260],['pump',4,20,150],['cabinA',3,14,120],['boulderR',14,12,200],['tentG',2,12,40],['tentR',1,12,40]]},
 'Highmoor Stage':{edge:[['post',0,42,2.4]],field:[['cabinS',5,14,130],['turbine',4,40,260],['cairn',8,8,100],['bale',4,6,40],['boulderG',12,12,180],['tentB',2,12,40],['tentG',2,12,40]],flock:[['sheepA',9,4,22,170]]},
 'Coastal Run':{edge:[['post',0,42,2.4]],field:[['lighthouse',1,25,260,'high'],['turbine',3,40,240],['cabinH',4,14,120],['boulderG',6,12,140],['tentR',2,12,40],['tentG',2,12,40],['bale',3,6,40],['fish',5,0,260,'water'],['sail',6,0,260,'water'],['buoy',8,0,260,'water']],fence:[0xe9e2d0,2,'cliff']},
 'Harbor Lights':{edge:[],field:[['cont2_0',3,6,140],['cont2_1',3,6,140],['cont2_2',3,6,140],['cont1',2,6,140],['cont4',2,6,140],['crane',3,0,0,'quay'],['crates',8,4,100],['barrels',8,4,100],['lamp',12,3,100],['bollard',46,0,0,'edge'],['fish',4,0,260,'water'],['sail',6,0,260,'water'],['buoy',8,0,260,'water']]},
 'Frostline Stage':{edge:[['pole',1,70,9],['snowpole',0,24,3.4]],field:[['snowman',6,5,60],['cabinF',5,14,120],['logs',6,8,70],['stump',8,5,60],['bale',4,6,40],['tentR',2,12,40],['tentB',2,12,40],['boulderS',8,12,160]],fence:[0x9a7a52,2]}
};

/* ---------- decoration ---------- */
function occupancy(sc){const occ=new Set(),C=3,key=(i,j)=>i*40000+j;sc.updateMatrixWorld(true);
 const box=bb=>{const i0=Math.floor((bb.min.x-1)/C),i1=Math.floor((bb.max.x+1)/C),j0=Math.floor((bb.min.z-1)/C),j1=Math.floor((bb.max.z+1)/C);if((i1-i0)>60||(j1-j0)>60)return;for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)occ.add(key(i,j))};
 const bb=new THREE.Box3(),m4=new THREE.Matrix4(),v=V3(0,0,0);
 sc.traverse(o=>{if(!o.isMesh||!o.geometry||o.visible===false)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);m4.premultiply(o.matrixWorld);bb.copy(g.boundingBox).applyMatrix4(m4);if(bb.max.x-bb.min.x>140||bb.max.z-bb.min.z>140||bb.max.y-bb.min.y<.5)continue;box(bb)}return}
  bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld);const dx=bb.max.x-bb.min.x,dz=bb.max.z-bb.min.z;if(dx>260||dz>260||bb.max.y-bb.min.y<.6)return;
  if(dx<25&&dz<25){box(bb);return}const a=g.attributes.position;if(!a)return;const st=Math.max(1,Math.floor(a.count/6000));
  for(let i=0;i<a.count;i+=st){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);occ.add(key(Math.floor(v.x/C),Math.floor(v.z/C)))}});
 return {occ,busy:(x,z,r)=>{for(let i=Math.floor((x-r)/C);i<=Math.floor((x+r)/C);i++)for(let j=Math.floor((z-r)/C);j<=Math.floor((z+r)/C);j++)if(occ.has(key(i,j)))return true;return false},
  mark:(x,z,r)=>{for(let i=Math.floor((x-r)/C);i<=Math.floor((x+r)/C);i++)for(let j=Math.floor((z-r)/C);j<=Math.floor((z+r)/C);j++)occ.add(key(i,j))}}}

function decorate(T,sc){const d=T.d,N=T.N,name=d.name,plan=PLAN[name];if(!plan)return;
 const k=D.findIndex(q=>q.name===name),r=rngf(900+k*31),R=(a,b)=>a+(b-a)*r();
 const OC=occupancy(sc),log=[],groups={},parts=[];
 /* sea level (coast) / harbor water */
 let seaY=-1e9,lo=1e9;if(d.sea){for(let i=0;i<N;i+=4)lo=Math.min(lo,T.y[i]);seaY=lo-4}
 const H=!!d.harbor,WATER=(x,z)=>(x>215&&z>5)||z>315,WY=-1.3;
 const gnd=(x,z)=>H?0:T.terr(x,z);
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i])}
 const px=[],pz=[],ph=[];for(let i=0;i<N;i+=2){px.push(T.x[i]);pz.push(T.z[i]);ph.push(T.hw[i])}
 const near=(x,z)=>{let b=1e9,bi=0;for(let i=0;i<px.length;i++){const dd=Math.hypot(x-px[i],z-pz[i])-ph[i];if(dd<b){b=dd;bi=i}}return[b,bi*2]};
 const land=(x,z)=>H?!WATER(x,z):(!d.sea||gnd(x,z)>seaY+1.4);
 const ring=(x,z,fr)=>{let mn=1e9,mx=-1e9,ok=true;for(let a=-1;a<8;a++){const xx=a<0?x:x+Math.cos(a*.7854)*fr,zz=a<0?z:z+Math.sin(a*.7854)*fr,h=gnd(xx,zz);if(!land(xx,zz))ok=false;mn=Math.min(mn,h);mx=Math.max(mx,h)}return[mn,mx,ok]};
 const add=(n,x,y,z,yaw,s,extra)=>{(groups[n]=groups[n]||[]).push([x,y,z,yaw,s]);const L=LIB[n];log.push(Object.assign({n,x,z,y,s,yaw,fr:L.fr*s,sk:L.sk*s},extra||{}));if(L.crowd)(sc.userData.crowd=sc.userData.crowd||[]).push([x,z])};
 /* try to put prop n at x,z; returns true on success */
 const tryPut=(n,x,z,yaw,s,lo_,hi_)=>{const L=LIB[n];if(!L)return false;const fr=L.fr*s;
  const [cl,bi]=near(x,z);if(cl<Math.max(lo_,fr+1.2)||(hi_&&cl>hi_))return false;
  if(OC.busy(x,z,fr+1.2))return false;
  if(L.water){ /* floats on the water plane, well clear of shore and piers */
   const wy=H?WY:seaY;if(H){for(let a=0;a<8;a++)if(!WATER(x+Math.cos(a*.785)*(fr+6),z+Math.sin(a*.785)*(fr+6)))return false}
   else{for(let a=0;a<8;a++){const xx=x+Math.cos(a*.785)*(fr+10),zz=z+Math.sin(a*.785)*(fr+10);if(gnd(xx,zz)>seaY-1.5)return false}if(gnd(x,z)>seaY-2)return false}
   add(n,x,wy,z,yaw,s,{water:1});OC.mark(x,z,fr);return true}
  const [mn,mx,ok]=ring(x,z,fr);if(!ok)return false;
  if(L.span){ /* arch: only the two legs need ground */
   let a=-1e9,b=1e9;for(const sgn of[-1,1]){const lx=x+Math.cos(yaw)*L.span*s*sgn,lz=z-Math.sin(yaw)*L.span*s*sgn,h=gnd(lx,lz);a=Math.max(a,h);b=Math.min(b,h)}
   if(a-b>L.sk*s*.8)return false;add(n,x,b-.05,z,yaw,s,{span:1,tmin:b,tmax:a});OC.mark(x,z,fr);return true}
  if(mx-mn>L.sk*s*.85)return false;
  add(n,x,mn-.05,z,yaw,s,{tmin:mn,tmax:mx});OC.mark(x,z,fr);return true};
 const faceYaw=(x,z)=>{const [,bi]=near(x,z);return Math.atan2(T.x[bi]-x,T.z[bi]-z)};
 const sideXY=(i,l)=>{const s=Math.sin(T.psi[i]),c=Math.cos(T.psi[i]);return[T.x[i]+c*l,T.z[i]-s*l]};

 /* 1. along the road */
 for(const [n,side,step,off] of plan.edge||[]){if(!off)continue;const L=LIB[n],sp=Math.max(1,Math.round(step/T.sp));let prev=null;
  const sd=side===0?0:side;for(let i=Math.floor(r()*sp);i<N;i+=sp){const sgs=side===0?[-1,1]:[sd];for(const sg of sgs){const o=off+(n==='pole'?0:0),[x,z]=sideXY(i,sg*(T.hw[i]+o));
   const yaw=faceYaw(x,z);
   const ok=tryPut(n,x,z,yaw,1,1.5,0);
   if(n==='pole'){if(ok&&prev&&prev.sg===sg&&Math.hypot(prev.x-x,prev.z-z)<sp*T.sp*1.6){const A=log[log.length-1],B=prev.rec;
     for(const lat of[-1.1,1.1]){const ax=Math.sin(yaw),az=Math.cos(yaw);const a=[prev.x+ax*lat,B.y+LIB.pole.wire,prev.z+az*lat],b=[x+ax*lat,A.y+LIB.pole.wire,z+az*lat];
      const m=[(a[0]+b[0])/2,(a[1]+b[1])/2-.7,(a[2]+b[2])/2];bar(parts,a,m,.04,0x24262a);bar(parts,m,b,.04,0x24262a)}}
     prev=ok?{x,z,sg,rec:log[log.length-1]}:null}}}}
 /* 2. fences hugging the road (posts follow the ground, rails join post tops) */
 if(plan.fence){const [col,runs,mode]=plan.fence,off=mode==='cliff'?T.hw[0]+3.2:7;
  for(let q=0;q<runs*3;q++){const sg=r()<.5?-1:1,s0=Math.floor(r()*N),len=Math.round(R(24,70)),stp=Math.max(1,Math.round(3.2/T.sp));let prev=null;
   for(let u=0;u<len;u+=stp){const i=(s0+u)%N,[x,z]=sideXY(i,sg*(T.hw[i]+off)),h=gnd(x,z),[cl]=near(x,z);
    if(cl<off-1.2||OC.busy(x,z,1.2)||!land(x,z)){prev=null;continue}
    if(prev&&Math.abs(h-prev[1])>.9){prev=null}
    parts.push(Cy(.07,.09,1.7,col,x,h-.45,z,null,5));
    if(prev){bar(parts,[prev[0],prev[1]+.55,prev[2]],[x,h+.55,z],.07,col);bar(parts,[prev[0],prev[1]+1.0,prev[2]],[x,h+1.0,z],.07,col)}
    log.push({n:'fencepost',x,z,y:h,tmin:h,tmax:h,fr:.1,sk:.45,s:1});prev=[x,h,z]}}}
 /* 3. open ground */
 const pick=(lo_,hi_,mode)=>{
  if(mode==='quay'){for(let t=0;t<400;t++){const x=R(-400,400),z=R(-300,400);if(WATER(x,z))continue;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];for(const dd of dirs){if(WATER(x+dd[0]*19,z+dd[1]*19)&&!WATER(x+dd[0]*10,z+dd[1]*10)&&!WATER(x-dd[0]*10,z-dd[1]*10))return[x,z,Math.atan2(dd[0],dd[1])]}}return null}
  if(mode==='edge'){for(let t=0;t<600;t++){const x=R(-420,420),z=R(-320,420);if(WATER(x,z))continue;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];for(const dd of dirs)if(WATER(x+dd[0]*1.8,z+dd[1]*1.8)&&!WATER(x,z)&&!WATER(x-dd[0]*1,z-dd[1]*1))return[x,z,Math.atan2(dd[0],dd[1])]}return null}
  const pad=hi_?hi_+10:200;return[R(x0-pad,x1+pad),R(z0-pad,z1+pad)]};
 for(const [n,cnt,lo_,hi_,mode] of plan.field||[]){if(!cnt)continue;let got=0;const L=LIB[n];
  for(let t=0;t<cnt*90&&got<cnt;t++){
   if(mode==='high'){ /* lighthouse: best flat high ground near the road */
    let best=null;for(let u=0;u<900;u++){const x=R(x0-hi_,x1+hi_),z=R(z0-hi_,z1+hi_),[cl]=near(x,z);if(cl<lo_||cl>hi_)continue;const [mn,mx,ok]=ring(x,z,L.fr);if(!ok||mx-mn>L.sk*.8||OC.busy(x,z,L.fr+2))continue;if(!best||mn>best[2])best=[x,z,mn]}
    if(best&&tryPut(n,best[0],best[1],faceYaw(best[0],best[1]),1,lo_,hi_))got++;break}
   const p=pick(lo_,hi_,mode);if(!p)break;let x=p[0],z=p[1],yaw=p[2]!=null?p[2]:(L.face?faceYaw(x,z):r()*6.283);
   if(mode==='quay'||mode==='edge'){ /* water-side things: pull back a little from the edge */ }
   const s=L.water||mode==='quay'||mode==='edge'||n.startsWith('cont')||n==='truckY'||n==='truckO'||n==='officeC'||n==='barn'||n==='crane'?1:(n.startsWith('boulder')?R(.8,1.7):n==='hoodoo'?R(.9,1.8):n==='cactus'?R(.8,1.5):n==='cairn'||n.startsWith('cabin')||n==='chalet'?R(.9,1.15):1);
   if(L.face===0&&!mode)yaw=faceYaw(x,z)+(r()<.5?1.5708:0)+R(-.2,.2);
   if(n.startsWith('cont')||n==='officeC'||n==='crates'){ /* storage lines up with the road */
    const [,bi]=near(x,z);yaw=T.psi[bi]+(r()<.5?0:PI/2)}
   if(tryPut(n,x,z,yaw,s,lo_||1.5,hi_))got++}}
 /* 4. flocks */
 for(const f of plan.flock||[]){const [n,cnt,lo_,hi_,far]=f;
  for(let c=0;c<cnt;c++){let cx,cz;for(let t=0;t<120;t++){cx=R(x0-60,x1+60);cz=R(z0-60,z1+60);const [cl]=near(cx,cz);if(cl>hi_&&cl<far&&land(cx,cz)&&!OC.busy(cx,cz,6))break;cx=null}
   if(cx==null)continue;const base=r()*6.283,m=3+Math.floor(r()*4);
   for(let q=0;q<m;q++){const a=r()*6.283,rr=R(1.5,5);tryPut(r()<.5?'sheepA':'sheepB',cx+Math.cos(a)*rr,cz+Math.sin(a)*rr,base+R(-.9,.9),R(.9,1.1),lo_,0)}}}
 /* 5. build meshes */
 const dum=new THREE.Object3D(),col=new THREE.Color();
 for(const n in groups){const L=LIB[n],list=groups[n],im=new THREE.InstancedMesh(L.g,MAT,list.length);
  list.forEach((p,i)=>{dum.position.set(p[0],p[1],p[2]);dum.rotation.set(0,p[3],0);dum.scale.setScalar(p[4]);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);
   const k2=.9+(Math.abs(Math.sin(p[0]*12.9+p[2]*7.7))*.2);col.setRGB(k2,k2,k2);if(im.setColorAt)im.setColorAt(i,col)});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.userData.ptProp=n;sc.add(im)}
 if(parts.length){const m=new THREE.Mesh(mk(parts),MAT);m.frustumCulled=false;m.userData.ptProp='lines';sc.add(m)}
 sc.userData.props=log;sc.userData.propCount=log.length}

const bw=buildWorld;buildWorld=T=>{const sc=bw(T);try{decorate(T,sc)}catch(e){console.error('props failed',e);sc.userData.propError=String(e&&e.stack||e)}return sc};
P.PROPLIB=LIB;P.PROPKIT={part,Bx,Cy,Sp,Dd,mk,def,PLAN,LIB,bar,V3,MAT};
})();
