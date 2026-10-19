from shot import run,W
def cfg(n,names):
    hs=",".join("{id:'merc',alt:0,name:'%s'}"%names[i] for i in range(n))
    return "(()=>{PT8.launch({mode:'mp',track:0,laps:2,humans:[%s],ai:[]});for(let i=0;i<400;i++)step(1/60);const c=RACE.cars.filter(c=>c.human);c.forEach((x,i)=>{x.ptName='%s'});return [RACE.cars.filter(c=>c.human).map(c=>c.grp.length).join()]})()"%(hs,'LONGNAME12CH')
st=[('wait',1200),('js',cfg(2,['AA','BB'])),('wait',1500),('shot','p2'),('js',"(()=>{PT8.cleanupRace();return 1})()"),('js',cfg(4,['A','B','C','D'])),('wait',1500),('shot','p4')]
run(W+'/Poly-Tourismo.html',st,'sp')
