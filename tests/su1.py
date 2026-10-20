from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.ui.openCards();return 1})()"),('wait',600),
('js',"(()=>{document.querySelector('.card[data-m=mp]').click();return 1})()"),('wait',1200),
('js',"(()=>{PT8.ui.ST.players=2;PT8.ui.renderSetup();return 1})()"),('wait',800),('js',"(()=>{document.getElementById('suDrv').scrollIntoView();return 1})()"),('wait',400),('shot','mp')]
run(W+'/Poly-Tourismo.html',st,'su1')
