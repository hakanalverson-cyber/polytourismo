from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),('js',"(()=>{document.querySelector('.card[data-m=rally]').click();return 1})()"),('wait',9000),
('js',"(()=>{document.querySelector('#cPl button[data-v=\"2\"]').click();document.getElementById('suGo').click();return document.getElementById('shSub').textContent+' | '+document.getElementById('shAct').textContent})()"),('wait',3000),('shot','v1'),
('js',"(()=>{document.getElementById('shAct').click();return document.getElementById('shAct').textContent+' P'+document.querySelector('#shTabs .sel').textContent})()"),('wait',2500),('shot','v2'),
('js',"(()=>{document.getElementById('shAct').click();return document.getElementById('scr')?1:(window.RACE?'race':'none')})()"),('wait',3000),('shot','v3')]
run(W+'/Poly-Tourismo.html',st,'rs10')
