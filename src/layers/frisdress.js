/* ===== Poly GT layer: Free Roam island dressing (hill towns, seafront, cypress roads, road kit) from the supplied + CC0 models =====
   Runs once when the world is built (P.FRD.plan -> P.FRDI.plan): fills P.FRD.items, which frdress.js turns into geometry chunk by chunk.
   Houses are packed on the hillsides facing downhill (the way the old towns stack), round a paved piazza with its statue and campanile. */
(function frisdress(){
'use strict';
const P=window.PT8,PI=Math.PI,TAU=PI*2,CH=192;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const have=n=>!!(P.FM&&P.FM.get(n));
const pickW=(list,r)=>{let s=0;for(const q of list)s+=q[2];let t=r()*s;for(const q of list){t-=q[2];if(t<=0)return q}return list[list.length-1]};
/* colour washes multiplied over the baked plaster so one house model makes several different houses */
const WASH=[[1,1,1],[1.07,.99,.88],[1.03,.93,.82],[.97,.91,.88],[.92,.99,1.03],[1.07,1.04,.93],[1,.96,.9],[1.02,.88,.8]];
/* [model, scale, weight, taller-than-modelled] — walls are 6 to 14 m wide at these scales */
const HOUSES=[['md_house_a',1.3,2.2,1.22],['md_house_b',1.15,2.2,1.08],['md_house_c',1.15,2.2,1.12],['md_house_d',.95,1,1.08],['md_house_e',.95,1.6,1.1],['md_house_f',.8,.9,1.2],['md_shop_c',1,.6,1.05]];
const FRONT={md_house_a:0,md_house_b:0,md_house_c:0,md_house_d:0,md_house_e:0,md_house_f:0,md_shop_a:0,md_shop_b:0,md_shop_c:0,md_hotel_a:0,md_hotel_b:0,md_hotel_c:0,md_hotel_d:0,md_farm:0,md_barn_a:0,md_barn_b:0,md_store:0,it_house1:0,it_house2:0,it_ruins:0};
const at=(n,d)=>have(n)?n:d;
function Occ(WX,WZ,cs){const w=Math.ceil(WX/cs)+1,h=Math.ceil(WZ/cs)+1,a=new Uint8Array(w*h);
 return{cs,w,h,a,
  disc(x,z,r){const i0=Math.max(0,Math.floor((x-r)/cs)),i1=Math.min(w-1,Math.floor((x+r)/cs)),j0=Math.max(0,Math.floor((z-r)/cs)),j1=Math.min(h-1,Math.floor((z+r)/cs));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=(i+.5)*cs-x,dz=(j+.5)*cs-z;if(dx*dx+dz*dz<=r*r)a[j*w+i]=1}},
  rect(x,z,hw,hd,ry,m,set){const c=Math.cos(ry),s=Math.sin(ry),R=Math.hypot(hw+m,hd+m),i0=Math.max(0,Math.floor((x-R)/cs)),i1=Math.min(w-1,Math.floor((x+R)/cs)),j0=Math.max(0,Math.floor((z-R)/cs)),j1=Math.min(h-1,Math.floor((z+R)/cs));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=(i+.5)*cs-x,dz=(j+.5)*cs-z,u=dx*c-dz*s,v=dx*s+dz*c;if(Math.abs(u)<=hw+m&&Math.abs(v)<=hd+m){if(set)a[j*w+i]=1;else if(a[j*w+i])return true}}
   return false},
  at(x,z){const i=Math.floor(x/cs),j=Math.floor(z/cs);return i<0||j<0||i>=w||j>=h?1:a[j*w+i]}}}
