from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"document.title+' | '+document.getElementById('logo').innerText.replace(/\\n/g,' ')"),('shot','menu')],'nm1')
