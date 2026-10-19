from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',"(()=>{PT8.ui.openCards();return 1})()"),('wait',800),('shot','a'),('js',"(()=>{const c=document.querySelectorAll('.card');c[2].classList.add('foc');c[2].dispatchEvent(new MouseEvent('mouseenter'));return 1})()"),('hover','.card[data-m=cutup]'),('wait',700),('shot','b')],'cardh')
