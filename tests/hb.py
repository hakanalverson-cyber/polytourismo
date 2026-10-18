from shot import run,W
st=[('wait',1000),('js',"(()=>{PT8.launch({mode:'mp',track:8,laps:2,humans:[{id:'merc',alt:0}],ai:[]});const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};return 1})()")]
prev=0
for k,t in enumerate([10,34,44,50,56,62,67]):
    st+=[('js',"(()=>{for(let i=0;i<60*%d;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();const c=RACE.cars[0];return [c.idx,RACE.state,c.x|0,c.z|0]})()"%(t-prev)),('wait',300),('shot','h%d'%k)]
    prev=t
run(W+'/Poly-Tourismo.html',st,'hb')
