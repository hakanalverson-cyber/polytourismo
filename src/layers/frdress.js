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
D.lamp=function(ctx,x,z,ry){const y=ctx.gy(x,z),c=Math.cos(ry||0),s=Math.sin(ry||0);ctx.G.box(x,y,z,.22,6.2,.22,[.25,.26,.3]);ctx.G.box(x+c*.8,y+6.1,z-s*.8,1.8,.18,.28,[.25,.26,.3],ry||0);ctx.N.box(x+c*1.45,y+5.9,z-s*1.45,.8,.16,.45,[1.6,1.5,1.1],ry||0);ctx.pt(x,z,.4)};
/* ---------- planning (runs once, before the road raster is built) ---------- */
D.plan=function(E){if(D.planned)return D;D.planned=true;
 const {ROADS,fullH,sd,W,dense,lane,inTown,PLAT,rng,fbm,H2}=E,R=rng(90210);
 const rd={};for(const r of ROADS)rd[r.id]=r;
 const dn={};const dp=id=>dn[id]||(dn[id]=dense(rd[id]||ROADS.find(r=>r.id===id)));
 const near=(x,z,skip)=>{let best=1e9,bi=null;for(const r of ROADS){if(skip&&skip(r))continue;const d=dp(r.id);for(let i=0;i<d.length;i+=2){const dd=Math.hypot(d[i][0]-x,d[i][1]-z);if(dd<best){best=dd;bi=[r,i,d]}}}return{d:best,r:bi&&bi[0],i:bi&&bi[1],pts:bi&&bi[2]}};
 const flat=(x,z,rad)=>{let lo=1e9,hi=-1e9;for(const[a,b]of[[0,0],[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]]){const h=fullH(x+a*rad,z+b*rad);lo=Math.min(lo,h);hi=Math.max(hi,h)}return hi-lo};
 const okLand=(x,z,mn)=>sd(W.land,x,z)>(mn||120)&&sd(W.lake,x,z)<-40;
 const nearPlat=(x,z,m)=>PLAT.some(p=>Math.abs(x-p.x)<p.w/2+(m||60)&&Math.abs(z-p.z)<p.d/2+(m||60));
 const taken=[];const free=(x,z,r)=>{for(const t of taken)if(Math.hypot(t[0]-x,t[1]-z)<t[2]+r)return false;return true};
 const add=(t,x,z,o)=>{D.items.push(Object.assign({t,x,z},o))};
 const roadSet=['loop','cn','cs','lake','cw'];
 /* roadside villages */
 const vc=[];for(const id of roadSet){const d=dp(id),r=rd[id];for(let i=12;i<d.length-12;i+=14){const p=d[i];vc.push({x:p[0],z:p[1],i,id,r,d})}}
 for(let k=vc.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[vc[k],vc[j]]=[vc[j],vc[k]]}
 const villages=[];
 for(const c of vc){if(villages.length>=8)break;if(!okLand(c.x,c.z,160)||inTown(c.x,c.z,320)||nearPlat(c.x,c.z,120))continue;const h=fullH(c.x,c.z);if(h<8||h>62||flat(c.x,c.z,60)>3.4)continue;
  if(villages.some(v=>Math.hypot(v.x-c.x,v.z-c.z)<780))continue;villages.push(c)}
 const hp=['b_ResidentBuilding_01','b_ResidentBuilding_03','b_ResidentBuilding_05','b_ResidentBuilding_06','b_ResidentBuilding_04','building-small-a','building-small-d','building-small-a','building-small-d','b_ResidentBuilding_02'];
 const tints=[[1,1,1],[1.08,.96,.9],[.9,1.02,1.08],[1.05,1.05,.88],[.95,.9,1.05],[1.08,1,.95]];
 villages.forEach((v,vi)=>{const d=v.d,hw=v.r.hw,n=3+(R()*2|0);let cnt=0;
  const tan=(i)=>{const a=d[Math.max(0,i-3)],b=d[Math.min(d.length-1,i+3)],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return[(b[0]-a[0])/L,(b[1]-a[1])/L]};
  for(const side of[-1,1])for(let k=-n;k<=n;k++){const idx=cl(v.i+Math.round((k*26+(R()-.5)*8)/6)*1,2,d.length-3),p=d[idx],t=tan(idx),nx=t[1]*side,nz=-t[0]*side,lat=hw+12+R()*6;
   const x=p[0]+nx*lat,z=p[1]+nz*lat;if(!okLand(x,z,70)||fullH(x,z)<6||flat(x,z,9)>3.2)continue;if(near(x,z,r=>r.id===v.id).d<hw+14)continue;if(!free(x,z,11))continue;
   const nm=hp[(R()*hp.length)|0],k2=nm[0]==='b'?(nm==='b_ResidentBuilding_02'?1.8:nm==='b_ResidentBuilding_04'?1.5:nm==='b_ResidentBuilding_06'?1.35:2):(10+R()*4);
   add('house',x,z,{n:nm,ry:Math.atan2(-nx,-nz),s:k2,tint:tints[(R()*tints.length)|0]});taken.push([x,z,9]);cnt++;
   if(R()<.55){const tx=x-nx*(-9)-t[0]*10,tz=z-nz*(-9)-t[1]*10;if(free(tx,tz,3)&&fullH(tx,tz)>3)add('tree',tx,tz,{s:1+R()*.5,k:R()});}}
  /* street lamps + plaza */
  for(let k=-n;k<=n;k+=2){const idx=cl(v.i+k*5,2,d.length-3),p=d[idx],t=tan(idx);add('lamp',p[0]+t[1]*(hw+2.5),p[1]-t[0]*(hw+2.5),{ry:Math.atan2(-t[1],t[0])})}
  if(cnt<3)return;add('sign',v.x,v.z,{txt:['OAKFIELD','PINE HOLLOW','STONEBRIDGE','MILLBROOK','HARBOR END','REDWOOD','CALDER'][vi%7],x2:null});
  const p0=d[v.i],t0=tan(v.i);const sx=p0[0]+t0[1]*(hw+22),sz=p0[1]-t0[0]*(hw+22);if(free(sx,sz,10)&&near(sx,sz,r=>r.id===v.id).d>hw+16){add('m',sx,sz,{n:'pavement-fountain',s:13,ry:0,solid:true,noSkirt:true,v:.0});taken.push([sx,sz,10])}
  v.done=true});
 /* farms with a dirt lane each */
 const farms=[];const cand=[];for(let x=420;x<6300;x+=150)for(let z=360;z<4300;z+=150){const jx=x+(H2(x,z)-.5)*120,jz=z+(H2(z,x)-.5)*120;cand.push([jx,jz])}
 for(let k=cand.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[cand[k],cand[j]]=[cand[j],cand[k]]}
 for(const [x,z] of cand){if(farms.length>=6)break;if(!okLand(x,z,200)||inTown(x,z,320)||nearPlat(x,z,150))continue;const h=fullH(x,z);if(h<6||h>46||flat(x,z,55)>2.2)continue;
  const nr=near(x,z,r=>r.id[0]==='t'&&r.id.length<=3);if(nr.d<90||nr.d>260)continue;if(villages.some(v=>Math.hypot(v.x-x,v.z-z)<420)||farms.some(f=>Math.hypot(f.x-x,f.z-z)<700))continue;
  const p=nr.pts[nr.i],fx=(p[0]-x)/nr.d,fz=(p[1]-z)/nr.d;/* front faces the road */
  farms.push({x,z,fx,fz,p,r:nr.r})}
 farms.forEach((f,k)=>{const ex=f.x+f.fx*26,ez=f.z+f.fz*26;lane(`ln${k}`,[[f.p[0],f.p[1]],[(f.p[0]+ex)/2+(R()-.5)*18,(f.p[1]+ez)/2+(R()-.5)*18],[ex,ez]],3.6);
  const ry=Math.atan2(f.fx,f.fz),ux=f.fz,uz=-f.fx;/* u = right-hand axis */
  const at=(u,v)=>[f.x+ux*u+f.fx*v,f.z+uz*u+f.fz*v];
  const place=(nm,u,v,s,o)=>{const q=at(u,v);add('m',q[0],q[1],Object.assign({n:nm,ry,s},o||{}))};
  place('b_FarmerHouse',-16,4,1.9);place('b_Barn_02',15,-4,1.8);place('b_Silo_01',29,-10,1.9);place('b_Silo_02',33,-2,2);place('b_ChickenCoop',-6,-12,1.8);
  place('b_Haystack_04',-26,-6,1.8,{solid:false});place('b_Haystack_01',-30,-14,1.7,{solid:false});place('b_Well_02',2,14,2,{solid:false});
  for(let i=-3;i<=3;i++){if(Math.abs(i)<1)continue;const a=at(i*9,18),b=at(i*9,18);add('m',a[0],a[1],{n:'b_WoodFence_02',ry:ry+PI/2,s:2.1,solid:false,noSkirt:true,fence:1})}
  const tr=at(-10,-26);add('m',tr[0],tr[1],{n:['vehicle-truck-red','vehicle-truck-yellow','vehicle-truck-green'][k%3],ry:ry+.6,s:2.3,solid:true,fp:.8});
  /* crop plots behind the barn */
  const tiles=['b_FarmLand_02','b_FarmLand_03','b_FarmLand_04','b_FarmLand_05','b_FarmLand_07','b_FarmLand_09','b_FarmLand_10','b_FarmLand_06','b_FarmLand_08'];
  for(let a=-1;a<=1;a++)for(let b=0;b<3;b++){const q=at(a*21,-44-b*21);if(!okLand(q[0],q[1],50))continue;add('tile',q[0],q[1],{n:tiles[(a+1+b*3+k*2)%tiles.length],ry:ry+(((a+b)&1)?PI/2:0),s:4.2})}
  taken.push([f.x,f.z,70]);
  for(let i=0;i<8;i++){const q=at(-40+R()*80,26+R()*20),fh=fullH(q[0],q[1]);if(fh>4)add('tree',q[0],q[1],{s:1+R()*.6,k:R()})}});
 D.villages=villages;D.farms=farms;
 /* wind farm on the hills */
 const hc=[];for(let x=500;x<6200;x+=120)for(let z=450;z<4200;z+=120){const h=fullH(x,z);if(h>20&&h<130&&okLand(x,z,150)&&!nearPlat(x,z,200)&&!inTown(x,z,300))hc.push([x,z,h])}
 for(let k=hc.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[hc[k],hc[j]]=[hc[j],hc[k]]}
 const turb=[];for(const c of hc){if(turb.length>=9)break;if(near(c[0],c[1]).d<100||flat(c[0],c[1],30)>8)continue;if(turb.some(t=>Math.hypot(t[0]-c[0],t[1]-c[1])<300)||villages.some(v=>Math.hypot(v.x-c[0],v.z-c[1])<300))continue;if(Math.hypot(c[0]-4650,c[1]-1512)<260)continue;turb.push(c);add('turbine',c[0],c[1],{ry:R()*6.28})}
 /* roadside: stores, billboards, poles */
 let ns=0;for(const id of['cn','cs','loop']){const d=dp(id),r=rd[id];for(let i=40;i<d.length-40;i+=36){if(ns>=4)break;const p=d[i],a=d[i-3],b=d[i+3],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,side=R()<.5?-1:1,nx=tz*side,nz=-tx*side,x=p[0]+nx*(r.hw+20),z=p[1]+nz*(r.hw+20);
   if(R()>.25||!okLand(x,z,150)||inTown(x,z,300)||fullH(x,z)<5||flat(x,z,14)>2||!free(x,z,24)||near(x,z,q=>q.id===id).d<r.hw+18)continue;
   add('store',x,z,{ry:Math.atan2(-nx,-nz),txt:['ROADSIDE DINER','FUEL & FOOD','GENERAL STORE','TRUCK STOP'][ns%4],nx,nz});taken.push([x,z,22]);ns++}}
 for(const id of['loop','cn','cs','cw']){const d=dp(id),r=rd[id];for(let i=60;i<d.length-60;i+=170+(R()*60|0)){const p=d[i],a=d[i-3],b=d[i+3],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,side=R()<.5?-1:1,nx=tz*side,nz=-tx*side,x=p[0]+nx*(r.hw+9),z=p[1]+nz*(r.hw+9);
   if(!okLand(x,z,100)||inTown(x,z,300)||nearPlat(x,z,40)||!free(x,z,8)||near(x,z,q=>q.id===id).d<r.hw+7||fullH(x,z)<3)continue;add('bb',x,z,{n:['l_bbA','l_bbB','l_bbC'][(R()*3)|0],ry:Math.atan2(-nx,-nz),s:1.5});taken.push([x,z,8])}}
 for(const id of['cn','cs','lake','mtn','cw']){const d=dp(id),r=rd[id];for(let i=10;i<d.length-10;i+=11){const p=d[i],a=d[i-3],b=d[i+3],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,x=p[0]+tz*(r.hw+4),z=p[1]-tx*(r.hw+4);
   if(inTown(x,z,100)||fullH(x,z)<2.6||!okLand(x,z,40)||villages.some(v=>Math.hypot(v.x-x,v.z-z)<130))continue;add('pole',x,z,{ry:Math.atan2(tz,-tx)})}}
 /* lakeside camp */
 {const d=dp('lake'),mid=d[Math.floor(d.length*.45)],t=d[Math.floor(d.length*.45)+4],L=Math.hypot(t[0]-mid[0],t[1]-mid[1])||1,tx=(t[0]-mid[0])/L,tz=(t[1]-mid[1])/L;
  for(const side of[-1,1]){const x=mid[0]+tz*side*38,z=mid[1]-tx*side*38;if(okLand(x,z,60)&&fullH(x,z)>3.5&&flat(x,z,14)<2.4&&near(x,z,r=>r.id==='lake').d>26){add('camp',x,z,{ry:Math.atan2(-tz*side,tx*side)});taken.push([x,z,30]);break}}}
 /* south-coast harbour */
 {const d=dp('cs'),i=Math.floor(d.length*.45),p=d[i],a=d[i-3],b=d[i+3],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L;let sx=nx,sz=nz;if(sd(W.land,p[0]+sx*60,p[1]+sz*60)>sd(W.land,p[0]-sx*60,p[1]-sz*60)){sx=-sx;sz=-sz}
  let x=p[0],z=p[1];for(let s=0;s<700;s+=8){x=p[0]+sx*s;z=p[1]+sz*s;if(sd(W.land,x,z)<30)break}
  add('harbor',x,z,{ry:Math.atan2(sx,sz)})}
 return D};
