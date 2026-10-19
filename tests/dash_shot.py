from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.ST.track=11;PT8.ui.renderSetup();return 1})()"""),('wait',5000),('shot','ds_setup'),
('js',"""(()=>{document.querySelector('#suDrv button').click();return 1})()"""),('wait',2500),('shot','ds_garage'),
('js',"""(()=>{document.getElementById('shAct').click();document.getElementById('suGo').click();return 1})()"""),('wait',9000),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>1700)break}down.add('Space');return RACE.cars[0].cs.id})()"""),('wait',2500),('shot','ds_dash')]
run(W+'/Poly-Tourismo.html',steps,'ds')
