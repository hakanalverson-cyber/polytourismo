from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),('js',"(()=>{document.querySelector('.card[data-m=ta]').click();return document.querySelectorAll('.trk .bnh').length})()"),('wait',1500),('shot','list')]
run(W+'/Poly-Tourismo.html',st,'bh1')
