from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.ui.openShow('garage',{player:0,cap:null,ret:'s8setup',rally:true});return [...document.querySelectorAll('#shList .sect')].map(b=>b.textContent).join('|')})()"),('wait',3000),('shot','g1'),
('js',"(()=>{document.querySelector('#shList .sect[data-cat=WRC]').click();return [...document.querySelectorAll('#shList .ci')].map(b=>b.textContent).join(' | ')})()"),('wait',2500),('shot','g2'),
('js',"(()=>{document.querySelector('#shList .secback').click();document.querySelector('#shList .sect[data-cat=CASUAL]').click();return [...document.querySelectorAll('#shList .ci')].map(b=>b.querySelector('b').textContent).join(' | ')})()"),('wait',1500)]
run(W+'/Poly-Tourismo.html',st,'rg10')
