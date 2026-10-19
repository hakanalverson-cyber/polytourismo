from shot import run,W
run(W+'/Poly-Tourismo.html',[('wait',800),('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.track=12;PT8.ui.renderSetup();document.getElementById('suGo').click();for(let i=0;i<120;i++)step(1/60);return RACE.T.d.name+':'+RACE.state})()"""),('shot','ash')],'as')
