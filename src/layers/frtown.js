/* ===== Poly GT layer: Free Roam town (real-scale blocks, alleys, driveways, fences, dirt lots, intersections) built from the bridge-map building set ===== */
(function frtown(){
'use strict';
const P=window.PT8,T={};let E=null;
const PI=Math.PI,cl=(v,a,b)=>v<a?a:v>b?b:v;
T.init=e=>{E=e};
const SKIP=new Set(['1,1','4,2','5,1','2,4','6,4','3,1','0,3']),IND=new Set(['7,5','7,4','6,5','0,5','1,5']);
const LC={};
/* a block's layout frame: local u runs along the alley, v across it; world = centre + u*(c,-s) + v*(s,c) (same convention as GB.box) */
function lay(i,j){const k=i+','+j;if(LC[k])return LC[k];const mid=Math.hypot(i-3.5,j-2.5),L={i,j,mid,cx:E.TX0+E.TB*i+E.TB/2,cz:E.TZ0+E.TB*j+E.TB/2,o:(i+j)&1};
 L.ry=L.o?PI/2:0;L.c=Math.cos(L.ry);L.s=Math.sin(L.ry);
 L.type=SKIP.has(k)?'poi':(i===3&&j===3)?'park':IND.has(k)?'ind':mid<2.1?'dt':mid<3.3?'mid':'sub';
 return LC[k]=L}
const tf=(L,u,v)=>[L.cx+u*L.c+v*L.s,L.cz-u*L.s+v*L.c];
T.lay=lay;
/* alleys are real roads (asphalt downtown, gravel in the suburbs) */
T.roads=()=>{const out=[];for(let i=0;i<E.TNX;i++)for(let j=0;j<E.TNZ;j++){const L=lay(i,j);if(L.type==='poi'||L.type==='park')continue;out.push({id:'al'+i+'_'+j,pts:[tf(L,-45,0),tf(L,45,0)],hw:2.4,closed:false,dy:.08,mat:(L.type==='sub'||L.type==='ind')?'lane':'alley'})}return out};
const hash=(a,b)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
/* ---------- ground plates that follow the terrain ---------- */
function rp(ctx,cx,cz,ry,u0,v0,u1,v1,col,dy,step){step=step||6;const c=Math.cos(ry),s=Math.sin(ry),nu=Math.max(1,Math.ceil((u1-u0)/step)),nv=Math.max(1,Math.ceil((v1-v0)/step)),G=ctx.G,g=[];
 for(let b=0;b<=nv;b++){const row=[];for(let a=0;a<=nu;a++){const u=u0+(u1-u0)*a/nu,v=v0+(v1-v0)*b/nv,x=cx+u*c+v*s,z=cz-u*s+v*c;row.push([x,ctx.gy(x,z)+dy,z])}g.push(row)}
 for(let b=0;b<nv;b++)for(let a=0;a<nu;a++)G.quad(g[b][a],g[b][a+1],g[b+1][a+1],g[b+1][a],col)}
const rpl=(ctx,L,u0,v0,u1,v1,col,dy,st)=>rp(ctx,L.cx,L.cz,L.ry,Math.min(u0,u1),Math.min(v0,v1),Math.max(u0,u1),Math.max(v0,v1),col,dy,st);
/* ---------- fences ---------- */
const FC={picket:[.94,.93,.9],wood:[.5,.36,.24],chain:[.64,.66,.7],rail:[.5,.36,.22],iron:[.18,.19,.22]};
T.fence=(ctx,ax,az,bx,bz,h,kind,solid)=>{const G=ctx.G,Ln=Math.hypot(bx-ax,bz-az);if(Ln<.6)return;const n=Math.max(1,Math.round(Ln/2.6)),dx=(bx-ax)/n,dz=(bz-az)/n,ry=Math.atan2(dx,dz),sl=Ln/n,col=FC[kind]||FC.rail;
 for(let q=0;q<=n;q++){const x=ax+dx*q,z=az+dz*q;G.box(x,ctx.gy(x,z)-.1,z,.14,h+.12,.14,col)}
 for(let q=0;q<n;q++){const x0=ax+dx*q,z0=az+dz*q,xm=x0+dx/2,zm=z0+dz/2,y=Math.max(ctx.gy(x0,z0),ctx.gy(x0+dx,z0+dz));
  if(kind==='wood'){G.box(xm,y-.15,zm,.08,h+.15,sl,col,ry)}
  else if(kind==='chain'){G.box(xm,y+h-.08,zm,.07,.07,sl,[.5,.52,.56],ry);G.box(xm,y+.05,zm,.05,.05,sl,[.5,.52,.56],ry);G.box(xm,y+.1,zm,.02,h-.2,sl,col,ry)}
  else if(kind==='picket'){G.box(xm,y+h*.3,zm,.06,.07,sl,col,ry);G.box(xm,y+h*.72,zm,.06,.07,sl,col,ry);for(let k=0;k<2;k++){const t=(k+.5)/2-.5;G.box(xm+dx*t*.9/1,y,zm+dz*t*.9,.05,h*.9,sl*.4,col,ry)}}
  else{G.box(xm,y+h*.3,zm,.07,.09,sl,col,ry);G.box(xm,y+h*.75,zm,.07,.09,sl,col,ry)}}
 if(solid!==false)ctx.sg(ax,az,bx,bz,.14)};
/* a piece of dirt (farm yards, vacant lots): plate + two tyre ruts */
T.dirtPatch=(ctx,x,z,ry,w,d)=>{rp(ctx,x,z,ry,-w/2,-d/2,w/2,d/2,[.44,.34,.22],.07,6);for(const k of[-1,1])rp(ctx,x,z,ry,k*w*.18-.5,-d/2,k*w*.18+.5,d/2,[.34,.26,.17],.09,6)};
/* village front yard: picket fence with a gate, flagstone walk, sometimes a driveway and a car */
T.yard=(ctx,x,z,ry,w)=>{const s=Math.sin(ry),c=Math.cos(ry),fx=s,fz=c,ux=c,uz=-s,fd=9.2,hw=w/2+3.5,gate=1.4,G=ctx.G;
 const P0=(u,f)=>[x+ux*u+fx*f,z+uz*u+fz*f];
 let a=P0(-hw,fd),b=P0(-gate,fd);T.fence(ctx,a[0],a[1],b[0],b[1],1.0,'picket');a=P0(gate,fd);b=P0(hw,fd);T.fence(ctx,a[0],a[1],b[0],b[1],1.0,'picket');
 a=P0(-hw,fd);b=P0(-hw,1);T.fence(ctx,a[0],a[1],b[0],b[1],1.0,'picket');a=P0(hw,fd);b=P0(hw,1);T.fence(ctx,a[0],a[1],b[0],b[1],1.0,'picket');
 rp(ctx,x,z,ry,-.7,5,.7,fd+3,[.68,.66,.62],.1,4);
 const h=hash(Math.floor(x),Math.floor(z));if(h<.7){rp(ctx,x,z,ry,w/2+.5,2,w/2+3.7,fd+3,[.62,.62,.64],.1,5);if(h<.5)ctx.park(x+ux*(w/2+2.1)+fx*(fd-1),z+uz*(w/2+2.1)+fz*(fd-1),ry+PI/2*(h<.25?0:2),Math.floor(x+z))}
 /* mailbox */
 const m=P0(gate+1.2,fd+1.2);G.box(m[0],ctx.gy(m[0],m[1]),m[1],.12,1.1,.12,[.3,.22,.15]);G.box(m[0],ctx.gy(m[0],m[1])+1.05,m[1],.3,.28,.5,[.2,.35,.6],ry)};
/* ---------- street furniture ---------- */
function lamp(ctx,x,z,ry){const y=ctx.gy(x,z),c=Math.cos(ry||0),s=Math.sin(ry||0),G=ctx.G;G.box(x,y,z,.22,7.4,.22,[.24,.25,.29]);G.box(x+s*.9,y+7.3,z+c*.9,.2,.16,1.9,[.24,.25,.29],ry||0);ctx.N.box(x+s*1.6,y+7.14,z+c*1.6,.5,.12,.9,[1.7,1.55,1.15],ry||0);ctx.pt(x,z,.35)}
T.lamp=lamp;
function bench(ctx,x,z,ry){const y=ctx.gy(x,z),G=ctx.G;G.box(x,y+.42,z,1.7,.1,.5,[.5,.34,.2],ry);G.box(x,y+.7,z,1.7,.45,.08,[.5,.34,.2],ry);const c=Math.cos(ry),s=Math.sin(ry);for(const k of[-.7,.7]){G.box(x+c*k,y,z-s*k,.1,.45,.45,[.2,.2,.23],ry)}ctx.pt(x,z,.9)}
function bin(ctx,x,z,col){const y=ctx.gy(x,z);ctx.G.cyl(x,y,z,.4,.95,8,col||[.2,.36,.24]);ctx.pt(x,z,.4)}
function hydrant(ctx,x,z){const y=ctx.gy(x,z);ctx.G.cyl(x,y,z,.18,.75,6,[.82,.14,.1]);ctx.G.cone(x,y+.75,z,.2,.2,6,[.82,.14,.1])}
function dumpster(ctx,x,z,ry,col){const y=ctx.gy(x,z),G=ctx.G;G.box(x,y+.1,z,2.5,1.3,1.5,col||[.18,.42,.28],ry);G.box(x,y+1.4,z,2.6,.12,1.6,[.12,.28,.2],ry);const c=Math.cos(ry),s=Math.sin(ry);ctx.sg(x-c*1.25,z+s*1.25,x+c*1.25,z-s*1.25,.7)}
function cafe(ctx,x,z,col){const y=ctx.gy(x,z),G=ctx.G;G.cyl(x,y,z,.04,.78,5,[.3,.3,.33]);G.cyl(x,y+.78,z,.5,.05,8,[.92,.9,.85]);G.cyl(x,y,z,.28,.04,6,[.3,.3,.33]);
 for(const[a,b]of[[.8,0],[-.8,0],[0,.8],[0,-.8]])G.box(x+a,y,z+b,.4,.46,.4,[.35,.3,.28]);G.cyl(x,y+.5,z,.04,2.1,4,[.85,.85,.85]);G.cone(x,y+2.5,z,1.5,.5,8,col||[.8,.2,.18]);ctx.pt(x,z,1)}
function planter(ctx,x,z){const y=ctx.gy(x,z),G=ctx.G;G.box(x,y,z,1.1,.55,1.1,[.55,.5,.45]);G.ico(x,y+.9,z,.5,[.28,.55,.22],.9);}
const TNT=[[1,1,1],[1.1,.97,.9],[.9,1.02,1.1],[1.06,1.06,.9],[.96,.92,1.08],[1.1,1,.96]];
const SIDEW=[.62,.62,.64],PAVE=[.52,.5,.48],CONC=[.58,.58,.6],ASPH=[.17,.18,.2],LAWNC=[.3,.56,.22];
/* ---------- picking a building that exists in this build ---------- */
const has=n=>{const fm=P.FM;return !!(fm&&fm.get(n))};
const HPT=['h_bld_C','h_bld_D','h_bld_E','h_bld_F','h_bld_G','h_bld_H'],HPL=['h_bld_A','h_bld_B','h_bld_C','h_bld_D','h_bld_E','h_bld_F','h_bld_G'];
const COMP=['b_CompanyBuilding_01','b_CompanyBuilding_04','b_CompanyBuilding_03','b_CompanyBuilding_02'];
const MIDP=['b_ResidentBuilding_04','b_ResidentBuilding_05','b_CommercialBuilding_02','b_CommercialBuilding_03'];
const SUBP=[['b_ResidentBuilding_01',10,7.5],['b_ResidentBuilding_03',12,7.5],['b_ResidentBuilding_05',12.8,8],['b_ResidentBuilding_04',12.5,9.5],['b_ResidentBuilding_02',9.5,9],['b_ResidentBuilding_06',12.8,7],['building-small-a',11,8],['building-small-d',11,8.5],['h_bld_A',9.4,10],['h_bld_B',12,9.5]];
/* put a model so its front face sits `front` metres from the block centre on row side sg (sg=+-1), centred at u */
function place(ctx,n,u,sg,front,ry,W,H,maxD,L,o){const D=P.FRD,ft=D.fit(n,W,H,maxD),sz=P.FM.size(n),sy=cl(ft.sy,.62,3.1),dep=sz[2]*ft.s,w=tf(L,u,sg*(front-dep/2));
 return D.mput(ctx,n,w[0],w[1],ry,ft.s,Object.assign({sy,tint:TNT[(hash(Math.floor(w[0]),Math.floor(w[1]))*6)|0],v:(hash(Math.floor(w[1]),Math.floor(w[0]))-.5)*.1},o||{}))}
const rows=[-1,1];
const faceOf=(L,s)=>L.ry+(s>0?0:PI);
/* ---------- the whole block ---------- */
T.block=(ctx,i,j)=>{const L=lay(i,j),r=E.rng(i*977+j*131+7),G=ctx.G,cx=L.cx,cz=L.cz,fm=P.FM;
 /* sidewalks all round (raised kerb) + kerb faces */
 for(const[x0,z0,x1,z1]of[[cx-40,cz-40,cx+40,cz-36.5],[cx-40,cz+36.5,cx+40,cz+40],[cx-40,cz-36.5,cx-36.5,cz+36.5],[cx+36.5,cz-36.5,cx+40,cz+36.5]]){rp(ctx,(x0+x1)/2,(z0+z1)/2,0,-(x1-x0)/2,-(z1-z0)/2,(x1-x0)/2,(z1-z0)/2,SIDEW,.16,6)}
 if(L.type==='poi')return;
 const dirt=(u0,v0,u1,v1)=>{rpl(ctx,L,u0,v0,u1,v1,[.44,.34,.22],.1,6)};
 if(L.type==='park'){park(ctx,L,r);return}
 /* alley furniture: dumpsters, bins, crates, poles */
 const al=(u,s)=>tf(L,u,s*4.2);
 for(const s of rows){let k=0;for(let u=-34;u<=34;u+=17+r()*8){if(r()<.55){const p=al(u,s);if(L.type==='sub'){if(r()<.5){bin(ctx,p[0],p[1],[.2,.3,.5])}else if(fm)fm.put(ctx.G,'b_WoodenCrates_01',p[0],ctx.gy(p[0],p[1]),p[1],1.1,r()*6,{})}else dumpster(ctx,p[0],p[1],L.ry+(r()<.5?0:PI)+PI/2*0,[.18+r()*.1,.4,.28])}k++}}
 if(L.type==='sub'||L.type==='ind'){for(const u of[-30,0,30]){const p=tf(L,u,0);const q=tf(L,u,3.6);if(fm)fm.put(ctx.G,'l_pole',q[0],ctx.gy(q[0],q[1]),q[1],.95,L.ry+PI/2,{});ctx.pt(q[0],q[1],.4)}}
 if(L.type==='dt'||L.type==='mid'){for(const s of rows){/* downtown & mid-rise: shops flush to the sidewalk */
   const nl=L.type==='dt'?2:3,lw=73/nl;let u=-36.5;
   for(let k=0;k<nl;k++,u+=lw){const a=u,b=u+lw,uc=(a+b)/2,W=lw-1.4-r()*(lw*.12),roll=r(),f=faceOf(L,s);
    const spec=L.type==='dt'?{H:(L.mid<1.2?46:30)+r()*34,W:W}:{H:11+r()*15,W:W};
    if(roll<.12){/* parking lot */
     rpl(ctx,L,a+.4,s*36.2,b-.4,s*5.2,ASPH,.13,6);for(let q=0;q<7;q++){const uu=a+2.2+q*((lw-4.4)/6.4);rpl(ctx,L,uu-.06,s*33,uu+.06,s*27,[.9,.9,.85],.15,4);rpl(ctx,L,uu-.06,s*17,uu+.06,s*11,[.9,.9,.85],.15,4)}
     for(let q=0;q<5;q++)if(r()<.6){const uu=a+3.5+q*((lw-6)/4.4),p=tf(L,uu,s*(r()<.5?30:14));ctx.park(p[0],p[1],f+PI/2*0+(r()<.5?0:PI),Math.floor(p[0]*3+p[1]));}
     const p1=tf(L,uc,s*20);lamp(ctx,p1[0],p1[1],0);const o1=tf(L,a+1,s*5);lamp(ctx,o1[0],o1[1],0);continue}
    if(roll<.2){/* plaza with trees, benches and cafe tables */
     rpl(ctx,L,a+.4,s*36.2,b-.4,s*5.2,PAVE,.13,6);for(let q=0;q<3;q++){const p=tf(L,a+4+q*((lw-8)/2),s*30);ctx.tree(p[0],p[1],.7,.4+r()*.3)}
     for(let q=0;q<3;q++){const p=tf(L,uc-6+q*6,s*20);bench(ctx,p[0],p[1],faceOf(L,-s)+PI/2*0)}if(L.type==='dt'){for(let q=0;q<4;q++){const p=tf(L,uc-7+q*5,s*12);cafe(ctx,p[0],p[1],[[.8,.2,.18],[.2,.4,.7],[.9,.7,.2],[.2,.6,.4]][q])}}
     if(has('pavement-fountain')){const p=tf(L,uc,s*20),fz=P.FRD.fit('pavement-fountain',9,2.2);P.FRD.mput(ctx,'pavement-fountain',p[0],p[1],0,fz.s,{sy:fz.sy,noSkirt:true})}
     continue}
    if(roll<.27){/* vacant lot: dirt, a container and a hoarding fence */
     rpl(ctx,L,a+.4,s*36.2,b-.4,s*5.2,[.44,.34,.22],.11,6);for(const q of[-1,1])rpl(ctx,L,uc+q*lw*.2-.5,s*36,uc+q*lw*.2+.5,s*6,[.34,.26,.17],.12,6);
     const p0=tf(L,a+.5,s*35.5),p1=tf(L,b-.5,s*35.5);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],2.0,'chain');const q0=tf(L,a+.5,s*35.5),q1=tf(L,a+.5,s*6),q2=tf(L,b-.5,s*6);T.fence(ctx,q0[0],q0[1],q1[0],q1[1],2.0,'chain');T.fence(ctx,q1[0],q1[1],q2[0],q2[1],2.0,'chain');const q3=tf(L,b-.5,s*35.5);T.fence(ctx,q2[0],q2[1],q3[0],q3[1],2.0,'chain');
     const cp=tf(L,uc-5,s*24);if(fm)fm.put(ctx.G,r()<.5?'l_cont0':'l_cont1',cp[0],ctx.gy(cp[0],cp[1]),cp[1],1,f+PI/2,{});ctx.pt(cp[0],cp[1],3);const bp=tf(L,uc+6,s*16);if(fm){fm.put(ctx.G,'l_barrels',bp[0],ctx.gy(bp[0],bp[1]),bp[1],1.2,r()*6,{});ctx.pt(bp[0],bp[1],1)}
     if(L.type==='dt'&&r()<.5&&fm){const cr=tf(L,uc+4,s*28);fm.put(ctx.G,'l_crane',cr[0],ctx.gy(cr[0],cr[1]),cr[1],1.1,f,{});ctx.pt(cr[0],cr[1],4)}
     continue}
    /* a building filling the lot */
    const pool=(L.type==='dt'?(spec.H>52&&r()<.8?COMP.map(n=>'b_'+n.slice(2)):HPT):HPL).filter(has),n=(pool.length?pool:MIDP)[(r()*(pool.length||MIDP.length))|0];
    place(ctx,n,uc,s,36,f,spec.W,spec.H,L.type==='dt'?27:22,L,{});
    /* service yard behind: paved, dumpster, chain fence on the alley side */
    rpl(ctx,L,a+.5,s*5.4,b-.5,s*3.4,CONC,.12,6);
    const f0=tf(L,a,s*3.2),f1=tf(L,b,s*3.2);T.fence(ctx,f0[0],f0[1],f1[0],f1[1],1.8,'chain');
    if(r()<.55){const p=tf(L,uc,s*5.3);dumpster(ctx,p[0],p[1],L.ry,[.2,.4,.3])}
    /* awning-level street life */
    if(r()<.5){const p=tf(L,uc+r()*6-3,s*38.3);planter(ctx,p[0],p[1])}
    if(L.type==='dt'&&r()<.45){const p=tf(L,a+3,s*38.3);hydrant(ctx,p[0],p[1])}
   }
   /* street trees + lamps + benches on the sidewalk */
   for(let u=-30;u<=30;u+=30){const p=tf(L,u+(s>0?0:8),s*39);ctx.tree(p[0],p[1],.5+r()*.12,.5)}
   {const p=tf(L,-18,s*39.2);lamp(ctx,p[0],p[1],L.ry+(s>0?PI:0)+PI/2*0);const q=tf(L,18,s*39.2);lamp(ctx,q[0],q[1],L.ry+(s>0?PI:0))}
   if(r()<.5){const p=tf(L,r()*20-10,s*38.4);bench(ctx,p[0],p[1],faceOf(L,s)+PI)}
  }
  return}
 /* ---- industrial ---- */
 if(L.type==='ind'){for(const s of rows){const f=faceOf(L,s);
   rpl(ctx,L,-36,s*36,36,s*4.2,[.46,.43,.38],.1,6);
   for(let k=0;k<2;k++){const uc=-18+k*36,n='b_CommercialBuilding_01';place(ctx,n,uc,s,35,f,33,9.5,22,L,{});}
   const p0=tf(L,-36,s*36.4),p1=tf(L,36,s*36.4);/* open gate in the chain fence */
   T.fence(ctx,p0[0],p0[1],tf(L,-6,s*36.4)[0],tf(L,-6,s*36.4)[1],2.2,'chain');T.fence(ctx,tf(L,6,s*36.4)[0],tf(L,6,s*36.4)[1],p1[0],p1[1],2.2,'chain');
   for(let q=0;q<3;q++){const p=tf(L,-30+q*22+r()*6,s*12);if(fm){fm.put(ctx.G,['l_cont0','l_cont1','l_cont2','l_cont3'][(r()*4)|0],p[0],ctx.gy(p[0],p[1]),p[1],1,f+PI/2*(r()<.5?0:1),{});ctx.pt(p[0],p[1],3.2);if(r()<.5){fm.put(ctx.G,'l_cont2_1',p[0],ctx.gy(p[0],p[1])+2.6,p[1],1,f+PI/2,{})}}}
   for(let q=0;q<3;q++){const p=tf(L,-24+q*24,s*6.5);if(fm)fm.put(ctx.G,'l_crates',p[0],ctx.gy(p[0],p[1]),p[1],1.1,r()*6,{})}
   const lp=tf(L,0,s*22);lamp(ctx,lp[0],lp[1],0)}
  return}
 /* ---- suburb: houses, driveways, yards, fences ---- */
 for(const s of rows){const f=faceOf(L,s),lw=18.25,pool=SUBP.filter(q=>has(q[0])),pl=pool.length?pool:[['b_ResidentBuilding_03',12,7.5]];
  for(let k=0;k<4;k++){const a=-36.5+k*lw,b=a+lw,d=(k+L.i+L.j+(s>0?1:0))%2?1:-1,roll=r();
   if(roll<.1){/* empty lot: overgrown dirt */
    rpl(ctx,L,a+.5,s*36.2,b-.5,s*4,[.45,.4,.24],.09,6);for(let q=0;q<5;q++){const p=tf(L,a+3+r()*(lw-6),s*(10+r()*22));ctx.tree(p[0],p[1],.5+r()*.5,r())}
    const p0=tf(L,a,s*35.5),p1=tf(L,b,s*35.5);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],1.1,'rail');continue}
   const pk=pl[(r()*pl.length)|0],W=Math.min(12.8,pk[1]*(.93+r()*.16)),H=pk[2]*(.88+r()*.25),setb=6.5+r()*3,front=36.5-setb,u0=d>0?a+.8:b-.8-W,uc=u0+W/2,ft=P.FRD.fit(pk[0],W,H,13),dep=P.FM.size(pk[0])[2]*ft.s;
   place(ctx,pk[0],uc,s,front,f,W,H,13,L,{});
   /* driveway beside the house, from the kerb to the garage end */
   const du0=d>0?u0+W+.4:u0-.4-3.2,du1=du0+3.2;rpl(ctx,L,du0,s*36.5,du1,s*(front-dep*.55),CONC,.13,4);rpl(ctx,L,du0-.3,s*40,du1+.3,s*36.5,CONC,.13,4);
   if(r()<.65){const p=tf(L,(du0+du1)/2,s*(front+2+r()*6));ctx.park(p[0],p[1],f+(r()<.5?0:PI),Math.floor(p[0]*2+p[1]))}
   /* front walk */
   rpl(ctx,L,uc-.7,s*(front+.1),uc+.7,s*36.5,[.72,.7,.66],.13,4);
   /* picket fence along the front, leaving the walk and the driveway open */
   const gaps=[[uc-.9,uc+.9],[du0-.1,du1+.1]].sort((p,q)=>p[0]-q[0]);let cu=a+.2;const fv=s*35.4;
   for(const g of gaps){if(g[0]>cu+1){const p0=tf(L,cu,fv),p1=tf(L,g[0],fv);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],1.0,'picket',false)}cu=Math.max(cu,g[1])}
   if(b-.2>cu+1){const p0=tf(L,cu,fv),p1=tf(L,b-.2,fv);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],1.0,'picket',false)}
   /* side fences (picket up front, privacy board behind the house) and the alley-side fence */
   for(const uu of[a+.1,k===3?b-.1:null]){if(uu==null)continue;const p0=tf(L,uu,s*(front-dep*.2)),p1=tf(L,uu,s*3.3),q0=tf(L,uu,fv);T.fence(ctx,q0[0],q0[1],p0[0],p0[1],1.0,'picket',false);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],1.8,'wood')}
   {const p0=tf(L,a+.1,s*3.1),p1=tf(L,b-.1,s*3.1);T.fence(ctx,p0[0],p0[1],p1[0],p1[1],1.8,'wood')}
   /* backyard: tree, shed, bins */
   if(r()<.7){const p=tf(L,a+3+r()*(lw-6),s*(7+r()*(front-dep-9>3?front-dep-9:3)));ctx.tree(p[0],p[1],.6+r()*.5,r())}
   if(r()<.5){const p=tf(L,uc+(r()<.5?-4:4),s*7.2),y=ctx.gy(p[0],p[1]);ctx.G.box(p[0],y,p[1],3.2,2.4,2.6,[.62,.42,.3],L.ry);ctx.G.box(p[0],y+2.4,p[1],3.5,.3,2.9,[.35,.25,.2],L.ry);ctx.pt(p[0],p[1],1.8)}
   {const p=tf(L,du0>uc?du0-.9:du1+.9,s*37.6);bin(ctx,p[0],p[1],[.25,.3,.5])}
   if(r()<.7){const p=tf(L,uc+(r()<.5?-3:3),s*(front+2));ctx.tree(p[0],p[1],.4+r()*.25,.4+r()*.4)}}
  /* street trees, lamps, hydrants along the verge */
  for(let u=-27;u<=27;u+=18){const p=tf(L,u+r()*3,s*38.4);ctx.tree(p[0],p[1],.5+r()*.12,.5+r()*.3)}
  {const p=tf(L,-9,s*39.3);lamp(ctx,p[0],p[1],L.ry+(s>0?PI:0));const q=tf(L,27,s*39.3);lamp(ctx,q[0],q[1],L.ry+(s>0?PI:0))}
  if(r()<.4){const p=tf(L,r()*40-20,s*38.9);hydrant(ctx,p[0],p[1])}}
};
function park(ctx,L,r){const cx=L.cx,cz=L.cz,G=ctx.G,fm=P.FM;
 /* lawn, a pond, crossing paths, trees, benches, a fountain */
 rp(ctx,cx,cz,0,-12,-9,12,9,[.2,.45,.68],.05,4);
 rp(ctx,cx,cz,0,-36,-1.6,36,1.6,[.72,.68,.6],.1,6);rp(ctx,cx,cz,0,-1.6,-36,1.6,36,[.72,.68,.6],.1,6);
 for(let q=0;q<26;q++){const a=q*.2417+r()*.3,rad=16+r()*18,x=cx+Math.cos(a*3.7)*rad*(q%2?1:.9),z=cz+Math.sin(a*3.7)*rad;if(Math.abs(x-cx)<3||Math.abs(z-cz)<3)continue;if(Math.hypot(x-cx,z-cz)<15)continue;ctx.tree(x,z,.85+r()*.4,.3+r()*.6)}
 for(const[a,b,ry]of[[-6,3.1,0],[6,3.1,0],[-6,-3.1,PI],[3.1,-6,PI/2],[3.1,6,PI/2]])bench(ctx,cx+a*3.2,cz+b*2.2+(a===3.1?0:0),ry);
 for(let q=0;q<4;q++){const a=q*PI/2+PI/4,x=cx+Math.cos(a)*26,z=cz+Math.sin(a)*26;lamp(ctx,x,z,a)}
 if(fm&&has('pavement-fountain')){const z=P.FRD.fit('pavement-fountain',6,1.8);P.FRD.mput(ctx,'pavement-fountain',cx,cz,0,z.s,{sy:z.sy,noSkirt:true,dy:.2})}
 const f1=[cx-40,cz-40],f2=[cx+40,cz-40],f3=[cx+40,cz+40],f4=[cx-40,cz+40];
 T.fence(ctx,f1[0]+4,f1[1]+3.4,f2[0]-4,f2[1]+3.4,.9,'iron',false);T.fence(ctx,f4[0]+4,f4[1]-3.4,f3[0]-4,f3[1]-3.4,.9,'iron',false)}
