from shot import run,W
js="""(()=>{const out=[];for(let k=0;k<136;k++){const g=PT8.C10.model(k,0);if(!g)continue;const b=new THREE.Box3().setFromObject(g),s=b.getSize(new THREE.Vector3());const gl=g.userData.gl||4.5,sc=gl/Math.max(s.x,s.z,.001);out.push([k,((PT8.BYID||{})['c'+k]||{}).name||'',+Math.max(s.x,s.z).toFixed(2),+Math.min(s.x,s.z).toFixed(2),+s.y.toFixed(2),+(Math.max(s.x,s.z)*sc).toFixed(2),+(Math.min(s.x,s.z)*sc).toFixed(2),+(s.y*sc).toFixed(2)])}
return JSON.stringify(out)})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'pop10')
