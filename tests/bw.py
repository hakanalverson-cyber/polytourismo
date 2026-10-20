import sys
from shot import run,W
tr=sys.argv[1]
def tp(d):
    return ('js',"(()=>{const b=PT8.barnInfo();if(!b)return 'none';const c=RACE.cars[0];RACE.state='race';c.x=b.door.x+Math.sin(b.yaw)*%s;c.z=b.door.z+Math.cos(b.yaw)*%s;c.yaw=b.yaw+Math.PI;c.y=RACE.T.surf(c.x,c.z,b.y+9).h+1.2;c.vx=c.vy=c.vz=0;c.sp=0;return 1})()"%(d,d))
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return RACE.T.d.name})()"%tr),('wait',9000),
tp(40),('wait',2500),('shot','a'),tp(22),('wait',2500),('shot','b'),tp(9),('wait',2500),('shot','c')]
run(W+'/Poly-Tourismo.html',st,'bw'+tr)
