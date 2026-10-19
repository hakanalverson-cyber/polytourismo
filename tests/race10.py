from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.launch({mode:'mp',track:0,laps:2,humans:[{id:'merc',alt:0},{id:'c26',alt:1}],ai:[{id:'c31',alt:0,skill:.7},{id:'c84',alt:1,skill:.7},{id:'zen',alt:0,skill:.7}]});for(let i=0;i<500;i++)step(1/60);return 1})()"),('wait',1500),('shot','r1')]
run(W+'/Poly-Tourismo.html',st,'rc10')
