import sys,json
from shot import run,W
tr=sys.argv[1]
st=[('wait',2500),('js',"(()=>{document.getElementById('play').click();return 1})()"),('wait',800),
('js',"(()=>{PT8.launch({mode:'ta',track:%s,laps:3,humans:[{id:'merc',alt:0,name:'T'}],ai:[],tod:'day',endur:false});return 1})()"%tr),('wait',6500),
('js',"""(()=>{const c=RACE.cars[0];RACE.state='race';c.forceAI=1;c.ai={skill:.9,lat:0,name:'T'};const Y=[],P=[],R=[],I=[];for(let i=0;i<2400;i++){step(1/60);Y.push(c.y);P.push(c.pitch);R.push(c.roll);I.push(c.idx)}
const hf=a=>{const o=[];for(let i=3;i<a.length-3;i++){const m=(a[i-3]+a[i-2]+a[i-1]+a[i+1]+a[i+2]+a[i+3])/6;o.push(Math.abs(a[i]-m))}return o};
const hy=hf(Y),hp=hf(P),hr=hf(R);const top=(h,n)=>h.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).slice(0,n).map(q=>q[0].toFixed(3)+'@'+I[q[1]+3]);
const mean=h=>(h.reduce((a,b)=>a+b,0)/h.length).toFixed(4);
return RACE.T.d.name+' y:mean '+mean(hy)+' top '+top(hy,4).join(',')+' | pitch:mean '+mean(hp)+' top '+top(hp,4).join(',')+' | roll:mean '+mean(hr)+' top '+top(hr,3).join(',')})()""")]
run(W+'/Poly-Tourismo.html',st,'jit')
