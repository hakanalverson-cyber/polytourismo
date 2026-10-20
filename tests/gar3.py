from shot import run,W
st=[('wait',2500),('js',"JSON.stringify(PT8.CARS.filter(c=>!c.rallyOnly&&!c.trackOnly&&(c.cls==='A'||c.cls==='B')&&c.price>40000).map(c=>c.id+':'+c.name+':'+c.cls+':'+c.price))")]
run(W+'/Poly-Tourismo.html',st,'gar3')
