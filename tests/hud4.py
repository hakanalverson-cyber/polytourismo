from shot import run,W
a="""(()=>{PT8.launch({mode:'mp',track:0,laps:3,humans:[{id:'merc',alt:0},{id:'ferr',alt:0}],ai:[]});
 for(let i=0;i<60*6;i++){step(1/60);hudUpdate()}
 const hs=RACE.cars.filter(c=>c.human);
 for(let k=0;k<300;k++){const c1=hs[0],c2=hs[1];c1.in&&0;
  const f=[Math.sin(c1.yaw),Math.cos(c1.yaw)];c2.x=c1.x-f[0]*9;c2.z=c1.z-f[1]*9;c2.y=c1.y;c2.yaw=c1.yaw;c2.vx=f[0]*38;c2.vz=f[1]*38;c1.vx=f[0]*38;c1.vz=f[1]*38;c1.yaw=c1.yaw;
  step(1/60);hudUpdate()}
 const d=hs[1].dfx;return {state:RACE.state,sp:hs[1].sp,draft:hs[1].draft,rings:d&&d.rings.filter(r=>r.m.visible).length,lines:d&&d.lines.filter(r=>r.m.visible).length}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a),('shot','d')],'hud4')
