from shot import run,W
st=[('wait',1000),('js',"(()=>{PT8.launch({mode:'mp',track:7,laps:2,humans:[{id:'merc',alt:0}],ai:[]});const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};return 1})()")]
for k,n in enumerate([22,16,14]):
    st+=[('js',"(()=>{for(let i=0;i<60*%d;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return RACE.cars[0].idx})()"%n),('wait',300),('shot','s%d'%k)]
run(W+'/Poly-Tourismo.html',st,'sea')
