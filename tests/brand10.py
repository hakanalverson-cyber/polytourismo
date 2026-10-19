from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.ui.openShow('brand',{player:0,cap:null,ret:'menu'});return PT8.CARS.length})()"),('wait',3500),('shot','b1'),
('js',"(()=>{document.querySelector('.cats [data-cat=MUSCLE]').click();return document.querySelectorAll('#shList .ci').length})()"),('wait',2500),('shot','b2')]
run(W+'/Poly-Tourismo.html',st,'br10')
