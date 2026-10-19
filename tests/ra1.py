from shot import run,W
js="""(()=>{try{PT8.launch({mode:'mp',track:14,laps:2,humans:[{id:'c0',alt:0}],ai:PT8.makeAI({n:3,classes:['A','S'],skill:.95,rally:false}),tod:'day'});
 for(let i=0;i<60*8;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return RACE.cars.length+' '+Math.round(RACE.T.L)}catch(e){return 'ERR '+e.message+e.stack}})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js),('wait',600),('shot','ra1')],'ra1')
