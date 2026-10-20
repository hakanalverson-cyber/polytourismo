import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const T=RACE.T,c=RACE.cars[0],m=c.m;m.g.updateMatrixWorld(true);let w=1e9,t=1e9,b=1e9;
if(m.ptRig){m.ptRig.traverse(o=>{if(o.isMesh){const bb=new THREE.Box3().setFromObject(o);w=Math.min(w,bb.min.y)}})}
m.g.traverse(o=>{if(o.isMesh&&o.visible&&o.name==='paint'){const bb=new THREE.Box3().setFromObject(o);b=Math.min(b,bb.min.y)}});
const s=T.surf(c.x,c.z,c.y);return JSON.stringify({cy:+c.y.toFixed(2),road:+s.h.toFixed(2),wheelMin:w==1e9?null:+w.toFixed(2),paintMin:+b.toFixed(2),rig:!!m.ptRig,rigY:m.ptRig?+m.ptRig.position.y.toFixed(2):0,vy:+m.visualModel.position.y.toFixed(2),ptBase:+(c.m.ptBase||0).toFixed(2)})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:3,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),('js',js),
('js',"(()=>{RACE.state='race';return 1})()"),('down','KeyW'),('wait',5000),('up','KeyW'),('wait',6000),('js',js),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'fl5')
