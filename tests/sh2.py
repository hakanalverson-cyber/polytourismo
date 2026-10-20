import sys
from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"),('wait',9000),
('js',"(()=>{RACE.state='race';const c=RACE.cars[0];c.sp=0;return 1})()"),('wait',1500),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'sh2')
