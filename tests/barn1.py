import sys
from shot import run,W
tr=sys.argv[1] if len(sys.argv)>1 else '0'
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return RACE&&RACE.T.d.name})()"%tr),('wait',5500),('js',"RACE.state"),('wait',6000),('js',"RACE.state"),
('js',"JSON.stringify(PT8.barnInfo())"),
('js',"(()=>{const b=PT8.barnInfo();if(!b)return 'none';const c=RACE.cars[0];RACE.state='race';c.x=b.door.x+Math.sin(b.yaw)*9;c.z=b.door.z+Math.cos(b.yaw)*9;c.yaw=b.yaw+Math.PI;c.y=b.y+2;c.vx=c.vy=c.vz=0;c.sp=0;return 'tp'})()"),('wait',2500),('shot','near'),
('js',"(()=>{const b=PT8.barnInfo();const c=RACE.cars[0];c.x=b.door.x+Math.sin(b.yaw)*3;c.z=b.door.z+Math.cos(b.yaw)*3;c.y=b.y+2;return document.getElementById('barnPrompt')?document.getElementById('barnPrompt').style.opacity:'noel'})()"),('wait',1500),
('js',"(()=>document.getElementById('barnPrompt')&&document.getElementById('barnPrompt').style.opacity)()"),('shot','door'),
('key','Space'),('wait',1200),('shot','fade'),('wait',3000),('js',"PT8.barnT(3.5)"),('wait',3000),('shot','open'),('js',"PT8.barnT(5.3)"),('wait',4000),('shot','card'),
('key','Space'),('wait',2500),('shot','after'),
('js',"JSON.stringify({o:PT8.SV().owned,b:PT8.SV().barn,pi:PT8.barnInfo()})")]
run(W+'/Poly-Tourismo.html',st,'barn1_'+tr)
