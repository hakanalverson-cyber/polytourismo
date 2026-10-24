from shot import run,W
def go(tr,tag,k=0):
    return [('js',"""(()=>{PT8.launch({mode:'ta',track:%d,laps:1,humans:[{id:'merc',alt:0}],ai:[]});scr='game';paused=false;RACE.state='race';for(let i=0;i<200;i++)step(1/60);document.querySelectorAll('.title,#title,.ttl,#ptTitle').forEach(e=>e.style.display='none');return RACE.T.N})()"""%tr),('wait',2500),('shot',tag)]
run(W+'/Poly-Tourismo.html',[('js',"(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return 1})()"),('wait',2000)]+go(15,'im')+go(14,'ra'),'im6')
