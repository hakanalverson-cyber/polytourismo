from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),('shot','cards'),
('js',"(()=>{document.querySelector('.card[data-m=track]').click();return document.querySelectorAll('#trkList .trk').length+' '+document.getElementById('suTitle').textContent})()"),('wait',1500),('shot','setup1'),
('js',"(()=>{document.getElementById('suGo').click();return document.getElementById('shTitle').textContent+' | '+document.getElementById('shSub').textContent+' | '+document.getElementById('shAct').textContent+' | '+document.querySelectorAll('#shList .ci').length})()"),('wait',3500),('shot','garage'),
('js',"(()=>{document.getElementById('shAct').click();return (typeof RACE!=='undefined'&&RACE)?('race '+RACE.cfg.mode+' '+RACE.cars.length):'none'})()"),('wait',3000),('shot','race')]
run(W+'/Poly-Tourismo.html',st,'tk1')
