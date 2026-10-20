from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',500),('js',"PT8.CARS.map(c=>c.id+'|'+c.name+'|'+c.cat+'|'+c.cls+'|'+c.top+'|'+c.acc).join('\\n')")],'k')
