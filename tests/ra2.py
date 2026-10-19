from shot import run,W
js="""(()=>{try{PT8.launch({mode:'mp',track:14,laps:2,humans:[{id:'c0',alt:0}],ai:PT8.makeAI({n:3,classes:['A','S'],skill:.95,rally:false}),tod:'day'});
 const out=[];for(let t=0;t<60*170;t++){step(1/60);if(t%(60*20)==0)out.push(RACE.cars.map(c=>Math.round((c.lap||0)*100+(c.idx||0)/RACE.T.N*100)+':'+Math.round(c.sp*3.6)).join(' '))}
 return out.join(' | ')}catch(e){return 'ERR '+e.message+e.stack}})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'ra2')
