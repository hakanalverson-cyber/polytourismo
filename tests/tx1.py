from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.ui.openCards();return 1})()"),('wait',230),('shot','a'),('wait',500),('shot','b'),('wait',900),('shot','c')]
run(W+'/Poly-Tourismo.html',st,'tx1')
