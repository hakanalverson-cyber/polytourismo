from shot import run,W
st=[('wait',800),('js',"(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();return 1})()"),('wait',9000),
('js',"(()=>{document.getElementById('suGo').click();return 1})()"),('wait',14000),
('js',"(()=>{document.getElementById('rlPlay').click();return 1})()"),('wait',3000),
('js',"(()=>{const d=document.getElementById('rlDash');return 'in race: '+(d&&getComputedStyle(d).display)})()"),
('js',"(()=>{PT8.cleanupRace();show('menu');const d=document.getElementById('rlDash'),s=document.getElementById('rlStat');return 'after quit: '+(d&&getComputedStyle(d).display)+' '+(s&&getComputedStyle(s).display)+' '+document.body.className})()")]
run(W+'/Poly-Tourismo.html',st,'lv')
