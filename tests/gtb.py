from shot import run,W
steps=[('wait',9000),('js',"(()=>{document.getElementById('ptTitle').click();return 1})()"),('wait',3000),('shot','g0'),
('js',"(()=>{PT8.SV().cr=999999;[...document.querySelectorAll('.gtab')].find(x=>/Brand Central/.test(x.textContent)).click();return 1})()"),('wait',4000),('shot','g1'),('wait',4000),('shot','g2')]
run(W+'/Poly-Tourismo.html',steps,'gtb')
