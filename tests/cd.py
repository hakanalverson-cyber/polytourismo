from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"JSON.stringify(PT8.CARS.map(c=>[c.id,c.name,c.cat,c.cls,PT8.pp(c),c.price,c.k10,c.rallyOnly?1:0,c.trackOnly?1:0]))")]
run(W+'/Poly-Tourismo.html',st,'cd')
