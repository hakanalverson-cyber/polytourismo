from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:3,humans:[{id:'merc',alt:0},{id:'ferr',alt:0}],ai:[]});
 for(let i=0;i<60*5;i++)step(1/60);
 const hs=RACE.cars.filter(c=>c.human),T=RACE.T;let base=40;
 for(let k=0;k<420;k++){const i1=(base+Math.floor(k*38/60/T.sp*1))%T.N,i2=(i1-3+T.N)%T.N;
  for(const [c,i] of [[hs[0],i1],[hs[1],i2]]){c.x=T.x[i];c.z=T.z[i];c.y=T.y[i]+.4;c.yaw=T.psi[i];c.vx=Math.sin(T.psi[i])*38;c.vz=Math.cos(T.psi[i])*38;c.idx=i}
  step(1/60);hudUpdate()}
 return {draft:hs[1].draft,sp:hs[1].sp}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a),('shot','d1'),('js',"(()=>{for(let k=0;k<7;k++){const hs=RACE.cars.filter(c=>c.human),T=RACE.T;for(const [c,o] of [[hs[0],0],[hs[1],-3]]){const i=(c.idx+0)%T.N;}step(1/60)}return 1})()"),('shot','d2')],'hud5')
