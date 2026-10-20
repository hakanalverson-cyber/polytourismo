import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const cam=RACE.cars[0].cam;cam.updateMatrixWorld();const fr=new THREE.Frustum(),m=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(m);
const rows=[];let tot=0;RACE.scene.traverse(o=>{if(!o.isMesh||!o.visible)return;if(o.frustumCulled&&!fr.intersectsObject(o))return;const g=o.geometry,t=Math.round((g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1));tot+=t;rows.push([t,o.isInstancedMesh?'I'+o.count:'M',o.name||(o.userData&&o.userData.ptProp)||'',o.material&&o.material.type])});
const by={};rows.forEach(r=>{const k=r[1][0]+':'+r[2]+':'+r[3];by[k]=(by[k]||0)+r[0]});const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,12);return JSON.stringify({tot,n:rows.length,top})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'pf')
