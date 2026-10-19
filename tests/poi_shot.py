from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=13;PT8.ui.renderSetup();return 1})()"""),('wait',20000),('shot','po_setup'),
('js',"""(()=>{document.getElementById('suGo').click();return 1})()"""),('wait',9000),('shot','po_prep'),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T,cp=PT8.cpsOf(T)[0]*T.sp;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>cp+15)break}return 1})()"""),('wait',1200),('shot','po_cp')]
run(W+'/Poly-Tourismo.html',steps,'po')
