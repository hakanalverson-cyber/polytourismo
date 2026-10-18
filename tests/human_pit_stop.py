from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:10,humans:[{id:'merc',alt:0}],ai:[]});return 1})()"""
b="""(()=>{const c=RACE.cars[0];for(let i=0;i<60*8;i++)step(1/60);const T=RACE.T,p=RACE.pit,i=p.a+3;c.tyre=.3;c.fuel=.4;
 const sn=Math.sin(T.psi[i]),cs=Math.cos(T.psi[i]);c.x=T.x[i]+cs*T.hw[i]*.6;c.z=T.z[i]-sn*T.hw[i]*.6;c.y=T.y[i]+1;c.yaw=T.psi[i];c.vx=c.vz=0;c.sp=0;c.in={th:0,br:0,st:0,hb:0};
 const log=[];for(let k=0;k<60*6;k++){step(1/60);if(k%60==0)log.push([+c.sp.toFixed(1),c.pitSvc,+c.tyre.toFixed(2),+c.fuel.toFixed(2),c.idx])}
 return log})()"""
run(W+'/Poly-Tourismo.html',[('js',a),('wait',1000),('js',b),('shot','pit')],'r4')
