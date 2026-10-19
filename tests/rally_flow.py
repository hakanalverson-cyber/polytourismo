from shot import run,W
steps=[('wait',800)]
steps+=[('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=2;PT8.ui.renderSetup();return document.getElementById('suTitle').textContent})()"""),('wait',600),('shot','setup')]
steps+=[('js',"""(()=>{document.getElementById('suGo').click();return 1})()"""),('wait',500),('shot','brief1')]
steps+=[('js',"""(()=>{document.getElementById('rlGo').click();return RACE.cfg.rally+':'+RACE.cars.length+':'+RACE.T.d.name})()"""),('wait',500),
 ('js',"""(()=>{const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};for(let i=0;i<60*400;i++){step(1/60);if(RACE.state==='done'||document.getElementById('rlNext'))break}return RACE.state+':'+(c.finT||0)})()"""),('wait',800),('shot','interim')]
steps+=[('js',"""(()=>{document.getElementById('rlNext').click();return 1})()"""),('wait',400),('shot','brief2')]
steps+=[('js',"""(()=>{document.getElementById('rlGo').click();const c=RACE.cars[0];c.forceAI=1;c.ai={skill:.9,lat:0,name:'T'};for(let i=0;i<60*400;i++){step(1/60);if(document.getElementById('rlAgain'))break}return RACE.state+':'+(c.finT||0)})()"""),('wait',800),('shot','final')]
run(W+'/Poly-Tourismo.html',steps,'rf')
