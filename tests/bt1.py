import sys
from shot import run,W
tr=sys.argv[1]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1500),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:3,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',9000),
('js',"""(()=>{const b=PT8.barnInfo(),c=RACE.cars[0],T=RACE.T;RACE.state='race';let bi=0,bd=1e9;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-b.x,T.z[i]-b.z);if(d<bd){bd=d;bi=i}}
const dx=b.x-T.x[bi],dz=b.z-T.z[bi],l=Math.hypot(dx,dz);c.x=T.x[bi]+dx/l*(T.hw[bi]+.5);c.z=T.z[bi]+dz/l*(T.hw[bi]+.5);c.y=T.y[bi]+2;c.yaw=Math.atan2(dx,dz);c.vx=c.vy=c.vz=0;c.sp=0;c.idx=bi;c.unw=bi;return JSON.stringify([bd,PT8.animalsReady,(PT8.animals()||{list:[]}).list.length])})()"""),('wait',3000),('shot','a')]
run(W+'/Poly-Tourismo.html',st,'bt'+tr)
