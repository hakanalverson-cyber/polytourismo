/* ===== Poly Tourismo v9 layer: solid (every barrier, fence, tyre wall, bale, pole and tunnel mound is a real collider, in every mode) ===== */
(function v9solid(){
'use strict';
const P=window.PT8;
const NAMES={bale:.9,barrels:.7,bollard:.35,crates:.85,dumpster:1.25,boulderG:1.25,boulderR:1.25,boulderS:1.1,cairn:.8,hoodoo:1.0,pole:.3,snowpole:.25,lamp:.35,logs:1.0,stump:.5,post:.3,cactus:.5,busstop:.9};
const X=T=>T._bx||(T._bx={segs:[],pts:[]});
P.addSeg=(T,x1,z1,x2,z2,r)=>{if(!T)return;X(T).segs.push([x1,z1,x2,z2,r||.3]);T._bg=null};
P.addPt=(T,x,z,r)=>{if(!T)return;X(T).pts.push([x,z,r||.5]);T._bg=null};
/* footprints of the big props that the point-collider table does not cover (rect = half width / half depth in the prop's own frame) */
const FOOT=n=>n==='barn'?{rect:[4.7,3.4]}:n==='officeC'?{rect:[3.0,1.25]}:/^cont/.test(n)?{rect:[3.0,1.3]}:n==='pump'?{rect:[3.3,.9]}:n==='lighthouse'?{r:3.6}:n==='turbine'?{r:.9}:n==='snowman'?{r:.8}:n==='crane'?{pts:[[-4,-5,.6],[4,-5,.6],[-4,5,.6],[4,5,.6]]}:n==='arch'?{pts:[[-4.2,0,2.2],[4.2,0,2.2]]}:null;
/* collect colliders from the finished world */
function collect(sc,T){const x=X(T),log=sc.userData.props||[],L=P.PROPLIB||{};let prev=null;
 for(const p of log){if(p.n==='fencepost'){if(prev&&Math.hypot(prev.x-p.x,prev.z-p.z)<4.8)x.segs.push([prev.x,prev.z,p.x,p.z,.22]);prev=p;continue}
  prev=null;const fo=FOOT(p.n);if(fo){const sc=p.s||1,cy=Math.cos(p.yaw||0),sy=Math.sin(p.yaw||0),W=(q,w)=>[p.x+q*cy+w*sy,p.z-q*sy+w*cy];
   if(fo.rect){const [hx,hz]=fo.rect,C=[W(-hx*sc,-hz*sc),W(hx*sc,-hz*sc),W(hx*sc,hz*sc),W(-hx*sc,hz*sc)];for(let k=0;k<4;k++){const u=C[k],v=C[(k+1)%4];x.segs.push([u[0],u[1],v[0],v[1],.3])}}
   if(fo.pts)for(const q of fo.pts){const w=W(q[0]*sc,q[1]*sc);x.pts.push([w[0],w[1],q[2]*sc])}
   if(fo.r)x.pts.push([p.x,p.z,fo.r*sc]);continue}
  const r=NAMES[p.n];if(r){const f=L[p.n]&&L[p.n].fr?Math.min(1.6,L[p.n].fr*.8):r;x.pts.push([p.x,p.z,Math.max(.3,f*(p.s||1)*.9)])}}
 /* tunnels: the mound / roof sides and end caps are solid, the carriageway stays open (its own kerb walls already collide) */
 for(const[a,b]of T.tunnels||[]){const N=T.N,city=!!(T.d&&T.d.city);
  for(const sd of[-1,1]){let pv=null;for(let k=a;k<=b;k+=2){const i=k%N,c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]),l=sd*(T.hw[i]+(city?1.2:15)),q=[T.x[i]+c*l,T.z[i]-s*l];if(pv)x.segs.push([pv[0],pv[1],q[0],q[1],.4]);pv=q}
   if(!city)for(const k of[a,b]){const i=k%N,c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]);const l0=sd*(T.hw[i]+15),l1=sd*(T.hw[i]+1.6);x.segs.push([T.x[i]+c*l0,T.z[i]-s*l0,T.x[i]+c*l1,T.z[i]-s*l1,.4])}}}
 T._bg=null}
function grid(T){const x=X(T),g=new Map(),put=(k,o)=>{let l=g.get(k);if(!l){l=[];g.set(k,l)}l.push(o)};
 for(const s of x.segs){const x0=Math.floor(Math.min(s[0],s[2])/8),x1=Math.floor(Math.max(s[0],s[2])/8),z0=Math.floor(Math.min(s[1],s[3])/8),z1=Math.floor(Math.max(s[1],s[3])/8);for(let a=x0;a<=x1;a++)for(let b=z0;b<=z1;b++)put(a+','+b,s)}
 for(const p of x.pts)put(Math.floor(p[0]/8)+','+Math.floor(p[1]/8),p);
 T._bg=g;return g}
