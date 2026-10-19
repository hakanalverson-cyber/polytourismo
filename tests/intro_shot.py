from shot import run,W
steps=[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();return 1})()"""),('wait',700),('shot','in1'),('wait',9000),('shot','in2'),
('js',"""(()=>{document.getElementById('suGo').click();return 1})()"""),('wait',14000),
('js',"""(()=>{document.getElementById('rlPlay').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};const T=RACE.T;for(let i=0;i<60*400;i++){step(1/60);if(c.unw*T.sp>900)break}c.forceAI=0;c.dmg=.55;RACE.pen=5;return 1})()"""),('wait',1500),('shot','in3')]
run(W+'/Poly-Tourismo.html',steps,'in')
