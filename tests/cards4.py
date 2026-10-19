from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),('shot','a'),('key','ArrowDown'),('wait',500),('shot','b'),('key','ArrowRight'),('key','ArrowUp'),('wait',500),('shot','c'),
('js',"(()=>{return [...document.querySelectorAll('.card')].map(c=>c.dataset.m+':'+Math.round(c.getBoundingClientRect().width)+'x'+Math.round(c.getBoundingClientRect().height)).join(' ')})()"),
('key','Digit3'),('wait',1500),('js',"document.getElementById('suTitle').textContent")]
run(W+'/Poly-Tourismo.html',st,'cards4')
