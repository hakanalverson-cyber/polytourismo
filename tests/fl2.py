import sys
from shot import run,W
tr,idx,name=sys.argv[1],sys.argv[2],sys.argv[3]
tp="""(()=>{const T=RACE.T,c=RACE.cars[0],i=%s;RACE.state='race';c.x=T.x[i];c.z=T.z[i];c.y=T.y[i]+1;c.yaw=T.psi[i];c.vx=c.vy=c.vz=0;c.sp=0;c.idx=i;c.unw=i;return 1})()"""%idx
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',7000),('js',tp),('wait',2500),('shot',name)]
run(W+'/Poly-Tourismo.html',st,'fl2')
