from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.launch({mode:'ta',track:3,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'night',endur:false});return 1})()"),('wait',6000),
('js',"(()=>{const sc=RACE.scene,T=RACE.T,o=[];sc.traverse(m=>{if(m.isMesh&&m.geometry){m.geometry.computeBoundingBox();const b=m.geometry.boundingBox,s=new THREE.Vector3();b.getSize(s);if(s.x>300&&s.z>300||s.x*s.z>40000)o.push((m.geometry.type)+' y'+b.min.y.toFixed(1)+'..'+b.max.y.toFixed(1)+' pos'+m.position.y.toFixed(1)+' sz'+s.x.toFixed(0)+'x'+s.z.toFixed(0)+' col'+(m.material.color?m.material.color.getHexString():''))}});const i=40;return o.join(' | ')+' || road y '+T.y[i].toFixed(1)+' terr '+T.terr(T.x[i]+30,T.z[i]).toFixed(1)})()")]
run(W+'/Poly-Tourismo.html',st,'gr1')
