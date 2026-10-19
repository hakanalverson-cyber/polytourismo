from shot import run,W
import sys
pairs=[(1,'arch'),(1,'truckO'),(4,'cabinW'),(4,'logs'),(9,'snowman'),(6,'sheepA'),(7,'sail'),(7,'lighthouse'),(8,'cont2_0'),(8,'crane'),(3,'busstop'),(0,'truckY'),(5,'pump'),(2,'chalet'),(7,'tentR'),(4,'bale')]
dist={'arch':30,'lighthouse':40,'crane':40,'turbine':50,'sail':22,'cabinW':20,'chalet':20,'truckO':16,'truckY':16}
steps=[('wait',1000)]
for tr,n in pairs:
    steps+=[('js',"""(()=>{PT8.launch({mode:'ta',track:%d,laps:3,humans:[{id:'merc',alt:0}],ai:[]});
 const c=RACE.cars[0],L=(RACE.scene.userData.props||[]).filter(p=>p.n==='%s');if(!L.length)return 'none';const p=L[0],T=RACE.T,d=%d;
 const L2=PT8.PROPLIB['%s'];let fx=0,fz=1;/* view from front +z of prop (instance yaw unknown) -> use the road side */
 let bi=0,bd=1e9;for(let i=0;i<T.N;i++){const q=Math.hypot(T.x[i]-p.x,T.z[i]-p.z);if(q<bd){bd=q;bi=i}}
 let dx=T.x[bi]-p.x,dz=T.z[bi]-p.z,l=Math.hypot(dx,dz);dx/=l;dz/=l;if(l<d)l=d;
 for(let i=0;i<120;i++){c.x=p.x+dx*d;c.z=p.z+dz*d;c.y=T.terr(c.x,c.z)+.5;c.yaw=Math.atan2(-dx,-dz);c.vx=c.vz=0;c.vy=0;step(1/60)}for(let i=0;i<3;i++)hudUpdate();return [p.n,p.x|0,p.z|0]})()"""%(tr,n,dist.get(n,12),n)),('wait',600),('shot','c_%s'%n)]
run(W+'/Poly-Tourismo.html',steps,'pc')
