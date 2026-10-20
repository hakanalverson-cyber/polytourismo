/* ===== Poly Tourismo v9 layer: solid (every barrier, fence, tyre wall, bale, pole and tunnel mound is a real collider, in every mode) ===== */
(function v9solid(){
'use strict';
const P=window.PT8;
const NAMES={bale:.9,barrels:.7,bollard:.35,crates:.85,dumpster:1.25,boulderG:1.25,boulderR:1.25,boulderS:1.1,cairn:.8,hoodoo:1.0,pole:.3,snowpole:.25,lamp:.35,logs:1.0,stump:.5,post:.3,cactus:.5,busstop:.9};
const X=T=>T._bx||(T._bx={segs:[],pts:[]});
P.addSeg=(T,x1,z1,x2,z2,r)=>{if(!T)return;X(T).segs.push([x1,z1,x2,z2,r||.3]);T._bg=null};
P.addPt=(T,x,z,r)=>{if(!T)return;X(T).pts.push([x,z,r||.5]);T._bg=null};
/* collect colliders from the finished world */
function collect(sc,T){const x=X(T),log=sc.userData.props||[],L=P.PROPLIB||{};let prev=null;
 for(const p of log){if(p.n==='fencepost'){if(prev&&Math.hypot(prev.x-p.x,prev.z-p.z)<4.8)x.segs.push([prev.x,prev.z,p.x,p.z,.22]);prev=p;continue}
  prev=null;const r=NAMES[p.n];if(r){const f=L[p.n]&&L[p.n].fr?Math.min(1.6,L[p.n].fr*.8):r;x.pts.push([p.x,p.z,Math.max(.3,f*(p.s||1)*.9)])}}
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
function hit(Rc,c,v,nx,nz){if(P.hitFx)P.hitFx(Rc,c,v,c.x-nx*.9,c.y+.35,c.z-nz*.9,nx,nz);if(cd>0)return;cd=.3;Rc.shake=Math.max(Rc.shake||0,Math.min(1,v/16));if(P.sfx)P.sfx('crash');if(P.dmgOn&&P.dmgOn(Rc)&&P.hurt&&!((c.cdT||0)>0)){c.cdT=.7;P.hurt(Rc,c,v,nx,nz)}}
function bStep(Rc,dt){const T=Rc.T;if(!T||Rc.state!=='race')return;cd-=dt;const g=T._bg||grid(T);if(!g.size)return;
 for(const c of Rc.cars){if(!c.human||c.fin||c.respT>0||c.exp>0)continue;const cx=Math.floor(c.x/8),cz=Math.floor(c.z/8),gy=T.terr?T.terr(c.x,c.z):c.y;if(c.y-gy>3.2)continue;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=g.get((cx+a)+','+(cz+b));if(!l)continue;
   for(const s of l){let qx,qz,r;if(s.length===5){const dx=s[2]-s[0],dz=s[3]-s[1],ll=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((c.x-s[0])*dx+(c.z-s[1])*dz)/ll));qx=s[0]+dx*t;qz=s[1]+dz*t;r=s[4]}else{qx=s[0];qz=s[1];r=s[2]}
    const ex=c.x-qx,ez=c.z-qz,d=Math.hypot(ex,ez),R=r+.88;if(d>=R||d<.001)continue;const nx=ex/d,nz=ez/d,vn=c.vx*nx+c.vz*nz;c.x+=nx*(R-d);c.z+=nz*(R-d);
    {const vt=Math.abs(-c.vx*nz+c.vz*nx);if(vt>8&&P.scrapeFx&&((c._scT=(c._scT||0)-dt)<=0)){c._scT=.05;P.scrapeFx(c,c.x-nx*.9,c.y+.3,c.z-nz*.9,vt,nx,nz)}}
    if(vn<0){c.vx-=1.25*vn*nx;c.vz-=1.25*vn*nz;c.vx*=.88;c.vz*=.88;if(-vn>2.2)hit(Rc,c,-vn,nx,nz)}}}}}
const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{collect(sc,T)}catch(e){console.warn('solid',e)}return sc};

const st0=step;step=function(dt){st0.apply(this,arguments);try{if(RACE)bStep(RACE,dt)}catch(e){if(!P._sErr){P._sErr=1;console.warn('solid',e)}}};
})();
