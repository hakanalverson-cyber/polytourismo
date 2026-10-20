from shot import run,W
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"JSON.stringify(PT8.CARS.filter(c=>c.rdiv).map(c=>[c.name,c.rdiv,c.off]))")]
run(W+'/Poly-Tourismo.html',st,'rd')
