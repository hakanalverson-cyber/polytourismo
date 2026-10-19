from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),('js',"(()=>{document.querySelector('.card[data-m=rally]').click();return 1})()"),('wait',9000),('shot','r1'),
('js',"(()=>{document.getElementById('suGo').click();return document.getElementById('s8setup').className})()"),('wait',2500),('shot','r2'),
('js',"(()=>{document.querySelector('#s8setup [data-a=back]').click();return document.getElementById('s8setup').className})()"),('wait',800)]
run(W+'/Poly-Tourismo.html',st,'rs10')
