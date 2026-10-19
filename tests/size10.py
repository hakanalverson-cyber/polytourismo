from shot import run,W
js="""(()=>{const out=[];for(let k=0;k<136;k++){const g=PT8.C10.model(k,0);const b=new THREE.Box3().setFromObject(g),s=b.getSize(new THREE.Vector3());const sc=(g.userData.gl||4.5)/Math.max(s.x,s.z,.001);out.push([k,+(s.z*sc).toFixed(2),+(s.x*sc).toFixed(2),+(s.y*sc).toFixed(2)])}
return JSON.stringify(out)})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'sz10')
