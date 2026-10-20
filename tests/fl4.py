import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const T=RACE.T,c=RACE.cars[0];RACE.state='race';const res=[];
for(const i of [0]){c.m.g.updateMatrixWorld(true);let mn=1e9;c.m.g.traverse(o=>{if(o.isMesh&&o.name==='tires'){const b=new THREE.Box3().setFromObject(o);mn=Math.min(mn,b.min.y)}});
res.push({y:+c.y.toFixed(2),road:+T.surf(c.x,c.z,c.y).h.toFixed(2),tireMin:+mn.toFixed(2)})}
return JSON.stringify(res)})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',8000),('js',"(()=>{const T=RACE.T,c=RACE.cars[0],i=40;c.x=T.x[i];c.z=T.z[i];c.y=T.y[i]+1.5;c.vx=c.vy=c.vz=0;c.sp=0;c.idx=i;c.unw=i;return 1})()"),('wait',4000),('js',js),('wait',1500),('js',js)]
run(W+'/Poly-Tourismo.html',st,'fl4')
