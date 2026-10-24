from shot import run,W
steps=[('wait',9000),('js',"(()=>{document.getElementById('ptTitle').click();return 1})()"),('wait',3000),
('js',"(()=>{PT8.SV().cr=999999;[...document.querySelectorAll('.gtab')].find(x=>/Brand Central/.test(x.textContent)).click();return 1})()"),('wait',10000),('shot','g1'),
('js',"(()=>{const e=[...document.querySelectorAll('#shList .mk')].find(x=>/NISSAN/.test(x.textContent));e.click();return !!e})()"),('wait',9000),
('js',"(()=>{const c=document.querySelectorAll('#shStrip .gc');c[3].dispatchEvent(new MouseEvent('click',{bubbles:true}));return c.length})()"),('wait',6000),('shot','g2')]
run(W+'/Poly-Tourismo.html',steps,'gtb')
