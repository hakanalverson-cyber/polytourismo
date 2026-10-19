import sys;sys.path.insert(0,'/home/claude/polytourismo/tests')
from shot import run
js="""(()=>{const out=[];CAR_MODELS.forEach((m,i)=>{if(!m)return;const mats={};m.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(q=>{const k=(q.name||'?')+'#'+q.color.getHexString();const n=o.geometry.attributes.position.count;mats[k]=mats[k]||{n:0,uv:!!o.geometry.attributes.uv,map:!!q.map,m:+q.metalness.toFixed(2),r:+q.roughness.toFixed(2),meshes:[]};mats[k].n+=n;if(mats[k].meshes.length<3)mats[k].meshes.push(o.name)})});out.push(CAR_MODEL_NAMES[i]+' '+JSON.stringify(mats))});return out.join('\\n')})()"""
run('/home/claude/polytourismo/dist/Poly-Tourismo.html',[('wait',3000),('js',js)])
