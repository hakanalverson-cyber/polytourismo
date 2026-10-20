import sys
from shot import run,W
tr=sys.argv[1]
js="""(()=>{const T=RACE.T;let n=0,t=performance.now();for(let i=0;i<2000;i++)T.terr(T.x[(i*7)%T.N]+30,T.z[(i*7)%T.N]+30);const a=(performance.now()-t)/2000;
t=performance.now();for(let i=0;i<2000;i++)T.surf(T.x[(i*7)%T.N]+30,T.z[(i*7)%T.N]+30,T.y[(i*7)%T.N]+1);const b=(performance.now()-t)/2000;
t=performance.now();for(let i=0;i<2000;i++)T.surf(T.x[(i*7)%T.N],T.z[(i*7)%T.N],T.y[(i*7)%T.N]+1);const c=(performance.now()-t)/2000;
return JSON.stringify({terr_us:+(a*1000).toFixed(1),surf_off_us:+(b*1000).toFixed(1),surf_on_us:+(c*1000).toFixed(1),cpts:T.cpts.length,N:T.N})})()"""
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',1000),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:2,humans:[{id:'merc',alt:0,name:'T'}],ai:[{id:'c29'},{id:'c44'},{id:'c66'}],tod:'day',endur:false});return 1})()"%tr),('wait',9000),('js',js)]
run(W+'/Poly-Tourismo.html',st,'pf')
