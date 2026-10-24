import sys
from shot import run,W
trk=sys.argv[1]
js=r"""(async()=>{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:%s,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<200;i++)step(1/60);RACE.state='race';let cam=null;const r0=R.render.bind(R);R.render=function(s,c){if(s===RACE.scene)cam=c;return r0(s,c)};
 await new Promise(r=>setTimeout(r,2500));const o=[];o.push('full '+R.info.render.calls+' '+Math.round(R.info.render.triangles/1000)+'k');
 const sm=R.shadowMap.enabled;R.shadowMap.enabled=false;await new Promise(r=>setTimeout(r,800));o.push('noshadow '+R.info.render.calls+' '+Math.round(R.info.render.triangles/1000)+'k');R.shadowMap.enabled=sm;
 const sc=RACE.scene;const L=[];sc.traverse(x=>{if(x.isLight)L.push(x.type+(x.castShadow?'S':'')+(x.userData&&x.userData.n||''))});o.push('lights '+L.join(','));
 /* what is visible to camera */
 const fr=new THREE.Frustum(),pm=new THREE.Matrix4();cam.updateMatrixWorld();pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
 const rows=new Map();sc.traverse(x=>{if(!(x.isMesh)||!x.visible)return;if(x.frustumCulled&&x.geometry.boundingSphere===null)x.geometry.computeBoundingSphere();
  let vis=true;if(x.frustumCulled){const bs=x.geometry.boundingSphere.clone().applyMatrix4(x.matrixWorld);vis=fr.intersectsSphere(bs)}
  if(!vis)return;const g=x.geometry,n=(g.index?g.index.count/3:g.attributes.position.count/3)*(x.isInstancedMesh?x.count:1);
  const key=(x.isInstancedMesh?'I':'M')+'|'+x.material.type+'|'+(x.material.color?x.material.color.getHexString():'')+'|'+(x.castShadow?'cs':'')+'|'+(x.material.transparent?'tr':'');
  const e=rows.get(key)||{n:0,c:0};e.n+=n;e.c++;rows.set(key,e)});
 const arr=[...rows.entries()].sort((a,b)=>b[1].n-a[1].n).slice(0,12).map(([k,v])=>k+' tris='+Math.round(v.n/1000)+'k meshes='+v.c);
 return o.concat(arr).join('@@')})()""" % trk
run(W+'/Poly-Tourismo.html',[('js',js)],'perf2')