let cd=0;
function touch(g,x,z){const cx=Math.floor(x/8),cz=Math.floor(z/8);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=g.get((cx+a)+','+(cz+b));if(!l)continue;
 for(const s of l){let qx,qz,r;if(s.length===5){const dx=s[2]-s[0],dz=s[3]-s[1],ll=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/ll));qx=s[0]+dx*t;qz=s[1]+dz*t;r=s[4]}else{qx=s[0];qz=s[1];r=s[2]}
  if(Math.hypot(x-qx,z-qz)<r+.88)return true}}return false}
function hit(Rc,c,v,nx,nz){if(P.hitFx)P.hitFx(Rc,c,v,c.x-nx*.9,c.y+.35,c.z-nz*.9,nx,nz);if(!c.human)return;if(cd>0)return;cd=.3;Rc.shake=Math.max(Rc.shake||0,Math.min(1,v/16));if(P.sfx)P.sfx('crash');if(P.dmgOn&&P.dmgOn(Rc)&&P.hurt&&!((c.cdT||0)>0)){c.cdT=.7;P.hurt(Rc,c,v,nx,nz)}}
function bStep(Rc,dt){const T=Rc.T;if(!T||Rc.state!=='race')return;cd-=dt;const g=T._bg||grid(T);if(!g.size)return;
 /* every car, CPU included: nothing the player bumps into can be driven through by the CPU */
 for(const c of Rc.cars){if(c.fin||c.respT>0||c.exp>0)continue;
  /* swept test: walk the path since last frame in half-car steps so a fast car cannot step across a thin wall */
  {const ox=c._px,oz=c._pz;if(ox!=null&&!P.noSweep){const dd=Math.hypot(c.x-ox,c.z-oz);if(dd>.5&&dd<14){const n=Math.ceil(dd/.5);for(let k=1;k<n;k++){const sx=ox+(c.x-ox)*k/n,sz=oz+(c.z-oz)*k/n;if(touch(g,sx,sz)){c.x=sx;c.z=sz;break}}}}}
  const cx=Math.floor(c.x/8),cz=Math.floor(c.z/8),gy=T.terr?T.terr(c.x,c.z):c.y;if(c.y-gy>3.2){c._px=c.x;c._pz=c.z;continue}
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=g.get((cx+a)+','+(cz+b));if(!l)continue;
   for(const s of l){let qx,qz,r;if(s.length===5){const dx=s[2]-s[0],dz=s[3]-s[1],ll=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((c.x-s[0])*dx+(c.z-s[1])*dz)/ll));qx=s[0]+dx*t;qz=s[1]+dz*t;r=s[4]}else{qx=s[0];qz=s[1];r=s[2]}
    const ex=c.x-qx,ez=c.z-qz,d=Math.hypot(ex,ez),R=r+.88;if(d>=R||d<.001)continue;const nx=ex/d,nz=ez/d,vn=c.vx*nx+c.vz*nz;c.x+=nx*(R-d);c.z+=nz*(R-d);
    {const vt=Math.abs(-c.vx*nz+c.vz*nx);if(vt>8&&P.scrapeFx&&((c._scT=(c._scT||0)-dt)<=0)){c._scT=.05;P.scrapeFx(c,c.x-nx*.9,c.y+.3,c.z-nz*.9,vt,nx,nz)}}
    if(vn<0){c.vx-=1.25*vn*nx;c.vz-=1.25*vn*nz;const sp0=Math.hypot(c.vx,c.vz),k=Math.min(1,-vn/Math.max(1,sp0+-vn)*3);const ds=1-.12*k;c.vx*=ds;c.vz*=ds;if(-vn>2.2)hit(Rc,c,-vn,nx,nz)}slide(c,-nx,-nz,dt)}}c._px=c.x;c._pz=c.z}}
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{collect(sc,T)}catch(e){console.warn('solid',e)}return sc};

