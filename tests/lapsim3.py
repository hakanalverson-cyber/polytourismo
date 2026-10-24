import sys
from shot import run,W
trs=sys.argv[1]
js="""(()=>{const out={};for(const tr of [%s]){for(const id of ['merc']){PT8.launch({mode:'mp',rally:true,circuit:true,track:tr,laps:2,humans:[{id:id,alt:0}],ai:[]});
 const c=RACE.cars[0];c.forceAI=1;c.ai={skill:1,lat:0,name:'T'};let ex=0,rs=0,pe=false,pr=false,mx=0,t=0;
 for(let i=0;i<60*600;i++){step(1/60);if(RACE.state==='count'&&i>60*20)RACE.state='race';if(RACE.state==='done'||(c.lapT||[]).length>=2)break;const e=c.exp>0;if(e&&!pe)ex++;pe=e;const r=c.respT>.5;if(r&&!pr)rs++;pr=r;mx=Math.max(mx,c.sp);t=i/60}
 out[tr+id]={lap:(c.lapT||[]).map(x=>+x.toFixed(1)),ex,rs,kmh:Math.round(mx*3.6),L:Math.round(RACE.T.L),N:RACE.T.N,t:+t.toFixed(0),st:RACE.state};PT8.cleanupRace&&PT8.cleanupRace()}}
 return JSON.stringify(out)})()"""%trs
run(W+'/Poly-Tourismo.html',[('js',js)],'ls3')
