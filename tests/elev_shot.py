from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=12;PT8.ui.renderSetup();return 1})()"""),('wait',6000),('shot','el_setup'),
('js',"""(()=>{document.getElementById('suGo').click();return 1})()"""),('wait',9000),('shot','el_prep'),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>2200)break}return 1})()"""),('wait',1500),('shot','el_live')]
run(W+'/Poly-Tourismo.html',steps,'el')
