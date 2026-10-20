import sys
from shot import run,W
js="""(()=>{const bad=[];RACE.scene.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints){const g=o.geometry;if(!g){bad.push('nogeo '+o.name);return}const a=g.attributes;if(!a.position||(o.material&&o.material.vertexColors&&!a.color)||(o.isInstancedMesh&&!o.instanceMatrix))bad.push((o.userData.ptProp||o.name||o.type)+' '+Object.keys(a)+' vc='+(o.material&&o.material.vertexColors)+' inst='+!!o.isInstancedMesh);for(const k in a)if(!a[k]||!a[k].array)bad.push('nullattr '+k)}});return JSON.stringify(bad.slice(0,15))})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'rally',track:%s,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%sys.argv[1]),('wait',6000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'rs')
