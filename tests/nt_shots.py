from shot import run,W
def go(tr,n):
    return ('js',"""(()=>{PT8.launch({mode:'mp',track:%d,laps:3,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:2,classes:['B','A'],skill:.9,rally:%s})});
 for(let i=0;i<60*14;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return RACE.cars[0].idx})()"""%(tr,'true' if tr==9 else 'false'))
steps=[('wait',1000)]
for tr in [7,8,9]:
    steps+=[go(tr,0),('wait',500),('shot','t%d'%tr)]
steps+=[('js',"(()=>{PT8.cleanupRace();PT8.ui.openCards&&PT8.ui.openCards();document.querySelector('[data-m=mp]')&&document.querySelector('[data-m=mp]').click();PT8.ui.ST.track=7;PT8.ui.renderSetup();return 1})()"),('wait',700),('shot','setup')]
run(W+'/Poly-Tourismo.html',steps,'nts')
