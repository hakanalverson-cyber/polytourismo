from shot import run,W
js="""(()=>{const cs={};PT8.CARS.forEach(c=>cs[c.cat]=(cs[c.cat]||0)+1);const ro=PT8.CARS.filter(c=>c.rallyOnly).map(c=>c.id+':'+c.name+':'+(PT8.RALLY_CARS.includes(c.id)));return [PT8.CARS.length,JSON.stringify(cs),ro.join(' | '),PT8.CARS.some(c=>c.name==='DELETE THIS'),PT8.loanerFor(null,false).id]})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',js)],'ro10')
