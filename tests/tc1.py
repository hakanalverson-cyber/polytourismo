from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',"JSON.stringify(PT8.CARS.filter(c=>c.cat==='TRACK').map(c=>[c.id,c.name,c.cls,c.rallyOnly?1:0]))")],'tc1')
