import sys
from shot import run,W
tr=sys.argv[1]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',2500),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return PT8.animalsReady})()"%tr),('wait',9000),
('js',"(()=>{const A=PT8.animals();return A?JSON.stringify(A.list.map(a=>a.name+':'+a.st)):'none'})()"),
('js',"""(()=>{const A=PT8.animals();if(!A)return 'none';const a=A.list[0],c=RACE.cars[0],T=RACE.T;RACE.state='race';let bi=0,bd=1e9;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-a.x,T.z[i]-a.z);if(d<bd){bd=d;bi=i}}
const dx=T.x[bi]-a.x,dz=T.z[bi]-a.z,l=Math.hypot(dx,dz);c.x=a.x+dx/l*26;c.z=a.z+dz/l*26;c.y=a.g.position.y+2;c.yaw=Math.atan2(a.x-c.x,a.z-c.z);c.vx=c.vy=c.vz=0;c.sp=0;c.idx=bi;c.unw=bi;return bd.toFixed(0)})()"""),('wait',3000),('shot','a'),('wait',2000),('shot','b'),
('js',"(()=>{const A=PT8.animals();return JSON.stringify(A.list.slice(0,6).map(a=>a.name+':'+a.st+':'+a.cur))})()")]
run(W+'/Poly-Tourismo.html',st,'an'+tr)
