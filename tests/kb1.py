from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),
('js',"(()=>{document.querySelector('.card[data-m=mp]').click();return 1})()"),('wait',1200),
('js',"(()=>{const b=document.querySelector('#cPl button[data-v=\"2\"]');if(b)b.click();return !!b})()"),('wait',800),('shot','p2a'),
('js',"(()=>{const b=document.querySelector('.p2kb .kbo[data-k=numpad]');if(b)b.click();return PT8.p2Keys})()"),('wait',600),('shot','p2b')]
run(W+'/Poly-Tourismo.html',st,'kb1')
