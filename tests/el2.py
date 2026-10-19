from shot import run,W
a="""(()=>{PT8.launch({mode:'elim',track:0,laps:99,humans:[{id:'merc',alt:0},{id:'ferr',alt:0}],ai:PT8.makeAI({n:2,classes:['A'],skill:.9,rally:false}),interval:20,endur:false});
 let booms=0;const s0=PT8.sfx;PT8.sfx=(n,a)=>{if(n==='boom')booms++;return s0(n,a)};
 for(let i=0;i<60*70;i++){step(1/60);if(i%10==0)hudUpdate()}
 return {out:RACE.cars.filter(c=>c.out).map(c=>c.ptName),booms,state:RACE.state,tyreAny:RACE.cars.some(c=>c.tyre!=null&&c.tyre<1)}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a)],'el2')
