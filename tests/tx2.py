from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.ui.openCards();document.querySelector('.card[data-m=ta]').click();const w=document.getElementById('ptWipe');return 'wipe go '+w.classList.contains('go')+' anims '+document.getAnimations().map(a=>a.animationName).join(',').slice(0,200)})()")]
run(W+'/Poly-Tourismo.html',st,'tx2')
