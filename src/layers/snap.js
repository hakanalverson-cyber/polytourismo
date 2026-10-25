/* ===== Poly GT layer: snap (trees and props stand on the ground that is actually drawn) ===== */
(function(){const P=window.PT8;
/* Props are placed with the smooth terrain function, but the ground is drawn as a 4-16 m triangle grid, so on slopes and bumps things
   floated up to a metre or sank. After a world is built, every ground-standing object is moved onto the drawn triangle under it. Parts that
   stand above a base (crowns over a trunk, a sign on its post) move with that base. Anything on or right beside the road is left alone. */
function grids(sc){const G=[];sc.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||!m.geometry.index)return;const a=m.geometry.attributes.position;if(!a||a.count<400)return;
  m.updateMatrixWorld();const e=m.matrixWorld.elements;if(Math.abs(e[12])+Math.abs(e[13])+Math.abs(e[14])>1e-3||Math.abs(e[0]-1)+Math.abs(e[5]-1)+Math.abs(e[10]-1)>1e-3)return;
  const p=a.array,x0=p[0],z0=p[2],cs=p[3]-p[0];if(!(cs>.5&&cs<40)||Math.abs(p[5]-z0)>1e-3)return;let W=1;while(W<a.count&&Math.abs(p[W*3+2]-z0)<1e-3)W++;if(W<3||W>=a.count)return;
  if(Math.abs(p[W*3]-x0)>1e-3||Math.abs(p[W*3+2]-z0-cs)>1e-2)return;let R=Math.floor(a.count/W);while(R>1&&Math.abs(p[(R-1)*W*3+2]-(z0+(R-1)*cs))>1e-2)R--;if(R<3)return;
  G.push({x0,z0,cs,W,R,p})});return G}
function hAt(G,x,z){for(const g of G){const lx=(x-g.x0)/g.cs,lz=(z-g.z0)/g.cs;if(lx<0||lz<0||lx>=g.W-1||lz>=g.R-1)continue;const i=Math.floor(lx),j=Math.floor(lz),fi=lx-i,fj=lz-j,a=j*g.W+i,b=a+g.W,H=k=>g.p[k*3+1];
  const ha1=H(a+1),hb=H(b);if(fi+fj<=1){const ha=H(a);return ha+fi*(ha1-ha)+fj*(hb-ha)}const hb1=H(b+1);return hb1+(1-fi)*(hb-hb1)+(1-fj)*(ha1-hb1)}return null}
function snap(T,sc){const G=T.meshH?null:grids(sc),ground=T.meshH?(x,z)=>T.meshH(x,z):(x,z)=>hAt(G,x,z);if(G&&!G.length)return;
 const onRoad=(x,z)=>typeof nearRoad==='function'&&nearRoad(T,x,z,3.2);
 const key=(x,z)=>Math.round(x*2)*131071+Math.round(z*2),shift=new Map(),M=new THREE.Matrix4(),pv=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),bb=new THREE.Box3();
 const skip=o=>{for(let p=o;p;p=p.parent)if(p.userData&&(p.userData.noSnap||p.userData.ringPano===1||p.name==='ringTiles'))return true;return false};
 const ims=[],objs=[];sc.updateMatrixWorld(true);
 sc.traverse(o=>{if(skip(o))return;if(o.isInstancedMesh){ims.push(o);return}});
 /* standalone props: the outermost small object under the scene or a dressing group */
 const consider=o=>{if(skip(o)||o.isInstancedMesh||o.isLight||o.isCamera)return;bb.setFromObject(o);if(!isFinite(bb.min.x))return;const sx=bb.max.x-bb.min.x,sz=bb.max.z-bb.min.z,sy=bb.max.y-bb.min.y;
  if(sx>70||sz>70||sy>60){if(!o.isMesh)o.children.forEach(consider);return}objs.push([o,bb.min.y,(bb.min.x+bb.max.x)/2,(bb.min.z+bb.max.z)/2,sx,sz])};
 sc.children.forEach(consider);
 /* pass 1: instances whose bottom is near the ground set the shift for their spot */
 const rec=[];let moved=0,n=0;
 for(const im of ims){const g=im.geometry;if(!g.boundingBox)g.computeBoundingBox();const by=g.boundingBox.min.y,hy=g.boundingBox.max.y-by,arr=[];
  for(let i=0;i<im.count;i++){im.getMatrixAt(i,M);const e=M.elements;if(e[0]===0&&e[5]===0&&e[10]===0)continue;M.premultiply(im.matrixWorld);M.decompose(pv,q,s);
   arr.push([i,pv.x,pv.z,pv.y+by*s.y,hy*s.y])}
  rec.push([im,arr])}
 /* the lowest piece at a spot is its base: its gap to the drawn ground is the shift for everything standing there */
 for(const[im,arr]of rec)for(const a of arr){const[i,x,z,bottom,h]=a;const k=key(x,z),o=shift.get(k);if(o&&o.b<=bottom)continue;if(onRoad(x,z)){shift.set(k,{b:bottom,d:0});continue}
  const gh=ground(x,z);if(gh==null)continue;let d=gh-bottom;if(d<-2.5||d>1.4)d=0;/* raised on purpose (a bridge, a deck) or far off: leave it */
  else if(d>0&&d<h*.5)d=0;/* only floating is fixed; a rock half sunk into the grass is meant to be */
  shift.set(k,{b:bottom,d})}
 const look=(x,z)=>{const k=key(x,z);if(shift.has(k))return shift.get(k).d;let best=null,bd=9;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const k2=Math.round(x*2+a)*131071+Math.round(z*2+b),o=shift.get(k2);if(o&&Math.abs(a)+Math.abs(b)<bd){bd=Math.abs(a)+Math.abs(b);best=o.d}}return best};
 const inv=new THREE.Matrix4();
 for(const[im,arr]of rec){let ch=false;inv.copy(im.matrixWorld).invert();
  for(const a of arr){const[i,x,z]=a;const d=look(x,z);if(d==null||Math.abs(d)<.03)continue;
   im.getMatrixAt(i,M);M.premultiply(im.matrixWorld);M.elements[13]+=d;M.premultiply(inv);im.setMatrixAt(i,M);ch=true;moved++}
  n+=arr.length;if(ch){im.instanceMatrix.needsUpdate=true;im.geometry.boundingSphere=null}}
 for(const[o,by,x,z]of objs){if(onRoad(x,z))continue;const gh=ground(x,z);if(gh==null)continue;const d=gh-by;if(d<-1.5||d>0||d>-.03)continue;o.position.y+=d;moved++}
 T._snap={n,moved,objs:objs.length};
}
P.snapGround=snap;
/* height of the ground as it is drawn (null off the grids): ground strips (run-offs, sand) sit on whichever is higher, so grass never pokes through */
P.drawnGround=sc=>{const G=grids(sc);return G.length?(x,z)=>hAt(G,x,z):null};
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{if(!(T.d&&T.d.free))snap(T,sc)}catch(e){console.warn('snap',e)}return sc};
})();
