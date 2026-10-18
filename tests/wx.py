from shot import run,W
def go(wx,tr,tod,n):
    return ('js',"""(()=>{PT8.launch({mode:'mp',track:%d,laps:3,humans:[{id:'merc',alt:0}],ai:PT8.makeAI({n:3,classes:['B','A'],skill:.9,rally:false}),tod:'%s',weather:'%s'});
 for(let i=0;i<60*9;i++)step(1/60);for(let i=0;i<3;i++)hudUpdate();return [RACE.wxGrip,RACE.cars[0].cs.grip]})()"""%(tr,tod,wx))
steps=[('wait',1000)]
for wx,tr,tod in [('rain',0,'day'),('storm',4,'sunset'),('fog',2,'day'),('rain',3,'night')]:
    steps+= [go(wx,tr,tod,0),('wait',400),('shot',wx+str(tr))]
run(W+'/Poly-Tourismo.html',steps,'wx')
