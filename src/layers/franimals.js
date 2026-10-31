/* ===== Poly GT layer: Free Roam herds (cows, horses, deer… graze near farms and meadows, bolt from fast cars) ===== */
(function franimals(){
'use strict';
const P=window.PT8,PI=Math.PI;
const H2=(a,b)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const SETS=[[['Cow',4]],[['Cow',3],['Bull',1]],[['Horse',3]],[['WhiteHorse',2],['Horse',2]],[['Alpaca',4]],[['Donkey',3]],[['Deer',3]],[['Stag',2],['Deer',2]]];
function plan(F){const D=P.FRD,hs=[],W=F.W;
 for(const f of (D&&D.farms)||[]){hs.push({x:f.x-f.fx*58,z:f.z-f.fz*58,set:[['Cow',3],['Horse',2]],home:12});hs.push({x:f.x+f.fz*-70+f.fx*10,z:f.z+f.fx*70+f.fz*10,set:[['Cow',3]],home:12})}
 let n=0;for(let k=0;k<6000&&n<14;k++){const x=300+H2(k,7)*6100,z=300+H2(k,19)*4100,h=F.Hf(x,z);if(h<6||h>110||F.inTown(x,z,260)||F.G.sd(x,z)<90)continue;const gi=Math.round(z/F.CELL)*(F.WX/F.CELL+1)+Math.round(x/F.CELL);if(W.Z[gi]||W.dd[gi]<45)continue;
  const sl=Math.max(Math.abs(F.Hf(x+14,z)-h),Math.abs(F.Hf(x,z+14)-h));if(sl>1.6)continue;if(hs.some(q=>Math.hypot(q.x-x,q.z-z)<420))continue;
  hs.push({x,z,set:SETS[(H2(k,3)*SETS.length)|0],home:14});n++}
 return hs}
function spawn(sc,F,hd){const K=P.animalKit;if(!K||!K.SP)return;hd.list=[];let i=0;
 for(const[name,cnt]of hd.set){const sp=K.SP[name];if(!sp)continue;
  for(let q=0;q<cnt;q++){const a=H2(i*13+hd.x|0,i*7+hd.z|0)*6.283,rr=2+H2(i*5,hd.x|0)*7,ax=hd.x+Math.cos(a)*rr,az=hd.z+Math.sin(a)*rr;i++;const y=F.Hf(ax,az);if(y<2||F.roadAt(ax,az))continue;
   const root=K.clone(sp),g=new THREE.Group();g.add(root);root.scale.setScalar(sp.k*(.94+H2(i,5)*.12));g.position.set(ax,y,az);g.rotation.y=H2(i,11)*6.283;sc.add(g);
   root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.shd=1;o.frustumCulled=false}});
   const mx=new THREE.AnimationMixer(root),act={};for(const c of sp.clips)act[c.name]=mx.clipAction(c);
   const an={g,root,mx,act,name,sp,x:ax,z:az,yaw:g.rotation.y,st:'idle',cur:null,t:H2(i,2)*5,tx:ax,tz:az,cx:hd.x,cz:hd.z,home:hd.home,run:K.RUN[name]||8};play(an,Math.random()<.5?'Idle':'Eating',Math.random());hd.list.push(an)}}}
function play(a,nm,off){const n=a.act[nm];if(!n||a.cur===nm)return;const o=a.act[a.cur];n.reset().setEffectiveWeight(1).play();if(off)n.time=off*n.getClip().duration;if(o&&o!==n)o.crossFadeTo(n,.25,false);a.cur=nm}
function kill(sc,hd){if(hd.list)for(const a of hd.list)sc.remove(a.g);hd.list=null}
P.frAnimalsInit=F=>{const hs=plan(F);return{hs,fr:0}};
P.frAnimalsTick=(AN,sc,F,c,dt)=>{if(!AN||!P.animalsReady)return;AN.fr++;const spd=Math.hypot(c.vx,c.vz);
 for(const hd of AN.hs){const d=Math.hypot(hd.x-c.x,hd.z-c.z);if(d<260&&!hd.list)spawn(sc,F,hd);else if(d>340&&hd.list){kill(sc,hd);continue}if(!hd.list)continue;
  for(const a of hd.list){const dn=Math.hypot(c.x-a.x,c.z-a.z);if(dn>180)continue;const step=dn>90?((AN.fr+a.t*7|0)%2===0?dt*2:0):dt;
   if(a.st!=='flee'&&(dn<20||(dn<38&&spd>24))){a.st='flee';a.t=2+Math.random()*1.5;const ax=a.x-c.x,az=a.z-c.z,l=Math.hypot(ax,az)||1;a.tx=a.x+ax/l*45;a.tz=a.z+az/l*45}
   a.t-=step;
   if(a.st==='flee'){if(a.t<=0){a.st='idle';a.t=3+Math.random()*3}}
   else if(a.t<=0){if(a.st==='walk'||Math.random()<.5){a.st=Math.random()<.5?'idle':'graze';a.t=4+Math.random()*6}else{a.st='walk';a.t=3+Math.random()*4;const an=Math.random()*6.283,rr=Math.random()*a.home;a.tx=a.cx+Math.cos(an)*rr;a.tz=a.cz+Math.sin(an)*rr}}
   let v=0;if(a.st==='flee')v=a.run;else if(a.st==='walk')v=1.15*(a.sp.k*3.6);
   if(v>0){const dx=a.tx-a.x,dz=a.tz-a.z,l=Math.hypot(dx,dz);if(l<1&&a.st==='walk'){a.st='idle';a.t=3}else{const want=Math.atan2(dx,dz);let e=want-a.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));a.yaw+=e*Math.min(1,step*(a.st==='flee'?7:3));
     const nx=a.x+Math.sin(a.yaw)*v*step,nz=a.z+Math.cos(a.yaw)*v*step;if(F.Hf(nx,nz)>2&&!F.roadAt(nx+Math.sin(a.yaw)*5,nz+Math.cos(a.yaw)*5)){a.x=nx;a.z=nz}else{a.st='idle';a.t=2}}}
   a.g.position.set(a.x,F.Hf(a.x,a.z),a.z);a.g.rotation.y=a.yaw;
   play(a,a.st==='flee'?'Gallop':a.st==='walk'?'Walk':a.st==='graze'?'Eating':'Idle');
   if(a.cur==='Gallop'&&a.act.Gallop)a.act.Gallop.timeScale=Math.max(.6,v/Math.max(4,a.run)*1.1);
   a.mx.update(step)}}};
})();
