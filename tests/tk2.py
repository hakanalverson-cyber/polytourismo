from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),
('js',"(()=>{document.querySelector('.card[data-m=track]').click();return document.getElementById('suTitle').textContent})()"),('wait',1500),('shot','setup1'),
('js',"(()=>{document.getElementById('suGo').click();return document.getElementById('shTitle').textContent+' | '+document.getElementById('shSub').textContent+' | '+document.getElementById('shAct').textContent+' | '+document.querySelectorAll('#shList .ci').length})()"),('wait',3500),('shot','garage'),
('js',"(()=>{document.getElementById('shAct').click();return 1})()"),('wait',5000),('shot','prep'),
('js',"(()=>{const r=document.getElementById('rlPlay');if(r)r.click();return (typeof RACE!=='undefined'&&RACE)?('race '+RACE.cfg.mode+' '+RACE.cfg.rally+' '+RACE.cfg.circuit+' '+RACE.cars.length+' prep='+RACE.prep):'none'})()"),('wait',4500),('down','KeyW'),('wait',2500),('key','KeyE'),('wait',1500),('key','KeyE'),('wait',2500),('shot','race'),
('js',"(()=>{const c=RACE.cars[0];return JSON.stringify({sp:c.sp*2.237,g:c.gear,rg:c.rg,n:PT8.GT(c.cs).length,car:c.cs.name,state:RACE.state})})()")]
run(W+'/Poly-Tourismo.html',st,'tk2')
