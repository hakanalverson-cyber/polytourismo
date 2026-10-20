import sys
from shot import run,W
tr=sys.argv[1]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),
('js',"(()=>{RACE.state='race';return 1})()"),('wait',9000),('js',"JSON.stringify([PT8.dynRes,R.domElement.width])"),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'cv'+tr)
