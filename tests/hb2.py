from shot import run,W
def go(tod,wx):
    return ('js',"""(()=>{PT8.launch({mode:'mp',track:8,laps:2,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:2,classes:['B','A'],skill:.9}),tod:'%s',weather:'%s'});const h=RACE.cars[0];h.forceAI=1;h.ai={skill:1,lat:0,name:'T'};for(let i=0;i<60*34;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return RACE.cars[0].idx})()"""%(tod,wx))
run(W+'/Poly-Tourismo.html',[('wait',1000),go('day','clear'),('wait',300),('shot','day'),go('sunset','rain'),('wait',300),('shot','sunsetrain'),go('night','clear'),('wait',300),('shot','night')],'hb2')
