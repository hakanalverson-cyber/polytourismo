import sys
from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200)]
for tr in ['1','2','7']:
    st+=[('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return RACE.T.d.name})()"%tr),('wait',3500),
    ('js',"JSON.stringify(PT8.barnInfo())"),
    ('js',"(()=>{const b=PT8.barnInfo();if(!b)return 'none';const c=RACE.cars[0];RACE.state='race';c.x=b.door.x+Math.sin(b.yaw)*9;c.z=b.door.z+Math.cos(b.yaw)*9;c.yaw=b.yaw+Math.PI;c.y=b.y+2;c.vx=c.vy=c.vz=0;return 'tp'})()"),('wait',2500),('shot','t'+tr)]
run(W+'/Poly-Tourismo.html',st,'barn2')
