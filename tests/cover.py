import sys
from shot import run,W
trk=sys.argv[1] if len(sys.argv)>1 else '[10]'
js="""(()=>{const out=[];for(const tk of %s){try{PT8.dmgOn=()=>false;PT8.launch({mode:'ta',track:tk,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;
 for(let i=0;i<120;i++)step(1/60);const T=RACE.T,sc=RACE.sc||RACE.scene||window.scene;if(!sc){out.push([tk,'noscene',Object.keys(RACE).join(',')]);continue}
 sc.updateMatrixWorld(true);const meshes=[];sc.traverse(o=>{if(o.isMesh&&o.visible)meshes.push(o)});
 const rc=new THREE.Raycaster();const dn=new THREE.Vector3(0,-1,0);const bad=new Map();let n=0,cov=0;
 for(let i=0;i<T.N;i+=7){if(T.gap[i]||T.br[i]||T.tn[i])continue;for(const f of [-.85,-.45,0,.45,.85]){const lat=f*T.hw[i],c=Math.cos(T.psi[i]),s=Math.sin(T.psi[i]);
  const x=T.x[i]+c*lat,z=T.z[i]-s*lat,ry=T.y[i]-lat*T.bank[i]+.05;rc.set(new THREE.Vector3(x,ry+25,z),dn);rc.far=60;
  const hs=rc.intersectObjects(meshes,false);n++;let top=null;for(const h of hs){if(h.point.y>ry+.04){ if(h.object.userData&&h.object.userData.noCover)continue;top=h;break}}
  if(top){cov++;const o=top.object;const k=o.uuid;let e=bad.get(k);if(!e){e={mat:o.material.type+'|'+(o.material.map?'map':'')+(o.material.vertexColors?'vc':'')+'|'+(o.material.transparent?'tr':'')+(o.material.side),bb:(o.geometry.computeBoundingBox(),o.geometry.boundingBox.min.toArray().map(Math.round).join(',')+' / '+o.geometry.boundingBox.max.toArray().map(Math.round).join(',')),pos:o.position.toArray().map(Math.round).join(','),fn:top.face.normal.y.toFixed(2),name:o.name||'',par:o.parent&&o.parent.name||'',v:o.geometry&&o.geometry.attributes.position.count,col:o.material&&o.material.color?o.material.color.getHexString():'',n:0,dy:0,ex:[i]};bad.set(k,e)}e.n++;e.dy=Math.max(e.dy,+(top.point.y-ry).toFixed(2))}}}
 out.push([tk,T.d.name,'samples',n,'covered',cov,JSON.stringify([...bad.values()].filter(e=>e.dy<3).sort((a,b)=>b.n-a.n).slice(0,4).map(e=>[e.v,e.col,e.n,e.dy,e.mat,e.bb,e.ex[0]]))])}catch(e){out.push([tk,String(e)])}}return out})()""" % trk
run(W+'/Poly-Tourismo.html',[('js',js)],'cover')
