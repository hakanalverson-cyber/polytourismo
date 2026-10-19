from shot import run,W
def at(tr,frac,tag,extra=0):
    return [('js',"""(()=>{PT8.launch({mode:'mp',rally:true,track:%d,laps:2,humans:[{id:'merc',alt:0}],ai:[]});
 const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T,tgt=Math.floor(T.N*%f);
 for(let i=0;i<60*200;i++){step(1/60);if(RACE.state==='race'&&Math.abs(c.idx-tgt)<2&&c.sp>8)break}
 for(let i=0;i<%d;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return c.idx+'/'+T.N})()"""%(tr,frac,extra)),('wait',300),('shot',tag)]
steps=[('wait',800)]
import sys
for tr,fr,tag in [(11,.07,'a'),(11,.12,'b'),(13,.25,'c')]:
    steps+=at(tr,fr,tag)
run(W+'/Poly-Tourismo.html',steps,'pos')
