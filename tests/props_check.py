from shot import run,W
js="""(()=>{const out={};for(let tr=0;tr<D.length;tr++){
 PT8.launch({mode:'ta',track:tr,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const sc=RACE.scene,T=RACE.T;sc.updateMatrixWorld(true);
 const log=sc.userData.props||[],err=sc.userData.propError;
 /* terrain meshes = big non-prop meshes */
 const ter=[];sc.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.ptProp)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;if(b.max.x-b.min.x>200&&b.max.z-b.min.z>200&&b.max.y-b.min.y<300&&!(g.type==='SphereGeometry'))ter.push(o)});
 const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0);let bad=[],cnt={},chk=0,float=0,bury=0,worst=0;
 for(const p of log){cnt[p.n]=(cnt[p.n]||0)+1;if(p.water||p.n==='fencepost')continue;
  rc.set(new THREE.Vector3(p.x,600,p.z),dn);const h=rc.intersectObjects(ter,false);if(!h.length)continue;const gy=h[0].point.y;chk++;
  const gap=p.y-gy;/* prop base vs real ground */ if(gap>0.35){float++;if(bad.length<5)bad.push([p.n,+gap.toFixed(2),p.x|0,p.z|0])}
  if(gap<-(p.sk||1)){bury++;if(bad.length<5)bad.push(['bury',p.n,+gap.toFixed(2),p.x|0,p.z|0])}worst=Math.max(worst,Math.abs(gap))}
 out[tr]={name:T.d.name,total:log.length,err:err||null,chk,float,bury,worst:+worst.toFixed(2),bad,cnt,terMeshes:ter.length}}return out})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'pchk')
