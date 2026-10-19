from shot import run,W
st=[('wait',2500),('js',"(()=>{PT8.launch({mode:'ta',track:0,laps:2,humans:[{id:'c133',alt:0}],ai:[]});const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};for(let i=0;i<900;i++)step(1/60);c.st=0.8;for(let i=0;i<10;i++)step(1/60);return [c.sp,!!c.m.ptWheels,c.m.ptWheels&&c.m.ptWheels.map(w=>[w.angle.toFixed(2),w.radius.toFixed(2)]).join(';')]})()"),('wait',500),('shot','w1')]
run(W+'/Poly-Tourismo.html',st,'wh10')