/* grip: a car hugging the road edge (or bouncing off it) keeps road grip, so cornering never falls to the off-road material mid-turn */
{const sk=sampleTrack;sampleTrack=function(d){const T=sk.apply(this,arguments);const s0=T.surf;if(!s0||!T.grid)return T;
 T.surf=(x,z,y)=>{const r=s0(x,z,y);if(r.road||T.d.city&&0)return r;const N=T.N,cx=Math.floor(x/16),cz=Math.floor(z/16);let nb=1e9,ni=-1,nl=0;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const ids=T.grid.get((cx+a)*8192+(cz+b));if(!ids)continue;
   for(const i of ids){const j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((x-T.x[i])*dx+(z-T.z[i])*dz)/l2));
    const px=T.x[i]+dx*f,pz=T.z[i]+dz*f,lat=(x-px)*Math.cos(T.psi[i])-(z-pz)*Math.sin(T.psi[i]),dd=Math.abs(lat)-T.hw[i];if(dd<=1.4&&dd<nb&&T.y[i]<=y+1.6){nb=dd;ni=i;nl=lat}}}
  if(ni>=0){r.near=1;r.i=ni;r.lat=nl}return r};return T}}
/* glancing contact: the wall turns the nose toward its own tangent so the car slides out instead of grinding its speed away pointing into it */
function slide(c,nx,nz,dt){const tx=-nz,tz=nx,vt=c.vx*tx+c.vz*tz,sp=Math.hypot(c.vx,c.vz);
 if(sp<4&&c.in&&Math.abs(c.in.st)>.2&&c.in.th>0)c.yaw+=c.in.st*1.7*dt; /* pinned nose-first: let the wheel still swing the nose round */

 if(sp<2&&c.in&&c.in.th>0){c._pin=(c._pin||0)+dt;if(c._pin>.6){c._pin=0;c.vx=-nx*3.5;c.vz=-nz*3.5;const hs=Math.sin(c.yaw)*tx+Math.cos(c.yaw)*tz,sg=hs>=0?1:-1;let d=Math.atan2(tx*sg,tz*sg)-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));c.yaw+=d*.6}}else if(sp>=2)c._pin=0;
 if(sp<6)return;
 const sg=vt>=0?1:-1;if(Math.abs(vt)<sp*.5)return;let d=Math.atan2(tx*sg,tz*sg)-c.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>1.05)return;
 c.yaw+=d*Math.min(1,dt*9)}
/* kerb/tunnel wall, true-position version: base clamp uses last frame's lateral and stops once road=0, so a fast car could cross the 0.9m margin in one frame and leave */
function kerb(Rc,dt){const T=Rc.T;if(!T||Rc.state!=='race'||!T.wall)return;const N=T.N;
 for(const c of Rc.cars){if(c.fin||c.respT>0||c.exp>0){c._wl=null;continue}
  const i0=c.idx|0;let best=null;
  for(let k=-12;k<=45;k++){const i=(i0+k+N)%N,j=(i+1)%N;if(T.gap[i]||T.gap[j])continue;
   const dx=T.x[j]-T.x[i],dz=T.z[j]-T.z[i],l2=dx*dx+dz*dz||1,f=Math.max(0,Math.min(1,((c.x-T.x[i])*dx+(c.z-T.z[i])*dz)/l2));
   const px=T.x[i]+dx*f,pz=T.z[i]+dz*f,ps=T.psi[i],lat=(c.x-px)*Math.cos(ps)-(c.z-pz)*Math.sin(ps);
   const dd=Math.hypot(c.x-px,c.z-pz);if(!best||dd<best.dd)best={i,lat,ps,dd}}
  if(!best){c._wl=null;continue}
  const i=best.i,lim=T.hw[i]-.9;
  if(T.wall[i]&&Math.abs(best.lat)>lim&&c._wl!=null&&Math.abs(c._wl)<=lim+.3&&c.y-T.y[i]<3){
   const sg=Math.sign(best.lat),nx=Math.cos(best.ps)*sg,nz=-Math.sin(best.ps)*sg,ov=Math.abs(best.lat)-lim;c.x-=nx*ov;c.z-=nz*ov;
   const vn=c.vx*nx+c.vz*nz;if(vn>0){c.vx-=1.3*vn*nx;c.vz-=1.3*vn*nz;if(vn>4){c.hl=1;if(c.human)Rc.shake=Math.min(1,vn/20)}}
   c._wl=sg*lim;slide(c,nx,nz,dt)}else{c._wl=best.lat;if(T.wall[i]&&Math.abs(best.lat)>lim-.35){const sg=Math.sign(best.lat);slide(c,Math.cos(best.ps)*sg,-Math.sin(best.ps)*sg,dt)}}}}
const st0=step;step=function(dt){st0.apply(this,arguments);try{if(RACE){if(!P.noKerb)kerb(RACE,dt);if(!P.noBS)bStep(RACE,dt)}}catch(e){if(!P._sErr){P._sErr=1;console.warn('solid',e)}}};
})();
