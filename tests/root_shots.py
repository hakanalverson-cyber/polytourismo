from shot import run,W
steps=[('wait',800)]
for tr in (12,13):
    steps+=[('js',f"""(()=>{{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track={tr};PT8.ui.renderSetup();document.getElementById('suGo').click();return 1}})()"""),('wait',9000),
     ('js',"""(()=>{RACE.shot0=1;RACE.prepT=0.5;return 1})()"""),('wait',1500),('shot',f'rt{tr}_start'),
     ('js',"""(()=>{RACE.shot0=2;RACE.prepT=5.9;return 1})()"""),('wait',1500),('shot',f'rt{tr}_start2'),
     ('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T,cp=PT8.cpsOf(T)[1]*T.sp;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>cp-22)break}return Math.round(c.unw*T.sp)+'/'+cp})()"""),('wait',1500),('shot',f'rt{tr}_cp'),
     ('js',"""(()=>{const c=RACE.cars[0],T=RACE.T,q=T.pinch[1],tg=(q.i-Math.round(40/T.sp)+T.N)%T.N*T.sp;for(let i=0;i<60*400;i++){step(1/60);if((c.unw%T.N)*T.sp>tg&&c.unw*T.sp>tg)break}return Math.round(c.unw*T.sp)+'/'+tg})()"""),('wait',1200),('shot',f'rt{tr}_pinch'),
     ('js',"""(()=>{PT8.cleanupRace();show('menu');return 1})()""")]
run(W+'/Poly-Tourismo.html',steps,'rt')