/* ---------- chunk assembly ---------- */
D.index=function(CH){D.by.clear();for(const it of D.items){const k=Math.floor(it.x/CH)+','+Math.floor(it.z/CH);let a=D.by.get(k);if(!a)D.by.set(k,a=[]);a.push(it)}};
const TINT0=[1,1,1];
D.chunk=function(ctx,cx,cz){const a=D.by.get(cx+','+cz);if(!a)return;const F=P.FRW,fm=FM();
 for(const it of a){const x=it.x,z=it.z;
  switch(it.t){
  case'house':D.mput(ctx,it.n,x,z,it.ry,it.s,{tint:it.tint,v:(H2h(x,z)-.5)*.12});ctx.cp&&0;break;
  case'm':D.mput(ctx,it.n,x,z,it.ry,it.s,{solid:it.solid!==false,noSkirt:it.noSkirt,fp:it.fp,tint:it.tint,v:it.v==null?0:it.v});if(it.fence)ctx.pt(x,z,.7);break;
  case'tile':{const q=fm.size(it.n),y=ctx.gy(x,z);fm.put(ctx.G,it.n,x,y-.38*it.s*.5,z,it.s,it.ry,{});break}
  case'tree':ctx.tree(x,z,it.s||1,it.k);break;
  case'lamp':D.lamp(ctx,x,z,it.ry);break;
  case'pole':{const y=ctx.gy(x,z);fm.put(ctx.G,'l_pole',x,y,z,1,it.ry,{});ctx.pt(x,z,.4);break}
  case'bb':{const y=ctx.gy(x,z);fm.put(ctx.G,it.n,x,y,z,it.s,it.ry,{});ctx.pt(x-Math.cos(it.ry)*3.2,z+Math.sin(it.ry)*3.2,.5);ctx.pt(x+Math.cos(it.ry)*3.2,z-Math.sin(it.ry)*3.2,.5);break}
  case'turbine':{const y=ctx.gy(x,z);fm.put(ctx.G,'l_turbine',x,y-.2,z,1.7,it.ry,{});ctx.pt(x,z,1.9);break}
  case'sign':{const y=ctx.gy(x,z);if(F&&F.sign){const s=F.sign(it.txt,10,2.4,'#1b2a1e','#ffffff');s.position.set(x,y+4.6,z);ctx.group.add(s)}break}
  case'store':{const o=D.mput(ctx,'b_StoreBuilding_01',x,z,it.ry,2.9,{});if(o&&F&&F.sign){const fx=Math.sin(it.ry),fz=Math.cos(it.ry),s=F.sign(it.txt,9,2,'#2a1a10','#ffd34d');s.position.set(x+fx*(o.hd+.4),o.y+7.6,z+fz*(o.hd+.4));s.rotation.y=it.ry;ctx.group.add(s)}
   const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx;ctx.park&&0;D.mput(ctx,['vehicle-truck-red','vehicle-truck-yellow'][(Math.floor(x)&1)],x+fx*14+ux*7,z+fz*14+uz*7,it.ry+PI/2*0+.2,2.3,{fp:.8});
   D.lamp(ctx,x+fx*13-ux*11,z+fz*13-uz*11,0);break}
  case'camp':{const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx,names=['l_tentR','l_tentB','l_tentG','l_tentR'];
   names.forEach((n,i)=>{const px=x+ux*(i-1.5)*9+fx*(i%2)*3,pz=z+uz*(i-1.5)*9+fz*(i%2)*3;fm.put(ctx.G,n,px,ctx.gy(px,pz),pz,2.2,it.ry+(i%2?.3:-.2),{});ctx.pt(px,pz,2.8)});
   const gx=x+fx*10,gz=z+fz*10,gy=ctx.gy(gx,gz);ctx.G.cyl(gx,gy,gz,1.2,.3,8,[.35,.33,.3]);ctx.G.cone(gx,gy+.3,gz,.9,1.6,6,[1,.5,.12]);ctx.N.cone&&0;
   for(let i=0;i<6;i++){const t=i/6*6.28,bx=gx+Math.cos(t)*2.1,bz=gz+Math.sin(t)*2.1;ctx.G.box(bx,ctx.gy(bx,bz),bz,.9,.5,.5,[.4,.28,.18],t)}
   for(let i=0;i<5;i++){const tx=x+ux*(R2(x,i)*40-20)-fx*(6+i*3),tz=z+uz*(R2(z,i)*40-20)-fz*(6+i*3);ctx.tree(tx,tz,1.1,R2(i,x))}break}
  case'harbor':{const fx=Math.sin(it.ry),fz=Math.cos(it.ry),ux=fz,uz=-fx;
   for(let i=0;i<14;i++){const px=x+fx*(i*4-6),pz=z+fz*(i*4-6),h=Math.max(ctx.gy(px,pz),.8);ctx.G.box(px,h+.4,pz,4.4,.35,4.2,[.55,.4,.26],it.ry);if(i%3===0)for(const sd of[-1,1])ctx.G.box(px+ux*2.0*sd,-2,pz+uz*2.0*sd,.4,h+2.6,.4,[.32,.24,.16])}
   const bx=x+fx*34+ux*7,bz=z+fz*34+uz*7;ctx.G.box(bx,.3,bz,3,1,8,[.95,.95,.95],it.ry);ctx.G.cone(bx+fx*5,.3,bz+fz*5,1.5,1,6,[.95,.95,.95]);ctx.G.box(bx,1.3,bz,2,1.2,3,[.85,.3,.25],it.ry);
   const bx2=x+fx*20-ux*7,bz2=z+fz*20-uz*7;ctx.G.box(bx2,.3,bz2,2.6,.9,6.5,[.25,.45,.8],it.ry);ctx.G.box(bx2,1.2,bz2,1.8,1.1,2.4,[.95,.95,.9],it.ry);
   const hx=x-fx*10+ux*14,hz=z-fz*10+uz*14;D.mput(ctx,'b_ResidentBuilding_01',hx,hz,it.ry+PI,2.2,{});D.mput(ctx,'b_WoodenCrates_01',hx+fx*4+ux*6,hz+fz*4+uz*6,.3,2.2,{solid:false});D.lamp(ctx,x-fx*2+ux*4,z-fz*2+uz*4,0);break}
  }}};
const H2h=(a,b)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const R2=(a,b)=>H2h(Math.floor(a*7)+b*131,b*17+Math.floor(a));
P.FRD=D;
})();