/* nearest point on any road polyline */
function nearRoad(roads,x,z,maxd){let bd=(maxd||1e9)*(maxd||1e9),b=null;for(const r of roads){for(let i=0;i<r.n-1;i++){const ax=r.x[i],az=r.z[i],ex=r.x[i+1]-ax,ez=r.z[i+1]-az,L2=ex*ex+ez*ez||1,t=clamp(((x-ax)*ex+(z-az)*ez)/L2,0,1),px=ax+ex*t,pz=az+ez*t,d=(x-px)*(x-px)+(z-pz)*(z-pz);if(d<bd){bd=d;b={x:px,z:pz,r,i,d:Math.sqrt(d),hw:r.hw,tx:ex/Math.sqrt(L2),tz:ez/Math.sqrt(L2)}}}}return b}
P.FRDI={have,nearRoad,
plan(D,E){
 const G=E.G,fh=E.fullH,WX=6720,WZ=4720,occ=Occ(WX,WZ,3),R=E.rng(90210),H2=E.H2;D.walks=[];D.items=[];
 const it=o=>{D.items.push(o);return o};
 const grad=(x,z,e)=>[(fh(x+e,z)-fh(x-e,z))/(2*e),(fh(x,z+e)-fh(x,z-e))/(2*e)];
 const slope=(x,z,e)=>{const g=grad(x,z,e||6);return Math.hypot(g[0],g[1])};
 const hasM=n=>have(n);
 /* ---- reserve what is already taken: roads, flat lots, the stop buildings, the sea ---- */
 for(const r of E.ROADS){const m=r.hw+3.2;for(let i=0;i<r.n-1;i++){const dx=r.x[i+1]-r.x[i],dz=r.z[i+1]-r.z[i],L=Math.hypot(dx,dz),k=Math.max(1,Math.ceil(L/2.5));for(let q=0;q<=k;q++)occ.disc(r.x[i]+dx*q/k,r.z[i]+dz*q/k,m)}}
 for(const p of E.PLAT)occ.rect(p.x,p.z,p.w/2,p.d/2,p.ry||0,5,1);
 for(const q of E.POIS){if(['garage','tune','job','office','brand','gas'].includes(q.key))occ.disc(q.x,q.z,34);else if(q.key==='town'||q.key==='view')occ.disc(q.x,q.z,14)}
 /* ---- helpers that put things in the plan ---- */
 const model=(n,x,z,ry,s,o)=>it(Object.assign({t:'m',n,x,z,ry,s},o||{}));
 const prop=(n,x,z,ry,s,o)=>hasM(n)&&!onRoad(x,z)?model(n,x,z,ry,s,Object.assign({solid:false,noSkirt:true},o||{})):null;
 const onRoad=(x,z,m)=>{const q=nearRoad(E.ROADS,x,z,14);return !!q&&q.d<q.hw+(m||2.4)};
 const lampAt=(x,z)=>{if(onRoad(x,z,1.1))return;if(hasM('it_lamp'))model('it_lamp',x,z,0,1,{solid:false,noSkirt:true,pt:.35});else it({t:'lamp',x,z,ry:0})};
 const cypress=(x,z,s)=>{const n=pickW([['md_cypress_a',1,1],['md_cypress_b',1,1]],R)[0];if(hasM(n))model(n,x,z,R()*6.28,(s||1)*(.95+R()*.35),{sy:1.55+R()*.45,solid:false,noSkirt:true,pt:.5,v:(R()-.5)*.14});else it({t:'tree',x,z,s:1.1})};
 const olive=(x,z,s)=>{if(hasM('md_olive'))model('md_olive',x,z,R()*6.28,(s||1)*(1.05+R()*.5),{solid:false,noSkirt:true,pt:.5,v:(R()-.5)*.14});};
 const yard=(x,z,hw,hd,ry)=>E.ZONES.push([x,z,hw*2+3.5,hd*2+7,1,ry]);
 /* a house on the hillside: footprint free, ground not too steep, off the sea */
 function tryHouse(n,s,tall,x,z,ry,lim){
  const m=P.FM.get(n);if(!m)return null;const hw=m.size[0]*s/2*.92,hd=m.size[2]*s/2*.92,c=Math.cos(ry),sn=Math.sin(ry);
  let lo=1e9,hi=-1e9;for(const[a,b]of[[0,0],[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){const h=fh(x+a*c+b*sn,z-a*sn+b*c);lo=Math.min(lo,h);hi=Math.max(hi,h)}
  if(hi-lo>(lim&&lim.rise||3.2)||lo<(lim&&lim.minH||3.4))return null;
  if(occ.rect(x,z,hw,hd,ry,1.4,0))return null;
  occ.rect(x,z,hw,hd,ry,2.5,1);yard(x,z,hw,hd,ry);
  return{hw,hd}}
 /* ---- a town: piazza by the road, campanile, statue, cafe parasols, houses packed round it ---- */
 function town(t,o){
  o=o||{};const r=E.rng((t.x*31+t.z*17)|0),rad=t.rad,cx=t.x,cz=t.z,road=nearRoad(E.ROADS,cx,cz,160);
  if(!road)return;
  /* the way up the hill and the way to the sea at the centre */
  const g0=grad(cx,cz,30);let ux=g0[0],uz=g0[1],ul=Math.hypot(ux,uz);
  if(ul<.025){const e=40,sx=G.sd(cx+e,cz)-G.sd(cx-e,cz),sz=G.sd(cx,cz+e)-G.sd(cx,cz-e);ux=sx;uz=sz;ul=Math.hypot(ux,uz)||1}
  ux/=ul;uz/=ul;
  /* piazza: uphill of the road, level, paved */
  const side=((road.x-cx)*ux+(road.z-cz)*uz)>0?0:1;void side;
  const pry=Math.atan2(ux,uz),PS=o.pw||30,d0=o.piz||21;let pcx=road.x+ux*(road.hw+d0),pcz=road.z+uz*(road.hw+d0);
  /* slide the square along and up the hill until no road runs across it */
  {let bs=1e9;for(const lat of[0,-18,18,-36,36])for(const dd of[d0,d0+12,d0+24]){const qx=road.x+ux*(road.hw+dd)-uz*lat,qz=road.z+uz*(road.hw+dd)+ux*lat;let hit=0;
    for(let a=-PS/2;a<=PS/2+.1;a+=7.5)for(let b=-PS/2;b<=PS/2+.1;b+=7.5){const q2=nearRoad(E.ROADS,qx+a*ux-b*uz,qz+a*uz+b*ux,14);if(q2&&q2.d<q2.hw+3)hit++}
    const pen=hit*10+Math.abs(lat)*.15+(dd-d0)*.2+(G.sd(qx,qz)<(o.minSd||40)?40:0)+(fh(qx,qz)<3.4?40:0)+slope(qx,qz,10)*30;if(pen<bs){bs=pen;pcx=qx;pcz=qz}}}
  const ph=fh(pcx,pcz);E.PLAT.push({x:pcx,z:pcz,w:PS,d:PS,ry:pry,m:34,h:ph});E.ZONES.push([pcx,pcz,PS,PS,4,pry]);occ.rect(pcx,pcz,PS/2,PS/2,pry,4,1);
  const L=(a,b)=>[pcx+a*Math.sin(pry)+b*Math.cos(pry),pcz+a*Math.cos(pry)-b*Math.sin(pry)]; /* a along uphill, b across */
  const st=L(0,0);if(hasM('it_statue'))model('it_statue',st[0],st[1],pry,.95,{noSkirt:true,solid:true});else if(hasM('md_well'))model('md_well',st[0],st[1],0,2.2,{noSkirt:true});
  for(const[a,b]of[[-9,-9],[-9,9],[9,-9],[9,9]])lampAt(...L(a,b));
  for(const[a,b]of[[-6,-12],[6,12],[-2,8],[3,-12]]){const p=L(a,b);prop('it_parasol',p[0],p[1],r()*6.28,1.05+r()*.2)}
  if(hasM('it_gelato')){const p=L(-13,2);prop('it_gelato',p[0],p[1],pry+PI,1.25,{pt:.8})}
  /* bell tower at the uphill edge of the piazza */
  if(o.tower!==false){const p=L(PS/2+6,-6);const n=at('it_tower','md_hotel_a'),s=n==='it_tower'?(o.towerS||.8):1.3;const m=P.FM.get(n);if(m&&!occ.rect(p[0],p[1],m.size[0]*s/2,m.size[2]*s/2,0,0,0)){model(n,p[0],p[1],pry+PI,s,{fp:.8});occ.rect(p[0],p[1],m.size[0]*s/2,m.size[2]*s/2,0,3,1)}}
  /* hero house or two on the piazza edges, fronts onto the square */
  const heroN=at('it_house2','md_farm');
  for(const[a,b,rot]of[[-6,PS/2+11,PI/2],[-4,-PS/2-11,-PI/2]]){const p=L(a,b),m=P.FM.get(heroN);if(!m)continue;const s=1.0,ry=pry+rot+(FRONT[heroN]||0)+(a<0?0:0);
   if(tryHouse(heroN,s,1,p[0],p[1],ry,{rise:4.2})){model(heroN,p[0],p[1],ry,s,{tint:WASH[(r()*WASH.length)|0],v:(r()-.5)*.1,skirt:[.6,.52,.42]});occ.rect(p[0],p[1],m.size[0]*s/2,m.size[2]*s/2,ry,2.5,1)}}
  cypress(...L(PS/2-2,PS/2-3));cypress(...L(PS/2-2,-PS/2+3));
  /* houses: candidates in rings round the piazza, nearest first */
  const cands=[];const step=8.2;for(let gz=-rad;gz<=rad;gz+=step)for(let gx=-rad;gx<=rad;gx+=step){const x=pcx+gx+(r()-.5)*5,z=pcz+gz+(r()-.5)*5,d=Math.hypot(x-pcx,z-pcz);if(d<PS*.62||d>rad)continue;cands.push({x,z,d:d+r()*rad*.18})}
  cands.sort((a,b)=>a.d-b.d);let n=0;const maxN=o.max||90;
  for(const c of cands){if(n>=maxN)break;const d=Math.hypot(c.x-pcx,c.z-pcz);if(r()>.94*sm(rad,rad*.22,d)+.02)continue;
   const sd=G.sd(c.x,c.z);if(sd<(o.minSd||40))continue;if(occ.at(c.x,c.z))continue;const sl=slope(c.x,c.z,7);if(sl>.62)continue;
   /* front faces the piazza near it, the road further out, otherwise downhill */
   const g=grad(c.x,c.z,8),gl=Math.hypot(g[0],g[1]);let fx,fz;
   if(d<PS*1.4){fx=pcx-c.x;fz=pcz-c.z}else if(gl>.12){fx=-g[0];fz=-g[1]}else{const q=nearRoad(E.ROADS,c.x,c.z,80);if(q){fx=q.x-c.x;fz=q.z-c.z}else{fx=pcx-c.x;fz=pcz-c.z}}
   const fl=Math.hypot(fx,fz)||1;fx/=fl;fz/=fl;
   const q=(o.sea&&sd<o.sea)?[...(o.seaHouses||HOUSES)]:HOUSES,k=pickW(q,r),n0=k[0],s=k[1]*(.9+r()*.22),tall=k[3]*(.95+r()*.3);
   const ry=Math.atan2(fx,fz)+(FRONT[n0]||0);
   const fp=tryHouse(n0,s,tall,c.x,c.z,ry);if(!fp)continue;
   model(n0,c.x,c.z,ry,s,{sy:tall,tint:WASH[(r()*WASH.length)|0],v:(r()-.5)*.1,skirt:[.6,.52,.42]});n++;
   if(r()<.3)cypress(c.x+Math.cos(ry)*(fp.hw+1.8)+Math.sin(ry)*fp.hd*.8,c.z-Math.sin(ry)*(fp.hw+1.8)+Math.cos(ry)*fp.hd*.8,.8);
   else if(r()<.12&&hasM('it_barrel'))prop('it_barrel',c.x+Math.sin(ry)*(fp.hd+1.2)+Math.cos(ry)*(fp.hw*.6),c.z+Math.cos(ry)*(fp.hd+1.2)-Math.sin(ry)*(fp.hw*.6),r()*6.28,1,{pt:.4})}
  /* street lamps and the footpaths pedestrians follow, along the roads that run through the town */
  for(const rd of E.ROADS){let run=[],since=0;const flush=()=>{if(run.length>3){D.walks.push(run.map(p=>[p[0]+p[2]*(rd.hw+2.4),p[1]+p[3]*(rd.hw+2.4)]));D.walks.push(run.map(p=>[p[0]-p[2]*(rd.hw+2.4),p[1]-p[3]*(rd.hw+2.4)]))}run=[]};
   for(let i=0;i<rd.n;i++){const d=Math.hypot(rd.x[i]-cx,rd.z[i]-cz);if(d>rad*.95){flush();continue}
    const a=Math.max(0,i-1),b=Math.min(rd.n-1,i+1);let tx=rd.x[b]-rd.x[a],tz=rd.z[b]-rd.z[a];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;run.push([rd.x[i],rd.z[i],tz,-tx]);
    if(i>0)since+=Math.hypot(rd.x[i]-rd.x[i-1],rd.z[i]-rd.z[i-1]);if(since>26){since=0;const sg=(Math.floor(rd.cum[i]/26)&1)?1:-1;lampAt(rd.x[i]+tz*sg*(rd.hw+1.6),rd.z[i]-tx*sg*(rd.hw+1.6))}}flush()}
  /* the footpath round the piazza */
  {const ring=[];for(let q=0;q<=24;q++){const a=q/24*TAU;ring.push(L(Math.cos(a)*(PS/2-3),Math.sin(a)*(PS/2-3)))}D.walks.push(ring)}
  return{pcx,pcz,pry,n}}
 /* ---- the towns ---- */
 for(const t of E.TOWNS){
  if(t.id==='porto')town(t,{rad:t.rad,piz:26,towerS:.7,sea:0,minSd:70,max:70});
  else if(t.id==='cala')town(t,{rad:t.rad,piz:18,pw:24,tower:false,minSd:20,max:26});
  else town(t,{rad:t.rad,max:t.id==='borgo'?100:80})}
 /* ---- the lighthouse tower and keeper's house on the cape ---- */
 {const f=E.POIS.find(p=>p.key==='town'&&p.id==='faro');if(f){const sx=f.x,sz=f.z,g=grad(sx,sz,20),gl=Math.hypot(g[0],g[1])||1,ry=Math.atan2(-g[0]/gl,-g[1]/gl);
   const n=at('it_tower','md_hotel_a'),m=P.FM.get(n),s=n==='it_tower'?1.0:1.4;if(m){model(n,sx+8,sz+3,ry,s,{fp:.8});occ.disc(sx+8,sz+3,10)}
   const h=at('md_farm','md_house_a');if(!occ.rect(sx-12,sz-8,6,6,ry,1,0)&&P.FM.get(h)){model(h,sx-12,sz-8,ry,1.0,{tint:WASH[3]});occ.rect(sx-12,sz-8,6,6,ry,1,1)}
   for(let q=0;q<5;q++){const a=q*1.3+.4;cypress(sx+Math.cos(a)*22,sz+Math.sin(a)*22,.9)}}}
 /* ---- the summit square: monument, lamps, cypresses, a few cars ---- */
 {const v=E.POIS.find(p=>p.key==='view');if(v){const ry=0;if(hasM('it_statue'))model('it_statue',v.x,v.z,ry,1.1,{noSkirt:true,solid:true});else if(hasM('it_well'))model('it_well',v.x,v.z,0,2,{noSkirt:true});
   for(const[a,b]of[[-14,-14],[14,-14],[-14,14],[14,14]])lampAt(v.x+a,v.z+b);
   for(let q=0;q<6;q++){const a=q/6*TAU+.3;cypress(v.x+Math.cos(a)*17,v.z+Math.sin(a)*17,1)}
   for(let q=0;q<3;q++)it({t:'car',x:v.x-10+q*5.2,z:v.z+13.5,ry:PI});}}
 /* ---- cypress avenues running into the towns, and lamps by the stops ---- */
 for(const t of E.TOWNS){if(t.id==='porto')continue;for(const rd of E.ROADS){let dist=0,last=-1e9;for(let i=0;i<rd.n;i++){const d=Math.hypot(rd.x[i]-t.x,rd.z[i]-t.z);if(i)dist+=Math.hypot(rd.x[i]-rd.x[i-1],rd.z[i]-rd.z[i-1]);if(d<t.rad*.75||d>t.rad+150)continue;if(dist-last<11)continue;last=dist;
   const a=Math.max(0,i-1),b=Math.min(rd.n-1,i+1);let tx=rd.x[b]-rd.x[a],tz=rd.z[b]-rd.z[a];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
   for(const sg of[-1,1]){if(R()<.18)continue;const x=rd.x[i]+tz*sg*(rd.hw+3.4),z=rd.z[i]-tx*sg*(rd.hw+3.4);if(G.sd(x,z)<22||occ.at(x,z))continue;cypress(x,z,.95);occ.disc(x,z,1.6)}}}}
 /* ---- seafront: beach umbrellas and a gelato cart where the sand meets the harbour road ---- */
 if(hasM('it_parasol')){const po=E.TOWNS.find(t=>t.id==='porto');if(po){const sh=G.sites&&G.sites.find(s=>s.id==='porto');const sx=sh&&sh.shore?sh.shore[0]:po.x,sz=sh&&sh.shore?sh.shore[1]:po.z;
   for(let q=0;q<42;q++){const a=(R()-.5)*520,b=R()*46,nx=sh&&sh.nx?sh.nx:0,nz=sh&&sh.nz?sh.nz:1,x=sx+(-nz)*a+nx*(b+6),z=sz+(nx)*a+nz*(b+6);const h=fh(x,z);if(h<.9||h>4.2||occ.at(x,z)||G.sd(x,z)<4)continue;prop('it_parasol',x,z,R()*6.28,1.1+R()*.25);occ.disc(x,z,3.4)}}}
 /* ---- road kit on the mountain roads: delineators on the outside of tight bends, a couple of road-works on the verge ---- */
 for(const rd of E.ROADS){if(rd.type!=='pass')continue;let works=0;
  const dir=i=>{const a=Math.max(0,i-1),b=Math.min(rd.n-1,i+1),tx=rd.x[b]-rd.x[a],tz=rd.z[b]-rd.z[a],l=Math.hypot(tx,tz)||1;return[tx/l,tz/l]};
  const turn=(i,k)=>{const a=Math.atan2(rd.x[i]-rd.x[i-k],rd.z[i]-rd.z[i-k]),b=Math.atan2(rd.x[i+k]-rd.x[i],rd.z[i+k]-rd.z[i]);let da=b-a;while(da>PI)da-=TAU;while(da<-PI)da+=TAU;return da};
  for(let i=6;i<rd.n-6;i+=4){const da=turn(i,6);
   if(Math.abs(da)>.46&&hasM('tp_delin')){const sg=da>0?-1:1;
    for(let k=-1;k<=1;k++){const j=clamp(i+k*2,1,rd.n-2),d=dir(j);prop('tp_delin',rd.x[j]+d[1]*sg*(rd.hw+1.1),rd.z[j]-d[0]*sg*(rd.hw+1.1),Math.atan2(d[0],d[1]),1.25,{pt:.18})}}}
  for(let i=20;i<rd.n-20&&works<2;i+=9){if(R()>.07||!hasM('tp_barA')||Math.abs(turn(i,8))>.12)continue;
   const d=dir(i),sg=R()<.5?-1:1,ry=Math.atan2(d[0],d[1]);works++;
   for(let k=0;k<3;k++)prop(k===1?'tp_barB':'tp_barA',rd.x[i]+d[1]*sg*(rd.hw+1.5)+d[0]*(k*2.1-2.1),rd.z[i]-d[0]*sg*(rd.hw+1.5)+d[1]*(k*2.1-2.1),ry+PI/2,1,{pt:.8});
   for(let k=0;k<4;k++)prop('tp_cone',rd.x[i]+d[1]*sg*(rd.hw-.5-k*.28)-d[0]*(4+k*2.8),rd.z[i]-d[0]*sg*(rd.hw-.5-k*.28)-d[1]*(4+k*2.8),0,1,{pt:.3});
   prop('tp_drum',rd.x[i]+d[1]*sg*(rd.hw+1.5)+d[0]*4.6,rd.z[i]-d[0]*sg*(rd.hw+1.5)+d[1]*4.6,0,1,{pt:.5})}}
 D.index(CH);return D}};
})();
