from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:3,humans:[{id:'merc',alt:0},{id:'ferr',alt:0}],ai:[]});
 for(let i=0;i<60*6;i++){step(1/60)}const hs=RACE.cars.filter(c=>c.human),out=[];
 for(let k=0;k<240;k++){const c1=hs[0],c2=hs[1];const f=[Math.sin(c1.yaw),Math.cos(c1.yaw)];c2.x=c1.x-f[0]*9;c2.z=c1.z-f[1]*9;c2.y=c1.y;c2.yaw=c1.yaw;c2.vx=f[0]*38;c2.vz=f[1]*38;c1.vx=f[0]*38;c1.vz=f[1]*38;step(1/60);if(k%30==29)out.push([+(k/60).toFixed(1),+(hs[1].draft||0).toFixed(2)])}
 return out})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a)],'dl')
