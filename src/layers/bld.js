/* ===== Poly Tourismo v9 layer: pandazole buildings (farm + town) swapped into the prop library ===== */
(function v9bld(){
'use strict';
const P=window.PT8,K=P.PROPKIT;if(!K||typeof BLD_B64==='undefined')return;
const raw=atob(BLD_B64),u8=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u8[i]=raw.charCodeAt(i);const buf=u8.buffer;
const {LIB,PLAN,MAT}=K,GEO={};
for(const m of BLD_META){
 const pos=new Int16Array(buf,m.off,m.nv*3),col=new Uint8Array(buf,m.off+m.nv*6,m.nv*3),idx=new Uint16Array(buf,m.ioff,m.ni);
 const w=m.size[0],d=m.size[2],fd=m.size[1]>8?2.4:1.8,nv=m.nv;
 const P_=new Float32Array((nv+24)*3),C_=new Float32Array((nv+24)*3),I_=new Uint16Array(m.ni+36);
 for(let i=0;i<nv*3;i++){P_[i]=pos[i]*.001;C_[i]=col[i]/255}
 I_.set(idx);
 /* buried foundation so the building stands on slopes */
 const hx=w/2+.25,hz=d/2+.25,y0=-fd,y1=.15,fc=[.46,.44,.41];let vi=nv,ii=m.ni;
 const face=(a,b,c,dd)=>{for(const p of[a,b,c,dd]){P_[vi*3]=p[0];P_[vi*3+1]=p[1];P_[vi*3+2]=p[2];C_[vi*3]=fc[0];C_[vi*3+1]=fc[1];C_[vi*3+2]=fc[2];vi++}I_[ii++]=vi-4;I_[ii++]=vi-3;I_[ii++]=vi-2;I_[ii++]=vi-4;I_[ii++]=vi-2;I_[ii++]=vi-1};
 face([-hx,y0,hz],[hx,y0,hz],[hx,y1,hz],[-hx,y1,hz]);face([hx,y0,-hz],[-hx,y0,-hz],[-hx,y1,-hz],[hx,y1,-hz]);
 face([hx,y0,hz],[hx,y0,-hz],[hx,y1,-hz],[hx,y1,hz]);face([-hx,y0,-hz],[-hx,y0,hz],[-hx,y1,hz],[-hx,y1,-hz]);
 face([-hx,y1,hz],[hx,y1,hz],[hx,y1,-hz],[-hx,y1,-hz]);face([-hx,y0,-hz],[hx,y0,-hz],[hx,y0,hz],[-hx,y0,hz]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P_,3));g.setAttribute('color',new THREE.BufferAttribute(C_,3));g.setIndex(new THREE.BufferAttribute(I_,1));g.computeVertexNormals();g.computeBoundingSphere();
 GEO[m.name]={g,fr:Math.max(w,d)/2*.92+1.3,sk:fd-.3,h:m.size[1]}}
const put=(n,src,o)=>{const q=GEO[src];if(!q)return;LIB[n]=Object.assign({g:q.g,fr:q.fr,sk:q.sk,face:1},o||{})};
/* replace the built-in cabins and barn */
put('barn','Barn_02');put('barn2','Barn_01');
put('cabinW','FarmerHouse');put('cabinR','ResidentBuilding_03');put('cabinS','ResidentBuilding_01');put('cabinH','ResidentBuilding_05');put('cabinA','ResidentBuilding_06');put('chalet','ResidentBuilding_04');put('cabinF','ResidentBuilding_02');
/* new farm / town pieces for the maps */
put('farmhouse','FarmerHouse');put('silo','Silo_01');put('silo2','Silo_02');put('coop','ChickenCoop');put('greenhouse','GreenMouse');put('store','StoreBuilding_01');put('outhouse','Outhouses');
put('warehouse','CommercialBuilding_01');put('shopC','CommercialBuilding_03');put('shopD','CommercialBuilding_02');
put('towerA','CompanyBuilding_01');put('towerB','CompanyBuilding_04');put('blockA','ResidentBuilding_04');put('blockB','ResidentBuilding_05');put('blockC','ResidentBuilding_06');
const add=(map,list)=>{const p=PLAN[map];if(!p)return;p.field=(p.field||[]).concat(list)};
add('Quarry Circuit',[['warehouse',1,22,120],['silo',1,18,110],['store',1,18,110]]);
add('Pinewood Stage',[['farmhouse',1,16,120],['silo',1,16,110],['coop',1,12,80],['barn2',1,16,120],['outhouse',2,10,70]]);
add('Highmoor Stage',[['farmhouse',1,16,130],['silo2',1,14,110],['barn2',1,16,120]]);
add('Redrock Stage',[['store',1,18,120]]);
add('Coastal Run',[['store',1,18,120],['greenhouse',1,18,120]]);
add('Afterhours Loop',[['towerA',2,16,100],['towerB',2,16,100],['blockA',2,16,100],['blockB',2,16,100],['blockC',1,16,100],['shopD',2,14,90]]);
add('Harbor Lights',[['warehouse',3,16,140],['shopC',2,14,120],['shopD',1,14,120]]);
P.BLD=GEO;
})();
