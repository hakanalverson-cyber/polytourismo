from shot import run,W
js="""(()=>{PT8.livSet('merc',0,{p:9,a:'#111316',b:'#ff7a1a',c:'#ffb400',f:3,w:3,n:11,s:5});
const t0=performance.now();PT8.launch({mode:'race',track:0,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:11,classes:['D','C','B','A'],skill:.8})});
const dt=performance.now()-t0;return JSON.stringify({launchMs:Math.round(dt),saved:/"liv"/.test(localStorage.getItem(Object.keys(localStorage).find(k=>/pt|poly/i.test(k))||'')||''),keys:Object.keys(localStorage)})})()"""
steps=[('wait',1500),('js',js),('wait',6500),('shot','race'),
('js',"(()=>{PT8.ui.openShow&&0;return RACE.cars.filter(c=>c.liv).length+'/'+RACE.cars.length})()")]
run(W+'/Poly-Tourismo.html',steps,'liv7')
