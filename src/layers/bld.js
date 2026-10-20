/* ===== Poly Tourismo v9 layer: pandazole buildings (farm + town) swapped into the prop library ===== */
(function v9bld(){
'use strict';
const P=window.PT8,K=P.PROPKIT;if(!K||typeof BLD_B64==='undefined')return;
const raw=atob(BLD_B64),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);const buf=u8.buffer;
const {LIB,PLAN,MAT}=K,GEO={};
const BUILDINGS=/^(Company|Resident|Commercial|Barn|ChickenCoop|FarmerHouse|GreenMouse|Outhouses|Silo|StoreBuilding)/;
for(const m of BLD_META){
 const pos=new Int16Array(buf,m.off,m.nv*3),col=new Uint8Array(buf,m.off+m.nv*6,m.nv*3),idx=new Uint16Array(buf,m.ioff,m.ni);
 const w=m.size[0],d=m.size[2],isB=BUILDINGS.test(m.name),fd=isB?(m.size[1]>8?2.4:1.8):0,nv=m.nv,tile=/^(FarmLand|GrassLand|WaterLand)/.test(m.name);
 const P_=new Float32Array((nv+24)*3),C_=new Float32Array((nv+24)*3),I_=new Uint16Array(m.ni+36);
 for(let i=0;i<nv*3;i++){P_[i]=pos[i]*.001;C_[i]=col[i]/255}
 if(tile)for(let i=1;i<nv*3;i+=3)P_[i]-=.42;
 I_.set(idx);
 /* buried foundation so the building stands on slopes */
 const hx=w/2+.25,hz=d/2+.25,y0=-fd,y1=.15,fc=[.46,.44,.41];let vi=nv,ii=m.ni;
 const face=(a,b,c,dd)=>{for(const p of[a,b,c,dd]){P_[vi*3]=p[0];P_[vi*3+1]=p[1];P_[vi*3+2]=p[2];C_[vi*3]=fc[0];C_[vi*3+1]=fc[1];C_[vi*3+2]=fc[2];vi++}I_[ii++]=vi-4;I_[ii++]=vi-3;I_[ii++]=vi-2;I_[ii++]=vi-4;I_[ii++]=vi-2;I_[ii++]=vi-1};
 if(isB){face([-hx,y0,hz],[hx,y0,hz],[hx,y1,hz],[-hx,y1,hz]);face([hx,y0,-hz],[-hx,y0,-hz],[-hx,y1,-hz],[hx,y1,-hz]);
 face([hx,y0,hz],[hx,y0,-hz],[hx,y1,-hz],[hx,y1,hz]);face([-hx,y0,-hz],[-hx,y0,hz],[-hx,y1,hz],[-hx,y1,-hz]);
 face([-hx,y1,hz],[hx,y1,hz],[hx,y1,-hz],[-hx,y1,-hz]);face([-hx,y0,-hz],[hx,y0,-hz],[hx,y0,hz],[-hx,y0,hz])}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(I_,1));g.computeVertexNormals();g.computeBoundingSphere();
 GEO[m.name]={g,fr:Math.max(w,d)/2*.92+1.3,sk:isB?fd-.3:.5,h:m.size[1],w,d}}
const put=(n,src,o)=>{const q=GEO[src];if(!q)return;LIB[n]=Object.assign({g:q.g,fr:q.fr,sk:q.sk,face:1},o||{})};
/* replace the built-in cabins and barn */
put('barn','Barn_02');put('barn2','Barn_01');
put('cabinW','FarmerHouse');put('cabinR','ResidentBuilding_03');put('cabinS','ResidentBuilding_01');put('cabinH','ResidentBuilding_05');put('cabinA','ResidentBuilding_06');put('chalet','ResidentBuilding_04');put('cabinF','ResidentBuilding_02');
/* new farm / town pieces for the maps */
put('farmhouse','FarmerHouse');put('silo','Silo_01');put('silo2','Silo_02');put('coop','ChickenCoop');put('greenhouse','GreenMouse');put('store','StoreBuilding_01');put('outhouse','Outhouses');
put('warehouse','CommercialBuilding_01');put('shopC','CommercialBuilding_03');put('shopD','CommercialBuilding_02');
put('towerA','CompanyBuilding_01');put('towerB','CompanyBuilding_04');put('blockA','ResidentBuilding_04');put('blockB','ResidentBuilding_05');put('blockC','ResidentBuilding_06');
put('treeA','Tree_02');put('treeB','Tree_04');put('treeC','Tree_05');put('treeD','Tree_07');put('bushA','Bush_01');put('bushB','Bush_02');put('hay','Haystack_04');put('hay2','Haystack_01');put('well','Well_02');put('crateW','WoodenCrates_01');
const add=(map,list)=>{const p=PLAN[map];if(!p)return;p.field=(p.field||[]).concat(list)};
add('Pinewood Stage',[['farmhouse',1,16,120],['silo',1,16,110],['coop',1,12,80],['barn2',1,16,120],['outhouse',2,10,70]]);
add('Highmoor Stage',[['farmhouse',1,16,130],['silo2',1,14,110],['barn2',1,16,120]]);
add('Coastal Run',[['greenhouse',1,18,120]]);

