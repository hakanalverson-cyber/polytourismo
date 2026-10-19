from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu',rally:true});document.querySelector('#shList .sect[data-cat=WRC]').click();document.querySelector('#shList .ci[data-id=c51]').click();return 1})()"),('wait',3500),('shot','r51'),
('js',"(()=>{document.querySelector('#shList .ci[data-id=c108]').click();return 1})()"),('wait',3000),('shot','r108')]
run(W+'/Poly-Tourismo.html',st,'cmp10')
