import sys
from shot import run,W
tr=sys.argv[1];mode=sys.argv[2] if len(sys.argv)>2 else 'ta'
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'%s',track:%s,laps:1,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return RACE.T.d.name})()"%(mode,tr)),('wait',9000),
('js',"(()=>{const c=RACE.cars[0],T=RACE.T;RACE.state='race';const s=Math.sin(T.psi[0]),co=Math.cos(T.psi[0]);c.x=T.x[0]-s*14;c.z=T.z[0]-co*14;c.y=T.y[0]+1.2;c.yaw=T.psi[0];c.vx=c.vy=c.vz=0;c.sp=0;return 1})()"),('wait',2500),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'sl'+tr)
