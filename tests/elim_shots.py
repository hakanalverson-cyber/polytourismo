from shot import run,W
go="""(()=>{PT8.launch({mode:'elim',track:0,laps:99,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:4,classes:['C','B'],skill:.8,rally:false}),interval:20});
 for(let i=0;i<60*34;i++){step(1/60)}; for(let i=0;i<6;i++)hudUpdate(); return RACE.cars.map(c=>[c.ptName,c.out])})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',"(()=>{show('s8cards');return 1})()"),('wait',500),('shot','cards'),('js',"(()=>{document.querySelector('[data-m=elim]').click();return 1})()"),('wait',600),('shot','setup'),('js',go),('wait',300),('shot','hud')],'el')