/* richer scenery: pack trees and bushes through every map */
add('Quarry Circuit',[['treeA',96,9,150],['treeB',80,9,150],['treeD',80,9,150],['treeC',48,9,150],['bushA',144,5,150],['bushB',144,5,150],['hay',6,14,120],['boulderG',20,12,260]]);
add('Canyon Viaduct',[['bushB',96,5,150],['bushA',54,5,150],['cactus',30,8,230],['boulderR',24,12,260]]);
add('Alpine Pass',[['treeC',128,9,150],['treeB',54,9,150],['bushB',48,5,150],['boulderG',16,12,240]]);
add('Afterhours Loop',[['treeA',48,5,90],['treeD',48,5,90],['bushA',80,4,80],['bushB',70,4,80]]);
add('Pinewood Stage',[['treeB',176,6,150],['treeC',176,6,150],['treeA',96,6,150],['bushA',160,4,150],['bushB',128,4,150]]);
add('Redrock Stage',[['bushB',70,5,150],['cactus',24,6,200]]);
add('Highmoor Stage',[['treeC',48,10,150],['bushA',144,4,150],['bushB',112,4,150],['hay2',6,10,80],['boulderG',16,12,220]]);
add('Coastal Run',[['treeA',64,8,150],['treeD',64,8,150],['bushA',112,5,150],['bushB',80,5,150]]);
add('Frostline Stage',[['treeC',80,8,150]]);
PLAN['Road Atlanta']=PLAN['Road Atlanta']||{edge:[],field:[['treeA',64,14,150],['treeB',48,14,150],['treeD',64,14,150],['bushA',96,8,150],['bushB',96,8,150],['hay',4,16,120]]};
/* "random grey boxes": the container offices go */
for(const k in PLAN){const p=PLAN[k];if(p.field)p.field=p.field.filter(f=>f[0]!=='officeC')}

