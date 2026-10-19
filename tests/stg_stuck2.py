from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:13,laps:1,humans:[{id:'lr',alt:0}],ai:[]});
  const c=RACE.cars[0],T=RACE.T;c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};
  for(let i=0;i<60*80;i++)step(1/60);
  const o=[];for(let k=-6;k<=6;k++){const i=(441+k*8+T.N)%T.N;o.push([i,+T.x[i].toFixed(0),+T.z[i].toFixed(0),+T.y[i].toFixed(1),+T.hw[i].toFixed(1),T.gap[i]|0,T.wall[i]|0,+(T.psi[i]).toFixed(2)])}
  return JSON.stringify({o,car:[c.x,c.z,c.y,c.yaw,c.onRoad,c.idx,c.pitch,c.roll],jumps:T.jumps})})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'stk')
