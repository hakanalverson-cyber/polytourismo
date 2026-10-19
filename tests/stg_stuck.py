from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:13,laps:1,humans:[{id:'lr',alt:0}],ai:[]});
  const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const log=[];
  for(let i=0;i<60*400;i++){step(1/60);if(RACE.state==='done')break;if(i%1200===0)log.push([i/60|0,c.idx,+c.sp.toFixed(1),+c.x.toFixed(0),+c.z.toFixed(0),c.exp,c.respT])}
  return JSON.stringify({log,N:RACE.T.N,fin:c.fin})})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'stk')
