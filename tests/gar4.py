from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const sv=PT8.SV();['lr','ford','must','art','p1','c2','c30'].forEach(i=>{if(PT8.BYID[i])sv.owned[i]=1});PT8.ui.openShow('garage',{player:0,ret:'menu'});return 1})()"),('wait',12000),('shot','g4'),('js',"(()=>{document.querySelector('[data-of]').click();return 1})()"),('wait',4000),('shot','g5'),('js',"(()=>{const l=document.getElementById('shList');l.scrollTop=l.scrollHeight;return 1})()"),('wait',6000),('shot','g6')]
run(W+'/Poly-Tourismo.html',st,'gar4')
