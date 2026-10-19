from shot import run,W
js="""(()=>{const r=[];for(let i=0;i<8;i++){PT8.launch({mode:'race',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['D','C','B'],skill:.8})});r.push(RACE.cars.find(c=>c.human).slot);}
const slots=RACE.cars.map(c=>c.slot).sort((a,b)=>a-b).join(',');
PT8.launch({mode:'career',ev:{startPos:1},track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['D','C','B'],skill:.8})});const p1=RACE.cars.find(c=>c.human).slot;
PT8.launch({mode:'career',ev:{startPos:8},track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['D','C','B'],skill:.8})});const p8=RACE.cars.find(c=>c.human).slot;
PT8.launch({mode:'race',grid:'fixed',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['D','C','B'],skill:.8})});const fx=RACE.cars.find(c=>c.human).slot;
return JSON.stringify({humanSlots:r,allSlots:slots,pole:p1,last:p8,fixed:fx})})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',js)],'grid')
