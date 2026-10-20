from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{const sv=PT8.SV();['lr','ford','must'].forEach(i=>{sv.owned[i]=1});PT8.ui.openShow('garage',{player:0,ret:'menu'});return 1})()"),('wait',6000),
('js',"(()=>{document.querySelector('.gc[data-id=must]').click();return 1})()"),('wait',7000),('shot','car'),
('js',"(()=>{document.getElementById('shAct').click();return 1})()"),('wait',1500),
('js',"JSON.stringify({sel:PT8.SV().sel[0],scr:[...document.querySelectorAll('.v8s.on,#menu.on')].map(e=>e.id)})")]
run(W+'/Poly-Tourismo.html',st,'gar8')
