from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.ui.openShow('brand',{player:0,cap:null,ret:'menu'});const c=PT8.BYID['c47'];document.querySelector('#shList .sect[data-cat=SPORTS]').click();document.querySelector('#shList .ci[data-id=c47]').click();return 1})()"),('wait',3500),('shot','p1'),
('js',"(()=>{document.querySelector('#shList .secback').click();document.querySelector('#shList .sect[data-cat=HATCHBACK]').click();document.querySelector('#shList .ci[data-id=c91]').click();return 1})()"),('wait',3000),('shot','p2')]
run(W+'/Poly-Tourismo.html',st,'pol10')
