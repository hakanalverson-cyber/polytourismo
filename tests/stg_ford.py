from shot import run,W
def drive(tr,tag,ahead,k=0,extra=0):
    return ('js',"""(()=>{PT8.launch({mode:'mp',rally:true,track:%d,laps:2,humans:[{id:'merc',alt:0}],ai:[]});
 const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T,f=T.fords[%d],tgt=f.i-%d;
 for(let i=0;i<60*120;i++){step(1/60);if(RACE.state==='race'&&Math.abs(c.idx-tgt)<2&&c.sp>10)break}
 for(let i=0;i<%d;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return JSON.stringify({idx:c.idx,fi:f.i,sp:c.sp,y:c.y,yw:f.yw})})()"""%(tr,k,ahead,extra))
steps=[('wait',800)]
steps+=[drive(10,'a',40),('wait',300),('shot','m_before')]
steps+=[drive(10,'b',0,0,10),('wait',300),('shot','m_in')]
steps+=[drive(13,'a',16),('wait',300),('shot','a_before')]
steps+=[drive(13,'b',0),('wait',300),('shot','a_in')]
run(W+'/Poly-Tourismo.html',steps,'fd')
