from shot import run,W
st=[('wait',6000),('shot','menu'),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',2500),('shot','menu2')]
run(W+'/Poly-Tourismo.html',st,'mn1')
