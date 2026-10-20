import sys
from shot import run,W
tr=sys.argv[1];tod=sys.argv[2]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'p1',alt:0,name:'B'}],tod:'%s',endur:false});return RACE.T.d.name})()"%(tr,tod)),('wait',9000),
('js',"(()=>{const c=RACE.cars[0],T=RACE.T;RACE.state='race';const k=%s;c.x=T.x[k];c.z=T.z[k];c.y=T.y[k]+1.2;c.yaw=T.psi[k];c.vx=c.vy=c.vz=0;c.sp=0;return 1})()"%(sys.argv[3] if len(sys.argv)>3 else '40')),('wait',2500),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'ng'+tr+tod)
