from shot import run,W
js="""(()=>{const out=[];for(const wx of ['clear','rain','fog']){for(const rev of [false,true]){try{PT8.launch({mode:'mp',track:14,laps:2,humans:[{id:'c24',alt:0},{id:'c9',alt:0}],ai:PT8.makeAI({n:5,classes:['A','S'],skill:.95,ids:PT8.TRACK_CARS}),weather:wx,rev,tod:'dusk'});for(let i=0;i<60*40;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();out.push(wx+(rev?'R':'F')+':'+RACE.cars.length+' '+Math.round(RACE.cars[2].sp*3.6)+'kmh')}catch(e){out.push(wx+' ERR '+e.message)}}}return out.join(' | ')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'ra6')