/* ---------- farmsteads: the pack's barn, crop plots, haystacks, well, crates, feeders and trees ---------- */
const WHT=new THREE.Color(1,1,1);const HAM={'Quarry Circuit':2,'Canyon Viaduct':1,'Alpine Pass':2,'Coastal Run':1,'Pinewood Stage':1,'Highmoor Stage':1,'Terrace Run':1,'Autumn Ridge':1,'Mangrove Ford':1,'Redrock Stage':1};const FARMS={'Pinewood Stage':2,'Highmoor Stage':1,'Coastal Run':2,'Mangrove Ford':2,'Terrace Run':1,'Autumn Ridge':2,'Road Atlanta':1};
const rng=s=>{let a=s>>>0||1;return()=>((a=Math.imul(a^a>>>15,a|1),a^=a+Math.imul(a^a>>>7,a|61),((a^a>>>14)>>>0)/4294967296))};
function farms(T,sc){const nF=FARMS[T.d&&T.d.name]||0,n=nF+(HAM[T.d&&T.d.name]||0);if(!n||T.d.flat||T.d.harbor)return;
 const N=T.N,r=rng(T.d.id*977+3),R=(a,b)=>a+(b-a)*r(),px=[],pz=[],ph=[];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,lo=1e9;
 for(let i=0;i<N;i++){x0=Math.min(x0,T.x[i]);x1=Math.max(x1,T.x[i]);z0=Math.min(z0,T.z[i]);z1=Math.max(z1,T.z[i]);lo=Math.min(lo,T.y[i]);if(i%2===0){px.push(T.x[i]);pz.push(T.z[i]);ph.push(T.hw[i])}}
 const near=(x,z)=>{let b=1e9,bi=0;for(let i=0;i<px.length;i++){const d=Math.hypot(x-px[i],z-pz[i])-ph[i];if(d<b){b=d;bi=i}}return[b,bi]};
 const log=sc.userData.props||(sc.userData.props=[]),bn=P.barnInfo&&P.barnInfo(),groups={};
 const wet=(x,z)=>T.d.sea&&T.terr(x,z)<lo-2;
 const free=(x,z,fr)=>{if(wet(x,z))return false;for(const p of log)if(Math.hypot(p.x-x,p.z-z)<(p.fr||2)+fr)return false;if(bn&&Math.hypot(bn.x-x,bn.z-z)<50)return false;return true};
 const put=(name,x,z,yaw,fr,slope)=>{const q=GEO[name];if(!q)return false;if(!free(x,z,fr))return false;let mn=1e9,mx=-1e9;for(const[dx,dz]of[[0,0],[1,1],[-1,1],[1,-1],[-1,-1]]){const h=T.terr(x+dx*fr*.6,z+dz*fr*.6);mn=Math.min(mn,h);mx=Math.max(mx,h)}if(mx-mn>slope)return false;
  (groups[name]=groups[name]||[]).push([x,mn,z,yaw]);log.push({n:name,x,z,y:mn,fr,sk:.5,s:1});return true};
 for(let f=0;f<n;f++){let site=null;
  for(let t=0;t<260&&!site;t++){const x=R(x0-120,x1+120),z=R(z0-120,z1+120),[d,bi]=near(x,z);if(d<34||d>120)continue;
   let mn=1e9,mx=-1e9;for(let a=0;a<12;a++){const h=T.terr(x+Math.cos(a*.5236)*16,z+Math.sin(a*.5236)*16);mn=Math.min(mn,h);mx=Math.max(mx,h)}if(mx-mn>2.2||wet(x,z))continue;
   if(!free(x,z,14))continue;site={x,z,yaw:Math.atan2(T.x[bi*2]-x,T.z[bi*2]-z)}}
  if(!site)continue;const{x,z,yaw}=site,s_=Math.sin(yaw),c_=Math.cos(yaw),W=(lx,lz)=>[x+c_*lx+s_*lz,z-s_*lx+c_*lz];
  if(f>=nF){/* hamlet: a ring of houses around a well, with trees, bushes and hay */
   const HS=['ResidentBuilding_01','ResidentBuilding_02','ResidentBuilding_03','ResidentBuilding_05','StoreBuilding_01','FarmerHouse'],k=4+Math.floor(r()*2),a0=R(0,6.28);
   put('Well_02',x,z,0,1.6,.9);
   for(let q=0;q<k;q++){const a=a0+q*6.283/k+R(-.25,.25),rr=R(10,13),[hx,hz]=[x+Math.cos(a)*rr,z+Math.sin(a)*rr];put(HS[Math.floor(r()*HS.length)],hx,hz,Math.atan2(x-hx,z-hz),6,2)}
   for(let q=0;q<9;q++){const a=R(0,6.283),rr=R(15,24);put(['Tree_02','Tree_04','Tree_05','Tree_07','Bush_01','Bush_02'][Math.floor(r()*6)],x+Math.cos(a)*rr,z+Math.sin(a)*rr,R(0,6.283),1.6,1.2)}
   for(const[nm,ax,az]of[['Haystack_04',4,3],['WoodenCrates_01',-4,2],['Haystack_01',3,-5],['AnimalFeeder_01',-3,-5]])put(nm,x+ax,z+az,R(0,6.28),1.4,.9);
   continue}
  const bname=r()<.5?'Barn_02':'Barn_01';let[bx,bz]=W(0,0);put(bname,bx,bz,yaw,9,2.2);
  if(r()<.7){[bx,bz]=W(-12,2);put('FarmerHouse',bx,bz,yaw,6,2)}
  [bx,bz]=W(-7.5,-9);put(r()<.5?'Silo_01':'Silo_02',bx,bz,yaw,2.4,1.6);
  /* crop plots: a block of 5 x 5 m tiles beside and behind the barn */
  const cols=3,rows=2,gx=r()<.5?1:-1;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const[tx,tz]=W(gx*(9+i*5.05),-4+j*5.05);put('FarmLand_'+String(1+Math.floor(r()*10)).padStart(2,'0'),tx,tz,yaw,3.6,.7)}
  for(const[lx,lz,nm]of[[5.5,-5,'Haystack_04'],[6.8,-3,'Haystack_01'],[-5,7.5,'Well_02'],[4.4,7.5,'WoodenCrates_01'],[-4.2,-8,'Haystack_02'],[0,-10,'AnimalFeeder_01']]){const[hx,hz]=W(lx,lz);put(nm,hx,hz,yaw+R(-.4,.4),1.6,.9)}
  for(let k=0;k<5;k++){const a=R(0,6.283),rr=R(15,22),[tx,tz]=W(Math.cos(a)*rr,Math.sin(a)*rr);put(['Tree_02','Tree_04','Tree_05','Tree_07','Bush_01','Bush_02'][Math.floor(r()*6)],tx,tz,R(0,6.283),1.6,1.2)}}
 const dum=new THREE.Object3D();
 for(const nm in groups){const L=groups[nm],im=new THREE.InstancedMesh(GEO[nm].g.clone(),MAT,L.length);L.forEach((q,i)=>{dum.position.set(q[0],q[1],q[2]);dum.rotation.set(0,q[3],0);dum.scale.setScalar(1);dum.updateMatrix();im.setMatrixAt(i,dum.matrix);im.setColorAt(i,WHT)});
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;im.userData.ptProp=nm;sc.add(im)}}
{const bw=buildWorld;buildWorld=function(T){const sc=bw.apply(this,arguments);try{farms(T,sc)}catch(e){console.warn('farms',e)}return sc}}
P.BLD=GEO;
})();
