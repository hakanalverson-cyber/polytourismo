from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const sv=PT8.SV();['lr','ford','must','art','p1','c2','c30','c20','c36'].forEach(i=>{if(PT8.BYID[i])sv.owned[i]=1});PT8.ui.openShow('garage',{player:0,ret:'menu'});return document.getElementById('s8show').className})()"),('wait',9000),('shot','grid'),
('js',"(()=>{document.querySelector('.gc[data-id=c2]').click();return 'clicked'})()"),('wait',250),('shot','fade'),('wait',3500),('shot','car'),
('key','ArrowRight'),('wait',3000),('shot','car2'),
('key','Escape'),('wait',2500),('shot','back'),('js',"document.getElementById('s8show').className")]
run(W+'/Poly-Tourismo.html',st,'gar5')
