import sys
from shot import run,W
sc=sys.argv[1]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.rallyIntro(()=>{},null,{scene:'%s',title:'T',sub:'S',noStage:true});return 1})()"%sc),('wait',1000),('shot','a'),('wait',700),('shot','b')]
run(W+'/Poly-Tourismo.html',st,'ld3'+sc)