/* ---------- intersections: asphalt pad, crosswalks, stop lines, signals ---------- */
T.inter=(ctx,i,j)=>{const E_=E,X=E_.TX0+E_.TB*i,Z=E_.TZ0+E_.TB*j,G=ctx.G,arms=[[1,0,i<E_.TNX&&!(j===3&&i===0)],[-1,0,i>0],[0,1,j<E_.TNZ],[0,-1,j>0]];
 rp(ctx,X,Z,0,-5.4,-5.4,5.4,5.4,ASPH,.17,5.4);
 for(const[dx,dz,ok]of arms){if(!ok)continue;const px=dz,pz=-dx;
  /* zebra crossing */
  for(let q=-4;q<=4;q++){if(q===0)continue;const w=q*1.1,x=X+dx*7.8+px*w,z=Z+dz*7.8+pz*w;G.box(x,ctx.gy(x,z)+.15,z,dx?2.6:.55,.03,dx?.55:2.6,[.95,.95,.92])}
  /* stop line */
  {const x=X+dx*11.6+px*2.4,z=Z+dz*11.6+pz*2.4;G.box(x,ctx.gy(x,z)+.15,z,dx?.4:4.4,.03,dx?4.4:.4,[.95,.95,.92])}}
 /* signals on two opposite corners */
 for(const[sx,sz,ry]of[[1,1,PI],[-1,-1,0]]){const x=X+sx*7,z=Z+sz*7,y=ctx.gy(x,z)+.16,hx=Math.sin(ry),hz=Math.cos(ry);
  G.box(x,y,z,.22,5.6,.22,[.22,.23,.26]);G.box(x,y+5.3,z,.18,.18,3.6,[.22,.23,.26],ry);
  for(const a of[-1.7,1.7]){const wx=x+hx*0+Math.cos(ry)*0,wz=z;G.box(x+(sx>0?0:0),y+4.4,z+a*(sz>0?-1:1)*0,.4,.9,.4,[.12,.12,.14]);}
  const gp=(i+j)&1;ctx.N.box(x,y+5.05,z+(sz>0?-1.9:1.9),.34,.34,.34,gp?[.3,2.2,.5]:[2.4,.3,.3]);ctx.N.box(x,y+4.55,z+(sz>0?-1.9:1.9),.34,.34,.34,gp?[.2,.2,.2]:[.2,.2,.2]);G.box(x,y+4.3,z+(sz>0?-1.9:1.9),.5,1.2,.5,[.1,.1,.12]);ctx.pt(x,z,.3)}
 if((i+j)%2===0)hydrant(ctx,X+7.2,Z-7.2)};
P.FRT=T;
})();
