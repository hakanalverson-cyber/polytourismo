from shot import run,W
st=[('wait',2500),('js',"(()=>{const sv=PT8.SV();PT8.CARS.forEach(c=>sv.owned[c.id]=1+0);sv.owned.merc=3;PT8.save();PT8.ui.openShow('garage',{player:0,cap:null,ret:'menu'});return PT8.CARS.length})()"),('wait',3000),
('js',"(()=>{document.querySelector('#shList .cats [data-cat=MUSCLE]').click();return 1})()"),('wait',1500),
('js',"(()=>{document.getElementById('shLv').click();return 1})()"),('wait',3500),('shot','l1')]
run(W+'/Poly-Tourismo.html',st,'lv10')
