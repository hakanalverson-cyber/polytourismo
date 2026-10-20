import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const rows=[];RACE.scene.traverse(o=>{if(!(o.isMesh))return;const g=o.geometry;const t=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);rows.push([Math.round(t),o.isInstancedMesh?'I'+o.count:'M',o.castShadow?'S':'-',o.name||(o.userData&&o.userData.ptProp)||'',o.visible?'':'hid',o.frustumCulled?'':'noCull'])});
rows.sort((a,b)=>b[0]-a[0]);const tot=rows.reduce((a,b)=>a+b[0],0);return JSON.stringify({tot,n:rows.length,top:rows.slice(0,14).map(r=>r.join(' '))})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'pf')
