from shot import run,W
import sys
trs=[int(a) for a in sys.argv[1:]] or list(range(10))
steps=[('wait',1000)]
for tr in trs:
    steps+=[('js',"""(()=>{PT8.launch({mode:'ta',track:%d,laps:3,humans:[{id:'merc',alt:0}],ai:[]});
 const c=RACE.cars[0];for(let i=0;i<60*3;i++)step(1/60);
 /* chase a spot with the most props near the road: park the camera-car at the prop-densest sample */
 const L=RACE.scene.userData.props||[],T=RACE.T;let best=0,bs=-1;for(let i=0;i<T.N;i+=6){let s=0;for(const p of L){if(Math.hypot(p.x-T.x[i],p.z-T.z[i])<45)s++}if(s>bs){bs=s;best=i}}
 c.idx=best;c.x=T.x[best];c.z=T.z[best];c.y=T.y[best]+.5;c.yaw=T.psi[best];c.vx=c.vz=0;for(let i=0;i<4;i++){step(1/60)}
 for(let i=0;i<3;i++)hudUpdate();return [best,bs]})()"""%tr),('wait',700),('shot','p%d'%tr)]
run(W+'/Poly-Tourismo.html',steps,'ps')
