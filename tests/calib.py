import sys,json
from shot import run
html=sys.argv[1];pre=sys.argv[2];ids=sys.argv[3] if len(sys.argv)>3 else 'merc'
steps=[('wait',800)]
for t in list(range(0,14)):
    steps.append(('js',"""(()=>{PT8.launch({mode:'ta',track:%d,laps:2,humans:[{id:'%s',alt:0}],ai:[],tod:'day',weather:'clear'});
const c=RACE.cars[0];c.forceAI=true;c.ai={skill:.9,lat:0,name:'b'};for(let i=0;i<60*420&&c.lapT.length<2;i++)step(1/60);return 'T%d '+JSON.stringify(c.lapT.map(x=>+x.toFixed(2)))})()"""%(t,ids,t)))
run(html,steps,pre)
