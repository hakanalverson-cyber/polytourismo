from shot import run,W
js="""(()=>{try{PT8.launch({mode:'mp',track:1,laps:2,humans:[{id:'c0',alt:0}],ai:PT8.makeAI({n:3,classes:['A','S'],skill:.95,rally:false}),tod:'day'});
 for(let i=0;i<60*4;i++)step(1/60);
 RACE.cars.forEach((c,i)=>{c.fin=true;c.finT=70+i*3.1+(c.human?0:1);c.lapT=[36+i,35+i*.7]});
 PT8.showResults();return RACE.cars.length}catch(e){return 'ERR '+e.message+e.stack}})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js),('js','document.dispatchEvent(new KeyboardEvent("keydown",{code:"KeyX",key:"x"}));0'),('wait',7000),('shot','res1')],'res1',size=(1280,720))
