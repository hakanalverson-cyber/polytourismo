from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const sv=PT8.SV();['lr','ford','must'].forEach(i=>{sv.owned[i]=1});PT8.ui.openShow('garage',{player:0,ret:'menu'});return 1})()"),('wait',7000),
('js',"(()=>{const e=document.querySelector('.gc[data-id=ford]');return e?e.className:'none'})()"),
('js',"(()=>{const e=document.querySelector('.gc[data-id=ford]');e.click();return 1})()"),('wait',2500),
('js',"document.getElementById('s8show').className+' fade:'+document.getElementById('shFade').className"),('shot','car')]
import sys
run(W+'/Poly-Tourismo.html',st,'gar6')
