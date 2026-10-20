from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:14,laps:1,humans:[{id:'c24',alt:0}],ai:[],tod:'day',circuit:1});const c=RACE.cars[0];const T=RACE.T;
// park at a corner with kerbs
const cs=PT8.RA&&PT8.RA.corners;let i=0;let best=0,bi=300;for(let k=0;k<T.N;k++){const a=Math.abs(T.psi[(k+8)%T.N]-T.psi[k]);if(a>best&&a<1){best=a;bi=k}}
c.idx=bi;c.x=T.x[bi];c.z=T.z[bi];c.y=T.y[bi]+1;c.yaw=T.psi[bi];c.unw=bi;for(let n=0;n<30;n++)step(1/60);return bi})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js),('wait',300),('shot','kerb')],'ra8')
