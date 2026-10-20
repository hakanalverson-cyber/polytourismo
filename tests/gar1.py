from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const sv=PT8.SV();['lr','ford','must','art','p1'].forEach(i=>{if(PT8.BYID[i])sv.owned[i]=1});PT8.ui.openShow('garage',{player:0,ret:'menu'});return document.querySelectorAll('.gc').length+' '+document.querySelectorAll('.gc.lock').length})()"),('wait',6000),('shot','g1'),
('js',"(()=>{document.querySelector('[data-of]').click();return PT8.SV&&document.querySelectorAll('.gh').length})()"),('wait',3000),('shot','g2'),
('js',"(()=>{const l=document.getElementById('shList');l.scrollTop=l.scrollHeight;return 1})()"),('wait',5000),('shot','g3')]
run(W+'/Poly-Tourismo.html',st,'gar1')
