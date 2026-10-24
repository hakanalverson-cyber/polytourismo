from shot import run,W
K=lambda c:"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'%s',code:'%s'}));return 1})()"%(c,c)
steps=[('wait',12000),('shot','a0'),('js',"(()=>{document.getElementById('ptTitle').click();return 1})()"),('wait',4000),('shot','a_menu'),('js',"(()=>{const t=document.querySelectorAll('.gtt .gtab')[3];t.dispatchEvent(new MouseEvent('mouseenter'));return 1})()"),('wait',500),('shot','b_menu')]
run(W+'/Poly-Tourismo.html',steps,'menu2')
