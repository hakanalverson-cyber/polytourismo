from shot import run,W
js="""(()=>JSON.stringify(PT8.CARS.filter(c=>PT8.RALLY_CARS.includes(c.id)).map(c=>c.id+':'+c.name+':'+c.cls+':'+(c.rallyOnly?'RO':''))))()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'cls10')
