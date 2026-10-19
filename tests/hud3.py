from shot import run,W
a="""(()=>{PT8.launch({mode:'elim',track:0,laps:99,humans:[{id:'merc',alt:0,name:'HAKAN'},{id:'ferr',alt:0}],ai:PT8.makeAI({n:3,classes:['S'],skill:.9,rally:false}),interval:20,endur:false});
 for(let i=0;i<240;i++){step(1/60);hudUpdate()}
 const hs=RACE.cars.filter(c=>c.human);return {scr,ids:hs.map(c=>[c.rect&&c.rect.map(x=>+x.toFixed(2)),!!document.getElementById('h'+RACE.cars.indexOf(c)),(document.getElementById('h'+RACE.cars.indexOf(c))||{dataset:{}}).dataset.b]),n:document.querySelectorAll('.h8list').length}})()"""
run(W+'/Poly-Tourismo.html',[('wait',1500),('js',a),('wait',600),('shot','h3')],'hud3')
