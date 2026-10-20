import sys
from shot import run,W
js="""(()=>{const out=[];RACE.scene.children.forEach(o=>{const bb=new THREE.Box3().setFromObject(o);const s=bb.getSize(new THREE.Vector3());if(o.isInstancedMesh)return;if(s.x>70||s.z>70)return;if(Math.max(s.x,s.z)>7&&s.y>2){const m=o.material||(o.children[0]&&o.children[0].material);out.push([o.type,o.geometry?o.geometry.type:'grp'+o.children.length,s.x.toFixed(0),s.y.toFixed(0),s.z.toFixed(0),(o.position.x|0),(o.position.z|0),m&&m.color?m.color.getHexString():''].join(' '))}});return RACE.T.d.name+'\\n'+out.slice(0,40).join('\\n')})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%sys.argv[1]),('wait',6000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'sv')
