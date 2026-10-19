from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:12,laps:2,humans:[{id:'merc',alt:0}],ai:[],rev:false});
  const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};let pr=false,log=[];
  for(let i=0;i<60*300;i++){step(1/60);if(RACE.state==='done')break;const r=c.respT>.5;if(r&&!pr)log.push({t:+(i/60).toFixed(1),idx:c.idx,x:+c.x.toFixed(0),z:+c.z.toFixed(0),y:+c.y.toFixed(1),sp:+c.sp.toFixed(0)});pr=r}
  return JSON.stringify({log,N:RACE.T.N,jumps:RACE.T.jumps})})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'rs')
