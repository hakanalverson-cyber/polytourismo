from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();return 1})()"""),('wait',150),('js',"""(()=>{const e=document.getElementById('rlLoad');return e?e.className+' '+getComputedStyle(e).opacity:'none'})()"""),('shot','l1')]
run(W+'/Poly-Tourismo.html',steps,'l')
