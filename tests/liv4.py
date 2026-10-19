from shot import run,W
# race with livery on player + AI
js="""(()=>{const sv=PT8.SV();PT8.livSet('merc',0,{p:1,a:'#d7263d',b:'#f1f3f5',c:'#111316',f:0,w:1,n:7,s:3});
PT8.launch({mode:'race',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:7,classes:['D','C','B'],skill:.8})});return 1})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',js),('wait',5500),('shot','r1'),('wait',4000),('shot','r2')],'liv4')
