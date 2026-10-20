from shot import run,W
js="""(()=>{PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return RACE.T.d.name})()"""
js2="""(async()=>{const b=PT8.barnInfo(),T=RACE.T,c=RACE.cars[0];RACE.state='race';
let bi=0,bd=1e9;for(let i=0;i<T.N;i++){const d=Math.hypot(T.x[i]-b.door.x,T.z[i]-b.door.z);if(d<bd){bd=d;bi=i}}
const dx=b.door.x-T.x[bi],dz=b.door.z-T.z[bi],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
c.x=T.x[bi]+ux*(T.hw[bi]+1);c.z=T.z[bi]+uz*(T.hw[bi]+1);c.y=T.y[bi]+1;c.idx=bi;c.unw=bi;c.safeIdx=bi;c.safeUnw=bi;c.yaw=Math.atan2(ux,uz);down.add('KeyW');
let warned='',resp=0,minD=1e9,t=0,maxFar=0;const x0=c.x,z0=c.z;
for(let i=0;i<60*40;i++){const tx=b.door.x-c.x,tz=b.door.z-c.z;const want=Math.atan2(tx,tz);let da=want-c.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));down.delete('KeyA');down.delete('KeyD');if(da>.05)down.add('KeyA');else if(da<-.05)down.add('KeyD');
 step(1/60);if(c.warn)warned=c.warn;maxFar=Math.max(maxFar,c.farT||0);minD=Math.min(minD,Math.hypot(c.x-b.door.x,c.z-b.door.z));if(document.getElementById('barnPrompt')&&document.getElementById('barnPrompt').style.opacity==='1'&&!t)t=i/60}
down.clear();return JSON.stringify({warned,minD:Math.round(minD),promptAt:t,maxFar:+maxFar.toFixed(1),dist0:Math.round(L),lap:c.lap,state:RACE.state})})()"""
run(W+'/Poly-Tourismo.html',[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1200),('js',js),('wait',4000),('js',js2)],'barn3')
