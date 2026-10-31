/* ===== Poly GT layer: Free Roam dressing (villages, farms, wind farm, roadside life, harbour, camp) built from the CC0 model library ===== */
(function frdress(){
'use strict';
const P=window.PT8,D={items:[],by:new Map(),planned:false};
const FM=()=>P.FM;
const PI=Math.PI,cl=(v,a,b)=>v<a?a:v>b?b:v;
/* ---------- placement helpers (used by the town code too) ---------- */
/* put a model on the ground with a buried foundation; adds wall colliders */
D.mput=function(ctx,n,x,z,ry,s,o){o=o||{};const fm=FM(),m=fm&&fm.get(n);if(!m)return null;const sz=m.size,sy=o.sy||1,hw=sz[0]*s/2*(o.fp||.92),hd=sz[2]*s/2*(o.fp||.92),c=Math.cos(ry),sn=Math.sin(ry);
 let lo=1e9,hi=-1e9;for(const[a,b]of[[0,0],[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){const h=ctx.gy(x+a*c+b*sn,z-a*sn+b*c);lo=Math.min(lo,h);hi=Math.max(hi,h)}
 let y=o.dy!=null?ctx.gy(x,z)+o.dy:hi-.12;
 if(!o.noSkirt&&hi-lo>.18&&o.dy==null)ctx.G.box(x,lo-.9,z,hw*2+.5,y-lo+.9+.14,hd*2+.5,o.skirt||[.4,.38,.35],ry);
 fm.put(ctx.G,n,x,y,z,s,ry,o);
 if(o.solid!==false){const k=o.solidScale||1,pts=[[-hw*k,-hd*k],[hw*k,-hd*k],[hw*k,hd*k],[-hw*k,hd*k]].map(([a,b])=>[x+a*c+b*sn,z-a*sn+b*c]);
  for(let i=0;i<4;i++){const p=pts[i],q=pts[(i+1)%4];ctx.sg(p[0],p[1],q[0],q[1],.5)}}
 return{x,y,z,top:y+sz[1]*s*sy,hw,hd}};
/* real-world fit: width W metres, height H metres, depth capped at maxD; returns {s,sy} for mput/put */
D.fit=function(n,W,H,maxD){const m=FM().get(n);if(!m)return{s:1,sy:1};const z=m.size;let s=W/z[0];if(maxD&&z[2]*s>maxD)s=maxD/z[2];return{s,sy:H/(z[1]*s)}};
/* the game's own cars, parked */
D.cars=['c26','c50','c67','c91','c5','c28','c32','c39','c57','c12','c18','c22','c25','c40','c41','c48','c55','c58','c62','c83','c96','c101','c111','c114','c117','c121','c19','c31','c54','c64','lr','ford','ster','merc','must','urus','c93'];
D.lamp=function(ctx,x,z,ry){const y=ctx.gy(x,z),c=Math.cos(ry||0),s=Math.sin(ry||0);ctx.G.box(x,y,z,.22,6.2,.22,[.25,.26,.3]);ctx.G.box(x+c*.8,y+6.1,z-s*.8,1.8,.18,.28,[.25,.26,.3],ry||0);ctx.N.box(x+c*1.45,y+5.9,z-s*1.45,.8,.16,.45,[1.6,1.5,1.1],ry||0);ctx.pt(x,z,.4)};
/* ---------- planning (runs once per world, after the roads and stops exist): the island dressing is planned in frisdress.js ---------- */
D.plan=function(E){if(D.planned)return D;D.planned=true;D.items=[];if(P.FRDI&&P.FRDI.plan)P.FRDI.plan(D,E);return D};
/* ---------- chunk assembly ---------- */
D.index=function(CH){D.by.clear();for(const it of D.items){const k=Math.floor(it.x/CH)+','+Math.floor(it.z/CH);let a=D.by.get(k);if(!a)D.by.set(k,a=[]);a.push(it)}};
const TINT0=[1,1,1];
D.chunk=function(ctx,cx,cz){const a=D.by.get(cx+','+cz);if(!a)return;const F=P.FRW,fm=FM();
 for(const it of a){const x=it.x,z=it.z;
  switch(it.t){
  case'house':D.mput(ctx,it.n,x,z,it.ry,it.s,{tint:it.tint,sy:it.sy,v:(H2h(x,z)-.5)*.12});break;
  case'car':ctx.park(x,z,it.ry,Math.floor(x+z));break;
  case'fence':if(P.FRT)P.FRT.fence(ctx,x,z,it.x2,it.z2,it.h||1.2,it.k||'rail',it.solid);break;
  case'yard':if(P.FRT)P.FRT.yard(ctx,x,z,it.ry,it.w);break;
  case'dirt':if(P.FRT)P.FRT.dirtPatch(ctx,x,z,it.ry,it.w,it.d);break;
  case'm':D.mput(ctx,it.n,x,z,it.ry,it.s,{solid:it.solid!==false,noSkirt:it.noSkirt,fp:it.fp,tint:it.tint,sy:it.sy,skirt:it.skirt,v:it.v==null?0:it.v});if(it.fence)ctx.pt(x,z,.7);if(it.pt)ctx.pt(x,z,it.pt);break;
  case'tile':{const q=fm.size(it.n),y=ctx.gy(x,z);fm.put(ctx.G,it.n,x,y-.38*it.s*.5,z,it.s,it.ry,{});break}
  case'tree':ctx.tree(x,z,it.s||1,it.k);break;
  case'lamp':D.lamp(ctx,x,z,it.ry);break;
  case'pole':{const y=ctx.gy(x,z);fm.put(ctx.G,'l_pole',x,y,z,1,it.ry,{});ctx.pt(x,z,.4);break}
  case'bb':{const y=ctx.gy(x,z);fm.put(ctx.G,it.n,x,y,z,it.s,it.ry,{});ctx.pt(x-Math.cos(it.ry)*3.2,z+Math.sin(it.ry)*3.2,.5);ctx.pt(x+Math.cos(it.ry)*3.2,z-Math.sin(it.ry)*3.2,.5);break}
  case'turbine':{const y=ctx.gy(x,z);fm.put(ctx.G,'l_turbine',x,y-.2,z,2.1,it.ry,{});ctx.pt(x,z,2.4);break}
  case'sign':{const y=ctx.gy(x,z);if(F&&F.sign){const s=F.sign(it.txt,10,2.4,'#1b2a1e','#ffffff');s.position.set(x,y+4.6,z);ctx.group.add(s)}break}
  case'store':{const o=D.mput(ctx,'b_StoreBuilding_01',x,z,it.ry,1.7,{});if(o&&F&&F.sign){const fx=Math.sin(it.ry),fz=Math.cos(it.ry),s=F.sign(it.txt,9,2,'#2a1a10','#ffd34d');s.position.set(x+fx*(o.hd+.4),o.y+6.0,z+fz*(o.hd+.4));s.rotation.y=it.ry;ctx.group.add(s)}
   const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx;ctx.park&&0;ctx.park(x+fx*12+ux*6,z+fz*12+uz*6,it.ry+.2,Math.floor(x));ctx.park(x+fx*12-ux*6,z+fz*12-uz*6,it.ry-.1,Math.floor(z));
   D.lamp(ctx,x+fx*13-ux*11,z+fz*13-uz*11,0);break}
  case'camp':{const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx,names=['l_tentR','l_tentB','l_tentG','l_tentR'];
   names.forEach((n,i)=>{const px=x+ux*(i-1.5)*6+fx*(i%2)*2.5,pz=z+uz*(i-1.5)*9+fz*(i%2)*3;fm.put(ctx.G,n,px,ctx.gy(px,pz),pz,1.0,it.ry+(i%2?.3:-.2),{});ctx.pt(px,pz,2.2)});
   const gx=x+fx*10,gz=z+fz*10,gy=ctx.gy(gx,gz);ctx.G.cyl(gx,gy,gz,1.2,.3,8,[.35,.33,.3]);ctx.G.cone(gx,gy+.3,gz,.9,1.6,6,[1,.5,.12]);ctx.N.cone&&0;
   for(let i=0;i<6;i++){const t=i/6*6.28,bx=gx+Math.cos(t)*2.1,bz=gz+Math.sin(t)*2.1;ctx.G.box(bx,ctx.gy(bx,bz),bz,.9,.5,.5,[.4,.28,.18],t)}
   for(let i=0;i<5;i++){const tx=x+ux*(R2(x,i)*40-20)-fx*(6+i*3),tz=z+uz*(R2(z,i)*40-20)-fz*(6+i*3);ctx.tree(tx,tz,1.1,R2(i,x))}break}
  case'harbor':{const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx;
   for(let i=0;i<14;i++){const px=x+fx*(i*4-6),pz=z+fz*(i*4-6),h=Math.max(ctx.gy(px,pz),.8);ctx.G.box(px,h+.4,pz,4.4,.35,4.2,[.55,.4,.26],it.ry);if(i%3===0)for(const sd of[-1,1])ctx.G.box(px+ux*2.0*sd,-2,pz+uz*2.0*sd,.4,h+2.6,.4,[.32,.24,.16])}
   const bx=x+fx*34+ux*7,bz=z+fz*34+uz*7;ctx.G.box(bx,.3,bz,3,1,8,[.95,.95,.95],it.ry);ctx.G.cone(bx+fx*5,.3,bz+fz*5,1.5,1,6,[.95,.95,.95]);ctx.G.box(bx,1.3,bz,2,1.2,3,[.85,.3,.25],it.ry);
   const bx2=x+fx*20-ux*7,bz2=z+fz*20-uz*7;ctx.G.box(bx2,.3,bz2,2.6,.9,6.5,[.25,.45,.8],it.ry);ctx.G.box(bx2,1.2,bz2,1.8,1.1,2.4,[.95,.95,.9],it.ry);
   const hx=x-fx*10+ux*14,hz=z-fz*10+uz*14;{const f=D.fit('b_ResidentBuilding_01',10,7.5);D.mput(ctx,'b_ResidentBuilding_01',hx,hz,it.ry+PI,f.s,{sy:f.sy})};D.mput(ctx,'b_WoodenCrates_01',hx+fx*4+ux*6,hz+fz*4+uz*6,.3,1.2,{solid:false});D.lamp(ctx,x-fx*2+ux*4,z-fz*2+uz*4,0);break}
  }}};
const H2h=(a,b)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const R2=(a,b)=>H2h(Math.floor(a*7)+b*131,b*17+Math.floor(a));
P.FRD=D;
})();
