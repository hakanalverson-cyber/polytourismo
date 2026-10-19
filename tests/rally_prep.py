from shot import run,W
steps=[('wait',800)]
steps+=[('js',"""(()=>{PT8.ui.openCards();document.querySelector('[data-m=rally]').click();PT8.ui.ST.players=1;PT8.ui.renderSetup();return document.querySelectorAll('#trkList .trk').length+':'+document.getElementById('suTitle').textContent})()"""),('wait',6000),('shot','rp_setup')]
steps+=[('js',"""(()=>{document.getElementById('suGo').click();return 1})()"""),('wait',3500),('shot','rp_prep1'),('wait',7000),('shot','rp_prep2'),
 ('js',"""(()=>{const x=RACE.t;for(let i=0;i<60;i++)step(1/60);return 'prep:'+RACE.prep+' t:'+RACE.t+' x0:'+x})()"""),
 ('js',"""(()=>{document.getElementById('rlPlay').click();return RACE.prep+':'+RACE.state})()"""),('wait',6000),
 ('js',"""(()=>{for(let i=0;i<60*8;i++)step(1/60);return RACE.state+':'+RACE.t})()"""),('shot','rp_go'),
 ('js',"""(()=>{const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};let n=0;for(let i=0;i<60*900;i++){step(1/60);n++;if(document.getElementById('rlAgain'))break}return RACE.state+':'+n+':splits '+JSON.stringify((RACE.splits||[]).map(x=>+x.toFixed(1)))+' rec '+(RACE.rec||[]).length+' P'+(RACE.cars[0].idx)})()"""),('wait',1500),('shot','rp_final'),
 ('js',"""(()=>{document.getElementById('rlRep1').click();return !!RACE.replay})()"""),('wait',1500),
 ('js',"""(()=>{for(let i=0;i<120;i++)step(1/60);return RACE.replay.t.toFixed(1)})()"""),('wait',600),('shot','rp_rep0'),
 ('js',"""(()=>{document.getElementById('rrCamB').click();RACE.replay.t+=40;return 1})()"""),('wait',3000),('shot','rp_rep1'),
 ('js',"""(()=>{document.getElementById('rrCamB').click();RACE.replay.t+=40;return 1})()"""),('wait',3000),('shot','rp_rep2'),
 ('js',"""(()=>{document.getElementById('rrExit').click();return !!document.getElementById('rlAgain')})()""")]
run(W+'/Poly-Tourismo.html',steps,'rp')
