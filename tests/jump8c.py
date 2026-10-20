from shot import run,W
js="""(()=>{D[8].jumps=[[7,0,22,5.6]];PT8.launch({mode:'ta',track:8,laps:1,humans:[{id:'merc',alt:0}],ai:[]});const Rc=RACE,T=Rc.T,c=Rc.cars[0];
  for(let i=0;i<60*8&&Rc.state!=='race';i++)step(1/60);
  const J=T.jumps[0],gl=T.jgl,rl=Math.round(60/T.sp),i0=(J-rl-6+T.N)%T.N;const kmh=140;
  c.x=T.x[i0];c.z=T.z[i0];c.y=T.y[i0]+1.0;c.yaw=T.psi[i0];c.idx=i0;c.unw=i0+T.N;const v=kmh/3.6;c.vx=Math.sin(T.psi[i0])*v;c.vz=Math.cos(T.psi[i0])*v;c.vy=0;
  const log=[Rc.state,c.respT,c.human,c.forceAI];
  for(let i=0;i<60*4;i++){c.in={th:1,br:0,st:0,hb:0};step(1/60);if(i%10===0)log.push([i,(c.idx-J+T.N)%T.N,+c.y.toFixed(1),Math.round(c.sp*3.6),+c.respT.toFixed(1),c.exp])}
  return JSON.stringify(log)})()"""
run(W+'/Poly-Tourismo.html',[('js',js)],'j8c')
