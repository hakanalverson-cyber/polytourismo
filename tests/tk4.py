from shot import run,W
js="""(()=>{PT8.launch({mode:'mp',track:14,laps:1,humans:[{id:'c107',alt:0}],ai:[{id:'p1',alt:0,skill:.95,name:'x',lat:0}],tod:'day',weather:'clear',circuit:1});
let out=[];for(let i=0;i<60*60;i++){step(1/60);if(i%300==299){const c=RACE.cars[1];out.push(Math.round(c.sp*2.237)+'mph g'+c.gear+' idx'+c.idx+' top'+c.cs.top+' acc'+c.cs.acc+' gt'+JSON.stringify(PT8.GT(c.cs).map(g=>[+g.top.toFixed(2),+g.acc.toFixed(2)]))+' ts'+PT8.topSpeed(c.cs,PT8.GT(c.cs).length-1).toFixed(1))}}return out.join('\\n')})()"""
run(W+'/Poly-Tourismo.html',[('wait',800),('js',js)],'tk4')
