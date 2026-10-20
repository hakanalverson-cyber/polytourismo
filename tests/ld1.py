from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.ui.openCards();document.querySelector('.card[data-m=ta]').click();return 1})()"),('wait',900),
('js',"(()=>{document.getElementById('suGo').click();return 1})()"),('wait',500),('shot','load1'),('wait',900),('shot','load2'),('wait',6000),
('js',"'scr '+scr+' race '+!!(RACE&&RACE.cars)+' loadOn '+document.getElementById('rlLoad').className")]
run(W+'/Poly-Tourismo.html',st,'ld1')
